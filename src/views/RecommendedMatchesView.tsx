/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Project, ProjectMatchScore } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Award, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  Layers,
  HelpCircle
} from 'lucide-react';

interface RecommendedMatchesViewProps {
  onOpenProject: (project: Project) => void;
  onTakeAssessment: (skill: string) => void;
}

export function RecommendedMatchesView({ onOpenProject, onTakeAssessment }: RecommendedMatchesViewProps) {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<ProjectMatchScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);

  useEffect(() => {
    async function loadMatches() {
      if (!user) return;
      try {
        setLoading(true);
        const res = await fetch('/api/recommendations', {
          headers: {
            'Authorization': `Bearer ${user.uid}`,
            'x-devmatch-uid': user.uid
          }
        });
        if (res.ok) {
          const data = await res.json();
          setRecommendations(data.recommendations || []);
          if (data.recommendations && data.recommendations.length > 0) {
            setExpandedMatchId(data.recommendations[0].projectId);
          }
        }
      } catch (err) {
        console.error('Error fetching recommendations:', err);
      } finally {
        setLoading(false);
      }
    }

    loadMatches();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-sm text-slate-600">Please sign in to view your personalized project recommendations.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>5-Factor Deterministic Match Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Recommended Matches</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Calculated strictly from your profile skills, verified assessment history, and experience tier.
          </p>
        </div>

        {/* Explainability legend badge */}
        <div className="hidden lg:flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
          <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>Formula: Required Skills (50) + Optional (15) + Quiz Proof (20) + Exp (10) + Tech (5) = 100%</span>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Computing deterministic compatibility scores...</div>
      ) : recommendations.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 space-y-3">
          <Layers className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No project matches found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Add your primary technical skills and complete an adaptive quiz to generate recommended matches.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map(match => {
            const isExpanded = expandedMatchId === match.projectId;
            const scoreColor = 
              match.overallScore >= 80 
                ? 'bg-emerald-500' 
                : match.overallScore >= 60 
                ? 'bg-indigo-600' 
                : 'bg-amber-500';

            return (
              <div
                key={match.projectId}
                className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm hover:border-indigo-300 transition-all"
              >
                {/* Main Card Header */}
                <div className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Overall Score Badge */}
                      <span className={`px-2.5 py-1 rounded-lg text-white font-extrabold text-xs tracking-wider shadow-sm ${scoreColor}`}>
                        {match.overallScore}% MATCH
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                        {match.project.category}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                        {match.project.projectType}
                      </span>
                      <span className="text-xs text-slate-500">
                        {match.project.remoteAllowed ? 'Remote' : match.project.location}
                      </span>
                    </div>

                    <h3 
                      onClick={() => onOpenProject(match.project)}
                      className="text-lg font-bold text-slate-900 hover:text-indigo-600 cursor-pointer"
                    >
                      {match.project.title}
                    </h3>

                    {/* AI-grounded / Deterministic Match Summary */}
                    <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100/80 text-xs text-slate-700 flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <p className="leading-relaxed font-medium">
                        {match.explanationSummary}
                      </p>
                    </div>
                  </div>

                  {/* Actions & Expansion Toggle */}
                  <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
                    <button
                      onClick={() => setExpandedMatchId(isExpanded ? null : match.projectId)}
                      className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
                      aria-expanded={isExpanded}
                    >
                      <span>{isExpanded ? 'Hide Breakdown' : 'Score Details'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => onOpenProject(match.project)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.01]"
                    >
                      <span>Apply</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expanded Explainability Breakdown */}
                {isExpanded && (
                  <div className="p-5 sm:p-6 bg-slate-50 border-t border-slate-200 space-y-6 text-xs">
                    {/* 5-Factor Score Bars */}
                    <div>
                      <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-3">
                        Weighted Compatibility Breakdown
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        <div className="p-3 rounded-xl bg-white border border-slate-200">
                          <p className="text-slate-500">Required Skills</p>
                          <p className="text-base font-bold text-slate-900 mt-0.5">{match.requiredSkillCoverageScore} / 50 pts</p>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                            <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${(match.requiredSkillCoverageScore / 50) * 100}%` }}></div>
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-white border border-slate-200">
                          <p className="text-slate-500">Optional Skills</p>
                          <p className="text-base font-bold text-slate-900 mt-0.5">{match.optionalSkillCoverageScore} / 15 pts</p>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                            <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${(match.optionalSkillCoverageScore / 15) * 100}%` }}></div>
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-white border border-slate-200">
                          <p className="text-slate-500">Quiz Evidence</p>
                          <p className="text-base font-bold text-emerald-600 mt-0.5">{match.assessmentEvidenceScore} / 20 pts</p>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(match.assessmentEvidenceScore / 20) * 100}%` }}></div>
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-white border border-slate-200">
                          <p className="text-slate-500">Experience Tier</p>
                          <p className="text-base font-bold text-slate-900 mt-0.5">{match.experienceCompatibilityScore} / 10 pts</p>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                            <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${(match.experienceCompatibilityScore / 10) * 100}%` }}></div>
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-white border border-slate-200">
                          <p className="text-slate-500">Tech & Interests</p>
                          <p className="text-base font-bold text-slate-900 mt-0.5">{match.techInterestOverlapScore} / 5 pts</p>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                            <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${(match.techInterestOverlapScore / 5) * 100}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Skill Overlap Detail */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Matching Skills */}
                      <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
                        <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Matched Skills ({match.matchingSkills.length})</span>
                        </div>
                        {match.matchingSkills.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {match.matchingSkills.map(sk => (
                              <span key={sk} className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                                {sk}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-400 text-xs">No matching required skills found in profile.</p>
                        )}
                      </div>

                      {/* Missing Required Skills with Call to Action */}
                      <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
                        <div className="flex items-center gap-1.5 text-amber-700 font-bold">
                          <AlertCircle className="w-4 h-4" />
                          <span>Missing Required Skills ({match.missingRequiredSkills.length})</span>
                        </div>
                        {match.missingRequiredSkills.length > 0 ? (
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            {match.missingRequiredSkills.map(sk => (
                              <button
                                key={sk}
                                onClick={() => onTakeAssessment(sk)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-medium text-[11px] transition-colors"
                              >
                                <Sparkles className="w-3 h-3 text-amber-600" />
                                <span>Take {sk} Quiz</span>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-emerald-600 font-semibold text-xs">You satisfy 100% of required skills!</p>
                        )}
                      </div>
                    </div>

                    {/* Verified Assessment Proofs */}
                    {match.assessedSkillsProof.length > 0 && (
                      <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
                        <div className="flex items-center gap-1.5 text-indigo-700 font-bold">
                          <Award className="w-4 h-4" />
                          <span>Verified Assessment Credentials Applied to Match</span>
                        </div>
                        <div className="flex flex-wrap gap-3 pt-1">
                          {match.assessedSkillsProof.map(proof => (
                            <div key={proof.skill} className="px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center gap-2">
                              <span className="font-bold text-slate-800">{proof.skill}:</span>
                              <span className="text-indigo-600 font-semibold">{proof.score}%</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-200/60 font-bold uppercase">{proof.proficiency}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
