// Form schema endpoint
import { NextResponse } from 'next/server';
import udyamSchemaData from '../../../lib/udyam-schema.json';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: udyamSchemaData,
      message: 'Form schema loaded successfully'
    });
  } catch (error) {
    console.error('Error loading form schema:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Error loading form schema'
    }, { status: 500 });
  }
}
