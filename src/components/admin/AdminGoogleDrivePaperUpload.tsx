import React, { useState, useEffect } from 'react';
import { useJournal } from '../../context/JournalContext';
import { Article } from '../../types';
import { parseGoogleDriveUrl, validateGoogleDriveLink } from '../../utils/googleDriveUtils';
import { generateAcademicDoi, normalizeDoi, getCanonicalDoiUrl } from '../../utils/doiUtils';
import {
  FolderOpen,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  Eye,
  Download,
  ExternalLink,
  Plus,
  RefreshCw,
  BookOpen,
  Copy,
  Save,
  Trash2,
  Edit3,
  Calendar,
  User,
  Check,
  Award,
  Layers,
  ArrowRight
} from 'lucide-react';

interface AdminGoogleDrivePaperUploadProps {
  initialSelectedArticleId?: string;
}

export const AdminGoogleDrivePaperUpload: React.FC<AdminGoogleDrivePaperUploadProps> = ({
  initialSelectedArticleId
}) => {
  const {
    articles,
    attachGoogleDrivePaper,
    updateArticle,
    content,
    setActiveTab,
    downloadPublishedPaper
  } = useJournal();

  const [selectedArticleId, setSelectedArticleId] = useState<string>(
    initialSelectedArticleId || (articles.find(a => Boolean(a.driveUrl))?.id || articles[0]?.id || 'new')
  );

  // Form Fields
  const [driveUrl, setDriveUrl] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [authorName, setAuthorName] = useState<string>('');
  const [affiliation, setAffiliation] = useState<string>('');
  const [authorEmail, setAuthorEmail] = useState<string>('');
  const [track, setTrack] = useState<string>('Sociology & Social Theory');
  const [volume, setVolume] = useState<number>(7);
  const [issue, setIssue] = useState<number>(1);
  const [year, setYear] = useState<number>(2026);
  const [pages, setPages] = useState<string>('1–24');
  const [publicationDate, setPublicationDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [doi, setDoi] = useState<string>('');
  const [certificateUrl, setCertificateUrl] = useState<string>('');
  const [abstract, setAbstract] = useState<string>('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [copiedDoi, setCopiedDoi] = useState<boolean>(false);

  const isCreatingNew = selectedArticleId === 'new';
  const targetArticle = isCreatingNew ? null : articles.find(a => a.id === selectedArticleId);

  // Parse Drive URL in real-time
  const parsedDrive = parseGoogleDriveUrl(driveUrl);

  const tracks = [
    'Sociology & Social Theory',
    'Cultural Studies & Critical Theory',
    'Applied Ethics & Epistemic Justice',
    'History, Memory & Archival Studies',
    'Political Philosophy & Global Governance',
    'Digital Humanities & Computational Social Science'
  ];

  // Pre-fill form when target article changes
  useEffect(() => {
    if (targetArticle) {
      setDriveUrl(targetArticle.driveUrl || '');
      setTitle(targetArticle.title || '');
      setAuthorName(targetArticle.authors.map(a => a.name).join(', ') || '');
      setAffiliation(targetArticle.authors[0]?.affiliation || '');
      setAuthorEmail(targetArticle.authors[0]?.email || '');
      setTrack(targetArticle.track || 'Sociology & Social Theory');
      setVolume(targetArticle.volume || 7);
      setIssue(targetArticle.issue || 1);
      setYear(targetArticle.year || 2026);
      setPages(targetArticle.pages || '1–24');
      setPublicationDate(targetArticle.publishedDate || new Date().toISOString().split('T')[0]);
      setDoi(
        targetArticle.doi ||
        generateAcademicDoi(content.doi_prefix, {
          year: targetArticle.year || 2026,
          volume: targetArticle.volume || 7,
          issue: targetArticle.issue || 1,
          trackingId: targetArticle.trackingId,
          id: targetArticle.id
        })
      );
      setCertificateUrl(targetArticle.certificateUrl || '');
      setAbstract(targetArticle.abstract || '');
      setErrorMessage(null);
    } else if (isCreatingNew) {
      setDriveUrl('');
      setTitle('');
      setAuthorName('');
      setAffiliation('');
      setAuthorEmail('');
      setTrack('Sociology & Social Theory');
      setVolume(7);
      setIssue(1);
      setYear(2026);
      setPages('1–24');
      setPublicationDate(new Date().toISOString().split('T')[0]);
      setDoi(generateAcademicDoi(content.doi_prefix, { year: 2026, volume: 7, issue: 1 }));
      setCertificateUrl('');
      setAbstract('');
      setErrorMessage(null);
    }
  }, [selectedArticleId, targetArticle?.id]);

  const handleAutoDoi = () => {
    const autoDoi = generateAcademicDoi(content.doi_prefix, {
      year: year || 2026,
      volume: volume || 7,
      issue: issue || 1,
      trackingId: targetArticle?.trackingId,
      id: targetArticle?.id
    });
    setDoi(autoDoi);
  };

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(key);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const handleSaveGoogleDrivePaper = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!driveUrl.trim()) {
      setErrorMessage('Please enter the author paper Google Drive link.');
      return;
    }

    if (!parsedDrive.isValid) {
      setErrorMessage(parsedDrive.error || 'Please enter a valid Google Drive sharing URL or file link.');
      return;
    }

    if (!title.trim()) {
      setErrorMessage('Please enter the research paper title.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Build authors list
      const parsedAuthors = authorName.split(',').map((nameStr, idx) => {
        const cleanName = nameStr.trim();
        return {
          id: `auth_${Date.now()}_${idx}`,
          name: cleanName || 'Author',
          affiliation: affiliation.trim() || 'Contemporary Horizons Research Network',
          email: idx === 0 ? authorEmail.trim() : '',
          country: 'India',
          isCorresponding: idx === 0
        };
      });

      const cleanDoi = normalizeDoi(doi);

      const metadata: Partial<Article> = {
        title: title.trim(),
        authors: parsedAuthors.length > 0 ? parsedAuthors : [{
          id: `auth_${Date.now()}`,
          name: 'Author Name',
          affiliation: affiliation.trim() || 'Institutional Affiliation',
          email: authorEmail.trim(),
          country: 'India',
          isCorresponding: true
        }],
        track,
        volume: Number(volume) || 7,
        issue: Number(issue) || 1,
        year: Number(year) || 2026,
        pages: pages.trim() || '1–24',
        doi: cleanDoi,
        publishedDate: publicationDate,
        abstract: abstract.trim() || 'Scholarly research paper published in Contemporary Horizons in Social Sciences and Humanities.',
        certificateUrl: certificateUrl.trim() || undefined
      };

      const savedArt = await attachGoogleDrivePaper(selectedArticleId, driveUrl, metadata);
      setSelectedArticleId(savedArt.id);

      setSuccessMessage(
        `Author paper successfully published via Google Drive link! The exact link "${driveUrl}" is now live on the website main page to download the paper.`
      );
      setTimeout(() => setSuccessMessage(null), 8000);
    } catch (err: any) {
      console.error('Error attaching Google Drive paper:', err);
      setErrorMessage(err.message || 'Failed to save Google Drive paper.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveDriveLink = (art: Article) => {
    if (window.confirm(`Remove Google Drive link for "${art.title}"?`)) {
      updateArticle({
        ...art,
        driveUrl: undefined,
        driveFileId: undefined,
        driveResourceType: undefined
      });
      if (selectedArticleId === art.id) {
        setDriveUrl('');
      }
    }
  };

  const driveLinkedArticles = articles.filter(a => Boolean(a.driveUrl));
  const pendingArticles = articles.filter(a => !a.driveUrl);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0d233a] via-[#103254] to-[#1c355e] text-white p-6 sm:p-8 rounded-2xl border border-sky-900/50 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 uppercase tracking-widest">
              <FolderOpen className="w-4 h-4" />
              <span>Google Drive Paper Distribution Center</span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-slate-100 mt-1">
              Upload Author Paper via Google Drive Link
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl font-serif">
              Attach the author's research paper directly via Google Drive link. The exact same link appears immediately on the published paper on the website main page, allowing readers to view and download the paper with a single click.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-[#0b1c30] px-4 py-3 rounded-xl border border-sky-800/60 text-center">
              <span className="text-xl font-bold text-sky-400 font-mono">{driveLinkedArticles.length}</span>
              <span className="block text-[10px] text-slate-300 uppercase tracking-wider font-semibold">
                Drive Linked Papers
              </span>
            </div>
            <div className="bg-[#0b1c30] px-4 py-3 rounded-xl border border-amber-800/60 text-center">
              <span className="text-xl font-bold text-amber-400 font-mono">{pendingArticles.length}</span>
              <span className="block text-[10px] text-slate-300 uppercase tracking-wider font-semibold">
                Other Papers
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 rounded-xl flex items-start gap-3 text-emerald-900 dark:text-emerald-200 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p>{successMessage}</p>
            <button
              type="button"
              onClick={() => {
                setActiveTab('home');
                window.scrollTo({ top: 400, behavior: 'smooth' });
              }}
              className="text-emerald-800 dark:text-emerald-300 underline font-bold flex items-center gap-1 cursor-pointer pt-1"
            >
              <span>View Published Paper on Main Website Page</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-50 dark:bg-red-950/70 border border-red-300 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-900 dark:text-red-200 text-xs font-semibold animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSaveGoogleDrivePaper} className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 dark:border-stone-800 pb-4">
          <div>
            <h4 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              <span>{isCreatingNew ? 'Publish New Paper via Google Drive Link' : 'Attach Google Drive Link to Manuscript'}</span>
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Select a manuscript or create a new publication, then paste the author's Google Drive sharing link.
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
              <span>+ New Paper via Drive</span>
            </button>

            <div className="w-64 sm:w-80">
              <label htmlFor="drive-paper-select" className="sr-only">Select Manuscript</label>
              <select
                id="drive-paper-select"
                value={selectedArticleId}
                onChange={(e) => setSelectedArticleId(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 bg-stone-50 dark:bg-stone-850 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                <option value="new">+ Add New Publication via Drive Link</option>
                {articles.map((art) => {
                  const hasDrive = Boolean(art.driveUrl);
                  return (
                    <option key={art.id} value={art.id}>
                      {hasDrive ? '🌐 [Drive Linked] ' : '⏳ [No Drive Link] '}
                      {art.trackingId} — {art.title.slice(0, 40)}...
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        {/* HERO: Google Drive Link Input & Real-Time Inspector */}
        <div className="p-5 bg-sky-50/70 dark:bg-sky-950/30 border-2 border-sky-300 dark:border-sky-800 rounded-2xl space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <label htmlFor="author-drive-url" className="text-xs font-bold text-sky-950 dark:text-sky-200 uppercase tracking-wider flex items-center gap-1.5">
              <FolderOpen className="w-4 h-4 text-sky-600" />
              <span>Author Paper Google Drive Link *</span>
            </label>

            {parsedDrive.isValid ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Valid Google Drive Document (ID: {parsedDrive.fileId?.slice(0, 8)}...)</span>
              </span>
            ) : driveUrl ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-800">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>Invalid Link Format</span>
              </span>
            ) : null}
          </div>

          <p className="text-xs text-sky-900/80 dark:text-sky-300/80 font-serif">
            Paste the author's research paper Google Drive link (e.g., shareable link with "Anyone with the link can view"). This exact link will be displayed on the published paper on the website main page for readers to download.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <LinkIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-sky-500" />
              <input
                id="author-drive-url"
                type="url"
                required
                value={driveUrl}
                onChange={(e) => setDriveUrl(e.target.value)}
                placeholder="https://drive.google.com/file/d/1A2B3C4D5E.../view?usp=sharing"
                className="w-full text-xs font-mono font-semibold pl-9 pr-3 py-2.5 bg-white dark:bg-stone-900 border border-sky-300 dark:border-sky-700 text-stone-900 dark:text-stone-100 rounded-xl outline-none focus:ring-2 focus:ring-sky-500 shadow-2xs"
              />
            </div>

            {parsedDrive.isValid && (
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={parsedDrive.directViewUrl || driveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-white dark:bg-stone-800 border border-sky-300 dark:border-sky-700 text-sky-800 dark:text-sky-200 hover:text-sky-600 text-xs font-bold rounded-xl transition inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Test viewing this Google Drive file in new tab"
                >
                  <Eye className="w-3.5 h-3.5 text-sky-600" />
                  <span>Test View</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>

                {parsedDrive.downloadUrl && (
                  <a
                    href={parsedDrive.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    title="Test direct download URL"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Test Download</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Paper Publication Metadata Form */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Paper Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Critical Hermeneutics and the Public Sphere in South Asia..."
                className="w-full text-xs font-serif font-semibold px-3 py-2 bg-stone-50 dark:bg-stone-850 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Author(s) (comma-separated) *
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  required
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
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
                value={affiliation}
                onChange={(e) => setAffiliation(e.target.value)}
                placeholder="Department of Sociology, Delhi School of Economics"
                className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-stone-850 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Disciplinary Track
              </label>
              <select
                value={track}
                onChange={(e) => setTrack(e.target.value)}
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
                  value={publicationDate}
                  onChange={(e) => setPublicationDate(e.target.value)}
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
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  placeholder="Vol"
                  className="w-full text-xs px-2 py-2 bg-stone-50 dark:bg-stone-850 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl outline-none text-center"
                />
                <input
                  type="number"
                  value={issue}
                  onChange={(e) => setIssue(Number(e.target.value))}
                  placeholder="Iss"
                  className="w-full text-xs px-2 py-2 bg-stone-50 dark:bg-stone-850 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl outline-none text-center"
                />
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
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
                value={pages}
                onChange={(e) => setPages(e.target.value)}
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
                    onClick={handleAutoDoi}
                    className="text-[11px] text-sky-700 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Auto-Generate DOI</span>
                  </button>
                  {doi && (
                    <button
                      type="button"
                      onClick={() => {
                        const canonical = getCanonicalDoiUrl(doi);
                        navigator.clipboard.writeText(canonical);
                        setCopiedDoi(true);
                        setTimeout(() => setCopiedDoi(false), 2000);
                      }}
                      className="text-[11px] text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedDoi ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedDoi ? 'Copied' : 'Copy DOI URL'}</span>
                    </button>
                  )}
                </div>
              </div>
              <input
                type="text"
                value={doi}
                onChange={(e) => setDoi(e.target.value)}
                placeholder="10.5281/chssh.2026.7101"
                className="w-full text-xs font-mono px-3 py-2 bg-stone-50 dark:bg-stone-850 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Google Drive Certificate Link (Optional)
              </label>
              <input
                type="url"
                value={certificateUrl}
                onChange={(e) => setCertificateUrl(e.target.value)}
                placeholder="https://drive.google.com/file/d/.../view (Author's Certificate)"
                className="w-full text-xs font-mono px-3 py-2 bg-stone-50 dark:bg-stone-850 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Abstract
              </label>
              <textarea
                rows={3}
                value={abstract}
                onChange={(e) => setAbstract(e.target.value)}
                placeholder="Enter scholarly abstract..."
                className="w-full text-xs font-serif px-3 py-2 bg-stone-50 dark:bg-stone-850 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100 dark:border-stone-800">
          <div className="text-xs text-stone-500 dark:text-stone-400">
            {targetArticle && targetArticle.driveUrl && (
              <span className="flex items-center gap-1.5 font-mono text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Currently Live: {targetArticle.driveUrl.slice(0, 35)}...</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={isSubmitting || !driveUrl}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
                isSubmitting || !driveUrl
                  ? 'bg-stone-200 dark:bg-stone-800 text-stone-400 cursor-not-allowed'
                  : 'bg-[#102344] hover:bg-[#1a386c] text-white hover:shadow-md'
              }`}
            >
              <Save className="w-4 h-4 text-sky-300" />
              <span>
                {isSubmitting ? 'Saving & Publishing...' : 'Save & Publish Paper via Google Drive'}
              </span>
            </button>
          </div>
        </div>
      </form>

      {/* Published Papers with Google Drive Links Table */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm p-6 space-y-4">
        <div className="border-b border-stone-100 dark:border-stone-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              <span>Published Papers with Google Drive Download Links</span>
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Overview of all published articles. Articles with a Google Drive link will display the download link on the main website.
            </p>
          </div>
        </div>

        <div className="divide-y divide-stone-100 dark:divide-stone-800">
          {articles.filter(a => a.status === 'published' || a.driveUrl).map((article) => {
            const hasDrive = Boolean(article.driveUrl);
            return (
              <div
                key={article.id}
                className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold bg-[#102344] text-white px-2 py-0.5 rounded">
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

                  <h5 className="font-serif text-sm font-bold text-slate-900 dark:text-slate-100">
                    {article.title}
                  </h5>

                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    {article.authors.map(a => a.name).join(', ')}
                  </p>

                  {/* Drive Link Details */}
                  <div className="pt-1">
                    {hasDrive ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="inline-flex items-center gap-1.5 text-xs text-sky-900 dark:text-sky-200 bg-sky-50 dark:bg-sky-950/60 px-2.5 py-1 rounded-md border border-sky-300 dark:border-sky-800 font-mono">
                          <FolderOpen className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                          <span className="truncate max-w-xs sm:max-w-md">{article.driveUrl}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyText(article.driveUrl!, article.id)}
                          className="text-[11px] text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 flex items-center gap-1 px-1.5 py-1 rounded bg-stone-100 dark:bg-stone-800 cursor-pointer"
                          title="Copy Google Drive URL"
                        >
                          {copiedUrl === article.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedUrl === article.id ? 'Copied' : 'Copy'}</span>
                        </button>
                        <a
                          href={article.driveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
                          title="Open Drive link"
                        >
                          <span>Open</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span>No Google Drive Link Attached</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  {hasDrive ? (
                    <>
                      <a
                        href={article.driveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer"
                        title="Download paper via Google Drive link"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download via Drive</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-80" />
                      </a>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedArticleId(article.id);
                          window.scrollTo({ top: 150, behavior: 'smooth' });
                        }}
                        className="px-3 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-lg text-xs font-semibold transition cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3 inline mr-1" />
                        <span>Edit Link</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveDriveLink(article)}
                        className="p-1.5 text-stone-400 hover:text-red-600 dark:hover:text-red-400 transition cursor-pointer rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40"
                        title="Remove Google Drive Link"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedArticleId(article.id);
                        window.scrollTo({ top: 150, behavior: 'smooth' });
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Attach Drive Link</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
