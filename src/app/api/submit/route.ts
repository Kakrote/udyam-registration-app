// Form submission endpoint
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';

// Validation schema (same as your backend)
const udyamSchema = z.object({
  // Basic Information
  aadhaarNumber: z.string().min(12, 'Aadhaar number must be 12 digits').max(12),
  applicantName: z.string().min(1, 'Applicant name is required'),
  panNumber: z.string().optional(),
  mobileNumber: z.string().regex(/^[6-9]\d{9}$/, 'Invalid mobile number'),
  emailAddress: z.string().email('Invalid email address'),
  
  // Business Details
  businessName: z.string().min(1, 'Business name is required'),
  businessType: z.string().min(1, 'Business type is required'),
  businessAddress: z.string().min(1, 'Business address is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Invalid PIN code'),
  state: z.string().min(1, 'State is required'),
  district: z.string().min(1, 'District is required'),
  city: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = udyamSchema.parse(body);
    
    // Save to database
    const submission = await prisma.udyamRegistration.create({
      data: {
        aadhaarNumber: validatedData.aadhaarNumber,
        applicantName: validatedData.applicantName,
        panNumber: validatedData.panNumber || null,
        mobileNumber: validatedData.mobileNumber,
        emailAddress: validatedData.emailAddress,
        businessName: validatedData.businessName,
        businessType: validatedData.businessType,
        businessAddress: validatedData.businessAddress,
        pincode: validatedData.pincode,
        state: validatedData.state,
        district: validatedData.district,
        city: validatedData.city || null,
        status: 'PENDING'
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Form submitted successfully',
      submissionId: submission.id
    });
    
  } catch (error) {
    console.error('Form submission error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error.issues
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
