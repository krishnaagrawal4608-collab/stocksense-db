import React, { useState } from 'react';
import { Menu, Database, Plus, ArrowLeftRight, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SupabaseConfigModal from './SupabaseConfigModal';

export default function Header({ onMenuClick, onQuickAddProduct, onQuickMovement }) {
  const { isSupabaseConfigured } = useAuth();
  const [configModalOpen, setConfigModalOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center space-x-2 text-xs">
          <span className="font-semibold text-slate-900">StockSense DB</span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-500">Inventory Workspace</span>
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Database Connection Pill */}
        <button
          onClick={() => setConfigModalOpen(true)}
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
            isSupabaseConfigured
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
          }`}
          title="Click to view database connection details"
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500' : 'bg-blue-500'}`} />
          <Database className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">
            {isSupabaseConfigured ? 'Supabase Connected' : 'Database Ready'}
          </span>
        </button>

        {/* Quick Action: Stock Movement */}
        {onQuickMovement && (
          <button
            onClick={onQuickMovement}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors shadow-sm"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden md:inline">Record Movement</span>
          </button>
        )}

        {/* Quick Action: Add Product */}
        {onQuickAddProduct && (
          <button
            onClick={onQuickAddProduct}
            className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm shadow-blue-500/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </button>
        )}
      </div>

      <SupabaseConfigModal
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
      />
    </header>
  );
}
