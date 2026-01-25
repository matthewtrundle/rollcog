/**
 * @fileoverview Admin test email API
 * @module app/api/admin/emails/test/route
 *
 * Send test emails to preview templates.
 */

import { NextResponse } from "next/server";
import {
  generateLeadEmail,
  generateLeadEmailText,
  generateCustomerConfirmationEmail,
  generateCustomerConfirmationEmailText,
} from "@/features/contact/email-template";

// Sample data for test emails
const SAMPLE_LEAD = {
  name: "John Smith",
  email: "john.smith@acmecorp.com",
  phone: "(555) 123-4567",
  company: "ACME Corporation",
  service: "tpo-roofing",
  message:
    "We have a 50,000 sq ft warehouse that needs a new roof. The current roof is about 25 years old and showing signs of wear. We're interested in TPO roofing for its energy efficiency. Can you provide an estimate?",
  source: "general",
};

const SAMPLE_CUSTOMER = {
  name: "John Smith",
  service: "tpo-roofing",
};

/**
 * POST /api/admin/emails/test - Send a test email
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { type, to } = body as { type: "lead" | "confirmation"; to: string };

    if (!type || !to) {
      return NextResponse.json(
        { error: "Type and recipient email are required" },
        { status: 400 }
      );
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    // Generate email content based on type
    let html: string;
    let text: string;
    let subject: string;
    let from: string;

    if (type === "lead") {
      html = generateLeadEmail(SAMPLE_LEAD);
      text = generateLeadEmailText(SAMPLE_LEAD);
      subject = "[TEST] New Lead - John Smith - TPO Commercial Roofing";
      from = "Rollcog Leads <leads@rollcogroofing.com>";
    } else {
      html = generateCustomerConfirmationEmail(SAMPLE_CUSTOMER);
      text = generateCustomerConfirmationEmailText(SAMPLE_CUSTOMER);
      subject = "[TEST] Thank you for contacting Rollcog Roofs!";
      from = "Rollcog Roofs <hello@rollcogroofing.com>";
    }

    // Send via Resend
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
        text,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Resend API error:", errorData);
      throw new Error("Failed to send email");
    }

    return NextResponse.json({
      success: true,
      message: `Test email sent to ${to}`,
    });
  } catch (error) {
    console.error("Test email error:", error);
    return NextResponse.json(
      { error: "Failed to send test email" },
      { status: 500 }
    );
  }
}
