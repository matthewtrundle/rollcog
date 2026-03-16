/**
 * @fileoverview Contact form API route
 * @module app/api/contact/route
 */

import { NextResponse } from "next/server";
import { track } from "@vercel/analytics/server";
import { contactFormSchema } from "@/features/contact";
import {
  generateLeadEmail,
  generateLeadEmailText,
  generateCustomerConfirmationEmail,
  generateCustomerConfirmationEmailText,
} from "@/features/contact/email-template";
import { createLead } from "@/lib/db";
import { createAppointment, getAvailableSlots } from "@/lib/db/scheduling";
import {
  generateBookingConfirmationEmail,
  generateBookingConfirmationEmailText,
} from "@/features/scheduling/email-templates";

/**
 * Handles POST requests for contact form submissions.
 *
 * Validates the form data and sends a professional email via Resend.
 * Returns success/error response.
 */
// Minimum time (in ms) a human would take to fill out the form
const MIN_FORM_TIME_MS = 3000; // 3 seconds

function formatDisplayTime(time24: string): string {
  const [hours, minutes] = time24.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
}

function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body: unknown = await request.json();

    // Validate request body
    const result = contactFormSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid form data", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, phone, company, service, message, source, website, formLoadedAt } = result.data;

    // Extract optional scheduling data (not part of contact schema validation)
    const bodyData = body as Record<string, unknown>;
    const schedulingData = bodyData.scheduling as {
      date?: string;
      time?: string;
      propertyAddress?: string;
    } | undefined;

    // Bot protection: Check honeypot field
    if (website && website.length > 0) {
      console.log("Bot detected: honeypot field filled");
      // Return success to not reveal detection (bots will think it worked)
      return NextResponse.json({
        success: true,
        message: "Message sent successfully",
      });
    }

    // Bot protection: Check if form was submitted too quickly
    if (formLoadedAt) {
      const timeToSubmit = Date.now() - formLoadedAt;
      if (timeToSubmit < MIN_FORM_TIME_MS) {
        console.log(`Bot detected: form submitted in ${timeToSubmit}ms (too fast)`);
        // Return success to not reveal detection
        return NextResponse.json({
          success: true,
          message: "Message sent successfully",
        });
      }
    }

    // Save lead to database
    let leadId: number | null = null;
    try {
      const lead = await createLead({
        name,
        email,
        phone: phone || null,
        company: company || null,
        service: service || null,
        message,
        source: source || null,
      });
      leadId = lead.id;
      console.log("Lead saved to database:", email, "ID:", leadId);
    } catch (dbError) {
      // Log but don't fail - email notifications are the primary function
      console.error("Failed to save lead to database:", dbError);
    }

    // Book appointment if scheduling data is provided
    let bookingInfo: { date: string; time: string; propertyAddress?: string } | undefined;
    if (leadId && schedulingData?.date && schedulingData?.time) {
      try {
        // Verify the slot is still available
        const slots = await getAvailableSlots(schedulingData.date);
        const requestedSlot = slots.find((s) => s.time === schedulingData.time);

        if (requestedSlot?.available) {
          await createAppointment({
            leadId,
            appointmentDate: schedulingData.date,
            appointmentTime: schedulingData.time,
            propertyAddress: schedulingData.propertyAddress,
          });

          bookingInfo = {
            date: formatDisplayDate(schedulingData.date),
            time: formatDisplayTime(schedulingData.time),
            propertyAddress: schedulingData.propertyAddress,
          };
          console.log("Appointment booked for lead:", leadId, schedulingData.date, schedulingData.time);
        } else {
          console.warn("Requested slot no longer available:", schedulingData.date, schedulingData.time);
        }
      } catch (bookingError) {
        // Don't fail the submission if booking fails
        console.error("Failed to book appointment:", bookingError);
      }
    }

    // Check for Resend API key
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      // In development without API key, log the submission
      console.log("=".repeat(60));
      console.log("NEW LEAD SUBMISSION (Development Mode)");
      console.log("=".repeat(60));
      console.log("Name:", name);
      console.log("Email:", email);
      console.log("Phone:", phone || "Not provided");
      console.log("Company:", company || "Not provided");
      console.log("Service:", service || "Not specified");
      console.log("Source:", source || "Direct");
      if (bookingInfo) {
        console.log("SITE VISIT:", bookingInfo.date, bookingInfo.time);
        console.log("Property:", bookingInfo.propertyAddress || "Not provided");
      }
      console.log("-".repeat(60));
      console.log("Message:", message);
      console.log("=".repeat(60));

      return NextResponse.json({
        success: true,
        message: "Form submission received (dev mode)",
        leadId,
        booked: !!bookingInfo,
      });
    }

    // Generate the professional email (now includes booking info if present)
    const emailHtml = generateLeadEmail({
      name,
      email,
      phone: phone || undefined,
      company: company || undefined,
      service,
      message,
      source,
      booking: bookingInfo,
    });

    const emailText = generateLeadEmailText({
      name,
      email,
      phone: phone || undefined,
      company: company || undefined,
      service,
      message,
      source,
      booking: bookingInfo,
    });

    // Determine service name for subject line
    const serviceNames: Record<string, string> = {
      "tpo-roofing": "TPO Roofing",
      "mod-bit": "Mod-Bit",
      "flat-roof-repair": "Flat Roof Repair",
      "commercial-industrial": "Commercial/Industrial",
      "other": "General Inquiry",
    };
    const serviceName = service ? serviceNames[service] || service : "General Inquiry";

    // Send email via Resend
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Rollcog Leads <leads@rollcogroofing.com>",
        // TODO: Change back to COMPANY.email for production
        to: ["office@rollcog.com", "kim@atjcorp.net", "matthewtrundle@gmail.com", "martin.spokas@alogicapp.com"],
        subject: bookingInfo
          ? `[VISIT BOOKED] ${name} - ${serviceName} - ${bookingInfo.date}`
          : `[NEW LEAD] ${name} - ${serviceName}${source ? ` (${source})` : ""}`,
        html: emailHtml,
        text: emailText,
        reply_to: email,
        tags: [
          { name: "category", value: "lead" },
          { name: "service", value: service || "general" },
          { name: "source", value: source || "direct" },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Resend API error:", errorData);
      throw new Error("Failed to send email");
    }

    // Send confirmation email to the customer
    // If they booked a visit, send booking confirmation; otherwise generic confirmation
    let customerEmailHtml: string;
    let customerEmailText: string;
    let customerSubject: string;

    if (bookingInfo && schedulingData?.date && schedulingData?.time) {
      customerEmailHtml = generateBookingConfirmationEmail({
        name,
        appointmentDate: schedulingData.date,
        appointmentTime: schedulingData.time,
        propertyAddress: schedulingData.propertyAddress,
      });
      customerEmailText = generateBookingConfirmationEmailText({
        name,
        appointmentDate: schedulingData.date,
        appointmentTime: schedulingData.time,
        propertyAddress: schedulingData.propertyAddress,
      });
      customerSubject = "Your Site Visit is Confirmed - Rollcog Roofs";
    } else {
      customerEmailHtml = generateCustomerConfirmationEmail({ name, service });
      customerEmailText = generateCustomerConfirmationEmailText({ name, service });
      customerSubject = "Thank you for contacting Rollcog Roofs!";
    }

    const confirmationResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Rollcog Roofs <hello@rollcogroofing.com>",
        to: [email],
        subject: customerSubject,
        html: customerEmailHtml,
        text: customerEmailText,
        reply_to: "office@rollcog.com",
      }),
    });

    if (!confirmationResponse.ok) {
      // Log but don't fail - the lead notification was already sent
      const errorData = await confirmationResponse.json().catch(() => ({}));
      console.error("Customer confirmation email error:", errorData);
    }

    // Server-side analytics tracking (more reliable than client-side)
    try {
      await track("lead_submitted", {
        service: service || "general",
        source: source || "direct",
      });
    } catch (analyticsError) {
      // Don't fail the request if analytics fails
      console.error("Analytics tracking error:", analyticsError);
    }

    return NextResponse.json({
      success: true,
      message: "Message sent successfully",
      leadId,
      booked: !!bookingInfo,
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
