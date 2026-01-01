import React, { useMemo } from 'react';
import { Target, Clock, Zap, ChevronRight, Star, Sparkles } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import {
    FreeWindow,
    getWindowsByDay,
    getBestPowerHourSlot,
    formatDuration,
    getTotalFreeTime,
    countPowerHourSlots
} from '../services/scheduleAnalysisService';

// ============================================
// TYPES
// ============================================

interface FreeWindowsCardProps {
    windows: FreeWindow[];
    onSetPowerHour?: (window: FreeWindow) => void;
    onOptimize?: () => void;
    compact?: boolean;
}

// ============================================
// CONSTANTS
// ============================================

const DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

// ============================================
// HELPER FUNCTIONS
// ============================================

const formatTime12 = (time24: string): string => {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
};

// ============================================
// MAIN COMPONENT
// ============================================

export const FreeWindowsCard: React.FC<FreeWindowsCardProps> = ({
    windows,
    onSetPowerHour,
    onOptimize,
    compact = false
}) => {
    const windowsByDay = useMemo(() => getWindowsByDay(windows), [windows]);
    const bestWindow = useMemo(() => getBestPowerHourSlot(windows), [windows]);
    const totalFreeMinutes = useMemo(() => getTotalFreeTime(windows), [windows]);
    const powerHourSlots = useMemo(() => countPowerHourSlots(windows), [windows]);

    // Sort days to show in order
    const sortedDays = Object.keys(windowsByDay).sort(
        (a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b)
    );

    if (windows.length === 0) {
        return (
            <Card variant="solid-white" className="p-6">
                <div className="text-center py-4">
                    <Clock size={32} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-gray-500 text-sm">Import your schedule to find free windows</p>
                </div>
            </Card>
        );
    }

    if (compact) {
        // Compact version for sidebar or small spaces
        return (
            <Card variant="solid-white" className="p-4">
                <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-gold/10 rounded-lg">
                        <Target size={16} className="text-gold" />
                    </div>
                    <h3 className="font-bold text-jalanea-900 text-sm">Free Windows</h3>
                </div>

                <div className="space-y-2 mb-3">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Total free time</span>
                        <span className="font-medium text-jalanea-700">{formatDuration(totalFreeMinutes)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Power Hour slots</span>
                        <span className="font-medium text-jalanea-700">{powerHourSlots}</span>
                    </div>
                </div>

                {bestWindow && (
                    <div className="bg-gold/5 border border-gold/20 rounded-lg p-2 mb-3">
                        <div className="flex items-center gap-1 text-xs text-gold font-medium mb-1">
                            <Star size={12} fill="currentColor" />
                            Best slot
                        </div>
                        <p className="text-xs text-jalanea-700">
                            {bestWindow.dayLabel} at {formatTime12(bestWindow.startTime)}
                        </p>
                    </div>
                )}

                {onOptimize && (
                    <Button
                        variant="outline"
                        size="sm"
                        fullWidth
                        onClick={onOptimize}
                        icon={<Sparkles size={14} />}
                    >
                        Optimize Power Hour
                    </Button>
                )}
            </Card>
        );
    }

    // Full version
    return (
        <Card variant="solid-white" className="overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-gold/10 to-amber-50 p-4 border-b border-gold/20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gold/20 rounded-xl">
                            <Target size={20} className="text-gold" />
                        </div>
                        <div>
                            <h3 className="font-bold text-jalanea-900">Your Free Windows This Week</h3>
                            <p className="text-xs text-jalanea-500">
                                {formatDuration(totalFreeMinutes)} total free time across {windows.length} windows
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-gold">{powerHourSlots}</div>
                        <div className="text-xs text-jalanea-500">Power Hour slots</div>
                    </div>
                </div>
            </div>

            {/* Best Window Highlight */}
            {bestWindow && (
                <div className="bg-gold/5 border-b border-gold/10 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gold rounded-lg text-white">
                                <Star size={16} fill="currentColor" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-jalanea-900">Best Window for Power Hour</span>
                                    <span className="px-2 py-0.5 bg-gold/20 text-gold text-xs font-medium rounded-full">
                                        Recommended
                                    </span>
                                </div>
                                <p className="text-sm text-jalanea-600">
                                    {bestWindow.dayLabel} at {formatTime12(bestWindow.startTime)} - {formatDuration(bestWindow.durationMinutes)} free
                                </p>
                            </div>
                        </div>
                        {onSetPowerHour && (
                            <Button
                                size="sm"
                                onClick={() => onSetPowerHour(bestWindow)}
                                icon={<Zap size={14} />}
                            >
                                Set as Power Hour
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {/* Windows by Day */}
            <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
                {sortedDays.map(day => {
                    const dayWindows = windowsByDay[day];
                    if (!dayWindows?.length) return null;

                    return (
                        <div key={day}>
                            <h4 className="font-bold text-jalanea-700 text-sm mb-2 uppercase tracking-wide">
                                {dayWindows[0].dayLabel}
                            </h4>
                            <div className="space-y-2">
                                {dayWindows.map(window => (
                                    <div
                                        key={window.id}
                                        className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                                            window.isBestWindow
                                                ? 'bg-gold/10 border border-gold/30'
                                                : 'bg-gray-50 hover:bg-gray-100'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">{window.icon}</span>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-jalanea-800 text-sm">
                                                        {formatDuration(window.durationMinutes)}
                                                    </span>
                                                    <span className="text-gray-400">-</span>
                                                    <span className="text-gray-500 text-sm">{window.label}</span>
                                                </div>
                                                <p className="text-xs text-gray-400">
                                                    {formatTime12(window.startTime)} - {formatTime12(window.endTime)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-400 hidden sm:block">
                                                {window.description}
                                            </span>
                                            {window.durationMinutes >= 60 && onSetPowerHour && !window.isBestWindow && (
                                                <button
                                                    onClick={() => onSetPowerHour(window)}
                                                    className="p-1.5 text-gray-400 hover:text-gold hover:bg-gold/10 rounded-lg transition-colors"
                                                    title="Set as Power Hour"
                                                >
                                                    <Zap size={14} />
                                                </button>
                                            )}
                                            {window.isBestWindow && (
                                                <Star size={14} className="text-gold" fill="currentColor" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer CTA */}
            {onOptimize && (
                <div className="border-t border-gray-100 p-4 bg-gray-50">
                    <button
                        onClick={onOptimize}
                        className="w-full flex items-center justify-center gap-2 py-2.5 text-jalanea-600 hover:text-jalanea-800 font-medium transition-colors"
                    >
                        <Sparkles size={16} />
                        Optimize My Power Hour
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}
        </Card>
    );
};

// ============================================
// SUMMARY MODAL COMPONENT
// ============================================

interface FreeWindowsSummaryProps {
    isOpen: boolean;
    onClose: () => void;
    windows: FreeWindow[];
    onSetPowerHour?: (window: FreeWindow) => void;
}

export const FreeWindowsSummary: React.FC<FreeWindowsSummaryProps> = ({
    isOpen,
    onClose,
    windows,
    onSetPowerHour
}) => {
    const bestWindow = useMemo(() => getBestPowerHourSlot(windows), [windows]);
    const powerHourSlots = useMemo(() => countPowerHourSlots(windows), [windows]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-gold to-amber-500 text-white p-6 text-center">
                    <div className="inline-flex p-3 bg-white/20 rounded-full mb-3">
                        <Target size={32} />
                    </div>
                    <h2 className="text-xl font-bold mb-1">Schedule Analyzed!</h2>
                    <p className="text-white/80 text-sm">
                        We found {windows.length} free windows across your week
                    </p>
                </div>

                {/* Stats */}
                <div className="p-6">
                    <div className="flex justify-around mb-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-jalanea-900">{windows.length}</div>
                            <div className="text-xs text-gray-500">Free Windows</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-gold">{powerHourSlots}</div>
                            <div className="text-xs text-gray-500">Power Hour Slots</div>
                        </div>
                    </div>

                    {/* Best Window */}
                    {bestWindow && (
                        <div className="bg-gold/5 border border-gold/20 rounded-xl p-4 mb-4">
                            <div className="flex items-center gap-2 text-gold font-medium text-sm mb-2">
                                <Star size={14} fill="currentColor" />
                                Best Time for Job Applications
                            </div>
                            <p className="text-jalanea-800 font-bold">
                                {bestWindow.dayLabel} at {formatTime12(bestWindow.startTime)}
                            </p>
                            <p className="text-sm text-gray-500">
                                {formatDuration(bestWindow.durationMinutes)} of uninterrupted time
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="space-y-2">
                        {bestWindow && onSetPowerHour && (
                            <Button
                                fullWidth
                                onClick={() => {
                                    onSetPowerHour(bestWindow);
                                    onClose();
                                }}
                                icon={<Zap size={16} />}
                            >
                                Set as My Power Hour
                            </Button>
                        )}
                        <Button variant="outline" fullWidth onClick={onClose}>
                            View All Windows
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FreeWindowsCard;
