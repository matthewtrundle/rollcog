/**
 * @fileoverview Contact form API route
 * @module app/api/contact/route
 */

import { NextResponse } from "next/server";
import { contactFormSchema } from "@/features/contact";
import {
  generateLeadEmail,
  generateLeadEmailText,
  generateCustomerConfirmationEmail,
  generateCustomerConfirmationEmailText,
} from "@/features/contact/email-template";
import { createLead } from "@/lib/db";

/**
 * Handles POST requests for contact form submissions.
 *
 * Validates the form data and sends a professional email via Resend.
 * Returns success/error response.
 */
// Minimum time (in ms) a human would take to fill out the form
const MIN_FORM_TIME_MS = 3000; // 3 seconds

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

    // Save lead to database (non-blocking - don't fail if DB is unavailable)
    try {
      await createLead({
        name,
        email,
        phone: phone || null,
        company: company || null,
        service: service || null,
        message,
        source: source || null,
      });
      console.log("Lead saved to database:", email);
    } catch (dbError) {
      // Log but don't fail - email notifications are the primary function
      console.error("Failed to save lead to database:", dbError);
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
      console.log("-".repeat(60));
      console.log("Message:", message);
      console.log("=".repeat(60));

      return NextResponse.json({
        success: true,
        message: "Form submission received (dev mode)",
      });
    }

    // Generate the professional email
    const emailHtml = generateLeadEmail({
      name,
      email,
      phone: phone || undefined,
      company: company || undefined,
      service,
      message,
      source,
    });

    const emailText = generateLeadEmailText({
      name,
      email,
      phone: phone || undefined,
      company: company || undefined,
      service,
      message,
      source,
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
        to: ["office@rollcog.com", "kim@atjcorp.net"],
        subject: `[NEW LEAD] ${name} - ${serviceName}${source ? ` (${source})` : ""}`,
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
    const confirmationHtml = generateCustomerConfirmationEmail({
      name,
      service,
    });

    const confirmationText = generateCustomerConfirmationEmailText({
      name,
      service,
    });

    const confirmationResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Rollcog Roofs <hello@rollcogroofing.com>",
        to: [email],
        subject: `Thank you for contacting Rollcog Roofs!`,
        html: confirmationHtml,
        text: confirmationText,
        reply_to: "office@rollcog.com",
      }),
    });

    if (!confirmationResponse.ok) {
      // Log but don't fail - the lead notification was already sent
      const errorData = await confirmationResponse.json().catch(() => ({}));
      console.error("Customer confirmation email error:", errorData);
    }

    return NextResponse.json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
