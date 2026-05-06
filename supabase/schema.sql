-- MakeMeMeals Supabase Schema

-- Users (Clerk handles auth, this stores app data)
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id      TEXT UNIQUE NOT NULL,
  email         TEXT NOT NULL,
  subscription  TEXT DEFAULT 'free', -- free | active | cancelled
  free_weeks    INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Preferences (saved per user)
CREATE TABLE IF NOT EXISTS preferences (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID REFERENCES users(id) ON DELETE CASCADE,
  servings           INT DEFAULT 4,
  picky_eaters       BOOLEAN DEFAULT FALSE,
  keep_mild          BOOLEAN DEFAULT FALSE,
  meat_free          BOOLEAN DEFAULT FALSE,
  gluten_free        BOOLEAN DEFAULT FALSE,
  dairy_free         BOOLEAN DEFAULT FALSE,
  thirty_min_max     BOOLEAN DEFAULT FALSE
);

-- Meal Plans
CREATE TABLE IF NOT EXISTS meal_plans (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  days        INT NOT NULL, -- 3-7
  week_of     DATE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Meals (each recipe in a plan)
CREATE TABLE IF NOT EXISTS meals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id         UUID REFERENCES meal_plans(id) ON DELETE CASCADE,
  day_number      INT NOT NULL, -- 1 through 7
  name            TEXT NOT NULL,
  description     TEXT,
  prep_minutes    INT,
  difficulty      TEXT, -- Easy | Medium | Confident Cook
  ingredients     JSONB, -- [{name, quantity, unit, category}]
  steps           JSONB, -- [string]
  estimated_cost  NUMERIC(6,2),
  emoji           TEXT
);

-- Grocery Lists
CREATE TABLE IF NOT EXISTS grocery_lists (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id         UUID REFERENCES meal_plans(id) ON DELETE CASCADE,
  items           JSONB, -- [{name, qty, unit, category, checked}]
  estimated_total NUMERIC(8,2)
);

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE grocery_lists ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_id ON meal_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_meals_plan_id ON meals(plan_id);
CREATE INDEX IF NOT EXISTS idx_grocery_lists_plan_id ON grocery_lists(plan_id);
CREATE INDEX IF NOT EXISTS idx_preferences_user_id ON preferences(user_id);
