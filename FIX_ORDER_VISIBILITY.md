# Order Visibility Fix

## Problem
Users from the same company were seeing each other's orders. Employee A could see Employee B's live activity and orders.

## Root Cause
The `get_company_orders()` function was returning ALL orders for a company, regardless of whether the user was an admin or a regular employee.

## Solution
Updated the `get_company_orders()` function to:

### For Admins
- Show ALL orders from their company
- Admins are identified by:
  - `profiles.role = 'admin'` OR
  - `profiles.role = 'super_admin'` OR  
  - `profiles.is_super_admin = true`

### For Regular Employees
- Show ONLY their own orders
- Filtered by matching `orders.employee_id` with their employee record

## How It Works

```sql
-- The function now:
1. Checks if user is an admin
2. Gets their company_id
3. Gets their employee_id (if they're an employee)
4. Returns orders WHERE:
   - Order belongs to their company AND
   - (User is admin OR order.employee_id matches their id)
```

## Testing

### Test as Admin:
1. Login as admin user
2. Go to `/orders` page
3. Should see ALL orders from your company

### Test as Employee:
1. Login as regular employee
2. Go to `/order` page  
3. Click "History" tab
4. Should ONLY see your own orders
5. Should NOT see other employees' orders

## Verification

Check current user status:
```sql
-- See if you're an admin
SELECT 
  p.id,
  p.email,
  p.role,
  p.is_super_admin,
  p.company_id
FROM profiles p
WHERE p.id = auth.uid();

-- See your employee record
SELECT 
  e.id,
  e.name,
  e.email,
  e.company_id
FROM employees e
WHERE e.email = (SELECT email FROM auth.users WHERE id = auth.uid());

-- Test the function
SELECT * FROM get_company_orders();
```

## Migration Applied
- Migration name: `fix_employee_order_visibility`
- Status: ✅ Applied successfully
- Effect: Immediate (no app restart needed)

## Notes
- RLS policies on `orders` table remain unchanged
- This fix is at the function level
- Admins still have full visibility (as intended)
- Regular employees now have proper isolation
