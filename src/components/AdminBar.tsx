import React, { useState } from 'react';
import { useJournal } from '../context/JournalContext';
import { ShieldCheck, Edit3, LayoutDashboard, LogOut, RotateCcw, Database, RefreshCw, Check, Upload } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export const AdminBar: React.FC = () => {
  const {
    isAdmin,
    logoutAdmin,
    resetContentToDefault,
    setActiveTab,
    activeTab,
    articles,
    firebaseStatus,
    isFirebaseSyncing,
    syncToFirebaseNow,
    openAdminAssetUploader,
    adminActiveSubTab,
    setAdminActiveSubTab
  } = useJournal();
  const [justSynced, setJustSynced] = useState(false);

  if (!isAdmin) return null;

  const pendingCount = articles.filter(a => a.status === 'submitted' || a.status === 'under_review').length;

  const handleManualSync = async () => {
    const ok = await syncToFirebaseNow();
    if (ok) {
      setJustSynced(true);
      setTimeout(() => setJustSynced(false), 2500);
    }
  };

  return (
    <aside
      aria-label="Admin Control Bar"
      className="bg-stone-900 text-stone-100 border-b border-stone-800 px-4 py-2 text-xs relative z-50 shadow-md flex flex-wrap items-center justify-between gap-3"
    >
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/80 font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Admin Authenticated</span>
        </div>

        {/* Firebase Cloud Connection Status */}
        <div
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded border text-[11px] font-medium transition-colors ${
            firebaseStatus === 'connected'
              ? 'bg-blue-950/70 text-blue-300 border-blue-800/80'
              : firebaseStatus === 'syncing' || isFirebaseSyncing
              ? 'bg-amber-950/70 text-amber-300 border-amber-800/80'
              : 'bg-stone-800 text-stone-400 border-stone-700'
          }`}
          title="Firebase Firestore real-time cloud connection"
        >
          <Database className="w-3 h-3 text-amber-400" />
          <span className="hidden sm:inline">Firebase:</span>
          <span className="flex items-center gap-1">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                firebaseStatus === 'connected'
                  ? 'bg-emerald-400 animate-pulse'
                  : 'bg-amber-400'
              }`}
            />
            {isFirebaseSyncing
              ? 'Syncing...'
              : firebaseStatus === 'connected'
              ? 'Cloud Live'
              : 'Connecting...'}
          </span>
        </div>

        <button
          type="button"
          onClick={handleManualSync}
          disabled={isFirebaseSyncing}
          className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors cursor-pointer border border-stone-700"
          title="Force push latest local cache to Firebase Cloud Database"
        >
          {justSynced ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-300 text-[10px]">Synced</span>
            </>
          ) : (
            <>
              <RefreshCw className={`w-3 h-3 ${isFirebaseSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline text-[10px]">Sync Cloud</span>
            </>
          )}
        </button>

        <span className="text-stone-500 hidden lg:inline">|</span>
        <span className="text-stone-300 hidden lg:inline">
          Journal CMS Active
        </span>
      </div>

      <div className="flex items-center flex-wrap gap-2">
        <ThemeToggle variant="compact" />

        <button
          type="button"
          onClick={() => {
            setAdminActiveSubTab('texts');
            setActiveTab('admin');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
            activeTab === 'admin' && adminActiveSubTab === 'texts'
              ? 'bg-sky-600 text-white ring-1 ring-sky-400 font-semibold'
              : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
          }`}
          title="Edit website texts in Admin Panel"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Site Texts CMS</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('admin')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
            activeTab === 'admin' && adminActiveSubTab !== 'assets'
              ? 'bg-stone-700 text-white ring-1 ring-stone-500'
              : 'bg-stone-800 text-stone-200 hover:bg-stone-700'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5 text-stone-300" />
          <span>CMS Dashboard</span>
          {pendingCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-600 text-white font-bold ml-0.5">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={openAdminAssetUploader}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
            activeTab === 'admin' && adminActiveSubTab === 'assets'
              ? 'bg-amber-600 text-white ring-1 ring-amber-400 font-semibold'
              : 'bg-amber-950/70 text-amber-200 hover:bg-amber-900 border border-amber-800/80'
          }`}
          title="Direct link to upload Journal Cover, Contents Page, Template, and Certificates"
        >
          <Upload className="w-3.5 h-3.5 text-amber-400" />
          <span>Upload Documents &amp; Assets</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (window.confirm('Reset all website texts to default scholarly template? Any unsaved custom text edits will be restored to defaults.')) {
              resetContentToDefault();
            }
          }}
          className="flex items-center gap-1 px-2 py-1 rounded text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors cursor-pointer"
          title="Restore default journal texts"
        >
          <RotateCcw className="w-3 h-3" />
          <span className="hidden lg:inline">Reset Texts</span>
        </button>

        <button
          type="button"
          onClick={logoutAdmin}
          className="flex items-center gap-1 px-2.5 py-1 rounded text-red-300 hover:text-red-200 hover:bg-red-950/60 border border-red-900/50 transition-colors cursor-pointer ml-1"
          title="Sign out of Admin Panel"
        >
          <LogOut className="w-3 h-3" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
