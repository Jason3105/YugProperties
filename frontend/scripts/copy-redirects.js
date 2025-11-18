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

  // Copy 404.html file if it exists
  const notFoundSource = path.join(publicDir, '404.html');
  const notFoundDest = path.join(buildDir, '404.html');
  if (fs.existsSync(notFoundSource)) {
    fs.copyFileSync(notFoundSource, notFoundDest);
    console.log('✅ 404.html file copied to build directory');
  }

  // Copy render.toml file if it exists
  const renderTomlSource = path.join(publicDir, 'render.toml');
  const renderTomlDest = path.join(buildDir, 'render.toml');
  if (fs.existsSync(renderTomlSource)) {
    fs.copyFileSync(renderTomlSource, renderTomlDest);
    console.log('✅ render.toml file copied to build directory');
  }

  console.log('✅ Render configuration files copied successfully');
} catch (error) {
  console.error('❌ Error copying files:', error);
  process.exit(1);
}
