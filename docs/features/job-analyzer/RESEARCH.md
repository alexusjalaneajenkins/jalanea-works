# Job Analyzer Feature - Research Document

**Feature:** Pre-Pocket Job Analyzer
**Created:** 2026-01-21
**Status:** Research Complete

---

## Problem Statement

Job seekers waste time applying to jobs that aren't a good fit because:
1. They don't know if they're qualified until after investing time
2. The current flow generates pockets AFTER mental commitment
3. No quick feedback loop before the decision point

**Current Pain Point:**
```
User sees job → Clicks "Pocket & Apply" → Waits for generation →
Sees they don't fit → Time wasted, feels guilty
```

---

## User Needs

1. **Know before investing:** "Is this job worth my time?"
2. **Quick feedback:** Get answer in seconds, not minutes
3. **Actionable guidance:** "What can I do to become a better fit?"
4. **Safety assurance:** "Is this job legitimate?"

---

## Current State Analysis

### Existing Infrastructure

| Component | Location | Status |
|-----------|----------|--------|
| **Scam Shield** | `/src/lib/scam-shield.ts` | ✅ Complete - 24 rules, 4 severity levels |
| **Match Score** | Jobs page inline | ⚠️ Currently random (70-90%) |
| **Pocket Generation** | `/src/app/api/job-pockets/generate/route.ts` | ✅ Complete |
| **Job Data** | `/src/app/api/jobs/search/route.ts` | ✅ Has requirements, description |

### Current User Flow (Jobs Page)

1. User lands on `/dashboard/jobs`
2. Job cards display with random match score (70-90%)
3. User clicks "Pocket & Apply" button
4. Modal opens IMMEDIATELY with loading animation
5. Mock pocket data generated + API call
6. User sees full pocket (Overview, Prep, Strategy tabs)
7. User decides to apply or not

**Gap:** No checkpoint between "click" and "generate" to help user decide.

### Scam Shield Details

Already implemented in `/src/lib/scam-shield.ts`:
- **CRITICAL:** Upfront payment, check cashing, crypto, MLM, SSN requests
- **HIGH:** Vague description, no company, unrealistic salary, work-from-home emphasis
- **MEDIUM:** Personal email, PO box, urgency language, commission-only
- Returns: `severity`, `flags[]`, `score`

### Job Data Available

From job search API, each job has:
```typescript
{
  title: string
  company: string
  description: string
  requirements: string | string[]
  salary_min?: number
  salary_max?: number
  employment_type: string
  location_address: string
  scam_severity: string
  scam_flags: string[]
}
```

### User Profile Data Available

From `/profiles` and `/resumes` tables:
```typescript
{
  first_name: string
  last_name: string
  skills: string[]           // From resume parsing
  experience_years?: number
  education?: string
  location?: string
}
```

---

## Technical Approach

### Analysis Pipeline

```
Job Data + User Profile
         ↓
┌─────────────────────────────────────┐
│ 1. Scam Shield Check (existing)     │ → Safety status
│ 2. Qualification Matching (NEW)     │ → Match %, missing skills
│ 3. Quick Win Generator (NEW)        │ → Actionable suggestion
│ 4. Verdict Calculator (NEW)         │ → APPLY / CONSIDER / SKIP
└─────────────────────────────────────┘
         ↓
      Analysis Result
```

### Qualification Matching Logic

**Inputs:**
- Job requirements (parsed from description/requirements field)
- User skills (from resume)
- User experience level
- Job experience requirements (parsed from title/description)

**Matching Algorithm:**
1. Extract keywords from job requirements
2. Compare against user's skills list
3. Calculate match percentage: `matched_skills / required_skills * 100`
4. Identify top 3 missing skills
5. Determine experience gap (if any)

**Output:**
```typescript
{
  matchPercentage: number      // 0-100
  matchedSkills: string[]      // Skills user has
  missingSkills: string[]      // Skills user lacks
  experienceGap: number | null // Years short (or null if meets)
  strengths: string[]          // What user brings beyond requirements
}
```

### Quick Win Generator

Selects ONE actionable suggestion based on:
1. Highest-impact missing skill (most mentioned in job)
2. Easiest to add (can be learned in 2-5 min or added to resume)
3. Biggest match percentage boost

**Quick Win Types:**
- "Add X to your skills section" (resume keyword)
- "Watch a 5-min tutorial on X" (skill gap)
- "Mention your experience with Y" (reframe existing skill)

### Verdict Calculator

| Match % | Experience | Scam Level | Verdict |
|---------|------------|------------|---------|
| ≥80% | Meets | LOW/MEDIUM | APPLY_NOW |
| 60-79% | Meets | LOW/MEDIUM | CONSIDER (with quick win) |
| 40-59% | Meets | LOW/MEDIUM | CONSIDER (stretch) |
| <40% | Any | Any | SKIP |
| Any | Any | HIGH/CRITICAL | SKIP (unsafe) |

---

## API Design

### Endpoint: `POST /api/jobs/analyze`

**Request:**
```typescript
{
  jobId: string
  // User context fetched from session
}
```

**Response:**
```typescript
{
  safety: {
    status: 'safe' | 'caution' | 'warning' | 'danger'
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    flags: string[]
  }
  qualification: {
    matchPercentage: number
    matchedSkills: string[]
    missingSkills: string[]
    experienceGap: number | null
  }
  quickWin: {
    action: string           // "Add 'React' to your skills"
    impact: string           // "+8% match"
    timeEstimate: string     // "2 min"
  } | null
  verdict: {
    recommendation: 'APPLY_NOW' | 'CONSIDER' | 'SKIP'
    reason: string           // "You meet most requirements..."
    confidence: number       // 0-100
  }
}
```

---

## UI Integration Points

### Jobs Page Modification

Current flow:
```tsx
<button onClick={() => handlePocketClick(job)}>
  Pocket & Apply
</button>
```

New flow:
```tsx
<button onClick={() => handleAnalyzeClick(job)}>
  Pocket & Apply
</button>

// Opens JobAnalyzerModal first
// If user clicks "Generate Pocket" → then open JobPocketModal
```

### JobAnalyzerModal Component

New component at `/src/components/jobs/JobAnalyzerModal.tsx`:
- Shows loading state while analyzing (fast, <2 sec)
- Displays safety, match, quick win, verdict
- Two actions: "Skip This Job" | "Generate Full Pocket"

---

## Performance Considerations

1. **No AI required** for basic analysis - rule-based matching
2. **Target: <2 seconds** for analysis to complete
3. **Cache results** for same job+user combination (5 min TTL)
4. **Lazy load** full pocket only if user proceeds

---

## Out of Scope (for Phase 1)

- AI-powered skill matching (using embeddings)
- Resume modification suggestions
- External job URL parsing
- Historical response rate data

---

## Next Steps

1. Create PLANNING.md with component specifications
2. Implement `/src/lib/job-analyzer.ts`
3. Implement `JobAnalyzerModal.tsx`
4. Create API endpoint
5. Integrate into jobs page
6. Test and document

---

*Research complete. Ready for planning phase.*
