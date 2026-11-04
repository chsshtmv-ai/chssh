import { CurrentIssuePageConfig } from '../types';

export const defaultCurrentIssueConfig: CurrentIssuePageConfig = {
  header: {
    logoUrl: '/assets/chssh_logo.jpg',
    logoSize: 'md',
    logoAlignment: 'center',
    abbreviation: 'CHSSH',
    fullName: 'Contemporary Horizons in Social Sciences and Humanities',
    tagline: 'A Multidisciplinary Peer Review Journal',
    description: 'Peer-reviewed, open-access international journal publishing rigorous scholarship across social theory, digital humanities, and cultural studies.',
    issnOnline: '3048-9741',
    issnPrint: '3048-9733',
    headerBgColor: '#ffffff',
    headerTextColor: '#0f172a',
    headerSpacing: 'normal'
  },
  headingTitle: 'Current Issue',
  showSubInfo: true,
  downloads: {
    frontPageLabel: 'Download Front Page',
    frontPageVisible: true,
    frontPageBgColor: '#0d9488', // Teal
    frontPageTextColor: '#ffffff',
    frontPagePdfUrl: '',

    tocLabel: 'Download Table of Contents',
    tocVisible: true,
    tocBgColor: '#1e3a8a', // Navy
    tocTextColor: '#ffffff',
    tocPdfUrl: '',

    certificatesLabel: 'Download Certificates',
    certificatesVisible: true,
    certificatesBgColor: '#d97706', // Gold / Amber
    certificatesTextColor: '#ffffff',
    certificatesPdfUrl: '',

    buttonAlignment: 'center',
    buttonSize: 'md'
  },
  tableDesign: {
    columns: [
      { id: 'serial', label: 'S.No', visible: true, width: '8%', align: 'center' },
      { id: 'authors', label: 'Author(s) Name', visible: true, width: '26%', align: 'left' },
      { id: 'title', label: 'Paper Title', visible: true, width: '42%', align: 'left' },
      { id: 'pages', label: 'Page Numbers', visible: true, width: '12%', align: 'center' },
      { id: 'download', label: 'Download PDF', visible: true, width: '12%', align: 'center' }
    ],
    headerBgColor: '#0d9488', // Teal
    headerTextColor: '#ffffff',
    rowBgColor: '#ffffff',
    rowAltBgColor: '#f8fafc',
    borderColor: '#e2e8f0',
    fontSize: 'sm',
    fontFamily: 'serif',
    cellPadding: 'normal'
  },
  footer: {
    message: 'Contemporary Horizons in Social Sciences and Humanities • An Open-Access Peer-Reviewed Academic Repository',
    visible: true,
    textColor: '#64748b',
    fontSize: 'xs',
    alignment: 'center',
    showDecorativeLines: true
  },
  pageAppearance: {
    bgColor: '#ffffff',
    primaryColor: '#0d9488',
    secondaryColor: '#102344',
    accentColor: '#d97706',
    containerWidth: 'max-w-6xl',
    spacing: 'normal',
    emptyStateMessage: 'No articles are currently published in this issue. When the editorial office approves and publishes manuscripts, they will appear here.'
  },
  status: 'published',
  lastUpdated: new Date().toISOString(),
  updatedBy: 'chsshtmv@gmail.com'
};
