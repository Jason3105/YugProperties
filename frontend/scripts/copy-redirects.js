const fs = require('fs');
const path = require('path');

const source = path.join(__dirname, '..', 'public', '_redirects');
const destination = path.join(__dirname, '..', 'build', '_redirects');

try {
  // Ensure build directory exists
  const buildDir = path.join(__dirname, '..', 'build');
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
  }

  // Copy _redirects file
  fs.copyFileSync(source, destination);
  console.log('✅ _redirects file copied to build directory');
} catch (error) {
  console.error('❌ Error copying _redirects file:', error);
  process.exit(1);
}
