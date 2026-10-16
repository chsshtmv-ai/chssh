/**
 * Academic DOI (Digital Object Identifier) Utility Functions
 * Implements ISO 26324 / Crossref / DataCite / International DOI Foundation (IDF) standards
 * for automatic generation, validation, normalization, and canonical URL resolution of scholarly DOIs.
 */

export interface DoiValidationResult {
  isValid: boolean;
  error?: string;
  warning?: string;
  normalizedDoi: string;
  canonicalUrl: string;
  prefix?: string;
  suffix?: string;
  registrant?: string;
}

export interface DoiMetadataInputs {
  year?: number | string;
  volume?: number | string;
  issue?: number | string;
  trackingId?: string;
  id?: string;
  articleNumber?: number | string;
}

/**
 * Normalizes any user-entered DOI string
 */
export function normalizeDoi(input: string | undefined | null): string {
  if (!input) return '';
  let cleaned = input.trim();
  cleaned = cleaned.replace(/^https?:\/\/(dx\.)?doi\.org\//i, '');
  cleaned = cleaned.replace(/^https?:\/\/[a-z0-9.-]+\/doi\//i, '');
  cleaned = cleaned.replace(/^doi:\s*/i, '');
  cleaned = cleaned.trim().replace(/^\/+/, '').replace(/\/+$/, '');
  return cleaned;
}

/**
 * Formats a canonical HTTPS resolver URL for any DOI.
 */
export function getCanonicalDoiUrl(doi: string | undefined | null): string {
  const normalized = normalizeDoi(doi);
  if (!normalized) return '';
  return `https://doi.org/${normalized}`;
}

/**
 * Validates whether a given DOI conforms to academic standards (ISO 26324 & Crossref/DataCite).
 */
export function validateAcademicDoi(input: string | undefined | null): DoiValidationResult {
  const normalized = normalizeDoi(input);
  const canonicalUrl = getCanonicalDoiUrl(normalized);

  if (!normalized) {
    return {
      isValid: false,
      error: 'DOI cannot be empty. Please enter or auto-generate a valid DOI.',
      normalizedDoi: '',
      canonicalUrl: ''
    };
  }

  if (!normalized.startsWith('10.')) {
    return {
      isValid: false,
      error: 'Academic DOI must start with directory identifier "10." (e.g., 10.5281/...)',
      normalizedDoi: normalized,
      canonicalUrl
    };
  }

  const slashIndex = normalized.indexOf('/');
  if (slashIndex === -1) {
    return {
      isValid: false,
      error: 'Academic DOI must contain a forward slash "/" separating the registrant prefix and suffix.',
      normalizedDoi: normalized,
      canonicalUrl
    };
  }

  const prefix = normalized.substring(0, slashIndex);
  const suffix = normalized.substring(slashIndex + 1);

  const prefixMatch = prefix.match(/^10\.(\d{4,9})(?:\.[a-zA-Z0-9_-]+)*$/);
  if (!prefixMatch) {
    return {
      isValid: false,
      error: `Invalid registrant prefix "${prefix}". Standard academic prefix format is "10.XXXX" (4 to 9 digits, e.g., 10.5281).`,
      normalizedDoi: normalized,
      canonicalUrl,
      prefix,
      suffix
    };
  }

  const registrant = prefixMatch[1];

  if (!suffix || suffix.trim().length === 0) {
    return {
      isValid: false,
      error: 'DOI suffix cannot be empty after the forward slash "/".',
      normalizedDoi: normalized,
      canonicalUrl,
      prefix,
      suffix,
      registrant
    };
  }

  if (/\s/.test(suffix)) {
    return {
      isValid: false,
      error: 'DOI cannot contain spaces. Use dots, hyphens, or underscores instead.',
      normalizedDoi: normalized,
      canonicalUrl,
      prefix,
      suffix,
      registrant
    };
  }

  if (/[<>"\\^`{|}]/.test(suffix)) {
    return {
      isValid: false,
      error: 'DOI suffix contains characters forbidden by Crossref/IDF specifications (< > " \\ ^ ` { | }).',
      normalizedDoi: normalized,
      canonicalUrl,
      prefix,
      suffix,
      registrant
    };
  }

  if (suffix.length < 2) {
    return {
      isValid: false,
      error: 'DOI suffix is too short (must be at least 2 characters).',
      normalizedDoi: normalized,
      canonicalUrl,
      prefix,
      suffix,
      registrant
    };
  }

  const crossrefRegex = /^10\.\d{4,9}(?:\.[a-zA-Z0-9_-]+)*\/[-._;()/:A-Za-z0-9]+$/;
  if (!crossrefRegex.test(normalized)) {
    return {
      isValid: false,
      error: 'DOI contains characters outside the standard Crossref/DataCite character set.',
      normalizedDoi: normalized,
      canonicalUrl,
      prefix,
      suffix,
      registrant
    };
  }

  let warning: string | undefined;
  if (/[._-]$/.test(suffix)) {
    warning = 'Notice: DOI ends with a punctuation character. While technically allowed, it may cause copy-paste issues.';
  }

  return {
    isValid: true,
    warning,
    normalizedDoi: normalized,
    canonicalUrl,
    prefix,
    suffix,
    registrant
  };
}

/**
 * Automatically generates a standardized academic DOI string based on journal prefix and article metadata.
 */
export function generateAcademicDoi(
  prefix: string | undefined | null,
  metadata: DoiMetadataInputs
): string {
  let cleanPrefix = normalizeDoi(prefix) || '10.5281/chssh';
  if (!cleanPrefix.includes('/')) {
    cleanPrefix = `${cleanPrefix}/chssh`;
  }

  const currentYear = new Date().getFullYear();
  const year = metadata.year ? Number(metadata.year) || currentYear : currentYear;
  const volume = metadata.volume ? Number(metadata.volume) || 7 : 7;
  const issue = metadata.issue ? Number(metadata.issue) || 1 : 1;

  let articleNumStr = '01';
  if (metadata.articleNumber !== undefined && metadata.articleNumber !== '') {
    const parsed = parseInt(String(metadata.articleNumber).replace(/[^0-9]/g, ''), 10);
    if (!isNaN(parsed)) {
      articleNumStr = parsed.toString().padStart(2, '0');
    }
  } else if (metadata.trackingId) {
    const digits = metadata.trackingId.replace(/[^0-9]/g, '');
    if (digits.length >= 2) {
      articleNumStr = digits.slice(-2);
    } else if (digits.length === 1) {
      articleNumStr = `0${digits}`;
    }
  } else if (metadata.id) {
    const digits = metadata.id.replace(/[^0-9]/g, '');
    if (digits.length >= 2) {
      articleNumStr = digits.slice(-2);
    }
  }

  return `${cleanPrefix}.${year}.${volume}${issue}${articleNumStr}`;
}

/**
 * Formats a DOI for display in various formats
 */
export function formatDoiForDisplay(
  doi: string | undefined | null,
  format: 'short' | 'doi-label' | 'url' = 'doi-label'
): string {
  const normalized = normalizeDoi(doi);
  if (!normalized) return '';

  switch (format) {
    case 'url':
      return `https://doi.org/${normalized}`;
    case 'short':
      return normalized;
    case 'doi-label':
    default:
      return `doi:${normalized}`;
  }
}
