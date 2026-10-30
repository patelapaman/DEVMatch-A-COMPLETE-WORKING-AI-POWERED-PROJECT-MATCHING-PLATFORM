/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'student' | 'developer' | 'recruiter' | 'admin';

export type ExperienceLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';

export type ProjectCategory = 
  | 'Frontend' 
  | 'Backend' 
  | 'Full-Stack' 
  | 'AI & ML' 
  | 'Mobile' 
  | 'Data Science' 
  | 'Cloud & DevOps'
  | 'Open-Source';

export type ProjectType = 
  | 'Personal Project'
  | 'Internship' 
  | 'Full-time' 
  | 'Part-time' 
  | 'Freelance' 
  | 'Open-source' 
  | 'Student Project';

export type ApplicationStatus = 
  | 'Pending' 
  | 'Shortlisted' 
  | 'Accepted' 
  | 'Rejected' 
  | 'Withdrawn';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  profileImageUrl?: string;
  bio?: string;
  location?: string;
  education?: string;
  experienceLevel?: ExperienceLevel;
  skills: string[];
  preferredTechnologies: string[];
  interests: string[];
  portfolioUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  requiredSkills: string[];
  optionalSkills: string[];
  experienceLevel: ExperienceLevel;
  category: ProjectCategory;
  technologies: string[];
  projectType: ProjectType;
  location: string;
  remoteAllowed: boolean;
  duration: string;
  numberOfOpenings: number;
  ownerId: string;
  ownerName: string;
  ownerEmail?: string;
  status: 'open' | 'closed';
  applicationDeadline: string;
  isPersonalProject?: boolean;
  githubUrl?: string;
  liveDemoUrl?: string;
  lookingFor?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StatusHistoryEntry {
  status: ApplicationStatus;
  changedAt: string;
  changedBy: string;
  note?: string;
}

export interface Application {
  id: string;
  projectId: string;
  projectTitleSnapshot: string;
  applicantId: string;
  applicantNameSnapshot: string;
  applicantEmailSnapshot: string;
  applicantSkillsSnapshot: string[];
  coverLetter: string;
  relevantSkills: string[];
  status: ApplicationStatus;
  submittedAt: string;
  updatedAt: string;
  statusHistory: StatusHistoryEntry[];
}

export type SkillDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface QuestionClient {
  id: string;
  skill: string;
  difficulty: SkillDifficulty;
  question: string;
  codeSnippet?: string;
  options: [string, string, string, string];
  questionNumber: number;
  totalQuestions: number;
}

export interface QuestionServer {
  id: string;
  skill: string;
  difficulty: SkillDifficulty;
  question: string;
  codeSnippet?: string;
  options: [string, string, string, string];
  correctOptionIndex: number; // 0-3 (NEVER sent to client before answer)
  explanation: string;
  isAiGenerated: boolean;
}

export interface QuestionAnswerRecord {
  questionId: string;
  question: string;
  difficulty: SkillDifficulty;
  options: [string, string, string, string];
  selectedOptionIndex: number;
  correctOptionIndex: number;
  isCorrect: boolean;
  explanation: string;
  timeSpentSeconds: number;
}

export interface AssessmentResult {
  assessmentId: string;
  userId: string;
  skill: string;
  initialDifficulty: SkillDifficulty;
  finalDifficulty: SkillDifficulty;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  percentageScore: number;
  proficiencyLevel: 'Novice' | 'Competent' | 'Proficient' | 'Advanced' | 'Expert';
  questionHistory: QuestionAnswerRecord[];
  completedAt: string;
  durationSeconds: number;
  aiGeneratedQuestionCount: number;
  fallbackQuestionCount: number;
  strengths: string[];
  areasForImprovement: string[];
  recommendedTopics: string[];
}

export interface ProjectMatchScore {
  projectId: string;
  project: Project;
  overallScore: number; // 0-100
  requiredSkillCoverageScore: number; // 0-50
  optionalSkillCoverageScore: number; // 0-15
  assessmentEvidenceScore: number; // 0-20
  experienceCompatibilityScore: number; // 0-10
  techInterestOverlapScore: number; // 0-5
  matchingSkills: string[];
  missingRequiredSkills: string[];
  matchingOptionalSkills: string[];
  assessedSkillsProof: {
    skill: string;
    score: number;
    proficiency: string;
  }[];
  explanationSummary: string;
  isAiExplained?: boolean;
}

export interface Bookmark {
  id: string;
  userId: string;
  projectId: string;
  createdAt: string;
}
