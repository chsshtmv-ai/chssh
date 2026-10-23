import React, { useState } from 'react';
import { useJournal } from '../../context/JournalContext';
import { Article, ArticleStatus } from '../../types';
import {
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Users,
  Edit3,
  Send,
  Trash2,
  BookOpen,
  X,
  FileCheck,
  Shield,
  Layers,
  Sparkles,
  ArrowRight,
  Cloud,
  CloudOff,
  RefreshCw,
  ExternalLink,
  Folder
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ArticleDoiBadge } from '../ArticleDoiBadge';

export const AdminManuscriptManagement: React.FC = () => {
  const {
    articles,
    reviewers,
    updateArticleStatus,
    assignReviewerToArticle,
    requestArticleRevision,
    deleteArticle,
    downloadOriginalManuscript,
    exportSubmissionsCsv,
    setAdminActiveSubTab,
    isGoogleDriveConnected,
    googleDriveUser,
    connectDrive,
    disconnectDrive,
    syncManuscriptToGoogleDrive,
    ensureDriveFolderTree
  } = useJournal();

  const [syncingArticleId, setSyncingArticleId] = useState<string | null>(null);
  const [isInitializingTree, setIsInitializingTree] = useState(false);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [trackFilter, setTrackFilter] = useState<string>('all');

  // Modals
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [isReviewerModalOpen, setIsReviewerModalOpen] = useState(false);

  // Form states
  const [newStatus, setNewStatusInput] = useState<ArticleStatus>('under_review');
  const [editorialNoteInput, setEditorialNoteInput] = useState('');
  const [reviewerCommentInput, setReviewerCommentInput] = useState('');
  const [revisionInstructionsInput, setRevisionInstructionsInput] = useState('');
  const [selectedReviewerId, setSelectedReviewerId] = useState('');

  // Notification
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // Tracks present
  const availableTracks = Array.from(new Set(articles.map(a => a.track).filter(Boolean)));

  // Filtered submissions
  const filtered = articles.filter(art => {
    const matchesStatus = statusFilter === 'all' || art.status === statusFilter;
    const matchesTrack = trackFilter === 'all' || art.track === trackFilter;
    const term = searchTerm.toLowerCase();
    const corr = art.authors.find(a => a.isCorresponding) || art.authors[0];
    const matchesSearch =
      !term ||
      art.trackingId.toLowerCase().includes(term) ||
      art.title.toLowerCase().includes(term) ||
      (corr && corr.name.toLowerCase().includes(term)) ||
      (corr && corr.email.toLowerCase().includes(term));

    return matchesStatus && matchesTrack && matchesSearch;
  });

  // Summary counts
  const countTotal = articles.length;
  const countSubmitted = articles.filter(a => a.status === 'submitted').length;
  const countUnderReview = articles.filter(a => a.status === 'under_review').length;
  const countRevision = articles.filter(a => a.status === 'revision_requested').length;
  const countAccepted = articles.filter(a => a.status === 'accepted').length;
  const countPublished = articles.filter(a => a.status === 'published').length;

  const handleOpenStatusModal = (art: Article) => {
    setSelectedArticle(art);
    setNewStatusInput(art.status);
    setEditorialNoteInput(art.editorialNotes || '');
    setReviewerCommentInput('');
    setIsStatusModalOpen(true);
  };

  const handleSaveStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArticle) return;

    const newComments = reviewerCommentInput.trim()
      ? [...(selectedArticle.reviewerComments || []), reviewerCommentInput.trim()]
      : selectedArticle.reviewerComments;

    updateArticleStatus(
      selectedArticle.id,
      newStatus,
      editorialNoteInput.trim() || undefined,
      newComments
    );

    showNotification(`Status updated for ${selectedArticle.trackingId} to ${newStatus.replace('_', ' ')}.`);
    setIsStatusModalOpen(false);
  };

  const handleOpenRevisionModal = (art: Article) => {
    setSelectedArticle(art);
    setRevisionInstructionsInput(
      art.revisionInstructions ||
      'Please revise the manuscript adhering strictly to the reviewers\' recommendations and update your citations and methodological framing. Return your revision within 14 business days.'
    );
    setIsRevisionModalOpen(true);
  };

  const handleSendRevision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArticle || !revisionInstructionsInput.trim()) return;

    requestArticleRevision(selectedArticle.id, revisionInstructionsInput.trim());
    showNotification(`Revision request registered for ${selectedArticle.trackingId}.`);
    setIsRevisionModalOpen(false);
  };

  const handleOpenReviewerModal = (art: Article) => {
    setSelectedArticle(art);
    setSelectedReviewerId(art.assignedReviewerId || (reviewers[0]?.id || ''));
    setIsReviewerModalOpen(true);
  };

  const handleAssignReviewer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArticle) return;
    const reviewer = reviewers.find(r => r.id === selectedReviewerId);
    if (!reviewer) return;

    assignReviewerToArticle(selectedArticle.id, reviewer.id, reviewer.name);
    showNotification(`Assigned reviewer ${reviewer.name} to ${selectedArticle.trackingId}.`);
    setIsReviewerModalOpen(false);
  };

  const handleConnectDrive = async () => {
    showNotification('Connecting to Google Drive (chsshtmv@gmail.com)...');
    const res = await connectDrive();
    if (res.success) {
      showNotification('Google Drive successfully connected!');
    } else {
      showNotification(`Drive connection failed: ${res.error}`);
    }
  };

  const handleInitFolders = async () => {
    setIsInitializingTree(true);
    showNotification('Initializing CHSSH Journal folder tree in Google Drive...');
    const ok = await ensureDriveFolderTree();
    setIsInitializingTree(false);
    if (ok) {
      showNotification('CHSSH Journal folder hierarchy verified in Google Drive!');
    } else {
      showNotification('Could not initialize Google Drive folder structure.');
    }
  };

  const handleSyncToDrive = async (art: Article) => {
    if (!isGoogleDriveConnected) {
      showNotification('Please connect Google Drive (chsshtmv@gmail.com) first.');
      return;
    }
    setSyncingArticleId(art.id);
    showNotification(`Uploading ${art.trackingId} to Google Drive...`);
    const success = await syncManuscriptToGoogleDrive(art.id);
    setSyncingArticleId(null);
    if (success) {
      showNotification(`Successfully uploaded ${art.trackingId} to Google Drive!`);
    } else {
      showNotification(`Failed to upload ${art.trackingId} to Google Drive.`);
    }
  };

  const getDriveStatusBadge = (art: Article) => {
    const status = art.driveUploadStatus || 'pending';
    const isSyncing = syncingArticleId === art.id;

    if (status === 'uploaded') {
      return (
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
            <Cloud className="w-3 h-3 text-emerald-600" />
            <span>Uploaded</span>
          </span>
          {art.driveFileId && (
            <a
              href={`https://drive.google.com/file/d/${art.driveFileId}/view`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-sky-600 p-0.5 cursor-pointer"
              title="Open file in Google Drive"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      );
    }

    if (status === 'failed') {
      return (
        <div className="flex items-center gap-1.5">
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 cursor-help"
            title={art.driveUploadError || 'Upload failed'}
          >
            <CloudOff className="w-3 h-3 text-rose-600" />
            <span>Failed</span>
          </span>
          <button
            type="button"
            onClick={() => handleSyncToDrive(art)}
            disabled={isSyncing}
            className="text-[10px] px-1.5 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 rounded border border-rose-200 dark:border-rose-800 cursor-pointer inline-flex items-center gap-1"
            title="Retry Google Drive upload"
          >
            <RefreshCw className={`w-2.5 h-2.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Retry</span>
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1.5">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
          <Clock className="w-3 h-3 text-amber-600" />
          <span>Pending</span>
        </span>
        <button
          type="button"
          onClick={() => handleSyncToDrive(art)}
          disabled={isSyncing}
          className="text-[10px] px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-stone-800 dark:text-slate-200 rounded border border-slate-200 dark:border-stone-700 cursor-pointer inline-flex items-center gap-1"
          title="Upload to Google Drive"
        >
          <Cloud className={`w-2.5 h-2.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>Sync</span>
        </button>
      </div>
    );
  };

  const handleQuickStatus = (art: Article, status: ArticleStatus) => {
    updateArticleStatus(art.id, status);
    showNotification(`Marked ${art.trackingId} as ${status}.`);
  };

  const getStatusBadge = (status: ArticleStatus) => {
    switch (status) {
      case 'submitted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
            <Clock className="w-3 h-3" />
            <span>New Submission</span>
          </span>
        );
      case 'under_review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300">
            <Users className="w-3 h-3" />
            <span>Under Review</span>
          </span>
        );
      case 'revision_requested':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
            <AlertCircle className="w-3 h-3" />
            <span>Revision Required</span>
          </span>
        );
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
            <CheckCircle2 className="w-3 h-3" />
            <span>Accepted</span>
          </span>
        );
      case 'published':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#102344] text-white dark:bg-sky-900 dark:text-white">
            <BookOpen className="w-3 h-3" />
            <span>Published</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300">
            <XCircle className="w-3 h-3" />
            <span>Rejected</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Google Drive Status & Control Bar */}
      <div className="bg-gradient-to-r from-stone-900 via-[#102344] to-[#1a3359] text-white p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-sky-400" />
            <h3 className="font-serif font-bold text-sm text-white">Google Drive Automatic Archive</h3>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${isGoogleDriveConnected ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
              {isGoogleDriveConnected ? 'Connected: chsshtmv@gmail.com' : 'Disconnected'}
            </span>
          </div>
          <p className="text-xs text-slate-300 font-serif max-w-2xl leading-relaxed">
            All submitted manuscripts and published issues are automatically organized in Google Drive under{' '}
            <span className="font-mono text-sky-300">CHSSH Journal / Manuscripts / {new Date().getFullYear()} / [Status]</span>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isGoogleDriveConnected ? (
            <>
              <button
                type="button"
                onClick={handleInitFolders}
                disabled={isInitializingTree}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium cursor-pointer transition-colors"
                title="Verify and create CHSSH Journal folder hierarchy in Drive"
              >
                <Folder className={`w-3.5 h-3.5 ${isInitializingTree ? 'animate-pulse' : ''}`} />
                <span>{isInitializingTree ? 'Verifying Tree...' : 'Initialize Folders'}</span>
              </button>
              <button
                type="button"
                onClick={disconnectDrive}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 rounded-lg text-xs font-medium cursor-pointer transition-colors"
              >
                <CloudOff className="w-3 h-3" />
                <span>Disconnect</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleConnectDrive}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Connect Drive (chsshtmv@gmail.com)</span>
            </button>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200/90 dark:border-stone-800 shadow-2xs">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Total Submissions</p>
          <p className="text-xl font-bold font-serif text-slate-900 dark:text-slate-100 mt-1">{countTotal}</p>
        </div>

        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200/90 dark:border-stone-800 shadow-2xs">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">New Queue</p>
          <p className="text-xl font-bold font-serif text-amber-700 dark:text-amber-400 mt-1">{countSubmitted}</p>
        </div>

        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200/90 dark:border-stone-800 shadow-2xs">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-400">Under Review</p>
          <p className="text-xl font-bold font-serif text-sky-700 dark:text-sky-400 mt-1">{countUnderReview}</p>
        </div>

        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200/90 dark:border-stone-800 shadow-2xs">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-purple-700 dark:text-purple-400">Revisions</p>
          <p className="text-xl font-bold font-serif text-purple-700 dark:text-purple-400 mt-1">{countRevision}</p>
        </div>

        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200/90 dark:border-stone-800 shadow-2xs">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Accepted</p>
          <p className="text-xl font-bold font-serif text-emerald-700 dark:text-emerald-400 mt-1">{countAccepted}</p>
        </div>

        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200/90 dark:border-stone-800 shadow-2xs">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-300">Published</p>
          <p className="text-xl font-bold font-serif text-slate-800 dark:text-slate-300 mt-1">{countPublished}</p>
        </div>
      </div>

      {/* Action feedback */}
      {feedbackMsg && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{feedbackMsg}</span>
        </motion.div>
      )}

      {/* Filter and Control Bar */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by manuscript ID (e.g. CHSSH-2026-3915), title, or author name..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-2 rounded-xl text-xs border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <option value="all">All Statuses ({articles.length})</option>
                <option value="submitted">New Submissions</option>
                <option value="under_review">Under Review</option>
                <option value="revision_requested">Revision Required</option>
                <option value="accepted">Accepted</option>
                <option value="published">Published</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {availableTracks.length > 0 && (
              <select
                value={trackFilter}
                onChange={(e) => setTrackFilter(e.target.value)}
                className="px-2.5 py-2 rounded-xl text-xs border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-800 dark:text-slate-200 cursor-pointer max-w-xs truncate"
              >
                <option value="all">All Subject Tracks</option>
                {availableTracks.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            )}

            {/* Export CSV button */}
            <button
              type="button"
              onClick={exportSubmissionsCsv}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-slate-700 dark:text-slate-300 text-xs font-medium cursor-pointer transition-colors"
              title="Export all submission records and metadata to CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Manuscripts Table */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 shadow-2xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <FileText className="w-10 h-10 mx-auto text-slate-400" />
            <h3 className="font-serif font-bold text-sm text-slate-800 dark:text-slate-200">No manuscripts match your criteria</h3>
            <p className="text-xs text-slate-500 font-serif">Try adjusting your search terms or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 dark:bg-stone-800/60 border-b border-stone-200 dark:border-stone-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Manuscript ID</th>
                  <th className="py-3 px-4">Title &amp; Subject Track</th>
                  <th className="py-3 px-4">Corresponding Author</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Google Drive</th>
                  <th className="py-3 px-4">Assigned Reviewer</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200/80 dark:divide-stone-800 font-serif">
                {filtered.map((art) => {
                  const corr = art.authors.find(a => a.isCorresponding) || art.authors[0];

                  return (
                    <tr
                      key={art.id}
                      className="hover:bg-stone-50/70 dark:hover:bg-stone-800/40 transition-colors"
                    >
                      {/* Manuscript ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-[#102344] dark:text-sky-400 whitespace-nowrap">
                        {art.trackingId}
                      </td>

                      {/* Title & Track */}
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="font-bold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug">
                          {art.title}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {art.track}
                        </div>
                      </td>

                      {/* Corresponding Author */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900 dark:text-slate-200">
                          {corr?.name || 'Unknown Author'}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {corr?.email || ''}
                        </div>
                        {corr?.affiliation && (
                          <div className="text-[10px] text-slate-400 italic">
                            {corr.affiliation}
                          </div>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                        {art.submissionDate}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getStatusBadge(art.status)}
                      </td>

                      {/* Google Drive Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getDriveStatusBadge(art)}
                      </td>

                      {/* Assigned Reviewer */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {art.assignedReviewerName ? (
                          <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                            <Users className="w-3 h-3 text-sky-500" />
                            <span>{art.assignedReviewerName}</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenReviewerModal(art)}
                            className="text-amber-800 dark:text-amber-400 hover:underline text-[11px] cursor-pointer"
                          >
                            + Assign Reviewer
                          </button>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          {/* View Submission Details */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedArticle(art);
                              setIsViewModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-stone-800 cursor-pointer"
                            title="View Submission Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Download Manuscript */}
                          <button
                            type="button"
                            onClick={() => downloadOriginalManuscript(art)}
                            className="p-1.5 text-slate-500 hover:text-sky-600 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-950/40 cursor-pointer"
                            title="Download / Open Original Manuscript"
                          >
                            <Download className="w-4 h-4" />
                          </button>

                          {/* Update Status Modal */}
                          <button
                            type="button"
                            onClick={() => handleOpenStatusModal(art)}
                            className="p-1.5 text-slate-500 hover:text-amber-700 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/40 cursor-pointer"
                            title="Update Status & Editorial Notes"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Assign Reviewer */}
                          <button
                            type="button"
                            onClick={() => handleOpenReviewerModal(art)}
                            className="p-1.5 text-slate-500 hover:text-purple-700 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/40 cursor-pointer"
                            title="Assign Reviewer"
                          >
                            <Users className="w-4 h-4" />
                          </button>

                          {/* Request Revision */}
                          <button
                            type="button"
                            onClick={() => handleOpenRevisionModal(art)}
                            className="p-1.5 text-slate-500 hover:text-purple-600 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/40 cursor-pointer"
                            title="Request Revision"
                          >
                            <Send className="w-4 h-4" />
                          </button>

                          {/* Quick Accept */}
                          {art.status !== 'accepted' && art.status !== 'published' && (
                            <button
                              type="button"
                              onClick={() => handleQuickStatus(art, 'accepted')}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg cursor-pointer"
                              title="Accept Manuscript"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete Manuscript */}
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Permanently remove submission ${art.trackingId}?`)) {
                                deleteArticle(art.id);
                                showNotification(`Removed submission ${art.trackingId}.`);
                              }
                            }}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg cursor-pointer"
                            title="Delete Submission"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* VIEW SUBMISSION DETAILS MODAL */}
      <AnimatePresence>
        {isViewModalOpen && selectedArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-stone-900 rounded-2xl max-w-2xl w-full p-6 space-y-5 border border-stone-200 dark:border-stone-800 shadow-xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 px-2.5 py-1 rounded-md">
                    {selectedArticle.trackingId}
                  </span>
                  {getStatusBadge(selectedArticle.status)}
                </div>
                <button
                  type="button"
                  onClick={() => setIsViewModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs font-serif">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Subject Track</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{selectedArticle.track}</p>
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Manuscript Title</p>
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mt-0.5 leading-snug">
                    {selectedArticle.title}
                  </h3>
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Abstract</p>
                  <div className="p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 text-slate-700 dark:text-slate-300 leading-relaxed mt-1">
                    {selectedArticle.abstract}
                  </div>
                </div>

                {selectedArticle.keywords && selectedArticle.keywords.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Keywords</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedArticle.keywords.map((kw, i) => (
                        <span key={i} className="px-2.5 py-0.5 bg-slate-100 dark:bg-stone-800 text-slate-700 dark:text-slate-300 rounded-full text-[11px]">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Author Details</p>
                  <div className="space-y-2">
                    {selectedArticle.authors.map((auth, idx) => (
                      <div key={idx} className="p-2.5 bg-stone-50 dark:bg-stone-800/40 rounded-lg border border-stone-200 dark:border-stone-700">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-slate-100">{auth.name}</span>
                          {auth.isCorresponding && (
                            <span className="text-[10px] px-2 py-0.5 bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 rounded-full font-semibold">
                              Corresponding Author
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                          {auth.email} • {auth.affiliation} {auth.country ? `(${auth.country})` : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedArticle.coverLetter && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Cover Letter</p>
                    <p className="p-3 bg-stone-50 dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700 text-slate-600 dark:text-slate-300 italic">
                      "{selectedArticle.coverLetter}"
                    </p>
                  </div>
                )}

                {selectedArticle.editorialNotes && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                      Confidential Editorial Notes (Internal Only)
                    </p>
                    <p className="p-3 bg-amber-50/60 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-200 whitespace-pre-line">
                      {selectedArticle.editorialNotes}
                    </p>
                  </div>
                )}

                {selectedArticle.revisionInstructions && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-purple-700 dark:text-purple-400">
                      Author Revision Instructions
                    </p>
                    <p className="p-3 bg-purple-50/60 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800 text-purple-950 dark:text-purple-200 whitespace-pre-line">
                      {selectedArticle.revisionInstructions}
                    </p>
                  </div>
                )}

                {/* Google Drive Archive Details */}
                <div className="p-3.5 bg-sky-50/60 dark:bg-sky-950/20 rounded-xl border border-sky-200 dark:border-sky-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-sky-900 dark:text-sky-200 text-xs">
                      <Cloud className="w-4 h-4 text-sky-600" />
                      <span>Google Drive Archive (chsshtmv@gmail.com)</span>
                    </div>
                    {getDriveStatusBadge(selectedArticle)}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                    <div>
                      <span className="text-slate-400">Target Folder:</span>{' '}
                      <span className="font-mono text-slate-800 dark:text-slate-200">
                        CHSSH Journal/Manuscripts/{selectedArticle.submissionDate?.split('-')[0] || new Date().getFullYear()}/
                        {selectedArticle.status === 'submitted' ? 'New Submissions' : selectedArticle.status === 'under_review' ? 'Under Review' : selectedArticle.status === 'revision_requested' ? 'Revision Required' : selectedArticle.status === 'accepted' ? 'Accepted' : selectedArticle.status === 'rejected' ? 'Rejected' : 'Published'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Drive File ID:</span>{' '}
                      <span className="font-mono text-slate-800 dark:text-slate-200">
                        {selectedArticle.driveFileId || 'Not yet uploaded'}
                      </span>
                    </div>
                    {selectedArticle.driveUploadedAt && (
                      <div>
                        <span className="text-slate-400">Uploaded At:</span>{' '}
                        <span>{new Date(selectedArticle.driveUploadedAt).toLocaleString()}</span>
                      </div>
                    )}
                    {selectedArticle.driveUploadError && (
                      <div className="sm:col-span-2 text-rose-600 dark:text-rose-400">
                        <span className="font-semibold">Upload Notice:</span> {selectedArticle.driveUploadError}
                      </div>
                    )}
                  </div>
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSyncToDrive(selectedArticle)}
                      disabled={syncingArticleId === selectedArticle.id}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-[11px] font-medium cursor-pointer transition-colors"
                    >
                      <RefreshCw className={`w-3 h-3 ${syncingArticleId === selectedArticle.id ? 'animate-spin' : ''}`} />
                      <span>{selectedArticle.driveUploadStatus === 'uploaded' ? 'Re-sync to Google Drive' : 'Sync to Google Drive'}</span>
                    </button>
                    {selectedArticle.driveFileId && (
                      <a
                        href={`https://drive.google.com/file/d/${selectedArticle.driveFileId}/view`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1 bg-white dark:bg-stone-800 hover:bg-stone-100 text-slate-700 dark:text-slate-200 rounded-lg text-[11px] font-medium border border-slate-200 dark:border-stone-700 cursor-pointer"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Open in Google Drive</span>
                      </a>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => downloadOriginalManuscript(selectedArticle)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#102344] hover:bg-[#1c355e] text-white rounded-lg text-xs font-medium cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Manuscript File</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsViewModalOpen(false)}
                    className="px-4 py-1.5 bg-stone-100 dark:bg-stone-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* UPDATE STATUS MODAL */}
      <AnimatePresence>
        {isStatusModalOpen && selectedArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-stone-900 rounded-2xl max-w-lg w-full p-6 space-y-4 border border-stone-200 dark:border-stone-800 shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
                <h3 className="font-serif font-bold text-base text-slate-900 dark:text-slate-100">
                  Update Status: {selectedArticle.trackingId}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsStatusModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveStatus} className="space-y-4 text-xs font-serif">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Manuscript Status *
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatusInput(e.target.value as ArticleStatus)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="submitted">New Submission</option>
                    <option value="under_review">Under Review</option>
                    <option value="revision_requested">Revision Required</option>
                    <option value="accepted">Accepted for Publication</option>
                    <option value="published">Published</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Confidential Editorial Notes
                  </label>
                  <textarea
                    rows={3}
                    value={editorialNoteInput}
                    onChange={(e) => setEditorialNoteInput(e.target.value)}
                    placeholder="Private notes for editorial board and record tracking..."
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Add Reviewer / Peer Comment
                  </label>
                  <textarea
                    rows={2}
                    value={reviewerCommentInput}
                    onChange={(e) => setReviewerCommentInput(e.target.value)}
                    placeholder="Peer feedback or notes to add to record..."
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
                  <button
                    type="button"
                    onClick={() => setIsStatusModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-700 text-slate-700 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-amber-800 hover:bg-amber-900 text-white font-medium cursor-pointer"
                  >
                    Save Status
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REQUEST REVISION MODAL */}
      <AnimatePresence>
        {isRevisionModalOpen && selectedArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-stone-900 rounded-2xl max-w-lg w-full p-6 space-y-4 border border-stone-200 dark:border-stone-800 shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
                <h3 className="font-serif font-bold text-base text-slate-900 dark:text-slate-100">
                  Request Revision: {selectedArticle.trackingId}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsRevisionModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSendRevision} className="space-y-4 text-xs font-serif">
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  The manuscript will be marked as <strong>Revision Required</strong>. Author will see these instructions when checking submission status.
                </p>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Revision Instructions *
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={revisionInstructionsInput}
                    onChange={(e) => setRevisionInstructionsInput(e.target.value)}
                    placeholder="Enter explicit revision directives, formatting corrections, and response-to-reviewers expectations..."
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
                  <button
                    type="button"
                    onClick={() => setIsRevisionModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-700 text-slate-700 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-medium cursor-pointer"
                  >
                    Submit Revision Request
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ASSIGN REVIEWER MODAL */}
      <AnimatePresence>
        {isReviewerModalOpen && selectedArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-stone-900 rounded-2xl max-w-lg w-full p-6 space-y-4 border border-stone-200 dark:border-stone-800 shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
                <h3 className="font-serif font-bold text-base text-slate-900 dark:text-slate-100">
                  Assign Peer Reviewer: {selectedArticle.trackingId}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsReviewerModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAssignReviewer} className="space-y-4 text-xs font-serif">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Select Peer Reviewer from Registered Board *
                  </label>
                  <select
                    value={selectedReviewerId}
                    onChange={(e) => setSelectedReviewerId(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-slate-100"
                  >
                    {reviewers.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.name} — {r.affiliation} ({r.track || r.expertise})
                      </option>
                    ))}
                  </select>
                </div>

                <p className="text-[11px] text-slate-500 italic">
                  Assigning a reviewer automatically updates the manuscript to <strong>Under Review</strong> and records an editorial note in the submission log.
                </p>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
                  <button
                    type="button"
                    onClick={() => setIsReviewerModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-700 text-slate-700 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-medium cursor-pointer"
                  >
                    Confirm Assignment
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
