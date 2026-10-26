/**
 * Utility functions for parsing, validating, previewing, and downloading
 * documents managed through Google Drive, Google Docs, Google Sheets, and Google Slides.
 */

export type GoogleDriveResourceType = 'pdf' | 'document' | 'spreadsheet' | 'presentation' | 'drive_file';

export interface ParsedGoogleDriveResource {
  isValid: boolean;
  fileId: string | null;
  resourceType: GoogleDriveResourceType;
  previewUrl: string | null;
  downloadUrl: string | null;
  directViewUrl: string | null;
  canonicalShareUrl: string | null;
  error?: string;
}

/**
 * Extracts the Google Drive / Docs / Sheets file ID from any supported URL format.
 */
export function extractGoogleDriveFileId(inputUrl: string): { fileId: string | null; resourceType: GoogleDriveResourceType } {
  if (!inputUrl || typeof inputUrl !== 'string') {
    return { fileId: null, resourceType: 'drive_file' };
  }

  const trimmed = inputUrl.trim();

  // 1. Google Docs (/document/d/ID)
  const docMatch = trimmed.match(/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]{15,})/i);
  if (docMatch && docMatch[1]) {
    return { fileId: docMatch[1], resourceType: 'document' };
  }

  // 2. Google Sheets (/spreadsheets/d/ID)
  const sheetMatch = trimmed.match(/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9_-]{15,})/i);
  if (sheetMatch && sheetMatch[1]) {
    return { fileId: sheetMatch[1], resourceType: 'spreadsheet' };
  }

  // 3. Google Slides (/presentation/d/ID)
  const slideMatch = trimmed.match(/docs\.google\.com\/presentation\/d\/([a-zA-Z0-9_-]{15,})/i);
  if (slideMatch && slideMatch[1]) {
    return { fileId: slideMatch[1], resourceType: 'presentation' };
  }

  // 4. Drive file path: /file/d/ID/... (view, preview, edit, etc.)
  const fileMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]{15,})/i);
  if (fileMatch && fileMatch[1]) {
    return { fileId: fileMatch[1], resourceType: 'pdf' };
  }

  // 5. Query parameter format: ?id=ID or &id=ID (e.g. drive.google.com/open?id=ID or uc?id=ID)
  const queryMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{15,})/i);
  if (queryMatch && queryMatch[1]) {
    return { fileId: queryMatch[1], resourceType: 'pdf' };
  }

  // 6. Direct File ID (clean alphanumeric string between 20 and 60 chars)
  if (/^[a-zA-Z0-9_-]{20,60}$/.test(trimmed)) {
    return { fileId: trimmed, resourceType: 'pdf' };
  }

  return { fileId: null, resourceType: 'drive_file' };
}

/**
 * Validates a Google Drive URL and builds all canonical links:
 * - Preview URL: https://drive.google.com/file/d/FILE_ID/preview
 * - Download URL: https://drive.google.com/uc?export=download&id=FILE_ID
 * - Direct View URL: https://drive.google.com/file/d/FILE_ID/view
 */
export function parseGoogleDriveUrl(inputUrl: string): ParsedGoogleDriveResource {
  if (!inputUrl || typeof inputUrl !== 'string' || inputUrl.trim() === '') {
    return {
      isValid: false,
      fileId: null,
      resourceType: 'drive_file',
      previewUrl: null,
      downloadUrl: null,
      directViewUrl: null,
      canonicalShareUrl: null,
      error: 'Google Drive URL is required.'
    };
  }

  const { fileId, resourceType } = extractGoogleDriveFileId(inputUrl);

  if (!fileId) {
    return {
      isValid: false,
      fileId: null,
      resourceType,
      previewUrl: null,
      downloadUrl: null,
      directViewUrl: null,
      canonicalShareUrl: null,
      error: 'Invalid Google Drive URL. Please paste a valid Google Drive share link, preview link, or Google Doc/Sheet URL.'
    };
  }

  let previewUrl = `https://drive.google.com/file/d/${fileId}/preview`;
  let downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`;
  let directViewUrl = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
  const canonicalShareUrl = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;

  if (resourceType === 'document') {
    previewUrl = `https://docs.google.com/document/d/${fileId}/preview`;
    downloadUrl = `https://docs.google.com/document/d/${fileId}/export?format=pdf`;
    directViewUrl = `https://docs.google.com/document/d/${fileId}/edit`;
  } else if (resourceType === 'spreadsheet') {
    previewUrl = `https://docs.google.com/spreadsheets/d/${fileId}/preview`;
    downloadUrl = `https://docs.google.com/spreadsheets/d/${fileId}/export?format=pdf`;
    directViewUrl = `https://docs.google.com/spreadsheets/d/${fileId}/edit`;
  } else if (resourceType === 'presentation') {
    previewUrl = `https://docs.google.com/presentation/d/${fileId}/preview`;
    downloadUrl = `https://docs.google.com/presentation/d/${fileId}/export/pdf`;
    directViewUrl = `https://docs.google.com/presentation/d/${fileId}/edit`;
  }

  return {
    isValid: true,
    fileId,
    resourceType,
    previewUrl,
    downloadUrl,
    directViewUrl,
    canonicalShareUrl
  };
}

/**
 * Validates whether a Google Drive link is properly formatted before saving.
 */
export function validateGoogleDriveLink(url: string): { valid: boolean; error?: string; fileId?: string } {
  const parsed = parseGoogleDriveUrl(url);
  if (!parsed.isValid || !parsed.fileId) {
    return {
      valid: false,
      error: parsed.error || 'Please provide a valid Google Drive or Google Docs URL.'
    };
  }
  return {
    valid: true,
    fileId: parsed.fileId
  };
}
