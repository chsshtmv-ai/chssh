import React, { useState } from 'react';
import { useJournal } from '../context/JournalContext';
import { EditableText } from './EditableText';
import { ArticleDoiBadge } from './ArticleDoiBadge';
import { motion } from 'motion/react';
import {
  Search,
  BookOpen,
  Download,
  X
} from 'lucide-react';

export const Archive: React.FC = () => {
  const { articles, setSelectedArticleForView, requireAuthorAuth, downloadPublishedPaper } = useJournal();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('all');

  const publishedArticles = articles.filter((a) => a.status === 'published');
  const tracks = [
    'all',
    'Sociology & Social Theory',
    'Cultural Studies & Critical Theory',
    'Applied Ethics & Epistemic Justice',
    'History, Memory & Archival Studies',
    'Political Philosophy & Global Governance',
    'Digital Humanities & Computational Social Science'
  ];

  const filteredArticles = publishedArticles.filter((art) => {
    const matchesTrack = selectedTrack === 'all' || art.track === selectedTrack;
    const matchesSearch =
      searchTerm === '' ||
      art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.abstract.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.keywords.some((k) => k.toLowerCase().includes(searchTerm.toLowerCase())) ||
      art.authors.some((a) => a.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesTrack && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
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
            <EditableText id="archive_title" placeholder="Journal Archive & Full-Text Search" />
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-serif max-w-3xl mt-1 leading-relaxed">
            <EditableText
              id="archive_description"
              multiline
              placeholder="Browse and query all peer-reviewed research papers published in Contemporary Horizons in Social Sciences and Humanities. All papers are archived permanently and licensed under CC BY 4.0."
            />
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by keywords, title, abstract, or author name..."
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
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
          <div>
            <select
              value={selectedTrack}
              onChange={(e) => setSelectedTrack(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all cursor-pointer font-medium text-slate-700 dark:text-slate-200"
            >
              {tracks.map((t) => (
                <option key={t} value={t}>
                  {t === 'all' ? 'All Disciplines & Tracks' : t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-stone-600 dark:text-stone-400 font-medium px-1">
          <span className="font-bold uppercase tracking-wider">
            <EditableText id="archive_results_found" placeholder="Found published papers matching criteria" /> ({filteredArticles.length})
          </span>
          {selectedTrack !== 'all' && (
            <button
              type="button"
              onClick={() => setSelectedTrack('all')}
              className="text-amber-800 dark:text-amber-400 hover:underline cursor-pointer flex items-center gap-1"
            >
              Clear filter: {selectedTrack}
            </button>
          )}
        </div>

        {filteredArticles.length === 0 ? (
          <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-12 text-center space-y-3">
            <Search className="w-8 h-8 text-stone-300 dark:text-stone-600 mx-auto" />
            <div className="font-serif text-lg font-bold text-stone-800 dark:text-stone-200">No papers match your query</div>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
              Try broader search terms or switch back to "All Disciplines & Tracks".
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedTrack('all');
              }}
              className="px-4 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-lg text-xs font-semibold transition cursor-pointer"
            >
              Reset Search & Filters
            </button>
          </div>
        ) : (
          filteredArticles.map((article, idx) => (
            <motion.article
              key={article.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.04 }}
              whileHover={{ y: -2, transition: { duration: 0.15 } }}
              className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200/90 dark:border-stone-800 p-5 sm:p-6 shadow-2xs hover:shadow-sm hover:border-stone-300 dark:hover:border-stone-700 transition-all space-y-3 relative group"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-medium border border-stone-200 dark:border-stone-700">
                  {article.track}
                </span>
                <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 font-mono flex-wrap">
                  <span>Vol. {article.volume}, Iss. {article.issue} ({article.year})</span>
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
                className="font-serif text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#1c355e] dark:group-hover:text-sky-400 transition-colors cursor-pointer leading-snug"
              >
                {article.title}
              </h3>

              <div className="text-xs text-slate-600 dark:text-slate-400">
                <strong className="text-slate-800 dark:text-slate-200">Authors:</strong>{' '}
                {article.authors.map((a, i) => (
                  <span key={a.id} className="mr-2">
                    {a.name} <span className="text-slate-400 dark:text-slate-500">({a.affiliation})</span>
                    {i < article.authors.length - 1 ? ';' : ''}
                  </span>
                ))}
              </div>

              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-serif leading-relaxed line-clamp-3 text-justify">
                {article.abstract}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex flex-wrap gap-1.5">
                  {article.keywords.map((kw, i) => (
                    <span key={i} className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-0.5 rounded font-sans border border-slate-200/50 dark:border-slate-750">
                      {kw}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedArticleForView(article)}
                    className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold transition cursor-pointer border border-slate-200/60 dark:border-slate-700"
                  >
                    <EditableText id="article_btn_read_cite" placeholder="View Details & Cite" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      requireAuthorAuth(() => {
                        const success = downloadPublishedPaper(article);
                        if (!success) {
                          setSelectedArticleForView(article);
                        }
                      }, 'Author Login Required: Please log in with your User ID and Password to download published research papers.');
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1c355e] hover:bg-[#102344] text-white rounded-lg text-xs font-semibold shadow-2xs transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-sky-300" />
                    <span>
                      <EditableText id="article_btn_download_pdf" placeholder="Download PDF" />
                    </span>
                  </button>
                </div>
              </div>
            </motion.article>
          ))
        )}
      </div>
    </div>
  );
};
