import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  FileText,
  AlertCircle,
  Loader2,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { dataUrlToBinaryBlob, triggerFileDownload } from '../utils/downloadGenerators';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

interface PdfCanvasViewerProps {
  dataUrl?: string | null;
  fileName?: string;
  onDownload?: () => void;
  className?: string;
  minHeight?: string;
}

export const PdfCanvasViewer: React.FC<PdfCanvasViewerProps> = ({
  dataUrl,
  fileName = 'document.pdf',
  onDownload,
  className = '',
  minHeight = '480px'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [scale, setScale] = useState<number>(1.15);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [useNativeObjectViewer, setUseNativeObjectViewer] = useState<boolean>(false);

  // Maintain clean URL for viewer
  useEffect(() => {
    if (!dataUrl) {
      setBlobUrl(null);
      return;
    }
    let url: string | null = null;
    try {
      if (dataUrl.startsWith('blob:') || dataUrl.startsWith('http://') || dataUrl.startsWith('https://')) {
        url = dataUrl;
      } else {
        const blob = dataUrlToBinaryBlob(dataUrl, 'application/pdf');
        url = URL.createObjectURL(blob);
      }
      setBlobUrl(url);
    } catch (e) {
      console.warn('Failed to construct blob URL for viewer:', e);
    }

    return () => {
      if (url && !dataUrl.startsWith('blob:') && !dataUrl.startsWith('http://') && !dataUrl.startsWith('https://')) {
        URL.revokeObjectURL(url);
      }
    };
  }, [dataUrl]);

  const getUint8ArrayFromDataUrl = (url: string): Uint8Array | null => {
    try {
      const commaIndex = url.indexOf(',');
      const base64Str = (commaIndex !== -1 ? url.slice(commaIndex + 1) : url).replace(/\s/g, '');
      const binaryString = atob(base64Str);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    } catch (err) {
      console.warn('Error converting dataUrl to Uint8Array:', err);
      return null;
    }
  };

  useEffect(() => {
    if (!dataUrl) {
      setIsLoading(false);
      setLoadError('No PDF data available.');
      return;
    }
    let isMounted = true;
    setIsLoading(true);
    setLoadError(null);

    const loadPdf = async () => {
      try {
        let loadingTask: any;
        if (dataUrl.startsWith('data:')) {
          const bytes = getUint8ArrayFromDataUrl(dataUrl);
          if (!bytes || bytes.length === 0) {
            throw new Error('Could not decode PDF binary.');
          }
          loadingTask = pdfjsLib.getDocument({ data: bytes });
        } else {
          loadingTask = pdfjsLib.getDocument({ url: dataUrl });
        }
        const doc = await loadingTask.promise;
        if (!isMounted) return;
        setPdfDoc(doc);
        setTotalPages(doc.numPages);
        setCurrentPage(1);
        setIsLoading(false);
      } catch (err: any) {
        console.warn('PDF.js loading warning:', err);
        if (!isMounted) return;
        setIsLoading(false);
        setLoadError(err?.message || 'Failed to render PDF in canvas mode.');
        // Enable native object viewer fallback so user sees the document seamlessly
        setUseNativeObjectViewer(true);
      }
    };

    loadPdf();
    return () => {
      isMounted = false;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {}
      }
    };
  }, [dataUrl]);

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current || currentPage < 1 || useNativeObjectViewer) return;
    let isMounted = true;

    const renderPage = async () => {
      try {
        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch {}
        }
        const page = await pdfDoc.getPage(currentPage);
        if (!isMounted) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');
        if (!context) return;

        const viewport = page.getViewport({ scale });
        const outputScale = window.devicePixelRatio || 1;

        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;
        const renderContext = {
          canvasContext: context,
          transform: transform || undefined,
          viewport: viewport
        };
        const task = page.render(renderContext);
        renderTaskRef.current = task;
        await task.promise;
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') {
          console.warn('PDF page render error:', err);
        }
      }
    };

    renderPage();
    return () => {
      isMounted = false;
    };
  }, [pdfDoc, currentPage, scale, useNativeObjectViewer]);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };
  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 2.5));
  };
  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.6));
  };

  const handleDownloadFile = () => {
    if (onDownload) {
      onDownload();
    } else if (dataUrl) {
      triggerFileDownload(dataUrl, fileName, 'application/pdf');
    }
  };

  return (
    <div
      className={`flex flex-col bg-stone-100 dark:bg-stone-950 rounded-xl border border-stone-300 dark:border-stone-800 overflow-hidden shadow-inner ${className}`}
      style={{ minHeight }}
    >
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-3 py-2 bg-stone-900 text-stone-200 border-b border-stone-800 text-xs gap-2 select-none">
        <div className="flex items-center gap-1.5">
          {!useNativeObjectViewer && (
            <>
              <button
                type="button"
                onClick={handlePrevPage}
                disabled={currentPage <= 1 || isLoading}
                className="p-1 rounded hover:bg-stone-800 text-stone-300 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer transition"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono text-xs text-stone-300 px-1 font-semibold">
                {isLoading ? '...' : `${currentPage} / ${totalPages || 1}`}
              </span>
              <button
                type="button"
                onClick={handleNextPage}
                disabled={currentPage >= totalPages || isLoading}
                className="p-1 rounded hover:bg-stone-800 text-stone-300 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer transition"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          <div className="h-3 w-px bg-stone-700 mx-1 hidden sm:block" />
          <span className="font-mono text-[11px] text-stone-400 truncate max-w-[150px] sm:max-w-[220px]" title={fileName}>
            {fileName}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {!useNativeObjectViewer && (
            <>
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={scale <= 0.6 || isLoading}
                className="p-1 rounded hover:bg-stone-800 text-stone-300 disabled:opacity-40 cursor-pointer transition"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[11px] text-stone-400 w-10 text-center">
                {Math.round(scale * 100)}%
              </span>
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={scale >= 2.5 || isLoading}
                className="p-1 rounded hover:bg-stone-800 text-stone-300 disabled:opacity-40 cursor-pointer transition"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {blobUrl && (
            <button
              type="button"
              onClick={() => setUseNativeObjectViewer((prev) => !prev)}
              className="p-1 px-2 rounded hover:bg-stone-800 text-sky-400 cursor-pointer transition flex items-center gap-1 text-[11px] font-semibold"
              title="Toggle between Canvas view and Native Browser PDF view"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden md:inline">
                {useNativeObjectViewer ? 'Canvas Mode' : 'Native Mode'}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={handleDownloadFile}
            className="p-1 px-2.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer transition flex items-center gap-1.5 text-[11px] font-semibold ml-1 shadow-xs"
            title="Download genuine binary PDF file to your computer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Main Preview Container */}
      <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-stone-200/60 dark:bg-stone-950/80 relative min-h-[460px]">
        {isLoading && !useNativeObjectViewer && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-stone-900/60 backdrop-blur-2xs text-white space-y-2">
            <Loader2 className="w-7 h-7 text-sky-400 animate-spin" />
            <span className="text-xs font-semibold font-mono">Loading latest PDF...</span>
          </div>
        )}

        {useNativeObjectViewer && blobUrl ? (
          <div className="w-full h-full min-h-[500px] flex flex-col">
            <object
              data={blobUrl}
              type="application/pdf"
              className="w-full h-full min-h-[500px] rounded-lg border border-stone-300 dark:border-stone-800 bg-white"
            >
              <div className="p-6 text-center space-y-3 bg-white dark:bg-stone-900 rounded-xl">
                <FileText className="w-10 h-10 text-stone-400 mx-auto" />
                <p className="text-xs text-stone-600 dark:text-stone-300 font-serif">
                  Browser native PDF embed is ready for download.
                </p>
                <button
                  type="button"
                  onClick={handleDownloadFile}
                  className="px-4 py-2 rounded-lg bg-[#102344] text-white text-xs font-semibold cursor-pointer shadow-xs"
                >
                  Download {fileName}
                </button>
              </div>
            </object>
          </div>
        ) : loadError && !isLoading ? (
          <div className="p-6 text-center max-w-md bg-white dark:bg-stone-900 rounded-xl border border-stone-300 dark:border-stone-800 shadow-md space-y-3">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
            <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
              Unable to load the latest PDF. Please try again.
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-serif">
              The PDF could not be loaded directly into canvas. You can retry, view in native browser mode, or download the original file.
            </p>
            <div className="flex justify-center gap-2 pt-2">
              {blobUrl && (
                <button
                  type="button"
                  onClick={() => setUseNativeObjectViewer(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white text-xs font-semibold cursor-pointer transition shadow-xs"
                >
                  View in Native Mode
                </button>
              )}
              <button
                type="button"
                onClick={handleDownloadFile}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer transition shadow-xs"
              >
                Download PDF File
              </button>
            </div>
          </div>
        ) : (
          <div className="inline-block transition-all shadow-xl rounded-sm overflow-hidden bg-white">
            <canvas ref={canvasRef} className="block" />
          </div>
        )}
      </div>
    </div>
  );
};
