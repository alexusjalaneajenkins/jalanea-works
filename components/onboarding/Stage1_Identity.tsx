import React, { useState } from 'react';
import {
    UserCircle, MapPin, Linkedin, Globe,
    ArrowRight, MapPin as MapPinIcon, Layout, FileText, ExternalLink
} from 'lucide-react';

interface Stage1Props {
    data: {
        name: string;
        commuteStart: string;
        linkedinUrl: string;
        portfolioUrl: string;
    };
    onUpdate: (field: string, value: string) => void;
    onNext: () => void;
}

// Reverse geocode coordinates to readable address using OpenStreetMap Nominatim
const reverseGeocode = async (lat: number, lon: number): Promise<string> => {
    console.log('🌍 [Geocoding] Starting reverse geocode for:', { lat, lon });

    try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=16&addressdetails=1`;
        console.log('🌍 [Geocoding] Fetching:', url);

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'JalaneaWorks/1.0 (https://jalanea.works; contact@jalanea.works)'
            }
        });

        console.log('🌍 [Geocoding] Response status:', response.status);

        if (!response.ok) {
            throw new Error(`Geocoding failed with status: ${response.status}`);
        }

        const data = await response.json();
        console.log('🌍 [Geocoding] Raw API response:', data);

        const address = data.address;
        console.log('🌍 [Geocoding] Parsed address object:', address);

        // Build a readable address string
        const city = address.city || address.town || address.village || address.suburb || '';
        const state = address.state || '';
        const postcode = address.postcode || '';

        // Format: "Orlando, FL 32801" or similar
        console.log('🌍 [Geocoding] Building address from:', { city, state, postcode });

        let formattedAddress: string;
        if (city && state && postcode) {
            // Get state abbreviation (FL, GA, etc.)
            const stateAbbr = getStateAbbreviation(state);
            formattedAddress = `${city}, ${stateAbbr} ${postcode}`;
        } else if (city && state) {
            const stateAbbr = getStateAbbreviation(state);
            formattedAddress = `${city}, ${stateAbbr}`;
        } else if (postcode) {
            formattedAddress = postcode;
        } else {
            // Fallback to display name
            formattedAddress = data.display_name?.split(',').slice(0, 3).join(',') || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
        }

        console.log('✅ [Geocoding] Final formatted address:', formattedAddress);
        return formattedAddress;
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        // Return coordinates as fallback
        return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    }
};

// Helper to get US state abbreviations
const getStateAbbreviation = (stateName: string): string => {
    const stateAbbreviations: Record<string, string> = {
        'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
        'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
        'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
        'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
        'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
        'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
        'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
        'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
        'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
        'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY',
        'District of Columbia': 'DC'
    };
    return stateAbbreviations[stateName] || stateName;
};

export const Stage1_Identity: React.FC<Stage1Props> = ({ data, onUpdate, onNext }) => {
    const [showLinkedin, setShowLinkedin] = useState(!!data.linkedinUrl);
    const [showPortfolio, setShowPortfolio] = useState(!!data.portfolioUrl);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);

    const handleGeolocation = () => {
        console.log('📍 [Location] User clicked "Use My Location"');
        setIsLoadingLocation(true);
        setLocationError(null);

        if ('geolocation' in navigator) {
            console.log('📍 [Location] Geolocation API available, requesting position...');

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    console.log('📍 [Location] Got browser position:', { lat, lon, accuracy: position.coords.accuracy });

                    try {
                        // Get readable address from coordinates
                        const readableAddress = await reverseGeocode(lat, lon);

                        console.log('📍 [Location] Storing values:');
                        console.log('   commuteStart (display):', readableAddress);
                        console.log('   commuteCoords (raw):', `${lat},${lon}`);

                        // Store the readable address for display
                        onUpdate('commuteStart', readableAddress);

                        // Store coordinates separately for calculations
                        onUpdate('commuteCoords', `${lat},${lon}`);

                        setIsLoadingLocation(false);
                        console.log('✅ [Location] Complete!');
                    } catch (error) {
                        console.error('❌ [Location] Geocoding error:', error);
                        // Fallback to coordinates
                        onUpdate('commuteStart', `${lat.toFixed(4)}, ${lon.toFixed(4)}`);
                        onUpdate('commuteCoords', `${lat},${lon}`);
                        setIsLoadingLocation(false);
                    }
                },
                (error) => {
                    console.error("❌ [Location] Geolocation error:", error.code, error.message);
                    setIsLoadingLocation(false);

                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            console.log('❌ [Location] Permission denied by user');
                            setLocationError("Location access denied. Please enter your address manually.");
                            break;
                        case error.POSITION_UNAVAILABLE:
                            console.log('❌ [Location] Position unavailable');
                            setLocationError("Location unavailable. Please enter your address manually.");
                            break;
                        case error.TIMEOUT:
                            console.log('❌ [Location] Request timed out');
                            setLocationError("Location request timed out. Please try again.");
                            break;
                        default:
                            console.log('❌ [Location] Unknown error');
                            setLocationError("Unable to get location. Please enter your address manually.");
                    }
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000 // 5 minutes cache
                }
            );
        } else {
            setIsLoadingLocation(false);
            setLocationError("Geolocation is not supported by your browser");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section */}
            <div className="flex items-center gap-4">
                <div className="p-4 bg-amber-500/20 rounded-2xl">
                    <UserCircle className="w-8 h-8 text-amber-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Let's get you <span className="text-amber-600">set up</span>.</h2>
                    <p className="text-slate-600">Your profile is your ticket to the Central Florida ecosystem.</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Name Input */}
                <div className="relative group">
                    <label
                        htmlFor="name"
                        className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-2"
                    >
                        Full Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        value={data.name}
                        onChange={(e) => onUpdate('name', e.target.value)}
                        className="w-full px-4 py-3.5 min-h-[44px] rounded-xl border border-slate-300 bg-slate-100 text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all"
                        placeholder="e.g. Alexus Jenkins"
                    />
                </div>

                {/* Location Input */}
                <div className="relative group">
                    <label
                        htmlFor="commuteStart"
                        className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-2"
                    >
                        Commute Start Point
                    </label>
                    <div className="relative">
                        <div className="absolute left-4 top-4 text-slate-400 group-focus-within:text-amber-500 transition-colors">
                            <MapPin className="w-5 h-5" />
                        </div>
                        <input
                            type="text"
                            id="commuteStart"
                            value={data.commuteStart}
                            onChange={(e) => onUpdate('commuteStart', e.target.value)}
                            aria-describedby="commuteStart-helper"
                            className="w-full pl-12 pr-40 py-3.5 min-h-[44px] rounded-xl border border-slate-300 bg-slate-100 text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all"
                            placeholder="Address or Zip Code"
                        />
                        <button
                            type="button"
                            onClick={handleGeolocation}
                            disabled={isLoadingLocation}
                            aria-label={isLoadingLocation ? "Getting your location" : "Use my current location"}
                            className="absolute right-2 top-1.5 px-3 py-2.5 min-h-[44px] text-sm font-medium text-amber-600 hover:text-amber-700 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-white"
                        >
                            {isLoadingLocation ? (
                                <span className="animate-pulse">Locating...</span>
                            ) : (
                                <>
                                    <MapPinIcon className="w-4 h-4" />
                                    Use My Location
                                </>
                            )}
                        </button>
                    </div>
                    {locationError ? (
                        <p id="commuteStart-helper" role="alert" className="mt-2 text-xs text-red-500 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            {locationError}
                        </p>
                    ) : (
                        <p id="commuteStart-helper" className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            Used to calculate bus routes and commute times. Stays private.
                        </p>
                    )}
                </div>

                {/* Digital Presence Section */}
                <div className="pt-4 border-t border-slate-200">
                    <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-3">
                        Digital Presence <span className="font-normal text-slate-400">(Optional)</span>
                    </label>

                    <div className="space-y-4">
                        {/* Toggle Buttons */}
                        <div className="flex flex-wrap gap-3">
                            {!showLinkedin && (
                                <button
                                    type="button"
                                    onClick={() => setShowLinkedin(true)}
                                    className="flex items-center gap-2 px-4 py-3 min-h-[44px] rounded-xl border-2 border-dashed border-slate-300 text-slate-600 hover:border-[#0077b5] hover:text-[#0077b5] hover:bg-[#0077b5]/5 transition-all text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-white"
                                >
                                    <Linkedin className="w-4 h-4" />
                                    Add LinkedIn Profile
                                </button>
                            )}
                            {!showPortfolio && (
                                <button
                                    type="button"
                                    onClick={() => setShowPortfolio(true)}
                                    className="flex items-center gap-2 px-4 py-3 min-h-[44px] rounded-xl border-2 border-dashed border-slate-300 text-slate-600 hover:border-amber-500 hover:text-amber-600 hover:bg-amber-500/5 transition-all text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-white"
                                >
                                    <Globe className="w-4 h-4" />
                                    Add Portfolio
                                </button>
                            )}
                        </div>

                        {/* LinkedIn Input */}
                        {showLinkedin && (
                            <div className="animate-in slide-in-from-top-2 duration-300">
                                <div className="relative group">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label htmlFor="linkedin-input" className="text-xs font-bold text-[#0077b5] flex items-center gap-1.5">
                                            <Linkedin className="w-3.5 h-3.5" />
                                            LinkedIn Profile URL
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => { setShowLinkedin(false); onUpdate('linkedIn', ''); }}
                                            aria-label="Remove LinkedIn profile"
                                            className="text-xs text-slate-400 hover:text-red-500 transition-colors px-2 py-1 min-h-[32px] rounded focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-white"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute left-4 top-3.5 text-[#0077b5] transition-colors">
                                            <Linkedin className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="url"
                                            id="linkedin-input"
                                            value={data.linkedinUrl}
                                            onChange={(e) => onUpdate('linkedIn', e.target.value)}
                                            aria-describedby="linkedin-helper"
                                            className="w-full pl-12 pr-4 py-3.5 min-h-[44px] rounded-xl border border-slate-300 bg-slate-100 text-slate-900 placeholder:text-slate-400 focus:border-[#0077b5] focus:ring-2 focus:ring-[#0077b5]/20 focus:outline-none transition-all"
                                            placeholder="linkedin.com/in/yourprofile"
                                        />
                                    </div>
                                    <p id="linkedin-helper" className="mt-1.5 text-xs text-slate-500 flex items-center gap-1.5">
                                        <FileText className="w-3 h-3" />
                                        Will appear on your generated resume for employers to view
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Portfolio Input */}
                        {showPortfolio && (
                            <div className="animate-in slide-in-from-top-2 duration-300">
                                <div className="relative group">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label htmlFor="portfolio-input" className="text-xs font-bold text-amber-600 flex items-center gap-1.5">
                                            <Globe className="w-3.5 h-3.5" />
                                            Portfolio Website
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => { setShowPortfolio(false); onUpdate('portfolio', ''); }}
                                            aria-label="Remove portfolio website"
                                            className="text-xs text-slate-400 hover:text-red-500 transition-colors px-2 py-1 min-h-[32px] rounded focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-white"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute left-4 top-3.5 text-amber-600 transition-colors">
                                            <Globe className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="url"
                                            id="portfolio-input"
                                            value={data.portfolioUrl}
                                            onChange={(e) => onUpdate('portfolio', e.target.value)}
                                            aria-describedby="portfolio-helper"
                                            className="w-full pl-12 pr-4 py-3.5 min-h-[44px] rounded-xl border border-slate-300 bg-slate-100 text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all"
                                            placeholder="yourportfolio.com"
                                        />
                                    </div>
                                    <p id="portfolio-helper" className="mt-1.5 text-xs text-slate-500 flex items-center gap-1.5">
                                        <ExternalLink className="w-3 h-3" />
                                        Showcase your work samples and projects
                                    </p>
                                </div>
                            </div>
                        )}

                        {(!showLinkedin || !showPortfolio) && (
                            <p className="text-xs text-slate-500">
                                Don't have these yet? Skip for now. We'll help you build them later.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
