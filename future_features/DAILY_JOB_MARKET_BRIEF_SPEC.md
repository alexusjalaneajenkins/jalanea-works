# DAILY JOB MARKET BRIEF - FEATURE SPECIFICATION
*Economic Intelligence for Barrier-Facing Job Seekers*
**Version 1.0 - For Future Implementation (V2)**
**January 16, 2026**

---

## 📋 TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [The Problem](#the-problem)
3. [The Solution](#the-solution)
4. [How It Works](#how-it-works)
5. [User Experience](#user-experience)
6. [Technical Architecture](#technical-architecture)
7. [Implementation Phases](#implementation-phases)
8. [Cost Analysis](#cost-analysis)
9. [Success Metrics](#success-metrics)
10. [Competitive Analysis](#competitive-analysis)
11. [Examples & Use Cases](#examples--use-cases)
12. [Future Enhancements](#future-enhancements)

---

## EXECUTIVE SUMMARY

### **What It Is:**
A daily intelligence briefing that connects economic/policy changes to immediate job opportunities for Jalanea Works users.

### **Why It Matters:**
- **Unique Differentiator:** No other job platform connects macro events → micro opportunities
- **Empowers Barrier-Facing Job Seekers:** They lack professional networks to get "insider info"
- **Actionable Intelligence:** Not just news, but "what this means for YOU" + jobs to apply to
- **Mode-Specific:** Survival/Bridge/Career users get different insights

### **The Hook:**
*"Federal daycare cuts just hit Orlando. Babysitting demand up 45%. Here are 12 jobs paying $18-25/hr you can apply to TODAY."*

### **When to Build:**
- ❌ **NOT in V1** (Months 1-6) - Focus on core job search first
- ✅ **V2 Launch** (Months 7-12) - After 1,000 users, add Daily Brief
- ✅ **V3 Expansion** (Year 2) - Add Economic Events Dashboard
- ✅ **V4 Advanced** (Year 3+) - Add AI Job Market Analyst

---

## THE PROBLEM

### **Current State:**
Job seekers exist in an **information vacuum**. They apply to jobs without understanding:
- **Why demand exists** ("Why are there suddenly 50 warehouse jobs?")
- **Market timing** ("Is this a good time to apply for retail?")
- **Economic context** ("What policy changes affect my opportunities?")

### **Specific Pain Points:**

#### **1. Barrier-Facing Job Seekers Lack Networks**
- No professional contacts to explain "what's happening in the market"
- No mentors to say "retail hiring always surges in October"
- No access to industry newsletters, trade publications, Bloomberg

**Example:**
- **Professional with network:** Friend texts: "Hey, Universal just announced expansion. Apply now before word spreads."
- **Barrier-facing job seeker:** Sees job posting 2 weeks later when 500 people already applied.

#### **2. They Don't Have Time to Research**
- Working 2 jobs just to survive
- Applying to 10-15 jobs/day (Survival Mode)
- Can't spend hours reading Orlando Sentinel + policy news + industry trends

**Example:**
- **Alexus scenario:** Working part-time at Old Navy, building Jalanea. Misses that federal daycare cuts = babysitting opportunity.
- **What she needs:** Someone to TELL her "Apply to babysitting jobs NOW."

#### **3. They Can't Connect Dots Themselves**
- Even if they read "Federal daycare cuts announced," they don't connect:
  - Daycare cuts → Parents need childcare → Babysitting demand up → Apply to babysitting jobs

**Example:**
- Sees headline: "Federal Government Cuts Childcare Subsidies"
- Thinks: "That's sad for parents."
- **Doesn't think:** "Wait, this is MY job opportunity!"

---

## THE SOLUTION

### **"Your Daily Opportunity Brief"**

**Concept:**
Every morning at 8am, Jalanea analyzes:
1. **Economic events** (policy changes, funding announcements, business expansions)
2. **Local news** (Orlando-specific developments)
3. **User context** (mode, industry, constraints)

**Then generates:**
- 3-5 personalized insights
- "What This Means" summary (connect dots)
- "Your Opportunity" action (jobs to apply to)

### **Core Principles:**

**1. Actionable, Not Informational**
- ❌ "Here's news about daycare cuts" (informational)
- ✅ "Daycare cuts → apply to these 12 babysitting jobs" (actionable)

**2. Mode-Specific Intelligence**
- Survival Mode → Focus on immediate, high-volume opportunities
- Bridge Mode → Focus on stable, strategic opportunities
- Career Mode → Focus on emerging, high-growth opportunities

**3. Orlando-First (V1), Then Scale**
- Start with Orlando news, jobs, events
- V2: Expand to Tampa, Jacksonville, Miami
- V3: Nationwide

**4. Human-Curated + AI-Enhanced**
- AI analyzes news, generates summaries
- Human review (you or team) fact-checks weekly
- Avoid misinformation, clickbait

---

## HOW IT WORKS

### **Step 1: News Collection (Automated)**

**Sources:**
- Google News API (Orlando keyword search)
- RSS feeds: Orlando Sentinel, Axios Orlando, Orlando Business Journal
- Government sites: Orlando.gov, Orange County, Florida.gov
- Industry sources: National Restaurant Association, NRF (retail), local chambers

**Keywords to Monitor:**
- "Orlando jobs", "Orlando hiring", "minimum wage", "federal funding"
- "[Industry] Orlando" (childcare, retail, hospitality, tech, healthcare)
- "Orange County", "Universal Orlando", "Disney", "I-4 corridor"

**Frequency:**
- Run every 6 hours (midnight, 6am, noon, 6pm)
- Cache articles in database (avoid re-processing)

---

### **Step 2: AI Analysis (Gemini 3 Flash)**

**For each article, AI generates:**

**A. Event Classification**
- Type: Policy change, Business expansion, Economic indicator, Hiring announcement, Funding news
- Industry: Childcare, Retail, Hospitality, Healthcare, Tech, Construction, Government
- Impact level: HIGH (affects 100+ jobs), MEDIUM (10-100 jobs), LOW (<10 jobs)
- Urgency: IMMEDIATE (act this week), SOON (act this month), LONGTERM (act in 3+ months)

**B. User Impact Summary**
- "What Happened" (1-2 sentences, 8th-grade reading level)
- "What This Means for You" (connect dots)
- "Your Opportunity" (specific action + job count)

**C. Job Matching**
- Extract keywords from article
- Match to job categories in database (babysitting, retail, warehouse, etc.)
- Return job IDs + counts

**Example Prompt:**
```
Analyze this news article and determine job market impact for Orlando job seekers.

Article: [ARTICLE TEXT]

Return JSON:
{
  "event_type": "policy_change",
  "industry": "childcare",
  "impact_level": "high",
  "urgency": "immediate",
  "summary": {
    "what_happened": "Federal government cut childcare subsidies for Democratic states, effective Jan 15, 2026.",
    "what_this_means": "Daycare costs jumped from $800/wk to $1,200/wk in Orlando. Parents are scrambling for affordable alternatives.",
    "your_opportunity": "Babysitting demand up 45% this week. 12 jobs available paying $18-25/hr."
  },
  "job_categories": ["babysitting", "childcare", "nanny"],
  "job_count": 12,
  "confidence": 0.92
}
```

---

### **Step 3: Personalization (Mode + Profile Matching)**

**Filter insights based on:**

**User's Active Mode:**
- Survival Mode → Show high-impact, immediate, entry-level opportunities
- Bridge Mode → Show stable, strategic, skill-building opportunities
- Career Mode → Show emerging, high-growth, professional opportunities

**User's Profile:**
- Industry preferences (if specified)
- Location (LYNX routes, commute time)
- Constraints (no car, fair chance employers, childcare needs)

**Example:**
- **User:** Alexus, Career Mode, UX Designer
- **Insight 1:** "Orlando tech startup funding up 40% → 23 UX Designer openings" (HIGH RELEVANCE)
- **Insight 2:** "Federal daycare cuts → 12 babysitting jobs" (LOW RELEVANCE, hide)

---

### **Step 4: Daily Brief Generation (8am)**

**For each user, generate:**
- **Top 3-5 insights** (ranked by relevance)
- **Quick stats** ("Retail hiring up 18% this week")
- **Strategy tip** ("Apply on Sundays - 82% faster response rate")

**Delivery:**
- Dashboard card (dismissible, refreshes daily)
- Optional email digest (user can enable/disable)
- Push notification (mobile app, future)

---

## USER EXPERIENCE

### **V1: Dashboard Card (Simplest)**

**Location:** Top of dashboard, above "Your Daily Plan"

**UI Design:**
```
┌─────────────────────────────────────────────────────┐
│ ☀️ Your Daily Opportunity Brief - Jan 16, 2026     │
├─────────────────────────────────────────────────────┤
│                                                     │
│ 🔥 HOT OPPORTUNITY: Childcare Worker Shortage      │
│ Federal cuts → 45% spike in babysitting demand     │
│ → 12 jobs paying $18-25/hr                         │
│ [View Jobs →]                                       │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│ 📈 Hiring Surge: Universal Orlando Expansion       │
│ 2,000 new roles announced for 2026-2027            │
│ → Early applications open now                       │
│ [View Jobs →]                                       │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│ 💡 Strategy Tip: Apply on Weekends                 │
│ 82% of employers respond faster on Sundays         │
│ → Set aside 2 hours this Sunday                    │
│                                                     │
├─────────────────────────────────────────────────────┤
│ [View Full Brief] [Customize Topics] [Dismiss]     │
└─────────────────────────────────────────────────────┘
```

**Interactions:**
- Click insight → Opens job search filtered to relevant jobs
- "View Full Brief" → Opens `/intelligence` page with all insights
- "Customize Topics" → User selects industries to follow
- "Dismiss" → Hides today's brief, reappears tomorrow

---

### **V2: Economic Events Dashboard (Medium Complexity)**

**Location:** New tab in navigation: "Intelligence"

**UI Design:**
```
┌─────────────────────────────────────────────────────┐
│ Economic Intelligence                               │
│ Understand what's happening in Orlando's job market│
├─────────────────────────────────────────────────────┤
│                                                     │
│ 🔥 TRENDING EVENTS IN ORLANDO                       │
│                                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │ ⚡ Federal Daycare Cuts (Jan 15)            │   │
│ │ Impact: High demand for childcare workers   │   │
│ │ Opportunity: 34 openings this week          │   │
│ │ [View Analysis →]                           │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │ 📈 Minimum Wage Increase (Jan 1)            │   │
│ │ Impact: Retail hiring surge                 │   │
│ │ Opportunity: 128 openings at $16/hr+        │   │
│ │ [View Analysis →]                           │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │ 💼 Universal Orlando Expansion Announced    │   │
│ │ Impact: 2,000 new hospitality jobs by 2027  │   │
│ │ Opportunity: Early applications open        │   │
│ │ [View Analysis →]                           │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│ 📊 MARKET TRENDS                                    │
│                                                     │
│ Retail:     ▲ 18% hiring this week                 │
│ Hospitality: ▲ 12% (Universal expansion)           │
│ Tech:       ▼ 8% (layoffs at 3 startups)           │
│ Healthcare: → Stable                                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Interactions:**
- Click event → Opens detailed analysis page
- Trends show weekly change (up/down/stable)
- Filter by industry, impact level, urgency

---

### **V3: AI Job Market Analyst (Most Advanced)**

**Location:** Chat interface in dashboard

**UI Design:**
```
┌─────────────────────────────────────────────────────┐
│ 🤖 Ask Your Job Market Analyst                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│ User: Should I apply to babysitting jobs right now?│
│                                                     │
│ AI: YES! Here's why:                                │
│                                                     │
│ Federal daycare cuts just hit Orlando. Families    │
│ are scrambling for alternatives. Demand for        │
│ babysitters is up 45% this week.                   │
│                                                     │
│ Right now:                                          │
│ • 12 openings paying $18-25/hr                     │
│ • Most want evenings/weekends (works with your     │
│   Old Navy schedule)                               │
│ • No background check required (fair chance)       │
│                                                     │
│ Strategy:                                           │
│ 1. Apply to 5 highest-paying postings today        │
│ 2. Emphasize childcare experience (church work)    │
│ 3. Offer flexible hours (your selling point)       │
│                                                     │
│ Want me to find those 5 jobs for you?              │
│ [Yes, Show Me Jobs] [No, Keep Browsing]            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Conversation Types:**
- "What's happening in [industry]?"
- "Is this a good time to apply for [job type]?"
- "Why are there so many [job type] openings?"
- "Should I switch industries?"
- "What skills are in demand right now?"

---

## TECHNICAL ARCHITECTURE

### **System Overview**

```
┌─────────────────┐
│ News Sources    │ (Google News, RSS, Gov sites)
└────────┬────────┘
         │
         v
┌─────────────────┐
│ News Collector  │ (Cron job, every 6 hours)
│ (background.js) │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Supabase DB     │ (articles table)
│ (cache articles)│
└────────┬────────┘
         │
         v
┌─────────────────┐
│ AI Analyzer     │ (Gemini 3 Flash)
│ (analyze-news)  │ Generates: event_type, industry,
└────────┬────────┘ impact, summary, jobs
         │
         v
┌─────────────────┐
│ Insights DB     │ (insights table)
│ (store insights)│
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Personalization │ (match user mode + profile)
│ (brief-gen)     │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Daily Brief API │ (GET /api/daily-brief)
│ (route.ts)      │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Dashboard UI    │ (DailyBrief.tsx component)
└─────────────────┘
```

---

### **Database Schema**

#### **Table: articles**
```sql
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL, -- 'google_news', 'rss_orlando_sentinel', etc.
  url TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT, -- Full article text
  published_at TIMESTAMPTZ NOT NULL,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  processed BOOLEAN DEFAULT FALSE, -- Has AI analyzed it?
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_articles_processed ON articles(processed);
CREATE INDEX idx_articles_published ON articles(published_at DESC);
```

#### **Table: insights**
```sql
CREATE TABLE insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES articles(id),
  date DATE NOT NULL, -- Which day's brief is this for?
  event_type TEXT NOT NULL, -- 'policy_change', 'business_expansion', etc.
  industry TEXT NOT NULL, -- 'childcare', 'retail', 'tech', etc.
  impact_level TEXT NOT NULL, -- 'high', 'medium', 'low'
  urgency TEXT NOT NULL, -- 'immediate', 'soon', 'longterm'
  
  -- Summaries
  what_happened TEXT NOT NULL,
  what_this_means TEXT NOT NULL,
  your_opportunity TEXT NOT NULL,
  
  -- Job matching
  job_categories TEXT[], -- ['babysitting', 'childcare', 'nanny']
  job_ids UUID[], -- IDs of matched jobs from jobs table
  job_count INT DEFAULT 0,
  
  -- Metadata
  confidence FLOAT, -- 0-1, how confident is AI?
  reviewed BOOLEAN DEFAULT FALSE, -- Has human reviewed?
  approved BOOLEAN DEFAULT TRUE, -- Is it safe to show users?
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_insights_date ON insights(date DESC);
CREATE INDEX idx_insights_industry ON insights(industry);
CREATE INDEX idx_insights_approved ON insights(approved);
```

#### **Table: user_brief_preferences**
```sql
CREATE TABLE user_brief_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  enabled BOOLEAN DEFAULT TRUE,
  email_digest BOOLEAN DEFAULT FALSE, -- Send email?
  industries TEXT[], -- ['childcare', 'retail'] - follow these
  max_insights_per_day INT DEFAULT 3, -- Show max 3 insights
  last_viewed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### **API Endpoints**

#### **1. GET /api/daily-brief**
**Purpose:** Fetch today's personalized brief for logged-in user

**Request:**
```typescript
GET /api/daily-brief
Headers: Authorization: Bearer {token}
Query params: date (optional, default: today)
```

**Response:**
```json
{
  "date": "2026-01-16",
  "insights": [
    {
      "id": "uuid",
      "title": "Federal Daycare Cuts Hit Blue States",
      "what_happened": "Federal government cut childcare subsidies...",
      "what_this_means": "Daycare costs jumped from $800/wk to $1,200/wk...",
      "your_opportunity": "Babysitting demand up 45%. 12 jobs paying $18-25/hr.",
      "impact_level": "high",
      "urgency": "immediate",
      "job_count": 12,
      "job_ids": ["uuid1", "uuid2", ...],
      "created_at": "2026-01-16T08:00:00Z"
    },
    // ... 2-4 more insights
  ],
  "stats": {
    "retail_hiring_change": "+18%",
    "total_new_jobs_this_week": 234
  }
}
```

---

#### **2. POST /api/insights/review**
**Purpose:** Human review (you or team) approves/rejects AI-generated insights

**Request:**
```typescript
POST /api/insights/review
Headers: Authorization: Bearer {admin_token}
Body: {
  "insight_id": "uuid",
  "approved": true,
  "notes": "Good summary, accurate"
}
```

**Response:**
```json
{
  "success": true,
  "insight": { ... }
}
```

---

#### **3. POST /api/brief/customize**
**Purpose:** User customizes their brief preferences

**Request:**
```typescript
POST /api/brief/customize
Headers: Authorization: Bearer {token}
Body: {
  "enabled": true,
  "email_digest": false,
  "industries": ["childcare", "retail", "tech"],
  "max_insights_per_day": 5
}
```

**Response:**
```json
{
  "success": true,
  "preferences": { ... }
}
```

---

### **Background Jobs (Cron)**

#### **Job 1: Fetch News (Every 6 Hours)**
```typescript
// /lib/cron/fetch-news.ts

export async function fetchNews() {
  // 1. Fetch from Google News API
  const googleNews = await fetchGoogleNews('Orlando jobs');
  
  // 2. Fetch from RSS feeds
  const orlandoSentinel = await fetchRSS('https://www.orlandosentinel.com/rss');
  
  // 3. Merge articles
  const allArticles = [...googleNews, ...orlandoSentinel];
  
  // 4. Save to database (skip duplicates)
  for (const article of allArticles) {
    await db.articles.upsert({
      where: { url: article.url },
      create: {
        source: article.source,
        url: article.url,
        title: article.title,
        content: article.content,
        published_at: article.published_at
      }
    });
  }
}

// Run every 6 hours
cron.schedule('0 */6 * * *', fetchNews);
```

---

#### **Job 2: Analyze News (Every 6 Hours + 30 Min)**
```typescript
// /lib/cron/analyze-news.ts

export async function analyzeNews() {
  // 1. Get unprocessed articles
  const articles = await db.articles.findMany({
    where: { processed: false },
    orderBy: { published_at: 'desc' },
    take: 50 // Process 50 at a time
  });
  
  // 2. Analyze each with AI
  for (const article of articles) {
    const analysis = await analyzeWithAI(article);
    
    // 3. Save insights
    await db.insights.create({
      data: {
        article_id: article.id,
        date: new Date(),
        event_type: analysis.event_type,
        industry: analysis.industry,
        impact_level: analysis.impact_level,
        urgency: analysis.urgency,
        what_happened: analysis.summary.what_happened,
        what_this_means: analysis.summary.what_this_means,
        your_opportunity: analysis.summary.your_opportunity,
        job_categories: analysis.job_categories,
        job_count: analysis.job_count,
        confidence: analysis.confidence
      }
    });
    
    // 4. Mark article as processed
    await db.articles.update({
      where: { id: article.id },
      data: { processed: true }
    });
  }
}

// Run every 6 hours, 30 min after news fetch
cron.schedule('30 */6 * * *', analyzeNews);
```

---

#### **Job 3: Generate Daily Briefs (7:30am Daily)**
```typescript
// /lib/cron/generate-briefs.ts

export async function generateDailyBriefs() {
  // 1. Get all users with brief enabled
  const users = await db.users.findMany({
    where: { 
      brief_enabled: true,
      tier: { in: ['starter', 'professional', 'max'] } // Essential gets 1 insight
    }
  });
  
  // 2. For each user, generate personalized brief
  for (const user of users) {
    const insights = await getPersonalizedInsights(user);
    
    // 3. Cache in database (faster dashboard load)
    await db.userBriefs.upsert({
      where: { 
        user_id_date: {
          user_id: user.id,
          date: new Date()
        }
      },
      create: {
        user_id: user.id,
        date: new Date(),
        insights: insights
      }
    });
    
    // 4. Send email if enabled
    if (user.email_digest_enabled) {
      await sendEmailDigest(user, insights);
    }
  }
}

// Run at 7:30am daily (generates briefs before 8am delivery)
cron.schedule('30 7 * * *', generateDailyBriefs);
```

---

### **AI Analysis Function**

```typescript
// /lib/ai/analyze-article.ts

import { Anthropic } from '@anthropic-ai/sdk';

export async function analyzeWithAI(article: Article) {
  const anthropic = new Anthropic();
  
  const prompt = `
You are analyzing news articles for job market impact in Orlando, Florida.

Your task: Determine if this article affects job opportunities for barrier-facing job seekers (people with limited resources, no car, employment gaps, criminal records, etc.).

Article:
Title: ${article.title}
Content: ${article.content}

Analyze and return JSON with this structure:
{
  "relevant": true/false, // Is this article relevant to job seekers?
  "event_type": "policy_change" | "business_expansion" | "economic_indicator" | "hiring_announcement" | "funding_news",
  "industry": "childcare" | "retail" | "hospitality" | "healthcare" | "tech" | "construction" | "government" | "other",
  "impact_level": "high" | "medium" | "low",
  "urgency": "immediate" | "soon" | "longterm",
  "summary": {
    "what_happened": "1-2 sentence summary, 8th grade reading level",
    "what_this_means": "How this affects job opportunities in Orlando",
    "your_opportunity": "Specific action: 'X jobs available paying $Y/hr'"
  },
  "job_categories": ["babysitting", "childcare"], // List of job types affected
  "job_count": 12, // Estimate number of relevant openings
  "confidence": 0.92 // 0-1, how confident are you?
}

Guidelines:
- Only mark relevant=true if article DIRECTLY impacts Orlando job opportunities
- Use simple language (8th grade reading level)
- Be specific with numbers (job count, salary ranges)
- Focus on immediate, actionable opportunities
- Consider barrier-facing job seekers (entry-level, no degree required, fair chance employers)

If article is NOT relevant (national politics, celebrity news, sports), return relevant=false and skip other fields.
`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }]
  });
  
  const analysisText = message.content[0].text;
  const analysis = JSON.parse(analysisText);
  
  return analysis;
}
```

---

## IMPLEMENTATION PHASES

### **PHASE 1: MVP (2-3 Weeks)**

**Goal:** Daily Brief dashboard card showing 3 insights/day

**Week 1: Infrastructure**
- [ ] Create database tables (articles, insights, user_brief_preferences)
- [ ] Set up Google News API
- [ ] Build news fetcher (cron job, every 6 hours)
- [ ] Test: Fetch 50 Orlando news articles

**Week 2: AI Analysis**
- [ ] Build AI analyzer function (Gemini 3 Flash)
- [ ] Test on 10 sample articles (verify accuracy)
- [ ] Build insights generation cron job
- [ ] Test: Generate 5 insights from real news

**Week 3: Dashboard UI**
- [ ] Create DailyBrief component (dashboard card)
- [ ] Build API endpoint (GET /api/daily-brief)
- [ ] Implement personalization (filter by mode + industry)
- [ ] Launch to 10 beta users for feedback

**Success Criteria:**
- [ ] 90%+ of insights are accurate (human review)
- [ ] 50%+ of users click "View Jobs" on insights
- [ ] 0 false positives (scams, irrelevant news)

---

### **PHASE 2: Refinement (1-2 Weeks)**

**Goal:** Improve accuracy + add customization

**Features:**
- [ ] User customization (select industries to follow)
- [ ] Email digest option (8am daily email)
- [ ] Human review dashboard (approve/reject insights)
- [ ] Tier access (Essential: 1 insight, Starter: 3, Professional: 5)

**Success Criteria:**
- [ ] 95%+ accuracy after human review
- [ ] 30%+ of users enable email digest
- [ ] 10+ new signups citing "Daily Brief" as reason

---

### **PHASE 3: Scale (Month 3-4)**

**Goal:** Expand to all Orlando users + more sources

**Features:**
- [ ] Add RSS feeds (Orlando Business Journal, Axios Orlando)
- [ ] Add government sources (Orlando.gov, Orange County)
- [ ] Historical trends ("Retail hiring always surges in October")
- [ ] Stats dashboard ("Retail +18% this week")

**Success Criteria:**
- [ ] 20+ insights/day generated (users get top 3-5)
- [ ] 60%+ of active users check brief daily
- [ ] 15% increase in daily active users (DAU)

---

## COST ANALYSIS

### **V1: Daily Brief (MVP)**

**Monthly Costs:**
- Google News API: $10-20 (depends on requests)
- AI Analysis (Gemini 3 Flash): $5-10 (50 articles/day × 30 days × $0.15/1M tokens)
- Database storage: $2-5 (articles + insights)
- Email sending (SendGrid): $0-10 (free tier covers 100 emails/day)

**Total: $17-45/month**

**Per User Cost:** $0.02-0.05/user (if 1,000 users)

---

### **V2: Economic Events Dashboard**

**Monthly Costs:**
- All V1 costs: $17-45
- Additional sources (RSS scrapers): $10-20
- Storage (more articles): $5-10
- Analytics tracking: $5

**Total: $37-80/month**

**Per User Cost:** $0.04-0.08/user (if 1,000 users)

---

### **V3: AI Job Market Analyst**

**Monthly Costs:**
- All V2 costs: $37-80
- Conversational AI (Gemini 2.5 Pro): $50-100 (10 conversations/user/month)
- Real-time data APIs: $20-30

**Total: $107-210/month**

**Per User Cost:** $0.11-0.21/user (if 1,000 users)

---

### **ROI Analysis**

**Assume 1,000 users:**
- 200 Essential ($15/mo) = $3,000
- 400 Starter ($25/mo) = $10,000
- 300 Professional ($50/mo) = $15,000
- 100 Max ($100/mo) = $10,000

**Total Revenue: $38,000/month**

**Cost of Daily Brief (V1): $45/month**

**ROI: $38,000 / $45 = 844x return**

**Even if Daily Brief only increases retention by 5%, it pays for itself 40x over.**

---

## SUCCESS METRICS

### **Engagement Metrics:**
- **Daily Active Users (DAU):** +15-20% after launch
- **Brief Views:** 60%+ of users check brief daily
- **Click-Through Rate:** 40%+ click "View Jobs" on insights
- **Time on Platform:** +2-3 minutes/day (reading brief)

### **Retention Metrics:**
- **Churn Rate:** -10% (users stay longer because of brief)
- **Paid Tier Retention:** +15% (Daily Brief is "sticky" feature)

### **Conversion Metrics:**
- **Essential → Starter Upgrades:** +10% (Essential users want more insights)
- **Signups Citing Brief:** 5-10% mention "Daily Brief" in onboarding survey

### **Quality Metrics:**
- **Insight Accuracy:** 95%+ (measured by human review)
- **False Positives:** <1% (scams, irrelevant news)
- **User Satisfaction:** 4.5+ stars when asked "How useful is Daily Brief?"

---

## COMPETITIVE ANALYSIS

### **Who Else Does This?**

**LinkedIn:**
- Shows "Industry News" feed (generic, not personalized)
- No connection to job opportunities
- No mode-specific intelligence

**Indeed:**
- Shows job trends (e.g., "Retail hiring up 12%")
- But: Generic, not location-specific, no economic context

**ZipRecruiter:**
- Email alerts for new jobs (reactive, not proactive)
- No market intelligence

**Bloomberg / Wall Street Journal:**
- Economic news (but NOT connected to job opportunities)
- Paywall ($40-50/mo)
- For investors, not job seekers

### **Jalanea's Unique Position:**
- ✅ Connects macro events → micro opportunities
- ✅ Orlando-specific (hyperlocal intelligence)
- ✅ Mode-specific (Survival/Bridge/Career)
- ✅ Actionable ("apply to these 12 jobs")
- ✅ Free (included in Starter tier)

**Nobody else does this. This is a blue ocean opportunity.**

---

## EXAMPLES & USE CASES

### **Example 1: Federal Daycare Cuts**

**News Article:**
> "Federal Government Cuts Childcare Subsidies for Democratic States"
> 
> Published: January 15, 2026
> Source: Orlando Sentinel
> 
> The federal government announced Tuesday that childcare subsidies will be cut for states that voted Democratic in the 2024 presidential election, including Florida. The cuts, effective immediately, will reduce federal funding by 30%, forcing daycare centers to raise prices or close...

**AI Analysis:**
```json
{
  "relevant": true,
  "event_type": "policy_change",
  "industry": "childcare",
  "impact_level": "high",
  "urgency": "immediate",
  "summary": {
    "what_happened": "Federal government cut childcare subsidies for Democratic states, effective Jan 15, 2026.",
    "what_this_means": "Daycare costs jumped from $800/wk to $1,200/wk in Orlando. Parents are scrambling for affordable alternatives.",
    "your_opportunity": "Babysitting demand up 45% this week. 12 jobs available paying $18-25/hr."
  },
  "job_categories": ["babysitting", "childcare", "nanny"],
  "job_count": 12,
  "confidence": 0.95
}
```

**User Sees (Dashboard Card):**
```
🔥 HOT OPPORTUNITY: Childcare Worker Shortage

Federal cuts → 45% spike in babysitting demand
→ 12 jobs paying $18-25/hr

[View Jobs →]
```

**Impact:**
- User clicks "View Jobs"
- Sees 12 babysitting jobs (filtered by LYNX accessibility, fair chance)
- Applies to 5 jobs that day
- Lands interview with family in Winter Park ($22/hr, evenings/weekends)

---

### **Example 2: Universal Orlando Expansion**

**News Article:**
> "Universal Orlando Announces Epic Universe Expansion"
> 
> Published: January 10, 2026
> Source: Orlando Business Journal
> 
> Universal Orlando announced plans to expand its Epic Universe theme park, adding 2,000 new jobs by 2027. The expansion will include new attractions, hotels, and restaurants...

**AI Analysis:**
```json
{
  "relevant": true,
  "event_type": "business_expansion",
  "industry": "hospitality",
  "impact_level": "high",
  "urgency": "soon",
  "summary": {
    "what_happened": "Universal Orlando announced Epic Universe expansion, adding 2,000 jobs by 2027.",
    "what_this_means": "Early hiring wave starting now. Universal typically hires 6-12 months before opening.",
    "your_opportunity": "23 openings available now (server, cook, front desk, housekeeping). Apply early before word spreads."
  },
  "job_categories": ["server", "cook", "front_desk", "housekeeping"],
  "job_count": 23,
  "confidence": 0.88
}
```

**User Sees:**
```
📈 Hiring Surge: Universal Orlando Expansion

2,000 new roles announced for 2026-2027
→ Early applications open now (23 openings)

[View Jobs →]
```

**Impact:**
- User applies to 3 server positions at Universal
- Gets hired before major hiring wave (less competition)
- Starts at $17/hr + tips

---

### **Example 3: Tech Layoffs (Career Mode)**

**News Article:**
> "Orlando Tech Startups Announce Layoffs"
> 
> Published: January 12, 2026
> Source: TechCrunch
> 
> Three Orlando-based tech startups announced layoffs this week, citing economic uncertainty. Approximately 150 employees will be laid off across design, engineering, and product roles...

**AI Analysis:**
```json
{
  "relevant": true,
  "event_type": "economic_indicator",
  "industry": "tech",
  "impact_level": "medium",
  "urgency": "soon",
  "summary": {
    "what_happened": "Three Orlando tech startups laid off 150 employees (design, engineering, product).",
    "what_this_means": "More competition for tech jobs. BUT: Healthcare tech is hiring (not affected by layoffs).",
    "your_opportunity": "Pivot strategy: 8 UX Designer openings in healthcare tech (Orlando Health, AdventHealth). Lower competition, stable industry."
  },
  "job_categories": ["ux_designer", "product_designer"],
  "job_count": 8,
  "confidence": 0.82
}
```

**User Sees (Career Mode User):**
```
💡 Strategy Shift: Tech Layoffs Increase Competition

150 tech workers laid off → pivot to healthcare tech
→ 8 UX Designer openings at Orlando Health, AdventHealth

[View Jobs →]
```

**Impact:**
- User (UX Designer) was applying to startups
- Sees this insight, pivots to healthcare tech
- Applies to Orlando Health UX Designer role
- Less competition (other UX designers still focused on startups)
- Lands job at Orlando Health ($68k, stable, benefits)

---

## FUTURE ENHANCEMENTS (V4+)

### **1. Predictive Intelligence**
- AI predicts hiring trends 2-4 weeks in advance
- "Retail hiring always surges in October. Start applying in September."
- "Hurricane season = construction boom. Apply to roofing companies in May."

### **2. Peer Insights**
- "12 Jalanea users got hired in childcare this week"
- "What they did: Applied within 24 hours of posting, emphasized flexibility"

### **3. Video Summaries**
- AI-generated 60-second video explaining market event
- Visual: Chart showing demand spike, map of job locations, talking avatar

### **4. SMS Alerts**
- "🔥 URGENT: 50 warehouse jobs just posted at Amazon. Apply NOW."
- Opt-in, high-urgency events only

### **5. Industry Deep Dives**
- Monthly report: "State of Orlando Retail Market"
- 10-page report with charts, trends, predictions
- Premium content for Max tier users

---

## LAUNCH CHECKLIST

### **Pre-Launch (Week -1):**
- [ ] Test on 10 beta users, collect feedback
- [ ] Human review 100 insights (verify 95%+ accuracy)
- [ ] Write help docs (jalanea.works/help/daily-brief)
- [ ] Train support team

### **Launch Day:**
- [ ] Enable for all Starter+ users
- [ ] Send email: "Introducing Your Daily Opportunity Brief"
- [ ] In-app notification in dashboard
- [ ] Social media post (Twitter, LinkedIn)

### **Post-Launch (Week +1):**
- [ ] Monitor engagement metrics daily
- [ ] Respond to user feedback
- [ ] Fix bugs reported
- [ ] Write blog post: "How Daily Brief Works"

---

## PROMPT FOR CLAUDE CODE (When Ready to Build)

```
Build "Daily Job Market Brief" feature for Jalanea Works.

GOAL: Show users 3-5 daily insights about economic/policy changes 
affecting their job search in Orlando.

PHASE 1: MVP (Build this first)

1. DATABASE SCHEMA
   Create tables:
   - articles (store fetched news)
   - insights (AI-generated summaries)
   - user_brief_preferences (user settings)

2. NEWS FETCHER (Background job)
   - Fetch Orlando news from Google News API every 6 hours
   - Keywords: "Orlando jobs", "Orlando hiring", "federal funding"
   - Save to articles table (skip duplicates by URL)

3. AI ANALYZER (Background job)
   - Get unprocessed articles from database
   - Analyze with Gemini 3 Flash
   - Generate: event_type, industry, impact, summary, job_count
   - Save to insights table

4. API ENDPOINT
   - GET /api/daily-brief
   - Fetch today's insights
   - Filter by user mode (Survival/Bridge/Career)
   - Return top 3-5 insights ranked by relevance

5. DASHBOARD UI
   - Component: DailyBrief.tsx
   - Show card at top of dashboard
   - Display 3 insights with "View Jobs" buttons
   - Dismissible (hides until tomorrow)

TECH STACK:
- Next.js 14 + TypeScript
- Supabase (database)
- Gemini 3 Flash (AI analysis)
- Google News API (news fetching)
- Vercel Cron (background jobs)

FILES TO CREATE:
- /app/api/daily-brief/route.ts
- /lib/cron/fetch-news.ts
- /lib/cron/analyze-news.ts
- /lib/ai/analyze-article.ts
- /components/dashboard/DailyBrief.tsx

Build complete, production-ready feature with error handling, 
caching, and responsive design.
```

---

**END OF SPEC**

*This is your blueprint. Save it, reference it when you hit 1,000 users, 
and build Daily Brief in V2. This will be your secret weapon.* 🔥
