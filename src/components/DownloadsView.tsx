import React, { useState, useEffect } from 'react';
import { useJournal } from '../context/JournalContext';
import {
  Download,
  FileText,
  BookOpen,
  Layers,
  Award,
  Shield,
  FileCheck,
  Eye,
  CheckCircle2,
  FolderOpen
} from 'lucide-react';
import { motion } from 'motion/react';
import { triggerFileDownload } from '../utils/downloadGenerators';
import { getAssetFile } from '../utils/fileStorage';
import { DocumentPreviewModal } from './DocumentPreviewModal';
import { JournalUploadedAsset } from '../types';
import { getFreshPdfUrl } from '../services/pdfStorageService';

export const DownloadsView: React.FC = () => {
  const { content, uploadedAssets, openAdminAssetUploader, isAdmin, fetchActivePdf } = useJournal();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Document Preview Modal State
  const [previewAsset, setPreviewAsset] = useState<JournalUploadedAsset | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Sync active uploaded assets
  useEffect(() => {
    fetchActivePdf('cover_page').catch(() => {});
  }, []);

  // Filter only genuine downloadable files uploaded and approved by the admin
  const genuineDownloads = Object.values(uploadedAssets || {}).filter((asset) => {
    if (!asset || asset.id === 'journal_logo' || asset.category === 'logo') return false;
    const hasValidFile = Boolean(asset.downloadURL || asset.fileUrl || asset.fileDataUrl);
    const isApprovedAndUploaded = Boolean(asset.isUploaded || asset.downloadURL || asset.status === 'active');
    return isApprovedAndUploaded && hasValidFile;
  });

  const getAssetIcon = (category?: string, id?: string) => {
    if (id === 'cover_page' || category === 'cover') return BookOpen;
    if (id === 'content_page' || category === 'content_page') return Layers;
    if (id === 'author_template' || category === 'template') return FileText;
    if (id === 'certificate_template' || category === 'certificate') return Award;
    if (id === 'plagiarism_declaration' || category === 'plagiarism') return Shield;
    return FileCheck;
  };

  const handleDownloadAsset = async (asset: JournalUploadedAsset) => {
    setDownloadingId(asset.id);
    try {
      const targetUrl = asset.downloadURL || asset.fileUrl || asset.fileDataUrl;
      if (targetUrl) {
        triggerFileDownload(
          targetUrl,
          asset.fileName || `${asset.id}.pdf`,
          asset.fileType || 'application/pdf'
        );
        return;
      }

      const localData = await getAssetFile(asset.id);
      if (localData) {
        triggerFileDownload(
          localData,
          asset.fileName || `${asset.id}.pdf`,
          asset.fileType || 'application/pdf'
        );
      }
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setTimeout(() => setDownloadingId(null), 1000);
    }
  };

  const handlePreviewAsset = async (asset: JournalUploadedAsset) => {
    const effectiveUrl = asset.downloadURL || asset.fileUrl || asset.fileDataUrl;
    let finalUrl = effectiveUrl;

    if (!finalUrl) {
      finalUrl = (await getAssetFile(asset.id)) || undefined;
    }

    setPreviewAsset({
      ...asset,
      fileDataUrl: finalUrl ? (finalUrl.startsWith('http') ? getFreshPdfUrl(finalUrl) : finalUrl) : undefined
    });
    setIsPreviewOpen(true);
  };

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
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1c355e] dark:text-sky-400 uppercase tracking-widest font-mono">
              <Download className="w-3.5 h-3.5" />
              <span>Official Journal Repository</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-slate-100">
              Downloads &amp; Author Documents
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-serif">
              Access official guidelines, manuscript templates, and issue documentation published by the editorial office.
            </p>
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={openAdminAssetUploader}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1c355e] hover:bg-[#102344] text-white text-xs font-semibold shadow-xs cursor-pointer transition"
            >
              <span>Manage &amp; Upload Files in CMS</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* Genuine Downloads List / Empty State */}
      {genuineDownloads.length === 0 ? (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-12 text-center space-y-3">
          <FolderOpen className="w-12 h-12 mx-auto text-stone-400 dark:text-stone-500" />
          <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-800 dark:text-stone-200">
            No downloads are available at present.
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto leading-relaxed">
            Official author guidelines, manuscript templates, and issue documents approved by the editorial office will be available here once published.
          </p>
          {isAdmin && (
            <div className="pt-2">
              <button
                type="button"
                onClick={openAdminAssetUploader}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1c355e] hover:bg-[#102344] text-white text-xs font-semibold shadow-xs cursor-pointer transition"
              >
                <span>Upload Document in CMS</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {genuineDownloads.map((item) => {
            const Icon = getAssetIcon(item.category, item.id);
            const isDownloading = downloadingId === item.id;

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
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      Editorial Approved
                    </span>
                  </div>

                  <div>
                    <h3 className="font-serif font-bold text-slate-900 dark:text-slate-100 text-base">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* File info pill */}
                  <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400 pt-1">
                    <span className="truncate max-w-[220px]" title={item.fileName}>
                      {item.fileName}
                    </span>
                    {item.fileSize && (
                      <span className="shrink-0 text-slate-400">({item.fileSize})</span>
                    )}
                  </div>
                </div>

                {/* Action Toolbar: Preview + Download */}
                <div className="pt-3 border-t border-slate-100 dark:border-stone-800 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handlePreviewAsset(item)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-slate-50 dark:hover:bg-stone-750 text-slate-700 dark:text-slate-200 text-xs font-medium cursor-pointer transition shadow-2xs"
                    title="Preview document in browser"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#102344] dark:text-sky-400" />
                    <span>Preview</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadAsset(item)}
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
      )}

      {/* Bibliographic Citation & Archiving Notice */}
      <div className="bg-slate-50 dark:bg-stone-800/40 rounded-xl border border-slate-200/90 dark:border-stone-800 p-6 text-xs text-slate-600 dark:text-slate-300 space-y-2">
        <h4 className="font-serif font-bold text-slate-900 dark:text-slate-100 text-sm">
          Archival Notice &amp; Compliance
        </h4>
        <p className="leading-relaxed font-serif">
          All published files and documentation hosted on this repository are maintained by the editorial administration of{' '}
          <strong>{content.journal_name}</strong> under prefix <strong>{content.doi_prefix || '10.5281/chssh'}</strong>.
        </p>
      </div>

      {/* Interactive Document Preview Modal */}
      <DocumentPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        asset={previewAsset}
        dataUrl={previewAsset?.fileDataUrl}
        onDownload={(asset) => {
          if (asset) {
            handleDownloadAsset(asset);
          }
        }}
      />
    </div>
  );
};
