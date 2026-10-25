import { supabase, isSupabaseConfigured } from './supabase';
import {
  INITIAL_CATEGORIES,
  INITIAL_SUPPLIERS,
  INITIAL_PRODUCTS,
  INITIAL_TRANSACTIONS
} from './sampleData';

// Local relational cache key for demo / fallback mode
const STORAGE_PREFIX = 'stocksense_db_';

function getLocalStore(key, initialData) {
  if (typeof window === 'undefined') return initialData;
  const raw = localStorage.getItem(STORAGE_PREFIX + key);
  if (!raw) {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(initialData));
    return initialData;
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    return initialData;
  }
}

function setLocalStore(key, data) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  }
}

// -------------------------------------------------------------
// CATEGORIES SERVICE
// -------------------------------------------------------------
export async function fetchCategories(userId) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return { data: data || [], source: 'supabase' };
    } catch (err) {
      console.warn('Supabase fetchCategories failed, falling back to local database store:', err.message);
    }
  }

  const list = getLocalStore('categories', INITIAL_CATEGORIES);
  return { data: list, source: 'local' };
}

export async function createCategory(categoryData, userId) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ ...categoryData, user_id: userId }])
        .select()
        .single();
      if (error) throw error;
      return { data, source: 'supabase' };
    } catch (err) {
      console.warn('Supabase createCategory error, saving locally:', err.message);
    }
  }

  const list = getLocalStore('categories', INITIAL_CATEGORIES);
  // Uniqueness check
  if (list.some(c => c.name.toLowerCase() === categoryData.name.toLowerCase())) {
    throw new Error(`Category with name "${categoryData.name}" already exists.`);
  }
  if (list.some(c => c.code.toUpperCase() === categoryData.code.toUpperCase())) {
    throw new Error(`Category with code "${categoryData.code}" already exists.`);
  }

  const newCat = {
    id: 'cat_' + Date.now(),
    user_id: userId || 'local_user',
    ...categoryData,
    code: categoryData.code.toUpperCase(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  list.push(newCat);
  setLocalStore('categories', list);
  return { data: newCat, source: 'local' };
}

export async function updateCategory(id, categoryData) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update({ ...categoryData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return { data, source: 'supabase' };
    } catch (err) {
      console.warn('Supabase updateCategory error:', err.message);
    }
  }

  const list = getLocalStore('categories', INITIAL_CATEGORIES);
  const idx = list.findIndex(c => c.id === id);
  if (idx === -1) throw new Error('Category not found');
  list[idx] = { ...list[idx], ...categoryData, updated_at: new Date().toISOString() };
  setLocalStore('categories', list);
  return { data: list[idx], source: 'local' };
}

export async function deleteCategory(id) {
  // Check if any product references this category (Foreign Key RESTRICT rule)
  const productsResult = await fetchProducts();
  const assigned = productsResult.data.filter(p => p.category_id === id);
  if (assigned.length > 0) {
    throw new Error(`Referential Integrity Violation: Cannot delete category. ${assigned.length} product(s) reference this category.`);
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      return { success: true, source: 'supabase' };
    } catch (err) {
      console.warn('Supabase deleteCategory error:', err.message);
    }
  }

  const list = getLocalStore('categories', INITIAL_CATEGORIES).filter(c => c.id !== id);
  setLocalStore('categories', list);
  return { success: true, source: 'local' };
}

// -------------------------------------------------------------
// SUPPLIERS SERVICE
// -------------------------------------------------------------
export async function fetchSuppliers(userId) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return { data: data || [], source: 'supabase' };
    } catch (err) {
      console.warn('Supabase fetchSuppliers error:', err.message);
    }
  }

  const list = getLocalStore('suppliers', INITIAL_SUPPLIERS);
  return { data: list, source: 'local' };
}

export async function createSupplier(supplierData, userId) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .insert([{ ...supplierData, user_id: userId }])
        .select()
        .single();
      if (error) throw error;
      return { data, source: 'supabase' };
    } catch (err) {
      console.warn('Supabase createSupplier error:', err.message);
    }
  }

  const list = getLocalStore('suppliers', INITIAL_SUPPLIERS);
  if (list.some(s => s.name.toLowerCase() === supplierData.name.toLowerCase())) {
    throw new Error(`Supplier with name "${supplierData.name}" already exists.`);
  }

  const newSupplier = {
    id: 'sup_' + Date.now(),
    user_id: userId || 'local_user',
    ...supplierData,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  list.push(newSupplier);
  setLocalStore('suppliers', list);
  return { data: newSupplier, source: 'local' };
}

export async function updateSupplier(id, supplierData) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .update({ ...supplierData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return { data, source: 'supabase' };
    } catch (err) {
      console.warn('Supabase updateSupplier error:', err.message);
    }
  }

  const list = getLocalStore('suppliers', INITIAL_SUPPLIERS);
  const idx = list.findIndex(s => s.id === id);
  if (idx === -1) throw new Error('Supplier not found');
  list[idx] = { ...list[idx], ...supplierData, updated_at: new Date().toISOString() };
  setLocalStore('suppliers', list);
  return { data: list[idx], source: 'local' };
}

export async function deleteSupplier(id) {
  if (isSupabaseConfigured && supabase) {
    try {
      // In PostgreSQL schema: supplier_id ON DELETE SET NULL
      const { error } = await supabase.from('suppliers').delete().eq('id', id);
      if (error) throw error;
      return { success: true, source: 'supabase' };
    } catch (err) {
      console.warn('Supabase deleteSupplier error:', err.message);
    }
  }

  // Set supplier_id to null on products (ON DELETE SET NULL)
  const products = getLocalStore('products', INITIAL_PRODUCTS);
  const updatedProducts = products.map(p => p.supplier_id === id ? { ...p, supplier_id: null } : p);
  setLocalStore('products', updatedProducts);

  const list = getLocalStore('suppliers', INITIAL_SUPPLIERS).filter(s => s.id !== id);
  setLocalStore('suppliers', list);
  return { success: true, source: 'local' };
}

// -------------------------------------------------------------
// PRODUCTS SERVICE
// -------------------------------------------------------------
export async function fetchProducts(filters = {}) {
  const { categoryId, status, search, sortBy = 'created_at', sortOrder = 'desc' } = filters;

  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          category:categories(id, name, code),
          supplier:suppliers(id, name, email, phone)
        `);

      if (categoryId && categoryId !== 'ALL') {
        query = query.eq('category_id', categoryId);
      }
      if (search && search.trim()) {
        const s = `%${search.trim()}%`;
        query = query.or(`name.ilike.${s},sku.ilike.${s}`);
      }

      const { data, error } = await query.order(sortBy, { ascending: sortOrder === 'asc' });
      if (error) throw error;

      let filteredData = (data || []).map(p => ({
        ...p,
        category_name: p.category?.name || 'Uncategorized',
        category_code: p.category?.code || '',
        supplier_name: p.supplier?.name || 'None',
        total_value: Number((p.current_stock * p.unit_price).toFixed(2)),
        stock_status: p.current_stock <= 0 ? 'Out of Stock' : (p.current_stock <= p.reorder_level ? 'Low Stock' : 'In Stock')
      }));

      if (status && status !== 'ALL') {
        filteredData = filteredData.filter(p => p.stock_status.toLowerCase().replace(/\s+/g, '_') === status.toLowerCase());
      }

      return { data: filteredData, source: 'supabase' };
    } catch (err) {
      console.warn('Supabase fetchProducts error, falling back to local database store:', err.message);
    }
  }

  // Local fallback with simulated relational joins (Products + Categories + Suppliers)
  const products = getLocalStore('products', INITIAL_PRODUCTS);
  const categories = getLocalStore('categories', INITIAL_CATEGORIES);
  const suppliers = getLocalStore('suppliers', INITIAL_SUPPLIERS);

  const catMap = Object.fromEntries(categories.map(c => [c.id, c]));
  const supMap = Object.fromEntries(suppliers.map(s => [s.id, s]));

  let enriched = products.map(p => {
    const cat = catMap[p.category_id];
    const sup = supMap[p.supplier_id];
    const stock_status = p.current_stock <= 0 ? 'Out of Stock' : (p.current_stock <= p.reorder_level ? 'Low Stock' : 'In Stock');
    return {
      ...p,
      category_name: cat ? cat.name : 'Uncategorized',
      category_code: cat ? cat.code : '',
      supplier_name: sup ? sup.name : 'None',
      supplier_phone: sup ? sup.phone : '',
      total_value: Number((p.current_stock * p.unit_price).toFixed(2)),
      stock_status
    };
  });

  // Filters
  if (categoryId && categoryId !== 'ALL') {
    enriched = enriched.filter(p => p.category_id === categoryId);
  }
  if (status && status !== 'ALL') {
    enriched = enriched.filter(p => p.stock_status.toLowerCase().replace(/\s+/g, '_') === status.toLowerCase());
  }
  if (search && search.trim()) {
    const term = search.toLowerCase().trim();
    enriched = enriched.filter(p => 
      p.name.toLowerCase().includes(term) || 
      p.sku.toLowerCase().includes(term) ||
      p.description?.toLowerCase().includes(term)
    );
  }

  // Sort
  enriched.sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return { data: enriched, source: 'local' };
}

export async function createProduct(productData, userId) {
  // Numeric constraints check (DBMS CHECK constraints)
  if (Number(productData.unit_price) < 0) {
    throw new Error('CHECK Constraint Violation: Unit price cannot be negative.');
  }
  if (Number(productData.current_stock) < 0) {
    throw new Error('CHECK Constraint Violation: Current stock cannot be negative.');
  }
  if (Number(productData.reorder_level) < 0) {
    throw new Error('CHECK Constraint Violation: Reorder level cannot be negative.');
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const payload = {
        user_id: userId,
        category_id: productData.category_id,
        supplier_id: productData.supplier_id || null,
        name: productData.name.trim(),
        sku: productData.sku.trim().toUpperCase(),
        description: productData.description || '',
        unit_of_measure: productData.unit_of_measure || 'pcs',
        unit_price: Number(productData.unit_price),
        cost_price: Number(productData.cost_price || 0),
        current_stock: parseInt(productData.current_stock, 10),
        reorder_level: parseInt(productData.reorder_level, 10),
        is_active: productData.is_active !== false
      };

      const { data, error } = await supabase.from('products').insert([payload]).select().single();
      if (error) {
        if (error.code === '23505') throw new Error(`UNIQUE Constraint Violation: SKU "${payload.sku}" already exists.`);
        throw error;
      }

      // Record initial transaction if stock > 0
      if (payload.current_stock > 0) {
        await supabase.from('inventory_transactions').insert([{
          user_id: userId,
          product_id: data.id,
          transaction_type: 'STOCK_IN',
          quantity: payload.current_stock,
          previous_stock: 0,
          new_stock: payload.current_stock,
          unit_cost: payload.cost_price,
          reference_no: 'INIT-SETUP',
          notes: 'Initial inventory quantity logged on product creation'
        }]);
      }

      return { data, source: 'supabase' };
    } catch (err) {
      console.warn('Supabase createProduct error:', err.message);
      if (err.message.includes('Constraint Violation')) throw err;
    }
  }

  // Local fallback
  const products = getLocalStore('products', INITIAL_PRODUCTS);
  const skuUpper = productData.sku.trim().toUpperCase();
  if (products.some(p => p.sku.toUpperCase() === skuUpper)) {
    throw new Error(`UNIQUE Constraint Violation: Product SKU "${skuUpper}" already exists.`);
  }

  const initialStock = parseInt(productData.current_stock || 0, 10);
  const newProduct = {
    id: 'prod_' + Date.now(),
    user_id: userId || 'local_user',
    category_id: productData.category_id,
    supplier_id: productData.supplier_id || null,
    name: productData.name.trim(),
    sku: skuUpper,
    description: productData.description || '',
    unit_of_measure: productData.unit_of_measure || 'pcs',
    unit_price: Number(productData.unit_price),
    cost_price: Number(productData.cost_price || 0),
    current_stock: initialStock,
    reorder_level: parseInt(productData.reorder_level || 10, 10),
    is_active: productData.is_active !== false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  products.push(newProduct);
  setLocalStore('products', products);

  if (initialStock > 0) {
    const txns = getLocalStore('transactions', INITIAL_TRANSACTIONS);
    txns.unshift({
      id: 'txn_' + Date.now(),
      user_id: userId || 'local_user',
      product_id: newProduct.id,
      transaction_type: 'STOCK_IN',
      quantity: initialStock,
      previous_stock: 0,
      new_stock: initialStock,
      unit_cost: newProduct.cost_price,
      reference_no: 'INIT-SETUP',
      notes: 'Initial inventory opening balance',
      transaction_date: new Date().toISOString(),
      created_at: new Date().toISOString()
    });
    setLocalStore('transactions', txns);
  }

  return { data: newProduct, source: 'local' };
}

export async function updateProduct(id, productData) {
  if (Number(productData.unit_price) < 0) {
    throw new Error('CHECK Constraint: Unit price cannot be negative.');
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({
          name: productData.name,
          category_id: productData.category_id,
          supplier_id: productData.supplier_id || null,
          description: productData.description,
          unit_of_measure: productData.unit_of_measure,
          unit_price: Number(productData.unit_price),
          cost_price: Number(productData.cost_price || 0),
          reorder_level: parseInt(productData.reorder_level, 10),
          is_active: productData.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return { data, source: 'supabase' };
    } catch (err) {
      console.warn('Supabase updateProduct error:', err.message);
    }
  }

  const products = getLocalStore('products', INITIAL_PRODUCTS);
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) throw new Error('Product not found');

  products[idx] = {
    ...products[idx],
    name: productData.name,
    category_id: productData.category_id,
    supplier_id: productData.supplier_id || null,
    description: productData.description,
    unit_of_measure: productData.unit_of_measure,
    unit_price: Number(productData.unit_price),
    cost_price: Number(productData.cost_price || 0),
    reorder_level: parseInt(productData.reorder_level, 10),
    is_active: productData.is_active,
    updated_at: new Date().toISOString()
  };

  setLocalStore('products', products);
  return { data: products[idx], source: 'local' };
}

export async function deleteProduct(id) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      return { success: true, source: 'supabase' };
    } catch (err) {
      console.warn('Supabase deleteProduct error:', err.message);
    }
  }

  const products = getLocalStore('products', INITIAL_PRODUCTS).filter(p => p.id !== id);
  setLocalStore('products', products);
  return { success: true, source: 'local' };
}

// -------------------------------------------------------------
// INVENTORY TRANSACTIONS SERVICE (ACID Movement Logger)
// -------------------------------------------------------------
export async function fetchTransactions(filters = {}) {
  const { productId, type, limit = 50 } = filters;

  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase
        .from('inventory_transactions')
        .select(`
          *,
          product:products(id, name, sku, category:categories(name))
        `)
        .order('transaction_date', { ascending: false })
        .limit(limit);

      if (productId && productId !== 'ALL') {
        query = query.eq('product_id', productId);
      }
      if (type && type !== 'ALL') {
        query = query.eq('transaction_type', type);
      }

      const { data, error } = await query;
      if (error) throw error;

      const formatted = (data || []).map(t => ({
        ...t,
        product_name: t.product?.name || 'Unknown Product',
        product_sku: t.product?.sku || 'N/A',
        category_name: t.product?.category?.name || 'N/A'
      }));

      return { data: formatted, source: 'supabase' };
    } catch (err) {
      console.warn('Supabase fetchTransactions error, falling back locally:', err.message);
    }
  }

  // Local fallback
  const txns = getLocalStore('transactions', INITIAL_TRANSACTIONS);
  const products = getLocalStore('products', INITIAL_PRODUCTS);
  const categories = getLocalStore('categories', INITIAL_CATEGORIES);

  const prodMap = Object.fromEntries(products.map(p => [p.id, p]));
  const catMap = Object.fromEntries(categories.map(c => [c.id, c]));

  let enriched = txns.map(t => {
    const prod = prodMap[t.product_id];
    const cat = prod ? catMap[prod.category_id] : null;
    return {
      ...t,
      product_name: prod ? prod.name : 'Unknown Product',
      product_sku: prod ? prod.sku : 'N/A',
      category_name: cat ? cat.name : 'N/A'
    };
  });

  if (productId && productId !== 'ALL') {
    enriched = enriched.filter(t => t.product_id === productId);
  }
  if (type && type !== 'ALL') {
    enriched = enriched.filter(t => t.transaction_type === type);
  }

  enriched.sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));
  return { data: enriched.slice(0, limit), source: 'local' };
}

/**
 * Executes atomic stock transaction demonstrating ACID Isolation & Atomicity
 */
export async function recordStockMovement({
  productId,
  transactionType,
  quantity,
  referenceNo = '',
  notes = '',
  unitCost = 0,
  userId
}) {
  const qty = parseInt(quantity, 10);
  if (isNaN(qty) || qty <= 0) {
    throw new Error('Validation Error: Quantity must be a positive integer greater than zero.');
  }

  // If Supabase is connected, call the stored function `record_stock_movement`
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.rpc('record_stock_movement', {
        p_product_id: productId,
        p_transaction_type: transactionType,
        p_quantity: qty,
        p_reference_no: referenceNo || null,
        p_notes: notes || null,
        p_unit_cost: unitCost ? Number(unitCost) : null
      });

      if (error) {
        throw new Error(error.message);
      }
      return { success: true, data, source: 'supabase_rpc' };
    } catch (err) {
      console.warn('Supabase RPC call failed, executing local atomic procedure:', err.message);
      if (err.message.includes('Insufficient stock')) throw err;
    }
  }

  // Local ACID-simulated transaction logic
  const products = getLocalStore('products', INITIAL_PRODUCTS);
  const pIndex = products.findIndex(p => p.id === productId);
  if (pIndex === -1) {
    throw new Error(`Product ID ${productId} not found.`);
  }

  const targetProd = products[pIndex];
  const prevStock = targetProd.current_stock;
  let newStock = prevStock;

  if (transactionType === 'STOCK_IN') {
    newStock = prevStock + qty;
  } else if (transactionType === 'STOCK_OUT') {
    if (prevStock < qty) {
      throw new Error(`Database Business Rule Violation: Insufficient stock for "${targetProd.name}". Current stock is ${prevStock}, requested reduction is ${qty}.`);
    }
    newStock = prevStock - qty;
  } else if (transactionType === 'ADJUSTMENT') {
    newStock = qty; // In adjustment, quantity is the new target count
  } else {
    throw new Error(`Invalid transaction type "${transactionType}".`);
  }

  // 1. Update product current_stock
  products[pIndex] = {
    ...targetProd,
    current_stock: newStock,
    updated_at: new Date().toISOString()
  };
  setLocalStore('products', products);

  // 2. Insert into immutable transactions ledger
  const txns = getLocalStore('transactions', INITIAL_TRANSACTIONS);
  const newTxn = {
    id: 'txn_' + Date.now(),
    user_id: userId || 'local_user',
    product_id: productId,
    transaction_type: transactionType,
    quantity: qty,
    previous_stock: prevStock,
    new_stock: newStock,
    unit_cost: Number(unitCost || targetProd.cost_price || 0),
    reference_no: referenceNo || `TXN-${Date.now().toString().slice(-6)}`,
    notes: notes || `${transactionType} transaction recorded`,
    transaction_date: new Date().toISOString(),
    created_at: new Date().toISOString()
  };
  txns.unshift(newTxn);
  setLocalStore('transactions', txns);

  return {
    success: true,
    data: {
      transaction_id: newTxn.id,
      product_name: targetProd.name,
      previous_stock: prevStock,
      new_stock: newStock,
      quantity: qty
    },
    source: 'local'
  };
}

// -------------------------------------------------------------
// DASHBOARD & REPORTS METRICS (SQL Aggregation Engines)
// -------------------------------------------------------------
export async function getDashboardMetrics() {
  const [productsRes, categoriesRes, suppliersRes, transactionsRes] = await Promise.all([
    fetchProducts(),
    fetchCategories(),
    fetchSuppliers(),
    fetchTransactions({ limit: 10 })
  ]);

  const products = productsRes.data;
  const categories = categoriesRes.data;
  const suppliers = suppliersRes.data;
  const recentTransactions = transactionsRes.data;

  // Real SQL Aggregations:
  // SELECT COUNT(*) FROM products WHERE is_active = true;
  const totalProducts = products.filter(p => p.is_active).length;

  // SELECT COUNT(*) FROM categories;
  const totalCategories = categories.length;

  // SELECT COUNT(*) FROM suppliers;
  const totalSuppliers = suppliers.length;

  // SELECT COUNT(*) FROM products WHERE current_stock > 0 AND current_stock <= reorder_level;
  const lowStockProducts = products.filter(p => p.current_stock > 0 && p.current_stock <= p.reorder_level);

  // SELECT COUNT(*) FROM products WHERE current_stock = 0;
  const outOfStockProducts = products.filter(p => p.current_stock === 0);

  // SELECT SUM(current_stock * unit_price) FROM products;
  const totalInventoryValue = products.reduce((sum, p) => sum + (p.current_stock * p.unit_price), 0);

  // Category Distribution (DBMS GROUP BY category_name)
  const categoryCounts = {};
  const categoryValues = {};
  products.forEach(p => {
    const cat = p.category_name || 'Other';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    categoryValues[cat] = (categoryValues[cat] || 0) + (p.current_stock * p.unit_price);
  });

  const categoryDistribution = Object.keys(categoryCounts).map(catName => ({
    name: catName,
    count: categoryCounts[catName],
    value: Number(categoryValues[catName].toFixed(2))
  }));

  // Stock status breakdown
  const inStockCount = products.filter(p => p.current_stock > p.reorder_level).length;
  const stockStatusBreakdown = [
    { name: 'In Stock', value: inStockCount, color: '#10b981' },
    { name: 'Low Stock', value: lowStockProducts.length, color: '#f59e0b' },
    { name: 'Out of Stock', value: outOfStockProducts.length, color: '#ef4444' }
  ];

  return {
    totalProducts,
    totalCategories,
    totalSuppliers,
    lowStockCount: lowStockProducts.length,
    outOfStockCount: outOfStockProducts.length,
    totalInventoryValue: Number(totalInventoryValue.toFixed(2)),
    recentTransactions,
    lowStockList: lowStockProducts.slice(0, 5),
    categoryDistribution,
    stockStatusBreakdown,
    source: productsRes.source
  };
}

// -------------------------------------------------------------
// ONE-CLICK DATABASE SEEDING UTILITY
// -------------------------------------------------------------
export async function seedCurrentAccount(userId) {
  if (isSupabaseConfigured && supabase) {
    try {
      // Call Supabase stored function or insert records
      const { data, error } = await supabase.rpc('seed_demo_inventory', { p_target_user_id: userId });
      if (!error) return { success: true, message: 'Supabase database successfully seeded!' };
    } catch (e) {
      console.warn('Supabase seed RPC error, will insert directly:', e.message);
    }
  }

  // Reset local state to initial sample records
  setLocalStore('categories', INITIAL_CATEGORIES);
  setLocalStore('suppliers', INITIAL_SUPPLIERS);
  setLocalStore('products', INITIAL_PRODUCTS);
  setLocalStore('transactions', INITIAL_TRANSACTIONS);
  return { success: true, message: 'Relational database seeded successfully with 5 Categories, 4 Suppliers, 8 Products, and Transaction History!' };
}

// -------------------------------------------------------------
// RELATIONAL METADATA & SCHEMA DISCOVERY (Database Explorer)
// -------------------------------------------------------------
export async function getDatabaseSchemaMetadata() {
  const [pRes, cRes, sRes, tRes] = await Promise.all([
    fetchProducts(),
    fetchCategories(),
    fetchSuppliers(),
    fetchTransactions({ limit: 100 })
  ]);

  return [
    {
      tableName: 'profiles',
      description: 'Extended user accounts linked to Supabase auth.users',
      normalForm: '3NF (Atomic attributes, key determines all, no transitive dependency)',
      rowCount: 1,
      columns: [
        { name: 'id', type: 'UUID', key: 'PK', constraint: 'REFERENCES auth.users(id)', nullable: false },
        { name: 'full_name', type: 'TEXT', key: '', constraint: 'NOT NULL', nullable: false },
        { name: 'email', type: 'TEXT', key: '', constraint: 'NOT NULL', nullable: false },
        { name: 'role', type: 'TEXT', key: '', constraint: 'CHECK IN (admin, manager, staff)', nullable: false },
        { name: 'created_at', type: 'TIMESTAMPTZ', key: '', constraint: 'DEFAULT NOW()', nullable: false }
      ],
      sampleRows: [
        { id: 'u0000000-0000-4000-8000-000000000001', full_name: 'DBMS Researcher', email: 'dbms.student@svnit.ac.in', role: 'inventory_manager' }
      ]
    },
    {
      tableName: 'categories',
      description: 'Product taxonomy groupings for catalog organization',
      normalForm: '3NF (Single responsibility, composite unique constraints on user_id + code)',
      rowCount: cRes.data.length,
      columns: [
        { name: 'id', type: 'UUID', key: 'PK', constraint: 'DEFAULT gen_random_uuid()', nullable: false },
        { name: 'user_id', type: 'UUID', key: 'FK', constraint: 'REFERENCES profiles(id) ON DELETE CASCADE', nullable: false },
        { name: 'name', type: 'TEXT', key: '', constraint: 'UNIQUE(user_id, name), NOT NULL', nullable: false },
        { name: 'code', type: 'TEXT', key: '', constraint: 'UNIQUE(user_id, code), NOT NULL', nullable: false },
        { name: 'description', type: 'TEXT', key: '', constraint: '', nullable: true },
        { name: 'created_at', type: 'TIMESTAMPTZ', key: '', constraint: 'DEFAULT NOW()', nullable: false }
      ],
      sampleRows: cRes.data.slice(0, 3)
    },
    {
      tableName: 'suppliers',
      description: 'Verified industrial procurement vendors and suppliers',
      normalForm: '3NF (Independent entity, eliminates redundant vendor contact attributes)',
      rowCount: sRes.data.length,
      columns: [
        { name: 'id', type: 'UUID', key: 'PK', constraint: 'DEFAULT gen_random_uuid()', nullable: false },
        { name: 'user_id', type: 'UUID', key: 'FK', constraint: 'REFERENCES profiles(id) ON DELETE CASCADE', nullable: false },
        { name: 'name', type: 'TEXT', key: '', constraint: 'UNIQUE(user_id, name), NOT NULL', nullable: false },
        { name: 'contact_person', type: 'TEXT', key: '', constraint: '', nullable: true },
        { name: 'email', type: 'TEXT', key: '', constraint: '', nullable: true },
        { name: 'phone', type: 'TEXT', key: '', constraint: '', nullable: true },
        { name: 'address', type: 'TEXT', key: '', constraint: '', nullable: true },
        { name: 'city', type: 'TEXT', key: '', constraint: '', nullable: true }
      ],
      sampleRows: sRes.data.slice(0, 3)
    },
    {
      tableName: 'products',
      description: 'Master item catalog with price, reorder points, and live stock balance',
      normalForm: '3NF (Foreign keys to categories and suppliers prevent transitive dependency)',
      rowCount: pRes.data.length,
      columns: [
        { name: 'id', type: 'UUID', key: 'PK', constraint: 'DEFAULT gen_random_uuid()', nullable: false },
        { name: 'user_id', type: 'UUID', key: 'FK', constraint: 'REFERENCES profiles(id) ON DELETE CASCADE', nullable: false },
        { name: 'category_id', type: 'UUID', key: 'FK', constraint: 'REFERENCES categories(id) ON DELETE RESTRICT', nullable: false },
        { name: 'supplier_id', type: 'UUID', key: 'FK', constraint: 'REFERENCES suppliers(id) ON DELETE SET NULL', nullable: true },
        { name: 'name', type: 'TEXT', key: '', constraint: 'NOT NULL', nullable: false },
        { name: 'sku', type: 'TEXT', key: '', constraint: 'UNIQUE(user_id, sku), NOT NULL', nullable: false },
        { name: 'unit_of_measure', type: 'TEXT', key: '', constraint: 'CHECK IN (pcs, kg, boxes, ...)', nullable: false },
        { name: 'unit_price', type: 'NUMERIC(12,2)', key: '', constraint: 'CHECK (unit_price >= 0)', nullable: false },
        { name: 'cost_price', type: 'NUMERIC(12,2)', key: '', constraint: 'CHECK (cost_price >= 0)', nullable: false },
        { name: 'current_stock', type: 'INTEGER', key: '', constraint: 'CHECK (current_stock >= 0)', nullable: false },
        { name: 'reorder_level', type: 'INTEGER', key: '', constraint: 'CHECK (reorder_level >= 0)', nullable: false }
      ],
      sampleRows: pRes.data.slice(0, 3)
    },
    {
      tableName: 'inventory_transactions',
      description: 'Immutable historical event ledger of all incoming, outgoing, and adjustment stock movements',
      normalForm: '3NF (Preserves previous and resulting states with zero updates to historical logs)',
      rowCount: tRes.data.length,
      columns: [
        { name: 'id', type: 'UUID', key: 'PK', constraint: 'DEFAULT gen_random_uuid()', nullable: false },
        { name: 'user_id', type: 'UUID', key: 'FK', constraint: 'REFERENCES profiles(id) ON DELETE CASCADE', nullable: false },
        { name: 'product_id', type: 'UUID', key: 'FK', constraint: 'REFERENCES products(id) ON DELETE CASCADE', nullable: false },
        { name: 'transaction_type', type: 'TEXT', key: '', constraint: 'CHECK IN (STOCK_IN, STOCK_OUT, ADJUSTMENT)', nullable: false },
        { name: 'quantity', type: 'INTEGER', key: '', constraint: 'CHECK (quantity > 0)', nullable: false },
        { name: 'previous_stock', type: 'INTEGER', key: '', constraint: 'CHECK (previous_stock >= 0)', nullable: false },
        { name: 'new_stock', type: 'INTEGER', key: '', constraint: 'CHECK (new_stock >= 0)', nullable: false },
        { name: 'reference_no', type: 'TEXT', key: '', constraint: '', nullable: true },
        { name: 'transaction_date', type: 'TIMESTAMPTZ', key: '', constraint: 'DEFAULT NOW()', nullable: false }
      ],
      sampleRows: tRes.data.slice(0, 3)
    }
  ];
}
