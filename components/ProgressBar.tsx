
import React from 'react';

interface ProgressBarProps {
  percentage: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ percentage }) => {
  const safePercentage = Math.min(100, Math.max(0, percentage));

  return (
    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
      <div
        className="bg-gradient-to-r from-[#A8F1D6] to-[#A3DFFF] h-4 rounded-full transition-all duration-700 ease-out"
        style={{ width: `${safePercentage}%` }}
      ></div>
    </div>
  );
};
