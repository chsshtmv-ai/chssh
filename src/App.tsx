import React, { useState } from 'react';
import { JournalProvider, useJournal } from './context/JournalContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AdminBar } from './components/AdminBar';
import { AdminModal } from './components/AdminModal';
import { AuthorAuthModal } from './components/AuthorAuthModal';
import { ArticleModal } from './components/ArticleModal';
import { HomeHero } from './components/HomeHero';
import { CurrentIssue } from './components/CurrentIssue';
import { Archive } from './components/Archive';
import { AimsAndScope } from './components/AimsAndScope';
import { AuthorGuidelines } from './components/AuthorGuidelines';
import { EditorialBoardView } from './components/EditorialBoardView';
import { AdvisoryBoardView } from './components/AdvisoryBoardView';
import { ReviewersView } from './components/ReviewersView';
import { SubmitManuscript } from './components/SubmitManuscript';
import { TrackSubmission } from './components/TrackSubmission';
import { DownloadsView } from './components/DownloadsView';
import { AdminPanel } from './components/admin/AdminPanel';

function JournalApp() {
  const {
    activeTab,
    selectedArticleForView,
    setSelectedArticleForView,
    isAuthorAuthModalOpen,
    closeAuthorAuthModal,
    authorAuthPromptMessage
  } = useJournal();

  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminModalMode, setAdminModalMode] = useState<'login' | 'retrieve'>('login');

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeHero />;
      case 'current':
        return <CurrentIssue />;
      case 'archive':
        return <Archive />;
      case 'aims':
        return <AimsAndScope />;
      case 'guidelines':
        return <AuthorGuidelines />;
      case 'editorial':
        return <EditorialBoardView />;
      case 'advisory':
        return <AdvisoryBoardView />;
      case 'reviewers':
        return <ReviewersView />;
      case 'submit':
        return <SubmitManuscript />;
      case 'track':
        return <TrackSubmission />;
      case 'downloads':
        return <DownloadsView />;
      case 'admin':
        return <AdminPanel />;
      default:
        return <HomeHero />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfaf8] dark:bg-[#0c0d10] text-slate-800 dark:text-slate-200 font-sans selection:bg-[#102344] selection:text-white transition-colors duration-200">
      <AdminBar />
      <Header
        onOpenAdminLogin={() => {
          setAdminModalMode('login');
          setIsAdminModalOpen(true);
        }}
      />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {renderActiveTabContent()}
      </main>

      <Footer
        onOpenAdminLogin={() => {
          setAdminModalMode('login');
          setIsAdminModalOpen(true);
        }}
      />

      {/* Global Modals */}
      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        initialMode={adminModalMode}
      />

      <AuthorAuthModal
        isOpen={isAuthorAuthModalOpen}
        onClose={closeAuthorAuthModal}
        promptMessage={authorAuthPromptMessage}
      />

      <ArticleModal
        article={selectedArticleForView}
        onClose={() => setSelectedArticleForView(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <JournalProvider>
      <JournalApp />
    </JournalProvider>
  );
}
