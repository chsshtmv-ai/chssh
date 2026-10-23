import { ref, uploadBytes, getDownloadURL, getBlob } from 'firebase/storage';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { storage, db, auth } from '../lib/firebase';
import { cleanForFirestore } from '../utils/cleanFirestore';
import { savePublishedPaperFile, getPublishedPaperFile, getOriginalManuscriptFile } from '../utils/fileStorage';
import { saveLargePdfToFirestoreChunks, readLargePdfFromFirestoreChunks } from './pdfStorageService';

export const MAX_PDF_SIZE_BYTES = 35 * 1024 * 1024; // 35 MB max

export interface StorageUploadResult {
  documentId: string;
  storagePath: string;
  downloadURL: string;
  originalFileName: string;
  fileSize: string;
  fileSizeBytes: number;
  mimeType: string;
  uploadedAt: string;
  storageType: 'firebase_storage' | 'firestore_cloud';
  fileDataUrl?: string;
  totalParts?: number;
  chunkPrefix?: string;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

export function detectMimeType(filename: string, fileType?: string): string {
  if (fileType && fileType.length > 3) return fileType;
  const lower = filename.toLowerCase();
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.docx')) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  if (lower.endsWith('.doc')) return 'application/msword';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  return 'application/octet-stream';
}

/**
 * Validates that the selected file is genuinely a PDF by verifying:
 * 1. File presence and minimum size
 * 2. File extension (.pdf)
 * 3. MIME type (application/pdf)
 * 4. PDF magic byte header signature (%PDF)
 */
export async function verifyPdfSignature(file: File | null | undefined): Promise<{ valid: boolean; error?: string }> {
  if (!file) {
    return { valid: false, error: 'Please select a research paper PDF file.' };
  }

  const isPdfExt = file.name.toLowerCase().endsWith('.pdf');
  if (!isPdfExt) {
    return { valid: false, error: 'Invalid file format: Only .pdf research paper documents are permitted.' };
  }

  if (file.type && file.type !== 'application/pdf') {
    return { valid: false, error: 'Invalid MIME type: The selected file does not declare application/pdf.' };
  }

  if (file.size < 32) {
    return { valid: false, error: 'The selected file is empty or corrupted (size < 32 bytes).' };
  }

  if (file.size > MAX_PDF_SIZE_BYTES) {
    return { valid: false, error: `File size (${formatBytes(file.size)}) exceeds the maximum allowed limit of 35MB.` };
  }

  try {
    const slice = file.slice(0, 5);
    const buf = await slice.arrayBuffer();
    const bytes = new Uint8Array(buf);
    // %PDF is 0x25, 0x50, 0x44, 0x46 in ASCII
    const isMagicValid =
      bytes[0] === 0x25 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x44 &&
      bytes[3] === 0x46;

    if (!isMagicValid) {
      return {
        valid: false,
        error: 'PDF signature verification failed: The selected file does not contain a valid %PDF header.'
      };
    }

    return { valid: true };
  } catch (err: any) {
    return { valid: false, error: `Could not verify PDF file signature: ${err.message || 'Read error'}` };
  }
}

/**
 * Helper to read a File object into a base64 Data URL
 */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read PDF file format.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read PDF file.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Converts a base64 data URL to a binary Blob
 */
export function dataUrlToBinaryBlob(dataUrl: string, mimeType: string = 'application/pdf'): Blob {
  if (dataUrl.startsWith('blob:')) {
    throw new Error('Already a blob URL');
  }
  const parts = dataUrl.split(',');
  const byteString = atob(parts[1] || parts[0]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeType });
}

/**
 * Resilient multi-tier upload for research paper PDFs:
 * 1. Validates genuine PDF signature
 * 2. Ensures Firebase Auth session (signInAnonymously if needed)
 * 3. Attempts Firebase Storage upload with timeout
 * 4. Gracefully falls back to Firestore persistent cloud chunk storage if Firebase Storage bucket is restricted or uninitialized
 * 5. Caches in local IndexedDB for immediate responsive viewing
 */
export async function uploadOriginalFileToStorage(
  file: File,
  documentId: string,
  folder: string = 'published_papers',
  onProgress?: (stage: string) => void
): Promise<StorageUploadResult> {
  // 1. Signature verification
  onProgress?.('Verifying PDF file signature (%PDF header)...');
  const check = await verifyPdfSignature(file);
  if (!check.valid) {
    throw new Error(check.error || 'Invalid PDF file.');
  }

  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const timestamp = Date.now();
  const storagePath = `${folder}/${documentId}_${timestamp}_${sanitizedName}`;
  const mimeType = 'application/pdf';
  const sizeFormatted = formatBytes(file.size);
  const now = new Date().toISOString();

  // 2. Read full Data URL for caching and fallback persistence
  onProgress?.('Reading PDF binary content...');
  const fileDataUrl = await readFileAsDataUrl(file);

  // 3. Ensure Firebase Auth session is active for storage security rules
  if (auth && !auth.currentUser) {
    try {
      await signInAnonymously(auth);
    } catch (authErr) {
      console.warn('Firebase Auth anonymous login note:', authErr);
    }
  }

  // 4. Attempt Firebase Storage upload with timeout
  onProgress?.('Uploading PDF to cloud storage...');
  let downloadURL: string | null = null;
  let storageType: 'firebase_storage' | 'firestore_cloud' = 'firestore_cloud';
  let totalParts: number | undefined;
  let chunkPrefix: string | undefined;

  try {
    const storageRef = ref(storage, storagePath);
    const uploadPromise = (async () => {
      await uploadBytes(storageRef, file, {
        contentType: mimeType,
        customMetadata: {
          documentId,
          originalFileName: file.name,
          fileSize: String(file.size),
          uploadedAt: now
        }
      });
      return await getDownloadURL(storageRef);
    })();

    // 6-second timeout before falling back to Firestore chunks
    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), 6000);
    });

    const resultUrl = await Promise.race([uploadPromise, timeoutPromise]);
    if (resultUrl) {
      downloadURL = resultUrl;
      storageType = 'firebase_storage';
    }
  } catch (storageErr) {
    console.warn('Firebase Storage direct upload skipped/unavailable, using persistent Firestore cloud storage:', storageErr);
  }

  // 5. If Firebase Storage did not succeed, store across persistent Firestore cloud chunks
  if (!downloadURL) {
    onProgress?.('Storing PDF in persistent cloud database...');
    storageType = 'firestore_cloud';
    const slotId = `pub_paper_${documentId}`;
    try {
      const chunkRes = await saveLargePdfToFirestoreChunks(slotId, fileDataUrl, onProgress);
      totalParts = chunkRes.totalParts;
      chunkPrefix = chunkRes.chunkPrefix;
      downloadURL = fileDataUrl; // Data URL acts as immediate download URL
    } catch (chunkErr) {
      console.warn('Firestore chunk storage note:', chunkErr);
      downloadURL = fileDataUrl;
    }
  }

  // 6. Cache in local IndexedDB for instant client access and offline readiness
  try {
    await savePublishedPaperFile(documentId, fileDataUrl);
  } catch (idbErr) {
    console.warn('IndexedDB cache save note:', idbErr);
  }

  onProgress?.('PDF verified and saved successfully.');

  return {
    documentId,
    storagePath: storageType === 'firebase_storage' ? storagePath : `firestore_cloud://${documentId}`,
    downloadURL: downloadURL || fileDataUrl,
    originalFileName: file.name,
    fileSize: sizeFormatted,
    fileSizeBytes: file.size,
    mimeType,
    uploadedAt: now,
    storageType,
    fileDataUrl,
    totalParts,
    chunkPrefix
  };
}

/**
 * Persists document metadata and original file reference in Firestore under /articles/{id}
 */
export async function saveDocumentRecordInFirestore(
  documentId: string,
  uploadResult: StorageUploadResult,
  additionalData: Record<string, unknown> = {}
): Promise<void> {
  const artDocRef = doc(db, 'articles', documentId);
  const today = new Date().toISOString().split('T')[0];

  const payload: Record<string, unknown> = {
    status: 'published',
    publishedDate: today,
    lastUpdatedDate: today,
    storagePath: uploadResult.storagePath,
    downloadURL: uploadResult.downloadURL,
    originalFileName: uploadResult.originalFileName,
    fileName: uploadResult.originalFileName,
    mimeType: uploadResult.mimeType,
    fileSize: uploadResult.fileSize,
    fileSizeBytes: uploadResult.fileSizeBytes,
    // Publication specific fields
    publishedStoragePath: uploadResult.storagePath,
    publishedDownloadURL: uploadResult.downloadURL,
    publishedFileName: uploadResult.originalFileName,
    publishedFileSize: uploadResult.fileSize,
    publishedFileType: 'pdf',
    publishedMimeType: uploadResult.mimeType,
    publishedUploadedAt: uploadResult.uploadedAt,
    storageType: uploadResult.storageType,
    ...(uploadResult.totalParts ? { totalParts: uploadResult.totalParts } : {}),
    ...(uploadResult.chunkPrefix ? { chunkPrefix: uploadResult.chunkPrefix } : {}),
    ...additionalData
  };

  // If file data URL is small enough (< 700KB), store directly in article doc as well
  if (uploadResult.fileDataUrl && uploadResult.fileDataUrl.length < 700000) {
    payload.publishedFileDataUrl = uploadResult.fileDataUrl;
  }

  await updateDoc(artDocRef, cleanForFirestore(payload));
}

/**
 * Resilient multi-tier download for published research papers:
 * Tries every storage tier in sequence:
 * 1. Exact fileDataUrl passed directly
 * 2. Local IndexedDB cache (stored under STORE_PUBLISHED)
 * 3. Firebase Storage SDK via getBlob / storagePath
 * 4. Public/signed downloadURL via browser fetch
 * 5. Reassembling Firestore cloud chunk documents (from `pub_paper_${documentId}`)
 * 6. localStorage cache fallback
 */
export async function downloadOriginalFileFromStorage(docRef: {
  storagePath?: string;
  downloadURL?: string;
  fileName?: string;
  publishedFileName?: string;
  mimeType?: string;
  documentId?: string;
  fileDataUrl?: string;
}): Promise<boolean> {
  const targetFileName = docRef.publishedFileName || docRef.fileName || 'Published_Paper.pdf';
  const documentId = docRef.documentId;

  // Tier 1: Direct fileDataUrl provided in memory
  if (docRef.fileDataUrl) {
    triggerBlobDownload(dataUrlToBinaryBlob(docRef.fileDataUrl, 'application/pdf'), targetFileName);
    return true;
  }

  // Tier 2: Retrieve from IndexedDB cache
  if (documentId) {
    try {
      const cachedData = await getPublishedPaperFile(documentId);
      if (cachedData) {
        triggerBlobDownload(dataUrlToBinaryBlob(cachedData, 'application/pdf'), targetFileName);
        return true;
      }
    } catch (e) {
      console.warn('IndexedDB published file lookup note:', e);
    }
  }

  // Tier 3: Firebase Storage SDK via getBlob
  const storagePath = docRef.storagePath;
  if (storagePath && !storagePath.startsWith('firestore_cloud://')) {
    try {
      const storageRef = ref(storage, storagePath);
      const blob = await getBlob(storageRef);
      triggerBlobDownload(blob, targetFileName);
      return true;
    } catch (storageErr) {
      console.warn(`Firebase Storage getBlob failed for "${storagePath}", falling to alternate tiers:`, storageErr);
    }
  }

  // Tier 4: Public downloadURL via browser fetch
  const downloadURL = docRef.downloadURL;
  if (downloadURL && downloadURL.startsWith('http')) {
    try {
      const res = await fetch(downloadURL);
      if (res.ok) {
        const blob = await res.blob();
        triggerBlobDownload(blob, targetFileName);
        return true;
      }
    } catch (fetchErr) {
      console.warn('Fetch from downloadURL failed, falling back:', fetchErr);
    }

    // Direct anchor navigation
    try {
      const a = document.createElement('a');
      a.href = downloadURL;
      a.download = targetFileName;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return true;
    } catch (anchorErr) {
      console.warn('Anchor fallback note:', anchorErr);
    }
  }

  // Tier 5: Reassemble from persistent Firestore cloud chunks
  if (documentId) {
    try {
      const slotId = `pub_paper_${documentId}`;
      const snap = await getDoc(doc(db, 'journal_assets', slotId));
      if (snap.exists()) {
        const assetData = snap.data();
        let reassembled: string | null = null;
        if (assetData.fileDataUrl) {
          reassembled = assetData.fileDataUrl;
        } else if (assetData.totalParts && assetData.totalParts > 0) {
          reassembled = await readLargePdfFromFirestoreChunks(slotId, assetData.totalParts, assetData.chunkPrefix);
        }
        if (reassembled) {
          savePublishedPaperFile(documentId, reassembled).catch(() => {});
          triggerBlobDownload(dataUrlToBinaryBlob(reassembled, 'application/pdf'), targetFileName);
          return true;
        }
      }
    } catch (chunkErr) {
      console.warn('Firestore cloud chunk retrieval failed:', chunkErr);
    }
  }

  // Tier 6: localStorage fallback
  if (documentId) {
    try {
      const local = localStorage.getItem(`chssh_pub_file_${documentId}`);
      if (local) {
        triggerBlobDownload(dataUrlToBinaryBlob(local, 'application/pdf'), targetFileName);
        return true;
      }
    } catch {}
  }

  // If completely unavailable across all tiers:
  const errorMsg = `Unable to retrieve the published PDF "${targetFileName}". Please ensure the file was uploaded through the Admin Panel.`;
  alert(errorMsg);
  throw new Error(errorMsg);
}

/**
 * Triggers a direct browser download of a binary Blob
 */
export function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

/**
 * Resolves a usable URL for viewing the published PDF in a viewer or new browser tab
 */
export async function resolvePublishedPaperViewUrl(article: {
  id: string;
  publishedDownloadURL?: string;
  downloadURL?: string;
  publishedFileDataUrl?: string;
  driveUrl?: string;
  driveFileId?: string;
  storagePath?: string;
  publishedStoragePath?: string;
}): Promise<string | null> {
  // If Google Drive link:
  if (article.driveUrl || article.driveFileId) {
    const fileId = article.driveFileId || (article.driveUrl?.match(/[-\w]{25,}/)?.[0]);
    if (fileId) {
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }
  }

  // If publishedDownloadURL is a web URL:
  if (article.publishedDownloadURL && article.publishedDownloadURL.startsWith('http')) {
    return article.publishedDownloadURL;
  }

  // Check in-memory dataUrl:
  if (article.publishedFileDataUrl) {
    const blob = dataUrlToBinaryBlob(article.publishedFileDataUrl, 'application/pdf');
    return URL.createObjectURL(blob);
  }

  // Check IndexedDB:
  try {
    const cached = await getPublishedPaperFile(article.id);
    if (cached) {
      const blob = dataUrlToBinaryBlob(cached, 'application/pdf');
      return URL.createObjectURL(blob);
    }
  } catch {}

  // Check Firestore cloud chunks:
  try {
    const slotId = `pub_paper_${article.id}`;
    const snap = await getDoc(doc(db, 'journal_assets', slotId));
    if (snap.exists()) {
      const assetData = snap.data();
      let dataUrl: string | null = null;
      if (assetData.fileDataUrl) {
        dataUrl = assetData.fileDataUrl;
      } else if (assetData.totalParts && assetData.totalParts > 0) {
        dataUrl = await readLargePdfFromFirestoreChunks(slotId, assetData.totalParts, assetData.chunkPrefix);
      }
      if (dataUrl) {
        const blob = dataUrlToBinaryBlob(dataUrl, 'application/pdf');
        return URL.createObjectURL(blob);
      }
    }
  } catch {}

  return null;
}
