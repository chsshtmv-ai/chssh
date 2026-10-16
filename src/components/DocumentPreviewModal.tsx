import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Download,
  FileCheck,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { JournalUploadedAsset } from '../types';
import { detectDocumentFormat, dataUrlToBlobUrl } from '../utils/documentHelpers';
import { triggerFileDownload } from '../utils/downloadGenerators';
import { useJournal } from '../context/JournalContext';
import { PdfCanvasViewer } from './PdfCanvasViewer';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: JournalUploadedAsset | null;
  dataUrl?: string | null;
  onDownload?: (asset: JournalUploadedAsset, format?: 'docx' | 'pdf') => void;
  isAdmin?: boolean;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  asset,
  dataUrl,
  onDownload
}) => {
  const { content } = useJournal();
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  const effectiveDataUrl = dataUrl || asset?.downloadURL || asset?.fileUrl || asset?.fileDataUrl || null;
  const detectedFormat = detectDocumentFormat({
    ...asset,
    fileDataUrl: effectiveDataUrl || undefined,
    downloadURL: asset?.downloadURL,
    fileUrl: asset?.fileUrl
  });

  useEffect(() => {
    if (!isOpen || !asset || !effectiveDataUrl) {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
        setBlobUrl(null);
      }
      return;
    }
    if (detectedFormat === 'pdf') {
      const url = dataUrlToBlobUrl(effectiveDataUrl, 'application/pdf');
      setBlobUrl(url);
    } else {
      setBlobUrl(null);
    }
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [isOpen, asset, effectiveDataUrl, detectedFormat]);

  if (!isOpen || !asset) return null;

  const handleDownloadOriginal = () => {
    if (onDownload) {
      onDownload(asset, detectedFormat === 'pdf' ? 'pdf' : detectedFormat === 'docx' ? 'docx' : undefined);
    } else if (effectiveDataUrl) {
      const ext = detectedFormat === 'docx' ? '.docx' : '.pdf';
      const safeName = asset.fileName ? (asset.fileName.includes('.') ? asset.fileName : `${asset.fileName}${ext}`) : `${asset.id || 'document'}${ext}`;
      triggerFileDownload(
        effectiveDataUrl,
        safeName,
        detectedFormat === 'docx'
          ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          : 'application/pdf'
      );
    }
  };

  const handleDownloadAlternate = (target: 'docx' | 'pdf') => {
    if (onDownload) {
      onDownload(asset, target);
    } else if (effectiveDataUrl) {
      const ext = target === 'docx' ? '.docx' : '.pdf';
      const base = (asset.fileName || asset.id || 'document').replace(/\.(pdf|docx|doc)$/i, '');
      triggerFileDownload(
        effectiveDataUrl,
        `${base}${ext}`,
        target === 'docx'
          ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          : 'application/pdf'
      );
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/80 backdrop-blur-xs">
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.96, opacity: 0 }}
          className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl max-w-4xl w-full p-4 sm:p-6 text-stone-900 dark:text-stone-100 shadow-2xl relative max-h-[92vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-stone-200 dark:border-stone-800 pb-3 gap-3">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {detectedFormat === 'pdf' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-bold uppercase tracking-wider font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                    Adobe PDF Document (.pdf)
                  </span>
                ) : detectedFormat === 'docx' || detectedFormat === 'doc' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-xs font-bold uppercase tracking-wider font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                    Microsoft Word (.docx)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold uppercase tracking-wider font-mono">
                    Official Editorial Asset
                  </span>
                )}
                <span className="text-xs text-stone-500 font-mono">
                  {asset.fileSize || 'Standard Document'}
                </span>
                {asset.version && (
                  <span className="text-[11px] px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-mono">
                    v{asset.version}
                  </span>
                )}
              </div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-50 truncate">
                {asset.title || asset.fileName}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-serif truncate">
                File: <strong className="font-mono text-stone-700 dark:text-stone-300">{asset.fileName}</strong>
                {asset.uploadedAt && `   Uploaded: ${new Date(asset.uploadedAt).toLocaleString()}`}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer shrink-0"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Viewer */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
            {detectedFormat === 'pdf' && (
              <div className="space-y-3">
                <PdfCanvasViewer
                  dataUrl={effectiveDataUrl}
                  fileName={asset.fileName}
                  onDownload={handleDownloadOriginal}
                  minHeight="500px"
                />
              </div>
            )}

            {(detectedFormat === 'docx' || detectedFormat === 'doc') && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-stone-600 dark:text-stone-300 bg-blue-50/60 dark:bg-blue-950/40 px-3.5 py-2.5 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-blue-700 dark:text-blue-400 shrink-0" />
                    <span className="font-serif">
                      Official Microsoft Office Open XML (.docx) Manuscript Document Framework
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-blue-900 dark:text-blue-300">
                    Double-Blind Peer Review Certified
                  </span>
                </div>

                <div className="bg-stone-50 dark:bg-stone-850 border border-stone-300 dark:border-stone-700 rounded-xl p-6 sm:p-8 space-y-6 shadow-xs font-serif">
                  <div className="border-b border-stone-200 dark:border-stone-700 pb-4 text-center space-y-1">
                    <div className="text-[11px] font-bold tracking-widest text-[#1c355e] dark:text-sky-400 uppercase">
                      {content.journal_name} ({content.journal_short_name})
                    </div>
                    <div className="text-[10px] text-stone-500 font-mono">
                      ISSN (Online): {content.issn_online || '2583-942X'} | ISSN (Print): {content.issn_print || '2583-9411'} | Volume 7, Issue 1 (2026)
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 pt-2 font-serif">
                      {asset.title || 'Official Academic Submission Template'}
                    </h3>
                    <p className="text-xs text-stone-600 dark:text-stone-300 max-w-xl mx-auto italic">
                      {asset.description || 'Mandatory formatting hierarchy, typographical specifications, abstract structure, and citation standards for scholarly submissions.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="bg-white dark:bg-stone-900 p-4 rounded-lg border border-stone-200 dark:border-stone-800 space-y-2">
                      <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Document Structure Sections</span>
                      </div>
                      <ul className="space-y-1.5 text-stone-600 dark:text-stone-400 pl-2">
                        <li>  <strong>Section 1:</strong> Title, Abstract (200 250 words), 5 Keywords</li>
                        <li>  <strong>Section 2:</strong> 1. Introduction &amp; Theoretical Background</li>
                        <li>  <strong>Section 3:</strong> 2. Materials &amp; Research Methodology</li>
                        <li>  <strong>Section 4:</strong> 3. Empirical Results &amp; Comparative Analysis</li>
                        <li>  <strong>Section 5:</strong> 4. Discussion, Conclusion &amp; Future Research</li>
                        <li>  <strong>Section 6:</strong> Complete References in APA 7th / Chicago 17th</li>
                      </ul>
                    </div>

                    <div className="bg-white dark:bg-stone-900 p-4 rounded-lg border border-stone-200 dark:border-stone-800 space-y-2">
                      <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        <span>Typographic &amp; Style Specifications</span>
                      </div>
                      <ul className="space-y-1.5 text-stone-600 dark:text-stone-400 pl-2">
                        <li>  <strong>Body Font:</strong> Times New Roman 12 pt, 1.5 line spacing</li>
                        <li>  <strong>Margins:</strong> 1.0 inch (2.54 cm) on all four sides</li>
                        <li>  <strong>Layout:</strong> Double-Blind compliant (Authors stripped)</li>
                        <li>  <strong>Headings:</strong> Level 1 (Bold 14pt), Level 2 (Bold 12pt)</li>
                        <li>  <strong>Tables &amp; Figures:</strong> Numbered consecutively, high-res</li>
                        <li>  <strong>Format:</strong> genuine Microsoft Word (.docx) package</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {detectedFormat === 'unknown' && effectiveDataUrl?.startsWith('data:image/') && (
              <div className="border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden text-center p-6 bg-stone-100 dark:bg-stone-950">
                <img
                  src={effectiveDataUrl}
                  alt={asset.fileName}
                  className="max-h-80 mx-auto object-contain rounded-lg shadow-sm"
                />
              </div>
            )}

            <div className="bg-stone-50 dark:bg-stone-850 p-4 rounded-xl border border-stone-200 dark:border-stone-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-serif">
              <div>
                <span className="block text-[10px] text-stone-400 dark:text-stone-500 uppercase font-mono">Format</span>
                <strong className="text-stone-900 dark:text-stone-100">
                  {detectedFormat === 'pdf' ? 'Adobe PDF (.pdf)' : detectedFormat === 'docx' ? 'Microsoft Word (.docx)' : asset.fileType || 'Document'}
                </strong>
              </div>
              <div>
                <span className="block text-[10px] text-stone-400 dark:text-stone-500 uppercase font-mono">File Size</span>
                <strong className="text-stone-900 dark:text-stone-100">
                  {asset.fileSize || 'Standard'}
                </strong>
              </div>
              <div>
                <span className="block text-[10px] text-stone-400 dark:text-stone-500 uppercase font-mono">Volume / Folio</span>
                <strong className="text-stone-900 dark:text-stone-100">
                  {asset.volumeInfo || 'Vol. 7, Issue 1 (2026)'}
                </strong>
              </div>
              <div>
                <span className="block text-[10px] text-stone-400 dark:text-stone-500 uppercase font-mono">License</span>
                <strong className="text-stone-900 dark:text-stone-100">
                  CC BY 4.0 Open Access
                </strong>
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-200 dark:border-stone-800">
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500 font-serif">
                Exact format guarantee: File will download in genuine <strong className="uppercase">{detectedFormat === 'pdf' ? 'PDF' : 'Word (.docx)'}</strong> format.
              </span>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-750 transition cursor-pointer"
              >
                Close
              </button>

              {detectedFormat === 'pdf' ? (
                <button
                  type="button"
                  onClick={() => handleDownloadAlternate('docx')}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition cursor-pointer"
                  title="Download converted Word document"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Also get as Word (.docx)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleDownloadAlternate('pdf')}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 hover:bg-red-100 transition cursor-pointer"
                  title="Download converted PDF document"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Also get as PDF (.pdf)</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleDownloadOriginal}
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold text-white bg-[#1c355e] hover:bg-[#102344] transition shadow-xs cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download {detectedFormat === 'pdf' ? 'PDF File (.pdf)' : 'Word File (.docx)'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
