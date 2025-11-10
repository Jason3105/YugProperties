/**
 * Script to Update Admin Password in Database
 * Run this to change the admin password to the one in .env
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function updateAdminPassword() {
  try {
    console.log('🔄 Connecting to database...');
    
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@yugproperties.co.in';
    const newPassword = process.env.ADMIN_PASSWORD || 'pArI123#';
    
    console.log(`📧 Admin Email: ${adminEmail}`);
    console.log(`🔑 New Password: ${newPassword}`);
    
    // Check if admin exists
    const checkQuery = 'SELECT id, email, role FROM users WHERE email = $1';
    const checkResult = await pool.query(checkQuery, [adminEmail]);
    
    if (checkResult.rows.length === 0) {
      console.error('❌ Admin user not found!');
      console.log('💡 Creating admin user...');
      
      // Create admin user
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const insertQuery = `
        INSERT INTO users (name, email, password, role, created_at)
        VALUES ($1, $2, $3, $4, NOW())
        RETURNING id, email, role
      `;
      
      const insertResult = await pool.query(insertQuery, [
        'Admin',
        adminEmail,
        hashedPassword,
        'admin'
      ]);
      
      console.log('✅ Admin user created successfully!');
      console.log('👤 Admin Details:', insertResult.rows[0]);
    } else {
      console.log('✅ Admin user found:', checkResult.rows[0]);
      
      // Hash the new password
      console.log('🔒 Hashing new password...');
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update the password
      const updateQuery = 'UPDATE users SET password = $1 WHERE email = $2 RETURNING id, email, role';
      const updateResult = await pool.query(updateQuery, [hashedPassword, adminEmail]);
      
      console.log('✅ Admin password updated successfully!');
      console.log('👤 Updated User:', updateResult.rows[0]);
    }
    
    console.log('\n🎉 Done! You can now login with:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${newPassword}`);
    
  } catch (error) {
    console.error('❌ Error updating admin password:', error.message);
  } finally {
    await pool.end();
  }
}

updateAdminPassword();
