import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Compass, FileText, Sparkles, User } from 'lucide-react';
import { NavRoute } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { haptics } from '../utils/haptics';

interface MobileBottomNavProps {
    currentRoute: NavRoute;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ currentRoute }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isLight } = useTheme();
    const [pressedIndex, setPressedIndex] = useState<number | null>(null);

    const navItems = [
        { id: NavRoute.DASHBOARD, label: 'Home', icon: LayoutDashboard, path: '/dashboard' },
        { id: NavRoute.JOBS, label: 'Jobs', icon: Compass, path: '/jobs' },
        { id: NavRoute.RESUME, label: 'Resume', icon: FileText, path: '/resume' },
        { id: NavRoute.AI_ASSISTANT, label: 'Coach', icon: Sparkles, path: '/ai-assistant' },
        { id: NavRoute.ACCOUNT, label: 'Account', icon: User, path: '/account' },
    ];

    const handleNav = (path: string, index: number) => {
        if (location.pathname !== path) {
            haptics.selection();
            navigate(path);
        }
    };

    const isActive = (path: string) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    return (
        <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-50 border-t transition-colors duration-200 ${
            isLight
                ? 'bg-white/98 border-slate-200/80 shadow-[0_-1px_20px_rgba(0,0,0,0.05)]'
                : 'bg-[#0f172a]/98 border-white/5 shadow-[0_-1px_20px_rgba(0,0,0,0.3)]'
        }`}
        style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
        >
            <div className="flex items-center justify-around h-[52px]">
                {navItems.map((item, index) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    const isPressed = pressedIndex === index;

                    return (
                        <motion.button
                            key={item.id}
                            onTouchStart={() => setPressedIndex(index)}
                            onTouchEnd={() => setPressedIndex(null)}
                            onTouchCancel={() => setPressedIndex(null)}
                            onClick={() => handleNav(item.path, index)}
                            className="flex flex-col items-center justify-center flex-1 h-full relative select-none"
                            animate={{
                                scale: isPressed ? 0.85 : 1,
                                opacity: isPressed ? 0.7 : 1,
                            }}
                            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        >
                            {/* Active background pill */}
                            {active && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute -top-0.5 w-8 h-1 rounded-full bg-gold"
                                    style={{ boxShadow: '0 0 12px rgba(255, 196, 37, 0.6)' }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                />
                            )}

                            <motion.div
                                animate={{
                                    scale: active ? 1.1 : 1,
                                    y: active ? -1 : 0,
                                }}
                                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                            >
                                <Icon
                                    size={24}
                                    className={`transition-colors duration-150 ${
                                        active
                                            ? 'text-gold'
                                            : isLight
                                                ? 'text-slate-400'
                                                : 'text-slate-500'
                                    }`}
                                    strokeWidth={active ? 2.5 : 1.75}
                                />
                            </motion.div>
                            <motion.span
                                className={`text-[10px] mt-0.5 font-semibold tracking-tight transition-colors duration-150 ${
                                    active
                                        ? 'text-gold'
                                        : isLight
                                            ? 'text-slate-400'
                                            : 'text-slate-500'
                                }`}
                                animate={{ scale: active ? 1.05 : 1 }}
                            >
                                {item.label}
                            </motion.span>
                        </motion.button>
                    );
                })}
            </div>

            {/* Safe area fill for notched devices */}
            <div className={`h-[env(safe-area-inset-bottom)] ${isLight ? 'bg-white' : 'bg-[#0f172a]'}`} />
        </nav>
    );
};
