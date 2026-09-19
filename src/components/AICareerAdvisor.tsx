import React, { useState } from 'react';
import { User, SouthAfricanProvince } from '../types';
import { Sparkles, FileText, Compass, Copy, Check, ArrowRight, BookOpen, Briefcase, ShieldCheck, RefreshCw } from 'lucide-react';

interface AICareerAdvisorProps {
  currentUser: User;
  onNavigateView: (view: any) => void;
}

export const AICareerAdvisor: React.FC<AICareerAdvisorProps> = ({ currentUser, onNavigateView }) => {
  const [activeTab, setActiveTab] = useState<'roadmap' | 'cv_builder' | 'service_formatter'>('roadmap');

  // Roadmap Form State
  const [careerField, setCareerField] = useState('Full Stack Software Engineering');
  const [educationLevel, setEducationLevel] = useState(currentUser.educationLevel || 'Matric (Grade 12)');
  const [location, setLocation] = useState(currentUser.location || 'Johannesburg, Gauteng');
  const [roadmapResult, setRoadmapResult] = useState<any>(null);
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);

  // CV Builder Form State
  const [cvName, setCvName] = useState(currentUser.name);
  const [cvTargetRole, setCvTargetRole] = useState('Junior Systems Developer');
  const [cvEducation, setCvEducation] = useState('Matric Certificate with Mathematics');
  const [cvSkillsInput, setCvSkillsInput] = useState('React, TypeScript, Problem Solving, Communication, HTML/CSS');
  const [cvResult, setCvResult] = useState<any>(null);
  const [loadingCv, setLoadingCv] = useState(false);
  const [copiedCv, setCopiedCv] = useState(false);

  // Generate Career Roadmap
  const handleGenerateRoadmap = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoadingRoadmap(true);

    try {
      const res = await fetch('/api/ai/career-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ careerField, educationLevel, location })
      });
      const data = await res.json();
      setRoadmapResult(data);
    } catch (err) {
      console.error(err);
      // Fallback
      setRoadmapResult({
        field: careerField,
        summary: `Personalized South African learning pathway for ${careerField} in ${location}.`,
        steps: [
          {
            phase: 'Step 1: Core Fundamentals (Months 1-2)',
            title: 'Foundational Skills & Certification',
            description: 'Complete foundational course on SkillHub ZA and earn your SETA-recognized NQF level badge.',
            recommendedCourses: ['Full-Stack Software Development', 'Digital Marketing Basics']
          },
          {
            phase: 'Step 2: Practical Experience (Months 3-5)',
            title: 'Portfolio & Freelance Projects',
            description: 'Build 3 real-world projects and list your services on the SkillHub ZA Youth Marketplace.',
            recommendedCourses: ['Git Workflows & Cloud Hosting']
          },
          {
            phase: 'Step 3: SETA Learnership Placement (Months 6-12)',
            title: 'Funded Workplace Learnership',
            description: 'Apply for MICT SETA or BankSETA sponsored learnerships with monthly stipends ranging R4,500 - R7,000.',
            recommendedCourses: ['MICT SETA Systems Development Learnership']
          },
          {
            phase: 'Step 4: Industry Employment (Year 2+)',
            title: 'Junior Specialist & Mentorship',
            description: 'Book 1-on-1 mentorship sessions with South African industry leaders and apply for permanent positions.'
          }
        ],
        recommendedSeta: 'MICT SETA / Services SETA',
        keySkillsToMaster: ['Modern Frameworks', 'Database Design', 'Agile Workflows', 'Problem Solving']
      });
    } finally {
      setLoadingRoadmap(false);
    }
  };

  // Generate SETA CV
  const handleGenerateCv = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingCv(true);

    const skillsArray = cvSkillsInput.split(',').map(s => s.trim()).filter(Boolean);

    try {
      const res = await fetch('/api/ai/cv-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cvName,
          location,
          targetRole: cvTargetRole,
          education: cvEducation,
          skills: skillsArray
        })
      });
      const data = await res.json();
      setCvResult(data);
    } catch (err) {
      console.error(err);
      setCvResult({
        professionalSummary: `Dedicated and results-oriented ${cvTargetRole} based in ${location}. Completed verified skills development training on SkillHub ZA with a strong background in ${skillsArray.join(', ')}. Driven to contribute to dynamic South African technology teams.`,
        keySkillsFormatted: skillsArray.map(s => `• ${s}`),
        suggestedCoverLetter: `Dear Hiring Committee,\n\nI am writing to express my enthusiastic application for the ${cvTargetRole} opportunity. Having completed coursework and practical portfolio projects through SkillHub ZA, I am equipped with relevant competencies aligned with SETA standards.\n\nI look forward to discussing how my dedication and skills can contribute to your goals.\n\nSincerely,\n${cvName}`
      });
    } finally {
      setLoadingCv(false);
    }
  };

  const handleCopyCvText = () => {
    if (!cvResult) return;
    const fullText = `CURRICULUM VITAE - ${cvName.toUpperCase()}\nLocation: ${location}\nTarget Role: ${cvTargetRole}\n\nPROFESSIONAL SUMMARY:\n${cvResult.professionalSummary}\n\nKEY COMPETENCIES:\n${cvResult.keySkillsFormatted.join('\n')}\n\nCOVER LETTER:\n${cvResult.suggestedCoverLetter}`;
    navigator.clipboard.writeText(fullText);
    setCopiedCv(true);
    setTimeout(() => setCopiedCv(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Gemini 3.8 Flash AI Engine</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">SkillHub ZA AI Career & CV Assistant</h1>
            <p className="text-xs text-slate-300 font-medium max-w-xl mt-1">
              Build personalized South African learning pathways, generate SETA-aligned CVs, and optimize your application profiles for top learnerships.
            </p>
          </div>

          <div className="flex bg-slate-800/80 p-1 rounded-2xl border border-slate-700/80 text-xs font-bold">
            <button
              onClick={() => setActiveTab('roadmap')}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === 'roadmap' ? 'bg-emerald-500 text-slate-950 shadow-md font-black' : 'text-slate-300 hover:text-white'
              }`}
            >
              Career Roadmap
            </button>
            <button
              onClick={() => setActiveTab('cv_builder')}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === 'cv_builder' ? 'bg-emerald-500 text-slate-950 shadow-md font-black' : 'text-slate-300 hover:text-white'
              }`}
            >
              SETA CV Builder
            </button>
          </div>
        </div>
      </div>

      {/* Main View: Career Roadmap */}
      {activeTab === 'roadmap' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Form Side */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-600" />
              <span>Career Roadmap Generator</span>
            </h3>

            <form onSubmit={handleGenerateRoadmap} className="space-y-3">
              <div>
                <label className="text-xs font-extrabold text-slate-700 block mb-1">Target Career Field</label>
                <select
                  value={careerField}
                  onChange={(e) => setCareerField(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                >
                  <option value="Full Stack Software Engineering">Full Stack Software Engineering</option>
                  <option value="Solar PV & Backup Power Technician">Solar PV & Backup Power Technician</option>
                  <option value="Cyber Security & Cloud Support">Cyber Security & Cloud Support</option>
                  <option value="Digital Marketing & E-Commerce">Digital Marketing & E-Commerce</option>
                  <option value="Data Analytics & Python">Data Analytics & Python</option>
                  <option value="Agri-Tech & Hydroponic Farming">Agri-Tech & Hydroponic Farming</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-700 block mb-1">Current Education Level</label>
                <select
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                >
                  <option value="Matric (Grade 12)">Matric (Grade 12)</option>
                  <option value="N3 / N6 TVET Certificate">N3 / N6 TVET Certificate</option>
                  <option value="National Diploma">National Diploma</option>
                  <option value="Bachelor Degree">Bachelor Degree</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-700 block mb-1">Location Province</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <button
                type="submit"
                disabled={loadingRoadmap}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                {loadingRoadmap ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{loadingRoadmap ? 'Generating Pathway...' : 'Generate AI Roadmap'}</span>
              </button>
            </form>
          </div>

          {/* Results Side */}
          <div className="lg:col-span-7 space-y-4">
            {roadmapResult ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-5">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <div>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold text-[10px] px-2.5 py-0.5 rounded">
                      SETA Focus: {roadmapResult.recommendedSeta}
                    </span>
                    <h3 className="text-base font-black text-slate-900 mt-1">{roadmapResult.field} Pathway</h3>
                  </div>
                </div>

                <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {roadmapResult.summary}
                </p>

                {/* Steps Timeline */}
                <div className="space-y-4">
                  {roadmapResult.steps.map((step: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 transition-all">
                      <div className="w-8 h-8 rounded-xl bg-slate-900 text-emerald-400 font-black text-xs flex items-center justify-center shrink-0 border border-slate-800">
                        {idx + 1}
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider block">{step.phase}</span>
                        <h4 className="font-extrabold text-xs text-slate-900">{step.title}</h4>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">{step.description}</p>
                        {step.recommendedCourses && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {step.recommendedCourses.map((c: string) => (
                              <span key={c} className="text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                                📚 {c}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Shortcuts */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => onNavigateView('courses')}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                    <span>View SkillHub Courses</span>
                  </button>

                  <button
                    onClick={() => onNavigateView('learnerships')}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl hover:bg-emerald-400"
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Find SETA Learnerships</span>
                  </button>
                </div>

              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
                <Compass className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="font-extrabold text-sm text-slate-800">Generate Your Personalized SA Roadmap</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Select your target career field and click "Generate AI Roadmap" to get a 4-step actionable guidance plan tailored for South Africa.
                </p>
                <button
                  onClick={() => handleGenerateRoadmap()}
                  className="px-4 py-2 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl hover:bg-emerald-400"
                >
                  Generate Sample Roadmap
                </button>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Main View: SETA CV Builder */}
      {activeTab === 'cv_builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>SETA-Aligned CV Generator</span>
            </h3>

            <form onSubmit={handleGenerateCv} className="space-y-3">
              <div>
                <label className="text-xs font-extrabold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={cvName}
                  onChange={(e) => setCvName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-700 block mb-1">Target Learnership / Role Title</label>
                <input
                  type="text"
                  required
                  value={cvTargetRole}
                  onChange={(e) => setCvTargetRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-700 block mb-1">Highest Qualification</label>
                <input
                  type="text"
                  required
                  value={cvEducation}
                  onChange={(e) => setCvEducation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-700 block mb-1">Top Skills (comma separated)</label>
                <textarea
                  rows={2}
                  value={cvSkillsInput}
                  onChange={(e) => setCvSkillsInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <button
                type="submit"
                disabled={loadingCv}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                {loadingCv ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{loadingCv ? 'Formatting CV Profile...' : 'Build SETA CV & Cover Letter'}</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-4">
            {cvResult ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-sm text-slate-900">{cvName} — Formatted Profile</h3>
                    <p className="text-xs text-emerald-600 font-bold">{cvTargetRole}</p>
                  </div>

                  <button
                    onClick={handleCopyCvText}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold text-xs rounded-xl transition-all"
                  >
                    {copiedCv ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCv ? 'Copied to Clipboard!' : 'Copy Full CV Text'}</span>
                  </button>
                </div>

                <div className="space-y-3 text-xs text-slate-800">
                  <div>
                    <h4 className="font-extrabold text-slate-400 uppercase text-[10px] tracking-wider mb-1">Executive Summary</h4>
                    <p className="p-3 bg-slate-50 rounded-xl border border-slate-100 leading-relaxed font-medium">
                      {cvResult.professionalSummary}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-slate-400 uppercase text-[10px] tracking-wider mb-1">Key Competencies</h4>
                    <div className="grid grid-cols-2 gap-1.5 p-3 bg-slate-50 rounded-xl border border-slate-100 font-semibold">
                      {cvResult.keySkillsFormatted.map((sk: string, i: number) => (
                        <span key={i} className="text-slate-700">{sk}</span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-slate-400 uppercase text-[10px] tracking-wider mb-1">Learnership Cover Letter Draft</h4>
                    <pre className="p-3 bg-slate-50 rounded-xl border border-slate-100 font-sans text-xs whitespace-pre-wrap leading-relaxed">
                      {cvResult.suggestedCoverLetter}
                    </pre>
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
                <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="font-extrabold text-sm text-slate-800">Generate Your SETA-Aligned CV</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Fill in your details on the left and click "Build SETA CV" to produce a professional summary & tailored cover letter.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
