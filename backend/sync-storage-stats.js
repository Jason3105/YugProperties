/**
 * Sync Firebase Storage Stats with Database
 * Run this script after manually deleting files from Firebase Storage
 * or to initialize storage history tracking
 */

require('dotenv').config();
const { updateStorageHistory } = require('./services/storageHistory');

async function syncStorageStats() {
  try {
    console.log('🔄 Syncing Firebase Storage stats with database...\n');
    
    const result = await updateStorageHistory();
    
    console.log('\n✨ Sync Complete! Storage history updated.');
    console.log('\n📊 Current Month Stats:');
    console.log(`   Month: ${result.record_month}`);
    console.log(`   Total Files: ${result.total_files}`);
    console.log(`   Total Size: ${result.total_size_mb} MB`);
    console.log(`   Images: ${result.images_count} files (${result.images_size_mb} MB)`);
    console.log(`   Brochures: ${result.brochures_count} files (${result.brochures_size_mb} MB)`);
    console.log(`   Last Updated: ${new Date(result.updated_at).toLocaleString()}`);
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error syncing storage stats:', error.message);
    process.exit(1);
  }
}

syncStorageStats();
