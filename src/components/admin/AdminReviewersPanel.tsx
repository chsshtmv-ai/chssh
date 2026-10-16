import React, { useState } from 'react';
import { Reviewer, ReviewerStatus } from '../../types';
import {
  Award,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Edit3,
  Trash2,
  Plus,
  ExternalLink,
  Mail,
  Building,
  Filter,
  Eye,
  X,
  UserCheck,
  UserX,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { ImageUploadField } from './ImageUploadField';
import { getInitials, getAvatarColor } from '../../utils/imageUtils';

interface AdminReviewersPanelProps {
  reviewers: Reviewer[];
  acceptReviewer: (id: string, adminNotes?: string) => void;
  rejectReviewer: (id: string, adminNotes?: string) => void;
  updateReviewer: (id: string, update: Partial<Reviewer>) => void;
  deleteReviewer: (id: string) => void;
  addReviewer: (reviewer: Omit<Reviewer, 'id' | 'appliedDate'>) => void;
  onNavigateToPublicReviewers?: () => void;
}

export const AdminReviewersPanel: React.FC<AdminReviewersPanelProps> = ({
  reviewers,
  acceptReviewer,
  rejectReviewer,
  updateReviewer,
  deleteReviewer,
  addReviewer,
  onNavigateToPublicReviewers
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingReviewer, setEditingReviewer] = useState<Reviewer | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    type: 'accept' | 'reject';
    reviewer: Reviewer | null;
    note: string;
  }>({
    isOpen: false,
    type: 'accept',
    reviewer: null,
    note: ''
  });

  const [newReviewer, setNewReviewer] = useState<Omit<Reviewer, 'id' | 'appliedDate'>>({
    name: '',
    title: 'Dr.',
    email: '',
    affiliation: '',
    country: '',
    track: 'Interdisciplinary Social Sciences & Cultural Inquiry',
    expertise: '',
    orcid: '',
    bioStatement: '',
    status: 'accepted',
    adminNotes: 'Directly appointed by Editorial Office.',
    imageUrl: ''
  });

  const pendingCount = reviewers.filter((r) => r.status === 'pending').length;
  const acceptedCount = reviewers.filter((r) => r.status === 'accepted').length;
  const rejectedCount = reviewers.filter((r) => r.status === 'rejected').length;

  const filteredReviewers = reviewers.filter((rev) => {
    const matchesFilter = activeFilter === 'all' ? true : rev.status === activeFilter;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      term === '' ||
      rev.name.toLowerCase().includes(term) ||
      rev.email.toLowerCase().includes(term) ||
      rev.affiliation.toLowerCase().includes(term) ||
      rev.country.toLowerCase().includes(term) ||
      rev.track.toLowerCase().includes(term) ||
      rev.expertise.toLowerCase().includes(term);
    return matchesFilter && matchesSearch;
  });

  const handleOpenActionModal = (rev: Reviewer, type: 'accept' | 'reject') => {
    setActionModal({
      isOpen: true,
      type,
      reviewer: rev,
      note: type === 'accept' ? 'Accredited and approved for peer review assignments.' : 'Criteria not fulfilled at this time.'
    });
  };

  const handleConfirmAction = () => {
    if (!actionModal.reviewer) return;
    if (actionModal.type === 'accept') {
      acceptReviewer(actionModal.reviewer.id, actionModal.note);
    } else {
      rejectReviewer(actionModal.reviewer.id, actionModal.note);
    }
    setActionModal({ isOpen: false, type: 'accept', reviewer: null, note: '' });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReviewer) return;
    updateReviewer(editingReviewer.id, {
      name: editingReviewer.name,
      title: editingReviewer.title,
      email: editingReviewer.email,
      affiliation: editingReviewer.affiliation,
      country: editingReviewer.country,
      track: editingReviewer.track,
      expertise: editingReviewer.expertise,
      orcid: editingReviewer.orcid,
      bioStatement: editingReviewer.bioStatement,
      status: editingReviewer.status,
      adminNotes: editingReviewer.adminNotes,
      imageUrl: editingReviewer.imageUrl
    });
    setEditingReviewer(null);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewer.name || !newReviewer.email || !newReviewer.affiliation) {
      alert('Please fill in Name, Email, and Affiliation.');
      return;
    }
    addReviewer(newReviewer);
    setShowAddModal(false);
    setNewReviewer({
      name: '',
      title: 'Dr.',
      email: '',
      affiliation: '',
      country: '',
      track: 'Interdisciplinary Social Sciences & Cultural Inquiry',
      expertise: '',
      orcid: '',
      bioStatement: '',
      status: 'accepted',
      adminNotes: 'Directly appointed by Editorial Office.',
      imageUrl: ''
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#1c355e] dark:text-sky-400 uppercase tracking-widest font-mono">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Peer Review Accreditation CMS</span>
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            Reviewer Applications &amp; Directory Panel
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl font-serif">
            Review incoming applications submitted through the public website, accept and publish qualified scholars to the site's Reviewers tab, and modify reviewer credentials.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {onNavigateToPublicReviewers && (
            <button
              type="button"
              onClick={onNavigateToPublicReviewers}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#1c355e] dark:text-sky-300 bg-sky-50 dark:bg-[#102344] hover:bg-sky-100 dark:hover:bg-[#1c355e] border border-sky-200 dark:border-sky-800 transition cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View Public Reviewers Page</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1c355e] hover:bg-[#102344] dark:bg-[#23467d] dark:hover:bg-[#1c355e] text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition cursor-pointer border border-[#102344]"
          >
            <Plus className="w-4 h-4" />
            <span>Appoint Reviewer Directly</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div
          onClick={() => setActiveFilter('pending')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            activeFilter === 'pending'
              ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700 ring-2 ring-amber-400/40'
              : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-amber-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Pending Review
            </span>
            {pendingCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            )}
          </div>
          <div className="text-2xl font-bold font-serif text-slate-900 dark:text-slate-100 mt-2">
            {pendingCount}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Awaiting editorial decision
          </div>
        </div>

        <div
          onClick={() => setActiveFilter('accepted')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            activeFilter === 'accepted'
              ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700 ring-2 ring-emerald-400/40'
              : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-emerald-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5" /> Appointed on Site
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-serif text-slate-900 dark:text-slate-100 mt-2">
            {acceptedCount}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Visible in public directory
          </div>
        </div>

        <div
          onClick={() => setActiveFilter('rejected')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            activeFilter === 'rejected'
              ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 ring-2 ring-slate-400/40'
              : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-slate-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <UserX className="w-3.5 h-3.5" /> Declined / Archived
            </span>
          </div>
          <div className="text-2xl font-bold font-serif text-slate-900 dark:text-slate-100 mt-2">
            {rejectedCount}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Not published to public tab
          </div>
        </div>

        <div
          onClick={() => setActiveFilter('all')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            activeFilter === 'all'
              ? 'bg-sky-50/80 dark:bg-sky-950/30 border-sky-300 dark:border-sky-700 ring-2 ring-sky-400/40'
              : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-sky-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#1c355e] dark:text-sky-300 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> Total Reviewers
            </span>
          </div>
          <div className="text-2xl font-bold font-serif text-slate-900 dark:text-slate-100 mt-2">
            {reviewers.length}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Across all disciplinary tracks
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Filter className="w-3 h-3" /> Status:
          </span>
          {[
            { id: 'all', label: 'All Records' },
            { id: 'pending', label: `Pending Applications (${pendingCount})` },
            { id: 'accepted', label: `Appointed on Site (${acceptedCount})` },
            { id: 'rejected', label: `Declined (${rejectedCount})` }
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setActiveFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeFilter === f.id
                  ? 'bg-[#1c355e] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search reviewers by name, track, university..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-1 focus:ring-[#1c355e] text-slate-900 dark:text-slate-100"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredReviewers.map((rev) => {
          const isPending = rev.status === 'pending';
          const isAccepted = rev.status === 'accepted';
          const isRejected = rev.status === 'rejected';
          const colors = getAvatarColor(rev.name);
          const initials = getInitials(rev.name);
          return (
            <div
              key={rev.id}
              className={`p-5 rounded-2xl border transition-all ${
                isPending
                  ? 'bg-amber-50/30 dark:bg-amber-950/15 border-amber-200 dark:border-amber-900/60 shadow-xs'
                  : isAccepted
                  ? 'bg-white dark:bg-stone-900 border-stone-200/90 dark:border-stone-800 shadow-2xs hover:border-[#1c355e]/40 dark:hover:border-sky-500/40'
                  : 'bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-80'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono ${
                        isPending
                          ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-300'
                          : isAccepted
                          ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-300'
                          : 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {isPending && <Clock className="w-3 h-3" />}
                      {isAccepted && <CheckCircle2 className="w-3 h-3" />}
                      {isRejected && <XCircle className="w-3 h-3" />}
                      {isPending ? 'Pending Application' : isAccepted ? 'Accredited & Published on Site' : 'Application Declined'}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-blue-50 dark:bg-[#102344] text-[#1c355e] dark:text-sky-300 border border-blue-200 dark:border-blue-900 font-medium">
                      {rev.track}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Applied: {new Date(rev.appliedDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-start gap-3.5">
                    <div className="relative shrink-0">
                      {rev.imageUrl ? (
                        <img
                          src={rev.imageUrl}
                          alt={rev.name}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border-2 border-[#1c355e]/30 dark:border-sky-500/40 shadow-xs bg-stone-100 dark:bg-stone-800"
                        />
                      ) : (
                        <div
                          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex flex-col items-center justify-center font-serif font-bold text-base border ${colors.bg} ${colors.text} ${colors.border} shadow-2xs`}
                        >
                          <span>{initials}</span>
                          <span className="text-[9px] uppercase tracking-tighter opacity-70 font-sans font-medium">Reviewer</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-0.5 flex-1">
                      <h4 className="font-serif text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 flex-wrap">
                        <span>{rev.title ? `${rev.title} ` : ''}{rev.name}</span>
                        {isAccepted && (
                          <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-sans font-semibold">
                            Active on Site
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span>{rev.affiliation}, {rev.country}</span>
                      </p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400 pt-0.5">
                        <span className="flex items-center gap-1.5 font-mono text-[11px]">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <a href={`mailto:${rev.email}`} className="hover:text-[#1c355e] dark:hover:text-sky-300 underline underline-offset-2">
                            {rev.email}
                          </a>
                        </span>
                        {rev.orcid && (
                          <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-700 dark:text-emerald-400">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <a
                              href={`https://orcid.org/${rev.orcid}`}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:underline flex items-center gap-0.5"
                            >
                              ORCID: {rev.orcid} <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="pt-1">
                    <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Assigned Research Expertise:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {rev.expertise.split(',').map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                        >
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                  {rev.bioStatement && (
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 font-serif leading-relaxed">
                      <strong className="font-sans font-semibold text-slate-900 dark:text-slate-100 block mb-0.5 text-[11px] uppercase tracking-wider">
                        Applicant Bio &amp; Motivation:
                      </strong>
                      "{rev.bioStatement}"
                    </div>
                  )}
                  {rev.adminNotes && (
                    <div className="text-xs text-amber-800 dark:text-amber-300 bg-amber-50/70 dark:bg-amber-950/40 p-2.5 rounded-lg border border-amber-200 dark:border-amber-800 flex items-start gap-2">
                      <MessageSquare className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <div>
                        <strong>Editorial Note: </strong>
                        <span>{rev.adminNotes}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex lg:flex-col items-center lg:items-end gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-200 dark:border-slate-800">
                  {isPending && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleOpenActionModal(rev, 'accept')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs hover:shadow-md transition cursor-pointer"
                        title="Accept and publish to public Reviewers tab"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Accept &amp; Appoint to Site</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenActionModal(rev, 'reject')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-800 transition cursor-pointer"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        <span>Decline Application</span>
                      </button>
                    </>
                  )}
                  {isAccepted && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-medium hidden lg:inline mr-1">
                        Live on Site
                      </span>
                      <button
                        type="button"
                        onClick={() => updateReviewer(rev.id, { status: 'rejected', adminNotes: 'Accreditation temporarily suspended.' })}
                        className="text-xs px-2.5 py-1 text-slate-500 hover:text-red-600 border border-slate-200 dark:border-slate-700 rounded-md transition cursor-pointer"
                        title="Suspend or hide from public site"
                      >
                        Revoke
                      </button>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setEditingReviewer(rev)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#1c355e] dark:text-sky-300 bg-sky-50 dark:bg-[#102344] hover:bg-sky-100 dark:hover:bg-[#1c355e] border border-sky-200 dark:border-sky-800 transition cursor-pointer"
                    title="Modify reviewer details, track, status or notes"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Modify Reviewer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to permanently delete reviewer "${rev.name}"?`)) {
                        deleteReviewer(rev.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition cursor-pointer"
                    title="Delete permanently"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {filteredReviewers.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 text-slate-500 space-y-2">
            <Award className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="text-xs font-serif">No reviewers found matching the selected filter.</p>
          </div>
        )}
      </div>

      {actionModal.isOpen && actionModal.reviewer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-md w-full border border-stone-200 dark:border-stone-800 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                {actionModal.type === 'accept' ? (
                  <>
                    <UserCheck className="w-5 h-5 text-emerald-600" />
                    <span>Accept &amp; Appoint Reviewer</span>
                  </>
                ) : (
                  <>
                    <UserX className="w-5 h-5 text-red-600" />
                    <span>Decline Reviewer Application</span>
                  </>
                )}
              </h3>
              <button
                type="button"
                onClick={() => setActionModal({ ...actionModal, isOpen: false })}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <div>Applicant: <strong className="text-slate-900 dark:text-slate-100">{actionModal.reviewer.title} {actionModal.reviewer.name}</strong></div>
              <div>Affiliation: {actionModal.reviewer.affiliation}, {actionModal.reviewer.country}</div>
              <div>Track: <span className="font-mono text-[#1c355e] dark:text-sky-300">{actionModal.reviewer.track}</span></div>
            </div>
            {actionModal.type === 'accept' && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  This scholar will be immediately published and viewable on the public website's <strong>Reviewers</strong> tab.
                </span>
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Editorial Decision Note (Saved to Reviewer Record)
              </label>
              <textarea
                rows={3}
                value={actionModal.note}
                onChange={(e) => setActionModal({ ...actionModal, note: e.target.value })}
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-300 dark:border-slate-700 rounded-lg outline-none text-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setActionModal({ ...actionModal, isOpen: false })}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                className={`px-5 py-2 text-xs font-bold text-white rounded-lg shadow-xs cursor-pointer transition ${
                  actionModal.type === 'accept'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {actionModal.type === 'accept' ? 'Confirm Acceptance' : 'Confirm Decline'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modify Reviewer Modal */}
      {editingReviewer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-2xl w-full border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="bg-[#102344] text-white p-5 flex items-center justify-between border-b border-[#1c355e] shrink-0">
              <div>
                <span className="text-[11px] font-mono text-sky-400 uppercase tracking-widest font-semibold">
                  Reviewer Accreditation CMS
                </span>
                <h3 className="font-serif text-lg font-bold text-white mt-0.5">
                  Modify Reviewer: {editingReviewer.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingReviewer(null)}
                className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="p-4 bg-slate-50 dark:bg-slate-850/80 rounded-xl border border-slate-200 dark:border-slate-800">
                <ImageUploadField
                  label="Reviewer Portrait / Profile Photo"
                  value={editingReviewer.imageUrl || ''}
                  personName={editingReviewer.name}
                  onChange={(imgUrl) => setEditingReviewer({ ...editingReviewer, imageUrl: imgUrl })}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Academic Title
                  </label>
                  <input
                    type="text"
                    value={editingReviewer.title || ''}
                    onChange={(e) => setEditingReviewer({ ...editingReviewer, title: e.target.value })}
                    placeholder="Prof., Dr., Assoc. Prof."
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-[#1c355e]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingReviewer.name}
                    onChange={(e) => setEditingReviewer({ ...editingReviewer, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-[#1c355e]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Institutional Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={editingReviewer.email}
                    onChange={(e) => setEditingReviewer({ ...editingReviewer, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-[#1c355e]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ORCID iD
                  </label>
                  <input
                    type="text"
                    value={editingReviewer.orcid || ''}
                    onChange={(e) => setEditingReviewer({ ...editingReviewer, orcid: e.target.value })}
                    placeholder="0000-0002-1825-0097"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-[#1c355e]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    University / Institution <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingReviewer.affiliation}
                    onChange={(e) => setEditingReviewer({ ...editingReviewer, affiliation: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-[#1c355e]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={editingReviewer.country}
                    onChange={(e) => setEditingReviewer({ ...editingReviewer, country: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-[#1c355e]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Disciplinary Track <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editingReviewer.track}
                    onChange={(e) => setEditingReviewer({ ...editingReviewer, track: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-[#1c355e]"
                  >
                    <option value="Sociology, Social Policy &amp; Public Sphere">Sociology, Social Policy &amp; Public Sphere</option>
                    <option value="Cultural Studies, Media Ecology &amp; Critical Theory">Cultural Studies, Media Ecology &amp; Critical Theory</option>
                    <option value="Applied Ethics, Epistemic Justice &amp; Philosophy">Applied Ethics, Epistemic Justice &amp; Philosophy</option>
                    <option value="Digital Humanities &amp; Computational Social Science">Digital Humanities &amp; Computational Social Science</option>
                    <option value="History, Memory Studies &amp; Archival Practices">History, Memory Studies &amp; Archival Practices</option>
                    <option value="Anthropology, Ethnography &amp; Global Mobility">Anthropology, Ethnography &amp; Global Mobility</option>
                    <option value="Interdisciplinary Social Sciences &amp; Cultural Inquiry">Interdisciplinary Social Sciences &amp; Cultural Inquiry</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Areas of Expertise (Comma-separated keywords)
                  </label>
                  <input
                    type="text"
                    value={editingReviewer.expertise}
                    onChange={(e) => setEditingReviewer({ ...editingReviewer, expertise: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-[#1c355e]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Accreditation Status
                  </label>
                  <select
                    value={editingReviewer.status}
                    onChange={(e) => setEditingReviewer({ ...editingReviewer, status: e.target.value as ReviewerStatus })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-[#1c355e]"
                  >
                    <option value="pending">Pending Evaluation</option>
                    <option value="accepted">Accepted &amp; Published to Public Reviewers Directory</option>
                    <option value="rejected">Rejected / Archived</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Editorial Admin Notes (Internal)
                  </label>
                  <textarea
                    rows={2}
                    value={editingReviewer.adminNotes || ''}
                    onChange={(e) => setEditingReviewer({ ...editingReviewer, adminNotes: e.target.value })}
                    placeholder="Internal editorial comments..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-[#1c355e]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bio Statement
                  </label>
                  <textarea
                    rows={3}
                    value={editingReviewer.bioStatement || ''}
                    onChange={(e) => setEditingReviewer({ ...editingReviewer, bioStatement: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-[#1c355e]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingReviewer(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#1c355e] hover:bg-[#102344] dark:bg-[#23467d] dark:hover:bg-[#1c355e] rounded-lg shadow-xs cursor-pointer transition"
                >
                  Save Modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Direct Add Reviewer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-2xl w-full border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="bg-[#102344] text-white p-5 flex items-center justify-between border-b border-[#1c355e] shrink-0">
              <div>
                <span className="text-[11px] font-mono text-sky-400 uppercase tracking-widest font-semibold">
                  Editorial Appointment
                </span>
                <h3 className="font-serif text-lg font-bold text-white mt-0.5">
                  Directly Appoint Peer Reviewer
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="p-3 bg-blue-50 dark:bg-[#102344]/50 border border-blue-200 dark:border-blue-900 rounded-lg text-xs text-[#1c355e] dark:text-sky-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>
                  This will immediately add the reviewer to the directory and publish them on the public <strong>Reviewers</strong> tab.
                </span>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-850/80 rounded-xl border border-slate-200 dark:border-slate-800">
                <ImageUploadField
                  label="Reviewer Portrait / Profile Photo"
                  value={newReviewer.imageUrl || ''}
                  personName={newReviewer.name}
                  onChange={(imgUrl) => setNewReviewer({ ...newReviewer, imageUrl: imgUrl })}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Academic Title
                  </label>
                  <input
                    type="text"
                    value={newReviewer.title}
                    onChange={(e) => setNewReviewer({ ...newReviewer, title: e.target.value })}
                    placeholder="Prof., Dr., Assoc. Prof."
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-[#1c355e]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newReviewer.name}
                    onChange={(e) => setNewReviewer({ ...newReviewer, name: e.target.value })}
                    placeholder="e.g. Dr. Marianne Dupont"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-[#1c355e]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Institutional Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={newReviewer.email}
                    onChange={(e) => setNewReviewer({ ...newReviewer, email: e.target.value })}
                    placeholder="e.g. m.dupont@sorbonne.fr"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-[#1c355e]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ORCID iD
                  </label>
                  <input
                    type="text"
                    value={newReviewer.orcid}
                    onChange={(e) => setNewReviewer({ ...newReviewer, orcid: e.target.value })}
                    placeholder="0000-0002-1825-0097"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-[#1c355e]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    University / Institution <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newReviewer.affiliation}
                    onChange={(e) => setNewReviewer({ ...newReviewer, affiliation: e.target.value })}
                    placeholder="e.g. Sorbonne University"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-[#1c355e]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={newReviewer.country}
                    onChange={(e) => setNewReviewer({ ...newReviewer, country: e.target.value })}
                    placeholder="e.g. France"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-[#1c355e]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Disciplinary Track <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newReviewer.track}
                    onChange={(e) => setNewReviewer({ ...newReviewer, track: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-[#1c355e]"
                  >
                    <option value="Sociology, Social Policy &amp; Public Sphere">Sociology, Social Policy &amp; Public Sphere</option>
                    <option value="Cultural Studies, Media Ecology &amp; Critical Theory">Cultural Studies, Media Ecology &amp; Critical Theory</option>
                    <option value="Applied Ethics, Epistemic Justice &amp; Philosophy">Applied Ethics, Epistemic Justice &amp; Philosophy</option>
                    <option value="Digital Humanities &amp; Computational Social Science">Digital Humanities &amp; Computational Social Science</option>
                    <option value="History, Memory Studies &amp; Archival Practices">History, Memory Studies &amp; Archival Practices</option>
                    <option value="Anthropology, Ethnography &amp; Global Mobility">Anthropology, Ethnography &amp; Global Mobility</option>
                    <option value="Interdisciplinary Social Sciences &amp; Cultural Inquiry">Interdisciplinary Social Sciences &amp; Cultural Inquiry</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Assigned Research Expertise (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={newReviewer.expertise}
                    onChange={(e) => setNewReviewer({ ...newReviewer, expertise: e.target.value })}
                    placeholder="e.g. Critical Theory, Media Archaeology, Post-Colonialism"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-[#1c355e]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bio Statement
                  </label>
                  <textarea
                    rows={3}
                    value={newReviewer.bioStatement}
                    onChange={(e) => setNewReviewer({ ...newReviewer, bioStatement: e.target.value })}
                    placeholder="Academic credentials and qualifications..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-[#1c355e]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#1c355e] hover:bg-[#102344] dark:bg-[#23467d] dark:hover:bg-[#1c355e] rounded-lg shadow-xs cursor-pointer transition"
                >
                  Appoint &amp; Publish to Site
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
