import React, { useState, useEffect } from 'react';
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  fetchProducts
} from '../lib/databaseService';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import SqlCodeViewer from '../components/SqlCodeViewer';
import { Layers, Plus, Search, Edit2, Trash2, Database, AlertCircle } from 'lucide-react';

export default function CategoriesPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', code: '', description: '' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete Dialog
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, category: null, loading: false });

  // SQL toggle
  const [showSql, setShowSql] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const [cRes, pRes] = await Promise.all([fetchCategories(), fetchProducts()]);
      setCategories(cRes.data);
      setProducts(pRes.data);
    } catch (err) {
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Compute product count per category
  const productCountMap = {};
  products.forEach(p => {
    productCountMap[p.category_id] = (productCountMap[p.category_id] || 0) + 1;
  });

  function handleOpenAdd() {
    setEditingCategory(null);
    setFormData({ name: '', code: '', description: '' });
    setFormError('');
    setIsModalOpen(true);
  }

  function handleOpenEdit(cat) {
    setEditingCategory(cat);
    setFormData({ name: cat.name, code: cat.code, description: cat.description || '' });
    setFormError('');
    setIsModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
      } else {
        await createCategory(formData, user?.id);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      setFormError(err.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (!deleteDialog.category) return;
    setDeleteDialog(prev => ({ ...prev, loading: true }));
    try {
      await deleteCategory(deleteDialog.category.id);
      setDeleteDialog({ isOpen: false, category: null, loading: false });
      loadData();
    } catch (err) {
      alert(err.message);
      setDeleteDialog(prev => ({ ...prev, loading: false }));
    }
  }

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categoriesSqlQuery = `SELECT 
    c.id, 
    c.name, 
    c.code, 
    c.description, 
    COUNT(p.id) AS assigned_products
FROM categories c
LEFT JOIN products p ON c.id = p.category_id
GROUP BY c.id, c.name, c.code, c.description
ORDER BY c.name ASC;`;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Categories</h1>
            <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {categories.length} Categories
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Organize products into logical classifications and taxonomies.
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
            onClick={handleOpenAdd}
            className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-500/20 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {showSql && (
        <SqlCodeViewer
          sql={categoriesSqlQuery}
          title="Categories Dimension Join with LEFT JOIN &amp; GROUP BY"
          explanation="Demonstrates aggregate product assignment count using LEFT JOIN to retain categories with 0 assigned products."
          defaultExpanded={true}
        />
      )}

      {/* Search Input */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm max-w-md">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search categories by name, code..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Grid of Categories */}
      {loading ? (
        <LoadingSpinner message="Querying Categories Dimension..." />
      ) : filteredCategories.length === 0 ? (
        <EmptyState
          title="No categories found"
          description="Create a category to group products and maintain clean 3NF database design."
          actionLabel="Add Category"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map(cat => {
            const count = productCountMap[cat.id] || 0;
            return (
              <div 
                key={cat.id} 
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                        {cat.code}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-2">{cat.name}</h3>
                    </div>
                    <div className="p-2 rounded-lg bg-teal-50 text-teal-600 border border-teal-100">
                      <Layers className="w-4 h-4" />
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {cat.description || 'No description provided.'}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">
                    <span className="font-mono text-blue-600 font-bold">{count}</span> Products Linked
                  </span>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Category"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteDialog({ isOpen: true, category: cat, loading: false })}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? `Edit Category: ${editingCategory.name}` : 'Add New Category'}
        subtitle="Maintains unique name and unique code constraints in PostgreSQL"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Electrical Components"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category Code (UNIQUE Constraint) *
            </label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="e.g. CAT-ELEC"
              className="w-full px-3 py-2 text-xs font-mono uppercase rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Scope and item classification rules..."
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
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
            >
              {submitting ? 'Executing SQL...' : editingCategory ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Safeguard Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, category: null, loading: false })}
        onConfirm={confirmDelete}
        title={`Delete Category "${deleteDialog.category?.name}"?`}
        message={`This executes DELETE FROM categories WHERE id = '${deleteDialog.category?.id}'. Referential integrity rules (ON DELETE RESTRICT) will automatically abort the deletion if any product still references this category.`}
        confirmText="Execute DELETE"
        isLoading={deleteDialog.loading}
      />
    </div>
  );
}
