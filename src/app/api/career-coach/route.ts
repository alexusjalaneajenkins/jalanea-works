/**
 * Career Coach API
 *
 * POST /api/career-coach - Send message and get coaching response
 * GET /api/career-coach - Get coaching session history and resources
 * DELETE /api/career-coach - Archive or complete a session
 *
 * Uses Gemini 3.0 Flash for AI responses.
 * Available for Premium tier users.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  generateCoachResponse,
  generateGreeting,
  detectPhase,
  extractActionItems,
  extractScalingScore,
  getSuggestedPrompts,
  type CoachingMessage,
  type CoachingContext
} from '@/lib/career-coach'
import { OSKAR_PHASES, COACHING_TOPICS } from '@/data/oskar-framework'

/**
 * POST - Send message to career coach
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check user tier (Premium required)
  const { data: profile } = await supabase
    .from('users')
    .select('tier, full_name, challenges, career_goals, skills')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.tier !== 'premium' && profile.tier !== 'unlimited')) {
    return NextResponse.json({
      error: 'Career Coach is available for Premium and Unlimited tiers',
      upgradeRequired: true
    }, { status: 403 })
  }

  try {
    const body = await request.json()
    const {
      message,
      sessionId,
      topic,
      isNewSession = false
    } = body

    // Build coaching context from user profile
    const context: CoachingContext = {
      userName: profile.full_name?.split(' ')[0],
      careerGoal: profile.career_goals?.[0],
      challenges: profile.challenges || [],
      strengths: profile.skills || []
    }

    let currentSessionId = sessionId
    let messages: CoachingMessage[] = []
    let currentPhase = 'outcome'
    let sessionTopic = topic

    if (isNewSession || !sessionId) {
      // Create new session in database
      const greeting = generateGreeting(context, topic)

      const { data: sessionResult, error: sessionError } = await supabase
        .rpc('create_coaching_session', {
          p_user_id: user.id,
          p_topic: topic || null,
          p_initial_message: greeting
        })

      if (sessionError) {
        console.error('Failed to create session:', sessionError)
        // Fallback to in-memory session
        currentSessionId = crypto.randomUUID()
      } else {
        currentSessionId = sessionResult.sessionId
      }

      // Add greeting to messages
      const greetingMessage: CoachingMessage = {
        id: crypto.randomUUID(),
        role: 'coach',
        content: greeting,
        timestamp: new Date(),
        phase: 'outcome',
        topic
      }
      messages = [greetingMessage]

      // If there's also a user message, process it
      if (message) {
        // Save user message
        if (!sessionError) {
          await supabase.rpc('add_coaching_message', {
            p_session_id: currentSessionId,
            p_role: 'user',
            p_content: message
          })
        }

        const userMessage: CoachingMessage = {
          id: crypto.randomUUID(),
          role: 'user',
          content: message,
          timestamp: new Date()
        }
        messages.push(userMessage)

        // Generate coach response
        const responseContent = await generateCoachResponse(
          messages,
          context,
          'outcome',
          topic
        )

        const newPhase = detectPhase(messages)

        // Save coach response
        if (!sessionError) {
          await supabase.rpc('add_coaching_message', {
            p_session_id: currentSessionId,
            p_role: 'coach',
            p_content: responseContent,
            p_phase: newPhase,
            p_topic: topic
          })
        }

        const coachResponse: CoachingMessage = {
          id: crypto.randomUUID(),
          role: 'coach',
          content: responseContent,
          timestamp: new Date(),
          phase: newPhase
        }
        messages.push(coachResponse)
        currentPhase = newPhase
      }
    } else {
      // Continue existing session - fetch from database
      const { data: sessionData, error: fetchError } = await supabase
        .rpc('get_active_coaching_session', { p_user_id: user.id })

      if (fetchError || !sessionData) {
        // Session not found, try from request body
        const existingMessages = body.messages || []
        messages = existingMessages.map((m: CoachingMessage) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }))
        currentPhase = body.currentPhase || 'outcome'
        sessionTopic = body.topic
      } else {
        // Use session from database
        currentSessionId = sessionData.id
        messages = (sessionData.messages || []).map((m: any) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: new Date(m.timestamp),
          phase: m.phase,
          topic: m.topic
        }))
        currentPhase = sessionData.currentPhase || 'outcome'
        sessionTopic = sessionData.topic
      }

      // Process new user message
      if (message) {
        // Save user message to database
        await supabase.rpc('add_coaching_message', {
          p_session_id: currentSessionId,
          p_role: 'user',
          p_content: message
        })

        const userMessage: CoachingMessage = {
          id: crypto.randomUUID(),
          role: 'user',
          content: message,
          timestamp: new Date()
        }
        messages.push(userMessage)

        // Generate coach response
        const responseContent = await generateCoachResponse(
          messages,
          context,
          currentPhase,
          sessionTopic
        )

        const newPhase = detectPhase(messages)

        // Save coach response
        await supabase.rpc('add_coaching_message', {
          p_session_id: currentSessionId,
          p_role: 'coach',
          p_content: responseContent,
          p_phase: newPhase,
          p_topic: sessionTopic
        })

        const coachResponse: CoachingMessage = {
          id: crypto.randomUUID(),
          role: 'coach',
          content: responseContent,
          timestamp: new Date(),
          phase: newPhase
        }
        messages.push(coachResponse)
        currentPhase = newPhase
      }
    }

    // Extract insights
    const actionItems = extractActionItems(messages)
    const scalingScore = extractScalingScore(messages)
    const suggestedPrompts = getSuggestedPrompts(currentPhase)

    // Update session insights in database
    if (currentSessionId && (actionItems.length > 0 || scalingScore !== undefined)) {
      await supabase.rpc('update_coaching_insights', {
        p_session_id: currentSessionId,
        p_scaling_score: scalingScore || null,
        p_action_items: actionItems.length > 0 ? JSON.stringify(actionItems) : null,
        p_phase: currentPhase
      })
    }

    return NextResponse.json({
      sessionId: currentSessionId,
      messages,
      currentPhase,
      topic: sessionTopic,
      insights: {
        actionItems,
        scalingScore,
        suggestedPrompts
      }
    })

  } catch (error) {
    console.error('Career coach error:', error)
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    )
  }
}

/**
 * GET - Get coaching resources, history, and stats
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()

  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check user tier
  const { data: profile } = await supabase
    .from('users')
    .select('tier')
    .eq('id', user.id)
    .single()

  const hasPremiumAccess = profile?.tier === 'premium' || profile?.tier === 'unlimited'

  // Get active session
  let activeSession = null
  if (hasPremiumAccess) {
    const { data: sessionData } = await supabase
      .rpc('get_active_coaching_session', { p_user_id: user.id })
    activeSession = sessionData
  }

  // Get session history
  let sessionHistory: any[] = []
  if (hasPremiumAccess) {
    const { data: historyData } = await supabase
      .rpc('get_coaching_session_history', { p_user_id: user.id, p_limit: 10 })
    sessionHistory = historyData || []
  }

  // Get coaching stats
  let stats = null
  if (hasPremiumAccess) {
    const { data: statsData } = await supabase
      .rpc('get_coaching_stats', { p_user_id: user.id })
    stats = statsData
  }

  return NextResponse.json({
    topics: COACHING_TOPICS,
    phases: OSKAR_PHASES.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      emoji: p.emoji
    })),
    hasAccess: hasPremiumAccess,
    tier: profile?.tier || 'essential',
    activeSession,
    sessionHistory,
    stats
  })
}

/**
 * DELETE - Archive or complete a coaching session
 */
export async function DELETE(request: NextRequest) {
  const supabase = await createClient()

  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('sessionId')
  const action = searchParams.get('action') || 'archive' // 'archive' or 'complete'

  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
  }

  try {
    if (action === 'complete') {
      const { data, error } = await supabase
        .rpc('complete_coaching_session', { p_session_id: sessionId })

      if (error) throw error
      return NextResponse.json({ success: true, action: 'completed' })
    } else {
      // Archive session
      const { error } = await supabase
        .from('coaching_sessions')
        .update({ status: 'archived' })
        .eq('id', sessionId)
        .eq('user_id', user.id)

      if (error) throw error
      return NextResponse.json({ success: true, action: 'archived' })
    }
  } catch (error) {
    console.error('Failed to update session:', error)
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 })
  }
}
