import React from 'react';
import { useJournal } from '../context/JournalContext';
import { JournalContent } from '../types';

interface EditableTextProps {
  id: keyof JournalContent;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  className?: string;
  multiline?: boolean;
  placeholder?: string;
  label?: string;
}

const KEY_ALIASES: Record<string, string[]> = {
  eic_badge: ['editor_in_chief_badge'],
  editor_in_chief_badge: ['eic_badge'],
  eic_tenure_badge: ['editor_in_chief_tenure'],
  editor_in_chief_tenure: ['eic_tenure_badge'],
  editor_in_chief_statement: ['editor_in_chief_quote'],
  editor_in_chief_quote: ['editor_in_chief_statement'],
  editor_in_chief_title: ['editor_in_chief_affiliation'],
  editor_in_chief_affiliation: ['editor_in_chief_title'],
  top_announcement_bar_text: ['header_top_announcement'],
  header_top_announcement: ['top_announcement_bar_text'],
  nav_current: ['nav_current_issue'],
  nav_current_issue: ['nav_current'],
  nav_aims: ['nav_aims_scope'],
  nav_aims_scope: ['nav_aims'],
  nav_guidelines: ['nav_author_guidelines'],
  nav_author_guidelines: ['nav_guidelines'],
  nav_editorial: ['nav_editorial_board'],
  nav_editorial_board: ['nav_editorial'],
  nav_track: ['nav_track_submission'],
  nav_track_submission: ['nav_track']
};

export const EditableText: React.FC<EditableTextProps> = ({
  id,
  tag = 'span',
  className = '',
  placeholder = ''
}) => {
  const { activeContent, content } = useJournal();
  const sourceContent = activeContent || content;

  let rawValue = sourceContent[id];
  if ((rawValue === undefined || rawValue === null || rawValue === '') && KEY_ALIASES[id as string]) {
    for (const alias of KEY_ALIASES[id as string]) {
      const aliasVal = sourceContent[alias as keyof JournalContent];
      if (aliasVal !== undefined && aliasVal !== null && aliasVal !== '') {
        rawValue = aliasVal;
        break;
      }
    }
  }

  let value = (rawValue !== undefined && rawValue !== null && rawValue !== '') ? rawValue : placeholder;

  if (typeof value === 'string' && (value.includes('Edinburgh') || value.includes('Chair of Social Policy & Humanistic Inquiry') || value.includes('Chair of Social Policy'))) {
    if (id === 'editor_in_chief_title' || id === 'editor_in_chief_affiliation') {
      value = 'Assistant Professor, Tamralipta Mahavidyalaya, Vidyasagar University';
    } else if (id === 'top_announcement_bar_text' || id === 'header_top_announcement') {
      value = 'Contemporary Horizons in Social Sciences and Humanities (CHSSH)';
    } else if (id === 'contact_office') {
      value = 'Tamralipta Mahavidyalaya, Abasbari, Tamluk, Purba Medinipur, West Bengal 721636, India';
    } else {
      value = placeholder || '';
    }
  }

  const Tag = tag as any;

  return <Tag className={className}>{value}</Tag>;
};
