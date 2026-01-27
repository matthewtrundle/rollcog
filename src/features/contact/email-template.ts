/**
 * @fileoverview Professional email template for lead notifications
 * @module features/contact/email-template
 */

import { COMPANY } from "@/lib/utils/constants";

interface LeadEmailData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  service?: string;
  message: string;
  source?: string;
}

// Service name mapping for display
const SERVICE_NAMES: Record<string, string> = {
  "tpo-roofing": "TPO Commercial Roofing",
  "mod-bit": "Modified Bitumen Systems",
  "flat-roof-repair": "Flat Roof Repair & Replacement",
  "commercial-industrial": "Commercial & Industrial",
  "other": "Other / General Inquiry",
};

// Source name mapping for tracking
const SOURCE_NAMES: Record<string, string> = {
  repair: "Google Ads - Roof Repair",
  "flat-roof": "Google Ads - Flat Roof",
  industrial: "Google Ads - Industrial",
  general: "Google Ads - General",
  direct: "Direct / Organic",
};

/**
 * Generates a professional HTML email for lead notifications
 */
export function generateLeadEmail(data: LeadEmailData): string {
  const {
    name,
    email,
    phone,
    company,
    service,
    message,
    source,
  } = data;

  const serviceName = service ? SERVICE_NAMES[service] || service : "Not specified";
  const sourceName = source ? SOURCE_NAMES[source] || source : "Website Contact Form";
  const timestamp = new Date().toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Lead - ${name}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f0;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="background-color: #1a1a1a; padding: 32px 40px;">
              <table role="presentation" style="width: 100%;">
                <tr>
                  <td>
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                      New Lead Received
                    </h1>
                    <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.7); font-size: 14px;">
                      ${timestamp}
                    </p>
                  </td>
                  <td style="text-align: right;">
                    <div style="background-color: #dc2626; color: white; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; display: inline-block;">
                      HOT LEAD
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Lead Source Banner -->
          <tr>
            <td style="background-color: #fef3c7; padding: 16px 40px; border-bottom: 1px solid #fcd34d;">
              <table role="presentation" style="width: 100%;">
                <tr>
                  <td>
                    <p style="margin: 0; font-size: 13px; color: #92400e;">
                      <strong>Lead Source:</strong> ${sourceName}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Contact Info Section -->
          <tr>
            <td style="padding: 32px 40px;">
              <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 18px; font-weight: 600; border-bottom: 2px solid #dc2626; padding-bottom: 10px; display: inline-block;">
                Contact Information
              </h2>

              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5;">
                    <p style="margin: 0; color: #666666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Name</p>
                    <p style="margin: 4px 0 0 0; color: #1a1a1a; font-size: 16px; font-weight: 600;">${name}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5;">
                    <p style="margin: 0; color: #666666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Email</p>
                    <p style="margin: 4px 0 0 0;">
                      <a href="mailto:${email}" style="color: #dc2626; font-size: 16px; text-decoration: none;">${email}</a>
                    </p>
                  </td>
                </tr>
                ${phone ? `
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5;">
                    <p style="margin: 0; color: #666666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Phone</p>
                    <p style="margin: 4px 0 0 0;">
                      <a href="tel:${phone.replace(/\D/g, "")}" style="color: #dc2626; font-size: 16px; text-decoration: none; font-weight: 600;">${phone}</a>
                    </p>
                  </td>
                </tr>
                ` : ""}
                ${company ? `
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5;">
                    <p style="margin: 0; color: #666666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Company</p>
                    <p style="margin: 4px 0 0 0; color: #1a1a1a; font-size: 16px;">${company}</p>
                  </td>
                </tr>
                ` : ""}
                <tr>
                  <td style="padding: 12px 0;">
                    <p style="margin: 0; color: #666666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Service Interest</p>
                    <p style="margin: 4px 0 0 0; color: #1a1a1a; font-size: 16px;">${serviceName}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message Section -->
          <tr>
            <td style="padding: 0 40px 32px 40px;">
              <h2 style="margin: 0 0 16px 0; color: #1a1a1a; font-size: 18px; font-weight: 600; border-bottom: 2px solid #dc2626; padding-bottom: 10px; display: inline-block;">
                Message
              </h2>
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; border-left: 4px solid #dc2626;">
                <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${message}</p>
              </div>
            </td>
          </tr>

          <!-- Quick Actions -->
          <tr>
            <td style="padding: 0 40px 32px 40px;">
              <table role="presentation" style="width: 100%;">
                <tr>
                  <td style="text-align: center;">
                    ${phone ? `
                    <a href="tel:${phone.replace(/\D/g, "")}" style="display: inline-block; background-color: #dc2626; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; margin-right: 12px;">
                      Call Now
                    </a>
                    ` : ""}
                    <a href="mailto:${email}" style="display: inline-block; background-color: #1a1a1a; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                      Reply via Email
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; border-top: 1px solid #e5e5e5;">
              <table role="presentation" style="width: 100%;">
                <tr>
                  <td>
                    <p style="margin: 0; color: #6b7280; font-size: 13px;">
                      <strong style="color: #1a1a1a;">Rollcog Roofs</strong><br>
                      ${COMPANY.address.street}<br>
                      ${COMPANY.address.city}, ${COMPANY.address.state} ${COMPANY.address.zip}
                    </p>
                  </td>
                  <td style="text-align: right;">
                    <p style="margin: 0; color: #6b7280; font-size: 13px;">
                      <a href="tel:${COMPANY.phone}" style="color: #dc2626; text-decoration: none;">${COMPANY.phone}</a><br>
                      <a href="mailto:${COMPANY.email}" style="color: #dc2626; text-decoration: none;">${COMPANY.email}</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Reminder -->
          <tr>
            <td style="background-color: #1a1a1a; padding: 16px 40px; text-align: center;">
              <p style="margin: 0; color: rgba(255,255,255,0.7); font-size: 12px;">
                Remember: Respond within 24 hours for best conversion rates
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
 * Generates a confirmation email for the customer who submitted the form
 * Designed to match the premium look of rollcogroofing.com
 */
export function generateCustomerConfirmationEmail(data: { name: string; service?: string }): string {
  const { name, service } = data;
  const firstName = name.split(" ")[0];
  const serviceName = service ? SERVICE_NAMES[service] || service : null;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You - Rollcog Roofs</title>
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

              <!-- Big Thank You -->
              <h1 style="margin: 0 0 16px 0; color: #ffffff; font-size: 36px; font-weight: 300; letter-spacing: -0.5px; line-height: 1.2;">
                Thank you, ${firstName}.
              </h1>

              <!-- Orange accent line -->
              <div style="width: 60px; height: 3px; background-color: #ea580c; margin: 24px auto;"></div>

              <!-- Service requested -->
              <p style="margin: 0; color: rgba(255,255,255,0.7); font-size: 16px; line-height: 1.6;">
                ${serviceName
                  ? `Your request for <span style="color: #ffffff; font-weight: 500;">${serviceName}</span> has been received.`
                  : `Your request has been received.`}
              </p>
            </td>
          </tr>
        </table>

        <!-- White Content Section -->
        <table role="presentation" style="width: 100%; max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 0;">
          <tr>
            <td style="padding: 48px 40px;">

              <!-- What's Next Header -->
              <p style="margin: 0 0 24px 0; color: #64748b; font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;">
                WHAT HAPPENS NEXT
              </p>

              <!-- Step 1 -->
              <table role="presentation" style="width: 100%; margin-bottom: 24px;">
                <tr>
                  <td style="width: 48px; vertical-align: top; padding-top: 2px;">
                    <div style="width: 32px; height: 32px; background-color: #0f172a; border-radius: 50%; text-align: center; line-height: 32px; color: #ffffff; font-size: 14px; font-weight: 600;">1</div>
                  </td>
                  <td style="vertical-align: top;">
                    <p style="margin: 0 0 4px 0; color: #0f172a; font-size: 16px; font-weight: 600;">We review your project</p>
                    <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.5;">A roofing specialist will assess your requirements within 24 hours.</p>
                  </td>
                </tr>
              </table>

              <!-- Step 2 -->
              <table role="presentation" style="width: 100%; margin-bottom: 24px;">
                <tr>
                  <td style="width: 48px; vertical-align: top; padding-top: 2px;">
                    <div style="width: 32px; height: 32px; background-color: #0f172a; border-radius: 50%; text-align: center; line-height: 32px; color: #ffffff; font-size: 14px; font-weight: 600;">2</div>
                  </td>
                  <td style="vertical-align: top;">
                    <p style="margin: 0 0 4px 0; color: #0f172a; font-size: 16px; font-weight: 600;">We reach out to you</p>
                    <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.5;">To discuss your needs and schedule a free on-site inspection.</p>
                  </td>
                </tr>
              </table>

              <!-- Step 3 -->
              <table role="presentation" style="width: 100%; margin-bottom: 32px;">
                <tr>
                  <td style="width: 48px; vertical-align: top; padding-top: 2px;">
                    <div style="width: 32px; height: 32px; background-color: #0f172a; border-radius: 50%; text-align: center; line-height: 32px; color: #ffffff; font-size: 14px; font-weight: 600;">3</div>
                  </td>
                  <td style="vertical-align: top;">
                    <p style="margin: 0 0 4px 0; color: #0f172a; font-size: 16px; font-weight: 600;">Receive your estimate</p>
                    <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.5;">Transparent pricing with detailed scope of work. No hidden fees.</p>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <div style="height: 1px; background-color: #e2e8f0; margin: 32px 0;"></div>

              <!-- Call CTA -->
              <table role="presentation" style="width: 100%;">
                <tr>
                  <td style="text-align: center;">
                    <p style="margin: 0 0 16px 0; color: #64748b; font-size: 14px;">
                      Need immediate assistance?
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

        <!-- Trust Badges Section -->
        <table role="presentation" style="width: 100%; max-width: 560px; margin: 0 auto; background-color: #f8fafc;">
          <tr>
            <td style="padding: 32px 40px;">
              <table role="presentation" style="width: 100%;">
                <tr>
                  <td style="text-align: center; width: 33.33%; padding: 8px;">
                    <p style="margin: 0; color: #0f172a; font-size: 18px; font-weight: 700;">GAF</p>
                    <p style="margin: 4px 0 0 0; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Certified</p>
                  </td>
                  <td style="text-align: center; width: 33.33%; padding: 8px; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0;">
                    <p style="margin: 0; color: #0f172a; font-size: 18px; font-weight: 700;">${COMPANY.experience}</p>
                    <p style="margin: 4px 0 0 0; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Years</p>
                  </td>
                  <td style="text-align: center; width: 33.33%; padding: 8px;">
                    <p style="margin: 0; color: #0f172a; font-size: 18px; font-weight: 700;">9+</p>
                    <p style="margin: 4px 0 0 0; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">States</p>
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
                <a href="mailto:sarah@atjcorp.net" style="color: #ea580c; text-decoration: none;">sarah@atjcorp.net</a>
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
 * Generates a plain text version of the customer confirmation email
 */
export function generateCustomerConfirmationEmailText(data: { name: string; service?: string }): string {
  const { name, service } = data;
  const firstName = name.split(" ")[0];
  const serviceName = service ? SERVICE_NAMES[service] || service : null;

  return `
THANK YOU, ${firstName.toUpperCase()}!

We've received your request${serviceName ? ` for ${serviceName}` : ""} and our team is already reviewing the details.

WHAT HAPPENS NEXT?
------------------

1. Within 24 hours - A roofing specialist will review your project details

2. We'll contact you - To discuss your needs and schedule a free inspection

3. Get your estimate - Detailed, transparent pricing with no hidden fees


NEED IMMEDIATE ASSISTANCE?
--------------------------
Call us: ${COMPANY.phone}


WHY ROLLCOG ROOFS?
------------------
- GAF Certified factory-trained installers
- ${COMPANY.experience} years of industry experience
- Serving 9+ states across the Midwest and Southeast

We appreciate your interest in Rollcog Roofs. We're committed to providing the highest quality commercial roofing solutions.

---

Rollcog Roofs
${COMPANY.address.street}
${COMPANY.address.city}, ${COMPANY.address.state} ${COMPANY.address.zip}
${COMPANY.phone} | ${COMPANY.email}

© ${new Date().getFullYear()} Rollcog Roofs. All rights reserved.
  `.trim();
}

/**
 * Generates a plain text version of the lead email
 */
export function generateLeadEmailText(data: LeadEmailData): string {
  const {
    name,
    email,
    phone,
    company,
    service,
    message,
    source,
  } = data;

  const serviceName = service ? SERVICE_NAMES[service] || service : "Not specified";
  const sourceName = source ? SOURCE_NAMES[source] || source : "Website Contact Form";
  const timestamp = new Date().toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

  return `
NEW LEAD RECEIVED
${timestamp}

Lead Source: ${sourceName}

-------------------
CONTACT INFORMATION
-------------------

Name: ${name}
Email: ${email}
${phone ? `Phone: ${phone}` : ""}
${company ? `Company: ${company}` : ""}
Service Interest: ${serviceName}

-------
MESSAGE
-------

${message}

-------------------

Rollcog Roofs
${COMPANY.address.street}
${COMPANY.address.city}, ${COMPANY.address.state} ${COMPANY.address.zip}
${COMPANY.phone} | ${COMPANY.email}

Remember: Respond within 24 hours for best conversion rates!
  `.trim();
}
