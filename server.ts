/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { getDb, initDatabase, persistDatabase, seedDemoData, StoredUser, AssessmentSession } from './src/server/db';
import { calculateMatchScore } from './src/utils/matchingEngine';
import { computeNextDifficulty, compileAssessmentResult } from './src/utils/adaptiveEngine';
import { generateQuestionWithGemini, generateMatchExplanationWithGemini } from './src/server/geminiService';
import { Application, AssessmentResult, Project, QuestionClient, UserProfile, UserRole, SkillDifficulty } from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize database
initDatabase();

// Auth helper middleware
function getAuthenticatedUser(req: Request): StoredUser | null {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const demoUserId = (req.headers['x-devmatch-uid'] as string) || token;

  const db = getDb();
  if (demoUserId && db.users[demoUserId]) {
    return db.users[demoUserId];
  }

  // If no specific token, check if any user is logged in via cookie/header or default to first
  return null;
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = getAuthenticatedUser(req);
  if (!user) {
    res.status(401).json({ error: 'Authentication required. Please log in.' });
    return;
  }
  (req as any).user = user;
  next();
}

function requireRecruiter(req: Request, res: Response, next: NextFunction) {
  const user = getAuthenticatedUser(req);
  if (!user) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }
  if (user.role !== 'recruiter' && user.role !== 'admin') {
    res.status(403).json({ error: 'Recruiter or project owner privileges required.' });
    return;
  }
  (req as any).user = user;
  next();
}

/* ============================================================
   AUTH & USER ENDPOINTS
============================================================ */

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, password, role, skills, experienceLevel } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ error: 'Name, email, and password are required.' });
    return;
  }

  const db = getDb();
  const existing = Object.values(db.users).find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    res.status(409).json({ error: 'A user with this email address already exists.' });
    return;
  }

  const assignedRole: UserRole = (role === 'recruiter') ? 'recruiter' : 'developer';
  const now = new Date().toISOString();
  const uid = `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  const newUser: StoredUser = {
    uid,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    role: assignedRole,
    passwordHash: password, // In production, bcrypt hash
    experienceLevel: experienceLevel || 'Beginner',
    skills: Array.isArray(skills) ? skills : ['JavaScript', 'HTML', 'CSS'],
    preferredTechnologies: [],
    interests: [],
    createdAt: now,
    updatedAt: now
  };

  db.users[uid] = newUser;
  persistDatabase();

  const { passwordHash: _, ...safeProfile } = newUser;
  res.status(201).json({ user: safeProfile, token: uid });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  const db = getDb();
  const user = Object.values(db.users).find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user || user.passwordHash !== password) {
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }

  const { passwordHash: _, ...safeProfile } = user;
  res.json({ user: safeProfile, token: user.uid });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  const { passwordHash: _, ...safeProfile } = user;
  res.json({ user: safeProfile });
});

app.post('/api/auth/reset-password', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Email is required.' });
    return;
  }
  // Safe confirmation without revealing email presence
  res.json({ message: 'If an account exists with that email, a password reset link has been dispatched.' });
});

app.put('/api/profile', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as StoredUser;
  const db = getDb();

  const {
    name,
    bio,
    location,
    education,
    experienceLevel,
    skills,
    preferredTechnologies,
    interests,
    portfolioUrl,
    githubUrl,
    linkedinUrl
  } = req.body;

  // Validate and sanitize without allowing role privilege escalation
  if (name && typeof name === 'string') user.name = name.trim();
  if (typeof bio === 'string') user.bio = bio.trim();
  if (typeof location === 'string') user.location = location.trim();
  if (typeof education === 'string') user.education = education.trim();
  if (experienceLevel) user.experienceLevel = experienceLevel;
  if (Array.isArray(skills)) user.skills = skills.map(s => String(s).trim()).filter(Boolean);
  if (Array.isArray(preferredTechnologies)) user.preferredTechnologies = preferredTechnologies.map(s => String(s).trim()).filter(Boolean);
  if (Array.isArray(interests)) user.interests = interests.map(s => String(s).trim()).filter(Boolean);
  if (typeof portfolioUrl === 'string') user.portfolioUrl = portfolioUrl.trim();
  if (typeof githubUrl === 'string') user.githubUrl = githubUrl.trim();
  if (typeof linkedinUrl === 'string') user.linkedinUrl = linkedinUrl.trim();

  user.updatedAt = new Date().toISOString();
  db.users[user.uid] = user;
  persistDatabase();

  const { passwordHash: _, ...safeProfile } = user;
  res.json({ user: safeProfile });
});

/* ============================================================
   PROJECTS ENDPOINTS
============================================================ */

app.get('/api/projects', (req: Request, res: Response) => {
  const db = getDb();
  let projects = Object.values(db.projects);

  const { search, category, skill, experience, remote, projectType } = req.query;

  if (search && typeof search === 'string') {
    const query = search.toLowerCase();
    projects = projects.filter(p => 
      p.title.toLowerCase().includes(query) ||
      p.shortDescription.toLowerCase().includes(query) ||
      p.technologies.some(t => t.toLowerCase().includes(query)) ||
      p.requiredSkills.some(s => s.toLowerCase().includes(query))
    );
  }

  if (category && typeof category === 'string' && category !== 'All') {
    projects = projects.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  if (skill && typeof skill === 'string' && skill !== 'All') {
    projects = projects.filter(p => 
      p.requiredSkills.some(s => s.toLowerCase() === skill.toLowerCase()) ||
      p.optionalSkills.some(s => s.toLowerCase() === skill.toLowerCase())
    );
  }

  if (experience && typeof experience === 'string' && experience !== 'All') {
    projects = projects.filter(p => p.experienceLevel === experience || p.experienceLevel === 'All Levels');
  }

  if (remote === 'true') {
    projects = projects.filter(p => p.remoteAllowed);
  }

  if (projectType && typeof projectType === 'string' && projectType !== 'All') {
    projects = projects.filter(p => p.projectType.toLowerCase() === projectType.toLowerCase());
  }

  // Sort newest first
  projects.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({ projects, total: projects.length });
});

app.get('/api/projects/:id', (req: Request, res: Response) => {
  const db = getDb();
  const project = db.projects[req.params.id];
  if (!project) {
    res.status(404).json({ error: 'Project not found.' });
    return;
  }
  res.json({ project });
});

// Create Project: Recruiters can post any position; Developers/Students can post Personal, Student, & Open-Source Projects
app.post('/api/projects', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as StoredUser;
  const db = getDb();

  const {
    title,
    description,
    shortDescription,
    requiredSkills,
    optionalSkills,
    experienceLevel,
    category,
    technologies,
    projectType,
    location,
    remoteAllowed,
    duration,
    numberOfOpenings,
    applicationDeadline,
    isPersonalProject,
    githubUrl,
    liveDemoUrl,
    lookingFor
  } = req.body;

  const isPersonalOrStudent = 
    isPersonalProject === true || 
    projectType === 'Personal Project' || 
    projectType === 'Student Project' || 
    projectType === 'Open-source';

  // If a developer tries to create a corporate hiring role without recruiter status:
  if (!isPersonalOrStudent && user.role !== 'recruiter' && user.role !== 'admin') {
    res.status(403).json({ 
      error: 'Recruiter or company privileges required for corporate hiring positions. You can publish Personal, Student, or Open-Source projects.' 
    });
    return;
  }

  if (!title || !description || !requiredSkills || !requiredSkills.length) {
    res.status(400).json({ error: 'Title, description, and at least one required skill are required.' });
    return;
  }

  const id = `proj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const newProject: Project = {
    id,
    title: title.trim(),
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    description: description.trim(),
    shortDescription: (shortDescription || description.substring(0, 150)).trim(),
    requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [requiredSkills],
    optionalSkills: Array.isArray(optionalSkills) ? optionalSkills : [],
    experienceLevel: experienceLevel || 'All Levels',
    category: category || 'Full-Stack',
    technologies: Array.isArray(technologies) ? technologies : ['React', 'Node.js'],
    projectType: projectType || (user.role === 'recruiter' ? 'Open-source' : 'Personal Project'),
    location: location || 'Remote',
    remoteAllowed: remoteAllowed !== undefined ? Boolean(remoteAllowed) : true,
    duration: duration || 'Flexible',
    numberOfOpenings: Number(numberOfOpenings) || 1,
    ownerId: user.uid,
    ownerName: user.name,
    ownerEmail: user.email,
    status: 'open',
    applicationDeadline: applicationDeadline || new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
    isPersonalProject: isPersonalProject !== undefined ? Boolean(isPersonalProject) : (projectType === 'Personal Project' || user.role !== 'recruiter'),
    githubUrl: githubUrl ? String(githubUrl).trim() : undefined,
    liveDemoUrl: liveDemoUrl ? String(liveDemoUrl).trim() : undefined,
    lookingFor: lookingFor ? String(lookingFor).trim() : undefined,
    createdAt: now,
    updatedAt: now
  };

  db.projects[id] = newProject;
  persistDatabase();

  res.status(201).json({ project: newProject });
});

// Edit Project (Allowed for Project Owner or Admin)
app.put('/api/projects/:id', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as StoredUser;
  const db = getDb();
  const project = db.projects[req.params.id];

  if (!project) {
    res.status(404).json({ error: 'Project not found.' });
    return;
  }

  if (project.ownerId !== user.uid && user.role !== 'admin') {
    res.status(403).json({ error: 'You are only authorized to edit your own projects.' });
    return;
  }

  const updates = req.body;
  if (updates.title) project.title = updates.title.trim();
  if (updates.description) project.description = updates.description.trim();
  if (updates.shortDescription) project.shortDescription = updates.shortDescription.trim();
  if (Array.isArray(updates.requiredSkills)) project.requiredSkills = updates.requiredSkills;
  if (Array.isArray(updates.optionalSkills)) project.optionalSkills = updates.optionalSkills;
  if (updates.experienceLevel) project.experienceLevel = updates.experienceLevel;
  if (updates.category) project.category = updates.category;
  if (Array.isArray(updates.technologies)) project.technologies = updates.technologies;
  if (updates.projectType) project.projectType = updates.projectType;
  if (updates.location) project.location = updates.location.trim();
  if (typeof updates.remoteAllowed === 'boolean') project.remoteAllowed = updates.remoteAllowed;
  if (updates.duration) project.duration = updates.duration;
  if (updates.numberOfOpenings) project.numberOfOpenings = Number(updates.numberOfOpenings);
  if (updates.applicationDeadline) project.applicationDeadline = updates.applicationDeadline;
  if (updates.githubUrl !== undefined) project.githubUrl = updates.githubUrl ? String(updates.githubUrl).trim() : undefined;
  if (updates.liveDemoUrl !== undefined) project.liveDemoUrl = updates.liveDemoUrl ? String(updates.liveDemoUrl).trim() : undefined;
  if (updates.lookingFor !== undefined) project.lookingFor = updates.lookingFor ? String(updates.lookingFor).trim() : undefined;

  project.updatedAt = new Date().toISOString();
  db.projects[project.id] = project;
  persistDatabase();

  res.json({ project });
});

// Close Project (Allowed for Project Owner or Admin)
app.post('/api/projects/:id/close', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as StoredUser;
  const db = getDb();
  const project = db.projects[req.params.id];

  if (!project) {
    res.status(404).json({ error: 'Project not found.' });
    return;
  }

  if (project.ownerId !== user.uid && user.role !== 'admin') {
    res.status(403).json({ error: 'Unauthorized to close this project.' });
    return;
  }

  project.status = 'closed';
  project.updatedAt = new Date().toISOString();
  db.projects[project.id] = project;
  persistDatabase();

  res.json({ project });
});

// Delete Project (Allowed for Project Owner or Admin)
app.delete('/api/projects/:id', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as StoredUser;
  const db = getDb();
  const project = db.projects[req.params.id];

  if (!project) {
    res.status(404).json({ error: 'Project not found.' });
    return;
  }

  if (project.ownerId !== user.uid && user.role !== 'admin') {
    res.status(403).json({ error: 'You are only authorized to delete your own projects.' });
    return;
  }

  delete db.projects[project.id];
  persistDatabase();

  res.json({ success: true, message: 'Project removed successfully.' });
});

// Bookmarks toggle
app.post('/api/projects/:id/bookmark', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as StoredUser;
  const db = getDb();
  const projectId = req.params.id;

  const bookmarkKey = `bm-${user.uid}-${projectId}`;
  let bookmarked = false;

  if (db.bookmarks[bookmarkKey]) {
    delete db.bookmarks[bookmarkKey];
    bookmarked = false;
  } else {
    db.bookmarks[bookmarkKey] = {
      id: bookmarkKey,
      userId: user.uid,
      projectId,
      createdAt: new Date().toISOString()
    };
    bookmarked = true;
  }

  persistDatabase();
  res.json({ bookmarked });
});

app.get('/api/bookmarks', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as StoredUser;
  const db = getDb();
  const userBookmarks = Object.values(db.bookmarks).filter(b => b.userId === user.uid);
  const bookmarkedProjectIds = userBookmarks.map(b => b.projectId);
  res.json({ bookmarkIds: bookmarkedProjectIds });
});

/* ============================================================
   AI ADAPTIVE SKILL ASSESSMENT ENDPOINTS
   SECURITY: Correct answers are NEVER sent to the client
============================================================ */

app.post('/api/assessments/start', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user as StoredUser;
  const { skill, initialDifficulty, totalQuestions = 10 } = req.body;

  if (!skill) {
    res.status(400).json({ error: 'Skill is required to begin assessment.' });
    return;
  }

  const validDiff: SkillDifficulty = 
    ['Beginner', 'Intermediate', 'Advanced'].includes(initialDifficulty)
      ? initialDifficulty
      : 'Beginner';

  const assessmentId = `asmt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  // Generate initial question
  const firstQuestion = await generateQuestionWithGemini(skill, validDiff, []);

  const session: AssessmentSession = {
    assessmentId,
    userId: user.uid,
    skill,
    initialDifficulty: validDiff,
    currentDifficulty: validDiff,
    totalQuestions: Math.min(15, Math.max(5, Number(totalQuestions) || 10)),
    currentQuestionIndex: 0,
    questions: [firstQuestion],
    answers: [],
    startedAt: Date.now(),
    aiGeneratedCount: firstQuestion.isAiGenerated ? 1 : 0,
    fallbackCount: firstQuestion.isAiGenerated ? 0 : 1
  };

  const db = getDb();
  db.activeSessions[assessmentId] = session;
  persistDatabase();

  // Return question to client WITHOUT correctOptionIndex or explanation
  const clientQuestion: QuestionClient = {
    id: firstQuestion.id,
    skill: firstQuestion.skill,
    difficulty: firstQuestion.difficulty,
    question: firstQuestion.question,
    codeSnippet: firstQuestion.codeSnippet,
    options: firstQuestion.options,
    questionNumber: 1,
    totalQuestions: session.totalQuestions
  };

  res.status(201).json({
    assessmentId,
    skill,
    difficulty: validDiff,
    question: clientQuestion
  });
});

app.post('/api/assessments/answer', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user as StoredUser;
  const { assessmentId, questionId, selectedOptionIndex, timeSpentSeconds = 15 } = req.body;

  const db = getDb();
  const session = db.activeSessions[assessmentId];

  if (!session) {
    res.status(404).json({ error: 'Assessment session not found or expired.' });
    return;
  }

  if (session.userId !== user.uid) {
    res.status(403).json({ error: 'Unauthorized assessment session.' });
    return;
  }

  // Find the question being answered
  const currentQ = session.questions[session.currentQuestionIndex];
  if (!currentQ || currentQ.id !== questionId) {
    res.status(400).json({ error: 'Mismatched question sequence.' });
    return;
  }

  // Evaluate correctness securely on server
  const isCorrect = Number(selectedOptionIndex) === currentQ.correctOptionIndex;

  session.answers.push({
    questionId: currentQ.id,
    question: currentQ.question,
    difficulty: currentQ.difficulty,
    options: currentQ.options,
    selectedOptionIndex: Number(selectedOptionIndex),
    correctOptionIndex: currentQ.correctOptionIndex,
    isCorrect,
    explanation: currentQ.explanation,
    timeSpentSeconds: Number(timeSpentSeconds) || 10
  });

  // Calculate adaptive difficulty for subsequent questions
  const nextDiff = computeNextDifficulty(
    session.currentDifficulty,
    session.answers.map(a => ({ isCorrect: a.isCorrect }))
  );
  session.currentDifficulty = nextDiff;

  // Immediate question feedback for user
  const feedback = {
    isCorrect,
    selectedOptionIndex: Number(selectedOptionIndex),
    correctOptionIndex: currentQ.correctOptionIndex,
    explanation: currentQ.explanation
  };

  session.currentQuestionIndex += 1;

  // Check if assessment completed
  if (session.currentQuestionIndex >= session.totalQuestions) {
    // Finalize assessment
    const durationSeconds = Math.round((Date.now() - session.startedAt) / 1000);

    const assessmentResult: AssessmentResult = compileAssessmentResult({
      assessmentId: session.assessmentId,
      userId: user.uid,
      skill: session.skill,
      initialDifficulty: session.initialDifficulty,
      finalDifficulty: session.currentDifficulty,
      questionHistory: session.answers,
      durationSeconds,
      aiGeneratedQuestionCount: session.aiGeneratedCount,
      fallbackQuestionCount: session.fallbackCount
    });

    if (!db.assessments[user.uid]) {
      db.assessments[user.uid] = [];
    }
    db.assessments[user.uid].unshift(assessmentResult);

    // Auto-award skill to profile if >= 60% and not already in profile
    if (assessmentResult.percentageScore >= 60 && !user.skills.includes(session.skill)) {
      user.skills.push(session.skill);
      db.users[user.uid] = user;
    }

    delete db.activeSessions[assessmentId];
    persistDatabase();

    res.json({
      completed: true,
      feedback,
      result: assessmentResult
    });
    return;
  }

  // Assessment continues: generate next question
  const existingTexts = session.questions.map(q => q.question);
  const nextQ = await generateQuestionWithGemini(session.skill, session.currentDifficulty, existingTexts);
  session.questions.push(nextQ);

  if (nextQ.isAiGenerated) {
    session.aiGeneratedCount += 1;
  } else {
    session.fallbackCount += 1;
  }

  persistDatabase();

  const nextClientQuestion: QuestionClient = {
    id: nextQ.id,
    skill: nextQ.skill,
    difficulty: nextQ.difficulty,
    question: nextQ.question,
    codeSnippet: nextQ.codeSnippet,
    options: nextQ.options,
    questionNumber: session.currentQuestionIndex + 1,
    totalQuestions: session.totalQuestions
  };

  res.json({
    completed: false,
    feedback,
    nextQuestion: nextClientQuestion,
    currentDifficulty: session.currentDifficulty
  });
});

app.get('/api/assessments/history', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as StoredUser;
  const db = getDb();
  const list = db.assessments[user.uid] || [];
  res.json({ assessments: list });
});

/* ============================================================
   RECOMMENDATION ENGINE ENDPOINTS
============================================================ */

app.get('/api/recommendations', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user as StoredUser;
  const db = getDb();
  const userAssessments = db.assessments[user.uid] || [];
  const openProjects = Object.values(db.projects).filter(p => p.status === 'open');

  // Compute deterministic matches for all open projects
  const scoredMatches = openProjects.map(project => 
    calculateMatchScore(user, project, userAssessments)
  );

  // Sort descending by overall match score
  scoredMatches.sort((a, b) => b.overallScore - a.overallScore);

  // For top 3 recommendations, enrich with Gemini explanation if AI is available
  const enrichedTop = await Promise.all(
    scoredMatches.slice(0, 3).map(async match => {
      if (match.overallScore >= 50) {
        try {
          const aiSummary = await generateMatchExplanationWithGemini({
            projectTitle: match.project.title,
            requiredSkills: match.project.requiredSkills,
            userSkills: user.skills,
            matchingSkills: match.matchingSkills,
            missingSkills: match.missingRequiredSkills,
            score: match.overallScore
          });
          return {
            ...match,
            explanationSummary: aiSummary,
            isAiExplained: true
          };
        } catch {
          return match;
        }
      }
      return match;
    })
  );

  const finalMatches = [...enrichedTop, ...scoredMatches.slice(3)];
  res.json({ recommendations: finalMatches });
});

/* ============================================================
   APPLICATIONS TRACKING ENDPOINTS
============================================================ */

app.post('/api/applications', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as StoredUser;
  const { projectId, coverLetter, relevantSkills } = req.body;

  if (!projectId || !coverLetter) {
    res.status(400).json({ error: 'Project ID and a cover letter are required.' });
    return;
  }

  const db = getDb();
  const project = db.projects[projectId];

  if (!project) {
    res.status(404).json({ error: 'Project not found.' });
    return;
  }

  if (project.status === 'closed') {
    res.status(400).json({ error: 'This project is closed and is no longer accepting applications.' });
    return;
  }

  // Prevent duplicate application
  const alreadyApplied = Object.values(db.applications).some(
    app => app.projectId === projectId && app.applicantId === user.uid && app.status !== 'Withdrawn'
  );

  if (alreadyApplied) {
    res.status(409).json({ error: 'You have already submitted an active application for this project.' });
    return;
  }

  const appId = `app-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const newApp: Application = {
    id: appId,
    projectId: project.id,
    projectTitleSnapshot: project.title,
    applicantId: user.uid,
    applicantNameSnapshot: user.name,
    applicantEmailSnapshot: user.email,
    applicantSkillsSnapshot: user.skills,
    coverLetter: coverLetter.trim(),
    relevantSkills: Array.isArray(relevantSkills) ? relevantSkills : user.skills,
    status: 'Pending',
    submittedAt: now,
    updatedAt: now,
    statusHistory: [
      {
        status: 'Pending',
        changedAt: now,
        changedBy: user.name,
        note: 'Application successfully submitted.'
      }
    ]
  };

  db.applications[appId] = newApp;
  persistDatabase();

  res.status(201).json({ application: newApp });
});

app.get('/api/applications/my', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as StoredUser;
  const db = getDb();

  const userApps = Object.values(db.applications)
    .filter(a => a.applicantId === user.uid)
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  res.json({ applications: userApps });
});

app.post('/api/applications/:id/withdraw', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as StoredUser;
  const db = getDb();
  const application = db.applications[req.params.id];

  if (!application) {
    res.status(404).json({ error: 'Application not found.' });
    return;
  }

  if (application.applicantId !== user.uid) {
    res.status(403).json({ error: 'You are only authorized to withdraw your own applications.' });
    return;
  }

  if (application.status === 'Withdrawn') {
    res.status(400).json({ error: 'Application is already withdrawn.' });
    return;
  }

  const now = new Date().toISOString();
  application.status = 'Withdrawn';
  application.updatedAt = now;
  application.statusHistory.push({
    status: 'Withdrawn',
    changedAt: now,
    changedBy: user.name,
    note: 'Withdrawn by applicant.'
  });

  db.applications[application.id] = application;
  persistDatabase();

  res.json({ application });
});

// Recruiter: View applications for their projects
app.get('/api/recruiter/applications', requireRecruiter, (req: Request, res: Response) => {
  const user = (req as any).user as StoredUser;
  const db = getDb();

  const myProjectIds = Object.values(db.projects)
    .filter(p => p.ownerId === user.uid || user.role === 'admin')
    .map(p => p.id);

  const relevantApps = Object.values(db.applications)
    .filter(a => myProjectIds.includes(a.projectId))
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  res.json({ applications: relevantApps });
});

// Recruiter: Update application status (Shortlisted, Accepted, Rejected)
app.put('/api/recruiter/applications/:id/status', requireRecruiter, (req: Request, res: Response) => {
  const user = (req as any).user as StoredUser;
  const { status, note } = req.body;

  if (!['Pending', 'Shortlisted', 'Accepted', 'Rejected'].includes(status)) {
    res.status(400).json({ error: 'Invalid status transition.' });
    return;
  }

  const db = getDb();
  const application = db.applications[req.params.id];

  if (!application) {
    res.status(404).json({ error: 'Application not found.' });
    return;
  }

  const project = db.projects[application.projectId];
  if (!project || (project.ownerId !== user.uid && user.role !== 'admin')) {
    res.status(403).json({ error: 'Unauthorized to review applications for this project.' });
    return;
  }

  const now = new Date().toISOString();
  application.status = status;
  application.updatedAt = now;
  application.statusHistory.push({
    status,
    changedAt: now,
    changedBy: user.name,
    note: note ? String(note).trim() : `Status updated to ${status}`
  });

  db.applications[application.id] = application;
  persistDatabase();

  res.json({ application });
});

/* ============================================================
   DEV & SEED TOOLS
============================================================ */

app.post('/api/dev/seed', (req: Request, res: Response) => {
  seedDemoData();
  res.json({ message: 'Demonstration data successfully reset and seeded.' });
});

/* ============================================================
   VITE DEV MIDDLEWARE / STATIC ASSETS
============================================================ */

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[DevMatch] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
