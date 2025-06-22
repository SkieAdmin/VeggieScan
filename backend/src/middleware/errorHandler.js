/**
 * Global error handling middleware
 */
export const errorHandler = (err, req, res, next) => {
  // Log the error for server-side debugging
  console.error('Error:', err);

  // Default error status and message
  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Prisma specific errors
  if (err.name === 'PrismaClientKnownRequestError') {
    // Handle unique constraint violations
    if (err.code === 'P2002') {
      return res.status(409).json({
        error: 'Resource already exists',
        details: `A resource with this ${err.meta?.target?.join(', ')} already exists`
      });
    }
    
    // Handle record not found
    if (err.code === 'P2025') {
      return res.status(404).json({
        error: 'Resource not found',
        details: err.meta?.cause || 'The requested resource does not exist'
      });
    }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid token',
      details: 'The authentication token provided is invalid'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expired',
      details: 'The authentication token has expired'
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      details: err.details || err.message
    });
  }

  // Default error response
  res.status(status).json({
    error: message,
    details: err.details || null,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};
