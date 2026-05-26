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

-- Patch existing recipe_cards table with missing columns
ALTER TABLE recipe_cards ADD COLUMN IF NOT EXISTS estimated_cost NUMERIC(6,2);
ALTER TABLE recipe_cards ADD COLUMN IF NOT EXISTS servings       INT;
ALTER TABLE recipe_cards ADD COLUMN IF NOT EXISTS inspired_by    TEXT;

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

-- Refresh weekly ad coupons on every deploy (clears old, inserts current)
DELETE FROM coupons;
INSERT INTO coupons (store, brand, product, description, discount, category, image_emoji, valid_until, keywords) VALUES
  -- KROGER Wed May 20 – Tue May 26 2026
  ('kroger', NULL,           'Beef Chuck Short Ribs',       'USDA Choice boneless beef chuck short ribs',          '$2.99/lb',      'meat',       '🥩', '2026-05-26', ARRAY['beef','short ribs','chuck','ribs']),
  ('kroger', NULL,           'Pork Shoulder / Pork Ribs',   'Pork shoulder butt or St. Louis style pork ribs',     'BOGO',          'meat',       '🥩', '2026-05-26', ARRAY['pork','shoulder','pork ribs','st louis ribs','ribs']),
  ('kroger', 'Smithfield',   'Bacon',                       'Smithfield bacon',                                    '$3.99',         'meat',       '🥓', '2026-05-26', ARRAY['bacon','smithfield','pork']),
  ('kroger', NULL,           'Asparagus',                   'Fresh asparagus per lb',                              '$2.99/lb',      'produce',    '🌿', '2026-05-26', ARRAY['asparagus','vegetable','green']),
  ('kroger', NULL,           'Blueberries',                 'Fresh blueberries',                                   '$4.99',         'produce',    '🫐', '2026-05-26', ARRAY['blueberries','blueberry','fruit','berries']),
  ('kroger', NULL,           'Bell Peppers',                'Fresh bell peppers',                                  '3/$5',          'produce',    '🫑', '2026-05-26', ARRAY['bell pepper','pepper','peppers','capsicum']),
  ('kroger', NULL,           'Watermelon',                  'Whole seedless watermelon',                           '$4.99',         'produce',    '🍉', '2026-05-26', ARRAY['watermelon','melon','fruit']),
  ('kroger', NULL,           'Raspberries / Blackberries',  'Fresh raspberries or blackberries',                   '$2.99',         'produce',    '🍇', '2026-05-26', ARRAY['raspberry','raspberries','blackberry','blackberries','berries']),
  ('kroger', NULL,           'Peaches',                     'Georgia grown yellow peaches per lb',                 '$1.49/lb',      'produce',    '🍑', '2026-05-26', ARRAY['peach','peaches','fruit']),
  ('kroger', NULL,           'Apples',                      'Envy, Pink Lady, or Cosmic Crisp apples per lb',      '$1.99/lb',      'produce',    '🍎', '2026-05-26', ARRAY['apple','apples','envy','pink lady','cosmic crisp']),
  ('kroger', NULL,           'Asian Pears',                 'Fresh Asian pears per lb',                            '$3.79/lb',      'produce',    '🍐', '2026-05-26', ARRAY['pear','asian pear','fruit']),
  ('kroger', 'Zespri',       'Kiwi',                        'Zespri Sungold kiwi',                                 '$4.49',         'produce',    '🥝', '2026-05-26', ARRAY['kiwi','zespri','fruit']),
  ('kroger', NULL,           'Shredded Lettuce / Slaw',     'Kroger shredded lettuce or coleslaw mix',             '$1.99',         'produce',    '🥬', '2026-05-26', ARRAY['lettuce','slaw','coleslaw','shredded','salad']),
  ('kroger', NULL,           'Lobster Tails',               'Wild-caught lobster tails',                           '2/$12',         'seafood',    '🦞', '2026-05-26', ARRAY['lobster','lobster tail','seafood']),
  ('kroger', NULL,           'Shrimp Ring',                 'Kroger shrimp ring',                                  '$8.99',         'seafood',    '🦐', '2026-05-26', ARRAY['shrimp','shrimp ring','seafood','prawn']),
  ('kroger', NULL,           'Sea Scallops',                'Eastern sea scallops',                                '$12',           'seafood',    '🐚', '2026-05-26', ARRAY['scallops','sea scallops','seafood']),
  ('kroger', NULL,           'Ground Chuck',                'Private Selection ground chuck per lb',               '$7/lb',         'meat',       '🥩', '2026-05-26', ARRAY['ground beef','ground chuck','beef','hamburger']),
  ('kroger', NULL,           'Angus Beef Patties',          'Private Selection Angus beef patties',                '$12.99',        'meat',       '🍔', '2026-05-26', ARRAY['beef patties','burger patties','angus','hamburger']),
  ('kroger', NULL,           'Turkey Burgers',              'Simple Truth natural turkey burgers',                 '$9.99',         'meat',       '🦃', '2026-05-26', ARRAY['turkey burger','turkey patty','ground turkey']),
  ('kroger', 'Oscar Mayer',  'Hot Dogs',                    'Oscar Mayer hot wieners (digital coupon)',            '$1.99',         'meat',       '🌭', '2026-05-26', ARRAY['hot dogs','wieners','franks','oscar mayer']),
  ('kroger', 'Oscar Mayer',  'Lunch Meat',                  'Oscar Mayer lunch meat (digital coupon)',             '$3.99',         'meat',       '🥪', '2026-05-26', ARRAY['lunch meat','deli meat','cold cuts','oscar mayer']),
  ('kroger', 'Chobani',      'Greek Yogurt',                'Chobani Greek yogurt',                                '2/$3',          'dairy',      '🥛', '2026-05-26', ARRAY['yogurt','greek yogurt','chobani']),
  ('kroger', 'StarKist',     'Canned Tuna',                 'StarKist canned tuna',                                'Buy 2 Get 1',   'canned',     '🐟', '2026-05-26', ARRAY['tuna','canned tuna','starkist','fish']),
  ('kroger', 'Thai Kitchen', 'Coconut Milk',                'Thai Kitchen coconut milk',                           '$3.49',         'canned',     '🥥', '2026-05-26', ARRAY['coconut milk','thai kitchen','coconut']),
  ('kroger', 'Prego',        'Pasta Sauce',                 'Prego pasta sauce (mix & match)',                     '$1.79',         'canned',     '🍅', '2026-05-26', ARRAY['pasta sauce','marinara','prego','tomato sauce']),
  ('kroger', 'Rao''s',       'Pasta Sauce',                 'Rao''s pasta sauce (mix & match)',                    '$6.49',         'canned',     '🍅', '2026-05-26', ARRAY['pasta sauce','raos','marinara','tomato sauce']),
  ('kroger', NULL,           'Organic Spices',              'Simple Truth organic spices',                         'Buy 2 Get 1',   'condiments', '🌶️', '2026-05-26', ARRAY['spice','spices','seasoning','organic','simple truth']),
  ('kroger', 'Huy Fong',     'Sriracha',                    'Huy Fong sriracha hot sauce',                         '$5.99',         'condiments', '🌶️', '2026-05-26', ARRAY['sriracha','hot sauce','huy fong','chili sauce']),
  ('kroger', 'Panda Express','Sauce',                       'Panda Express stir-fry sauce',                        '$4.99',         'condiments', '🥢', '2026-05-26', ARRAY['panda express','sauce','stir fry','asian sauce']),
  ('kroger', 'Jif',          'Peanut Butter',               'Jif peanut butter (mix & match)',                     '$1.99',         'condiments', '🥜', '2026-05-26', ARRAY['peanut butter','jif','pb']),
  ('kroger', 'Almond Breeze','Almond Milk',                 'Almond Breeze almond milk (mix & match)',             '$2.49',         'beverages',  '🥛', '2026-05-26', ARRAY['almond milk','almond breeze','dairy free milk']),
  ('kroger', NULL,           'Eggs',                        'Kroger large white eggs',                             '$2.99',         'dairy',      '🥚', '2026-05-26', ARRAY['eggs','egg','dozen']),
  ('kroger', 'Sara Lee',     'Bread',                       'Sara Lee bread (mix & match)',                        '$4.99',         'grains',     '🍞', '2026-05-26', ARRAY['bread','sara lee','sandwich bread','loaf']),
  ('kroger', 'Thomas''',     'English Muffins',             'Thomas'' English muffins (mix & match)',              '$2.99',         'grains',     '🫓', '2026-05-26', ARRAY['english muffins','thomas','muffins','bread']),
  ('kroger', 'Dave''s',      'Killer Bread',                'Dave''s Killer Bread (mix & match)',                  '$4.99',         'grains',     '🍞', '2026-05-26', ARRAY['bread','daves killer bread','whole grain','loaf']),
  ('kroger', 'Eggo',         'Waffles',                     'Eggo frozen waffles (mix & match)',                   '$5.49',         'frozen',     '🧇', '2026-05-26', ARRAY['waffles','eggo','frozen breakfast']),
  ('kroger', 'Fairlife',     'Protein Shake',               'Fairlife protein shake',                              '$5.49',         'beverages',  '💪', '2026-05-26', ARRAY['protein shake','fairlife','protein','shake']),
  ('kroger', 'Kroger',       'Ice Cream',                   'Kroger ice cream (digital coupon)',                   '$1.99',         'frozen',     '🍦', '2026-05-26', ARRAY['ice cream','kroger','frozen dessert']),
  ('kroger', NULL,           'Potato / Mac Salad',          'Kroger potato salad, mac salad, or coleslaw',         '$7.99',         'deli',       '🥗', '2026-05-26', ARRAY['potato salad','mac salad','coleslaw','deli salad']),

  -- PUBLIX May 20 – June 2 2026
  ('publix', NULL,           'Ribeye Steak',                'Fresh ribeye steak per lb',                           '$12.99/lb',     'meat',       '🥩', '2026-06-02', ARRAY['ribeye','steak','beef','ribeye steak']),
  ('publix', NULL,           'St. Louis Spareribs',         'Publix fresh St. Louis style spareribs',              'BOGO',          'meat',       '🥩', '2026-06-02', ARRAY['spareribs','pork ribs','st louis ribs','ribs','pork']),
  ('publix', 'Smithfield',   'Bacon',                       'Smithfield bacon',                                    'BOGO',          'meat',       '🥓', '2026-06-02', ARRAY['bacon','smithfield','pork']),
  ('publix', 'Nathan''s',    'Beef Franks',                 'Nathan''s famous beef franks',                        'BOGO',          'meat',       '🌭', '2026-06-02', ARRAY['hot dogs','beef franks','franks','nathans']),
  ('publix', 'Ball Park',    'Franks',                      'Ball Park beef franks',                               'BOGO',          'meat',       '🌭', '2026-06-02', ARRAY['hot dogs','ball park','franks','beef franks']),
  ('publix', 'Johnsonville', 'Brats / Sausage',             'Johnsonville bratwurst or sausage',                   'BOGO',          'meat',       '🌭', '2026-06-02', ARRAY['brats','bratwurst','sausage','johnsonville']),
  ('publix', NULL,           'Pork Ribs (GreenWise)',        'GreenWise pork ribs per lb',                          '$7.49/lb',      'meat',       '🥩', '2026-06-02', ARRAY['pork ribs','greenwise','ribs','pork']),
  ('publix', NULL,           'London Broil',                'Top round London broil per lb',                       '$7.99/lb',      'meat',       '🥩', '2026-06-02', ARRAY['london broil','top round','beef','steak']),
  ('publix', 'Perdue',       'Chicken Breasts',             'Perdue boneless skinless chicken breasts',            'BOGO',          'meat',       '🍗', '2026-06-02', ARRAY['chicken','chicken breast','boneless','perdue']),
  ('publix', NULL,           'Chicken Breasts',             'Springer Mountain Farms chicken per lb',              '$3.99/lb',      'meat',       '🍗', '2026-06-02', ARRAY['chicken','chicken breast','springer mountain']),
  ('publix', NULL,           'Pork Loin Chops',             'Publix assorted pork loin chops per lb',              '$3.99/lb',      'meat',       '🥩', '2026-06-02', ARRAY['pork chops','pork loin','chops','pork']),
  ('publix', 'Hatfield',     'Pork Tenderloin',             'Hatfield pork tenderloin',                            'BOGO',          'meat',       '🥩', '2026-06-02', ARRAY['pork tenderloin','tenderloin','hatfield','pork']),
  ('publix', NULL,           'Pork Butt Roast',             'Publix pork butt roast per lb',                       '$2.99/lb',      'meat',       '🥩', '2026-06-02', ARRAY['pork butt','pork roast','shoulder','pork']),
  ('publix', NULL,           'Whole Brisket',               'Whole beef brisket per lb',                           '$5.99/lb',      'meat',       '🥩', '2026-06-02', ARRAY['brisket','beef brisket','beef','bbq']),
  ('publix', NULL,           'Ground Chuck',                'Fresh ground chuck per lb',                           '$6.99/lb',      'meat',       '🥩', '2026-06-02', ARRAY['ground beef','ground chuck','beef','hamburger']),
  ('publix', NULL,           'Organic Ground Beef',         'Publix organic ground beef per lb',                   '$8.99/lb',      'meat',       '🥩', '2026-06-02', ARRAY['ground beef','organic beef','beef','hamburger']),
  ('publix', NULL,           'Beef Patties',                'Publix premium beef patties',                         '$13.99',        'meat',       '🍔', '2026-06-02', ARRAY['beef patties','burger patties','hamburger','beef']),
  ('publix', NULL,           'Pork Picnic',                 'Publix pork picnic per lb',                           '$1.99/lb',      'meat',       '🥩', '2026-06-02', ARRAY['pork picnic','pork','shoulder']),
  ('publix', NULL,           'Pulled Pork',                 'Curly''s pulled pork',                                '$5.99',         'meat',       '🥩', '2026-06-02', ARRAY['pulled pork','curlys','bbq pork','pork']),
  ('publix', NULL,           'Chicken Sausage',             'GreenWise smoked chicken sausage',                    '$5.59',         'meat',       '🌭', '2026-06-02', ARRAY['chicken sausage','sausage','greenwise','smoked']),
  ('publix', NULL,           'Uncured Pork Bacon',          'GreenWise uncured pork bacon',                        '$4.49',         'meat',       '🥓', '2026-06-02', ARRAY['bacon','uncured bacon','greenwise','pork']),
  ('publix', NULL,           'Salmon',                      'Salmon select cuts per lb',                           '$6.99/lb',      'seafood',    '🐟', '2026-06-02', ARRAY['salmon','fish','seafood','salmon fillet']),
  ('publix', NULL,           'Cedar Planked Salmon',        'Cedar Bay cedar planked salmon',                      '$9.99',         'seafood',    '🐟', '2026-06-02', ARRAY['salmon','cedar plank','fish','seafood']),
  ('publix', NULL,           'White Shrimp',                'Fresh white shrimp per lb',                           '$9.99/lb',      'seafood',    '🦐', '2026-06-02', ARRAY['shrimp','white shrimp','seafood','prawn']),
  ('publix', NULL,           'Jumbo Shrimp (GreenWise)',    'GreenWise jumbo shrimp',                              'BOGO',          'seafood',    '🦐', '2026-06-02', ARRAY['shrimp','jumbo shrimp','greenwise','seafood']),
  ('publix', NULL,           'Tilapia Fillets',             'Fresh tilapia fillets per lb',                        '$7.99/lb',      'seafood',    '🐟', '2026-06-02', ARRAY['tilapia','fish','seafood','fillet']),
  ('publix', NULL,           'Sweet Corn',                  'Fresh sweet corn ears',                               '5/$3',          'produce',    '🌽', '2026-06-02', ARRAY['corn','sweet corn','ears of corn']),
  ('publix', NULL,           'Avocados',                    'Fresh Hass avocados',                                 '4/$5',          'produce',    '🥑', '2026-06-02', ARRAY['avocado','avocados','hass']),
  ('publix', NULL,           'Watermelon',                  'Seedless watermelon',                                 'BOGO',          'produce',    '🍉', '2026-06-02', ARRAY['watermelon','melon','fruit']),
  ('publix', NULL,           'Blueberries / Raspberries',   'Fresh blueberries or raspberries',                    'BOGO',          'produce',    '🫐', '2026-06-02', ARRAY['blueberries','raspberries','berries','fruit']),
  ('publix', NULL,           'Peaches / Nectarines',        'Tree-ripened peaches or nectarines per lb',           '$2.49/lb',      'produce',    '🍑', '2026-06-02', ARRAY['peach','peaches','nectarine','nectarines','fruit']),
  ('publix', NULL,           'Navel Oranges',               'Fresh navel oranges per lb',                          '$1.69/lb',      'produce',    '🍊', '2026-06-02', ARRAY['orange','oranges','navel orange','citrus']),
  ('publix', NULL,           'White Grapes',                'White seedless grapes per lb',                        '$3.99/lb',      'produce',    '🍇', '2026-06-02', ARRAY['grapes','white grapes','seedless grapes','fruit']),
  ('publix', NULL,           'Baby Cucumbers',              'Baby seedless cucumbers',                             'BOGO',          'produce',    '🥒', '2026-06-02', ARRAY['cucumber','cucumbers','baby cucumber']),
  ('publix', NULL,           'Brussels Sprouts',            'Fresh Brussels sprouts',                              '$2.99',         'produce',    '🥦', '2026-06-02', ARRAY['brussels sprouts','sprouts','vegetable']),
  ('publix', NULL,           'Salad Blend',                 'Fresh Express salad blend',                           'BOGO',          'produce',    '🥗', '2026-06-02', ARRAY['salad','lettuce','salad blend','fresh express','greens']),
  ('publix', 'Taylor Farms', 'Salad Kit',                   'Taylor Farms Mediterranean crunch salad kit',         'BOGO',          'produce',    '🥗', '2026-06-02', ARRAY['salad kit','taylor farms','salad','mediterranean']),
  ('publix', NULL,           'Coleslaw Mix',                'Publix coleslaw mix',                                 '$1.99',         'produce',    '🥬', '2026-06-02', ARRAY['coleslaw','slaw','cabbage','coleslaw mix']),
  ('publix', NULL,           'Yellow Onions',               'GreenWise organic yellow onions',                     '$4.99',         'produce',    '🧅', '2026-06-02', ARRAY['onion','onions','yellow onion','organic onion']),
  ('publix', NULL,           'Carrots',                     'GreenWise organic whole carrots',                     '$3.49',         'produce',    '🥕', '2026-06-02', ARRAY['carrots','carrot','organic carrots']),
  ('publix', NULL,           'Zucchini',                    'GreenWise zucchini squash',                           '$2.99',         'produce',    '🥒', '2026-06-02', ARRAY['zucchini','squash','zucchini squash']),
  ('publix', NULL,           'Shiitake Mushrooms',          'GreenWise organic sliced shiitake mushrooms',         '$4.99',         'produce',    '🍄', '2026-06-02', ARRAY['mushrooms','shiitake','shiitake mushrooms','funghi']),
  ('publix', 'Kraft',        'Shredded Cheese',             'Kraft shredded cheese',                               'BOGO',          'dairy',      '🧀', '2026-06-02', ARRAY['cheese','shredded cheese','kraft','cheddar','mozzarella']),
  ('publix', 'Sargento',     'Cheese Slices',               'Sargento cheese slices',                              '2/$7',          'dairy',      '🧀', '2026-06-02', ARRAY['cheese','cheese slices','sargento','cheddar']),
  ('publix', NULL,           'Mozzarella Cheese',           'Boar''s Head fresh mozzarella',                       'BOGO',          'dairy',      '🧀', '2026-06-02', ARRAY['mozzarella','boars head','fresh mozzarella','cheese']),
  ('publix', 'Borden',       'Cheese Singles',              'Borden American cheese singles',                      '$2.50',         'dairy',      '🧀', '2026-06-02', ARRAY['cheese','american cheese','borden','cheese singles']),
  ('publix', NULL,           'Greek Yogurt',                'Publix Greek yogurt',                                 '10/$10',        'dairy',      '🥛', '2026-06-02', ARRAY['yogurt','greek yogurt','publix yogurt']),
  ('publix', NULL,           'Eggs',                        'GreenWise large white eggs',                          '$5.99',         'dairy',      '🥚', '2026-06-02', ARRAY['eggs','egg','dozen','greenwise eggs']),
  ('publix', 'Coffee Mate',  'Creamer',                     'Coffee Mate coffee creamer',                          '$3',            'dairy',      '☕', '2026-06-02', ARRAY['creamer','coffee mate','coffee creamer']),
  ('publix', 'Bush''s',      'Baked Beans',                 'Bush''s baked beans',                                 '2/$5',          'canned',     '🫘', '2026-06-02', ARRAY['baked beans','beans','bushs','canned beans']),
  ('publix', NULL,           'Olive Oil',                   'GreenWise organic extra virgin olive oil',            '$10.99',        'condiments', '🫙', '2026-06-02', ARRAY['olive oil','evoo','extra virgin','greenwise']),
  ('publix', 'Hellmann''s',  'Mayonnaise',                  'Hellmann''s real mayonnaise',                         'BOGO',          'condiments', '🥄', '2026-06-02', ARRAY['mayo','mayonnaise','hellmanns','condiment']),
  ('publix', 'Sweet Baby Ray''s','BBQ Sauce',               'Sweet Baby Ray''s barbecue sauce',                    'BOGO',          'condiments', '🍖', '2026-06-02', ARRAY['bbq sauce','barbecue sauce','sweet baby rays','sauce']),
  ('publix', 'French''s',    'Mustard',                     'French''s yellow mustard',                            'BOGO',          'condiments', '🌭', '2026-06-02', ARRAY['mustard','french''s','yellow mustard','condiment']),
  ('publix', 'Mt. Olive',    'Pickles',                     'Mt. Olive pickles',                                   'BOGO',          'condiments', '🥒', '2026-06-02', ARRAY['pickles','mt olive','dill pickles','condiment']),
  ('publix', 'Sabra',        'Hummus',                      'Sabra hummus',                                        'BOGO',          'condiments', '🫙', '2026-06-02', ARRAY['hummus','sabra','dip','chickpea']),
  ('publix', 'Arnold',       'Whole Grain Bread',           'Arnold whole grain bread',                            'BOGO',          'grains',     '🍞', '2026-06-02', ARRAY['bread','arnold','whole grain','sandwich bread']),
  ('publix', NULL,           'Hamburger Buns',              'Nature''s Own hamburger or butter buns',              'BOGO',          'grains',     '🍔', '2026-06-02', ARRAY['buns','hamburger buns','hot dog buns','natures own']),
  ('publix', 'King''s Hawaiian','Hot Dog Buns',             'King''s Hawaiian hot dog buns',                       'BOGO',          'grains',     '🌭', '2026-06-02', ARRAY['hot dog buns','kings hawaiian','buns','rolls']),
  ('publix', NULL,           'English Muffins',             'GreenWise English muffins',                           '$1.99',         'grains',     '🫓', '2026-06-02', ARRAY['english muffins','greenwise','muffins','bread']),
  ('publix', NULL,           'Organic Rice',                'GreenWise organic rice',                              '$3.29',         'grains',     '🍚', '2026-06-02', ARRAY['rice','organic rice','greenwise','white rice']),
  ('publix', 'Eggo',         'Waffles',                     'Eggo frozen waffles',                                 'BOGO',          'frozen',     '🧇', '2026-06-02', ARRAY['waffles','eggo','frozen breakfast']),
  ('publix', 'Ore-Ida',      'Frozen Potatoes',             'Ore-Ida frozen potato products',                      'BOGO',          'frozen',     '🥔', '2026-06-02', ARRAY['frozen potatoes','ore-ida','fries','hash browns','potatoes']),
  ('publix', 'Pillsbury',    'Biscuits',                    'Pillsbury Grands or flaky biscuits',                  'BOGO',          'frozen',     '🥐', '2026-06-02', ARRAY['biscuits','pillsbury','grands','refrigerated dough']),
  ('publix', 'Stouffer''s',  'Lasagna / Entrees',           'Stouffer''s frozen lasagna or entrees',               '3/$10',         'frozen',     '🍝', '2026-06-02', ARRAY['lasagna','stouffers','frozen meal','entree']),
  ('publix', 'P.F. Chang''s','Frozen Meals',                'P.F. Chang''s frozen meals',                          '$6.99',         'frozen',     '🥢', '2026-06-02', ARRAY['pf changs','frozen meal','asian','entree']),
  ('publix', NULL,           'Potatoes',                    'Reser''s potato products',                            '$1.99',         'frozen',     '🥔', '2026-06-02', ARRAY['potatoes','resers','mashed potatoes','potato salad']),
  ('publix', 'Boar''s Head', 'Deli Ham',                    'Boar''s Head Deluxe ham per lb',                      '$12.99/lb',     'meat',       '🥪', '2026-06-02', ARRAY['ham','deli ham','boars head','lunch meat'])
;
