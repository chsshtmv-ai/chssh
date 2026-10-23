import React, { useState } from 'react';
import { useJournal } from '../context/JournalContext';
import { Article, ArticleStatus } from '../types';
import {
  User,
  LogOut,
  FileText,
  Download,
  Award,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  ExternalLink,
  BookOpen,
  Calendar,
  Layers,
  Send,
  ShieldCheck,
  Link as LinkIcon,
  Search,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ArticleDoiBadge } from './ArticleDoiBadge';

export const AuthorDashboard: React.FC = () => {
  const {
    currentAuthor,
    isAuthorLoggedIn,
    logoutAuthor,
    openAuthorAuthModal,
    setActiveTab,
    articles,
    downloadPublishedPaper,
    linkManuscriptToAuthor
  } = useJournal();

  // Active dashboard tab among the 3 mandatory tabs
  const [activeDashboardTab, setActiveDashboardTab] = useState<'status' | 'paper' | 'certificate'>('status');

  // Selected manuscript ID (if author has multiple submissions)
  const [selectedArticleId, setSelectedArticleId] = useState<string>('');

  // Link manuscript modal / form state
  const [isLinkingOpen, setIsLinkingOpen] = useState(false);
  const [linkTrackingInput, setLinkTrackingInput] = useState('');
  const [linkMsg, setLinkMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Security guard: If user is not authenticated, block protected dashboard and require login
  if (!isAuthorLoggedIn || !currentAuthor) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 p-8 sm:p-10 text-center space-y-6 shadow-sm"
        >
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-stone-800 text-[#102344] dark:text-sky-300 flex items-center justify-center mx-auto">
            <User className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-slate-100">
              Author Dashboard Access Required
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-serif leading-relaxed">
              Please sign in with your registered Author Account to access your personal manuscript publication status, download official typeset papers, and view publication certificates.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => openAuthorAuthModal('Sign in to access your personal Author Dashboard.')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#102344] hover:bg-[#1a386c] text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs transition"
            >
              <User className="w-4 h-4 text-amber-400" />
              <span>Sign In to Author Account</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('home')}
              className="w-full sm:w-auto px-5 py-2.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium cursor-pointer transition"
            >
              <span>Return to Homepage</span>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Manuscript ownership isolation: strictly filter for this authenticated author
  const authorEmailClean = currentAuthor.email.trim().toLowerCase();
  const authorUserId = currentAuthor.userId;

  const authorManuscripts = articles.filter(art => {
    const matchesUserId = art.authorUserId === authorUserId;
    const matchesEmail = Boolean(
      authorEmailClean &&
      art.authors.some(
        a => a.email && a.email.trim().toLowerCase() === authorEmailClean
      )
    );
    const matchesSubmittedIds = Boolean(
      currentAuthor.submittedArticleIds && currentAuthor.submittedArticleIds.includes(art.id)
    );
    return matchesUserId || matchesEmail || matchesSubmittedIds;
  });

  // Active article being inspected
  const activeArticle =
    authorManuscripts.find(a => a.id === selectedArticleId) ||
    authorManuscripts[0] ||
    null;

  // Activation rules:
  // 1. Status: always active for authenticated author
  // 2. Download Published Paper: active ONLY when status is 'published' AND admin has uploaded the typeset paper
  const isPaperPublished = activeArticle?.status === 'published';
  const hasUploadedPublishedPdf = Boolean(
    activeArticle &&
    (activeArticle.publishedDownloadURL ||
      activeArticle.publishedFileDataUrl ||
      activeArticle.publishedFileName ||
      (typeof window !== 'undefined' && localStorage.getItem(`chssh_pub_file_${activeArticle.id}`)))
  );
  const isDownloadPaperActive = Boolean(isPaperPublished && hasUploadedPublishedPdf);

  // 3. Download Certificate: active ONLY when status is 'published' AND admin has added a valid certificate link
  const hasCertificateLink = Boolean(activeArticle?.certificateUrl && activeArticle.certificateUrl.trim().length > 0);
  const isCertificateActive = Boolean(isPaperPublished && hasCertificateLink);

  const handleLogout = () => {
    logoutAuthor();
    setActiveTab('home');
  };

  const handleLinkSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkTrackingInput.trim()) return;
    setLinkMsg(null);
    const res = await linkManuscriptToAuthor(linkTrackingInput.trim(), currentAuthor.userId, currentAuthor.email);
    setLinkMsg({ text: res.message, isError: !res.success });
    if (res.success) {
      setLinkTrackingInput('');
      setTimeout(() => {
        setIsLinkingOpen(false);
        setLinkMsg(null);
      }, 2500);
    }
  };

  const getStatusBadge = (status: ArticleStatus) => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Published in Journal</span>
          </span>
        );
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>Accepted — Awaiting Typesetting</span>
          </span>
        );
      case 'under_review':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Under Double-Blind Peer Review</span>
          </span>
        );
      case 'revision_requested':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
            <AlertCircle className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Author Revision Required</span>
          </span>
        );
      case 'submitted':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Submitted — Editorial Assessment</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>Editorial Decision: Rejected</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* ========================================================================= */}
      {/* AUTHOR PROFILE HEADER WITH LOGOUT                                         */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#102344] to-[#1c355e] text-white flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
            {currentAuthor.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-serif text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
                {currentAuthor.name}
              </h1>
              <span className="font-mono text-[11px] font-semibold bg-slate-100 dark:bg-stone-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md border border-stone-200 dark:border-stone-700">
                User ID: {currentAuthor.userId}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-serif">
              {currentAuthor.email} • {currentAuthor.affiliation}
            </p>
          </div>
        </div>

        {/* Top-Right Account Actions: Submit New & Logout */}
        <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('submit')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition cursor-pointer"
            title="Submit another paper"
          >
            <Send className="w-3.5 h-3.5 text-amber-500" />
            <span>Submit New</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-semibold transition cursor-pointer shadow-2xs"
            title="Log out securely from Author Dashboard"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MANUSCRIPT SELECTION IF MULTIPLE PAPERS EXIST                             */}
      {/* ========================================================================= */}
      {authorManuscripts.length > 1 && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Your Registered Manuscripts ({authorManuscripts.length})
            </span>
            <span className="text-xs text-slate-400 font-serif">
              Click a paper to view its status, download link, and certificate.
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {authorManuscripts.map(art => {
              const isSelected = (activeArticle?.id === art.id);
              return (
                <button
                  key={art.id}
                  type="button"
                  onClick={() => setSelectedArticleId(art.id)}
                  className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#102344] dark:border-sky-500 bg-sky-50/50 dark:bg-sky-950/30 ring-1 ring-[#102344]/30'
                      : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-850 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-mono text-[10px] font-bold text-[#102344] dark:text-sky-300">
                      {art.trackingId}
                    </span>
                    <span className="text-[10px] px-2 py-0.2 rounded-full font-semibold capitalize bg-stone-100 dark:bg-stone-700 text-slate-700 dark:text-slate-300">
                      {art.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="font-serif font-bold text-xs text-slate-900 dark:text-slate-100 line-clamp-1">
                    {art.title}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MAIN CONTENT AREA: 3 MANDATORY DASHBOARD TABS                             */}
      {/* ========================================================================= */}
      {!activeArticle ? (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 p-10 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-stone-800 text-slate-400 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-base font-bold text-slate-800 dark:text-slate-200">
              No Manuscripts Currently Registered to This Account
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto font-serif">
              You haven't submitted a manuscript with this account yet, or your submission was made under a different email address.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('submit')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#102344] hover:bg-[#1a386c] text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs"
            >
              <Send className="w-3.5 h-3.5 text-amber-400" />
              <span>Submit a Manuscript Now</span>
            </button>
            <button
              type="button"
              onClick={() => setIsLinkingOpen(!isLinkingOpen)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium cursor-pointer"
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Link Submission by Tracking ID</span>
            </button>
          </div>

          {/* Inline Link Submission Form */}
          {isLinkingOpen && (
            <form onSubmit={handleLinkSubmission} className="max-w-md mx-auto pt-4 border-t border-stone-200 dark:border-stone-800 space-y-3 text-left">
              <label htmlFor="link-tracking-input" className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Enter your Manuscript Tracking ID (e.g. CHSSH-2026-0001):
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="link-tracking-input"
                  type="text"
                  value={linkTrackingInput}
                  onChange={(e) => setLinkTrackingInput(e.target.value)}
                  placeholder="CHSSH-2026-..."
                  className="flex-1 text-xs px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-mono"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#102344] text-white rounded-lg text-xs font-semibold cursor-pointer hover:bg-[#1a386c]"
                >
                  Link
                </button>
              </div>
              {linkMsg && (
                <p className={`text-xs ${linkMsg.isError ? 'text-rose-600' : 'text-emerald-600 font-semibold'}`}>
                  {linkMsg.text}
                </p>
              )}
            </form>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 shadow-sm overflow-hidden">
          {/* Active Manuscript Summary Banner */}
          <div className="bg-stone-50/80 dark:bg-stone-800/40 p-5 sm:p-6 border-b border-stone-200 dark:border-stone-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold bg-[#102344] text-white px-2.5 py-0.5 rounded-md">
                    {activeArticle.trackingId}
                  </span>
                  <span className="text-xs text-slate-500 font-serif">
                    Track: {activeArticle.track}
                  </span>
                </div>
                <h2 className="font-serif text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">
                  {activeArticle.title}
                </h2>
              </div>
              <div className="shrink-0">
                {getStatusBadge(activeArticle.status)}
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* THE 3 DASHBOARD TABS BAR                                                  */}
          {/* ========================================================================= */}
          <div className="border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 px-4 sm:px-6">
            <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
              {/* TAB 1: Published Paper Status */}
              <button
                type="button"
                onClick={() => setActiveDashboardTab('status')}
                className={`flex items-center gap-2 py-4 px-2 sm:px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeDashboardTab === 'status'
                    ? 'border-[#102344] dark:border-sky-400 text-[#102344] dark:text-sky-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Published Paper Status</span>
              </button>

              {/* TAB 2: Download Published Paper */}
              <button
                type="button"
                onClick={() => setActiveDashboardTab('paper')}
                className={`flex items-center gap-2 py-4 px-2 sm:px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeDashboardTab === 'paper'
                    ? 'border-[#102344] dark:border-sky-400 text-[#102344] dark:text-sky-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Download className="w-4 h-4" />
                <span>Download Published Paper</span>
                {isDownloadPaperActive && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Published PDF ready" />
                )}
              </button>

              {/* TAB 3: Download Certificate */}
              <button
                type="button"
                onClick={() => setActiveDashboardTab('certificate')}
                className={`flex items-center gap-2 py-4 px-2 sm:px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeDashboardTab === 'certificate'
                    ? 'border-[#102344] dark:border-sky-400 text-[#102344] dark:text-sky-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>Download Certificate</span>
                {isCertificateActive && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Certificate available" />
                )}
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* TAB PANELS CONTENT                                                        */}
          {/* ========================================================================= */}
          <div className="p-6 sm:p-8">
            {/* --------------------------------------------------------------------- */}
            {/* TAB 1: PUBLISHED PAPER STATUS                                         */}
            {/* --------------------------------------------------------------------- */}
            {activeDashboardTab === 'status' && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Status Hero Overview */}
                <div className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700/80 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Current Lifecycle Status
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        {getStatusBadge(activeArticle.status)}
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 font-serif">
                      <span>Submitted on: </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {activeArticle.submissionDate}
                      </span>
                    </div>
                  </div>

                  {/* Informative Lifecycle Messages based on publication stage */}
                  {activeArticle.status === 'published' ? (
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-900 dark:text-emerald-200 space-y-2">
                      <div className="flex items-center gap-2 font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Officially Published &amp; Archived in CHSSH Volume Repository</span>
                      </div>
                      <p className="font-serif leading-relaxed text-emerald-800 dark:text-emerald-300">
                        Congratulations! Your paper has been published in the official journal issue. The final typeset paper PDF and publication certificate are accessible in the tabs above.
                      </p>
                    </div>
                  ) : activeArticle.status === 'accepted' ? (
                    <div className="p-4 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 rounded-xl text-xs text-sky-900 dark:text-sky-200 space-y-2">
                      <div className="flex items-center gap-2 font-bold">
                        <CheckCircle2 className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                        <span>Accepted for Publication — In Editorial Typesetting</span>
                      </div>
                      <p className="font-serif leading-relaxed text-sky-800 dark:text-sky-300">
                        Your manuscript has passed double-blind peer review and has been accepted by the editorial board. Our typesetting team is preparing the formal publication layout. Your final published paper PDF and certificate will be available here once publication is released.
                      </p>
                    </div>
                  ) : activeArticle.status === 'under_review' ? (
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-200 space-y-2">
                      <div className="flex items-center gap-2 font-bold">
                        <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span>Peer Review Underway</span>
                      </div>
                      <p className="font-serif leading-relaxed text-amber-800 dark:text-amber-300">
                        Your manuscript is currently undergoing double-blind peer review with our subject-matter referees. Editorial decisions and reviewer notifications will be reflected here upon completion.
                      </p>
                    </div>
                  ) : activeArticle.status === 'revision_requested' ? (
                    <div className="p-4 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-xl text-xs text-purple-900 dark:text-purple-200 space-y-2">
                      <div className="flex items-center gap-2 font-bold">
                        <AlertCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span>Author Revision Requested</span>
                      </div>
                      <p className="font-serif leading-relaxed text-purple-800 dark:text-purple-300">
                        The reviewers and editors have requested revisions on your submission. Please check the editorial instructions below.
                      </p>
                      {activeArticle.revisionInstructions && (
                        <div className="mt-2 p-3 bg-white dark:bg-stone-900 rounded-lg border border-purple-200 dark:border-purple-800 text-purple-950 dark:text-purple-200 font-serif">
                          {activeArticle.revisionInstructions}
                        </div>
                      )}
                    </div>
                  ) : activeArticle.status === 'rejected' ? (
                    <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-900 dark:text-rose-200 space-y-1">
                      <div className="flex items-center gap-2 font-bold">
                        <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                        <span>Editorial Decision Registered</span>
                      </div>
                      <p className="font-serif leading-relaxed text-rose-800 dark:text-rose-300">
                        Following editorial assessment, this manuscript was not selected for publication in the current cycle. We thank you for your submission to CHSSH.
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-100 dark:bg-stone-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 space-y-1">
                      <div className="flex items-center gap-2 font-bold">
                        <Clock className="w-4 h-4 text-slate-500" />
                        <span>Manuscript Queued for Initial Editorial Triage</span>
                      </div>
                      <p className="font-serif leading-relaxed">
                        Your paper has been deposited in the CHSSH editorial database. The managing editor will review scope and format before forwarding to peer reviewers.
                      </p>
                    </div>
                  )}
                </div>

                {/* Bibliographic Publication Metadata (Volume, Issue, Pages, DOI) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-4 bg-stone-50 dark:bg-stone-800/40 rounded-xl border border-stone-200 dark:border-stone-700">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Volume &amp; Issue</p>
                    <p className="text-sm font-bold font-serif text-slate-900 dark:text-slate-100 mt-1">
                      {activeArticle.volume ? `Volume ${activeArticle.volume}, Issue ${activeArticle.issue || 1}` : 'Awaiting Issue Assignment'}
                    </p>
                    {activeArticle.year && (
                      <p className="text-[11px] text-slate-500 mt-0.5">Year: {activeArticle.year}</p>
                    )}
                  </div>

                  <div className="p-4 bg-stone-50 dark:bg-stone-800/40 rounded-xl border border-stone-200 dark:border-stone-700">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Publication Date</p>
                    <p className="text-sm font-bold font-serif text-slate-900 dark:text-slate-100 mt-1">
                      {activeArticle.publishedDate || 'Pending Final Release'}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Quarterly Frequency</p>
                  </div>

                  <div className="p-4 bg-stone-50 dark:bg-stone-800/40 rounded-xl border border-stone-200 dark:border-stone-700">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pagination</p>
                    <p className="text-sm font-bold font-serif text-slate-900 dark:text-slate-100 mt-1">
                      {activeArticle.pages ? `pp. ${activeArticle.pages}` : 'Assigned in Final Typeset'}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Sequential Issue Pages</p>
                  </div>

                  <div className="p-4 bg-stone-50 dark:bg-stone-800/40 rounded-xl border border-stone-200 dark:border-stone-700">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Digital Object Identifier (DOI)</p>
                    {activeArticle.doi ? (
                      <a
                        href={`https://doi.org/${activeArticle.doi}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono font-bold text-sky-700 dark:text-sky-400 hover:underline inline-flex items-center gap-1 mt-1 break-all"
                      >
                        <span>{activeArticle.doi}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    ) : (
                      <p className="text-xs font-serif text-slate-500 mt-1">Pending Official Registration</p>
                    )}
                  </div>
                </div>

                {/* Manuscript Abstract & Authors */}
                <div className="space-y-3 pt-2">
                  <h4 className="font-serif text-sm font-bold text-slate-900 dark:text-slate-100">
                    Manuscript Summary
                  </h4>
                  <div className="p-4 bg-white dark:bg-stone-850 rounded-xl border border-stone-200 dark:border-stone-700 text-xs text-slate-700 dark:text-slate-300 font-serif leading-relaxed">
                    <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Abstract:</p>
                    {activeArticle.abstract}
                  </div>
                </div>
              </motion.div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* TAB 2: DOWNLOAD PUBLISHED PAPER                                       */}
            {/* --------------------------------------------------------------------- */}
            {activeDashboardTab === 'paper' && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {isDownloadPaperActive ? (
                  <div className="p-6 sm:p-8 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl space-y-5 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto shadow-2xs">
                      <FileText className="w-7 h-7" />
                    </div>

                    <div className="space-y-1 max-w-md mx-auto">
                      <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
                        Official Published Paper (PDF)
                      </span>
                      <h3 className="font-serif text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                        {activeArticle.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-serif">
                        Formatted in the official CHSSH journal layout and published by the editorial team.
                      </p>
                    </div>

                    {/* Metadata Pill Box */}
                    <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono">
                      <span className="px-2.5 py-1 bg-white dark:bg-stone-800 rounded-lg border border-emerald-200 dark:border-emerald-800 text-slate-700 dark:text-slate-300">
                        File: {activeArticle.publishedFileName || 'Published_Paper.pdf'}
                      </span>
                      {activeArticle.publishedFileSize && (
                        <span className="px-2.5 py-1 bg-white dark:bg-stone-800 rounded-lg border border-emerald-200 dark:border-emerald-800 text-slate-700 dark:text-slate-300">
                          Size: {activeArticle.publishedFileSize}
                        </span>
                      )}
                      {activeArticle.doi && (
                        <span className="px-2.5 py-1 bg-white dark:bg-stone-800 rounded-lg border border-emerald-200 dark:border-emerald-800 text-sky-700 dark:text-sky-300">
                          DOI: {activeArticle.doi}
                        </span>
                      )}
                    </div>

                    {/* Direct Download Button */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => downloadPublishedPaper(activeArticle)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition cursor-pointer hover:shadow-md"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Final Published Paper (PDF)</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 sm:p-10 bg-stone-50 dark:bg-stone-850/60 rounded-2xl border border-stone-200 dark:border-stone-800 text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-stone-700 text-slate-400 flex items-center justify-center mx-auto">
                      <Download className="w-6 h-6" />
                    </div>

                    <div className="space-y-2 max-w-lg mx-auto">
                      <h4 className="font-serif text-base font-bold text-slate-800 dark:text-slate-200">
                        Published Paper Download Pending
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-serif leading-relaxed">
                        Your published paper will be available here after official publication by the editorial team.
                      </p>
                    </div>

                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 rounded-lg text-xs border border-amber-200 dark:border-amber-800">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        Current Status: <strong className="capitalize">{activeArticle.status.replace('_', ' ')}</strong>
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* TAB 3: DOWNLOAD CERTIFICATE                                           */}
            {/* --------------------------------------------------------------------- */}
            {activeDashboardTab === 'certificate' && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {isCertificateActive && activeArticle.certificateUrl ? (
                  <div className="p-6 sm:p-8 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl space-y-5 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center mx-auto shadow-2xs">
                      <Award className="w-7 h-7" />
                    </div>

                    <div className="space-y-1 max-w-md mx-auto">
                      <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider block">
                        Official Publication Certificate
                      </span>
                      <h3 className="font-serif text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                        Certificate of Academic Publication
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-serif">
                        Issued by Contemporary Horizons in Social Sciences and Humanities for manuscript{' '}
                        <strong className="font-mono">{activeArticle.trackingId}</strong>.
                      </p>
                    </div>

                    <div className="p-3 bg-white dark:bg-stone-900 rounded-xl border border-amber-200 dark:border-amber-800 max-w-md mx-auto text-xs text-slate-700 dark:text-slate-300 font-serif space-y-1">
                      <p className="font-bold text-slate-900 dark:text-slate-100">Certified Author(s):</p>
                      <p>{activeArticle.authors.map(a => a.name).join(', ')}</p>
                    </div>

                    {/* Open Certificate Button (Opens actual admin-entered Google Drive link) */}
                    <div className="pt-2">
                      <a
                        href={activeArticle.certificateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#102344] hover:bg-[#1a386c] text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition cursor-pointer hover:shadow-md"
                      >
                        <Award className="w-4 h-4 text-amber-400" />
                        <span>Open Publication Certificate (Google Drive)</span>
                        <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 sm:p-10 bg-stone-50 dark:bg-stone-850/60 rounded-2xl border border-stone-200 dark:border-stone-800 text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-stone-700 text-slate-400 flex items-center justify-center mx-auto">
                      <Award className="w-6 h-6" />
                    </div>

                    <div className="space-y-2 max-w-lg mx-auto">
                      <h4 className="font-serif text-base font-bold text-slate-800 dark:text-slate-200">
                        Publication Certificate Pending
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-serif leading-relaxed">
                        Your publication certificate will be available after it is uploaded by the admin.
                      </p>
                    </div>

                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 rounded-lg text-xs border border-amber-200 dark:border-amber-800">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        Status: {activeArticle.status === 'published' ? 'Awaiting Editor Certificate Link' : 'Paper Must Be Published First'}
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
