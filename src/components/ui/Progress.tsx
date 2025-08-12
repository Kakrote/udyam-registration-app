import React from 'react';
import { clsx } from 'clsx';

interface ProgressProps {
  value: number;
  max: number;
  className?: string;
  showPercentage?: boolean;
}

export const Progress: React.FC<ProgressProps> = ({ 
  value, 
  max, 
  className = '', 
  showPercentage = false 
}) => {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={clsx('w-full', className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          Step {value} of {max}
        </span>
        {showPercentage && (
          <span className="text-sm text-gray-500">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
