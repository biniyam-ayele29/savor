-- Enable RLS and add policies for companies table

-- Enable RLS on companies table
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Simple policy: Allow all authenticated users to read companies
-- (This is reasonable for an internal office cafe system where employees
-- need to see company details for order placement)
CREATE POLICY "Allow authenticated users to read companies" ON "public"."companies"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (true);

-- If you want more restrictive policies, uncomment these and remove the above:

-- -- Policy: Allow users to read companies they're associated with via company_admins
-- CREATE POLICY "Users can read their own company" ON "public"."companies"
-- AS PERMISSIVE FOR SELECT
-- TO authenticated
-- USING (
--   id IN (
--     SELECT company_id 
--     FROM company_admins 
--     WHERE user_id = auth.uid()
--   )
-- );

-- -- Policy: Super admins can read all companies
-- CREATE POLICY "Super admins can read all companies" ON "public"."companies"
-- AS PERMISSIVE FOR SELECT
-- TO authenticated
-- USING (
--   EXISTS (
--     SELECT 1 
--     FROM profiles 
--     WHERE id = auth.uid() 
--     AND role = 'super_admin'
--   )
-- );
