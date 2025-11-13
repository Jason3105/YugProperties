const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, '..', 'build');
const publicDir = path.join(__dirname, '..', 'public');

try {
  // Ensure build directory exists
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
  }

  // Copy _redirects file
  const redirectsSource = path.join(publicDir, '_redirects');
  const redirectsDest = path.join(buildDir, '_redirects');
  fs.copyFileSync(redirectsSource, redirectsDest);
  console.log('✅ _redirects file copied to build directory');

  // Copy _headers file if it exists
  const headersSource = path.join(publicDir, '_headers');
  const headersDest = path.join(buildDir, '_headers');
  if (fs.existsSync(headersSource)) {
    fs.copyFileSync(headersSource, headersDest);
    console.log('✅ _headers file copied to build directory');
  }

  console.log('✅ Render configuration files copied successfully');
} catch (error) {
  console.error('❌ Error copying files:', error);
  process.exit(1);
}
