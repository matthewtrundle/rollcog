/**
 * @fileoverview API route for booking an appointment
 * @module app/api/scheduling/book
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { createAppointment, getAvailableSlots } from "@/lib/db/scheduling";
import { getLeadById } from "@/lib/db";
import { generateBookingConfirmationEmail, generateBookingConfirmationEmailText } from "@/features/scheduling/email-templates";
import type { BookingResponse } from "@/features/scheduling/types/scheduling.types";

const bookingSchema = z.object({
  leadId: z.number().positive(),
  appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  appointmentTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
  propertyAddress: z.string().optional(),
  notes: z.string().optional(),
});

/**
 * POST /api/scheduling/book
 * Books an appointment for a lead
 */
export async function POST(request: Request): Promise<NextResponse<BookingResponse>> {
  try {
    const body: unknown = await request.json();

    // Validate request body
    const result = bookingSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Invalid booking data" },
        { status: 400 }
      );
    }

    const { leadId, appointmentDate, appointmentTime, propertyAddress, notes } = result.data;

    // Verify the lead exists
    const lead = await getLeadById(leadId);
    if (!lead) {
      return NextResponse.json(
        { success: false, error: "Lead not found" },
        { status: 404 }
      );
    }

    // Verify the slot is still available
    const slots = await getAvailableSlots(appointmentDate);
    const requestedSlot = slots.find((s) => s.time === appointmentTime);

    if (!requestedSlot || !requestedSlot.available) {
      return NextResponse.json(
        { success: false, error: "This time slot is no longer available" },
        { status: 409 }
      );
    }

    // Create the appointment
    const appointment = await createAppointment({
      leadId,
      appointmentDate,
      appointmentTime,
      propertyAddress,
      notes,
    });

    // Send confirmation email to the lead
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        const emailHtml = generateBookingConfirmationEmail({
          name: lead.name,
          appointmentDate,
          appointmentTime,
          propertyAddress: propertyAddress || undefined,
        });

        const emailText = generateBookingConfirmationEmailText({
          name: lead.name,
          appointmentDate,
          appointmentTime,
          propertyAddress: propertyAddress || undefined,
        });

        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Rollcog Roofs <hello@rollcogroofing.com>",
            to: [lead.email],
            subject: "Your Site Visit is Confirmed - Rollcog Roofs",
            html: emailHtml,
            text: emailText,
            reply_to: "office@rollcog.com",
          }),
        });

        // Also notify the team about the booking
        const teamNotification = `
          <h2>New Site Visit Booked!</h2>
          <p><strong>Lead:</strong> ${lead.name}</p>
          <p><strong>Email:</strong> ${lead.email}</p>
          <p><strong>Phone:</strong> ${lead.phone || "Not provided"}</p>
          <p><strong>Date:</strong> ${new Date(appointmentDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
          <p><strong>Time:</strong> ${formatDisplayTime(appointmentTime)}</p>
          ${propertyAddress ? `<p><strong>Property Address:</strong> ${propertyAddress}</p>` : ""}
        `;

        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Rollcog Leads <leads@rollcogroofing.com>",
            to: ["office@rollcog.com", "kim@atjcorp.net", "matthewtrundle@gmail.com", "martin.spokas@alogicapp.com"],
            subject: `[SITE VISIT BOOKED] ${lead.name} - ${formatDisplayDate(appointmentDate)} at ${formatDisplayTime(appointmentTime)}`,
            html: teamNotification,
          }),
        });
      } catch (emailError) {
        console.error("Failed to send booking confirmation email:", emailError);
        // Don't fail the booking if email fails
      }
    }

    return NextResponse.json({
      success: true,
      appointment,
    });
  } catch (error) {
    console.error("Error booking appointment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to book appointment" },
      { status: 500 }
    );
  }
}

function formatDisplayTime(time24: string): string {
  const [hours, minutes] = time24.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
}

function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
