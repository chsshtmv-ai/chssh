import React from 'react';
import { useJournal } from '../../../context/JournalContext';
import { Compass, GraduationCap, Globe, BookOpenCheck, Layers } from 'lucide-react';

export const AdminAimsManager: React.FC = () => {
  const { draftContent, updateDraftContentText } = useJournal();

  return (
    <div className="space-y-6">
      {/* 1. Header & Overview */}
      <div className="bg-white dark:bg-stone-900 rounded-xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-serif font-bold text-base">
          <Compass className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          <h3>Aims &amp; Scope Overview</h3>
        </div>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          Define the journal's academic mission, interdisciplinary boundaries, and disciplinary focus.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Badge Tag
            </label>
            <input
              type="text"
              value={draftContent.aims_badge || ''}
              onChange={(e) => updateDraftContentText('aims_badge', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Section Title
            </label>
            <input
              type="text"
              value={draftContent.aims_title || ''}
              onChange={(e) => updateDraftContentText('aims_title', e.target.value)}
              className="w-full px-3 py-2 text-xs font-serif font-bold rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Subtitle
            </label>
            <input
              type="text"
              value={draftContent.aims_subtitle || ''}
              onChange={(e) => updateDraftContentText('aims_subtitle', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Introductory Narrative
            </label>
            <textarea
              rows={3}
              value={draftContent.aims_description || ''}
              onChange={(e) => updateDraftContentText('aims_description', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100"
            />
          </div>
        </div>
      </div>

      {/* 2. Disciplinary Tracks */}
      <div className="bg-white dark:bg-stone-900 rounded-xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-serif font-bold text-base">
          <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3>Research Disciplines &amp; Thematic Tracks</h3>
        </div>

        {/* Track 1: Social Sciences */}
        <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-850/50 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-sky-800 dark:text-sky-300 uppercase tracking-wider">
            <GraduationCap className="w-4 h-4" />
            <span>Track 1: Social Sciences</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              value={draftContent.scope_track1_title || ''}
              onChange={(e) => updateDraftContentText('scope_track1_title', e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900"
              placeholder="Track Title"
            />
            <input
              type="text"
              value={draftContent.scope_track1_desc || ''}
              onChange={(e) => updateDraftContentText('scope_track1_desc', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900"
              placeholder="Track Description"
            />
            <div className="md:col-span-2">
              <textarea
                rows={2}
                value={draftContent.scope_track1_subjects || ''}
                onChange={(e) => updateDraftContentText('scope_track1_subjects', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900"
                placeholder="Comma-separated subject areas..."
              />
            </div>
          </div>
        </div>

        {/* Track 2: Humanities */}
        <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-850/50 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
            <Globe className="w-4 h-4" />
            <span>Track 2: Humanities</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              value={draftContent.scope_track2_title || ''}
              onChange={(e) => updateDraftContentText('scope_track2_title', e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900"
              placeholder="Track Title"
            />
            <input
              type="text"
              value={draftContent.scope_track2_desc || ''}
              onChange={(e) => updateDraftContentText('scope_track2_desc', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900"
              placeholder="Track Description"
            />
            <div className="md:col-span-2">
              <textarea
                rows={2}
                value={draftContent.scope_track2_subjects || ''}
                onChange={(e) => updateDraftContentText('scope_track2_subjects', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900"
                placeholder="Comma-separated subject areas..."
              />
            </div>
          </div>
        </div>

        {/* Track 3: Interdisciplinary */}
        <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-850/50 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
            <BookOpenCheck className="w-4 h-4" />
            <span>Track 3: Interdisciplinary Studies</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              value={draftContent.scope_track3_title || ''}
              onChange={(e) => updateDraftContentText('scope_track3_title', e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900"
              placeholder="Track Title"
            />
            <input
              type="text"
              value={draftContent.scope_track3_desc || ''}
              onChange={(e) => updateDraftContentText('scope_track3_desc', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900"
              placeholder="Track Description"
            />
            <div className="md:col-span-2">
              <textarea
                rows={2}
                value={draftContent.scope_track3_subjects || ''}
                onChange={(e) => updateDraftContentText('scope_track3_subjects', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900"
                placeholder="Comma-separated subject areas..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
