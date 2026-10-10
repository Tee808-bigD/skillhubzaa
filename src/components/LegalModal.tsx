import React, { useState, useEffect } from 'react';
import { X, Download, ShieldCheck, FileText, CheckCircle2, Scale, Users, AlertTriangle } from 'lucide-react';
import apiClient from '../api/client';

export type LegalDocType = 'terms' | 'privacy' | 'community-guidelines';

interface LegalModalProps {
  type: LegalDocType;
  isOpen: boolean;
  onClose: () => void;
}

const FALLBACK_DOCS: Record<LegalDocType, { title: string; subtitle: string; content: string }> = {
  terms: {
    title: 'SkillHub Terms of Service',
    subtitle: 'Global Professional Marketplace Standards',
    content: `SKILLHUB — TERMS OF SERVICE
Effective Date: 1 January 2026
Governing Law: International Commercial Standards

1. PREAMBLE & ACCEPTANCE OF TERMS
Welcome to SkillHub, a global professional services and certified artisan marketplace platform. By creating an account, browsing content, or hiring a professional, you agree to these Terms of Service.

2. ELIGIBILITY & AGE VERIFICATION
- Minimum Age: You must be at least 13 years old to register. 
- Minors (Ages 13–17): In accordance with POPIA child protection principles, users under 18 are flagged as minors and require parental or legal guardian consent. Age-restricted (18+) content and direct unrestricted trade bookings are withheld from minor accounts.

3. ARTISAN ACCREDITATION & SETA CREDENTIALS
Users listing artisanal trade services (plumbing, electrical, solar, construction, mechanical) warrant that any claims of SETA, QCTO, or TVET accreditation are authentic. Misrepresentation of trade certifications is a breach of these Terms and may result in immediate expulsion and referral to regulatory authorities.

4. USER CONTENT & INTELLECTUAL PROPERTY LICENSE
You retain full copyright ownership of all photos, videos, and articles you post on SkillHub. By uploading content, you grant SkillHub a non-exclusive, worldwide, royalty-free, transferable license to store, host, display, and distribute your content across the platform solely to deliver our services.

5. PROHIBITED CONDUCT & SAFE HARBOR
SkillHub operates as an intermediary service provider. We do not tolerate:
- Hate speech, incitement to violence, racism, or tribalism.
- Harassment, cyber-bullying, or unauthorized disclosure of personal phone numbers.
- Unlicensed commercial financial schemes, pyramid promotions, or fraud.
- Copyright or trademark infringement.
Violations result in immediate removal of content and potential permanent termination of the user account.

6. LIMITATION OF LIABILITY & ESCROW
SkillHub provides an introductory marketplace. While we conduct verification audits, clients and artisans must exercise due diligence. SkillHub's aggregate liability under applicable law shall not exceed fees paid to the platform in the preceding 12 months.

7. DISPUTE RESOLUTION & JURISDICTION
These Terms are governed by fair international commercial standards. Any dispute shall be referred to arbitration under commercial arbitration rules.`,
  },
  privacy: {
    title: 'Privacy Policy',
    subtitle: 'Global Data Protection & Privacy Compliance',
    content: `SKILLHUB — GLOBAL PRIVACY POLICY & DATA SUBJECT NOTICE
Effective Date: 1 January 2026
Information Officer: privacy@skillhub.com

1. RESPONSIBLE PARTY DETAILS
SkillHub ("SkillHub") is committed to safeguarding the personal information of our global learners, mentors, and employers.

2. WHAT INFORMATION WE COLLECT
- Identity Data: Full name, username, date of birth, ID/passport number (for verified artisans only).
- Contact Details: Verified email address, phone/WhatsApp number, province, and city/township.
- Professional Records: Trade qualifications, SETA/QCTO certificates, portfolios, skill tags, and employment experience.
- Technical & Activity Data: IP address, login timestamps, chat messages, and device logs.

3. LAWFUL BASIS & SPECIFIC PURPOSE OF PROCESSING (SECTION 11)
We process your personal information strictly with your informed consent and for defined purposes:
- Creating and maintaining your public artisan portfolio and learner profile.
- Matching youth job seekers with verified mentors, learnerships, and client requests.
- Enforcing platform security, age-gate restrictions, and brute-force rate limiting.

4. YOUR DATA SUBJECT RIGHTS (POPIA SECTIONS 23–25)
Under POPIA, you have enforceable statutory rights:
- Right of Access (Section 23): You can download a complete JSON copy of your personal data at any time via your Profile Settings ("Download My Data").
- Right to Rectification (Section 24(1)(a)): You may update or correct inaccurate profile records directly via your account.
- Right to Destruction / Deletion (Section 24(1)(b)): You may trigger complete erasure of your personal records through the "Delete My Account" tool in your privacy settings.
- Right to Object (Section 11(3)): You may withdraw marketing consent at any time without penalty.

5. SECURITY MEASURES & BREACH NOTIFICATION (SECTION 19 & 22)
We employ robust technical safeguards including encrypted JWT sessions, HttpOnly cookies, salted password hashing, and role-based access control. In the unlikely event of a security compromise, we will notify both affected data subjects and the South African Information Regulator pursuant to Section 22.

6. CONTACT THE INFORMATION OFFICER & REGULATOR
Information Officer: privacy@skillhub.co.za | Tel: +27 (0) 11 555 0199
South African Information Regulator: complaints.IR@justice.gov.za | https://inforegulator.org.za`,
  },
  'community-guidelines': {
    title: 'Community Guidelines',
    subtitle: 'Fostering Respect, Integrity, and Professional Craftsmanship',
    content: `SKILLHUB — COMMUNITY GUIDELINES & ARTISAN CODE
Effective Date: 1 January 2026

1. THE SPIRIT OF MUTUAL RESPECT
SkillHub is built on the philosophy of mutual dignity, empathy, and professional integrity. We celebrate diversity across 50+ countries and expect all interactions between professionals, clients, and partners to be rooted in mutual trust and high standards.

2. ZERO TOLERANCE FOR HARMFUL CONTENT
The following behavior is strictly banned across all public feeds, reels, and direct messages:
- Hate Speech: Any expression advocating hatred, discrimination, or violence.
- Harassment & Exploitation: Threatening messages or predatory behavior.
- Falsified Trade Claims: Advertising electrical, gas, or building services without requisite certifications is illegal and endangers lives.
- Counterfeits & Scams: Promoting illegal pyramid schemes, fake deposits, or charging application fees.

3. CONTENT MODERATION & SAFE HARBOR ENFORCEMENT
Our moderation team acts on reports:
- First Violation: Warning and immediate removal of offending content.
- Second Violation: 7-day account suspension and review of verification status.
- Severe / Repeat Violations: Permanent ban, blacklisting of phone number, and reporting to relevant statutory bodies.

4. HOW TO REPORT A VIOLATION
Every post and comment on SkillHub features a three-dot menu with a "Report" action. Use it to alert our 24/7 moderation desk immediately.`,
  },
};

export const LegalModal: React.FC<LegalModalProps> = ({ type, isOpen, onClose }) => {
  const [docData, setDocData] = useState(FALLBACK_DOCS[type]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setDocData(FALLBACK_DOCS[type]);
    const fetchDoc = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get<{ title: string; content: string }>(`legal/${type}/`);
        if (response.data?.content) {
          setDocData({
            title: response.data.title || FALLBACK_DOCS[type].title,
            subtitle: FALLBACK_DOCS[type].subtitle,
            content: response.data.content,
          });
        }
      } catch (err) {
        // Use rich fallback
      } finally {
        setLoading(false);
      }
    };

    fetchDoc();
  }, [type, isOpen]);

  if (!isOpen) return null;

  const handleDownload = () => {
    const blob = new Blob([docData.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SkillHub_ZA_${type.toUpperCase().replace('-', '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getIcon = () => {
    switch (type) {
      case 'terms':
        return <Scale className="w-5 h-5 text-emerald-400" />;
      case 'privacy':
        return <ShieldCheck className="w-5 h-5 text-teal-400" />;
      case 'community-guidelines':
        return <Users className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-slate-800 border border-slate-700/60">
              {getIcon()}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">{docData.title}</h3>
              <p className="text-xs text-slate-400">{docData.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              title="Download Document"
              className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Download</span>
            </button>
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed font-mono whitespace-pre-wrap selection:bg-emerald-500 selection:text-slate-950">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <span>Loading official legal document...</span>
            </div>
          ) : (
            docData.content
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <CheckCircle2 className="w-4 h-4" /> Legally Enforceable in South Africa
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

export const TermsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = (props) => (
  <LegalModal type="terms" {...props} />
);

export const PrivacyPolicyModal: React.FC<{ isOpen: boolean; onClose: () => void }> = (props) => (
  <LegalModal type="privacy" {...props} />
);

export const CommunityGuidelinesModal: React.FC<{ isOpen: boolean; onClose: () => void }> = (props) => (
  <LegalModal type="community-guidelines" {...props} />
);

export default LegalModal;
