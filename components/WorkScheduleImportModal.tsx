import React, { useState } from 'react';
import { X, Briefcase, GraduationCap, Plus, Trash2, Clock, Save, Calendar, Upload } from 'lucide-react';
import { Button } from './Button';

// ============================================
// TYPES
// ============================================

interface WorkShift {
    day: string;
    startTime: string;
    endTime: string;
}

interface ClassBlock {
    id: string;
    className: string;
    days: string[];
    startTime: string;
    endTime: string;
}

interface WorkScheduleImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: {
        workSchedule?: {
            jobName?: string;
            shifts: WorkShift[];
        };
        classSchedule?: ClassBlock[];
    }) => void;
    initialWorkSchedule?: {
        jobName?: string;
        shifts: WorkShift[];
    };
    initialClassSchedule?: ClassBlock[];
}

// ============================================
// CONSTANTS
// ============================================

const DAYS = [
    { id: 'monday', short: 'Mon', label: 'Monday' },
    { id: 'tuesday', short: 'Tue', label: 'Tuesday' },
    { id: 'wednesday', short: 'Wed', label: 'Wednesday' },
    { id: 'thursday', short: 'Thu', label: 'Thursday' },
    { id: 'friday', short: 'Fri', label: 'Friday' },
    { id: 'saturday', short: 'Sat', label: 'Saturday' },
    { id: 'sunday', short: 'Sun', label: 'Sunday' },
];

const TIME_OPTIONS = Array.from({ length: 32 }, (_, i) => {
    const hour = Math.floor(i / 2) + 6; // Start at 6 AM
    const minute = (i % 2) * 30;
    const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const time12 = `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
    return { value: time24, label: time12 };
});

// ============================================
// MAIN COMPONENT
// ============================================

export const WorkScheduleImportModal: React.FC<WorkScheduleImportModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialWorkSchedule,
    initialClassSchedule
}) => {
    const [activeTab, setActiveTab] = useState<'work' | 'class'>('work');

    // Work schedule state
    const [jobName, setJobName] = useState(initialWorkSchedule?.jobName || '');
    const [selectedWorkDays, setSelectedWorkDays] = useState<string[]>(
        initialWorkSchedule?.shifts?.map(s => s.day) || []
    );
    const [sameHoursEveryDay, setSameHoursEveryDay] = useState(true);
    const [defaultStartTime, setDefaultStartTime] = useState('09:00');
    const [defaultEndTime, setDefaultEndTime] = useState('17:00');
    const [daySpecificTimes, setDaySpecificTimes] = useState<Record<string, { start: string; end: string }>>({});

    // Class schedule state
    const [classes, setClasses] = useState<ClassBlock[]>(
        initialClassSchedule || []
    );

    // Toggle work day selection
    const toggleWorkDay = (day: string) => {
        setSelectedWorkDays(prev =>
            prev.includes(day)
                ? prev.filter(d => d !== day)
                : [...prev, day]
        );
    };

    // Update day-specific times
    const updateDayTime = (day: string, field: 'start' | 'end', value: string) => {
        setDaySpecificTimes(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                [field]: value,
                start: field === 'start' ? value : (prev[day]?.start || defaultStartTime),
                end: field === 'end' ? value : (prev[day]?.end || defaultEndTime)
            }
        }));
    };

    // Add new class
    const addClass = () => {
        const newClass: ClassBlock = {
            id: `class-${Date.now()}`,
            className: '',
            days: [],
            startTime: '09:00',
            endTime: '10:15'
        };
        setClasses(prev => [...prev, newClass]);
    };

    // Update class
    const updateClass = (id: string, field: keyof ClassBlock, value: any) => {
        setClasses(prev => prev.map(cls =>
            cls.id === id ? { ...cls, [field]: value } : cls
        ));
    };

    // Toggle class day
    const toggleClassDay = (classId: string, day: string) => {
        setClasses(prev => prev.map(cls => {
            if (cls.id !== classId) return cls;
            const days = cls.days.includes(day)
                ? cls.days.filter(d => d !== day)
                : [...cls.days, day];
            return { ...cls, days };
        }));
    };

    // Remove class
    const removeClass = (id: string) => {
        setClasses(prev => prev.filter(cls => cls.id !== id));
    };

    // Handle save
    const handleSave = () => {
        // Build work shifts
        const shifts: WorkShift[] = selectedWorkDays.map(day => ({
            day,
            startTime: sameHoursEveryDay
                ? defaultStartTime
                : (daySpecificTimes[day]?.start || defaultStartTime),
            endTime: sameHoursEveryDay
                ? defaultEndTime
                : (daySpecificTimes[day]?.end || defaultEndTime)
        }));

        // Filter valid classes
        const validClasses = classes.filter(cls =>
            cls.className.trim() && cls.days.length > 0
        );

        onSave({
            workSchedule: shifts.length > 0 ? {
                jobName: jobName.trim() || undefined,
                shifts
            } : undefined,
            classSchedule: validClasses.length > 0 ? validClasses : undefined
        });

        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-jalanea-800 to-jalanea-900 text-white p-6 shrink-0">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Calendar size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Import Your Schedule</h2>
                                <p className="text-sm text-white/80">Add work hours and classes to find your free windows</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 shrink-0">
                    <button
                        onClick={() => setActiveTab('work')}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium transition-colors ${
                            activeTab === 'work'
                                ? 'text-jalanea-700 border-b-2 border-jalanea-600 bg-jalanea-50'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        <Briefcase size={18} />
                        Work Hours
                        {selectedWorkDays.length > 0 && (
                            <span className="ml-1 px-1.5 py-0.5 bg-jalanea-100 text-jalanea-700 text-xs rounded-full">
                                {selectedWorkDays.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('class')}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium transition-colors ${
                            activeTab === 'class'
                                ? 'text-blue-700 border-b-2 border-blue-600 bg-blue-50'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        <GraduationCap size={18} />
                        Class Schedule
                        {classes.length > 0 && (
                            <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                                {classes.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'work' ? (
                        <div className="space-y-6">
                            {/* Job Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Job/Employer Name (optional)
                                </label>
                                <input
                                    type="text"
                                    value={jobName}
                                    onChange={(e) => setJobName(e.target.value)}
                                    placeholder="e.g., Target, Publix, Campus Job"
                                    className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-jalanea-500 focus:border-transparent"
                                />
                            </div>

                            {/* Work Days Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Which days do you work?
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {DAYS.map(day => (
                                        <button
                                            key={day.id}
                                            onClick={() => toggleWorkDay(day.id)}
                                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                                                selectedWorkDays.includes(day.id)
                                                    ? 'bg-jalanea-600 text-white shadow-md'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            {day.short}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Hours Configuration */}
                            {selectedWorkDays.length > 0 && (
                                <div className="space-y-4">
                                    {/* Same hours toggle */}
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={sameHoursEveryDay}
                                            onChange={(e) => setSameHoursEveryDay(e.target.checked)}
                                            className="w-5 h-5 rounded border-gray-300 text-jalanea-600 focus:ring-jalanea-500"
                                        />
                                        <span className="text-sm text-gray-700">Same hours every work day</span>
                                    </label>

                                    {sameHoursEveryDay ? (
                                        /* Default hours for all days */
                                        <div className="bg-gray-50 rounded-xl p-4">
                                            <div className="flex items-center gap-4">
                                                <div className="flex-1">
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">Start Time</label>
                                                    <select
                                                        value={defaultStartTime}
                                                        onChange={(e) => setDefaultStartTime(e.target.value)}
                                                        className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-jalanea-500"
                                                    >
                                                        {TIME_OPTIONS.map(opt => (
                                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="text-gray-400 pt-5">to</div>
                                                <div className="flex-1">
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">End Time</label>
                                                    <select
                                                        value={defaultEndTime}
                                                        onChange={(e) => setDefaultEndTime(e.target.value)}
                                                        className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-jalanea-500"
                                                    >
                                                        {TIME_OPTIONS.map(opt => (
                                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        /* Day-specific hours */
                                        <div className="space-y-3">
                                            {selectedWorkDays
                                                .sort((a, b) => DAYS.findIndex(d => d.id === a) - DAYS.findIndex(d => d.id === b))
                                                .map(day => {
                                                    const dayInfo = DAYS.find(d => d.id === day);
                                                    const times = daySpecificTimes[day] || { start: defaultStartTime, end: defaultEndTime };
                                                    return (
                                                        <div key={day} className="bg-gray-50 rounded-xl p-3">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-20 font-medium text-gray-700 text-sm">
                                                                    {dayInfo?.label}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <select
                                                                        value={times.start}
                                                                        onChange={(e) => updateDayTime(day, 'start', e.target.value)}
                                                                        className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                                                                    >
                                                                        {TIME_OPTIONS.map(opt => (
                                                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                                <span className="text-gray-400 text-sm">to</span>
                                                                <div className="flex-1">
                                                                    <select
                                                                        value={times.end}
                                                                        onChange={(e) => updateDayTime(day, 'end', e.target.value)}
                                                                        className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                                                                    >
                                                                        {TIME_OPTIONS.map(opt => (
                                                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {selectedWorkDays.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <Clock size={32} className="mx-auto mb-2 text-gray-300" />
                                    <p className="text-sm">Select your work days above</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Class list */}
                            {classes.map((cls, index) => (
                                <div key={cls.id} className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <span className="text-xs font-bold text-blue-600 uppercase">
                                            Class {index + 1}
                                        </span>
                                        <button
                                            onClick={() => removeClass(cls.id)}
                                            className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    {/* Class name */}
                                    <input
                                        type="text"
                                        value={cls.className}
                                        onChange={(e) => updateClass(cls.id, 'className', e.target.value)}
                                        placeholder="e.g., ENC 1101, MAC 1105"
                                        className="w-full p-2.5 border border-blue-200 rounded-lg text-sm mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                    />

                                    {/* Days */}
                                    <div className="mb-3">
                                        <label className="block text-xs font-medium text-blue-700 mb-2">Days</label>
                                        <div className="flex flex-wrap gap-1.5">
                                            {DAYS.slice(0, 5).map(day => (
                                                <button
                                                    key={day.id}
                                                    onClick={() => toggleClassDay(cls.id, day.id)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                                        cls.days.includes(day.id)
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-white border border-blue-200 text-blue-700 hover:bg-blue-100'
                                                    }`}
                                                >
                                                    {day.short}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Times */}
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1">
                                            <label className="block text-xs font-medium text-blue-700 mb-1">Start</label>
                                            <select
                                                value={cls.startTime}
                                                onChange={(e) => updateClass(cls.id, 'startTime', e.target.value)}
                                                className="w-full p-2 border border-blue-200 rounded-lg text-sm bg-white"
                                            >
                                                {TIME_OPTIONS.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <span className="text-blue-400 pt-5">to</span>
                                        <div className="flex-1">
                                            <label className="block text-xs font-medium text-blue-700 mb-1">End</label>
                                            <select
                                                value={cls.endTime}
                                                onChange={(e) => updateClass(cls.id, 'endTime', e.target.value)}
                                                className="w-full p-2 border border-blue-200 rounded-lg text-sm bg-white"
                                            >
                                                {TIME_OPTIONS.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Add class button */}
                            <button
                                onClick={addClass}
                                className="w-full py-3 border-2 border-dashed border-blue-300 rounded-xl text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-colors flex items-center justify-center gap-2 font-medium"
                            >
                                <Plus size={18} />
                                Add Class
                            </button>

                            {/* Valencia Atlas placeholder */}
                            <div className="mt-6 pt-4 border-t border-gray-200">
                                <button
                                    disabled
                                    className="w-full py-3 bg-gray-100 rounded-xl text-gray-400 flex items-center justify-center gap-2 cursor-not-allowed"
                                >
                                    <Upload size={18} />
                                    Import from Valencia Atlas
                                    <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full ml-1">Coming Soon</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 p-4 bg-gray-50 shrink-0">
                    <div className="flex justify-between items-center">
                        <div className="text-xs text-gray-500">
                            {selectedWorkDays.length > 0 && (
                                <span className="mr-3">{selectedWorkDays.length} work days</span>
                            )}
                            {classes.filter(c => c.className && c.days.length > 0).length > 0 && (
                                <span>{classes.filter(c => c.className && c.days.length > 0).length} classes</span>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                icon={<Save size={16} />}
                                disabled={selectedWorkDays.length === 0 && classes.filter(c => c.className && c.days.length > 0).length === 0}
                            >
                                Save Schedule
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkScheduleImportModal;
