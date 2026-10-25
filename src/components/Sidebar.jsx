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
  Terminal,
  Database,
  BarChart3,
  UserCheck,
  LogOut,
  Sparkles,
  Server,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user, profile, signOut, isDemoMode, isSupabaseConfigured } = useAuth();
  const navigate = useNavigate();
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Products', path: '/products', icon: Boxes },
    { name: 'Categories', path: '/categories', icon: Layers },
    { name: 'Suppliers', path: '/suppliers', icon: Truck },
    { name: 'Stock Transactions', path: '/transactions', icon: ArrowLeftRight },
    { 
      name: 'SQL Lab', 
      path: '/sql-lab', 
      icon: Terminal, 
      highlight: true, 
      badge: 'DBMS Core' 
    },
    { 
      name: 'Database Explorer & ERD', 
      path: '/database-explorer', 
      icon: Database,
      badge: '3NF Schema' 
    },
    { name: 'Reports & Analytics', path: '/reports', icon: BarChart3 },
    { name: 'User Profile', path: '/profile', icon: UserCheck }
  ];

  async function handleSeedData() {
    if (!window.confirm('Seed database with realistic electronics, tools, and office inventory records?')) return;
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
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-40 w-64 bg-navy-950 text-slate-300 flex flex-col border-r border-slate-800
        transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800/80 bg-navy-900/50">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-400 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-base font-extrabold text-white tracking-tight">StockSense</span>
                <span className="text-xs font-black px-1.5 py-0.5 rounded bg-blue-600 text-white font-mono">DB</span>
              </div>
              <p className="text-[10px] text-teal-400 font-medium tracking-wide">SQL &amp; DBMS System</p>
            </div>
          </div>
        </div>

        {/* Database Status Widget */}
        <div className="px-4 py-3 mx-3 my-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
              <Server className="w-3 h-3 text-blue-400" />
              <span>Database Engine</span>
            </span>
            <button
              onClick={() => setConfigModalOpen(true)}
              className="text-[10px] text-blue-400 hover:text-blue-300 hover:underline"
            >
              Config
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-teal-400'}`}></span>
              <span className="font-semibold text-slate-200">
                {isSupabaseConfigured ? 'Supabase PostgreSQL' : 'Local 3NF Engine'}
              </span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
              {isSupabaseConfigured ? 'RLS Active' : 'Demo'}
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
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
                  group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold' 
                    : item.highlight 
                      ? 'text-teal-300 hover:bg-slate-900 hover:text-white bg-slate-900/40 border border-teal-500/20' 
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}
                `}
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : item.highlight ? 'text-teal-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                      <span>{item.name}</span>
                    </div>

                    {item.badge && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                        isActive 
                          ? 'bg-blue-700 text-blue-100' 
                          : item.highlight 
                            ? 'bg-teal-950 text-teal-300 border border-teal-800' 
                            : 'bg-slate-800 text-slate-400'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Database Quick Actions */}
        <div className="p-3 border-t border-slate-800/80 bg-navy-900/30 space-y-2">
          <button
            onClick={handleSeedData}
            disabled={seeding}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-xs font-semibold rounded-lg bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/30 transition-colors"
            title="Seed sample products, categories, suppliers and transactions"
          >
            <Sparkles className={`w-3.5 h-3.5 text-teal-400 ${seeding ? 'animate-spin' : ''}`} />
            <span>{seeding ? 'Seeding Relational DB...' : 'Seed Sample Database'}</span>
          </button>
        </div>

        {/* User Footer Profile */}
        <div className="p-3 border-t border-slate-800 bg-navy-900/70">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                {(profile?.full_name || user?.email || 'U')[0].toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-medium text-slate-200 truncate">
                  {profile?.full_name || 'Inventory Manager'}
                </p>
                <p className="text-[10px] text-slate-400 truncate font-mono">
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
