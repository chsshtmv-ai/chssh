import React, { useState, useEffect } from 'react';
import { useJournal } from '../../context/JournalContext';
import {
  CurrentIssuePageConfig,
  JournalIssue,
  Article,
  CurrentIssueTableColumn
} from '../../types';
import {
  BookOpen,
  Sparkles,
  Save,
  Eye,
  CheckCircle2,
  AlertCircle,
  Upload,
  ExternalLink,
  Edit3,
  Trash2,
  ArrowUp,
  ArrowDown,
  Plus,
  X,
  FileText,
  Calendar,
  Layers,
  Award,
  Download,
  Settings,
  Palette,
  Layout,
  Sliders,
  Check,
  RefreshCw,
  Archive,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ArticleDoiBadge } from '../ArticleDoiBadge';
import { CurrentIssue } from '../CurrentIssue';

export const AdminCurrentIssueCms: React.FC = () => {
  const {
    currentIssueConfig,
    updateCurrentIssueConfig,
    publishCurrentIssueConfig,
    saveDraftCurrentIssueConfig,
    resetCurrentIssueConfigToDefault,
    issues,
    volumes,
    articles,
    createIssue,
    updateIssue,
    deleteIssue,
    publishIssue,
    unpublishIssue,
    designateCurrentIssue,
    reorderArticlesInIssue,
    addArticleToIssue,
    removeArticleFromIssue,
    updateArticle,
    setActiveTab,
    isAdmin
  } = useJournal();

  // Local working copy of config for staging / drafting
  const [localConfig, setLocalConfig] = useState<CurrentIssuePageConfig>(currentIssueConfig);
  const [activeSection, setActiveSection] = useState<
    'header' | 'issue' | 'downloads' | 'articles' | 'table' | 'buttons' | 'footer' | 'appearance'
  >('header');

  // Preview modal state
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Status feedback
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Synchronize when remote config updates (if not dirty)
  useEffect(() => {
    setLocalConfig(currentIssueConfig);
  }, [currentIssueConfig]);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => setFeedbackMessage(null), 5000);
  };

  // Resolve current issue
  const currentIssue =
    issues.find(i => i.isCurrent && (i.status === 'published' || !i.status)) ||
    issues.find(i => i.isCurrent) ||
    issues.find(i => i.status === 'published') ||
    issues[0];

  // Articles assigned to current issue
  const currentIssueArticles = currentIssue?.articleIds
    ? (currentIssue.articleIds
        .map(id => articles.find(a => a.id === id))
        .filter(Boolean) as Article[])
    : [];

  // Eligible articles to add
  const candidateArticles = articles.filter(
    a => !currentIssue?.articleIds?.includes(a.id)
  );

  // Article Edit Modal state
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [artTitle, setArtTitle] = useState('');
  const [artAuthors, setArtAuthors] = useState('');
  const [artAbstract, setArtAbstract] = useState('');
  const [artKeywords, setArtKeywords] = useState('');
  const [artPageStart, setArtPageStart] = useState('');
  const [artPageEnd, setArtPageEnd] = useState('');
  const [artDriveUrl, setArtDriveUrl] = useState('');
  const [artDoi, setArtDoi] = useState('');
  const [artCitation, setArtCitation] = useState('');
  const [artStatus, setArtStatus] = useState<Article['status']>('published');

  // Issue Edit Modal state
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [issueVolNum, setIssueVolNum] = useState<number>(currentIssue?.volumeNumber || 1);
  const [issueNum, setIssueNum] = useState<number>(currentIssue?.issueNumber || 1);
  const [issueYear, setIssueYear] = useState<number>(currentIssue?.year || new Date().getFullYear());
  const [issueMonth, setIssueMonth] = useState<string>(currentIssue?.publicationMonth || 'September');
  const [issueTitle, setIssueTitle] = useState(currentIssue?.title || '');
  const [issuePubDate, setIssuePubDate] = useState(currentIssue?.publicationDate || new Date().toISOString().split('T')[0]);
  const [issueDesc, setIssueDesc] = useState(currentIssue?.tableOfContentsSummary || '');
  const [issueStatus, setIssueStatus] = useState<'published' | 'draft' | 'archived'>(currentIssue?.status || 'published');

  const handleOpenEditCurrentIssue = () => {
    if (!currentIssue) return;
    setIssueVolNum(currentIssue.volumeNumber);
    setIssueNum(currentIssue.issueNumber);
    setIssueYear(currentIssue.year);
    setIssueMonth(currentIssue.publicationMonth || 'September');
    setIssueTitle(currentIssue.title);
    setIssuePubDate(currentIssue.publicationDate);
    setIssueDesc(currentIssue.tableOfContentsSummary || '');
    setIssueStatus(currentIssue.status);
    setIsIssueModalOpen(true);
  };

  const handleSaveIssueDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentIssue) return;
    setIsSaving(true);
    const ok = await updateIssue(currentIssue.id, {
      volumeNumber: Number(issueVolNum),
      issueNumber: Number(issueNum),
      year: Number(issueYear),
      publicationMonth: issueMonth.trim(),
      title: issueTitle.trim() || `Volume ${issueVolNum}, Issue ${issueNum}`,
      publicationDate: issuePubDate,
      tableOfContentsSummary: issueDesc.trim(),
      status: issueStatus
    });
    setIsSaving(false);
    if (ok) {
      showFeedback('success', 'Issue details updated successfully!');
      setIsIssueModalOpen(false);
    } else {
      showFeedback('error', 'Failed to update issue details.');
    }
  };

  const handleOpenEditArticle = (art: Article) => {
    setEditingArticle(art);
    setArtTitle(art.title);
    setArtAuthors(art.authors.map(a => a.name).join(', '));
    setArtAbstract(art.abstract || '');
    setArtKeywords(art.keywords ? art.keywords.join(', ') : '');
    setArtPageStart(art.pageStart || (art.pages?.split(/[-–]/)[0] || '').trim());
    setArtPageEnd(art.pageEnd || (art.pages?.split(/[-–]/)[1] || '').trim());
    setArtDriveUrl(art.driveUrl || '');
    setArtDoi(art.doi || '');
    setArtCitation(art.citation || '');
    setArtStatus(art.status);
    setIsArticleModalOpen(true);
  };

  const handleSaveArticleDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle) return;
    setIsSaving(true);

    const pagesCombined = artPageStart && artPageEnd ? `${artPageStart}–${artPageEnd}` : artPageStart || editingArticle.pages;
    const authorList = artAuthors.split(',').map((name, i) => ({
      id: editingArticle.authors[i]?.id || `auth_${Date.now()}_${i}`,
      name: name.trim(),
      affiliation: editingArticle.authors[i]?.affiliation || 'Academic Researcher',
      country: editingArticle.authors[i]?.country || 'India',
      email: editingArticle.authors[i]?.email || 'author@journal.org',
      isCorresponding: i === 0
    }));

    const updatedArt: Article = {
      ...editingArticle,
      title: artTitle.trim(),
      authors: authorList,
      abstract: artAbstract.trim(),
      keywords: artKeywords.split(',').map(k => k.trim()).filter(Boolean),
      pageStart: artPageStart.trim() || undefined,
      pageEnd: artPageEnd.trim() || undefined,
      pages: pagesCombined,
      driveUrl: artDriveUrl.trim() || undefined,
      doi: artDoi.trim() || undefined,
      citation: artCitation.trim() || undefined,
      status: artStatus
    };

    updateArticle(updatedArt);
    setIsSaving(false);
    showFeedback('success', `Article "${artTitle.substring(0, 30)}..." updated successfully!`);
    setIsArticleModalOpen(false);
  };

  // Reorder Article Handler
  const handleMoveArticleOrder = async (artId: string, direction: 'up' | 'down') => {
    if (!currentIssue) return;
    const idx = currentIssue.articleIds.indexOf(artId);
    if (idx === -1) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === currentIssue.articleIds.length - 1) return;

    const newIds = [...currentIssue.articleIds];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const temp = newIds[idx];
    newIds[idx] = newIds[targetIdx];
    newIds[targetIdx] = temp;

    const ok = await reorderArticlesInIssue(currentIssue.id, newIds);
    if (ok) {
      showFeedback('success', 'Article order updated successfully!');
    }
  };

  // Top Workflow Actions
  const handleSaveDraft = async () => {
    setIsSaving(true);
    const res = await saveDraftCurrentIssueConfig(localConfig);
    setIsSaving(false);
    if (res.success) {
      showFeedback('success', 'Draft saved securely. You can preview it before publishing.');
    } else {
      showFeedback('error', res.error || 'Failed to save draft.');
    }
  };

  const handlePublishLive = async () => {
    if (!window.confirm('Publish these Current Issue settings to the live public website immediately?')) return;
    setIsSaving(true);
    const res = await publishCurrentIssueConfig(localConfig);
    setIsSaving(false);
    if (res.success) {
      showFeedback('success', 'Current Issue page published live! All changes are now public.');
    } else {
      showFeedback('error', res.error || 'Failed to publish live.');
    }
  };

  const handleUnpublish = async () => {
    if (!window.confirm('Unpublish the Current Issue page? Public visitors will see the configured empty state message.')) return;
    if (currentIssue) {
      await unpublishIssue(currentIssue.id);
    }
    const res = await updateCurrentIssueConfig({ status: 'draft' });
    if (res.success) {
      setLocalConfig(prev => ({ ...prev, status: 'draft' }));
      showFeedback('success', 'Current Issue page unpublished. Status reverted to Draft.');
    }
  };

  const handleArchiveCurrent = async () => {
    if (!currentIssue) return;
    if (!window.confirm(`Archive Volume ${currentIssue.volumeNumber}, Issue ${currentIssue.issueNumber}? It will be stored in Archives, and you can designate a new Current Issue.`)) return;
    await updateIssue(currentIssue.id, { isCurrent: false, status: 'archived' });
    showFeedback('success', `Volume ${currentIssue.volumeNumber}, Issue ${currentIssue.issueNumber} moved to Archive.`);
  };

  const handleResetToDefault = async () => {
    if (!window.confirm('Reset Current Issue layout and design settings to default reference values?')) return;
    setIsSaving(true);
    const res = await resetCurrentIssueConfigToDefault();
    setIsSaving(false);
    if (res.success) {
      showFeedback('success', 'Settings reset to default reference configuration.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Title */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#0d9488] dark:text-teal-400">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Full Control Master CMS</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 dark:text-slate-100">
              Current Issue Page Management
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-serif max-w-2xl leading-relaxed">
              Dynamically control every visual, textual, download, and article element of the public Current Issue page. Zero hardcoded content: all public information is drawn directly from your saved administrative settings.
            </p>
          </div>

          {/* Workflow Action Controls */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-slate-800 dark:text-slate-200 text-xs font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
              title="Save changes to draft without updating the public site"
            >
              <Save className="w-3.5 h-3.5 text-amber-600" />
              <span>Save Draft</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPreviewModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/50 dark:hover:bg-sky-900/60 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              title="Preview exact public layout before publishing"
            >
              <Eye className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>Preview Page</span>
            </button>

            <button
              type="button"
              onClick={handlePublishLive}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              title="Commit all staged changes to the live public Current Issue page"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Publish Live</span>
            </button>

            <button
              type="button"
              onClick={handleUnpublish}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 text-slate-700 dark:text-slate-300 text-xs font-medium cursor-pointer"
              title="Revert Current Issue to draft status"
            >
              <span>Unpublish</span>
            </button>

            <button
              type="button"
              onClick={handleArchiveCurrent}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 text-amber-900 dark:text-amber-200 text-xs font-medium cursor-pointer"
              title="Move this issue to Archives"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Archive Issue</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedbackMessage && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 p-3 rounded-xl border flex items-center gap-2 text-xs font-serif ${
              feedbackMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
            }`}
          >
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            )}
            <span>{feedbackMessage.text}</span>
          </motion.div>
        )}

        {/* Status Bar */}
        <div className="mt-4 pt-4 border-t border-stone-200/80 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
              <span className={`w-2.5 h-2.5 rounded-full ${localConfig.status === 'published' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span>Status: <strong className="uppercase">{localConfig.status}</strong></span>
            </span>
            {currentIssue && (
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-stone-800 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                Vol. {currentIssue.volumeNumber}, No. {currentIssue.issueNumber} ({currentIssue.year})
              </span>
            )}
            <span className="text-slate-500 font-serif">
              {currentIssueArticles.length} published paper(s) in TOC
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab('current');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-sky-700 dark:text-sky-400 hover:underline font-semibold flex items-center gap-1 text-xs cursor-pointer"
            >
              <span>View Public Page</span>
              <ExternalLink className="w-3 h-3" />
            </button>
            <span className="text-stone-300 dark:text-stone-700">|</span>
            <button
              type="button"
              onClick={handleResetToDefault}
              className="text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 text-xs cursor-pointer"
              title="Reset all visual layout parameters to baseline"
            >
              Reset Layout Defaults
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs for CMS Sections (A through H) */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-stone-200 dark:border-stone-800 text-xs font-semibold">
        {[
          { id: 'header', label: 'A. Journal Header' },
          { id: 'issue', label: 'B. Issue Details' },
          { id: 'downloads', label: 'C. Downloads (Front/TOC/Certs)' },
          { id: 'articles', label: 'D. Article Table Management' },
          { id: 'table', label: 'E. Table Design & Columns' },
          { id: 'buttons', label: 'F. Download Buttons' },
          { id: 'footer', label: 'G. Footer Content' },
          { id: 'appearance', label: 'H. Page Appearance & Colors' }
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveSection(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl shrink-0 transition-colors cursor-pointer ${
              activeSection === tab.id
                ? 'bg-[#0d9488] text-white shadow-xs'
                : 'bg-white dark:bg-stone-900 text-slate-600 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200/80 dark:border-stone-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SECTION A: JOURNAL HEADER MANAGEMENT */}
      {activeSection === 'header' && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 p-6 space-y-5">
          <div className="border-b border-stone-200 dark:border-stone-800 pb-3">
            <h3 className="font-serif font-bold text-base text-slate-900 dark:text-slate-100">
              Section A: Journal Header &amp; Crest Controls
            </h3>
            <p className="text-xs text-slate-500 font-serif">
              Configure the top masthead, circular logo, acronym, journal name, and official ISSNs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-serif">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Official Logo URL or Asset Path
              </label>
              <input
                type="text"
                value={localConfig.header.logoUrl || ''}
                onChange={e => setLocalConfig({
                  ...localConfig,
                  header: { ...localConfig.header, logoUrl: e.target.value }
                })}
                placeholder="/assets/chssh_logo.jpg or https://..."
                className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-slate-100"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Leave empty or use the official circular teal CHSSH emblem.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Logo Size
                </label>
                <select
                  value={localConfig.header.logoSize || 'md'}
                  onChange={e => setLocalConfig({
                    ...localConfig,
                    header: { ...localConfig.header, logoSize: e.target.value as any }
                  })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-slate-100"
                >
                  <option value="sm">Small (40px)</option>
                  <option value="md">Standard (64px)</option>
                  <option value="lg">Large (88px)</option>
                  <option value="xl">Extra Large (120px)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Logo Alignment
                </label>
                <select
                  value={localConfig.header.logoAlignment || 'center'}
                  onChange={e => setLocalConfig({
                    ...localConfig,
                    header: { ...localConfig.header, logoAlignment: e.target.value as any }
                  })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-slate-100"
                >
                  <option value="center">Centered Masthead</option>
                  <option value="left">Left Aligned</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Journal Abbreviation *
              </label>
              <input
                type="text"
                value={localConfig.header.abbreviation}
                onChange={e => setLocalConfig({
                  ...localConfig,
                  header: { ...localConfig.header, abbreviation: e.target.value }
                })}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-slate-100 font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Journal Tagline *
              </label>
              <input
                type="text"
                value={localConfig.header.tagline}
                onChange={e => setLocalConfig({
                  ...localConfig,
                  header: { ...localConfig.header, tagline: e.target.value }
                })}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Full Journal Name *
              </label>
              <input
                type="text"
                value={localConfig.header.fullName}
                onChange={e => setLocalConfig({
                  ...localConfig,
                  header: { ...localConfig.header, fullName: e.target.value }
                })}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-slate-100 font-bold text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 md:col-span-2">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  ISSN (Online)
                </label>
                <input
                  type="text"
                  value={localConfig.header.issnOnline}
                  onChange={e => setLocalConfig({
                    ...localConfig,
                    header: { ...localConfig.header, issnOnline: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  ISSN (Print)
                </label>
                <input
                  type="text"
                  value={localConfig.header.issnPrint}
                  onChange={e => setLocalConfig({
                    ...localConfig,
                    header: { ...localConfig.header, issnPrint: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-slate-100 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 md:col-span-2">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Header Background Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={localConfig.header.headerBgColor || '#ffffff'}
                    onChange={e => setLocalConfig({
                      ...localConfig,
                      header: { ...localConfig.header, headerBgColor: e.target.value }
                    })}
                    className="w-8 h-8 rounded border border-stone-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={localConfig.header.headerBgColor || '#ffffff'}
                    onChange={e => setLocalConfig({
                      ...localConfig,
                      header: { ...localConfig.header, headerBgColor: e.target.value }
                    })}
                    className="flex-1 px-2 py-1.5 rounded border border-stone-300 dark:border-stone-700 font-mono text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Header Text Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={localConfig.header.headerTextColor || '#0f172a'}
                    onChange={e => setLocalConfig({
                      ...localConfig,
                      header: { ...localConfig.header, headerTextColor: e.target.value }
                    })}
                    className="w-8 h-8 rounded border border-stone-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={localConfig.header.headerTextColor || '#0f172a'}
                    onChange={e => setLocalConfig({
                      ...localConfig,
                      header: { ...localConfig.header, headerTextColor: e.target.value }
                    })}
                    className="flex-1 px-2 py-1.5 rounded border border-stone-300 dark:border-stone-700 font-mono text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Masthead Spacing
                </label>
                <select
                  value={localConfig.header.headerSpacing || 'normal'}
                  onChange={e => setLocalConfig({
                    ...localConfig,
                    header: { ...localConfig.header, headerSpacing: e.target.value as any }
                  })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-slate-100"
                >
                  <option value="compact">Compact</option>
                  <option value="normal">Normal</option>
                  <option value="spacious">Spacious</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION B: ISSUE MANAGEMENT */}
      {activeSection === 'issue' && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 p-6 space-y-5">
          <div className="border-b border-stone-200 dark:border-stone-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-base text-slate-900 dark:text-slate-100">
                Section B: Issue Identification &amp; Designations
              </h3>
              <p className="text-xs text-slate-500 font-serif">
                Manage volume number, issue number, publication month/year, and designate the active Current Issue.
              </p>
            </div>
            {currentIssue && (
              <button
                type="button"
                onClick={handleOpenEditCurrentIssue}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#102344] text-white text-xs font-semibold cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Issue Details</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-serif">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Designated Current Issue Switcher
              </label>
              <select
                value={currentIssue?.id || ''}
                onChange={async e => {
                  const targetId = e.target.value;
                  if (!targetId || targetId === currentIssue?.id) return;
                  const res = await designateCurrentIssue(targetId);
                  if (res.success) {
                    showFeedback('success', 'Switched active Current Issue successfully!');
                  }
                }}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-slate-100 font-semibold"
              >
                {issues.map(iss => (
                  <option key={iss.id} value={iss.id}>
                    Vol. {iss.volumeNumber}, No. {iss.issueNumber} ({iss.year}) - {iss.title} {iss.isCurrent ? '★ [CURRENT]' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Heading Title on Page *
              </label>
              <input
                type="text"
                value={localConfig.headingTitle}
                onChange={e => setLocalConfig({ ...localConfig, headingTitle: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-slate-100 font-bold"
              />
            </div>

            {currentIssue && (
              <div className="md:col-span-2 p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Live Issue Summary:
                  </span>
                  <span className="text-[11px] font-mono text-[#0d9488] font-bold">
                    Vol. {currentIssue.volumeNumber} • Issue {currentIssue.issueNumber} • Month: {currentIssue.publicationMonth || 'September'} • Year: {currentIssue.year}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                  "{currentIssue.title}" — Published on {currentIssue.publicationDate}
                </p>
                {currentIssue.tableOfContentsSummary && (
                  <p className="text-[11px] text-slate-500">
                    {currentIssue.tableOfContentsSummary}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION C: DOWNLOAD MANAGEMENT */}
      {activeSection === 'downloads' && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 p-6 space-y-5">
          <div className="border-b border-stone-200 dark:border-stone-800 pb-3">
            <h3 className="font-serif font-bold text-base text-slate-900 dark:text-slate-100">
              Section C: Download Documents Management
            </h3>
            <p className="text-xs text-slate-500 font-serif">
              Upload or link authentic PDFs (Google Drive or direct URLs) for the Front Page, Table of Contents, and Certificates.
            </p>
          </div>

          <div className="space-y-4 text-xs font-serif">
            {/* Front Page PDF */}
            <div className="p-4 rounded-xl border border-teal-200 dark:border-teal-900/60 bg-teal-50/30 dark:bg-teal-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#0d9488]" />
                  <span className="font-bold text-slate-800 dark:text-slate-200">1. Front Page PDF Document</span>
                </div>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localConfig.downloads.frontPageVisible}
                    onChange={e => setLocalConfig({
                      ...localConfig,
                      downloads: { ...localConfig.downloads, frontPageVisible: e.target.checked }
                    })}
                    className="rounded text-teal-600"
                  />
                  <span>Show Button</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Button Label
                  </label>
                  <input
                    type="text"
                    value={localConfig.downloads.frontPageLabel}
                    onChange={e => setLocalConfig({
                      ...localConfig,
                      downloads: { ...localConfig.downloads, frontPageLabel: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Front Page Document URL (Google Drive or PDF URL)
                  </label>
                  <input
                    type="text"
                    value={localConfig.downloads.frontPagePdfUrl || currentIssue?.frontPagePdfUrl || ''}
                    onChange={e => setLocalConfig({
                      ...localConfig,
                      downloads: { ...localConfig.downloads, frontPagePdfUrl: e.target.value }
                    })}
                    placeholder="https://drive.google.com/..."
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                  />
                </div>
              </div>
            </div>

            {/* Table of Contents PDF */}
            <div className="p-4 rounded-xl border border-sky-200 dark:border-sky-900/60 bg-sky-50/30 dark:bg-sky-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#1e3a8a]" />
                  <span className="font-bold text-slate-800 dark:text-slate-200">2. Table of Contents PDF Document</span>
                </div>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localConfig.downloads.tocVisible}
                    onChange={e => setLocalConfig({
                      ...localConfig,
                      downloads: { ...localConfig.downloads, tocVisible: e.target.checked }
                    })}
                    className="rounded text-sky-600"
                  />
                  <span>Show Button</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Button Label
                  </label>
                  <input
                    type="text"
                    value={localConfig.downloads.tocLabel}
                    onChange={e => setLocalConfig({
                      ...localConfig,
                      downloads: { ...localConfig.downloads, tocLabel: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Table of Contents URL (Google Drive or PDF URL)
                  </label>
                  <input
                    type="text"
                    value={localConfig.downloads.tocPdfUrl || currentIssue?.tocPdfUrl || ''}
                    onChange={e => setLocalConfig({
                      ...localConfig,
                      downloads: { ...localConfig.downloads, tocPdfUrl: e.target.value }
                    })}
                    placeholder="https://drive.google.com/..."
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                  />
                </div>
              </div>
            </div>

            {/* Certificates PDF */}
            <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span className="font-bold text-slate-800 dark:text-slate-200">3. Certificates PDF Document</span>
                </div>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localConfig.downloads.certificatesVisible}
                    onChange={e => setLocalConfig({
                      ...localConfig,
                      downloads: { ...localConfig.downloads, certificatesVisible: e.target.checked }
                    })}
                    className="rounded text-amber-600"
                  />
                  <span>Show Button</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Button Label
                  </label>
                  <input
                    type="text"
                    value={localConfig.downloads.certificatesLabel}
                    onChange={e => setLocalConfig({
                      ...localConfig,
                      downloads: { ...localConfig.downloads, certificatesLabel: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Certificates Document URL (Google Drive or PDF URL)
                  </label>
                  <input
                    type="text"
                    value={localConfig.downloads.certificatesPdfUrl || currentIssue?.certificatesPdfUrl || ''}
                    onChange={e => setLocalConfig({
                      ...localConfig,
                      downloads: { ...localConfig.downloads, certificatesPdfUrl: e.target.value }
                    })}
                    placeholder="https://drive.google.com/..."
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION D: ARTICLE TABLE MANAGEMENT */}
      {activeSection === 'articles' && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 p-6 space-y-5">
          <div className="border-b border-stone-200 dark:border-stone-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-serif font-bold text-base text-slate-900 dark:text-slate-100">
                Section D: Article Management &amp; Table of Contents
              </h3>
              <p className="text-xs text-slate-500 font-serif">
                Manage papers published in the Current Issue. S.No is derived directly from the administrator's saved sequence.
              </p>
            </div>

            {/* Add article from candidate pool */}
            {candidateArticles.length > 0 && currentIssue && (
              <div className="flex items-center gap-2">
                <select
                  id="addArticleSelect"
                  className="px-3 py-1.5 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 max-w-xs"
                >
                  <option value="">Select paper to add...</option>
                  {candidateArticles.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.title.substring(0, 45)}... ({a.authors[0]?.name})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={async () => {
                    const el = document.getElementById('addArticleSelect') as HTMLSelectElement;
                    if (!el || !el.value) return;
                    await addArticleToIssue(currentIssue.id, el.value);
                    el.value = '';
                    showFeedback('success', 'Paper added to Current Issue Table of Contents!');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#0d9488] text-white text-xs font-semibold cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 inline mr-1" />
                  <span>Add to Issue</span>
                </button>
              </div>
            )}
          </div>

          {currentIssueArticles.length === 0 ? (
            <div className="p-8 text-center rounded-xl border border-dashed border-stone-300 dark:border-stone-700 space-y-2">
              <BookOpen className="w-8 h-8 text-stone-400 mx-auto" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                No articles currently assigned to this issue.
              </p>
              <p className="text-xs text-slate-500 font-serif">
                Add manuscripts from your published or accepted pool above.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {currentIssueArticles.map((art, idx) => (
                <div
                  key={art.id}
                  className="p-3.5 bg-stone-50 dark:bg-stone-800/40 rounded-xl border border-stone-200 dark:border-stone-700 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <span className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-900/40 text-teal-900 dark:text-teal-300 flex items-center justify-center font-mono font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <div className="space-y-1">
                      <h4 className="font-serif font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                        {art.title}
                      </h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 font-serif">
                        By: <strong className="text-slate-800 dark:text-slate-200">{art.authors.map(a => a.name).join(', ')}</strong> • Pages: {art.pageStart && art.pageEnd ? `${art.pageStart}–${art.pageEnd}` : art.pages || 'N/A'} • ID: {art.trackingId}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 pt-0.5">
                        {art.doi && <ArticleDoiBadge doi={art.doi} size="sm" />}
                        {art.driveUrl && (
                          <span className="text-[10px] text-sky-700 dark:text-sky-300 flex items-center gap-1 font-mono">
                            <ExternalLink className="w-2.5 h-2.5" /> Google Drive Linked
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                          {art.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Reordering */}
                  <div className="flex items-center gap-1.5 self-end md:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => handleMoveArticleOrder(art.id, 'up')}
                      disabled={idx === 0}
                      className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white disabled:opacity-30 rounded hover:bg-stone-200 dark:hover:bg-stone-700 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveArticleOrder(art.id, 'down')}
                      disabled={idx === currentIssueArticles.length - 1}
                      className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white disabled:opacity-30 rounded hover:bg-stone-200 dark:hover:bg-stone-700 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEditArticle(art)}
                      className="px-2.5 py-1.5 rounded-lg bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 text-slate-800 dark:text-slate-200 text-xs font-semibold cursor-pointer"
                      title="Edit article metadata, pages, DOI, Drive link"
                    >
                      <Edit3 className="w-3 h-3 inline mr-1" />
                      <span>Edit</span>
                    </button>
                    {currentIssue && (
                      <button
                        type="button"
                        onClick={async () => {
                          if (window.confirm(`Remove "${art.title.substring(0, 40)}..." from Current Issue? The article record will remain intact in manuscripts.`)) {
                            await removeArticleFromIssue(currentIssue.id, art.id);
                            showFeedback('success', 'Article detached from Current Issue.');
                          }
                        }}
                        className="p-1.5 text-rose-500 hover:text-rose-700 rounded cursor-pointer"
                        title="Remove from issue"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION E: TABLE DESIGN & COLUMNS */}
      {activeSection === 'table' && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 p-6 space-y-5">
          <div className="border-b border-stone-200 dark:border-stone-800 pb-3">
            <h3 className="font-serif font-bold text-base text-slate-900 dark:text-slate-100">
              Section E: Article Table Design &amp; Column Customization
            </h3>
            <p className="text-xs text-slate-500 font-serif">
              Customize table column headings, column widths, visibility, colors, font styling, and padding.
            </p>
          </div>

          <div className="space-y-4 text-xs font-serif">
            {/* Columns Configuration Table */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-2">
                Table Columns &amp; Labels
              </label>
              <div className="space-y-2">
                {localConfig.tableDesign.columns.map((col, cIdx) => (
                  <div
                    key={col.id}
                    className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-700 flex flex-wrap items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={col.visible}
                        onChange={e => {
                          const updated = [...localConfig.tableDesign.columns];
                          updated[cIdx] = { ...col, visible: e.target.checked };
                          setLocalConfig({
                            ...localConfig,
                            tableDesign: { ...localConfig.tableDesign, columns: updated }
                          });
                        }}
                        className="rounded text-teal-600"
                      />
                      <span className="font-mono text-slate-500 uppercase font-semibold">[{col.id}]</span>
                    </div>

                    <div className="flex-1 min-w-48">
                      <input
                        type="text"
                        value={col.label}
                        onChange={e => {
                          const updated = [...localConfig.tableDesign.columns];
                          updated[cIdx] = { ...col, label: e.target.value };
                          setLocalConfig({
                            ...localConfig,
                            tableDesign: { ...localConfig.tableDesign, columns: updated }
                          });
                        }}
                        className="w-full px-2.5 py-1.5 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-semibold"
                        placeholder="Column label..."
                      />
                    </div>

                    <div className="w-24">
                      <input
                        type="text"
                        value={col.width || ''}
                        onChange={e => {
                          const updated = [...localConfig.tableDesign.columns];
                          updated[cIdx] = { ...col, width: e.target.value };
                          setLocalConfig({
                            ...localConfig,
                            tableDesign: { ...localConfig.tableDesign, columns: updated }
                          });
                        }}
                        placeholder="e.g. 15%"
                        className="w-full px-2 py-1.5 rounded border border-stone-300 dark:border-stone-700 text-center font-mono"
                      />
                    </div>

                    <div>
                      <select
                        value={col.align || 'left'}
                        onChange={e => {
                          const updated = [...localConfig.tableDesign.columns];
                          updated[cIdx] = { ...col, align: e.target.value as any };
                          setLocalConfig({
                            ...localConfig,
                            tableDesign: { ...localConfig.tableDesign, columns: updated }
                          });
                        }}
                        className="px-2 py-1.5 rounded border border-stone-300 dark:border-stone-700"
                      >
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Colors & Typography Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Header Bg Color
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={localConfig.tableDesign.headerBgColor || '#0d9488'}
                    onChange={e => setLocalConfig({
                      ...localConfig,
                      tableDesign: { ...localConfig.tableDesign, headerBgColor: e.target.value }
                    })}
                    className="w-7 h-7 rounded border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={localConfig.tableDesign.headerBgColor || '#0d9488'}
                    onChange={e => setLocalConfig({
                      ...localConfig,
                      tableDesign: { ...localConfig.tableDesign, headerBgColor: e.target.value }
                    })}
                    className="w-full px-2 py-1 text-[11px] font-mono border rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Header Text Color
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={localConfig.tableDesign.headerTextColor || '#ffffff'}
                    onChange={e => setLocalConfig({
                      ...localConfig,
                      tableDesign: { ...localConfig.tableDesign, headerTextColor: e.target.value }
                    })}
                    className="w-7 h-7 rounded border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={localConfig.tableDesign.headerTextColor || '#ffffff'}
                    onChange={e => setLocalConfig({
                      ...localConfig,
                      tableDesign: { ...localConfig.tableDesign, headerTextColor: e.target.value }
                    })}
                    className="w-full px-2 py-1 text-[11px] font-mono border rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Row Bg Color
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={localConfig.tableDesign.rowBgColor || '#ffffff'}
                    onChange={e => setLocalConfig({
                      ...localConfig,
                      tableDesign: { ...localConfig.tableDesign, rowBgColor: e.target.value }
                    })}
                    className="w-7 h-7 rounded border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={localConfig.tableDesign.rowBgColor || '#ffffff'}
                    onChange={e => setLocalConfig({
                      ...localConfig,
                      tableDesign: { ...localConfig.tableDesign, rowBgColor: e.target.value }
                    })}
                    className="w-full px-2 py-1 text-[11px] font-mono border rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Alt Row Bg Color
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={localConfig.tableDesign.rowAltBgColor || '#f8fafc'}
                    onChange={e => setLocalConfig({
                      ...localConfig,
                      tableDesign: { ...localConfig.tableDesign, rowAltBgColor: e.target.value }
                    })}
                    className="w-7 h-7 rounded border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={localConfig.tableDesign.rowAltBgColor || '#f8fafc'}
                    onChange={e => setLocalConfig({
                      ...localConfig,
                      tableDesign: { ...localConfig.tableDesign, rowAltBgColor: e.target.value }
                    })}
                    className="w-full px-2 py-1 text-[11px] font-mono border rounded"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Font Family
                </label>
                <select
                  value={localConfig.tableDesign.fontFamily || 'serif'}
                  onChange={e => setLocalConfig({
                    ...localConfig,
                    tableDesign: { ...localConfig.tableDesign, fontFamily: e.target.value as any }
                  })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                >
                  <option value="serif">Academic Serif (Classic)</option>
                  <option value="sans">Clean Sans-Serif</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Font Size
                </label>
                <select
                  value={localConfig.tableDesign.fontSize || 'sm'}
                  onChange={e => setLocalConfig({
                    ...localConfig,
                    tableDesign: { ...localConfig.tableDesign, fontSize: e.target.value as any }
                  })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                >
                  <option value="xs">Compact (xs)</option>
                  <option value="sm">Standard (sm)</option>
                  <option value="md">Spacious (md)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Cell Padding
                </label>
                <select
                  value={localConfig.tableDesign.cellPadding || 'normal'}
                  onChange={e => setLocalConfig({
                    ...localConfig,
                    tableDesign: { ...localConfig.tableDesign, cellPadding: e.target.value as any }
                  })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                >
                  <option value="compact">Compact</option>
                  <option value="normal">Normal</option>
                  <option value="relaxed">Relaxed</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION F: DOWNLOAD BUTTONS MANAGEMENT */}
      {activeSection === 'buttons' && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 p-6 space-y-5">
          <div className="border-b border-stone-200 dark:border-stone-800 pb-3">
            <h3 className="font-serif font-bold text-base text-slate-900 dark:text-slate-100">
              Section F: Download Buttons Styling
            </h3>
            <p className="text-xs text-slate-500 font-serif">
              Fine-tune the colors, size, and layout alignment of the three primary download buttons.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-serif">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Button Row Alignment
              </label>
              <select
                value={localConfig.downloads.buttonAlignment || 'center'}
                onChange={e => setLocalConfig({
                  ...localConfig,
                  downloads: { ...localConfig.downloads, buttonAlignment: e.target.value as any }
                })}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
              >
                <option value="center">Center</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Button Size
              </label>
              <select
                value={localConfig.downloads.buttonSize || 'md'}
                onChange={e => setLocalConfig({
                  ...localConfig,
                  downloads: { ...localConfig.downloads, buttonSize: e.target.value as any }
                })}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
              >
                <option value="sm">Small</option>
                <option value="md">Standard (md)</option>
                <option value="lg">Large</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Front Page Button Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={localConfig.downloads.frontPageBgColor || '#0d9488'}
                  onChange={e => setLocalConfig({
                    ...localConfig,
                    downloads: { ...localConfig.downloads, frontPageBgColor: e.target.value }
                  })}
                  className="w-8 h-8 rounded border cursor-pointer"
                />
                <input
                  type="text"
                  value={localConfig.downloads.frontPageBgColor || '#0d9488'}
                  onChange={e => setLocalConfig({
                    ...localConfig,
                    downloads: { ...localConfig.downloads, frontPageBgColor: e.target.value }
                  })}
                  className="flex-1 px-2.5 py-1.5 rounded border border-stone-300 dark:border-stone-700 font-mono text-[11px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                TOC Button Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={localConfig.downloads.tocBgColor || '#1e3a8a'}
                  onChange={e => setLocalConfig({
                    ...localConfig,
                    downloads: { ...localConfig.downloads, tocBgColor: e.target.value }
                  })}
                  className="w-8 h-8 rounded border cursor-pointer"
                />
                <input
                  type="text"
                  value={localConfig.downloads.tocBgColor || '#1e3a8a'}
                  onChange={e => setLocalConfig({
                    ...localConfig,
                    downloads: { ...localConfig.downloads, tocBgColor: e.target.value }
                  })}
                  className="flex-1 px-2.5 py-1.5 rounded border border-stone-300 dark:border-stone-700 font-mono text-[11px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Certificates Button Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={localConfig.downloads.certificatesBgColor || '#d97706'}
                  onChange={e => setLocalConfig({
                    ...localConfig,
                    downloads: { ...localConfig.downloads, certificatesBgColor: e.target.value }
                  })}
                  className="w-8 h-8 rounded border cursor-pointer"
                />
                <input
                  type="text"
                  value={localConfig.downloads.certificatesBgColor || '#d97706'}
                  onChange={e => setLocalConfig({
                    ...localConfig,
                    downloads: { ...localConfig.downloads, certificatesBgColor: e.target.value }
                  })}
                  className="flex-1 px-2.5 py-1.5 rounded border border-stone-300 dark:border-stone-700 font-mono text-[11px]"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION G: FOOTER MANAGEMENT */}
      {activeSection === 'footer' && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 p-6 space-y-5">
          <div className="border-b border-stone-200 dark:border-stone-800 pb-3">
            <h3 className="font-serif font-bold text-base text-slate-900 dark:text-slate-100">
              Section G: Footer Message &amp; Decorative Elements
            </h3>
            <p className="text-xs text-slate-500 font-serif">
              Configure the academic repository copyright notice, alignment, and decorative dividing lines.
            </p>
          </div>

          <div className="space-y-4 text-xs font-serif">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Footer Message *
              </label>
              <textarea
                rows={2}
                value={localConfig.footer.message}
                onChange={e => setLocalConfig({
                  ...localConfig,
                  footer: { ...localConfig.footer, message: e.target.value }
                })}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Text Alignment
                </label>
                <select
                  value={localConfig.footer.alignment || 'center'}
                  onChange={e => setLocalConfig({
                    ...localConfig,
                    footer: { ...localConfig.footer, alignment: e.target.value as any }
                  })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                >
                  <option value="center">Centered</option>
                  <option value="left">Left Aligned</option>
                  <option value="right">Right Aligned</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Font Size
                </label>
                <select
                  value={localConfig.footer.fontSize || 'xs'}
                  onChange={e => setLocalConfig({
                    ...localConfig,
                    footer: { ...localConfig.footer, fontSize: e.target.value as any }
                  })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                >
                  <option value="xs">Extra Small (xs)</option>
                  <option value="sm">Small (sm)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Decorative Elements
                </label>
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localConfig.footer.showDecorativeLines}
                    onChange={e => setLocalConfig({
                      ...localConfig,
                      footer: { ...localConfig.footer, showDecorativeLines: e.target.checked }
                    })}
                    className="rounded text-teal-600"
                  />
                  <span>Show Decorative Divider Lines</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION H: PAGE APPEARANCE MANAGEMENT */}
      {activeSection === 'appearance' && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 p-6 space-y-5">
          <div className="border-b border-stone-200 dark:border-stone-800 pb-3">
            <h3 className="font-serif font-bold text-base text-slate-900 dark:text-slate-100">
              Section H: Complete Page Appearance &amp; Palette Accents
            </h3>
            <p className="text-xs text-slate-500 font-serif">
              Adjust primary teal, secondary navy, and gold accent tones alongside container width and empty-state messaging.
            </p>
          </div>

          <div className="space-y-4 text-xs font-serif">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Background Color
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={localConfig.pageAppearance.bgColor || '#ffffff'}
                    onChange={e => setLocalConfig({
                      ...localConfig,
                      pageAppearance: { ...localConfig.pageAppearance, bgColor: e.target.value }
                    })}
                    className="w-7 h-7 rounded border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={localConfig.pageAppearance.bgColor || '#ffffff'}
                    onChange={e => setLocalConfig({
                      ...localConfig,
                      pageAppearance: { ...localConfig.pageAppearance, bgColor: e.target.value }
                    })}
                    className="w-full px-2 py-1 text-[11px] font-mono border rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Primary Color (Teal)
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={localConfig.pageAppearance.primaryColor || '#0d9488'}
                    onChange={e => setLocalConfig({
                      ...localConfig,
                      pageAppearance: { ...localConfig.pageAppearance, primaryColor: e.target.value }
                    })}
                    className="w-7 h-7 rounded border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={localConfig.pageAppearance.primaryColor || '#0d9488'}
                    onChange={e => setLocalConfig({
                      ...localConfig,
                      pageAppearance: { ...localConfig.pageAppearance, primaryColor: e.target.value }
                    })}
                    className="w-full px-2 py-1 text-[11px] font-mono border rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Secondary Color (Navy)
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={localConfig.pageAppearance.secondaryColor || '#102344'}
                    onChange={e => setLocalConfig({
                      ...localConfig,
                      pageAppearance: { ...localConfig.pageAppearance, secondaryColor: e.target.value }
                    })}
                    className="w-7 h-7 rounded border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={localConfig.pageAppearance.secondaryColor || '#102344'}
                    onChange={e => setLocalConfig({
                      ...localConfig,
                      pageAppearance: { ...localConfig.pageAppearance, secondaryColor: e.target.value }
                    })}
                    className="w-full px-2 py-1 text-[11px] font-mono border rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Accent Color (Gold)
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={localConfig.pageAppearance.accentColor || '#d97706'}
                    onChange={e => setLocalConfig({
                      ...localConfig,
                      pageAppearance: { ...localConfig.pageAppearance, accentColor: e.target.value }
                    })}
                    className="w-7 h-7 rounded border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={localConfig.pageAppearance.accentColor || '#d97706'}
                    onChange={e => setLocalConfig({
                      ...localConfig,
                      pageAppearance: { ...localConfig.pageAppearance, accentColor: e.target.value }
                    })}
                    className="w-full px-2 py-1 text-[11px] font-mono border rounded"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Container Width
                </label>
                <select
                  value={localConfig.pageAppearance.containerWidth || 'max-w-6xl'}
                  onChange={e => setLocalConfig({
                    ...localConfig,
                    pageAppearance: { ...localConfig.pageAppearance, containerWidth: e.target.value as any }
                  })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                >
                  <option value="max-w-5xl">Medium (max-w-5xl)</option>
                  <option value="max-w-6xl">Standard (max-w-6xl)</option>
                  <option value="max-w-7xl">Wide (max-w-7xl)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Section Vertical Spacing
                </label>
                <select
                  value={localConfig.pageAppearance.spacing || 'normal'}
                  onChange={e => setLocalConfig({
                    ...localConfig,
                    pageAppearance: { ...localConfig.pageAppearance, spacing: e.target.value as any }
                  })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                >
                  <option value="compact">Compact (space-y-4)</option>
                  <option value="normal">Normal (space-y-6)</option>
                  <option value="relaxed">Relaxed (space-y-8)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Configurable Empty-State Message (When No Articles Published) *
              </label>
              <textarea
                rows={2}
                value={localConfig.pageAppearance.emptyStateMessage}
                onChange={e => setLocalConfig({
                  ...localConfig,
                  pageAppearance: { ...localConfig.pageAppearance, emptyStateMessage: e.target.value }
                })}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Strict No-Autogeneration Rule: When no articles are published, this message is displayed to readers. Fake or sample papers are never rendered.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ARTICLE EDIT MODAL */}
      <AnimatePresence>
        {isArticleModalOpen && editingArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-stone-900 rounded-2xl max-w-2xl w-full p-6 space-y-4 border border-stone-200 dark:border-stone-800 shadow-xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
                <h3 className="font-serif font-bold text-base text-slate-900 dark:text-slate-100">
                  Edit Article Details (TOC Entry)
                </h3>
                <button
                  type="button"
                  onClick={() => setIsArticleModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveArticleDetails} className="space-y-3.5 text-xs font-serif">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Paper Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={artTitle}
                    onChange={e => setArtTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Authors (comma-separated) *
                  </label>
                  <input
                    type="text"
                    required
                    value={artAuthors}
                    onChange={e => setArtAuthors(e.target.value)}
                    placeholder="e.g. Dr. Jane Doe, Dr. John Smith"
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Page Start
                    </label>
                    <input
                      type="text"
                      value={artPageStart}
                      onChange={e => setArtPageStart(e.target.value)}
                      placeholder="e.g. 74"
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Page End
                    </label>
                    <input
                      type="text"
                      value={artPageEnd}
                      onChange={e => setArtPageEnd(e.target.value)}
                      placeholder="e.g. 96"
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Google Drive PDF URL
                  </label>
                  <input
                    type="text"
                    value={artDriveUrl}
                    onChange={e => setArtDriveUrl(e.target.value)}
                    placeholder="https://drive.google.com/file/d/..."
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      DOI
                    </label>
                    <input
                      type="text"
                      value={artDoi}
                      onChange={e => setArtDoi(e.target.value)}
                      placeholder="10.5281/chssh.2026.xxxx"
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Publication Status
                    </label>
                    <select
                      value={artStatus}
                      onChange={e => setArtStatus(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-semibold"
                    >
                      <option value="published">Published (Visible on Current Issue)</option>
                      <option value="accepted">Accepted (Draft)</option>
                      <option value="under_review">Under Review</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Abstract
                  </label>
                  <textarea
                    rows={3}
                    value={artAbstract}
                    onChange={e => setArtAbstract(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
                  <button
                    type="button"
                    onClick={() => setIsArticleModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#0d9488] hover:bg-teal-700 text-white font-semibold cursor-pointer"
                  >
                    Save Article Details
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ISSUE EDIT MODAL */}
      <AnimatePresence>
        {isIssueModalOpen && currentIssue && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-stone-900 rounded-2xl max-w-xl w-full p-6 space-y-4 border border-stone-200 dark:border-stone-800 shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
                <h3 className="font-serif font-bold text-base text-slate-900 dark:text-slate-100">
                  Edit Current Issue Specifications
                </h3>
                <button
                  type="button"
                  onClick={() => setIsIssueModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveIssueDetails} className="space-y-3.5 text-xs font-serif">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Volume Number *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={issueVolNum}
                      onChange={e => setIssueVolNum(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Issue Number *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={issueNum}
                      onChange={e => setIssueNum(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Publication Month *
                    </label>
                    <input
                      type="text"
                      required
                      value={issueMonth}
                      onChange={e => setIssueMonth(e.target.value)}
                      placeholder="e.g. September"
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Publication Year *
                    </label>
                    <input
                      type="number"
                      required
                      min={2020}
                      max={2035}
                      value={issueYear}
                      onChange={e => setIssueYear(parseInt(e.target.value) || new Date().getFullYear())}
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Issue Title / Theme *
                  </label>
                  <input
                    type="text"
                    required
                    value={issueTitle}
                    onChange={e => setIssueTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Official Publication Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={issuePubDate}
                    onChange={e => setIssuePubDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Table of Contents Summary / Editorial Scope
                  </label>
                  <textarea
                    rows={2}
                    value={issueDesc}
                    onChange={e => setIssueDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
                  <button
                    type="button"
                    onClick={() => setIsIssueModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#102344] text-white font-semibold cursor-pointer"
                  >
                    Save Issue Specifications
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FULL-FIDELITY PREVIEW MODAL */}
      <AnimatePresence>
        {isPreviewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-stone-900 rounded-2xl max-w-5xl w-full h-[92vh] flex flex-col border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden"
            >
              {/* Preview Top Header Bar */}
              <div className="px-5 py-3.5 bg-stone-100 dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#0d9488]" />
                  <span className="font-serif font-bold text-sm text-slate-900 dark:text-slate-100">
                    Live Layout Preview (Full-Fidelity Public View)
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-teal-100 text-teal-800 font-semibold uppercase">
                    Draft Preview
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPreviewModalOpen(false);
                      handlePublishLive();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition cursor-pointer"
                  >
                    Publish This Layout Now
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPreviewModalOpen(false)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Scrollable Preview Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-stone-50 dark:bg-stone-950">
                <div className="max-w-5xl mx-auto shadow-md rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800">
                  <CurrentIssue previewConfig={localConfig} />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
