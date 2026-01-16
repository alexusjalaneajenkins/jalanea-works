-- Career Paths and Skills Tables
-- For mapping degree programs to career outcomes

-- Career paths that programs can lead to
CREATE TABLE IF NOT EXISTS career_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_es TEXT,
  description TEXT,
  salary_min INT,
  salary_max INT,
  growth_rate TEXT CHECK (growth_rate IN ('very high', 'high', 'moderate-high', 'moderate', 'low-moderate', 'low')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Skills that are associated with programs/careers
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  name_es TEXT,
  category TEXT CHECK (category IN ('technical', 'soft_skill', 'tool', 'process')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Junction: programs → career paths
CREATE TABLE IF NOT EXISTS program_career_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_key TEXT NOT NULL,
  school TEXT NOT NULL,
  career_path_id UUID REFERENCES career_paths(id) ON DELETE CASCADE,
  relevance_score INT DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(program_key, school, career_path_id)
);

-- Junction: programs → skills
CREATE TABLE IF NOT EXISTS program_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_key TEXT NOT NULL,
  school TEXT NOT NULL,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(program_key, school, skill_id)
);

-- Junction: career paths → skills (what skills are needed for each career)
CREATE TABLE IF NOT EXISTS career_path_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  career_path_id UUID REFERENCES career_paths(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  importance TEXT DEFAULT 'required' CHECK (importance IN ('required', 'preferred', 'nice_to_have')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(career_path_id, skill_id)
);

-- User's selected career paths
CREATE TABLE IF NOT EXISTS user_career_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  career_path_id UUID REFERENCES career_paths(id) ON DELETE CASCADE,
  is_custom BOOLEAN DEFAULT FALSE,
  custom_title TEXT,
  custom_title_es TEXT,
  priority INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, career_path_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_program_career_paths_program ON program_career_paths(program_key, school);
CREATE INDEX IF NOT EXISTS idx_program_skills_program ON program_skills(program_key, school);
CREATE INDEX IF NOT EXISTS idx_user_career_paths_user ON user_career_paths(user_id);
CREATE INDEX IF NOT EXISTS idx_career_paths_title ON career_paths(title);
CREATE INDEX IF NOT EXISTS idx_skills_name ON skills(name);

-- RLS Policies

-- Career paths: public read
ALTER TABLE career_paths ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Career paths are viewable by everyone" ON career_paths;
CREATE POLICY "Career paths are viewable by everyone" ON career_paths FOR SELECT USING (true);

-- Skills: public read
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Skills are viewable by everyone" ON skills;
CREATE POLICY "Skills are viewable by everyone" ON skills FOR SELECT USING (true);

-- Program career paths: public read
ALTER TABLE program_career_paths ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Program career paths are viewable by everyone" ON program_career_paths;
CREATE POLICY "Program career paths are viewable by everyone" ON program_career_paths FOR SELECT USING (true);

-- Program skills: public read
ALTER TABLE program_skills ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Program skills are viewable by everyone" ON program_skills;
CREATE POLICY "Program skills are viewable by everyone" ON program_skills FOR SELECT USING (true);

-- Career path skills: public read
ALTER TABLE career_path_skills ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Career path skills are viewable by everyone" ON career_path_skills;
CREATE POLICY "Career path skills are viewable by everyone" ON career_path_skills FOR SELECT USING (true);

-- User career paths: user-specific CRUD
ALTER TABLE user_career_paths ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own career paths" ON user_career_paths;
CREATE POLICY "Users can view own career paths" ON user_career_paths FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own career paths" ON user_career_paths;
CREATE POLICY "Users can insert own career paths" ON user_career_paths FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own career paths" ON user_career_paths;
CREATE POLICY "Users can update own career paths" ON user_career_paths FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own career paths" ON user_career_paths;
CREATE POLICY "Users can delete own career paths" ON user_career_paths FOR DELETE USING (auth.uid() = user_id);

-- Trigger for updated_at on career_paths
CREATE OR REPLACE FUNCTION update_career_paths_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_career_paths_updated_at ON career_paths;
CREATE TRIGGER update_career_paths_updated_at
  BEFORE UPDATE ON career_paths
  FOR EACH ROW EXECUTE FUNCTION update_career_paths_updated_at();
