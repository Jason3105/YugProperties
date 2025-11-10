const pool = require('./config/database');
const { parseGoogleMapsUrl } = require('./services/googleMapsService');

const updateMissingCoordinates = async () => {
  try {
    console.log('🔍 Finding properties without coordinates...');

    // Get all properties that have a Google Maps link but no coordinates
    const result = await pool.query(
      `SELECT id, title, google_maps_link 
       FROM properties 
       WHERE google_maps_link IS NOT NULL 
       AND (latitude IS NULL OR longitude IS NULL)`
    );

    const properties = result.rows;
    console.log(`Found ${properties.length} properties without coordinates`);

    if (properties.length === 0) {
      console.log('✅ All properties already have coordinates!');
      process.exit(0);
    }

    for (const property of properties) {
      console.log(`\n📍 Processing: ${property.title}`);
      console.log(`   Google Maps Link: ${property.google_maps_link}`);

      try {
        const parsed = await parseGoogleMapsUrl(property.google_maps_link);
        
        if (parsed.latitude && parsed.longitude) {
          // Update the property with extracted coordinates
          await pool.query(
            'UPDATE properties SET latitude = $1, longitude = $2 WHERE id = $3',
            [parsed.latitude, parsed.longitude, property.id]
          );
          
          console.log(`   ✅ Updated: ${parsed.latitude}, ${parsed.longitude}`);
        } else {
          console.log(`   ⚠️  Could not extract coordinates`);
        }
      } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
      }

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n🎉 Coordinate update completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating coordinates:', error);
    process.exit(1);
  }
};

updateMissingCoordinates();
