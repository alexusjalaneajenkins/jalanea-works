# Jalanea Works - Claude Code Build Plan

> **Purpose**: A step-by-step build plan with copy-paste Claude Code prompts for each task.
> **Format**: Each task includes context, acceptance criteria, and a ready-to-use prompt.

---

## How to Use This Document

1. **Copy the prompt** for the task you're working on
2. **Paste into Claude Code** terminal
3. **Review the output** before accepting changes
4. **Test the feature** before moving to the next task
5. **Commit changes** after each completed task

---

## Phase 1: Foundation (Weeks 1-2)

### Task 1.1: Project Setup & Configuration

**Status**: ✅ Complete (based on current codebase)

**What exists**:
- Next.js 14 with App Router
- TypeScript configuration
- Tailwind CSS + shadcn/ui
- Supabase client setup
- Environment variables configured

---

### Task 1.2: Database Schema - Core Tables

**Status**: 🟡 Partially Complete

**What exists**: `profiles` table extended, `passkeys` table, career mapping tables

**What's needed**: Full schema from TECHNICAL_ARCHITECTURE_v1.0.md

<details>
<summary>📋 Claude Code Prompt</summary>

```
Create the complete Supabase database schema for Jalanea Works.

## Context
We're building a job search platform for Orlando/Valencia College graduates. The database needs to support:
- User profiles with location, transportation preferences, and salary targets
- Job listings with scam detection flags and Valencia-matching scores
- Application tracking with status state machine
- Interview scheduling with LYNX transit time
- Resume storage with ATS optimization scores
- Community fund tracking for revenue transparency

## Files to Reference
- /docs/TECHNICAL_ARCHITECTURE_v1.0.md (Section 3: Database Schema)
- /supabase/migrations/ (existing migrations)

## Requirements
1. Create a new migration file: `supabase/migrations/20260115000001_complete_schema.sql`
2. Include ALL tables from the technical architecture doc:
   - users (extend existing profiles table or create new)
   - credentials
   - resumes
   - jobs
   - job_pockets
   - applications
   - interviews
   - lynx_routes (with Orlando seed data)
   - lynx_stops
   - valencia_programs (with seed data)
   - orlando_rent_data (with seed data)
   - daily_plans
   - shadow_calendar_events
   - subscriptions
   - payments
   - community_fund_transactions
   - community_fund_grants

3. Add proper constraints, indexes, and foreign keys
4. Add RLS policies for each table
5. Include seed data for Orlando-specific tables (LYNX routes, Valencia programs, rent data)

## Acceptance Criteria
- [ ] All tables created with proper types
- [ ] RLS policies enable users to only access their own data
- [ ] Seed data inserted for Orlando tables
- [ ] No conflicts with existing migrations
```

</details>

---

### Task 1.3: Authentication - Passkey System

**Status**: ✅ Complete

**What exists**:
- `/api/auth/passkey/register-options`
- `/api/auth/passkey/register`
- `/api/auth/passkey/login-options`
- `/api/auth/passkey/login`
- `/api/auth/magic-link`

---

### Task 1.4: Authentication - Auth Modal Component

**Status**: 🟡 In Progress (per your chat history)

**What exists**: Basic auth pages, modal component started

<details>
<summary>📋 Claude Code Prompt</summary>

```
Build the unified AuthModal component for Jalanea Works.

## Context
We need a single modal for both sign-in and sign-up that supports:
- Google OAuth
- Passkey authentication
- Magic link email

## Design Requirements (from SuperDesign exports)
- Full-screen overlay modal (z-50, centered)
- Dark theme: #0f172a background with gold (#ffc425) accents
- Backdrop: black/70 with blur filter
- Max-width: 448px, max-height: 90vh with scroll
- Smooth scale/fade entrance animation (framer-motion)

## Files to Create/Modify
1. `/src/components/auth/AuthModal.tsx` - Main modal wrapper
2. `/src/components/auth/AuthForm.tsx` - Form with Sign In / Sign Up tabs
3. `/src/components/auth/GoogleButton.tsx` - Google OAuth button
4. `/src/components/auth/PasskeyButton.tsx` - Passkey auth button
5. `/src/components/auth/MagicLinkForm.tsx` - Email input for magic link

## Existing Files to Reference
- `/src/app/(auth)/login/page.tsx` - Current login logic
- `/src/app/(auth)/signup/page.tsx` - Current signup logic
- `/src/app/api/auth/` - Existing auth endpoints

## Requirements
1. AuthModal should accept `isOpen`, `onClose`, and `defaultTab` props
2. Form should toggle between "Sign In" and "Sign Up" modes
3. Google OAuth should use `supabase.auth.signInWithOAuth({ provider: 'google' })`
4. Passkey auth should use existing `/api/auth/passkey/*` endpoints
5. Magic link should use existing `/api/auth/magic-link` endpoint
6. Add loading states and error handling
7. On successful auth, close modal and redirect to `/foundation` (new users) or `/dashboard` (existing)

## Acceptance Criteria
- [ ] Modal opens/closes with animation
- [ ] Sign In / Sign Up tabs work
- [ ] Google OAuth initiates flow
- [ ] Passkey registration and login work
- [ ] Magic link sends email
- [ ] Error messages display properly
- [ ] Mobile responsive
```

</details>

---

### Task 1.5: Onboarding - V2 Flow with Dark Theme

**Status**: 🟡 In Progress (per your chat history)

**What exists**: 5-step onboarding, i18n support, basic UI

<details>
<summary>📋 Claude Code Prompt</summary>

```
Implement the V2 onboarding redesign with dark theme and 4-phase flow.

## Context
The current onboarding has 5 steps. The redesign consolidates into 4 phases with a new dark UI, progress sidebar, and lightning bolt animations.

## Phase Mapping
- Phase 1: About You (language, name, location)
- Phase 2: Education (level, school, program, credentials)
- Phase 3: Work Preferences (transport, commute, schedule, shifts)
- Phase 4: Goals (career phase, salary, challenges)

## Design Requirements
- Dark theme: #020617 background, gold #ffc425 accents
- Glass-card effect: `bg-gradient-to-br from-slate-900/90 to-slate-800/80 backdrop-blur-xl`
- Desktop: Sidebar progress indicator (left side)
- Mobile: Top progress bar
- Lightning bolt animation on answer submission
- One question at a time flow

## Files to Create
1. `/src/app/(onboarding-v2)/layout.tsx` - Dark theme layout
2. `/src/app/(onboarding-v2)/page.tsx` - Main flow page
3. `/src/components/onboarding-v2/OnboardingFlow.tsx` - State machine orchestrator
4. `/src/components/onboarding-v2/PhaseProgress.tsx` - Sidebar/top progress
5. `/src/components/onboarding-v2/QuestionCard.tsx` - Animated question display
6. `/src/components/onboarding-v2/questions.ts` - Question definitions
7. `/src/components/onboarding-v2/LightningBolt.tsx` - Animation component

## Files to Reference
- `/src/contexts/onboarding-context.tsx` - Existing state management
- `/src/app/(onboarding)/` - Current onboarding pages
- `/src/data/centralFloridaSchools.ts` - School/program data

## Requirements
1. Keep existing onboarding context for data persistence
2. Questions advance one at a time with animation
3. Back button to go to previous question
4. Progress shows phase and question within phase
5. Final step calls `/api/onboarding` to save data
6. Redirect to `/dashboard` on completion

## Acceptance Criteria
- [ ] Dark theme applied throughout
- [ ] 4 phases with correct questions
- [ ] Progress indicator updates correctly
- [ ] Lightning animation fires on answer
- [ ] Back navigation works
- [ ] Data saves to Supabase on completion
- [ ] Mobile responsive (top bar vs sidebar)
```

</details>

---

### Task 1.6: Onboarding - Career Path Selection

**Status**: 🔴 Not Started

**What exists**: Database tables created, API endpoints ready, Valencia JSON loaded

<details>
<summary>📋 Claude Code Prompt</summary>

```
Build the Career Path Selection feature for onboarding Phase 2.

## Context
After users select their education (school + program), we show relevant career paths they can pursue. Users can select multiple paths and add custom ones.

## Database (Already Created)
- `career_paths` - Job titles with salary/growth data
- `program_career_paths` - Links programs to careers
- `user_career_paths` - User's selections

## API Endpoints (Already Created)
- GET `/api/career-paths?program=key&school=id` - Get career paths for program
- POST `/api/user/career-paths` - Save user selections

## Files to Create
1. `/src/components/onboarding-v2/CareerPathSelector.tsx` - Main selector
2. `/src/components/onboarding-v2/CareerPathCard.tsx` - Individual career card
3. `/src/components/onboarding-v2/CustomCareerInput.tsx` - Add custom path

## Files to Reference
- `/src/types/career.ts` - TypeScript interfaces
- `/src/lib/career-utils.ts` - Utility functions
- `/src/data/career-mappings/valencia.json` - Sample data structure

## Requirements
1. CareerPathSelector fetches paths when program is selected
2. Display career cards with:
   - Title (localized)
   - Salary range badge (e.g., "$50K - $75K")
   - Growth indicator (🚀 Very High, 📈 High, 📊 Moderate)
   - Checkmark when selected
3. Allow unlimited selections (click to toggle)
4. "Add custom career" input at bottom
5. Loading state while fetching
6. Empty state if no mappings exist

## Props Interface
```typescript
interface CareerPathSelectorProps {
  programKey: string
  school: string
  selectedPaths: string[]
  customPaths: { title: string; titleEs?: string }[]
  onSelectPath: (pathId: string) => void
  onDeselectPath: (pathId: string) => void
  onAddCustomPath: (title: string, titleEs?: string) => void
  onRemoveCustomPath: (title: string) => void
  language: 'en' | 'es'
}
```

## Styling
- Dark theme matching onboarding
- Cards: glass-card effect with gold border on selection
- Gold checkmark icon when selected
- Responsive grid: 1 col mobile, 2 col tablet, 3 col desktop

## Acceptance Criteria
- [ ] Fetches career paths from API
- [ ] Displays cards with salary and growth
- [ ] Multi-select works (toggle on/off)
- [ ] Custom career input works
- [ ] Spanish translations display when language='es'
- [ ] Loading and empty states handled
```

</details>

---

## Phase 2: Dashboard & Core UI (Weeks 3-4)

### Task 2.1: Dashboard Layout

**Status**: ✅ Complete

**What exists**:
- `/src/app/(dashboard)/layout.tsx`
- `/src/components/dashboard/DashboardNav.tsx`
- `/src/components/dashboard/DashboardHeader.tsx`
- All 5 dashboard pages (home, jobs, applications, resume, settings)

---

### Task 2.2: Dashboard Home - Stats & Daily Plan

**Status**: 🟡 Partial (UI exists, needs real data)

<details>
<summary>📋 Claude Code Prompt</summary>

```
Implement the Dashboard Home page with real data and tier-specific features.

## Context
The dashboard home shows different content based on user tier:
- Essential: Daily Plan (8 jobs/day), quick stats, encouragement
- Starter: Weekly progress, skill translation CTA, bridge role tips
- Premium: Strategic overview, pocket usage, referral tracking

## Current State
- Basic layout exists at `/src/app/(dashboard)/dashboard/page.tsx`
- Shows placeholder stats and "Coming soon" sections

## Files to Create/Modify
1. `/src/app/(dashboard)/dashboard/page.tsx` - Update with real data
2. `/src/components/dashboard/DailyPlanWidget.tsx` - Essential tier widget
3. `/src/components/dashboard/WeeklyProgressWidget.tsx` - Starter tier widget
4. `/src/components/dashboard/StrategicOverviewWidget.tsx` - Premium tier widget
5. `/src/components/dashboard/StatsCards.tsx` - Reusable stats display
6. `/src/components/dashboard/TierBadge.tsx` - Shows user's current tier

## Data Requirements
Fetch from Supabase:
- User's tier from `profiles` table
- Application count and status breakdown from `applications` table
- Today's daily plan from `daily_plans` table
- Recent activity from `applications` table

## Layout (All Tiers)
```
+------------------+------------------+
|   Welcome Back   |   Tier Badge     |
|   {User Name}    |   [Essential]    |
+------------------+------------------+
|                                     |
|   [Stats Cards - 4 columns]         |
|   Applications | Interviews |       |
|   Offers | Days Active              |
|                                     |
+-------------------------------------+
|                                     |
|   [Tier-Specific Widget]            |
|   Essential: Daily Plan             |
|   Starter: Weekly Progress          |
|   Premium: Strategic Overview       |
|                                     |
+-------------------------------------+
|                                     |
|   [Next Steps / Quick Actions]      |
|                                     |
+-------------------------------------+
```

## Daily Plan Widget (Essential)
- Shows 8 jobs for today
- Progress bar (X/8 completed)
- Job cards with quick apply button
- "Regenerate Plan" button
- Encouragement message

## Acceptance Criteria
- [ ] Shows correct tier badge
- [ ] Stats reflect real data from database
- [ ] Tier-specific widget displays correctly
- [ ] Loading states for async data
- [ ] Empty states when no data
- [ ] Mobile responsive
```

</details>

---

### Task 2.3: Jobs Hub - Search & Filters

**Status**: 🔴 Not Started

<details>
<summary>📋 Claude Code Prompt</summary>

```
Build the Jobs Hub with search, filters, and LYNX-aware results.

## Context
The Jobs Hub is the core job search interface. It needs to:
- Search jobs from Indeed API (or local cache)
- Filter by LYNX accessibility, salary, job type
- Show Valencia-matching badges
- Display Scam Shield warnings
- Support infinite scroll or pagination

## Files to Create
1. `/src/app/(dashboard)/dashboard/jobs/page.tsx` - Main jobs page
2. `/src/components/jobs/JobSearchBar.tsx` - Search input
3. `/src/components/jobs/JobFilters.tsx` - Filter sidebar/drawer
4. `/src/components/jobs/JobCard.tsx` - Individual job display
5. `/src/components/jobs/JobList.tsx` - List with infinite scroll
6. `/src/components/jobs/LynxBadge.tsx` - LYNX accessibility badge
7. `/src/components/jobs/ValenciaBadge.tsx` - Valencia match badge
8. `/src/components/jobs/ScamShieldBadge.tsx` - Scam warning badge
9. `/src/app/api/jobs/search/route.ts` - Search API endpoint
10. `/src/lib/indeed-client.ts` - Indeed API client

## Filter Options
- **Search**: Keyword search in title/description
- **Location**: Default to user's location
- **Max Commute**: 15/30/45/60 minutes (LYNX time)
- **Salary Range**: Min/Max inputs
- **Job Type**: Full-time, Part-time, Contract, Temp
- **Posted**: Last 24h, 3 days, 7 days, 30 days
- **LYNX Accessible**: Toggle (show only LYNX-reachable jobs)
- **Valencia Friendly**: Toggle (show Valencia-matching jobs)

## Job Card Display
```
+------------------------------------------+
| [Company Logo]  JOB TITLE                |
|                 Company Name             |
| [🚌 25 min]  [Valencia ✓]  [⚠️ Medium]   |
+------------------------------------------+
| $45,000 - $55,000/year | Full-time       |
| Posted 2 days ago                        |
+------------------------------------------+
| Brief description excerpt...             |
+------------------------------------------+
| [View Pocket]  [Quick Apply]             |
+------------------------------------------+
```

## LYNX Integration
- Calculate transit time from user's location to job location
- Use Google Maps Directions API with transit mode
- Cache transit times to avoid repeated API calls
- Show LYNX route numbers in badge

## Scam Shield Integration
- Run scam detection on each job
- Show badge with severity: CRITICAL (red), HIGH (orange), MEDIUM (yellow), LOW (green)
- CRITICAL jobs hidden by default

## API Endpoint: GET /api/jobs/search
Query params: q, location, salary_min, salary_max, job_type, posted_within, page, limit
Response: { jobs: Job[], total: number, page: number, hasMore: boolean }

## Acceptance Criteria
- [ ] Search returns relevant jobs
- [ ] All filters work correctly
- [ ] LYNX badge shows accurate transit time
- [ ] Valencia badge shows on matching jobs
- [ ] Scam Shield badge displays warnings
- [ ] Infinite scroll or pagination works
- [ ] Mobile responsive (filters in drawer)
- [ ] Loading and empty states
```

</details>

---

### Task 2.4: Job Detail & Job Pocket Modal

**Status**: 🔴 Not Started

<details>
<summary>📋 Claude Code Prompt</summary>

```
Build the Job Detail page and Job Pocket generation modal.

## Context
When a user clicks a job, they see full details and can generate a "Job Pocket" - an AI-generated intelligence report about the job.

## Pocket Tiers
- **Tier 1 (20 sec read)**: Essential - always available
- **Tier 2 (90 sec read)**: Starter - 1/month allocation
- **Tier 3 (5-10 min read)**: Premium - 5/month allocation

## Files to Create
1. `/src/app/(dashboard)/dashboard/jobs/[jobId]/page.tsx` - Job detail page
2. `/src/components/jobs/JobDetail.tsx` - Full job information
3. `/src/components/jobs/JobPocketModal.tsx` - Pocket generation/display modal
4. `/src/components/jobs/PocketTier1.tsx` - Tier 1 pocket display
5. `/src/components/jobs/PocketTier2.tsx` - Tier 2 pocket display
6. `/src/components/jobs/PocketTier3.tsx` - Tier 3 pocket display
7. `/src/app/api/job-pockets/generate/route.ts` - Generate pocket API
8. `/src/lib/pocket-generator.ts` - AI generation logic

## Job Detail Page Layout
```
+------------------------------------------+
| ← Back to Jobs                           |
+------------------------------------------+
| [Company Logo]                           |
| JOB TITLE                                |
| Company Name                             |
| Location | $X - $Y | Full-time           |
+------------------------------------------+
| [🚌 LYNX: 25 min via Route 36]           |
| [Valencia Match: 85%]                    |
| [Scam Shield: LOW ✓]                     |
+------------------------------------------+
| DESCRIPTION                              |
| Full job description text...             |
+------------------------------------------+
| REQUIREMENTS                             |
| • Requirement 1                          |
| • Requirement 2                          |
+------------------------------------------+
| BENEFITS                                 |
| • Benefit 1                              |
| • Benefit 2                              |
+------------------------------------------+
| [Generate Pocket]  [Apply Now]           |
+------------------------------------------+
```

## Pocket Modal
- Shows loading state while generating
- Displays appropriate tier content
- "Apply Now" button at bottom
- Track if user applied after viewing pocket

## Tier 1 Pocket Content (Essential)
```json
{
  "qualification_check": { "status": "QUALIFIED", "missing": [] },
  "quick_brief": "salary, requirements, LYNX route summary",
  "talking_points": ["strength 1", "strength 2", "strength 3"],
  "likely_questions": ["question 1", "question 2"],
  "red_flags": ["flag 1"] or [],
  "recommendation": "APPLY NOW" | "CONSIDER" | "SKIP"
}
```

## Tier 2 Pocket Content (Starter)
All of Tier 1 plus:
```json
{
  "role_breakdown": "detailed role analysis",
  "why_hiring": "company context",
  "what_they_want": "ideal candidate profile",
  "culture_check": { "score": 8.2, "notes": "..." },
  "your_positioning": "how to present yourself"
}
```

## Tier 3 Pocket Content (Premium)
8-page comprehensive report sections

## AI Generation
- Use Google Gemini Flash for Tier 1/2
- Use Google Gemini Pro for Tier 3
- Pass job details + user resume + user credentials
- Cache generated pockets for 7 days

## Acceptance Criteria
- [ ] Job detail page shows all information
- [ ] LYNX badge shows accurate transit info
- [ ] Pocket modal generates content
- [ ] Tier restrictions enforced (allocation limits)
- [ ] Loading state during generation
- [ ] Content displays formatted correctly
- [ ] Apply button tracks application
- [ ] Mobile responsive
```

</details>

---

### Task 2.5: Scam Shield Implementation

**Status**: 🔴 Not Started

<details>
<summary>📋 Claude Code Prompt</summary>

```
Implement the Scam Shield deterministic detection system.

## Context
Scam Shield protects users from job scams using pattern matching and heuristics. It's deterministic (not AI) for consistency and speed.

## Severity Levels
- **CRITICAL**: Auto-block, don't show job
- **HIGH**: Show warning, require confirmation to view
- **MEDIUM**: Show warning badge
- **LOW**: Safe, show green badge

## Files to Create
1. `/src/lib/scam-shield.ts` - Detection logic
2. `/src/components/jobs/ScamShieldBadge.tsx` - Badge component
3. `/src/components/jobs/ScamWarningModal.tsx` - HIGH severity warning

## Detection Rules

### CRITICAL (Auto-block)
```typescript
const CRITICAL_RULES = [
  { id: 'upfront_payment', pattern: /(pay|send|wire|transfer|deposit).*(fee|money|upfront)/i },
  { id: 'check_cashing', pattern: /(cash|deposit).*(check|cheque)/i },
  { id: 'cryptocurrency', pattern: /(bitcoin|crypto|btc|ethereum)/i },
  { id: 'money_transfer', pattern: /(western union|moneygram|wire transfer)/i },
  { id: 'personal_bank', pattern: /(your bank account|bank details|routing number)/i },
]
```

### HIGH (Warning + gate)
```typescript
const HIGH_RULES = [
  { id: 'vague_description', check: (job) => job.description.split(' ').length < 50 },
  { id: 'no_company_info', check: (job) => !job.company_website && !job.company },
  { id: 'unrealistic_salary', check: (job) => job.salary_max > getMedianSalary(job.title) * 2.5 },
  { id: 'work_from_home_emphasis', pattern: /(work from home|earn from home|make money from home)/i },
  { id: 'too_good_to_be_true', pattern: /(unlimited earning|no experience needed|easy money)/i },
]
```

### MEDIUM (Warning only)
```typescript
const MEDIUM_RULES = [
  { id: 'personal_email', check: (job) => /@(gmail|yahoo|hotmail|outlook)\./.test(job.contact_email) },
  { id: 'po_box_address', pattern: /p\.?o\.?\s*box/i },
  { id: 'missing_requirements', check: (job) => !job.requirements || job.requirements.length < 20 },
  { id: 'urgency_language', pattern: /(urgent|immediately|right away|asap)/i },
]
```

## Function Signature
```typescript
interface ScamCheckResult {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  flags: Array<{
    id: string
    rule: string
    matched: string | boolean
  }>
  safe: boolean
  message: string
}

function checkJobForScams(job: Job): ScamCheckResult
```

## Badge Component
- CRITICAL: Red with X icon (should not display - job hidden)
- HIGH: Orange with warning triangle
- MEDIUM: Yellow with info icon
- LOW: Green with checkmark

## Warning Modal (HIGH severity)
```
+------------------------------------------+
| ⚠️ Potential Job Scam Warning            |
+------------------------------------------+
| This job listing has some red flags:     |
|                                          |
| • Vague job description                  |
| • No company website                     |
| • Emphasis on "work from home"           |
|                                          |
| This doesn't mean it's definitely a      |
| scam, but please be cautious.            |
|                                          |
| [Go Back]  [View Anyway]                 |
+------------------------------------------+
```

## Integration Points
- Run on job fetch (before displaying)
- Store results in `jobs.scam_severity` and `jobs.scam_flags`
- Filter out CRITICAL jobs from search results
- Show modal for HIGH jobs on first view

## Acceptance Criteria
- [ ] All detection rules implemented
- [ ] Severity calculated correctly
- [ ] Badge displays appropriate color/icon
- [ ] CRITICAL jobs hidden from results
- [ ] HIGH jobs show warning modal
- [ ] Flags stored in database
- [ ] Performance: <10ms per job check
```

</details>

---

## Phase 3: Job Search Features (Weeks 5-6)

### Task 3.1: Indeed API Integration

**Status**: 🔴 Not Started

<details>
<summary>📋 Claude Code Prompt</summary>

```
Implement Indeed API integration for job search.

## Context
Indeed is our primary job data source. We need to search jobs, fetch details, and cache results.

## Indeed API Details
- **Endpoint**: `https://api.indeed.com/ads/apisearch`
- **Auth**: Publisher ID (in environment variable)
- **Rate Limit**: 1000 calls/day (free tier)
- **Docs**: https://indeed.readme.io/docs

## Files to Create
1. `/src/lib/indeed-client.ts` - API client
2. `/src/app/api/jobs/search/route.ts` - Search endpoint
3. `/src/app/api/jobs/[jobId]/route.ts` - Job detail endpoint
4. `/src/lib/job-cache.ts` - Redis caching layer

## Environment Variables
```
INDEED_PUBLISHER_ID=your_publisher_id
```

## Indeed Client Functions
```typescript
// Search jobs
async function searchJobs(params: {
  q: string           // Search query
  l: string           // Location (Orlando, FL)
  radius?: number     // Miles from location
  jt?: string         // Job type: fulltime, parttime, contract, internship, temporary
  salary?: string     // Salary filter
  fromage?: number    // Days since posted
  start?: number      // Pagination offset
  limit?: number      // Results per page (max 25)
}): Promise<IndeedSearchResponse>

// Get job details
async function getJobDetails(jobKey: string): Promise<IndeedJob>
```

## Response Transformation
Transform Indeed response to our Job type:
```typescript
function transformIndeedJob(indeedJob: IndeedJob): Job {
  return {
    id: generateUUID(),
    external_id: indeedJob.jobkey,
    source: 'indeed',
    title: indeedJob.jobtitle,
    company: indeedJob.company,
    location_address: indeedJob.formattedLocation,
    location_city: indeedJob.city,
    location_state: indeedJob.state,
    salary_min: parseSalary(indeedJob.salary).min,
    salary_max: parseSalary(indeedJob.salary).max,
    description: indeedJob.snippet,
    apply_url: indeedJob.url,
    posted_at: parseRelativeDate(indeedJob.formattedRelativeTime),
    // ... etc
  }
}
```

## Caching Strategy
- Cache search results for 1 hour
- Cache job details for 24 hours
- Use Redis (Upstash) for caching
- Cache key format: `indeed:search:{hash}` or `indeed:job:{jobkey}`

## Rate Limiting
- Track API calls per day
- Return cached results if near limit
- Log warnings when approaching limit

## Error Handling
- Handle rate limit errors gracefully
- Fall back to cached data when possible
- Log errors for monitoring

## Acceptance Criteria
- [ ] Search returns relevant jobs
- [ ] Job details fetched correctly
- [ ] Salary parsing works (hourly/annual)
- [ ] Location parsing extracts city/state
- [ ] Caching reduces API calls
- [ ] Rate limiting prevents overuse
- [ ] Errors handled gracefully
```

</details>

---

### Task 3.2: LYNX Transit Integration

**Status**: 🔴 Not Started

<details>
<summary>📋 Claude Code Prompt</summary>

```
Implement LYNX bus transit time calculation using Google Maps API.

## Context
Many Jalanea Works users rely on LYNX (Orlando's bus system). We calculate transit time from user's location to job locations.

## Google Maps API Setup
- **API**: Directions API
- **Mode**: transit
- **Transit Mode**: bus
- **Docs**: https://developers.google.com/maps/documentation/directions

## Files to Create
1. `/src/lib/transit-client.ts` - Google Maps transit client
2. `/src/lib/lynx-utils.ts` - LYNX-specific utilities
3. `/src/components/jobs/LynxBadge.tsx` - Transit time badge
4. `/src/app/api/transit/route.ts` - Transit calculation endpoint

## Environment Variables
```
GOOGLE_MAPS_API_KEY=your_api_key
```

## Transit Client Functions
```typescript
interface TransitResult {
  duration_minutes: number
  departure_time: Date
  arrival_time: Date
  routes: Array<{
    route_number: string
    route_name: string
    departure_stop: string
    arrival_stop: string
    duration_minutes: number
  }>
  walking_minutes: number
  transfers: number
}

// Calculate transit time
async function calculateTransitTime(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  arrivalTime?: Date
): Promise<TransitResult[]>

// Get best route
async function getBestLynxRoute(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  preferredArrivalTime: Date
): Promise<TransitResult>
```

## Google Maps API Request
```typescript
const response = await mapsClient.directions({
  params: {
    origin: `${origin.lat},${origin.lng}`,
    destination: `${destination.lat},${destination.lng}`,
    mode: 'transit',
    transit_mode: ['bus'],
    arrival_time: Math.floor(arrivalTime.getTime() / 1000),
    alternatives: true,
    key: process.env.GOOGLE_MAPS_API_KEY
  }
})
```

## Response Parsing
Extract LYNX route information from transit steps:
```typescript
function parseTransitSteps(legs: DirectionsLeg[]): TransitResult {
  const transitSteps = legs[0].steps.filter(s => s.travel_mode === 'TRANSIT')

  return {
    duration_minutes: legs[0].duration.value / 60,
    routes: transitSteps.map(step => ({
      route_number: step.transit_details?.line.short_name,
      route_name: step.transit_details?.line.name,
      departure_stop: step.transit_details?.departure_stop.name,
      arrival_stop: step.transit_details?.arrival_stop.name,
      duration_minutes: step.duration.value / 60
    })),
    walking_minutes: legs[0].steps
      .filter(s => s.travel_mode === 'WALKING')
      .reduce((sum, s) => sum + s.duration.value / 60, 0),
    transfers: transitSteps.length - 1
  }
}
```

## LYNX Badge Component
```tsx
<LynxBadge
  transitTime={25}
  routes={['36', '50']}
  transfers={1}
/>

// Display: "🚌 25 min (Route 36 → 50)"
```

## Caching
- Cache transit times for 6 hours
- Key: `transit:{origin_hash}:{dest_hash}`
- Invalidate on schedule changes (daily)

## Acceptance Criteria
- [ ] Transit time calculated correctly
- [ ] LYNX route numbers extracted
- [ ] Walking time included
- [ ] Transfer count accurate
- [ ] Badge displays formatted info
- [ ] Caching reduces API calls
- [ ] Handles locations outside LYNX coverage
```

</details>

---

### Task 3.3: Daily Plan Generation

**Status**: 🔴 Not Started

<details>
<summary>📋 Claude Code Prompt</summary>

```
Implement the Daily Plan feature for Essential tier users.

## Context
Essential tier users get an AI-generated daily application plan with 8 jobs matching their constraints. The plan updates daily and tracks progress.

## Files to Create
1. `/src/app/api/daily-plan/route.ts` - GET/POST daily plan
2. `/src/app/api/daily-plan/generate/route.ts` - Generate new plan
3. `/src/lib/daily-plan-generator.ts` - Generation logic
4. `/src/components/dashboard/DailyPlanWidget.tsx` - UI widget
5. `/src/components/dashboard/DailyPlanJobCard.tsx` - Compact job card

## Database Table (Already in schema)
```sql
CREATE TABLE daily_plans (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  job_ids UUID[] NOT NULL,
  applied_count INT DEFAULT 0,
  total_count INT NOT NULL,
  generated_at TIMESTAMPTZ,
  generated_by TEXT DEFAULT 'ai'
);
```

## Generation Logic
```typescript
async function generateDailyPlan(userId: string): Promise<DailyPlan> {
  const user = await getUser(userId)
  const todayApplications = await getTodayApplications(userId)
  const target = 8 // Configurable 6-12

  // Search for matching jobs
  const jobs = await searchJobs({
    location: user.location,
    max_commute: user.max_commute_minutes,
    transportation: user.transportation,
    salary_min: user.salary_target.min,
    salary_max: user.salary_target.max,
    available_shifts: user.availability.preferred_shifts,
    scam_severity: ['LOW', 'MEDIUM'], // Exclude HIGH and CRITICAL
    posted_within: 7 // Last 7 days
  })

  // Filter out already applied jobs
  const newJobs = jobs.filter(j =>
    !todayApplications.some(a => a.job_id === j.id)
  )

  // Rank by match score
  const rankedJobs = rankJobsByMatch(newJobs, user)

  // Select top N jobs
  const todayJobs = rankedJobs.slice(0, target)

  return {
    date: new Date().toISOString().split('T')[0],
    target,
    completed: todayApplications.length,
    remaining: target - todayApplications.length,
    jobs: todayJobs,
    message: generateEncouragementMessage(todayApplications.length, target)
  }
}
```

## Ranking Algorithm
```typescript
function rankJobsByMatch(jobs: Job[], user: User): Job[] {
  return jobs.map(job => ({
    ...job,
    matchScore: calculateMatchScore(job, user)
  })).sort((a, b) => b.matchScore - a.matchScore)
}

function calculateMatchScore(job: Job, user: User): number {
  let score = 0

  // Salary match (0-30 points)
  if (job.salary_min >= user.salary_target.min) score += 30
  else if (job.salary_min >= user.salary_target.min * 0.9) score += 20

  // Commute match (0-25 points)
  if (job.transit_time <= user.max_commute_minutes * 0.5) score += 25
  else if (job.transit_time <= user.max_commute_minutes) score += 15

  // Valencia match (0-20 points)
  if (job.valencia_match_score > 80) score += 20
  else if (job.valencia_match_score > 50) score += 10

  // Recency (0-15 points)
  const daysOld = daysSince(job.posted_at)
  if (daysOld <= 1) score += 15
  else if (daysOld <= 3) score += 10
  else if (daysOld <= 7) score += 5

  // Scam safety (0-10 points)
  if (job.scam_severity === 'LOW') score += 10
  else if (job.scam_severity === 'MEDIUM') score += 5

  return score
}
```

## Encouragement Messages
```typescript
function generateEncouragementMessage(completed: number, target: number): string {
  if (completed === 0) return "Let's get started! Your first application is waiting."
  if (completed < target * 0.25) return "Great start! Keep the momentum going."
  if (completed < target * 0.5) return "You're doing amazing! Halfway there."
  if (completed < target * 0.75) return "Almost there! The finish line is in sight."
  if (completed < target) return "Just a few more! You've got this."
  return "🎉 You crushed it today! Well done."
}
```

## Widget UI
```
+------------------------------------------+
| 📋 Today's Plan                          |
| "Great start! Keep the momentum going."  |
+------------------------------------------+
| Progress: ████████░░ 6/8                 |
+------------------------------------------+
| [ ] Customer Service Rep - Target        |
|     $35K | 🚌 20 min | [Apply]           |
+------------------------------------------+
| [✓] Warehouse Associate - Amazon         |
|     Applied at 2:30 PM                   |
+------------------------------------------+
| [ ] Retail Sales - Best Buy              |
|     $32K | 🚌 25 min | [Apply]           |
+------------------------------------------+
| ... more jobs ...                        |
+------------------------------------------+
| [Regenerate Plan]  [Adjust Target: 8]    |
+------------------------------------------+
```

## API Endpoints
- GET `/api/daily-plan?date=2026-01-15` - Get plan for date
- POST `/api/daily-plan/generate` - Generate new plan
- PATCH `/api/daily-plan` - Update progress (mark applied)

## Acceptance Criteria
- [ ] Plan generated with 8 matching jobs
- [ ] Jobs ranked by match score
- [ ] Progress tracked as user applies
- [ ] Encouragement messages display
- [ ] Regenerate creates fresh plan
- [ ] Target adjustable (6-12 range)
- [ ] Plan persists for the day
- [ ] New plan auto-generated at midnight
```

</details>

---

### Task 3.4: Shadow Calendar

**Status**: 🔴 Not Started

<details>
<summary>📋 Claude Code Prompt</summary>

```
Implement the Shadow Calendar for commute time blocking and schedule management.

## Context
The Shadow Calendar prevents users from over-committing by automatically blocking commute time between shifts and detecting scheduling conflicts.

## Files to Create
1. `/src/app/api/shadow-calendar/route.ts` - CRUD for events
2. `/src/lib/shadow-calendar.ts` - Conflict detection logic
3. `/src/components/calendar/ShadowCalendar.tsx` - Calendar UI
4. `/src/components/calendar/CalendarEvent.tsx` - Event display
5. `/src/components/calendar/ConflictWarning.tsx` - Conflict alert

## Database Table (Already in schema)
```sql
CREATE TABLE shadow_calendar_events (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('shift', 'commute', 'interview', 'block')),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  job_id UUID,
  application_id UUID,
  interview_id UUID,
  transit_mode TEXT,
  lynx_route TEXT,
  transit_time_minutes INT,
  title TEXT,
  description TEXT
);
```

## Event Types
- **shift**: Work shift at a job
- **commute**: Auto-generated travel time
- **interview**: Scheduled interview
- **block**: User-defined unavailable time

## Auto-Commute Generation
When a shift or interview is added:
```typescript
async function addEventWithCommute(event: CalendarEvent): Promise<void> {
  const user = await getUser(event.user_id)

  // Calculate commute TO the event
  const commuteTo = await calculateTransitTime(
    user.location,
    event.location,
    event.start_time
  )

  // Create commute event before the shift/interview
  const commuteEvent: CalendarEvent = {
    type: 'commute',
    start_time: subMinutes(event.start_time, commuteTo.duration_minutes),
    end_time: event.start_time,
    transit_mode: user.transportation.uses_lynx ? 'lynx' : 'car',
    lynx_route: commuteTo.routes.map(r => r.route_number).join(' → '),
    transit_time_minutes: commuteTo.duration_minutes,
    title: `Commute to ${event.title}`
  }

  await db.insert('shadow_calendar_events', commuteEvent)
  await db.insert('shadow_calendar_events', event)
}
```

## Conflict Detection
```typescript
interface ConflictCheck {
  hasConflict: boolean
  conflicts: Array<{
    existingEvent: CalendarEvent
    overlapMinutes: number
    type: 'full' | 'partial'
  }>
}

function checkForConflicts(
  newEvent: CalendarEvent,
  existingEvents: CalendarEvent[]
): ConflictCheck {
  const conflicts = existingEvents.filter(existing =>
    eventsOverlap(newEvent, existing)
  ).map(existing => ({
    existingEvent: existing,
    overlapMinutes: calculateOverlap(newEvent, existing),
    type: isFullOverlap(newEvent, existing) ? 'full' : 'partial'
  }))

  return {
    hasConflict: conflicts.length > 0,
    conflicts
  }
}
```

## Calendar UI
Week view with time slots:
```
+------------------------------------------+
| < January 2026 >                         |
| Mon   Tue   Wed   Thu   Fri   Sat   Sun  |
+------------------------------------------+
| 6am                                      |
| 7am  [Commute]                           |
| 8am  [Shift: Target]                     |
| 9am  |           |                       |
| ...  |           |                       |
| 2pm  [End]       |                       |
| 3pm              [Interview: Indeed]     |
| 4pm                                      |
+------------------------------------------+
```

## Integration with Apply Copilot
Before showing "Apply" button:
```typescript
async function preflightCheck(job: Job, user: User): Promise<PreflightResult> {
  // Check if job shifts conflict with existing calendar
  const potentialShifts = job.shifts || getTypicalShifts(job.employment_type)

  const conflicts = await Promise.all(
    potentialShifts.map(shift =>
      checkForConflicts(shift, await getUserEvents(user.id))
    )
  )

  return {
    hasScheduleConflict: conflicts.some(c => c.hasConflict),
    conflictDetails: conflicts.filter(c => c.hasConflict)
  }
}
```

## API Endpoints
- GET `/api/shadow-calendar?start=DATE&end=DATE` - Get events for range
- POST `/api/shadow-calendar` - Create event (with auto-commute)
- PATCH `/api/shadow-calendar/:id` - Update event
- DELETE `/api/shadow-calendar/:id` - Delete event

## Acceptance Criteria
- [ ] Events display in calendar view
- [ ] Commute time auto-calculated
- [ ] Conflicts detected and shown
- [ ] Week/day view toggle
- [ ] Mobile responsive
- [ ] Integrates with job application flow
```

</details>

---

## Phase 4: Resume & AI Features (Weeks 7-8)

### Task 4.1: Resume Studio - Builder

**Status**: 🔴 Not Started

<details>
<summary>📋 Claude Code Prompt</summary>

```
Build the Resume Studio structured resume builder.

## Context
Resume Studio lets users build their resume section by section. No file upload - we generate evidence-based content from structured input.

## Files to Create
1. `/src/app/(dashboard)/dashboard/resume/page.tsx` - Main resume page
2. `/src/app/(dashboard)/dashboard/resume/edit/page.tsx` - Edit resume
3. `/src/components/resume/ResumeBuilder.tsx` - Multi-step builder
4. `/src/components/resume/ResumePreview.tsx` - Live preview
5. `/src/components/resume/sections/ContactSection.tsx`
6. `/src/components/resume/sections/SummarySection.tsx`
7. `/src/components/resume/sections/ExperienceSection.tsx`
8. `/src/components/resume/sections/EducationSection.tsx`
9. `/src/components/resume/sections/SkillsSection.tsx`
10. `/src/app/api/resume/route.ts` - CRUD endpoints
11. `/src/lib/resume-generator.ts` - Content generation

## Database Table (Already in schema)
```sql
CREATE TABLE resumes (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  summary TEXT,
  experience JSONB NOT NULL DEFAULT '[]',
  education JSONB NOT NULL DEFAULT '[]',
  skills TEXT[] DEFAULT '{}',
  ats_score INT,
  ats_keywords TEXT[],
  version INT DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  translated BOOLEAN DEFAULT false,
  valencia_highlighted BOOLEAN DEFAULT false,
  pdf_url TEXT,
  docx_url TEXT
);
```

## Experience Entry Structure
```typescript
interface ExperienceEntry {
  id: string
  company: string
  title: string
  location: string
  startDate: string // YYYY-MM
  endDate: string | 'present'
  description: string
  bullets: string[]
}
```

## Builder Flow
1. Contact Info (pre-filled from profile)
2. Summary (AI-assisted generation)
3. Experience (add/edit/reorder entries)
4. Education (pull from credentials)
5. Skills (suggest based on experience)
6. Review & Export

## Live Preview
Show formatted resume as user edits:
```
+-------------------+-------------------+
| BUILDER           | PREVIEW           |
|                   |                   |
| [Contact Form]    | JOHN DOE          |
|                   | john@email.com    |
| [Summary Input]   | 555-1234          |
|                   |                   |
| [Experience +]    | SUMMARY           |
|                   | Results-driven... |
| [Education]       |                   |
|                   | EXPERIENCE        |
| [Skills]          | Company A...      |
|                   |                   |
| [Export PDF]      | EDUCATION         |
|                   | Valencia College  |
+-------------------+-------------------+
```

## Valencia Credential Highlighting
Auto-detect Valencia credentials and format:
```typescript
function highlightValenciaCredentials(education: Education[]): Education[] {
  return education.map(edu => ({
    ...edu,
    isValencia: VALENCIA_PROGRAMS.some(p =>
      edu.institution.toLowerCase().includes('valencia')
    ),
    highlightText: edu.isValencia
      ? '⭐ Valencia College Graduate'
      : null
  }))
}
```

## API Endpoints
- GET `/api/resume` - Get user's active resume
- POST `/api/resume` - Create new resume
- PATCH `/api/resume/:id` - Update resume
- DELETE `/api/resume/:id` - Delete resume

## Acceptance Criteria
- [ ] Multi-step builder works
- [ ] Live preview updates in real-time
- [ ] Experience entries add/edit/delete/reorder
- [ ] Education pulls from user credentials
- [ ] Valencia credentials highlighted
- [ ] Data persists to database
- [ ] Mobile responsive
```

</details>

---

### Task 4.2: Resume Studio - ATS Optimization

**Status**: 🔴 Not Started

<details>
<summary>📋 Claude Code Prompt</summary>

```
Implement ATS (Applicant Tracking System) optimization for Resume Studio.

## Context
ATS optimization analyzes the resume against job descriptions, suggests keyword improvements, and provides an ATS compatibility score.

## Files to Create
1. `/src/app/api/resume/optimize/route.ts` - Optimization endpoint
2. `/src/lib/ats-optimizer.ts` - Optimization logic
3. `/src/components/resume/ATSScoreCard.tsx` - Score display
4. `/src/components/resume/KeywordSuggestions.tsx` - Keyword suggestions
5. `/src/components/resume/OptimizationModal.tsx` - Optimization flow

## ATS Score Calculation
```typescript
interface ATSScore {
  overall: number // 0-100
  breakdown: {
    keywords: number // 0-30
    formatting: number // 0-25
    sections: number // 0-20
    length: number // 0-15
    contact: number // 0-10
  }
  suggestions: ATSSuggestion[]
  keywords: {
    found: string[]
    missing: string[]
    recommended: string[]
  }
}

function calculateATSScore(resume: Resume, jobDescription?: string): ATSScore {
  const score = {
    keywords: calculateKeywordScore(resume, jobDescription),
    formatting: calculateFormattingScore(resume),
    sections: calculateSectionScore(resume),
    length: calculateLengthScore(resume),
    contact: calculateContactScore(resume)
  }

  return {
    overall: Object.values(score).reduce((a, b) => a + b, 0),
    breakdown: score,
    suggestions: generateSuggestions(resume, score),
    keywords: extractKeywords(resume, jobDescription)
  }
}
```

## Keyword Analysis
```typescript
// Common ATS keywords by industry
const KEYWORD_BANKS = {
  technology: ['Python', 'JavaScript', 'SQL', 'AWS', 'Agile', 'Git', ...],
  healthcare: ['HIPAA', 'EMR', 'Patient Care', 'Clinical', 'CPR', ...],
  business: ['Project Management', 'Excel', 'Analytics', 'Budget', ...],
  // ... more industries
}

function analyzeKeywords(
  resume: Resume,
  jobDescription: string
): KeywordAnalysis {
  const resumeText = extractResumeText(resume)
  const jobKeywords = extractKeywordsFromJob(jobDescription)

  return {
    found: jobKeywords.filter(kw => resumeText.includes(kw.toLowerCase())),
    missing: jobKeywords.filter(kw => !resumeText.includes(kw.toLowerCase())),
    recommended: suggestAdditionalKeywords(resume, jobDescription)
  }
}
```

## Formatting Checks
```typescript
function calculateFormattingScore(resume: Resume): number {
  let score = 25

  // Deductions
  if (hasSpecialCharacters(resume)) score -= 5
  if (hasTablesOrGraphics(resume)) score -= 5
  if (hasHeadersFooters(resume)) score -= 3
  if (hasMultipleColumns(resume)) score -= 5
  if (usesUncommonFonts(resume)) score -= 3

  return Math.max(0, score)
}
```

## Optimization Suggestions
```typescript
interface ATSSuggestion {
  type: 'keyword' | 'formatting' | 'content' | 'structure'
  priority: 'high' | 'medium' | 'low'
  section: string
  current: string
  suggested: string
  reason: string
}

// Example suggestions
const suggestions = [
  {
    type: 'keyword',
    priority: 'high',
    section: 'experience',
    current: 'Helped customers',
    suggested: 'Provided customer service',
    reason: 'ATS systems look for "customer service" as a keyword'
  },
  {
    type: 'formatting',
    priority: 'medium',
    section: 'contact',
    current: '📧 email@example.com',
    suggested: 'email@example.com',
    reason: 'Emojis can cause parsing errors in ATS systems'
  }
]
```

## Score Display Component
```
+------------------------------------------+
| ATS SCORE                                |
|                                          |
|         [======82======]                 |
|              82/100                      |
|                                          |
| ✓ Keywords: 24/30                        |
| ✓ Formatting: 22/25                      |
| ✓ Sections: 18/20                        |
| ○ Length: 10/15 (too short)              |
| ✓ Contact: 8/10                          |
|                                          |
| [Optimize Now]                           |
+------------------------------------------+
```

## One-Click Optimization
```typescript
async function autoOptimize(resume: Resume, jobDescription: string): Promise<Resume> {
  const analysis = await analyzeResume(resume, jobDescription)

  // Apply safe automatic fixes
  const optimized = {
    ...resume,
    summary: await enhanceSummary(resume.summary, analysis.keywords.missing),
    experience: await enhanceExperience(resume.experience, analysis.suggestions),
    skills: addMissingKeywords(resume.skills, analysis.keywords.missing)
  }

  return optimized
}
```

## API Endpoints
- POST `/api/resume/optimize` - Analyze and get suggestions
- POST `/api/resume/optimize/apply` - Apply optimizations

## Acceptance Criteria
- [ ] ATS score calculated correctly
- [ ] Keyword analysis against job description
- [ ] Suggestions generated with priorities
- [ ] Score breakdown displayed
- [ ] One-click optimization works
- [ ] Before/after comparison shown
- [ ] Score improves after optimization
```

</details>

---

### Task 4.3: Skills Translation Engine

**Status**: 🔴 Not Started

<details>
<summary>📋 Claude Code Prompt</summary>

```
Implement the Skills Translation Engine for Starter tier users.

## Context
Many users have retail/service experience but want office/tech jobs. Skills Translation transforms their experience language to match target industries.

## Files to Create
1. `/src/app/api/resume/translate/route.ts` - Translation endpoint
2. `/src/lib/skills-translator.ts` - Translation logic
3. `/src/components/resume/SkillsTranslator.tsx` - UI component
4. `/src/components/resume/TranslationPreview.tsx` - Before/after view
5. `/src/data/translation-mappings.ts` - Translation rules

## Translation Examples
```typescript
const TRANSLATIONS = {
  retail_to_office: [
    {
      before: 'Managed team of 5 associates during shifts',
      after: 'Supervised 5-person team, delegating tasks and monitoring performance metrics',
      skills_gained: ['Team Leadership', 'Performance Management', 'Delegation']
    },
    {
      before: 'Handled customer complaints',
      after: 'Resolved customer escalations, achieving 95% satisfaction rate',
      skills_gained: ['Conflict Resolution', 'Customer Relations', 'Problem Solving']
    },
    {
      before: 'Worked cash register',
      after: 'Processed high-volume transactions with 99.9% accuracy; reconciled daily receipts',
      skills_gained: ['Financial Accuracy', 'Attention to Detail', 'POS Systems']
    },
    {
      before: 'Stocked shelves',
      after: 'Managed inventory replenishment, optimizing stock levels and reducing shrinkage',
      skills_gained: ['Inventory Management', 'Process Optimization', 'Loss Prevention']
    }
  ],

  service_to_tech: [
    {
      before: 'Answered phones',
      after: 'Provided first-line technical support via multi-channel communication',
      skills_gained: ['Technical Support', 'Communication', 'Troubleshooting']
    },
    {
      before: 'Scheduled appointments',
      after: 'Coordinated scheduling using CRM software, managing 200+ client appointments weekly',
      skills_gained: ['CRM Software', 'Calendar Management', 'Client Coordination']
    }
  ]
}
```

## AI-Powered Translation
```typescript
async function translateBulletPoint(
  original: string,
  sourceIndustry: string,
  targetIndustry: string,
  context: string
): Promise<TranslationResult> {
  const prompt = `
    You are a professional resume writer specializing in career transitions.

    Original bullet point (${sourceIndustry}):
    "${original}"

    Target industry: ${targetIndustry}
    Context: ${context}

    Translate this to professional language for the target industry.
    - Keep it truthful (same responsibility, different words)
    - Add quantifiable metrics where reasonable
    - Use industry-standard terminology
    - Highlight transferable skills

    Return JSON:
    {
      "translated": "New bullet point",
      "skills_highlighted": ["skill1", "skill2"],
      "keywords_added": ["keyword1", "keyword2"]
    }
  `

  const response = await gemini.generate(prompt)
  return JSON.parse(response)
}
```

## Translation UI Flow
1. User selects source industry (Retail, Service, etc.)
2. User selects target industry (Tech, Healthcare, Office, etc.)
3. System shows current experience bullets
4. User clicks "Translate" on each bullet
5. Side-by-side comparison shown
6. User accepts or edits translations
7. "Apply All" updates resume

## Component Structure
```
+------------------------------------------+
| SKILLS TRANSLATION                       |
|                                          |
| From: [Retail ▼]  To: [Technology ▼]     |
+------------------------------------------+
| ORIGINAL                 | TRANSLATED    |
+------------------------------------------+
| Managed team of 5        | Supervised    |
| associates during        | 5-person team,|
| shifts                   | delegating... |
|                          |               |
| Skills: Team Leadership, Performance Mgmt|
|                          |               |
| [Accept] [Edit] [Skip]                   |
+------------------------------------------+
| Handled customer         | Resolved      |
| complaints               | customer...   |
+------------------------------------------+
| [Translate All]  [Apply to Resume]       |
+------------------------------------------+
```

## Industry Mappings
```typescript
const INDUSTRY_TRANSITIONS = {
  retail: ['office', 'tech', 'healthcare', 'finance'],
  service: ['tech', 'healthcare', 'office'],
  food_service: ['hospitality', 'healthcare', 'office'],
  warehouse: ['logistics', 'manufacturing', 'tech'],
  // ... more mappings
}
```

## API Endpoint
POST `/api/resume/translate`
```typescript
interface TranslateRequest {
  bullets: string[]
  sourceIndustry: string
  targetIndustry: string
  jobTitle?: string // Target job for context
}

interface TranslateResponse {
  translations: Array<{
    original: string
    translated: string
    skills: string[]
    keywords: string[]
    confidence: number
  }>
}
```

## Acceptance Criteria
- [ ] Industry selectors work
- [ ] Translation API returns quality results
- [ ] Before/after comparison displayed
- [ ] Individual accept/edit/skip per bullet
- [ ] "Apply All" updates resume
- [ ] Skills extracted and shown
- [ ] Mobile responsive
- [ ] Tier restriction (Starter+ only)
```

</details>

---

### Task 4.4: Career Coach (OSKAR Framework)

**Status**: 🔴 Not Started

<details>
<summary>📋 Claude Code Prompt</summary>

```
Implement the Career Coach AI assistant using the OSKAR coaching framework.

## Context
Career Coach provides supportive, structured guidance through job search challenges using the OSKAR framework (Outcome, Scaling, Know-how, Affirm+Action, Review).

## OSKAR Framework
- **O**utcome: What do you want to achieve?
- **S**caling: Rate current situation 1-10
- **K**now-how: What's worked before?
- **A**ffirm + Action: Celebrate progress, define next steps
- **R**eview: Check-in on goals

## Files to Create
1. `/src/app/(dashboard)/dashboard/coach/page.tsx` - Coach page
2. `/src/components/coach/CoachChat.tsx` - Chat interface
3. `/src/components/coach/CoachMessage.tsx` - Message bubble
4. `/src/components/coach/QuickActions.tsx` - Suggested prompts
5. `/src/app/api/coach/route.ts` - Chat endpoint
6. `/src/lib/career-coach.ts` - Coach logic
7. `/src/lib/coach-prompts.ts` - System prompts

## Coach Personas by Situation
```typescript
const COACH_MODES = {
  general: {
    name: 'Career Coach',
    systemPrompt: `You are a supportive career coach using the OSKAR framework...`
  },
  rejection: {
    name: 'Rejection Support',
    systemPrompt: `You specialize in helping job seekers process rejection...`,
    triggers: ['rejected', 'didn\'t get', 'turned down', 'no offer']
  },
  interview_prep: {
    name: 'Interview Coach',
    systemPrompt: `You help prepare candidates for job interviews...`,
    triggers: ['interview', 'preparing for', 'meeting with']
  },
  negotiation: {
    name: 'Negotiation Coach',
    systemPrompt: `You help job seekers negotiate offers effectively...`,
    triggers: ['offer', 'negotiate', 'salary', 'counter']
  }
}
```

## Rejection Support Flow
When user indicates rejection:
1. Acknowledge the disappointment (empathy)
2. Normalize the experience (statistics)
3. Extract learning (what went well?)
4. Reframe the situation (not a fit ≠ failure)
5. Action plan (next steps)

```typescript
const REJECTION_FLOW = {
  stage1_acknowledge: `
    I'm sorry to hear that. Rejection stings, and it's okay to feel disappointed.
    Take a moment - your feelings are valid.
  `,
  stage2_normalize: `
    Did you know the average job search takes 3-6 months and 100+ applications?
    You're not alone in this experience.
  `,
  stage3_extract: `
    Let's find the silver lining. What did you learn from this process?
    What would you do differently next time?
  `,
  stage4_reframe: `
    Remember: a "no" often means "not the right fit" - for both parties.
    This opens the door for a better opportunity.
  `,
  stage5_action: `
    Let's channel this energy forward. Would you like to:
    - Review your resume for improvements?
    - Practice interview questions?
    - Explore new job matches?
  `
}
```

## Chat Interface
```
+------------------------------------------+
| 💬 Career Coach                          |
+------------------------------------------+
| Coach: Hi! I'm here to support your job  |
| search journey. What's on your mind?     |
+------------------------------------------+
| You: I just got rejected from my dream   |
| job. Feeling really down.                |
+------------------------------------------+
| Coach: I'm sorry to hear that. Rejection |
| stings, especially for a role you really |
| wanted. Your disappointment is valid.    |
|                                          |
| Would you like to talk through what      |
| happened? Sometimes processing helps.    |
+------------------------------------------+
| Quick Actions:                           |
| [Review Resume] [Mock Interview]         |
| [Find New Jobs] [Just Vent]              |
+------------------------------------------+
| [Type a message...]              [Send]  |
+------------------------------------------+
```

## Proactive Triggers
Coach initiates contact when:
```typescript
const PROACTIVE_TRIGGERS = {
  // After 14 days with application in APPLIED status
  stale_application: {
    condition: (app) => daysSince(app.applied_at) > 14 && app.status === 'applied',
    message: `I noticed you applied to {company} 2 weeks ago. Would you like help following up?`
  },

  // After 3 consecutive rejections
  rejection_streak: {
    condition: (apps) => apps.filter(a => a.status === 'rejected').length >= 3,
    message: `I see you've had some tough news lately. How are you holding up?`
  },

  // No activity in 5 days
  inactivity: {
    condition: (user) => daysSince(user.last_activity) > 5,
    message: `Hey, I haven't seen you in a few days. Everything okay?`
  }
}
```

## AI Integration
```typescript
async function generateCoachResponse(
  userMessage: string,
  conversationHistory: Message[],
  userContext: UserContext
): Promise<string> {
  // Detect mode based on message content
  const mode = detectCoachMode(userMessage)

  const prompt = `
    ${COACH_MODES[mode].systemPrompt}

    User Context:
    - Tier: ${userContext.tier}
    - Applications: ${userContext.applicationCount}
    - Recent rejection: ${userContext.recentRejection}
    - Days in search: ${userContext.daysInSearch}

    Conversation:
    ${formatConversation(conversationHistory)}

    User: ${userMessage}

    Respond as a supportive coach using OSKAR framework where appropriate.
    Be warm, empathetic, and action-oriented.
  `

  return await gemini.generate(prompt)
}
```

## API Endpoint
POST `/api/coach`
```typescript
interface CoachRequest {
  message: string
  conversationId?: string
}

interface CoachResponse {
  message: string
  quickActions?: string[]
  mode: string
}
```

## Acceptance Criteria
- [ ] Chat interface works
- [ ] OSKAR framework applied
- [ ] Rejection support mode activates
- [ ] Quick actions displayed
- [ ] Conversation history maintained
- [ ] Proactive triggers fire appropriately
- [ ] Mobile responsive
- [ ] Warm, empathetic tone
```

</details>

---

## Phase 5: Application Tracking (Weeks 9-10)

### Task 5.1: Application Tracker

**Status**: 🟡 Partial (Basic page exists)

<details>
<summary>📋 Claude Code Prompt</summary>

```
Build the full Application Tracker with status management and timeline view.

## Context
The Application Tracker helps users manage their job applications through a state machine: DISCOVERED → POCKETED → APPLIED → INTERVIEWING → OFFER | REJECTED | ARCHIVED

## Current State
- Basic page exists at `/src/app/(dashboard)/dashboard/applications/page.tsx`
- Shows empty state placeholder

## Files to Create/Modify
1. `/src/app/(dashboard)/dashboard/applications/page.tsx` - Full tracker
2. `/src/components/applications/ApplicationList.tsx` - List view
3. `/src/components/applications/ApplicationKanban.tsx` - Kanban view (Starter+)
4. `/src/components/applications/ApplicationCard.tsx` - Application card
5. `/src/components/applications/ApplicationDetail.tsx` - Detail modal
6. `/src/components/applications/StatusBadge.tsx` - Status indicator
7. `/src/components/applications/Timeline.tsx` - Activity timeline
8. `/src/app/api/applications/route.ts` - CRUD endpoints
9. `/src/lib/application-state-machine.ts` - State transitions

## State Machine
```typescript
const APPLICATION_STATES = {
  discovered: {
    label: 'Discovered',
    color: 'gray',
    next: ['pocketed', 'archived']
  },
  pocketed: {
    label: 'Pocketed',
    color: 'blue',
    next: ['applied', 'archived']
  },
  applied: {
    label: 'Applied',
    color: 'yellow',
    next: ['interviewing', 'rejected', 'archived']
  },
  interviewing: {
    label: 'Interviewing',
    color: 'purple',
    next: ['offer_received', 'rejected', 'archived']
  },
  offer_received: {
    label: 'Offer',
    color: 'green',
    next: ['offer_accepted', 'rejected', 'archived']
  },
  offer_accepted: {
    label: 'Accepted',
    color: 'green',
    next: ['archived']
  },
  rejected: {
    label: 'Rejected',
    color: 'red',
    next: ['archived']
  },
  withdrawn: {
    label: 'Withdrawn',
    color: 'gray',
    next: ['archived']
  },
  archived: {
    label: 'Archived',
    color: 'gray',
    next: []
  }
}

function canTransition(from: string, to: string): boolean {
  return APPLICATION_STATES[from]?.next.includes(to) ?? false
}
```

## List View (Essential)
```
+------------------------------------------+
| Applications                    [Filter] |
+------------------------------------------+
| [All] [Applied] [Interviewing] [Offers]  |
+------------------------------------------+
| ● Customer Service Rep - Target          |
|   Applied 3 days ago                     |
|   $35K | 🚌 20 min                        |
|   [Update Status ▼]                      |
+------------------------------------------+
| ● Warehouse - Amazon                     |
|   Interviewing - Round 2 scheduled       |
|   $40K | 🚌 35 min                        |
|   [Update Status ▼]                      |
+------------------------------------------+
```

## Kanban View (Starter/Premium)
```
+----------+----------+----------+----------+
| Applied  | Interview| Offer    | Rejected |
+----------+----------+----------+----------+
| [Card]   | [Card]   | [Card]   | [Card]   |
| [Card]   | [Card]   |          | [Card]   |
| [Card]   |          |          |          |
+----------+----------+----------+----------+
```
- Drag and drop to change status
- Cards show key info

## Application Card
```typescript
interface ApplicationCardProps {
  application: Application
  job: Job
  onStatusChange: (newStatus: string) => void
  onViewDetails: () => void
}

// Display:
// - Job title & company
// - Current status badge
// - Days in current status
// - Key info (salary, commute)
// - Quick actions
```

## Timeline
```typescript
interface TimelineEvent {
  date: Date
  type: 'status_change' | 'note' | 'interview' | 'offer'
  title: string
  description?: string
}

// Example:
// ● Jan 15 - Applied via Indeed
// ● Jan 18 - Status: Interviewing
// ● Jan 20 - Phone screen with HR
// ● Jan 22 - Interview scheduled for Jan 25
```

## API Endpoints
- GET `/api/applications` - List user's applications
- POST `/api/applications` - Create application
- PATCH `/api/applications/:id` - Update status
- GET `/api/applications/:id/timeline` - Get timeline

## Acceptance Criteria
- [ ] List view shows all applications
- [ ] Filter tabs work (All, Applied, etc.)
- [ ] Status can be updated
- [ ] Kanban view for Starter+ (drag & drop)
- [ ] Timeline shows history
- [ ] Detail modal with full info
- [ ] Mobile responsive
```

</details>

---

### Task 5.2: Interview Scheduling & Prep

**Status**: 🔴 Not Started

<details>
<summary>📋 Claude Code Prompt</summary>

```
Build interview scheduling and preparation features.

## Context
When an application moves to "Interviewing" status, users need to schedule interviews and prepare with AI-generated questions and tips.

## Files to Create
1. `/src/app/(dashboard)/dashboard/interviews/page.tsx` - Interviews list
2. `/src/app/(dashboard)/dashboard/interviews/[id]/page.tsx` - Interview detail
3. `/src/components/interviews/InterviewScheduler.tsx` - Schedule form
4. `/src/components/interviews/InterviewPrep.tsx` - Preparation content
5. `/src/components/interviews/InterviewQuestions.tsx` - Question bank
6. `/src/components/interviews/MockInterview.tsx` - Practice mode
7. `/src/app/api/interviews/route.ts` - CRUD endpoints
8. `/src/app/api/interviews/prep/route.ts` - Generate prep content

## Interview Scheduling
```typescript
interface Interview {
  id: string
  application_id: string
  round: number
  type: 'phone' | 'video' | 'in_person' | 'panel' | 'technical'
  scheduled_at: Date
  duration_minutes: number
  location?: {
    address: string
    lat: number
    lng: number
  }
  video_link?: string
  interviewers: Array<{
    name: string
    title: string
    linkedin_url?: string
  }>
  prep_completed: boolean
  outcome?: 'passed' | 'failed' | 'pending'
}
```

## Scheduler UI
```
+------------------------------------------+
| Schedule Interview                       |
+------------------------------------------+
| Application: Customer Service - Target   |
+------------------------------------------+
| Round: [1 ▼]                             |
| Type: [Phone ▼] [Video] [In-Person]      |
| Date: [Jan 25, 2026]                     |
| Time: [2:00 PM]                          |
| Duration: [30 min ▼]                     |
+------------------------------------------+
| Location (if in-person):                 |
| [123 Main St, Orlando, FL]               |
| 🚌 LYNX: 25 min via Route 36             |
+------------------------------------------+
| Video Link (if video):                   |
| [https://zoom.us/j/...]                  |
+------------------------------------------+
| Interviewer(s):                          |
| [+ Add Interviewer]                      |
| • Sarah Johnson - HR Manager             |
+------------------------------------------+
| [Cancel]                    [Schedule]   |
+------------------------------------------+
```

## Interview Prep Generation
```typescript
async function generateInterviewPrep(
  job: Job,
  company: string,
  interviewType: string,
  userResume: Resume
): Promise<InterviewPrep> {
  const prompt = `
    Generate interview preparation for:
    - Job: ${job.title} at ${company}
    - Interview Type: ${interviewType}
    - User Background: ${summarizeResume(userResume)}

    Provide:
    1. Company research summary
    2. 10 likely interview questions with suggested answers
    3. 5 questions to ask the interviewer
    4. Key talking points from resume
    5. Common mistakes to avoid
    6. What to wear/bring
  `

  return await gemini.generate(prompt)
}
```

## Prep Content Display
```
+------------------------------------------+
| Interview Prep: Target - Jan 25          |
+------------------------------------------+
| ABOUT THE COMPANY                        |
| Target is a Fortune 500 retailer...      |
+------------------------------------------+
| LIKELY QUESTIONS                         |
|                                          |
| 1. "Tell me about yourself"              |
|    Suggested: Focus on customer service  |
|    experience and Valencia training...   |
|                                          |
| 2. "Why do you want to work at Target?"  |
|    Suggested: Mention their community    |
|    involvement and growth opportunities..|
+------------------------------------------+
| QUESTIONS TO ASK                         |
| • What does success look like in 90 days?|
| • What's the team culture like?          |
+------------------------------------------+
| YOUR TALKING POINTS                      |
| ✓ Valencia certification in IT Support   |
| ✓ 2 years customer service experience    |
| ✓ Bilingual (English/Spanish)            |
+------------------------------------------+
| [Start Mock Interview] [Mark as Prepped] |
+------------------------------------------+
```

## Mock Interview Mode
Simple Q&A practice:
1. Show question one at a time
2. User records or types answer
3. AI provides feedback
4. Track completion

## Integration with Shadow Calendar
When interview scheduled:
- Auto-add interview event
- Calculate commute time (if in-person)
- Block travel time before interview
- Send reminder notifications

## API Endpoints
- GET `/api/interviews` - List upcoming interviews
- POST `/api/interviews` - Schedule interview
- PATCH `/api/interviews/:id` - Update interview
- POST `/api/interviews/:id/prep` - Generate prep content
- POST `/api/interviews/:id/complete` - Mark outcome

## Acceptance Criteria
- [ ] Scheduler form works
- [ ] Interview types handled correctly
- [ ] LYNX time calculated for in-person
- [ ] Prep content generated
- [ ] Questions displayed with suggestions
- [ ] Mock interview mode works
- [ ] Calendar integration works
- [ ] Mobile responsive
```

</details>

---

## Phase 6: Payments & Launch (Weeks 11-12)

### Task 6.1: Stripe Subscription Integration

**Status**: 🔴 Not Started

<details>
<summary>📋 Claude Code Prompt</summary>

```
Implement Stripe subscription billing for the three-tier system.

## Context
Jalanea Works has three subscription tiers:
- Essential: $15/month
- Starter: $25/month
- Premium: $75/month

All with 7-day free trial.

## Files to Create
1. `/src/app/api/stripe/create-checkout/route.ts` - Create checkout session
2. `/src/app/api/stripe/create-portal/route.ts` - Customer portal
3. `/src/app/api/stripe/webhook/route.ts` - Handle Stripe events
4. `/src/lib/stripe.ts` - Stripe client
5. `/src/components/billing/PricingCards.tsx` - Tier selection
6. `/src/components/billing/SubscriptionStatus.tsx` - Current plan
7. `/src/components/billing/UpgradeModal.tsx` - Upgrade flow

## Environment Variables
```
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_PRICE_ESSENTIAL=price_...
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_PREMIUM=price_...
```

## Stripe Products Setup
Create in Stripe Dashboard:
```
Product: Jalanea Works Essential
- Price: $15/month (price_essential)
- Trial: 7 days

Product: Jalanea Works Starter
- Price: $25/month (price_starter)
- Trial: 7 days

Product: Jalanea Works Premium
- Price: $75/month (price_premium)
- Trial: 7 days
```

## Create Checkout Session
```typescript
// /src/app/api/stripe/create-checkout/route.ts
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: Request) {
  const { priceId, userId } = await request.json()

  // Get or create Stripe customer
  const user = await getUser(userId)
  let customerId = user.stripe_customer_id

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId }
    })
    customerId = customer.id
    await updateUser(userId, { stripe_customer_id: customerId })
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      trial_period_days: 7
    },
    success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing`
  })

  return Response.json({ url: session.url })
}
```

## Webhook Handler
```typescript
// /src/app/api/stripe/webhook/route.ts
export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  )

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutComplete(event.data.object)
      break
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object)
      break
    case 'customer.subscription.deleted':
      await handleSubscriptionCanceled(event.data.object)
      break
    case 'invoice.payment_succeeded':
      await handlePaymentSucceeded(event.data.object)
      break
    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object)
      break
  }

  return Response.json({ received: true })
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const amount = invoice.amount_paid / 100

  // Allocate revenue per mission
  const allocation = {
    operations: amount * 0.40,
    community_fund: amount * 0.30,
    expansion: amount * 0.20,
    scholarships: amount * 0.10
  }

  await db.insert('payments', {
    stripe_payment_intent_id: invoice.payment_intent,
    amount,
    ...allocation
  })

  await db.insert('community_fund_transactions', {
    date: new Date(),
    total_revenue: amount,
    ...allocation
  })
}
```

## Revenue Allocation (Per Mission)
Every dollar:
- 40% Operations
- 30% Community Fund
- 20% Expansion
- 10% Scholarships

## Pricing Cards UI
```
+------------------------------------------+
| Choose Your Plan                         |
+------------------------------------------+
| ESSENTIAL        STARTER        PREMIUM  |
| $15/mo           $25/mo         $75/mo   |
|                                          |
| ✓ Daily Plan     ✓ Everything   ✓ All    |
| ✓ Job Search       in Essential ✓ 5 Tier3|
| ✓ Scam Shield    ✓ Skills Trans   Pockets|
| ✓ Tier 1         ✓ Kanban View ✓ LinkedIn|
|   Pockets        ✓ 1 Tier 2      Mapping |
|                    Pocket/mo   ✓ Referral|
|                                  Paths   |
|                                          |
| [Start Trial]   [Start Trial] [Start]    |
+------------------------------------------+
| 7-day free trial on all plans            |
| 30% of revenue supports Orlando community|
+------------------------------------------+
```

## Acceptance Criteria
- [ ] Checkout redirects to Stripe
- [ ] Trial period works (7 days)
- [ ] Webhook handles all events
- [ ] User tier updates on subscription
- [ ] Revenue allocated correctly
- [ ] Customer portal for management
- [ ] Upgrade/downgrade works
- [ ] Cancellation handled
```

</details>

---

### Task 6.2: Community Fund Transparency

**Status**: 🔴 Not Started

<details>
<summary>📋 Claude Code Prompt</summary>

```
Build the Community Fund transparency dashboard.

## Context
Jalanea Works allocates 30% of revenue to a Community Fund for Orlando Valencia grad businesses. Full transparency is a core value.

## Revenue Allocation
- 40% Platform Operations
- 30% Community Fund (grants for Valencia grad businesses)
- 20% Expansion (replicate in other cities)
- 10% Scholarships (Pell Grant recipients)

## Files to Create
1. `/src/app/community-fund/page.tsx` - Public transparency page
2. `/src/components/community/FundOverview.tsx` - Fund stats
3. `/src/components/community/AllocationChart.tsx` - Pie chart
4. `/src/components/community/TransactionHistory.tsx` - Recent transactions
5. `/src/components/community/GrantRecipients.tsx` - Grant recipients
6. `/src/app/api/community-fund/route.ts` - Public stats endpoint

## Transparency Page
```
+------------------------------------------+
| 🌟 Community Fund                        |
| "Light the Block" - Keeping wealth local |
+------------------------------------------+
| TOTAL CONTRIBUTED                        |
|        $12,450                           |
| From 892 subscriptions since Jan 2026    |
+------------------------------------------+
| HOW EVERY DOLLAR IS SPLIT                |
|                                          |
|   [PIE CHART]                            |
|   40% Operations                         |
|   30% Community Fund                     |
|   20% Expansion                          |
|   10% Scholarships                       |
|                                          |
+------------------------------------------+
| COMMUNITY FUND BALANCE                   |
|        $3,735                            |
|                                          |
| Grants Awarded: 3                        |
| Total Disbursed: $2,500                  |
| Available for Grants: $1,235             |
+------------------------------------------+
| RECENT GRANTS                            |
|                                          |
| 🏪 Maria's Bakery - $1,000               |
|    Valencia Culinary '23                 |
|    "Starting my empanada business"       |
|                                          |
| 💻 TechStart Orlando - $1,000            |
|    Valencia IT '24                       |
|    "Launching web design services"       |
|                                          |
| 📱 AutoDetail Pro - $500                 |
|    Valencia Business '23                 |
|    "Mobile car detailing equipment"      |
+------------------------------------------+
| [Apply for Grant]                        |
+------------------------------------------+
```

## Database Queries
```typescript
// Get fund overview
async function getFundOverview() {
  const { data } = await supabase
    .from('community_fund_transactions')
    .select('community_fund_amount')

  const totalContributed = data.reduce(
    (sum, t) => sum + t.community_fund_amount, 0
  )

  const { data: grants } = await supabase
    .from('community_fund_grants')
    .select('amount_awarded')
    .eq('status', 'disbursed')

  const totalDisbursed = grants.reduce(
    (sum, g) => sum + g.amount_awarded, 0
  )

  return {
    totalContributed,
    totalDisbursed,
    availableBalance: totalContributed - totalDisbursed,
    grantCount: grants.length
  }
}
```

## Allocation Chart
Use Recharts pie chart:
```tsx
<PieChart>
  <Pie
    data={[
      { name: 'Operations', value: 40, fill: '#3b82f6' },
      { name: 'Community Fund', value: 30, fill: '#ffc425' },
      { name: 'Expansion', value: 20, fill: '#22c55e' },
      { name: 'Scholarships', value: 10, fill: '#a855f7' }
    ]}
  />
</PieChart>
```

## Grant Application Flow
1. User clicks "Apply for Grant"
2. Verify Valencia credential
3. Business description form
4. Amount requested (max $2,000)
5. Submit for review
6. Admin reviews and approves/denies
7. Funds disbursed

## API Endpoints
- GET `/api/community-fund` - Public stats
- GET `/api/community-fund/grants` - Public grant list
- POST `/api/community-fund/apply` - Submit grant application

## Acceptance Criteria
- [ ] Public page shows real numbers
- [ ] Pie chart displays allocation
- [ ] Grant recipients listed (with consent)
- [ ] Total contributed accurate
- [ ] Balance calculation correct
- [ ] Mobile responsive
- [ ] Updates in real-time
```

</details>

---

### Task 6.3: Final Polish & Accessibility

**Status**: 🔴 Not Started

<details>
<summary>📋 Claude Code Prompt</summary>

```
Perform final polish, accessibility audit, and launch preparation.

## Accessibility Requirements (WCAG 2.1 AA)

### Files to Audit/Update
- All page components
- All form components
- All interactive elements
- Navigation components
- Modal components

### Checklist

1. **Color Contrast**
   - Text: 4.5:1 minimum ratio
   - Large text: 3:1 minimum ratio
   - Interactive elements: 3:1 minimum

2. **Keyboard Navigation**
   - All interactive elements focusable
   - Visible focus indicators
   - Logical tab order
   - No keyboard traps
   - Skip links for main content

3. **Screen Reader Support**
   - Semantic HTML (headings, lists, etc.)
   - ARIA labels for icons/buttons
   - Form labels and error messages
   - Alt text for images
   - Live regions for dynamic content

4. **Forms**
   - Labels associated with inputs
   - Error messages linked to fields
   - Required fields indicated
   - Clear validation messages

5. **Motion**
   - Respect prefers-reduced-motion
   - No auto-playing content
   - Pause/stop controls for animations

## Files to Create
1. `/src/components/ui/SkipLink.tsx` - Skip to main content
2. `/src/components/ui/VisuallyHidden.tsx` - Screen reader only text
3. `/src/lib/accessibility.ts` - A11y utilities
4. `/src/hooks/useReducedMotion.ts` - Motion preference hook

## Skip Link
```tsx
// Add to layout
<SkipLink href="#main-content">Skip to main content</SkipLink>
```

## Focus Management
```tsx
// For modals
const modalRef = useRef<HTMLDivElement>(null)

useEffect(() => {
  if (isOpen) {
    modalRef.current?.focus()
    // Trap focus within modal
  }
}, [isOpen])
```

## Reduced Motion
```tsx
const prefersReducedMotion = useReducedMotion()

const animationProps = prefersReducedMotion
  ? {}
  : { initial: { opacity: 0 }, animate: { opacity: 1 } }
```

## Error Handling Polish

### Global Error Boundary
```tsx
// /src/components/ErrorBoundary.tsx
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />
    }
    return this.props.children
  }
}
```

### Toast Notifications
```tsx
// Consistent toast messages
toast.success('Application submitted!')
toast.error('Something went wrong. Please try again.')
toast.info('Your session will expire in 5 minutes.')
```

## Performance Optimization

1. **Image Optimization**
   - Use Next.js Image component
   - Lazy load below-fold images
   - Proper sizing and formats

2. **Code Splitting**
   - Dynamic imports for heavy components
   - Route-based splitting (automatic)

3. **Caching**
   - API response caching
   - Static asset caching headers
   - Service worker for offline support

## SEO Optimization

### Metadata
```tsx
// /src/app/layout.tsx
export const metadata = {
  title: 'Jalanea Works - Job Search for Orlando',
  description: 'Find jobs in Orlando with LYNX bus routes, scam protection, and AI-powered career coaching.',
  openGraph: {
    title: 'Jalanea Works',
    description: '...',
    images: ['/og-image.png']
  }
}
```

### Structured Data
```tsx
// Job posting schema
<script type="application/ld+json">
{JSON.stringify({
  "@context": "https://schema.org",
  "@type": "JobPosting",
  "title": job.title,
  "hiringOrganization": {
    "@type": "Organization",
    "name": job.company
  },
  "baseSalary": {
    "@type": "MonetaryAmount",
    "currency": "USD",
    "value": { "@type": "QuantitativeValue", "minValue": job.salary_min, "maxValue": job.salary_max }
  }
})}
</script>
```

## Launch Checklist

### Pre-Launch
- [ ] All features tested on preview URL
- [ ] Mobile responsive on iOS and Android
- [ ] Accessibility audit passed
- [ ] Error tracking configured (Sentry)
- [ ] Analytics configured (Plausible/GA)
- [ ] Terms of Service and Privacy Policy
- [ ] Cookie consent banner

### Launch Day
- [ ] Merge v2 → main
- [ ] Verify production deployment
- [ ] Test critical flows on production
- [ ] Monitor error rates
- [ ] Announce launch

## Acceptance Criteria
- [ ] WCAG 2.1 AA compliance
- [ ] Keyboard navigation works everywhere
- [ ] Screen reader tested
- [ ] Error boundary catches crashes
- [ ] Toast notifications consistent
- [ ] SEO metadata complete
- [ ] Performance score > 90
- [ ] All launch checklist items complete
```

</details>

---

## Appendix: Quick Reference

### Tech Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **AI**: Google Gemini Flash/Pro
- **Payments**: Stripe
- **Maps**: Google Maps Directions API

### Key Commands
```bash
# Development
npm run dev

# Build
npm run build

# Database migrations
npx supabase migration new <name>
npx supabase db push

# Seed data
npx tsx scripts/seed-career-data.ts

# Type checking
npx tsc --noEmit
```

### Environment Variables
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Google
GOOGLE_MAPS_API_KEY=

# Indeed
INDEED_PUBLISHER_ID=

# AI
GOOGLE_GEMINI_API_KEY=
```

### File Structure
```
jalanea-works/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   ├── (dashboard)/
│   │   ├── (onboarding)/
│   │   ├── (onboarding-v2)/
│   │   └── api/
│   ├── components/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── jobs/
│   │   ├── resume/
│   │   ├── onboarding-v2/
│   │   └── ui/
│   ├── lib/
│   ├── types/
│   ├── data/
│   └── contexts/
├── supabase/
│   └── migrations/
├── scripts/
├── docs/
└── public/
```
