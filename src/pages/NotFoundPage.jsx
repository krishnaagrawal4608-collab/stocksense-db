import React from 'react';
import { Link } from 'react-router-dom';
import { Database, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-center text-white">
      <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 mb-4">
        <Database className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight">404 — Tuple Not Found</h1>
      <p className="text-xs text-slate-400 max-w-sm mt-2 font-mono">
        The requested relational route does not exist in the StockSense DB application schema.
      </p>
      <Link
        to="/dashboard"
        className="mt-6 inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
}
