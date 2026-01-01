import React from 'react';
import {
    Car, Bus, Footprints, Calendar, Clock,
    Check, Route, Sun, Sunset, Moon, Coffee
} from 'lucide-react';

interface Stage3Props {
    data: {
        transport: string[];
        commuteTolerance?: 'local' | 'standard' | 'extended';
        // New availability fields
        availability?: 'open' | 'weekdays' | 'weekends' | 'flexible' | 'limited';
        selectedDays?: string[];
        shiftPreference?: string[];
    };
    onUpdate: (field: string, value: any) => void;
    onNext: () => void;
    onBack: () => void;
}

const TRANSPORT_OPTIONS = [
    { value: 'car', label: 'Personal Car', icon: <Car className="w-5 h-5" />, desc: 'Reliable, wide range' },
    { value: 'bus', label: 'LYNX Bus', icon: <Bus className="w-5 h-5" />, desc: 'Budget-friendly' },
    { value: 'rideshare', label: 'Rideshare', icon: <Car className="w-5 h-5" />, desc: 'Uber/Lyft reliance' },
    { value: 'walk', label: 'Walk / Bike', icon: <Footprints className="w-5 h-5" />, desc: 'Hyper-local only' },
] as const;

const AVAILABILITY_OPTIONS = [
    { value: 'open', label: 'Open to anything', desc: 'Any day, any shift works' },
    { value: 'weekdays', label: 'Weekdays preferred', desc: 'Monday - Friday focus' },
    { value: 'weekends', label: 'Weekends preferred', desc: 'Saturday & Sunday focus' },
    { value: 'flexible', label: 'Flexible / I set my own hours', desc: 'Gig work, freelance' },
    { value: 'limited', label: 'Specific days only', desc: 'I have set days available' },
] as const;

const DAYS_OF_WEEK = [
    { value: 'mon', label: 'Mon' },
    { value: 'tue', label: 'Tue' },
    { value: 'wed', label: 'Wed' },
    { value: 'thu', label: 'Thu' },
    { value: 'fri', label: 'Fri' },
    { value: 'sat', label: 'Sat' },
    { value: 'sun', label: 'Sun' },
] as const;

const SHIFT_PREFERENCES = [
    { value: 'morning', label: 'Morning', icon: <Coffee className="w-4 h-4" />, time: '6am - 12pm' },
    { value: 'afternoon', label: 'Afternoon', icon: <Sun className="w-4 h-4" />, time: '12pm - 6pm' },
    { value: 'evening', label: 'Evening', icon: <Sunset className="w-4 h-4" />, time: '6pm - 12am' },
    { value: 'overnight', label: 'Overnight', icon: <Moon className="w-4 h-4" />, time: '12am - 6am' },
    { value: 'any', label: 'No preference', icon: <Check className="w-4 h-4" />, time: 'Any shift' },
] as const;

export const Stage3_Logistics: React.FC<Stage3Props> = ({ data, onUpdate }) => {
    // Ensure transport is an array for backward compatibility
    const transportArray = Array.isArray(data.transport) ? data.transport : [data.transport].filter(Boolean);
    const shiftArray = data.shiftPreference || [];
    const selectedDays = data.selectedDays || [];

    const handleTransportToggle = (value: string) => {
        const newTransport = transportArray.includes(value)
            ? transportArray.filter(t => t !== value)
            : [...transportArray, value];
        onUpdate('transport', newTransport);
    };

    const handleShiftToggle = (value: string) => {
        // If selecting "any", clear other selections
        if (value === 'any') {
            onUpdate('shiftPreference', shiftArray.includes('any') ? [] : ['any']);
            return;
        }
        // If selecting a specific shift, remove "any" if present
        let newShifts = shiftArray.filter(s => s !== 'any');
        newShifts = newShifts.includes(value)
            ? newShifts.filter(s => s !== value)
            : [...newShifts, value];
        onUpdate('shiftPreference', newShifts);
    };

    const handleDayToggle = (value: string) => {
        const newDays = selectedDays.includes(value)
            ? selectedDays.filter(d => d !== value)
            : [...selectedDays, value];
        onUpdate('selectedDays', newDays);
    };

    const getTransportFeedback = () => {
        const hasWalk = transportArray.includes('walk');
        const hasBus = transportArray.includes('bus');
        const hasCar = transportArray.includes('car');
        const hasRideshare = transportArray.includes('rideshare');

        if (hasCar) {
            return { badge: 'Wide Radius', text: 'Full ecosystem access', color: 'bg-green-50 text-green-700 border-green-200' };
        }
        if (hasBus) {
            const extraNote = hasRideshare ? ' + Rideshare backup' : '';
            return { badge: 'Transit Corridor', text: `Prioritizing routes on LYNX lines${extraNote}`, color: 'bg-blue-50 text-blue-700 border-blue-200' };
        }
        if (hasRideshare) {
            return {
                badge: 'Rideshare Mode',
                text: 'Uber/Lyft reliance - budget $150-300/mo for rides',
                color: 'bg-purple-50 text-purple-700 border-purple-200'
            };
        }
        if (hasWalk && transportArray.length === 1) {
            return { badge: 'Hyper-Local', text: 'Jobs within 3-5 miles only', color: 'bg-amber-50 text-amber-700 border-amber-200' };
        }
        return null;
    };

    const transportFeedback = getTransportFeedback();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="p-4 bg-amber-500/20 rounded-2xl">
                    <Route className="w-8 h-8 text-amber-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Mission <span className="text-amber-600">Logistics</span></h2>
                    <p className="text-slate-600">Define your range and availability parameters.</p>
                </div>
            </div>

            {/* 1. Transport Cards - Multi-select */}
            <div className="space-y-4">
                <label className="block text-xs font-medium uppercase tracking-wider text-slate-500">
                    How do you get to the mission? <span className="font-normal text-slate-400">(Select all that apply)</span>
                </label>
                <div className="grid grid-cols-2 gap-3" role="group" aria-label="Transportation options">
                    {TRANSPORT_OPTIONS.map((opt) => {
                        const isSelected = transportArray.includes(opt.value);
                        return (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => handleTransportToggle(opt.value)}
                                aria-pressed={isSelected}
                                className={`flex flex-col md:flex-row items-center md:gap-3 gap-2 p-4 min-h-[44px] rounded-xl border-2 transition-all text-center md:text-left relative focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-white ${isSelected
                                    ? 'border-amber-500 bg-amber-50'
                                    : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100'
                                    }`}
                            >
                                {isSelected && (
                                    <div className="absolute top-2 right-2">
                                        <Check className="w-4 h-4 text-amber-600" />
                                    </div>
                                )}
                                <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-amber-500/20 text-amber-600' : 'bg-slate-200 text-slate-500'}`}>
                                    {opt.icon}
                                </div>
                                <div className="flex-1">
                                    <div className={`font-bold ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                                        {opt.label}
                                    </div>
                                    <div className="text-xs text-slate-500 hidden md:block">{opt.desc}</div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Dynamic Context Feedback */}
                {transportFeedback && (
                    <div className={`p-3.5 rounded-xl border flex items-center gap-3 animate-in fade-in duration-300 ${transportFeedback.color}`}>
                        <span className="font-bold text-sm px-2.5 py-1 bg-white rounded-lg border border-current/20">
                            {transportFeedback.badge}
                        </span>
                        <span className="text-sm">{transportFeedback.text}</span>
                    </div>
                )}
            </div>

            {/* 2. Commute Tolerance */}
            <div className="space-y-3">
                <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 flex items-center justify-between">
                    <span>Max Commute Willingness</span>
                    <span className="font-normal normal-case text-slate-400">How far will you go?</span>
                </label>

                <div className="bg-slate-100 p-1.5 rounded-xl flex border border-slate-200" role="group" aria-label="Commute distance preference">
                    {([
                        { value: 'local', label: 'Local', subLabel: '< 30 min' },
                        { value: 'standard', label: 'Standard', subLabel: '< 60 min' },
                        { value: 'extended', label: 'Any Distance', subLabel: '60+ min' }
                    ] as const).map((level) => {
                        const isSelected = data.commuteTolerance === level.value;
                        return (
                            <button
                                key={level.value}
                                type="button"
                                onClick={() => onUpdate('commuteTolerance', level.value)}
                                aria-pressed={isSelected}
                                className={`flex-1 py-3 px-2 min-h-[44px] rounded-lg text-sm font-bold transition-all flex flex-col items-center justify-center gap-0.5 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-white ${isSelected
                                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
                                    }`}
                            >
                                <span>{level.label}</span>
                                <span className={`text-[10px] font-normal ${isSelected ? 'text-amber-100' : 'text-slate-400'}`}>
                                    {level.subLabel}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 3. Availability Section */}
            <div className="pt-6 border-t border-slate-200 space-y-6">
                {/* Section Header */}
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-500/20 rounded-xl">
                        <Calendar className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-900">
                            When are you available to work?
                        </label>
                        <p className="text-xs text-slate-500">This helps us find opportunities that fit your schedule</p>
                    </div>
                </div>

                {/* General Availability - Single Select */}
                <div className="space-y-3">
                    <div className="grid grid-cols-1 gap-2" role="radiogroup" aria-label="General availability">
                        {AVAILABILITY_OPTIONS.map((opt) => {
                            const isSelected = data.availability === opt.value;
                            return (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => {
                                        onUpdate('availability', opt.value);
                                        // Clear selected days if not "limited"
                                        if (opt.value !== 'limited') {
                                            onUpdate('selectedDays', []);
                                        }
                                    }}
                                    aria-pressed={isSelected}
                                    className={`w-full p-4 min-h-[44px] rounded-xl border-2 transition-all text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-white ${isSelected
                                        ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/25'
                                        : 'bg-white border-slate-200 text-slate-600 hover:border-amber-300 hover:bg-amber-50'
                                    }`}
                                >
                                    <div>
                                        <div className={`font-bold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                                            {opt.label}
                                        </div>
                                        <div className={`text-sm ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                                            {opt.desc}
                                        </div>
                                    </div>
                                    {isSelected && (
                                        <Check className="w-5 h-5 text-white shrink-0" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Day Picker - Shows only when "limited" is selected */}
                {data.availability === 'limited' && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="block text-xs font-medium uppercase tracking-wider text-slate-500">
                            Which days work for you? <span className="font-normal text-slate-400">(Select all that apply)</span>
                        </label>
                        <div className="flex gap-2 flex-wrap" role="group" aria-label="Available days">
                            {DAYS_OF_WEEK.map((day) => {
                                const isSelected = selectedDays.includes(day.value);
                                return (
                                    <button
                                        key={day.value}
                                        type="button"
                                        onClick={() => handleDayToggle(day.value)}
                                        aria-pressed={isSelected}
                                        className={`px-4 py-3 min-h-[44px] min-w-[52px] rounded-xl border-2 font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-white ${isSelected
                                            ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/25'
                                            : 'bg-white border-slate-200 text-slate-600 hover:border-amber-300 hover:bg-amber-50'
                                        }`}
                                    >
                                        {day.label}
                                    </button>
                                );
                            })}
                        </div>
                        {selectedDays.length > 0 && (
                            <p className="text-xs text-amber-600 font-medium">
                                {selectedDays.length} day{selectedDays.length !== 1 ? 's' : ''} selected
                            </p>
                        )}
                    </div>
                )}

                {/* Shift Preference - Optional Multi-select */}
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500/20 rounded-lg">
                            <Clock className="w-4 h-4 text-amber-600" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-900">
                                Preferred shift times
                            </label>
                            <p className="text-xs text-slate-500">Optional - helps us prioritize the best matches</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2" role="group" aria-label="Shift time preferences">
                        {SHIFT_PREFERENCES.map((shift) => {
                            const isSelected = shiftArray.includes(shift.value);
                            return (
                                <button
                                    key={shift.value}
                                    type="button"
                                    onClick={() => handleShiftToggle(shift.value)}
                                    aria-pressed={isSelected}
                                    className={`p-3 min-h-[44px] rounded-xl border-2 transition-all flex flex-col items-center gap-1 relative focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-white ${isSelected
                                        ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/25'
                                        : 'bg-white border-slate-200 text-slate-600 hover:border-amber-300 hover:bg-amber-50'
                                    }`}
                                >
                                    {isSelected && (
                                        <div className="absolute top-1.5 right-1.5">
                                            <Check className="w-3.5 h-3.5 text-white" />
                                        </div>
                                    )}
                                    <div className={isSelected ? 'text-white' : 'text-slate-400'}>
                                        {shift.icon}
                                    </div>
                                    <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                                        {shift.label}
                                    </span>
                                    <span className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                                        {shift.time}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Positive Feedback based on selection */}
                {data.availability && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl animate-in fade-in duration-300">
                        <div className="flex items-start gap-3 text-amber-700">
                            <Check className="w-5 h-5 shrink-0 mt-0.5" />
                            <div>
                                <div className="font-bold">
                                    {data.availability === 'open' && "Maximum Opportunity Mode"}
                                    {data.availability === 'weekdays' && "Weekday Focus"}
                                    {data.availability === 'weekends' && "Weekend Warrior"}
                                    {data.availability === 'flexible' && "Flex Schedule"}
                                    {data.availability === 'limited' && "Custom Schedule"}
                                </div>
                                <div className="text-sm text-amber-600">
                                    {data.availability === 'open' && "We'll show you all available opportunities - full range of shifts and schedules."}
                                    {data.availability === 'weekdays' && "Prioritizing traditional business hours and Monday-Friday positions."}
                                    {data.availability === 'weekends' && "Perfect for students or those with weekday commitments. Weekend shifts often pay more!"}
                                    {data.availability === 'flexible' && "Gig economy, freelance, and self-scheduled opportunities coming your way."}
                                    {data.availability === 'limited' && selectedDays.length > 0
                                        ? `We'll find opportunities that match your ${selectedDays.length}-day schedule.`
                                        : "Select your available days above to see matching opportunities."}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
