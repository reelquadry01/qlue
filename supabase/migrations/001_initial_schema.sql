-- Qlue MVP Schema
-- Content-only tables for prompts and categories

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  answer TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  subcategory_id UUID REFERENCES subcategories(id) ON DELETE SET NULL,
  game_mode TEXT DEFAULT 'classic',
  difficulty TEXT DEFAULT 'medium',
  language TEXT DEFAULT 'en',
  forbidden_words JSONB DEFAULT '[]',
  valid_from DATE,
  valid_until DATE,
  last_verified DATE,
  verification_source TEXT,
  times_played INTEGER DEFAULT 0,
  times_correct INTEGER DEFAULT 0,
  times_skipped INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_prompts_category ON prompts(category_id);
CREATE INDEX idx_prompts_difficulty ON prompts(difficulty);
CREATE INDEX idx_prompts_game_mode ON prompts(game_mode);
CREATE INDEX idx_prompts_active ON prompts(is_active);
CREATE INDEX idx_subcategories_category ON subcategories(category_id);

-- Public read-only access
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read categories" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public read subcategories" ON subcategories FOR SELECT USING (true);
CREATE POLICY "Public read prompts" ON prompts FOR SELECT USING (is_active = true);

-- Seed categories
INSERT INTO categories (name, icon, color, sort_order) VALUES
  ('Nigerian Culture', '🇳🇬', '#22C55E', 1),
  ('General Knowledge', '🧠', '#6C3CE1', 2),
  ('Sports', '⚽', '#F59E0B', 3),
  ('Entertainment', '🎬', '#EC4899', 4),
  ('Christianity', '✝️', '#3B82F6', 5),
  ('Islam', '☪️', '#10B981', 6),
  ('Technology', '💻', '#8B5CF6', 7);
