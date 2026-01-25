/**
 * @fileoverview Send test lead emails to verify the template
 *
 * Usage:
 *   RESEND_API_KEY=re_xxx npx tsx scripts/send-test-emails.ts kim@atjcorp.net
 */

import { generateLeadEmail, generateLeadEmailText } from "../src/features/contact/email-template";

const TEST_EMAIL = process.argv[2] || "kim@atjcorp.net";
const API_KEY = process.env.RESEND_API_KEY;

if (!API_KEY) {
  console.error("Error: RESEND_API_KEY environment variable is required");
  console.error("Usage: RESEND_API_KEY=re_xxx npx tsx scripts/send-test-emails.ts [email]");
  process.exit(1);
}

// Test scenarios for different ad campaigns
const testScenarios = [
  {
    name: "General Inquiry (No Source)",
    data: {
      name: "John Smith",
      email: "john.smith@example.com",
      phone: "(312) 555-1234",
      company: "ABC Manufacturing",
      service: "tpo-roofing" as const,
      message: "We have a 50,000 sq ft warehouse that needs a new roof. The current roof is about 20 years old and we've been having leak issues. Looking for a quote on TPO roofing replacement.\n\nPlease contact me at your earliest convenience.",
    },
  },
  {
    name: "Google Ads - Repair Campaign",
    data: {
      name: "Sarah Johnson",
      email: "sjohnson@retailcorp.com",
      phone: "(773) 555-9876",
      company: "Retail Corp",
      service: "flat-roof-repair" as const,
      message: "Emergency! We have a major leak in our retail store affecting merchandise. Need someone out ASAP to assess and repair.",
      source: "repair",
    },
  },
  {
    name: "Google Ads - Flat Roof Campaign",
    data: {
      name: "Michael Chen",
      email: "mchen@propertymgmt.com",
      phone: "(847) 555-4321",
      service: "mod-bit" as const,
      message: "Managing a portfolio of 12 commercial properties. Looking for a reliable roofing contractor for ongoing maintenance and repairs. Several buildings need attention.",
      source: "flat-roof",
    },
  },
  {
    name: "Google Ads - Industrial Campaign",
    data: {
      name: "Robert Williams",
      email: "rwilliams@industrialcorp.com",
      phone: "(630) 555-8765",
      company: "Industrial Solutions Inc.",
      service: "commercial-industrial" as const,
      message: "We have a 200,000 sq ft manufacturing facility that needs roof assessment. Currently have ponding water issues and some membrane damage. Looking for full replacement options.",
      source: "industrial",
    },
  },
];

async function sendTestEmail(scenario: typeof testScenarios[0], index: number): Promise<void> {
  console.log(`\n[${index + 1}/${testScenarios.length}] Sending: ${scenario.name}...`);

  const html = generateLeadEmail(scenario.data);
  const text = generateLeadEmailText(scenario.data);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Rollcog Leads <leads@rollcogroofing.com>",
      to: [TEST_EMAIL],
      subject: `[TEST ${index + 1}] ${scenario.name} - ${scenario.data.name}`,
      html,
      text,
      reply_to: scenario.data.email,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    console.error(`  ❌ Failed:`, error);
    return;
  }

  const result = await response.json();
  console.log(`  ✅ Sent! ID: ${result.id}`);
}

async function main(): Promise<void> {
  console.log("=".repeat(60));
  console.log("ROLLCOG LEAD EMAIL TEST");
  console.log("=".repeat(60));
  console.log(`Sending ${testScenarios.length} test emails to: ${TEST_EMAIL}`);

  for (let i = 0; i < testScenarios.length; i++) {
    await sendTestEmail(testScenarios[i], i);
    // Small delay between emails
    if (i < testScenarios.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("Done! Check your inbox.");
  console.log("=".repeat(60));
}

main().catch(console.error);
