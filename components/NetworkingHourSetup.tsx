import React, { useState } from 'react';
import { X, Users, Clock, Calendar, Check, ChevronRight, Linkedin, Target } from 'lucide-react';
import { Button } from './Button';

// ============================================
// TYPES
// ============================================

export interface NetworkingHourSettings {
    scheduledDay: string; // "wednesday"
    scheduledTime: string; // "12:00"
    weeklyGoal: number; // 5
    currentWeekConnections: number;
    totalConnections: number;
    lastNetworkingDate: string | null;
}

interface NetworkingHourSetupProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (settings: NetworkingHourSettings) => void;
    existingSettings?: NetworkingHourSettings | null;
}

// ============================================
// CONSTANTS
// ============================================

const DAYS = [
    { id: 'monday', label: 'Monday', short: 'Mon' },
    { id: 'tuesday', label: 'Tuesday', short: 'Tue' },
    { id: 'wednesday', label: 'Wednesday', short: 'Wed' },
    { id: 'thursday', label: 'Thursday', short: 'Thu' },
    { id: 'friday', label: 'Friday', short: 'Fri' },
    { id: 'saturday', label: 'Saturday', short: 'Sat' },
    { id: 'sunday', label: 'Sunday', short: 'Sun' },
];

const SUGGESTED_TIMES = [
    { time: '12:00', label: 'Lunch Break', reason: 'Professionals often check LinkedIn during lunch' },
    { time: '17:00', label: 'After Work', reason: 'End your day building connections' },
    { time: '08:00', label: 'Morning', reason: 'Start the week with networking energy' },
];

// ============================================
// HELPERS
// ============================================

const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

const capitalizeFirst = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

// ============================================
// MAIN COMPONENT
// ============================================

export const NetworkingHourSetup: React.FC<NetworkingHourSetupProps> = ({
    isOpen,
    onClose,
    onSave,
    existingSettings
}) => {
    const [selectedDay, setSelectedDay] = useState(existingSettings?.scheduledDay || 'wednesday');
    const [selectedTime, setSelectedTime] = useState(existingSettings?.scheduledTime || '12:00');
    const [weeklyGoal, setWeeklyGoal] = useState(existingSettings?.weeklyGoal || 5);
    const [step, setStep] = useState(1);

    const handleSave = () => {
        const settings: NetworkingHourSettings = {
            scheduledDay: selectedDay,
            scheduledTime: selectedTime,
            weeklyGoal,
            currentWeekConnections: existingSettings?.currentWeekConnections || 0,
            totalConnections: existingSettings?.totalConnections || 0,
            lastNetworkingDate: existingSettings?.lastNetworkingDate || null
        };
        onSave(settings);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Users size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Set Up Networking Hour</h2>
                                <p className="text-sm text-white/80">Block 1 hour weekly for building connections</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center gap-2 mt-4">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                                    s <= step ? 'bg-white text-blue-600' : 'bg-white/20 text-white/60'
                                }`}>
                                    {s < step ? <Check size={16} /> : s}
                                </div>
                                {s < 3 && (
                                    <div className={`w-8 h-0.5 ${s < step ? 'bg-white' : 'bg-white/20'}`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Step 1: Choose Day */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Which day for networking?</h3>
                                <p className="text-sm text-gray-500">Pick a day when you can focus on building connections</p>
                            </div>

                            {/* Day Selector */}
                            <div className="grid grid-cols-7 gap-1">
                                {DAYS.map((day) => (
                                    <button
                                        key={day.id}
                                        onClick={() => setSelectedDay(day.id)}
                                        className={`py-3 rounded-lg text-sm font-bold transition-all ${
                                            selectedDay === day.id
                                                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        {day.short}
                                    </button>
                                ))}
                            </div>

                            <div className="bg-blue-50 rounded-xl p-4 flex items-center gap-3">
                                <Linkedin size={20} className="text-blue-600" />
                                <p className="text-sm text-blue-800">
                                    <span className="font-bold">Pro tip:</span> Mid-week (Tue-Thu) often has the best LinkedIn engagement
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Choose Time */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">What time works best?</h3>
                                <p className="text-sm text-gray-500">Choose your optimal networking window</p>
                            </div>

                            {/* Suggested Times */}
                            <div className="space-y-2">
                                {SUGGESTED_TIMES.map((slot) => (
                                    <button
                                        key={slot.time}
                                        onClick={() => setSelectedTime(slot.time)}
                                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                                            selectedTime === slot.time
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="font-bold text-gray-900">{formatTime(slot.time)}</span>
                                                <span className="ml-2 text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                                                    {slot.label}
                                                </span>
                                            </div>
                                            {selectedTime === slot.time && (
                                                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                                    <Check size={14} className="text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">{slot.reason}</p>
                                    </button>
                                ))}
                            </div>

                            {/* Custom Time */}
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Or choose custom time</p>
                                <div className="flex items-center gap-3">
                                    <Clock size={20} className="text-gray-400" />
                                    <input
                                        type="time"
                                        value={selectedTime}
                                        onChange={(e) => setSelectedTime(e.target.value)}
                                        className="flex-1 p-3 border border-gray-200 rounded-xl text-lg font-bold focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Set Goal */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Weekly Connection Goal</h3>
                                <p className="text-sm text-gray-500">How many new connections will you make each week?</p>
                            </div>

                            {/* Goal Selector */}
                            <div className="flex justify-center gap-4">
                                {[3, 5, 10].map((goal) => (
                                    <button
                                        key={goal}
                                        onClick={() => setWeeklyGoal(goal)}
                                        className={`w-24 h-24 rounded-2xl flex flex-col items-center justify-center transition-all ${
                                            weeklyGoal === goal
                                                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        <span className="text-2xl font-bold">{goal}</span>
                                        <span className="text-xs">people</span>
                                    </button>
                                ))}
                            </div>

                            {/* Summary */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                                <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                                    <Users size={16} />
                                    Your Networking Plan
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Day:</span>
                                        <span className="font-bold text-gray-900">{capitalizeFirst(selectedDay)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Time:</span>
                                        <span className="font-bold text-gray-900">{formatTime(selectedTime)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Weekly Goal:</span>
                                        <span className="font-bold text-gray-900">{weeklyGoal} connections</span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t border-blue-200">
                                        <span className="text-gray-600">Monthly Target:</span>
                                        <span className="font-bold text-blue-600">{weeklyGoal * 4} connections</span>
                                    </div>
                                </div>
                            </div>

                            {/* Motivation */}
                            <div className="text-center text-sm text-gray-500">
                                <Target size={16} className="inline mr-1" />
                                {weeklyGoal * 4} new connections/month can transform your career!
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-between items-center">
                    {step > 1 ? (
                        <Button variant="outline" onClick={() => setStep(step - 1)}>
                            Back
                        </Button>
                    ) : (
                        <div />
                    )}

                    {step < 3 ? (
                        <Button
                            variant="primary"
                            onClick={() => setStep(step + 1)}
                            icon={<ChevronRight size={16} />}
                            className="bg-blue-500 hover:bg-blue-600"
                        >
                            Continue
                        </Button>
                    ) : (
                        <Button
                            variant="primary"
                            onClick={handleSave}
                            icon={<Users size={16} />}
                            className="bg-blue-500 hover:bg-blue-600"
                        >
                            Schedule Networking Hour
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NetworkingHourSetup;
