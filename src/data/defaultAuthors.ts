import { AuthorAccount } from '../types';

// Real database-driven content: author accounts are created only by genuine registered authors
export const initialAuthors: AuthorAccount[] = [];

export const normalizePhoneNumber = (phone: string): string => {
  return phone.replace(/[^0-9]/g, '');
};
