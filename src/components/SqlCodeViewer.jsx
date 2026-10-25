import React, { useState } from 'react';
import { Code2, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';

export default function SqlCodeViewer({ sql, title = 'Underlying SQL Query', explanation, defaultExpanded = false }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mt-2 border border-slate-200 rounded-lg overflow-hidden bg-slate-900 text-slate-100 text-xs shadow-sm">
      <div 
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between px-3 py-2 bg-slate-800 cursor-pointer hover:bg-slate-750 select-none border-b border-slate-700"
      >
        <div className="flex items-center space-x-2">
          <Code2 className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-semibold text-slate-200 tracking-wide">{title}</span>
          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50">
            DBMS Viva Query
          </span>
        </div>
        <div className="flex items-center space-x-2 text-slate-400">
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </div>

      {expanded && (
        <div className="p-3 relative">
          <button
            onClick={handleCopy}
            className="absolute top-2.5 right-2.5 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center space-x-1 border border-slate-700"
            title="Copy SQL"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          
          <pre className="font-mono text-[11px] leading-relaxed text-blue-200 overflow-x-auto pr-16 py-1">
            <code>{sql.trim()}</code>
          </pre>

          {explanation && (
            <p className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400 italic">
              <strong>DBMS Concept:</strong> {explanation}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
