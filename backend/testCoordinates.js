const { parseGoogleMapsUrl } = require('./services/googleMapsService');

async function test() {
  const testUrl = 'https://maps.app.goo.gl/9uMk75WJEMFeHWFz7';
  
  console.log('Testing URL:', testUrl);
  console.log('---');
  
  const result = await parseGoogleMapsUrl(testUrl);
  
  console.log('Extracted Data:');
  console.log('Latitude:', result.latitude);
  console.log('Longitude:', result.longitude);
  console.log('Embed URL:', result.embedUrl);
  console.log('---');
  
  // Verify coordinates on map
  console.log('Verify at: https://www.google.com/maps?q=' + result.latitude + ',' + result.longitude);
}

test().catch(console.error);
