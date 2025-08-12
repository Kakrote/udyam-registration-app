import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { Input, Select, Textarea } from './ui/FormControls';
import { Button } from './ui/Button';

// Step 2 validation schema
const step2Schema = z.object({
  businessName: z.string()
    .min(2, 'Business name must be at least 2 characters long')
    .max(200, 'Business name must not exceed 200 characters'),
  
  businessType: z.string()
    .min(1, 'Please select a business type'),
  
  businessAddress: z.string()
    .min(10, 'Business address must be at least 10 characters long')
    .max(500, 'Business address must not exceed 500 characters'),
  
  pincode: z.string()
    .length(6, 'PIN code must be exactly 6 digits')
    .regex(/^[0-9]{6}$/, 'PIN code must contain only digits'),
  
  state: z.string()
    .min(2, 'State is required'),
  
  district: z.string()
    .min(2, 'District is required'),
  
  city: z.string()
    .min(2, 'City is required')
    .optional()
    .or(z.literal('')),
  
  gstinNumber: z.string()
    .length(15, 'GSTIN must be exactly 15 characters')
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN format')
    .optional()
    .or(z.literal('')),
});

type Step2FormData = z.infer<typeof step2Schema>;

interface Step2Props {
  initialData?: Partial<Step2FormData>;
  onSubmit: (data: Step2FormData) => void;
  onBack: () => void;
  isLoading?: boolean;
}

const businessTypeOptions = [
  { value: '', text: 'Select Organization Type' },
  { value: 'proprietorship', text: 'Proprietorship' },
  { value: 'partnership', text: 'Partnership' },
  { value: 'llp', text: 'Limited Liability Partnership (LLP)' },
  { value: 'private_limited', text: 'Private Limited Company' },
  { value: 'public_limited', text: 'Public Limited Company' },
  { value: 'cooperative', text: 'Cooperative Society' },
];

export const Step2Form: React.FC<Step2Props> = ({
  initialData,
  onSubmit,
  onBack,
  isLoading = false
}) => {
  const [isLoadingPincode, setIsLoadingPincode] = useState(false);
  const [pincodeError, setPincodeError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    setError,
    clearErrors
  } = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    defaultValues: initialData || {},
    mode: 'onChange'
  });

  const pincode = watch('pincode');

  // Auto-fill location based on PIN code
  useEffect(() => {
    if (pincode && pincode.length === 6 && /^[0-9]{6}$/.test(pincode)) {
      fetchLocationFromPincode(pincode);
    } else if (pincode && pincode.length === 6) {
      setPincodeError('Invalid PIN code format');
    } else {
      setPincodeError('');
      clearErrors(['state', 'district', 'city']);
    }
  }, [pincode, clearErrors]);

  const fetchLocationFromPincode = async (pincodeValue: string) => {
    setIsLoadingPincode(true);
    setPincodeError('');

    try {
      // First try our backend API
      const backendResponse = await axios.get(
        `/api/pincode/${pincodeValue}`,
        { timeout: 5000 }
      );

      if (backendResponse.data.success) {
        const { city, district, state } = backendResponse.data.data;
        setValue('city', city);
        setValue('district', district);
        setValue('state', state);
        return;
      }
    } catch (error) {
      console.log('Backend API failed, trying external API...');
    }

    try {
      // Fallback to external API
      const response = await axios.get(
        `https://api.postalpincode.in/pincode/${pincodeValue}`,
        { timeout: 5000 }
      );

      if (response.data?.[0]?.Status === 'Success') {
        const postOffice = response.data[0].PostOffice[0];
        setValue('city', postOffice.Name);
        setValue('district', postOffice.District);
        setValue('state', postOffice.State);
      } else {
        setPincodeError('Invalid PIN code or location not found');
        setError('pincode', {
          type: 'manual',
          message: 'Invalid PIN code or location not found'
        });
      }
    } catch (error) {
      console.error('Error fetching location:', error);
      setPincodeError('Unable to fetch location details. Please enter manually.');
    } finally {
      setIsLoadingPincode(false);
    }
  };

  const handleFormSubmit = (data: Step2FormData) => {
    // Clean up data
    const cleanedData = {
      ...data,
      gstinNumber: data.gstinNumber && data.gstinNumber.trim() ? data.gstinNumber.trim().toUpperCase() : undefined,
      city: data.city && data.city.trim() ? data.city.trim() : undefined
    };
    onSubmit(cleanedData);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Business Details
        </h2>
        <p className="text-gray-600">
          Please provide your business information
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Business Name */}
        <Input
          {...register('businessName')}
          type="text"
          label="Name of Enterprise"
          placeholder="Enter your business name"
          error={errors.businessName?.message}
          helperText="Official name of your business or enterprise"
          required
        />

        {/* Business Type */}
        <Select
          {...register('businessType')}
          label="Type of Organization"
          options={businessTypeOptions}
          error={errors.businessType?.message}
          helperText="Select the legal structure of your business"
          required
        />

        {/* Business Address */}
        <Textarea
          {...register('businessAddress')}
          label="Business Address"
          placeholder="Enter complete business address"
          error={errors.businessAddress?.message}
          helperText="Complete address where your business operates"
          required
          rows={3}
        />

        {/* PIN Code */}
        <div className="relative">
          <Input
            {...register('pincode')}
            type="text"
            label="PIN Code"
            placeholder="Enter 6-digit PIN code"
            maxLength={6}
            error={errors.pincode?.message || pincodeError}
            helperText="City, district, and state will be auto-filled"
            required
          />
          {isLoadingPincode && (
            <div className="absolute right-3 top-9">
              <svg className="animate-spin h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
            </div>
          )}
        </div>

        {/* State */}
        <Input
          {...register('state')}
          type="text"
          label="State"
          placeholder="State will be auto-filled from PIN code"
          error={errors.state?.message}
          helperText="State based on PIN code"
          required
          readOnly={!errors.pincode}
          className={!errors.pincode ? 'bg-gray-50' : ''}
        />

        {/* District */}
        <Input
          {...register('district')}
          type="text"
          label="District"
          placeholder="District will be auto-filled from PIN code"
          error={errors.district?.message}
          helperText="District based on PIN code"
          required
          readOnly={!errors.pincode}
          className={!errors.pincode ? 'bg-gray-50' : ''}
        />

        {/* City */}
        <Input
          {...register('city')}
          type="text"
          label="City (Optional)"
          placeholder="City will be auto-filled from PIN code"
          error={errors.city?.message}
          helperText="City/Town based on PIN code"
          readOnly={!errors.pincode}
          className={!errors.pincode ? 'bg-gray-50' : ''}
        />

        {/* GSTIN Number */}
        <Input
          {...register('gstinNumber')}
          type="text"
          label="GSTIN Number (Optional)"
          placeholder="Enter 15-digit GSTIN (e.g. 22AAAAA0000A1Z5)"
          maxLength={15}
          error={errors.gstinNumber?.message}
          helperText="GST Identification Number (if applicable)"
          style={{ textTransform: 'uppercase' }}
          onChange={(e) => {
            const value = e.target.value.toUpperCase();
            setValue('gstinNumber', value);
          }}
        />

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            size="lg"
            className="min-w-32"
          >
            Previous
          </Button>
          <Button
            type="submit"
            loading={isLoading}
            disabled={!isValid || isLoadingPincode}
            size="lg"
            className="min-w-32"
          >
            Submit Form
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
            Loading Pincode: {isLoadingPincode ? 'Yes' : 'No'}
          </p>
        </div>
      )}
    </div>
  );
};
