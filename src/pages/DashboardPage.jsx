import React, { useState, useEffect } from 'react';
import { getDashboardMetrics } from '../lib/databaseService';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import SqlCodeViewer from '../components/SqlCodeViewer';
import {
  Boxes,
  Layers,
  Truck,
  AlertTriangle,
  XCircle,
  TrendingUp,
  RefreshCw,
  ArrowRight,
  Database,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadData() {
    try {
      const data = await getDashboardMetrics();
      setMetrics(data);
    } catch (e) {
      console.error('Failed to load dashboard metrics:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleRefresh() {
    setRefreshing(true);
    loadData();
  }

  if (loading) {
    return <LoadingSpinner message="Executing Relational Aggregations..." />;
  }

  const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Warehouse &amp; Inventory Dashboard
            </h1>
            <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700 border border-blue-200">
              Live SQL State
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time aggregate calculations evaluated directly over PostgreSQL relations.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Querying...' : 'Refresh Queries'}</span>
          </button>

          <Link
            to="/sql-lab"
            className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Open SQL Lab</span>
          </Link>
        </div>
      </div>

      {/* 6 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Metric 1: Total Products */}
        <MetricCard
          title="Total Products"
          value={metrics?.totalProducts || 0}
          subtitle="Active SKUs in master catalog"
          icon={Boxes}
          colorScheme="blue"
          sqlQuery={`SELECT COUNT(*) AS total_products 
FROM products 
WHERE is_active = true;`}
          sqlExplanation="Calculates cardinality of active product records utilizing idx_products_user_id."
        />

        {/* Metric 2: Total Categories */}
        <MetricCard
          title="Total Categories"
          value={metrics?.totalCategories || 0}
          subtitle="Taxonomy groupings"
          icon={Layers}
          colorScheme="teal"
          sqlQuery={`SELECT COUNT(*) AS total_categories 
FROM categories;`}
          sqlExplanation="Counts distinct categorization entities in 3NF table categories."
        />

        {/* Metric 3: Total Suppliers */}
        <MetricCard
          title="Total Suppliers"
          value={metrics?.totalSuppliers || 0}
          subtitle="Registered procurement vendors"
          icon={Truck}
          colorScheme="indigo"
          sqlQuery={`SELECT COUNT(*) AS total_suppliers 
FROM suppliers;`}
          sqlExplanation="Queries vendor table linked via products.supplier_id foreign key."
        />

        {/* Metric 4: Total Inventory Value */}
        <MetricCard
          title="Total Inventory Valuation"
          value={`₹${(metrics?.totalInventoryValue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          subtitle="Cumulative stock valuation"
          icon={TrendingUp}
          colorScheme="emerald"
          sqlQuery={`SELECT ROUND(SUM(current_stock * unit_price), 2) AS total_valuation 
FROM products 
WHERE is_active = true;`}
          sqlExplanation="Aggregate arithmetic product SUM(quantity * price) representing total warehouse asset value."
        />

        {/* Metric 5: Low Stock Items */}
        <MetricCard
          title="Low Stock Items"
          value={metrics?.lowStockCount || 0}
          subtitle="Approaching reorder threshold"
          icon={AlertTriangle}
          colorScheme="amber"
          sqlQuery={`SELECT COUNT(*) AS low_stock_count 
FROM products 
WHERE current_stock > 0 
  AND current_stock <= reorder_level;`}
          sqlExplanation="Threshold comparison against reorder_level column to trigger replenishment."
        />

        {/* Metric 6: Out of Stock Items */}
        <MetricCard
          title="Out of Stock Items"
          value={metrics?.outOfStockCount || 0}
          subtitle="Zero quantity (Emergency)"
          icon={XCircle}
          colorScheme="rose"
          sqlQuery={`SELECT COUNT(*) AS out_of_stock_count 
FROM products 
WHERE current_stock = 0;`}
          sqlExplanation="Equality predicate identifying depleted inventory requiring purchase orders."
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Category Distribution (Bar Chart) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Category Product Distribution &amp; Count</h3>
              <p className="text-[11px] text-slate-500">Evaluated via GROUP BY category_id</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              Aggregated View
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics?.categoryDistribution || []} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10, fill: '#64748b' }} 
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip 
                  formatter={(value, name) => [value, name === 'count' ? 'Item Count' : 'Valuation (₹)']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '11px' }}
                />
                <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} name="Products" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Stock Health Distribution (Pie Chart) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Inventory Health Breakdown</h3>
            <p className="text-[11px] text-slate-500">Conditional CASE classifications</p>
          </div>

          <div className="h-48 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics?.stockStatusBreakdown || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(metrics?.stockStatusBreakdown || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-around text-xs">
            {(metrics?.stockStatusBreakdown || []).map((item) => (
              <div key={item.name} className="text-center">
                <span className="block text-sm font-bold text-slate-800">{item.value}</span>
                <span className="text-[10px] text-slate-500 flex items-center justify-center space-x-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span>{item.name}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Critical Low-Stock Alerts & Recent Transactions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section A: Low-Stock Alerts */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900">Urgent Low Stock Warnings</h3>
              </div>
              <Link to="/products?status=low_stock" className="text-xs text-blue-600 hover:underline flex items-center space-x-1">
                <span>View All Alerts</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <p className="text-[11px] text-slate-500 mb-4">
              Items matching <code className="font-mono text-slate-700">view_low_stock_products</code> requiring procurement orders.
            </p>

            {metrics?.lowStockList?.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                All active inventory quantities are currently above safety reorder points!
              </div>
            ) : (
              <div className="divide-y divide-slate-100 overflow-hidden">
                {metrics?.lowStockList?.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-900">{item.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {item.sku} &bull; Category: {item.category_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-amber-600">
                        {item.current_stock} / {item.reorder_level} {item.unit_of_measure}
                      </span>
                      <p className="text-[10px] text-slate-400">Reorder threshold</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <SqlCodeViewer
              sql={`SELECT product_name, current_stock, reorder_level, (reorder_level - current_stock) AS shortage
FROM view_low_stock_products
ORDER BY shortage DESC;`}
              title="Low Stock Alert View Query"
              explanation="Precomputed database view abstracting replenishment logic with subtraction operator."
            />
          </div>
        </div>

        {/* Section B: Recent Stock Movements Audit */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <h3 className="text-sm font-bold text-slate-900">Recent Inventory Transactions</h3>
              </div>
              <Link to="/transactions" className="text-xs text-blue-600 hover:underline flex items-center space-x-1">
                <span>View Audit Log</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <p className="text-[11px] text-slate-500 mb-4">
              Immutable ledger from <code className="font-mono text-slate-700">inventory_transactions</code>.
            </p>

            <div className="space-y-2.5">
              {metrics?.recentTransactions?.slice(0, 5).map((txn) => (
                <div key={txn.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <StatusBadge status={txn.transaction_type} type="transaction" />
                    <div>
                      <p className="text-xs font-semibold text-slate-800">{txn.product_name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Ref: {txn.reference_no || 'MANUAL'} &bull; {new Date(txn.transaction_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-900 font-mono">
                      {txn.transaction_type === 'STOCK_IN' ? '+' : txn.transaction_type === 'STOCK_OUT' ? '-' : '='}
                      {txn.quantity}
                    </span>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {txn.previous_stock} → {txn.new_stock}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <SqlCodeViewer
              sql={`SELECT t.transaction_date, t.transaction_type, p.name, t.quantity, t.previous_stock, t.new_stock
FROM inventory_transactions t
JOIN products p ON t.product_id = p.id
ORDER BY t.transaction_date DESC
LIMIT 5;`}
              title="Recent Transactions SQL Join"
              explanation="Equi-join between immutable transaction audit log and products master table."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
