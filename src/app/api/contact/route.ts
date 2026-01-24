/**
 * @fileoverview Contact form API route
 * @module app/api/contact/route
 */

import { NextResponse } from "next/server";
import { contactFormSchema } from "@/features/contact";
import { COMPANY } from "@/lib/utils/constants";

/**
 * Handles POST requests for contact form submissions.
 *
 * Validates the form data and sends an email via Resend.
 * Returns success/error response.
 */
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

    const { name, email, phone, company, service, message } = result.data;

    // Check for Resend API key
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      // In development without API key, log the submission
      console.log("Contact form submission (no Resend API key):", {
        name,
        email,
        phone,
        company,
        service,
        message: message.substring(0, 100) + "...",
      });

      return NextResponse.json({
        success: true,
        message: "Form submission received (dev mode)",
      });
    }

    // Send email via Resend
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Rollcog Website <noreply@rollcog.com>",
        to: [COMPANY.email],
        subject: `New Lead: ${name} - ${service || "General Inquiry"}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ""}
          ${company ? `<p><strong>Company:</strong> ${company}</p>` : ""}
          ${service ? `<p><strong>Service Interest:</strong> ${service}</p>` : ""}
          <h3>Message:</h3>
          <p>${message.replace(/\n/g, "<br>")}</p>
        `,
        reply_to: email,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Resend API error:", errorData);
      throw new Error("Failed to send email");
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
