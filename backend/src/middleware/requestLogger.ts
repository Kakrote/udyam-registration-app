import { Request, Response, NextFunction } from 'express';

/**
 * Request logger middleware
 * Logs all incoming requests with details
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Log request details
  console.log(`📥 ${new Date().toISOString()} ${req.method} ${req.path}`, {
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    contentType: req.get('Content-Type'),
    bodySize: req.get('Content-Length'),
  });

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log(`📤 ${new Date().toISOString()} ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });

  next();
};
