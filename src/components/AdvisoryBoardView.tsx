import React, { useState } from 'react';
import { useJournal } from '../context/JournalContext';
import { EditableText } from './EditableText';
import { motion } from 'motion/react';
import {
  GraduationCap,
  Globe,
  Mail,
  ShieldCheck,
  Settings,
  Search,
  Users,
  ArrowRight,
  Award
} from 'lucide-react';
import { getInitials, getAvatarColor } from '../utils/imageUtils';
import { AdvisoryCategory } from '../types';

export const AdvisoryBoardView: React.FC = () => {
  const { advisoryBoard, setActiveTab, setAdminActiveSubTab, isAdmin } = useJournal();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'All Advisors' },
    { id: 'international', label: 'International Board' },
    { id: 'scientific', label: 'Scientific Council' },
    { id: 'honorary', label: 'Honorary Fellows' },
    { id: 'policy', label: 'Policy & Governance' },
  ];

  const approvedAdvisors = advisoryBoard.filter(
    (member) => (member as any).status !== 'draft' && (member as any).status !== 'pending'
  );

  const filteredAdvisors = approvedAdvisors.filter((member) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      member.name.toLowerCase().includes(term) ||
      member.role.toLowerCase().includes(term) ||
      member.affiliation.toLowerCase().includes(term) ||
      member.country.toLowerCase().includes(term) ||
      member.expertise.toLowerCase().includes(term);
    const matchesCategory =
      selectedCategory === 'all' || member.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const countriesCount = new Set(approvedAdvisors.map((m) => m.country)).size;
  const institutionsCount = new Set(approvedAdvisors.map((m) => m.affiliation)).size;

  const getCategoryBadgeClass = (category?: AdvisoryCategory) => {
    switch (category) {
      case 'international':
        return 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800';
      case 'scientific':
        return 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'honorary':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'policy':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      default:
        return 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const getCategoryLabel = (category?: AdvisoryCategory) => {
    switch (category) {
      case 'international':
        return 'International Advisory Board';
      case 'scientific':
        return 'Scientific Advisory Council';
      case 'honorary':
        return 'Distinguished Honorary Fellow';
      case 'policy':
        return 'Policy & Academic Ethics';
      default:
        return 'Advisory Member';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Masthead Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-stone-900 rounded-2xl shadow-xs border border-stone-200/90 dark:border-stone-800 p-6 sm:p-8 space-y-4 transition-colors"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#1c355e] dark:text-sky-400 uppercase tracking-widest font-mono">
            <GraduationCap className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span>
              <EditableText id="advisory_badge" placeholder="International Scientific Governance" />
            </span>
          </div>
          {isAdmin && (
            <button
              type="button"
              onClick={() => {
                setAdminActiveSubTab('advisory');
                setActiveTab('admin');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#1c355e] hover:bg-[#23467d] text-white shadow-xs cursor-pointer transition w-fit"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Modify Advisory Board in Admin Panel</span>
            </button>
          )}
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100">
          <EditableText id="advisory_title" placeholder="International Advisory Board" />
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-serif max-w-3xl leading-relaxed">
          <EditableText
            id="advisory_description"
            multiline
            placeholder="A consultative council of eminent international scholars, university deans, and senior researchers providing strategic counsel on journal scope, research integrity standards, open science compliance, and interdisciplinary scholarship worldwide."
          />
        </p>

        {/* Global Impact Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-stone-100 dark:border-stone-800/80">
          <div className="bg-stone-50 dark:bg-stone-850 p-3 rounded-xl border border-stone-200/60 dark:border-stone-800">
            <div className="text-xl sm:text-2xl font-serif font-bold text-[#1c355e] dark:text-sky-300">
              {advisoryBoard.length}
            </div>
            <div className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
              Distinguished Scholars
            </div>
          </div>
          <div className="bg-stone-50 dark:bg-stone-850 p-3 rounded-xl border border-stone-200/60 dark:border-stone-800">
            <div className="text-xl sm:text-2xl font-serif font-bold text-[#1c355e] dark:text-sky-300">
              {institutionsCount}
            </div>
            <div className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
              Global Universities
            </div>
          </div>
          <div className="bg-stone-50 dark:bg-stone-850 p-3 rounded-xl border border-stone-200/60 dark:border-stone-800">
            <div className="text-xl sm:text-2xl font-serif font-bold text-[#1c355e] dark:text-sky-300">
              {countriesCount}
            </div>
            <div className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
              Countries Represented
            </div>
          </div>
          <div className="bg-stone-50 dark:bg-stone-850 p-3 rounded-xl border border-stone-200/60 dark:border-stone-800">
            <div className="text-xl sm:text-2xl font-serif font-bold text-emerald-600 dark:text-emerald-400">
              100%
            </div>
            <div className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
              Double-Blind Standard
            </div>
          </div>
        </div>
      </motion.div>

      {/* Advisory Council Mandate Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="bg-[#0f1f38] dark:bg-slate-850 text-white rounded-2xl p-6 sm:p-8 border border-[#1c355e]/50 dark:border-slate-750 shadow-md space-y-3 relative overflow-hidden"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-widest text-sky-300 font-mono flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <EditableText id="advisory_mandate_badge" placeholder="Council Charter & Terms of Reference" />
          </span>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#1c355e] text-sky-200 border border-sky-400/40 font-mono">
            COPE-Aligned Governance
          </span>
        </div>
        <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
          <EditableText
            id="advisory_statement_title"
            placeholder="Commitment to Editorial Independence & Scholarly Rigor"
          />
        </h3>
        <p className="text-xs sm:text-sm text-stone-300 font-serif leading-relaxed text-justify max-w-4xl">
          <EditableText
            id="advisory_statement_text"
            multiline
            placeholder='"The International Advisory Board functions as the sovereign guarantor of academic freedom, ethical oversight, and intellectual diversity for Contemporary Horizons. Members advise on emerging thematic frontiers, safeguard author and peer review rights against conflicts of interest, and ensure our published corpus reflects rigorous epistemological contribution across the global human sciences."'
          />
        </p>
      </motion.div>

      {/* Search and Category Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 bg-white dark:bg-stone-900 p-1.5 rounded-xl border border-stone-200/90 dark:border-stone-800 shadow-2xs">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#1c355e] text-white shadow-xs font-semibold'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative min-w-[240px] sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search scholars, university, country..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-stone-900 dark:text-stone-100 placeholder-stone-400 outline-none focus:ring-2 focus:ring-[#1c355e] shadow-2xs"
            />
          </div>
        </div>

        {/* Advisors Grid */}
        <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
            Advisory Board Members ({filteredAdvisors.length} of {approvedAdvisors.length})
          </h3>
          <span className="text-xs text-stone-500 dark:text-stone-400 font-mono">
            Peer Reviewed &amp; Appointed Council
          </span>
        </div>

        {approvedAdvisors.length === 0 ? (
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-12 text-center space-y-3">
            <GraduationCap className="w-10 h-10 mx-auto text-stone-400" />
            <h4 className="font-serif text-lg font-bold text-stone-800 dark:text-stone-200">
              Advisory Board information will be updated soon.
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto">
              Official board members are appointed by the Editorial Council and will appear here once approved.
            </p>
          </div>
        ) : filteredAdvisors.length === 0 ? (
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-12 text-center space-y-3">
            <GraduationCap className="w-10 h-10 mx-auto text-stone-400" />
            <h4 className="font-serif text-lg font-bold text-stone-800 dark:text-stone-200">
              No Advisory Members Found
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto">
              No members matched the filter &ldquo;{searchTerm}&rdquo;. Try another search term or select &ldquo;All Advisors&rdquo;.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAdvisors.map((member, idx) => {
              const colors = getAvatarColor(member.name);
              const initials = getInitials(member.name);
              return (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: idx * 0.04 }}
                  whileHover={{ y: -2, transition: { duration: 0.15 } }}
                  className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200/90 dark:border-stone-800 p-5 shadow-2xs space-y-3 hover:shadow-xs hover:border-[#1c355e]/40 dark:hover:border-sky-500/40 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start gap-4">
                      <div className="relative shrink-0">
                        {member.imageUrl ? (
                          <img
                            src={member.imageUrl}
                            alt={member.name}
                            referrerPolicy="no-referrer"
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border-2 border-[#1c355e]/25 dark:border-sky-500/35 shadow-xs bg-stone-100 dark:bg-stone-800"
                          />
                        ) : (
                          <div
                            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex flex-col items-center justify-center font-serif font-bold text-lg border ${colors.bg} ${colors.text} ${colors.border} shadow-2xs`}
                          >
                            <span>{initials}</span>
                            <span className="text-[9px] uppercase tracking-tighter opacity-70 font-sans font-medium">Advisor</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${getCategoryBadgeClass(
                              member.category
                            )}`}
                          >
                            {getCategoryLabel(member.category)}
                          </span>
                        </div>
                        <h4 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 truncate">
                          {member.name}
                        </h4>
                        <div className="text-xs font-semibold text-[#1c355e] dark:text-sky-400">
                          {member.role}
                        </div>
                        <div className="text-xs text-stone-700 dark:text-stone-300 font-sans flex items-center gap-1 flex-wrap">
                          <Globe className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span>{member.affiliation}</span>
                          <span className="text-stone-400"> </span>
                          <span className="font-semibold text-stone-800 dark:text-stone-200">{member.country}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-stone-600 dark:text-stone-300 bg-stone-50 dark:bg-stone-850 p-3 rounded-lg border border-stone-200/70 dark:border-stone-800 leading-relaxed font-sans">
                      <span className="font-semibold text-stone-800 dark:text-stone-200">Domain &amp; Expertise: </span>
                      {member.expertise}
                    </div>

                    {member.bio && (
                      <p className="text-xs text-stone-500 dark:text-stone-400 font-serif italic leading-relaxed line-clamp-3">
                        &ldquo;{member.bio}&rdquo;
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
                    {member.orcid ? (
                      <a
                        href={`https://orcid.org/${member.orcid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#a6ce39] dark:text-[#b5e03e] hover:underline font-mono"
                      >
                        <span className="w-3 h-3 rounded-full bg-[#a6ce39] text-white flex items-center justify-center text-[8px] font-bold">iD</span>
                        <span>{member.orcid}</span>
                      </a>
                    ) : (
                      <span className="font-mono text-stone-400">Verified Advisor</span>
                    )}
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="inline-flex items-center gap-1 text-sky-600 dark:text-sky-400 hover:underline font-mono"
                      >
                        <Mail className="w-3 h-3" />
                        <span>{member.email}</span>
                      </a>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cross-linking cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1c355e] dark:text-sky-400 uppercase tracking-widest font-mono">
              <Users className="w-4 h-4" />
              <span>Editorial Board</span>
            </div>
            <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
              Meet the Journal Editors &amp; Section Chairs
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 font-serif leading-relaxed">
              Explore the executive editorial masthead overseeing double-blind peer review, copyediting, and issue publication.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setActiveTab('editorial');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer w-fit"
          >
            <span>View Editorial Board</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1c355e] dark:text-sky-400 uppercase tracking-widest font-mono">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Peer Reviewers Panel</span>
            </div>
            <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
              Peer Reviewers Directory &amp; Applications
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 font-serif leading-relaxed">
              Consult appointed peer evaluators across tracks or submit an application to join our accredited reviewing panel.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setActiveTab('reviewers');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer w-fit"
          >
            <span>Explore Reviewers &amp; Apply</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
