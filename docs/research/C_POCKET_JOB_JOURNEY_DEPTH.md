# C. Pocket + Job Journey Depth

Research document for the Job Pocket system and journey depth model in Jalanea Works.

---

## 1. Goal of This Section

**Success looks like:**
- User saves a job → clearly understands what "pocket" means and what happens next
- Pocket depth (Survival/Bridge/Career) matches user's actual intent and available time
- User with 3+ saved jobs doesn't feel overwhelmed; clear prioritization
- Transition from "Saved" → "Queue" → "Apply Co-Pilot" is obvious, not confusing
- Career-depth users complete prep steps without abandoning; Survival users aren't slowed down unnecessarily

**Anti-goals:**
- Pocket becomes a graveyard of forgotten jobs
- Users save 50 jobs but apply to none (hoarding behavior)
- Career-depth checklist feels like homework, causes abandonment
- Survival users shown unnecessary friction (prep steps they'll skip anyway)
- Status tracking becomes tedious rather than helpful

---

## 2. What "Pocket" Means (User Mental Model)

### Definition for Users

A **Pocket** is a container where you keep a job you're interested in. Think of it like putting a job listing in your jacket pocket to deal with later.

### Mental Model Variations

| User Says | What They Mean | System Maps To |
|-----------|----------------|----------------|
| "I saved this job" | I want to remember it | Saved view (no depth assigned yet) |
| "I'm ready to apply" | I want to work on this now | Queue (pocket with depth assigned) |
| "I applied already" | It's done, track the outcome | Tracker (status: applied) |
| "This is my dream job" | I want to prepare thoroughly | Career pocket [▪▪▪] |
| "I just need any job" | Speed matters more than fit | Survival pocket [▪○○] |

### The Pocket Lifecycle

```
DISCOVER → SAVE → QUEUE → APPLY → TRACK → ARCHIVE/REFLECT

  │         │       │        │        │         │
  │         │       │        │        │         └─ Outcome known
  │         │       │        │        └─ Waiting for response
  │         │       │        └─ Application submitted
  │         │       └─ Ready to apply (depth assigned)
  │         └─ Interested, not committed
  └─ Just browsing
```

### What a Pocket Contains [INTERNAL - from PRODUCT_SPEC_V1.md]

| Content | Survival [▪○○] | Bridge [▪▪○] | Career [▪▪▪] |
|---------|----------------|--------------|--------------|
| Job link + basics | ✓ | ✓ | ✓ |
| Safety/scam check | ✓ | ✓ | ✓ |
| Prep checklist | None or 1 item | 3 items | 5+ items |
| Company research | No | Skim | Full |
| Skills match | No | Yes | Yes + gap analysis |
| Keywords to use | No | Yes | Yes |
| Cover letter draft | No | Optional | Recommended |
| Interview prep | No | No | Yes |
| Schedule tasks | No | Optional | Recommended |

---

## 3. User Mindsets + Constraints

### Mindsets (managing Pocket)

| Mindset | Emotional State | Primary Need | Behavior Pattern |
|---------|-----------------|--------------|------------------|
| **Desperate Hoarder** | Anxious, scarcity mindset | "Save everything, figure it out later" | Saves many jobs, rarely returns to them |
| **Methodical Planner** | Organized, deliberate | "I want to prepare before applying" | Uses checklists, schedules prep time |
| **Impulsive Applier** | Impatient, action-oriented | "Just let me apply already" | Skips prep, wants direct path to application |
| **Overwhelmed Pauser** | Frozen, decision paralysis | "I have too many saved, don't know where to start" | Needs guidance on prioritization |
| **Serial Tracker** | Detail-oriented, systematic | "I need to know status of everything" | Wants dashboards, status updates, reminders |

### Constraints

| Constraint | Impact | Design Response |
|------------|--------|-----------------|
| **Limited working memory** | Can't track 10+ applications mentally | Show clear counts, statuses, next actions [EXTERNAL][1] |
| **Variable time availability** | Some days have 10 min, some have 2 hours | Depth system matches available time to prep level |
| **Rejection sensitivity** | Past failures make tracking painful | Frame tracking as progress, not judgment |
| **Notification overload** | Too many reminders → ignore all | Opt-in reminders, limit frequency, batch by urgency |
| **Shared device / privacy** | Can't leave detailed job search visible | Easy logout, guest mode, minimal visible PII |

---

## 4. Decision Points (10+)

### DP1: Save vs Add to Queue - "What does Save mean?"

**Choices:**
1. Tap Save → expect it's ready to apply
2. Tap Save → understand it's just bookmarking
3. Tap Add to Queue → understand it's committing to apply
4. Confused by difference, do nothing

**Outcomes:**
- Good: Clear distinction; Save = bookmark, Queue = commit
- Bad: Save and Queue feel identical → user confusion

**v1 Default:** Save adds to Saved view (no depth). "Add to Queue" prompts mode selection and assigns depth. Toast explains difference: "Saved! Move to Queue when ready to apply." [ASSUMPTION]

---

### DP2: Choosing Pocket Depth - "How much prep do I need?"

**Choices:**
1. System auto-assigns based on mode
2. User overrides depth manually
3. User doesn't understand depths, accepts default
4. User always picks lowest depth to avoid work

**Outcomes:**
- Good: Depth matches both job type AND user's available time
- Bad: Mismatch causes either wasted prep (Survival job, Career depth) or under-preparation (Career job, Survival depth)

**v1 Default:** Auto-assign based on user's mode. Show brief explanation: "This is a [Bridge] job. Expect ~20 min prep." Allow override via depth selector. [ASSUMPTION]

---

### DP3: Viewing the Queue - "What should I work on next?"

**Choices:**
1. Work on oldest queued job
2. Work on job with soonest deadline
3. Work on easiest (Survival depth)
4. Work on most important (Career depth)
5. Feel overwhelmed, don't choose

**Outcomes:**
- Good: Clear prioritization signal (deadline, urgency, depth)
- Bad: Flat list with no guidance → paralysis

**v1 Default:** Sort queue by: (1) Deadlines first, (2) Then by queue date. Show "Suggested next" card highlighting one job. Offer "Quick win" filter for Survival pockets. [ASSUMPTION]

---

### DP4: Starting Prep Checklist - "Do I have to do all this?"

**Choices:**
1. Complete all checklist items
2. Complete some, skip others
3. Skip entire checklist, go to Apply Sprint
4. Abandon because checklist feels too long

**Outcomes:**
- Good: User understands checklist is guidance, not gate. Can skip with awareness.
- Bad: Checklist blocks Apply → friction; Checklist ignored → under-preparation

**v1 Default:** Show checklist as recommended, not required. "Skip remaining prep" button always visible. Track completion % but don't gate Apply Sprint on it. [ASSUMPTION]

---

### DP5: Adding to Schedule - "Should I plan my prep?"

**Choices:**
1. Add prep tasks to schedule with dates
2. Do prep now without scheduling
3. Ignore schedule feature entirely
4. Add everything to schedule but never follow through

**Outcomes:**
- Good: Scheduled tasks surface on Dashboard, keep user on track
- Bad: Scheduled tasks become noise; user ignores them

**v1 Default:** For Career pockets only, prompt: "This job needs ~2 hours prep. Add to schedule?" Make it optional, not default. Survival/Bridge pockets don't prompt scheduling. [ASSUMPTION]

---

### DP6: Multiple Jobs in Flight - "How many should I work on?"

**Choices:**
1. Focus on one job at a time
2. Batch similar jobs (all Survival together)
3. Spread applications across modes
4. Apply to everything simultaneously
5. Hoard jobs, apply to none

**Outcomes:**
- Good: User applies at sustainable pace without burnout
- Bad: Too many in-progress → nothing completed; too few → pipeline empty

**v1 Default:** No hard limit, but Dashboard shows "You have X jobs in queue" with guidance: "Focus tip: Complete 1-2 applications before adding more to queue." [ASSUMPTION]

---

### DP7: Status Updates - "Did I hear back?"

**Choices:**
1. User updates status promptly
2. User forgets, status becomes stale
3. User gets prompt (follow-up reminder), updates
4. User archives without updating

**Outcomes:**
- Good: Accurate status → useful tracker
- Bad: Stale data → tracker becomes useless

**v1 Default:** After 7 days with status "Applied", show gentle prompt: "Any update on [Job]?" Options: Interview / Rejected / Nothing yet / Archive. Don't require update to use app. [EXTERNAL][2]

---

### DP8: Handling Rejection - "I got rejected, now what?"

**Choices:**
1. Update status, reflect on what to improve
2. Update status, ignore reflection
3. Delete/archive without reflection
4. Never update, leave as "Applied" forever

**Outcomes:**
- Good: Reflection helps user improve over time
- Bad: Rejection tracking feels punishing → user avoids tracker

**v1 Default:** When status → "Rejected", show optional reflection: "What happened? (optional)" + "Next steps" templates. Frame as learning, not failure. Don't require reflection to proceed. [ASSUMPTION]

---

### DP9: Pocket Cleanup - "I have too many old jobs"

**Choices:**
1. Manually archive old jobs
2. System suggests archival for stale jobs
3. Let pockets pile up, ignore problem
4. Delete everything, start fresh

**Outcomes:**
- Good: Pocket stays relevant, not cluttered
- Bad: 50+ stale pockets → overwhelm, uselessness

**v1 Default:** After 30 days in Queue with no progress, prompt: "Still interested in [Job]? [Keep] [Archive]". After 60 days in Tracker with no update, auto-archive with notification. [ASSUMPTION]

---

### DP10: Handoff to Apply Co-Pilot - "I'm ready to apply"

**Choices:**
1. Tap "Start Co-Pilot" from Queue
2. Complete all prep first, then start
3. Skip prep, go directly to Apply Sprint
4. Get confused about where to apply

**Outcomes:**
- Good: Seamless transition; user knows they're now in "execution mode"
- Bad: User loses context; unclear what "Start Co-Pilot" does

**v1 Default:** "Start Co-Pilot" button on every queued job. Opens Apply Co-Pilot at Stage 1 (Understand). Can skip to Stage 3 (Apply Sprint) if prep done. [INTERNAL - from PRODUCT_SPEC_V1.md]

---

### DP11: Reminders - "Will this app nag me?"

**Choices:**
1. Receive reminders, find them helpful
2. Receive reminders, find them annoying
3. Disable reminders, forget about jobs
4. Never opted into reminders

**Outcomes:**
- Good: Right frequency, right timing → helpful nudges
- Bad: Too many → notification fatigue; too few → app forgotten

**v1 Default:** Reminders off by default. Opt-in during onboarding or per-job: "Remind me about this job?" Limit to 2 reminders/week max. [ASSUMPTION]

---

### DP12: Cross-Device Sync - "I started on my phone, now I'm on laptop"

**Choices:**
1. Log in, see same pockets on both devices
2. Log in, pockets don't sync (data loss)
3. Guest mode, no sync (expected)
4. Confused about what syncs

**Outcomes:**
- Good: Account users see same data everywhere
- Bad: Guest users lose data → frustration; Sync lag → confusion

**v1 Default:** Account required for cross-device sync. Guest data lives in localStorage only. Clear messaging: "Create account to access your pockets on any device." [ASSUMPTION]

---

## 5. Job Journey Depth Model

### Overview

Pocket depth determines how much preparation guidance the system provides. Depth is assigned based on user's Strategy Mode but can be overridden.

### Survival Depth [▪○○]

**User mindset:** "I need income NOW."

**Jobs that fit:** Fast-food, retail, warehouse, gig work, seasonal

| Aspect | Specification |
|--------|---------------|
| **Prep time expected** | 5-10 minutes |
| **Data we track** | Job basics (title, company, location, pay), applied date, status |
| **Steps we guide** | Skim job → Vault check → Apply |
| **Checklist items** | 0-1 items ("Skim the job posting") |
| **Schedule integration** | None |
| **Company research** | None shown |
| **Interview prep** | None shown |
| **Required before Apply** | Nothing required |
| **Optional before Apply** | Read full posting |

**UX principle:** Get out of the way. Speed is the value prop. [ASSUMPTION]

---

### Bridge Depth [▪▪○]

**User mindset:** "I want stability while building toward more."

**Jobs that fit:** Admin assistant, customer service, entry-level office, healthcare support

| Aspect | Specification |
|--------|---------------|
| **Prep time expected** | 15-30 minutes |
| **Data we track** | Job basics + skills match + keywords + application notes |
| **Steps we guide** | Read posting → Note keywords → Review resume fit → Vault check → Apply |
| **Checklist items** | 3 items |
| **Schedule integration** | Optional ("Add prep to schedule") |
| **Company research** | Brief overview if available |
| **Interview prep** | None by default |
| **Required before Apply** | Nothing required (checklist recommended) |
| **Optional before Apply** | Complete checklist, tailor resume section |

**UX principle:** Balance speed and preparation. Show value of prep without forcing it. [ASSUMPTION]

---

### Career Depth [▪▪▪]

**User mindset:** "This is my goal job. Worth investing time."

**Jobs that fit:** Entry-level professional (0-2 yrs), internships in target field, growth-track roles

| Aspect | Specification |
|--------|---------------|
| **Prep time expected** | 1-2 hours |
| **Data we track** | Full job data + company research + interview prep + networking notes + application timeline |
| **Steps we guide** | Research company → Map skills to requirements → Draft cover letter → Prep interview answers → Identify networking → Vault check → Apply |
| **Checklist items** | 5+ items |
| **Schedule integration** | Recommended ("Schedule your prep over 2-3 days?") |
| **Company research** | Full (mission, culture, news, size, funding) |
| **Interview prep** | Likely questions + answer frameworks |
| **Required before Apply** | Nothing required (but strongly encouraged) |
| **Optional before Apply** | Cover letter, networking outreach, informational interview |

**UX principle:** This is worth the investment. Make thorough prep feel achievable, not overwhelming. [ASSUMPTION]

---

### Depth Comparison Table

| Aspect | Survival [▪○○] | Bridge [▪▪○] | Career [▪▪▪] |
|--------|----------------|--------------|--------------|
| Time | 5-10 min | 15-30 min | 1-2 hours |
| Checklist | 0-1 items | 3 items | 5+ items |
| Research | None | Brief | Comprehensive |
| Resume tailoring | None | Highlight sections | Full tailor |
| Cover letter | Not needed | Optional | Recommended |
| Interview prep | None | None | Yes |
| Schedule tasks | No | Optional | Recommended |
| Networking | No | No | Suggested |
| Status tracking | Basic | Standard | Detailed |

---

## 6. Solutions / UX Patterns

### Pattern 1: Job Status Tracking

**Statuses:**
```
Saved → Queued → In Progress → Applied → [Interview | Rejected | Offer | Ghosted | Archived]
```

| Status | Meaning | Auto-transition? |
|--------|---------|------------------|
| Saved | Bookmarked, no commitment | No |
| Queued | Ready to apply, depth assigned | User action |
| In Progress | Started Apply Co-Pilot | Auto on "Start Co-Pilot" |
| Applied | Submitted application | User confirms |
| Interview | Got interview | User updates |
| Rejected | Got rejection | User updates |
| Offer | Got offer | User updates |
| Ghosted | No response after 14+ days | System suggests |
| Archived | No longer tracking | User action or auto after 60 days |

**Pros:** Clear lifecycle, enables reporting
**Cons:** More statuses = more cognitive load

**v1 Default:** Show simplified statuses to user (Saved / Queued / Applied / Outcome). Track detailed states internally. [ASSUMPTION]

---

### Pattern 2: Reminders - Opt-In, Bounded

**Options:**
1. No reminders (default)
2. Follow-up reminders only (7 days after apply)
3. Deadline reminders (day before scheduled task)
4. Daily digest ("You have 3 jobs to work on")

**Pros:** Keeps users engaged without overwhelming
**Cons:** Reminders can feel like nagging; ignored reminders waste system resources

**v1 Default:** All reminders opt-in. Max 2 per week. Unsubscribe link in every reminder. Dashboard shows pending actions even without push notifications. [ASSUMPTION]

---

### Pattern 3: One Job at a Time vs Many at Once

**Trade-offs:**

| Approach | Pros | Cons |
|----------|------|------|
| **One at a time** | Focus, completion | Slow pipeline, risk if rejected |
| **Many at once** | Speed, parallel chances | Overwhelm, lower quality per app |
| **Batched by depth** | Efficiency (do all Survival together) | Switching cost between modes |

**Research insight:** Job seekers who apply to 10-15 jobs per week have higher success rates than those who apply to 50+ (quality vs quantity trade-off). [ASSUMPTION - needs citation]

**v1 Default:** No hard limit. Soft guidance: "Focus tip" when queue > 5. Dashboard highlights "Next suggested" job to reduce choice paralysis. [ASSUMPTION]

---

### Pattern 4: Reducing Cognitive Load for Vulnerable Users

**Strategies:**

1. **Progressive disclosure**: Don't show Career-depth features to Survival users unless they ask
2. **Sensible defaults**: Auto-assign depth, auto-sort queue, auto-archive stale jobs
3. **Chunking**: Break Career prep into multi-day schedule, not one giant checklist [EXTERNAL][1]
4. **Escape hatches**: "Skip prep" always visible; no gates
5. **Positive framing**: Track "jobs applied" not "jobs rejected"; celebrate progress
6. **Minimal required input**: Only ask for data when it directly helps the user

**v1 Default:** Apply all strategies. Test with target users to validate. [ASSUMPTION]

---

### Pattern 5: Pocket Organization

**Options:**

| Organization | When to Use | Pros | Cons |
|--------------|-------------|------|------|
| **By status** | Default view | Matches mental model | Mixes depths |
| **By depth** | Planning mode | Group similar effort | Splits related jobs |
| **By deadline** | Time-sensitive | Urgency clear | Most jobs have no deadline |
| **By date added** | Simple | Easy to implement | No priority signal |

**v1 Default:** Default sort by status (Queued → In Progress → Applied). Secondary sort by date added. Filter chips for depth. [ASSUMPTION]

---

## 7. Implement in v1 Checklist

### Must Have
- [ ] Save adds to Saved view (no depth)
- [ ] Add to Queue assigns depth based on mode
- [ ] Three depth levels with distinct UI (badges, checklist lengths)
- [ ] Queue view with all queued jobs
- [ ] "Start Co-Pilot" button on every queued job
- [ ] Status tracking (Queued → Applied → Outcome)
- [ ] Pocket cleanup prompts (30/60 day stale)
- [ ] Basic Tracker view for applied jobs

### Should Have
- [ ] Depth override (user can change assigned depth)
- [ ] "Suggested next" highlight on Queue
- [ ] Optional follow-up reminders (opt-in)
- [ ] Reflection templates on rejection
- [ ] Dashboard showing pending actions
- [ ] Archive functionality with undo

### Could Have
- [ ] Schedule integration for Career pockets
- [ ] "Quick win" filter (Survival only)
- [ ] Batch actions (archive all, move all to queue)
- [ ] Application count badges
- [ ] "Ghosted" auto-detection (14 days no update)
- [ ] Export pocket data

---

## 8. Risks + Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| **Pocket hoarding** - Users save 50+ jobs, apply to none | Medium | High | Cleanup prompts, "Suggested next", limit visible saved count |
| **Depth mismatch** - User applies Career depth to every job, gets overwhelmed | High | Medium | Auto-assign based on mode, explain time expectations upfront |
| **Checklist abandonment** - Career users see 5-item checklist, give up | High | Medium | Make checklist recommended not required, show progress %, allow skip |
| **Status tracking fatigue** - Users stop updating status, tracker becomes useless | Medium | High | Gentle prompts, auto-suggest "Ghosted", minimize required updates |
| **Data loss (guest mode)** - Guest clears browser, loses all pockets | High | Medium | Warn on save: "Create account to keep your jobs", prompt before destructive actions |
| **Reminder overload** - Too many notifications, user disables all | Medium | Medium | Opt-in only, hard cap at 2/week, batch into digest |
| **Privacy concern** - User worried about employer seeing job search activity | Medium | Low | No social features, no public profiles, clear data practices |
| **Sync confusion** - User expects guest data to sync, it doesn't | Medium | Medium | Clear messaging on guest limitations, prompt account creation |

---

## 9. Metrics to Confirm It Works

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| **Save → Queue conversion** | >50% of saved jobs move to queue within 7 days | Funnel analytics |
| **Queue → Applied conversion** | >60% of queued jobs result in application | Funnel analytics |
| **Checklist completion rate** | Bridge: >50%, Career: >30% | Feature analytics |
| **Average queue size** | 3-7 active jobs (not 0, not 50+) | User analytics |
| **Status update rate** | >70% of applied jobs have status updated within 14 days | Activity tracking |
| **Time from queue to apply** | Survival: <1 day, Bridge: <3 days, Career: <7 days | Time analytics |
| **Stale pocket rate** | <20% of pockets become stale (>30 days no action) | Cleanup analytics |
| **Pocket abandonment rate** | <30% of users with >5 saved jobs apply to 0 | Cohort tracking |

---

## 10. Open Questions (Max 5)

1. **Should we limit the number of jobs in Queue?** Hard limit might frustrate power users; soft limit might be ignored. What's the right balance?

2. **How do we handle expired job postings?** User saved job, it's now closed. Silent removal? Notification? Keep in tracker as "Expired"?

3. **Should Survival users ever see Career features?** Pure separation by mode, or allow opt-in to deeper prep for specific jobs?

4. **What's the right cadence for follow-up prompts?** 7 days? 14 days? Different for different job types? User-configurable?

5. **How do we measure prep quality vs quantity?** Is a user who completes 3/5 checklist items better prepared than one who skips all? How do we know?

---

## 11. Sources

[1] Miller, G. A. (1956). "The Magical Number Seven, Plus or Minus Two", Psychological Review. Referenced via Laws of UX, https://lawsofux.com/millers-law/, Accessed: 2026-01-05
- Working memory limits affect how many jobs users can track mentally

[2] Budiu, R. (2015). "Mobile User Experience: Limitations and Strengths", Nielsen Norman Group, https://www.nngroup.com/articles/mobile-ux/, Accessed: 2026-01-05
- Short sessions, interruptions, state preservation needs

[3] Kahneman, D. (2011). "Thinking, Fast and Slow", Farrar, Straus and Giroux
- System 1/System 2 thinking; cognitive load and decision fatigue [EXTERNAL - book, no URL]

[4] Jalanea Works Product Specification v1 (2026). Internal document.
- Job Pocket system, depth model, handoff flows [INTERNAL]

[5] Jalanea Works User Flows v1 (2026). Internal document.
- Survival/Bridge/Career mode journeys, status tracking flows [INTERNAL]

---

*Document Version: 1.0 | Created: 2026-01-05 | Evidence-tagged per SOURCE_POLICY.md*
