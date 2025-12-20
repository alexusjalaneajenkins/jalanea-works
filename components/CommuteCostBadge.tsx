import React from 'react';
import { Car, Bus, Bike, Smartphone, Footprints, DollarSign } from 'lucide-react';
import { TransportMode } from '../types';

interface CommuteCostBadgeProps {
    transportMode: TransportMode;
    salary: number; // Annual salary
    compact?: boolean; // For inline display vs tooltip
}

// Monthly cost estimates (same as CommuteCostCalculator)
const getTransportCost = (mode: TransportMode): number => {
    const costs: Record<TransportMode, number> = {
        'Car': 650,
        'Bus': 50,
        'Uber': 600,
        'Bike': 10,
        'Scooter': 15,
        'Walk': 0
    };
    return costs[mode] || 0;
};

const getTransportIcon = (mode: TransportMode, size: number = 12) => {
    switch (mode) {
        case 'Bus': return <Bus size={size} />;
        case 'Bike': return <Bike size={size} />;
        case 'Scooter': return <Bike size={size} />;
        case 'Walk': return <Footprints size={size} />;
        case 'Uber': return <Smartphone size={size} />;
        default: return <Car size={size} />;
    }
};

export const CommuteCostBadge: React.FC<CommuteCostBadgeProps> = ({
    transportMode,
    salary,
    compact = true
}) => {
    const monthlyCost = getTransportCost(transportMode);
    const monthlyAfterTax = Math.round((salary * 0.75) / 12);
    const takeHome = monthlyAfterTax - monthlyCost;
    const percentOfIncome = Math.round((monthlyCost / monthlyAfterTax) * 100);

    if (compact) {
        return (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100" title={`You'd keep $${takeHome.toLocaleString()}/mo after commute costs`}>
                <DollarSign size={11} className="text-emerald-500" />
                <span>${monthlyCost}/mo commute</span>
                <span className="text-emerald-500">•</span>
                <span>Keep ${takeHome.toLocaleString()}</span>
            </div>
        );
    }

    // Expanded version (for tooltips or detail views)
    return (
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg p-3 border border-emerald-100">
            <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-emerald-100 rounded-md text-emerald-600">
                    {getTransportIcon(transportMode, 16)}
                </div>
                <span className="text-xs font-bold text-emerald-800">
                    {transportMode} Commute Cost
                </span>
            </div>
            <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                    <span className="text-emerald-600">Monthly cost:</span>
                    <span className="font-bold text-emerald-900">${monthlyCost}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-emerald-600">% of take-home:</span>
                    <span className="font-bold text-emerald-900">{percentOfIncome}%</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-emerald-200">
                    <span className="text-emerald-600">You'd keep:</span>
                    <span className="font-bold text-emerald-900">${takeHome.toLocaleString()}/mo</span>
                </div>
            </div>
        </div>
    );
};

export default CommuteCostBadge;
