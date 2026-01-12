# PROJECT_OVERVIEW.md
*Master Build Document - Jalanea Works Platform*
**Version 3.0 - "Light the Block" Edition**

---

## Table of Contents
1. [Vision & Mission](#vision--mission)
2. [The Movement: Light the Block](#the-movement-light-the-block)
3. [Problem Statement](#problem-statement)
4. [User Research Summary](#user-research-summary)
5. [Target Users](#target-users)
6. [Competitive Landscape](#competitive-landscape)
7. [Core Solution](#core-solution)
8. [Platform Architecture](#platform-architecture)
9. [Current Phase](#current-phase)
10. [Success Metrics](#success-metrics)
11. [Build Methodology](#build-methodology)
12. [Key Principles](#key-principles)

---

## Vision & Mission

### Vision
**Build Careers. Build Community. Build Home.**

Help first-generation college graduates build careers AND communities – promoting local entrepreneurship, talent retention, and economic dignity in the hometowns that raised them.

### Mission
Create a dignified, trauma-informed job search experience that meets barrier-facing job seekers exactly where they are—whether they need their next paycheck tomorrow or are building toward a career—while keeping talent, wealth, and opportunity circulating in their home communities.

### Core Beliefs

**1. Everyone is Worthy**
Every person deserves love, compassion, support, and respect. No exceptions.

**2. Community Over Individuality**
Your success matters. AND it matters more when it lifts others.

**3. Staying Is Strength**
Leaving isn't the only path to success. Building where you're from takes vision, courage, and grit.

**4. Action Over Waiting**
We're not waiting for a billion-dollar government program. We're building what we need, now.

**5. People Are Not Broken. Systems Are.**
Job seekers facing barriers don't need more features—they need the *right* features at the *right* time, presented in a way that respects their context, constraints, and dignity.

---

## The Movement: Light the Block

### The Problem No One Talks About

**Brain Drain**
Every year, community colleges graduate brilliant minds from communities that never had much. And what happens? The best of us get shipped off.

Google hires them. Amazon relocates them. All that potential – all that intelligence, creativity, and drive – is building up a city that's already rich. Meanwhile, our neighborhoods stay the same.

**Economic Leakage**
When money is spent at chain stores and corporations, **~70% of it leaves the community**. When it's spent at local businesses, **~68% stays**.

But we don't have local businesses anymore. We have Walmarts and Old Navys taking money out faster than we can make it.

---

### What If the Smartest People From the Hardest Places Stayed to Build Where They Belong?

**Jalanea Works is three things:**

1. **Find Careers**
   Not just jobs – careers that grow with you, right here in your hometown.

2. **Start Businesses**
   Create jobs for people like you. Keep wealth circulating locally.

3. **Build Community**
   Connect with mentors who stayed and built. Your success IS community success.

---

### Transparency Pledge

When Jalanea Works generates revenue, here's exactly where it goes:

| Allocation | Purpose |
|------------|---------|
| **40%** | Platform & Operations - Keeping the lights on and improving features |
| **30%** | **Community Fund** - Grants for local businesses started by Valencia grads |
| **20%** | Expansion - Replicating this model in other cities |
| **10%** | Scholarships - Cover premium costs for Pell Grant recipients |

**This isn't charity. This is wealth redistribution BY the community, FOR the community.**

---

### The Vision: Beyond Orlando

**V1 (2026):** Orlando becomes the blueprint. Valencia College. Orange County. Local LYNX routes. Orlando employers.

**V2 (2027):** Tampa, Jacksonville, Miami. Every Florida community college keeps its talent.

**V3 (2028+):** Every city has its own version of Jalanea Works. Every community keeps its talent. Every graduate sees "staying home" as a power move, not a consolation prize.

---

## Problem Statement

### The Reality for Barrier-Facing Job Seekers

**Time Poverty**
Users juggling multiple survival jobs, caregiving, or unstable housing cannot afford 45-minute application workflows. Traditional platforms demand time they don't have.

**Scam Vulnerability**
Employment scams are the #1 fraud risk for 18-34 year-olds. Fake jobs promising "easy money" or "work from home" prey on desperation. Existing platforms offer no protection.

**Application Abandonment**
92% of job applications are abandoned when processes become too complex. Barrier-facing users face even higher abandonment due to lack of documentation, transport constraints, or literacy challenges.

**Skills Translation Gap**
Career changers (especially retail → office transitions) can't translate their experience into ATS-friendly language. "Fixed POS crashes" doesn't read as "Technical Problem Resolution" without help.

**Experience Paradox**
Entry-level jobs require 2-3 years experience. Bridge jobs (office roles with tech components) are invisible to career changers who don't know what to search for.

**Transit Barriers**
Without reliable transportation, job seekers can't access opportunities beyond their immediate neighborhood. LYNX bus routes limit commute options, but platforms don't account for this.

**Public Device Data Risks**
28% of low-income adults are smartphone-dependent. Many use library computers or borrow devices, creating privacy and data persistence risks that mainstream platforms ignore.

**One-Size-Fits-All Platforms**
LinkedIn/Indeed assume every user wants career progression. But someone who needs grocery money by Friday has fundamentally different needs than someone planning a 5-year career arc.

**Brain Drain & Economic Leakage**
The smartest graduates leave for big tech cities. Local talent → relocated talent. Local money → corporate headquarters. Communities that raised them never benefit.

---

### Evidence Base
- **28%** of low-income adults are smartphone-dependent (Pew Research, 2024)
- **92%** job application abandonment rate for complex workflows (Appcast, 2024)
- **Employment scams** are the #1 reported fraud type for 18-34 age group (FTC, 2024)
- **71%** of mobile job seekers report difficulty with file uploads (Appcast, 2024)
- **75%** of job search traffic is mobile, but only **2.8%** conversion rate (vs 3.2% desktop) (Contentsquare, 2024)
- **70%** of money spent at chain stores leaves the community (Economic leakage studies)
- **68%** of money spent at local businesses stays in the community (Local multiplier effect research)
- **240+ applications** typical for career changers without skills translation help
- **4-6 hours** of manual research per company (senior job searches)

---

## User Research Summary

### Research Methodology

All product decisions are grounded in **verified evidence** from:
- Pew Research Center (digital demographics)
- Federal Trade Commission (scam data)
- Appcast & Contentsquare (job search behavior)
- CISA & ALA (public device security)
- Direct user research (interviews, usability testing)
- Local economic development research (brain drain, local multiplier effect)

### Core Validated Insights

#### 1. Mobile-First is Non-Negotiable
**Finding:** 28% of adults earning <$30k are smartphone-dependent (nearly double the general population's 15%).

**Implication:** 
- Essential tier must work perfectly on phones with limited data
- No desktop-only features for survival-mode users
- PWA architecture enables offline functionality
- 3-second page load on 3G networks

**Source:** Pew Research Center, 2024

---

#### 2. Application Abandonment is Worse Than Expected
**Finding:** While general form abandonment is 60%, **92% of job seekers abandon** applications that require complex workflows.

**Key Barriers:**
- Registration walls (must create account before viewing application)
- Resume file uploads (71% of mobile users struggle with this)
- Multi-page forms with unclear progress indicators
- Requests for information users don't have readily available

**Implication:**
- Resume Studio must work without file uploads (Structured Builder)
- Registration happens AFTER demonstrating value, not before
- One-tap apply where possible
- Progressive disclosure (show only what's needed)

**Source:** Appcast Industry Report, 2024

---

#### 3. Scam Targeting is Strategic, Not Random
**Finding:** Employment scams are the **#1 riskiest scam category** for 18-34 year-olds.

**Scammer Tactics:**
- Spoofing university domains ("career-services@valencia-jobs.com")
- Targeting "University/Research Assistant" roles
- Check cashing schemes preying on financial desperation
- 54% of victims were unemployed at time of scam

**Implication:**
- Scam Shield must use deterministic rules-based detection (not probabilistic ML)
- CRITICAL flags = auto-block (upfront payment, check cashing)
- HIGH flags = warning + gate (vague job descriptions, no company info)
- Specific callouts for student/entry-level role risks

**Source:** FTC Consumer Sentinel, BBB Scam Tracker, 2023-2024

---

#### 4. Public Device Security is a Critical Privacy Risk
**Finding:** Library computers and public terminals have multiple attack vectors.

**Threats:**
- **Hardware keyloggers:** Physical devices invisible to OS security
- **Session persistence:** Browser tabs don't clear session tokens on close
- **MitM attacks:** Outdated router firmware allows traffic interception
- **Shoulder surfing:** Physical observation of screen/keyboard

**Implication:**
- Public Mode is mandatory for library/shared device users
- SessionStorage only (clears on tab close)
- 15-minute idle timeout with aggressive logout
- QR code quick-exit for panic scenarios
- Clear-Site-Data header on logout

**Source:** CISA Security Guidelines, American Library Association, 2024

---

#### 5. Mobile Traffic Doesn't Convert
**Finding:** Mobile accounts for **75% of traffic** but only **2.8% conversion rate** (vs 3.2% desktop).

**Root Cause:**
- Input friction ("fat finger" effect on small keyboards)
- Form complexity (multi-page workflows)
- File upload difficulties
- Slow page loads on 3G/4G networks

**Implication:**
- This gap (75% traffic, 2.8% conversion) is Jalanea's PRIMARY opportunity
- Structured Builder solves input friction (tap-based, not type-based)
- Mobile-first design is not a nice-to-have, it's THE product
- Performance budget: <3 seconds on 3G, <200KB initial bundle

**Source:** Contentsquare, Baymard Institute, 2024

---

#### 6. Trust Signals Matter in High-Skepticism Contexts
**Finding:** 64% of consumers check for trust indicators when unfamiliar with a brand (78% for financial transactions).

**What Works:**
- Trust badges near commitment points (e.g., "Apply" button)
- Hover-over explanations ("We verify every employer")
- Context-dependent placement (not just headers)

**What Doesn't Work:**
- Generic badges without explanation
- Badges in low-visibility locations
- Over-reliance on badges without addressing root concerns

**Implication:**
- "Verified Safe" badge appears on job cards and job detail pages
- Scam Shield scores are visible (CRITICAL/HIGH/MEDIUM/LOW)
- Hover states explain verification process
- Absence of badge = triggers suspicion (we must verify ALL jobs)

**Source:** Baymard Institute, e-commerce trust studies, 2024

---

#### 7. Local Economic Multiplier Effect
**Finding:** When money is spent at local businesses, **68% stays in the community** vs **30% when spent at chains**.

**Brain Drain Impact:**
- Valencia College graduates relocate to big tech cities
- Local talent → San Francisco, Seattle, New York salaries
- Money earned → spent in those cities, not Orlando
- Communities that funded their education never benefit

**Implication:**
- Entrepreneurship track (Jalanea Forge) is not optional—it's core to mission
- Job matching should prioritize local employers (Orlando businesses)
- Community Fund reinvests revenue back into local business creation
- Success metrics must include community impact (not just individual outcomes)

**Source:** Local multiplier effect research, economic development studies

---

### Research-Driven Design Decisions

**Every feature in Jalanea Works can trace back to verified evidence:**

| Feature | Evidence | Source |
|---------|----------|--------|
| Mobile-first PWA | 28% smartphone-dependent | Pew Research |
| Structured Builder (no file upload) | 71% file upload difficulty, 92% abandonment | Appcast |
| Scam Shield (deterministic) | Employment scams #1 risk for 18-34 | FTC |
| Public Mode (SessionStorage) | Hardware keyloggers, session persistence | CISA, ALA |
| Shadow Calendar (transit time) | Time poverty, multiple survival jobs | User interviews |
| LYNX bus integration | Transit-dependent job seekers in Orlando | Local data |
| Skills Translation Engine | Retail → office career changer struggles | User interviews |
| Orlando salary calculator | Cost of living varies by city | Local economic data |
| Entrepreneurship track | 68% local multiplier effect | Economic development research |
| Community Fund | Prevent brain drain, keep wealth local | Mission-driven |

---

### Critical Thinking Playbook

**Before implementing ANY feature, we answer:**
1. **What is the claim?** (One clear sentence)
2. **What is the source?** (Peer-reviewed, government, industry, or user research)
3. **How strong is the evidence?** (Strong/Moderate/Weak/None)
4. **What would change our mind?** (Falsification criteria)

**Example:**
- **Claim:** "Mobile users abandon applications requiring file uploads."
- **Source:** Appcast report (2024), 71% difficulty rate
- **Strength:** Strong (large sample, recent, corroborating sources)
- **Falsification:** "If >50% of mobile users successfully upload without abandoning, we were wrong."
- **Decision:** Build Structured Builder as primary, keep upload as secondary.

This framework prevents "feature creep" and ensures every engineering hour solves a validated user problem.

---

## Target Users

### Primary Personas (100% of Design Effort)

**V1 Launch Focus:** Valencia College graduates and Orlando-area barrier-facing job seekers

#### 1. Marcus Williams (Essential Tier - Survival Mode, 40% of users)
**Profile:** 24-year-old Black male, warehouse worker at Amazon, Orlando FL  
**Background:** High school diploma, community college dropout (Valencia College - 1 semester), lives with grandmother in Pine Hills  
**Current Situation:** Just lost Amazon warehouse job, needs income within 7 days to help with rent  
**Constraints:**
- Smartphone-only (borrowed from grandmother)
- **No car** (LYNX bus only, 45-min commute limit from Pine Hills)
- Limited time (caring for grandmother evenings)
- Financial stress (no emergency fund)
- **Looking for:** Local jobs (<30 min commute), fast hiring

**Job Search Reality:**
- Applied to 132 jobs in 21 days (spray-and-pray)
- 3.5% response rate (ghosted constantly)
- ATS score: 38/100 (resume not optimized)
- Nearly fell for scam job ($200 "training materials" upfront)
- Emotional state: 2/10 (depression, anxiety, giving up)

**Success with Jalanea Works:**
- Day 1: Resume optimized (38 → 84 ATS score)
- Day 1: 8 strategic applications **within LYNX range** (vs 132 random)
- Day 3: 2 interview requests (Publix on Colonial, Target on OBT)
- Day 6: Offer accepted (Publix $15/hr, **15-min bus ride**)
- Emotional state improved: 6/10 average
- **Timeline: 7 days to hired (67% faster than baseline)**

**Orlando-Specific Needs:**
- LYNX bus route integration (Route 36, 50, 18)
- Max commute: <30 minutes from Pine Hills
- Jobs in accessible areas (Colonial, OBT, downtown)
- Orlando employers (Publix, Wawa, Target, Universal, Darden restaurants)

---

#### 2. Jasmine Chen (Starter Tier - Bridge Mode, 45% of users)
**Profile:** 24-year-old Asian female, retail shift lead at Old Navy (Millenia Mall), Orlando FL  
**Background:** **Valencia College alum** - Dual degrees (BAS Computing Technology & Software Development, AS Interactive Design), Google IT Support Certificate  
**Current Situation:** Wants to transition from retail ($32k) to office/tech role ($38-45k), currently employed but seeking bridge job  
**Constraints:**
- Must work current job (applying in spare time)
- Resume reads as "90% retail worker, 10% tech professional"
- Doesn't know which roles are bridge jobs vs dead-end admin
- No professional network in tech/office space
- **Looking for:** Orlando tech/healthcare offices, hybrid or in-person work

**Job Search Reality:**
- Applied to 240+ jobs over 84 days
- 5-7% response rate (most rejections)
- Interviewed for wrong roles (dead-end admin at $32k)
- Nearly accepted Old Navy assistant manager out of desperation ($42k retail)
- Skills translation gap: Can't articulate "POS troubleshooting" as "Technical Support"
- Emotional state: 4.8/10 average, lowest 3/10 (cried after rejection)

**Success with Jalanea Works:**
- Week 1: Skills Translation (retail → tech language, 45 → 82 ATS score)
- Week 1: Bridge Role Education (learned difference from dead-end admin)
- Week 2: 15 strategic bridge job applications **at Orlando healthcare/tech companies** (vs 240 spray-and-pray)
- Week 3: Tier 2 Bridge Job Pocket used on **dental office in Winter Park** (90-second intel: Culture Check 8.2/10, insider hiring context)
- Week 5: Offer received ($40k dental office coordinator, 20-min commute from UCF area)
- Week 6: Negotiated to $42k using platform coaching (+$2k)
- Emotional state improved: 7.2/10 average
- **Timeline: 35 days to offer (58% faster than baseline)**

**Orlando-Specific Needs:**
- Valencia College credential highlighting (BAS + AS degrees)
- Bridge jobs at Orlando employers (healthcare: AdventHealth, Orlando Health; tech: EA, Verizon Media)
- Salary range: $38-45k (Orlando market competitive for bridge roles)
- Commute: Personal car, willing to drive up to 45 minutes

**Future Path:** May start own business via **Jalanea Forge** (graphic design studio for Orlando restaurants)

---

#### 3. David Richardson (Premium Tier - Career Mode, 15% of users)
**Profile:** 43-year-old white male, Marketing Manager laid off from TechFlow (B2B SaaS), Orlando FL  
**Background:** 15 years experience, HubSpot certified, managed $200k budget, led team of 3  
**Current Situation:** Seeking Marketing Director role at Series A/B startup in Orlando or remote ($85-120k range), strategic 90-day search  
**Constraints:**
- Must make strategic moves (can't afford wrong role)
- Network not fully activated (doesn't know who knows who)
- Spending 4-6 hours manually researching each company
- Underselling himself (applying to Manager roles when qualified for Director)
- **Preference:** Orlando-based or remote (wants to stay in community)

**Job Search Reality:**
- Applied to 73 jobs over 112 days
- 15-20% response rate (good, but time-consuming)
- 292 hours spent on manual research (4-6 hrs per company)
- Company A: 4 interview rounds → 4 weeks ghosting → rejection (20+ hours wasted)
- No salary negotiation (accepted $110k immediately, left $5-10k on table)
- Emotional state: 5.3/10 average, lowest 4/10 (Company A ghosting)

**Success with Jalanea Works:**
- Week 1: Role Level Assessment ("You're Director-level, stop underselling")
- Week 1: 5 Tier 3 Career Job Pockets (5-10 min deep research vs 4-6 hours)
  - 8-page comprehensive report per company
  - **Orlando employers prioritized:** EA, Verizon Media, AdventHealth digital team, UCF tech partnerships
  - Hiring manager background (Sarah: ex-HubSpot, values metrics)
  - LinkedIn connection mapping (Mark Thompson → Sarah Martinez direct path)
  - Compensation benchmarking ($105-125k range for Director in Orlando market)
  - Culture Check 7.8/10 with pros/cons
- Week 2: 3 interview requests (60% response rate via referrals)
- Week 4: Panel interview with Sarah + CEO Alex (interviewer-specific prep)
- Week 8: Offer received ($110k base + 0.2% equity)
- Week 9: Negotiated to $115k + 0.22% equity using platform script (+$5k)
- Emotional state improved: 7.8/10 average
- **Timeline: 63 days to hired (44% faster), 267 hours saved**

**Orlando-Specific Needs:**
- Senior-level Orlando employers (EA, Verizon Media, AdventHealth)
- Remote-friendly roles (can stay in Orlando while working for national companies)
- Network activation among Orlando professionals
- Salary benchmarking for Orlando market ($85-120k competitive for Director)

**Future Path:** May mentor Valencia grads via Jalanea Works, invest in **Community Fund** local businesses

---

### Secondary Personas (Edge Case Coverage)
- **Alex Rivera** (Multi-Mode, 18-22%): Switches between Essential/Starter based on life circumstances
- **Riley Thompson** (Fair Chance, 8-12%): Returning citizen with criminal record, Valencia College student
- **Chris Martinez** (Homeless, 5-8%): Unstable housing, uses public library computers, Valencia College alum

### Design Priority Distribution
- **Essential (40%)**: Speed, simplicity, mobile-first, scam protection, **LYNX integration**
- **Starter (45%)**: Feature richness balanced with usability, skills translation, **Valencia credential highlighting**
- **Premium (15%)**: Advanced intelligence, deep research, network activation, **Orlando professional network**

---

## Competitive Landscape

### Market Reality: Crowded but Broken

The job search tools market is **fragmented** across three segments:
1. **Job Boards:** Indeed, ZipRecruiter, Snagajob (employer-focused, free for job seekers)
2. **Application Tracking:** Teal, Huntr ($29-40/mo, organizational tools)
3. **AI Resume Tools:** JobScan, Resume Worded ($19-50/mo, ATS optimization)

**Nobody combines all three** + emotional support + barrier-aware features + **community wealth-building**.

---

### Key Competitor Analysis

#### Indeed (345M users)
**What They Do Well:**
- Massive job volume (most jobs available anywhere)
- 1-click apply for some jobs
- Free for job seekers
- Mobile app works well
- Salary transparency

**What Users Complain About:**
- ⚠️ Scams and fake jobs (1.8-star rating on Trustpilot)
- ⚠️ Duplicate/outdated listings (>30 days stale)
- ⚠️ 60-80% ghosting rate (no response to applications)
- ⚠️ Poor ATS results (75% rejected before human review)
- ⚠️ No customer service
- ⚠️ Privacy concerns (resume leaks, account hacks)

**What They DON'T Do:**
- ❌ No trauma-informed rejection support
- ❌ No mode-based job filtering (Survival vs Career)
- ❌ No proactive scam verification
- ❌ No organized application tracking
- ❌ No transit time calculations
- ❌ No public device safety features
- ❌ **No local economic development mission**
- ❌ **No community wealth redistribution**

**Jalanea's Differentiation:**
- 🎯 Scam Shield (proactive blocking, not reactive reporting)
- 🎯 Survival Mode (pre-screened jobs, <30 min commute, fast hiring)
- 🎯 Rejection Support Coach (normalizes ghosting, provides encouragement)
- 🎯 Public Mode (library-safe, auto-logout, SessionStorage)
- 🎯 **LYNX bus integration (Orlando transit-dependent users)**
- 🎯 **Community Fund (30% revenue → local businesses)**
- 🎯 **Entrepreneurship track (create jobs, not just find jobs)**

---

#### Teal ($29-39/month, 650K users)
**What They Do Well:**
- All-in-one platform (tracking + resume + cover letter)
- Chrome extension (4.9 stars, 3,100+ reviews)
- Job tracker is visual and intuitive (Kanban board)
- Generous free tier (unlimited tracking for up to 100 jobs)

**What Users Complain About:**
- ⚠️ Expensive ($29/mo for full features)
- ⚠️ Still requires manual work (no auto-apply)
- ⚠️ AI generates generic content (heavy editing required)
- ⚠️ Match scores aren't accurate
- ⚠️ Limited templates (plain designs)
- ⚠️ PDF-only export (can't edit in Word/Google Docs)

**What They DON'T Do:**
- ❌ No stress/overwhelm support
- ❌ No mode-based workflows (treats all users the same)
- ❌ No scam verification
- ❌ No transit time calculations
- ❌ No public device safety
- ❌ No trauma-informed rejection support
- ❌ **No local focus or community mission**

**Jalanea's Differentiation:**
- 🎯 Cheaper ($15-75 vs $29-39)
- 🎯 Mode-adaptive (Survival/Bridge/Career workflows)
- 🎯 Trauma-informed (Rejection Support, Emergency Mode)
- 🎯 Barrier-aware (Fair Chance, transit, public devices)
- 🎯 **Community-first (Light the Block mission)**

---

### Our Unique Position

**Nobody else combines ALL of these:**

1. **Mode-Adaptive Workflows**
   - Nobody else: One-size-fits-all approach
   - Jalanea: Survival/Bridge/Career modes with different features/complexity

2. **Trauma-Informed Emotional Support**
   - Nobody else: Focuses on logistics, ignores stress
   - Jalanea: Rejection Coach, Emergency Mode, no shame-based language

3. **Barrier-Aware Filtering**
   - Nobody else: Generic job search
   - Jalanea: Fair Chance, **transit time (LYNX)**, seated work, shift flexibility

4. **Public Device Safety**
   - Nobody else: Assumes users have personal devices
   - Jalanea: SessionStorage, auto-logout, QR logout for library use

5. **Local Economic Development Mission**
   - Nobody else: Individual success only
   - Jalanea: **Community wealth-building, prevent brain drain, 30% Community Fund**

6. **Entrepreneurship Integration**
   - Nobody else: Job search only
   - Jalanea: **Create jobs (Jalanea Forge), not just find jobs**

7. **Comprehensive All-in-One Platform**
   - Indeed/ZipRecruiter: Job search only
   - Teal/Huntr: Tracking + resume, but no emotional support
   - JobScan: Resume only
   - Jalanea: Job search + Resume + Tracking + Coaching + Rejection Support + **Entrepreneurship**

---

### Pricing Strategy

**Competitor Pricing:**
| Competitor | Free Tier | Paid Tier | What You Get |
|------------|-----------|-----------|--------------|
| **Indeed** | ✅ Full access | N/A (employers pay) | Job search, basic tracking |
| **Teal** | ✅ Limited | $29-39/mo | 1 resume, 100 jobs → Unlimited AI |
| **Huntr** | ✅ Limited | $40/mo | 100 jobs → Unlimited tracking |
| **JobScan** | ✅ 5 scans/mo | $50/mo | ATS scanning → Unlimited |

**Jalanea Works Pricing:**
| Tier | Price | What You Get | Revenue Allocation |
|------|-------|--------------|-------------------|
| **Essential** | $15/mo | Survival Mode features, Tier 1 Job Pockets, Daily Plan, Scam Shield, Public Mode, **LYNX integration** | 40% Ops, 30% Community Fund, 20% Expansion, 10% Scholarships |
| **Starter** | $25/mo | Everything in Essential + Skills Translation, Tier 2 Bridge Pockets, Culture Check, Negotiation Coaching, **Valencia credential highlighting** | Same allocation |
| **Premium** | $75/mo | Everything in Starter + Tier 3 Career Pockets, LinkedIn Mapping, Hiring Manager Intel, Comprehensive Negotiation, **Orlando network access** | Same allocation |

**Special Considerations:**
- **Pell Grant Recipients:** 10% of revenue funds scholarships to cover premium costs
- **Nonprofit Partnerships:** $50 per hire (secondary revenue model)
- **Community Reinvestment:** 30% → grants for Valencia grad businesses (not profit extraction)

**Why This Works:**
- ✅ Essential ($15) is cheaper than Teal ($29) and Huntr ($40)
- ✅ Starter ($25) is competitive with Teal ($29) but includes more features
- ✅ Premium ($75) includes features competitors charge $100+ for separately
- ✅ 7-day free trial lowers barrier to entry
- ✅ **30% reinvested locally** (not shareholders, not VC, THE COMMUNITY)
- ✅ Core features (Scam Shield, Public Mode, Rejection Support) available in ALL tiers

---

### Market Opportunities

**1. Indeed's Reputation is Terrible (1.8 stars)**
- Users are desperate for alternatives
- Opportunity: Position as "Indeed, but actually good"

**2. Teal/Huntr are Too Expensive**
- $29-40/mo is prohibitive for hourly workers
- Opportunity: Capture price-sensitive users

**3. Nobody Serves Barrier-Facing Users Comprehensively**
- Honest Jobs only addresses criminal records
- Opportunity: Be the ONLY platform for ALL barriers

**4. Nobody Has Local Economic Development Mission**
- All platforms optimize for individual success
- Opportunity: **First platform that keeps talent + wealth local**

**5. No Platform Integrates Entrepreneurship**
- Job search platforms assume "find job = success"
- Opportunity: **"Create jobs, not just find jobs" (Jalanea Forge integration)**

**6. Mobile-First is Critical**
- 28% smartphone-dependent, 75% traffic is mobile
- Opportunity: PWA works offline, installs like native app

---

### Strategic Positioning

**Market Gap:** Job search market is crowded but nobody serves barrier-facing users comprehensively **while building community wealth**.

**Jalanea Works' Strategy:**
1. **Mode-Adaptive** (Survival/Bridge/Career workflows)
2. **Trauma-Informed** (Rejection support, no shame language)
3. **Barrier-Aware** (Fair Chance, **LYNX transit**, public devices)
4. **All-in-One** (Job search + Resume + Tracking + Coaching)
5. **Affordable** ($15-75 vs $29-50 competitors)
6. **Community-First** (**Light the Block, 30% Community Fund**)
7. **Entrepreneurship-Integrated** (**Jalanea Forge, create jobs**)

**Competitive Advantages:**
- Nobody else combines ALL of these
- Indeed has volume but terrible UX + no support + no community mission
- Teal/Huntr have tools but expensive + no emotional support + no local focus
- Honest Jobs has niche but limited scope
- **We capture users falling through the cracks AND build community wealth**

**Defense Against Competition:**
- Speed to market (launch V1 Orlando in 12 weeks)
- Community building (loyal users who share success stories)
- **Local employer partnerships** (Orlando businesses hire Valencia grads)
- **Community Fund creates brand loyalty** (users see where revenue goes)
- Nonprofit partnerships (distribution channel competitors don't have)
- Evidence-based iteration (data-driven, not trend-driven)

---

## Core Solution

### The Three-Tier System

Jalanea Works adapts to user needs through a tiered subscription model where complexity scales with career stage and search timeline.

**All tiers prioritize Orlando-area opportunities and Valencia College credentials.**

---

#### **Essential Tier - $15/month**
**Target User:** Marcus Williams (Survival Mode)  
**Timeline:** 7-10 days to hired  
**Platform:** Mobile-first (smartphone-only users)  
**Geography:** **Orlando metro area, LYNX-accessible jobs**

**Core Features:**
- **Tier 1 Job Pockets** (20-second qualification screening)
  - ✓ Qualification check (100% match confirmation)
  - Quick Brief (salary, requirements, **location + LYNX route**)
  - Your Talking Points (how to position experience)
  - Interview Questions (2-3 likely questions)
  - Red Flags: None detected
  - Recommendation: APPLY NOW or SKIP
  
- **Daily Plan** (Structure from chaos)
  - AI-generated daily application plan (8 jobs/day)
  - **Map view showing LYNX routes** (Route 36, 50, 18, etc.)
  - Progress tracking (3/8 applications today)
  - **Commute time calculator** (<30 min from Pine Hills, Parramore, etc.)
  
- **ATS Resume Optimization** (Immediate win)
  - Transform resume: 38 → 82+ ATS score
  - Evidence-based (no hallucinated experience)
  - One-tap download (PDF optimized)
  
- **Basic Interview Prep**
  - Company overview (**Orlando employers**: Publix, Wawa, Universal, Disney)
  - Common interview questions (generic)
  - Your best examples (from work history)
  - Follow-up template (thank-you text)

- **Shadow Calendar** (Transit time protection)
  - Auto-generates **LYNX bus travel time** between shifts
  - Detects scheduling conflicts before application
  - Prevents over-commitment

- **Scam Shield** (Deterministic protection)
  - CRITICAL: Auto-block (e.g., upfront payment)
  - HIGH: Warning + gate (e.g., vague description)
  - MEDIUM: Warning only (e.g., remote emphasis)
  - LOW: No warning (clean job)

- **Apply Copilot** (External orbit tracking)
  - Pre-flight checks (scam detection, schedule conflicts)
  - Tracks when user leaves site to apply elsewhere
  - Debrief workflow when user returns
  - Captures application result (applied, skipped, rejected)

**Orlando-Specific Features:**
- **LYNX Route Integration:** Jobs tagged with nearest bus routes
- **Commute Calculator:** "15 min from Pine Hills via Route 36"
- **Local Employers:** Publix, Wawa, Target, Universal, Disney, AdventHealth, Darden Restaurants
- **Fast Hiring Filter:** Employers known to hire within 1-2 weeks

**Success Metrics:**
- ✓ 75%+ hired within 10 days
- ✓ 6.5+ emotional average (vs 2.0 baseline)
- ✓ 20%+ callback rate (vs 3.5% baseline)
- ✓ 90%+ ATS score post-optimization
- ✓ **80%+ jobs accepted are <30 min commute** (transit accessibility)

---

#### **Starter Tier - $25/month**
**Target User:** Jasmine Chen (Bridge Mode)  
**Timeline:** 8 weeks to hired  
**Platform:** Mobile + Desktop hybrid  
**Geography:** **Orlando metro area, Valencia College credential-focused**

**All Essential Features, Plus:**

- **Tier 2 Bridge Job Pockets** (90-second company + culture intelligence)
  - The Role (detailed breakdown)
  - Why They're Hiring (insider context)
  - What They Want (positioning advice)
  - **Culture Check: 8.2/10** (pros/cons, work-life balance, advancement)
  - Your Positioning (how to present yourself)
  - Red Flags: Identified or None
  - Recommendation: PRIORITY APPLICATION
  - **Allocation:** 1 Tier 2 Pocket per month (use strategically)

- **Skills Translation Engine** (Retail → Tech transformation)
  - Before/After transformation:
    - "Fixed POS crashes" → "Technical Problem Resolution & System Troubleshooting"
    - "Trained staff on software" → "End User Training & Software Implementation"
  - ATS score improvement: 45 → 82+
  - Resume restructure (tech professional framing)
  - **Valencia certificate elevation** (Google IT Support → prominent placement)

- **Bridge Role Education**
  - ❌ Dead-End Admin Jobs: Office Assistant ($30-35k), no tech, no growth
  - ✓ Bridge Jobs: Healthcare Coordinator ($38-45k), tech component + advancement
  - Role screening (filter out dead-ends)
  - **Orlando market context** (bridge roles at AdventHealth, Orlando Health, EA)

- **Company-Specific Interview Prep**
  - Company values and culture
  - Role-specific questions (dental office: "Why long-term?")
  - Industry context (healthcare, tech, etc.)
  - Mock interview (AI practice)

- **Salary Negotiation Coaching**
  - Market salary data (**$38-44k for dental coordinators in Orlando**)
  - Negotiation script ("Based on my Valencia College degree + Google IT Certificate...")
  - Likely outcome prediction ($42k target)
  - Confidence building (first professional job)

- **Cover Letter Templates** (Career changer framing)
  - Pre-written, customizable
  - Confident tone (not apologetic)
  - Mentions relevant skills (Dentrix, tech-comfort, **Valencia credentials**)

**Orlando-Specific Features:**
- **Valencia Credential Highlighting:** Automatic prominence for Valencia degrees/certs
- **Orlando Bridge Employers:** AdventHealth, Orlando Health, EA, Verizon Media
- **Orlando Salary Calculator:** "$42k in Orlando = $1,150 rent, comfortable 1BR"
- **Local Networking:** Valencia alumni connections for mentorship

**Success Metrics:**
- ✓ 70%+ hired within 8 weeks
- ✓ 7.0+ emotional average (vs 4.8 baseline)
- ✓ 20%+ callback rate (via skills translation)
- ✓ 80%+ ATS score post-optimization
- ✓ 50%+ negotiate salary successfully
- ✓ **60%+ hired at Orlando employers** (local job retention)

---

#### **Premium Tier - $75/month**
**Target User:** David Richardson (Career Mode)  
**Timeline:** 12 weeks to hired  
**Platform:** Desktop-optimized (complex data, reports)  
**Geography:** **Orlando + remote roles (stay in community)**

**All Starter Features, Plus:**

- **Tier 3 Career Job Pockets** (5-10 minute deep research, 8-page report)
  1. **Company Overview**
     - Funding status (Series B $18M, 3 months ago)
     - Investors, revenue, growth trajectory ($5M → $15M ARR target)
     - CEO background (ex-Stripe Growth Lead)
     - **Orlando presence** (if local) or **remote-friendly** (if distributed)
  
  2. **The Role**
     - Marketing Director (first director hire)
     - Reports to VP Growth (Sarah Martinez)
     - Team building (2-3 in first year)
     - Compensation: **$105-125k base (Orlando market)** + 0.15-0.25% equity
  
  3. **Hiring Manager Deep Dive**
     - Sarah Martinez: Ex-HubSpot (8 years, 0 → $50M pipeline)
     - Leadership style: Data-obsessed, collaborative, high EQ
     - Employee rating: 4.5/5 as manager
     - What she values: Metrics, HubSpot background, scrappy execution
     - **Orlando connections** (if applicable)
  
  4. **LinkedIn Connection Mapping**
     - Direct path identified: You → Mark Thompson → Sarah Martinez
     - Mark worked with Sarah at HubSpot (2019)
     - Referral template provided
     - Alternative paths (2nd-degree, 3rd-degree)
     - **Orlando professional network** (Valencia alumni, Orlando Tech Association)
  
  5. **Culture Check: 7.8/10**
     - Pros: Fast-paced but fair, data-driven, strong leadership
     - Cons: Long hours during sprints, ambiguity tolerance needed
     - Work-life balance: 3.5/5
     - Advancement opportunity: High (first director hire)
     - **Remote work policy** (if staying in Orlando)
  
  6. **Compensation Analysis**
     - Market: **$105-125k for Marketing Directors (Orlando/remote)**
     - Your positioning: 15 years exp → top of range justified
     - Target: $115-120k base + 0.2%+ equity
     - Equity value: 0.2% at $18M = $36k paper value
     - **Orlando cost-of-living adjustment** (if relocating from SF/NYC, show savings)
  
  7. **Interview Preparation**
     - Sarah's questions: "Scale demand gen 3x?" (she did at HubSpot)
     - CEO Alex's questions: "First 90 days plan?" (strategic test)
     - Your competitive edge: Mark's referral + HubSpot background
     - Mock interviews (AI as Sarah, AI as Alex)
  
  8. **Strategic Positioning**
     - Lead with: "Data-driven growth marketer, 15 years B2B SaaS"
     - Frame layoff: "TechFlow restructured, seeking high-growth environment"
     - Questions to ask: "What does success look like in first year?"
     - **If Orlando employer:** "Excited to contribute to Orlando's tech ecosystem"
  
  - **Allocation:** 5 Tier 3 Pockets per month (strategic targeting)

- **Role Level Assessment**
  - Experience analysis (15 years)
  - Budget responsibility ($200k)
  - Team size (3 people)
  - Assessment: "You're qualified for Director roles" (confidence boost)
  - **Orlando market positioning** (Director roles at EA, Verizon Media, AdventHealth)

- **LinkedIn Connection Mapping** (Network activation)
  - 2nd-degree connection paths
  - Optimal referral route (strongest path)
  - Referral email templates
  - Connection strength analysis
  - **Orlando professional network** (Valencia alumni, local tech community)

- **Hiring Manager Intelligence**
  - Background (ex-HubSpot, 8 years)
  - Leadership style (data-obsessed, collaborative)
  - What they value (metrics, relevant experience)
  - Interview approach (conversational but deep)
  - Employee rating (4.5/5 from team reviews)
  - **Orlando connections** (if applicable)

- **Interviewer-Specific Interview Prep**
  - Sarah's questions (HubSpot background)
  - CEO Alex's questions (Stripe background)
  - Your positioning for each interviewer
  - Mock interview with AI as specific people

- **Comprehensive Salary Negotiation**
  - Base salary benchmarking (**$105-125k range for Orlando market**)
  - Equity calculator (0.2% at $18M = $36k)
  - Total comp analysis (base + equity paper value)
  - Negotiation script ("Based on my 15 years experience...")
  - Counteroffer strategy
  - Competing offer management
  - **Cost-of-living advantage** (if staying in Orlando vs moving to SF/NYC)

**Orlando-Specific Features:**
- **Orlando Senior Employers:** EA, Verizon Media, AdventHealth, UCF partnerships
- **Remote-Friendly Filter:** Companies that allow Orlando-based remote work
- **Orlando Network Mapping:** Valencia alumni, Orlando Tech Association, local VCs
- **Salary Benchmarking:** "$115k in Orlando = $120-140k equivalent in SF" (cost of living)

**Success Metrics:**
- ✓ 80%+ hired within 12 weeks
- ✓ 7.5+ emotional average (vs 5.3 baseline)
- ✓ 40%+ callback rate (via referrals)
- ✓ 60%+ negotiate salary successfully
- ✓ 70%+ retention post-employment
- ✓ **50%+ stay in Orlando** (prevent brain drain to SF/NYC/Seattle)

---

### Core Platform Features (All Tiers)

These features are available to all users regardless of tier:

#### **Jobs Hub** (Discovery & Triage)
- Constraint-aware job filtering (**LYNX transit**, schedule, credentials)
- **Scam Shield** with deterministic safety scoring
- Job Card design optimized for scanability (44×44px touch targets)
- Mode-adaptive complexity (show what user needs, hide what they don't)
- **Orlando employer prioritization** (local businesses highlighted)

#### **Job Pocket** (Depth-Adaptive Workflow)
- **Essential**: Tier 1 (20 seconds) - Qualification + Quick Brief + **LYNX route**
- **Starter**: Tier 2 (90 seconds) - Company + Culture Intelligence + **Valencia credential match**
- **Premium**: Tier 3 (5-10 minutes) - Deep Research + 8-Page Report + **Orlando network**
- Progress tracking prevents re-work
- Can save and return without losing context

#### **Resume Studio**
- Evidence-based resume generation (no hallucinated experience)
- ATS optimization with keyword scoring
- Hybrid export bundle (DOCX + PDF with metadata scrubbing)
- Downshift strategy for overqualified applicants
- Mode-adaptive: Simple for Essential, sophisticated for Premium
- **Valencia credential highlighting** (automatic prominence)

#### **Smart Schedule (Shadow Calendar)**
- Auto-generates **LYNX bus travel time** between shifts
- Detects scheduling conflicts before application
- Compassionate recovery mechanics for missed commitments
- Integrates with Apply Copilot to prevent over-commitment

#### **Career Coach**
- OSKAR framework (Outcome, Scaling, Know-how, Affirm, Review)
- Maslow-aware triage (safety needs before growth goals)
- Trauma-informed guidance (no toxic positivity)
- Interview simulator with role-specific scenarios
- Rejection recovery support
- **Entrepreneurship guidance** (when ready to explore Jalanea Forge)

#### **Apply Copilot**
- Pre-flight safety checks (scam detection, **LYNX conflicts**)
- External orbit: Tracks when user leaves site to apply elsewhere
- Debrief workflow: Captures application result when user returns
- Return detection via navigation timing

#### **Tracker**
- State machine: DISCOVERED → POCKETED → APPLIED → INTERVIEWING → OFFER | REJECTED | ARCHIVED
- Daily application statistics benchmarked to tier
- Stress Workflow Planner: AI-generated daily application plans
- Enhanced rejection support with proactive trigger

#### **Entrepreneurship Track** (NEW - Core Feature)
- **When to Surface:** After 30 days using platform OR when user expresses interest
- **Jalanea Forge Integration:** Link to business launch platform
- **Resources Provided:**
  - Florida SBDC at UCF (free consulting)
  - SCORE Orlando (free mentorship)
  - Starter Studio (accelerator)
  - Grant opportunities (Orange County Microbusiness Grant, BBIF, SBA)
  - Step-by-step LLC filing guide (sunbiz.org)
- **Business Ideas for Valencia Grads:**
  - Graphic & Interactive Design: Branding studio, social media agency, UI/UX consulting
  - Computing & Software Development: Web dev agency, tech support, app development
  - Any Background: Event planning, tutoring, food truck, virtual assistant
- **Community Fund Connection:** "When you launch a business via Jalanea Forge, you may be eligible for Community Fund grants"

---

### Safety & Privacy Features (All Tiers)

#### **Scam Shield**
Deterministic rubric based on FTC red flags:
- **CRITICAL:** Block entirely (e.g., upfront payment demanded)
- **HIGH:** Warning + gate (e.g., vague job description)
- **MEDIUM:** Warning only (e.g., remote work emphasized)
- **LOW:** No warning (clean job)

**Special Valencia Focus:**
- Flags "University/Research Assistant" scams targeting students
- Blocks check cashing schemes
- Warns about spoofed Valencia domain emails

#### **Public Mode Hardening**
For library computers and borrowed devices:
- 15-minute idle timeout with aggressive logout
- SessionStorage only (no LocalStorage persistence)
- Clear-Site-Data header on logout
- QR code logout for quick exit
- Zip3-only analytics (k-anonymity)

#### **Privacy-First Architecture**
- No PII in logs or analytics
- Data minimization by design
- 30-day resume deletion grace period
- 7-day account deletion grace period
- Consent required for Career Coach data access
- **Location data:** Only used for LYNX route calculation, never sold

---

## Platform Architecture

### Information Architecture (166 Pages)

**Public Site (25 pages):**
- Homepage (**Light the Block mission**)
- Pricing (with **Revenue Transparency**)
- How It Works
- Success Stories (Marcus, Jasmine, David)
- Blog (job search tips, platform updates)
- About (**Community Over Individuality**)
- **Start a Business** page (Jalanea Forge integration)
- Terms, Privacy, Help Center

**Authentication (4 pages):**
- Sign Up (Email, Google, Apple OAuth)
- Login, Password Reset

**Onboarding (24 pages - 8 per tier):**

**V1 ACTUAL Onboarding (Orlando-Specific):**
1. **Step 1 of 2: Your Foundation**
   - Full Name
   - Commute Start Point (Use My Location)
   - Digital Presence (LinkedIn, Portfolio - optional)
   - Education & Credentials (**Valencia College degrees/certs**)

2. **Step 2 of 2: Mission Logistics**
   - **How do you get to the mission?** (Personal Car, LYNX Bus, Rideshare, Walk/Bike)
   - **Max Commute Willingness** (Local <30 min, Standard <60 min, Any Distance 60+ min)
   - **When are you available?** (Open to anything, Weekdays, Weekends, Flexible, Specific days)
   - **Preferred shift times** (Morning, Afternoon, Evening, Overnight, No preference)

3. **Step 3 of 2: Salary Target**
   - **Salary range:** $30-40k (Entry), $40-52k (Growing), $52-62k (Comfortable), $62-75k (Established), $75-90k (Thriving), $90k+ (Advanced)
   - **Orlando Budget Calculator:**
     - "In Orlando, this salary lets you comfortably afford:"
     - Rent: $1,000-1,300/mo (1BR apartment)
     - Monthly budget breakdown (Housing 40%, Utilities 5%, Transportation 15%, Food 12%, Fun 13%, Savings 15%)
     - Visual budget pie chart

4. **Your Path: Common Challenges**
   - Safe Zone: "This info is used to find support resources, NOT to filter your applications"
   - Common Challenges (tap to add): Single parent, No reliable car, Health challenges, English is 2nd language, Need immediate income, Criminal record
   - Tell us about your situation (optional text field)

5. **Goal Selection**
   - Survival Mode: Need income within 7-10 days
   - Bridge Mode: Career transition in 8 weeks
   - Career Mode: Strategic search over 12 weeks

**Then flows into tier-specific onboarding:**
- Essential: Resume → ATS Optimization → Daily Plan → Job Pocket → Apply → Complete
- Starter: Resume → Skills Translation → Bridge Education → Matching → Bridge Pocket → Apply → Complete
- Premium: Resume → Role Level → Demo → Matching → Tier 3 Pocket → LinkedIn Mapping → Apply → Complete

**Core Application (45 pages):**
- Dashboard (tier-specific views)
- Jobs (search, detail, pocket, apply) + **LYNX route display**
- Applications (tracking, timeline, notes)
- Interviews (detail, prep, mock, debrief)
- Offers (analysis, negotiate, accept)
- Resume (edit, optimize, versions) + **Valencia credential highlighting**
- Profile (edit, preferences)
- **Entrepreneurship** (Start a Business page, Jalanea Forge link)

**Tier-Specific Features (35 pages):**
- Essential (8): Daily Plan, Tier 1 Pockets, Basic Prep, Check-Ins, **LYNX integration**
- Starter (12): Skills Translation, Bridge Education, Tier 2 Pockets, Company Prep, Negotiation, **Valencia credential highlighting**
- Premium (15): Role Level, Tier 3 Pockets, LinkedIn Mapping, Hiring Manager Intel, Interviewer Prep, **Orlando network**

**Settings & Support (23 pages):**
- Account, Billing, Notifications, Referrals
- Help Center (categories, articles)
- Contact Support, Feature Requests
- **Community Fund Transparency** (where revenue goes)

**Admin Tools (10 pages):**
- User management, analytics, content management
- **Community Fund Dashboard** (grants awarded, businesses funded)

---

### User Journeys

**Complete Documentation:**
- 6 journey maps (3 personas × current state / future state)
- Marcus: 21 days → 7 days (67% faster) **WITH LYNX integration**
- Jasmine: 84 days → 35 days (58% faster) **WITH Valencia credentials**
- David: 112 days → 63 days (44% faster) **WITH Orlando network**

**Journey Map Insights:**
- Essential users: Need speed, structure, emotional support, **LYNX transit clarity**
- Starter users: Need skills translation, bridge role clarity, culture validation, **Valencia credential prominence**
- Premium users: Need time efficiency, deep intelligence, network activation, **Orlando professional connections**

---

### Onboarding Flows

**V1 Orlando Launch Onboarding:**
- Step 1: Foundation (Name, Location, Valencia Credentials)
- Step 2: Mission Logistics (LYNX/Car, Commute, Availability, Shifts)
- Step 3: Salary Target (Orlando Budget Calculator)
- Step 4: Common Challenges (Barriers, Support Resources)
- Step 5: Goal Selection (Survival/Bridge/Career)
- Then: Tier-specific onboarding (5-20 minutes depending on tier)

---

## Current Phase

### V1 MVP (12-Week Launch Timeline)

**Development Approach:** Solo developer (Alexus) with AI assistance (Claude Code)

**Launch Strategy:** Orlando-first (Valencia College grads) → Florida expansion → Nationwide

**Phase Breakdown:**

**Weeks 1-4: Core Infrastructure**
- Next.js app scaffold (App Router)
- Supabase setup (PostgreSQL + Auth + Row-Level Security)
- Passkey authentication (FIDO2/WebAuthn)
- Public Mode session management (15-min timeout, SessionStorage only)
- **Orlando-specific data:** LYNX routes, Valencia credentials, local employers
- Basic responsive layout (mobile-first)

**Weeks 5-8: Core Feature Modules**
- Jobs Hub with Indeed API integration + **Orlando job filtering**
- Job Pocket workflows (Tier 1 / Tier 2 / Tier 3 variants)
- **LYNX Route Integration** (Google Maps API for transit times)
- **Orlando Salary Calculator** (cost-of-living data)
- Scam Shield deterministic scoring
- Shadow Calendar basic version (**LYNX transit time blocking**)
- Apply Copilot (external orbit tracking)
- Tracker with state machine

**Weeks 9-11: AI-Powered Features**
- Resume Studio with Gemini 3 Flash (Essential/Starter optimization)
- **Valencia credential auto-detection and highlighting**
- Skills Translation Engine (Gemini 3 Flash)
- Tier 2 Bridge Job Pockets (Gemini 3 Flash + Google Search grounding) + **Orlando employer focus**
- Tier 3 Career Job Pockets (Gemini 3 Pro Deep Research agent) + **Orlando network mapping**
- Career Coach OSKAR implementation
- Stress Workflow Planner (daily application plans)

**Week 12: Polish and Launch Prep**
- User testing with beta cohort (100 users via **Valencia College partnerships**)
- Performance optimization (mobile 3G testing)
- Accessibility audit (WCAG 2.2 Level AA)
- **Community Fund setup** (30% revenue allocation infrastructure)
- Documentation and handoff materials

---

### V1 Scope (Must-Have)

**Core Platform:**
- ✓ Three-tier subscription system (Essential/Starter/Premium)
- ✓ Tier switching (users can upgrade/downgrade)
- ✓ Job discovery with constraint filtering
- ✓ Depth-adaptive Job Pockets (Tier 1/2/3)
- ✓ **LYNX Route Integration** (Orlando transit)
- ✓ **Valencia Credential Highlighting**
- ✓ **Orlando Salary Calculator**
- ✓ Shadow Calendar (**LYNX transit time blocking**)
- ✓ Tracker with state machine
- ✓ Public Mode with 15-min timeout
- ✓ Scam Shield (deterministic only)
- ✓ Apply Copilot (external orbit tracking)

**Onboarding:**
- ✓ **V1 Orlando Onboarding** (5 steps: Foundation, Logistics, Salary, Challenges, Goal)
- ✓ LYNX/Car/Rideshare/Walk selection
- ✓ Max commute willingness (<30 min, <60 min, any)
- ✓ Availability & shift preferences
- ✓ **Orlando Budget Calculator** (salary → rent → monthly budget)
- ✓ Common challenges (barrier detection for support resources)
- ✓ Tier-specific flows (Essential 5-10 min, Starter 10-15 min, Premium 15-20 min)

**Authentication:**
- ✓ Passkey authentication (FIDO2/WebAuthn)
- ✓ Magic link backup
- ✓ Google/Apple OAuth
- ✓ QR code cross-device login

**AI Features:**
- ✓ Resume Studio (evidence-based generation)
- ✓ ATS optimization (keyword scoring)
- ✓ **Valencia credential detection & prominence**
- ✓ Skills Translation Engine (Starter tier)
- ✓ Tier 2 Bridge Job Pockets (90-second intel)
- ✓ Tier 3 Career Job Pockets (5-10 minute deep research)
- ✓ Career Coach (OSKAR conversations only)

**Orlando-Specific:**
- ✓ **LYNX route database** (all bus routes with stops)
- ✓ **Transit time calculator** (Google Maps API integration)
- ✓ **Orlando employer database** (Publix, Wawa, Universal, Disney, AdventHealth, EA, Verizon Media, etc.)
- ✓ **Valencia College credential database** (BAS, AS, certificates)
- ✓ **Orlando salary data** (rent prices, budget breakdowns by income level)

**Community Features:**
- ✓ **Entrepreneurship page** (Start a Business, Jalanea Forge link)
- ✓ **Community Fund infrastructure** (30% revenue allocation tracking)
- ✓ **Revenue Transparency Dashboard** (users see where money goes)

---

### V1 Exclusions (Post-Launch)

**Advanced Features (V1.1 - After Orlando Launch):**
- Contact Finder (LinkedIn scraping for hiring manager emails)
- Google Voice integration (interview call management)
- Financial coaching (budgeting, emergency fund)
- Post-hire support (90-day check-ins, advancement coaching)
- Advanced cover letter generator (multi-paragraph, company-specific)
- Salary negotiation simulator (role-play practice)
- **Community Fund grant application portal** (for Valencia grad businesses)

**Platform Enhancements (V1.2 - Florida Expansion):**
- Tampa launch (USF, Hillsborough Community College)
- Jacksonville launch (FCCJ, UNF)
- Miami launch (MDC, FIU)
- Multi-city transit integration (Tampa: HART, Jacksonville: JTA, Miami: Metrorail)

**V2.0 Features (Nationwide Expansion):**
- Mobile app (iOS/Android native)
- Multi-language support (Spanish, Haitian Creole)
- Advanced analytics dashboard (user insights)
- Referral program automation
- **White-label platform** (other cities can replicate "Light the Block")
- Nonprofit partner portal (client tracking)

---

### Tech Stack

**Frontend:**
- React 18 + Next.js 14 (App Router)
- TypeScript (type safety)
- Tailwind CSS (utility-first styling)
- Shadcn UI (component library)

**Backend:**
- Supabase (PostgreSQL + Auth + Row-Level Security)
- Supabase Edge Functions (serverless API)
- Row-level security (RLS) for data isolation

**AI & ML:**
- Gemini 3 Flash (Essential/Starter features: resume optimization, skills translation, Tier 2 Job Pockets)
- Gemini 3 Pro (Premium features: Tier 3 Career Job Pockets with Deep Research agent)
- Multi-AI routing (DeepSeek for cost optimization on select features)

**External APIs:**
- Indeed API (job listings)
- **Google Maps API** (LYNX transit times, commute calculation)
- LinkedIn API (connection data for Premium)
- Google Search API (web grounding for Tier 2/3 Job Pockets)

**Orlando-Specific Data:**
- **LYNX Open Data** (bus routes, stops, schedules)
- **Orange County GIS** (geographic data for commute calculation)
- **Valencia College API** (if available, for credential verification)
- **Orlando Economic Development** (local employer database)

**Authentication:**
- Passkeys (FIDO2/WebAuthn) - primary
- Magic links (email-based) - backup
- OAuth (Google, Apple) - convenience

**Hosting & Infrastructure:**
- Vercel (frontend deployment, edge functions)
- Supabase Cloud (PostgreSQL database, authentication)
- Cloudflare (CDN, DDoS protection)

**Cost Estimate:**
- Development: $0 (solo developer, AI assistance)
- Hosting: $10-30/month operational budget (Vercel Pro + Supabase)
- AI API costs: ~$50-100/month at 100 users
- Google Maps API: ~$20-40/month (transit API calls)
- Total: **~$100-170/month** operational

**Revenue Model (enables sustainability):**
- Essential: $15/mo × 40 users = $600
- Starter: $25/mo × 45 users = $1,125
- Premium: $75/mo × 15 users = $1,125
- **Total at 100 users: $2,850/mo**
- **After costs ($170): $2,680 profit**
- **Allocation:** 40% ops ($1,072), 30% Community Fund ($804), 20% expansion ($536), 10% scholarships ($268)

---

## Success Metrics

### V1.0 Launch Metrics (100 Beta Users - Valencia College)

**User Acquisition:**
- 100 beta users recruited via **Valencia College partnerships** (Career Services, SBDC, student organizations)
- 80% completion rate for tier-specific onboarding
- 60% monthly active user rate (return after Week 1)

**Job Search Effectiveness:**

**Essential Tier:**
- **75% hired within 10 days** (target: 7-10 days)
- 20%+ callback rate (vs 3.5% baseline)
- 90%+ ATS score post-optimization (vs 38 baseline)
- 6.5+ emotional average (vs 2.0 baseline)
- **80%+ jobs accepted are <30 min LYNX commute** (transit accessibility)

**Starter Tier:**
- **70% hired within 8 weeks** (target: 56 days)
- 20%+ callback rate (via skills translation)
- 80%+ ATS score post-optimization (vs 45 baseline)
- 7.0+ emotional average (vs 4.8 baseline)
- 50%+ negotiate salary successfully
- **60%+ hired at Orlando employers** (local job retention)

**Premium Tier:**
- **80% hired within 12 weeks** (target: 84 days)
- 40%+ callback rate (via referrals)
- 60%+ negotiate salary successfully
- 7.5+ emotional average (vs 5.3 baseline)
- Average salary increase: $5-10k via negotiation
- **50%+ stay in Orlando** (prevent brain drain to SF/NYC/Seattle)

**Feature Adoption:**
- 90% of Essential users complete daily plan (8 jobs/day)
- **85% of Essential users use LYNX route filtering**
- 90% of Starter users use Tier 2 Bridge Job Pocket strategically
- **80% of Starter users highlight Valencia credentials**
- 95% of Premium users use all 5 Tier 3 Career Job Pockets monthly
- **70% of Premium users activate Orlando professional network**
- 50% of all users engage with Career Coach
- **30% of users explore Entrepreneurship page** (after 30 days)

**Community Impact (NEW):**
- **50%+ hired at Orlando employers** (not national chains)
- **10+ users express interest in starting businesses** (Jalanea Forge waitlist)
- **$850+ allocated to Community Fund** (30% of first month revenue)
- **Valencia alumni satisfaction:** 8+/10 (platform meets community needs)

**Safety & Trust:**
- 0 successful scam applications (100% Scam Shield accuracy on CRITICAL)
- < 5% false positive rate on Scam Shield warnings
- 100% Public Mode session cleanup (no data leaks)
- 0 privacy incidents or data breaches

**Platform Performance:**
- Mobile page load: < 3 seconds on 3G
- Job search latency: < 500ms
- **LYNX route calculation:** < 2 seconds
- 99.5% uptime
- Accessibility: WCAG 2.2 Level AA compliance

---

### V1.1+ Growth Metrics (Post-Launch)

**Scale Targets:**
- V1.1 (3 months): 1,000 active users (Orlando expansion beyond Valencia)
- V1.2 (6 months): 5,000 active users (Tampa, Jacksonville, Miami launch)
- V2.0 (12 months): 20,000 active users (Florida-wide)
- V3.0 (18 months): 50,000 active users (Nationwide expansion)

**Revenue Model (Dual-Track):**

**Track 1: Direct-to-Consumer SaaS**
- Essential: $15/month × 40% = $6 ARPU
- Starter: $25/month × 45% = $11.25 ARPU
- Premium: $75/month × 15% = $11.25 ARPU
- **Blended ARPU: ~$28.50/user/month**

**Allocation (Every Dollar):**
- **40% Platform & Operations** - Keeping lights on, AI costs, hosting
- **30% Community Fund** - Grants for Valencia grad businesses (NOT VC profit)
- **20% Expansion** - Replicate in Tampa, Jacksonville, Miami
- **10% Scholarships** - Cover premium costs for Pell Grant recipients

**Track 2: Nonprofit Partnership (B2B2C)**
- $50 per successful hire (nonprofit pays)
- 12-hour grace period after failed payment
- Nonprofit dashboard for client tracking
- Partnership white-label option (V2.0+)

**Revenue Projections:**
- V1.0 (100 users): **$2,850/month** → $1,140 ops, $855 Community Fund, $570 expansion, $285 scholarships
- V1.1 (1,000 users): **$28,500/month** → $11,400 ops, $8,550 Community Fund, $5,700 expansion, $2,850 scholarships
- V1.2 (5,000 users): **$142,500/month** → $57,000 ops, **$42,750 Community Fund**, $28,500 expansion, $14,250 scholarships
- V2.0 (20,000 users): **$570,000/month** → $228,000 ops, **$171,000 Community Fund**, $114,000 expansion, $57,000 scholarships

**Community Fund Impact (At Scale):**
- **V1.1:** $8,550/month = **1-2 microbusiness grants** ($5-10k each)
- **V1.2:** $42,750/month = **4-8 microbusiness grants** (Valencia grads)
- **V2.0:** $171,000/month = **17-34 microbusiness grants** (Florida-wide)

**This is wealth redistribution, not profit extraction.**

---

## Build Methodology

### Development Philosophy

**Evidence-Based Design**
Every feature decision backed by user research or validated claim. No features based on assumptions or "best practices" without evidence.

**Trauma-Informed UX**
- No toxic positivity ("You got this!")
- No shame-based language ("Don't give up!")
- Compassionate recovery mechanics for failures
- Agency-preserving defaults (user chooses, platform suggests)

**Community-First Architecture**
- Every feature decision asks: "Does this keep talent local?"
- Revenue transparency is not a marketing tactic—it's infrastructure
- 30% Community Fund is non-negotiable (not "when we're profitable," NOW)

**Depth-Adaptive Complexity**
Core principle: **Show what the user needs, hide what they don't.**
- Essential users see Tier 1 Job Pockets, **LYNX routes**, no advanced features
- Starter users see Tier 2 Bridge Pockets, **Valencia credentials**, skills translation
- Premium users see Tier 3 Career Pockets, **Orlando network**, full intelligence suite
- Users can switch tiers as life circumstances change

**Privacy as Default**
Not opt-in, not opt-out—privacy is the architecture.
- Data minimization: collect only what's needed for functionality
- Ephemeral by default: Public Mode uses SessionStorage only
- User-controlled deletion: 30-day grace for resumes, 7-day for accounts
- **Location data:** Only for LYNX routes, never sold

**Mobile-First, Always**
28% of target users are smartphone-dependent. Desktop is a bonus, mobile is the requirement.
- Essential tier: 100% mobile-optimized
- Starter tier: Mobile + desktop hybrid
- Premium tier: Desktop-optimized (complex reports) with mobile companion

**Orlando-First, Scale Later**
- V1: Perfect the Orlando experience (LYNX, Valencia, local employers)
- V2: Abstract city-specific features (Tampa HART, USF credentials)
- V3: White-label platform (every city can "Light the Block")

---

### Quality Standards

**Code Quality:**
- TypeScript for type safety
- ESLint + Prettier for consistency
- Component-driven architecture (shadcn/ui)
- Minimal third-party dependencies (bundle size < 200KB)

**Security Standards:**
- OWASP Top 10 compliance
- Row-level security in Supabase (RLS policies)
- No PII in logs or error tracking
- HIPAA de-identification standards for analytics (Zip3-only)

**Accessibility Standards:**
- WCAG 2.2 Level AA minimum
- Touch targets: 44×44 CSS pixels minimum
- Color contrast: 4.5:1 minimum
- Screen reader tested (NVDA, VoiceOver)
- Keyboard navigation (no mouse required)

**AI Safety Standards:**
- Evidence chain for all AI-generated content
- User approval required for resume claims
- Confidence scoring for AI suggestions
- Deterministic fallbacks when AI unavailable
- No hallucinated job experience or credentials

---

## Key Principles

### Design Principles

1. **Meet Users Where They Are**
   Don't force career planning on someone who needs rent money by Friday.

2. **Time is Money—Respect Both**
   Every second saved in the UI is money in the user's pocket (literally).

3. **No Hallucinations, Ever**
   AI-generated content must be traceable to user-provided evidence. No fabricated job experience.

4. **Dignity Through Design**
   Never assume incompetence. Simplified interfaces reflect context, not capability.

5. **Privacy is Not a Feature—It's Infrastructure**
   Can't be disabled, can't be opted out of. Privacy is how the system works.

6. **Fail Gracefully, Recover Compassionately**
   When users miss deadlines or interviews, system provides recovery options without judgment.

7. **Mobile-First, Always**
   Desktop is for power users. Mobile is for survival.

8. **Scam Protection is Non-Negotiable**
   Better to block a real job than let through a scam. Safety > completeness.

9. **Community Over Individuality** (NEW)
   Your success matters more when it lifts others. Keep talent local.

10. **Revenue Transparency is Infrastructure** (NEW)
    30% Community Fund is not "when profitable." It's now. Every dollar, every user.

---

### Technical Principles

1. **Deterministic Over Probabilistic**
   When safety is involved (Scam Shield), use rules-based logic, not ML.

2. **Event-Driven Architecture**
   Modules communicate via event bus with idempotency keys. No tight coupling.

3. **Stateless Where Possible**
   Public Mode requires true statelessness. SessionStorage only, no cookies.

4. **Progressive Enhancement**
   Core functionality works without JavaScript. Enhanced features layer on top.

5. **Accessibility is Not Optional**
   WCAG 2.2 Level AA is the minimum bar, not the goal.

6. **Test in the Real World**
   Smartphone on 3G **in a library**, not MacBook on fiber at a coffee shop.

7. **AI as Augmentation, Not Replacement**
   AI assists humans, doesn't replace human judgment. User approves all critical decisions.

8. **Data Minimization by Design**
   Collect only what's needed for functionality. Delete aggressively. No data hoarding.

9. **City-Agnostic Data Models** (NEW)
   V1 is Orlando-specific, but data structures support Tampa/Miami/nationwide expansion.

10. **Community Fund Accountability** (NEW)
    Every revenue transaction logs 30% allocation. Transparent, auditable, immutable.

---

## Quick Reference

### Project Timeline
- **Now:** V1 MVP development (Weeks 1-12)
- **Week 12:** Beta launch with 100 Valencia College users
- **Month 3 (V1.1):** Scale to 1,000 Orlando users, advanced features
- **Month 6 (V1.2):** Florida expansion (Tampa, Jacksonville, Miami) - 5,000 users
- **Month 12 (V2.0):** 20,000 Florida users, mobile app
- **Month 18 (V3.0):** 50,000 nationwide users, white-label platform

---

### Business Model Summary

**Direct-to-Consumer (Primary):**
- Essential: $15/month (40% of users) - **LYNX integration, mobile-first**
- Starter: $25/month (45% of users) - **Valencia credentials, skills translation**
- Premium: $75/month (15% of users) - **Orlando network, senior roles**
- 7-day free trial for all tiers

**Revenue Allocation (Every Dollar):**
- **40%** Platform & Operations
- **30%** Community Fund (Valencia grad business grants)
- **20%** Expansion (replicate in other cities)
- **10%** Scholarships (Pell Grant recipients)

**Nonprofit Partnership (Secondary):**
- $50 per successful hire
- 12-hour grace period for payment
- Dashboard for client tracking
- White-label option (future)

---

### Repository Structure
```
jalanea-works/
├── CLAUDE.md              # Repo protocol
├── docs/
│   ├── for-claude/        # Master build docs (this file)
│   ├── research/          # Research documentation
│   ├── planning/          # Implementation plans
│   ├── product/           # Product documentation
│   │   ├── journey-maps/  # User journey maps (6 files)
│   │   ├── onboarding/    # Onboarding flows (10 files)
│   │   └── sitemap/       # Information architecture (3 files)
│   └── handoff/           # Handoff documents
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # React components
│   ├── lib/              # Utilities and helpers
│   │   ├── orlando/      # Orlando-specific utilities (LYNX, Valencia)
│   │   └── city-agnostic/# City-agnostic abstractions (for Tampa/Miami expansion)
│   └── types/            # TypeScript type definitions
└── supabase/             # Database migrations and functions
    ├── migrations/       # Database schema (city-agnostic design)
    ├── seed/            # Orlando seed data (LYNX routes, Valencia credentials)
    └── functions/       # Edge functions
```

---

### Key Documentation Files

**Product Documentation (Created January 11-12, 2026):**
- `journey_map_marcus_current_state.md` (21-day struggle) + **LYNX barriers**
- `journey_map_marcus_future_state.md` (7-day Essential success) + **LYNX integration**
- `journey_map_jasmine_current_state.md` (84-day struggle) + **Valencia credential invisibility**
- `journey_map_jasmine_future_state.md` (35-day Starter success) + **Valencia credential highlighting**
- `journey_map_david_current_state.md` (112-day struggle) + **Orlando network gap**
- `journey_map_david_future_state.md` (63-day Premium success) + **Orlando network activation**
- `onboarding_flow_documentation.md` (Complete onboarding flows)
- `sitemap_documentation.md` (166-page information architecture)
- 5 Mermaid flowcharts (visual architecture)
- 4 SVG wireframes (key screens)

**NEW Documentation Needed:**
- `ORLANDO_V1_ONBOARDING.md` (5-step onboarding spec with LYNX/Budget Calculator)
- `LYNX_INTEGRATION_SPEC.md` (Transit API integration, route calculation)
- `VALENCIA_CREDENTIALS_DATABASE.md` (Degrees, certificates, auto-detection)
- `COMMUNITY_FUND_INFRASTRUCTURE.md` (30% allocation tracking, grant distribution)
- `ENTREPRENEURSHIP_TRACK_SPEC.md` (Jalanea Forge integration, business resources)

**Research Documentation:**
- `01_USER_RESEARCH_AND_STRATEGY.md` (Validated evidence log)
- `COMPETITIVE_ANALYSIS_2026.md` (Market landscape)
- `CAREER_PATHWAYS_RESEARCH.md` (Career transition data)
- `JOB_SAFETY_CHECK_EVIDENCE_REPORT.md` (Scam Shield research)
- **NEW:** `ECONOMIC_LEAKAGE_RESEARCH.md` (68% local multiplier effect)
- **NEW:** `BRAIN_DRAIN_ORLANDO_RESEARCH.md` (Valencia grad retention data)

---

*Document Version: 3.0*  
*Last Updated: January 12, 2026*  
*Changes from v2.1:*
- **Added "Light the Block" mission framing** (community over individuality)
- **Added Revenue Transparency Pledge** (40% ops, 30% Community Fund, 20% expansion, 10% scholarships)
- **Added Entrepreneurship Track** (Jalanea Forge integration, "Create jobs, not just find jobs")
- **Added Orlando-specific features:** LYNX transit integration, Valencia credential highlighting, Orlando salary calculator, local employer prioritization
- **Added V1 actual onboarding flow** (5 steps: Foundation, Logistics, Salary, Challenges, Goal)
- **Added brain drain & economic leakage** to Problem Statement
- **Updated personas:** Marcus (LYNX user, Pine Hills), Jasmine (Valencia alum, retail → bridge), David (Orlando network, prevent relocation)
- **Updated success metrics:** Community impact metrics (local hiring, businesses funded, talent retention)
- **Updated competitive positioning:** Jalanea is ONLY platform with local economic development mission
- **Architected for V2 expansion:** City-agnostic data models, Tampa/Miami/nationwide roadmap
- **Maintained:** All tier features (Essential/Starter/Premium), pricing ($15/$25/$75), tech stack (Next.js, Supabase, Gemini 3)
- **Document now complete as Doc 1: Project Overview** (big picture, what we're building and why, INCLUDING community wealth-building mission)
