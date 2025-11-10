const pool = require('../config/database');

async function addBrochureColumn() {
  try {
    // Add brochure_url column to properties table
    const query = `
      ALTER TABLE properties 
      ADD COLUMN IF NOT EXISTS brochure_url TEXT;
    `;
    
    await pool.query(query);
    console.log('✅ Successfully added brochure_url column to properties table');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding brochure_url column:', error);
    process.exit(1);
  }
}

addBrochureColumn();
