/**
 * Google Maps Transit Client
 *
 * Calculates transit times using LYNX (Orlando's bus system) via
 * Google Maps Directions API.
 *
 * Setup:
 * 1. Enable "Directions API" in Google Cloud Console
 * 2. Add GOOGLE_MAPS_API_KEY to .env.local
 *
 * Rate Limits & Pricing:
 * - $5 per 1000 requests (as of 2024)
 * - $200 free monthly credit from Google
 * - Implement caching to reduce costs
 */

// Types
export interface Coordinates {
  lat: number
  lng: number
}

export interface TransitStep {
  routeNumber: string
  routeName: string
  departureStop: string
  arrivalStop: string
  departureTime: string
  arrivalTime: string
  durationMinutes: number
  numStops: number
}

export interface TransitResult {
  durationMinutes: number
  departureTime: Date
  arrivalTime: Date
  routes: TransitStep[]
  walkingMinutes: number
  transfers: number
  summary: string  // e.g., "Route 21 → Route 50"
  distanceMiles: number
}

export interface TransitApiError {
  error: string
  message: string
}

// Google Maps API response types
interface GoogleDirectionsResponse {
  status: string
  routes: GoogleRoute[]
  error_message?: string
}

interface GoogleRoute {
  summary: string
  legs: GoogleLeg[]
}

interface GoogleLeg {
  distance: { text: string; value: number }
  duration: { text: string; value: number }
  start_address: string
  end_address: string
  departure_time?: { text: string; value: number }
  arrival_time?: { text: string; value: number }
  steps: GoogleStep[]
}

interface GoogleStep {
  travel_mode: 'WALKING' | 'TRANSIT' | 'DRIVING'
  distance: { text: string; value: number }
  duration: { text: string; value: number }
  html_instructions: string
  transit_details?: {
    departure_stop: { name: string; location: { lat: number; lng: number } }
    arrival_stop: { name: string; location: { lat: number; lng: number } }
    departure_time: { text: string; value: number }
    arrival_time: { text: string; value: number }
    line: {
      name: string
      short_name: string
      vehicle: { name: string; type: string }
      agencies: { name: string; url: string }[]
    }
    num_stops: number
  }
}

// Cache for transit times (simple in-memory cache)
const transitCache = new Map<string, { result: TransitResult; timestamp: number }>()
const CACHE_TTL_MS = 6 * 60 * 60 * 1000 // 6 hours

/**
 * Calculate transit time between two points using LYNX bus
 */
export async function calculateTransitTime(
  origin: Coordinates,
  destination: Coordinates,
  arrivalTime?: Date
): Promise<TransitResult | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    console.warn('GOOGLE_MAPS_API_KEY not set - using estimated transit time')
    return estimateTransitTime(origin, destination)
  }

  // Check cache
  const cacheKey = getCacheKey(origin, destination, arrivalTime)
  const cached = transitCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.result
  }

  // Build API URL
  const params = new URLSearchParams({
    origin: `${origin.lat},${origin.lng}`,
    destination: `${destination.lat},${destination.lng}`,
    mode: 'transit',
    transit_mode: 'bus', // LYNX is bus only
    alternatives: 'true',
    key: apiKey
  })

  // If arrival time specified, use it; otherwise use departure_time=now
  if (arrivalTime) {
    params.set('arrival_time', String(Math.floor(arrivalTime.getTime() / 1000)))
  } else {
    params.set('departure_time', 'now')
  }

  const url = `https://maps.googleapis.com/maps/api/directions/json?${params.toString()}`

  try {
    const response = await fetch(url)
    const data: GoogleDirectionsResponse = await response.json()

    if (data.status !== 'OK') {
      console.error('Google Directions API error:', data.status, data.error_message)

      // If no transit available, estimate
      if (data.status === 'ZERO_RESULTS') {
        return estimateTransitTime(origin, destination)
      }

      return null
    }

    // Get the best route (first one)
    const bestRoute = data.routes[0]
    if (!bestRoute || !bestRoute.legs[0]) {
      return estimateTransitTime(origin, destination)
    }

    const leg = bestRoute.legs[0]
    const result = parseTransitResult(leg)

    // Cache result
    transitCache.set(cacheKey, { result, timestamp: Date.now() })

    return result
  } catch (error) {
    console.error('Transit API error:', error)
    return estimateTransitTime(origin, destination)
  }
}

/**
 * Parse Google Directions leg into our TransitResult format
 */
function parseTransitResult(leg: GoogleLeg): TransitResult {
  const routes: TransitStep[] = []
  let walkingMinutes = 0

  for (const step of leg.steps) {
    if (step.travel_mode === 'WALKING') {
      walkingMinutes += Math.round(step.duration.value / 60)
    } else if (step.travel_mode === 'TRANSIT' && step.transit_details) {
      const td = step.transit_details
      routes.push({
        routeNumber: td.line.short_name || td.line.name,
        routeName: td.line.name,
        departureStop: td.departure_stop.name,
        arrivalStop: td.arrival_stop.name,
        departureTime: new Date(td.departure_time.value * 1000).toISOString(),
        arrivalTime: new Date(td.arrival_time.value * 1000).toISOString(),
        durationMinutes: Math.round(step.duration.value / 60),
        numStops: td.num_stops
      })
    }
  }

  // Build summary (e.g., "Route 21 → Route 50")
  const summary = routes.length > 0
    ? routes.map(r => `Route ${r.routeNumber}`).join(' → ')
    : 'Walking only'

  return {
    durationMinutes: Math.round(leg.duration.value / 60),
    departureTime: leg.departure_time
      ? new Date(leg.departure_time.value * 1000)
      : new Date(),
    arrivalTime: leg.arrival_time
      ? new Date(leg.arrival_time.value * 1000)
      : new Date(Date.now() + leg.duration.value * 1000),
    routes,
    walkingMinutes,
    transfers: Math.max(0, routes.length - 1),
    summary,
    distanceMiles: leg.distance.value / 1609.34 // meters to miles
  }
}

/**
 * Estimate transit time when API is unavailable
 * Uses a simple distance-based estimation
 */
function estimateTransitTime(
  origin: Coordinates,
  destination: Coordinates
): TransitResult {
  // Calculate straight-line distance
  const distanceMiles = calculateDistance(origin, destination)

  // Estimate based on average bus speed (12 mph in Orlando traffic)
  // Plus 10 minutes for walking and waiting
  const busMinutes = Math.round((distanceMiles / 12) * 60)
  const totalMinutes = busMinutes + 10

  // Generate mock route numbers based on location
  const routeNumber = estimateRouteNumber(origin, destination)

  return {
    durationMinutes: totalMinutes,
    departureTime: new Date(),
    arrivalTime: new Date(Date.now() + totalMinutes * 60 * 1000),
    routes: [{
      routeNumber,
      routeName: `LYNX Route ${routeNumber}`,
      departureStop: 'Nearest stop',
      arrivalStop: 'Destination stop',
      departureTime: new Date().toISOString(),
      arrivalTime: new Date(Date.now() + busMinutes * 60 * 1000).toISOString(),
      durationMinutes: busMinutes,
      numStops: Math.round(distanceMiles * 3) // ~3 stops per mile
    }],
    walkingMinutes: 10,
    transfers: 0,
    summary: `Route ${routeNumber} (estimated)`,
    distanceMiles
  }
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 3959 // Earth's radius in miles
  const dLat = toRad(coord2.lat - coord1.lat)
  const dLng = toRad(coord2.lng - coord1.lng)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.lat)) *
      Math.cos(toRad(coord2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

/**
 * Estimate likely LYNX route based on coordinates
 * Uses major Orlando corridors
 */
function estimateRouteNumber(origin: Coordinates, destination: Coordinates): string {
  // Major LYNX routes in Orlando area
  const ROUTES = {
    // Downtown Orlando hub routes
    downtown: ['21', '37', '40', '42', '51'],
    // International Drive area
    iDrive: ['8', '42', '50'],
    // UCF/East Orlando
    eastOrlando: ['13', '30', '104'],
    // West Orlando/Universal
    westOrlando: ['21', '37', '50'],
    // South Orlando/Kissimmee
    southOrlando: ['18', '55', '306'],
    // Airport area
    airport: ['11', '42', '111']
  }

  // Determine which area based on coordinates
  const avgLat = (origin.lat + destination.lat) / 2
  const avgLng = (origin.lng + destination.lng) / 2

  // Downtown Orlando approximate coordinates
  const downtownLat = 28.538
  const downtownLng = -81.379

  // Determine region
  if (avgLng < -81.5) {
    // West Orlando
    return ROUTES.westOrlando[Math.floor(Math.random() * ROUTES.westOrlando.length)]
  } else if (avgLng > -81.2) {
    // East Orlando
    return ROUTES.eastOrlando[Math.floor(Math.random() * ROUTES.eastOrlando.length)]
  } else if (avgLat < 28.4) {
    // South Orlando
    return ROUTES.southOrlando[Math.floor(Math.random() * ROUTES.southOrlando.length)]
  } else if (Math.abs(avgLat - downtownLat) < 0.1 && Math.abs(avgLng - downtownLng) < 0.1) {
    // Downtown
    return ROUTES.downtown[Math.floor(Math.random() * ROUTES.downtown.length)]
  }

  // Default to common downtown routes
  return ROUTES.downtown[Math.floor(Math.random() * ROUTES.downtown.length)]
}

/**
 * Generate cache key for transit lookups
 */
function getCacheKey(
  origin: Coordinates,
  destination: Coordinates,
  arrivalTime?: Date
): string {
  // Round coordinates to reduce cache misses for nearby locations
  const roundedOrigin = `${origin.lat.toFixed(3)},${origin.lng.toFixed(3)}`
  const roundedDest = `${destination.lat.toFixed(3)},${destination.lng.toFixed(3)}`

  // Round arrival time to nearest 30 minutes
  const timeKey = arrivalTime
    ? Math.floor(arrivalTime.getTime() / (30 * 60 * 1000))
    : 'now'

  return `${roundedOrigin}:${roundedDest}:${timeKey}`
}

/**
 * Get transit time for a job listing
 * Convenience function that handles address geocoding
 */
export async function getTransitTimeForJob(
  userLocation: Coordinates,
  jobAddress: string,
  jobCoordinates?: Coordinates
): Promise<TransitResult | null> {
  // If we have coordinates, use them directly
  if (jobCoordinates) {
    return calculateTransitTime(userLocation, jobCoordinates)
  }

  // Otherwise, geocode the address
  const geocoded = await geocodeAddress(jobAddress)
  if (!geocoded) {
    return null
  }

  return calculateTransitTime(userLocation, geocoded)
}

/**
 * Geocode an address to coordinates
 */
export async function geocodeAddress(address: string): Promise<Coordinates | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    // Return Orlando center as fallback
    return { lat: 28.5383, lng: -81.3792 }
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`

  try {
    const response = await fetch(url)
    const data = await response.json()

    if (data.status === 'OK' && data.results[0]) {
      const location = data.results[0].geometry.location
      return { lat: location.lat, lng: location.lng }
    }

    return null
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}

/**
 * Format transit result for display
 */
export function formatTransitDisplay(result: TransitResult): {
  timeText: string
  routeText: string
  detailText: string
} {
  const timeText = `${result.durationMinutes} min`

  const routeText = result.routes.length > 0
    ? result.routes.map(r => r.routeNumber).join(' → ')
    : 'Walk'

  let detailText = ''
  if (result.transfers > 0) {
    detailText = `${result.transfers} transfer${result.transfers > 1 ? 's' : ''}`
  }
  if (result.walkingMinutes > 5) {
    detailText += detailText ? `, ${result.walkingMinutes} min walk` : `${result.walkingMinutes} min walk`
  }

  return { timeText, routeText, detailText }
}

/**
 * Clear transit cache (for testing or cache refresh)
 */
export function clearTransitCache(): void {
  transitCache.clear()
}

export default calculateTransitTime
