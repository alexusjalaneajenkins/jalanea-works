import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import {
    Calendar, Clock, CheckCircle2, Zap,
    Briefcase, UserPlus, Plus, Trash2, ListChecks, X,
    CalendarClock, CalendarPlus, Sparkles, Circle, Loader2, Flame, Target, Play,
    Users, Linkedin, Upload, ChevronLeft, ChevronRight, Settings, Palette, ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { generateScheduleSuggestions, ScheduleSuggestion } from '../services/geminiService';
import { TaskCategory, TimeBlock, ToDoItem } from '../types';
import { PowerHourSetup, PowerHourSettings } from '../components/PowerHourSetup';
import { NetworkingHourSetup, NetworkingHourSettings } from '../components/NetworkingHourSetup';
import { WorkScheduleImportModal } from '../components/WorkScheduleImportModal';
import { FreeWindowsCard, FreeWindowsSummary } from '../components/FreeWindowsCard';
import { analyzeFreeWindows, FreeWindow } from '../services/scheduleAnalysisService';

// Animation variants
const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
};

const stagger = {
    visible: { transition: { staggerChildren: 0.08 } }
};

// --- Default Data ---
const DEFAULT_CATEGORIES: TaskCategory[] = [
    { id: 'work', label: 'Work', color: '#64748b' },
    { id: 'personal', label: 'Personal', color: '#f59e0b' },
    { id: 'learning', label: 'Learning', color: '#3b82f6' },
    { id: 'wellness', label: 'Wellness', color: '#10b981' },
    { id: 'interview', label: 'Interview Prep', color: '#8b5cf6' },
    { id: 'job_search', label: 'Power Hour', color: '#FFC425' },
    { id: 'networking', label: 'Networking', color: '#3B82F6' },
];

const getTodayString = () => new Date().toISOString().split('T')[0];

const INITIAL_SCHEDULE: TimeBlock[] = [
    { id: '1', date: getTodayString(), startTime: '07:00', endTime: '08:00', title: 'Wake Up / Routine', categoryId: 'personal', description: 'Morning hygiene and breakfast.' },
    { id: '2', date: getTodayString(), startTime: '09:00', endTime: '17:00', title: 'Work Shift', categoryId: 'work', description: 'Regular shift.' },
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
};

const formatDate = (date: Date): string => date.toISOString().split('T')[0];

const getDayName = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'short' });
};

const getDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
};

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

type CalendarViewMode = 'day' | 'multi' | 'month';

// --- Glass Card Component ---
const GlassCard: React.FC<{ children: React.ReactNode; className?: string; glow?: boolean }> = ({ children, className = '', glow }) => (
    <motion.div
        variants={fadeUp}
        className={`rounded-2xl bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-white/10 backdrop-blur-xl ${glow ? 'shadow-[0_0_30px_rgba(255,196,37,0.15)]' : ''} ${className}`}
    >
        {children}
    </motion.div>
);

// --- Glass Button Component ---
const GlassButton: React.FC<{
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'default' | 'gold' | 'outline';
    size?: 'sm' | 'md';
    icon?: React.ReactNode;
    disabled?: boolean;
    className?: string;
}> = ({ children, onClick, variant = 'default', size = 'md', icon, disabled, className = '' }) => {
    const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all';
    const sizeClasses = size === 'sm' ? 'px-3 py-2 text-sm' : 'px-4 py-2.5 text-sm';
    const variantClasses = {
        default: 'bg-slate-800/50 border border-white/10 text-slate-300 hover:bg-slate-700/50 hover:border-white/20',
        gold: 'bg-gold hover:bg-gold-light text-black font-bold shadow-[0_0_20px_rgba(255,196,37,0.3)]',
        outline: 'border border-white/20 text-slate-300 hover:border-gold/50 hover:text-gold'
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${sizeClasses} ${variantClasses[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        >
            {icon}
            {children}
        </motion.button>
    );
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

    const freeWindows = useMemo(() => {
        if (!workSchedule && !classSchedule) return [];
        return analyzeFreeWindows(workSchedule, classSchedule, []);
    }, [workSchedule, classSchedule]);

    const [currentDate, setCurrentDate] = useState(getTodayString());
    const [daysToShow, setDaysToShow] = useState(3);
    const [schedule, setSchedule] = useState<TimeBlock[]>(INITIAL_SCHEDULE);
    const [tasks, setTasks] = useState<ToDoItem[]>(INITIAL_TASKS);
    const [categories, setCategories] = useState<TaskCategory[]>(DEFAULT_CATEGORIES);

    // Load data from Firebase
    useEffect(() => {
        if (userProfile && !isInitialized) {
            if (userProfile.scheduleBlocks?.length > 0) setSchedule(userProfile.scheduleBlocks);
            if (userProfile.tasks?.length > 0) setTasks(userProfile.tasks);
            setIsInitialized(true);
        }
    }, [userProfile, isInitialized]);

    // Auto-save
    useEffect(() => {
        if (isInitialized && userProfile) {
            const saveTimer = setTimeout(() => {
                saveUserProfile({ scheduleBlocks: schedule, tasks }).catch(console.error);
            }, 1000);
            return () => clearTimeout(saveTimer);
        }
    }, [schedule, tasks, isInitialized]);

    // Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
    const [newBlock, setNewBlock] = useState<Partial<TimeBlock>>({
        date: getTodayString(), startTime: '09:00', endTime: '10:00', categoryId: 'work', description: ''
    });

    const [newCatName, setNewCatName] = useState('');
    const [newCatColor, setNewCatColor] = useState('#FFC425');
    const [newTaskText, setNewTaskText] = useState('');

    // Suggestions
    const [suggestions, setSuggestions] = useState<ScheduleSuggestion[]>([]);
    const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set());
    const [customDurations, setCustomDurations] = useState<Record<string, number>>({});

    // Computed values
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
            return { dateStr: formatDate(d), dayNum: d.getDate(), isCurrentMonth: d.getMonth() === month };
        });
    }, [currentDate]);

    const currentMonthLabel = useMemo(() => {
        return new Date(currentDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }, [currentDate]);

    // Navigation
    const handleNextPeriod = () => {
        if (calendarView === 'month') setCurrentDate(formatDate(addMonths(new Date(currentDate), 1)));
        else setCurrentDate(formatDate(addDays(new Date(currentDate), calendarView === 'day' ? 1 : daysToShow)));
    };

    const handlePrevPeriod = () => {
        if (calendarView === 'month') setCurrentDate(formatDate(addMonths(new Date(currentDate), -1)));
        else setCurrentDate(formatDate(addDays(new Date(currentDate), calendarView === 'day' ? -1 : -daysToShow)));
    };

    const handleToday = () => setCurrentDate(getTodayString());

    // Task Management
    const handleAddTask = () => {
        if (!newTaskText.trim()) return;
        setTasks(prev => [...prev, { id: Date.now().toString(), text: newTaskText, completed: false, priority: 'medium' }]);
        setNewTaskText('');
    };

    const toggleTask = (id: string) => setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    const deleteTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));

    const scheduleTaskAsBlock = (task: ToDoItem) => {
        const now = new Date();
        const startHour = now.getHours().toString().padStart(2, '0');
        const startMin = (Math.ceil(now.getMinutes() / 15) * 15 % 60).toString().padStart(2, '0');
        const endDate = new Date(now.getTime() + 30 * 60000);
        const endHour = endDate.getHours().toString().padStart(2, '0');
        const endMin = endDate.getMinutes().toString().padStart(2, '0');

        setSchedule(prev => [...prev, {
            id: Date.now().toString(),
            title: task.text,
            categoryId: 'work',
            startTime: `${startHour}:${startMin}`,
            endTime: `${endHour}:${endMin}`,
            date: getTodayString(),
            description: 'From To-Do List'
        }]);
        deleteTask(task.id);
        setViewMode('calendar');
    };

    // CRUD
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
        setNewBlock({ date: date || currentDate, startTime: '09:00', endTime: '10:00', categoryId: categories[0].id, title: '', description: '' });
        setIsAddModalOpen(true);
    };

    const openEditModal = (block: TimeBlock) => {
        setEditingBlockId(block.id);
        setNewBlock({ ...block });
        setIsAddModalOpen(true);
    };

    // Category Management
    const addCategory = () => {
        if (newCatName && newCatColor) {
            setCategories([...categories, { id: newCatName.toLowerCase().replace(/\s+/g, '-'), label: newCatName, color: newCatColor }]);
            setNewCatName('');
        }
    };

    const deleteCategory = (id: string) => setCategories(categories.filter(c => c.id !== id));

    // AI Suggestions
    const handleGetSuggestions = async () => {
        setIsLoadingSuggestions(true);
        const results = await generateScheduleSuggestions(schedule.filter(s => s.date === getTodayString()));
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

            const endTime = `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;
            const catId = s.category === 'Career' ? 'work' : s.category === 'Learning' ? 'learning' : s.category === 'Wellness' ? 'wellness' : 'personal';

            newBlocks.push({
                id: Date.now().toString() + Math.random().toString(),
                title: s.title,
                categoryId: catId,
                startTime: currentTime,
                endTime,
                date: getTodayString(),
                description: s.reasoning,
                isAiSuggested: true
            });
            currentTime = endTime;
        });

        setSchedule(prev => [...prev, ...newBlocks]);
        setIsSuggestionsOpen(false);
    };

    const getCatColor = (catId: string) => categories.find(c => c.id === catId)?.color || '#cbd5e1';

    // Power Hour
    const handleSavePowerHour = async (settings: PowerHourSettings) => {
        await saveUserProfile({ powerHour: settings });
        const today = new Date();
        const newBlocks: TimeBlock[] = [];
        const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const dateStr = formatDate(date);
            const dayId = dayNames[date.getDay()];

            if (settings.scheduledDays.includes(dayId)) {
                const existingBlock = schedule.find(b => b.date === dateStr && b.categoryId === 'job_search');
                if (!existingBlock) {
                    const [hours, mins] = settings.scheduledTime.split(':').map(Number);
                    newBlocks.push({
                        id: `ph-${dateStr}`,
                        title: 'Power Hour',
                        categoryId: 'job_search',
                        startTime: settings.scheduledTime,
                        endTime: `${(hours + 1).toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`,
                        date: dateStr,
                        description: `Apply to ${settings.dailyGoal} jobs`,
                        isPowerHour: true
                    });
                }
            }
        }
        if (newBlocks.length > 0) setSchedule(prev => [...prev, ...newBlocks]);
    };

    const todayDayId = getDayId();
    const isPowerHourToday = powerHourSettings?.scheduledDays?.includes(todayDayId);
    const isPowerHourNow = powerHourSettings && isPowerHourActive(powerHourSettings.scheduledTime);

    // Networking Hour
    const handleSaveNetworkingHour = async (settings: NetworkingHourSettings) => {
        await saveUserProfile({ networkingHour: settings });
        const today = new Date();
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const targetDayIndex = dayNames.indexOf(settings.scheduledDay);
        const newBlocks: TimeBlock[] = [];

        for (let week = 0; week < 4; week++) {
            const date = new Date(today);
            let daysUntilTarget = targetDayIndex - date.getDay();
            if (daysUntilTarget < 0) daysUntilTarget += 7;
            date.setDate(date.getDate() + daysUntilTarget + (week * 7));
            const dateStr = formatDate(date);

            const existingBlock = schedule.find(b => b.date === dateStr && b.categoryId === 'networking');
            if (!existingBlock) {
                const [hours, mins] = settings.scheduledTime.split(':').map(Number);
                newBlocks.push({
                    id: `net-${dateStr}`,
                    title: 'Networking Hour',
                    categoryId: 'networking',
                    startTime: settings.scheduledTime,
                    endTime: `${(hours + 1).toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`,
                    date: dateStr,
                    description: `Connect with ${settings.weeklyGoal} people`,
                    isNetworkingHour: true
                });
            }
        }
        if (newBlocks.length > 0) setSchedule(prev => [...prev, ...newBlocks]);
    };

    const todayFullDayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date().getDay()];
    const isNetworkingToday = networkingHourSettings?.scheduledDay === todayFullDayName;
    const isNetworkingNow = networkingHourSettings && isNetworkingToday && isPowerHourActive(networkingHourSettings.scheduledTime);

    // Work Schedule Import
    const handleSaveWorkSchedule = async (data: any) => {
        await saveUserProfile({ workSchedule: data.workSchedule, classSchedule: data.classSchedule });

        if (data.workSchedule?.shifts) {
            const today = new Date();
            const newBlocks: TimeBlock[] = [];
            const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

            for (let i = 0; i < 14; i++) {
                const date = new Date(today);
                date.setDate(today.getDate() + i);
                const dateStr = formatDate(date);
                const dayName = dayNames[date.getDay()];

                data.workSchedule.shifts
                    .filter((shift: any) => shift.day.toLowerCase() === dayName)
                    .forEach((shift: any) => {
                        if (!schedule.find(b => b.date === dateStr && b.categoryId === 'work' && b.startTime === shift.startTime)) {
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
            if (newBlocks.length > 0) setSchedule(prev => [...prev, ...newBlocks]);
        }

        if (data.classSchedule) {
            const today = new Date();
            const newBlocks: TimeBlock[] = [];
            const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

            for (let i = 0; i < 14; i++) {
                const date = new Date(today);
                date.setDate(today.getDate() + i);
                const dateStr = formatDate(date);
                const dayName = dayNames[date.getDay()];

                data.classSchedule
                    .filter((cls: any) => cls.days.map((d: string) => d.toLowerCase()).includes(dayName))
                    .forEach((cls: any) => {
                        if (!schedule.find(b => b.date === dateStr && b.categoryId === 'learning' && b.title === cls.className)) {
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
            if (newBlocks.length > 0) setSchedule(prev => [...prev, ...newBlocks]);
        }

        setShowFreeWindowsSummary(true);
    };

    const handleSetPowerHourFromWindow = (window: FreeWindow) => {
        const dayMap: Record<string, string> = {
            'monday': 'mon', 'tuesday': 'tue', 'wednesday': 'wed', 'thursday': 'thu',
            'friday': 'fri', 'saturday': 'sat', 'sunday': 'sun'
        };
        handleSavePowerHour({
            scheduledTime: window.startTime,
            scheduledDays: [dayMap[window.day]],
            currentStreak: 0, longestStreak: 0, lastCompletedDate: null, totalPowerHours: 0, dailyGoal: 3
        });
        setShowFreeWindowsSummary(false);
    };

    // Calendar Export
    const exportToGoogleCalendar = (block: TimeBlock) => {
        const dateStr = block.date.replace(/-/g, '');
        const startStr = `${dateStr}T${block.startTime.replace(':', '')}00`;
        const endStr = `${dateStr}T${block.endTime.replace(':', '')}00`;
        window.open(`https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(block.title)}&dates=${startStr}/${endStr}&details=${encodeURIComponent(block.description || '')}`, '_blank');
    };

    const downloadICS = (block: TimeBlock) => {
        const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:${block.date.replace(/-/g, '')}T${block.startTime.replace(':', '')}00\nDTEND:${block.date.replace(/-/g, '')}T${block.endTime.replace(':', '')}00\nSUMMARY:${block.title}\nEND:VEVENT\nEND:VCALENDAR`;
        const blob = new Blob([icsContent], { type: 'text/calendar' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${block.title.replace(/[^a-z0-9]/gi, '_')}.ics`;
        a.click();
    };

    return (
        <div className="min-h-screen bg-[#020617] pb-16">
            {/* Background */}
            <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-[#020617] to-slate-900 pointer-events-none" />
            <div className="fixed top-0 right-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
            <div className="fixed bottom-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={stagger}
                className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6"
            >
                {/* Header */}
                <motion.div variants={fadeUp} className="flex flex-col lg:flex-row justify-between lg:items-end gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white">Smart Schedule</h1>
                        <div className="flex flex-wrap items-center gap-3 mt-3">
                            {/* View Toggle */}
                            <div className="flex bg-slate-800/50 rounded-xl border border-white/10 p-1">
                                {['calendar', 'tasks'].map((mode) => (
                                    <button
                                        key={mode}
                                        onClick={() => setViewMode(mode as any)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === mode ? 'bg-gold text-black' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        {mode === 'calendar' ? 'Calendar' : 'To-Do'}
                                    </button>
                                ))}
                            </div>

                            {viewMode === 'calendar' && (
                                <div className="flex bg-slate-800/50 rounded-xl border border-white/10 p-1">
                                    {['day', 'multi', 'month'].map((mode) => (
                                        <button
                                            key={mode}
                                            onClick={() => setCalendarView(mode as CalendarViewMode)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium uppercase tracking-wide transition-all ${calendarView === mode ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                                        >
                                            {mode}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {viewMode === 'calendar' && (
                        <div className="flex flex-wrap gap-3 items-center">
                            {/* Navigation */}
                            <div className="flex items-center bg-slate-800/50 rounded-xl border border-white/10 p-1">
                                <button onClick={handlePrevPeriod} className="p-2 hover:bg-slate-700/50 rounded-lg text-slate-400 hover:text-white"><ChevronLeft size={20} /></button>
                                <div className="px-4 text-center min-w-[120px]">
                                    <span className="text-xs text-slate-500 block">
                                        {calendarView === 'day' ? 'Day' : calendarView === 'multi' ? `${daysToShow} Days` : 'Month'}
                                    </span>
                                    <span className="text-sm font-medium text-white">
                                        {calendarView === 'day' ? getDisplayDate(currentDate) : currentMonthLabel}
                                    </span>
                                </div>
                                <button onClick={handleNextPeriod} className="p-2 hover:bg-slate-700/50 rounded-lg text-slate-400 hover:text-white"><ChevronRight size={20} /></button>
                            </div>

                            <div className="flex gap-2">
                                <GlassButton size="sm" onClick={handleToday}>Today</GlassButton>
                                <GlassButton size="sm" onClick={() => setIsCategoryModalOpen(true)} icon={<Settings size={16} />}>Types</GlassButton>
                                <GlassButton
                                    size="sm"
                                    onClick={() => setShowScheduleImport(true)}
                                    icon={<Upload size={16} />}
                                    className={workSchedule || classSchedule ? 'border-green-500/50 text-green-400' : ''}
                                >
                                    Import
                                </GlassButton>
                                <GlassButton
                                    size="sm"
                                    variant="gold"
                                    onClick={handleGetSuggestions}
                                    disabled={isLoadingSuggestions}
                                    icon={isLoadingSuggestions ? <Sparkles className="animate-spin" size={16} /> : <Sparkles size={16} />}
                                >
                                    Ask JW
                                </GlassButton>
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Power Hour Card */}
                {viewMode === 'calendar' && (
                    <motion.div variants={fadeUp}>
                        <GlassCard glow={isPowerHourNow} className={`p-4 ${isPowerHourNow ? 'bg-gradient-to-r from-gold/20 to-amber-500/10 border-gold/30' : ''}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2.5 rounded-xl ${isPowerHourNow ? 'bg-gold/30' : 'bg-gold/10'} border border-gold/30`}>
                                        <Zap size={20} className="text-gold" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-white">{isPowerHourNow ? "Power Hour Active!" : "Today's Power Hour"}</h3>
                                            {powerHourSettings?.currentStreak > 0 && (
                                                <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                                                    <Flame size={12} />{powerHourSettings.currentStreak}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-400">
                                            {powerHourSettings && isPowerHourToday
                                                ? `${formatPowerHourTime(powerHourSettings.scheduledTime)} • Goal: ${powerHourSettings.dailyGoal} applications`
                                                : powerHourSettings
                                                    ? 'Not scheduled today'
                                                    : 'Set up your daily job search routine'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {isPowerHourNow ? (
                                        <GlassButton variant="gold" size="sm" onClick={() => navigate('/jobs')} icon={<Play size={14} />}>
                                            Start Applying
                                        </GlassButton>
                                    ) : powerHourSettings ? (
                                        <>
                                            <GlassButton size="sm" onClick={() => setShowPowerHourSetup(true)}>Reschedule</GlassButton>
                                            {isPowerHourToday && (
                                                <GlassButton variant="gold" size="sm" onClick={() => navigate('/jobs')} icon={<Target size={14} />}>
                                                    Start Now
                                                </GlassButton>
                                            )}
                                        </>
                                    ) : (
                                        <GlassButton variant="gold" size="sm" onClick={() => setShowPowerHourSetup(true)} icon={<Zap size={14} />}>
                                            Set Up Power Hour
                                        </GlassButton>
                                    )}
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                )}

                {/* Networking Hour Card */}
                {viewMode === 'calendar' && (
                    <motion.div variants={fadeUp}>
                        <GlassCard glow={isNetworkingNow} className={`p-4 ${isNetworkingNow ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/10 border-blue-500/30' : ''}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2.5 rounded-xl ${isNetworkingNow ? 'bg-blue-500/30' : 'bg-blue-500/10'} border border-blue-500/30`}>
                                        <Users size={20} className="text-blue-400" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-white">{isNetworkingNow ? "Networking Hour Active!" : "Weekly Networking Hour"}</h3>
                                            {networkingHourSettings?.currentWeekConnections > 0 && (
                                                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                                    {networkingHourSettings.currentWeekConnections}/{networkingHourSettings.weeklyGoal}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-400">
                                            {networkingHourSettings
                                                ? `${networkingHourSettings.scheduledDay.charAt(0).toUpperCase() + networkingHourSettings.scheduledDay.slice(1)} at ${formatPowerHourTime(networkingHourSettings.scheduledTime)}`
                                                : 'Set up weekly networking time'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {isNetworkingNow ? (
                                        <GlassButton size="sm" onClick={() => window.open('https://linkedin.com', '_blank')} icon={<Linkedin size={14} />} className="bg-blue-500 text-white border-blue-400">
                                            Open LinkedIn
                                        </GlassButton>
                                    ) : networkingHourSettings ? (
                                        <>
                                            <GlassButton size="sm" onClick={() => setShowNetworkingHourSetup(true)}>Reschedule</GlassButton>
                                            {isNetworkingToday && (
                                                <GlassButton size="sm" onClick={() => window.open('https://linkedin.com', '_blank')} icon={<Linkedin size={14} />} className="bg-blue-500 text-white border-blue-400">
                                                    Start
                                                </GlassButton>
                                            )}
                                        </>
                                    ) : (
                                        <GlassButton size="sm" onClick={() => setShowNetworkingHourSetup(true)} icon={<Users size={14} />} className="bg-blue-500 text-white border-blue-400">
                                            Set Up Networking Hour
                                        </GlassButton>
                                    )}
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                )}

                {/* Free Windows */}
                {viewMode === 'calendar' && freeWindows.length > 0 && (
                    <FreeWindowsCard
                        windows={freeWindows}
                        onSetPowerHour={handleSetPowerHourFromWindow}
                        onOptimize={() => setShowPowerHourSetup(true)}
                    />
                )}

                {/* Month View */}
                {viewMode === 'calendar' && calendarView === 'month' && (
                    <motion.div variants={fadeUp}>
                        <GlassCard className="overflow-hidden">
                            <div className="grid grid-cols-7 border-b border-white/10 bg-slate-800/30">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                    <div key={d} className="p-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wide">{d}</div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 grid-rows-6">
                                {monthGridDays.map((cell, idx) => {
                                    const dayBlocks = schedule.filter(b => b.date === cell.dateStr);
                                    const isToday = cell.dateStr === getTodayString();

                                    return (
                                        <div
                                            key={idx}
                                            onClick={() => { setCurrentDate(cell.dateStr); setCalendarView('day'); }}
                                            className={`border-b border-r border-white/5 p-2 min-h-[80px] transition-colors cursor-pointer hover:bg-slate-800/30 ${!cell.isCurrentMonth ? 'opacity-30' : ''}`}
                                        >
                                            <span className={`text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-gold text-black' : 'text-slate-400'}`}>
                                                {cell.dayNum}
                                            </span>
                                            <div className="mt-1 space-y-1">
                                                {dayBlocks.slice(0, 2).map(block => (
                                                    <div key={block.id} className="flex items-center gap-1">
                                                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getCatColor(block.categoryId) }} />
                                                        <span className="text-[10px] text-slate-500 truncate">{block.title}</span>
                                                    </div>
                                                ))}
                                                {dayBlocks.length > 2 && <span className="text-[10px] text-slate-600">+{dayBlocks.length - 2}</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </GlassCard>
                    </motion.div>
                )}

                {/* Day/Multi View */}
                {viewMode === 'calendar' && (calendarView === 'multi' || calendarView === 'day') && (
                    <motion.div variants={fadeUp}>
                        <GlassCard className="overflow-hidden">
                            <div
                                className="grid divide-x divide-white/5"
                                style={{ gridTemplateColumns: `repeat(${visibleDays.length}, minmax(200px, 1fr))` }}
                            >
                                {visibleDays.map((dayDate) => {
                                    const isToday = dayDate === getTodayString();
                                    const dayBlocks = schedule.filter(b => b.date === dayDate).sort((a, b) => a.startTime.localeCompare(b.startTime));

                                    return (
                                        <div key={dayDate} className="flex flex-col">
                                            <div className={`p-4 text-center border-b border-white/5 ${isToday ? 'bg-gold/10' : ''}`}>
                                                <div className="text-xs font-medium text-slate-500 uppercase mb-1">{getDayName(dayDate)}</div>
                                                <div className={`text-xl font-bold ${isToday ? 'text-gold' : 'text-white'}`}>{getDisplayDate(dayDate)}</div>
                                            </div>

                                            <div className="flex-1 p-3 space-y-2 min-h-[400px] group/col">
                                                {dayBlocks.map(block => {
                                                    const isPowerHourBlock = block.categoryId === 'job_search' || block.isPowerHour;
                                                    const isNetworkingBlock = block.categoryId === 'networking' || block.isNetworkingHour;

                                                    return (
                                                        <motion.div
                                                            key={block.id}
                                                            whileHover={{ scale: 1.02 }}
                                                            onClick={() => openEditModal(block)}
                                                            className={`p-3 rounded-xl border cursor-pointer transition-all ${
                                                                isPowerHourBlock
                                                                    ? 'bg-gradient-to-r from-gold/10 to-amber-500/5 border-gold/30 hover:border-gold/50'
                                                                    : isNetworkingBlock
                                                                        ? 'bg-gradient-to-r from-blue-500/10 to-indigo-500/5 border-blue-500/30 hover:border-blue-500/50'
                                                                        : 'bg-slate-800/30 border-white/5 hover:border-white/20'
                                                            }`}
                                                            style={{ borderLeftWidth: '4px', borderLeftColor: getCatColor(block.categoryId) }}
                                                        >
                                                            <div className="flex justify-between items-start">
                                                                <span className="text-xs font-medium text-slate-500">{block.startTime}</span>
                                                                <div className="flex items-center gap-1">
                                                                    {isPowerHourBlock && <Zap size={12} className="text-gold" />}
                                                                    {isNetworkingBlock && <Users size={12} className="text-blue-400" />}
                                                                    {block.isAiSuggested && <Sparkles size={10} className="text-gold" />}
                                                                </div>
                                                            </div>
                                                            <div className={`font-medium text-sm mt-1 ${
                                                                isPowerHourBlock ? 'text-gold' : isNetworkingBlock ? 'text-blue-400' : 'text-white'
                                                            }`}>{block.title}</div>
                                                            {block.description && <div className="text-xs text-slate-500 mt-1 line-clamp-1">{block.description}</div>}
                                                        </motion.div>
                                                    );
                                                })}

                                                <button
                                                    onClick={() => openAddModal(dayDate)}
                                                    className="w-full py-3 border-2 border-dashed border-slate-700 rounded-xl text-slate-600 font-medium text-sm hover:border-gold/50 hover:text-gold transition-all opacity-0 group-hover/col:opacity-100"
                                                >
                                                    <Plus size={16} className="mx-auto" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </GlassCard>
                    </motion.div>
                )}

                {/* Tasks View */}
                {viewMode === 'tasks' && (
                    <motion.div variants={fadeUp} className="max-w-3xl mx-auto">
                        <GlassCard className="overflow-hidden">
                            <div className="p-4 border-b border-white/10 flex gap-3">
                                <input
                                    className="flex-1 bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-gold/50 text-white placeholder:text-slate-500"
                                    placeholder="Add a new task..."
                                    value={newTaskText}
                                    onChange={(e) => setNewTaskText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                                />
                                <GlassButton variant="gold" onClick={handleAddTask} icon={<Plus size={18} />}>Add</GlassButton>
                            </div>
                            <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
                                {tasks.map(task => (
                                    <motion.div
                                        key={task.id}
                                        variants={fadeUp}
                                        className="group flex items-center gap-3 p-4 bg-slate-800/30 border border-white/5 rounded-xl hover:border-white/20 transition-all"
                                    >
                                        <button
                                            onClick={() => toggleTask(task.id)}
                                            className={`shrink-0 ${task.completed ? 'text-green-400' : 'text-slate-600 hover:text-gold'}`}
                                        >
                                            {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                                        </button>
                                        <p className={`flex-1 text-sm ${task.completed ? 'text-slate-600 line-through' : 'text-white'}`}>{task.text}</p>
                                        {!task.completed && (
                                            <button
                                                onClick={() => scheduleTaskAsBlock(task)}
                                                className="text-slate-600 hover:text-gold opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <CalendarPlus size={18} />
                                            </button>
                                        )}
                                        <button onClick={() => deleteTask(task.id)} className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Trash2 size={18} />
                                        </button>
                                    </motion.div>
                                ))}
                                {tasks.length === 0 && (
                                    <div className="text-center py-12 text-slate-600">
                                        <ListChecks size={48} className="mx-auto mb-4 opacity-20" />
                                        <p>No tasks yet. Add one above!</p>
                                    </div>
                                )}
                            </div>
                        </GlassCard>
                    </motion.div>
                )}

                {/* Add/Edit Modal */}
                <AnimatePresence>
                    {isAddModalOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        >
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="relative w-full max-w-md z-10"
                            >
                                <GlassCard className="p-5">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold text-lg text-white">{editingBlockId ? 'Edit Block' : 'Add Block'}</h3>
                                        <button onClick={() => setIsAddModalOpen(false)} className="text-slate-500 hover:text-white"><X size={18} /></button>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 mb-1">Title</label>
                                            <input
                                                type="text"
                                                value={newBlock.title || ''}
                                                onChange={e => setNewBlock({ ...newBlock, title: e.target.value })}
                                                placeholder="What's this block for?"
                                                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-gold/50"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 mb-1">Notes</label>
                                            <textarea
                                                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-gold/50 resize-none"
                                                placeholder="Optional notes..."
                                                rows={2}
                                                value={newBlock.description || ''}
                                                onChange={e => setNewBlock({ ...newBlock, description: e.target.value })}
                                            />
                                        </div>

                                        <div className="grid grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 mb-1">Start</label>
                                                <input
                                                    type="time"
                                                    value={newBlock.startTime}
                                                    onChange={e => setNewBlock({ ...newBlock, startTime: e.target.value })}
                                                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-gold/50"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 mb-1">End</label>
                                                <input
                                                    type="time"
                                                    value={newBlock.endTime}
                                                    onChange={e => setNewBlock({ ...newBlock, endTime: e.target.value })}
                                                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-gold/50"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 mb-1">Date</label>
                                                <input
                                                    type="date"
                                                    value={newBlock.date}
                                                    onChange={e => setNewBlock({ ...newBlock, date: e.target.value })}
                                                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-gold/50"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 mb-2">Category</label>
                                            <div className="flex gap-2 flex-wrap">
                                                {categories.map(cat => (
                                                    <button
                                                        key={cat.id}
                                                        onClick={() => setNewBlock({ ...newBlock, categoryId: cat.id })}
                                                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                                                            newBlock.categoryId === cat.id
                                                                ? 'bg-white/10 border-white/20 text-white'
                                                                : 'bg-slate-800/30 border-white/5 text-slate-400 hover:border-white/20'
                                                        }`}
                                                    >
                                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                                                        {cat.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {editingBlockId && (
                                            <div className="flex gap-2 pt-2">
                                                <button
                                                    onClick={() => exportToGoogleCalendar(newBlock as TimeBlock)}
                                                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-800/30 rounded-xl text-xs text-slate-400 hover:text-white transition-colors"
                                                >
                                                    <ExternalLink size={12} /> Google Cal
                                                </button>
                                                <button
                                                    onClick={() => downloadICS(newBlock as TimeBlock)}
                                                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-800/30 rounded-xl text-xs text-slate-400 hover:text-white transition-colors"
                                                >
                                                    <CalendarClock size={12} /> Download .ics
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2 mt-5 pt-4 border-t border-white/10">
                                        {editingBlockId && (
                                            <button
                                                onClick={() => handleDeleteBlock(editingBlockId)}
                                                className="p-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                        <GlassButton variant="gold" className="flex-1" onClick={handleSaveBlock}>
                                            {editingBlockId ? 'Save Changes' : 'Add Block'}
                                        </GlassButton>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Suggestions Modal */}
                <AnimatePresence>
                    {isSuggestionsOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        >
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSuggestionsOpen(false)} />
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="relative w-full max-w-lg z-10 max-h-[85vh] overflow-hidden"
                            >
                                <GlassCard className="p-5 flex flex-col max-h-[85vh]">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold text-xl text-white flex items-center gap-2">
                                            <Sparkles className="text-gold" size={20} /> JW Suggestions
                                        </h3>
                                        <button onClick={() => setIsSuggestionsOpen(false)} className="text-slate-500 hover:text-white"><X size={20} /></button>
                                    </div>

                                    <div className="p-4 bg-gold/10 border border-gold/30 rounded-xl mb-4">
                                        <p className="text-sm text-slate-300">
                                            <span className="font-bold text-gold">JW</span> suggests optimal blocks based on your schedule.
                                        </p>
                                    </div>

                                    <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                                        {suggestions.length === 0 ? (
                                            <div className="text-center py-8 text-slate-500">
                                                <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                                                <p>Loading suggestions...</p>
                                            </div>
                                        ) : suggestions.map(s => {
                                            const isSelected = selectedSuggestions.has(s.id);
                                            const catColors: Record<string, string> = { 'Wellness': '#10b981', 'Learning': '#3b82f6', 'Career': '#8b5cf6' };

                                            return (
                                                <div
                                                    key={s.id}
                                                    onClick={() => toggleSuggestion(s.id)}
                                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                                        isSelected ? 'border-gold bg-gold/5' : 'border-white/10 hover:border-white/20'
                                                    }`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className={`shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center mt-0.5 ${
                                                            isSelected ? 'bg-gold border-gold text-black' : 'border-slate-600'
                                                        }`}>
                                                            {isSelected && <CheckCircle2 size={14} />}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="font-medium text-white">{s.title}</span>
                                                                <span
                                                                    className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full text-white"
                                                                    style={{ backgroundColor: catColors[s.category] || '#64748b' }}
                                                                >
                                                                    {s.category}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-slate-500">{s.reasoning}</p>
                                                            {isSelected && (
                                                                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/10">
                                                                    <span className="text-xs font-medium text-slate-500">Duration:</span>
                                                                    <input
                                                                        type="range"
                                                                        min="10"
                                                                        max="60"
                                                                        step="5"
                                                                        value={customDurations[s.id] || s.suggestedDurationMinutes}
                                                                        onChange={(e) => { e.stopPropagation(); setCustomDurations(prev => ({ ...prev, [s.id]: parseInt(e.target.value) })); }}
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        className="flex-1 accent-gold"
                                                                    />
                                                                    <span className="text-sm font-bold text-gold min-w-[40px] text-right">
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

                                    <div className="pt-4 mt-4 border-t border-white/10">
                                        <GlassButton
                                            variant="gold"
                                            className="w-full"
                                            onClick={addSuggestionsToSchedule}
                                            disabled={selectedSuggestions.size === 0}
                                            icon={<CalendarPlus size={18} />}
                                        >
                                            Add {selectedSuggestions.size} Block{selectedSuggestions.size !== 1 ? 's' : ''} to Schedule
                                        </GlassButton>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Category Modal */}
                <AnimatePresence>
                    {isCategoryModalOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        >
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCategoryModalOpen(false)} />
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="relative w-full max-w-md z-10"
                            >
                                <GlassCard className="p-5">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold text-xl text-white flex items-center gap-2">
                                            <Palette size={20} className="text-slate-400" /> Manage Categories
                                        </h3>
                                        <button onClick={() => setIsCategoryModalOpen(false)} className="text-slate-500 hover:text-white"><X size={20} /></button>
                                    </div>

                                    <div className="space-y-2 mb-4 max-h-[40vh] overflow-y-auto">
                                        {categories.map(cat => (
                                            <div key={cat.id} className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-xl group">
                                                <div className="w-6 h-6 rounded-lg" style={{ backgroundColor: cat.color }} />
                                                <span className="flex-1 font-medium text-white">{cat.label}</span>
                                                {!['work', 'personal', 'learning', 'wellness', 'interview', 'job_search', 'networking'].includes(cat.id) && (
                                                    <button onClick={() => deleteCategory(cat.id)} className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100">
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="pt-4 border-t border-white/10">
                                        <p className="text-xs font-medium text-slate-500 uppercase mb-3">Add New Category</p>
                                        <div className="flex gap-3">
                                            <input
                                                type="color"
                                                value={newCatColor}
                                                onChange={(e) => setNewCatColor(e.target.value)}
                                                className="w-12 h-12 rounded-xl cursor-pointer bg-transparent border border-white/10"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Category name..."
                                                value={newCatName}
                                                onChange={(e) => setNewCatName(e.target.value)}
                                                className="flex-1 bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-gold/50"
                                                onKeyDown={(e) => e.key === 'Enter' && addCategory()}
                                            />
                                            <GlassButton onClick={addCategory} disabled={!newCatName.trim()} icon={<Plus size={18} />} />
                                        </div>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Power Hour Setup */}
                <PowerHourSetup
                    isOpen={showPowerHourSetup}
                    onClose={() => setShowPowerHourSetup(false)}
                    onSave={handleSavePowerHour}
                    existingSchedule={schedule.filter(s => s.date === getTodayString()).map(s => ({ startTime: s.startTime, endTime: s.endTime }))}
                    existingSettings={powerHourSettings}
                />

                {/* Networking Hour Setup */}
                <NetworkingHourSetup
                    isOpen={showNetworkingHourSetup}
                    onClose={() => setShowNetworkingHourSetup(false)}
                    onSave={handleSaveNetworkingHour}
                    existingSettings={networkingHourSettings}
                />

                {/* Work Schedule Import */}
                <WorkScheduleImportModal
                    isOpen={showScheduleImport}
                    onClose={() => setShowScheduleImport(false)}
                    onSave={handleSaveWorkSchedule}
                    initialWorkSchedule={workSchedule}
                    initialClassSchedule={classSchedule}
                />

                {/* Free Windows Summary */}
                <FreeWindowsSummary
                    isOpen={showFreeWindowsSummary}
                    onClose={() => setShowFreeWindowsSummary(false)}
                    windows={freeWindows}
                    onSetPowerHour={handleSetPowerHourFromWindow}
                />
            </motion.div>
        </div>
    );
};
