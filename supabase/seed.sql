-- ====================================================================
-- StockSense DB - Sample Database Seed Data
-- Suitable for seeding an active user's inventory catalog
-- Replace 'YOUR_USER_UUID_HERE' with your Supabase auth.uid() or run the helper function below
-- ====================================================================

-- Function to seed data for the currently authenticated user
CREATE OR REPLACE FUNCTION seed_demo_inventory(p_target_user_id UUID DEFAULT auth.uid())
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID := p_target_user_id;
    v_cat_elec UUID;
    v_cat_off UUID;
    v_cat_ind UUID;
    v_cat_pack UUID;
    v_cat_raw UUID;
    
    v_sup_tech UUID;
    v_sup_glob UUID;
    v_sup_omni UUID;
    v_sup_apex UUID;

    v_prod_laptop UUID;
    v_prod_mouse UUID;
    v_prod_paper UUID;
    v_prod_cable UUID;
    v_prod_box UUID;
    v_prod_drill UUID;
    v_prod_tape UUID;
    v_prod_monitor UUID;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Target user ID must not be null.';
    END IF;

    -- 1. Insert Categories
    INSERT INTO categories (user_id, name, code, description) VALUES
        (v_user_id, 'Electronics & IT', 'CAT-ELEC', 'Computing devices, peripherals, and active hardware components')
        RETURNING id INTO v_cat_elec;

    INSERT INTO categories (user_id, name, code, description) VALUES
        (v_user_id, 'Office Supplies', 'CAT-OFFICE', 'Stationery, paper products, and general administrative consumables')
        RETURNING id INTO v_cat_off;

    INSERT INTO categories (user_id, name, code, description) VALUES
        (v_user_id, 'Industrial Tools', 'CAT-TOOLS', 'Maintenance, power tools, safety equipment, and machinery accessories')
        RETURNING id INTO v_cat_ind;

    INSERT INTO categories (user_id, name, code, description) VALUES
        (v_user_id, 'Packaging & Shipping', 'CAT-PACK', 'Carton boxes, bubble wraps, tapes, and cushioning materials')
        RETURNING id INTO v_cat_pack;

    INSERT INTO categories (user_id, name, code, description) VALUES
        (v_user_id, 'Raw Materials', 'CAT-RAW', 'Metals, polymers, and fabrication components')
        RETURNING id INTO v_cat_raw;

    -- 2. Insert Suppliers
    INSERT INTO suppliers (user_id, name, contact_person, email, phone, address, city, country) VALUES
        (v_user_id, 'NexGen Components Ltd', 'Vikram Malhotra', 'sales@nexgencomponents.com', '+91 98201 12345', 'Plot 44, Electronic City Phase 1', 'Bangalore', 'India')
        RETURNING id INTO v_sup_tech;

    INSERT INTO suppliers (user_id, name, contact_person, email, phone, address, city, country) VALUES
        (v_user_id, 'Apex Industrial Hardware', 'Pooja Sharma', 'orders@apexhardware.in', '+91 98450 67890', '12 Industrial Area, Phase II', 'Pune', 'India')
        RETURNING id INTO v_sup_apex;

    INSERT INTO suppliers (user_id, name, contact_person, email, phone, address, city, country) VALUES
        (v_user_id, 'OmniPack Logistics Supplies', 'Rahul Verma', 'rahul@omnipack.co.in', '+91 97110 54321', 'Warehouse 7, Bhiwandi Logistics Park', 'Mumbai', 'India')
        RETURNING id INTO v_sup_omni;

    INSERT INTO suppliers (user_id, name, contact_person, email, phone, address, city, country) VALUES
        (v_user_id, 'Global Stationery & Paper Mills', 'Ananya Sen', 'support@globalstationery.com', '+91 93300 98765', 'Sector 5, Salt Lake City', 'Kolkata', 'India')
        RETURNING id INTO v_sup_glob;

    -- 3. Insert Products
    -- Product 1: In Stock
    INSERT INTO products (user_id, category_id, supplier_id, name, sku, description, unit_of_measure, unit_price, cost_price, current_stock, reorder_level, is_active) VALUES
        (v_user_id, v_cat_elec, v_sup_tech, 'Enterprise Wireless Mouse M350', 'SKU-EL-001', 'Ergonomic dual-mode 2.4GHz and Bluetooth optical mouse with silent click', 'pcs', 1250.00, 750.00, 85, 20, true)
        RETURNING id INTO v_prod_mouse;

    -- Product 2: In Stock
    INSERT INTO products (user_id, category_id, supplier_id, name, sku, description, unit_of_measure, unit_price, cost_price, current_stock, reorder_level, is_active) VALUES
        (v_user_id, v_cat_elec, v_sup_tech, 'UltraWide 27-inch IPS Monitor', 'SKU-EL-002', '4K UHD HDR400 display with USB-C 65W power delivery for workstations', 'units', 24999.00, 18500.00, 24, 8, true)
        RETURNING id INTO v_prod_monitor;

    -- Product 3: Low Stock
    INSERT INTO products (user_id, category_id, supplier_id, name, sku, description, unit_of_measure, unit_price, cost_price, current_stock, reorder_level, is_active) VALUES
        (v_user_id, v_cat_elec, v_sup_tech, 'Cat6 High-Speed Ethernet Cable 10m', 'SKU-EL-003', 'Snagless shielded twisted pair RJ45 patch cable for rack connectivity', 'pcs', 320.00, 180.00, 6, 15, true)
        RETURNING id INTO v_prod_cable;

    -- Product 4: Low Stock
    INSERT INTO products (user_id, category_id, supplier_id, name, sku, description, unit_of_measure, unit_price, cost_price, current_stock, reorder_level, is_active) VALUES
        (v_user_id, v_cat_off, v_sup_glob, 'A4 Multipurpose Copier Paper 75 GSM (Ream of 500)', 'SKU-OF-001', 'High opacity premium white copy paper for laser and inkjet printers', 'boxes', 280.00, 200.00, 5, 25, true)
        RETURNING id INTO v_prod_paper;

    -- Product 5: In Stock
    INSERT INTO products (user_id, category_id, supplier_id, name, sku, description, unit_of_measure, unit_price, cost_price, current_stock, reorder_level, is_active) VALUES
        (v_user_id, v_cat_pack, v_sup_omni, 'Heavy Duty Corrugated Box 12x10x8', 'SKU-PK-001', '3-ply kraft paper shipping carton with 15kg burst strength', 'boxes', 45.00, 28.00, 350, 100, true)
        RETURNING id INTO v_prod_box;

    -- Product 6: Out of Stock (Testing Alert!)
    INSERT INTO products (user_id, category_id, supplier_id, name, sku, description, unit_of_measure, unit_price, cost_price, current_stock, reorder_level, is_active) VALUES
        (v_user_id, v_cat_ind, v_sup_apex, 'Variable Speed Cordless Hammer Drill 18V', 'SKU-TL-001', 'Brushless motor drill kit with dual lithium batteries and hard case', 'sets', 6800.00, 4900.00, 0, 5, true)
        RETURNING id INTO v_prod_drill;

    -- Product 7: In Stock
    INSERT INTO products (user_id, category_id, supplier_id, name, sku, description, unit_of_measure, unit_price, cost_price, current_stock, reorder_level, is_active) VALUES
        (v_user_id, v_cat_pack, v_sup_omni, 'Reinforced Brown Packaging Tape 48mm x 65m', 'SKU-PK-002', 'Industrial water-resistant adhesive packing tape roll', 'rolls', 65.00, 38.00, 140, 30, true)
        RETURNING id INTO v_prod_tape;

    -- Product 8: In Stock
    INSERT INTO products (user_id, category_id, supplier_id, name, sku, description, unit_of_measure, unit_price, cost_price, current_stock, reorder_level, is_active) VALUES
        (v_user_id, v_cat_elec, v_sup_tech, 'Pro Series Core i7 Laptop 16GB/512GB', 'SKU-EL-004', 'Corporate lightweight notebook with biometric security and long battery', 'units', 72000.00, 58000.00, 18, 5, true)
        RETURNING id INTO v_prod_laptop;

    -- 4. Insert Inventory Transactions History (Audit Trail)
    INSERT INTO inventory_transactions (user_id, product_id, transaction_type, quantity, previous_stock, new_stock, unit_cost, reference_no, notes, transaction_date) VALUES
        (v_user_id, v_prod_mouse, 'STOCK_IN', 100, 0, 100, 750.00, 'PO-2026-001', 'Initial consignment received from NexGen', NOW() - INTERVAL '14 days'),
        (v_user_id, v_prod_mouse, 'STOCK_OUT', 15, 100, 85, 750.00, 'SO-2026-101', 'Dispatched to Branch office IT deployment', NOW() - INTERVAL '5 days'),
        (v_user_id, v_prod_monitor, 'STOCK_IN', 30, 0, 30, 18500.00, 'PO-2026-002', 'Bulk shipment received and inspected', NOW() - INTERVAL '10 days'),
        (v_user_id, v_prod_monitor, 'STOCK_OUT', 6, 30, 24, 18500.00, 'SO-2026-104', 'Fulfilled Department order for design studio', NOW() - INTERVAL '2 days'),
        (v_user_id, v_prod_cable, 'STOCK_IN', 20, 0, 20, 180.00, 'PO-2026-003', 'Server room cabling lot', NOW() - INTERVAL '12 days'),
        (v_user_id, v_prod_cable, 'STOCK_OUT', 14, 20, 6, 180.00, 'SO-2026-108', 'Rack maintenance patch wiring', NOW() - INTERVAL '1 day'),
        (v_user_id, v_prod_paper, 'STOCK_IN', 50, 0, 50, 200.00, 'PO-2026-004', 'Quarterly stationery procurement', NOW() - INTERVAL '20 days'),
        (v_user_id, v_prod_paper, 'STOCK_OUT', 45, 50, 5, 200.00, 'SO-2026-112', 'Distributed to accounts and admin departments', NOW() - INTERVAL '3 days'),
        (v_user_id, v_prod_box, 'STOCK_IN', 500, 0, 500, 28.00, 'PO-2026-005', 'Pallet delivery from OmniPack', NOW() - INTERVAL '15 days'),
        (v_user_id, v_prod_box, 'STOCK_OUT', 150, 500, 350, 28.00, 'SO-2026-115', 'Used for product order packing and shipping', NOW() - INTERVAL '4 days'),
        (v_user_id, v_prod_drill, 'STOCK_IN', 5, 0, 5, 4900.00, 'PO-2026-006', 'Facility workshop procurement', NOW() - INTERVAL '8 days'),
        (v_user_id, v_prod_drill, 'STOCK_OUT', 5, 5, 0, 4900.00, 'SO-2026-120', 'Assigned to site engineers (Stock Depleted)', NOW() - INTERVAL '1 day'),
        (v_user_id, v_prod_tape, 'STOCK_IN', 200, 0, 200, 38.00, 'PO-2026-007', 'Carton sealing tape batch', NOW() - INTERVAL '18 days'),
        (v_user_id, v_prod_tape, 'STOCK_OUT', 60, 200, 140, 38.00, 'SO-2026-122', 'Shipping desk consumption', NOW() - INTERVAL '6 days'),
        (v_user_id, v_prod_laptop, 'STOCK_IN', 20, 0, 20, 58000.00, 'PO-2026-008', 'Corporate laptop procurement batch A', NOW() - INTERVAL '7 days'),
        (v_user_id, v_prod_laptop, 'STOCK_OUT', 2, 20, 18, 58000.00, 'SO-2026-125', 'Issued to new senior software engineers', NOW() - INTERVAL '1 day');

    RETURN jsonb_build_object(
        'status', 'success',
        'message', 'Demo inventory successfully seeded with categories, suppliers, products, and transaction ledger!',
        'user_id', v_user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
