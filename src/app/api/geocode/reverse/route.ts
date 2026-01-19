import { NextRequest, NextResponse } from 'next/server'

/**
 * Reverse geocoding API - converts coordinates to address
 * Uses Google Geocoding API (same key as transit)
 * Zero additional cost - uses existing API key
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')

  if (!lat || !lng) {
    return NextResponse.json(
      { error: 'Missing lat or lng parameter' },
      { status: 400 }
    )
  }

  const latitude = parseFloat(lat)
  const longitude = parseFloat(lng)

  if (isNaN(latitude) || isNaN(longitude)) {
    return NextResponse.json(
      { error: 'Invalid coordinates' },
      { status: 400 }
    )
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    // Fallback: return a generic Orlando location
    return NextResponse.json({
      address: 'Orlando, FL',
      city: 'Orlando',
      state: 'FL',
      coords: { lat: latitude, lng: longitude }
    })
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
    const response = await fetch(url)
    const data = await response.json()

    if (data.status === 'OK' && data.results[0]) {
      const result = data.results[0]

      // Extract address components
      let city = ''
      let state = ''
      let neighborhood = ''

      for (const component of result.address_components) {
        if (component.types.includes('locality')) {
          city = component.long_name
        }
        if (component.types.includes('administrative_area_level_1')) {
          state = component.short_name
        }
        if (component.types.includes('neighborhood')) {
          neighborhood = component.long_name
        }
      }

      // Build a user-friendly address
      // Prefer "Neighborhood, City" format for better job matching
      let address = ''
      if (neighborhood && city) {
        address = `${neighborhood}, ${city}`
      } else if (city && state) {
        address = `${city}, ${state}`
      } else {
        // Fallback to formatted address (truncate if too long)
        address = result.formatted_address.split(',').slice(0, 2).join(',')
      }

      return NextResponse.json({
        address,
        city,
        state,
        neighborhood,
        fullAddress: result.formatted_address,
        coords: { lat: latitude, lng: longitude }
      })
    }

    return NextResponse.json(
      { error: 'Could not find address for these coordinates' },
      { status: 404 }
    )
  } catch (error) {
    console.error('Reverse geocoding error:', error)
    return NextResponse.json(
      { error: 'Geocoding service error' },
      { status: 500 }
    )
  }
}
