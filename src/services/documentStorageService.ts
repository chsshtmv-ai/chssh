import { ref, uploadBytes, getDownloadURL, getBlob } from 'firebase/storage';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { storage, db } from '../lib/firebase';
import { cleanForFirestore } from '../utils/cleanFirestore';

export interface StorageUploadResult {
  documentId: string;
  storagePath: string;
  downloadURL: string;
  originalFileName: string;
  fileSize: string;
  fileSizeBytes: number;
  mimeType: string;
  uploadedAt: string;
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
 * 1. Uploads original file to Firebase Storage
 * 2. Obtains persistent Storage path and download URL using Firebase SDK
 * 3. Returns the complete storage metadata object
 */
export async function uploadOriginalFileToStorage(
  file: File,
  documentId: string,
  folder: string = 'published_documents'
): Promise<StorageUploadResult> {
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const timestamp = Date.now();
  const storagePath = `${folder}/${documentId}_${timestamp}_${sanitizedName}`;
  const mimeType = detectMimeType(file.name, file.type);

  const storageRef = ref(storage, storagePath);
  
  // Upload exact original binary file with metadata
  await uploadBytes(storageRef, file, {
    contentType: mimeType,
    customMetadata: {
      documentId,
      originalFileName: file.name,
      fileSize: String(file.size),
      uploadedAt: new Date().toISOString()
    }
  });

  // Obtain persistent download URL
  const downloadURL = await getDownloadURL(storageRef);

  return {
    documentId,
    storagePath,
    downloadURL,
    originalFileName: file.name,
    fileSize: formatBytes(file.size),
    fileSizeBytes: file.size,
    mimeType,
    uploadedAt: new Date().toISOString()
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
  
  const payload = {
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
    publishedFileType: uploadResult.originalFileName.toLowerCase().endsWith('.pdf') ? 'pdf' : 'docx',
    publishedMimeType: uploadResult.mimeType,
    publishedUploadedAt: uploadResult.uploadedAt,
    lastUpdatedDate: new Date().toISOString().split('T')[0],
    ...additionalData
  };

  await updateDoc(artDocRef, cleanForFirestore(payload));
}

/**
 * Downloads the original file from Firebase Storage preserving original filename and format.
 * Never converts, regenerates, or replaces the uploaded document.
 * If file cannot be retrieved, throws an informative error.
 */
export async function downloadOriginalFileFromStorage(docRef: {
  storagePath?: string;
  downloadURL?: string;
  fileName?: string;
  publishedFileName?: string;
  mimeType?: string;
  documentId?: string;
}): Promise<boolean> {
  const targetFileName = docRef.publishedFileName || docRef.fileName || 'Document.pdf';
  let storagePath = docRef.storagePath;
  let downloadURL = docRef.downloadURL;

  // If storagePath is not provided directly, attempt to fetch from Firestore if documentId exists
  if (!storagePath && !downloadURL && docRef.documentId) {
    try {
      const snap = await getDoc(doc(db, 'articles', docRef.documentId));
      if (snap.exists()) {
        const data = snap.data();
        storagePath = data?.publishedStoragePath || data?.storagePath;
        downloadURL = data?.publishedDownloadURL || data?.downloadURL || data?.publishedFileUrl || data?.fileUrl;
      }
    } catch (err) {
      console.warn('Error reading article from Firestore during download:', err);
    }
  }

  // 1. Try Firebase Storage SDK directly via storagePath (canonical persistent reference)
  if (storagePath) {
    try {
      const storageRef = ref(storage, storagePath);
      // getBlob returns exact original binary bytes
      const blob = await getBlob(storageRef);
      triggerBlobDownload(blob, targetFileName);
      return true;
    } catch (storageErr: any) {
      console.warn(`Firebase Storage getBlob failed for path "${storagePath}", trying downloadURL fallback:`, storageErr);
      
      // If getBlob failed (e.g. CORS on getBlob), try getDownloadURL
      try {
        const storageRef = ref(storage, storagePath);
        const freshUrl = await getDownloadURL(storageRef);
        downloadURL = freshUrl;
      } catch (freshErr) {
        console.warn('Failed to obtain fresh download URL from storage path:', freshErr);
      }
    }
  }

  // 2. Try downloadURL using browser fetch
  if (downloadURL) {
    try {
      const res = await fetch(downloadURL);
      if (res.ok) {
        const blob = await res.blob();
        triggerBlobDownload(blob, targetFileName);
        return true;
      }
    } catch (fetchErr) {
      console.warn('Direct fetch from downloadURL failed:', fetchErr);
    }

    // Direct link click fallback for cloud download URLs
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
    } catch (linkErr) {
      console.warn('Anchor tag download fallback failed:', linkErr);
    }
  }

  // If both failed or are missing, report clear error as mandated by rule 4
  const errorMsg = `Unable to retrieve the original file "${targetFileName}" from Firebase Storage. The file may be missing, inaccessible, or permissions may be restricted. Please verify the document record or re-upload the file in the Admin Panel.`;
  alert(errorMsg);
  throw new Error(errorMsg);
}

function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
