import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="w-6 h-6 text-blue-600 animate-spin mr-2" />
      <span className="text-gray-600">{message}</span>
    </div>
  );
}