/**
 * @fileoverview Email templates for the scheduling system
 * @module features/scheduling/email-templates
 */

import { COMPANY } from "@/lib/utils/constants";

interface BookingEmailData {
  name: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:MM
  propertyAddress?: string;
}

/**
 * Format date for display
 */
function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format time for display (12hr format)
 */
function formatDisplayTime(time24: string): string {
  const [hours, minutes] = time24.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
}

/**
 * Generate booking confirmation email HTML
 */
export function generateBookingConfirmationEmail(data: BookingEmailData): string {
  const { name, appointmentDate, appointmentTime, propertyAddress } = data;
  const firstName = name.split(" ")[0];
  const displayDate = formatDisplayDate(appointmentDate);
  const displayTime = formatDisplayTime(appointmentTime);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Site Visit Confirmed - Rollcog Roofs</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f172a;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 0;">

        <!-- Dark Header Section -->
        <table role="presentation" style="width: 100%; background-color: #0f172a;">
          <tr>
            <td style="padding: 48px 24px 40px 24px; text-align: center;">
              <!-- Logo -->
              <table role="presentation" style="margin: 0 auto;">
                <tr>
                  <td style="padding-bottom: 32px;">
                    <span style="color: #ea580c; font-size: 12px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase;">ROLLCOG</span>
                  </td>
                </tr>
              </table>

              <!-- Confirmation Icon -->
              <div style="width: 72px; height: 72px; background-color: #22c55e; border-radius: 50%; margin: 0 auto 24px auto; display: flex; align-items: center; justify-content: center;">
                <table role="presentation">
                  <tr>
                    <td style="text-align: center; vertical-align: middle; width: 72px; height: 72px;">
                      <span style="color: #ffffff; font-size: 32px;">&#10003;</span>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Big Confirmation -->
              <h1 style="margin: 0 0 16px 0; color: #ffffff; font-size: 32px; font-weight: 300; letter-spacing: -0.5px; line-height: 1.2;">
                You're all set, ${firstName}!
              </h1>

              <!-- Orange accent line -->
              <div style="width: 60px; height: 3px; background-color: #ea580c; margin: 24px auto;"></div>

              <p style="margin: 0; color: rgba(255,255,255,0.7); font-size: 16px; line-height: 1.6;">
                Your site visit has been confirmed.
              </p>
            </td>
          </tr>
        </table>

        <!-- White Content Section -->
        <table role="presentation" style="width: 100%; max-width: 560px; margin: 0 auto; background-color: #ffffff;">
          <tr>
            <td style="padding: 48px 40px;">

              <!-- Appointment Details Card -->
              <div style="background-color: #f8fafc; border-radius: 12px; padding: 32px; border-left: 4px solid #ea580c;">
                <p style="margin: 0 0 24px 0; color: #64748b; font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;">
                  APPOINTMENT DETAILS
                </p>

                <!-- Date -->
                <table role="presentation" style="width: 100%; margin-bottom: 16px;">
                  <tr>
                    <td style="width: 36px; vertical-align: top;">
                      <span style="font-size: 20px;">&#128197;</span>
                    </td>
                    <td>
                      <p style="margin: 0 0 2px 0; color: #64748b; font-size: 12px;">Date</p>
                      <p style="margin: 0; color: #0f172a; font-size: 18px; font-weight: 600;">${displayDate}</p>
                    </td>
                  </tr>
                </table>

                <!-- Time -->
                <table role="presentation" style="width: 100%; margin-bottom: 16px;">
                  <tr>
                    <td style="width: 36px; vertical-align: top;">
                      <span style="font-size: 20px;">&#128336;</span>
                    </td>
                    <td>
                      <p style="margin: 0 0 2px 0; color: #64748b; font-size: 12px;">Time</p>
                      <p style="margin: 0; color: #0f172a; font-size: 18px; font-weight: 600;">${displayTime} (Central Time)</p>
                    </td>
                  </tr>
                </table>

                ${propertyAddress ? `
                <!-- Address -->
                <table role="presentation" style="width: 100%;">
                  <tr>
                    <td style="width: 36px; vertical-align: top;">
                      <span style="font-size: 20px;">&#128205;</span>
                    </td>
                    <td>
                      <p style="margin: 0 0 2px 0; color: #64748b; font-size: 12px;">Property Address</p>
                      <p style="margin: 0; color: #0f172a; font-size: 16px; font-weight: 500;">${propertyAddress}</p>
                    </td>
                  </tr>
                </table>
                ` : ""}
              </div>

              <!-- What to Expect -->
              <div style="margin-top: 32px;">
                <p style="margin: 0 0 16px 0; color: #64748b; font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;">
                  WHAT TO EXPECT
                </p>

                <ul style="margin: 0; padding-left: 20px; color: #374151; font-size: 14px; line-height: 2;">
                  <li>Our roofing specialist will arrive at the scheduled time</li>
                  <li>We'll conduct a thorough inspection of your roof</li>
                  <li>You'll receive a detailed, no-obligation estimate</li>
                  <li>The visit typically takes 30-45 minutes</li>
                </ul>
              </div>

              <!-- Divider -->
              <div style="height: 1px; background-color: #e2e8f0; margin: 32px 0;"></div>

              <!-- Need to Reschedule -->
              <table role="presentation" style="width: 100%;">
                <tr>
                  <td style="text-align: center;">
                    <p style="margin: 0 0 16px 0; color: #64748b; font-size: 14px;">
                      Need to reschedule or have questions?
                    </p>
                    <a href="tel:${COMPANY.phone.replace(/\D/g, "")}" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                      Call ${COMPANY.phone}
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table role="presentation" style="width: 100%; background-color: #0f172a;">
          <tr>
            <td style="padding: 32px 24px; text-align: center;">
              <p style="margin: 0 0 8px 0; color: rgba(255,255,255,0.5); font-size: 12px;">
                ${COMPANY.address.street} &bull; ${COMPANY.address.city}, ${COMPANY.address.state} ${COMPANY.address.zip}
              </p>
              <p style="margin: 0; color: rgba(255,255,255,0.5); font-size: 12px;">
                <a href="mailto:office@rollcog.com" style="color: #ea580c; text-decoration: none;">office@rollcog.com</a>
              </p>
              <p style="margin: 24px 0 0 0; color: rgba(255,255,255,0.3); font-size: 11px;">
                &copy; ${new Date().getFullYear()} Rollcog Roofs. All rights reserved.
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generate booking confirmation email plain text
 */
export function generateBookingConfirmationEmailText(data: BookingEmailData): string {
  const { name, appointmentDate, appointmentTime, propertyAddress } = data;
  const firstName = name.split(" ")[0];
  const displayDate = formatDisplayDate(appointmentDate);
  const displayTime = formatDisplayTime(appointmentTime);

  return `
YOU'RE ALL SET, ${firstName.toUpperCase()}!

Your site visit has been confirmed.

APPOINTMENT DETAILS
-------------------

Date: ${displayDate}
Time: ${displayTime} (Central Time)
${propertyAddress ? `Property Address: ${propertyAddress}` : ""}

WHAT TO EXPECT
--------------

- Our roofing specialist will arrive at the scheduled time
- We'll conduct a thorough inspection of your roof
- You'll receive a detailed, no-obligation estimate
- The visit typically takes 30-45 minutes


Need to reschedule or have questions?
Call us: ${COMPANY.phone}

---

Rollcog Roofs
${COMPANY.address.street}
${COMPANY.address.city}, ${COMPANY.address.state} ${COMPANY.address.zip}
${COMPANY.phone} | office@rollcog.com

(c) ${new Date().getFullYear()} Rollcog Roofs. All rights reserved.
  `.trim();
}

/**
 * Generate appointment reminder email HTML (sent 24 hours before)
 */
export function generateReminderEmail(data: BookingEmailData): string {
  const { name, appointmentDate, appointmentTime, propertyAddress } = data;
  const firstName = name.split(" ")[0];
  const displayDate = formatDisplayDate(appointmentDate);
  const displayTime = formatDisplayTime(appointmentTime);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reminder: Site Visit Tomorrow - Rollcog Roofs</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f172a;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 0;">

        <!-- Dark Header Section -->
        <table role="presentation" style="width: 100%; background-color: #0f172a;">
          <tr>
            <td style="padding: 48px 24px 40px 24px; text-align: center;">
              <!-- Logo -->
              <table role="presentation" style="margin: 0 auto;">
                <tr>
                  <td style="padding-bottom: 32px;">
                    <span style="color: #ea580c; font-size: 12px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase;">ROLLCOG</span>
                  </td>
                </tr>
              </table>

              <!-- Bell Icon -->
              <div style="margin: 0 auto 24px auto;">
                <span style="font-size: 48px;">&#128276;</span>
              </div>

              <!-- Reminder Header -->
              <h1 style="margin: 0 0 16px 0; color: #ffffff; font-size: 32px; font-weight: 300; letter-spacing: -0.5px; line-height: 1.2;">
                Reminder: Site Visit Tomorrow
              </h1>

              <!-- Orange accent line -->
              <div style="width: 60px; height: 3px; background-color: #ea580c; margin: 24px auto;"></div>

              <p style="margin: 0; color: rgba(255,255,255,0.7); font-size: 16px; line-height: 1.6;">
                Hi ${firstName}, just a friendly reminder about your upcoming site visit.
              </p>
            </td>
          </tr>
        </table>

        <!-- White Content Section -->
        <table role="presentation" style="width: 100%; max-width: 560px; margin: 0 auto; background-color: #ffffff;">
          <tr>
            <td style="padding: 48px 40px;">

              <!-- Appointment Details Card -->
              <div style="background-color: #fef3c7; border-radius: 12px; padding: 32px; border-left: 4px solid #f59e0b;">
                <p style="margin: 0 0 24px 0; color: #92400e; font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;">
                  YOUR APPOINTMENT
                </p>

                <!-- Date -->
                <table role="presentation" style="width: 100%; margin-bottom: 16px;">
                  <tr>
                    <td style="width: 36px; vertical-align: top;">
                      <span style="font-size: 20px;">&#128197;</span>
                    </td>
                    <td>
                      <p style="margin: 0 0 2px 0; color: #92400e; font-size: 12px;">Date</p>
                      <p style="margin: 0; color: #78350f; font-size: 18px; font-weight: 600;">${displayDate}</p>
                    </td>
                  </tr>
                </table>

                <!-- Time -->
                <table role="presentation" style="width: 100%; margin-bottom: 16px;">
                  <tr>
                    <td style="width: 36px; vertical-align: top;">
                      <span style="font-size: 20px;">&#128336;</span>
                    </td>
                    <td>
                      <p style="margin: 0 0 2px 0; color: #92400e; font-size: 12px;">Time</p>
                      <p style="margin: 0; color: #78350f; font-size: 18px; font-weight: 600;">${displayTime} (Central Time)</p>
                    </td>
                  </tr>
                </table>

                ${propertyAddress ? `
                <!-- Address -->
                <table role="presentation" style="width: 100%;">
                  <tr>
                    <td style="width: 36px; vertical-align: top;">
                      <span style="font-size: 20px;">&#128205;</span>
                    </td>
                    <td>
                      <p style="margin: 0 0 2px 0; color: #92400e; font-size: 12px;">Property Address</p>
                      <p style="margin: 0; color: #78350f; font-size: 16px; font-weight: 500;">${propertyAddress}</p>
                    </td>
                  </tr>
                </table>
                ` : ""}
              </div>

              <!-- Divider -->
              <div style="height: 1px; background-color: #e2e8f0; margin: 32px 0;"></div>

              <!-- Need to Reschedule -->
              <table role="presentation" style="width: 100%;">
                <tr>
                  <td style="text-align: center;">
                    <p style="margin: 0 0 16px 0; color: #64748b; font-size: 14px;">
                      Can't make it? Let us know so we can reschedule.
                    </p>
                    <a href="tel:${COMPANY.phone.replace(/\D/g, "")}" style="display: inline-block; background-color: #ea580c; color: #ffffff; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                      Call ${COMPANY.phone}
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table role="presentation" style="width: 100%; background-color: #0f172a;">
          <tr>
            <td style="padding: 32px 24px; text-align: center;">
              <p style="margin: 0 0 8px 0; color: rgba(255,255,255,0.5); font-size: 12px;">
                ${COMPANY.address.street} &bull; ${COMPANY.address.city}, ${COMPANY.address.state} ${COMPANY.address.zip}
              </p>
              <p style="margin: 0; color: rgba(255,255,255,0.5); font-size: 12px;">
                <a href="mailto:office@rollcog.com" style="color: #ea580c; text-decoration: none;">office@rollcog.com</a>
              </p>
              <p style="margin: 24px 0 0 0; color: rgba(255,255,255,0.3); font-size: 11px;">
                &copy; ${new Date().getFullYear()} Rollcog Roofs. All rights reserved.
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generate appointment reminder email plain text
 */
export function generateReminderEmailText(data: BookingEmailData): string {
  const { name, appointmentDate, appointmentTime, propertyAddress } = data;
  const firstName = name.split(" ")[0];
  const displayDate = formatDisplayDate(appointmentDate);
  const displayTime = formatDisplayTime(appointmentTime);

  return `
REMINDER: SITE VISIT TOMORROW

Hi ${firstName},

Just a friendly reminder about your upcoming site visit with Rollcog Roofs.

YOUR APPOINTMENT
----------------

Date: ${displayDate}
Time: ${displayTime} (Central Time)
${propertyAddress ? `Property Address: ${propertyAddress}` : ""}

Can't make it? Let us know so we can reschedule.
Call us: ${COMPANY.phone}

---

Rollcog Roofs
${COMPANY.address.street}
${COMPANY.address.city}, ${COMPANY.address.state} ${COMPANY.address.zip}
${COMPANY.phone} | office@rollcog.com

(c) ${new Date().getFullYear()} Rollcog Roofs. All rights reserved.
  `.trim();
}
