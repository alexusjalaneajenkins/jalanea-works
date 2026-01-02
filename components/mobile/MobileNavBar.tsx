import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Briefcase, MessageCircle, ClipboardList, User, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { haptics } from '../../utils/haptics';
import { MobileScreen } from './MobileAppShell';

/**
 * MobileNavBar - Research-driven design applying:
 * - Fitts's Law: Large touch targets (48px+) for faster, more accurate taps
 * - Recognition over recall: Clear icons with labels
 * - Immediate feedback: Haptic + visual response on tap
 * - Brand consistency: Gold accent for active state
 */

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
  { id: 'coach', icon: Sparkles, label: 'Coach' },
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

  // Background color for the nav - must match for safe area fill
  const bgColor = isLight ? '#ffffff' : '#0f172a';

  return (
    <nav
      className={`flex-shrink-0 relative ${
        isLight
          ? 'border-t border-slate-200/30'
          : 'border-t border-white/5'
      }`}
      style={{
        backgroundColor: bgColor,
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        // Include safe area in nav height for proper visual sizing
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {/* Nav content - iOS standard is 49pt content + 34pt safe area = 83px */}
      <div className="flex items-center justify-around px-2 pt-2 pb-1" style={{ height: '49px' }}>
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
              className={`relative flex flex-col items-center justify-center flex-1 h-full rounded-2xl transition-colors ${
                isActive
                  ? isLight ? 'bg-gold/10' : 'bg-gold/10'
                  : ''
              }`}
              animate={{
                scale: isPressed ? 0.92 : 1
              }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              {/* Icon container with active state */}
              <motion.div
                className={`flex items-center justify-center w-14 h-8 rounded-2xl ${
                  isActive
                    ? 'bg-gold'
                    : 'bg-transparent'
                }`}
                animate={{
                  scale: isActive ? 1 : 0.95
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <Icon
                  size={22}
                  className={
                    isActive
                      ? 'text-black'
                      : isLight
                        ? 'text-slate-400'
                        : 'text-slate-500'
                  }
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
              </motion.div>

              {/* Label */}
              <span
                className={`text-[10px] font-medium mt-0.5 transition-colors ${
                  isActive
                    ? 'text-gold'
                    : isLight
                      ? 'text-slate-400'
                      : 'text-slate-500'
                }`}
              >
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNavBar;
