const pool = require('./database');
const bcrypt = require('bcryptjs');
const Property = require('../models/Property');
const PropertyView = require('../models/PropertyView');
require('dotenv').config();

const initDatabase = async () => {
  try {
    console.log('🚀 Initializing database...');

    // Create users table
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await pool.query(createUsersTable);
    console.log('✅ Users table created/verified');

    // Create index on email for faster lookups
    const createEmailIndex = `
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `;
    await pool.query(createEmailIndex);
    console.log('✅ Email index created');

    // Create properties table
    await Property.createTable();
    console.log('✅ Properties table created/verified');

    // Create property_views table for tracking unique views
    await PropertyView.createTable();
    console.log('✅ Property views table created/verified');

    // Create default admin user
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    // Check if admin exists
    const checkAdmin = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [adminEmail]
    );

    if (checkAdmin.rows.length === 0) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await pool.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
        ['Admin User', adminEmail, hashedPassword, 'admin']
      );
      console.log('✅ Default admin user created');
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Password: ${adminPassword}`);
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    console.log('🎉 Database initialization completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
};

initDatabase();
