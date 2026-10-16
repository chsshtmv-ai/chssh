/**
 * Detects whether a file or asset is a PDF, Word DOCX, Word DOC, or other
 */
export function detectDocumentFormat(
  assetOrFile: {
    name?: string;
    fileName?: string;
    type?: string;
    fileType?: string;
    fileDataUrl?: string;
    fileUrl?: string;
    downloadURL?: string;
  } | null | undefined
): 'pdf' | 'docx' | 'doc' | 'unknown' {
  if (!assetOrFile) return 'unknown';
  const name = (assetOrFile.fileName || assetOrFile.name || '').toLowerCase();
  const type = (assetOrFile.fileType || assetOrFile.type || '').toLowerCase();
  const dataUrl = (assetOrFile.fileDataUrl || '').slice(0, 100).toLowerCase();
  const url = (assetOrFile.downloadURL || assetOrFile.fileUrl || '').toLowerCase();

  if (
    name.endsWith('.pdf') ||
    type.includes('pdf') ||
    dataUrl.includes('application/pdf') ||
    dataUrl.includes('jvberi') ||
    url.includes('.pdf') ||
    url.includes('application%2fpdf')
  ) {
    return 'pdf';
  }
  if (name.endsWith('.docx') || type.includes('wordprocessingml') || type.includes('officedocument') || url.includes('.docx')) {
    return 'docx';
  }
  if (name.endsWith('.doc') || type.includes('msword') || url.includes('.doc')) {
    return 'doc';
  }
  return 'unknown';
}

/**
 * Checks whether an uploaded file is strictly an accepted format (Word .docx/.doc or PDF .pdf)
 */
export function isWordOrPdfDocument(
  assetOrFile: { name?: string; fileName?: string; type?: string; fileType?: string } | null | undefined
): boolean {
  if (!assetOrFile) return false;
  const name = (assetOrFile.fileName || assetOrFile.name || '').toLowerCase();
  const type = (assetOrFile.fileType || assetOrFile.type || '').toLowerCase();
  return (
    name.endsWith('.pdf') ||
    name.endsWith('.docx') ||
    name.endsWith('.doc') ||
    type.includes('pdf') ||
    type.includes('word') ||
    type.includes('msword') ||
    type.includes('officedocument')
  );
}

/**
 * Converts a Base64 Data URL to a native Blob URL (blob:...), or passes through native URLs
 */
export function dataUrlToBlobUrl(dataUrl: string, fallbackMime = 'application/pdf'): string | null {
  if (!dataUrl) return null;
  // If it's already a blob or http(s) URL, return it directly
  if (dataUrl.startsWith('blob:') || dataUrl.startsWith('http://') || dataUrl.startsWith('https://')) {
    return dataUrl;
  }
  try {
    const parts = dataUrl.split(',');
    const mimeMatch = parts[0]?.match(/:(.*?);/);
    const mimeType = mimeMatch ? mimeMatch[1] : fallbackMime;
    const base64Data = parts[1] || parts[0];
    const byteCharacters = atob(base64Data);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      byteArrays.push(new Uint8Array(byteNumbers));
    }
    const blob = new Blob(byteArrays, { type: mimeType });
    return URL.createObjectURL(blob);
  } catch (err) {
    console.warn('Failed to convert dataUrl to Blob URL:', err);
    return null;
  }
}

/**
 * Standardizes filename according to format (.pdf or .docx)
 */
export function ensureFileExtension(fileName: string, targetFormat: 'pdf' | 'docx' | 'doc'): string {
  const cleanBase = fileName.replace(/\.(pdf|docx|doc)$/i, '');
  if (targetFormat === 'pdf') return `${cleanBase}.pdf`;
  if (targetFormat === 'docx') return `${cleanBase}.docx`;
  if (targetFormat === 'doc') return `${cleanBase}.doc`;
  return fileName;
}
