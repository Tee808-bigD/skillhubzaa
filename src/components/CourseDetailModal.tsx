import React, { useState } from 'react';
import { Course } from '../types';
import { X, Award, Clock, BookOpen, CheckCircle, HelpCircle, ArrowRight, Star, ShieldCheck } from 'lucide-react';

interface CourseDetailModalProps {
  course: Course;
  isEnrolled: boolean;
  onClose: () => void;
  onEnroll: (courseId: string) => void;
}

export const CourseDetailModal: React.FC<CourseDetailModalProps> = ({
  course,
  isEnrolled,
  onClose,
  onEnroll
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'modules' | 'quiz'>('overview');
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const handleSelectAnswer = (qId: string, optIndex: number) => {
    setSelectedQuizAnswers(prev => ({ ...prev, [qId]: optIndex }));
  };

  const calculateScore = () => {
    if (!course.quiz) return 0;
    let correct = 0;
    course.quiz.forEach(q => {
      if (selectedQuizAnswers[q.id] === q.correctIndex) {
        correct++;
      }
    });
    return Math.round((correct / course.quiz.length) * 100);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header Image */}
        <div className="relative h-48 bg-slate-900">
          <img src={course.bannerImage} alt={course.title} className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-slate-900/80 text-white rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-5 right-5 text-white">
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-emerald-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded">
                {course.setaAccreditation}
              </span>
              <span className="bg-slate-800/90 text-amber-300 font-bold text-[10px] px-2 py-0.5 rounded">
                ⭐ {course.rating} Rating
              </span>
            </div>
            <h2 className="text-xl font-black">{course.title}</h2>
            <p className="text-xs text-slate-300 font-medium">Provided by {course.provider}</p>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-5 bg-slate-50 text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 border-b-2 transition-all ${
              activeTab === 'overview' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('modules')}
            className={`py-3 px-4 border-b-2 transition-all ${
              activeTab === 'modules' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Curriculum ({course.modules.length} Modules)
          </button>
          {course.quiz && course.quiz.length > 0 && (
            <button
              onClick={() => setActiveTab('quiz')}
              className={`py-3 px-4 border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'quiz' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
              <span>SETA Practice Quiz</span>
            </button>
          )}
        </div>

        {/* Modal Content Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-5">
          
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Description</h4>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">{course.description}</p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Learning Outcomes</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {course.outcomes.map((outcome, idx) => (
                    <div key={idx} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs text-slate-800 font-medium">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{outcome}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certificate & SETA Assurance Box */}
              <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/80 flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0" />
                <div className="text-xs">
                  <h5 className="font-extrabold text-emerald-900">Verified SETA Digital Credential</h5>
                  <p className="text-emerald-700">Upon successful completion, receive a downloadable digital certificate with a verifiable QR code recognized by SA employers.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'modules' && (
            <div className="space-y-3">
              {course.modules.map((m) => (
                <div key={m.id} className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 transition-all space-y-1">
                  <div className="flex items-center justify-between text-xs font-extrabold text-slate-900">
                    <span>{m.title}</span>
                    <span className="text-slate-400 font-medium">{m.duration}</span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">{m.summary}</p>
                  <div className="flex items-center gap-2 pt-1 text-[11px] font-bold text-emerald-600">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{m.lessonsCount} Video & Interactive Lessons</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'quiz' && course.quiz && (
            <div className="space-y-4">
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-800 font-medium flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Test your SETA knowledge! Answer the questions below to test your readiness.</span>
              </div>

              {course.quiz.map((q, idx) => (
                <div key={q.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <h5 className="font-extrabold text-xs text-slate-900">
                    Q{idx + 1}: {q.question}
                  </h5>
                  <div className="space-y-1.5">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = selectedQuizAnswers[q.id] === optIdx;
                      const isCorrect = q.correctIndex === optIdx;
                      
                      return (
                        <button
                          key={optIdx}
                          disabled={quizSubmitted}
                          onClick={() => handleSelectAnswer(q.id, optIdx)}
                          className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold border transition-all ${
                            quizSubmitted
                              ? isCorrect
                                ? 'bg-emerald-100 border-emerald-400 text-emerald-900 font-bold'
                                : isSelected
                                ? 'bg-rose-100 border-rose-300 text-rose-900'
                                : 'bg-white border-slate-200 text-slate-600'
                              : isSelected
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {quizSubmitted && (
                    <p className="text-[11px] text-slate-600 italic bg-white p-2 rounded-lg border border-slate-200 mt-2">
                      💡 {q.explanation}
                    </p>
                  )}
                </div>
              ))}

              {!quizSubmitted ? (
                <button
                  onClick={() => setQuizSubmitted(true)}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all"
                >
                  Submit Quiz Answers
                </button>
              ) : (
                <div className="p-4 bg-emerald-100 rounded-2xl border border-emerald-300 text-center space-y-1">
                  <h4 className="font-black text-emerald-950 text-sm">Quiz Score: {calculateScore()}%</h4>
                  <p className="text-xs text-emerald-800 font-semibold">
                    {calculateScore() >= 80 ? '🌟 Outstanding work! You demonstrate strong knowledge.' : 'Keep practicing and review course material!'}
                  </p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 block">Tuition Fee</span>
            <span className="font-black text-emerald-600 text-sm">{course.price}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Close
            </button>

            <button
              onClick={() => { onEnroll(course.id); onClose(); }}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                isEnrolled
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md hover:scale-105'
              }`}
            >
              <span>{isEnrolled ? 'Enrolled (Access Materials)' : 'Enroll in Course (Free)'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
