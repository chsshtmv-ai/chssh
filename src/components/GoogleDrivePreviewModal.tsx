import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Download,
  ExternalLink,
  AlertCircle,
  FileText,
  FileSpreadsheet,
  Presentation,
  ShieldAlert,
  Share2,
  Maximize2
} from 'lucide-react';
import { parseGoogleDriveUrl, GoogleDriveResourceType } from '../utils/googleDriveUtils';

interface GoogleDrivePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  authors?: string;
  driveUrl?: string;
  driveFileId?: string;
  resourceType?: GoogleDriveResourceType;
  volumeInfo?: string;
  doi?: string;
  fileName?: string;
  onDownload?: () => void;
}

export const GoogleDrivePreviewModal: React.FC<GoogleDrivePreviewModalProps> = ({
  isOpen,
  onClose,
  title,
  authors,
  driveUrl,
  driveFileId,
  volumeInfo,
  doi,
  fileName,
  onDownload
}) => {
  const [hasIframeError, setHasIframeError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!isOpen) return null;

  // Resolve file details using googleDriveUtils
  const parsed = parseGoogleDriveUrl(driveUrl || driveFileId || '');
  const activeFileId = parsed.fileId || driveFileId;
  const activePreviewUrl = parsed.previewUrl || (activeFileId ? `https://drive.google.com/file/d/${activeFileId}/preview` : null);
  const activeDownloadUrl = parsed.downloadUrl || (activeFileId ? `https://drive.google.com/uc?export=download&id=${activeFileId}` : null);
  const activeDirectUrl = parsed.directViewUrl || (activeFileId ? `https://drive.google.com/file/d/${activeFileId}/view` : null);

  const getFormatBadge = () => {
    switch (parsed.resourceType) {
      case 'document':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <FileText className="w-3 h-3 text-blue-600" />
            <span>Google Docs</span>
          </span>
        );
      case 'spreadsheet':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <FileSpreadsheet className="w-3 h-3 text-emerald-600" />
            <span>Google Sheets</span>
          </span>
        );
      case 'presentation':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Presentation className="w-3 h-3 text-amber-600" />
            <span>Google Slides</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800">
            <FileText className="w-3 h-3 text-red-600" />
            <span>PDF Document</span>
          </span>
        );
    }
  };

  const handleTriggerDownload = () => {
    if (onDownload) {
      onDownload();
      return;
    }
    if (activeDownloadUrl) {
      const a = document.createElement('a');
      a.href = activeDownloadUrl;
      a.download = fileName || `${title.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-950/85 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          className={`bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 w-full ${
            isFullscreen ? 'fixed inset-2 max-w-none h-[calc(100vh-16px)]' : 'max-w-5xl h-[88vh]'
          }`}
        >
          {/* Header */}
          <div className="bg-[#0f1f38] text-white px-5 py-3.5 flex items-center justify-between gap-3 border-b border-[#1c355e]/60 shrink-0">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                {getFormatBadge()}
                {volumeInfo && (
                  <span className="text-[11px] font-mono text-sky-300">
                    {volumeInfo}
                  </span>
                )}
                {doi && (
                  <span className="text-[11px] font-mono text-slate-300 bg-[#162a4a] px-2 py-0.5 rounded border border-sky-500/20">
                    DOI: {doi}
                  </span>
                )}
              </div>
              <h3 className="font-serif text-sm sm:text-base font-bold text-white truncate leading-tight">
                {title}
              </h3>
              {authors && (
                <p className="text-[11px] text-slate-300 truncate font-sans mt-0.5">
                  {authors}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="hidden sm:inline-flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1c355e]/50 transition cursor-pointer"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Viewer'}
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1c355e]/50 transition cursor-pointer"
                title="Close Viewer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Action Bar */}
          <div className="px-5 py-2.5 bg-stone-50 dark:bg-stone-850 border-b border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
            <div className="flex items-center gap-2 text-stone-600 dark:text-stone-300">
              <Share2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span className="font-serif hidden sm:inline">Official Document via Google Drive Integration</span>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              {activeDirectUrl && (
                <a
                  href={activeDirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-700 dark:text-stone-200 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-750 border border-stone-300 dark:border-stone-700 shadow-2xs transition"
                  title="Open file directly in Google Drive"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  <span>Open in Google Drive</span>
                </a>
              )}

              <button
                type="button"
                onClick={handleTriggerDownload}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-[#1c355e] hover:bg-[#102344] shadow-2xs transition cursor-pointer"
                title="Download original file from Google Drive"
              >
                <Download className="w-3.5 h-3.5 text-sky-300" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>

          {/* Document Viewer Body */}
          <div className="flex-1 bg-stone-100 dark:bg-stone-950 relative overflow-hidden flex flex-col">
            {activePreviewUrl ? (
              <iframe
                src={activePreviewUrl}
                title={title}
                className="w-full h-full border-0"
                allow="autoplay"
                onError={() => setHasIframeError(true)}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
                <AlertCircle className="w-12 h-12 text-amber-500" />
                <h4 className="font-serif text-lg font-bold text-stone-800 dark:text-stone-200">
                  Google Drive Document Not Available
                </h4>
                <p className="text-xs text-stone-500 max-w-md">
                  No valid Google Drive URL or File ID was found for this document record.
                </p>
              </div>
            )}

            {/* Sharing Permission Guidance Note (Bottom Banner) */}
            <div className="bg-amber-50/90 dark:bg-amber-950/80 border-t border-amber-200 dark:border-amber-800/80 px-4 py-2 text-[11px] text-amber-900 dark:text-amber-200 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Google Drive Access Note:</strong> If preview asks for Google Sign-in or shows "Access Denied", ensure the file's sharing setting in Google Drive is configured to <em>"Anyone with the link — Viewer"</em>.
                </span>
              </div>
              {activeDirectUrl && (
                <a
                  href={activeDirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-semibold shrink-0 hover:text-amber-700"
                >
                  Direct Link
                </a>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
