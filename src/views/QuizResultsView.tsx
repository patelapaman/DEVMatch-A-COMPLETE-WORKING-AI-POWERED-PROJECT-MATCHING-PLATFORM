/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AssessmentResult } from '../types';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  TrendingUp, 
  Sparkles, 
  BookOpen, 
  Check, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface QuizResultsViewProps {
  result: AssessmentResult;
  onRetake: () => void;
  onViewMatches: () => void;
}

export function QuizResultsView({
  result,
  onRetake,
  onViewMatches
}: QuizResultsViewProps) {
  const isPassing = result.percentageScore >= 60;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Top Hero Banner */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold uppercase tracking-wider">
            <Check className="w-3.5 h-3.5" />
            <span>Assessment Complete</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {result.skill} Diagnostic Evaluation
          </h1>
          <p className="text-xs text-slate-500 max-w-lg">
            Your results have been verified server-side and recorded to your developer profile.
          </p>
        </div>

        {/* Big Score Ring */}
        <div className="flex flex-col items-center">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" className="text-slate-100" fill="transparent" />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                className={isPassing ? 'text-emerald-500' : 'text-amber-500'}
                strokeDasharray={2 * Math.PI * 40}
                strokeDashoffset={(2 * Math.PI * 40) * (1 - result.percentageScore / 100)}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-2xl font-extrabold text-slate-900">{result.percentageScore}</span>
              <span className="text-xs text-slate-400 font-bold block -mt-1">%</span>
            </div>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider mt-2 px-2 py-0.5 rounded bg-slate-100 text-slate-700">
            {result.proficiencyLevel} Tier
          </span>
        </div>
      </div>

      {/* 4 Quantitative Breakdown Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <span className="text-slate-400 font-medium">Correct Answers</span>
          <p className="text-xl font-bold text-emerald-600 mt-1">
            {result.correctAnswers} / {result.totalQuestions}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Verified server-side</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <span className="text-slate-400 font-medium">Difficulty Reached</span>
          <p className="text-xl font-bold text-indigo-600 mt-1">{result.finalDifficulty}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Started at {result.initialDifficulty}</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <span className="text-slate-400 font-medium">Total Duration</span>
          <p className="text-xl font-bold text-slate-800 mt-1">
            {Math.floor(result.durationSeconds / 60)}m {result.durationSeconds % 60}s
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Avg ~{Math.round(result.durationSeconds / Math.max(1, result.totalQuestions))}s / question</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <span className="text-slate-400 font-medium">Adaptive Engine</span>
          <p className="text-xl font-bold text-violet-600 mt-1">
            {result.aiGeneratedQuestionCount > 0 ? 'AI Dynamic' : 'Curated Bank'}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {result.aiGeneratedQuestionCount} AI • {result.fallbackQuestionCount} Curated
          </p>
        </div>
      </div>

      {/* Detailed Analysis (Strengths & Areas for Improvement) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>Identified Strengths</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-600">
            {result.strengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Improvement & Recommended Learning Topics */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
            <BookOpen className="w-4 h-4" />
            <span>Targeted Growth Topics</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-600">
            {result.recommendedTopics.map((top, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0"></span>
                <span>{top}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Formal Certification Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p>
          <span className="font-semibold text-slate-700">Notice:</span> The proficiency rating presented here is an internal application-generated performance estimate computed to power project recommendations, and is not a formal state or third-party certification.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onRetake}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>Retake Assessment</span>
        </button>

        <button
          type="button"
          onClick={onViewMatches}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.01]"
        >
          <span>View Matched Projects</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
