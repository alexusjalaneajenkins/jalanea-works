import React, { useState, useEffect } from 'react';
import { DollarSign, AlertTriangle, CheckCircle, TrendingUp, Home } from 'lucide-react';

interface SalaryRealityCheckProps {
    location: string;
    initialMin?: number;
    initialMax?: number;
    onChange: (min: number, max: number, monthlyNet: number, maxRent: number, maxCarPayment: number) => void;
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

    // 30% Gross Income rule for Rent Qualification (Standard landlord metric)
    const maxRent = Math.round(monthlyGross / 3);

    // 15% Net Income rule for Car (Conservative budget)
    const maxCarPayment = Math.round(monthlyNet * 0.15);

    // Is rent affordable?
    const isAffordable = maxRent >= cityRent;
    const rentGap = cityRent - maxRent;

    // Calculate recommended salary to afford this city (Gross * 3 rule)
    const recommendedSalary = Math.ceil((cityRent * 3) * 12 / 1000) * 1000;

    // Notify parent of changes
    useEffect(() => {
        onChange(minSalary, maxSalary, monthlyNet, maxRent, maxCarPayment);
    }, [minSalary, maxSalary, monthlyNet, maxRent, maxCarPayment, onChange]);

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
                <div className="grid grid-cols-3 gap-4 mb-6">
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
                            Max Rent (Qualify)
                        </p>
                        <p className="text-2xl font-display font-bold text-jalanea-900">
                            {formatCurrency(maxRent)}
                        </p>
                        <p className="text-xs text-jalanea-400 mt-1">Gross / 3 Rule</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-jalanea-100">
                        <p className="text-xs font-medium text-jalanea-500 uppercase tracking-wide mb-1">
                            Max Car Note
                        </p>
                        <p className="text-2xl font-display font-bold text-jalanea-900">
                            {formatCurrency(maxCarPayment)}
                        </p>
                        <p className="text-xs text-jalanea-400 mt-1">15% Rule</p>
                    </div>
                </div>

                {/* City comparison */}
                {/* Lifestyle Context (What this buys you) */}
                <div className="bg-jalanea-50 rounded-xl p-5 border border-jalanea-200">
                    <h4 className="font-bold text-jalanea-900 mb-4 flex items-center gap-2">
                        <Home className="w-5 h-5 text-jalanea-600" />
                        What this budget gets you in Orlando:
                    </h4>

                    <div className="space-y-4">
                        {/* Housing Context */}
                        <div className="flex items-start gap-3">
                            <div className="p-1.5 bg-white rounded-lg border border-jalanea-100 shadow-sm mt-0.5">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-jalanea-900">Housing</p>
                                <p className="text-sm text-jalanea-600">
                                    {maxRent < 900 ? "Roommates / Shared Housing (<$900)" :
                                        maxRent < 1100 ? "Studio Apartment ($900 - $1100)" :
                                            maxRent < 1300 ? "Basic 1 Bed / 1 Bath ($1100 - $1300)" :
                                                maxRent < 1550 ? "Nice 1 Bed / 1 Bath ($1300 - $1550)" :
                                                    maxRent < 1900 ? "Standard 2 Bed / 2 Bath ($1550 - $1900)" :
                                                        maxRent < 2400 ? "Nice 2 Bed / 2 Bath ($1900 - $2400)" :
                                                            "3+ Bedrooms / House (> $2400)"}
                                </p>
                            </div>
                        </div>

                        {/* Car Context */}
                        <div className="flex items-start gap-3">
                            <div className="p-1.5 bg-white rounded-lg border border-jalanea-100 shadow-sm mt-0.5">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-jalanea-900">Transportation</p>
                                <p className="text-sm text-jalanea-600 mb-1">
                                    {maxCarPayment < 350 ? "2013-2016 Honda Civic or Toyota Corolla" :
                                        maxCarPayment < 550 ? "2019-2021 Honda Civic, Mazda3, or VW Jetta" :
                                            "New 2025 Toyota Camry, Honda Accord, or Tesla Model 3"}
                                </p>
                                <p className="text-xs text-jalanea-400">
                                    + Est. Insurance: ${maxCarPayment < 350 ? "250" : maxCarPayment < 550 ? "280" : "300"}/mo (Full Coverage)
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalaryRealityCheck;
