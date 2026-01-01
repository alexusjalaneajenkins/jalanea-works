
import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import {
    Calendar, Clock, CheckCircle2, RefreshCw, Zap,
    Briefcase, BookOpen, UserPlus, PenTool, Coffee, ExternalLink,
    Mail, CalendarClock, Plus, Trash2, ListChecks, ArrowRight, X, Edit2, Link as LinkIcon, CalendarPlus,
    Battery, BatteryCharging, Moon, Sun, Activity, Sparkles, Brain, Heart, CheckSquare, Square,
    ChevronLeft, ChevronRight, Settings, Palette, AlignLeft, Circle, Loader2, Flame, Target, Play,
    Users, Linkedin, Upload
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { generateWellnessInsights, generateScheduleSuggestions, WellnessInsight, ScheduleSuggestion } from '../services/geminiService';
import { TaskCategory, TimeBlock, ToDoItem } from '../types';
import { PowerHourSetup, PowerHourSettings } from '../components/PowerHourSetup';
import { NetworkingHourSetup, NetworkingHourSettings } from '../components/NetworkingHourSetup';
import { WorkScheduleImportModal } from '../components/WorkScheduleImportModal';
import { FreeWindowsCard, FreeWindowsSummary } from '../components/FreeWindowsCard';
import { analyzeFreeWindows, FreeWindow } from '../services/scheduleAnalysisService';

// --- Default Data ---

const DEFAULT_CATEGORIES: TaskCategory[] = [
    { id: 'work', label: 'Work', color: '#64748b' }, // slate-500
    { id: 'personal', label: 'Personal', color: '#f59e0b' }, // amber-500
    { id: 'learning', label: 'Learning', color: '#3b82f6' }, // blue-500
    { id: 'wellness', label: 'Wellness', color: '#10b981' }, // emerald-500
    { id: 'interview', label: 'Interview Prep', color: '#8b5cf6' }, // violet-500
    { id: 'job_search', label: 'Power Hour', color: '#EAB308' }, // yellow-500
    { id: 'networking', label: 'Networking', color: '#3B82F6' }, // blue-500 (distinct shade)
];

const getTodayString = () => new Date().toISOString().split('T')[0];

const INITIAL_SCHEDULE: TimeBlock[] = [
    { id: '1', date: getTodayString(), startTime: '07:00', endTime: '08:00', title: 'Wake Up / Routine', categoryId: 'personal', description: 'Morning hygiene and breakfast.' },
    { id: '2', date: getTodayString(), startTime: '09:00', endTime: '17:00', title: 'Work Shift', categoryId: 'work', description: 'Regular shift at the studio.' },
];

const INITIAL_TASKS: ToDoItem[] = [
    { id: 't1', text: 'Update Portfolio Case Study', completed: false, priority: 'high' },
    { id: 't2', text: 'Email Disney Recruiter', completed: false, priority: 'high' },
];

// --- Helper Functions ---

const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

const addMonths = (date: Date, months: number): Date => {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
}

const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

const getDayName = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'short' });
};

const getDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
};

const getFullDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
};

// Helper for Power Hour time formatting
const formatPowerHourTime = (time: string): string => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

const getDayId = (): string => {
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    return days[new Date().getDay()];
};

const isPowerHourActive = (scheduledTime: string): boolean => {
    const now = new Date();
    const [hours, minutes] = scheduledTime.split(':').map(Number);
    const start = new Date();
    start.setHours(hours, minutes, 0, 0);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    return now >= start && now < end;
};

export const Schedule: React.FC = () => {
    const { userProfile, saveUserProfile } = useAuth();
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<'calendar' | 'tasks'>('calendar');
    const [calendarView, setCalendarView] = useState<CalendarViewMode>('multi');
    const [isInitialized, setIsInitialized] = useState(false);

    // Power Hour state
    const [showPowerHourSetup, setShowPowerHourSetup] = useState(false);
    const powerHourSettings = userProfile?.powerHour || null;

    // Networking Hour state
    const [showNetworkingHourSetup, setShowNetworkingHourSetup] = useState(false);
    const networkingHourSettings = userProfile?.networkingHour || null;

    // Work Schedule Import state
    const [showScheduleImport, setShowScheduleImport] = useState(false);
    const [showFreeWindowsSummary, setShowFreeWindowsSummary] = useState(false);
    const workSchedule = userProfile?.workSchedule;
    const classSchedule = userProfile?.classSchedule;

    // Analyze free windows when work/class schedule changes
    const freeWindows = useMemo(() => {
        if (!workSchedule && !classSchedule) return [];
        return analyzeFreeWindows(workSchedule, classSchedule, []);
    }, [workSchedule, classSchedule]);

    // Calendar View State
    const [currentDate, setCurrentDate] = useState(getTodayString());
    const [daysToShow, setDaysToShow] = useState(3);

    // Data State
    const [schedule, setSchedule] = useState<TimeBlock[]>(INITIAL_SCHEDULE);
    const [tasks, setTasks] = useState<ToDoItem[]>(INITIAL_TASKS);
    const [categories, setCategories] = useState<TaskCategory[]>(DEFAULT_CATEGORIES);

    // Load data from Firebase on mount
    useEffect(() => {
        if (userProfile && !isInitialized) {
            if (userProfile.scheduleBlocks && userProfile.scheduleBlocks.length > 0) {
                setSchedule(userProfile.scheduleBlocks);
            }
            if (userProfile.tasks && userProfile.tasks.length > 0) {
                setTasks(userProfile.tasks);
            }
            setIsInitialized(true);
        }
    }, [userProfile, isInitialized]);

    // Auto-save schedule to Firebase when changed
    useEffect(() => {
        if (isInitialized && userProfile) {
            const saveTimer = setTimeout(() => {
                saveUserProfile({
                    scheduleBlocks: schedule,
                    tasks: tasks
                }).catch(err => console.error('Failed to save schedule:', err));
            }, 1000); // Debounce saves by 1 second
            return () => clearTimeout(saveTimer);
        }
    }, [schedule, tasks, isInitialized]);

    // Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
    const [newBlock, setNewBlock] = useState<Partial<TimeBlock>>({
        date: getTodayString(),
        startTime: '09:00',
        endTime: '10:00',
        categoryId: 'work',
        description: ''
    });

    // Category Manager State
    const [newCatName, setNewCatName] = useState('');
    const [newCatColor, setNewCatColor] = useState('#000000');

    // Task State
    const [newTaskText, setNewTaskText] = useState('');
    const [schedulingTask, setSchedulingTask] = useState<ToDoItem | null>(null);

    // Suggestion State
    const [suggestions, setSuggestions] = useState<ScheduleSuggestion[]>([]);
    const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set());
    const [customDurations, setCustomDurations] = useState<Record<string, number>>({});

    // Wellness State
    const [wellness, setWellness] = useState<WellnessInsight | null>(null);
    const [isAnalyzingWellness, setIsAnalyzingWellness] = useState(false);

    // --- COMPUTED VALUES ---

    const visibleDays = useMemo(() => {
        const start = new Date(currentDate);
        const count = calendarView === 'day' ? 1 : daysToShow;
        return Array.from({ length: count }, (_, i) => {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            return formatDate(d);
        });
    }, [currentDate, calendarView, daysToShow]);

    const monthGridDays = useMemo(() => {
        const date = new Date(currentDate);
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const startDayOfWeek = firstDayOfMonth.getDay();
        const gridStart = new Date(year, month, 1 - startDayOfWeek);

        return Array.from({ length: 42 }, (_, i) => {
            const d = new Date(gridStart);
            d.setDate(gridStart.getDate() + i);
            return {
                dateStr: formatDate(d),
                dayNum: d.getDate(),
                isCurrentMonth: d.getMonth() === month
            };
        });
    }, [currentDate]);

    const currentMonthLabel = useMemo(() => {
        const d = new Date(currentDate);
        return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }, [currentDate]);

    // --- NAVIGATION ---

    const handleNextPeriod = () => {
        if (calendarView === 'month') {
            setCurrentDate(formatDate(addMonths(new Date(currentDate), 1)));
        } else {
            const jump = calendarView === 'day' ? 1 : daysToShow;
            setCurrentDate(formatDate(addDays(new Date(currentDate), jump)));
        }
    };

    const handlePrevPeriod = () => {
        if (calendarView === 'month') {
            setCurrentDate(formatDate(addMonths(new Date(currentDate), -1)));
        } else {
            const jump = calendarView === 'day' ? 1 : daysToShow;
            setCurrentDate(formatDate(addDays(new Date(currentDate), -jump)));
        }
    };

    const handleToday = () => {
        setCurrentDate(getTodayString());
    };

    // --- TASK MANAGEMENT ---

    const handleAddTask = () => {
        if (!newTaskText.trim()) return;
        setTasks(prev => [...prev, { id: Date.now().toString(), text: newTaskText, completed: false, priority: 'medium' }]);
        setNewTaskText('');
    };

    const toggleTask = (id: string) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const deleteTask = (id: string) => {
        setTasks(prev => prev.filter(t => t.id !== id));
    };

    // Schedule a task as a time block
    const scheduleTaskAsBlock = (task: ToDoItem) => {
        const now = new Date();
        const startHour = now.getHours().toString().padStart(2, '0');
        const startMin = (Math.ceil(now.getMinutes() / 15) * 15 % 60).toString().padStart(2, '0');
        const startTime = `${startHour}:${startMin}`;

        const endDate = new Date(now.getTime() + 30 * 60000);
        const endHour = endDate.getHours().toString().padStart(2, '0');
        const endMin = endDate.getMinutes().toString().padStart(2, '0');
        const endTime = `${endHour}:${endMin}`;

        const newBlock: TimeBlock = {
            id: Date.now().toString(),
            title: task.text,
            categoryId: 'work',
            startTime,
            endTime,
            date: getTodayString(),
            description: 'From To-Do List'
        };
        setSchedule(prev => [...prev, newBlock]);
        deleteTask(task.id);
        setSchedulingTask(null);
        setViewMode('calendar');
    };

    // --- CRUD ---

    const handleSaveBlock = () => {
        if (newBlock.title && newBlock.startTime && newBlock.endTime && newBlock.date) {
            if (editingBlockId) {
                setSchedule(prev => prev.map(b => b.id === editingBlockId ? { ...newBlock, id: editingBlockId } as TimeBlock : b));
            } else {
                setSchedule(prev => [...prev, { ...newBlock, id: Date.now().toString() } as TimeBlock]);
            }
            setIsAddModalOpen(false);
            setNewBlock({ date: currentDate, startTime: '09:00', endTime: '10:00', categoryId: 'work', description: '' });
            setEditingBlockId(null);
        }
    };

    const handleDeleteBlock = (id: string) => {
        setSchedule(prev => prev.filter(b => b.id !== id));
        if (editingBlockId === id) setIsAddModalOpen(false);
    };

    const openAddModal = (date?: string) => {
        setEditingBlockId(null);
        setNewBlock({
            date: date || currentDate,
            startTime: '09:00',
            endTime: '10:00',
            categoryId: categories[0].id,
            title: '',
            description: ''
        });
        setIsAddModalOpen(true);
    };

    const openEditModal = (block: TimeBlock) => {
        setEditingBlockId(block.id);
        setNewBlock({ ...block });
        setIsAddModalOpen(true);
    };

    // --- CATEGORY MANAGEMENT ---

    const addCategory = () => {
        if (newCatName && newCatColor) {
            const id = newCatName.toLowerCase().replace(/\s+/g, '-');
            setCategories([...categories, { id, label: newCatName, color: newCatColor }]);
            setNewCatName('');
        }
    };

    const deleteCategory = (id: string) => {
        setCategories(categories.filter(c => c.id !== id));
    };

    // --- AI LOGIC ---
    const handleGetSuggestions = async () => {
        setIsLoadingSuggestions(true);
        const contextSchedule = schedule.filter(s => s.date === getTodayString());
        const results = await generateScheduleSuggestions(contextSchedule);
        setSuggestions(results);
        setSelectedSuggestions(new Set(results.map(r => r.id)));
        const durations: Record<string, number> = {};
        results.forEach(r => durations[r.id] = r.suggestedDurationMinutes);
        setCustomDurations(durations);
        setIsLoadingSuggestions(false);
        setIsSuggestionsOpen(true);
    };

    const toggleSuggestion = (id: string) => {
        const next = new Set(selectedSuggestions);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedSuggestions(next);
    };

    const addSuggestionsToSchedule = () => {
        let lastTime = "09:00";
        const todayBlocks = schedule.filter(s => s.date === getTodayString()).sort((a, b) => a.endTime.localeCompare(b.endTime));
        if (todayBlocks.length > 0) lastTime = todayBlocks[todayBlocks.length - 1].endTime;

        const newBlocks: TimeBlock[] = [];
        let currentTime = lastTime;

        suggestions.filter(s => selectedSuggestions.has(s.id)).forEach(s => {
            const [hours, mins] = currentTime.split(':').map(Number);
            const duration = customDurations[s.id] || 30;
            const dateObj = new Date();
            dateObj.setHours(hours, mins + duration);

            const endHours = dateObj.getHours().toString().padStart(2, '0');
            const endMins = dateObj.getMinutes().toString().padStart(2, '0');
            const endTime = `${endHours}:${endMins}`;

            let catId = 'personal';
            if (s.category === 'Career') catId = 'work';
            if (s.category === 'Learning') catId = 'learning';
            if (s.category === 'Wellness') catId = 'wellness';

            newBlocks.push({
                id: Date.now().toString() + Math.random().toString(),
                title: s.title,
                categoryId: catId,
                startTime: currentTime,
                endTime: endTime,
                date: getTodayString(),
                description: s.reasoning,
                isAiSuggested: true
            });
            currentTime = endTime;
        });

        setSchedule(prev => [...prev, ...newBlocks]);
        setIsSuggestionsOpen(false);
    };

    const getCatColor = (catId: string) => {
        const cat = categories.find(c => c.id === catId);
        return cat ? cat.color : '#cbd5e1';
    };

    // --- POWER HOUR FUNCTIONS ---
    const handleSavePowerHour = async (settings: PowerHourSettings) => {
        await saveUserProfile({ powerHour: settings });

        // Create recurring Power Hour blocks in schedule for the next 7 days
        const today = new Date();
        const newBlocks: TimeBlock[] = [];

        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const dateStr = formatDate(date);
            const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
            const dayId = dayNames[date.getDay()];

            if (settings.scheduledDays.includes(dayId)) {
                // Check if Power Hour block already exists for this day
                const existingBlock = schedule.find(
                    b => b.date === dateStr && b.categoryId === 'job_search'
                );

                if (!existingBlock) {
                    const [hours, mins] = settings.scheduledTime.split(':').map(Number);
                    const endHour = hours + 1;
                    newBlocks.push({
                        id: `ph-${dateStr}`,
                        title: 'Power Hour',
                        categoryId: 'job_search',
                        startTime: settings.scheduledTime,
                        endTime: `${endHour.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`,
                        date: dateStr,
                        description: `Apply to ${settings.dailyGoal} jobs`,
                        isPowerHour: true
                    });
                }
            }
        }

        if (newBlocks.length > 0) {
            setSchedule(prev => [...prev, ...newBlocks]);
        }
    };

    const todayDayId = getDayId();
    const isPowerHourToday = powerHourSettings?.scheduledDays?.includes(todayDayId);
    const isPowerHourNow = powerHourSettings && isPowerHourActive(powerHourSettings.scheduledTime);

    // --- NETWORKING HOUR FUNCTIONS ---
    const handleSaveNetworkingHour = async (settings: NetworkingHourSettings) => {
        await saveUserProfile({ networkingHour: settings });

        // Create networking hour blocks for the next 4 weeks
        const today = new Date();
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const targetDayIndex = dayNames.indexOf(settings.scheduledDay);
        const newBlocks: TimeBlock[] = [];

        for (let week = 0; week < 4; week++) {
            const date = new Date(today);
            // Find the next occurrence of the target day
            const currentDayIndex = date.getDay();
            let daysUntilTarget = targetDayIndex - currentDayIndex;
            if (daysUntilTarget < 0) daysUntilTarget += 7;
            if (week === 0 && daysUntilTarget === 0 && date.getHours() >= parseInt(settings.scheduledTime.split(':')[0])) {
                daysUntilTarget += 7; // Skip today if time has passed
            }
            date.setDate(date.getDate() + daysUntilTarget + (week * 7));
            const dateStr = formatDate(date);

            // Check if networking block already exists for this day
            const existingBlock = schedule.find(
                b => b.date === dateStr && b.categoryId === 'networking'
            );

            if (!existingBlock) {
                const [hours, mins] = settings.scheduledTime.split(':').map(Number);
                const endHour = hours + 1;
                newBlocks.push({
                    id: `net-${dateStr}`,
                    title: 'Networking Hour',
                    categoryId: 'networking',
                    startTime: settings.scheduledTime,
                    endTime: `${endHour.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`,
                    date: dateStr,
                    description: `Connect with ${settings.weeklyGoal} people`,
                    isNetworkingHour: true
                });
            }
        }

        if (newBlocks.length > 0) {
            setSchedule(prev => [...prev, ...newBlocks]);
        }
    };

    // Check if today is the scheduled networking day
    const todayFullDayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date().getDay()];
    const isNetworkingToday = networkingHourSettings?.scheduledDay === todayFullDayName;
    const isNetworkingNow = networkingHourSettings && isNetworkingToday && isPowerHourActive(networkingHourSettings.scheduledTime);

    // --- WORK SCHEDULE IMPORT FUNCTIONS ---
    const handleSaveWorkSchedule = async (data: {
        workSchedule?: {
            jobName?: string;
            shifts: Array<{ day: string; startTime: string; endTime: string }>;
        };
        classSchedule?: Array<{
            id: string;
            className: string;
            days: string[];
            startTime: string;
            endTime: string;
        }>;
    }) => {
        await saveUserProfile({
            workSchedule: data.workSchedule,
            classSchedule: data.classSchedule
        });

        // Create recurring blocks for work shifts
        if (data.workSchedule?.shifts) {
            const today = new Date();
            const newBlocks: TimeBlock[] = [];
            const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

            for (let i = 0; i < 14; i++) { // 2 weeks of blocks
                const date = new Date(today);
                date.setDate(today.getDate() + i);
                const dateStr = formatDate(date);
                const dayName = dayNames[date.getDay()];

                // Add work shifts
                data.workSchedule.shifts
                    .filter(shift => shift.day.toLowerCase() === dayName)
                    .forEach(shift => {
                        const existingBlock = schedule.find(
                            b => b.date === dateStr && b.categoryId === 'work' && b.startTime === shift.startTime
                        );
                        if (!existingBlock) {
                            newBlocks.push({
                                id: `work-${dateStr}-${shift.startTime}`,
                                title: data.workSchedule?.jobName || 'Work',
                                categoryId: 'work',
                                startTime: shift.startTime,
                                endTime: shift.endTime,
                                date: dateStr,
                                description: 'Regular work shift'
                            });
                        }
                    });
            }

            if (newBlocks.length > 0) {
                setSchedule(prev => [...prev, ...newBlocks]);
            }
        }

        // Create recurring blocks for classes
        if (data.classSchedule) {
            const today = new Date();
            const newBlocks: TimeBlock[] = [];
            const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

            for (let i = 0; i < 14; i++) { // 2 weeks of blocks
                const date = new Date(today);
                date.setDate(today.getDate() + i);
                const dateStr = formatDate(date);
                const dayName = dayNames[date.getDay()];

                data.classSchedule
                    .filter(cls => cls.days.map(d => d.toLowerCase()).includes(dayName))
                    .forEach(cls => {
                        const existingBlock = schedule.find(
                            b => b.date === dateStr && b.categoryId === 'learning' && b.title === cls.className
                        );
                        if (!existingBlock) {
                            newBlocks.push({
                                id: `class-${dateStr}-${cls.className}`,
                                title: cls.className,
                                categoryId: 'learning',
                                startTime: cls.startTime,
                                endTime: cls.endTime,
                                date: dateStr,
                                description: 'Class session'
                            });
                        }
                    });
            }

            if (newBlocks.length > 0) {
                setSchedule(prev => [...prev, ...newBlocks]);
            }
        }

        // Show free windows summary after import
        setShowFreeWindowsSummary(true);
    };

    // Handle setting a free window as Power Hour
    const handleSetPowerHourFromWindow = (window: FreeWindow) => {
        // Map day name to short format
        const dayMap: Record<string, string> = {
            'monday': 'mon',
            'tuesday': 'tue',
            'wednesday': 'wed',
            'thursday': 'thu',
            'friday': 'fri',
            'saturday': 'sat',
            'sunday': 'sun'
        };

        const settings: PowerHourSettings = {
            scheduledTime: window.startTime,
            scheduledDays: [dayMap[window.day]],
            currentStreak: 0,
            longestStreak: 0,
            lastCompletedDate: null,
            totalPowerHours: 0,
            dailyGoal: 3
        };

        handleSavePowerHour(settings);
        setShowFreeWindowsSummary(false);
    };

    // --- CALENDAR EXPORT FUNCTIONS ---
    const exportToGoogleCalendar = (block: TimeBlock) => {
        const dateStr = block.date.replace(/-/g, '');
        const startStr = `${dateStr}T${block.startTime.replace(':', '')}00`;
        const endStr = `${dateStr}T${block.endTime.replace(':', '')}00`;
        const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(block.title)}&dates=${startStr}/${endStr}&details=${encodeURIComponent(block.description || '')}&sf=true&output=xml`;
        window.open(url, '_blank');
    };

    const downloadICS = (block: TimeBlock) => {
        const formatICSDate = (date: string, time: string) => {
            return `${date.replace(/-/g, '')}T${time.replace(':', '')}00`;
        };

        const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//JalaneaWorks//Schedule//EN
BEGIN:VEVENT
DTSTART:${formatICSDate(block.date, block.startTime)}
DTEND:${formatICSDate(block.date, block.endTime)}
SUMMARY:${block.title}
DESCRIPTION:${block.description || ''}
END:VEVENT
END:VCALENDAR`;

        const blob = new Blob([icsContent], { type: 'text/calendar' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${block.title.replace(/[^a-z0-9]/gi, '_')}.ics`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Type for CalendarViewMode local to component since not exported
    type CalendarViewMode = 'day' | 'multi' | 'month';

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12 h-full flex flex-col">

            {/* Header Controls */}
            <div className="flex flex-col xl:flex-row justify-between xl:items-end gap-4 shrink-0">
                <div>
                    <h1 className="text-3xl font-display font-bold text-jalanea-900">Smart Schedule</h1>
                    <div className="flex flex-wrap items-center gap-4 mt-2">
                        {/* Primary View Toggle */}
                        <div className="flex bg-white rounded-lg border border-jalanea-200 p-1">
                            <button onClick={() => setViewMode('calendar')} className={`px-3 py-1 rounded text-sm font-bold transition-all ${viewMode === 'calendar' ? 'bg-jalanea-900 text-gold' : 'text-jalanea-500'}`}>Calendar</button>
                            <button onClick={() => setViewMode('tasks')} className={`px-3 py-1 rounded text-sm font-bold transition-all ${viewMode === 'tasks' ? 'bg-jalanea-900 text-gold' : 'text-jalanea-500'}`}>To-Do</button>
                        </div>

                        {/* Calendar Mode Toggles */}
                        {viewMode === 'calendar' && (
                            <>
                                <div className="flex bg-white rounded-lg border border-jalanea-200 p-1">
                                    <button onClick={() => setCalendarView('day')} className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider transition-all ${calendarView === 'day' ? 'bg-jalanea-100 text-jalanea-900' : 'text-jalanea-400'}`}>Day</button>
                                    <button onClick={() => setCalendarView('multi')} className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider transition-all ${calendarView === 'multi' ? 'bg-jalanea-100 text-jalanea-900' : 'text-jalanea-400'}`}>Multi</button>
                                    <button onClick={() => setCalendarView('month')} className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider transition-all ${calendarView === 'month' ? 'bg-jalanea-100 text-jalanea-900' : 'text-jalanea-400'}`}>Month</button>
                                </div>

                                {calendarView === 'multi' && (
                                    <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-lg border border-jalanea-200 animate-in fade-in zoom-in-95 duration-200">
                                        <span className="text-xs font-bold text-jalanea-500 uppercase whitespace-nowrap">Days: {daysToShow}</span>
                                        <input
                                            type="range" min="2" max="7" step="1"
                                            value={daysToShow}
                                            onChange={(e) => setDaysToShow(parseInt(e.target.value))}
                                            className="w-20 accent-gold cursor-pointer"
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {viewMode === 'calendar' && (
                    <div className="flex flex-wrap gap-3 items-center">
                        <div className="flex items-center bg-white rounded-xl border border-jalanea-200 shadow-sm p-1">
                            <button onClick={handlePrevPeriod} className="p-2 hover:bg-jalanea-50 rounded-lg text-jalanea-600"><ChevronLeft size={20} /></button>
                            <div className="px-4 text-center min-w-[140px] flex-1">
                                <span className="block text-xs font-bold text-jalanea-400 uppercase">
                                    {calendarView === 'day' ? 'Current Day' : calendarView === 'multi' ? `${daysToShow} Days View` : 'Current Month'}
                                </span>
                                <span className="block text-sm font-bold text-jalanea-900 whitespace-nowrap">
                                    {calendarView === 'day' ? getDisplayDate(currentDate) : currentMonthLabel}
                                </span>
                            </div>
                            <button onClick={handleNextPeriod} className="p-2 hover:bg-jalanea-50 rounded-lg text-jalanea-600"><ChevronRight size={20} /></button>
                        </div>

                        <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={handleToday}>Today</Button>
                            <Button size="sm" variant="ghost" onClick={() => setIsCategoryModalOpen(true)} icon={<Settings size={16} />}>Types</Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setShowScheduleImport(true)}
                                icon={<Upload size={16} />}
                                className={workSchedule || classSchedule ? 'border-green-300 text-green-600' : ''}
                            >
                                Import
                            </Button>
                            <Button
                                size="sm"
                                variant="glass-dark"
                                className="bg-jalanea-900 text-gold border-jalanea-800 hover:bg-jalanea-800"
                                icon={isLoadingSuggestions ? <Sparkles className="animate-spin" size={16} /> : <Sparkles size={16} />}
                                onClick={handleGetSuggestions}
                                disabled={isLoadingSuggestions}
                            >
                                Ask JW
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* --- POWER HOUR SECTION --- */}
            {viewMode === 'calendar' && (
                <div className={`rounded-2xl overflow-hidden transition-all ${
                    isPowerHourNow
                        ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-lg shadow-yellow-500/30'
                        : 'bg-white border border-jalanea-200'
                }`}>
                    <div className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl ${isPowerHourNow ? 'bg-white/20' : 'bg-yellow-100'}`}>
                                    <Zap size={20} className={isPowerHourNow ? 'text-white' : 'text-yellow-600'} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className={`font-bold ${isPowerHourNow ? 'text-white' : 'text-jalanea-900'}`}>
                                            {isPowerHourNow ? "Power Hour Active!" : "Today's Power Hour"}
                                        </h3>
                                        {powerHourSettings && powerHourSettings.currentStreak > 0 && (
                                            <span className={`flex items-center gap-1 text-sm font-bold px-2 py-0.5 rounded-full ${
                                                isPowerHourNow ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-600'
                                            }`}>
                                                <Flame size={12} />
                                                {powerHourSettings.currentStreak}
                                            </span>
                                        )}
                                    </div>
                                    {powerHourSettings && isPowerHourToday ? (
                                        <p className={`text-sm ${isPowerHourNow ? 'text-white/80' : 'text-jalanea-500'}`}>
                                            {formatPowerHourTime(powerHourSettings.scheduledTime)} - {formatPowerHourTime(
                                                `${(parseInt(powerHourSettings.scheduledTime.split(':')[0]) + 1).toString().padStart(2, '0')}:${powerHourSettings.scheduledTime.split(':')[1]}`
                                            )} • Goal: {powerHourSettings.dailyGoal} applications
                                        </p>
                                    ) : powerHourSettings ? (
                                        <p className={`text-sm ${isPowerHourNow ? 'text-white/80' : 'text-jalanea-500'}`}>
                                            Not scheduled today
                                        </p>
                                    ) : (
                                        <p className={`text-sm ${isPowerHourNow ? 'text-white/80' : 'text-jalanea-500'}`}>
                                            Set up your daily job search routine
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {isPowerHourNow ? (
                                    <Button
                                        size="sm"
                                        onClick={() => navigate('/jobs')}
                                        icon={<Play size={14} />}
                                        className="bg-white text-yellow-600 hover:bg-yellow-50"
                                    >
                                        Start Applying
                                    </Button>
                                ) : powerHourSettings ? (
                                    <>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setShowPowerHourSetup(true)}
                                            className="border-jalanea-200"
                                        >
                                            Reschedule
                                        </Button>
                                        {isPowerHourToday && (
                                            <Button
                                                size="sm"
                                                variant="primary"
                                                onClick={() => navigate('/jobs')}
                                                icon={<Target size={14} />}
                                                className="bg-yellow-500 hover:bg-yellow-600"
                                            >
                                                Start Now
                                            </Button>
                                        )}
                                    </>
                                ) : (
                                    <Button
                                        size="sm"
                                        variant="primary"
                                        onClick={() => setShowPowerHourSetup(true)}
                                        icon={<Zap size={14} />}
                                        className="bg-yellow-500 hover:bg-yellow-600"
                                    >
                                        Set Up Power Hour
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- NETWORKING HOUR SECTION --- */}
            {viewMode === 'calendar' && (
                <div className={`rounded-2xl overflow-hidden transition-all ${
                    isNetworkingNow
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                        : 'bg-white border border-jalanea-200'
                }`}>
                    <div className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl ${isNetworkingNow ? 'bg-white/20' : 'bg-blue-100'}`}>
                                    <Users size={20} className={isNetworkingNow ? 'text-white' : 'text-blue-600'} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className={`font-bold ${isNetworkingNow ? 'text-white' : 'text-jalanea-900'}`}>
                                            {isNetworkingNow ? "Networking Hour Active!" : "This Week's Networking Hour"}
                                        </h3>
                                        {networkingHourSettings && networkingHourSettings.currentWeekConnections > 0 && (
                                            <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${
                                                isNetworkingNow ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-600'
                                            }`}>
                                                {networkingHourSettings.currentWeekConnections}/{networkingHourSettings.weeklyGoal}
                                            </span>
                                        )}
                                    </div>
                                    {networkingHourSettings ? (
                                        <p className={`text-sm ${isNetworkingNow ? 'text-white/80' : 'text-jalanea-500'}`}>
                                            {networkingHourSettings.scheduledDay.charAt(0).toUpperCase() + networkingHourSettings.scheduledDay.slice(1)} at {formatPowerHourTime(networkingHourSettings.scheduledTime)} • Goal: {networkingHourSettings.weeklyGoal} connections
                                        </p>
                                    ) : (
                                        <p className={`text-sm ${isNetworkingNow ? 'text-white/80' : 'text-jalanea-500'}`}>
                                            Set up weekly time for building your professional network
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {isNetworkingNow ? (
                                    <Button
                                        size="sm"
                                        onClick={() => window.open('https://www.linkedin.com', '_blank')}
                                        icon={<Linkedin size={14} />}
                                        className="bg-white text-blue-600 hover:bg-blue-50"
                                    >
                                        Open LinkedIn
                                    </Button>
                                ) : networkingHourSettings ? (
                                    <>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setShowNetworkingHourSetup(true)}
                                            className="border-jalanea-200"
                                        >
                                            Reschedule
                                        </Button>
                                        {isNetworkingToday && (
                                            <Button
                                                size="sm"
                                                variant="primary"
                                                onClick={() => window.open('https://www.linkedin.com', '_blank')}
                                                icon={<Linkedin size={14} />}
                                                className="bg-blue-500 hover:bg-blue-600"
                                            >
                                                Start Networking
                                            </Button>
                                        )}
                                    </>
                                ) : (
                                    <Button
                                        size="sm"
                                        variant="primary"
                                        onClick={() => setShowNetworkingHourSetup(true)}
                                        icon={<Users size={14} />}
                                        className="bg-blue-500 hover:bg-blue-600"
                                    >
                                        Set Up Networking Hour
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- FREE WINDOWS SECTION --- */}
            {viewMode === 'calendar' && freeWindows.length > 0 && (
                <FreeWindowsCard
                    windows={freeWindows}
                    onSetPowerHour={handleSetPowerHourFromWindow}
                    onOptimize={() => setShowPowerHourSetup(true)}
                />
            )}

            {/* --- MONTH GRID VIEW --- */}
            {viewMode === 'calendar' && calendarView === 'month' && (
                <div className="flex-1 bg-white/50 rounded-2xl border border-jalanea-200 overflow-hidden flex flex-col">
                    <div className="grid grid-cols-7 border-b border-jalanea-200 bg-jalanea-50">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                            <div key={d} className="p-3 text-center text-xs font-bold text-jalanea-400 uppercase tracking-widest">
                                {d}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 grid-rows-6 flex-1 bg-white">
                        {monthGridDays.map((cell, idx) => {
                            const dayBlocks = schedule.filter(b => b.date === cell.dateStr);
                            const isToday = cell.dateStr === getTodayString();

                            return (
                                <div
                                    key={idx}
                                    onClick={() => { setCurrentDate(cell.dateStr); setCalendarView('day'); }}
                                    className={`
                                        border-b border-r border-jalanea-100 p-1 md:p-2 min-h-[60px] md:min-h-[100px] transition-colors cursor-pointer hover:bg-jalanea-50
                                        ${!cell.isCurrentMonth ? 'bg-jalanea-50/30 text-jalanea-300' : 'text-jalanea-900'}
                                    `}
                                >
                                    <div className="flex justify-between items-start">
                                        <span className={`text-xs md:text-sm font-bold w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-jalanea-900 text-white' : ''}`}>
                                            {cell.dayNum}
                                        </span>
                                    </div>
                                    <div className="mt-1 md:mt-2 space-y-1">
                                        {dayBlocks.slice(0, 3).map(block => (
                                            <div key={block.id} className="flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full" style={{ backgroundColor: getCatColor(block.categoryId) }}></div>
                                                <span className="text-[8px] md:text-[10px] font-medium truncate text-jalanea-600 hidden md:inline">{block.title}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* --- DAY / MULTI GRID VIEW --- */}
            {viewMode === 'calendar' && (calendarView === 'multi' || calendarView === 'day') && (
                <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar bg-white/50 rounded-2xl border border-jalanea-200 relative">
                    <div
                        className="h-full grid divide-x divide-jalanea-200"
                        style={{
                            gridTemplateColumns: `repeat(${visibleDays.length}, minmax(200px, 1fr))`,
                            minWidth: visibleDays.length > 2 ? '100%' : 'auto'
                        }}
                    >
                        {visibleDays.map((dayDate) => {
                            const isToday = dayDate === getTodayString();
                            const dayBlocks = schedule
                                .filter(b => b.date === dayDate)
                                .sort((a, b) => a.startTime.localeCompare(b.startTime));

                            return (
                                <div key={dayDate} className={`flex flex-col h-full ${isToday ? 'bg-white' : 'bg-jalanea-50/30'}`}>
                                    <div className={`p-4 text-center border-b border-jalanea-100 ${isToday ? 'bg-gold/10' : ''} w-full`}>
                                        <div className="text-xs font-bold text-jalanea-400 uppercase mb-1">{getDayName(dayDate)}</div>
                                        <div className={`text-xl font-display font-bold ${isToday ? 'text-jalanea-900' : 'text-jalanea-600'}`}>
                                            {getDisplayDate(dayDate)}
                                        </div>
                                    </div>

                                    <div className="flex-1 p-2 space-y-2 overflow-y-auto custom-scrollbar relative group/col">
                                        {dayBlocks.map(block => {
                                            const catColor = getCatColor(block.categoryId);
                                            const isPowerHourBlock = block.categoryId === 'job_search' || block.isPowerHour;
                                            const isNetworkingBlock = block.categoryId === 'networking' || block.isNetworkingHour;
                                            return (
                                                <div
                                                    key={block.id}
                                                    onClick={() => openEditModal(block)}
                                                    className={`p-3 rounded-xl border shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden group ${
                                                        isPowerHourBlock
                                                            ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300'
                                                            : isNetworkingBlock
                                                                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300'
                                                                : 'border-black/5 bg-white'
                                                    }`}
                                                    style={{ borderLeft: `4px solid ${catColor}` }}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <span className="text-xs font-bold text-jalanea-400">{block.startTime}</span>
                                                        <div className="flex items-center gap-1">
                                                            {isPowerHourBlock && <Zap size={12} className="text-yellow-500" />}
                                                            {isNetworkingBlock && <Users size={12} className="text-blue-500" />}
                                                            {block.isAiSuggested && <Sparkles size={10} className="text-gold" />}
                                                        </div>
                                                    </div>
                                                    <div className={`font-bold text-sm mt-1 line-clamp-2 ${
                                                        isPowerHourBlock ? 'text-yellow-700' : isNetworkingBlock ? 'text-blue-700' : 'text-jalanea-900'
                                                    }`}>{block.title}</div>
                                                    {block.description && <div className="text-xs text-jalanea-500 mt-1 line-clamp-1">{block.description}</div>}
                                                    <div className="text-[10px] text-jalanea-500 mt-1 uppercase tracking-wide opacity-70">
                                                        {categories.find(c => c.id === block.categoryId)?.label}
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        <button
                                            onClick={() => openAddModal(dayDate)}
                                            className="w-full py-3 border-2 border-dashed border-jalanea-200 rounded-xl text-jalanea-400 font-bold text-sm hover:border-gold hover:text-gold hover:bg-gold/5 transition-all opacity-0 group-hover/col:opacity-100"
                                        >
                                            <Plus size={16} className="mx-auto" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* --- TASK VIEW --- */}
            {viewMode === 'tasks' && (
                <div className="max-w-3xl mx-auto w-full h-full flex flex-col">
                    <Card variant="solid-white" className="p-0 overflow-hidden flex-1 flex flex-col">
                        <div className="p-6 bg-jalanea-50 border-b border-jalanea-100 flex gap-4">
                            <input
                                className="flex-1 bg-white border border-jalanea-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-gold"
                                placeholder="Add a new task..."
                                value={newTaskText}
                                onChange={(e) => setNewTaskText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                            />
                            <Button onClick={handleAddTask} icon={<Plus size={18} />}>Add</Button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-2">
                            {tasks.map(task => (
                                <div key={task.id} className="group flex items-center gap-3 p-4 bg-white border border-jalanea-100 rounded-xl hover:border-jalanea-300 hover:shadow-sm transition-all">
                                    <button
                                        onClick={() => toggleTask(task.id)}
                                        className={`shrink-0 ${task.completed ? 'text-green-500' : 'text-jalanea-300 hover:text-gold'}`}
                                    >
                                        {task.completed ? <CheckCircle2 size={24} fill="currentColor" className="text-white bg-green-500 rounded-full" /> : <Circle size={24} />}
                                    </button>
                                    <div className="flex-1">
                                        <p className={`text-sm font-medium ${task.completed ? 'text-jalanea-400 line-through' : 'text-jalanea-900'}`}>
                                            {task.text}
                                        </p>
                                    </div>
                                    {!task.completed && (
                                        <button
                                            onClick={() => scheduleTaskAsBlock(task)}
                                            className="text-jalanea-300 hover:text-gold opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Add to Schedule"
                                        >
                                            <CalendarPlus size={18} />
                                        </button>
                                    )}
                                    <button onClick={() => deleteTask(task.id)} className="text-jalanea-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                            {tasks.length === 0 && (
                                <div className="text-center py-12 text-jalanea-400">
                                    <ListChecks size={48} className="mx-auto mb-4 opacity-20" />
                                    <p>No tasks yet. Add one above!</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            )}

            {/* --- MODALS (Add/Edit, Categories, Suggestions) --- */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-jalanea-950/50 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}></div>
                    <Card variant="solid-white" className="relative w-full max-w-sm z-10 shadow-2xl animate-in zoom-in-95 duration-200 p-5">
                        {/* Header - Compact */}
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">{editingBlockId ? 'Edit Block' : 'Add Block'}</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-jalanea-400 hover:text-jalanea-600">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-3">
                            {/* Title */}
                            <div>
                                <label className="block text-xs font-bold text-jalanea-500 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={newBlock.title || ''}
                                    onChange={e => setNewBlock({ ...newBlock, title: e.target.value })}
                                    placeholder="What's this block for?"
                                    className="w-full border border-jalanea-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-gold focus:border-gold outline-none"
                                />
                            </div>

                            {/* Details - Smaller */}
                            <div>
                                <label className="block text-xs font-bold text-jalanea-500 mb-1">Notes</label>
                                <textarea
                                    className="w-full border border-jalanea-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-gold focus:border-gold outline-none resize-none"
                                    placeholder="Optional notes..."
                                    rows={2}
                                    value={newBlock.description || ''}
                                    onChange={e => setNewBlock({ ...newBlock, description: e.target.value })}
                                />
                            </div>

                            {/* Time & Date - All in one row */}
                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <label className="block text-xs font-bold text-jalanea-500 mb-1">Start</label>
                                    <input
                                        type="time"
                                        value={newBlock.startTime}
                                        onChange={e => setNewBlock({ ...newBlock, startTime: e.target.value })}
                                        className="w-full border border-jalanea-200 rounded-lg px-2 py-1.5 text-sm focus:ring-1 focus:ring-gold outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-jalanea-500 mb-1">End</label>
                                    <input
                                        type="time"
                                        value={newBlock.endTime}
                                        onChange={e => setNewBlock({ ...newBlock, endTime: e.target.value })}
                                        className="w-full border border-jalanea-200 rounded-lg px-2 py-1.5 text-sm focus:ring-1 focus:ring-gold outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-jalanea-500 mb-1">Date</label>
                                    <input
                                        type="date"
                                        className="w-full border border-jalanea-200 rounded-lg px-2 py-1.5 text-sm focus:ring-1 focus:ring-gold outline-none"
                                        value={newBlock.date}
                                        onChange={e => setNewBlock({ ...newBlock, date: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Category - Horizontal scroll */}
                            <div>
                                <label className="block text-xs font-bold text-jalanea-500 mb-1.5">Category</label>
                                <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
                                    {categories.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setNewBlock({ ...newBlock, categoryId: cat.id })}
                                            className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold border transition-all
                                                ${newBlock.categoryId === cat.id
                                                    ? 'bg-jalanea-900 text-white border-jalanea-900'
                                                    : 'bg-white text-jalanea-600 border-jalanea-200 hover:border-jalanea-300'
                                                }`}
                                        >
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: newBlock.categoryId === cat.id ? 'white' : cat.color }}></div>
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Export - Only when editing, compact */}
                            {editingBlockId && (
                                <div className="flex gap-2 pt-1">
                                    <button
                                        onClick={() => exportToGoogleCalendar(newBlock as TimeBlock)}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-jalanea-50 rounded-lg text-xs font-medium text-jalanea-500 hover:bg-jalanea-100 transition-colors"
                                    >
                                        <ExternalLink size={12} />
                                        Google Cal
                                    </button>
                                    <button
                                        onClick={() => downloadICS(newBlock as TimeBlock)}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-jalanea-50 rounded-lg text-xs font-medium text-jalanea-500 hover:bg-jalanea-100 transition-colors"
                                    >
                                        <CalendarClock size={12} />
                                        Download .ics
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="flex gap-2 mt-4 pt-3 border-t border-jalanea-100">
                            {editingBlockId && (
                                <button
                                    onClick={() => handleDeleteBlock(editingBlockId)}
                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                            <Button fullWidth size="sm" onClick={handleSaveBlock}>
                                {editingBlockId ? 'Save Changes' : 'Add Block'}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* --- SUGGESTIONS MODAL (Ask JW) --- */}
            {isSuggestionsOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-jalanea-950/50 backdrop-blur-sm" onClick={() => setIsSuggestionsOpen(false)}></div>
                    <Card variant="solid-white" className="relative w-full max-w-lg z-10 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[85vh] overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center mb-4 shrink-0">
                            <h3 className="font-bold text-xl flex items-center gap-2">
                                <Sparkles className="text-gold" size={20} />
                                JW Suggestions
                            </h3>
                            <button onClick={() => setIsSuggestionsOpen(false)}><X size={20} /></button>
                        </div>

                        {/* JW Explanation */}
                        <div className="bg-gold/10 border border-gold/30 rounded-xl p-4 mb-4 shrink-0">
                            <p className="text-sm text-jalanea-600">
                                <span className="font-bold text-jalanea-900">JW</span> (Jalanea Works AI) suggests optimal blocks for
                                <span className="font-medium text-emerald-600"> wellness</span>,
                                <span className="font-medium text-blue-600"> learning</span>, and
                                <span className="font-medium text-violet-600"> career prep</span> based on your current schedule.
                            </p>
                        </div>

                        {/* Suggestions List */}
                        <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                            {suggestions.length === 0 ? (
                                <div className="text-center py-8 text-jalanea-400">
                                    <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                                    <p>Loading suggestions...</p>
                                </div>
                            ) : suggestions.map(s => {
                                const isSelected = selectedSuggestions.has(s.id);
                                const catColors: Record<string, string> = {
                                    'Wellness': '#10b981',
                                    'Learning': '#3b82f6',
                                    'Career': '#8b5cf6'
                                };
                                return (
                                    <div
                                        key={s.id}
                                        onClick={() => toggleSuggestion(s.id)}
                                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${isSelected
                                            ? 'border-gold bg-gold/5 shadow-sm'
                                            : 'border-jalanea-100 hover:border-jalanea-200'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center mt-0.5 ${isSelected ? 'bg-gold border-gold text-white' : 'border-jalanea-300'
                                                }`}>
                                                {isSelected && <CheckCircle2 size={14} />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-jalanea-900">{s.title}</span>
                                                    <span
                                                        className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full text-white"
                                                        style={{ backgroundColor: catColors[s.category] || '#64748b' }}
                                                    >
                                                        {s.category}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-jalanea-500 mb-2">{s.reasoning}</p>
                                                {isSelected && (
                                                    <div className="flex items-center gap-3 mt-2 pt-2 border-t border-jalanea-100">
                                                        <span className="text-xs font-bold text-jalanea-400">Duration:</span>
                                                        <input
                                                            type="range"
                                                            min="10"
                                                            max="60"
                                                            step="5"
                                                            value={customDurations[s.id] || s.suggestedDurationMinutes}
                                                            onChange={(e) => {
                                                                e.stopPropagation();
                                                                setCustomDurations(prev => ({ ...prev, [s.id]: parseInt(e.target.value) }));
                                                            }}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="flex-1 accent-gold"
                                                        />
                                                        <span className="text-sm font-bold text-gold min-w-[50px] text-right">
                                                            {customDurations[s.id] || s.suggestedDurationMinutes}m
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Add Button */}
                        <div className="pt-4 mt-4 border-t border-jalanea-100 shrink-0">
                            <Button
                                fullWidth
                                onClick={addSuggestionsToSchedule}
                                disabled={selectedSuggestions.size === 0}
                                icon={<CalendarPlus size={18} />}
                            >
                                Add {selectedSuggestions.size} Block{selectedSuggestions.size !== 1 ? 's' : ''} to Schedule
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* --- CATEGORY MODAL (Types) --- */}
            {isCategoryModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-jalanea-950/50 backdrop-blur-sm" onClick={() => setIsCategoryModalOpen(false)}></div>
                    <Card variant="solid-white" className="relative w-full max-w-md z-10 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[85vh] overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center mb-4 shrink-0">
                            <h3 className="font-bold text-xl flex items-center gap-2">
                                <Palette size={20} className="text-jalanea-600" />
                                Manage Categories
                            </h3>
                            <button onClick={() => setIsCategoryModalOpen(false)}><X size={20} /></button>
                        </div>

                        {/* Existing Categories */}
                        <div className="flex-1 overflow-y-auto space-y-2 mb-4 custom-scrollbar">
                            {categories.map(cat => (
                                <div key={cat.id} className="flex items-center gap-3 p-3 bg-jalanea-50 rounded-xl group">
                                    <div
                                        className="w-6 h-6 rounded-lg shrink-0 shadow-inner"
                                        style={{ backgroundColor: cat.color }}
                                    />
                                    <span className="flex-1 font-medium text-jalanea-900">{cat.label}</span>
                                    {!['work', 'personal', 'learning', 'wellness', 'interview'].includes(cat.id) && (
                                        <button
                                            onClick={() => deleteCategory(cat.id)}
                                            className="text-jalanea-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Add New Category */}
                        <div className="pt-4 border-t border-jalanea-100 shrink-0">
                            <p className="text-xs font-bold text-jalanea-400 uppercase mb-3">Add New Category</p>
                            <div className="flex gap-3">
                                <input
                                    type="color"
                                    value={newCatColor}
                                    onChange={(e) => setNewCatColor(e.target.value)}
                                    className="w-12 h-12 rounded-xl cursor-pointer border-2 border-jalanea-200"
                                />
                                <input
                                    type="text"
                                    placeholder="Category name..."
                                    value={newCatName}
                                    onChange={(e) => setNewCatName(e.target.value)}
                                    className="flex-1 border border-jalanea-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-gold"
                                    onKeyDown={(e) => e.key === 'Enter' && addCategory()}
                                />
                                <Button onClick={addCategory} disabled={!newCatName.trim()}>
                                    <Plus size={18} />
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* --- POWER HOUR SETUP MODAL --- */}
            <PowerHourSetup
                isOpen={showPowerHourSetup}
                onClose={() => setShowPowerHourSetup(false)}
                onSave={handleSavePowerHour}
                existingSchedule={schedule.filter(s => s.date === getTodayString()).map(s => ({
                    startTime: s.startTime,
                    endTime: s.endTime
                }))}
                existingSettings={powerHourSettings}
            />

            {/* --- NETWORKING HOUR SETUP MODAL --- */}
            <NetworkingHourSetup
                isOpen={showNetworkingHourSetup}
                onClose={() => setShowNetworkingHourSetup(false)}
                onSave={handleSaveNetworkingHour}
                existingSettings={networkingHourSettings}
            />

            {/* --- WORK SCHEDULE IMPORT MODAL --- */}
            <WorkScheduleImportModal
                isOpen={showScheduleImport}
                onClose={() => setShowScheduleImport(false)}
                onSave={handleSaveWorkSchedule}
                initialWorkSchedule={workSchedule}
                initialClassSchedule={classSchedule}
            />

            {/* --- FREE WINDOWS SUMMARY MODAL --- */}
            <FreeWindowsSummary
                isOpen={showFreeWindowsSummary}
                onClose={() => setShowFreeWindowsSummary(false)}
                windows={freeWindows}
                onSetPowerHour={handleSetPowerHourFromWindow}
            />
        </div>
    );
};
