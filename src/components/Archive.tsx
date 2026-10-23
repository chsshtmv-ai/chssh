import React, { useState, useMemo } from 'react';
import { useJournal } from '../context/JournalContext';
import { EditableText } from './EditableText';
import { ArticleDoiBadge } from './ArticleDoiBadge';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  BookOpen,
  Download,
  X,
  Eye,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  FileText,
  Filter,
  CheckCircle2,
  ExternalLink,
  Award,
  Clock
} from 'lucide-react';
import { GoogleDrivePreviewModal } from './GoogleDrivePreviewModal';
import { DocumentPreviewModal } from './DocumentPreviewModal';
import { Article, JournalIssue } from '../types';

export const Archive: React.FC = () => {
  const {
    articles,
    issues,
    volumes,
    setSelectedArticleForView,
    requireAuthorAuth,
    downloadPublishedPaper
  } = useJournal();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedVolume, setSelectedVolume] = useState<string>('all');
  const [selectedTrack, setSelectedTrack] = useState('all');

  const [previewArticle, setPreviewArticle] = useState<Article | null>(null);
  const [isArticlePreviewOpen, setIsArticlePreviewOpen] = useState(false);

  // Expanded issues accordion state (default: all expanded)
  const [expandedIssues, setExpandedIssues] = useState<Record<string, boolean>>({});

  const toggleIssueExpanded = (issueId: string) => {
    setExpandedIssues(prev => ({
      ...prev,
      [issueId]: prev[issueId] === undefined ? false : !prev[issueId]
    }));
  };

  const isIssueExpanded = (issueId: string) => {
    return expandedIssues[issueId] !== false; // default true
  };

  const tracks = [
    'all',
    'Sociology & Social Theory',
    'Cultural Studies & Critical Theory',
    'Applied Ethics & Epistemic Justice',
    'History, Memory & Archival Studies',
    'Political Philosophy & Global Governance',
    'Digital Humanities & Computational Social Science'
  ];

  const publishedArticles = useMemo(() => {
    return articles.filter((a) => a.status === 'published');
  }, [articles]);

  // All archived / published issues
  const publishedOrArchivedIssues = useMemo(() => {
    return issues.filter(i => i.status === 'published' || i.status === 'archived');
  }, [issues]);

  // Distinct Years
  const availableYears = useMemo(() => {
    const yearsSet = new Set<number>();
    publishedOrArchivedIssues.forEach(i => yearsSet.add(i.year));
    publishedArticles.forEach(a => {
      if (a.year) yearsSet.add(a.year);
    });
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [publishedOrArchivedIssues, publishedArticles]);

  // Distinct Volumes
  const availableVolumes = useMemo(() => {
    const volsSet = new Set<number>();
    volumes.forEach(v => volsSet.add(v.volumeNumber));
    publishedOrArchivedIssues.forEach(i => volsSet.add(i.volumeNumber));
    publishedArticles.forEach(a => {
      if (a.volume) volsSet.add(a.volume);
    });
    return Array.from(volsSet).sort((a, b) => b - a);
  }, [volumes, publishedOrArchivedIssues, publishedArticles]);

  // Hierarchical Data Structure: Year -> Volume -> Issues -> Articles
  const groupedHierarchy = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    // Group issues by year
    const yearsMap = new Map<number, Map<number, JournalIssue[]>>();

    publishedOrArchivedIssues.forEach(iss => {
      if (selectedYear !== 'all' && iss.year !== Number(selectedYear)) return;
      if (selectedVolume !== 'all' && iss.volumeNumber !== Number(selectedVolume)) return;

      if (!yearsMap.has(iss.year)) {
        yearsMap.set(iss.year, new Map());
      }
      const volMap = yearsMap.get(iss.year)!;
      if (!volMap.has(iss.volumeNumber)) {
        volMap.set(iss.volumeNumber, []);
      }
      volMap.get(iss.volumeNumber)!.push(iss);
    });

    // Also support fallback for published articles that don't belong to any existing issue record
    publishedArticles.forEach(art => {
      const artYear = art.year || 2026;
      const artVol = art.volume || 1;
      const artIss = art.issue || 1;

      if (selectedYear !== 'all' && artYear !== Number(selectedYear)) return;
      if (selectedVolume !== 'all' && artVol !== Number(selectedVolume)) return;

      if (!yearsMap.has(artYear)) {
        yearsMap.set(artYear, new Map());
      }
      const volMap = yearsMap.get(artYear)!;
      if (!volMap.has(artVol)) {
        volMap.set(artVol, []);
      }
      const existingIssues = volMap.get(artVol)!;
      let foundIssue = existingIssues.find(i => i.issueNumber === artIss);
      if (!foundIssue) {
        foundIssue = {
          id: `virtual-iss-${artVol}-${artIss}`,
          volumeId: `vol-${artVol}`,
          volumeNumber: artVol,
          issueNumber: artIss,
          year: artYear,
          title: `Volume ${artVol}, Issue ${artIss}`,
          publicationDate: art.publishedDate || `${artYear}-09-30`,
          articleIds: [art.id],
          status: 'published',
          isCurrent: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        existingIssues.push(foundIssue);
      } else if (!foundIssue.articleIds.includes(art.id)) {
        foundIssue.articleIds.push(art.id);
      }
    });

    // Sort issues inside each volume descending
    yearsMap.forEach(volMap => {
      volMap.forEach(issList => {
        issList.sort((a, b) => b.issueNumber - a.issueNumber);
      });
    });

    // Filter by search query & track
    const result: Array<{
      year: number;
      volumes: Array<{
        volumeNumber: number;
        volumeTitle?: string;
        issues: Array<{
          issue: JournalIssue;
          articles: Article[];
        }>;
      }>;
    }> = [];

    const sortedYears = Array.from(yearsMap.keys()).sort((a, b) => b - a);

    sortedYears.forEach(year => {
      const volMap = yearsMap.get(year)!;
      const sortedVolNumbers = Array.from(volMap.keys()).sort((a, b) => b - a);

      const volumesList: Array<{
        volumeNumber: number;
        volumeTitle?: string;
        issues: Array<{
          issue: JournalIssue;
          articles: Article[];
        }>;
      }> = [];

      sortedVolNumbers.forEach(volNum => {
        const issuesList = volMap.get(volNum)!;
        const matchingIssues: Array<{
          issue: JournalIssue;
          articles: Article[];
        }> = [];

        issuesList.forEach(iss => {
          // Resolve articles in this issue
          let matchedArticles = iss.articleIds
            .map(id => articles.find(a => a.id === id))
            .filter(Boolean) as Article[];

          if (matchedArticles.length === 0) {
            matchedArticles = publishedArticles.filter(
              a => a.volume === iss.volumeNumber && a.issue === iss.issueNumber
            );
          }

          // Apply track filter
          if (selectedTrack !== 'all') {
            matchedArticles = matchedArticles.filter(a => a.track === selectedTrack);
          }

          // Apply search term filter
          if (term) {
            const matchesIssueTitle = (iss.title || '').toLowerCase().includes(term);
            const matchesIssueToc = (iss.tableOfContentsSummary || '').toLowerCase().includes(term);

            const filteredArticlesBySearch = matchedArticles.filter(art => {
              return (
                art.title.toLowerCase().includes(term) ||
                art.abstract.toLowerCase().includes(term) ||
                (art.keywords && art.keywords.some(k => k.toLowerCase().includes(term))) ||
                art.authors.some(a => a.name.toLowerCase().includes(term) || a.affiliation.toLowerCase().includes(term)) ||
                art.trackingId.toLowerCase().includes(term) ||
                (art.doi && art.doi.toLowerCase().includes(term))
              );
            });

            if (matchesIssueTitle || matchesIssueToc) {
              matchingIssues.push({
                issue: iss,
                articles: matchedArticles
              });
            } else if (filteredArticlesBySearch.length > 0) {
              matchingIssues.push({
                issue: iss,
                articles: filteredArticlesBySearch
              });
            }
          } else {
            matchingIssues.push({
              issue: iss,
              articles: matchedArticles
            });
          }
        });

        if (matchingIssues.length > 0) {
          const volMeta = volumes.find(v => v.volumeNumber === volNum);
          volumesList.push({
            volumeNumber: volNum,
            volumeTitle: volMeta?.title,
            issues: matchingIssues
          });
        }
      });

      if (volumesList.length > 0) {
        result.push({
          year,
          volumes: volumesList
        });
      }
    });

    return result;
  }, [
    publishedOrArchivedIssues,
    publishedArticles,
    volumes,
    articles,
    searchTerm,
    selectedYear,
    selectedVolume,
    selectedTrack
  ]);

  const totalResultsCount = useMemo(() => {
    let count = 0;
    groupedHierarchy.forEach(y => {
      y.volumes.forEach(v => {
        v.issues.forEach(i => {
          count += i.articles.length;
        });
      });
    });
    return count;
  }, [groupedHierarchy]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Masthead Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-stone-900 rounded-2xl shadow-xs border border-stone-200/90 dark:border-stone-800 p-6 sm:p-8 space-y-5 transition-colors"
      >
        <div>
          <div className="text-xs font-semibold text-[#1c355e] dark:text-sky-400 uppercase tracking-widest flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            <span>
              <EditableText id="archive_badge" placeholder="Scholarly Repository" />
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            <EditableText id="archive_title" placeholder="Journal Archive &amp; Full-Text Search" />
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-serif max-w-3xl mt-1 leading-relaxed">
            <EditableText
              id="archive_description"
              multiline
              placeholder="Browse and query all peer-reviewed research papers published in Contemporary Horizons in Social Sciences and Humanities. All papers are archived permanently and organized systematically by publication year, volume, and issue."
            />
          </p>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {/* Search Box */}
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by keywords, title, abstract, or author name..."
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all font-serif"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Year Filter */}
          <div>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all cursor-pointer font-medium text-slate-700 dark:text-slate-200"
            >
              <option value="all">All Publication Years</option>
              {availableYears.map(yr => (
                <option key={yr} value={yr}>Year {yr}</option>
              ))}
            </select>
          </div>

          {/* Volume Filter */}
          <div>
            <select
              value={selectedVolume}
              onChange={(e) => setSelectedVolume(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all cursor-pointer font-medium text-slate-700 dark:text-slate-200"
            >
              <option value="all">All Volumes</option>
              {availableVolumes.map(vol => (
                <option key={vol} value={vol}>Volume {vol}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Track Filter Filter Tag Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Filter by Track:</span>
          {tracks.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setSelectedTrack(t)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                selectedTrack === t
                  ? 'bg-amber-800 text-white shadow-2xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-slate-600 dark:text-slate-300 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              {t === 'all' ? 'All Disciplines' : t}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Results Meta Bar */}
      <div className="flex items-center justify-between text-xs text-stone-600 dark:text-stone-400 font-medium px-1">
        <span className="font-bold uppercase tracking-wider">
          <EditableText id="archive_results_found" placeholder="Archived Publications Matching Query" /> ({totalResultsCount})
        </span>

        {(selectedYear !== 'all' || selectedVolume !== 'all' || selectedTrack !== 'all' || searchTerm) && (
          <button
            type="button"
            onClick={() => {
              setSelectedYear('all');
              setSelectedVolume('all');
              setSelectedTrack('all');
              setSearchTerm('');
            }}
            className="text-amber-800 dark:text-amber-400 hover:underline cursor-pointer flex items-center gap-1"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Hierarchical Archive Grouping: Year -> Volume -> Issue -> Articles */}
      {groupedHierarchy.length === 0 ? (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-12 text-center space-y-3">
          <BookOpen className="w-10 h-10 mx-auto text-stone-400" />
          <h3 className="font-serif text-lg font-bold text-stone-800 dark:text-stone-200">
            No Archived Issues Match Your Query
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto font-serif">
            Try broadening your search terms or clearing the selected filters.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedHierarchy.map(({ year, volumes: volList }) => (
            <div key={year} className="space-y-5">
              {/* Year Heading */}
              <div className="flex items-center gap-3">
                <span className="px-3.5 py-1 bg-[#102344] text-white rounded-xl font-serif font-bold text-sm shadow-xs">
                  {year}
                </span>
                <div className="h-px bg-stone-200 dark:bg-stone-800 flex-1" />
              </div>

              {/* Volumes under this year */}
              <div className="space-y-6 pl-0 sm:pl-3">
                {volList.map(({ volumeNumber, volumeTitle, issues: issList }) => (
                  <div key={volumeNumber} className="space-y-4">
                    {/* Volume Subheader */}
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                      <Layers className="w-3.5 h-3.5" />
                      <span>Volume {volumeNumber}</span>
                      {volumeTitle && <span className="text-slate-500 font-serif normal-case">• {volumeTitle}</span>}
                    </div>

                    {/* Issues under this volume */}
                    <div className="space-y-4">
                      {issList.map(({ issue, articles: issueArticles }) => {
                        const expanded = isIssueExpanded(issue.id);

                        return (
                          <div
                            key={issue.id}
                            className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 shadow-2xs overflow-hidden transition-colors"
                          >
                            {/* Issue Header Accordion */}
                            <div
                              onClick={() => toggleIssueExpanded(issue.id)}
                              className="p-4 sm:p-5 bg-stone-50/70 dark:bg-stone-800/40 border-b border-stone-200/80 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-stone-100/60 transition-colors"
                            >
                              <div className="flex items-start sm:items-center gap-3">
                                {issue.coverImage && (
                                  <img
                                    src={issue.coverImage}
                                    alt="Issue Cover"
                                    className="w-12 h-16 object-cover rounded shadow-2xs border border-stone-200 shrink-0"
                                  />
                                )}
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h4 className="font-serif font-bold text-base text-slate-900 dark:text-slate-100">
                                      Volume {issue.volumeNumber}, Issue {issue.issueNumber} ({issue.year})
                                    </h4>
                                    {issue.isCurrent && (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white uppercase tracking-wider">
                                        Current Issue
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-serif mt-0.5">
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                      <span>Published: {issue.publicationDate}</span>
                                    </span>
                                    <span>•</span>
                                    <span>{issueArticles.length} Research Paper(s)</span>
                                  </div>

                                  {issue.tableOfContentsSummary && (
                                    <p className="text-xs text-slate-600 dark:text-slate-300 font-serif italic mt-1 line-clamp-1">
                                      "{issue.tableOfContentsSummary}"
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 self-end sm:self-center">
                                <span className="text-xs font-semibold text-amber-800 dark:text-amber-400">
                                  {expanded ? 'Collapse Issue' : 'Browse Articles'}
                                </span>
                                {expanded ? (
                                  <ChevronUp className="w-4 h-4 text-amber-800 dark:text-amber-400" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-amber-800 dark:text-amber-400" />
                                )}
                              </div>
                            </div>

                            {/* Issue Articles List */}
                            <AnimatePresence>
                              {expanded && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="divide-y divide-stone-200/80 dark:divide-stone-800 p-4 sm:p-6 space-y-4"
                                >
                                  {issueArticles.length === 0 ? (
                                    <p className="text-xs text-slate-500 font-serif italic py-3 text-center">
                                      No published articles associated with this issue.
                                    </p>
                                  ) : (
                                    issueArticles.map((article, idx) => (
                                      <motion.article
                                        key={article.id}
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.2, delay: idx * 0.03 }}
                                        className="pt-4 first:pt-0 space-y-2.5"
                                      >
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                          <span className="px-2.5 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-medium border border-stone-200 dark:border-stone-700">
                                            {article.track}
                                          </span>
                                          <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 font-mono flex-wrap">
                                            <span>Pages: {article.pages || 'N/A'}</span>
                                            {article.doi && (
                                              <>
                                                <span>•</span>
                                                <ArticleDoiBadge doi={article.doi} size="sm" variant="badge" />
                                              </>
                                            )}
                                          </div>
                                        </div>

                                        <h5
                                          onClick={() => setSelectedArticleForView(article)}
                                          className="font-serif text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 hover:text-amber-800 dark:hover:text-amber-400 transition-colors cursor-pointer leading-snug"
                                        >
                                          {article.title}
                                        </h5>

                                        <div className="text-xs text-slate-600 dark:text-slate-400">
                                          <strong className="text-slate-800 dark:text-slate-200">Authors:</strong>{' '}
                                          {article.authors.map((a, i) => (
                                            <span key={a.id || i} className="mr-2">
                                              {a.name} <span className="text-slate-400 dark:text-slate-500">({a.affiliation})</span>
                                              {i < article.authors.length - 1 ? ';' : ''}
                                            </span>
                                          ))}
                                        </div>

                                        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-serif leading-relaxed line-clamp-3 text-justify">
                                          {article.abstract}
                                        </p>

                                        {article.keywords && article.keywords.length > 0 && (
                                          <div className="flex flex-wrap gap-1.5 pt-1">
                                            {article.keywords.map((kw, i) => (
                                              <span
                                                key={i}
                                                className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded font-sans"
                                              >
                                                {kw}
                                              </span>
                                            ))}
                                          </div>
                                        )}

                                        {/* Published Paper Google Drive Link if provided by Admin */}
                                        {article.driveUrl && (
                                          <div className="flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-lg bg-sky-50/90 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-850 text-xs">
                                            <span className="font-semibold text-slate-800 dark:text-slate-200 shrink-0">
                                              Drive Link:
                                            </span>
                                            <a
                                              href={article.driveUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-sky-700 dark:text-sky-300 hover:text-sky-900 dark:hover:text-sky-100 hover:underline font-mono text-[11px] flex items-center gap-1.5 break-all"
                                              title={`Open uploaded paper in Google Drive: ${article.driveUrl}`}
                                            >
                                              <span className="truncate max-w-xs sm:max-w-md">{article.driveUrl}</span>
                                              <ExternalLink className="w-3 h-3 shrink-0" />
                                            </a>
                                          </div>
                                        )}

                                        <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setPreviewArticle(article);
                                              setIsArticlePreviewOpen(true);
                                            }}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-stone-800 dark:hover:bg-stone-750 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold cursor-pointer border border-stone-200/80 dark:border-stone-700"
                                            title="Preview Article PDF"
                                          >
                                            <Eye className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                                            <span>Preview</span>
                                          </button>

                                          <button
                                            type="button"
                                            onClick={() => setSelectedArticleForView(article)}
                                            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold cursor-pointer border border-stone-200/80 dark:border-stone-700"
                                          >
                                            <EditableText id="article_btn_read_cite" placeholder="Read Abstract &amp; Cite" />
                                          </button>

                                          {/* Publication Certificate Button */}
                                          {article.certificateUrl ? (
                                            <a
                                              href={article.certificateUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 rounded-lg text-xs font-semibold shadow-2xs transition cursor-pointer"
                                              title="Download / Open Publication Certificate (Google Drive)"
                                            >
                                              <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                              <span>Certificate</span>
                                              <ExternalLink className="w-2.5 h-2.5 opacity-80" />
                                            </a>
                                          ) : (
                                            <button
                                              type="button"
                                              onClick={() => setSelectedArticleForView(article)}
                                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100/80 dark:bg-stone-800/80 text-stone-400 dark:text-stone-500 rounded-lg text-xs font-medium border border-stone-200/50 dark:border-stone-750 cursor-pointer"
                                              title="Your publication certificate will be available after it is uploaded by the admin."
                                            >
                                              <Award className="w-3.5 h-3.5 opacity-60" />
                                              <span>Certificate Pending</span>
                                            </button>
                                          )}

                                          {/* Download Published Paper PDF */}
                                          {article.driveUrl ? (
                                            <a
                                              href={article.driveUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-2xs transition cursor-pointer"
                                              title={`Download official finalized published paper from Google Drive (${article.driveUrl})`}
                                            >
                                              <Download className="w-3.5 h-3.5 text-emerald-200" />
                                              <span>Download Paper</span>
                                              <ExternalLink className="w-2.5 h-2.5 opacity-80" />
                                            </a>
                                          ) : (article.publishedDownloadURL ||
                                            article.publishedFileDataUrl ||
                                            article.publishedFileName ||
                                            article.publishedFileUrl ||
                                            article.driveFileId ||
                                            article.publishedStoragePath ||
                                            (typeof window !== 'undefined' && localStorage.getItem(`chssh_pub_file_${article.id}`))) ? (
                                            <button
                                              type="button"
                                              onClick={() => downloadPublishedPaper(article)}
                                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-2xs transition cursor-pointer"
                                              title="Download official finalized published paper (PDF)"
                                            >
                                              <Download className="w-3.5 h-3.5 text-emerald-200" />
                                              <span>Download Paper</span>
                                            </button>
                                          ) : (
                                            <button
                                              type="button"
                                              onClick={() => setSelectedArticleForView(article)}
                                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 dark:bg-stone-800 text-slate-500 dark:text-slate-400 rounded-lg text-xs font-medium border border-stone-200 dark:border-stone-700 cursor-pointer"
                                              title="Your published paper will be available here after official publication by the editorial team."
                                            >
                                              <Clock className="w-3.5 h-3.5" />
                                              <span>PDF Pending</span>
                                            </button>
                                          )}
                                        </div>
                                      </motion.article>
                                    ))
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

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
          volumeInfo={`Vol. ${previewArticle.volume || 1}, Issue ${previewArticle.issue || 1} (${previewArticle.year || 2026})`}
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
            description: `Vol. ${previewArticle.volume || 1}, Issue ${previewArticle.issue || 1} (${previewArticle.year || 2026}) • Track: ${previewArticle.track}`,
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
