import type { CommuteInfo, TransportMode } from '../types';

/**
 * Service for calculating commute times and costs
 * Calls our Vercel serverless function to keep API keys secure
 */

const API_BASE_URL = import.meta.env.PROD
    ? 'https://jalanea-works.vercel.app'
    : 'http://localhost:5173';

/**
 * Calculate commute time and distance between two locations
 * @param origin - Starting location (e.g., "Orlando, FL")
 * @param destination - Destination location (e.g., "1375 Buena Vista Dr, Orlando, FL")
 * @param mode - Transport mode (driving, walking, bicycling, transit)
 * @returns CommuteInfo with distance, duration, and estimated cost
 */
export async function calculateCommute(
    origin: string,
    destination: string,
    mode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving'
): Promise<CommuteInfo> {
    try {
        const params = new URLSearchParams({
            origin,
            destination,
            mode,
        });

        const response = await fetch(`${API_BASE_URL}/api/commute?${params.toString()}`);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to calculate commute');
        }

        const data = await response.json();

        console.log(`✅ Commute calculated: ${data.commute.duration.text} (${data.commute.distance.text})`);
        return data.commute;

    } catch (error) {
        console.error('Error calculating commute:', error);
        throw error;
    }
}

/**
 * Map user's transport mode to Google Maps travel mode
 * @param transportMode - User's selected transport mode
 * @returns Google Maps API travel mode
 */
export function mapTransportModeToGoogleMaps(
    transportMode: TransportMode
): 'driving' | 'walking' | 'bicycling' | 'transit' {
    switch (transportMode) {
        case 'Car':
            return 'driving';
        case 'Bike':
        case 'Scooter': // E-scooters use bike lanes
            return 'bicycling';
        case 'Walk':
            return 'walking';
        case 'Bus':
        case 'Uber':
            return 'transit'; // For bus, use transit. For Uber, we'll use driving time
        default:
            return 'driving';
    }
}

/**
 * Calculate estimated monthly commute cost based on transport mode
 * @param commute - Commute info from Google Maps
 * @param transportMode - User's transport mode
 * @param workDaysPerWeek - Number of work days per week (default: 5)
 * @returns Estimated monthly cost in dollars
 */
export function calculateMonthlyCost(
    commute: CommuteInfo,
    transportMode: TransportMode,
    workDaysPerWeek: number = 5
): number {
    const distanceMiles = commute.distance.value / 1609.34; // Convert meters to miles
    const tripsPerMonth = workDaysPerWeek * 4 * 2; // 2 trips per day (to and from)

    switch (transportMode) {
        case 'Car':
            // Assume $0.67/mile (IRS rate 2024) for gas + maintenance
            return Math.round(distanceMiles * tripsPerMonth * 0.67);

        case 'Uber':
            // Estimate: $1.50/mile + $5 base fare per trip
            const costPerTrip = (distanceMiles * 1.5) + 5;
            return Math.round(costPerTrip * tripsPerMonth);

        case 'Bus':
            // Lynx Orlando monthly pass: ~$50
            return 50;

        case 'Bike':
        case 'Scooter':
        case 'Walk':
            // Minimal cost (just maintenance/shoes)
            return 10;

        default:
            return 0;
    }
}

/**
 * Get commute summary text for display
 * @param commute - Commute info
 * @param transportMode - User's transport mode
 * @returns Human-readable commute summary
 */
export function getCommuteSummary(
    commute: CommuteInfo,
    transportMode: TransportMode
): string {
    const { duration, distance } = commute;
    const monthlyCost = calculateMonthlyCost(commute, transportMode);

    let modeText = '';
    switch (transportMode) {
        case 'Car':
            modeText = 'drive';
            break;
        case 'Bus':
            modeText = 'bus ride';
            break;
        case 'Bike':
            modeText = 'bike ride';
            break;
        case 'Scooter':
            modeText = 'scooter ride';
            break;
        case 'Walk':
            modeText = 'walk';
            break;
        case 'Uber':
            modeText = 'Uber ride';
            break;
    }

    return `${duration.text} ${modeText} (${distance.text}) • ~$${monthlyCost}/mo`;
}

/**
 * Determine if commute is reasonable based on mode and time
 * @param commute - Commute info
 * @param transportMode - User's transport mode
 * @returns Object with isReasonable flag and reason
 */
export function evaluateCommute(
    commute: CommuteInfo,
    transportMode: TransportMode
): { isReasonable: boolean; reason?: string } {
    const durationMinutes = commute.duration.value / 60;
    const distanceMiles = commute.distance.value / 1609.34;

    // Define reasonable limits for each mode
    const limits: Record<TransportMode, { maxMinutes: number; maxMiles: number }> = {
        Car: { maxMinutes: 45, maxMiles: 30 },
        Bus: { maxMinutes: 60, maxMiles: 20 },
        Bike: { maxMinutes: 30, maxMiles: 10 },
        Scooter: { maxMinutes: 25, maxMiles: 8 },
        Walk: { maxMinutes: 30, maxMiles: 2 },
        Uber: { maxMinutes: 30, maxMiles: 15 },
    };

    const limit = limits[transportMode];

    if (durationMinutes > limit.maxMinutes) {
        return {
            isReasonable: false,
            reason: `⚠️ ${Math.round(durationMinutes)} min commute may be too long for daily ${transportMode.toLowerCase()}`,
        };
    }

    if (distanceMiles > limit.maxMiles) {
        return {
            isReasonable: false,
            reason: `⚠️ ${Math.round(distanceMiles)} miles may be too far for ${transportMode.toLowerCase()}`,
        };
    }

    return { isReasonable: true };
}
