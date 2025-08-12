import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await axios.get(`${BACKEND_URL}/api/form-schema`, {
      timeout: 10000,
    });

    res.status(200).json(response.data);
  } catch (error: any) {
    console.error('Error fetching form schema:', error.message);
    
    // Return fallback schema if backend is not available
    const fallbackSchema = {
      success: true,
      data: {
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
      },
      message: 'Form schema retrieved (fallback)'
    };
    
    res.status(200).json(fallbackSchema);
  }
}
