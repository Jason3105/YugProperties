const express = require('express');
const router = express.Router();
const multer = require('multer');
const { auth } = require('../middleware/auth');
const { optionalAuth } = require('../middleware/optionalAuth');
const propertyController = require('../controllers/propertyController');

// Configure multer for memory storage (images)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit per file
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Configure multer for brochure upload (PDFs)
const brochureUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept PDF files only
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed for brochures!'), false);
    }
  }
});

// Public routes
router.get('/', propertyController.getProperties);
router.get('/featured', propertyController.getFeaturedProperties);
router.get('/map-embed-url', propertyController.getMapEmbedUrl);

// Record property view (optional auth - works for both logged in and anonymous users)
router.post('/:id/view', optionalAuth, propertyController.recordView);

// Image upload endpoint (Admin only)
const uploadMiddleware = upload.array('images', 10);
router.post('/upload-images', auth, uploadMiddleware, propertyController.uploadImages);

// Brochure upload endpoint (Admin only)
const brochureUploadMiddleware = brochureUpload.single('brochure');
router.post('/upload-brochure', auth, brochureUploadMiddleware, propertyController.uploadBrochure);

// Brochure delete endpoint (Admin only)
router.post('/delete-brochure', auth, propertyController.deleteBrochure);

// Storage stats endpoint (Admin only)
router.get('/storage/stats', auth, propertyController.getStorageStats);

// Protected routes (Admin only)
router.post('/', auth, propertyController.createProperty);
router.put('/:id', auth, propertyController.updateProperty);
router.delete('/:id', auth, propertyController.deleteProperty);

// Public route - must be after specific routes
router.get('/:id', propertyController.getPropertyById);

module.exports = router;
