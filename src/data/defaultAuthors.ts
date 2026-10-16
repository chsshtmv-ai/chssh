import { AuthorAccount } from '../types';

export const initialAuthors: AuthorAccount[] = [
  {
    id: 'author-elena',
    userId: 'dr_elena',
    name: 'Dr. Elena Rostova',
    phone: '+1-555-019-2834',
    email: 'elena.rostova@oxford-ethics.org',
    password: 'author@2026',
    affiliation: 'Oxford Institute for Epistemic Governance, University of Oxford',
    country: 'United Kingdom',
    orcid: '0000-0002-1825-0097',
    createdAt: '2026-01-10T10:00:00Z',
    submittedArticleIds: ['art-2026-01']
  },
  {
    id: 'author-marcus',
    userId: 'marcus_thorne',
    name: 'Prof. Marcus Thorne',
    phone: '+44-7700-900142',
    email: 'm.thorne@edinburgh-socio.ac.uk',
    password: 'author@2026',
    affiliation: 'School of Social & Political Science, University of Edinburgh',
    country: 'United Kingdom',
    orcid: '0000-0003-4921-8812',
    createdAt: '2026-01-12T14:30:00Z',
    submittedArticleIds: ['art-2026-02']
  },
  {
    id: 'author-aisha',
    userId: 'aisha_patel',
    name: 'Dr. Aisha Patel',
    phone: '+91-98765-43210',
    email: 'aisha.patel@tiss.edu',
    password: 'author@2026',
    affiliation: 'School of Development Studies, Tata Institute of Social Sciences',
    country: 'India',
    orcid: '0000-0001-9043-3341',
    createdAt: '2026-01-15T09:15:00Z',
    submittedArticleIds: ['art-2026-03']
  }
];

export const normalizePhoneNumber = (phone: string): string => {
  return phone.replace(/[^0-9]/g, '');
};
