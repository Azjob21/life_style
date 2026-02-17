-- ============================================================
-- Supabase Migration: Life Style Schedule App
-- Run this SQL in your Supabase Dashboard → SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. COMMITMENTS (Templates)
-- ============================================================
CREATE TABLE IF NOT EXISTS commitments (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT DEFAULT '',
  icon TEXT DEFAULT '',
  color TEXT DEFAULT '',
  default_duration INTEGER DEFAULT 60,
  description TEXT DEFAULT '',
  start_time TEXT DEFAULT '',
  end_time TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. SCHEDULE INSTANCES
-- ============================================================
CREATE TABLE IF NOT EXISTS schedule_instances (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  commitment_id TEXT NOT NULL REFERENCES commitments(id) ON DELETE CASCADE,
  template_id TEXT,
  week_id TEXT NOT NULL,
  day_index INTEGER NOT NULL,
  start_time TEXT DEFAULT '',
  end_time TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. COMPLETIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS completions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  instance_id TEXT NOT NULL,
  week_id TEXT NOT NULL,
  day_index INTEGER NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completion_time TIMESTAMPTZ,
  actual_duration INTEGER,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(instance_id, week_id)
);

-- ============================================================
-- 4. PROGRESS TRACKING
-- ============================================================
CREATE TABLE IF NOT EXISTS progress_tracking (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  commitment_id TEXT NOT NULL REFERENCES commitments(id) ON DELETE CASCADE,
  week_id TEXT NOT NULL,
  total_scheduled INTEGER DEFAULT 0,
  total_completed INTEGER DEFAULT 0,
  completion_rate REAL DEFAULT 0,
  consistency_score INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_completed_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(commitment_id, week_id)
);

-- ============================================================
-- 5. STATISTICS
-- ============================================================
CREATE TABLE IF NOT EXISTS statistics (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  commitment_id TEXT NOT NULL REFERENCES commitments(id) ON DELETE CASCADE,
  total_completions INTEGER DEFAULT 0,
  total_allotted INTEGER DEFAULT 0,
  average_completion_rate REAL DEFAULT 0,
  most_productive_day INTEGER,
  total_time_spent INTEGER DEFAULT 0,
  record_streak INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(commitment_id)
);

-- ============================================================
-- 6. DAILY NOTES
-- ============================================================
CREATE TABLE IF NOT EXISTS daily_notes (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_id TEXT NOT NULL,
  day_index INTEGER NOT NULL,
  notes TEXT DEFAULT '',
  day_status TEXT DEFAULT '',
  mood INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(week_id, day_index, user_id)
);

-- ============================================================
-- 7. DAY PROPERTIES
-- ============================================================
CREATE TABLE IF NOT EXISTS day_properties (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_id TEXT NOT NULL,
  day_index INTEGER NOT NULL,
  available_time_start TEXT DEFAULT '08:00',
  available_time_end TEXT DEFAULT '22:00',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(week_id, day_index, user_id)
);

-- ============================================================
-- 8. DAY MARKED STATUS
-- ============================================================
CREATE TABLE IF NOT EXISTS day_marked (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_id TEXT NOT NULL,
  day_index INTEGER NOT NULL,
  is_marked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(week_id, day_index, user_id)
);

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_commitments_user ON commitments(user_id);
CREATE INDEX IF NOT EXISTS idx_schedule_instances_week ON schedule_instances(week_id, user_id);
CREATE INDEX IF NOT EXISTS idx_schedule_instances_day ON schedule_instances(week_id, day_index, user_id);
CREATE INDEX IF NOT EXISTS idx_completions_week ON completions(week_id, user_id);
CREATE INDEX IF NOT EXISTS idx_completions_instance ON completions(instance_id, week_id);
CREATE INDEX IF NOT EXISTS idx_progress_commitment ON progress_tracking(commitment_id, week_id);
CREATE INDEX IF NOT EXISTS idx_daily_notes_week ON daily_notes(week_id, user_id);
CREATE INDEX IF NOT EXISTS idx_day_properties_week ON day_properties(week_id, user_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Each user can only access their own data
-- ============================================================
ALTER TABLE commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE day_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE day_marked ENABLE ROW LEVEL SECURITY;

-- Policies: Users can CRUD their own data
CREATE POLICY "Users can manage own commitments" ON commitments
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own schedule_instances" ON schedule_instances
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own completions" ON completions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own progress_tracking" ON progress_tracking
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own statistics" ON statistics
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own daily_notes" ON daily_notes
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own day_properties" ON day_properties
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own day_marked" ON day_marked
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_commitments_updated_at BEFORE UPDATE ON commitments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedule_instances_updated_at BEFORE UPDATE ON schedule_instances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_completions_updated_at BEFORE UPDATE ON completions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_progress_tracking_updated_at BEFORE UPDATE ON progress_tracking
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_statistics_updated_at BEFORE UPDATE ON statistics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_notes_updated_at BEFORE UPDATE ON daily_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_day_properties_updated_at BEFORE UPDATE ON day_properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_day_marked_updated_at BEFORE UPDATE ON day_marked
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
