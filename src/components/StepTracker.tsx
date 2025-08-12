import React from 'react';
import { Progress } from './ui/Progress';

interface StepTrackerProps {
  currentStep: number;
  totalSteps: number;
  steps: Array<{
    number: number;
    title: string;
    completed?: boolean;
  }>;
}

export const StepTracker: React.FC<StepTrackerProps> = ({
  currentStep,
  totalSteps,
  steps
}) => {
  return (
    <div className="w-full mb-8">
      {/* Progress Bar */}
      <Progress 
        value={currentStep} 
        max={totalSteps} 
        className="mb-6"
        showPercentage
      />
      
      {/* Step Indicators */}
      <div className="flex justify-between">
        {steps.map((step) => (
          <div
            key={step.number}
            className="flex flex-col items-center"
          >
            {/* Step Circle */}
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                step.number < currentStep || step.completed
                  ? 'bg-green-500 text-white'
                  : step.number === currentStep
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {step.number < currentStep || step.completed ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                step.number
              )}
            </div>
            
            {/* Step Title */}
            <div className="mt-2 text-center">
              <div
                className={`text-xs font-medium ${
                  step.number <= currentStep
                    ? 'text-blue-600'
                    : 'text-gray-500'
                }`}
              >
                {step.title}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
