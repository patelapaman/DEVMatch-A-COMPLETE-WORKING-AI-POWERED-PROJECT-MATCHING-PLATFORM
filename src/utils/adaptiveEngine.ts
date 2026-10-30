/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AssessmentResult, QuestionAnswerRecord, SkillDifficulty } from '../types';

/**
 * Difficulty levels ordered from lowest to highest.
 */
export const DIFFICULTY_LEVELS: SkillDifficulty[] = ['Beginner', 'Intermediate', 'Advanced'];

/**
 * Calculates the next adaptive difficulty based on question history.
 * 
 * Rules:
 * - Start at the selected initial difficulty.
 * - After each answer, update next difficulty based on recent correctness.
 * - 2 consecutive correct answers -> step up difficulty (if not already Advanced)
 * - 2 consecutive incorrect answers -> step down difficulty (if not already Beginner)
 * - Avoid erratic flipping after a single question
 * - Always keep difficulty within allowed levels ['Beginner', 'Intermediate', 'Advanced']
 */
export function computeNextDifficulty(
  currentDifficulty: SkillDifficulty,
  recentAnswers: { isCorrect: boolean }[]
): SkillDifficulty {
  if (recentAnswers.length < 2) {
    return currentDifficulty;
  }

  const lastTwo = recentAnswers.slice(-2);
  const consecutiveCorrect = lastTwo.every(a => a.isCorrect);
  const consecutiveIncorrect = lastTwo.every(a => !a.isCorrect);

  const currentIndex = DIFFICULTY_LEVELS.indexOf(currentDifficulty);

  if (consecutiveCorrect && currentIndex < DIFFICULTY_LEVELS.length - 1) {
    return DIFFICULTY_LEVELS[currentIndex + 1];
  }

  if (consecutiveIncorrect && currentIndex > 0) {
    return DIFFICULTY_LEVELS[currentIndex - 1];
  }

  return currentDifficulty;
}

/**
 * Evaluates skill proficiency level based on percentage score and final reached difficulty.
 */
export function determineProficiencyLevel(
  percentageScore: number,
  finalDifficulty: SkillDifficulty
): 'Novice' | 'Competent' | 'Proficient' | 'Advanced' | 'Expert' {
  if (percentageScore >= 90 && finalDifficulty === 'Advanced') {
    return 'Expert';
  }
  if (percentageScore >= 80 && (finalDifficulty === 'Advanced' || finalDifficulty === 'Intermediate')) {
    return 'Advanced';
  }
  if (percentageScore >= 65) {
    return 'Proficient';
  }
  if (percentageScore >= 50) {
    return 'Competent';
  }
  return 'Novice';
}

/**
 * Evaluates completed assessment session into comprehensive AssessmentResult.
 */
export function compileAssessmentResult(params: {
  assessmentId: string;
  userId: string;
  skill: string;
  initialDifficulty: SkillDifficulty;
  finalDifficulty: SkillDifficulty;
  questionHistory: QuestionAnswerRecord[];
  durationSeconds: number;
  aiGeneratedQuestionCount: number;
  fallbackQuestionCount: number;
}): AssessmentResult {
  const totalQuestions = params.questionHistory.length;
  const correctAnswers = params.questionHistory.filter(q => q.isCorrect).length;
  const incorrectAnswers = totalQuestions - correctAnswers;
  const percentageScore = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  
  const proficiencyLevel = determineProficiencyLevel(percentageScore, params.finalDifficulty);

  // Generate actionable feedback based on answered questions
  const strengths: string[] = [];
  const areasForImprovement: string[] = [];
  const recommendedTopics: string[] = [];

  const correctQuestions = params.questionHistory.filter(q => q.isCorrect);
  const missedQuestions = params.questionHistory.filter(q => !q.isCorrect);

  if (correctQuestions.length > 0) {
    strengths.push(`Demonstrated solid grasp of core ${params.skill} concepts under adaptive evaluation.`);
    if (correctQuestions.some(q => q.difficulty === 'Advanced')) {
      strengths.push(`Successfully solved advanced ${params.skill} architecture/optimization questions.`);
    }
  } else {
    strengths.push(`Completed initial diagnostic assessment across ${totalQuestions} questions.`);
  }

  if (missedQuestions.length > 0) {
    areasForImprovement.push(`Review tricky edge cases and syntax nuances in ${params.skill}.`);
    if (missedQuestions.some(q => q.difficulty === 'Intermediate' || q.difficulty === 'Advanced')) {
      areasForImprovement.push(`Strengthen in-depth execution model and performance patterns.`);
    }
    recommendedTopics.push(`${params.skill} Best Practices & Real-World Patterns`);
    recommendedTopics.push(`${params.skill} Debugging & Performance Profiling`);
  } else {
    strengths.push(`Perfect score! Outstanding mastery across all presented questions.`);
    recommendedTopics.push(`Mentoring others and contributing to open-source ${params.skill} libraries`);
  }

  if (recommendedTopics.length === 0) {
    recommendedTopics.push(`Explore advanced production-grade system designs with ${params.skill}`);
  }

  return {
    assessmentId: params.assessmentId,
    userId: params.userId,
    skill: params.skill,
    initialDifficulty: params.initialDifficulty,
    finalDifficulty: params.finalDifficulty,
    totalQuestions,
    correctAnswers,
    incorrectAnswers,
    percentageScore,
    proficiencyLevel,
    questionHistory: params.questionHistory,
    completedAt: new Date().toISOString(),
    durationSeconds: params.durationSeconds,
    aiGeneratedQuestionCount: params.aiGeneratedQuestionCount,
    fallbackQuestionCount: params.fallbackQuestionCount,
    strengths,
    areasForImprovement,
    recommendedTopics
  };
}
