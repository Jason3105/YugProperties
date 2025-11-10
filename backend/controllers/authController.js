const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const pool = require('../config/database');

// Generate JWT Token
const generateToken = (userId, email, role) => {
  return jwt.sign(
    { id: userId, email, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Register User
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { name, email, password, phone, location, role } = req.body;

    // Check if user already exists
    const userExists = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Prevent regular users from creating admin accounts
    const userRole = role === 'admin' ? 'user' : (role || 'user');

    // Insert new user
    const result = await pool.query(
      'INSERT INTO users (name, email, password, phone, location, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, phone, location, role, created_at',
      [name, email, hashedPassword, phone || null, location || null, userRole]
    );

    const newUser = result.rows[0];

    // Generate token
    const token = generateToken(newUser.id, newUser.email, newUser.role);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        location: newUser.location,
        role: newUser.role,
        createdAt: newUser.created_at
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { email, password, role } = req.body;

    // Find user by email
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = result.rows[0];

    // Check if role matches (if role is specified)
    if (role && user.role !== role) {
      return res.status(401).json({
        success: false,
        message: `Invalid credentials for ${role} login`
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user.id, user.email, user.role);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        role: user.role,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
};

// Get Current User
exports.getCurrentUser = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, phone, location, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update User Profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, location } = req.body;
    const userId = req.user.id;

    const result = await pool.query(
      'UPDATE users SET name = $1, phone = $2, location = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING id, name, email, phone, location, role',
      [name, phone, location, userId]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get Admin Stats (Admin Only)
exports.getAdminStats = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    // Get total users count
    const usersResult = await pool.query('SELECT COUNT(*) FROM users');
    const totalUsers = parseInt(usersResult.rows[0].count);

    // Get users registered in last 7 days
    const recentUsersResult = await pool.query(
      'SELECT COUNT(*) FROM users WHERE created_at >= NOW() - INTERVAL \'7 days\''
    );
    const recentUsers = parseInt(recentUsersResult.rows[0].count);

    // Get total properties
    const propertiesResult = await pool.query('SELECT COUNT(*) FROM properties');
    const totalProperties = parseInt(propertiesResult.rows[0].count);

    // Get active listings
    const activeResult = await pool.query(
      'SELECT COUNT(*) FROM properties WHERE status = $1',
      ['available']
    );
    const activeListings = parseInt(activeResult.rows[0].count);

    // Get sold/rented properties
    const soldResult = await pool.query(
      'SELECT COUNT(*) FROM properties WHERE status IN ($1, $2)',
      ['sold', 'rented']
    );
    const soldProperties = parseInt(soldResult.rows[0].count);

    // Get pending properties
    const pendingResult = await pool.query(
      'SELECT COUNT(*) FROM properties WHERE status = $1',
      ['pending']
    );
    const pendingProperties = parseInt(pendingResult.rows[0].count);

    // Get total notes count
    const notesResult = await pool.query('SELECT COUNT(*) FROM notes');
    const totalNotes = parseInt(notesResult.rows[0].count);

    // Get total property views
    const viewsResult = await pool.query('SELECT SUM(views) as total_views FROM properties');
    const totalPropertyViews = parseInt(viewsResult.rows[0].total_views || 0);

    // Get recent users (last 10)
    const recentUsersListResult = await pool.query(
      'SELECT id, name, email, phone, location, role, created_at FROM users ORDER BY created_at DESC LIMIT 10'
    );

    res.json({
      success: true,
      stats: {
        totalUsers,
        recentUsers,
        totalProperties,
        activeListings,
        soldProperties,
        pendingProperties,
        totalNotes,
        totalPropertyViews
      },
      recentUsersList: recentUsersListResult.rows
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get Growth Reports (Admin Only)
exports.getGrowthReports = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    // Get monthly user registrations for last 12 months
    const userGrowthResult = await pool.query(`
      SELECT 
        TO_CHAR(created_at, 'Mon YYYY') as month,
        DATE_TRUNC('month', created_at) as month_date,
        COUNT(*) as count
      FROM users
      WHERE created_at >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at), TO_CHAR(created_at, 'Mon YYYY')
      ORDER BY month_date ASC
    `);

    // Get monthly property additions for last 12 months
    const propertyGrowthResult = await pool.query(`
      SELECT 
        TO_CHAR(posted_on, 'Mon YYYY') as month,
        DATE_TRUNC('month', posted_on) as month_date,
        COUNT(*) as count
      FROM properties
      WHERE posted_on >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', posted_on), TO_CHAR(posted_on, 'Mon YYYY')
      ORDER BY month_date ASC
    `);

    // Get property status distribution
    const statusDistributionResult = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM properties
      GROUP BY status
    `);

    // Get user role distribution
    const roleDistributionResult = await pool.query(`
      SELECT role, COUNT(*) as count
      FROM users
      GROUP BY role
    `);

    // Get property views growth (last 12 months)
    const viewsGrowthResult = await pool.query(`
      SELECT 
        TO_CHAR(viewed_at, 'Mon YYYY') as month,
        DATE_TRUNC('month', viewed_at) as month_date,
        COUNT(*) as count
      FROM property_views
      WHERE viewed_at >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', viewed_at), TO_CHAR(viewed_at, 'Mon YYYY')
      ORDER BY month_date ASC
    `);

    // Get storage growth (last 12 months or all available data)
    const storageGrowthResult = await pool.query(`
      SELECT 
        record_month as month,
        total_files as files,
        CAST(total_size_mb AS DECIMAL) as size_mb,
        CAST(total_size_mb / 1024.0 AS DECIMAL) as size_gb,
        0 as size_bytes,
        images_count,
        CAST(images_size_mb AS DECIMAL) as images_size_mb,
        brochures_count,
        CAST(brochures_size_mb AS DECIMAL) as brochures_size_mb,
        created_at
      FROM storage_history
      WHERE created_at >= NOW() - INTERVAL '12 months'
      ORDER BY record_month ASC
    `);

    res.json({
      success: true,
      reports: {
        userGrowth: userGrowthResult.rows,
        propertyGrowth: propertyGrowthResult.rows,
        statusDistribution: statusDistributionResult.rows,
        roleDistribution: roleDistributionResult.rows,
        viewsGrowth: viewsGrowthResult.rows,
        storageGrowth: storageGrowthResult.rows
      }
    });
  } catch (error) {
    console.error('Get growth reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get All Users (Admin Only)
exports.getAllUsers = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const result = await pool.query(
      'SELECT id, name, email, phone, location, role, created_at FROM users ORDER BY created_at DESC'
    );

    res.json({
      success: true,
      users: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
