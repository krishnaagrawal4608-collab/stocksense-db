import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Modal from '../components/Modal';
import { createProduct, recordStockMovement, fetchCategories, fetchSuppliers, fetchProducts } from '../lib/databaseService';
import { useAuth } from '../context/AuthContext';
import { ArrowLeftRight, Plus, CheckCircle2 } from 'lucide-react';

export default function DashboardLayout() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Quick Action Modal States
  const [quickProductOpen, setQuickProductOpen] = useState(false);
  const [quickMovementOpen, setQuickMovementOpen] = useState(false);

  // Dropdown options
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);

  // Quick Product Form
  const [newProd, setNewProd] = useState({
    name: '',
    sku: '',
    category_id: '',
    supplier_id: '',
    unit_price: '',
    cost_price: '',
    current_stock: '',
    reorder_level: '10',
    unit_of_measure: 'pcs',
    description: ''
  });

  // Quick Movement Form
  const [movement, setMovement] = useState({
    productId: '',
    transactionType: 'STOCK_IN',
    quantity: '',
    referenceNo: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  async function openQuickProduct() {
    setFeedback(null);
    try {
      const [cRes, sRes] = await Promise.all([fetchCategories(), fetchSuppliers()]);
      setCategories(cRes.data);
      setSuppliers(sRes.data);
      if (cRes.data.length > 0) {
        setNewProd(prev => ({ ...prev, category_id: cRes.data[0].id }));
      }
      setQuickProductOpen(true);
    } catch (e) {
      alert('Error fetching form data: ' + e.message);
    }
  }

  async function openQuickMovement() {
    setFeedback(null);
    try {
      const pRes = await fetchProducts();
      setProducts(pRes.data);
      if (pRes.data.length > 0) {
        setMovement(prev => ({ ...prev, productId: pRes.data[0].id }));
      }
      setQuickMovementOpen(true);
    } catch (e) {
      alert('Error fetching products: ' + e.message);
    }
  }

  async function handleQuickProductSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      await createProduct(newProd, user?.id);
      setFeedback({ type: 'success', message: 'Product created successfully in database!' });
      setTimeout(() => {
        setQuickProductOpen(false);
        window.location.reload();
      }, 1000);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  }

  async function handleQuickMovementSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      await recordStockMovement({
        productId: movement.productId,
        transactionType: movement.transactionType,
        quantity: movement.quantity,
        referenceNo: movement.referenceNo,
        notes: movement.notes,
        userId: user?.id
      });
      setFeedback({ type: 'success', message: 'Stock movement executed atomically and audit log persisted!' });
      setTimeout(() => {
        setQuickMovementOpen(false);
        window.location.reload();
      }, 1000);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Body */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Header 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          onQuickAddProduct={openQuickProduct}
          onQuickMovement={openQuickMovement}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Quick Add Product Modal */}
      <Modal
        isOpen={quickProductOpen}
        onClose={() => setQuickProductOpen(false)}
        title="Add New Inventory Product"
        subtitle="Inserts record into products table with foreign keys & CHECK constraints"
      >
        <form onSubmit={handleQuickProductSubmit} className="space-y-4">
          {feedback && (
            <div className={`p-3 rounded-lg text-xs font-medium ${
              feedback.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}>
              {feedback.message}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Product Name *</label>
              <input
                type="text"
                required
                value={newProd.name}
                onChange={e => setNewProd({ ...newProd, name: e.target.value })}
                placeholder="e.g. Ergonomic Office Chair"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">SKU (Unique Constraint) *</label>
              <input
                type="text"
                required
                value={newProd.sku}
                onChange={e => setNewProd({ ...newProd, sku: e.target.value })}
                placeholder="e.g. SKU-CH-001"
                className="w-full px-3 py-2 text-xs font-mono uppercase rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category (Foreign Key) *</label>
              <select
                required
                value={newProd.category_id}
                onChange={e => setNewProd({ ...newProd, category_id: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier (Foreign Key)</label>
              <select
                value={newProd.supplier_id}
                onChange={e => setNewProd({ ...newProd, supplier_id: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">None / Internal</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Selling Price (₹) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={newProd.unit_price}
                onChange={e => setNewProd({ ...newProd, unit_price: e.target.value })}
                placeholder="0.00"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Cost Price (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={newProd.cost_price}
                onChange={e => setNewProd({ ...newProd, cost_price: e.target.value })}
                placeholder="0.00"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Stock *</label>
              <input
                type="number"
                min="0"
                required
                value={newProd.current_stock}
                onChange={e => setNewProd({ ...newProd, current_stock: e.target.value })}
                placeholder="0"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reorder Level *</label>
              <input
                type="number"
                min="0"
                required
                value={newProd.reorder_level}
                onChange={e => setNewProd({ ...newProd, reorder_level: e.target.value })}
                placeholder="10"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Unit of Measure</label>
            <select
              value={newProd.unit_of_measure}
              onChange={e => setNewProd({ ...newProd, unit_of_measure: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
            >
              <option value="pcs">Pieces (pcs)</option>
              <option value="units">Units</option>
              <option value="boxes">Boxes</option>
              <option value="kg">Kilograms (kg)</option>
              <option value="liters">Liters</option>
              <option value="meters">Meters</option>
              <option value="sets">Sets</option>
              <option value="rolls">Rolls</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={newProd.description}
              onChange={e => setNewProd({ ...newProd, description: e.target.value })}
              placeholder="Specifications, notes, storage instructions..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setQuickProductOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
            >
              {loading ? 'Inserting Record...' : 'Insert Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Quick Record Movement Modal */}
      <Modal
        isOpen={quickMovementOpen}
        onClose={() => setQuickMovementOpen(false)}
        title="Record Stock Movement (ACID Transaction)"
        subtitle="Executes atomic stock balance updates and logs immutable transaction audit"
      >
        <form onSubmit={handleQuickMovementSubmit} className="space-y-4">
          {feedback && (
            <div className={`p-3 rounded-lg text-xs font-medium ${
              feedback.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}>
              {feedback.message}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Product *</label>
            <select
              required
              value={movement.productId}
              onChange={e => setMovement({ ...movement, productId: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku}) — Current Stock: {p.current_stock} {p.unit_of_measure}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Transaction Type *</label>
              <select
                required
                value={movement.transactionType}
                onChange={e => setMovement({ ...movement, transactionType: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              >
                <option value="STOCK_IN">STOCK IN (Receiving Inventory +)</option>
                <option value="STOCK_OUT">STOCK OUT (Order Dispatch / Sale -)</option>
                <option value="ADJUSTMENT">ADJUSTMENT (Audit Reconciliation =)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity *</label>
              <input
                type="number"
                min="1"
                required
                value={movement.quantity}
                onChange={e => setMovement({ ...movement, quantity: e.target.value })}
                placeholder="Number of units"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reference Number / PO</label>
              <input
                type="text"
                value={movement.referenceNo}
                onChange={e => setMovement({ ...movement, referenceNo: e.target.value })}
                placeholder="e.g. PO-2026-904"
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Movement Notes</label>
              <input
                type="text"
                value={movement.notes}
                onChange={e => setMovement({ ...movement, notes: e.target.value })}
                placeholder="Reason or destination"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-100 text-[11px] text-blue-900 leading-relaxed">
            <strong>DBMS Transaction Note:</strong> This triggers an atomic transaction. If <code className="font-mono">STOCK_OUT</code> exceeds current physical inventory, a PostgreSQL exception is raised and rolled back automatically.
          </div>

          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setQuickMovementOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
            >
              {loading ? 'Processing Transaction...' : 'Execute Transaction'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
