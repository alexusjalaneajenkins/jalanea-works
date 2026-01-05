# A. Entry / First Impression

Research document for Jalanea Works job search app targeting barrier-facing job seekers.

---

## 1. Goal of This Section

**Success looks like:**
- New user lands on app → understands value proposition within 5 seconds
- User feels "this is for me" before any registration wall
- Trust signals visible without scrolling
- Path to first value (saved job) requires ≤3 taps
- Zero friction for users on shared/library devices or spotty connections

**Anti-goals:**
- Lengthy onboarding before any value
- Asking for personal info before demonstrating relevance
- Generic "job search" messaging that doesn't signal our specific audience

---

## 2. User Mindsets + Constraints

### Mindsets (3-5 personas entering the app)

| Mindset | Emotional State | Primary Need | Trust Threshold |
|---------|-----------------|--------------|-----------------|
| **Desperate Survivor** | Anxious, urgent | "I need a job TODAY" | Low patience, high skepticism |
| **Cautious Returner** | Guarded, hopeful | "Will this judge my gap/record?" | Needs explicit safety signals |
| **Overwhelmed Student** | Scattered, confused | "Where do I even start?" | Needs clear guidance |
| **Time-Strapped Parent** | Exhausted, practical | "I have 10 minutes" | Values efficiency signals |
| **Curious Explorer** | Open, evaluating | "Is this better than Indeed?" | Comparing against known alternatives |

### Constraints

| Constraint | Impact | Design Response |
|------------|--------|-----------------|
| **Spotty internet** | Pages must load fast or fail gracefully | Offline-first architecture, skeleton loaders, minimal JS payload |
| **Low device storage** | Can't install heavy apps | PWA with minimal cache footprint, no mandatory downloads |
| **Shared/public devices** | Can't save passwords, privacy concerns | Guest mode, easy logout, no persistent login by default |
| **Library computer** | Time limits, public setting | Session state saves to URL params or QR code for phone transfer |
| **Cognitive overload** | Can't process walls of text | Progressive disclosure, chunked information [EXTERNAL][4] |
| **72-second sessions** | Users interrupted frequently | Save state automatically, easy resume [EXTERNAL][2] |

---

## 3. Decision Points (8+)

### DP1: First Screen - "Is this for me?"

**Choices:**
1. Scan headline and stay
2. Scroll to learn more
3. Tap CTA immediately
4. Bounce (back button)

**Outcomes:**
- Good: User sees relevant messaging, continues exploring
- Bad: Generic copy ("Find your next job") fails to differentiate, user bounces

**v1 Default:** Headline explicitly signals audience: "Job search tools built for people facing barriers" or similar. Value prop visible above fold. [ASSUMPTION]

---

### DP2: Account Creation Prompt - "Do I trust this enough to sign up?"

**Choices:**
1. Create account with email
2. Continue with Google/Apple SSO
3. Skip/explore as guest
4. Abandon

**Outcomes:**
- Good: Guest mode lets user see value first; SSO reduces friction
- Bad: Mandatory registration before any content → trust breach, abandonment [EXTERNAL][3]

**v1 Default:** Allow guest exploration. Show "Save your progress" prompt only AFTER user saves first job. [EXTERNAL][1]

---

### DP3: Information Request - "Why do they need this?"

**Choices:**
1. Provide requested info
2. Skip/decline
3. Lie to protect privacy
4. Abandon

**Outcomes:**
- Good: Minimal upfront asks; explain why each field helps personalization
- Bad: Asking for employment history, SSN, or address before any value → immediate distrust

**v1 Default:** Ask only: name (optional), email OR phone. Everything else comes later via progressive profiling. [ASSUMPTION]

---

### DP4: Mode Selection - "Which path is right for me?"

**Choices:**
1. Select Survival Mode ("I need work ASAP")
2. Select Bridge Mode ("Building toward something better")
3. Select Career Mode ("Growing my career")
4. Skip/confused

**Outcomes:**
- Good: Clear descriptions, user self-selects confidently
- Bad: Jargon or unclear options → paralysis, wrong selection, frustration

**v1 Default:** Present 3 cards with plain language + example scenarios. Allow changing later. Show "Not sure? Start here" default. [ASSUMPTION]

---

### DP5: First Job Card - "Does this look legit?"

**Choices:**
1. Tap to view details
2. Save to pocket
3. Dismiss/skip
4. Distrust and leave

**Outcomes:**
- Good: Job card shows employer name, location, pay range, "Quick Apply" badge
- Bad: Missing info (hidden salary, vague title) triggers scam radar

**v1 Default:** Require minimum viable job data: title, employer, location, pay indicator. Badge trusted sources. [ASSUMPTION]

---

### DP6: Save First Job - "Can I trust this to remember?"

**Choices:**
1. Tap save, see confirmation
2. Tap save, nothing visible happens
3. Don't save, fear of commitment
4. Save triggers registration wall

**Outcomes:**
- Good: Immediate visual feedback (animation, pocket fills), job persists in guest session
- Bad: Silent save or registration wall at this moment → breaks trust, loses progress

**v1 Default:** Animate save action, show pocket badge update, persist in localStorage for guests. Prompt account only when user tries to access across devices. [ASSUMPTION]

---

### DP7: Navigation Discovery - "Where do I go next?"

**Choices:**
1. Recognize bottom nav pattern, tap
2. Scroll looking for more content
3. Use back button
4. Get lost, abandon

**Outcomes:**
- Good: Jakob's Law - nav matches mental model from other apps [EXTERNAL][4]
- Bad: Hidden hamburger menu or novel navigation pattern → confusion

**v1 Default:** Bottom tab bar with 4-5 max items. Icons + labels. "Jobs" / "Pocket" / "Apply" / "Profile" [EXTERNAL][4]

---

### DP8: Error/Empty State - "Did something break?"

**Choices:**
1. Understand the issue, take suggested action
2. Retry blindly
3. Assume broken, abandon
4. Contact support (unlikely for new user)

**Outcomes:**
- Good: Friendly error with clear next step ("No jobs match yet - broaden your search")
- Bad: Generic error, blank screen, or technical jargon

**v1 Default:** All empty states include illustration + single clear action. Errors explain cause and remedy in plain language. [ASSUMPTION]

---

### DP9: Session Interruption - "Can I come back to this?"

**Choices:**
1. Leave and return later
2. Screenshot current state
3. Share link to self
4. Lose progress, frustrated

**Outcomes:**
- Good: Auto-save state, "Welcome back" with context on return
- Bad: Lost progress after phone call, transit stop, etc.

**v1 Default:** Save state to localStorage every 30s. On return, offer "Continue where you left off?" with preview. [EXTERNAL][2]

---

### DP10: Privacy Concern - "What happens to my data?"

**Choices:**
1. Trust and continue
2. Look for privacy policy
3. Use fake info
4. Abandon out of caution

**Outcomes:**
- Good: Privacy assurance visible without searching (footer link, onboarding mention)
- Bad: No visible privacy info → assumes worst, especially barrier-facing users with past system mistrust

**v1 Default:** "Your data stays private" message during onboarding. Link to plain-language privacy summary (not just legal doc). [ASSUMPTION]

---

## 4. Solutions / Patterns

### Pattern 1: Value-First Onboarding
**Description:** Show useful content before asking for anything.
| Pros | Cons |
|------|------|
| Builds trust per NN/g research [EXTERNAL][1] | Harder to personalize without data |
| Reduces bounce rate | May delay conversion metrics |
| Respects user autonomy | Guests harder to re-engage |

### Pattern 2: Progressive Disclosure
**Description:** Reveal complexity gradually as user demonstrates interest.
| Pros | Cons |
|------|------|
| Reduces cognitive load [EXTERNAL][4] | Risk of hiding important features |
| Matches 72s session reality [EXTERNAL][2] | Some users want full control upfront |
| Improves first impression | Requires careful information architecture |

### Pattern 3: Guest Mode + Soft Account Prompt
**Description:** Full functionality without account; prompt when cross-device sync needed.
| Pros | Cons |
|------|------|
| Zero-friction entry | Data loss risk if device cleared |
| Privacy-friendly | Can't do email campaigns to guests |
| Supports library/shared devices | Harder to measure user retention |

### Pattern 4: Skeleton Loading + Optimistic UI
**Description:** Show content structure instantly, fill in data as it loads.
| Pros | Cons |
|------|------|
| Feels fast even on slow connections | Content shift can be jarring |
| Reduces perceived wait time | Complexity in implementation |
| Supports spotty connectivity | May show stale data momentarily |

### Pattern 5: Explicit Trust Signals
**Description:** Visible indicators of legitimacy (badges, testimonials, partner logos).
| Pros | Cons |
|------|------|
| Addresses skepticism directly [EXTERNAL][3] | Can feel corporate/sales-y |
| External validation more trusted | Need actual partners/testimonials |
| Differentiates from scam sites | Takes up screen real estate |

---

## 5. Implement in v1 Checklist

### Must Have
- [ ] Value visible before any registration wall
- [ ] Guest mode with local persistence
- [ ] Bottom tab navigation (Jobs / Pocket / Apply / Profile)
- [ ] Skeleton loaders for job cards
- [ ] Auto-save session state
- [ ] Plain-language error messages
- [ ] Mobile-first responsive design
- [ ] Privacy assurance visible in onboarding

### Should Have
- [ ] SSO options (Google, Apple)
- [ ] Mode selection with clear descriptions
- [ ] "Continue where you left off" on return
- [ ] Job card minimum data requirements enforced
- [ ] Empty state illustrations with actions

### Could Have
- [ ] QR code for session transfer (library → phone)
- [ ] Offline job viewing for saved items
- [ ] Partner/trust badges on landing
- [ ] Testimonials from barrier-facing users
- [ ] Time-to-value metrics dashboard

---

## 6. Risks + Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| **Trust deficit** - Users assume we're a scam or will sell data | High | Medium | Explicit privacy messaging, no dark patterns, partner logos |
| **Cognitive overload** - Too many options/features visible | Medium | Medium | Progressive disclosure, mode-based filtering |
| **Technical failure on low-end devices** - JS-heavy app crashes | High | Low | PWA, minimal JS, test on older Android devices |
| **Session loss** - User loses progress, blames app | High | Medium | Auto-save, localStorage, "welcome back" flow |
| **Wrong mode selection** - User picks wrong mode, sees irrelevant jobs | Medium | Medium | Allow easy mode switching, "Not sure?" default option |
| **Registration wall abandonment** - Gate appears too early | High | High | Never gate before first value delivered |
| **Accessibility failure** - Can't be used with screen readers | High | Medium | ARIA labels, semantic HTML, keyboard nav, contrast ratios |

---

## 7. Metrics to Confirm It Works

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| **Time to first value** | <60 seconds from landing to first job save | Analytics event timing |
| **Bounce rate** | <40% on landing page | Analytics |
| **Guest → Account conversion** | >25% of guests create account within 7 days | Cohort tracking |
| **Session resume rate** | >60% of interrupted sessions resume | localStorage + session tracking |
| **Mode selection completion** | >80% of users select a mode | Funnel analytics |
| **Error encounter rate** | <5% of sessions see error state | Error logging |
| **NPS / Trust score** | >40 NPS among barrier-facing users | Post-onboarding survey |
| **Return visitor rate** | >30% return within 7 days | Analytics cohort |

---

## 8. Open Questions (Max 5)

1. **What specific language signals "this is for barrier-facing users" without stigmatizing?** Need user testing with target population.

2. **How do we handle returning users who previously used guest mode on a different device?** Phone number matching? Email lookup? Accept data loss?

3. **Should mode selection happen before or after first job browse?** Trade-off between personalization and friction.

4. **What partner logos/trust signals do we actually have access to?** Valencia College? CareerSource? Need inventory.

5. **How do we measure "trust" quantitatively beyond NPS?** Behavioral proxies (info provided, return rate, time spent)?

---

## 9. Sources

[1] Fessenden, T. (2017). "First Impressions Matter: How Designers Can Support Humans' Automatic Cognitive Processing", Nielsen Norman Group, https://www.nngroup.com/articles/first-impressions-human-automaticity/, Accessed: 2026-01-05

[2] Budiu, R. (2015). "Mobile User Experience: Limitations and Strengths", Nielsen Norman Group, https://www.nngroup.com/articles/mobile-ux/, Accessed: 2026-01-05

[3] Harley, A. (2016). "Trustworthiness in Web Design: 4 Credibility Factors", Nielsen Norman Group, https://www.nngroup.com/articles/trustworthy-design/, Accessed: 2026-01-05

[4] Yablonski, J. (2025). "Laws of UX", https://lawsofux.com/, Accessed: 2026-01-05
- Hick's Law: Decision time increases with number of choices
- Jakob's Law: Users prefer sites to work like others they know
- Miller's Law: 7±2 items in working memory
- Cognitive Load: Mental resources needed for interface
- Peak-End Rule: Experience judged by peak and end moments

---

*Document Version: 1.0 | Created: 2026-01-05 | Evidence-tagged per SOURCE_POLICY.md*
