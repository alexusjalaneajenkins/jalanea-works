import React from 'react';
import { Car, Bus, Bike, Smartphone, Footprints, CheckCircle2, Info } from 'lucide-react';
import { TransportMode } from '../types';

interface CommuteCostCalculatorProps {
    salary: number; // Annual salary
    onSelect: (mode: TransportMode) => void;
    selectedMode?: TransportMode;
}

interface TransportOption {
    mode: TransportMode;
    icon: React.ReactNode;
    label: string;
    monthlyCost: number;
    description: string;
    costBreakdown?: string;
}

// Estimate monthly costs for each transport mode
const getTransportOptions = (): TransportOption[] => [
    {
        mode: 'Car',
        icon: <Car size={28} />,
        label: 'Car Owner',
        monthlyCost: 650,
        description: 'Personal vehicle',
        costBreakdown: 'Loan + Insurance + Gas + Maintenance'
    },
    {
        mode: 'Bus',
        icon: <Bus size={28} />,
        label: 'Public Transit',
        monthlyCost: 50,
        description: 'Bus or rail',
        costBreakdown: 'Monthly transit pass'
    },
    {
        mode: 'Uber',
        icon: <Smartphone size={28} />,
        label: 'Rideshare',
        monthlyCost: 600,
        description: 'Uber / Lyft',
        costBreakdown: 'Estimate: 10 rides/week × $15'
    },
    {
        mode: 'Bike',
        icon: <Bike size={28} />,
        label: 'Bike / Scooter',
        monthlyCost: 10,
        description: 'Active commute',
        costBreakdown: 'Minimal maintenance'
    },
    {
        mode: 'Walk',
        icon: <Footprints size={28} />,
        label: 'Walk',
        monthlyCost: 0,
        description: 'Live nearby',
        costBreakdown: 'Free!'
    }
];

// Calculate monthly take-home after taxes and commute
const calculateTakeHome = (annualSalary: number, commuteCost: number): number => {
    // Assume ~25% effective tax rate for this salary range
    const monthlyAfterTax = (annualSalary * 0.75) / 12;
    return Math.round(monthlyAfterTax - commuteCost);
};

export const CommuteCostCalculator: React.FC<CommuteCostCalculatorProps> = ({
    salary,
    onSelect,
    selectedMode
}) => {
    const transportOptions = getTransportOptions();
    const monthlyAfterTax = Math.round((salary * 0.75) / 12);

    // Find the best option (highest take-home)
    const sortedByTakeHome = [...transportOptions].sort(
        (a, b) => calculateTakeHome(salary, a.monthlyCost) - calculateTakeHome(salary, b.monthlyCost)
    );
    const bestMode = sortedByTakeHome[sortedByTakeHome.length - 1].mode;

    return (
        <div className="space-y-6">
            {/* Header with salary context */}
            <div className="bg-jalanea-50 rounded-xl p-4 border border-jalanea-100">
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-gold/20 rounded-lg">
                        <span className="text-lg">💰</span>
                    </div>
                    <span className="text-sm font-bold text-jalanea-900">Your take-home context</span>
                </div>
                <p className="text-sm text-jalanea-600">
                    At <span className="font-bold text-jalanea-900">${salary.toLocaleString()}/year</span>,
                    your estimated monthly take-home (after ~25% taxes) is{' '}
                    <span className="font-bold text-gold">${monthlyAfterTax.toLocaleString()}/mo</span>
                </p>
            </div>

            {/* Transport mode cards */}
            <div className="grid grid-cols-2 gap-3">
                {transportOptions.map((option) => {
                    const takeHome = calculateTakeHome(salary, option.monthlyCost);
                    const isSelected = selectedMode === option.mode;
                    const isBest = option.mode === bestMode;
                    const percentOfIncome = Math.round((option.monthlyCost / monthlyAfterTax) * 100);

                    return (
                        <button
                            key={option.mode}
                            onClick={() => onSelect(option.mode)}
                            className={`
                                relative p-4 rounded-xl border-2 text-left transition-all
                                ${isSelected
                                    ? 'bg-jalanea-900 text-white border-jalanea-900 shadow-lg'
                                    : 'bg-white text-jalanea-700 border-jalanea-200 hover:border-gold hover:shadow-md'
                                }
                            `}
                        >
                            {/* Best value badge */}
                            {isBest && !isSelected && (
                                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    Best Value
                                </span>
                            )}

                            {/* Selected checkmark */}
                            {isSelected && (
                                <span className="absolute top-2 right-2">
                                    <CheckCircle2 size={18} className="text-gold" />
                                </span>
                            )}

                            {/* Icon and label */}
                            <div className={`mb-3 ${isSelected ? 'text-gold' : 'text-jalanea-400'}`}>
                                {option.icon}
                            </div>
                            <h4 className={`font-bold text-sm mb-1 ${isSelected ? 'text-white' : 'text-jalanea-900'}`}>
                                {option.label}
                            </h4>

                            {/* Cost */}
                            <div className={`text-lg font-bold mb-1 ${isSelected ? 'text-gold' : 'text-jalanea-900'}`}>
                                {option.monthlyCost === 0 ? '$0' : `~$${option.monthlyCost}`}
                                <span className={`text-xs font-normal ${isSelected ? 'text-jalanea-300' : 'text-jalanea-400'}`}>/mo</span>
                            </div>

                            {/* Cost as percentage */}
                            {option.monthlyCost > 0 && (
                                <p className={`text-xs mb-2 ${isSelected ? 'text-jalanea-300' : 'text-jalanea-400'}`}>
                                    {percentOfIncome}% of take-home
                                </p>
                            )}

                            {/* Take-home after commute */}
                            <div className={`pt-2 border-t ${isSelected ? 'border-jalanea-700' : 'border-jalanea-100'}`}>
                                <p className={`text-xs ${isSelected ? 'text-jalanea-300' : 'text-jalanea-500'}`}>
                                    You keep:
                                </p>
                                <p className={`font-bold ${isSelected ? 'text-white' : 'text-jalanea-900'}`}>
                                    ${takeHome.toLocaleString()}/mo
                                </p>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Info note */}
            <div className="flex items-start gap-2 text-xs text-jalanea-500">
                <Info size={14} className="shrink-0 mt-0.5" />
                <p>
                    Costs are estimates. Actual commute costs depend on your distance to work,
                    frequency of travel, and local prices.
                </p>
            </div>
        </div>
    );
};

export default CommuteCostCalculator;
