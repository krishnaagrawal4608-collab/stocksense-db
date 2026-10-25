import React, { useState, useEffect } from 'react';
import {
  fetchProducts,
  fetchCategories,
  fetchSuppliers,
  fetchTransactions
} from '../lib/databaseService';
import LoadingSpinner from '../components/LoadingSpinner';
import SqlCodeViewer from '../components/SqlCodeViewer';
import {
  BarChart3,
  Download,
  Filter,
  Database,
  TrendingUp,
  AlertTriangle,
  Truck,
  ArrowLeftRight,
  FileSpreadsheet
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('valuation'); // 'valuation' | 'low-stock' | 'supplier' | 'movements'
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [pRes, cRes, sRes, tRes] = await Promise.all([
          fetchProducts(),
          fetchCategories(),
          fetchSuppliers(),
          fetchTransactions({ limit: 200 })
        ]);
        setProducts(pRes.data);
        setCategories(cRes.data);
        setSuppliers(sRes.data);
        setTransactions(tRes.data);
      } catch (err) {
        console.error('Error generating reports:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Aggregating Analytical Reports via SQL..." />;
  }

  // 1. Valuation Report Data (GROUP BY Category)
  const categorySummary = categories.map(cat => {
    const assigned = products.filter(p => p.category_id === cat.id);
    const totalUnits = assigned.reduce((acc, p) => acc + p.current_stock, 0);
    const valuation = assigned.reduce((acc, p) => acc + (p.current_stock * p.unit_price), 0);
    const avgPrice = assigned.length ? (assigned.reduce((acc, p) => acc + p.unit_price, 0) / assigned.length) : 0;
    return {
      category_name: cat.name,
      category_code: cat.code,
      item_count: assigned.length,
      total_units: totalUnits,
      valuation: Number(valuation.toFixed(2)),
      avg_price: Number(avgPrice.toFixed(2))
    };
  });

  // 2. Low-Stock Report Data
  const lowStockReport = products
    .filter(p => p.current_stock <= p.reorder_level)
    .map(p => {
      const shortage = Math.max(0, p.reorder_level - p.current_stock);
      const estCost = shortage * (p.cost_price || p.unit_price * 0.7);
      return {
        product_name: p.name,
        sku: p.sku,
        category: p.category_name,
        supplier: p.supplier_name,
        current_stock: p.current_stock,
        reorder_level: p.reorder_level,
        shortage,
        unit_cost: p.cost_price || p.unit_price,
        estimated_restock_cost: Number(estCost.toFixed(2))
      };
    });

  // 3. Supplier Performance Report Data
  const supplierReport = suppliers.map(sup => {
    const suppliedProds = products.filter(p => p.supplier_id === sup.id);
    const totalStock = suppliedProds.reduce((acc, p) => acc + p.current_stock, 0);
    const totalVal = suppliedProds.reduce((acc, p) => acc + (p.current_stock * p.unit_price), 0);
    return {
      supplier_name: sup.name,
      contact: sup.contact_person || 'N/A',
      phone: sup.phone || 'N/A',
      products_count: suppliedProds.length,
      total_units_stocked: totalStock,
      total_value_supplied: Number(totalVal.toFixed(2))
    };
  });

  // 4. Stock Movement Summary Data
  const stockInTotal = transactions
    .filter(t => t.transaction_type === 'STOCK_IN')
    .reduce((sum, t) => sum + t.quantity, 0);
  const stockOutTotal = transactions
    .filter(t => t.transaction_type === 'STOCK_OUT')
    .reduce((sum, t) => sum + t.quantity, 0);

  // CSV Export Utility
  function exportCSV(filename, rows) {
    if (!rows.length) {
      alert('No data available to export.');
      return;
    }
    const headers = Object.keys(rows[0]).join(',');
    const csvContent = [
      headers,
      ...rows.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const SQL_QUERIES = {
    valuation: `SELECT 
    c.name AS category_name,
    c.code AS category_code,
    COUNT(p.id) AS item_count,
    COALESCE(SUM(p.current_stock), 0) AS total_units,
    COALESCE(ROUND(SUM(p.current_stock * p.unit_price), 2), 0.00) AS valuation,
    COALESCE(ROUND(AVG(p.unit_price), 2), 0.00) AS average_price
FROM categories c
LEFT JOIN products p ON c.id = p.category_id AND p.is_active = true
GROUP BY c.id, c.name, c.code
ORDER BY valuation DESC;`,

    'low-stock': `SELECT 
    p.name AS product_name,
    p.sku,
    c.name AS category,
    s.name AS supplier,
    p.current_stock,
    p.reorder_level,
    (p.reorder_level - p.current_stock) AS shortage,
    ROUND((p.reorder_level - p.current_stock) * p.cost_price, 2) AS estimated_restock_cost
FROM products p
JOIN categories c ON p.category_id = c.id
LEFT JOIN suppliers s ON p.supplier_id = s.id
WHERE p.current_stock <= p.reorder_level
ORDER BY shortage DESC;`,

    supplier: `SELECT 
    s.name AS supplier_name,
    s.contact_person,
    s.phone,
    COUNT(p.id) AS products_count,
    COALESCE(SUM(p.current_stock), 0) AS total_units_stocked,
    COALESCE(ROUND(SUM(p.current_stock * p.unit_price), 2), 0.00) AS total_value_supplied
FROM suppliers s
LEFT JOIN products p ON s.id = p.supplier_id
GROUP BY s.id, s.name, s.contact_person, s.phone
ORDER BY total_value_supplied DESC;`,

    movements: `SELECT 
    t.transaction_type,
    COUNT(t.id) AS total_movements,
    SUM(t.quantity) AS total_volume_moved
FROM inventory_transactions t
GROUP BY t.transaction_type;`
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Analytical SQL Reports</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
              Aggregated Analytics
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Generate inventory valuations, restock budgets, and turnover analysis powered by SQL group-by aggregations.
          </p>
        </div>

        <button
          onClick={() => {
            const dataToExport = reportType === 'valuation' ? categorySummary :
                                reportType === 'low-stock' ? lowStockReport :
                                reportType === 'supplier' ? supplierReport : transactions;
            exportCSV(`stocksense_report_${reportType}`, dataToExport);
          }}
          className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-500/20 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Report to CSV</span>
        </button>
      </div>

      {/* Report Selection Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          onClick={() => setReportType('valuation')}
          className={`p-3 rounded-xl border text-left transition-all ${
            reportType === 'valuation'
              ? 'bg-blue-50 border-blue-400 shadow-sm ring-1 ring-blue-400/20'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center space-x-2 text-blue-600 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-bold">Inventory Valuation</span>
          </div>
          <p className="text-[11px] text-slate-500">Valuation per category</p>
        </button>

        <button
          onClick={() => setReportType('low-stock')}
          className={`p-3 rounded-xl border text-left transition-all ${
            reportType === 'low-stock'
              ? 'bg-amber-50 border-amber-400 shadow-sm ring-1 ring-amber-400/20'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center space-x-2 text-amber-600 mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs font-bold">Low-Stock &amp; Reorder</span>
          </div>
          <p className="text-[11px] text-slate-500">Procurement requirement</p>
        </button>

        <button
          onClick={() => setReportType('supplier')}
          className={`p-3 rounded-xl border text-left transition-all ${
            reportType === 'supplier'
              ? 'bg-indigo-50 border-indigo-400 shadow-sm ring-1 ring-indigo-400/20'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center space-x-2 text-indigo-600 mb-1">
            <Truck className="w-4 h-4" />
            <span className="text-xs font-bold">Supplier Coverage</span>
          </div>
          <p className="text-[11px] text-slate-500">Vendor product share</p>
        </button>

        <button
          onClick={() => setReportType('movements')}
          className={`p-3 rounded-xl border text-left transition-all ${
            reportType === 'movements'
              ? 'bg-emerald-50 border-emerald-400 shadow-sm ring-1 ring-emerald-400/20'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center space-x-2 text-emerald-600 mb-1">
            <ArrowLeftRight className="w-4 h-4" />
            <span className="text-xs font-bold">Stock Movement Velocity</span>
          </div>
          <p className="text-[11px] text-slate-500">Stock in vs Stock out</p>
        </button>
      </div>

      {/* SQL Code Viewer for Active Report */}
      <SqlCodeViewer
        sql={SQL_QUERIES[reportType]}
        title={`Underlying SQL Query for ${reportType.toUpperCase()} Report`}
        explanation="Aggregate calculation computed directly via relational PostgreSQL engine."
        defaultExpanded={true}
      />

      {/* Report 1: Valuation Content */}
      {reportType === 'valuation' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Category Valuation Comparison (INR)</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categorySummary}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="category_name" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip 
                    formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Valuation']}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '11px' }}
                  />
                  <Bar dataKey="valuation" fill="#0d9488" radius={[6, 6, 0, 0]} name="Valuation (₹)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs font-mono">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase">
                  <tr>
                    <th className="px-4 py-3">Category Name</th>
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3 text-center">Items Count</th>
                    <th className="px-4 py-3 text-center">Total Stock Units</th>
                    <th className="px-4 py-3 text-right">Avg Unit Price</th>
                    <th className="px-4 py-3 text-right">Total Category Valuation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {categorySummary.map((cat, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-900 font-sans">{cat.category_name}</td>
                      <td className="px-4 py-3 text-slate-500">{cat.category_code}</td>
                      <td className="px-4 py-3 text-center font-bold text-slate-700">{cat.item_count}</td>
                      <td className="px-4 py-3 text-center text-slate-600">{cat.total_units}</td>
                      <td className="px-4 py-3 text-right text-slate-700">₹{cat.avg_price.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-right font-bold text-teal-700">
                        ₹{cat.valuation.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Report 2: Low-Stock Report Content */}
      {reportType === 'low-stock' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800">Critical Replenishment &amp; Budget Needs</span>
            <span className="font-mono text-amber-700 font-semibold">{lowStockReport.length} Items Require Restock</span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs font-mono">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase">
                <tr>
                  <th className="px-4 py-3">Product Name</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Supplier</th>
                  <th className="px-4 py-3 text-center">Current</th>
                  <th className="px-4 py-3 text-center">Reorder Point</th>
                  <th className="px-4 py-3 text-center">Shortage Units</th>
                  <th className="px-4 py-3 text-right">Est. Restock Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {lowStockReport.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-900 font-sans">{p.product_name}</td>
                    <td className="px-4 py-3 text-slate-500">{p.sku}</td>
                    <td className="px-4 py-3 text-slate-600 font-sans">{p.category}</td>
                    <td className="px-4 py-3 text-slate-600 font-sans">{p.supplier}</td>
                    <td className="px-4 py-3 text-center font-bold text-rose-600">{p.current_stock}</td>
                    <td className="px-4 py-3 text-center text-slate-600">{p.reorder_level}</td>
                    <td className="px-4 py-3 text-center font-bold text-amber-600">+{p.shortage}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900">
                      ₹{p.estimated_restock_cost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report 3: Supplier Coverage Content */}
      {reportType === 'supplier' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs font-mono">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase">
                <tr>
                  <th className="px-4 py-3">Supplier Name</th>
                  <th className="px-4 py-3">Contact Person</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3 text-center">Products Supplied</th>
                  <th className="px-4 py-3 text-center">Total Stocked Units</th>
                  <th className="px-4 py-3 text-right">Total Inventory Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {supplierReport.map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-900 font-sans">{s.supplier_name}</td>
                    <td className="px-4 py-3 text-slate-600 font-sans">{s.contact}</td>
                    <td className="px-4 py-3 text-slate-500">{s.phone}</td>
                    <td className="px-4 py-3 text-center font-bold text-slate-800">{s.products_count}</td>
                    <td className="px-4 py-3 text-center text-slate-600">{s.total_units_stocked}</td>
                    <td className="px-4 py-3 text-right font-bold text-indigo-700">
                      ₹{s.total_value_supplied.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report 4: Movement Velocity Content */}
      {reportType === 'movements' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-emerald-50/70 border border-emerald-200 rounded-xl text-center">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Total Received Volume (Stock In)</span>
            <h3 className="text-3xl font-extrabold text-emerald-900 mt-2 font-mono">+{stockInTotal} Units</h3>
            <p className="text-xs text-emerald-700 mt-1">Aggregated purchase consignments</p>
          </div>

          <div className="p-6 bg-rose-50/70 border border-rose-200 rounded-xl text-center">
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">Total Dispatched Volume (Stock Out)</span>
            <h3 className="text-3xl font-extrabold text-rose-900 mt-2 font-mono">-{stockOutTotal} Units</h3>
            <p className="text-xs text-rose-700 mt-1">Fulfillments and site orders</p>
          </div>
        </div>
      )}
    </div>
  );
}
