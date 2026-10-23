export type ArticleStatus =
  | 'submitted'
  | 'under_review'
  | 'revision_requested'
  | 'accepted'
  | 'published'
  | 'rejected';

export interface Author {
  id: string;
  name: string;
  email: string;
  affiliation: string;
  country: string;
  isCorresponding: boolean;
  orcid?: string;
  phone?: string;
}

export interface AuthorAccount {
  id: string;
  userId: string; // User ID used for login
  password: string; // Account password
  name: string; // Full Academic Name
  phone: string; // Phone number used for credential retrieval
  email: string; // Registered Email
  affiliation: string; // Academic Institution / Affiliation
  country?: string;
  orcid?: string;
  createdAt: string;
  submittedArticleIds?: string[];
}

export interface Article {
  id: string;
  trackingId: string;
  authorUserId?: string; // Links submission to logged-in AuthorAccount
  title: string;
  abstract: string;
  keywords: string[];
  track: string;
  authors: Author[];
  status: ArticleStatus;
  submissionDate: string;
  lastUpdatedDate: string;
  fileName?: string;
  fileSize?: string;
  fileDataUrl?: string;
  fileUrl?: string;
  coverLetter?: string;
  conflictOfInterest?: boolean;
  editorialNotes?: string;
  reviewerComments?: string[];
  // Publication metadata if published
  volume?: number;
  issue?: number;
  year?: number;
  pages?: string;
  doi?: string;
  publishedDate?: string;
  downloadsCount?: number;
  viewsCount?: number;
  // Final Formatted / Typeset Paper uploaded by Editor in Journal Template
  publishedFileName?: string;
  publishedFileSize?: string;
  publishedFileDataUrl?: string;
  publishedFileUrl?: string;
  publishedFileType?: string;
  publishedUploadedAt?: string;
  // Firebase Storage canonical fields
  storagePath?: string;
  downloadURL?: string;
  mimeType?: string;
  fileSizeBytes?: number;
  originalFileName?: string;
  publishedStoragePath?: string;
  publishedDownloadURL?: string;
  publishedMimeType?: string;
  // Reviewer assignment & editorial tracking
  assignedReviewerId?: string;
  assignedReviewerName?: string;
  revisionInstructions?: string;
  storageStatus?: 'stored_locally' | 'cloud_synced' | 'pending';
  // Google Drive integration fields
  driveUrl?: string;
  driveFileId?: string;
  driveFolderId?: string;
  driveUploadStatus?: 'pending' | 'uploaded' | 'failed';
  driveUploadError?: string;
  driveUploadedAt?: string;
  driveResourceType?: 'pdf' | 'document' | 'spreadsheet' | 'presentation' | 'drive_file' | string;
  coverImage?: string;
}

export interface JournalVolume {
  id: string;
  volumeNumber: number;
  year: number;
  title?: string;
  description?: string;
  coverImage?: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface JournalIssue {
  id: string;
  volumeId: string;
  volumeNumber: number;
  issueNumber: number;
  year: number;
  title: string;
  publicationDate: string;
  coverImage?: string;
  editorialPdfUrl?: string;
  editorialPdfName?: string;
  tableOfContentsSummary?: string;
  articleIds: string[];
  status: 'draft' | 'published' | 'archived';
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EditorialMember {
  id: string;
  name: string;
  role: string;
  affiliation: string;
  country: string;
  expertise: string;
  email?: string;
  imageUrl?: string;
}

export type AdvisoryCategory = 'international' | 'scientific' | 'honorary' | 'policy';

export type JournalPalette = 'oxford' | 'cambridge' | 'cypress' | 'prussian';

export interface PaletteInfo {
  id: JournalPalette;
  name: string;
  subtitle: string;
  institutionInspiration: string;
  primaryColor: string;
  accentColor: string;
  canvasLight: string;
  canvasDark: string;
  description: string;
}

export interface AdvisoryBoardMember {
  id: string;
  name: string;
  role: string;
  affiliation: string;
  country: string;
  expertise: string;
  email?: string;
  imageUrl?: string;
  orcid?: string;
  bio?: string;
  category?: AdvisoryCategory;
  order?: number;
}

export type ReviewerStatus = 'pending' | 'accepted' | 'rejected';

export interface Reviewer {
  id: string;
  name: string;
  title?: string;
  email: string;
  affiliation: string;
  country: string;
  track: string;
  expertise: string;
  orcid?: string;
  bioStatement?: string;
  status: ReviewerStatus;
  appliedDate: string;
  reviewedDate?: string;
  adminNotes?: string;
  imageUrl?: string;
}

export type JournalAssetCategory = 'cover' | 'content_page' | 'template' | 'certificate' | 'plagiarism' | 'document' | 'logo';

export interface JournalUploadedAsset {
  id: 'cover_page' | 'content_page' | 'author_template' | 'certificate_template' | 'plagiarism_declaration' | 'journal_logo' | string;
  title: string;
  description: string;
  category: JournalAssetCategory;
  fileName: string;
  fileSize: string;
  fileType: string;
  fileDataUrl?: string; // Data URL for client-side download & preview
  fileUrl?: string;     // External or cloud hosted link
  downloadURL?: string; // Firebase Storage download URL
  storagePath?: string; // Firebase Storage object path
  totalParts?: number;  // Number of parts stored for large files
  chunkPrefix?: string; // Chunk document prefix in database
  storageType?: 'firebase_storage' | 'firestore_cloud' | 'local';
  status?: 'active' | 'archived' | 'inactive';
  uploadedAt: string;
  uploadedBy?: string;
  version?: string;
  volumeInfo?: string;
  isUploaded?: boolean;
  driveUrl?: string;
  driveFileId?: string;
  driveResourceType?: string;
}

export interface JournalContent {
  // Index signature for dynamic access
  [key: string]: string;
  // Masthead & Metadata
  journal_name: string;
  journal_short_name: string;
  journal_tagline: string;
  issn_online: string;
  issn_print: string;
  doi_prefix: string;
  frequency: string;
  publisher: string;
  editor_in_chief_name: string;
  editor_in_chief_title: string;
  editor_in_chief_badge: string;
  editor_in_chief_tenure: string;
  editor_in_chief_quote: string;
  // Header & Navigation
  header_badge: string;
  header_established: string;
  header_access_badge: string;
  header_submit_btn: string;
  nav_home: string;
  nav_current: string;
  nav_archive: string;
  nav_aims: string;
  nav_guidelines: string;
  nav_editorial: string;
  nav_reviewers: string;
  nav_submit: string;
  nav_track: string;
  nav_downloads: string;
  nav_admin: string;
  // Hero Section
  hero_eyebrow: string;
  hero_title: string;
  hero_subtitle: string;
  hero_cta_submit: string;
  hero_cta_explore: string;
  hero_cta_downloads: string;
  call_for_papers_badge: string;
  call_for_papers_tag: string;
  call_for_papers_title: string;
  call_for_papers_desc: string;
  call_for_papers_deadline: string;
  call_for_papers_cta: string;
  home_latest_badge: string;
  home_latest_title: string;
  home_latest_view_all: string;
  home_filter_label: string;
  // Impact & Stats
  stat_impact_factor: string;
  stat_impact_title: string;
  stat_impact_desc: string;
  stat_impact_badge: string;
  stat_acceptance_rate: string;
  stat_acceptance_title: string;
  stat_acceptance_desc: string;
  stat_acceptance_badge: string;
  stat_review_time: string;
  stat_review_title: string;
  stat_review_desc: string;
  stat_review_badge: string;
  stat_open_access: string;
  stat_open_access_title: string;
  stat_open_access_desc: string;
  stat_open_access_badge: string;
  // Current Issue
  current_issue_badge: string;
  current_issue_date_note: string;
  current_issue_heading: string;
  current_issue_description: string;
  current_issue_folio_label: string;
  current_issue_folio_vol: string;
  current_issue_folio_sub: string;
  current_issue_folio_badge: string;
  current_issue_toc_title: string;
  current_issue_toc_subtitle: string;
  current_issue_search_placeholder: string;
  article_btn_read_cite: string;
  article_btn_download_pdf: string;
  // Archive & Search
  archive_badge: string;
  archive_title: string;
  archive_description: string;
  archive_search_placeholder: string;
  archive_filter_all_tracks: string;
  archive_results_found: string;
  archive_no_results: string;
  // Aims & Scope
  aims_badge: string;
  aims_title: string;
  aims_subtitle: string;
  aims_p1: string;
  aims_p2: string;
  aims_clusters_heading: string;
  aims_scope_areas: string;
  aims_card1_title: string;
  aims_card1_desc: string;
  aims_card2_title: string;
  aims_card2_desc: string;
  aims_card3_title: string;
  aims_card3_desc: string;
  aims_cta_prompt: string;
  aims_cta_btn: string;
  // Guidelines
  guidelines_badge: string;
  guidelines_title: string;
  guidelines_subtitle: string;
  guidelines_prep_heading: string;
  guidelines_prep_text: string;
  guidelines_format_heading: string;
  guidelines_format_text: string;
  guidelines_ethics_heading: string;
  guidelines_ethics_text: string;
  guidelines_fee_heading: string;
  guidelines_fee_text: string;
  // Peer Review Process
  review_policy_title: string;
  review_policy_desc: string;
  review_step1_title: string;
  review_step1_desc: string;
  review_step2_title: string;
  review_step2_desc: string;
  review_step3_title: string;
  review_step3_desc: string;
  review_step4_title: string;
  review_step4_desc: string;
  guidelines_cta_prompt: string;
  guidelines_cta_btn: string;
  // Editorial Board
  board_badge: string;
  board_title: string;
  board_subtitle: string;
  board_members_heading: string;
  board_members_subheading: string;
  // Track Submission
  track_badge: string;
  track_title: string;
  track_description: string;
  track_input_placeholder: string;
  track_btn_label: string;
  track_demo_label: string;
  track_step1_label: string;
  track_step1_desc: string;
  track_step2_label: string;
  track_step2_desc: string;
  track_step3_label: string;
  track_step3_desc: string;
  track_step4_label: string;
  track_step4_desc: string;
  track_step5_label: string;
  track_step5_desc: string;
  track_notes_heading: string;
  track_reviews_heading: string;
  // Submission Portal
  submit_badge: string;
  submit_title: string;
  submit_description: string;
  submit_step1_tab: string;
  submit_step2_tab: string;
  submit_step3_tab: string;
  submit_step4_tab: string;
  submit_step1_heading: string;
  submit_step2_heading: string;
  submit_step3_heading: string;
  submit_step4_heading: string;
  submit_success_title: string;
  submit_success_msg: string;
  submit_next_steps_heading: string;
  submit_next_steps_desc: string;
  // Article Modal
  modal_folio_heading: string;
  modal_abstract_heading: string;
  modal_keywords_heading: string;
  modal_cite_heading: string;
  modal_copy_citation_btn: string;
  modal_download_btn: string;
  modal_license_text: string;
  // Indexing & Archiving
  indexing_title: string;
  indexing_subtitle: string;
  indexing_partners: string;
  // Contact & Office
  contact_title: string;
  contact_email: string;
  contact_phone: string;
  contact_office: string;
  contact_hours: string;
  footer_copyright: string;
  footer_ethics_note: string;
  // Downloads & Repository Section
  downloads_badge: string;
  downloads_title: string;
  downloads_subtitle: string;
  downloads_stat_badge: string;
  downloads_filter_all: string;
  downloads_filter_templates: string;
  downloads_filter_certificates: string;
  downloads_filter_issues: string;
  downloads_help_title: string;
  downloads_help_desc: string;
  downloads_help_cta: string;
  // Specific Download Items
  item_cover_title: string;
  item_cover_desc: string;
  item_cover_badge: string;
  item_template_title: string;
  item_template_desc: string;
  item_template_badge: string;
  item_toc_title: string;
  item_toc_desc: string;
  item_toc_badge: string;
  item_cert_title: string;
  item_cert_desc: string;
  item_cert_badge: string;
  item_plagiarism_title: string;
  item_plagiarism_desc: string;
  item_plagiarism_badge: string;
}
