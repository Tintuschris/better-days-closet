-- UUID Migration Script for Better Days Closet
-- This script converts all ID columns from bigint to UUID

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 1: Add new UUID columns to all tables
ALTER TABLE categories ADD COLUMN new_id UUID DEFAULT uuid_generate_v4();
ALTER TABLE products ADD COLUMN new_id UUID DEFAULT uuid_generate_v4();
ALTER TABLE products ADD COLUMN new_category_id UUID;
ALTER TABLE product_variants ADD COLUMN new_id UUID DEFAULT uuid_generate_v4();
ALTER TABLE product_variants ADD COLUMN new_product_id UUID;
ALTER TABLE category_attributes ADD COLUMN new_id UUID DEFAULT uuid_generate_v4();
ALTER TABLE category_attributes ADD COLUMN new_category_id UUID;

-- Add UUID columns to referencing tables
ALTER TABLE cart ADD COLUMN new_product_id UUID;
ALTER TABLE cart ADD COLUMN new_variant_id UUID;
ALTER TABLE order_items ADD COLUMN new_product_id UUID;
ALTER TABLE order_items ADD COLUMN new_variant_id UUID;
ALTER TABLE wishlist ADD COLUMN new_product_id UUID;
ALTER TABLE wishlist ADD COLUMN new_variant_id UUID;

-- Step 2: Create mapping tables to track old ID to new UUID relationships
CREATE TEMP TABLE category_id_mapping AS
SELECT id as old_id, new_id as new_uuid FROM categories;

CREATE TEMP TABLE product_id_mapping AS
SELECT id as old_id, new_id as new_uuid FROM products;

CREATE TEMP TABLE product_variant_id_mapping AS
SELECT id as old_id, new_id as new_uuid FROM product_variants;

-- Step 3: Update foreign key references
-- Update products.new_category_id
UPDATE products
SET new_category_id = category_id_mapping.new_uuid
FROM category_id_mapping
WHERE products.category_id = category_id_mapping.old_id;

-- Update product_variants.new_product_id
UPDATE product_variants
SET new_product_id = product_id_mapping.new_uuid
FROM product_id_mapping
WHERE product_variants.product_id = product_id_mapping.old_id;

-- Update category_attributes.new_category_id
UPDATE category_attributes
SET new_category_id = category_id_mapping.new_uuid
FROM category_id_mapping
WHERE category_attributes.category_id = category_id_mapping.old_id;

-- Update cart table references
UPDATE cart
SET new_product_id = product_id_mapping.new_uuid
FROM product_id_mapping
WHERE cart.product_id = product_id_mapping.old_id;

UPDATE cart
SET new_variant_id = product_variant_id_mapping.new_uuid
FROM product_variant_id_mapping
WHERE cart.variant_id = product_variant_id_mapping.old_id;

-- Update order_items table references
UPDATE order_items
SET new_product_id = product_id_mapping.new_uuid
FROM product_id_mapping
WHERE order_items.product_id = product_id_mapping.old_id;

UPDATE order_items
SET new_variant_id = product_variant_id_mapping.new_uuid
FROM product_variant_id_mapping
WHERE order_items.variant_id = product_variant_id_mapping.old_id;

-- Update wishlist table references
UPDATE wishlist
SET new_product_id = product_id_mapping.new_uuid
FROM product_id_mapping
WHERE wishlist.product_id = product_id_mapping.old_id;

UPDATE wishlist
SET new_variant_id = product_variant_id_mapping.new_uuid
FROM product_variant_id_mapping
WHERE wishlist.variant_id = product_variant_id_mapping.old_id;

-- Step 4: Drop ALL foreign key constraints first (in reverse dependency order)
-- Drop constraints that reference product_variants
ALTER TABLE cart DROP CONSTRAINT IF EXISTS cart_variant_id_fkey;
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_variant_id_fkey;
ALTER TABLE wishlist DROP CONSTRAINT IF EXISTS wishlist_variant_id_fkey;

-- Drop constraints that reference products
ALTER TABLE product_variants DROP CONSTRAINT IF EXISTS product_variants_product_id_fkey;
ALTER TABLE cart DROP CONSTRAINT IF EXISTS cart_product_id_fkey;
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;
ALTER TABLE wishlist DROP CONSTRAINT IF EXISTS wishlist_product_id_fkey;

-- Drop constraints that reference categories
ALTER TABLE category_attributes DROP CONSTRAINT IF EXISTS category_attributes_category_id_fkey;
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_id_fkey;
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_id_fkey1;

-- Step 5: Drop primary key constraints and old columns, rename new columns
-- Category attributes table (no dependencies)
ALTER TABLE category_attributes DROP CONSTRAINT IF EXISTS category_attributes_pkey;
ALTER TABLE category_attributes DROP COLUMN id;
ALTER TABLE category_attributes DROP COLUMN category_id;
ALTER TABLE category_attributes RENAME COLUMN new_id TO id;
ALTER TABLE category_attributes RENAME COLUMN new_category_id TO category_id;
ALTER TABLE category_attributes ADD PRIMARY KEY (id);

-- Product variants table (depends on products)
ALTER TABLE product_variants DROP CONSTRAINT IF EXISTS product_variants_pkey;
ALTER TABLE product_variants DROP COLUMN id;
ALTER TABLE product_variants DROP COLUMN product_id;
ALTER TABLE product_variants RENAME COLUMN new_id TO id;
ALTER TABLE product_variants RENAME COLUMN new_product_id TO product_id;
ALTER TABLE product_variants ADD PRIMARY KEY (id);

-- Products table (depends on categories)
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_pkey;
ALTER TABLE products DROP COLUMN id;
ALTER TABLE products DROP COLUMN category_id;
ALTER TABLE products RENAME COLUMN new_id TO id;
ALTER TABLE products RENAME COLUMN new_category_id TO category_id;
ALTER TABLE products ADD PRIMARY KEY (id);

-- Categories table (root table)
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_pkey;
ALTER TABLE categories DROP COLUMN id;
ALTER TABLE categories RENAME COLUMN new_id TO id;
ALTER TABLE categories ADD PRIMARY KEY (id);

-- Step 6: Update referencing tables (drop old columns, rename new ones)
-- Cart table
ALTER TABLE cart DROP COLUMN IF EXISTS product_id;
ALTER TABLE cart DROP COLUMN IF EXISTS variant_id;
ALTER TABLE cart RENAME COLUMN new_product_id TO product_id;
ALTER TABLE cart RENAME COLUMN new_variant_id TO variant_id;

-- Order items table
ALTER TABLE order_items DROP COLUMN IF EXISTS product_id;
ALTER TABLE order_items DROP COLUMN IF EXISTS variant_id;
ALTER TABLE order_items RENAME COLUMN new_product_id TO product_id;
ALTER TABLE order_items RENAME COLUMN new_variant_id TO variant_id;

-- Wishlist table
ALTER TABLE wishlist DROP COLUMN IF EXISTS product_id;
ALTER TABLE wishlist DROP COLUMN IF EXISTS variant_id;
ALTER TABLE wishlist RENAME COLUMN new_product_id TO product_id;
ALTER TABLE wishlist RENAME COLUMN new_variant_id TO variant_id;

-- Step 7: Re-create foreign key constraints
ALTER TABLE products ADD CONSTRAINT products_category_id_fkey
    FOREIGN KEY (category_id) REFERENCES categories(id);

ALTER TABLE product_variants ADD CONSTRAINT product_variants_product_id_fkey
    FOREIGN KEY (product_id) REFERENCES products(id);

ALTER TABLE category_attributes ADD CONSTRAINT category_attributes_category_id_fkey
    FOREIGN KEY (category_id) REFERENCES categories(id);

-- Re-create constraints for referencing tables
ALTER TABLE cart ADD CONSTRAINT cart_product_id_fkey
    FOREIGN KEY (product_id) REFERENCES products(id);

ALTER TABLE cart ADD CONSTRAINT cart_variant_id_fkey
    FOREIGN KEY (variant_id) REFERENCES product_variants(id);

ALTER TABLE order_items ADD CONSTRAINT order_items_product_id_fkey
    FOREIGN KEY (product_id) REFERENCES products(id);

ALTER TABLE order_items ADD CONSTRAINT order_items_variant_id_fkey
    FOREIGN KEY (variant_id) REFERENCES product_variants(id);

ALTER TABLE wishlist ADD CONSTRAINT wishlist_product_id_fkey
    FOREIGN KEY (product_id) REFERENCES products(id);

ALTER TABLE wishlist ADD CONSTRAINT wishlist_variant_id_fkey
    FOREIGN KEY (variant_id) REFERENCES product_variants(id);

-- Step 5: Update other tables that reference these IDs (add as needed)
-- You'll need to update these tables as well:
-- - cart (product_id)
-- - wishlist (product_id)
-- - order_items (product_id)
-- - addresses (user_id if using UUID for users)
-- - orders (user_id if using UUID for users)

-- Example for cart table:
-- ALTER TABLE cart ADD COLUMN new_product_id UUID;
-- UPDATE cart 
-- SET new_product_id = product_id_mapping.new_uuid
-- FROM product_id_mapping
-- WHERE cart.product_id = product_id_mapping.old_id;
-- ALTER TABLE cart DROP CONSTRAINT IF EXISTS cart_product_id_fkey;
-- ALTER TABLE cart DROP COLUMN product_id;
-- ALTER TABLE cart RENAME COLUMN new_product_id TO product_id;
-- ALTER TABLE cart ADD CONSTRAINT cart_product_id_fkey 
--     FOREIGN KEY (product_id) REFERENCES products(id);

-- Example for wishlist table:
-- ALTER TABLE wishlist ADD COLUMN new_product_id UUID;
-- UPDATE wishlist 
-- SET new_product_id = product_id_mapping.new_uuid
-- FROM product_id_mapping
-- WHERE wishlist.product_id = product_id_mapping.old_id;
-- ALTER TABLE wishlist DROP CONSTRAINT IF EXISTS wishlist_product_id_fkey;
-- ALTER TABLE wishlist DROP COLUMN product_id;
-- ALTER TABLE wishlist RENAME COLUMN new_product_id TO product_id;
-- ALTER TABLE wishlist ADD CONSTRAINT wishlist_product_id_fkey 
--     FOREIGN KEY (product_id) REFERENCES products(id);

-- Step 8: Clean up temporary tables
DROP TABLE category_id_mapping;
DROP TABLE product_id_mapping;
DROP TABLE product_variant_id_mapping;

-- Note: This migration should be run in a transaction and tested thoroughly
-- BEGIN;
-- ... run migration ...
-- COMMIT; (or ROLLBACK; if issues)
