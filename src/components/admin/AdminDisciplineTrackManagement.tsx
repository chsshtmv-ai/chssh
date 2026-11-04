import React, { useState } from 'react';
import { useJournal } from '../../context/JournalContext';
import { Discipline, SubjectTrack } from '../../types';
import {
  Tag,
  Compass,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Layers,
  Search,
  X,
  Check,
  FileText,
  Eye,
  EyeOff,
  Filter,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AdminDisciplineTrackManagement: React.FC = () => {
  const {
    disciplines,
    activeDisciplines,
    subjectTracks,
    activeSubjectTracks,
    addDiscipline,
    updateDiscipline,
    deleteDiscipline,
    reorderDisciplines,
    addSubjectTrack,
    updateSubjectTrack,
    deleteSubjectTrack,
    reorderSubjectTracks,
    articles
  } = useJournal();

  const [activeSubSection, setActiveSubSection] = useState<'disciplines' | 'tracks'>('disciplines');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Search & Filter state
  const [disciplineSearch, setDisciplineSearch] = useState('');
  const [trackSearch, setTrackSearch] = useState('');
  const [trackDisciplineFilter, setTrackDisciplineFilter] = useState('all');

  // Discipline Modal State
  const [isDisciplineModalOpen, setIsDisciplineModalOpen] = useState(false);
  const [editingDiscipline, setEditingDiscipline] = useState<Discipline | null>(null);
  const [discName, setDiscName] = useState('');
  const [discSlug, setDiscSlug] = useState('');
  const [discDescription, setDiscDescription] = useState('');
  const [discOrder, setDiscOrder] = useState<number>(1);
  const [discIsActive, setDiscIsActive] = useState(true);

  // Track Modal State
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<SubjectTrack | null>(null);
  const [trackName, setTrackName] = useState('');
  const [trackDescription, setTrackDescription] = useState('');
  const [trackDisciplineIds, setTrackDisciplineIds] = useState<string[]>([]);
  const [trackOrder, setTrackOrder] = useState<number>(1);
  const [trackIsActive, setTrackIsActive] = useState(true);

  // Delete Confirmation Modal State
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'discipline' | 'track';
    id: string;
    name: string;
    linkedArticlesCount: number;
  } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4500);
  };

  // Helper to calculate articles linked to a discipline
  const getDisciplineArticlesCount = (discId: string, discNameVal: string) => {
    const linkedTrackNames = subjectTracks
      .filter((t) => t.disciplineIds?.includes(discId))
      .map((t) => t.name.toLowerCase());

    return articles.filter((a) => {
      if (a.disciplineId === discId) return true;
      if (a.disciplineName && a.disciplineName.toLowerCase() === discNameVal.toLowerCase()) return true;
      if (a.track && (a.track.toLowerCase() === discNameVal.toLowerCase() || linkedTrackNames.includes(a.track.toLowerCase()))) {
        return true;
      }
      return false;
    }).length;
  };

  // Helper to calculate articles linked to a track
  const getTrackArticlesCount = (trackId: string, trackNameVal: string) => {
    return articles.filter(
      (a) => a.trackId === trackId || (a.track && a.track.trim().toLowerCase() === trackNameVal.trim().toLowerCase())
    ).length;
  };

  // --- Discipline Handlers ---
  const handleOpenAddDiscipline = () => {
    setEditingDiscipline(null);
    setDiscName('');
    setDiscSlug('');
    setDiscDescription('');
    setDiscOrder(disciplines.length + 1);
    setDiscIsActive(true);
    setIsDisciplineModalOpen(true);
  };

  const handleOpenEditDiscipline = (disc: Discipline) => {
    setEditingDiscipline(disc);
    setDiscName(disc.name);
    setDiscSlug(disc.slug || '');
    setDiscDescription(disc.description || '');
    setDiscOrder(disc.order ?? 1);
    setDiscIsActive(disc.isActive);
    setIsDisciplineModalOpen(true);
  };

  const handleSaveDiscipline = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = discName.trim();
    if (!trimmedName) {
      showNotification('error', 'Discipline name cannot be empty.');
      return;
    }

    const autoSlug = discSlug.trim()
      ? discSlug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
      : trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    if (editingDiscipline) {
      const res = await updateDiscipline(editingDiscipline.id, {
        name: trimmedName,
        slug: autoSlug,
        description: discDescription.trim() || undefined,
        order: Number(discOrder) || 1,
        isActive: discIsActive
      });

      if (res.success) {
        showNotification('success', `Discipline "${trimmedName}" successfully updated.`);
        setIsDisciplineModalOpen(false);
      } else {
        showNotification('error', res.error || 'Failed to update discipline.');
      }
    } else {
      const res = await addDiscipline({
        name: trimmedName,
        slug: autoSlug,
        description: discDescription.trim() || undefined,
        order: Number(discOrder) || disciplines.length + 1,
        isActive: discIsActive
      });

      if (res.success) {
        showNotification('success', `Discipline "${trimmedName}" successfully added.`);
        setIsDisciplineModalOpen(false);
      } else {
        showNotification('error', res.error || 'Failed to add discipline.');
      }
    }
  };

  const handleToggleDisciplineActive = async (disc: Discipline) => {
    const res = await updateDiscipline(disc.id, { isActive: !disc.isActive });
    if (res.success) {
      showNotification('success', `Discipline "${disc.name}" is now ${!disc.isActive ? 'Active' : 'Inactive'}.`);
    } else {
      showNotification('error', res.error || 'Failed to toggle status.');
    }
  };

  const handleMoveDiscipline = async (disc: Discipline, direction: 'up' | 'down') => {
    const sorted = [...disciplines].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
    const currentIndex = sorted.findIndex((d) => d.id === disc.id);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    const itemA = sorted[currentIndex];
    const itemB = sorted[targetIndex];

    const newOrderList = [
      { id: itemA.id, order: itemB.order },
      { id: itemB.id, order: itemA.order }
    ];

    const res = await reorderDisciplines(newOrderList);
    if (res.success) {
      showNotification('success', `Reordered discipline "${disc.name}".`);
    } else {
      showNotification('error', res.error || 'Failed to reorder.');
    }
  };

  // --- Track Handlers ---
  const handleOpenAddTrack = () => {
    setEditingTrack(null);
    setTrackName('');
    setTrackDescription('');
    setTrackDisciplineIds(activeDisciplines.length > 0 ? [activeDisciplines[0].id] : []);
    setTrackOrder(subjectTracks.length + 1);
    setTrackIsActive(true);
    setIsTrackModalOpen(true);
  };

  const handleOpenEditTrack = (track: SubjectTrack) => {
    setEditingTrack(track);
    setTrackName(track.name);
    setTrackDescription(track.description || '');
    setTrackDisciplineIds(track.disciplineIds || []);
    setTrackOrder(track.order ?? 1);
    setTrackIsActive(track.isActive);
    setIsTrackModalOpen(true);
  };

  const handleSaveTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = trackName.trim();
    if (!trimmedName) {
      showNotification('error', 'Subject track name cannot be empty.');
      return;
    }
    if (trackDisciplineIds.length === 0) {
      showNotification('error', 'Please assign at least one discipline to this subject track.');
      return;
    }

    if (editingTrack) {
      const res = await updateSubjectTrack(editingTrack.id, {
        name: trimmedName,
        description: trackDescription.trim() || undefined,
        disciplineIds: trackDisciplineIds,
        order: Number(trackOrder) || 1,
        isActive: trackIsActive
      });

      if (res.success) {
        showNotification('success', `Subject track "${trimmedName}" successfully updated.`);
        setIsTrackModalOpen(false);
      } else {
        showNotification('error', res.error || 'Failed to update subject track.');
      }
    } else {
      const res = await addSubjectTrack({
        name: trimmedName,
        description: trackDescription.trim() || undefined,
        disciplineIds: trackDisciplineIds,
        order: Number(trackOrder) || subjectTracks.length + 1,
        isActive: trackIsActive
      });

      if (res.success) {
        showNotification('success', `Subject track "${trimmedName}" successfully added.`);
        setIsTrackModalOpen(false);
      } else {
        showNotification('error', res.error || 'Failed to add subject track.');
      }
    }
  };

  const handleToggleTrackActive = async (track: SubjectTrack) => {
    const res = await updateSubjectTrack(track.id, { isActive: !track.isActive });
    if (res.success) {
      showNotification('success', `Subject track "${track.name}" is now ${!track.isActive ? 'Active' : 'Inactive'}.`);
    } else {
      showNotification('error', res.error || 'Failed to toggle status.');
    }
  };

  const handleMoveTrack = async (track: SubjectTrack, direction: 'up' | 'down') => {
    const sorted = [...subjectTracks].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
    const currentIndex = sorted.findIndex((t) => t.id === track.id);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    const itemA = sorted[currentIndex];
    const itemB = sorted[targetIndex];

    const newOrderList = [
      { id: itemA.id, order: itemB.order },
      { id: itemB.id, order: itemA.order }
    ];

    const res = await reorderSubjectTracks(newOrderList);
    if (res.success) {
      showNotification('success', `Reordered subject track "${track.name}".`);
    } else {
      showNotification('error', res.error || 'Failed to reorder.');
    }
  };

  // --- Deletion Flow ---
  const handleInitiateDelete = (type: 'discipline' | 'track', id: string, name: string) => {
    const count = type === 'discipline' ? getDisciplineArticlesCount(id, name) : getTrackArticlesCount(id, name);
    setDeleteTarget({ type, id, name, linkedArticlesCount: count });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'discipline') {
      const res = await deleteDiscipline(deleteTarget.id);
      if (res.success) {
        showNotification('success', `Discipline "${deleteTarget.name}" deleted.`);
        setDeleteTarget(null);
      } else {
        showNotification('error', res.error || 'Deletion failed.');
      }
    } else {
      const res = await deleteSubjectTrack(deleteTarget.id);
      if (res.success) {
        showNotification('success', `Subject track "${deleteTarget.name}" deleted.`);
        setDeleteTarget(null);
      } else {
        showNotification('error', res.error || 'Deletion failed.');
      }
    }
  };

  // Filtered views
  const filteredDisciplines = disciplines
    .filter((d) => d.name.toLowerCase().includes(disciplineSearch.toLowerCase()) || (d.description || '').toLowerCase().includes(disciplineSearch.toLowerCase()))
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

  const filteredTracks = subjectTracks
    .filter((t) => {
      const matchesSearch = t.name.toLowerCase().includes(trackSearch.toLowerCase()) || (t.description || '').toLowerCase().includes(trackSearch.toLowerCase());
      const matchesDiscipline = trackDisciplineFilter === 'all' || (t.disciplineIds && t.disciplineIds.includes(trackDisciplineFilter));
      return matchesSearch && matchesDiscipline;
    })
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

  return (
    <div className="space-y-6">
      {/* Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-xl flex items-center justify-between text-xs font-semibold shadow-sm ${
              notification.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 text-rose-900 border border-rose-200 dark:bg-rose-950/70 dark:text-rose-200 dark:border-rose-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />}
              <span>{notification.message}</span>
            </div>
            <button type="button" onClick={() => setNotification(null)} className="p-1 hover:opacity-70 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 p-6 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-[#102344] text-[#1c355e] dark:text-sky-300 text-xs font-semibold">
              <Compass className="w-3.5 h-3.5" />
              <span>Taxonomy &amp; Editorial Categorization</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-slate-100">
              Discipline &amp; Subject Track Management
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-serif max-w-3xl">
              Configure and maintain the journal&apos;s academic disciplines and manuscript submission subject tracks.
              Changes dynamically update the public homepage filters, archive views, and author submission dropdowns in real time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {activeSubSection === 'disciplines' ? (
              <button
                type="button"
                onClick={handleOpenAddDiscipline}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1c355e] hover:bg-[#102344] text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Discipline</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleOpenAddTrack}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1c355e] hover:bg-[#102344] text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Subject Track</span>
              </button>
            )}
          </div>
        </div>

        {/* Section Tabs */}
        <div className="pt-2 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveSubSection('disciplines')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              activeSubSection === 'disciplines'
                ? 'bg-[#102344] text-white shadow-xs'
                : 'bg-slate-100 dark:bg-stone-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-stone-700'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>A. Discipline Management</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
              {disciplines.length} ({activeDisciplines.length} active)
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubSection('tracks')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              activeSubSection === 'tracks'
                ? 'bg-[#102344] text-white shadow-xs'
                : 'bg-slate-100 dark:bg-stone-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-stone-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>B. Subject Track Management</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
              {subjectTracks.length} ({activeSubjectTracks.length} active)
            </span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SECTION A: DISCIPLINE MANAGEMENT                             */}
      {/* ============================================================ */}
      {activeSubSection === 'disciplines' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={disciplineSearch}
                onChange={(e) => setDisciplineSearch(e.target.value)}
                placeholder="Search disciplines..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-stone-850 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1c355e]"
              />
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Showing {filteredDisciplines.length} of {disciplines.length} disciplines
            </div>
          </div>

          {/* Disciplines Table */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-stone-850/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 w-20 text-center">Order</th>
                    <th className="py-3 px-4">Discipline Name &amp; Slug</th>
                    <th className="py-3 px-4">Scope Description</th>
                    <th className="py-3 px-4 text-center">Mapped Tracks</th>
                    <th className="py-3 px-4 text-center">Articles</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
                  {filteredDisciplines.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500 dark:text-slate-400">
                        No disciplines match your search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredDisciplines.map((disc, idx) => {
                      const linkedTracks = subjectTracks.filter((t) => t.disciplineIds?.includes(disc.id));
                      const articlesCount = getDisciplineArticlesCount(disc.id, disc.name);

                      return (
                        <tr
                          key={disc.id}
                          className="hover:bg-slate-50/70 dark:hover:bg-stone-850/50 transition-colors"
                        >
                          {/* Order with controls */}
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <span className="font-mono font-bold text-slate-700 dark:text-slate-300 w-5">
                                {disc.order ?? idx + 1}
                              </span>
                              <div className="flex flex-col gap-0.5">
                                <button
                                  type="button"
                                  onClick={() => handleMoveDiscipline(disc, 'up')}
                                  disabled={idx === 0}
                                  className="p-0.5 hover:bg-slate-200 dark:hover:bg-stone-700 rounded disabled:opacity-30 cursor-pointer"
                                  title="Move Up"
                                >
                                  <ArrowUp className="w-3 h-3 text-slate-600 dark:text-slate-300" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveDiscipline(disc, 'down')}
                                  disabled={idx === filteredDisciplines.length - 1}
                                  className="p-0.5 hover:bg-slate-200 dark:hover:bg-stone-700 rounded disabled:opacity-30 cursor-pointer"
                                  title="Move Down"
                                >
                                  <ArrowDown className="w-3 h-3 text-slate-600 dark:text-slate-300" />
                                </button>
                              </div>
                            </div>
                          </td>

                          {/* Name & Slug */}
                          <td className="py-3 px-4">
                            <div className="font-serif font-bold text-sm text-slate-900 dark:text-slate-100">
                              {disc.name}
                            </div>
                            <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                              slug: {disc.slug || '—'}
                            </div>
                          </td>

                          {/* Description */}
                          <td className="py-3 px-4 max-w-xs text-slate-600 dark:text-slate-400 truncate font-serif" title={disc.description}>
                            {disc.description || <span className="text-slate-400 italic font-sans text-[11px]">No description</span>}
                          </td>

                          {/* Mapped Tracks */}
                          <td className="py-3 px-4 text-center">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 dark:bg-[#102344] text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                              {linkedTracks.length} track(s)
                            </span>
                          </td>

                          {/* Articles Count */}
                          <td className="py-3 px-4 text-center">
                            <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                              {articlesCount}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleDisciplineActive(disc)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-pointer transition ${
                                disc.isActive
                                  ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                  : 'bg-slate-100 text-slate-600 dark:bg-stone-800 dark:text-slate-400 border border-slate-300 dark:border-stone-700'
                              }`}
                              title={disc.isActive ? 'Active on public site & submissions (Click to deactivate)' : 'Inactive (Click to activate)'}
                            >
                              {disc.isActive ? <Eye className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <EyeOff className="w-3 h-3 text-slate-400" />}
                              <span>{disc.isActive ? 'Active' : 'Inactive'}</span>
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEditDiscipline(disc)}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                                title="Edit Discipline"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleInitiateDelete('discipline', disc.id, disc.name)}
                                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 transition cursor-pointer"
                                title="Delete Discipline"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SECTION B: SUBJECT TRACK MANAGEMENT                          */}
      {/* ============================================================ */}
      {activeSubSection === 'tracks' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={trackSearch}
                  onChange={(e) => setTrackSearch(e.target.value)}
                  placeholder="Search subject tracks..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-stone-850 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1c355e]"
                />
              </div>

              {/* Discipline Filter */}
              <div className="flex items-center gap-1.5 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={trackDisciplineFilter}
                  onChange={(e) => setTrackDisciplineFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-stone-850 text-slate-800 dark:text-slate-200 text-xs focus:outline-none"
                >
                  <option value="all">All Disciplines</option>
                  {disciplines.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Showing {filteredTracks.length} of {subjectTracks.length} subject tracks
            </div>
          </div>

          {/* Subject Tracks Table */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-stone-850/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 w-20 text-center">Order</th>
                    <th className="py-3 px-4">Subject Track Name</th>
                    <th className="py-3 px-4">Assigned Disciplines</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4 text-center">Articles</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
                  {filteredTracks.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500 dark:text-slate-400">
                        No subject tracks match your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredTracks.map((track, idx) => {
                      const articlesCount = getTrackArticlesCount(track.id, track.name);
                      const assignedDiscObjects = disciplines.filter((d) => track.disciplineIds?.includes(d.id));

                      return (
                        <tr
                          key={track.id}
                          className="hover:bg-slate-50/70 dark:hover:bg-stone-850/50 transition-colors"
                        >
                          {/* Order */}
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <span className="font-mono font-bold text-slate-700 dark:text-slate-300 w-5">
                                {track.order ?? idx + 1}
                              </span>
                              <div className="flex flex-col gap-0.5">
                                <button
                                  type="button"
                                  onClick={() => handleMoveTrack(track, 'up')}
                                  disabled={idx === 0}
                                  className="p-0.5 hover:bg-slate-200 dark:hover:bg-stone-700 rounded disabled:opacity-30 cursor-pointer"
                                  title="Move Up"
                                >
                                  <ArrowUp className="w-3 h-3 text-slate-600 dark:text-slate-300" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveTrack(track, 'down')}
                                  disabled={idx === filteredTracks.length - 1}
                                  className="p-0.5 hover:bg-slate-200 dark:hover:bg-stone-700 rounded disabled:opacity-30 cursor-pointer"
                                  title="Move Down"
                                >
                                  <ArrowDown className="w-3 h-3 text-slate-600 dark:text-slate-300" />
                                </button>
                              </div>
                            </div>
                          </td>

                          {/* Track Name */}
                          <td className="py-3 px-4">
                            <div className="font-serif font-bold text-sm text-slate-900 dark:text-slate-100">
                              {track.name}
                            </div>
                            <div className="text-[11px] font-mono text-slate-400">
                              ID: {track.id}
                            </div>
                          </td>

                          {/* Assigned Disciplines */}
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {assignedDiscObjects.length === 0 ? (
                                <span className="text-amber-600 text-[11px] italic">No discipline assigned</span>
                              ) : (
                                assignedDiscObjects.map((d) => (
                                  <span
                                    key={d.id}
                                    className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#102344]/10 dark:bg-sky-950/60 text-[#1c355e] dark:text-sky-300 border border-[#1c355e]/20 dark:border-sky-800"
                                  >
                                    {d.name}
                                  </span>
                                ))
                              )}
                            </div>
                          </td>

                          {/* Description */}
                          <td className="py-3 px-4 max-w-xs text-slate-600 dark:text-slate-400 truncate font-serif" title={track.description}>
                            {track.description || <span className="text-slate-400 italic font-sans text-[11px]">No description</span>}
                          </td>

                          {/* Articles Count */}
                          <td className="py-3 px-4 text-center">
                            <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                              {articlesCount}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleTrackActive(track)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-pointer transition ${
                                track.isActive
                                  ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                  : 'bg-slate-100 text-slate-600 dark:bg-stone-800 dark:text-slate-400 border border-slate-300 dark:border-stone-700'
                              }`}
                              title={track.isActive ? 'Active for submissions (Click to deactivate)' : 'Inactive (Click to activate)'}
                            >
                              {track.isActive ? <Eye className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <EyeOff className="w-3 h-3 text-slate-400" />}
                              <span>{track.isActive ? 'Active' : 'Inactive'}</span>
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEditTrack(track)}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                                title="Edit Subject Track"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleInitiateDelete('track', track.id, track.name)}
                                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 transition cursor-pointer"
                                title="Delete Subject Track"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* DISCIPLINE ADD/EDIT MODAL                                    */}
      {/* ============================================================ */}
      <AnimatePresence>
        {isDisciplineModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-stone-900 rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#1c355e] dark:text-sky-400" />
                  <span>{editingDiscipline ? 'Edit Discipline' : 'Add New Discipline'}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsDisciplineModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveDiscipline} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Discipline Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={discName}
                    onChange={(e) => setDiscName(e.target.value)}
                    placeholder="e.g. Political Philosophy & International Relations"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-stone-850 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#1c355e]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Slug (URL identifier)
                  </label>
                  <input
                    type="text"
                    value={discSlug}
                    onChange={(e) => setDiscSlug(e.target.value)}
                    placeholder="e.g. political-philosophy (leave blank to auto-generate)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-stone-850 text-slate-900 dark:text-slate-100 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#1c355e]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Scope &amp; Curatorial Description
                  </label>
                  <textarea
                    rows={3}
                    value={discDescription}
                    onChange={(e) => setDiscDescription(e.target.value)}
                    placeholder="Brief description of intellectual scope, methodology, and thematic coverage..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-stone-850 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#1c355e]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Display Order
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={discOrder}
                      onChange={(e) => setDiscOrder(parseInt(e.target.value, 10) || 1)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-stone-850 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#1c355e]"
                    />
                  </div>

                  <div className="flex flex-col justify-end">
                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-stone-850">
                      <input
                        type="checkbox"
                        checked={discIsActive}
                        onChange={(e) => setDiscIsActive(e.target.checked)}
                        className="rounded border-slate-300 text-[#1c355e] focus:ring-[#1c355e] w-4 h-4 cursor-pointer"
                      />
                      <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                        Active on Public Site
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsDisciplineModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#1c355e] hover:bg-[#102344] text-white font-bold cursor-pointer transition shadow-xs"
                  >
                    {editingDiscipline ? 'Save Changes' : 'Create Discipline'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* SUBJECT TRACK ADD/EDIT MODAL                                 */}
      {/* ============================================================ */}
      <AnimatePresence>
        {isTrackModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-stone-900 rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#1c355e] dark:text-sky-400" />
                  <span>{editingTrack ? 'Edit Subject Track' : 'Add New Subject Track'}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsTrackModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveTrack} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Subject Track Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={trackName}
                    onChange={(e) => setTrackName(e.target.value)}
                    placeholder="e.g. Critical Political Economy & Labor"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-stone-850 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#1c355e]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Assign Relevant Disciplines <span className="text-rose-500">*</span>
                  </label>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                    Select one or more academic disciplines that this track belongs to:
                  </p>
                  <div className="max-h-36 overflow-y-auto p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-stone-850 space-y-1.5">
                    {disciplines.map((d) => {
                      const isSelected = trackDisciplineIds.includes(d.id);
                      return (
                        <label
                          key={d.id}
                          className={`flex items-center gap-2 p-1.5 rounded-lg text-xs cursor-pointer transition ${
                            isSelected
                              ? 'bg-[#102344]/10 dark:bg-sky-950/60 font-semibold text-[#1c355e] dark:text-sky-300'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-stone-800'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setTrackDisciplineIds((prev) => [...prev, d.id]);
                              } else {
                                setTrackDisciplineIds((prev) => prev.filter((id) => id !== d.id));
                              }
                            }}
                            className="rounded border-slate-300 text-[#1c355e] focus:ring-[#1c355e] w-3.5 h-3.5 cursor-pointer"
                          />
                          <span>{d.name}</span>
                          {!d.isActive && (
                            <span className="text-[10px] text-slate-400 italic">(Inactive)</span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Description &amp; Submission Focus
                  </label>
                  <textarea
                    rows={2}
                    value={trackDescription}
                    onChange={(e) => setTrackDescription(e.target.value)}
                    placeholder="Brief description to help authors determine if their manuscript fits this track..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-stone-850 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#1c355e]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Display Order
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={trackOrder}
                      onChange={(e) => setTrackOrder(parseInt(e.target.value, 10) || 1)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-stone-850 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#1c355e]"
                    />
                  </div>

                  <div className="flex flex-col justify-end">
                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-stone-850">
                      <input
                        type="checkbox"
                        checked={trackIsActive}
                        onChange={(e) => setTrackIsActive(e.target.checked)}
                        className="rounded border-slate-300 text-[#1c355e] focus:ring-[#1c355e] w-4 h-4 cursor-pointer"
                      />
                      <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                        Active for Submissions
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsTrackModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#1c355e] hover:bg-[#102344] text-white font-bold cursor-pointer transition shadow-xs"
                  >
                    {editingTrack ? 'Save Changes' : 'Create Track'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* DELETE CONFIRMATION DIALOG                                   */}
      {/* ============================================================ */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-stone-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-4"
            >
              <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
                <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-slate-900 dark:text-slate-100">
                    Delete {deleteTarget.type === 'discipline' ? 'Discipline' : 'Subject Track'}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">{deleteTarget.name}</p>
                </div>
              </div>

              {deleteTarget.linkedArticlesCount > 0 ? (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs space-y-2">
                  <div className="font-semibold flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>Protected Record: Active Paper Reference</span>
                  </div>
                  <p className="leading-relaxed">
                    <strong>{deleteTarget.linkedArticlesCount} published article(s) or submission(s)</strong> currently reference this {deleteTarget.type}.
                    Hard-deleting this record would break historical integrity.
                  </p>
                  <p className="leading-relaxed font-medium">
                    Recommendation: Deactivate this {deleteTarget.type} instead so it is hidden from public filters and new submissions while preserving historical records.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-serif">
                  Are you sure you want to permanently delete this {deleteTarget.type}? This action will remove it from Firestore immediately.
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer text-xs"
                >
                  Cancel
                </button>
                {deleteTarget.linkedArticlesCount === 0 ? (
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer text-xs transition shadow-xs"
                  >
                    Permanently Delete
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={async () => {
                      if (deleteTarget.type === 'discipline') {
                        await updateDiscipline(deleteTarget.id, { isActive: false });
                        showNotification('success', `Discipline "${deleteTarget.name}" deactivated.`);
                      } else {
                        await updateSubjectTrack(deleteTarget.id, { isActive: false });
                        showNotification('success', `Subject track "${deleteTarget.name}" deactivated.`);
                      }
                      setDeleteTarget(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer text-xs transition shadow-xs"
                  >
                    Deactivate Instead
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
