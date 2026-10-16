import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  Packer,
  Header,
  Footer,
  PageNumber
} from 'docx';
import { JournalContent, Article, JournalUploadedAsset } from '../types';
import {
  generateCoverPagePdf,
  generateManuscriptTemplatePdf,
  generateTableOfContentsPdf,
  generatePublicationCertificatePdf,
  generatePlagiarismDeclarationPdf,
  generateCustomDocumentPdf
} from './pdfGenerators';

export function isValidDocxBase64(dataUrlOrBase64: string | undefined): boolean {
  if (!dataUrlOrBase64) return false;
  const b64 = dataUrlOrBase64.includes('base64,')
    ? dataUrlOrBase64.split('base64,')[1]
    : dataUrlOrBase64;
  return b64.trim().startsWith('UEsDB');
}

export function isHtmlPayload(dataUrlOrText: string | undefined): boolean {
  if (!dataUrlOrText) return false;
  if (dataUrlOrText.includes('data:text/html') || dataUrlOrText.includes('data:application/msword;charset=utf-8,<') || dataUrlOrText.includes('data:application/msword,<')) {
    return true;
  }
  const b64 = dataUrlOrText.includes('base64,')
    ? dataUrlOrText.split('base64,')[1]
    : dataUrlOrText;
  try {
    const sample = atob(b64.slice(0, 100)).toLowerCase();
    return sample.includes('<!doctype') || sample.includes('<html') || sample.includes('<div');
  } catch {
    return false;
  }
}

export function triggerDataUrlDownload(dataUrl: string, filename: string) {
  if (!dataUrl) return;

  if (dataUrl.startsWith('blob:') || dataUrl.startsWith('http:') || dataUrl.startsWith('https:')) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.setAttribute('download', filename);
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  try {
    const parts = dataUrl.split(',');
    const mimeMatch = parts[0]?.match(/:(.*?);/);
    let mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';

    const lowerName = filename.toLowerCase();
    if (lowerName.endsWith('.pdf')) {
      mimeType = 'application/pdf';
    } else if (lowerName.endsWith('.docx')) {
      mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    } else if (lowerName.endsWith('.doc')) {
      mimeType = 'application/msword';
    }

    const base64Data = parts[1] || parts[0];
    const byteCharacters = atob(base64Data);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      byteArrays.push(new Uint8Array(byteNumbers));
    }
    const blob = new Blob(byteArrays, { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 3000);
  } catch {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

export async function getOrGenerateValidDocument(
  asset: JournalUploadedAsset,
  content: JournalContent,
  articles: Article[],
  targetFormat: 'docx' | 'pdf' | 'auto' = 'auto'
): Promise<{ dataUrl: string; fileName: string; isRepaired: boolean }> {
  const originalFileName = asset.fileName || `${asset.id}.docx`;
  const existingData = asset.fileDataUrl || '';
  const isExistingPdf =
    existingData.startsWith('data:application/pdf') ||
    existingData.includes('JVBERi') ||
    originalFileName.toLowerCase().endsWith('.pdf');
  const isExistingDocx = isValidDocxBase64(existingData);

  if (targetFormat === 'pdf') {
    if (isExistingPdf && existingData) {
      const pdfName = originalFileName.toLowerCase().endsWith('.pdf')
        ? originalFileName
        : originalFileName.replace(/\.(docx|doc)$/i, '') + '.pdf';
      return { dataUrl: existingData, fileName: pdfName, isRepaired: false };
    }

    let pdfDataUrl = '';
    const baseName = originalFileName.replace(/\.(docx|doc|pdf)$/i, '');
    let pdfFileName = `${baseName}.pdf`;

    if (asset.id === 'cover_page' || asset.id.includes('cover')) {
      pdfDataUrl = generateCoverPagePdf(content);
      pdfFileName = `${content.journal_short_name}_Vol7_Issue1_Cover_Page.pdf`;
    } else if (asset.id === 'author_template' || asset.id.includes('template')) {
      pdfDataUrl = generateManuscriptTemplatePdf(content);
      pdfFileName = `${content.journal_short_name}_Official_Manuscript_Template_2026.pdf`;
    } else if (asset.id === 'content_page' || asset.id.includes('content') || asset.id.includes('toc')) {
      pdfDataUrl = generateTableOfContentsPdf(content, articles);
      pdfFileName = `${content.journal_short_name}_Vol7_Issue1_Table_of_Contents.pdf`;
    } else if (asset.id === 'certificate_template' || asset.id.includes('certificate')) {
      pdfDataUrl = generatePublicationCertificatePdf({}, content);
      pdfFileName = `${content.journal_short_name}_Publication_Certificate_Master.pdf`;
    } else if (asset.id === 'plagiarism_declaration' || asset.id.includes('plagiarism')) {
      pdfDataUrl = generatePlagiarismDeclarationPdf(content);
      pdfFileName = `${content.journal_short_name}_COPE_Plagiarism_Declaration_Form.pdf`;
    } else {
      pdfDataUrl = generateCustomDocumentPdf(asset.title || 'Editorial Document', asset.description || '', content);
      pdfFileName = `${baseName}.pdf`;
    }
    return { dataUrl: pdfDataUrl, fileName: pdfFileName, isRepaired: true };
  }

  if (targetFormat === 'docx') {
    if (isExistingDocx && existingData) {
      const docxName = originalFileName.toLowerCase().endsWith('.docx')
        ? originalFileName
        : originalFileName.replace(/\.(pdf|doc)$/i, '') + '.docx';
      return { dataUrl: existingData, fileName: docxName, isRepaired: false };
    }

    let freshDocxDataUrl = '';
    const baseName = originalFileName.replace(/\.(docx|doc|pdf)$/i, '');
    let standardFileName = `${baseName}.docx`;

    if (asset.id === 'author_template' || asset.id.includes('template')) {
      freshDocxDataUrl = await generateManuscriptTemplateDocx(content);
      standardFileName = `${content.journal_short_name}_Official_Manuscript_Template_2026.docx`;
    } else if (asset.id === 'plagiarism_declaration' || asset.id.includes('plagiarism')) {
      freshDocxDataUrl = await generatePlagiarismDeclarationDocx(content);
      standardFileName = `${content.journal_short_name}_COPE_Plagiarism_Declaration_Form.docx`;
    } else if (asset.id === 'content_page' || asset.id.includes('content') || asset.id.includes('toc')) {
      freshDocxDataUrl = await generateTableOfContentsDocx(content, articles);
      standardFileName = `${content.journal_short_name}_Vol7_Issue1_Table_of_Contents.docx`;
    } else if (asset.id === 'cover_page' || asset.id.includes('cover')) {
      freshDocxDataUrl = await generateCoverPageDocx(content);
      standardFileName = `${content.journal_short_name}_Vol7_Issue1_Cover_Page.docx`;
    } else if (asset.id === 'certificate_template' || asset.id.includes('certificate')) {
      freshDocxDataUrl = await generatePublicationCertificateDocx(content);
      standardFileName = `${content.journal_short_name}_Publication_Certificate_Master.docx`;
    } else {
      freshDocxDataUrl = await generateManuscriptTemplateDocx(content);
    }

    return {
      dataUrl: freshDocxDataUrl,
      fileName: standardFileName,
      isRepaired: true
    };
  }

  if (isExistingDocx || (isExistingPdf && existingData)) {
    return { dataUrl: existingData, fileName: originalFileName, isRepaired: false };
  }

  if (existingData && !isHtmlPayload(existingData)) {
    return { dataUrl: existingData, fileName: originalFileName, isRepaired: false };
  }

  if (originalFileName.toLowerCase().endsWith('.pdf')) {
    return getOrGenerateValidDocument(asset, content, articles, 'pdf');
  }

  return getOrGenerateValidDocument(asset, content, articles, 'docx');
}

export async function docxToDataUrl(doc: Document): Promise<string> {
  const base64 = await Packer.toBase64String(doc);
  return `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${base64}`;
}

export async function generateManuscriptTemplateDocx(content: JournalContent): Promise<string> {
  const doc = new Document({
    creator: content.journal_name,
    title: `${content.journal_short_name} Author Manuscript Submission Template`,
    description: 'Official double-blind compliant scholarly manuscript formatting template',
    styles: {
      default: {
        document: {
          run: {
            font: 'Times New Roman',
            size: 24,
            color: '1E293B'
          },
          paragraph: {
            spacing: {
              line: 360,
              after: 160
            }
          }
        }
      }
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440
            }
          }
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: `${content.journal_name.toUpperCase()}   ISSN (Online): ${content.issn_online}`,
                    size: 18,
                    color: '64748B',
                    italics: true
                  })
                ]
              })
            ]
          })
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'Page ',
                    size: 18,
                    color: '64748B'
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 18,
                    color: '64748B'
                  }),
                  new TextRun({
                    text: ' of ',
                    size: 18,
                    color: '64748B'
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    size: 18,
                    color: '64748B'
                  })
                ]
              })
            ]
          })
        },
        children: [
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 12, color: '1C355E' },
              bottom: { style: BorderStyle.SINGLE, size: 12, color: '1C355E' },
              left: { style: BorderStyle.SINGLE, size: 24, color: '1C355E' },
              right: { style: BorderStyle.SINGLE, size: 12, color: '1C355E' }
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: 'F8FAFC' },
                    margins: { top: 180, bottom: 180, left: 240, right: 240 },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: content.journal_name.toUpperCase(),
                            bold: true,
                            size: 26,
                            color: '1C355E'
                          })
                        ]
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `ISSN (Online): ${content.issn_online} | ISSN (Print): ${content.issn_print} | DOI Prefix: ${content.doi_prefix}`,
                            size: 20,
                            color: '475569'
                          })
                        ]
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: 'Official Author Manuscript Submission Template (Double-Blind Peer Review Format)',
                            bold: true,
                            italics: true,
                            size: 20,
                            color: 'B45309'
                          })
                        ]
                      })
                    ]
                  })
                ]
              })
            ]
          }),
          new Paragraph({ spacing: { before: 240, after: 120 } }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 140 },
            children: [
              new TextRun({
                text: '[INSERT MANUSCRIPT TITLE HERE IN TITLE CASE]',
                bold: true,
                size: 32,
                color: '0F172A'
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 60, after: 280 },
            children: [
              new TextRun({
                text: '[IMPORTANT FOR DOUBLE-BLIND PEER REVIEW: Omit author names, institutional affiliations, contact emails, and direct self-citations from this manuscript file. Author credentials must only be entered via the online submission portal or a separate title page.]',
                italics: true,
                size: 19,
                color: '64748B'
              })
            ]
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 8, color: 'CBD5E1' },
              bottom: { style: BorderStyle.SINGLE, size: 8, color: 'CBD5E1' },
              left: { style: BorderStyle.SINGLE, size: 24, color: '1C355E' },
              right: { style: BorderStyle.SINGLE, size: 8, color: 'CBD5E1' }
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: 'F1F5F9' },
                    margins: { top: 160, bottom: 160, left: 200, right: 200 },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: 'ABSTRACT: ',
                            bold: true,
                            color: '1C355E'
                          }),
                          new TextRun({
                            text: 'Provide a structured scholarly abstract of 200 250 words synthesizing the context, primary theoretical objectives, empirical/analytical methodology, core analytical findings, and substantive contributions to contemporary humanities and social science discourse. Do not include unreferenced abbreviations or citations in the abstract.',
                            size: 22
                          })
                        ]
                      }),
                      new Paragraph({
                        spacing: { before: 120 },
                        children: [
                          new TextRun({
                            text: 'Keywords: ',
                            bold: true,
                            color: '1C355E'
                          }),
                          new TextRun({
                            text: 'Keyword 1; Keyword 2; Keyword 3; Keyword 4; Keyword 5 (4 6 scholarly keywords separated by semicolons)',
                            italics: true,
                            size: 22
                          })
                        ]
                      })
                    ]
                  })
                ]
              })
            ]
          }),
          new Paragraph({ spacing: { before: 300, after: 100 } }),
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({
                text: '1. INTRODUCTION',
                bold: true,
                size: 26,
                color: '1C355E'
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Articulate the research problem and situate the inquiry within contemporary scholarship. State the core questions and research objectives. Summarize theoretical significance and provide a clear roadmap of the paper.'
              })
            ]
          }),
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 240, after: 100 },
            children: [
              new TextRun({
                text: '2. THEORETICAL FRAMEWORK & LITERATURE REVIEW',
                bold: true,
                size: 26,
                color: '1C355E'
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Engage with relevant canonical and cutting-edge scholarship. Identify the epistemic gap this manuscript addresses and define your operationalized conceptual lenses.'
              })
            ]
          }),
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 240, after: 100 },
            children: [
              new TextRun({
                text: '3. METHODOLOGY & EMPIRICAL DESIGN',
                bold: true,
                size: 26,
                color: '1C355E'
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Provide rigorous, replicable descriptions of research design, data collection protocols, corpus sampling, ethnographic observations, statistical regressions, or qualitative coding paradigms. State institutional ethics board approvals where applicable.'
              })
            ]
          }),
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 240, after: 100 },
            children: [
              new TextRun({
                text: '4. RESULTS & ANALYSIS',
                bold: true,
                size: 26,
                color: '1C355E'
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Present analytical findings with clarity. All tables and figures should be referenced in-text (e.g., "see Table 1") and provided with descriptive captions.'
              })
            ]
          }),
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 240, after: 100 },
            children: [
              new TextRun({
                text: '5. DISCUSSION & SCHOLARLY CONTRIBUTIONS',
                bold: true,
                size: 26,
                color: '1C355E'
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Interpret findings in direct conversation with the theoretical framework outlined in Section 2. Discuss pedagogical, institutional, cultural, or philosophical ramifications.'
              })
            ]
          }),
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 240, after: 100 },
            children: [
              new TextRun({
                text: '6. CONCLUSION & POLICY IMPLICATIONS',
                bold: true,
                size: 26,
                color: '1C355E'
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Summarize key findings without redundant repetition. Acknowledge study limitations transparently and suggest generative avenues for future inquiry.'
              })
            ]
          }),
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 240, after: 100 },
            children: [
              new TextRun({
                text: 'DECLARATIONS & COMPLIANCE',
                bold: true,
                size: 26,
                color: '1C355E'
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '  Funding Disclosure: ', bold: true }),
              new TextRun({ text: '[State funding agencies and grant numbers or declare "No funding received"].' })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '  Conflict of Interest: ', bold: true }),
              new TextRun({ text: 'The authors declare no competing interests.' })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '  AI Attribution: ', bold: true }),
              new TextRun({ text: '[State use of generative AI tools according to COPE policies or "No AI tools utilized"].' })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '  Data Availability: ', bold: true }),
              new TextRun({ text: 'Data generated or analyzed in this study are available upon reasonable request from the authors.' })
            ]
          }),
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 240, after: 100 },
            children: [
              new TextRun({
                text: 'REFERENCES (APA 7th Edition Style)',
                bold: true,
                size: 26,
                color: '1C355E'
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Bourdieu, P. (1984). Distinction: A Social Critique of the Judgement of Taste. Harvard University Press.'
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Foucault, M. (1977). Discipline and Punish: The Birth of the Prison. Pantheon Books.'
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Habermas, J. (1989). The Structural Transformation of the Public Sphere. MIT Press.'
              })
            ]
          })
        ]
      }
    ]
  });
  return await docxToDataUrl(doc);
}

export async function generatePlagiarismDeclarationDocx(content: JournalContent): Promise<string> {
  const doc = new Document({
    creator: content.journal_name,
    title: 'COPE Author Plagiarism & Originality Declaration',
    description: 'Committee on Publication Ethics compliant warranty and originality certificate',
    styles: {
      default: {
        document: {
          run: { font: 'Times New Roman', size: 24, color: '1E293B' },
          paragraph: { spacing: { line: 320, after: 140 } }
        }
      }
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
          }
        },
        children: [
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 12, color: '047857' },
              bottom: { style: BorderStyle.SINGLE, size: 12, color: '047857' },
              left: { style: BorderStyle.SINGLE, size: 24, color: '047857' },
              right: { style: BorderStyle.SINGLE, size: 12, color: '047857' }
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: 'F0FDF4' },
                    margins: { top: 160, bottom: 160, left: 240, right: 240 },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: content.journal_name.toUpperCase(),
                            bold: true,
                            size: 26,
                            color: '047857'
                          })
                        ]
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: 'Committee on Publication Ethics (COPE) Compliant Integrity & Originality Protocol',
                            size: 20,
                            color: '065F46',
                            italics: true
                          })
                        ]
                      })
                    ]
                  })
                ]
              })
            ]
          }),
          new Paragraph({ spacing: { before: 240, after: 120 } }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'AUTHOR ORIGINALITY & PLAGIARISM DECLARATION FORM',
                bold: true,
                size: 28,
                color: '0F172A'
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: '(Mandatory warranty to be executed by corresponding and contributing authors)',
                italics: true,
                size: 20,
                color: '64748B'
              })
            ]
          }),
          new Paragraph({ spacing: { before: 180, after: 100 } }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 6, color: 'CBD5E1' },
              bottom: { style: BorderStyle.SINGLE, size: 6, color: 'CBD5E1' },
              left: { style: BorderStyle.SINGLE, size: 6, color: 'CBD5E1' },
              right: { style: BorderStyle.SINGLE, size: 6, color: 'CBD5E1' }
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    shading: { fill: 'F8FAFC' },
                    margins: { top: 120, bottom: 120, left: 140, right: 140 },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Manuscript Title:', bold: true })] })]
                  }),
                  new TableCell({
                    width: { size: 70, type: WidthType.PERCENTAGE },
                    margins: { top: 120, bottom: 120, left: 140, right: 140 },
                    children: [new Paragraph({ children: [new TextRun({ text: '[Insert Complete Manuscript Title Here]' })] })]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: 'F8FAFC' },
                    margins: { top: 120, bottom: 120, left: 140, right: 140 },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Authors & Affiliations:', bold: true })] })]
                  }),
                  new TableCell({
                    margins: { top: 120, bottom: 120, left: 140, right: 140 },
                    children: [new Paragraph({ children: [new TextRun({ text: '[List all author names, institutional departments, and emails]' })] })]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: 'F8FAFC' },
                    margins: { top: 120, bottom: 120, left: 140, right: 140 },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Tracking / ID Code:', bold: true })] })]
                  }),
                  new TableCell({
                    margins: { top: 120, bottom: 120, left: 140, right: 140 },
                    children: [new Paragraph({ children: [new TextRun({ text: 'CHSSH-2026-XXXX' })] })]
                  })
                ]
              })
            ]
          }),
          new Paragraph({ spacing: { before: 240, after: 120 } }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'WARRANTIES & ETHICAL UNDERTAKINGS:',
                bold: true,
                size: 24,
                color: '1C355E'
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '1. Originality: ', bold: true }),
              new TextRun({
                text: 'The undersigned author(s) affirm that the submitted work is entirely original, created solely by the designated authors, and free of plagiarism, fabrication, falsification, or uncredited quotation.'
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '2. Similarity Threshold: ', bold: true }),
              new TextRun({
                text: 'The manuscript complies with the journal benchmark evaluated via Crossref iThenticate / Turnitin with overall text similarity not exceeding 15% (excluding references and formulas).'
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '3. Exclusive Submission: ', bold: true }),
              new TextRun({
                text: 'The article has neither been published previously nor is under active concurrent consideration or review in any other peer-reviewed journal, conference proceeding, or book.'
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '4. AI Disclosure: ', bold: true }),
              new TextRun({
                text: 'All use of AI technologies in research conception, drafting, data computation, or translation is transparently cited in the manuscript acknowledgments section.'
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '5. Open Access CC BY 4.0: ', bold: true }),
              new TextRun({
                text: 'The author(s) grant permanent worldwide open-access publication rights under Creative Commons Attribution 4.0 International license.'
              })
            ]
          }),
          new Paragraph({ spacing: { before: 300, after: 100 } }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 8, color: 'CBD5E1' },
              bottom: { style: BorderStyle.SINGLE, size: 8, color: 'CBD5E1' },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE }
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    margins: { top: 200, bottom: 200, left: 100, right: 100 },
                    children: [
                      new Paragraph({ children: [new TextRun({ text: 'Corresponding Author Signature:', bold: true })] }),
                      new Paragraph({ spacing: { before: 240 }, children: [new TextRun({ text: '____________________________________' })] }),
                      new Paragraph({ spacing: { before: 60 }, children: [new TextRun({ text: 'Print Name: ' })] })
                    ]
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    margins: { top: 200, bottom: 200, left: 100, right: 100 },
                    children: [
                      new Paragraph({ children: [new TextRun({ text: 'Date of Execution:', bold: true })] }),
                      new Paragraph({ spacing: { before: 240 }, children: [new TextRun({ text: '____________________ (DD/MM/YYYY)' })] }),
                      new Paragraph({ spacing: { before: 60 }, children: [new TextRun({ text: 'Institutional Email: ' })] })
                    ]
                  })
                ]
              })
            ]
          })
        ]
      }
    ]
  });
  return await docxToDataUrl(doc);
}

export async function generateTableOfContentsDocx(content: JournalContent, articles: Article[]): Promise<string> {
  const publishedArticles = articles.filter((a) => a.status === 'published');
  const articleRows = publishedArticles.map((art, idx) => {
    return new TableRow({
      children: [
        new TableCell({
          width: { size: 8, type: WidthType.PERCENTAGE },
          margins: { top: 120, bottom: 120, left: 120, right: 120 },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: `${idx + 1}`, bold: true })]
            })
          ]
        }),
        new TableCell({
          width: { size: 76, type: WidthType.PERCENTAGE },
          margins: { top: 120, bottom: 120, left: 120, right: 120 },
          children: [
            new Paragraph({
              children: [new TextRun({ text: art.title, bold: true, size: 24, color: '0F172A' })]
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Authors: ${art.authors.map((a) => a.name).join(', ')}`,
                  size: 20,
                  color: '475569'
                })
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `DOI: https://doi.org/${art.doi || `${content.doi_prefix}.2026.${art.trackingId.replace(/[^0-9]/g, '')}`}`,
                  size: 18,
                  color: '1C355E',
                  italics: true
                })
              ]
            })
          ]
        }),
        new TableCell({
          width: { size: 16, type: WidthType.PERCENTAGE },
          margins: { top: 120, bottom: 120, left: 120, right: 120 },
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({
                  text: `pp. ${art.pages || `${idx * 22 + 1} ${idx * 22 + 22}`}`,
                  bold: true,
                  size: 20,
                  color: '475569'
                })
              ]
            })
          ]
        })
      ]
    });
  });

  const doc = new Document({
    creator: content.journal_name,
    title: `${content.journal_short_name} Volume 7 Issue 1 Table of Contents`,
    styles: {
      default: {
        document: {
          run: { font: 'Times New Roman', size: 24, color: '1E293B' },
          paragraph: { spacing: { line: 320, after: 120 } }
        }
      }
    },
    sections: [
      {
        properties: {
          page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } }
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: content.journal_name.toUpperCase(),
                bold: true,
                size: 28,
                color: '1C355E'
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `VOLUME 7   ISSUE 1   2026 | ISSN (Online): ${content.issn_online}`,
                bold: true,
                size: 20,
                color: 'B45309'
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'TABLE OF CONTENTS & EDITORIAL PRELIMINARIES',
                size: 22,
                color: '475569'
              })
            ]
          }),
          new Paragraph({ spacing: { before: 200, after: 120 } }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 8, color: 'CBD5E1' },
              bottom: { style: BorderStyle.SINGLE, size: 8, color: 'CBD5E1' },
              left: { style: BorderStyle.SINGLE, size: 18, color: 'B45309' },
              right: { style: BorderStyle.SINGLE, size: 8, color: 'CBD5E1' }
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: 'F8FAFC' },
                    margins: { top: 140, bottom: 140, left: 180, right: 180 },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'Editorial Foreword: ', bold: true, color: '1C355E' }),
                          new TextRun({ text: content.current_issue_description, italics: true })
                        ]
                      }),
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                          new TextRun({
                            text: `  ${content.editor_in_chief_name}, Editor-in-Chief`,
                            bold: true,
                            size: 20,
                            color: '475569'
                          })
                        ]
                      })
                    ]
                  })
                ]
              })
            ]
          }),
          new Paragraph({ spacing: { before: 200, after: 100 } }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'PUBLISHED RESEARCH ARTICLES',
                bold: true,
                size: 24,
                color: '1C355E'
              })
            ]
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 12, color: '1C355E' },
              bottom: { style: BorderStyle.SINGLE, size: 12, color: '1C355E' },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 6, color: 'E2E8F0' },
              insideVertical: { style: BorderStyle.NONE }
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: '1C355E' },
                    margins: { top: 100, bottom: 100, left: 100, right: 100 },
                    children: [new Paragraph({ children: [new TextRun({ text: '#', bold: true, color: 'FFFFFF' })] })]
                  }),
                  new TableCell({
                    shading: { fill: '1C355E' },
                    margins: { top: 100, bottom: 100, left: 100, right: 100 },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Article Title & Metadata', bold: true, color: 'FFFFFF' })] })]
                  }),
                  new TableCell({
                    shading: { fill: '1C355E' },
                    margins: { top: 100, bottom: 100, left: 100, right: 100 },
                    children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Pages', bold: true, color: 'FFFFFF' })] })]
                  })
                ]
              }),
              ...articleRows
            ]
          })
        ]
      }
    ]
  });
  return await docxToDataUrl(doc);
}

export async function generateCoverPageDocx(content: JournalContent): Promise<string> {
  const doc = new Document({
    creator: content.journal_name,
    title: `${content.journal_short_name} Volume 7 Issue 1 Cover Page`,
    sections: [
      {
        properties: {
          page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } }
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `ISSN (Online): ${content.issn_online} | ISSN (Print): ${content.issn_print}`,
                size: 20,
                color: '64748B'
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 100 },
            children: [
              new TextRun({
                text: content.journal_name.toUpperCase(),
                bold: true,
                size: 36,
                color: '1C355E'
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: content.journal_tagline,
                italics: true,
                size: 24,
                color: 'B45309'
              })
            ]
          }),
          new Paragraph({ spacing: { before: 300, after: 150 } }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 18, color: '1C355E' },
              bottom: { style: BorderStyle.SINGLE, size: 18, color: '1C355E' },
              left: { style: BorderStyle.SINGLE, size: 18, color: '1C355E' },
              right: { style: BorderStyle.SINGLE, size: 18, color: '1C355E' }
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: 'F8FAFC' },
                    margins: { top: 240, bottom: 240, left: 240, right: 240 },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: 'VOLUME 7   ISSUE 1   2026',
                            bold: true,
                            size: 30,
                            color: '0F172A'
                          })
                        ]
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 80 },
                        children: [
                          new TextRun({
                            text: 'Thematic Issue: Epistemic Horizons & Algorithmic Culture in Contemporary Societies',
                            italics: true,
                            size: 22,
                            color: '475569'
                          })
                        ]
                      })
                    ]
                  })
                ]
              })
            ]
          }),
          new Paragraph({ spacing: { before: 400, after: 100 } }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `Publisher: ${content.publisher}   Gold Open Access (CC BY 4.0)`,
                size: 20,
                color: '64748B'
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `Editor-in-Chief: ${content.editor_in_chief_name}`,
                bold: true,
                size: 20,
                color: '1C355E'
              })
            ]
          })
        ]
      }
    ]
  });
  return await docxToDataUrl(doc);
}

export async function generatePublicationCertificateDocx(content: JournalContent): Promise<string> {
  const doc = new Document({
    creator: content.journal_name,
    title: 'Accredited Publication Certificate Master',
    sections: [
      {
        properties: {
          page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } }
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'ACCREDITED SCHOLARLY CREDENTIAL',
                bold: true,
                size: 22,
                color: 'B45309'
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 120, after: 100 },
            children: [
              new TextRun({
                text: content.journal_name.toUpperCase(),
                bold: true,
                size: 32,
                color: '1C355E'
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'CERTIFICATE OF SCHOLARLY PUBLICATION',
                bold: true,
                size: 26,
                color: '0F172A'
              })
            ]
          }),
          new Paragraph({ spacing: { before: 240, after: 100 } }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'This official credential certifies that the manuscript titled:',
                size: 22,
                color: '475569'
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 100 },
            children: [
              new TextRun({
                text: '"[Insert Manuscript Title Here]"',
                bold: true,
                italics: true,
                size: 26,
                color: '1C355E'
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'authored by [Author Name(s) & Institutional Affiliation] has been subjected to rigorous double-blind peer review and permanently archived in the official repository under international Crossref DOI indexing.',
                size: 22
              })
            ]
          }),
          new Paragraph({ spacing: { before: 300, after: 100 } }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 8, color: 'B45309' },
              bottom: { style: BorderStyle.SINGLE, size: 8, color: 'B45309' },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE }
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    margins: { top: 160, bottom: 160, left: 100, right: 100 },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: `Publisher: ${content.publisher}`, bold: true, size: 20 }),
                          new TextRun({ text: `\nISSN (Online): ${content.issn_online}`, size: 18 })
                        ]
                      })
                    ]
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    margins: { top: 160, bottom: 160, left: 100, right: 100 },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                          new TextRun({ text: `Editor-in-Chief: ${content.editor_in_chief_name}`, bold: true, size: 20 }),
                          new TextRun({ text: '\nGold Open Access   Permanent DOI Archived', size: 18 })
                        ]
                      })
                    ]
                  })
                ]
              })
            ]
          })
        ]
      }
    ]
  });
  return await docxToDataUrl(doc);
}
