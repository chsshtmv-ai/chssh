import React, { useState } from 'react';
import { useJournal } from '../context/JournalContext';
import { Article, ArticleStatus } from '../types';
import {
  Search,
  CheckCircle2,
  Clock,
  FileCheck,
  AlertCircle,
  FileText,
  Award,
  ExternalLink,
  Download,
  Building,
  User,
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { ArticleDoiBadge } from './ArticleDoiBadge';
import { printPublicationCertificate } from '../utils/downloadGenerators';

export const TrackSubmission: React.FC = () => {
  const {
    articles,
    currentAuthor,
    isAuthorLoggedIn,
    content,
    downloadPublishedPaper,
    downloadOriginalManuscript,
    setSelectedArticleForView
  } = useJournal();

  const [query, setQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Author submissions if logged in
  const authorSubmissions = isAuthorLoggedIn && currentAuthor
    ? articles.filter(
        (a) =>
          a.authorUserId === currentAuthor.userId ||
          a.authors.some(
            (auth) =>
              auth.email.toLowerCase() === currentAuthor.email.toLowerCase() ||
              auth.name.toLowerCase() === currentAuthor.name.toLowerCase()
          )
      )
    : [];

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = query.trim().toLowerCase();
    if (!clean) return;

    const match = articles.find(
      (a) =>
        a.trackingId.toLowerCase() === clean ||
        a.title.toLowerCase().includes(clean) ||
        a.authors.some(
          (auth) =>
            auth.email.toLowerCase() === clean ||
            auth.name.toLowerCase().includes(clean)
        )
    );

    setSelectedArticle(match || null);
    setHasSearched(true);
  };

  const selectPredefined = (art: Article) => {
    setQuery(art.trackingId);
    setSelectedArticle(art);
    setHasSearched(true);
  };

  const getStatusBadge = (status: ArticleStatus) => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Published in Issue
          </span>
        );
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            Accepted for Publication
          </span>
        );
      case 'under_review':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            Under Double-Blind Peer Review
          </span>
        );
      case 'revision_requested':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 dark:bg-orange-950/80 text-orange-800 dark:text-orange-300 border border-orange-300 dark:border-orange-800">
            <AlertCircle className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
            Revisions Requested
          </span>
        );
      case 'submitted':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-stone-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-stone-700">
            <Clock className="w-3.5 h-3.5" />
            Submitted / Editorial Screening
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800">
            <AlertCircle className="w-3.5 h-3.5" />
            Declined
          </span>
        );
      default:
        return null;
    }
  };

  const getStepProgressIndex = (status: ArticleStatus) => {
    switch (status) {
      case 'submitted':
        return 1;
      case 'under_review':
        return 2;
      case 'revision_requested':
        return 2;
      case 'accepted':
        return 3;
      case 'published':
        return 4;
      default:
        return 1;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1c355e] dark:text-sky-400 uppercase tracking-widest">
            <Search className="w-3.5 h-3.5" />
            <span>Real-time Manuscript Status</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-slate-100">
            Track Submission &amp; Review Progress
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Enter your permanent manuscript tracking identifier or registered author email to view current stage,
            editorial review notes, and accredited certificates.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2 pt-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. CHSSH-2025-0104 or author email..."
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#102344]"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg bg-[#102344] hover:bg-[#1a386c] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Track Status
          </button>
        </form>

        {/* Quick Demo Links */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500 dark:text-slate-400">
          <span>Sample Tracking IDs:</span>
          {articles.slice(0, 3).map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => selectPredefined(a)}
              className="px-2 py-0.5 rounded bg-slate-100 dark:bg-stone-800 hover:bg-slate-200 text-[#102344] dark:text-sky-300 font-mono text-[11px] cursor-pointer"
            >
              {a.trackingId}
            </button>
          ))}
        </div>
      </div>

      {/* Author Account Submissions List (if logged in) */}
      {isAuthorLoggedIn && authorSubmissions.length > 0 && !selectedArticle && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-stone-800 pb-3">
            <h2 className="font-serif font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
              <User className="w-4 h-4 text-[#102344] dark:text-sky-400" />
              <span>Your Registered Submissions ({authorSubmissions.length})</span>
            </h2>
            <span className="text-xs text-slate-500">Account: {currentAuthor?.name}</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-stone-800">
            {authorSubmissions.map((art) => (
              <div
                key={art.id}
                onClick={() => selectPredefined(art)}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 dark:hover:bg-stone-800/40 p-2 rounded-lg cursor-pointer transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-[#102344] dark:text-sky-300">
                      {art.trackingId}
                    </span>
                    {getStatusBadge(art.status)}
                  </div>
                  <h3 className="text-sm font-serif font-medium text-slate-900 dark:text-slate-100 line-clamp-1">
                    {art.title}
                  </h3>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-1.5 shrink-0">
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Submission Result View */}
      {selectedArticle ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 p-6 sm:p-8 space-y-6 shadow-xs"
        >
          {/* Header Strip */}
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 dark:border-stone-800 pb-4">
            <div className="space-y-1 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#102344] dark:text-sky-300 px-2 py-0.5 rounded bg-slate-100 dark:bg-stone-800">
                  {selectedArticle.trackingId}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Submitted: {selectedArticle.submissionDate}
                </span>
              </div>
              <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-slate-100 pt-1">
                {selectedArticle.title}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Track: <strong className="text-slate-800 dark:text-slate-200">{selectedArticle.track}</strong>
              </p>
            </div>
            <div>{getStatusBadge(selectedArticle.status)}</div>
          </div>

          {/* Timeline Milestones */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Evaluation Milestones
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
              {[
                { stepNum: 1, label: 'Manuscript Received', desc: 'Desk screening & plagiarism' },
                { stepNum: 2, label: 'Peer Review', desc: 'Double-blind evaluator reports' },
                { stepNum: 3, label: 'Editorial Decision', desc: 'Revision or acceptance' },
                { stepNum: 4, label: 'Typesetting & Publication', desc: 'DOI assigned & indexed' }
              ].map((m) => {
                const currentStepIdx = getStepProgressIndex(selectedArticle.status);
                const isPassed = currentStepIdx >= m.stepNum;
                const isCurrent = currentStepIdx === m.stepNum;

                return (
                  <div
                    key={m.stepNum}
                    className={`p-3 rounded-xl border ${
                      isCurrent
                        ? 'border-[#102344] dark:border-sky-500 bg-[#102344]/5 dark:bg-sky-500/10'
                        : isPassed
                        ? 'border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/40 dark:bg-emerald-950/20'
                        : 'border-slate-200 dark:border-stone-800 bg-slate-50/50 dark:bg-stone-800/30 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                      {isPassed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full border border-current text-[10px] flex items-center justify-center">
                          {m.stepNum}
                        </span>
                      )}
                      <span>{m.label}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{m.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Authors List */}
          <div className="space-y-2 text-xs">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">Authors &amp; Affiliations</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {selectedArticle.authors.map((auth, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-slate-200 dark:border-stone-800 bg-slate-50/50 dark:bg-stone-800/30 space-y-0.5"
                >
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{auth.name}</span>
                  <p className="text-slate-500 text-[11px]">{auth.affiliation}</p>
                  {auth.email && <p className="text-slate-400 text-[11px]">{auth.email}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Editorial Notes */}
          {selectedArticle.editorialNotes && (
            <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-sky-950/30 border border-blue-200 dark:border-sky-800/60 text-xs space-y-1">
              <span className="font-semibold text-[#102344] dark:text-sky-300 block">
                Official Editorial Note
              </span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {selectedArticle.editorialNotes}
              </p>
            </div>
          )}

          {/* Action Bar / Certificates */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-stone-800">
            <div className="flex flex-wrap items-center gap-2">
              {(selectedArticle.status === 'accepted' || selectedArticle.status === 'published') && (
                <button
                  type="button"
                  onClick={() =>
                    printPublicationCertificate(
                      {
                        authorName: selectedArticle.authors.map((a) => a.name).join(', '),
                        paperTitle: selectedArticle.title,
                        trackingId: selectedArticle.trackingId,
                        volume: selectedArticle.volume ? String(selectedArticle.volume) : undefined,
                        issue: selectedArticle.issue ? String(selectedArticle.issue) : undefined,
                        pages: selectedArticle.pages,
                        doi: selectedArticle.doi,
                        date: selectedArticle.publishedDate || selectedArticle.submissionDate
                      },
                      content
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  <Award className="w-4 h-4 text-amber-300" />
                  <span>Print Official Certificate</span>
                </button>
              )}

              {selectedArticle.status === 'published' && selectedArticle.doi && (
                <ArticleDoiBadge doi={selectedArticle.doi} />
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedArticleForView(selectedArticle)}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-stone-700 hover:bg-slate-50 dark:hover:bg-stone-800 text-slate-700 dark:text-slate-200 text-xs font-medium cursor-pointer"
              >
                View Full Abstract &amp; Metadata
              </button>
            </div>
          </div>
        </motion.div>
      ) : hasSearched ? (
        <div className="text-center py-12 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 text-slate-500 dark:text-slate-400 space-y-2">
          <p className="font-serif text-lg">No submission found matching “{query}”</p>
          <p className="text-xs">
            Please check the tracking ID code (format: CHSSH-YYYY-XXXX) or search using your registered author email.
          </p>
        </div>
      ) : null}
    </div>
  );
};
