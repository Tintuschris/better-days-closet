# Profile Pages Redesign Plan

## Current Issues
1. Complex tab-based state management with URL parameters
2. Different mobile/desktop implementations causing code duplication  
3. AnimatePresence complexity for tab switching
4. Limited scalability for new profile sections

## Recommended Page Structure

### New Route Structure:
```
/profile                    → Profile overview/dashboard
/profile/orders            → Order history  
/profile/wishlist          → Wishlist management
/profile/addresses         → Delivery addresses
/profile/settings          → Account settings
/profile/notifications     → Notification preferences (new)
/profile/security          → Security settings (new)
```

### Benefits:
- ✅ Better SEO with dedicated pages
- ✅ Simplified navigation and URL structure  
- ✅ Easier deep linking and bookmarking
- ✅ Better mobile/desktop consistency
- ✅ Easier to add new sections
- ✅ Reduced bundle size (code splitting)

## Design System Improvements

### Consistent Layout Pattern:
```jsx
// Standard profile page layout
<ProfileLayout 
  title="Order History"
  backUrl="/profile"
  actions={<NotificationButton />}
>
  <OrdersContent />
</ProfileLayout>
```

### Enhanced Navigation:
- Breadcrumb navigation for deep pages
- Consistent "back to profile" patterns
- Mobile-friendly navigation drawer
- Desktop sidebar with active states

## Database Optimization Recommendations

### Current Performance Issues:
1. Multiple context providers causing re-renders
2. Non-optimized wishlist/order queries
3. Missing database indexes for user-specific queries

### Solutions:
1. **Query Optimization:**
   ```sql
   -- Add indexes for user-specific queries
   CREATE INDEX idx_orders_user_id_created_at ON orders(user_id, created_at DESC);
   CREATE INDEX idx_wishlist_user_id ON wishlist_items(user_id);
   CREATE INDEX idx_addresses_user_id ON delivery_addresses(user_id);
   ```

2. **React Query Integration:**
   - Replace context with React Query for caching
   - Implement optimistic updates for wishlist
   - Add pagination for orders/wishlist

3. **Data Fetching Strategy:**
   ```jsx
   // Replace context with React Query
   const { data: orders } = useQuery(['orders', userId], fetchUserOrders);
   const { data: wishlist } = useQuery(['wishlist', userId], fetchUserWishlist);
   ```

## Implementation Priority:
1. **Phase 1:** Create new route structure  
2. **Phase 2:** Implement ProfileLayout component
3. **Phase 3:** Migrate existing components to new pages
4. **Phase 4:** Database optimization
5. **Phase 5:** Remove old tab-based system
