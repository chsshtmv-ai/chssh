import React, { useState, useEffect } from 'react';
import { useJournal } from '../context/JournalContext';
import { Author } from '../types';
import {
  Send,
  UploadCloud,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  User,
  Users,
  Plus,
  Trash2,
  Lock,
  ArrowRight,
  ArrowLeft,
  FileText,
  ShieldCheck,
  ExternalLink,
  LogIn
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { detectDocumentFormat } from '../utils/documentHelpers';

const ACADEMIC_TRACKS = [
  'Political Economy & Global Governance',
  'Cultural Studies & Critical Theory',
  'Digital Humanities & AI Ethics',
  'Sociology of Labor & Social Movements',
  'Environmental Ethics & Spatial Justice',
  'Media Ecology & Public Discourse',
  'Philosophy of Mind & Cognitive Epistemology'
];

export const SubmitManuscript: React.FC = () => {
  const {
    submitManuscript,
    setActiveTab,
    currentAuthor,
    isAuthorLoggedIn,
    openAuthorAuthModal
  } = useJournal();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [copiedTrackingId, setCopiedTrackingId] = useState(false);
  const [submittedArticle, setSubmittedArticle] = useState<{ trackingId: string; title: string } | null>(null);

  // Form State - Step 1: Metadata
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [track, setTrack] = useState(ACADEMIC_TRACKS[0]);
  const [keywordInput, setKeywordInput] = useState('');
  const [keywords, setKeywords] = useState<string[]>(['Social Theory', 'Critical Policy']);

  // Step 2: Authors
  const [authors, setAuthors] = useState<Author[]>([
    {
      id: 'auth-1',
      name: currentAuthor?.name || '',
      email: currentAuthor?.email || '',
      affiliation: currentAuthor?.affiliation || '',
      country: currentAuthor?.country || '',
      isCorresponding: true,
      orcid: currentAuthor?.orcid || ''
    }
  ]);

  // Step 3: File & Declarations
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: string;
    dataUrl: string;
    type: string;
  } | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [conflictOfInterest, setConflictOfInterest] = useState(false);
  const [originalityDeclared, setOriginalityDeclared] = useState(false);
  const [anonymityChecked, setAnonymityChecked] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync author if logged in
  useEffect(() => {
    if (isAuthorLoggedIn && currentAuthor && (!authors[0].name || authors[0].name === '')) {
      setAuthors([
        {
          id: 'auth-1',
          name: currentAuthor.name,
          email: currentAuthor.email,
          affiliation: currentAuthor.affiliation,
          country: currentAuthor.country || '',
          isCorresponding: true,
          orcid: currentAuthor.orcid || ''
        }
      ]);
    }
  }, [isAuthorLoggedIn, currentAuthor]);

  const addKeyword = () => {
    const trimmed = keywordInput.trim();
    if (trimmed && !keywords.includes(trimmed)) {
      setKeywords([...keywords, trimmed]);
      setKeywordInput('');
    }
  };

  const removeKeyword = (kw: string) => {
    setKeywords(keywords.filter((k) => k !== kw));
  };

  const addCoAuthor = () => {
    setAuthors([
      ...authors,
      {
        id: `auth-${Date.now()}`,
        name: '',
        email: '',
        affiliation: '',
        country: '',
        isCorresponding: false,
        orcid: ''
      }
    ]);
  };

  const removeAuthor = (id: string) => {
    if (authors.length > 1) {
      setAuthors(authors.filter((a) => a.id !== id));
    }
  };

  const updateAuthorField = (id: string, field: keyof Author, value: any) => {
    setAuthors(
      authors.map((a) => {
        if (a.id === id) {
          return { ...a, [field]: value };
        }
        return a;
      })
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      setError('File exceeds maximum upload size (50MB).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
      setUploadedFile({
        name: file.name,
        size: sizeMb,
        dataUrl,
        type: file.type || 'application/octet-stream'
      });
      setError(null);
    };
    reader.onerror = () => {
      setError('Failed to read the file.');
    };
    reader.readAsDataURL(file);
  };

  const validateStep1 = () => {
    if (!title.trim()) return 'Manuscript title is required.';
    if (title.trim().length < 10) return 'Title should be at least 10 characters.';
    if (!abstract.trim()) return 'Abstract is required.';
    if (abstract.trim().split(/\s+/).length < 30) return 'Abstract should contain at least 30 words.';
    if (keywords.length < 2) return 'Please add at least 2 keywords.';
    return null;
  };

  const validateStep2 = () => {
    const primary = authors[0];
    if (!primary.name.trim() || !primary.email.trim() || !primary.affiliation.trim()) {
      return 'Please complete the Corresponding Author details (Name, Email, Affiliation).';
    }
    for (let i = 1; i < authors.length; i++) {
      if (!authors[i].name.trim() || !authors[i].email.trim()) {
        return `Please fill in Name and Email for Co-Author #${i + 1}.`;
      }
    }
    return null;
  };

  const validateStep3 = () => {
    if (!uploadedFile) return 'Please upload your manuscript file (DOCX or PDF).';
    if (!originalityDeclared) return 'You must certify that this manuscript is original and not under review elsewhere.';
    if (!anonymityChecked) return 'You must confirm that the file is prepared for double-blind review (no author names in text).';
    return null;
  };

  const handleNext = () => {
    setError(null);
    if (step === 1) {
      const err = validateStep1();
      if (err) {
        setError(err);
        return;
      }
      setStep(2);
    } else if (step === 2) {
      const err = validateStep2();
      if (err) {
        setError(err);
        return;
      }
      setStep(3);
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateStep3();
    if (err) {
      setError(err);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const newArticle = submitManuscript({
        title: title.trim(),
        abstract: abstract.trim(),
        keywords,
        track,
        authors,
        fileName: uploadedFile?.name,
        fileSize: uploadedFile?.size,
        fileDataUrl: uploadedFile?.dataUrl,
        coverLetter: coverLetter.trim(),
        conflictOfInterest
      });

      setSubmittedArticle({
        trackingId: newArticle.trackingId,
        title: newArticle.title
      });
      setStep(4);
    } catch {
      setError('An error occurred while submitting your manuscript. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyTrackingId = () => {
    if (submittedArticle) {
      navigator.clipboard.writeText(submittedArticle.trackingId);
      setCopiedTrackingId(true);
      setTimeout(() => setCopiedTrackingId(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1c355e] dark:text-sky-400 uppercase tracking-widest">
              <Send className="w-3.5 h-3.5" />
              <span>Editorial Submission Desk</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-slate-100">
              Submit a Scholarly Manuscript
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Double-blind peer review system for original research articles, conceptual syntheses, and review essays.
            </p>
          </div>

          {!isAuthorLoggedIn ? (
            <button
              type="button"
              onClick={() => openAuthorAuthModal('Sign in to link this submission to your Author Account')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-stone-700 bg-slate-50 dark:bg-stone-800 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-stone-700 transition-colors cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-[#102344] dark:text-sky-400" />
              <span>Author Sign In / Register</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Signed in as <strong>{currentAuthor?.name}</strong></span>
            </div>
          )}
        </div>

        {/* Steps Breadcrumbs */}
        {step < 4 && (
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 dark:border-stone-800 text-xs">
            <div
              className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                step === 1
                  ? 'border-[#102344] dark:border-sky-500 bg-[#102344]/5 dark:bg-sky-500/10 text-[#102344] dark:text-sky-300 font-semibold'
                  : step > 1
                  ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400'
                  : 'border-slate-200 dark:border-stone-800 text-slate-400'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-[11px]">1</span>
              <span>Metadata &amp; Abstract</span>
            </div>
            <div
              className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                step === 2
                  ? 'border-[#102344] dark:border-sky-500 bg-[#102344]/5 dark:bg-sky-500/10 text-[#102344] dark:text-sky-300 font-semibold'
                  : step > 2
                  ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400'
                  : 'border-slate-200 dark:border-stone-800 text-slate-400'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-[11px]">2</span>
              <span>Author Affiliations</span>
            </div>
            <div
              className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                step === 3
                  ? 'border-[#102344] dark:border-sky-500 bg-[#102344]/5 dark:bg-sky-500/10 text-[#102344] dark:text-sky-300 font-semibold'
                  : 'border-slate-200 dark:border-stone-800 text-slate-400'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-[11px]">3</span>
              <span>Upload &amp; Certify</span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Step 1: Metadata */}
      {step === 1 && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 p-6 sm:p-8 space-y-6 shadow-xs">
          <h2 className="text-lg font-serif font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-stone-800 pb-3">
            Step 1: Manuscript Overview &amp; Abstract
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                Manuscript Full Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Critical Perspectives on Algorithmic Governance in Emerging Public Sector Frameworks"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#102344]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Subject Track / Domain *
                </label>
                <select
                  value={track}
                  onChange={(e) => setTrack(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-slate-100"
                >
                  {ACADEMIC_TRACKS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Keywords (at least 2) *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addKeyword();
                      }
                    }}
                    placeholder="Type keyword and press Enter"
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={addKeyword}
                    className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-stone-800 hover:bg-slate-200 dark:hover:bg-stone-700 font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Keyword tags */}
            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {keywords.map((kw) => (
                  <span
                    key={kw}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-stone-800 text-slate-700 dark:text-slate-300 text-xs"
                  >
                    <span>{kw}</span>
                    <button
                      type="button"
                      onClick={() => removeKeyword(kw)}
                      className="hover:text-red-500 cursor-pointer"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-800 dark:text-slate-200">
                  Abstract (150–300 words recommended) *
                </label>
                <span className="text-[11px] text-slate-400">
                  {abstract.trim() ? abstract.trim().split(/\s+/).length : 0} words
                </span>
              </div>
              <textarea
                rows={6}
                value={abstract}
                onChange={(e) => setAbstract(e.target.value)}
                placeholder="State the objective, theoretical framework, methodology, empirical findings, and scholarly contributions of your study..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-slate-100 leading-relaxed font-sans"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-stone-800">
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#102344] hover:bg-[#1a386c] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <span>Continue to Authors</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Authors */}
      {step === 2 && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-stone-800 pb-3">
            <h2 className="text-lg font-serif font-bold text-slate-900 dark:text-slate-100">
              Step 2: Authors &amp; Institutional Affiliations
            </h2>
            <button
              type="button"
              onClick={addCoAuthor}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-stone-700 bg-slate-50 dark:bg-stone-800 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Co-Author</span>
            </button>
          </div>

          <div className="space-y-5 text-xs">
            {authors.map((author, index) => (
              <div
                key={author.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-stone-800 bg-slate-50/50 dark:bg-stone-800/30 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-[#102344] dark:text-sky-400" />
                    <span>{index === 0 ? 'Primary / Corresponding Author' : `Co-Author #${index + 1}`}</span>
                  </span>
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeAuthor(author.id)}
                      className="text-red-500 hover:text-red-700 cursor-pointer p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1">Full Academic Name *</label>
                    <input
                      type="text"
                      value={author.name}
                      onChange={(e) => updateAuthorField(author.id, 'name', e.target.value)}
                      placeholder="e.g. Dr. Arthur Pendelton"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1">Academic Email *</label>
                    <input
                      type="email"
                      value={author.email}
                      onChange={(e) => updateAuthorField(author.id, 'email', e.target.value)}
                      placeholder="author@university.edu"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1">Institutional Affiliation *</label>
                    <input
                      type="text"
                      value={author.affiliation}
                      onChange={(e) => updateAuthorField(author.id, 'affiliation', e.target.value)}
                      placeholder="e.g. Department of Sociology, University of Edinburgh"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 mb-1">Country</label>
                      <input
                        type="text"
                        value={author.country}
                        onChange={(e) => updateAuthorField(author.id, 'country', e.target.value)}
                        placeholder="e.g. UK"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 mb-1">ORCID iD</label>
                      <input
                        type="text"
                        value={author.orcid}
                        onChange={(e) => updateAuthorField(author.id, 'orcid', e.target.value)}
                        placeholder="0000-0002-..."
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-slate-100 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-stone-800">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 dark:border-stone-700 text-slate-600 dark:text-slate-300 text-xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#102344] hover:bg-[#1a386c] text-white text-xs font-semibold shadow-xs cursor-pointer"
            >
              <span>Continue to File Upload</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: File Upload & Declarations */}
      {step === 3 && (
        <form onSubmit={handleFinalSubmit} className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 p-6 sm:p-8 space-y-6 shadow-xs">
          <h2 className="text-lg font-serif font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-stone-800 pb-3">
            Step 3: Anonymized Manuscript Upload &amp; Ethical Declarations
          </h2>

          <div className="space-y-5 text-xs">
            {/* File drop area */}
            <div className="p-6 border-2 border-dashed border-slate-300 dark:border-stone-700 rounded-xl bg-slate-50/50 dark:bg-stone-800/40 text-center space-y-3">
              <UploadCloud className="w-10 h-10 mx-auto text-[#102344] dark:text-sky-400" />
              <div className="space-y-1">
                <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                  Upload Anonymized Manuscript (DOCX or PDF)
                </p>
                <p className="text-slate-500 dark:text-slate-400">
                  Ensure all author names, email addresses, and institution names are removed from the file body.
                </p>
              </div>

              <input
                type="file"
                id="manuscript-file-input"
                accept=".docx,.doc,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label
                htmlFor="manuscript-file-input"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#102344] text-white font-medium hover:bg-[#1a386c] cursor-pointer"
              >
                <span>Select Document File</span>
              </label>

              {uploadedFile && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 mt-2">
                  <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-medium">{uploadedFile.name}</span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400">({uploadedFile.size})</span>
                </div>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                Confidential Letter to the Editor (Optional)
              </label>
              <textarea
                rows={3}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Mention scholarly background, relevance to current debates, or suggested non-conflicted reviewers..."
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            {/* Declarations */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-stone-800 bg-slate-50 dark:bg-stone-800/40 space-y-3">
              <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                Ethical Assurances &amp; Declarations
              </span>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={originalityDeclared}
                  onChange={(e) => setOriginalityDeclared(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-[#102344]"
                />
                <span className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  I certify that this submission is original scholarship, has not been published elsewhere, and is not currently under consideration by another journal.
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={anonymityChecked}
                  onChange={(e) => setAnonymityChecked(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-[#102344]"
                />
                <span className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  I confirm that all identifying author and institution data have been stripped from the manuscript file to preserve double-blind integrity.
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={conflictOfInterest}
                  onChange={(e) => setConflictOfInterest(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-[#102344]"
                />
                <span className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  Check here if any authors have a potential commercial or personal conflict of interest to declare.
                </span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-stone-800">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 dark:border-stone-700 text-slate-600 dark:text-slate-300 text-xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#102344] hover:bg-[#1a386c] text-white text-xs font-semibold shadow-xs cursor-pointer"
            >
              <Send className="w-4 h-4 text-amber-400" />
              <span>{isSubmitting ? 'Submitting Manuscript...' : 'Complete Manuscript Submission'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Step 4: Submission Confirmation */}
      {step === 4 && submittedArticle && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 p-8 sm:p-10 space-y-6 text-center shadow-md"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-100">
              Manuscript Successfully Received
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Your paper has been deposited in the CHSSH editorial database. You can track peer review progress
              and editorial decisions using your permanent tracking code.
            </p>
          </div>

          {/* Tracking ID Badge */}
          <div className="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-stone-800/60 border border-slate-200 dark:border-stone-700 max-w-md mx-auto space-y-2">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Permanent Tracking Identifier
            </span>
            <div className="flex items-center justify-center gap-3">
              <span className="text-xl sm:text-2xl font-mono font-bold text-[#102344] dark:text-sky-300">
                {submittedArticle.trackingId}
              </span>
              <button
                type="button"
                onClick={copyTrackingId}
                className="p-1.5 rounded-lg bg-white dark:bg-stone-700 border border-slate-200 dark:border-stone-600 hover:bg-slate-50 text-slate-600 dark:text-slate-300 cursor-pointer"
                title="Copy Tracking ID"
              >
                {copiedTrackingId ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab('track');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#102344] hover:bg-[#1a386c] text-white text-xs font-semibold cursor-pointer shadow-xs"
            >
              <span>Track Submission Status Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setTitle('');
                setAbstract('');
                setUploadedFile(null);
                setSubmittedArticle(null);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-stone-700 text-slate-700 dark:text-slate-200 text-xs font-medium cursor-pointer"
            >
              <span>Submit Another Manuscript</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
