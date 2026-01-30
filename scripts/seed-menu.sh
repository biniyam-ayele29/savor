#!/bin/bash

# Seed the menu_items table

echo "🌱 Seeding menu items..."

# Using npx supabase to execute SQL
npx supabase db execute --db-url "$DATABASE_URL" -f supabase/seed_menu_items.sql

echo "✅ Menu items seeded successfully!"
