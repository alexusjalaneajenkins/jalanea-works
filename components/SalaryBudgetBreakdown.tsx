import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
    DollarSign, TrendingUp, Home, Car, ShoppingCart, Wallet,
    PiggyBank, Coffee, CheckCircle, ChevronDown, ChevronUp,
    Zap, Wifi, Droplets, Flame, Sparkles
} from 'lucide-react';

// ===== EXPORTED INTERFACE =====
export interface BudgetData {
    grossAnnual: number;
    netAnnual: number;
    monthlyGross: number;
    monthlyNet: number;
    housing: number;
    utilities: number;
    carPayment: number;
    carInsurance: number;
    food: number;
    wants: number;
    savings: number;
    housingPercent: number;
    utilitiesPercent: number;
    transportPercent: number;
    foodPercent: number;
    wantsPercent: number;
    savingsPercent: number;
    maxQualifyingRent: number;
}

interface SalaryBudgetBreakdownProps {
    location?: string;
    initialMin?: number;
    initialMax?: number;
    onChange?: (data: BudgetData) => void;
    compact?: boolean;
}

// ===== BUDGET CATEGORY COMPONENT (Extracted outside main component) =====
interface BudgetCategoryProps {
    id: string;
    icon: React.ReactNode;
    label: string;
    amount: number;
    percentage: number;
    iconBg: string;
    barColor: string;
    isExpanded: boolean;
    onToggle: (id: string) => void;
    children: React.ReactNode;
}

const BudgetCategory: React.FC<BudgetCategoryProps> = ({
    id,
    icon,
    label,
    amount,
    percentage,
    iconBg,
    barColor,
    isExpanded,
    onToggle,
    children
}) => {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(value);
    };

    return (
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
            <button
                type="button"
                onClick={() => onToggle(id)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
                <div className="flex items-center gap-3 flex-1">
                    <div className={`p-2 rounded-lg shrink-0 ${iconBg}`}>
                        {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <p className="font-bold text-slate-900">{label}</p>
                            <span className="text-lg font-bold text-slate-900 ml-2">{formatCurrency(amount)}</span>
                        </div>
                        <div className="mt-1.5 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all ${barColor}`}
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{percentage}% of take-home</p>
                    </div>
                    <div className="ml-2 shrink-0">
                        {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                    </div>
                </div>
            </button>

            {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-slate-100 bg-slate-50 animate-in slide-in-from-top-2 duration-200">
                    {children}
                </div>
            )}
        </div>
    );
};

// ===== BUDGET ALLOCATION PERCENTAGES (of NET income, = 100%) =====
const BUDGET_ALLOCATIONS = {
    housing: 0.40,
    utilities: 0.05,
    transport: 0.15,
    food: 0.12,
    wants: 0.13,
    savings: 0.15,
};

// ===== POSITIVE CONTEXT GENERATORS =====
const getHousingContext = (budget: number): { type: string; description: string; emoji: string } => {
    if (budget < 900) return {
        type: 'Room Rental or Shared Space',
        description: 'Great for saving money while getting started. Check Facebook Marketplace, Roomies.com, or Craigslist for roommate situations.',
        emoji: '🏠'
    };
    if (budget < 1100) return {
        type: 'Cozy Studio Apartment',
        description: 'Your own private space! Studios are efficient and keep costs low. Look in East Orlando, Pine Hills, or along Colonial Dr.',
        emoji: '🏢'
    };
    if (budget < 1400) return {
        type: '1 Bedroom Apartment',
        description: 'Solid options in Altamonte Springs, Casselberry, or East Orlando. You\'ll have space for a home office or guest area.',
        emoji: '🛏️'
    };
    if (budget < 1700) return {
        type: 'Nice 1BR or Basic 2BR',
        description: 'Access to newer complexes with amenities like pools and gyms. Winter Park adjacent and downtown-accessible areas open up.',
        emoji: '✨'
    };
    if (budget < 2100) return {
        type: '2 Bed / 2 Bath Apartment',
        description: 'Room for a roommate, home office, or growing family. Lake Nona, Baldwin Park, and other sought-after areas are within reach.',
        emoji: '🏊'
    };
    if (budget < 2600) return {
        type: 'Spacious 2BR or 3BR',
        description: 'Premium complexes with full amenities. Downtown Orlando, Winter Park, Dr. Phillips - take your pick!',
        emoji: '🌟'
    };
    return {
        type: 'House or Large Townhome',
        description: 'Single-family homes with yards, townhouses, or luxury apartments. Most Orlando neighborhoods are open to you.',
        emoji: '🏡'
    };
};

const getCarContext = (totalTransport: number): { type: string; examples: string; paymentEst: number; insuranceEst: number } => {
    const paymentBudget = Math.round(totalTransport * 0.60);
    const insuranceEst = totalTransport - paymentBudget;

    if (paymentBudget < 200) return {
        type: 'Paid-Off Reliable Car',
        examples: 'A solid 2008-2014 Honda Civic or Toyota Corolla with cash, or use public transit + Uber strategically',
        paymentEst: paymentBudget,
        insuranceEst
    };
    if (paymentBudget < 300) return {
        type: 'Dependable Used Car',
        examples: '2014-2017 Honda Civic, Toyota Corolla, Mazda3 - reliable with great gas mileage',
        paymentEst: paymentBudget,
        insuranceEst
    };
    if (paymentBudget < 400) return {
        type: 'Quality Pre-Owned',
        examples: '2018-2021 Honda Civic, Toyota Camry, Hyundai Elantra - newer features, still affordable',
        paymentEst: paymentBudget,
        insuranceEst
    };
    if (paymentBudget < 500) return {
        type: 'Late-Model Compact',
        examples: '2021-2023 Honda Civic, Mazda3, VW Jetta, Kia Forte - modern safety features and tech',
        paymentEst: paymentBudget,
        insuranceEst
    };
    if (paymentBudget < 650) return {
        type: 'Mid-Size Sedan or Small SUV',
        examples: '2022-2024 Toyota Camry, Honda Accord, Hyundai Tucson - room for passengers and cargo',
        paymentEst: paymentBudget,
        insuranceEst
    };
    return {
        type: 'New Car or Popular SUV',
        examples: 'Brand new Civic, RAV4, CR-V, Tesla Model 3 - whatever fits your lifestyle',
        paymentEst: paymentBudget,
        insuranceEst
    };
};

const getFoodContext = (budget: number): { style: string; stores: string; diningOut: string } => {
    if (budget < 300) return {
        style: 'Smart Meal Prepper',
        stores: 'Aldi and Walmart are your best friends. The Flashfood app has amazing last-minute deals.',
        diningOut: 'Treat yourself to fast food a couple times a month - you\'ve earned it!'
    };
    if (budget < 400) return {
        style: 'Strategic Shopper',
        stores: 'Mix Aldi staples with Publix BOGO deals. A Costco membership pays for itself.',
        diningOut: 'Fast casual spots like Chipotle or Panera 2-3x per month fit perfectly.'
    };
    if (budget < 550) return {
        style: 'Comfortable Cook',
        stores: 'Publix, Target, and occasional Whole Foods runs. Good variety and quality.',
        diningOut: 'Sit-down restaurants once or twice a week are totally doable.'
    };
    if (budget < 700) return {
        style: 'Flexible Foodie',
        stores: 'Shop anywhere you like. Organic and specialty items are within reach.',
        diningOut: 'Regular dining out, food delivery apps - you have options!'
    };
    return {
        style: 'Food Freedom',
        stores: 'Whole Foods, specialty stores, meal delivery kits - whatever sounds good.',
        diningOut: 'Dine out whenever the mood strikes. Life\'s too short for bad food!'
    };
};

const getWantsContext = (budget: number): { level: string; examples: string } => {
    if (budget < 200) return {
        level: 'Mindful Fun',
        examples: 'Netflix + free Orlando events, parks, and library resources. Quality over quantity!'
    };
    if (budget < 350) return {
        level: 'Balanced Lifestyle',
        examples: 'Streaming + gym OR a couple subscriptions. One solid hobby. Occasional concerts or events.'
    };
    if (budget < 500) return {
        level: 'Active Social Life',
        examples: '2-3 streaming services, gym membership, one hobby budget. Monthly outings with friends.'
    };
    if (budget < 700) return {
        level: 'Full Experience',
        examples: 'Multiple subscriptions, hobbies, regular entertainment. Theme parks 2-3x per year!'
    };
    return {
        level: 'Living Your Best Life',
        examples: 'Annual passes, multiple hobbies, travel fund, premium memberships - go for it!'
    };
};

const getSavingsContext = (monthly: number): { timeline: string; retirement: string; emergencyFund: string } => {
    const monthsTo5k = monthly > 0 ? Math.ceil(5000 / monthly) : 999;
    if (monthly < 200) return {
        timeline: `Building your $5k emergency fund in about ${monthsTo5k} months`,
        retirement: 'Start with your employer match if available - free money!',
        emergencyFund: 'Every dollar counts. You\'re building something real.'
    };
    if (monthly < 400) return {
        timeline: `$5k emergency fund in ${monthsTo5k} months - that's less than a year!`,
        retirement: '3-6% to 401k or Roth IRA gets you started',
        emergencyFund: 'You\'ll have a 3-month cushion within a year'
    };
    if (monthly < 600) return {
        timeline: `$5k emergency fund in just ${monthsTo5k} months`,
        retirement: '10-15% to retirement puts you ahead of most people',
        emergencyFund: 'A solid 6-month emergency fund is achievable in one year'
    };
    if (monthly < 900) return {
        timeline: `$5k emergency fund in ${monthsTo5k} months - nice!`,
        retirement: 'You can max out a Roth IRA ($7k/year) + contribute to 401k',
        emergencyFund: 'Strong savings rate - you\'re building real wealth'
    };
    return {
        timeline: `$5k emergency fund in just ${monthsTo5k} months`,
        retirement: 'Max out all retirement accounts and invest the rest',
        emergencyFund: 'Excellent position - your future self thanks you'
    };
};

// ===== MAIN COMPONENT =====
export const SalaryBudgetBreakdown: React.FC<SalaryBudgetBreakdownProps> = ({
    location = 'Orlando, FL',
    initialMin = 40000,
    initialMax = 55000,
    onChange,
    compact = false
}) => {
    // Salary state - independent from expansion state
    const [minSalary, setMinSalary] = useState(initialMin);
    const [maxSalary, setMaxSalary] = useState(initialMax);

    // Sync internal state when props change (e.g., when user selects a different tier)
    useEffect(() => {
        setMinSalary(initialMin);
        setMaxSalary(initialMax);
    }, [initialMin, initialMax]);

    // Expansion state - completely independent from salary calculations
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

    // ===== MEMOIZED CALCULATIONS - Recalculate when salary changes =====
    const budgetCalculations = useMemo(() => {
        const avgSalary = (minSalary + maxSalary) / 2;
        const monthlyGross = avgSalary / 12;
        const monthlyNet = Math.round(monthlyGross * 0.75);

        const housing = Math.round(monthlyNet * BUDGET_ALLOCATIONS.housing);
        const utilities = Math.round(monthlyNet * BUDGET_ALLOCATIONS.utilities);
        const transport = Math.round(monthlyNet * BUDGET_ALLOCATIONS.transport);
        const food = Math.round(monthlyNet * BUDGET_ALLOCATIONS.food);
        const wants = Math.round(monthlyNet * BUDGET_ALLOCATIONS.wants);
        const savings = Math.round(monthlyNet * BUDGET_ALLOCATIONS.savings);

        const carContext = getCarContext(transport);
        const maxQualifyingRent = Math.round(monthlyGross * 0.33);
        const totalAllocated = housing + utilities + transport + food + wants + savings;

        return {
            avgSalary,
            monthlyGross,
            monthlyNet,
            housing,
            utilities,
            transport,
            food,
            wants,
            savings,
            carPayment: carContext.paymentEst,
            carInsurance: carContext.insuranceEst,
            carContext,
            maxQualifyingRent,
            totalAllocated,
            housingContext: getHousingContext(housing),
            foodContext: getFoodContext(food),
            wantsContext: getWantsContext(wants),
            savingsContext: getSavingsContext(savings),
        };
    }, [minSalary, maxSalary]);

    // Destructure for cleaner access
    const {
        avgSalary, monthlyGross, monthlyNet,
        housing, utilities, transport, food, wants, savings,
        carPayment, carInsurance, carContext,
        maxQualifyingRent, totalAllocated,
        housingContext, foodContext, wantsContext, savingsContext
    } = budgetCalculations;

    // Notify parent of changes
    useEffect(() => {
        if (onChange) {
            onChange({
                grossAnnual: avgSalary,
                netAnnual: avgSalary * 0.75,
                monthlyGross,
                monthlyNet,
                housing,
                utilities,
                carPayment,
                carInsurance,
                food,
                wants,
                savings,
                housingPercent: BUDGET_ALLOCATIONS.housing * 100,
                utilitiesPercent: BUDGET_ALLOCATIONS.utilities * 100,
                transportPercent: BUDGET_ALLOCATIONS.transport * 100,
                foodPercent: BUDGET_ALLOCATIONS.food * 100,
                wantsPercent: BUDGET_ALLOCATIONS.wants * 100,
                savingsPercent: BUDGET_ALLOCATIONS.savings * 100,
                maxQualifyingRent
            });
        }
    }, [avgSalary, monthlyGross, monthlyNet, housing, utilities, carPayment, carInsurance, food, wants, savings, maxQualifyingRent, onChange]);

    // Toggle section expansion - memoized to prevent recreation
    const toggleSection = useCallback((section: string) => {
        setExpandedSections(prev => {
            const newExpanded = new Set(prev);
            if (newExpanded.has(section)) {
                newExpanded.delete(section);
            } else {
                newExpanded.add(section);
            }
            return newExpanded;
        });
    }, []);

    // Formatters
    const formatCurrency = useCallback((value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(value);
    }, []);

    const formatK = useCallback((value: number) => `$${Math.round(value / 1000)}k`, []);

    return (
        <div className="space-y-6">
            {/* Salary Range Slider */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-amber-100 rounded-xl">
                        <DollarSign className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 text-lg">Your Target Salary</h3>
                        <p className="text-sm text-slate-500">See what your paycheck can do for you</p>
                    </div>
                </div>

                {/* Current range display */}
                <div className="text-center mb-6">
                    <span className="text-4xl font-bold text-slate-900">
                        {formatK(minSalary)} – {formatK(maxSalary)}
                    </span>
                    <p className="text-sm text-slate-500 mt-1">per year</p>
                </div>

                {/* Sliders */}
                <div className="space-y-4 px-2">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Minimum: {formatK(minSalary)}
                        </label>
                        <input
                            type="range"
                            min={25000}
                            max={150000}
                            step={2500}
                            value={minSalary}
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (val < maxSalary) setMinSalary(val);
                            }}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Maximum: {formatK(maxSalary)}
                        </label>
                        <input
                            type="range"
                            min={25000}
                            max={150000}
                            step={2500}
                            value={maxSalary}
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (val > minSalary) setMaxSalary(val);
                            }}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-600"
                        />
                    </div>
                </div>

                {/* Key stats */}
                <div className="grid grid-cols-2 gap-3 mt-6">
                    <div className="bg-green-50 rounded-xl p-4 text-center border border-green-100">
                        <p className="text-xs font-bold text-green-700 uppercase">You Take Home</p>
                        <p className="text-2xl font-bold text-green-800">{formatCurrency(monthlyNet)}</p>
                        <p className="text-xs text-green-600">per month</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
                        <p className="text-xs font-bold text-blue-700 uppercase">You Qualify For</p>
                        <p className="text-2xl font-bold text-blue-800">{formatCurrency(maxQualifyingRent)}</p>
                        <p className="text-xs text-blue-600">monthly rent</p>
                    </div>
                </div>
            </div>

            {/* Positive summary card */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                <Sparkles className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                <div>
                    <p className="font-bold text-amber-900">Here's what you can afford</p>
                    <p className="text-sm text-amber-700 mt-1">
                        At {formatK(avgSalary)}/year, you'll take home {formatCurrency(monthlyNet)}/month.
                        Let's see how to make every dollar work for you.
                    </p>
                </div>
            </div>

            {/* Budget Breakdown */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-slate-600" />
                        Your Monthly Budget
                    </h3>
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg border border-green-200">
                        <CheckCircle className="w-3 h-3 inline mr-1" />
                        Every dollar planned
                    </span>
                </div>

                {/* Housing */}
                <BudgetCategory
                    id="housing"
                    icon={<Home className="w-5 h-5 text-blue-600" />}
                    label="Housing"
                    amount={housing}
                    percentage={BUDGET_ALLOCATIONS.housing * 100}
                    iconBg="bg-blue-100"
                    barColor="bg-blue-500"
                    isExpanded={expandedSections.has('housing')}
                    onToggle={toggleSection}
                >
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">{housingContext.emoji}</span>
                            <div>
                                <span className="font-bold text-slate-900 block">{housingContext.type}</span>
                                <span className="text-xs text-green-600">You qualify for up to {formatCurrency(maxQualifyingRent)}/mo</span>
                            </div>
                        </div>
                        <p className="text-sm text-slate-600">{housingContext.description}</p>
                    </div>
                </BudgetCategory>

                {/* Utilities */}
                <BudgetCategory
                    id="utilities"
                    icon={<Zap className="w-5 h-5 text-yellow-600" />}
                    label="Utilities"
                    amount={utilities}
                    percentage={BUDGET_ALLOCATIONS.utilities * 100}
                    iconBg="bg-yellow-100"
                    barColor="bg-yellow-500"
                    isExpanded={expandedSections.has('utilities')}
                    onToggle={toggleSection}
                >
                    <div className="space-y-2">
                        <p className="text-sm text-slate-600">You have {formatCurrency(utilities)}/mo for utilities:</p>
                        <div className="bg-white rounded-lg p-3 border border-slate-200 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="flex items-center gap-2 text-slate-600">
                                    <Flame className="w-4 h-4" /> Electric
                                </span>
                                <span className="font-medium">~{formatCurrency(Math.round(utilities * 0.55))}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="flex items-center gap-2 text-slate-600">
                                    <Wifi className="w-4 h-4" /> Internet
                                </span>
                                <span className="font-medium">~{formatCurrency(Math.round(utilities * 0.30))}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="flex items-center gap-2 text-slate-600">
                                    <Droplets className="w-4 h-4" /> Water
                                </span>
                                <span className="font-medium">~{formatCurrency(Math.round(utilities * 0.15))}</span>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500">
                            Pro tip: Many apartments include water in rent!
                        </p>
                    </div>
                </BudgetCategory>

                {/* Transportation */}
                <BudgetCategory
                    id="transport"
                    icon={<Car className="w-5 h-5 text-purple-600" />}
                    label="Transportation"
                    amount={transport}
                    percentage={BUDGET_ALLOCATIONS.transport * 100}
                    iconBg="bg-purple-100"
                    barColor="bg-purple-500"
                    isExpanded={expandedSections.has('transport')}
                    onToggle={toggleSection}
                >
                    <div className="space-y-3">
                        <div>
                            <p className="font-bold text-slate-900">{carContext.type}</p>
                            <p className="text-sm text-slate-600">{carContext.examples}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-slate-200 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Car Payment Budget</span>
                                <span className="font-bold text-slate-900">{formatCurrency(carPayment)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Insurance Budget</span>
                                <span className="font-bold text-slate-900">{formatCurrency(carInsurance)}</span>
                            </div>
                        </div>
                        <p className="text-xs text-green-600">
                            <CheckCircle className="w-3 h-3 inline mr-1" />
                            No car payment? That's {formatCurrency(carPayment)} extra for savings or upgrades!
                        </p>
                    </div>
                </BudgetCategory>

                {/* Food */}
                <BudgetCategory
                    id="food"
                    icon={<ShoppingCart className="w-5 h-5 text-green-600" />}
                    label="Food & Groceries"
                    amount={food}
                    percentage={BUDGET_ALLOCATIONS.food * 100}
                    iconBg="bg-green-100"
                    barColor="bg-green-500"
                    isExpanded={expandedSections.has('food')}
                    onToggle={toggleSection}
                >
                    <div className="space-y-3">
                        <div>
                            <p className="font-bold text-slate-900">{foodContext.style}</p>
                            <p className="text-sm text-slate-600">{foodContext.stores}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-slate-200">
                            <p className="text-xs font-bold text-slate-500 uppercase mb-1">Dining Out</p>
                            <p className="text-sm text-slate-700">{foodContext.diningOut}</p>
                        </div>
                        <p className="text-xs text-slate-500">
                            Orlando tip: Publix BOGO + Aldi basics = winning combo
                        </p>
                    </div>
                </BudgetCategory>

                {/* Wants */}
                <BudgetCategory
                    id="wants"
                    icon={<Coffee className="w-5 h-5 text-pink-600" />}
                    label="Fun & Entertainment"
                    amount={wants}
                    percentage={BUDGET_ALLOCATIONS.wants * 100}
                    iconBg="bg-pink-100"
                    barColor="bg-pink-500"
                    isExpanded={expandedSections.has('wants')}
                    onToggle={toggleSection}
                >
                    <div className="space-y-3">
                        <div>
                            <p className="font-bold text-slate-900">{wantsContext.level}</p>
                            <p className="text-sm text-slate-600">{wantsContext.examples}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-slate-200">
                            <p className="text-xs font-bold text-slate-500 uppercase mb-2">Sample Monthly Breakdown</p>
                            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                                <span>Streaming: $15-30</span>
                                <span>Gym: $25-50</span>
                                <span>Dining out: varies</span>
                                <span>Hobbies: varies</span>
                            </div>
                        </div>
                    </div>
                </BudgetCategory>

                {/* Savings */}
                <BudgetCategory
                    id="savings"
                    icon={<PiggyBank className="w-5 h-5 text-emerald-600" />}
                    label="Savings & Investing"
                    amount={savings}
                    percentage={BUDGET_ALLOCATIONS.savings * 100}
                    iconBg="bg-emerald-100"
                    barColor="bg-emerald-500"
                    isExpanded={expandedSections.has('savings')}
                    onToggle={toggleSection}
                >
                    <div className="space-y-3">
                        <div className="bg-white rounded-lg p-3 border border-slate-200 space-y-2">
                            <div className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-slate-900">Emergency Fund</p>
                                    <p className="text-xs text-slate-600">{savingsContext.emergencyFund}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-slate-900">Retirement</p>
                                    <p className="text-xs text-slate-600">{savingsContext.retirement}</p>
                                </div>
                            </div>
                        </div>
                        <p className="text-sm text-emerald-700 font-medium">{savingsContext.timeline}</p>
                        <p className="text-xs text-slate-500">
                            Pro tip: High-yield savings accounts offer 4-5% APY right now!
                        </p>
                    </div>
                </BudgetCategory>
            </div>

            {/* Monthly Summary */}
            <div className="bg-slate-900 rounded-2xl p-6 text-white">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-amber-400" />
                    Your Money, Organized
                </h3>

                {/* Stacked bar */}
                <div className="mb-4">
                    <div className="h-8 rounded-lg overflow-hidden flex">
                        <div className="bg-blue-500 transition-all" style={{ width: `${BUDGET_ALLOCATIONS.housing * 100}%` }} />
                        <div className="bg-yellow-500 transition-all" style={{ width: `${BUDGET_ALLOCATIONS.utilities * 100}%` }} />
                        <div className="bg-purple-500 transition-all" style={{ width: `${BUDGET_ALLOCATIONS.transport * 100}%` }} />
                        <div className="bg-green-500 transition-all" style={{ width: `${BUDGET_ALLOCATIONS.food * 100}%` }} />
                        <div className="bg-pink-500 transition-all" style={{ width: `${BUDGET_ALLOCATIONS.wants * 100}%` }} />
                        <div className="bg-emerald-500 transition-all" style={{ width: `${BUDGET_ALLOCATIONS.savings * 100}%` }} />
                    </div>
                </div>

                <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-700">
                        <span className="text-slate-300">Monthly Take-Home</span>
                        <span className="text-xl font-bold text-green-400">{formatCurrency(monthlyNet)}</span>
                    </div>

                    <div className="flex justify-between text-slate-400">
                        <span className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-sm bg-blue-500" /> Housing
                        </span>
                        <span>{formatCurrency(housing)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                        <span className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-sm bg-yellow-500" /> Utilities
                        </span>
                        <span>{formatCurrency(utilities)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                        <span className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-sm bg-purple-500" /> Transport
                        </span>
                        <span>{formatCurrency(transport)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                        <span className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-sm bg-green-500" /> Food
                        </span>
                        <span>{formatCurrency(food)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                        <span className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-sm bg-pink-500" /> Fun
                        </span>
                        <span>{formatCurrency(wants)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                        <span className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-sm bg-emerald-500" /> Savings
                        </span>
                        <span>{formatCurrency(savings)}</span>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-700">
                        <span className="font-bold text-white">Total Planned</span>
                        <span className="text-lg font-bold text-amber-400">{formatCurrency(totalAllocated)}</span>
                    </div>
                </div>

                <p className="text-xs text-slate-400 mt-4 text-center">
                    Every dollar has a job. You've got this! 💪
                </p>
            </div>
        </div>
    );
};

export default SalaryBudgetBreakdown;
