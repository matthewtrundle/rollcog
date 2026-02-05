/**
 * @fileoverview Daily intelligence report cron endpoint
 * @module app/api/cron/daily-intelligence
 *
 * Runs daily at 8 AM to:
 * 1. Extract analytics data from PostgreSQL
 * 2. Run intelligence analysis
 * 3. Generate AI-powered insights via Claude
 * 4. Send email report via Resend
 */

import { NextResponse } from "next/server";
import { extractDailyRawData, extractPreviewData } from "@/lib/analytics/data-extraction";
import { runFullAnalysis } from "@/lib/analytics/intelligence-engine";
import { generateIntelligenceReport, testAISynthesis } from "@/lib/analytics/ai-synthesis";
import { extractGoogleAdsMetrics, testGoogleAdsConnection } from "@/lib/analytics/google-ads";
import {
  generateIntelligenceReportEmail,
  generateIntelligenceReportText,
} from "@/lib/email/templates/intelligence-report";

// =============================================================================
// CONFIGURATION
// =============================================================================

const RESEND_API_URL = "https://api.resend.com/emails";
const FROM_EMAIL = "Rollcog Analytics <analytics@rollcogroofing.com>";

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Get recipient emails from environment variable
 */
function getRecipients(): string[] {
  const envRecipients = process.env.ANALYTICS_EMAIL_RECIPIENTS;
  if (!envRecipients) {
    console.error("ANALYTICS_EMAIL_RECIPIENTS not configured");
    return [];
  }
  return envRecipients.split(",").map((e) => e.trim()).filter(Boolean);
}

/**
 * Send email via Resend
 */
async function sendEmail(
  to: string[],
  subject: string,
  html: string,
  text: string
): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  try {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to,
        subject,
        html,
        text,
        tags: [
          { name: "category", value: "analytics" },
          { name: "type", value: "daily-intelligence" },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Resend API error: ${error}` };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: `Email send error: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Verify the request is from Vercel Cron (or authorized)
 */
function verifyRequest(request: Request): boolean {
  // In development, allow all requests
  if (process.env.NODE_ENV === "development") {
    return true;
  }

  // Check for Vercel cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    return true;
  }

  // Check for test mode header (for manual triggers)
  const testMode = request.headers.get("x-test-mode");
  if (testMode === "true" && cronSecret) {
    return true;
  }

  return false;
}

// =============================================================================
// ROUTE HANDLERS
// =============================================================================

/**
 * POST handler for the daily intelligence cron job
 */
export async function POST(request: Request): Promise<NextResponse> {
  const startTime = Date.now();
  console.log("[Daily Intelligence] Starting report generation...");

  // Verify request authorization
  if (!verifyRequest(request)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Get recipients
  const recipients = getRecipients();
  if (recipients.length === 0) {
    return NextResponse.json(
      { error: "No email recipients configured" },
      { status: 500 }
    );
  }

  try {
    // Step 1: Extract raw data
    console.log("[Daily Intelligence] Extracting data...");
    const rawData = await extractDailyRawData();
    console.log(
      `[Daily Intelligence] Extracted ${rawData.sessions.length} sessions, ${rawData.conversions.length} conversions`
    );

    // Step 2: Run analysis
    console.log("[Daily Intelligence] Running analysis...");
    const analysis = runFullAnalysis(rawData);
    console.log(
      `[Daily Intelligence] Analysis complete. Avg quality: ${analysis.sessionQuality.avgScore.toFixed(0)}`
    );

    // Step 2.5: Extract Google Ads data (if configured)
    console.log("[Daily Intelligence] Extracting Google Ads data...");
    const googleAds = await extractGoogleAdsMetrics(1);
    if (googleAds) {
      console.log(
        `[Daily Intelligence] Google Ads: $${googleAds.totalSpend.toFixed(2)} spent, ${googleAds.totalClicks} clicks`
      );
    } else {
      console.log("[Daily Intelligence] Google Ads data not available (credentials not configured)");
    }

    // Step 3: Generate AI insights
    console.log("[Daily Intelligence] Generating AI insights...");
    const report = await generateIntelligenceReport(analysis, rawData, googleAds);
    console.log("[Daily Intelligence] AI insights generated");

    // Step 4: Generate email
    const dateStr = new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    const subject = `Rollcog Daily Intelligence - ${dateStr}`;
    const html = generateIntelligenceReportEmail(report);
    const text = generateIntelligenceReportText(report);

    // Step 5: Send email
    console.log(`[Daily Intelligence] Sending to ${recipients.length} recipients...`);
    const emailResult = await sendEmail(recipients, subject, html, text);

    if (!emailResult.success) {
      console.error("[Daily Intelligence] Email send failed:", emailResult.error);
      return NextResponse.json(
        {
          error: "Failed to send email",
          details: emailResult.error,
          report: {
            sessions: rawData.sessions.length,
            conversions: rawData.conversions.length,
            duration: Date.now() - startTime,
          },
        },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    console.log(`[Daily Intelligence] Report sent successfully in ${duration}ms`);

    return NextResponse.json({
      success: true,
      message: "Daily intelligence report sent",
      recipients: recipients.length,
      data: {
        sessions: rawData.sessions.length,
        conversions: rawData.conversions.length,
        avgQuality: analysis.sessionQuality.avgScore,
        conversionRate: analysis.summary.conversionRate,
      },
      duration,
    });
  } catch (error) {
    console.error("[Daily Intelligence] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate report",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET handler for testing/preview
 */
export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const action = url.searchParams.get("action");

  // Health check
  if (action === "health") {
    const [aiTest, googleAdsTest, dataPreview] = await Promise.all([
      testAISynthesis(),
      testGoogleAdsConnection(),
      extractPreviewData().catch((e) => ({
        sessionCount: -1,
        conversionCount: -1,
        topSources: [],
        error: e.message,
      })),
    ]);

    return NextResponse.json({
      status: "ok",
      ai: aiTest,
      googleAds: googleAdsTest,
      data: dataPreview,
      recipients: getRecipients().length,
      env: {
        hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
        hasResendKey: !!process.env.RESEND_API_KEY,
        hasRecipients: !!process.env.ANALYTICS_EMAIL_RECIPIENTS,
        hasCronSecret: !!process.env.CRON_SECRET,
        hasGoogleAdsCredentials: !!(
          process.env.GOOGLE_ADS_CLIENT_ID &&
          process.env.GOOGLE_ADS_CLIENT_SECRET &&
          process.env.GOOGLE_ADS_DEVELOPER_TOKEN &&
          process.env.GOOGLE_ADS_REFRESH_TOKEN &&
          process.env.GOOGLE_ADS_CUSTOMER_ID
        ),
      },
    });
  }

  // Preview mode - generate but don't send
  if (action === "preview") {
    try {
      const rawData = await extractDailyRawData();
      const analysis = runFullAnalysis(rawData);
      const googleAds = await extractGoogleAdsMetrics(1);
      const report = await generateIntelligenceReport(analysis, rawData, googleAds);

      return NextResponse.json({
        success: true,
        report,
        googleAdsAvailable: !!googleAds,
        preview: "Email would be sent to: " + getRecipients().join(", "),
      });
    } catch (error) {
      return NextResponse.json(
        {
          error: "Preview failed",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  }

  // Default: return info
  return NextResponse.json({
    endpoint: "Daily Intelligence Report",
    actions: {
      "GET ?action=health": "Check service health and configuration",
      "GET ?action=preview": "Generate report without sending",
      "POST": "Run full report and send email (requires auth)",
    },
    schedule: "Daily at 8:00 AM CT",
  });
}
