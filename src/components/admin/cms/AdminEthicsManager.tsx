import React from 'react';
import { useJournal } from '../../../context/JournalContext';
import { ShieldAlert, CheckCircle, Scale, AlertOctagon, HelpCircle } from 'lucide-react';

export const AdminEthicsManager: React.FC = () => {
  const { draftContent, updateDraftContentText } = useJournal();

  return (
    <div className="space-y-6">
      {/* 1. Header & Overview */}
      <div className="bg-white dark:bg-stone-900 rounded-xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-serif font-bold text-base">
          <Scale className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          <h3>Publication Ethics &amp; Integrity Statement</h3>
        </div>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          Ensure adherence to COPE (Committee on Publication Ethics) core practices.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Badge Tag
            </label>
            <input
              type="text"
              value={draftContent.ethics_badge || ''}
              onChange={(e) => updateDraftContentText('ethics_badge', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Page Heading
            </label>
            <input
              type="text"
              value={draftContent.ethics_title || ''}
              onChange={(e) => updateDraftContentText('ethics_title', e.target.value)}
              className="w-full px-3 py-2 text-xs font-serif font-bold rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Subtitle / Overview
            </label>
            <input
              type="text"
              value={draftContent.ethics_subtitle || ''}
              onChange={(e) => updateDraftContentText('ethics_subtitle', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100"
            />
          </div>
        </div>
      </div>

      {/* 2. Plagiarism Policy & Peer-Review Policy */}
      <div className="bg-white dark:bg-stone-900 rounded-xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-serif font-bold text-base">
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <h3>Plagiarism Screening &amp; Peer-Review Model</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Plagiarism Policy Heading
            </label>
            <input
              type="text"
              value={draftContent.ethics_plagiarism_heading || ''}
              onChange={(e) => updateDraftContentText('ethics_plagiarism_heading', e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100"
            />
            <textarea
              rows={4}
              value={draftContent.ethics_plagiarism_text || ''}
              onChange={(e) => updateDraftContentText('ethics_plagiarism_text', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Double-Blind Peer Review Heading
            </label>
            <input
              type="text"
              value={draftContent.ethics_peer_review_heading || ''}
              onChange={(e) => updateDraftContentText('ethics_peer_review_heading', e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100"
            />
            <textarea
              rows={4}
              value={draftContent.ethics_peer_review_text || ''}
              onChange={(e) => updateDraftContentText('ethics_peer_review_text', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100"
            />
          </div>
        </div>
      </div>

      {/* 3. Conflict of Interest, Corrections & Retraction Policies */}
      <div className="bg-white dark:bg-stone-900 rounded-xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-serif font-bold text-base">
          <AlertOctagon className="w-5 h-5 text-red-600 dark:text-red-400" />
          <h3>Conflicts of Interest, Corrections &amp; Retraction Protocol</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Conflicts of Interest
            </label>
            <input
              type="text"
              value={draftContent.ethics_coi_heading || ''}
              onChange={(e) => updateDraftContentText('ethics_coi_heading', e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850"
            />
            <textarea
              rows={4}
              value={draftContent.ethics_coi_text || ''}
              onChange={(e) => updateDraftContentText('ethics_coi_text', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Errata &amp; Corrections Policy
            </label>
            <input
              type="text"
              value={draftContent.ethics_correction_heading || ''}
              onChange={(e) => updateDraftContentText('ethics_correction_heading', e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850"
            />
            <textarea
              rows={4}
              value={draftContent.ethics_correction_text || ''}
              onChange={(e) => updateDraftContentText('ethics_correction_text', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Retraction Guidelines
            </label>
            <input
              type="text"
              value={draftContent.ethics_retraction_heading || ''}
              onChange={(e) => updateDraftContentText('ethics_retraction_heading', e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850"
            />
            <textarea
              rows={4}
              value={draftContent.ethics_retraction_text || ''}
              onChange={(e) => updateDraftContentText('ethics_retraction_text', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
