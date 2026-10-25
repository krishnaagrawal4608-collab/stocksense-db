import React, { useState, useEffect } from 'react';
import {
  fetchTransactions,
  fetchProducts,
  recordStockMovement
} from '../lib/databaseService';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import SqlCodeViewer from '../components/SqlCodeViewer';
import {
  ArrowLeftRight,
  Plus,
  Filter,
  Database,
  Calendar,
  AlertTriangle,
  Lock,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from 'lucide-react';

export default function TransactionsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedProduct, setSelectedProduct] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [movementForm, setMovementForm] = useState({
    productId: '',
    transactionType: 'STOCK_IN',
    quantity: '',
    referenceNo: '',
    notes: '',
    unitCost: ''
  });

  // SQL toggle
  const [showSql, setShowSql] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const [tRes, pRes] = await Promise.all([
        fetchTransactions({ productId: selectedProduct, type: selectedType, limit: 100 }),
        fetchProducts()
      ]);
      setTransactions(tRes.data);
      setProducts(pRes.data);
      if (pRes.data.length > 0 && !movementForm.productId) {
        setMovementForm(prev => ({ ...prev, productId: pRes.data[0].id }));
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [selectedProduct, selectedType]);

  function handleOpenModal(type = 'STOCK_IN') {
    setMovementForm({
      productId: products[0]?.id || '',
      transactionType: type,
      quantity: '',
      referenceNo: '',
      notes: '',
      unitCost: ''
    });
    setFormError('');
    setIsModalOpen(true);
  }

  async function handleSubmitMovement(e) {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    try {
      await recordStockMovement({
        productId: movementForm.productId,
        transactionType: movementForm.transactionType,
        quantity: movementForm.quantity,
        referenceNo: movementForm.referenceNo,
        notes: movementForm.notes,
        unitCost: movementForm.unitCost,
        userId: user?.id
      });
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      setFormError(err.message || 'Transaction failed.');
    } finally {
      setFormLoading(false);
    }
  }

  const selectedProductObj = products.find(p => p.id === movementForm.productId);

  const transactionsSqlQuery = `SELECT 
    t.id AS txn_id,
    t.transaction_date,
    t.transaction_type,
    p.sku,
    p.name AS product_name,
    c.name AS category_name,
    t.quantity,
    t.previous_stock,
    t.new_stock,
    t.reference_no,
    t.notes
FROM inventory_transactions t
JOIN products p ON t.product_id = p.id
JOIN categories c ON p.category_id = c.id
${selectedProduct !== 'ALL' ? `WHERE t.product_id = '${selectedProduct}'` : ''}
ORDER BY t.transaction_date DESC
LIMIT 100;`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Stock Transactions</h1>
            <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Audit Ledger
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track and record all inbound, outbound, and inventory adjustment movements.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSql(!showSql)}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors shadow-sm"
          >
            <Database className="w-3.5 h-3.5 text-blue-600" />
            <span>{showSql ? 'Hide Query' : 'View SQL'}</span>
          </button>

          <button
            onClick={() => handleOpenModal('STOCK_IN')}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
          >
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>Stock In (+)</span>
          </button>

          <button
            onClick={() => handleOpenModal('STOCK_OUT')}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Stock Out (-)</span>
          </button>
        </div>
      </div>

      {showSql && (
        <SqlCodeViewer
          sql={transactionsSqlQuery}
          title="Audit Trail Multi-Table Join Query"
          explanation="Correlates immutable transaction records with product catalog and category metadata. Notice transactions cannot be updated or deleted by regular users."
          defaultExpanded={true}
        />
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Filter by Product</label>
          <select
            value={selectedProduct}
            onChange={e => setSelectedProduct(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Products (Full Audit)</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Movement Type</label>
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Movement Types</option>
            <option value="STOCK_IN">STOCK IN (Receiving / Replenishment)</option>
            <option value="STOCK_OUT">STOCK OUT (Order Fulfillment / Sale)</option>
            <option value="ADJUSTMENT">ADJUSTMENT (Cycle Count Reconciliation)</option>
          </select>
        </div>

        <div className="flex items-end">
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-center space-x-2 w-full">
            <Lock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span>Audit Integrity: Logs are append-only. Updates/Deletions blocked.</span>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      {loading ? (
        <LoadingSpinner message="Scanning Immutable Transaction Ledger..." />
      ) : transactions.length === 0 ? (
        <EmptyState
          title="No transactions found"
          description="Record a Stock In or Stock Out movement to initiate the audit trail."
          actionLabel="Record Movement"
          onAction={() => handleOpenModal('STOCK_IN')}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Date &amp; Time</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Product Name &amp; SKU</th>
                  <th className="px-4 py-3 text-right">Movement Qty</th>
                  <th className="px-4 py-3 text-center">Stock Transition</th>
                  <th className="px-4 py-3">Reference / PO</th>
                  <th className="px-4 py-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {transactions.map(txn => (
                  <tr key={txn.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap font-mono text-[11px]">
                      {new Date(txn.transaction_date).toLocaleDateString()}{' '}
                      <span className="text-slate-400">
                        {new Date(txn.transaction_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={txn.transaction_type} type="transaction" />
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{txn.product_name}</div>
                      <div className="font-mono text-[10px] text-slate-400">{txn.product_sku}</div>
                    </td>

                    <td className="px-4 py-3 text-right font-mono font-bold whitespace-nowrap">
                      <span className={
                        txn.transaction_type === 'STOCK_IN' 
                          ? 'text-emerald-600' 
                          : txn.transaction_type === 'STOCK_OUT' 
                            ? 'text-rose-600' 
                            : 'text-amber-600'
                      }>
                        {txn.transaction_type === 'STOCK_IN' ? '+' : txn.transaction_type === 'STOCK_OUT' ? '-' : '='}
                        {txn.quantity}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center font-mono text-slate-600 whitespace-nowrap">
                      <span className="text-slate-400">{txn.previous_stock}</span>
                      <span className="mx-1 text-slate-400">→</span>
                      <span className="font-bold text-slate-900">{txn.new_stock}</span>
                    </td>

                    <td className="px-4 py-3 font-mono text-slate-500 whitespace-nowrap">
                      {txn.reference_no || 'MANUAL'}
                    </td>

                    <td className="px-4 py-3 text-slate-500 max-w-xs truncate" title={txn.notes}>
                      {txn.notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Movement Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Stock Movement (ACID Transaction)"
        subtitle="Invokes stored procedure record_stock_movement with row locking and atomicity"
      >
        <form onSubmit={handleSubmitMovement} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Product *</label>
            <select
              required
              value={movementForm.productId}
              onChange={e => setMovementForm({ ...movementForm, productId: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku}) — Available: {p.current_stock} {p.unit_of_measure}
                </option>
              ))}
            </select>
          </div>

          {selectedProductObj && (
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
              <div>
                <span className="text-slate-500">Current Stock Balance:</span>
                <span className="font-mono font-bold text-slate-900 ml-1.5">
                  {selectedProductObj.current_stock} {selectedProductObj.unit_of_measure}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Reorder Threshold:</span>
                <span className="font-mono font-semibold text-amber-600 ml-1.5">
                  {selectedProductObj.reorder_level} {selectedProductObj.unit_of_measure}
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Transaction Type *</label>
              <select
                required
                value={movementForm.transactionType}
                onChange={e => setMovementForm({ ...movementForm, transactionType: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              >
                <option value="STOCK_IN">STOCK IN (Receiving Inventory +)</option>
                <option value="STOCK_OUT">STOCK OUT (Order Fulfillment / Sale -)</option>
                <option value="ADJUSTMENT">ADJUSTMENT (Absolute Count Reconciliation =)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {movementForm.transactionType === 'ADJUSTMENT' ? 'New Reconciled Stock Quantity *' : 'Quantity to Move *'}
              </label>
              <input
                type="number"
                min="1"
                required
                value={movementForm.quantity}
                onChange={e => setMovementForm({ ...movementForm, quantity: e.target.value })}
                placeholder="Number of units"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reference No / PO / Dispatch ID</label>
              <input
                type="text"
                value={movementForm.referenceNo}
                onChange={e => setMovementForm({ ...movementForm, referenceNo: e.target.value })}
                placeholder="e.g. PO-2026-880"
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Unit Cost at Movement (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={movementForm.unitCost}
                onChange={e => setMovementForm({ ...movementForm, unitCost: e.target.value })}
                placeholder="0.00"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Audit Purpose</label>
            <textarea
              rows={2}
              value={movementForm.notes}
              onChange={e => setMovementForm({ ...movementForm, notes: e.target.value })}
              placeholder="Destination department, supplier invoice number, or inspection remarks..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
            >
              {formLoading ? 'Executing Atomic Procedure...' : 'Commit Transaction'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
