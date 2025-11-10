const jwt = require('jsonwebtoken');

// Optional authentication - attaches user if token exists, but doesn't fail if not
exports.optionalAuth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      // No token provided, continue without user
      req.user = null;
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      // Invalid token, continue without user
      req.user = null;
      next();
    }
  } catch (error) {
    // Any error, continue without user
    req.user = null;
    next();
  }
};
