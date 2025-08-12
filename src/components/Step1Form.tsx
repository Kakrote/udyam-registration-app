import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input, Select } from './ui/FormControls';
import { Button } from './ui/Button';

// Step 1 validation schema
const step1Schema = z.object({
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
    .optional()
    .or(z.literal('')),
});

type Step1FormData = z.infer<typeof step1Schema>;

interface Step1Props {
  initialData?: Partial<Step1FormData>;
  onSubmit: (data: Step1FormData) => void;
  isLoading?: boolean;
}

export const Step1Form: React.FC<Step1Props> = ({
  initialData,
  onSubmit,
  isLoading = false
}) => {
  const [isValidating, setIsValidating] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    trigger
  } = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: initialData || {},
    mode: 'onChange'
  });

  // Watch for Aadhaar number changes to trigger real-time validation
  const aadhaarNumber = watch('aadhaarNumber');

  useEffect(() => {
    if (aadhaarNumber && aadhaarNumber.length === 12) {
      setIsValidating(true);
      const timer = setTimeout(() => {
        trigger('aadhaarNumber');
        setIsValidating(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [aadhaarNumber, trigger]);

  const handleFormSubmit = (data: Step1FormData) => {
    // Clean up PAN number - convert empty string to undefined
    const cleanedData = {
      ...data,
      panNumber: data.panNumber && data.panNumber.trim() ? data.panNumber.trim().toUpperCase() : undefined
    };
    onSubmit(cleanedData);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Basic Information
        </h2>
        <p className="text-gray-600">
          Please provide your basic details as per government records
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Aadhaar Number */}
        <Input
          {...register('aadhaarNumber')}
          type="text"
          label="Aadhaar Number"
          placeholder="Enter 12-digit Aadhaar number"
          maxLength={12}
          error={errors.aadhaarNumber?.message}
          helperText="Your Aadhaar number as per UIDAI records"
          required
        />

        {/* Applicant Name */}
        <Input
          {...register('applicantName')}
          type="text"
          label="Name of Entrepreneur"
          placeholder="Enter name as per Aadhaar"
          error={errors.applicantName?.message}
          helperText="Name should match with your Aadhaar card"
          required
        />

        {/* Mobile Number */}
        <Input
          {...register('mobileNumber')}
          type="tel"
          label="Mobile Number"
          placeholder="Enter 10-digit mobile number"
          maxLength={10}
          error={errors.mobileNumber?.message}
          helperText="This mobile number will be used for OTP verification"
          required
        />

        {/* Email Address */}
        <Input
          {...register('emailAddress')}
          type="email"
          label="Email Address"
          placeholder="Enter your email address"
          error={errors.emailAddress?.message}
          helperText="All communications will be sent to this email"
          required
        />

        {/* PAN Number */}
        <Input
          {...register('panNumber')}
          type="text"
          label="PAN Number (Optional)"
          placeholder="Enter PAN number (ABCDE1234F)"
          maxLength={10}
          error={errors.panNumber?.message}
          helperText="PAN number is optional but recommended for business registration"
          style={{ textTransform: 'uppercase' }}
          onChange={(e) => {
            const value = e.target.value.toUpperCase();
            setValue('panNumber', value);
          }}
        />

        {/* Submit Button */}
        <div className="flex justify-end pt-6">
          <Button
            type="submit"
            loading={isLoading || isValidating}
            disabled={!isValid}
            size="lg"
            className="min-w-32"
          >
            Next Step
          </Button>
        </div>
      </form>

      {/* Form Validation Status */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-100 rounded-md">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Form Status (Dev Mode)
          </h4>
          <p className="text-xs text-gray-600">
            Valid: {isValid ? 'Yes' : 'No'} | 
            Errors: {Object.keys(errors).length} | 
            Validating: {isValidating ? 'Yes' : 'No'}
          </p>
        </div>
      )}
    </div>
  );
};
