/**
 * Security Testing Script
 * Run this after starting the server to verify security features
 */

const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:5000';

console.log('🔐 Testing Security Features...\n');

// Test 1: Check Security Headers
console.log('1️⃣ Testing Security Headers...');
http.get(`${BASE_URL}/api/properties`, (res) => {
  console.log('   ✓ X-Content-Type-Options:', res.headers['x-content-type-options'] || '❌ Missing');
  console.log('   ✓ X-Frame-Options:', res.headers['x-frame-options'] || '❌ Missing');
  console.log('   ✓ X-XSS-Protection:', res.headers['x-xss-protection'] || '❌ Missing');
  console.log('   ✓ Referrer-Policy:', res.headers['referrer-policy'] || '❌ Missing');
  console.log('   ✓ Content-Security-Policy:', res.headers['content-security-policy'] ? '✓ Present' : '❌ Missing');
  console.log('');
  
  // Test 2: Rate Limiting (Auth)
  console.log('2️⃣ Testing Auth Rate Limiting (5 attempts max)...');
  let attempts = 0;
  
  const testRateLimit = () => {
    if (attempts >= 6) {
      console.log('   Rate limit test complete!\n');
      return;
    }
    
    attempts++;
    const postData = JSON.stringify({
      email: 'test@test.com',
      password: 'test123'
    });
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length
      }
    };
    
    const req = http.request(options, (res) => {
      if (res.statusCode === 429) {
        console.log(`   ✓ Attempt ${attempts}: Rate limited! (Status: 429)`);
      } else {
        console.log(`   ○ Attempt ${attempts}: Allowed (Status: ${res.statusCode})`);
      }
      
      setTimeout(testRateLimit, 500);
    });
    
    req.on('error', (e) => {
      console.error(`   ✗ Attempt ${attempts} error:`, e.message);
      setTimeout(testRateLimit, 500);
    });
    
    req.write(postData);
    req.end();
  };
  
  testRateLimit();
}).on('error', (e) => {
  console.error('❌ Error:', e.message);
  console.error('   Make sure the server is running on port 5000');
});

console.log('\n📝 Manual Tests to Perform:');
console.log('   1. Open browser DevTools → Network → Check response headers');
console.log('   2. Try rapid login attempts → Should get rate limited');
console.log('   3. Try to embed site in iframe → Should be blocked');
console.log('   4. Check console for CSP warnings if any resources blocked');
console.log('\n💡 Tip: Set NODE_ENV=production to test production behavior');
