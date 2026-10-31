import React from 'react';
import { useJournal } from '../../../context/JournalContext';
import { BookOpen, History, Target, ShieldCheck, Award } from 'lucide-react';

export const AdminAboutManager: React.FC = () => {
  const { draftContent, updateDraftContentText } = useJournal();

  return (
    <div className="space-y-6">
      {/* 1. Primary About Narrative */}
      <div className="bg-white dark:bg-stone-900 rounded-xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-serif font-bold text-base">
          <BookOpen className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          <h3>About the Journal — Overview &amp; Introduction</h3>
        </div>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          Main descriptive narrative displayed on the dedicated About page and scholarly profiles.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Page Badge / Category Tag
            </label>
            <input
              type="text"
              value={draftContent.about_badge || ''}
              onChange={(e) => updateDraftContentText('about_badge', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Page Heading
            </label>
            <input
              type="text"
              value={draftContent.about_title || ''}
              onChange={(e) => updateDraftContentText('about_title', e.target.value)}
              className="w-full px-3 py-2 text-xs font-serif font-bold rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Subtitle / Overview Statement
            </label>
            <input
              type="text"
              value={draftContent.about_subtitle || ''}
              onChange={(e) => updateDraftContentText('about_subtitle', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Comprehensive Description Paragraph
            </label>
            <textarea
              rows={4}
              value={draftContent.about_description || ''}
              onChange={(e) => updateDraftContentText('about_description', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100 leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* 2. Journal History & Inception */}
      <div className="bg-white dark:bg-stone-900 rounded-xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-serif font-bold text-base">
          <History className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <h3>Journal Inception &amp; Academic History</h3>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Section Title
            </label>
            <input
              type="text"
              value={draftContent.about_history_title || ''}
              onChange={(e) => updateDraftContentText('about_history_title', e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              History &amp; Founding Context
            </label>
            <textarea
              rows={3}
              value={draftContent.about_history_text || ''}
              onChange={(e) => updateDraftContentText('about_history_text', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100 leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* 3. Objectives & Mission Statement */}
      <div className="bg-white dark:bg-stone-900 rounded-xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-serif font-bold text-base">
          <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h3>Aims, Objectives &amp; Mission Statement</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Objectives Title
            </label>
            <input
              type="text"
              value={draftContent.about_objectives_title || ''}
              onChange={(e) => updateDraftContentText('about_objectives_title', e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100"
            />
            <textarea
              rows={3}
              value={draftContent.about_objectives_text || ''}
              onChange={(e) => updateDraftContentText('about_objectives_text', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Mission Statement Title
            </label>
            <input
              type="text"
              value={draftContent.about_mission_title || ''}
              onChange={(e) => updateDraftContentText('about_mission_title', e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100"
            />
            <textarea
              rows={3}
              value={draftContent.about_mission_text || ''}
              onChange={(e) => updateDraftContentText('about_mission_text', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100"
            />
          </div>
        </div>
      </div>

      {/* 4. Editorial Policies & Indexing Summary */}
      <div className="bg-white dark:bg-stone-900 rounded-xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-serif font-bold text-base">
          <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3>Governance, Policies &amp; Indexing Information</h3>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Editorial Policies Summary Text
            </label>
            <textarea
              rows={3}
              value={draftContent.about_policies_text || ''}
              onChange={(e) => updateDraftContentText('about_policies_text', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Indexing &amp; Archiving Overview Text
            </label>
            <textarea
              rows={2}
              value={draftContent.about_indexing_summary || ''}
              onChange={(e) => updateDraftContentText('about_indexing_summary', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100"
            />
          </div>
        </div>
      </div>

      {/* 5. Journal Facts & Metadata */}
      <div className="bg-white dark:bg-stone-900 rounded-xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-serif font-bold text-base">
          <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <h3>Journal Identifiers &amp; Masthead Facts</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              ISSN (Online)
            </label>
            <input
              type="text"
              value={draftContent.issn || ''}
              onChange={(e) => updateDraftContentText('issn', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Publication Frequency
            </label>
            <input
              type="text"
              value={draftContent.frequency || ''}
              onChange={(e) => updateDraftContentText('frequency', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Publisher / Press
            </label>
            <input
              type="text"
              value={draftContent.publisher || ''}
              onChange={(e) => updateDraftContentText('publisher', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              DOI Prefix
            </label>
            <input
              type="text"
              value={draftContent.doi_prefix || ''}
              onChange={(e) => updateDraftContentText('doi_prefix', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100 font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
