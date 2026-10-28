import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ size = 'md', message = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 text-blue-600">
      <Loader2 className={`${sizeClasses[size] || sizeClasses.md} animate-spin text-blue-600`} />
      {message && <p className="mt-3 text-sm font-medium text-slate-600">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;