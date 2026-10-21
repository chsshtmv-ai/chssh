import React, { useState } from 'react';
import { useJournal } from '../../context/JournalContext';
import { Article, Author } from '../../types';
import { parseGoogleDriveUrl, validateGoogleDriveLink } from '../../utils/googleDriveUtils';
import { generateAcademicDoi } from '../../utils/doiUtils';
import { GoogleDrivePreviewModal } from '../GoogleDrivePreviewModal';
import {
  FileText,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  Eye,
  ExternalLink,
  Plus,
  Trash2,
  Edit3,
  Search,
  Filter,
  Globe,
  Lock,
  Sparkles,
  BookOpen,
  Code2,
  Copy,
  Check,
  ShieldCheck,
  RefreshCw,
  FolderOpen
} from 'lucide-react';

export const AdminGoogleDriveRegistrar: React.FC = () => {
  const {
    articles,
    registerGoogleDrivePaper,
    updateArticle,
    deleteArticle,
    content,
    uploadedAssets,
    registerGoogleDriveAsset,
    deleteJournalAsset
  } = useJournal();

  // Active section inside registrar
  const [activeSection, setActiveSection] = useState<'register' | 'manage' | 'downloads' | 'script'>('register');

  // New paper form state
  const [title, setTitle] = useState('');
  const [authorsInput, setAuthorsInput] = useState('');
  const [abstract, setAbstract] = useState('');
  const [keywordsInput, setKeywordsInput] = useState('');
  const [track, setTrack] = useState('Critical Humanities & Social Sciences');
  const [volume, setVolume] = useState<number>(7);
  const [issue, setIssue] = useState<number>(1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [pages, setPages] = useState('1 24');
  const [doi, setDoi] = useState('');
  const [driveUrl, setDriveUrl] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [status, setStatus] = useState<'published' | 'draft'>('published');

  // Editing state
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);

  // Downloads registration form state
  const [assetId, setAssetId] = useState('author_template');
  const [customAssetId, setCustomAssetId] = useState('');
  const [assetTitle, setAssetTitle] = useState('');
  const [assetDesc, setAssetDesc] = useState('');
  const [assetCategory, setAssetCategory] = useState<'template' | 'cover' | 'content_page' | 'certificate' | 'plagiarism' | 'document'>('template');
  const [assetDriveUrl, setAssetDriveUrl] = useState('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);

  // Search & filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  // Preview modal state
  const [previewItem, setPreviewItem] = useState<{
    isOpen: boolean;
    title: string;
    authors?: string;
    driveUrl?: string;
    driveFileId?: string;
    volumeInfo?: string;
    doi?: string;
    fileName?: string;
  }>({
    isOpen: false,
    title: ''
  });

  // Real-time Drive URL validation
  const parsedDrive = parseGoogleDriveUrl(driveUrl);
  const parsedAssetDrive = parseGoogleDriveUrl(assetDriveUrl);

  const resetForm = () => {
    setTitle('');
    setAuthorsInput('');
    setAbstract('');
    setKeywordsInput('');
    setPages('1 24');
    setDoi('');
    setDriveUrl('');
    setCoverImage('');
    setStatus('published');
    setEditingArticleId(null);
  };

  const handleAutoDoi = () => {
    const auto = generateAcademicDoi(content.doi_prefix, {
      year,
      volume,
      issue,
      trackingId: `CHSSH-${year}-${Math.floor(1000 + Math.random() * 9000)}`
    });
    setDoi(auto);
  };

  const handleSubmitPaper = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!title.trim()) {
      setErrorMessage('Please enter the paper title.');
      return;
    }
    if (!driveUrl.trim()) {
      setErrorMessage('Please provide a Google Drive document URL.');
      return;
    }

    const driveVal = validateGoogleDriveLink(driveUrl);
    if (!driveVal.valid) {
      setErrorMessage(driveVal.error || 'Invalid Google Drive URL. Please check the URL.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Parse authors
      const parsedAuthors: Author[] = authorsInput
        .split('\n')
        .map(l => l.trim())
        .filter(Boolean)
        .map((line, idx) => {
          const parts = line.split(',');
          return {
            id: `auth_${Date.now()}_${idx}`,
            name: parts[0]?.trim() || 'Author',
            affiliation: parts[1]?.trim() || content.institution_affiliation || 'Academic Scholar',
            country: parts[2]?.trim() || 'International',
            email: parts[3]?.trim() || 'scholar@chssh-journal.org',
            isCorresponding: idx === 0
          };
        });

      if (parsedAuthors.length === 0) {
        parsedAuthors.push({
          id: `auth_${Date.now()}_0`,
          name: 'Academic Scholar',
          email: 'scholar@chssh-journal.org',
          affiliation: content.institution_affiliation || 'Faculty of Social Sciences & Humanities',
          country: 'International',
          isCorresponding: true
        });
      }

      const parsedKeywords = keywordsInput
        .split(/[,;\n]/)
        .map(k => k.trim())
        .filter(Boolean);

      if (editingArticleId) {
        const existing = articles.find(a => a.id === editingArticleId);
        if (existing) {
          const updated: Article = {
            ...existing,
            title: title.trim(),
            authors: parsedAuthors,
            abstract: abstract.trim(),
            keywords: parsedKeywords.length ? parsedKeywords : ['Research Article'],
            track,
            volume,
            issue,
            year,
            pages: pages.trim() || '1 24',
            doi: doi.trim() || undefined,
            driveUrl: driveUrl.trim(),
            driveFileId: driveVal.fileId,
            driveResourceType: parsedDrive.resourceType,
            coverImage: coverImage.trim() || undefined,
            status: status === 'published' ? 'published' : 'submitted',
            publishedDate: status === 'published' ? (existing.publishedDate || new Date().toISOString().split('T')[0]) : undefined,
            lastUpdatedDate: new Date().toISOString().split('T')[0]
          };
          updateArticle(updated);
          setSuccessMessage(`Document "${title}" updated successfully in Firestore!`);
          resetForm();
          setActiveSection('manage');
        }
      } else {
        await registerGoogleDrivePaper({
          title: title.trim(),
          authors: parsedAuthors,
          abstract: abstract.trim() || 'Peer-reviewed research paper published in Contemporary Horizons in Social Sciences and Humanities.',
          keywords: parsedKeywords.length ? parsedKeywords : ['Peer-Reviewed Research', 'Open Access', 'CHSSH'],
          track,
          volume,
          issue,
          year,
          pages: pages.trim() || '1 24',
          doi: doi.trim() || undefined,
          driveUrl: driveUrl.trim(),
          coverImage: coverImage.trim() || undefined,
          status
        });

        setSuccessMessage(`Paper "${title}" successfully registered in Firestore linked to Google Drive (${driveVal.fileId})!`);
        resetForm();
        setActiveSection('manage');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setErrorMessage(`Error registering document: ${err.message || 'Please check Firestore connection.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (art: Article) => {
    setEditingArticleId(art.id);
    setTitle(art.title);
    setAuthorsInput(art.authors.map(a => `${a.name}, ${a.affiliation}, ${a.country}${a.email ? `, ${a.email}` : ''}`).join('\n'));
    setAbstract(art.abstract || '');
    setKeywordsInput(art.keywords?.join(', ') || '');
    setTrack(art.track || 'Critical Humanities & Social Sciences');
    setVolume(art.volume || 7);
    setIssue(art.issue || 1);
    setYear(art.year || 2026);
    setPages(art.pages || '1 24');
    setDoi(art.doi || '');
    setDriveUrl(art.driveUrl || (art.driveFileId ? `https://drive.google.com/file/d/${art.driveFileId}/view` : ''));
    setCoverImage(art.coverImage || '');
    setStatus(art.status === 'published' ? 'published' : 'draft');
    setActiveSection('register');
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  const handleTogglePublish = (art: Article) => {
    const newStatus = art.status === 'published' ? 'submitted' : 'published';
    const today = new Date().toISOString().split('T')[0];
    updateArticle({
      ...art,
      status: newStatus,
      publishedDate: newStatus === 'published' ? (art.publishedDate || today) : undefined,
      lastUpdatedDate: today
    });
  };

  const handleSubmitAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetDriveUrl.trim()) return;

    const val = validateGoogleDriveLink(assetDriveUrl);
    if (!val.valid) {
      alert(val.error);
      return;
    }

    const targetId = assetId === 'custom' ? (customAssetId.trim().toLowerCase().replace(/\s+/g, '_') || 'custom_doc') : assetId;
    await registerGoogleDriveAsset({
      id: targetId,
      title: assetTitle.trim() || 'Journal Download Document',
      description: assetDesc.trim() || 'Official document accessible through Google Drive',
      category: assetCategory,
      driveUrl: assetDriveUrl.trim(),
      status: 'active'
    });

    setAssetDriveUrl('');
    setAssetTitle('');
    setAssetDesc('');
    alert(`Document registered for Downloads section!`);
  };

  // Filtered papers
  const filteredArticles = articles.filter(art => {
    const matchesSearch = searchQuery === ''
      ? true
      : art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.trackingId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.authors.some(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'published'
        ? art.status === 'published'
        : art.status !== 'published';

    return matchesSearch && matchesStatus;
  });

  const googleAppsScriptCode = `/**
 * CHSSH Journal — Owner-Only Google Drive Document Registrar & Synchronizer
 * 
 * Setup Instructions:
 * 1. Open Google Apps Script: https://script.google.com/
 * 2. Create a new project named "CHSSH Document Registrar".
 * 3. Paste this entire script into Code.gs.
 * 4. Set YOUR_FOLDER_ID below with your Google Drive folder ID.
 * 5. Run syncDriveFolderToFirebase() manually or set a Time-Driven Trigger (e.g. Every 1 hour).
 * 
 * Security & Reliability:
 * - Runs securely in your personal Google account with your owner permissions.
 * - Directly accesses Firestore REST API using your Google OAuth token (ScriptApp.getOAuthToken()).
 * - No service account secrets or private keys are exposed to the public frontend.
 */

const FIREBASE_PROJECT_ID = "chssh-7b990";
const DATABASE_ID = "ai-studio-contemporaryhori-b64ddd25-0477-4d66-90d6-4cc21dd3318e";
const GOOGLE_DRIVE_FOLDER_ID = "YOUR_GOOGLE_DRIVE_FOLDER_ID"; // <-- Paste your Google Drive Folder ID here

/**
 * Scans your Google Drive folder, ensures files are viewable with the link,
 * and registers any new documents directly into Firestore without uploading via website.
 */
function syncDriveFolderToFirebase() {
  if (GOOGLE_DRIVE_FOLDER_ID === "YOUR_GOOGLE_DRIVE_FOLDER_ID") {
    Logger.log("Please replace GOOGLE_DRIVE_FOLDER_ID with your actual Google Drive folder ID.");
    return;
  }

  const folder = DriveApp.getFolderById(GOOGLE_DRIVE_FOLDER_ID);
  const files = folder.getFiles();
  let registeredCount = 0;

  while (files.hasNext()) {
    const file = files.next();
    const fileId = file.getId();
    const fileName = file.getName();
    const mimeType = file.getMimeType();

    // Ensure sharing permission is set to "Anyone with the link can view"
    try {
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (e) {
      Logger.log("Sharing permission note for " + fileName + ": " + e.message);
    }

    const driveUrl = "https://drive.google.com/file/d/" + fileId + "/view?usp=sharing";
    const cleanTitle = fileName.replace(/\\.[^/.]+$/, "").replace(/_/g, " ");

    // Document ID based on File ID for idempotency (prevents duplicates)
    const docId = "drive_" + fileId;
    registerDocumentRecord(docId, {
      title: cleanTitle,
      fileName: fileName,
      fileType: mimeType === "application/pdf" ? "pdf" : "document",
      driveUrl: driveUrl,
      driveFileId: fileId,
      status: "published", // or "draft"
      volume: 7,
      issue: 1,
      year: new Date().getFullYear(),
      pages: "1–20"
    });

    registeredCount++;
  }

  Logger.log("Sync complete! Successfully checked and registered " + registeredCount + " files.");
}

/**
 * Saves or updates a document metadata record in Firestore using the Firestore REST API.
 */
function registerDocumentRecord(docId, data) {
  const token = ScriptApp.getOAuthToken();
  const today = new Date().toISOString().split("T")[0];
  const url = "https://firestore.googleapis.com/v1/projects/" + FIREBASE_PROJECT_ID +
              "/databases/" + DATABASE_ID + "/documents/articles/" + docId;

  const payload = {
    fields: {
      id: { stringValue: docId },
      trackingId: { stringValue: "CHSSH-" + (data.year || 2026) + "-" + docId.slice(-4).toUpperCase() },
      title: { stringValue: data.title },
      abstract: { stringValue: "Peer-reviewed research paper archived in Contemporary Horizons in Social Sciences and Humanities." },
      keywords: { arrayValue: { values: [{ stringValue: "Open Access" }, { stringValue: "Peer-Reviewed" }] } },
      track: { stringValue: "Critical Humanities & Social Sciences" },
      status: { stringValue: data.status || "published" },
      driveUrl: { stringValue: data.driveUrl },
      driveFileId: { stringValue: data.driveFileId },
      driveResourceType: { stringValue: data.fileType || "pdf" },
      publishedFileName: { stringValue: data.fileName || (docId + ".pdf") },
      publishedFileType: { stringValue: "pdf" },
      volume: { integerValue: String(data.volume || 7) },
      issue: { integerValue: String(data.issue || 1) },
      year: { integerValue: String(data.year || 2026) },
      pages: { stringValue: data.pages || "1–24" },
      publishedDate: { stringValue: today },
      submissionDate: { stringValue: today },
      lastUpdatedDate: { stringValue: today },
      authors: {
        arrayValue: {
          values: [
            {
              mapValue: {
                fields: {
                  name: { stringValue: "Contributing Scholar" },
                  affiliation: { stringValue: "Faculty of Social Sciences & Humanities" },
                  country: { stringValue: "International" },
                  isCorresponding: { booleanValue: true }
                }
              }
            }
          ]
        }
      }
    }
  };

  const options = {
    method: "patch",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json"
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  const code = response.getResponseCode();
  if (code >= 200 && code < 300) {
    Logger.log("Successfully recorded document in Firestore: " + data.title + " (" + docId + ")");
  } else {
    Logger.log("Firestore API Response (" + code + "): " + response.getContentText());
  }
}
`;

  return (
    <div className="space-y-6">
      {/* Masthead Banner */}
      <div className="bg-gradient-to-r from-[#0d233a] via-[#103254] to-[#1c355e] text-white p-6 sm:p-8 rounded-2xl border border-sky-900/60 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 uppercase tracking-widest">
              <FolderOpen className="w-4 h-4" />
              <span>Google Drive Document &amp; Issue Manager</span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-slate-100 mt-1">
              Google Drive Cloud Integration Desk
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl font-serif">
              Upload documents directly to your own Google Drive and register their share links here. Papers and downloads embed seamlessly with responsive Google Drive previews and authentic one-click PDF downloads.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-900/60 border border-emerald-700/80 text-emerald-300 text-xs font-semibold font-mono">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Drive Embeds Active</span>
            </span>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-sky-900/60 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveSection('register')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition cursor-pointer ${
              activeSection === 'register'
                ? 'bg-sky-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-300 hover:bg-sky-900/50'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>{editingArticleId ? 'Edit Paper' : 'Register New Paper'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('manage')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition cursor-pointer ${
              activeSection === 'manage'
                ? 'bg-sky-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-300 hover:bg-sky-900/50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Published Papers Roster ({articles.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('downloads')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition cursor-pointer ${
              activeSection === 'downloads'
                ? 'bg-sky-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-300 hover:bg-sky-900/50'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            <span>Downloads Section Links</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('script')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition cursor-pointer ${
              activeSection === 'script'
                ? 'bg-sky-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-300 hover:bg-sky-900/50'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Google Apps Script Automation</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 rounded-xl flex items-center justify-between gap-3 text-emerald-900 dark:text-emerald-200 text-xs font-semibold animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button type="button" onClick={() => setSuccessMessage(null)} className="text-emerald-600 hover:text-emerald-800 p-1">
            &times;
          </button>
        </div>
      )}
      {errorMessage && (
        <div className="p-4 bg-red-50 dark:bg-red-950/70 border border-red-300 dark:border-red-800 rounded-xl flex items-center justify-between gap-3 text-red-900 dark:text-red-200 text-xs font-semibold animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button type="button" onClick={() => setErrorMessage(null)} className="text-red-600 hover:text-red-800 p-1">
            &times;
          </button>
        </div>
      )}

      {/* SECTION 1: REGISTER NEW PAPER VIA GOOGLE DRIVE */}
      {activeSection === 'register' && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="border-b border-stone-100 dark:border-stone-800 pb-4 flex items-center justify-between flex-wrap gap-2">
            <div>
              <h4 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100">
                {editingArticleId ? 'Edit Google Drive Paper Record' : 'Register Google Drive Research Paper'}
              </h4>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                Paste any Google Drive share link, preview URL, or Google Docs/Sheets link. The website directly previews the document and serves authentic PDF downloads.
              </p>
            </div>
            {editingArticleId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200"
              >
                Cancel Editing
              </button>
            )}
          </div>

          <form onSubmit={handleSubmitPaper} className="space-y-5">
            {/* 1. Google Drive URL Input & Live Validator */}
            <div className="p-4 bg-sky-50/70 dark:bg-sky-950/40 rounded-xl border border-sky-200 dark:border-sky-800 space-y-3">
              <label htmlFor="drive-url-input" className="block text-xs font-bold text-sky-950 dark:text-sky-200 uppercase tracking-wider">
                Google Drive Document URL <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="drive-url-input"
                  type="text"
                  value={driveUrl}
                  onChange={(e) => setDriveUrl(e.target.value)}
                  placeholder="https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing"
                  className="w-full text-xs font-mono px-3.5 py-2.5 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>

              {/* Real-time Link Detection Indicator */}
              {driveUrl && (
                <div className="pt-1">
                  {parsedDrive.isValid ? (
                    <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-xs">
                      <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>
                          Valid Google Drive Document detected! (Format:{' '}
                          <strong className="uppercase font-mono">{parsedDrive.resourceType}</strong>, File ID:{' '}
                          <code className="bg-emerald-100 dark:bg-emerald-900 px-1 py-0.5 rounded font-mono font-bold">
                            {parsedDrive.fileId}
                          </code>
                          )
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewItem({
                              isOpen: true,
                              title: title || 'Google Drive Document Preview',
                              driveUrl
                            })
                          }
                          className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Test Embed Preview</span>
                        </button>
                        {parsedDrive.directViewUrl && (
                          <a
                            href={parsedDrive.directViewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-emerald-700 dark:text-emerald-300 hover:underline inline-flex items-center gap-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{parsedDrive.error || 'Please provide a valid Google Drive URL or File ID.'}</span>
                    </div>
                  )}
                </div>
              )}

              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                <strong>Sharing requirement:</strong> The file must be shared in Google Drive as <em>"Anyone with the link — Viewer"</em> so journal readers can view and download the paper without requesting access.
              </p>
            </div>

            {/* 2. Paper Title & Abstract */}
            <div className="space-y-4">
              <div>
                <label htmlFor="paper-title-input" className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Research Paper Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="paper-title-input"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Critical Pedagogy and Epistemic Pluralism in Post-Colonial Curriculum Frameworks"
                  className="w-full text-xs font-serif font-bold px-3.5 py-2.5 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="paper-authors-input" className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Authors &amp; Affiliations (one author per line: Name, Affiliation, Country)
                  </label>
                  <textarea
                    id="paper-authors-input"
                    rows={3}
                    value={authorsInput}
                    onChange={(e) => setAuthorsInput(e.target.value)}
                    placeholder="Dr. Eleanor Vance, University of Oxford, United Kingdom&#10;Prof. Kwame Mensah, University of Ghana, Ghana"
                    className="w-full text-xs px-3.5 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl outline-none focus:ring-2 focus:ring-sky-500 font-sans"
                  />
                </div>

                <div>
                  <label htmlFor="paper-keywords-input" className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Keywords (comma-separated)
                  </label>
                  <textarea
                    id="paper-keywords-input"
                    rows={3}
                    value={keywordsInput}
                    onChange={(e) => setKeywordsInput(e.target.value)}
                    placeholder="Critical Scholarship, Epistemology, Higher Education Policy, Post-Colonial Theory"
                    className="w-full text-xs px-3.5 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl outline-none focus:ring-2 focus:ring-sky-500 font-sans"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="paper-abstract-input" className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Abstract
                </label>
                <textarea
                  id="paper-abstract-input"
                  rows={4}
                  value={abstract}
                  onChange={(e) => setAbstract(e.target.value)}
                  placeholder="Comprehensive scholarly abstract synthesizing the research questions, methodological framework, empirical corpus, and critical implications..."
                  className="w-full text-xs font-serif px-3.5 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* 3. Issue, Volume, DOI, & Track */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Volume / Issue / Year
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    placeholder="Vol"
                    className="w-1/3 text-xs px-2 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg"
                  />
                  <input
                    type="number"
                    value={issue}
                    onChange={(e) => setIssue(Number(e.target.value))}
                    placeholder="Iss"
                    className="w-1/3 text-xs px-2 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg"
                  />
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    placeholder="Year"
                    className="w-1/3 text-xs px-2 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="paper-pages-input" className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Pages Range
                </label>
                <input
                  id="paper-pages-input"
                  type="text"
                  value={pages}
                  onChange={(e) => setPages(e.target.value)}
                  placeholder="e.g. 1 24"
                  className="w-full text-xs px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="paper-doi-input" className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                    Academic DOI
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoDoi}
                    className="text-[10px] text-sky-600 dark:text-sky-400 font-bold hover:underline cursor-pointer"
                  >
                    Auto-Generate
                  </button>
                </div>
                <input
                  id="paper-doi-input"
                  type="text"
                  value={doi}
                  onChange={(e) => setDoi(e.target.value)}
                  placeholder="10.5281/chssh.2026.7101"
                  className="w-full text-xs font-mono px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg"
                />
              </div>

              <div>
                <label htmlFor="paper-track-select" className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Subject Track
                </label>
                <select
                  id="paper-track-select"
                  value={track}
                  onChange={(e) => setTrack(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg"
                >
                  <option value="Critical Humanities & Social Sciences">Critical Humanities & Social Sciences</option>
                  <option value="Anthropology, Sociology & Cultural Studies">Anthropology, Sociology & Cultural Studies</option>
                  <option value="Political Theory, Governance & Human Rights">Political Theory, Governance & Human Rights</option>
                  <option value="Philosophy, Ethics & Intellectual History">Philosophy, Ethics & Intellectual History</option>
                  <option value="Media, Communications & Digital Culture">Media, Communications & Digital Culture</option>
                  <option value="Literary Criticism & Comparative Literature">Literary Criticism & Comparative Literature</option>
                </select>
              </div>
            </div>

            {/* 4. Publication Status & Cover Image */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label htmlFor="paper-status-select" className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Publication Status <span className="text-red-500">*</span>
                </label>
                <select
                  id="paper-status-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'published' | 'draft')}
                  className="w-full text-xs font-bold px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg"
                >
                  <option value="published">Published — Immediately Visible on Public Journal Website</option>
                  <option value="draft">Draft / Editorial Staging — Hidden from Public Website</option>
                </select>
                <p className="text-[10px] text-stone-400 mt-1">
                  Only documents explicitly set to <strong>Published</strong> appear on the public Current Issue, Archive, and Hero sections.
                </p>
              </div>

              <div>
                <label htmlFor="paper-cover-input" className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Optional Article Cover Image URL
                </label>
                <input
                  id="paper-cover-input"
                  type="text"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-... or Google Drive image URL"
                  className="w-full text-xs px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg"
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100 dark:border-stone-800">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#1c355e] hover:bg-[#102344] text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>{isSubmitting ? 'Saving to Firestore...' : editingArticleId ? 'Save Updated Paper' : 'Save & Register Document'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SECTION 2: MANAGE REGISTERED PAPERS */}
      {activeSection === 'manage' && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-4">
            <div>
              <h4 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                Registered Google Drive Research Papers
              </h4>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                All records stored in Firestore. Only items marked Published are visible on the public website.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search papers or authors..."
                  className="pl-8 pr-3 py-1.5 text-xs bg-stone-50 dark:bg-stone-850 border border-stone-300 dark:border-stone-700 rounded-lg outline-none"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-1.5 text-xs bg-stone-50 dark:bg-stone-850 border border-stone-300 dark:border-stone-700 rounded-lg outline-none font-semibold"
              >
                <option value="all">All Statuses ({articles.length})</option>
                <option value="published">Published Only</option>
                <option value="draft">Drafts Only</option>
              </select>

              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setActiveSection('register');
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#1c355e] text-white rounded-lg text-xs font-semibold hover:bg-[#102344]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Paper</span>
              </button>
            </div>
          </div>

          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {filteredArticles.length === 0 ? (
              <div className="py-12 text-center text-stone-400 space-y-2">
                <FileText className="w-10 h-10 mx-auto text-stone-300 dark:text-stone-700" />
                <p className="text-sm font-semibold">No registered research papers found.</p>
                <p className="text-xs">
                  Click "Register New Paper" above to link a Google Drive document and publish it in the journal.
                </p>
              </div>
            ) : (
              filteredArticles.map((art, index) => {
                const parsed = parseGoogleDriveUrl(art.driveUrl || art.driveFileId || '');
                const isPublished = art.status === 'published';
                const articleKey = art.id ? `art-${art.id}-${index}` : `art-${art.trackingId || 'item'}-${index}`;

                return (
                  <div key={articleKey} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold bg-[#102344] text-white px-2 py-0.5 rounded">
                          {art.trackingId}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                            isPublished
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                              : 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                          }`}
                        >
                          {isPublished ? 'Published Live' : 'Draft / Staging'}
                        </span>
                        <span className="text-xs text-stone-500">
                          Vol. {art.volume || 7}, Iss. {art.issue || 1} ({art.year || 2026})
                        </span>
                        {art.doi && (
                          <span className="text-[11px] font-mono text-sky-700 dark:text-sky-300">
                            DOI: {art.doi}
                          </span>
                        )}
                      </div>

                      <h5 className="font-serif text-sm font-bold text-stone-900 dark:text-stone-100">
                        {art.title}
                      </h5>

                      <p className="text-xs text-stone-500 dark:text-stone-400">
                        {art.authors.map(a => a.name).join(', ')} • Track: {art.track}
                      </p>

                      <div className="flex items-center gap-2 text-xs font-mono text-stone-500 pt-1">
                        <span className="text-sky-700 dark:text-sky-400 flex items-center gap-1">
                          <LinkIcon className="w-3 h-3" />
                          <span>Google Drive ID: {art.driveFileId || parsed.fileId || 'Direct Storage'}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap shrink-0">
                      {/* Preview Button */}
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewItem({
                            isOpen: true,
                            title: art.title,
                            authors: art.authors.map(a => a.name).join(', '),
                            driveUrl: art.driveUrl,
                            driveFileId: art.driveFileId,
                            volumeInfo: `Vol. ${art.volume || 7}, Iss. ${art.issue || 1} (${art.year || 2026})`,
                            doi: art.doi,
                            fileName: art.publishedFileName || `${art.trackingId}.pdf`
                          })
                        }
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 cursor-pointer"
                        title="Embedded Google Drive Preview"
                      >
                        <Eye className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                        <span>Preview</span>
                      </button>

                      {/* Open in Drive */}
                      {parsed.directViewUrl && (
                        <a
                          href={parsed.directViewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800"
                          title="Open original file in Google Drive"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}

                      {/* Toggle Publish / Draft */}
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(art)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          isPublished
                            ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 hover:bg-amber-200'
                            : 'bg-emerald-700 text-white hover:bg-emerald-800'
                        }`}
                        title={isPublished ? 'Unpublish (make draft)' : 'Publish to live website'}
                      >
                        {isPublished ? (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            <span>Unpublish</span>
                          </>
                        ) : (
                          <>
                            <Globe className="w-3.5 h-3.5" />
                            <span>Publish Live</span>
                          </>
                        )}
                      </button>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => handleEdit(art)}
                        className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 cursor-pointer"
                        title="Edit metadata"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Delete paper "${art.title}" from Firestore?`)) {
                            deleteArticle(art.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900/40 cursor-pointer"
                        title="Delete paper record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* SECTION 3: DOWNLOADS SECTION GOOGLE DRIVE LINKS */}
      {activeSection === 'downloads' && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 space-y-6 shadow-sm">
          <div className="border-b border-stone-100 dark:border-stone-800 pb-4">
            <h4 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
              Downloads Section Google Drive Documents
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Link official journal repository files (Author Formatting Template, Front Cover Page, Plagiarism Declaration, Certificate Template) to Google Drive.
            </p>
          </div>

          <form onSubmit={handleSubmitAsset} className="p-5 bg-stone-50 dark:bg-stone-850 rounded-xl border border-stone-200 dark:border-stone-800 space-y-4">
            <h5 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
              Link Google Drive Document to Downloads Roster
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Document Slot
                </label>
                <select
                  value={assetId}
                  onChange={(e) => setAssetId(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white dark:bg-stone-900 border rounded-lg"
                >
                  <option value="author_template">Author Manuscript Template (.docx)</option>
                  <option value="cover_page">Official Front Cover Page (.pdf)</option>
                  <option value="content_page">Table of Contents / Issue Folio (.pdf)</option>
                  <option value="plagiarism_declaration">Plagiarism & Ethics Declaration (.pdf)</option>
                  <option value="certificate_template">Publication Certificate Template (.pdf)</option>
                  <option value="custom">Custom Editorial Document</option>
                </select>
              </div>

              {assetId === 'custom' && (
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Custom Slot ID
                  </label>
                  <input
                    type="text"
                    value={customAssetId}
                    onChange={(e) => setCustomAssetId(e.target.value)}
                    placeholder="e.g. peer_review_guide"
                    className="w-full text-xs px-3 py-2 bg-white dark:bg-stone-900 border rounded-lg"
                  />
                </div>
              )}

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  value={assetTitle}
                  onChange={(e) => setAssetTitle(e.target.value)}
                  placeholder="e.g. Official Journal Manuscript Formatting Template (2026 Edition)"
                  className="w-full text-xs px-3 py-2 bg-white dark:bg-stone-900 border rounded-lg"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Google Drive URL <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={assetDriveUrl}
                onChange={(e) => setAssetDriveUrl(e.target.value)}
                placeholder="https://drive.google.com/file/d/... or https://docs.google.com/document/d/..."
                className="w-full text-xs font-mono px-3.5 py-2 bg-white dark:bg-stone-900 border rounded-lg"
                required
              />
              {assetDriveUrl && parsedAssetDrive.isValid && (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
                  Detected Google Drive File ID: {parsedAssetDrive.fileId}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end">
              <button
                type="submit"
                className="px-5 py-2 bg-[#1c355e] hover:bg-[#102344] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                Save Download Asset
              </button>
            </div>
          </form>

          {/* Active Assets Table */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
              Current Download Assets in Repository
            </h5>
            <div className="divide-y divide-stone-100 dark:divide-stone-800 text-xs">
              {Object.entries(uploadedAssets || {})
                .filter(([slotKey, item]) => item && item.id !== 'journal_logo' && slotKey !== 'active_pdf')
                .map(([slotKey, item], index) => {
                  if (!item) return null;
                  const isDrive = Boolean(item.driveUrl || item.driveFileId);
                  const assetKey = `drive-asset-${slotKey}-${item.id || index}-${index}`;

                  return (
                    <div key={assetKey} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-stone-900 dark:text-stone-100">{item.title}</span>
                      <p className="text-stone-500 text-[11px]">
                        Slot: <code className="font-mono text-stone-700 dark:text-stone-300">{item.id}</code> • {item.description}
                      </p>
                      {isDrive && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-sky-700 dark:text-sky-400 font-mono">
                          <LinkIcon className="w-3 h-3" />
                          <span>Drive ID: {item.driveFileId || item.driveUrl}</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewItem({
                            isOpen: true,
                            title: item.title,
                            driveUrl: item.driveUrl,
                            driveFileId: item.driveFileId,
                            fileName: item.fileName
                          })
                        }
                        className="px-2.5 py-1 text-xs rounded bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-200"
                      >
                        Preview
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteJournalAsset(item.id)}
                        className="p-1 text-red-500 hover:text-red-700"
                        title="Remove asset"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: GOOGLE APPS SCRIPT AUTOMATION GUIDE */}
      {activeSection === 'script' && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 space-y-5 shadow-sm">
          <div className="border-b border-stone-100 dark:border-stone-800 pb-4">
            <h4 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
              Google Apps Script Owner-Only Automation
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              You can set up a Google Apps Script in your personal Google account attached to your Google Drive folder. Whenever you drop a document into the folder, the script shares it and logs the link.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-700 dark:text-stone-300 font-mono">
                google_apps_script_document_registrar.js
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(googleAppsScriptCode);
                  setCopiedScript(true);
                  setTimeout(() => setCopiedScript(false), 2000);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-300 rounded-lg text-xs font-semibold cursor-pointer border border-stone-200 dark:border-stone-700"
              >
                {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedScript ? 'Copied Script!' : 'Copy Code'}</span>
              </button>
            </div>

            <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
              {googleAppsScriptCode}
            </pre>

            <div className="bg-sky-50 dark:bg-sky-950/40 p-4 rounded-xl border border-sky-200 dark:border-sky-800 space-y-2 text-xs">
              <h5 className="font-bold text-sky-950 dark:text-sky-200">How to Use:</h5>
              <ol className="list-decimal list-inside space-y-1 text-stone-600 dark:text-stone-300">
                <li>Go to <a href="https://script.google.com/" target="_blank" rel="noopener noreferrer" className="text-sky-600 dark:text-sky-400 underline font-semibold">Google Apps Script</a>.</li>
                <li>Create a new project and paste this script.</li>
                <li>Insert your Google Drive Folder ID.</li>
                <li>Run the function or set a trigger to run automatically when files are uploaded.</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Embedded Google Drive Preview Modal */}
      <GoogleDrivePreviewModal
        isOpen={previewItem.isOpen}
        onClose={() => setPreviewItem(prev => ({ ...prev, isOpen: false }))}
        title={previewItem.title}
        authors={previewItem.authors}
        driveUrl={previewItem.driveUrl}
        driveFileId={previewItem.driveFileId}
        volumeInfo={previewItem.volumeInfo}
        doi={previewItem.doi}
        fileName={previewItem.fileName}
      />
    </div>
  );
};
