# Job Analyzer Feature - Building Document

**Feature:** Pre-Pocket Job Analyzer
**Created:** 2026-01-21
**Status:** Implementation Complete

---

## Implementation Log

### Phase 1: Core Library (`/src/lib/job-analyzer.ts`)

**Created:** 2026-01-21

The job analyzer library provides the core analysis logic.

**Key Functions:**
| Function | Purpose |
|----------|---------|
| `analyzeJob(job, userProfile)` | Main entry point - runs full analysis |
| `extractRequirements(job)` | Extracts skills from job description |
| `matchSkills(requirements, userSkills)` | Calculates match percentage |
| `generateQuickWin(qualification, userSkills)` | Suggests actionable improvement |
| `checkSafety(job)` | Integrates with Scam Shield |
| `calculateVerdict(safety, qualification)` | Determines APPLY_NOW/CONSIDER/SKIP |

**Types Defined:**
- `AnalysisResult` - Full analysis response
- `SafetyResult` - Safety status from Scam Shield
- `QualificationResult` - Match percentage and skill gaps
- `QuickWinResult` - Actionable suggestion
- `VerdictResult` - Final recommendation
- `JobForAnalysis` - Input job format
- `UserProfile` - User skills and experience

**Skill Matching:**
- Extracts skills from job description using keyword categories
- Categories: technical, office, soft, certifications, retail_service
- Handles skill variations (e.g., "javascript" ↔ "js")
- Calculates match percentage: `matched / total * 100`

**Quick Win Types:**
1. `reframe` - User has related skill, suggest reframing
2. `learn` - Skill is quickly learnable (5 min tutorial)
3. `add_skill` - Suggest adding to resume

---

### Phase 2: API Endpoint (`/src/app/api/jobs/analyze/route.ts`)

**Created:** 2026-01-21

POST endpoint for analyzing jobs.

**Request:**
```typescript
POST /api/jobs/analyze
Body: { jobId: string }
```

**Response:**
```typescript
{
  jobId: string
  jobTitle: string
  company: string
  safety: SafetyResult
  qualification: QualificationResult
  quickWin: QuickWinResult | null
  verdict: VerdictResult
  analyzedAt: string
}
```

**Flow:**
1. Authenticate user via Supabase
2. Fetch job from database (supports UUID or external_id)
3. Get user's active resume for skills
4. Run `analyzeJob()` from job-analyzer.ts
5. Track analytics event
6. Return analysis result

---

### Phase 3: UI Modal (`/src/components/jobs/JobAnalyzerModal.tsx`)

**Created:** 2026-01-21

Pre-pocket quick check modal with dark theme matching existing design.

**Props:**
```typescript
interface JobAnalyzerModalProps {
  isOpen: boolean
  onClose: () => void
  jobTitle: string
  companyName: string
  jobId: string
  onProceed: () => void  // User wants to generate pocket
  onSkip: () => void     // User decides to skip
}
```

**UI Sections:**
1. **Header** - Job title and company with Target icon
2. **Stats Row** - Safety status, Match %, Quick Win indicator
3. **Quick Win Card** - Actionable suggestion with time estimate
4. **Matched Skills** - Green badges for matching skills
5. **Missing Skills** - Orange badges for skills to develop
6. **Safety Flags** - Warning list if any scam flags
7. **Verdict** - Final recommendation with color coding
8. **Footer** - "Skip This Job" and "Generate Pocket" buttons

**States:**
- Loading (spinner while API call)
- Error (with retry option)
- Success (full analysis display)

---

### Phase 4: Integration (`/src/app/(dashboard)/dashboard/jobs/page.tsx`)

**Modified:** 2026-01-21

Integrated analyzer into the "Pocket & Apply" flow.

**Changes:**
1. Added import for `JobAnalyzerModal`
2. Added state variables:
   - `isAnalyzerModalOpen`
   - `selectedJobForAnalysis`
3. Modified `handlePocketAndApply()` to show analyzer first
4. Added `handleAnalyzerProceed()` - generates pocket after analysis
5. Added `handleAnalyzerSkip()` - closes modal without action
6. Added `JobAnalyzerModal` component to JSX

**New Flow:**
```
User clicks "Pocket & Apply"
    ↓
JobAnalyzerModal opens (API call to /api/jobs/analyze)
    ↓
User sees quick check (safety, match, quick win, verdict)
    ↓
[Skip] → Modal closes, nothing happens
[Generate Pocket] → Pocket generation starts, navigates to pocket page
```

---

### Bug Fixes Along the Way

1. **Type Compatibility** (`job-analyzer.ts`)
   - `JobForAnalysis.requirements` was `string | string[]`
   - `JobForScamCheck.requirements` expects `string`
   - Fixed by converting array to newline-separated string in `checkSafety()`

2. **Null Check** (`job-pockets/generate/route.ts`)
   - Pre-existing issue: `jobData` could be null
   - Added null check with 500 error response

---

## Files Created

| File | Lines | Purpose |
|------|-------|---------|
| `/src/lib/job-analyzer.ts` | ~470 | Core analysis logic |
| `/src/app/api/jobs/analyze/route.ts` | ~180 | API endpoint |
| `/src/components/jobs/JobAnalyzerModal.tsx` | ~380 | UI modal component |

## Files Modified

| File | Changes |
|------|---------|
| `/src/components/jobs/index.ts` | Added JobAnalyzerModal export |
| `/src/app/(dashboard)/dashboard/jobs/page.tsx` | Integrated analyzer flow |
| `/src/app/api/job-pockets/generate/route.ts` | Fixed null check bug |

---

## Verification

- [x] Build completes without TypeScript errors
- [x] New API endpoint appears in build output
- [ ] Manual testing on localhost:3003
- [ ] Document test results in TESTING.md

---

*Building document complete. Ready for testing.*
