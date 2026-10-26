import React, { useState, useEffect } from 'react';
import { Article } from '../types';
import { useJournal } from '../context/JournalContext';
import { EditableText } from './EditableText';
import { ThemeToggle } from './ThemeToggle';
import { ArticleDoiBadge } from './ArticleDoiBadge';
import { printPublicationCertificate } from '../utils/downloadGenerators';
import { motion } from 'motion/react';
import {
  X,
  Download,
  Copy,
  Check,
  BookOpen,
  Award,
  Lock,
  Clock,
  UploadCloud,
  CheckCircle2,
  Eye,
  ExternalLink
} from 'lucide-react';
import { DocumentPreviewModal } from './DocumentPreviewModal';
import { GoogleDrivePreviewModal } from './GoogleDrivePreviewModal';

interface ArticleModalProps {
  article: Article | null;
  onClose: () => void;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({ article, onClose }) => {
  const {
    incrementArticleViews,
    downloadPublishedPaper,
    content,
    uploadedAssets,
    isAdmin,
    setActiveTab,
    setAdminActiveSubTab,
    requireAuthorAuth
  } = useJournal();

  const [citationFormat, setCitationFormat] = useState<'apa' | 'mla' | 'chicago' | 'bibtex'>('apa');
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [certDownloading, setCertDownloading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    if (article) {
      incrementArticleViews(article.id);
    }
  }, [article?.id]);

  if (!article) return null;

  const authorsString = article.authors.map(a => a.name).join(', ');
  const year = article.year || (article.publishedDate ? new Date(article.publishedDate).getFullYear() : new Date().getFullYear());
  const volume = article.volume || 1;
  const issue = article.issue || 1;
  const pages = article.pages || '';
  const doi = article.doi || '';

  const isGoogleDriveArticle = Boolean(article.driveUrl || article.driveFileId);
  const isPublished = article.status === 'published';

  const hasUploadedPaper = isPublished || Boolean(
    isGoogleDriveArticle ||
    article.publishedStoragePath ||
    article.storagePath ||
    article.publishedDownloadURL ||
    article.downloadURL ||
    article.publishedFileName ||
    article.publishedFileDataUrl ||
    article.publishedFileUrl ||
    (typeof window !== 'undefined' && localStorage.getItem(`chssh_pub_file_${article.id}`))
  );

  const doiSuffix = doi ? ` https://doi.org/${doi}` : '';
  const pagesStr = pages ? `, ${pages}` : '';
  const mlaPagesStr = pages ? `, pp. ${pages}` : '';
  const chicagoPagesStr = pages ? `: ${pages}` : '';

  const citations = {
    apa: `${authorsString} (${year}). ${article.title}. Contemporary Horizons in Social Sciences and Humanities, ${volume}(${issue})${pagesStr}.${doiSuffix}`,
    mla: `${authorsString}. "${article.title}." Contemporary Horizons in Social Sciences and Humanities, vol. ${volume}, no. ${issue}, ${year}${mlaPagesStr}.${doiSuffix}`,
    chicago: `${authorsString}. "${article.title}." Contemporary Horizons in Social Sciences and Humanities ${volume}, no. ${issue} (${year})${chicagoPagesStr}.${doiSuffix}`,
    bibtex: `@article{chssh_${article.trackingId.replace(/-/g, '_')},\n  title={${article.title}},\n  author={${authorsString}},\n  journal={Contemporary Horizons in Social Sciences and Humanities},\n  volume={${volume}},\n  number={${issue}},\n  pages={${pages || '—'}},\n  year={${year}}${doi ? `,\n  doi={${doi}}` : ''}\n}`
  };

  const handleCopyCitation = () => {
    navigator.clipboard.writeText(citations[citationFormat]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPublished = async () => {
    const success = await downloadPublishedPaper(article);
    if (success) {
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 w-full max-w-3xl my-8 overflow-hidden transition-colors"
      >
        <div className="bg-[#0f1f38] dark:bg-slate-950 text-white px-6 py-4 flex items-center justify-between border-b border-[#1c355e]/50">
          <div className="flex items-center gap-2 text-xs text-sky-300 font-mono flex-wrap">
            <span>Vol. {volume}, Issue {issue} ({year})</span>
            <span> </span>
            <ArticleDoiBadge
              doi={doi}
              size="sm"
              variant="badge"
              className="bg-[#162a4a] dark:bg-slate-900 border-sky-500/30 text-sky-200"
            />
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle variant="compact" />
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#1c355e]/40 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-[#102344] text-[#1c355e] dark:text-sky-300 text-xs font-semibold border border-blue-200 dark:border-sky-800">
              {article.track}
            </span>
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {article.viewsCount || 1} Views
              </span>
              <span> </span>
              <span>{article.downloadsCount || 0} Downloads</span>
            </div>
          </div>

          <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 leading-snug">
            {article.title}
          </h2>

          <div className="bg-slate-50 dark:bg-slate-850 rounded-xl p-4 border border-slate-200/90 dark:border-slate-800 space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              <EditableText id="modal_authors_heading" placeholder="Authors & Affiliations" />
            </div>
            <div className="space-y-1.5">
              {article.authors.map((author) => (
                <div key={author.id} className="text-xs text-slate-700 dark:text-slate-300 flex flex-wrap items-baseline gap-x-2">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{author.name}</span>
                  <span className="text-slate-500 dark:text-slate-400">({author.affiliation}, {author.country})</span>
                  {author.isCorresponding && (
                    <span className="px-1.5 py-0.2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded text-[10px] font-medium">
                      Corresponding Author
                    </span>
                  )}
                  {author.orcid && (
                    <span className="text-emerald-700 dark:text-emerald-400 font-mono text-[11px]">
                      ORCID: {author.orcid}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              <EditableText id="modal_abstract_heading" placeholder="Abstract" />
            </h3>
            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-250 font-serif text-justify bg-blue-50/40 dark:bg-slate-850/80 p-4 rounded-xl border border-blue-200/60 dark:border-slate-800">
              {article.abstract}
            </p>
          </div>

          <div>
            <span className="text-xs font-bold text-stone-800 dark:text-stone-200 mr-2">
              <EditableText id="modal_keywords_heading" placeholder="Keywords:" />
            </span>
            <div className="inline-flex flex-wrap gap-1.5 mt-1">
              {article.keywords.map((kw, i) => (
                <span
                  key={i}
                  className="px-2.5 py-0.5 rounded-md text-xs bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-stone-200 dark:border-stone-800 space-y-3">
            {hasUploadedPaper ? (
              <div className="bg-emerald-50/80 dark:bg-emerald-950/40 rounded-xl p-3.5 border border-emerald-200 dark:border-emerald-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{isGoogleDriveArticle ? 'Google Drive Document Ready' : 'Official Journal-Templated Publication Ready'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-stone-700 dark:text-stone-300">
                    <span className="font-bold">{article.publishedFileName || (isGoogleDriveArticle ? 'Google Drive Document' : 'Published_Paper.pdf')}</span>
                    <span className="text-stone-500">({isGoogleDriveArticle ? 'Google Drive Cloud' : (article.publishedFileSize || '1.8 MB')})</span>
                  </div>
                  {article.driveUrl && (
                    <div className="pt-1.5">
                      <a
                        href={article.driveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-mono text-sky-700 dark:text-sky-300 hover:underline break-all"
                        title={article.driveUrl}
                      >
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        <span className="truncate max-w-sm sm:max-w-md">{article.driveUrl}</span>
                      </a>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setIsPreviewOpen(true)}
                    className="flex items-center gap-2 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-xl text-xs font-semibold border border-stone-200 dark:border-stone-700 shadow-2xs transition-all cursor-pointer"
                  >
                    <Eye className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    <span>Preview Document</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleDownloadPublished}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-emerald-200" />
                    <span>Download PDF</span>
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50/80 dark:bg-amber-950/40 rounded-xl p-3.5 border border-amber-200 dark:border-amber-800/80 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                    <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Galley Proof &amp; Typeset Edition in Preparation</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 rounded font-bold">
                    Download Locked
                  </span>
                </div>
                <p className="text-xs text-amber-950/80 dark:text-amber-200/80 font-serif leading-relaxed">
                  The official copy-edited and journal-formatted manuscript is currently in production by the editorial board. As per journal publishing policy, downloads are enabled exclusively after the editorial office uploads the finalized paper in the official journal template.
                </p>
                {isAdmin && (
                  <div className="pt-2 border-t border-amber-200/60 dark:border-amber-800/60 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-amber-800 dark:text-amber-300">
                      You are logged in as Editor/Admin:
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        setActiveTab('admin');
                        setAdminActiveSubTab('publication');
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1c355e] hover:bg-[#102344] text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-xs"
                    >
                      <UploadCloud className="w-3.5 h-3.5 text-sky-300" />
                      <span>Upload Templated Paper in Admin Desk</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2 flex-wrap">
                {hasUploadedPaper ? (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => setIsPreviewOpen(true)}
                      className="flex items-center gap-2 px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-xl text-xs font-semibold border border-stone-200 dark:border-stone-700 shadow-2xs transition-all cursor-pointer"
                    >
                      <Eye className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                      <span>Preview File</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={handleDownloadPublished}
                      className="flex items-center gap-2 px-4 py-2.5 bg-[#1c355e] hover:bg-[#102344] text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-sky-300" />
                      <span>
                        <EditableText id="modal_download_btn" placeholder="Download PDF" />
                      </span>
                    </motion.button>
                  </>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="flex items-center gap-2 px-4 py-2.5 bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500 rounded-xl text-xs font-semibold border border-stone-200 dark:border-stone-700 cursor-not-allowed"
                    title="This paper is currently in typesetting. Full download activates once editor uploads the formatted manuscript in the journal template."
                  >
                    <Lock className="w-4 h-4 text-stone-400 dark:text-stone-500" />
                    <span>Typeset Document Pending Editorial Upload</span>
                  </button>
                )}

                {article.status === 'published' && (
                  article.certificateUrl ? (
                    <motion.a
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      href={article.certificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow transition-all cursor-pointer"
                      title="Download / Open Official Publication Certificate (Google Drive)"
                    >
                      <Award className="w-4 h-4 text-amber-200" />
                      <span>Download Certificate (Google Drive)</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                    </motion.a>
                  ) : (
                    <div
                      className="flex items-center gap-1.5 px-3.5 py-2.5 bg-stone-100 dark:bg-stone-800 text-slate-500 dark:text-slate-400 rounded-xl text-xs border border-stone-200 dark:border-stone-700"
                      title="Your publication certificate will be available after it is uploaded by the admin."
                    >
                      <Award className="w-4 h-4 text-slate-400" />
                      <span>Certificate Pending Admin Upload</span>
                    </div>
                  )
                )}
              </div>

              {downloadSuccess && (
                <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/70 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 animate-in fade-in">
                  <Check className="w-3.5 h-3.5" />
                  <EditableText id="modal_download_success" placeholder="Download initiated successfully!" />
                </span>
              )}
            </div>
          </div>

          <div className="bg-stone-50 dark:bg-stone-850 rounded-xl p-4 border border-stone-200 dark:border-stone-800 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 dark:text-stone-200">
                <BookOpen className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                <span>
                  <EditableText id="modal_cite_heading" placeholder="How to Cite this Paper" />
                </span>
              </div>
              <div className="flex items-center gap-1 bg-stone-200/80 dark:bg-stone-800 p-0.5 rounded-lg text-[11px]">
                {(['apa', 'mla', 'chicago', 'bibtex'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setCitationFormat(fmt)}
                    className={`px-2.5 py-1 rounded-md font-medium uppercase cursor-pointer transition ${
                      citationFormat === fmt
                        ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-2xs font-bold'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <pre className="text-xs font-sans bg-white dark:bg-stone-900 p-3.5 rounded-lg border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 whitespace-pre-wrap break-words">
                {citations[citationFormat]}
              </pre>
              <button
                type="button"
                onClick={handleCopyCitation}
                className="absolute top-2 right-2 flex items-center gap-1 px-2.5 py-1 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-200 rounded-md text-[11px] font-medium border border-stone-300 dark:border-stone-700 transition cursor-pointer shadow-2xs"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>
                      <EditableText id="modal_cite_copy_btn" placeholder="Copy Citation" />
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-stone-50 dark:bg-stone-950 px-6 py-3.5 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
          <span className="font-sans">
            <EditableText id="modal_license_text" placeholder="Licensed under Creative Commons Attribution 4.0 (CC BY 4.0)" />
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-lg font-medium transition cursor-pointer"
          >
            <EditableText id="modal_close_btn" placeholder="Close" />
          </button>
        </div>
      </motion.div>

      {/* Public Document Preview Modal */}
      {isPreviewOpen && isGoogleDriveArticle ? (
        <GoogleDrivePreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          title={article.title}
          authors={authorsString}
          driveUrl={article.driveUrl}
          driveFileId={article.driveFileId}
          resourceType={article.driveResourceType as any}
          volumeInfo={`Vol. ${volume}, Issue ${issue} (${year})`}
          doi={doi}
          fileName={article.publishedFileName || `${article.trackingId}.pdf`}
          onDownload={handleDownloadPublished}
        />
      ) : isPreviewOpen && (
        <DocumentPreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          asset={{
            id: article.id,
            title: article.title,
            description: `Vol. ${volume}, Issue ${issue} (${year}) • Track: ${article.track}`,
            category: 'document',
            fileName: article.publishedFileName || article.fileName || `${article.trackingId}.pdf`,
            fileSize: article.publishedFileSize || article.fileSize || 'Standard Document',
            fileType: article.publishedMimeType || article.mimeType || (article.publishedFileName?.toLowerCase().endsWith('.docx') ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'application/pdf'),
            storagePath: article.publishedStoragePath || article.storagePath,
            downloadURL: article.publishedDownloadURL || article.downloadURL || article.publishedFileUrl || article.fileUrl,
            fileDataUrl: article.publishedFileDataUrl || article.publishedDownloadURL || article.downloadURL || article.publishedFileUrl || article.fileUrl,
            uploadedAt: article.publishedUploadedAt || article.publishedDate || article.submissionDate,
            volumeInfo: `Vol. ${volume}, Issue ${issue} (${year})`
          }}
          onDownload={() => {
            downloadPublishedPaper(article);
          }}
        />
      )}
    </div>
  );
};
