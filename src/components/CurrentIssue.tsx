import React, { useState, useEffect } from 'react';
import { useJournal } from '../context/JournalContext';
import { EditableText } from './EditableText';
import { ArticleDoiBadge } from './ArticleDoiBadge';
import { printPublicationCertificate, triggerFileDownload } from '../utils/downloadGenerators';
import { getAssetFile } from '../utils/fileStorage';
import { DocumentPreviewModal } from './DocumentPreviewModal';
import { GoogleDrivePreviewModal } from './GoogleDrivePreviewModal';
import { JournalUploadedAsset, Article } from '../types';
import { getFreshPdfUrl } from '../services/pdfStorageService';
import { motion } from 'motion/react';
import {
  Download,
  Search,
  Award,
  Upload,
  Eye,
  FileCheck,
  BookOpen,
  Loader2
} from 'lucide-react';

export const CurrentIssue: React.FC = () => {
  const {
    articles,
    issues,
    volumes,
    setSelectedArticleForView,
    uploadedAssets,
    content,
    setActiveTab,
    requireAuthorAuth,
    downloadPublishedPaper,
    fetchActivePdf,
    activePdf,
    isAdmin
  } = useJournal();
  const [filterQuery, setFilterQuery] = useState('');

  // Cover preview modal state
  const [previewCoverAsset, setPreviewCoverAsset] = useState<JournalUploadedAsset | null>(null);
  const [isCoverPreviewOpen, setIsCoverPreviewOpen] = useState(false);
  const [isDownloadingCover, setIsDownloadingCover] = useState(false);

  // Article preview modal state
  const [previewArticle, setPreviewArticle] = useState<Article | null>(null);
  const [isArticlePreviewOpen, setIsArticlePreviewOpen] = useState(false);
  const [isLoadingCover, setIsLoadingCover] = useState(false);

  const coverAsset = uploadedAssets?.['cover_page'] || uploadedAssets?.['active_pdf'] || activePdf;

  // Always fetch latest active PDF from Firebase Firestore on component mount
  useEffect(() => {
    fetchActivePdf('cover_page').catch((err) => {
      console.warn('Initial active PDF fetch note:', err);
    });
  }, []);

  const publishedArticles = articles.filter((a) => a.status === 'published');
  
  // Dynamically resolve Current Issue from managed issues collection
  const currentIssueRecord =
    issues.find((i) => i.isCurrent && i.status === 'published') ||
    issues.find((i) => i.isCurrent) ||
    issues.find((i) => i.status === 'published') ||
    issues[0];

  const activeVolume = currentIssueRecord ? currentIssueRecord.volumeNumber : (publishedArticles[0]?.volume || 1);
  const activeIssue = currentIssueRecord ? currentIssueRecord.issueNumber : (publishedArticles[0]?.issue || 1);
  const activeYear = currentIssueRecord ? currentIssueRecord.year : (publishedArticles[0]?.year || 2026);

  // Articles specifically ordered for this issue if configured, else all published articles belonging to this volume/issue
  let currentArticles: Article[] = [];
  if (currentIssueRecord && currentIssueRecord.articleIds && currentIssueRecord.articleIds.length > 0) {
    const ordered = currentIssueRecord.articleIds
      .map((id) => articles.find((a) => a.id === id))
      .filter(Boolean) as Article[];
    if (ordered.length > 0) {
      currentArticles = ordered;
    }
  }

  if (currentArticles.length === 0) {
    const matched = publishedArticles.filter(
      (a) => a.volume === activeVolume && a.issue === activeIssue
    );
    currentArticles = matched.length > 0 ? matched : publishedArticles;
  }

  const filteredArticles = filterQuery.trim()
    ? currentArticles.filter(
        (a) =>
          a.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
          a.abstract.toLowerCase().includes(filterQuery.toLowerCase()) ||
          a.authors.some((auth) => auth.name.toLowerCase().includes(filterQuery.toLowerCase()))
      )
    : currentArticles;

  const hasGenuineCover = Boolean(
    coverAsset?.isUploaded &&
    (coverAsset?.downloadURL || coverAsset?.fileUrl || coverAsset?.fileDataUrl)
  );

  const handlePreviewCover = async () => {
    setIsLoadingCover(true);
    try {
      let current = coverAsset;
      try {
        const fresh = await fetchActivePdf('cover_page');
        if (fresh) current = fresh;
      } catch (err) {
        console.warn('Note on fetching latest PDF from Firebase:', err);
      }

      const effectiveUrl = current?.downloadURL || current?.fileUrl || current?.fileDataUrl;
      let finalUrl = effectiveUrl;

      if (!finalUrl) {
        finalUrl = (await getAssetFile('cover_page')) || undefined;
      }

      if (!finalUrl) {
        alert('No official cover document has been uploaded yet.');
        return;
      }

      setPreviewCoverAsset({
        id: 'cover_page',
        title: current?.title || 'Journal Issue Cover Page (Vol. 7, No. 1)',
        description: 'Official front cover of Contemporary Horizons in Social Sciences and Humanities',
        category: 'cover',
        fileName: current?.fileName || 'CHSSH_Volume_7_Cover.pdf',
        fileSize: current?.fileSize || 'Standard Document',
        fileType: current?.fileType || 'application/pdf',
        downloadURL: current?.downloadURL,
        fileUrl: current?.downloadURL || current?.fileUrl,
        fileDataUrl: finalUrl.startsWith('http') ? getFreshPdfUrl(finalUrl) : finalUrl,
        uploadedAt: current?.uploadedAt || new Date().toISOString(),
        isUploaded: true
      });
      setIsCoverPreviewOpen(true);
    } catch (err) {
      console.error('Error opening cover preview:', err);
    } finally {
      setIsLoadingCover(false);
    }
  };

  const handleDownloadCover = async () => {
    setIsDownloadingCover(true);
    try {
      let current = coverAsset;
      try {
        const fresh = await fetchActivePdf('cover_page');
        if (fresh) current = fresh;
      } catch {}

      const targetUrl = current?.downloadURL || current?.fileUrl || current?.fileDataUrl;
      if (targetUrl) {
        triggerFileDownload(
          targetUrl,
          current?.fileName || 'CHSSH_Volume_7_Cover.pdf',
          current?.fileType || 'application/pdf'
        );
        return;
      }

      const localUrl = (await getAssetFile('cover_page')) || undefined;
      if (localUrl) {
        triggerFileDownload(
          localUrl,
          current?.fileName || 'CHSSH_Volume_7_Cover.pdf',
          current?.fileType || 'application/pdf'
        );
      }
    } finally {
      setTimeout(() => setIsDownloadingCover(false), 1000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Issue Masthead Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="bg-white dark:bg-stone-900 rounded-2xl shadow-xs border border-stone-200/90 dark:border-stone-800 p-6 sm:p-8 space-y-4 relative overflow-hidden transition-colors"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#1c355e] dark:text-sky-400 uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-[#1c355e] dark:bg-sky-400 animate-pulse" />
            <span>
              <EditableText id="current_issue_badge" placeholder="Latest Publication Online" />
            </span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            ISSN: <EditableText id="issn_online" className="text-sky-700 dark:text-sky-400 font-semibold" /> (Online) |{' '}
            <EditableText id="issn_print" /> (Print)
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-start justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
              {currentIssueRecord?.title ? (
                <span>{currentIssueRecord.title}</span>
              ) : (
                <EditableText
                  id="current_issue_title"
                  placeholder={`Volume ${activeVolume}, Issue ${activeIssue} — Foundational Research`}
                />
              )}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-serif leading-relaxed">
              {currentIssueRecord?.tableOfContentsSummary ? (
                <span>{currentIssueRecord.tableOfContentsSummary}</span>
              ) : (
                <EditableText
                  id="current_issue_desc"
                  multiline
                  placeholder="A curated compendium of peer-reviewed critical interventions examining social sciences, humanities methodologies, and sustainable development."
                />
              )}
            </p>
          </div>

          {/* Issue Cover Artwork / Folio */}
          <div className="shrink-0 w-full md:w-56">
            {coverAsset?.fileDataUrl?.startsWith('data:image/') || currentIssueRecord?.coverImage ? (
              <div className="bg-[#0f1f38] dark:bg-slate-850 rounded-xl overflow-hidden border border-[#1c355e]/40 dark:border-slate-750 shadow-md group relative">
                <img
                  src={currentIssueRecord?.coverImage || coverAsset?.fileDataUrl}
                  alt={currentIssueRecord?.title || coverAsset?.title || 'Journal Cover Artwork'}
                  className="w-full h-48 object-cover object-top transition duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center p-2 text-center text-white space-y-2">
                  <span className="text-[11px] font-bold font-serif">{currentIssueRecord?.title || coverAsset?.title}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handlePreviewCover}
                      className="px-2.5 py-1 rounded bg-sky-700 hover:bg-sky-800 text-white text-[11px] font-semibold flex items-center gap-1 shadow cursor-pointer"
                    >
                      <Eye className="w-3 h-3" /> Preview
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadCover}
                      className="px-2.5 py-1 rounded bg-[#1c355e] hover:bg-[#102344] text-white text-[11px] font-semibold flex items-center gap-1 shadow cursor-pointer"
                    >
                      <Download className="w-3 h-3" /> Download
                    </button>
                  </div>
                </div>
                <div className="p-2 text-center bg-[#0a162b]/95 border-t border-[#1c355e]/50 text-[10px] text-sky-300 font-mono">
                  Vol. {activeVolume} • No. {activeIssue} ({activeYear})
                </div>
              </div>
            ) : (
              <div className="bg-[#102344] dark:bg-slate-850 text-slate-100 p-4 rounded-xl border border-[#1c355e] dark:border-slate-750 shadow-md text-center space-y-2">
                <div className="text-[10px] font-mono uppercase tracking-widest text-sky-300">
                  <EditableText id="current_issue_folio_label" placeholder="CHSSH Issue Folio" />
                </div>
                <div className="text-lg font-serif font-bold text-white">
                  Vol. {activeVolume} • No. {activeIssue} ({activeYear})
                </div>

                {coverAsset?.isUploaded && (
                  <div className="text-[10px] text-emerald-300 font-mono flex items-center justify-center gap-1 truncate" title={coverAsset.fileName}>
                    <FileCheck className="w-3 h-3 shrink-0" />
                    <span className="truncate">{coverAsset.fileName}</span>
                  </div>
                )}

                {hasGenuineCover ? (
                  <div className="pt-1 flex flex-col gap-1.5">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={handlePreviewCover}
                        disabled={isLoadingCover}
                        className="flex-1 py-1 px-2 rounded text-[11px] font-semibold bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 border border-sky-400/30 flex items-center justify-center gap-1 cursor-pointer transition disabled:opacity-50"
                        title="Preview official cover document"
                      >
                        {isLoadingCover ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin text-sky-300" />
                            <span>Loading PDF...</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3 h-3" />
                            <span>Preview</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleDownloadCover}
                        disabled={isDownloadingCover}
                        className="flex-1 py-1 px-2 rounded text-[11px] font-semibold bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-200 border border-emerald-400/30 flex items-center justify-center gap-1 cursor-pointer transition"
                        title="Download official cover document"
                      >
                        <Download className="w-3 h-3" />
                        <span>{isDownloadingCover ? '...' : 'Download'}</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('admin');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-full py-0.5 px-1.5 rounded text-[10px] text-slate-400 hover:text-white hover:bg-white/5 flex items-center justify-center gap-1 cursor-pointer transition"
                      title="Manage journal documents in Admin CMS"
                    >
                      <Upload className="w-2.5 h-2.5 text-amber-400" />
                      <span>Manage in CMS</span>
                    </button>
                  </div>
                ) : (
                  <div className="pt-1 text-[11px] text-slate-300 font-serif italic py-1">
                    Cover in preparation by editorial office
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('admin');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="w-full mt-2 py-1 px-2 rounded text-[10px] bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 border border-sky-400/30 flex items-center justify-center gap-1 cursor-pointer transition"
                      >
                        <Upload className="w-2.5 h-2.5 text-amber-400" />
                        <span>Upload Cover in CMS</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Table of Contents Header & Search */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">
              <EditableText id="current_issue_toc_heading" placeholder="Articles in this Issue" />
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-serif">
              Showing {filteredArticles.length} published peer-reviewed contributions
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search issue papers..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#102344]"
            />
          </div>
        </div>

        {/* Article Cards or Empty State */}
        {currentArticles.length === 0 ? (
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-12 text-center space-y-3">
            <BookOpen className="w-10 h-10 mx-auto text-stone-400" />
            <h4 className="font-serif text-lg font-bold text-stone-800 dark:text-stone-200">
              No papers have been published yet.
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto">
              Peer-reviewed manuscripts approved by the editorial office will appear here upon publication.
            </p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-12 text-center space-y-3">
            <Search className="w-8 h-8 text-stone-300 dark:text-stone-600 mx-auto" />
            <div className="font-serif text-lg font-bold text-stone-800 dark:text-stone-200">
              No articles match your search criteria.
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
              Try adjusting your search query or clear the filter.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredArticles.map((article, idx) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200/90 dark:border-stone-800 p-5 sm:p-6 shadow-2xs hover:shadow-sm transition-all space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-[#1c355e] dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2.5 py-0.5 rounded-full border border-sky-200/60 dark:border-sky-800/60 text-[11px]">
                    {article.track}
                  </span>
                  <span className="text-stone-500 font-mono text-[11px]">
                    Pages: {article.pages || '1–24'} | Vol. {article.volume || 7}, No. {article.issue || 1}
                  </span>
                </div>

                <h2
                  onClick={() => setSelectedArticleForView(article)}
                  className="font-serif text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 hover:text-[#1c355e] dark:hover:text-sky-400 cursor-pointer transition-colors"
                >
                  {article.title}
                </h2>

                <p className="text-xs font-serif text-stone-600 dark:text-stone-300">
                  By: {article.authors.map((a) => a.name).join(', ')} ({article.authors[0]?.affiliation})
                </p>

                <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-3 leading-relaxed">
                  {article.abstract}
                </p>

                <div className="pt-3 border-t border-stone-100 dark:border-stone-800/80 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {article.doi && <ArticleDoiBadge doi={article.doi} />}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewArticle(article);
                        setIsArticlePreviewOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-stone-800 dark:hover:bg-stone-750 text-slate-800 dark:text-stone-200 border border-slate-200/80 dark:border-stone-700 rounded-lg text-xs font-semibold shadow-2xs transition cursor-pointer"
                      title="Preview published research document"
                    >
                      <Eye className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                      <span>Preview</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        requireAuthorAuth(() => {
                          printPublicationCertificate(
                            {
                              authorName: article.authors.map((a) => a.name).join(', '),
                              paperTitle: article.title,
                              trackingId: article.trackingId,
                              volume: article.volume ? String(article.volume) : undefined,
                              issue: article.issue ? String(article.issue) : undefined,
                              pages: article.pages,
                              doi: article.doi,
                              date: article.publishedDate || article.submissionDate
                            },
                            content,
                            uploadedAssets?.['certificate_template']
                          );
                        }, 'Author Login Required: Please sign in with your User ID and Password to download this Certificate of Publication.');
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-800 hover:bg-sky-900 text-white rounded-lg text-xs font-semibold shadow-2xs transition cursor-pointer"
                      title="Download author publication certificate with ISSN and Editor-in-Chief signature"
                    >
                      <Award className="w-3.5 h-3.5 text-sky-200" />
                      <span>Certificate</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        requireAuthorAuth(async () => {
                          const success = await downloadPublishedPaper(article);
                          if (!success) {
                            setSelectedArticleForView(article);
                          }
                        }, 'Author Login Required: Please sign in with your User ID and Password to download published research papers.');
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1c355e] hover:bg-[#102344] text-white rounded-lg text-xs font-semibold shadow-2xs transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-sky-300" />
                      <span>
                        <EditableText id="article_btn_download_pdf" placeholder="Download PDF" />
                      </span>
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>

      {/* Cover Page Preview Modal */}
      <DocumentPreviewModal
        isOpen={isCoverPreviewOpen}
        onClose={() => setIsCoverPreviewOpen(false)}
        asset={previewCoverAsset}
        dataUrl={previewCoverAsset?.fileDataUrl}
        onDownload={(asset) => {
          if (asset?.fileDataUrl) {
            triggerFileDownload(
              asset.fileDataUrl,
              asset.fileName || 'CHSSH_Volume_7_Cover.pdf',
              asset.fileType || 'application/pdf'
            );
          }
        }}
      />

      {/* Published Paper Preview Modal */}
      {isArticlePreviewOpen && previewArticle && (previewArticle.driveUrl || previewArticle.driveFileId) ? (
        <GoogleDrivePreviewModal
          isOpen={isArticlePreviewOpen}
          onClose={() => {
            setIsArticlePreviewOpen(false);
            setPreviewArticle(null);
          }}
          title={previewArticle.title}
          authors={previewArticle.authors.map(a => a.name).join(', ')}
          driveUrl={previewArticle.driveUrl}
          driveFileId={previewArticle.driveFileId}
          resourceType={previewArticle.driveResourceType as any}
          volumeInfo={`Vol. ${previewArticle.volume || 7}, Issue ${previewArticle.issue || 1} (${previewArticle.year || 2026})`}
          doi={previewArticle.doi}
          fileName={previewArticle.publishedFileName || `${previewArticle.trackingId}.pdf`}
          onDownload={() => {
            downloadPublishedPaper(previewArticle);
          }}
        />
      ) : isArticlePreviewOpen && previewArticle && (
        <DocumentPreviewModal
          isOpen={isArticlePreviewOpen}
          onClose={() => {
            setIsArticlePreviewOpen(false);
            setPreviewArticle(null);
          }}
          asset={{
            id: previewArticle.id,
            title: previewArticle.title,
            description: `Vol. ${previewArticle.volume || 7}, Issue ${previewArticle.issue || 1} (${previewArticle.year || 2026}) • Track: ${previewArticle.track}`,
            category: 'document',
            fileName: previewArticle.publishedFileName || previewArticle.fileName || `${previewArticle.trackingId}.pdf`,
            fileSize: previewArticle.publishedFileSize || previewArticle.fileSize || 'Standard Document',
            fileType: previewArticle.publishedMimeType || previewArticle.mimeType || 'application/pdf',
            storagePath: previewArticle.publishedStoragePath || previewArticle.storagePath,
            downloadURL: previewArticle.publishedDownloadURL || previewArticle.downloadURL || previewArticle.publishedFileUrl || previewArticle.fileUrl,
            fileDataUrl: previewArticle.publishedFileDataUrl || previewArticle.publishedDownloadURL || previewArticle.downloadURL || previewArticle.publishedFileUrl || previewArticle.fileUrl,
            uploadedAt: previewArticle.publishedUploadedAt || previewArticle.publishedDate || previewArticle.submissionDate
          }}
          onDownload={() => {
            downloadPublishedPaper(previewArticle);
          }}
        />
      )}
    </div>
  );
};
