-- Add missing fields to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_promoted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS brand TEXT,
ADD COLUMN IF NOT EXISTS sku TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS weight NUMERIC,
ADD COLUMN IF NOT EXISTS dimensions JSONB,
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Add missing fields to categories table
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES categories(id),
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Add missing fields to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS delivery_address TEXT,
ADD COLUMN IF NOT EXISTS customer_notes TEXT,
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Add missing fields to delivery_addresses table
ALTER TABLE delivery_addresses 
ADD COLUMN IF NOT EXISTS estimated_days INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_is_promoted ON products(is_promoted);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_sort_order ON products(sort_order);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_delivery_addresses_is_active ON delivery_addresses(is_active);

-- Add some sample data for new fields (optional)
UPDATE products SET is_active = TRUE WHERE is_active IS NULL;
UPDATE categories SET is_active = TRUE WHERE is_active IS NULL;
UPDATE delivery_addresses SET is_active = TRUE WHERE is_active IS NULL;

-- Add constraints
ALTER TABLE products ADD CONSTRAINT chk_products_weight_positive CHECK (weight IS NULL OR weight >= 0);
ALTER TABLE products ADD CONSTRAINT chk_products_sort_order_positive CHECK (sort_order >= 0);
ALTER TABLE categories ADD CONSTRAINT chk_categories_sort_order_positive CHECK (sort_order >= 0);
ALTER TABLE delivery_addresses ADD CONSTRAINT chk_delivery_estimated_days_positive CHECK (estimated_days > 0);
