const pool = require('./config/database');

async function addContactFields() {
  try {
    console.log('Adding contact fields to properties table...');
    
    const query = `
      ALTER TABLE properties 
      ADD COLUMN IF NOT EXISTS contact_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(20),
      ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255);
    `;
    
    await pool.query(query);
    console.log('✅ Contact fields added successfully!');
    console.log('   - contact_name');
    console.log('   - contact_phone');
    console.log('   - contact_email');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding contact fields:', error);
    process.exit(1);
  }
}

addContactFields();
