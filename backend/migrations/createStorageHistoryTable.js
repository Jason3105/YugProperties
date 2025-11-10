/**
 * Migration: Create storage_history table
 * Tracks monthly storage usage for analytics
 */

const pool = require('../config/database');

async function createStorageHistoryTable() {
  try {
    console.log('🚀 Creating storage_history table...');

    // Drop table if exists to recreate properly
    const dropTableQuery = `DROP TABLE IF EXISTS storage_history;`;
    await pool.query(dropTableQuery);
    console.log('✅ Dropped existing storage_history table if it existed');

    const createTableQuery = `
      CREATE TABLE storage_history (
        id SERIAL PRIMARY KEY,
        record_month VARCHAR(7) NOT NULL UNIQUE,
        total_files INTEGER DEFAULT 0,
        total_size_mb DECIMAL(10, 2) DEFAULT 0,
        images_count INTEGER DEFAULT 0,
        images_size_mb DECIMAL(10, 2) DEFAULT 0,
        brochures_count INTEGER DEFAULT 0,
        brochures_size_mb DECIMAL(10, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await pool.query(createTableQuery);
    console.log('✅ storage_history table created');

    // Create index on record_month for faster queries
    const createIndexQuery = `
      CREATE INDEX idx_storage_history_month 
      ON storage_history(record_month DESC);
    `;
    await pool.query(createIndexQuery);
    console.log('✅ Index created on record_month column');

    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating storage_history table:', error);
    process.exit(1);
  }
}

createStorageHistoryTable();
