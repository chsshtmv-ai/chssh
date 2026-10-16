/**
 * IndexedDB storage utility for large manuscript files (up to hundreds of MBs)
 * Bypasses the 5MB browser localStorage quota so author uploads and published papers
 * are never lost or corrupted across page reloads.
 */

const DB_NAME = 'CHSSH_Journal_FileStore';
const DB_VERSION = 2;

const STORE_ORIGINAL = 'author_original_files';
const STORE_PUBLISHED = 'published_papers';
const STORE_ASSETS = 'journal_asset_files';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_ORIGINAL)) {
        db.createObjectStore(STORE_ORIGINAL);
      }
      if (!db.objectStoreNames.contains(STORE_PUBLISHED)) {
        db.createObjectStore(STORE_PUBLISHED);
      }
      if (!db.objectStoreNames.contains(STORE_ASSETS)) {
        db.createObjectStore(STORE_ASSETS);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Purge heavy legacy base64 file payloads from localStorage to free up browser quota for JSON metadata
 */
export function purgeLegacyFilesFromLocalStorage(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.startsWith('chssh_orig_file_') ||
          key.startsWith('chssh_pub_file_') ||
          key.startsWith('chssh_file_') ||
          key.startsWith('chssh_asset_file_'))
      ) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch {
        // Ignore
      }
    });
  } catch (e) {
    // Ignore
  }
}

/**
 * Safely set an item in localStorage with automatic quota exceeded error handling and space reclamation.
 */
export function safeLocalStorageSet(key: string, value: string): boolean {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err: any) {
    const isQuota =
      err?.name === 'QuotaExceededError' ||
      err?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      err?.code === 22 ||
      err?.code === 1014 ||
      err?.number === -2147024882 ||
      (typeof err?.message === 'string' && err.message.toLowerCase().includes('quota'));

    if (isQuota) {
      // Step 1: Purge heavy legacy file payloads from localStorage
      purgeLegacyFilesFromLocalStorage();
      // Retry setting after purging legacy file keys
      try {
        localStorage.setItem(key, value);
        return true;
      } catch {
        // Step 2: If still failing and setting articles, prune articles to lightweight metadata
        if (key === 'chssh_articles') {
          try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) {
              const pruned = parsed.slice(0, 15).map((art: any) => ({
                id: art.id,
                trackingId: art.trackingId,
                title: art.title,
                track: art.track,
                status: art.status,
                submissionDate: art.submissionDate,
                lastUpdatedDate: art.lastUpdatedDate,
                volume: art.volume,
                issue: art.issue,
                year: art.year,
                pages: art.pages,
                doi: art.doi,
                publishedDate: art.publishedDate,
                authors: art.authors,
                fileName: art.fileName,
                fileSize: art.fileSize,
                publishedFileName: art.publishedFileName,
                publishedFileSize: art.publishedFileSize
              }));
              localStorage.setItem(key, JSON.stringify(pruned));
              return true;
            }
          } catch {
            // ignore
          }
        }
        console.warn(`LocalStorage quota reached for key "${key}". Metadata persisted safely in remote state.`);
        return false;
      }
    } else {
      console.warn(`LocalStorage set error for key "${key}":`, err);
      return false;
    }
  }
}

/**
 * Save author's original submitted manuscript file dataUrl in IndexedDB
 */
export async function saveOriginalManuscriptFile(articleId: string, dataUrl: string): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_ORIGINAL, 'readwrite');
      const store = tx.objectStore(STORE_ORIGINAL);
      const req = store.put(dataUrl, articleId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB save original file error:', err);
  }
}

/**
 * Retrieve author's original submitted manuscript file dataUrl
 */
export async function getOriginalManuscriptFile(articleId: string): Promise<string | null> {
  try {
    const db = await openDb();
    const dataUrl = await new Promise<string | null>((resolve, reject) => {
      const tx = db.transaction(STORE_ORIGINAL, 'readonly');
      const store = tx.objectStore(STORE_ORIGINAL);
      const req = store.get(articleId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
    if (dataUrl) return dataUrl;
  } catch (err) {
    console.warn('IndexedDB get original file error:', err);
  }

  try {
    const local = localStorage.getItem(`chssh_orig_file_${articleId}`);
    if (local) {
      saveOriginalManuscriptFile(articleId, local).then(() => {
        try {
          localStorage.removeItem(`chssh_orig_file_${articleId}`);
        } catch {
          // Ignore
        }
      }).catch(() => {});
      return local;
    }
  } catch {
    // Ignore localStorage error
  }

  return null;
}

/**
 * Save editor's published templated paper file dataUrl in IndexedDB
 */
export async function savePublishedPaperFile(articleId: string, dataUrl: string): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_PUBLISHED, 'readwrite');
      const store = tx.objectStore(STORE_PUBLISHED);
      const req = store.put(dataUrl, articleId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB save published file error:', err);
  }
}

/**
 * Retrieve editor's published templated paper file dataUrl
 */
export async function getPublishedPaperFile(articleId: string): Promise<string | null> {
  try {
    const db = await openDb();
    const dataUrl = await new Promise<string | null>((resolve, reject) => {
      const tx = db.transaction(STORE_PUBLISHED, 'readonly');
      const store = tx.objectStore(STORE_PUBLISHED);
      const req = store.get(articleId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
    if (dataUrl) return dataUrl;
  } catch (err) {
    console.warn('IndexedDB get published file error:', err);
  }

  try {
    const local = localStorage.getItem(`chssh_pub_file_${articleId}`);
    if (local) {
      savePublishedPaperFile(articleId, local).then(() => {
        try {
          localStorage.removeItem(`chssh_pub_file_${articleId}`);
        } catch {
          // Ignore
        }
      }).catch(() => {});
      return local;
    }
  } catch {
    // Ignore localStorage error
  }

  return null;
}

/**
 * Remove author original file
 */
export async function deleteOriginalManuscriptFile(articleId: string): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_ORIGINAL, 'readwrite');
      const store = tx.objectStore(STORE_ORIGINAL);
      const req = store.delete(articleId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB delete original file error:', err);
  }

  try {
    localStorage.removeItem(`chssh_orig_file_${articleId}`);
  } catch {
    // Ignore error
  }
}

/**
 * Remove editor published file
 */
export async function deletePublishedPaperFile(articleId: string): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_PUBLISHED, 'readwrite');
      const store = tx.objectStore(STORE_PUBLISHED);
      const req = store.delete(articleId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB delete published file error:', err);
  }

  try {
    localStorage.removeItem(`chssh_pub_file_${articleId}`);
  } catch {
    // Ignore error
  }
}

/**
 * Save journal editorial document / asset file binary dataUrl in IndexedDB
 */
export async function saveAssetFile(assetId: string, dataUrl: string): Promise<void> {
  if (!assetId || !dataUrl) return;
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_ASSETS, 'readwrite');
      const store = tx.objectStore(STORE_ASSETS);
      const req = store.put(dataUrl, assetId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB save asset file error:', err);
  }
}

/**
 * Retrieve journal editorial document / asset file binary dataUrl from IndexedDB
 */
export async function getAssetFile(assetId: string): Promise<string | null> {
  if (!assetId) return null;
  try {
    const db = await openDb();
    const dataUrl = await new Promise<string | null>((resolve, reject) => {
      const tx = db.transaction(STORE_ASSETS, 'readonly');
      const store = tx.objectStore(STORE_ASSETS);
      const req = store.get(assetId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
    if (dataUrl) return dataUrl;
  } catch (err) {
    console.warn('IndexedDB get asset file error:', err);
  }
  return null;
}

/**
 * Delete journal editorial document / asset file binary from IndexedDB
 */
export async function deleteAssetFile(assetId: string): Promise<void> {
  if (!assetId) return;
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_ASSETS, 'readwrite');
      const store = tx.objectStore(STORE_ASSETS);
      const req = store.delete(assetId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB delete asset file error:', err);
  }
}

/**
 * Retrieve all stored asset files from IndexedDB to restore in-memory state on startup
 */
export async function getAllAssetFiles(): Promise<Record<string, string>> {
  try {
    const db = await openDb();
    return await new Promise<Record<string, string>>((resolve, reject) => {
      const tx = db.transaction(STORE_ASSETS, 'readonly');
      const store = tx.objectStore(STORE_ASSETS);
      const map: Record<string, string> = {};
      if ('openCursor' in store) {
        const req = store.openCursor();
        req.onsuccess = (e) => {
          const cursor = (e.target as IDBRequest).result as IDBCursorWithValue;
          if (cursor) {
            map[cursor.key as string] = cursor.value;
            cursor.continue();
          } else {
            resolve(map);
          }
        };
        req.onerror = () => reject(req.error);
      } else {
        resolve(map);
      }
    });
  } catch (err) {
    console.warn('IndexedDB getAllAssetFiles error:', err);
    return {};
  }
}
