import React, { useState } from 'react';
import Modal from './Modal';
import { 
  SUPABASE_URL, 
  SUPABASE_ANON_KEY, 
  isSupabaseConfigured, 
  testConnection, 
  saveCustomSupabaseConfig, 
  resetSupabaseConfig 
} from '../lib/supabase';
import { Database, CheckCircle2, XCircle, ExternalLink, RefreshCw } from 'lucide-react';

export default function SupabaseConfigModal({ isOpen, onClose }) {
  const [url, setUrl] = useState(SUPABASE_URL || '');
  const [key, setKey] = useState(SUPABASE_ANON_KEY || '');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  async function handleTest() {
    setTesting(true);
    setTestResult(null);
    const res = await testConnection(url, key);
    setTestResult(res);
    setTesting(false);
  }

  function handleSave(e) {
    e.preventDefault();
    if (!url.trim() || !key.trim()) {
      alert('Please enter both Supabase URL and Anon Key.');
      return;
    }
    saveCustomSupabaseConfig(url, key);
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Supabase PostgreSQL Database Settings"
      subtitle="Connect StockSense DB to your live Supabase cloud database instance"
      maxWidth="max-w-xl"
    >
      <div className="space-y-5">
        <div className={`p-4 rounded-xl border flex items-start space-x-3 ${
          isSupabaseConfigured 
            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' 
            : 'bg-amber-50/70 border-amber-200 text-amber-900'
        }`}>
          <Database className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isSupabaseConfigured ? 'text-emerald-600' : 'text-amber-600'}`} />
          <div className="text-xs">
            <p className="font-semibold">
              {isSupabaseConfigured ? 'Live Supabase Cloud Connected' : 'Running in Offline / Academic Demo Mode'}
            </p>
            <p className="mt-1 text-slate-600 leading-relaxed">
              {isSupabaseConfigured
                ? 'Your application is sending real queries to PostgreSQL on Supabase with Row Level Security.'
                : 'You can test all relational features, charts, and SQL Lab immediately in demo mode, or connect your free Supabase PostgreSQL project below.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Project URL (<code className="text-blue-600 font-mono">https://xyz.supabase.co</code>)
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-project-ref.supabase.co"
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Project Anon / Public API Key
            </label>
            <textarea
              rows={3}
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Found in Supabase Dashboard &gt; Project Settings &gt; API &gt; anon public key.
            </p>
          </div>

          {testResult && (
            <div className={`p-3 rounded-lg text-xs flex items-center space-x-2 ${
              testResult.success ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}>
              {testResult.success ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <XCircle className="w-4 h-4 flex-shrink-0" />}
              <span>{testResult.message}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleTest}
                disabled={testing}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center space-x-1 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                <span>{testing ? 'Testing...' : 'Test Connection'}</span>
              </button>

              <button
                type="button"
                onClick={resetSupabaseConfig}
                className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 hover:underline"
              >
                Reset
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
              >
                Save &amp; Reload
              </button>
            </div>
          </div>
        </form>

        <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1.5 bg-slate-50 p-3 rounded-lg">
          <p className="font-semibold text-slate-700 flex items-center justify-between">
            <span>First time setting up Supabase?</span>
            <a 
              href="https://supabase.com/dashboard" 
              target="_blank" 
              rel="noreferrer"
              className="text-blue-600 hover:underline inline-flex items-center space-x-1"
            >
              <span>Supabase Console</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </p>
          <p className="text-[11px] text-slate-500">
            1. Create a free project at supabase.com.<br />
            2. Open SQL Editor and paste the contents of <code className="font-mono text-slate-700 font-bold">supabase/migrations/01_initial_schema.sql</code>.<br />
            3. Paste your Project URL and Anon API key above.
          </p>
        </div>
      </div>
    </Modal>
  );
}
