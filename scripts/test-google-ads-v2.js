/**
 * Test Google Ads using the exact same code pattern as the main module
 */
const { GoogleAdsApi } = require('google-ads-api');

// Load env vars exactly like the test script does
const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match && !match[1].startsWith('#')) {
    process.env[match[1].trim()] = match[2].trim();
  }
});

async function test() {
  const clientId = process.env.GOOGLE_ADS_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET;
  const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
  const refreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN;
  const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID;
  const loginCustomerId = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID;

  console.log('Configuration:');
  console.log('  Client ID:', clientId ? clientId.substring(0, 20) + '...' : 'MISSING');
  console.log('  Client Secret:', clientSecret ? 'Set (' + clientSecret.length + ' chars)' : 'MISSING');
  console.log('  Developer Token:', developerToken ? 'Set' : 'MISSING');
  console.log('  Refresh Token:', refreshToken ? 'Set (' + refreshToken.length + ' chars)' : 'MISSING');
  console.log('  Customer ID:', customerId);
  console.log('  Login Customer ID:', loginCustomerId);
  console.log('');

  // Create client exactly like the main module
  const client = new GoogleAdsApi({
    client_id: clientId,
    client_secret: clientSecret,
    developer_token: developerToken,
  });

  const cleanCustomerId = customerId?.replace(/-/g, '');
  const cleanLoginCustomerId = loginCustomerId?.replace(/-/g, '');

  const customer = client.Customer({
    customer_id: cleanCustomerId,
    refresh_token: refreshToken,
    login_customer_id: cleanLoginCustomerId,
  });

  try {
    console.log('Attempting query...');
    const result = await customer.query(`
      SELECT campaign.id, campaign.name, campaign.status
      FROM campaign
      LIMIT 5
    `);

    console.log('\nSUCCESS! Found', result.length, 'campaigns:');
    result.forEach(r => {
      console.log('  -', r.campaign?.name, '(' + r.campaign?.status + ')');
    });
  } catch (error) {
    console.log('\nError:', error.message);

    if (error.errors) {
      console.log('\nDetailed errors:');
      error.errors.forEach((e, i) => {
        console.log('  ' + (i + 1) + '.', JSON.stringify(e, null, 2));
      });
    }

    // Check if it's an auth error
    if (error.message.includes('invalid_grant')) {
      console.log('\nThis is an OAuth token error. Possible causes:');
      console.log('  1. Refresh token has expired or been revoked');
      console.log('  2. Token was created with different OAuth credentials');
      console.log('  3. Google account password was changed');
    }
  }
}

test();
