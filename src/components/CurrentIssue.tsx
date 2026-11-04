import React, { useState, useEffect, useMemo } from 'react';
import { useJournal } from '../context/JournalContext';
import { JournalCrest } from './JournalCrest';
import { ArticleDoiBadge } from './ArticleDoiBadge';
import { triggerFileDownload } from '../utils/downloadGenerators';
import { getAssetFile } from '../utils/fileStorage';
import { DocumentPreviewModal } from './DocumentPreviewModal';
import { GoogleDrivePreviewModal } from './GoogleDrivePreviewModal';
import { JournalUploadedAsset, Article, CurrentIssuePageConfig } from '../types';
import { defaultCurrentIssueConfig } from '../data/defaultCurrentIssueConfig';
import { motion, AnimatePresence } from 'motion/react';
import {
  Download,
  Search,
  Award,
  Upload,
  Eye,
  FileCheck,
  BookOpen,
  Loader2,
  ExternalLink,
  Clock,
  FileText,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';

interface CurrentIssueProps {
  previewConfig?: CurrentIssuePageConfig;
}

export const CurrentIssue: React.FC<CurrentIssueProps> = ({ previewConfig }) => {
  const {
    articles,
    issues,
    volumes,
    setSelectedArticleForView,
    uploadedAssets,
    setActiveTab,
    downloadPublishedPaper,
    fetchActivePdf,
    activePdf,
    isAdmin,
    currentIssueConfig
  } = useJournal();

  const [filterQuery, setFilterQuery] = useState('');
  const [expandedAbstracts, setExpandedAbstracts] = useState<Record<string, boolean>>({});

  // Cover preview modal state
  const [previewCoverAsset, setPreviewCoverAsset] = useState<JournalUploadedAsset | null>(null);
  const [isCoverPreviewOpen, setIsCoverPreviewOpen] = useState(false);
  const [isDownloadingCover, setIsDownloadingCover] = useState(false);

  // Article preview modal state
  const [previewArticle, setPreviewArticle] = useState<Article | null>(null);
  const [isArticlePreviewOpen, setIsArticlePreviewOpen] = useState(false);
  const [isLoadingCover, setIsLoadingCover] = useState(false);

  // Effective layout & content configuration
  const config: CurrentIssuePageConfig = useMemo(() => {
    const base = previewConfig || currentIssueConfig || defaultCurrentIssueConfig;
    return {
      ...defaultCurrentIssueConfig,
      ...base,
      header: { ...defaultCurrentIssueConfig.header, ...(base.header || {}) },
      downloads: { ...defaultCurrentIssueConfig.downloads, ...(base.downloads || {}) },
      tableDesign: {
        ...defaultCurrentIssueConfig.tableDesign,
        ...(base.tableDesign || {}),
        columns: base.tableDesign?.columns || defaultCurrentIssueConfig.tableDesign.columns
      },
      footer: { ...defaultCurrentIssueConfig.footer, ...(base.footer || {}) },
      pageAppearance: { ...defaultCurrentIssueConfig.pageAppearance, ...(base.pageAppearance || {}) }
    };
  }, [previewConfig, currentIssueConfig]);

  // Dynamically resolve Current Issue from published issues in Firestore
  const currentIssueRecord = useMemo(() => {
    return (
      issues.find(i => i.isCurrent && (i.status === 'published' || !i.status)) ||
      issues.find(i => i.isCurrent) ||
      issues.find(i => i.status === 'published')
    );
  }, [issues]);

  const activeVolume = currentIssueRecord ? currentIssueRecord.volumeNumber : 1;
  const activeIssue = currentIssueRecord ? currentIssueRecord.issueNumber : 1;
  const activeMonth = currentIssueRecord?.publicationMonth || 'September';
  const activeYear = currentIssueRecord ? currentIssueRecord.year : 2026;

  // STRICT FILTERING: Only published articles explicitly assigned to this current issue
  const currentArticles = useMemo(() => {
    if (!currentIssueRecord) return [];
    const publishedPool = articles.filter(a => a.status === 'published');
    const assignedIds = currentIssueRecord.articleIds || [];

    // Order strictly by administrator's saved sequence in articleIds
    const ordered: Article[] = [];
    const seen = new Set<string>();

    assignedIds.forEach(id => {
      const found = publishedPool.find(a => a.id === id);
      if (found && !seen.has(found.id)) {
        seen.add(found.id);
        ordered.push(found);
      }
    });

    // Also include published articles that have matching volume and issue numbers
    publishedPool.forEach(art => {
      if (!seen.has(art.id)) {
        const artVol = typeof art.volume === 'number' ? art.volume : Number(art.volume) || 1;
        const artIss = typeof art.issue === 'number' ? art.issue : Number(art.issue) || 1;
        if (artVol === activeVolume && artIss === activeIssue) {
          seen.add(art.id);
          ordered.push(art);
        }
      }
    });

    return ordered;
  }, [articles, currentIssueRecord, activeVolume, activeIssue]);

  const filteredArticles = useMemo(() => {
    if (!filterQuery.trim()) return currentArticles;
    const q = filterQuery.toLowerCase();
    return currentArticles.filter(
      a =>
        a.title.toLowerCase().includes(q) ||
        (a.abstract && a.abstract.toLowerCase().includes(q)) ||
        a.authors.some(auth => auth.name.toLowerCase().includes(q)) ||
        (a.doi && a.doi.toLowerCase().includes(q)) ||
        (a.track && a.track.toLowerCase().includes(q))
    );
  }, [currentArticles, filterQuery]);

  const toggleAbstract = (id: string) => {
    setExpandedAbstracts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Generic document link handler
  const handleOpenDoc = (url?: string, label?: string) => {
    if (!url) {
      alert(`The document for "${label || 'Download'}" has not been uploaded yet.`);
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // If issue is unpublished and not in preview mode, render configurable empty-state message
  const isPageVisible = previewConfig || config.status === 'published';

  if (!isPageVisible || !currentIssueRecord) {
    return (
      <div className={`${config.pageAppearance.containerWidth || 'max-w-6xl'} mx-auto py-12 px-4`}>
        <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xs border border-stone-200 dark:border-stone-800 p-12 text-center space-y-4">
          <BookOpen className="w-12 h-12 mx-auto text-[#0d9488]" />
          <h2 className="font-serif text-2xl font-bold text-slate-800 dark:text-slate-200">
            {config.headingTitle || 'Current Issue'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto font-serif leading-relaxed">
            {config.pageAppearance.emptyStateMessage || 'No current issue has been published yet. Peer-reviewed manuscripts approved by the editorial office will appear here.'}
          </p>
          {isAdmin && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('admin');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0d9488] text-white text-xs font-semibold shadow-xs hover:bg-teal-700 transition"
              >
                <span>Open Current Issue CMS</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Column visibility map
  const colMap = (id: string) => config.tableDesign.columns.find(c => c.id === id);

  return (
    <div
      className={`${config.pageAppearance.containerWidth || 'max-w-6xl'} mx-auto py-6 px-3 sm:px-6 ${
        config.pageAppearance.spacing === 'compact'
          ? 'space-y-4'
          : config.pageAppearance.spacing === 'relaxed'
          ? 'space-y-8'
          : 'space-y-6'
      }`}
      style={{
        backgroundColor: config.pageAppearance.bgColor || '#ffffff'
      }}
    >
      {/* 1. JOURNAL HEADER MASTHEAD (Following Supplied Reference Design) */}
      <motion.header
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`rounded-2xl border border-stone-200 dark:border-stone-800 transition-colors shadow-2xs ${
          config.header.headerSpacing === 'compact'
            ? 'p-4 sm:p-5'
            : config.header.headerSpacing === 'spacious'
            ? 'p-8 sm:p-10'
            : 'p-6 sm:p-8'
        }`}
        style={{
          backgroundColor: config.header.headerBgColor || '#ffffff',
          color: config.header.headerTextColor || '#0f172a'
        }}
      >
        <div
          className={`flex flex-col ${
            config.header.logoAlignment === 'center'
              ? 'items-center text-center'
              : 'sm:flex-row sm:items-center text-left'
          } gap-5 sm:gap-7`}
        >
          {/* Official Circular Teal CHSSH Logo */}
          <div className="shrink-0 flex items-center justify-center">
            {config.header.logoUrl && config.header.logoUrl !== '/assets/chssh_logo.jpg' ? (
              <img
                src={config.header.logoUrl}
                alt={config.header.abbreviation || 'CHSSH Logo'}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-2 ring-[#0d9488]/40 shadow-sm"
              />
            ) : (
              <JournalCrest size={config.header.logoSize || 'lg'} showShadow />
            )}
          </div>

          {/* Header Typography */}
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
              <span className="text-xs font-bold tracking-widest uppercase text-[#0d9488] font-mono">
                {config.header.abbreviation || 'CHSSH'}
              </span>
              <span className="text-stone-300 dark:text-stone-700">|</span>
              <span className="text-xs font-serif italic text-stone-500 dark:text-stone-400">
                {config.header.tagline || 'A Multidisciplinary Peer Review Journal'}
              </span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
              {config.header.fullName || 'Contemporary Horizons in Social Sciences and Humanities'}
            </h1>

            <div className="flex flex-wrap items-center gap-3 pt-1 justify-center sm:justify-start text-xs font-mono text-slate-600 dark:text-slate-400">
              <span className="bg-stone-100 dark:bg-stone-800 px-2.5 py-1 rounded-md border border-stone-200 dark:border-stone-700">
                ISSN: <strong className="text-slate-900 dark:text-slate-100">{config.header.issnOnline || '3048-9741'}</strong> (Online)
              </span>
              <span className="bg-stone-100 dark:bg-stone-800 px-2.5 py-1 rounded-md border border-stone-200 dark:border-stone-700">
                ISSN: <strong className="text-slate-900 dark:text-slate-100">{config.header.issnPrint || '3048-9733'}</strong> (Print)
              </span>
            </div>
          </div>
        </div>
      </motion.header>

      {/* 2. BELOW HEADER: HEADING & THREE PRIMARY DOWNLOAD BUTTONS */}
      <section className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0d9488] animate-pulse" />
              <h2 className="text-lg sm:text-xl font-serif font-bold text-slate-900 dark:text-slate-100 tracking-wide uppercase">
                {config.headingTitle || 'Current Issue'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-serif mt-0.5">
              Volume {activeVolume}, Issue {activeIssue} — {activeMonth} {activeYear}
            </p>
          </div>

          {/* Three Primary Download Buttons */}
          <div
            className={`flex flex-wrap items-center gap-2.5 ${
              config.downloads.buttonAlignment === 'left'
                ? 'justify-start'
                : config.downloads.buttonAlignment === 'right'
                ? 'justify-end'
                : 'justify-center md:justify-end'
            }`}
          >
            {/* Download Front Page */}
            {config.downloads.frontPageVisible && (
              <button
                type="button"
                onClick={() =>
                  handleOpenDoc(
                    config.downloads.frontPagePdfUrl || currentIssueRecord?.frontPagePdfUrl,
                    config.downloads.frontPageLabel
                  )
                }
                style={{
                  backgroundColor: config.downloads.frontPageBgColor || '#0d9488',
                  color: config.downloads.frontPageTextColor || '#ffffff'
                }}
                className={`inline-flex items-center gap-2 rounded-xl font-semibold shadow-xs hover:opacity-90 transition-opacity cursor-pointer ${
                  config.downloads.buttonSize === 'sm'
                    ? 'px-3 py-1.5 text-xs'
                    : config.downloads.buttonSize === 'lg'
                    ? 'px-5 py-2.5 text-sm'
                    : 'px-4 py-2 text-xs'
                }`}
                title="Download / Open Front Page PDF"
              >
                <FileText className="w-4 h-4 shrink-0" />
                <span>{config.downloads.frontPageLabel || 'Download Front Page'}</span>
                <ExternalLink className="w-3 h-3 opacity-70 ml-0.5" />
              </button>
            )}

            {/* Download Table of Contents */}
            {config.downloads.tocVisible && (
              <button
                type="button"
                onClick={() =>
                  handleOpenDoc(
                    config.downloads.tocPdfUrl || currentIssueRecord?.tocPdfUrl,
                    config.downloads.tocLabel
                  )
                }
                style={{
                  backgroundColor: config.downloads.tocBgColor || '#1e3a8a',
                  color: config.downloads.tocTextColor || '#ffffff'
                }}
                className={`inline-flex items-center gap-2 rounded-xl font-semibold shadow-xs hover:opacity-90 transition-opacity cursor-pointer ${
                  config.downloads.buttonSize === 'sm'
                    ? 'px-3 py-1.5 text-xs'
                    : config.downloads.buttonSize === 'lg'
                    ? 'px-5 py-2.5 text-sm'
                    : 'px-4 py-2 text-xs'
                }`}
                title="Download / Open Table of Contents PDF"
              >
                <FileText className="w-4 h-4 shrink-0" />
                <span>{config.downloads.tocLabel || 'Download Table of Contents'}</span>
                <ExternalLink className="w-3 h-3 opacity-70 ml-0.5" />
              </button>
            )}

            {/* Download Certificates */}
            {config.downloads.certificatesVisible && (
              <button
                type="button"
                onClick={() =>
                  handleOpenDoc(
                    config.downloads.certificatesPdfUrl || currentIssueRecord?.certificatesPdfUrl,
                    config.downloads.certificatesLabel
                  )
                }
                style={{
                  backgroundColor: config.downloads.certificatesBgColor || '#d97706',
                  color: config.downloads.certificatesTextColor || '#ffffff'
                }}
                className={`inline-flex items-center gap-2 rounded-xl font-semibold shadow-xs hover:opacity-90 transition-opacity cursor-pointer ${
                  config.downloads.buttonSize === 'sm'
                    ? 'px-3 py-1.5 text-xs'
                    : config.downloads.buttonSize === 'lg'
                    ? 'px-5 py-2.5 text-sm'
                    : 'px-4 py-2 text-xs'
                }`}
                title="Download / Open Publication Certificates"
              >
                <Award className="w-4 h-4 shrink-0" />
                <span>{config.downloads.certificatesLabel || 'Download Certificates'}</span>
                <ExternalLink className="w-3 h-3 opacity-70 ml-0.5" />
              </button>
            )}
          </div>
        </div>

        {/* 3. ISSUE INFORMATION STRIP */}
        <div className="bg-stone-50 dark:bg-stone-800/60 rounded-xl p-3 sm:p-4 border border-stone-200/80 dark:border-stone-700/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 font-serif">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Volume: <strong className="font-mono text-[#0d9488]">{activeVolume}</strong>
            </span>
            <span className="text-stone-300 dark:text-stone-700">•</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Issue: <strong className="font-mono text-[#0d9488]">{activeIssue}</strong>
            </span>
            <span className="text-stone-300 dark:text-stone-700">•</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Month: <strong className="text-slate-900 dark:text-slate-100">{activeMonth}</strong>
            </span>
            <span className="text-stone-300 dark:text-stone-700">•</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Year: <strong className="font-mono text-slate-900 dark:text-slate-100">{activeYear}</strong>
            </span>
          </div>

          <div className="text-xs text-slate-500 font-serif">
            Showing <strong className="text-slate-800 dark:text-slate-200 font-mono">{filteredArticles.length}</strong> published paper(s)
          </div>
        </div>
      </section>

      {/* SEARCH FILTER */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filterQuery}
            onChange={e => setFilterQuery(e.target.value)}
            placeholder="Search within this issue..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
          />
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={() => {
              setActiveTab('admin');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-slate-700 dark:text-slate-300 hover:bg-stone-200 text-xs font-medium cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-amber-500" />
            <span>Manage in CMS</span>
          </button>
        )}
      </div>

      {/* 4. ACADEMIC ARTICLE TABLE (Reference Design) */}
      <section className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 overflow-hidden shadow-2xs">
        {currentArticles.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <BookOpen className="w-10 h-10 text-stone-300 dark:text-stone-600 mx-auto" />
            <h4 className="font-serif text-base font-bold text-slate-800 dark:text-slate-200">
              No articles are currently published in this issue.
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto font-serif">
              {config.pageAppearance.emptyStateMessage}
            </p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <Search className="w-8 h-8 text-stone-300 mx-auto" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              No papers match your search criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table
              className="w-full border-collapse text-left"
              style={{
                fontFamily: config.tableDesign.fontFamily === 'sans' ? 'sans-serif' : 'ui-serif, Georgia, Cambria, serif',
                fontSize:
                  config.tableDesign.fontSize === 'xs'
                    ? '0.75rem'
                    : config.tableDesign.fontSize === 'md'
                    ? '0.925rem'
                    : '0.85rem'
              }}
            >
              {/* Table Header */}
              <thead>
                <tr
                  style={{
                    backgroundColor: config.tableDesign.headerBgColor || '#0d9488',
                    color: config.tableDesign.headerTextColor || '#ffffff'
                  }}
                >
                  {colMap('serial')?.visible !== false && (
                    <th
                      className="py-3 px-3.5 font-bold uppercase tracking-wider text-center"
                      style={{ width: colMap('serial')?.width || '8%' }}
                    >
                      {colMap('serial')?.label || 'S.No'}
                    </th>
                  )}
                  {colMap('authors')?.visible !== false && (
                    <th
                      className="py-3 px-4 font-bold uppercase tracking-wider"
                      style={{ width: colMap('authors')?.width || '26%' }}
                    >
                      {colMap('authors')?.label || 'Author(s) Name'}
                    </th>
                  )}
                  {colMap('title')?.visible !== false && (
                    <th
                      className="py-3 px-4 font-bold uppercase tracking-wider"
                      style={{ width: colMap('title')?.width || '42%' }}
                    >
                      {colMap('title')?.label || 'Paper Title'}
                    </th>
                  )}
                  {colMap('pages')?.visible !== false && (
                    <th
                      className="py-3 px-3.5 font-bold uppercase tracking-wider text-center"
                      style={{ width: colMap('pages')?.width || '12%' }}
                    >
                      {colMap('pages')?.label || 'Page Numbers'}
                    </th>
                  )}
                  {colMap('download')?.visible !== false && (
                    <th
                      className="py-3 px-3.5 font-bold uppercase tracking-wider text-center"
                      style={{ width: colMap('download')?.width || '12%' }}
                    >
                      {colMap('download')?.label || 'Download PDF'}
                    </th>
                  )}
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-stone-200/80 dark:divide-stone-800">
                {filteredArticles.map((article, idx) => {
                  const isEven = idx % 2 === 0;
                  const rowBg = isEven
                    ? config.tableDesign.rowBgColor || '#ffffff'
                    : config.tableDesign.rowAltBgColor || '#f8fafc';
                  const isAbstractExpanded = Boolean(expandedAbstracts[article.id]);

                  const pageDisplay =
                    article.pages ||
                    (article.pageStart && article.pageEnd
                      ? `${article.pageStart}–${article.pageEnd}`
                      : article.pageStart || '—');

                  return (
                    <tr
                      key={article.id}
                      style={{ backgroundColor: rowBg }}
                      className="transition-colors hover:bg-teal-50/40 dark:hover:bg-teal-950/20"
                    >
                      {/* S.No */}
                      {colMap('serial')?.visible !== false && (
                        <td className="py-3.5 px-3.5 font-mono font-bold text-center text-slate-800 dark:text-slate-200 align-top">
                          {article.serialNumber || idx + 1}
                        </td>
                      )}

                      {/* Author(s) Name */}
                      {colMap('authors')?.visible !== false && (
                        <td className="py-3.5 px-4 font-serif text-slate-800 dark:text-slate-200 align-top space-y-1">
                          <div className="font-semibold leading-snug">
                            {article.authors.map(a => a.name).join(', ')}
                          </div>
                          {article.authors[0]?.affiliation && (
                            <div className="text-[11px] text-slate-500 font-sans italic line-clamp-2">
                              {article.authors[0].affiliation}
                            </div>
                          )}
                        </td>
                      )}

                      {/* Paper Title, Track, DOI, and Abstract Toggle */}
                      {colMap('title')?.visible !== false && (
                        <td className="py-3.5 px-4 font-serif align-top space-y-1.5">
                          <h3
                            onClick={() => setSelectedArticleForView(article)}
                            className="font-bold text-slate-900 dark:text-slate-100 hover:text-[#0d9488] dark:hover:text-teal-400 cursor-pointer transition-colors leading-snug"
                          >
                            {article.title}
                          </h3>

                          <div className="flex flex-wrap items-center gap-2 pt-0.5">
                            {article.track && (
                              <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/50 text-[#0d9488] dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/60 font-semibold">
                                {article.track}
                              </span>
                            )}
                            {article.doi && <ArticleDoiBadge doi={article.doi} size="sm" />}
                          </div>

                          {/* Expandable Abstract Preview */}
                          {article.abstract && (
                            <div className="pt-1">
                              <button
                                type="button"
                                onClick={() => toggleAbstract(article.id)}
                                className="text-[11px] text-slate-500 hover:text-[#0d9488] font-sans flex items-center gap-1 cursor-pointer"
                              >
                                <span>{isAbstractExpanded ? 'Hide Abstract' : 'View Abstract'}</span>
                                {isAbstractExpanded ? (
                                  <ChevronUp className="w-3 h-3" />
                                ) : (
                                  <ChevronDown className="w-3 h-3" />
                                )}
                              </button>
                              <AnimatePresence>
                                {isAbstractExpanded && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-2 p-3 rounded-lg bg-stone-100 dark:bg-stone-800 text-[11px] text-slate-700 dark:text-slate-300 font-serif leading-relaxed border border-stone-200 dark:border-stone-700"
                                  >
                                    <p>{article.abstract}</p>
                                    {article.keywords && article.keywords.length > 0 && (
                                      <p className="mt-2 text-[10px] text-slate-500 font-sans">
                                        <strong className="text-slate-700 dark:text-slate-300">Keywords:</strong>{' '}
                                        {article.keywords.join(', ')}
                                      </p>
                                    )}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}
                        </td>
                      )}

                      {/* Page Numbers */}
                      {colMap('pages')?.visible !== false && (
                        <td className="py-3.5 px-3.5 font-mono text-center text-slate-700 dark:text-slate-300 align-top whitespace-nowrap">
                          {pageDisplay}
                        </td>
                      )}

                      {/* Download PDF Button */}
                      {colMap('download')?.visible !== false && (
                        <td className="py-3.5 px-3.5 text-center align-top whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => downloadPublishedPaper(article)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0d9488] hover:bg-teal-700 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                            title={
                              article.driveUrl
                                ? `Open / Download authentic published PDF (${article.driveUrl})`
                                : 'Download verified published paper (PDF)'
                            }
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>PDF</span>
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 5. FOOTER & DECORATIVE DIVIDERS */}
      {config.footer.visible && (
        <footer className="pt-4 pb-6 space-y-3">
          {config.footer.showDecorativeLines && (
            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-stone-200 dark:border-stone-800" />
              <div className="absolute px-3 bg-white dark:bg-stone-900 flex items-center gap-1 text-[#d97706]">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              </div>
            </div>
          )}

          <div
            className={`text-slate-500 font-serif ${
              config.footer.fontSize === 'sm' ? 'text-sm' : 'text-xs'
            } ${
              config.footer.alignment === 'left'
                ? 'text-left'
                : config.footer.alignment === 'right'
                ? 'text-right'
                : 'text-center'
            }`}
            style={{ color: config.footer.textColor || '#64748b' }}
          >
            <p className="leading-relaxed">{config.footer.message}</p>
            <p className="text-[10px] text-slate-400 mt-1 font-sans">
              CC BY 4.0 Open Access License • Preserved in Global Permanent Digital Repositories
            </p>
          </div>
        </footer>
      )}

      {/* MODALS */}
      {previewCoverAsset && (
        <DocumentPreviewModal
          isOpen={isCoverPreviewOpen}
          onClose={() => setIsCoverPreviewOpen(false)}
          asset={previewCoverAsset}
        />
      )}

      {previewArticle && (
        <GoogleDrivePreviewModal
          isOpen={isArticlePreviewOpen}
          onClose={() => setIsArticlePreviewOpen(false)}
          title={previewArticle.title}
          authors={previewArticle.authors.map(a => a.name).join(', ')}
          volumeInfo={`Vol. ${previewArticle.volume || activeVolume}, No. ${previewArticle.issue || activeIssue} (${previewArticle.year || activeYear})`}
          driveUrl={previewArticle.driveUrl}
          doi={previewArticle.doi}
        />
      )}
    </div>
  );
};
