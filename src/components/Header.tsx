import React, { useState } from 'react';
import { useJournal } from '../context/JournalContext';
import { EditableText } from './EditableText';
import { JournalCrest } from './JournalCrest';
import { ThemeToggle } from './ThemeToggle';
import { ThemePaletteSelector } from './ThemePaletteSelector';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  Send,
  Search,
  Users,
  FileCheck,
  Compass,
  Lock,
  Menu,
  X,
  Sparkles,
  Bookmark,
  ArrowUpRight,
  GraduationCap,
  Download,
  Award,
  User,
  LogOut
} from 'lucide-react';

interface HeaderProps {
  onOpenAdminLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAdminLogin }) => {
  const {
    activeTab,
    setActiveTab,
    isAdmin,
    articles,
    currentAuthor,
    isAuthorLoggedIn,
    logoutAuthor,
    openAuthorAuthModal
  } = useJournal();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pendingSubmissions = articles.filter(
    (a) => a.status === 'submitted' || a.status === 'under_review'
  ).length;

  const mainNavItems = [
    { id: 'home', labelKey: 'nav_home', defaultLabel: 'Home', icon: Compass },
    { id: 'current', labelKey: 'nav_current', defaultLabel: 'Current Issue', icon: BookOpen },
    { id: 'archive', labelKey: 'nav_archive', defaultLabel: 'Archive & Search', icon: Search },
    { id: 'aims', labelKey: 'nav_aims', defaultLabel: 'Aims & Scope', icon: Bookmark },
    { id: 'guidelines', labelKey: 'nav_guidelines', defaultLabel: 'Author Guidelines', icon: FileCheck },
    { id: 'editorial', labelKey: 'nav_editorial', defaultLabel: 'Editorial Board', icon: Users },
    { id: 'advisory', labelKey: 'nav_advisory', defaultLabel: 'Advisory Board', icon: GraduationCap },
    { id: 'reviewers', labelKey: 'nav_reviewers', defaultLabel: 'Reviewers', icon: Award },
    { id: 'submit', labelKey: 'nav_submit', defaultLabel: 'Submit Manuscript', icon: Send },
    { id: 'track', labelKey: 'nav_track', defaultLabel: 'Track Submission', icon: Search }
  ];

  // Include downloads if currently navigated to, ensuring route preservation
  const navItems = activeTab === 'downloads'
    ? [...mainNavItems, { id: 'downloads', labelKey: 'nav_downloads', defaultLabel: 'Downloads', icon: Download }]
    : mainNavItems;

  const mobileNavItems = [
    ...mainNavItems,
    { id: 'downloads', labelKey: 'nav_downloads', defaultLabel: 'Downloads', icon: Download }
  ];

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="bg-white dark:bg-[#0f1115] border-b border-stone-200/90 dark:border-stone-800 transition-colors duration-200">
      {/* Sticky Container for the Two Top Bars: Navigation Bar & Utility Bar */}
      <div className="sticky top-0 z-30 shadow-xs backdrop-blur-md">
        {/* ========================================================================= */}
        {/* TOP ROW — MAIN NAVIGATION (Row 1)                                         */}
        {/* ========================================================================= */}
        <nav
          aria-label="Main Journal Navigation"
          className="bg-[#142746] dark:bg-[#0d1a30] text-white border-b border-[#0b172a] shadow-[0_2px_4px_rgba(0,0,0,0.25)] transition-colors"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-2 py-1.5">
              {/* Horizontal Navigation List */}
              <ul className="flex items-center gap-1 overflow-x-auto text-xs font-medium text-white relative no-scrollbar py-0.5 flex-1 min-w-0 scroll-smooth">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <li key={item.id} className="relative shrink-0">
                      <button
                        type="button"
                        onClick={() => handleNavClick(item.id)}
                        className={`group relative flex items-center gap-1.5 px-3 py-2 rounded-sm transition-colors duration-150 cursor-pointer whitespace-nowrap z-10 ${
                          isActive
                            ? 'text-white font-semibold bg-white/[0.08]'
                            : 'text-white/90 hover:text-white hover:bg-[#1E3A63]'
                        }`}
                      >
                        <Icon
                          className={`w-3.5 h-3.5 transition-colors duration-150 ${
                            isActive
                              ? 'text-[#D9B56D]'
                              : 'text-white/80 group-hover:text-white'
                          }`}
                        />
                        <span className="tracking-wide">
                          <EditableText id={item.labelKey} placeholder={item.defaultLabel} />
                        </span>
                      </button>
                      {isActive && (
                        <motion.div
                          layoutId="activeNavTab"
                          className="absolute bottom-0 left-2 right-2 h-[2.5px] bg-[#D9B56D] rounded-full shadow-[0_0_8px_rgba(217,181,109,0.5)] z-20"
                          transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                        />
                      )}
                    </li>
                  );
                })}

                {isAdmin && (
                  <li className="ml-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => handleNavClick('admin')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm font-semibold text-xs transition-colors duration-150 cursor-pointer whitespace-nowrap ${
                        activeTab === 'admin'
                          ? 'bg-[#1E3A63] text-white border border-[#D9B56D]/80 shadow-xs'
                          : 'bg-[#1E3A63]/60 text-white/90 hover:text-white hover:bg-[#1E3A63] border border-white/20'
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5 text-[#D9B56D]" />
                      <span>Admin CMS</span>
                      {pendingSubmissions > 0 && (
                        <span className="bg-[#D9B56D] text-[#142746] text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                          {pendingSubmissions}
                        </span>
                      )}
                    </button>
                  </li>
                )}
              </ul>

              {/* Mobile Menu Toggle in Top Bar */}
              <div className="md:hidden shrink-0 flex items-center ml-1">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-1.5 rounded border border-white/25 text-white hover:bg-[#1E3A63] transition-colors duration-150 cursor-pointer"
                  aria-label="Toggle navigation menu"
                >
                  {mobileMenuOpen ? <X className="w-4 h-4 text-white" /> : <Menu className="w-4 h-4 text-white" />}
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* ========================================================================= */}
        {/* SECOND ROW — JOURNAL UTILITY BAR (Row 2)                                  */}
        {/* ========================================================================= */}
        <div className="bg-[#102344] dark:bg-[#0a162b] text-slate-200 dark:text-slate-300 text-xs py-1.5 px-4 sm:px-6 lg:px-8 border-b border-[#1c355e]/60">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1 text-[11px] font-mono">
              <span className="flex items-center gap-1.5 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>ISSN (Online):</span>{' '}
                <EditableText id="issn_online" className="text-sky-300 dark:text-sky-300 font-semibold" placeholder="0000" />
              </span>
              <span className="text-blue-300/40">|</span>
              <span className="shrink-0">
                <span>ISSN (Print):</span>{' '}
                <EditableText id="issn_print" className="text-slate-300 dark:text-slate-300" placeholder="yet to assign" />
              </span>
              <span className="text-blue-300/40 hidden sm:inline">|</span>
              <span className="hidden sm:inline shrink-0">
                <span>DOI Prefix:</span>{' '}
                <EditableText id="doi_prefix" className="text-slate-300 dark:text-slate-300" placeholder="10.5281/chssh" />
              </span>
              <span className="text-blue-300/40 hidden md:inline">|</span>
              <span className="hidden md:inline text-sky-200 font-sans font-medium text-[11px] px-2 py-0.2 rounded bg-[#1c355e]/90 border border-sky-400/30 shrink-0">
                <EditableText id="header_access_badge" placeholder="Gold Open Access (CC BY 4.0)" />
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5">
                <ThemePaletteSelector />
                <ThemeToggle variant="pill" />
              </div>
              <span className="text-blue-400/40 hidden sm:inline">|</span>
              {isAuthorLoggedIn && currentAuthor ? (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleNavClick('submit')}
                    className="text-[11px] px-2 py-0.5 rounded font-medium flex items-center gap-1.5 cursor-pointer transition bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40"
                    title="Author Account active - click to access Submission Desk & Certificates"
                  >
                    <User className="w-3 h-3 text-emerald-400" />
                    <span className="max-w-[130px] truncate">{currentAuthor.name}</span>
                    <span className="text-[10px] font-mono text-emerald-400/80 hidden sm:inline">
                      ({currentAuthor.userId})
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={logoutAuthor}
                    className="text-[10px] text-slate-400 hover:text-red-300 transition cursor-pointer p-0.5"
                    title="Log out of Author Account"
                  >
                    <LogOut className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => openAuthorAuthModal()}
                  className="text-[11px] text-sky-200 hover:text-white flex items-center gap-1 transition-colors cursor-pointer bg-[#1c355e]/70 hover:bg-[#1c355e] px-2 py-0.5 rounded border border-sky-400/30"
                  title="Author Login / Registration for manuscript submission and certificate download"
                >
                  <User className="w-3 h-3 text-sky-300" />
                  <span>Author Login</span>
                </button>
              )}
              <span className="text-blue-400/40 hidden sm:inline">|</span>
              {isAdmin ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleNavClick('admin')}
                    className="text-[11px] px-2.5 py-0.5 rounded font-medium flex items-center gap-1.5 cursor-pointer transition bg-[#1c355e] hover:bg-[#23467d] text-sky-200 border border-sky-400/30"
                    title="Open Admin CMS Panel"
                  >
                    <Lock className="w-3 h-3 text-sky-300" />
                    <span>Admin Panel</span>
                    {pendingSubmissions > 0 && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    )}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onOpenAdminLogin}
                  className="text-[11px] text-slate-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                  title="Admin login to edit texts and manage submissions"
                >
                  <Lock className="w-3 h-3 text-sky-300" />
                  <span>Admin Login</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* THIRD ROW — MAIN JOURNAL MASTHEAD                                         */}
      {/* ========================================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 border-b border-slate-100 dark:border-slate-800/80 bg-white/90 dark:bg-[#0a162b]/90 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4">
            <div
              onClick={() => handleNavClick('home')}
              className="cursor-pointer group shrink-0 pt-1 sm:pt-0"
            >
              <JournalCrest size="md" className="group-hover:scale-105 transition-transform" />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-[11px] font-semibold text-[#1c355e] dark:text-sky-400 tracking-widest uppercase">
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-[#1c355e] dark:text-sky-400" />
                  <EditableText id="header_badge" placeholder="International Scholarly Journal" />
                </span>
                <span className="text-slate-300 dark:text-slate-600"> </span>
                <span className="text-slate-500 dark:text-slate-400">
                  <EditableText id="header_established" placeholder="Established 2019" />
                </span>
              </div>
              <h1
                onClick={() => handleNavClick('home')}
                className="font-serif text-2xl sm:text-3xl lg:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-tight cursor-pointer hover:text-[#1c355e] dark:hover:text-sky-300 transition-colors"
              >
                <EditableText
                  id="journal_name"
                  tag="span"
                  placeholder="Contemporary Horizons in Social Sciences and Humanities"
                />
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-serif italic">
                <EditableText
                  id="journal_tagline"
                  tag="span"
                  placeholder="An International, Peer-Reviewed, Open-Access Journal of Critical Scholarship"
                />
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => handleNavClick('submit')}
              className="group flex items-center gap-2 bg-[#1c355e] hover:bg-[#102344] dark:bg-[#23467d] dark:hover:bg-[#1c355e] text-white px-4 py-2.5 rounded-lg text-xs font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer border border-[#102344]/50 dark:border-sky-500/40"
            >
              <Send className="w-3.5 h-3.5 text-sky-200 group-hover:translate-x-0.5 transition-transform" />
              <span>
                <EditableText id="header_submit_btn" placeholder="Submit Manuscript" />
              </span>
              <ArrowUpRight className="w-3 h-3 text-sky-200 opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </motion.button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-[#0b172a] bg-[#142746] dark:bg-[#0c182c] text-white px-4 py-3 space-y-1 overflow-hidden shadow-lg"
          >
            <div className="pb-2 mb-2 border-b border-[#1E3A63]/60 flex items-center justify-between">
              <span className="text-xs font-semibold text-white/70">Color & Mode</span>
              <div className="flex items-center gap-1.5">
                <ThemePaletteSelector />
                <ThemeToggle variant="pill" />
              </div>
            </div>
            {/* Mobile Utility Summary */}
            <div className="pb-2 mb-2 border-b border-[#1E3A63]/60 text-[11px] font-mono text-white/80 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span>ISSN (Online): <EditableText id="issn_online" className="text-[#D9B56D] font-semibold" placeholder="0000" /></span>
                <span>ISSN (Print): <EditableText id="issn_print" placeholder="yet to assign" /></span>
              </div>
              <div className="flex items-center justify-between">
                <span>DOI: <EditableText id="doi_prefix" placeholder="10.5281/chssh" /></span>
                <span className="text-[10px] text-[#D9B56D] font-sans font-medium px-1.5 py-0.5 rounded bg-[#1E3A63] border border-[#D9B56D]/40">
                  <EditableText id="header_access_badge" placeholder="Gold Open Access (CC BY 4.0)" />
                </span>
              </div>
            </div>

            {mobileNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-sm text-sm font-medium transition-colors duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-[#1E3A63] text-white font-semibold border-l-2 border-[#D9B56D] shadow-xs'
                      : 'text-white/90 hover:bg-[#1E3A63] hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#D9B56D]' : 'text-white/75'}`} />
                  <span>
                    <EditableText id={item.labelKey} placeholder={item.defaultLabel} />
                  </span>
                </button>
              );
            })}
            <div className="pt-2 border-t border-[#1E3A63]/60 space-y-1">
              {isAuthorLoggedIn && currentAuthor ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-950/70 border border-emerald-500/40 rounded text-emerald-300">
                  <div className="flex items-center gap-2 text-xs">
                    <User className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="font-bold">{currentAuthor.name}</div>
                      <div className="text-[10px] text-emerald-400/80 font-mono">User ID: {currentAuthor.userId}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      logoutAuthor();
                      setMobileMenuOpen(false);
                    }}
                    className="p-1.5 rounded hover:bg-emerald-900/60 text-slate-300 hover:text-red-300 cursor-pointer"
                    title="Log Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthorAuthModal();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 bg-[#1E3A63] hover:bg-[#254677] text-white rounded text-sm font-semibold transition-colors cursor-pointer border border-white/20"
                >
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#D9B56D]" />
                    Author Portal Login / Register
                  </span>
                </button>
              )}
              {isAdmin ? (
                <button
                  type="button"
                  onClick={() => handleNavClick('admin')}
                  className="w-full flex items-center justify-between px-3 py-2 bg-[#1E3A63] hover:bg-[#254677] text-white rounded text-sm font-semibold transition-colors cursor-pointer border border-[#D9B56D]/50"
                >
                  <span className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#D9B56D]" />
                    Admin CMS Panel
                  </span>
                  {pendingSubmissions > 0 && (
                    <span className="bg-[#D9B56D] text-[#142746] text-xs px-2 py-0.5 rounded-full font-bold">
                      {pendingSubmissions} pending
                    </span>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAdminLogin();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-white/80 hover:text-white hover:bg-[#1E3A63] text-sm font-medium transition-colors rounded cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-[#D9B56D]" />
                  Admin Login
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
