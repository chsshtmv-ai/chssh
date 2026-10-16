import React, { useState } from 'react';
import { useJournal } from '../../context/JournalContext';
import { Article, ArticleStatus, JournalUploadedAsset } from '../../types';
import {
  LayoutDashboard,
  FileText,
  Users,
  GraduationCap,
  Award,
  UploadCloud,
  Download,
  Lock,
  Edit3,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  Search,
  Filter,
  Eye,
  Plus,
  RefreshCw,
  Save,
  Shield,
  Smartphone,
  ExternalLink,
  BookOpen,
  RotateCcw,
  Check,
  FileCheck,
  Sparkles,
  Loader2,
  X,
  Globe,
  Send
} from 'lucide-react';
import { AdminEditorialBoard } from './AdminEditorialBoard';
import { AdminAdvisoryBoard } from './AdminAdvisoryBoard';
import { AdminReviewersPanel } from './AdminReviewersPanel';
import { AdminManuscriptDownloads } from './AdminManuscriptDownloads';
import { AdminPublicationSection } from './AdminPublicationSection';
import { DocumentPreviewModal } from '../DocumentPreviewModal';
import { triggerFileDownload } from '../../utils/downloadGenerators';
import { getAssetFile } from '../../utils/fileStorage';
import {
  generateCoverPagePdf,
  generateManuscriptTemplatePdf,
  generateTableOfContentsPdf,
  generatePlagiarismDeclarationPdf
} from '../../utils/pdfGenerators';
import { validatePdfFile, getFreshPdfUrl } from '../../services/pdfStorageService';

export const AdminPanel: React.FC = () => {
  const {
    adminActiveSubTab,
    setAdminActiveSubTab,
    setActiveTab,
    articles,
    updateArticleStatus,
    deleteArticle,
    downloadOriginalManuscript,
    setSelectedArticleForView,
    editorialBoard,
    addEditorialMember,
    updateEditorialMember,
    deleteEditorialMember,
    advisoryBoard,
    addAdvisoryMember,
    updateAdvisoryMember,
    deleteAdvisoryMember,
    resetAdvisoryBoardToDefaults,
    reviewers,
    acceptReviewer,
    rejectReviewer,
    updateReviewer,
    deleteReviewer,
    addReviewer,
    content,
    updateContentText,
    resetContentToDefault,
    uploadedAssets,
    uploadJournalAsset,
    deleteJournalAsset,
    resetAssetToDefault,
    uploadPdfAsset,
    fetchActivePdf,
    activePdf,
    adminPhone,
    updateAdminPhone,
    changeAdminPassword,
    smsConfig,
    updateSmsConfig,
    testSmsGateway,
    smsLogs,
    refreshSmsLogs
  } = useJournal();

  // Submissions Management State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<Article | null>(null);
  const [editorialNoteInput, setEditorialNoteInput] = useState('');
  const [newStatusInput, setNewStatusInput] = useState<ArticleStatus>('under_review');
  const [reviewerCommentInput, setReviewerCommentInput] = useState('');

  // Security Management State
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [phoneInput, setPhoneInput] = useState(adminPhone || '');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [phoneSuccess, setPhoneSuccess] = useState(false);
  const [testPhoneInput, setTestPhoneInput] = useState('');
  const [testSmsStatus, setTestSmsStatus] = useState<string | null>(null);

  // Asset Upload, Staging, Preview & Save State
  const [stagedAssets, setStagedAssets] = useState<Record<string, JournalUploadedAsset>>({});
  const [stagedFiles, setStagedFiles] = useState<Record<string, File>>({});
  const [savedSuccessIds, setSavedSuccessIds] = useState<Record<string, boolean>>({});
  const [uploadingSlotId, setUploadingSlotId] = useState<string | null>(null);
  const [uploadStatusText, setUploadStatusText] = useState<Record<string, string>>({});
  const [uploadErrorText, setUploadErrorText] = useState<Record<string, string | null>>({});
  const [fetchingPdfSlot, setFetchingPdfSlot] = useState<string | null>(null);
  const [previewAsset, setPreviewAsset] = useState<JournalUploadedAsset | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [docSlotTabs, setDocSlotTabs] = useState<Record<string, 'manage' | 'publish'>>({});

  const filteredSubmissions = articles.filter((art) => {
    const matchesFilter = statusFilter === 'all' || art.status === statusFilter;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      art.title.toLowerCase().includes(term) ||
      art.trackingId.toLowerCase().includes(term) ||
      art.authors.some((a) => a.name.toLowerCase().includes(term));
    return matchesFilter && matchesSearch;
  });

  const handleUpdateSubmissionStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    const comments = reviewerCommentInput.trim()
      ? [...(selectedSubmission.reviewerComments || []), reviewerCommentInput.trim()]
      : selectedSubmission.reviewerComments;

    updateArticleStatus(
      selectedSubmission.id,
      newStatusInput,
      editorialNoteInput.trim() || undefined,
      comments
    );

    setSelectedSubmission({
      ...selectedSubmission,
      status: newStatusInput,
      editorialNotes: editorialNoteInput.trim() || undefined,
      reviewerComments: comments
    });
    setReviewerCommentInput('');
  };

  // Staged Asset Selection Handler
  const handleStageAssetFile = (
    e: React.ChangeEvent<HTMLInputElement>,
    assetKey: string,
    defaultTitle: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Clear previous error for this slot
    setUploadErrorText((prev) => ({ ...prev, [assetKey]: null }));

    // 1. Validation for PDF files & slots
    const isTargetPdf = file.name.toLowerCase().endsWith('.pdf') || assetKey === 'cover_page';
    if (isTargetPdf) {
      const val = validatePdfFile(file);
      if (!val.valid) {
        setUploadErrorText((prev) => ({
          ...prev,
          [assetKey]: val.error || 'Please select a valid PDF file.'
        }));
        e.target.value = '';
        return;
      }
    }

    const objectUrl = URL.createObjectURL(file);
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
    let fileType = file.type;
    if (!fileType) {
      if (file.name.endsWith('.pdf')) fileType = 'application/pdf';
      else if (file.name.endsWith('.docx'))
        fileType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      else if (file.name.endsWith('.doc')) fileType = 'application/msword';
      else fileType = 'application/octet-stream';
    }

    const staged: JournalUploadedAsset = {
      id: assetKey,
      title: defaultTitle,
      description: `Staged for upload on ${new Date().toLocaleDateString()}`,
      category: 'document',
      fileName: file.name,
      fileSize: sizeMb,
      fileType,
      fileDataUrl: objectUrl,
      fileUrl: objectUrl,
      uploadedAt: new Date().toISOString(),
      isUploaded: true
    };

    setStagedFiles((prev) => ({ ...prev, [assetKey]: file }));
    setStagedAssets((prev) => ({ ...prev, [assetKey]: staged }));
    setSavedSuccessIds((prev) => ({ ...prev, [assetKey]: false }));

    // Asynchronously read base64 in background
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const fullDataUrl = reader.result;
        setStagedAssets((prev) => {
          if (!prev[assetKey]) return prev;
          return {
            ...prev,
            [assetKey]: {
              ...prev[assetKey],
              fileDataUrl: fullDataUrl
            }
          };
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Preview Staged Asset before saving
  const handlePreviewStaged = (assetKey: string) => {
    const staged = stagedAssets[assetKey];
    if (!staged) return;
    setPreviewAsset(staged);
    setIsPreviewOpen(true);
  };

  // Save Staged Asset to Repository & Main Website
  // Follows full flow: PDF Upload -> Storage -> getDownloadURL -> Firestore update -> Mark active
  const handleSaveStagedAsset = async (assetKey: string) => {
    const staged = stagedAssets[assetKey];
    const stagedFile = stagedFiles[assetKey];
    if (!staged) return;

    setUploadingSlotId(assetKey);
    setUploadErrorText((prev) => ({ ...prev, [assetKey]: null }));

    try {
      if (
        stagedFile &&
        (stagedFile.type === 'application/pdf' ||
          stagedFile.name.toLowerCase().endsWith('.pdf') ||
          assetKey === 'cover_page')
      ) {
        // Complete Required Flow:
        await uploadPdfAsset(
          stagedFile,
          assetKey,
          staged.title,
          staged.description,
          (statusMsg) => {
            setUploadStatusText((prev) => ({ ...prev, [assetKey]: statusMsg }));
          }
        );
      } else {
        uploadJournalAsset(staged);
      }

      setStagedAssets((prev) => {
        const updated = { ...prev };
        delete updated[assetKey];
        return updated;
      });
      setStagedFiles((prev) => {
        const updated = { ...prev };
        delete updated[assetKey];
        return updated;
      });

      setSavedSuccessIds((prev) => ({ ...prev, [assetKey]: true }));
      setUploadStatusText((prev) => ({ ...prev, [assetKey]: 'PDF updated successfully.' }));
      setTimeout(() => {
        setSavedSuccessIds((prev) => ({ ...prev, [assetKey]: false }));
        setUploadStatusText((prev) => ({ ...prev, [assetKey]: '' }));
      }, 5000);
    } catch (err: any) {
      console.error('Error saving staged asset:', err);
      setUploadErrorText((prev) => ({
        ...prev,
        [assetKey]:
          err.message ||
          'PDF uploaded to storage, but the active PDF could not be updated. The previous active PDF should remain unchanged.'
      }));
    } finally {
      setUploadingSlotId(null);
    }
  };

  // Discard Staged Asset
  const handleDiscardStaged = (assetKey: string) => {
    setStagedAssets((prev) => {
      const updated = { ...prev };
      delete updated[assetKey];
      return updated;
    });
    setStagedFiles((prev) => {
      const updated = { ...prev };
      delete updated[assetKey];
      return updated;
    });
    setUploadErrorText((prev) => ({ ...prev, [assetKey]: null }));
  };

  // Preview Active Asset (fetches latest active PDF from Firebase/Firestore)
  const handlePreviewActiveAsset = async (assetKey: string, defaultTitle: string) => {
    setIsLoadingPreview(true);
    setFetchingPdfSlot(assetKey);
    try {
      let active =
        uploadedAssets?.[assetKey] ||
        (assetKey === 'cover_page' ? uploadedAssets?.['active_pdf'] : null);

      try {
        const fresh = await fetchActivePdf(assetKey);
        if (fresh) active = fresh;
      } catch (err) {
        console.warn('Note on fetching latest active PDF:', err);
      }

      const effectiveUrl = active?.downloadURL || active?.fileUrl || active?.fileDataUrl;
      let finalUrl = effectiveUrl;

      if (!finalUrl) {
        finalUrl = (await getAssetFile(assetKey)) || undefined;
      }

      // Only if genuinely no active PDF exists in Firebase or local storage
      if (!finalUrl) {
        if (assetKey === 'cover_page') finalUrl = generateCoverPagePdf(content);
        else if (assetKey === 'author_template') finalUrl = generateManuscriptTemplatePdf(content);
        else if (assetKey === 'content_page') finalUrl = generateTableOfContentsPdf(content, articles);
        else if (assetKey === 'plagiarism_declaration') finalUrl = generatePlagiarismDeclarationPdf(content);
      }

      setPreviewAsset({
        id: assetKey,
        title: active?.title || defaultTitle,
        description: active?.description || 'Active Document in Official Repository',
        category: active?.category || 'document',
        fileName: active?.fileName || `${assetKey}.pdf`,
        fileSize: active?.fileSize || 'Standard Document',
        fileType: active?.fileType || 'application/pdf',
        fileDataUrl: finalUrl ? (finalUrl.startsWith('http') ? getFreshPdfUrl(finalUrl) : finalUrl) : undefined,
        downloadURL: active?.downloadURL,
        fileUrl: active?.downloadURL || active?.fileUrl,
        uploadedAt: active?.uploadedAt || new Date().toISOString(),
        isUploaded: Boolean(active?.isUploaded || active?.downloadURL)
      });
      setIsPreviewOpen(true);
    } catch (err) {
      console.error('Error previewing active asset:', err);
      alert('Unable to load the latest PDF. Please try again.');
    } finally {
      setIsLoadingPreview(false);
      setFetchingPdfSlot(null);
    }
  };

  // Test Download of Active Asset
  const handleDownloadActiveAsset = async (assetKey: string, fallbackFileName: string) => {
    let active =
      uploadedAssets?.[assetKey] ||
      (assetKey === 'cover_page' ? uploadedAssets?.['active_pdf'] : null);

    try {
      const fresh = await fetchActivePdf(assetKey);
      if (fresh) active = fresh;
    } catch {}

    const targetUrl = active?.downloadURL || active?.fileUrl || active?.fileDataUrl;
    if (targetUrl) {
      triggerFileDownload(
        targetUrl,
        active?.fileName || fallbackFileName,
        active?.fileType || 'application/pdf'
      );
      return;
    }

    let localUrl = (await getAssetFile(assetKey)) || undefined;
    if (!localUrl) {
      if (assetKey === 'cover_page') localUrl = generateCoverPagePdf(content);
      else if (assetKey === 'author_template') localUrl = generateManuscriptTemplatePdf(content);
      else if (assetKey === 'content_page') localUrl = generateTableOfContentsPdf(content, articles);
      else if (assetKey === 'plagiarism_declaration') localUrl = generatePlagiarismDeclarationPdf(content);
    }
    if (localUrl) {
      triggerFileDownload(
        localUrl,
        active?.fileName || fallbackFileName,
        active?.fileType || 'application/pdf'
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Admin Subtabs Bar */}
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200/90 dark:border-stone-800 p-2 shadow-2xs overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max text-xs font-medium">
          <button
            type="button"
            onClick={() => setAdminActiveSubTab('submissions')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${
              adminActiveSubTab === 'submissions'
                ? 'bg-[#102344] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-stone-800'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Manuscripts ({articles.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setAdminActiveSubTab('publication')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${
              adminActiveSubTab === 'publication'
                ? 'bg-[#102344] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-stone-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Typesetting &amp; DOIs</span>
          </button>

          <button
            type="button"
            onClick={() => setAdminActiveSubTab('texts')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${
              adminActiveSubTab === 'texts'
                ? 'bg-[#102344] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-stone-800'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Site Texts CMS</span>
          </button>

          <button
            type="button"
            onClick={() => setAdminActiveSubTab('board')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${
              adminActiveSubTab === 'board'
                ? 'bg-[#102344] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-stone-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Editorial Board ({editorialBoard.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setAdminActiveSubTab('advisory')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${
              adminActiveSubTab === 'advisory'
                ? 'bg-[#102344] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-stone-800'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Advisory Board ({advisoryBoard.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setAdminActiveSubTab('reviewers')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${
              adminActiveSubTab === 'reviewers'
                ? 'bg-[#102344] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-stone-800'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Reviewers ({reviewers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setAdminActiveSubTab('assets')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${
              adminActiveSubTab === 'assets'
                ? 'bg-[#102344] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-stone-800'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Document Assets</span>
          </button>

          <button
            type="button"
            onClick={() => setAdminActiveSubTab('downloads')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${
              adminActiveSubTab === 'downloads'
                ? 'bg-[#102344] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-stone-800'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Author Files</span>
          </button>

          <button
            type="button"
            onClick={() => setAdminActiveSubTab('security')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${
              adminActiveSubTab === 'security'
                ? 'bg-[#102344] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-stone-800'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Security &amp; SMS</span>
          </button>
        </div>
      </div>

      {/* SUBTAB: Submissions Management */}
      {adminActiveSubTab === 'submissions' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200/90 dark:border-stone-800 p-4 sm:p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter manuscripts by title, tracking ID, or author..."
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-slate-100"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-800 dark:text-slate-200"
                >
                  <option value="all">All Statuses ({articles.length})</option>
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="revision_requested">Revision Requested</option>
                  <option value="accepted">Accepted</option>
                  <option value="published">Published</option>
                  <option value="rejected">Declined</option>
                </select>
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-stone-800 text-xs">
              {filteredSubmissions.map((art) => (
                <div
                  key={art.id}
                  className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-stone-800/20 p-2 rounded-lg"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-[#102344] dark:text-sky-300">
                        {art.trackingId}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-stone-800 text-slate-700 dark:text-slate-300 uppercase">
                        {art.status.replace('_', ' ')}
                      </span>
                      <span className="text-slate-400 text-[11px]">{art.submissionDate}</span>
                    </div>
                    <h3 className="font-serif font-semibold text-slate-900 dark:text-slate-100 text-sm">
                      {art.title}
                    </h3>
                    <p className="text-slate-500 text-[11px]">
                      Authors: {art.authors.map((a) => a.name).join(', ')} • Track: {art.track}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSubmission(art);
                        setNewStatusInput(art.status);
                        setEditorialNoteInput(art.editorialNotes || '');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#102344] text-white text-xs font-medium hover:bg-[#1a386c] cursor-pointer"
                    >
                      Evaluate &amp; Status
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadOriginalManuscript(art)}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-stone-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                      title="Download Author Manuscript"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Delete submission "${art.title}"?`)) {
                          deleteArticle(art.id);
                        }
                      }}
                      className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 hover:bg-red-50 cursor-pointer"
                      title="Delete Submission"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {filteredSubmissions.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  No manuscripts found matching current filter.
                </div>
              )}
            </div>
          </div>

          {/* Submission Evaluation Modal */}
          {selectedSubmission && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-stone-200 dark:border-stone-800 p-6 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-stone-800 pb-3">
                  <div>
                    <span className="text-[11px] font-mono text-slate-500">
                      Tracking ID: {selectedSubmission.trackingId}
                    </span>
                    <h2 className="text-base font-serif font-bold text-slate-900 dark:text-slate-100">
                      Manuscript Peer Review &amp; Status Decision
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedSubmission(null)}
                    className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
                  >
                    &times;
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                      {selectedSubmission.title}
                    </h3>
                    <p className="text-slate-500 mt-1 line-clamp-3">{selectedSubmission.abstract}</p>
                  </div>

                  <form onSubmit={handleUpdateSubmissionStatus} className="space-y-4 pt-2">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Update Manuscript Status
                      </label>
                      <select
                        value={newStatusInput}
                        onChange={(e) => setNewStatusInput(e.target.value as ArticleStatus)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-slate-100 font-medium"
                      >
                        <option value="submitted">Submitted (Desk Screening)</option>
                        <option value="under_review">Under Double-Blind Peer Review</option>
                        <option value="revision_requested">Revision Requested</option>
                        <option value="accepted">Accepted for Publication</option>
                        <option value="published">Published</option>
                        <option value="rejected">Declined</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Official Editorial Note (Visible to Authors)
                      </label>
                      <textarea
                        rows={3}
                        value={editorialNoteInput}
                        onChange={(e) => setEditorialNoteInput(e.target.value)}
                        placeholder="Add decision remarks, guidance for revisions, or review timeline..."
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-slate-100"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Add Evaluator / Peer Reviewer Report Comment
                      </label>
                      <textarea
                        rows={2}
                        value={reviewerCommentInput}
                        onChange={(e) => setReviewerCommentInput(e.target.value)}
                        placeholder="Summary of external peer review findings..."
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-slate-100"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-stone-800">
                      <button
                        type="button"
                        onClick={() => setSelectedSubmission(null)}
                        className="px-4 py-2 rounded-lg border border-slate-200 dark:border-stone-700 text-slate-600 dark:text-slate-300 cursor-pointer"
                      >
                        Close
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-lg bg-[#102344] text-white font-medium hover:bg-[#1a386c] cursor-pointer"
                      >
                        Save Status &amp; Notes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB: Typesetting & DOIs */}
      {adminActiveSubTab === 'publication' && <AdminPublicationSection />}

      {/* SUBTAB: Site Texts CMS */}
      {adminActiveSubTab === 'texts' && (
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200/90 dark:border-stone-800 p-6 shadow-2xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-stone-800 pb-4">
            <div>
              <h2 className="text-lg font-serif font-bold text-slate-900 dark:text-slate-100">
                Site Texts &amp; Editorial Policies CMS
              </h2>
              <p className="text-xs text-slate-500">
                Edit website texts in real time. Changes synchronize with Google Cloud Firestore.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Reset all website texts to scholarly defaults?')) {
                    resetContentToDefault();
                  }
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-stone-700 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
              >
                Reset to Defaults
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Journal Full Name
              </label>
              <input
                type="text"
                value={content.journal_name || ''}
                onChange={(e) => updateContentText('journal_name', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-slate-100 font-serif"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Journal Tagline / Scope Description
              </label>
              <input
                type="text"
                value={content.journal_tagline || ''}
                onChange={(e) => updateContentText('journal_tagline', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Online ISSN
              </label>
              <input
                type="text"
                value={content.issn_online || ''}
                onChange={(e) => updateContentText('issn_online', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Print ISSN
              </label>
              <input
                type="text"
                value={content.issn_print || ''}
                onChange={(e) => updateContentText('issn_print', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                DOI Prefix
              </label>
              <input
                type="text"
                value={content.doi_prefix || ''}
                onChange={(e) => updateContentText('doi_prefix', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Editorial Contact Email
              </label>
              <input
                type="text"
                value={content.contact_email || ''}
                onChange={(e) => updateContentText('contact_email', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB: Editorial Board */}
      {adminActiveSubTab === 'board' && (
        <AdminEditorialBoard
          editorialBoard={editorialBoard}
          addEditorialMember={addEditorialMember}
          updateEditorialMember={updateEditorialMember}
          deleteEditorialMember={deleteEditorialMember}
        />
      )}

      {/* SUBTAB: Advisory Board */}
      {adminActiveSubTab === 'advisory' && (
        <AdminAdvisoryBoard
          advisoryBoard={advisoryBoard}
          addAdvisoryMember={addAdvisoryMember}
          updateAdvisoryMember={updateAdvisoryMember}
          deleteAdvisoryMember={deleteAdvisoryMember}
          resetAdvisoryBoardToDefaults={resetAdvisoryBoardToDefaults}
        />
      )}

      {/* SUBTAB: Reviewers */}
      {adminActiveSubTab === 'reviewers' && (
        <AdminReviewersPanel
          reviewers={reviewers}
          acceptReviewer={acceptReviewer}
          rejectReviewer={rejectReviewer}
          updateReviewer={updateReviewer}
          deleteReviewer={deleteReviewer}
          addReviewer={addReviewer}
        />
      )}

      {/* SUBTAB: Assets Upload */}
      {adminActiveSubTab === 'assets' && (
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200/90 dark:border-stone-800 p-6 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-stone-800 pb-4">
            <div className="space-y-1">
              <h2 className="text-lg font-serif font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-[#102344] dark:text-sky-400" />
                <span>Journal Document &amp; Cover Page Uploads</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Upload PDF or DOCX files for journal issues, templates, and certificates. Each document features interactive preview and save confirmation so it is instantly downloadable from the main website.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveTab('downloads');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-stone-700 bg-slate-50 dark:bg-stone-800 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-stone-750 transition cursor-pointer shrink-0"
              title="Inspect how these official documents appear on the main website downloads page"
            >
              <span>View Main Downloads Page</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#102344] dark:text-sky-400" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            {[
              {
                id: 'cover_page',
                label: 'Journal Cover Page (Vol. 7, No. 1)',
                fallbackFile: 'CHSSH_Volume_7_Cover.pdf'
              },
              {
                id: 'content_page',
                label: 'Table of Contents & Prelims',
                fallbackFile: 'CHSSH_Table_of_Contents.pdf'
              },
              {
                id: 'author_template',
                label: 'Author Manuscript Template',
                fallbackFile: 'CHSSH_Manuscript_Template.docx'
              },
              {
                id: 'certificate_template',
                label: 'Certificate Background / Template',
                fallbackFile: 'CHSSH_Certificate_Template.pdf'
              },
              {
                id: 'plagiarism_declaration',
                label: 'Plagiarism & Ethics Declaration',
                fallbackFile: 'CHSSH_Plagiarism_Declaration.pdf'
              }
            ].map((item) => {
              const currentAsset = uploadedAssets?.[item.id];
              const staged = stagedAssets[item.id];
              const isJustSaved = savedSuccessIds[item.id];
              const fileInputId = `asset-file-input-${item.id}`;

              return (
                <div
                  key={item.id}
                  className={`p-5 rounded-xl border transition-all space-y-4 ${
                    staged
                      ? 'border-amber-400/80 dark:border-amber-500/80 bg-amber-50/40 dark:bg-amber-950/20 shadow-sm ring-1 ring-amber-400/40'
                      : isJustSaved
                      ? 'border-emerald-400/80 dark:border-emerald-500/80 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-sm'
                      : 'border-slate-200 dark:border-stone-800 bg-slate-50/40 dark:bg-stone-850/40'
                  }`}
                >
                  {/* Top Bar: Title & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-serif font-bold text-slate-900 dark:text-slate-100 text-sm">
                        {item.label}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Target Repository Slot: <code className="font-mono text-slate-600 dark:text-slate-300">{item.id}</code>
                      </p>
                    </div>

                    <div>
                      {uploadingSlotId === item.id ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-200 border border-sky-300 dark:border-sky-700">
                          <Loader2 className="w-3 h-3 text-sky-600 dark:text-sky-400 animate-spin" />
                          {uploadStatusText[item.id] || 'Updating PDF...'}
                        </span>
                      ) : staged ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          Pending Save
                        </span>
                      ) : isJustSaved ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700">
                          <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          PDF updated successfully.
                        </span>
                      ) : currentAsset?.isUploaded ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          {currentAsset.status === 'active' || currentAsset.downloadURL ? 'Active on Website' : 'Custom Upload Active'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-slate-200/70 dark:bg-stone-800 text-slate-600 dark:text-slate-400">
                          Default Template
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Document Slot Tabs: Manage File vs Publish to Site */}
                  <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-stone-750 pb-2.5">
                    <button
                      type="button"
                      onClick={() => setDocSlotTabs((prev) => ({ ...prev, [item.id]: 'manage' }))}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
                        (docSlotTabs[item.id] || 'manage') === 'manage'
                          ? 'bg-[#102344] text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-stone-800'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Manage &amp; File</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDocSlotTabs((prev) => ({ ...prev, [item.id]: 'publish' }))}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition relative ${
                        docSlotTabs[item.id] === 'publish'
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/60'
                      }`}
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Publish to Site</span>
                      {staged ? (
                        <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-400 text-amber-950 animate-pulse ml-0.5">
                          Pending
                        </span>
                      ) : currentAsset?.isUploaded ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-0.5" />
                      ) : null}
                    </button>
                  </div>

                  {/* Inline Error Banner */}
                  {uploadErrorText[item.id] && (
                    <div className="p-3 rounded-lg border border-red-300 dark:border-red-800 bg-red-50/90 dark:bg-red-950/50 text-red-800 dark:text-red-200 text-xs flex items-start gap-2 shadow-2xs">
                      <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="font-semibold block">{uploadErrorText[item.id]}</span>
                        <span className="text-[11px] opacity-80 block">The previous active PDF remains safe and unchanged.</span>
                      </div>
                    </div>
                  )}

                  {/* TAB CONTENT: 1. Manage & File */}
                  {(docSlotTabs[item.id] || 'manage') === 'manage' && (
                    <div className="space-y-3">
                      {/* Staged File Alert & Action Strip */}
                      {staged ? (
                        <div className="p-3.5 rounded-lg border border-amber-300 dark:border-amber-700/80 bg-white dark:bg-stone-900 space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                              <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                                {staged.fileName}
                              </span>
                              <span className="text-[11px] text-slate-500 font-mono shrink-0">
                                ({staged.fileSize})
                              </span>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-mono shrink-0">
                              {staged.fileName.endsWith('.docx') ? 'Word DOCX' : 'PDF Doc'}
                            </span>
                          </div>

                          <p className="text-[11px] text-amber-800 dark:text-amber-300/90 leading-tight">
                            File selected. Preview the layout to verify pages and formatting, then click <strong>Publish to Site</strong> to publish it for main website download.
                          </p>

                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => handlePreviewStaged(item.id)}
                              disabled={uploadingSlotId === item.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-xs cursor-pointer transition"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Preview Document</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleSaveStagedAsset(item.id)}
                              disabled={uploadingSlotId === item.id}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-xs cursor-pointer transition"
                              title="Publish this document to the live website"
                            >
                              {uploadingSlotId === item.id ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  <span>{uploadStatusText[item.id] || 'Publishing...'}</span>
                                </>
                              ) : (
                                <>
                                  <Globe className="w-3.5 h-3.5" />
                                  <span>Publish to Site</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDiscardStaged(item.id)}
                              disabled={uploadingSlotId === item.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-stone-700 hover:bg-slate-100 dark:hover:bg-stone-800 disabled:opacity-50 text-slate-600 dark:text-slate-400 text-xs cursor-pointer transition"
                              title="Discard this newly selected file"
                            >
                              <X className="w-3 h-3" />
                              <span>Discard</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Active Saved File Display */
                        <div className="p-3 rounded-lg border border-slate-200 dark:border-stone-750 bg-white dark:bg-stone-900 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              <span className="font-mono text-xs text-slate-800 dark:text-slate-200 truncate font-medium">
                                {currentAsset?.fileName || item.fallbackFile}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 font-mono shrink-0">
                              {currentAsset?.fileSize || 'Standard Asset'}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400 dark:text-slate-500">
                            {currentAsset?.uploadedAt ? (
                              <span>Last Updated: {new Date(currentAsset.uploadedAt).toLocaleString()}</span>
                            ) : (
                              <span>Default Archival Document</span>
                            )}
                            {currentAsset?.downloadURL ? (
                              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-mono">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Firebase Storage Hosted
                              </span>
                            ) : currentAsset?.totalParts ? (
                              <span className="inline-flex items-center gap-1 text-sky-600 dark:text-sky-400 font-mono">
                                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                                Firestore Cloud Synchronized ({currentAsset.totalParts} Parts)
                              </span>
                            ) : null}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons Toolbar for Active File */}
                      {!staged && (
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {/* Preview Button */}
                          <button
                            type="button"
                            onClick={() => handlePreviewActiveAsset(item.id, item.label)}
                            disabled={fetchingPdfSlot === item.id || uploadingSlotId === item.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-slate-50 dark:hover:bg-stone-750 text-slate-700 dark:text-slate-200 font-medium text-xs cursor-pointer transition shadow-2xs disabled:opacity-50"
                            title="Open interactive document preview"
                          >
                            {fetchingPdfSlot === item.id ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-600" />
                                <span>Loading latest PDF...</span>
                              </>
                            ) : (
                              <>
                                <Eye className="w-3.5 h-3.5 text-[#102344] dark:text-sky-400" />
                                <span>Preview</span>
                              </>
                            )}
                          </button>

                          {/* Download Button */}
                          <button
                            type="button"
                            onClick={() => handleDownloadActiveAsset(item.id, item.fallbackFile)}
                            disabled={uploadingSlotId === item.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-slate-50 dark:hover:bg-stone-750 text-slate-700 dark:text-slate-200 font-medium text-xs cursor-pointer transition shadow-2xs disabled:opacity-50"
                            title="Download file to verify local copy"
                          >
                            <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                            <span>Download</span>
                          </button>

                          {/* Upload / Replace File Button */}
                          <label
                            htmlFor={uploadingSlotId ? undefined : fileInputId}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#102344] hover:bg-[#1a386c] text-white text-xs font-semibold shadow-xs transition ${
                              uploadingSlotId === item.id
                                ? 'opacity-50 cursor-not-allowed pointer-events-none'
                                : 'cursor-pointer'
                            }`}
                          >
                            {uploadingSlotId === item.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                            ) : (
                              <UploadCloud className="w-3.5 h-3.5 text-amber-400" />
                            )}
                            <span>
                              {uploadingSlotId === item.id
                                ? (uploadStatusText[item.id] || 'Uploading PDF...')
                                : currentAsset?.isUploaded
                                ? 'Replace File'
                                : 'Upload New File'}
                            </span>
                            <input
                              id={fileInputId}
                              type="file"
                              accept=".pdf,.docx,.doc"
                              disabled={Boolean(uploadingSlotId)}
                              onChange={(e) => handleStageAssetFile(e, item.id, item.label)}
                              className="hidden"
                            />
                          </label>

                          {/* Reset to Default Button */}
                          {currentAsset?.isUploaded && (
                            <button
                              type="button"
                              disabled={Boolean(uploadingSlotId)}
                              onClick={() => {
                                if (window.confirm(`Reset "${item.label}" back to the default journal template?`)) {
                                  resetAssetToDefault(item.id);
                                }
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-stone-800 text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-stone-800 text-xs cursor-pointer transition disabled:opacity-40"
                              title="Revert back to default scholarly template"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Reset</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB CONTENT: 2. Publish to Site */}
                  {docSlotTabs[item.id] === 'publish' && (
                    <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-white dark:bg-stone-900 space-y-3.5">
                      {/* Live Publication Status Header */}
                      <div className="flex items-center justify-between gap-2 border-b border-emerald-100 dark:border-emerald-900/40 pb-2.5">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-xs">
                            Live Website Publication Console
                          </h4>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          {currentAsset?.isUploaded ? 'Live Online' : 'Default Template Active'}
                        </span>
                      </div>

                      {/* Staged Alert inside Publish Tab */}
                      {staged ? (
                        <div className="p-3 rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50/80 dark:bg-amber-950/40 space-y-2">
                          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-semibold text-xs">
                            <UploadCloud className="w-4 h-4 text-amber-600" />
                            <span>Staged Document Ready to Publish</span>
                          </div>
                          <p className="text-[11px] text-amber-800 dark:text-amber-300/90 leading-relaxed">
                            You have selected <strong>{staged.fileName}</strong> ({staged.fileSize}). Click below to instantly publish it to the live website.
                          </p>
                          <button
                            type="button"
                            onClick={() => handleSaveStagedAsset(item.id)}
                            disabled={uploadingSlotId === item.id}
                            className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs cursor-pointer transition"
                          >
                            {uploadingSlotId === item.id ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>{uploadStatusText[item.id] || 'Publishing to Site...'}</span>
                              </>
                            ) : (
                              <>
                                <Globe className="w-4 h-4" />
                                <span>Publish Document to Live Website Now</span>
                              </>
                            )}
                          </button>
                        </div>
                      ) : (
                        /* Current Live Publication Details */
                        <div className="space-y-2 text-xs">
                          <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-stone-850 border border-slate-200/80 dark:border-stone-800">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-400 block">Published File</span>
                              <span className="font-mono font-medium text-slate-800 dark:text-slate-200 truncate block">
                                {currentAsset?.fileName || item.fallbackFile}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-400 block">File Size</span>
                              <span className="font-mono text-slate-600 dark:text-slate-300 block">
                                {currentAsset?.fileSize || 'Standard Document'}
                              </span>
                            </div>
                            <div className="col-span-2">
                              <span className="text-[10px] uppercase font-bold text-slate-400 block">Public Placement</span>
                              <span className="text-slate-700 dark:text-slate-300 block font-medium">
                                {item.id === 'cover_page'
                                  ? 'Homepage Hero Front Cover & Current Issue Folio'
                                  : item.id === 'content_page'
                                  ? 'Table of Contents & Editorial Prelims on Downloads'
                                  : item.id === 'author_template'
                                  ? 'Author Guidelines & Submission Center Downloads'
                                  : item.id === 'certificate_template'
                                  ? 'Author Publication Certificate Framework'
                                  : 'COPE Ethics & Plagiarism Compliance Forms'}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => handlePreviewActiveAsset(item.id, item.label)}
                              disabled={fetchingPdfSlot === item.id || uploadingSlotId === item.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-xs cursor-pointer transition disabled:opacity-50"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Preview Live on Site</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setActiveTab(item.id === 'cover_page' ? 'current' : 'downloads');
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 text-sky-800 dark:text-sky-300 font-semibold text-xs cursor-pointer transition"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Go to {item.id === 'cover_page' ? 'Current Issue' : 'Downloads'} Page</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB: Downloads */}
      {adminActiveSubTab === 'downloads' && (
        <AdminManuscriptDownloads
          onSwitchToPublication={(id) => {
            setAdminActiveSubTab('publication');
          }}
        />
      )}

      {/* SUBTAB: Security & SMS */}
      {adminActiveSubTab === 'security' && (
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200/90 dark:border-stone-800 p-6 shadow-2xs space-y-6">
          <div className="border-b border-slate-100 dark:border-stone-800 pb-3">
            <h2 className="text-lg font-serif font-bold text-slate-900 dark:text-slate-100">
              Admin Security &amp; SMS Gateway Configuration
            </h2>
            <p className="text-xs text-slate-500">
              Manage master access credentials and two-factor mobile verification via Fast2SMS gateway.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Password Change */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-stone-800 space-y-3">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#102344] dark:text-sky-400" />
                <span>Change Admin Password</span>
              </h3>
              <input
                type="password"
                value={newAdminPassword}
                onChange={(e) => setNewAdminPassword(e.target.value)}
                placeholder="Enter new master password"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-slate-100"
              />
              <button
                type="button"
                onClick={() => {
                  if (newAdminPassword.length >= 6) {
                    changeAdminPassword(newAdminPassword);
                    setPasswordSuccess(true);
                    setNewAdminPassword('');
                    setTimeout(() => setPasswordSuccess(false), 2000);
                  }
                }}
                className="px-4 py-2 rounded-lg bg-[#102344] text-white font-medium hover:bg-[#1a386c] cursor-pointer"
              >
                Update Master Password
              </button>
              {passwordSuccess && <span className="text-emerald-600 block">Password updated!</span>}
            </div>

            {/* Admin Phone Update */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-stone-800 space-y-3">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#102344] dark:text-sky-400" />
                <span>Admin Recovery Mobile Phone</span>
              </h3>
              <input
                type="text"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="+91 9708669600"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-slate-100 font-mono"
              />
              <button
                type="button"
                onClick={async () => {
                  await updateAdminPhone(phoneInput);
                  setPhoneSuccess(true);
                  setTimeout(() => setPhoneSuccess(false), 2000);
                }}
                className="px-4 py-2 rounded-lg bg-[#102344] text-white font-medium hover:bg-[#1a386c] cursor-pointer"
              >
                Save Recovery Phone
              </button>
              {phoneSuccess && <span className="text-emerald-600 block">Phone updated!</span>}
            </div>
          </div>
        </div>
      )}

      {/* Global Interactive Document Preview Modal */}
      <DocumentPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        asset={previewAsset}
        dataUrl={previewAsset?.fileDataUrl}
        onDownload={(asset) => {
          if (asset?.fileDataUrl) {
            triggerFileDownload(
              asset.fileDataUrl,
              asset.fileName || `${asset.id}.pdf`,
              asset.fileType || 'application/pdf'
            );
          }
        }}
      />
    </div>
  );
};
