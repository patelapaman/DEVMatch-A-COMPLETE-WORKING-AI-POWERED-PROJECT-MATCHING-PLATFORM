/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';

const BASE_URL = 'http://localhost:3000/api';

test('Integration 1: Public project listing and query filtering', async () => {
  const res = await fetch(`${BASE_URL}/projects`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data.projects));
  assert.ok(data.projects.length >= 1);

  // Search filter
  const searchRes = await fetch(`${BASE_URL}/projects?search=nexus`);
  const searchData = await searchRes.json();
  assert.ok(searchData.projects.length >= 1);
  assert.ok(searchData.projects[0].title.toLowerCase().includes('nexus'));

  // Category filter
  const catRes = await fetch(`${BASE_URL}/projects?category=Frontend`);
  const catData = await catRes.json();
  assert.ok(catData.projects.every((p: any) => p.category === 'Frontend'));
});

test('Integration 2: User registration with input validation & duplicate prevention', async () => {
  const testEmail = `test.user.${Date.now()}@example.com`;

  // Missing fields validation
  const invalidRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail })
  });
  assert.equal(invalidRes.status, 400);

  // Successful registration
  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test Candidate',
      email: testEmail,
      password: 'password123',
      role: 'developer',
      skills: ['React', 'TypeScript']
    })
  });
  assert.equal(regRes.status, 201);
  const regData = await regRes.json();
  assert.ok(regData.token);
  assert.equal(regData.user.email, testEmail);
  assert.equal(regData.user.role, 'developer');

  // Duplicate registration must return 409
  const dupRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Duplicate Candidate',
      email: testEmail,
      password: 'password123'
    })
  });
  assert.equal(dupRes.status, 409);
});

test('Integration 3: User login authentication verification', async () => {
  // Invalid credentials return 401
  const failRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'alex.dev@example.com',
      password: 'wrongpassword'
    })
  });
  assert.equal(failRes.status, 401);

  // Valid credentials return 200 with token
  const okRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'alex.dev@example.com',
      password: 'dev123'
    })
  });
  assert.equal(okRes.status, 200);
  const okData = await okRes.json();
  assert.ok(okData.token);
  assert.equal(okData.user.email, 'alex.dev@example.com');
});

test('Integration 4: Role escalation protection on profile updates', async () => {
  // Developer attempting to change role to admin or recruiter
  const devToken = 'user-alex-dev';
  const res = await fetch(`${BASE_URL}/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${devToken}`,
      'x-devmatch-uid': devToken
    },
    body: JSON.stringify({
      role: 'admin',
      bio: 'Audited bio update'
    })
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  // Role must remain 'developer' - client tampering rejected
  assert.equal(data.user.role, 'developer');
  assert.equal(data.user.bio, 'Audited bio update');
});

test('Integration 5: Project creation authorization (corporate vs personal)', async () => {
  const devToken = 'user-alex-dev';
  const recruiterToken = 'user-sarah-lead';

  // Developer should be forbidden (403) from creating corporate hiring projects
  const devCorpRes = await fetch(`${BASE_URL}/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${devToken}`,
      'x-devmatch-uid': devToken
    },
    body: JSON.stringify({
      title: 'Unauthorized Corporate Role',
      description: 'Corporate position',
      projectType: 'Full-time',
      requiredSkills: ['React']
    })
  });
  assert.equal(devCorpRes.status, 403);

  // Developer should be ALLOWED (201) to publish Personal Projects
  const devPersonalRes = await fetch(`${BASE_URL}/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${devToken}`,
      'x-devmatch-uid': devToken
    },
    body: JSON.stringify({
      title: `Alex Personal Portfolio Engine ${Date.now()}`,
      description: 'An open-source portfolio builder with Next.js and Tailwind',
      requiredSkills: ['Next.js', 'TypeScript', 'Tailwind CSS'],
      optionalSkills: ['Vercel'],
      experienceLevel: 'Intermediate',
      category: 'Frontend',
      projectType: 'Personal Project',
      isPersonalProject: true,
      githubUrl: 'https://github.com/alexdev/portfolio-engine',
      liveDemoUrl: 'https://portfolio-engine.dev',
      lookingFor: 'Designers and contributors welcome',
      location: 'Remote'
    })
  });
  assert.equal(devPersonalRes.status, 201);
  const personalData = await devPersonalRes.json();
  assert.ok(personalData.project.id);
  assert.equal(personalData.project.isPersonalProject, true);
  assert.equal(personalData.project.projectType, 'Personal Project');
  assert.equal(personalData.project.githubUrl, 'https://github.com/alexdev/portfolio-engine');

  // Recruiter should succeed (201) for corporate openings
  const recCreateRes = await fetch(`${BASE_URL}/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${recruiterToken}`,
      'x-devmatch-uid': recruiterToken
    },
    body: JSON.stringify({
      title: `Audit Integration Project ${Date.now()}`,
      description: 'Integration test project description for audit',
      requiredSkills: ['React', 'TypeScript'],
      optionalSkills: ['Tailwind CSS'],
      experienceLevel: 'Intermediate',
      category: 'Frontend',
      projectType: 'Full-time',
      location: 'Remote',
      numberOfOpenings: 1
    })
  });
  assert.equal(recCreateRes.status, 201);
  const recData = await recCreateRes.json();
  assert.ok(recData.project.id);
});

test('Integration 6: Assessment answer key security (no client-side answer key)', async () => {
  const devToken = 'user-alex-dev';

  const startRes = await fetch(`${BASE_URL}/assessments/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${devToken}`,
      'x-devmatch-uid': devToken
    },
    body: JSON.stringify({
      skill: 'React',
      initialDifficulty: 'Intermediate',
      totalQuestions: 5
    })
  });

  assert.equal(startRes.status, 201);
  const startData = await startRes.json();
  assert.ok(startData.assessmentId);
  assert.ok(startData.question);

  // CRITICAL SECURITY AUDIT: Verify question has NO correctOptionIndex and NO explanation
  assert.equal(startData.question.correctOptionIndex, undefined);
  assert.equal(startData.question.explanation, undefined);
  assert.equal(startData.question.options.length, 4);

  // Submit answer
  const answerRes = await fetch(`${BASE_URL}/assessments/answer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${devToken}`,
      'x-devmatch-uid': devToken
    },
    body: JSON.stringify({
      assessmentId: startData.assessmentId,
      questionId: startData.question.id,
      selectedOptionIndex: 0
    })
  });

  assert.equal(answerRes.status, 200);
  const answerData = await answerRes.json();
  assert.ok(typeof answerData.feedback.isCorrect === 'boolean');
  assert.ok(answerData.feedback.explanation);
});

test('Integration 7: Duplicate application prevention & application withdrawal', async () => {
  // Create unique test user for isolation
  const email = `applicant.${Date.now()}@example.com`;
  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Applicant Tester',
      email,
      password: 'password123',
      role: 'developer',
      skills: ['Python', 'SQL']
    })
  });
  const regData = await regRes.json();
  const token = regData.token;

  // Submit first application to proj-dataflow-pipeline
  const app1Res = await fetch(`${BASE_URL}/applications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'x-devmatch-uid': token
    },
    body: JSON.stringify({
      projectId: 'proj-dataflow-pipeline',
      coverLetter: 'First application for data pipeline'
    })
  });
  assert.equal(app1Res.status, 201);
  const app1Data = await app1Res.json();
  const applicationId = app1Data.application.id;
  assert.equal(app1Data.application.status, 'Pending');

  // Submit duplicate application to same project -> MUST return 409
  const dupAppRes = await fetch(`${BASE_URL}/applications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'x-devmatch-uid': token
    },
    body: JSON.stringify({
      projectId: 'proj-dataflow-pipeline',
      coverLetter: 'Duplicate attempt'
    })
  });
  assert.equal(dupAppRes.status, 409);

  // Withdraw the application
  const withdrawRes = await fetch(`${BASE_URL}/applications/${applicationId}/withdraw`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-devmatch-uid': token
    }
  });
  assert.equal(withdrawRes.status, 200);
  const withdrawData = await withdrawRes.json();
  assert.equal(withdrawData.application.status, 'Withdrawn');
});

test('Integration 8: Application status change authorization by recruiter', async () => {
  const recruiterToken = 'user-sarah-lead';
  const devToken = 'user-alex-dev';

  // Sample app owned by Sarah: app-alex-nexus-1
  // Developer attempting to accept their own application must be rejected (403)
  const devHackRes = await fetch(`${BASE_URL}/recruiter/applications/app-alex-nexus-1/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${devToken}`,
      'x-devmatch-uid': devToken
    },
    body: JSON.stringify({
      status: 'Accepted',
      note: 'Self accepted'
    })
  });
  assert.equal(devHackRes.status, 403);

  // Authorized project owner Sarah Chen updating status
  const ownerRes = await fetch(`${BASE_URL}/recruiter/applications/app-alex-nexus-1/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${recruiterToken}`,
      'x-devmatch-uid': recruiterToken
    },
    body: JSON.stringify({
      status: 'Shortlisted',
      note: 'Verified candidate credentials'
    })
  });
  assert.equal(ownerRes.status, 200);
  const ownerData = await ownerRes.json();
  assert.equal(ownerData.application.status, 'Shortlisted');
});
