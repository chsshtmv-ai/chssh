import { JournalUploadedAsset } from '../types';

export const initialJournalAssets: Record<string, JournalUploadedAsset> = {
  cover_page: {
    id: 'cover_page',
    title: 'Journal Issue Cover Page (Vol. 7, No. 1)',
    description: 'Official front cover document, issue masthead, ISSN barcoding, and thematic folio banner.',
    category: 'cover',
    fileName: 'CHSSH_Vol7_Issue1_Cover_Page.docx',
    fileSize: '52 KB',
    fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    uploadedAt: '2026-01-15T10:00:00.000Z',
    uploadedBy: 'Editorial Office',
    version: '1.0',
    volumeInfo: 'Vol. 7, Issue 1 (2026)',
    isUploaded: true
  },
  content_page: {
    id: 'content_page',
    title: 'Content Page & Table of Contents (Vol. 7, No. 1)',
    description: 'Preliminary pages, editorial board masthead, table of contents, pagination schema, and issue DOI registry.',
    category: 'content_page',
    fileName: 'CHSSH_Vol7_Issue1_Prelims_and_Contents.docx',
    fileSize: '58 KB',
    fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    uploadedAt: '2026-01-15T10:00:00.000Z',
    uploadedBy: 'Editorial Office',
    version: '1.0',
    volumeInfo: 'Vol. 7, Issue 1 (2026)',
    isUploaded: true
  },
  author_template: {
    id: 'author_template',
    title: 'Author Manuscript Submission Template (DOCX & PDF)',
    description: 'Standardized double-blind peer review formatting template with APA 7th style guidelines, abstract block, and font hierarchies.',
    category: 'template',
    fileName: 'CHSSH_Author_Manuscript_Template_2026.docx',
    fileSize: '68 KB',
    fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    uploadedAt: '2026-01-15T10:00:00.000Z',
    uploadedBy: 'Editorial Secretariat',
    version: '2026.1',
    volumeInfo: 'All Submissions',
    isUploaded: true
  },
  certificate_template: {
    id: 'certificate_template',
    title: 'Publication Certificate Master Template & Seal',
    description: 'Official accredited certificate framework bearing the gold archival crest, DOI validation block, and editorial signatures.',
    category: 'certificate',
    fileName: 'CHSSH_Publication_Certificate_Master.docx',
    fileSize: '54 KB',
    fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    uploadedAt: '2026-01-15T10:00:00.000Z',
    uploadedBy: 'Editorial Council',
    version: '2026.2',
    volumeInfo: 'All Published Authors',
    isUploaded: true
  },
  plagiarism_declaration: {
    id: 'plagiarism_declaration',
    title: 'COPE Plagiarism & Originality Declaration Certificate',
    description: 'Mandatory scholarly warranty affirming manuscript originality, zero uncredited content, ethical AI tool attribution, and copyright compliance.',
    category: 'certificate',
    fileName: 'CHSSH_COPE_Plagiarism_Declaration_Form.docx',
    fileSize: '56 KB',
    fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    uploadedAt: '2026-01-15T10:00:00.000Z',
    uploadedBy: 'Editorial Secretariat',
    version: '2026.1',
    volumeInfo: 'Mandatory for All Submissions',
    isUploaded: true
  },
  journal_logo: {
    id: 'journal_logo',
    title: 'Official Journal Crest & Emblem Logo',
    description: 'A Multidisciplinary Peer Review Journal (CHSSH) official scholarly emblem insignia.',
    category: 'logo',
    fileName: 'chssh_journal_logo.jpg',
    fileSize: '720 KB',
    fileType: 'image/jpeg',
    fileUrl: '/assets/chssh_logo.jpg',
    uploadedAt: '2026-09-21T04:46:00.000Z',
    uploadedBy: 'Editorial Office',
    version: '2.0',
    volumeInfo: 'Global Journal Identity',
    isUploaded: true
  }
};
