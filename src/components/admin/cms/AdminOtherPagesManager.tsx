import React from 'react';
import { useJournal } from '../../../context/JournalContext';
import { Search, Download, Archive, Newspaper } from 'lucide-react';

export const AdminOtherPagesManager: React.FC = () => {
  const { draftContent, updateDraftContentText } = useJournal();

  return (
    <div className="space-y-6">
      {/* 1. Track Submission Page CMS */}
      <div className="bg-white dark:bg-stone-900 rounded-xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-serif font-bold text-base">
          <Search className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          <h3>Track Submission Portal Content</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Page Heading
            </label>
            <input
              type="text"
              value={draftContent.track_title || ''}
              onChange={(e) => updateDraftContentText('track_title', e.target.value)}
              className="w-full px-3 py-2 text-xs font-serif font-bold rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Subtitle
            </label>
            <input
              type="text"
              value={draftContent.track_subtitle || ''}
              onChange={(e) => updateDraftContentText('track_subtitle', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Instructions for Authors Tracking Status
            </label>
            <textarea
              rows={2}
              value={draftContent.track_instructions || ''}
              onChange={(e) => updateDraftContentText('track_instructions', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850"
            />
          </div>
        </div>
      </div>

      {/* 2. Downloads & Templates Page CMS */}
      <div className="bg-white dark:bg-stone-900 rounded-xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-serif font-bold text-base">
          <Download className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h3>Downloads &amp; Author Forms Folio</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Page Heading
            </label>
            <input
              type="text"
              value={draftContent.downloads_title || ''}
              onChange={(e) => updateDraftContentText('downloads_title', e.target.value)}
              className="w-full px-3 py-2 text-xs font-serif font-bold rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Subtitle
            </label>
            <input
              type="text"
              value={draftContent.downloads_subtitle || ''}
              onChange={(e) => updateDraftContentText('downloads_subtitle', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Folio Introduction
            </label>
            <textarea
              rows={2}
              value={draftContent.downloads_intro || ''}
              onChange={(e) => updateDraftContentText('downloads_intro', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850"
            />
          </div>
        </div>
      </div>

      {/* 3. Current Issue & Archives Folio Descriptions */}
      <div className="bg-white dark:bg-stone-900 rounded-xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-serif font-bold text-base">
          <Newspaper className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3>Current Issue &amp; Archives Folio Descriptions</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Current Issue Subtitle Note
            </label>
            <input
              type="text"
              value={draftContent.current_issue_subtitle || ''}
              onChange={(e) => updateDraftContentText('current_issue_subtitle', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Archives Folio Subtitle Note
            </label>
            <input
              type="text"
              value={draftContent.archives_subtitle || ''}
              onChange={(e) => updateDraftContentText('archives_subtitle', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
