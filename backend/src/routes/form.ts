import { Router } from 'express';
import { 
  getFormSchema, 
  submitFormData, 
  getPincodeDetails 
} from '../controllers/formController';
import { validate, udyamValidationSchemas } from '../middleware/validation';

const router = Router();

/**
 * GET /api/form-schema
 * Returns the Udyam registration form schema
 */
router.get('/form-schema', getFormSchema);

/**
 * POST /api/submit
 * Submits and validates Udyam registration form data
 */
router.post('/submit', 
  validate({ body: udyamValidationSchemas.completeForm }),
  submitFormData
);

/**
 * GET /api/pincode/:pincode
 * Gets location details (city, district, state) for a given PIN code
 */
router.get('/pincode/:pincode', getPincodeDetails);

export default router;
