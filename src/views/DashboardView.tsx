/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Application, AssessmentResult, Project, ProjectMatchScore } from '../types';
import { 
  Sparkles, 
  Award, 
  FileText, 
  Bookmark, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Target,
  AlertCircle
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (view: string, params?: any) => void;
  onOpenProject: (project: Project) => void;
}

export function DashboardView({ onNavigate, onOpenProject }: DashboardViewProps) {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<AssessmentResult[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [recommendations, setRecommendations] = useState<ProjectMatchScore[]>([]);
  const [bookmarkedProjects, setBookmarkedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      if (!user) return;
      try {
        setLoading(true);
        const [asmtRes, appRes, recRes, projRes, bmRes] = await Promise.all([
          fetch('/api/assessments/history', {
            headers: { 'Authorization': `Bearer ${user.uid}`, 'x-devmatch-uid': user.uid }
          }),
          fetch('/api/applications/my', {
            headers: { 'Authorization': `Bearer ${user.uid}`, 'x-devmatch-uid': user.uid }
          }),
          fetch('/api/recommendations', {
            headers: { 'Authorization': `Bearer ${user.uid}`, 'x-devmatch-uid': user.uid }
          }),
          fetch('/api/projects'),
          fetch('/api/bookmarks', {
            headers: { 'Authorization': `Bearer ${user.uid}`, 'x-devmatch-uid': user.uid }
          })
        ]);

        if (asmtRes.ok) {
          const data = await asmtRes.json();
          setAssessments(data.assessments || []);
        }
        if (appRes.ok) {
          const data = await appRes.json();
          setApplications(data.applications || []);
        }
        if (recRes.ok) {
          const data = await recRes.json();
          setRecommendations(data.recommendations || []);
        }
        if (projRes.ok && bmRes.ok) {
          const projData = await projRes.json();
          const bmData = await bmRes.json();
          const bmIds = bmData.bookmarkIds || [];
          const bms = (projData.projects as Project[] || []).filter(p => bmIds.includes(p.id));
          setBookmarkedProjects(bms);
        }
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [user]);

  if (!user) return null;

  // Calculate profile completion percentage based on real fields
  let completionPoints = 0;
  if (user.name) completionPoints += 20;
  if (user.bio) completionPoints += 20;
  if (user.skills && user.skills.length >= 3) completionPoints += 20;
  if (user.experienceLevel) completionPoints += 20;
  if (user.education || user.portfolioUrl || user.githubUrl) completionPoints += 20;

  // Real application status counts
  const pendingApps = applications.filter(a => a.status === 'Pending').length;
  const shortlistedApps = applications.filter(a => a.status === 'Shortlisted').length;
  const acceptedApps = applications.filter(a => a.status === 'Accepted').length;
  const rejectedApps = applications.filter(a => a.status === 'Rejected').length;

  const topMatch = recommendations[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome & Profile Strength Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-indigo-100 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Developer Cockpit</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user.name}!
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">
            {user.role === 'recruiter' 
              ? 'You are signed in as Project Lead. Review incoming candidates and update project statuses.'
              : `You have ${recommendations.length} calculated project matches and ${applications.length} submitted applications.`}
          </p>
        </div>

        {/* Profile Strength Indicator */}
        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-white/20 self-stretch sm:self-auto">
          <div className="relative w-14 h-14 flex items-center justify-center">
            <svg className="w-14 h-14 transform -rotate-90">
              <circle cx="28" cy="28" r="22" stroke="currentColor" strokeWidth="4" className="text-white/20" fill="transparent" />
              <circle
                cx="28"
                cy="28"
                r="22"
                stroke="currentColor"
                strokeWidth="4"
                className="text-white"
                strokeDasharray={2 * Math.PI * 22}
                strokeDashoffset={(2 * Math.PI * 22) * (1 - completionPoints / 100)}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <span className="absolute text-xs font-bold text-white">{completionPoints}%</span>
          </div>
          <div>
            <p className="text-xs font-bold text-white">Profile Strength</p>
            <button
              onClick={() => onNavigate('profile')}
              className="text-[11px] text-indigo-200 hover:text-white underline mt-0.5"
            >
              Edit skills & links
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core Quantitative Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Quizzes Passed</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{assessments.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">
            {assessments.length > 0 ? `Latest: ${assessments[0].skill} (${assessments[0].percentageScore}%)` : 'No assessments taken yet'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Top Match Rating</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-indigo-600">
            {topMatch ? `${topMatch.overallScore}%` : 'N/A'}
          </p>
          <p className="text-[11px] text-slate-500 mt-1 truncate">
            {topMatch ? topMatch.project.title : 'Explore projects'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Applications</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{applications.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">
            {shortlistedApps} Shortlisted • {pendingApps} Pending
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bookmarked</span>
            <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
              <Bookmark className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{bookmarkedProjects.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Saved for later review</p>
        </div>
      </div>

      {/* Main 2-Column Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Recommended Matches & Recent Assessments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top Recommended Projects Preview */}
          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Personalized Match Matches</h3>
                <p className="text-xs text-slate-500">Based on your skills, experience, and verified quiz performance</p>
              </div>
              <button
                onClick={() => onNavigate('recommendations')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
              >
                <span>View all ({recommendations.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading recommendations...</div>
            ) : recommendations.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-medium text-slate-600">No project matches found for current skills.</p>
                <button
                  onClick={() => onNavigate('profile')}
                  className="text-xs font-semibold text-indigo-600 hover:underline"
                >
                  Add skills to your profile
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {recommendations.slice(0, 3).map(rec => (
                  <div
                    key={rec.projectId}
                    className="p-4 rounded-xl border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700">
                          {rec.overallScore}% MATCH
                        </span>
                        <span className="text-xs font-medium text-slate-400">•</span>
                        <span className="text-xs font-medium text-slate-500">{rec.project.category}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 hover:text-indigo-600 cursor-pointer" onClick={() => onOpenProject(rec.project)}>
                        {rec.project.title}
                      </h4>
                      <p className="text-xs text-slate-600 line-clamp-1">{rec.explanationSummary}</p>
                    </div>

                    <button
                      onClick={() => onOpenProject(rec.project)}
                      className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shrink-0 transition-colors"
                    >
                      <span>Review & Apply</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Verified Assessment History */}
          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Verified Skill Assessments</h3>
                <p className="text-xs text-slate-500">Official badges earned through server-evaluated adaptive quizzes</p>
              </div>
              <button
                onClick={() => onNavigate('assessment')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
              >
                <span>Take a quiz</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {assessments.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
                <Award className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-semibold text-slate-700">No verified skills yet</p>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  Take a 10-question adaptive assessment in React, TypeScript, Python, or SQL to boost your match scores.
                </p>
                <button
                  onClick={() => onNavigate('assessment')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold mt-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Start Assessment</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {assessments.map(asmt => (
                  <div key={asmt.assessmentId} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{asmt.skill}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase bg-emerald-100 text-emerald-800">
                          {asmt.proficiencyLevel}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Score: <span className="font-bold text-slate-800">{asmt.percentageScore}%</span> ({asmt.correctAnswers}/{asmt.totalQuestions} correct)
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Completed: {new Date(asmt.completedAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0">
                      {asmt.percentageScore}%
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Application Status & Suggested Actions */}
        <div className="space-y-6">
          {/* Application Pipeline Status */}
          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">Application Pipeline</h3>
            
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600">Pending Review</span>
                <span className="font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">{pendingApps}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-indigo-600">Shortlisted Candidates</span>
                <span className="font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">{shortlistedApps}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-emerald-600">Accepted / Offered</span>
                <span className="font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">{acceptedApps}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-400">Archived / Rejected</span>
                <span className="font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500">{rejectedApps}</span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('applications')}
              className="w-full mt-2 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors flex items-center justify-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Track All Applications</span>
            </button>
          </div>

          {/* Suggested Next Actions */}
          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-900">Recommended Next Steps</h3>
            
            <div className="space-y-2 text-xs">
              <div 
                onClick={() => onNavigate('assessment')}
                className="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 cursor-pointer transition-all flex items-start gap-2.5"
              >
                <Award className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900">Take a technical skill quiz</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">Validates your proficiency for recruiters.</p>
                </div>
              </div>

              <div 
                onClick={() => onNavigate('profile')}
                className="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 cursor-pointer transition-all flex items-start gap-2.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900">Add GitHub & LinkedIn URLs</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">Increases profile trust and completeness.</p>
                </div>
              </div>

              <div 
                onClick={() => onNavigate('projects')}
                className="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 cursor-pointer transition-all flex items-start gap-2.5"
              >
                <Layers className="w-4 h-4 text-violet-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900">Explore open projects</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">Filter by remote availability and tech stack.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
