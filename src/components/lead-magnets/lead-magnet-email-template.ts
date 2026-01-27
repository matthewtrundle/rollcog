/**
 * @fileoverview Email templates for lead magnet PDF delivery
 * @module components/lead-magnets/lead-magnet-email-template
 */

import { COMPANY } from "@/lib/utils/constants";
import type { QuizUrgency } from "./lead-magnet-schema";

interface LeadMagnetEmailData {
  name: string;
  leadMagnetType: "inspection-guide" | "maintenance-guide" | "quiz-results";
  quizScore?: number;
  quizUrgency?: QuizUrgency;
}

const GUIDE_TITLES = {
  "inspection-guide": "Commercial Roof Inspection Guide",
  "maintenance-guide": "Commercial Roof Maintenance Guide",
  "quiz-results": "Commercial Roof Inspection Guide",
};

const URGENCY_CONFIG = {
  high: {
    title: "High Priority",
    color: "#dc2626",
    bgColor: "#fef2f2",
    message: "Based on your quiz results, your roof may need immediate professional attention. We recommend scheduling an inspection soon.",
  },
  medium: {
    title: "Moderate Concern",
    color: "#ea580c",
    bgColor: "#fff7ed",
    message: "Your quiz indicates some potential concerns. A professional inspection would help assess the situation and prevent future problems.",
  },
  low: {
    title: "Looking Good",
    color: "#16a34a",
    bgColor: "#f0fdf4",
    message: "Great news! Your roof appears to be in good condition. Regular inspections will help keep it that way.",
  },
};

/**
 * Generates HTML email for lead magnet PDF delivery
 */
export function generateLeadMagnetEmail(data: LeadMagnetEmailData): string {
  const { name, leadMagnetType, quizScore, quizUrgency } = data;
  const firstName = name.split(" ")[0];
  const guideTitle = GUIDE_TITLES[leadMagnetType];
  const urgencyConfig = quizUrgency ? URGENCY_CONFIG[quizUrgency] : null;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Free ${guideTitle}</title>
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
                  <td style="padding-bottom: 24px;">
                    <span style="color: #ea580c; font-size: 12px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase;">ROLLCOG</span>
                  </td>
                </tr>
              </table>

              <!-- Main Title -->
              <h1 style="margin: 0 0 16px 0; color: #ffffff; font-size: 32px; font-weight: 300; letter-spacing: -0.5px; line-height: 1.2;">
                Hi ${firstName}, your guide is ready!
              </h1>

              <!-- Orange accent line -->
              <div style="width: 60px; height: 3px; background-color: #ea580c; margin: 24px auto;"></div>

              <!-- Subtitle -->
              <p style="margin: 0; color: rgba(255,255,255,0.7); font-size: 16px; line-height: 1.6;">
                Your <span style="color: #ffffff; font-weight: 500;">${guideTitle}</span> is attached to this email.
              </p>
            </td>
          </tr>
        </table>

        <!-- White Content Section -->
        <table role="presentation" style="width: 100%; max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 0;">
          <tr>
            <td style="padding: 48px 40px;">

              ${quizUrgency ? `
              <!-- Quiz Results Box -->
              <table role="presentation" style="width: 100%; margin-bottom: 32px;">
                <tr>
                  <td style="background-color: ${urgencyConfig!.bgColor}; border-radius: 12px; padding: 24px; border-left: 4px solid ${urgencyConfig!.color};">
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="vertical-align: top; padding-right: 16px;">
                          <div style="width: 48px; height: 48px; background-color: ${urgencyConfig!.color}; border-radius: 50%; text-align: center; line-height: 48px; color: #ffffff; font-size: 18px; font-weight: 700;">
                            ${quizScore || 0}%
                          </div>
                        </td>
                        <td style="vertical-align: top;">
                          <p style="margin: 0 0 4px 0; color: ${urgencyConfig!.color}; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                            Your Quiz Result
                          </p>
                          <p style="margin: 0 0 8px 0; color: #0f172a; font-size: 18px; font-weight: 600;">
                            ${urgencyConfig!.title}
                          </p>
                          <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.5;">
                            ${urgencyConfig!.message}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              ` : ''}

              <!-- What's Inside -->
              <p style="margin: 0 0 24px 0; color: #64748b; font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;">
                WHAT'S INSIDE YOUR GUIDE
              </p>

              ${leadMagnetType === "maintenance-guide" ? `
              <table role="presentation" style="width: 100%;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                    <span style="color: #ea580c; font-weight: 600; margin-right: 12px;">✓</span>
                    <span style="color: #374151;">Monthly visual inspection checklists</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                    <span style="color: #ea580c; font-weight: 600; margin-right: 12px;">✓</span>
                    <span style="color: #374151;">Quarterly maintenance task lists</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                    <span style="color: #ea580c; font-weight: 600; margin-right: 12px;">✓</span>
                    <span style="color: #374151;">Seasonal preparation guides</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                    <span style="color: #ea580c; font-weight: 600; margin-right: 12px;">✓</span>
                    <span style="color: #374151;">Emergency response procedures</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0;">
                    <span style="color: #ea580c; font-weight: 600; margin-right: 12px;">✓</span>
                    <span style="color: #374151;">Printable maintenance log template</span>
                  </td>
                </tr>
              </table>
              ` : `
              <table role="presentation" style="width: 100%;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                    <span style="color: #ea580c; font-weight: 600; margin-right: 12px;">✓</span>
                    <span style="color: #374151;">Professional inspection checklist</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                    <span style="color: #ea580c; font-weight: 600; margin-right: 12px;">✓</span>
                    <span style="color: #374151;">Warning signs explained</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                    <span style="color: #ea580c; font-weight: 600; margin-right: 12px;">✓</span>
                    <span style="color: #374151;">DIY vs professional guidance</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0;">
                    <span style="color: #ea580c; font-weight: 600; margin-right: 12px;">✓</span>
                    <span style="color: #374151;">When to call for help</span>
                  </td>
                </tr>
              </table>
              `}

              <!-- Divider -->
              <div style="height: 1px; background-color: #e2e8f0; margin: 32px 0;"></div>

              <!-- CTA Section -->
              <table role="presentation" style="width: 100%;">
                <tr>
                  <td style="text-align: center;">
                    <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px; font-weight: 600;">
                      Ready for a professional assessment?
                    </p>
                    <p style="margin: 0 0 24px 0; color: #64748b; font-size: 14px;">
                      Schedule a free, no-obligation inspection with our GAF-certified team.
                    </p>
                    <a href="https://rollcogroofing.com/contact" style="display: inline-block; background-color: #ea580c; color: #ffffff; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                      Schedule Free Inspection
                    </a>
                    <p style="margin: 24px 0 0 0; color: #64748b; font-size: 14px;">
                      Or call us: <a href="tel:${COMPANY.phone.replace(/\D/g, "")}" style="color: #ea580c; text-decoration: none; font-weight: 600;">${COMPANY.phone}</a>
                    </p>
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
 * Generates plain text version of lead magnet email
 */
export function generateLeadMagnetEmailText(data: LeadMagnetEmailData): string {
  const { name, leadMagnetType, quizScore, quizUrgency } = data;
  const firstName = name.split(" ")[0];
  const guideTitle = GUIDE_TITLES[leadMagnetType];
  const urgencyConfig = quizUrgency ? URGENCY_CONFIG[quizUrgency] : null;

  return `
HI ${firstName.toUpperCase()}, YOUR GUIDE IS READY!

Your ${guideTitle} is attached to this email.

${quizUrgency ? `
YOUR QUIZ RESULT: ${urgencyConfig!.title.toUpperCase()} (${quizScore}%)
${urgencyConfig!.message}

` : ''}
WHAT'S INSIDE YOUR GUIDE:
${leadMagnetType === "maintenance-guide" ? `
- Monthly visual inspection checklists
- Quarterly maintenance task lists
- Seasonal preparation guides
- Emergency response procedures
- Printable maintenance log template
` : `
- Professional inspection checklist
- Warning signs explained
- DIY vs professional guidance
- When to call for help
`}

READY FOR A PROFESSIONAL ASSESSMENT?
Schedule a free, no-obligation inspection with our GAF-certified team.

Visit: https://rollcogroofing.com/contact
Call us: ${COMPANY.phone}

---

Rollcog Roofs
${COMPANY.address.street}
${COMPANY.address.city}, ${COMPANY.address.state} ${COMPANY.address.zip}
${COMPANY.phone} | ${COMPANY.email}

© ${new Date().getFullYear()} Rollcog Roofs. All rights reserved.
  `.trim();
}
