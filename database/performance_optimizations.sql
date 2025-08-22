-- Database Performance Optimization Script
-- Run this to add indexes for user-specific queries

-- Add indexes for faster user-specific queries
CREATE INDEX IF NOT EXISTS idx_orders_user_id_created_at 
ON orders(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_user_status 
ON orders(user_id, status);

CREATE INDEX IF NOT EXISTS idx_wishlist_user_id 
ON wishlist(user_id);

CREATE INDEX IF NOT EXISTS idx_wishlist_user_product 
ON wishlist(user_id, product_id);

-- Note: delivery_addresses table appears to be a reference table for delivery options
-- rather than user-specific addresses, so no user_id indexes needed
-- CREATE INDEX IF NOT EXISTS idx_delivery_addresses_user_id 
-- ON delivery_addresses(user_id);

-- CREATE INDEX IF NOT EXISTS idx_delivery_addresses_user_active 
-- ON delivery_addresses(user_id, is_default);

-- Product-related performance indexes
CREATE INDEX IF NOT EXISTS idx_products_category_name 
ON products(category_name);

CREATE INDEX IF NOT EXISTS idx_products_quantity 
ON products(quantity);

CREATE INDEX IF NOT EXISTS idx_products_created_at 
ON products(created_at DESC);

-- Cart items optimization (cart_items are stored as ARRAY in orders table, not separate table)
-- CREATE INDEX IF NOT EXISTS idx_cart_items_user_id 
-- ON cart_items(user_id);

-- Add RLS (Row Level Security) policies for better security and performance
-- Note: RLS policies are Supabase-specific and optional for basic performance gains
-- Uncomment and modify these sections only if using Supabase with RLS

/*
-- Orders table RLS (Uncomment if using Supabase)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'orders') THEN
        ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view own orders" ON orders;
        CREATE POLICY "Users can view own orders" ON orders
            FOR SELECT USING (auth.uid() = user_id);
            
        DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
        CREATE POLICY "Users can insert own orders" ON orders
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END
$$;

-- Wishlist RLS (Uncomment if using Supabase)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'wishlist') THEN
        ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can manage own wishlist" ON wishlist;
        CREATE POLICY "Users can manage own wishlist" ON wishlist
            FOR ALL USING (auth.uid() = user_id);
    END IF;
END
$$;

-- Delivery addresses RLS (Commented out - delivery_addresses is a reference table)
-- DO $$
-- BEGIN
--     IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'delivery_addresses') THEN
--         ALTER TABLE delivery_addresses ENABLE ROW LEVEL SECURITY;
--         
--         DROP POLICY IF EXISTS "Users can manage own addresses" ON delivery_addresses;
--         CREATE POLICY "Users can manage own addresses" ON delivery_addresses
--             FOR ALL USING (auth.uid() = user_id);
--     END IF;
-- END
-- $$;
*/

-- Analyze tables for better query planning
ANALYZE orders;
ANALYZE wishlist;
ANALYZE delivery_addresses;
ANALYZE products;
-- ANALYZE cart_items; -- Uncomment if cart_items table exists

-- Add comments for documentation
COMMENT ON INDEX idx_orders_user_id_created_at IS 'Optimizes user order history queries';
COMMENT ON INDEX idx_wishlist_user_id IS 'Optimizes user wishlist retrieval';
-- COMMENT ON INDEX idx_delivery_addresses_user_id IS 'Optimizes user address management'; -- Index commented out

-- Optional: Add materialized view for user statistics (if needed for dashboard)
CREATE MATERIALIZED VIEW IF NOT EXISTS user_profile_stats AS
SELECT 
    u.id as user_id,
    u.email,
    COALESCE(w.wishlist_count, 0) as wishlist_count,
    COALESCE(o.order_count, 0) as order_count,
    COALESCE(o.total_spent, 0) as total_spent,
    COALESCE(a.address_count, 0) as address_count
FROM auth.users u
LEFT JOIN (
    SELECT user_id, COUNT(*) as wishlist_count
    FROM wishlist 
    GROUP BY user_id
) w ON u.id = w.user_id
LEFT JOIN (
    SELECT user_id, COUNT(*) as order_count, SUM(total_amount) as total_spent
    FROM orders 
    WHERE status != 'cancelled'
    GROUP BY user_id
) o ON u.id = o.user_id  
LEFT JOIN (
    SELECT 0 as address_count -- delivery_addresses is a reference table, not user-specific
    LIMIT 1
) a ON true;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profile_stats_user_id 
ON user_profile_stats(user_id);

-- Refresh function for the materialized view
CREATE OR REPLACE FUNCTION refresh_user_profile_stats()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW user_profile_stats;
END;
$$;
