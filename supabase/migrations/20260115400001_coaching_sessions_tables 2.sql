-- ============================================================================
-- COACHING SESSIONS TABLES
-- ============================================================================
-- Stores Career Coach sessions using the OSKAR framework
-- Created: 2026-01-15
-- ============================================================================

-- Coaching Sessions Table
CREATE TABLE IF NOT EXISTS coaching_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic TEXT,
  current_phase TEXT DEFAULT 'outcome' CHECK (current_phase IN ('outcome', 'scaling', 'knowhow', 'affirm', 'review')),
  scaling_score INTEGER CHECK (scaling_score >= 1 AND scaling_score <= 10),
  goals JSONB DEFAULT '[]'::jsonb,
  action_items JSONB DEFAULT '[]'::jsonb,
  insights JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coaching Messages Table
CREATE TABLE IF NOT EXISTS coaching_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES coaching_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'coach')),
  content TEXT NOT NULL,
  phase TEXT,
  topic TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_coaching_sessions_user ON coaching_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_coaching_sessions_status ON coaching_sessions(status);
CREATE INDEX IF NOT EXISTS idx_coaching_sessions_created ON coaching_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_coaching_messages_session ON coaching_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_coaching_messages_created ON coaching_messages(created_at);

-- Enable RLS
ALTER TABLE coaching_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaching_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for coaching_sessions
CREATE POLICY "Users can view own sessions"
  ON coaching_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions"
  ON coaching_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON coaching_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON coaching_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for coaching_messages
CREATE POLICY "Users can view messages in own sessions"
  ON coaching_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM coaching_sessions
      WHERE coaching_sessions.id = coaching_messages.session_id
      AND coaching_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in own sessions"
  ON coaching_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM coaching_sessions
      WHERE coaching_sessions.id = coaching_messages.session_id
      AND coaching_sessions.user_id = auth.uid()
    )
  );

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_coaching_session_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER coaching_sessions_updated_at
  BEFORE UPDATE ON coaching_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_coaching_session_timestamp();

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Get active session for user
CREATE OR REPLACE FUNCTION get_active_coaching_session(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_session RECORD;
  v_messages JSONB;
BEGIN
  -- Get most recent active session
  SELECT * INTO v_session
  FROM coaching_sessions
  WHERE user_id = p_user_id
    AND status = 'active'
    AND created_at > NOW() - INTERVAL '24 hours'
  ORDER BY updated_at DESC
  LIMIT 1;

  IF v_session.id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Get messages
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', id,
      'role', role,
      'content', content,
      'phase', phase,
      'topic', topic,
      'timestamp', created_at
    ) ORDER BY created_at
  ) INTO v_messages
  FROM coaching_messages
  WHERE session_id = v_session.id;

  RETURN jsonb_build_object(
    'id', v_session.id,
    'topic', v_session.topic,
    'currentPhase', v_session.current_phase,
    'scalingScore', v_session.scaling_score,
    'goals', v_session.goals,
    'actionItems', v_session.action_items,
    'insights', v_session.insights,
    'messages', COALESCE(v_messages, '[]'::jsonb),
    'createdAt', v_session.created_at,
    'updatedAt', v_session.updated_at
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get session history
CREATE OR REPLACE FUNCTION get_coaching_session_history(
  p_user_id UUID,
  p_limit INT DEFAULT 10
)
RETURNS JSONB AS $$
DECLARE
  v_sessions JSONB;
BEGIN
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', s.id,
      'topic', s.topic,
      'currentPhase', s.current_phase,
      'scalingScore', s.scaling_score,
      'status', s.status,
      'messageCount', (SELECT COUNT(*) FROM coaching_messages WHERE session_id = s.id),
      'lastMessage', (
        SELECT content FROM coaching_messages
        WHERE session_id = s.id AND role = 'coach'
        ORDER BY created_at DESC LIMIT 1
      ),
      'createdAt', s.created_at,
      'updatedAt', s.updated_at
    ) ORDER BY s.updated_at DESC
  ) INTO v_sessions
  FROM (
    SELECT * FROM coaching_sessions
    WHERE user_id = p_user_id
    ORDER BY updated_at DESC
    LIMIT p_limit
  ) s;

  RETURN COALESCE(v_sessions, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new coaching session
CREATE OR REPLACE FUNCTION create_coaching_session(
  p_user_id UUID,
  p_topic TEXT DEFAULT NULL,
  p_initial_message TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_session_id UUID;
  v_message_id UUID;
BEGIN
  -- Archive any existing active sessions
  UPDATE coaching_sessions
  SET status = 'archived'
  WHERE user_id = p_user_id
    AND status = 'active';

  -- Create new session
  INSERT INTO coaching_sessions (user_id, topic, current_phase)
  VALUES (p_user_id, p_topic, 'outcome')
  RETURNING id INTO v_session_id;

  -- Add initial greeting message if provided
  IF p_initial_message IS NOT NULL THEN
    INSERT INTO coaching_messages (session_id, role, content, phase, topic)
    VALUES (v_session_id, 'coach', p_initial_message, 'outcome', p_topic)
    RETURNING id INTO v_message_id;
  END IF;

  RETURN jsonb_build_object(
    'sessionId', v_session_id,
    'messageId', v_message_id,
    'success', true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add message to session
CREATE OR REPLACE FUNCTION add_coaching_message(
  p_session_id UUID,
  p_role TEXT,
  p_content TEXT,
  p_phase TEXT DEFAULT NULL,
  p_topic TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_message_id UUID;
  v_user_id UUID;
BEGIN
  -- Verify session belongs to current user
  SELECT user_id INTO v_user_id
  FROM coaching_sessions
  WHERE id = p_session_id;

  IF v_user_id IS NULL OR v_user_id != auth.uid() THEN
    RETURN jsonb_build_object('error', 'Session not found or unauthorized');
  END IF;

  -- Insert message
  INSERT INTO coaching_messages (session_id, role, content, phase, topic)
  VALUES (p_session_id, p_role, p_content, p_phase, p_topic)
  RETURNING id INTO v_message_id;

  -- Update session phase if provided
  IF p_phase IS NOT NULL THEN
    UPDATE coaching_sessions
    SET current_phase = p_phase
    WHERE id = p_session_id;
  END IF;

  RETURN jsonb_build_object(
    'messageId', v_message_id,
    'success', true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update session insights
CREATE OR REPLACE FUNCTION update_coaching_insights(
  p_session_id UUID,
  p_scaling_score INT DEFAULT NULL,
  p_action_items JSONB DEFAULT NULL,
  p_goals JSONB DEFAULT NULL,
  p_phase TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Verify session belongs to current user
  SELECT user_id INTO v_user_id
  FROM coaching_sessions
  WHERE id = p_session_id;

  IF v_user_id IS NULL OR v_user_id != auth.uid() THEN
    RETURN jsonb_build_object('error', 'Session not found or unauthorized');
  END IF;

  -- Update session
  UPDATE coaching_sessions
  SET
    scaling_score = COALESCE(p_scaling_score, scaling_score),
    action_items = COALESCE(p_action_items, action_items),
    goals = COALESCE(p_goals, goals),
    current_phase = COALESCE(p_phase, current_phase)
  WHERE id = p_session_id;

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Complete session
CREATE OR REPLACE FUNCTION complete_coaching_session(p_session_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Verify session belongs to current user
  SELECT user_id INTO v_user_id
  FROM coaching_sessions
  WHERE id = p_session_id;

  IF v_user_id IS NULL OR v_user_id != auth.uid() THEN
    RETURN jsonb_build_object('error', 'Session not found or unauthorized');
  END IF;

  UPDATE coaching_sessions
  SET status = 'completed'
  WHERE id = p_session_id;

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get coaching stats
CREATE OR REPLACE FUNCTION get_coaching_stats(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'totalSessions', COUNT(*),
    'completedSessions', COUNT(*) FILTER (WHERE status = 'completed'),
    'totalMessages', (
      SELECT COUNT(*) FROM coaching_messages cm
      JOIN coaching_sessions cs ON cm.session_id = cs.id
      WHERE cs.user_id = p_user_id
    ),
    'avgScalingScore', ROUND(AVG(scaling_score)::numeric, 1),
    'topTopics', (
      SELECT jsonb_agg(DISTINCT topic) FROM coaching_sessions
      WHERE user_id = p_user_id AND topic IS NOT NULL
      LIMIT 5
    ),
    'totalActionItems', (
      SELECT SUM(jsonb_array_length(action_items)) FROM coaching_sessions
      WHERE user_id = p_user_id
    ),
    'lastSessionDate', MAX(updated_at),
    'phasesCompleted', jsonb_build_object(
      'outcome', COUNT(*) FILTER (WHERE current_phase IN ('scaling', 'knowhow', 'affirm', 'review')),
      'scaling', COUNT(*) FILTER (WHERE current_phase IN ('knowhow', 'affirm', 'review')),
      'knowhow', COUNT(*) FILTER (WHERE current_phase IN ('affirm', 'review')),
      'affirm', COUNT(*) FILTER (WHERE current_phase = 'review'),
      'review', COUNT(*) FILTER (WHERE status = 'completed')
    )
  ) INTO v_stats
  FROM coaching_sessions
  WHERE user_id = p_user_id;

  RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
