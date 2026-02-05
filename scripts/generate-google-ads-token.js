/**
 * Google Ads OAuth Token Generator
 *
 * Run this script to get a new refresh token for Google Ads API.
 *
 * Usage:
 *   1. Run: node scripts/generate-google-ads-token.js
 *   2. Open the URL in your browser
 *   3. Sign in with the Google account that has access to Google Ads
 *   4. Copy the authorization code back to the terminal
 *   5. The script will exchange it for a refresh token
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const readline = require('readline');

// Load env vars
const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match && !match[1].startsWith('#')) {
    process.env[match[1].trim()] = match[2].trim();
  }
});

const CLIENT_ID = process.env.GOOGLE_ADS_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_ADS_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Missing GOOGLE_ADS_CLIENT_ID or GOOGLE_ADS_CLIENT_SECRET in .env.local');
  process.exit(1);
}

// Google Ads API scope
const SCOPE = 'https://www.googleapis.com/auth/adwords';
const REDIRECT_URI = 'urn:ietf:wg:oauth:2.0:oob';

// Generate authorization URL
const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
  `client_id=${encodeURIComponent(CLIENT_ID)}` +
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
  `&scope=${encodeURIComponent(SCOPE)}` +
  `&response_type=code` +
  `&access_type=offline` +
  `&prompt=consent`;

console.log('\n===========================================');
console.log('Google Ads OAuth Token Generator');
console.log('===========================================\n');

console.log('Step 1: Open this URL in your browser:\n');
console.log(authUrl);
console.log('\n');

console.log('Step 2: Sign in with the Google account that has access to Google Ads');
console.log('Step 3: Authorize the application');
console.log('Step 4: Copy the authorization code shown on the page\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Paste the authorization code here: ', async (code) => {
  rl.close();

  if (!code || code.trim() === '') {
    console.error('\nNo authorization code provided.');
    process.exit(1);
  }

  console.log('\nExchanging code for tokens...');

  // Exchange code for tokens
  const tokenData = new URLSearchParams({
    code: code.trim(),
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    grant_type: 'authorization_code'
  });

  const options = {
    hostname: 'oauth2.googleapis.com',
    path: '/token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': tokenData.toString().length
    }
  };

  const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(data);

        if (response.error) {
          console.error('\nError:', response.error);
          console.error('Description:', response.error_description);
          process.exit(1);
        }

        console.log('\n===========================================');
        console.log('SUCCESS! New tokens generated');
        console.log('===========================================\n');

        if (response.refresh_token) {
          console.log('REFRESH TOKEN (save this in .env.local as GOOGLE_ADS_REFRESH_TOKEN):');
          console.log(response.refresh_token);
          console.log('\n');

          console.log('Update your .env.local file with:');
          console.log(`GOOGLE_ADS_REFRESH_TOKEN=${response.refresh_token}`);
        } else {
          console.log('No refresh token returned. This can happen if you already authorized');
          console.log('this app before. Try revoking access at:');
          console.log('https://myaccount.google.com/permissions');
          console.log('Then run this script again.');
        }

        if (response.access_token) {
          console.log('\nAccess Token (temporary, expires in ~1 hour):');
          console.log(response.access_token.substring(0, 50) + '...');
        }

      } catch (e) {
        console.error('\nFailed to parse response:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error('\nRequest failed:', e.message);
  });

  req.write(tokenData.toString());
  req.end();
});
