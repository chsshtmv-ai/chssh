import React, { useState } from 'react';
import { useJournal } from '../context/JournalContext';
import { Eye, Send, ArrowLeft, X, Loader2, CheckCircle2 } from 'lucide-react';

export const CmsPreviewBar: React.FC = () => {
  const {
    isPreviewMode,
    setIsPreviewMode,
    setActiveTab,
    publishDraftToFirestore,
    isPublishingDraft,
    hasUnpublishedChanges
  } = useJournal();

  const [publishedSuccess, setPublishedSuccess] = useState(false);

  if (!isPreviewMode) return null;

  const handlePublishNow = async () => {
    const res = await publishDraftToFirestore('Quick published from preview banner');
    if (res.success) {
      setPublishedSuccess(true);
      setTimeout(() => {
        setPublishedSuccess(false);
      }, 4000);
    }
  };

  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 text-white px-4 py-2.5 shadow-md border-b border-amber-500/40 font-sans text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <div className="flex items-center gap-1.5 font-bold text-amber-300">
            <Eye className="w-4 h-4" />
            <span>CMS PREVIEW MODE ACTIVE</span>
          </div>
          <span className="text-stone-400 hidden sm:inline">•</span>
          <span className="text-stone-300 hidden sm:inline">
            You are reviewing pending draft content. Public readers see the published version only.
          </span>
        </div>

        <div className="flex items-center gap-2">
          {publishedSuccess ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-600 text-white font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Published Live!
            </span>
          ) : (
            <>
              {hasUnpublishedChanges && (
                <button
                  type="button"
                  onClick={handlePublishNow}
                  disabled={isPublishingDraft}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer transition disabled:opacity-50"
                >
                  {isPublishingDraft ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Publish Live</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setActiveTab('admin')}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/10 hover:bg-white/20 text-stone-200 border border-white/20 font-semibold cursor-pointer transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to CMS</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPreviewMode(false)}
                className="p-1 rounded-md text-stone-400 hover:text-white hover:bg-white/10 transition"
                title="Exit Preview Mode"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
