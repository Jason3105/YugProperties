const pool = require('../config/database');

class PropertyView {
  // Create property_views table
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS property_views (
        id SERIAL PRIMARY KEY,
        property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        session_id VARCHAR(255),
        ip_address VARCHAR(45),
        viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(property_id, user_id),
        UNIQUE(property_id, session_id)
      );
      CREATE INDEX IF NOT EXISTS idx_property_views_property_id ON property_views(property_id);
      CREATE INDEX IF NOT EXISTS idx_property_views_user_id ON property_views(user_id);
      CREATE INDEX IF NOT EXISTS idx_property_views_session_id ON property_views(session_id);
    `;
    
    try {
      await pool.query(query);
      console.log('✅ Property views table created successfully');
    } catch (error) {
      console.error('Error creating property_views table:', error);
      throw error;
    }
  }

  // Record a view (only if unique)
  static async recordView(propertyId, userId = null, sessionId = null, ipAddress = null) {
    try {
      // Check if this user/session has already viewed this property
      let checkQuery;
      let checkParams;
      
      if (userId) {
        // For logged-in users, check by user_id
        checkQuery = 'SELECT id FROM property_views WHERE property_id = $1 AND user_id = $2';
        checkParams = [propertyId, userId];
      } else if (sessionId) {
        // For anonymous users, check by session_id
        checkQuery = 'SELECT id FROM property_views WHERE property_id = $1 AND session_id = $2';
        checkParams = [propertyId, sessionId];
      } else {
        // No way to track, skip
        return { isNew: false, viewCount: 0 };
      }

      const existingView = await pool.query(checkQuery, checkParams);

      if (existingView.rows.length > 0) {
        // User/session has already viewed this property
        // Update the viewed_at timestamp
        await pool.query(
          'UPDATE property_views SET viewed_at = CURRENT_TIMESTAMP WHERE id = $1',
          [existingView.rows[0].id]
        );
        
        // Get current view count
        const countResult = await pool.query(
          'SELECT views FROM properties WHERE id = $1',
          [propertyId]
        );
        
        return { 
          isNew: false, 
          viewCount: countResult.rows[0]?.views || 0 
        };
      }

      // This is a new view, insert it
      await pool.query(
        `INSERT INTO property_views (property_id, user_id, session_id, ip_address) 
         VALUES ($1, $2, $3, $4)`,
        [propertyId, userId, sessionId, ipAddress]
      );

      // Increment the views counter in properties table
      const result = await pool.query(
        'UPDATE properties SET views = views + 1 WHERE id = $1 RETURNING views',
        [propertyId]
      );

      return { 
        isNew: true, 
        viewCount: result.rows[0]?.views || 1 
      };
    } catch (error) {
      console.error('Error recording view:', error);
      throw error;
    }
  }

  // Get unique viewers count for a property
  static async getUniqueViewers(propertyId) {
    try {
      const result = await pool.query(
        'SELECT COUNT(DISTINCT COALESCE(user_id::text, session_id)) as unique_viewers FROM property_views WHERE property_id = $1',
        [propertyId]
      );
      return parseInt(result.rows[0].unique_viewers) || 0;
    } catch (error) {
      console.error('Error getting unique viewers:', error);
      throw error;
    }
  }
}

module.exports = PropertyView;
