const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Meta tags endpoint for social sharing
router.get('/properties/:id/meta', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      'SELECT id, title, description, price, city, state, bedrooms, bathrooms, area_sqft, property_type, listing_type, images FROM properties WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const property = result.rows[0];
    const images = property.images || [];
    const mainImage = images.length > 0 ? images[0] : 'https://yugproperties.co.in/og-image.png';
    
    const priceFormatted = property.price >= 10000000 
      ? `₹${(property.price / 10000000).toFixed(2)} Cr`
      : property.price >= 100000
      ? `₹${(property.price / 100000).toFixed(2)} Lakhs`
      : `₹${property.price.toLocaleString('en-IN')}`;

    const metaTags = {
      title: `${property.title} | ${property.bedrooms}BHK ${property.property_type} in ${property.city}`,
      description: `${property.bedrooms}BHK ${property.property_type} for ${property.listing_type} in ${property.city}, ${property.area_sqft} sqft at ${priceFormatted}. ${property.description?.slice(0, 150) || ''}`,
      image: mainImage,
      url: `https://yugproperties.co.in/properties/${property.id}`,
      price: priceFormatted,
      location: `${property.city}, ${property.state}`,
      type: property.property_type,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      area: property.area_sqft
    };

    res.json({ success: true, meta: metaTags });
  } catch (error) {
    console.error('Error fetching property meta:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
