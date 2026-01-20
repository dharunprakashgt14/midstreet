/**
 * Authentication Middleware
 * 
 * Protects admin routes by verifying JWT tokens.
 * Add this middleware to any route that requires admin authentication.
 */

import jwt from 'jsonwebtoken';

/**
 * Middleware to verify JWT token for admin routes
 * 
 * Usage: Add to routes like this:
 * router.get('/protected-route', authenticateToken, controllerFunction);
 */
export const authenticateToken = (req, res, next) => {
  // Get token from Authorization header
  // Format: "Bearer <token>"
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract token after "Bearer "

  // If no token provided, return 401 Unauthorized
  if (!token) {
    return res.status(401).json({ 
      error: 'Access denied. No token provided.',
      message: 'Please login to access this resource.'
    });
  }

  try {
    // Verify the token using the secret key
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }

    const decoded = jwt.verify(token, secret);
    
    // Attach decoded user info to request object
    // This allows controllers to access user info (e.g., req.user.username)
    req.user = decoded;
    
    // Continue to the next middleware/controller
    next();
  } catch (error) {
    // Token is invalid or expired
    return res.status(403).json({ 
      error: 'Invalid or expired token',
      message: 'Please login again.'
    });
  }
};






