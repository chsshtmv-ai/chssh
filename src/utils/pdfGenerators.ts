import { jsPDF } from 'jspdf';
import { JournalContent, Article } from '../types';

/**
 * Creates an official front cover page as a standard, pristine PDF document
 */
export function generateCoverPagePdf(content: JournalContent): string {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Background deep navy frame
  doc.setFillColor(15, 31, 56); // #0f1f38
  doc.rect(0, 0, pageWidth, 55, 'F');

  // Gold accent line
  doc.setFillColor(180, 83, 9); // #b45309
  doc.rect(0, 54, pageWidth, 2, 'F');

  // Masthead Header
  doc.setTextColor(255, 255, 255);
  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.text('INTERNATIONAL PEER-REVIEWED MULTIDISCIPLINARY JOURNAL', pageWidth / 2, 16, { align: 'center' });

  doc.setFontSize(8);
  doc.setFont('times', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(`ISSN (Online): ${content.issn_online || '2583-942X'}  |  ISSN (Print): ${content.issn_print || '2583-9411'}  |  DOI Prefix: ${content.doi_prefix || '10.5281/chssh'}`, pageWidth / 2, 23, { align: 'center' });

  // Journal Main Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('times', 'bold');
  doc.setFontSize(16);
  const titleLines = doc.splitTextToSize(content.journal_name.toUpperCase(), pageWidth - 30);
  doc.text(titleLines, pageWidth / 2, 33, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('times', 'italic');
  doc.setTextColor(248, 250, 252);
  doc.text(content.journal_tagline || 'An International, Peer-Reviewed, Open-Access Journal of Critical Scholarship', pageWidth / 2, 47, { align: 'center' });

  // Central Academic Seal Area
  doc.setDrawColor(180, 83, 9);
  doc.setLineWidth(1.2);
  doc.circle(pageWidth / 2, 110, 32);

  doc.setDrawColor(15, 31, 56);
  doc.setLineWidth(0.6);
  doc.circle(pageWidth / 2, 110, 28);

  doc.setFont('times', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 31, 56);
  doc.text(content.journal_short_name || 'CHSSH', pageWidth / 2, 107, { align: 'center' });

  doc.setFontSize(8);
  doc.setFont('times', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('ACADEMIC INTEGRITY', pageWidth / 2, 114, { align: 'center' });
  doc.text('ESTD. 2019', pageWidth / 2, 119, { align: 'center' });

  // Volume & Issue Banner
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(25, 155, pageWidth - 50, 28, 3, 3, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.roundedRect(25, 155, pageWidth - 50, 28, 3, 3, 'S');

  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 31, 56);
  doc.text('VOLUME 7     ISSUE 1     JANUARY MARCH 2026', pageWidth / 2, 168, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('times', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('QUARTERLY REGULAR ISSUE   PEER REVIEWED SCHOLARLY ARCHIVE', pageWidth / 2, 175, { align: 'center' });

  // Thematic Focus
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 31, 56);
  doc.text('Featured Scholarly Domains & Research Scope:', pageWidth / 2, 198, { align: 'center' });

  doc.setFont('times', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85);
  const scopeList = [
    '  Sociology, Anthropology & Contemporary Social Dynamics',
    '  International Relations, Public Policy & Algorithmic Governance',
    '  Critical Humanities, Literature, Cultural Studies & History',
    '  Applied Social Sciences, Human Rights & Interdisciplinary Inquiries'
  ];
  let scopeY = 208;
  scopeList.forEach(item => {
    doc.text(item, pageWidth / 2, scopeY, { align: 'center' });
    scopeY += 7;
  });

  // Footer bar
  doc.setFillColor(15, 31, 56);
  doc.rect(0, pageHeight - 24, pageWidth, 24, 'F');
  doc.setFillColor(180, 83, 9);
  doc.rect(0, pageHeight - 25, pageWidth, 1, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('times', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Official Secretariat: ${content.editorial_office_address || 'New Delhi, India'}  |  Website: www.chssh-journal.org`, pageWidth / 2, pageHeight - 14, { align: 'center' });
  doc.setTextColor(203, 213, 225);
  doc.setFontSize(7.5);
  doc.text('Open Access under Creative Commons Attribution 4.0 International (CC BY 4.0)', pageWidth / 2, pageHeight - 7, { align: 'center' });

  return doc.output('datauristring');
}

/**
 * Creates an official Author Manuscript Submission Template PDF
 */
export function generateManuscriptTemplatePdf(content: JournalContent): string {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  // Masthead Header
  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 31, 56);
  doc.text(content.journal_name.toUpperCase(), margin, 16);

  doc.setFont('times', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`ISSN (Online): ${content.issn_online}  |  ISSN (Print): ${content.issn_print}`, margin, 21);

  doc.setDrawColor(15, 31, 56);
  doc.setLineWidth(0.8);
  doc.line(margin, 24, pageWidth - margin, 24);

  // Template Title
  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 31, 56);
  doc.text('OFFICIAL AUTHOR MANUSCRIPT SUBMISSION FORMAT & TEMPLATE', margin, 34);

  doc.setFont('times', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('Guidelines for Double-Blind Peer Review Submissions (2026 Edition)', margin, 40);

  // Title Placeholder Box
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, 46, contentWidth, 22, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.rect(margin, 46, contentWidth, 22, 'S');

  doc.setFont('times', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 31, 56);
  doc.text('[Manuscript Title: Specific, Informative and Max 18 Words]', margin + 5, 54);

  doc.setFont('times', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Capitalize first letter of major words. Do NOT include author names here for double-blind review.', margin + 5, 62);

  // Abstract Block
  let y = 76;
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 31, 56);
  doc.text('ABSTRACT', margin, y);
  y += 6;

  doc.setFont('times', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  const abstractText = 'The abstract must comprise a concise, factual synthesis between 200 and 250 words. It must clearly articulate: (1) Background and core research objective, (2) Methodology and theoretical paradigm employed, (3) Key empirical or conceptual findings, and (4) Scholarly contributions and practical implications. Do not cite literature or use undefined acronyms in the abstract.';
  const absLines = doc.splitTextToSize(abstractText, contentWidth);
  doc.text(absLines, margin, y);
  y += (absLines.length * 5) + 4;

  // Keywords
  doc.setFont('times', 'bold');
  doc.text('Keywords: ', margin, y);
  doc.setFont('times', 'italic');
  doc.text('Scholarship; Peer Review; Methodology; Empirical Analysis; Critical Theory (4 to 6 keywords)', margin + 20, y);
  y += 10;

  // Structural Sections Table
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 31, 56);
  doc.text('MANUSCRIPT STRUCTURAL REQUIREMENTS', margin, y);
  y += 6;

  const sections = [
    { name: '1. Introduction', desc: 'Situates the problem within contemporary literature, identifies knowledge gaps, and articulates explicit research questions.' },
    { name: '2. Theoretical Framework', desc: 'Grounds the analysis in relevant literature, synthesizes existing scholarship, and establishes conceptual foundations.' },
    { name: '3. Methodology', desc: 'Elucidates design, sampling, data collection tools, ethical clearances, and analytical paradigms (reproducibility standard).' },
    { name: '4. Findings & Discussion', desc: 'Presents rigorous evidence with structured tables/figures; evaluates results against theoretical framework and hypotheses.' },
    { name: '5. Conclusion & Policy', desc: 'Synthesizes contributions, acknowledges empirical boundaries, and outlines actionable avenues for future inquiries.' },
    { name: '6. References', desc: 'APA 7th or Chicago author-date edition standard. Every in-text citation must correspond to a complete reference entry with DOI.' }
  ];

  sections.forEach((sec) => {
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, 45, 8, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.rect(margin, y, 45, 8, 'S');
    doc.rect(margin + 45, y, contentWidth - 45, 8, 'S');

    doc.setFont('times', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 31, 56);
    doc.text(sec.name, margin + 3, y + 5.5);

    doc.setFont('times', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    const dLines = doc.splitTextToSize(sec.desc, contentWidth - 50);
    doc.text(dLines[0], margin + 48, y + 5.5);
    y += 9;
  });

  y += 6;
  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(180, 83, 9);
  doc.text('Typography & Technical Specifications:', margin, y);
  y += 5.5;

  doc.setFont('times', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('  Primary Font: Times New Roman, 12pt regular (Headings: 14pt bold, Subheadings: 12pt bold).', margin, y);
  y += 5;
  doc.text('  Line Spacing: 1.5 lines throughout with standard 1-inch (25.4mm) margins on all sides.', margin, y);
  y += 5;
  doc.text('  Length: 5,000 to 9,000 words inclusive of tables, appendices, and references.', margin, y);

  // Footer
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(margin, pageHeight - 16, pageWidth - margin, pageHeight - 16);

  doc.setFont('times', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Official Template   ${content.journal_name}  |  Submit via online portal`, margin, pageHeight - 10);
  doc.text('Page 1 of 1', pageWidth - margin, pageHeight - 10, { align: 'right' });

  return doc.output('datauristring');
}

/**
 * Creates an official Table of Contents & Prelims PDF
 */
export function generateTableOfContentsPdf(content: JournalContent, articles: Article[]): string {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  // Masthead
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 31, 56);
  doc.text(content.journal_name.toUpperCase(), pageWidth / 2, 16, { align: 'center' });

  doc.setFont('times', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`ISSN (Online): ${content.issn_online}  |  ISSN (Print): ${content.issn_print}  |  Publisher: ${content.publisher}`, pageWidth / 2, 22, { align: 'center' });

  doc.setDrawColor(180, 83, 9);
  doc.setLineWidth(1);
  doc.line(margin, 26, pageWidth - margin, 26);

  // Title
  doc.setFont('times', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(15, 31, 56);
  doc.text('TABLE OF CONTENTS & EDITORIAL REGISTER', pageWidth / 2, 36, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('times', 'italic');
  doc.setTextColor(71, 85, 105);
  doc.text('Volume 7, Issue 1 (2026)     Quarterly Regular Peer-Reviewed Issue', pageWidth / 2, 42, { align: 'center' });

  // Articles Table
  let y = 52;
  const published = articles.filter(a => a.status === 'published');
  if (published.length === 0) {
    doc.setFont('times', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('No research papers currently published in this issue table of contents.', margin, y + 10);
  } else {
    published.forEach((item: any, idx) => {
      if (y > pageHeight - 35) {
        doc.addPage();
        y = 25;
      }

      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentWidth, 20, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(margin, y, contentWidth, 20, 'S');

      doc.setFont('times', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 31, 56);
      const itemTitle = `${idx + 1}. ${item.title}`;
      const titleLines = doc.splitTextToSize(itemTitle, contentWidth - 30);
      doc.text(titleLines[0], margin + 4, y + 6);

      doc.setFont('times', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      const authorStr = item.authors ? item.authors.map((a: any) => a.name).join(', ') : 'Author';
      doc.text(authorStr, margin + 4, y + 12);

      doc.setFont('times', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      const metaParts: string[] = [];
      if (item.doi) metaParts.push(`DOI: https://doi.org/${item.doi}`);
      if (item.track) metaParts.push(`Track: ${item.track}`);
      doc.text(metaParts.join('  |  '), margin + 4, y + 17);

      // Page Number Box
      doc.setFont('times', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(180, 83, 9);
      doc.text(item.pages ? `pp. ${item.pages}` : '—', pageWidth - margin - 4, y + 11, { align: 'right' });

      y += 24;
    });
  }

  // Footer
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, pageHeight - 16, pageWidth - margin, pageHeight - 16);

  doc.setFont('times', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Official Table of Contents   Published by ${content.publisher}`, margin, pageHeight - 10);
  doc.text('Gold Open Access (CC BY 4.0)', pageWidth - margin, pageHeight - 10, { align: 'right' });

  return doc.output('datauristring');
}

/**
 * Creates an official Accredited Publication Certificate PDF
 */
export function generatePublicationCertificatePdf(
  certData: {
    authorName?: string;
    paperTitle?: string;
    trackingId?: string;
    volume?: string;
    issue?: string;
    year?: string | number;
    pages?: string;
    doi?: string;
  },
  content: JournalContent
): string {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Multi-tier ornate borders
  doc.setDrawColor(15, 31, 56);
  doc.setLineWidth(3);
  doc.rect(8, 8, pageWidth - 16, pageHeight - 16, 'S');

  doc.setDrawColor(180, 83, 9);
  doc.setLineWidth(0.8);
  doc.rect(12, 12, pageWidth - 24, pageHeight - 24, 'S');

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.rect(14, 14, pageWidth - 28, pageHeight - 28, 'S');

  // Masthead
  doc.setFont('times', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 31, 56);
  doc.text(content.journal_name.toUpperCase(), pageWidth / 2, 28, { align: 'center' });

  doc.setFont('times', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`ISSN (Online): ${content.issn_online}  |  ISSN (Print): ${content.issn_print}  |  Publisher: ${content.publisher}`, pageWidth / 2, 34, { align: 'center' });

  // Certificate Header
  doc.setFont('times', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(180, 83, 9);
  doc.text('CERTIFICATE OF PUBLICATION', pageWidth / 2, 48, { align: 'center' });

  doc.setFont('times', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text('This is to solemnly certify that the peer-reviewed research article entitled:', pageWidth / 2, 57, { align: 'center' });

  // Article Title
  doc.setFont('times', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 31, 56);
  const articleTitle = certData.paperTitle || 'Research Article';
  const titleLines = doc.splitTextToSize(` "${articleTitle}" `, pageWidth - 60);
  doc.text(titleLines, pageWidth / 2, 68, { align: 'center' });

  // Author Name
  doc.setFont('times', 'italic');
  doc.setFontSize(10.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Authored & Contributed by:', pageWidth / 2, 85, { align: 'center' });

  doc.setFont('times', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 31, 56);
  doc.text(certData.authorName || 'Contributing Scholar', pageWidth / 2, 94, { align: 'center' });

  // Publication Citation Block
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(30, 104, pageWidth - 60, 24, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(30, 104, pageWidth - 60, 24, 2, 2, 'S');

  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  const citationLine1 = certData.volume && certData.issue
    ? `Published in ${content.journal_short_name || 'CHSSH'}, Volume ${certData.volume}, Issue ${certData.issue} (${certData.year || 2026})${certData.pages ? `, Pages: ${certData.pages}` : ''}`
    : `Published in ${content.journal_short_name || 'CHSSH'}`;
  const citationMetaParts: string[] = [];
  if (certData.trackingId) citationMetaParts.push(`Manuscript Tracking ID: ${certData.trackingId}`);
  if (certData.doi) citationMetaParts.push(`DOI: https://doi.org/${certData.doi}`);
  const citationLine2 = citationMetaParts.join('  |  ');
  doc.text(citationLine1, pageWidth / 2, 113, { align: 'center' });
  if (citationLine2) {
    doc.text(citationLine2, pageWidth / 2, 120, { align: 'center' });
  }

  // Seal in center-bottom
  doc.setDrawColor(180, 83, 9);
  doc.setLineWidth(0.8);
  doc.circle(pageWidth / 2, 155, 15);
  doc.setFont('times', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(180, 83, 9);
  doc.text('OFFICIAL SEAL', pageWidth / 2, 153, { align: 'center' });
  doc.text('VERIFIED', pageWidth / 2, 158, { align: 'center' });

  // Signatures
  // Left: Editor-in-Chief
  doc.setDrawColor(15, 31, 56);
  doc.setLineWidth(0.5);
  doc.line(40, 165, 95, 165);
  doc.setFont('times', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 31, 56);
  doc.text(content.editor_in_chief_name || 'Dr. Ajay Babu', 67.5, 171, { align: 'center' });
  doc.setFont('times', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Editor-in-Chief, Editorial Council', 67.5, 176, { align: 'center' });

  // Right: Managing Editor
  doc.line(pageWidth - 95, 165, pageWidth - 40, 165);
  doc.setFont('times', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 31, 56);
  doc.text('Editorial Board Secretariat', pageWidth - 67.5, 171, { align: 'center' });
  doc.setFont('times', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Director of Academic Affairs', pageWidth - 67.5, 176, { align: 'center' });

  return doc.output('datauristring');
}

/**
 * Creates an official COPE Plagiarism & Originality Declaration PDF
 */
export function generatePlagiarismDeclarationPdf(content: JournalContent): string {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  // Masthead
  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 31, 56);
  doc.text(content.journal_name.toUpperCase(), margin, 16);

  doc.setFont('times', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`ISSN (Online): ${content.issn_online}  |  ISSN (Print): ${content.issn_print}  |  Publisher: ${content.publisher}`, margin, 21);

  doc.setDrawColor(15, 31, 56);
  doc.setLineWidth(0.8);
  doc.line(margin, 24, pageWidth - margin, 24);

  // Title
  doc.setFont('times', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 31, 56);
  doc.text('COPE AUTHOR ORIGINALITY & PLAGIARISM DECLARATION FORM', margin, 34);

  doc.setFont('times', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Committee on Publication Ethics (COPE) Scholarly Warranty & Ethics Agreement', margin, 40);

  // Manuscript Information Box
  let y = 46;
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y, contentWidth, 30, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, y, contentWidth, 30, 'S');

  doc.setFont('times', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 31, 56);
  doc.text('Manuscript Title: ', margin + 4, y + 7);
  doc.setDrawColor(148, 163, 184);
  doc.line(margin + 34, y + 7, pageWidth - margin - 4, y + 7);

  doc.text('Author(s) Full Name: ', margin + 4, y + 15);
  doc.line(margin + 39, y + 15, pageWidth - margin - 4, y + 15);

  doc.text('Affiliation / University: ', margin + 4, y + 23);
  doc.line(margin + 42, y + 23, pageWidth - margin - 4, y + 23);

  // Clauses
  y += 37;
  doc.setFont('times', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 31, 56);
  doc.text('MANDATORY SCHOLARLY UNDERTAKINGS & ETHICAL CLAUSES:', margin, y);
  y += 6;

  const clauses = [
    {
      num: 'Clause 1',
      title: 'Originality & Plagiarism Warranty',
      body: 'The undersigned author(s) solemnly affirm that the manuscript represents wholly original scholarship, has not been published elsewhere in whole or substantial part, and contains zero uncredited verbatim or paraphrased content from third-party sources. Similarity score must strictly adhere to <= 10% threshold excluding bibliography.'
    },
    {
      num: 'Clause 2',
      title: 'Simultaneous Submission Prohibition',
      body: 'The manuscript is not currently submitted, under review, or considered for publication in any other journal, edited book, or academic conference proceedings. Multiple or redundant submission constitutes serious academic misconduct.'
    },
    {
      num: 'Clause 3',
      title: 'Attribution & Generative AI Transparency',
      body: 'All secondary data, intellectual concepts, illustrations, and empirical methodologies derived from other authors have been fully and accurately cited using standard academic conventions. Any use of generative artificial intelligence or computational assistance has been transparently disclosed in the methodology section.'
    },
    {
      num: 'Clause 4',
      title: 'Ethical Clearance & Data Integrity',
      body: 'Where human subjects or field research were involved, full institutional review board (IRB) or ethics committee approval was secured, and informed consent obtained from all respondents. Empirical datasets have not been fabricated, manipulated, or selectively excluded.'
    },
    {
      num: 'Clause 5',
      title: 'Conflict of Interest & Funding Disclosure',
      body: 'All institutional financial support, research grants, and potential commercial or professional conflicts of interest have been comprehensively disclosed in the author notes section.'
    }
  ];

  clauses.forEach((cl) => {
    doc.setFont('times', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(180, 83, 9);
    doc.text(`${cl.num}: ${cl.title}`, margin, y);
    y += 4.5;
    doc.setFont('times', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    const bodyLines = doc.splitTextToSize(cl.body, contentWidth);
    doc.text(bodyLines, margin, y);
    y += (bodyLines.length * 4) + 3;
  });

  // Signature Block
  y += 4;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.rect(margin, y, contentWidth, 32, 'S');
  doc.setFont('times', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 31, 56);
  doc.text('Corresponding Author Signature: _______________________', margin + 6, y + 10);
  doc.text('Date: ____ / ____ / 2026', pageWidth - margin - 45, y + 10);
  doc.text('Co-Author Signature (if applicable): ___________________', margin + 6, y + 22);
  doc.text('Place: __________________', pageWidth - margin - 45, y + 22);

  // Footer
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, pageHeight - 16, pageWidth - margin, pageHeight - 16);

  doc.setFont('times', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Official COPE Declaration Form   ${content.journal_name}`, margin, pageHeight - 10);
  doc.text('Return signed scan to secretariat', pageWidth - margin, pageHeight - 10, { align: 'right' });

  return doc.output('datauristring');
}

/**
 * Creates a standard PDF wrapper for custom uploaded documents
 */
export function generateCustomDocumentPdf(title: string, description: string, content: JournalContent): string {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  // Header
  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 31, 56);
  doc.text(content.journal_name.toUpperCase(), margin, 16);

  doc.setFont('times', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`ISSN (Online): ${content.issn_online}  |  ISSN (Print): ${content.issn_print}`, margin, 21);

  doc.setDrawColor(15, 31, 56);
  doc.setLineWidth(0.8);
  doc.line(margin, 24, pageWidth - margin, 24);

  // Title
  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 31, 56);
  const titleLines = doc.splitTextToSize(title.toUpperCase(), contentWidth);
  doc.text(titleLines, margin, 36);

  let y = 36 + (titleLines.length * 7);
  doc.setFont('times', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Official Editorial Guideline & Policy Document   Contemporary Horizons in Social Sciences & Humanities', margin, y);
  y += 8;

  // Description
  doc.setFont('times', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  const descLines = doc.splitTextToSize(description, contentWidth);
  doc.text(descLines, margin, y);
  y += (descLines.length * 6) + 12;

  // Policy Guarantee Box
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y, contentWidth, 30, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, y, contentWidth, 30, 'S');

  doc.setFont('times', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 31, 56);
  doc.text('Editorial Council Institutional Authentication', margin + 5, y + 8);

  doc.setFont('times', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  const guaranteeLines = doc.splitTextToSize(
    'This document has been formally reviewed, ratified, and published to the journal document repository by the Editorial Secretariat. It constitutes an official policy mandate governing research conduct, double-blind peer review ethics, and manuscript repository standards.',
    contentWidth - 10
  );
  doc.text(guaranteeLines, margin + 5, y + 15);

  // Footer
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, pageHeight - 16, pageWidth - margin, pageHeight - 16);

  doc.setFont('times', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Official Document   ${content.journal_name}`, margin, pageHeight - 10);
  doc.text('Page 1 of 1', pageWidth - margin, pageHeight - 10, { align: 'right' });

  return doc.output('datauristring');
}
