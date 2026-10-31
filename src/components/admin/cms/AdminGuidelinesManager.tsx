import React from 'react';
import { useJournal } from '../../../context/JournalContext';
import { FileText, CheckCircle2, DollarSign, BookMarked, AlignLeft } from 'lucide-react';

export const AdminGuidelinesManager: React.FC = () => {
  const { draftContent, updateDraftContentText } = useJournal();

  return (
    <div className="space-y-6">
      {/* 1. Header & Overview */}
      <div className="bg-white dark:bg-stone-900 rounded-xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-serif font-bold text-base">
          <FileText className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          <h3>Author Guidelines — Overview &amp; Introduction</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Badge Tag
            </label>
            <input
              type="text"
              value={draftContent.guidelines_badge || ''}
              onChange={(e) => updateDraftContentText('guidelines_badge', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Page Heading
            </label>
            <input
              type="text"
              value={draftContent.guidelines_title || ''}
              onChange={(e) => updateDraftContentText('guidelines_title', e.target.value)}
              className="w-full px-3 py-2 text-xs font-serif font-bold rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Subtitle
            </label>
            <input
              type="text"
              value={draftContent.guidelines_subtitle || ''}
              onChange={(e) => updateDraftContentText('guidelines_subtitle', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Introductory Guidance Paragraph
            </label>
            <textarea
              rows={3}
              value={draftContent.guidelines_intro || ''}
              onChange={(e) => updateDraftContentText('guidelines_intro', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100"
            />
          </div>
        </div>
      </div>

      {/* 2. Preparation & Formatting Requirements */}
      <div className="bg-white dark:bg-stone-900 rounded-xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-serif font-bold text-base">
          <AlignLeft className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3>Manuscript Preparation &amp; Formatting</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Preparation Section Heading
            </label>
            <input
              type="text"
              value={draftContent.guidelines_prep_heading || ''}
              onChange={(e) => updateDraftContentText('guidelines_prep_heading', e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100"
            />
            <textarea
              rows={4}
              value={draftContent.guidelines_prep_text || ''}
              onChange={(e) => updateDraftContentText('guidelines_prep_text', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Formatting Section Heading
            </label>
            <input
              type="text"
              value={draftContent.guidelines_formatting_heading || ''}
              onChange={(e) => updateDraftContentText('guidelines_formatting_heading', e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100"
            />
            <textarea
              rows={4}
              value={draftContent.guidelines_formatting_text || ''}
              onChange={(e) => updateDraftContentText('guidelines_formatting_text', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100"
            />
          </div>
        </div>
      </div>

      {/* 3. Referencing Style & Submission Checklist */}
      <div className="bg-white dark:bg-stone-900 rounded-xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-serif font-bold text-base">
          <BookMarked className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <h3>Referencing Guidelines &amp; Submission Checklist</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Referencing Heading
            </label>
            <input
              type="text"
              value={draftContent.guidelines_referencing_heading || ''}
              onChange={(e) => updateDraftContentText('guidelines_referencing_heading', e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100"
            />
            <textarea
              rows={4}
              value={draftContent.guidelines_referencing_text || ''}
              onChange={(e) => updateDraftContentText('guidelines_referencing_text', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Pre-Submission Checklist Instructions
            </label>
            <textarea
              rows={5}
              value={draftContent.guidelines_submission_checklist || ''}
              onChange={(e) => updateDraftContentText('guidelines_submission_checklist', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100"
              placeholder="e.g. Ensure all authors are listed with affiliations and ORCID IDs..."
            />
          </div>
        </div>
      </div>

      {/* 4. Article Processing Charges (APC) & Fee Policy */}
      <div className="bg-white dark:bg-stone-900 rounded-xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-serif font-bold text-base">
          <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h3>Article Processing Charges (APC) &amp; Fee Waiver Policy</h3>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              APC Section Heading
            </label>
            <input
              type="text"
              value={draftContent.guidelines_apc_heading || ''}
              onChange={(e) => updateDraftContentText('guidelines_apc_heading', e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              APC Policy &amp; Fee Exemption Details
            </label>
            <textarea
              rows={3}
              value={draftContent.guidelines_apc_text || ''}
              onChange={(e) => updateDraftContentText('guidelines_apc_text', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
