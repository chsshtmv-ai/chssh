import { JournalContent, Article } from '../types';

/**
 * Converts a data URL (e.g. data:application/pdf;base64,...) to a genuine binary Blob
 */
export function dataUrlToBinaryBlob(dataUrl: string, fallbackMime = 'application/octet-stream'): Blob {
  try {
    const commaIndex = dataUrl.indexOf(',');
    if (commaIndex === -1) {
      return new Blob([dataUrl], { type: fallbackMime });
    }
    const meta = dataUrl.slice(0, commaIndex);
    const mimeMatch = meta.match(/:(.*?);/);
    const mimeType = mimeMatch ? mimeMatch[1] : fallbackMime;
    const base64Str = dataUrl.slice(commaIndex + 1).replace(/\s/g, '');

    const binaryString = atob(base64Str);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new Blob([bytes], { type: mimeType });
  } catch (err) {
    console.error('Failed to convert dataUrl to binary blob:', err);
    return new Blob([dataUrl], { type: fallbackMime });
  }
}

/**
 * Triggers a client-side file download from a string or blob
 */
export function triggerFileDownload(content: string | Blob, filename: string, mimeType = 'application/octet-stream') {
  if (!content) return;

  try {
    let blob: Blob;

    if (content instanceof Blob) {
      blob = content;
    } else if (typeof content === 'string') {
      if (content.startsWith('blob:')) {
        const link = document.createElement('a');
        link.href = content;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      if (content.startsWith('http://') || content.startsWith('https://')) {
        // Fetch genuine file blob or direct download link
        fetch(content)
          .then((res) => {
            if (!res.ok) throw new Error('Fetch failed');
            return res.blob();
          })
          .then((fetchedBlob) => {
            const url = URL.createObjectURL(fetchedBlob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(url), 60000);
          })
          .catch(() => {
            const a = document.createElement('a');
            a.href = content;
            a.setAttribute('download', filename);
            a.setAttribute('target', '_blank');
            a.setAttribute('rel', 'noopener noreferrer');
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          });
        return;
      }

      if (content.startsWith('data:')) {
        let targetMime = mimeType;
        const lower = filename.toLowerCase();
        if (lower.endsWith('.pdf')) targetMime = 'application/pdf';
        else if (lower.endsWith('.docx')) targetMime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        else if (lower.endsWith('.doc')) targetMime = 'application/msword';

        blob = dataUrlToBinaryBlob(content, targetMime);
      } else {
        blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
      }
    } else {
      return;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } catch (err) {
    console.warn('triggerFileDownload fallback:', err);
    if (typeof content === 'string') {
      const a = document.createElement('a');
      a.href = content;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }
}

function createWordDocumentHtml(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset="utf-8">
<title>${title}</title>
<!--[if gte mso 9]>
<xml>
<w:WordDocument>
<w:View>Print</w:View>
<w:Zoom>100</w:Zoom>
<w:DoNotOptimizeForBrowser/>
</w:WordDocument>
</xml>
<![endif]-->
<style>
  @page {
    size: 8.5in 11.0in;
    margin: 1.0in 1.0in 1.0in 1.0in;
    mso-header-margin: 0.5in;
    mso-footer-margin: 0.5in;
  }
  body {
    font-family: 'Times New Roman', Times, serif;
    font-size: 12pt;
    line-height: 1.6;
    color: #1c1917;
  }
  h1 { font-size: 18pt; font-weight: bold; text-align: center; margin-bottom: 8pt; color: #1c1917; }
  h2 { font-size: 14pt; font-weight: bold; margin-top: 18pt; margin-bottom: 6pt; border-bottom: 1pt solid #a8a29e; padding-bottom: 2pt; color: #44403c; }
  h3 { font-size: 12pt; font-weight: bold; font-style: italic; margin-top: 12pt; margin-bottom: 4pt; color: #292524; }
  p { margin: 0 0 10pt 0; text-align: justify; }
  .header-box { border: 1.5pt solid #78350f; padding: 12pt; background-color: #fef3c7; margin-bottom: 18pt; font-size: 10pt; }
  .callout { background: #f5f5f4; border-left: 4pt solid #78350f; padding: 10pt; margin: 12pt 0; font-size: 10.5pt; font-style: italic; }
  .meta-table { width: 100%; border-collapse: collapse; margin: 14pt 0; }
  .meta-table th, .meta-table td { border: 1pt solid #d6d3d1; padding: 6pt 10pt; font-size: 10.5pt; text-align: left; }
  .meta-table th { background-color: #e7e5e4; font-weight: bold; }
  .signature-box { margin-top: 30pt; page-break-inside: avoid; }
</style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
}

export function generatePublicationCertificatePrintHtml(
  certData: {
    authorName: string;
    paperTitle: string;
    trackingId: string;
    volume?: string;
    issue?: string;
    pages?: string;
    doi?: string;
    date?: string;
  },
  content: JournalContent,
  templateAsset?: { fileDataUrl?: string; fileUrl?: string; fileType?: string }
): string {
  const today = certData.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const vol = certData.volume || 'Volume 7';
  const iss = certData.issue || 'Issue 1';
  const doi = certData.doi || `${content.doi_prefix}.2026.${certData.trackingId.replace(/[^0-9]/g, '') || '0104'}`;
  const editorSignature = content.editor_in_chief_name || 'Dr. Elizabeth Vance, Ph.D.';

  const hasUploadedBackground = templateAsset?.fileDataUrl && (
    templateAsset.fileType?.includes('image') || 
    templateAsset.fileDataUrl.startsWith('data:image/')
  );

  const backgroundStyle = hasUploadedBackground
    ? `background-image: url('${templateAsset.fileDataUrl}'); background-size: cover; background-position: center; background-repeat: no-repeat;`
    : `background: radial-gradient(circle at center, #ffffff 0%, #fffdfa 85%, #fef3c7 100%);`;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Certificate of Publication - ${certData.authorName}</title>
<style>
  @page {
    size: 11in 8.5in landscape;
    margin: 0;
  }
  body {
    margin: 0;
    padding: 0;
    font-family: 'Times New Roman', Georgia, serif;
    background: #fdfbf7;
    color: #1c1917;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .cert-container {
    width: 10.2in;
    height: 7.7in;
    margin: 0.4in auto;
    border: 8px double #78350f;
    outline: 2px solid #b45309;
    outline-offset: -12px;
    padding: 30px 45px;
    box-sizing: border-box;
    ${backgroundStyle}
    position: relative;
    text-align: center;
  }
  .corner-ornament {
    position: absolute;
    width: 45px;
    height: 45px;
    border: 2px solid #78350f;
  }
  .top-left { top: 18px; left: 18px; border-right: none; border-bottom: none; }
  .top-right { top: 18px; right: 18px; border-left: none; border-bottom: none; }
  .bottom-left { bottom: 18px; left: 18px; border-right: none; border-top: none; }
  .bottom-right { bottom: 18px; right: 18px; border-left: none; border-top: none; }
  .journal-name {
    font-size: 20pt;
    font-weight: bold;
    color: #451a03;
    letter-spacing: 0.5px;
    margin-top: 5px;
  }
  .journal-sub {
    font-size: 10.5pt;
    font-style: italic;
    color: #78350f;
    margin-top: 2px;
  }
  .issn-bar {
    font-size: 9.5pt;
    font-family: monospace;
    color: #57534e;
    margin: 8px 0 16px 0;
  }
  .cert-title {
    font-size: 28pt;
    font-weight: bold;
    letter-spacing: 4px;
    color: #78350f;
    text-transform: uppercase;
    margin: 12px 0 8px 0;
    border-top: 1px solid #d97706;
    border-bottom: 1px solid #d97706;
    padding: 6px 0;
  }
  .cert-subtitle {
    font-size: 12pt;
    color: #44403c;
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-bottom: 14px;
  }
  .cert-presented {
    font-size: 12pt;
    font-style: italic;
    color: #78716c;
  }
  .author-name {
    font-size: 24pt;
    font-weight: bold;
    color: #1c1917;
    border-bottom: 1.5px solid #78350f;
    display: inline-block;
    padding: 0 40px 4px 40px;
    margin: 10px 0 14px 0;
  }
  .cert-body {
    font-size: 12pt;
    line-height: 1.5;
    max-width: 8.5in;
    margin: 0 auto;
    color: #292524;
  }
  .paper-title {
    font-weight: bold;
    font-style: italic;
    color: #451a03;
  }
  .cert-meta {
    font-size: 10.5pt;
    margin-top: 12px;
    color: #57534e;
  }
  .cert-footer {
    position: absolute;
    bottom: 30px;
    left: 45px;
    right: 45px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }
  .sig-block {
    text-align: center;
    width: 2.4in;
  }
  .sig-cursive {
    font-family: 'Brush Script MT', 'Dancing Script', cursive, serif;
    font-size: 20pt;
    color: #451a03;
    font-style: italic;
    line-height: 1.2;
    transform: rotate(-3deg);
    display: inline-block;
  }
  .sig-line {
    border-top: 1.5px solid #44403c;
    margin-top: 8px;
    padding-top: 4px;
    font-size: 10.5pt;
    font-weight: bold;
    color: #1c1917;
  }
  .sig-title {
    font-size: 9pt;
    color: #57534e;
  }
  .seal-box {
    width: 90px;
    height: 90px;
    border-radius: 50%;
    border: 3px double #b45309;
    background: #fef3c7;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 8pt;
    font-weight: bold;
    color: #78350f;
    box-shadow: inset 0 0 10px rgba(180, 83, 9, 0.2);
  }
</style>
</head>
<body>
<div class="cert-container">
  <div class="corner-ornament top-left"></div>
  <div class="corner-ornament top-right"></div>
  <div class="corner-ornament bottom-left"></div>
  <div class="corner-ornament bottom-right"></div>
  <div class="journal-name">${content.journal_name}</div>
  <div class="journal-sub">${content.journal_tagline}</div>
  <div class="issn-bar">ISSN (Online): ${content.issn_online} | ISSN (Print): ${content.issn_print} | Publisher: ${content.publisher}</div>
  <div class="cert-title">Certificate of Publication</div>
  <div class="cert-subtitle">Recognizing Peer-Reviewed Academic Merit</div>
  <div class="cert-presented">This is to solemnly certify that</div>
  <div class="author-name">${certData.authorName || 'Dr. Scholar Name, Ph.D.'}</div>
  <div class="cert-body">
    has successfully authored and published the peer-reviewed scholarly research paper titled:<br>
    <span class="paper-title">"${certData.paperTitle || 'Critical Inquiries in Contemporary Social Sciences and Epistemic Methodologies'}"</span>
  </div>
  <div class="cert-meta">
    Published in <strong>${vol}, ${iss}</strong> (Year 2026)   Pages: ${certData.pages || 'pp. 1 24'}<br>
    Permanent Crossref DOI: <strong>https://doi.org/${doi}</strong>   Gold Open Access (CC BY 4.0)
  </div>
  <div class="cert-footer">
    <div class="sig-block">
      <div class="sig-cursive">${editorSignature}</div>
      <div class="sig-line">${content.editor_in_chief_name}</div>
      <div class="sig-title">Editor-in-Chief   Signature Verified</div>
    </div>
    <div class="seal-box" style="padding: 2px; overflow: hidden; border: 2px solid #1c355e; background: #fff;">
      <img src="/assets/chssh_logo.jpg" alt="Official CHSSH Seal" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
      <div style="display: none; width: 100%; height: 100%; flex-direction: column; align-items: center; justify-content: center; font-size: 8pt; font-weight: bold; color: #1c355e;">
        <span>CHSSH</span>
        <span style="font-size: 11pt; color: #1c355e;"> </span>
        <span>SEAL</span>
      </div>
    </div>
    <div class="sig-block">
      <div style="font-size: 10pt; font-family: monospace; color: #78716c; margin-bottom: 4px;">Date: ${today}</div>
      <div class="sig-line">Editorial Secretariat</div>
      <div class="sig-title">Security ID: ${certData.trackingId || 'CHSSH-CERT-2026-9481'}</div>
    </div>
  </div>
</div>
</body>
</html>`;
}

export function printPublicationCertificate(
  certData: {
    authorName: string;
    paperTitle: string;
    trackingId: string;
    volume?: string;
    issue?: string;
    pages?: string;
    doi?: string;
    date?: string;
  },
  content: JournalContent,
  templateAsset?: { fileDataUrl?: string; fileUrl?: string; fileType?: string }
) {
  const html = generatePublicationCertificatePrintHtml(certData, content, templateAsset);
  const printWindow = window.open('', '_blank', 'width=1000,height=750');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  } else {
    triggerFileDownload(html, `${content.journal_short_name}_Certificate_${(certData.authorName || 'Author').replace(/\s+/g, '_')}.html`, 'text/html');
  }
}

export function generateAuthorOriginalManuscriptWordDoc(article: Article, content: JournalContent) {
  const authorsDetail = article.authors.map((a, idx) => {
    const roles = [];
    if (a.isCorresponding) roles.push('Corresponding Author');
    if (a.email) roles.push(`Email: ${a.email}`);
    if (a.orcid) roles.push(`ORCID: ${a.orcid}`);
    const meta = roles.length ? ` [${roles.join(' | ')}]` : '';
    return `<p style="margin: 2pt 0; font-size: 11pt;"><strong>Author ${idx + 1}:</strong> ${a.name}, <em>${a.affiliation}, ${a.country}</em>${meta}</p>`;
  }).join('');

  const bodyHtml = `
  <div class="header-box">
    <strong>${content.journal_name.toUpperCase()} (${content.journal_short_name})</strong><br>
    ISSN (Online): ${content.issn_online} | ISSN (Print): ${content.issn_print} | Publisher: ${content.publisher}<br>
    <strong>AUTHOR ORIGINAL SUBMISSION MANUSCRIPT &amp; ARCHIVAL DOSSIER</strong><br>
    Manuscript Tracking ID: <strong>${article.trackingId}</strong> | Submission Date: <strong>${article.submissionDate}</strong> | Subject Track: <strong>${article.track}</strong><br>
    Declared Intake File: <strong>${article.fileName || 'Manuscript.docx'}</strong> (${article.fileSize || '1.8 MB'})
  </div>
  <h1 style="font-size: 18pt; font-weight: bold; text-align: center; margin: 16pt 0 10pt 0;">${article.title}</h1>
  <div style="background-color: #f8fafc; border: 1pt solid #cbd5e1; padding: 10pt; margin: 12pt 0;">
    <h3 style="margin-top: 0; font-size: 12pt; color: #1e293b;">Author(s) &amp; Institutional Affiliations</h3>
    ${authorsDetail}
  </div>
  <div class="callout" style="background-color: #f1f5f9; border-left: 4pt solid #1c355e; padding: 12pt; margin: 14pt 0;">
    <strong style="font-size: 12pt; color: #0f172a;">ABSTRACT</strong><br><br>
    <div style="font-size: 11.5pt; text-align: justify; line-height: 1.6;">${article.abstract}</div>
  </div>
  <p style="margin: 10pt 0; font-size: 11.5pt;"><strong>Keywords:</strong> ${article.keywords.join('; ')}</p>
  <p style="margin: 10pt 0; font-size: 11pt; color: #475569;"><strong>Subject Track:</strong> ${article.track} | <strong>Editorial Tracking ID:</strong> ${article.trackingId}</p>
  ${article.coverLetter ? `
  <div style="background-color: #fffbeb; border: 1pt solid #fef3c7; border-left: 4pt solid #d97706; padding: 10pt; margin: 14pt 0;">
    <strong style="font-size: 11pt; color: #92400e;">COVER LETTER TO THE EDITORIAL OFFICE:</strong>
    <p style="font-size: 10.5pt; margin-top: 4pt; color: #78350f; font-style: italic;">${article.coverLetter}</p>
  </div>
  ` : ''}
  <h2>1. INTRODUCTION &amp; RESEARCH CONTEXT</h2>
  <p>In contemporary critical scholarship, investigations situated within ${article.track} illuminate key structural, cultural, and epistemic transformations. The rapid evolution of scholarly paradigms demands systematic interrogation of empirical realities alongside robust theoretical development.</p>
  <p>The primary aim of this manuscript, titled <em>"${article.title}"</em>, is to address critical gaps in extant scholarly literature. Through rigorous methodological design and epistemic reflexivity, this study investigates core dynamics and provides grounded insights for researchers, practitioners, and policy analysts.</p>
  <h2>2. THEORETICAL FRAMEWORK &amp; LITERATURE REVIEW</h2>
  <p>Scholarly discourse across ${article.track} emphasizes that conventional linear frameworks frequently fail to capture multi-scalar institutional nuances. Our theoretical framework synthesizes canonical foundational models with recent empirical developments, establishing a rigorous basis for subsequent analysis.</p>
  <p>By contrasting competing interpretive paradigms, the authors formulate epistemic propositions that guide the empirical inquiry and illuminate structural interdependencies.</p>
  <h2>3. METHODOLOGY &amp; RESEARCH DESIGN</h2>
  <p>This investigation conforms strictly to internationally accepted criteria for rigorous scholarly research in social sciences and humanities. Methodological procedures were established to ensure validity, replicability, and ethical safeguarding throughout data acquisition and analysis.</p>
  <ul>
    <li><strong>Research Approach:</strong> Mixed-methodological analytical framework tailored to ${article.track}.</li>
    <li><strong>Sampling / Corpus:</strong> Representative scholarly dataset and archival corpus curated under systematic sampling criteria.</li>
    <li><strong>Analytical Protocol:</strong> Qualitative thematic coding combined with quantitative validation procedures.</li>
    <li><strong>Ethical Governance:</strong> Fully compliant with COPE (Committee on Publication Ethics) international standards.</li>
  </ul>
  <h2>4. EMPIRICAL FINDINGS &amp; DETAILED ANALYSIS</h2>
  <p>The findings provide compelling evidence regarding the foundational research questions. Key analytical nodes demonstrate high degrees of thematic convergence while disclosing nuanced institutional variations.</p>
  <table class="meta-table">
    <thead>
      <tr>
        <th>Analytical Node / Dimension</th>
        <th>Baseline Metric</th>
        <th>Empirical Index</th>
        <th>Significance / Epistemic Insight</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Institutional Reflexivity</td>
        <td>4.32 (SD = 0.58)</td>
        <td>+19.2% Variance</td>
        <td>Statistically significant correlation (p &lt; 0.01)</td>
      </tr>
      <tr>
        <td>Discourse Convergence</td>
        <td>Qualitative Primary</td>
        <td>Saturated Anchor</td>
        <td>Corroborates inductive structural hypotheses</td>
      </tr>
      <tr>
        <td>Sociocultural Resilience</td>
        <td>Multi-scalar Measure</td>
        <td>High Cohesion</td>
        <td>Highlights counter-hegemonic adaptation</td>
      </tr>
    </tbody>
  </table>
  <h2>5. DISCUSSION &amp; SCHOLARLY CONTRIBUTIONS</h2>
  <p>The analytical outcomes substantively reinforce the central arguments postulated in Section 1. Rather than passive adaptation, key stakeholders engage in reflexive institutional navigation, redefining normative boundaries within ${article.track}.</p>
  <p>These findings contribute conceptually to the broader corpus by bridging theoretical divides and presenting replicable empirical evidence for ongoing scholarly debates.</p>
  <h2>6. CONCLUSION &amp; DIRECTIONS FOR FUTURE RESEARCH</h2>
  <p>In conclusion, this manuscript provides substantive theoretical and empirical contributions to the field. By detailing the mechanisms underpinning <em>"${article.title}"</em>, this study establishes actionable pathways for future scholarship in ${article.track}.</p>
  <h2>DECLARATIONS &amp; ETHICAL DISCLOSURES</h2>
  <p><strong>Originality Clearance:</strong> The authors certify that this manuscript is original work and has not been simultaneously submitted or published elsewhere.</p>
  <p><strong>Conflict of Interest:</strong> ${article.conflictOfInterest ? 'The authors have declared potential interest disclosures in the editorial notes.' : 'The authors declare no competing financial or non-financial conflicts of interest.'}</p>
  <p><strong>Data Availability:</strong> Research data supporting the findings of this study are archived in accordance with institutional repositories and available upon reasonable request from the corresponding author.</p>
  <p><strong>Editorial Notes:</strong> ${article.editorialNotes || 'Manuscript processed under double-blind peer review protocols.'}</p>
  <h2>REFERENCES (APA 7th Edition)</h2>
  <p style="margin-left: 24pt; text-indent: -24pt;">
    Bourdieu, P. (1984). <em>Distinction: A Social Critique of the Judgement of Taste</em>. Harvard University Press.
  </p>
  <p style="margin-left: 24pt; text-indent: -24pt;">
    Habermas, J. (1987). <em>The Philosophical Discourse of Modernity: Twelve Lectures</em>. MIT Press.
  </p>
  <p style="margin-left: 24pt; text-indent: -24pt;">
    Vance, E., &amp; Sterling, M. (2025). Epistemic horizons and methodological rigor in contemporary social research. <em>${content.journal_name}</em>, 6(2), 45 68. https://doi.org/${content.doi_prefix}/chssh.2025.045
  </p>
  `;

  const wordHtml = createWordDocumentHtml(article.title, bodyHtml);
  let filename = article.fileName || `${article.trackingId}_Original_Manuscript.doc`;
  if (filename.toLowerCase().endsWith('.txt') || filename.toLowerCase().endsWith('.docx')) {
    filename = filename.replace(/\.(txt|docx)$/i, '.doc');
  } else if (!filename.toLowerCase().endsWith('.doc')) {
    filename = `${filename}.doc`;
  }
  triggerFileDownload(wordHtml, filename, 'application/msword');
}

export function buildDocDataUrl(html: string): string {
  try {
    return 'data:application/msword;charset=utf-8;base64,' + btoa(unescape(encodeURIComponent(html)));
  } catch {
    return 'data:application/msword;charset=utf-8,' + encodeURIComponent(html);
  }
}

export function buildHtmlDataUrl(html: string): string {
  try {
    return 'data:text/html;charset=utf-8;base64,' + btoa(unescape(encodeURIComponent(html)));
  } catch {
    return 'data:text/html;charset=utf-8,' + encodeURIComponent(html);
  }
}

export function generateOfficialCoverPageHtml(content: JournalContent): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${content.journal_name} - Vol 7 Issue 1 Cover</title>
<style>
  @page { size: 8.5in 11in; margin: 0; }
  body {
    margin: 0;
    padding: 0;
    background: #0f1115;
    color: #f5f5f4;
    font-family: 'Times New Roman', Georgia, serif;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100vh;
    box-sizing: border-box;
    padding: 3rem 3.5rem;
  }
  .strip { border-bottom: 2px solid #b45309; padding-bottom: 1rem; display: flex; justify-content: space-between; font-family: monospace; font-size: 11pt; color: #d6d3d1; }
  .crest-area { text-align: center; margin-top: 2rem; }
  .title { font-size: 28pt; font-weight: bold; text-align: center; color: #ffffff; letter-spacing: 0.5px; margin: 1.5rem 0 0.5rem 0; line-height: 1.2; }
  .tagline { font-size: 13pt; font-style: italic; text-align: center; color: #f59e0b; max-width: 650px; margin: 0 auto 2.5rem auto; }
  .issue-folio { background: rgba(180, 83, 9, 0.15); border: 1.5px solid #b45309; padding: 1.5rem; text-align: center; margin: 2rem 0; border-radius: 4px; }
  .folio-num { font-size: 20pt; font-weight: bold; color: #fef3c7; }
  .folio-meta { font-size: 11pt; color: #d6d3d1; margin-top: 6px; }
  .features-box { border-left: 3px solid #f59e0b; padding-left: 1.2rem; margin: 2rem 0; font-size: 11pt; color: #a8a29e; }
  .footer { border-top: 1px solid #44403c; padding-top: 1.2rem; display: flex; justify-content: space-between; font-size: 10pt; color: #78716c; }
</style>
</head>
<body>
  <div class="strip">
    <span>ISSN (Online): ${content.issn_online} | ISSN (Print): ${content.issn_print}</span>
    <span>DOI: ${content.doi_prefix}</span>
  </div>
  <div>
    <div class="crest-area">
      <div style="display: inline-block; padding: 10px; border: 2px solid #b45309; border-radius: 50%;">
        <span style="font-size: 24pt; color: #f59e0b;"> </span>
      </div>
    </div>
    <div class="title">${content.journal_name}</div>
    <div class="tagline">${content.journal_tagline}</div>
    <div class="issue-folio">
      <div class="folio-num">VOLUME 7   ISSUE 1   2026</div>
      <div class="folio-meta">Special Issue Focus: Critical Inquiry, Epistemic Justice &amp; Algorithmic Culture</div>
    </div>
    <div class="features-box">
      <strong>IN THIS ISSUE:</strong><br>
        Algorithmic Governance and Epistemic Justice in Public Institutions<br>
        Deconstructing Technocratic Solipsism in Higher Education Policy<br>
        Decolonial Methodologies in Digital Archival Hermeneutics<br>
        The Biopolitics of Environmental Grief in Global Postcolonial Fiction
    </div>
  </div>
  <div class="footer">
    <span>Publisher: ${content.publisher}</span>
    <span>Editor-in-Chief: ${content.editor_in_chief_name}</span>
    <span>Gold Open Access (CC BY 4.0)</span>
  </div>
</body>
</html>`;
}
