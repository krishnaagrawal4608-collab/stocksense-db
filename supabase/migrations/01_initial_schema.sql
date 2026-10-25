-- ====================================================================
-- StockSense DB - Relational Database Schema & Migrations
-- Subject: Database Management Systems (DBMS) Academic Project
-- Features: 3NF Relational Model, Constraints, Views, Triggers, RLS, Stored Functions
-- ====================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- 2. Clean Existing Tables (Idempotent Setup)
-- ====================================================================
DROP VIEW IF EXISTS view_inventory_valuation CASCADE;
DROP VIEW IF EXISTS view_low_stock_products CASCADE;
DROP VIEW IF EXISTS view_product_details CASCADE;
DROP VIEW IF EXISTS view_transaction_history CASCADE;

DROP TABLE IF EXISTS inventory_transactions CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ====================================================================
-- 3. Profiles Table (Linked to Supabase auth.users)
-- ====================================================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'inventory_manager' CHECK (role IN ('admin', 'inventory_manager', 'warehouse_staff', 'viewer')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE profiles IS 'Stores extended user profile information mapped 1:1 to auth.users';

-- ====================================================================
-- 4. Categories Table
-- ====================================================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_categories_user_code UNIQUE(user_id, code),
    CONSTRAINT uq_categories_user_name UNIQUE(user_id, name)
);

CREATE INDEX idx_categories_user_id ON categories(user_id);

COMMENT ON TABLE categories IS 'Product classifications for cataloging and inventory grouping';

-- ====================================================================
-- 5. Suppliers Table
-- ====================================================================
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    country TEXT DEFAULT 'India',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_suppliers_user_name UNIQUE(user_id, name)
);

CREATE INDEX idx_suppliers_user_id ON suppliers(user_id);

COMMENT ON TABLE suppliers IS 'Vendor & supplier entities responsible for procurement';

-- ====================================================================
-- 6. Products Table
-- ====================================================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    sku TEXT NOT NULL,
    description TEXT,
    unit_of_measure TEXT NOT NULL DEFAULT 'pcs' CHECK (unit_of_measure IN ('pcs', 'kg', 'boxes', 'liters', 'meters', 'sets', 'units', 'rolls')),
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    cost_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (cost_price >= 0),
    current_stock INTEGER NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
    reorder_level INTEGER NOT NULL DEFAULT 10 CHECK (reorder_level >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_products_user_sku UNIQUE(user_id, sku)
);

CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_supplier_id ON products(supplier_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_stock ON products(current_stock, reorder_level);

COMMENT ON TABLE products IS 'Master item registry storing unit costs, pricing, and live inventory levels';

-- ====================================================================
-- 7. Inventory Transactions Table (Immutable Stock Movement Log)
-- ====================================================================
CREATE TABLE inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('STOCK_IN', 'STOCK_OUT', 'ADJUSTMENT')),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    previous_stock INTEGER NOT NULL CHECK (previous_stock >= 0),
    new_stock INTEGER NOT NULL CHECK (new_stock >= 0),
    unit_cost NUMERIC(12, 2),
    reference_no TEXT,
    notes TEXT,
    transaction_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_transactions_user_id ON inventory_transactions(user_id);
CREATE INDEX idx_transactions_product_id ON inventory_transactions(product_id);
CREATE INDEX idx_transactions_type ON inventory_transactions(transaction_type);
CREATE INDEX idx_transactions_date ON inventory_transactions(transaction_date DESC);

COMMENT ON TABLE inventory_transactions IS 'Historical audit ledger of all stock movement events';

-- ====================================================================
-- 8. PostgreSQL Views (DBMS Concept: Data Abstraction & Precomputed Joins)
-- ====================================================================

-- View A: Low Stock & Reorder Alert
CREATE OR REPLACE VIEW view_low_stock_products AS
SELECT 
    p.id AS product_id,
    p.user_id,
    p.name AS product_name,
    p.sku,
    p.current_stock,
    p.reorder_level,
    (p.reorder_level - p.current_stock) AS shortage_units,
    CASE 
        WHEN p.current_stock = 0 THEN 'OUT_OF_STOCK'
        ELSE 'LOW_STOCK'
    END AS stock_status,
    p.unit_price,
    c.name AS category_name,
    s.name AS supplier_name,
    s.email AS supplier_email,
    s.phone AS supplier_phone
FROM products p
JOIN categories c ON p.category_id = c.id
LEFT JOIN suppliers s ON p.supplier_id = s.id
WHERE p.is_active = true 
  AND p.current_stock <= p.reorder_level;

-- View B: Category-wise Inventory Valuation Summary
CREATE OR REPLACE VIEW view_inventory_valuation AS
SELECT 
    c.user_id,
    c.id AS category_id,
    c.name AS category_name,
    COUNT(p.id) AS total_products,
    COALESCE(SUM(p.current_stock), 0) AS total_stock_units,
    COALESCE(SUM(p.current_stock * p.unit_price), 0.00) AS total_inventory_value,
    COALESCE(ROUND(AVG(p.unit_price), 2), 0.00) AS average_unit_price
FROM categories c
LEFT JOIN products p ON c.id = p.category_id AND p.is_active = true
GROUP BY c.user_id, c.id, c.name;

-- View C: Full Product Details (Multi-Table Join)
CREATE OR REPLACE VIEW view_product_details AS
SELECT 
    p.id,
    p.user_id,
    p.name,
    p.sku,
    p.description,
    p.unit_of_measure,
    p.unit_price,
    p.cost_price,
    p.current_stock,
    p.reorder_level,
    p.is_active,
    (p.current_stock * p.unit_price) AS total_value,
    CASE 
        WHEN p.current_stock = 0 THEN 'Out of Stock'
        WHEN p.current_stock <= p.reorder_level THEN 'Low Stock'
        ELSE 'In Stock'
    END AS stock_status,
    c.id AS category_id,
    c.name AS category_name,
    c.code AS category_code,
    s.id AS supplier_id,
    s.name AS supplier_name,
    s.email AS supplier_email,
    s.phone AS supplier_phone,
    p.created_at,
    p.updated_at
FROM products p
JOIN categories c ON p.category_id = c.id
LEFT JOIN suppliers s ON p.supplier_id = s.id;

-- View D: Transaction Audit View
CREATE OR REPLACE VIEW view_transaction_history AS
SELECT 
    t.id AS transaction_id,
    t.user_id,
    t.transaction_type,
    t.quantity,
    t.previous_stock,
    t.new_stock,
    t.unit_cost,
    t.reference_no,
    t.notes,
    t.transaction_date,
    p.id AS product_id,
    p.name AS product_name,
    p.sku AS product_sku,
    c.name AS category_name,
    prof.full_name AS operator_name
FROM inventory_transactions t
JOIN products p ON t.product_id = p.id
JOIN categories c ON p.category_id = c.id
JOIN profiles prof ON t.user_id = prof.id;

-- ====================================================================
-- 9. Stored Functions and Triggers (DBMS Concept: ACID Transactions & Automation)
-- ====================================================================

-- Trigger Function: Automatic updated_at timestamp maintenance
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER trg_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER trg_suppliers_updated_at
    BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- Auto-create profile on Supabase auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.email,
        'inventory_manager'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users (Standard Supabase Auth Hook)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Stored Procedure: Atomic Stock Movement with Row Locking (ACID)
CREATE OR REPLACE FUNCTION record_stock_movement(
    p_product_id UUID,
    p_transaction_type TEXT,
    p_quantity INTEGER,
    p_reference_no TEXT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL,
    p_unit_cost NUMERIC DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_prev_stock INTEGER;
    v_new_stock INTEGER;
    v_txn_id UUID;
    v_product_name TEXT;
BEGIN
    -- Determine authenticated user
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated. Operation requires an active user session.';
    END IF;

    -- Validate quantity
    IF p_quantity <= 0 THEN
        RAISE EXCEPTION 'Quantity must be strictly greater than zero.';
    END IF;

    -- Row Lock the product row to prevent concurrency race conditions (Isolation Level)
    SELECT current_stock, name INTO v_prev_stock, v_product_name
    FROM products
    WHERE id = p_product_id AND user_id = v_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Product with ID % not found or not owned by user.', p_product_id;
    END IF;

    -- Calculate new stock based on transaction type
    IF p_transaction_type = 'STOCK_IN' THEN
        v_new_stock := v_prev_stock + p_quantity;
    ELSIF p_transaction_type = 'STOCK_OUT' THEN
        IF v_prev_stock < p_quantity THEN
            RAISE EXCEPTION 'Insufficient stock for product "%". Current stock is %, requested reduction is %.', 
                v_product_name, v_prev_stock, p_quantity;
        END IF;
        v_new_stock := v_prev_stock - p_quantity;
    ELSIF p_transaction_type = 'ADJUSTMENT' THEN
        -- In adjustment, p_quantity is treated as the new absolute stock value
        v_new_stock := p_quantity;
    ELSE
        RAISE EXCEPTION 'Invalid transaction type: %. Must be STOCK_IN, STOCK_OUT, or ADJUSTMENT.', p_transaction_type;
    END IF;

    -- 1. Update the product stock atomically
    UPDATE products
    SET current_stock = v_new_stock,
        updated_at = timezone('utc'::text, now())
    WHERE id = p_product_id;

    -- 2. Insert into the immutable audit ledger
    INSERT INTO inventory_transactions (
        user_id,
        product_id,
        transaction_type,
        quantity,
        previous_stock,
        new_stock,
        unit_cost,
        reference_no,
        notes
    ) VALUES (
        v_user_id,
        p_product_id,
        p_transaction_type,
        p_quantity,
        v_prev_stock,
        v_new_stock,
        p_unit_cost,
        p_reference_no,
        p_notes
    ) RETURNING id INTO v_txn_id;

    RETURN jsonb_build_object(
        'success', true,
        'transaction_id', v_txn_id,
        'product_id', p_product_id,
        'product_name', v_product_name,
        'transaction_type', p_transaction_type,
        'previous_stock', v_prev_stock,
        'new_stock', v_new_stock,
        'quantity', p_quantity
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================================================
-- 10. Row Level Security (RLS) - Data Isolation per User
-- ====================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view own profile" 
    ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
    ON profiles FOR UPDATE USING (auth.uid() = id);

-- Categories Policies
CREATE POLICY "Users can select own categories" 
    ON categories FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories" 
    ON categories FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" 
    ON categories FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" 
    ON categories FOR DELETE USING (auth.uid() = user_id);

-- Suppliers Policies
CREATE POLICY "Users can select own suppliers" 
    ON suppliers FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own suppliers" 
    ON suppliers FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own suppliers" 
    ON suppliers FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own suppliers" 
    ON suppliers FOR DELETE USING (auth.uid() = user_id);

-- Products Policies
CREATE POLICY "Users can select own products" 
    ON products FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own products" 
    ON products FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products" 
    ON products FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own products" 
    ON products FOR DELETE USING (auth.uid() = user_id);

-- Inventory Transactions Policies
-- Note: Immutable audit trail - No UPDATE or DELETE allowed by regular users!
CREATE POLICY "Users can select own transactions" 
    ON inventory_transactions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" 
    ON inventory_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
