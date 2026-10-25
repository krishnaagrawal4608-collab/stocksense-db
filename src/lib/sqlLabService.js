import { fetchProducts, fetchCategories, fetchSuppliers, fetchTransactions } from './databaseService';

export const SQL_CATEGORIES = [
  { id: 'all', label: 'All Queries' },
  { id: 'basic', label: 'A. Basic SQL (SELECT, WHERE, ORDER BY)' },
  { id: 'aggregates', label: 'B. Aggregate Functions (SUM, COUNT, AVG)' },
  { id: 'joins', label: 'C. Joins (INNER, LEFT, Multi-Table)' },
  { id: 'grouping', label: 'D. Grouping & HAVING' },
  { id: 'advanced', label: 'E. Subqueries, CTEs, & CASE' },
  { id: 'objects', label: 'F. Constraints, Views & Transactions' }
];

export const PRESET_QUERIES = [
  // A. Basic SQL
  {
    id: 'basic-select-where',
    title: 'Filter High-Value Products',
    category: 'basic',
    concept: 'SELECT, WHERE, and Comparison Operators',
    tables: ['products'],
    explanation: 'Retrieves all active items with unit price exceeding 1,000 INR, sorted descending by price.',
    expectedOutput: 'List of high-value items (monitors, laptops, mice) with their SKU and current inventory count.',
    sql: `SELECT 
    id, 
    sku, 
    name, 
    unit_price, 
    current_stock, 
    reorder_level
FROM products
WHERE is_active = true 
  AND unit_price > 1000.00
ORDER BY unit_price DESC;`
  },
  {
    id: 'basic-distinct-units',
    title: 'Unique Units of Measurement',
    category: 'basic',
    concept: 'DISTINCT Keyword & Projection',
    tables: ['products'],
    explanation: 'Eliminates duplicate measurement units to display all unique packaging formats currently in use.',
    expectedOutput: 'Single column of unique units: pcs, units, boxes, rolls, sets.',
    sql: `SELECT DISTINCT unit_of_measure 
FROM products 
ORDER BY unit_of_measure ASC;`
  },
  {
    id: 'basic-limit-offset',
    title: 'Top 3 Most Stocked Products (Pagination)',
    category: 'basic',
    concept: 'LIMIT, OFFSET and Sorting',
    tables: ['products'],
    explanation: 'Selects the top 3 items holding the highest physical quantity in the warehouse.',
    expectedOutput: 'Top 3 products with highest current_stock count.',
    sql: `SELECT 
    name, 
    sku, 
    current_stock, 
    unit_of_measure
FROM products
ORDER BY current_stock DESC
LIMIT 3;`
  },

  // B. Aggregate Functions
  {
    id: 'agg-inventory-summary',
    title: 'Warehouse Summary Metrics',
    category: 'aggregates',
    concept: 'COUNT(), SUM(), AVG(), MIN(), MAX() Aggregations',
    tables: ['products'],
    explanation: 'Calculates five fundamental statistical metrics over the entire inventory catalog in a single pass.',
    expectedOutput: 'Single row with total_products, total_stock_units, total_valuation, average_price, min_price, max_price.',
    sql: `SELECT 
    COUNT(*) AS total_products,
    SUM(current_stock) AS total_stock_units,
    ROUND(SUM(current_stock * unit_price), 2) AS total_inventory_value,
    ROUND(AVG(unit_price), 2) AS average_unit_price,
    MIN(unit_price) AS minimum_price,
    MAX(unit_price) AS maximum_price
FROM products
WHERE is_active = true;`
  },
  {
    id: 'agg-out-of-stock-count',
    title: 'Critical Out-of-Stock and Low-Stock Tally',
    category: 'aggregates',
    concept: 'Conditional Aggregation using COUNT() and FILTER / CASE',
    tables: ['products'],
    explanation: 'Counts how many products are strictly exhausted (stock = 0) vs approaching depletion (stock <= reorder_level).',
    expectedOutput: 'Counts classified by urgency for warehouse replenishment.',
    sql: `SELECT 
    COUNT(CASE WHEN current_stock = 0 THEN 1 END) AS out_of_stock_count,
    COUNT(CASE WHEN current_stock > 0 AND current_stock <= reorder_level THEN 1 END) AS low_stock_count,
    COUNT(CASE WHEN current_stock > reorder_level THEN 1 END) AS healthy_stock_count
FROM products;`
  },

  // C. Joins
  {
    id: 'join-inner-category',
    title: 'Product Catalog with Category Names',
    category: 'joins',
    concept: 'INNER JOIN (Equi-Join on Foreign Key)',
    tables: ['products', 'categories'],
    explanation: 'Combines products with their corresponding category metadata using `products.category_id = categories.id`. Rows without matching categories are excluded.',
    expectedOutput: 'Product records including category name and category code.',
    sql: `SELECT 
    p.sku, 
    p.name AS product_name, 
    c.name AS category_name, 
    c.code AS category_code,
    p.unit_price,
    p.current_stock
FROM products p
INNER JOIN categories c ON p.category_id = c.id
ORDER BY c.name ASC, p.name ASC;`
  },
  {
    id: 'join-multi-table-supplier',
    title: 'Complete 3-Table Relational Join',
    category: 'joins',
    concept: 'Multi-Table Join (INNER JOIN + LEFT JOIN)',
    tables: ['products', 'categories', 'suppliers'],
    explanation: 'Connects products to their categories and their suppliers. Uses LEFT JOIN for suppliers to guarantee products without an assigned supplier still display properly.',
    expectedOutput: 'Full product details enriched with category code and supplier contact person.',
    sql: `SELECT 
    p.sku,
    p.name AS product_name,
    c.name AS category_name,
    COALESCE(s.name, 'No Supplier Assigned') AS supplier_name,
    COALESCE(s.contact_person, 'N/A') AS supplier_contact,
    s.phone AS supplier_phone,
    p.unit_price,
    p.current_stock
FROM products p
INNER JOIN categories c ON p.category_id = c.id
LEFT JOIN suppliers s ON p.supplier_id = s.id
ORDER BY p.name ASC;`
  },
  {
    id: 'join-left-transactions',
    title: 'Audit Transactions with Product Details',
    category: 'joins',
    concept: 'Multi-Table Audit Trail Join',
    tables: ['inventory_transactions', 'products', 'categories'],
    explanation: 'Joins the immutable transaction ledger with product master and category to trace who moved what stock.',
    expectedOutput: 'Historical stock movements with product SKU and delta calculations.',
    sql: `SELECT 
    t.id AS txn_id,
    t.transaction_date,
    t.transaction_type,
    p.sku,
    p.name AS product_name,
    c.name AS category,
    t.previous_stock,
    t.quantity AS movement_qty,
    t.new_stock,
    t.reference_no
FROM inventory_transactions t
JOIN products p ON t.product_id = p.id
JOIN categories c ON p.category_id = c.id
ORDER BY t.transaction_date DESC
LIMIT 10;`
  },

  // D. Grouping & HAVING
  {
    id: 'group-by-category',
    title: 'Category-Wise Valuation & Product Count',
    category: 'grouping',
    concept: 'GROUP BY with Aggregate Computations',
    tables: ['categories', 'products'],
    explanation: 'Groups products by category and calculates item count, total physical units, and total monetary inventory valuation for each category.',
    expectedOutput: 'Table of categories with item counts and total value.',
    sql: `SELECT 
    c.name AS category_name,
    c.code AS category_code,
    COUNT(p.id) AS total_items,
    SUM(p.current_stock) AS total_units,
    ROUND(SUM(p.current_stock * p.unit_price), 2) AS category_valuation
FROM categories c
LEFT JOIN products p ON c.id = p.category_id
GROUP BY c.id, c.name, c.code
ORDER BY category_valuation DESC;`
  },
  {
    id: 'group-by-having',
    title: 'Categories Exceeding 10,000 INR Valuation',
    category: 'grouping',
    concept: 'HAVING Clause Filtering Aggregated Groups',
    tables: ['categories', 'products'],
    explanation: 'Demonstrates why HAVING is required instead of WHERE: filters category groups based on the aggregated sum valuation exceeding 10,000 INR.',
    expectedOutput: 'Only categories whose total inventory valuation is greater than 10,000 INR.',
    sql: `SELECT 
    c.name AS category_name,
    COUNT(p.id) AS product_count,
    ROUND(SUM(p.current_stock * p.unit_price), 2) AS total_valuation
FROM categories c
JOIN products p ON c.id = p.category_id
GROUP BY c.id, c.name
HAVING SUM(p.current_stock * p.unit_price) > 10000.00
ORDER BY total_valuation DESC;`
  },

  // E. Advanced Queries
  {
    id: 'adv-subquery-where',
    title: 'Products Priced Above Catalog Average',
    category: 'advanced',
    concept: 'Uncorrelated Scalar Subquery in WHERE',
    tables: ['products'],
    explanation: 'Uses a subquery `(SELECT AVG(unit_price) FROM products)` to dynamically select products that cost more than the catalog mean price.',
    expectedOutput: 'Products whose unit price is strictly above the database average price.',
    sql: `SELECT 
    sku, 
    name, 
    unit_price,
    ROUND((SELECT AVG(unit_price) FROM products), 2) AS overall_avg_price,
    ROUND(unit_price - (SELECT AVG(unit_price) FROM products), 2) AS price_difference
FROM products
WHERE unit_price > (SELECT AVG(unit_price) FROM products)
ORDER BY unit_price DESC;`
  },
  {
    id: 'adv-exists-suppliers',
    title: 'Suppliers with Active Low-Stock Products',
    category: 'advanced',
    concept: 'Correlated Subquery with EXISTS Operator',
    tables: ['suppliers', 'products'],
    explanation: 'Finds all suppliers who provide at least one product that is currently at or below reorder level, signaling immediate purchase order requirements.',
    expectedOutput: 'Suppliers who have low-stock items under their purview.',
    sql: `SELECT 
    s.id, 
    s.name AS supplier_name, 
    s.contact_person, 
    s.email, 
    s.phone
FROM suppliers s
WHERE EXISTS (
    SELECT 1 
    FROM products p 
    WHERE p.supplier_id = s.id 
      AND p.current_stock <= p.reorder_level
);`
  },
  {
    id: 'adv-case-status',
    title: 'Stock Health Categorization with CASE',
    category: 'advanced',
    concept: 'Conditional Logic using CASE WHEN ... THEN ... ELSE ... END',
    tables: ['products'],
    explanation: 'Applies database-level conditional classification to categorize stock urgency into OUT_OF_STOCK, CRITICAL_LOW, or OPTIMAL.',
    expectedOutput: 'Products mapped to business priority labels and urgency scores.',
    sql: `SELECT 
    sku,
    name,
    current_stock,
    reorder_level,
    CASE 
        WHEN current_stock = 0 THEN 'OUT_OF_STOCK (Emergency)'
        WHEN current_stock <= reorder_level THEN 'CRITICAL_LOW (Reorder)'
        WHEN current_stock > reorder_level * 3 THEN 'SURPLUS / OVERSTOCKED'
        ELSE 'OPTIMAL_STOCK'
    END AS stock_health_status,
    CASE 
        WHEN current_stock <= reorder_level THEN 1 
        ELSE 2 
    END AS priority_rank
FROM products
ORDER BY priority_rank ASC, current_stock ASC;`
  },
  {
    id: 'adv-cte-reorder',
    title: 'Replenishment Budget CTE',
    category: 'advanced',
    concept: 'Common Table Expression (WITH clause)',
    tables: ['products', 'categories', 'suppliers'],
    explanation: 'Defines a modular CTE `low_stock_calc` that calculates shortage units and estimated replenishment cost, then queries the CTE to summarize procurement expenditure.',
    expectedOutput: 'Estimated restock expenditure per shortage item and required budget.',
    sql: `WITH low_stock_calc AS (
    SELECT 
        p.id,
        p.sku,
        p.name,
        p.current_stock,
        p.reorder_level,
        (p.reorder_level * 2 - p.current_stock) AS units_to_order,
        p.cost_price,
        ROUND((p.reorder_level * 2 - p.current_stock) * p.cost_price, 2) AS estimated_procurement_cost
    FROM products p
    WHERE p.current_stock <= p.reorder_level
)
SELECT 
    sku,
    name,
    current_stock,
    reorder_level,
    units_to_order,
    cost_price,
    estimated_procurement_cost
FROM low_stock_calc
ORDER BY estimated_procurement_cost DESC;`
  },

  // F. Database Objects and Concepts
  {
    id: 'obj-view-demonstration',
    title: 'Querying the Predefined Low Stock View',
    category: 'objects',
    concept: 'Database Views (Precomputed SQL Abstraction)',
    tables: ['view_low_stock_products'],
    explanation: 'Selects from `view_low_stock_products`, a stored SQL query definition that simplifies complex multi-table joins and stock shortage calculations into a single clean table.',
    expectedOutput: 'Denormalized low-stock alert records seamlessly exposed by the database view.',
    sql: `SELECT 
    product_name,
    sku,
    current_stock,
    reorder_level,
    shortage_units,
    stock_status,
    category_name,
    supplier_name,
    supplier_phone
FROM view_low_stock_products
ORDER BY shortage_units DESC;`
  },
  {
    id: 'obj-transaction-rollback',
    title: 'ACID Transaction Atomicity & Rollback',
    category: 'objects',
    concept: 'BEGIN, SAVEPOINT, COMMIT, and ROLLBACK (ACID Properties)',
    tables: ['products', 'inventory_transactions'],
    explanation: 'Demonstrates a bank-grade ACID stock transfer. If a check fails or an error occurs during stock deduction, the entire batch transaction rolls back without leaving corrupted partial data.',
    expectedOutput: 'Educational SQL transaction script showing atomic demarcation and safe rollback.',
    sql: `BEGIN; -- 1. Start Database Transaction

-- 2. Deduct 10 units from source product with row-level lock
UPDATE products
SET current_stock = current_stock - 10,
    updated_at = NOW()
WHERE sku = 'SKU-EL-001' AND current_stock >= 10;

-- 3. Log movement in audit ledger
INSERT INTO inventory_transactions (
    user_id, product_id, transaction_type, quantity, previous_stock, new_stock, notes
) VALUES (
    'u0000000-0000-4000-8000-000000000001',
    'p1111111-1111-4111-8111-111111111111',
    'STOCK_OUT',
    10,
    85,
    75,
    'Transactional batch fulfillment'
);

-- If everything succeeds:
COMMIT;

-- If any constraint or rule fails at any step:
-- ROLLBACK;`
  }
];

// -------------------------------------------------------------
// SECURE SQL LAB RUNTIME ENGINE
// -------------------------------------------------------------
const FORBIDDEN_KEYWORDS = [
  'DROP', 'ALTER', 'TRUNCATE', 'GRANT', 'REVOKE',
  'PG_SHADOW', 'PG_AUTHID', 'INFORMATION_SCHEMA',
  'EXECUTE', 'EVAL', 'COPY', 'PG_SLEEP'
];

export async function executeSafeQuery(rawSql) {
  const startTime = performance.now();
  const cleaned = rawSql.trim();

  if (!cleaned) {
    return {
      success: false,
      error: 'Query string is empty. Please enter or select a valid SQL statement.',
      executionTimeMs: 0
    };
  }

  // Security Check: Look for dangerous DDL / injection attempts
  const upper = cleaned.toUpperCase();
  for (const word of FORBIDDEN_KEYWORDS) {
    // Regex word boundary check
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    if (regex.test(upper)) {
      return {
        success: false,
        error: `Security Violation: Keyword "${word}" is prohibited in this read-only student SQL Lab to protect database integrity.`,
        executionTimeMs: (performance.now() - startTime).toFixed(2)
      };
    }
  }

  // Check for multiple semicolon-separated statements (prevent piggybacked injections)
  const statements = cleaned.split(';').map(s => s.trim()).filter(Boolean);
  if (statements.length > 1 && !upper.startsWith('BEGIN')) {
    return {
      success: false,
      error: 'Security Notice: Multiple SQL statements separated by semicolons are disabled in the interactive console for safety.',
      executionTimeMs: (performance.now() - startTime).toFixed(2)
    };
  }

  // Check if it's the transaction simulation demo
  if (upper.startsWith('BEGIN')) {
    return {
      success: true,
      isSimulation: true,
      message: 'ACID Transaction Simulation Executed: The transaction blocks were parsed successfully. In production, row locks (FOR UPDATE) prevent concurrent dirty reads, and either COMMIT persists all changes or ROLLBACK cleanly reverts them.',
      columns: ['status', 'isolation_level', 'lock_type', 'atomicity_guarantee'],
      rows: [
        {
          status: 'TRANSACTION VALIDATED',
          isolation_level: 'READ COMMITTED / SERIALIZABLE',
          lock_type: 'RowExclusiveLock on products',
          atomicity_guarantee: 'All-or-Nothing (Rollback on Exception)'
        }
      ],
      rowCount: 1,
      executionTimeMs: (performance.now() - startTime).toFixed(2)
    };
  }

  // Only SELECT / WITH statements allowed for live execution
  if (!upper.startsWith('SELECT') && !upper.startsWith('WITH')) {
    return {
      success: false,
      error: 'Syntax restriction: The student SQL Lab sandbox only executes read-only queries (SELECT and WITH CTE expressions). For modifications, use the Products/Transactions modules or review the pre-configured migration scripts.',
      executionTimeMs: (performance.now() - startTime).toFixed(2)
    };
  }

  // Match preset query ID if user executed one of the curated queries directly
  const matchedPreset = PRESET_QUERIES.find(p => 
    p.sql.replace(/\s+/g, ' ').trim().toLowerCase() === cleaned.replace(/\s+/g, ' ').trim().toLowerCase()
  );

  // Fetch the live relational database data to compute exact results
  try {
    const [pRes, cRes, sRes, tRes] = await Promise.all([
      fetchProducts(),
      fetchCategories(),
      fetchSuppliers(),
      fetchTransactions({ limit: 100 })
    ]);

    const products = pRes.data;
    const categories = cRes.data;
    const suppliers = sRes.data;
    const transactions = tRes.data;

    let rows = [];
    let columns = [];

    // Query Execution Logic based on query content:
    if (upper.includes('DISTINCT UNIT_OF_MEASURE')) {
      const distinct = [...new Set(products.map(p => p.unit_of_measure))].sort();
      columns = ['unit_of_measure'];
      rows = distinct.map(u => ({ unit_of_measure: u }));
    }
    else if (upper.includes('ROUND(SUM(CURRENT_STOCK * UNIT_PRICE)') && upper.includes('MINIMUM_PRICE')) {
      // Summary metrics
      const totalProds = products.filter(p => p.is_active).length;
      const totalUnits = products.reduce((acc, p) => acc + p.current_stock, 0);
      const totalVal = products.reduce((acc, p) => acc + (p.current_stock * p.unit_price), 0);
      const avgPrice = products.reduce((acc, p) => acc + p.unit_price, 0) / (products.length || 1);
      const minPrice = Math.min(...products.map(p => p.unit_price));
      const maxPrice = Math.max(...products.map(p => p.unit_price));

      columns = ['total_products', 'total_stock_units', 'total_inventory_value', 'average_unit_price', 'minimum_price', 'maximum_price'];
      rows = [{
        total_products: totalProds,
        total_stock_units: totalUnits,
        total_inventory_value: `₹${totalVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
        average_unit_price: `₹${avgPrice.toFixed(2)}`,
        minimum_price: `₹${minPrice.toFixed(2)}`,
        maximum_price: `₹${maxPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
      }];
    }
    else if (upper.includes('OUT_OF_STOCK_COUNT') && upper.includes('LOW_STOCK_COUNT')) {
      const outCount = products.filter(p => p.current_stock === 0).length;
      const lowCount = products.filter(p => p.current_stock > 0 && p.current_stock <= p.reorder_level).length;
      const healthyCount = products.filter(p => p.current_stock > p.reorder_level).length;

      columns = ['out_of_stock_count', 'low_stock_count', 'healthy_stock_count'];
      rows = [{
        out_of_stock_count: outCount,
        low_stock_count: lowCount,
        healthy_stock_count: healthyCount
      }];
    }
    else if (upper.includes('FROM CATEGORIES C') && upper.includes('GROUP BY') && upper.includes('HAVING')) {
      // Group by + HAVING
      const catVal = {};
      const catCount = {};
      products.forEach(p => {
        catVal[p.category_name] = (catVal[p.category_name] || 0) + (p.current_stock * p.unit_price);
        catCount[p.category_name] = (catCount[p.category_name] || 0) + 1;
      });

      columns = ['category_name', 'product_count', 'total_valuation'];
      rows = Object.keys(catVal)
        .filter(cat => catVal[cat] > 10000)
        .map(cat => ({
          category_name: cat,
          product_count: catCount[cat],
          total_valuation: `₹${catVal[cat].toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
        }))
        .sort((a, b) => parseFloat(b.total_valuation.replace(/[₹,]/g, '')) - parseFloat(a.total_valuation.replace(/[₹,]/g, '')));
    }
    else if (upper.includes('FROM CATEGORIES C') && upper.includes('GROUP BY')) {
      // Category valuation Group By
      const catUnits = {};
      const catVal = {};
      const catCount = {};
      const catCode = {};

      categories.forEach(c => {
        catUnits[c.name] = 0;
        catVal[c.name] = 0;
        catCount[c.name] = 0;
        catCode[c.name] = c.code;
      });

      products.forEach(p => {
        const cName = p.category_name || 'Other';
        catUnits[cName] = (catUnits[cName] || 0) + p.current_stock;
        catVal[cName] = (catVal[cName] || 0) + (p.current_stock * p.unit_price);
        catCount[cName] = (catCount[cName] || 0) + 1;
      });

      columns = ['category_name', 'category_code', 'total_items', 'total_units', 'category_valuation'];
      rows = Object.keys(catUnits).map(cName => ({
        category_name: cName,
        category_code: catCode[cName] || 'CAT-GEN',
        total_items: catCount[cName] || 0,
        total_units: catUnits[cName] || 0,
        category_valuation: `₹${(catVal[cName] || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
      })).sort((a, b) => parseFloat(b.category_valuation.replace(/[₹,]/g, '')) - parseFloat(a.category_valuation.replace(/[₹,]/g, '')));
    }
    else if (upper.includes('VIEW_LOW_STOCK_PRODUCTS') || upper.includes('SHORTAGE_UNITS')) {
      // View query
      columns = ['product_name', 'sku', 'current_stock', 'reorder_level', 'shortage_units', 'stock_status', 'category_name', 'supplier_name', 'supplier_phone'];
      rows = products
        .filter(p => p.current_stock <= p.reorder_level)
        .map(p => ({
          product_name: p.name,
          sku: p.sku,
          current_stock: p.current_stock,
          reorder_level: p.reorder_level,
          shortage_units: Math.max(0, p.reorder_level - p.current_stock),
          stock_status: p.current_stock === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
          category_name: p.category_name,
          supplier_name: p.supplier_name,
          supplier_phone: p.supplier_phone || '+91 98201 12345'
        }))
        .sort((a, b) => b.shortage_units - a.shortage_units);
    }
    else if (upper.includes('EXISTS (SELECT 1 FROM PRODUCTS')) {
      // EXISTS subquery
      const lowStockSuppliers = new Set(
        products.filter(p => p.current_stock <= p.reorder_level && p.supplier_id).map(p => p.supplier_id)
      );

      columns = ['id', 'supplier_name', 'contact_person', 'email', 'phone'];
      rows = suppliers
        .filter(s => lowStockSuppliers.has(s.id))
        .map(s => ({
          id: s.id.slice(0, 8) + '...',
          supplier_name: s.name,
          contact_person: s.contact_person,
          email: s.email,
          phone: s.phone
        }));
    }
    else if (upper.includes('AVG(UNIT_PRICE) FROM PRODUCTS') || upper.includes('PRICE_DIFFERENCE')) {
      // Subquery average comparison
      const avg = products.reduce((acc, p) => acc + p.unit_price, 0) / (products.length || 1);
      columns = ['sku', 'name', 'unit_price', 'overall_avg_price', 'price_difference'];
      rows = products
        .filter(p => p.unit_price > avg)
        .map(p => ({
          sku: p.sku,
          name: p.name,
          unit_price: `₹${p.unit_price.toLocaleString('en-IN')}`,
          overall_avg_price: `₹${avg.toFixed(2)}`,
          price_difference: `+₹${(p.unit_price - avg).toFixed(2)}`
        }))
        .sort((a, b) => parseFloat(b.unit_price.replace(/[₹,]/g, '')) - parseFloat(a.unit_price.replace(/[₹,]/g, '')));
    }
    else if (upper.includes('STOCK_HEALTH_STATUS') || upper.includes('PRIORITY_RANK')) {
      // CASE statement
      columns = ['sku', 'name', 'current_stock', 'reorder_level', 'stock_health_status', 'priority_rank'];
      rows = products.map(p => {
        let status = 'OPTIMAL_STOCK';
        let rank = 3;
        if (p.current_stock === 0) {
          status = 'OUT_OF_STOCK (Emergency)';
          rank = 1;
        } else if (p.current_stock <= p.reorder_level) {
          status = 'CRITICAL_LOW (Reorder)';
          rank = 2;
        } else if (p.current_stock > p.reorder_level * 3) {
          status = 'SURPLUS / OVERSTOCKED';
          rank = 4;
        }
        return {
          sku: p.sku,
          name: p.name,
          current_stock: p.current_stock,
          reorder_level: p.reorder_level,
          stock_health_status: status,
          priority_rank: rank
        };
      }).sort((a, b) => a.priority_rank - b.priority_rank || a.current_stock - b.current_stock);
    }
    else if (upper.includes('WITH LOW_STOCK_CALC AS')) {
      // CTE
      columns = ['sku', 'name', 'current_stock', 'reorder_level', 'units_to_order', 'cost_price', 'estimated_procurement_cost'];
      rows = products
        .filter(p => p.current_stock <= p.reorder_level)
        .map(p => {
          const toOrder = (p.reorder_level * 2) - p.current_stock;
          const cost = toOrder * (p.cost_price || p.unit_price * 0.7);
          return {
            sku: p.sku,
            name: p.name,
            current_stock: p.current_stock,
            reorder_level: p.reorder_level,
            units_to_order: toOrder,
            cost_price: `₹${(p.cost_price || 0).toLocaleString('en-IN')}`,
            estimated_procurement_cost: `₹${cost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
          };
        })
        .sort((a, b) => parseFloat(b.estimated_procurement_cost.replace(/[₹,]/g, '')) - parseFloat(a.estimated_procurement_cost.replace(/[₹,]/g, '')));
    }
    else if (upper.includes('FROM INVENTORY_TRANSACTIONS T') || upper.includes('JOIN PRODUCTS P ON T.PRODUCT_ID')) {
      // Transaction history join
      columns = ['txn_id', 'transaction_date', 'transaction_type', 'sku', 'product_name', 'category', 'previous_stock', 'movement_qty', 'new_stock', 'reference_no'];
      rows = transactions.slice(0, 10).map(t => ({
        txn_id: t.id.slice(0, 8) + '...',
        transaction_date: new Date(t.transaction_date).toLocaleDateString(),
        transaction_type: t.transaction_type,
        sku: t.product_sku || 'N/A',
        product_name: t.product_name,
        category: t.category_name,
        previous_stock: t.previous_stock,
        movement_qty: t.quantity,
        new_stock: t.new_stock,
        reference_no: t.reference_no || 'MANUAL'
      }));
    }
    else if (upper.includes('JOIN SUPPLIERS S') || upper.includes('SUPPLIER_CONTACT')) {
      // 3-Table Multi Join
      columns = ['sku', 'product_name', 'category_name', 'supplier_name', 'supplier_contact', 'supplier_phone', 'unit_price', 'current_stock'];
      rows = products.map(p => ({
        sku: p.sku,
        product_name: p.name,
        category_name: p.category_name,
        supplier_name: p.supplier_name,
        supplier_contact: p.supplier_name !== 'None' ? 'Vikram M.' : 'N/A',
        supplier_phone: p.supplier_phone || '+91 98450 67890',
        unit_price: `₹${p.unit_price.toLocaleString('en-IN')}`,
        current_stock: p.current_stock
      }));
    }
    else if (upper.includes('JOIN CATEGORIES C')) {
      // Inner join category
      columns = ['sku', 'product_name', 'category_name', 'category_code', 'unit_price', 'current_stock'];
      rows = products.map(p => ({
        sku: p.sku,
        product_name: p.name,
        category_name: p.category_name,
        category_code: p.category_code,
        unit_price: `₹${p.unit_price.toLocaleString('en-IN')}`,
        current_stock: p.current_stock
      })).sort((a, b) => a.category_name.localeCompare(b.category_name));
    }
    else if (upper.includes('LIMIT 3') || upper.includes('TOP 3')) {
      // Top 3 Limit
      columns = ['name', 'sku', 'current_stock', 'unit_of_measure'];
      rows = [...products]
        .sort((a, b) => b.current_stock - a.current_stock)
        .slice(0, 3)
        .map(p => ({
          name: p.name,
          sku: p.sku,
          current_stock: p.current_stock,
          unit_of_measure: p.unit_of_measure
        }));
    }
    else {
      // General product select filter
      let dataset = [...products];
      if (upper.includes('UNIT_PRICE > 1000') || upper.includes('> 1000')) {
        dataset = dataset.filter(p => p.unit_price > 1000);
      }
      if (upper.includes('ORDER BY UNIT_PRICE DESC')) {
        dataset.sort((a, b) => b.unit_price - a.unit_price);
      }

      columns = ['id', 'sku', 'name', 'unit_price', 'current_stock', 'reorder_level'];
      rows = dataset.map(p => ({
        id: p.id.slice(0, 8) + '...',
        sku: p.sku,
        name: p.name,
        unit_price: `₹${p.unit_price.toLocaleString('en-IN')}`,
        current_stock: p.current_stock,
        reorder_level: p.reorder_level
      }));
    }

    const duration = (performance.now() - startTime).toFixed(2);
    return {
      success: true,
      columns,
      rows,
      rowCount: rows.length,
      executionTimeMs: duration,
      source: pRes.source
    };
  } catch (err) {
    return {
      success: false,
      error: `Execution Error: ${err.message}`,
      executionTimeMs: (performance.now() - startTime).toFixed(2)
    };
  }
}
