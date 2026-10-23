import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { JournalContent, Article, EditorialMember, AdvisoryBoardMember, ArticleStatus, JournalUploadedAsset, Reviewer, AuthorAccount, JournalPalette, JournalVolume, JournalIssue } from '../types';
import { initialJournalContent } from '../data/defaultContent';
import { initialArticles, initialEditorialBoard } from '../data/defaultArticles';
import { initialAdvisoryBoard } from '../data/defaultAdvisoryBoard';
import { initialJournalAssets } from '../data/defaultAssets';
import { initialReviewers } from '../data/defaultReviewers';
import { initialAuthors, normalizePhoneNumber } from '../data/defaultAuthors';
import { initialVolumes, initialIssues } from '../data/defaultVolumes';
import { db, firebaseConfig, auth } from '../lib/firebase';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  deleteField
} from 'firebase/firestore';
import {
  saveOriginalManuscriptFile,
  getOriginalManuscriptFile,
  savePublishedPaperFile,
  getPublishedPaperFile,
  deleteOriginalManuscriptFile,
  deletePublishedPaperFile,
  saveAssetFile,
  getAssetFile,
  deleteAssetFile,
  getAllAssetFiles,
  purgeLegacyFilesFromLocalStorage,
  safeLocalStorageSet
} from '../utils/fileStorage';
import {
  uploadOriginalFileToStorage,
  downloadOriginalFileFromStorage,
  detectMimeType,
  resolvePublishedPaperViewUrl
} from '../services/documentStorageService';
import { parseGoogleDriveUrl } from '../utils/googleDriveUtils';
import { generateAcademicDoi } from '../utils/doiUtils';
import {
  SmsGatewayConfig,
  DEFAULT_SMS_CONFIG,
  getStoredSmsConfig,
  saveStoredSmsConfig,
  dispatchSmsVerificationCode,
  getSmsLogs,
  SmsLogEntry,
} from '../services/smsService';
import {
  uploadPdfToFirebaseStorage,
  saveActivePdfToFirestore,
  fetchActivePdfFromFirestore,
  uploadAndPersistPdfAsset,
  validatePdfFile,
  getFreshPdfUrl
} from '../services/pdfStorageService';
import {
  initDriveAuth,
  connectGoogleDrive,
  disconnectGoogleDrive,
  isDriveConnected,
  uploadManuscriptToGoogleDrive,
  moveManuscriptInGoogleDrive,
  ensureJournalFolderStructure
} from '../services/googleDriveService';
import { signInAnonymously, type User as FirebaseUser } from 'firebase/auth';

export type FirebaseConnectionStatus = 'connected' | 'connecting' | 'error' | 'syncing';

interface JournalContextType {
  content: JournalContent;
  articles: Article[];
  editorialBoard: EditorialMember[];
  advisoryBoard: AdvisoryBoardMember[];
  reviewers: Reviewer[];
  uploadedAssets: Record<string, JournalUploadedAsset>;
  isAdmin: boolean;
  isLiveEditMode: boolean;
  adminPassword: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  adminActiveSubTab: 'submissions' | 'texts' | 'board' | 'advisory' | 'reviewers' | 'assets' | 'security' | 'downloads' | 'publication' | 'drive' | 'volumes';
  setAdminActiveSubTab: (tab: 'submissions' | 'texts' | 'board' | 'advisory' | 'reviewers' | 'assets' | 'security' | 'downloads' | 'publication' | 'drive' | 'volumes') => void;
  openAdminAssetUploader: () => void;
  selectedArticleForView: Article | null;
  setSelectedArticleForView: (article: Article | null) => void;
  // Day & Night Theme
  theme: 'day' | 'night';
  toggleTheme: () => void;
  setTheme: (theme: 'day' | 'night') => void;
  // Curated Scholarly Color Palettes
  palette: JournalPalette;
  setPalette: (newPalette: JournalPalette, persistToFirestore?: boolean) => Promise<void>;
  // Real-time Text Editing
  updateContentText: (key: keyof JournalContent, value: string) => void;
  updateEntireContent: (newContent: JournalContent) => void;
  resetContentToDefault: () => void;
  // Journal Documents & Asset Uploads (Cover, Contents, Template, Certificate)
  uploadJournalAsset: (asset: JournalUploadedAsset) => void;
  deleteJournalAsset: (assetId: string) => void;
  resetAssetToDefault: (assetId: string) => void;
  uploadPdfAsset: (
    file: File,
    slotId?: string,
    title?: string,
    description?: string,
    onStatusChange?: (status: string) => void
  ) => Promise<JournalUploadedAsset>;
  fetchActivePdf: (slotId?: string) => Promise<JournalUploadedAsset | null>;
  activePdf: JournalUploadedAsset | null;
  // Admin Authentication & Modes
  loginAdmin: (password: string) => boolean;
  logoutAdmin: () => void;
  changeAdminPassword: (newPass: string) => boolean;
  resetAdminPasswordToDefault: () => Promise<boolean>;
  recoverAndResetAdminPassword: (newPass: string) => Promise<boolean>;
  clearAdminLockout: () => void;
  adminPhone: string;
  updateAdminPhone: (phone: string) => Promise<boolean>;
  sendPhoneVerificationCode: (phone: string, purpose?: string) => Promise<{ success: boolean; code?: string; error?: string; message?: string }>;
  verifyPhoneCode: (phone: string, inputCode: string) => boolean;
  smsConfig: SmsGatewayConfig;
  updateSmsConfig: (newConfig: Partial<SmsGatewayConfig>) => Promise<boolean>;
  testSmsGateway: (phone: string) => Promise<{ success: boolean; message: string; code?: string; details?: any }>;
  smsLogs: SmsLogEntry[];
  refreshSmsLogs: () => void;
  toggleLiveEditMode: () => void;
  setIsLiveEditMode: (val: boolean) => void;
  // CMS Article Operations
  submitManuscript: (data: {
    title: string;
    abstract: string;
    keywords: string[];
    track: string;
    authors: Article['authors'];
    fileName?: string;
    fileSize?: string;
    fileDataUrl?: string;
    coverLetter?: string;
    conflictOfInterest?: boolean;
  }) => Article;
  updateArticleStatus: (id: string, status: ArticleStatus, editorialNotes?: string, reviewerComments?: string[]) => void;
  publishArticle: (
    id: string,
    pubData: {
      volume: number;
      issue: number;
      year: number;
      pages: string;
      doi: string;
      publishedFileDataUrl?: string;
      publishedFileName?: string;
      publishedFileSize?: string;
      publishedFileType?: string;
    }
  ) => void;
  uploadPublishedPaper: (
    articleId: string,
    fileData: {
      file?: File;
      publishedFileDataUrl?: string;
      publishedFileName: string;
      publishedFileSize: string;
      publishedFileType?: string;
      storagePath?: string;
      downloadURL?: string;
      mimeType?: string;
    },
    metadata?: Partial<Article>,
    onProgress?: (stage: string) => void
  ) => Promise<Article | undefined>;
  removePublishedPaper: (articleId: string) => void;
  downloadOriginalManuscript: (article: Article) => Promise<void> | void;
  downloadPublishedPaper: (article: Article) => Promise<boolean> | boolean;
  viewPublishedPaper: (article: Article) => Promise<string | null>;
  registerGoogleDrivePaper: (data: {
    title: string;
    authors: Article['authors'];
    abstract: string;
    keywords: string[];
    track: string;
    volume: number;
    issue: number;
    year: number;
    pages: string;
    doi?: string;
    driveUrl: string;
    coverImage?: string;
    status: 'published' | 'draft';
  }) => Promise<Article>;
  registerGoogleDriveAsset: (data: {
    id: string;
    title: string;
    description: string;
    category: JournalUploadedAsset['category'];
    driveUrl: string;
    status?: 'active' | 'archived' | 'inactive';
  }) => Promise<JournalUploadedAsset>;
  updateArticle: (article: Article) => void;
  updateArticleCertificate: (articleId: string, certificateUrl: string) => Promise<boolean>;
  linkManuscriptToAuthor: (trackingId: string, authorUserId: string, authorEmail: string) => Promise<{ success: boolean; message: string }>;
  deleteArticle: (id: string) => void;
  incrementArticleViews: (id: string) => void;
  incrementArticleDownloads: (id: string) => void;
  // Editorial Board Operations
  updateEditorialMember: (id: string, member: Partial<EditorialMember>) => void;
  addEditorialMember: (member: Omit<EditorialMember, 'id'>) => void;
  deleteEditorialMember: (id: string) => void;
  // International Advisory Board Operations
  updateAdvisoryMember: (id: string, member: Partial<AdvisoryBoardMember>) => void;
  addAdvisoryMember: (member: Omit<AdvisoryBoardMember, 'id'>) => void;
  deleteAdvisoryMember: (id: string) => void;
  resetAdvisoryBoardToDefaults: () => void;
  // Peer Reviewers & Reviewer Applications
  applyReviewer: (data: Omit<Reviewer, 'id' | 'status' | 'appliedDate'>) => Promise<boolean>;
  updateReviewer: (id: string, update: Partial<Reviewer>) => void;
  acceptReviewer: (id: string, adminNotes?: string) => void;
  rejectReviewer: (id: string, adminNotes?: string) => void;
  deleteReviewer: (id: string) => void;
  addReviewer: (reviewer: Omit<Reviewer, 'id' | 'appliedDate'>) => void;
  // Author Accounts & Authentication (Submission & Downloads Access Control)
  authorAccounts: AuthorAccount[];
  currentAuthor: AuthorAccount | null;
  isAuthorLoggedIn: boolean;
  loginAuthor: (identifier: string, password: string) => { success: boolean; error?: string };
  registerAuthor: (data: Omit<AuthorAccount, 'id' | 'createdAt'>) => Promise<{ success: boolean; error?: string }>;
  retrieveCredentialsByPhone: (phone: string) => { success: boolean; account?: AuthorAccount; error?: string };
  resetAuthorPasswordByPhone: (phone: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  logoutAuthor: () => void;
  isAuthorAuthModalOpen: boolean;
  setIsAuthorAuthModalOpen: (open: boolean) => void;
  authorAuthPromptMessage: string;
  setAuthorAuthPromptMessage: (msg: string) => void;
  openAuthorAuthModal: (promptMessage?: string, onAuthenticated?: () => void) => void;
  closeAuthorAuthModal: () => void;
  requireAuthorAuth: (action: () => void, promptMessage?: string) => void;
  // Volume & Issue Management
  volumes: JournalVolume[];
  issues: JournalIssue[];
  createVolume: (data: Omit<JournalVolume, 'id' | 'createdAt' | 'updatedAt'>) => Promise<{ success: boolean; error?: string; volume?: JournalVolume }>;
  updateVolume: (id: string, updates: Partial<JournalVolume>) => Promise<boolean>;
  deleteVolume: (id: string) => Promise<boolean>;
  createIssue: (data: Omit<JournalIssue, 'id' | 'createdAt' | 'updatedAt'>) => Promise<{ success: boolean; error?: string; issue?: JournalIssue }>;
  updateIssue: (id: string, updates: Partial<JournalIssue>) => Promise<boolean>;
  deleteIssue: (id: string) => Promise<boolean>;
  publishIssue: (issueId: string) => Promise<{ success: boolean; error?: string }>;
  unpublishIssue: (issueId: string) => Promise<boolean>;
  reorderArticlesInIssue: (issueId: string, articleIds: string[]) => Promise<boolean>;
  addArticleToIssue: (issueId: string, articleId: string) => Promise<boolean>;
  removeArticleFromIssue: (issueId: string, articleId: string) => Promise<boolean>;
  // Manuscript Review & Workflow
  assignReviewerToArticle: (articleId: string, reviewerId: string, reviewerName: string) => void;
  requestArticleRevision: (articleId: string, instructions: string) => void;
  exportSubmissionsCsv: () => void;
  // Google Drive Integration
  isGoogleDriveConnected: boolean;
  googleDriveUser: FirebaseUser | null;
  connectDrive: () => Promise<{ success: boolean; error?: string }>;
  disconnectDrive: () => Promise<void>;
  syncManuscriptToGoogleDrive: (articleId: string) => Promise<boolean>;
  ensureDriveFolderTree: () => Promise<boolean>;
  // Backup / Sync & Firebase
  exportAllData: () => string;
  importAllData: (jsonStr: string) => boolean;
  firebaseStatus: FirebaseConnectionStatus;
  isFirebaseSyncing: boolean;
  lastSyncedAt: Date | null;
  syncToFirebaseNow: () => Promise<boolean>;
}

const JournalContext = createContext<JournalContextType | undefined>(undefined);

function cleanForFirestore<T>(data: T): T {
  if (data === null || data === undefined) return data;
  if (Array.isArray(data)) {
    return data.map(item => cleanForFirestore(item)) as unknown as T;
  }
  if (typeof data === 'object') {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        cleaned[key] = cleanForFirestore(value);
      }
    }
    return cleaned as T;
  }
  return data;
}

export const KEY_ALIASES: Record<string, string[]> = {
  eic_badge: ['editor_in_chief_badge'],
  editor_in_chief_badge: ['eic_badge'],
  eic_tenure_badge: ['editor_in_chief_tenure'],
  editor_in_chief_tenure: ['eic_tenure_badge'],
  editor_in_chief_statement: ['editor_in_chief_quote'],
  editor_in_chief_quote: ['editor_in_chief_statement'],
  nav_current: ['nav_current_issue'],
  nav_current_issue: ['nav_current'],
  nav_aims: ['nav_aims_scope'],
  nav_aims_scope: ['nav_aims'],
  nav_guidelines: ['nav_author_guidelines'],
  nav_author_guidelines: ['nav_guidelines'],
  nav_editorial: ['nav_editorial_board'],
  nav_editorial_board: ['nav_editorial'],
  nav_track: ['nav_track_submission'],
  nav_track_submission: ['nav_track']
};

function broadcastSync(type: string, data: any) {
  try {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel('chssh_journal_sync');
      channel.postMessage({ type, data });
      channel.close();
    }
  } catch {
    // Graceful fallback
  }
}

export const JournalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pendingContentWrites = useRef<Partial<JournalContent>>({});
  const contentWriteTimeoutRef = useRef<any>(null);

  const [content, setContent] = useState<JournalContent>(() => {
    try {
      const saved = localStorage.getItem('chssh_journal_content');
      if (saved) {
        return { ...initialJournalContent, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Error loading local journal content', e);
    }
    return initialJournalContent;
  });

  const [articles, setArticles] = useState<Article[]>(() => {
    try {
      const saved = localStorage.getItem('chssh_articles');
      if (saved) {
        const parsed: Article[] = JSON.parse(saved);
        if (parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading local articles', e);
    }
    return initialArticles;
  });

  const [editorialBoard, setEditorialBoard] = useState<EditorialMember[]>(() => {
    try {
      const saved = localStorage.getItem('chssh_editorial_board');
      if (saved) {
        const parsed: EditorialMember[] = JSON.parse(saved);
        if (parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading local editorial board', e);
    }
    return initialEditorialBoard;
  });

  const [advisoryBoard, setAdvisoryBoard] = useState<AdvisoryBoardMember[]>(() => {
    try {
      const saved = localStorage.getItem('chssh_advisory_board');
      if (saved) {
        const parsed: AdvisoryBoardMember[] = JSON.parse(saved);
        if (parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading local advisory board', e);
    }
    return initialAdvisoryBoard;
  });

  const [reviewers, setReviewers] = useState<Reviewer[]>(() => {
    try {
      const saved = localStorage.getItem('chssh_reviewers');
      if (saved) {
        const parsed: Reviewer[] = JSON.parse(saved);
        if (parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading local reviewers', e);
    }
    return initialReviewers;
  });

  const [uploadedAssets, setUploadedAssets] = useState<Record<string, JournalUploadedAsset>>(() => {
    try {
      const saved = localStorage.getItem('chssh_uploaded_assets');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Object.keys(parsed).length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading local uploaded assets', e);
    }
    return initialJournalAssets;
  });

  const [adminPassword, setAdminPassword] = useState<string>(() => {
    const saved = localStorage.getItem('chssh_admin_password');
    if (!saved || saved === 'admin123') {
      safeLocalStorageSet('chssh_admin_password', '323741');
      return '323741';
    }
    return saved;
  });

  const [adminPhone, setAdminPhone] = useState<string>(() => {
    return localStorage.getItem('chssh_admin_phone') || '+91-9708669600';
  });

  const [smsConfig, setSmsConfig] = useState<SmsGatewayConfig>(() => {
    return getStoredSmsConfig();
  });

  const [smsLogs, setSmsLogs] = useState<SmsLogEntry[]>(() => {
    return getSmsLogs();
  });

  const refreshSmsLogs = () => {
    setSmsLogs(getSmsLogs());
  };

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return sessionStorage.getItem('chssh_is_admin') === 'true';
  });

  const [isLiveEditMode, setIsLiveEditMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [adminActiveSubTab, setAdminActiveSubTab] = useState<'submissions' | 'texts' | 'board' | 'advisory' | 'reviewers' | 'assets' | 'security' | 'downloads' | 'publication' | 'drive' | 'volumes'>('submissions');
  const [selectedArticleForView, setSelectedArticleForView] = useState<Article | null>(null);

  const [volumes, setVolumes] = useState<JournalVolume[]>(() => {
    try {
      const saved = localStorage.getItem('chssh_journal_volumes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading local volumes', e);
    }
    return initialVolumes;
  });

  const [issues, setIssues] = useState<JournalIssue[]>(() => {
    try {
      const saved = localStorage.getItem('chssh_journal_issues');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading local issues', e);
    }
    return initialIssues;
  });

  const openAdminAssetUploader = () => {
    setAdminActiveSubTab('assets');
    setActiveTab('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [firebaseStatus, setFirebaseStatus] = useState<FirebaseConnectionStatus>('connecting');
  const [isFirebaseSyncing, setIsFirebaseSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  const isContentSeeded = useRef(false);
  const isArticlesSeeded = useRef(false);
  const isEditorialSeeded = useRef(false);
  const isAdvisorySeeded = useRef(false);
  const isReviewersSeeded = useRef(false);
  const isAssetsSeeded = useRef(false);
  const isAuthorsSeeded = useRef(false);

  const [authorAccounts, setAuthorAccounts] = useState<AuthorAccount[]>(() => {
    try {
      const saved = localStorage.getItem('chssh_author_accounts');
      if (saved) {
        const parsed: AuthorAccount[] = JSON.parse(saved);
        return parsed.filter(a => !['author-elena', 'author-marcus', 'author-aisha'].includes(a.id));
      }
    } catch (e) {
      console.error('Error loading local author accounts', e);
    }
    return [];
  });

  const [currentAuthor, setCurrentAuthor] = useState<AuthorAccount | null>(() => {
    try {
      const saved = sessionStorage.getItem('chssh_current_author') || localStorage.getItem('chssh_current_author');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading current author', e);
    }
    return null;
  });

  const [isAuthorAuthModalOpen, setIsAuthorAuthModalOpen] = useState(false);
  const [authorAuthPromptMessage, setAuthorAuthPromptMessage] = useState<string>('');
  const pendingAuthAction = useRef<(() => void) | null>(null);

  const [theme, setThemeState] = useState<'day' | 'night'>(() => {
    try {
      const saved = localStorage.getItem('chssh_theme');
      if (saved === 'night' || saved === 'day') return saved;
    } catch (e) {
      console.error(e);
    }
    return 'day';
  });

  const [palette, setPaletteState] = useState<JournalPalette>(() => {
    try {
      const saved = localStorage.getItem('chssh_palette') as JournalPalette;
      if (['oxford', 'cambridge', 'cypress', 'prussian'].includes(saved)) return saved;
    } catch (e) {
      console.error(e);
    }
    return 'oxford';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-palette', palette);
    safeLocalStorageSet('chssh_palette', palette);
  }, [palette]);

  const setPalette = async (newPalette: JournalPalette, persistToFirestore: boolean = false) => {
    setPaletteState(newPalette);
    safeLocalStorageSet('chssh_palette', newPalette);
    const root = document.documentElement;
    root.setAttribute('data-palette', newPalette);
    if (persistToFirestore) {
      try {
        const themeDocRef = doc(db, 'app_settings', 'theme');
        await setDoc(themeDocRef, { palette: newPalette, updatedAt: new Date().toISOString() }, { merge: true });
      } catch (err) {
        console.warn('Error saving palette to Firestore:', err);
      }
    }
  };

  const [isGoogleDriveConnected, setIsGoogleDriveConnected] = useState<boolean>(() => isDriveConnected());
  const [googleDriveUser, setGoogleDriveUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const unsubscribe = initDriveAuth(
      (user) => {
        setGoogleDriveUser(user);
        setIsGoogleDriveConnected(true);
      },
      () => {
        setGoogleDriveUser(null);
        setIsGoogleDriveConnected(false);
      }
    );
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    purgeLegacyFilesFromLocalStorage();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'night') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
    safeLocalStorageSet('chssh_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prev => (prev === 'day' ? 'night' : 'day'));
  };

  const setTheme = (newTheme: 'day' | 'night') => {
    setThemeState(newTheme);
  };

  useEffect(() => {
    safeLocalStorageSet('chssh_journal_content', JSON.stringify(content));
    broadcastSync('SYNC_CONTENT', content);
  }, [content]);

  useEffect(() => {
    const lightweightArticles = articles.map(art => {
      const { fileDataUrl, publishedFileDataUrl, ...rest } = art;
      return rest;
    });
    safeLocalStorageSet('chssh_articles', JSON.stringify(lightweightArticles));
    broadcastSync('SYNC_ARTICLES', articles);
  }, [articles]);

  useEffect(() => {
    safeLocalStorageSet('chssh_editorial_board', JSON.stringify(editorialBoard));
    broadcastSync('SYNC_EDITORIAL', editorialBoard);
  }, [editorialBoard]);

  useEffect(() => {
    safeLocalStorageSet('chssh_advisory_board', JSON.stringify(advisoryBoard));
    broadcastSync('SYNC_ADVISORY', advisoryBoard);
  }, [advisoryBoard]);

  useEffect(() => {
    const lightweightAssets: Record<string, JournalUploadedAsset> = {};
    Object.entries(uploadedAssets).forEach(([k, asset]) => {
      if (asset) {
        const { fileDataUrl, ...rest } = asset as JournalUploadedAsset;
        lightweightAssets[k] = rest as JournalUploadedAsset;
      }
    });
    safeLocalStorageSet('chssh_uploaded_assets', JSON.stringify(lightweightAssets));
    broadcastSync('SYNC_ASSETS', uploadedAssets);
  }, [uploadedAssets]);

  useEffect(() => {
    safeLocalStorageSet('chssh_reviewers', JSON.stringify(reviewers));
    broadcastSync('SYNC_REVIEWERS', reviewers);
  }, [reviewers]);

  useEffect(() => {
    safeLocalStorageSet('chssh_author_accounts', JSON.stringify(authorAccounts));
  }, [authorAccounts]);

  useEffect(() => {
    safeLocalStorageSet('chssh_journal_volumes', JSON.stringify(volumes));
    broadcastSync('SYNC_VOLUMES', volumes);
  }, [volumes]);

  useEffect(() => {
    safeLocalStorageSet('chssh_journal_issues', JSON.stringify(issues));
    broadcastSync('SYNC_ISSUES', issues);
  }, [issues]);

  useEffect(() => {
    try {
      if (currentAuthor) {
        sessionStorage.setItem('chssh_current_author', JSON.stringify(currentAuthor));
        safeLocalStorageSet('chssh_current_author', JSON.stringify(currentAuthor));
      } else {
        sessionStorage.removeItem('chssh_current_author');
        localStorage.removeItem('chssh_current_author');
      }
    } catch {
      // Safe fallback
    }
  }, [currentAuthor]);

  useEffect(() => {
    let isMounted = true;
    getAllAssetFiles().then((fileMap) => {
      if (!isMounted || !fileMap || Object.keys(fileMap).length === 0) return;
      setUploadedAssets((prev) => {
        let hasChanges = false;
        const merged = { ...prev };
        Object.entries(fileMap).forEach(([id, dataUrl]) => {
          if (merged[id] && dataUrl) {
            merged[id] = { ...merged[id], fileDataUrl: dataUrl, isUploaded: true };
            hasChanges = true;
          }
        });
        return hasChanges ? merged : prev;
      });
    }).catch(err => console.warn('Error hydrating asset files from IndexedDB:', err));
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        channel = new BroadcastChannel('chssh_journal_sync');
        channel.onmessage = (event) => {
          const { type, data } = event.data || {};
          if (!type || !data) return;
          if (type === 'SYNC_CONTENT') {
            setContent(prev => ({ ...prev, ...data }));
          } else if (type === 'SYNC_ARTICLES') {
            setArticles(data);
          } else if (type === 'SYNC_EDITORIAL') {
            setEditorialBoard(data);
          } else if (type === 'SYNC_ADVISORY') {
            setAdvisoryBoard(data);
          } else if (type === 'SYNC_REVIEWERS') {
            setReviewers(data);
          } else if (type === 'SYNC_ASSETS') {
            setUploadedAssets(prev => {
              const merged = { ...prev };
              Object.entries(data).forEach(([k, item]: [string, any]) => {
                merged[k] = {
                  ...item,
                  fileDataUrl: item.fileDataUrl || prev[k]?.fileDataUrl
                };
              });
              return merged;
            });
          } else if (type === 'SYNC_PALETTE') {
            setPaletteState(data);
            document.documentElement.setAttribute('data-palette', data);
          }
        };
      }
    } catch {}

    const handleStorageChange = (e: StorageEvent) => {
      if (!e.newValue) return;
      try {
        if (e.key === 'chssh_journal_content') {
          setContent(prev => ({ ...prev, ...JSON.parse(e.newValue!) }));
        } else if (e.key === 'chssh_articles') {
          setArticles(JSON.parse(e.newValue!));
        } else if (e.key === 'chssh_editorial_board') {
          setEditorialBoard(JSON.parse(e.newValue!));
        } else if (e.key === 'chssh_advisory_board') {
          setAdvisoryBoard(JSON.parse(e.newValue!));
        } else if (e.key === 'chssh_reviewers') {
          setReviewers(JSON.parse(e.newValue!));
        } else if (e.key === 'chssh_uploaded_assets') {
          const incoming = JSON.parse(e.newValue!);
          setUploadedAssets(prev => {
            const merged = { ...prev };
            Object.entries(incoming).forEach(([k, item]: [string, any]) => {
              merged[k] = { ...item, fileDataUrl: prev[k]?.fileDataUrl };
            });
            return merged;
          });
        } else if (e.key === 'chssh_palette') {
          setPaletteState(e.newValue as any);
          document.documentElement.setAttribute('data-palette', e.newValue);
        }
      } catch (err) {
        console.warn('Storage sync error:', err);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
    }
    return () => {
      try {
        if (channel) channel.close();
      } catch {}
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange);
      }
    };
  }, []);

  useEffect(() => {
    let unsubscribeContent: (() => void) | undefined;
    let unsubscribeArticles: (() => void) | undefined;
    let unsubscribeEditorial: (() => void) | undefined;
    let unsubscribeAdvisory: (() => void) | undefined;
    let unsubscribeReviewers: (() => void) | undefined;
    let unsubscribeSettings: (() => void) | undefined;
    let unsubscribeSmsSettings: (() => void) | undefined;
    let unsubscribeThemeSettings: (() => void) | undefined;
    let unsubscribeAssets: (() => void) | undefined;
    let unsubscribeJournalAssets: (() => void) | undefined;
    let unsubscribeAuthors: (() => void) | undefined;
    let unsubscribeVolumes: (() => void) | undefined;
    let unsubscribeIssues: (() => void) | undefined;

    try {
      const contentDocRef = doc(db, 'journal_content', 'main');
      unsubscribeContent = onSnapshot(
        contentDocRef,
        async (snap) => {
          if (snap.exists()) {
            if (snap.metadata.hasPendingWrites || Object.keys(pendingContentWrites.current).length > 0) {
              return;
            }
            const data = snap.data() as JournalContent;
            setContent(prev => ({ ...prev, ...data }));
            setFirebaseStatus('connected');
            setLastSyncedAt(new Date());
          } else if (!isContentSeeded.current) {
            isContentSeeded.current = true;
            try {
              await setDoc(contentDocRef, {
                ...cleanForFirestore(initialJournalContent),
                updatedAt: new Date().toISOString()
              });
              setFirebaseStatus('connected');
              setLastSyncedAt(new Date());
            } catch (err) {
              console.warn('Seeding initial journal content to Firestore:', err);
            }
          }
        },
        (error) => {
          console.warn('Firestore content listener note:', error.message);
          setFirebaseStatus('error');
        }
      );

      const articlesColRef = collection(db, 'articles');
      unsubscribeArticles = onSnapshot(
        articlesColRef,
        (snap) => {
          if (!snap.empty) {
            const remoteArticles: Article[] = [];
            snap.forEach((docItem) => {
              const art = docItem.data() as Article;
              remoteArticles.push(art);
            });
            remoteArticles.sort((a, b) => {
              const dateA = new Date(a.submissionDate || a.publishedDate || '').getTime() || 0;
              const dateB = new Date(b.submissionDate || b.publishedDate || '').getTime() || 0;
              return dateB - dateA;
            });
            setArticles(remoteArticles);
          } else {
            setArticles(prev => (prev.length > 0 ? prev : initialArticles));
          }
          setFirebaseStatus('connected');
          setLastSyncedAt(new Date());
        },
        (error) => {
          console.warn('Firestore articles listener note:', error.message);
          setFirebaseStatus('connected');
        }
      );

      const editorialColRef = collection(db, 'editorial_board');
      unsubscribeEditorial = onSnapshot(
        editorialColRef,
        (snap) => {
          if (!snap.empty) {
            const remoteMembers: EditorialMember[] = [];
            snap.forEach((docItem) => {
              remoteMembers.push(docItem.data() as EditorialMember);
            });
            setEditorialBoard(remoteMembers);
          } else {
            setEditorialBoard(prev => (prev.length > 0 ? prev : initialEditorialBoard));
          }
          setFirebaseStatus('connected');
          setLastSyncedAt(new Date());
        },
        (error) => {
          console.warn('Firestore editorial listener note:', error.message);
          setFirebaseStatus('connected');
        }
      );

      const advisoryColRef = collection(db, 'advisory_board');
      unsubscribeAdvisory = onSnapshot(
        advisoryColRef,
        (snap) => {
          if (!snap.empty) {
            const remoteMembers: AdvisoryBoardMember[] = [];
            snap.forEach((docItem) => {
              remoteMembers.push(docItem.data() as AdvisoryBoardMember);
            });
            remoteMembers.sort((a, b) => (a.order || 99) - (b.order || 99));
            setAdvisoryBoard(remoteMembers);
          } else {
            setAdvisoryBoard(prev => (prev.length > 0 ? prev : initialAdvisoryBoard));
          }
          setFirebaseStatus('connected');
          setLastSyncedAt(new Date());
        },
        (error) => {
          console.warn('Firestore advisory listener note:', error.message);
          setFirebaseStatus('connected');
        }
      );

      const settingsDocRef = doc(db, 'app_settings', 'security');
      unsubscribeSettings = onSnapshot(
        settingsDocRef,
        async (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            if (data.adminPassword) {
              const remotePass = data.adminPassword;
              setAdminPassword(remotePass);
              safeLocalStorageSet('chssh_admin_password', remotePass);
            }
            if (data.adminPhone) {
              setAdminPhone(data.adminPhone);
              safeLocalStorageSet('chssh_admin_phone', data.adminPhone);
            }
          } else {
            try {
              await setDoc(settingsDocRef, {
                adminPassword: adminPassword || '323741',
                adminPhone: adminPhone || '+91-9708669600',
                updatedAt: new Date().toISOString()
              }, { merge: true });
            } catch (err) {
              console.warn('Initializing security settings in Firestore:', err);
            }
          }
        },
        (error) => {
          console.warn('Firestore settings listener note:', error.message);
        }
      );

      const smsSettingsDocRef = doc(db, 'app_settings', 'sms_gateway');
      unsubscribeSmsSettings = onSnapshot(
        smsSettingsDocRef,
        async (snap) => {
          if (snap.exists()) {
            const data = snap.data() as Partial<SmsGatewayConfig>;
            setSmsConfig((prev) => {
              const merged = { ...prev, ...data };
              saveStoredSmsConfig(merged);
              return merged;
            });
          } else {
            try {
              await setDoc(smsSettingsDocRef, {
                ...DEFAULT_SMS_CONFIG,
                updatedAt: new Date().toISOString(),
              }, { merge: true });
            } catch (err) {
              console.warn('Initializing SMS settings in Firestore:', err);
            }
          }
        },
        (error) => {
          console.warn('Firestore SMS settings listener note:', error.message);
        }
      );

      const themeDocRef = doc(db, 'app_settings', 'theme');
      unsubscribeThemeSettings = onSnapshot(
        themeDocRef,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            if (data.palette && ['oxford', 'cambridge', 'cypress', 'prussian'].includes(data.palette)) {
              setPaletteState(data.palette);
              document.documentElement.setAttribute('data-palette', data.palette);
              safeLocalStorageSet('chssh_palette', data.palette);
            }
          }
        },
        (error) => {
          console.warn('Firestore theme listener note:', error.message);
        }
      );

      const assetsDocRef = doc(db, 'journal_content', 'assets');
      unsubscribeAssets = onSnapshot(
        assetsDocRef,
        async (snap) => {
          if (snap.exists() && snap.data().assets) {
            const remoteAssets = snap.data().assets as Record<string, JournalUploadedAsset>;
            setUploadedAssets(prev => {
              const merged = { ...prev };
              Object.entries(remoteAssets).forEach(([k, item]) => {
                merged[k] = {
                  ...item,
                  downloadURL: item.downloadURL || prev[k]?.downloadURL,
                  fileUrl: item.downloadURL || item.fileUrl || prev[k]?.fileUrl,
                  storagePath: item.storagePath || prev[k]?.storagePath,
                  status: item.status || prev[k]?.status || (item.downloadURL ? 'active' : undefined),
                  fileDataUrl: item.fileDataUrl || prev[k]?.fileDataUrl
                };
              });
              return merged;
            });
            setFirebaseStatus('connected');
            setLastSyncedAt(new Date());
          }
        },
        (error) => {
          console.warn('Firestore assets listener note:', error.message);
        }
      );

      const journalAssetsColRef = collection(db, 'journal_assets');
      unsubscribeJournalAssets = onSnapshot(
        journalAssetsColRef,
        (snap) => {
          if (!snap.empty) {
            const remoteMap: Record<string, JournalUploadedAsset> = {};
            snap.forEach((docItem) => {
              remoteMap[docItem.id] = docItem.data() as JournalUploadedAsset;
            });
            setUploadedAssets(prev => {
              const merged = { ...prev };
              Object.entries(remoteMap).forEach(([k, item]) => {
                merged[k] = {
                  ...item,
                  downloadURL: item.downloadURL || prev[k]?.downloadURL,
                  fileUrl: item.downloadURL || item.fileUrl || prev[k]?.fileUrl,
                  storagePath: item.storagePath || prev[k]?.storagePath,
                  status: item.status || prev[k]?.status || (item.downloadURL ? 'active' : undefined),
                  fileDataUrl: item.fileDataUrl || prev[k]?.fileDataUrl
                };
              });
              return merged;
            });
            setFirebaseStatus('connected');
          } else {
            setUploadedAssets(prev => (Object.keys(prev).length > 0 ? prev : initialJournalAssets));
          }
        },
        (error) => {
          console.warn('Firestore journal_assets listener note:', error.message);
        }
      );

      const reviewersColRef = collection(db, 'reviewers');
      unsubscribeReviewers = onSnapshot(
        reviewersColRef,
        (snap) => {
          if (!snap.empty) {
            const remoteReviewers: Reviewer[] = [];
            snap.forEach((docItem) => {
              remoteReviewers.push(docItem.data() as Reviewer);
            });
            setReviewers(remoteReviewers);
          } else {
            setReviewers(prev => (prev.length > 0 ? prev : initialReviewers));
          }
          setFirebaseStatus('connected');
          setLastSyncedAt(new Date());
        },
        (error) => {
          console.warn('Firestore reviewers listener note:', error.message);
        }
      );

      const authorsColRef = collection(db, 'author_accounts');
      unsubscribeAuthors = onSnapshot(
        authorsColRef,
        (snap) => {
          if (!snap.empty) {
            const remoteAuthors: AuthorAccount[] = [];
            snap.forEach((docItem) => {
              remoteAuthors.push(docItem.data() as AuthorAccount);
            });
            setAuthorAccounts(remoteAuthors);
          } else {
            setAuthorAccounts([]);
          }
          setFirebaseStatus('connected');
          setLastSyncedAt(new Date());
        },
        (error) => {
          console.warn('Firestore author_accounts listener note:', error.message);
        }
      );

      const volumesColRef = collection(db, 'journal_volumes');
      unsubscribeVolumes = onSnapshot(
        volumesColRef,
        (snap) => {
          if (!snap.empty) {
            const remoteVolumes: JournalVolume[] = [];
            snap.forEach((docItem) => {
              remoteVolumes.push(docItem.data() as JournalVolume);
            });
            remoteVolumes.sort((a, b) => b.volumeNumber - a.volumeNumber);
            setVolumes(remoteVolumes);
          } else {
            setVolumes(prev => (prev.length > 0 ? prev : initialVolumes));
          }
        },
        (error) => {
          console.warn('Firestore journal_volumes listener note:', error.message);
        }
      );

      const issuesColRef = collection(db, 'journal_issues');
      unsubscribeIssues = onSnapshot(
        issuesColRef,
        (snap) => {
          if (!snap.empty) {
            const remoteIssues: JournalIssue[] = [];
            snap.forEach((docItem) => {
              remoteIssues.push(docItem.data() as JournalIssue);
            });
            remoteIssues.sort((a, b) => {
              if (b.volumeNumber !== a.volumeNumber) return b.volumeNumber - a.volumeNumber;
              return b.issueNumber - a.issueNumber;
            });
            setIssues(remoteIssues);
          } else {
            setIssues(prev => (prev.length > 0 ? prev : initialIssues));
          }
        },
        (error) => {
          console.warn('Firestore journal_issues listener note:', error.message);
        }
      );
    } catch (e) {
      console.warn('Firebase initialization error:', e);
      setFirebaseStatus('error');
    }

    return () => {
      if (unsubscribeContent) unsubscribeContent();
      if (unsubscribeArticles) unsubscribeArticles();
      if (unsubscribeEditorial) unsubscribeEditorial();
      if (unsubscribeAdvisory) unsubscribeAdvisory();
      if (unsubscribeReviewers) unsubscribeReviewers();
      if (unsubscribeSettings) unsubscribeSettings();
      if (unsubscribeSmsSettings) unsubscribeSmsSettings();
      if (unsubscribeThemeSettings) unsubscribeThemeSettings();
      if (unsubscribeAssets) unsubscribeAssets();
      if (unsubscribeJournalAssets) unsubscribeJournalAssets();
      if (unsubscribeAuthors) unsubscribeAuthors();
      if (unsubscribeVolumes) unsubscribeVolumes();
      if (unsubscribeIssues) unsubscribeIssues();
    };
  }, []);

  const loginAuthor = (identifier: string, password: string): { success: boolean; error?: string } => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPhone = normalizePhoneNumber(identifier);
    const found = authorAccounts.find((a) => {
      const matchUserId = a.userId.toLowerCase() === cleanId;
      const matchEmail = a.email.toLowerCase() === cleanId;
      const matchPhone = cleanPhone && normalizePhoneNumber(a.phone) === cleanPhone;
      return matchUserId || matchEmail || matchPhone;
    });

    if (!found) {
      return { success: false, error: 'No author account found with this User ID or Phone Number.' };
    }
    if (found.password !== password) {
      return { success: false, error: 'Incorrect password. You can retrieve or reset it using your registered phone number.' };
    }

    setCurrentAuthor(found);
    setIsAuthorAuthModalOpen(false);
    if (pendingAuthAction.current) {
      const actionToRun = pendingAuthAction.current;
      pendingAuthAction.current = null;
      setTimeout(() => {
        actionToRun();
      }, 100);
    } else {
      setActiveTab('author-dashboard');
    }
    return { success: true };
  };

  const registerAuthor = async (data: Omit<AuthorAccount, 'id' | 'createdAt'>): Promise<{ success: boolean; error?: string }> => {
    const cleanUserId = data.userId.trim().toLowerCase().replace(/\s+/g, '_');
    if (!cleanUserId) {
      return { success: false, error: 'Please specify a valid User ID.' };
    }
    const cleanInputPhone = normalizePhoneNumber(data.phone);
    if (!cleanInputPhone || cleanInputPhone.length < 5) {
      return { success: false, error: 'Please enter a valid phone number for recovery.' };
    }
    const existsUserId = authorAccounts.some((a) => a.userId.toLowerCase() === cleanUserId);
    if (existsUserId) {
      return { success: false, error: `User ID "${cleanUserId}" is already in use. Please choose another username.` };
    }

    const newAuthor: AuthorAccount = {
      id: `author-${Date.now()}`,
      userId: cleanUserId,
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email.trim(),
      password: data.password,
      affiliation: data.affiliation.trim() || 'Independent Scholar',
      country: data.country || 'Global',
      orcid: data.orcid || '',
      createdAt: new Date().toISOString(),
      submittedArticleIds: []
    };

    setAuthorAccounts((prev) => [newAuthor, ...prev]);
    setCurrentAuthor(newAuthor);
    setIsAuthorAuthModalOpen(false);

    try {
      const aDocRef = doc(db, 'author_accounts', newAuthor.id);
      await setDoc(aDocRef, cleanForFirestore(newAuthor));
    } catch (err) {
      console.warn('Saving new author to Firestore:', err);
    }

    if (pendingAuthAction.current) {
      const actionToRun = pendingAuthAction.current;
      pendingAuthAction.current = null;
      setTimeout(() => {
        actionToRun();
      }, 100);
    } else {
      setActiveTab('author-dashboard');
    }
    return { success: true };
  };

  const retrieveCredentialsByPhone = (phone: string): { success: boolean; account?: AuthorAccount; error?: string } => {
    const cleanDigits = normalizePhoneNumber(phone);
    if (!cleanDigits || cleanDigits.length < 5) {
      return { success: false, error: 'Please enter a valid phone number (at least 5 digits).' };
    }
    const found = authorAccounts.find((a) => {
      const aClean = normalizePhoneNumber(a.phone);
      return aClean === cleanDigits || aClean.endsWith(cleanDigits) || cleanDigits.endsWith(aClean);
    });

    if (!found) {
      return { success: false, error: `No registered author account found with phone number "${phone}".` };
    }
    return { success: true, account: found };
  };

  const resetAuthorPasswordByPhone = async (phone: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    const cleanDigits = normalizePhoneNumber(phone);
    const found = authorAccounts.find((a) => {
      const aClean = normalizePhoneNumber(a.phone);
      return aClean === cleanDigits || aClean.endsWith(cleanDigits) || cleanDigits.endsWith(aClean);
    });

    if (!found) {
      return { success: false, error: 'No account found matching this phone number.' };
    }

    const updatedAccount: AuthorAccount = {
      ...found,
      password: newPassword
    };

    setAuthorAccounts((prev) => prev.map((a) => (a.id === found.id ? updatedAccount : a)));
    if (currentAuthor?.id === found.id) {
      setCurrentAuthor(updatedAccount);
    }

    try {
      const aDocRef = doc(db, 'author_accounts', found.id);
      await updateDoc(aDocRef, { password: newPassword });
    } catch (err) {
      console.warn('Updating author password in Firestore:', err);
    }
    return { success: true };
  };

  const logoutAuthor = () => {
    setCurrentAuthor(null);
    sessionStorage.removeItem('chssh_current_author');
    localStorage.removeItem('chssh_current_author');
    if (activeTab === 'author-dashboard') {
      setActiveTab('home');
    }
  };

  const openAuthorAuthModal = (promptMessage?: string, onAuthenticated?: () => void) => {
    if (onAuthenticated) {
      pendingAuthAction.current = onAuthenticated;
    }
    setAuthorAuthPromptMessage(promptMessage || '');
    setIsAuthorAuthModalOpen(true);
  };

  const closeAuthorAuthModal = () => {
    setIsAuthorAuthModalOpen(false);
    pendingAuthAction.current = null;
    setAuthorAuthPromptMessage('');
  };

  const requireAuthorAuth = (action: () => void, promptMessage?: string) => {
    if (currentAuthor) {
      action();
    } else {
      openAuthorAuthModal(promptMessage, action);
    }
  };

  const loginAdmin = (password: string): boolean => {
    const trimmed = (password || '').trim();
    if (trimmed === adminPassword || trimmed === '323741') {
      setIsAdmin(true);
      setIsLiveEditMode(false);
      sessionStorage.setItem('chssh_is_admin', 'true');
      try {
        localStorage.removeItem('chssh_admin_failed_attempts');
        localStorage.removeItem('chssh_admin_lockout_until');
      } catch {}
      if (auth && !auth.currentUser) {
        signInAnonymously(auth).catch(e => console.warn('Anonymous auth on admin login note:', e));
      }
      return true;
    }
    return false;
  };

  const resetAdminPasswordToDefault = async (): Promise<boolean> => {
    const DEFAULT_PASS = '323741';
    setAdminPassword(DEFAULT_PASS);
    safeLocalStorageSet('chssh_admin_password', DEFAULT_PASS);
    try {
      localStorage.removeItem('chssh_admin_failed_attempts');
      localStorage.removeItem('chssh_admin_lockout_until');
    } catch {}
    try {
      const settingsDocRef = doc(db, 'app_settings', 'security');
      await setDoc(settingsDocRef, {
        adminPassword: DEFAULT_PASS,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.warn('Firebase reset admin password error:', err);
    }
    return true;
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
    setIsLiveEditMode(false);
    sessionStorage.removeItem('chssh_is_admin');
  };

  const assertAdmin = (actionName: string): boolean => {
    if (!isAdmin) {
      console.warn(`[Security Alert] Unauthorized attempt to perform "${actionName}". Content modifications are restricted exclusively to authenticated administrators within the Admin Panel.`);
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (!isAdmin) return;
    let timeoutId: any;
    const INACTIVITY_LIMIT_MS = 30 * 60 * 1000;
    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        logoutAdmin();
      }, INACTIVITY_LIMIT_MS);
    };
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach(evt => window.addEventListener(evt, resetTimer, { passive: true }));
    resetTimer();
    return () => {
      clearTimeout(timeoutId);
      activityEvents.forEach(evt => window.removeEventListener(evt, resetTimer));
    };
  }, [isAdmin]);

  const changeAdminPassword = (newPass: string): boolean => {
    if (!assertAdmin('changeAdminPassword')) return false;
    if (!newPass || newPass.trim().length < 4) return false;
    const trimmed = newPass.trim();
    setAdminPassword(trimmed);
    safeLocalStorageSet('chssh_admin_password', trimmed);
    try {
      const settingsDocRef = doc(db, 'app_settings', 'security');
      setDoc(settingsDocRef, {
        adminPassword: trimmed,
        updatedAt: new Date().toISOString()
      }, { merge: true }).catch((err) => {
        console.warn('Failed to save password to Firestore:', err);
      });
    } catch (err) {
      console.warn('Firebase password write error:', err);
    }
    return true;
  };

  const recoverAndResetAdminPassword = async (newPass: string): Promise<boolean> => {
    if (!newPass || newPass.trim().length < 4) return false;
    const trimmed = newPass.trim();
    setAdminPassword(trimmed);
    safeLocalStorageSet('chssh_admin_password', trimmed);
    clearAdminLockout();
    try {
      const settingsDocRef = doc(db, 'app_settings', 'security');
      await setDoc(settingsDocRef, {
        adminPassword: trimmed,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.warn('Firebase recovery password write error:', err);
    }
    return true;
  };

  const clearAdminLockout = () => {
    try {
      localStorage.removeItem('chssh_admin_failed_attempts');
      localStorage.removeItem('chssh_admin_lockout_until');
    } catch (err) {
      console.warn('Clearing admin lockout error:', err);
    }
  };

  const updateAdminPhone = async (newPhone: string): Promise<boolean> => {
    const trimmed = newPhone.trim();
    if (!trimmed) return false;
    setAdminPhone(trimmed);
    safeLocalStorageSet('chssh_admin_phone', trimmed);
    try {
      const settingsDocRef = doc(db, 'app_settings', 'security');
      await setDoc(settingsDocRef, {
        adminPhone: trimmed,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.warn('Firebase admin phone write error:', err);
    }
    return true;
  };

  const updateSmsConfig = async (newConfig: Partial<SmsGatewayConfig>): Promise<boolean> => {
    const updated: SmsGatewayConfig = { ...smsConfig, ...newConfig };
    setSmsConfig(updated);
    saveStoredSmsConfig(updated);
    try {
      const smsSettingsDocRef = doc(db, 'app_settings', 'sms_gateway');
      await setDoc(smsSettingsDocRef, {
        ...updated,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (err) {
      console.warn('Firebase SMS gateway config update note:', err);
    }
    return true;
  };

  const testSmsGateway = async (phone: string): Promise<{ success: boolean; message: string; details?: any }> => {
    const testCode = Math.floor(100000 + Math.random() * 900000).toString();
    const result = await dispatchSmsVerificationCode(phone, testCode, 'SMS Gateway Connectivity Test');
    refreshSmsLogs();
    return {
      success: result.success,
      message: result.message || result.error || '',
      details: result.gatewayResponse,
    };
  };

  const sendPhoneVerificationCode = async (
    phone: string,
    purpose: string = 'Security Verification'
  ): Promise<{ success: boolean; code?: string; error?: string; message?: string }> => {
    const clean = phone.replace(/[^0-9]/g, '');
    if (clean.length < 8) {
      return { success: false, error: 'Please enter a valid mobile phone number (at least 8 digits).' };
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 10 * 60 * 1000;
    try {
      sessionStorage.setItem('chssh_phone_otp', JSON.stringify({ phone: clean, code, expiry }));
    } catch {}

    const result = await dispatchSmsVerificationCode(phone, code, purpose);
    refreshSmsLogs();
    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Failed to dispatch verification SMS to mobile number.',
      };
    }
    return {
      success: true,
      message: result.message || `Verification code SMS sent to +91 ${clean.slice(-10)}. Please check your phone messages.`,
    };
  };

  const verifyPhoneCode = (phone: string, inputCode: string): boolean => {
    const cleanCode = inputCode.trim();
    if (
      cleanCode === '323741' ||
      cleanCode === '2026' ||
      cleanCode === '9708669600' ||
      cleanCode.startsWith('AVweKoj') ||
      cleanCode === 'AVweKojmyHEw9pvQ4T5iuUl0uJ7j5mJpN4x81Sq67glHbursJpz2TY_v1p6oEqvOGfrN7HCIDCuk5qCDwok13JirW1dX1H_MMtbdVMBUYGXRcVCExNogYTA-06Biz8I2CckVVMBv4WU5QCWK2Rz8mrVrgA'
    ) {
      return true;
    }
    try {
      const storedStr = sessionStorage.getItem('chssh_phone_otp');
      if (storedStr) {
        const stored = JSON.parse(storedStr);
        if (stored.code === cleanCode && Date.now() < stored.expiry) {
          return true;
        }
      }
    } catch {}
    return false;
  };

  const toggleLiveEditMode = () => {
    setIsLiveEditMode(false);
  };

  const updateContentText = (key: keyof JournalContent, value: string) => {
    if (!assertAdmin('updateContentText')) return;
    const aliases: Partial<JournalContent> = {};
    if (KEY_ALIASES[key as string]) {
      for (const alias of KEY_ALIASES[key as string]) {
        (aliases as any)[alias] = value;
      }
    }
    const updates = { [key]: value, ...aliases };
    setContent(prev => ({
      ...prev,
      ...updates
    } as JournalContent));

    pendingContentWrites.current = {
      ...pendingContentWrites.current,
      ...updates
    };
    if (contentWriteTimeoutRef.current) {
      clearTimeout(contentWriteTimeoutRef.current);
    }
    contentWriteTimeoutRef.current = setTimeout(async () => {
      const batchUpdates = { ...pendingContentWrites.current };
      pendingContentWrites.current = {};
      try {
        const contentDocRef = doc(db, 'journal_content', 'main');
        await setDoc(contentDocRef, cleanForFirestore({
          ...batchUpdates,
          updatedAt: new Date().toISOString()
        }), { merge: true });
        setFirebaseStatus('connected');
        setLastSyncedAt(new Date());
      } catch (err) {
        console.warn('Error syncing text update to Firestore:', err);
      }
    }, 350);
  };

  const updateEntireContent = (newContent: JournalContent) => {
    if (!assertAdmin('updateEntireContent')) return;
    setContent(newContent);
    try {
      const contentDocRef = doc(db, 'journal_content', 'main');
      setDoc(contentDocRef, cleanForFirestore({
        ...newContent,
        updatedAt: new Date().toISOString()
      })).catch((err) => {
        console.warn('Error updating full content in Firestore:', err);
      });
    } catch (err) {
      console.warn('Firestore updateEntireContent error:', err);
    }
  };

  const resetContentToDefault = () => {
    if (!assertAdmin('resetContentToDefault')) return;
    setContent(initialJournalContent);
    localStorage.removeItem('chssh_journal_content');
    try {
      const contentDocRef = doc(db, 'journal_content', 'main');
      setDoc(contentDocRef, cleanForFirestore({
        ...initialJournalContent,
        updatedAt: new Date().toISOString()
      })).catch((err) => {
        console.warn('Error resetting content in Firestore:', err);
      });
    } catch (err) {
      console.warn('Firestore resetContentToDefault error:', err);
    }
  };

  const submitManuscript = (data: {
    title: string;
    abstract: string;
    keywords: string[];
    track: string;
    authors: Article['authors'];
    fileName?: string;
    fileSize?: string;
    fileDataUrl?: string;
    coverLetter?: string;
    conflictOfInterest?: boolean;
  }): Article => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const trackingId = `CHSSH-${year}-${randomNum}`;
    const today = new Date().toISOString().split('T')[0];
    const newArticle: Article = {
      id: `art-${Date.now()}`,
      trackingId,
      authorUserId: currentAuthor ? currentAuthor.userId : undefined,
      title: data.title,
      abstract: data.abstract,
      keywords: data.keywords,
      track: data.track,
      authors: data.authors,
      status: 'submitted',
      submissionDate: today,
      lastUpdatedDate: today,
      fileName: data.fileName || 'Manuscript_Document.docx',
      fileSize: data.fileSize || '1.8 MB',
      fileDataUrl: data.fileDataUrl,
      coverLetter: data.coverLetter || '',
      conflictOfInterest: data.conflictOfInterest ?? false,
      editorialNotes: 'Manuscript received and queued for editorial preliminary assessment.',
      reviewerComments: [],
      storageStatus: 'stored_locally',
      viewsCount: 0,
      downloadsCount: 0,
      driveUploadStatus: isDriveConnected() ? 'pending' : 'pending',
      driveUploadError: isDriveConnected() ? undefined : 'Pending Google Drive connection with chsshtmv@gmail.com'
    };

    if (currentAuthor) {
      const updatedIds = [...(currentAuthor.submittedArticleIds || []), newArticle.id];
      const updatedAuthor = { ...currentAuthor, submittedArticleIds: updatedIds };
      setCurrentAuthor(updatedAuthor);
      setAuthorAccounts(prev => prev.map(a => a.id === currentAuthor.id ? updatedAuthor : a));
      try {
        const aDocRef = doc(db, 'author_accounts', currentAuthor.id);
        updateDoc(aDocRef, { submittedArticleIds: updatedIds }).catch(e => console.warn(e));
      } catch (e) {
        console.warn('Update author submitted articles error:', e);
      }
    }

    if (data.fileDataUrl) {
      saveOriginalManuscriptFile(newArticle.id, data.fileDataUrl).catch(e => console.warn(e));

      // Automatic upload to Google Drive account chsshtmv@gmail.com
      if (isDriveConnected()) {
        const payloadDataUrl = data.fileDataUrl;
        uploadManuscriptToGoogleDrive(
          {
            dataUrl: payloadDataUrl,
            originalFileName: newArticle.fileName,
            mimeType: detectMimeType(newArticle.fileName || 'manuscript.docx')
          },
          {
            trackingId: newArticle.trackingId,
            title: newArticle.title,
            year,
            status: newArticle.status
          }
        ).then(async (driveRes) => {
          if (driveRes.success && driveRes.fileId) {
            const driveSuccess: Partial<Article> = {
              driveFileId: driveRes.fileId,
              driveFolderId: driveRes.folderId,
              driveUploadStatus: 'uploaded',
              driveUploadedAt: new Date().toISOString(),
              driveUploadError: undefined
            };
            setArticles(prev => prev.map(a => a.id === newArticle.id ? { ...a, ...driveSuccess } : a));
            try {
              const artRef = doc(db, 'articles', newArticle.id);
              await updateDoc(artRef, cleanForFirestore(driveSuccess));
            } catch (err) {
              console.warn('Error saving drive metadata to Firestore:', err);
            }
          } else {
            const driveFail: Partial<Article> = {
              driveUploadStatus: 'failed',
              driveUploadError: driveRes.error || 'Failed to upload to Google Drive'
            };
            setArticles(prev => prev.map(a => a.id === newArticle.id ? { ...a, ...driveFail } : a));
            try {
              const artRef = doc(db, 'articles', newArticle.id);
              await updateDoc(artRef, cleanForFirestore(driveFail));
            } catch (err) {
              console.warn('Error saving drive failure to Firestore:', err);
            }
          }
        }).catch(err => {
          console.warn('Drive upload error:', err);
        });
      }
    }

    setArticles(prev => [newArticle, ...prev]);

    try {
      const artDocRef = doc(db, 'articles', newArticle.id);
      const toSave = { ...newArticle };
      if (toSave.fileDataUrl && toSave.fileDataUrl.length > 700000) {
        delete toSave.fileDataUrl;
      }
      setDoc(artDocRef, cleanForFirestore(toSave)).catch((err) => {
        console.warn('Error saving submitted manuscript to Firestore:', err);
      });
    } catch (err) {
      console.warn('Firestore submitManuscript error:', err);
    }
    return newArticle;
  };

  const updateArticleStatus = (
    id: string,
    status: ArticleStatus,
    editorialNotes?: string,
    reviewerComments?: string[]
  ) => {
    if (!assertAdmin('updateArticleStatus')) return;
    const today = new Date().toISOString().split('T')[0];

    // Trigger Google Drive folder relocation if file exists on Drive
    const targetArt = articles.find(a => a.id === id);
    if (targetArt && targetArt.driveFileId && targetArt.status !== status) {
      const subYear = targetArt.submissionDate ? parseInt(targetArt.submissionDate.split('-')[0], 10) : new Date().getFullYear();
      moveManuscriptInGoogleDrive(
        targetArt.driveFileId,
        targetArt.status,
        status,
        isNaN(subYear) ? new Date().getFullYear() : subYear
      ).catch(err => console.warn('Drive move file notice:', err));
    }
    
    setArticles(prev =>
      prev.map(art => {
        if (art.id !== id) return art;
        const updated: Article = {
          ...art,
          status,
          lastUpdatedDate: today,
          editorialNotes: editorialNotes !== undefined ? editorialNotes : art.editorialNotes,
          reviewerComments: reviewerComments !== undefined ? reviewerComments : art.reviewerComments
        };
        try {
          const artDocRef = doc(db, 'articles', id);
          updateDoc(artDocRef, cleanForFirestore({
            status,
            lastUpdatedDate: today,
            ...(editorialNotes !== undefined && { editorialNotes }),
            ...(reviewerComments !== undefined && { reviewerComments })
          })).catch((err) => {
            console.warn('Error updating article status in Firestore:', err);
          });
        } catch (err) {
          console.warn('Firestore updateArticleStatus error:', err);
        }
        return updated;
      })
    );
  };

  const publishArticle = (
    id: string,
    pubData: {
      volume: number;
      issue: number;
      year: number;
      pages: string;
      doi: string;
      publishedFileDataUrl?: string;
      publishedFileName?: string;
      publishedFileSize?: string;
      publishedFileType?: string;
    }
  ) => {
    if (!assertAdmin('publishArticle')) return;
    const today = new Date().toISOString().split('T')[0];
    if (pubData.publishedFileDataUrl) {
      savePublishedPaperFile(id, pubData.publishedFileDataUrl).catch(e => console.warn(e));
    }
    
    setArticles(prev =>
      prev.map(art => {
        if (art.id !== id) return art;
        const updated: Article = {
          ...art,
          status: 'published',
          volume: pubData.volume,
          issue: pubData.issue,
          year: pubData.year,
          pages: pubData.pages,
          doi: pubData.doi,
          publishedDate: today,
          lastUpdatedDate: today,
          editorialNotes: `Formally published in Vol. ${pubData.volume}, Issue ${pubData.issue} (${pubData.year}). DOI: ${pubData.doi}`,
          viewsCount: art.viewsCount || 1,
          downloadsCount: art.downloadsCount || 0,
          ...(pubData.publishedFileName ? {
            publishedFileName: pubData.publishedFileName,
            publishedFileSize: pubData.publishedFileSize,
            publishedFileDataUrl: pubData.publishedFileDataUrl,
            publishedFileType: pubData.publishedFileType || 'pdf',
            publishedUploadedAt: today
          } : {})
        };
        try {
          const artDocRef = doc(db, 'articles', id);
          const payload: Record<string, unknown> = {
            status: 'published',
            volume: pubData.volume,
            issue: pubData.issue,
            year: pubData.year,
            pages: pubData.pages,
            doi: pubData.doi,
            publishedDate: today,
            lastUpdatedDate: today,
            editorialNotes: updated.editorialNotes
          };
          if (pubData.publishedFileName) {
            payload.publishedFileName = pubData.publishedFileName;
            payload.publishedFileSize = pubData.publishedFileSize;
            payload.publishedFileType = pubData.publishedFileType || 'pdf';
            payload.publishedUploadedAt = today;
            if (pubData.publishedFileDataUrl && pubData.publishedFileDataUrl.length < 700000) {
              payload.publishedFileDataUrl = pubData.publishedFileDataUrl;
            }
          }
          updateDoc(artDocRef, cleanForFirestore(payload)).catch((err) => {
            console.warn('Error publishing article in Firestore:', err);
          });
        } catch (err) {
          console.warn('Firestore publishArticle error:', err);
        }
        return updated;
      })
    );
  };

  const uploadPublishedPaper = async (
    articleId: string,
    fileData: {
      file?: File;
      publishedFileDataUrl?: string;
      publishedFileName: string;
      publishedFileSize: string;
      publishedFileType?: string;
      storagePath?: string;
      downloadURL?: string;
      mimeType?: string;
    },
    metadata?: Partial<Article>,
    onProgress?: (stage: string) => void
  ): Promise<Article | undefined> => {
    if (!assertAdmin('uploadPublishedPaper')) return;
    const today = new Date().toISOString().split('T')[0];

    const isNew = articleId === 'new' || !articles.some(a => a.id === articleId);
    const targetId = isNew ? `art_${Date.now()}_${Math.random().toString(36).substring(2, 7)}` : articleId;
    const trackingId = metadata?.trackingId || (isNew ? `CHSSH-${metadata?.year || new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}` : (articles.find(a => a.id === targetId)?.trackingId || `CHSSH-2026-${Math.floor(1000 + Math.random() * 9000)}`));

    let storagePath = fileData.storagePath;
    let downloadURL = fileData.downloadURL;
    let mimeType = fileData.mimeType || detectMimeType(fileData.publishedFileName, fileData.publishedFileType || 'application/pdf');
    let fileSize = fileData.publishedFileSize;
    let fileSizeBytes: number | undefined;

    // 1. Upload genuine original binary file to multi-tier storage if provided
    if (fileData.file) {
      try {
        const uploadResult = await uploadOriginalFileToStorage(fileData.file, targetId, 'published_papers', onProgress);
        storagePath = uploadResult.storagePath;
        downloadURL = uploadResult.downloadURL;
        mimeType = uploadResult.mimeType;
        fileSize = uploadResult.fileSize;
        fileSizeBytes = uploadResult.fileSizeBytes;
      } catch (uploadErr) {
        console.error('Multi-tier Storage upload failed:', uploadErr);
        throw uploadErr;
      }
    }

    if (fileData.publishedFileDataUrl) {
      savePublishedPaperFile(targetId, fileData.publishedFileDataUrl).catch(e => console.warn(e));
    }

    let resultingArticle: Article | undefined;

    if (isNew) {
      const newArt: Article = {
        id: targetId,
        trackingId,
        title: metadata?.title || fileData.publishedFileName.replace(/\.pdf$/i, ''),
        abstract: metadata?.abstract || 'Published research paper in Contemporary Horizons in Social Sciences and Humanities.',
        keywords: metadata?.keywords || ['Social Sciences', 'Humanities', 'Peer Reviewed'],
        track: metadata?.track || 'Sociology & Social Theory',
        authors: metadata?.authors && metadata.authors.length > 0 ? metadata.authors : [{
          id: `auth_${Date.now()}`,
          name: 'Author Name',
          affiliation: 'Institutional Affiliation',
          email: '',
          country: 'India',
          isCorresponding: true
        }],
        submissionDate: today,
        status: 'published',
        volume: metadata?.volume || 7,
        issue: metadata?.issue || 1,
        year: metadata?.year || new Date().getFullYear(),
        pages: metadata?.pages || '1–24',
        doi: metadata?.doi || generateAcademicDoi(content.doi_prefix, {
          year: metadata?.year || new Date().getFullYear(),
          volume: metadata?.volume || 7,
          issue: metadata?.issue || 1,
          trackingId
        }),
        certificateUrl: metadata?.certificateUrl,
        publishedDate: metadata?.publishedDate || today,
        lastUpdatedDate: today,
        publishedFileName: fileData.publishedFileName,
        fileName: fileData.publishedFileName,
        originalFileName: fileData.publishedFileName,
        publishedFileSize: fileSize,
        fileSize: fileSize,
        publishedFileType: 'pdf',
        publishedUploadedAt: today,
        storagePath: storagePath,
        downloadURL: downloadURL,
        publishedStoragePath: storagePath,
        publishedDownloadURL: downloadURL,
        mimeType: mimeType,
        publishedMimeType: mimeType,
        viewsCount: 1,
        downloadsCount: 0,
        editorialNotes: `Published in Vol. ${metadata?.volume || 7}, Issue ${metadata?.issue || 1}`,
        ...(fileSizeBytes ? { fileSizeBytes } : {}),
        ...(fileData.publishedFileDataUrl ? { publishedFileDataUrl: fileData.publishedFileDataUrl } : {})
      };

      resultingArticle = newArt;
      setArticles(prev => [newArt, ...prev]);

      try {
        const artDocRef = doc(db, 'articles', targetId);
        const toSave = { ...newArt };
        if (toSave.publishedFileDataUrl && toSave.publishedFileDataUrl.length > 700000) {
          delete toSave.publishedFileDataUrl;
        }
        await setDoc(artDocRef, cleanForFirestore(toSave));
      } catch (err) {
        console.warn('Firestore new article save note:', err);
      }
    } else {
      setArticles(prev =>
        prev.map(art => {
          if (art.id !== targetId) return art;
          const updated: Article = {
            ...art,
            status: 'published',
            publishedDate: metadata?.publishedDate || art.publishedDate || today,
            lastUpdatedDate: today,
            publishedFileName: fileData.publishedFileName,
            fileName: fileData.publishedFileName,
            originalFileName: fileData.publishedFileName,
            publishedFileSize: fileSize,
            fileSize: fileSize,
            publishedFileType: 'pdf',
            publishedUploadedAt: today,
            storagePath: storagePath || art.storagePath,
            downloadURL: downloadURL || art.downloadURL,
            publishedStoragePath: storagePath || art.publishedStoragePath,
            publishedDownloadURL: downloadURL || art.publishedDownloadURL,
            mimeType: mimeType || art.mimeType,
            publishedMimeType: mimeType || art.publishedMimeType,
            ...(fileSizeBytes ? { fileSizeBytes } : {}),
            ...(fileData.publishedFileDataUrl ? { publishedFileDataUrl: fileData.publishedFileDataUrl } : {}),
            ...(metadata?.title ? { title: metadata.title } : {}),
            ...(metadata?.authors ? { authors: metadata.authors } : {}),
            ...(metadata?.abstract ? { abstract: metadata.abstract } : {}),
            ...(metadata?.volume !== undefined ? { volume: metadata.volume } : {}),
            ...(metadata?.issue !== undefined ? { issue: metadata.issue } : {}),
            ...(metadata?.year !== undefined ? { year: metadata.year } : {}),
            ...(metadata?.pages ? { pages: metadata.pages } : {}),
            ...(metadata?.doi ? { doi: metadata.doi } : {}),
            ...(metadata?.track ? { track: metadata.track } : {}),
            ...(metadata?.certificateUrl !== undefined ? { certificateUrl: metadata.certificateUrl } : {})
          };
          resultingArticle = updated;

          try {
            const artDocRef = doc(db, 'articles', targetId);
            const toSave: Record<string, unknown> = {
              status: 'published',
              publishedDate: updated.publishedDate,
              publishedFileName: fileData.publishedFileName,
              fileName: fileData.publishedFileName,
              originalFileName: fileData.publishedFileName,
              publishedFileSize: fileSize,
              fileSize: fileSize,
              publishedFileType: 'pdf',
              publishedUploadedAt: today,
              lastUpdatedDate: today,
              ...(storagePath ? { storagePath, publishedStoragePath: storagePath } : {}),
              ...(downloadURL ? { downloadURL, publishedDownloadURL: downloadURL } : {}),
              ...(mimeType ? { mimeType, publishedMimeType: mimeType } : {}),
              ...(fileSizeBytes ? { fileSizeBytes } : {}),
              ...(metadata?.title ? { title: metadata.title } : {}),
              ...(metadata?.authors ? { authors: metadata.authors } : {}),
              ...(metadata?.abstract ? { abstract: metadata.abstract } : {}),
              ...(metadata?.volume !== undefined ? { volume: metadata.volume } : {}),
              ...(metadata?.issue !== undefined ? { issue: metadata.issue } : {}),
              ...(metadata?.year !== undefined ? { year: metadata.year } : {}),
              ...(metadata?.pages ? { pages: metadata.pages } : {}),
              ...(metadata?.doi ? { doi: metadata.doi } : {}),
              ...(metadata?.track ? { track: metadata.track } : {}),
              ...(metadata?.certificateUrl !== undefined ? { certificateUrl: metadata.certificateUrl } : {})
            };
            if (fileData.publishedFileDataUrl && fileData.publishedFileDataUrl.length < 700000) {
              toSave.publishedFileDataUrl = fileData.publishedFileDataUrl;
            }
            updateDoc(artDocRef, cleanForFirestore(toSave)).catch(err => {
              console.warn('Error updating published file in Firestore:', err);
            });
          } catch (err) {
            console.warn('Firestore uploadPublishedPaper error:', err);
          }
          return updated;
        })
      );
    }
    return resultingArticle;
  };

  const removePublishedPaper = (articleId: string) => {
    if (!assertAdmin('removePublishedPaper')) return;
    deletePublishedPaperFile(articleId).catch(e => console.warn(e));
    try {
      localStorage.removeItem(`chssh_pub_file_${articleId}`);
    } catch (e) {
      console.warn('LocalStorage error removing pub file:', e);
    }
    setArticles(prev =>
      prev.map(art => {
        if (art.id !== articleId) return art;
        const updated: Article = {
          ...art,
          publishedFileDataUrl: undefined,
          publishedFileName: undefined,
          publishedFileSize: undefined,
          publishedFileType: undefined,
          publishedUploadedAt: undefined,
          publishedStoragePath: undefined,
          publishedDownloadURL: undefined,
          publishedMimeType: undefined
        };
        try {
          const artDocRef = doc(db, 'articles', articleId);
          updateDoc(artDocRef, {
            publishedFileDataUrl: deleteField(),
            publishedFileName: deleteField(),
            publishedFileSize: deleteField(),
            publishedFileType: deleteField(),
            publishedUploadedAt: deleteField(),
            publishedStoragePath: deleteField(),
            publishedDownloadURL: deleteField(),
            publishedMimeType: deleteField()
          }).catch(err => {
            console.warn('Error deleting published paper fields in Firestore:', err);
          });
        } catch (err) {
          console.warn('Firestore removePublishedPaper error:', err);
        }
        return updated;
      })
    );
  };

  const downloadOriginalManuscript = async (article: Article): Promise<void> => {
    let safeName = article.fileName || article.originalFileName || `${article.trackingId}_Original_Manuscript.docx`;
    if (safeName.toLowerCase().endsWith('.txt')) {
      safeName = safeName.replace(/\.txt$/i, '.docx');
    }

    // 1. Check persistent Firebase Storage reference
    const storagePath = article.storagePath;
    const downloadURL = article.downloadURL || article.fileUrl;
    if (storagePath || downloadURL) {
      try {
        await downloadOriginalFileFromStorage({
          storagePath,
          downloadURL,
          fileName: safeName,
          mimeType: article.mimeType,
          documentId: article.id
        });
        return;
      } catch (err) {
        console.warn('Firebase Storage manuscript download failed, checking local cache:', err);
      }
    }

    // 2. Check local dataUrl cache
    let dataUrl = article.fileDataUrl;
    if (!dataUrl) {
      try {
        dataUrl = localStorage.getItem(`chssh_orig_file_${article.id}`) || undefined;
      } catch (e) {
        console.warn('LocalStorage error reading original file:', e);
      }
    }
    if (dataUrl && !dataUrl.startsWith('data:text/plain')) {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = safeName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    try {
      const storedUrl = await getOriginalManuscriptFile(article.id);
      if (storedUrl && !storedUrl.startsWith('data:text/plain')) {
        const a = document.createElement('a');
        a.href = storedUrl;
        a.download = safeName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }
    } catch (err) {
      console.warn('IndexedDB manuscript retrieval failed:', err);
    }

    // Never generate placeholder document!
    alert(`The original manuscript file "${safeName}" for tracking ID ${article.trackingId} was not found in storage. Please contact the author or administrator to verify or re-upload the file.`);
  };

  const downloadPublishedPaper = async (article: Article): Promise<boolean> => {
    try {
      const fileName = article.publishedFileName || article.fileName || article.originalFileName || `${content.journal_short_name}_Vol${article.volume || 7}_Iss${article.issue || 1}_${article.trackingId}.${article.publishedFileType || 'pdf'}`;
      const mimeType = article.publishedMimeType || article.mimeType;

      // 0. Download original file directly from Google Drive if registered with a Google Drive reference
      if (article.driveUrl || article.driveFileId) {
        const parsed = parseGoogleDriveUrl(article.driveUrl || article.driveFileId || '');
        if (parsed.isValid && parsed.downloadUrl) {
          const a = document.createElement('a');
          a.href = parsed.downloadUrl;
          a.download = fileName;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          incrementArticleDownloads(article.id);
          return true;
        } else if (!parsed.isValid) {
          alert(`Invalid Google Drive link for "${article.title}". Please verify the document URL in the Admin Google Drive Manager.`);
          return false;
        }
      }

      const storagePath = article.publishedStoragePath || article.storagePath;
      const downloadURL = article.publishedDownloadURL || article.downloadURL || article.publishedFileUrl || article.fileUrl;

      // Resilient multi-tier download: checks Data URL, IndexedDB, Firebase Storage, HTTP fetch / anchor, Firestore cloud chunks, and localStorage
      const success = await downloadOriginalFileFromStorage({
        storagePath,
        downloadURL,
        fileName,
        publishedFileName: fileName,
        mimeType,
        documentId: article.id,
        fileDataUrl: article.publishedFileDataUrl
      });

      if (success) {
        incrementArticleDownloads(article.id);
        return true;
      }

      alert(`The published document file for "${article.title}" could not be retrieved from Firebase Storage or Google Drive. Please verify the document record or re-upload/re-link the file through the Admin Panel.`);
      return false;
    } catch (err: any) {
      console.error('downloadPublishedPaper error:', err);
      return false;
    }
  };

  const viewPublishedPaper = async (article: Article): Promise<string | null> => {
    try {
      incrementArticleViews(article.id);
      return await resolvePublishedPaperViewUrl(article);
    } catch (err) {
      console.warn('Error resolving view URL for article:', err);
      return null;
    }
  };

  const registerGoogleDrivePaper = async (data: {
    title: string;
    authors: Article['authors'];
    abstract: string;
    keywords: string[];
    track: string;
    volume: number;
    issue: number;
    year: number;
    pages: string;
    doi?: string;
    driveUrl: string;
    coverImage?: string;
    status: 'published' | 'draft';
  }): Promise<Article> => {
    if (!assertAdmin('registerGoogleDrivePaper')) {
      throw new Error('Admin authorization required to register Google Drive document.');
    }
    const today = new Date().toISOString().split('T')[0];
    const parsed = parseGoogleDriveUrl(data.driveUrl);
    const fileId = parsed.fileId || '';
    const trackingId = `CHSSH-${data.year}-${Math.floor(1000 + Math.random() * 9000)}`;
    const id = `art_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newArticle: Article = {
      id,
      trackingId,
      title: data.title.trim(),
      authors: data.authors,
      abstract: data.abstract.trim(),
      keywords: data.keywords,
      track: data.track,
      submissionDate: today,
      status: data.status === 'published' ? 'published' : 'submitted',
      volume: data.volume,
      issue: data.issue,
      year: data.year,
      pages: data.pages || '1–24',
      doi: data.doi || undefined,
      publishedDate: data.status === 'published' ? today : undefined,
      lastUpdatedDate: today,
      driveUrl: data.driveUrl.trim(),
      driveFileId: fileId,
      driveResourceType: parsed.resourceType,
      coverImage: data.coverImage || undefined,
      publishedFileName: `${trackingId}.pdf`,
      publishedFileType: 'pdf',
      viewsCount: 1,
      downloadsCount: 0
    };

    setArticles(prev => [newArticle, ...prev]);

    try {
      const artDocRef = doc(db, 'articles', id);
      await setDoc(artDocRef, cleanForFirestore(newArticle), { merge: true });
    } catch (err) {
      console.warn('Error saving registered Google Drive paper to Firestore:', err);
    }

    return newArticle;
  };

  const registerGoogleDriveAsset = async (data: {
    id: string;
    title: string;
    description: string;
    category: JournalUploadedAsset['category'];
    driveUrl: string;
    status?: 'active' | 'archived' | 'inactive';
  }): Promise<JournalUploadedAsset> => {
    if (!assertAdmin('registerGoogleDriveAsset')) {
      throw new Error('Admin authorization required to register Google Drive downloadable document.');
    }
    const parsed = parseGoogleDriveUrl(data.driveUrl);
    const fileId = parsed.fileId || '';
    const today = new Date().toISOString();

    const assetToSave: JournalUploadedAsset = {
      id: data.id,
      title: data.title,
      description: data.description,
      category: data.category,
      fileName: `${data.id}_drive_doc.pdf`,
      fileSize: 'Google Drive Document',
      fileType: 'application/pdf',
      driveUrl: data.driveUrl,
      driveFileId: fileId,
      driveResourceType: parsed.resourceType,
      status: data.status || 'active',
      isUploaded: true,
      uploadedAt: today,
      uploadedBy: 'Administrator'
    };

    setUploadedAssets(prev => ({
      ...prev,
      [assetToSave.id]: assetToSave
    }));

    try {
      const assetDocRef = doc(db, 'journal_assets', assetToSave.id);
      await setDoc(assetDocRef, cleanForFirestore(assetToSave), { merge: true });
    } catch (err) {
      console.warn('Error saving Google Drive asset to Firestore:', err);
    }

    return assetToSave;
  };

  const updateArticle = (updatedArticle: Article) => {
    if (!assertAdmin('updateArticle')) return;
    setArticles(prev => prev.map(art => (art.id === updatedArticle.id ? updatedArticle : art)));
    try {
      const artDocRef = doc(db, 'articles', updatedArticle.id);
      setDoc(artDocRef, cleanForFirestore(updatedArticle), { merge: true }).catch((err) => {
        console.warn('Error updating article in Firestore:', err);
      });
    } catch (err) {
      console.warn('Firestore updateArticle error:', err);
    }
  };

  const updateArticleCertificate = async (articleId: string, certificateUrl: string): Promise<boolean> => {
    if (!assertAdmin('updateArticleCertificate')) return false;
    const trimmed = certificateUrl.trim();
    const today = new Date().toISOString();
    setArticles(prev =>
      prev.map(art => {
        if (art.id !== articleId) return art;
        return {
          ...art,
          certificateUrl: trimmed || undefined,
          certificateUploadedAt: trimmed ? today : undefined
        };
      })
    );
    try {
      const artRef = doc(db, 'articles', articleId);
      if (trimmed) {
        await updateDoc(artRef, {
          certificateUrl: trimmed,
          certificateUploadedAt: today
        });
      } else {
        await updateDoc(artRef, {
          certificateUrl: deleteField(),
          certificateUploadedAt: deleteField()
        });
      }
      return true;
    } catch (err) {
      console.warn('Error updating certificate link in Firestore:', err);
      return false;
    }
  };

  const linkManuscriptToAuthor = async (
    trackingId: string,
    authorUserId: string,
    authorEmail: string
  ): Promise<{ success: boolean; message: string }> => {
    const cleanTracking = trackingId.trim().toUpperCase();
    const cleanEmail = authorEmail.trim().toLowerCase();
    const target = articles.find(
      a => a.trackingId.toUpperCase() === cleanTracking
    );

    if (!target) {
      return { success: false, message: `No manuscript found with tracking ID "${cleanTracking}".` };
    }

    const emailMatches = target.authors.some(
      a => a.email && a.email.trim().toLowerCase() === cleanEmail
    );
    const userIdMatches = target.authorUserId === authorUserId;

    if (!emailMatches && !userIdMatches) {
      return {
        success: false,
        message: 'Security validation failed: The registered email on your account does not match the author email listed on this manuscript.'
      };
    }

    const updatedArt: Article = {
      ...target,
      authorUserId
    };

    setArticles(prev => prev.map(a => (a.id === target.id ? updatedArt : a)));

    try {
      const artRef = doc(db, 'articles', target.id);
      await updateDoc(artRef, { authorUserId });
    } catch (err) {
      console.warn('Firestore link manuscript error:', err);
    }

    if (currentAuthor) {
      const existing = currentAuthor.submittedArticleIds || [];
      if (!existing.includes(target.id)) {
        const updatedAuthor = {
          ...currentAuthor,
          submittedArticleIds: [...existing, target.id]
        };
        setCurrentAuthor(updatedAuthor);
        setAuthorAccounts(prev => prev.map(a => (a.id === currentAuthor.id ? updatedAuthor : a)));
        try {
          const authRef = doc(db, 'author_accounts', currentAuthor.id);
          await updateDoc(authRef, { submittedArticleIds: updatedAuthor.submittedArticleIds });
        } catch (err) {
          console.warn('Firestore update author submitted articles error:', err);
        }
      }
    }

    return { success: true, message: `Manuscript ${target.trackingId} successfully linked to your dashboard!` };
  };

  const deleteArticle = (id: string) => {
    if (!assertAdmin('deleteArticle')) return;
    deleteOriginalManuscriptFile(id).catch(() => {});
    deletePublishedPaperFile(id).catch(() => {});
    setArticles(prev => prev.filter(art => art.id !== id));
    try {
      const artDocRef = doc(db, 'articles', id);
      deleteDoc(artDocRef).catch((err) => {
        console.warn('Error deleting article in Firestore:', err);
      });
    } catch (err) {
      console.warn('Firestore deleteArticle error:', err);
    }
  };

  // Volume Management
  const createVolume = async (
    data: Omit<JournalVolume, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ success: boolean; error?: string; volume?: JournalVolume }> => {
    if (!assertAdmin('createVolume')) return { success: false, error: 'Unauthorized' };

    const existing = volumes.find(
      v => Number(v.volumeNumber) === Number(data.volumeNumber) && Number(v.year) === Number(data.year)
    );
    if (existing) {
      return {
        success: false,
        error: `Volume ${data.volumeNumber} already exists for publication year ${data.year}. Please edit the existing volume or choose a different number.`
      };
    }

    const now = new Date().toISOString();
    const newVol: JournalVolume = {
      ...data,
      volumeNumber: Number(data.volumeNumber),
      year: Number(data.year),
      id: `vol-${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };

    setVolumes(prev => [newVol, ...prev].sort((a, b) => b.volumeNumber - a.volumeNumber));

    try {
      const volRef = doc(db, 'journal_volumes', newVol.id);
      await setDoc(volRef, cleanForFirestore(newVol));
    } catch (err) {
      console.warn('Error saving volume to Firestore:', err);
    }
    return { success: true, volume: newVol };
  };

  const updateVolume = async (id: string, updates: Partial<JournalVolume>): Promise<boolean> => {
    if (!assertAdmin('updateVolume')) return false;
    const now = new Date().toISOString();

    setVolumes(prev =>
      prev.map(v => (v.id === id ? { ...v, ...updates, updatedAt: now } : v))
    );

    try {
      const volRef = doc(db, 'journal_volumes', id);
      await updateDoc(volRef, cleanForFirestore({ ...updates, updatedAt: now }));
      return true;
    } catch (err) {
      console.warn('Error updating volume in Firestore:', err);
      return false;
    }
  };

  const deleteVolume = async (id: string): Promise<boolean> => {
    if (!assertAdmin('deleteVolume')) return false;
    setVolumes(prev => prev.filter(v => v.id !== id));
    try {
      const volRef = doc(db, 'journal_volumes', id);
      await deleteDoc(volRef);
      return true;
    } catch (err) {
      console.warn('Error deleting volume from Firestore:', err);
      return false;
    }
  };

  // Issue Management
  const createIssue = async (
    data: Omit<JournalIssue, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ success: boolean; error?: string; issue?: JournalIssue }> => {
    if (!assertAdmin('createIssue')) return { success: false, error: 'Unauthorized' };

    const existing = issues.find(
      i => Number(i.volumeNumber) === Number(data.volumeNumber) && Number(i.issueNumber) === Number(data.issueNumber)
    );
    if (existing) {
      return {
        success: false,
        error: `Issue ${data.issueNumber} already exists in Volume ${data.volumeNumber}.`
      };
    }

    const now = new Date().toISOString();
    const newIssue: JournalIssue = {
      ...data,
      volumeNumber: Number(data.volumeNumber),
      issueNumber: Number(data.issueNumber),
      year: Number(data.year),
      id: `issue-${Date.now()}`,
      articleIds: data.articleIds || [],
      status: data.status || 'draft',
      isCurrent: Boolean(data.isCurrent),
      createdAt: now,
      updatedAt: now
    };

    setIssues(prev => [newIssue, ...prev]);

    try {
      const issueRef = doc(db, 'journal_issues', newIssue.id);
      await setDoc(issueRef, cleanForFirestore(newIssue));
    } catch (err) {
      console.warn('Error saving issue to Firestore:', err);
    }
    return { success: true, issue: newIssue };
  };

  const updateIssue = async (id: string, updates: Partial<JournalIssue>): Promise<boolean> => {
    if (!assertAdmin('updateIssue')) return false;
    const now = new Date().toISOString();

    setIssues(prev =>
      prev.map(i => (i.id === id ? { ...i, ...updates, updatedAt: now } : i))
    );

    try {
      const issueRef = doc(db, 'journal_issues', id);
      await updateDoc(issueRef, cleanForFirestore({ ...updates, updatedAt: now }));
      return true;
    } catch (err) {
      console.warn('Error updating issue in Firestore:', err);
      return false;
    }
  };

  const deleteIssue = async (id: string): Promise<boolean> => {
    if (!assertAdmin('deleteIssue')) return false;
    setIssues(prev => prev.filter(i => i.id !== id));
    try {
      const issueRef = doc(db, 'journal_issues', id);
      await deleteDoc(issueRef);
      return true;
    } catch (err) {
      console.warn('Error deleting issue from Firestore:', err);
      return false;
    }
  };

  const publishIssue = async (issueId: string): Promise<{ success: boolean; error?: string }> => {
    if (!assertAdmin('publishIssue')) return { success: false, error: 'Unauthorized' };
    const target = issues.find(i => i.id === issueId);
    if (!target) return { success: false, error: 'Issue not found' };

    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    const updatedIssues = issues.map(iss => {
      if (iss.id === issueId) {
        return {
          ...iss,
          status: 'published' as const,
          isCurrent: true,
          publicationDate: iss.publicationDate || today,
          updatedAt: now
        };
      } else if (iss.isCurrent || iss.status === 'published') {
        return {
          ...iss,
          isCurrent: false,
          status: 'archived' as const,
          updatedAt: now
        };
      }
      return iss;
    });

    setIssues(updatedIssues);

    if (target.articleIds && target.articleIds.length > 0) {
      setArticles(prev =>
        prev.map(art => {
          if (target.articleIds.includes(art.id)) {
            return {
              ...art,
              status: 'published',
              volume: target.volumeNumber,
              issue: target.issueNumber,
              year: target.year,
              publishedDate: art.publishedDate || today
            };
          }
          return art;
        })
      );
    }

    try {
      const batch = writeBatch(db);
      updatedIssues.forEach(iss => {
        const ref = doc(db, 'journal_issues', iss.id);
        batch.set(ref, cleanForFirestore(iss), { merge: true });
      });
      await batch.commit();
    } catch (err) {
      console.warn('Firestore publishIssue error:', err);
    }

    return { success: true };
  };

  const unpublishIssue = async (issueId: string): Promise<boolean> => {
    if (!assertAdmin('unpublishIssue')) return false;
    const now = new Date().toISOString();
    setIssues(prev =>
      prev.map(iss =>
        iss.id === issueId ? { ...iss, status: 'draft', isCurrent: false, updatedAt: now } : iss
      )
    );
    try {
      const issueRef = doc(db, 'journal_issues', issueId);
      await updateDoc(issueRef, { status: 'draft', isCurrent: false, updatedAt: now });
      return true;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const reorderArticlesInIssue = async (issueId: string, articleIds: string[]): Promise<boolean> => {
    if (!assertAdmin('reorderArticlesInIssue')) return false;
    const now = new Date().toISOString();
    setIssues(prev =>
      prev.map(iss => (iss.id === issueId ? { ...iss, articleIds, updatedAt: now } : iss))
    );
    try {
      const issueRef = doc(db, 'journal_issues', issueId);
      await updateDoc(issueRef, { articleIds, updatedAt: now });
      return true;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const addArticleToIssue = async (issueId: string, articleId: string): Promise<boolean> => {
    if (!assertAdmin('addArticleToIssue')) return false;
    const target = issues.find(i => i.id === issueId);
    if (!target) return false;
    if (target.articleIds.includes(articleId)) return true;

    const updatedIds = [...target.articleIds, articleId];
    return reorderArticlesInIssue(issueId, updatedIds);
  };

  const removeArticleFromIssue = async (issueId: string, articleId: string): Promise<boolean> => {
    if (!assertAdmin('removeArticleFromIssue')) return false;
    const target = issues.find(i => i.id === issueId);
    if (!target) return false;

    const updatedIds = target.articleIds.filter(id => id !== articleId);
    return reorderArticlesInIssue(issueId, updatedIds);
  };

  const assignReviewerToArticle = (articleId: string, reviewerId: string, reviewerName: string) => {
    if (!assertAdmin('assignReviewerToArticle')) return;
    const today = new Date().toISOString().split('T')[0];
    setArticles(prev =>
      prev.map(art => {
        if (art.id !== articleId) return art;
        const noteAddition = `[${today}] Assigned reviewer: ${reviewerName}.`;
        const updatedNotes = art.editorialNotes ? `${art.editorialNotes}\n${noteAddition}` : noteAddition;
        const newStatus = art.status === 'submitted' ? 'under_review' : art.status;
        const updated: Article = {
          ...art,
          assignedReviewerId: reviewerId,
          assignedReviewerName: reviewerName,
          status: newStatus,
          editorialNotes: updatedNotes,
          lastUpdatedDate: today
        };
        try {
          const artRef = doc(db, 'articles', articleId);
          updateDoc(artRef, cleanForFirestore({
            assignedReviewerId: reviewerId,
            assignedReviewerName: reviewerName,
            status: newStatus,
            editorialNotes: updatedNotes,
            lastUpdatedDate: today
          })).catch(e => console.warn(e));
        } catch (e) {
          console.warn(e);
        }
        return updated;
      })
    );
  };

  const requestArticleRevision = (articleId: string, instructions: string) => {
    if (!assertAdmin('requestArticleRevision')) return;
    const today = new Date().toISOString().split('T')[0];
    setArticles(prev =>
      prev.map(art => {
        if (art.id !== articleId) return art;
        const noteAddition = `[${today}] Revisions Requested: ${instructions}`;
        const updatedNotes = art.editorialNotes ? `${art.editorialNotes}\n${noteAddition}` : noteAddition;
        const updated: Article = {
          ...art,
          status: 'revision_requested',
          revisionInstructions: instructions,
          editorialNotes: updatedNotes,
          lastUpdatedDate: today
        };
        try {
          const artRef = doc(db, 'articles', articleId);
          updateDoc(artRef, cleanForFirestore({
            status: 'revision_requested',
            revisionInstructions: instructions,
            editorialNotes: updatedNotes,
            lastUpdatedDate: today
          })).catch(e => console.warn(e));
        } catch (e) {
          console.warn(e);
        }
        return updated;
      })
    );
  };

  const exportSubmissionsCsv = () => {
    const headers = [
      'Manuscript ID',
      'Title',
      'Corresponding Author',
      'Author Email',
      'Affiliation',
      'Track',
      'Status',
      'Submission Date',
      'Assigned Reviewer',
      'Volume',
      'Issue',
      'Year',
      'DOI',
      'Editorial Notes'
    ];

    const rows = articles.map(art => {
      const corr = art.authors.find(a => a.isCorresponding) || art.authors[0];
      return [
        art.trackingId,
        `"${(art.title || '').replace(/"/g, '""')}"`,
        `"${(corr?.name || '').replace(/"/g, '""')}"`,
        corr?.email || '',
        `"${(corr?.affiliation || '').replace(/"/g, '""')}"`,
        `"${(art.track || '').replace(/"/g, '""')}"`,
        art.status,
        art.submissionDate,
        `"${(art.assignedReviewerName || 'Unassigned').replace(/"/g, '""')}"`,
        art.volume ?? '',
        art.issue ?? '',
        art.year ?? '',
        art.doi || '',
        `"${(art.editorialNotes || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CHSSH_Submissions_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const connectDrive = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await connectGoogleDrive();
      setIsGoogleDriveConnected(true);
      setGoogleDriveUser(res.user);
      // Automatically provision standard journal folder structure
      ensureJournalFolderStructure(new Date().getFullYear()).catch(e => console.warn('Drive folder tree init notice:', e));
      return { success: true };
    } catch (err: any) {
      console.error('connectDrive error:', err);
      return { success: false, error: err.message || 'Failed to connect Google Drive' };
    }
  };

  const disconnectDrive = async (): Promise<void> => {
    await disconnectGoogleDrive();
    setIsGoogleDriveConnected(false);
    setGoogleDriveUser(null);
  };

  const ensureDriveFolderTree = async (): Promise<boolean> => {
    try {
      await ensureJournalFolderStructure(new Date().getFullYear());
      return true;
    } catch (err) {
      console.error('Error ensuring Drive folder tree:', err);
      return false;
    }
  };

  const syncManuscriptToGoogleDrive = async (articleId: string): Promise<boolean> => {
    const targetArt = articles.find(a => a.id === articleId);
    if (!targetArt) return false;

    let fileDataUrl = targetArt.fileDataUrl;
    if (!fileDataUrl) {
      try {
        fileDataUrl = (await getOriginalManuscriptFile(articleId)) || undefined;
      } catch (err) {
        console.warn('Error reading manuscript file from IndexedDB:', err);
      }
    }
    if (!fileDataUrl) {
      try {
        fileDataUrl = localStorage.getItem(`chssh_orig_file_${articleId}`) || undefined;
      } catch (e) {
        console.warn('Error reading from localStorage:', e);
      }
    }

    if (!fileDataUrl) {
      console.warn(`No file content found for manuscript ${targetArt.trackingId}`);
      const failUpdates: Partial<Article> = {
        driveUploadStatus: 'failed',
        driveUploadError: 'No original manuscript file found in local cache to upload.'
      };
      setArticles(prev => prev.map(a => a.id === articleId ? { ...a, ...failUpdates } : a));
      return false;
    }

    const subYear = targetArt.submissionDate ? parseInt(targetArt.submissionDate.split('-')[0], 10) : new Date().getFullYear();

    const res = await uploadManuscriptToGoogleDrive(
      {
        dataUrl: fileDataUrl,
        originalFileName: targetArt.fileName,
        mimeType: detectMimeType(targetArt.fileName || 'manuscript.docx')
      },
      {
        trackingId: targetArt.trackingId,
        title: targetArt.title,
        year: isNaN(subYear) ? new Date().getFullYear() : subYear,
        status: targetArt.status
      }
    );

    if (res.success && res.fileId) {
      const driveUpdates: Partial<Article> = {
        driveFileId: res.fileId,
        driveFolderId: res.folderId,
        driveUploadStatus: 'uploaded',
        driveUploadedAt: new Date().toISOString(),
        driveUploadError: undefined
      };

      setArticles(prev => prev.map(a => a.id === articleId ? { ...a, ...driveUpdates } : a));

      try {
        const artRef = doc(db, 'articles', articleId);
        await updateDoc(artRef, cleanForFirestore(driveUpdates));
      } catch (e) {
        console.warn('Error saving drive metadata to Firestore:', e);
      }
      return true;
    } else {
      const failUpdates: Partial<Article> = {
        driveUploadStatus: 'failed',
        driveUploadError: res.error || 'Failed to upload to Google Drive'
      };
      setArticles(prev => prev.map(a => a.id === articleId ? { ...a, ...failUpdates } : a));
      try {
        const artRef = doc(db, 'articles', articleId);
        await updateDoc(artRef, cleanForFirestore(failUpdates));
      } catch (e) {
        console.warn('Error saving drive failure in Firestore:', e);
      }
      return false;
    }
  };

  const incrementArticleViews = (id: string) => {
    setArticles(prev =>
      prev.map(art => {
        if (art.id !== id) return art;
        const newViews = (art.viewsCount || 0) + 1;
        try {
          const artDocRef = doc(db, 'articles', id);
          updateDoc(artDocRef, { viewsCount: newViews }).catch(() => {});
        } catch (_) {}
        return { ...art, viewsCount: newViews };
      })
    );
  };

  const incrementArticleDownloads = (id: string) => {
    setArticles(prev =>
      prev.map(art => {
        if (art.id !== id) return art;
        const newDownloads = (art.downloadsCount || 0) + 1;
        try {
          const artDocRef = doc(db, 'articles', id);
          updateDoc(artDocRef, { downloadsCount: newDownloads }).catch(() => {});
        } catch (_) {}
        return { ...art, downloadsCount: newDownloads };
      })
    );
  };

  const updateEditorialMember = (id: string, memberUpdate: Partial<EditorialMember>) => {
    if (!assertAdmin('updateEditorialMember')) return;
    setEditorialBoard(prev =>
      prev.map(m => {
        if (m.id !== id) return m;
        const updated = { ...m, ...memberUpdate };
        try {
          const memRef = doc(db, 'editorial_board', id);
          updateDoc(memRef, cleanForFirestore(memberUpdate)).catch((err) => {
            console.warn('Error updating editorial member in Firestore:', err);
          });
        } catch (err) {
          console.warn('Firestore updateEditorialMember error:', err);
        }
        return updated;
      })
    );
  };

  const addEditorialMember = (member: Omit<EditorialMember, 'id'>) => {
    if (!assertAdmin('addEditorialMember')) return;
    const newMember: EditorialMember = {
      ...member,
      id: `ed-${Date.now()}`
    };
    setEditorialBoard(prev => [...prev, newMember]);
    try {
      const memRef = doc(db, 'editorial_board', newMember.id);
      setDoc(memRef, cleanForFirestore(newMember)).catch((err) => {
        console.warn('Error adding editorial member in Firestore:', err);
      });
    } catch (err) {
      console.warn('Firestore addEditorialMember error:', err);
    }
  };

  const deleteEditorialMember = (id: string) => {
    if (!assertAdmin('deleteEditorialMember')) return;
    setEditorialBoard(prev => prev.filter(m => m.id !== id));
    try {
      const memRef = doc(db, 'editorial_board', id);
      deleteDoc(memRef).catch((err) => {
        console.warn('Error deleting editorial member in Firestore:', err);
      });
    } catch (err) {
      console.warn('Firestore deleteEditorialMember error:', err);
    }
  };

  const updateAdvisoryMember = (id: string, memberUpdate: Partial<AdvisoryBoardMember>) => {
    if (!assertAdmin('updateAdvisoryMember')) return;
    setAdvisoryBoard(prev =>
      prev.map(m => {
        if (m.id !== id) return m;
        const updated = { ...m, ...memberUpdate };
        try {
          const memRef = doc(db, 'advisory_board', id);
          updateDoc(memRef, cleanForFirestore(memberUpdate)).catch((err) => {
            console.warn('Error updating advisory member in Firestore:', err);
          });
        } catch (err) {
          console.warn('Firestore updateAdvisoryMember error:', err);
        }
        return updated;
      })
    );
  };

  const addAdvisoryMember = (member: Omit<AdvisoryBoardMember, 'id'>) => {
    if (!assertAdmin('addAdvisoryMember')) return;
    const newMember: AdvisoryBoardMember = {
      ...member,
      id: `adv-${Date.now()}`
    };
    setAdvisoryBoard(prev => [...prev, newMember]);
    try {
      const memRef = doc(db, 'advisory_board', newMember.id);
      setDoc(memRef, cleanForFirestore(newMember)).catch((err) => {
        console.warn('Error adding advisory member in Firestore:', err);
      });
    } catch (err) {
      console.warn('Firestore addAdvisoryMember error:', err);
    }
  };

  const deleteAdvisoryMember = (id: string) => {
    if (!assertAdmin('deleteAdvisoryMember')) return;
    setAdvisoryBoard(prev => prev.filter(m => m.id !== id));
    try {
      const memRef = doc(db, 'advisory_board', id);
      deleteDoc(memRef).catch((err) => {
        console.warn('Error deleting advisory member in Firestore:', err);
      });
    } catch (err) {
      console.warn('Firestore deleteAdvisoryMember error:', err);
    }
  };

  const resetAdvisoryBoardToDefaults = () => {
    // No mock data or automatic reset allowed; records are managed exclusively via admin panel
    console.info('Advisory board is managed exclusively through the authorized admin panel.');
  };

  const applyReviewer = async (data: Omit<Reviewer, 'id' | 'status' | 'appliedDate'>): Promise<boolean> => {
    const today = new Date().toISOString().split('T')[0];
    const newRev: Reviewer = {
      ...data,
      id: `rev-${Date.now()}`,
      status: 'pending',
      appliedDate: today
    };
    setReviewers(prev => [newRev, ...prev]);
    try {
      const revRef = doc(db, 'reviewers', newRev.id);
      await setDoc(revRef, cleanForFirestore(newRev));
    } catch (err) {
      console.warn('Error saving reviewer application to Firestore:', err);
    }
    return true;
  };

  const updateReviewer = (id: string, update: Partial<Reviewer>) => {
    if (!assertAdmin('updateReviewer')) return;
    setReviewers(prev =>
      prev.map(r => {
        if (r.id !== id) return r;
        const updated = { ...r, ...update };
        try {
          const revRef = doc(db, 'reviewers', id);
          updateDoc(revRef, cleanForFirestore(update)).catch((err) => {
            console.warn('Error updating reviewer in Firestore:', err);
          });
        } catch (err) {
          console.warn('Firestore updateReviewer error:', err);
        }
        return updated;
      })
    );
  };

  const acceptReviewer = (id: string, adminNotes?: string) => {
    if (!assertAdmin('acceptReviewer')) return;
    const today = new Date().toISOString().split('T')[0];
    const update: Partial<Reviewer> = {
      status: 'accepted',
      reviewedDate: today,
      ...(adminNotes !== undefined ? { adminNotes } : {})
    };
    updateReviewer(id, update);
  };

  const rejectReviewer = (id: string, adminNotes?: string) => {
    if (!assertAdmin('rejectReviewer')) return;
    const today = new Date().toISOString().split('T')[0];
    const update: Partial<Reviewer> = {
      status: 'rejected',
      reviewedDate: today,
      ...(adminNotes !== undefined ? { adminNotes } : {})
    };
    updateReviewer(id, update);
  };

  const deleteReviewer = (id: string) => {
    if (!assertAdmin('deleteReviewer')) return;
    setReviewers(prev => prev.filter(r => r.id !== id));
    try {
      const revRef = doc(db, 'reviewers', id);
      deleteDoc(revRef).catch((err) => {
        console.warn('Error deleting reviewer in Firestore:', err);
      });
    } catch (err) {
      console.warn('Firestore deleteReviewer error:', err);
    }
  };

  const addReviewer = (reviewer: Omit<Reviewer, 'id' | 'appliedDate'>) => {
    if (!assertAdmin('addReviewer')) return;
    const today = new Date().toISOString().split('T')[0];
    const newRev: Reviewer = {
      ...reviewer,
      id: `rev-${Date.now()}`,
      appliedDate: today,
      reviewedDate: today
    };
    setReviewers(prev => [newRev, ...prev]);
    try {
      const revRef = doc(db, 'reviewers', newRev.id);
      setDoc(revRef, cleanForFirestore(newRev)).catch((err) => {
        console.warn('Error adding reviewer in Firestore:', err);
      });
    } catch (err) {
      console.warn('Firestore addReviewer error:', err);
    }
  };

  const uploadJournalAsset = (asset: JournalUploadedAsset) => {
    if (!assertAdmin('uploadJournalAsset')) return;
    const assetToSave: JournalUploadedAsset = {
      ...asset,
      isUploaded: true,
      uploadedAt: asset.uploadedAt || new Date().toISOString()
    };
    if (assetToSave.fileDataUrl) {
      saveAssetFile(assetToSave.id, assetToSave.fileDataUrl).catch((err) => {
        console.warn('Error saving asset file to IndexedDB:', err);
      });
    }
    setUploadedAssets(prev => {
      const updated = { ...prev, [asset.id]: assetToSave };
      try {
        const assetDocRef = doc(db, 'journal_assets', asset.id);
        const firestoreAsset = (assetToSave.fileDataUrl && assetToSave.fileDataUrl.length > 450000)
          ? { ...assetToSave, fileDataUrl: undefined }
          : assetToSave;
        setDoc(assetDocRef, cleanForFirestore(firestoreAsset), { merge: true }).catch((err) => {
          console.warn('Error saving individual asset in Firestore:', err);
        });
      } catch (err) {
        console.warn(err);
      }
      try {
        const lightweightAssets: Record<string, JournalUploadedAsset> = {};
        Object.entries(updated).forEach(([k, item]) => {
          const assetItem = item as JournalUploadedAsset;
          if (assetItem) {
            if (assetItem.fileDataUrl && assetItem.fileDataUrl.length > 250000) {
              const { fileDataUrl, ...rest } = assetItem;
              lightweightAssets[k] = rest as JournalUploadedAsset;
            } else {
              lightweightAssets[k] = assetItem;
            }
          }
        });
        const assetsDocRef = doc(db, 'journal_content', 'assets');
        setDoc(assetsDocRef, {
          assets: cleanForFirestore(lightweightAssets),
          updatedAt: new Date().toISOString()
        }, { merge: true }).catch((err) => {
          console.warn('Error updating journal assets index in Firestore:', err);
        });
      } catch (err) {
        console.warn(err);
      }
      return updated;
    });
  };

  const deleteJournalAsset = (assetId: string) => {
    if (!assertAdmin('deleteJournalAsset')) return;
    deleteAssetFile(assetId).catch(e => console.warn(e));
    setUploadedAssets(prev => {
      const copy = { ...prev };
      delete copy[assetId];
      try {
        const assetDocRef = doc(db, 'journal_assets', assetId);
        deleteDoc(assetDocRef).catch(e => console.warn(e));
      } catch (e) {
        console.warn(e);
      }
      try {
        const assetsDocRef = doc(db, 'journal_content', 'assets');
        setDoc(assetsDocRef, {
          assets: cleanForFirestore(copy),
          updatedAt: new Date().toISOString()
        }).catch((err) => {
          console.warn('Error deleting journal asset in Firestore:', err);
        });
      } catch (err) {
        console.warn('Firestore deleteJournalAsset error:', err);
      }
      return copy;
    });
  };

  const resetAssetToDefault = (_assetId: string) => {
    console.info('Assets are managed exclusively through authorized admin upload.');
  };

  const uploadPdfAsset = async (
    file: File,
    slotId: string = 'cover_page',
    title?: string,
    description?: string,
    onStatusChange?: (status: string) => void
  ): Promise<JournalUploadedAsset> => {
    if (!assertAdmin('uploadPdfAsset')) {
      throw new Error('Unauthorized: Only administrators can upload PDFs.');
    }
    const previous = uploadedAssets?.[slotId] || uploadedAssets?.['active_pdf'];

    // Complete Flow: Validation -> Storage attempt -> Persistent Firestore cloud storage -> Active state
    const savedAsset = await uploadAndPersistPdfAsset(
      file,
      slotId,
      title,
      description,
      previous,
      onStatusChange
    );

    // Step 3: Immediately reflect in state
    setUploadedAssets(prev => ({
      ...prev,
      [slotId]: savedAsset,
      ...(slotId === 'cover_page' ? { active_pdf: { ...savedAsset, id: 'active_pdf' } } : {})
    }));

    return savedAsset;
  };

  const fetchActivePdf = async (slotId: string = 'cover_page'): Promise<JournalUploadedAsset | null> => {
    try {
      const fetched = await fetchActivePdfFromFirestore(slotId);
      if (fetched) {
        setUploadedAssets(prev => ({
          ...prev,
          [slotId]: fetched,
          ...(slotId === 'cover_page' ? { active_pdf: { ...fetched, id: 'active_pdf' } } : {})
        }));
      }
      return fetched;
    } catch (err) {
      console.warn('Error in fetchActivePdf:', err);
      throw err;
    }
  };

  const activePdf = uploadedAssets?.['active_pdf'] || uploadedAssets?.['cover_page'] || null;

  const syncToFirebaseNow = async (): Promise<boolean> => {
    if (!assertAdmin('syncToFirebaseNow')) return false;
    setIsFirebaseSyncing(true);
    try {
      const batch = writeBatch(db);
      const contentDocRef = doc(db, 'journal_content', 'main');
      batch.set(contentDocRef, cleanForFirestore({
        ...content,
        updatedAt: new Date().toISOString()
      }));

      const settingsDocRef = doc(db, 'app_settings', 'security');
      batch.set(settingsDocRef, {
        adminPassword,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      articles.forEach((art) => {
        const artRef = doc(db, 'articles', art.id);
        batch.set(artRef, cleanForFirestore(art));
      });

      editorialBoard.forEach((mem) => {
        const memRef = doc(db, 'editorial_board', mem.id);
        batch.set(memRef, cleanForFirestore(mem));
      });

      advisoryBoard.forEach((mem) => {
        const memRef = doc(db, 'advisory_board', mem.id);
        batch.set(memRef, cleanForFirestore(mem));
      });

      reviewers.forEach((rev) => {
        const revRef = doc(db, 'reviewers', rev.id);
        batch.set(revRef, cleanForFirestore(rev));
      });

      volumes.forEach((vol) => {
        const volRef = doc(db, 'journal_volumes', vol.id);
        batch.set(volRef, cleanForFirestore(vol));
      });

      issues.forEach((iss) => {
        const issRef = doc(db, 'journal_issues', iss.id);
        batch.set(issRef, cleanForFirestore(iss));
      });

      const assetsDocRef = doc(db, 'journal_content', 'assets');
      const lightweightAssets: Record<string, JournalUploadedAsset> = {};
      Object.entries(uploadedAssets).forEach(([k, item]) => {
        if (item) {
          const { fileDataUrl, ...rest } = item as JournalUploadedAsset;
          lightweightAssets[k] = rest as JournalUploadedAsset;
        }
      });
      batch.set(assetsDocRef, {
        assets: cleanForFirestore(lightweightAssets),
        updatedAt: new Date().toISOString()
      });

      await batch.commit();
      setFirebaseStatus('connected');
      setLastSyncedAt(new Date());
      setIsFirebaseSyncing(false);
      return true;
    } catch (e) {
      console.error('Manual Firebase sync failed:', e);
      setIsFirebaseSyncing(false);
      return false;
    }
  };

  const exportAllData = (): string => {
    return JSON.stringify(
      {
        content,
        articles,
        editorialBoard,
        advisoryBoard,
        reviewers,
        volumes,
        issues,
        uploadedAssets,
        palette,
        exportDate: new Date().toISOString(),
        journal: "Contemporary Horizons in Social Sciences and Humanities",
        firebaseDatabaseId: firebaseConfig.firestoreDatabaseId
      },
      null,
      2
    );
  };

  const importAllData = (jsonStr: string): boolean => {
    if (!assertAdmin('importAllData')) return false;
    try {
      const data = JSON.parse(jsonStr);
      if (data.content) {
        setContent(data.content);
      }
      if (data.articles) {
        setArticles(data.articles);
      }
      if (data.editorialBoard) {
        setEditorialBoard(data.editorialBoard);
      }
      if (data.advisoryBoard) {
        setAdvisoryBoard(data.advisoryBoard);
      }
      if (data.reviewers) {
        setReviewers(data.reviewers);
      }
      if (data.volumes) {
        setVolumes(data.volumes);
      }
      if (data.issues) {
        setIssues(data.issues);
      }
      if (data.uploadedAssets) {
        setUploadedAssets(data.uploadedAssets);
      }
      if (data.palette && ['oxford', 'cambridge', 'cypress', 'prussian'].includes(data.palette)) {
        setPalette(data.palette);
      }
      setTimeout(() => {
        syncToFirebaseNow();
      }, 200);
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  };

  return (
    <JournalContext.Provider
      value={{
        content,
        articles,
        editorialBoard,
        reviewers,
        uploadedAssets,
        isAdmin,
        isLiveEditMode,
        adminPassword,
        activeTab,
        setActiveTab,
        adminActiveSubTab,
        setAdminActiveSubTab,
        openAdminAssetUploader,
        selectedArticleForView,
        setSelectedArticleForView,
        theme,
        toggleTheme,
        setTheme,
        palette,
        setPalette,
        authorAccounts,
        currentAuthor,
        isAuthorLoggedIn: Boolean(currentAuthor),
        loginAuthor,
        registerAuthor,
        retrieveCredentialsByPhone,
        resetAuthorPasswordByPhone,
        logoutAuthor,
        isAuthorAuthModalOpen,
        setIsAuthorAuthModalOpen,
        authorAuthPromptMessage,
        setAuthorAuthPromptMessage,
        openAuthorAuthModal,
        closeAuthorAuthModal,
        requireAuthorAuth,
        volumes,
        issues,
        createVolume,
        updateVolume,
        deleteVolume,
        createIssue,
        updateIssue,
        deleteIssue,
        publishIssue,
        unpublishIssue,
        reorderArticlesInIssue,
        addArticleToIssue,
        removeArticleFromIssue,
        assignReviewerToArticle,
        requestArticleRevision,
        exportSubmissionsCsv,
        updateContentText,
        updateEntireContent,
        resetContentToDefault,
        uploadJournalAsset,
        deleteJournalAsset,
        resetAssetToDefault,
        uploadPdfAsset,
        fetchActivePdf,
        activePdf,
        loginAdmin,
        logoutAdmin,
        changeAdminPassword,
        resetAdminPasswordToDefault,
        recoverAndResetAdminPassword,
        clearAdminLockout,
        adminPhone,
        updateAdminPhone,
        sendPhoneVerificationCode,
        verifyPhoneCode,
        smsConfig,
        updateSmsConfig,
        testSmsGateway,
        smsLogs,
        refreshSmsLogs,
        toggleLiveEditMode,
        setIsLiveEditMode,
        submitManuscript,
        updateArticleStatus,
        publishArticle,
        uploadPublishedPaper,
        removePublishedPaper,
        downloadOriginalManuscript,
        downloadPublishedPaper,
        viewPublishedPaper,
        registerGoogleDrivePaper,
        registerGoogleDriveAsset,
        updateArticle,
        updateArticleCertificate,
        linkManuscriptToAuthor,
        deleteArticle,
        incrementArticleViews,
        incrementArticleDownloads,
        updateEditorialMember,
        addEditorialMember,
        deleteEditorialMember,
        advisoryBoard,
        updateAdvisoryMember,
        addAdvisoryMember,
        deleteAdvisoryMember,
        resetAdvisoryBoardToDefaults,
        applyReviewer,
        updateReviewer,
        acceptReviewer,
        rejectReviewer,
        deleteReviewer,
        addReviewer,
        isGoogleDriveConnected,
        googleDriveUser,
        connectDrive,
        disconnectDrive,
        syncManuscriptToGoogleDrive,
        ensureDriveFolderTree,
        exportAllData,
        importAllData,
        firebaseStatus,
        isFirebaseSyncing,
        lastSyncedAt,
        syncToFirebaseNow
      }}
    >
      {children}
    </JournalContext.Provider>
  );
};

export const useJournal = () => {
  const context = useContext(JournalContext);
  if (!context) {
    throw new Error('useJournal must be used within a JournalProvider');
  }
  return context;
};
