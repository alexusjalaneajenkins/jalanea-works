import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Vercel Serverless Function: Commute Calculation via Google Maps Distance Matrix API
 * 
 * This function securely calls Google Maps to calculate travel time and distance
 * without exposing the API key to the client.
 * 
 * Endpoint: /api/commute
 * Method: GET
 * Query Params:
 *   - origin: starting location (e.g., "Orlando, FL")
 *   - destination: job location (e.g., "1375 Buena Vista Dr, Orlando, FL")
 *   - mode: travel mode (driving, walking, bicycling, transit)
 */

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { origin, destination, mode = 'driving' } = req.query;

    // Validate required parameters
    if (!origin || typeof origin !== 'string') {
        return res.status(400).json({ error: 'Query parameter "origin" is required' });
    }

    if (!destination || typeof destination !== 'string') {
        return res.status(400).json({ error: 'Query parameter "destination" is required' });
    }

    // Validate mode
    const validModes = ['driving', 'walking', 'bicycling', 'transit'];
    if (typeof mode !== 'string' || !validModes.includes(mode)) {
        return res.status(400).json({
            error: `Invalid mode. Must be one of: ${validModes.join(', ')}`
        });
    }

    // Get API key from environment variables
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        console.error('GOOGLE_MAPS_API_KEY not configured');
        return res.status(500).json({ error: 'API key not configured' });
    }

    try {
        // Build Google Maps Distance Matrix API URL
        const params = new URLSearchParams({
            origins: origin,
            destinations: destination,
            mode: mode,
            key: apiKey,
            units: 'imperial', // Use miles instead of kilometers
        });

        const mapsApiUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?${params.toString()}`;

        console.log('Calculating commute:', { origin, destination, mode });

        // Call Google Maps API
        const response = await fetch(mapsApiUrl);

        if (!response.ok) {
            throw new Error(`Google Maps API returned ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Check for API errors
        if (data.status !== 'OK') {
            console.error('Google Maps API error:', data.status, data.error_message);
            return res.status(500).json({
                error: `Google Maps API error: ${data.status}`,
                details: data.error_message
            });
        }

        // Extract distance and duration
        const element = data.rows[0]?.elements[0];

        if (!element || element.status !== 'OK') {
            console.error('No route found:', element?.status);
            return res.status(404).json({
                error: 'No route found between origin and destination'
            });
        }

        // Calculate estimated cost for Uber (rough estimate: $1.50/mile + $5 base)
        let estimatedCost: number | undefined;
        if (mode === 'driving') {
            const miles = element.distance.value / 1609.34; // Convert meters to miles
            estimatedCost = Math.round((miles * 1.5 + 5) * 100) / 100; // Round to 2 decimals
        }

        // Return formatted commute info
        const commuteInfo = {
            distance: {
                text: element.distance.text,
                value: element.distance.value,
            },
            duration: {
                text: element.duration.text,
                value: element.duration.value,
            },
            mode: mode as 'driving' | 'walking' | 'bicycling' | 'transit',
            estimatedCost,
        };

        console.log('Commute calculated:', commuteInfo.duration.text, commuteInfo.distance.text);

        return res.status(200).json({
            commute: commuteInfo,
            origin: data.origin_addresses[0],
            destination: data.destination_addresses[0],
        });

    } catch (error) {
        console.error('Error calculating commute:', error);
        return res.status(500).json({
            error: 'Failed to calculate commute',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
