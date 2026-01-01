import React, { useState, useMemo } from 'react';
import { X, Zap, Clock, Calendar, Sparkles, Check, ChevronRight } from 'lucide-react';
import { Button } from './Button';

// ============================================
// TYPES
// ============================================

export interface PowerHourSettings {
    scheduledTime: string; // "18:00"
    scheduledDays: string[]; // ["mon", "tue", "wed", "thu", "fri"]
    currentStreak: number;
    longestStreak: number;
    lastCompletedDate: string | null;
    totalPowerHours: number;
    dailyGoal: number; // Number of applications to complete
}

interface PowerHourSetupProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (settings: PowerHourSettings) => void;
    existingSchedule?: { startTime: string; endTime: string }[];
    existingSettings?: PowerHourSettings | null;
}

interface TimeSlot {
    time: string;
    label: string;
    reason: string;
    priority: number;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

const DAYS = [
    { id: 'mon', label: 'Mon', full: 'Monday' },
    { id: 'tue', label: 'Tue', full: 'Tuesday' },
    { id: 'wed', label: 'Wed', full: 'Wednesday' },
    { id: 'thu', label: 'Thu', full: 'Thursday' },
    { id: 'fri', label: 'Fri', full: 'Friday' },
    { id: 'sat', label: 'Sat', full: 'Saturday' },
    { id: 'sun', label: 'Sun', full: 'Sunday' },
];

const DAY_PRESETS = [
    { id: 'weekdays', label: 'Weekdays', days: ['mon', 'tue', 'wed', 'thu', 'fri'] },
    { id: 'everyday', label: 'Every Day', days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] },
    { id: 'custom', label: 'Custom', days: [] },
];

const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

const findAvailableSlots = (schedule: { startTime: string; endTime: string }[]): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const occupiedTimes = new Set<number>();

    // Mark occupied hours
    schedule.forEach(block => {
        const startHour = parseInt(block.startTime.split(':')[0]);
        const endHour = parseInt(block.endTime.split(':')[0]);
        for (let h = startHour; h < endHour; h++) {
            occupiedTimes.add(h);
        }
    });

    // Check morning slots (6-9 AM)
    for (let h = 6; h <= 8; h++) {
        if (!occupiedTimes.has(h) && !occupiedTimes.has(h + 1)) {
            slots.push({
                time: `${h.toString().padStart(2, '0')}:00`,
                label: 'Early Morning',
                reason: 'Start your day with momentum',
                priority: h === 7 ? 3 : 2
            });
            break;
        }
    }

    // Check lunch slots (11 AM - 1 PM)
    for (let h = 11; h <= 12; h++) {
        if (!occupiedTimes.has(h) && !occupiedTimes.has(h + 1)) {
            slots.push({
                time: `${h.toString().padStart(2, '0')}:00`,
                label: 'Lunch Break',
                reason: 'Productive midday energy',
                priority: 2
            });
            break;
        }
    }

    // Check evening slots (5-8 PM)
    for (let h = 17; h <= 19; h++) {
        if (!occupiedTimes.has(h) && !occupiedTimes.has(h + 1)) {
            slots.push({
                time: `${h.toString().padStart(2, '0')}:00`,
                label: 'After Work',
                reason: 'Wind down with job search',
                priority: h === 18 ? 3 : 2
            });
            break;
        }
    }

    // Sort by priority
    return slots.sort((a, b) => b.priority - a.priority).slice(0, 3);
};

// ============================================
// MAIN COMPONENT
// ============================================

export const PowerHourSetup: React.FC<PowerHourSetupProps> = ({
    isOpen,
    onClose,
    onSave,
    existingSchedule = [],
    existingSettings
}) => {
    const [selectedTime, setSelectedTime] = useState(existingSettings?.scheduledTime || '18:00');
    const [selectedDays, setSelectedDays] = useState<string[]>(
        existingSettings?.scheduledDays || ['mon', 'tue', 'wed', 'thu', 'fri']
    );
    const [selectedPreset, setSelectedPreset] = useState<string>(
        existingSettings?.scheduledDays?.length === 5 ? 'weekdays' :
        existingSettings?.scheduledDays?.length === 7 ? 'everyday' : 'custom'
    );
    const [dailyGoal, setDailyGoal] = useState(existingSettings?.dailyGoal || 3);
    const [step, setStep] = useState(1);

    // Auto-suggest available time slots
    const suggestedSlots = useMemo(() => findAvailableSlots(existingSchedule), [existingSchedule]);

    const toggleDay = (dayId: string) => {
        setSelectedPreset('custom');
        setSelectedDays(prev =>
            prev.includes(dayId)
                ? prev.filter(d => d !== dayId)
                : [...prev, dayId]
        );
    };

    const selectPreset = (presetId: string) => {
        setSelectedPreset(presetId);
        const preset = DAY_PRESETS.find(p => p.id === presetId);
        if (preset && preset.id !== 'custom') {
            setSelectedDays(preset.days);
        }
    };

    const handleSave = () => {
        const settings: PowerHourSettings = {
            scheduledTime: selectedTime,
            scheduledDays: selectedDays,
            currentStreak: existingSettings?.currentStreak || 0,
            longestStreak: existingSettings?.longestStreak || 0,
            lastCompletedDate: existingSettings?.lastCompletedDate || null,
            totalPowerHours: existingSettings?.totalPowerHours || 0,
            dailyGoal
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
                <div className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white p-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Zap size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Set Up Your Power Hour</h2>
                                <p className="text-sm text-white/80">Block 1 hour daily for job applications</p>
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
                                    s <= step ? 'bg-white text-yellow-600' : 'bg-white/20 text-white/60'
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
                    {/* Step 1: Choose Time */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">When's your Power Hour?</h3>
                                <p className="text-sm text-gray-500">Choose when you're most focused for job searching</p>
                            </div>

                            {/* Suggested Slots */}
                            {suggestedSlots.length > 0 && (
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-1">
                                        <Sparkles size={12} />
                                        Suggested Times (Based on your schedule)
                                    </p>
                                    <div className="space-y-2">
                                        {suggestedSlots.map((slot) => (
                                            <button
                                                key={slot.time}
                                                onClick={() => setSelectedTime(slot.time)}
                                                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                                                    selectedTime === slot.time
                                                        ? 'border-yellow-500 bg-yellow-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <span className="font-bold text-gray-900">{formatTime(slot.time)}</span>
                                                        <span className="ml-2 text-xs font-medium text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full">
                                                            {slot.label}
                                                        </span>
                                                    </div>
                                                    {selectedTime === slot.time && (
                                                        <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                                                            <Check size={14} className="text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">{slot.reason}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Custom Time */}
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Or choose custom time</p>
                                <div className="flex items-center gap-3">
                                    <Clock size={20} className="text-gray-400" />
                                    <input
                                        type="time"
                                        value={selectedTime}
                                        onChange={(e) => setSelectedTime(e.target.value)}
                                        className="flex-1 p-3 border border-gray-200 rounded-xl text-lg font-bold focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Choose Days */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Which days?</h3>
                                <p className="text-sm text-gray-500">Select the days for your Power Hour routine</p>
                            </div>

                            {/* Presets */}
                            <div className="flex gap-2">
                                {DAY_PRESETS.map((preset) => (
                                    <button
                                        key={preset.id}
                                        onClick={() => selectPreset(preset.id)}
                                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-all ${
                                            selectedPreset === preset.id
                                                ? 'bg-yellow-500 text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                            </div>

                            {/* Day Selector */}
                            <div className="flex justify-between gap-2">
                                {DAYS.map((day) => (
                                    <button
                                        key={day.id}
                                        onClick={() => toggleDay(day.id)}
                                        className={`w-10 h-10 rounded-full text-sm font-bold transition-all ${
                                            selectedDays.includes(day.id)
                                                ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/30'
                                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                        }`}
                                    >
                                        {day.label[0]}
                                    </button>
                                ))}
                            </div>

                            <div className="bg-yellow-50 rounded-xl p-4 flex items-center gap-3">
                                <Calendar size={20} className="text-yellow-600" />
                                <p className="text-sm text-yellow-800">
                                    <span className="font-bold">{selectedDays.length} days</span> per week = {selectedDays.length * 4} Power Hours per month
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Set Goal */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Daily Application Goal</h3>
                                <p className="text-sm text-gray-500">How many jobs will you apply to each Power Hour?</p>
                            </div>

                            {/* Goal Selector */}
                            <div className="flex justify-center gap-4">
                                {[2, 3, 5].map((goal) => (
                                    <button
                                        key={goal}
                                        onClick={() => setDailyGoal(goal)}
                                        className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center transition-all ${
                                            dailyGoal === goal
                                                ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/30'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        <span className="text-2xl font-bold">{goal}</span>
                                        <span className="text-xs">apps</span>
                                    </button>
                                ))}
                            </div>

                            {/* Summary */}
                            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-4 border border-yellow-200">
                                <h4 className="font-bold text-yellow-800 mb-3 flex items-center gap-2">
                                    <Zap size={16} />
                                    Your Power Hour Plan
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Time:</span>
                                        <span className="font-bold text-gray-900">{formatTime(selectedTime)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Days:</span>
                                        <span className="font-bold text-gray-900">
                                            {selectedDays.map(d => d.charAt(0).toUpperCase() + d.slice(1, 3)).join(', ')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Daily Goal:</span>
                                        <span className="font-bold text-gray-900">{dailyGoal} applications</span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t border-yellow-200">
                                        <span className="text-gray-600">Monthly Target:</span>
                                        <span className="font-bold text-yellow-600">{selectedDays.length * 4 * dailyGoal} applications</span>
                                    </div>
                                </div>
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
                            disabled={step === 2 && selectedDays.length === 0}
                            icon={<ChevronRight size={16} />}
                            className="bg-yellow-500 hover:bg-yellow-600"
                        >
                            Continue
                        </Button>
                    ) : (
                        <Button
                            variant="primary"
                            onClick={handleSave}
                            icon={<Zap size={16} />}
                            className="bg-yellow-500 hover:bg-yellow-600"
                        >
                            Schedule My Power Hour
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PowerHourSetup;
