import React from 'react';
import { useJournal } from '../context/JournalContext';
import { EditableText } from './EditableText';
import { motion } from 'motion/react';
import { FileCheck, ArrowRight, Settings } from 'lucide-react';

export const AuthorGuidelines: React.FC = () => {
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
            <FileCheck className="w-4 h-4" />
            <span>
              <EditableText id="guidelines_badge" placeholder="Author Portal" />
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
          <EditableText id="guidelines_title" placeholder="Author Submission Guidelines" />
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-serif leading-relaxed">
          <EditableText id="guidelines_subtitle" placeholder="Comprehensive instructions for preparing and submitting your scholarly manuscript" />
        </p>
      </motion.div>

      {/* Guidelines Content */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="bg-white dark:bg-stone-900 rounded-2xl shadow-xs border border-stone-200/90 dark:border-stone-800 p-6 sm:p-8 space-y-8 transition-colors"
      >
        {/* Section 1: Prep & Formatting */}
        <section className="space-y-2">
          <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 border-b border-stone-200 dark:border-stone-800 pb-1.5">
            <EditableText id="guidelines_prep_heading" placeholder="1. Manuscript Preparation & Formatting" />
          </h3>
          <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 font-serif leading-relaxed text-justify">
            <EditableText
              id="guidelines_prep_text"
              multiline
              placeholder="Manuscripts must be formatted in double-spaced 12pt Times New Roman or Georgia font with 1-inch margins throughout..."
            />
          </p>
        </section>

        {/* Section 2: Blind Review */}
        <section className="space-y-2">
          <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 border-b border-stone-200 dark:border-stone-800 pb-1.5">
            <EditableText id="guidelines_format_heading" placeholder="2. Anonymization for Blind Review" />
          </h3>
          <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 font-serif leading-relaxed text-justify">
            <EditableText
              id="guidelines_format_text"
              multiline
              placeholder="To ensure an impartial double-blind review, authors must submit a Title Page as a separate file, while ensuring the Main Manuscript contains zero identifying references..."
            />
          </p>
        </section>

        {/* Section 3: Ethics */}
        <section className="space-y-2">
          <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 border-b border-stone-200 dark:border-stone-800 pb-1.5">
            <EditableText id="guidelines_ethics_heading" placeholder="3. Publication Ethics & Originality" />
          </h3>
          <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 font-serif leading-relaxed text-justify">
            <EditableText
              id="guidelines_ethics_text"
              multiline
              placeholder="CHSSH adheres strictly to the Committee on Publication Ethics (COPE) core practices. All submissions undergo algorithmic similarity checking via Crossref Similarity Check..."
            />
          </p>
        </section>

        {/* Section 4: Fees & APC */}
        <section className="space-y-2">
          <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 border-b border-stone-200 dark:border-stone-800 pb-1.5">
            <EditableText id="guidelines_fee_heading" placeholder="4. Open Access & Article Processing Charges (APC)" />
          </h3>
          <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 font-serif leading-relaxed text-justify">
            <EditableText
              id="guidelines_fee_text"
              multiline
              placeholder="To democratize scholarly dissemination, CHSSH operates on a fully subsidized Gold Open Access model. All accepted papers are immediately and permanently made free to read..."
            />
          </p>
        </section>

        {/* Review Workflow Diagram */}
        <section className="pt-4 border-t border-stone-200 dark:border-stone-800 space-y-4">
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
              <EditableText id="review_policy_title" placeholder="The Editorial & Review Workflow" />
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 font-serif">
              <EditableText id="review_policy_desc" placeholder="Transparent, constructive, and expeditious peer review designed to strengthen academic contributions" />
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="bg-slate-50/90 dark:bg-slate-850 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1">
              <div className="text-xs font-bold text-[#1c355e] dark:text-sky-400">
                <EditableText id="review_step1_title" placeholder="1. Initial Editorial Desk Review (Days 1 5)" />
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-serif leading-relaxed">
                <EditableText id="review_step1_desc" placeholder="The Editor-in-Chief assesses scope alignment, formatting compliance, and originality index before assigning a Section Editor." />
              </p>
            </div>
            <div className="bg-slate-50/90 dark:bg-slate-850 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1">
              <div className="text-xs font-bold text-[#1c355e] dark:text-sky-400">
                <EditableText id="review_step2_title" placeholder="2. Double-Blind Peer Review (Days 6 25)" />
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-serif leading-relaxed">
                <EditableText id="review_step2_desc" placeholder="At least two independent subject-matter experts evaluate theoretical novelty, methodological rigour, and clarity." />
              </p>
            </div>
            <div className="bg-slate-50/90 dark:bg-slate-850 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1">
              <div className="text-xs font-bold text-[#1c355e] dark:text-sky-400">
                <EditableText id="review_step3_title" placeholder="3. Revision & Resubmission (Days 26 45)" />
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-serif leading-relaxed">
                <EditableText id="review_step3_desc" placeholder="Authors receive detailed reviewer rubrics with editorial recommendations (Minor Revisions, Major Revisions, or Rejection)." />
              </p>
            </div>
            <div className="bg-slate-50/90 dark:bg-slate-850 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1">
              <div className="text-xs font-bold text-[#1c355e] dark:text-sky-400">
                <EditableText id="review_step4_title" placeholder="4. Acceptance & Online First (Days 46 60)" />
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-serif leading-relaxed">
                <EditableText id="review_step4_desc" placeholder="Accepted manuscripts undergo professional copyediting, DOI assignment, XML tagging, and immediate Online-First publication." />
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-4">
          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            <EditableText id="guidelines_cta_ready" placeholder="Ready to submit your manuscript?" />
          </span>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => setActiveTab('submit')}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-[#1c355e] hover:bg-[#102344] text-white rounded-xl text-xs font-semibold shadow-2xs transition cursor-pointer"
          >
            <span>
              <EditableText id="guidelines_cta_button" placeholder="Proceed to Submission Portal" />
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
