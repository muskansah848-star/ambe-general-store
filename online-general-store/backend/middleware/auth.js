const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT and attach user to request
exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({ message: 'Not authorized. Please log in.' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ message: 'User no longer exists.' });
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token. Please log in again.' });
  }
};

// Allow only admin role — must be used after protect
exports.adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  res.status(403).json({
    message: 'Access denied. Admin privileges required.',
    role: req.user?.role,
  });
};
