#!/bin/bash

# Seed menu items into Supabase database
# This script populates the menu_items table with a delicious selection

echo "🍽️ Seeding menu items into database..."

# Using npx supabase to execute SQL
npx supabase db execute --db-url "$DATABASE_URL" <<'SQL'
INSERT INTO menu_items (name, price, category, available) VALUES 
-- Drinks  
('Espresso', 45, 'drinks', true),
('Cappuccino', 55, 'drinks', true),
('Latte', 55, 'drinks', true),
('Americano', 50, 'drinks', true),
('Mocha', 60, 'drinks', true),
('Iced Coffee', 50, 'drinks', true),
('Fresh Orange Juice', 40, 'drinks', true),
('Ethiopian Coffee', 65, 'drinks', true),

-- Food
('Croissant', 35, 'food', true),
('Chocolate Muffin', 40, 'food', true),
('Blueberry Muffin', 40, 'food', true),
('Chicken Sandwich', 75, 'food', true),
('Veggie Wrap', 70, 'food', true),
('Club Sandwich', 80, 'food', true),
('Caesar Salad', 65, 'food', true),

-- Snacks
('Chocolate Chip Cookie', 25, 'snacks', true),
('Brownie', 30, 'snacks', true),
('Banana Bread', 35, 'snacks', true),
('Mixed Nuts', 45, 'snacks', true),
('Granola Bar', 20, 'snacks', true),
('Fruit Cup', 40, 'snacks', true)

ON CONFLICT (id) DO NOTHING;
SQL

echo "✅ Menu items seeded successfully!"
echo "📊 Total items: 21 (8 drinks, 7 food items, 6 snacks)"
