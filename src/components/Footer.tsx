import React from 'react';
import { useJournal } from '../context/JournalContext';
import { EditableText } from './EditableText';
import { ThemeToggle } from './ThemeToggle';
import { JournalCrest } from './JournalCrest';
import { Mail, Phone, MapPin, Clock, Lock, Shield, ExternalLink, Database } from 'lucide-react';

interface FooterProps {
  onOpenAdminLogin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdminLogin }) => {
  const { setActiveTab, isAdmin } = useJournal();

  return (
    <footer className="bg-[#0a162b] text-slate-300 text-xs border-t border-[#1c355e]/60 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Masthead Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3.5">
              <JournalCrest size="md" className="shrink-0" />
              <div>
                <div className="font-serif text-lg sm:text-xl font-bold text-white">
                  <EditableText id="journal_name" placeholder="Contemporary Horizons in Social Sciences and Humanities" />
                </div>
                <div className="text-[11px] font-mono text-sky-400 font-semibold tracking-wider">
                  CHSSH   A MULTIDISCIPLINARY PEER REVIEW JOURNAL
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 font-serif italic max-w-lg leading-relaxed">
              <EditableText
                id="journal_tagline"
                multiline
                placeholder="An International, Peer-Reviewed, Open-Access Journal of Critical Scholarship"
              />
            </p>
            <div className="pt-2 text-[11px] text-slate-400 space-y-1">
              <div>
                Published by: <strong className="text-slate-200"><EditableText id="publisher" placeholder="Horizon Scholarly Academic Press" /></strong>
              </div>
              <div>
                Frequency: <EditableText id="frequency" placeholder="Quarterly (4 issues per annum)" />
              </div>
              <div className="text-sky-300/90">
                <EditableText
                  id="footer_ethics_note"
                  multiline
                  placeholder="Member of the Committee on Publication Ethics (COPE). Committed to diversity, equity, and ethical academic publishing."
                />
              </div>
            </div>
          </div>

          {/* Col 2: Navigation & Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              <EditableText id="footer_links_heading" placeholder="Journal Links" />
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={() => { setActiveTab('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-sky-300 transition cursor-pointer"
                >
                  <EditableText id="nav_home" placeholder="Home" />
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => { setActiveTab('current'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-sky-300 transition cursor-pointer"
                >
                  <EditableText id="nav_current_issue" placeholder="Current Issue" />
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => { setActiveTab('archive'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-sky-300 transition cursor-pointer"
                >
                  <EditableText id="nav_archive" placeholder="Archive & Search" />
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => { setActiveTab('aims'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-sky-300 transition cursor-pointer"
                >
                  <EditableText id="nav_aims_scope" placeholder="Aims & Scope" />
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => { setActiveTab('guidelines'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-sky-300 transition cursor-pointer"
                >
                  <EditableText id="nav_author_guidelines" placeholder="Author Submission Guidelines" />
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => { setActiveTab('editorial'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-sky-300 transition cursor-pointer"
                >
                  <EditableText id="nav_editorial_board" placeholder="Editorial Board" />
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => { setActiveTab('advisory'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-sky-300 transition cursor-pointer"
                >
                  <EditableText id="nav_advisory" placeholder="International Advisory Board" />
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => { setActiveTab('reviewers'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-sky-300 transition cursor-pointer"
                >
                  <EditableText id="nav_reviewers" placeholder="Peer Reviewers Panel" />
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => { setActiveTab('downloads'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-sky-300 transition cursor-pointer"
                >
                  <EditableText id="nav_downloads" placeholder="Downloads & Document Repository" />
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => { setActiveTab('track'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-sky-300 transition cursor-pointer"
                >
                  <EditableText id="nav_track_submission" placeholder="Track Submission Status" />
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact Secretariat */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              <EditableText id="contact_title" placeholder="Editorial Secretariat & Inquiries" />
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <Mail className="w-3.5 h-3.5 shrink-0 mt-0.5 text-sky-400" />
                <span>
                  <EditableText id="contact_email" placeholder="editorial@contemporaryhorizons.org" />
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="w-3.5 h-3.5 shrink-0 mt-0.5 text-sky-400" />
                <span>
                  <EditableText id="contact_phone" placeholder="+44 (0) 131 650 1000" />
                </span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-sky-400" />
                <span className="leading-snug">
                  <EditableText
                    id="contact_office"
                    multiline
                    placeholder="Chrystal Macmillan Building, George Square, Edinburgh EH8 9LD, United Kingdom"
                  />
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 shrink-0 mt-0.5 text-sky-400" />
                <span>
                  <EditableText id="contact_hours" placeholder="Monday   Friday: 09:00   17:00 GMT" />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            <EditableText
              id="footer_copyright"
              multiline
              placeholder="  2026 Contemporary Horizons in Social Sciences and Humanities. Published under Creative Commons Attribution 4.0 International License (CC BY 4.0)."
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:flex items-center gap-1.5 text-slate-400 text-[10px]">
              <Database className="w-2.5 h-2.5 text-sky-400" />
              <span>Google Cloud Firestore</span>
            </span>
            <ThemeToggle variant="pill" />
            {isAdmin ? (
              <span className="text-sky-400 font-semibold flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Admin Session Active
              </span>
            ) : (
              <button
                type="button"
                onClick={onOpenAdminLogin}
                className="text-slate-400 hover:text-slate-200 flex items-center gap-1 transition cursor-pointer"
              >
                <Lock className="w-3 h-3 text-sky-400" />
                <span>Admin Login</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
