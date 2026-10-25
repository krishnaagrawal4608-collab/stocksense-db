import React, { useState, useEffect } from 'react';
import {
  fetchSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  fetchProducts
} from '../lib/databaseService';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import SqlCodeViewer from '../components/SqlCodeViewer';
import { Truck, Plus, Search, Edit2, Trash2, Database, Mail, Phone, MapPin, User } from 'lucide-react';

export default function SuppliersPage() {
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Add/Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'India'
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete Dialog
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, supplier: null, loading: false });

  // SQL toggle
  const [showSql, setShowSql] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const [sRes, pRes] = await Promise.all([fetchSuppliers(), fetchProducts()]);
      setSuppliers(sRes.data);
      setProducts(pRes.data);
    } catch (err) {
      console.error('Error loading suppliers:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Compute products supplied per supplier
  const supplierProductCountMap = {};
  products.forEach(p => {
    if (p.supplier_id) {
      supplierProductCountMap[p.supplier_id] = (supplierProductCountMap[p.supplier_id] || 0) + 1;
    }
  });

  function handleOpenAdd() {
    setEditingSupplier(null);
    setFormData({
      name: '',
      contact_person: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      country: 'India'
    });
    setFormError('');
    setIsModalOpen(true);
  }

  function handleOpenEdit(sup) {
    setEditingSupplier(sup);
    setFormData({
      name: sup.name,
      contact_person: sup.contact_person || '',
      email: sup.email || '',
      phone: sup.phone || '',
      address: sup.address || '',
      city: sup.city || '',
      country: sup.country || 'India'
    });
    setFormError('');
    setIsModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      if (editingSupplier) {
        await updateSupplier(editingSupplier.id, formData);
      } else {
        await createSupplier(formData, user?.id);
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
    if (!deleteDialog.supplier) return;
    setDeleteDialog(prev => ({ ...prev, loading: true }));
    try {
      await deleteSupplier(deleteDialog.supplier.id);
      setDeleteDialog({ isOpen: false, supplier: null, loading: false });
      loadData();
    } catch (err) {
      alert(err.message);
      setDeleteDialog(prev => ({ ...prev, loading: false }));
    }
  }

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const suppliersSqlQuery = `SELECT 
    s.id, 
    s.name, 
    s.contact_person, 
    s.email, 
    s.phone, 
    s.city, 
    COUNT(p.id) AS products_supplied
FROM suppliers s
LEFT JOIN products p ON s.id = p.supplier_id
GROUP BY s.id, s.name, s.contact_person, s.email, s.phone, s.city
ORDER BY s.name ASC;`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Suppliers</h1>
            <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {suppliers.length} Suppliers
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage procurement vendors, contact information, and supplied catalog items.
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
            <span>Add Supplier</span>
          </button>
        </div>
      </div>

      {showSql && (
        <SqlCodeViewer
          sql={suppliersSqlQuery}
          title="Suppliers &amp; Procured Items LEFT JOIN"
          explanation="Calculates procurement coverage per supplier. ON DELETE SET NULL ensures deleting a vendor does not delete items from catalog."
          defaultExpanded={true}
        />
      )}

      {/* Search */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm max-w-md">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search suppliers by name, contact, city..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Suppliers Grid */}
      {loading ? (
        <LoadingSpinner message="Scanning Suppliers Table..." />
      ) : filteredSuppliers.length === 0 ? (
        <EmptyState
          title="No suppliers found"
          description="Register suppliers to associate products with vendors."
          actionLabel="Add Supplier"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSuppliers.map(sup => {
            const count = supplierProductCountMap[sup.id] || 0;
            return (
              <div 
                key={sup.id} 
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{sup.name}</h3>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        ID: {sup.id.slice(0, 8)}...
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
                      <Truck className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-xs text-slate-600">
                    {sup.contact_person && (
                      <div className="flex items-center space-x-2">
                        <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>{sup.contact_person}</span>
                      </div>
                    )}
                    {sup.email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{sup.email}</span>
                      </div>
                    )}
                    {sup.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>{sup.phone}</span>
                      </div>
                    )}
                    {(sup.city || sup.address) && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{[sup.address, sup.city, sup.country].filter(Boolean).join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">
                    <span className="font-mono text-indigo-600 font-bold">{count}</span> Products Supplied
                  </span>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEdit(sup)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Supplier"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteDialog({ isOpen: true, supplier: sup, loading: false })}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Supplier"
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

      {/* Add / Edit Supplier Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSupplier ? `Edit Supplier: ${editingSupplier.name}` : 'Add New Supplier'}
        subtitle="Inserts or updates vendor tuple in PostgreSQL suppliers relation"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Supplier Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Apex Hardware Components"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Person</label>
              <input
                type="text"
                value={formData.contact_person}
                onChange={e => setFormData({ ...formData, contact_person: e.target.value })}
                placeholder="Manager name"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98450 12345"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="orders@supplier.com"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g. Pune, Bangalore, Mumbai"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Address</label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              placeholder="Plot, Street, Industrial Area..."
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
              {submitting ? 'Executing SQL...' : editingSupplier ? 'Update Supplier' : 'Create Supplier'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, supplier: null, loading: false })}
        onConfirm={confirmDelete}
        title={`Delete Supplier "${deleteDialog.supplier?.name}"?`}
        message={`This will execute DELETE FROM suppliers WHERE id = '${deleteDialog.supplier?.id}'. In PostgreSQL, foreign keys use ON DELETE SET NULL, meaning products referencing this supplier will have their supplier_id set to NULL without corrupting product data.`}
        confirmText="Confirm Delete"
        isLoading={deleteDialog.loading}
      />
    </div>
  );
}
