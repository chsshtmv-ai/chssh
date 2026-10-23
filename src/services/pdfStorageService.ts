import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, storage } from '../lib/firebase';
import { JournalUploadedAsset } from '../types';
import { saveAssetFile, getAssetFile } from '../utils/fileStorage';
import { cleanForFirestore } from '../utils/cleanFirestore';

export const MAX_PDF_SIZE_BYTES = 35 * 1024 * 1024; // 35 MB max
export const FIRESTORE_CHUNK_SIZE = 800 * 1024; // 800 KB per chunk (under Firestore 1MB doc limit)

export interface PdfValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates that the selected file is genuinely a PDF and within maximum file size limit
 */
export function validatePdfFile(file: File | null | undefined): PdfValidationResult {
  if (!file) {
    return { valid: false, error: 'Please select a valid PDF file.' };
  }

  const isPdf =
    file.type === 'application/pdf' ||
    file.name.toLowerCase().endsWith('.pdf');

  if (!isPdf) {
    return { valid: false, error: 'Please select a valid PDF file.' };
  }

  if (file.size > MAX_PDF_SIZE_BYTES) {
    return { valid: false, error: 'PDF file is too large. Please select a smaller file.' };
  }

  return { valid: true };
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
 * Attempts upload to Firebase Storage with a strict timeout so it never hangs
 * if Firebase Storage is not configured or bucket is unavailable.
 */
async function attemptFirebaseStorageUpload(
  file: File,
  storagePath: string,
  timeoutMs: number = 3500
): Promise<{ downloadURL: string; storagePath: string } | null> {
  try {
    const storageRef = ref(storage, storagePath);
    const uploadPromise = (async () => {
      await uploadBytes(storageRef, file, {
        contentType: 'application/pdf',
        customMetadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString()
        }
      });
      const downloadURL = await getDownloadURL(storageRef);
      return { downloadURL, storagePath };
    })();

    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), timeoutMs);
    });

    const result = await Promise.race([uploadPromise, timeoutPromise]);
    return result;
  } catch (err) {
    console.warn('Firebase Storage upload skipped/unavailable (using persistent Firestore cloud storage):', err);
    return null;
  }
}

/**
 * Saves large PDF base64 data to Firestore across chunk documents
 */
export async function saveLargePdfToFirestoreChunks(
  slotId: string,
  fileDataUrl: string,
  onStatusChange?: (status: string) => void
): Promise<{ totalParts: number; chunkPrefix: string }> {
  const chunkSize = FIRESTORE_CHUNK_SIZE;
  const totalParts = Math.ceil(fileDataUrl.length / chunkSize);
  const chunkPrefix = `${slotId}_part_`;

  onStatusChange?.(`Updating PDF (${totalParts} cloud parts)...`);

  const writes = [];
  for (let i = 0; i < totalParts; i++) {
    const chunk = fileDataUrl.slice(i * chunkSize, (i + 1) * chunkSize);
    const partRef = doc(db, 'journal_assets', `${chunkPrefix}${i}`);
    writes.push(setDoc(partRef, { index: i, chunk, updatedAt: new Date().toISOString() }));
  }

  await Promise.all(writes);
  return { totalParts, chunkPrefix };
}

/**
 * Reads all chunk documents from Firestore and reassembles the complete PDF data URL
 */
export async function readLargePdfFromFirestoreChunks(
  slotId: string,
  totalParts: number,
  chunkPrefix?: string
): Promise<string> {
  const prefix = chunkPrefix || `${slotId}_part_`;
  const reads = [];
  for (let i = 0; i < totalParts; i++) {
    const partRef = doc(db, 'journal_assets', `${prefix}${i}`);
    reads.push(getDoc(partRef));
  }

  const partDocs = await Promise.all(reads);
  const combined = partDocs.map((d) => d.data()?.chunk || '').join('');
  if (!combined) {
    throw new Error('Could not reassemble PDF from cloud parts.');
  }

  return combined.startsWith('data:') ? combined : `data:application/pdf;base64,${combined}`;
}

/**
 * Uploads and replaces the active PDF in the system.
 * Follows the complete required flow:
 * 1. Validates PDF format and file size
 * 2. Attempts Firebase Storage upload with fast timeout
 * 3. Gracefully persists to Firestore cloud storage (with chunking for large files)
 * 4. Updates active PDF references so browser refresh & all devices see the new PDF
 * 5. Safely cleans up the previous PDF only after confirmation
 */
export async function uploadAndPersistPdfAsset(
  file: File,
  slotId: string = 'cover_page',
  title?: string,
  description?: string,
  previousAsset?: JournalUploadedAsset | null,
  onStatusChange?: (status: string) => void
): Promise<JournalUploadedAsset> {
  // 1. Validation
  const validation = validatePdfFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || 'Please select a valid PDF file.');
  }

  // 2. Status: Uploading PDF...
  onStatusChange?.('Uploading PDF...');

  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const timestamp = Date.now();
  const storagePath = `journal_pdfs/${slotId}_${timestamp}_${sanitizedName}`;
  const sizeFormatted = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
  const now = new Date().toISOString();

  // Read data URL (needed for both preview, local caching, and cloud persistence)
  const fileDataUrl = await readFileAsDataUrl(file);

  // Attempt Firebase Storage upload
  const storageResult = await attemptFirebaseStorageUpload(file, storagePath, 3500);

  // 3. Status: Updating PDF...
  onStatusChange?.('Updating PDF...');

  let totalParts: number | undefined;
  let chunkPrefix: string | undefined;
  let storageType: 'firebase_storage' | 'firestore_cloud' = 'firestore_cloud';
  let downloadURL = storageResult?.downloadURL;

  if (storageResult && downloadURL) {
    storageType = 'firebase_storage';
  } else {
    // Persistent Firestore Cloud Storage:
    // If large PDF (> 750 KB), persist via chunk documents in Firestore
    if (fileDataUrl.length > 750 * 1024) {
      const chunkRes = await saveLargePdfToFirestoreChunks(slotId, fileDataUrl, onStatusChange);
      totalParts = chunkRes.totalParts;
      chunkPrefix = chunkRes.chunkPrefix;
    }
  }

  // Construct active asset metadata
  const activeAsset: JournalUploadedAsset = {
    id: slotId,
    title:
      title ||
      (slotId === 'cover_page'
        ? 'Official Journal Issue Cover & Folio (Vol. 7, No. 1)'
        : 'Official Journal Document'),
    description: description || 'Active publication document in official repository',
    category: slotId === 'cover_page' ? 'cover' : 'document',
    fileName: file.name,
    fileSize: sizeFormatted,
    fileType: 'application/pdf',
    downloadURL: downloadURL || undefined,
    fileUrl: downloadURL || undefined,
    storagePath: storageResult ? storagePath : undefined,
    fileDataUrl: totalParts ? undefined : fileDataUrl, // Single doc gets fileDataUrl if small
    totalParts,
    chunkPrefix,
    storageType,
    uploadedAt: now,
    status: 'active',
    isUploaded: true
  };

  try {
    // A. Update individual document in journal_assets collection
    const assetDocRef = doc(db, 'journal_assets', slotId);
    await setDoc(assetDocRef, cleanForFirestore(activeAsset), { merge: true });

    // B. Keep canonical active_pdf document updated for fast direct access
    if (slotId === 'cover_page' || slotId === 'active_pdf') {
      const activePdfDocRef = doc(db, 'journal_assets', 'active_pdf');
      await setDoc(activePdfDocRef, cleanForFirestore({ ...activeAsset, id: 'active_pdf' }), { merge: true });
    }

    // C. Update summary index in journal_content/assets (lightweight metadata)
    const assetsIndexRef = doc(db, 'journal_content', 'assets');
    const { fileDataUrl: _discard, ...lightweightAsset } = activeAsset;
    await setDoc(
      assetsIndexRef,
      cleanForFirestore({
        assets: {
          [slotId]: lightweightAsset,
          active_pdf: { ...lightweightAsset, id: 'active_pdf' }
        },
        updatedAt: now
      }),
      { merge: true }
    );

    // D. Cache locally in IndexedDB for immediate client responsiveness
    await saveAssetFile(slotId, fileDataUrl);
    if (slotId === 'cover_page') {
      await saveAssetFile('active_pdf', fileDataUrl);
    }
  } catch (err: any) {
    console.error('Firestore active PDF update error:', err);
    throw new Error(
      err?.message ||
      'PDF uploaded to storage, but the active PDF could not be updated. The previous active PDF should remain unchanged.'
    );
  }

  // 4. OLD PDF CLEANUP:
  // Only after new PDF successfully uploaded and database successfully updated
  if (previousAsset) {
    // Delete old Firebase Storage file if applicable
    if (
      previousAsset.storagePath &&
      previousAsset.storagePath !== storagePath &&
      previousAsset.storageType === 'firebase_storage'
    ) {
      try {
        const oldStorageRef = ref(storage, previousAsset.storagePath);
        await deleteObject(oldStorageRef);
      } catch (cleanupErr) {
        console.warn('Old PDF storage cleanup note:', cleanupErr);
      }
    }

    // If previous asset had more chunk documents, clean up old extra chunks
    if (previousAsset.totalParts && totalParts && previousAsset.totalParts > totalParts) {
      const oldPrefix = previousAsset.chunkPrefix || `${slotId}_part_`;
      for (let i = totalParts; i < previousAsset.totalParts; i++) {
        deleteDoc(doc(db, 'journal_assets', `${oldPrefix}${i}`)).catch(() => {});
      }
    }
  }

  onStatusChange?.('PDF updated successfully.');

  // Return the asset with ready fileDataUrl for immediate display in UI
  return {
    ...activeAsset,
    fileDataUrl
  };
}

/**
 * Uploads a PDF to Firebase Storage (legacy signature compatibility wrapper)
 */
export async function uploadPdfToFirebaseStorage(
  file: File,
  slotId: string = 'cover_page',
  onStatusChange?: (status: string) => void
): Promise<{ downloadURL: string; storagePath: string; fileName: string; fileSize: string }> {
  const asset = await uploadAndPersistPdfAsset(file, slotId, undefined, undefined, null, onStatusChange);
  return {
    downloadURL: asset.downloadURL || asset.fileDataUrl || '',
    storagePath: asset.storagePath || '',
    fileName: asset.fileName,
    fileSize: asset.fileSize
  };
}

/**
 * Updates Firestore with the newly uploaded PDF and marks it as active (legacy compatibility)
 */
export async function saveActivePdfToFirestore(
  data: {
    downloadURL: string;
    storagePath: string;
    fileName: string;
    fileSize?: string;
    slotId?: string;
    title?: string;
    description?: string;
    fileDataUrl?: string;
  },
  previousStoragePath?: string,
  onStatusChange?: (status: string) => void
): Promise<JournalUploadedAsset> {
  const slotId = data.slotId || 'cover_page';
  const now = new Date().toISOString();

  onStatusChange?.('Updating PDF...');

  const activeAsset: JournalUploadedAsset = {
    id: slotId,
    title:
      data.title ||
      (slotId === 'cover_page'
        ? 'Official Journal Issue Cover & Folio (Vol. 7, No. 1)'
        : 'Official Journal Document'),
    description: data.description || 'Active publication document in official repository',
    category: slotId === 'cover_page' ? 'cover' : 'document',
    fileName: data.fileName,
    fileSize: data.fileSize || 'Standard Document',
    fileType: 'application/pdf',
    downloadURL: data.downloadURL || undefined,
    fileUrl: data.downloadURL || undefined,
    storagePath: data.storagePath || undefined,
    fileDataUrl: data.fileDataUrl,
    uploadedAt: now,
    status: 'active',
    isUploaded: true
  };

  const assetDocRef = doc(db, 'journal_assets', slotId);
  await setDoc(assetDocRef, cleanForFirestore(activeAsset), { merge: true });

  if (slotId === 'cover_page' || slotId === 'active_pdf') {
    const activePdfDocRef = doc(db, 'journal_assets', 'active_pdf');
    await setDoc(activePdfDocRef, cleanForFirestore({ ...activeAsset, id: 'active_pdf' }), { merge: true });
  }

  onStatusChange?.('PDF updated successfully.');
  return activeAsset;
}

/**
 * Fetches the latest active PDF from Firebase Firestore across all devices and sessions
 */
export async function fetchActivePdfFromFirestore(
  slotId: string = 'cover_page'
): Promise<JournalUploadedAsset | null> {
  try {
    // 1. Try primary slot first
    let rawAsset: JournalUploadedAsset | null = null;
    const primaryRef = doc(db, 'journal_assets', slotId);
    const snap = await getDoc(primaryRef);
    if (snap.exists()) {
      rawAsset = snap.data() as JournalUploadedAsset;
    }

    // 2. Fallback to active_pdf document
    if (!rawAsset || (!rawAsset.downloadURL && !rawAsset.fileDataUrl && !rawAsset.totalParts)) {
      const activePdfRef = doc(db, 'journal_assets', 'active_pdf');
      const activeSnap = await getDoc(activePdfRef);
      if (activeSnap.exists()) {
        rawAsset = activeSnap.data() as JournalUploadedAsset;
      }
    }

    // 3. Fallback to journal_content/assets index
    if (!rawAsset || (!rawAsset.downloadURL && !rawAsset.fileDataUrl && !rawAsset.totalParts)) {
      const indexRef = doc(db, 'journal_content', 'assets');
      const indexSnap = await getDoc(indexRef);
      if (indexSnap.exists()) {
        const assets = indexSnap.data()?.assets as Record<string, JournalUploadedAsset> | undefined;
        const candidate = assets?.[slotId] || assets?.['active_pdf'];
        if (candidate) rawAsset = candidate;
      }
    }

    if (!rawAsset) {
      // Check local IndexedDB cache as final fallback
      const cached = await getAssetFile(slotId);
      if (cached) {
        return {
          id: slotId,
          title: 'Official Journal Document',
          description: 'Loaded from verified cache',
          category: slotId === 'cover_page' ? 'cover' : 'document',
          fileName: 'active_document.pdf',
          fileSize: 'Standard Document',
          fileType: 'application/pdf',
          fileDataUrl: cached,
          fileUrl: cached,
          uploadedAt: new Date().toISOString(),
          status: 'active',
          isUploaded: true
        };
      }
      return null;
    }

    // If active asset has totalParts stored in cloud, reassemble the parts in parallel
    if (rawAsset.totalParts && rawAsset.totalParts > 0) {
      try {
        const reassembledDataUrl = await readLargePdfFromFirestoreChunks(
          slotId,
          rawAsset.totalParts,
          rawAsset.chunkPrefix
        );
        // Cache in IndexedDB for fast subsequent loads
        saveAssetFile(slotId, reassembledDataUrl).catch(console.warn);
        return {
          ...rawAsset,
          fileDataUrl: reassembledDataUrl,
          fileUrl: reassembledDataUrl,
          downloadURL: rawAsset.downloadURL || reassembledDataUrl
        };
      } catch (err) {
        console.warn('Could not reassemble chunks, checking local cache:', err);
        const cached = await getAssetFile(slotId);
        if (cached) {
          return {
            ...rawAsset,
            fileDataUrl: cached,
            fileUrl: cached
          };
        }
      }
    }

    // If asset has downloadURL from Firebase Storage, attach cache-busted URL
    if (rawAsset.downloadURL) {
      return {
        ...rawAsset,
        fileUrl: getFreshPdfUrl(rawAsset.downloadURL)
      };
    }

    // If asset has fileDataUrl
    if (rawAsset.fileDataUrl) {
      saveAssetFile(slotId, rawAsset.fileDataUrl).catch(console.warn);
      return {
        ...rawAsset,
        fileUrl: rawAsset.fileDataUrl
      };
    }

    // Check IndexedDB
    const cached = await getAssetFile(slotId);
    if (cached) {
      return {
        ...rawAsset,
        fileDataUrl: cached,
        fileUrl: cached
      };
    }

    return rawAsset;
  } catch (err: any) {
    console.error('Error fetching active PDF from Firestore:', err);
    throw new Error('Unable to load the latest PDF. Please try again.');
  }
}

/**
 * Generates a cache-busted URL so browser cache does not serve a stale PDF
 */
export function getFreshPdfUrl(downloadUrl: string): string {
  if (!downloadUrl) return '';
  if (downloadUrl.startsWith('data:') || downloadUrl.startsWith('blob:')) {
    return downloadUrl;
  }
  try {
    const parsed = new URL(downloadUrl);
    parsed.searchParams.set('_cb', Date.now().toString());
    return parsed.toString();
  } catch {
    const separator = downloadUrl.includes('?') ? '&' : '?';
    return `${downloadUrl}${separator}_cb=${Date.now()}`;
  }
}
