import React, { useState, useEffect } from 'react';
import {
  SQL_CATEGORIES,
  PRESET_QUERIES,
  executeSafeQuery
} from '../lib/sqlLabService';
import {
  Terminal,
  Play,
  RotateCcw,
  Trash2,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Database,
  Layers,
  BookOpen,
  HelpCircle,
  Clock,
  Table
} from 'lucide-react';

export default function SqlLabPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedQueryId, setSelectedQueryId] = useState(PRESET_QUERIES[0].id);
  const [sqlCode, setSqlCode] = useState(PRESET_QUERIES[0].sql);

  // Execution states
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  // Active preset details
  const activePreset = PRESET_QUERIES.find(p => p.id === selectedQueryId) || PRESET_QUERIES[0];

  // Run initial query on mount
  useEffect(() => {
    runQuery(PRESET_QUERIES[0].sql);
  }, []);

  function handleSelectPreset(preset) {
    setSelectedQueryId(preset.id);
    setSqlCode(preset.sql);
    runQuery(preset.sql);
  }

  async function runQuery(customSql = sqlCode) {
    setExecuting(true);
    setResult(null);
    try {
      const res = await executeSafeQuery(customSql);
      setResult(res);
    } catch (e) {
      setResult({
        success: false,
        error: e.message || 'An unexpected error occurred during SQL parsing.',
        executionTimeMs: 0
      });
    } finally {
      setExecuting(false);
    }
  }

  function handleReset() {
    if (activePreset) {
      setSqlCode(activePreset.sql);
      runQuery(activePreset.sql);
    }
  }

  function handleClear() {
    setSqlCode('');
    setResult(null);
  }

  function handleCopy() {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const filteredPresets = selectedCategory === 'all' 
    ? PRESET_QUERIES 
    : PRESET_QUERIES.filter(p => p.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900 text-white p-5 rounded-2xl shadow-lg border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-blue-600 text-white">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Interactive SQL Lab &amp; DBMS Sandbox</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Execute live relational SQL queries with execution metrics, schema isolation, and concept breakdowns for college viva.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="font-mono px-2.5 py-1 rounded bg-slate-800 text-teal-400 border border-slate-700">
            PostgreSQL 15 Dialect
          </span>
          <span className="font-mono px-2.5 py-1 rounded bg-slate-800 text-blue-400 border border-slate-700">
            Read-Only Sandbox
          </span>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-thin">
        {SQL_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === cat.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main SQL Console Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Preset Queries Library (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col h-[680px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-1.5">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Curated SQL Library</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              {filteredPresets.length} Queries
            </span>
          </div>

          <div className="mt-3 flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredPresets.map(preset => {
              const isSelected = preset.id === selectedQueryId;
              return (
                <div
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-400 shadow-sm ring-1 ring-blue-400/20'
                      : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-100/60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <h4 className={`text-xs font-bold leading-snug ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                      {preset.title}
                    </h4>
                    <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-500 font-semibold flex-shrink-0 ml-2">
                      {preset.category}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    {preset.concept}
                  </p>

                  <div className="mt-2 flex items-center space-x-1.5 text-[10px] text-slate-400 font-mono">
                    <Table className="w-3 h-3 text-slate-400" />
                    <span>{preset.tables.join(', ')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Interactive Editor & Live Results (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* SQL Editor Card */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col">
            {/* Editor Toolbar */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                <span className="text-xs font-mono text-slate-300 ml-2 font-semibold">sql_editor.sql</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs flex items-center space-x-1"
                  title="Copy SQL"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="text-[11px] hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={handleReset}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs flex items-center space-x-1"
                  title="Reset to Template"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="text-[11px] hidden sm:inline">Reset</span>
                </button>

                <button
                  onClick={handleClear}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 text-xs flex items-center space-x-1"
                  title="Clear Editor"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="text-[11px] hidden sm:inline">Clear</span>
                </button>

                <button
                  onClick={() => runQuery()}
                  disabled={executing || !sqlCode.trim()}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-md shadow-blue-600/30 transition-all disabled:opacity-50"
                >
                  <Play className={`w-3.5 h-3.5 fill-current ${executing ? 'animate-spin' : ''}`} />
                  <span>{executing ? 'Running...' : 'Run Query (F5)'}</span>
                </button>
              </div>
            </div>

            {/* Editable Textarea with Mono Font */}
            <div className="relative p-4 bg-slate-950 min-h-[180px]">
              <textarea
                value={sqlCode}
                onChange={e => setSqlCode(e.target.value)}
                placeholder="Write or paste your SELECT query here..."
                rows={7}
                spellCheck={false}
                className="w-full bg-transparent text-xs font-mono text-blue-200 focus:outline-none resize-none leading-relaxed selection:bg-blue-800 selection:text-white"
              />
            </div>

            {/* Explanation Drawer */}
            {activePreset && (
              <div className="px-4 py-3 bg-slate-900/90 border-t border-slate-800 text-xs space-y-1.5 text-slate-300">
                <div className="flex items-center space-x-2">
                  <span className="text-teal-400 font-bold uppercase tracking-wider text-[10px]">DBMS Concept:</span>
                  <span className="font-semibold text-white">{activePreset.concept}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {activePreset.explanation}
                </p>
              </div>
            )}
          </div>

          {/* Execution Results View */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[300px] flex flex-col">
            {/* Results Header Status */}
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <Table className="w-4 h-4 text-slate-600" />
                <span className="font-bold text-slate-800">Query Result Set</span>
              </div>

              {result && (
                <div className="flex items-center space-x-3 text-[11px] font-mono">
                  {result.success ? (
                    <>
                      <span className="text-emerald-600 font-semibold flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Execution Success</span>
                      </span>
                      <span className="text-slate-400">&bull;</span>
                      <span className="text-slate-600 font-semibold">
                        {result.rowCount} {result.rowCount === 1 ? 'row' : 'rows'}
                      </span>
                      <span className="text-slate-400">&bull;</span>
                      <span className="text-slate-500 flex items-center space-x-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{result.executionTimeMs} ms</span>
                      </span>
                    </>
                  ) : (
                    <span className="text-rose-600 font-semibold flex items-center space-x-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Execution Error</span>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Results Content */}
            <div className="flex-1 overflow-x-auto p-0">
              {executing ? (
                <div className="py-16 text-center">
                  <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-mono">Executing query against relational dataset...</p>
                </div>
              ) : !result ? (
                <div className="py-16 text-center text-slate-400 text-xs">
                  Click <strong className="text-blue-600 font-semibold">Run Query</strong> to execute the SQL statement and inspect returned tuples.
                </div>
              ) : !result.success ? (
                <div className="p-6">
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-mono flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-rose-900">Database Engine Error:</p>
                      <p className="mt-1 leading-relaxed">{result.error}</p>
                    </div>
                  </div>
                </div>
              ) : result.rows?.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-xs">
                  Query succeeded (0 rows returned matching the predicate).
                </div>
              ) : (
                <table className="min-w-full divide-y divide-slate-200 text-left text-xs font-mono">
                  <thead className="bg-slate-50 text-slate-600 font-semibold">
                    <tr>
                      {result.columns.map((col, idx) => (
                        <th key={idx} className="px-4 py-2.5 whitespace-nowrap bg-slate-100/70 border-b border-slate-200">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {result.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50 transition-colors">
                        {result.columns.map((col, cIdx) => (
                          <td key={cIdx} className="px-4 py-2 whitespace-nowrap text-slate-700">
                            {row[col] !== null && row[col] !== undefined ? String(row[col]) : <span className="text-slate-300 italic">NULL</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Educational viva note */}
            <div className="px-4 py-2 bg-slate-50/70 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
              <span>Security Rule: Execution is strictly sandboxed. Multiple statements and destructive DDL are blocked.</span>
              <span className="font-mono">SQL Lab v1.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
