-- Migration: Fix Product Variants Structure
-- This migration fixes the product/variant relationship to follow e-commerce best practices

-- 1. First, let's backup existing data and fix the products table
-- Remove quantity from products table (variants will handle inventory)
-- Fix price column type in products table

BEGIN;

-- Add a backup column for existing price data
ALTER TABLE products ADD COLUMN price_backup text;
UPDATE products SET price_backup = price;

-- Convert price to numeric, handling any invalid data
UPDATE products SET price = '0' WHERE price IS NULL OR price = '' OR price !~ '^[0-9]+\.?[0-9]*$';
ALTER TABLE products ALTER COLUMN price TYPE numeric USING price::numeric;

-- Remove quantity from products table (variants handle inventory)
-- But first, let's create default variants for products that don't have any
INSERT INTO product_variants (product_id, size, color, price, quantity, image_url)
SELECT 
    p.id,
    'One Size' as size,
    'Default' as color,
    p.price,
    COALESCE(p.quantity, 0)::integer,
    p.image_url
FROM products p
WHERE p.id NOT IN (SELECT DISTINCT product_id FROM product_variants WHERE product_id IS NOT NULL)
AND p.price IS NOT NULL;

-- Now we can safely remove quantity from products
ALTER TABLE products DROP COLUMN IF EXISTS quantity;

-- 2. Ensure product_variants table has proper constraints
ALTER TABLE product_variants 
    ALTER COLUMN product_id SET NOT NULL,
    ALTER COLUMN price SET NOT NULL,
    ALTER COLUMN quantity SET NOT NULL;

-- Add foreign key constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'product_variants_product_id_fkey'
    ) THEN
        ALTER TABLE product_variants 
        ADD CONSTRAINT product_variants_product_id_fkey 
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 3. Add useful indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_size ON product_variants(size);
CREATE INDEX IF NOT EXISTS idx_product_variants_color ON product_variants(color);

-- 4. Add a view for easy product display with variant info
CREATE OR REPLACE VIEW products_with_variants AS
SELECT 
    p.*,
    COALESCE(MIN(pv.price), p.price) as min_price,
    COALESCE(MAX(pv.price), p.price) as max_price,
    COALESCE(SUM(pv.quantity), 0) as total_inventory,
    COUNT(pv.id) as variant_count,
    ARRAY_AGG(DISTINCT pv.size ORDER BY pv.size) FILTER (WHERE pv.size IS NOT NULL) as available_sizes,
    ARRAY_AGG(DISTINCT pv.color ORDER BY pv.color) FILTER (WHERE pv.color IS NOT NULL) as available_colors
FROM products p
LEFT JOIN product_variants pv ON p.id = pv.product_id
GROUP BY p.id, p.created_at, p.name, p.price, p.description, p.discount, p.wishlist_count, p.category_name, p.image_url, p.category_id;

-- 5. Create a function to get product display info
CREATE OR REPLACE FUNCTION get_product_display_info(product_uuid uuid)
RETURNS TABLE (
    product_id uuid,
    name text,
    description text,
    category_id uuid,
    category_name text,
    image_url text,
    min_price numeric,
    max_price numeric,
    total_inventory bigint,
    variant_count bigint,
    available_sizes text[],
    available_colors text[],
    discount text,
    wishlist_count numeric
) AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM products_with_variants WHERE id = product_uuid;
END;
$$ LANGUAGE plpgsql;

-- 6. Update any existing orders to reference variants instead of products
-- (This is a placeholder - you might need to adjust based on your orders structure)
-- ALTER TABLE order_items ADD COLUMN variant_id uuid REFERENCES product_variants(id);

COMMIT;

-- Verification queries (run these to check the migration worked)
-- SELECT 'Products without variants:' as check_type, COUNT(*) as count 
-- FROM products p 
-- WHERE p.id NOT IN (SELECT DISTINCT product_id FROM product_variants WHERE product_id IS NOT NULL);

-- SELECT 'Products with variants:' as check_type, COUNT(*) as count 
-- FROM products p 
-- WHERE p.id IN (SELECT DISTINCT product_id FROM product_variants WHERE product_id IS NOT NULL);

-- SELECT 'Total variants:' as check_type, COUNT(*) as count FROM product_variants;
