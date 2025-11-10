const pool = require('../config/database');

// Add property to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { propertyId } = req.body;
    const userId = req.user.id;

    // Check if user is admin
    if (req.user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admins cannot save properties to wishlist'
      });
    }

    // Check if property exists
    const propertyCheck = await pool.query(
      'SELECT id FROM properties WHERE id = $1',
      [propertyId]
    );

    if (propertyCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check if already in wishlist
    const existingCheck = await pool.query(
      'SELECT id FROM wishlist WHERE user_id = $1 AND property_id = $2',
      [userId, propertyId]
    );

    if (existingCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Property already in wishlist'
      });
    }

    // Add to wishlist
    const result = await pool.query(
      'INSERT INTO wishlist (user_id, property_id) VALUES ($1, $2) RETURNING *',
      [userId, propertyId]
    );

    res.json({
      success: true,
      message: 'Property added to wishlist',
      wishlistItem: result.rows[0]
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Remove property from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      'DELETE FROM wishlist WHERE user_id = $1 AND property_id = $2 RETURNING *',
      [userId, propertyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Property not found in wishlist'
      });
    }

    res.json({
      success: true,
      message: 'Property removed from wishlist'
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get user's wishlist
exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT 
        w.id as wishlist_id,
        w.created_at as saved_at,
        p.*
      FROM wishlist w
      JOIN properties p ON w.property_id = p.id
      WHERE w.user_id = $1
      ORDER BY w.created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      count: result.rows.length,
      properties: result.rows
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Check if property is in wishlist
exports.checkWishlistStatus = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      'SELECT id FROM wishlist WHERE user_id = $1 AND property_id = $2',
      [userId, propertyId]
    );

    res.json({
      success: true,
      isSaved: result.rows.length > 0
    });
  } catch (error) {
    console.error('Check wishlist status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
