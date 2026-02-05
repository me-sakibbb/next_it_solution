# Single-Shop Architecture Implementation

## Overview
The application has been refactored to support a **one-shop-per-user** architecture where each user automatically gets their shop created during signup.

## Key Changes

### 1. Database Trigger
A PostgreSQL trigger (`handle_new_user_shop`) automatically creates:
- A shop for the user (using metadata from signup)
- A shop_members entry with 'owner' role
- A trial subscription (14 days) when a user signs up

### 2. Signup Flow Enhancement
The signup form now includes:
- Shop Name (optional, defaults to "[User Name]'s Shop")
- Business Type (retail, wholesale, service, online)
- These are passed as metadata and used by the trigger

### 3. Helper Utility
Created `/lib/get-user-shop.ts` that:
- Authenticates the user
- Fetches their single shop
- Throws error if shop not found (should never happen with trigger)
- Used across all dashboard pages

### 4. Removed Features
- Deleted `/app/dashboard/shops` page (shop listing)
- Deleted `/app/dashboard/shops/new` page (shop creation)
- Removed "Shops" from sidebar navigation
- Removed all shop selection dropdowns

### 5. Updated All Dashboard Pages
Every dashboard page now uses `getUserShop()` instead of manual shop fetching:
- Dashboard home page
- Inventory management
- Sales & POS
- Customers
- Staff management
- Payroll
- Photo editor
- Reports & analytics
- Settings

### 6. Updated Subscription Plans
Removed "shop count" from plan features since users only get one shop:
- Free: 100 Products, 1 Staff Member
- Pro: Unlimited Products, Up to 10 Staff
- Enterprise: Unlimited Products, Unlimited Staff

## Architecture Benefits

### Simplified User Experience
- No confusing shop selection
- Immediate access to features after signup
- Single cohesive business context

### Cleaner Code
- Consistent shop retrieval pattern
- No conditional shop creation flows
- Reduced error handling complexity

### Better Performance
- No shop queries on every page
- Single database call per page load
- Automatic subscription creation

## Migration Notes

For existing users without shops, the trigger won't apply retroactively. Consider running:

```sql
-- One-time migration for existing users
INSERT INTO shops (owner_id, name, business_type, is_active)
SELECT 
  u.id,
  COALESCE(u.full_name || '''s Shop', 'My Shop'),
  'retail',
  true
FROM auth.users u
LEFT JOIN shops s ON s.owner_id = u.id
WHERE s.id IS NULL;
```

## File Structure

### Core Files
- `/lib/get-user-shop.ts` - Shop retrieval helper
- `/app/auth/sign-up/page.tsx` - Enhanced signup with shop details
- Database trigger in migration `auto_create_shop_on_signup`

### Updated Pages
All pages in `/app/dashboard/*/page.tsx` now use the new pattern.

## Future Considerations

If multi-shop support is needed later:
1. Remove the trigger
2. Add back shop management pages
3. Replace `getUserShop()` with shop selection logic
4. Update all pages to accept shop parameter
5. Add shop switcher to header

The current architecture makes it easy to scale back to multi-shop if business requirements change.
