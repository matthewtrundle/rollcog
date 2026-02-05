/**
 * @fileoverview Google Ads API integration for daily intelligence reports
 * @module lib/analytics/google-ads
 *
 * Pulls campaign performance metrics from Google Ads to include in
 * the daily analytics intelligence report.
 */

import { GoogleAdsApi } from "google-ads-api";

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface GoogleAdsMetrics {
  // Summary metrics
  totalSpend: number;
  totalClicks: number;
  totalImpressions: number;
  totalConversions: number;
  avgCtr: number;
  avgCpc: number;
  costPerConversion: number | null;

  // Comparison to previous period
  spendChange: number;
  clicksChange: number;
  impressionsChange: number;
  conversionsChange: number;

  // Campaign breakdown
  campaigns: CampaignMetrics[];

  // Data period
  periodStart: string;
  periodEnd: string;
}

export interface CampaignMetrics {
  name: string;
  status: string;
  spend: number;
  clicks: number;
  impressions: number;
  conversions: number;
  ctr: number;
  cpc: number;
  costPerConversion: number | null;
}

// =============================================================================
// GOOGLE ADS CLIENT
// =============================================================================

function getGoogleAdsClient(): GoogleAdsApi | null {
  const clientId = process.env.GOOGLE_ADS_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET;
  const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
  const refreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !developerToken || !refreshToken) {
    console.log("Google Ads API credentials not configured");
    return null;
  }

  return new GoogleAdsApi({
    client_id: clientId,
    client_secret: clientSecret,
    developer_token: developerToken,
  });
}

// =============================================================================
// DATA EXTRACTION
// =============================================================================

/**
 * Extract Google Ads metrics for the specified date range
 */
export async function extractGoogleAdsMetrics(
  daysBack: number = 1
): Promise<GoogleAdsMetrics | null> {
  const client = getGoogleAdsClient();
  if (!client) {
    return null;
  }

  const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID;
  const refreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN;
  const loginCustomerId = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID;

  if (!customerId || !refreshToken) {
    console.log("Google Ads customer ID or refresh token not configured");
    return null;
  }

  // Remove dashes from customer ID if present
  const cleanCustomerId = customerId.replace(/-/g, "");
  const cleanLoginCustomerId = loginCustomerId?.replace(/-/g, "");

  const customer = client.Customer({
    customer_id: cleanCustomerId,
    refresh_token: refreshToken,
    login_customer_id: cleanLoginCustomerId,
  });

  try {
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const formatDate = (d: Date) => d.toISOString().split("T")[0];
    const startDateStr = formatDate(startDate);
    const endDateStr = formatDate(endDate);

    // Calculate previous period for comparison
    const prevEndDate = new Date(startDate);
    prevEndDate.setDate(prevEndDate.getDate() - 1);
    const prevStartDate = new Date(prevEndDate);
    prevStartDate.setDate(prevStartDate.getDate() - daysBack);
    const prevStartDateStr = formatDate(prevStartDate);
    const prevEndDateStr = formatDate(prevEndDate);

    // Query current period campaign metrics
    const currentData = await customer.query(`
      SELECT
        campaign.name,
        campaign.status,
        metrics.cost_micros,
        metrics.clicks,
        metrics.impressions,
        metrics.conversions,
        metrics.ctr,
        metrics.average_cpc
      FROM campaign
      WHERE segments.date BETWEEN '${startDateStr}' AND '${endDateStr}'
        AND campaign.status != 'REMOVED'
    `);

    // Query previous period for comparison
    const previousData = await customer.query(`
      SELECT
        metrics.cost_micros,
        metrics.clicks,
        metrics.impressions,
        metrics.conversions
      FROM campaign
      WHERE segments.date BETWEEN '${prevStartDateStr}' AND '${prevEndDateStr}'
        AND campaign.status != 'REMOVED'
    `);

    // Aggregate current period metrics
    let totalSpend = 0;
    let totalClicks = 0;
    let totalImpressions = 0;
    let totalConversions = 0;

    const campaignMap = new Map<string, CampaignMetrics>();

    for (const row of currentData) {
      const costMicros = Number(row.metrics?.cost_micros || 0);
      const clicks = Number(row.metrics?.clicks || 0);
      const impressions = Number(row.metrics?.impressions || 0);
      const conversions = Number(row.metrics?.conversions || 0);

      totalSpend += costMicros / 1_000_000;
      totalClicks += clicks;
      totalImpressions += impressions;
      totalConversions += conversions;

      const campaignName = row.campaign?.name || "Unknown";
      const existing = campaignMap.get(campaignName);

      if (existing) {
        existing.spend += costMicros / 1_000_000;
        existing.clicks += clicks;
        existing.impressions += impressions;
        existing.conversions += conversions;
      } else {
        campaignMap.set(campaignName, {
          name: campaignName,
          status: String(row.campaign?.status || "UNKNOWN"),
          spend: costMicros / 1_000_000,
          clicks,
          impressions,
          conversions,
          ctr: 0,
          cpc: 0,
          costPerConversion: null,
        });
      }
    }

    // Calculate derived metrics for campaigns
    const campaigns: CampaignMetrics[] = [];
    for (const campaign of campaignMap.values()) {
      campaign.ctr =
        campaign.impressions > 0
          ? (campaign.clicks / campaign.impressions) * 100
          : 0;
      campaign.cpc =
        campaign.clicks > 0 ? campaign.spend / campaign.clicks : 0;
      campaign.costPerConversion =
        campaign.conversions > 0
          ? campaign.spend / campaign.conversions
          : null;
      campaigns.push(campaign);
    }

    // Sort campaigns by spend descending
    campaigns.sort((a, b) => b.spend - a.spend);

    // Aggregate previous period metrics
    let prevSpend = 0;
    let prevClicks = 0;
    let prevImpressions = 0;
    let prevConversions = 0;

    for (const row of previousData) {
      prevSpend += Number(row.metrics?.cost_micros || 0) / 1_000_000;
      prevClicks += Number(row.metrics?.clicks || 0);
      prevImpressions += Number(row.metrics?.impressions || 0);
      prevConversions += Number(row.metrics?.conversions || 0);
    }

    // Calculate percentage changes
    const calcChange = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      totalSpend,
      totalClicks,
      totalImpressions,
      totalConversions,
      avgCtr:
        totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
      avgCpc: totalClicks > 0 ? totalSpend / totalClicks : 0,
      costPerConversion:
        totalConversions > 0 ? totalSpend / totalConversions : null,

      spendChange: calcChange(totalSpend, prevSpend),
      clicksChange: calcChange(totalClicks, prevClicks),
      impressionsChange: calcChange(totalImpressions, prevImpressions),
      conversionsChange: calcChange(totalConversions, prevConversions),

      campaigns,

      periodStart: startDateStr,
      periodEnd: endDateStr,
    };
  } catch (error) {
    console.error("Error fetching Google Ads data:", error);
    return null;
  }
}

/**
 * Test Google Ads API connection
 */
export async function testGoogleAdsConnection(): Promise<{
  success: boolean;
  message: string;
}> {
  const client = getGoogleAdsClient();
  if (!client) {
    return {
      success: false,
      message:
        "Google Ads API credentials not configured. Required: GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET, GOOGLE_ADS_DEVELOPER_TOKEN, GOOGLE_ADS_REFRESH_TOKEN",
    };
  }

  const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID;
  const refreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN;

  if (!customerId) {
    return {
      success: false,
      message: "GOOGLE_ADS_CUSTOMER_ID not configured",
    };
  }

  if (!refreshToken) {
    return {
      success: false,
      message: "GOOGLE_ADS_REFRESH_TOKEN not configured",
    };
  }

  try {
    const cleanCustomerId = customerId.replace(/-/g, "");
    const customer = client.Customer({
      customer_id: cleanCustomerId,
      refresh_token: refreshToken,
    });

    // Simple query to test connection
    await customer.query(`
      SELECT campaign.id
      FROM campaign
      LIMIT 1
    `);

    return {
      success: true,
      message: "Google Ads API connection successful",
    };
  } catch (error) {
    return {
      success: false,
      message: `Google Ads API error: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}
