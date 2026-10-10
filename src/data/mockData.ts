import { Course, Learnership, YouthService, Mentor, User, Notification, LearningResource, SocialPost, Story, Reel, CommunityEvent, ChatConversation, Review, PortfolioItem, ProfessionalServiceItem } from '../types';

export const currentUser: User = {
  id: 'usr_thando_808',
  name: 'Thando Mzobe',
  handle: '@thando_dev',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  bio: 'Full-stack software developer & cloud systems engineer. Building modern web platforms, APIs, and scalable distributed applications for global clients.',
  location: 'Johannesburg, South Africa',
  country: 'South Africa',
  city: 'Johannesburg',
  flagEmoji: '🇿🇦',
  province: 'Gauteng',
  verified: true,
  setaVerified: true,
  rating: 4.95,
  reviewsCount: 38,
  isTopRated: true,
  primarySkill: 'Full-Stack Software Development',
  title: 'Lead Full-Stack Engineer & Cloud Architect',
  hourlyRate: '$65/hr',
  jobsCompleted: 34,
  yearsOfExperience: '5+ years',
  responseTime: '< 1 hour',
  availability: 'Available Now',
  role: 'youth',
  skills: ['React', 'TypeScript', 'Node.js', 'Python', 'PostgreSQL', 'Docker', 'UI/UX Design', 'SETA NQF5'],
  educationLevel: 'Diploma in IT Systems Development',
  matricYear: 2022,
  badge: 'Top Rated Professional 🌐',
  enrolledCourseIds: ['crs_1', 'crs_3'],
  savedLearnershipIds: ['learn_1', 'learn_3'],
  savedServiceIds: ['serv_1'],
  savedResourceIds: ['res_1', 'res_3'],
  certificatesCount: 3,
  phone: '+27 72 345 6789'
};

export const initialReviews: Review[] = [
  {
    id: 'rev_1',
    reviewerId: 'usr_elena',
    reviewerName: 'Elena Rostova',
    reviewerAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
    reviewerCountry: 'Germany 🇩🇪',
    reviewerRole: 'Design Director at FinStudio',
    revieweeId: 'usr_thando_808',
    rating: 5.0,
    comment: 'Thando was fantastic! Delivered the project ahead of schedule and communicated perfectly. His React & TypeScript architecture is clean, maintainable, and robust.',
    createdAt: '3 days ago',
    projectTitle: 'Fintech Dashboard Web Application'
  },
  {
    id: 'rev_2',
    reviewerId: 'usr_sarah',
    reviewerName: 'Sarah Chen',
    reviewerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    reviewerCountry: 'United Kingdom 🇬🇧',
    reviewerRole: 'Engineering Manager',
    revieweeId: 'usr_thando_808',
    rating: 5.0,
    comment: 'Exceptional engineer. We hired Thando to build a real-time event streaming pipeline and REST API. Clear documentation, tests included, and zero downtime.',
    createdAt: '2 weeks ago',
    projectTitle: 'Distributed REST API & WebSocket Engine'
  },
  {
    id: 'rev_3',
    reviewerId: 'usr_michael',
    reviewerName: 'Michael Botha',
    reviewerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    reviewerCountry: 'Canada 🇨🇦',
    reviewerRole: 'Founder, Cleantech Solutions',
    revieweeId: 'usr_thando_808',
    rating: 4.9,
    comment: 'Top-tier problem solver. Thando integrated our IoT telemetry pipeline smoothly into our user dashboard. Highly recommended for any serious web product.',
    createdAt: '1 month ago',
    projectTitle: 'Solar Telemetry Telematics Dashboard'
  }
];

export const initialPortfolioItems: PortfolioItem[] = [
  {
    id: 'port_1',
    userId: 'usr_thando_808',
    title: 'Fintech Analytics Platform',
    description: 'A global multi-currency payment analytics dashboard with high-frequency charting, automated reconciliation, and dark-mode UI.',
    mediaUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
    mediaType: 'image',
    client: 'FinStudio London',
    category: 'Web Development',
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'PostgreSQL'],
    liveUrl: 'https://example.com/demo/fintech',
    createdAt: 'August 2026'
  },
  {
    id: 'port_2',
    userId: 'usr_thando_808',
    title: 'Smart Energy & Solar Grid Hub',
    description: 'Real-time telemetry monitoring for commercial solar installations with battery degradation prediction and automated load balancing.',
    mediaUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80',
    mediaType: 'image',
    client: 'EcoGrid Dynamics',
    category: 'Cloud Architecture',
    skills: ['Node.js', 'Python', 'Docker', 'React'],
    liveUrl: 'https://example.com/demo/ecogrid',
    createdAt: 'July 2026'
  },
  {
    id: 'port_3',
    userId: 'usr_thando_808',
    title: 'B2B Professional Services Marketplace',
    description: 'High-conversion escrow platform featuring milestone escrow funding, verified identity checks, and real-time messaging.',
    mediaUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
    mediaType: 'image',
    client: 'SkillHub Global',
    category: 'Full-Stack Engineering',
    skills: ['React', 'TypeScript', 'UI/UX Design', 'PostgreSQL'],
    liveUrl: 'https://example.com/demo/marketplace',
    createdAt: 'June 2026'
  }
];

export const initialProfessionalServices: ProfessionalServiceItem[] = [
  {
    id: 'serv_pro_1',
    userId: 'usr_thando_808',
    title: 'Full-Stack Web Application Development',
    description: 'End-to-end production web app development with React, TypeScript, scalable Node/Python backend, database schema, and test suite.',
    price: '$750',
    deliveryDays: '7 days',
    features: [
      'Responsive React + TypeScript front-end',
      'REST or GraphQL API endpoints',
      'PostgreSQL / database setup & migrations',
      'Authentication & role-based access control',
      'Escrow milestone delivery'
    ],
    category: 'Web Development'
  },
  {
    id: 'serv_pro_2',
    userId: 'usr_thando_808',
    title: 'Cloud Infrastructure & API Performance Tuning',
    description: 'Audit, optimize, and deploy backend microservices with containerization, caching, and CI/CD pipelines.',
    price: '$450',
    deliveryDays: '4 days',
    features: [
      'Docker containerization & deployment',
      'Database query & index optimization',
      'Security audit & rate-limiting setup',
      'Live monitoring & error telemetry'
    ],
    category: 'DevOps & Cloud'
  },
  {
    id: 'serv_pro_3',
    userId: 'usr_thando_808',
    title: 'UI/UX Design System & Interactive Prototypes',
    description: 'Clean, accessible design tokens and component libraries built for high conversion rates and cross-device consistency.',
    price: '$350',
    deliveryDays: '3 days',
    features: [
      'Complete Figma design component library',
      'Tailwind CSS tokens & implementation',
      'Interactive click-through prototype',
      'Accessibility (WCAG AA) compliance'
    ],
    category: 'Design & UI'
  }
];

export const initialCourses: Course[] = [
  {
    id: 'crs_1',
    title: 'Full-Stack Software Development & Cloud Systems',
    provider: 'MICT SETA & SkillHub Academy',
    providerLogo: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=100&auto=format&fit=crop&q=80',
    setaAccreditation: 'MICT SETA Accredited (NQF Level 5)',
    category: 'coding',
    duration: '6 Months',
    level: 'Intermediate',
    description: 'Master full-stack JavaScript, React, Node.js, and cloud deployment. Aligned with South African IT industry standards for junior developer roles.',
    outcomes: [
      'Build responsive React and Node.js applications',
      'Understand REST APIs and PostgreSQL/Firestore databases',
      'Deploy applications to cloud runtime environments',
      'Prepare for junior developer & tech learnership placements'
    ],
    modules: [
      { id: 'm1', title: 'Module 1: HTML5, CSS3 & Modern JavaScript (ES6+)', duration: '3 Weeks', lessonsCount: 12, summary: 'Core web technologies, DOM manipulation, async JavaScript', completed: true },
      { id: 'm2', title: 'Module 2: React 18, TypeScript & Tailwind CSS', duration: '4 Weeks', lessonsCount: 16, summary: 'Component state, props, hooks, custom styling and UI architecture', completed: true },
      { id: 'm3', title: 'Module 3: Node.js, Express & RESTful APIs', duration: '4 Weeks', lessonsCount: 14, summary: 'Server creation, middleware, authentication and database integration', completed: false },
      { id: 'm4', title: 'Module 4: Industry Capstone Project & Git Workflows', duration: '3 Weeks', lessonsCount: 10, summary: 'Build a full-stack SA community application and publish to GitHub', completed: false }
    ],
    quiz: [
      {
        id: 'q1',
        question: 'Which South African SETA handles Information Technology & Telecommunications qualifications?',
        options: ['BankSETA', 'MICT SETA', 'merSETA', 'CETA'],
        correctIndex: 1,
        explanation: 'MICT SETA (Media, Information and Communication Technologies SETA) oversees IT and software development qualifications in SA.'
      },
      {
        id: 'q2',
        question: 'In React, what hook is used to handle component state?',
        options: ['useEffect', 'useContext', 'useState', 'useReducer'],
        correctIndex: 2,
        explanation: 'useState is the fundamental hook used to store and update reactive state inside functional components.'
      }
    ],
    enrolledCount: 1420,
    rating: 4.9,
    bannerImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80',
    price: 'Free (SDF Funded)',
    tags: ['Coding', 'Web Dev', 'React', 'SETA NQF 5', 'Tech'],
    isFeatured: true
  },
  {
    id: 'crs_2',
    title: 'Solar PV Systems & Backup Battery Technician',
    provider: 'EWSETA Renewable Energy Institute',
    providerLogo: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=100&auto=format&fit=crop&q=80',
    setaAccreditation: 'EWSETA & CETA Accredited (NQF Level 4)',
    category: 'renewable',
    duration: '3 Months',
    level: 'Beginner',
    description: 'Hands-on practical training on solar panels, lithium-ion battery banks, hybrid inverters, and load shedding protection for SA homes and businesses.',
    outcomes: [
      'Design residential and commercial solar PV installations',
      'Calculate load requirements and battery capacity for SA load shedding',
      'Perform safe electrical wiring and inverter commissioning',
      'Understand SA National Standards (SANS 10142-1 CoC requirements)'
    ],
    modules: [
      { id: 'm21', title: 'Module 1: Electrical Fundamentals & Safety (SANS Standards)', duration: '2 Weeks', lessonsCount: 8, summary: 'AC/DC voltage, grounding, personal protective equipment', completed: false },
      { id: 'm22', title: 'Module 2: Solar Panels & Hybrid Inverter Sizing', duration: '3 Weeks', lessonsCount: 10, summary: 'Calculating peak sunlight hours in SA provinces and panel tilt angles', completed: false },
      { id: 'm23', title: 'Module 3: Lithium Battery Bank Storage & Wiring', duration: '3 Weeks', lessonsCount: 12, summary: 'BMS settings, battery storage chemistry, surge protection', completed: false }
    ],
    enrolledCount: 890,
    rating: 4.8,
    bannerImage: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800&auto=format&fit=crop&q=80',
    price: 'Free (Youth Bursary)',
    tags: ['Solar', 'Renewable', 'EWSETA', 'Green Energy', 'Trades'],
    isFeatured: true
  },
  {
    id: 'crs_3',
    title: 'Digital Marketing & E-Commerce for SA Small Businesses',
    provider: 'Services SETA SkillHub Lab',
    setaAccreditation: 'Services SETA Accredited (NQF Level 4)',
    category: 'digital',
    duration: '4 Weeks',
    level: 'Beginner',
    description: 'Learn how to run Meta Ads, Google Business profiles, TikTok marketing, and WhatsApp Business catalogues tailored for South African consumers.',
    outcomes: [
      'Create high-converting social media marketing campaigns',
      'Set up WhatsApp Business catalogues with PayFast / Ozow payment links',
      'Analyze campaign metrics and audience demographics',
      'Monetize digital marketing skills as a freelancer'
    ],
    modules: [
      { id: 'm31', title: 'Module 1: Social Media Strategy & Content Creation', duration: '1 Week', lessonsCount: 6, summary: 'Canva design basics, copywriting, brand voice', completed: true },
      { id: 'm32', title: 'Module 2: Meta Ads (Facebook/Instagram) & WhatsApp Business', duration: '1 Week', lessonsCount: 8, summary: 'Ad targeting in SA metros and townships, lead forms', completed: true }
    ],
    enrolledCount: 2100,
    rating: 4.7,
    bannerImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
    price: 'Free (Sponsored)',
    tags: ['Digital Marketing', 'E-Commerce', 'Social Media', 'SETA'],
    isFeatured: false
  },
  {
    id: 'crs_4',
    title: 'Data Analytics & Python for Financial Services',
    provider: 'BankSETA Innovation Lab',
    setaAccreditation: 'BankSETA & MICT SETA (NQF Level 5)',
    category: 'data',
    duration: '8 Weeks',
    level: 'Intermediate',
    description: 'Learn Python, Pandas, SQL, and Power BI visualization focused on banking, credit scoring, and fin-tech data pipelines in South Africa.',
    outcomes: [
      'Clean and process financial data using Python Pandas',
      'Write complex SQL queries for relational databases',
      'Build interactive dashboards in Power BI',
      'Qualify for BankSETA and fintech internship roles'
    ],
    modules: [
      { id: 'm41', title: 'Module 1: Python Basics & Data Structures', duration: '2 Weeks', lessonsCount: 10, summary: 'Variables, loops, functions, lists, dictionaries', completed: false },
      { id: 'm42', title: 'Module 2: Data Analysis with Pandas & NumPy', duration: '3 Weeks', lessonsCount: 12, summary: 'Dataframes, cleaning missing values, aggregation', completed: false }
    ],
    enrolledCount: 650,
    rating: 4.9,
    bannerImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
    price: 'Free (BankSETA Grant)',
    tags: ['Data Analytics', 'Python', 'Power BI', 'Fintech', 'BankSETA'],
    isFeatured: true
  },
  {
    id: 'crs_5',
    title: 'Smart Agri-Tech & Sustainable Hydroponic Farming',
    provider: 'AgriSETA Future Farmers Academy',
    setaAccreditation: 'AgriSETA Accredited (NQF Level 3)',
    category: 'agri',
    duration: '2 Months',
    level: 'Beginner',
    description: 'Learn climate-smart urban farming, hydroponics, IoT soil sensors, and agricultural produce distribution in South Africa.',
    outcomes: [
      'Setup and maintain urban hydroponic vegetable tunnels',
      'Understand soil nutrient management and automated irrigation',
      'Supply fresh produce to local SA supermarkets and informal markets',
      'Apply for AgriSETA youth farming grants'
    ],
    modules: [
      { id: 'm51', title: 'Module 1: Introduction to Hydroponics & Crop Science', duration: '2 Weeks', lessonsCount: 6, summary: 'Nutrient solutions, pH levels, crop selection', completed: false }
    ],
    enrolledCount: 430,
    rating: 4.6,
    bannerImage: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=800&auto=format&fit=crop&q=80',
    price: 'Free (AgriSETA Funded)',
    tags: ['Agriculture', 'Hydroponics', 'AgriSETA', 'Sustainability'],
    isFeatured: false
  }
];

export const initialLearnerships: Learnership[] = [
  {
    id: 'learn_1',
    title: 'MICT SETA Systems Development Learnership 2026/2027',
    company: 'Naspers Labs & SkillHub SA',
    companyLogo: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=100&auto=format&fit=crop&q=80',
    setaCategory: 'MICT SETA',
    location: 'Johannesburg',
    province: 'Gauteng',
    stipendZar: 'R5,500 / month',
    duration: '12 Months',
    closingDate: '30 October 2026',
    requirements: [
      'South African Citizen aged 18 - 34 years',
      'Passed Matric (Grade 12) with Pure Maths or Maths Literacy (50%+)',
      'Basic computer literacy and passion for software development',
      'Unemployed and not currently registered in another SETA learnership'
    ],
    description: 'Full 12-month funded learnership combining classroom coding bootcamps with practical workplace experience at leading SA tech firms. Successful graduates receive an NQF Level 5 Certificate.',
    skillsGained: ['React', 'JavaScript', 'Node.js', 'SQL Databases', 'Agile Scrum Methodologies'],
    applicantsCount: 340,
    isBookmarked: true
  },
  {
    id: 'learn_2',
    title: 'Junior Solar Installation & Energy Apprenticeship',
    company: 'Santam Energy & EWSETA',
    setaCategory: 'EWSETA',
    location: 'Cape Town',
    province: 'Western Cape',
    stipendZar: 'R4,800 / month',
    duration: '12 Months',
    closingDate: '15 November 2026',
    requirements: [
      'Grade 12 with Physical Science / Technical Maths or N3 Electrical certificate',
      'Valid South African ID document',
      'Physically fit and comfortable working at heights',
      'Resident of Western Cape Metro / Paarl / Bellville'
    ],
    description: 'Hands-on apprenticeship for installing commercial solar rooftop systems, battery backup systems, and inverter management across Western Cape commercial properties.',
    skillsGained: ['Solar PV Wiring', 'SANS Electrical Standards', 'Inverter Programming', 'Safety Protocols'],
    applicantsCount: 185,
    isBookmarked: false
  },
  {
    id: 'learn_3',
    title: 'Cyber Security & Cloud Infrastructure Learnership',
    company: 'FirstRand Bank Innovation Centre',
    setaCategory: 'BankSETA',
    location: 'Sandton, JHB',
    province: 'Gauteng',
    stipendZar: 'R7,000 / month',
    duration: '12 Months',
    closingDate: '05 November 2026',
    requirements: [
      'Grade 12 with Pure Mathematics (60%+)',
      'Diploma/Degree in IT, Computer Science, or completed NQF 4 IT qualification',
      'Clear ITC and criminal record check',
      'High problem-solving aptitude'
    ],
    description: 'Specialized BankSETA learnership training youth in cybersecurity threat detection, cloud network administration, and fintech compliance.',
    skillsGained: ['Cloud Security', 'Network Monitoring', 'Linux Systems', 'Incident Response'],
    applicantsCount: 520,
    isBookmarked: true
  },
  {
    id: 'learn_4',
    title: 'Digital Marketing & Content Production Internship',
    company: 'Takealot Group Youth Hub',
    setaCategory: 'Services SETA',
    location: 'Durban',
    province: 'KwaZulu-Natal',
    stipendZar: 'R5,200 / month',
    duration: '12 Months',
    closingDate: '20 October 2026',
    requirements: [
      'Grade 12 Certificate',
      'Strong written and verbal communication skills in English & isiZulu',
      'Basic knowledge of social media platforms (TikTok, Instagram, LinkedIn)',
      'Aged 18 - 29 years'
    ],
    description: 'Work with Takealot e-commerce branding team creating digital ad campaigns, writing product descriptions, and managing customer engagement.',
    skillsGained: ['SEO Copywriting', 'Canva Graphic Design', 'E-commerce Management', 'Meta Business Suite'],
    applicantsCount: 290,
    isBookmarked: false
  },
  {
    id: 'learn_5',
    title: 'Smart Agri-Business & Supply Chain Youth Programme',
    company: 'Pioneer Foods & AgriSETA',
    setaCategory: 'AgriSETA',
    location: 'Gqeberha',
    province: 'Eastern Cape',
    stipendZar: 'R4,500 / month',
    duration: '12 Months',
    closingDate: '10 November 2026',
    requirements: [
      'Grade 12 Certificate with Agricultural Sciences or Life Sciences',
      'South African Youth Citizen',
      'Willingness to work in agricultural supply distribution centres'
    ],
    description: 'Comprehensive AgriSETA learnership covering modern food processing, cold-chain supply management, and agricultural export logistics.',
    skillsGained: ['Cold Chain Logistics', 'Quality Control', 'Agricultural Business Admin', 'Stock Management'],
    applicantsCount: 140,
    isBookmarked: false
  }
];

export const initialYouthServices: YouthService[] = [
  {
    id: 'serv_1',
    title: 'Custom Website & E-Commerce Store Development',
    providerId: 'usr_thando_808',
    providerName: 'Thando Mzobe',
    providerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    providerLocation: 'Soweto, JHB',
    providerProvince: 'Gauteng',
    category: 'web_dev',
    priceZar: 1200,
    priceUnit: 'project',
    deliveryTime: '3 - 5 Days',
    rating: 5.0,
    reviewsCount: 18,
    description: 'I build clean, fast, mobile-friendly websites and online stores for SA small businesses with WhatsApp chat buttons and Ozow/PayFast payment integration.',
    deliverables: [
      'Fully responsive mobile & desktop website',
      'WhatsApp direct order integration',
      'Google Maps listing setup',
      'Free 1-month maintenance support'
    ],
    phone: '+27 72 345 6789',
    tags: ['Web Design', 'React', 'E-Commerce', 'Soweto'],
    verifiedYouth: true
  },
  {
    id: 'serv_2',
    title: 'Solar Inverter Backup & Load Shedding Diagnostic',
    providerId: 'usr_sipho_solar',
    providerName: 'Sipho Dlamini',
    providerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    providerLocation: 'Midrand',
    providerProvince: 'Gauteng',
    category: 'solar_repair',
    priceZar: 850,
    priceUnit: 'project',
    deliveryTime: 'Same Day',
    rating: 4.9,
    reviewsCount: 32,
    description: 'Certified EWSETA technician offering solar PV inspection, lithium battery installation, and inverter troubleshooting for residential homes.',
    deliverables: [
      'Full battery bank voltage & BMS check',
      'Solar array output test',
      'Surge protection inspection',
      'Written safety report'
    ],
    phone: '+27 81 234 5678',
    tags: ['Solar Repairs', 'EWSETA Certified', 'Gauteng'],
    verifiedYouth: true
  },
  {
    id: 'serv_3',
    title: 'Brand Identity Logo & Social Media Graphics Pack',
    providerId: 'usr_lerato_design',
    providerName: 'Lerato Ndlovu',
    providerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    providerLocation: 'Cape Town Central',
    providerProvince: 'Western Cape',
    category: 'graphic_design',
    priceZar: 500,
    priceUnit: 'project',
    deliveryTime: '2 Days',
    rating: 4.8,
    reviewsCount: 24,
    description: 'High quality vector logos, business cards, price lists, and Instagram/TikTok post templates tailored for South African startups.',
    deliverables: [
      '3 Logo design concepts with source files',
      '10 Social media post templates (Canva / PNG)',
      'PDF Business Card print ready file'
    ],
    phone: '+27 63 987 6543',
    tags: ['Branding', 'Logo Design', 'Canva', 'Cape Town'],
    verifiedYouth: true
  },
  {
    id: 'serv_4',
    title: 'Grade 10-12 Mathematics & Physical Science Tutoring',
    providerId: 'usr_kagiso_tutor',
    providerName: 'Kagiso Mokwena',
    providerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    providerLocation: 'Pretoria East',
    providerProvince: 'Gauteng',
    category: 'tutoring',
    priceZar: 180,
    priceUnit: 'hour',
    deliveryTime: '1 Hour Session',
    rating: 5.0,
    reviewsCount: 15,
    description: 'Final year BSc Engineering student helping high school learners prepare for Matric exams with past NSC exam papers and simplified explanations.',
    deliverables: [
      '1-on-1 Zoom / Google Meet or in-person lesson',
      'Past NSC exam question breakdown',
      'Customized revision notes & formulas sheet'
    ],
    phone: '+27 76 112 2334',
    tags: ['Tutoring', 'Matric Maths', 'Science', 'Pretoria'],
    verifiedYouth: true
  },
  {
    id: 'serv_5',
    title: 'Smartphone Screen & Battery Replacement Service',
    providerId: 'usr_bongani_tech',
    providerName: 'Bongani Khumalo',
    providerAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
    providerLocation: 'Durban Central',
    providerProvince: 'KwaZulu-Natal',
    category: 'phone_repair',
    priceZar: 350,
    priceUnit: 'project',
    deliveryTime: '1 Hour',
    rating: 4.7,
    reviewsCount: 41,
    description: 'Fast mobile repairs for iPhone, Samsung, Huawei, and Xiaomi phones using original replacement parts with a 3-month warranty.',
    deliverables: [
      'Screen replacement or battery swap',
      'Free toughened glass screen protector',
      'Diagnostic check'
    ],
    phone: '+27 82 555 4321',
    tags: ['Phone Repairs', 'Durban', 'Tech Support'],
    verifiedYouth: true
  }
];

export const initialMentors: Mentor[] = [
  {
    id: 'mnt_1',
    name: 'Dr. Nomalanga Khumalo',
    title: 'Senior Cloud Solutions Architect',
    company: 'AWS South Africa',
    province: 'Gauteng',
    expertise: ['Cloud Architecture', 'Tech Career Growth', 'Software Engineering', 'SETA Accreditation'],
    bio: '15+ years in global enterprise software and cloud engineering. Dedicated to mentoring young black South Africans breaking into tech.',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&auto=format&fit=crop&q=80',
    availableSlots: ['Mon 17:00', 'Wed 18:00', 'Sat 10:00'],
    bookingCount: 88,
    rating: 5.0,
    feeZar: 'Free Youth Mentorship'
  },
  {
    id: 'mnt_2',
    name: 'Sabelo Mthembu',
    title: 'Director of Renewable Engineering',
    company: 'Cape Solar Technologies',
    province: 'Western Cape',
    expertise: ['Solar Energy', 'Project Management', 'Apprenticeships', 'Electrical Engineering'],
    bio: 'Helped build over 40MW of commercial solar installations across SA. Passionate about green energy jobs for youth.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
    availableSlots: ['Tue 16:30', 'Thu 17:00'],
    bookingCount: 54,
    rating: 4.9,
    feeZar: 'Free Youth Mentorship'
  },
  {
    id: 'mnt_3',
    name: 'Zinhle Cele',
    title: 'Venture Capital Associate & Tech Founder',
    company: 'Kasi Tech Fund SA',
    province: 'KwaZulu-Natal',
    expertise: ['Startup Fundraising', 'Pitch Decks', 'Business Model Canvas', 'Youth Entrepreneurship'],
    bio: 'Supporting township and suburban tech innovators to get seed funding and build scalable businesses in South Africa.',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
    availableSlots: ['Wed 15:00', 'Fri 16:00'],
    bookingCount: 72,
    rating: 5.0,
    feeZar: 'Free Youth Mentorship'
  }
];

export const initialNotifications: Notification[] = [
  {
    id: 'notif_1',
    type: 'learnership',
    title: 'New MICT SETA Learnership Available',
    message: 'Naspers Labs published a new Systems Development learnership offering R5,500/month stipend in Johannesburg.',
    timestamp: '2 hours ago',
    read: false,
    actionUrl: 'learnerships'
  },
  {
    id: 'notif_2',
    type: 'course',
    title: 'Module 2 Completed 🎉',
    message: 'Congratulations! You completed Module 2 in Full-Stack Software Development.',
    timestamp: 'Yesterday',
    read: true,
    actionUrl: 'courses'
  },
  {
    id: 'notif_3',
    type: 'service_booking',
    title: 'New Service Inquiry',
    message: 'Sipho from Midrand sent a message regarding your Custom Web Development service.',
    timestamp: '2 days ago',
    read: true,
    actionUrl: 'services'
  }
];

export const initialLearningResources: LearningResource[] = [
  {
    id: 'res_1',
    title: 'Complete React 19 & Next.js App Router Architecture Guide',
    description: 'A comprehensive step-by-step breakdown of modern React Server Components, state management, and performance optimization written for global devs.',
    category: 'coding',
    resourceType: 'guide',
    url: 'https://github.com/developer-learning/react-19-guide',
    authorName: 'Aria Chen',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    authorLocation: 'Vancouver, Canada 🇨🇦',
    upvotes: 342,
    isUpvoted: true,
    isBookmarked: true,
    tags: ['React', 'Next.js', 'TypeScript', 'Frontend'],
    difficulty: 'Intermediate',
    region: 'Global / Worldwide',
    createdAt: '3 days ago',
    commentsCount: 28
  },
  {
    id: 'res_2',
    title: 'Solar PV Systems Sizing & Off-Grid Backup Calculator Cheat Sheet',
    description: 'Essential downloadable formulas, inverter sizing sheets, and battery capacity calculators for solar technicians in developing grids.',
    category: 'trades',
    resourceType: 'cheatsheet',
    url: 'https://solar-learning.org/pv-calculator-sheet.pdf',
    authorName: 'Sipho Dlamini',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    authorLocation: 'Johannesburg, South Africa 🇿🇦',
    upvotes: 218,
    isUpvoted: false,
    isBookmarked: false,
    tags: ['Solar PV', 'Renewable Energy', 'Electrical', 'Calculators'],
    difficulty: 'Beginner',
    region: 'Middle East & Africa',
    createdAt: '5 days ago',
    commentsCount: 14
  },
  {
    id: 'res_3',
    title: 'Interactive Python Data Science & ML Workshop Repository',
    description: 'Hands-on Jupyter notebooks covering pandas, NumPy, scikit-learn, and real-world datasets with starter code exercises.',
    category: 'ai_data',
    resourceType: 'repo',
    url: 'https://github.com/data-global/python-ml-workshops',
    authorName: 'Lucas Silva',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    authorLocation: 'São Paulo, Brazil 🇧🇷',
    upvotes: 512,
    isUpvoted: true,
    isBookmarked: true,
    tags: ['Python', 'Data Science', 'Machine Learning', 'Open Source'],
    difficulty: 'Beginner',
    region: 'Global / Worldwide',
    createdAt: '1 week ago',
    commentsCount: 42
  },
  {
    id: 'res_4',
    title: 'Figma UI/UX Design System Component Kit & Design Tokens',
    description: 'A free open Figma template with responsive layout grids, WCAG contrast compliant color palettes, and mobile navigation components.',
    category: 'design',
    resourceType: 'tool',
    url: 'https://figma.com/community/file/design-system-kit-2026',
    authorName: 'Elena Rostova',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    authorLocation: 'Berlin, Germany 🇩🇪',
    upvotes: 420,
    isUpvoted: false,
    isBookmarked: false,
    tags: ['Figma', 'UI/UX', 'Design Systems', 'Tailwind'],
    difficulty: 'Intermediate',
    region: 'Europe',
    createdAt: '2 weeks ago',
    commentsCount: 31
  },
  {
    id: 'res_5',
    title: 'Global Freelancer Contract Templates & Pricing Strategy E-Book',
    description: 'Legal contract clauses, milestone payment guidelines, and rate calculation worksheets for remote international freelancers.',
    category: 'business',
    resourceType: 'book',
    url: 'https://freelance-global.hub/guide.pdf',
    authorName: 'Thando Mzobe',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    authorLocation: 'Soweto, South Africa 🇿🇦',
    upvotes: 189,
    isUpvoted: false,
    isBookmarked: false,
    tags: ['Freelancing', 'Remote Work', 'Contracts', 'Pricing'],
    difficulty: 'Beginner',
    region: 'Global / Worldwide',
    createdAt: '3 days ago',
    commentsCount: 19
  }
];

export const initialSocialPosts: SocialPost[] = [
  {
    id: 'post_sr_1',
    authorId: 'usr_marcus',
    authorName: 'Marcus Sterling',
    authorHandle: '@marcus_venture',
    authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    authorLocation: 'San Francisco',
    authorCountry: 'United States 🇺🇸',
    authorRating: 4.98,
    authorVerified: true,
    authorPrimarySkill: 'Tech Founder & Product Lead',
    createdAt: '1h ago',
    content: 'Looking for a Senior React + TypeScript & Tailwind CSS Engineer to build an analytics dashboard and integrate REST APIs. Milestone escrow funded, clear wireframes provided. Need delivery within 2 weeks.',
    hashtags: ['React', 'TypeScript', 'RemoteHiring', 'WebDevelopment'],
    likesCount: 18,
    commentsCount: 6,
    sharesCount: 4,
    isLiked: false,
    category: 'tech',
    postType: 'service_request',
    serviceRequest: {
      budget: '$1,200 - $1,800 USD',
      deadline: '2 Weeks',
      preferredRegion: 'Worldwide / Remote'
    }
  },
  {
    id: 'post_1',
    authorId: 'usr_elena',
    authorName: 'Elena Rostova',
    authorHandle: '@elena_design_de',
    authorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
    authorLocation: 'Berlin',
    authorCountry: 'Germany 🇩🇪',
    authorRating: 5.0,
    authorVerified: true,
    authorPrimarySkill: 'Top Rated Graphic & Brand Designer',
    createdAt: 'Just now',
    content: 'Just finished a brand identity package for a fintech startup in London. Loved working on this modern logo! 🎨 #Branding #Figma #Fintech #DesignSystems',
    hashtags: ['Branding', 'Figma', 'Fintech', 'DesignSystems'],
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&auto=format&fit=crop&q=80',
    likesCount: 94,
    commentsCount: 16,
    sharesCount: 11,
    isLiked: false,
    category: 'design',
    postType: 'showcase'
  },
  {
    id: 'post_2',
    authorId: 'usr_sarah',
    authorName: 'Sarah Chen',
    authorHandle: '@sarah_plumbing_uk',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    authorLocation: 'London',
    authorCountry: 'United Kingdom 🇬🇧',
    authorRating: 4.98,
    authorVerified: true,
    authorPrimarySkill: 'Master Hydraulic & Solar Plumbing',
    createdAt: 'Aug 19',
    content: 'Emergency high-pressure heating manifold installed for a commercial studio in Shoreditch! Tested to 6 bar. Always on call for international contracts and local consults. 🚀 #PlumberLife #TradesMaster #CommercialPlumbing',
    hashtags: ['PlumberLife', 'TradesMaster', 'CommercialPlumbing'],
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80',
    likesCount: 38,
    commentsCount: 8,
    sharesCount: 5,
    isLiked: true,
    category: 'trades',
    postType: 'showcase'
  },
  {
    id: 'post_3',
    authorId: 'usr_michael',
    authorName: 'Michael Botha',
    authorHandle: '@michael_carpentry_ca',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    authorLocation: 'Toronto',
    authorCountry: 'Canada 🇨🇦',
    authorRating: 4.95,
    authorVerified: true,
    authorPrimarySkill: 'Bespoke Architectural Woodworking',
    createdAt: 'Aug 18',
    content: 'Just completed this custom 12-seater conference table handcrafted from reclaimed Canadian white oak. Finished with non-toxic satin hardwax oil. Available for custom orders worldwide. 🌳 #Carpentry #Woodworking #Craftsmanship',
    hashtags: ['Carpentry', 'Woodworking', 'Craftsmanship'],
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800&auto=format&fit=crop&q=80',
    likesCount: 54,
    commentsCount: 12,
    sharesCount: 9,
    isLiked: false,
    category: 'trades',
    postType: 'showcase'
  },
  {
    id: 'post_4',
    authorId: 'usr_david',
    authorName: 'David Kim',
    authorHandle: '@david_cloud_ny',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    authorLocation: 'New York',
    authorCountry: 'United States 🇺🇸',
    authorRating: 4.92,
    authorVerified: true,
    authorPrimarySkill: 'Cloud & AI Infrastructure Engineer',
    createdAt: 'Aug 16',
    content: 'Deploys 99.99% high-availability microservices cluster on Kubernetes with auto-healing and zero downtime rolling releases. Open for consulting contracts. ☁️⚡ #Kubernetes #CloudArch #DevOps',
    hashtags: ['Kubernetes', 'CloudArch', 'DevOps'],
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
    likesCount: 67,
    commentsCount: 9,
    sharesCount: 7,
    isLiked: true,
    category: 'tech',
    postType: 'showcase'
  }
];

export const initialStories: Story[] = [
  {
    id: 'story_me',
    authorName: 'Your Story',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
    createdAt: 'Just now',
    hasUnseen: false,
    slides: [
      {
        id: 'slide_me_1',
        mediaUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
        createdAt: 'Just now',
        caption: 'Working late on the community platform update! 💻⚡',
        reactions: [
          { id: 'r_me_1', emoji: '🔥', userId: 'usr_sarah', userName: 'Sarah Molefe', userAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80', createdAt: '10m ago' },
          { id: 'r_me_2', emoji: '👏', userId: 'usr_michael', userName: 'Michael Botha', userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80', createdAt: '5m ago' },
          { id: 'r_me_3', emoji: '🚀', userId: 'usr_elena', userName: 'Elena Rostova', userAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80', createdAt: '2m ago' }
        ]
      },
      {
        id: 'slide_me_2',
        mediaUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&auto=format&fit=crop&q=80',
        createdAt: '1h ago',
        caption: 'Planning the youth mentorship session for tomorrow! 🤝',
        reactions: [
          { id: 'r_me_4', emoji: '❤️', userId: 'usr_lisa', userName: 'Lisa Khumalo', userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80', createdAt: '45m ago' },
          { id: 'r_me_5', emoji: '🎉', userId: 'usr_david', userName: 'David Kim', userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80', createdAt: '30m ago' }
        ]
      }
    ]
  },
  {
    id: 'story_sarah',
    authorName: 'Sarah Molefe',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=80',
    createdAt: '2h ago',
    hasUnseen: true,
    slides: [
      {
        id: 'slide_sarah_1',
        mediaUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=80',
        createdAt: '2h ago',
        caption: 'Inspecting copper pipe fittings at the site 🛠️',
        reactions: [
          { id: 'r_s_1', emoji: '👏', userId: 'usr_thando_808', userName: 'Thando Mzobe', createdAt: '1h ago' },
          { id: 'r_s_2', emoji: '🔥', userId: 'usr_michael', userName: 'Michael Botha', createdAt: '45m ago' },
          { id: 'r_s_3', emoji: '💯', userId: 'usr_themba', userName: 'Themba Ndlovu', createdAt: '20m ago' }
        ]
      },
      {
        id: 'slide_sarah_2',
        mediaUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80',
        createdAt: '1h ago',
        caption: 'All set and pressure tested! Ready for inspection ✅',
        reactions: [
          { id: 'r_s_4', emoji: '❤️', userId: 'usr_thando_808', userName: 'Thando Mzobe', createdAt: '30m ago' },
          { id: 'r_s_5', emoji: '🎉', userId: 'usr_elena', userName: 'Elena Rostova', createdAt: '15m ago' }
        ]
      }
    ]
  },
  {
    id: 'story_michael',
    authorName: 'Michael Botha',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=600&auto=format&fit=crop&q=80',
    createdAt: '4h ago',
    hasUnseen: true,
    slides: [
      {
        id: 'slide_mike_1',
        mediaUrl: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=600&auto=format&fit=crop&q=80',
        createdAt: '4h ago',
        caption: 'Selecting raw reclaimed Kiaat timber for the dining set 🪵',
        reactions: [
          { id: 'r_m_1', emoji: '🔥', userId: 'usr_sarah', userName: 'Sarah Molefe', createdAt: '3h ago' },
          { id: 'r_m_2', emoji: '👏', userId: 'usr_lisa', userName: 'Lisa Khumalo', createdAt: '2h ago' }
        ]
      },
      {
        id: 'slide_mike_2',
        mediaUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&auto=format&fit=crop&q=80',
        createdAt: '2h ago',
        caption: 'Hand oiling complete! Satin shine coming through ✨',
        reactions: [
          { id: 'r_m_3', emoji: '❤️', userId: 'usr_thando_808', userName: 'Thando Mzobe', createdAt: '1h ago' },
          { id: 'r_m_4', emoji: '💯', userId: 'usr_sarah', userName: 'Sarah Molefe', createdAt: '30m ago' }
        ]
      }
    ]
  },
  {
    id: 'story_lisa',
    authorName: 'Lisa Khumalo',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&auto=format&fit=crop&q=80',
    createdAt: '6h ago',
    hasUnseen: true,
    slides: [
      {
        id: 'slide_lisa_1',
        mediaUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&auto=format&fit=crop&q=80',
        createdAt: '6h ago',
        caption: 'Final color grading session for the local brand shoot 🎬🎨'
      }
    ]
  },
  {
    id: 'story_themba',
    authorName: 'Themba Ndlovu',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&auto=format&fit=crop&q=80',
    createdAt: '8h ago',
    hasUnseen: false,
    slides: [
      {
        id: 'slide_themba_1',
        mediaUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&auto=format&fit=crop&q=80',
        createdAt: '8h ago',
        caption: 'Solar panel array commissioned in Soweto! Clean power ☀️🇿🇦'
      }
    ]
  }
];

export const initialReels: Reel[] = [
  {
    id: 'reel_1',
    authorName: 'Sarah Chen',
    authorHandle: '@sarah_chen',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    authorLocation: 'London, UK 🇬🇧',
    authorRating: 4.98,
    authorVerified: true,
    authorHourlyRate: '$75/hr',
    caption: 'Just deployed a full-stack e-commerce app for a UK client. Check out the dashboard! 🚀 #React #WebDev #TypeScript',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-41315-large.mp4',
    likesCount: 428,
    commentsCount: 38,
    sharesCount: 54,
    isLiked: true,
    audioTrack: 'Ambient Tech - Sarah Studio',
    tags: ['React', 'TypeScript', 'WebDev'],
    skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
    category: 'web_dev',
    isPortfolioPiece: true,
    viewsCount: 2450
  },
  {
    id: 'reel_2',
    authorName: 'Elena Rostova',
    authorHandle: '@elena_design',
    authorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
    authorLocation: 'Berlin, Germany 🇩🇪',
    authorRating: 4.97,
    authorVerified: true,
    authorHourlyRate: '$70/hr',
    caption: 'Brand identity & dark-mode design system deliverable for a London FinTech startup. Figma tokens in action! 🎨 #Branding #Figma #UIUX',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-graphic-designer-working-on-a-digital-tablet-41586-large.mp4',
    likesCount: 615,
    commentsCount: 49,
    sharesCount: 88,
    isLiked: false,
    audioTrack: 'Minimalist Beats - Elena Design',
    tags: ['Figma', 'UIUX', 'DesignSystems'],
    skills: ['Figma', 'UI/UX Design', 'Design Systems', 'Branding'],
    category: 'design',
    isPortfolioPiece: true,
    viewsCount: 3820
  },
  {
    id: 'reel_3',
    authorName: 'Michael Botha',
    authorHandle: '@michael_botha',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    authorLocation: 'Toronto, Canada 🇨🇦',
    authorRating: 4.95,
    authorVerified: true,
    authorHourlyRate: '$85/hr',
    caption: 'Commissioning an 85kW commercial solar rooftop array with smart inverters and live telemetry. ☀️🔋 #SolarPV #CleanEnergy #Electrical',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-carpenter-measuring-wood-41584-large.mp4',
    likesCount: 345,
    commentsCount: 29,
    sharesCount: 42,
    isLiked: false,
    audioTrack: 'Trades & Innovations - Michael Botha',
    tags: ['SolarPV', 'CleanEnergy', 'Trades'],
    skills: ['Solar PV', 'Smart Inverters', 'Electrical', 'CAD'],
    category: 'trades',
    isPortfolioPiece: true,
    viewsCount: 1940
  },
  {
    id: 'reel_4',
    authorName: 'David Kim',
    authorHandle: '@david_cloud',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    authorLocation: 'San Francisco, USA 🇺🇸',
    authorRating: 4.92,
    authorVerified: true,
    authorHourlyRate: '$90/hr',
    caption: '1-on-1 Mentorship session breakdown: System design for distributed caching, Redis clustering, and database read replicas. 💻 #Cloud #DevOps #Mentorship',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-typing-on-a-computer-keyboard-41583-large.mp4',
    likesCount: 289,
    commentsCount: 22,
    sharesCount: 31,
    isLiked: false,
    audioTrack: 'System Design Sessions - David Kim',
    tags: ['Cloud', 'DevOps', 'Mentorship'],
    skills: ['Cloud Architecture', 'AWS', 'System Design', 'Kubernetes'],
    category: 'tutoring',
    isPortfolioPiece: true,
    viewsCount: 1290
  },
  {
    id: 'reel_5',
    authorName: 'Thando Mzobe',
    authorHandle: '@thando_dev',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    authorLocation: 'Johannesburg, South Africa 🇿🇦',
    authorRating: 4.95,
    authorVerified: true,
    authorHourlyRate: '$65/hr',
    caption: 'Live test of our real-time WebSocket event streaming pipeline! Under 15ms latency across global clusters. ⚡ #Python #FastAPI #Docker',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-working-on-his-laptop-308-large.mp4',
    likesCount: 512,
    commentsCount: 68,
    sharesCount: 110,
    isLiked: true,
    audioTrack: 'Original Audio - Thando Mzobe',
    tags: ['WebDev', 'Python', 'FastAPI'],
    skills: ['Python', 'WebSockets', 'Docker', 'React'],
    category: 'web_dev',
    isPortfolioPiece: true,
    viewsCount: 4120
  }
];

export const initialEvents: CommunityEvent[] = [
  {
    id: 'event_1',
    title: 'Mambisa fest',
    description: 'Kabza, killa and paper... Youth music, art & craft showcase live in Soweto!',
    dateBadge: 'Aug 20',
    fullDate: 'Thursday, Aug 20 • 14:00 PM',
    location: 'Soweto Youth Centre, Johannesburg',
    hostName: 'thando mzobe',
    hostAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    attendeesCount: 142,
    isAttending: true,
    category: 'Festival'
  },
  {
    id: 'event_2',
    title: 'New Community Meetup',
    description: 'Join us for an evening of networking, knowledge sharing, and live skill demonstrations with SETA mentors.',
    dateBadge: 'Aug 26',
    fullDate: 'Wednesday, Aug 26 • 17:30 PM',
    location: 'Cape Town Innovation Hub, Western Cape',
    hostName: 'thando mzobe',
    hostAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    attendeesCount: 88,
    isAttending: false,
    category: 'Meetup'
  },
  {
    id: 'event_3',
    title: 'Solar Technicians Masterclass',
    description: 'Hands-on inverter sizing, lithium battery wiring, and SETA NQF4 certification breakdown.',
    dateBadge: 'Sep 02',
    fullDate: 'Saturday, Sep 02 • 09:00 AM',
    location: 'Pretoria Energy Park, Gauteng',
    hostName: 'Themba Ndlovu',
    hostAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    attendeesCount: 210,
    isAttending: false,
    category: 'Workshop'
  }
];

export const initialChatConversations: ChatConversation[] = [
  {
    id: 'chat_sarah',
    participantId: 'usr_sarah',
    participantName: 'Sarah Molefe',
    participantHandle: '@sarah_plumb',
    participantAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    online: true,
    lastMessage: 'I can drop by tomorrow morning to inspect the pipe layout! 🔧',
    lastMessageTime: '14:18',
    unreadCount: 1,
    messages: [
      {
        id: 'msg_1',
        senderId: 'usr_sarah',
        senderName: 'Sarah Molefe',
        senderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
        text: 'Hi Thando! Saw your post about the community center renovation.',
        timestamp: '14:10',
        isMe: false
      },
      {
        id: 'msg_2',
        senderId: 'usr_thando_808',
        senderName: 'Thando Mzobe',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        text: 'Hey Sarah! Yes, we need a certified plumber for the new kitchen unit.',
        timestamp: '14:12',
        isMe: true
      },
      {
        id: 'msg_3',
        senderId: 'usr_sarah',
        senderName: 'Sarah Molefe',
        senderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
        text: 'I can drop by tomorrow morning to inspect the pipe layout! 🔧',
        timestamp: '14:18',
        isMe: false
      }
    ]
  },
  {
    id: 'chat_michael',
    participantId: 'usr_michael',
    participantName: 'Michael Botha',
    participantHandle: '@michael_carpentry',
    participantAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    online: false,
    lastMessage: 'The custom oak table is ready for delivery!',
    lastMessageTime: 'Yesterday',
    unreadCount: 0,
    messages: [
      {
        id: 'msg_m1',
        senderId: 'usr_michael',
        senderName: 'Michael Botha',
        senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
        text: 'The custom oak table is ready for delivery!',
        timestamp: 'Yesterday',
        isMe: false
      }
    ]
  },
  {
    id: 'chat_john',
    participantId: 'usr_john',
    participantName: 'John Dlamini',
    participantHandle: '@john_dlamini',
    participantAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    online: true,
    lastMessage: 'Are you attending the Mambisa fest this Thursday?',
    lastMessageTime: 'Aug 17',
    unreadCount: 0,
    messages: [
      {
        id: 'msg_j1',
        senderId: 'usr_john',
        senderName: 'John Dlamini',
        senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
        text: 'Are you attending the Mambisa fest this Thursday?',
        timestamp: 'Aug 17',
        isMe: false
      }
    ]
  }
];
