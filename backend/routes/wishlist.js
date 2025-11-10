const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.post('/add', auth, wishlistController.addToWishlist);
router.delete('/remove/:propertyId', auth, wishlistController.removeFromWishlist);
router.get('/', auth, wishlistController.getWishlist);
router.get('/check/:propertyId', auth, wishlistController.checkWishlistStatus);

module.exports = router;
