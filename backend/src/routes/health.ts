import { Router, Request, Response } from 'express';

const router = Router();

/**
 * Health check endpoint
 * GET /api/health
 */
router.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    message: 'Udyam Registration API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    endpoints: {
      'GET /api/health': 'Health check',
      'GET /api/form-schema': 'Get form schema',
      'POST /api/submit': 'Submit form data',
      'GET /api/pincode/:pincode': 'Get location from pincode'
    }
  });
});

export default router;
