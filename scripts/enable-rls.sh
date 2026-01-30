#!/bin/bash

# Enable RLS on menu_items

echo "🛡️ Enabling RLS on menu_items..."

# Using npx supabase to execute SQL
npx supabase db execute --db-url "$DATABASE_URL" -f supabase/enable_menu_rls.sql

echo "✅ RLS enabled successfully!"
