import React, { useState, useEffect, useMemo } from 'react';
import { Zap, Flame, Clock, Target, ChevronRight, Play, Trophy, Sparkles } from 'lucide-react';
import { Button } from './Button';
import { PowerHourSettings, PowerHourSetup } from './PowerHourSetup';
import { useNavigate } from 'react-router-dom';

// ============================================
// TYPES
// ============================================

interface PowerHourWidgetProps {
    settings: PowerHourSettings | null;
    onSettingsChange: (settings: PowerHourSettings) => void;
    applicationsToday: number;
    existingSchedule?: { startTime: string; endTime: string }[];
}

// ============================================
// HELPER FUNCTIONS
// ============================================

const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

const getDayId = (): string => {
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    return days[new Date().getDay()];
};

const isWithinTimeWindow = (scheduledTime: string, windowMinutes: number = 15): boolean => {
    const now = new Date();
    const [hours, minutes] = scheduledTime.split(':').map(Number);
    const scheduled = new Date();
    scheduled.setHours(hours, minutes, 0, 0);

    const diffMs = scheduled.getTime() - now.getTime();
    const diffMinutes = diffMs / (1000 * 60);

    // Within window before or during the hour
    return diffMinutes <= windowMinutes && diffMinutes > -60;
};

const isPowerHourActive = (scheduledTime: string): boolean => {
    const now = new Date();
    const [hours, minutes] = scheduledTime.split(':').map(Number);
    const start = new Date();
    start.setHours(hours, minutes, 0, 0);
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    return now >= start && now < end;
};

const getTimeUntilPowerHour = (scheduledTime: string): string => {
    const now = new Date();
    const [hours, minutes] = scheduledTime.split(':').map(Number);
    const scheduled = new Date();
    scheduled.setHours(hours, minutes, 0, 0);

    // If already passed today, show for tomorrow
    if (scheduled < now) {
        scheduled.setDate(scheduled.getDate() + 1);
    }

    const diffMs = scheduled.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) {
        return `${diffHours}h ${diffMinutes}m`;
    }
    return `${diffMinutes}m`;
};

const getMotivationalMessage = (streak: number): string => {
    if (streak === 0) return "Start your streak today!";
    if (streak === 1) return "Great start! Keep it going!";
    if (streak < 5) return "Building momentum!";
    if (streak < 10) return "You're on fire!";
    if (streak < 20) return "Unstoppable!";
    return "Legendary consistency!";
};

// ============================================
// MAIN COMPONENT
// ============================================

export const PowerHourWidget: React.FC<PowerHourWidgetProps> = ({
    settings,
    onSettingsChange,
    applicationsToday,
    existingSchedule = []
}) => {
    const navigate = useNavigate();
    const [showSetup, setShowSetup] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [showReminder, setShowReminder] = useState(false);

    const todayId = getDayId();
    const isScheduledToday = settings?.scheduledDays.includes(todayId);
    const progress = settings ? Math.min(applicationsToday / settings.dailyGoal, 1) : 0;
    const progressPercent = Math.round(progress * 100);

    // Check if power hour is active or within reminder window
    useEffect(() => {
        if (!settings || !isScheduledToday) return;

        const checkTime = () => {
            setIsActive(isPowerHourActive(settings.scheduledTime));
            setShowReminder(isWithinTimeWindow(settings.scheduledTime, 15) && !isPowerHourActive(settings.scheduledTime));
        };

        checkTime();
        const interval = setInterval(checkTime, 60000); // Check every minute

        return () => clearInterval(interval);
    }, [settings, isScheduledToday]);

    const handleStartPowerHour = () => {
        navigate('/jobs');
    };

    // No settings - show setup prompt
    if (!settings) {
        return (
            <>
                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl border-2 border-dashed border-yellow-300 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-yellow-500 rounded-xl text-white">
                            <Zap size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Power Hour</h3>
                            <p className="text-sm text-gray-500">Not set up yet</p>
                        </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">
                        Block 1 hour daily for focused job applications. Build a streak and land your dream job faster!
                    </p>

                    <Button
                        fullWidth
                        onClick={() => setShowSetup(true)}
                        icon={<Zap size={16} />}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white"
                    >
                        Set Up Power Hour
                    </Button>
                </div>

                <PowerHourSetup
                    isOpen={showSetup}
                    onClose={() => setShowSetup(false)}
                    onSave={onSettingsChange}
                    existingSchedule={existingSchedule}
                />
            </>
        );
    }

    return (
        <>
            <div className={`rounded-2xl overflow-hidden transition-all ${
                isActive
                    ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-lg shadow-yellow-500/30'
                    : 'bg-white border border-gray-200'
            }`}>
                {/* Header */}
                <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Zap size={20} className={isActive ? 'text-white' : 'text-yellow-500'} />
                            <span className={`font-bold ${isActive ? 'text-white' : 'text-gray-900'}`}>
                                Power Hour
                            </span>
                        </div>

                        {/* Streak */}
                        {settings.currentStreak > 0 && (
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-bold ${
                                isActive ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-600'
                            }`}>
                                <Flame size={14} />
                                {settings.currentStreak}
                            </div>
                        )}
                    </div>

                    {/* Progress Ring */}
                    <div className="flex items-center gap-4 mb-4">
                        <div className="relative w-16 h-16">
                            <svg className="w-16 h-16 transform -rotate-90">
                                <circle
                                    cx="32"
                                    cy="32"
                                    r="28"
                                    stroke={isActive ? 'rgba(255,255,255,0.2)' : '#e5e7eb'}
                                    strokeWidth="6"
                                    fill="none"
                                />
                                <circle
                                    cx="32"
                                    cy="32"
                                    r="28"
                                    stroke={isActive ? 'white' : '#eab308'}
                                    strokeWidth="6"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeDasharray={`${2 * Math.PI * 28}`}
                                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress)}`}
                                    className="transition-all duration-500"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className={`text-sm font-bold ${isActive ? 'text-white' : 'text-gray-900'}`}>
                                    {applicationsToday}/{settings.dailyGoal}
                                </span>
                            </div>
                        </div>

                        <div className="flex-1">
                            <p className={`text-sm ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                                {isScheduledToday ? 'Today' : 'Next'}
                            </p>
                            <p className={`font-bold ${isActive ? 'text-white' : 'text-gray-900'}`}>
                                {formatTime(settings.scheduledTime)}
                            </p>
                            <p className={`text-xs ${isActive ? 'text-white/70' : 'text-gray-400'}`}>
                                {isActive ? 'In progress' : isScheduledToday ? `In ${getTimeUntilPowerHour(settings.scheduledTime)}` : 'Not scheduled today'}
                            </p>
                        </div>
                    </div>

                    {/* Motivational Message */}
                    <p className={`text-xs font-medium mb-3 ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                        {isActive && applicationsToday >= settings.dailyGoal
                            ? "Goal reached! Keep crushing it!"
                            : getMotivationalMessage(settings.currentStreak)
                        }
                    </p>

                    {/* Action Button */}
                    {(isActive || showReminder) && (
                        <Button
                            fullWidth
                            onClick={handleStartPowerHour}
                            icon={<Play size={16} />}
                            className={isActive
                                ? 'bg-white text-yellow-600 hover:bg-yellow-50'
                                : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                            }
                        >
                            {isActive ? 'Continue Applying' : 'Start Power Hour'}
                        </Button>
                    )}

                    {!isActive && !showReminder && (
                        <button
                            onClick={() => setShowSetup(true)}
                            className={`w-full text-center text-xs font-medium py-2 transition-colors ${
                                isActive ? 'text-white/70 hover:text-white' : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            Reschedule
                        </button>
                    )}
                </div>

                {/* Streak Stats (collapsed) */}
                {settings.currentStreak >= 3 && (
                    <div className={`px-4 py-3 border-t ${
                        isActive ? 'border-white/10 bg-white/10' : 'border-gray-100 bg-gray-50'
                    }`}>
                        <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1">
                                <Trophy size={12} className={isActive ? 'text-white/70' : 'text-yellow-500'} />
                                <span className={isActive ? 'text-white/70' : 'text-gray-500'}>
                                    Best: {settings.longestStreak} days
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Target size={12} className={isActive ? 'text-white/70' : 'text-gray-400'} />
                                <span className={isActive ? 'text-white/70' : 'text-gray-500'}>
                                    Total: {settings.totalPowerHours}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Celebration for goal completion */}
                {applicationsToday >= settings.dailyGoal && isActive && (
                    <div className="px-4 py-3 bg-white/20 flex items-center justify-center gap-2">
                        <Sparkles size={16} className="text-white animate-pulse" />
                        <span className="text-white font-bold text-sm">Daily Goal Complete!</span>
                        <Sparkles size={16} className="text-white animate-pulse" />
                    </div>
                )}
            </div>

            {/* Power Hour Reminder Toast */}
            {showReminder && !isActive && (
                <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-right duration-300">
                    <div className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-xl p-4 shadow-lg shadow-yellow-500/30 max-w-sm">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-white/20 rounded-lg shrink-0">
                                <Zap size={20} />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold">Power Hour in 15 minutes!</p>
                                <p className="text-sm text-white/80 mt-1">Ready to apply to some jobs?</p>
                                <button
                                    onClick={handleStartPowerHour}
                                    className="mt-2 flex items-center gap-1 text-sm font-bold hover:underline"
                                >
                                    Go to Jobs <ChevronRight size={14} />
                                </button>
                            </div>
                            <button
                                onClick={() => setShowReminder(false)}
                                className="text-white/70 hover:text-white"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <PowerHourSetup
                isOpen={showSetup}
                onClose={() => setShowSetup(false)}
                onSave={onSettingsChange}
                existingSchedule={existingSchedule}
                existingSettings={settings}
            />
        </>
    );
};

export default PowerHourWidget;
