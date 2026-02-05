/**
 * @fileoverview Cron job to send appointment reminder emails
 * @module app/api/cron/appointment-reminders
 *
 * Runs daily at 8 AM Central to send reminders for appointments happening tomorrow.
 * Configured in vercel.json for Vercel Cron Jobs.
 */

import { NextResponse } from "next/server";
import { getAppointmentsNeedingReminders, updateAppointment } from "@/lib/db/scheduling";
import { generateReminderEmail, generateReminderEmailText } from "@/features/scheduling";

/**
 * Verify cron request authenticity
 */
function verifyCronRequest(request: Request): boolean {
  // In development, allow all requests
  if (process.env.NODE_ENV === "development") {
    return true;
  }

  // Vercel cron jobs include this header
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    return true;
  }

  // Vercel also sets this header for cron jobs
  const vercelCronHeader = request.headers.get("x-vercel-cron");
  return vercelCronHeader === "true";
}

export async function GET(request: Request): Promise<NextResponse> {
  // Verify this is a legitimate cron request
  if (!verifyCronRequest(request)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.log("RESEND_API_KEY not configured, skipping reminder emails");
      return NextResponse.json({
        success: true,
        message: "Email service not configured",
        reminders: 0,
      });
    }

    // Get appointments needing reminders (20-28 hours from now)
    const appointmentsWithLeads = await getAppointmentsNeedingReminders();

    if (appointmentsWithLeads.length === 0) {
      console.log("No appointments need reminders");
      return NextResponse.json({
        success: true,
        message: "No reminders needed",
        reminders: 0,
      });
    }

    console.log(`Sending reminders for ${appointmentsWithLeads.length} appointments`);

    let sentCount = 0;
    const errors: string[] = [];

    for (const { appointment, lead } of appointmentsWithLeads) {
      try {
        const emailHtml = generateReminderEmail({
          name: lead.name,
          appointmentDate: appointment.appointment_date,
          appointmentTime: appointment.appointment_time,
          propertyAddress: appointment.property_address || undefined,
        });

        const emailText = generateReminderEmailText({
          name: lead.name,
          appointmentDate: appointment.appointment_date,
          appointmentTime: appointment.appointment_time,
          propertyAddress: appointment.property_address || undefined,
        });

        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Rollcog Roofs <hello@rollcogroofing.com>",
            to: [lead.email],
            subject: "Reminder: Your Site Visit Tomorrow - Rollcog Roofs",
            html: emailHtml,
            text: emailText,
            reply_to: "office@rollcog.com",
          }),
        });

        if (response.ok) {
          // Mark reminder as sent
          await updateAppointment(appointment.id, { reminder_sent: true });
          sentCount++;
          console.log(`Reminder sent for appointment ${appointment.id} to ${lead.email}`);
        } else {
          const errorData = await response.json().catch(() => ({}));
          errors.push(`Appointment ${appointment.id}: ${JSON.stringify(errorData)}`);
          console.error(`Failed to send reminder for appointment ${appointment.id}:`, errorData);
        }
      } catch (error) {
        errors.push(`Appointment ${appointment.id}: ${String(error)}`);
        console.error(`Error processing appointment ${appointment.id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sent ${sentCount} of ${appointmentsWithLeads.length} reminders`,
      reminders: sentCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Appointment reminders cron error:", error);
    return NextResponse.json(
      { error: "Failed to process reminders" },
      { status: 500 }
    );
  }
}
