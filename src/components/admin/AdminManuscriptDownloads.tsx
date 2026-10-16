import React, { useState } from 'react';
import { useJournal } from '../../context/JournalContext';
import { Article } from '../../types';
import {
  Download,
  FileText,
  Search,
  Filter,
  CheckCircle2,
  FileCheck,
  Calendar,
  User,
  UploadCloud
} from 'lucide-react';

interface AdminManuscriptDownloadsProps {
  onSwitchToPublication?: (articleId?: string) => void;
}

export const AdminManuscriptDownloads: React.FC<AdminManuscriptDownloadsProps> = ({
  onSwitchToPublication
}) => {
  const { articles, downloadOriginalManuscript, setSelectedArticleForView } = useJournal();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [downloadSuccessId, setDownloadSuccessId] = useState<string | null>(null);

  const filteredArticles = articles.filter((art) => {
    const matchesFilter = statusFilter === 'all' ? true : art.status === statusFilter;
    const matchesSearch =
      searchTerm === ''
        ? true
        : art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          art.trackingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          art.authors.some((a) => a.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (art.fileName && art.fileName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const handleDownload = (article: Article) => {
    downloadOriginalManuscript(article);
    setDownloadSuccessId(article.id);
    setTimeout(() => setDownloadSuccessId(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#0f1f38] via-[#1c355e] to-[#162a4a] text-white p-6 rounded-2xl border border-[#1c355e]/50 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 uppercase tracking-widest">
              <Download className="w-4 h-4" />
              <span>Admin Downloads Section</span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-100 mt-1">
              Author Submitted Original Manuscripts Repository
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl font-serif">
              Download the original, unedited manuscript files submitted by authors for peer review, copy-editing, and typesetting into the official journal template.
            </p>
          </div>
          <div className="bg-[#102344]/80 px-4 py-3 rounded-xl border border-sky-900/60 text-center sm:text-right">
            <span className="text-2xl font-bold text-sky-300 font-mono">
              {articles.length}
            </span>
            <span className="block text-[11px] text-slate-300 uppercase tracking-wider font-semibold">
              Total Manuscripts In Intake
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
          <span className="text-xs font-bold text-stone-500 dark:text-stone-400 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Filter:
          </span>
          {[
            { id: 'all', label: 'All Manuscripts' },
            { id: 'submitted', label: 'Submitted (Intake)' },
            { id: 'under_review', label: 'Under Review' },
            { id: 'accepted', label: 'Accepted' },
            { id: 'published', label: 'Published' }
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                statusFilter === f.id
                  ? 'bg-[#1c355e] text-white shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400 dark:text-stone-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ID, title, author, file..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 dark:bg-stone-850 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 rounded-lg outline-none focus:ring-2 focus:ring-sky-500 transition-colors"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredArticles.length === 0 ? (
          <div className="bg-white dark:bg-stone-900 p-10 text-center rounded-2xl border border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400">
            <FileText className="w-10 h-10 mx-auto text-stone-300 dark:text-stone-700 mb-2" />
            <p className="text-sm font-semibold">No manuscripts found matching filter criteria.</p>
            <p className="text-xs text-stone-400 mt-1">Try changing search keywords or resetting the status filter.</p>
          </div>
        ) : (
          filteredArticles.map((article) => {
            const hasDataUrl = Boolean(
              article.fileDataUrl ||
              (typeof window !== 'undefined' && localStorage.getItem(`chssh_orig_file_${article.id}`))
            );
            const hasPublishedPaper = Boolean(
              article.publishedFileDataUrl ||
              article.publishedFileUrl ||
              (typeof window !== 'undefined' && localStorage.getItem(`chssh_pub_file_${article.id}`))
            );
            const isDownloaded = downloadSuccessId === article.id;
            return (
              <div
                key={article.id}
                className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-sky-300 dark:hover:border-sky-800/80 shadow-xs transition-all p-5 sm:p-6 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 px-2.5 py-1 rounded-md border border-amber-200 dark:border-amber-800">
                      {article.trackingId}
                    </span>
                    <span className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Submitted: {article.submissionDate}
                    </span>
                    <span className="text-stone-300 dark:text-stone-700"> </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 font-medium">
                      {article.track}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${
                        article.status === 'published'
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                          : article.status === 'accepted'
                          ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800'
                          : 'bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                      }`}
                    >
                      {article.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 leading-snug">
                    {article.title}
                  </h4>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 flex items-center gap-1.5 flex-wrap">
                    <User className="w-3.5 h-3.5 text-stone-400" />
                    <strong>Authors:</strong>
                    {article.authors.map((a, i) => (
                      <span key={i} className="text-stone-700 dark:text-stone-300">
                        {a.name} ({a.affiliation || a.country})
                        {i < article.authors.length - 1 ? '; ' : ''}
                      </span>
                    ))}
                  </p>
                </div>

                <p className="text-xs text-stone-600 dark:text-stone-400 font-serif line-clamp-2 bg-stone-50 dark:bg-stone-850 p-3 rounded-xl border border-stone-100 dark:border-stone-800">
                  {article.abstract}
                </p>

                <div className="bg-slate-50 dark:bg-stone-850/70 rounded-xl p-4 border border-slate-200/80 dark:border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-[11px] uppercase tracking-wider font-bold text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                      <span>Original Author Submission File:</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-800 px-2.5 py-1 rounded border border-stone-300 dark:border-stone-700">
                        {article.fileName || 'Submitted_Manuscript.docx'}
                      </span>
                      <span className="text-xs text-stone-500 dark:text-stone-400">
                        ({article.fileSize || '1.8 MB'})
                      </span>
                      {hasDataUrl ? (
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Author Original Upload Stored
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-stone-600 dark:text-stone-400 bg-stone-200 dark:bg-stone-800 px-2 py-0.5 rounded">
                          Submission Intake Dossier
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleDownload(article)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
                        isDownloaded
                          ? 'bg-emerald-700 text-white'
                          : 'bg-[#1c355e] hover:bg-[#102344] text-white'
                      }`}
                      title="Download author's original manuscript as Microsoft Word (.docx)"
                    >
                      {isDownloaded ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-200 animate-bounce" />
                          <span>Downloaded Word Doc!</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 text-sky-300" />
                          <span>Download Word Manuscript (.docx)</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedArticleForView(article)}
                      className="px-3 py-2 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-300 border border-stone-300 dark:border-stone-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                    >
                      View Dossier
                    </button>
                    {(article.status === 'accepted' || article.status === 'published') && onSwitchToPublication && (
                      <button
                        type="button"
                        onClick={() => onSwitchToPublication(article.id)}
                        className="flex items-center gap-1 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs font-bold transition cursor-pointer"
                        title="Open Publication Section to upload the formatted paper in the journal template"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Upload Templated Paper</span>
                      </button>
                    )}
                  </div>
                </div>

                {(article.status === 'published' || article.status === 'accepted') && (
                  <div className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800">
                    <span className="text-stone-600 dark:text-stone-400">
                      <strong>Typesetting & Publication:</strong>{' '}
                      {hasPublishedPaper ? (
                        <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                          Journal-Templated Final Paper Uploaded ({article.publishedFileName || 'Final_Paper.pdf'})
                        </span>
                      ) : (
                        <span className="text-amber-700 dark:text-amber-400 font-semibold">
                          Pending Journal-Templated Upload (Public website download is locked until editor uploads the final paper)
                        </span>
                      )}
                    </span>
                    {hasPublishedPaper && (
                      <span className="text-[11px] font-mono text-stone-500">
                        {article.publishedFileSize || '2.1 MB'}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
