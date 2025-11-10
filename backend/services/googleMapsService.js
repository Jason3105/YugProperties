const axios = require('axios');

/**
 * Extract embed URL from Google Maps share link
 * Supports various Google Maps URL formats
 */
const getEmbedUrl = (googleMapsLink, latitude = null, longitude = null) => {
  if (!googleMapsLink && !latitude && !longitude) {
    return null;
  }

  // If we have direct coordinates, use them
  if (latitude && longitude) {
    return `https://www.google.com/maps?q=${latitude},${longitude}&hl=en&z=15&output=embed`;
  }

  // Check if it's already an embed URL
  if (googleMapsLink.includes('/embed') || googleMapsLink.includes('output=embed')) {
    return googleMapsLink;
  }

  // Extract coordinates from various Google Maps URL formats
  
  // Format 1: https://maps.app.goo.gl/xxxxx or https://goo.gl/maps/xxxxx (shortened URLs)
  if (googleMapsLink.includes('goo.gl') || googleMapsLink.includes('maps.app.goo.gl')) {
    // For shortened URLs, we need to extract place info differently
    // Extract place name if available in URL
    const placeMatch = googleMapsLink.match(/place\/([^\/]+)/);
    if (placeMatch) {
      const placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
      return `https://www.google.com/maps?q=${encodeURIComponent(placeName)}&hl=en&z=15&output=embed`;
    }
    
    // If no place found, return the link for manual conversion
    // User will need to open it and get coordinates
    return null;
  }

  // Format 2: @latitude,longitude format
  const coordMatch = googleMapsLink.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (coordMatch) {
    const lat = coordMatch[1];
    const lng = coordMatch[2];
    return `https://www.google.com/maps?q=${lat},${lng}&hl=en&z=15&output=embed`;
  }

  // Format 3: ?q=latitude,longitude format
  const queryMatch = googleMapsLink.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (queryMatch) {
    const lat = queryMatch[1];
    const lng = queryMatch[2];
    return `https://www.google.com/maps?q=${lat},${lng}&hl=en&z=15&output=embed`;
  }

  // Format 4: Place ID format
  const placeIdMatch = googleMapsLink.match(/place_id=([^&]+)/);
  if (placeIdMatch) {
    return `https://www.google.com/maps/embed/v1/place?key=&q=place_id:${placeIdMatch[1]}`;
  }

  // Format 5: Place name in URL
  const placeNameMatch = googleMapsLink.match(/place\/([^\/]+)/);
  if (placeNameMatch) {
    const placeName = decodeURIComponent(placeNameMatch[1].replace(/\+/g, ' '));
    return `https://www.google.com/maps?q=${encodeURIComponent(placeName)}&hl=en&z=15&output=embed`;
  }

  // Format 6: /maps/search/ format
  const searchMatch = googleMapsLink.match(/maps\/search\/([^\/\?]+)/);
  if (searchMatch) {
    const searchTerm = decodeURIComponent(searchMatch[1].replace(/\+/g, ' '));
    return `https://www.google.com/maps?q=${encodeURIComponent(searchTerm)}&hl=en&z=15&output=embed`;
  }

  // If nothing matches, try to use the original link
  return null;
};

/**
 * Parse Google Maps URL and extract useful information
 */
const parseGoogleMapsUrl = async (url) => {
  try {
    // For shortened URLs, we need to follow the redirect
    if (url.includes('goo.gl') || url.includes('maps.app.goo.gl')) {
      try {
        // Follow redirect to get full URL
        const response = await axios.get(url, {
          maxRedirects: 5,
          validateStatus: (status) => status < 400,
          timeout: 5000
        });
        
        const fullUrl = response.request.res.responseUrl || response.config.url;
        
        // Extract coordinates from full URL
        const coordMatch = fullUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (coordMatch) {
          return {
            latitude: parseFloat(coordMatch[1]),
            longitude: parseFloat(coordMatch[2]),
            embedUrl: `https://www.google.com/maps?q=${coordMatch[1]},${coordMatch[2]}&hl=en&z=15&output=embed`
          };
        }
      } catch (error) {
        console.error('Error following redirect:', error.message);
      }
    }

    // Try to extract from the original URL
    const coordMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coordMatch) {
      return {
        latitude: parseFloat(coordMatch[1]),
        longitude: parseFloat(coordMatch[2]),
        embedUrl: `https://www.google.com/maps?q=${coordMatch[1]},${coordMatch[2]}&hl=en&z=15&output=embed`
      };
    }

    return {
      latitude: null,
      longitude: null,
      embedUrl: null
    };
  } catch (error) {
    console.error('Error parsing Google Maps URL:', error);
    return {
      latitude: null,
      longitude: null,
      embedUrl: null
    };
  }
};

module.exports = {
  getEmbedUrl,
  parseGoogleMapsUrl
};
