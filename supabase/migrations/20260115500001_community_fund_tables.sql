-- ============================================================================
-- COMMUNITY FUND TABLES
-- ============================================================================
-- Tracks contributions from subscriptions and allocations to students
-- Created: 2026-01-15
-- ============================================================================

-- Community Contributions Table
-- Records 10% of subscription revenue going to the fund
CREATE TABLE IF NOT EXISTS community_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  source TEXT NOT NULL CHECK (source IN ('subscription', 'subscription_renewal', 'donation', 'one_time')),
  subscription_tier TEXT,
  stripe_payment_id TEXT,
  stripe_invoice_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fund Allocations Table
-- Records how funds have been distributed to help students
CREATE TABLE IF NOT EXISTS fund_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('emergency', 'textbooks', 'career', 'technology', 'transportation', 'other')),
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL,
  recipient_count INTEGER NOT NULL DEFAULT 1 CHECK (recipient_count > 0),
  semester TEXT NOT NULL,
  approved_by TEXT,
  notes TEXT,
  allocated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fund Milestones Achieved
-- Records when milestones are reached
CREATE TABLE IF NOT EXISTS fund_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_amount DECIMAL(10, 2) NOT NULL,
  title TEXT NOT NULL,
  achieved_at TIMESTAMPTZ DEFAULT NOW(),
  total_at_achievement DECIMAL(10, 2) NOT NULL,
  contributors_count INTEGER,
  students_helped INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_contributions_user ON community_contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_contributions_source ON community_contributions(source);
CREATE INDEX IF NOT EXISTS idx_contributions_created ON community_contributions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contributions_stripe ON community_contributions(stripe_payment_id);

CREATE INDEX IF NOT EXISTS idx_allocations_category ON fund_allocations(category);
CREATE INDEX IF NOT EXISTS idx_allocations_semester ON fund_allocations(semester);
CREATE INDEX IF NOT EXISTS idx_allocations_date ON fund_allocations(allocated_at DESC);

-- Enable RLS
ALTER TABLE community_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fund_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE fund_milestones ENABLE ROW LEVEL SECURITY;

-- RLS Policies for community_contributions
-- Users can see their own contributions
CREATE POLICY "Users can view own contributions"
  ON community_contributions FOR SELECT
  USING (auth.uid() = user_id);

-- Aggregated data is public (via API with service role)
-- Service role can insert contributions
CREATE POLICY "Service can insert contributions"
  ON community_contributions FOR INSERT
  WITH CHECK (true);

-- RLS Policies for fund_allocations
-- Everyone can view allocations (transparency)
CREATE POLICY "Everyone can view allocations"
  ON fund_allocations FOR SELECT
  TO authenticated, anon
  USING (true);

-- Only service role can insert/update allocations
CREATE POLICY "Service can manage allocations"
  ON fund_allocations FOR ALL
  USING (true);

-- RLS Policies for fund_milestones
-- Everyone can view milestones
CREATE POLICY "Everyone can view milestones"
  ON fund_milestones FOR SELECT
  TO authenticated, anon
  USING (true);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Get fund summary stats
CREATE OR REPLACE FUNCTION get_fund_summary()
RETURNS JSONB AS $$
DECLARE
  v_total_raised DECIMAL;
  v_total_allocated DECIMAL;
  v_contributors INTEGER;
  v_students_helped INTEGER;
BEGIN
  -- Total raised
  SELECT COALESCE(SUM(amount), 0) INTO v_total_raised
  FROM community_contributions;

  -- Total allocated
  SELECT COALESCE(SUM(amount), 0) INTO v_total_allocated
  FROM fund_allocations;

  -- Unique contributors
  SELECT COUNT(DISTINCT user_id) INTO v_contributors
  FROM community_contributions
  WHERE user_id IS NOT NULL;

  -- Total students helped
  SELECT COALESCE(SUM(recipient_count), 0) INTO v_students_helped
  FROM fund_allocations;

  RETURN jsonb_build_object(
    'totalRaised', v_total_raised,
    'totalAllocated', v_total_allocated,
    'currentBalance', v_total_raised - v_total_allocated,
    'contributorsCount', v_contributors,
    'studentsHelped', v_students_helped,
    'averageGrant', CASE WHEN v_students_helped > 0
      THEN ROUND(v_total_allocated / v_students_helped, 2)
      ELSE 0 END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's total contribution
CREATE OR REPLACE FUNCTION get_user_fund_contribution(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_total DECIMAL;
  v_count INTEGER;
  v_first_contribution TIMESTAMPTZ;
BEGIN
  SELECT
    COALESCE(SUM(amount), 0),
    COUNT(*),
    MIN(created_at)
  INTO v_total, v_count, v_first_contribution
  FROM community_contributions
  WHERE user_id = p_user_id;

  RETURN jsonb_build_object(
    'totalContribution', v_total,
    'contributionCount', v_count,
    'firstContribution', v_first_contribution,
    'monthsContributing', CASE
      WHEN v_first_contribution IS NOT NULL
      THEN EXTRACT(MONTH FROM AGE(NOW(), v_first_contribution)) + 1
      ELSE 0 END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get allocation breakdown by category
CREATE OR REPLACE FUNCTION get_allocation_breakdown()
RETURNS JSONB AS $$
DECLARE
  v_breakdown JSONB;
  v_total DECIMAL;
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO v_total FROM fund_allocations;

  SELECT jsonb_agg(
    jsonb_build_object(
      'category', category,
      'total', cat_total,
      'count', cat_count,
      'students', students_total,
      'percentage', CASE WHEN v_total > 0
        THEN ROUND((cat_total / v_total * 100)::numeric, 1)
        ELSE 0 END
    )
  ) INTO v_breakdown
  FROM (
    SELECT
      category,
      SUM(amount) as cat_total,
      COUNT(*) as cat_count,
      SUM(recipient_count) as students_total
    FROM fund_allocations
    GROUP BY category
    ORDER BY SUM(amount) DESC
  ) breakdown;

  RETURN COALESCE(v_breakdown, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Record a contribution (called from webhook)
CREATE OR REPLACE FUNCTION record_fund_contribution(
  p_user_id UUID,
  p_amount DECIMAL,
  p_source TEXT,
  p_tier TEXT DEFAULT NULL,
  p_stripe_payment_id TEXT DEFAULT NULL,
  p_stripe_invoice_id TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_contribution_id UUID;
  v_new_total DECIMAL;
BEGIN
  -- Insert contribution
  INSERT INTO community_contributions (
    user_id, amount, source, subscription_tier,
    stripe_payment_id, stripe_invoice_id
  )
  VALUES (
    p_user_id, p_amount, p_source, p_tier,
    p_stripe_payment_id, p_stripe_invoice_id
  )
  RETURNING id INTO v_contribution_id;

  -- Get new total
  SELECT SUM(amount) INTO v_new_total FROM community_contributions;

  -- Check for milestone achievements
  PERFORM check_and_record_milestones(v_new_total);

  RETURN jsonb_build_object(
    'contributionId', v_contribution_id,
    'newTotal', v_new_total,
    'success', true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check and record milestones
CREATE OR REPLACE FUNCTION check_and_record_milestones(p_total DECIMAL)
RETURNS VOID AS $$
DECLARE
  v_milestones DECIMAL[] := ARRAY[1000, 5000, 10000, 25000, 50000, 100000];
  v_milestone DECIMAL;
  v_exists BOOLEAN;
  v_contributors INTEGER;
  v_students INTEGER;
BEGIN
  FOREACH v_milestone IN ARRAY v_milestones
  LOOP
    IF p_total >= v_milestone THEN
      -- Check if already recorded
      SELECT EXISTS(
        SELECT 1 FROM fund_milestones WHERE milestone_amount = v_milestone
      ) INTO v_exists;

      IF NOT v_exists THEN
        -- Get current stats
        SELECT COUNT(DISTINCT user_id) INTO v_contributors
        FROM community_contributions WHERE user_id IS NOT NULL;

        SELECT COALESCE(SUM(recipient_count), 0) INTO v_students
        FROM fund_allocations;

        -- Record milestone
        INSERT INTO fund_milestones (
          milestone_amount, title, total_at_achievement,
          contributors_count, students_helped
        )
        VALUES (
          v_milestone,
          CASE v_milestone
            WHEN 1000 THEN 'First Thousand'
            WHEN 5000 THEN 'Making an Impact'
            WHEN 10000 THEN 'Ten Thousand Strong'
            WHEN 25000 THEN 'Quarter Champion'
            WHEN 50000 THEN 'Halfway Hero'
            WHEN 100000 THEN 'Century Club'
            ELSE 'Milestone ' || v_milestone::text
          END,
          p_total,
          v_contributors,
          v_students
        );
      END IF;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get recent allocations
CREATE OR REPLACE FUNCTION get_recent_allocations(p_limit INT DEFAULT 10)
RETURNS JSONB AS $$
BEGIN
  RETURN (
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', id,
        'category', category,
        'amount', amount,
        'description', description,
        'recipientCount', recipient_count,
        'semester', semester,
        'allocatedAt', allocated_at
      )
    )
    FROM (
      SELECT * FROM fund_allocations
      ORDER BY allocated_at DESC
      LIMIT p_limit
    ) recent
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SEED DATA (Demo/Initial Data)
-- ============================================================================

-- Insert some initial demo allocations for the transparency page
INSERT INTO fund_allocations (category, amount, description, recipient_count, semester, allocated_at)
VALUES
  ('emergency', 450, 'Car repair assistance for commuting student', 1, 'Fall 2024', '2024-09-20'),
  ('textbooks', 525, 'Nursing program textbooks', 1, 'Fall 2024', '2024-09-15'),
  ('career', 200, 'Professional attire for job interviews', 1, 'Spring 2024', '2024-04-10'),
  ('technology', 350, 'Refurbished laptop for online courses', 1, 'Fall 2024', '2024-10-05'),
  ('transportation', 150, 'Semester LYNX bus pass', 1, 'Fall 2024', '2024-08-25'),
  ('emergency', 600, 'Housing deposit assistance', 1, 'Spring 2024', '2024-03-15'),
  ('textbooks', 275, 'Business program materials', 1, 'Fall 2024', '2024-09-10'),
  ('career', 125, 'Certification exam fee', 1, 'Fall 2024', '2024-11-01'),
  ('technology', 200, 'Software license for design student', 1, 'Fall 2024', '2024-09-28'),
  ('transportation', 100, 'Gas assistance for clinical rotations', 1, 'Fall 2024', '2024-10-15'),
  ('emergency', 400, 'Medical expense assistance', 1, 'Fall 2024', '2024-10-20'),
  ('textbooks', 350, 'IT program materials and study guides', 1, 'Fall 2024', '2024-09-05'),
  ('emergency', 500, 'Utility payment to prevent shutoff', 1, 'Fall 2024', '2024-11-10'),
  ('career', 175, 'Resume printing and career fair materials', 2, 'Fall 2024', '2024-10-25'),
  ('textbooks', 400, 'Science lab materials and equipment', 2, 'Fall 2024', '2024-09-18')
ON CONFLICT DO NOTHING;

-- Insert demo contributions (simulating subscriber contributions)
INSERT INTO community_contributions (user_id, amount, source, subscription_tier, created_at)
SELECT
  NULL, -- Anonymous for demo
  CASE tier
    WHEN 'essential' THEN 1.50
    WHEN 'starter' THEN 2.50
    WHEN 'premium' THEN 7.50
    WHEN 'unlimited' THEN 15.00
  END,
  'subscription',
  tier,
  NOW() - (interval '1 day' * generate_series)
FROM (
  SELECT unnest(ARRAY['essential', 'starter', 'premium', 'essential', 'starter']) as tier,
         generate_series(1, 150)
) demo_data
ON CONFLICT DO NOTHING;

-- Record initial milestones achieved
INSERT INTO fund_milestones (milestone_amount, title, total_at_achievement, contributors_count, students_helped, achieved_at)
VALUES
  (1000, 'First Thousand', 1025, 45, 5, '2024-09-15'),
  (5000, 'Making an Impact', 5150, 98, 22, '2024-11-01')
ON CONFLICT DO NOTHING;
