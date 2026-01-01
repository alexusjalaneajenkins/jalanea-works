import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Compass, FileText, Sparkles, User } from 'lucide-react';
import { NavRoute } from '../types';

interface MobileBottomNavProps {
    currentRoute: NavRoute;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ currentRoute }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { id: NavRoute.DASHBOARD, label: 'Home', icon: LayoutDashboard, path: '/dashboard' },
        { id: NavRoute.JOBS, label: 'Jobs', icon: Compass, path: '/jobs' },
        { id: NavRoute.RESUME, label: 'Resume', icon: FileText, path: '/resume' },
        { id: NavRoute.AI_ASSISTANT, label: 'Coach', icon: Sparkles, path: '/ai-assistant' },
        { id: NavRoute.ACCOUNT, label: 'Account', icon: User, path: '/account' },
    ];

    const handleNav = (path: string) => {
        navigate(path);
    };

    const isActive = (path: string) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0f172a]/95 backdrop-blur-xl border-t border-white/10 pb-safe">
            <div className="flex items-center justify-around h-16">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);

                    return (
                        <button
                            key={item.id}
                            onClick={() => handleNav(item.path)}
                            className={`flex flex-col items-center justify-center flex-1 h-full transition-all touch-active ${
                                active ? 'text-gold' : 'text-slate-500'
                            }`}
                        >
                            <div className={`relative ${active ? 'scale-110' : ''} transition-transform`}>
                                <Icon
                                    size={22}
                                    className={active ? 'stroke-[2.5]' : 'stroke-[1.5]'}
                                />
                                {active && (
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gold shadow-[0_0_8px_rgba(255,196,37,0.8)]" />
                                )}
                            </div>
                            <span className={`text-[10px] mt-1 font-medium ${active ? 'text-gold' : 'text-slate-500'}`}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Safe area fill for notched devices */}
            <div className="h-[env(safe-area-inset-bottom)] bg-[#0f172a]" />
        </nav>
    );
};
