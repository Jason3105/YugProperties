const pool = require('../config/database');

class Property {
  // Create properties table
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS properties (
        id SERIAL PRIMARY KEY,
        
        -- Basic Information
        title VARCHAR(255) NOT NULL,
        description TEXT,
        property_type VARCHAR(100),
        listing_type VARCHAR(100),
        status VARCHAR(50) DEFAULT 'available',
        price DECIMAL(15, 2) NOT NULL,
        available_from DATE,
        posted_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        -- Location Details
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        pincode VARCHAR(20),
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        google_maps_link TEXT,
        
        -- Property Specifications
        area_sqft DECIMAL(10, 2),
        bedrooms INTEGER,
        bathrooms INTEGER,
        balconies INTEGER,
        floor_number INTEGER,
        total_floors INTEGER,
        furnishing VARCHAR(50),
        age_of_property VARCHAR(50),
        facing_direction VARCHAR(50),
        ownership_type VARCHAR(100),
        
        -- Amenities & Features (stored as JSON array)
        amenities JSONB DEFAULT '[]',
        
        -- Media & Attachments
        images JSONB DEFAULT '[]',
        video_tour_url TEXT,
        brochure_url TEXT,
        
        -- Admin & Metadata
        created_by INTEGER REFERENCES users(id),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_featured BOOLEAN DEFAULT false,
        views INTEGER DEFAULT 0
      );
      
      CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
      CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(property_type);
      CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
      CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
    `;
    
    try {
      await pool.query(query);
      console.log('Properties table created successfully');
    } catch (error) {
      console.error('Error creating properties table:', error);
      throw error;
    }
  }

  // Create a new property listing
  static async create(propertyData) {
    const query = `
      INSERT INTO properties (
        title, description, property_type, listing_type, status, price, 
        available_from, address, city, state, pincode, latitude, longitude,
        google_maps_link, area_sqft, bedrooms, bathrooms, balconies, 
        floor_number, total_floors, furnishing, age_of_property, 
        facing_direction, ownership_type, amenities, images, 
        video_tour_url, brochure_url, contact_name, contact_phone, contact_email,
        created_by, is_featured
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, 
        $29, $30, $31, $32, $33
      ) RETURNING *
    `;
    
    const values = [
      propertyData.title,
      propertyData.description,
      propertyData.propertyType,
      propertyData.listingType,
      propertyData.status || 'available',
      propertyData.price,
      propertyData.availableFrom,
      propertyData.address,
      propertyData.city,
      propertyData.state,
      propertyData.pincode,
      propertyData.latitude,
      propertyData.longitude,
      propertyData.googleMapsLink,
      propertyData.areaSqft,
      propertyData.bedrooms,
      propertyData.bathrooms,
      propertyData.balconies,
      propertyData.floorNumber,
      propertyData.totalFloors,
      propertyData.furnishing,
      propertyData.ageOfProperty,
      propertyData.facingDirection,
      propertyData.ownershipType,
      JSON.stringify(propertyData.amenities || []),
      JSON.stringify(propertyData.images || []),
      propertyData.videoTourUrl,
      propertyData.brochureUrl,
      propertyData.contactName,
      propertyData.contactPhone,
      propertyData.contactEmail,
      propertyData.createdBy,
      propertyData.isFeatured || false
    ];
    
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating property:', error);
      throw error;
    }
  }

  // Get all properties with filters
  static async getAll(filters = {}) {
    let query = 'SELECT * FROM properties WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (filters.city) {
      query += ` AND city ILIKE $${paramCount}`;
      values.push(`%${filters.city}%`);
      paramCount++;
    }

    if (filters.propertyType) {
      query += ` AND property_type = $${paramCount}`;
      values.push(filters.propertyType);
      paramCount++;
    }

    if (filters.minPrice) {
      query += ` AND price >= $${paramCount}`;
      values.push(filters.minPrice);
      paramCount++;
    }

    if (filters.maxPrice) {
      query += ` AND price <= $${paramCount}`;
      values.push(filters.maxPrice);
      paramCount++;
    }

    if (filters.bedrooms) {
      query += ` AND bedrooms >= $${paramCount}`;
      values.push(filters.bedrooms);
      paramCount++;
    }

    if (filters.status) {
      query += ` AND status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    query += ' ORDER BY posted_on DESC';

    if (filters.limit) {
      query += ` LIMIT $${paramCount}`;
      values.push(filters.limit);
      paramCount++;
    }

    try {
      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }
  }

  // Get property by ID
  static async getById(id) {
    const query = 'SELECT * FROM properties WHERE id = $1';
    
    try {
      const result = await pool.query(query, [id]);
      if (result.rows.length === 0) return null;
      
      // Don't increment views here - use separate recordView endpoint
      
      return result.rows[0];
    } catch (error) {
      console.error('Error fetching property:', error);
      throw error;
    }
  }

  // Update property
  static async update(id, propertyData) {
    const query = `
      UPDATE properties SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        property_type = COALESCE($3, property_type),
        listing_type = COALESCE($4, listing_type),
        status = COALESCE($5, status),
        price = COALESCE($6, price),
        available_from = COALESCE($7, available_from),
        address = COALESCE($8, address),
        city = COALESCE($9, city),
        state = COALESCE($10, state),
        pincode = COALESCE($11, pincode),
        latitude = COALESCE($12, latitude),
        longitude = COALESCE($13, longitude),
        google_maps_link = COALESCE($14, google_maps_link),
        area_sqft = COALESCE($15, area_sqft),
        bedrooms = COALESCE($16, bedrooms),
        bathrooms = COALESCE($17, bathrooms),
        balconies = COALESCE($18, balconies),
        floor_number = COALESCE($19, floor_number),
        total_floors = COALESCE($20, total_floors),
        furnishing = COALESCE($21, furnishing),
        age_of_property = COALESCE($22, age_of_property),
        facing_direction = COALESCE($23, facing_direction),
        ownership_type = COALESCE($24, ownership_type),
        amenities = COALESCE($25, amenities),
        images = COALESCE($26, images),
        video_tour_url = COALESCE($27, video_tour_url),
        brochure_url = COALESCE($28, brochure_url),
        contact_name = COALESCE($29, contact_name),
        contact_phone = COALESCE($30, contact_phone),
        contact_email = COALESCE($31, contact_email),
        is_featured = COALESCE($32, is_featured),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $33
      RETURNING *
    `;
    
    const values = [
      propertyData.title,
      propertyData.description,
      propertyData.propertyType,
      propertyData.listingType,
      propertyData.status,
      propertyData.price,
      propertyData.availableFrom,
      propertyData.address,
      propertyData.city,
      propertyData.state,
      propertyData.pincode,
      propertyData.latitude,
      propertyData.longitude,
      propertyData.googleMapsLink,
      propertyData.areaSqft,
      propertyData.bedrooms,
      propertyData.bathrooms,
      propertyData.balconies,
      propertyData.floorNumber,
      propertyData.totalFloors,
      propertyData.furnishing,
      propertyData.ageOfProperty,
      propertyData.facingDirection,
      propertyData.ownershipType,
      propertyData.amenities ? JSON.stringify(propertyData.amenities) : null,
      propertyData.images ? JSON.stringify(propertyData.images) : null,
      propertyData.videoTourUrl,
      propertyData.brochureUrl,
      propertyData.contactName,
      propertyData.contactPhone,
      propertyData.contactEmail,
      propertyData.isFeatured,
      id
    ];
    
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating property:', error);
      throw error;
    }
  }

  // Delete property
  static async delete(id) {
    const query = 'DELETE FROM properties WHERE id = $1 RETURNING *';
    
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error deleting property:', error);
      throw error;
    }
  }

  // Get featured properties
  static async getFeatured(limit = 6) {
    const query = `
      SELECT * FROM properties 
      WHERE is_featured = true 
      AND status = 'available'
      ORDER BY posted_on DESC 
      LIMIT $1
    `;
    
    try {
      const result = await pool.query(query, [limit]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching featured properties:', error);
      throw error;
    }
  }
}

module.exports = Property;
