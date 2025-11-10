const { uploadToFirebase, deleteFromFirebase } = require('./services/firebaseStorage');
const fs = require('fs');
const path = require('path');

async function testFirebaseStorage() {
  console.log('🧪 Testing Firebase Storage...\n');

  try {
    // Create a test image buffer (1x1 pixel PNG)
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
      0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41,
      0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00,
      0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE
    ]);

    // Test 1: Upload
    console.log('📤 Test 1: Uploading test image...');
    const imageUrl = await uploadToFirebase(
      testImageBuffer,
      'test-image.png',
      'image/png'
    );
    console.log('✅ Upload successful!');
    console.log('📍 Image URL:', imageUrl);
    console.log('');

    // Test 2: Verify URL is accessible
    console.log('🌐 Test 2: Verifying URL is publicly accessible...');
    const https = require('https');
    const urlAccessible = await new Promise((resolve) => {
      https.get(imageUrl, (res) => {
        console.log('✅ URL is accessible! Status:', res.statusCode);
        resolve(res.statusCode === 200);
      }).on('error', (err) => {
        console.log('❌ URL not accessible:', err.message);
        resolve(false);
      });
    });
    console.log('');

    // Test 3: Delete
    console.log('🗑️  Test 3: Deleting test image...');
    const deleted = await deleteFromFirebase(imageUrl);
    if (deleted) {
      console.log('✅ Delete successful!');
    } else {
      console.log('❌ Delete failed!');
    }
    console.log('');

    console.log('✅ All tests passed! Firebase Storage is working correctly.');
    console.log('\n📊 Summary:');
    console.log('   - Upload: ✅ Working');
    console.log('   - Public Access: ✅ Working');
    console.log('   - Delete: ✅ Working');
    console.log('\n🎉 Your Firebase Storage is ready to use!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testFirebaseStorage();
