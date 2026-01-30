-- Seed menu items with a delicious selection
INSERT INTO menu_items (name, price, category, available, image) VALUES
-- Drinks
('Espresso', 45, 'drinks', true, null),
('Cappuccino', 55, 'drinks', true, null),
('Latte', 55, 'drinks', true, null),
('Americano', 50, 'drinks', true, null),
('Mocha', 60, 'drinks', true, null),
('Iced Coffee', 50, 'drinks', true, null),
('Fresh Orange Juice', 40, 'drinks', true, null),
('Ethiopian Coffee', 65, 'drinks', true, null),

-- Food
('Croissant', 35, 'food', true, null),
('Chocolate Muffin', 40, 'food', true, null),
('Blueberry Muffin', 40, 'food', true, null),
('Chicken Sandwich', 75, 'food', true, null),
('Veggie Wrap', 70, 'food', true, null),
('Club Sandwich', 80, 'food', true, null),
('Caesar Salad', 65, 'food', true, null),

-- Snacks
('Chocolate Chip Cookie', 25, 'snacks', true, null),
('Brownie', 30, 'snacks', true, null),
('Banana Bread', 35, 'snacks', true, null),
('Mixed Nuts', 45, 'snacks', true, null),
('Granola Bar', 20, 'snacks', true, null),
('Fruit Cup', 40, 'snacks', true, null);
