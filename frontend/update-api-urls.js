// Script to update API URLs for production
// Run this script before deploying to production

const fs = require('fs');
const path = require('path');

const LOCALHOST_URL = 'http://localhost:5000';
const PRODUCTION_URL = process.env.REACT_APP_API_URL || 'YOUR_PRODUCTION_URL_HERE';

function findAndReplaceInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Replace localhost URLs
    content = content.replace(new RegExp(LOCALHOST_URL, 'g'), PRODUCTION_URL);
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function walkDirectory(dir, callback) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and build directories
      if (file !== 'node_modules' && file !== 'build' && file !== '.git') {
        walkDirectory(filePath, callback);
      }
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      callback(filePath);
    }
  });
}

console.log('🔍 Scanning for API URLs to update...\n');
console.log(`Replacing: ${LOCALHOST_URL}`);
console.log(`With: ${PRODUCTION_URL}\n`);

let filesUpdated = 0;

// Update files in src directory
const srcDir = path.join(__dirname, 'src');
walkDirectory(srcDir, (filePath) => {
  if (findAndReplaceInFile(filePath)) {
    filesUpdated++;
  }
});

console.log(`\n✨ Done! Updated ${filesUpdated} file(s)`);

if (filesUpdated === 0) {
  console.log('ℹ️  No files needed updating. Already using production URLs?');
} else {
  console.log('\n⚠️  IMPORTANT: Review the changes before committing!');
  console.log('   Run: git diff');
}
