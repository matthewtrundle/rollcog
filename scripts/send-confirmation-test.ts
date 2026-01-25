/**
 * Send test customer confirmation email
 */

import { generateCustomerConfirmationEmail, generateCustomerConfirmationEmailText } from "../src/features/contact/email-template";

const API_KEY = process.env.RESEND_API_KEY;
const TEST_EMAIL = process.argv[2] || "kim@atjcorp.net";

const testData = {
  name: "Kim Thompson",
  service: "flat-roof-repair" as const,
};

async function main(): Promise<void> {
  if (!API_KEY) {
    console.error("RESEND_API_KEY required");
    process.exit(1);
  }

  console.log(`Sending customer confirmation test email to ${TEST_EMAIL}...`);

  const html = generateCustomerConfirmationEmail(testData);
  const text = generateCustomerConfirmationEmailText(testData);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Rollcog Roofs <hello@rollcogroofing.com>",
      to: [TEST_EMAIL],
      subject: "[TEST] Thank you for contacting Rollcog Roofs!",
      html,
      text,
      reply_to: "office@rollcog.com",
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    console.error("Failed:", error);
    return;
  }

  const result = await response.json();
  console.log("✅ Customer confirmation email sent! ID:", result.id);
}

main().catch(console.error);
