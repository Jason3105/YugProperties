const fs = require('fs');
const path = require('path');

// Create uploads directory if it doesn't exist
const UPLOADS_DIR = path.join(__dirname, '../uploads/properties');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * Save image file locally
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} fileName - Original filename
 * @returns {Promise<string>} - URL to access the image
 */
async function saveImage(fileBuffer, fileName) {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFileName = `${timestamp}-${sanitizedName}`;
    const filePath = path.join(UPLOADS_DIR, uniqueFileName);

    // Save file
    await fs.promises.writeFile(filePath, fileBuffer);

    // Return URL path (relative to server)
    return `/uploads/properties/${uniqueFileName}`;
  } catch (error) {
    console.error('Error saving image:', error);
    throw new Error('Failed to save image');
  }
}

/**
 * Delete image file
 * @param {string} imageUrl - Image URL (e.g., /uploads/properties/123-image.jpg)
 * @returns {Promise<boolean>} - Success status
 */
async function deleteImage(imageUrl) {
  try {
    const fileName = path.basename(imageUrl);
    const filePath = path.join(UPLOADS_DIR, fileName);
    
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
}

module.exports = {
  saveImage,
  deleteImage,
  UPLOADS_DIR
};
