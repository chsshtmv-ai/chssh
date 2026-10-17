import React from 'react';
import { useJournal } from '../context/JournalContext';
import { EditableText } from './EditableText';
import { motion } from 'motion/react';
import { Mail, ShieldCheck, ArrowRight, Settings, GraduationCap, Award } from 'lucide-react';
import { getInitials, getAvatarColor } from '../utils/imageUtils';

export const EditorialBoardView: React.FC = () => {
  const { editorialBoard, setActiveTab, setAdminActiveSubTab, isAdmin } = useJournal();

  const eicMember = editorialBoard.find(
    (m) => m.role.toLowerCase().includes('editor-in-chief') || m.role.toLowerCase().includes('chief editor')
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-stone-900 rounded-2xl shadow-xs border border-stone-200/90 dark:border-stone-800 p-6 sm:p-8 space-y-3 transition-colors"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#1c355e] dark:text-sky-400 uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4" />
            <span>
              <EditableText id="editorial_badge" placeholder="Governance & Scientific Integrity" />
            </span>
          </div>
          {isAdmin && (
            <button
              type="button"
              onClick={() => {
                setAdminActiveSubTab('board');
                setActiveTab('admin');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#1c355e] hover:bg-[#23467d] text-white shadow-xs cursor-pointer transition w-fit"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Modify Board in Admin Panel</span>
            </button>
          )}
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100">
          <EditableText id="editorial_title" placeholder="Editorial Board & Advisory Council" />
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-serif max-w-3xl leading-relaxed">
          <EditableText
            id="editorial_description"
            multiline
            placeholder="An international body of distinguished scholars overseeing double-blind peer review standards, intellectual rigor, and editorial independence across social science and humanistic disciplines."
          />
        </p>
      </motion.div>

      {/* Editor in Chief Profile */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="bg-[#0f1f38] dark:bg-slate-850 text-white rounded-2xl p-6 sm:p-8 border border-[#1c355e]/50 dark:border-slate-750 shadow-md space-y-4 relative overflow-hidden"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-widest text-sky-300 font-mono">
            <EditableText id="eic_badge" placeholder="Editor-in-Chief" />
          </span>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#1c355e] text-sky-200 border border-sky-400/40 font-mono">
            <EditableText id="eic_tenure_badge" placeholder="Tenured Chair" />
          </span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          {eicMember?.imageUrl && (
            <div className="relative shrink-0">
              <img
                src={eicMember.imageUrl}
                alt={eicMember.name}
                referrerPolicy="no-referrer"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-sky-400/60 shadow-lg"
              />
            </div>
          )}
          <div className="space-y-1">
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
              <EditableText id="editor_in_chief_name" placeholder="Prof. Dr. Elizabeth Vance, Ph.D." />
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 font-serif">
              <EditableText id="editor_in_chief_title" placeholder="Chair of Social Policy & Humanistic Inquiry, University of Edinburgh" />
            </p>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-stone-300 font-serif leading-relaxed text-justify max-w-3xl pt-2 border-t border-stone-800 dark:border-stone-750">
          <EditableText
            id="editor_in_chief_statement"
            multiline
            placeholder='"Our mission at Contemporary Horizons is to cultivate critical scholarship that speaks with theoretical bravery and methodological discipline to the existential questions confronting contemporary societies. We are dedicated to transparent, constructive peer review that uplifts scholars across all geographical and epistemic traditions."'
          />
        </p>
      </motion.div>

      {/* Editorial Members Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
            <EditableText id="editorial_members_title" placeholder="Associate Editors & Section Chairs" /> ({editorialBoard.length} Members)
          </h3>
          <span className="text-xs text-stone-500 dark:text-stone-400 font-mono">
            <EditableText id="editorial_members_sub" placeholder="Double-Blind Evaluators" />
          </span>
        </div>
        {editorialBoard.length === 0 ? (
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-12 text-center space-y-3">
            <ShieldCheck className="w-10 h-10 mx-auto text-stone-400" />
            <h4 className="font-serif text-lg font-bold text-stone-800 dark:text-stone-200">
              Editorial Board information will be updated soon.
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto">
              Official editorial appointments approved by the journal council will appear here once published.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {editorialBoard.map((member, idx) => {
              const colors = getAvatarColor(member.name);
              const initials = getInitials(member.name);
              return (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: idx * 0.04 }}
                  whileHover={{ y: -2, transition: { duration: 0.15 } }}
                  className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200/90 dark:border-stone-800 p-5 shadow-2xs space-y-3 hover:shadow-xs hover:border-[#1c355e]/40 dark:hover:border-sky-500/40 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="relative shrink-0">
                      {member.imageUrl ? (
                        <img
                          src={member.imageUrl}
                          alt={member.name}
                          referrerPolicy="no-referrer"
                          className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl object-cover border-2 border-[#1c355e]/25 dark:border-sky-500/35 shadow-xs bg-stone-100 dark:bg-stone-800"
                        />
                      ) : (
                        <div
                          className={`w-16 h-16 sm:w-18 sm:h-18 rounded-xl flex flex-col items-center justify-center font-serif font-bold text-lg border ${colors.bg} ${colors.text} ${colors.border} shadow-2xs`}
                        >
                          <span>{initials}</span>
                          <span className="text-[9px] uppercase tracking-tighter opacity-70 font-sans font-medium">Board</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-1 flex-1">
                      <h4 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                        {member.name}
                      </h4>
                      <div className="text-xs font-semibold text-[#1c355e] dark:text-sky-400">
                        {member.role}
                      </div>
                      <div className="text-xs text-stone-700 dark:text-stone-300 font-sans">
                        <strong className="text-stone-800 dark:text-stone-200">Institution:</strong> {member.affiliation}, {member.country}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-stone-600 dark:text-stone-300 bg-stone-50 dark:bg-stone-850 p-3 rounded-lg border border-stone-200/70 dark:border-stone-800 leading-relaxed font-sans">
                    <span className="font-semibold text-stone-800 dark:text-stone-200">Field &amp; Expertise: </span>
                    {member.expertise}
                  </div>
                  {member.email && (
                    <div className="text-[11px] text-stone-500 dark:text-stone-400 font-mono pt-1 flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-stone-400 dark:text-stone-500" />
                      <span>{member.email}</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Advisory Board Callout Card */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-widest font-mono">
            <GraduationCap className="w-4 h-4" />
            <span>Consultative Scientific Governance</span>
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">
            International Advisory Board &amp; Scientific Council
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 max-w-2xl font-serif">
            Distinguished scholars from international research centers providing strategic guidance on academic ethics, interdisciplinary scope, and publication standards.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setActiveTab('advisory');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1c355e] hover:bg-[#102344] text-white text-xs font-bold shadow-xs transition cursor-pointer shrink-0"
        >
          <span>View Advisory Board</span>
          <ArrowRight className="w-4 h-4 text-sky-300" />
        </button>
      </div>

      {/* Reviewers Callout Card */}
      <div className="bg-gradient-to-r from-[#0f1f38] to-[#1c355e] text-white p-6 sm:p-8 rounded-2xl border border-[#1c355e] shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-300 uppercase tracking-widest font-mono">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Peer Reviewers Panel</span>
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
            Appointed Peer Reviewers &amp; Reviewer Applications
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-serif">
            Our journal operates an accredited international panel of subject-matter peer reviewers. Scholars are invited to apply to join the panel or consult our published directory of reviewers.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setActiveTab('reviewers');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold shadow-md transition cursor-pointer shrink-0"
        >
          <span>Explore Reviewers Directory &amp; Apply</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
