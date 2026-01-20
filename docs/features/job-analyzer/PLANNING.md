# Job Analyzer Feature - Planning Document

**Feature:** Pre-Pocket Job Analyzer
**Created:** 2026-01-21
**Status:** Planning Complete

---

## Implementation Overview

### Files to Create

| File | Purpose |
|------|---------|
| `/src/lib/job-analyzer.ts` | Core analysis logic (matching, quick wins, verdict) |
| `/src/components/jobs/JobAnalyzerModal.tsx` | UI component for analysis results |
| `/src/app/api/jobs/analyze/route.ts` | API endpoint |

### Files to Modify

| File | Changes |
|------|---------|
| `/src/app/(dashboard)/dashboard/jobs/page.tsx` | Add analyzer flow before pocket generation |

---

## Component Specifications

### 1. `/src/lib/job-analyzer.ts`

```typescript
// Types
export interface AnalysisResult {
  safety: SafetyResult
  qualification: QualificationResult
  quickWin: QuickWinResult | null
  verdict: VerdictResult
}

export interface SafetyResult {
  status: 'safe' | 'caution' | 'warning' | 'danger'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  flags: string[]
}

export interface QualificationResult {
  matchPercentage: number
  matchedSkills: string[]
  missingSkills: string[]
  experienceGap: number | null
  totalRequired: number
  totalMatched: number
}

export interface QuickWinResult {
  action: string
  impact: string
  timeEstimate: string
  type: 'add_skill' | 'reframe' | 'learn'
}

export interface VerdictResult {
  recommendation: 'APPLY_NOW' | 'CONSIDER' | 'SKIP'
  reason: string
  confidence: number
}

// Main function
export async function analyzeJob(
  job: Job,
  userProfile: UserProfile
): Promise<AnalysisResult>

// Helper functions
function extractRequirements(job: Job): string[]
function matchSkills(requirements: string[], userSkills: string[]): QualificationResult
function generateQuickWin(qualification: QualificationResult): QuickWinResult | null
function calculateVerdict(safety: SafetyResult, qualification: QualificationResult): VerdictResult
```

### 2. `/src/components/jobs/JobAnalyzerModal.tsx`

```typescript
interface JobAnalyzerModalProps {
  isOpen: boolean
  onClose: () => void
  job: Job
  onProceed: () => void  // User wants to generate pocket
  onSkip: () => void     // User decides to skip
}

// State
const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
const [loading, setLoading] = useState(true)
const [error, setError] = useState<string | null>(null)

// On mount, call /api/jobs/analyze
// Display results in card format
// Two CTAs: Skip | Generate Pocket
```

### 3. `/src/app/api/jobs/analyze/route.ts`

```typescript
// POST /api/jobs/analyze
export async function POST(request: NextRequest) {
  // 1. Authenticate user
  // 2. Get job from database
  // 3. Get user profile + resume skills
  // 4. Run analyzeJob()
  // 5. Return AnalysisResult
}
```

---

## Skill Extraction Strategy

### From Job Description/Requirements

Common patterns to extract:
- Explicit skill lists: "Required: React, Node.js, SQL"
- Bullet points with skills
- "Experience with X" phrases
- Tool/technology mentions

### Keyword Categories

```typescript
const SKILL_KEYWORDS = {
  technical: ['javascript', 'python', 'react', 'sql', 'excel', ...],
  soft: ['communication', 'teamwork', 'leadership', ...],
  tools: ['salesforce', 'quickbooks', 'jira', ...],
  certifications: ['pmp', 'cpa', 'aws certified', ...]
}
```

### Matching Algorithm

```typescript
function matchSkills(requirements: string[], userSkills: string[]): QualificationResult {
  const normalizedReqs = requirements.map(r => r.toLowerCase().trim())
  const normalizedUser = userSkills.map(s => s.toLowerCase().trim())

  const matched = normalizedReqs.filter(req =>
    normalizedUser.some(skill =>
      skill.includes(req) || req.includes(skill)
    )
  )

  const missing = normalizedReqs.filter(req => !matched.includes(req))

  return {
    matchPercentage: Math.round((matched.length / normalizedReqs.length) * 100),
    matchedSkills: matched,
    missingSkills: missing.slice(0, 5), // Top 5 missing
    experienceGap: null, // TODO: Parse experience requirements
    totalRequired: normalizedReqs.length,
    totalMatched: matched.length
  }
}
```

---

## Quick Win Generation Logic

### Priority Order

1. **Resume keyword addition** (2 min, highest impact)
   - If user has related skill but different wording
   - Example: User has "MS Office" but job wants "Excel"
   - Action: "Add 'Excel' to your skills - you already use it!"

2. **Skill learning** (5 min, medium impact)
   - If skill can be learned quickly via tutorial
   - Example: Job wants "Google Sheets formulas"
   - Action: "Watch a 5-min tutorial on Google Sheets basics"

3. **Experience reframing** (3 min, variable impact)
   - If user has transferable experience
   - Example: Job wants "customer service" but user has "retail"
   - Action: "Highlight your retail experience as customer service"

### Quick Win Template

```typescript
function generateQuickWin(qualification: QualificationResult): QuickWinResult | null {
  if (qualification.missingSkills.length === 0) return null

  const topMissing = qualification.missingSkills[0]
  const potentialImpact = Math.round(100 / qualification.totalRequired)

  return {
    action: `Add "${topMissing}" to your skills section`,
    impact: `+${potentialImpact}% match`,
    timeEstimate: '2 min',
    type: 'add_skill'
  }
}
```

---

## Verdict Logic

```typescript
function calculateVerdict(
  safety: SafetyResult,
  qualification: QualificationResult
): VerdictResult {
  // Safety first
  if (safety.severity === 'CRITICAL' || safety.severity === 'HIGH') {
    return {
      recommendation: 'SKIP',
      reason: 'This job has safety concerns. Proceed with caution.',
      confidence: 95
    }
  }

  // Qualification thresholds
  const match = qualification.matchPercentage

  if (match >= 80) {
    return {
      recommendation: 'APPLY_NOW',
      reason: 'You\'re a strong match! Apply with confidence.',
      confidence: 90
    }
  }

  if (match >= 60) {
    return {
      recommendation: 'CONSIDER',
      reason: 'You meet most requirements. Use the quick win to improve your chances.',
      confidence: 75
    }
  }

  if (match >= 40) {
    return {
      recommendation: 'CONSIDER',
      reason: 'This is a stretch. Focus on transferable skills in your application.',
      confidence: 60
    }
  }

  return {
    recommendation: 'SKIP',
    reason: 'You may not meet enough requirements. Consider similar roles instead.',
    confidence: 70
  }
}
```

---

## UI Layout

### Modal Structure

```
┌─────────────────────────────────────────────────┐
│ [X]                                             │
│         Quick Check: {Job Title}                │
│         {Company Name}                          │
│─────────────────────────────────────────────────│
│                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ ✅ SAFE  │ │ 72%      │ │ ⚡ TIP   │        │
│  │ No flags │ │ MATCH    │ │ Available│        │
│  └──────────┘ └──────────┘ └──────────┘        │
│                                                 │
│─────────────────────────────────────────────────│
│  ⚡ QUICK WIN (2 min)                           │
│  ┌─────────────────────────────────────────┐   │
│  │ Add "React" to your skills section      │   │
│  │ → Improves match to 80%                 │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│─────────────────────────────────────────────────│
│  VERDICT                                        │
│  ┌─────────────────────────────────────────┐   │
│  │ ✓ WORTH APPLYING                        │   │
│  │ You meet most requirements. With the    │   │
│  │ quick win, you're competitive.          │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│─────────────────────────────────────────────────│
│  [Skip This Job]          [Generate Pocket →]  │
└─────────────────────────────────────────────────┘
```

### Color Coding

| Element | APPLY_NOW | CONSIDER | SKIP |
|---------|-----------|----------|------|
| Verdict bg | Green-50 | Yellow-50 | Red-50 |
| Verdict border | Green-500 | Yellow-500 | Red-500 |
| Match % | Green | Yellow | Red |
| CTA button | Primary (gold) | Primary (gold) | Muted |

---

## Integration Plan

### Step 1: Modify Jobs Page Click Handler

Current:
```tsx
const handlePocketClick = (job: Job) => {
  setSelectedJob(job)
  setShowPocketModal(true)
}
```

New:
```tsx
const [showAnalyzerModal, setShowAnalyzerModal] = useState(false)
const [analyzerJob, setAnalyzerJob] = useState<Job | null>(null)

const handlePocketClick = (job: Job) => {
  setAnalyzerJob(job)
  setShowAnalyzerModal(true)
}

const handleAnalyzerProceed = () => {
  setShowAnalyzerModal(false)
  setSelectedJob(analyzerJob)
  setShowPocketModal(true)
}

const handleAnalyzerSkip = () => {
  setShowAnalyzerModal(false)
  setAnalyzerJob(null)
}
```

### Step 2: Add Modal to JSX

```tsx
{showAnalyzerModal && analyzerJob && (
  <JobAnalyzerModal
    isOpen={showAnalyzerModal}
    onClose={() => setShowAnalyzerModal(false)}
    job={analyzerJob}
    onProceed={handleAnalyzerProceed}
    onSkip={handleAnalyzerSkip}
  />
)}
```

---

## Testing Plan

See TESTING.md for detailed test cases.

### Key Scenarios

1. Job with all skills matched → APPLY_NOW verdict
2. Job with 60-80% match → CONSIDER with quick win
3. Job with <40% match → SKIP verdict
4. Job with HIGH scam severity → SKIP (safety)
5. Job with no requirements → Handle gracefully
6. User with no resume → Use default analysis

---

## Rollout Plan

1. **Development:** Build and test locally
2. **Feature flag:** `ENABLE_JOB_ANALYZER=true` in .env
3. **Soft launch:** Enable for test users
4. **Full launch:** Enable for all users

---

*Planning complete. Ready for implementation.*
