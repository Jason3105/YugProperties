#!/usr/bin/env node
/**
 * Security Environment Validator
 * Checks for secure configuration and potential security issues
 */

require('dotenv').config();

// Simple color helpers (no external dependency)
const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[36m${text}\x1b[0m`
};

console.log('\n🔒 Security Configuration Validator\n');

const checks = {
  passed: 0,
  warnings: 0,
  failed: 0
};

// Check 1: Environment variables
console.log(colors.blue('1. Checking Environment Variables...'));

const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'DATABASE_URL',
  'JWT_SECRET',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD'
];

requiredEnvVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(colors.green(`   ✓ ${varName} is set`));
    checks.passed++;
  } else {
    console.log(colors.red(`   ✗ ${varName} is missing`));
    checks.failed++;
  }
});

// Check 2: JWT Secret strength
console.log(colors.blue('\n2. Checking JWT Secret Strength...'));
const jwtSecret = process.env.JWT_SECRET;
if (jwtSecret) {
  if (jwtSecret.length >= 32) {
    console.log(colors.green('   ✓ JWT_SECRET is strong (32+ characters)'));
    checks.passed++;
  } else {
    console.log(colors.yellow('   ⚠ JWT_SECRET should be at least 32 characters'));
    checks.warnings++;
  }
  
  if (!/^[a-zA-Z0-9]+$/.test(jwtSecret)) {
    console.log(colors.green('   ✓ JWT_SECRET contains special characters'));
    checks.passed++;
  } else {
    console.log(colors.yellow('   ⚠ JWT_SECRET should contain special characters'));
    checks.warnings++;
  }
}

// Check 3: Admin password strength
console.log(colors.blue('\n3. Checking Admin Password...'));
const adminPassword = process.env.ADMIN_PASSWORD;
if (adminPassword) {
  if (adminPassword.length >= 8) {
    console.log(colors.green('   ✓ Admin password is at least 8 characters'));
    checks.passed++;
  } else {
    console.log(colors.red('   ✗ Admin password must be at least 8 characters'));
    checks.failed++;
  }
  
  if (/[A-Z]/.test(adminPassword) && /[a-z]/.test(adminPassword) && /[0-9]/.test(adminPassword)) {
    console.log(colors.green('   ✓ Admin password has uppercase, lowercase, and numbers'));
    checks.passed++;
  } else {
    console.log(colors.yellow('   ⚠ Admin password should have uppercase, lowercase, and numbers'));
    checks.warnings++;
  }
}

// Check 4: Database URL security
console.log(colors.blue('\n4. Checking Database Configuration...'));
const dbUrl = process.env.DATABASE_URL;
if (dbUrl) {
  if (dbUrl.includes('ssl=true') || dbUrl.includes('sslmode=require')) {
    console.log(colors.green('   ✓ Database connection uses SSL'));
    checks.passed++;
  } else {
    console.log(colors.yellow('   ⚠ Consider enabling SSL for database connection'));
    checks.warnings++;
  }
  
  if (dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1')) {
    console.log(colors.yellow('   ⚠ Using local database (development mode)'));
    checks.warnings++;
  } else {
    console.log(colors.green('   ✓ Using remote database (production mode)'));
    checks.passed++;
  }
}

// Check 5: Environment mode
console.log(colors.blue('\n5. Checking Environment Mode...'));
if (process.env.NODE_ENV === 'production') {
  console.log(colors.green('   ✓ Running in production mode'));
  checks.passed++;
  
  // Additional production checks
  if (process.env.FRONTEND_URL && process.env.FRONTEND_URL.startsWith('https://')) {
    console.log(colors.green('   ✓ Frontend URL uses HTTPS'));
    checks.passed++;
  } else {
    console.log(colors.yellow('   ⚠ Frontend URL should use HTTPS in production'));
    checks.warnings++;
  }
} else {
  console.log(colors.yellow('   ⚠ Running in development mode'));
  checks.warnings++;
}

// Check 6: Firebase configuration
console.log(colors.blue('\n6. Checking Firebase Configuration...'));
if (process.env.FIREBASE_TYPE || process.env.FIREBASE_PROJECT_ID) {
  console.log(colors.green('   ✓ Firebase credentials are configured'));
  checks.passed++;
} else {
  console.log(colors.yellow('   ⚠ Firebase credentials not found (image storage may not work)'));
  checks.warnings++;
}

// Check 7: CORS configuration
console.log(colors.blue('\n7. Checking CORS Configuration...'));
if (process.env.FRONTEND_URL) {
  console.log(colors.green('   ✓ FRONTEND_URL is set for CORS'));
  checks.passed++;
} else {
  console.log(colors.yellow('   ⚠ FRONTEND_URL not set (using default CORS origins)'));
  checks.warnings++;
}

// Summary
console.log(colors.blue('\n═══════════════════════════════════════'));
console.log(colors.blue('Security Check Summary:'));
console.log(colors.blue('═══════════════════════════════════════'));
console.log(colors.green(`✓ Passed: ${checks.passed}`));
console.log(colors.yellow(`⚠ Warnings: ${checks.warnings}`));
console.log(colors.red(`✗ Failed: ${checks.failed}`));

if (checks.failed === 0 && checks.warnings === 0) {
  console.log(colors.green('\n🎉 All security checks passed! Your configuration is secure.'));
  process.exit(0);
} else if (checks.failed === 0) {
  console.log(colors.yellow('\n⚠️  Configuration is mostly secure but has some warnings.'));
  process.exit(0);
} else {
  console.log(colors.red('\n❌ Security issues detected! Please fix the failed checks above.'));
  process.exit(1);
}
