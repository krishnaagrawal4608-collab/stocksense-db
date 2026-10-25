import React, { useState, useEffect } from 'react';
import {
  fetchProducts,
  fetchCategories,
  fetchSuppliers,
  createProduct,
  updateProduct,
  deleteProduct
} from '../lib/databaseService';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import SqlCodeViewer from '../components/SqlCodeViewer';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Edit2,
  Trash2,
  AlertTriangle,
  Database,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export default function ProductsPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  // Data states
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'ALL');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Add/Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category_id: '',
    supplier_id: '',
    unit_of_measure: 'pcs',
    unit_price: '',
    cost_price: '',
    current_stock: '',
    reorder_level: '10',
    description: '',
    is_active: true
  });

  // Delete Dialog
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, product: null, loading: false });

  // SQL Query toggle
  const [showSqlViewer, setShowSqlViewer] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const [pRes, cRes, sRes] = await Promise.all([
        fetchProducts({
          categoryId: selectedCategory,
          status: selectedStatus,
          search: searchTerm,
          sortBy,
          sortOrder
        }),
        fetchCategories(),
        fetchSuppliers()
      ]);

      setProducts(pRes.data);
      setCategories(cRes.data);
      setSuppliers(sRes.data);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [selectedCategory, selectedStatus, sortBy, sortOrder]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
      setCurrentPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  function handleOpenAdd() {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: '',
      category_id: categories[0]?.id || '',
      supplier_id: '',
      unit_of_measure: 'pcs',
      unit_price: '',
      cost_price: '',
      current_stock: '',
      reorder_level: '10',
      description: '',
      is_active: true
    });
    setFormError('');
    setIsModalOpen(true);
  }

  function handleOpenEdit(product) {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      category_id: product.category_id,
      supplier_id: product.supplier_id || '',
      unit_of_measure: product.unit_of_measure,
      unit_price: product.unit_price,
      cost_price: product.cost_price || 0,
      current_stock: product.current_stock,
      reorder_level: product.reorder_level,
      description: product.description || '',
      is_active: product.is_active
    });
    setFormError('');
    setIsModalOpen(true);
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, formData);
      } else {
        await createProduct(formData, user?.id);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      setFormError(err.message || 'Operation failed.');
    } finally {
      setFormLoading(false);
    }
  }

  async function confirmDelete() {
    if (!deleteDialog.product) return;
    setDeleteDialog(prev => ({ ...prev, loading: true }));
    try {
      await deleteProduct(deleteDialog.product.id);
      setDeleteDialog({ isOpen: false, product: null, loading: false });
      loadData();
    } catch (err) {
      alert('Delete failed: ' + err.message);
      setDeleteDialog(prev => ({ ...prev, loading: false }));
    }
  }

  // Pagination calculation
  const totalPages = Math.ceil(products.length / pageSize) || 1;
  const paginatedProducts = products.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const activeSqlQuery = `SELECT 
    p.id, 
    p.name, 
    p.sku, 
    p.unit_price, 
    p.current_stock, 
    p.reorder_level, 
    c.name AS category_name, 
    s.name AS supplier_name,
    CASE 
        WHEN p.current_stock = 0 THEN 'Out of Stock'
        WHEN p.current_stock <= p.reorder_level THEN 'Low Stock'
        ELSE 'In Stock'
    END AS stock_status
FROM products p
JOIN categories c ON p.category_id = c.id
LEFT JOIN suppliers s ON p.supplier_id = s.id
${selectedCategory !== 'ALL' ? `WHERE p.category_id = '${selectedCategory}'` : ''}
ORDER BY p.${sortBy} ${sortOrder.toUpperCase()};`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Product Catalog &amp; Master Items</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-bold border border-blue-200">
              {products.length} Items Loaded
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Central inventory entity with referential keys, CHECK bounds, and SKU uniqueness.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSqlViewer(!showSqlViewer)}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors shadow-sm"
          >
            <Database className="w-3.5 h-3.5 text-blue-600" />
            <span>{showSqlViewer ? 'Hide SQL Query' : 'View SQL Query'}</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-500/20 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {showSqlViewer && (
        <SqlCodeViewer
          sql={activeSqlQuery}
          title="Active Filter &amp; Sort SQL Pipeline"
          explanation="Demonstrates dynamic query projection with conditional CASE for stock status, multi-table joins, and parameterized ORDER BY clause."
          defaultExpanded={true}
        />
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by name, SKU..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={e => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={selectedStatus}
            onChange={e => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Stock Statuses</option>
            <option value="in_stock">In Stock (Healthy)</option>
            <option value="low_stock">Low Stock (At / Below Reorder)</option>
            <option value="out_of_stock">Out of Stock (Zero Units)</option>
          </select>
        </div>

        {/* Sort */}
        <div className="flex items-center space-x-1">
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="created_at">Sort by Date Added</option>
            <option value="name">Sort by Product Name</option>
            <option value="unit_price">Sort by Price</option>
            <option value="current_stock">Sort by Quantity</option>
          </select>
          <button
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50"
            title={`Toggle Sort Order (${sortOrder.toUpperCase()})`}
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Products Table */}
      {loading ? (
        <LoadingSpinner message="Scanning Relational Products Table..." />
      ) : paginatedProducts.length === 0 ? (
        <EmptyState
          title="No products match your criteria"
          description="Adjust your search terms or filters, or add a new product to the catalog."
          actionLabel="Add New Product"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Product / SKU</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Supplier</th>
                  <th className="px-4 py-3 text-right">Price</th>
                  <th className="px-4 py-3 text-center">Stock Level</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Total Value</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {paginatedProducts.map(p => {
                  const isLow = p.current_stock <= p.reorder_level;
                  return (
                    <tr 
                      key={p.id} 
                      className={`hover:bg-slate-50/80 transition-colors ${isLow ? 'bg-amber-50/20' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{p.name}</div>
                        <div className="font-mono text-[10px] text-slate-400 flex items-center space-x-1">
                          <span>{p.sku}</span>
                          <span>&bull;</span>
                          <span>{p.unit_of_measure}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-slate-600 font-medium">
                        {p.category_name}
                      </td>

                      <td className="px-4 py-3 text-slate-500">
                        {p.supplier_name || 'N/A'}
                      </td>

                      <td className="px-4 py-3 text-right font-mono font-semibold text-slate-800">
                        ₹{Number(p.unit_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span className={`font-mono font-bold ${p.current_stock === 0 ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-slate-700'}`}>
                          {p.current_stock}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          Reorder at {p.reorder_level}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={p.stock_status} />
                      </td>

                      <td className="px-4 py-3 text-right font-mono text-slate-700">
                        ₹{(p.current_stock * p.unit_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteDialog({ isOpen: true, product: p, loading: false })}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <div>
              Showing <span className="font-semibold text-slate-700">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-semibold text-slate-700">{Math.min(currentPage * pageSize, products.length)}</span> of{' '}
              <span className="font-semibold text-slate-700">{products.length}</span> records
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 border border-slate-200 rounded-lg bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono text-slate-700">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 border border-slate-200 rounded-lg bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? `Edit Product: ${editingProduct.sku}` : 'Add New Inventory Product'}
        subtitle={editingProduct ? 'Updates product tuple in PostgreSQL' : 'Inserts tuple into products table with constraint validation'}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Product Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Product title"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                SKU (Unique Constraint) *
              </label>
              <input
                type="text"
                required
                disabled={Boolean(editingProduct)}
                value={formData.sku}
                onChange={e => setFormData({ ...formData, sku: e.target.value })}
                placeholder="SKU-XXX-001"
                className="w-full px-3 py-2 text-xs font-mono uppercase rounded-lg border border-slate-300 disabled:bg-slate-100 disabled:text-slate-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category (Foreign Key) *</label>
              <select
                required
                value={formData.category_id}
                onChange={e => setFormData({ ...formData, category_id: e.target.value })}
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
                value={formData.supplier_id}
                onChange={e => setFormData({ ...formData, supplier_id: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">None / Unassigned</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Unit Price (₹) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.unit_price}
                onChange={e => setFormData({ ...formData, unit_price: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Cost Price (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.cost_price}
                onChange={e => setFormData({ ...formData, cost_price: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {editingProduct ? 'Current Stock (Read-Only)' : 'Initial Stock *'}
              </label>
              <input
                type="number"
                min="0"
                required
                disabled={Boolean(editingProduct)}
                value={formData.current_stock}
                onChange={e => setFormData({ ...formData, current_stock: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 disabled:bg-slate-100 disabled:text-slate-500 focus:ring-2 focus:ring-blue-500"
              />
              {editingProduct && (
                <span className="text-[10px] text-slate-400">Stock updates require movement transactions</span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reorder Level *</label>
              <input
                type="number"
                min="0"
                required
                value={formData.reorder_level}
                onChange={e => setFormData({ ...formData, reorder_level: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Unit of Measurement</label>
            <select
              value={formData.unit_of_measure}
              onChange={e => setFormData({ ...formData, unit_of_measure: e.target.value })}
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
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
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
              {formLoading ? 'Executing SQL...' : editingProduct ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, product: null, loading: false })}
        onConfirm={confirmDelete}
        title={`Delete Product: ${deleteDialog.product?.name}?`}
        message={`This will execute DELETE FROM products WHERE id = '${deleteDialog.product?.id}'. Any associated inventory audit transactions will cascade or be maintained according to foreign key constraints.`}
        confirmText="Confirm Delete"
        isLoading={deleteDialog.loading}
      />
    </div>
  );
}
