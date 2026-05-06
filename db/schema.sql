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
  UNIQUE (user_id)
);

CREATE TABLE IF NOT EXISTS meal_plans (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
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
