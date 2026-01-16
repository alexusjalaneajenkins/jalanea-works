/**
 * LYNX Bus System Utilities
 *
 * Orlando's Central Florida Regional Transportation Authority (LYNX)
 * provides bus service throughout Orange, Seminole, and Osceola counties.
 *
 * This module provides LYNX-specific utilities including:
 * - Route information and coverage areas
 * - Service hours and schedules
 * - Major transit hubs/stations
 * - Accessibility features
 */

import type { Coordinates } from './transit-client'

// =============================================================================
// LYNX ROUTE DATABASE
// =============================================================================

export interface LynxRoute {
  number: string
  name: string
  description: string
  frequency: {
    peak: number      // Minutes between buses during rush hour
    offPeak: number   // Minutes between buses during off-peak
    weekend: number   // Minutes between buses on weekends
  }
  serviceHours: {
    weekday: { start: string; end: string }
    saturday: { start: string; end: string }
    sunday: { start: string; end: string }
  }
  majorStops: string[]
  coverage: 'downtown' | 'east' | 'west' | 'south' | 'north' | 'express'
  isExpress: boolean
  hasWifi: boolean
}

// Major LYNX routes in Orlando area
export const LYNX_ROUTES: Record<string, LynxRoute> = {
  '8': {
    number: '8',
    name: 'International Drive',
    description: 'Serves International Drive tourist corridor',
    frequency: { peak: 15, offPeak: 30, weekend: 30 },
    serviceHours: {
      weekday: { start: '05:00', end: '23:00' },
      saturday: { start: '06:00', end: '23:00' },
      sunday: { start: '07:00', end: '21:00' }
    },
    majorStops: ['LYNX Central Station', 'SeaWorld', 'I-Drive', 'Premium Outlets'],
    coverage: 'west',
    isExpress: false,
    hasWifi: true
  },
  '11': {
    number: '11',
    name: 'Orlando International Airport',
    description: 'Airport connector service',
    frequency: { peak: 30, offPeak: 30, weekend: 30 },
    serviceHours: {
      weekday: { start: '05:30', end: '23:30' },
      saturday: { start: '05:30', end: '23:30' },
      sunday: { start: '05:30', end: '23:30' }
    },
    majorStops: ['LYNX Central Station', 'Orlando International Airport'],
    coverage: 'south',
    isExpress: true,
    hasWifi: true
  },
  '13': {
    number: '13',
    name: 'UCF / Research Park',
    description: 'University of Central Florida and Research Park',
    frequency: { peak: 15, offPeak: 30, weekend: 45 },
    serviceHours: {
      weekday: { start: '05:30', end: '22:00' },
      saturday: { start: '07:00', end: '20:00' },
      sunday: { start: '08:00', end: '18:00' }
    },
    majorStops: ['LYNX Central Station', 'Fashion Square Mall', 'UCF', 'Research Park'],
    coverage: 'east',
    isExpress: false,
    hasWifi: true
  },
  '18': {
    number: '18',
    name: 'South Orange / Kissimmee',
    description: 'South Orange Blossom Trail to Kissimmee',
    frequency: { peak: 20, offPeak: 30, weekend: 45 },
    serviceHours: {
      weekday: { start: '05:00', end: '22:00' },
      saturday: { start: '06:00', end: '21:00' },
      sunday: { start: '07:00', end: '19:00' }
    },
    majorStops: ['LYNX Central Station', 'Florida Mall', 'Kissimmee Gateway'],
    coverage: 'south',
    isExpress: false,
    hasWifi: false
  },
  '21': {
    number: '21',
    name: 'Westgate / Pine Hills',
    description: 'West Colonial Drive corridor',
    frequency: { peak: 15, offPeak: 30, weekend: 30 },
    serviceHours: {
      weekday: { start: '05:00', end: '23:00' },
      saturday: { start: '06:00', end: '22:00' },
      sunday: { start: '07:00', end: '20:00' }
    },
    majorStops: ['LYNX Central Station', 'West Oaks Mall', 'Pine Hills'],
    coverage: 'west',
    isExpress: false,
    hasWifi: true
  },
  '30': {
    number: '30',
    name: 'Goldenrod Road',
    description: 'East Orlando via Goldenrod Road',
    frequency: { peak: 30, offPeak: 45, weekend: 60 },
    serviceHours: {
      weekday: { start: '05:30', end: '21:00' },
      saturday: { start: '07:00', end: '19:00' },
      sunday: { start: '08:00', end: '18:00' }
    },
    majorStops: ['LYNX Central Station', 'Fashion Square Mall', 'Valencia East'],
    coverage: 'east',
    isExpress: false,
    hasWifi: false
  },
  '37': {
    number: '37',
    name: 'Apopka',
    description: 'Orange Blossom Trail to Apopka',
    frequency: { peak: 20, offPeak: 30, weekend: 45 },
    serviceHours: {
      weekday: { start: '05:00', end: '22:00' },
      saturday: { start: '06:00', end: '21:00' },
      sunday: { start: '07:00', end: '19:00' }
    },
    majorStops: ['LYNX Central Station', 'Florida Hospital', 'Apopka SuperStop'],
    coverage: 'north',
    isExpress: false,
    hasWifi: true
  },
  '40': {
    number: '40',
    name: 'Conway / Orlando Airport',
    description: 'Conway Road to airport area',
    frequency: { peak: 30, offPeak: 45, weekend: 60 },
    serviceHours: {
      weekday: { start: '05:30', end: '21:00' },
      saturday: { start: '07:00', end: '19:00' },
      sunday: { start: '08:00', end: '18:00' }
    },
    majorStops: ['LYNX Central Station', 'Orlando Executive Airport', 'Conway'],
    coverage: 'south',
    isExpress: false,
    hasWifi: false
  },
  '42': {
    number: '42',
    name: 'International Drive / SeaWorld',
    description: 'Sand Lake Road corridor',
    frequency: { peak: 20, offPeak: 30, weekend: 30 },
    serviceHours: {
      weekday: { start: '05:30', end: '22:30' },
      saturday: { start: '06:00', end: '22:30' },
      sunday: { start: '07:00', end: '21:00' }
    },
    majorStops: ['LYNX Central Station', 'SeaWorld', 'Florida Mall', 'Airport'],
    coverage: 'west',
    isExpress: false,
    hasWifi: true
  },
  '50': {
    number: '50',
    name: 'Downtown / East Colonial',
    description: 'Main east-west corridor',
    frequency: { peak: 10, offPeak: 20, weekend: 30 },
    serviceHours: {
      weekday: { start: '05:00', end: '00:00' },
      saturday: { start: '05:30', end: '23:00' },
      sunday: { start: '06:00', end: '22:00' }
    },
    majorStops: ['LYNX Central Station', 'Fashion Square Mall', 'Waterford Lakes'],
    coverage: 'downtown',
    isExpress: false,
    hasWifi: true
  },
  '51': {
    number: '51',
    name: 'Conway / Michigan',
    description: 'Southeast Orlando',
    frequency: { peak: 30, offPeak: 45, weekend: 60 },
    serviceHours: {
      weekday: { start: '05:30', end: '21:00' },
      saturday: { start: '07:00', end: '19:00' },
      sunday: { start: '08:00', end: '18:00' }
    },
    majorStops: ['LYNX Central Station', 'Orlando Health', 'Conway'],
    coverage: 'south',
    isExpress: false,
    hasWifi: false
  },
  '55': {
    number: '55',
    name: 'Poinciana',
    description: 'Kissimmee to Poinciana',
    frequency: { peak: 30, offPeak: 45, weekend: 60 },
    serviceHours: {
      weekday: { start: '05:00', end: '21:00' },
      saturday: { start: '06:00', end: '19:00' },
      sunday: { start: '07:00', end: '18:00' }
    },
    majorStops: ['Kissimmee Intermodal Station', 'Osceola Square Mall', 'Poinciana'],
    coverage: 'south',
    isExpress: false,
    hasWifi: false
  },
  '104': {
    number: '104',
    name: 'East Colonial Express',
    description: 'Express service to UCF area',
    frequency: { peak: 30, offPeak: 60, weekend: 60 },
    serviceHours: {
      weekday: { start: '06:00', end: '20:00' },
      saturday: { start: '08:00', end: '18:00' },
      sunday: { start: '09:00', end: '17:00' }
    },
    majorStops: ['LYNX Central Station', 'Waterford Lakes', 'UCF'],
    coverage: 'express',
    isExpress: true,
    hasWifi: true
  },
  '111': {
    number: '111',
    name: 'Airport Link',
    description: 'Direct airport express',
    frequency: { peak: 30, offPeak: 30, weekend: 30 },
    serviceHours: {
      weekday: { start: '06:00', end: '22:00' },
      saturday: { start: '06:00', end: '22:00' },
      sunday: { start: '06:00', end: '22:00' }
    },
    majorStops: ['LYNX Central Station', 'Orlando International Airport'],
    coverage: 'express',
    isExpress: true,
    hasWifi: true
  },
  '306': {
    number: '306',
    name: 'Kissimmee Direct',
    description: 'Express service to Kissimmee',
    frequency: { peak: 30, offPeak: 60, weekend: 60 },
    serviceHours: {
      weekday: { start: '06:00', end: '20:00' },
      saturday: { start: '08:00', end: '18:00' },
      sunday: { start: '09:00', end: '17:00' }
    },
    majorStops: ['LYNX Central Station', 'Florida Mall', 'Kissimmee Intermodal'],
    coverage: 'express',
    isExpress: true,
    hasWifi: true
  }
}

// =============================================================================
// MAJOR TRANSIT HUBS
// =============================================================================

export interface TransitHub {
  name: string
  address: string
  coordinates: Coordinates
  routes: string[]
  amenities: string[]
  parkAndRide: boolean
}

export const LYNX_HUBS: TransitHub[] = [
  {
    name: 'LYNX Central Station',
    address: '455 N Garland Ave, Orlando, FL 32801',
    coordinates: { lat: 28.5449, lng: -81.3803 },
    routes: ['8', '11', '13', '18', '21', '30', '37', '40', '42', '50', '51', '104', '111', '306'],
    amenities: ['Restrooms', 'Ticket Office', 'Waiting Area', 'Bike Racks'],
    parkAndRide: false
  },
  {
    name: 'Kissimmee Intermodal Station',
    address: '101 E Dakin Ave, Kissimmee, FL 34741',
    coordinates: { lat: 28.3018, lng: -81.4093 },
    routes: ['18', '55', '306'],
    amenities: ['Restrooms', 'Ticket Office', 'Amtrak Connection'],
    parkAndRide: true
  },
  {
    name: 'Apopka SuperStop',
    address: '200 E Main St, Apopka, FL 32703',
    coordinates: { lat: 28.6814, lng: -81.5075 },
    routes: ['37'],
    amenities: ['Covered Waiting Area', 'Bike Racks'],
    parkAndRide: true
  },
  {
    name: 'Florida Mall SuperStop',
    address: '8001 S Orange Blossom Trail, Orlando, FL 32809',
    coordinates: { lat: 28.4485, lng: -81.3974 },
    routes: ['18', '42', '306'],
    amenities: ['Covered Waiting Area', 'Mall Access'],
    parkAndRide: false
  },
  {
    name: 'West Oaks Mall SuperStop',
    address: '9401 W Colonial Dr, Ocoee, FL 34761',
    coordinates: { lat: 28.5548, lng: -81.5186 },
    routes: ['21'],
    amenities: ['Covered Waiting Area', 'Mall Access'],
    parkAndRide: false
  },
  {
    name: 'UCF / Research Park SuperStop',
    address: 'UCF Transit Center, Orlando, FL 32816',
    coordinates: { lat: 28.6024, lng: -81.2001 },
    routes: ['13', '104'],
    amenities: ['Covered Waiting Area', 'Bike Racks', 'Student Services'],
    parkAndRide: true
  },
  {
    name: 'Waterford Lakes SuperStop',
    address: 'Waterford Lakes Town Center, Orlando, FL 32828',
    coordinates: { lat: 28.5694, lng: -81.1892 },
    routes: ['50', '104'],
    amenities: ['Covered Waiting Area', 'Shopping Access'],
    parkAndRide: false
  }
]

// =============================================================================
// SERVICE AREA COVERAGE
// =============================================================================

export interface ServiceArea {
  name: string
  bounds: {
    north: number
    south: number
    east: number
    west: number
  }
  routes: string[]
  coverage: 'good' | 'moderate' | 'limited'
}

export const LYNX_SERVICE_AREAS: ServiceArea[] = [
  {
    name: 'Downtown Orlando',
    bounds: { north: 28.58, south: 28.52, east: -81.35, west: -81.42 },
    routes: ['8', '21', '37', '40', '42', '50', '51'],
    coverage: 'good'
  },
  {
    name: 'International Drive',
    bounds: { north: 28.48, south: 28.40, east: -81.44, west: -81.52 },
    routes: ['8', '42'],
    coverage: 'good'
  },
  {
    name: 'UCF / East Orlando',
    bounds: { north: 28.65, south: 28.55, east: -81.15, west: -81.25 },
    routes: ['13', '50', '104'],
    coverage: 'moderate'
  },
  {
    name: 'South Orlando / Florida Mall',
    bounds: { north: 28.48, south: 28.40, east: -81.35, west: -81.45 },
    routes: ['18', '42', '306'],
    coverage: 'good'
  },
  {
    name: 'Kissimmee',
    bounds: { north: 28.35, south: 28.25, east: -81.35, west: -81.45 },
    routes: ['18', '55', '306'],
    coverage: 'moderate'
  },
  {
    name: 'West Orlando / Pine Hills',
    bounds: { north: 28.60, south: 28.52, east: -81.42, west: -81.55 },
    routes: ['21'],
    coverage: 'moderate'
  },
  {
    name: 'Winter Park',
    bounds: { north: 28.62, south: 28.55, east: -81.30, west: -81.40 },
    routes: ['50', '102'],
    coverage: 'moderate'
  },
  {
    name: 'Apopka',
    bounds: { north: 28.72, south: 28.65, east: -81.48, west: -81.55 },
    routes: ['37'],
    coverage: 'limited'
  }
]

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get route information by route number
 */
export function getRouteInfo(routeNumber: string): LynxRoute | undefined {
  return LYNX_ROUTES[routeNumber]
}

/**
 * Get all routes serving a specific coverage area
 */
export function getRoutesByArea(area: LynxRoute['coverage']): LynxRoute[] {
  return Object.values(LYNX_ROUTES).filter(route => route.coverage === area)
}

/**
 * Check if a location is within LYNX service area
 */
export function isWithinServiceArea(coords: Coordinates): {
  inService: boolean
  area: ServiceArea | null
  coverage: 'good' | 'moderate' | 'limited' | 'none'
  nearestRoutes: string[]
} {
  for (const area of LYNX_SERVICE_AREAS) {
    if (
      coords.lat <= area.bounds.north &&
      coords.lat >= area.bounds.south &&
      coords.lng >= area.bounds.west &&
      coords.lng <= area.bounds.east
    ) {
      return {
        inService: true,
        area,
        coverage: area.coverage,
        nearestRoutes: area.routes
      }
    }
  }

  // Not in primary service area - check if close
  const nearestArea = findNearestServiceArea(coords)
  if (nearestArea.distance < 5) { // Within 5 miles
    return {
      inService: true,
      area: nearestArea.area,
      coverage: 'limited',
      nearestRoutes: nearestArea.area.routes
    }
  }

  return {
    inService: false,
    area: null,
    coverage: 'none',
    nearestRoutes: []
  }
}

/**
 * Find nearest service area to a location
 */
function findNearestServiceArea(coords: Coordinates): {
  area: ServiceArea
  distance: number
} {
  let nearestArea = LYNX_SERVICE_AREAS[0]
  let nearestDistance = Infinity

  for (const area of LYNX_SERVICE_AREAS) {
    const centerLat = (area.bounds.north + area.bounds.south) / 2
    const centerLng = (area.bounds.east + area.bounds.west) / 2
    const distance = calculateDistanceMiles(coords, { lat: centerLat, lng: centerLng })

    if (distance < nearestDistance) {
      nearestDistance = distance
      nearestArea = area
    }
  }

  return { area: nearestArea, distance: nearestDistance }
}

/**
 * Calculate distance in miles between two coordinates
 */
function calculateDistanceMiles(coord1: Coordinates, coord2: Coordinates): number {
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
 * Check if service is available at a specific time
 */
export function isServiceAvailable(
  routeNumber: string,
  dateTime: Date
): { available: boolean; nextService?: Date; reason?: string } {
  const route = LYNX_ROUTES[routeNumber]
  if (!route) {
    return { available: false, reason: 'Route not found' }
  }

  const dayOfWeek = dateTime.getDay()
  const timeStr = dateTime.toTimeString().slice(0, 5)

  let serviceHours: { start: string; end: string }
  if (dayOfWeek === 0) {
    serviceHours = route.serviceHours.sunday
  } else if (dayOfWeek === 6) {
    serviceHours = route.serviceHours.saturday
  } else {
    serviceHours = route.serviceHours.weekday
  }

  if (timeStr < serviceHours.start) {
    // Before service starts
    const [hours, minutes] = serviceHours.start.split(':').map(Number)
    const nextService = new Date(dateTime)
    nextService.setHours(hours, minutes, 0, 0)
    return {
      available: false,
      nextService,
      reason: `Service starts at ${serviceHours.start}`
    }
  }

  if (timeStr > serviceHours.end) {
    // After service ends
    const nextDay = new Date(dateTime)
    nextDay.setDate(nextDay.getDate() + 1)
    const nextDayOfWeek = nextDay.getDay()

    let nextServiceHours: { start: string; end: string }
    if (nextDayOfWeek === 0) {
      nextServiceHours = route.serviceHours.sunday
    } else if (nextDayOfWeek === 6) {
      nextServiceHours = route.serviceHours.saturday
    } else {
      nextServiceHours = route.serviceHours.weekday
    }

    const [hours, minutes] = nextServiceHours.start.split(':').map(Number)
    nextDay.setHours(hours, minutes, 0, 0)

    return {
      available: false,
      nextService: nextDay,
      reason: `Service ended at ${serviceHours.end}`
    }
  }

  return { available: true }
}

/**
 * Get expected wait time for a route
 */
export function getExpectedWaitTime(routeNumber: string, dateTime: Date): number {
  const route = LYNX_ROUTES[routeNumber]
  if (!route) {
    return 30 // Default 30 minutes
  }

  const dayOfWeek = dateTime.getDay()
  const hour = dateTime.getHours()

  // Weekend
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return Math.round(route.frequency.weekend / 2)
  }

  // Rush hour (7-9 AM and 4-6 PM)
  if ((hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 18)) {
    return Math.round(route.frequency.peak / 2)
  }

  // Off-peak
  return Math.round(route.frequency.offPeak / 2)
}

/**
 * Find nearest transit hub to a location
 */
export function findNearestHub(coords: Coordinates): {
  hub: TransitHub
  distance: number
} {
  let nearestHub = LYNX_HUBS[0]
  let nearestDistance = Infinity

  for (const hub of LYNX_HUBS) {
    const distance = calculateDistanceMiles(coords, hub.coordinates)
    if (distance < nearestDistance) {
      nearestDistance = distance
      nearestHub = hub
    }
  }

  return { hub: nearestHub, distance: nearestDistance }
}

/**
 * Get all routes connecting two hubs
 */
export function getConnectingRoutes(hub1Name: string, hub2Name: string): string[] {
  const hub1 = LYNX_HUBS.find(h => h.name === hub1Name)
  const hub2 = LYNX_HUBS.find(h => h.name === hub2Name)

  if (!hub1 || !hub2) {
    return []
  }

  // Find routes that serve both hubs
  return hub1.routes.filter(route => hub2.routes.includes(route))
}

/**
 * Format route information for display
 */
export function formatRouteInfo(routeNumber: string): {
  display: string
  frequency: string
  hours: string
} {
  const route = LYNX_ROUTES[routeNumber]
  if (!route) {
    return {
      display: `Route ${routeNumber}`,
      frequency: 'Unknown',
      hours: 'Unknown'
    }
  }

  return {
    display: `Route ${route.number} - ${route.name}`,
    frequency: `Every ${route.frequency.peak}-${route.frequency.offPeak} min`,
    hours: `${route.serviceHours.weekday.start} - ${route.serviceHours.weekday.end}`
  }
}

/**
 * Check if a route has specific amenities
 */
export function hasAmenity(routeNumber: string, amenity: 'wifi' | 'express'): boolean {
  const route = LYNX_ROUTES[routeNumber]
  if (!route) return false

  if (amenity === 'wifi') return route.hasWifi
  if (amenity === 'express') return route.isExpress
  return false
}

export default {
  LYNX_ROUTES,
  LYNX_HUBS,
  LYNX_SERVICE_AREAS,
  getRouteInfo,
  getRoutesByArea,
  isWithinServiceArea,
  isServiceAvailable,
  getExpectedWaitTime,
  findNearestHub,
  getConnectingRoutes,
  formatRouteInfo,
  hasAmenity
}
