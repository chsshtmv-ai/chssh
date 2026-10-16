import React from 'react';
import { useJournal } from '../context/JournalContext';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'motion/react';

interface ThemeToggleProps {
  variant?: 'pill' | 'compact' | 'switch';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ variant = 'pill', className = '' }) => {
  const { theme, toggleTheme } = useJournal();
  const isNight = theme === 'night';

  if (variant === 'compact') {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="button"
        onClick={toggleTheme}
        className={`relative p-1.5 rounded-lg border transition-all cursor-pointer flex items-center justify-center ${
          isNight
            ? 'bg-stone-900 text-amber-400 border-stone-700/80 hover:bg-stone-850 hover:border-amber-500/40 shadow-xs'
            : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200 hover:text-amber-800'
        } ${className}`}
        title={isNight ? 'Switch to Day (Light) Mode' : 'Switch to Night (Reading) Mode'}
        aria-label={isNight ? 'Switch to Day (Light) Mode' : 'Switch to Night (Reading) Mode'}
      >
        <motion.div
          key={theme}
          initial={{ rotate: -90, opacity: 0, scale: 0.7 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.7 }}
          transition={{ duration: 0.22 }}
        >
          {isNight ? (
            <Moon className="w-3.5 h-3.5 fill-amber-400/20 text-amber-300" />
          ) : (
            <Sun className="w-3.5 h-3.5 text-amber-600" />
          )}
        </motion.div>
      </motion.button>
    );
  }

  return (
    <div
      onClick={toggleTheme}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleTheme();
        }
      }}
      aria-label={`Toggle Day or Night Mode. Current: ${isNight ? 'Night' : 'Day'}`}
      className={`group relative inline-flex items-center gap-1.5 p-1 rounded-full cursor-pointer select-none transition-all duration-300 border ${
        isNight
          ? 'bg-stone-900 border-stone-700/90 shadow-inner'
          : 'bg-stone-100/90 border-stone-300/80 shadow-2xs hover:border-stone-400'
      } ${className}`}
    >
      <span
        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all duration-200 ${
          !isNight
            ? 'bg-white text-amber-900 shadow-xs ring-1 ring-stone-900/5'
            : 'text-stone-400 hover:text-stone-300'
        }`}
      >
        <Sun className={`w-3 h-3 ${!isNight ? 'text-amber-600' : 'text-stone-500'}`} />
        <span className="tracking-wide">Day</span>
      </span>
      <span
        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all duration-200 ${
          isNight
            ? 'bg-stone-800 text-amber-300 shadow-xs ring-1 ring-amber-400/30'
            : 'text-stone-500 hover:text-stone-700'
        }`}
      >
        <Moon className={`w-3 h-3 ${isNight ? 'fill-amber-300/20 text-amber-300' : 'text-stone-400'}`} />
        <span className="tracking-wide">Night</span>
      </span>
    </div>
  );
};
