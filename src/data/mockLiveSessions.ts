import { LiveSession } from '../types';

export const initialLiveSessions: LiveSession[] = [
  // 1. LIVE NOW - Free Solar Trades Session
  {
    id: 'session_live_1',
    title: 'Solar Inverter Sizing & Load-Shedding Backup Blueprint',
    subtitle: 'Live trade breakdown: sizing hybrid inverters, lithium battery bank calculations, and SANS CoC safety compliance.',
    description: 'Join master solar technicians for an open workshop. We take real domestic and commercial blue-prints, calculate peak surge vs continuous wattage, and discuss wiring safety standards.',
    category: 'Trades',
    agenda: [
      'PV system sizing calculations & panel string voltage formulas',
      'Lithium LiFePO4 battery selection & C-rate discharge curves',
      'Load-shedding automated switchover and SANS wiring compliance',
      'Live Q&A: troubleshooting error codes on Deye & Sunsynk systems'
    ],
    hostId: 'usr_sbusiso_solar',
    hostName: 'Sbusiso Dlamini',
    hostUsername: 'sbusiso_solar',
    hostAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    hostRole: 'Master Solar Technician & Installer',
    hostRating: 4.95,
    hostVerified: true,
    isTopRated: true,
    status: 'live',
    speakersCount: 3,
    listenersCount: 64,
    duration: '60 mins',
    isPaid: false,
    speakers: [
      { id: 'spk_1', name: 'Sbusiso Dlamini', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80', role: 'Host', isSpeaking: true },
      { id: 'spk_2', name: 'Nomvula Sithole', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80', role: 'Renewables Engineer', isSpeaking: false },
      { id: 'spk_3', name: 'Kevin Van Zyl', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80', role: 'SETA Assessor', isSpeaking: false }
    ],
    listeners: [
      { id: 'lst_1', name: 'Thabo M.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80' },
      { id: 'lst_2', name: 'Lerato K.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80' },
      { id: 'lst_3', name: 'Zizipho B.', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80' },
      { id: 'lst_4', name: 'David Okafor', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80' }
    ],
    isFollowed: false,
    isNotified: false,
    linkedServiceId: 'srv_2',
    linkedServiceTitle: 'Home Solar Assessment & CoC Verification'
  },

  // 2. LIVE NOW - Paid Masterclass in Tech
  {
    id: 'session_live_2',
    title: 'From Junior Dev to $4,000/mo Remote Contracts: The Global Playbook',
    subtitle: 'Proven tactics on landing international software clients from Africa, structuring contracts, and timezone management.',
    description: 'An exclusive, paid intimate session breaking down cold outreach that converts, GitHub portfolio auditing, and payment protection with escrow.',
    category: 'Tech',
    agenda: [
      'Positioning your GitHub and LinkedIn for US & European recruiters',
      'The 3-tier freelance proposal that beats low-ball bids',
      'Tax compliance, foreign currency accounts, and international wire handling',
      'Direct resume and portfolio teardown for 4 live participants'
    ],
    hostId: 'usr_thandiwe_dr',
    hostName: 'Dr. Thandiwe Khumalo',
    hostUsername: 'thandiwe_tech',
    hostAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    hostRole: 'Engineering Director & Tech Career Coach',
    hostRating: 4.98,
    hostVerified: true,
    isTopRated: true,
    status: 'live',
    speakersCount: 2,
    listenersCount: 118,
    duration: '75 mins',
    isPaid: true,
    priceAmount: 25,
    priceCurrency: '$',
    speakers: [
      { id: 'spk_4', name: 'Dr. Thandiwe Khumalo', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80', role: 'Host', isSpeaking: true },
      { id: 'spk_5', name: 'Michael Chen', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80', role: 'Tech Lead @ Stripe', isSpeaking: false }
    ],
    listeners: [
      { id: 'lst_5', name: 'Ayo B.', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80' },
      { id: 'lst_6', name: 'Keletso P.', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80' }
    ],
    isFollowed: true,
    isNotified: false
  },

  // 3. UPCOMING - Free Career Strategy Session
  {
    id: 'session_upcoming_1',
    title: 'MICT SETA & BankSETA 2026 Learnership Application Strategy',
    subtitle: 'How to stand out in the top 1% of applicants for 12-month paid learnerships with monthly stipends.',
    description: 'Learn the exact screening criteria SETA coordinators look for, matric score benchmarks, and how to craft your personal statement for high-stipend corporate programs.',
    category: 'Career',
    agenda: [
      'Understanding NQF Level 4 vs 5 distinctions and qualifications',
      'How to format your CV for automated SETA tracking systems (ATS)',
      'Acing the panel interview: real questions from banking sponsors',
      'Q&A on stipend structures, UIF registration, and permanent absorption'
    ],
    hostId: 'usr_sipho_career',
    hostName: 'Sipho Zulu',
    hostUsername: 'sipho_zulu',
    hostAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    hostRole: 'SETA Youth Development Coordinator',
    hostRating: 4.88,
    hostVerified: true,
    isTopRated: true,
    status: 'upcoming',
    speakersCount: 2,
    listenersCount: 0,
    duration: '45 mins',
    scheduledFor: '2026-10-14T16:00:00Z',
    scheduledDateFormatted: 'Wednesday, Oct 14 • 16:00 SAST',
    startsInText: 'Starts in 4 days',
    isPaid: false,
    speakers: [
      { id: 'spk_6', name: 'Sipho Zulu', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80', role: 'Host' },
      { id: 'spk_7', name: 'Kagiso Lekota', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80', role: 'HR Partner' }
    ],
    listeners: [],
    isFollowed: false,
    isNotified: false
  },

  // 4. UPCOMING - Paid Design Masterclass
  {
    id: 'session_upcoming_2',
    title: 'Product Design Systems with Figma & Tokens: From Wireframe to Code',
    subtitle: 'Build scalable typography scale, dark/light themes, and WCAG-accessible components that devs love.',
    description: 'Hands-on masterclass for UI/UX designers looking to build enterprise-grade design systems. Walk away with a turnkey Figma template and documentation framework.',
    category: 'Design',
    agenda: [
      'Atomic design architecture and variable token setups in Figma',
      'Dark mode color contrast ratios conforming to WCAG 2.1 AA',
      'Handoff workflows: exporting JSON tokens to Tailwind CSS',
      'Live teardown of participant UI screens'
    ],
    hostId: 'usr_lerato_design',
    hostName: 'Lerato Kgosi',
    hostUsername: 'lerato_creative',
    hostAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    hostRole: 'Lead Product Designer @ PayStack',
    hostRating: 4.92,
    hostVerified: true,
    isTopRated: true,
    status: 'upcoming',
    speakersCount: 1,
    listenersCount: 0,
    duration: '90 mins',
    scheduledFor: '2026-10-16T18:00:00Z',
    scheduledDateFormatted: 'Friday, Oct 16 • 18:00 SAST',
    startsInText: 'Starts in 6 days',
    isPaid: true,
    priceAmount: 30,
    priceCurrency: '$',
    speakers: [
      { id: 'spk_8', name: 'Lerato Kgosi', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80', role: 'Host' }
    ],
    listeners: [],
    isFollowed: false,
    isNotified: true
  },

  // 5. REPLAY - High-value Business Replay
  {
    id: 'session_replay_1',
    title: 'Starting a High-Margin Solar & Inverter Installation Business in SA',
    subtitle: 'Cost structure, supplier wholesale vetting, CoC compliance, and client acquisition without paid ads.',
    description: 'Recorded live masterclass covering everything required to legally register, staff, and run a profitable solar installation contracting firm in South Africa.',
    category: 'Business',
    agenda: [
      'Wholesale equipment supplier accounts: pricing tiers and warranty terms',
      'Contract templates, customer warranties, and dispute minimization',
      'Pricing models: flat rate vs margin-on-hardware formulas',
      'Scaling from 1 van to 4 certified installation teams'
    ],
    hostId: 'usr_sbusiso_solar',
    hostName: 'Sbusiso Dlamini',
    hostUsername: 'sbusiso_solar',
    hostAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    hostRole: 'Master Solar Technician & Installer',
    hostRating: 4.95,
    hostVerified: true,
    isTopRated: true,
    status: 'replay',
    speakersCount: 3,
    listenersCount: 420,
    duration: '54 mins',
    replayDuration: '54:12',
    recordingAudioPreview: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg',
    replayViewsCount: 1840,
    isPaid: false,
    speakers: [
      { id: 'spk_1', name: 'Sbusiso Dlamini', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80', role: 'Host' },
      { id: 'spk_2', name: 'Nomvula Sithole', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80', role: 'Renewables Engineer' }
    ],
    listeners: [],
    isFollowed: true,
    isNotified: false
  },

  // 6. REPLAY - Paid Tech Replay
  {
    id: 'session_replay_2',
    title: 'Full-Stack Next.js 15 & AI Agents Masterclass',
    subtitle: 'Architecting high-performance web applications with Gemini AI SDK, streaming UI, and PostgreSQL.',
    description: 'Full recording of the live 80-minute workshop with downloadable boilerplate repository, architectural diagram, and production deployment pipeline.',
    category: 'Tech',
    agenda: [
      'Server Actions vs API routes: performance benchmarks in production',
      'Implementing real-time streaming with Gemini 2.5 Flash',
      'Connection pooling with Prisma & PostgreSQL under high load',
      'Securing user auth with JWT & RBAC permission gates'
    ],
    hostId: 'usr_thandiwe_dr',
    hostName: 'Dr. Thandiwe Khumalo',
    hostUsername: 'thandiwe_tech',
    hostAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    hostRole: 'Engineering Director & Tech Career Coach',
    hostRating: 4.98,
    hostVerified: true,
    isTopRated: true,
    status: 'replay',
    speakersCount: 2,
    listenersCount: 890,
    duration: '82 mins',
    replayDuration: '82:45',
    recordingAudioPreview: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg',
    replayViewsCount: 3410,
    isPaid: true,
    priceAmount: 20,
    priceCurrency: '$',
    speakers: [
      { id: 'spk_4', name: 'Dr. Thandiwe Khumalo', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80', role: 'Host' }
    ],
    listeners: [],
    isFollowed: true,
    isNotified: false
  }
];
