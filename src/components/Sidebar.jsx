import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { seedCurrentAccount } from '../lib/databaseService';
import SupabaseConfigModal from './SupabaseConfigModal';
import {
  LayoutDashboard,
  Boxes,
  Layers,
  Truck,
  ArrowLeftRight,
  BarChart3,
  Settings,
  LogOut,
  Package,
  Sparkles,
  Database
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user, profile, signOut, isSupabaseConfigured } = useAuth();
  const navigate = useNavigate();
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);

  // Professional 8-item SaaS navigation list per requirements:
  // Overview, Products, Categories, Suppliers, Stock Transactions, Reports, Settings, Logout
  const navItems = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Products', path: '/products', icon: Boxes },
    { name: 'Categories', path: '/categories', icon: Layers },
    { name: 'Suppliers', path: '/suppliers', icon: Truck },
    { name: 'Stock Transactions', path: '/transactions', icon: ArrowLeftRight },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  async function handleSeedData() {
    if (!window.confirm('Seed database with sample inventory catalog and transaction history?')) return;
    setSeeding(true);
    try {
      const res = await seedCurrentAccount(user?.id);
      alert(res.message);
      window.location.reload();
    } catch (err) {
      alert('Error seeding: ' + err.message);
    } finally {
      setSeeding(false);
    }
  }

  async function handleLogout() {
    await signOut();
    navigate('/login');
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-40 w-64 bg-navy-950 text-slate-300 flex flex-col border-r border-slate-800
        transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800/80 bg-navy-900/60">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <Package className="w-4 h-4" />
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="text-base font-bold text-white tracking-tight">StockSense</span>
              <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-blue-600 text-white font-mono">DB</span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) => `
                  group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all
                  ${isActive 
                    ? 'bg-blue-600 text-white font-semibold shadow-sm' 
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}
                `}
              >
                {({ isActive }) => (
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                    <span>{item.name}</span>
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Database Status & Utilities */}
        <div className="p-3 border-t border-slate-800/80 bg-navy-900/40 space-y-2">
          {/* Subtle Database Status Pill */}
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px]">
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-400' : 'bg-blue-400'}`} />
              <span className="text-slate-300 font-medium truncate max-w-[110px]">
                {isSupabaseConfigured ? 'Supabase DB' : 'Local DB Engine'}
              </span>
            </div>
            <button
              onClick={() => setConfigModalOpen(true)}
              className="text-[10px] text-blue-400 hover:text-blue-300 hover:underline"
            >
              Config
            </button>
          </div>

          <button
            onClick={handleSeedData}
            disabled={seeding}
            className="w-full flex items-center justify-center space-x-1.5 px-3 py-1.5 text-[11px] font-medium rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800 transition-colors"
            title="Seed sample products and transactions"
          >
            <Sparkles className={`w-3 h-3 text-slate-400 ${seeding ? 'animate-spin' : ''}`} />
            <span>{seeding ? 'Seeding Data...' : 'Seed Sample Catalog'}</span>
          </button>
        </div>

        {/* User Footer Profile & Logout */}
        <div className="p-3 border-t border-slate-800 bg-navy-900/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                {(profile?.full_name || user?.email || 'U')[0].toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-medium text-slate-200 truncate">
                  {profile?.full_name || 'Inventory Manager'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {user?.email || 'authenticated'}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      <SupabaseConfigModal
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
      />
    </>
  );
}
