import React, { useState, useMemo } from 'react';
import { DollarSign, Check, ChevronDown, ChevronUp, Home, Building2, Users } from 'lucide-react';
import { SalaryBudgetBreakdown, BudgetData } from '../SalaryBudgetBreakdown';

interface Stage4Props {
    data: {
        salaryMin: number | null;
        salaryMax: number | null;
        budgetData: BudgetData | null;
    };
    onUpdate: (field: string, value: any) => void;
}

// Salary tier configuration
const SALARY_TIERS = [
    {
        id: 'entry',
        label: 'Entry Level',
        range: '$30K - $40K',
        min: 30000,
        max: 40000,
        housing: 'Studio / Roommates',
        housingIcon: Users,
        rent: '$850-1,000/mo',
        description: 'Shared housing or studio apartment'
    },
    {
        id: 'growing',
        label: 'Growing',
        range: '$40K - $52K',
        min: 40000,
        max: 52000,
        housing: '1 Bedroom',
        housingIcon: Building2,
        rent: '$1,000-1,300/mo',
        description: 'Your own 1BR apartment'
    },
    {
        id: 'comfortable',
        label: 'Comfortable',
        range: '$52K - $62K',
        min: 52000,
        max: 62000,
        housing: 'Nice 1 Bedroom',
        housingIcon: Building2,
        rent: '$1,350-1,500/mo',
        description: 'Upgraded 1BR in nicer area'
    },
    {
        id: 'established',
        label: 'Established',
        range: '$62K - $75K',
        min: 62000,
        max: 75000,
        housing: '2 Bedroom',
        housingIcon: Home,
        rent: '$1,550-1,800/mo',
        description: '2BR apartment or townhome'
    },
    {
        id: 'thriving',
        label: 'Thriving',
        range: '$75K - $90K',
        min: 75000,
        max: 90000,
        housing: 'Nice 2 Bedroom',
        housingIcon: Home,
        rent: '$1,800-2,100/mo',
        description: 'Premium 2BR or small house'
    },
    {
        id: 'advanced',
        label: 'Advanced',
        range: '$90K+',
        min: 90000,
        max: 120000,
        housing: '3 Bedroom / House',
        housingIcon: Home,
        rent: '$2,100+/mo',
        description: 'House or large apartment'
    },
] as const;

// Find tier based on salary values
const findTierFromSalary = (min: number | null, max: number | null): string | null => {
    if (min === null || max === null) return null;
    const tier = SALARY_TIERS.find(t => t.min === min && t.max === max);
    return tier?.id || null;
};

export const Stage4_Salary: React.FC<Stage4Props> = ({ data, onUpdate }) => {
    // Derive selected tier from current salary values
    const selectedTier = useMemo(() => {
        return findTierFromSalary(data.salaryMin, data.salaryMax);
    }, [data.salaryMin, data.salaryMax]);

    // State for showing detailed budget breakdown
    const [showBudgetBreakdown, setShowBudgetBreakdown] = useState(false);

    // Handle tier selection
    const handleTierSelect = (tierId: string) => {
        const tier = SALARY_TIERS.find(t => t.id === tierId);
        if (tier) {
            onUpdate('salaryMin', tier.min);
            onUpdate('salaryMax', tier.max);
        }
    };

    // Handle budget data changes from the SalaryBudgetBreakdown component
    const handleBudgetChange = (budgetData: BudgetData) => {
        onUpdate('budgetData', budgetData);
    };

    // Get the selected tier object
    const selectedTierData = SALARY_TIERS.find(t => t.id === selectedTier);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-4 mb-2">
                <div className="p-4 bg-amber-500/20 rounded-2xl">
                    <DollarSign className="w-8 h-8 text-amber-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                        <span className="text-amber-600">Salary</span> Target
                    </h2>
                    <p className="text-slate-600">What income level are you targeting? We'll show you what it affords in Orlando.</p>
                </div>
            </div>

            {/* Salary Tier Grid - 3x2 */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3" role="group" aria-label="Salary target options">
                {SALARY_TIERS.map((tier) => {
                    const isSelected = selectedTier === tier.id;
                    return (
                        <button
                            key={tier.id}
                            type="button"
                            onClick={() => handleTierSelect(tier.id)}
                            aria-pressed={isSelected}
                            className={`p-4 min-h-[88px] rounded-xl border-2 transition-all text-left relative focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-white ${
                                isSelected
                                    ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/25'
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-amber-300 hover:bg-amber-50'
                            }`}
                        >
                            {isSelected && (
                                <div className="absolute top-2 right-2">
                                    <Check className="w-5 h-5 text-white" />
                                </div>
                            )}
                            <div className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                                {tier.range}
                            </div>
                            <div className={`text-sm font-medium mt-1 ${isSelected ? 'text-white/80' : 'text-amber-600'}`}>
                                {tier.label}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Housing Affordability Preview - Shows when tier is selected */}
            {selectedTierData && (
                <div className="p-5 bg-amber-50 border border-amber-200 rounded-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-amber-500 rounded-xl text-white shrink-0">
                            <selectedTierData.housingIcon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <div className="text-sm text-amber-700 font-medium mb-1">
                                In Orlando, this salary lets you comfortably afford:
                            </div>
                            <div className="text-xl font-bold text-slate-900 mb-1">
                                {selectedTierData.housing}
                            </div>
                            <div className="text-sm text-slate-600 mb-2">
                                {selectedTierData.description}
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                                <span className="px-3 py-1 bg-white rounded-lg border border-amber-200 text-amber-700 font-medium">
                                    Rent: {selectedTierData.rent}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-amber-200">
                        <p className="text-xs text-amber-600">
                            Based on the 30% rule - spending no more than 30% of gross income on rent.
                        </p>
                    </div>
                </div>
            )}

            {/* View Detailed Budget Breakdown Button */}
            {selectedTierData && (
                <button
                    type="button"
                    onClick={() => setShowBudgetBreakdown(!showBudgetBreakdown)}
                    className="w-full p-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-amber-500 hover:bg-amber-50 transition-all flex items-center justify-center gap-3 text-slate-600 hover:text-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                >
                    <DollarSign className="w-5 h-5" />
                    <span className="font-bold">
                        {showBudgetBreakdown ? 'Hide' : 'View'} Detailed Budget Breakdown
                    </span>
                    {showBudgetBreakdown ? (
                        <ChevronUp className="w-5 h-5" />
                    ) : (
                        <ChevronDown className="w-5 h-5" />
                    )}
                </button>
            )}

            {/* Detailed Budget Breakdown Component */}
            {showBudgetBreakdown && selectedTierData && (
                <div className="animate-in slide-in-from-top-4 duration-300">
                    <SalaryBudgetBreakdown
                        location="Orlando, FL"
                        initialMin={selectedTierData.min}
                        initialMax={selectedTierData.max}
                        onChange={handleBudgetChange}
                        compact={true}
                    />
                </div>
            )}
        </div>
    );
};

export default Stage4_Salary;
