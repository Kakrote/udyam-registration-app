// Form submission endpoint
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema (same as your backend)
const udyamSchema = z.object({
  // Basic Information
  enterpriseName: z.string().min(1, 'Enterprise name is required'),
  majorActivity: z.string().min(1, 'Major activity is required'),
  
  // Organization Details
  organizationType: z.enum(['PROPRIETARY', 'PARTNERSHIP', 'COMPANY', 'COOPERATIVE']),
  dateOfIncorporation: z.string(),
  
  // Contact Information
  mobileNumber: z.string().regex(/^[6-9]\d{9}$/, 'Invalid mobile number'),
  emailId: z.string().email('Invalid email address'),
  
  // Address
  address: z.string().min(1, 'Address is required'),
  pinCode: z.string().regex(/^\d{6}$/, 'Invalid PIN code'),
  district: z.string().min(1, 'District is required'),
  state: z.string().min(1, 'State is required'),
  
  // Business Details
  numberOfEmployees: z.number().min(0),
  investmentInPlantMachinery: z.number().min(0),
  turnoverAmount: z.number().min(0),
  
  // Bank Details (optional)
  bankName: z.string().optional(),
  branchName: z.string().optional(),
  accountNumber: z.string().optional(),
  ifscCode: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = udyamSchema.parse(body);
    
    // For now, just log the data (you can add database logic later)
    console.log('Form submitted:', validatedData);
    
    // TODO: Save to database
    // const submission = await prisma.udyamSubmission.create({
    //   data: {
    //     ...validatedData,
    //     submittedAt: new Date(),
    //     status: 'PENDING'
    //   }
    // });
    
    return NextResponse.json({
      success: true,
      message: 'Form submitted successfully',
      submissionId: `UDY-${Date.now()}`
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
