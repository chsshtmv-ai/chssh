import React, { useState } from 'react';
import { useJournal } from '../../../context/JournalContext';
import {
  Save,
  Send,
  Eye,
  RotateCcw,
  History,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Check,
  Shield,
  LogIn
} from 'lucide-react';

interface CmsPublishToolbarProps {
  onOpenRevisions: () => void;
  sectionName?: string;
}

export const CmsPublishToolbar: React.FC<CmsPublishToolbarProps> = ({
  onOpenRevisions,
  sectionName = 'CMS'
}) => {
  const {
    adminUser,
    loginAdminWithGoogle,
    adminAuthLoading,
    isPreviewMode,
    togglePreviewMode,
    hasUnpublishedChanges,
    saveDraftToFirestore,
    publishDraftToFirestore,
    discardDraftChanges,
    isSavingDraft,
    isPublishingDraft,
    lastDraftSavedAt,
    lastPublishedAt
  } = useJournal();

  const isGoogleAdminAuthorized = Boolean(
    adminUser &&
    adminUser.email &&
    adminUser.email.toLowerCase().trim() === 'chsshtmv@gmail.com'
  );

  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishSummary, setPublishSummary] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSaveDraft = async () => {
    setFeedbackMsg(null);
    const res = await saveDraftToFirestore();
    if (res.success) {
      setFeedbackMsg({ text: 'Draft successfully saved to Firestore.', type: 'success' });
      setTimeout(() => setFeedbackMsg(null), 4000);
    } else {
      setFeedbackMsg({ text: res.error || 'Failed to save draft.', type: 'error' });
    }
  };

  const handleConfirmPublish = async () => {
    setFeedbackMsg(null);
    const res = await publishDraftToFirestore(publishSummary.trim() || undefined);
    setShowPublishModal(false);
    setPublishSummary('');
    if (res.success) {
      setFeedbackMsg({ text: 'Changes published! Public website has been updated in real-time.', type: 'success' });
      setTimeout(() => setFeedbackMsg(null), 5000);
    } else {
      setFeedbackMsg({ text: res.error || 'Failed to publish changes.', type: 'error' });
    }
  };

  const handleDiscard = () => {
    if (window.confirm('Discard all unsaved draft changes and revert to the currently published content?')) {
      discardDraftChanges();
      setFeedbackMsg({ text: 'Draft reverted to published state.', type: 'success' });
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  return (
    <>
      <div className="bg-gradient-to-r from-stone-900 via-[#102344] to-[#1c355e] text-white rounded-xl p-4 shadow-sm border border-stone-800 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Status & Section info */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-xs uppercase tracking-wider text-sky-300 font-mono">
                {sectionName}
              </span>
              <span className="text-stone-400 text-xs">•</span>
              {hasUnpublishedChanges ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-400/20 text-amber-200 border border-amber-300/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Draft Changes Pending (Unpublished)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-400/20 text-emerald-200 border border-emerald-300/30">
                  <Check className="w-3 h-3 text-emerald-300" />
                  All Changes Published &amp; Live
                </span>
              )}
              {isPreviewMode && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-400/20 text-sky-200 border border-sky-300/30">
                  <Eye className="w-3 h-3" /> Preview Active
                </span>
              )}
              {isGoogleAdminAuthorized ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-400/20 text-emerald-200 border border-emerald-300/30 font-mono">
                  <Shield className="w-3 h-3 text-emerald-300" />
                  chsshtmv@gmail.com (Authorized Admin)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-400/20 text-amber-200 border border-amber-300/30">
                  <AlertCircle className="w-3 h-3 text-amber-300" />
                  Google Auth Needed for Writes
                </span>
              )}
            </div>

            <p className="text-[11px] text-stone-300 font-serif">
              {lastDraftSavedAt ? `Draft saved ${new Date(lastDraftSavedAt).toLocaleTimeString()} • ` : ''}
              {lastPublishedAt ? `Live published ${new Date(lastPublishedAt).toLocaleDateString()}` : 'Live on Firestore'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Revision History */}
            <button
              type="button"
              onClick={onOpenRevisions}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-stone-200 border border-white/15 cursor-pointer transition"
              title="View past published versions and rollback"
            >
              <History className="w-3.5 h-3.5 text-sky-300" />
              <span>Revision History</span>
            </button>

            {/* Discard Draft */}
            {hasUnpublishedChanges && (
              <button
                type="button"
                onClick={handleDiscard}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-400/30 cursor-pointer transition"
                title="Discard draft changes and reload published"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Discard Draft</span>
              </button>
            )}

            {/* Save as Draft */}
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSavingDraft}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/40 cursor-pointer transition disabled:opacity-50"
            >
              {isSavingDraft ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" />
                  <span>Saving Draft...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 text-amber-300" />
                  <span>Save as Draft</span>
                </>
              )}
            </button>

            {/* Preview Toggle */}
            <button
              type="button"
              onClick={togglePreviewMode}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition ${
                isPreviewMode
                  ? 'bg-sky-500 text-white border-sky-400 shadow-xs'
                  : 'bg-white/10 hover:bg-white/20 text-stone-200 border-white/20'
              }`}
              title="Toggle preview mode on public website"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{isPreviewMode ? 'Exit Preview' : 'Preview Changes'}</span>
            </button>

            {/* Publish Changes */}
            <button
              type="button"
              onClick={() => setShowPublishModal(true)}
              disabled={isPublishingDraft}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/50 shadow-xs cursor-pointer transition disabled:opacity-50"
            >
              {isPublishingDraft ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish Changes</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Google Authentication Alert for Firestore permissions */}
        {!isGoogleAdminAuthorized && (
          <div className="bg-amber-500/15 border border-amber-400/40 rounded-lg p-3 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-200">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-300 shrink-0" />
              <span>
                <strong>Google Authorization Required:</strong> Firestore rules strictly require sign-in with <span className="font-mono font-bold text-white">chsshtmv@gmail.com</span> to save drafts, view revision history, or publish live changes.
              </span>
            </div>
            <button
              type="button"
              onClick={loginAdminWithGoogle}
              disabled={adminAuthLoading}
              className="shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center gap-1.5 cursor-pointer shadow-xs transition disabled:opacity-50"
            >
              {adminAuthLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In with Google</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Feedback Message */}
        {feedbackMsg && (
          <div
            className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-200'
                : 'bg-red-950/70 border border-red-500/40 text-red-200'
            }`}
          >
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Publishing */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200 dark:border-stone-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-slate-100">
                  Publish CMS Changes
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  This will update the live public website in real time without redeployment.
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block font-semibold text-slate-700 dark:text-slate-300">
                Revision Changelog Note (Optional):
              </label>
              <input
                type="text"
                value={publishSummary}
                onChange={(e) => setPublishSummary(e.target.value)}
                placeholder="e.g. Updated homepage announcements and author guidelines"
                className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 text-slate-900 dark:text-slate-100"
              />
              <p className="text-[11px] text-stone-500 font-serif">
                A permanent revision snapshot will be created in Firestore under your verified account (<strong className="font-mono">chsshtmv@gmail.com</strong>).
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setShowPublishModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-stone-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPublish}
                disabled={isPublishingDraft}
                className="px-5 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs transition"
              >
                Confirm &amp; Publish Live
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
