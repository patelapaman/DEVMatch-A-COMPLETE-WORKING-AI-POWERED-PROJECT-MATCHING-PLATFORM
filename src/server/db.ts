/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import { Application, AssessmentResult, Bookmark, Project, QuestionServer, UserProfile } from '../types';

export interface AssessmentSession {
  assessmentId: string;
  userId: string;
  skill: string;
  initialDifficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  currentDifficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  totalQuestions: number;
  currentQuestionIndex: number;
  questions: QuestionServer[];
  answers: {
    questionId: string;
    question: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    options: [string, string, string, string];
    selectedOptionIndex: number;
    correctOptionIndex: number;
    isCorrect: boolean;
    explanation: string;
    timeSpentSeconds: number;
  }[];
  startedAt: number;
  aiGeneratedCount: number;
  fallbackCount: number;
}

export interface StoredUser extends UserProfile {
  passwordHash: string; // Stored hashed/salted or auth simulation token
}

export interface DatabaseSchema {
  users: Record<string, StoredUser>;
  projects: Record<string, Project>;
  assessments: Record<string, AssessmentResult[]>; // keyed by userId
  applications: Record<string, Application>; // keyed by applicationId
  bookmarks: Record<string, Bookmark>; // keyed by id
  activeSessions: Record<string, AssessmentSession>; // keyed by assessmentId
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'devmatch-db.json');

// In-memory cache synced with disk
let db: DatabaseSchema = {
  users: {},
  projects: {},
  assessments: {},
  applications: {},
  bookmarks: {},
  activeSessions: {}
};

/**
 * Initializes database storage and seeds default content if empty.
 */
export function initDatabase() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      db = JSON.parse(raw);
      if (!db.users) db.users = {};
      if (!db.projects) db.projects = {};
      if (!db.assessments) db.assessments = {};
      if (!db.applications) db.applications = {};
      if (!db.bookmarks) db.bookmarks = {};
      if (!db.activeSessions) db.activeSessions = {};
    } catch (err) {
      console.error('[DB] Error loading existing DB file, reinitializing:', err);
      seedDemoData();
    }
  } else {
    seedDemoData();
  }
}

/**
 * Persists in-memory database to disk atomically.
 */
export function persistDatabase() {
  try {
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(db, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('[DB] Atomic write error:', err);
  }
}

export function getDb(): DatabaseSchema {
  return db;
}

/**
 * Populates realistic initial demonstration content.
 */
export function seedDemoData() {
  const now = new Date().toISOString();

  // 1. Demo Developer User
  const devUser: StoredUser = {
    uid: 'user-alex-dev',
    name: 'Alex Rivera',
    email: 'alex.dev@example.com',
    role: 'developer',
    passwordHash: 'dev123',
    profileImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'Passionate full-stack developer with 2 years of building modern React and Node.js web applications. Eager to contribute to scalable cloud systems.',
    location: 'San Francisco, CA / Remote',
    education: 'B.S. in Computer Science, UC Berkeley',
    experienceLevel: 'Intermediate',
    skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'SQL', 'Git', 'Tailwind CSS', 'REST APIs'],
    preferredTechnologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'],
    interests: ['Full-Stack Development', 'AI Tools', 'Open-Source', 'Cloud Infrastructure'],
    portfolioUrl: 'https://alexrivera.dev',
    githubUrl: 'https://github.com/alexrivera-dev',
    linkedinUrl: 'https://linkedin.com/in/alexrivera-dev',
    createdAt: now,
    updatedAt: now
  };

  // 2. Demo Recruiter User
  const recruiterUser: StoredUser = {
    uid: 'user-sarah-lead',
    name: 'Sarah Chen',
    email: 'sarah.recruiter@example.com',
    role: 'recruiter',
    passwordHash: 'lead123',
    profileImageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    bio: 'Engineering Lead & Project Architect building high-performance developer tools and AI analytics platforms.',
    location: 'Seattle, WA / Remote',
    education: 'M.S. Software Engineering',
    experienceLevel: 'Advanced',
    skills: ['Architecture', 'TypeScript', 'Node.js', 'Kubernetes', 'System Design'],
    preferredTechnologies: ['TypeScript', 'Go', 'GCP', 'PostgreSQL'],
    interests: ['Distributed Systems', 'Mentorship', 'Open Source'],
    portfolioUrl: 'https://sarahchen.io',
    githubUrl: 'https://github.com/sarahchen-eng',
    linkedinUrl: 'https://linkedin.com/in/sarahchen-eng',
    createdAt: now,
    updatedAt: now
  };

  db.users = {
    [devUser.uid]: devUser,
    [recruiterUser.uid]: recruiterUser
  };

  // 3. Demo Projects (clearly identified demonstration projects per spec)
  const sampleProjects: Project[] = [
    {
      id: 'proj-nexus-analytics',
      title: 'Nexus Real-Time Developer Analytics Dashboard',
      slug: 'nexus-real-time-developer-analytics',
      shortDescription: 'Build high-performance real-time telemetry visualizers for distributed microservices.',
      description: 'Nexus is an open telemetry exploration dashboard. We are building interactive data visualization components, streaming metric graphs, and latency heatmaps using React, TypeScript, and modern canvas technologies. Candidates will collaborate with our distributed core team to deliver sub-second rendering for millions of event points.',
      requiredSkills: ['React', 'TypeScript', 'JavaScript'],
      optionalSkills: ['Tailwind CSS', 'REST APIs', 'Node.js'],
      experienceLevel: 'Intermediate',
      category: 'Frontend',
      technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Chart.js', 'Vite'],
      projectType: 'Open-source',
      location: 'Remote (Worldwide)',
      remoteAllowed: true,
      duration: '3 months',
      numberOfOpenings: 3,
      ownerId: recruiterUser.uid,
      ownerName: 'Sarah Chen (Nexus Core Team)',
      ownerEmail: recruiterUser.email,
      status: 'open',
      applicationDeadline: '2026-12-15',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'proj-hypercloud-api',
      title: 'HyperCloud Resilient API Gateway Engine',
      slug: 'hypercloud-resilient-api-gateway',
      shortDescription: 'Construct fault-tolerant Node.js proxy layers with distributed rate-limiting and token verification.',
      description: 'Looking for a backend engineer to implement an enterprise-grade gateway service handling rate limits, JWT session authentication, circuit-breaking, and audit logging. Ideal for engineers wanting hands-on exposure to high-concurrency systems design.',
      requiredSkills: ['Node.js', 'TypeScript', 'REST APIs'],
      optionalSkills: ['SQL', 'Git', 'Docker'],
      experienceLevel: 'Intermediate',
      category: 'Backend',
      technologies: ['Node.js', 'Express', 'TypeScript', 'Redis', 'PostgreSQL'],
      projectType: 'Full-time',
      location: 'San Francisco, CA / Remote',
      remoteAllowed: true,
      duration: 'Ongoing',
      numberOfOpenings: 2,
      ownerId: recruiterUser.uid,
      ownerName: 'Sarah Chen',
      ownerEmail: recruiterUser.email,
      status: 'open',
      applicationDeadline: '2026-11-30',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'proj-gemini-code-tutor',
      title: 'CodeMentor AI: Interactive Programming Assistant',
      slug: 'codementor-ai-interactive-assistant',
      shortDescription: 'Integrate Gemini API with code execution sandboxes for intelligent feedback and automated test generation.',
      description: 'CodeMentor empowers student developers by providing contextual hints, algorithmic complexity analysis, and automated test-case generation. You will craft structured prompt engineering pipelines, streaming UI elements, and AST parsing hooks.',
      requiredSkills: ['Python', 'JavaScript', 'REST APIs'],
      optionalSkills: ['React', 'TypeScript', 'Data Structures and Algorithms'],
      experienceLevel: 'Beginner',
      category: 'AI & ML',
      technologies: ['Python', 'FastAPI', 'Gemini API', 'React', 'TypeScript'],
      projectType: 'Student Project',
      location: 'Remote',
      remoteAllowed: true,
      duration: '4 months',
      numberOfOpenings: 4,
      ownerId: recruiterUser.uid,
      ownerName: 'Sarah Chen (AI Lab)',
      ownerEmail: recruiterUser.email,
      status: 'open',
      applicationDeadline: '2026-12-31',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'proj-dataflow-pipeline',
      title: 'OmniData Distributed ETL & Stream Engine',
      slug: 'omnidata-distributed-etl-stream-engine',
      shortDescription: 'Build high-throughput SQL transformation pipelines and indexing microservices.',
      description: 'Work with transactional SQL databases and big data connectors to normalize heterogeneous JSON events into structured relational warehouses. Focuses heavily on algorithmic optimization and query performance tuning.',
      requiredSkills: ['SQL', 'Python', 'Data Structures and Algorithms'],
      optionalSkills: ['Git', 'Node.js'],
      experienceLevel: 'Advanced',
      category: 'Data Science',
      technologies: ['PostgreSQL', 'Python', 'Apache Kafka', 'DuckDB'],
      projectType: 'Internship',
      location: 'Austin, TX / Remote',
      remoteAllowed: true,
      duration: '6 months',
      numberOfOpenings: 2,
      ownerId: recruiterUser.uid,
      ownerName: 'Sarah Chen',
      ownerEmail: recruiterUser.email,
      status: 'open',
      applicationDeadline: '2026-12-01',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'proj-mobile-devmatch',
      title: 'DevMatch Native Companion App',
      slug: 'devmatch-native-companion',
      shortDescription: 'Cross-platform mobile client for developers to receive project push notifications and review quiz cards.',
      description: 'Creating an ultra-responsive companion app featuring offline assessment practice, project bookmark sync, and recruiter chat hooks.',
      requiredSkills: ['React', 'JavaScript', 'TypeScript'],
      optionalSkills: ['REST APIs', 'Git'],
      experienceLevel: 'Beginner',
      category: 'Mobile',
      technologies: ['React Native', 'TypeScript', 'Expo', 'Tailwind CSS'],
      projectType: 'Part-time',
      location: 'Remote',
      remoteAllowed: true,
      duration: '3 months',
      numberOfOpenings: 2,
      ownerId: recruiterUser.uid,
      ownerName: 'Sarah Chen',
      ownerEmail: recruiterUser.email,
      status: 'open',
      applicationDeadline: '2026-11-20',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'proj-algo-visualizer',
      title: 'AlgorithmLab 3D Dynamic Visualizer',
      slug: 'algorithmlab-3d-dynamic-visualizer',
      shortDescription: 'Interactive educational platform displaying pathfinding, tree traversals, and dynamic programming states.',
      description: 'A community open-source project visualizing complex computer science algorithms step-by-step with state checkpoints and explanatory narration.',
      requiredSkills: ['Data Structures and Algorithms', 'JavaScript'],
      optionalSkills: ['TypeScript', 'React', 'HTML'],
      experienceLevel: 'All Levels',
      category: 'Open-Source',
      technologies: ['JavaScript', 'HTML5 Canvas', 'CSS3', 'Vite'],
      projectType: 'Open-source',
      location: 'Remote',
      remoteAllowed: true,
      duration: 'Flexible',
      numberOfOpenings: 5,
      ownerId: recruiterUser.uid,
      ownerName: 'Sarah Chen',
      ownerEmail: recruiterUser.email,
      status: 'open',
      applicationDeadline: '2027-01-31',
      createdAt: now,
      updatedAt: now
    }
  ];

  db.projects = {};
  sampleProjects.forEach(p => {
    db.projects[p.id] = p;
  });

  // 4. Sample Verified Assessments for Alex Rivera
  const alexAssessments: AssessmentResult[] = [
    {
      assessmentId: 'asmt-alex-react-1',
      userId: devUser.uid,
      skill: 'React',
      initialDifficulty: 'Intermediate',
      finalDifficulty: 'Advanced',
      totalQuestions: 10,
      correctAnswers: 9,
      incorrectAnswers: 1,
      percentageScore: 90,
      proficiencyLevel: 'Expert',
      questionHistory: [],
      completedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      durationSeconds: 320,
      aiGeneratedQuestionCount: 8,
      fallbackQuestionCount: 2,
      strengths: ['Mastery of React hooks, component lifecycles, and reconciliation.', 'Concurrent rendering and scheduler prioritization.'],
      areasForImprovement: ['Server Component boundaries in Next.js/SSR.'],
      recommendedTopics: ['React 19 Actions', 'Compiler & Memoization Optimization']
    },
    {
      assessmentId: 'asmt-alex-ts-1',
      userId: devUser.uid,
      skill: 'TypeScript',
      initialDifficulty: 'Intermediate',
      finalDifficulty: 'Intermediate',
      totalQuestions: 10,
      correctAnswers: 8,
      incorrectAnswers: 2,
      percentageScore: 80,
      proficiencyLevel: 'Advanced',
      questionHistory: [],
      completedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      durationSeconds: 360,
      aiGeneratedQuestionCount: 7,
      fallbackQuestionCount: 3,
      strengths: ['Strong command of Generics, Union types, and Type narrowing.'],
      areasForImprovement: ['Complex mapped types with `infer` in conditional branches.'],
      recommendedTopics: ['Template literal types', 'Conditional type distribution']
    }
  ];

  db.assessments = {
    [devUser.uid]: alexAssessments
  };

  // 5. Sample Application
  const sampleApp: Application = {
    id: 'app-alex-nexus-1',
    projectId: 'proj-nexus-analytics',
    projectTitleSnapshot: 'Nexus Real-Time Developer Analytics Dashboard',
    applicantId: devUser.uid,
    applicantNameSnapshot: devUser.name,
    applicantEmailSnapshot: devUser.email,
    applicantSkillsSnapshot: devUser.skills,
    coverLetter: 'Hi Sarah! I have built several high-performance interactive dashboards with React and TypeScript. Having scored 90% in the React assessment and 80% in TypeScript, I am confident in handling sub-second rendering for telemetry visualizers.',
    relevantSkills: ['React', 'TypeScript', 'JavaScript', 'Tailwind CSS'],
    status: 'Shortlisted',
    submittedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 43200000).toISOString(),
    statusHistory: [
      {
        status: 'Pending',
        changedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        changedBy: devUser.name,
        note: 'Application submitted via DevMatch portal'
      },
      {
        status: 'Shortlisted',
        changedAt: new Date(Date.now() - 43200000).toISOString(),
        changedBy: recruiterUser.name,
        note: 'Impressive React assessment score and portfolio dashboard demos!'
      }
    ]
  };

  db.applications = {
    [sampleApp.id]: sampleApp
  };

  // 6. Bookmarks
  db.bookmarks = {
    [`bm-${devUser.uid}-proj-hypercloud-api`]: {
      id: `bm-${devUser.uid}-proj-hypercloud-api`,
      userId: devUser.uid,
      projectId: 'proj-hypercloud-api',
      createdAt: now
    }
  };

  persistDatabase();
  console.log('[DB] Seeded initial demonstration data with 2 users, 6 projects, 2 verified assessments, and 1 application.');
}
