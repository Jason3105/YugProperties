const pool = require('./config/database');

async function createWishlistTable() {
  try {
    console.log('🚀 Creating wishlist table...');

    const query = `
      CREATE TABLE IF NOT EXISTS wishlist (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, property_id)
      );
      
      CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist(user_id);
      CREATE INDEX IF NOT EXISTS idx_wishlist_property_id ON wishlist(property_id);
    `;

    await pool.query(query);
    console.log('✅ Successfully created wishlist table');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating wishlist table:', error);
    process.exit(1);
  }
}

createWishlistTable();
