# StockSense DB — SQL-Powered Inventory Management System

> **Academic DBMS Project & Production-Style Web Application**  
> Designed for College Database Management Systems (DBMS) Practical Examination & Viva Demonstration.

![StockSense DB Architecture](https://img.shields.io/badge/Database-PostgreSQL%2015-blue?logo=postgresql)
![Auth](https://img.shields.io/badge/Auth-Supabase%20RLS-teal?logo=supabase)
![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite%20%2B%20Tailwind-indigo?logo=react)
![Normal Form](https://img.shields.io/badge/Schema-3NF%20Normalized-emerald)
![License](https://img.shields.io/badge/License-MIT-slate)

---

## 1. Project Overview

**StockSense DB** is a full-stack, production-grade inventory management system designed specifically to demonstrate fundamental and advanced **Database Management System (DBMS)** principles. Unlike mock dashboards, every metric, catalog item, vendor association, and stock transaction is powered by relational SQL queries, views, triggers, and stored procedures executed over a normalized PostgreSQL instance.

### Primary Academic Objectives Demonstrated:
1. **Third Normal Form (3NF) Relational Architecture**: Eliminates data redundancy, update anomalies, and transitive dependencies across master catalog tables.
2. **Referential Integrity & Cascading Constraints**: Enforces parent-child consistency with intentional `ON DELETE RESTRICT`, `ON DELETE SET NULL`, and `ON DELETE CASCADE` rules.
3. **Domain Integrity & Integrity Constraints**: Enforces `CHECK` constraints (e.g. `price >= 0`, `current_stock >= 0`, `quantity > 0`) and table-level `UNIQUE` constraints (e.g. `(user_id, sku)`).
4. **ACID Transactions & Row-Level Locking**: Atomic execution of inventory changes via PostgreSQL functions utilizing `FOR UPDATE` row locking to prevent concurrency race conditions.
5. **Database Views & Precomputed Abstraction**: Encapsulates multi-table joins and calculations (e.g., `view_low_stock_products`, `view_inventory_valuation`).
6. **Row Level Security (RLS)**: Server-side multi-tenant data isolation using PostgreSQL policies (`auth.uid() = user_id`).
7. **Interactive SQL Lab**: Live execution sandbox running 20+ curated queries covering Basic SQL, Aggregates, Multi-Table Joins, Group By with HAVING, Correlated Subqueries, and CTEs.

---

## 2. Technology Stack

- **Frontend**: React 18, Vite, JavaScript, Tailwind CSS, React Router v6.
- **Data Visualizations**: Recharts (Bar Charts, Donut Charts, Movement Trends).
- **Icons**: Lucide React.
- **Backend & Database**: Supabase PostgreSQL 15+, Supabase Authentication.
- **Database Driver**: `@supabase/supabase-js`.
- **Hosting**: Vercel (SPA deployment with client-side rewrites).

---

## 3. Relational Schema & 3NF Database Design

The database schema is structured into 5 normalized relational tables:

```
[auth.users] (Supabase Authentication Engine)
    │ 1:1
    ▼
[profiles] (Extended User Identity & Role)
    │
    ├── 1:N ──▶ [categories] (Product Classification Dimension)
    │                │ 1:N (ON DELETE RESTRICT)
    │                ▼
    ├── 1:N ──▶ [products] ◀── 1:N (ON DELETE SET NULL) ── [suppliers] (Vendor Entities)
    │                │
    │                │ 1:N (ON DELETE CASCADE)
    │                ▼
    └─────────▶ [inventory_transactions] (Immutable Audit Ledger)
```

### Table Definitions:

1. **`profiles`**
   - **Primary Key**: `id` (UUID references `auth.users(id)` ON DELETE CASCADE).
   - **Attributes**: `full_name`, `email`, `role` (`CHECK in ('admin', 'inventory_manager', 'warehouse_staff', 'viewer')`), `created_at`, `updated_at`.
   - **Role**: 1:1 user profile automatically populated upon user signup via PostgreSQL trigger `on_auth_user_created`.

2. **`categories`**
   - **Primary Key**: `id` (UUID default `gen_random_uuid()`).
   - **Attributes**: `user_id` (FK), `name`, `code`, `description`, timestamps.
   - **Constraints**: `UNIQUE(user_id, code)`, `UNIQUE(user_id, name)`.

3. **`suppliers`**
   - **Primary Key**: `id` (UUID default `gen_random_uuid()`).
   - **Attributes**: `user_id` (FK), `name`, `contact_person`, `email`, `phone`, `address`, `city`, `country`.
   - **Constraints**: `UNIQUE(user_id, name)`.

4. **`products`**
   - **Primary Key**: `id` (UUID default `gen_random_uuid()`).
   - **Foreign Keys**: 
     - `category_id` (REFERENCES `categories(id)` ON DELETE RESTRICT)
     - `supplier_id` (REFERENCES `suppliers(id)` ON DELETE SET NULL)
     - `user_id` (REFERENCES `profiles(id)` ON DELETE CASCADE)
   - **Constraints**:
     - `UNIQUE(user_id, sku)` (Prevents duplicate item codes)
     - `CHECK (unit_price >= 0)`
     - `CHECK (cost_price >= 0)`
     - `CHECK (current_stock >= 0)`
     - `CHECK (reorder_level >= 0)`

5. **`inventory_transactions`**
   - **Primary Key**: `id` (UUID default `gen_random_uuid()`).
   - **Foreign Keys**: `product_id` (REFERENCES `products(id)` ON DELETE CASCADE), `user_id` (FK).
   - **Attributes**: `transaction_type` (`CHECK in ('STOCK_IN', 'STOCK_OUT', 'ADJUSTMENT')`), `quantity` (`CHECK > 0`), `previous_stock`, `new_stock`, `reference_no`, `notes`, `transaction_date`.
   - **Integrity**: Immutable append-only audit trail; UPDATE and DELETE privileges are revoked for regular users.

---

## 4. Stored Procedures, Triggers & Views

The database migration located at `supabase/migrations/01_initial_schema.sql` creates:

### 1. Atomic Stored Procedure (`record_stock_movement`)
```sql
CREATE OR REPLACE FUNCTION record_stock_movement(
    p_product_id UUID,
    p_transaction_type TEXT,
    p_quantity INTEGER,
    p_reference_no TEXT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL,
    p_unit_cost NUMERIC DEFAULT NULL
)
RETURNS JSONB AS $$ ...
```
- **Concurrency Protection**: Uses `SELECT current_stock FROM products WHERE id = p_product_id FOR UPDATE;` (Row-Exclusive Lock).
- **Business Rule Enforcement**: Throws `RAISE EXCEPTION 'Insufficient stock'` if `STOCK_OUT` quantity exceeds physical on-hand quantity.
- **Atomicity**: Updates `products.current_stock` and writes to `inventory_transactions` in the same database transaction.

### 2. Precomputed Database Views
- **`view_low_stock_products`**: Combines `products`, `categories`, and `suppliers` to calculate shortage units: `(reorder_level - current_stock)` where `current_stock <= reorder_level`.
- **`view_inventory_valuation`**: Category-wise SQL aggregation: `COUNT(p.id)`, `SUM(p.current_stock)`, `SUM(p.current_stock * p.unit_price)`.
- **`view_transaction_history`**: Denormalized audit report joining transaction items with category, SKU, and operator name.

---

## 5. Interactive SQL Lab (DBMS Viva Demonstration)

StockSense DB includes a dedicated **SQL Lab** featuring:
- **Syntax Validator & Sandbox**: Restricts browser execution to safe `SELECT` / `WITH` statements, preventing destructive `DROP` or `GRANT` injections.
- **Latency & Row Counter**: Displays measured query execution time (in milliseconds) and returned row count.
- **Categorized Query Catalog**:
  1. **Basic SQL**: `SELECT`, `WHERE`, `DISTINCT`, `ORDER BY`, `LIMIT`.
  2. **Aggregates**: `COUNT()`, `SUM()`, `AVG()`, `MIN()`, `MAX()`.
  3. **Relational Joins**: `INNER JOIN`, `LEFT JOIN`, 3-way multi-table join.
  4. **Grouping**: `GROUP BY` and `HAVING` clause filtering post-aggregation.
  5. **Advanced**: Correlated `EXISTS` subqueries, scalar subqueries in `WHERE`, `CASE WHEN` conditional statements, and Common Table Expressions (`WITH` CTEs).
  6. **ACID Demonstration**: Visual breakdown of `BEGIN`, `FOR UPDATE`, `COMMIT`, and `ROLLBACK`.

---

## 6. Local Setup and Installation

### Prerequisites
- Node.js version 18 or higher
- npm or yarn

### 1. Clone or Open Project
```bash
cd "c:\Users\MOHIT AGRAWAL\OneDrive\Desktop\STOCK_SENSE"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your Supabase project credentials (or leave empty to explore in Academic Demo Mode):
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Start Local Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 7. Supabase Database Setup (5 Minutes)

1. Create a free account at [https://supabase.com](https://supabase.com) and create a new project.
2. Navigate to the **SQL Editor** tab in your Supabase dashboard.
3. Open `supabase/migrations/01_initial_schema.sql`, copy all contents, paste into the SQL Editor, and click **Run**.
4. (Optional) Open `supabase/seed.sql` to seed initial sample records.
5. In Supabase Dashboard, go to **Project Settings &gt; API**:
   - Copy **Project URL** &rarr; paste into `VITE_SUPABASE_URL`.
   - Copy **anon public key** &rarr; paste into `VITE_SUPABASE_ANON_KEY`.
6. Under **Authentication &gt; URL Configuration**:
   - Set **Site URL** to `http://localhost:5173` (or your production Vercel URL).

> **In-App Configuration**: You can also configure Supabase directly within the running web app by clicking the **Database Engine** badge in the sidebar!

---

## 8. Deployment to Vercel

1. Push this project to GitHub.
2. Sign in to [https://vercel.com](https://vercel.com) and click **Add New Project**.
3. Import your GitHub repository.
4. Set the Framework Preset to **Vite**.
5. In **Environment Variables**, add:
   - `VITE_SUPABASE_URL` = `https://your-project-ref.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `your-supabase-anon-key`
6. Click **Deploy**. Vercel will build and serve the application globally.
   - The included `vercel.json` automatically ensures client-side routing rewrites work properly without 404 errors on page reload.

---

## 9. Viva & Practical Exam Demonstration Guide

During your college DBMS viva examination, follow this sequence:

1. **Schema & Normalization**:
   - Navigate to **Database Explorer &amp; ERD**.
   - Show the 5 normalized tables. Explain how foreign keys (`category_id`, `supplier_id`, `user_id`) satisfy **3NF** by eliminating transitive dependencies.
   - Explain the deletion behaviors: `ON DELETE RESTRICT` (categories) vs `ON DELETE SET NULL` (suppliers).
2. **ACID Concurrency & Transaction Ledger**:
   - Navigate to **Stock Transactions**.
   - Click **Record Movement** &rarr; record a `STOCK_OUT` transaction.
   - Show that physical on-hand stock is decremented and the immutable transaction history is updated atomically.
   - Try to perform a `STOCK_OUT` with a quantity greater than current stock to show the exception handling.
3. **Dashboard Real-Time SQL Metrics**:
   - Navigate to **Dashboard**.
   - Click **View SQL** on any card to show the underlying `COUNT(*)`, `SUM(current_stock * unit_price)`, and conditional `CASE` statements.
4. **SQL Lab Queries**:
   - Navigate to **SQL Lab**.
   - Run the **3-Table Multi Join**, **GROUP BY with HAVING**, and **Common Table Expression (CTE)** queries. Point out the execution latency and returned columns.
5. **Analytical Reports & CSV Export**:
   - Navigate to **Reports**.
   - View Category Valuation and Low-Stock Reorder Budget, and export the report to CSV.

---

## 10. License

Built for educational purposes for university DBMS examination. Free to use and distribute under the MIT License.
