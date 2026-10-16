import React, { useState, useEffect } from 'react';
import { useJournal } from '../context/JournalContext';
import {
  Download,
  FileText,
  FileCheck,
  Award,
  BookOpen,
  Sparkles,
  ExternalLink,
  Shield,
  Layers,
  CheckCircle2,
  Eye,
  Check,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { triggerFileDownload } from '../utils/downloadGenerators';
import { getAssetFile } from '../utils/fileStorage';
import {
  generateCoverPagePdf,
  generateManuscriptTemplatePdf,
  generateTableOfContentsPdf,
  generatePlagiarismDeclarationPdf
} from '../utils/pdfGenerators';
import { DocumentPreviewModal } from './DocumentPreviewModal';
import { JournalUploadedAsset } from '../types';
import { getFreshPdfUrl } from '../services/pdfStorageService';

export const DownloadsView: React.FC = () => {
  const { content, articles, uploadedAssets, openAdminAssetUploader, isAdmin, fetchActivePdf, activePdf } = useJournal();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [loadingPreviewId, setLoadingPreviewId] = useState<string | null>(null);

  // Document Preview Modal State
  const [previewAsset, setPreviewAsset] = useState<JournalUploadedAsset | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Ensure latest active PDF is fetched from Firestore
  useEffect(() => {
    fetchActivePdf('cover_page').catch(() => {});
  }, []);

  const downloadAsset = async (id: string, fallbackName: string, generator?: () => string) => {
    setDownloadingId(id);
    try {
      let asset = uploadedAssets?.[id] || (id === 'cover_page' ? activePdf : null);
      try {
        const fresh = await fetchActivePdf(id);
        if (fresh) asset = fresh;
      } catch {}

      const targetUrl = asset?.downloadURL || asset?.fileUrl || asset?.fileDataUrl;
      if (targetUrl) {
        triggerFileDownload(
          targetUrl,
          asset?.fileName || fallbackName,
          asset?.fileType || (fallbackName.endsWith('.docx') ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'application/pdf')
        );
        return;
      }

      let dataUrl = (await getAssetFile(id)) || undefined;
      if (dataUrl) {
        triggerFileDownload(
          dataUrl,
          asset?.fileName || fallbackName,
          asset?.fileType || (fallbackName.endsWith('.docx') ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'application/pdf')
        );
      } else if (generator) {
        const generated = generator();
        triggerFileDownload(generated, fallbackName, 'application/pdf');
      }
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setTimeout(() => setDownloadingId(null), 1000);
    }
  };

  const handlePreviewDocument = async (
    id: string,
    title: string,
    desc: string,
    fallbackName: string,
    generator?: () => string
  ) => {
    setLoadingPreviewId(id);
    try {
      let existing = uploadedAssets?.[id] || (id === 'cover_page' ? activePdf : null);
      try {
        const fresh = await fetchActivePdf(id);
        if (fresh) existing = fresh;
      } catch (err) {
        console.warn('Note on fetching latest document:', err);
      }

      const effectiveUrl = existing?.downloadURL || existing?.fileUrl || existing?.fileDataUrl;
      let finalUrl = effectiveUrl;

      if (!finalUrl) {
        finalUrl = (await getAssetFile(id)) || undefined;
      }
      if (!finalUrl && generator) {
        finalUrl = generator();
      }

      setPreviewAsset({
        id,
        title: existing?.title || title,
        description: existing?.description || desc,
        category: existing?.category || 'document',
        fileName: existing?.fileName || fallbackName,
        fileSize: existing?.fileSize || 'Standard Document',
        fileType: existing?.fileType || (fallbackName.endsWith('.docx') ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'application/pdf'),
        fileDataUrl: finalUrl ? (finalUrl.startsWith('http') ? getFreshPdfUrl(finalUrl) : finalUrl) : undefined,
        downloadURL: existing?.downloadURL,
        fileUrl: existing?.downloadURL || existing?.fileUrl,
        uploadedAt: existing?.uploadedAt || new Date().toISOString(),
        isUploaded: Boolean(existing?.isUploaded || existing?.downloadURL)
      });
      setIsPreviewOpen(true);
    } catch (err) {
      console.error('Preview failed:', err);
      alert('Unable to load the latest PDF. Please try again.');
    } finally {
      setLoadingPreviewId(null);
    }
  };

  const documentItems = [
    {
      id: 'cover_page',
      title: 'Official Journal Cover Page (Vol. 7, No. 1)',
      desc: 'High-resolution archival front cover page with ISSN identifiers, academic masthead, volume folio, and institutional crest.',
      badge: 'Archival Cover',
      filename: 'CHSSH-Volume-7-Cover.pdf',
      icon: BookOpen,
      generator: () => generateCoverPagePdf(content)
    },
    {
      id: 'content_page',
      title: 'Table of Contents & Prelims (Current Issue)',
      desc: 'Comprehensive listing of published articles, pagination, and editorial board member accreditation.',
      badge: 'Editorial Prelims',
      filename: 'CHSSH-Table-of-Contents.pdf',
      icon: Layers,
      generator: () => generateTableOfContentsPdf(content, articles)
    },
    {
      id: 'author_template',
      title: 'Author Manuscript Submission Template',
      desc: 'Official template formatted according to CHSSH style standards (Times New Roman / Calibri, double line spacing, APA 7th reference format).',
      badge: 'Word & PDF Format',
      filename: 'CHSSH-Manuscript-Template.docx',
      icon: FileText,
      generator: () => generateManuscriptTemplatePdf(content)
    },
    {
      id: 'certificate_template',
      title: 'Publication Certificate Framework',
      desc: 'Official accredited certificate framework issued to authors for accepted and published scholarly articles.',
      badge: 'Accreditation Certificate',
      filename: 'CHSSH-Certificate-Framework.pdf',
      icon: Award,
      generator: () => generateCoverPagePdf(content)
    },
    {
      id: 'plagiarism_declaration',
      title: 'Ethics & Plagiarism Declaration Form',
      desc: 'COPE-aligned declaration confirming originality, authorship criteria, and conflict of interest transparency.',
      badge: 'Compliance Form',
      filename: 'CHSSH-Plagiarism-Declaration-Form.pdf',
      icon: Shield,
      generator: () => generatePlagiarismDeclarationPdf(content)
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Masthead Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 p-6 sm:p-8 space-y-4 shadow-xs"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1c355e] dark:text-sky-400 uppercase tracking-widest">
              <Download className="w-3.5 h-3.5" />
              <span>Official Document Repository</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-slate-100">
              Download Guidelines, Templates &amp; Issue Covers
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Access standardized academic templates, author preparation guides, issue front matter, and ethical
              compliance documentation. You can preview any document online before downloading.
            </p>
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={openAdminAssetUploader}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs cursor-pointer transition"
            >
              <span>Manage &amp; Upload Assets in CMS</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* Grid of Documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {documentItems.map((item) => {
          const Icon = item.icon;
          const isDownloading = downloadingId === item.id;
          const customAsset = uploadedAssets?.[item.id];
          const isCustomUploaded = Boolean(customAsset?.isUploaded);
          const activeFileName = customAsset?.fileName || item.filename;
          const activeFileSize = customAsset?.fileSize || null;

          return (
            <div
              key={item.id}
              className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200/90 dark:border-stone-800 p-5 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 rounded-lg bg-[#102344]/10 dark:bg-sky-500/10 flex items-center justify-center text-[#102344] dark:text-sky-400 shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {isCustomUploaded && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        Editorial Version
                      </span>
                    )}
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-stone-800 text-slate-600 dark:text-slate-300">
                      {item.badge}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-serif font-bold text-slate-900 dark:text-slate-100 text-base">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                {/* File info pill */}
                <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400 pt-1">
                  <span className="truncate max-w-[200px]" title={activeFileName}>
                    {activeFileName}
                  </span>
                  {activeFileSize && (
                    <span className="shrink-0 text-slate-400">({activeFileSize})</span>
                  )}
                </div>
              </div>

              {/* Action Toolbar: Preview + Download */}
              <div className="pt-3 border-t border-slate-100 dark:border-stone-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handlePreviewDocument(
                      item.id,
                      item.title,
                      item.desc,
                      activeFileName,
                      item.generator
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-slate-50 dark:hover:bg-stone-750 text-slate-700 dark:text-slate-200 text-xs font-medium cursor-pointer transition shadow-2xs"
                  title="Preview document in browser"
                >
                  <Eye className="w-3.5 h-3.5 text-[#102344] dark:text-sky-400" />
                  <span>Preview</span>
                </button>

                <button
                  type="button"
                  onClick={() => downloadAsset(item.id, activeFileName, item.generator)}
                  disabled={isDownloading}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#102344] hover:bg-[#1a386c] text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors"
                  title="Download copy to your device"
                >
                  <Download className={`w-3.5 h-3.5 ${isDownloading ? 'animate-bounce' : ''}`} />
                  <span>{isDownloading ? 'Downloading...' : 'Download File'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Citation & Indexing Notice */}
      <div className="bg-slate-50 dark:bg-stone-800/40 rounded-xl border border-slate-200/90 dark:border-stone-800 p-6 text-xs text-slate-600 dark:text-slate-300 space-y-2">
        <h4 className="font-serif font-bold text-slate-900 dark:text-slate-100 text-sm">
          Bibliographic Citation &amp; Indexing Notice
        </h4>
        <p className="leading-relaxed">
          All published works are assigned persistent Digital Object Identifiers (DOIs) under prefix{' '}
          <strong>{content.doi_prefix || '10.5281/zenodo'}</strong> and archived in international academic repositories.
          Manuscripts submitted must adhere strictly to the Author Guidelines and COPE publication ethics.
        </p>
      </div>

      {/* Interactive Document Preview Modal */}
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
