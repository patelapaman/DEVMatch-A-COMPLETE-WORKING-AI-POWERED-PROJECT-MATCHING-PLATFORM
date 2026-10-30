/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateMatchScore, hasMatchingSkill, calculateExperienceScore, normalizeSkill } from '../utils/matchingEngine';
import { AssessmentResult, Project, UserProfile } from '../types';

test('normalizeSkill handles punctuation, casing, and spacing', () => {
  assert.equal(normalizeSkill('Node.js'), 'node js');
  assert.equal(normalizeSkill('  React.js  '), 'react js');
  assert.equal(normalizeSkill('C++'), 'c++');
});

test('hasMatchingSkill identifies exact and substring matches', () => {
  const userSkills = ['React', 'TypeScript', 'Node.js', 'PostgreSQL'];
  assert.equal(hasMatchingSkill(userSkills, 'react'), true);
  assert.equal(hasMatchingSkill(userSkills, 'Node.js'), true);
  assert.equal(hasMatchingSkill(userSkills, 'Python'), false);
});

test('calculateExperienceScore evaluates level compatibility', () => {
  assert.equal(calculateExperienceScore('Intermediate', 'Intermediate'), 10);
  assert.equal(calculateExperienceScore('Advanced', 'Intermediate'), 9); // overqualified bonus
  assert.equal(calculateExperienceScore('Beginner', 'Intermediate'), 6); // growth step
  assert.equal(calculateExperienceScore('Beginner', 'Advanced'), 3); // large mismatch
  assert.equal(calculateExperienceScore('Beginner', 'All Levels'), 10);
});

test('calculateMatchScore produces normalized 0-100 score and explainable breakdowns', () => {
  const dummyProject: Project = {
    id: 'proj-1',
    title: 'Frontend Portal',
    slug: 'frontend-portal',
    description: 'React dashboard',
    shortDescription: 'Dashboard',
    requiredSkills: ['React', 'TypeScript'],
    optionalSkills: ['Tailwind CSS'],
    experienceLevel: 'Intermediate',
    category: 'Frontend',
    technologies: ['React', 'TypeScript', 'Tailwind CSS'],
    projectType: 'Open-source',
    location: 'Remote',
    remoteAllowed: true,
    duration: '3 months',
    numberOfOpenings: 2,
    ownerId: 'owner-1',
    ownerName: 'Lead',
    status: 'open',
    applicationDeadline: '2026-12-31',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const dummyProfile: Pick<UserProfile, 'skills' | 'preferredTechnologies' | 'interests' | 'experienceLevel'> = {
    skills: ['React', 'TypeScript', 'Tailwind CSS'],
    preferredTechnologies: ['React', 'TypeScript'],
    interests: ['Frontend'],
    experienceLevel: 'Intermediate'
  };

  const assessments: AssessmentResult[] = [
    {
      assessmentId: 'asmt-1',
      userId: 'user-1',
      skill: 'React',
      initialDifficulty: 'Intermediate',
      finalDifficulty: 'Advanced',
      totalQuestions: 10,
      correctAnswers: 9,
      incorrectAnswers: 1,
      percentageScore: 90,
      proficiencyLevel: 'Expert',
      questionHistory: [],
      completedAt: new Date().toISOString(),
      durationSeconds: 200,
      aiGeneratedQuestionCount: 8,
      fallbackQuestionCount: 2,
      strengths: [],
      areasForImprovement: [],
      recommendedTopics: []
    }
  ];

  const result = calculateMatchScore(dummyProfile, dummyProject, assessments);

  assert.equal(result.matchingSkills.length, 2);
  assert.equal(result.missingRequiredSkills.length, 0);
  assert.equal(result.requiredSkillCoverageScore, 50); // 100% of required skills = 50 pts
  assert.equal(result.optionalSkillCoverageScore, 15); // 100% of optional skills = 15 pts
  assert.ok(result.assessmentEvidenceScore >= 15); // verified assessment evidence
  assert.equal(result.experienceCompatibilityScore, 10);
  assert.ok(result.overallScore >= 90 && result.overallScore <= 100);
});

test('calculateMatchScore correctly flags missing required skills', () => {
  const dummyProject: Project = {
    id: 'proj-backend',
    title: 'Cloud Gateway',
    slug: 'cloud-gateway',
    description: 'Golang & Rust gateway',
    shortDescription: 'Gateway',
    requiredSkills: ['Go', 'Rust', 'Kubernetes'],
    optionalSkills: ['Docker'],
    experienceLevel: 'Advanced',
    category: 'Backend',
    technologies: ['Go', 'Rust'],
    projectType: 'Full-time',
    location: 'Remote',
    remoteAllowed: true,
    duration: 'Ongoing',
    numberOfOpenings: 1,
    ownerId: 'owner-1',
    ownerName: 'Architect',
    status: 'open',
    applicationDeadline: '2026-12-31',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const candidateProfile = {
    skills: ['React', 'JavaScript', 'HTML'],
    preferredTechnologies: ['React'],
    interests: ['UI'],
    experienceLevel: 'Beginner' as const
  };

  const result = calculateMatchScore(candidateProfile, dummyProject, []);
  assert.equal(result.matchingSkills.length, 0);
  assert.equal(result.missingRequiredSkills.length, 3);
  assert.equal(result.requiredSkillCoverageScore, 0);
  assert.ok(result.overallScore < 30);
});
