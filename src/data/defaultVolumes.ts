import { JournalVolume, JournalIssue } from '../types';

export const initialVolumes: JournalVolume[] = [
  {
    id: 'vol-1',
    volumeNumber: 1,
    year: 2026,
    title: 'Contemporary Horizons in Social Sciences & Humanities - Inaugural Volume',
    description: 'Volume 1 reflects groundbreaking scholarship in education for sustainable development, epistemology, public policy, and digital humanities.',
    status: 'published',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-30T00:00:00.000Z'
  }
];

export const initialIssues: JournalIssue[] = [
  {
    id: 'iss-vol1-iss1',
    volumeId: 'vol-1',
    volumeNumber: 1,
    issueNumber: 1,
    year: 2026,
    title: 'Inaugural Issue: Foundational Discourses in Humanities & Sustainable Development',
    publicationDate: '2026-09-30',
    tableOfContentsSummary: 'Education for sustainable development, ethical frameworks, and socio-cultural perspectives.',
    articleIds: ['art-1790792770097'],
    status: 'published',
    isCurrent: true,
    createdAt: '2026-09-20T00:00:00.000Z',
    updatedAt: '2026-09-30T00:00:00.000Z'
  }
];
