/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AssessmentResult, ExperienceLevel, Project, ProjectMatchScore, UserProfile } from '../types';

/**
 * Normalizes a skill string for case-insensitive and punctuation-tolerant matching.
 */
export function normalizeSkill(skill: string): string {
  return skill
    .toLowerCase()
    .replace(/[\._-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks if a candidate skill set satisfies a target skill.
 */
export function hasMatchingSkill(candidateSkills: string[], targetSkill: string): boolean {
  const normalizedTarget = normalizeSkill(targetSkill);
  return candidateSkills.some(cand => {
    const normCand = normalizeSkill(cand);
    return normCand === normalizedTarget || normCand.includes(normalizedTarget) || normalizedTarget.includes(normCand);
  });
}

/**
 * Experience level compatibility matrix.
 * Exact match = 10 points
 * Overqualified / highly compatible = 8-9 points
 * Next level up (challenge) = 6 points
 * Significant mismatch = 3 points
 */
export function calculateExperienceScore(
  userLevel: ExperienceLevel | undefined,
  projectLevel: ExperienceLevel
): number {
  if (projectLevel === 'All Levels') return 10;
  if (!userLevel) return 5;
  if (userLevel === projectLevel) return 10;

  const ranks: Record<ExperienceLevel, number> = {
    'Beginner': 1,
    'Intermediate': 2,
    'Advanced': 3,
    'All Levels': 0
  };

  const userRank = ranks[userLevel];
  const projectRank = ranks[projectLevel];

  if (userRank > projectRank) {
    // User is more experienced than required
    return 9;
  } else if (projectRank - userRank === 1) {
    // 1 level step up (good growth project)
    return 6;
  } else {
    // 2 levels step up (might be too advanced)
    return 3;
  }
}

/**
 * Deterministic Project Recommendation & Scoring Algorithm
 * 
 * Weights per specification:
 * - Required skill coverage: 50 points
 * - Optional skill coverage: 15 points
 * - Assessment evidence: 20 points
 * - Experience compatibility: 10 points
 * - Preferred technology / interest overlap: 5 points
 * Normalized to 0-100 scale.
 */
export function calculateMatchScore(
  profile: Pick<UserProfile, 'skills' | 'preferredTechnologies' | 'interests' | 'experienceLevel'>,
  project: Project,
  assessments: AssessmentResult[] = []
): ProjectMatchScore {
  const userSkills = profile.skills || [];
  const reqSkills = project.requiredSkills || [];
  const optSkills = project.optionalSkills || [];
  const userPreferred = profile.preferredTechnologies || [];
  const userInterests = profile.interests || [];

  // 1. Required Skill Coverage (0 - 50 points)
  const matchingSkills: string[] = [];
  const missingRequiredSkills: string[] = [];

  for (const req of reqSkills) {
    if (hasMatchingSkill(userSkills, req)) {
      matchingSkills.push(req);
    } else {
      missingRequiredSkills.push(req);
    }
  }

  const requiredSkillRatio = reqSkills.length > 0
    ? matchingSkills.length / reqSkills.length
    : 1;
  const requiredSkillCoverageScore = Math.round(requiredSkillRatio * 50);

  // 2. Optional Skill Coverage (0 - 15 points)
  const matchingOptionalSkills: string[] = [];
  for (const opt of optSkills) {
    if (hasMatchingSkill(userSkills, opt)) {
      matchingOptionalSkills.push(opt);
    }
  }

  const optionalSkillCoverageScore = optSkills.length > 0
    ? Math.round((matchingOptionalSkills.length / optSkills.length) * 15)
    : 10; // Neutral bonus if no optional skills defined

  // 3. Assessment Evidence (0 - 20 points)
  // Check if user has verified assessment scores for the project's required/technologies skills
  const assessedSkillsProof: { skill: string; score: number; proficiency: string }[] = [];
  const relevantProjectTechs = [...reqSkills, ...project.technologies];

  let totalAssessmentWeight = 0;
  let verifiedPoints = 0;

  for (const assessment of assessments) {
    const isRelevant = relevantProjectTechs.some(tech => 
      hasMatchingSkill([assessment.skill], tech)
    );

    if (isRelevant) {
      assessedSkillsProof.push({
        skill: assessment.skill,
        score: assessment.percentageScore,
        proficiency: assessment.proficiencyLevel
      });
      // Assessment score percentage scaled
      verifiedPoints += (assessment.percentageScore / 100);
      totalAssessmentWeight += 1;
    }
  }

  let assessmentEvidenceScore = 0;
  if (totalAssessmentWeight > 0) {
    const avgScore = verifiedPoints / totalAssessmentWeight;
    assessmentEvidenceScore = Math.round(avgScore * 20);
  } else {
    // If no assessments taken yet, provide a baseline proportional to skill coverage
    // with clear disclosure of reduced confidence
    assessmentEvidenceScore = Math.round(requiredSkillRatio * 8);
  }

  // 4. Experience Compatibility (0 - 10 points)
  const experienceCompatibilityScore = calculateExperienceScore(
    profile.experienceLevel,
    project.experienceLevel
  );

  // 5. Preferred Technology & Interest Overlap (0 - 5 points)
  const combinedUserPreferences = [...userPreferred, ...userInterests];
  let overlapCount = 0;
  for (const tech of project.technologies) {
    if (hasMatchingSkill(combinedUserPreferences, tech)) {
      overlapCount += 1;
    }
  }
  const techInterestOverlapScore = Math.min(5, overlapCount * 2);

  // Total Score (0 - 100)
  const overallScore = Math.min(
    100,
    Math.max(
      0,
      requiredSkillCoverageScore +
      optionalSkillCoverageScore +
      assessmentEvidenceScore +
      experienceCompatibilityScore +
      techInterestOverlapScore
    )
  );

  // Generate transparent deterministic summary
  let explanationSummary = '';
  if (overallScore >= 80) {
    explanationSummary = `Strong match (${overallScore}%). You possess ${matchingSkills.length} of ${reqSkills.length} required skills${assessedSkillsProof.length > 0 ? ` with ${assessedSkillsProof.length} verified assessments` : ''}.`;
  } else if (overallScore >= 60) {
    explanationSummary = `Good match (${overallScore}%). You match ${matchingSkills.length}/${reqSkills.length} core skills. Consider acquiring: ${missingRequiredSkills.slice(0, 2).join(', ') || 'further experience'}.`;
  } else {
    explanationSummary = `Moderate potential match (${overallScore}%). Requires ${reqSkills.length} skills (${missingRequiredSkills.join(', ')} needed).`;
  }

  return {
    projectId: project.id,
    project,
    overallScore,
    requiredSkillCoverageScore,
    optionalSkillCoverageScore,
    assessmentEvidenceScore,
    experienceCompatibilityScore,
    techInterestOverlapScore,
    matchingSkills,
    missingRequiredSkills,
    matchingOptionalSkills,
    assessedSkillsProof,
    explanationSummary
  };
}
