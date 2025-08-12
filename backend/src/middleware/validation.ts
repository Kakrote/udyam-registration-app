import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

/**
 * Validation middleware factory
 * Creates middleware to validate request data against Zod schemas
 */
export const validate = (schema: {
  body?: z.ZodSchema;
  query?: z.ZodSchema;
  params?: z.ZodSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }

      // Validate query parameters
      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }

      // Validate URL parameters
      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          message: 'Invalid request data',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code,
            received: (err as any).received
          })),
          timestamp: new Date().toISOString(),
        });
      }

      next(error);
    }
  };
};

// Udyam form validation schemas
export const udyamValidationSchemas = {
  // Step 1 validation
  step1: z.object({
    aadhaarNumber: z.string()
      .length(12, 'Aadhaar number must be exactly 12 digits')
      .regex(/^[0-9]{12}$/, 'Aadhaar number must contain only digits'),
    
    applicantName: z.string()
      .min(2, 'Name must be at least 2 characters long')
      .max(100, 'Name must not exceed 100 characters')
      .regex(/^[a-zA-Z\s\.]+$/, 'Name must contain only letters, spaces, and dots'),
    
    mobileNumber: z.string()
      .length(10, 'Mobile number must be exactly 10 digits')
      .regex(/^[6-9][0-9]{9}$/, 'Mobile number must start with 6-9 and be 10 digits long'),
    
    emailAddress: z.string()
      .email('Please provide a valid email address')
      .max(255, 'Email address is too long'),
    
    panNumber: z.string()
      .length(10, 'PAN number must be exactly 10 characters')
      .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'PAN must be in format ABCDE1234F')
      .optional(),
  }),

  // Step 2 validation
  step2: z.object({
    businessName: z.string()
      .min(2, 'Business name must be at least 2 characters long')
      .max(200, 'Business name must not exceed 200 characters'),
    
    businessType: z.enum([
      'proprietorship',
      'partnership',
      'llp',
      'private_limited',
      'public_limited',
      'cooperative'
    ], {
      errorMap: () => ({ message: 'Please select a valid business type' })
    }),
    
    businessAddress: z.string()
      .min(10, 'Business address must be at least 10 characters long')
      .max(500, 'Business address must not exceed 500 characters'),
    
    pincode: z.string()
      .length(6, 'PIN code must be exactly 6 digits')
      .regex(/^[0-9]{6}$/, 'PIN code must contain only digits'),
    
    state: z.string()
      .min(2, 'State name must be at least 2 characters long')
      .max(100, 'State name is too long'),
    
    district: z.string()
      .min(2, 'District name must be at least 2 characters long')
      .max(100, 'District name is too long'),
    
    city: z.string()
      .min(2, 'City name must be at least 2 characters long')
      .max(100, 'City name is too long')
      .optional(),
    
    gstinNumber: z.string()
      .length(15, 'GSTIN must be exactly 15 characters')
      .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN format')
      .optional(),
  }),

  // Complete form submission validation
  completeForm: z.object({
    // Step 1 fields
    aadhaarNumber: z.string()
      .length(12, 'Aadhaar number must be exactly 12 digits')
      .regex(/^[0-9]{12}$/, 'Aadhaar number must contain only digits'),
    
    applicantName: z.string()
      .min(2, 'Name must be at least 2 characters long')
      .max(100, 'Name must not exceed 100 characters'),
    
    mobileNumber: z.string()
      .length(10, 'Mobile number must be exactly 10 digits')
      .regex(/^[6-9][0-9]{9}$/, 'Mobile number must start with 6-9'),
    
    emailAddress: z.string()
      .email('Please provide a valid email address'),
    
    panNumber: z.string()
      .length(10, 'PAN number must be exactly 10 characters')
      .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format')
      .optional(),

    // Step 2 fields
    businessName: z.string()
      .min(2, 'Business name must be at least 2 characters long')
      .max(200, 'Business name is too long'),
    
    businessType: z.string()
      .min(1, 'Business type is required'),
    
    businessAddress: z.string()
      .min(10, 'Business address must be at least 10 characters long'),
    
    pincode: z.string()
      .length(6, 'PIN code must be exactly 6 digits')
      .regex(/^[0-9]{6}$/, 'PIN code must contain only digits'),
    
    state: z.string()
      .min(2, 'State is required'),
    
    district: z.string()
      .min(2, 'District is required'),
    
    city: z.string().optional(),
    gstinNumber: z.string().optional(),
    bankAccountNumber: z.string().optional(),
    ifscCode: z.string().optional(),
  }),
};
