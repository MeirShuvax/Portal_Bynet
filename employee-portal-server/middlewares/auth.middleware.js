// middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: './config.env' });

const authenticate = async (req, res, next) => {
  try {
    console.log('🔐 Authentication middleware called for:', req.method, req.path);
    
    let token = null;
    
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
    }
    
    // Note: We only accept tokens in Authorization header for security
    
    if (!token) {
      console.error('❌ No valid token found');
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // If JWT token is valid, user is authorized
    // No need to check email list - if they have a valid token, they're allowed
    
    // Set user info from token
    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      microsoftId: decoded.microsoftId,
      role: 'user' // Default role for Microsoft authenticated users
    };
    
    console.log('✅ Authentication successful for user:', req.user.name, 'Email:', req.user.email);

    next();
  } catch (error) {
    console.error('❌ Authentication middleware failed:', error.message);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(500).json({ error: 'Authentication error' });
  }
};


const isAdmin = (req, res, next) => {
  console.log('🔒 isAdmin middleware called. User:', req.user ? req.user.full_name : 'No user', 'Role:', req.user ? req.user.role : 'No role');
  
  if (!req.user) {
    console.error('❌ No user in request');
    return res.status(401).json({ error: 'Authentication required' });
  }
  if (req.user.role !== 'admin') {
    console.error('❌ User is not admin. Role:', req.user.role);
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  console.log('✅ Admin access granted');
  next();
};

const isSelfOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const targetId = parseInt(req.params.id);
  if (req.user.id !== targetId && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
};

const isNotSelf = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const targetId = parseInt(req.body.to_user_id);
  if (req.user.id === targetId) {
    return res.status(400).json({ error: 'Cannot send a wish to yourself' });
  }
  next();
};

module.exports = {
  authenticate,
  isAdmin,
  isSelfOrAdmin,
  isNotSelf
};
  