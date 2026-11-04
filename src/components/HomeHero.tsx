import React, { useState } from 'react';
import { useJournal } from '../context/JournalContext';
import { EditableText } from './EditableText';
import { JournalCrest } from './JournalCrest';
import { ArticleDoiBadge } from './ArticleDoiBadge';
import { motion } from 'motion/react';
import {
  Send,
  BookOpen,
  Calendar,
  Award,
  Download,
  ArrowRight,
  Globe,
  ExternalLink,
  Clock
} from 'lucide-react';

export const HomeHero: React.FC = () => {
  const {
    articles,
    issues,
    setActiveTab,
    setSelectedArticleForView,
    downloadPublishedPaper,
    activeContent,
    content,
    activeDisciplines,
    subjectTracks
  } = useJournal();
  const currentContent = activeContent || content;
  const [selectedTrack, setSelectedTrack] = useState<string>('all');

  const hasUploadedPublishedPaper = (art: any) => Boolean(
    art.publishedDownloadURL ||
    art.publishedFileDataUrl ||
    art.publishedFileName ||
    art.publishedFileUrl ||
    art.driveUrl ||
    art.driveFileId ||
    art.publishedStoragePath ||
    (typeof window !== 'undefined' && localStorage.getItem(`chssh_pub_file_${art.id}`))
  );

  // Published articles filter (strictly status === 'published' or isPublishedLive === true)
  const publishedArticles = React.useMemo(() => {
    return articles.filter((a) => a.status === 'published' || (a as any).isPublishedLive === true);
  }, [articles]);

  // Dynamically resolve Current Issue exclusively from managed published issues in Firestore
  const currentIssueRecord =
    issues.find((i) => i.isCurrent && (i.status === 'published' || !i.status)) ||
    issues.find((i) => i.status === 'published');

  // Resolve current issue articles:
  // 1. Prioritize any explicitly ordered articleIds for this issue
  // 2. Append any published articles matching volumeNumber & issueNumber
  // 3. Fallback to any remaining published articles so all published papers are displayed
  const currentIssueArticles = React.useMemo(() => {
    if (publishedArticles.length === 0) return [];
    const seen = new Set<string>();
    const list: typeof articles = [];

    // 1. Articles explicitly listed in the issue's articleIds
    if (currentIssueRecord?.articleIds && currentIssueRecord.articleIds.length > 0) {
      for (const id of currentIssueRecord.articleIds) {
        const found = publishedArticles.find((a) => a.id === id);
        if (found && !seen.has(found.id)) {
          seen.add(found.id);
          list.push(found);
        }
      }
    }

    // 2. Published articles matching this issue's volume & issue number
    if (currentIssueRecord) {
      for (const art of publishedArticles) {
        if (!seen.has(art.id)) {
          const artVol = typeof art.volume === 'number' ? art.volume : Number(art.volume) || 1;
          const artIss = typeof art.issue === 'number' ? art.issue : Number(art.issue) || 1;
          if (artVol === currentIssueRecord.volumeNumber && artIss === currentIssueRecord.issueNumber) {
            seen.add(art.id);
            list.push(art);
          }
        }
      }
    }

    // 3. Any other published papers (e.g. if published live directly by administrator)
    for (const art of publishedArticles) {
      if (!seen.has(art.id)) {
        seen.add(art.id);
        list.push(art);
      }
    }

    return list;
  }, [publishedArticles, currentIssueRecord]);

  // Dynamic Discipline tabs from database
  const tracks = React.useMemo(() => {
    const list = [{ id: 'all', label: 'All Disciplines' }];
    activeDisciplines.forEach((d) => {
      list.push({ id: d.id, label: d.name });
    });
    return list;
  }, [activeDisciplines]);

  // Fallback to 'all' if selectedTrack discipline was deactivated or deleted
  React.useEffect(() => {
    if (selectedTrack !== 'all' && !activeDisciplines.some((d) => d.id === selectedTrack)) {
      setSelectedTrack('all');
    }
  }, [selectedTrack, activeDisciplines]);

  const filteredArticles = React.useMemo(() => {
    if (selectedTrack === 'all') return currentIssueArticles;
    const selectedDisc = activeDisciplines.find((d) => d.id === selectedTrack);
    const selNameLow = selectedDisc ? selectedDisc.name.toLowerCase().trim() : selectedTrack.toLowerCase().trim();

    return currentIssueArticles.filter((a) => {
      // 1. Explicit disciplineId match
      if (a.disciplineId && a.disciplineId === selectedTrack) return true;
      // 2. Explicit disciplineName match
      if (a.disciplineName && a.disciplineName.toLowerCase().trim() === selNameLow) return true;
      // 3. Track name matching discipline name directly
      if (a.track) {
        const artTrackLow = a.track.toLowerCase().trim();
        if (artTrackLow === selNameLow || artTrackLow.includes(selNameLow) || selNameLow.includes(artTrackLow)) {
          return true;
        }
      }
      // 4. Track mapped to this discipline in subjectTracks
      if (a.track) {
        const foundTrack = subjectTracks.find(
          (t) => t.id === a.trackId || t.name.toLowerCase().trim() === a.track.toLowerCase().trim()
        );
        if (foundTrack && foundTrack.disciplineIds && foundTrack.disciplineIds.includes(selectedTrack)) {
          return true;
        }
      }
      return false;
    });
  }, [selectedTrack, currentIssueArticles, activeDisciplines, subjectTracks]);

  const displayedArticles = filteredArticles;

  return (
    <div className="space-y-12">
      <section
        aria-labelledby="hero-journal-heading"
        className="relative bg-gradient-to-b from-[#e2ecf9]/60 via-[#f4f3ef]/40 to-transparent dark:from-[#102344]/40 dark:via-[#090e17]/30 dark:to-transparent border-b border-slate-200/80 dark:border-slate-800 pb-14 pt-6 rounded-2xl overflow-hidden transition-colors"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-80 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(28,53,94,0.12),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(92,142,209,0.14),rgba(0,0,0,0))] pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center space-y-5 px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="flex justify-center"
          >
            <JournalCrest size="lg" className="shadow-xs" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100/90 dark:bg-[#102344]/80 border border-[#1c355e]/25 dark:border-sky-500/40 text-[#1c355e] dark:text-sky-200 text-xs font-semibold tracking-wide shadow-2xs"
          >
            <span className="w-2 h-2 rounded-full bg-[#1c355e] dark:bg-sky-400 animate-pulse" />
            <EditableText id="hero_eyebrow" placeholder="Double-Blind Peer Reviewed   Open Access   Crossref Member" />
          </motion.div>

          <motion.h1
            id="hero-journal-heading"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-tight max-w-4xl mx-auto"
          >
            <EditableText
              id="hero_title"
              multiline
              placeholder="Contemporary Horizons in Social Sciences and Humanities"
            />
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-600 dark:text-slate-400 font-serif max-w-3xl mx-auto leading-relaxed"
          >
            <EditableText
              id="hero_subtitle"
              multiline
              placeholder="Bridging empirical social sciences and critical humanistic inquiry to address transformative cultural, sociological, and philosophical dilemmas in a rapidly globalizing world."
            />
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="flex flex-wrap items-center justify-center gap-3 pt-2"
          >
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setActiveTab('submit')}
              className="flex items-center gap-2 px-6 py-3 bg-[#1c355e] hover:bg-[#102344] dark:bg-[#23467d] dark:hover:bg-[#1c355e] text-white rounded-xl text-sm font-semibold shadow-sm hover:shadow-md transition-all cursor-pointer border border-[#102344]/60 dark:border-sky-500/40"
            >
              <Send className="w-4 h-4 text-sky-200" />
              <EditableText id="hero_cta_submit" placeholder="Submit Your Manuscript" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setActiveTab('current')}
              className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-200 rounded-xl text-sm font-semibold border border-slate-300 dark:border-slate-700 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-[#1c355e] dark:text-sky-400" />
              <EditableText id="hero_cta_explore" placeholder="Browse Current Issue" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setActiveTab('downloads')}
              className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-200 rounded-xl text-sm font-semibold border border-slate-300 dark:border-slate-700 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#1c355e] dark:text-sky-400" />
              <EditableText id="hero_cta_downloads" placeholder="Templates & Downloads" />
            </motion.button>
          </motion.div>

          {/* Editorial Announcements Callout Banner */}
          {currentContent.show_announcements !== 'false' && (currentContent.announcement_text || currentContent.announcement_badge) && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="max-w-4xl mx-auto pt-3 text-left"
            >
              <div className="bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs backdrop-blur-xs">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-amber-500 text-slate-950 font-mono shrink-0">
                    <EditableText id="announcement_badge" placeholder="Announcement" />
                  </span>
                  <span className="text-xs text-slate-800 dark:text-slate-200 font-serif leading-snug">
                    <EditableText id="announcement_text" placeholder="Submissions are currently invited for the upcoming issue." />
                  </span>
                </div>
                {currentContent.announcement_date && (
                  <span className="text-[11px] text-amber-900 dark:text-amber-200 font-mono font-semibold shrink-0">
                    <EditableText id="announcement_date" placeholder="Deadline: Nov 30" />
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Scholarly Metrics */}
        {currentContent.show_hero_stats !== 'false' && (
        <div className="max-w-6xl mx-auto mt-10 px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <motion.div
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-xs p-4 sm:p-5 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-sm hover:border-[#1c355e]/40 dark:hover:border-sky-500/50 transition-all text-center space-y-1.5 group"
            >
              <div className="text-2xl sm:text-3xl font-bold text-[#1c355e] dark:text-sky-400 font-serif group-hover:scale-105 transition-transform">
                <EditableText id="stat_impact_factor" placeholder="2.84" />
              </div>
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-200">
                <EditableText id="stat_impact_title" placeholder="Clarivate Impact Score" />
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                <EditableText id="stat_impact_desc" placeholder="ESCI / JCR Evaluation Score (2025)" />
              </div>
              <div className="pt-1">
                <span className="inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-50 dark:bg-[#102344]/70 text-[#1c355e] dark:text-sky-300 border border-blue-200 dark:border-blue-900">
                  <EditableText id="stat_impact_badge" placeholder="Journal Citation Reports" />
                </span>
              </div>
            </motion.div>
            <motion.div
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-xs p-4 sm:p-5 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-sm hover:border-slate-400 dark:hover:border-slate-700 transition-all text-center space-y-1.5 group"
            >
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 font-serif group-hover:scale-105 transition-transform">
                <EditableText id="stat_acceptance_rate" placeholder="24.5%" />
              </div>
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-200">
                <EditableText id="stat_acceptance_title" placeholder="Acceptance Rate" />
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                <EditableText id="stat_acceptance_desc" placeholder="Rigorous Double-Blind Standard" />
              </div>
              <div className="pt-1">
                <span className="inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  <EditableText id="stat_acceptance_badge" placeholder="Merit & Quality Filter" />
                </span>
              </div>
            </motion.div>
            <motion.div
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-xs p-4 sm:p-5 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-sm hover:border-slate-400 dark:hover:border-slate-700 transition-all text-center space-y-1.5 group"
            >
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 font-serif group-hover:scale-105 transition-transform">
                <EditableText id="stat_review_time" placeholder="28 Days" />
              </div>
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-200">
                <EditableText id="stat_review_title" placeholder="First Editorial Decision" />
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                <EditableText id="stat_review_desc" placeholder="Average Time to First Decision" />
              </div>
              <div className="pt-1">
                <span className="inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  <EditableText id="stat_review_badge" placeholder="Expeditious Peer Review" />
                </span>
              </div>
            </motion.div>
            <motion.div
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-xs p-4 sm:p-5 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-sm hover:border-emerald-300 dark:hover:border-emerald-700 transition-all text-center space-y-1.5 group"
            >
              <div className="text-2xl sm:text-3xl font-bold text-emerald-800 dark:text-emerald-400 font-serif group-hover:scale-105 transition-transform">
                <EditableText id="stat_open_access" placeholder="Gold OA" />
              </div>
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-200">
                <EditableText id="stat_open_access_title" placeholder="Open Access Model" />
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                <EditableText id="stat_open_access_desc" placeholder="Creative Commons (CC BY 4.0)" />
              </div>
              <div className="pt-1">
                <span className="inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <EditableText id="stat_open_access_badge" placeholder="Subsidized / Zero Paywall" />
                </span>
              </div>
            </motion.div>
          </div>
        </div>
        )}
      </section>

      {/* Current Issue Section */}
      <section aria-labelledby="home-current-issue-heading" className="max-w-6xl mx-auto px-4 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <div className="text-xs font-semibold text-[#1c355e] dark:text-sky-400 uppercase tracking-widest flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              <span>Current Issue</span>
            </div>
            <h2 id="home-current-issue-heading" className="font-serif text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              {currentIssueRecord?.title ? (
                <span>{currentIssueRecord.title}</span>
              ) : currentIssueRecord ? (
                <span>{`Volume ${currentIssueRecord.volumeNumber}, Issue ${currentIssueRecord.issueNumber} (${currentIssueRecord.year})`}</span>
              ) : currentIssueArticles.length > 0 ? (
                <span>{`Volume ${currentIssueArticles[0].volume || 1}, Issue ${currentIssueArticles[0].issue || 1} (${currentIssueArticles[0].year || 2026})`}</span>
              ) : (
                <span>Current Issue</span>
              )}
            </h2>
            {currentIssueRecord?.tableOfContentsSummary && (
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-serif mt-1 max-w-2xl">
                {currentIssueRecord.tableOfContentsSummary}
              </p>
            )}
          </div>
          {(currentIssueRecord || currentIssueArticles.length > 0) && (
            <button
              type="button"
              onClick={() => setActiveTab('current')}
              className="text-xs font-bold text-[#1c355e] dark:text-sky-400 hover:text-[#102344] dark:hover:text-sky-300 flex items-center gap-1 cursor-pointer group"
            >
              <span>View Full Current Issue</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>

        {!currentIssueRecord && currentIssueArticles.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-12 text-center space-y-3">
            <BookOpen className="w-10 h-10 mx-auto text-slate-400 dark:text-slate-500" />
            <h3 className="font-serif text-lg font-bold text-slate-800 dark:text-slate-200">
              No current issue has been published yet.
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              When the administrator publishes the current issue through the Admin Panel, it will appear here.
            </p>
          </div>
        ) : (
          <>
            {/* Disciplinary Track Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium text-xs mr-1 hidden sm:inline">
                <EditableText id="home_filter_label" placeholder="Filter:" />
              </span>
              {tracks.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTrack(t.id)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap ${
                    selectedTrack === t.id
                      ? 'bg-[#1c355e] dark:bg-[#23467d] text-white shadow-2xs font-semibold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Articles List */}
            {currentIssueArticles.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-12 text-center space-y-3">
                <BookOpen className="w-10 h-10 mx-auto text-slate-400 dark:text-slate-500" />
                <h3 className="font-serif text-lg font-bold text-slate-800 dark:text-slate-200">
                  No papers have been published in this issue yet.
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Peer-reviewed manuscripts approved by the editorial office will appear here upon publication.
                </p>
              </div>
            ) : (
          <div className="space-y-4">
            {displayedArticles.map((article, idx) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                whileHover={{ y: -2, transition: { duration: 0.15 } }}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-2xs hover:shadow-sm hover:border-[#1c355e]/30 dark:hover:border-sky-500/30 transition-all space-y-3 relative group"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-blue-50 dark:bg-[#102344]/80 text-[#1c355e] dark:text-sky-300 text-xs font-semibold border border-blue-200 dark:border-sky-900">
                    {article.track}
                  </span>
                  
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono flex-wrap">
                    <span>Pages {article.pages}</span>
                    {article.doi && (
                      <>
                        <span> </span>
                        <ArticleDoiBadge doi={article.doi} size="sm" variant="badge" />
                      </>
                    )}
                  </div>
                </div>

                <h3
                  onClick={() => setSelectedArticleForView(article)}
                  className="font-serif text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#1c355e] dark:group-hover:text-sky-300 transition-colors cursor-pointer leading-snug"
                >
                  {article.title}
                </h3>

                <div className="text-xs text-slate-600 dark:text-slate-400">
                  <strong className="text-slate-800 dark:text-slate-200">Authors:</strong>{' '}
                  {article.authors.map((a, i) => (
                    <span key={a.id} className="mr-2">
                      {a.name} <span className="text-slate-400 dark:text-slate-500">({a.affiliation}, {a.country})</span>
                      {i < article.authors.length - 1 ? ';' : ''}
                    </span>
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-serif leading-relaxed line-clamp-3 text-justify">
                  {article.abstract}
                </p>

                {/* Published Paper Google Drive Link if provided by Admin */}
                {article.driveUrl && (
                  <div className="flex flex-wrap items-center gap-2 px-3 py-2 rounded-lg bg-sky-50/90 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-850 text-xs">
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

                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex flex-wrap gap-1.5">
                    {article.keywords.slice(0, 4).map((kw, i) => (
                      <span key={i} className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-0.5 rounded font-sans border border-slate-200/50 dark:border-slate-750">
                        {kw}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setSelectedArticleForView(article)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold transition cursor-pointer border border-slate-200/60 dark:border-slate-700"
                    >
                      <EditableText id="article_btn_read_cite" placeholder="Read Abstract & Cite" />
                    </button>

                    {/* Publication Certificate Button (Active when admin has added certificate link) */}
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
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100/80 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 rounded-lg text-xs font-medium border border-slate-200/50 dark:border-slate-750 cursor-pointer"
                        title="Your publication certificate will be available after it is uploaded by the admin."
                      >
                        <Award className="w-3.5 h-3.5 opacity-60" />
                        <span>Certificate Pending</span>
                      </button>
                    )}

                    {/* Download Published Paper PDF - Publicly accessible without login */}
                    <button
                      type="button"
                      onClick={() => downloadPublishedPaper(article)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-2xs hover:shadow-xs transition cursor-pointer"
                      title={article.driveUrl ? `Download official published PDF (Google Drive: ${article.driveUrl})` : "Download official finalized published paper (PDF)"}
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-200" />
                      <span>Download PDF</span>
                      {article.driveUrl && <ExternalLink className="w-2.5 h-2.5 opacity-80" />}
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
        </>
        )}
      </section>

      {/* Indexing & Academic Partners Section */}
      <section aria-labelledby="indexing-section-heading" className="max-w-6xl mx-auto px-4 pt-4">
        <div className="bg-gradient-to-b from-[#eef4fb]/50 to-white dark:from-[#0a162b] dark:to-[#0f1115] rounded-2xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 text-center space-y-4 shadow-2xs transition-colors">
          <div className="text-xs font-semibold text-[#1c355e] dark:text-sky-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
            <Globe className="w-3.5 h-3.5" />
            <EditableText id="indexing_title" placeholder="Abstracting, Indexing & Archiving" />
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-serif">
            <EditableText id="indexing_subtitle" placeholder="Ensuring maximum global discoverability and permanent digital preservation" />
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs text-center">
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Crossref DOI</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Member 10.5281</div>
            </div>
            <div className="p-3 bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs text-center">
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100">DOAJ</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Directory Open Access</div>
            </div>
            <div className="p-3 bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs text-center">
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Portico Archive</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Dark Archive Preservation</div>
            </div>
            <div className="p-3 bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs text-center">
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Google Scholar</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Global Academic Index</div>
            </div>
          </div>
          <div className="text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto bg-white/70 dark:bg-slate-850/80 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 font-mono">
            <EditableText
              id="indexing_partners"
              multiline
              placeholder="Crossref DOI   Directory of Open Access Journals (DOAJ)   Google Scholar   Scopus Evaluation Candidate   EBSCOhost Academic Collection   Portico Digital Archive   PKP Preservation Network   WorldCat"
            />
          </div>
        </div>
      </section>
    </div>
  );
};
