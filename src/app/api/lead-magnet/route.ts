/**
 * @fileoverview Lead magnet API route for email capture and PDF delivery
 * @module app/api/lead-magnet/route
 */

import { NextResponse } from "next/server";
import { track } from "@vercel/analytics/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { leadMagnetSchema } from "@/components/lead-magnets/lead-magnet-schema";
import {
  generateLeadMagnetEmail,
  generateLeadMagnetEmailText,
} from "@/components/lead-magnets/lead-magnet-email-template";
import { createLead } from "@/lib/db";

// Minimum time (in ms) a human would take to fill out the form
const MIN_FORM_TIME_MS = 2000; // 2 seconds

// PDF file paths
const PDF_FILES = {
  "inspection-guide": "roof-inspection-guide.pdf",
  "maintenance-guide": "maintenance-guide.pdf",
  "quiz-results": "roof-inspection-guide.pdf", // Quiz results get the inspection guide
};

// Guide titles for email subjects
const GUIDE_TITLES = {
  "inspection-guide": "Roof Inspection Guide",
  "maintenance-guide": "Maintenance Guide",
  "quiz-results": "Roof Inspection Guide",
};

/**
 * Handles POST requests for lead magnet downloads.
 * Captures email, saves lead to database, and sends PDF via Resend.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body: unknown = await request.json();

    // Validate request body
    const result = leadMagnetSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid form data", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const {
      name,
      email,
      company,
      leadMagnetType,
      quizScore,
      quizUrgency,
      source,
      website,
      formLoadedAt,
    } = result.data;

    // Bot protection: Check honeypot field
    if (website && website.length > 0) {
      console.log("Bot detected: honeypot field filled");
      return NextResponse.json({
        success: true,
        message: "Guide sent successfully",
      });
    }

    // Bot protection: Check if form was submitted too quickly
    if (formLoadedAt) {
      const timeToSubmit = Date.now() - formLoadedAt;
      if (timeToSubmit < MIN_FORM_TIME_MS) {
        console.log(`Bot detected: form submitted in ${timeToSubmit}ms (too fast)`);
        return NextResponse.json({
          success: true,
          message: "Guide sent successfully",
        });
      }
    }

    // Save lead to database
    try {
      await createLead({
        name,
        email,
        phone: null,
        company: company || null,
        service: null,
        message: `Lead magnet download: ${leadMagnetType}${quizScore !== undefined ? ` (Quiz score: ${quizScore}%, Urgency: ${quizUrgency})` : ""}`,
        source: source || `lead-magnet-${leadMagnetType}`,
      });
      console.log("Lead magnet lead saved to database:", email, leadMagnetType);
    } catch (dbError) {
      console.error("Failed to save lead magnet lead to database:", dbError);
    }

    // Check for Resend API key
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      // Development mode - log the submission
      console.log("=".repeat(60));
      console.log("LEAD MAGNET DOWNLOAD (Development Mode)");
      console.log("=".repeat(60));
      console.log("Name:", name);
      console.log("Email:", email);
      console.log("Company:", company || "Not provided");
      console.log("Lead Magnet:", leadMagnetType);
      if (quizScore !== undefined) {
        console.log("Quiz Score:", quizScore);
        console.log("Urgency:", quizUrgency);
      }
      console.log("Source:", source || "Direct");
      console.log("=".repeat(60));

      return NextResponse.json({
        success: true,
        message: "Guide request received (dev mode)",
      });
    }

    // Read PDF file
    const pdfFileName = PDF_FILES[leadMagnetType];
    const pdfPath = join(process.cwd(), "public", "downloads", pdfFileName);

    let pdfContent: string;
    try {
      const pdfBuffer = await readFile(pdfPath);
      pdfContent = pdfBuffer.toString("base64");
    } catch (fileError) {
      console.error("Failed to read PDF file:", fileError);
      return NextResponse.json(
        { error: "Failed to prepare guide for delivery" },
        { status: 500 }
      );
    }

    // Generate email content
    const emailHtml = generateLeadMagnetEmail({
      name,
      leadMagnetType,
      quizScore,
      quizUrgency,
    });

    const emailText = generateLeadMagnetEmailText({
      name,
      leadMagnetType,
      quizScore,
      quizUrgency,
    });

    const guideTitle = GUIDE_TITLES[leadMagnetType];

    // Send email via Resend with PDF attachment
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Rollcog Roofs <hello@rollcogroofing.com>",
        to: [email],
        subject: `Your Free Commercial ${guideTitle} from Rollcog Roofs`,
        html: emailHtml,
        text: emailText,
        reply_to: "office@rollcog.com",
        attachments: [
          {
            filename: pdfFileName,
            content: pdfContent,
          },
        ],
        tags: [
          { name: "category", value: "lead-magnet" },
          { name: "type", value: leadMagnetType },
          { name: "source", value: source || "direct" },
          ...(quizUrgency ? [{ name: "urgency", value: quizUrgency }] : []),
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Resend API error:", errorData);
      throw new Error("Failed to send email");
    }

    // Also send notification to sales team about the lead
    const notificationResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Rollcog Leads <leads@rollcogroofing.com>",
        // TODO: Change to COMPANY.email for production
        to: ["office@rollcog.com", "kim@atjcorp.net", "matthewtrundle@gmail.com", "martin.spokas@alogicapp.com"],
        subject: `[LEAD MAGNET] ${name} downloaded ${guideTitle}${quizUrgency === "high" ? " - HIGH URGENCY" : ""}`,
        html: `
          <h2>New Lead Magnet Download</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          ${company ? `<p><strong>Company:</strong> ${company}</p>` : ""}
          <p><strong>Downloaded:</strong> ${guideTitle}</p>
          ${quizScore !== undefined ? `<p><strong>Quiz Score:</strong> ${quizScore}% (${quizUrgency} urgency)</p>` : ""}
          <p><strong>Source:</strong> ${source || "Direct"}</p>
          <p style="margin-top: 24px; color: #666;">This lead downloaded a free guide. Consider following up with a personalized email or call.</p>
        `,
        text: `
New Lead Magnet Download

Name: ${name}
Email: ${email}
${company ? `Company: ${company}` : ""}
Downloaded: ${guideTitle}
${quizScore !== undefined ? `Quiz Score: ${quizScore}% (${quizUrgency} urgency)` : ""}
Source: ${source || "Direct"}

This lead downloaded a free guide. Consider following up with a personalized email or call.
        `,
        reply_to: email,
        tags: [
          { name: "category", value: "lead-magnet-notification" },
        ],
      }),
    });

    if (!notificationResponse.ok) {
      // Log but don't fail - the lead already got their guide
      const errorData = await notificationResponse.json().catch(() => ({}));
      console.error("Lead notification email error:", errorData);
    }

    // Server-side analytics tracking (more reliable than client-side)
    try {
      await track("lead_magnet_converted", {
        type: leadMagnetType,
        quiz: quizScore !== undefined ? "yes" : "no",
      });
    } catch (analyticsError) {
      // Don't fail the request if analytics fails
      console.error("Analytics tracking error:", analyticsError);
    }

    return NextResponse.json({
      success: true,
      message: "Guide sent successfully",
    });
  } catch (error) {
    console.error("Lead magnet error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
