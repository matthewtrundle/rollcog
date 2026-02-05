/**
 * @fileoverview Weekly Performance Summary Email Template
 * @module lib/email/templates/weekly-report
 *
 * Comprehensive weekly analytics report with week-over-week comparisons
 */

import type { AnalysisResults } from "@/lib/analytics/intelligence-engine";
import type { AIInsights } from "@/lib/analytics/ai-synthesis";
import type { GoogleAdsMetrics } from "@/lib/analytics/google-ads";

interface WeeklyReportData {
  weekStart: string;
  weekEnd: string;
  analysis: AnalysisResults;
  insights: AIInsights;
  googleAds: GoogleAdsMetrics | null;
  previousWeek: {
    sessions: number;
    conversions: number;
    pageviews: number;
  } | null;
}

/**
 * Generate HTML email for weekly report
 */
export function generateWeeklyReportEmail(data: WeeklyReportData): string {
  const { weekStart, weekEnd, analysis, insights, googleAds, previousWeek } = data;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatNumber = (num: number) => (num ?? 0).toLocaleString();
  const formatCurrency = (num: number) => `$${(num ?? 0).toFixed(2)}`;
  const formatPercent = (num: number) => `${(num ?? 0).toFixed(1)}%`;

  const calcChange = (current: number, previous: number): string => {
    if (previous === 0) return current > 0 ? "+100%" : "0%";
    const change = ((current - previous) / previous) * 100;
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(1)}%`;
  };

  const getChangeColor = (current: number, previous: number, higherIsBetter: boolean = true): string => {
    if (previous === 0) return "#6b7280";
    const change = ((current - previous) / previous) * 100;
    if (higherIsBetter) {
      return change >= 0 ? "#059669" : "#dc2626";
    }
    return change <= 0 ? "#059669" : "#dc2626";
  };

  const totalSessions = analysis.summary?.totalSessions ?? 0;
  const totalConversions = analysis.summary?.totalConversions ?? 0;
  const conversionRate = analysis.summary?.conversionRate ?? 0;

  // Build Google Ads section
  let googleAdsSection = "";
  if (googleAds) {
    let campaignRows = "";
    googleAds.campaigns.slice(0, 5).forEach((campaign, i) => {
      const bgColor = i % 2 === 0 ? "#f8fafc" : "#fff";
      campaignRows += `
        <tr style="background-color: ${bgColor};">
          <td style="padding: 10px; color: #374151;">${campaign.name}</td>
          <td style="padding: 10px; color: #374151; text-align: right;">${formatCurrency(campaign.spend)}</td>
          <td style="padding: 10px; color: #374151; text-align: right;">${formatNumber(campaign.clicks)}</td>
          <td style="padding: 10px; color: #374151; text-align: right;">${formatPercent(campaign.ctr)}</td>
          <td style="padding: 10px; color: #374151; text-align: right;">${formatCurrency(campaign.cpc)}</td>
        </tr>
      `;
    });

    googleAdsSection = `
      <tr>
        <td style="padding: 0 30px 30px;">
          <h2 style="color: #1e3a5f; margin: 0 0 16px 0; font-size: 20px; border-bottom: 2px solid #f97316; padding-bottom: 8px;">
            Google Ads Weekly Performance
          </h2>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
            <tr>
              <td style="background-color: #fef3c7; padding: 16px; text-align: center; width: 25%; border-radius: 6px 0 0 0;">
                <div style="font-size: 24px; font-weight: 700; color: #92400e;">${formatCurrency(googleAds.totalSpend)}</div>
                <div style="font-size: 12px; color: #92400e;">Total Spend</div>
              </td>
              <td style="background-color: #dbeafe; padding: 16px; text-align: center; width: 25%;">
                <div style="font-size: 24px; font-weight: 700; color: #1e40af;">${formatNumber(googleAds.totalClicks)}</div>
                <div style="font-size: 12px; color: #1e40af;">Clicks</div>
              </td>
              <td style="background-color: #dcfce7; padding: 16px; text-align: center; width: 25%;">
                <div style="font-size: 24px; font-weight: 700; color: #166534;">${formatPercent(googleAds.avgCtr)}</div>
                <div style="font-size: 12px; color: #166534;">CTR</div>
              </td>
              <td style="background-color: #f3e8ff; padding: 16px; text-align: center; width: 25%; border-radius: 0 6px 0 0;">
                <div style="font-size: 24px; font-weight: 700; color: #7c3aed;">${formatCurrency(googleAds.avgCpc)}</div>
                <div style="font-size: 12px; color: #7c3aed;">Avg CPC</div>
              </td>
            </tr>
            <tr>
              <td colspan="4" style="background-color: #f8fafc; padding: 16px; border-radius: 0 0 6px 6px;">
                <div style="font-size: 14px; color: #374151;">
                  <strong>Impressions:</strong> ${formatNumber(googleAds.totalImpressions)} |
                  <strong>Conversions:</strong> ${formatNumber(googleAds.totalConversions)} |
                  <strong>Cost/Conv:</strong> ${googleAds.costPerConversion ? formatCurrency(googleAds.costPerConversion) : "N/A"}
                </div>
              </td>
            </tr>
          </table>
          ${googleAds.campaigns.length > 0 ? `
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-top: 16px; font-size: 13px;">
              <tr style="background-color: #1e3a5f;">
                <td style="padding: 10px; color: #fff; font-weight: 600;">Campaign</td>
                <td style="padding: 10px; color: #fff; font-weight: 600; text-align: right;">Spend</td>
                <td style="padding: 10px; color: #fff; font-weight: 600; text-align: right;">Clicks</td>
                <td style="padding: 10px; color: #fff; font-weight: 600; text-align: right;">CTR</td>
                <td style="padding: 10px; color: #fff; font-weight: 600; text-align: right;">CPC</td>
              </tr>
              ${campaignRows}
            </table>
          ` : ""}
        </td>
      </tr>
    `;
  }

  // Build traffic sources section
  let trafficSourceRows = "";
  const cohorts = analysis.cohorts ?? [];
  cohorts.slice(0, 5).forEach((source, i) => {
    const bgColor = i % 2 === 0 ? "#f8fafc" : "#fff";
    trafficSourceRows += `
      <tr style="background-color: ${bgColor};">
        <td style="padding: 10px; color: #374151;">${source.cohortName || "Direct"}</td>
        <td style="padding: 10px; color: #374151; text-align: center;">${source.sessions ?? 0}</td>
        <td style="padding: 10px; color: #374151; text-align: center;">${source.avgQualityScore ?? 0}/100</td>
        <td style="padding: 10px; color: #374151; text-align: center;">${formatPercent(source.conversionRate ?? 0)}</td>
      </tr>
    `;
  });

  // Build key insights (use keyInsights if available, otherwise fall back to insights array)
  let insightsList = "";
  const keyInsightsArray = insights.keyInsights ?? insights.insights?.map(i => i.observation) ?? [];
  keyInsightsArray.forEach((insight) => {
    insightsList += `<li style="margin-bottom: 8px;">${insight}</li>`;
  });

  // Build recommendations
  let recommendationsList = "";
  const recommendationsArray = insights.recommendations ?? [];
  recommendationsArray.forEach((rec) => {
    recommendationsList += `<li style="margin-bottom: 8px;">${rec}</li>`;
  });

  // Week-over-week comparison
  let wowComparison = "";
  if (previousWeek) {
    wowComparison = `
      <div style="font-size: 14px; font-weight: 600; margin-top: 8px; color: ${getChangeColor(totalSessions, previousWeek.sessions)};">
        ${calcChange(totalSessions, previousWeek.sessions)} vs last week
      </div>
    `;
  }

  let convWowComparison = "";
  if (previousWeek) {
    convWowComparison = `
      <div style="font-size: 14px; font-weight: 600; margin-top: 8px; color: ${getChangeColor(totalConversions, previousWeek.conversions)};">
        ${calcChange(totalConversions, previousWeek.conversions)} vs last week
      </div>
    `;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Weekly Performance Summary</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <tr>
                <td style="background-color: #1e3a5f; padding: 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0 0 8px 0; font-size: 28px; font-weight: 700;">
                    📊 Weekly Performance Summary
                  </h1>
                  <p style="color: #94a3b8; margin: 0; font-size: 16px;">
                    ${formatDate(weekStart)} - ${formatDate(weekEnd)}
                  </p>
                </td>
              </tr>

              <!-- Executive Summary -->
              <tr>
                <td style="padding: 30px;">
                  <h2 style="color: #1e3a5f; margin: 0 0 16px 0; font-size: 20px; border-bottom: 2px solid #f97316; padding-bottom: 8px;">
                    Executive Summary
                  </h2>
                  <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0; background-color: #f8fafc; padding: 16px; border-radius: 6px; border-left: 4px solid #f97316;">
                    ${insights.executiveSummary ?? "Weekly performance summary data collected. See detailed metrics below."}
                  </p>
                </td>
              </tr>

              <!-- Week-over-Week Metrics -->
              <tr>
                <td style="padding: 0 30px 30px;">
                  <h2 style="color: #1e3a5f; margin: 0 0 16px 0; font-size: 20px; border-bottom: 2px solid #f97316; padding-bottom: 8px;">
                    Week-over-Week Performance
                  </h2>
                  <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                    <tr>
                      <td style="background-color: #f8fafc; padding: 20px; text-align: center; width: 33%; border-radius: 6px 0 0 6px;">
                        <div style="font-size: 32px; font-weight: 700; color: #1e3a5f;">${formatNumber(totalSessions)}</div>
                        <div style="font-size: 13px; color: #6b7280; margin-top: 4px;">Sessions</div>
                        ${wowComparison}
                      </td>
                      <td style="background-color: #f8fafc; padding: 20px; text-align: center; width: 33%; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb;">
                        <div style="font-size: 32px; font-weight: 700; color: #059669;">${formatNumber(totalConversions)}</div>
                        <div style="font-size: 13px; color: #6b7280; margin-top: 4px;">Conversions</div>
                        ${convWowComparison}
                      </td>
                      <td style="background-color: #f8fafc; padding: 20px; text-align: center; width: 33%; border-radius: 0 6px 6px 0;">
                        <div style="font-size: 32px; font-weight: 700; color: #f97316;">${formatPercent(conversionRate)}</div>
                        <div style="font-size: 13px; color: #6b7280; margin-top: 4px;">Conversion Rate</div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Google Ads Section -->
              ${googleAdsSection}

              <!-- Key Insights -->
              <tr>
                <td style="padding: 0 30px 30px;">
                  <h2 style="color: #1e3a5f; margin: 0 0 16px 0; font-size: 20px; border-bottom: 2px solid #f97316; padding-bottom: 8px;">
                    Key Insights This Week
                  </h2>
                  <ul style="margin: 0; padding: 0 0 0 20px; color: #374151; font-size: 14px; line-height: 1.8;">
                    ${insightsList}
                  </ul>
                </td>
              </tr>

              <!-- Traffic Sources -->
              ${cohorts.length > 0 ? `
                <tr>
                  <td style="padding: 0 30px 30px;">
                    <h2 style="color: #1e3a5f; margin: 0 0 16px 0; font-size: 20px; border-bottom: 2px solid #f97316; padding-bottom: 8px;">
                      Traffic Source Performance
                    </h2>
                    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; font-size: 13px;">
                      <tr style="background-color: #1e3a5f;">
                        <td style="padding: 10px; color: #fff; font-weight: 600;">Source</td>
                        <td style="padding: 10px; color: #fff; font-weight: 600; text-align: center;">Sessions</td>
                        <td style="padding: 10px; color: #fff; font-weight: 600; text-align: center;">Avg Quality</td>
                        <td style="padding: 10px; color: #fff; font-weight: 600; text-align: center;">Conv Rate</td>
                      </tr>
                      ${trafficSourceRows}
                    </table>
                  </td>
                </tr>
              ` : ""}

              <!-- Recommendations -->
              <tr>
                <td style="padding: 0 30px 30px;">
                  <h2 style="color: #1e3a5f; margin: 0 0 16px 0; font-size: 20px; border-bottom: 2px solid #f97316; padding-bottom: 8px;">
                    Recommendations for Next Week
                  </h2>
                  <ul style="margin: 0; padding: 0 0 0 20px; color: #374151; font-size: 14px; line-height: 1.8;">
                    ${recommendationsList}
                  </ul>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #1e3a5f; padding: 20px 30px; text-align: center;">
                  <p style="color: #94a3b8; margin: 0; font-size: 13px;">
                    Weekly Performance Summary | Rollcog Roofs
                  </p>
                  <p style="color: #64748b; margin: 8px 0 0 0; font-size: 11px;">
                    Powered by AI Analytics
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

/**
 * Generate plain text version of weekly report
 */
export function generateWeeklyReportText(data: WeeklyReportData): string {
  const { weekStart, weekEnd, analysis, insights, googleAds, previousWeek } = data;

  const lines: string[] = [];

  lines.push("═".repeat(50));
  lines.push("WEEKLY PERFORMANCE SUMMARY");
  lines.push(`${weekStart} - ${weekEnd}`);
  lines.push("═".repeat(50));
  lines.push("");

  lines.push("EXECUTIVE SUMMARY");
  lines.push("-".repeat(30));
  lines.push(insights.executiveSummary ?? "Weekly performance summary data collected. See detailed metrics below.");
  lines.push("");

  lines.push("WEEK-OVER-WEEK METRICS");
  lines.push("-".repeat(30));
  lines.push(`Sessions: ${analysis.summary?.totalSessions ?? 0}`);
  lines.push(`Conversions: ${analysis.summary?.totalConversions ?? 0}`);
  lines.push(`Conversion Rate: ${(analysis.summary?.conversionRate ?? 0).toFixed(1)}%`);
  if (previousWeek) {
    const currentSessions = analysis.summary?.totalSessions ?? 0;
    const sessChange = previousWeek.sessions > 0
      ? ((currentSessions - previousWeek.sessions) / previousWeek.sessions * 100).toFixed(1)
      : "N/A";
    lines.push(`vs Last Week: ${sessChange}% sessions`);
  }
  lines.push("");

  if (googleAds) {
    lines.push("GOOGLE ADS PERFORMANCE");
    lines.push("-".repeat(30));
    lines.push(`Total Spend: $${googleAds.totalSpend.toFixed(2)}`);
    lines.push(`Clicks: ${googleAds.totalClicks}`);
    lines.push(`Impressions: ${googleAds.totalImpressions}`);
    lines.push(`CTR: ${googleAds.avgCtr.toFixed(2)}%`);
    lines.push(`Avg CPC: $${googleAds.avgCpc.toFixed(2)}`);
    lines.push(`Conversions: ${googleAds.totalConversions}`);
    if (googleAds.costPerConversion) {
      lines.push(`Cost/Conversion: $${googleAds.costPerConversion.toFixed(2)}`);
    }
    lines.push("");
  }

  lines.push("KEY INSIGHTS");
  lines.push("-".repeat(30));
  const textKeyInsights = insights.keyInsights ?? insights.insights?.map(i => i.observation) ?? [];
  textKeyInsights.forEach((insight) => {
    lines.push(`• ${insight}`);
  });
  lines.push("");

  lines.push("RECOMMENDATIONS");
  lines.push("-".repeat(30));
  const textRecommendations = insights.recommendations ?? [];
  textRecommendations.forEach((rec) => {
    lines.push(`• ${rec}`);
  });
  lines.push("");

  lines.push("═".repeat(50));
  lines.push("Rollcog Roofs | Weekly Performance Summary");

  return lines.join("\n");
}
