import React, { useState, useEffect } from 'react';
import { DollarSign, AlertTriangle, CheckCircle, TrendingUp, Home } from 'lucide-react';

interface SalaryRealityCheckProps {
    location: string;
    initialMin?: number;
    initialMax?: number;
    onChange: (min: number, max: number, monthlyNet: number, maxRent: number) => void;
}

// Average rent by Florida city (1BR apartment, 2024 estimates)
const CITY_RENTS: Record<string, number> = {
    'orlando': 1650,
    'miami': 2200,
    'tampa': 1700,
    'jacksonville': 1450,
    'fort lauderdale': 2100,
    'west palm beach': 1900,
    'gainesville': 1200,
    'tallahassee': 1100,
    'boca raton': 2000,
    'sarasota': 1800,
    'naples': 1900,
    'st. petersburg': 1650,
    'clearwater': 1550,
    'pensacola': 1200,
    'daytona beach': 1400,
};

const DEFAULT_RENT = 1500; // Default for unlisted cities

export const SalaryRealityCheck: React.FC<SalaryRealityCheckProps> = ({
    location,
    initialMin = 40000,
    initialMax = 60000,
    onChange
}) => {
    const [minSalary, setMinSalary] = useState(initialMin);
    const [maxSalary, setMaxSalary] = useState(initialMax);

    // Extract city from location string (e.g., "Orlando, FL" -> "orlando")
    const city = location.split(',')[0].trim().toLowerCase();
    const cityRent = CITY_RENTS[city] || DEFAULT_RENT;

    // Calculate monthly take-home (assume 25% tax/deductions)
    const avgSalary = (minSalary + maxSalary) / 2;
    const monthlyGross = avgSalary / 12;
    const monthlyNet = Math.round(monthlyGross * 0.75); // 25% tax estimate

    // 30% rent rule
    const maxRent = Math.round(monthlyNet * 0.30);

    // Is rent affordable?
    const isAffordable = maxRent >= cityRent;
    const rentGap = cityRent - maxRent;

    // Calculate recommended salary to afford this city
    const recommendedSalary = Math.ceil((cityRent / 0.30) * 12 / 0.75 / 1000) * 1000;

    // Notify parent of changes
    useEffect(() => {
        onChange(minSalary, maxSalary, monthlyNet, maxRent);
    }, [minSalary, maxSalary, monthlyNet, maxRent, onChange]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(value);
    };

    const formatK = (value: number) => {
        return `$${Math.round(value / 1000)}k`;
    };

    return (
        <div className="space-y-8">
            {/* Salary Range Slider */}
            <div className="bg-white rounded-2xl p-6 border border-jalanea-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-green-100 rounded-lg">
                        <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                        <h3 className="font-display font-bold text-jalanea-900">Target Salary Range</h3>
                        <p className="text-sm text-jalanea-500">What are you hoping to earn?</p>
                    </div>
                </div>

                {/* Display current range */}
                <div className="text-center mb-6">
                    <span className="text-3xl font-display font-bold text-jalanea-900">
                        {formatK(minSalary)} – {formatK(maxSalary)}
                    </span>
                    <p className="text-sm text-jalanea-500 mt-1">per year</p>
                </div>

                {/* Dual sliders */}
                <div className="space-y-4 px-2">
                    <div>
                        <label className="text-xs font-medium text-jalanea-500 uppercase tracking-wide">
                            Minimum: {formatK(minSalary)}
                        </label>
                        <input
                            type="range"
                            min={30000}
                            max={150000}
                            step={5000}
                            value={minSalary}
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (val < maxSalary) setMinSalary(val);
                            }}
                            className="w-full h-2 bg-jalanea-100 rounded-lg appearance-none cursor-pointer accent-green-500"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-jalanea-500 uppercase tracking-wide">
                            Maximum: {formatK(maxSalary)}
                        </label>
                        <input
                            type="range"
                            min={30000}
                            max={150000}
                            step={5000}
                            value={maxSalary}
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (val > minSalary) setMaxSalary(val);
                            }}
                            className="w-full h-2 bg-jalanea-100 rounded-lg appearance-none cursor-pointer accent-jalanea-500"
                        />
                    </div>
                </div>
            </div>

            {/* Reality Check Calculator */}
            <div className="bg-gradient-to-br from-jalanea-50 to-white rounded-2xl p-6 border border-jalanea-100">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-jalanea-100 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-jalanea-600" />
                    </div>
                    <div>
                        <h3 className="font-display font-bold text-jalanea-900">Financial Reality Check</h3>
                        <p className="text-sm text-jalanea-500">Based on your target salary</p>
                    </div>
                </div>

                {/* Budget breakdown */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white rounded-xl p-4 border border-jalanea-100">
                        <p className="text-xs font-medium text-jalanea-500 uppercase tracking-wide mb-1">
                            Est. Monthly Net
                        </p>
                        <p className="text-2xl font-display font-bold text-jalanea-900">
                            {formatCurrency(monthlyNet)}
                        </p>
                        <p className="text-xs text-jalanea-400 mt-1">After ~25% taxes</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-jalanea-100">
                        <p className="text-xs font-medium text-jalanea-500 uppercase tracking-wide mb-1">
                            Max Rent (30% Rule)
                        </p>
                        <p className="text-2xl font-display font-bold text-jalanea-900">
                            {formatCurrency(maxRent)}
                        </p>
                        <p className="text-xs text-jalanea-400 mt-1">Per month</p>
                    </div>
                </div>

                {/* City comparison */}
                <div className={`rounded-xl p-4 border ${isAffordable
                        ? 'bg-green-50 border-green-200'
                        : 'bg-amber-50 border-amber-200'
                    }`}>
                    <div className="flex items-start gap-3">
                        <div className={`p-1.5 rounded-lg ${isAffordable ? 'bg-green-100' : 'bg-amber-100'
                            }`}>
                            {isAffordable ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                                <AlertTriangle className="w-4 h-4 text-amber-600" />
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <Home className="w-4 h-4 text-jalanea-400" />
                                <span className="text-sm font-medium text-jalanea-700">
                                    Average Rent in {city.charAt(0).toUpperCase() + city.slice(1)}
                                </span>
                            </div>
                            <p className="text-lg font-bold text-jalanea-900 mb-2">
                                {formatCurrency(cityRent)}/mo
                            </p>

                            {isAffordable ? (
                                <p className="text-sm text-green-700">
                                    ✓ Your target salary comfortably covers rent in this area.
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    <p className="text-sm text-amber-700">
                                        This salary might be tight for {city.charAt(0).toUpperCase() + city.slice(1)}.
                                        You'd be {formatCurrency(rentGap)} over the 30% rule.
                                    </p>
                                    <p className="text-sm font-medium text-amber-800">
                                        💡 Recommended target: {formatK(recommendedSalary)}+
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalaryRealityCheck;
