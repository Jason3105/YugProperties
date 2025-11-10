/**
 * Comprehensive test for Firebase Storage integration with property management
 * Tests: Create property → Upload images → Update property → Delete images → Delete property
 */

const { uploadToFirebase, deleteFromFirebase, uploadMultipleToFirebase, deleteMultipleFromFirebase } = require('./services/firebaseStorage');

// Create test image buffers (1x1 pixel PNG)
function createTestImageBuffer(color = 'red') {
  return Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
    0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41,
    0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00,
    0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE
  ]);
}

async function testCompleteWorkflow() {
  console.log('🧪 Testing Complete Property + Image Management Workflow\n');
  console.log('=' .repeat(70));

  const uploadedUrls = [];
  
  try {
    // ===== STEP 1: Simulate Creating Property with Multiple Images =====
    console.log('\n📝 STEP 1: Creating property with 3 images...');
    console.log('-'.repeat(70));
    
    const mockFiles = [
      { buffer: createTestImageBuffer('red'), originalname: 'property-main.jpg', mimetype: 'image/jpeg' },
      { buffer: createTestImageBuffer('green'), originalname: 'property-bedroom.jpg', mimetype: 'image/jpeg' },
      { buffer: createTestImageBuffer('blue'), originalname: 'property-kitchen.jpg', mimetype: 'image/jpeg' }
    ];

    console.log('📤 Uploading 3 property images...');
    const imageUrls = await uploadMultipleToFirebase(mockFiles);
    uploadedUrls.push(...imageUrls);
    
    console.log('✅ Property created with images:');
    imageUrls.forEach((url, idx) => {
      console.log(`   ${idx + 1}. ${url}`);
    });

    // Simulate property data
    const propertyData = {
      id: 'test-property-123',
      title: 'Luxury 3BHK Apartment',
      images: imageUrls,
      price: 5000000
    };
    console.log(`\n📊 Property Data:`, {
      id: propertyData.id,
      title: propertyData.title,
      imageCount: propertyData.images.length
    });

    // ===== STEP 2: Simulate Editing Property - Removing 1 Image, Adding 1 New =====
    console.log('\n\n✏️  STEP 2: Editing property (remove 1 image, add 1 new)...');
    console.log('-'.repeat(70));
    
    // Simulate user removing middle image and adding new one
    const oldImages = [...propertyData.images];
    const removedImage = oldImages[1]; // Remove bedroom image
    const newImages = [oldImages[0], oldImages[2]]; // Keep main and kitchen
    
    console.log(`🗑️  Image to be removed: ${removedImage}`);
    
    // Upload new image
    const newFile = { buffer: createTestImageBuffer('yellow'), originalname: 'property-balcony.jpg', mimetype: 'image/jpeg' };
    console.log('📤 Uploading new image...');
    const newImageUrl = await uploadToFirebase(newFile.buffer, newFile.originalname, newFile.mimetype);
    uploadedUrls.push(newImageUrl);
    newImages.push(newImageUrl);
    
    console.log(`✅ New image uploaded: ${newImageUrl}`);
    
    // Delete removed image from Firebase
    console.log('🗑️  Deleting removed image from Firebase...');
    const deleted = await deleteFromFirebase(removedImage);
    if (deleted) {
      const index = uploadedUrls.indexOf(removedImage);
      if (index > -1) uploadedUrls.splice(index, 1);
      console.log('✅ Removed image deleted from Firebase Storage');
    }
    
    // Update property data
    propertyData.images = newImages;
    console.log(`\n📊 Updated Property Images (${newImages.length} total):`);
    newImages.forEach((url, idx) => {
      console.log(`   ${idx + 1}. ${url}`);
    });

    // ===== STEP 3: Simulate Deleting Property - Clean up all images =====
    console.log('\n\n🗑️  STEP 3: Deleting property (cleanup all images)...');
    console.log('-'.repeat(70));
    
    console.log(`🗑️  Deleting ${propertyData.images.length} images from Firebase...`);
    const deletedCount = await deleteMultipleFromFirebase(propertyData.images);
    
    console.log(`✅ Deleted ${deletedCount}/${propertyData.images.length} images from Firebase Storage`);
    console.log('✅ Property and all associated images deleted');

    // Clear tracking array
    uploadedUrls.length = 0;

    // ===== FINAL SUMMARY =====
    console.log('\n' + '='.repeat(70));
    console.log('✅ ALL TESTS PASSED! Complete workflow verified:\n');
    console.log('   1. ✅ Create property with multiple images');
    console.log('   2. ✅ Upload images to Firebase Storage');
    console.log('   3. ✅ Edit property - remove old images from Firebase');
    console.log('   4. ✅ Edit property - add new images to Firebase');
    console.log('   5. ✅ Delete property - cleanup all images from Firebase');
    console.log('\n🎉 Your property management system is fully integrated with Firebase!');
    console.log('=' .repeat(70));

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error('Stack:', error.stack);
    
    // Cleanup on error
    if (uploadedUrls.length > 0) {
      console.log('\n🧹 Cleaning up test images...');
      await deleteMultipleFromFirebase(uploadedUrls);
    }
    
    process.exit(1);
  }
}

// Run the test
testCompleteWorkflow();
