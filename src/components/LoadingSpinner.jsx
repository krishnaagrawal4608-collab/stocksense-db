import React from 'react';
import { Database } from 'lucide-react';

export default function LoadingSpinner({ message = 'Querying Relational Database...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Database className="w-5 h-5 text-blue-600 animate-pulse" />
        </div>
      </div>
      <p className="mt-4 text-xs font-medium text-slate-500 font-mono tracking-wide">{message}</p>
    </div>
  );
}
