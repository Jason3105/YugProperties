const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const { 
  validateSignup, 
  validateLogin,
  sanitizeBody,
  suspiciousActivityDetector,
  csrfProtection
} = require('../middleware/security');

// Apply security middleware to all routes
router.use(suspiciousActivityDetector);
router.use(sanitizeBody);
router.use(csrfProtection);

// Routes with enhanced security
router.post('/register', validateSignup, authController.register);
router.post('/login', validateLogin, authController.login);
router.get('/me', auth, authController.getCurrentUser);
router.put('/profile', auth, authController.updateProfile);
router.get('/admin/stats', auth, authController.getAdminStats);
router.get('/admin/reports', auth, authController.getGrowthReports);
router.get('/admin/users', auth, authController.getAllUsers);

module.exports = router;
