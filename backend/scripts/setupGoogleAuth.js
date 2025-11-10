const { google } = require('googleapis');
const readline = require('readline');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:5000/oauth2callback'
);

const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive'
];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function getAccessToken() {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('\n📋 GOOGLE DRIVE AUTHENTICATION SETUP');
  console.log('=====================================\n');
  console.log('1. Open this URL in your browser:');
  console.log('\n' + authUrl + '\n');
  console.log('2. Authorize the application');
  console.log('3. Copy the code from the URL (after "code=")\n');

  rl.question('Enter the authorization code here: ', async (code) => {
    try {
      const { tokens } = await oauth2Client.getToken(code);
      
      console.log('\n✅ Authentication successful!\n');
      console.log('Add these lines to your .env file:\n');
      console.log('GOOGLE_ACCESS_TOKEN=' + tokens.access_token);
      console.log('GOOGLE_REFRESH_TOKEN=' + tokens.refresh_token);
      
      // Optionally, append to .env file
      const envPath = path.join(__dirname, '..', '.env');
      const envContent = `\n# Google OAuth2 Tokens (Generated: ${new Date().toISOString()})\nGOOGLE_ACCESS_TOKEN=${tokens.access_token}\nGOOGLE_REFRESH_TOKEN=${tokens.refresh_token}\n`;
      
      fs.appendFileSync(envPath, envContent);
      console.log('\n✅ Tokens have been automatically added to your .env file!');
      console.log('🚀 You can now restart your server and upload images.\n');
      
    } catch (error) {
      console.error('❌ Error retrieving access token:', error.message);
    }
    rl.close();
  });
}

getAccessToken();
