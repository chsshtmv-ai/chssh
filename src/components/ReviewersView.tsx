import React, { useState } from 'react';
import { useJournal } from '../context/JournalContext';
import { Reviewer } from '../types';
import {
  Award,
  Search,
  ExternalLink,
  Mail,
  Building,
  Globe,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  X,
  FileCheck,
  Send,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getInitials, getAvatarColor } from '../utils/imageUtils';

export const ReviewersView: React.FC = () => {
  const { reviewers, applyReviewer, content } = useJournal();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<string>('all');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);

  // Form State
  const [form, setForm] = useState<Omit<Reviewer, 'id' | 'status' | 'appliedDate'>>({
    name: '',
    title: 'Assistant Professor / Researcher',
    email: '',
    affiliation: '',
    country: '',
    track: 'Political Economy & Global Governance',
    expertise: '',
    orcid: '',
    bioStatement: ''
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const acceptedReviewers = reviewers.filter((r) => r.status === 'accepted');

  const tracks = Array.from(
    new Set(acceptedReviewers.map((r) => r.track).filter(Boolean))
  );

  const filteredReviewers = acceptedReviewers.filter((r) => {
    const matchesTrack = selectedTrack === 'all' || r.track === selectedTrack;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      r.name.toLowerCase().includes(term) ||
      r.affiliation.toLowerCase().includes(term) ||
      r.country.toLowerCase().includes(term) ||
      r.expertise.toLowerCase().includes(term) ||
      (r.title && r.title.toLowerCase().includes(term));
    return matchesTrack && matchesSearch;
  });

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.affiliation.trim() || !form.expertise.trim()) {
      setFormError('Please fill in your Name, Email, Affiliation, and Areas of Expertise.');
      return;
    }
    setFormError(null);
    setIsSubmitting(true);
    try {
      await applyReviewer(form);
      setApplicationSubmitted(true);
      setTimeout(() => {
        setForm({
          name: '',
          title: 'Assistant Professor / Researcher',
          email: '',
          affiliation: '',
          country: '',
          track: 'Political Economy & Global Governance',
          expertise: '',
          orcid: '',
          bioStatement: ''
        });
      }, 1000);
    } catch {
      setFormError('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Masthead Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-stone-900 rounded-2xl shadow-xs border border-stone-200/90 dark:border-stone-800 p-6 sm:p-8 space-y-4 relative overflow-hidden"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#1c355e] dark:text-sky-400 uppercase tracking-widest">
              <Award className="w-4 h-4 text-amber-500" />
              <span>International Peer Review College</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Accredited Peer Reviewers &amp; Evaluation Fellows
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Our international reviewer college adheres to COPE ethical standards, ensuring rigorous, constructive,
              and double-blind evaluation of all scholarly manuscripts.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setApplicationSubmitted(false);
              setShowApplyModal(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#102344] hover:bg-[#1a386c] text-white text-sm font-medium shadow-xs transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4 text-amber-400" />
            <span>Apply as Reviewer</span>
          </button>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 dark:border-stone-800/80 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-stone-800/50">
            <span className="text-slate-500 dark:text-slate-400 block">Accredited Reviewers</span>
            <span className="text-lg font-bold font-serif text-slate-900 dark:text-slate-100">
              {acceptedReviewers.length}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-stone-800/50">
            <span className="text-slate-500 dark:text-slate-400 block">Review Standard</span>
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Double-Blind</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-stone-800/50">
            <span className="text-slate-500 dark:text-slate-400 block">Ethical Guidelines</span>
            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">COPE Compliant</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-stone-800/50">
            <span className="text-slate-500 dark:text-slate-400 block">Avg. Review Cycle</span>
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">21–28 Days</span>
          </div>
        </div>
      </motion.div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200/90 dark:border-stone-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search reviewers by name, affiliation, country, or expertise..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#102344]"
          />
        </div>
        {tracks.length > 0 && (
          <select
            value={selectedTrack}
            onChange={(e) => setSelectedTrack(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#102344]"
          >
            <option value="all">All Academic Tracks</option>
            {tracks.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Reviewer Cards Grid or Honest Empty State */}
      {acceptedReviewers.length === 0 ? (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-12 text-center space-y-3">
          <GraduationCap className="w-10 h-10 mx-auto text-stone-400" />
          <h4 className="font-serif text-lg font-bold text-stone-800 dark:text-stone-200">
            Reviewer information will be updated soon.
          </h4>
          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto">
            Accredited peer reviewers appointed by the Editorial Board will be listed here.
          </p>
        </div>
      ) : filteredReviewers.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-stone-900 rounded-xl border border-stone-200/90 dark:border-stone-800 text-slate-500 dark:text-slate-400 space-y-2">
          <p className="font-serif text-lg">No reviewers found matching your filter criteria.</p>
          <p className="text-xs">Try adjusting your search keywords or track selection.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReviewers.map((reviewer) => {
            const initials = getInitials(reviewer.name);
            const avatarColor = getAvatarColor(reviewer.name);

            return (
              <div
                key={reviewer.id}
                className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200/90 dark:border-stone-800 p-5 shadow-2xs hover:shadow-sm transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start gap-3.5">
                    {reviewer.imageUrl ? (
                      <img
                        src={reviewer.imageUrl}
                        alt={reviewer.name}
                        className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-stone-700 shrink-0"
                      />
                    ) : (
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-serif font-bold text-sm shrink-0 ${avatarColor}`}
                      >
                        {initials}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-serif font-semibold text-slate-900 dark:text-slate-100 text-base">
                          {reviewer.name}
                        </h3>
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          Accredited
                        </span>
                      </div>
                      {reviewer.title && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          {reviewer.title}
                        </p>
                      )}
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 mt-1">
                        <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{reviewer.affiliation}</span>
                      </div>
                      {reviewer.country && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{reviewer.country}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {reviewer.track && (
                    <div className="text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-stone-800/60 px-2.5 py-1 rounded border border-slate-200/60 dark:border-stone-700/60">
                      Track: <span className="font-semibold">{reviewer.track}</span>
                    </div>
                  )}

                  {reviewer.expertise && (
                    <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Expertise: </span>
                      {reviewer.expertise}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-stone-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  {reviewer.orcid ? (
                    <a
                      href={reviewer.orcid.startsWith('http') ? reviewer.orcid : `https://orcid.org/${reviewer.orcid}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[#a6ce39] hover:underline font-mono text-[11px]"
                    >
                      <span>ORCID: {reviewer.orcid.replace('https://orcid.org/', '')}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-[11px] font-mono text-slate-400">CHSSH Peer College</span>
                  )}
                  {reviewer.email && (
                    <span className="text-[11px] text-slate-400">Verified Scholar</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Application Modal */}
      <AnimatePresence>
        {showApplyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-stone-900 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-stone-200 dark:border-stone-800 shadow-2xl p-6 sm:p-8 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-[#102344] dark:text-sky-400" />
                  <h2 className="text-lg font-serif font-bold text-slate-900 dark:text-slate-100">
                    Apply to Join the Reviewer Board
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-stone-800 text-slate-400 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {applicationSubmitted ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <UserCheck className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-slate-100">
                    Application Successfully Received
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                    Thank you for applying to the CHSSH Peer Review College. Your academic credentials and
                    expertise will be evaluated by the Editor-in-Chief. You will receive an official notification
                    via email within 3–5 business days.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowApplyModal(false)}
                    className="px-6 py-2 rounded-lg bg-[#102344] text-white text-xs font-semibold cursor-pointer"
                  >
                    Close Window
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplySubmit} className="space-y-4 text-xs">
                  {formError && (
                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300">
                      {formError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Full Name &amp; Academic Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="e.g. Dr. Jane Smith"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Academic Position / Rank
                      </label>
                      <input
                        type="text"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="e.g. Associate Professor"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Institutional Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="scholar@university.edu"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        value={form.country}
                        onChange={(e) => setForm({ ...form, country: e.target.value })}
                        placeholder="e.g. Germany"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Institutional Affiliation &amp; Department *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.affiliation}
                      onChange={(e) => setForm({ ...form, affiliation: e.target.value })}
                      placeholder="e.g. Department of Sociology, University of Heidelberg"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Primary Academic Track
                      </label>
                      <select
                        value={form.track}
                        onChange={(e) => setForm({ ...form, track: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-slate-100"
                      >
                        <option value="Political Economy & Global Governance">Political Economy &amp; Global Governance</option>
                        <option value="Cultural Studies & Critical Theory">Cultural Studies &amp; Critical Theory</option>
                        <option value="Digital Humanities & AI Ethics">Digital Humanities &amp; AI Ethics</option>
                        <option value="Sociology of Labor & Social Movements">Sociology of Labor &amp; Social Movements</option>
                        <option value="Environmental Ethics & Spatial Justice">Environmental Ethics &amp; Spatial Justice</option>
                        <option value="Media Ecology & Public Discourse">Media Ecology &amp; Public Discourse</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                        ORCID iD
                      </label>
                      <input
                        type="text"
                        value={form.orcid}
                        onChange={(e) => setForm({ ...form, orcid: e.target.value })}
                        placeholder="0000-0002-XXXX-XXXX"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-slate-100 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Key Research Areas &amp; Methodological Expertise *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.expertise}
                      onChange={(e) => setForm({ ...form, expertise: e.target.value })}
                      placeholder="e.g. Critical Discourse Analysis, Algorithmic Bias, Digital Ethnography"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Brief Academic Statement &amp; Prior Reviewing Experience
                    </label>
                    <textarea
                      rows={3}
                      value={form.bioStatement}
                      onChange={(e) => setForm({ ...form, bioStatement: e.target.value })}
                      placeholder="Outline your scholarly background, publications, or journal peer review assignments..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-stone-800">
                    <button
                      type="button"
                      onClick={() => setShowApplyModal(false)}
                      className="px-4 py-2 rounded-lg border border-slate-200 dark:border-stone-700 text-slate-600 dark:text-slate-300 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2 rounded-lg bg-[#102344] text-white font-medium hover:bg-[#1a386c] transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isSubmitting ? 'Submitting...' : 'Submit Reviewer Application'}</span>
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
