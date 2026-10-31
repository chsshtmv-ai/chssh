import React from 'react';
import { useJournal } from '../../../context/JournalContext';
import { JournalPalette } from '../../../types';
import { Palette, Sun, Moon, Check, Sparkles, LayoutGrid } from 'lucide-react';

export const AdminDesignManager: React.FC = () => {
  const { palette, setPalette, theme, setTheme } = useJournal();

  const palettes: { id: JournalPalette; name: string; desc: string; colors: string[] }[] = [
    {
      id: 'oxford',
      name: 'Oxford Scholarly Navy',
      desc: 'Classical academic navy and parchment gold inspired by Oxford & Cambridge traditions.',
      colors: ['#0f172a', '#1e3a8a', '#d97706', '#f8fafc']
    },
    {
      id: 'cambridge',
      name: 'Cambridge Crimson & Ivory',
      desc: 'Prestigious deep crimson and warm cream inspired by historical European scholarly presses.',
      colors: ['#1c1917', '#881337', '#b45309', '#fafaf9']
    },
    {
      id: 'cypress',
      name: 'Cypress Pine & Sandstone',
      desc: 'Earthy botanical green and sandstone reflecting environmental and socio-ecological research.',
      colors: ['#14532d', '#15803d', '#ca8a04', '#f0fdf4']
    },
    {
      id: 'prussian',
      name: 'Prussian Slate & Cobalt',
      desc: 'Modern intellectual cobalt and graphite for cutting-edge contemporary humanities.',
      colors: ['#0f172a', '#1e293b', '#0284c7', '#f1f5f9']
    }
  ];

  return (
    <div className="space-y-6">
      {/* 1. Academic Palette Selector */}
      <div className="bg-white dark:bg-stone-900 rounded-xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-serif font-bold text-base">
          <Palette className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          <h3>Curated Scholarly Color Palettes</h3>
        </div>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          Select an authentic university press colour scheme for the entire journal interface.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {palettes.map((p) => {
            const isSelected = palette === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPalette(p.id, true)}
                className={`text-left p-4 rounded-xl border-2 transition cursor-pointer flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'border-sky-600 dark:border-sky-400 bg-sky-50/50 dark:bg-sky-950/20 shadow-xs'
                    : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-850 hover:border-stone-300'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
                      {p.name}
                    </h4>
                    {isSelected && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-sky-600 text-white">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-400">
                    {p.desc}
                  </p>
                </div>

                {/* Color swatches */}
                <div className="flex items-center gap-2 pt-1 border-t border-stone-100 dark:border-stone-800">
                  {p.colors.map((c, i) => (
                    <span
                      key={i}
                      className="w-5 h-5 rounded-full border border-black/10 shadow-xs"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Theme Mode: Day & Night */}
      <div className="bg-white dark:bg-stone-900 rounded-xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-serif font-bold text-base">
          <Sun className="w-5 h-5 text-amber-500" />
          <h3>Default Theme Mode</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setTheme('day')}
            className={`p-4 rounded-xl border-2 flex items-center gap-3 cursor-pointer transition ${
              theme === 'day'
                ? 'border-sky-600 bg-sky-50/60 dark:bg-sky-950/20'
                : 'border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-850'
            }`}
          >
            <div className="p-2.5 rounded-lg bg-amber-100 text-amber-700">
              <Sun className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h4 className="font-bold text-xs text-stone-900 dark:text-stone-100">Day Mode (Academic Parchment)</h4>
              <p className="text-[11px] text-stone-500">Crisp white &amp; warm eggshell backgrounds for daytime reading</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setTheme('night')}
            className={`p-4 rounded-xl border-2 flex items-center gap-3 cursor-pointer transition ${
              theme === 'night'
                ? 'border-sky-600 bg-sky-50/60 dark:bg-sky-950/20'
                : 'border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-850'
            }`}
          >
            <div className="p-2.5 rounded-lg bg-indigo-100 text-indigo-700">
              <Moon className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h4 className="font-bold text-xs text-stone-900 dark:text-stone-100">Night Mode (Scholarly Dark)</h4>
              <p className="text-[11px] text-stone-500">High-contrast slate dark theme designed for extended research reading</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
