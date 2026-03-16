# Siegma Logistics - Database Schema Setup

This file contains SQL commands to set up your Supabase database.

## Steps to Set Up Database:

1. **Go to Supabase Dashboard**: https://app.supabase.com
2. **Select your project**
3. **Click on "SQL Editor"** in the left sidebar
4. **Create a new query**
5. **Copy and paste the SQL below**
6. **Click "Run"**

---

## SQL Commands to Create Tables:

```sql
-- Customers Table
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admins Table
CREATE TABLE IF NOT EXISTS admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin', -- 'admin' or 'superadmin'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  order_id VARCHAR(255),
  amount DECIMAL(10, 2),
  service_type VARCHAR(100), -- 'general_parcel' or 'full_truck_load'
  from_city VARCHAR(255),
  to_city VARCHAR(255),
  items TEXT, -- JSON format
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'confirmed', 'in_transit', 'delivered'
  pdf_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Driver Proofs Table
CREATE TABLE IF NOT EXISTS driver_proofs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  driver_name VARCHAR(255),
  license_plate VARCHAR(50),
  proof_url TEXT,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_admins_email ON admins(email);
CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_driver_proofs_invoice_id ON driver_proofs(invoice_id);

-- Enable RLS (Row Level Security)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_proofs ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Customers can view own data" ON customers
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Customers can update own data" ON customers
  FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Customers can view own invoices" ON invoices
  FOR SELECT USING (customer_id = auth.uid()::uuid);

-- Create Storage Buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('invoices', 'invoices', false)
ON CONFLICT DO NOTHING;

INSERT INTO storage.buckets (id, name, public) VALUES ('driver-proofs', 'driver-proofs', false)
ON CONFLICT DO NOTHING;
```

---

## After Setup:

1. **Create Sample Admin** (Optional - for testing):
   - Go to SQL Editor
   - Run this (change password to hash):

   ```sql
   INSERT INTO admins (email, password, name, role) VALUES 
   ('admin@siegmalogistics.com', 'hashed_password_here', 'Admin User', 'superadmin');
   ```

   NOTE: Use bcrypt to hash the password. You can use an online bcrypt generator temporarily.

2. **Update .env file** in backend folder:
   - Copy from `.env.example`
   - Add your Supabase URL and Key
   - Add JWT_SECRET

3. **Install backend dependencies**:
   ```
   cd backend
   npm install
   ```

4. **Run backend**:
   ```
   npm run dev
   ```

---

## Next Steps:

1. ✅ Database created
2. ⏳ Backend running locally
3. ⏳ Connect frontend to backend APIs
4. ⏳ Deploy to Railway/Render
5. ⏳ Deploy frontend to Vercel/Netlify
