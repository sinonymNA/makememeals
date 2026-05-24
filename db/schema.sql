-- MakeMeMeals — PostgreSQL Schema
-- Run this in Railway: open your Postgres service > Query tab, paste and run

CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id      TEXT UNIQUE NOT NULL,
  email         TEXT NOT NULL,
  subscription  TEXT DEFAULT 'free',   -- free | active | cancelled
  free_weeks    INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Guest users (no Clerk account)
CREATE TABLE IF NOT EXISTS guest_sessions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_key TEXT UNIQUE NOT NULL,
  used        BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS preferences (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES users(id) ON DELETE CASCADE,
  servings         INT DEFAULT 4,
  picky_eaters     BOOLEAN DEFAULT FALSE,
  keep_mild        BOOLEAN DEFAULT FALSE,
  meat_free        BOOLEAN DEFAULT FALSE,
  gluten_free      BOOLEAN DEFAULT FALSE,
  dairy_free       BOOLEAN DEFAULT FALSE,
  thirty_min_max   BOOLEAN DEFAULT FALSE,
  high_protein     BOOLEAN DEFAULT FALSE,
  low_waste        BOOLEAN DEFAULT FALSE,
  budget           INT DEFAULT 100,
  store            TEXT DEFAULT 'Any',
  UNIQUE (user_id)
);

CREATE TABLE IF NOT EXISTS meal_plans (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  is_guest    BOOLEAN DEFAULT FALSE,
  days        INT NOT NULL,
  week_of     DATE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS meals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id         UUID REFERENCES meal_plans(id) ON DELETE CASCADE,
  day_number      INT NOT NULL,
  name            TEXT NOT NULL,
  description     TEXT,
  prep_minutes    INT,
  difficulty      TEXT,
  ingredients     JSONB,
  steps           JSONB,
  estimated_cost  NUMERIC(6,2),
  emoji           TEXT
);

CREATE TABLE IF NOT EXISTS grocery_lists (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id         UUID REFERENCES meal_plans(id) ON DELETE CASCADE,
  items           JSONB,
  estimated_total NUMERIC(8,2),
  UNIQUE (plan_id)
);

-- Indexes for common lookups
CREATE INDEX IF NOT EXISTS idx_users_clerk_id    ON users(clerk_id);
CREATE INDEX IF NOT EXISTS idx_plans_user_id     ON meal_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_meals_plan_id     ON meals(plan_id);
CREATE INDEX IF NOT EXISTS idx_grocery_plan_id   ON grocery_lists(plan_id);
CREATE INDEX IF NOT EXISTS idx_prefs_user_id     ON preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_guest_key         ON guest_sessions(session_key);

-- Add new columns to existing tables (safe to run on existing DBs)
ALTER TABLE preferences ADD COLUMN IF NOT EXISTS budget       INT     DEFAULT 100;
ALTER TABLE preferences ADD COLUMN IF NOT EXISTS store        TEXT    DEFAULT 'Any';
ALTER TABLE preferences ADD COLUMN IF NOT EXISTS high_protein BOOLEAN DEFAULT FALSE;
ALTER TABLE preferences ADD COLUMN IF NOT EXISTS low_waste    BOOLEAN DEFAULT FALSE;
ALTER TABLE meal_plans  ADD COLUMN IF NOT EXISTS is_guest     BOOLEAN DEFAULT FALSE;

ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id     TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS promo_code             TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS promo_redeemed_at      TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS free_plans_used        INT DEFAULT 0;

-- Recipe card system
ALTER TABLE meals ADD COLUMN IF NOT EXISTS cuisine      TEXT;
ALTER TABLE meals ADD COLUMN IF NOT EXISTS pexels_query TEXT;
ALTER TABLE meals ADD COLUMN IF NOT EXISTS chef_tip     TEXT;
ALTER TABLE meals ADD COLUMN IF NOT EXISTS inspired_by  TEXT;
ALTER TABLE meal_plans ADD COLUMN IF NOT EXISTS meal_emojis JSONB;

-- Admin flag
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Pantry / fridge tracker
CREATE TABLE IF NOT EXISTS pantry_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  quantity    NUMERIC(10,2),
  unit        TEXT,
  category    TEXT DEFAULT 'other',
  expires_at  DATE,
  added_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pantry_user_id ON pantry_items(user_id);

-- Uploaded recipe cards (admin-curated + user-submitted)
CREATE TABLE IF NOT EXISTS recipe_cards (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  source       TEXT DEFAULT 'user',
  image_url    TEXT,
  name         TEXT,
  cuisine      TEXT,
  description  TEXT,
  ingredients  JSONB DEFAULT '[]',
  steps        JSONB DEFAULT '[]',
  prep_minutes INT,
  servings     INT,
  chef_tip     TEXT,
  approved     BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_recipe_cards_user_id  ON recipe_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_cards_approved ON recipe_cards(approved);

-- Coupons
CREATE TABLE IF NOT EXISTS coupons (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store       TEXT NOT NULL DEFAULT 'all',
  brand       TEXT,
  product     TEXT NOT NULL,
  description TEXT,
  discount    TEXT,
  category    TEXT,
  image_emoji TEXT DEFAULT '🏷️',
  valid_until DATE,
  keywords    TEXT[] DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_coupons_store ON coupons(store);

-- Seed admin recipe cards (only if table is empty)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM recipe_cards LIMIT 1) THEN
    INSERT INTO recipe_cards
      (source, image_url, name, cuisine, description, ingredients, steps, prep_minutes, servings, estimated_cost, chef_tip, inspired_by, approved)
    VALUES
    (
      'admin', NULL,
      'Shrimp Fra Diavolo',
      'italian',
      'A fiery Italian-American classic — seared shrimp in a spicy tomato sauce tossed with al dente linguine. Restaurant quality, done in 25 minutes.',
      '[{"name":"large shrimp","quantity":"1","unit":"lb"},{"name":"linguine","quantity":"16","unit":"oz"},{"name":"crushed tomatoes","quantity":"28","unit":"oz"},{"name":"white wine (Pinot Grigio)","quantity":"0.5","unit":"cup"},{"name":"garlic","quantity":"4","unit":"cloves"},{"name":"red pepper flakes","quantity":"1","unit":"tsp"},{"name":"fresh parsley","quantity":"0.25","unit":"cup chopped"},{"name":"olive oil","quantity":"2","unit":"tbsp"},{"name":"butter","quantity":"2","unit":"tbsp"},{"name":"salt and pepper","quantity":"","unit":"to taste"}]',
      '["Cook linguine in heavily salted boiling water until al dente.","Reserve 1 cup pasta water, then drain and set aside.","Season shrimp generously with salt and pepper.","Heat olive oil and 1 tbsp butter in a large skillet over high heat.","Add shrimp and sear 1–2 min per side until pink. Remove and set aside.","Add garlic and red pepper flakes to the same pan. Sauté 30 seconds.","Pour in white wine, scraping up any browned bits. Reduce by half, about 2 min.","Add crushed tomatoes. Simmer 5 minutes until slightly thickened.","Return shrimp to sauce. Add pasta and toss, using pasta water to loosen as needed. Stir in remaining butter and parsley. Serve immediately."]',
      25, 2, 14.00,
      'Save your pasta water — it''s the secret to a silky, restaurant-quality sauce.',
      'Italian coastal tradition',
      TRUE
    ),
    (
      'admin', NULL,
      'Tuscan Ribeye with Rosemary Butter',
      'steakhouse',
      'A butter-basted bone-in ribeye with fragrant rosemary and golden baby potatoes — inspired by Carrabba''s signature Italian steakhouse style.',
      '[{"name":"bone-in ribeye steaks","quantity":"2","unit":"steaks"},{"name":"fresh rosemary","quantity":"2","unit":"sprigs"},{"name":"butter","quantity":"3","unit":"tbsp"},{"name":"minced garlic","quantity":"2","unit":"cloves"},{"name":"baby gold potatoes","quantity":"1","unit":"lb"},{"name":"olive oil","quantity":"2","unit":"tbsp"},{"name":"salt and pepper","quantity":"","unit":"to taste"}]',
      '["Take steaks out of the fridge 30 minutes before cooking to come to room temperature.","Boil or roast baby potatoes until golden and tender. Season with salt and olive oil.","Preheat a heavy cast iron skillet over high heat until smoking.","Pat steaks dry and season generously with salt and pepper on both sides.","Add olive oil to skillet. Sear steaks 3–4 minutes per side without moving.","Reduce heat to medium. Add butter, garlic, and rosemary.","Tilt the pan and use a spoon to continuously baste the steaks with the foamy butter for 1–2 minutes.","Cook to your desired doneness (125°F rare, 135°F medium-rare, 145°F medium).","Transfer steaks to a cutting board. Rest 5 full minutes before slicing. Serve with potatoes."]',
      25, 2, 18.00,
      'Let the steak rest 5 full minutes before cutting — this is non-negotiable. Cutting too early loses all the juices.',
      'Carrabba''s',
      TRUE
    );
  END IF;
END $$;

-- Seed sample coupons (only if table is empty)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM coupons LIMIT 1) THEN
    INSERT INTO coupons (store, brand, product, description, discount, category, image_emoji, valid_until, keywords) VALUES
      ('kroger',   'Tyson',    'Chicken Breast',      'Fresh boneless skinless chicken breast',     '$2.00 off',    'meat',      '🍗', CURRENT_DATE + 30, ARRAY['chicken','breast','tyson']),
      ('kroger',   'Kraft',    'Shredded Cheese',     'Any variety 8oz bag',                        '$1.00 off',    'dairy',     '🧀', CURRENT_DATE + 14, ARRAY['cheese','shredded','kraft','cheddar','mozzarella']),
      ('kroger',   'Kellogg''s','Cereal',             'Any Kellogg''s cereal box 12oz+',            'Buy 2 Get 1',  'grains',    '🥣', CURRENT_DATE + 21, ARRAY['cereal','kelloggs','cornflakes','granola']),
      ('kroger',   NULL,       'Fresh Salmon Fillet', 'Wild-caught Atlantic salmon per lb',         '$3.00 off/lb', 'seafood',   '🐟', CURRENT_DATE + 7,  ARRAY['salmon','fish','seafood','fillet']),
      ('kroger',   'Dole',     'Salad Kit',           'Dole chopped salad kit 10-13oz',             '$0.75 off',    'produce',   '🥗', CURRENT_DATE + 10, ARRAY['salad','lettuce','greens','dole']),
      ('kroger',   'Hunt''s',  'Canned Tomatoes',     'Hunt''s diced or crushed tomatoes 14.5oz',  '4 for $5',     'canned',    '🍅', CURRENT_DATE + 45, ARRAY['tomato','tomatoes','canned','hunts','diced']),
      ('kroger',   'Barilla',  'Pasta',               'Any Barilla pasta 12-16oz',                  'Buy 2 Get 1',  'grains',    '🍝', CURRENT_DATE + 60, ARRAY['pasta','barilla','spaghetti','penne','linguine','fettuccine']),
      ('kroger',   'Chobani',  'Greek Yogurt',        'Chobani Greek yogurt any flavor 5.3oz',      '5 for $5',     'dairy',     '🥛', CURRENT_DATE + 14, ARRAY['yogurt','greek yogurt','chobani']),
      ('publix',   NULL,       'Ground Beef 80/20',   '1 lb package fresh ground beef',             '$1.50 off',    'meat',      '🥩', CURRENT_DATE + 5,  ARRAY['beef','ground beef','hamburger','meat']),
      ('publix',   'Pepperidge Farm','Bread',         'Pepperidge Farm sandwich bread any variety', 'Buy 1 Get 1',  'grains',    '🍞', CURRENT_DATE + 7,  ARRAY['bread','sandwich bread','loaf','pepperidge']),
      ('publix',   'Minute Maid','Orange Juice',      'Minute Maid 59oz carton',                    '$1.25 off',    'beverages', '🍊', CURRENT_DATE + 21, ARRAY['orange juice','juice','minute maid','OJ']),
      ('publix',   NULL,       'Shrimp',              'Large 21-25 count raw shrimp per lb',        '$2.00 off/lb', 'seafood',   '🦐', CURRENT_DATE + 7,  ARRAY['shrimp','seafood','prawn']),
      ('publix',   'Boar''s Head','Deli Meat',        'Any Boar''s Head deli meat 0.5lb',           '$1.00 off',    'meat',      '🥪', CURRENT_DATE + 10, ARRAY['deli','turkey','ham','roast beef','boars head']),
      ('publix',   NULL,       'Avocados',            'Hass avocados each',                         '3 for $3',     'produce',   '🥑', CURRENT_DATE + 5,  ARRAY['avocado','avocados','hass']),
      ('walmart',  'Great Value','Eggs',              'Great Value large eggs 12ct',                '$0.50 off',    'dairy',     '🥚', CURRENT_DATE + 21, ARRAY['eggs','egg','dozen']),
      ('walmart',  'Bertolli', 'Olive Oil',           'Bertolli extra virgin olive oil 16.9oz',     '$1.00 off',    'condiments','🫙', CURRENT_DATE + 90, ARRAY['olive oil','oil','bertolli','evoo']),
      ('walmart',  'McCormick','Spices',              'Any McCormick spice or seasoning',            'Buy 2 Get 1',  'condiments','🌶️', CURRENT_DATE + 90, ARRAY['spice','seasoning','mccormick','garlic','onion','paprika','cumin']),
      ('walmart',  'Birds Eye','Frozen Vegetables',   'Birds Eye frozen vegetables any variety',    '2 for $4',     'frozen',    '🥦', CURRENT_DATE + 60, ARRAY['frozen vegetables','broccoli','mixed vegetables','birds eye','peas','corn']),
      ('all',      'Goya',     'Black Beans',         'Goya black beans 15oz can',                  '3 for $2',     'canned',    '🫘', CURRENT_DATE + 90, ARRAY['beans','black beans','goya','legumes']),
      ('all',      'Quaker',   'Oats',                'Quaker old fashioned oats 18oz',             '$1.00 off',    'grains',    '🌾', CURRENT_DATE + 90, ARRAY['oats','oatmeal','quaker','breakfast']),
      ('all',      NULL,       'Sweet Potatoes',      'Fresh sweet potatoes per lb',                '$0.50 off/lb', 'produce',   '🍠', CURRENT_DATE + 14, ARRAY['sweet potato','sweet potatoes','yam']),
      ('all',      'Heinz',    'Ketchup',             'Heinz tomato ketchup 32oz',                  '$0.75 off',    'condiments','🍅', CURRENT_DATE + 90, ARRAY['ketchup','heinz','condiment']),
      ('all',      NULL,       'Limes',               'Fresh limes bag 2lb',                        '2 for $3',     'produce',   '🍋', CURRENT_DATE + 7,  ARRAY['lime','limes','citrus']),
      ('all',      'Classico', 'Pasta Sauce',         'Classico tomato pasta sauce 24oz jar',       'Buy 2 for $6', 'canned',    '🫙', CURRENT_DATE + 90, ARRAY['pasta sauce','marinara','classico','tomato sauce']),
      ('all',      NULL,       'Garlic',              'Fresh garlic bulb each',                     '3 for $2',     'produce',   '🧄', CURRENT_DATE + 14, ARRAY['garlic','bulb','clove']),
      ('all',      NULL,       'Yellow Onions',       'Yellow onions 3lb bag',                      '$0.75 off',    'produce',   '🧅', CURRENT_DATE + 14, ARRAY['onion','onions','yellow onion']),
      ('all',      'Bush''s',  'Baked Beans',         'Bush''s Best baked beans any variety 28oz', '$0.50 off',    'canned',    '🫘', CURRENT_DATE + 90, ARRAY['baked beans','beans','bushs'])
    ;
  END IF;
END $$;
