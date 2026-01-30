-- Enable RLS and add policy for menu_items

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Allow everyone (including anonymous if needed, but definitely authenticated) to read menu items
CREATE POLICY "Enable read access for all users" ON "public"."menu_items"
AS PERMISSIVE FOR SELECT
TO public
USING (true);
