import React, { useState } from 'react';
import { useJournal } from '../../../context/JournalContext';
import { CmsRevision } from '../../../types';
import { History, RotateCcw, X, CheckCircle2, Calendar, User, Eye, AlertTriangle, Loader2, Shield, LogIn } from 'lucide-react';

interface CmsRevisionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CmsRevisionsModal: React.FC<CmsRevisionsModalProps> = ({ isOpen, onClose }) => {
  const { cmsRevisions, revertToRevision, adminUser, loginAdminWithGoogle, adminAuthLoading } = useJournal();
  const [selectedRevision, setSelectedRevision] = useState<CmsRevision | null>(null);
  const [isReverting, setIsReverting] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const isGoogleAdmin = Boolean(
    adminUser &&
    adminUser.email &&
    adminUser.email.toLowerCase().trim() === 'chsshtmv@gmail.com'
  );

  if (!isOpen) return null;

  const handleRollback = async (rev: CmsRevision) => {
    if (!window.confirm(`Are you sure you want to revert the live website to Revision "${rev.summary}" from ${new Date(rev.timestamp).toLocaleString()}? This will update the published website.`)) {
      return;
    }
    setIsReverting(true);
    setFeedback(null);
    const res = await revertToRevision(rev.id);
    setIsReverting(false);
    if (res.success) {
      setFeedback({ text: `Website successfully restored to revision (${new Date(rev.timestamp).toLocaleDateString()}).`, type: 'success' });
      setTimeout(() => {
        setFeedback(null);
        onClose();
      }, 2500);
    } else {
      setFeedback({ text: res.error || 'Failed to revert revision.', type: 'error' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-850">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 flex items-center justify-center shrink-0">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-slate-900 dark:text-slate-100">
                CMS Revision History &amp; Rollback
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Browse every published snapshot stored in Firestore and revert with a single click.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback message */}
        {feedback && (
          <div
            className={`mx-5 mt-4 p-3 rounded-lg text-xs flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                : 'bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {!isGoogleAdmin ? (
            <div className="text-center py-12 px-4 border-2 border-dashed border-amber-300/50 dark:border-amber-800/50 bg-amber-50/30 dark:bg-amber-950/20 rounded-xl space-y-3">
              <Shield className="w-10 h-10 text-amber-500 mx-auto" />
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                Google Authentication Required
              </p>
              <p className="text-xs text-stone-600 dark:text-stone-400 max-w-md mx-auto">
                Firestore security rules restrict revision history access exclusively to <strong className="font-mono">chsshtmv@gmail.com</strong>.
              </p>
              <button
                type="button"
                onClick={loginAdminWithGoogle}
                disabled={adminAuthLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-xs transition"
              >
                {adminAuthLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In with Google (chsshtmv@gmail.com)</span>
                  </>
                )}
              </button>
            </div>
          ) : cmsRevisions.length === 0 ? (
            <div className="text-center py-12 px-4 border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-xl">
              <History className="w-10 h-10 text-stone-300 dark:text-stone-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">
                No Previous Revisions Stored Yet
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto mt-1">
                Whenever you click "Publish Changes" in the CMS toolbar, an immutable snapshot is saved to Firestore here for auditing and instant rollback.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {cmsRevisions.map((rev, index) => {
                const dateObj = new Date(rev.timestamp);
                const isSelected = selectedRevision?.id === rev.id;

                return (
                  <div
                    key={rev.id}
                    className={`p-4 rounded-xl border transition ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/20 shadow-xs'
                        : 'border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-850/60 hover:border-stone-300 dark:hover:border-stone-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-sky-700 dark:text-sky-300 bg-sky-100 dark:bg-sky-950/80 px-2 py-0.5 rounded">
                            {index === 0 ? 'CURRENT LIVE' : `v${cmsRevisions.length - index}`}
                          </span>
                          <span className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                            {rev.summary || 'Content Update'}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-stone-500 dark:text-stone-400 flex-wrap">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {dateObj.toLocaleDateString()} {dateObj.toLocaleTimeString()}
                          </span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1 font-mono">
                            <User className="w-3 h-3" />
                            {rev.publishedBy || 'chsshtmv@gmail.com'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedRevision(isSelected ? null : rev)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-750 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{isSelected ? 'Hide Details' : 'Inspect'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRollback(rev)}
                          disabled={isReverting}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800/80 hover:bg-amber-200 dark:hover:bg-amber-900/60 transition cursor-pointer disabled:opacity-50"
                        >
                          {isReverting ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <RotateCcw className="w-3.5 h-3.5 text-amber-700 dark:text-amber-300" />
                          )}
                          <span>Rollback to This</span>
                        </button>
                      </div>
                    </div>

                    {/* Snapshot inspect view */}
                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-stone-200 dark:border-stone-800 text-xs space-y-2 bg-white dark:bg-stone-900 p-3 rounded-lg">
                        <p className="font-semibold text-stone-700 dark:text-stone-300">
                          Snapshot Snapshot Details:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-stone-600 dark:text-stone-400">
                          <div>
                            <span className="font-bold">Journal Title:</span> {rev.contentSnapshot?.journal_title || 'N/A'}
                          </div>
                          <div>
                            <span className="font-bold">ISSN:</span> {rev.contentSnapshot?.issn || 'N/A'}
                          </div>
                          <div>
                            <span className="font-bold">Hero Heading:</span> {rev.contentSnapshot?.hero_title || 'N/A'}
                          </div>
                          <div>
                            <span className="font-bold">Announcements:</span> {rev.contentSnapshot?.announcement_text ? 'Configured' : 'None'}
                          </div>
                          <div>
                            <span className="font-bold">Aims Heading:</span> {rev.contentSnapshot?.aims_title || 'N/A'}
                          </div>
                          <div>
                            <span className="font-bold">Editorial Board Count:</span> {rev.contentSnapshot?.editorial_title || 'N/A'}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 flex justify-end bg-stone-50 dark:bg-stone-850">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-xs font-semibold bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 hover:bg-stone-300 dark:hover:bg-stone-600 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
