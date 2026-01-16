# Build Plan Bug Report

> **Generated**: 2026-01-15
> **Source**: CLAUDE_CODE_BUILD_PLAN.md
> **Status**: Pending Review

---

## Overview

This document tracks bugs and issues found in the `CLAUDE_CODE_BUILD_PLAN.md` that need to be addressed before implementation.

| Severity | Count | Fixed |
|----------|-------|-------|
| Critical | 2 | 2 ✅ |
| High | 5 | 5 ✅ |
| Medium | 4 | 4 ✅ |
| **Total** | **11** | **11** |

---

## Critical Bugs

### BUG-001: Indeed API Does Not Exist

**Location**: Task 3.1 - Indeed API Integration (Line ~739)
**Status**: [x] FIXED (2026-01-15) - Replaced with JSearch API

**Problem**:
The plan references the Indeed Publisher API which was **deprecated and shut down in 2021**:
```typescript
// Plan says:
const response = await fetch('https://api.indeed.com/ads/apisearch')
// Docs reference: https://indeed.readme.io/docs
```

Indeed now requires partnership/affiliate agreements for programmatic job data access. The entire Task 3.1 is based on a non-existent API.

**Impact**: Cannot implement job search as designed. Core feature blocked.

**Recommended Fix**:
Replace with one of these alternatives:
1. **JSearch API** (RapidAPI) - $0-50/month, good coverage
2. **Adzuna API** - Free tier available, UK-based but covers US
3. **Google Jobs API** - Via SerpAPI or similar
4. **Jooble API** - Free, aggregates multiple sources
5. **RemoteOK/We Work Remotely APIs** - For remote jobs

**Action Items**:
- [ ] Research and select alternative job API
- [ ] Update Task 3.1 with correct API documentation
- [ ] Update environment variables section
- [ ] Update rate limiting strategy for chosen API

---

### BUG-002: Valencia Credential Highlighting Always Returns Null

**Location**: Task 4.1 - Resume Studio Builder (Line ~1383)
**Status**: [x] FIXED (2026-01-15) - Corrected variable reference

**Problem**:
```typescript
function highlightValenciaCredentials(education: Education[]): Education[] {
  return education.map(edu => ({
    ...edu,
    isValencia: VALENCIA_PROGRAMS.some(p =>
      edu.institution.toLowerCase().includes('valencia')
    ),
    highlightText: edu.isValencia  // BUG: References OLD edu object
      ? '⭐ Valencia College Graduate'
      : null
  }))
}
```

The `highlightText` property references `edu.isValencia` from the **original** education object (which doesn't have this property), not the newly computed `isValencia` value. This means `highlightText` will always be `null` or `undefined`.

**Impact**: Valencia graduates never get highlighted. Key differentiating feature broken.

**Correct Code**:
```typescript
function highlightValenciaCredentials(education: Education[]): Education[] {
  return education.map(edu => {
    const isValencia = VALENCIA_PROGRAMS.some(p =>
      edu.institution.toLowerCase().includes('valencia')
    )
    return {
      ...edu,
      isValencia,
      highlightText: isValencia ? '⭐ Valencia College Graduate' : null
    }
  })
}
```

**Action Items**:
- [ ] Update code example in Task 4.1
- [ ] Add unit test requirement for this function

---

## High Severity Bugs

### BUG-003: Missing Null Checks in Match Score Calculation

**Location**: Task 3.3 - Daily Plan Generation (Line ~1040)
**Status**: [x] FIXED (2026-01-15) - Added null checks to all property accesses

**Problem**:
```typescript
function calculateMatchScore(job: Job, user: User): number {
  let score = 0

  // All of these will crash if properties are null/undefined:
  if (job.salary_min >= user.salary_target.min) score += 30
  if (job.transit_time <= user.max_commute_minutes * 0.5) score += 25
  if (job.valencia_match_score > 80) score += 20
  // ...
}
```

No null/undefined guards on any property access. Jobs frequently have missing salary data, and new users may not have set all preferences.

**Impact**: Runtime crashes when processing jobs with incomplete data.

**Correct Code**:
```typescript
function calculateMatchScore(job: Job, user: User): number {
  let score = 0

  // Salary match (0-30 points)
  if (job.salary_min != null && user.salary_target?.min != null) {
    if (job.salary_min >= user.salary_target.min) score += 30
    else if (job.salary_min >= user.salary_target.min * 0.9) score += 20
  }

  // Commute match (0-25 points)
  if (job.transit_time != null && user.max_commute_minutes != null) {
    if (job.transit_time <= user.max_commute_minutes * 0.5) score += 25
    else if (job.transit_time <= user.max_commute_minutes) score += 15
  }

  // Valencia match (0-20 points)
  if (job.valencia_match_score != null) {
    if (job.valencia_match_score > 80) score += 20
    else if (job.valencia_match_score > 50) score += 10
  }

  // ... rest with similar guards
  return score
}
```

**Action Items**:
- [ ] Add null checks to all property accesses
- [ ] Document which fields are optional vs required

---

### BUG-004: Shadow Calendar Event Missing Required Fields

**Location**: Task 3.4 - Shadow Calendar (Line ~1183)
**Status**: [x] FIXED (2026-01-15) - Added id and user_id to commute event creation

**Problem**:
```typescript
const commuteEvent: CalendarEvent = {
  type: 'commute',
  start_time: subMinutes(event.start_time, commuteTo.duration_minutes),
  end_time: event.start_time,
  transit_mode: user.transportation.uses_lynx ? 'lynx' : 'car',
  lynx_route: commuteTo.routes.map(r => r.route_number).join(' → '),
  transit_time_minutes: commuteTo.duration_minutes,
  title: `Commute to ${event.title}`
  // MISSING: id, user_id
}
```

The database schema (Line ~1147) requires `id` and `user_id` fields, but they're not included in the commute event object.

**Impact**: Database insert will fail with constraint violation.

**Correct Code**:
```typescript
const commuteEvent: CalendarEvent = {
  id: crypto.randomUUID(),
  user_id: event.user_id,
  type: 'commute',
  start_time: subMinutes(event.start_time, commuteTo.duration_minutes),
  end_time: event.start_time,
  transit_mode: user.transportation.uses_lynx ? 'lynx' : 'car',
  lynx_route: commuteTo.routes.map(r => r.route_number).join(' → '),
  transit_time_minutes: commuteTo.duration_minutes,
  title: `Commute to ${event.title}`
}
```

**Action Items**:
- [ ] Add `id` and `user_id` to commute event creation
- [ ] Consider adding `job_id` or `application_id` reference

---

### BUG-005: Shadow Calendar Missing Return Commute

**Location**: Task 3.4 - Shadow Calendar (Line ~1172)
**Status**: [x] FIXED (2026-01-15) - Added return commute calculation for shifts

**Problem**:
```typescript
async function addEventWithCommute(event: CalendarEvent): Promise<void> {
  // Only calculates commute TO the event
  const commuteTo = await calculateTransitTime(
    user.location,
    event.location,
    event.start_time
  )
  // Creates commute event before shift
  // ... inserts commuteEvent and event

  // MISSING: Commute home after shift ends
}
```

The function only creates a commute TO the event. For shifts, users also need travel time blocked AFTER the shift to get home.

**Impact**: Calendar shows free time immediately after shifts when user is actually commuting home.

**Correct Code**:
```typescript
async function addEventWithCommute(event: CalendarEvent): Promise<void> {
  const user = await getUser(event.user_id)

  // Calculate commute TO the event
  const commuteTo = await calculateTransitTime(
    user.location,
    event.location,
    event.start_time
  )

  // Create commute event BEFORE the shift/interview
  const commuteToEvent: CalendarEvent = {
    id: crypto.randomUUID(),
    user_id: event.user_id,
    type: 'commute',
    start_time: subMinutes(event.start_time, commuteTo.duration_minutes),
    end_time: event.start_time,
    title: `Commute to ${event.title}`,
    // ... other fields
  }

  // Calculate commute HOME (only for shifts, not interviews)
  if (event.type === 'shift') {
    const commuteHome = await calculateTransitTime(
      event.location,
      user.location,
      event.end_time
    )

    const commuteHomeEvent: CalendarEvent = {
      id: crypto.randomUUID(),
      user_id: event.user_id,
      type: 'commute',
      start_time: event.end_time,
      end_time: addMinutes(event.end_time, commuteHome.duration_minutes),
      title: `Commute home from ${event.title}`,
      // ... other fields
    }

    await db.insert('shadow_calendar_events', commuteHomeEvent)
  }

  await db.insert('shadow_calendar_events', commuteToEvent)
  await db.insert('shadow_calendar_events', event)
}
```

**Action Items**:
- [ ] Add return commute calculation for shifts
- [ ] Decide if interviews should also have return commute

---

### BUG-006: Daily Plan Only Filters Today's Applications

**Location**: Task 3.3 - Daily Plan Generation (Line ~1010)
**Status**: [x] FIXED (2026-01-15) - Changed to filter ALL user applications using Set for efficiency

**Problem**:
```typescript
const todayApplications = await getTodayApplications(userId)
const newJobs = jobs.filter(j =>
  !todayApplications.some(a => a.job_id === j.id)
)
```

This only filters out jobs the user applied to TODAY. Jobs applied to yesterday or earlier will still appear in the daily plan.

**Impact**: Users see jobs they've already applied to, wasting their time and causing confusion.

**Correct Code**:
```typescript
// Get ALL user applications, not just today's
const allApplications = await getAllUserApplications(userId)
const appliedJobIds = new Set(allApplications.map(a => a.job_id))

const newJobs = jobs.filter(j => !appliedJobIds.has(j.id))
```

**Action Items**:
- [ ] Change `getTodayApplications` to `getAllUserApplications` or add `appliedJobIds` query
- [ ] Consider also filtering out archived/rejected jobs user has seen before

---

### BUG-007: JSON Parse Without Error Handling

**Location**: Task 4.3 - Skills Translation Engine (Line ~1692)
**Status**: [x] FIXED (2026-01-15) - Added try/catch, JSON extraction regex, and graceful fallback

**Problem**:
```typescript
async function translateBulletPoint(...): Promise<TranslationResult> {
  const prompt = `...Return JSON: { "translated": "...", ... }`

  const response = await gemini.generate(prompt)
  return JSON.parse(response)  // No try/catch!
}
```

LLMs can return malformed JSON, include explanatory text before/after JSON, or return completely different formats. This will crash.

**Impact**: Translation feature crashes unpredictably.

**Correct Code**:
```typescript
async function translateBulletPoint(
  original: string,
  sourceIndustry: string,
  targetIndustry: string,
  context: string
): Promise<TranslationResult> {
  const prompt = `...`

  try {
    const response = await gemini.generate(prompt)

    // Try to extract JSON from response (handles text before/after JSON)
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }

    const parsed = JSON.parse(jsonMatch[0])

    // Validate required fields
    if (!parsed.translated) {
      throw new Error('Missing translated field')
    }

    return {
      translated: parsed.translated,
      skills_highlighted: parsed.skills_highlighted || [],
      keywords_added: parsed.keywords_added || []
    }
  } catch (error) {
    console.error('Translation parsing failed:', error, response)
    // Return original as fallback
    return {
      translated: original,
      skills_highlighted: [],
      keywords_added: [],
      error: 'Translation failed - showing original'
    }
  }
}
```

**Action Items**:
- [ ] Add try/catch around all JSON.parse calls
- [ ] Add JSON extraction regex for LLM responses
- [ ] Add fallback behavior when parsing fails

---

## Medium Severity Bugs

### BUG-008: Encouragement Message Shows Wrong Progress

**Location**: Task 3.3 - Daily Plan Generation (Line ~1074)
**Status**: [x] FIXED (2026-01-15) - Fixed threshold logic with proper progress calculation

**Problem**:
```typescript
function generateEncouragementMessage(completed: number, target: number): string {
  if (completed === 0) return "Let's get started!..."
  if (completed < target * 0.25) return "Great start!..."
  if (completed < target * 0.5) return "You're doing amazing! Halfway there."  // BUG
  if (completed < target * 0.75) return "Almost there!..."
  // ...
}
```

The message says "Halfway there" when user is LESS than 50% complete. If target is 8 and completed is 3, user is at 37.5% but sees "Halfway there."

**Impact**: Misleading progress feedback. Minor UX issue.

**Correct Code**:
```typescript
function generateEncouragementMessage(completed: number, target: number): string {
  const progress = completed / target

  if (completed === 0) return "Let's get started! Your first application is waiting."
  if (progress < 0.25) return "Great start! Keep the momentum going."
  if (progress < 0.5) return "Making progress! Keep it up."
  if (progress < 0.75) return "Halfway there! You're doing amazing."
  if (progress < 1) return "Almost there! The finish line is in sight."
  return "🎉 You crushed it today! Well done."
}
```

**Action Items**:
- [ ] Fix threshold logic
- [ ] Consider using percentage-based thresholds for clarity

---

### BUG-009: Remaining Count Can Be Negative

**Location**: Task 3.3 - Daily Plan Generation (Line ~1024)
**Status**: [x] FIXED (2026-01-15) - Added Math.max(0, ...) guard and bonus field for overachievers

**Problem**:
```typescript
return {
  date: new Date().toISOString().split('T')[0],
  target,
  completed: todayApplications.length,
  remaining: target - todayApplications.length,  // Can be negative!
  // ...
}
```

If user applies to more jobs than target (e.g., 10 applications when target is 8), `remaining` becomes -2.

**Impact**: UI might display "-2 remaining" or cause rendering issues.

**Correct Code**:
```typescript
remaining: Math.max(0, target - todayApplications.length),
```

**Action Items**:
- [ ] Add Math.max(0, ...) guard
- [ ] Consider showing "bonus" applications when exceeding target

---

### BUG-010: Application State Machine Too Restrictive

**Location**: Task 5.1 - Application Tracker (Line ~2013)
**Status**: [x] FIXED (2026-01-15) - Added 'applied' to discovered's next states, 'interviewing' to rejected for callbacks

**Problem**:
```typescript
const APPLICATION_STATES = {
  discovered: {
    next: ['pocketed', 'archived']  // Cannot go directly to 'applied'
  },
  // ...
}
```

Users must go `discovered → pocketed → applied`. Cannot skip the pocket step for quick applications.

**Impact**: Forces unnecessary workflow for users who want to apply directly without generating a pocket.

**Recommended Fix**:
```typescript
discovered: {
  next: ['pocketed', 'applied', 'archived']  // Allow direct apply
},
```

**Action Items**:
- [ ] Add 'applied' to discovered's next states
- [ ] Consider if other transitions should be added (e.g., rejected → interviewing for callbacks)

---

### BUG-011: Scam Shield False Positives for Crypto Jobs

**Location**: Task 2.5 - Scam Shield (Line ~636)
**Status**: [x] FIXED (2026-01-15) - Moved to contextual check with company whitelist and role detection

**Problem**:
```typescript
const CRITICAL_RULES = [
  { id: 'cryptocurrency', pattern: /(bitcoin|crypto|btc|ethereum)/i },
  // ...
]
```

This marks ANY job mentioning cryptocurrency as CRITICAL (auto-blocked). Legitimate blockchain developer, fintech, and crypto exchange jobs would be hidden.

**Impact**: Blocks legitimate high-paying tech jobs.

**Recommended Fix**:
```typescript
// Move from CRITICAL to contextual check
const MEDIUM_RULES = [
  {
    id: 'cryptocurrency_mention',
    pattern: /(bitcoin|crypto|btc|ethereum)/i,
    // Only flag if combined with payment language
    contextCheck: (job) => {
      const text = `${job.title} ${job.description}`.toLowerCase()
      const hasCrypto = /(bitcoin|crypto|btc|ethereum)/i.test(text)
      const hasPayment = /(pay|send|deposit|invest)/i.test(text)
      return hasCrypto && hasPayment && !isLegitCryptoCompany(job.company)
    }
  },
]

// Whitelist known legitimate crypto companies
const LEGIT_CRYPTO_COMPANIES = ['coinbase', 'kraken', 'binance', 'blockchain.com', ...]
```

**Action Items**:
- [ ] Move cryptocurrency check from CRITICAL to contextual
- [ ] Add company whitelist for known crypto employers
- [ ] Consider job title context (e.g., "Blockchain Developer" is legitimate)

---

## Summary Checklist

### Critical (Must Fix Before Implementation)
- [x] BUG-001: Replace Indeed API with working alternative ✅ FIXED
- [x] BUG-002: Fix Valencia highlighting logic ✅ FIXED

### High (Fix Before Feature Release)
- [x] BUG-003: Add null checks to match score calculation ✅ FIXED
- [x] BUG-004: Add missing fields to calendar events ✅ FIXED
- [x] BUG-005: Add return commute to shadow calendar ✅ FIXED
- [x] BUG-006: Filter all applications, not just today's ✅ FIXED
- [x] BUG-007: Add error handling for JSON parsing ✅ FIXED

### Medium (Fix When Convenient)
- [x] BUG-008: Fix encouragement message thresholds ✅ FIXED
- [x] BUG-009: Prevent negative remaining count ✅ FIXED
- [x] BUG-010: Allow direct discovered → applied transition ✅ FIXED
- [x] BUG-011: Reduce false positives in scam detection ✅ FIXED

---

## Notes

- Line numbers reference `CLAUDE_CODE_BUILD_PLAN.md` as of 2026-01-14
- Some bugs may already be fixed in actual implementation (check codebase)
- Priority: Critical → High → Medium

---

*Document created: 2026-01-15*
*Last updated: 2026-01-15*
*Critical bugs fixed: 2026-01-15*
*High severity bugs fixed: 2026-01-15*
*Medium severity bugs fixed: 2026-01-15*
*All bugs resolved: 2026-01-15* ✅
