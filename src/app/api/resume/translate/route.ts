/**
 * Skills Translation API
 *
 * POST /api/resume/translate - Translate resume bullet points
 *
 * Transforms retail/service experience into professional language
 * for target industries. Available for Starter+ tier users.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { translateBullets, getSuggestedSkills } from '@/lib/skills-translator'
import { SOURCE_INDUSTRIES, TARGET_INDUSTRIES, getAvailableTargets } from '@/data/translation-mappings'

/**
 * POST - Translate bullet points
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check user tier (Starter+ required)
  const { data: profile } = await supabase
    .from('users')
    .select('tier')
    .eq('id', user.id)
    .single()

  if (!profile || profile.tier === 'essential') {
    return NextResponse.json({
      error: 'Skills Translation is available for Starter and Premium tiers',
      upgradeRequired: true
    }, { status: 403 })
  }

  try {
    const body = await request.json()
    const {
      bullets,
      sourceIndustry,
      targetIndustry,
      jobTitle,
      context
    } = body

    // Validate required fields
    if (!bullets || !Array.isArray(bullets) || bullets.length === 0) {
      return NextResponse.json(
        { error: 'bullets array is required' },
        { status: 400 }
      )
    }

    if (!sourceIndustry || !targetIndustry) {
      return NextResponse.json(
        { error: 'sourceIndustry and targetIndustry are required' },
        { status: 400 }
      )
    }

    // Validate industries
    const validSources = SOURCE_INDUSTRIES.map(i => i.value)
    const validTargets = TARGET_INDUSTRIES.map(i => i.value)

    if (!validSources.includes(sourceIndustry)) {
      return NextResponse.json(
        { error: `Invalid sourceIndustry. Valid options: ${validSources.join(', ')}` },
        { status: 400 }
      )
    }

    if (!validTargets.includes(targetIndustry)) {
      return NextResponse.json(
        { error: `Invalid targetIndustry. Valid options: ${validTargets.join(', ')}` },
        { status: 400 }
      )
    }

    // Limit bullets (prevent abuse)
    if (bullets.length > 20) {
      return NextResponse.json(
        { error: 'Maximum 20 bullet points per request' },
        { status: 400 }
      )
    }

    // Perform translation
    const result = await translateBullets({
      bullets,
      sourceIndustry,
      targetIndustry,
      jobTitle,
      context
    })

    // Get suggested skills for this transition
    const suggestedSkills = getSuggestedSkills(sourceIndustry, targetIndustry)

    return NextResponse.json({
      translations: result.translations,
      skillsSummary: result.skillsSummary,
      keywordsSummary: result.keywordsSummary,
      suggestedSkills,
      sourceIndustry,
      targetIndustry
    })

  } catch (error) {
    console.error('Translation error:', error)
    return NextResponse.json(
      { error: 'Translation failed. Please try again.' },
      { status: 500 }
    )
  }
}

/**
 * GET - Get available industries and mappings
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sourceIndustry = searchParams.get('source')

  // If source provided, return available targets
  if (sourceIndustry) {
    const availableTargets = getAvailableTargets(sourceIndustry)
    const targetDetails = TARGET_INDUSTRIES.filter(t =>
      availableTargets.includes(t.value)
    )

    return NextResponse.json({
      sourceIndustry,
      availableTargets: targetDetails
    })
  }

  // Return all industries
  return NextResponse.json({
    sourceIndustries: SOURCE_INDUSTRIES,
    targetIndustries: TARGET_INDUSTRIES
  })
}
