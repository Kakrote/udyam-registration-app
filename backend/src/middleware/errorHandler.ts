import { Request, Response, NextFunction } from 'express';

/**
 * Global error handler middleware
 * Handles all errors thrown in the application
 */
export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error occurred:', error);

  // Default error response
  let statusCode = 500;
  let message = 'Internal server error';
  let details: any = undefined;

  // Handle different types of errors
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation error';
    details = error.errors || error.message;
  } else if (error.name === 'PrismaClientKnownRequestError') {
    statusCode = 400;
    message = 'Database error';
    
    // Handle specific Prisma errors
    switch (error.code) {
      case 'P2002':
        message = 'Duplicate entry found';
        details = `${error.meta?.target} already exists`;
        break;
      case 'P2025':
        message = 'Record not found';
        break;
      default:
        details = error.message;
    }
  } else if (error.name === 'PrismaClientValidationError') {
    statusCode = 400;
    message = 'Invalid data provided';
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  } else if (error.statusCode || error.status) {
    statusCode = error.statusCode || error.status;
    message = error.message || message;
  }

  // Send error response
  const errorResponse: any = {
    error: true,
    message,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
  };

  if (process.env.NODE_ENV === 'development' || details) {
    errorResponse.details = details || error.message;
  }

  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = error.stack;
  }

  res.status(statusCode).json(errorResponse);
};
