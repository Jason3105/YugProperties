const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
// Support both environment variable (for Render) and local file
let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // Parse JSON from environment variable
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  // Load from local file (development)
  serviceAccount = require('../config/firebase-service-account.json');
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'yugproperties-39168.firebasestorage.app'
});

const bucket = admin.storage().bucket();

/**
 * Upload a single file to Firebase Storage
 * @param {Buffer} buffer - File buffer
 * @param {string} filename - Original filename
 * @param {string} mimetype - File mimetype
 * @returns {Promise<string>} - Public URL of uploaded file
 */
async function uploadToFirebase(buffer, filename, mimetype) {
  try {
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const ext = path.extname(filename);
    const uniqueFilename = `${path.basename(filename, ext)}_${timestamp}${ext}`;
    const filepath = `properties/${uniqueFilename}`;

    // Create file reference
    const file = bucket.file(filepath);

    // Upload buffer
    await file.save(buffer, {
      metadata: {
        contentType: mimetype,
        metadata: {
          firebaseStorageDownloadTokens: timestamp.toString()
        }
      },
      public: true,
      validation: 'md5'
    });

    // Make file publicly accessible
    await file.makePublic();

    // Get public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filepath}`;
    
    console.log(`File uploaded successfully: ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.error('Error uploading to Firebase:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
}

/**
 * Upload multiple files to Firebase Storage
 * @param {Array} files - Array of file objects with buffer, originalname, mimetype
 * @returns {Promise<Array<string>>} - Array of public URLs
 */
async function uploadMultipleToFirebase(files) {
  try {
    const uploadPromises = files.map(file => 
      uploadToFirebase(file.buffer, file.originalname, file.mimetype)
    );
    
    const urls = await Promise.all(uploadPromises);
    console.log(`Successfully uploaded ${urls.length} files`);
    return urls;
  } catch (error) {
    console.error('Error uploading multiple files:', error);
    throw new Error(`Failed to upload files: ${error.message}`);
  }
}

/**
 * Delete a file from Firebase Storage
 * @param {string} imageUrl - Public URL of the file to delete
 * @returns {Promise<boolean>} - Success status
 */
async function deleteFromFirebase(imageUrl) {
  try {
    if (!imageUrl) return false;

    // Extract filepath from URL
    // URL format: https://storage.googleapis.com/bucket-name/properties/filename.jpg
    const urlParts = imageUrl.split('/');
    const bucketIndex = urlParts.indexOf(bucket.name);
    
    if (bucketIndex === -1) {
      console.error('Invalid Firebase Storage URL');
      return false;
    }

    const filepath = urlParts.slice(bucketIndex + 1).join('/');
    
    // Delete file
    const file = bucket.file(filepath);
    await file.delete();
    
    console.log(`File deleted successfully: ${filepath}`);
    return true;
  } catch (error) {
    // If file doesn't exist, consider it a success
    if (error.code === 404) {
      console.log('File already deleted or does not exist');
      return true;
    }
    
    console.error('Error deleting from Firebase:', error);
    return false;
  }
}

/**
 * Delete multiple files from Firebase Storage
 * @param {Array<string>} imageUrls - Array of public URLs to delete
 * @returns {Promise<number>} - Number of successfully deleted files
 */
async function deleteMultipleFromFirebase(imageUrls) {
  try {
    const deletePromises = imageUrls.map(url => deleteFromFirebase(url));
    const results = await Promise.all(deletePromises);
    
    const successCount = results.filter(result => result === true).length;
    console.log(`Successfully deleted ${successCount} out of ${imageUrls.length} files`);
    
    return successCount;
  } catch (error) {
    console.error('Error deleting multiple files:', error);
    throw new Error(`Failed to delete files: ${error.message}`);
  }
}

/**
 * Get download URL for a file (for internal use if needed)
 * @param {string} filepath - File path in bucket
 * @returns {Promise<string>} - Signed URL
 */
async function getDownloadUrl(filepath) {
  try {
    const file = bucket.file(filepath);
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    return url;
  } catch (error) {
    console.error('Error getting download URL:', error);
    throw new Error(`Failed to get download URL: ${error.message}`);
  }
}

/**
 * Get Firebase Storage usage statistics
 * @returns {Promise<Object>} - Storage usage stats
 */
async function getStorageStats() {
  try {
    const [files] = await bucket.getFiles({ prefix: 'properties/' });
    
    let totalSize = 0;
    let fileCount = 0;
    let imageCount = 0;
    let imageSize = 0;
    let brochureCount = 0;
    let brochureSize = 0;
    
    for (const file of files) {
      const [metadata] = await file.getMetadata();
      const size = parseInt(metadata.size || 0);
      const fileName = file.name.toLowerCase();
      
      totalSize += size;
      fileCount++;
      
      // Categorize by file type
      if (fileName.endsWith('.pdf')) {
        brochureCount++;
        brochureSize += size;
      } else if (fileName.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
        imageCount++;
        imageSize += size;
      }
    }
    
    // Convert bytes to different units
    const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2);
    const sizeInGB = (totalSize / (1024 * 1024 * 1024)).toFixed(2);
    const imageSizeMB = (imageSize / (1024 * 1024)).toFixed(2);
    const brochureSizeMB = (brochureSize / (1024 * 1024)).toFixed(2);
    
    // Firebase free tier: 5GB storage, 1GB/day download
    const freeTierLimit = 5 * 1024 * 1024 * 1024; // 5GB in bytes
    const usagePercentage = ((totalSize / freeTierLimit) * 100).toFixed(2);
    
    return {
      totalFiles: fileCount,
      totalSizeBytes: totalSize,
      totalSizeMB: parseFloat(sizeInMB),
      totalSizeGB: parseFloat(sizeInGB),
      usagePercentage: parseFloat(usagePercentage),
      freeTierLimitGB: 5,
      remainingGB: (5 - parseFloat(sizeInGB)).toFixed(2),
      filesByType: [
        {
          type: 'images',
          count: imageCount,
          sizeMB: parseFloat(imageSizeMB)
        },
        {
          type: 'brochures',
          count: brochureCount,
          sizeMB: parseFloat(brochureSizeMB)
        }
      ]
    };
  } catch (error) {
    console.error('Error getting storage stats:', error);
    throw new Error(`Failed to get storage stats: ${error.message}`);
  }
}

module.exports = {
  uploadToFirebase,
  uploadMultipleToFirebase,
  deleteFromFirebase,
  deleteMultipleFromFirebase,
  getDownloadUrl,
  getStorageStats
};
