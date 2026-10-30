# DevMatch — AI-Powered Project Matching Platform

> **Discover Projects. Prove Your Skills. Find Your Match.**

DevMatch is an AI-powered full-stack platform that connects students, developers, and job seekers with technical projects tailored to their exact skill set. Candidates prove their abilities through server-evaluated adaptive quizzes, receive transparent 5-factor project match ratings, and track applications with real-time status history.

---

## 🌟 Key Features

1. **Deterministic & Explainable Matching Engine (0–100%)**:
   - **Required Skill Coverage (50 pts)**: Strict percentage of required project skills matched.
   - **Optional Skill Coverage (15 pts)**: Bonus for preferred/nice-to-have technologies.
   - **Assessment Evidence (20 pts)**: Real verified quiz performance stored in the database.
   - **Experience Compatibility (10 pts)**: Matrix scoring across Beginner, Intermediate, and Advanced tiers.
   - **Preferred Tech & Interests (5 pts)**: Overlap with user interests.
   - **Transparent Explainability**: Details matching skills vs missing skills with instant links to test missing skills.

2. **AI Adaptive Skill Assessment**:
   - Covers 13+ technical disciplines: **React, TypeScript, JavaScript, Node.js, Python, SQL, Java, C++, MongoDB, Firebase, Git, REST APIs, and DSA**.
   - **Zero Client-Side Leaks**: Correct options and explanations are never sent to the client until after the user submits their answer.
   - **Dynamic Difficulty**: Calibrates up or down after each question based on consecutive performance.
   - **Gemini 2.5 Server-Side Integration**: Generates fresh technical questions with validated schemas, backed by a curated question bank fallback if API quota or keys are unavailable.

3. **Curated & Seeded Project Directory**:
   - Real developer projects across Frontend, Backend, Full-Stack, AI & ML, Mobile, and Open-Source.
   - Multi-filtering by Category, Experience Level, Remote status, Project Type, and specific Skills.
   - Project Bookmarking & Instant Application Submission.

4. **Recruiter Studio & Application Pipeline**:
   - Role-based permissions for Project Leads and Recruiters.
   - Post, edit, and close technical projects.
   - Review incoming candidate proposals, skill tags, and verified assessment scores.
   - Update application statuses (**Pending**, **Shortlisted**, **Accepted**, **Rejected**) with custom review feedback and audit trail.

5. **Built-in Unit Test Suite**:
   - Decoupled pure logic tested via Node.js built-in `node:test` runner.
   - 10 automated tests verifying scoring math, difficulty progression, and skill normalization.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide Icons, Motion
- **Backend**: Node.js, Express, TypeScript runtime via `tsx`
- **AI Service**: Google GenAI SDK (`@google/genai` v2.4.0) with model `gemini-2.5-flash`
- **Database**: Firestore-compatible atomic JSON storage engine + `firestore.rules` security specifications
- **Testing**: Node built-in `node:test` and `node:assert/strict`

---

## 🚀 Environment Setup & Running the Code

### 1. Prerequisites
- **Node.js**: Version 20.x or higher
- **npm** or **bun** / **yarn**

### 2. Installation
Extract the provided `devmatch-full-project.zip` archive or clone this repository, then install dependencies:

```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the project root (see `.env.example`):

```env
# Port where Express server will listen (Default: 3000)
PORT=3000

# Gemini API Key (Required for dynamic AI question generation)
# Automatically provided in Google AI Studio environment
GEMINI_API_KEY="your-gemini-api-key-here"

# Application URL
APP_URL="http://localhost:3000"
```

> **Note on AI Fallback**: If `GEMINI_API_KEY` is not provided, DevMatch will automatically utilize its comprehensive curated technical question bank without crashing or degrading user experience.

### 4. Running the Development Server
Start the unified full-stack server (Express backend + Vite middleware on port 3000):

```bash
npm run dev
```

Visit **http://localhost:3000** in your web browser.

### 5. Running the Test Suite
Execute the automated unit tests:

```bash
npm test
```

Expected output:
```text
10 tests passed (100% pass rate)
- computeNextDifficulty steps up on 2 consecutive correct answers
- computeNextDifficulty steps down on 2 consecutive incorrect answers
- computeNextDifficulty does not flip on a single answer
- determineProficiencyLevel assigns accurate tiers
- compileAssessmentResult produces complete, compliant result object
- normalizeSkill handles punctuation, casing, and spacing
- hasMatchingSkill identifies exact and substring matches
- calculateExperienceScore evaluates level compatibility
- calculateMatchScore produces normalized 0-100 score and explainable breakdowns
- calculateMatchScore correctly flags missing required skills
```

### 6. Production Build
To create an optimized production bundle:

```bash
npm run build
npm start
```

---

## 👤 Instant Demonstration Accounts

For quick inspection, DevMatch comes pre-seeded with two accounts:

| Role | Email | Password | Details |
|---|---|---|---|
| **Developer / Student** | `alex.dev@example.com` | `dev123` | Intermediate Full-Stack developer with 2 verified assessments (React 90%, TypeScript 80%) |
| **Recruiter / Lead** | `sarah.recruiter@example.com` | `lead123` | Project Lead with 6 posted engineering projects and candidate applications to review |

*(You can also use the 1-Click Role Switcher pill in the top navigation bar to toggle between developer and recruiter views instantly.)*

---

## 🔒 Security Architecture

1. **Zero Client-Side Question Key Exposure**: The server creates assessment sessions, retains the answer key in memory/storage, and strips `correctOptionIndex` before sending the question to the client.
2. **Server-Side Scoring Verification**: The final score is calculated entirely by the server based on recorded answers, preventing client score fabrication.
3. **Role Escalation Protection**: Profile update routes forbid client tampering with the `role` attribute.
4. **Least-Privilege Firestore Rules**: Documented in `firestore.rules` ensuring users can only edit their own documents, and only project owners can change candidate application statuses.

---

## 📦 Download Standalone Project ZIP

The standalone project archive is generated and stored directly in the repository:
- Path: `./devmatch-full-project.zip`
- Web Download: Click **"Project Settings & ZIP"** in the navigation/footer, or download from `/devmatch-full-project.zip`.
