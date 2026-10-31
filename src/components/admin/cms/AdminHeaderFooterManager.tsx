import React from 'react';
import { useJournal } from '../../../context/JournalContext';
import { Layout, Menu, Image as ImageIcon, Shield, Compass } from 'lucide-react';

export const AdminHeaderFooterManager: React.FC = () => {
  const { draftContent, updateDraftContentText } = useJournal();

  return (
    <div className="space-y-6">
      {/* 1. Header Branding & Logo */}
      <div className="bg-white dark:bg-stone-900 rounded-xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-serif font-bold text-base">
          <Layout className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          <h3>Header Branding, Crest &amp; Logo</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Journal Logo Image URL (Optional)
            </label>
            <input
              type="text"
              value={draftContent.journal_logo_url || ''}
              onChange={(e) => updateDraftContentText('journal_logo_url', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 font-mono"
              placeholder="https://... (Direct image link or leave blank for crest)"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Crest Initials / Text
            </label>
            <input
              type="text"
              value={draftContent.journal_crest_text || 'CHSSH'}
              onChange={(e) => updateDraftContentText('journal_crest_text', e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 uppercase tracking-widest font-mono"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Journal Official Name
            </label>
            <input
              type="text"
              value={draftContent.journal_title || ''}
              onChange={(e) => updateDraftContentText('journal_title', e.target.value)}
              className="w-full px-3 py-2 text-xs font-serif font-bold rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850"
            />
          </div>
        </div>
      </div>

      {/* 2. Navigation Menu Labels */}
      <div className="bg-white dark:bg-stone-900 rounded-xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-serif font-bold text-base">
          <Menu className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3>Navigation Bar Menu Labels</h3>
        </div>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          Customize navigation bar button titles displayed to readers and scholars.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { id: 'nav_home', defaultLabel: 'Home' },
            { id: 'nav_about', defaultLabel: 'About' },
            { id: 'nav_current_issue', defaultLabel: 'Current Issue' },
            { id: 'nav_aims_scope', defaultLabel: 'Aims & Scope' },
            { id: 'nav_author_guidelines', defaultLabel: 'Author Guidelines' },
            { id: 'nav_editorial_board', defaultLabel: 'Editorial Board' },
            { id: 'nav_track_submission', defaultLabel: 'Track Status' },
            { id: 'nav_archives', defaultLabel: 'Archives' },
            { id: 'nav_contact', defaultLabel: 'Contact' }
          ].map((item) => (
            <div key={item.id} className="space-y-1">
              <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400 font-mono">
                {item.id}
              </label>
              <input
                type="text"
                value={draftContent[item.id as keyof typeof draftContent] || item.defaultLabel}
                onChange={(e) => updateDraftContentText(item.id as any, e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 3. Footer Texts & Copyright */}
      <div className="bg-white dark:bg-stone-900 rounded-xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-serif font-bold text-base">
          <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <h3>Footer Descriptions, Disclaimers &amp; Copyright</h3>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Footer Journal Summary
            </label>
            <textarea
              rows={2}
              value={draftContent.footer_description || ''}
              onChange={(e) => updateDraftContentText('footer_description', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Copyright Notice
            </label>
            <input
              type="text"
              value={draftContent.footer_copyright || ''}
              onChange={(e) => updateDraftContentText('footer_copyright', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Academic Disclaimer &amp; Open Access License
            </label>
            <textarea
              rows={2}
              value={draftContent.footer_disclaimer || ''}
              onChange={(e) => updateDraftContentText('footer_disclaimer', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
