/**
 * @fileoverview AI synthesis layer using Claude to generate intelligence reports
 * @module lib/analytics/ai-synthesis
 *
 * Feeds structured analysis to Claude and generates:
 * - Executive summary
 * - Key insights
 * - Action recommendations
 * - Risk/opportunity flags
 */

import Anthropic from "@anthropic-ai/sdk";
import type { AnalysisResults } from "./intelligence-engine";
import type { DailyRawData } from "./data-extraction";
import type { GoogleAdsMetrics } from "./google-ads";

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface AIInsights {
  executiveSummary: string;
  // Balanced analysis sections
  whatsWorking: string[];
  needsMonitoring: string[];
  needsAttention: string[];
  // Detailed insights with reasoning
  insights: Array<{
    observation: string;
    reason: string;
    metric?: string;
  }>;
  // Traffic source analysis
  trafficSourceInsights: string[];
  // Actionable items
  recommendations: string[];
  // Interesting facts
  interestingFacts: string[];
  // Weekly report key insights (optional - used by weekly summary)
  keyInsights?: string[];
}

export interface IntelligenceReport {
  date: string;
  aiInsights: AIInsights;
  analysis: AnalysisResults;
  rawData: {
    sessionCount: number;
    conversionCount: number;
    periodStart: string;
    periodEnd: string;
  };
  googleAds: GoogleAdsMetrics | null;
}

// =============================================================================
// AI SYNTHESIS FUNCTIONS
// =============================================================================

/**
 * Create a simplified prompt for Claude when rawData is not available
 */
function buildDefaultPrompt(
  analysis: AnalysisResults,
  googleAds: GoogleAdsMetrics | null
): string {
  return buildAnalysisPrompt(analysis, null, googleAds);
}

/**
 * Create the prompt for Claude to analyze the data
 */
function buildAnalysisPrompt(
  analysis: AnalysisResults,
  _rawData: DailyRawData | null,
  googleAds: GoogleAdsMetrics | null
): string {
  const {
    funnel,
    sessionQuality,
    anomalies,
    conversionPaths,
    cohorts,
    contentEffectiveness,
    highIntentSessions,
    summary,
  } = analysis;

  return `You are an expert analytics consultant analyzing website performance data for Rollcog Roofs, a commercial roofing company in Chicago. Generate actionable business intelligence from this data.

## TODAY'S PERFORMANCE SUMMARY
- Total Sessions: ${summary.totalSessions}
- Total Conversions: ${summary.totalConversions} (form submissions or phone clicks)
- Conversion Rate: ${summary.conversionRate.toFixed(2)}%

## COMPARISON TO BENCHMARKS
- vs Yesterday: Sessions ${summary.vsYesterday.sessions > 0 ? "+" : ""}${summary.vsYesterday.sessions.toFixed(1)}%, Conversions ${summary.vsYesterday.conversions > 0 ? "+" : ""}${summary.vsYesterday.conversions.toFixed(1)}%
- vs Same Day Last Week: Sessions ${summary.vsWeekAgo.sessions > 0 ? "+" : ""}${summary.vsWeekAgo.sessions.toFixed(1)}%, Conversions ${summary.vsWeekAgo.conversions > 0 ? "+" : ""}${summary.vsWeekAgo.conversions.toFixed(1)}%
- vs 30-Day Baseline: Sessions ${summary.vsBaseline.sessions > 0 ? "+" : ""}${summary.vsBaseline.sessions.toFixed(1)}%, Rate ${summary.vsBaseline.rate > 0 ? "+" : ""}${summary.vsBaseline.rate.toFixed(2)}pp

## FUNNEL ANALYSIS
${funnel.stages
  .map(
    (s) =>
      `- ${s.name}: ${s.count} (${s.percentage.toFixed(1)}% of total, ${s.dropOffRate.toFixed(1)}% drop-off)`
  )
  .join("\n")}
${funnel.biggestDropOff ? `\nBiggest drop-off: ${funnel.biggestDropOff.stage} at ${funnel.biggestDropOff.rate.toFixed(1)}%` : ""}
${funnel.insights.length > 0 ? `\nFunnel Insights:\n${funnel.insights.map((i) => `- ${i}`).join("\n")}` : ""}

## SESSION QUALITY DISTRIBUTION
- Average Quality Score: ${sessionQuality.avgScore.toFixed(0)}/100
- Distribution: Low (${sessionQuality.distribution.low}), Medium (${sessionQuality.distribution.medium}), High (${sessionQuality.distribution.high}), Very High (${sessionQuality.distribution.very_high})

## DETECTED ANOMALIES
${anomalies.length > 0 ? anomalies.map((a) => `- [${a.severity.toUpperCase()}] ${a.message}`).join("\n") : "No significant anomalies detected"}

## TOP CONVERSION PATHS
${conversionPaths.slice(0, 5).map((p) => `- ${p.path} (${p.count} conversions, ${p.percentage.toFixed(1)}%)`).join("\n") || "No conversion data available"}

## TRAFFIC SOURCE PERFORMANCE
${cohorts
  .slice(0, 5)
  .map(
    (c) =>
      `- ${c.cohortName}: ${c.sessions} sessions, ${c.conversionRate.toFixed(1)}% conv rate, ${c.avgPagesPerSession} avg pages, Quality: ${c.avgQualityScore}/100`
  )
  .join("\n")}

## CONTENT EFFECTIVENESS (Top Pages)
${contentEffectiveness
  .slice(0, 5)
  .map(
    (c) =>
      `- ${c.page}: ${c.views} views, ${c.conversionAssist.toFixed(1)}% conversion assist, ${c.bounceRate.toFixed(1)}% bounce, Role: ${c.role}`
  )
  .join("\n")}

## HIGH-INTENT SESSIONS THAT DIDN'T CONVERT
${highIntentSessions
  .slice(0, 5)
  .map(
    (h) =>
      `- ${h.source} visitor from ${h.location || "Unknown"}: Score ${h.qualityScore}, ${h.pagesViewed} pages, stopped at ${h.stoppedAt || "unknown"}`
  )
  .join("\n") || "None identified"}

${googleAds ? `
## GOOGLE ADS PERFORMANCE
- Total Spend: $${googleAds.totalSpend.toFixed(2)} (${googleAds.spendChange > 0 ? "+" : ""}${googleAds.spendChange.toFixed(1)}% vs previous period)
- Clicks: ${googleAds.totalClicks} (${googleAds.clicksChange > 0 ? "+" : ""}${googleAds.clicksChange.toFixed(1)}% vs previous)
- Impressions: ${googleAds.totalImpressions.toLocaleString()} (${googleAds.impressionsChange > 0 ? "+" : ""}${googleAds.impressionsChange.toFixed(1)}% vs previous)
- CTR: ${googleAds.avgCtr.toFixed(2)}%
- Avg CPC: $${googleAds.avgCpc.toFixed(2)}
- Conversions: ${googleAds.totalConversions}${googleAds.costPerConversion ? ` (Cost per conversion: $${googleAds.costPerConversion.toFixed(2)})` : ""}

### Campaign Breakdown
${googleAds.campaigns.slice(0, 5).map((c) =>
  `- ${c.name}: $${c.spend.toFixed(2)} spend, ${c.clicks} clicks, ${c.impressions.toLocaleString()} impressions, ${c.ctr.toFixed(2)}% CTR${c.conversions > 0 ? `, ${c.conversions} conversions` : ""}`
).join("\n")}
` : "## GOOGLE ADS\nNo Google Ads data available for this period."}

---

Based on this data, provide a balanced, neutral JSON analysis with the following structure:
{
  "executiveSummary": "3-4 sentences with a neutral, professional tone summarizing today's performance. Include key numbers and context. Avoid alarmist language - focus on facts.",

  "whatsWorking": ["2-4 positive observations about traffic, engagement, or content that show healthy performance or improvement"],

  "needsMonitoring": ["2-3 metrics or trends that aren't problems yet but should be watched. These are yellow flags, not red flags."],

  "needsAttention": ["1-3 items that require action. Only include if there are genuine issues - don't manufacture problems."],

  "insights": [
    {
      "observation": "What the data shows",
      "reason": "Why this is happening or what it likely means",
      "metric": "The specific number or percentage (optional)"
    }
  ],

  "trafficSourceInsights": ["2-3 observations about where traffic is coming from (UTM sources, referrers, direct vs paid). Include which sources have best quality/conversion rates."],

  "recommendations": ["2-4 specific, actionable next steps based on the data. Be practical - consider this is a small business."],

  "interestingFacts": ["1-3 notable or surprising findings from the data that might not fit other categories. These add color to the report."]
}

Important guidelines:
- NEUTRAL TONE: Be balanced and factual. Don't catastrophize or over-celebrate.
- NEVER ASSUME BROKEN: Do NOT suggest forms, tracking, or site features are "broken" or have "issues" based on low numbers alone. Low conversions, 0% rates, or drop-offs are normal patterns - they don't indicate technical problems. The site and forms work correctly.
- CONTEXT MATTERS: 0 conversions might be normal for a B2B site on a slow day. Acknowledge when data is limited.
- BE SPECIFIC: Always cite actual numbers. "Traffic is up 15%" not "Traffic increased."
- EXPLAIN WHY: For insights, always provide a likely reason or hypothesis based on user behavior, not technical issues.
- TRAFFIC SOURCES: Pay special attention to utm_source data - this shows if Google Ads, organic, or direct is performing best.
- GOOGLE ADS: When Google Ads data is available, analyze spend efficiency, CTR trends, and cost per conversion. Compare paid traffic quality vs organic. Highlight which campaigns are performing best.
- QUALITY OVER QUANTITY: For B2B commercial roofing, a few high-quality sessions are better than many low-quality ones.
- PRACTICAL: Recommendations should be things a small marketing team can actually do.
- If there's insufficient data, say so rather than making up insights.

Respond with ONLY the JSON object, no additional text.`;
}

/**
 * Call Claude API to synthesize insights
 * @param analysis - Analysis results from the intelligence engine
 * @param googleAds - Google Ads metrics (optional)
 * @param customPrompt - Optional custom prompt to override the default
 */
export async function synthesizeInsights(
  analysis: AnalysisResults,
  googleAds: GoogleAdsMetrics | null = null,
  customPrompt?: string
): Promise<AIInsights> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY not configured");
    return getDefaultInsights(analysis);
  }

  const anthropic = new Anthropic({ apiKey });
  // Use custom prompt if provided, otherwise build default prompt
  // Note: buildAnalysisPrompt requires rawData which we may not have for weekly reports
  const prompt = customPrompt || buildDefaultPrompt(analysis, googleAds);

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Extract text content from response
    const textContent = message.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      console.error("No text content in Claude response");
      return getDefaultInsights(analysis);
    }

    // Parse JSON response
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("Could not parse JSON from Claude response");
      return getDefaultInsights(analysis);
    }

    const parsed = JSON.parse(jsonMatch[0]) as AIInsights;

    // Validate required fields
    if (!parsed.executiveSummary) {
      console.error("Invalid response structure from Claude");
      return getDefaultInsights(analysis);
    }

    return {
      executiveSummary: parsed.executiveSummary,
      whatsWorking: parsed.whatsWorking || [],
      needsMonitoring: parsed.needsMonitoring || [],
      needsAttention: parsed.needsAttention || [],
      insights: parsed.insights || [],
      trafficSourceInsights: parsed.trafficSourceInsights || [],
      recommendations: parsed.recommendations || [],
      interestingFacts: parsed.interestingFacts || [],
      keyInsights: parsed.keyInsights || undefined,
    };
  } catch (error) {
    console.error("Error calling Claude API:", error);
    return getDefaultInsights(analysis);
  }
}

/**
 * Generate default insights when AI is unavailable
 */
function getDefaultInsights(analysis: AnalysisResults): AIInsights {
  const { summary, anomalies, funnel, highIntentSessions, cohorts } = analysis;

  // Build basic executive summary
  let executiveSummary = `Today saw ${summary.totalSessions} sessions with ${summary.totalConversions} conversions (${summary.conversionRate.toFixed(1)}% conversion rate).`;

  if (summary.vsYesterday.sessions !== 0) {
    const direction = summary.vsYesterday.sessions > 0 ? "up" : "down";
    executiveSummary += ` Traffic is ${direction} ${Math.abs(summary.vsYesterday.sessions).toFixed(0)}% compared to yesterday.`;
  }

  if (summary.vsBaseline.rate !== 0) {
    const direction = summary.vsBaseline.rate > 0 ? "above" : "below";
    executiveSummary += ` Conversion rate is ${Math.abs(summary.vsBaseline.rate).toFixed(2)}pp ${direction} the 30-day average.`;
  }

  // What's working
  const whatsWorking: string[] = [];
  if (summary.vsYesterday.sessions > 0) {
    whatsWorking.push(`Traffic up ${summary.vsYesterday.sessions.toFixed(0)}% vs yesterday`);
  }
  if (summary.vsBaseline.rate > 0) {
    whatsWorking.push(`Conversion rate above 30-day baseline by ${summary.vsBaseline.rate.toFixed(2)}pp`);
  }
  if (cohorts.length > 0) {
    const bestCohort = cohorts.reduce((best, c) =>
      c.conversionRate > best.conversionRate ? c : best
    );
    if (bestCohort.conversionRate > 0) {
      whatsWorking.push(`${bestCohort.cohortName} traffic converting at ${bestCohort.conversionRate.toFixed(1)}%`);
    }
  }
  if (whatsWorking.length === 0) {
    whatsWorking.push("Site is operational and receiving traffic");
  }

  // Needs monitoring (yellow flags)
  const needsMonitoring: string[] = [];
  const infoAnomalies = anomalies.filter((a) => a.severity === "info");
  infoAnomalies.forEach((a) => needsMonitoring.push(a.message));
  if (funnel.biggestDropOff && funnel.biggestDropOff.rate > 30 && funnel.biggestDropOff.rate < 60) {
    needsMonitoring.push(`${funnel.biggestDropOff.stage} stage has ${funnel.biggestDropOff.rate.toFixed(0)}% drop-off`);
  }
  if (needsMonitoring.length === 0) {
    needsMonitoring.push("No immediate concerns - continue monitoring standard metrics");
  }

  // Needs attention (red flags)
  const needsAttention: string[] = [];
  const criticalAnomalies = anomalies.filter((a) => a.severity === "critical" || a.severity === "warning");
  criticalAnomalies.forEach((a) => needsAttention.push(a.message));
  if (funnel.biggestDropOff && funnel.biggestDropOff.rate > 60) {
    needsAttention.push(`High drop-off at ${funnel.biggestDropOff.stage} stage (${funnel.biggestDropOff.rate.toFixed(0)}%)`);
  }
  if (summary.vsBaseline.sessions < -30) {
    needsAttention.push(`Significant traffic decline: ${summary.vsBaseline.sessions.toFixed(0)}% below baseline`);
  }

  // Detailed insights with reasoning
  const insights: Array<{ observation: string; reason: string; metric?: string }> = [];

  if (funnel.biggestDropOff) {
    insights.push({
      observation: `Biggest funnel drop-off at ${funnel.biggestDropOff.stage}`,
      reason: "Users may be finding what they need or encountering friction at this stage",
      metric: `${funnel.biggestDropOff.rate.toFixed(0)}% exit rate`,
    });
  }

  if (highIntentSessions.length > 0) {
    insights.push({
      observation: `${highIntentSessions.length} high-intent sessions didn't convert`,
      reason: "These visitors showed strong engagement signals but left - potential retargeting candidates",
      metric: `${highIntentSessions.length} sessions`,
    });
  }

  // Traffic source insights
  const trafficSourceInsights: string[] = [];
  if (cohorts.length > 0) {
    const sortedCohorts = [...cohorts].sort((a, b) => b.sessions - a.sessions);
    sortedCohorts.slice(0, 3).forEach((c) => {
      trafficSourceInsights.push(
        `${c.cohortName}: ${c.sessions} sessions, ${c.conversionRate.toFixed(1)}% conversion, quality score ${c.avgQualityScore}/100`
      );
    });
  }
  if (trafficSourceInsights.length === 0) {
    trafficSourceInsights.push("Limited traffic source data available for analysis");
  }

  // Build recommendations
  const recommendations: string[] = [];

  if (funnel.biggestDropOff && funnel.biggestDropOff.rate > 50) {
    recommendations.push(
      `Review the ${funnel.biggestDropOff.stage.toLowerCase()} stage for potential friction points`
    );
  }

  if (highIntentSessions.length > 3) {
    recommendations.push(
      `Consider retargeting the ${highIntentSessions.length} high-intent visitors who didn't convert`
    );
  }

  recommendations.push(
    "Continue monitoring conversion rates by traffic source to optimize marketing spend"
  );

  // Interesting facts
  const interestingFacts: string[] = [];
  if (summary.totalSessions > 0) {
    interestingFacts.push(`Average session quality score: ${analysis.sessionQuality.avgScore.toFixed(0)}/100`);
  }
  if (analysis.conversionPaths.length > 0) {
    const topPath = analysis.conversionPaths[0];
    interestingFacts.push(`Most common conversion path: ${topPath.path}`);
  }

  return {
    executiveSummary,
    whatsWorking,
    needsMonitoring,
    needsAttention,
    insights,
    trafficSourceInsights,
    recommendations,
    interestingFacts,
  };
}

/**
 * Generate the complete intelligence report
 */
export async function generateIntelligenceReport(
  analysis: AnalysisResults,
  rawData: DailyRawData,
  googleAds: GoogleAdsMetrics | null = null
): Promise<IntelligenceReport> {
  // Build the standard analysis prompt using rawData
  const prompt = buildAnalysisPrompt(analysis, rawData, googleAds);
  const aiInsights = await synthesizeInsights(analysis, googleAds, prompt);

  return {
    date: new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    aiInsights,
    analysis,
    rawData: {
      sessionCount: rawData.sessions.length,
      conversionCount: rawData.conversions.length,
      periodStart: rawData.periodStart.toISOString(),
      periodEnd: rawData.periodEnd.toISOString(),
    },
    googleAds,
  };
}

/**
 * Utility to test AI synthesis with sample data
 */
export async function testAISynthesis(): Promise<{
  success: boolean;
  message: string;
}> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      message: "ANTHROPIC_API_KEY not configured",
    };
  }

  try {
    const anthropic = new Anthropic({ apiKey });
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 100,
      messages: [
        {
          role: "user",
          content: 'Reply with exactly: {"status": "ok"}',
        },
      ],
    });

    const textContent = message.content.find((c) => c.type === "text");
    if (textContent && textContent.type === "text" && textContent.text.includes("ok")) {
      return {
        success: true,
        message: "Claude API connection successful",
      };
    }

    return {
      success: false,
      message: "Unexpected response from Claude API",
    };
  } catch (error) {
    return {
      success: false,
      message: `Claude API error: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}
