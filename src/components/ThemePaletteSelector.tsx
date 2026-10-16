import React, { useState, useRef, useEffect } from 'react';
import { useJournal } from '../context/JournalContext';
import { THEME_PALETTES } from '../utils/themePalettes';
import { JournalPalette } from '../types';
import { Palette, Check, Sparkles, Shield, BookmarkCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ThemePaletteSelectorProps {
  variant?: 'header' | 'inline' | 'admin';
  className?: string;
}

export const ThemePaletteSelector: React.FC<ThemePaletteSelectorProps> = ({
  variant = 'header',
  className = ''
}) => {
  const { palette, setPalette, isAdmin } = useJournal();
  const [isOpen, setIsOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const activePaletteInfo = THEME_PALETTES.find((p) => p.id === palette) || THEME_PALETTES[0];

  const handleSelectPalette = (id: JournalPalette, persist: boolean = false) => {
    setPalette(id, persist);
    if (persist) {
      setSaveStatus(`Saved "${THEME_PALETTES.find((p) => p.id === id)?.name}" as journal default!`);
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  if (variant === 'admin') {
    return (
      <div className="space-y-4">
        {saveStatus && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{saveStatus}</span>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {THEME_PALETTES.map((p) => {
            const isSelected = p.id === palette;
            return (
              <div
                key={p.id}
                onClick={() => handleSelectPalette(p.id, true)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'bg-white dark:bg-stone-850 border-[#1c355e] dark:border-sky-500 shadow-md ring-2 ring-[#1c355e]/20 dark:ring-sky-500/20'
                    : 'bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center -space-x-1">
                        <span
                          className="w-5 h-5 rounded-full border-2 border-white dark:border-stone-900 shadow-xs"
                          style={{ backgroundColor: p.primaryColor }}
                        />
                        <span
                          className="w-5 h-5 rounded-full border-2 border-white dark:border-stone-900 shadow-xs"
                          style={{ backgroundColor: p.accentColor }}
                        />
                      </div>
                      <span className="text-xs font-mono font-semibold uppercase text-stone-500 dark:text-stone-400">
                        {p.id}
                      </span>
                    </div>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full">
                        <Check className="w-3 h-3" />
                        <span>Active Theme</span>
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
                      {p.name}
                    </h4>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 font-sans">
                      {p.institutionInspiration}
                    </p>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-300 font-serif leading-relaxed">
                    {p.description}
                  </p>
                </div>
                <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px]">
                  <span className="text-stone-400 font-mono">
                    Primary: {p.primaryColor}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectPalette(p.id, true);
                    }}
                    className={`px-2.5 py-1 rounded-lg font-bold text-xs transition cursor-pointer ${
                      isSelected
                        ? 'bg-[#1c355e] text-white shadow-2xs'
                        : 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300'
                    }`}
                  >
                    {isSelected ? 'Saved as Default' : 'Apply & Save as Default'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition cursor-pointer select-none border border-slate-300/60 dark:border-slate-700/80 bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 shadow-2xs"
        aria-label="Select website theme color palette"
        title="Change Journal Theme Color Palette"
      >
        <span className="flex items-center -space-x-1 shrink-0">
          <span
            className="w-2.5 h-2.5 rounded-full border border-white/80 shadow-2xs"
            style={{ backgroundColor: activePaletteInfo.primaryColor }}
          />
          <span
            className="w-2.5 h-2.5 rounded-full border border-white/80 shadow-2xs"
            style={{ backgroundColor: activePaletteInfo.accentColor }}
          />
        </span>
        <span className="hidden sm:inline font-sans font-semibold text-[11px]">
          {activePaletteInfo.name.split(' ')[0]}
        </span>
        <Palette className="w-3 h-3 text-slate-500 dark:text-slate-400" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 mt-2 w-80 sm:w-88 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl p-3 space-y-2 z-50 text-left font-sans"
          >
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800 px-1">
              <div>
                <div className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5 font-serif">
                  <Palette className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  <span>Journal Theme Palette</span>
                </div>
                <div className="text-[10px] text-stone-500 dark:text-stone-400 font-sans">
                  Institutional color schemes for the journal
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                4 Palettes
              </span>
            </div>
            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-0.5">
              {THEME_PALETTES.map((p) => {
                const isSelected = p.id === palette;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      handleSelectPalette(p.id, false);
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-start justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-stone-50 dark:bg-stone-800/90 border-[#1c355e] dark:border-sky-500 shadow-2xs'
                        : 'border-transparent hover:bg-stone-50 dark:hover:bg-stone-850 hover:border-stone-200 dark:border-stone-800'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="flex items-center -space-x-1 shrink-0 mt-0.5">
                        <span
                          className="w-4 h-4 rounded-full border border-white dark:border-stone-900 shadow-xs"
                          style={{ backgroundColor: p.primaryColor }}
                        />
                        <span
                          className="w-4 h-4 rounded-full border border-white dark:border-stone-900 shadow-xs"
                          style={{ backgroundColor: p.accentColor }}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold font-serif text-stone-900 dark:text-stone-100 truncate">
                            {p.name}
                          </span>
                        </div>
                        <p className="text-[10px] text-stone-500 dark:text-stone-400 font-mono">
                          {p.institutionInspiration}
                        </p>
                        <p className="text-[11px] text-stone-600 dark:text-stone-300 font-serif line-clamp-1 mt-0.5">
                          {p.subtitle}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="shrink-0 p-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mt-1">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {isAdmin && (
              <div className="pt-2 border-t border-stone-100 dark:border-stone-800 px-1 flex items-center justify-between">
                <span className="text-[10px] text-stone-500 dark:text-stone-400 flex items-center gap-1">
                  <Shield className="w-3 h-3 text-sky-500" />
                  <span>Admin Mode Active</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    handleSelectPalette(palette, true);
                    setIsOpen(false);
                  }}
                  className="text-[10px] font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <BookmarkCheck className="w-3 h-3" />
                  <span>Set as Default for All</span>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
