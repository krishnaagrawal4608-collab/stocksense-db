import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchProducts, fetchCategories, fetchSuppliers } from '../lib/databaseService';
import StatusBadge from '../components/StatusBadge';
import {
  Boxes,
  TrendingDown,
  Truck,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Package,
  Layers,
  ArrowLeftRight,
  TrendingUp,
  AlertTriangle,
  XCircle,
  Shield,
  Clock,
  Sparkles
} from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Preview data state
  const [previewProducts, setPreviewProducts] = useState([]);
  const [metrics, setMetrics] = useState({
    totalProducts: 8,
    lowStock: 2,
    outOfStock: 1,
    totalValue: 714589
  });

  useEffect(() => {
    async function loadPreview() {
      try {
        const pRes = await fetchProducts();
        if (pRes?.data && pRes.data.length > 0) {
          const prods = pRes.data;
          setPreviewProducts(prods.slice(0, 4));
          const totalVal = prods.reduce((sum, p) => sum + (p.current_stock * p.unit_price), 0);
          const low = prods.filter(p => p.current_stock > 0 && p.current_stock <= p.reorder_level).length;
          const out = prods.filter(p => p.current_stock === 0).length;
          setMetrics({
            totalProducts: prods.length,
            lowStock: low,
            outOfStock: out,
            totalValue: Math.round(totalVal)
          });
        }
      } catch (e) {
        console.warn('Preview fallback:', e);
      }
    }
    loadPreview();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <Package className="w-5 h-5" />
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="text-lg font-bold text-slate-900 tracking-tight">StockSense</span>
              <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                DB
              </span>
            </div>
          </Link>

          {/* Minimal Navigation */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
            <a href="#" className="text-slate-900 font-semibold hover:text-blue-600 transition-colors">Home</a>
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#preview" className="hover:text-blue-600 transition-colors">Preview</a>
            <a href="#about" className="hover:text-blue-600 transition-colors">About</a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center space-x-3">
            {user ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-12 sm:pt-20 sm:pb-16 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-xs font-medium text-blue-700 mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span>Intelligent Inventory Management Workspace</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight sm:leading-tight">
            Manage Your Inventory.<br />Make Smarter Decisions.
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Track products, monitor stock levels, manage suppliers, and keep your inventory organized in one simple workspace.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-8 flex items-center justify-center space-x-4">
            <Link
              to="/register"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm shadow-blue-500/20 transition-all flex items-center space-x-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/login"
              className="px-6 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-300 shadow-sm transition-all"
            >
              Login
            </Link>
          </div>

          {/* Clean Trust Indicators */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Real-Time Stock Tracking</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Automated Reorder Alerts</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Supplier &amp; Purchase Records</span>
            </div>
          </div>
        </div>
      </section>

      {/* Product Preview Section */}
      <section id="preview" className="py-14 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-xs uppercase tracking-wider font-bold text-blue-600">Product Preview</h2>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              Everything You Need in One Clean Dashboard
            </p>
            <p className="text-xs text-slate-500 mt-1">
              A centralized interface giving your team complete clarity over catalog health and stock movements.
            </p>
          </div>

          {/* Interactive Workspace Preview Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
            {/* Window Top Bar */}
            <div className="px-6 py-3.5 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-slate-300"></span>
                <span className="w-3 h-3 rounded-full bg-slate-300"></span>
                <span className="w-3 h-3 rounded-full bg-slate-300"></span>
                <span className="ml-2 font-semibold text-slate-700">StockSense DB Workspace</span>
              </div>
              <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Active Workspace Preview</span>
              </div>
            </div>

            {/* Dashboard Inner Preview */}
            <div className="p-6 space-y-6">
              {/* Preview Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                    <span>Total Products</span>
                    <Boxes className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="mt-2 text-2xl font-bold text-slate-900">{metrics.totalProducts}</div>
                  <div className="mt-1 text-[11px] text-slate-500">Catalog items</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                    <span>Low Stock Items</span>
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="mt-2 text-2xl font-bold text-amber-600">{metrics.lowStock}</div>
                  <div className="mt-1 text-[11px] text-slate-500">Below reorder point</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                    <span>Out of Stock</span>
                    <XCircle className="w-4 h-4 text-rose-500" />
                  </div>
                  <div className="mt-2 text-2xl font-bold text-rose-600">{metrics.outOfStock}</div>
                  <div className="mt-1 text-[11px] text-slate-500">Immediate action needed</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                    <span>Total Inventory Value</span>
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="mt-2 text-2xl font-bold text-slate-900">
                    ₹{metrics.totalValue.toLocaleString('en-IN')}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500">Current asset valuation</div>
                </div>
              </div>

              {/* Preview Product Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Recent Products &amp; Stock Levels</span>
                  <Link to="/login" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                    View full inventory &rarr;
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                    <thead className="bg-slate-50/50 text-slate-500 font-semibold">
                      <tr>
                        <th className="px-4 py-2.5">Product Name</th>
                        <th className="px-4 py-2.5">SKU</th>
                        <th className="px-4 py-2.5">Category</th>
                        <th className="px-4 py-2.5 text-right">Price</th>
                        <th className="px-4 py-2.5 text-center">Stock</th>
                        <th className="px-4 py-2.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {(previewProducts.length > 0 ? previewProducts : [
                        { id: '1', name: 'Enterprise Wireless Mouse M350', sku: 'SKU-EL-001', category_name: 'Electronics & IT', unit_price: 1250, current_stock: 85, reorder_level: 20 },
                        { id: '2', name: 'UltraWide 27-inch IPS Monitor', sku: 'SKU-EL-002', category_name: 'Electronics & IT', unit_price: 24999, current_stock: 24, reorder_level: 8 },
                        { id: '3', name: 'High-Speed Ethernet Cable 10m', sku: 'SKU-EL-003', category_name: 'Electronics & IT', unit_price: 320, current_stock: 6, reorder_level: 15 },
                        { id: '4', name: 'Variable Speed Hammer Drill 18V', sku: 'SKU-TL-001', category_name: 'Industrial Tools', unit_price: 6800, current_stock: 0, reorder_level: 5 }
                      ]).map(item => {
                        const isLow = item.current_stock <= item.reorder_level;
                        const isOut = item.current_stock === 0;
                        const statusLabel = isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock';
                        return (
                          <tr key={item.id} className="hover:bg-slate-50/80">
                            <td className="px-4 py-2.5 font-semibold text-slate-900">{item.name}</td>
                            <td className="px-4 py-2.5 font-mono text-[11px] text-slate-500">{item.sku}</td>
                            <td className="px-4 py-2.5 text-slate-600">{item.category_name}</td>
                            <td className="px-4 py-2.5 text-right font-mono text-slate-800">
                              ₹{Number(item.unit_price).toLocaleString('en-IN')}
                            </td>
                            <td className="px-4 py-2.5 text-center font-bold font-mono">
                              <span className={isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-slate-800'}>
                                {item.current_stock}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-center">
                              <StatusBadge status={statusLabel} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simplified Features Section */}
      <section id="features" className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs uppercase tracking-wider font-bold text-blue-600">Core Features</h2>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              Purpose-Built for Seamless Inventory Operations
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Simple, reliable tools to manage catalog items, keep suppliers in sync, and stay ahead of stockouts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 flex flex-col justify-between hover:border-blue-300 transition-colors">
              <div>
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                  <Boxes className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Product Management</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Add, edit, search, filter, and organize products. Maintain unique SKUs, unit pricing, descriptions, and categories.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 flex flex-col justify-between hover:border-amber-300 transition-colors">
              <div>
                <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Stock Monitoring</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Track physical stock quantities in real time, configure custom reorder points, and quickly identify products needing replenishment.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 flex flex-col justify-between hover:border-indigo-300 transition-colors">
              <div>
                <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                  <Truck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Supplier Management</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Organize vendor information, contact details, and product relationships to maintain reliable procurement channels.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 flex flex-col justify-between hover:border-emerald-300 transition-colors">
              <div>
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Reports and Analytics</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Understand inventory valuation, stock movement history, category distribution, and export data directly to CSV.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-xs uppercase tracking-wider font-bold text-blue-600">About StockSense DB</h2>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              Engineered for Accuracy and Simplicity
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Reliable Data Foundation</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Backed by robust relational integrity, unique constraints, and safe audit logs so your stock quantities always stay accurate.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900">Fast Daily Workflow</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Quick action shortcuts for receiving inventory (Stock In) and fulfilling orders (Stock Out) without navigating multiple pages.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900">Secure &amp; Scalable</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Protected authentication sessions, isolated user accounts, and responsive access across desktop, tablet, and mobile.
                </p>
              </div>
            </div>

            {/* Bottom CTA within About */}
            <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-base font-bold text-slate-900">Ready to organize your warehouse?</h4>
                <p className="text-xs text-slate-500 mt-0.5">Start managing your products and inventory transactions in minutes.</p>
              </div>
              <div className="flex items-center space-x-3">
                <Link
                  to="/register"
                  className="px-5 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Minimal Clean Footer */}
      <footer className="mt-auto bg-white py-8 border-t border-slate-200 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-900">StockSense DB</span>
            <span>&bull;</span>
            <span>Modern Inventory Management SaaS</span>
          </div>

          <div className="flex items-center space-x-6 text-slate-600">
            <a href="#" className="hover:text-blue-600 transition-colors">Home</a>
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#about" className="hover:text-blue-600 transition-colors">About</a>
            <Link to="/login" className="hover:text-blue-600 transition-colors">Login</Link>
            <Link to="/register" className="hover:text-blue-600 transition-colors">Get Started</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
