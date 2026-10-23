import React, { useState, useRef, useEffect } from 'react';
import { useJournal } from '../../context/JournalContext';
import { Article } from '../../types';
import {
  generateAcademicDoi,
  validateAcademicDoi,
  normalizeDoi,
  getCanonicalDoiUrl
} from '../../utils/doiUtils';
import {
  verifyPdfSignature,
  formatBytes,
  MAX_PDF_SIZE_BYTES
} from '../../services/documentStorageService';
import {
  UploadCloud,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Download,
  Trash2,
  RefreshCw,
  BookOpen,
  ExternalLink,
  Copy,
  Edit3,
  Save,
  Link as LinkIcon,
  Unlock,
  Lock,
  Award,
  Plus,
  Eye,
  FileText,
  Calendar,
  User,
  Layers,
  ArrowRight
} from 'lucide-react';

interface AdminPublicationSectionProps {
  initialSelectedArticleId?: string;
}

export const AdminPublicationSection: React.FC<AdminPublicationSectionProps> = ({
  initialSelectedArticleId
}) => {
  const {
    content,
    articles,
    updateArticle,
    updateArticleCertificate,
    uploadPublishedPaper,
    removePublishedPaper,
    downloadPublishedPaper,
    viewPublishedPaper,
    downloadOriginalManuscript,
    setSelectedArticleForView
  } = useJournal();

  const [selectedArticleId, setSelectedArticleId] = useState<string>(
    initialSelectedArticleId || (articles.find(a => a.status === 'published')?.id || articles[0]?.id || 'new')
  );

  const [dragActive, setDragActive] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileValidationInfo, setFileValidationInfo] = useState<{ valid: boolean; sizeFormatted?: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [uploadProgressStage, setUploadProgressStage] = useState<string>('');
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Editable Publication Metadata Form States
  const [formTitle, setFormTitle] = useState<string>('');
  const [formAuthorName, setFormAuthorName] = useState<string>('');
  const [formAffiliation, setFormAffiliation] = useState<string>('');
  const [formAuthorEmail, setFormAuthorEmail] = useState<string>('');
  const [formTrack, setFormTrack] = useState<string>('Sociology & Social Theory');
  const [formVolume, setFormVolume] = useState<number>(7);
  const [formIssue, setFormIssue] = useState<number>(1);
  const [formYear, setFormYear] = useState<number>(2026);
  const [formPages, setFormPages] = useState<string>('1–24');
  const [formPublicationDate, setFormPublicationDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formDoi, setFormDoi] = useState<string>('');
  const [formCertificateUrl, setFormCertificateUrl] = useState<string>('');
  const [formAbstract, setFormAbstract] = useState<string>('');

  const [copiedDoi, setCopiedDoi] = useState<boolean>(false);
  const [certSaveSuccess, setCertSaveSuccess] = useState<string | null>(null);
  const [viewLoadingId, setViewLoadingId] = useState<string | null>(null);

  const isCreatingNew = selectedArticleId === 'new';
  const targetArticle = isCreatingNew ? null : articles.find(a => a.id === selectedArticleId);

  // Tracks list
  const tracks = [
    'Sociology & Social Theory',
    'Cultural Studies & Critical Theory',
    'Applied Ethics & Epistemic Justice',
    'History, Memory & Archival Studies',
    'Political Philosophy & Global Governance',
    'Digital Humanities & Computational Social Science'
  ];

  // Sync form inputs when selectedArticleId or targetArticle changes
  useEffect(() => {
    if (targetArticle) {
      setFormTitle(targetArticle.title || '');
      setFormAuthorName(targetArticle.authors.map(a => a.name).join(', ') || '');
      setFormAffiliation(targetArticle.authors[0]?.affiliation || '');
      setFormAuthorEmail(targetArticle.authors[0]?.email || '');
      setFormTrack(targetArticle.track || 'Sociology & Social Theory');
      setFormVolume(targetArticle.volume || 7);
      setFormIssue(targetArticle.issue || 1);
      setFormYear(targetArticle.year || 2026);
      setFormPages(targetArticle.pages || '1–24');
      setFormPublicationDate(targetArticle.publishedDate || new Date().toISOString().split('T')[0]);
      setFormDoi(
        targetArticle.doi ||
        generateAcademicDoi(content.doi_prefix, {
          year: targetArticle.year || 2026,
          volume: targetArticle.volume || 7,
          issue: targetArticle.issue || 1,
          trackingId: targetArticle.trackingId,
          id: targetArticle.id
        })
      );
      setFormCertificateUrl(targetArticle.certificateUrl || '');
      setFormAbstract(targetArticle.abstract || '');
      setSelectedFile(null);
      setFileValidationInfo(null);
      setErrorMsg(null);
    } else if (isCreatingNew) {
      setFormTitle('');
      setFormAuthorName('');
      setFormAffiliation('');
      setFormAuthorEmail('');
      setFormTrack('Sociology & Social Theory');
      setFormVolume(7);
      setFormIssue(1);
      setFormYear(2026);
      setFormPages('1–24');
      setFormPublicationDate(new Date().toISOString().split('T')[0]);
      setFormDoi(generateAcademicDoi(content.doi_prefix, { year: 2026, volume: 7, issue: 1 }));
      setFormCertificateUrl('');
      setFormAbstract('');
      setSelectedFile(null);
      setFileValidationInfo(null);
      setErrorMsg(null);
    }
  }, [selectedArticleId, targetArticle?.id]);

  const handleAutoGenerateDoi = () => {
    const autoDoi = generateAcademicDoi(content.doi_prefix, {
      year: formYear || 2026,
      volume: formVolume || 7,
      issue: formIssue || 1,
      trackingId: targetArticle?.trackingId,
      id: targetArticle?.id
    });
    setFormDoi(autoDoi);
  };

  const handleCopyDoiUrl = (doiStr: string) => {
    const url = getCanonicalDoiUrl(doiStr);
    navigator.clipboard.writeText(url);
    setCopiedDoi(true);
    setTimeout(() => setCopiedDoi(false), 2000);
  };

  const handleSaveCertificateOnly = async () => {
    if (!targetArticle) return;
    const ok = await updateArticleCertificate(targetArticle.id, formCertificateUrl);
    if (ok) {
      setCertSaveSuccess(
        formCertificateUrl.trim()
          ? 'Google Drive certificate link saved! Download Certificate tab is now active in author dashboard.'
          : 'Certificate link removed.'
      );
      setTimeout(() => setCertSaveSuccess(null), 4000);
    }
  };

  const processSelectedPdf = async (file: File) => {
    setErrorMsg(null);
    setUploadProgressStage('Verifying PDF file signature (%PDF header)...');

    // Strict PDF validation: extension, MIME type, size, and %PDF magic bytes
    const check = await verifyPdfSignature(file);
    if (!check.valid) {
      setErrorMsg(check.error || 'Invalid file format: Please select a valid PDF (.pdf) research paper.');
      setSelectedFile(null);
      setFileValidationInfo(null);
      setUploadProgressStage('');
      return;
    }

    setSelectedFile(file);
    setFileValidationInfo({
      valid: true,
      sizeFormatted: formatBytes(file.size)
    });
    setUploadProgressStage('');
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedPdf(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedPdf(e.target.files[0]);
    }
  };

  const handleConfirmPublish = async () => {
    if (!formTitle.trim()) {
      setErrorMsg('Please enter a research paper title.');
      return;
    }
    if (!selectedFile && isCreatingNew) {
      setErrorMsg('Please select a research paper in .pdf format to publish.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);
    setUploadProgressStage('Initiating publishing workflow...');

    try {
      // Build authors structure
      const parsedAuthors = formAuthorName.split(',').map((nameStr, idx) => {
        const cleanName = nameStr.trim();
        return {
          id: `auth_${Date.now()}_${idx}`,
          name: cleanName || 'Author',
          affiliation: formAffiliation.trim() || 'Contemporary Horizons Research Network',
          email: idx === 0 ? formAuthorEmail.trim() : '',
          country: 'India',
          isCorresponding: idx === 0
        };
      });

      const cleanDoi = normalizeDoi(formDoi);

      const metadata: Partial<Article> = {
        title: formTitle.trim(),
        authors: parsedAuthors.length > 0 ? parsedAuthors : [{
          id: `auth_${Date.now()}`,
          name: 'Author Name',
          affiliation: formAffiliation.trim() || 'Institutional Affiliation',
          email: formAuthorEmail.trim(),
          country: 'India',
          isCorresponding: true
        }],
        track: formTrack,
        volume: Number(formVolume) || 7,
        issue: Number(formIssue) || 1,
        year: Number(formYear) || 2026,
        pages: formPages.trim() || '1–24',
        doi: cleanDoi,
        publishedDate: formPublicationDate,
        abstract: formAbstract.trim() || 'Scholarly research paper published in Contemporary Horizons in Social Sciences and Humanities.',
        certificateUrl: formCertificateUrl.trim() || undefined
      };

      if (selectedFile) {
        setUploadProgressStage('Uploading verified PDF to cloud storage...');
        const fileSizeFormatted = formatBytes(selectedFile.size);

        const publishedArt = await uploadPublishedPaper(
          selectedArticleId,
          {
            file: selectedFile,
            publishedFileName: selectedFile.name,
            publishedFileSize: fileSizeFormatted,
            publishedFileType: 'pdf'
          },
          metadata,
          (stage) => setUploadProgressStage(stage)
        );

        if (publishedArt) {
          setSelectedArticleId(publishedArt.id);
        }

        setUploadSuccess(
          `Successfully uploaded and published "${selectedFile.name}" for "${metadata.title?.slice(0, 45)}...". Vol. ${metadata.volume}, Iss. ${metadata.issue} (${metadata.year}). View PDF and Download PDF are now active across the main website and author dashboard.`
        );
      } else if (targetArticle) {
        // Metadata update without changing PDF
        updateArticle({
          ...targetArticle,
          ...metadata,
          status: 'published'
        });
        setUploadSuccess(`Updated publication metadata for ${targetArticle.trackingId}.`);
      }

      setSelectedFile(null);
      setFileValidationInfo(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => setUploadSuccess(null), 7000);
    } catch (err: any) {
      console.error('Error publishing paper:', err);
      setErrorMsg(`Publishing failed: ${err.message || 'Storage error occurred.'}`);
    } finally {
      setIsProcessing(false);
      setUploadProgressStage('');
    }
  };

  const handleTestView = async (article: Article) => {
    try {
      setViewLoadingId(article.id);
      const url = await viewPublishedPaper(article);
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        alert(`Could not resolve view URL for "${article.title}". Please ensure the PDF was uploaded.`);
      }
    } catch (err: any) {
      alert(`Error opening PDF viewer: ${err.message}`);
    } finally {
      setViewLoadingId(null);
    }
  };

  const handleRemove = (art: Article) => {
    if (window.confirm(`Remove published paper PDF for "${art.title}"? Public downloads will be locked on the website until a replacement file is uploaded.`)) {
      removePublishedPaper(art.id);
    }
  };

  const publicationArticles = articles.filter(
    (a) => a.status === 'published' || a.status === 'accepted'
  );

  const hasUploadedPaper = (art: Article) => Boolean(
    art.publishedFileName ||
    art.publishedDownloadURL ||
    art.publishedFileDataUrl ||
    art.publishedStoragePath ||
    art.driveUrl ||
    art.driveFileId ||
    (typeof window !== 'undefined' && localStorage.getItem(`chssh_pub_file_${art.id}`))
  );

  const uploadedCount = publicationArticles.filter(hasUploadedPaper).length;
  const pendingCount = publicationArticles.length - uploadedCount;

  return (
    <div className="space-y-6">
      {/* Editorial Desk Banner */}
      <div className="bg-gradient-to-r from-[#0d233a] via-[#103254] to-[#1c355e] text-white p-6 sm:p-8 rounded-2xl border border-sky-900/50 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 uppercase tracking-widest">
              <BookOpen className="w-4 h-4" />
              <span>Publication Management &amp; PDF Hosting Desk</span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-slate-100 mt-1">
              Published Papers &amp; PDF Upload Center
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl font-serif">
              Upload finalized research papers in PDF format. Each uploaded PDF is immediately connected to the main website (Current Issue, Archive, Article Reader) and the Author Dashboard.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-[#0b1c30] px-4 py-3 rounded-xl border border-emerald-800/60 text-center">
              <span className="text-xl font-bold text-emerald-400 font-mono">{uploadedCount}</span>
              <span className="block text-[10px] text-slate-300 uppercase tracking-wider font-semibold">
                Live on Website
              </span>
            </div>
            <div className="bg-[#0b1c30] px-4 py-3 rounded-xl border border-amber-800/60 text-center">
              <span className="text-xl font-bold text-amber-400 font-mono">{pendingCount}</span>
              <span className="block text-[10px] text-slate-300 uppercase tracking-wider font-semibold">
                Pending PDF
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {uploadSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 rounded-xl flex items-center gap-3 text-emerald-900 dark:text-emerald-200 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{uploadSuccess}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-red-50 dark:bg-red-950/70 border border-red-300 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-900 dark:text-red-200 text-xs font-semibold animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Upload & Metadata Editor Card */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 dark:border-stone-800 pb-4">
          <div>
            <h4 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
              {isCreatingNew ? 'Publish New Research Paper' : 'Edit & Upload Published Paper'}
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Select an existing manuscript or add a new publication to upload its official PDF.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedArticleId('new')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                isCreatingNew
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-200'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add New Publication</span>
            </button>

            <div className="w-64 sm:w-80">
              <label htmlFor="pub-target-article-select" className="sr-only">Select Manuscript</label>
              <select
                id="pub-target-article-select"
                value={selectedArticleId}
                onChange={(e) => {
                  setSelectedArticleId(e.target.value);
                  setSelectedFile(null);
                  setFileValidationInfo(null);
                  setErrorMsg(null);
                }}
                className="w-full text-xs font-semibold px-3 py-2 bg-stone-50 dark:bg-stone-850 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                <option value="new">+ Add New Publication From Scratch</option>
                {publicationArticles.map((art) => {
                  const isUploaded = hasUploadedPaper(art);
                  return (
                    <option key={art.id} value={art.id}>
                      {isUploaded ? '✓ [Live PDF] ' : '⏳ [Pending] '}
                      {art.trackingId} — {art.title.slice(0, 45)}...
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        {/* Existing Article Status Banner */}
        {targetArticle && (
          <div className="bg-slate-50 dark:bg-stone-850 p-4 rounded-xl border border-slate-200 dark:border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold bg-[#1c355e] text-white px-2 py-0.5 rounded">
                  {targetArticle.trackingId}
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-400 font-mono">
                  Vol. {targetArticle.volume || 7}, Iss. {targetArticle.issue || 1} ({targetArticle.year || 2026})
                </span>
                <span className="text-stone-300 dark:text-stone-700">•</span>
                <span className="font-mono text-[11px] font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded border border-sky-200 dark:border-sky-800">
                  DOI: {targetArticle.doi || 'Pending'}
                </span>
              </div>
              <h5 className="font-serif text-sm font-bold text-stone-900 dark:text-stone-100 mt-1">
                {targetArticle.title}
              </h5>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                Authors: {targetArticle.authors.map(a => a.name).join(', ')}
              </p>
            </div>

            <div className="text-right shrink-0 flex items-center gap-2">
              {hasUploadedPaper(targetArticle) ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleTestView(targetArticle)}
                    disabled={viewLoadingId === targetArticle.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/80 text-sky-900 dark:text-sky-200 text-xs font-semibold rounded-lg border border-sky-300 dark:border-sky-750 transition cursor-pointer"
                    title="View uploaded PDF in viewer"
                  >
                    <Eye className="w-3.5 h-3.5 text-sky-600" />
                    <span>View PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadPublishedPaper(targetArticle)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-2xs transition cursor-pointer"
                    title="Download exact uploaded PDF"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-200" />
                    <span>Download PDF</span>
                  </button>
                </>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 text-xs font-bold border border-amber-300 dark:border-amber-800">
                  <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>PDF Pending Upload</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Paper Metadata Form Fields */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Research Paper Title *
              </label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Critical Hermeneutics and the Public Sphere in South Asia..."
                className="w-full text-xs font-serif font-semibold px-3 py-2 bg-stone-50 dark:bg-stone-850 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Authors (comma-separated) *
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={formAuthorName}
                  onChange={(e) => setFormAuthorName(e.target.value)}
                  placeholder="Dr. Anand S. Verma, Prof. Rajesh Kumar"
                  className="w-full text-xs pl-8 pr-3 py-2 bg-stone-50 dark:bg-stone-850 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Author Affiliation / University
              </label>
              <input
                type="text"
                value={formAffiliation}
                onChange={(e) => setFormAffiliation(e.target.value)}
                placeholder="Department of Sociology, Delhi School of Economics"
                className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-stone-850 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Disciplinary Track
              </label>
              <select
                value={formTrack}
                onChange={(e) => setFormTrack(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-stone-850 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                {tracks.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Publication Date
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="date"
                  value={formPublicationDate}
                  onChange={(e) => setFormPublicationDate(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-2 bg-stone-50 dark:bg-stone-850 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Volume / Issue / Year
              </label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  value={formVolume}
                  onChange={(e) => setFormVolume(Number(e.target.value))}
                  placeholder="Vol"
                  className="w-full text-xs px-2 py-2 bg-stone-50 dark:bg-stone-850 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl outline-none text-center"
                />
                <input
                  type="number"
                  value={formIssue}
                  onChange={(e) => setFormIssue(Number(e.target.value))}
                  placeholder="Iss"
                  className="w-full text-xs px-2 py-2 bg-stone-50 dark:bg-stone-850 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl outline-none text-center"
                />
                <input
                  type="number"
                  value={formYear}
                  onChange={(e) => setFormYear(Number(e.target.value))}
                  placeholder="Year"
                  className="w-full text-xs px-2 py-2 bg-stone-50 dark:bg-stone-850 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl outline-none text-center"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Pages Range
              </label>
              <input
                type="text"
                value={formPages}
                onChange={(e) => setFormPages(e.target.value)}
                placeholder="e.g. 1–24 or 25–48"
                className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-stone-850 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                  Academic DOI (Crossref / DataCite)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAutoGenerateDoi}
                    className="text-[11px] text-sky-700 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Auto-Generate DOI</span>
                  </button>
                  {formDoi && (
                    <button
                      type="button"
                      onClick={() => handleCopyDoiUrl(formDoi)}
                      className="text-[11px] text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedDoi ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedDoi ? 'Copied' : 'Copy URL'}</span>
                    </button>
                  )}
                </div>
              </div>
              <input
                type="text"
                value={formDoi}
                onChange={(e) => setFormDoi(e.target.value)}
                placeholder="10.5281/chssh.2026.7101"
                className="w-full text-xs font-mono px-3 py-2 bg-stone-50 dark:bg-stone-850 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Certificate Link Input */}
          <div className="p-4 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                <h6 className="text-xs font-bold text-amber-950 dark:text-amber-200 uppercase tracking-wider">
                  Author Publication Certificate (Google Drive Link)
                </h6>
              </div>
              {formCertificateUrl ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/70 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Certificate Link Ready</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded-full">
                  <AlertCircle className="w-3 h-3" />
                  <span>No Certificate Linked</span>
                </span>
              )}
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-300 font-serif">
              Paste the Google Drive sharing link for this author's publication certificate. Once saved, the Download Certificate option activates immediately on the main website and in the author dashboard.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <LinkIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="url"
                  value={formCertificateUrl}
                  onChange={(e) => setFormCertificateUrl(e.target.value)}
                  placeholder="https://drive.google.com/file/d/.../view"
                  className="w-full text-xs pl-8 pr-3 py-2 bg-white dark:bg-stone-900 border border-amber-300 dark:border-amber-700 text-stone-900 dark:text-stone-100 rounded-lg outline-none font-mono"
                />
              </div>
              {targetArticle && (
                <button
                  type="button"
                  onClick={handleSaveCertificateOnly}
                  className="px-3.5 py-2 bg-[#1c355e] hover:bg-[#102344] text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Save className="w-3.5 h-3.5 text-amber-400" />
                  <span>Save Certificate</span>
                </button>
              )}
              {formCertificateUrl && (
                <a
                  href={formCertificateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:text-sky-600 text-xs font-semibold rounded-lg transition inline-flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Test Link</span>
                </a>
              )}
            </div>

            {certSaveSuccess && (
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 rounded-lg flex items-center gap-2 text-emerald-900 dark:text-emerald-200 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{certSaveSuccess}</span>
              </div>
            )}
          </div>
        </div>

        {/* PDF File Upload Zone (Strictly .pdf with Signature Verification) */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-stone-800 dark:text-stone-200">
            Official Research Paper PDF File (.pdf only) *
          </label>
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 scale-[1.01]'
                : selectedFile
                ? 'border-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20'
                : 'border-stone-300 dark:border-stone-700 hover:border-sky-400 bg-stone-50/60 dark:bg-stone-850/60'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileInputChange}
              className="hidden"
            />
            <div className="max-w-md mx-auto space-y-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto shadow-xs ${
                selectedFile
                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                  : 'bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300'
              }`}>
                {selectedFile ? <FileCheck className="w-6 h-6" /> : <UploadCloud className="w-6 h-6" />}
              </div>

              {selectedFile ? (
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 rounded-lg text-xs font-bold font-mono">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{selectedFile.name}</span>
                    <span>({fileValidationInfo?.sizeFormatted || formatBytes(selectedFile.size)})</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Verified PDF Signature (%PDF Header Valid)</span>
                  </div>
                </div>
              ) : targetArticle && hasUploadedPaper(targetArticle) ? (
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-100 dark:bg-sky-950/80 text-sky-900 dark:text-sky-200 rounded-lg text-xs font-mono font-bold">
                    <FileCheck className="w-4 h-4 text-sky-600" />
                    <span>Current Active PDF: {targetArticle.publishedFileName || 'Published_Paper.pdf'}</span>
                    <span>({targetArticle.publishedFileSize || 'Live'})</span>
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Drag and drop a new PDF file here to replace this published paper.
                  </p>
                </div>
              ) : (
                <div>
                  <h5 className="font-serif text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100">
                    Drag &amp; Drop Research Paper (.pdf)
                  </h5>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    or <span className="text-sky-600 dark:text-sky-400 font-semibold underline">browse from your computer</span>. Strict verification validates %PDF header bytes.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Upload Progress Indicator */}
          {isProcessing && (
            <div className="p-3 bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 rounded-xl flex items-center gap-3 text-sky-900 dark:text-sky-200 text-xs font-semibold">
              <RefreshCw className="w-4 h-4 animate-spin text-sky-600" />
              <span>{uploadProgressStage || 'Processing and uploading research paper PDF...'}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100 dark:border-stone-800">
          <div className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-2">
            {targetArticle && targetArticle.fileName && (
              <button
                type="button"
                onClick={() => downloadOriginalManuscript(targetArticle)}
                className="text-sky-600 dark:text-sky-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                title="Download original manuscript submitted by author"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Author's Original Submission ({targetArticle.fileName})</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {selectedFile && (
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  setFileValidationInfo(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="px-3 py-2 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl cursor-pointer"
              >
                Clear Selected PDF
              </button>
            )}

            <button
              type="button"
              disabled={isProcessing}
              onClick={handleConfirmPublish}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
                isProcessing
                  ? 'bg-stone-200 dark:bg-stone-800 text-stone-400 cursor-not-allowed'
                  : 'bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 text-white hover:shadow-md'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              <span>
                {isProcessing
                  ? 'Uploading & Saving...'
                  : selectedFile
                  ? isCreatingNew ? 'Upload PDF & Publish Paper' : 'Upload & Replace Published PDF'
                  : 'Save Publication Details'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Published Papers Table with Immediate View & Download Controls */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm p-6 space-y-4">
        <div className="border-b border-stone-100 dark:border-stone-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
              Published Papers &amp; PDF Repository
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Overview of all published research papers. Click View PDF or Download PDF to verify files immediately.
            </p>
          </div>
        </div>

        <div className="divide-y divide-stone-100 dark:divide-stone-800">
          {publicationArticles.map((article) => {
            const isUploaded = hasUploadedPaper(article);
            return (
              <div
                key={article.id}
                className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 px-2 py-0.5 rounded">
                      {article.trackingId}
                    </span>
                    <span className="text-xs text-stone-500 dark:text-stone-400 font-mono">
                      Vol. {article.volume || 7}, Iss. {article.issue || 1} ({article.year || 2026})
                    </span>
                    <span className="text-stone-300 dark:text-stone-700">•</span>
                    <span className="font-mono text-[11px] font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded border border-sky-200/80 dark:border-sky-800/80">
                      DOI: {article.doi || 'Pending'}
                    </span>
                  </div>

                  <h5 className="font-serif text-sm font-bold text-stone-900 dark:text-stone-100">
                    {article.title}
                  </h5>

                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    {article.authors.map(a => a.name).join(', ')}
                  </p>

                  <div className="flex items-center gap-2 flex-wrap pt-0.5">
                    {isUploaded ? (
                      <div className="inline-flex items-center gap-1.5 text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="font-mono font-bold">
                          {article.publishedFileName || 'Published_Paper.pdf'}
                        </span>
                        <span className="text-[11px] text-stone-500">
                          ({article.publishedFileSize || 'PDF'})
                        </span>
                        <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider ml-1">
                          Live on Website
                        </span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-md border border-amber-200 dark:border-amber-800">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>Pending PDF Upload • Download Locked</span>
                      </div>
                    )}

                    {article.certificateUrl ? (
                      <a
                        href={article.certificateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 hover:underline"
                        title="Open Certificate link in new tab"
                      >
                        <Award className="w-3 h-3 text-emerald-600" />
                        <span>Certificate Live</span>
                        <ExternalLink className="w-2.5 h-2.5 ml-0.5 opacity-70" />
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                        <AlertCircle className="w-3 h-3 text-amber-500" />
                        <span>No Certificate</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Direct Action Controls */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  {isUploaded ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleTestView(article)}
                        disabled={viewLoadingId === article.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/60 dark:hover:bg-sky-900/60 text-sky-900 dark:text-sky-200 border border-sky-300 dark:border-sky-800 rounded-lg text-xs font-semibold transition cursor-pointer"
                        title="View PDF in viewer or browser tab"
                      >
                        <Eye className="w-3.5 h-3.5 text-sky-600" />
                        <span>View PDF</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => downloadPublishedPaper(article)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-2xs"
                        title="Download the exact published PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PDF</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedArticleId(article.id);
                          window.scrollTo({ top: 180, behavior: 'smooth' });
                        }}
                        className="px-3 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-lg text-xs font-semibold transition cursor-pointer"
                      >
                        Replace PDF
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemove(article)}
                        className="p-1.5 text-stone-400 hover:text-red-600 dark:hover:text-red-400 transition cursor-pointer rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40"
                        title="Remove uploaded PDF"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedArticleId(article.id);
                        window.scrollTo({ top: 180, behavior: 'smooth' });
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1c355e] hover:bg-[#102344] text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
                    >
                      <UploadCloud className="w-4 h-4 text-sky-300" />
                      <span>Upload Paper PDF</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setSelectedArticleForView(article)}
                    className="px-2.5 py-1.5 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 text-xs font-semibold cursor-pointer"
                  >
                    View Reader
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
