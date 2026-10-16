import React, { useState } from 'react';
import { useJournal } from '../context/JournalContext';

interface JournalCrestProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showShadow?: boolean;
  alt?: string;
}

export const JournalCrest: React.FC<JournalCrestProps> = ({
  size = 'md',
  className = '',
  showShadow = true,
  alt = 'CHSSH - A Multidisciplinary Peer Review Journal'
}) => {
  const [imageError, setImageError] = useState(false);
  let uploadedLogoSrc: string | null = null;

  try {
    const journal = useJournal();
    const logoAsset = journal.uploadedAssets?.['journal_logo'];
    if (logoAsset?.fileDataUrl) {
      uploadedLogoSrc = logoAsset.fileDataUrl;
    } else if (logoAsset?.fileUrl) {
      uploadedLogoSrc = logoAsset.fileUrl;
    }
  } catch {
    // Context unavailable
  }

  const effectiveSrc = uploadedLogoSrc || '/assets/chssh_logo.jpg';

  const dimensions: Record<string, string> = {
    xs: 'w-7 h-7',
    sm: 'w-10 h-10',
    md: 'w-14 h-14 sm:w-16 sm:h-16',
    lg: 'w-20 h-20 sm:w-24 sm:h-24',
    xl: 'w-28 h-28 sm:w-32 sm:h-32',
    '2xl': 'w-40 h-40 sm:w-48 sm:h-48'
  };

  const shadowStyle = showShadow ? 'shadow-md dark:shadow-stone-900/60' : '';

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full transition-transform duration-300 hover:scale-105 select-none ${dimensions[size] || dimensions.md} ${shadowStyle} ${className}`}
      title="CHSSH - A Multidisciplinary Peer Review Journal"
    >
      {!imageError ? (
        <img
          src={effectiveSrc}
          alt={alt}
          referrerPolicy="no-referrer"
          onError={() => setImageError(true)}
          className="w-full h-full object-cover rounded-full ring-1 ring-stone-900/10 dark:ring-stone-100/20 bg-white"
          loading="eager"
        />
      ) : (
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full rounded-full ring-1 ring-stone-900/10 dark:ring-stone-100/20 bg-[#dad8cf]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="50" cy="50" r="48.5" stroke="#1c355e" strokeWidth="2.5" fill="#dad8cf" />
          <defs>
            <path
              id="crestTextArc"
              d="M 16 50 A 34 34 0 1 1 84 50"
              fill="none"
            />
          </defs>
          <text
            fill="#1c355e"
            fontSize="4.4"
            fontFamily="serif"
            fontWeight="bold"
            letterSpacing="0.6"
          >
            <textPath
              href="#crestTextArc"
              startOffset="50%"
              textAnchor="middle"
            >
              A MULTIDISCIPLINARY PEER REVIEW JOURNAL
            </textPath>
          </text>
          <text
            x="50"
            y="90"
            textAnchor="middle"
            fill="#1c355e"
            fontSize="10"
            fontFamily="serif"
            fontWeight="900"
            letterSpacing="1.2"
          >
            CHSSH
          </text>
          <circle cx="50" cy="46" r="30" stroke="#ffffff" strokeWidth="2.5" />
          <circle cx="50" cy="46" r="28.5" fill="#1f3864" />
          <g stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <path d="M 50 31 L 68 37 L 50 43 L 32 37 Z" />
            <path d="M 40 40 Q 50 45 60 40" />
            <path d="M 37 38 L 34 46 M 34 46 L 32 54 M 34 46 L 34 54 M 34 46 L 36 54" />
            <path d="M 44 42 Q 41 46 41 51 Q 41 54 44 55 Q 45 56 46 59" />
            <path d="M 56 42 Q 59 46 59 51 Q 59 54 56 55 Q 55 56 54 59" />
            <path d="M 31 63 C 36 57 44 57 47 62 L 50 67 L 53 62 C 56 57 64 57 69 63" />
            <path d="M 47 62 L 50 72 L 53 62" />
          </g>
        </svg>
      )}
    </div>
  );
};
