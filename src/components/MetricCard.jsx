import React, { useState } from 'react';
import { Database, Eye } from 'lucide-react';
import SqlCodeViewer from './SqlCodeViewer';

export default function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  colorScheme = 'blue',
  sqlQuery,
  sqlExplanation
}) {
  const [showSql, setShowSql] = useState(false);

  const colors = {
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-100',
      badge: 'bg-blue-100 text-blue-700'
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'border-emerald-100',
      badge: 'bg-emerald-100 text-emerald-700'
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-100',
      badge: 'bg-amber-100 text-amber-700'
    },
    rose: {
      bg: 'bg-rose-50',
      text: 'text-rose-600',
      border: 'border-rose-100',
      badge: 'bg-rose-100 text-rose-700'
    },
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      border: 'border-indigo-100',
      badge: 'bg-indigo-100 text-indigo-700'
    },
    teal: {
      bg: 'bg-teal-50',
      text: 'text-teal-600',
      border: 'border-teal-100',
      badge: 'bg-teal-100 text-teal-700'
    }
  }[colorScheme] || {
    bg: 'bg-slate-50',
    text: 'text-slate-600',
    border: 'border-slate-100',
    badge: 'bg-slate-100 text-slate-700'
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${colors.bg} ${colors.text} ${colors.border} border`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        {trend ? (
          <span className="text-xs font-medium text-emerald-600 flex items-center">
            {trend}
          </span>
        ) : (
          <span className="text-[11px] text-slate-400 font-mono">DBMS Metric</span>
        )}

        {sqlQuery && (
          <button
            onClick={() => setShowSql(!showSql)}
            className="text-[11px] font-medium text-blue-600 hover:text-blue-800 flex items-center space-x-1 py-0.5 px-1.5 rounded hover:bg-blue-50 transition-colors"
            title="Inspect SQL Query"
          >
            <Database className="w-3 h-3" />
            <span>{showSql ? 'Hide SQL' : 'View SQL'}</span>
          </button>
        )}
      </div>

      {showSql && sqlQuery && (
        <SqlCodeViewer 
          sql={sqlQuery} 
          explanation={sqlExplanation} 
          defaultExpanded={true} 
        />
      )}
    </div>
  );
}
