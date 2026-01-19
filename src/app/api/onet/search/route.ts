import { NextResponse } from 'next/server'
import {
  searchCareers,
  getOccupationDetails,
  isONetAvailable,
  onetCareerToCareerPath,
  type ONetCareer,
} from '@/lib/onet-client'

export const dynamic = 'force-dynamic'

/**
 * GET /api/onet/search
 *
 * Search O*NET careers by keyword
 *
 * Query params:
 * - keyword: Search term (required)
 * - start: Pagination start (default: 1)
 * - end: Pagination end (default: 20)
 * - detailed: Include full occupation details (default: false)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const keyword = searchParams.get('keyword')
  const start = parseInt(searchParams.get('start') || '1', 10)
  const end = parseInt(searchParams.get('end') || '20', 10)
  const detailed = searchParams.get('detailed') === 'true'

  if (!keyword) {
    return NextResponse.json(
      { error: 'Keyword is required' },
      { status: 400 }
    )
  }

  if (!isONetAvailable()) {
    return NextResponse.json(
      { error: 'O*NET API not configured' },
      { status: 503 }
    )
  }

  try {
    const response = await searchCareers(keyword, { start, end })

    // If detailed requested, fetch full details for each career
    let careers = response.career

    if (detailed && careers.length > 0) {
      // Limit detailed fetches to avoid rate limits
      const careersToEnrich = careers.slice(0, 10)
      const enrichedCareers = await Promise.all(
        careersToEnrich.map(async (career: ONetCareer) => {
          try {
            const details = await getOccupationDetails(career.code)
            return onetCareerToCareerPath(career, details)
          } catch {
            return onetCareerToCareerPath(career)
          }
        })
      )

      return NextResponse.json({
        keyword: response.keyword,
        total: response.total,
        start: response.start,
        end: response.end,
        careers: enrichedCareers,
      })
    }

    // Return basic career info
    return NextResponse.json({
      keyword: response.keyword,
      total: response.total,
      start: response.start,
      end: response.end,
      careers: careers.map((career: ONetCareer) => ({
        id: career.code,
        onet_code: career.code,
        title: career.title,
        bright_outlook: career.tags?.bright_outlook || false,
        green_job: career.tags?.green || false,
        apprenticeship: career.tags?.apprenticeship || false,
        fit: career.fit,
      })),
    })
  } catch (error) {
    console.error('O*NET search error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to search careers' },
      { status: 500 }
    )
  }
}
