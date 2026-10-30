/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Award, 
  Target, 
  CheckCircle2, 
  ShieldCheck, 
  Terminal, 
  Code, 
  Compass, 
  Layers, 
  ChevronDown, 
  ChevronUp,
  Search,
  ExternalLink
} from 'lucide-react';
import { Project } from '../types';

interface LandingViewProps {
  featuredProjects: Project[];
  onExploreProjects: () => void;
  onStartQuiz: () => void;
  onOpenProject: (project: Project) => void;
}

export function LandingView({
  featuredProjects,
  onExploreProjects,
  onStartQuiz,
  onOpenProject
}: LandingViewProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'How does the AI Adaptive Skill Assessment work?',
      a: 'Our server evaluates your technical knowledge in real-time. As you answer correctly, subsequent questions adapt dynamically to intermediate and advanced levels. If you encounter difficulty, questions adjust to diagnose foundational understanding. Correct answers are kept strictly server-side until evaluated.'
    },
    {
      q: 'How is my match percentage computed?',
      a: 'We use a deterministic, explainable algorithm: 50 points for required skill coverage, 15 points for optional skills, 20 points for verified assessment scores, 10 points for experience alignment, and 5 points for preferred technologies. We never fabricate scores or pretend you have skills you haven’t added or proven.'
    },
    {
      q: 'Can project owners and recruiters post real opportunities?',
      a: 'Yes! Authorized project leads can create new technical projects, define required/optional skill stacks, review applicant portfolios, and evaluate verified quiz scores directly in Recruiter Studio.'
    },
    {
      q: 'Is there a cost to take assessments or apply to projects?',
      a: 'DevMatch is completely free for developers, students, and open-source contributors.'
    }
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-slate-200/80 bg-gradient-to-b from-indigo-50/50 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-100/80 border border-indigo-200 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-6 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Driven Developer Matching Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Find Projects That <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 bg-clip-text text-transparent">Match Your Skills</span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Discover production-grade projects tailored to your tech stack. Prove your abilities through adaptive quizzes, receive transparent match scores, and track your applications in one seamless platform.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onStartQuiz}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02]"
            >
              <Award className="w-4 h-4" />
              <span>Take Adaptive Skill Quiz</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
            <button
              onClick={onExploreProjects}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm border border-slate-200 shadow-sm transition-colors"
            >
              <Compass className="w-4 h-4 text-slate-500" />
              <span>Explore All Projects</span>
            </button>
          </div>

          {/* Transparent Live Platform Capabilities */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-500 font-medium">Matching Engine</p>
              <p className="text-xl font-bold text-slate-900 mt-1">Deterministic</p>
              <p className="text-[11px] text-slate-400 mt-0.5">5-Factor weighted scoring</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-500 font-medium">Adaptive Quizzes</p>
              <p className="text-xl font-bold text-indigo-600 mt-1">15 Tech Skills</p>
              <p className="text-[11px] text-slate-400 mt-0.5">React, Node, SQL, Python...</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-500 font-medium">Server Security</p>
              <p className="text-xl font-bold text-slate-900 mt-1">Zero-Leak</p>
              <p className="text-[11px] text-slate-400 mt-0.5">No client-side answer keys</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-500 font-medium">AI Grounding</p>
              <p className="text-xl font-bold text-violet-600 mt-1">Gemini 2.5</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Contextual feedback synthesis</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">Architectural Workflow</h2>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">How DevMatch Connects Developers to Impactful Projects</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm relative group hover:border-indigo-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm mb-4">
              01
            </div>
            <h4 className="font-bold text-slate-900 text-base mb-1.5">Define Your Profile</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Declare your technical proficiencies, preferred technologies, and experience tier in your verified profile.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm relative group hover:border-indigo-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm mb-4">
              02
            </div>
            <h4 className="font-bold text-slate-900 text-base mb-1.5">Prove Your Skills</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Complete an adaptive technical quiz. Questions adjust difficulty dynamically while server-side evaluation grades your answers.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm relative group hover:border-indigo-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm mb-4">
              03
            </div>
            <h4 className="font-bold text-slate-900 text-base mb-1.5">Algorithmic Matching</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Our 5-factor scoring model correlates required skills, optional stack, and verified assessment scores to calculate transparent match ratings.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm relative group hover:border-indigo-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm mb-4">
              04
            </div>
            <h4 className="font-bold text-slate-900 text-base mb-1.5">Apply & Track</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Submit custom cover notes directly. Track real status updates (Shortlisted, Accepted, Reviewed) with comprehensive audit trails.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Live Projects */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">Curated Opportunities</h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">Featured Active Projects</h3>
          </div>
          <button
            onClick={onExploreProjects}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            <span>Browse all open projects</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredProjects.slice(0, 3).map(project => (
            <div
              key={project.id}
              className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {project.category}
                  </span>
                  <span className="text-[11px] font-medium text-slate-600">
                    {project.remoteAllowed ? 'Remote' : project.location}
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-base line-clamp-2 leading-snug mb-2">
                  {project.title}
                </h4>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                  {project.shortDescription}
                </p>

                <div className="space-y-1.5 mb-4">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Required Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {project.requiredSkills.map(sk => (
                      <span key={sk} className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-600">
                  {project.numberOfOpenings} opening{project.numberOfOpenings > 1 ? 's' : ''}
                </span>
                <button
                  onClick={() => onOpenProject(project)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs transition-colors"
                >
                  <span>Details & Apply</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AI Assessment Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
          <div className="max-w-2xl relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real-Time Adaptive Assessment</span>
            </div>
            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Test Your Real-World Coding & Architectural Knowledge
            </h3>
            <p className="text-indigo-200 text-xs sm:text-sm leading-relaxed">
              Forget trivial trivia. Take our 10-question adaptive assessment covering React, TypeScript, Node.js, Python, or SQL. Earn a verified proficiency badge to automatically rank at the top of recruiter shortlists.
            </p>
            <div className="pt-2">
              <button
                onClick={onStartQuiz}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-100 text-indigo-900 font-bold text-xs shadow-md transition-transform hover:scale-[1.02]"
              >
                <span>Launch Skill Assessment</span>
                <ArrowRight className="w-4 h-4 text-indigo-600" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">Frequently Asked Questions</h2>
          <h3 className="text-2xl font-bold text-slate-900">Everything You Need to Know</h3>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 bg-white overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between text-sm font-semibold text-slate-800 hover:text-indigo-600 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
