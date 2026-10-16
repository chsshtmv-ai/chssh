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

  const navItems = [
    { id: 'home', labelKey: 'nav_home', defaultLabel: 'Home', icon: Compass },
    { id: 'current', labelKey: 'nav_current', defaultLabel: 'Current Issue', icon: BookOpen },
    { id: 'archive', labelKey: 'nav_archive', defaultLabel: 'Archive & Search', icon: Search },
    { id: 'aims', labelKey: 'nav_aims', defaultLabel: 'Aims & Scope', icon: Bookmark },
    { id: 'guidelines', labelKey: 'nav_guidelines', defaultLabel: 'Author Guidelines', icon: FileCheck },
    { id: 'editorial', labelKey: 'nav_editorial', defaultLabel: 'Editorial Board', icon: Users },
    { id: 'advisory', labelKey: 'nav_advisory', defaultLabel: 'Advisory Board', icon: GraduationCap },
    { id: 'reviewers', labelKey: 'nav_reviewers', defaultLabel: 'Reviewers', icon: Award },
    { id: 'submit', labelKey: 'nav_submit', defaultLabel: 'Submit Manuscript', icon: Send },
    { id: 'track', labelKey: 'nav_track', defaultLabel: 'Track Submission', icon: Search },
    { id: 'downloads', labelKey: 'nav_downloads', defaultLabel: 'Downloads', icon: Download }
  ];

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="bg-white dark:bg-[#0f1115] border-b border-stone-200/90 dark:border-stone-800 sticky top-0 z-30 shadow-2xs backdrop-blur-md transition-colors duration-200">
      {/* Scholarly Top Strip */}
      <div className="bg-[#102344] dark:bg-[#0a162b] text-slate-200 dark:text-slate-300 text-xs py-1.5 px-4 sm:px-6 lg:px-8 border-b border-[#1c355e]/60">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ISSN (Online):{' '}
              <EditableText id="issn_online" className="text-sky-300 dark:text-sky-300 font-semibold" />
            </span>
            <span className="text-blue-300/40 hidden sm:inline"> </span>
            <span>
              ISSN (Print):{' '}
              <EditableText id="issn_print" className="text-slate-300 dark:text-slate-300" />
            </span>
            <span className="text-blue-300/40 hidden md:inline"> </span>
            <span className="hidden md:inline">
              DOI Prefix:{' '}
              <EditableText id="doi_prefix" className="text-slate-300 dark:text-slate-300" />
            </span>
            <span className="text-blue-300/40 hidden lg:inline"> </span>
            <span className="hidden lg:inline text-sky-200 font-sans font-medium text-[11px] px-2 py-0.2 rounded bg-[#1c355e]/90 border border-sky-400/30">
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
                  <span className="text-[10px] font-mono text-emerald-400/80 hidden sm:inline">({currentAuthor.userId})</span>
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

      {/* Main Journal Masthead */}
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

      {/* Navigation Bar with Animated Pill */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 hidden md:block">
        <ul className="flex items-center gap-1 py-1.5 overflow-x-auto text-xs font-medium text-slate-700 dark:text-slate-300 relative">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li key={item.id} className="relative">
                <button
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded-md transition-colors cursor-pointer whitespace-nowrap z-10 ${
                    isActive
                      ? 'text-white dark:text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-200' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span>
                    <EditableText id={item.labelKey} placeholder={item.defaultLabel} />
                  </span>
                </button>
                {isActive && (
                  <motion.div
                    layoutId="activeNavTab"
                    className="absolute inset-0 bg-[#1c355e] dark:bg-[#23467d] rounded-md shadow-xs z-0"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
              </li>
            );
          })}
          {isAdmin && (
            <li className="ml-auto">
              <button
                type="button"
                onClick={() => handleNavClick('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold text-xs transition-colors cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-[#1c355e] dark:bg-sky-600 text-white shadow-xs'
                    : 'bg-sky-50 dark:bg-slate-800 text-[#1c355e] dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-slate-700 border border-sky-200 dark:border-slate-700'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Admin CMS</span>
                {pendingSubmissions > 0 && (
                  <span className="bg-[#1c355e] text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                    {pendingSubmissions}
                  </span>
                )}
              </button>
            </li>
          )}
        </ul>
      </nav>

      {/* Mobile Horizontal Tabs Strip */}
      <div className="md:hidden border-t border-slate-200/90 dark:border-slate-800 bg-slate-50/95 dark:bg-[#0a162b]/95 px-2 py-1.5 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 w-max">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-[#1c355e] dark:bg-[#23467d] text-white font-bold shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/80 font-medium'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-sky-300' : 'text-slate-400 dark:text-slate-500'}`} />
                <span>
                  <EditableText id={item.labelKey} placeholder={item.defaultLabel} />
                </span>
              </button>
            );
          })}
          {isAdmin && (
            <button
              type="button"
              onClick={() => handleNavClick('admin')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs whitespace-nowrap font-bold transition cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-sky-600 text-white'
                  : 'bg-sky-100 dark:bg-slate-800 text-[#1c355e] dark:text-sky-300 border border-sky-300 dark:border-slate-700'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-3 space-y-1 overflow-hidden"
          >
            <div className="pb-2 mb-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Color & Mode</span>
              <div className="flex items-center gap-1.5">
                <ThemePaletteSelector />
                <ThemeToggle variant="pill" />
              </div>
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition cursor-pointer ${
                    isActive
                      ? 'bg-[#1c355e] dark:bg-[#23467d] text-white font-semibold shadow-xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sky-200' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span>
                    <EditableText id={item.labelKey} placeholder={item.defaultLabel} />
                  </span>
                </button>
              );
            })}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1">
              {isAuthorLoggedIn && currentAuthor ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-950/70 border border-emerald-500/40 rounded-lg text-emerald-300">
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
                  className="w-full flex items-center justify-between px-3 py-2 bg-[#1c355e] text-white rounded-md text-sm font-semibold cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4 text-sky-300" />
                    Author Portal Login / Register
                  </span>
                </button>
              )}
              {isAdmin ? (
                <button
                  type="button"
                  onClick={() => handleNavClick('admin')}
                  className="w-full flex items-center justify-between px-3 py-2 bg-[#1c355e] text-white rounded-md text-sm font-semibold cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Admin CMS Panel
                  </span>
                  {pendingSubmissions > 0 && (
                    <span className="bg-sky-400 text-slate-950 text-xs px-2 py-0.5 rounded-full font-bold">
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
                  className="w-full flex items-center gap-2 px-3 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-sm font-medium cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-sky-400" />
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
