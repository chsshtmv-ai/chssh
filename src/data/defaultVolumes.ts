import { JournalVolume, JournalIssue } from '../types';

export const initialVolumes: JournalVolume[] = [
  {
    id: 'vol-1',
    volumeNumber: 1,
    year: 2026,
    title: 'Volume 1 (2026)',
    description: 'Inaugural Volume of Contemporary Horizons in Social Sciences and Humanities (CHSSH)',
    status: 'published',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-09-30T00:00:00.000Z'
  }
];

export const initialIssues: JournalIssue[] = [
  {
    id: 'iss-1-1',
    volumeId: 'vol-1',
    volumeNumber: 1,
    issueNumber: 1,
    year: 2026,
    title: 'Issue 1: Emerging Horizons in Social Sciences, Pedagogy & Critical Inquiries',
    publicationDate: '2026-09-30',
    coverImage: '',
    tableOfContentsSummary: 'Inaugural Issue featuring peer-reviewed research papers spanning Education for Sustainable Development, Blended Learning implementations in Secondary Education, and Work-Life balance paradigms under NEP 2020.',
    articleIds: [
      'art-1790792770097',
      'art-1792773074250',
      'art_1793553792175_6lbgt'
    ],
    status: 'published',
    isCurrent: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-09-30T00:00:00.000Z'
  }
];
