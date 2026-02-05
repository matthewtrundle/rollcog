/**
 * Full test of Google Ads metrics extraction
 */
const { GoogleAdsApi } = require('google-ads-api');
const fs = require('fs');

// Load env vars
const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match && !match[1].startsWith('#')) {
    process.env[match[1].trim()] = match[2].trim();
  }
});

async function extractGoogleAdsMetrics(daysBack = 7) {
  const client = new GoogleAdsApi({
    client_id: process.env.GOOGLE_ADS_CLIENT_ID,
    client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
    developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
  });

  const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID?.replace(/-/g, '');
  const loginCustomerId = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID?.replace(/-/g, '');

  const customer = client.Customer({
    customer_id: customerId,
    refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
    login_customer_id: loginCustomerId,
  });

  // Calculate date range
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);

  const formatDate = (d) => d.toISOString().split('T')[0];
  const startDateStr = formatDate(startDate);
  const endDateStr = formatDate(endDate);

  console.log(`Fetching data from ${startDateStr} to ${endDateStr}...`);

  // Query campaign metrics
  const data = await customer.query(`
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

  // Aggregate metrics
  let totalSpend = 0;
  let totalClicks = 0;
  let totalImpressions = 0;
  let totalConversions = 0;
  const campaignMap = new Map();

  for (const row of data) {
    const costMicros = Number(row.metrics?.cost_micros || 0);
    const clicks = Number(row.metrics?.clicks || 0);
    const impressions = Number(row.metrics?.impressions || 0);
    const conversions = Number(row.metrics?.conversions || 0);

    totalSpend += costMicros / 1_000_000;
    totalClicks += clicks;
    totalImpressions += impressions;
    totalConversions += conversions;

    const campaignName = row.campaign?.name || 'Unknown';
    const existing = campaignMap.get(campaignName);

    if (existing) {
      existing.spend += costMicros / 1_000_000;
      existing.clicks += clicks;
      existing.impressions += impressions;
      existing.conversions += conversions;
    } else {
      campaignMap.set(campaignName, {
        name: campaignName,
        status: String(row.campaign?.status || 'UNKNOWN'),
        spend: costMicros / 1_000_000,
        clicks,
        impressions,
        conversions,
      });
    }
  }

  // Calculate CTR and CPC for campaigns
  const campaigns = [];
  for (const campaign of campaignMap.values()) {
    campaign.ctr = campaign.impressions > 0 ? (campaign.clicks / campaign.impressions) * 100 : 0;
    campaign.cpc = campaign.clicks > 0 ? campaign.spend / campaign.clicks : 0;
    campaign.costPerConversion = campaign.conversions > 0 ? campaign.spend / campaign.conversions : null;
    campaigns.push(campaign);
  }

  campaigns.sort((a, b) => b.spend - a.spend);

  return {
    totalSpend,
    totalClicks,
    totalImpressions,
    totalConversions,
    avgCtr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
    avgCpc: totalClicks > 0 ? totalSpend / totalClicks : 0,
    costPerConversion: totalConversions > 0 ? totalSpend / totalConversions : null,
    campaigns,
    periodStart: startDateStr,
    periodEnd: endDateStr,
  };
}

async function main() {
  try {
    const metrics = await extractGoogleAdsMetrics(7);

    console.log('\n=== Google Ads Metrics (Last 7 Days) ===\n');
    console.log('Summary:');
    console.log('  Total Spend: $' + metrics.totalSpend.toFixed(2));
    console.log('  Total Clicks:', metrics.totalClicks);
    console.log('  Total Impressions:', metrics.totalImpressions);
    console.log('  Total Conversions:', metrics.totalConversions);
    console.log('  Avg CTR:', metrics.avgCtr.toFixed(2) + '%');
    console.log('  Avg CPC: $' + metrics.avgCpc.toFixed(2));
    console.log('  Cost/Conversion:', metrics.costPerConversion ? '$' + metrics.costPerConversion.toFixed(2) : 'N/A');

    console.log('\nCampaigns:');
    for (const campaign of metrics.campaigns) {
      console.log(`  - ${campaign.name} (${campaign.status})`);
      console.log(`    Spend: $${campaign.spend.toFixed(2)} | Clicks: ${campaign.clicks} | Impressions: ${campaign.impressions}`);
      console.log(`    CTR: ${campaign.ctr.toFixed(2)}% | CPC: $${campaign.cpc.toFixed(2)}`);
    }

    console.log('\nPeriod:', metrics.periodStart, 'to', metrics.periodEnd);

  } catch (error) {
    console.error('Error:', error.message);
    if (error.errors) {
      console.error('Details:', JSON.stringify(error.errors, null, 2));
    }
  }
}

main();
