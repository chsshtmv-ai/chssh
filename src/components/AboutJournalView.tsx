import React from 'react';
import { useJournal } from '../context/JournalContext';
import { EditableText } from './EditableText';
import { motion } from 'motion/react';
import { BookOpen, History, Target, ShieldCheck, Building, Settings, ArrowRight, Award } from 'lucide-react';

export const AboutJournalView: React.FC = () => {
  const { setActiveTab, setAdminActiveSubTab, isAdmin } = useJournal();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-stone-900 rounded-2xl shadow-xs border border-stone-200/90 dark:border-stone-800 p-6 sm:p-8 space-y-3 transition-colors"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#1c355e] dark:text-sky-400 uppercase tracking-widest">
            <BookOpen className="w-4 h-4" />
            <span>
              <EditableText id="about_badge" placeholder="About the Journal" />
            </span>
          </div>
          {isAdmin && (
            <button
              type="button"
              onClick={() => {
                setAdminActiveSubTab('about-cms' as any);
                setActiveTab('admin');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#1c355e] hover:bg-[#23467d] text-white shadow-xs cursor-pointer transition w-fit"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Edit About Page in CMS</span>
            </button>
          )}
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100">
          <EditableText id="about_title" placeholder="About Contemporary Horizons in Social Sciences and Humanities" />
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-serif leading-relaxed">
          <EditableText id="about_subtitle" placeholder="An International, Peer-Reviewed, Open-Access Forum for Critical Academic Inquiry" />
        </p>
      </motion.div>

      {/* Main Narrative Content */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="bg-white dark:bg-stone-900 rounded-2xl shadow-xs border border-stone-200/90 dark:border-stone-800 p-6 sm:p-8 space-y-8 transition-colors"
      >
        {/* Journal Introduction */}
        <section className="space-y-3">
          <div className="bg-blue-50/60 dark:bg-[#102344]/40 p-5 rounded-xl border border-blue-200/80 dark:border-sky-800/60 text-stone-800 dark:text-stone-200 text-xs sm:text-sm font-serif leading-relaxed text-justify">
            <EditableText
              id="about_description"
              multiline
              placeholder="Contemporary Horizons in Social Sciences and Humanities (CHSSH) is dedicated to advancing theoretical, empirical, and interdisciplinary inquiries. The journal brings together distinguished and emerging scholars across sociology, anthropology, political theory, digital humanities, philosophy, and cultural studies."
            />
          </div>
        </section>

        {/* History and Founding */}
        <section className="space-y-3 border-t border-stone-200 dark:border-stone-800 pt-6">
          <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <History className="w-4 h-4 text-[#1c355e] dark:text-sky-400" />
            <span>
              <EditableText id="about_history_title" placeholder="Journal History & Founding" />
            </span>
          </h2>
          <div className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 font-serif leading-relaxed text-justify">
            <EditableText
              id="about_history_text"
              multiline
              placeholder="Founded to bridge the traditional divide between quantitative sociological methodologies and qualitative humanistic critiques, CHSSH provides an open platform free of corporate subscription paywalls. The journal was founded with the commitment to equitable scholarship and rigorous double-blind peer review."
            />
          </div>
        </section>

        {/* Objectives and Mission */}
        <section className="space-y-4 border-t border-stone-200 dark:border-stone-800 pt-6">
          <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Target className="w-4 h-4 text-[#1c355e] dark:text-sky-400" />
            <span>
              <EditableText id="about_objectives_title" placeholder="Objectives & Mission" />
            </span>
          </h2>
          <div className="bg-stone-50 dark:bg-stone-850 p-5 rounded-xl border border-stone-200/80 dark:border-stone-800 text-xs sm:text-sm text-stone-800 dark:text-stone-200 leading-relaxed font-serif text-justify">
            <EditableText
              id="about_objectives_text"
              multiline
              placeholder="Our core objectives are: (1) To publish high-impact, methodologically rigorous research that addresses contemporary crises; (2) To foster global intellectual exchange across diverse geographical regions; (3) To maintain uncompromising academic integrity and transparent double-blind review; (4) To uphold unconditional Gold Open Access so that academic knowledge remains accessible to all."
            />
          </div>
          <div className="pt-2 text-xs sm:text-sm text-stone-700 dark:text-stone-300 font-serif leading-relaxed text-justify">
            <EditableText
              id="about_mission_text"
              multiline
              placeholder="CHSSH champions academic freedom, epistemic justice, and interdisciplinary collaboration. We actively encourage submissions that challenge orthodox frameworks and propose novel methodologies for analyzing cultural, institutional, and technological transformations."
            />
          </div>
        </section>

        {/* Governance, Ethics & Archiving */}
        <section className="space-y-3 border-t border-stone-200 dark:border-stone-800 pt-6">
          <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#1c355e] dark:text-sky-400" />
            <span>
              <EditableText id="about_policies_title" placeholder="Governance & Archival Policies" />
            </span>
          </h2>
          <div className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 font-serif leading-relaxed text-justify">
            <EditableText
              id="about_policies_text"
              multiline
              placeholder="CHSSH operates under standard Committee on Publication Ethics (COPE) core practices. All articles receive permanent digital object identifiers (DOIs) via Crossref and are archived in Portico and PKP Preservation Network for permanent preservation."
            />
          </div>
        </section>

        {/* Masthead Quick Facts */}
        <div className="border-t border-stone-200 dark:border-stone-800 pt-6 space-y-3">
          <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Building className="w-4 h-4 text-[#1c355e] dark:text-sky-400" />
            <span>Official Masthead Information</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-stone-50 dark:bg-stone-850 rounded-xl border border-stone-200 dark:border-stone-800 space-y-1">
              <span className="text-[11px] text-stone-500 font-sans font-semibold uppercase">Publisher:</span>
              <div className="font-semibold text-stone-800 dark:text-stone-200">
                <EditableText id="publisher" placeholder="Horizon Scholarly Academic Press" />
              </div>
            </div>
            <div className="p-3 bg-stone-50 dark:bg-stone-850 rounded-xl border border-stone-200 dark:border-stone-800 space-y-1">
              <span className="text-[11px] text-stone-500 font-sans font-semibold uppercase">Publication Frequency:</span>
              <div className="font-semibold text-stone-800 dark:text-stone-200">
                <EditableText id="frequency" placeholder="Quarterly (4 issues per annum)" />
              </div>
            </div>
            <div className="p-3 bg-stone-50 dark:bg-stone-850 rounded-xl border border-stone-200 dark:border-stone-800 space-y-1">
              <span className="text-[11px] text-stone-500 font-sans font-semibold uppercase">ISSN (Online / Print):</span>
              <div className="font-mono text-stone-800 dark:text-stone-200">
                <EditableText id="issn_online" placeholder="0000-0000" /> / <EditableText id="issn_print" placeholder="yet to assign" />
              </div>
            </div>
            <div className="p-3 bg-stone-50 dark:bg-stone-850 rounded-xl border border-stone-200 dark:border-stone-800 space-y-1">
              <span className="text-[11px] text-stone-500 font-sans font-semibold uppercase">Crossref DOI Prefix:</span>
              <div className="font-mono text-stone-800 dark:text-stone-200">
                <EditableText id="doi_prefix" placeholder="10.5281/chssh" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-stone-200 dark:border-stone-800">
          <button
            type="button"
            onClick={() => { setActiveTab('aims'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="flex items-center gap-1.5 text-xs font-bold text-[#1c355e] dark:text-sky-400 hover:underline cursor-pointer"
          >
            <span>Explore Aims & Scope</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('submit'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1c355e] hover:bg-[#102344] text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition"
          >
            <span>Submit Your Manuscript</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
