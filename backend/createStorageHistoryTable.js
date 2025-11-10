const pool = require('./config/database');

async function createStorageHistoryTable() {
  try {
    console.log('🚀 Creating storage_history table...');

    const query = `
      CREATE TABLE IF NOT EXISTS storage_history (
        id SERIAL PRIMARY KEY,
        total_files INTEGER NOT NULL,
        total_size_bytes BIGINT NOT NULL,
        total_size_mb DECIMAL(10, 2) NOT NULL,
        total_size_gb DECIMAL(10, 2) NOT NULL,
        recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_storage_history_recorded_at ON storage_history(recorded_at);
    `;

    await pool.query(query);
    console.log('✅ Successfully created storage_history table');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating storage_history table:', error);
    process.exit(1);
  }
}

createStorageHistoryTable();
