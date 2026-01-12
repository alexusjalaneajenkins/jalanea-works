# USER_EXPERIENCE.md
*Master Build Document - Jalanea Works Platform*
**Doc 3: User Experience Design**
**Version 1.0**

---

## Table of Contents
1. [Document Purpose](#document-purpose)
2. [Design Philosophy](#design-philosophy)
3. [Primary Personas](#primary-personas)
4. [User Journey Maps](#user-journey-maps)
5. [Core User Flows](#core-user-flows)
6. [Screen Layouts & Wireframes](#screen-layouts--wireframes)
7. [Design Patterns](#design-patterns)
8. [Accessibility Requirements](#accessibility-requirements)
9. [Emotional Design](#emotional-design)

---

## Document Purpose

**This document defines:**
- WHO we're building for (detailed personas with real context)
- HOW users will move through the platform (user flows)
- WHAT their experience looks like at each step (journey maps)
- WHY design decisions are made (trauma-informed, dignity-first)

**Audience:** Designers, developers, product managers, anyone building features

**Companion Documents:**
- Doc 1: PROJECT_OVERVIEW v3.0 (mission, market, strategy)
- Doc 2: PROJECT_REQUIREMENTS (technical specs, features, data models)
- Doc 4: TECHNICAL_ARCHITECTURE (system design, infrastructure)
- Doc 5: COMPLIANCE & SAFEGUARDS (legal, privacy, security)

---

## Design Philosophy

### Core Principles

**1. Dignity Through Design**
Never assume incompetence. Simplified interfaces reflect context, not capability. Marcus doesn't need a "dumbed down" interface—he needs a fast one.

**2. Meet Users Where They Are**
Don't force career planning on someone who needs rent money by Friday. The platform adapts to user goals, not the other way around.

**3. Time is Money—Respect Both**
Every second saved in the UI is money in the user's pocket. Marcus using a borrowed phone on 3G doesn't have time for a 45-second page load.

**4. Trauma-Informed UX**
- No toxic positivity ("You got this!" when they're failing)
- No shame-based language ("Don't give up!")
- Compassionate recovery mechanics for failures
- Agency-preserving defaults (user chooses, platform suggests)

**5. Mobile-First, Always**
28% of target users are smartphone-dependent. Desktop is a bonus, mobile is the requirement.

**6. Privacy as Default**
Not opt-in, not opt-out—privacy is the architecture. Public Mode uses SessionStorage only, no cookies, no persistence.

**7. No Hallucinations, Ever**
AI-generated content must be traceable to user-provided evidence. No fabricated job experience or credentials.

**8. Community Over Individuality**
Your success matters more when it lifts others. Design choices should encourage staying local, building community wealth.

---

### Depth-Adaptive Complexity

**Core Principle:** Show what the user needs, hide what they don't.

**Essential Tier (Survival Mode):**
- Minimal UI elements
- One primary action per screen
- No advanced features visible
- Mobile-optimized (44×44px touch targets)

**Starter Tier (Bridge Mode):**
- Balanced UI complexity
- Secondary actions available
- Feature discovery (tooltips, hints)
- Mobile + desktop hybrid

**Premium Tier (Career Mode):**
- Full feature visibility
- Multi-column layouts
- Advanced controls (filters, sorting)
- Desktop-optimized with mobile companion

**Example: Job Card Complexity**

**Essential Tier:**
```
┌─────────────────────────────────────┐
│ Cashier • Publix                    │
│ $15/hr • Colonial Plaza             │
│                                     │
│ 🚌 15 min via Route 36              │
│ ✓ Hiring Fast                       │
│                                     │
│ [View Job Pocket →]                 │
└─────────────────────────────────────┘
```

**Starter Tier:**
```
┌─────────────────────────────────────┐
│ Dental Office Coordinator • SmileCare│
│ $40-42k/year • Winter Park          │
│                                     │
│ 🎓 Valencia grads preferred         │
│ 🚗 20 min drive                     │
│ ⭐ Culture Check: 8.2/10            │
│                                     │
│ Bridge Job • Tech Component         │
│                                     │
│ [Use Bridge Job Pocket] [Save]      │
└─────────────────────────────────────┘
```

**Premium Tier:**
```
┌─────────────────────────────────────────────────────┐
│ Marketing Director • TechFlow (Series B)            │
│ $105-125k + 0.15-0.25% equity • Orlando (Remote OK) │
│                                                     │
│ 🔗 You → Mark Thompson → Sarah Martinez (Hiring Mgr)│
│ 📊 Culture Check: 7.8/10 (Fast-paced but fair)     │
│ 💼 Reports to VP Growth Sarah Martinez (ex-HubSpot) │
│                                                     │
│ Strategic Fit: High • HubSpot background valued     │
│ Salary Target: $115k (competitive for Orlando)     │
│                                                     │
│ [Use Career Job Pocket] [Map Network] [Save]        │
└─────────────────────────────────────────────────────┘
```

---

## Primary Personas

### Persona 1: Marcus Williams (Essential Tier)

**Demographics:**
- Age: 24
- Gender: Male
- Race: Black
- Location: Pine Hills, Orlando FL (lives with grandmother)
- Education: High school diploma, Valencia College (1 semester, dropped out)
- Employment: Recently laid off from Amazon warehouse ($16.50/hr)

**Financial Situation:**
- Income: $0 (just lost job)
- Savings: $0 (living paycheck to paycheck)
- Debts: $1,200 credit card balance, $300/month car note (car repossessed 2 months ago)
- Monthly expenses: $600 (helps grandmother with rent), $80 (phone), $150 (food)
- **Critical Timeline:** Needs income within 7 days to help with rent

**Technology Access:**
- Device: Borrowed grandmother's smartphone (Samsung Galaxy A12, 2021 model)
- Internet: Grandmother's home WiFi (slow DSL, 10 Mbps)
- Data plan: Limited (1GB/month, careful not to overage)
- Computer access: None at home, uses Orange County Library (Hiawassee Branch)

**Transportation:**
- **No car** (repossessed 2 months ago)
- Primary: LYNX bus (Route 36: Pine Hills → Colonial → downtown)
- Secondary: Borrow grandmother's car occasionally (but she needs it)
- Max commute: 30 minutes via LYNX (45 min is absolute max before exhaustion)

**Daily Schedule:**
- 6:00 AM - Wake up, help grandmother with breakfast
- 7:00 AM - Take grandmother to dialysis (Monday/Wednesday/Friday)
- 9:00 AM - Job search (on borrowed phone or library computer)
- 12:00 PM - Pick up grandmother from dialysis
- 1:00 PM - Lunch, more job search
- 4:00 PM - Help grandmother with dinner prep
- 6:00 PM - Evening free (could work evening shift if needed)
- **Constraints:** Must be available 7 AM - 12 PM Mon/Wed/Fri for grandmother

**Job Search History (Last 21 Days):**
- Applications sent: 132 (spray-and-pray strategy)
- Response rate: 3.5% (5 responses)
- Interviews: 2 (both no-shows due to bus running late)
- Offers: 0
- Scams encountered: 3 (fake "warehouse positions" requesting $200 for "uniform")
- ATS score: 38/100 (resume not optimized, reads as "warehouse worker" only)

**Emotional State:**
- Depression: Moderate (2/10 on good days, 0/10 on bad days)
- Anxiety: High (8/10 constantly)
- Stress: Extreme (10/10 about rent, taking care of grandmother)
- Self-efficacy: Very low ("I'm not good at anything except lifting boxes")
- Support system: Grandmother (only family), 2 friends (also struggling)

**Job Search Goals:**
- **Primary:** Get hired within 7 days (rent is due, can't let grandmother down)
- **Secondary:** Find job that fits bus schedule (Route 36 accessible)
- **Tertiary:** Make enough to save $500 for used car down payment eventually

**Job Search Pain Points:**
1. **Time Poverty:** Every hour spent job searching is an hour not helping grandmother
2. **Transportation Barriers:** Can't apply to jobs >45 min via LYNX
3. **Resume Gaps:** 1-year gap after Valencia dropout (shame, doesn't know how to explain)
4. **Scam Vulnerability:** Desperate, almost fell for "pay for training" scam
5. **Application Abandonment:** 92% abandon rate (file uploads don't work on phone)
6. **Emotional Exhaustion:** Every rejection feels like failure, considering giving up

**What Marcus Needs from Jalanea Works:**
- ✅ **Speed:** Get hired in 7 days (not 21)
- ✅ **LYNX Integration:** Only show jobs he can reach via Route 36/50/18
- ✅ **Scam Shield:** Protect from fake jobs (he's too desperate to spot them)
- ✅ **ATS Optimization:** Transform resume 38 → 80+ score in minutes
- ✅ **Daily Structure:** AI-generated plan (8 jobs/day, no decision fatigue)
- ✅ **Mobile-First:** Works on grandmother's phone, <3 sec load on DSL
- ✅ **Emotional Support:** Rejection Coach normalizes ghosting, provides encouragement
- ✅ **Public Mode:** Can use library computer safely (SessionStorage only)

**Marcus's Success Metrics:**
- Day 1: Resume optimized (38 → 84 ATS score)
- Day 1: 8 strategic applications within LYNX range (vs 132 random)
- Day 3: 2 interview requests (Publix on Colonial, Target on OBT)
- Day 6: Offer accepted (Publix $15/hr, 15-min bus ride)
- Day 7: Start date confirmed (January 19, 2026)
- Emotional state improved: 6/10 average (from 2/10 baseline)

**Quote:**
> "I just need something fast, man. My grandma depends on me. I can't let her down again."

---

### Persona 2: Jasmine Chen (Starter Tier)

**Demographics:**
- Age: 24
- Gender: Female
- Race: Asian American (Chinese descent, 2nd generation)
- Location: University area (near UCF), Orlando FL (shares 2BR apartment with roommate)
- Education: **Valencia College alum** - Dual degrees (BAS Computing Technology & Software Development, AS Interactive Design), Google IT Support Certificate
- Employment: Retail shift lead at Old Navy (Millenia Mall) - $32k/year ($15.38/hr)

**Financial Situation:**
- Income: $32,000/year ($2,100/month after taxes)
- Savings: $3,200 (emergency fund, building slowly)
- Debts: $8,500 student loans (Valencia + Google certificate), $2,100 credit card
- Monthly expenses: $750 (rent + utilities), $120 (car insurance), $80 (gas), $300 (food), $200 (student loan payment)
- **Goal:** Transition to $40-45k/year office/tech role (bridge job)

**Technology Access:**
- Device: iPhone 13 (personal, unlimited data)
- Computer: 2020 MacBook Air (from Valencia program)
- Internet: Apartment WiFi (Spectrum, 200 Mbps)
- Skills: Proficient in Adobe Creative Suite, Figma, basic HTML/CSS, tech-comfortable

**Transportation:**
- **Personal car** (2015 Honda Civic, reliable)
- Willing to drive 45 minutes max
- Prefers hybrid/in-person roles (not full remote, wants office experience)
- Commute: Currently 25 min to Millenia Mall

**Daily Schedule:**
- **Monday-Friday:** Old Navy shift lead
  - 10:00 AM - 6:30 PM (typical shift)
  - 30-min lunch break (uses for job search on phone)
  - 2 days off/week (varies, uses for interviews)
- **Evenings:** 7:00 PM - 10:00 PM free (applies to jobs, portfolio work)
- **Constraints:** Must apply during spare time (lunch breaks, evenings, days off)

**Job Search History (Last 84 Days):**
- Applications sent: 240+ (spray-and-pray, 3-5 jobs/day)
- Response rate: 5-7% (12-17 responses)
- Interviews: 6 (3 for dead-end admin roles, 3 for retail management)
- Offers: 2 (both rejected: $32k admin assistant, $42k Old Navy assistant manager)
- Rejections: 223 (many automated "not moving forward")
- **Skills Translation Gap:** Resume reads as "90% retail worker, 10% tech professional"
- ATS score: 45/100 (Valencia degrees buried, retail experience dominates)

**Emotional State:**
- Depression: Mild-moderate (4.8/10 average)
- Anxiety: Moderate (6/10, worse after rejections)
- Stress: Moderate (7/10 about career trajectory)
- Self-efficacy: Low ("I'm stuck in retail forever")
- Support system: Parents (supportive but don't understand tech industry), roommate (also job searching), Valencia classmates (lost touch)
- **Lowest moment:** Cried in car after rejection from "dream job" (UX Coordinator at AdventHealth, $45k)

**Job Search Goals:**
- **Primary:** Transition from retail ($32k) to office/tech bridge job ($40-45k)
- **Secondary:** Highlight Valencia credentials (BAS + AS degrees are valuable!)
- **Tertiary:** Learn which roles are "bridge jobs" vs "dead-end admin"
- **Future:** Eventually reach UX Designer role ($55-65k) in 2-3 years

**Job Search Pain Points:**
1. **Skills Translation:** Can't articulate "POS troubleshooting" as "Technical Problem Resolution"
2. **Role Confusion:** Doesn't know difference between "Office Assistant" (dead-end) and "Coordinator" (bridge)
3. **Resume Structure:** Valencia degrees buried, retail experience dominates (wrong framing)
4. **Interview Anxiety:** Feels like imposter in tech/office interviews (retail background shame)
5. **Time Constraints:** Can only interview on 2 days off/week (sometimes misses opportunities)
6. **Salary Negotiation:** No experience negotiating (accepted $32k at Old Navy without question)

**What Jasmine Needs from Jalanea Works:**
- ✅ **Skills Translation Engine:** Transform retail → tech language (45 → 82 ATS score)
- ✅ **Valencia Credential Highlighting:** Auto-detect and prominently display BAS + AS degrees
- ✅ **Bridge Role Education:** Learn difference between dead-end admin and bridge jobs
- ✅ **Tier 2 Bridge Job Pockets:** 90-second intel on company culture, hiring context
- ✅ **Interview Prep:** Company-specific prep (dental office: "Why long-term?")
- ✅ **Salary Negotiation Coaching:** Scripts, market data ($38-44k for dental coordinators in Orlando)
- ✅ **Cover Letter Templates:** Career changer framing (confident, not apologetic)

**Jasmine's Success Metrics:**
- Week 1: Skills Translation (retail → tech language, 45 → 82 ATS score)
- Week 1: Bridge Role Education (learned difference from dead-end admin)
- Week 2: 15 strategic bridge job applications at Orlando healthcare/tech (vs 240 spray-and-pray)
- Week 3: Tier 2 Bridge Job Pocket used on dental office in Winter Park (90-sec intel: Culture Check 8.2/10)
- Week 5: Offer received ($40k dental office coordinator, 20-min commute from UCF area)
- Week 6: Negotiated to $42k using platform coaching (+$2k!)
- Emotional state improved: 7.2/10 average (from 4.8/10 baseline)
- Timeline: 35 days to offer (58% faster than baseline)

**Quote:**
> "I have two degrees from Valencia, but my resume makes me look like I just fold clothes. I know I can do more, but I don't know how to show it."

---

### Persona 3: David Richardson (Premium Tier)

**Demographics:**
- Age: 43
- Gender: Male
- Race: White
- Location: Lake Nona, Orlando FL (owns 3BR house with wife)
- Education: Bachelor's in Marketing (University of Florida), HubSpot certifications (Inbound Marketing, Sales Enablement)
- Employment: Recently laid off from TechFlow (B2B SaaS startup) - was Marketing Manager, $98k/year

**Financial Situation:**
- Income: $0 (laid off 2 weeks ago, severance package: 3 months salary)
- Savings: $42,000 (emergency fund, can last 9-12 months)
- Debts: $285,000 mortgage ($2,100/month), $8,500 car loan ($450/month)
- Monthly expenses: $5,200 total (mortgage, car, insurance, utilities, groceries, kids' activities)
- Severance runway: 3 months salary ($24,500 after tax)
- **Critical timeline:** Wants to secure offer within 12 weeks (before severance runs out)

**Technology Access:**
- Device: iPhone 15 Pro, iPad Pro, MacBook Pro M2 (all personal)
- Internet: Home fiber (1 Gbps), unlimited data on phone
- Skills: Advanced (HubSpot, Salesforce, Google Analytics, SEO, paid ads, email marketing)

**Transportation:**
- **Personal cars** (2, David's + wife's)
- Willing to commute 45 minutes if needed
- **Preference:** Orlando-based or remote (wants to stay in community, not relocate to SF/NYC)
- Open to hybrid (2-3 days/week in office)

**Daily Schedule:**
- **Full-time job search** (40 hours/week dedicated)
- 8:00 AM - 12:00 PM: Research companies, applications
- 12:00 PM - 1:00 PM: Lunch, family time
- 1:00 PM - 5:00 PM: Networking, LinkedIn outreach, interview prep
- Evenings: Family time (2 kids, ages 7 and 10)
- **Constraints:** Must be home by 6 PM for kids' dinner, prefers no evening interviews

**Job Search History (Last 112 Days):**
- Applications sent: 73 (strategic, not spray-and-pray)
- Response rate: 15-20% (11-15 responses)
- Interviews: 8 (ranging from 1st round to 4th round)
- Offers: 0
- Ghosted: 3 companies (after 3-4 interview rounds, 20+ hours invested)
- **Manual research time:** 292 hours (4-6 hours per company)
- ATS score: 72/100 (good, but could be better)

**Emotional State:**
- Depression: Mild (5.3/10 average)
- Anxiety: Moderate (6/10, financial pressure mounting)
- Stress: High (8/10 about layoff, family financial security)
- Self-efficacy: Moderate ("I'm qualified, but am I marketing myself right?")
- Support system: Wife (supportive, working full-time as nurse), 3 close friends (offering referrals), professional network (strong but underutilized)
- **Lowest moment:** Company A ghosted after 4 rounds (20+ hours wasted, no feedback)

**Job Search Goals:**
- **Primary:** Secure Marketing Director role at Series A/B startup ($85-120k + equity)
- **Secondary:** Stay in Orlando or remote (no relocation to SF/NYC/Seattle)
- **Tertiary:** Activate network (knows he's underutilizing LinkedIn connections)
- **Future:** VP Marketing within 2-3 years ($130-180k)

**Job Search Pain Points:**
1. **Time Sink:** 4-6 hours manual research per company (CEO background, funding, culture)
2. **Network Underutilization:** Has 850+ LinkedIn connections, doesn't know who knows who
3. **Underselling:** Applying to Manager roles when qualified for Director
4. **Ghosting:** Companies ghost after 3-4 rounds (20+ hours wasted, no feedback)
5. **Salary Negotiation:** Never negotiated before (accepted $110k immediately, left $5-10k on table)
6. **Interview Prep:** Generic prep (doesn't know hiring manager's background, leadership style)

**What David Needs from Jalanea Works:**
- ✅ **Role Level Assessment:** "You're Director-level, stop underselling"
- ✅ **Tier 3 Career Job Pockets:** 5-10 min deep research (8-page report) vs 4-6 hours manual
- ✅ **LinkedIn Connection Mapping:** You → Mark Thompson → Sarah Martinez (direct path)
- ✅ **Hiring Manager Intelligence:** Sarah (ex-HubSpot, data-obsessed, collaborative, 4.5/5 as manager)
- ✅ **Interviewer-Specific Prep:** Sarah's questions (HubSpot background), CEO Alex's questions (Stripe background)
- ✅ **Salary Negotiation:** Market data ($105-125k for Directors in Orlando), negotiation script, equity calculator
- ✅ **Time Efficiency:** 267 hours saved (5 Career Job Pockets vs 25 hours manual research)

**David's Success Metrics:**
- Week 1: Role Level Assessment ("You're Director-level, stop underselling")
- Week 1: 5 Tier 3 Career Job Pockets (5-10 min deep research each, 8-page reports)
  - TechFlow (Series B, $18M, Sarah Martinez hiring manager, ex-HubSpot)
  - Orlando employers prioritized: EA, Verizon Media, AdventHealth digital team
- Week 2: 3 interview requests (60% response rate via referrals)
- Week 4: Panel interview with Sarah + CEO Alex (interviewer-specific prep)
- Week 8: Offer received ($110k base + 0.2% equity)
- Week 9: Negotiated to $115k + 0.22% equity using platform script (+$5k)
- Emotional state improved: 7.8/10 average (from 5.3/10 baseline)
- Timeline: 63 days to hired (44% faster than baseline)
- Time saved: 267 hours (vs manual research)

**Quote:**
> "I know I'm qualified, but I'm spending 4-6 hours researching each company. I need to work smarter, not harder. And I want to stay in Orlando—this is home."

---

## User Journey Maps

### Marcus Williams: Journey Map (Essential Tier)

#### Current State Journey (Without Jalanea Works)

**Timeline:** 21 days  
**Result:** Still unemployed, considering giving up

**Phases:**

**Phase 1: Desperation (Days 1-7)**

**Goal:** Find any job immediately

**Actions:**
- Day 1: Searches "jobs near me" on grandmother's phone
- Day 1: Applies to 15 jobs on Indeed (no targeting, just clicks "Apply")
- Day 2: Realizes file upload doesn't work on phone (can't upload resume)
- Day 3: Types resume into text boxes (painful on mobile keyboard, 45 min/application)
- Day 4: Goes to library, uses computer, applies to 20 more jobs
- Day 5-7: Checks email obsessively, no responses

**Touchpoints:**
- Indeed mobile app (frustrating, file uploads fail)
- Orange County Library computer (limited hours, 30-min time limit)
- Gmail on phone (constant checking, no emails)

**Emotions:**
- Panic (10/10): "Rent is due in 7 days"
- Frustration (9/10): "Why won't these applications work on my phone?"
- Hopelessness (8/10): "132 applications and no one wants me"

**Pain Points:**
- ❌ Mobile file uploads fail (can't attach resume)
- ❌ No idea if applications are good quality (just spray-and-pray)
- ❌ Applying to jobs >60 min away (no bus access, wastes time)
- ❌ No response (3.5% response rate, feels like screaming into void)

---

**Phase 2: Scam Encounter (Days 8-10)**

**Goal:** Find job fast, getting desperate

**Actions:**
- Day 8: Receives email: "Warehouse Position - $18/hr - Start Monday!"
- Day 8: Clicks link, fills out application, excited
- Day 9: "Offer" received, asks for $200 for "uniform and background check"
- Day 9: Almost sends $200 via CashApp (doesn't have it, borrows from friend)
- Day 10: Friend warns him: "That's a scam, bro"
- Day 10: Feels stupid, embarrassed, scared

**Touchpoints:**
- Email (fake "job offer")
- Scam website (looks professional)
- CashApp (almost sent $200)

**Emotions:**
- Excitement (8/10): "Finally! A job!"
- Hope (7/10): "I can help grandma with rent"
- Embarrassment (9/10): "I almost fell for it"
- Fear (10/10): "I'm so desperate I can't even spot scams anymore"

**Pain Points:**
- ❌ No scam protection (Indeed doesn't flag fake jobs)
- ❌ Desperation makes him vulnerable (can't afford to be careful)
- ❌ No guidance on what's legitimate vs scam

---

**Phase 3: Interview Failures (Days 11-14)**

**Goal:** Actually land a job

**Actions:**
- Day 11: Receives interview request (Target on OBT, 10 AM Tuesday)
- Day 12: Sets 3 alarms, takes Route 50 bus
- Day 12: Bus runs 25 min late (accident on Orange Ave), arrives 10:20 AM
- Day 12: Target manager: "We already interviewed someone else"
- Day 13: Receives 2nd interview request (Wawa on Colonial, 2 PM Thursday)
- Day 14: Takes Route 36 bus, arrives on time
- Day 14: Interview goes okay (unprepared, doesn't know what to say)
- Day 14: "We'll call you" (never does)

**Touchpoints:**
- LYNX Route 50 (bus late due to accident)
- Target (interview missed due to bus)
- LYNX Route 36 (on time)
- Wawa (interview unprepared)

**Emotions:**
- Anxiety (10/10): "What if the bus is late?"
- Defeat (10/10): "I was 20 minutes late because of the bus"
- Hope (5/10): "Maybe Wawa will call back"
- Disappointment (9/10): "They never called"

**Pain Points:**
- ❌ No way to account for LYNX bus delays
- ❌ No interview prep (doesn't know what to say)
- ❌ Ghosted after interview (no feedback)

---

**Phase 4: Giving Up (Days 15-21)**

**Goal:** Survive somehow

**Actions:**
- Day 15: Applies to 30 more jobs (desperate, no strategy)
- Day 16-18: Checks email every hour, no responses
- Day 19: Rent is due, grandmother uses savings to cover Marcus's share
- Day 20: Feels like failure, stops checking email
- Day 21: Considers asking old manager at Amazon if they're hiring again (they're not)

**Touchpoints:**
- Gmail (no emails, constant disappointment)
- Grandmother's savings account (guilt, shame)

**Emotions:**
- Depression (0/10): "I'm worthless"
- Shame (10/10): "Grandma had to use her savings because of me"
- Resignation (10/10): "Maybe I'm just not meant to work anywhere"

**Pain Points:**
- ❌ No emotional support (feels alone)
- ❌ No structure (decision fatigue, don't know what to do)
- ❌ Considering giving up entirely

**Current State Summary:**
- 21 days, 132 applications, 0 jobs
- 3.5% response rate (5 responses total)
- 2 interviews (1 missed due to bus, 1 ghosted)
- Nearly fell for scam ($200)
- Emotional average: **2/10** (depression, shame, giving up)

---

#### Future State Journey (With Jalanea Works)

**Timeline:** 7 days  
**Result:** Hired at Publix, $15/hr, 15-min bus ride via Route 36

**Phases:**

**Phase 1: Onboarding (Day 1, 5-10 minutes)**

**Goal:** Set up profile, get immediate value

**Actions:**
- Finds Jalanea Works via Valencia College career services flyer
- Creates account (email or Google OAuth)
- **Step 1:** Enters name, uses "Use My Location" (Pine Hills)
- **Step 2:** Adds Valencia College credential (1 semester incomplete)
- **Step 3:** Selects transportation (LYNX Bus, no car), max commute <30 min
- **Step 4:** Selects salary target ($30-40k), sees Orlando budget calculator
- **Step 5:** Adds challenges (No car, Need immediate income)
- **Step 6:** Selects "Survival Mode" → Essential Tier ($15/month, 7-day free trial)

**Touchpoints:**
- Jalanea Works mobile app (smartphone, grandmother's phone)
- Valencia College flyer (trusted source)

**Emotions:**
- Curiosity (6/10): "What is this?"
- Hope (5/10): "Maybe this will help"
- Relief (7/10): "It works on my phone!"

**Wins:**
- ✅ Mobile-first (works on borrowed phone, <3 sec load)
- ✅ LYNX integration (only shows jobs he can reach)
- ✅ No credit card required for 7-day trial

---

**Phase 2: Resume Optimization (Day 1, 15 minutes)**

**Goal:** Transform resume from 38 → 82 ATS score

**Actions:**
- Platform prompts: "Let's optimize your resume"
- Uploads resume (types experiences if no file available)
- AI generates optimized version:
  - Before: "Warehouse Associate - Moved boxes"
  - After: "Logistics Associate - Inventory Management, Order Fulfillment, Equipment Operation"
- ATS score: 38 → 84 (+46 points)
- Downloads PDF (one-tap)

**Touchpoints:**
- Resume Studio (mobile-optimized)
- ATS score dashboard (gamification)

**Emotions:**
- Surprise (8/10): "My resume looks professional now!"
- Confidence (6/10): "Maybe I am qualified"

**Wins:**
- ✅ Evidence-based (no hallucinations, uses his real experience)
- ✅ Fast (15 minutes vs 2 hours manual)
- ✅ ATS score visible (immediate feedback)

---

**Phase 3: Daily Plan (Day 1, 30 minutes)**

**Goal:** Apply to 8 strategic jobs

**Actions:**
- Platform generates Daily Plan:
  - 8 jobs at Publix, Wawa, Target (all within 30 min via LYNX)
  - Each job pre-screened: LYNX accessible, hiring fast, no scams
  - Map shows Route 36, Route 50 routes
- Clicks "View Job Pocket" on Publix Cashier (Colonial Plaza)
- **Tier 1 Job Pocket** (20 seconds):
  - ✓ Qualification check: 100% match
  - Quick Brief: $15/hr, Colonial Plaza, Route 36 direct (15 min)
  - Your Talking Points: "Customer service experience at Amazon warehouse"
  - Interview Questions: "Why do you want to work at Publix?"
  - Red Flags: None detected
  - Recommendation: **APPLY NOW**
- Applies to 8 jobs in 30 minutes (vs 4 hours previously)

**Touchpoints:**
- Daily Plan (AI-generated structure)
- Tier 1 Job Pocket (20-second intel)
- LYNX route map (visual confidence)

**Emotions:**
- Relief (8/10): "Finally, jobs I can actually reach"
- Confidence (7/10): "These jobs are a good fit"
- Structure (8/10): "I know exactly what to do"

**Wins:**
- ✅ LYNX filtering (only jobs he can reach via Route 36/50)
- ✅ Scam Shield (no fake jobs in Daily Plan)
- ✅ Daily structure (no decision fatigue, 8 jobs/day)

---

**Phase 4: Interview Requests (Day 3)**

**Goal:** Respond to interview requests

**Actions:**
- Day 3 morning: 2 interview requests (Publix, Target)
- Publix: Tuesday 10 AM at Colonial Plaza
- Platform shows:
  - 🚌 Route 36 direct (15 min)
  - 🕐 Depart 9:30 AM (arrive 9:45 AM, 15-min buffer)
  - ⚠️ Route 36 rarely late (<5% delay rate)
- Schedules interview, adds to Shadow Calendar
- Target: Wednesday 2 PM at OBT
- Platform shows:
  - 🚌 Route 18 (22 min, 1 transfer at downtown)
  - 🕐 Depart 1:20 PM (arrive 1:42 PM, 18-min buffer)

**Touchpoints:**
- Email notifications (interview requests)
- Shadow Calendar (bus route + timing)
- Interview prep (Basic tier: common questions)

**Emotions:**
- Excitement (8/10): "They want to interview me!"
- Confidence (7/10): "I know exactly how to get there"
- Prepared (6/10): "I have talking points from Job Pocket"

**Wins:**
- ✅ Shadow Calendar shows exact bus route + timing
- ✅ Buffer time accounts for potential delays
- ✅ Interview prep (talking points from Tier 1 Job Pocket)

---

**Phase 5: Offer Received (Day 6)**

**Goal:** Accept job offer

**Actions:**
- Day 6: Publix calls with offer
- $15/hr, part-time (25-30 hrs/week), flexible schedule
- Start date: Monday January 19, 2026
- Platform prompts: "Congrats! Here's what to do next:"
  - ✓ Accept offer verbally
  - ✓ Send thank-you text (template provided)
  - ✓ Add start date to Shadow Calendar
  - ✓ Calculate first paycheck date (2 weeks: $450-540)
- Accepts offer, relieves grandmother

**Touchpoints:**
- Phone call (Publix hiring manager)
- Platform (thank-you template, next steps)

**Emotions:**
- Joy (9/10): "I got a job!"
- Relief (10/10): "I can help grandma with rent"
- Pride (7/10): "I did it in 6 days"

**Wins:**
- ✅ 7 days to hired (vs 21+ days baseline)
- ✅ LYNX accessible (15 min via Route 36)
- ✅ Emotional support (platform celebrates win)

---

**Future State Summary:**
- 7 days, 8 strategic applications, 1 job offer accepted
- 20%+ callback rate (2 interviews from 8 applications)
- 0 scams (Scam Shield blocked all)
- ATS score: 84 (vs 38 baseline)
- Emotional average: **6.5/10** (hopeful, confident, relieved)
- **67% faster than baseline** (7 days vs 21 days)

---

### Jasmine Chen: Journey Map (Starter Tier)

#### Current State Journey (Without Jalanea Works)

**Timeline:** 84 days  
**Result:** Frustrated, accepting dead-end admin role out of desperation

**Phases:**

**Phase 1: Research & Confusion (Days 1-14)**

**Goal:** Figure out which roles are "bridge jobs" for retail → office transition

**Actions:**
- Day 1: Googles "retail to office jobs"
- Day 2-5: Reads blog posts ("5 Office Jobs for Career Changers")
- Day 5: Applies to "Office Assistant" roles ($30-35k)
- Day 7-10: Applies to "Administrative Coordinator" roles (confused about difference)
- Day 12: Applies to "Marketing Coordinator" (requires 3 years marketing experience, rejected)
- Day 14: Still doesn't know which roles are viable bridge jobs

**Touchpoints:**
- Google (generic advice, not specific)
- Indeed (overwhelming job results)
- Blog posts (surface-level advice)

**Emotions:**
- Confusion (8/10): "What even is a bridge job?"
- Frustration (7/10): "Every job requires experience I don't have"
- Self-doubt (9/10): "Maybe I'm not qualified for office work"

**Pain Points:**
- ❌ No clear guidance on bridge roles vs dead-end admin
- ❌ Job descriptions all look the same
- ❌ Applying to wrong roles (waste of time)

---

**Phase 2: Resume Struggles (Days 15-28)**

**Goal:** Make resume look "office-ready" instead of "retail worker"

**Actions:**
- Day 15: Tries to rewrite resume herself
- Day 16: "Fixed POS crashes" → "Technical Support" (not confident)
- Day 18: Googles "how to translate retail skills to office"
- Day 20: Tries ChatGPT: "Make my retail resume sound professional"
- Day 21: ChatGPT output is generic, doesn't sound like her
- Day 22-28: Applies with mediocre resume, low confidence

**Touchpoints:**
- Google Docs (resume editing, painful)
- ChatGPT (generic outputs)
- Indeed (applications with poor-quality resume)

**Emotions:**
- Inadequacy (9/10): "I don't know how to talk about my experience"
- Impostor syndrome (8/10): "I feel like a fraud"
- Exhaustion (7/10): "This is taking forever"

**Pain Points:**
- ❌ Can't translate retail → tech language
- ❌ Valencia degrees buried in resume
- ❌ ATS score: 45/100 (resume not optimized)

---

**Phase 3: Spray & Pray (Days 29-56)**

**Goal:** Just apply to everything, hope something sticks

**Actions:**
- Day 29-56: Applies to 180+ jobs (mix of admin, coordinator, retail management)
- Includes: Dead-end admin ($30-35k), bridge jobs ($38-45k), out-of-reach roles ($55k+)
- No targeting, just volume
- Response rate: 5-7% (9-12 responses total)

**Touchpoints:**
- Indeed (primary job board)
- LinkedIn (occasional applications)

**Emotions:**
- Desperation (8/10): "Someone, anyone, just hire me"
- Burnout (9/10): "180 applications and nothing"
- Resignation (7/10): "Maybe I'm just meant to stay in retail"

**Pain Points:**
- ❌ No prioritization (treating all jobs equally)
- ❌ No company research (going in blind)
- ❌ Emotional exhaustion (every rejection hurts)

---

**Phase 4: Interviews & Rejections (Days 57-70)**

**Goal:** Land offer

**Actions:**
- Day 57: Interview at dental office (UX Coordinator, $45k) - goes well
- Day 60: Rejection email: "Moving forward with other candidates"
- Day 60: Cries in car (lowest emotional moment)
- Day 63: Interview at AdventHealth (Office Assistant, $32k) - boring role
- Day 65: Offer received ($32k) - rejects it (same salary as Old Navy)
- Day 68: Interview at law firm (Legal Assistant, $35k) - culture seems toxic
- Day 70: No offer

**Touchpoints:**
- Zoom interviews (unprepared, generic prep)
- Rejection emails (no feedback)
- Car (breakdown after rejection)

**Emotions:**
- Hope (7/10 before rejection): "This could be it!"
- Devastation (1/10 after rejection): "Why am I not good enough?"
- Frustration (9/10): "Why won't anyone tell me what I did wrong?"

**Pain Points:**
- ❌ No company-specific prep (generic interview answers)
- ❌ No culture insights (goes in blind, discovers toxic culture too late)
- ❌ No feedback (doesn't know why rejected)

---

**Phase 5: Desperation Offer (Days 71-84)**

**Goal:** Accept anything to escape retail

**Actions:**
- Day 71: Old Navy offers assistant manager promotion ($42k)
- Day 72: Considers accepting (pressure from family, exhausted from job search)
- Day 75: Applies to 30 more bridge jobs (last-ditch effort)
- Day 78: Interview at accounting firm (Accounting Coordinator, $40k) - uninspiring
- Day 80: Offer received ($40k) - hesitates (not tech-focused, might be dead-end)
- Day 82: Accepts offer (out of desperation, no enthusiasm)
- Day 84: Starts new job (worried it's the wrong move)

**Touchpoints:**
- Old Navy manager (pressure to stay)
- Accounting firm (offer, no excitement)

**Emotions:**
- Relief (5/10): "At least I escaped retail"
- Doubt (8/10): "Is this actually better, or just different?"
- Resignation (7/10): "Maybe this is as good as it gets"

**Pain Points:**
- ❌ Accepted offer out of desperation, not strategy
- ❌ No confidence it's the right move
- ❌ No salary negotiation (left $2-5k on table)

**Current State Summary:**
- 84 days, 240+ applications, 1 job (uncertain if it's right)
- 5-7% response rate (12-17 responses)
- 6 interviews (3 dead-end admin, 3 retail management)
- No salary negotiation (accepted $40k immediately)
- Emotional average: **4.8/10** (frustration, doubt, exhaustion)

---

#### Future State Journey (With Jalanea Works)

**Timeline:** 35 days  
**Result:** Hired at dental office, $42k (negotiated from $40k), confident in decision

**Phases:**

**Phase 1: Onboarding (Day 1, 10-15 minutes)**

**Goal:** Set up profile with Valencia credentials prominent

**Actions:**
- Creates account via Google OAuth
- **Step 1:** Enters name, location (UCF area), adds LinkedIn
- **Step 2:** Adds Valencia credentials:
  - BAS Computing Technology & Software Development (Alumni)
  - AS Interactive Design (Alumni)
  - Google IT Support Certificate
  - Platform auto-detects: "✨ Valencia College Graduate ✨"
- **Step 3:** Selects transportation (Personal car, willing to drive 45 min)
- **Step 4:** Selects salary target ($40-52k), sees Orlando budget calculator
- **Step 5:** Adds challenges (English 2nd language - optional)
- **Step 6:** Selects "Bridge Mode" → Starter Tier ($25/month, 7-day free trial)

**Touchpoints:**
- Jalanea Works (mobile + desktop hybrid)
- Valencia credential detection (automatic highlighting)

**Emotions:**
- Excitement (7/10): "Finally, a platform that gets me"
- Validation (8/10): "My Valencia degrees are front-and-center"
- Confidence (6/10): "This feels designed for me"

**Wins:**
- ✅ Valencia credentials auto-highlighted
- ✅ Platform recognizes her as "career changer" not "retail worker"
- ✅ Bridge Mode matches her goal (retail → office)

---

**Phase 2: Skills Translation (Day 1, 30 minutes)**

**Goal:** Transform resume from "retail worker" to "tech professional"

**Actions:**
- Platform prompts: "Let's translate your retail skills"
- Uploads resume (ATS score: 45/100)
- AI Skills Translation Engine:
  - Before: "Fixed POS crashes, trained staff on software"
  - After: "Technical Problem Resolution & System Troubleshooting, End User Training & Software Implementation"
  - Before: "Managed inventory using Shopify"
  - After: "Inventory Management System Administration (Shopify, ERP)"
- Valencia degrees moved to top of resume (prominently displayed)
- ATS score: 45 → 82 (+37 points)
- Downloads hybrid bundle (DOCX + PDF)

**Touchpoints:**
- Resume Studio (Skills Translation Engine)
- ATS score dashboard (immediate feedback)

**Emotions:**
- Amazement (9/10): "This is exactly what I needed!"
- Confidence (8/10): "I sound like a professional now"
- Validation (9/10): "My retail experience IS valuable"

**Wins:**
- ✅ Skills translated to tech language (retail → office framing)
- ✅ Valencia credentials front-and-center
- ✅ ATS score jump (45 → 82)

---

**Phase 3: Bridge Role Education (Day 2, 15 minutes)**

**Goal:** Learn which roles are bridge jobs vs dead-end admin

**Actions:**
- Platform module: "What are bridge jobs?"
- Interactive guide:
  - ❌ Dead-End Admin: Office Assistant ($30-35k), no tech, no growth, answering phones
  - ✓ Bridge Jobs: Healthcare Coordinator ($38-45k), Dentrix software, advancement path to Office Manager
  - ✓ Bridge Jobs: IT Support Specialist ($40-48k), tech troubleshooting, advancement to Systems Admin
  - ✓ Bridge Jobs: Marketing Coordinator ($42-50k), CRM management, advancement to Marketing Manager
- Takes quiz: "Is this a bridge job?" (90% accuracy)
- Enables "Bridge Jobs Only" filter in search

**Touchpoints:**
- Bridge Role Education module (interactive)
- Job search filters (bridge jobs only)

**Emotions:**
- Clarity (10/10): "FINALLY I understand the difference!"
- Relief (9/10): "I've been wasting time on dead-end admin"
- Empowerment (8/10): "Now I know what to look for"

**Wins:**
- ✅ Bridge job clarity (can spot dead-ends instantly)
- ✅ Filter enabled (only shows bridge jobs, saves time)
- ✅ Confidence (knows what she's qualified for)

---

**Phase 4: Strategic Applications (Days 3-14)**

**Goal:** Apply to 15 strategic bridge jobs (not 240 random)

**Actions:**
- Day 3-14: Applies to 15 bridge jobs:
  - Dental offices (5): Healthcare Coordinator roles ($38-45k)
  - Healthcare systems (3): AdventHealth, Orlando Health ($40-48k)
  - Tech companies (3): EA, Verizon Media ($42-50k)
  - Marketing agencies (4): Coordinator roles ($40-48k)
- All Orlando-based, all Valencia-friendly employers
- Each application uses optimized resume (ATS score 82)
- Uses cover letter templates (career changer framing)

**Touchpoints:**
- Jobs Hub (bridge jobs filter)
- Cover letter generator (career changer framing)
- Application tracker (15 applications logged)

**Emotions:**
- Confidence (8/10): "These are the right jobs"
- Focus (9/10): "Quality over quantity"
- Control (8/10): "I'm being strategic, not desperate"

**Wins:**
- ✅ Strategic targeting (15 quality vs 240 spray-and-pray)
- ✅ Valencia-friendly employers prioritized
- ✅ Bridge jobs only (no dead-end admin waste)

---

**Phase 5: Tier 2 Bridge Job Pocket (Day 18)**

**Goal:** Deep intel on SmileCare Dental (Winter Park)

**Actions:**
- Day 18: Interview request from SmileCare Dental
- Clicks "Use Tier 2 Bridge Job Pocket" (90 seconds)
- **Bridge Job Pocket Report:**
  - **The Role:** Dental Office Coordinator ($40-42k), uses Dentrix software, advancement to Office Manager in 18-24 months
  - **Why They're Hiring:** Previous coordinator promoted (good sign!), growing practice (2nd location opening)
  - **What They Want:** Tech-comfortable, patient-first attitude, long-term commitment (turnover is their pain point)
  - **Culture Check: 8.2/10** (Pros: Supportive team, work-life balance, growth opportunities | Cons: Busy during flu season, learning curve on Dentrix)
  - **Your Positioning:** Lead with Valencia tech degrees + Old Navy customer service ("Patient care is like customer service, but with stakes")
  - **Red Flags:** None detected
  - **Recommendation:** PRIORITY APPLICATION - Use this intel in interview

**Touchpoints:**
- Tier 2 Bridge Job Pocket (90-second intel)
- Culture Check (8.2/10 visual score)

**Emotions:**
- Preparedness (9/10): "I know exactly what they want"
- Confidence (8/10): "I can position myself perfectly"
- Excitement (8/10): "This sounds like the right fit"

**Wins:**
- ✅ 90-second intel (vs 2 hours manual research)
- ✅ Culture Check (8.2/10, confirms good fit)
- ✅ Positioning advice ("Patient care = customer service")

---

**Phase 6: Interview & Offer (Days 21-28)**

**Goal:** Ace interview, land offer

**Actions:**
- Day 21: Interview at SmileCare Dental
- Uses Tier 2 intel:
  - "I saw you're opening a 2nd location - congratulations!"
  - "Customer service at Old Navy is like patient care - making people feel comfortable during stressful moments"
  - "I'm tech-comfortable from my Valencia degrees, excited to learn Dentrix"
- Interview goes great (hiring manager: "You really did your homework!")
- Day 25: Offer received ($40k base, health insurance, PTO)
- Platform prompts: "Let's negotiate"

**Touchpoints:**
- Interview (in-person, prepared with Tier 2 intel)
- Offer email (platform captures details)
- Salary Negotiation Coach (platform feature)

**Emotions:**
- Joy (9/10): "They loved me!"
- Confidence (8/10): "I nailed that interview"
- Nervousness (6/10): "Should I negotiate? I've never done this"

**Wins:**
- ✅ Interview prep (Tier 2 intel = competitive edge)
- ✅ Offer received (right role, right company)
- ✅ Ready to negotiate (platform coaching)

---

**Phase 7: Negotiation (Days 28-30)**

**Goal:** Negotiate from $40k → $42k

**Actions:**
- Day 28: Platform shows negotiation script:
  - "Thank you for the offer! I'm excited about this opportunity. Based on my Valencia College degrees in Computing & Design, plus my Google IT Certificate and 3 years of customer service leadership, I was hoping we could discuss $42k as the starting salary."
- Day 28: Practices script (platform provides mock negotiation)
- Day 29: Sends negotiation email
- Day 30: Hiring manager responds: "We can do $42k!"
- Platform celebrates: "You negotiated +$2k! 🎉"

**Touchpoints:**
- Salary Negotiation Coach (script, mock practice)
- Email (negotiation)
- Platform (celebration, tracking)

**Emotions:**
- Pride (10/10): "I did it!"
- Confidence (9/10): "I'm worth $42k"
- Excitement (10/10): "I negotiated my first salary!"

**Wins:**
- ✅ Negotiation successful (+$2k)
- ✅ Platform coaching (script, practice)
- ✅ Confidence boost (empowered for future negotiations)

---

**Future State Summary:**
- 35 days, 15 strategic applications, 1 job offer accepted (confident it's right)
- 20%+ callback rate (3 interviews from 15 applications)
- Salary negotiated +$2k ($40k → $42k)
- ATS score: 82 (vs 45 baseline)
- Emotional average: **7.2/10** (confident, prepared, excited)
- **58% faster than baseline** (35 days vs 84 days)

---

### David Richardson: Journey Map (Premium Tier)

*(Detailed journey map for Premium tier omitted for brevity - follows similar structure with 112 days baseline → 63 days with Jalanea Works, focusing on time efficiency, network activation, and negotiation success)*

---

## Core User Flows

### Flow 1: First-Time User Onboarding (Essential Tier)

**Goal:** Get Marcus from signup → first application in <20 minutes

**Steps:**

1. **Landing Page → Signup**
   - User: Sees Valencia College flyer, scans QR code
   - Action: Lands on homepage, clicks "Start 7-Day Free Trial"
   - Screen: Signup (Email, Google, Apple OAuth)
   - Time: 30 seconds

2. **Account Creation**
   - User: Chooses Google OAuth (fastest)
   - Action: Authorizes Google account
   - Screen: Welcome screen ("Welcome to Jalanea Works!")
   - Time: 15 seconds

3. **Step 1: Foundation**
   - User: Enters full name, clicks "Use My Location"
   - Action: Browser geolocation API (lat/lng captured)
   - Screen: Adds LinkedIn (optional, skips), Portfolio (optional, skips)
   - Time: 1 minute

4. **Step 1.5: Education**
   - User: Clicks "Add Credential"
   - Action: Selects "Valencia College" from dropdown
   - Action: Selects "High School Diploma" (no college degree)
   - Action: Status = "Incomplete" (1 semester)
   - Screen: Shows credential card
   - Time: 1.5 minutes

5. **Step 2: Mission Logistics**
   - User: Selects "LYNX Bus" (no car)
   - User: Selects "Local (<30 min commute)"
   - User: Selects "Open to anything" (availability)
   - User: Selects "Morning, Afternoon" (shifts)
   - Time: 1.5 minutes

6. **Step 3: Salary Target**
   - User: Selects "$30K - $40K (Entry Level)"
   - Screen: Shows "1 Bedroom, Rent: $1,000-1,300/mo"
   - User: Clicks "Show Detailed Budget Breakdown"
   - Screen: Shows take-home $2,875/month, budget pie chart
   - User: Clicks "Continue"
   - Time: 2 minutes

7. **Step 4: Common Challenges**
   - User: Selects "No reliable car" and "Need immediate income"
   - User: Skips free-text situation field
   - User: Clicks "Launch My Career"
   - Time: 1 minute

8. **Step 5: Goal Selection**
   - Screen: Shows 3 modes (Survival, Bridge, Career)
   - User: Clicks "Survival Mode" (Essential Tier, $15/month)
   - Screen: "7-day free trial, no credit card required"
   - User: Clicks "Start 7-Day Free Trial"
   - Time: 1 minute

9. **Resume Upload/Creation**
   - Screen: "Let's create your resume"
   - User: Option 1: Upload existing resume (types experiences if no file)
   - User: Option 2: Guided resume builder (Q&A format)
   - Marcus: Chooses guided builder (no resume file)
   - Screen: "Where did you work last?" → "Amazon warehouse"
   - Screen: "What did you do there?" → "Moved boxes, used scanner, drove forklift"
   - AI generates resume automatically
   - Time: 5 minutes

10. **ATS Optimization**
    - Screen: "Your resume score: 38/100"
    - Screen: "Let's optimize it" (auto-runs)
    - Screen: "New score: 84/100! ⭐"
    - User: Reviews changes, clicks "Looks good"
    - User: Downloads PDF
    - Time: 2 minutes

11. **Daily Plan Generated**
    - Screen: "Your Daily Plan is ready!"
    - Screen: Shows 8 jobs (Publix, Wawa, Target, all LYNX-accessible)
    - Screen: Map with Route 36, Route 50 highlighted
    - User: Clicks "Start Applying"
    - Time: 30 seconds

12. **First Job Pocket**
    - User: Clicks "View Job Pocket" on Publix Cashier
    - Screen: **Tier 1 Job Pocket** (20 seconds)
      - ✓ Qualification: 100% match
      - Quick Brief: $15/hr, Colonial Plaza, Route 36 (15 min)
      - Talking Points: Customer service, reliable, on-time
      - Interview Questions: "Why Publix?" → "I want to work somewhere stable"
      - Red Flags: None
      - Recommendation: APPLY NOW
    - User: Clicks "Apply Now"
    - Time: 1 minute

13. **Application**
    - Screen: "Apply to Publix Cashier"
    - Pre-filled: Name, email, phone, address
    - Attach resume: Auto-attached (optimized PDF)
    - Screen: "Application submitted! 🎉"
    - Screen: "7 more jobs in your Daily Plan"
    - Time: 1 minute

**Total Time:** 18 minutes (signup → first application)

**Key UX Decisions:**
- ✅ No credit card for 7-day trial (reduces friction)
- ✅ Geolocation auto-detects location (saves typing)
- ✅ Guided resume builder for users without files (mobile-friendly)
- ✅ Daily Plan auto-generated (no decision fatigue)
- ✅ First application in <20 minutes (immediate value)

---

### Flow 2: Daily Application Workflow (Essential Tier)

**Goal:** Marcus applies to 8 jobs/day with minimal friction

**Daily Routine (30 minutes/day):**

1. **Morning Check-In (5 minutes)**
   - User: Opens Jalanea Works on phone
   - Screen: "Good morning, Marcus! Your Daily Plan is ready."
   - Screen: Shows 8 new jobs (all LYNX-accessible, Scam Shield verified)
   - User: Reviews list, clicks first job
   - Time: 5 minutes

2. **Job Pocket Review (2 minutes each × 8 jobs = 16 minutes)**
   - User: Clicks "View Job Pocket" on Wawa Cashier
   - **Tier 1 Job Pocket:**
     - ✓ Qualification: 100% match
     - Quick Brief: $14.50/hr, Colonial Plaza, Route 36 (18 min)
     - Talking Points: Fast-paced environment, customer focus
     - Interview Questions: "Can you work weekends?" → "Yes, I'm flexible"
     - Red Flags: None
     - Recommendation: APPLY NOW
   - User: Clicks "Apply Now"
   - Screen: Pre-filled application, clicks "Submit"
   - Screen: "Application submitted! 6 more jobs today."
   - Repeats for remaining 7 jobs
   - Time: 16 minutes

3. **Tracker Update (2 minutes)**
   - Screen: "You applied to 8 jobs today! 🎉"
   - Screen: Shows progress chart (24 total applications this week)
   - Screen: "Callback rate: 20% (4 interview requests)"
   - User: Clicks "Done for today"
   - Time: 2 minutes

4. **Evening Check-In (7 minutes)**
   - User: Opens Jalanea Works
   - Screen: Notification: "2 interview requests!"
   - User: Clicks notification
   - Screen: Shows interview details:
     - Publix: Tuesday 10 AM, Colonial Plaza
     - Target: Wednesday 2 PM, OBT
   - User: Clicks "Add to Shadow Calendar"
   - Screen: Shows LYNX route + timing:
     - Publix: Route 36 direct (15 min), depart 9:30 AM
     - Target: Route 18 (22 min, 1 transfer), depart 1:20 PM
   - User: Sets phone alarms (9:20 AM Tuesday, 1:10 PM Wednesday)
   - Time: 7 minutes

**Total Daily Time:** 30 minutes (vs 4 hours manual job search)

**Key UX Decisions:**
- ✅ Daily Plan auto-generated (no decision fatigue)
- ✅ Job Pockets are 20 seconds (fast intel)
- ✅ Applications pre-filled (1-click apply)
- ✅ Shadow Calendar auto-calculates LYNX routes (no manual research)
- ✅ Progress tracking (gamification, motivation)

---

### Flow 3: Interview Preparation (Starter Tier)

**Goal:** Jasmine prepares for SmileCare Dental interview using Tier 2 Bridge Job Pocket

**Steps:**

1. **Interview Request Received**
   - User: Receives email: "Interview request from SmileCare Dental"
   - User: Opens Jalanea Works
   - Screen: Notification badge (1 new interview)
   - User: Clicks notification
   - Screen: Interview details
     - Role: Dental Office Coordinator
     - Date: Thursday 2 PM
     - Location: Winter Park (20 min drive)
   - User: Clicks "Prepare for Interview"
   - Time: 1 minute

2. **Tier 2 Bridge Job Pocket**
   - User: Clicks "Use Tier 2 Bridge Job Pocket"
   - Screen: Loading... (90 seconds)
   - Screen: **Bridge Job Pocket Report:**
     - **The Role:** Coordinator, $40-42k, Dentrix software, advancement to Office Manager
     - **Why Hiring:** Previous coordinator promoted (good sign!)
     - **What They Want:** Tech-comfortable, patient-first, long-term (turnover pain point)
     - **Culture Check: 8.2/10** (Pros: Supportive, work-life balance | Cons: Busy during flu season)
     - **Your Positioning:** Valencia tech degrees + Old Navy customer service
     - **Red Flags:** None
     - **Recommendation:** PRIORITY APPLICATION
   - User: Reads report, clicks "Generate Interview Prep"
   - Time: 3 minutes

3. **Company-Specific Interview Prep**
   - Screen: "Interview Prep for SmileCare Dental"
   - Screen: Shows 5 likely questions:
     1. "Why dental office work?" → Answer: "Patient care is like customer service at Old Navy - making people comfortable during stressful moments"
     2. "Are you comfortable with tech?" → Answer: "Yes, I have Valencia degrees in Computing & Design, plus Google IT Certificate"
     3. "Why long-term?" → Answer: "I'm looking for growth - I see Office Manager as my 18-24 month goal"
     4. "How do you handle busy periods?" → Answer: "At Old Navy during Black Friday, I managed 50+ customers/hour..."
     5. "Any questions for us?" → Answer: "I saw you're opening a 2nd location - what growth opportunities will that create?"
   - User: Clicks "Practice Interview" (AI mock interview)
   - Screen: AI asks question 1, user speaks answer into phone
   - Screen: AI feedback: "Great answer! Try emphasizing Valencia degrees more."
   - User: Practices all 5 questions
   - Time: 15 minutes

4. **Final Prep Checklist**
   - Screen: "Pre-Interview Checklist"
   - [ ] Review Culture Check (8.2/10 - supportive team)
   - [ ] Print resume (Valencia degrees highlighted)
   - [ ] Prepare 3 questions for them (2nd location growth, team dynamics, day-to-day)
   - [ ] Plan outfit (business casual)
   - [ ] Set GPS (Winter Park address)
   - User: Checks all items
   - Screen: "You're ready! Good luck 🍀"
   - Time: 5 minutes

**Total Prep Time:** 24 minutes (vs 2 hours manual research)

**Key UX Decisions:**
- ✅ Tier 2 Pocket gives insider intel (90 seconds)
- ✅ Culture Check visible (8.2/10 = good fit)
- ✅ Mock interview with AI (practice answers)
- ✅ Pre-interview checklist (reduces anxiety)

---

### Flow 4: Salary Negotiation (Starter Tier)

**Goal:** Jasmine negotiates offer from $40k → $42k

**Steps:**

1. **Offer Received**
   - User: Receives email: "Offer from SmileCare Dental - $40k/year"
   - User: Opens Jalanea Works
   - Screen: "Congrats on your offer! 🎉"
   - Screen: Captures offer details:
     - Base salary: $40,000/year
     - Health insurance: Yes
     - PTO: 10 days/year
     - Start date: February 3, 2026
   - User: Clicks "Should I negotiate?"
   - Time: 2 minutes

2. **Salary Analysis**
   - Screen: "Salary Negotiation Coach"
   - Screen: Shows market data:
     - Dental Coordinators in Orlando: $38-44k
     - Your positioning: Valencia degrees + 3 years experience → Top of range justified
     - Target: $42-44k
   - Screen: "Based on your background, you should negotiate to $42k"
   - User: Clicks "How do I negotiate?"
   - Time: 3 minutes

3. **Negotiation Script**
   - Screen: "Here's your negotiation email:"
   - Template:
     ```
     Hi [Hiring Manager],

     Thank you so much for the offer! I'm excited about the opportunity to join SmileCare Dental as a Dental Office Coordinator.

     Based on my Valencia College degrees in Computing & Design, my Google IT Support Certificate, and my 3 years of customer service leadership at Old Navy, I was hoping we could discuss $42,000 as the starting salary.

     I'm confident I can bring immediate value to the team, especially with my tech background for Dentrix and my patient-first approach to care.

     Would you be open to discussing this?

     Thank you for considering!

     Best,
     Jasmine Chen
     ```
   - User: Clicks "Customize" (edits if needed)
   - User: Clicks "Send via Email" (or copies to clipboard)
   - Time: 5 minutes

4. **Mock Negotiation (Optional)**
   - Screen: "Practice negotiation call"
   - AI: "Hi Jasmine, I received your email. Let's talk about salary."
   - User: Speaks into phone (practices delivery)
   - AI: Responds realistically ("We budgeted $40k...can you tell me more about your background?")
   - User: Practices response (Valencia degrees, IT certificate, leadership)
   - AI: Feedback: "Great job! You sound confident."
   - Time: 10 minutes (optional)

5. **Negotiation Outcome**
   - Day later: Receives email: "We can do $42k!"
   - User: Opens Jalanea Works
   - Screen: "You negotiated +$2k! 🎉"
   - Screen: "Breakdown:"
     - Original offer: $40,000/year
     - Negotiated offer: $42,000/year
     - **Annual difference: +$2,000**
     - **Lifetime earnings impact: +$60,000** (assuming 30-year career with 3% annual raises)
   - Screen: "Accept offer?"
   - User: Clicks "Accept Offer"
   - Screen: "Congrats! Your start date is February 3, 2026."
   - Time: 2 minutes

**Total Negotiation Time:** 22 minutes (vs 0 minutes without negotiation)

**Key UX Decisions:**
- ✅ Market data shown (justifies negotiation)
- ✅ Script provided (reduces anxiety)
- ✅ Mock practice optional (builds confidence)
- ✅ Lifetime earnings impact shown (motivates negotiation)
- ✅ Celebrates win (+$2k visible)

---

### Flow 5: Tier 3 Career Job Pocket (Premium Tier)

**Goal:** David researches TechFlow in 5-10 minutes (vs 4-6 hours manual)

*(Detailed flow omitted for brevity - follows structure of requesting Tier 3 Pocket → 8-page report generated → LinkedIn connection mapping → interviewer-specific prep → salary negotiation with equity calculator)*

---

## Screen Layouts & Wireframes

### Essential Tier: Jobs Hub (Mobile)

```
┌─────────────────────────────────────────────────┐
│  [≡]  Jobs Hub               [🔍] [👤]          │
├─────────────────────────────────────────────────┤
│                                                 │
│  Your Daily Plan                                │
│  8 jobs matched • All LYNX-accessible           │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ 🏪 Cashier • Publix                     │   │
│  │ $15/hr • Colonial Plaza                 │   │
│  │                                         │   │
│  │ 🚌 15 min via Route 36                  │   │
│  │ ✓ Hiring Fast                           │   │
│  │                                         │   │
│  │ [View Job Pocket →]                     │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ 🏪 Team Member • Wawa                   │   │
│  │ $14.50/hr • Colonial Plaza              │   │
│  │                                         │   │
│  │ 🚌 18 min via Route 36                  │   │
│  │ ✓ Hiring Fast                           │   │
│  │                                         │   │
│  │ [View Job Pocket →]                     │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ 🛒 Stock Associate • Target             │   │
│  │ $15.50/hr • OBT                         │   │
│  │                                         │   │
│  │ 🚌 22 min via Route 18 (1 transfer)     │   │
│  │ ✓ Weekend availability                  │   │
│  │                                         │   │
│  │ [View Job Pocket →]                     │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  [Load More Jobs (5 remaining)]                 │
│                                                 │
├─────────────────────────────────────────────────┤
│  [🏠] [🔍] [📊] [💬] [👤]                        │
│  Home  Jobs  Tracker  Coach  Profile            │
└─────────────────────────────────────────────────┘
```

**Design Notes:**
- 44×44px touch targets (accessibility)
- LYNX route prominent (15 min via Route 36)
- "Hiring Fast" badge (urgency indicator)
- One primary action per card (View Job Pocket)
- Mobile-first (designed for borrowed phone, 3G)

---

### Starter Tier: Bridge Job Pocket (Desktop)

```
┌─────────────────────────────────────────────────────────────────┐
│  [← Back to Jobs]    Bridge Job Pocket • SmileCare Dental       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  The Role                                                       │
│  ─────────────────────────────────────────────────────────────  │
│  Dental Office Coordinator                                      │
│  $40-42k/year • Winter Park • In-person                         │
│                                                                 │
│  • Manage patient scheduling (Dentrix software)                 │
│  • Handle insurance verification and billing                    │
│  • Coordinate with dental assistants and hygienists             │
│  • Growth path: Office Manager (18-24 months)                   │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Why They're Hiring                                             │
│  ─────────────────────────────────────────────────────────────  │
│  ✓ Previous coordinator was promoted to Office Manager          │
│    (Great sign - they promote from within!)                     │
│  ✓ Practice is growing (2nd location opening in 6 months)       │
│  ✓ Need reliable, long-term team member                         │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  What They Want                                                 │
│  ─────────────────────────────────────────────────────────────  │
│  1. Tech-comfortable (Dentrix software has learning curve)      │
│  2. Patient-first attitude (comfort matters in dental care)     │
│  3. Long-term commitment (turnover is their pain point)         │
│                                                                 │
│  🎯 Your Edge: Valencia tech degrees + Old Navy customer service│
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Culture Check: 8.2/10 ⭐⭐⭐⭐                                    │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Pros:                              Cons:                       │
│  • Supportive team (low drama)      • Busy during flu season   │
│  • Work-life balance (rare in       • Dentrix learning curve   │
│    healthcare)                        (2-3 weeks)               │
│  • Growth opportunities (Office     • Occasionally work        │
│    Manager, 2nd location)             Saturdays                │
│  • Patient-focused culture                                      │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Your Positioning                                               │
│  ─────────────────────────────────────────────────────────────  │
│  Frame it like this:                                            │
│                                                                 │
│  "Patient care is like customer service at Old Navy -           │
│  making people feel comfortable during stressful moments.       │
│  My Valencia degrees in Computing & Design mean I'm tech-       │
│  comfortable and can learn Dentrix quickly. I'm looking         │
│  for growth - Office Manager is my 18-24 month goal."           │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Red Flags: None detected ✓                                     │
│                                                                 │
│  Recommendation: PRIORITY APPLICATION                           │
│  This is a strong bridge job with clear advancement path.       │
│                                                                 │
│  [Generate Interview Prep]  [Apply Now]  [Save for Later]       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Design Notes:**
- Culture Check score prominent (8.2/10)
- Pros/Cons split (transparency)
- "Your Positioning" section (exact language to use)
- Red Flags section (safety)
- 3 CTAs (prep, apply, save)

---

## Design Patterns

### Pattern 1: Touch Target Sizing

**Rule:** All interactive elements must be ≥44×44 CSS pixels

**Why:** Mobile accessibility (fat fingers on small screens)

**Implementation:**
```css
.button, .link, .checkbox, .radio {
  min-width: 44px;
  min-height: 44px;
  padding: 12px 16px;
}
```

**Examples:**
- Buttons: 44px height minimum
- Links: 44px tap area (even if text is smaller)
- Checkboxes: 44×44px hit area
- Radio buttons: 44×44px hit area

---

### Pattern 2: Loading States

**Rule:** Show loading indicators for any action >200ms

**Why:** User confidence (platform is working)

**Implementation:**
```jsx
function JobPocket() {
  const [loading, setLoading] = useState(false);
  
  async function generatePocket() {
    setLoading(true);
    const pocket = await api.generateJobPocket(jobId);
    setLoading(false);
  }
  
  if (loading) {
    return (
      <div className="loading-state">
        <Spinner />
        <p>Generating your Job Pocket...</p>
        <p>This takes about 20 seconds</p>
      </div>
    );
  }
  
  return <JobPocketContent />;
}
```

**Loading Times:**
- Tier 1 Pocket: 15-20 seconds (show countdown)
- Tier 2 Pocket: 60-90 seconds (show progress bar)
- Tier 3 Pocket: 5-10 minutes (show detailed progress: "Researching company... Analyzing hiring manager... Mapping LinkedIn...")

---

### Pattern 3: Error States

**Rule:** Never show technical errors to users

**Why:** Dignity (don't make users feel stupid)

**Bad Error Message:**
```
Error: API request failed with status 500
Internal Server Error at line 342
```

**Good Error Message:**
```
We couldn't load that right now.
Try again in a moment, or contact support if it keeps happening.

[Try Again]  [Contact Support]
```

**Implementation:**
```jsx
function ErrorState({ error, retry }) {
  return (
    <div className="error-state">
      <AlertIcon />
      <h3>We couldn't load that right now.</h3>
      <p>Try again in a moment, or contact support if it keeps happening.</p>
      <button onClick={retry}>Try Again</button>
      <a href="/support">Contact Support</a>
    </div>
  );
}
```

---

### Pattern 4: Empty States

**Rule:** Never show blank screens

**Why:** Abandonment (users think platform is broken)

**Bad Empty State:**
```
No jobs found.
```

**Good Empty State:**
```
No jobs match your filters yet.

Try:
• Expanding your commute range (currently <30 min)
• Checking back tomorrow (new jobs posted daily)
• Adjusting your salary range

[Adjust Filters]  [View All Jobs]
```

**Implementation:**
```jsx
function JobsHubEmpty({ filters }) {
  return (
    <div className="empty-state">
      <SearchIcon />
      <h3>No jobs match your filters yet.</h3>
      <p>Try:</p>
      <ul>
        <li>Expanding your commute range (currently <30 min)</li>
        <li>Checking back tomorrow (new jobs posted daily)</li>
        <li>Adjusting your salary range</li>
      </ul>
      <button onClick={adjustFilters}>Adjust Filters</button>
      <button onClick={viewAllJobs}>View All Jobs</button>
    </div>
  );
}
```

---

## Accessibility Requirements

### WCAG 2.2 Level AA Compliance

**1. Color Contrast**
- Text: 4.5:1 minimum (7:1 for AAA)
- Large text: 3:1 minimum
- Interactive elements: 3:1 minimum

**2. Keyboard Navigation**
- All functionality accessible via keyboard
- Tab order logical (top → bottom, left → right)
- Focus indicators visible (2px outline)
- Skip links ("Skip to main content")

**3. Screen Reader Support**
- Semantic HTML (nav, main, section, article)
- ARIA labels for icons
- Alt text for images
- Form labels associated with inputs

**4. Touch Target Sizing**
- 44×44 CSS pixels minimum
- 8px spacing between targets

**5. Captions & Transcripts**
- Video content: Captions required
- Audio content: Transcripts required

---

## Emotional Design

### Principle 1: No Toxic Positivity

**Bad:**
```
You got this! 💪
Don't give up! 🌟
Stay positive! ☀️
```

**Good:**
```
This is hard. You're doing your best.
It's okay to take a break if you need to.
You've applied to 8 jobs today - that's real progress.
```

---

### Principle 2: Normalize Rejection

**Bad:**
```
Rejection #45
[No additional context]
```

**Good:**
```
Rejection from AdventHealth

This is normal. 
Most job searches include 50-100 rejections before an offer.
You're at 45 rejections with a 20% callback rate - that's strong.

Want to talk about what happened?

[Talk to Career Coach]  [Keep Going]
```

---

### Principle 3: Celebrate Wins (Without Pressure)

**Bad:**
```
🎉🎊 AMAZING JOB!!! 🎊🎉
YOU'RE A ROCKSTAR!!!
```

**Good:**
```
Nice work.
You applied to 8 jobs today. That's 8 chances.
Tomorrow's another day. Rest if you need to.

[View Progress]  [Done for Today]
```

---

**Status:** Doc 3 (USER_EXPERIENCE) Complete - Part 1

**Covered:**
- Design philosophy (dignity, trauma-informed, depth-adaptive)
- 3 detailed personas (Marcus, Jasmine, David)
- 2 complete journey maps (Marcus current/future, Jasmine current/future)
- 5 core user flows (onboarding, daily workflow, interview prep, negotiation, Career Pocket)
- Screen layouts (Jobs Hub, Bridge Job Pocket)
- Design patterns (touch targets, loading, errors, empty states)
- Accessibility requirements (WCAG 2.2 Level AA)
- Emotional design principles (no toxic positivity, normalize rejection, celebrate wins)

**Ready to move to Doc 4: Technical Architecture?**
