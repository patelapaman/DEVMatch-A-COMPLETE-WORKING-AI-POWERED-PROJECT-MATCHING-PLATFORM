/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { computeNextDifficulty, determineProficiencyLevel, compileAssessmentResult } from '../utils/adaptiveEngine';

test('computeNextDifficulty steps up on 2 consecutive correct answers', () => {
  const result = computeNextDifficulty('Beginner', [{ isCorrect: true }, { isCorrect: true }]);
  assert.equal(result, 'Intermediate');

  const advancedStep = computeNextDifficulty('Intermediate', [{ isCorrect: true }, { isCorrect: true }]);
  assert.equal(advancedStep, 'Advanced');

  // Should clamp at Advanced
  const capped = computeNextDifficulty('Advanced', [{ isCorrect: true }, { isCorrect: true }]);
  assert.equal(capped, 'Advanced');
});

test('computeNextDifficulty steps down on 2 consecutive incorrect answers', () => {
  const result = computeNextDifficulty('Advanced', [{ isCorrect: false }, { isCorrect: false }]);
  assert.equal(result, 'Intermediate');

  const beginnerStep = computeNextDifficulty('Intermediate', [{ isCorrect: false }, { isCorrect: false }]);
  assert.equal(beginnerStep, 'Beginner');

  // Should clamp at Beginner
  const capped = computeNextDifficulty('Beginner', [{ isCorrect: false }, { isCorrect: false }]);
  assert.equal(capped, 'Beginner');
});

test('computeNextDifficulty does not flip on a single answer', () => {
  assert.equal(computeNextDifficulty('Intermediate', [{ isCorrect: true }]), 'Intermediate');
  assert.equal(computeNextDifficulty('Intermediate', [{ isCorrect: false }]), 'Intermediate');
  assert.equal(
    computeNextDifficulty('Intermediate', [{ isCorrect: true }, { isCorrect: false }]),
    'Intermediate'
  );
});

test('determineProficiencyLevel assigns accurate tiers', () => {
  assert.equal(determineProficiencyLevel(95, 'Advanced'), 'Expert');
  assert.equal(determineProficiencyLevel(85, 'Intermediate'), 'Advanced');
  assert.equal(determineProficiencyLevel(70, 'Intermediate'), 'Proficient');
  assert.equal(determineProficiencyLevel(55, 'Beginner'), 'Competent');
  assert.equal(determineProficiencyLevel(30, 'Beginner'), 'Novice');
});

test('compileAssessmentResult produces complete, compliant result object', () => {
  const res = compileAssessmentResult({
    assessmentId: 'test-asmt-1',
    userId: 'user-1',
    skill: 'React',
    initialDifficulty: 'Intermediate',
    finalDifficulty: 'Advanced',
    questionHistory: [
      {
        questionId: 'q1',
        question: 'What is useState?',
        difficulty: 'Beginner',
        options: ['Hook', 'Class', 'Prop', 'State'],
        selectedOptionIndex: 0,
        correctOptionIndex: 0,
        isCorrect: true,
        explanation: 'It is a hook',
        timeSpentSeconds: 10
      },
      {
        questionId: 'q2',
        question: 'What is useEffect cleanup?',
        difficulty: 'Intermediate',
        options: ['Return fn', 'Unmount prop', 'Dispose hook', 'Garbage'],
        selectedOptionIndex: 0,
        correctOptionIndex: 0,
        isCorrect: true,
        explanation: 'Return function',
        timeSpentSeconds: 12
      }
    ],
    durationSeconds: 22,
    aiGeneratedQuestionCount: 2,
    fallbackQuestionCount: 0
  });

  assert.equal(res.percentageScore, 100);
  assert.equal(res.correctAnswers, 2);
  assert.equal(res.incorrectAnswers, 0);
  assert.ok(res.strengths.length > 0);
});
