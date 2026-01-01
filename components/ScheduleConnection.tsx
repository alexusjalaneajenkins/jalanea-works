import React, { useState, useMemo } from 'react';
import {
    X, Calendar, Clock, Briefcase, Send, Coffee,
    Users, FileText, Target, Sparkles, CheckCircle2,
    AlertCircle, ChevronRight, Sun, Moon, Sunrise
} from 'lucide-react';
import { Button } from './Button';

interface ScheduleConnectionProps {
    isOpen: boolean;
    onClose: () => void;
    workSchedule?: {
        shifts: Array<{
            day: string;
            startTime: string;
            endTime: string;
        }>;
    };
    classSchedule?: {
        classes: Array<{
            day: string;
            startTime: string;
            endTime: string;
            courseName: string;
        }>;
    };
    availability?: string;
}

interface TimeBlock {
    day: string;
    startTime: string;
    endTime: string;
    duration: number; // in minutes
    type: 'morning' | 'afternoon' | 'evening';
    activities: SuggestedActivity[];
}

interface SuggestedActivity {
    name: string;
    icon: React.FC<{ size?: number; className?: string }>;
    duration: string;
    priority: 'high' | 'medium' | 'low';
    description: string;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const CAREER_ACTIVITIES: SuggestedActivity[] = [
    { name: 'Job Applications', icon: Send, duration: '30-60 min', priority: 'high', description: 'Apply to 2-3 targeted positions' },
    { name: 'Resume Updates', icon: FileText, duration: '45-60 min', priority: 'medium', description: 'Tailor resume for specific roles' },
    { name: 'LinkedIn Networking', icon: Users, duration: '20-30 min', priority: 'high', description: 'Send connection requests & messages' },
    { name: 'Interview Prep', icon: Target, duration: '30-45 min', priority: 'medium', description: 'Practice common questions' },
    { name: 'Skill Building', icon: Sparkles, duration: '45-60 min', priority: 'medium', description: 'Online courses or tutorials' },
    { name: 'Company Research', icon: Briefcase, duration: '20-30 min', priority: 'low', description: 'Learn about target employers' },
];

const getTimeOfDay = (time: string): 'morning' | 'afternoon' | 'evening' => {
    const hour = parseInt(time.split(':')[0]);
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
};

const parseTime = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
};

const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

const getTimeIcon = (type: 'morning' | 'afternoon' | 'evening') => {
    switch (type) {
        case 'morning': return Sunrise;
        case 'afternoon': return Sun;
        case 'evening': return Moon;
    }
};

export const ScheduleConnection: React.FC<ScheduleConnectionProps> = ({
    isOpen,
    onClose,
    workSchedule,
    classSchedule,
    availability
}) => {
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const [selectedBlock, setSelectedBlock] = useState<TimeBlock | null>(null);

    // Calculate free time blocks based on schedules
    const freeTimeBlocks = useMemo(() => {
        const blocks: TimeBlock[] = [];

        // If we have actual schedule data
        if ((workSchedule?.shifts?.length || 0) > 0 || (classSchedule?.classes?.length || 0) > 0) {
            DAYS_OF_WEEK.forEach(day => {
                // Get busy times for this day
                const busyTimes: Array<{ start: number; end: number }> = [];

                workSchedule?.shifts
                    .filter(s => s.day.toLowerCase() === day.toLowerCase())
                    .forEach(s => {
                        busyTimes.push({
                            start: parseTime(s.startTime),
                            end: parseTime(s.endTime)
                        });
                    });

                classSchedule?.classes
                    .filter(c => c.day.toLowerCase() === day.toLowerCase())
                    .forEach(c => {
                        busyTimes.push({
                            start: parseTime(c.startTime),
                            end: parseTime(c.endTime)
                        });
                    });

                // Sort by start time
                busyTimes.sort((a, b) => a.start - b.start);

                // Find gaps (free time)
                const dayStart = parseTime('08:00'); // 8 AM
                const dayEnd = parseTime('21:00'); // 9 PM

                let currentTime = dayStart;
                busyTimes.forEach(busy => {
                    if (busy.start > currentTime && busy.start - currentTime >= 30) {
                        const startTime = `${Math.floor(currentTime / 60)}:${(currentTime % 60).toString().padStart(2, '0')}`;
                        const endTime = `${Math.floor(busy.start / 60)}:${(busy.start % 60).toString().padStart(2, '0')}`;
                        const duration = busy.start - currentTime;

                        blocks.push({
                            day,
                            startTime,
                            endTime,
                            duration,
                            type: getTimeOfDay(startTime),
                            activities: CAREER_ACTIVITIES.filter(a => {
                                const actDuration = parseInt(a.duration.split('-')[0]);
                                return actDuration <= duration;
                            }).slice(0, 4)
                        });
                    }
                    currentTime = Math.max(currentTime, busy.end);
                });

                // Add remaining time after last busy period
                if (currentTime < dayEnd && dayEnd - currentTime >= 30) {
                    const startTime = `${Math.floor(currentTime / 60)}:${(currentTime % 60).toString().padStart(2, '0')}`;
                    const endTime = `${Math.floor(dayEnd / 60)}:${(dayEnd % 60).toString().padStart(2, '0')}`;
                    const duration = dayEnd - currentTime;

                    blocks.push({
                        day,
                        startTime,
                        endTime,
                        duration,
                        type: getTimeOfDay(startTime),
                        activities: CAREER_ACTIVITIES.filter(a => {
                            const actDuration = parseInt(a.duration.split('-')[0]);
                            return actDuration <= duration;
                        }).slice(0, 4)
                    });
                }
            });
        } else {
            // Default suggestions based on general availability
            const defaultBlocks = [
                { day: 'Monday', startTime: '09:00', endTime: '11:00', type: 'morning' as const },
                { day: 'Tuesday', startTime: '14:00', endTime: '16:00', type: 'afternoon' as const },
                { day: 'Wednesday', startTime: '10:00', endTime: '12:00', type: 'morning' as const },
                { day: 'Thursday', startTime: '15:00', endTime: '17:00', type: 'afternoon' as const },
                { day: 'Friday', startTime: '09:00', endTime: '11:00', type: 'morning' as const },
                { day: 'Saturday', startTime: '10:00', endTime: '14:00', type: 'morning' as const },
            ];

            defaultBlocks.forEach(b => {
                const duration = parseTime(b.endTime) - parseTime(b.startTime);
                blocks.push({
                    ...b,
                    duration,
                    activities: CAREER_ACTIVITIES.slice(0, 4)
                });
            });
        }

        return blocks;
    }, [workSchedule, classSchedule]);

    // Group blocks by day
    const blocksByDay = useMemo(() => {
        const grouped: Record<string, TimeBlock[]> = {};
        freeTimeBlocks.forEach(block => {
            if (!grouped[block.day]) grouped[block.day] = [];
            grouped[block.day].push(block);
        });
        return grouped;
    }, [freeTimeBlocks]);

    // Get optimal times for high-priority activities
    const optimalTimes = useMemo(() => {
        // Morning blocks are best for focused work
        const morningBlocks = freeTimeBlocks.filter(b => b.type === 'morning' && b.duration >= 60);
        const afternoonBlocks = freeTimeBlocks.filter(b => b.type === 'afternoon' && b.duration >= 45);

        return {
            jobApplications: morningBlocks.slice(0, 2),
            networking: afternoonBlocks.slice(0, 2),
            skillBuilding: freeTimeBlocks.filter(b => b.duration >= 60).slice(0, 2)
        };
    }, [freeTimeBlocks]);

    const hasScheduleData = (workSchedule?.shifts?.length || 0) > 0 || (classSchedule?.classes?.length || 0) > 0;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/10 rounded-lg">
                                <Calendar size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Schedule Connection</h2>
                                <p className="text-orange-100 text-sm">Find optimal times for your job search</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {!hasScheduleData && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={20} />
                                <div>
                                    <h4 className="font-semibold text-amber-800">No schedule imported</h4>
                                    <p className="text-sm text-amber-700 mt-1">
                                        Import your work or class schedule on the Schedule page to get personalized time suggestions.
                                        Showing default recommendations for now.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Optimal Times Summary */}
                    <div className="mb-6">
                        <h3 className="text-sm font-bold text-jalanea-700 uppercase tracking-wider mb-3">
                            Best Times for Key Activities
                        </h3>
                        <div className="grid sm:grid-cols-3 gap-4">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Send className="text-blue-600" size={18} />
                                    <h4 className="font-semibold text-blue-900">Job Applications</h4>
                                </div>
                                <p className="text-xs text-blue-700 mb-2">Best during focused morning hours</p>
                                {optimalTimes.jobApplications.length > 0 ? (
                                    <div className="space-y-1">
                                        {optimalTimes.jobApplications.map((block, i) => (
                                            <p key={i} className="text-sm font-medium text-blue-800">
                                                {block.day} {formatTime(block.startTime)}
                                            </p>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-blue-600 italic">Set up schedule for suggestions</p>
                                )}
                            </div>

                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Users className="text-purple-600" size={18} />
                                    <h4 className="font-semibold text-purple-900">Networking</h4>
                                </div>
                                <p className="text-xs text-purple-700 mb-2">LinkedIn is most active in afternoons</p>
                                {optimalTimes.networking.length > 0 ? (
                                    <div className="space-y-1">
                                        {optimalTimes.networking.map((block, i) => (
                                            <p key={i} className="text-sm font-medium text-purple-800">
                                                {block.day} {formatTime(block.startTime)}
                                            </p>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-purple-600 italic">Set up schedule for suggestions</p>
                                )}
                            </div>

                            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Sparkles className="text-green-600" size={18} />
                                    <h4 className="font-semibold text-green-900">Skill Building</h4>
                                </div>
                                <p className="text-xs text-green-700 mb-2">Longer blocks for deep learning</p>
                                {optimalTimes.skillBuilding.length > 0 ? (
                                    <div className="space-y-1">
                                        {optimalTimes.skillBuilding.map((block, i) => (
                                            <p key={i} className="text-sm font-medium text-green-800">
                                                {block.day} {formatTime(block.startTime)}
                                            </p>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-green-600 italic">Set up schedule for suggestions</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Weekly Overview */}
                    <div className="mb-6">
                        <h3 className="text-sm font-bold text-jalanea-700 uppercase tracking-wider mb-3">
                            Your Free Time Windows
                        </h3>
                        <div className="space-y-3">
                            {DAYS_OF_WEEK.map(day => {
                                const dayBlocks = blocksByDay[day] || [];
                                const isSelected = selectedDay === day;

                                return (
                                    <div key={day} className="border border-jalanea-200 rounded-xl overflow-hidden">
                                        <button
                                            onClick={() => setSelectedDay(isSelected ? null : day)}
                                            className="w-full flex items-center justify-between p-4 hover:bg-jalanea-50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                                    dayBlocks.length > 0 ? 'bg-green-100 text-green-600' : 'bg-jalanea-100 text-jalanea-400'
                                                }`}>
                                                    <Calendar size={18} />
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-semibold text-jalanea-900">{day}</p>
                                                    <p className="text-sm text-jalanea-500">
                                                        {dayBlocks.length > 0
                                                            ? `${dayBlocks.length} free block${dayBlocks.length > 1 ? 's' : ''} available`
                                                            : 'Fully scheduled'
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                            <ChevronRight className={`text-jalanea-400 transition-transform ${isSelected ? 'rotate-90' : ''}`} size={20} />
                                        </button>

                                        {isSelected && dayBlocks.length > 0 && (
                                            <div className="border-t border-jalanea-100 bg-jalanea-50 p-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
                                                {dayBlocks.map((block, i) => {
                                                    const TimeIcon = getTimeIcon(block.type);
                                                    return (
                                                        <div
                                                            key={i}
                                                            className={`bg-white border rounded-lg p-4 cursor-pointer transition-all ${
                                                                selectedBlock === block
                                                                    ? 'border-orange-400 ring-2 ring-orange-100'
                                                                    : 'border-jalanea-200 hover:border-jalanea-300'
                                                            }`}
                                                            onClick={() => setSelectedBlock(selectedBlock === block ? null : block)}
                                                        >
                                                            <div className="flex items-center justify-between mb-3">
                                                                <div className="flex items-center gap-2">
                                                                    <TimeIcon size={16} className="text-orange-500" />
                                                                    <span className="font-semibold text-jalanea-900">
                                                                        {formatTime(block.startTime)} - {formatTime(block.endTime)}
                                                                    </span>
                                                                </div>
                                                                <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full">
                                                                    {Math.floor(block.duration / 60)}h {block.duration % 60}m free
                                                                </span>
                                                            </div>

                                                            <p className="text-xs text-jalanea-500 mb-3">Suggested activities:</p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {block.activities.map((activity, j) => (
                                                                    <div
                                                                        key={j}
                                                                        className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs ${
                                                                            activity.priority === 'high'
                                                                                ? 'bg-green-100 text-green-700'
                                                                                : activity.priority === 'medium'
                                                                                ? 'bg-blue-100 text-blue-700'
                                                                                : 'bg-jalanea-100 text-jalanea-700'
                                                                        }`}
                                                                    >
                                                                        <activity.icon size={12} />
                                                                        {activity.name}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Tips */}
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4">
                        <h4 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                            <Coffee size={16} />
                            Productivity Tips
                        </h4>
                        <ul className="text-sm text-orange-800 space-y-1">
                            <li>• Apply to jobs in the morning when your mind is fresh</li>
                            <li>• Network on LinkedIn between 12-2 PM when activity peaks</li>
                            <li>• Schedule interviews mid-morning (10-11 AM) when possible</li>
                            <li>• Use shorter blocks (20-30 min) for quick networking outreach</li>
                        </ul>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-jalanea-100 p-4 bg-jalanea-50">
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-jalanea-500">
                            {hasScheduleData
                                ? 'Based on your imported schedule'
                                : 'Import your schedule for personalized times'
                            }
                        </p>
                        <Button variant="outline" size="sm" onClick={onClose}>
                            Done
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
