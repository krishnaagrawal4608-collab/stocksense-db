// Realistic sample data matching the exact 3NF relational PostgreSQL schema
// for StockSense DB academic demonstration.

export const INITIAL_CATEGORIES = [
  {
    id: 'c1111111-1111-4111-8111-111111111111',
    user_id: 'u0000000-0000-4000-8000-000000000001',
    name: 'Electronics & IT',
    code: 'CAT-ELEC',
    description: 'Computing devices, peripherals, and networking hardware',
    created_at: '2026-09-01T10:00:00Z',
    updated_at: '2026-09-01T10:00:00Z'
  },
  {
    id: 'c2222222-2222-4222-8222-222222222222',
    user_id: 'u0000000-0000-4000-8000-000000000001',
    name: 'Office Supplies',
    code: 'CAT-OFFICE',
    description: 'Stationery, paper products, and general administrative consumables',
    created_at: '2026-09-02T11:00:00Z',
    updated_at: '2026-09-02T11:00:00Z'
  },
  {
    id: 'c3333333-3333-4333-8333-333333333333',
    user_id: 'u0000000-0000-4000-8000-000000000001',
    name: 'Industrial Tools',
    code: 'CAT-TOOLS',
    description: 'Power tools, safety equipment, and mechanical maintenance accessories',
    created_at: '2026-09-03T09:30:00Z',
    updated_at: '2026-09-03T09:30:00Z'
  },
  {
    id: 'c4444444-4444-4444-8444-444444444444',
    user_id: 'u0000000-0000-4000-8000-000000000001',
    name: 'Packaging & Shipping',
    code: 'CAT-PACK',
    description: 'Corrugated cartons, bubble rolls, adhesive tapes, and strapping items',
    created_at: '2026-09-04T14:15:00Z',
    updated_at: '2026-09-04T14:15:00Z'
  },
  {
    id: 'c5555555-5555-4555-8555-555555555555',
    user_id: 'u0000000-0000-4000-8000-000000000001',
    name: 'Raw Materials',
    code: 'CAT-RAW',
    description: 'Metals, polymer resins, and fabrication raw stock',
    created_at: '2026-09-05T16:00:00Z',
    updated_at: '2026-09-05T16:00:00Z'
  }
];

export const INITIAL_SUPPLIERS = [
  {
    id: 's1111111-1111-4111-8111-111111111111',
    user_id: 'u0000000-0000-4000-8000-000000000001',
    name: 'NexGen Components Ltd',
    contact_person: 'Vikram Malhotra',
    email: 'sales@nexgencomponents.com',
    phone: '+91 98201 12345',
    address: 'Plot 44, Electronic City Phase 1',
    city: 'Bangalore',
    country: 'India',
    created_at: '2026-09-01T10:30:00Z',
    updated_at: '2026-09-01T10:30:00Z'
  },
  {
    id: 's2222222-2222-4222-8222-222222222222',
    user_id: 'u0000000-0000-4000-8000-000000000001',
    name: 'Apex Industrial Hardware',
    contact_person: 'Pooja Sharma',
    email: 'orders@apexhardware.in',
    phone: '+91 98450 67890',
    address: '12 Industrial Area, Phase II',
    city: 'Pune',
    country: 'India',
    created_at: '2026-09-02T11:15:00Z',
    updated_at: '2026-09-02T11:15:00Z'
  },
  {
    id: 's3333333-3333-4333-8333-333333333333',
    user_id: 'u0000000-0000-4000-8000-000000000001',
    name: 'OmniPack Logistics Supplies',
    contact_person: 'Rahul Verma',
    email: 'rahul@omnipack.co.in',
    phone: '+91 97110 54321',
    address: 'Warehouse 7, Bhiwandi Logistics Park',
    city: 'Mumbai',
    country: 'India',
    created_at: '2026-09-03T12:00:00Z',
    updated_at: '2026-09-03T12:00:00Z'
  },
  {
    id: 's4444444-4444-4444-8444-444444444444',
    user_id: 'u0000000-0000-4000-8000-000000000001',
    name: 'Global Stationery & Paper Mills',
    contact_person: 'Ananya Sen',
    email: 'support@globalstationery.com',
    phone: '+91 93300 98765',
    address: 'Sector 5, Salt Lake City',
    city: 'Kolkata',
    country: 'India',
    created_at: '2026-09-04T15:45:00Z',
    updated_at: '2026-09-04T15:45:00Z'
  }
];

export const INITIAL_PRODUCTS = [
  {
    id: 'p1111111-1111-4111-8111-111111111111',
    user_id: 'u0000000-0000-4000-8000-000000000001',
    category_id: 'c1111111-1111-4111-8111-111111111111',
    supplier_id: 's1111111-1111-4111-8111-111111111111',
    name: 'Enterprise Wireless Mouse M350',
    sku: 'SKU-EL-001',
    description: 'Ergonomic dual-mode 2.4GHz and Bluetooth optical mouse with silent click',
    unit_of_measure: 'pcs',
    unit_price: 1250.00,
    cost_price: 750.00,
    current_stock: 85,
    reorder_level: 20,
    is_active: true,
    created_at: '2026-09-10T09:00:00Z',
    updated_at: '2026-10-20T14:30:00Z'
  },
  {
    id: 'p2222222-2222-4222-8222-222222222222',
    user_id: 'u0000000-0000-4000-8000-000000000001',
    category_id: 'c1111111-1111-4111-8111-111111111111',
    supplier_id: 's1111111-1111-4111-8111-111111111111',
    name: 'UltraWide 27-inch IPS Monitor',
    sku: 'SKU-EL-002',
    description: '4K UHD HDR400 display with USB-C 65W power delivery for engineering stations',
    unit_of_measure: 'units',
    unit_price: 24999.00,
    cost_price: 18500.00,
    current_stock: 24,
    reorder_level: 8,
    is_active: true,
    created_at: '2026-09-12T11:20:00Z',
    updated_at: '2026-10-23T16:15:00Z'
  },
  {
    id: 'p3333333-3333-4333-8333-333333333333',
    user_id: 'u0000000-0000-4000-8000-000000000001',
    category_id: 'c1111111-1111-4111-8111-111111111111',
    supplier_id: 's1111111-1111-4111-8111-111111111111',
    name: 'Cat6 High-Speed Ethernet Cable 10m',
    sku: 'SKU-EL-003',
    description: 'Snagless shielded twisted pair RJ45 patch cable for rack connectivity',
    unit_of_measure: 'pcs',
    unit_price: 320.00,
    cost_price: 180.00,
    current_stock: 6,
    reorder_level: 15,
    is_active: true,
    created_at: '2026-09-14T14:00:00Z',
    updated_at: '2026-10-24T18:00:00Z'
  },
  {
    id: 'p4444444-4444-4444-8444-444444444444',
    user_id: 'u0000000-0000-4000-8000-000000000001',
    category_id: 'c2222222-2222-4222-8222-222222222222',
    supplier_id: 's4444444-4444-4444-8444-444444444444',
    name: 'A4 Multipurpose Copier Paper 75 GSM (Ream of 500)',
    sku: 'SKU-OF-001',
    description: 'High opacity premium white copy paper for laser and inkjet printers',
    unit_of_measure: 'boxes',
    unit_price: 280.00,
    cost_price: 200.00,
    current_stock: 5,
    reorder_level: 25,
    is_active: true,
    created_at: '2026-09-15T10:15:00Z',
    updated_at: '2026-10-22T09:45:00Z'
  },
  {
    id: 'p5555555-5555-4555-8555-555555555555',
    user_id: 'u0000000-0000-4000-8000-000000000001',
    category_id: 'c4444444-4444-4444-8444-444444444444',
    supplier_id: 's3333333-3333-4333-8333-333333333333',
    name: 'Heavy Duty Corrugated Box 12x10x8',
    sku: 'SKU-PK-001',
    description: '3-ply kraft paper shipping carton with 15kg burst strength',
    unit_of_measure: 'boxes',
    unit_price: 45.00,
    cost_price: 28.00,
    current_stock: 350,
    reorder_level: 100,
    is_active: true,
    created_at: '2026-09-16T13:40:00Z',
    updated_at: '2026-10-21T11:20:00Z'
  },
  {
    id: 'p6666666-6666-4666-8666-666666666666',
    user_id: 'u0000000-0000-4000-8000-000000000001',
    category_id: 'c3333333-3333-4333-8333-333333333333',
    supplier_id: 's2222222-2222-4222-8222-222222222222',
    name: 'Variable Speed Cordless Hammer Drill 18V',
    sku: 'SKU-TL-001',
    description: 'Brushless motor drill kit with dual lithium batteries and hard case',
    unit_of_measure: 'sets',
    unit_price: 6800.00,
    cost_price: 4900.00,
    current_stock: 0,
    reorder_level: 5,
    is_active: true,
    created_at: '2026-09-18T15:10:00Z',
    updated_at: '2026-10-24T12:00:00Z'
  },
  {
    id: 'p7777777-7777-4777-8777-777777777777',
    user_id: 'u0000000-0000-4000-8000-000000000001',
    category_id: 'c4444444-4444-4444-8444-444444444444',
    supplier_id: 's3333333-3333-4333-8333-333333333333',
    name: 'Reinforced Brown Packaging Tape 48mm x 65m',
    sku: 'SKU-PK-002',
    description: 'Industrial water-resistant adhesive packing tape roll',
    unit_of_measure: 'rolls',
    unit_price: 65.00,
    cost_price: 38.00,
    current_stock: 140,
    reorder_level: 30,
    is_active: true,
    created_at: '2026-09-19T08:30:00Z',
    updated_at: '2026-10-19T17:00:00Z'
  },
  {
    id: 'p8888888-8888-4888-8888-888888888888',
    user_id: 'u0000000-0000-4000-8000-000000000001',
    category_id: 'c1111111-1111-4111-8111-111111111111',
    supplier_id: 's1111111-1111-4111-8111-111111111111',
    name: 'Pro Series Core i7 Laptop 16GB/512GB',
    sku: 'SKU-EL-004',
    description: 'Corporate lightweight notebook with biometric security and long battery',
    unit_of_measure: 'units',
    unit_price: 72000.00,
    cost_price: 58000.00,
    current_stock: 18,
    reorder_level: 5,
    is_active: true,
    created_at: '2026-09-20T10:00:00Z',
    updated_at: '2026-10-24T15:20:00Z'
  }
];

export const INITIAL_TRANSACTIONS = [
  {
    id: 't1111111-1111-4111-8111-111111111111',
    user_id: 'u0000000-0000-4000-8000-000000000001',
    product_id: 'p1111111-1111-4111-8111-111111111111',
    transaction_type: 'STOCK_IN',
    quantity: 100,
    previous_stock: 0,
    new_stock: 100,
    unit_cost: 750.00,
    reference_no: 'PO-2026-001',
    notes: 'Initial consignment received from NexGen Components',
    transaction_date: '2026-10-10T10:00:00Z',
    created_at: '2026-10-10T10:00:00Z'
  },
  {
    id: 't2222222-2222-4222-8222-222222222222',
    user_id: 'u0000000-0000-4000-8000-000000000001',
    product_id: 'p1111111-1111-4111-8111-111111111111',
    transaction_type: 'STOCK_OUT',
    quantity: 15,
    previous_stock: 100,
    new_stock: 85,
    unit_cost: 750.00,
    reference_no: 'SO-2026-101',
    notes: 'Dispatched to Branch Office IT deployment',
    transaction_date: '2026-10-20T14:30:00Z',
    created_at: '2026-10-20T14:30:00Z'
  },
  {
    id: 't3333333-3333-4333-8333-333333333333',
    user_id: 'u0000000-0000-4000-8000-000000000001',
    product_id: 'p2222222-2222-4222-8222-222222222222',
    transaction_type: 'STOCK_IN',
    quantity: 30,
    previous_stock: 0,
    new_stock: 30,
    unit_cost: 18500.00,
    reference_no: 'PO-2026-002',
    notes: 'Bulk shipment received and quality checked',
    transaction_date: '2026-10-15T11:00:00Z',
    created_at: '2026-10-15T11:00:00Z'
  },
  {
    id: 't4444444-4444-4444-8444-444444444444',
    user_id: 'u0000000-0000-4000-8000-000000000001',
    product_id: 'p2222222-2222-4222-8222-222222222222',
    transaction_type: 'STOCK_OUT',
    quantity: 6,
    previous_stock: 30,
    new_stock: 24,
    unit_cost: 18500.00,
    reference_no: 'SO-2026-104',
    notes: 'Fulfilled Department order for UI/UX studio',
    transaction_date: '2026-10-23T16:15:00Z',
    created_at: '2026-10-23T16:15:00Z'
  },
  {
    id: 't5555555-5555-4555-8555-555555555555',
    user_id: 'u0000000-0000-4000-8000-000000000001',
    product_id: 'p3333333-3333-4333-8333-333333333333',
    transaction_type: 'STOCK_OUT',
    quantity: 14,
    previous_stock: 20,
    new_stock: 6,
    unit_cost: 180.00,
    reference_no: 'SO-2026-108',
    notes: 'Server rack maintenance patch cabling (Triggered Low Stock Alert)',
    transaction_date: '2026-10-24T18:00:00Z',
    created_at: '2026-10-24T18:00:00Z'
  },
  {
    id: 't6666666-6666-4666-8666-666666666666',
    user_id: 'u0000000-0000-4000-8000-000000000001',
    product_id: 'p6666666-6666-4666-8666-666666666666',
    transaction_type: 'STOCK_OUT',
    quantity: 5,
    previous_stock: 5,
    new_stock: 0,
    unit_cost: 4900.00,
    reference_no: 'SO-2026-120',
    notes: 'All 5 units assigned to site engineering crew (Stock Depleted)',
    transaction_date: '2026-10-24T12:00:00Z',
    created_at: '2026-10-24T12:00:00Z'
  }
];

export const DEMO_USER = {
  id: 'u0000000-0000-4000-8000-000000000001',
  email: 'dbms.student@svnit.ac.in',
  user_metadata: {
    full_name: 'DBMS Researcher'
  },
  role: 'inventory_manager'
};
