const pool = require('./config/database');

async function addLocationField() {
  try {
    // Add location column to users table
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS location VARCHAR(255)
    `);
    
    console.log('✅ Successfully added location field to users table');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding location field:', error);
    process.exit(1);
  }
}

addLocationField();
