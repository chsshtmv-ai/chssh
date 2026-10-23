import React, { useState } from 'react';
import { useJournal } from '../../context/JournalContext';
import { JournalVolume, JournalIssue, Article } from '../../types';
import {
  BookOpen,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Archive,
  ArrowUp,
  ArrowDown,
  Eye,
  FileText,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  X,
  Upload,
  Clock,
  ShieldAlert,
  Hash
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ArticleDoiBadge } from '../ArticleDoiBadge';

export const AdminVolumeIssueManagement: React.FC = () => {
  const {
    volumes,
    issues,
    articles,
    createVolume,
    updateVolume,
    deleteVolume,
    createIssue,
    updateIssue,
    deleteIssue,
    publishIssue,
    unpublishIssue,
    reorderArticlesInIssue,
    addArticleToIssue,
    removeArticleFromIssue,
    content,
    setActiveTab
  } = useJournal();

  // Volume Form State
  const [isVolumeModalOpen, setIsVolumeModalOpen] = useState(false);
  const [editingVolume, setEditingVolume] = useState<JournalVolume | null>(null);
  const [volNumber, setVolNumber] = useState<number>(1);
  const [volYear, setVolYear] = useState<number>(new Date().getFullYear());
  const [volTitle, setVolTitle] = useState('');
  const [volDescription, setVolDescription] = useState('');
  const [volStatus, setVolStatus] = useState<'draft' | 'published' | 'archived'>('published');
  const [volumeError, setVolumeError] = useState<string | null>(null);

  // Issue Form State
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState<JournalIssue | null>(null);
  const [selectedVolIdForIssue, setSelectedVolIdForIssue] = useState<string>('');
  const [issueNumber, setIssueNumber] = useState<number>(1);
  const [issueYear, setIssueYear] = useState<number>(new Date().getFullYear());
  const [issueTitle, setIssueTitle] = useState('');
  const [issuePubDate, setIssuePubDate] = useState(new Date().toISOString().split('T')[0]);
  const [issueTocSummary, setIssueTocSummary] = useState('');
  const [issueCoverImage, setIssueCoverImage] = useState('');
  const [issueEditorialPdfUrl, setIssueEditorialPdfUrl] = useState('');
  const [issueEditorialPdfName, setIssueEditorialPdfName] = useState('');
  const [issueStatus, setIssueStatus] = useState<'draft' | 'published' | 'archived'>('draft');
  const [issueError, setIssueError] = useState<string | null>(null);

  // Issue Article Selector State
  const [activeManagingIssueId, setActiveManagingIssueId] = useState<string | null>(null);
  const [articleToAddId, setArticleToAddId] = useState<string>('');

  // Preview Issue State
  const [previewingIssue, setPreviewingIssue] = useState<JournalIssue | null>(null);

  // Notification feedback
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  // Open Create Volume Modal
  const handleOpenCreateVolume = () => {
    const nextVolNum = volumes.length > 0 ? Math.max(...volumes.map(v => v.volumeNumber)) + 1 : 1;
    setEditingVolume(null);
    setVolNumber(nextVolNum);
    setVolYear(new Date().getFullYear());
    setVolTitle(`Volume ${nextVolNum}`);
    setVolDescription('');
    setVolStatus('published');
    setVolumeError(null);
    setIsVolumeModalOpen(true);
  };

  // Open Edit Volume Modal
  const handleOpenEditVolume = (vol: JournalVolume) => {
    setEditingVolume(vol);
    setVolNumber(vol.volumeNumber);
    setVolYear(vol.year);
    setVolTitle(vol.title || '');
    setVolDescription(vol.description || '');
    setVolStatus(vol.status);
    setVolumeError(null);
    setIsVolumeModalOpen(true);
  };

  const handleSaveVolume = async (e: React.FormEvent) => {
    e.preventDefault();
    setVolumeError(null);

    if (volNumber < 1) {
      setVolumeError('Volume number must be a positive integer.');
      return;
    }

    if (editingVolume) {
      const ok = await updateVolume(editingVolume.id, {
        volumeNumber: Number(volNumber),
        year: Number(volYear),
        title: volTitle.trim() || `Volume ${volNumber}`,
        description: volDescription.trim(),
        status: volStatus
      });
      if (ok) {
        showNotification(`Volume ${volNumber} updated successfully.`);
        setIsVolumeModalOpen(false);
      } else {
        setVolumeError('Failed to update volume.');
      }
    } else {
      const res = await createVolume({
        volumeNumber: Number(volNumber),
        year: Number(volYear),
        title: volTitle.trim() || `Volume ${volNumber}`,
        description: volDescription.trim(),
        status: volStatus
      });
      if (res.success) {
        showNotification(`Volume ${volNumber} created successfully.`);
        setIsVolumeModalOpen(false);
      } else {
        setVolumeError(res.error || 'Failed to create volume.');
      }
    }
  };

  const handleDeleteVolume = async (vol: JournalVolume) => {
    const attachedIssues = issues.filter(i => i.volumeId === vol.id || i.volumeNumber === vol.volumeNumber);
    if (attachedIssues.length > 0) {
      alert(`Cannot delete Volume ${vol.volumeNumber} because it contains ${attachedIssues.length} issue(s). Please remove or reassign the issues first.`);
      return;
    }
    if (window.confirm(`Are you sure you want to delete Volume ${vol.volumeNumber} (${vol.year})?`)) {
      await deleteVolume(vol.id);
      showNotification(`Volume ${vol.volumeNumber} deleted.`);
    }
  };

  // Open Create Issue Modal
  const handleOpenCreateIssue = (defaultVolId?: string) => {
    const parentVol = volumes.find(v => v.id === defaultVolId) || volumes[0];
    const targetVolNum = parentVol ? parentVol.volumeNumber : 1;
    const volIssues = issues.filter(i => i.volumeNumber === targetVolNum);
    const nextIssueNum = volIssues.length > 0 ? Math.max(...volIssues.map(i => i.issueNumber)) + 1 : 1;

    setEditingIssue(null);
    setSelectedVolIdForIssue(parentVol ? parentVol.id : (volumes[0]?.id || 'vol-1'));
    setIssueNumber(nextIssueNum);
    setIssueYear(parentVol ? parentVol.year : new Date().getFullYear());
    setIssueTitle(`Issue ${nextIssueNum}`);
    setIssuePubDate(new Date().toISOString().split('T')[0]);
    setIssueTocSummary('');
    setIssueCoverImage('');
    setIssueEditorialPdfUrl('');
    setIssueEditorialPdfName('');
    setIssueStatus('draft');
    setIssueError(null);
    setIsIssueModalOpen(true);
  };

  // Open Edit Issue Modal
  const handleOpenEditIssue = (iss: JournalIssue) => {
    setEditingIssue(iss);
    setSelectedVolIdForIssue(iss.volumeId);
    setIssueNumber(iss.issueNumber);
    setIssueYear(iss.year);
    setIssueTitle(iss.title);
    setIssuePubDate(iss.publicationDate);
    setIssueTocSummary(iss.tableOfContentsSummary || '');
    setIssueCoverImage(iss.coverImage || '');
    setIssueEditorialPdfUrl(iss.editorialPdfUrl || '');
    setIssueEditorialPdfName(iss.editorialPdfName || '');
    setIssueStatus(iss.status);
    setIssueError(null);
    setIsIssueModalOpen(true);
  };

  const handleSaveIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    setIssueError(null);

    const parentVol = volumes.find(v => v.id === selectedVolIdForIssue);
    const volNum = parentVol ? parentVol.volumeNumber : 1;

    if (editingIssue) {
      const ok = await updateIssue(editingIssue.id, {
        volumeId: selectedVolIdForIssue,
        volumeNumber: volNum,
        issueNumber: Number(issueNumber),
        year: Number(issueYear),
        title: issueTitle.trim() || `Issue ${issueNumber}`,
        publicationDate: issuePubDate,
        tableOfContentsSummary: issueTocSummary.trim(),
        coverImage: issueCoverImage.trim() || undefined,
        editorialPdfUrl: issueEditorialPdfUrl.trim() || undefined,
        editorialPdfName: issueEditorialPdfName.trim() || undefined,
        status: issueStatus
      });
      if (ok) {
        showNotification(`Volume ${volNum}, Issue ${issueNumber} updated successfully.`);
        setIsIssueModalOpen(false);
      } else {
        setIssueError('Failed to update issue.');
      }
    } else {
      const res = await createIssue({
        volumeId: selectedVolIdForIssue,
        volumeNumber: volNum,
        issueNumber: Number(issueNumber),
        year: Number(issueYear),
        title: issueTitle.trim() || `Issue ${issueNumber}`,
        publicationDate: issuePubDate,
        tableOfContentsSummary: issueTocSummary.trim(),
        coverImage: issueCoverImage.trim() || undefined,
        editorialPdfUrl: issueEditorialPdfUrl.trim() || undefined,
        editorialPdfName: issueEditorialPdfName.trim() || undefined,
        articleIds: [],
        status: issueStatus,
        isCurrent: false
      });
      if (res.success) {
        showNotification(`Volume ${volNum}, Issue ${issueNumber} created successfully.`);
        setIsIssueModalOpen(false);
      } else {
        setIssueError(res.error || 'Failed to create issue.');
      }
    }
  };

  const handleDeleteIssue = async (iss: JournalIssue) => {
    if (iss.isCurrent) {
      alert('Cannot delete the issue currently designated as Current Issue. Please publish or designate another issue first.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete Volume ${iss.volumeNumber}, Issue ${iss.issueNumber}? Articles assigned to this issue will remain preserved.`)) {
      await deleteIssue(iss.id);
      showNotification(`Volume ${iss.volumeNumber}, Issue ${iss.issueNumber} deleted.`);
    }
  };

  // Publish Issue Workflow (Module 4)
  const handlePublishIssueWorkflow = async (iss: JournalIssue) => {
    const currentActive = issues.find(i => i.isCurrent);
    const confirmMessage = currentActive && currentActive.id !== iss.id
      ? `Publishing Volume ${iss.volumeNumber}, Issue ${iss.issueNumber} will immediately set it as the live Current Issue.\n\nThe previous current issue (Volume ${currentActive.volumeNumber}, Issue ${currentActive.issueNumber}) will be automatically moved to the Archive.\n\nAll articles, DOIs, and original PDFs will remain permanently preserved. Proceed?`
      : `Publish Volume ${iss.volumeNumber}, Issue ${iss.issueNumber} and display it as the Current Issue?`;

    if (window.confirm(confirmMessage)) {
      const res = await publishIssue(iss.id);
      if (res.success) {
        showNotification(`Volume ${iss.volumeNumber}, Issue ${iss.issueNumber} published! It is now the live Current Issue, and previous issues are securely archived.`);
      } else {
        alert(res.error || 'Failed to publish issue.');
      }
    }
  };

  const handleUnpublishIssue = async (iss: JournalIssue) => {
    if (window.confirm(`Unpublish Volume ${iss.volumeNumber}, Issue ${iss.issueNumber}? It will be reverted to Draft status.`)) {
      await unpublishIssue(iss.id);
      showNotification(`Issue reverted to Draft.`);
    }
  };

  // Reorder Articles
  const handleMoveArticle = async (issue: JournalIssue, articleId: string, direction: 'up' | 'down') => {
    const idx = issue.articleIds.indexOf(articleId);
    if (idx === -1) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === issue.articleIds.length - 1) return;

    const newIds = [...issue.articleIds];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const temp = newIds[idx];
    newIds[idx] = newIds[targetIdx];
    newIds[targetIdx] = temp;

    await reorderArticlesInIssue(issue.id, newIds);
  };

  const handleAddArticleToIssue = async (issueId: string) => {
    if (!articleToAddId) return;
    await addArticleToIssue(issueId, articleToAddId);
    setArticleToAddId('');
    showNotification('Article added to issue table of contents.');
  };

  const handleRemoveArticleFromIssue = async (issueId: string, articleId: string) => {
    if (window.confirm('Remove this article from the issue table of contents? The article record will remain intact.')) {
      await removeArticleFromIssue(issueId, articleId);
      showNotification('Article removed from issue.');
    }
  };

  // Candidates for adding to issue: published or accepted articles
  const candidateArticles = articles.filter(a => a.status === 'published' || a.status === 'accepted');

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-400">
              <Layers className="w-4 h-4" />
              <span>Publication Cycle &amp; Repository Control</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 dark:text-slate-100">
              Volume, Issue &amp; Archive Management
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-serif max-w-2xl leading-relaxed">
              Create and manage journal volumes and publication issues dynamically. When you publish a new issue, it automatically promotes to Current Issue while safely preserving and archiving previous issues.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleOpenCreateVolume}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-medium shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Volume</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenCreateIssue()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#102344] hover:bg-[#1c355e] text-white text-xs font-medium shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Issue</span>
            </button>
          </div>
        </div>

        {/* Action feedback */}
        {actionSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{actionSuccess}</span>
          </motion.div>
        )}
      </div>

      {/* Volumes & Nested Issues List */}
      <div className="space-y-6">
        {volumes.length === 0 ? (
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8 text-center space-y-3">
            <BookOpen className="w-10 h-10 mx-auto text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">No Volumes Created Yet</h3>
            <p className="text-xs text-slate-500 font-serif">Create Volume 1 to begin organizing journal publication issues.</p>
            <button
              type="button"
              onClick={handleOpenCreateVolume}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-800 text-white rounded-lg text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Volume 1</span>
            </button>
          </div>
        ) : (
          volumes.map((vol) => {
            const volIssues = issues.filter(
              i => i.volumeId === vol.id || Number(i.volumeNumber) === Number(vol.volumeNumber)
            );

            return (
              <div
                key={vol.id}
                className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 shadow-2xs overflow-hidden transition-colors"
              >
                {/* Volume Header Bar */}
                <div className="bg-stone-50 dark:bg-stone-800/60 p-4 sm:p-5 border-b border-stone-200/80 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-800/10 dark:bg-amber-400/10 text-amber-900 dark:text-amber-300 flex items-center justify-center font-serif font-bold text-base">
                      V{vol.volumeNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif font-bold text-base text-slate-900 dark:text-slate-100">
                          {vol.title || `Volume ${vol.volumeNumber}`}
                        </h3>
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-slate-200 dark:bg-stone-700 text-slate-700 dark:text-slate-300">
                          Year {vol.year}
                        </span>
                        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full uppercase tracking-wider ${
                          vol.status === 'published'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : vol.status === 'archived'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-stone-700 dark:text-slate-300'
                        }`}>
                          {vol.status}
                        </span>
                      </div>
                      {vol.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-serif mt-0.5">
                          {vol.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleOpenCreateIssue(vol.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 text-xs font-medium cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Issue</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEditVolume(vol)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-stone-800 cursor-pointer"
                      title="Edit Volume"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteVolume(vol)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                      title="Delete Volume"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Nested Issues */}
                <div className="p-4 sm:p-6 space-y-4">
                  {volIssues.length === 0 ? (
                    <div className="p-6 rounded-xl border border-dashed border-stone-300 dark:border-stone-700 text-center text-xs text-slate-500">
                      No issues created in Volume {vol.volumeNumber} yet.{' '}
                      <button
                        type="button"
                        onClick={() => handleOpenCreateIssue(vol.id)}
                        className="text-amber-800 dark:text-amber-400 underline font-semibold ml-1 cursor-pointer"
                      >
                        Create Issue 1
                      </button>
                    </div>
                  ) : (
                    volIssues.map((iss) => {
                      const issueArticlesList = iss.articleIds
                        .map(id => articles.find(a => a.id === id))
                        .filter(Boolean) as Article[];

                      const isManagingArticles = activeManagingIssueId === iss.id;

                      return (
                        <div
                          key={iss.id}
                          className={`rounded-xl border transition-all ${
                            iss.isCurrent
                              ? 'border-emerald-400 dark:border-emerald-600 bg-emerald-50/20 dark:bg-emerald-950/10 shadow-xs'
                              : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/40'
                          }`}
                        >
                          <div className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="space-y-1.5 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-serif font-bold text-sm text-slate-900 dark:text-slate-100">
                                  Issue {iss.issueNumber}: {iss.title}
                                </span>
                                {iss.isCurrent && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white uppercase tracking-wider animate-pulse">
                                    <Sparkles className="w-3 h-3" />
                                    <span>Current Issue</span>
                                  </span>
                                )}
                                <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full uppercase tracking-wider ${
                                  iss.status === 'published'
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                                    : iss.status === 'archived'
                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                                    : 'bg-slate-100 text-slate-700 dark:bg-stone-700 dark:text-slate-300'
                                }`}>
                                  {iss.status}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-serif">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Published: {iss.publicationDate}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{iss.articleIds.length} Article(s) in TOC</span>
                                </span>
                              </div>

                              {iss.tableOfContentsSummary && (
                                <p className="text-xs text-slate-600 dark:text-slate-300 font-serif italic line-clamp-1">
                                  "{iss.tableOfContentsSummary}"
                                </p>
                              )}
                            </div>

                            {/* Issue Control Actions */}
                            <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
                              {/* Manage Articles Accordion Toggle */}
                              <button
                                type="button"
                                onClick={() => setActiveManagingIssueId(isManagingArticles ? null : iss.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                                  isManagingArticles
                                    ? 'bg-amber-800 text-white'
                                    : 'bg-stone-100 dark:bg-stone-700 text-slate-700 dark:text-slate-200 hover:bg-stone-200'
                                }`}
                              >
                                {isManagingArticles ? 'Hide Table of Contents' : `Manage Articles (${iss.articleIds.length})`}
                              </button>

                              {/* Preview Issue */}
                              <button
                                type="button"
                                onClick={() => setPreviewingIssue(iss)}
                                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-stone-700 cursor-pointer"
                                title="Preview Issue"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* Publish / Unpublish Workflow Button */}
                              {iss.status !== 'published' || !iss.isCurrent ? (
                                <button
                                  type="button"
                                  onClick={() => handlePublishIssueWorkflow(iss)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium shadow-2xs transition-colors cursor-pointer"
                                  title="Publish as live Current Issue (moves earlier issue to Archive)"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>{iss.status === 'published' ? 'Set as Current' : 'Publish Issue'}</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleUnpublishIssue(iss)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 text-slate-700 dark:text-slate-200 text-xs font-medium cursor-pointer"
                                  title="Unpublish back to draft"
                                >
                                  <Archive className="w-3.5 h-3.5" />
                                  <span>Unpublish</span>
                                </button>
                              )}

                              {/* Edit Issue */}
                              <button
                                type="button"
                                onClick={() => handleOpenEditIssue(iss)}
                                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-stone-700 cursor-pointer"
                                title="Edit Issue Details"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              {/* Delete Issue */}
                              {!iss.isCurrent && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteIssue(iss)}
                                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                                  title="Delete Issue"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Expanded Table of Contents & Article Association Section */}
                          {isManagingArticles && (
                            <div className="border-t border-stone-200/90 dark:border-stone-800 p-4 sm:p-5 bg-stone-50/50 dark:bg-stone-900/50 space-y-4">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                  <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                                    Table of Contents &amp; Published Article Sequence
                                  </h4>
                                  <p className="text-[11px] text-slate-500 font-serif">
                                    Reorder articles to determine their sequence in the published issue and citation index.
                                  </p>
                                </div>

                                {/* Add Article Selector */}
                                <div className="flex items-center gap-2">
                                  <select
                                    value={articleToAddId}
                                    onChange={(e) => setArticleToAddId(e.target.value)}
                                    className="px-2.5 py-1.5 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-800 dark:text-slate-200 max-w-xs"
                                  >
                                    <option value="">-- Associate an Accepted/Published Paper --</option>
                                    {candidateArticles
                                      .filter(a => !iss.articleIds.includes(a.id))
                                      .map(a => (
                                        <option key={a.id} value={a.id}>
                                          {a.trackingId} - {a.title.slice(0, 50)}...
                                        </option>
                                      ))}
                                  </select>
                                  <button
                                    type="button"
                                    onClick={() => handleAddArticleToIssue(iss.id)}
                                    disabled={!articleToAddId}
                                    className="px-3 py-1.5 bg-amber-800 hover:bg-amber-900 disabled:opacity-40 text-white rounded-lg text-xs font-medium cursor-pointer"
                                  >
                                    Add
                                  </button>
                                </div>
                              </div>

                              {issueArticlesList.length === 0 ? (
                                <p className="text-xs text-slate-500 font-serif italic py-3 text-center">
                                  No articles currently attached to this issue. Select an article above to add it to the issue's table of contents.
                                </p>
                              ) : (
                                <div className="space-y-2">
                                  {issueArticlesList.map((art, idx) => (
                                    <div
                                      key={art.id}
                                      className="p-3 bg-white dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700 flex items-center justify-between gap-3"
                                    >
                                      <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <span className="w-6 h-6 rounded-md bg-stone-100 dark:bg-stone-700 text-slate-700 dark:text-slate-300 flex items-center justify-center text-xs font-bold font-mono">
                                          {idx + 1}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                                              {art.title}
                                            </span>
                                            {art.doi && <ArticleDoiBadge doi={art.doi} size="sm" />}
                                          </div>
                                          <p className="text-[11px] text-slate-500 font-serif">
                                            {art.authors.map(a => a.name).join(', ')} • Pages: {art.pages || 'N/A'} • ID: {art.trackingId}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-1 shrink-0">
                                        <button
                                          type="button"
                                          onClick={() => handleMoveArticle(iss, art.id, 'up')}
                                          disabled={idx === 0}
                                          className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 rounded cursor-pointer"
                                          title="Move Up"
                                        >
                                          <ArrowUp className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleMoveArticle(iss, art.id, 'down')}
                                          disabled={idx === issueArticlesList.length - 1}
                                          className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 rounded cursor-pointer"
                                          title="Move Down"
                                        >
                                          <ArrowDown className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveArticleFromIssue(iss.id, art.id)}
                                          className="p-1 text-rose-500 hover:text-rose-700 rounded cursor-pointer ml-1"
                                          title="Remove from Issue"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
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
          })
        )}
      </div>

      {/* VOLUME CREATE/EDIT MODAL */}
      <AnimatePresence>
        {isVolumeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-stone-900 rounded-2xl max-w-lg w-full p-6 space-y-5 border border-stone-200 dark:border-stone-800 shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
                <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-slate-100">
                  {editingVolume ? `Edit Volume ${editingVolume.volumeNumber}` : 'Create New Journal Volume'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsVolumeModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {volumeError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 rounded-xl text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{volumeError}</span>
                </div>
              )}

              <form onSubmit={handleSaveVolume} className="space-y-4 text-xs font-serif">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Volume Number *
                    </label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={volNumber}
                      onChange={(e) => setVolNumber(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Publication Year *
                    </label>
                    <input
                      type="number"
                      min={2020}
                      max={2035}
                      required
                      value={volYear}
                      onChange={(e) => setVolYear(parseInt(e.target.value) || new Date().getFullYear())}
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Volume Title / Theme
                  </label>
                  <input
                    type="text"
                    value={volTitle}
                    onChange={(e) => setVolTitle(e.target.value)}
                    placeholder="e.g. Contemporary Horizons in Social Sciences & Humanities"
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Description or Editorial Note
                  </label>
                  <textarea
                    rows={3}
                    value={volDescription}
                    onChange={(e) => setVolDescription(e.target.value)}
                    placeholder="Editorial synopsis or scope description for this volume..."
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Volume Status
                  </label>
                  <select
                    value={volStatus}
                    onChange={(e) => setVolStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
                  <button
                    type="button"
                    onClick={() => setIsVolumeModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-700 text-slate-700 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-amber-800 hover:bg-amber-900 text-white font-medium cursor-pointer"
                  >
                    {editingVolume ? 'Save Volume Changes' : 'Create Volume'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ISSUE CREATE/EDIT MODAL */}
      <AnimatePresence>
        {isIssueModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-stone-900 rounded-2xl max-w-lg w-full p-6 space-y-5 border border-stone-200 dark:border-stone-800 shadow-xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
                <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-slate-100">
                  {editingIssue ? `Edit Issue Details` : 'Create New Journal Issue'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsIssueModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {issueError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 rounded-xl text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{issueError}</span>
                </div>
              )}

              <form onSubmit={handleSaveIssue} className="space-y-4 text-xs font-serif">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Parent Volume *
                  </label>
                  <select
                    value={selectedVolIdForIssue}
                    onChange={(e) => setSelectedVolIdForIssue(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-slate-100"
                  >
                    {volumes.map((v) => (
                      <option key={v.id} value={v.id}>
                        Volume {v.volumeNumber} ({v.year}) - {v.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Issue Number *
                    </label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={issueNumber}
                      onChange={(e) => setIssueNumber(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Publication Year *
                    </label>
                    <input
                      type="number"
                      min={2020}
                      max={2035}
                      required
                      value={issueYear}
                      onChange={(e) => setIssueYear(parseInt(e.target.value) || new Date().getFullYear())}
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-slate-100"
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
                    onChange={(e) => setIssueTitle(e.target.value)}
                    placeholder="e.g. Regular Issue: Contemporary Social & Educational Research"
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-slate-100"
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
                    onChange={(e) => setIssuePubDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Table of Contents Summary / Editorial Note
                  </label>
                  <textarea
                    rows={2}
                    value={issueTocSummary}
                    onChange={(e) => setIssueTocSummary(e.target.value)}
                    placeholder="Overview of articles covered in this issue..."
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Cover Image URL (optional)
                  </label>
                  <input
                    type="text"
                    value={issueCoverImage}
                    onChange={(e) => setIssueCoverImage(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Initial Publication Status
                  </label>
                  <select
                    value={issueStatus}
                    onChange={(e) => setIssueStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="draft">Draft (Work in progress)</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
                  <button
                    type="button"
                    onClick={() => setIsIssueModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-700 text-slate-700 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#102344] hover:bg-[#1c355e] text-white font-medium cursor-pointer"
                  >
                    {editingIssue ? 'Save Issue Changes' : 'Create Issue'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ISSUE PREVIEW MODAL */}
      <AnimatePresence>
        {previewingIssue && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-stone-900 rounded-2xl max-w-2xl w-full p-6 space-y-5 border border-stone-200 dark:border-stone-800 shadow-xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-800 dark:text-amber-400" />
                  <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-slate-100">
                    Preview: Volume {previewingIssue.volumeNumber}, Issue {previewingIssue.issueNumber}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewingIssue(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-serif text-slate-900 dark:text-slate-100">
                      {previewingIssue.title}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-stone-700 font-semibold">
                      {previewingIssue.publicationDate}
                    </span>
                  </div>
                  {previewingIssue.tableOfContentsSummary && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-serif leading-relaxed">
                      {previewingIssue.tableOfContentsSummary}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Included Papers ({previewingIssue.articleIds.length})
                  </h4>
                  {previewingIssue.articleIds.length === 0 ? (
                    <p className="text-xs text-slate-500 font-serif italic">No papers assigned yet.</p>
                  ) : (
                    previewingIssue.articleIds.map((artId, idx) => {
                      const art = articles.find(a => a.id === artId);
                      if (!art) return null;
                      return (
                        <div
                          key={art.id}
                          className="p-3 bg-stone-50 dark:bg-stone-800/40 rounded-lg border border-stone-200 dark:border-stone-700 space-y-1.5"
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-xs font-bold font-mono text-amber-800 dark:text-amber-400 mt-0.5">
                              #{idx + 1}
                            </span>
                            <div className="flex-1">
                              <h5 className="font-serif font-bold text-xs text-slate-900 dark:text-slate-100 leading-snug">
                                {art.title}
                              </h5>
                              <p className="text-[11px] text-slate-500 font-serif">
                                {art.authors.map(a => a.name).join(', ')} • {art.track}
                              </p>
                            </div>
                          </div>
                          {art.doi && <ArticleDoiBadge doi={art.doi} size="sm" />}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setPreviewingIssue(null)}
                  className="px-4 py-2 rounded-lg bg-stone-100 dark:bg-stone-800 text-slate-700 dark:text-slate-300 text-xs font-medium cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
