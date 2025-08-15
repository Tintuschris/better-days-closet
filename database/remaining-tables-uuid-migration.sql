-- UUID Migration Script for Remaining Tables
-- This script converts remaining table IDs from bigint to UUID
-- Tables: orders, marketing_banners, delivery_addresses, addresses, cart, wishlist

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 1: Add new UUID columns to all remaining tables
ALTER TABLE orders ADD COLUMN new_id UUID DEFAULT uuid_generate_v4();
ALTER TABLE marketing_banners ADD COLUMN new_id UUID DEFAULT uuid_generate_v4();
ALTER TABLE delivery_addresses ADD COLUMN new_id UUID DEFAULT uuid_generate_v4();
ALTER TABLE addresses ADD COLUMN new_id UUID DEFAULT uuid_generate_v4();
ALTER TABLE cart ADD COLUMN new_id UUID DEFAULT uuid_generate_v4();
ALTER TABLE wishlist ADD COLUMN new_id UUID DEFAULT uuid_generate_v4();

-- Add UUID column to order_items for the order_id reference
ALTER TABLE order_items ADD COLUMN new_order_id UUID;

-- Step 2: Create mapping tables to track old ID to new UUID relationships
CREATE TEMP TABLE orders_id_mapping AS
SELECT id as old_id, new_id as new_uuid FROM orders;

CREATE TEMP TABLE marketing_banners_id_mapping AS
SELECT id as old_id, new_id as new_uuid FROM marketing_banners;

CREATE TEMP TABLE delivery_addresses_id_mapping AS
SELECT id as old_id, new_id as new_uuid FROM delivery_addresses;

CREATE TEMP TABLE addresses_id_mapping AS
SELECT id as old_id, new_id as new_uuid FROM addresses;

CREATE TEMP TABLE cart_id_mapping AS
SELECT id as old_id, new_id as new_uuid FROM cart;

CREATE TEMP TABLE wishlist_id_mapping AS
SELECT id as old_id, new_id as new_uuid FROM wishlist;

-- Step 3: Update foreign key references
-- Update order_items.new_order_id to reference the new orders UUID
UPDATE order_items
SET new_order_id = orders_id_mapping.new_uuid
FROM orders_id_mapping
WHERE order_items.order_id = orders_id_mapping.old_id;

-- Step 4: Drop foreign key constraints that reference these tables
-- Drop the foreign key constraint from order_items to orders
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_order_id_fkey;

-- Step 5: Drop primary key constraints and update tables
-- Orders table
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_pkey;
ALTER TABLE orders DROP COLUMN id;
ALTER TABLE orders RENAME COLUMN new_id TO id;
ALTER TABLE orders ADD PRIMARY KEY (id);

-- Marketing banners table
ALTER TABLE marketing_banners DROP CONSTRAINT IF EXISTS marketing_banners_pkey;
ALTER TABLE marketing_banners DROP COLUMN id;
ALTER TABLE marketing_banners RENAME COLUMN new_id TO id;
ALTER TABLE marketing_banners ADD PRIMARY KEY (id);

-- Delivery addresses table
ALTER TABLE delivery_addresses DROP CONSTRAINT IF EXISTS delivery_addresses_pkey;
ALTER TABLE delivery_addresses DROP COLUMN id;
ALTER TABLE delivery_addresses RENAME COLUMN new_id TO id;
ALTER TABLE delivery_addresses ADD PRIMARY KEY (id);

-- Addresses table
ALTER TABLE addresses DROP CONSTRAINT IF EXISTS addresses_pkey;
ALTER TABLE addresses DROP COLUMN id;
ALTER TABLE addresses RENAME COLUMN new_id TO id;
ALTER TABLE addresses ADD PRIMARY KEY (id);

-- Cart table
ALTER TABLE cart DROP CONSTRAINT IF EXISTS cart_pkey;
ALTER TABLE cart DROP COLUMN id;
ALTER TABLE cart RENAME COLUMN new_id TO id;
ALTER TABLE cart ADD PRIMARY KEY (id);

-- Wishlist table
ALTER TABLE wishlist DROP CONSTRAINT IF EXISTS wishlist_pkey;
ALTER TABLE wishlist DROP COLUMN id;
ALTER TABLE wishlist RENAME COLUMN new_id TO id;
ALTER TABLE wishlist ADD PRIMARY KEY (id);

-- Step 6: Update order_items table to use new UUID order_id
ALTER TABLE order_items DROP COLUMN IF EXISTS order_id;
ALTER TABLE order_items RENAME COLUMN new_order_id TO order_id;

-- Step 7: Re-create foreign key constraints
-- Re-create the foreign key constraint from order_items to orders
ALTER TABLE order_items ADD CONSTRAINT order_items_order_id_fkey
    FOREIGN KEY (order_id) REFERENCES orders(id);

-- Step 8: Clean up temporary tables
DROP TABLE orders_id_mapping;
DROP TABLE marketing_banners_id_mapping;
DROP TABLE delivery_addresses_id_mapping;
DROP TABLE addresses_id_mapping;
DROP TABLE cart_id_mapping;
DROP TABLE wishlist_id_mapping;

-- Step 9: Verify the migration
-- You can run these queries to verify the migration was successful:
-- SELECT 'orders' as table_name, pg_typeof(id) as id_type FROM orders LIMIT 1
-- UNION ALL
-- SELECT 'marketing_banners', pg_typeof(id) FROM marketing_banners LIMIT 1
-- UNION ALL
-- SELECT 'delivery_addresses', pg_typeof(id) FROM delivery_addresses LIMIT 1
-- UNION ALL
-- SELECT 'addresses', pg_typeof(id) FROM addresses LIMIT 1
-- UNION ALL
-- SELECT 'cart', pg_typeof(id) FROM cart LIMIT 1
-- UNION ALL
-- SELECT 'wishlist', pg_typeof(id) FROM wishlist LIMIT 1;

-- Note: This migration should be run in a transaction and tested thoroughly
-- BEGIN;
-- ... run migration ...
-- COMMIT; (or ROLLBACK; if issues)

-- IMPORTANT: Run this script AFTER the main uuid-migration.sql script
-- since these tables reference the core tables (products, categories, etc.)
