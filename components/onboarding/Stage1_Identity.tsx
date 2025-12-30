import React, { useState } from 'react';
import {
    UserCircle, MapPin, Linkedin, Globe,
    ArrowRight, MapPin as MapPinIcon, Layout
} from 'lucide-react';
import { Card } from '../Card';
// We'll trust the parent uses the correct types, but define the shape we need here
interface Stage1Props {
    data: {
        name: string;
        commuteStart: string;
        linkedinUrl: string; // Changed from linkedIn to match UserProfile type usually, preserving linkedIn if strictly following state
        portfolioUrl: string; // Changed from portfolio to match UserProfile type usually
    };
    onUpdate: (field: string, value: string) => void;
    onNext: () => void;
}

export const Stage1_Identity: React.FC<Stage1Props> = ({ data, onUpdate, onNext }) => {
    // Local state for UI toggles
    const [showLinkedin, setShowLinkedin] = useState(!!data.linkedinUrl);
    const [showPortfolio, setShowPortfolio] = useState(!!data.portfolioUrl);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);

    const handleGeolocation = () => {
        setIsLoadingLocation(true);
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    // In a real app, we'd reverse geocode coordinates to an address/zip
                    // For now, we'll just simulate a successful retrieval or put coordinates
                    const coords = `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;
                    onUpdate('commuteStart', `Current Location (${coords})`);
                    setIsLoadingLocation(false);
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    setIsLoadingLocation(false);
                    // Could add toast notification here
                }
            );
        } else {
            setIsLoadingLocation(false);
            alert("Geolocation is not supported by your browser");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* 1. Header Section */}
            <div className="flex items-center gap-4">
                <div className="p-4 bg-indigo-50 rounded-full">
                    <UserCircle className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Let's get you set up.</h2>
                    <p className="text-slate-500">Your profile is your ticket to the Central Florida ecosystem.</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Name Input */}
                <div className="relative group">
                    <label
                        htmlFor="name"
                        className="block text-sm font-medium text-jalanea-navy mb-1.5 transition-colors group-focus-within:text-indigo-600"
                    >
                        Full Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        value={data.name}
                        onChange={(e) => onUpdate('name', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-300"
                        placeholder="e.g. Alexus Jenkins"
                    />
                </div>

                {/* 2. The "Launchpad" Input (Location) */}
                <div className="relative group">
                    <label
                        htmlFor="commuteStart"
                        className="block text-sm font-medium text-jalanea-navy mb-1.5 transition-colors group-focus-within:text-indigo-600"
                    >
                        Commute Start Point
                    </label>
                    <div className="relative">
                        <div className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                            <MapPin className="w-5 h-5" />
                        </div>
                        <input
                            type="text"
                            id="commuteStart"
                            value={data.commuteStart}
                            onChange={(e) => onUpdate('commuteStart', e.target.value)}
                            className="w-full pl-12 pr-32 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-300"
                            placeholder="Address or Zip Code"
                        />
                        <button
                            type="button"
                            onClick={handleGeolocation}
                            disabled={isLoadingLocation}
                            className="absolute right-2 top-2 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
                        >
                            {isLoadingLocation ? (
                                <span className="animate-pulse">Locating...</span>
                            ) : (
                                <>
                                    <MapPinIcon className="w-3 h-3" />
                                    Current Location
                                </>
                            )}
                        </button>
                    </div>
                    <p className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        This is used to calculate bus routes and commute times. It stays private.
                    </p>
                </div>

                {/* 3. The "Digital Assets" Section (Accordion) */}
                <div className="pt-2">
                    <label className="block text-sm font-medium text-jalanea-navy mb-3">
                        Digital Presence (Optional)
                    </label>

                    <div className="space-y-4">
                        {/* Empty State Toggles */}
                        <div className="flex gap-3">
                            {!showLinkedin && (
                                <button
                                    type="button"
                                    onClick={() => setShowLinkedin(true)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-slate-300 text-slate-500 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all text-sm font-medium"
                                >
                                    <Linkedin className="w-4 h-4" />
                                    Add LinkedIn
                                </button>
                            )}
                            {!showPortfolio && (
                                <button
                                    type="button"
                                    onClick={() => setShowPortfolio(true)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-slate-300 text-slate-500 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all text-sm font-medium"
                                >
                                    <Globe className="w-4 h-4" />
                                    Add Portfolio
                                </button>
                            )}
                        </div>

                        {/* Expanded Inputs */}
                        {showLinkedin && (
                            <div className="animate-in slide-in-from-top-2 duration-300">
                                <div className="relative group">
                                    <div className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-[#0077b5] transition-colors">
                                        <Linkedin className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="url"
                                        value={data.linkedinUrl}
                                        onChange={(e) => onUpdate('linkedIn', e.target.value)} // Note: 'linkedIn' key to match parent state
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-[#0077b5] focus:ring-4 focus:ring-[#0077b5]/10 outline-none transition-all placeholder:text-slate-300"
                                        placeholder="LinkedIn URL"
                                    />
                                    <button
                                        onClick={() => { setShowLinkedin(false); onUpdate('linkedIn', ''); }}
                                        className="absolute right-3 top-3.5 text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                        <span className="sr-only">Remove</span>
                                        ×
                                    </button>
                                </div>
                            </div>
                        )}

                        {showPortfolio && (
                            <div className="animate-in slide-in-from-top-2 duration-300">
                                <div className="relative group">
                                    <div className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                        <Globe className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="url"
                                        value={data.portfolioUrl}
                                        onChange={(e) => onUpdate('portfolio', e.target.value)} // Note: 'portfolio' key to match parent state
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-slate-300"
                                        placeholder="Portfolio URL"
                                    />
                                    <button
                                        onClick={() => { setShowPortfolio(false); onUpdate('portfolio', ''); }}
                                        className="absolute right-3 top-3.5 text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                        <span className="sr-only">Remove</span>
                                        ×
                                    </button>
                                </div>
                            </div>
                        )}

                        {(!showLinkedin || !showPortfolio) && (
                            <p className="text-xs text-slate-400">
                                Don't have these yet? Skip for now. We'll help you build them later.
                            </p>
                        )}
                    </div>
                </div>
            </div>


        </div>
    );
};
