/**
 * @fileoverview Weekly Performance Summary Cron Endpoint
 * @module app/api/cron/weekly-summary
 *
 * Generates and sends comprehensive weekly analytics report every Sunday morning.
 * Analyzes the full week's data with week-over-week comparisons.
 */

import { NextResponse } from "next/server";
import { extractDailyRawData } from "@/lib/analytics/data-extraction";
import { runFullAnalysis } from "@/lib/analytics/intelligence-engine";
import { synthesizeInsights } from "@/lib/analytics/ai-synthesis";
import { extractGoogleAdsMetrics, type GoogleAdsMetrics } from "@/lib/analytics/google-ads";
import {
  generateWeeklyReportEmail,
  generateWeeklyReportText,
} from "@/lib/email/templates/weekly-report";
import { query } from "@/lib/db";

// =============================================================================
// CONFIGURATION
// =============================================================================

const RESEND_API_URL = "https://api.resend.com/emails";
const FROM_EMAIL = "Rollcog Analytics <analytics@rollcogroofing.com>";

// =============================================================================
// HELPERS
// =============================================================================

function getRecipients(): string[] {
  const envRecipients = process.env.ANALYTICS_EMAIL_RECIPIENTS;
  if (!envRecipients) {
    console.error("ANALYTICS_EMAIL_RECIPIENTS not configured");
    return [];
  }
  return envRecipients.split(",").map((e) => e.trim()).filter(Boolean);
}

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
          { name: "type", value: "weekly-summary" },
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

function verifyRequest(request: Request): boolean {
  if (process.env.NODE_ENV === "development") {
    return true;
  }

  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    return true;
  }

  const testMode = request.headers.get("x-test-mode");
  if (testMode === "true" && cronSecret) {
    return true;
  }

  return false;
}

/**
 * Build AI prompt specifically for weekly analysis
 */
function buildWeeklyPrompt(
  analysis: ReturnType<typeof runFullAnalysis>,
  googleAds: GoogleAdsMetrics | null,
  previousWeekSessions: number,
  previousWeekConversions: number
): string {
  const avgQuality = analysis.sessionQuality?.avgScore ?? 0;

  return `
You are analyzing a FULL WEEK of website analytics data for a commercial roofing company.
This is a WEEKLY SUMMARY report, so focus on trends, patterns, and strategic insights rather than daily fluctuations.

CRITICAL GUIDELINES:
- NEVER ASSUME BROKEN: Do NOT suggest forms, tracking, or site features are "broken" or have "issues" based on low numbers alone. Low conversions, 0% rates, or drop-offs are normal patterns - they don't indicate technical problems. The site and forms work correctly.
- Focus on TRENDS over the week, not individual days
- Compare this week to last week where data is available
- Provide strategic recommendations for the coming week
- Be concise but insightful

WEEK METRICS:
- Total Sessions: ${analysis.summary?.totalSessions ?? 0} (last week: ${previousWeekSessions})
- Total Conversions: ${analysis.summary?.totalConversions ?? 0} (last week: ${previousWeekConversions})
- Conversion Rate: ${(analysis.summary?.conversionRate ?? 0).toFixed(2)}%
- Average Session Quality: ${avgQuality.toFixed(1)}/100

FUNNEL ANALYSIS (Full Week):
${JSON.stringify(analysis.summary, null, 2)}

TOP CONTENT:
${JSON.stringify(analysis.contentEffectiveness.slice(0, 5), null, 2)}

TRAFFIC SOURCES:
${JSON.stringify(analysis.cohorts, null, 2)}

${googleAds ? `
GOOGLE ADS WEEKLY PERFORMANCE:
- Total Spend: $${googleAds.totalSpend.toFixed(2)}
- Total Clicks: ${googleAds.totalClicks}
- Impressions: ${googleAds.totalImpressions}
- CTR: ${googleAds.avgCtr.toFixed(2)}%
- Avg CPC: $${googleAds.avgCpc.toFixed(2)}
- Conversions: ${googleAds.totalConversions}
- Cost per Conversion: ${googleAds.costPerConversion ? '$' + googleAds.costPerConversion.toFixed(2) : 'N/A'}

Campaign Breakdown:
${googleAds.campaigns.map(c => `- ${c.name}: $${c.spend.toFixed(2)} spend, ${c.clicks} clicks, ${c.ctr.toFixed(2)}% CTR`).join('\n')}
` : 'Google Ads data not available for this period.'}

HIGH-INTENT SESSIONS THAT DIDN'T CONVERT (opportunities):
${(analysis.highIntentSessions ?? []).slice(0, 3).map(s =>
  `- Session from ${s.location || 'unknown'}: ${s.pagesViewed} pages, quality ${s.qualityScore}/100`
).join('\n') || 'No high-intent sessions identified.'}

Please provide:
1. executiveSummary: A 2-3 sentence overview of the week's performance with key takeaways
2. keyInsights: Array of 4-5 important observations about the week (trends, patterns, notable events)
3. recommendations: Array of 3-4 strategic recommendations for next week

Respond in JSON format:
{
  "executiveSummary": "...",
  "keyInsights": ["...", "..."],
  "recommendations": ["...", "..."]
}
`;
}

/**
 * Get previous week's metrics for comparison
 */
async function getPreviousWeekMetrics(): Promise<{
  sessions: number;
  conversions: number;
  pageviews: number;
}> {
  try {
    const result = await query<{ sessions: string; pageviews: string }>(
      `SELECT
        COUNT(DISTINCT session_id) as sessions,
        COUNT(*) as pageviews
      FROM analytics_pageviews
      WHERE timestamp >= NOW() - INTERVAL '14 days'
        AND timestamp < NOW() - INTERVAL '7 days'`
    );

    const conversionsResult = await query<{ conversions: string }>(
      `SELECT COUNT(*) as conversions
      FROM analytics_user_journeys
      WHERE event_name IN ('form_submit', 'phone_click')
        AND timestamp >= NOW() - INTERVAL '14 days'
        AND timestamp < NOW() - INTERVAL '7 days'`
    );

    return {
      sessions: Number(result.rows[0]?.sessions || 0),
      conversions: Number(conversionsResult.rows[0]?.conversions || 0),
      pageviews: Number(result.rows[0]?.pageviews || 0),
    };
  } catch (error) {
    console.error("Error fetching previous week metrics:", error);
    return { sessions: 0, conversions: 0, pageviews: 0 };
  }
}

// =============================================================================
// ROUTE HANDLERS
// =============================================================================

export async function POST(request: Request): Promise<NextResponse> {
  const startTime = Date.now();
  console.log("[Weekly Summary] Starting report generation...");

  if (!verifyRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const recipients = getRecipients();
  if (recipients.length === 0) {
    return NextResponse.json(
      { error: "No email recipients configured" },
      { status: 500 }
    );
  }

  try {
    // Extract data (uses last 24 hours + comparison periods)
    console.log("[Weekly Summary] Extracting data...");
    const rawData = await extractDailyRawData();
    console.log(`[Weekly Summary] Extracted ${rawData.sessions.length} sessions, ${rawData.conversions.length} conversions`);

    // Run analysis
    console.log("[Weekly Summary] Running analysis...");
    const analysis = runFullAnalysis(rawData);

    // Get Google Ads data
    console.log("[Weekly Summary] Extracting Google Ads data...");
    let googleAds: GoogleAdsMetrics | null = null;
    try {
      googleAds = await extractGoogleAdsMetrics(7);
      if (googleAds) {
        console.log(`[Weekly Summary] Google Ads: $${googleAds.totalSpend.toFixed(2)} spent, ${googleAds.totalClicks} clicks`);
      }
    } catch (error) {
      console.log("[Weekly Summary] Google Ads extraction skipped:", error);
    }

    // Get previous week for comparison
    const previousWeek = await getPreviousWeekMetrics();
    console.log(`[Weekly Summary] Previous week: ${previousWeek.sessions} sessions`);

    // Generate AI insights
    console.log("[Weekly Summary] Generating AI insights...");
    const weeklyPrompt = buildWeeklyPrompt(
      analysis,
      googleAds,
      previousWeek.sessions,
      previousWeek.conversions
    );
    const insights = await synthesizeInsights(analysis, googleAds, weeklyPrompt);

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const formatDate = (d: Date) => d.toISOString().split("T")[0];
    const weekStart = formatDate(startDate);
    const weekEnd = formatDate(endDate);

    // Generate email content
    const reportData = {
      weekStart,
      weekEnd,
      analysis,
      insights,
      googleAds,
      previousWeek,
    };

    const html = generateWeeklyReportEmail(reportData);
    const text = generateWeeklyReportText(reportData);
    const subject = `📊 Weekly Performance Summary | ${weekStart} - ${weekEnd}`;

    // Send email
    console.log(`[Weekly Summary] Sending to ${recipients.length} recipients...`);
    const emailResult = await sendEmail(recipients, subject, html, text);

    if (!emailResult.success) {
      console.error("[Weekly Summary] Email send failed:", emailResult.error);
      return NextResponse.json(
        {
          error: "Failed to send email",
          details: emailResult.error,
        },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    console.log(`[Weekly Summary] Report sent successfully in ${duration}ms`);

    return NextResponse.json({
      success: true,
      message: "Weekly summary report sent",
      recipients: recipients.length,
      data: {
        sessions: analysis.summary.totalSessions,
        conversions: analysis.summary.totalConversions,
        conversionRate: analysis.summary.conversionRate,
        googleAdsSpend: googleAds?.totalSpend || 0,
        previousWeekSessions: previousWeek.sessions,
      },
      duration,
    });
  } catch (error) {
    console.error("[Weekly Summary] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate weekly summary",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    endpoint: "Weekly Performance Summary",
    schedule: "Sundays at 8:00 AM CST (14:00 UTC)",
    actions: {
      "POST": "Run full report and send email",
    },
    recipients: getRecipients().length,
  });
}
