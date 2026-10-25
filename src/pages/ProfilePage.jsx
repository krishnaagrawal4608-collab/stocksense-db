import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  User,
  ShieldCheck,
  Mail,
  Key,
  Calendar,
  Database,
  CheckCircle2,
  Server,
  Terminal,
  ExternalLink,
  Settings as SettingsIcon,
  Sliders
} from 'lucide-react';
import SupabaseConfigModal from '../components/SupabaseConfigModal';

export default function ProfilePage() {
  const { user, profile, updateProfileData, isSupabaseConfigured } = useAuth();

  const [fullName, setFullName] = useState(profile?.full_name || user?.user_metadata?.full_name || '');
  const [role, setRole] = useState(profile?.role || 'inventory_manager');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      await updateProfileData({ fullName, role });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert('Error updating profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Account &amp; System Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your account profile, role permissions, and database connection.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-blue-600 text-white font-bold text-2xl flex items-center justify-center shadow-sm mb-3">
                {(fullName || user?.email || 'U')[0].toUpperCase()}
              </div>
              <h3 className="text-base font-bold text-slate-900">{fullName || 'Inventory Manager'}</h3>
              <p className="text-xs text-slate-500">{user?.email}</p>

              <div className="mt-3 inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="capitalize">{role.replace('_', ' ')}</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center space-x-1.5">
                  <Key className="w-3.5 h-3.5 text-slate-400" />
                  <span>Account ID</span>
                </span>
                <span className="font-mono text-[11px] text-slate-700 truncate max-w-[120px]" title={user?.id}>
                  {user?.id ? `${user.id.slice(0, 10)}...` : 'demo-user'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center space-x-1.5">
                  <Server className="w-3.5 h-3.5 text-slate-400" />
                  <span>Database State</span>
                </span>
                <span className={`font-semibold ${isSupabaseConfigured ? 'text-emerald-600' : 'text-slate-700'}`}>
                  {isSupabaseConfigured ? 'Supabase Connected' : 'Local DB Engine'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Member Since</span>
                </span>
                <span className="text-slate-700">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={() => setConfigModalOpen(true)}
              className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
            >
              <Database className="w-3.5 h-3.5 text-blue-600" />
              <span>Database Connection Settings</span>
            </button>
          </div>
        </div>

        {/* Edit Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Profile Details</h3>
            <p className="text-xs text-slate-500 mb-5">
              Update your personal identification and inventory role.
            </p>

            {success && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Profile updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-500 font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Account email address used for login and notifications.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assigned Operational Role
                </label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="inventory_manager">Inventory Manager (Full Catalog &amp; Transactions)</option>
                  <option value="admin">System Administrator (Catalog, Settings &amp; Full Access)</option>
                  <option value="warehouse_staff">Warehouse Staff (Stock In / Stock Out Movements)</option>
                  <option value="viewer">Auditor / Read-Only Viewer</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Academic Evaluation / Developer Tools Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900">Developer &amp; Database Tools</h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                DBMS Subject Evaluation
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Dedicated tools for college viva demonstration, SQL execution testing, and schema exploration.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                to="/sql-lab"
                className="p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 transition-all flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-blue-600" />
                  <div>
                    <span className="font-semibold text-slate-900 block">Interactive SQL Lab</span>
                    <span className="text-[10px] text-slate-500">Run queries &amp; check latency</span>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              <Link
                to="/database-explorer"
                className="p-3 rounded-lg border border-slate-200 hover:border-teal-300 hover:bg-teal-50/40 transition-all flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-2">
                  <Database className="w-4 h-4 text-teal-600" />
                  <div>
                    <span className="font-semibold text-slate-900 block">Database Explorer &amp; ERD</span>
                    <span className="text-[10px] text-slate-500">Visual 3NF schema &amp; dictionary</span>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <SupabaseConfigModal
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
      />
    </div>
  );
}
