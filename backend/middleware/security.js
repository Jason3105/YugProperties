const { body, param, query, validationResult } = require('express-validator');

// Input validation helper
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      message: 'Validation failed',
      errors: errors.array() 
    });
  }
  next();
};

// SQL Injection prevention for PostgreSQL queries
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // Remove common SQL injection patterns
  const sqlPatterns = [
    /(\bOR\b|\bAND\b)\s+\d+\s*=\s*\d+/gi,
    /(\bUNION\b|\bSELECT\b|\bDROP\b|\bDELETE\b|\bINSERT\b|\bUPDATE\b)\s/gi,
    /--/g,
    /;/g,
    /\/\*/g,
    /\*\//g,
    /xp_/gi,
    /exec\s*\(/gi
  ];
  
  let sanitized = input;
  sqlPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });
  
  return sanitized.trim();
};

// XSS protection middleware
const sanitizeBody = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeInput(req.body[key]);
      }
    });
  }
  next();
};

// Validate property input
const validateProperty = [
  body('title').trim().isLength({ min: 3, max: 200 }).escape()
    .withMessage('Title must be between 3 and 200 characters'),
  body('description').optional().trim().isLength({ max: 5000 })
    .withMessage('Description must not exceed 5000 characters'),
  body('price').isNumeric().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('property_type').trim().isIn(['Apartment', 'Villa', 'House', 'Plot', 'Commercial'])
    .withMessage('Invalid property type'),
  body('listing_type').trim().isIn(['sale', 'rent']).withMessage('Invalid listing type'),
  body('bedrooms').optional().isInt({ min: 0, max: 50 }).withMessage('Invalid bedrooms count'),
  body('bathrooms').optional().isInt({ min: 0, max: 50 }).withMessage('Invalid bathrooms count'),
  body('area_sqft').optional().isNumeric().withMessage('Area must be numeric'),
  body('city').trim().notEmpty().escape().withMessage('City is required'),
  body('state').trim().notEmpty().escape().withMessage('State is required'),
  body('pincode').trim().isLength({ min: 6, max: 6 }).isNumeric()
    .withMessage('Pincode must be 6 digits'),
  validateRequest
];

// Validate user registration
const validateSignup = [
  body('name').trim().isLength({ min: 2, max: 100 }).escape()
    .withMessage('Name must be between 2 and 100 characters'),
  body('email').trim().isEmail().normalizeEmail()
    .withMessage('Invalid email address'),
  body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must be at least 8 characters with uppercase, lowercase, and number'),
  body('phone').optional().trim().isMobilePhone()
    .withMessage('Invalid phone number'),
  validateRequest
];

// Validate login
const validateLogin = [
  body('email').trim().isEmail().normalizeEmail()
    .withMessage('Invalid email address'),
  body('password').notEmpty().withMessage('Password is required'),
  validateRequest
];

// Validate ID parameter
const validateId = [
  param('id').isInt({ min: 1 }).withMessage('Invalid ID'),
  validateRequest
];

// Detect and log suspicious activities
const suspiciousActivityDetector = (req, res, next) => {
  const suspiciousPatterns = [
    /(<script|javascript:|onerror=|onload=)/gi,
    /(\.\.|\/etc\/passwd|\/windows\/system32)/gi,
    /(union.*select|insert.*into|delete.*from|drop.*table)/gi,
    /(%00|%0d|%0a|%27|%22)/gi
  ];
  
  const checkString = JSON.stringify({
    path: req.path,
    query: req.query,
    body: req.body
  });
  
  suspiciousPatterns.forEach(pattern => {
    if (pattern.test(checkString)) {
      console.warn(`⚠️  Suspicious activity detected from IP: ${req.ip} - Path: ${req.path}`);
      console.warn(`   Pattern matched: ${pattern}`);
      console.warn(`   User-Agent: ${req.get('user-agent')}`);
    }
  });
  
  next();
};

// CSRF protection for state-changing operations
const csrfProtection = (req, res, next) => {
  // For non-GET requests, validate origin
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const origin = req.get('origin') || req.get('referer');
    const allowedOrigins = [
      'https://yugproperties.co.in',
      'https://www.yugproperties.co.in',
      'http://localhost:3000',
      'http://localhost:3001'
    ];
    
    if (origin && !allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      console.warn(`⚠️  CSRF attempt detected from origin: ${origin}`);
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid request origin' 
      });
    }
  }
  next();
};

// Prevent timing attacks on authentication
const constantTimeCompare = (a, b) => {
  if (a.length !== b.length) return false;
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
};

module.exports = {
  validateRequest,
  sanitizeInput,
  sanitizeBody,
  validateProperty,
  validateSignup,
  validateLogin,
  validateId,
  suspiciousActivityDetector,
  csrfProtection,
  constantTimeCompare
};
