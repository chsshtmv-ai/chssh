import React from 'react';
import { useJournal } from '../context/JournalContext';
import { EditableText } from './EditableText';
import { motion } from 'motion/react';
import { Bookmark, Layers, ArrowRight, Settings } from 'lucide-react';

export const AimsAndScope: React.FC = () => {
  const { setActiveTab, setAdminActiveSubTab, isAdmin } = useJournal();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-stone-900 rounded-2xl shadow-xs border border-stone-200/90 dark:border-stone-800 p-6 sm:p-8 space-y-3 transition-colors"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#1c355e] dark:text-sky-400 uppercase tracking-widest">
            <Bookmark className="w-4 h-4" />
            <span>
              <EditableText id="aims_badge" placeholder="Editorial Statement" />
            </span>
          </div>
          {isAdmin && (
            <button
              type="button"
              onClick={() => {
                setAdminActiveSubTab('texts');
                setActiveTab('admin');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#1c355e] hover:bg-[#23467d] text-white shadow-xs cursor-pointer transition w-fit"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Edit Texts in Admin Panel</span>
            </button>
          )}
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100">
          <EditableText id="aims_title" placeholder="Aims & Scholarly Scope" />
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-serif leading-relaxed">
          <EditableText id="aims_subtitle" placeholder="Fostering rigorous interdisciplinary dialogues across continents and methodologies" />
        </p>
      </motion.div>

      {/* Main Narrative Blocks */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="bg-white dark:bg-stone-900 rounded-2xl shadow-xs border border-stone-200/90 dark:border-stone-800 p-6 sm:p-8 space-y-6 transition-colors"
      >
        <div className="prose prose-stone max-w-none space-y-4 text-stone-800 dark:text-stone-200 text-xs sm:text-sm font-serif leading-relaxed text-justify">
          <div className="bg-blue-50/60 dark:bg-[#102344]/40 p-5 rounded-xl border border-blue-200/80 dark:border-sky-800/60 text-stone-800 dark:text-stone-200">
            <EditableText
              id="aims_p1"
              multiline
              placeholder="Contemporary Horizons in Social Sciences and Humanities (CHSSH) is committed to publishing groundbreaking, methodologically diverse scholarship..."
            />
          </div>
          <div className="pt-2">
            <EditableText
              id="aims_p2"
              multiline
              placeholder="The journal welcomes original research papers, systematic literature syntheses, methodology critiques, conceptual treatises, and scholarly reviews from researchers worldwide..."
            />
          </div>
        </div>

        {/* Thematic Areas */}
        <div className="pt-6 border-t border-stone-200 dark:border-stone-800 space-y-4">
          <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#1c355e] dark:text-sky-400" />
            <span>
              <EditableText id="aims_thematic_title" placeholder="Subject Areas & Thematic Clusters" />
            </span>
          </h3>
          <div className="bg-stone-50 dark:bg-stone-850 p-5 rounded-xl border border-stone-200/80 dark:border-stone-800 text-xs sm:text-sm text-stone-800 dark:text-stone-200 leading-relaxed font-sans">
            <EditableText
              id="aims_scope_areas"
              multiline
              placeholder="Sociology & Social Theory   Cultural Studies & Critical Theory   Political Philosophy & Global Governance   Digital Humanities & Computational Social Science   History, Memory & Archival Studies   Environmental Humanities & Urban Ecology   Gender, Sexuality & Intersectionality   Anthropology & Qualitative Ethnography   Applied Ethics & Epistemic Justice"
            />
          </div>
        </div>

        {/* Editorial Standards Callout */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
          <div className="p-4 bg-stone-50/80 dark:bg-stone-850 rounded-xl border border-stone-200/80 dark:border-stone-800 space-y-1.5">
            <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wide">
              <EditableText id="aims_pillar1_title" placeholder="Double-Blind Peer Review" />
            </h4>
            <p className="text-xs text-stone-600 dark:text-stone-400 font-sans leading-relaxed">
              <EditableText id="aims_pillar1_desc" placeholder="Impartial evaluations with blinded manuscript files to ensure unbiased merit assessment." />
            </p>
          </div>
          <div className="p-4 bg-stone-50/80 dark:bg-stone-850 rounded-xl border border-stone-200/80 dark:border-stone-800 space-y-1.5">
            <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wide">
              <EditableText id="aims_pillar2_title" placeholder="Subsidized Gold OA" />
            </h4>
            <p className="text-xs text-stone-600 dark:text-stone-400 font-sans leading-relaxed">
              <EditableText id="aims_pillar2_desc" placeholder="Freely accessible immediately upon release without subscription paywalls under CC BY 4.0." />
            </p>
          </div>
          <div className="p-4 bg-stone-50/80 dark:bg-stone-850 rounded-xl border border-stone-200/80 dark:border-stone-800 space-y-1.5">
            <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wide">
              <EditableText id="aims_pillar3_title" placeholder="COPE Adherence" />
            </h4>
            <p className="text-xs text-stone-600 dark:text-stone-400 font-sans leading-relaxed">
              <EditableText id="aims_pillar3_desc" placeholder="Rigorous compliance with the Committee on Publication Ethics core practices and iThenticate screening." />
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="pt-6 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between flex-wrap gap-4">
          <span className="text-xs text-stone-600 dark:text-stone-400 font-medium">
            <EditableText id="aims_cta_question" placeholder="Have an empirical or conceptual manuscript aligned with our scope?" />
          </span>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => setActiveTab('submit')}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-[#1c355e] hover:bg-[#102344] text-white rounded-xl text-xs font-semibold shadow-2xs transition cursor-pointer"
          >
            <span>
              <EditableText id="aims_cta_button" placeholder="Submit Manuscript for Review" />
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
