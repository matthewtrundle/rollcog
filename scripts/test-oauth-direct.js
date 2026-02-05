/**
 * Test OAuth token exchange directly using native https
 */
const https = require('https');
const fs = require('fs');

// Load env vars
const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match && !match[1].startsWith('#')) {
    process.env[match[1].trim()] = match[2].trim();
  }
});

const clientId = process.env.GOOGLE_ADS_CLIENT_ID;
const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET;
const refreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN;

console.log('Testing OAuth token exchange...');
console.log('Client ID:', clientId ? clientId.substring(0, 20) + '...' : 'MISSING');
console.log('Client Secret:', clientSecret ? 'Set' : 'MISSING');
console.log('Refresh Token:', refreshToken ? refreshToken.substring(0, 30) + '...' : 'MISSING');
console.log('');

const postData = new URLSearchParams({
  client_id: clientId,
  client_secret: clientSecret,
  refresh_token: refreshToken,
  grant_type: 'refresh_token'
}).toString();

const options = {
  hostname: 'oauth2.googleapis.com',
  path: '/token',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      if (response.access_token) {
        console.log('SUCCESS! Got access token:', response.access_token.substring(0, 30) + '...');
        console.log('Token type:', response.token_type);
        console.log('Expires in:', response.expires_in, 'seconds');
      } else {
        console.log('ERROR:', response.error);
        console.log('Description:', response.error_description);
      }
    } catch (e) {
      console.log('Failed to parse response:', data);
    }
  });
});

req.on('error', e => console.log('Request error:', e.message));
req.write(postData);
req.end();
