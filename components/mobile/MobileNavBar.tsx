import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Briefcase, MessageCircle, ClipboardList, User } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { haptics } from '../../utils/haptics';
import { MobileScreen } from './MobileAppShell';

interface MobileNavBarProps {
  activeScreen: MobileScreen;
  onNavigate: (screen: MobileScreen) => void;
}

interface NavItem {
  id: MobileScreen;
  icon: React.ElementType;
  label: string;
}

const navItems: NavItem[] = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'jobs', icon: Briefcase, label: 'Jobs' },
  { id: 'coach', icon: MessageCircle, label: 'Coach' },
  { id: 'tracker', icon: ClipboardList, label: 'Track' },
  { id: 'profile', icon: User, label: 'Profile' }
];

export const MobileNavBar: React.FC<MobileNavBarProps> = ({
  activeScreen,
  onNavigate
}) => {
  const { isLight } = useTheme();
  const [pressedId, setPressedId] = useState<MobileScreen | null>(null);

  const handlePress = (screen: MobileScreen) => {
    haptics.light();
    onNavigate(screen);
  };

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 ${
        isLight
          ? 'bg-white/95 border-t border-slate-200/50'
          : 'bg-[#0f172a]/95 border-t border-white/5'
      }`}
      style={{
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = activeScreen === item.id;
          const isPressed = pressedId === item.id;
          const Icon = item.icon;

          return (
            <motion.button
              key={item.id}
              onTouchStart={() => setPressedId(item.id)}
              onTouchEnd={() => setPressedId(null)}
              onTouchCancel={() => setPressedId(null)}
              onClick={() => handlePress(item.id)}
              className="relative flex flex-col items-center justify-center w-16 h-14 rounded-xl"
              animate={{
                scale: isPressed ? 0.9 : 1,
                opacity: isPressed ? 0.7 : 1
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              {/* Active indicator pill */}
              {isActive && (
                <motion.div
                  layoutId="mobileNavIndicator"
                  className="absolute -top-0.5 w-8 h-1 rounded-full bg-gold"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}

              {/* Icon */}
              <motion.div
                animate={{
                  y: isActive ? -2 : 0
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <Icon
                  size={22}
                  className={
                    isActive
                      ? 'text-gold'
                      : isLight
                        ? 'text-slate-400'
                        : 'text-slate-500'
                  }
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </motion.div>

              {/* Label */}
              <motion.span
                className={`text-[10px] font-medium mt-1 ${
                  isActive
                    ? 'text-gold'
                    : isLight
                      ? 'text-slate-400'
                      : 'text-slate-500'
                }`}
                animate={{
                  opacity: isActive ? 1 : 0.7
                }}
              >
                {item.label}
              </motion.span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNavBar;
