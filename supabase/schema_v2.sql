-- ── Schema V2: Intelligence Gathering System ─────────────────────────────
-- Run this after schema.sql to add scraper infrastructure

-- ── Update signals table ─────────────────────────────────────────────────
ALTER TABLE IF EXISTS signals
  ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'manual'
    CHECK (source_type IN ('sec', 'news', 'mls', 'linkedin', 'county', 'manual', 'ai')),
  ADD COLUMN IF NOT EXISTS source_url TEXT,
  ADD COLUMN IF NOT EXISTS raw_data JSONB,
  ADD COLUMN IF NOT EXISTS ai_score INTEGER,
  ADD COLUMN IF NOT EXISTS researched_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;

-- ── Scraper run log ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scraper_runs (
  id BIGSERIAL PRIMARY KEY,
  source TEXT NOT NULL
    CHECK (source IN ('sec', 'news', 'mls', 'linkedin', 'county')),
  ran_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  signals_found INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'success'
    CHECK (status IN ('success', 'error', 'partial')),
  error TEXT,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast latest-per-source lookups
CREATE INDEX IF NOT EXISTS idx_scraper_runs_source_ran_at
  ON scraper_runs (source, ran_at DESC);

-- ── AI Research reports ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS research_reports (
  id BIGSERIAL PRIMARY KEY,
  signal_id BIGINT REFERENCES signals(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  net_worth_estimate TEXT,
  liquidity_events JSONB DEFAULT '[]'::jsonb,
  hawaii_connections JSONB DEFAULT '[]'::jsonb,
  recommended_approach TEXT,
  key_talking_points JSONB DEFAULT '[]'::jsonb,
  lead_score INTEGER CHECK (lead_score BETWEEN 1 AND 100),
  lead_score_rationale TEXT,
  raw_narrative TEXT,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_research_reports_signal_id
  ON research_reports (signal_id);

CREATE INDEX IF NOT EXISTS idx_research_reports_generated_at
  ON research_reports (generated_at DESC);

-- ── RLS Policies (enable when auth is configured) ─────────────────────────
-- ALTER TABLE scraper_runs ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Authenticated users can read scraper_runs"
--   ON scraper_runs FOR SELECT USING (auth.role() = 'authenticated');
-- CREATE POLICY "Service role can insert scraper_runs"
--   ON scraper_runs FOR INSERT WITH CHECK (true);

-- ALTER TABLE research_reports ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Authenticated users can read research_reports"
--   ON research_reports FOR SELECT USING (auth.role() = 'authenticated');
-- CREATE POLICY "Authenticated users can insert research_reports"
--   ON research_reports FOR INSERT WITH CHECK (auth.role() = 'authenticated');
