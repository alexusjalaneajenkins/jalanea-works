import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Briefcase, ChevronRight, MapPin, Sparkles, Loader2, Calendar, Target, Zap, Clock, CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react';
import { Job, TimeBlock, ToDoItem } from '../types';
import { MOCK_PROFILE } from './Profile';
import { findRealTimeJobs } from '../services/geminiService';

// Skeleton Component
const SkeletonJobCard = () => (
    <Card variant="solid-white" className="border-l-[4px] border-l-jalanea-100 opacity-60">
        <div className="flex flex-col sm:flex-row justify-between gap-6 animate-pulse">
            <div className="flex-1 space-y-4">
                <div className="space-y-2">
                    <div className="h-6 bg-jalanea-200 rounded w-3/4"></div>
                    <div className="h-4 bg-jalanea-100 rounded w-1/2"></div>
                </div>
                <div className="flex gap-2">
                    <div className="h-6 w-20 bg-jalanea-100 rounded-full"></div>
                    <div className="h-6 w-24 bg-jalanea-100 rounded-full"></div>
                </div>
            </div>
        </div>
    </Card>
);

// --- WIDGET: Today's Roadmap (Mini Schedule) ---
const DashboardTimeline = () => {
    // Mocking current time as 09:30 AM for demo context
    const events = [
        { time: '09:00', title: 'Work Shift', status: 'active', color: 'border-blue-500' },
        { time: '12:00', title: 'Lunch & Quick Apply', status: 'upcoming', color: 'border-gold' },
        { time: '17:00', title: 'Portfolio Review', status: 'upcoming', color: 'border-purple-500' },
    ];

    return (
        <Card variant="solid-white" className="border-jalanea-200" noPadding>
            <div className="p-4 border-b border-jalanea-100 flex items-center gap-2">
                <div className="p-1.5 bg-jalanea-100 text-jalanea-900 rounded-md">
                    <Calendar size={16} />
                </div>
                <h3 className="font-bold text-jalanea-900">Today's Roadmap</h3>
            </div>
            <div className="p-4 space-y-4 relative">
                {/* Vertical Line */}
                <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-jalanea-100"></div>

                {events.map((evt, i) => (
                    <div key={i} className="relative pl-8 flex flex-col gap-1 group">
                        <div className={`absolute left-[0.35rem] top-1.5 w-3 h-3 rounded-full border-2 bg-white z-10 ${evt.status === 'active' ? 'border-gold animate-pulse' : 'border-jalanea-300'}`}></div>
                        <span className={`text-xs font-bold ${evt.status === 'active' ? 'text-gold' : 'text-jalanea-400'}`}>{evt.time}</span>
                        <div className={`p-3 rounded-lg border-l-4 bg-jalanea-50 ${evt.color}`}>
                            <span className="text-sm font-bold text-jalanea-900 block">{evt.title}</span>
                            {evt.status === 'active' && <span className="text-[10px] text-jalanea-500 font-medium">Happening Now</span>}
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

// --- WIDGET: Mission Checklist (To-Do) ---
const DashboardTodoList = () => {
    const [tasks, setTasks] = useState<ToDoItem[]>([
        { id: '1', text: 'Apply to Universal Creative', completed: true, priority: 'high' },
        { id: '2', text: 'Update Resume Skills Section', completed: false, priority: 'high' },
        { id: '3', text: 'Email Disney Recruiter', completed: false, priority: 'medium' },
    ]);
    const [newTask, setNewTask] = useState('');

    const toggleTask = (id: string) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const addTask = () => {
        if (!newTask.trim()) return;
        setTasks([...tasks, { id: Date.now().toString(), text: newTask, completed: false, priority: 'medium' }]);
        setNewTask('');
    };

    return (
        <Card variant="solid-white" className="border-jalanea-200 flex flex-col h-full" noPadding>
            <div className="p-4 border-b border-jalanea-100 flex items-center justify-between bg-jalanea-50/50">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-jalanea-900 text-white rounded-md">
                        <CheckCircle2 size={16} />
                    </div>
                    <h3 className="font-bold text-jalanea-900">Mission Checklist</h3>
                </div>
                <span className="text-xs font-bold text-jalanea-400">{tasks.filter(t => t.completed).length}/{tasks.length} Done</span>
            </div>

            <div className="flex-1 p-0 overflow-y-auto max-h-[300px]">
                {tasks.map(task => (
                    <div key={task.id} className="flex items-center gap-3 p-3 border-b border-jalanea-50 hover:bg-jalanea-50 transition-colors group">
                        <button onClick={() => toggleTask(task.id)} className={`shrink-0 transition-colors ${task.completed ? 'text-green-500' : 'text-jalanea-300 hover:text-gold'}`}>
                            {task.completed ? <CheckCircle2 size={20} fill="currentColor" className="text-white bg-green-500 rounded-full" /> : <Circle size={20} />}
                        </button>
                        <span className={`text-sm flex-1 font-medium ${task.completed ? 'text-jalanea-300 line-through' : 'text-jalanea-700'}`}>
                            {task.text}
                        </span>
                    </div>
                ))}
            </div>

            <div className="p-3 border-t border-jalanea-100 bg-white">
                <div className="flex gap-2">
                    <input
                        className="flex-1 text-xs border border-jalanea-200 rounded-lg px-3 py-2 outline-none focus:border-gold"
                        placeholder="Add new task..."
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addTask()}
                    />
                    <button onClick={addTask} disabled={!newTask} className="p-2 bg-jalanea-900 text-white rounded-lg hover:bg-jalanea-800 disabled:opacity-50">
                        <Plus size={16} />
                    </button>
                </div>
            </div>
        </Card>
    );
};

// --- WIDGET: Applications ---
const ActiveApplications = () => {
    const apps = [
        { id: 1, company: "Disney", role: "UX Intern", stage: "Applied", action: "Follow Up", urgent: true },
        { id: 2, company: "EA Games", role: "Design Asst", stage: "Interview", action: "Prep", urgent: false },
    ];

    return (
        <Card variant="solid-white" className="border-jalanea-200" noPadding>
            <div className="p-4 border-b border-jalanea-100 flex items-center gap-2">
                <div className="p-1.5 bg-jalanea-100 text-jalanea-900 rounded-md">
                    <Target size={16} />
                </div>
                <h3 className="font-bold text-jalanea-900">Active Applications</h3>
            </div>
            <div className="divide-y divide-jalanea-100">
                {apps.map(app => (
                    <div key={app.id} className="p-4 hover:bg-jalanea-50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h4 className="font-bold text-jalanea-900">{app.company}</h4>
                                <p className="text-xs text-jalanea-500">{app.role} • {app.stage}</p>
                            </div>
                            {app.urgent && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                        </div>
                        <div className="bg-gold/10 border border-gold/20 rounded-lg p-2 flex items-center justify-between">
                            <span className="text-xs font-bold text-jalanea-800 flex items-center gap-2">
                                <Zap size={12} className="text-gold" /> Next: {app.action}
                            </span>
                            <button className="text-[10px] font-bold text-jalanea-500 hover:text-jalanea-900 uppercase">Do It</button>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export const Dashboard: React.FC = () => {
    const { currentUser } = useAuth();
    const [isScanning, setIsScanning] = useState(false);
    const [foundJobs, setFoundJobs] = useState<Job[]>([]);

    // Initial Mock Data
    const INITIAL_JOBS: Job[] = [
        {
            id: '1',
            title: 'Junior Web Designer',
            company: 'Universal Creative',
            location: 'Orlando, FL',
            type: 'Full-time',
            salaryRange: '$52k - $65k',
            postedAt: '2h ago',
            matchScore: 98,
            skills: ['Adobe Suite', 'Figma'],
            experienceLevel: 'Entry Level',
            description: 'Create immersive digital experiences for theme park attractions.',
            logo: "https://ui-avatars.com/api/?name=Universal+Creative&background=000000&color=fff&size=128&bold=true"
        },
        {
            id: '2',
            title: 'Digital Design Intern',
            company: 'Electronic Arts (EA)',
            location: 'Orlando, FL',
            type: 'Internship',
            salaryRange: '$22/hr',
            postedAt: '4h ago',
            matchScore: 96,
            skills: ['UI Basics', 'Gaming Passion'],
            experienceLevel: 'Internship',
            description: 'Support the UI team on Madden NFL titles.',
            logo: "https://ui-avatars.com/api/?name=EA+Games&background=ff0000&color=fff&size=128&bold=true"
        },
        {
            id: '3',
            title: 'Marketing Coordinator',
            company: 'Visit Orlando',
            location: 'Orlando, FL',
            type: 'Full-time',
            salaryRange: '$48k - $55k',
            postedAt: '6h ago',
            matchScore: 92,
            skills: ['Social Media', 'Content'],
            experienceLevel: 'Entry Level',
            description: 'Promote Orlando as a premier destination.',
            logo: "https://ui-avatars.com/api/?name=Visit+Orlando&background=ff9900&color=fff&size=128&bold=true"
        }
    ];

    const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);

    const handleScan = async () => {
        setIsScanning(true);
        try {
            const newRoles = await findRealTimeJobs(MOCK_PROFILE);
            if (newRoles && newRoles.length > 0) {
                setFoundJobs(newRoles);
                setJobs(prev => [...newRoles, ...prev]);
            }
        } catch (error) {
            console.error("Scan failed", error);
        } finally {
            setIsScanning(false);
        }
    };

    const displayedJobs = jobs.slice(0, 5);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-jalanea-900">Dashboard</h1>
                    <p className="text-jalanea-600 mt-2 text-lg">
                        Welcome back, <span className="font-bold text-jalanea-900">{currentUser?.displayName || 'Friend'}</span>. Your profile is ready.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="border-jalanea-200 text-jalanea-600 hover:border-jalanea-900 hover:text-jalanea-900">
                        Update Degree
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={handleScan}
                        disabled={isScanning || foundJobs.length > 0}
                        icon={isScanning ? <Loader2 size={16} className="animate-spin text-gold" /> : <Zap size={16} className="text-gold" />}
                    >
                        {isScanning ? 'AI Scanning...' : foundJobs.length > 0 ? 'Feed Updated' : 'Scan New Roles'}
                    </Button>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT COLUMN: Job Feed (2/3 Width) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold text-jalanea-900">Today's Top Matches</h2>
                            {isScanning && (
                                <span className="flex items-center gap-1.5 text-xs font-bold text-gold bg-jalanea-900 px-3 py-1 rounded-full animate-pulse">
                                    <Sparkles size={12} fill="currentColor" /> AI Processing...
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        {isScanning && (
                            <>
                                <SkeletonJobCard />
                                <SkeletonJobCard />
                            </>
                        )}

                        {displayedJobs.map((job) => (
                            <Card
                                key={job.id}
                                variant="solid-white"
                                hoverEffect
                                className={`
                        group cursor-pointer border-l-[4px] transition-all duration-300
                        ${job.matchReason ? 'border-l-gold bg-gold/5 animate-in slide-in-from-top-4 duration-700' : 'border-l-transparent hover:border-l-jalanea-300'}
                    `}
                            >
                                <div className="flex flex-col sm:flex-row justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-1">
                                            <div>
                                                <h3 className="text-lg font-bold text-jalanea-900 group-hover:text-jalanea-700 transition-colors">
                                                    {job.title}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-2">
                                                    {job.logo ? (
                                                        <img src={job.logo} className="w-8 h-8 rounded-lg object-cover shadow-sm border border-jalanea-100" alt="logo"
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                            }}
                                                        />
                                                    ) : null}
                                                    <div className={`w-8 h-8 rounded-lg bg-jalanea-100 flex items-center justify-center border border-jalanea-200 ${job.logo ? 'hidden' : ''}`}>
                                                        <Briefcase size={16} className="text-jalanea-400" />
                                                    </div>
                                                    <p className="text-sm font-bold text-jalanea-500 uppercase tracking-wide">{job.company}</p>
                                                </div>
                                            </div>
                                            <div className="sm:hidden flex items-center gap-1 bg-jalanea-50 px-2 py-1 rounded">
                                                <span className="text-xs font-bold text-jalanea-900">{job.matchScore}% Match</span>
                                            </div>
                                        </div>

                                        {job.matchReason && (
                                            <div className="my-3 flex items-start gap-2 text-xs font-medium text-jalanea-800 bg-white p-2 rounded-lg border border-gold/30 shadow-sm">
                                                <Sparkles size={14} className="text-gold shrink-0 mt-0.5" fill="currentColor" />
                                                <span>{job.matchReason}</span>
                                            </div>
                                        )}

                                        <div className="flex flex-wrap gap-2 mt-3 mb-4">
                                            <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide
                                 ${job.experienceLevel === 'Internship' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}
                              `}>
                                                {job.experienceLevel}
                                            </span>
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold bg-jalanea-50 text-jalanea-600 border border-jalanea-100">
                                                <MapPin size={10} /> {job.location}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-y-2 text-sm text-jalanea-600 max-w-md">
                                            <div className="flex items-center gap-2">
                                                <Briefcase size={14} className="text-jalanea-400" />
                                                <span className="font-medium">{job.salaryRange}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock size={14} className="text-jalanea-400" />
                                                <span className="font-medium">{job.postedAt}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="hidden sm:flex flex-col items-center justify-center pl-6 border-l border-jalanea-100 min-w-[100px]">
                                        <div className="relative flex items-center justify-center w-14 h-14">
                                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                                <path
                                                    className="text-jalanea-100"
                                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="3"
                                                />
                                                <path
                                                    className="text-gold"
                                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="3"
                                                    strokeDasharray={`${job.matchScore}, 100`}
                                                />
                                            </svg>
                                            <span className="absolute text-sm font-bold text-jalanea-900">{job.matchScore}%</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-jalanea-400 mt-1 uppercase tracking-wider">Match</span>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* RIGHT COLUMN: Widgets (1/3 Width) */}
                <div className="lg:col-span-1 space-y-6">
                    <ActiveApplications />
                    <DashboardTimeline />
                    <DashboardTodoList />
                </div>
            </div>

        </div>
    );
};
