# D. Apply Co-Pilot Handoff + Job Detail Understanding

Research document for the Apply Co-Pilot handoff experience and job detail comprehension in Jalanea Works.

---

## 1. Goal of This Section

**Success looks like:**
- User transitions from Pocket → Apply Co-Pilot without confusion about what happens next
- Two strategy paths (Immediate vs Planned) are discoverable, not overwhelming
- Job link ingestion extracts enough data for user to decide "is this worth my time?"
- Trust/safety signals prevent users from wasting effort on scam listings
- Ecosystem feels like ONE cohesive journey, not disconnected tools

**Anti-goals:**
- User thinks "Apply Co-Pilot" will auto-apply while they sleep [INTERNAL - explicitly prohibited per PRODUCT_SPEC_V1.md]
- User pastes job URL, sees "extraction failed", has no recourse
- Safety warnings scare users away from all jobs (false positive overload)
- Two paths feel like two separate products rather than two speeds through one journey
- Handoff from Pocket → Co-Pilot loses context (user forgets why they saved this job)

---

## 2. User Mental Model: What "Apply Co-Pilot" Means

### What Users THINK It Does

| User Expectation | Reality | How to Align |
|------------------|---------|--------------|
| "It applies for me automatically" | **NO** — User clicks Apply on external site | Explicit disclaimer before Apply Sprint [INTERNAL] |
| "It fills forms for me" | **PARTIAL** — Copy buttons, not autofill | Show "copy to clipboard" pattern clearly |
| "It will get me a job" | **NO** — It guides, user executes | Frame as "companion" not "agent" |
| "It knows everything about this job" | **PARTIAL** — Extracts what's available | Show data provenance ("from job posting") |
| "It will tell me if this is a scam" | **PARTIAL** — Flags common red flags | Present as "concerns" not "verdict" |

### What It MUST NOT Imply

From PRODUCT_SPEC_V1.md [INTERNAL]:
- ❌ "Auto-apply while you sleep"
- ❌ "CAPTCHA bypass"
- ❌ "We log into job sites for you"
- ❌ "Guaranteed results"

### Naming Considerations

"Apply Co-Pilot" suggests guidance, not automation. This is correct. However, users may still assume automation until explicitly told otherwise.

**v1 Default:** First-time Apply Co-Pilot entry shows one-time modal: "Jalanea Works guides you — you apply yourself. We don't submit applications for you." [ASSUMPTION]

---

## 3. User Mindsets + Constraints (Applying Phase)

### Mindsets

| Mindset | Emotional State | Primary Need | Behavior Pattern |
|---------|-----------------|--------------|------------------|
| **Anxious Rusher** | Desperate, impatient | "Just let me apply already" | Skips prep, wants direct path to external form |
| **Fearful Skeptic** | Wary, past-burned | "Is this job even real?" | Needs safety signals before investing effort |
| **Ashamed Explainer** | Embarrassed, defensive | "How do I explain my gap/record?" | Needs coaching on framing barriers |
| **Methodical Preparer** | Organized, deliberate | "I want to do this right" | Uses checklists, follows guidance |
| **Overwhelmed Pauser** | Frozen, decision paralysis | "There's too much to do" | Needs clear "next single step" guidance |

### Constraints

| Constraint | Impact | Design Response |
|------------|--------|-----------------|
| **Fear of rejection** | Users avoid applying to protect ego | Frame as "numbers game", celebrate attempts not just wins |
| **Shame about history** | Users lie or avoid applications | Provide framing guidance, not judgment |
| **Shared device / public space** | Can't leave sensitive info visible | Quick logout, no persistent personal data display |
| **Limited time (10 min windows)** | Can't complete Career-depth in one session | Save state, allow partial completion [EXTERNAL][4] |
| **Cognitive overload from stress** | Reduced decision-making capacity | Limit visible choices, highlight "next step" [EXTERNAL][5] |

---

## 4. Decision Points (12+)

### DP1: Handoff Moment - "I'm ready to apply"

**Choices:**
1. Tap "Start Co-Pilot" from Queue
2. Tap "Start Co-Pilot" from Dashboard
3. Hesitate, unsure what will happen
4. Abandon, apply directly on job site without Co-Pilot

**Outcomes:**
- Good: User understands Co-Pilot is guidance tool, enters confidently
- Bad: User expects automation, feels misled when they still have to apply manually

**v1 Default:** "Start Co-Pilot" button includes subtitle: "Get ready to apply" or "Prepare your application". First entry shows brief explainer modal. [ASSUMPTION]

---

### DP2: Strategy Path Selection - "How do I want to do this?"

**Choices:**
1. Apply Immediately (Survival/Bridge)
2. Apply With a Plan (Career)
3. Confused by options, pick randomly
4. Back out, not ready to decide

**Outcomes:**
- Good: User picks path matching their intent and available time
- Bad: User picks wrong path → either wasted prep time (fast job, Career depth) or under-prepared (goal job, Survival depth)

**v1 Default:** System suggests path based on pocket depth (auto-assigned from mode). User can override. Show estimated time: "Quick path (~10 min)" vs "Planned path (~1-2 hours)". [ASSUMPTION]

---

### DP3: Understanding the Job - "What am I applying for?"

**Choices:**
1. Read full job description in Co-Pilot
2. Skim key points (requirements, salary, location)
3. Skip to Apply Sprint without reading
4. Open original job posting in new tab

**Outcomes:**
- Good: User has enough context to decide fit and prepare
- Bad: User applies blindly, wastes time on poor-fit jobs

**v1 Default:** Stage 1 (Understand) shows: Job title, company, location, work mode, salary range, key requirements, skills match. "View Full Posting" link to original source. [INTERNAL - per PRODUCT_SPEC_V1.md]

---

### DP4: Skills Match Review - "Can I actually do this?"

**Choices:**
1. Review skills match, feel confident
2. See skills gap, get discouraged
3. Ignore skills match, apply anyway
4. Use gap as reason to not apply

**Outcomes:**
- Good: User understands which skills to emphasize, which to address
- Bad: Skills gap list feels like rejection before applying → abandonment

**v1 Default:** Frame gaps as "opportunities to mention" not "disqualifications". Show: "✓ You have: X, Y" and "? Consider mentioning: Z" (not "Missing: Z"). [ASSUMPTION]

---

### DP5: Safety Check Response - "Is this job legit?"

**Choices:**
1. See no warnings, proceed confidently
2. See caution flag, investigate company
3. See caution flag, proceed anyway
4. See caution flag, abandon application
5. Distrust the app's judgment

**Outcomes:**
- Good: User makes informed decision about risk
- Bad: False positives scare user from good jobs; false negatives let scams through

**v1 Default:** Show safety as "Things to check" not "This is a scam". Provide actionable verification steps. User can dismiss warning and proceed. [ASSUMPTION]

---

### DP6: Vault Completeness - "Do I have everything I need?"

**Choices:**
1. Vault complete, copy data easily
2. Vault missing fields, add them now
3. Vault missing fields, skip and figure out later
4. Don't trust Vault, type manually on job site

**Outcomes:**
- Good: All commonly-needed data is one tap away
- Bad: User reaches external form, realizes they need info not in Vault

**v1 Default:** Vault Check stage shows completeness indicator. Highlight missing fields relevant to this job type. "Add to Vault" inline action. [INTERNAL - per PRODUCT_SPEC_V1.md]

---

### DP7: Opening External Application - "Time to actually apply"

**Choices:**
1. Click "Open Application", switch to job site
2. Hesitate, worried about leaving Jalanea
3. Copy all Vault data first, then open
4. Abandon at this moment

**Outcomes:**
- Good: Smooth transition to external site with Jalanea panel accessible
- Bad: User loses Jalanea context after switching tabs

**v1 Default:** "Open Application" opens new tab. Jalanea panel remains accessible (or shows as floating widget on mobile). Toast: "External site opened. Return here to mark complete." [ASSUMPTION]

---

### DP8: Applying on External Site - "Actually filling the form"

**Choices:**
1. Use copy buttons from Jalanea
2. Type manually from memory
3. Switch tabs repeatedly to check data
4. Give up mid-form (too long, technical issues)

**Outcomes:**
- Good: Copy buttons reduce friction; keywords visible for reference
- Bad: External form is complex, user loses momentum

**v1 Default:** Apply Sprint panel shows: Quick Copy section (name, email, phone, LinkedIn) + Keywords to include. Stays visible while user fills external form. [INTERNAL - per PRODUCT_SPEC_V1.md]

---

### DP9: Marking Completion - "I'm done (or I couldn't finish)"

**Choices:**
1. Mark complete successfully
2. Mark "couldn't complete" with reason
3. Mark "decided not to apply"
4. Forget to return to Jalanea, status never updated

**Outcomes:**
- Good: Accurate tracking enables useful analytics and follow-up
- Bad: Stale "In Progress" status, user forgets what happened

**v1 Default:** When user returns to Jalanea tab, prompt: "How did it go?" Options: Submitted / Couldn't complete / Decided not to apply. Brief reason capture for non-submissions. [INTERNAL - per USER_FLOWS_V1.md]

---

### DP10: Follow-Up Setting - "When should I check back?"

**Choices:**
1. Accept suggested follow-up date
2. Set custom follow-up
3. Skip follow-up reminder
4. Don't understand what follow-up means

**Outcomes:**
- Good: User has actionable reminder to update status
- Bad: User gets nagged, ignores reminders, tracker becomes useless

**v1 Default:** After "Submitted", suggest follow-up: "Most employers respond within 7-14 days. Set reminder?" with default date and option to change or skip. [ASSUMPTION]

---

### DP11: Returning to Queue - "What's next?"

**Choices:**
1. Apply to another job from queue
2. Take a break, return later
3. Review what was just applied to
4. Add more jobs to queue

**Outcomes:**
- Good: User maintains momentum without burnout
- Bad: User applies to one job, loses momentum, never returns

**v1 Default:** After completion, show: "Nice work! Your queue has X more jobs. [Apply to next] [Take a break]". Celebrate progress. [ASSUMPTION]

---

### DP12: Handling Extraction Failure - "The job link didn't work"

**Choices:**
1. Retry extraction
2. Manually enter job details
3. Paste job description text
4. Give up on this job

**Outcomes:**
- Good: User has fallback to capture job info manually
- Bad: User blames Jalanea for "broken" feature, loses trust

**v1 Default:** If extraction fails: "We couldn't read this job posting. You can: [Retry] [Enter details manually] [Paste job description]". Manual entry shows simplified form (title, company, location, URL). [ASSUMPTION]

---

## 5. Two Strategy Paths: Immediate vs Planned

### Path Comparison

| Aspect | Apply Immediately | Apply With a Plan |
|--------|-------------------|-------------------|
| **Best for** | Survival/Bridge depth jobs | Career depth jobs |
| **Time required** | 5-15 minutes | 1-2 hours (across sessions) |
| **Steps included** | Skim job → Vault check → Apply | Full research → Prep checklist → Schedule → Apply |
| **Information required** | Job basics only | Company research, interview prep, keywords |
| **Information optional** | Everything | Nothing (all recommended) |

### Apply Immediately (Survival/Bridge)

**When appropriate:**
- Fast-hire jobs (retail, food service, warehouse)
- Jobs where speed matters more than perfection
- User in Survival Mode or urgent need
- Job posting is simple, requirements are clear

**Steps in v1:**
1. **Understand** (1 min): Title, company, location, salary, key requirements
2. **Vault Check** (2 min): Verify contact info ready
3. **Apply Sprint** (5-10 min): Open site, copy data, submit
4. **Complete**: Mark status, optional follow-up

**Required data:** Job URL
**Optional data:** Notes, keywords

---

### Apply With a Plan (Career)

**When appropriate:**
- Goal jobs in target field
- Competitive positions worth investment
- User has time to prepare
- Job posting is detailed, company is researchable

**Steps in v1:**
1. **Understand** (10 min): Full job description, requirements analysis
2. **Research** (20 min): Company overview, culture, recent news
3. **Prep Checklist** (30 min): Skills mapping, keyword notes, cover letter draft
4. **Schedule** (optional): Add prep tasks to Smart Schedule
5. **Vault Check** (5 min): Verify all data ready
6. **Apply Sprint** (15 min): Open site, apply with keywords
7. **Complete**: Mark status, set follow-up

**Required data:** Job URL, completion of checklist items
**Optional data:** Cover letter, networking notes, interview prep

---

### How Users Choose

**System suggests** based on pocket depth (which comes from Strategy Mode). User can override.

**UI for path selection:**
```
┌─────────────────────────────────────────────────────────────────────┐
│ How do you want to apply?                                           │
│                                                                     │
│ [RECOMMENDED based on this job]                                     │
│                                                                     │
│ ○ Apply Immediately                                                 │
│   Quick path for fast-hire jobs                                     │
│   ~10 minutes                                                       │
│                                                                     │
│ ○ Apply With a Plan                                                 │
│   Thorough prep for important opportunities                         │
│   ~1-2 hours (can spread across days)                               │
│                                                                     │
│ [Continue →]                                                        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 6. Job Link → Job Data Expectations (v1)

### What Users Assume Happens

When user pastes a job URL, they expect the system to:
1. "Read" the job posting
2. Extract key details automatically
3. Present them in a clean format

**Reality:** Web scraping is unreliable. Many job sites block scraping, require login, or have dynamic content.

### Minimum Extract/Show Set

**Job Card (Queue/Saved views):**
- Title (required)
- Company name (required)
- Location (required)
- Work mode: Remote / Hybrid / On-site / Unclear
- Salary: Range or "Not disclosed"
- Posted date: If available

**Job Detail View (Apply Co-Pilot Stage 1):**
- All card fields plus:
- Description (full text or summary)
- Requirements list (if extractable)
- How to apply (link to application)
- Source (where the job came from)

### Failure States

| Failure | User Sees | Recovery Path |
|---------|-----------|---------------|
| **Page blocked** (login required, anti-bot) | "We couldn't access this page" | Manual entry form, or paste job text |
| **No description found** | "No description available" | Paste job description text, or proceed with basics |
| **Unusual format** | Partial data extracted | Show what we got + "Edit details" option |
| **URL invalid** | "This doesn't look like a job posting" | Correct URL or enter manually |

### Manual Entry Fallback

When extraction fails, show:
```
┌─────────────────────────────────────────────────────────────────────┐
│ Enter job details manually                                          │
│                                                                     │
│ Job Title *         [________________________]                       │
│ Company *           [________________________]                       │
│ Location *          [________________________]                       │
│ Work Mode           [Remote ▼]                                       │
│ Salary Range        [________________________] (optional)           │
│                                                                     │
│ Job URL             [________________________]                       │
│                                                                     │
│ [Paste job description instead ↓]                                   │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │                                                                 │ │
│ │  (paste full job text here)                                     │ │
│ │                                                                 │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ [Cancel]                                     [Save Job Details]     │
└─────────────────────────────────────────────────────────────────────┘
```

**v1 Default:** Extraction is best-effort. Failure triggers manual entry prompt. User can always edit extracted details. [ASSUMPTION]

---

## 7. Trust & Safety Module (v1)

### Red Flags Checklist (from FTC guidance) [EXTERNAL][1]

Scam indicators to check programmatically or warn about:

| Red Flag | Detection Method | Severity |
|----------|------------------|----------|
| **Unrealistic pay** | Salary far above market rate | High |
| **Payment required** | Job asks for money upfront | Critical |
| **No company website** | Domain lookup fails | Medium |
| **Email domain mismatch** | Contact email doesn't match company | Medium |
| **Vague job description** | No specific duties or requirements | Low |
| **Request for SSN/bank early** | Personal data requested before interview | Critical |
| **"Work from home" + "Easy money"** | Common scam phrase combo | Medium |
| **Poor grammar in professional posting** | Text quality analysis | Low |
| **Reshipping or package handling** | Specific scam type detection | Critical |

### Company Legitimacy Signals (Lightweight)

Things users can verify (system can prompt, not guarantee):
- Does the company have a website?
- Does the website look legitimate (not just a landing page)?
- Can you find the company on LinkedIn?
- Are there real employees visible?
- Does the job posting match what's on the company site?

**v1 Approach:** Surface "things to check" without claiming to verify. Don't overpromise what the system can detect. [ASSUMPTION]

### Language Requirement Mismatch Detection

For bilingual job seekers:
- Flag jobs requiring languages user doesn't have in profile
- Especially important: "Spanish required" when user is English-only (or vice versa)
- Show as "Heads up: This job requires [language]"

**v1 Default:** Compare job description language keywords to user's language profile. Flag mismatches as informational, not blocking. [ASSUMPTION]

### How to Present Without Scaring Users

**DO:**
- Use "Things to check" framing
- Provide actionable verification steps
- Allow user to proceed with warning acknowledged
- Show specific concern, not vague "danger"

**DON'T:**
- Block application without user override
- Use alarming red icons/colors for minor concerns
- Claim to guarantee safety
- Make user feel judged for their choices

**Example UI:**
```
┌─────────────────────────────────────────────────────────────────────┐
│ ⚠️ Things to verify                                                 │
│                                                                     │
│ • We couldn't find a company website for "XYZ Corp"                 │
│   → Search for the company name + "reviews" before applying         │
│                                                                     │
│ • The salary seems high for this role ($80K for entry-level)       │
│   → Research typical pay for similar positions in your area         │
│                                                                     │
│ General tips:                                                       │
│ • Never pay for training or equipment upfront                       │
│ • Never share SSN or bank info before being hired                   │
│                                                                     │
│ [I've verified this job, continue →]    [Remove from queue]         │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 8. Make It Feel Like One Ecosystem

### The Problem: Tool Fragmentation

Users might perceive:
- Jobs Hub = one tool
- Pocket = another tool
- Apply Co-Pilot = yet another tool
- Tracker = something else

This fragments the experience and increases cognitive load. [EXTERNAL][5]

### The Solution: "Job Journey" Narrative

Frame everything as stages of ONE journey, not separate tools:

```
DISCOVER → PREPARE → APPLY → TRACK → LEARN
   ↓          ↓         ↓       ↓        ↓
Jobs Hub    Pocket   Co-Pilot  Tracker  Reflect
```

### Handoff UI Patterns

**1. Context Preservation (Breadcrumb)**
Show where user came from and where they're going:
```
Jobs Hub > Queue > Marketing Intern @ Tech Startup > Apply Co-Pilot
```

**2. "Why You Saved This" Reminder**
When entering Apply Co-Pilot, show brief context:
```
┌─────────────────────────────────────────────────────────────────────┐
│ Marketing Intern @ Tech Startup                                     │
│ Saved 3 days ago • CAREER depth                                     │
│                                                                     │
│ Why this job matched you:                                           │
│ ✓ Remote work available                                             │
│ ✓ Entry-level in your target field                                  │
│ ✓ Skills match: 4/5                                                 │
└─────────────────────────────────────────────────────────────────────┘
```

**3. Progress Indicator**
Show stage in the journey:
```
[✓] Saved → [✓] Queued → [●] Applying → [ ] Tracking
```

**4. Consistent Visual Language**
- Same job card component everywhere
- Same depth badges [▪○○] [▪▪○] [▪▪▪]
- Same color coding by mode
- Same status indicators

**5. Seamless Stage Transitions**
- No "loading new tool" feeling
- Animations that show progression, not page change
- Context carries forward automatically

### Single-Page Feel for Apply Co-Pilot

Apply Co-Pilot stages should feel like scrolling through ONE experience, not navigating between pages:

```
┌─────────────────────────────────────────────────────────────────────┐
│ Marketing Intern @ Tech Startup                         [CAREER ▪▪▪]│
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ [1. UNDERSTAND]  [2. VAULT CHECK]  [3. APPLY SPRINT]               │
│ ──────●──────────────────────────────────────────────────          │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │                                                                 │ │
│ │  Stage content here                                             │ │
│ │                                                                 │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│                    [← Back]  [Ready to Apply →]                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 9. Implement in v1 Checklist

### Must Have
- [ ] Apply Co-Pilot entry with first-time explainer modal
- [ ] Stage flow: Understand → Vault Check → Apply Sprint
- [ ] Job details display: title, company, location, work mode, salary
- [ ] Vault quick-copy section with clipboard buttons
- [ ] "Open Application" external link behavior
- [ ] Completion flow: Submitted / Couldn't complete / Decided not to
- [ ] Breadcrumb showing context (where user came from)
- [ ] Basic safety warnings for critical red flags (payment required, unrealistic pay)

### Should Have
- [ ] Two paths selection (Immediate vs Planned)
- [ ] Skills match display with positive framing
- [ ] Follow-up reminder suggestion after submission
- [ ] Manual entry fallback when extraction fails
- [ ] Progress indicator through stages
- [ ] "Why you saved this" context card
- [ ] Keywords to include during Apply Sprint
- [ ] Company legitimacy "things to check" module

### Could Have
- [ ] Job description paste-to-extract feature
- [ ] Language requirement mismatch detection
- [ ] Interview prep section for Career path
- [ ] Cover letter draft area for Career path
- [ ] Networking suggestions for Career path
- [ ] "Apply to next" momentum prompt after completion
- [ ] Schedule integration for Career prep tasks
- [ ] Extraction retry with different method

---

## 10. Risks + Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| **Users expect auto-apply** | High disappointment, churn | High | Explicit disclaimer on first use; name is "Co-Pilot" not "Agent" |
| **Extraction failures frustrate users** | Lost trust, abandonment | High | Manual entry fallback; set realistic expectations |
| **Safety warnings cause false positives** | Users skip good jobs | Medium | Frame as "verify" not "danger"; make dismissible |
| **Safety warnings miss real scams** | Users get scammed, blame Jalanea | Medium | Disclaimer: "This is guidance, not guarantee"; link to FTC resources |
| **Two paths confuse users** | Wrong path chosen, wasted effort | Medium | System suggests based on depth; show time estimates |
| **Handoff loses context** | User forgets why they saved job | Medium | "Why you saved this" card; breadcrumb navigation |
| **Vault data incomplete** | User can't apply smoothly | High | Completeness indicator; inline "add to Vault" |
| **External sites block/change** | Application link broken | Medium | "Link not working?" → fallback to search company + job title |
| **Users don't return to mark complete** | Tracker data inaccurate | High | Prompt on tab return; push notification if enabled |
| **Cognitive overload during apply** | Abandonment mid-process | Medium | Progressive disclosure; one step at a time [EXTERNAL][2] |
| **Privacy concerns about Vault** | Users don't trust data storage | Medium | Clear privacy policy; explain data use; no SSN/bank storage [INTERNAL] |
| **Liability for scam detection** | Legal exposure if user loses money | Low | Frame as "guidance"; never guarantee safety; link to official resources |

---

## 11. Metrics to Confirm It Works

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| **Handoff completion rate** | >80% who start Co-Pilot complete at least Stage 1 | Funnel analytics |
| **Path selection accuracy** | >70% users accept suggested path | Feature analytics |
| **Extraction success rate** | >60% of job URLs successfully extract data | Backend metrics |
| **Manual entry usage** | <20% of jobs require manual entry | Fallback tracking |
| **Safety warning dismissal rate** | 40-70% (too low = too scary; too high = ignored) | Feature analytics |
| **Apply Sprint completion rate** | >75% who start Stage 3 complete it | Funnel analytics |
| **Status update rate** | >60% of applied jobs have status updated within 14 days | Tracker analytics |
| **Time from Queue to Apply** | Survival: <30 min, Bridge: <2 hours, Career: <2 days | Time analytics |
| **Vault copy button usage** | >50% of Apply Sprint sessions use copy buttons | Feature analytics |
| **Return after apply** | >50% return to queue for another job within session | Session analytics |
| **NPS on Apply Co-Pilot** | >30 NPS for users who complete at least one application | Survey |

---

## 12. Open Questions (Max 5)

1. **What job sites can we reliably extract from?** Need to test extraction on Indeed, LinkedIn, Glassdoor, company sites, niche boards. What's our realistic success rate?

2. **How do we verify company legitimacy without promising too much?** LinkedIn API? Domain age? Reviews aggregation? Or just prompt user to check manually?

3. **Should Apply Co-Pilot be accessible without queueing first?** User pastes URL directly → should they be forced through Save → Queue → Co-Pilot, or allow direct entry?

4. **How do we handle mobile split-attention (Jalanea + external site)?** Floating widget? Notification-based copy? Split-screen support?

5. **What's the right false-positive rate for safety warnings?** Too many warnings = ignored; too few = scams slip through. How do we calibrate?

---

## 13. Sources

[1] Federal Trade Commission. (2023). "Job Scams", Consumer Advice, https://consumer.ftc.gov/articles/job-scams, Accessed: 2026-01-05
- Authoritative guidance on job scam red flags including: reshipping scams, payment-required schemes, check fraud, mystery shopping fraud
- Key claim: "If someone offers you a job and claims that you can make a lot of money in a short period of time with little work, that's almost certainly a scam"

[2] Nielsen, J. (2006). "Progressive Disclosure", Nielsen Norman Group, https://www.nngroup.com/articles/progressive-disclosure/, Accessed: 2026-01-05
- Core pattern for showing simpler options first, advanced features on request
- Key claim: "Progressive disclosure is one of the best ways to satisfy both" user desires for power and simplicity
- Applied to: Two paths (Immediate vs Planned), staged disclosure in Apply Co-Pilot

[3] Harley, A. (2016). "Trustworthiness in Web Design: 4 Credibility Factors", Nielsen Norman Group, https://www.nngroup.com/articles/trustworthy-design/, Accessed: 2026-01-05
- Four factors: design quality, upfront disclosure, comprehensive content, connection to external validation
- Key claim: "Users appreciate when sites are upfront with all information that relates to the customer experience"
- Applied to: Safety transparency, job detail disclosure, extraction failure messaging

[4] Budiu, R. (2017). "Wizards: Definition and Design Recommendations", Nielsen Norman Group, https://www.nngroup.com/articles/wizards/, Accessed: 2026-01-05
- Wizard patterns for step-by-step processes; when to use vs avoid
- Key claim: "Use wizards for novice users or infrequent processes... Wizards can help users with little knowledge about a domain"
- Applied to: Apply Co-Pilot stage flow, state saving for interrupted sessions

[5] Yablonski, J. (2025). "Hick's Law", Laws of UX, https://lawsofux.com/hicks-law/, Accessed: 2026-01-05
- Decision time increases with number of options; choice overload causes paralysis
- Applied to: Two-path selection (not 5 options), limited visible choices per stage

[6] CareerOneStop. (2025). "Job Search", U.S. Department of Labor, https://www.careeronestop.org/JobSearch/, Accessed: 2026-01-05
- DOL-sponsored job search resources; authoritative guidance for legitimate job search
- Applied to: Recommending official resources in safety module

---

*Document Version: 1.0 | Created: 2026-01-05 | Evidence-tagged per SOURCE_POLICY.md*
