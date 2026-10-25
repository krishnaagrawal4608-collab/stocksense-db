import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Database,
  Terminal,
  Layers,
  ShieldCheck,
  Zap,
  BarChart3,
  Boxes,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Lock,
  GitBranch,
  RefreshCw,
  Server
} from 'lucide-react';

export default function LandingPage() {
  const { user, enterDemoMode } = useAuth();
  const navigate = useNavigate();

  function handleDemoAccess() {
    enterDemoMode();
    navigate('/dashboard');
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-950/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-400 flex items-center justify-center shadow-lg shadow-blue-500/30 text-white font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-lg font-black text-white tracking-tight">StockSense</span>
                <span className="text-xs font-black px-1.5 py-0.5 rounded bg-blue-600 text-white font-mono">DB</span>
              </div>
              <span className="text-[10px] text-teal-400 font-mono tracking-wider uppercase block">DBMS Academic System</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-xs font-medium text-slate-300">
            <a href="#features" className="hover:text-blue-400 transition-colors">Features</a>
            <a href="#schema" className="hover:text-blue-400 transition-colors">3NF Relational Model</a>
            <a href="#sql-lab" className="hover:text-blue-400 transition-colors">Interactive SQL Lab</a>
            <a href="#architecture" className="hover:text-blue-400 transition-colors">Architecture</a>
          </nav>

          <div className="flex items-center space-x-3">
            {user ? (
              <Link
                to="/dashboard"
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 transition-all flex items-center space-x-1"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <button
                  onClick={handleDemoAccess}
                  className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-teal-300 hover:text-white bg-teal-950/60 border border-teal-800/80 rounded-lg transition-colors"
                >
                  <Zap className="w-3.5 h-3.5 text-teal-400" />
                  <span>Instant Viva Demo</span>
                </button>
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 transition-all"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[250px] bg-teal-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-blue-300 mb-6 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-teal-400 animate-pulse"></span>
            <span className="font-medium">College DBMS Subject Project &amp; Viva Demonstration</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400 font-mono">PostgreSQL 15+ &amp; Supabase</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-tight">
            SQL-Powered <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-teal-300 bg-clip-text text-transparent">Inventory Management</span> &amp; Relational Engine
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            A production-grade web application built from the ground up to demonstrate 
            <strong className="text-white font-semibold"> 3NF Normalization</strong>, 
            <strong className="text-white font-semibold"> ACID Transactions</strong>, 
            <strong className="text-white font-semibold"> Row Level Security (RLS)</strong>, and 
            <strong className="text-white font-semibold"> Complex SQL Queries</strong>.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={handleDemoAccess}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 flex items-center space-x-2 transition-all transform hover:-translate-y-0.5"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Launch Live Viva Demo</span>
            </button>

            <Link
              to="/register"
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 flex items-center space-x-2 transition-all"
            >
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              to="/sql-lab"
              onClick={enterDemoMode}
              className="px-6 py-3 rounded-xl bg-teal-950/60 hover:bg-teal-900/60 text-teal-300 font-semibold text-sm border border-teal-700/60 flex items-center space-x-2 transition-all"
            >
              <Terminal className="w-4 h-4" />
              <span>Open SQL Lab</span>
            </Link>
          </div>

          {/* Interactive Feature Pills */}
          <div className="mt-12 flex flex-wrap justify-center gap-3 text-xs text-slate-400">
            <span className="px-3 py-1 rounded-full bg-slate-800/60 border border-slate-700/60 flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Third Normal Form (3NF)</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-800/60 border border-slate-700/60 flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Foreign Key Cascades &amp; Restricts</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-800/60 border border-slate-700/60 flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>ACID Row Locking (`FOR UPDATE`)</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-800/60 border border-slate-700/60 flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Database Views &amp; Triggers</span>
            </span>
          </div>
        </div>
      </section>

      {/* Database Schema Visualizer Section */}
      <section id="schema" className="py-16 bg-slate-950 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-wider font-bold text-teal-400 font-mono">Normalized Relational Model</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-2">
              Designed Strictly in 3rd Normal Form (3NF)
            </h2>
            <p className="mt-3 text-sm text-slate-400">
              Eliminates insertion, update, and deletion anomalies. Every non-key attribute depends strictly on the primary key, the whole key, and nothing but the key.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Table 1: Profiles */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-lg hover:border-blue-500/50 transition-all">
              <div className="flex items-center space-x-2 text-blue-400 mb-2 pb-2 border-b border-slate-800">
                <Database className="w-4 h-4" />
                <span className="font-mono font-bold text-xs">profiles</span>
              </div>
              <ul className="space-y-1.5 text-[11px] font-mono text-slate-400">
                <li className="text-amber-400 font-semibold">🔑 id (UUID, PK)</li>
                <li>full_name (TEXT)</li>
                <li>email (TEXT)</li>
                <li>role (CHECK)</li>
                <li>created_at</li>
              </ul>
              <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-slate-500">
                Auth linkage 1:1
              </div>
            </div>

            {/* Table 2: Categories */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-lg hover:border-teal-500/50 transition-all">
              <div className="flex items-center space-x-2 text-teal-400 mb-2 pb-2 border-b border-slate-800">
                <Layers className="w-4 h-4" />
                <span className="font-mono font-bold text-xs">categories</span>
              </div>
              <ul className="space-y-1.5 text-[11px] font-mono text-slate-400">
                <li className="text-amber-400 font-semibold">🔑 id (UUID, PK)</li>
                <li className="text-indigo-400">🔗 user_id (FK)</li>
                <li>name (UNIQUE)</li>
                <li>code (UNIQUE)</li>
                <li>description</li>
              </ul>
              <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-slate-500">
                1 Category : N Products
              </div>
            </div>

            {/* Table 3: Suppliers */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-lg hover:border-indigo-500/50 transition-all">
              <div className="flex items-center space-x-2 text-indigo-400 mb-2 pb-2 border-b border-slate-800">
                <GitBranch className="w-4 h-4" />
                <span className="font-mono font-bold text-xs">suppliers</span>
              </div>
              <ul className="space-y-1.5 text-[11px] font-mono text-slate-400">
                <li className="text-amber-400 font-semibold">🔑 id (UUID, PK)</li>
                <li className="text-indigo-400">🔗 user_id (FK)</li>
                <li>name (UNIQUE)</li>
                <li>contact_person</li>
                <li>phone, email, city</li>
              </ul>
              <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-slate-500">
                1 Supplier : N Products
              </div>
            </div>

            {/* Table 4: Products */}
            <div className="bg-slate-900 rounded-xl border border-blue-500/40 p-4 shadow-lg ring-1 ring-blue-500/20">
              <div className="flex items-center space-x-2 text-blue-400 mb-2 pb-2 border-b border-slate-800">
                <Boxes className="w-4 h-4" />
                <span className="font-mono font-bold text-xs">products</span>
              </div>
              <ul className="space-y-1.5 text-[11px] font-mono text-slate-400">
                <li className="text-amber-400 font-semibold">🔑 id (UUID, PK)</li>
                <li className="text-indigo-400">🔗 category_id (FK)</li>
                <li className="text-indigo-400">🔗 supplier_id (FK)</li>
                <li>sku (UNIQUE)</li>
                <li>unit_price (&gt;= 0)</li>
                <li>current_stock (&gt;= 0)</li>
                <li>reorder_level</li>
              </ul>
              <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-blue-400 font-semibold">
                Central Master Entity
              </div>
            </div>

            {/* Table 5: Inventory Transactions */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-lg hover:border-emerald-500/50 transition-all">
              <div className="flex items-center space-x-2 text-emerald-400 mb-2 pb-2 border-b border-slate-800">
                <RefreshCw className="w-4 h-4" />
                <span className="font-mono font-bold text-xs">transactions</span>
              </div>
              <ul className="space-y-1.5 text-[11px] font-mono text-slate-400">
                <li className="text-amber-400 font-semibold">🔑 id (UUID, PK)</li>
                <li className="text-indigo-400">🔗 product_id (FK)</li>
                <li>type (CHECK)</li>
                <li>quantity (&gt; 0)</li>
                <li>previous_stock</li>
                <li>new_stock</li>
                <li>transaction_date</li>
              </ul>
              <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-slate-500">
                Immutable Ledger
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SQL Lab & DBMS Capabilities Highlight */}
      <section id="sql-lab" className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-blue-400 font-mono">Viva Ready Showcase</span>
              <h2 className="text-3xl font-extrabold text-white mt-2 leading-tight">
                Integrated SQL Lab with 20+ Curated Queries
              </h2>
              <p className="mt-4 text-sm text-slate-300 leading-relaxed">
                Demonstrate SQL concepts live during evaluation. Every query runs with measured execution latency against actual relational data:
              </p>

              <div className="mt-6 space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="p-1.5 rounded-lg bg-blue-900/50 text-blue-400 border border-blue-700/50 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Multi-Table Relational Joins</h4>
                    <p className="text-xs text-slate-400 mt-0.5">INNER JOIN, LEFT JOIN, and 3-way joins across Products, Categories, and Suppliers.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="p-1.5 rounded-lg bg-teal-900/50 text-teal-400 border border-teal-700/50 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Aggregate Computations &amp; HAVING</h4>
                    <p className="text-xs text-slate-400 mt-0.5">COUNT, SUM, AVG, MIN, MAX grouped by category and filtered using the HAVING clause.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="p-1.5 rounded-lg bg-indigo-900/50 text-indigo-400 border border-indigo-700/50 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Subqueries, EXISTS &amp; CTEs</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Correlated EXISTS subqueries, scalar subqueries in WHERE, and WITH CTE expressions.</p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={handleDemoAccess}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-600/30 transition-all inline-flex items-center space-x-2"
                >
                  <Terminal className="w-4 h-4" />
                  <span>Open Interactive SQL Lab</span>
                </button>
              </div>
            </div>

            {/* Code Preview Mockup */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl p-5 overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
                  <span className="text-xs font-mono text-slate-400 ml-2">sql_lab_console.sql</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-900/40 text-blue-300 border border-blue-800/50">
                  PostgreSQL 15
                </span>
              </div>

              <pre className="font-mono text-xs leading-relaxed text-blue-200 mt-4 overflow-x-auto p-2">
                <code>
{`-- Category-Wise Valuation & Unit Count
SELECT 
    c.name AS category_name,
    COUNT(p.id) AS total_items,
    SUM(p.current_stock) AS total_units,
    ROUND(SUM(p.current_stock * p.unit_price), 2) AS category_valuation
FROM categories c
LEFT JOIN products p ON c.id = p.category_id
GROUP BY c.id, c.name
HAVING SUM(p.current_stock * p.unit_price) > 10000.00
ORDER BY category_valuation DESC;`}
                </code>
              </pre>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span className="text-emerald-400">✓ Execution Status: 200 OK (0.42ms)</span>
                <span>4 Rows Returned</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-950 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-300">StockSense DB</span>
            <span>—</span>
            <span>Academic Database Management Systems Project</span>
          </div>

          <div className="flex items-center space-x-6 text-slate-400">
            <Link to="/login" className="hover:text-white">Sign In</Link>
            <Link to="/register" className="hover:text-white">Register</Link>
            <button onClick={handleDemoAccess} className="hover:text-teal-400">Viva Demo</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
