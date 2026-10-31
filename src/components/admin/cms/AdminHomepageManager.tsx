import React from 'react';
import { useJournal } from '../../../context/JournalContext';
import { LayoutDashboard, Megaphone, Image as ImageIcon, Sparkles, CheckSquare, Layers } from 'lucide-react';

export const AdminHomepageManager: React.FC = () => {
  const { draftContent, updateDraftContentText } = useJournal();

  return (
    <div className="space-y-6">
      {/* 1. Hero & Header Intro */}
      <div className="bg-white dark:bg-stone-900 rounded-xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-serif font-bold text-base">
          <LayoutDashboard className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          <h3>Homepage Hero &amp; Masthead Intro</h3>
        </div>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          Edit the primary title, scholarly badge, descriptive paragraph, and call for papers.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Journal Badge / Top Tag
            </label>
            <input
              type="text"
              value={draftContent.hero_badge || ''}
              onChange={(e) => updateDraftContentText('hero_badge', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100"
              placeholder="e.g. Peer-Reviewed Academic Journal • Open Access"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Impact Factor / Indexing Badge
            </label>
            <input
              type="text"
              value={draftContent.hero_impact_badge || ''}
              onChange={(e) => updateDraftContentText('hero_impact_badge', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100"
              placeholder="e.g. Impact Factor 2.84 • Crossref DOI"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Hero Main Heading (Journal Title)
            </label>
            <input
              type="text"
              value={draftContent.hero_title || ''}
              onChange={(e) => updateDraftContentText('hero_title', e.target.value)}
              className="w-full px-3 py-2 text-xs font-serif font-bold rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100"
              placeholder="Contemporary Horizons in Social Sciences and Humanities"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Hero Subtitle / Academic Mission Line
            </label>
            <input
              type="text"
              value={draftContent.hero_subtitle || ''}
              onChange={(e) => updateDraftContentText('hero_subtitle', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100"
              placeholder="Advancing rigorous inquiry, critical epistemology, and interdisciplinary scholarship"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Journal Description Paragraph
            </label>
            <textarea
              rows={3}
              value={draftContent.hero_description || ''}
              onChange={(e) => updateDraftContentText('hero_description', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100"
              placeholder="Enter comprehensive journal introduction..."
            />
          </div>
        </div>
      </div>

      {/* 2. Announcements & Call for Papers */}
      <div className="bg-white dark:bg-stone-900 rounded-xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-serif font-bold text-base">
          <Megaphone className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <h3>Announcements &amp; Call for Papers</h3>
        </div>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          Control live editorial announcements, upcoming issue deadlines, and submission calls.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Announcement Banner Badge
            </label>
            <input
              type="text"
              value={draftContent.announcement_badge || ''}
              onChange={(e) => updateDraftContentText('announcement_badge', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100"
              placeholder="Call for Papers 2026"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Submission Deadline Date / Note
            </label>
            <input
              type="text"
              value={draftContent.announcement_date || ''}
              onChange={(e) => updateDraftContentText('announcement_date', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100"
              placeholder="e.g. Submissions Open for Vol. 1, Issue 2 • Deadline: June 30, 2026"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Announcement Full Text / Bulletin
            </label>
            <textarea
              rows={2}
              value={draftContent.announcement_text || ''}
              onChange={(e) => updateDraftContentText('announcement_text', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100"
              placeholder="Submissions are invited for the upcoming issue across all social sciences and humanities disciplines..."
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Call for Papers Description Box
            </label>
            <textarea
              rows={2}
              value={draftContent.call_for_papers_text || ''}
              onChange={(e) => updateDraftContentText('call_for_papers_text', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100"
              placeholder="Detailed guidelines and incentives for prospective contributors..."
            />
          </div>
        </div>
      </div>

      {/* 3. Hero Visual Assets & Banners */}
      <div className="bg-white dark:bg-stone-900 rounded-xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-serif font-bold text-base">
          <ImageIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h3>Homepage Images &amp; Banners</h3>
        </div>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          Provide public image URLs or Google Drive image links for homepage banners.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Hero Banner Image URL
            </label>
            <input
              type="text"
              value={draftContent.hero_banner_image_url || ''}
              onChange={(e) => updateDraftContentText('hero_banner_image_url', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100 font-mono"
              placeholder="https://images.unsplash.com/... or Google Drive direct link"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Secondary Illustration / Feature Image URL
            </label>
            <input
              type="text"
              value={draftContent.homepage_secondary_image_url || ''}
              onChange={(e) => updateDraftContentText('homepage_secondary_image_url', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100 font-mono"
              placeholder="https://..."
            />
          </div>
        </div>
      </div>

      {/* 4. Section Visibility Toggles */}
      <div className="bg-white dark:bg-stone-900 rounded-xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-serif font-bold text-base">
          <CheckSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3>Homepage Section Visibility &amp; Order</h3>
        </div>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          Show or hide individual sections on the public homepage.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { id: 'show_hero_stats', label: 'Journal Metrics & Facts (ISSN, DOI, Frequency)' },
            { id: 'show_announcements', label: 'Top Announcement Banner' },
            { id: 'show_call_for_papers', label: 'Call for Papers Callout' },
            { id: 'show_latest_articles', label: 'Latest Published Articles Section' },
            { id: 'show_indexing_partners', label: 'Indexing Partners & Archives Grid' }
          ].map((item) => {
            const isVisible = draftContent[item.id as keyof typeof draftContent] !== 'false';
            return (
              <label
                key={item.id}
                className="flex items-start gap-2.5 p-3 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-850 cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-800 transition"
              >
                <input
                  type="checkbox"
                  checked={isVisible}
                  onChange={(e) => updateDraftContentText(item.id as any, e.target.checked ? 'true' : 'false')}
                  className="mt-0.5 rounded text-sky-600 focus:ring-sky-500"
                />
                <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                  {item.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 5. Editor-in-Chief Masthead Statement */}
      <div className="bg-white dark:bg-stone-900 rounded-xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-serif font-bold text-base">
          <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3>Editor-in-Chief Masthead &amp; Statement</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Editor-in-Chief Name
            </label>
            <input
              type="text"
              value={draftContent.editor_in_chief_name || ''}
              onChange={(e) => updateDraftContentText('editor_in_chief_name', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Affiliation &amp; Department
            </label>
            <input
              type="text"
              value={draftContent.editor_in_chief_affiliation || ''}
              onChange={(e) => updateDraftContentText('editor_in_chief_affiliation', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Editorial Tenure Badge
            </label>
            <input
              type="text"
              value={draftContent.eic_tenure_badge || draftContent.editor_in_chief_tenure || ''}
              onChange={(e) => updateDraftContentText('eic_tenure_badge', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100"
              placeholder="e.g. Tenure: 2026–Present"
            />
          </div>

          <div className="space-y-1.5 md:col-span-3">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Editorial Statement / Quote
            </label>
            <textarea
              rows={3}
              value={draftContent.editor_in_chief_statement || draftContent.editor_in_chief_quote || ''}
              onChange={(e) => updateDraftContentText('editor_in_chief_statement', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
