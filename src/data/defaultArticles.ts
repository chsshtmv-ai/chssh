import { Article, EditorialMember } from '../types';

export const initialArticles: Article[] = [
  {
    id: "art-1",
    trackingId: "CHSSH-2025-0104",
    authorUserId: "dr_elena",
    title: "Algorithmic Governmentality and the Reconstruction of Public Space in Post-Digital Cities",
    abstract: "This paper critically examines how smart-city surveillance frameworks and predictive policing infrastructures fundamentally reconfigure public spatial interaction. Drawing on field interviews with urban planners, municipal authorities, and community activists across four European metropolitan areas, we trace the transition from communicative citizen assemblies to data-driven spatial optimization. The findings reveal emergent topologies of exclusion and propose participatory epistemic design principles for reclaiming democratic urban commons.",
    keywords: ["Urban Sociology", "Algorithmic Governance", "Smart Cities", "Public Sphere", "Surveillance Studies"],
    track: "Sociology & Social Theory",
    authors: [
      {
        id: "auth-1",
        name: "Dr. Marcus Halvorsen",
        email: "m.halvorsen@kth.se",
        affiliation: "Department of Urban & Regional Studies, KTH Royal Institute of Technology",
        country: "Sweden",
        isCorresponding: true,
        orcid: "0000-0002-8419-3321"
      },
      {
        id: "auth-2",
        name: "Elena Rostova, Ph.D.",
        email: "e.rostova@uva.nl",
        affiliation: "Institute for Social Science Research, University of Amsterdam",
        country: "Netherlands",
        isCorresponding: false,
        orcid: "0000-0001-9032-1144"
      }
    ],
    status: "published",
    submissionDate: "2025-09-12",
    lastUpdatedDate: "2026-01-15",
    volume: 7,
    issue: 1,
    year: 2026,
    pages: "1 24",
    doi: "10.5281/chssh.2026.7101",
    publishedDate: "2026-01-20",
    downloadsCount: 1420,
    viewsCount: 3890,
    fileName: "Halvorsen_Algorithmic_Public_Space_2026.pdf",
    fileSize: "1.4 MB"
  },
  {
    id: "art-2",
    trackingId: "CHSSH-2025-0118",
    authorUserId: "marcus_thorne",
    title: "Narratives of Ecological Mourning: Postcolonial Eco-Criticism in Caribbean Diasporic Literature",
    abstract: "Focusing on the intersections of environmental degradation, colonial plantation legacies, and climate displacement, this article explores how contemporary Caribbean diasporic writers construct aesthetic modes of grief and regeneration. Through textual analysis of recent prose and poetic collections, we identify 'counter-archives of bereavement' that resist extractive capitalist idioms while envisioning restorative communal futures.",
    keywords: ["Postcolonial Studies", "Eco-Criticism", "Caribbean Literature", "Environmental Humanities", "Affect Theory"],
    track: "Cultural Studies & Critical Theory",
    authors: [
      {
        id: "auth-3",
        name: "Prof. Amara K. Braithwaite",
        email: "amara.braithwaite@sta.uwi.edu",
        affiliation: "Faculty of Humanities and Education, University of the West Indies",
        country: "Trinidad and Tobago",
        isCorresponding: true,
        orcid: "0000-0003-1284-904X"
      }
    ],
    status: "published",
    submissionDate: "2025-10-04",
    lastUpdatedDate: "2026-02-02",
    volume: 7,
    issue: 1,
    year: 2026,
    pages: "25 48",
    doi: "10.5281/chssh.2026.7102",
    publishedDate: "2026-02-10",
    downloadsCount: 980,
    viewsCount: 2610,
    fileName: "Braithwaite_Ecological_Mourning_2026.pdf",
    fileSize: "890 KB"
  },
  {
    id: "art-3",
    trackingId: "CHSSH-2025-0142",
    title: "Epistemic Humility in the Age of Generative AI: Reevaluating Hermeneutic Injustice in Academic Peer Review",
    abstract: "As large language models increasingly permeate academic drafting and manuscript evaluation, ethical questions surrounding cognitive labor, voice homogenization, and interpretive bias have intensified. This philosophical treatise evaluates whether algorithmic style sanitization exacerbates testimonial and hermeneutic injustice for non-native English scholars. We propose an institutional ethics covenant anchored in epistemic pluralism.",
    keywords: ["Philosophy of Technology", "Epistemic Injustice", "Ethics of AI", "Peer Review", "Higher Education"],
    track: "Applied Ethics & Epistemic Justice",
    authors: [
      {
        id: "auth-4",
        name: "Dr. Kenji Takahashi",
        email: "ktakahashi@u-tokyo.ac.jp",
        affiliation: "Graduate School of Humanities and Sociology, University of Tokyo",
        country: "Japan",
        isCorresponding: true,
        orcid: "0000-0002-5401-7789"
      },
      {
        id: "auth-5",
        name: "Siobhan O'Connor, M.A.",
        email: "s.oconnor@tcd.ie",
        affiliation: "Department of Philosophy, Trinity College Dublin",
        country: "Ireland",
        isCorresponding: false
      }
    ],
    status: "published",
    submissionDate: "2025-11-15",
    lastUpdatedDate: "2026-02-28",
    volume: 7,
    issue: 1,
    year: 2026,
    pages: "49 73",
    doi: "10.5281/chssh.2026.7103",
    publishedDate: "2026-03-05",
    downloadsCount: 1845,
    viewsCount: 4230,
    fileName: "Takahashi_Epistemic_Humility_AI_2026.pdf",
    fileSize: "1.1 MB"
  },
  {
    id: "art-4",
    trackingId: "CHSSH-2026-0205",
    title: "Decolonizing the Archive: Oral Histories, Community Curatorship, and Indigenous Memory in the Andean Highlands",
    abstract: "Conventional state archives in post-settler nations frequently reproduce colonial epistemologies by silencing indigenous oral traditions. This ethnography documents a three-year collaborative digital archiving initiative with Quechua community elders in Cusco, Peru. We theorize 'living archives' as dynamic, community-governed protocols for transgenerational knowledge transmission.",
    keywords: ["Oral History", "Indigenous Methodologies", "Memory Studies", "Latin American Anthropology", "Archival Theory"],
    track: "History, Memory & Archival Studies",
    authors: [
      {
        id: "auth-6",
        name: "Dr. Valeria Quispe Huamán",
        email: "vquispe@pucp.edu.pe",
        affiliation: "Department of Social Sciences, Pontifical Catholic University of Peru",
        country: "Peru",
        isCorresponding: true,
        orcid: "0000-0002-9930-1847"
      }
    ],
    status: "under_review",
    submissionDate: "2026-02-14",
    lastUpdatedDate: "2026-03-01",
    editorialNotes: "Assigned to two independent reviewers specializing in Andean ethnography and archival justice.",
    reviewerComments: [
      "The empirical richness and community engagement are exemplary. Requesting expanded discussion on intellectual property rights under customary law."
    ],
    fileName: "Quispe_Decolonizing_The_Archive_Manuscript.docx",
    fileSize: "2.3 MB"
  },
  {
    id: "art-5",
    trackingId: "CHSSH-2026-0221",
    title: "Affective Polarization and Platform Affordances: A Cross-National Comparative Analysis of Micro-Targeted Political Feeds",
    abstract: "Analyzing over 2.4 million social media engagements across Brazil, Poland, and Canada during recent general elections, this study quantifies the affective amplification elicited by algorithmic outrage optimization. By combining computational natural language processing with qualitative discourse analysis, we model how platform architectures accelerate democratic tribalization.",
    keywords: ["Political Communication", "Affective Polarization", "Computational Social Science", "Democracy", "Social Media"],
    track: "Political Philosophy & Global Governance",
    authors: [
      {
        id: "auth-7",
        name: "Lucas Mendes da Silva",
        email: "lmendes@usp.br",
        affiliation: "Department of Political Science, University of São Paulo",
        country: "Brazil",
        isCorresponding: true
      }
    ],
    status: "revision_requested",
    submissionDate: "2026-02-22",
    lastUpdatedDate: "2026-03-08",
    editorialNotes: "Major revisions requested regarding data anonymization and robustness checks on NLP sentiment classifier.",
    reviewerComments: [
      "Reviewer 1: Fascinating multi-country dataset. Please provide clarification on how bots were filtered in the Brazilian sample.",
      "Reviewer 2: The conceptual framework connecting platform affordances to affective polarization is well-argued, but needs further statistical validation."
    ],
    fileName: "Mendes_Affective_Polarization_Manuscript.pdf",
    fileSize: "3.1 MB"
  },
  {
    id: "art-6",
    trackingId: "CHSSH-2026-0239",
    title: "Intersectional Labor Precarity Among Care Workers in Post-Pandemic Transnational Migration Corridors",
    abstract: "Examining labor mobility agreements between Southeast Asia and the Gulf Cooperation Council (GCC), this paper investigates how domestic and care workers navigate informal debt obligations, passport confiscation, and social reproduction strains. We argue that transnational care extractivism requires revised legal conventions under international humanitarian frameworks.",
    keywords: ["Migration Studies", "Care Work", "Intersectionality", "Labor Economics", "Transnationalism"],
    track: "Sociology & Social Theory",
    authors: [
      {
        id: "auth-8",
        name: "Nurul Aini Binti Hashim, Ph.D.",
        email: "nurul.hashim@um.edu.my",
        affiliation: "Faculty of Arts and Social Sciences, Universiti Malaya",
        country: "Malaysia",
        isCorresponding: true
      }
    ],
    status: "accepted",
    submissionDate: "2026-01-10",
    lastUpdatedDate: "2026-03-04",
    editorialNotes: "Revisions approved by Section Editor. Scheduled for publication in Volume 7, Issue 2 (Summer 2026).",
    fileName: "Hashim_Intersectional_Care_Workers.docx",
    fileSize: "1.8 MB"
  }
];

export const initialEditorialBoard: EditorialMember[] = [
  {
    id: "ed-1",
    name: "Prof. Dr. Elizabeth Vance, Ph.D.",
    role: "Editor-in-Chief",
    affiliation: "University of Edinburgh",
    country: "United Kingdom",
    expertise: "Social Theory, Epistemology, European Welfare Regimes",
    email: "e.vance@contemporaryhorizons.org"
  },
  {
    id: "ed-2",
    name: "Prof. Kwame Asante, FBA",
    role: "Senior Associate Editor (Humanities)",
    affiliation: "University of Ghana / Oxford University",
    country: "Ghana",
    expertise: "African Philosophy, Postcolonial Hermeneutics, Cultural Memory",
    email: "k.asante@contemporaryhorizons.org"
  },
  {
    id: "ed-3",
    name: "Dr. Sofia Morales-Valenzuela",
    role: "Associate Editor (Social Sciences)",
    affiliation: "National Autonomous University of Mexico (UNAM)",
    country: "Mexico",
    expertise: "Urban Sociology, Participatory Democracy, Latin American Movements",
    email: "s.morales@contemporaryhorizons.org"
  },
  {
    id: "ed-4",
    name: "Prof. Hiroshi Tanaka",
    role: "Associate Editor (Digital Humanities)",
    affiliation: "Kyoto University",
    country: "Japan",
    expertise: "Computational Text Analysis, Historical Semantics, Digital Archives",
    email: "h.tanaka@contemporaryhorizons.org"
  },
  {
    id: "ed-5",
    name: "Dr. Leila Benali-Laroche",
    role: "Book Review & Special Issues Editor",
    affiliation: "Sorbonne University",
    country: "France",
    expertise: "Mediterranean Historiography, Gender Studies, Intellectual History",
    email: "l.benali@contemporaryhorizons.org"
  },
  {
    id: "ed-6",
    name: "Dr. Priya Sundaram",
    role: "Managing Editor & Production Director",
    affiliation: "Horizon Scholarly Press",
    country: "India / UK",
    expertise: "Academic Publishing Ethics, Open Science, Bibliometrics",
    email: "managing@contemporaryhorizons.org"
  }
];
