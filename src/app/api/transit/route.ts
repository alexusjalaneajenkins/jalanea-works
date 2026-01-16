/**
 * POST /api/transit
 *
 * Calculate transit time between two locations using LYNX bus
 *
 * Request body:
 *   - origin: { lat: number, lng: number } OR { address: string }
 *   - destination: { lat: number, lng: number } OR { address: string }
 *   - arrivalTime?: ISO date string (optional)
 *
 * Response:
 *   - durationMinutes: number
 *   - routes: TransitStep[]
 *   - walkingMinutes: number
 *   - transfers: number
 *   - summary: string
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  calculateTransitTime,
  geocodeAddress,
  formatTransitDisplay,
  type Coordinates
} from '@/lib/transit-client'

interface TransitRequestBody {
  origin: Coordinates | { address: string }
  destination: Coordinates | { address: string }
  arrivalTime?: string
}

function isCoordinates(loc: Coordinates | { address: string }): loc is Coordinates {
  return 'lat' in loc && 'lng' in loc
}

export async function POST(request: NextRequest) {
  try {
    const body: TransitRequestBody = await request.json()

    // Validate request
    if (!body.origin || !body.destination) {
      return NextResponse.json(
        { error: 'origin and destination are required' },
        { status: 400 }
      )
    }

    // Resolve origin coordinates
    let originCoords: Coordinates | null = null
    if (isCoordinates(body.origin)) {
      originCoords = body.origin
    } else if (body.origin.address) {
      originCoords = await geocodeAddress(body.origin.address)
    }

    if (!originCoords) {
      return NextResponse.json(
        { error: 'Could not resolve origin location' },
        { status: 400 }
      )
    }

    // Resolve destination coordinates
    let destCoords: Coordinates | null = null
    if (isCoordinates(body.destination)) {
      destCoords = body.destination
    } else if (body.destination.address) {
      destCoords = await geocodeAddress(body.destination.address)
    }

    if (!destCoords) {
      return NextResponse.json(
        { error: 'Could not resolve destination location' },
        { status: 400 }
      )
    }

    // Parse arrival time if provided
    const arrivalTime = body.arrivalTime ? new Date(body.arrivalTime) : undefined

    // Calculate transit time
    const result = await calculateTransitTime(originCoords, destCoords, arrivalTime)

    if (!result) {
      return NextResponse.json(
        { error: 'Could not calculate transit time' },
        { status: 500 }
      )
    }

    // Format for display
    const display = formatTransitDisplay(result)

    return NextResponse.json({
      ...result,
      display
    })
  } catch (error) {
    console.error('Transit API error:', error)
    return NextResponse.json(
      { error: 'Failed to calculate transit time' },
      { status: 500 }
    )
  }
}

// Also support GET for simple queries
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  const originLat = searchParams.get('origin_lat')
  const originLng = searchParams.get('origin_lng')
  const destLat = searchParams.get('dest_lat')
  const destLng = searchParams.get('dest_lng')
  const originAddress = searchParams.get('origin_address')
  const destAddress = searchParams.get('dest_address')

  try {
    // Resolve origin
    let originCoords: Coordinates | null = null
    if (originLat && originLng) {
      originCoords = { lat: parseFloat(originLat), lng: parseFloat(originLng) }
    } else if (originAddress) {
      originCoords = await geocodeAddress(originAddress)
    }

    if (!originCoords) {
      return NextResponse.json(
        { error: 'origin_lat/origin_lng or origin_address required' },
        { status: 400 }
      )
    }

    // Resolve destination
    let destCoords: Coordinates | null = null
    if (destLat && destLng) {
      destCoords = { lat: parseFloat(destLat), lng: parseFloat(destLng) }
    } else if (destAddress) {
      destCoords = await geocodeAddress(destAddress)
    }

    if (!destCoords) {
      return NextResponse.json(
        { error: 'dest_lat/dest_lng or dest_address required' },
        { status: 400 }
      )
    }

    // Calculate transit time
    const result = await calculateTransitTime(originCoords, destCoords)

    if (!result) {
      return NextResponse.json(
        { error: 'Could not calculate transit time' },
        { status: 500 }
      )
    }

    const display = formatTransitDisplay(result)

    return NextResponse.json({
      ...result,
      display
    })
  } catch (error) {
    console.error('Transit API error:', error)
    return NextResponse.json(
      { error: 'Failed to calculate transit time' },
      { status: 500 }
    )
  }
}
