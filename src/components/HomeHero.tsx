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
  Globe
} from 'lucide-react';

export const HomeHero: React.FC = () => {
  const { articles, setActiveTab, setSelectedArticleForView } = useJournal();
  const [selectedTrack, setSelectedTrack] = useState<string>('all');

  const publishedArticles = articles.filter((a) => a.status === 'published');
  const tracks = [
    { id: 'all', label: 'All Disciplines' },
    { id: 'Sociology & Social Theory', label: 'Sociology' },
    { id: 'Cultural Studies & Critical Theory', label: 'Critical Theory' },
    { id: 'Applied Ethics & Epistemic Justice', label: 'Ethics & Justice' },
    { id: 'Digital Humanities & Computational Social Science', label: 'Digital Humanities' },
    { id: 'History, Memory & Archival Studies', label: 'History & Memory' }
  ];

  const filteredArticles = selectedTrack === 'all'
    ? publishedArticles
    : publishedArticles.filter(a => a.track.toLowerCase().includes(selectedTrack.toLowerCase()) || a.track === selectedTrack);

  const displayedArticles = filteredArticles.slice(0, 4);

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
        </div>

        {/* Scholarly Metrics */}
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
      </section>

      {/* Special Call for Papers Banner */}
      <section aria-labelledby="call-for-papers-heading" className="max-w-6xl mx-auto px-4">
        <motion.div
          whileHover={{ scale: 1.005 }}
          className="relative bg-gradient-to-br from-[#0a162b] via-[#102344] to-[#1c355e] text-white rounded-2xl p-6 sm:p-8 shadow-lg border border-sky-400/30 overflow-hidden"
        >
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2.5 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-sky-400/20 text-sky-200 border border-sky-300/40 text-xs font-bold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
                  <EditableText id="call_for_papers_badge" placeholder="Call for Papers   Vol. 7, No. 3" />
                </span>
                <span className="text-xs text-slate-300 font-mono">
                  <EditableText id="call_for_papers_tag" placeholder="Special Thematic Issue" />
                </span>
              </div>
              <h2 id="call-for-papers-heading" className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight leading-snug">
                <EditableText
                  id="call_for_papers_title"
                  placeholder="Special Issue: Artificial Intelligence, Epistemic Justice, and the Human Condition"
                />
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 font-serif leading-relaxed">
                <EditableText
                  id="call_for_papers_desc"
                  multiline
                  placeholder="We invite original empirical research, theoretical interventions, and critical book reviews examining how algorithmic culture reframes societal institutions, historical narrative, and moral philosophy."
                />
              </p>
              <div className="flex items-center gap-2 text-xs text-sky-200/90 font-mono pt-1">
                <Calendar className="w-3.5 h-3.5 text-sky-300" />
                <EditableText id="call_for_papers_deadline" placeholder="Submission Deadline: November 30, 2026" />
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={() => setActiveTab('submit')}
              className="shrink-0 group flex items-center gap-2 px-5 py-3 bg-white hover:bg-slate-100 text-[#102344] rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
            >
              <span>
                <EditableText id="call_for_papers_cta" placeholder="Submit to Special Issue" />
              </span>
              <ArrowRight className="w-4 h-4 text-[#1c355e] group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* Featured Research Articles */}
      <section className="max-w-6xl mx-auto px-4 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <div className="text-xs font-semibold text-[#1c355e] dark:text-sky-400 uppercase tracking-widest flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              <span>
                <EditableText id="home_latest_badge" placeholder="Latest Scholarly Publications" />
              </span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              <EditableText id="home_latest_title" placeholder="Current Issue   Vol. 7, No. 1 (2026)" />
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('current')}
            className="text-xs font-bold text-[#1c355e] dark:text-sky-400 hover:text-[#102344] dark:hover:text-sky-300 flex items-center gap-1 cursor-pointer group"
          >
            <span>
              <EditableText id="home_latest_view_all" placeholder="View All Papers in Volume 7" />
            </span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

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

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex flex-wrap gap-1.5">
                  {article.keywords.slice(0, 4).map((kw, i) => (
                    <span key={i} className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-0.5 rounded font-sans border border-slate-200/50 dark:border-slate-750">
                      {kw}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedArticleForView(article)}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold transition cursor-pointer border border-slate-200/60 dark:border-slate-700"
                  >
                    <EditableText id="article_btn_read_cite" placeholder="Read Abstract & Cite" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedArticleForView(article)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1c355e] hover:bg-[#102344] dark:bg-[#23467d] dark:hover:bg-[#1c355e] text-white rounded-lg text-xs font-semibold shadow-2xs transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-sky-200" />
                    <span>
                      <EditableText id="article_btn_download_pdf" placeholder="Download PDF" />
                    </span>
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
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
