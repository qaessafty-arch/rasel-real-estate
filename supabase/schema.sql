-- ============================================================================
-- RASEL REAL ESTATE MANAGEMENT - SUPABASE DATABASE SCHEMA
-- ============================================================================
-- Complete idempotent schema for PostgreSQL / Supabase
-- Can be safely run multiple times without "already exists" errors

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROPERTIES TABLE
CREATE TABLE IF NOT EXISTS public.properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_code VARCHAR(50) NOT NULL UNIQUE, -- e.g. 'RSL-101'
    title VARCHAR(255) NOT NULL,
    property_type VARCHAR(50) NOT NULL CHECK (property_type IN ('house', 'apartment', 'villa', 'shop', 'office', 'commercial_land', 'agriculture_land', 'building')),
    purpose VARCHAR(50) NOT NULL CHECK (purpose IN ('sale', 'rent', 'investment')),
    status VARCHAR(50) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'rented', 'sold', 'reserved', 'under_maintenance')),
    price NUMERIC(15, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD' CHECK (currency IN ('USD', 'IQD')),
    rental_period VARCHAR(20) DEFAULT 'monthly' CHECK (rental_period IN ('monthly', 'yearly', 'daily') OR rental_period IS NULL),
    area_sqm NUMERIC(10, 2) NOT NULL,
    city VARCHAR(100) NOT NULL,
    neighborhood VARCHAR(150),
    address TEXT NOT NULL,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    bedrooms INTEGER,
    bathrooms INTEGER,
    floors INTEGER,
    year_built INTEGER,
    features TEXT[] DEFAULT ARRAY[]::TEXT[],
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    documents JSONB DEFAULT '[]'::JSONB,
    notes TEXT,
    owner_contact JSONB DEFAULT '{}'::JSONB,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexing for fast search and filtering
CREATE INDEX IF NOT EXISTS idx_properties_code ON public.properties(property_code);
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_type ON public.properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_purpose ON public.properties(purpose);
CREATE INDEX IF NOT EXISTS idx_properties_city ON public.properties(city);

-- 2. CONTRACTS (RENTAL & SALE AGREEMENTS)
CREATE TABLE IF NOT EXISTS public.contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    property_code VARCHAR(50),
    property_title VARCHAR(255),
    type VARCHAR(20) NOT NULL CHECK (type IN ('rent', 'sale')),
    client_name VARCHAR(200) NOT NULL,
    client_phone VARCHAR(50) NOT NULL,
    client_national_id VARCHAR(100),
    start_date DATE NOT NULL,
    end_date DATE,
    total_amount NUMERIC(15, 2) NOT NULL,
    paid_amount NUMERIC(15, 2) DEFAULT 0,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD' CHECK (currency IN ('USD', 'IQD')),
    payment_cycle VARCHAR(30) DEFAULT 'monthly' CHECK (payment_cycle IN ('monthly', 'one_time', 'quarterly', 'yearly')),
    next_payment_date DATE,
    status VARCHAR(30) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'terminated', 'overdue')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_contracts_property ON public.contracts(property_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON public.contracts(status);

-- 3. FINANCIAL TRANSACTIONS (INCOME & EXPENSES)
CREATE TABLE IF NOT EXISTS public.financial_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
    property_code VARCHAR(50),
    property_title VARCHAR(255),
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'rent_collected', 
        'sale_commission', 
        'maintenance', 
        'utility_fee', 
        'renovation', 
        'legal_tax', 
        'marketing', 
        'other'
    )),
    amount NUMERIC(15, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD' CHECK (currency IN ('USD', 'IQD')),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    payer_or_payee VARCHAR(200),
    receipt_number VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.financial_transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.financial_transactions(date);

-- 4. AUTO-UPDATE TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_properties_updated_at ON public.properties;
CREATE TRIGGER trigger_properties_updated_at
    BEFORE UPDATE ON public.properties
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp_column();

-- 5. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;

-- Drop old policies to prevent collision
DROP POLICY IF EXISTS "Allow authenticated owner full access on properties" ON public.properties;
DROP POLICY IF EXISTS "Allow owner full access on properties" ON public.properties;
CREATE POLICY "Allow owner full access on properties"
    ON public.properties FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated owner full access on contracts" ON public.contracts;
DROP POLICY IF EXISTS "Allow owner full access on contracts" ON public.contracts;
CREATE POLICY "Allow owner full access on contracts"
    ON public.contracts FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated owner full access on transactions" ON public.financial_transactions;
DROP POLICY IF EXISTS "Allow owner full access on transactions" ON public.financial_transactions;
CREATE POLICY "Allow owner full access on transactions"
    ON public.financial_transactions FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 6. STORAGE BUCKETS SETUP
INSERT INTO storage.buckets (id, name, public) 
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('property-documents', 'property-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies (Drop old ones first)
DROP POLICY IF EXISTS "Allow authenticated uploads to property-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow uploads to property-images" ON storage.objects;
CREATE POLICY "Allow uploads to property-images" 
    ON storage.objects FOR INSERT 
    TO anon, authenticated 
    WITH CHECK (bucket_id = 'property-images');

DROP POLICY IF EXISTS "Allow public read of property-images" ON storage.objects;
CREATE POLICY "Allow public read of property-images" 
    ON storage.objects FOR SELECT 
    TO public 
    USING (bucket_id = 'property-images');

DROP POLICY IF EXISTS "Allow authenticated delete of property-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow delete of property-images" ON storage.objects;
CREATE POLICY "Allow delete of property-images" 
    ON storage.objects FOR DELETE 
    TO anon, authenticated 
    USING (bucket_id = 'property-images');
