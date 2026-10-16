import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Link as LinkIcon, RefreshCw } from 'lucide-react';
import { compressImageFile } from '../../utils/imageUtils';

interface ImageUploadFieldProps {
  label?: string;
  value?: string;
  currentValue?: string;
  onChange: (imageUrl: string) => void;
  personName?: string;
  className?: string;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label = 'Profile Portrait / Photo',
  value,
  currentValue,
  onChange,
  personName = '',
  className = ''
}) => {
  const effectiveValue = value !== undefined ? value : (currentValue || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlDraft, setUrlDraft] = useState('');

  const handleFileProcess = async (file: File) => {
    setErrorMsg(null);
    const safeImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    
    if (!safeImageTypes.includes(file.type.toLowerCase())) {
      setErrorMsg('Security restriction: Only JPG, PNG, or WebP portrait photos are permitted. Vectors/SVGs are not accepted.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg('Image file size exceeds the 8 MB security limit. Please choose a smaller portrait.');
      return;
    }
    try {
      setIsCompressing(true);
      const compressedDataUrl = await compressImageFile(file, 400, 400, 0.85);
      onChange(compressedDataUrl);
      setIsCompressing(false);
    } catch (err: unknown) {
      setIsCompressing(false);
      setErrorMsg(err instanceof Error ? err.message : 'Error processing image.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
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
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleApplyUrl = () => {
    if (urlDraft.trim()) {
      onChange(urlDraft.trim());
      setUrlDraft('');
      setShowUrlInput(false);
      setErrorMsg(null);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] font-medium text-[#1c355e] dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <LinkIcon className="w-3 h-3" />
          <span>{showUrlInput ? 'Upload file instead' : 'Use Image URL'}</span>
        </button>
      </div>

      {showUrlInput ? (
        <div className="flex items-center gap-2">
          <input
            type="url"
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            placeholder="https://example.com/scholar-photo.jpg"
            className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-[#1c355e]"
          />
          <button
            type="button"
            onClick={handleApplyUrl}
            className="px-3 py-1.5 bg-[#1c355e] hover:bg-[#102344] text-white text-xs font-bold rounded-lg cursor-pointer transition shrink-0"
          >
            Apply URL
          </button>
        </div>
      ) : null}

      <div className="flex items-start gap-4">
        <div className="relative shrink-0">
          {effectiveValue ? (
            <div className="relative group">
              <img
                src={effectiveValue}
                alt={personName || 'Scholar portrait'}
                referrerPolicy="no-referrer"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover border-2 border-[#1c355e]/40 dark:border-sky-500/50 shadow-xs bg-stone-100 dark:bg-stone-800"
              />
              <button
                type="button"
                onClick={() => onChange('')}
                className="absolute -top-1.5 -right-1.5 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-sm cursor-pointer transition"
                title="Remove photo"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-center p-1">
              <ImageIcon className="w-6 h-6 stroke-1 mb-1" />
              <span className="text-[10px] leading-tight">No photo</span>
            </div>
          )}
        </div>

        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex-1 p-3.5 rounded-xl border-2 border-dashed transition cursor-pointer flex flex-col items-center justify-center text-center ${
            dragActive
              ? 'border-[#1c355e] bg-sky-50/60 dark:bg-[#1c355e]/20'
              : 'border-slate-300 dark:border-slate-700 hover:border-[#1c355e]/60 dark:hover:border-sky-500/50 bg-slate-50/50 dark:bg-slate-850/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          {isCompressing ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1c355e] dark:text-sky-400 py-1">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Optimizing image...</span>
            </div>
          ) : (
            <>
              <Upload className="w-5 h-5 text-[#1c355e] dark:text-sky-400 mb-1" />
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {effectiveValue ? 'Click or drop to replace photo' : 'Upload scholar portrait / photo'}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                JPG, PNG, WEBP   Auto-compressed
              </p>
            </>
          )}
        </div>
      </div>
      {errorMsg && (
        <div className="p-2 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-[11px] rounded-lg">
          {errorMsg}
        </div>
      )}
    </div>
  );
};
