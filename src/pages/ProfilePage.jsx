import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, ShieldCheck, Mail, Key, Calendar, Database, CheckCircle2, Server } from 'lucide-react';
import SqlCodeViewer from '../components/SqlCodeViewer';

export default function ProfilePage() {
  const { user, profile, updateProfileData, isSupabaseConfigured, isDemoMode } = useAuth();

  const [fullName, setFullName] = useState(profile?.full_name || user?.user_metadata?.full_name || '');
  const [role, setRole] = useState(profile?.role || 'inventory_manager');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

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

  const profileSqlQuery = `SELECT 
    p.id, 
    p.full_name, 
    p.email, 
    p.role, 
    p.created_at
FROM profiles p
WHERE p.id = auth.uid();`;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Profile &amp; Database Identity</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your user profile record mapped 1:1 to PostgreSQL <code className="text-blue-600 font-mono">profiles</code> table.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-400 text-white font-bold text-3xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4">
              {(fullName || user?.email || 'U')[0].toUpperCase()}
            </div>
            <h3 className="text-lg font-bold text-slate-900">{fullName || 'Inventory Manager'}</h3>
            <p className="text-xs text-slate-500 font-mono">{user?.email}</p>

            <div className="mt-3 inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200 uppercase tracking-wide">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{role.replace('_', ' ')}</span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center space-x-1.5">
                <Key className="w-3.5 h-3.5 text-slate-400" />
                <span>PostgreSQL User UUID</span>
              </span>
              <span className="font-mono text-[11px] text-slate-700 truncate max-w-[140px]" title={user?.id}>
                {user?.id ? `${user.id.slice(0, 12)}...` : 'demo-uuid'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center space-x-1.5">
                <Server className="w-3.5 h-3.5 text-slate-400" />
                <span>Database Engine</span>
              </span>
              <span className="font-semibold text-slate-700">
                {isSupabaseConfigured ? 'Supabase Cloud (RLS)' : 'Local 3NF Engine'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Account Created</span>
              </span>
              <span className="text-slate-700">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active Session'}
              </span>
            </div>
          </div>
        </div>

        {/* Edit Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-1">Update Profile Information</h3>
            <p className="text-xs text-slate-500 mb-6">
              Updates record in the PostgreSQL <code className="font-mono text-blue-600">public.profiles</code> table.
            </p>

            {success && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-100 text-emerald-800 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Profile updated successfully in the relational database!</span>
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
                  Email Address (Primary Key Link)
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-100 text-slate-500 font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Email is immutable for referential integrity across relational audit logs.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assigned DBMS Role (CHECK Constraint)
                </label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="inventory_manager">Inventory Manager (Read/Write Catalog &amp; Movements)</option>
                  <option value="admin">System Administrator (Full DDL/DML Privileges)</option>
                  <option value="warehouse_staff">Warehouse Staff (Transactions &amp; Picking)</option>
                  <option value="viewer">Auditor / Viewer (Read-Only SELECT Access)</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
                >
                  {saving ? 'Updating Database...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>

          <SqlCodeViewer 
            sql={profileSqlQuery}
            title="Profile Isolation Query (Row Level Security)"
            explanation="PostgreSQL RLS ensures this query only returns the authenticated user's own profile tuple via auth.uid() = profiles.id."
            defaultExpanded={true}
          />
        </div>
      </div>
    </div>
  );
}
