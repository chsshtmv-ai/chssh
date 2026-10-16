import React, { useState } from 'react';
import { ExternalLink, Copy, Check, Link as LinkIcon, ShieldCheck } from 'lucide-react';
import { validateAcademicDoi, getCanonicalDoiUrl } from '../utils/doiUtils';

interface ArticleDoiBadgeProps {
  doi?: string;
  className?: string;
  size?: 'sm' | 'md';
  variant?: 'badge' | 'link' | 'compact';
  showCopy?: boolean;
}

export const ArticleDoiBadge: React.FC<ArticleDoiBadgeProps> = ({
  doi,
  className = '',
  size = 'sm',
  variant = 'badge',
  showCopy = true
}) => {
  const [copied, setCopied] = useState(false);

  if (!doi) {
    return null;
  }

  const validation = validateAcademicDoi(doi);
  const normalized = validation.normalizedDoi || doi.trim();
  const canonicalUrl = validation.canonicalUrl || getCanonicalDoiUrl(normalized);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(canonicalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-1.5 font-mono ${className}`}>
        <a
          href={canonicalUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleLinkClick}
          className="inline-flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400 hover:text-[#1c355e] dark:hover:text-sky-300 underline underline-offset-2 transition-colors cursor-pointer"
          title={`Academic DOI Identifier: ${normalized}\nClick to resolve via international DOI Foundation (${canonicalUrl})`}
          aria-label={`Academic DOI: ${normalized}. Opens resolver in a new tab.`}
        >
          <span className="font-semibold text-slate-500 dark:text-slate-400">doi:</span>
          <span className="truncate max-w-[200px] sm:max-w-none">{normalized}</span>
          <ExternalLink className="w-2.5 h-2.5 opacity-70 shrink-0" />
        </a>
        {showCopy && (
          <button
            type="button"
            onClick={handleCopy}
            className="p-0.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
            title="Copy permanent DOI resolver URL to clipboard"
            aria-label="Copy DOI resolver URL"
          >
            {copied ? (
              <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
        )}
      </div>
    );
  }

  if (variant === 'link') {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        <a
          href={canonicalUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleLinkClick}
          className="inline-flex items-center gap-1 font-mono text-xs text-sky-700 dark:text-sky-300 hover:text-sky-900 dark:hover:text-sky-100 hover:underline transition-colors"
          title={`Resolve scholarly DOI: ${canonicalUrl}`}
        >
          <LinkIcon className="w-3 h-3" />
          <span>https://doi.org/{normalized}</span>
          <ExternalLink className="w-3 h-3 ml-0.5" />
        </a>
        {showCopy && (
          <button
            type="button"
            onClick={handleCopy}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs transition cursor-pointer"
            title="Copy DOI URL"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center rounded-md border border-slate-200/90 dark:border-slate-750 bg-slate-50/90 dark:bg-slate-850/80 shadow-2xs font-mono text-xs overflow-hidden transition-all hover:border-[#1c355e]/40 dark:hover:border-sky-500/40 group/doi ${
        size === 'sm' ? 'text-[11px]' : 'text-xs'
      } ${className}`}
    >
      <a
        href={canonicalUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleLinkClick}
        className="inline-flex items-center gap-1.5 px-2 py-0.5 text-inherit hover:opacity-90 transition-opacity cursor-pointer"
        title={`Academic DOI Identifier (Crossref / DataCite)\nClick to resolve via international DOI Foundation: ${canonicalUrl}`}
        aria-label={`Academic DOI: ${normalized}. Opens resolver in new tab.`}
      >
        <span className="font-bold text-[#1c355e] dark:text-sky-400 text-[10px] tracking-wider uppercase px-1 py-0.2 rounded bg-sky-100 dark:bg-sky-950/80 border border-sky-200 dark:border-sky-800/80 shrink-0">
          DOI
        </span>
        <span className="truncate max-w-[160px] sm:max-w-[240px] md:max-w-none underline underline-offset-2 decoration-slate-300 dark:decoration-slate-600 group-hover/doi:decoration-current">
          {normalized}
        </span>
        <ExternalLink className="w-2.5 h-2.5 opacity-70 shrink-0" />
      </a>
      {showCopy && (
        <button
          type="button"
          onClick={handleCopy}
          className="border-l border-slate-200/80 dark:border-slate-750/80 px-1.5 py-0.5 text-inherit opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer shrink-0"
          title="Copy permanent DOI link to clipboard"
          aria-label="Copy DOI link"
        >
          {copied ? (
            <span className="flex items-center text-emerald-600 dark:text-emerald-400">
              <Check className="w-3 h-3" />
            </span>
          ) : (
            <Copy className="w-3 h-3" />
          )}
        </button>
      )}
    </div>
  );
};
