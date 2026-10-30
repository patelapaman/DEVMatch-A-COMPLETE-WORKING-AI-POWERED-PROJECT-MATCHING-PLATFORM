/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { AssessmentResult, QuestionClient, SkillDifficulty } from '../types';
import { 
  Award, 
  Sparkles, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Code, 
  Check, 
  TrendingUp, 
  RotateCcw,
  Zap
} from 'lucide-react';

interface SkillAssessmentViewProps {
  initialSkill?: string;
  onAssessmentCompleted: (result: AssessmentResult) => void;
  onCancel: () => void;
}

export const SUPPORTED_SKILLS = [
  'JavaScript',
  'TypeScript',
  'React',
  'Node.js',
  'Python',
  'Java',
  'C++',
  'SQL',
  'MongoDB',
  'Firebase',
  'Data Structures and Algorithms',
  'Git',
  'REST APIs'
];

export function SkillAssessmentView({
  initialSkill,
  onAssessmentCompleted,
  onCancel
}: SkillAssessmentViewProps) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [phase, setPhase] = useState<'configure' | 'active' | 'feedback'>('configure');
  const [selectedSkill, setSelectedSkill] = useState<string>(initialSkill || 'React');
  const [initialDifficulty, setInitialDifficulty] = useState<SkillDifficulty>('Intermediate');
  const [totalQuestions, setTotalQuestions] = useState<number>(10);

  // Active quiz state
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionClient | null>(null);
  const [currentDifficulty, setCurrentDifficulty] = useState<SkillDifficulty>('Intermediate');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    selectedOptionIndex: number;
    correctOptionIndex: number;
    explanation: string;
  } | null>(null);
  const [difficultyHistory, setDifficultyHistory] = useState<SkillDifficulty[]>([]);

  // Timer effect
  useEffect(() => {
    let interval: any;
    if (phase === 'active' || phase === 'feedback') {
      interval = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [phase]);

  const startAssessment = async () => {
    if (!user) {
      showToast('Please sign in to take an assessment.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/assessments/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.uid}`,
          'x-devmatch-uid': user.uid
        },
        body: JSON.stringify({
          skill: selectedSkill,
          initialDifficulty,
          totalQuestions
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to start assessment');
      }

      const data = await res.json();
      setAssessmentId(data.assessmentId);
      setCurrentQuestion(data.question);
      setCurrentDifficulty(data.difficulty);
      setDifficultyHistory([data.difficulty]);
      setTimerSeconds(0);
      setPhase('active');
      setSelectedOption(null);
      setFeedback(null);
    } catch (err: any) {
      showToast(err.message || 'Error starting assessment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const submitAnswer = async () => {
    if (selectedOption === null || !currentQuestion || !assessmentId || !user) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/assessments/answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.uid}`,
          'x-devmatch-uid': user.uid
        },
        body: JSON.stringify({
          assessmentId,
          questionId: currentQuestion.id,
          selectedOptionIndex: selectedOption,
          timeSpentSeconds: 15
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to evaluate answer');
      }

      const data = await res.json();
      setFeedback(data.feedback);

      if (data.completed) {
        showToast('Assessment completed! Calculating final proficiency rating...', 'success');
        onAssessmentCompleted(data.result);
      } else {
        // Cache next question ready for when user clicks "Next Question"
        (window as any).__nextQuestion = data.nextQuestion;
        (window as any).__nextDifficulty = data.currentDifficulty;
        setPhase('feedback');
      }
    } catch (err: any) {
      showToast(err.message || 'Error submitting answer', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    const nextQ = (window as any).__nextQuestion;
    const nextDiff = (window as any).__nextDifficulty;
    if (nextQ) {
      setCurrentQuestion(nextQ);
      setCurrentDifficulty(nextDiff);
      setDifficultyHistory(prev => [...prev, nextDiff]);
      setSelectedOption(null);
      setFeedback(null);
      setPhase('active');
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  /* ----------------------------------------------------
     Phase 1: Configure & Start
  ---------------------------------------------------- */
  if (phase === 'configure') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Adaptive AI Diagnostics</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Skill Assessment Cockpit</h1>
            <p className="text-xs text-slate-500">
              Select a technical discipline to verify your abilities. Questions adapt in real-time based on your answers.
            </p>
          </div>

          {/* Skill Selector Grid */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5">
              1. Choose Technical Discipline
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {SUPPORTED_SKILLS.map(sk => {
                const isSelected = selectedSkill === sk;
                return (
                  <button
                    key={sk}
                    type="button"
                    onClick={() => setSelectedSkill(sk)}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/80 text-indigo-700 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{sk}</span>
                      {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Initial Difficulty */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              2. Initial Starting Difficulty
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['Beginner', 'Intermediate', 'Advanced'] as SkillDifficulty[]).map(diff => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setInitialDifficulty(diff)}
                  className={`p-3 rounded-xl border text-center text-xs font-semibold transition-all ${
                    initialDifficulty === diff
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Note: The adaptive engine will automatically calibrate difficulty higher or lower after every question.
            </p>
          </div>

          {/* Start CTA */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onCancel}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={startAssessment}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.01] disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              <span>{submitting ? 'Generating Quiz...' : 'Start Assessment (10 Questions)'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ----------------------------------------------------
     Phase 2 & 3: Active Question & Instant Feedback
  ---------------------------------------------------- */
  if (!currentQuestion) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Quiz Progress & HUD Header */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-bold text-sm text-slate-900">{currentQuestion.skill}</span>
          <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
            currentDifficulty === 'Advanced'
              ? 'bg-purple-100 text-purple-700'
              : currentDifficulty === 'Intermediate'
              ? 'bg-indigo-100 text-indigo-700'
              : 'bg-emerald-100 text-emerald-700'
          }`}>
            {currentDifficulty}
          </span>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs font-semibold text-slate-600">
            Question {currentQuestion.questionNumber} of {currentQuestion.totalQuestions}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{formatTime(timerSeconds)}</span>
        </div>
      </div>

      {/* Question Card */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
            {currentQuestion.question}
          </h2>

          {/* Code snippet if present */}
          {currentQuestion.codeSnippet && (
            <div className="mt-4 p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800">
              <pre>{currentQuestion.codeSnippet}</pre>
            </div>
          )}
        </div>

        {/* 4 Multiple Choice Options */}
        <div className="space-y-2.5">
          {currentQuestion.options.map((opt, idx) => {
            const isSelected = selectedOption === idx;
            
            // Visual coloring if in feedback phase
            let optionStyle = 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800';
            if (phase === 'active' && isSelected) {
              optionStyle = 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-500/20';
            } else if (phase === 'feedback' && feedback) {
              if (idx === feedback.correctOptionIndex) {
                optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold ring-2 ring-emerald-400/30';
              } else if (isSelected && !feedback.isCorrect) {
                optionStyle = 'border-rose-500 bg-rose-50 text-rose-950 ring-2 ring-rose-400/30';
              } else {
                optionStyle = 'border-slate-200 opacity-60 text-slate-600';
              }
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={phase === 'feedback'}
                onClick={() => setSelectedOption(idx)}
                className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all flex items-start gap-3 ${optionStyle}`}
              >
                <span className="w-6 h-6 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold shrink-0">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="flex-1 mt-0.5">{opt}</span>

                {phase === 'feedback' && feedback && (
                  <div className="shrink-0">
                    {idx === feedback.correctOptionIndex && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    )}
                    {isSelected && !feedback.isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-600" />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback Explanation Box */}
        {phase === 'feedback' && feedback && (
          <div className={`p-4 rounded-xl border text-xs leading-relaxed space-y-1.5 ${
            feedback.isCorrect
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
              : 'bg-rose-50/80 border-rose-200 text-rose-900'
          }`}>
            <div className="flex items-center gap-2 font-bold">
              {feedback.isCorrect ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Correct! Well done.</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>Incorrect.</span>
                </>
              )}
            </div>
            <p className="pt-1">{feedback.explanation}</p>
          </div>
        )}

        {/* Action Controls */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-medium">
            {phase === 'active' 
              ? 'Select an answer to submit for server verification.' 
              : 'Server verified. Ready for next adaptive question.'}
          </div>

          {phase === 'active' ? (
            <button
              type="button"
              disabled={selectedOption === null || submitting}
              onClick={submitAnswer}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 disabled:opacity-50 transition-all hover:scale-[1.01]"
            >
              <span>{submitting ? 'Verifying...' : 'Submit Answer'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNextQuestion}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.01]"
            >
              <span>Next Question</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
