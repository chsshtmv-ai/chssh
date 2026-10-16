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
  const { content } = useJournal();

  let rawValue = content[id];
  if ((rawValue === undefined || rawValue === null || rawValue === '') && KEY_ALIASES[id as string]) {
    for (const alias of KEY_ALIASES[id as string]) {
      const aliasVal = content[alias as keyof JournalContent];
      if (aliasVal !== undefined && aliasVal !== null && aliasVal !== '') {
        rawValue = aliasVal;
        break;
      }
    }
  }

  const value = (rawValue !== undefined && rawValue !== null && rawValue !== '') ? rawValue : placeholder;
  const Tag = tag as any;

  return <Tag className={className}>{value}</Tag>;
};
