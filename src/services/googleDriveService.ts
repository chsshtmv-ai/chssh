import { auth } from '../lib/firebase';
import {
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User
} from 'firebase/auth';

// Google Drive Scopes
export const DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file'
];

const provider = new GoogleAuthProvider();
DRIVE_SCOPES.forEach(scope => provider.addScope(scope));
provider.setCustomParameters({
  login_hint: 'chsshtmv@gmail.com',
  prompt: 'consent'
});

// In-memory access token cache
let cachedAccessToken: string | null = null;
let isSigningIn = false;
let currentDriveUser: User | null = null;

// Folder ID Cache to minimize API roundtrips
const folderIdCache: Record<string, string> = {};

export interface DriveUploadResult {
  success: boolean;
  fileId?: string;
  folderId?: string;
  webViewLink?: string;
  webContentLink?: string;
  error?: string;
}

export interface DriveFolderInfo {
  id: string;
  name: string;
  webViewLink?: string;
}

/**
 * Initialize Drive Auth listener
 */
export const initDriveAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      currentDriveUser = user;
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Attempt silent re-authentication or notify token needed
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      currentDriveUser = null;
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Connect to Google Drive with chsshtmv@gmail.com
 */
export const connectGoogleDrive = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Could not retrieve Google Drive access token from sign-in.');
    }

    cachedAccessToken = credential.accessToken;
    currentDriveUser = result.user;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Drive sign-in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Disconnect Google Drive
 */
export const disconnectGoogleDrive = async () => {
  try {
    cachedAccessToken = null;
    currentDriveUser = null;
    Object.keys(folderIdCache).forEach(k => delete folderIdCache[k]);
  } catch (err) {
    console.warn('Error disconnecting Google Drive:', err);
  }
};

export const getDriveAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const getDriveUser = (): User | null => {
  return currentDriveUser;
};

export const isDriveConnected = (): boolean => {
  return Boolean(cachedAccessToken);
};

/**
 * Helper to execute authorized Google Drive API call
 */
const driveFetch = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  if (!cachedAccessToken) {
    throw new Error('Google Drive is not connected. Please connect with chsshtmv@gmail.com.');
  }

  const res = await fetch(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${cachedAccessToken}`
    }
  });

  if (!res.ok) {
    const errorBody = await res.text();
    let parsed: any;
    try {
      parsed = JSON.parse(errorBody);
    } catch {
      parsed = { error: { message: errorBody } };
    }
    const message = parsed?.error?.message || `Google Drive API error (${res.status})`;
    throw new Error(message);
  }

  return res.json();
};

/**
 * Find or create a folder by name inside a parent folder
 */
export const findOrCreateFolder = async (
  folderName: string,
  parentFolderId?: string
): Promise<DriveFolderInfo> => {
  const cacheKey = `${parentFolderId || 'root'}:${folderName}`;
  if (folderIdCache[cacheKey]) {
    return { id: folderIdCache[cacheKey], name: folderName };
  }

  // Search for folder
  let query = `name = '${folderName.replace(/'/g, "\\'")}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  if (parentFolderId) {
    query += ` and '${parentFolderId}' in parents`;
  } else {
    query += ` and 'root' in parents`;
  }

  const searchRes = await driveFetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,webViewLink)&pageSize=1`
  );

  if (searchRes.files && searchRes.files.length > 0) {
    const folder = searchRes.files[0];
    folderIdCache[cacheKey] = folder.id;
    return folder;
  }

  // Create folder
  const meta: any = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder'
  };
  if (parentFolderId) {
    meta.parents = [parentFolderId];
  }

  const createRes = await driveFetch('https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(meta)
  });

  folderIdCache[cacheKey] = createRes.id;
  return createRes;
};

/**
 * Status mapping to Google Drive folder names
 */
export const getStatusFolderName = (status: string): string => {
  switch (status) {
    case 'submitted':
      return 'New Submissions';
    case 'under_review':
      return 'Under Review';
    case 'revision_requested':
      return 'Revision Required';
    case 'accepted':
      return 'Accepted';
    case 'rejected':
      return 'Rejected';
    case 'published':
      return 'Published';
    default:
      return 'New Submissions';
  }
};

/**
 * Ensures the full CHSSH Journal folder hierarchy exists in Google Drive
 */
export const ensureJournalFolderStructure = async (year: number = new Date().getFullYear()): Promise<{
  rootFolder: DriveFolderInfo;
  manuscriptsFolder: DriveFolderInfo;
  yearFolder: DriveFolderInfo;
  statusFolder: DriveFolderInfo;
}> => {
  // 1. Root folder: CHSSH Journal
  const rootFolder = await findOrCreateFolder('CHSSH Journal');

  // 2. Primary Subfolders
  const manuscriptsFolder = await findOrCreateFolder('Manuscripts', rootFolder.id);
  await findOrCreateFolder('Published Issues', rootFolder.id);
  await findOrCreateFolder('Editorial Documents', rootFolder.id);
  await findOrCreateFolder('Reviewer Reports', rootFolder.id);
  await findOrCreateFolder('Certificates', rootFolder.id);

  // 3. Year Subfolder: Manuscripts / 2026
  const yearFolder = await findOrCreateFolder(String(year), manuscriptsFolder.id);

  // 4. Status Subfolders inside Year
  const statusFolders = [
    'New Submissions',
    'Under Review',
    'Revision Required',
    'Accepted',
    'Rejected',
    'Published'
  ];

  for (const sName of statusFolders) {
    await findOrCreateFolder(sName, yearFolder.id);
  }

  const defaultStatusFolder = await findOrCreateFolder('New Submissions', yearFolder.id);

  return {
    rootFolder,
    manuscriptsFolder,
    yearFolder,
    statusFolder: defaultStatusFolder
  };
};

/**
 * Standardize manuscript filename: e.g. CHSSH-2026-0001_ManuscriptTitle.docx
 */
export const generateStandardizedDriveFileName = (
  trackingId: string,
  title: string,
  originalFileName: string = 'manuscript.docx'
): string => {
  const extension = originalFileName.includes('.')
    ? originalFileName.slice(originalFileName.lastIndexOf('.'))
    : '.docx';

  const cleanTitle = title
    .replace(/[^a-zA-Z0-9\s-_]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .slice(0, 50);

  return `${trackingId}_${cleanTitle}${extension}`;
};

/**
 * Upload manuscript file to designated Google Drive folder
 */
export const uploadManuscriptToGoogleDrive = async (
  fileData: {
    file?: File | Blob;
    dataUrl?: string;
    originalFileName?: string;
    mimeType?: string;
  },
  manuscriptMeta: {
    trackingId: string;
    title: string;
    year: number;
    status: string;
  }
): Promise<DriveUploadResult> => {
  if (!cachedAccessToken) {
    return {
      success: false,
      error: 'Google Drive is not connected. Sign in with chsshtmv@gmail.com in the Admin panel to sync to Google Drive.'
    };
  }

  try {
    // 1. Ensure folder structure exists
    const root = await findOrCreateFolder('CHSSH Journal');
    const manuscripts = await findOrCreateFolder('Manuscripts', root.id);
    const yearFolder = await findOrCreateFolder(String(manuscriptMeta.year || new Date().getFullYear()), manuscripts.id);
    const targetStatusFolderName = getStatusFolderName(manuscriptMeta.status);
    const targetFolder = await findOrCreateFolder(targetStatusFolderName, yearFolder.id);

    // 2. Prepare file blob & standardized filename
    let blob: Blob;
    let mime = fileData.mimeType || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    if (fileData.file) {
      blob = fileData.file;
      mime = fileData.file.type || mime;
    } else if (fileData.dataUrl) {
      const arr = fileData.dataUrl.split(',');
      const match = arr[0].match(/:(.*?);/);
      mime = match ? match[1] : mime;
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      blob = new Blob([u8arr], { type: mime });
    } else {
      throw new Error('No file data provided for Google Drive upload.');
    }

    const standardizedName = generateStandardizedDriveFileName(
      manuscriptMeta.trackingId,
      manuscriptMeta.title,
      fileData.originalFileName || 'manuscript.docx'
    );

    // 3. Prepare Multipart Request
    const metadata = {
      name: standardizedName,
      parents: [targetFolder.id],
      description: `CHSSH Manuscript ${manuscriptMeta.trackingId} — ${manuscriptMeta.title}`,
      properties: {
        trackingId: manuscriptMeta.trackingId,
        journal: 'CHSSH'
      }
    };

    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const metadataPart = delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata);

    const fileReader = new FileReader();
    const arrayBufferPromise = new Promise<ArrayBuffer>((resolve, reject) => {
      fileReader.onload = () => resolve(fileReader.result as ArrayBuffer);
      fileReader.onerror = reject;
      fileReader.readAsArrayBuffer(blob);
    });

    const fileBuffer = await arrayBufferPromise;

    const mediaHeader = delimiter +
      `Content-Type: ${mime}\r\n` +
      'Content-Transfer-Encoding: binary\r\n\r\n';

    const enc = new TextEncoder();
    const metaBytes = enc.encode(metadataPart);
    const mediaHeaderBytes = enc.encode(mediaHeader);
    const closeBytes = enc.encode(closeDelimiter);

    const totalLength = metaBytes.byteLength + mediaHeaderBytes.byteLength + fileBuffer.byteLength + closeBytes.byteLength;
    const body = new Uint8Array(totalLength);

    body.set(metaBytes, 0);
    body.set(mediaHeaderBytes, metaBytes.byteLength);
    body.set(new Uint8Array(fileBuffer), metaBytes.byteLength + mediaHeaderBytes.byteLength);
    body.set(closeBytes, metaBytes.byteLength + mediaHeaderBytes.byteLength + fileBuffer.byteLength);

    const uploadRes = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${cachedAccessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`
        },
        body
      }
    );

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      throw new Error(`Google Drive upload failed (${uploadRes.status}): ${errText}`);
    }

    const uploaded = await uploadRes.json();

    return {
      success: true,
      fileId: uploaded.id,
      folderId: targetFolder.id,
      webViewLink: uploaded.webViewLink,
      webContentLink: uploaded.webContentLink
    };
  } catch (error: any) {
    console.error('Google Drive upload error:', error);
    return {
      success: false,
      error: error.message || 'Failed to upload manuscript to Google Drive.'
    };
  }
};

/**
 * Move manuscript file in Google Drive when status changes
 */
export const moveManuscriptInGoogleDrive = async (
  fileId: string,
  oldStatus: string,
  newStatus: string,
  year: number = new Date().getFullYear()
): Promise<boolean> => {
  if (!cachedAccessToken || !fileId) return false;

  try {
    const root = await findOrCreateFolder('CHSSH Journal');
    const manuscripts = await findOrCreateFolder('Manuscripts', root.id);
    const yearFolder = await findOrCreateFolder(String(year), manuscripts.id);

    const oldFolderName = getStatusFolderName(oldStatus);
    const newFolderName = getStatusFolderName(newStatus);

    if (oldFolderName === newFolderName) return true;

    const oldFolder = await findOrCreateFolder(oldFolderName, yearFolder.id);
    const newFolder = await findOrCreateFolder(newFolderName, yearFolder.id);

    await driveFetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?addParents=${newFolder.id}&removeParents=${oldFolder.id}&fields=id,parents`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      }
    );

    return true;
  } catch (err) {
    console.warn('Error moving file in Google Drive:', err);
    return false;
  }
};
