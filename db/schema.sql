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
