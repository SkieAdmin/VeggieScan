import jwt from 'jsonwebtoken';
import { prisma } from '../index.js';

/**
 * Middleware to protect routes that require authentication
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Extract the token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication token missing' });
    }
    
    // Try to verify with current secret first, then fallback to legacy secret if needed
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (verifyError) {
      // Try with legacy secret if current one fails
      try {
        // Use a hardcoded legacy secret that matches what was used when tokens were generated
        const legacySecret = 'veggiescan_secure_jwt_secret_2025';
        decoded = jwt.verify(token, legacySecret);
        console.log('Token verified with legacy secret');
      } catch (legacyError) {
        throw verifyError; // If both fail, throw the original error
      }
    }
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    // Add user to request object
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to restrict access to admin users only
 */
export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }
  next();
};
