# RawEval Experts App — Complete Frontend Rebuild Guide

> **Purpose:** This document is the single source of truth for rebuilding the Experts app (`apps/experts`) from its current broken/placeholder state into a polished, production-grade annotation workbench. It covers every screen, every API call, every input field, every gate check, and every UI decision — so a frontend engineer can build the entire app in one shot without guessing.

> **Backend:** `https://api.raweval.com` (production, healthy) — all endpoints verified working.

---

## Table of Contents

1. [The Big Picture — What Are We Building?](#1-the-big-picture)
2. [Current State & What's Broken](#2-current-state)
3. [App Architecture & File Map](#3-architecture)
4. [Screen-by-Screen Specification](#4-screens)
   - 4.1 [Landing & Auth](#41-landing--auth)
   - 4.2 [Dashboard (Post-Login Hub)](#42-dashboard)
   - 4.3 [Onboarding Flow (5-Step Gate)](#43-onboarding)
   - 4.4 [Job Browser](#44-job-browser)
   - 4.5 [Interview Setup (Job-Based)](#45-interview-setup)
   - 4.6 [Interview Room — V1 Text](#46-interview-v1)
   - 4.7 [Interview Room — V2 Video](#47-interview-v2)
   - 4.8 [Interview Results](#48-results)
   - 4.9 [Interview History](#49-history)
   - 4.10 [Profile Page](#410-profile)
   - 4.11 [Workbench — The Core](#411-workbench)
5. [Workbench Deep Dive](#5-workbench-deep-dive)
   - 5.1 [Gate Logic](#51-gate)
   - 5.2 [Task Queue (Left Panel)](#52-task-queue)
   - 5.3 [Conversation Viewer (Center)](#53-conversation-viewer)
   - 5.4 [Rubric Panel (Right — Tab 1)](#54-rubric)
   - 5.5 [Questions Panel (Right — Tab 2)](#55-questions)
   - 5.6 [Submission Form (Right — Tab 3)](#56-submission)
   - 5.7 [Error Marking Overlay](#57-error-marking)
   - 5.8 [Reviews (Pre & Post)](#58-reviews)
   - 5.9 [Comments, Timeline, Golden Answers](#59-extras)
6. [Complete API Reference](#6-api-reference)
7. [Service Layer Integration](#7-services)
8. [State Management](#8-state)
9. [Design System & UI Specifications](#9-design)
10. [Keyboard Shortcuts & Accessibility](#10-shortcuts)
11. [Error Handling & Edge Cases](#11-errors)
12. [Implementation Priority Order](#12-priority)
13. [Admin — Workbench Jobs, Prompts & Interview Management](#13-admin)

---

## 1. The Big Picture

### What RawEval Does

RawEval is a **human evaluation platform for LLM outputs**. The pipeline:

```
User chats with AI → Marks response as "failed" → QC pipeline auto-analyzes →
Conversation goes to a Batch → Batch allocated to Domain Experts →
Experts annotate (answer questions, mark errors, provide corrections) →
IAA computed → Reviews → Final verdict + payout
```

### The Expert's Journey

```
Register account → Upload resume (PDF/DOCX/TXT, pdfplumber fallback) →
Fill profile → Select domains → Browse available jobs →
Select a job → Start AI interview (resume auto-pulled, JD from job) →
Pass interview (score ≥ 65) → expert_status = "active" →
Get task allocations → Annotate in workbench → Get paid
```

### What the Experts App Must Do

1. **Onboard** new experts through a clear, gated flow (resume upload → profile → domains → browse jobs → select job → interview)
2. **Gate** access — only `expert_status === "active"` experts see the workbench
3. **Present** annotation tasks with full conversation context, multi-model side-by-side comparison, rubric claims, and guided questions
4. **Collect** expert annotations (question responses, error markings, corrected responses, reasoning)
5. **Handle** reviews (pre-annotation and post-annotation)
6. **Show** expert's performance (score, tier, domain certifications, payment history)

### Why the Current Frontend is Broken

The workbench `page.tsx` has all the components imported but **none are wired**:
- Center panel shows: *"Conversation viewer and annotation tools will load here"*
- Right panel shows: *"Rubric and questions will load here"*
- The `ConversationView`, `RubricPanel`, `QuestionsPanel`, `SubmissionForm` components exist but are not rendered
- No interview flow exists on the experts app (users have no way to become active)
- The onboarding gate blocks access but doesn't guide users through the steps smoothly
- The dashboard shows fake "opportunity" cards instead of real data

---

## 2. Current State

### Files That Exist But Are Stubbed/Disconnected

| File | Status | Issue |
|------|--------|-------|
| `app/workbench/page.tsx` | **Broken** | Center = placeholder text, Right = placeholder text. Components exist but aren't rendered. |
| `features/workbench/components/conversation-view.tsx` | Built | Not imported into page.tsx |
| `features/workbench/components/rubric-panel.tsx` | Built | Not imported into page.tsx |
| `features/workbench/components/questions-panel.tsx` | Built | Not imported into page.tsx |
| `features/workbench/components/submission-form.tsx` | Built | Not imported into page.tsx |
| `features/workbench/components/error-marking-overlay.tsx` | Built | Not imported into page.tsx |
| `features/workbench/components/comments-panel.tsx` | Built | Not connected |
| `features/workbench/components/status-timeline.tsx` | Built | Not connected |
| `features/workbench/components/golden-answers.tsx` | Built | Not connected |
| `features/workbench/components/pre-review-panel.tsx` | Built | Not connected |
| `features/workbench/components/post-review-panel.tsx` | Built | Not connected |
| `app/(authenticated)/onboarding/page.tsx` | Partial | Steps exist but forms may not submit correctly |
| `app/(authenticated)/dashboard/page.tsx` | **Fake** | Shows hardcoded "opportunity" cards, not real data |
| `services/orchestrator-service.ts` | Wrong URLs | Calls `/orchestrator/...` but backend is `/workbench/interviews/...` |

### What Needs to Happen

1. **Wire** existing components into the workbench page
2. **Fix** service URLs to match actual backend endpoints
3. **Build** missing flows (proper onboarding → interview → activation)
4. **Replace** fake dashboard data with real API calls
5. **Polish** the UI from "developer prototype" to "professional tool"

---

## 3. Architecture

### File Structure (Target)

```
apps/experts/
├── app/
│   ├── (public)/
│   │   ├── page.tsx              # Landing page
│   │   ├── login/page.tsx        # Login form
│   │   └── register/page.tsx     # Registration form (NEW — currently missing)
│   ├── (authenticated)/
│   │   ├── layout.tsx            # Navbar + Footer wrapper
│   │   ├── dashboard/page.tsx    # Post-login hub
│   │   ├── onboarding/page.tsx   # 5-step gated flow
│   │   ├── interview/
│   │   │   ├── setup/page.tsx    # Interview configuration
│   │   │   ├── [sessionId]/
│   │   │   │   ├── page.tsx      # V1 text interview
│   │   │   │   └── v2/page.tsx   # V2 video interview
│   │   ├── results/[sessionId]/page.tsx  # Interview results
│   │   ├── history/page.tsx      # Past interview sessions
│   │   └── profile/page.tsx      # Expert profile + score
│   └── workbench/
│       └── page.tsx              # The annotation workbench (gated)
├── features/
│   ├── workbench/
│   │   ├── components/           # 13 components (see §5)
│   │   └── types/index.ts        # TypeScript types
│   └── interview/
│       └── types/index.ts        # Interview types
├── services/
│   ├── auth-service.ts           # Login, register, refresh
│   ├── experts-service.ts        # Profile, domains, onboarding, resume
│   ├── workbench-service.ts      # Tasks, conversations, rubrics, questions
│   ├── orchestrator-service.ts   # V1 interview (FIX URLS)
│   ├── interview-v2-service.ts   # V2 interview
│   ├── session-service.ts        # Interview session list
│   └── api-service.ts            # Base class
├── stores/
│   └── interview-store.ts        # Zustand store
├── lib/
│   ├── api.ts                    # Raw fetch wrapper
│   └── auth.ts                   # Token helpers
└── middleware.ts                  # Edge auth gate
```

### Data Flow

```
                   ┌─────────────────────┐
                   │   middleware.ts      │ ← Checks raweval_access_token cookie
                   │   (Edge Runtime)     │   Redirects to /login if missing
                   └─────────┬───────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
     ┌────────▼──────┐ ┌────▼──────┐ ┌────▼──────────┐
     │  Dashboard    │ │ Onboarding│ │  Workbench    │
     │  (hub page)   │ │ (gated)   │ │  (gated)      │
     └───────────────┘ └───────────┘ └──────┬────────┘
                                            │
                                    ┌───────▼────────┐
                                    │ WorkbenchGate  │ ← Checks onboarding status
                                    │ (client comp)  │   Shows gate screen if incomplete
                                    └───────┬────────┘
                                            │ (expert_status === "active")
                                    ┌───────▼────────┐
                                    │ WorkbenchLayout│ ← 3-panel shell
                                    │ [sidebar|main|right]
                                    └────────────────┘
```

---

## 4. Screens

### 4.1 Landing & Auth

#### Login Page (`/login`)

**Current state:** Works. Email + password form, stores token in cookie.

**What each field should be:**

| Field | Type | Validation | Placeholder |
|-------|------|-----------|-------------|
| Email | `<input type="email">` | Required, valid email format | `you@example.com` |
| Password | `<input type="password">` + show/hide toggle | Required, min 8 chars | `Enter your password` |
| Remember Me | `<input type="checkbox">` | Optional | — |

**API Call:**
```
POST /api/v1/auth/login
Body: { "email": "...", "password": "..." }
Response: {
  "access_token": "eyJ...",
  "refresh_token": "kwx...",
  "token_type": "bearer",
  "expires_in": 1800,
  "refresh_expires_in": 604800,
  "role": "user",           // ← Use this for routing
  "roles": ["user"],
  "accessible_pages": ["chat", "profile", "search"]
}
```

**Post-login routing logic:**
```typescript
const { role, roles } = loginResponse;
if (roles.includes('expert') || roles.includes('admin')) {
  router.push('/dashboard');
} else {
  // New user, needs to become an expert
  router.push('/onboarding');
}
```

#### Register Page (`/register`) — NEEDS BUILDING

**Currently missing.** The login page links to register but the page may not exist or may be incomplete.

**Fields:**

| Field | Type | Validation | Placeholder |
|-------|------|-----------|-------------|
| Full Name | `<input type="text">` | Required, 2+ chars | `Jane Smith` |
| Email | `<input type="email">` | Required, valid email, unique | `you@example.com` |
| Password | `<input type="password">` | Required, min 8 chars | `Min 8 characters` |
| Confirm Password | `<input type="password">` | Must match password | `Confirm your password` |

**API Call:**
```
POST /api/v1/auth/register
Body: { "email": "...", "full_name": "...", "password": "..." }
Response: { "id": 35, "email": "...", "full_name": "...", "role": "user", "is_active": true }
```

**After register → auto-login → redirect to `/onboarding`.**

---

### 4.2 Dashboard (`/dashboard`)

**Current state:** Shows hardcoded fake "opportunity" cards. Needs real data.

**What it should show:**

```
┌─────────────────────────────────────────────────────────┐
│  Welcome back, {full_name}                              │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ Expert Tier  │  │ Expert Score│  │ Tasks Done  │    │
│  │     T1       │  │    78.5     │  │     42      │    │
│  │  "Verified"  │  │  "Good"     │  │  this month │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
│                                                         │
│  ┌─ Onboarding Progress ──────────────────────────┐    │
│  │ [✓] Account  [✓] Resume  [✓] Profile           │    │
│  │ [✓] Domains  [→] Interview  [ ] Active          │    │
│  │                                                  │    │
│  │ [Start Interview →]  (if not completed)          │    │
│  └──────────────────────────────────────────────────┘    │
│                                                         │
│  ┌─ Quick Actions ────────────────────────────────┐    │
│  │ [Open Workbench]  [View Profile]  [History]     │    │
│  └──────────────────────────────────────────────────┘    │
│                                                         │
│  ┌─ Pending Tasks ────────────────────────────────┐    │
│  │ 3 tasks awaiting annotation                      │    │
│  │ • Computer Science / ML — Batch #12              │    │
│  │ • Legal / Contract Law — Batch #14               │    │
│  │ • Medical / Radiology — Batch #15                │    │
│  └──────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

**API calls on mount:**

| Purpose | Endpoint | What to Show |
|---------|----------|-------------|
| Onboarding status | `GET /api/v1/workbench/experts/me/onboarding-status` | Checklist, `current_step`, `can_start_interview` |
| Expert score | `GET /api/v1/workbench/experts/me/score` | `expert_score`, `derived_tier` |
| Pending tasks | `GET /api/v1/workbench/my-tasks?status=pending&page_size=5` | Task count + preview |
| Profile | `GET /api/v1/workbench/experts/me/profile` | Name, tier, education |

**Conditional rendering:**
- If `checklist.active === false` → Show onboarding banner prominently with CTA
- If `checklist.active === true` → Show tasks + workbench CTA
- If `can_start_interview === true` → Show "Start Interview" button
- If tasks exist → Show task preview cards with "Open Workbench" button

---

### 4.3 Onboarding (`/onboarding`)

**This is the most critical flow.** A new user MUST complete all 5 steps before they can access the workbench. Each step has a hard gate — you cannot skip ahead.

#### Step Progression

```
Step 1: Account Created     → Auto-complete (they registered)
Step 2: Upload Resume       → MUST complete before Step 3 (PDF/DOCX/TXT, pdfplumber fallback)
Step 3: Complete Profile    → MUST complete before Step 4
Step 4: Set Domains         → MUST complete before Step 5
Step 5: Browse Jobs & Interview → Browse available jobs, pick one, pass interview (score ≥ 65)
```

#### Gate Check API

On page load, call:
```
GET /api/v1/workbench/experts/me/onboarding-status

Response: {
  "user_id": 35,
  "expert_id": 2,           // null if not registered
  "expert_status": "pending_interview",
  "expert_tier": 3,
  "current_step": "ready_for_interview",
  "checklist": {
    "registered": true,
    "resume_uploaded": true,
    "profile_completed": false,
    "domains_set": true,
    "interview_completed": false,
    "active": false
  },
  "interview": {             // null if no interview yet
    "session_id": 4,
    "status": "in_progress",
    "score": null
  },
  "can_start_interview": true
}
```

**Use `checklist` to determine which step to expand and which to lock.**

#### Step 2: Upload Resume

**This must be done FIRST before expert registration.**

**UI:**
```
┌─────────────────────────────────────────────┐
│  📄  Upload Your Resume                     │
│                                             │
│  We use your resume to:                     │
│  • Match you with relevant tasks            │
│  • Auto-detect your domain expertise        │
│  • Tailor interview questions               │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │                                     │    │
│  │   Drop your resume here             │    │
│  │   or click to browse                │    │
│  │                                     │    │
│  │   PDF, DOCX, or TXT (max 10MB)     │    │
│  │                                     │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  (After upload, show:)                      │
│  ✓ Resume uploaded: resume.pdf              │
│  Detected domains:                          │
│  [Machine Learning & AI] [Python]           │
│                                             │
└─────────────────────────────────────────────┘
```

**API Call:**
```
POST /api/v1/users/me/resume/upload
Content-Type: multipart/form-data
Body: file=<File>

Response: {
  "message": "Resume uploaded successfully (stored in S3)",
  "filename": "resume.pdf",
  "file_type": "pdf",
  "extracted_text": "...",
  "extracted_text_length": 2450,
  "preview": "Experienced software engineer...",
  "auto_detected_domains": [
    { "domain": "computer_science", "subdomain": "ml_ai", "display_name": "Machine Learning & AI", "confidence_score": 34 },
    { "domain": "computer_science", "subdomain": "python", "display_name": "Python", "confidence_score": 16 }
  ],
  "s3_key": "resumes/20260316_..._resume.pdf",
  "s3_url": "https://raweval-data-prod.s3..."
}
```

**Implementation notes:**
- Use `<input type="file" accept=".pdf,.docx,.txt">`
- Show drag-and-drop zone with `onDragOver` / `onDrop`
- Show upload progress spinner
- After success, display filename + auto-detected domains as colored badges
- The `extracted_text` is stored server-side — frontend doesn't need to keep it

#### Step 2.5: Register as Expert (AUTO — after resume upload)

Once resume is uploaded, **automatically** call expert registration:

```
POST /api/v1/workbench/experts/register
Body: { "user_id": <current_user_id> }

Response: {
  "id": 2,
  "user_id": 35,
  "expert_tier": 3,
  "woe_score": null,
  "interview_completed": false
}
```

**This is automatic — no UI needed.** Just call it after resume upload succeeds. If it returns 409 ("already registered"), ignore the error.

#### Step 3: Complete Profile

**Fields:**

| Field | Input Type | Required | Placeholder / Options |
|-------|-----------|----------|----------------------|
| College/University | `<input type="text">` | Yes | `Stanford University` |
| Highest Education | `<select>` | Yes | `High School, Bachelors, Masters, PhD, PostDoc` |
| Bachelor's Degree | `<input type="text">` | If education ≥ Bachelors | `Computer Science` |
| Master's Degree | `<input type="text">` | If education ≥ Masters | `Machine Learning` |
| Subject Taken | `<input type="text">` | No | `Algorithms, Statistics` |
| Subjects of Expertise | `<TagInput>` (multi-select) | Yes (at least 1) | `Python, NLP, React, ...` |
| Professional Background | `<textarea rows={4}>` | Yes | `5 years at Google working on...` |
| Years of Experience | `<input type="number" min={0} max={50}>` | Yes | `5` |

**API Call:**
```
PUT /api/v1/workbench/experts/me/profile
Body: {
  "college": "Stanford University",
  "highest_education": "masters",
  "bachelors_degree": "Computer Science",
  "masters_degree": "Machine Learning",
  "subject_taken": "Algorithms",
  "subjects_of_expertise": ["Python", "NLP", "React"],
  "professional_background": "5 years at Google...",
  "years_of_experience": 5
}

Response: {
  "user_id": 35,
  "updated_fields": ["college", "highest_education", ...],
  "profile_completed": true
}
```

**On success:** If `profile_completed === true`, mark step as done, auto-advance to Step 4.

#### Step 4: Set Domain Proficiencies

**First, fetch available domains:**
```
GET /api/v1/workbench/domains

Response: {
  "total": 15,
  "domains": [
    {
      "id": 1, "name": "computer_science", "display_name": "Computer Science",
      "subdomains": [
        { "id": 2, "name": "ml_ai", "display_name": "Machine Learning & AI" },
        { "id": 3, "name": "python", "display_name": "Python" },
        ...
      ]
    },
    { "id": 10, "name": "legal", "display_name": "Legal", "subdomains": [...] },
    ...
  ]
}
```

**UI: Domain cards with proficiency slider**

```
┌─────────────────────────────────────────────┐
│  Select Your Domains of Expertise           │
│                                             │
│  (Auto-detected from resume shown first)    │
│                                             │
│  ┌─ Computer Science ──────────────────┐    │
│  │  ☑ Machine Learning & AI    [████░] 80%  │
│  │  ☑ Python                   [███░░] 60%  │
│  │  ☐ Distributed Systems                   │
│  │  ☐ Databases                             │
│  └──────────────────────────────────────┘    │
│                                             │
│  ┌─ Legal ─────────────────────────────┐    │
│  │  ☐ Contract Law                          │
│  │  ☐ Intellectual Property                 │
│  └──────────────────────────────────────┘    │
│                                             │
│  [Save Domains]                             │
│  At least 1 domain required                 │
└─────────────────────────────────────────────┘
```

**For each selected domain, call:**
```
PUT /api/v1/workbench/experts/me/domains
Body: { "domain": "computer_science.ml_ai", "proficiency_score": 80 }

Response: { "user_id": 35, "domain": "computer_science.ml_ai", "proficiency_score": 80 }
```

**Pre-fill:** Show auto-detected domains from resume upload as pre-selected with initial proficiency of 50%.

#### Step 5: Browse Jobs & Start Interview

**Show interview CTA if `can_start_interview === true`.**

The expert must first browse available jobs and pick one before starting the interview. This replaces the old flow where job descriptions were pasted as free text.

```
┌─────────────────────────────────────────────┐
│  🎙  Domain Interview                       │
│                                             │
│  Duration: 15-25 minutes                    │
│  Format: AI-powered adaptive interview      │
│  Passing score: 65/100                      │
│                                             │
│  Your resume has been uploaded and will be   │
│  auto-loaded into the interview.            │
│                                             │
│  [Browse Available Jobs →]                  │
│                                             │
│  (If interview in_progress:)                │
│  You have an interview in progress.         │
│  [Continue Interview →]                     │
└─────────────────────────────────────────────┘
```

**Button actions:**
- "Browse Available Jobs" → Navigate to `/jobs` (Job Browser page)
- "Continue Interview" → Navigate to `/interview/{session_id}`

---

### 4.4 Job Browser (`/jobs`)

**Purpose:** Experts browse available positions and select one to interview for. Jobs are admin-created via the `WorkbenchJob` model and have associated interview prompt templates.

**Data source:**
```
GET /api/v1/workbench/interviews/jobs?job_type=expert_onboarding&is_active=true

Optional filters:
  ?domain_id=5        — Filter by domain
  ?is_active=true     — Default, only active jobs

Response: {
  "total": 12,
  "items": [
    {
      "id": 1,
      "title": "Senior ML Engineer",
      "slug": "senior-ml-engineer",
      "domain_id": 2,
      "domain_name": "Machine Learning & AI",
      "description": "We're looking for experienced ML engineers...",
      "experience_level": "senior",
      "job_type": "expert_onboarding",
      "interview_type": "data_science",
      "interview_duration_minutes": 30,
      "min_questions": 10,
      "difficulty": "medium",
      "seniority": "senior",
      "is_active": true,
      "created_at": "2026-03-15T..."
    },
    ...
  ]
}
```

**UI:**
```
┌──────────────────────────────────────────────────────────────────┐
│  Available Positions                                             │
│                                                                  │
│  Filter: [All Domains ▾] [All Levels ▾]                         │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Senior ML Engineer                            [SENIOR]     │ │
│  │  Machine Learning & AI                                      │ │
│  │                                                             │ │
│  │  We're looking for experienced ML engineers to evaluate     │ │
│  │  and improve AI model outputs across...                     │ │
│  │                                                             │ │
│  │  ⏱ 30 min · 10 questions · Medium difficulty               │ │
│  │                                                             │ │
│  │  [View Details]                    [Start Interview →]      │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Full-Stack Developer                           [MID]       │ │
│  │  Computer Science                                           │ │
│  │  ...                                                        │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ── Or start without a specific job ──                           │
│  [Start General Interview]  (no JD, resume-only)                │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Job Detail (expand or modal on "View Details"):**
```
GET /api/v1/workbench/interviews/jobs/{job_id}

Response: {
  "id": 1,
  "title": "Senior ML Engineer",
  "slug": "senior-ml-engineer",
  "domain_id": 2,
  "domain_name": "Machine Learning & AI",
  "description": "Full job description text...",
  "responsibilities": ["Design ML pipelines", "Evaluate model outputs", ...],
  "requirements": ["5+ years Python", "Experience with PyTorch/TensorFlow", ...],
  "preferred_skills": ["Kubernetes", "MLflow", "Distributed training"],
  "experience_level": "senior",
  "job_type": "expert_onboarding",
  "interview_type": "data_science",
  "interview_duration_minutes": 30,
  "min_questions": 10,
  "difficulty": "medium",
  "seniority": "senior",
  "is_active": true,
  "created_at": "2026-03-15T..."
}
```

**Job Detail UI:**
```
┌──────────────────────────────────────────────────────┐
│  Senior ML Engineer                      [SENIOR]     │
│  Machine Learning & AI                                │
│                                                       │
│  ── Description ──                                    │
│  Full job description text...                         │
│                                                       │
│  ── Responsibilities ──                               │
│  • Design ML pipelines                                │
│  • Evaluate model outputs                             │
│  • ...                                                │
│                                                       │
│  ── Requirements ──                                   │
│  • 5+ years Python                                    │
│  • Experience with PyTorch/TensorFlow                 │
│                                                       │
│  ── Preferred Skills ──                               │
│  [Kubernetes] [MLflow] [Distributed training]         │
│                                                       │
│  ── Interview Info ──                                 │
│  Type: Data Science · Duration: 30 min                │
│  Questions: 10+ · Difficulty: Medium                  │
│                                                       │
│  Your resume will be auto-loaded.                     │
│  No manual JD paste needed.                           │
│                                                       │
│  [Start Text Interview →]                             │
│  [Start Video Interview (Beta) →]                     │
└──────────────────────────────────────────────────────┘
```

**Button actions:**
- "Start Interview" with a job → Navigate to `/interview/setup?job_id={id}`
- "Start General Interview" → Navigate to `/interview/setup` (no `job_id`)

---

### 4.5 Interview Setup (`/interview/setup`)

**Purpose:** Configure and start the interview session. When `job_id` is in the URL, auto-fill settings from the job.

**Key change:** Resume text is **always auto-pulled** from `UserMetadata.professional_background`. No manual text input. Job description comes from `WorkbenchJob` — no textarea for JD.

**Fields:**

| Field | Type | Default | Options | Notes |
|-------|------|---------|---------|-------|
| Selected Job | Read-only card | From `job_id` URL param | — | Shows job title + domain. "Change" link → back to `/jobs` |
| Resume | Read-only preview | Auto-pulled from DB | — | Shows first 200 chars + "Uploaded: resume.pdf" |
| Interview Type | `<select>` | From job's `interview_type` or `full_stack` | `full_stack, frontend, backend, data_science, devops, system_design` | Pre-filled from job if present |
| Seniority | `<select>` | From job's `seniority` or `mid` | `junior, mid, senior, lead, principal` | Pre-filled from job if present |
| Difficulty | `<select>` | From job's `difficulty` or `medium` | `easy, medium, hard` | Pre-filled from job if present |
| Duration | `<input type="range" min={10} max={90}>` | From job's `interview_duration_minutes` or `30` | — | Show label: "30 minutes" |
| Min Questions | `<input type="number" min={5} max={30}>` | From job's `min_questions` or `10` | — | |

**V2 Video options (shown when mode=video):**

| Field | Type | Default |
|-------|------|---------|
| STT Provider | `<select>` | `whisper` (`whisper, deepgram, google`) |
| Noise Suppression | `<toggle>` | `true` |
| Cheat Detection | `<toggle>` | `true` |

**API Flow:**

1. **If `job_id` present — load job details** (to pre-fill fields):
```
GET /api/v1/workbench/interviews/jobs/{job_id}
→ Pre-fill interview_type, seniority, difficulty, duration, min_questions from job
→ Show job title + description as read-only context
```

2. **Resume is auto-pulled** — no need to fetch separately. The backend reads `UserMetadata.professional_background` at session creation time.

3. **Create session:**
```
POST /api/v1/workbench/interviews/sessions
Body: {
  "job_id": 1,            // null for general interview
  "expert_id": null,       // auto-resolved from current user
  "ai_avatar_interview": false,
  "title": "Senior ML Engineer Interview"  // optional, from job title
}

Response: { "session_id": 4, "status": "created" }
```

The backend stores `workbench_job_id` and snapshots the JD as `job_description_text` on the `InterviewSession`. Custom prompt templates associated with the job are automatically loaded during question generation.

4. **Navigate** to `/interview/{session_id}` (V1) or `/interview/{session_id}/v2` (V2)

**Backward compatibility:** If no `job_id` is provided, the existing flow works unchanged — the interview uses default prompts and no JD context.

---

### 4.6 Interview Room — V1 Text (`/interview/[sessionId]`)

**Layout:**
```
┌──────────────────────────────────────────────────────┐
│  Interview Room           Session #4    ⏱ 12:34      │
├──────────────────────────────┬───────────────────────┤
│                              │  Session Info          │
│  [AI Question Bubble]        │  Status: in_progress   │
│                              │  Questions: 3/10       │
│  [User Answer Input]         │  Avg Score: 76         │
│                              │  Difficulty: medium     │
│  [AI Evaluation]             │                        │
│  Score: 80/100               │  Skill Scores          │
│  "Good technical depth..."   │  ├ Technical: 80       │
│                              │  ├ Communication: 75   │
│  [AI Next Question]          │  └ Problem Solving: 72 │
│                              │                        │
│  ┌─────────────────────┐     │  Progress              │
│  │ Type your answer... │     │  ████████░░ 80%        │
│  │                     │     │                        │
│  │          [Submit →]  │     │  [Complete Interview]  │
│  └─────────────────────┘     │                        │
└──────────────────────────────┴───────────────────────┘
```

**API Calls:**

| Action | Endpoint | Notes |
|--------|----------|-------|
| Generate question | `POST /interviews/sessions/{id}/questions?segment_type=conversation&difficulty=medium` | First question is always `conversation` type |
| Submit answer | `POST /interviews/sessions/{id}/answers?transcript_id={tid}` Body: `{"answer": "..."}` | Returns evaluation with score, rubric, improvements |
| Get status | `GET /interviews/sessions/{id}` | Poll every 10s for progress |
| Complete | `POST /interviews/sessions/{id}/complete` | Triggers final scoring |

**Question flow cycle:**
```
1. POST .../questions?segment_type=conversation  → Get question + transcript_id
2. User types answer
3. POST .../answers?transcript_id={tid}          → Get evaluation + score
4. Show evaluation to user
5. POST .../questions?segment_type=technical      → Next question
6. Repeat until min_questions reached
7. POST .../complete                              → Final score
8. Navigate to /results/{sessionId}
```

**Segment type rotation:** `conversation → technical → technical → behavioral → coding → technical → ...`

The backend handles adaptive difficulty automatically. After each answer, the response includes:
```json
{
  "evaluation": {
    "quality_score": 80.0,
    "rubric": {
      "score": 80,
      "breakdown": { "depth": 75, "clarity": 80, "technical_accuracy": 85 },
      "strengths": ["Strong technical background"],
      "improvements": ["Could provide more examples"]
    }
  },
  "next_question_suggestion": {
    "suggested_segment_type": "technical",
    "ready_for_next": true
  }
}
```

---

### 4.7 Interview Room — V2 Video (`/interview/[sessionId]/v2`)

**Layout:**
```
┌──────────────────────────────────────────────────────┐
│  Video Interview         ⏱ 12:34    Q: 3/10         │
├────────────────────────────┬─────────────────────────┤
│                            │  Current Question        │
│  ┌────────────────────┐    │  "Tell me about your    │
│  │                    │    │  experience with         │
│  │   VIDEO FEED       │    │  distributed systems"    │
│  │   (getUserMedia)   │    │                         │
│  │                    │    │  ┌─ Live Transcript ──┐  │
│  └────────────────────┘    │  │ "I worked on a     │  │
│                            │  │ system at Google    │  │
│  🎤 [Mute] 📹 [Camera]    │  │ that handled..."    │  │
│  🛑 [Interrupt AI]         │  └─────────────────────┘  │
│  ⏩ [Force Submit]         │                         │
│                            │  🤖 AI is listening...   │
└────────────────────────────┴─────────────────────────┘
```

**WebSocket Connection:**
```
ws://api.raweval.com/api/v1/ws/v2/interview/{v2_session_id}
```

**V2 Start (REST):**
```
POST /api/v2/interview/start
Body: {
  "job_id": 1,                  // optional — loads JD + custom prompts from WorkbenchJob
  "resume_text": "...",          // optional — auto-pulled from UserMetadata if omitted
  "job_description": "...",      // optional — auto-loaded from job if job_id present
  "interview_type": "full_stack",
  "seniority": "mid",
  "difficulty": "medium",
  "total_time_minutes": 30,
  "min_questions": 10,
  "stt_provider": "whisper",
  "noise_suppression": true,
  "cheat_detection": true,
  "mode": "video"
}

Response: {
  "v2_session_id": 1,
  "v1_session_id": 4,
  "ws_url": "ws://api.raweval.com/api/v1/ws/v2/interview/1",
  "first_question": { ... },
  "auto_submit_seconds": 45.0,
  "latency_ms": 230
}
```

---

### 4.8 Interview Results (`/results/[sessionId]`)

**API Call:**
```
GET /api/v1/workbench/interviews/sessions/{id}
→ includes transcripts with scores

POST /api/v1/workbench/interviews/sessions/{id}/summary   (if exists)
```

**For V2, also call:**
```
GET /api/v2/interview/{v2_session_id}/status
GET /api/v2/interview/{v2_session_id}/integrity
GET /api/v2/interview/{v2_session_id}/cheat-events
```

**Display:**
- Overall score (big number, color-coded: green ≥65, yellow 50-64, red <50)
- Pass/Fail badge
- Per-question breakdown (expandable accordion)
- Skill breakdown radar chart (technical, communication, problem-solving, etc.)
- For V2: Integrity score, flagged events, cheat alerts

**Score thresholds:**
- `≥ 65` → **Pass** → expert_status = "active" → Show "Open Workbench" CTA
- `50-64` → **Probation** → Can retake, limited access
- `< 50` → **Failed** → Must retake

---

### 4.9 History (`/history`)

```
GET /api/v1/workbench/interviews/sessions?page=1&page_size=12&status=all
```

Grid of session cards with: date, status badge, score (if completed), question count. Click → `/interview/{id}` or `/results/{id}`.

---

### 4.10 Profile (`/profile`)

**API calls:**
```
GET /api/v1/workbench/experts/me/profile
GET /api/v1/workbench/experts/me/score
GET /api/v1/workbench/experts/me/domains
GET /api/v1/workbench/experts/me/onboarding-status
```

**Show:** Avatar, tier badge, score with component breakdown, domain certifications, onboarding checklist, edit profile form.

---

### 4.11 Workbench — The Core

This is the **main productivity screen** where experts spend 90%+ of their time. It must be fast, keyboard-driven, and information-dense without being overwhelming.

---

## 5. Workbench Deep Dive

### 5.1 Gate Logic

**`WorkbenchGate` component** must check onboarding status and block access until `expert_status === "active"`.

```
GET /api/v1/workbench/experts/me/onboarding-status
```

**Gate screens by `current_step`:**

| `current_step` | Gate Screen |
|----------------|-------------|
| `not_registered` | "Register as an expert to access the workbench" → CTA to `/onboarding` |
| `registered` | "Upload your resume to continue" → CTA to `/onboarding` |
| `resume_uploaded` | "Complete your profile" → CTA to `/onboarding` |
| `profile_completed` | "Set your domain expertise" → CTA to `/onboarding` |
| `ready_for_interview` | "Complete the domain interview (15-25 min)" → CTA to `/interview/setup` |
| `interview_in_progress` | "Finish your interview in progress" → CTA to `/interview/{session_id}` |
| `interview_completed` (but not active) | "Your interview is under review. We'll notify you when you're approved." |
| `active` (**only this passes**) | → Render workbench content |

**IMPORTANT:** Admin and moderator roles bypass the gate (they can access workbench without interview).

### 5.2 Task Queue (Left Panel — 280px)

**Data source:**
```
GET /api/v1/workbench/my-tasks?page=1&page_size=50

Response: {
  "total": 12,
  "items": [
    {
      "allocation_id": 1,
      "failed_prompt_final_id": 42,
      "conversation_id": 789,
      "domain": "computer_science.ml_ai",
      "domain_display": "Machine Learning & AI",
      "failure_reason": "Model hallucinated a non-existent Python library",
      "batch_id": 12,
      "tier": 1,
      "status": "annotation_in_progress",
      "total_questions": 8,
      "my_responses": 3,
      "created_at": "2026-03-15T10:00:00Z"
    }
  ]
}
```

**Each task card must show:**

```
┌─────────────────────────────────┐
│ ◉ Machine Learning & AI   T1   │  ← Domain badge + Tier
│ Batch #12 · Conv #789          │  ← Identifiers
│                                 │
│ Model hallucinated a non-       │  ← Failure reason (2-line clamp)
│ existent Python library         │
│                                 │
│ ████████░░░ 3/8 questions       │  ← Progress bar
│                                 │
│ ● In Progress                   │  ← Status indicator
└─────────────────────────────────┘
```

**Sort order:** In-progress first, then pending, then submitted.

**Status colors:**
- `pending` → Gray dot
- `annotation_in_progress` → Orange dot (pulsing)
- `submitted` → Green dot
- `needs_revision` → Red dot

**On click:** `onSelectTask(allocation_id, prompt_data)` → Loads center + right panels.

**Refetch:** React Query with `staleTime: 30_000`, `refetchInterval: 60_000`.

### 5.3 Conversation Viewer (Center Panel)

**THIS IS THE CRITICAL FIX.** Currently shows placeholder text. Must render the full conversation.

**Data source:**
```
GET /api/v1/workbench/conversation/{conversation_id}/messages

Response: {
  "conversation_id": 789,
  "total_messages": 6,
  "messages": [
    {
      "id": 101,
      "role": "user",
      "content": "What are the best practices for training transformers?",
      "model": null,
      "provider": null,
      "turn_number": 0,
      "multi_model_index": null,
      "created_at": "2026-03-14T09:00:00Z"
    },
    {
      "id": 102,
      "role": "assistant",
      "content": "Here are the key best practices for training transformers...",
      "model": "gpt-4o",
      "provider": "openai",
      "turn_number": 0,
      "multi_model_index": 0,
      "created_at": "2026-03-14T09:00:05Z"
    },
    {
      "id": 103,
      "role": "assistant",
      "content": "Training transformers effectively requires...",
      "model": "claude-3.5-sonnet",
      "provider": "anthropic",
      "turn_number": 0,
      "multi_model_index": 1,
      "created_at": "2026-03-14T09:00:06Z"
    }
  ],
  "failed_model": "gpt-4o",
  "failed_provider": "openai",
  "failed_turn_number": 0
}
```

**Rendering rules:**

1. **Group by `turn_number`** — Each turn is a "row" in the conversation
2. **User messages** → Full-width bubble on the left, light background
3. **Single-model assistant** → Full-width bubble on the right
4. **Multi-model assistant (same turn_number, different multi_model_index)** → **Side-by-side columns**

**Multi-model layout:**
```
┌─ Turn 0 ────────────────────────────────────────────────┐
│  USER: "What are the best practices for transformers?"  │
├─────────────────────────┬───────────────────────────────┤
│  GPT-4o (OpenAI)        │  Claude 3.5 (Anthropic)       │
│  ⚠️ FAILED               │                               │
│                         │                               │
│  "Here are the key      │  "Training transformers       │
│  best practices..."     │  effectively requires..."     │
│                         │                               │
│  ~245 tokens            │  ~312 tokens                  │
└─────────────────────────┴───────────────────────────────┘
```

**Failed message highlighting:**
- Compare each assistant message's `model` + `provider` + `turn_number` against `failed_model` + `failed_provider` + `failed_turn_number`
- Failed message gets: red left border (3px), light red background, "FAILED" badge
- Non-failed model at same turn: normal styling (for comparison)

**Sticky original prompt:** Pin the first user message at the top of the scroll area so annotators always see what was asked.

**Markdown rendering:** Use `react-markdown` with `remark-gfm` for tables, code blocks, lists. Code blocks get syntax highlighting via `react-syntax-highlighter`.

**Error marking integration:** When the error marking overlay is active, allow text selection in assistant messages. Selected text gets highlighted and can be tagged with error type.

### 5.4 Rubric Panel (Right — Tab 1)

**Data source:**
```
GET /api/v1/workbench/conversation/{conversation_id}/rubric

Response: {
  "conversation_id": 789,
  "rubric": {
    "summary": "The model fabricated a Python library...",
    "severity": "major",           // critical, major, minor, negligible
    "confidence": 0.85,
    "failure_categories": ["hallucination", "factual_error"],
    "claims": [
      {
        "id": 1,
        "claim_text": "PyTorchFlow is a popular framework",
        "verdict": "contradicted",  // supported, contradicted, missing, misleading, insufficient
        "evidence": "No library named PyTorchFlow exists in PyPI...",
        "source": "reference_trace",
        "severity": "critical",
        "confidence": 0.95,
        "explanation": "The model invented a library name..."
      }
    ],
    "focus_areas": [
      "Verify all library names mentioned",
      "Check if code examples would actually compile"
    ],
    "annotator_instructions": "Pay special attention to factual claims about tools and frameworks."
  }
}
```

**UI:**
```
┌─ Rubric ──────────────────────────┐
│  Failure Summary                   │
│  "The model fabricated..."         │
│                                    │
│  Severity: [MAJOR]  Confidence: 85%│
│  Categories: [Hallucination]       │
│              [Factual Error]       │
│                                    │
│ ── Claims (3 analyzed) ──────────  │
│                                    │
│  ▼ Claim 1                         │
│  "PyTorchFlow is a popular..."     │
│  Verdict: [CONTRADICTED] 95%       │
│  Evidence: "No library named..."   │
│                                    │
│  ▶ Claim 2 (collapsed)             │
│  ▶ Claim 3 (collapsed)             │
│                                    │
│ ── Focus Areas ──────────────────  │
│  • Verify all library names        │
│  • Check code examples compile     │
│                                    │
│ ── Instructions ─────────────────  │
│  ℹ Pay special attention to...     │
└────────────────────────────────────┘
```

**Verdict color coding:**
- `supported` → Green badge
- `contradicted` → Red badge
- `missing` → Orange badge
- `misleading` → Purple badge
- `insufficient` → Gray badge

### 5.5 Questions Panel (Right — Tab 2)

**Data source:**
```
GET /api/v1/workbench/tasks/{fpf_id}/questions

Response: {
  "fpf_id": 42,
  "total_questions": 8,
  "questions": [
    {
      "id": 201,
      "question_text": "Is the AI response factually accurate?",
      "question_type": "boolean",     // boolean, rating, multiple_choice, text, numeric
      "options": null,
      "required": true,
      "order_index": 0,
      "category": "standard"
    },
    {
      "id": 202,
      "question_text": "Rate the overall quality of the response",
      "question_type": "rating",
      "options": { "min": 1, "max": 5, "labels": ["Poor", "Fair", "Good", "Very Good", "Excellent"] },
      "required": true,
      "order_index": 1,
      "category": "standard"
    },
    {
      "id": 203,
      "question_text": "Which category best describes the primary failure?",
      "question_type": "multiple_choice",
      "options": ["Hallucination", "Factual Error", "Logical Fallacy", "Incomplete", "Off-topic", "Other"],
      "required": true,
      "order_index": 2,
      "category": "standard"
    },
    {
      "id": 204,
      "question_text": "Does Claim 1 ('PyTorchFlow is popular') have evidence?",
      "question_type": "boolean",
      "options": null,
      "required": true,
      "order_index": 3,
      "category": "rubric_specific"
    },
    {
      "id": 205,
      "question_text": "Explain your reasoning for the factual accuracy rating",
      "question_type": "text",
      "options": null,
      "required": true,
      "order_index": 4,
      "category": "standard"
    }
  ],
  "my_progress": {
    "answered": 3,
    "total": 8
  }
}
```

**Input rendering by `question_type`:**

| Type | Component | Details |
|------|-----------|---------|
| `boolean` | Two buttons: `[Yes]` `[No]` | Highlight selected, deselect other |
| `rating` | 5 clickable stars or numbered buttons `[1] [2] [3] [4] [5]` | Show label below: "Poor", "Good", etc. |
| `multiple_choice` | Radio button group | One selection only |
| `text` | `<textarea rows={3}>` + word count + [AI Correct] button | Min 20 chars for required |
| `numeric` | `<input type="number">` | With min/max from options |

**Submit each answer individually:**
```
POST /api/v1/workbench/conversation/responses
Body: {
  "question_id": 201,
  "failed_prompt_final_id": 42,
  "response_value": "true",       // string: "true"/"false", "3", "Hallucination", or free text
  "response_type": "boolean"
}

Response: {
  "id": 301,
  "question_id": 201,
  "response_value": "true",
  "created_at": "2026-03-16T..."
}
```

**Progress indicator:** Show `3/8 answered` at top of panel. Green background on answered questions.

**AI Correct button (for text answers):**
```
POST /api/v1/workbench/conversation/responses/correct
Body: {
  "text": "the model halucinated a librarey",
  "mode": "clarity"
}

Response: {
  "corrected_text": "The model hallucinated a library name.",
  "changes": ["Fixed spelling: halucinated → hallucinated", "Fixed spelling: librarey → library"]
}
```

### 5.6 Submission Form (Right — Tab 3)

**Shown after all questions are answered.**

**Fields:**

| Field | Type | Validation | Purpose |
|-------|------|-----------|---------|
| Corrected Response | `<textarea rows={12}>` | Required, min 50 chars | The expert's corrected version of the AI response |
| Reasoning | `<textarea rows={5}>` | Required, min 20 chars | Why the correction was needed |
| Confidence | `<input type="range" min={0} max={100}>` | Required | Expert's confidence in their correction |

**Confidence slider colors:**
- 0-20: Red ("Very Low")
- 21-40: Orange ("Low")
- 41-60: Yellow ("Moderate")
- 61-80: Blue ("High")
- 81-100: Green ("Very High")

**Timer:** Start a timer when the task is first opened. Display as `HH:MM:SS`. Send with submission.

**Submit:**
```
POST /api/v1/workbench/submissions
Body: {
  "allocation_id": 1,
  "failed_prompt_final_id": 42,
  "corrected_response": "Here are the actual best practices...",
  "reasoning": "The original response fabricated PyTorchFlow...",
  "confidence_score": 85,
  "time_spent_seconds": 432
}

Response: {
  "id": 501,
  "allocation_id": 1,
  "status": "submitted",
  "created_at": "2026-03-16T..."
}
```

**Confirmation modal before submit:**
```
┌─────────────────────────────────────┐
│  Submit Annotation?                 │
│                                     │
│  Questions answered: 8/8 ✓          │
│  Corrected response: 245 words ✓    │
│  Reasoning: 52 words ✓              │
│  Confidence: 85% ✓                  │
│  Time spent: 7m 12s                 │
│                                     │
│  This action cannot be undone.      │
│                                     │
│  [Cancel]           [Submit →]      │
└─────────────────────────────────────┘
```

### 5.7 Error Marking Overlay

**Purpose:** Let experts highlight specific text spans in the AI response and tag them with error types.

**Trigger:** Button in the conversation viewer: `[Mark Errors]`

**When active:**
1. Text in assistant messages becomes selectable
2. On text selection, a popover appears:
```
┌─────────────────────────┐
│ Error Type:             │
│ ○ Hallucination         │
│ ○ Factual Error         │
│ ○ Logical Fallacy       │
│ ○ Incomplete            │
│ ○ Misleading            │
│ ○ Grammar/Style         │
│                         │
│ Severity: [Major ▾]    │
│ Note: [_____________]   │
│                         │
│ [Cancel]  [Mark Error]  │
└─────────────────────────┘
```

**API:**
```
POST /api/v1/workbench/conversation/error-marking
Body: {
  "conversation_id": 789,
  "failed_prompt_final_id": 42,
  "message_id": 102,
  "start_offset": 45,
  "end_offset": 78,
  "selected_text": "PyTorchFlow is a popular framework",
  "error_type": "hallucination",
  "severity": "major",
  "note": "This library does not exist"
}
```

**Display marked errors:** Highlighted spans in the conversation with colored underlines. Hover to see error details.

### 5.8 Reviews

**Pre-Annotation Review** — Senior experts validate that the failure is genuine before annotation begins.

```
GET /api/v1/workbench/my-reviews?status=pending
```

**Post-Annotation Review** — After annotation, a reviewer checks the expert's work.

```
GET /api/v1/workbench/my-post-reviews?status=pending
```

Both show as separate tab/section in the task queue with distinct badge counts.

### 5.9 Comments, Timeline, Golden Answers

**Comments** (collapsible section in right panel):
```
GET /api/v1/workbench/task-comments/{fpf_id}
POST /api/v1/workbench/task-comments  (to add)
```

**Status Timeline** (bottom of right panel):
```
GET /api/v1/workbench/conversation/{fpf_id}/status-timeline
```

**Golden Answers** (shown after all annotations are complete):
```
GET /api/v1/workbench/conversation/{conversation_id}/final-answers
```

---

## 6. Complete API Reference

### Auth (Public)

| Method | Path | Body | Purpose |
|--------|------|------|---------|
| POST | `/api/v1/auth/register` | `{email, full_name, password}` | Create account |
| POST | `/api/v1/auth/login` | `{email, password}` | Get tokens + role |
| POST | `/api/v1/auth/refresh` | `{refresh_token}` | Refresh access token |
| POST | `/api/v1/auth/logout` | `{refresh_token}` | Revoke refresh token |

### User Profile

| Method | Path | Body | Purpose |
|--------|------|------|---------|
| GET | `/api/v1/users/me` | — | Current user info |
| GET | `/api/v1/users/{id}` | — | User by ID |
| GET | `/api/v1/users/{id}/metadata` | — | Education, experience, resume |
| GET | `/api/v1/users/me/metadata` | — | Own metadata |
| GET | `/api/v1/users/me/profile-completion` | — | Missing fields check |
| POST | `/api/v1/users/me/resume/upload` | `file` (multipart) | Upload resume (PDF/DOCX/TXT) |
| PUT | `/api/v1/users/me/profile` | `{education_level, college, ...}` | Update profile metadata |
| GET | `/api/v1/users/me/accessible-pages` | — | Role-based page access |

### Expert Management

| Method | Path | Body | Purpose |
|--------|------|------|---------|
| POST | `/api/v1/workbench/experts/register` | `{user_id}` | Register as expert |
| GET | `/api/v1/workbench/experts/me/onboarding-status` | — | Onboarding checklist |
| GET | `/api/v1/workbench/experts/me/profile` | — | Expert profile |
| PUT | `/api/v1/workbench/experts/me/profile` | `{college, education, ...}` | Update profile |
| GET | `/api/v1/workbench/experts/me/domains` | — | Domain proficiencies |
| PUT | `/api/v1/workbench/experts/me/domains` | `{domain, proficiency_score}` | Set domain |
| GET | `/api/v1/workbench/experts/me/score` | — | Expert score + tier |
| GET | `/api/v1/workbench/domains` | — | Available domain tree |

### Interview V1

| Method | Path | Body | Purpose |
|--------|------|------|---------|
| POST | `/api/v1/workbench/interviews/sessions` | `{job_id?, expert_id?, ai_avatar_interview?, title?}` | Create session (job_id loads JD + custom prompts) |
| GET | `/api/v1/workbench/interviews/sessions` | `?page&page_size&status` | List sessions |
| GET | `/api/v1/workbench/interviews/sessions/{id}` | — | Session detail + transcripts |
| POST | `/api/v1/workbench/interviews/sessions/{id}/questions` | `?segment_type&difficulty&domain` | Generate question |
| POST | `/api/v1/workbench/interviews/sessions/{id}/answers` | `?transcript_id` Body: `{answer}` | Submit answer |
| POST | `/api/v1/workbench/interviews/sessions/{id}/complete` | — | Complete & score |
| GET | `/api/v1/workbench/interviews/sessions/{id}/summary` | — | Session summary |
| POST | `/api/v1/workbench/interviews/resume-summary` | `{resume_text}` | Generate resume summary |

### Jobs (Expert-Facing)

| Method | Path | Body | Purpose |
|--------|------|------|---------|
| GET | `/api/v1/workbench/interviews/jobs` | `?job_type&domain_id&is_active` | List available jobs |
| GET | `/api/v1/workbench/interviews/jobs/{job_id}` | — | Job detail (JD, requirements, skills) |

### Interview V2 (Video)

| Method | Path | Body | Purpose |
|--------|------|------|---------|
| POST | `/api/v2/interview/start` | `{job_id?, resume_text?, job_description?, ...}` | Start V2 session (job_id auto-loads JD) |
| POST | `/api/v2/interview/{id}/answer` | `{transcript_id}` | Submit streamed answer |
| POST | `/api/v2/interview/{id}/complete` | — | Complete with integrity |
| GET | `/api/v2/interview/{id}/status` | — | V1+V2 combined status |
| GET | `/api/v2/interview/{id}/transcript` | — | Streaming transcript |
| GET | `/api/v2/interview/{id}/cheat-events` | — | Cheat detection events |
| GET | `/api/v2/interview/{id}/integrity` | — | Integrity score |
| WS | `/api/v1/ws/v2/interview/{id}` | — | Real-time WebSocket |

### Workbench — Tasks & Annotation

| Method | Path | Body | Purpose |
|--------|------|------|---------|
| GET | `/api/v1/workbench/my-tasks` | `?status&batch_id&page&page_size` | Expert's task queue |
| GET | `/api/v1/workbench/conversation/{id}/messages` | — | Conversation messages |
| GET | `/api/v1/workbench/conversation/{id}/rubric` | — | Rubric + claims |
| GET | `/api/v1/workbench/tasks/{fpf_id}/questions` | — | Annotation questions |
| POST | `/api/v1/workbench/conversation/responses` | `{question_id, fpf_id, response_value, response_type}` | Submit question answer |
| PUT | `/api/v1/workbench/conversation/responses/{id}` | `{response_value}` | Edit answer |
| POST | `/api/v1/workbench/conversation/responses/correct` | `{text, mode}` | AI text correction |
| POST | `/api/v1/workbench/submissions` | `{allocation_id, fpf_id, corrected_response, reasoning, confidence_score, time_spent_seconds}` | Submit annotation |
| POST | `/api/v1/workbench/conversation/error-marking` | `{conversation_id, fpf_id, message_id, start_offset, end_offset, error_type, severity}` | Mark error span |
| GET | `/api/v1/workbench/conversation/{id}/error-markings` | — | Get error markings |
| POST | `/api/v1/workbench/conversation/{id}/generate-questions` | — | Auto-generate questions |

### Workbench — Reviews

| Method | Path | Body | Purpose |
|--------|------|------|---------|
| GET | `/api/v1/workbench/my-reviews` | `?status` | Pre-annotation review list |
| POST | `/api/v1/workbench/conversation/{fpf_id}/pre-review/start` | — | Start pre-review |
| POST | `/api/v1/workbench/conversation/{fpf_id}/pre-review/complete` | `{is_genuine_failure, reason?}` | Complete pre-review |
| GET | `/api/v1/workbench/my-post-reviews` | `?status` | Post-annotation review list |
| POST | `/api/v1/workbench/conversation/{fpf_id}/post-review/start` | — | Start post-review |
| POST | `/api/v1/workbench/conversation/{fpf_id}/post-review/complete` | `{approved, reason?}` | Complete post-review |

### Workbench — Extras

| Method | Path | Body | Purpose |
|--------|------|------|---------|
| GET | `/api/v1/workbench/conversation/{fpf_id}/verdict` | — | QC verdict |
| POST | `/api/v1/workbench/conversation/{fpf_id}/resolve-human-review` | `{decision, reason?}` | Resolve |
| POST | `/api/v1/workbench/conversation/skip` | `{conversation_id, reason?}` | Skip task |
| POST | `/api/v1/workbench/conversation/qc/run-question/{qid}` | — | Run QC on question |
| GET | `/api/v1/workbench/conversation/{fpf_id}/weighted-iaa` | — | IAA scores |
| POST | `/api/v1/workbench/conversation/{fpf_id}/record-completion` | — | Mark task complete |
| GET | `/api/v1/workbench/task-comments/{fpf_id}` | — | Get comments |
| POST | `/api/v1/workbench/task-comments` | `{fpf_id, comment_type, comment_text}` | Add comment |
| GET | `/api/v1/workbench/conversation/{fpf_id}/status-timeline` | — | Status history |
| GET | `/api/v1/workbench/conversation/{id}/final-answers` | — | Golden answers |

### Wallet & Payments

| Method | Path | Body | Purpose |
|--------|------|------|---------|
| GET | `/api/v1/chat/wallet/balance` | — | Wallet balance |
| GET | `/api/v1/chat/wallet/transactions` | `?page&page_size` | Transaction history |
| POST | `/api/v1/chat/wallet/withdraw/razorpay` | `{amount, bank_details}` | Request payout |

### Subscriptions

| Method | Path | Body | Purpose |
|--------|------|------|---------|
| GET | `/api/v1/chat/subscriptions/my-subscriptions` | — | Current plan |
| GET | `/api/v1/chat/subscriptions/my-usage` | — | Usage stats |

---

## 7. Service Layer Integration

### Fix: `orchestrator-service.ts` URL Mapping

The current service calls `/orchestrator/...` but the backend doesn't have that prefix. Fix the URLs:

| Current (Wrong) | Correct |
|-----------------|---------|
| `/orchestrator/start` | `/workbench/interviews/sessions` (POST to create) then `/workbench/interviews/sessions/{id}/questions` (POST for first question) |
| `/orchestrator/{id}/answer` | `/workbench/interviews/sessions/{id}/answers?transcript_id={tid}` |
| `/orchestrator/{id}/complete` | `/workbench/interviews/sessions/{id}/complete` |
| `/orchestrator/{id}/status` | `/workbench/interviews/sessions/{id}` |

### Fix: `experts-service.ts` URL Mapping

Some URLs use `/experts/...` but should be `/workbench/experts/...`:

| Current (Wrong) | Correct |
|-----------------|---------|
| `/experts/register` | `/workbench/experts/register` |
| `/experts/{id}` | `/workbench/experts/{id}` |
| `/experts/{id}/tier` | `/workbench/experts/{id}/tier` |
| `/experts/{id}/certifications` | `/workbench/experts/{id}/certifications` |

The `me` endpoints are already correct (`/workbench/experts/me/...`).

### New: `job-service.ts`

Create a new service for job-related API calls:

```typescript
// services/job-service.ts
import { apiClient } from '@/lib/api-client';

export interface WorkbenchJob {
  id: number;
  title: string;
  slug: string;
  domain_id: number | null;
  domain_name: string | null;
  description: string;
  responsibilities: string[] | null;
  requirements: string[] | null;
  preferred_skills: string[] | null;
  experience_level: string | null;
  job_type: string;
  interview_type: string;
  interview_duration_minutes: number;
  min_questions: number;
  difficulty: string;
  seniority: string;
  is_active: boolean;
  created_at: string;
}

export const jobService = {
  // List available jobs for experts
  listJobs: (params?: { job_type?: string; domain_id?: number; is_active?: boolean }) =>
    apiClient.get<{ total: number; items: WorkbenchJob[] }>(
      '/workbench/interviews/jobs',
      { params }
    ),

  // Get job detail
  getJob: (jobId: number) =>
    apiClient.get<WorkbenchJob>(`/workbench/interviews/jobs/${jobId}`),
};
```

### Update: `orchestrator-service.ts` — Session Creation

Update the session creation call to pass `job_id`:

```typescript
// Before (old)
createSession: (expertId?: number) =>
  apiClient.post('/workbench/interviews/sessions', { expert_id: expertId }),

// After (new)
createSession: (params?: { job_id?: number; expert_id?: number; title?: string }) =>
  apiClient.post('/workbench/interviews/sessions', params ?? {}),
```

---

## 8. State Management

### Workbench Store (Create — currently missing)

```typescript
// stores/workbench-store.ts
import { create } from 'zustand';

interface WorkbenchState {
  // Selection
  selectedAllocationId: number | null;
  selectedFpfId: number | null;
  selectedConversationId: number | null;
  selectedPrompt: TaskPrompt | null;

  // Error marking mode
  errorMarkingActive: boolean;
  errorMarkings: ErrorMarking[];

  // Timer
  taskStartTime: number | null;
  timeSpentSeconds: number;

  // Right panel tab
  activeRightTab: 'rubric' | 'questions' | 'submission' | 'comments';

  // Actions
  selectTask: (allocationId: number, prompt: TaskPrompt) => void;
  clearSelection: () => void;
  toggleErrorMarking: () => void;
  startTimer: () => void;
  setActiveTab: (tab: string) => void;
}
```

### React Query Keys (Consistency)

```typescript
export const workbenchKeys = {
  tasks: ['workbench', 'tasks'] as const,
  conversation: (id: number) => ['workbench', 'conversation', id] as const,
  rubric: (id: number) => ['workbench', 'rubric', id] as const,
  questions: (fpfId: number) => ['workbench', 'questions', fpfId] as const,
  comments: (fpfId: number) => ['workbench', 'comments', fpfId] as const,
  timeline: (fpfId: number) => ['workbench', 'timeline', fpfId] as const,
  reviews: (type: string) => ['workbench', 'reviews', type] as const,
};

export const jobKeys = {
  all: ['jobs'] as const,
  list: (filters?: Record<string, unknown>) => ['jobs', 'list', filters] as const,
  detail: (id: number) => ['jobs', 'detail', id] as const,
};
```

---

## 9. Design System & UI Specifications

### Color Palette (from `tokens.css`)

| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg-base` | `#f5f2ec` | Page background |
| `--color-bg-surface` | `#ede9e0` | Card backgrounds |
| `--color-bg-muted` | `#e4dfd3` | Subtle sections |
| `--color-bg-inverse` | `#0d0d0d` | Dark backgrounds |
| `--color-signal` | `#d4440c` | Primary CTA, accent |
| `--color-success` | `#2d7a4e` | Pass, supported, done |
| `--color-error` | `#c0392b` | Fail, contradicted, error |
| `--color-warning` | `#8a6a00` | Caution, pending |
| `--color-info` | `#185fa5` | Info, links |

### Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| Page title | `--font-display` (Instrument Serif) | `--text-2xl` (32px) | 400 |
| Section header | `--font-display` | `--text-xl` (24px) | 400 |
| Body text | `--font-body` (system-ui) | `--text-base` (15px) | 400 |
| Labels/badges | `--font-mono` (DM Mono) | `--text-xs` (12px) | 400, uppercase, letter-spacing: wider |
| Code blocks | `--font-mono` | `--text-sm` (13px) | 400 |

### Component Patterns

**Card:**
```css
background: var(--color-bg-surface);
border: 1px solid var(--color-border);
border-radius: var(--radius-md);    /* 6px */
padding: var(--space-4);             /* 16px */
box-shadow: var(--shadow-sm);
```

**Badge (domain/status):**
```css
font-family: var(--font-mono);
font-size: var(--text-xs);
letter-spacing: var(--tracking-wider);
text-transform: uppercase;
padding: 2px 8px;
border-radius: var(--radius-sm);     /* 3px */
```

**Button (primary):**
```css
background: var(--color-signal);     /* burnt orange */
color: var(--color-text-inverse);    /* white-ish */
font-family: var(--font-mono);
font-size: var(--text-sm);
letter-spacing: var(--tracking-wide);
padding: var(--space-2) var(--space-5);
border-radius: var(--radius-md);
border: none;
cursor: pointer;
transition: background 0.15s;
&:hover { background: var(--color-signal-hover); }
```

### Workbench-Specific UI Decisions

**Three-panel widths:**
- Left (task queue): 280px collapsed/expanded
- Center (conversation): flex: 1 (fills remaining)
- Right (rubric/questions): 380px collapsed/expanded

**Right panel tabs:**
```
[ Rubric ] [ Questions (3/8) ] [ Submit ] [ Comments (2) ]
```
- Active tab: bottom border in `--color-signal`, text in `--color-text-primary`
- Inactive: no border, text in `--color-text-muted`
- Questions tab shows progress badge
- Comments tab shows count badge

**Empty states:** Every panel must have a helpful empty state with icon + description + CTA. Never show a blank white area.

**Loading states:** Skeleton loaders (pulsing `--color-bg-muted` rectangles), NOT spinners. Spinners only for button actions.

---

## 10. Keyboard Shortcuts

| Key | Action | Context |
|-----|--------|---------|
| `[` | Toggle left panel (task queue) | Global |
| `]` | Toggle right panel (rubric/questions) | Global |
| `Ctrl+Enter` | Submit current answer / annotation | Questions panel, Submission form |
| `Ctrl+S` | Save draft (auto-saves, but reassuring) | Workbench |
| `↑` / `↓` | Navigate task queue | When left panel focused |
| `Enter` | Select highlighted task | Task queue |
| `1-5` | Quick-answer rating questions | Questions panel, when rating focused |
| `Y` / `N` | Quick-answer boolean questions | Questions panel, when boolean focused |
| `E` | Toggle error marking mode | Conversation viewer |
| `Escape` | Exit error marking / close modal | Global |
| `Tab` | Move to next question | Questions panel |

---

## 11. Error Handling

### API Errors

| HTTP Code | Meaning | Frontend Handling |
|-----------|---------|------------------|
| 401 | Token expired | Auto-refresh via `/auth/refresh`. If refresh fails → redirect to `/login` |
| 403 | Forbidden (wrong role) | Show "Access denied" banner. Don't redirect. |
| 404 | Resource not found | Show "Task not found" in the relevant panel |
| 409 | Conflict (duplicate) | Show toast: "Already submitted" |
| 422 | Validation error | Show inline field errors from `details[].loc` + `details[].msg` |
| 429 | Rate limited | Show toast: "Too many requests, please wait" |
| 500 | Server error | Show toast: "Something went wrong. Try again." + Retry button |
| 503 | Service unavailable | Show banner: "API is temporarily unavailable" |

### Network Errors

- Timeout (>30s): Show retry button
- Offline: Show persistent banner "You're offline" with `navigator.onLine`
- WebSocket disconnect: Auto-reconnect with exponential backoff (1s, 2s, 4s, 8s, max 30s)

### Edge Cases

| Scenario | Handling |
|----------|---------|
| Expert opens workbench but has no tasks | Show: "No tasks assigned yet. Check back soon." |
| Expert opens a task that was reassigned | 403/404 → Remove from local task list, show toast |
| Multiple browser tabs | React Query handles cache sync. Warn on submission conflicts. |
| Very long AI response (10k+ chars) | Virtualized scrolling in conversation viewer |
| Multi-model with 4+ models | Horizontal scroll in model comparison grid |
| Resume upload fails | Show error, allow retry. Don't advance onboarding step. |
| Interview WebSocket drops | Show reconnection overlay with countdown |

---

## 12. Implementation Priority Order

### Phase 1: Fix What's Broken (Day 1-2)

1. **Wire existing components** into `workbench/page.tsx`:
   - Import `ConversationView`, pass `conversationId`
   - Import `RubricPanel`, pass `conversationId`
   - Import `QuestionsPanel`, pass `fpfId`
   - Import `SubmissionForm`, pass `allocationId` + `fpfId`
   - Add right panel tabs (Rubric | Questions | Submit | Comments)

2. **Fix service URLs:**
   - `orchestrator-service.ts` → correct interview endpoint paths
   - `experts-service.ts` → add `/workbench/` prefix to expert endpoints

3. **Fix onboarding flow:**
   - Ensure resume upload → auto-register → profile → domains → job browser → interview works end-to-end
   - Test each step's API call against `api.raweval.com`

### Phase 2: Complete Flows (Day 3-5)

4. **Build register page** (`/register`) if missing
5. **Build Job Browser page** (`/jobs`):
   - List available jobs from `GET /workbench/interviews/jobs`
   - Job detail view with requirements, responsibilities, preferred skills
   - "Start Interview" button that navigates to `/interview/setup?job_id={id}`
   - Domain and experience level filters
6. **Wire interview flow:**
   - Setup reads `job_id` from URL params, pre-fills fields from job
   - Session creation passes `job_id` — resume auto-pulled, JD loaded from job
   - Setup → create session → question loop → complete → results
   - Test V1 text interview end-to-end
7. **Dashboard with real data:**
   - Replace hardcoded cards with actual onboarding status + task preview
8. **Error marking overlay** integration in conversation viewer
9. **Reviews tab** (pre/post annotation) in task queue

### Phase 3: Polish (Day 6-8)

10. **Keyboard shortcuts** working across all panels
11. **Loading/empty/error states** for every panel
12. **Timer** for annotation tracking
13. **Confirmation modals** before destructive actions
14. **Toast notifications** for success/error feedback
15. **Comments panel** integration
16. **Status timeline** at bottom of right panel

### Phase 4: Advanced (Day 9-10)

17. **V2 video interview** with WebSocket + WebRTC
18. **Profile page** with score breakdown + radar chart
19. **Wallet integration** for payouts
20. **Golden answers** view (post-completion reference)
21. **Performance optimization:** virtualized lists, code splitting, lazy loading right panel tabs

---

## Appendix A: Workbench Page.tsx — Target Code Structure

```tsx
// app/workbench/page.tsx — What this should look like after Phase 1

'use client';
import { useState } from 'react';
import { WorkbenchGate } from '@/features/workbench/components/workbench-gate';
import { WorkbenchLayout } from '@/features/workbench/components/workbench-layout';
import { TaskQueue } from '@/features/workbench/components/task-queue';
import { ConversationView } from '@/features/workbench/components/conversation-view';
import { RubricPanel } from '@/features/workbench/components/rubric-panel';
import { QuestionsPanel } from '@/features/workbench/components/questions-panel';
import { SubmissionForm } from '@/features/workbench/components/submission-form';
import { CommentsPanel } from '@/features/workbench/components/comments-panel';
import { StatusTimeline } from '@/features/workbench/components/status-timeline';
import { ErrorBoundary } from '@/components/error-boundary';
import type { TaskPrompt } from '@/features/workbench/types';

export default function WorkbenchPage() {
  return (
    <ErrorBoundary fallbackMessage="The workbench encountered an error">
      <WorkbenchGate>
        <WorkbenchContent />
      </WorkbenchGate>
    </ErrorBoundary>
  );
}

function WorkbenchContent() {
  const [selectedAllocationId, setSelectedAllocationId] = useState<number | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<TaskPrompt | null>(null);
  const [activeTab, setActiveTab] = useState<'rubric' | 'questions' | 'submission' | 'comments'>('rubric');
  const [errorMarkingActive, setErrorMarkingActive] = useState(false);

  const handleSelectTask = (allocationId: number, prompt: TaskPrompt) => {
    setSelectedAllocationId(allocationId);
    setSelectedPrompt(prompt);
    setActiveTab('rubric'); // Reset to rubric on new task
    setErrorMarkingActive(false);
  };

  const conversationId = selectedPrompt?.conversation_id ?? null;
  const fpfId = selectedPrompt?.failed_prompt_final_id ?? null;

  return (
    <WorkbenchLayout
      sidebar={
        <TaskQueue
          onSelectTask={handleSelectTask}
          selectedPromptId={fpfId}
        />
      }
      main={
        conversationId ? (
          <ConversationView
            conversationId={conversationId}
            failedModel={selectedPrompt?.failed_model}
            failedProvider={selectedPrompt?.failed_provider}
            failedTurnNumber={selectedPrompt?.failed_turn_number}
            errorMarkingActive={errorMarkingActive}
            onToggleErrorMarking={() => setErrorMarkingActive(!errorMarkingActive)}
          />
        ) : (
          <EmptyMainState />
        )
      }
      rightPanel={
        fpfId ? (
          <RightPanel
            conversationId={conversationId!}
            fpfId={fpfId}
            allocationId={selectedAllocationId!}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        ) : (
          <EmptyRightPanelState />
        )
      }
    />
  );
}

function RightPanel({ conversationId, fpfId, allocationId, activeTab, onTabChange }) {
  const tabs = ['rubric', 'questions', 'submission', 'comments'] as const;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Tab bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)' }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            style={{
              flex: 1, padding: '8px', textAlign: 'center',
              borderBottom: activeTab === tab ? '2px solid var(--color-signal)' : 'none',
              color: activeTab === tab ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
              fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)',
              textTransform: 'uppercase', letterSpacing: '0.05em',
              background: 'transparent', border: 'none', cursor: 'pointer',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {activeTab === 'rubric' && <RubricPanel conversationId={conversationId} />}
        {activeTab === 'questions' && <QuestionsPanel fpfId={fpfId} />}
        {activeTab === 'submission' && (
          <SubmissionForm allocationId={allocationId} fpfId={fpfId} />
        )}
        {activeTab === 'comments' && <CommentsPanel fpfId={fpfId} />}
      </div>

      {/* Status timeline (always visible at bottom) */}
      <StatusTimeline fpfId={fpfId} />
    </div>
  );
}
```

---

## Appendix B: Environment Variables

```bash
# apps/experts/.env.local
NEXT_PUBLIC_API_URL=https://api.raweval.com
NEXT_PUBLIC_API_VERSION=v1
NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_API_RETRIES=3
NEXT_PUBLIC_API_RETRY_DELAY=1000
NEXT_PUBLIC_WS_URL=wss://api.raweval.com
```

For local development with local backend:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

---

## Appendix C: Backend Goal ↔ Frontend Alignment

### How the Backend is Designed and How the Frontend Helps

The backend is built around a **multi-stage quality pipeline**:

```
Stage 0: User marks AI response as failed
Stage 1: Auto-detect domain
Stage 2: Generate rubric (FActScore-style claim decomposition)
Stage 3: Semantic entropy analysis
Stage 4: Judge panel evaluation
Stage 5: Verdict aggregation
Stage 6: Batch & allocate to human experts
Stage 7: Human annotation (THIS IS WHERE THE WORKBENCH LIVES)
Stage 8: IAA computation
Stage 9: Final verdict + payout
```

**The workbench is Stage 7** — the human-in-the-loop quality gate. The frontend's job is to:

1. **Present the AI's analysis clearly** (rubric, claims, evidence) so experts don't start from scratch
2. **Collect structured data** (not free-form essays) — boolean, rating, multiple-choice, targeted text
3. **Enable fast throughput** — keyboard shortcuts, auto-save, auto-advance, AI correction
4. **Maintain quality** — confidence scores, time tracking, error marking for auditability
5. **Support the review loop** — pre-review validates failures are genuine, post-review validates expert work
6. **Feed the scoring engine** — expert responses flow into IAA computation, which feeds ExpertScore, which determines tier, which determines allocation priority

**The frontend is not just a form — it's a precision instrument for human evaluation.** Every UI decision should optimize for:
- **Accuracy** — experts see all context needed to make correct judgments
- **Speed** — minimal clicks, keyboard-first, no unnecessary navigation
- **Consistency** — structured inputs reduce variance between annotators
- **Auditability** — every action is timestamped and traceable

### What "State of the Art" Means Here

The best annotation tools (Label Studio, Prodigy, Scale AI Remotasks, Surge AI) share these patterns:

1. **Single-screen workflow** — never navigate away mid-task
2. **Context + action side by side** — see conversation while answering questions
3. **Progressive disclosure** — show rubric summary first, expand claims on demand
4. **Keyboard-first** — power users complete tasks 3x faster with shortcuts
5. **Real-time validation** — don't let experts submit incomplete work
6. **Gamification** — progress bars, streak counts, quality scores visible
7. **Dark mode** — annotation fatigue is real, eye strain matters
8. **Batch navigation** — quick switching between tasks without page reloads

The three-panel layout already follows this. The gap is **wiring it up and polishing the details.**

---

## 13. Admin — Workbench Jobs, Prompts & Interview Management

> This section documents the admin-side endpoints for managing jobs, interview prompt templates, and viewing interview sessions. These are consumed by the **Admin Dashboard** frontend (`apps/admin`), not the experts app — but documented here for completeness since they power the expert interview experience.

### 13.1 Workbench Job CRUD

All endpoints require admin authentication. Prefix: `/api/v1/admin`.

| Method | Path | Body / Params | Purpose |
|--------|------|---------------|---------|
| POST | `/workbench-jobs` | `{title, description, domain_id?, responsibilities?, requirements?, preferred_skills?, experience_level?, job_type?, interview_type?, interview_duration_minutes?, min_questions?, difficulty?, seniority?}` | Create a new job |
| GET | `/workbench-jobs` | `?job_type&domain_id&is_active&page&page_size` | List all jobs (paginated) |
| GET | `/workbench-jobs/{id}` | — | Get job detail |
| PUT | `/workbench-jobs/{id}` | Same fields as POST (all optional) | Update job |
| DELETE | `/workbench-jobs/{id}` | — | Soft-delete (sets `is_active=false`) |

**Create job example:**
```json
POST /api/v1/admin/workbench-jobs
{
  "title": "Senior ML Engineer",
  "description": "Evaluate ML model outputs for accuracy and completeness...",
  "domain_id": 2,
  "responsibilities": ["Design ML evaluation rubrics", "Review model outputs"],
  "requirements": ["5+ years Python", "Experience with PyTorch"],
  "preferred_skills": ["Kubernetes", "MLflow"],
  "experience_level": "senior",
  "job_type": "expert_onboarding",
  "interview_type": "data_science",
  "interview_duration_minutes": 30,
  "min_questions": 12,
  "difficulty": "medium",
  "seniority": "senior"
}

Response: {
  "status": "success",
  "item": {
    "id": 1,
    "title": "Senior ML Engineer",
    "slug": "senior-ml-engineer",
    ...all fields...
  }
}
```

**Notes:**
- `slug` is auto-generated from `title` (lowercase, hyphenated, deduped with numeric suffix)
- `job_type` options: `expert_onboarding` (for expert signup interviews), `workbench` (for task-specific), `internal` (admin use)
- Deleting a job soft-deletes it (`is_active=false`). Existing interview sessions that reference the job are unaffected.

### 13.2 Interview Prompt Template CRUD

Prompt templates control the system prompts used during each interview segment. They follow a priority chain: **job-specific > global default > hardcoded fallback**.

| Method | Path | Body / Params | Purpose |
|--------|------|---------------|---------|
| POST | `/workbench-jobs/{id}/prompts` | `{segment_type, system_prompt, user_prompt_template?, model_override?, temperature?}` | Create prompt for a specific job |
| GET | `/workbench-jobs/{id}/prompts` | — | List prompts for a job |
| PUT | `/prompt-templates/{id}` | Same fields as POST (all optional) | Update prompt (auto-versions) |
| DELETE | `/prompt-templates/{id}` | — | Delete prompt template |
| GET | `/prompt-templates/defaults` | — | List global default prompts (job_id=NULL) |
| POST | `/prompt-templates/defaults` | `{segment_type, system_prompt, ...}` | Create/update global default prompt |

**Segment types:** `conversation`, `technical`, `coding`, `behavioral`

**Create job-specific prompt example:**
```json
POST /api/v1/admin/workbench-jobs/1/prompts
{
  "segment_type": "technical",
  "system_prompt": "You are an expert ML interviewer. Focus on PyTorch internals, distributed training, and model optimization. Ask questions that test practical experience, not textbook knowledge.",
  "model_override": "gpt-4o",
  "temperature": 0.7
}

Response: {
  "status": "success",
  "item": {
    "id": 5,
    "job_id": 1,
    "segment_type": "technical",
    "system_prompt": "You are an expert ML interviewer...",
    "model_override": "gpt-4o",
    "temperature": 0.7,
    "is_active": true,
    "version": 1,
    "created_at": "2026-03-16T..."
  }
}
```

**Prompt priority chain (how the backend resolves prompts):**
1. Look for `InterviewPromptTemplate` where `job_id = X` AND `segment_type = Y` AND `is_active = true` (latest version)
2. If not found: look for global default where `job_id = NULL` AND `segment_type = Y` AND `is_active = true`
3. If not found: use hardcoded fallback prompt

**Auto-versioning:** When you `PUT` an existing prompt, the backend auto-increments the `version` and deactivates the previous version. This gives you a history of prompt changes.

**Global defaults** are seeded on first startup with sensible prompts for all 4 segment types. Admins can override them via `POST /prompt-templates/defaults`.

### 13.3 Admin Interview Visibility

Admins can browse all interview sessions, view full transcripts, and filter by job/expert/status.

| Method | Path | Params | Purpose |
|--------|------|--------|---------|
| GET | `/job-interviews` | `?job_id&expert_id&status&page&page_size` | List all interview sessions |
| GET | `/job-interviews/{session_id}` | — | Full session detail (config, scores, transcript) |
| GET | `/job-interviews/{session_id}/transcript` | — | Full Q&A transcript |
| GET | `/experts/{expert_id}/interviews` | `?page&page_size` | All interviews for a specific expert |

**List interviews example:**
```
GET /api/v1/admin/job-interviews?job_id=1&status=completed&page=1&page_size=20

Response: {
  "total": 45,
  "page": 1,
  "page_size": 20,
  "items": [
    {
      "session_id": 4,
      "expert_id": 2,
      "expert_name": "Jane Smith",
      "job_id": 1,
      "job_title": "Senior ML Engineer",
      "status": "completed",
      "overall_score": 78.5,
      "total_questions": 12,
      "created_at": "2026-03-15T10:00:00Z",
      "completed_at": "2026-03-15T10:32:00Z"
    },
    ...
  ]
}
```

**Session detail example:**
```
GET /api/v1/admin/job-interviews/4

Response: {
  "session_id": 4,
  "expert_id": 2,
  "expert_name": "Jane Smith",
  "job_id": 1,
  "job_title": "Senior ML Engineer",
  "job_description_text": "Evaluate ML model outputs...",
  "status": "completed",
  "overall_score": 78.5,
  "interview_type": "data_science",
  "seniority": "senior",
  "difficulty": "medium",
  "total_questions": 12,
  "created_at": "...",
  "completed_at": "...",
  "transcripts": [
    {
      "id": 101,
      "question": "Explain the difference between batch norm and layer norm...",
      "answer": "Batch normalization normalizes across the batch dimension...",
      "segment_type": "technical",
      "difficulty": "medium",
      "score": 82.0,
      "evaluation": { "rubric": {...}, "strengths": [...], "improvements": [...] }
    },
    ...
  ],
  "skill_scores": {
    "technical": 80, "communication": 75, "problem_solving": 78
  }
}
```

### 13.4 How It All Connects

```
Admin creates WorkbenchJob ──────────────────────────────┐
Admin creates InterviewPromptTemplates for that job ─────┤
                                                         │
Expert browses jobs (GET /interviews/jobs) ───────────────┤
Expert picks a job ──────────────────────────────────────┤
Expert starts interview (POST /interviews/sessions       │
  with job_id) ──────────────────────────────────────────┤
                                                         │
Backend:                                                 │
  1. Loads WorkbenchJob → stores JD on session           │
  2. Loads resume from UserMetadata (auto-pulled)        │
  3. For each question: resolves prompt template          │
     (job-specific > global > hardcoded)                 │
  4. Generates question with custom prompt + JD context  │
  5. Stores workbench_job_id on InterviewSession         │
                                                         │
Admin views results (GET /job-interviews?job_id=X) ──────┘
```

### 13.5 Resume Flow Summary

The resume flow is now fully automated:

1. **Upload:** Expert uploads PDF/DOCX/TXT via `POST /users/me/resume/upload`
   - Backend uses PyPDF2 for text extraction
   - Falls back to `pdfplumber` if PyPDF2 extracts < 50 chars (handles multi-column, table-heavy layouts)
   - Extracted text stored in `UserMetadata.professional_background`
   - File stored in S3
2. **Auto-pull at interview start:** When creating a session, the backend reads `professional_background` from DB — no manual text input needed
3. **No `resume_text` param needed:** The `CreateSessionRequest` no longer requires `resume_text`. The backend handles it internally.
4. **Resume summary:** `POST /interviews/resume-summary` still available for generating a concise summary from the stored resume text
