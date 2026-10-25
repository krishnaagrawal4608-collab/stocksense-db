import React, { useState, useEffect } from 'react';
import { getDatabaseSchemaMetadata } from '../lib/databaseService';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Database,
  Layers,
  Key,
  ShieldCheck,
  GitBranch,
  BookOpen,
  Boxes,
  Truck,
  ArrowLeftRight,
  Info,
  CheckCircle2,
  Table
} from 'lucide-react';

export default function DatabaseExplorerPage() {
  const [schemaMetadata, setSchemaMetadata] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('er-diagram'); // 'er-diagram' | 'tables' | 'theory'
  const [selectedTable, setSelectedTable] = useState('products');

  useEffect(() => {
    async function load() {
      try {
        const meta = await getDatabaseSchemaMetadata();
        setSchemaMetadata(meta);
      } catch (e) {
        console.error('Failed to load schema metadata:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Inspecting Database System Catalogs..." />;
  }

  const currentTableMeta = schemaMetadata.find(t => t.tableName === selectedTable) || schemaMetadata[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Database Schema &amp; ER Explorer</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold border border-blue-200">
              PostgreSQL Relational Catalog
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Visual Entity-Relationship Model, table dictionary, and DBMS viva theory reference.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-slate-200/80 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('er-diagram')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'er-diagram' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Visual ER Diagram
          </button>
          <button
            onClick={() => setActiveTab('tables')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'tables' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Table Dictionary &amp; Records
          </button>
          <button
            onClick={() => setActiveTab('theory')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'theory' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            DBMS Theory &amp; Viva Guide
          </button>
        </div>
      </div>

      {/* TAB 1: VISUAL ER DIAGRAM */}
      {activeTab === 'er-diagram' && (
        <div className="space-y-6">
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold tracking-wider text-slate-200 uppercase font-mono">
                  Entity-Relationship Architectural Graph (Crow's Foot 3NF)
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-teal-400 border border-slate-700">
                5 Relational Entities
              </span>
            </div>

            {/* Visual Relationship Diagram */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              {/* Entity 1: Profiles */}
              <div className="bg-slate-900 rounded-xl border-2 border-blue-500/50 p-4 shadow-lg">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
                  <span className="font-mono font-bold text-xs text-blue-400">profiles (User)</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-950 text-blue-300">1:N Root</span>
                </div>
                <div className="space-y-1 text-[11px] font-mono text-slate-300">
                  <div className="text-amber-400 font-bold">PK  id : UUID</div>
                  <div>    full_name : TEXT</div>
                  <div>    email : TEXT</div>
                  <div>    role : TEXT</div>
                  <div>    created_at : TIMESTAMPTZ</div>
                </div>
              </div>

              {/* Entity 2: Categories */}
              <div className="bg-slate-900 rounded-xl border border-teal-500/50 p-4 shadow-lg">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
                  <span className="font-mono font-bold text-xs text-teal-400">categories</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-teal-950 text-teal-300">1 : N Products</span>
                </div>
                <div className="space-y-1 text-[11px] font-mono text-slate-300">
                  <div className="text-amber-400 font-bold">PK  id : UUID</div>
                  <div className="text-indigo-400">FK  user_id : UUID</div>
                  <div>    name : TEXT (UNIQUE)</div>
                  <div>    code : TEXT (UNIQUE)</div>
                  <div>    description : TEXT</div>
                </div>
              </div>

              {/* Entity 3: Suppliers */}
              <div className="bg-slate-900 rounded-xl border border-indigo-500/50 p-4 shadow-lg">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
                  <span className="font-mono font-bold text-xs text-indigo-400">suppliers</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300">1 : N Products</span>
                </div>
                <div className="space-y-1 text-[11px] font-mono text-slate-300">
                  <div className="text-amber-400 font-bold">PK  id : UUID</div>
                  <div className="text-indigo-400">FK  user_id : UUID</div>
                  <div>    name : TEXT (UNIQUE)</div>
                  <div>    contact_person : TEXT</div>
                  <div>    phone, email, city</div>
                </div>
              </div>
            </div>

            {/* Central Entity: Products */}
            <div className="mt-6 flex justify-center">
              <div className="w-full md:w-2/3 bg-slate-900 rounded-xl border-2 border-emerald-500 p-5 shadow-2xl ring-2 ring-emerald-500/20">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
                  <div className="flex items-center space-x-2">
                    <Boxes className="w-4 h-4 text-emerald-400" />
                    <span className="font-mono font-bold text-sm text-emerald-400">products (Core Master Table)</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Central Entity
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px] font-mono text-slate-300">
                  <div className="space-y-1">
                    <div className="text-amber-400 font-bold">PK  id : UUID</div>
                    <div className="text-indigo-400">FK  user_id : UUID &rarr; profiles(id)</div>
                    <div className="text-indigo-400">FK  category_id : UUID &rarr; categories(id) [RESTRICT]</div>
                    <div className="text-indigo-400">FK  supplier_id : UUID &rarr; suppliers(id) [SET NULL]</div>
                    <div>    name : TEXT (NOT NULL)</div>
                    <div>    sku : TEXT (UNIQUE)</div>
                  </div>
                  <div className="space-y-1">
                    <div>    unit_price : NUMERIC (&gt;= 0)</div>
                    <div>    cost_price : NUMERIC (&gt;= 0)</div>
                    <div className="text-teal-300 font-semibold">    current_stock : INTEGER (&gt;= 0)</div>
                    <div className="text-amber-300">    reorder_level : INTEGER (&gt;= 0)</div>
                    <div>    unit_of_measure : TEXT (CHECK)</div>
                    <div>    is_active : BOOLEAN</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Downstream Entity: Inventory Transactions */}
            <div className="mt-6 flex justify-center">
              <div className="w-full md:w-1/2 bg-slate-900 rounded-xl border border-rose-500/60 p-4 shadow-lg">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
                  <div className="flex items-center space-x-2">
                    <ArrowLeftRight className="w-4 h-4 text-rose-400" />
                    <span className="font-mono font-bold text-xs text-rose-400">inventory_transactions (Audit Ledger)</span>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-950 text-rose-300">N : 1 Products</span>
                </div>

                <div className="space-y-1 text-[11px] font-mono text-slate-300">
                  <div className="text-amber-400 font-bold">PK  id : UUID</div>
                  <div className="text-indigo-400">FK  user_id : UUID &rarr; profiles(id)</div>
                  <div className="text-indigo-400">FK  product_id : UUID &rarr; products(id) [CASCADE]</div>
                  <div>    transaction_type : CHECK (STOCK_IN, STOCK_OUT, ADJUSTMENT)</div>
                  <div>    quantity : INTEGER (&gt; 0)</div>
                  <div>    previous_stock : INTEGER &rarr; new_stock : INTEGER</div>
                  <div>    transaction_date : TIMESTAMPTZ</div>
                </div>
              </div>
            </div>

            {/* Relationship Legend */}
            <div className="mt-8 pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-400">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded bg-amber-400 inline-block"></span>
                <span><strong>Primary Key (PK):</strong> Unique entity identifier</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded bg-indigo-400 inline-block"></span>
                <span><strong>Foreign Key (FK):</strong> Enforces Referential Integrity</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded bg-teal-400 inline-block"></span>
                <span><strong>CHECK Constraints:</strong> Domain Integrity (no negative stock/price)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TABLE DICTIONARY & RECORDS */}
      {activeTab === 'tables' && (
        <div className="space-y-6">
          {/* Table Selector Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1">
            {schemaMetadata.map(table => (
              <button
                key={table.tableName}
                onClick={() => setSelectedTable(table.tableName)}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all ${
                  selectedTable === table.tableName
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {table.tableName} ({table.rowCount} rows)
              </button>
            ))}
          </div>

          {/* Table Details */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 bg-slate-50/60">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold font-mono text-slate-900">{currentTableMeta.tableName}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{currentTableMeta.description}</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200">
                  {currentTableMeta.normalForm}
                </span>
              </div>
            </div>

            {/* Column Definitions */}
            <div className="p-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Column Attributes &amp; Constraints
              </h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-xs font-mono">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-4 py-2.5 text-left">Column Name</th>
                      <th className="px-4 py-2.5 text-left">Data Type</th>
                      <th className="px-4 py-2.5 text-center">Key</th>
                      <th className="px-4 py-2.5 text-left">Constraints &amp; Defaults</th>
                      <th className="px-4 py-2.5 text-center">Nullable</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {currentTableMeta.columns.map((col, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-4 py-2 font-bold text-slate-900">{col.name}</td>
                        <td className="px-4 py-2 text-blue-600">{col.type}</td>
                        <td className="px-4 py-2 text-center">
                          {col.key === 'PK' ? (
                            <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">PK</span>
                          ) : col.key === 'FK' ? (
                            <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold text-[10px]">FK</span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-slate-600 font-sans text-xs">{col.constraint || 'None'}</td>
                        <td className="px-4 py-2 text-center text-slate-500">{col.nullable ? 'YES' : 'NO'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sample Tuples */}
            <div className="p-5 border-t border-slate-100 bg-slate-50/30">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Sample Live Tuples in Database
              </h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-[11px] font-mono bg-white border border-slate-200 rounded-lg">
                  <thead className="bg-slate-100/70 text-slate-600 font-semibold">
                    <tr>
                      {Object.keys(currentTableMeta.sampleRows[0] || {}).map((key, i) => (
                        <th key={i} className="px-3 py-2 text-left whitespace-nowrap">{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentTableMeta.sampleRows.map((row, rIdx) => (
                      <tr key={rIdx}>
                        {Object.values(row).map((val, cIdx) => (
                          <td key={cIdx} className="px-3 py-2 text-slate-700 whitespace-nowrap">
                            {String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DBMS THEORY & VIVA GUIDE */}
      {activeTab === 'theory' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Normalization */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-3">
              <div className="flex items-center space-x-2 text-blue-600">
                <BookOpen className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900">Database Normalization (1NF to 3NF)</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                StockSense DB is structured in <strong>Third Normal Form (3NF)</strong>:
              </p>
              <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
                <li>
                  <strong>First Normal Form (1NF):</strong> All attributes contain atomic, indivisible values. No multi-valued attributes or repeating groups exist.
                </li>
                <li>
                  <strong>Second Normal Form (2NF):</strong> Achieved 1NF, and all non-key attributes are fully functionally dependent on the entire primary key (no partial dependency).
                </li>
                <li>
                  <strong>Third Normal Form (3NF):</strong> Achieved 2NF, and no non-key attribute is transitively dependent on the primary key via another non-key attribute. (e.g. Category details belong in <code className="font-mono">categories</code>, not copied repeatedly inside <code className="font-mono">products</code>).
                </li>
              </ul>
            </div>

            {/* Card 2: Referential Integrity */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-3">
              <div className="flex items-center space-x-2 text-indigo-600">
                <GitBranch className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900">Referential Integrity &amp; Cascade Actions</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Foreign key constraints enforce logical parent-child relationships and dictate intentional deletion behavior:
              </p>
              <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
                <li>
                  <strong>ON DELETE RESTRICT:</strong> Applied to <code className="font-mono">products.category_id</code>. A category cannot be deleted if active products are still classified under it, preventing orphaned rows.
                </li>
                <li>
                  <strong>ON DELETE SET NULL:</strong> Applied to <code className="font-mono">products.supplier_id</code>. If a supplier company shuts down, catalog items remain safely preserved with supplier set to NULL.
                </li>
                <li>
                  <strong>ON DELETE CASCADE:</strong> Applied to <code className="font-mono">user_id</code>. If a user deletes their profile, their isolated data is completely purged per privacy standards.
                </li>
              </ul>
            </div>

            {/* Card 3: ACID Transactions */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-3">
              <div className="flex items-center space-x-2 text-emerald-600">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900">ACID Properties in Inventory Movement</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Stock changes are handled by the <code className="font-mono text-blue-600">record_stock_movement()</code> stored procedure:
              </p>
              <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
                <li>
                  <strong>Atomicity:</strong> Both updating <code className="font-mono">products.current_stock</code> and inserting into <code className="font-mono">inventory_transactions</code> happen together or not at all.
                </li>
                <li>
                  <strong>Consistency:</strong> CHECK constraints ensure stock never goes below 0. If requested quantity exceeds stock, an exception aborts the transaction.
                </li>
                <li>
                  <strong>Isolation:</strong> Uses <code className="font-mono">FOR UPDATE</code> row locking to prevent race conditions when two orders decrement stock concurrently.
                </li>
                <li>
                  <strong>Durability:</strong> PostgreSQL write-ahead logs (WAL) guarantee committed transactions survive server crashes.
                </li>
              </ul>
            </div>

            {/* Card 4: Indexes & Optimization */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-3">
              <div className="flex items-center space-x-2 text-amber-600">
                <Key className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900">Indexes &amp; Query Optimization</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Secondary B-Tree indexes transform O(N) full table scans into O(log N) indexed searches:
              </p>
              <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
                <li>
                  <code className="font-mono">idx_products_sku</code>: Speeds up barcode/SKU lookup from minutes to microseconds.
                </li>
                <li>
                  <code className="font-mono">idx_products_category_id</code> &amp; <code className="font-mono">idx_products_supplier_id</code>: Accelerates foreign key joins.
                </li>
                <li>
                  <code className="font-mono">idx_transactions_date</code>: Optimizes time-series audit queries sorted descending.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
