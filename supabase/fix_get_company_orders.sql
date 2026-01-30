-- Fix for ambiguous column reference in get_company_orders function
-- The issue was that 'company_id' was used both as a variable and a column name
-- This version also explicitly defines the return table structure to include employee_name

DROP FUNCTION IF EXISTS get_company_orders() CASCADE;
DROP FUNCTION IF EXISTS public.get_company_orders() CASCADE;

CREATE OR REPLACE FUNCTION get_company_orders()
RETURNS TABLE (
  id uuid,
  total_price numeric,
  floor_number integer, -- Accessing as integer based on types.ts
  status text,          -- Cast to text to be safe if it's an enum
  company_id uuid,
  employee_id uuid,
  employee_name text,
created_at timestamptz,
  updated_at timestamptz
) AS $$
DECLARE
  v_company_id uuid; -- Distinct variable name to avoid ambiguity
BEGIN
  -- Get the company_id for the current user
  -- QUALIFY the column names to be safe
  SELECT ca.company_id INTO v_company_id
  FROM company_admins ca
  WHERE ca.user_id = auth.uid()
  LIMIT 1;

  -- Return orders for that company joined with employees to get names
  RETURN QUERY
  SELECT 
    o.id,
    o.total_price,
    o.floor_number,
    o.status::text, -- Cast to text to match return type
    o.company_id,
    o.employee_id,
    e.name as employee_name,
    o.created_at,
    o.updated_at
  FROM orders o
  LEFT JOIN employees e ON e.id = o.employee_id
  WHERE o.company_id = v_company_id
  ORDER BY o.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
