const Property = require('../models/Property');
const PropertyView = require('../models/PropertyView');
const { uploadMultipleToFirebase, deleteFromFirebase, deleteMultipleFromFirebase } = require('../services/firebaseStorage');
const { parseGoogleMapsUrl, getEmbedUrl } = require('../services/googleMapsService');
const { updateStorageHistory } = require('../services/storageHistory');

// Create new property listing
exports.createProperty = async (req, res) => {
  try {
    // Verify admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can create property listings'
      });
    }

    // Sanitize data - convert empty strings to null for numeric/decimal fields
    const sanitizeNumeric = (value) => {
      if (value === '' || value === null || value === undefined) return null;
      const num = Number(value);
      return isNaN(num) ? null : num;
    };

    let latitude = sanitizeNumeric(req.body.latitude);
    let longitude = sanitizeNumeric(req.body.longitude);

    // If coordinates are not provided but Google Maps link is, try to extract them
    if ((!latitude || !longitude) && req.body.googleMapsLink) {
      try {
        const parsed = await parseGoogleMapsUrl(req.body.googleMapsLink);
        if (parsed.latitude && parsed.longitude) {
          latitude = parsed.latitude;
          longitude = parsed.longitude;
          console.log(`✅ Extracted coordinates from Google Maps link: ${latitude}, ${longitude}`);
        }
      } catch (error) {
        console.error('Error extracting coordinates from Google Maps link:', error);
      }
    }

    const propertyData = {
      ...req.body,
      createdBy: req.user.id,
      // Sanitize numeric fields
      price: sanitizeNumeric(req.body.price),
      latitude,
      longitude,
      areaSqft: sanitizeNumeric(req.body.areaSqft),
      bedrooms: sanitizeNumeric(req.body.bedrooms),
      bathrooms: sanitizeNumeric(req.body.bathrooms),
      balconies: sanitizeNumeric(req.body.balconies),
      floorNumber: sanitizeNumeric(req.body.floorNumber),
      totalFloors: sanitizeNumeric(req.body.totalFloors),
      ageOfProperty: sanitizeNumeric(req.body.ageOfProperty)
    };

    const property = await Property.create(propertyData);

    res.status(201).json({
      success: true,
      message: 'Property listed successfully',
      property
    });
  } catch (error) {
    console.error('Create property error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      propertyData: req.body
    });
    res.status(500).json({
      success: false,
      message: 'Error creating property listing',
      error: error.message
    });
  }
};

// Get all properties with filters
exports.getProperties = async (req, res) => {
  try {
    const filters = {
      city: req.query.city,
      propertyType: req.query.propertyType,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      bedrooms: req.query.bedrooms,
      status: req.query.status,
      limit: req.query.limit
    };

    const properties = await Property.getAll(filters);

    res.json({
      success: true,
      count: properties.length,
      data: properties
    });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching properties',
      error: error.message
    });
  }
};

// Get single property by ID
exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.getById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    res.json({
      success: true,
      property
    });
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching property',
      error: error.message
    });
  }
};

// Update property
exports.updateProperty = async (req, res) => {
  try {
    // Verify admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can update property listings'
      });
    }

    // Get existing property to compare images
    const existingProperty = await Property.getById(req.params.id);
    if (!existingProperty) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Sanitize data - convert empty strings to null for numeric/decimal fields
    const sanitizeNumeric = (value) => {
      if (value === '' || value === null || value === undefined) return null;
      const num = Number(value);
      return isNaN(num) ? null : num;
    };

    let latitude = sanitizeNumeric(req.body.latitude);
    let longitude = sanitizeNumeric(req.body.longitude);

    // If Google Maps link is provided, extract coordinates from it
    if (req.body.googleMapsLink) {
      try {
        const parsed = await parseGoogleMapsUrl(req.body.googleMapsLink);
        if (parsed.latitude && parsed.longitude) {
          latitude = parsed.latitude;
          longitude = parsed.longitude;
          console.log(`✅ Extracted coordinates from Google Maps link: ${latitude}, ${longitude}`);
        }
      } catch (error) {
        console.error('Error extracting coordinates from Google Maps link:', error);
      }
    }

    // Handle image deletions - if new images array is provided, delete removed images from Firebase
    if (req.body.images && Array.isArray(req.body.images)) {
      const oldImages = existingProperty.images || [];
      const newImages = req.body.images;
      
      // Find images that were removed (exist in old but not in new)
      const removedImages = oldImages.filter(oldImg => !newImages.includes(oldImg));
      
      if (removedImages.length > 0) {
        console.log(`🗑️  Deleting ${removedImages.length} removed images from Firebase Storage...`);
        const deletedCount = await deleteMultipleFromFirebase(removedImages);
        console.log(`✅ Deleted ${deletedCount} images from Firebase Storage`);
      }
    }

    // Sanitize numeric fields in the request body
    const sanitizedData = {
      ...req.body,
      price: sanitizeNumeric(req.body.price),
      latitude,
      longitude,
      areaSqft: sanitizeNumeric(req.body.areaSqft),
      bedrooms: sanitizeNumeric(req.body.bedrooms),
      bathrooms: sanitizeNumeric(req.body.bathrooms),
      balconies: sanitizeNumeric(req.body.balconies),
      floorNumber: sanitizeNumeric(req.body.floorNumber),
      totalFloors: sanitizeNumeric(req.body.totalFloors),
      ageOfProperty: sanitizeNumeric(req.body.ageOfProperty)
    };

    const property = await Property.update(req.params.id, sanitizedData);

    res.json({
      success: true,
      message: 'Property updated successfully',
      property
    });
  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating property',
      error: error.message
    });
  }
};

// Delete property
exports.deleteProperty = async (req, res) => {
  try {
    // Verify admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can delete property listings'
      });
    }

    // First, get the property to retrieve its images
    const existingProperty = await Property.getById(req.params.id);

    if (!existingProperty) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Delete all images from Firebase Storage
    if (existingProperty.images && Array.isArray(existingProperty.images) && existingProperty.images.length > 0) {
      console.log(`🗑️  Deleting ${existingProperty.images.length} images from Firebase Storage...`);
      const deletedCount = await deleteMultipleFromFirebase(existingProperty.images);
      console.log(`✅ Deleted ${deletedCount} images from Firebase Storage`);
    }

    // Delete brochure from Firebase Storage if exists
    if (existingProperty.brochure_url) {
      try {
        console.log('🗑️  Deleting brochure from Firebase Storage...');
        await deleteFromFirebase(existingProperty.brochure_url);
        console.log('✅ Brochure deleted from Firebase Storage');
      } catch (brochureError) {
        console.error('⚠️  Error deleting brochure:', brochureError);
        // Continue with property deletion even if brochure deletion fails
      }
    }

    // Update storage history after deletions
    try {
      await updateStorageHistory();
      console.log('✅ Storage history updated after property deletion');
    } catch (historyError) {
      console.error('Error updating storage history:', historyError);
    }

    // Now delete the property from database
    const property = await Property.delete(req.params.id);

    res.json({
      success: true,
      message: 'Property, images, and brochure deleted successfully',
      property
    });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting property',
      error: error.message
    });
  }
};

// Upload images to Firebase Storage and return URLs
exports.uploadImages = async (req, res) => {
  try {
    // Verify admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can upload images'
      });
    }

    // Check if files are present
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    // Upload all files to Firebase Storage
    const imageUrls = await uploadMultipleToFirebase(req.files);

    if (imageUrls.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'Failed to upload images to Firebase Storage'
      });
    }

    console.log('✅ Images uploaded successfully to Firebase:', imageUrls);

    // Update storage history after upload
    try {
      await updateStorageHistory();
      console.log('✅ Storage history updated');
    } catch (historyError) {
      console.error('Error updating storage history:', historyError);
      // Don't fail the upload if history update fails
    }

    res.json({
      success: true,
      message: `${imageUrls.length} image(s) uploaded successfully`,
      imageUrls
    });
  } catch (error) {
    console.error('Upload images error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing images',
      error: error.message
    });
  }
};

// Upload brochure (PDF)
exports.uploadBrochure = async (req, res) => {
  try {
    // Verify admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can upload brochures'
      });
    }

    // Check if file is present
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No brochure file uploaded'
      });
    }

    // Delete old brochure if exists
    const oldBrochureUrl = req.body.oldBrochureUrl;
    if (oldBrochureUrl) {
      try {
        const { deleteFromFirebase } = require('../services/firebaseStorage');
        await deleteFromFirebase(oldBrochureUrl);
        console.log('✅ Old brochure deleted from Firebase:', oldBrochureUrl);
      } catch (deleteError) {
        console.error('⚠️ Error deleting old brochure:', deleteError);
        // Continue with upload even if delete fails
      }
    }

    // Upload brochure to Firebase Storage
    const { uploadToFirebase } = require('../services/firebaseStorage');
    const brochureUrl = await uploadToFirebase(req.file.buffer, req.file.originalname, req.file.mimetype);

    if (!brochureUrl) {
      return res.status(500).json({
        success: false,
        message: 'Failed to upload brochure to Firebase Storage'
      });
    }

    console.log('✅ Brochure uploaded successfully to Firebase:', brochureUrl);

    // Update storage history after upload
    try {
      await updateStorageHistory();
      console.log('✅ Storage history updated');
    } catch (historyError) {
      console.error('Error updating storage history:', historyError);
    }

    res.json({
      success: true,
      message: 'Brochure uploaded successfully',
      brochureUrl
    });
  } catch (error) {
    console.error('Upload brochure error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing brochure',
      error: error.message
    });
  }
};

// Delete brochure
exports.deleteBrochure = async (req, res) => {
  try {
    // Verify admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can delete brochures'
      });
    }

    const { brochureUrl } = req.body;

    if (!brochureUrl) {
      return res.status(400).json({
        success: false,
        message: 'Brochure URL is required'
      });
    }

    // Delete from Firebase Storage
    const { deleteFromFirebase } = require('../services/firebaseStorage');
    await deleteFromFirebase(brochureUrl);

    console.log('✅ Brochure deleted from Firebase:', brochureUrl);

    // Update storage history after deletion
    try {
      await updateStorageHistory();
      console.log('✅ Storage history updated after deletion');
    } catch (historyError) {
      console.error('Error updating storage history:', historyError);
    }

    res.json({
      success: true,
      message: 'Brochure deleted successfully'
    });
  } catch (error) {
    console.error('Delete brochure error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting brochure',
      error: error.message
    });
  }
};

// Record property view (unique tracking)
exports.recordView = async (req, res) => {
  try {
    const propertyId = req.params.id;
    const userId = req.user?.id || null; // Get user ID from auth token if logged in
    const sessionId = req.body.sessionId || req.headers['x-session-id']; // Get session ID from client
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    if (!sessionId && !userId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required for anonymous users'
      });
    }

    const result = await PropertyView.recordView(propertyId, userId, sessionId, ipAddress);

    res.json({
      success: true,
      isNewView: result.isNew,
      viewCount: result.viewCount,
      message: result.isNew ? 'View recorded' : 'Already viewed'
    });
  } catch (error) {
    console.error('Record view error:', error);
    res.status(500).json({
      success: false,
      message: 'Error recording view',
      error: error.message
    });
  }
};

// Get Google Maps embed URL from share link
exports.getMapEmbedUrl = async (req, res) => {
  try {
    const { googleMapsLink, latitude, longitude } = req.query;

    console.log('📍 getMapEmbedUrl called with:', { googleMapsLink, latitude, longitude });

    if (!googleMapsLink && (!latitude || !longitude)) {
      return res.status(400).json({
        success: false,
        message: 'Google Maps link or coordinates required'
      });
    }

    let embedUrl;
    let extractedLat = latitude ? parseFloat(latitude) : null;
    let extractedLng = longitude ? parseFloat(longitude) : null;

    // Priority 1: If we have coordinates from database, use them directly
    if (extractedLat && extractedLng) {
      embedUrl = `https://www.google.com/maps?q=${extractedLat},${extractedLng}&hl=en&z=15&output=embed`;
      console.log('📍 Using database coordinates:', { extractedLat, extractedLng });
    }
    // Priority 2: If no coordinates but have Google Maps link, parse it
    else if (googleMapsLink) {
      const parsed = await parseGoogleMapsUrl(googleMapsLink);
      console.log('📍 Parsed from link:', parsed);
      if (parsed.latitude && parsed.longitude) {
        extractedLat = parsed.latitude;
        extractedLng = parsed.longitude;
        embedUrl = parsed.embedUrl;
      }
    }

    console.log('📍 Final result:', { embedUrl, latitude: extractedLat, longitude: extractedLng });

    res.json({
      success: true,
      embedUrl,
      latitude: extractedLat,
      longitude: extractedLng
    });
  } catch (error) {
    console.error('Get map embed URL error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting map embed URL',
      error: error.message
    });
  }
};

// Get Firebase Storage statistics
exports.getStorageStats = async (req, res) => {
  try {
    // Verify admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can view storage statistics'
      });
    }
    const { getStorageStats } = require('../services/firebaseStorage');
    // Get live stats from Firebase
    const stats = await getStorageStats();

    // Update monthly storage history (upsert)
    try {
      const upserted = await updateStorageHistory();
      return res.json({ success: true, stats, history: upserted });
    } catch (historyErr) {
      console.error('Error updating storage history (getStorageStats):', historyErr);
      // Still return live stats even if history upsert fails
      return res.json({ success: true, stats });
    }
  } catch (error) {
    console.error('Get storage stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching storage statistics',
      error: error.message
    });
  }
};

// Get featured properties
exports.getFeaturedProperties = async (req, res) => {
  try {
    const limit = req.query.limit || 6;
    const properties = await Property.getFeatured(limit);

    res.json({
      success: true,
      count: properties.length,
      data: properties
    });
  } catch (error) {
    console.error('Get featured properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching featured properties',
      error: error.message
    });
  }
};
