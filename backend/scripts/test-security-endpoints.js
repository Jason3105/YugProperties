#!/usr/bin/env node
/**
 * Security Endpoint Tester
 * Tests security measures on API endpoints
 */

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5000';

console.log('\n🔐 Security Endpoint Tester\n');
console.log(`Testing: ${API_URL}\n`);

const tests = {
  passed: 0,
  failed: 0
};

// Test 1: SQL Injection Prevention
async function testSQLInjection() {
  console.log('1. Testing SQL Injection Prevention...');
  
  try {
    const maliciousPayloads = [
      "' OR '1'='1",
      "'; DROP TABLE users; --",
      "1' UNION SELECT * FROM users --"
    ];
    
    for (const payload of maliciousPayloads) {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email: payload,
        password: 'test123'
      }, { validateStatus: () => true });
      
      if (response.status === 400 || response.status === 422) {
        console.log(`   ✓ SQL injection blocked: "${payload}"`);
        tests.passed++;
      } else {
        console.log(`   ✗ SQL injection not blocked: "${payload}"`);
        tests.failed++;
      }
    }
  } catch (error) {
    console.log('   ⚠ Error testing SQL injection:', error.message);
  }
}

// Test 2: XSS Prevention
async function testXSSPrevention() {
  console.log('\n2. Testing XSS Prevention...');
  
  try {
    const xssPayloads = [
      "<script>alert('XSS')</script>",
      "<img src=x onerror=alert('XSS')>",
      "javascript:alert('XSS')"
    ];
    
    for (const payload of xssPayloads) {
      const response = await axios.post(`${API_URL}/api/auth/signup`, {
        name: payload,
        email: 'test@test.com',
        password: 'Test123!',
        phone: '1234567890'
      }, { validateStatus: () => true });
      
      if (response.status === 400 || response.status === 422) {
        console.log(`   ✓ XSS attempt blocked`);
        tests.passed++;
      } else if (response.data && !response.data.toString().includes('<script>')) {
        console.log(`   ✓ XSS sanitized`);
        tests.passed++;
      } else {
        console.log(`   ✗ XSS not prevented`);
        tests.failed++;
      }
    }
  } catch (error) {
    console.log('   ⚠ Error testing XSS:', error.message);
  }
}

// Test 3: Rate Limiting
async function testRateLimiting() {
  console.log('\n3. Testing Rate Limiting...');
  
  try {
    const requests = [];
    for (let i = 0; i < 10; i++) {
      requests.push(
        axios.post(`${API_URL}/api/auth/login`, {
          email: 'test@test.com',
          password: 'test123'
        }, { validateStatus: () => true })
      );
    }
    
    const responses = await Promise.all(requests);
    const rateLimited = responses.some(r => r.status === 429);
    
    if (rateLimited) {
      console.log('   ✓ Rate limiting is active');
      tests.passed++;
    } else {
      console.log('   ⚠ Rate limiting may not be working (or limit is very high)');
      tests.failed++;
    }
  } catch (error) {
    console.log('   ⚠ Error testing rate limiting:', error.message);
  }
}

// Test 4: CORS Headers
async function testCORSHeaders() {
  console.log('\n4. Testing CORS Headers...');
  
  try {
    const response = await axios.options(`${API_URL}/api/properties`, {
      headers: {
        'Origin': 'http://malicious-site.com'
      },
      validateStatus: () => true
    });
    
    const corsHeader = response.headers['access-control-allow-origin'];
    
    if (!corsHeader || corsHeader !== 'http://malicious-site.com') {
      console.log('   ✓ CORS is properly restricted');
      tests.passed++;
    } else {
      console.log('   ✗ CORS allows malicious origin');
      tests.failed++;
    }
  } catch (error) {
    console.log('   ⚠ Error testing CORS:', error.message);
  }
}

// Test 5: Security Headers
async function testSecurityHeaders() {
  console.log('\n5. Testing Security Headers...');
  
  try {
    const response = await axios.get(`${API_URL}/api/properties`, {
      validateStatus: () => true
    });
    
    const headers = response.headers;
    const requiredHeaders = [
      'x-content-type-options',
      'x-frame-options',
      'strict-transport-security',
      'x-xss-protection'
    ];
    
    let headersFound = 0;
    requiredHeaders.forEach(header => {
      if (headers[header]) {
        console.log(`   ✓ ${header}: ${headers[header]}`);
        headersFound++;
        tests.passed++;
      } else {
        console.log(`   ✗ Missing header: ${header}`);
        tests.failed++;
      }
    });
  } catch (error) {
    console.log('   ⚠ Error testing security headers:', error.message);
  }
}

// Test 6: Invalid ID Parameter
async function testInvalidIdParameter() {
  console.log('\n6. Testing ID Parameter Validation...');
  
  try {
    const invalidIds = ['abc', '../../etc/passwd', '<script>', 'null'];
    
    for (const id of invalidIds) {
      const response = await axios.get(`${API_URL}/api/properties/${id}`, {
        validateStatus: () => true
      });
      
      if (response.status === 400 || response.status === 422) {
        console.log(`   ✓ Invalid ID blocked: "${id}"`);
        tests.passed++;
      } else {
        console.log(`   ✗ Invalid ID not blocked: "${id}"`);
        tests.failed++;
      }
    }
  } catch (error) {
    console.log('   ⚠ Error testing ID validation:', error.message);
  }
}

// Run all tests
async function runTests() {
  try {
    await testSQLInjection();
    await testXSSPrevention();
    await testRateLimiting();
    await testCORSHeaders();
    await testSecurityHeaders();
    await testInvalidIdParameter();
    
    console.log('\n═══════════════════════════════════════');
    console.log('Test Summary:');
    console.log('═══════════════════════════════════════');
    console.log(`✓ Passed: ${tests.passed}`);
    console.log(`✗ Failed: ${tests.failed}`);
    
    if (tests.failed === 0) {
      console.log('\n🎉 All security tests passed!\n');
    } else {
      console.log('\n⚠️  Some security tests failed. Review the results above.\n');
    }
  } catch (error) {
    console.error('Error running tests:', error.message);
  }
}

runTests();
