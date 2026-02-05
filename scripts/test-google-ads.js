const { GoogleAdsApi } = require('google-ads-api');

// Load env vars manually
const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match && !match[1].startsWith('#')) {
    process.env[match[1].trim()] = match[2].trim();
  }
});

console.log('Credentials check:');
console.log('  Developer Token:', process.env.GOOGLE_ADS_DEVELOPER_TOKEN ? 'Set' : 'Missing');
console.log('  Client ID:', process.env.GOOGLE_ADS_CLIENT_ID ? 'Set' : 'Missing');
console.log('  Client Secret:', process.env.GOOGLE_ADS_CLIENT_SECRET ? 'Set' : 'Missing');
console.log('  Refresh Token:', process.env.GOOGLE_ADS_REFRESH_TOKEN ? `Set (${process.env.GOOGLE_ADS_REFRESH_TOKEN.length} chars)` : 'Missing');
console.log('  Customer ID:', process.env.GOOGLE_ADS_CUSTOMER_ID);

async function test() {
  const client = new GoogleAdsApi({
    client_id: process.env.GOOGLE_ADS_CLIENT_ID,
    client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
    developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
  });

  const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID?.replace(/-/g, '');
  const loginCustomerId = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID?.replace(/-/g, '');

  console.log('  Using Customer ID:', customerId);
  console.log('  Using Login Customer ID:', loginCustomerId);

  const customer = client.Customer({
    customer_id: customerId,
    refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
    login_customer_id: loginCustomerId,
  });

  try {
    const campaigns = await customer.query(`
      SELECT campaign.id, campaign.name, campaign.status
      FROM campaign
      LIMIT 5
    `);
    console.log('\nSuccess! Found campaigns:');
    campaigns.forEach(c => {
      console.log(`  - ${c.campaign?.name} (${c.campaign?.status})`);
    });
  } catch (e) {
    console.log('\nError:', e.message);
    if (e.errors) {
      console.log('Details:', JSON.stringify(e.errors, null, 2));
    }
  }
}

test();
