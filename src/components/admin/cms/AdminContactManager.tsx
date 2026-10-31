import React from 'react';
import { useJournal } from '../../../context/JournalContext';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare } from 'lucide-react';

export const AdminContactManager: React.FC = () => {
  const { draftContent, updateDraftContentText } = useJournal();

  return (
    <div className="space-y-6">
      {/* 1. Header & Overview */}
      <div className="bg-white dark:bg-stone-900 rounded-xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-serif font-bold text-base">
          <Mail className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          <h3>Contact Page &amp; Editorial Office Details</h3>
        </div>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          Manage public editorial contact coordinates, inquiry response times, and office instructions.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Badge Tag
            </label>
            <input
              type="text"
              value={draftContent.contact_badge || ''}
              onChange={(e) => updateDraftContentText('contact_badge', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Page Heading
            </label>
            <input
              type="text"
              value={draftContent.contact_title || ''}
              onChange={(e) => updateDraftContentText('contact_title', e.target.value)}
              className="w-full px-3 py-2 text-xs font-serif font-bold rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Subtitle / Communication Promise
            </label>
            <input
              type="text"
              value={draftContent.contact_subtitle || ''}
              onChange={(e) => updateDraftContentText('contact_subtitle', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Editorial Instructions &amp; Guidelines for Inquirers
            </label>
            <textarea
              rows={3}
              value={draftContent.contact_instructions || ''}
              onChange={(e) => updateDraftContentText('contact_instructions', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850"
            />
          </div>
        </div>
      </div>

      {/* 2. Direct Channels & Address */}
      <div className="bg-white dark:bg-stone-900 rounded-xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-serif font-bold text-base">
          <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h3>Official Channels &amp; Office Coordinates</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Editorial Office Email
            </label>
            <input
              type="email"
              value={draftContent.contact_email || ''}
              onChange={(e) => updateDraftContentText('contact_email', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Contact Telephone / WhatsApp
            </label>
            <input
              type="text"
              value={draftContent.contact_phone || ''}
              onChange={(e) => updateDraftContentText('contact_phone', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Office Working Hours
            </label>
            <input
              type="text"
              value={draftContent.contact_hours || ''}
              onChange={(e) => updateDraftContentText('contact_hours', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Expected Query Response Time
            </label>
            <input
              type="text"
              value={draftContent.contact_response_time || ''}
              onChange={(e) => updateDraftContentText('contact_response_time', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Physical Secretariat &amp; Postal Address
            </label>
            <textarea
              rows={2}
              value={draftContent.contact_office || ''}
              onChange={(e) => updateDraftContentText('contact_office', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
