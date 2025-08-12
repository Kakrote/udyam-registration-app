import React, { useState, useEffect } from 'react';
import { StepTracker } from './StepTracker';
import { Step1Form } from './Step1Form';
import { Step2Form } from './Step2Form';
import axios from 'axios';

interface FormSchema {
  steps: Array<{
    stepNumber: number;
    title: string;
    fields: any[];
  }>;
  validationRules: Record<string, any>;
}

interface FormData {
  // Step 1
  aadhaarNumber: string;
  applicantName: string;
  mobileNumber: string;
  emailAddress: string;
  panNumber?: string;
  // Step 2
  businessName: string;
  businessType: string;
  businessAddress: string;
  pincode: string;
  state: string;
  district: string;
  city?: string;
  gstinNumber?: string;
}

export const UdyamRegistrationForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<FormData>>({});
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Load form schema on component mount
  useEffect(() => {
    loadFormSchema();
  }, []);

  const loadFormSchema = async () => {
    try {
      const response = await axios.get('/api/form-schema');
      if (response.data.success) {
        setSchema(response.data.data);
      }
    } catch (error) {
      console.error('Error loading form schema:', error);
      // Continue with default behavior - forms have built-in validation
    }
  };

  const steps = [
    { number: 1, title: 'Basic Info', completed: currentStep > 1 },
    { number: 2, title: 'Business Details', completed: currentStep > 2 },
  ];

  const handleStep1Submit = (data: any) => {
    setFormData({ ...formData, ...data });
    setCurrentStep(2);
  };

  const handleStep2Submit = async (data: any) => {
    setIsLoading(true);
    setErrorMessage('');

    const completeFormData = { ...formData, ...data };

    try {
      const response = await axios.post('/api/submit', completeFormData);
      
      if (response.data.success) {
        setSubmitStatus('success');
        setFormData(completeFormData);
      } else {
        throw new Error(response.data.message || 'Submission failed');
      }
    } catch (error: any) {
      setSubmitStatus('error');
      
      if (error.response?.data?.details) {
        // Validation errors
        const validationErrors = error.response.data.details
          .map((err: any) => `${err.field}: ${err.message}`)
          .join(', ');
        setErrorMessage(`Validation errors: ${validationErrors}`);
      } else if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Failed to submit form. Please try again.');
      }
      
      console.error('Form submission error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToStep1 = () => {
    setCurrentStep(1);
    setSubmitStatus('idle');
    setErrorMessage('');
  };

  const handleStartOver = () => {
    setCurrentStep(1);
    setFormData({});
    setSubmitStatus('idle');
    setErrorMessage('');
  };

  // Success state
  if (submitStatus === 'success') {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-green-900 mb-2">
            Form Submitted Successfully!
          </h2>
          <p className="text-green-700 mb-6">
            Your Udyam Registration form has been submitted successfully. You will receive a confirmation email shortly.
          </p>
          
          <div className="bg-white border border-green-200 rounded-md p-4 mb-6">
            <h3 className="font-semibold text-green-900 mb-2">Submitted Information:</h3>
            <div className="text-left space-y-1 text-sm text-green-800">
              <p><strong>Name:</strong> {formData.applicantName}</p>
              <p><strong>Business:</strong> {formData.businessName}</p>
              <p><strong>Email:</strong> {formData.emailAddress}</p>
              <p><strong>Mobile:</strong> {formData.mobileNumber}</p>
            </div>
          </div>
          
          <button
            onClick={handleStartOver}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            Submit Another Form
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Udyam Registration Form
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Register your micro, small, or medium enterprise (MSME) with the Government of India. 
          This process is completely free and takes just a few minutes.
        </p>
      </div>

      {/* Step Tracker */}
      <StepTracker
        currentStep={currentStep}
        totalSteps={2}
        steps={steps}
      />

      {/* Error Message */}
      {submitStatus === 'error' && errorMessage && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Submission Error
              </h3>
              <div className="mt-1 text-sm text-red-700">
                {errorMessage}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Steps */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
        {currentStep === 1 && (
          <Step1Form
            initialData={formData}
            onSubmit={handleStep1Submit}
            isLoading={isLoading}
          />
        )}

        {currentStep === 2 && (
          <Step2Form
            initialData={formData}
            onSubmit={handleStep2Submit}
            onBack={handleBackToStep1}
            isLoading={isLoading}
          />
        )}
      </div>

      {/* Help Text */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Need help? This registration is completely free. 
          <a 
            href="https://udyamregistration.gov.in" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 ml-1"
          >
            Visit the official website
          </a>
        </p>
      </div>

      {/* Schema Info (Development Mode) */}
      {process.env.NODE_ENV === 'development' && schema && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Schema Info (Dev Mode)
          </h4>
          <p className="text-xs text-gray-600">
            Loaded {schema.steps.length} steps with{' '}
            {schema.steps.reduce((total, step) => total + step.fields.length, 0)} total fields
          </p>
        </div>
      )}
    </div>
  );
};
