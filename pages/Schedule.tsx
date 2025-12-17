
import React, { useState, useMemo } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { 
    Calendar, Clock, CheckCircle2, RefreshCw, Zap, 
    Briefcase, BookOpen, UserPlus, PenTool, Coffee, ExternalLink,
    Mail, CalendarClock, Plus, Trash2, ListChecks, ArrowRight, X, Edit2, Link as LinkIcon, CalendarPlus,
    Battery, BatteryCharging, Moon, Sun, Activity, Sparkles, Brain, Heart, CheckSquare, Square,
    ChevronLeft, ChevronRight, Settings, Palette, AlignLeft, Circle
} from 'lucide-react';
import { generateWellnessInsights, generateScheduleSuggestions, WellnessInsight, ScheduleSuggestion } from '../services/geminiService';
import { MOCK_PROFILE } from './Profile';
import { TaskCategory, TimeBlock, ToDoItem } from '../types';

// --- Default Data ---

const DEFAULT_CATEGORIES: TaskCategory[] = [
    { id: 'work', label: 'Work', color: '#64748b' }, // slate-500
    { id: 'personal', label: 'Personal', color: '#f59e0b' }, // amber-500
    { id: 'learning', label: 'Learning', color: '#3b82f6' }, // blue-500
    { id: 'wellness', label: 'Wellness', color: '#10b981' }, // emerald-500
    { id: 'interview', label: 'Interview Prep', color: '#8b5cf6' }, // violet-500
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

export const Schedule: React.FC = () => {
    const [viewMode, setViewMode] = useState<'calendar' | 'tasks'>('calendar');
    const [calendarView, setCalendarView] = useState<CalendarViewMode>('multi');
    
    // Calendar View State
    const [currentDate, setCurrentDate] = useState(getTodayString());
    const [daysToShow, setDaysToShow] = useState(3);
    
    // Data State
    const [schedule, setSchedule] = useState<TimeBlock[]>(INITIAL_SCHEDULE);
    const [tasks, setTasks] = useState<ToDoItem[]>(INITIAL_TASKS);
    const [categories, setCategories] = useState<TaskCategory[]>(DEFAULT_CATEGORIES);

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
        if(newCatName && newCatColor) {
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
        const todayBlocks = schedule.filter(s => s.date === getTodayString()).sort((a,b) => a.endTime.localeCompare(b.endTime));
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
                            <button onClick={handlePrevPeriod} className="p-2 hover:bg-jalanea-50 rounded-lg text-jalanea-600"><ChevronLeft size={20}/></button>
                            <div className="px-4 text-center min-w-[140px] flex-1">
                                <span className="block text-xs font-bold text-jalanea-400 uppercase">
                                    {calendarView === 'day' ? 'Current Day' : calendarView === 'multi' ? `${daysToShow} Days View` : 'Current Month'}
                                </span>
                                <span className="block text-sm font-bold text-jalanea-900 whitespace-nowrap">
                                    {calendarView === 'day' ? getDisplayDate(currentDate) : currentMonthLabel}
                                </span>
                            </div>
                            <button onClick={handleNextPeriod} className="p-2 hover:bg-jalanea-50 rounded-lg text-jalanea-600"><ChevronRight size={20}/></button>
                        </div>
                        
                        <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={handleToday}>Today</Button>
                            <Button size="sm" variant="ghost" onClick={() => setIsCategoryModalOpen(true)} icon={<Settings size={16}/>}>Types</Button>
                            <Button 
                                size="sm" 
                                variant="glass-dark" 
                                className="bg-jalanea-900 text-gold border-jalanea-800 hover:bg-jalanea-800"
                                icon={isLoadingSuggestions ? <Sparkles className="animate-spin" size={16}/> : <Sparkles size={16}/>}
                                onClick={handleGetSuggestions}
                                disabled={isLoadingSuggestions}
                            >
                                Ask JW
                            </Button>
                        </div>
                    </div>
                )}
            </div>

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
                                .sort((a,b) => a.startTime.localeCompare(b.startTime));

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
                                            return (
                                                <div 
                                                    key={block.id}
                                                    onClick={() => openEditModal(block)}
                                                    className="p-3 rounded-xl border border-black/5 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden group"
                                                    style={{ borderLeft: `4px solid ${catColor}`, backgroundColor: 'white' }}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <span className="text-xs font-bold text-jalanea-400">{block.startTime}</span>
                                                        {block.isAiSuggested && <Sparkles size={10} className="text-gold" />}
                                                    </div>
                                                    <div className="font-bold text-sm text-jalanea-900 mt-1 line-clamp-2">{block.title}</div>
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
                            <Button onClick={handleAddTask} icon={<Plus size={18}/>}>Add</Button>
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
                    <Card variant="solid-white" className="relative w-full max-w-md z-10 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-xl">{editingBlockId ? 'Edit Block' : 'Add Block'}</h3>
                            <button onClick={() => setIsAddModalOpen(false)}><X size={20}/></button>
                        </div>

                        {/* Date Indicator */}
                        {newBlock.date && (
                            <div className="bg-jalanea-50 border border-jalanea-100 rounded-xl p-3 mb-4 flex items-center gap-3">
                                <div className="bg-white p-2 rounded-lg border border-jalanea-200 text-gold">
                                    <Calendar size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-jalanea-400 uppercase tracking-wide">Scheduling For</p>
                                    <p className="text-sm font-bold text-jalanea-900">
                                        {getFullDisplayDate(newBlock.date || getTodayString())}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <Input label="Title" value={newBlock.title} onChange={e => setNewBlock({...newBlock, title: e.target.value})} />
                            
                            <div>
                                <label className="block text-sm font-bold mb-2 text-jalanea-900">Details</label>
                                <textarea 
                                    className="w-full border border-jalanea-200 rounded-xl p-3 bg-white text-sm focus:ring-1 focus:ring-gold focus:border-gold outline-none resize-none"
                                    placeholder="Add description or notes..."
                                    rows={3}
                                    value={newBlock.description || ''}
                                    onChange={e => setNewBlock({...newBlock, description: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Start" type="time" value={newBlock.startTime} onChange={e => setNewBlock({...newBlock, startTime: e.target.value})} />
                                <Input label="End" type="time" value={newBlock.endTime} onChange={e => setNewBlock({...newBlock, endTime: e.target.value})} />
                            </div>

                            <div className="pt-2">
                                <label className="block text-xs font-bold text-jalanea-400 mb-1 uppercase">Change Date</label>
                                <input 
                                    type="date" 
                                    className="w-full border border-jalanea-200 rounded-lg p-2 text-sm bg-jalanea-50 text-jalanea-600"
                                    value={newBlock.date}
                                    onChange={e => setNewBlock({...newBlock, date: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-2 text-jalanea-900">Category</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {categories.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setNewBlock({...newBlock, categoryId: cat.id})}
                                            className={`p-2 rounded-lg text-sm font-bold border transition-all text-left flex items-center gap-2
                                                ${newBlock.categoryId === cat.id ? 'ring-2 ring-jalanea-900 border-transparent bg-jalanea-50' : 'border-jalanea-200 hover:bg-jalanea-50'}
                                            `}
                                        >
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4">
                                {editingBlockId && (
                                    <Button variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => handleDeleteBlock(editingBlockId)}>
                                        <Trash2 size={18} />
                                    </Button>
                                )}
                                <Button fullWidth onClick={handleSaveBlock}>Save Block</Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};
