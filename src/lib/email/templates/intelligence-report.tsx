/**
 * @fileoverview Daily analytics intelligence report email template
 * @module lib/email/templates/intelligence-report
 *
 * Professional HTML email template for the daily analytics intelligence report.
 * Matches the existing Rollcog email design patterns.
 */

import { COMPANY } from "@/lib/utils/constants";
import type { IntelligenceReport } from "@/lib/analytics/ai-synthesis";

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function formatChange(value: number): string {
  if (value > 0) return `<span style="color: #16a34a;">+${value.toFixed(1)}%</span>`;
  if (value < 0) return `<span style="color: #dc2626;">${value.toFixed(1)}%</span>`;
  return `<span style="color: #6b7280;">0%</span>`;
}

// =============================================================================
// MAIN EMAIL TEMPLATE
// =============================================================================

export function generateIntelligenceReportEmail(
  report: IntelligenceReport
): string {
  const { date, aiInsights, analysis } = report;
  const { summary, funnel, cohorts, highIntentSessions, contentEffectiveness } =
    analysis;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daily Intelligence Report - ${date}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f0;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 700px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="background-color: #0f172a; padding: 32px 40px;">
              <table role="presentation" style="width: 100%;">
                <tr>
                  <td>
                    <p style="margin: 0 0 8px 0; color: #ea580c; font-size: 11px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase;">ROLLCOG</p>
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                      Daily Intelligence Report
                    </h1>
                    <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.7); font-size: 14px;">
                      ${date}
                    </p>
                  </td>
                  <td style="text-align: right; vertical-align: top;">
                    <div style="background-color: ${summary.conversionRate >= analysis.summary.vsBaseline.rate + summary.conversionRate ? "#16a34a" : summary.totalConversions > 0 ? "#3b82f6" : "#6b7280"}; color: white; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; display: inline-block;">
                      ${summary.totalConversions} CONVERSION${summary.totalConversions !== 1 ? "S" : ""}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Executive Summary -->
          <tr>
            <td style="padding: 32px 40px; border-bottom: 1px solid #e5e5e5;">
              <table role="presentation" style="width: 100%;">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 16px 0; color: #1a1a1a; font-size: 16px; font-weight: 600;">
                      <span style="color: #ea580c;">///</span> Executive Summary
                    </h2>
                    <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.7;">
                      ${aiInsights.executiveSummary}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Status Overview: What's Working / Needs Monitoring / Needs Attention -->
          <tr>
            <td style="padding: 32px 40px; border-bottom: 1px solid #e5e5e5;">
              <!-- What's Working -->
              ${aiInsights.whatsWorking && aiInsights.whatsWorking.length > 0 ? `
              <div style="margin-bottom: 24px; padding: 16px; background-color: #ecfdf5; border-radius: 8px; border-left: 4px solid #16a34a;">
                <h3 style="margin: 0 0 12px 0; color: #166534; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                  ✓ What's Working
                </h3>
                ${aiInsights.whatsWorking.map((item) => `
                <p style="margin: 0 0 8px 0; color: #166534; font-size: 14px; padding-left: 12px;">
                  • ${item}
                </p>
                `).join("")}
              </div>
              ` : ""}

              <!-- Needs Monitoring -->
              ${aiInsights.needsMonitoring && aiInsights.needsMonitoring.length > 0 ? `
              <div style="margin-bottom: 24px; padding: 16px; background-color: #fefce8; border-radius: 8px; border-left: 4px solid #eab308;">
                <h3 style="margin: 0 0 12px 0; color: #854d0e; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                  ◐ Needs Monitoring
                </h3>
                ${aiInsights.needsMonitoring.map((item) => `
                <p style="margin: 0 0 8px 0; color: #854d0e; font-size: 14px; padding-left: 12px;">
                  • ${item}
                </p>
                `).join("")}
              </div>
              ` : ""}

              <!-- Needs Attention -->
              ${aiInsights.needsAttention && aiInsights.needsAttention.length > 0 ? `
              <div style="padding: 16px; background-color: #fef2f2; border-radius: 8px; border-left: 4px solid #dc2626;">
                <h3 style="margin: 0 0 12px 0; color: #991b1b; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                  ✗ Needs Attention
                </h3>
                ${aiInsights.needsAttention.map((item) => `
                <p style="margin: 0 0 8px 0; color: #991b1b; font-size: 14px; padding-left: 12px;">
                  • ${item}
                </p>
                `).join("")}
              </div>
              ` : ""}
            </td>
          </tr>

          <!-- Key Metrics Grid -->
          <tr>
            <td style="padding: 32px 40px; border-bottom: 1px solid #e5e5e5;">
              <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 16px; font-weight: 600;">
                <span style="color: #ea580c;">///</span> Today's Performance
              </h2>
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="width: 25%; text-align: center; padding: 16px; background-color: #f9fafb; border-radius: 8px 0 0 8px;">
                    <p style="margin: 0; color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Sessions</p>
                    <p style="margin: 8px 0 4px 0; color: #1a1a1a; font-size: 28px; font-weight: 700;">${summary.totalSessions}</p>
                    <p style="margin: 0; font-size: 12px;">${formatChange(summary.vsYesterday.sessions)} vs yesterday</p>
                  </td>
                  <td style="width: 25%; text-align: center; padding: 16px; background-color: #f9fafb;">
                    <p style="margin: 0; color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Conversions</p>
                    <p style="margin: 8px 0 4px 0; color: #1a1a1a; font-size: 28px; font-weight: 700;">${summary.totalConversions}</p>
                    <p style="margin: 0; font-size: 12px;">${formatChange(summary.vsYesterday.conversions)} vs yesterday</p>
                  </td>
                  <td style="width: 25%; text-align: center; padding: 16px; background-color: #f9fafb;">
                    <p style="margin: 0; color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Conv. Rate</p>
                    <p style="margin: 8px 0 4px 0; color: #1a1a1a; font-size: 28px; font-weight: 700;">${summary.conversionRate.toFixed(1)}%</p>
                    <p style="margin: 0; font-size: 12px;">${summary.vsBaseline.rate >= 0 ? "+" : ""}${summary.vsBaseline.rate.toFixed(2)}pp vs avg</p>
                  </td>
                  <td style="width: 25%; text-align: center; padding: 16px; background-color: #f9fafb; border-radius: 0 8px 8px 0;">
                    <p style="margin: 0; color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Quality Score</p>
                    <p style="margin: 8px 0 4px 0; color: #1a1a1a; font-size: 28px; font-weight: 700;">${analysis.sessionQuality.avgScore.toFixed(0)}</p>
                    <p style="margin: 0; font-size: 12px;">out of 100</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Funnel Performance -->
          <tr>
            <td style="padding: 32px 40px; border-bottom: 1px solid #e5e5e5;">
              <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 16px; font-weight: 600;">
                <span style="color: #ea580c;">///</span> Funnel Performance
              </h2>
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                ${funnel.stages.map((stage, index) => `
                <tr>
                  <td style="padding: 12px 0; ${index < funnel.stages.length - 1 ? "border-bottom: 1px solid #e5e5e5;" : ""}">
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="width: 40%;">
                          <p style="margin: 0; color: #1a1a1a; font-size: 14px; font-weight: 500;">${stage.name}</p>
                        </td>
                        <td style="width: 30%;">
                          <div style="background-color: #e5e7eb; border-radius: 4px; height: 8px; overflow: hidden;">
                            <div style="background-color: #ea580c; height: 100%; width: ${Math.min(stage.percentage, 100)}%;"></div>
                          </div>
                        </td>
                        <td style="width: 15%; text-align: right;">
                          <p style="margin: 0; color: #374151; font-size: 14px; font-weight: 600;">${stage.count}</p>
                        </td>
                        <td style="width: 15%; text-align: right;">
                          <p style="margin: 0; color: #6b7280; font-size: 13px;">${stage.percentage.toFixed(1)}%</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                `).join("")}
              </table>
              ${funnel.biggestDropOff ? `
              <p style="margin: 16px 0 0 0; color: #92400e; font-size: 13px; background-color: #fef3c7; padding: 12px 16px; border-radius: 6px;">
                <strong>Drop-off Alert:</strong> ${funnel.biggestDropOff.rate.toFixed(0)}% of users leave at ${funnel.biggestDropOff.stage}
              </p>
              ` : ""}
            </td>
          </tr>

          ${highIntentSessions.length > 0 ? `
          <!-- High Intent Sessions -->
          <tr>
            <td style="padding: 32px 40px; border-bottom: 1px solid #e5e5e5;">
              <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 16px; font-weight: 600;">
                <span style="color: #ea580c;">///</span> High-Intent Sessions (Didn't Convert)
              </h2>
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb; border-radius: 8px;">
                <tr>
                  <td style="padding: 12px 16px; font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e5e5e5;">Source</td>
                  <td style="padding: 12px 16px; font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e5e5e5;">Location</td>
                  <td style="padding: 12px 16px; font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e5e5e5; text-align: center;">Pages</td>
                  <td style="padding: 12px 16px; font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e5e5e5; text-align: center;">Score</td>
                  <td style="padding: 12px 16px; font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e5e5e5;">Stopped At</td>
                </tr>
                ${highIntentSessions.slice(0, 5).map((session, index) => `
                <tr>
                  <td style="padding: 12px 16px; font-size: 13px; color: #374151; ${index < Math.min(highIntentSessions.length, 5) - 1 ? "border-bottom: 1px solid #e5e5e5;" : ""}">${session.source}</td>
                  <td style="padding: 12px 16px; font-size: 13px; color: #374151; ${index < Math.min(highIntentSessions.length, 5) - 1 ? "border-bottom: 1px solid #e5e5e5;" : ""}">${session.location || "Unknown"}</td>
                  <td style="padding: 12px 16px; font-size: 13px; color: #374151; text-align: center; ${index < Math.min(highIntentSessions.length, 5) - 1 ? "border-bottom: 1px solid #e5e5e5;" : ""}">${session.pagesViewed}</td>
                  <td style="padding: 12px 16px; font-size: 13px; color: #374151; text-align: center; ${index < Math.min(highIntentSessions.length, 5) - 1 ? "border-bottom: 1px solid #e5e5e5;" : ""}"><span style="background-color: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 10px; font-weight: 500;">${session.qualityScore}</span></td>
                  <td style="padding: 12px 16px; font-size: 13px; color: #374151; ${index < Math.min(highIntentSessions.length, 5) - 1 ? "border-bottom: 1px solid #e5e5e5;" : ""}">${session.stoppedAt || "Unknown"}</td>
                </tr>
                `).join("")}
              </table>
              <p style="margin: 12px 0 0 0; color: #6b7280; font-size: 12px; font-style: italic;">
                These visitors showed strong engagement signals but didn't convert. Consider retargeting.
              </p>
            </td>
          </tr>
          ` : ""}

          <!-- Traffic Source Quality -->
          <tr>
            <td style="padding: 32px 40px; border-bottom: 1px solid #e5e5e5;">
              <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 16px; font-weight: 600;">
                <span style="color: #ea580c;">///</span> Traffic Source Quality
              </h2>
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb; border-radius: 8px;">
                <tr>
                  <td style="padding: 12px 16px; font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e5e5e5;">Source</td>
                  <td style="padding: 12px 16px; font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e5e5e5; text-align: center;">Sessions</td>
                  <td style="padding: 12px 16px; font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e5e5e5; text-align: center;">Quality</td>
                  <td style="padding: 12px 16px; font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e5e5e5; text-align: center;">Avg Pages</td>
                  <td style="padding: 12px 16px; font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e5e5e5; text-align: right;">Conv %</td>
                </tr>
                ${cohorts.slice(0, 5).map((cohort, index) => `
                <tr>
                  <td style="padding: 12px 16px; font-size: 13px; color: #374151; font-weight: 500; ${index < Math.min(cohorts.length, 5) - 1 ? "border-bottom: 1px solid #e5e5e5;" : ""}">${cohort.cohortName}</td>
                  <td style="padding: 12px 16px; font-size: 13px; color: #374151; text-align: center; ${index < Math.min(cohorts.length, 5) - 1 ? "border-bottom: 1px solid #e5e5e5;" : ""}">${cohort.sessions}</td>
                  <td style="padding: 12px 16px; font-size: 13px; color: #374151; text-align: center; ${index < Math.min(cohorts.length, 5) - 1 ? "border-bottom: 1px solid #e5e5e5;" : ""}">${cohort.avgQualityScore}/100</td>
                  <td style="padding: 12px 16px; font-size: 13px; color: #374151; text-align: center; ${index < Math.min(cohorts.length, 5) - 1 ? "border-bottom: 1px solid #e5e5e5;" : ""}">${cohort.avgPagesPerSession}</td>
                  <td style="padding: 12px 16px; font-size: 13px; text-align: right; font-weight: 600; ${index < Math.min(cohorts.length, 5) - 1 ? "border-bottom: 1px solid #e5e5e5;" : ""} color: ${cohort.conversionRate > 0 ? "#16a34a" : "#374151"};">${cohort.conversionRate.toFixed(1)}%</td>
                </tr>
                `).join("")}
              </table>
            </td>
          </tr>

          <!-- Google Ads Performance -->
          ${report.googleAds ? `
          <tr>
            <td style="padding: 32px 40px; border-bottom: 1px solid #e5e5e5;">
              <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 16px; font-weight: 600;">
                <span style="color: #ea580c;">///</span> Google Ads Performance
              </h2>
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="width: 25%; text-align: center; padding: 16px; background-color: #f9fafb; border-radius: 8px 0 0 8px;">
                    <p style="margin: 0; color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Spend</p>
                    <p style="margin: 8px 0 4px 0; color: #1a1a1a; font-size: 24px; font-weight: 700;">$${report.googleAds.totalSpend.toFixed(2)}</p>
                    <p style="margin: 0; font-size: 12px; color: ${report.googleAds.spendChange >= 0 ? "#16a34a" : "#dc2626"};">${report.googleAds.spendChange >= 0 ? "+" : ""}${report.googleAds.spendChange.toFixed(1)}% vs prev</p>
                  </td>
                  <td style="width: 25%; text-align: center; padding: 16px; background-color: #f9fafb;">
                    <p style="margin: 0; color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Clicks</p>
                    <p style="margin: 8px 0 4px 0; color: #1a1a1a; font-size: 24px; font-weight: 700;">${report.googleAds.totalClicks}</p>
                    <p style="margin: 0; font-size: 12px; color: ${report.googleAds.clicksChange >= 0 ? "#16a34a" : "#dc2626"};">${report.googleAds.clicksChange >= 0 ? "+" : ""}${report.googleAds.clicksChange.toFixed(1)}% vs prev</p>
                  </td>
                  <td style="width: 25%; text-align: center; padding: 16px; background-color: #f9fafb;">
                    <p style="margin: 0; color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">CTR</p>
                    <p style="margin: 8px 0 4px 0; color: #1a1a1a; font-size: 24px; font-weight: 700;">${report.googleAds.avgCtr.toFixed(2)}%</p>
                    <p style="margin: 0; font-size: 12px; color: #6b7280;">Avg CPC: $${report.googleAds.avgCpc.toFixed(2)}</p>
                  </td>
                  <td style="width: 25%; text-align: center; padding: 16px; background-color: #f9fafb; border-radius: 0 8px 8px 0;">
                    <p style="margin: 0; color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Conversions</p>
                    <p style="margin: 8px 0 4px 0; color: #1a1a1a; font-size: 24px; font-weight: 700;">${report.googleAds.totalConversions}</p>
                    <p style="margin: 0; font-size: 12px; color: #6b7280;">${report.googleAds.costPerConversion ? `$${report.googleAds.costPerConversion.toFixed(2)}/conv` : "N/A"}</p>
                  </td>
                </tr>
              </table>
              ${report.googleAds.campaigns.length > 0 ? `
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-top: 16px; background-color: #f9fafb; border-radius: 8px;">
                <tr>
                  <td style="padding: 12px 16px; font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e5e5e5;">Campaign</td>
                  <td style="padding: 12px 16px; font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e5e5e5; text-align: right;">Spend</td>
                  <td style="padding: 12px 16px; font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e5e5e5; text-align: center;">Clicks</td>
                  <td style="padding: 12px 16px; font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e5e5e5; text-align: center;">CTR</td>
                </tr>
                ${report.googleAds.campaigns.slice(0, 5).map((campaign, index) => `
                <tr>
                  <td style="padding: 12px 16px; font-size: 13px; color: #374151; font-weight: 500; ${index < Math.min(report.googleAds!.campaigns.length, 5) - 1 ? "border-bottom: 1px solid #e5e5e5;" : ""}">${campaign.name}</td>
                  <td style="padding: 12px 16px; font-size: 13px; color: #374151; text-align: right; ${index < Math.min(report.googleAds!.campaigns.length, 5) - 1 ? "border-bottom: 1px solid #e5e5e5;" : ""}">$${campaign.spend.toFixed(2)}</td>
                  <td style="padding: 12px 16px; font-size: 13px; color: #374151; text-align: center; ${index < Math.min(report.googleAds!.campaigns.length, 5) - 1 ? "border-bottom: 1px solid #e5e5e5;" : ""}">${campaign.clicks}</td>
                  <td style="padding: 12px 16px; font-size: 13px; color: #374151; text-align: center; ${index < Math.min(report.googleAds!.campaigns.length, 5) - 1 ? "border-bottom: 1px solid #e5e5e5;" : ""}">${campaign.ctr.toFixed(2)}%</td>
                </tr>
                `).join("")}
              </table>
              ` : ""}
            </td>
          </tr>
          ` : ""}

          <!-- Content Effectiveness -->
          ${contentEffectiveness.length > 0 ? `
          <tr>
            <td style="padding: 32px 40px; border-bottom: 1px solid #e5e5e5;">
              <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 16px; font-weight: 600;">
                <span style="color: #ea580c;">///</span> Content Effectiveness
              </h2>
              <table role="presentation" style="width: 100%;">
                ${contentEffectiveness.slice(0, 5).map((content, index) => `
                <tr>
                  <td style="padding: 12px 0; ${index < Math.min(contentEffectiveness.length, 5) - 1 ? "border-bottom: 1px solid #e5e5e5;" : ""}">
                    <p style="margin: 0 0 4px 0; color: #1a1a1a; font-size: 14px; font-weight: 500;">${content.page}</p>
                    <p style="margin: 0; color: #6b7280; font-size: 12px;">
                      ${content.views} views | ${content.conversionAssist.toFixed(0)}% conversion assist | ${content.bounceRate.toFixed(0)}% bounce
                      <span style="background-color: ${content.role === "terminal" ? "#dcfce7" : content.role === "entry" ? "#dbeafe" : content.role === "bounce" ? "#fee2e2" : "#f3f4f6"}; color: ${content.role === "terminal" ? "#166534" : content.role === "entry" ? "#1e40af" : content.role === "bounce" ? "#991b1b" : "#374151"}; padding: 2px 8px; border-radius: 10px; margin-left: 8px; font-size: 11px; text-transform: uppercase;">${content.role}</span>
                    </p>
                  </td>
                </tr>
                `).join("")}
              </table>
            </td>
          </tr>
          ` : ""}

          <!-- Detailed Insights with Reasoning -->
          ${aiInsights.insights && aiInsights.insights.length > 0 ? `
          <tr>
            <td style="padding: 32px 40px; border-bottom: 1px solid #e5e5e5;">
              <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 16px; font-weight: 600;">
                <span style="color: #ea580c;">///</span> Key Insights & Analysis
              </h2>
              ${aiInsights.insights.map((insight) => `
              <div style="margin: 0 0 16px 0; padding: 16px; background-color: #f9fafb; border-radius: 8px; border-left: 3px solid #3b82f6;">
                <p style="margin: 0 0 8px 0; color: #1a1a1a; font-size: 14px; font-weight: 600;">
                  ${insight.observation}
                  ${insight.metric ? `<span style="color: #6b7280; font-weight: 400;"> (${insight.metric})</span>` : ""}
                </p>
                <p style="margin: 0; color: #6b7280; font-size: 13px; font-style: italic;">
                  Why: ${insight.reason}
                </p>
              </div>
              `).join("")}
            </td>
          </tr>
          ` : ""}

          <!-- Traffic Source Insights -->
          ${aiInsights.trafficSourceInsights && aiInsights.trafficSourceInsights.length > 0 ? `
          <tr>
            <td style="padding: 32px 40px; border-bottom: 1px solid #e5e5e5;">
              <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 16px; font-weight: 600;">
                <span style="color: #ea580c;">///</span> Traffic Source Insights
              </h2>
              ${aiInsights.trafficSourceInsights.map((insight) => `
              <p style="margin: 0 0 12px 0; color: #374151; font-size: 14px; padding-left: 16px; border-left: 3px solid #8b5cf6;">
                ${insight}
              </p>
              `).join("")}
            </td>
          </tr>
          ` : ""}

          <!-- Recommendations -->
          <tr>
            <td style="padding: 32px 40px; border-bottom: 1px solid #e5e5e5;">
              <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 16px; font-weight: 600;">
                <span style="color: #ea580c;">///</span> Recommendations
              </h2>
              ${aiInsights.recommendations.map((rec) => `
              <p style="margin: 0 0 12px 0; color: #374151; font-size: 14px; padding-left: 16px; border-left: 3px solid #16a34a;">
                ${rec}
              </p>
              `).join("")}
            </td>
          </tr>

          <!-- Interesting Facts -->
          ${aiInsights.interestingFacts && aiInsights.interestingFacts.length > 0 ? `
          <tr>
            <td style="padding: 32px 40px; border-bottom: 1px solid #e5e5e5;">
              <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 16px; font-weight: 600;">
                <span style="color: #ea580c;">///</span> Interesting Facts
              </h2>
              ${aiInsights.interestingFacts.map((fact) => `
              <p style="margin: 0 0 12px 0; color: #374151; font-size: 14px; padding-left: 16px; border-left: 3px solid #f59e0b;">
                💡 ${fact}
              </p>
              `).join("")}
            </td>
          </tr>
          ` : ""}

          <!-- Footer -->
          <tr>
            <td style="background-color: #0f172a; padding: 24px 40px;">
              <table role="presentation" style="width: 100%;">
                <tr>
                  <td>
                    <p style="margin: 0; color: rgba(255,255,255,0.7); font-size: 12px;">
                      <strong style="color: #ffffff;">${COMPANY.name}</strong><br>
                      ${COMPANY.address.street}, ${COMPANY.address.city}, ${COMPANY.address.state} ${COMPANY.address.zip}
                    </p>
                  </td>
                  <td style="text-align: right;">
                    <p style="margin: 0; color: rgba(255,255,255,0.5); font-size: 11px;">
                      Powered by AI Analytics<br>
                      Report generated automatically
                    </p>
                  </td>
                </tr>
              </table>
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
 * Generate plain text version of the intelligence report
 */
export function generateIntelligenceReportText(
  report: IntelligenceReport
): string {
  const { date, aiInsights, analysis } = report;
  const { summary, funnel, cohorts, highIntentSessions } = analysis;

  return `
ROLLCOG DAILY INTELLIGENCE REPORT
${date}
${"=".repeat(50)}

EXECUTIVE SUMMARY
-----------------
${aiInsights.executiveSummary}

${aiInsights.whatsWorking && aiInsights.whatsWorking.length > 0 ? `
✓ WHAT'S WORKING
----------------
${aiInsights.whatsWorking.map((w) => `+ ${w}`).join("\n")}
` : ""}

${aiInsights.needsMonitoring && aiInsights.needsMonitoring.length > 0 ? `
◐ NEEDS MONITORING
------------------
${aiInsights.needsMonitoring.map((m) => `~ ${m}`).join("\n")}
` : ""}

${aiInsights.needsAttention && aiInsights.needsAttention.length > 0 ? `
✗ NEEDS ATTENTION
-----------------
${aiInsights.needsAttention.map((a) => `! ${a}`).join("\n")}
` : ""}

TODAY'S PERFORMANCE
-------------------
Sessions: ${summary.totalSessions} (${summary.vsYesterday.sessions >= 0 ? "+" : ""}${summary.vsYesterday.sessions.toFixed(1)}% vs yesterday)
Conversions: ${summary.totalConversions} (${summary.vsYesterday.conversions >= 0 ? "+" : ""}${summary.vsYesterday.conversions.toFixed(1)}% vs yesterday)
Conversion Rate: ${summary.conversionRate.toFixed(1)}% (${summary.vsBaseline.rate >= 0 ? "+" : ""}${summary.vsBaseline.rate.toFixed(2)}pp vs 30-day avg)
Session Quality: ${analysis.sessionQuality.avgScore.toFixed(0)}/100

FUNNEL PERFORMANCE
------------------
${funnel.stages.map((s) => `${s.name}: ${s.count} (${s.percentage.toFixed(1)}%)`).join("\n")}
${funnel.biggestDropOff ? `\nBiggest drop-off: ${funnel.biggestDropOff.stage} at ${funnel.biggestDropOff.rate.toFixed(0)}%` : ""}

${highIntentSessions.length > 0 ? `
HIGH-INTENT SESSIONS (Didn't Convert)
-------------------------------------
${highIntentSessions.slice(0, 5).map((s) => `- ${s.source} from ${s.location || "Unknown"}: ${s.pagesViewed} pages, score ${s.qualityScore}`).join("\n")}
` : ""}

TRAFFIC SOURCE QUALITY
----------------------
${cohorts.slice(0, 5).map((c) => `${c.cohortName}: ${c.sessions} sessions, ${c.conversionRate.toFixed(1)}% conv, quality ${c.avgQualityScore}/100`).join("\n")}

${report.googleAds ? `
GOOGLE ADS PERFORMANCE
----------------------
Spend: $${report.googleAds.totalSpend.toFixed(2)} (${report.googleAds.spendChange >= 0 ? "+" : ""}${report.googleAds.spendChange.toFixed(1)}% vs prev)
Clicks: ${report.googleAds.totalClicks} (${report.googleAds.clicksChange >= 0 ? "+" : ""}${report.googleAds.clicksChange.toFixed(1)}% vs prev)
Impressions: ${report.googleAds.totalImpressions.toLocaleString()}
CTR: ${report.googleAds.avgCtr.toFixed(2)}%
Avg CPC: $${report.googleAds.avgCpc.toFixed(2)}
Conversions: ${report.googleAds.totalConversions}${report.googleAds.costPerConversion ? ` ($${report.googleAds.costPerConversion.toFixed(2)} per conversion)` : ""}

Campaign Breakdown:
${report.googleAds.campaigns.slice(0, 5).map((c) => `- ${c.name}: $${c.spend.toFixed(2)} | ${c.clicks} clicks | ${c.ctr.toFixed(2)}% CTR`).join("\n")}
` : ""}

${aiInsights.insights && aiInsights.insights.length > 0 ? `
KEY INSIGHTS & ANALYSIS
-----------------------
${aiInsights.insights.map((i) => `* ${i.observation}${i.metric ? ` (${i.metric})` : ""}
  Why: ${i.reason}`).join("\n\n")}
` : ""}

${aiInsights.trafficSourceInsights && aiInsights.trafficSourceInsights.length > 0 ? `
TRAFFIC SOURCE INSIGHTS
-----------------------
${aiInsights.trafficSourceInsights.map((t) => `* ${t}`).join("\n")}
` : ""}

RECOMMENDATIONS
---------------
${aiInsights.recommendations.map((r) => `* ${r}`).join("\n")}

${aiInsights.interestingFacts && aiInsights.interestingFacts.length > 0 ? `
INTERESTING FACTS
-----------------
${aiInsights.interestingFacts.map((f) => `💡 ${f}`).join("\n")}
` : ""}

---
${COMPANY.name}
${COMPANY.address.street}, ${COMPANY.address.city}, ${COMPANY.address.state} ${COMPANY.address.zip}
${COMPANY.phone} | ${COMPANY.email}
  `.trim();
}
