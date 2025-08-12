import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

/**
 * Get form schema
 * GET /api/form-schema
 */
export const getFormSchema = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Read schema from file
    const schemaPath = path.join(__dirname, '..', 'data', 'udyam-schema.json');
    const schemaContent = await fs.readFile(schemaPath, 'utf-8');
    const schema = JSON.parse(schemaContent);

    // Log the request for analytics
    await prisma.formSubmissionLog.create({
      data: {
        endpoint: '/api/form-schema',
        method: 'GET',
        statusCode: 200,
        responseTime: 0, // Will be updated if needed
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
      },
    }).catch(error => {
      console.error('Failed to log request:', error);
    });

    res.json({
      success: true,
      data: schema,
      message: 'Form schema retrieved successfully',
    });
  } catch (error) {
    console.error('Error reading form schema:', error);
    
    // Return a fallback schema
    const fallbackSchema = {
      steps: [
        {
          stepNumber: 1,
          title: "Basic Information",
          fields: [
            {
              id: "aadhaar_number",
              name: "aadhaar_number",
              type: "text",
              label: "Aadhaar Number",
              required: true,
              placeholder: "Enter 12-digit Aadhaar number",
              maxLength: 12,
              pattern: "^[0-9]{12}$",
              step: 1
            },
            {
              id: "applicant_name",
              name: "applicant_name",
              type: "text",
              label: "Name of Applicant",
              required: true,
              placeholder: "Enter full name",
              maxLength: 100,
              step: 1
            },
            {
              id: "mobile_number",
              name: "mobile_number",
              type: "tel",
              label: "Mobile Number",
              required: true,
              placeholder: "Enter 10-digit mobile number",
              maxLength: 10,
              pattern: "^[6-9][0-9]{9}$",
              step: 1
            },
            {
              id: "email_address",
              name: "email_address",
              type: "email",
              label: "Email Address",
              required: true,
              placeholder: "Enter email address",
              step: 1
            },
            {
              id: "pan_number",
              name: "pan_number",
              type: "text",
              label: "PAN Number (Optional)",
              required: false,
              placeholder: "Enter PAN number",
              maxLength: 10,
              pattern: "^[A-Z]{5}[0-9]{4}[A-Z]{1}$",
              step: 1
            }
          ]
        },
        {
          stepNumber: 2,
          title: "Business Details",
          fields: [
            {
              id: "business_name",
              name: "business_name",
              type: "text",
              label: "Name of Enterprise",
              required: true,
              placeholder: "Enter business name",
              maxLength: 200,
              step: 2
            },
            {
              id: "business_type",
              name: "business_type",
              type: "select",
              label: "Type of Organization",
              required: true,
              step: 2,
              options: [
                { value: "", text: "Select Organization Type" },
                { value: "proprietorship", text: "Proprietorship" },
                { value: "partnership", text: "Partnership" },
                { value: "llp", text: "Limited Liability Partnership (LLP)" },
                { value: "private_limited", text: "Private Limited Company" },
                { value: "public_limited", text: "Public Limited Company" },
                { value: "cooperative", text: "Cooperative Society" }
              ]
            },
            {
              id: "business_address",
              name: "business_address",
              type: "textarea",
              label: "Business Address",
              required: true,
              placeholder: "Enter complete business address",
              step: 2
            },
            {
              id: "pincode",
              name: "pincode",
              type: "text",
              label: "PIN Code",
              required: true,
              placeholder: "Enter 6-digit PIN code",
              maxLength: 6,
              pattern: "^[0-9]{6}$",
              step: 2
            },
            {
              id: "state",
              name: "state",
              type: "text",
              label: "State",
              required: true,
              placeholder: "State will be auto-filled",
              step: 2
            },
            {
              id: "district",
              name: "district",
              type: "text",
              label: "District",
              required: true,
              placeholder: "District will be auto-filled",
              step: 2
            },
            {
              id: "city",
              name: "city",
              type: "text",
              label: "City",
              required: false,
              placeholder: "City will be auto-filled",
              step: 2
            }
          ]
        }
      ],
      validationRules: {
        aadhaar: {
          pattern: "^[0-9]{12}$",
          message: "Aadhaar number must be 12 digits",
          required: true
        },
        pan: {
          pattern: "^[A-Z]{5}[0-9]{4}[A-Z]{1}$",
          message: "PAN must be in format ABCDE1234F",
          required: false
        },
        mobile: {
          pattern: "^[6-9][0-9]{9}$",
          message: "Mobile number must be 10 digits starting with 6-9",
          required: true
        },
        email: {
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
          message: "Please enter a valid email address",
          required: true
        },
        pincode: {
          pattern: "^[0-9]{6}$",
          message: "PIN code must be 6 digits",
          required: true
        }
      }
    };

    res.json({
      success: true,
      data: fallbackSchema,
      message: 'Form schema retrieved (fallback version)',
    });
  }
};

/**
 * Submit form data
 * POST /api/submit
 */
export const submitFormData = async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  try {
    const formData = req.body;
    
    // Create new registration record
    const registration = await prisma.udyamRegistration.create({
      data: {
        aadhaarNumber: formData.aadhaarNumber,
        applicantName: formData.applicantName,
        panNumber: formData.panNumber || null,
        mobileNumber: formData.mobileNumber,
        emailAddress: formData.emailAddress,
        businessName: formData.businessName,
        businessType: formData.businessType,
        businessAddress: formData.businessAddress,
        pincode: formData.pincode,
        state: formData.state,
        district: formData.district,
        city: formData.city || null,
        gstinNumber: formData.gstinNumber || null,
        bankAccountNumber: formData.bankAccountNumber || null,
        ifscCode: formData.ifscCode || null,
        submissionStep: 2,
        isCompleted: true,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
      },
    });

    const responseTime = Date.now() - startTime;

    // Log successful submission
    await prisma.formSubmissionLog.create({
      data: {
        endpoint: '/api/submit',
        method: 'POST',
        statusCode: 201,
        responseTime,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        requestData: formData,
      },
    }).catch(error => {
      console.error('Failed to log request:', error);
    });

    res.status(201).json({
      success: true,
      data: {
        id: registration.id,
        createdAt: registration.createdAt,
        submissionStep: registration.submissionStep,
        isCompleted: registration.isCompleted,
      },
      message: 'Form submitted successfully',
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    // Log failed submission
    await prisma.formSubmissionLog.create({
      data: {
        endpoint: '/api/submit',
        method: 'POST',
        statusCode: 500,
        responseTime,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        requestData: req.body,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      },
    }).catch(logError => {
      console.error('Failed to log error:', logError);
    });

    next(error);
  }
};

/**
 * Get PIN code details
 * GET /api/pincode/:pincode
 */
export const getPincodeDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pincode } = req.params;

    // Validate PIN code format
    if (!/^[0-9]{6}$/.test(pincode)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid PIN code format. Please provide a 6-digit PIN code.',
      });
    }

    // First, check if we have it in our database
    let locationData = await prisma.postalCode.findUnique({
      where: { pincode },
      select: {
        city: true,
        district: true,
        state: true,
      },
    });

    // If not found in database, try to fetch from external API
    if (!locationData) {
      try {
        // Using PostPin API (requires API key in production)
        const apiUrl = `https://api.postalpincode.in/pincode/${pincode}`;
        const response = await axios.get(apiUrl, { timeout: 5000 });
        
        if (response.data && response.data[0] && response.data[0].Status === 'Success') {
          const postOffice = response.data[0].PostOffice[0];
          locationData = {
            city: postOffice.Name,
            district: postOffice.District,
            state: postOffice.State,
          };

          // Save to database for future use
          await prisma.postalCode.create({
            data: {
              pincode,
              city: locationData.city,
              district: locationData.district,
              state: locationData.state,
            },
          }).catch(error => {
            console.error('Failed to save postal code data:', error);
          });
        }
      } catch (apiError) {
        console.error('External API error:', apiError);
        // Continue with fallback response
      }
    }

    if (!locationData) {
      return res.status(404).json({
        success: false,
        message: 'Location details not found for the provided PIN code.',
        data: null,
      });
    }

    res.json({
      success: true,
      data: {
        pincode,
        city: locationData.city,
        district: locationData.district,
        state: locationData.state,
      },
      message: 'Location details retrieved successfully',
    });

  } catch (error) {
    next(error);
  }
};
