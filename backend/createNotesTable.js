const pool = require('./config/database');

async function createNotesTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255),
        content TEXT,
        color VARCHAR(50) DEFAULT 'default',
        is_pinned BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('✅ Successfully created notes table');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating notes table:', error);
    process.exit(1);
  }
}

createNotesTable();
