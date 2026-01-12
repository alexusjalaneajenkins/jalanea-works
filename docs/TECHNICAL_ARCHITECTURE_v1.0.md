# TECHNICAL_ARCHITECTURE.md
*Master Build Document - Jalanea Works Platform*
**Doc 4: Technical Architecture & System Design**
**Version 1.0**

---

## Table of Contents
1. [Document Purpose](#document-purpose)
2. [System Architecture Overview](#system-architecture-overview)
3. [Technology Stack](#technology-stack)
4. [Database Schema](#database-schema)
5. [API Architecture](#api-architecture)
6. [Authentication & Authorization](#authentication--authorization)
7. [AI Integration Architecture](#ai-integration-architecture)
8. [External Service Integration](#external-service-integration)
9. [Infrastructure & Deployment](#infrastructure--deployment)
10. [Security Architecture](#security-architecture)
11. [Scalability & Performance](#scalability--performance)
12. [Monitoring & Observability](#monitoring--observability)
13. [Development Environment](#development-environment)

---

## Document Purpose

**This document defines:**
- HOW the system is built (architecture, infrastructure)
- WHERE data lives (complete database schema)
- HOW components communicate (API design, event bus)
- HOW to deploy (infrastructure, CI/CD)
- HOW to secure (authentication, encryption, RLS)
- HOW to scale (performance, caching, optimization)

**Audience:** Developers, DevOps engineers, Claude Code, technical architects

**Companion Documents:**
- Doc 1: PROJECT_OVERVIEW v3.0 (mission, market, why)
- Doc 2: PROJECT_REQUIREMENTS (feature specs, what to build)
- Doc 3: USER_EXPERIENCE (personas, flows, design)
- Doc 5: COMPLIANCE & SAFEGUARDS (legal, privacy, security policies)

---

## System Architecture Overview

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                            USERS                                    │
│  Mobile (28% smartphone-only)  •  Desktop  •  Public Devices        │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ HTTPS
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                         VERCEL EDGE                                 │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              NEXT.JS 14 APP (APP ROUTER)                    │   │
│  │  • Server Components (RSC)                                  │   │
│  │  • Client Components (React 18)                             │   │
│  │  • API Routes (Edge Functions)                              │   │
│  └─────────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                    │                 │
┌───────────────────▼──┐   ┌──────────▼──────────────┐
│   SUPABASE           │   │  EXTERNAL SERVICES      │
│                      │   │                         │
│  ┌───────────────┐   │   │  • Indeed API          │
│  │  PostgreSQL   │   │   │  • Google Maps API     │
│  │  (Primary DB) │   │   │  • LinkedIn API        │
│  └───────────────┘   │   │  • Gemini AI API       │
│                      │   │  • Stripe API          │
│  ┌───────────────┐   │   └─────────────────────────┘
│  │  Auth         │   │
│  │  (Passkeys)   │   │
│  └───────────────┘   │
│                      │
│  ┌───────────────┐   │
│  │  Edge         │   │
│  │  Functions    │   │
│  └───────────────┘   │
│                      │
│  ┌───────────────┐   │
│  │  Storage      │   │
│  │  (Resumes,    │   │
│  │   Files)      │   │
│  └───────────────┘   │
└──────────────────────┘
```

### Architecture Principles

**1. Serverless-First**
- No servers to manage (Vercel + Supabase)
- Auto-scaling based on load
- Pay only for usage

**2. Edge-Optimized**
- Next.js Server Components (RSC) for fast page loads
- Vercel Edge Functions for API routes
- CDN distribution globally

**3. Database-Centric**
- PostgreSQL as source of truth
- Row-Level Security (RLS) for data isolation
- Real-time subscriptions for live updates

**4. API-Driven**
- RESTful API design
- JSON payloads
- Versioned endpoints (`/v1/`)

**5. Security-First**
- Passkey authentication (FIDO2/WebAuthn)
- End-to-end encryption for sensitive data
- No PII in logs or analytics

**6. Mobile-First**
- Progressive Web App (PWA)
- <200KB initial bundle
- 3-second load on 3G networks

---

## Technology Stack

### Frontend

**Framework:**
- **Next.js 14** (App Router, React Server Components)
  - Why: Server-side rendering, edge optimization, built-in API routes
  - Version: 14.2.0+

**UI Library:**
- **React 18** (with concurrent features)
  - Why: Industry standard, component-driven, large ecosystem

**Styling:**
- **Tailwind CSS 3.4**
  - Why: Utility-first, fast development, small bundle size
- **shadcn/ui** (component library)
  - Why: Pre-built accessible components, Tailwind-based

**State Management:**
- **React Context** (for global state)
- **React Query / TanStack Query** (for server state)
  - Why: Caching, auto-refetch, optimistic updates

**Forms:**
- **React Hook Form** (form validation)
  - Why: Performance, minimal re-renders, easy validation

**Maps:**
- **@react-google-maps/api** (Google Maps integration)
  - Why: Official React wrapper for Google Maps

**TypeScript:**
- **TypeScript 5.3+**
  - Why: Type safety, better DX, catch errors at compile time

---

### Backend

**Database:**
- **Supabase PostgreSQL 15**
  - Why: Full-featured PostgreSQL, managed, real-time, RLS built-in
  - Connection pooling via PgBouncer

**Authentication:**
- **Supabase Auth**
  - Passkeys (FIDO2/WebAuthn) - primary
  - Magic links - backup
  - OAuth (Google, Apple) - convenience

**API:**
- **Supabase Edge Functions** (Deno runtime)
  - Why: Serverless, TypeScript-native, fast cold starts
- **Next.js API Routes** (for frontend-specific endpoints)

**File Storage:**
- **Supabase Storage**
  - Resumes, user-uploaded files
  - S3-compatible API

**Caching:**
- **Vercel Edge Cache** (CDN caching)
- **Redis** (optional, for high-traffic caching)
  - Provider: Upstash (serverless Redis)

---

### AI / ML

**Primary AI Provider:**
- **Google Gemini AI**
  - **Gemini 3 Flash** (Essential/Starter tiers)
    - Fast, cheap ($0.01/call)
    - Resume optimization, skills translation, Tier 1/2 Job Pockets
  - **Gemini 3 Pro Deep Research** (Premium tier)
    - Slow, expensive ($0.30/call)
    - Tier 3 Career Job Pockets (8-page reports)

**Cost Optimization:**
- **DeepSeek** (fallback for cost-sensitive features)
  - Use for non-critical features (e.g., basic interview prep)

**AI Routing Logic:**
```javascript
function selectAIModel(feature, tier) {
  if (tier === 'premium' && feature === 'tier3_pocket') {
    return 'gemini-3-pro-deep-research'; // $0.30/call
  } else if (tier === 'starter' && feature === 'tier2_pocket') {
    return 'gemini-3-flash'; // $0.01/call
  } else if (tier === 'essential') {
    return 'gemini-3-flash'; // $0.01/call
  } else {
    return 'deepseek'; // $0.001/call (cost optimization)
  }
}
```

---

### External Services

**Job Boards:**
- **Indeed API**
  - Job search, job details
  - Rate limit: 100 requests/day (free tier)

**Maps & Geocoding:**
- **Google Maps API**
  - Directions API (transit mode) - LYNX route calculation
  - Geocoding API - address → lat/lng
  - Rate limit: 40,000 requests/month (free tier)

**Professional Networking:**
- **LinkedIn API** (Premium tier only)
  - Profile data, connection mapping
  - Rate limit: 500 requests/day

**Payments:**
- **Stripe**
  - Subscriptions (Essential/Starter/Premium)
  - One-time payments (nonprofit partnerships)
  - Webhooks for payment events

**Analytics:**
- **Vercel Analytics** (page views, performance)
- **PostHog** (product analytics, feature flags)
  - Self-hosted option for privacy

**Error Tracking:**
- **Sentry**
  - Frontend + backend error tracking
  - No PII in error logs (scrubbing required)

---

### Development Tools

**Version Control:**
- **Git** + **GitHub**
  - Monorepo structure

**Package Manager:**
- **pnpm** (fast, disk-efficient)

**Code Quality:**
- **ESLint** (linting)
- **Prettier** (formatting)
- **Husky** (pre-commit hooks)
- **TypeScript** (type checking)

**Testing:**
- **Vitest** (unit tests)
- **Playwright** (E2E tests)
- **React Testing Library** (component tests)

**CI/CD:**
- **GitHub Actions**
  - Automated testing on PR
  - Deploy to Vercel on merge to main

---

## Database Schema

### Complete PostgreSQL Schema

**Design Principles:**
1. **City-Agnostic Data Models** (V1 Orlando, V2+ Tampa/Miami)
2. **Row-Level Security (RLS)** for data isolation
3. **JSONB for flexibility** (avoid rigid schemas for evolving features)
4. **Timestamps** on all tables (created_at, updated_at)
5. **Soft deletes** (deleted_at instead of hard delete)

---

### Core Tables

#### users

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  
  -- Location
  location_address TEXT,
  location_lat NUMERIC(10, 7),
  location_lng NUMERIC(10, 7),
  location_zip_code TEXT,
  location_city TEXT, -- 'Orlando', 'Tampa', 'Miami' (V1/V2/V3)
  location_state TEXT DEFAULT 'FL',
  
  -- Transportation
  transportation JSONB NOT NULL DEFAULT '{
    "has_car": false,
    "uses_lynx": false,
    "uses_rideshare": false,
    "walks": false
  }',
  max_commute_minutes INT DEFAULT 30,
  
  -- Availability
  availability JSONB NOT NULL DEFAULT '{
    "type": "open_to_anything",
    "specific_days": null,
    "preferred_shifts": []
  }',
  
  -- Salary target
  salary_target JSONB NOT NULL DEFAULT '{
    "min": 30000,
    "max": 40000,
    "monthly_take_home": null,
    "max_rent": null
  }',
  
  -- Challenges (barriers)
  challenges TEXT[] DEFAULT '{}',
  situation_notes TEXT,
  
  -- Tier & subscription
  tier TEXT NOT NULL CHECK (tier IN ('essential', 'starter', 'premium')),
  subscription_status TEXT NOT NULL DEFAULT 'trial' CHECK (
    subscription_status IN ('trial', 'active', 'past_due', 'canceled')
  ),
  subscription_id TEXT, -- Stripe subscription ID
  trial_ends_at TIMESTAMPTZ,
  
  -- Profile links
  linkedin_url TEXT,
  portfolio_url TEXT,
  linkedin_id TEXT, -- For Premium tier connection mapping
  
  -- Settings
  public_mode_enabled BOOLEAN DEFAULT false,
  notifications_enabled BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_login_at TIMESTAMPTZ,
  onboarding_completed_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_city ON users(location_city);
CREATE INDEX idx_users_tier ON users(tier);
CREATE INDEX idx_users_subscription_status ON users(subscription_status);

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);
```

---

#### credentials

```sql
CREATE TABLE credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Credential details
  institution TEXT NOT NULL,
  credential_type TEXT NOT NULL CHECK (credential_type IN (
    'high_school', 'certificate', 'associate', 'bachelor', 'master', 'doctorate'
  )),
  program TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('current', 'alumni', 'incomplete')),
  
  -- Special flags
  valencia_credential BOOLEAN DEFAULT false,
  is_primary BOOLEAN DEFAULT false, -- User's primary credential
  
  -- Dates
  start_date DATE,
  end_date DATE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_credentials_user_id ON credentials(user_id);
CREATE INDEX idx_credentials_valencia ON credentials(valencia_credential) WHERE valencia_credential = true;

-- RLS Policies
ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own credentials"
  ON credentials FOR ALL
  USING (auth.uid() = user_id);
```

---

#### resumes

```sql
CREATE TABLE resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Resume content
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  summary TEXT,
  
  -- Experience (JSONB array)
  experience JSONB NOT NULL DEFAULT '[]',
  -- Example: [{"title": "Shift Lead", "company": "Old Navy", "start_date": "2022-01", "end_date": "2024-12", "bullets": ["...", "..."]}]
  
  -- Education (JSONB array, redundant with credentials table but needed for resume generation)
  education JSONB NOT NULL DEFAULT '[]',
  
  -- Skills
  skills TEXT[] DEFAULT '{}',
  
  -- ATS score
  ats_score INT CHECK (ats_score >= 0 AND ats_score <= 100),
  ats_keywords TEXT[] DEFAULT '{}',
  
  -- Versions
  version INT DEFAULT 1,
  is_active BOOLEAN DEFAULT true, -- Only one active resume per user
  
  -- Metadata
  translated BOOLEAN DEFAULT false, -- Skills translation applied?
  valencia_highlighted BOOLEAN DEFAULT false, -- Valencia credentials highlighted?
  
  -- File exports
  pdf_url TEXT, -- Supabase Storage URL
  docx_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_resumes_user_id ON resumes(user_id);
CREATE INDEX idx_resumes_active ON resumes(user_id, is_active) WHERE is_active = true;

-- RLS Policies
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own resumes"
  ON resumes FOR ALL
  USING (auth.uid() = user_id);
```

---

### Job-Related Tables

#### jobs

```sql
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Job basics
  external_id TEXT UNIQUE NOT NULL, -- Indeed job ID
  source TEXT NOT NULL DEFAULT 'indeed', -- 'indeed', 'linkedin', 'manual'
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  company_website TEXT,
  
  -- Location
  location_address TEXT,
  location_lat NUMERIC(10, 7),
  location_lng NUMERIC(10, 7),
  location_zip_code TEXT,
  location_city TEXT,
  location_state TEXT,
  remote BOOLEAN DEFAULT false,
  
  -- Compensation
  salary_min INT,
  salary_max INT,
  salary_period TEXT CHECK (salary_period IN ('hourly', 'annual')),
  
  -- Job details
  description TEXT NOT NULL,
  requirements TEXT,
  benefits TEXT,
  employment_type TEXT, -- 'full-time', 'part-time', 'contract'
  
  -- Application
  apply_url TEXT NOT NULL,
  application_method TEXT, -- 'external', 'email', 'phone'
  
  -- Metadata
  posted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  
  -- Scam Shield
  scam_severity TEXT CHECK (scam_severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
  scam_flags JSONB DEFAULT '[]',
  -- Example: [{"rule": "upfront-payment", "description": "Requests $200 for uniform"}]
  
  -- Valencia match (Orlando-specific for V1)
  valencia_friendly BOOLEAN DEFAULT false,
  valencia_match_score INT CHECK (valencia_match_score >= 0 AND valencia_match_score <= 100),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_jobs_external_id ON jobs(external_id);
CREATE INDEX idx_jobs_city ON jobs(location_city);
CREATE INDEX idx_jobs_posted_at ON jobs(posted_at DESC);
CREATE INDEX idx_jobs_scam_severity ON jobs(scam_severity);
CREATE INDEX idx_jobs_valencia ON jobs(valencia_friendly) WHERE valencia_friendly = true;

-- Full-text search
CREATE INDEX idx_jobs_title_description ON jobs USING gin(to_tsvector('english', title || ' ' || description));
```

---

#### job_pockets

```sql
CREATE TABLE job_pockets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  
  -- Pocket tier
  tier TEXT NOT NULL CHECK (tier IN ('tier1', 'tier2', 'tier3')),
  
  -- Generated content (JSONB)
  content JSONB NOT NULL,
  -- Tier 1: {qualification_check, quick_brief, talking_points, interview_questions, red_flags, recommendation}
  -- Tier 2: + {company_overview, why_hiring, what_they_want, culture_check, positioning}
  -- Tier 3: + {hiring_manager, linkedin_mapping, compensation_analysis, interview_prep, strategic_positioning}
  
  -- Generation metadata
  generated_by_model TEXT, -- 'gemini-3-flash', 'gemini-3-pro-deep-research'
  generation_time_ms INT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT now() + INTERVAL '7 days', -- Cache for 7 days
  
  -- Usage tracking
  viewed_at TIMESTAMPTZ,
  applied_after_viewing BOOLEAN DEFAULT false
);

-- Indexes
CREATE INDEX idx_job_pockets_user_id ON job_pockets(user_id);
CREATE INDEX idx_job_pockets_job_id ON job_pockets(job_id);
CREATE UNIQUE INDEX idx_job_pockets_unique ON job_pockets(user_id, job_id, tier);

-- RLS Policies
ALTER TABLE job_pockets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own job pockets"
  ON job_pockets FOR SELECT
  USING (auth.uid() = user_id);
```

---

#### applications

```sql
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE SET NULL,
  
  -- Application details
  status TEXT NOT NULL DEFAULT 'applied' CHECK (status IN (
    'discovered', 'pocketed', 'applied', 'interviewing', 
    'offer_received', 'offer_accepted', 'rejected', 'withdrawn', 'archived'
  )),
  
  -- Timeline
  discovered_at TIMESTAMPTZ DEFAULT now(),
  pocketed_at TIMESTAMPTZ,
  applied_at TIMESTAMPTZ,
  first_interview_at TIMESTAMPTZ,
  offer_received_at TIMESTAMPTZ,
  offer_accepted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  
  -- Application method
  application_method TEXT, -- 'platform', 'external', 'email', 'in-person'
  applied_via_pocket BOOLEAN DEFAULT false,
  pocket_tier TEXT, -- 'tier1', 'tier2', 'tier3'
  
  -- Offer details (if applicable)
  offer_salary INT,
  offer_equity NUMERIC(5, 3), -- Percentage, e.g., 0.15 = 0.15%
  offer_benefits TEXT,
  
  -- Rejection details
  rejection_reason TEXT, -- 'ghosted', 'not_qualified', 'filled', 'other'
  rejection_feedback TEXT,
  
  -- Notes
  user_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_applied_at ON applications(applied_at DESC);

-- RLS Policies
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own applications"
  ON applications FOR ALL
  USING (auth.uid() = user_id);
```

---

#### interviews

```sql
CREATE TABLE interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Interview details
  round INT DEFAULT 1, -- 1st round, 2nd round, etc.
  interview_type TEXT, -- 'phone', 'video', 'in-person', 'panel'
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT,
  
  -- Location (for in-person)
  location_address TEXT,
  location_lat NUMERIC(10, 7),
  location_lng NUMERIC(10, 7),
  transit_time_minutes INT, -- Pre-calculated LYNX time
  transit_route TEXT, -- 'Route 36'
  
  -- Interviewers
  interviewers JSONB DEFAULT '[]',
  -- Example: [{"name": "Sarah Martinez", "title": "VP Growth", "linkedin_id": "..."}]
  
  -- Preparation
  prep_completed BOOLEAN DEFAULT false,
  prep_notes TEXT,
  
  -- Outcome
  completed_at TIMESTAMPTZ,
  outcome TEXT, -- 'passed', 'failed', 'no_show', 'rescheduled'
  outcome_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_interviews_application_id ON interviews(application_id);
CREATE INDEX idx_interviews_user_id ON interviews(user_id);
CREATE INDEX idx_interviews_scheduled_at ON interviews(scheduled_at);

-- RLS Policies
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own interviews"
  ON interviews FOR ALL
  USING (auth.uid() = user_id);
```

---

### Orlando-Specific Tables (V1)

#### lynx_routes

```sql
CREATE TABLE lynx_routes (
  route_id TEXT PRIMARY KEY,
  route_number TEXT NOT NULL,
  route_name TEXT NOT NULL,
  route_type TEXT CHECK (route_type IN ('local', 'express', 'link')),
  color_hex TEXT,
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  description TEXT,
  frequency_minutes INT, -- Average frequency during peak hours
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed data for V1 Orlando
INSERT INTO lynx_routes (route_id, route_number, route_name, route_type, color_hex, frequency_minutes) VALUES
  ('lynx-036', '36', 'Pine Hills - Colonial - Downtown', 'local', '#FF0000', 30),
  ('lynx-050', '50', 'Michigan - Orange Ave - Downtown', 'local', '#0000FF', 20),
  ('lynx-018', '18', 'OBT Corridor', 'local', '#00FF00', 30),
  ('lynx-008', '8', 'International Drive - Downtown', 'local', '#FFA500', 30),
  ('lynx-125', '125', 'Lynx Central Station - UCF', 'express', '#800080', 60);
```

---

#### lynx_stops

```sql
CREATE TABLE lynx_stops (
  stop_id TEXT PRIMARY KEY,
  stop_name TEXT NOT NULL,
  lat NUMERIC(10, 7) NOT NULL,
  lng NUMERIC(10, 7) NOT NULL,
  zip_code TEXT,
  
  -- Accessibility
  accessibility JSONB DEFAULT '{
    "wheelchair_accessible": true,
    "shelter": false,
    "lighting": true
  }',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_lynx_stops_location ON lynx_stops USING gist(ll_to_earth(lat, lng));
```

---

#### lynx_route_stops

```sql
CREATE TABLE lynx_route_stops (
  route_id TEXT REFERENCES lynx_routes(route_id) ON DELETE CASCADE,
  stop_id TEXT REFERENCES lynx_stops(stop_id) ON DELETE CASCADE,
  sequence INT NOT NULL, -- Order of stops on route
  direction TEXT CHECK (direction IN ('northbound', 'southbound', 'eastbound', 'westbound')),
  
  PRIMARY KEY (route_id, stop_id, direction)
);

-- Indexes
CREATE INDEX idx_route_stops_route ON lynx_route_stops(route_id, sequence);
```

---

#### valencia_programs

```sql
CREATE TABLE valencia_programs (
  program_id TEXT PRIMARY KEY,
  program_name TEXT NOT NULL,
  program_type TEXT NOT NULL CHECK (program_type IN ('certificate', 'AS', 'BAS')),
  school TEXT NOT NULL, -- 'School of Computing & IT', 'School of Business', etc.
  career_pathway TEXT, -- 'Technology', 'Business', 'Healthcare', etc.
  
  -- Job matching
  keywords TEXT[] DEFAULT '{}',
  typical_salary_range INT4RANGE, -- (min, max) in thousands
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed data
INSERT INTO valencia_programs (program_id, program_name, program_type, school, career_pathway, keywords, typical_salary_range) VALUES
  ('comp-tech-bas', 'Computing Technology & Software Development', 'BAS', 'School of Computing & IT', 'Technology', ARRAY['software', 'programming', 'web development'], '[40, 65]'),
  ('interactive-design-as', 'Interactive Design', 'AS', 'School of Computing & IT', 'Technology', ARRAY['UI/UX', 'graphic design', 'web design'], '[35, 50]'),
  ('it-support-cert', 'IT Support Specialist', 'certificate', 'School of Computing & IT', 'Technology', ARRAY['help desk', 'technical support'], '[30, 45]'),
  ('accounting-cert', 'Accounting Applications', 'certificate', 'School of Business', 'Business', ARRAY['bookkeeping', 'accounting software'], '[30, 42]');
```

---

#### orlando_rent_data

```sql
CREATE TABLE orlando_rent_data (
  housing_type TEXT PRIMARY KEY,
  min_rent INT NOT NULL,
  max_rent INT NOT NULL,
  typical_sqft INT,
  zip_codes TEXT[] DEFAULT '{}',
  last_updated DATE NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed data (2026 Orlando market)
INSERT INTO orlando_rent_data (housing_type, min_rent, max_rent, typical_sqft, zip_codes, last_updated) VALUES
  ('studio', 850, 1100, 450, ARRAY['32801', '32803', '32805'], '2026-01-01'),
  ('1br', 1000, 1300, 650, ARRAY['32801', '32803', '32808'], '2026-01-01'),
  ('2br', 1300, 1700, 950, ARRAY['32808', '32810', '32825'], '2026-01-01'),
  ('3br', 1650, 2200, 1200, ARRAY['32810', '32825', '32835'], '2026-01-01');
```

---

### Community Features Tables

#### daily_plans

```sql
CREATE TABLE daily_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Jobs in plan (array of job IDs)
  job_ids UUID[] NOT NULL,
  
  -- Progress tracking
  applied_count INT DEFAULT 0,
  total_count INT NOT NULL,
  
  -- Generation metadata
  generated_at TIMESTAMPTZ DEFAULT now(),
  generated_by TEXT DEFAULT 'ai', -- 'ai', 'manual'
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_daily_plans_user_id ON daily_plans(user_id);
CREATE INDEX idx_daily_plans_date ON daily_plans(date DESC);
CREATE UNIQUE INDEX idx_daily_plans_user_date ON daily_plans(user_id, date);

-- RLS Policies
ALTER TABLE daily_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own daily plans"
  ON daily_plans FOR SELECT
  USING (auth.uid() = user_id);
```

---

#### shadow_calendar_events

```sql
CREATE TABLE shadow_calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Event details
  type TEXT NOT NULL CHECK (type IN ('shift', 'commute', 'interview', 'block')),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  
  -- Related entities
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
  interview_id UUID REFERENCES interviews(id) ON DELETE CASCADE,
  
  -- Commute-specific
  transit_mode TEXT, -- 'car', 'lynx', 'rideshare', 'walk'
  lynx_route TEXT,
  transit_time_minutes INT,
  
  -- Metadata
  title TEXT,
  description TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_shadow_calendar_user_id ON shadow_calendar_events(user_id);
CREATE INDEX idx_shadow_calendar_time_range ON shadow_calendar_events(start_time, end_time);

-- RLS Policies
ALTER TABLE shadow_calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own calendar events"
  ON shadow_calendar_events FOR ALL
  USING (auth.uid() = user_id);
```

---

#### community_fund_transactions

```sql
CREATE TABLE community_fund_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Transaction details
  date DATE NOT NULL,
  total_revenue NUMERIC(10, 2) NOT NULL,
  
  -- Allocation (30% Community Fund)
  operations_amount NUMERIC(10, 2) NOT NULL, -- 40%
  community_fund_amount NUMERIC(10, 2) NOT NULL, -- 30%
  expansion_amount NUMERIC(10, 2) NOT NULL, -- 20%
  scholarships_amount NUMERIC(10, 2) NOT NULL, -- 10%
  
  -- Metadata
  user_count INT, -- Number of paying users
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_community_fund_date ON community_fund_transactions(date DESC);
```

---

#### community_fund_grants

```sql
CREATE TABLE community_fund_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Applicant (Valencia grad business)
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  business_name TEXT NOT NULL,
  business_description TEXT,
  valencia_credential TEXT, -- Which Valencia program they graduated from
  
  -- Grant details
  amount_requested NUMERIC(10, 2) NOT NULL,
  amount_awarded NUMERIC(10, 2),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'under_review', 'approved', 'denied', 'disbursed'
  )),
  
  -- Application
  application_data JSONB, -- Full application form data
  submitted_at TIMESTAMPTZ DEFAULT now(),
  
  -- Review
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  
  -- Disbursement
  disbursed_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_grants_status ON community_fund_grants(status);
CREATE INDEX idx_grants_submitted_at ON community_fund_grants(submitted_at DESC);
```

---

### Subscription & Payment Tables

#### subscriptions

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Stripe data
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  stripe_price_id TEXT NOT NULL,
  
  -- Subscription details
  tier TEXT NOT NULL CHECK (tier IN ('essential', 'starter', 'premium')),
  status TEXT NOT NULL CHECK (status IN (
    'trialing', 'active', 'past_due', 'canceled', 'unpaid'
  )),
  
  -- Billing
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMPTZ,
  
  -- Trial
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);

-- RLS Policies
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);
```

---

#### payments

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  
  -- Stripe data
  stripe_payment_intent_id TEXT UNIQUE NOT NULL,
  stripe_charge_id TEXT,
  
  -- Payment details
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL CHECK (status IN (
    'succeeded', 'pending', 'failed', 'canceled', 'refunded'
  )),
  
  -- Allocation (for transparency)
  operations_amount NUMERIC(10, 2), -- 40%
  community_fund_amount NUMERIC(10, 2), -- 30%
  expansion_amount NUMERIC(10, 2), -- 20%
  scholarships_amount NUMERIC(10, 2), -- 10%
  
  -- Metadata
  payment_method TEXT, -- 'card', 'ach'
  description TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);

-- RLS Policies
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);
```

---

### Analytics & Tracking Tables

#### events

```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- NULL for anonymous events
  
  -- Event details
  event_name TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  
  -- Session tracking
  session_id UUID,
  
  -- Device info (no PII)
  device_type TEXT, -- 'mobile', 'desktop', 'tablet'
  browser TEXT,
  os TEXT,
  
  -- Location (Zip3 only for k-anonymity)
  zip3 TEXT, -- First 3 digits of zip code
  city TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_events_name ON events(event_name);
CREATE INDEX idx_events_created_at ON events(created_at DESC);

-- Partition by month (for performance)
CREATE TABLE events_2026_01 PARTITION OF events FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE events_2026_02 PARTITION OF events FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
-- (Add more partitions as needed)
```

---

### Database Functions & Triggers

#### Auto-update updated_at

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_credentials_updated_at BEFORE UPDATE ON credentials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resumes_updated_at BEFORE UPDATE ON resumes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- (Apply to all tables with updated_at column)
```

---

#### Community Fund Auto-Allocation

```sql
CREATE OR REPLACE FUNCTION allocate_community_fund()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate allocations (40/30/20/10 split)
  NEW.operations_amount := NEW.amount * 0.40;
  NEW.community_fund_amount := NEW.amount * 0.30;
  NEW.expansion_amount := NEW.amount * 0.20;
  NEW.scholarships_amount := NEW.amount * 0.10;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER allocate_payment_funds BEFORE INSERT ON payments
  FOR EACH ROW EXECUTE FUNCTION allocate_community_fund();
```

---

## API Architecture

### API Design Principles

**1. RESTful Conventions**
- GET: Read resources
- POST: Create resources
- PUT/PATCH: Update resources
- DELETE: Delete resources

**2. Versioning**
- All endpoints prefixed with `/v1/`
- Future versions: `/v2/`, `/v3/`

**3. Authentication**
- Bearer token in Authorization header
- `Authorization: Bearer <supabase_jwt>`

**4. Response Format**
- Success: `{ "success": true, "data": {...} }`
- Error: `{ "success": false, "error": { "code": "...", "message": "..." } }`

**5. Rate Limiting**
- 100 requests/minute per user (authenticated)
- 20 requests/minute per IP (unauthenticated)

---

### API Endpoints

#### Authentication

**POST /v1/auth/signup**
```typescript
Request:
{
  email: string;
  password?: string; // Optional if using passkey
  full_name: string;
}

Response:
{
  success: true;
  data: {
    user: User;
    session: Session;
  }
}
```

**POST /v1/auth/login**
```typescript
Request:
{
  email: string;
  password?: string;
  // OR passkey challenge response
}

Response:
{
  success: true;
  data: {
    user: User;
    session: Session;
  }
}
```

---

#### Onboarding

**POST /v1/onboarding/complete**
```typescript
Request:
{
  location: {
    address: string;
    lat: number;
    lng: number;
    zip_code: string;
    city: string;
  };
  credentials: Array<{
    institution: string;
    credential_type: string;
    program: string;
    status: string;
  }>;
  transportation: {
    has_car: boolean;
    uses_lynx: boolean;
    uses_rideshare: boolean;
    walks: boolean;
  };
  max_commute_minutes: number;
  availability: {
    type: string;
    specific_days?: string[];
    preferred_shifts: string[];
  };
  salary_target: {
    min: number;
    max: number;
  };
  challenges: string[];
  situation_notes?: string;
  tier: 'essential' | 'starter' | 'premium';
}

Response:
{
  success: true;
  data: {
    user: User;
    onboarding_completed: true;
  }
}
```

---

#### Jobs

**GET /v1/jobs/search**
```typescript
Query Params:
?location=Orlando,FL
&salary_min=30000
&salary_max=40000
&max_commute=30
&transportation=lynx
&page=1
&limit=20

Response:
{
  success: true;
  data: {
    jobs: Job[];
    total: number;
    page: number;
    limit: number;
    has_more: boolean;
  }
}
```

**GET /v1/jobs/:jobId**
```typescript
Response:
{
  success: true;
  data: {
    job: Job;
    transit_info?: {
      duration_minutes: number;
      lynx_routes: Array<{
        route_number: string;
        route_name: string;
      }>;
      departure_stop: string;
      arrival_stop: string;
    };
    valencia_match?: {
      score: number;
      matching_keywords: string[];
    };
    scam_shield: {
      severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
      flags: Array<{
        rule: string;
        description: string;
      }>;
    };
  }
}
```

---

#### Job Pockets

**POST /v1/job-pockets/generate**
```typescript
Request:
{
  job_id: string;
  tier: 'tier1' | 'tier2' | 'tier3';
}

Response:
{
  success: true;
  data: {
    job_pocket: JobPocket;
    generation_time_ms: number;
  }
}

// Async generation (for Tier 3)
Response (if not ready):
{
  success: true;
  data: {
    status: 'generating';
    job_pocket_id: string;
    estimated_time_seconds: 300;
  }
}
```

**GET /v1/job-pockets/:jobPocketId**
```typescript
Response:
{
  success: true;
  data: {
    job_pocket: JobPocket;
    status: 'ready' | 'generating' | 'failed';
  }
}
```

---

#### Resume

**POST /v1/resume/create**
```typescript
Request:
{
  full_name: string;
  email: string;
  phone?: string;
  experience: Array<{
    title: string;
    company: string;
    start_date: string; // YYYY-MM
    end_date?: string;
    bullets: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    graduation_date?: string;
  }>;
  skills: string[];
}

Response:
{
  success: true;
  data: {
    resume: Resume;
    ats_score: number;
  }
}
```

**POST /v1/resume/optimize**
```typescript
Request:
{
  resume_id: string;
}

Response:
{
  success: true;
  data: {
    resume: Resume;
    ats_score_before: number;
    ats_score_after: number;
    changes: Array<{
      type: 'keyword_added' | 'formatting_improved' | 'valencia_highlighted';
      description: string;
    }>;
  }
}
```

**POST /v1/resume/translate-skills**
```typescript
Request:
{
  resume_id: string;
  target_role: string; // 'office', 'tech', 'healthcare'
}

Response:
{
  success: true;
  data: {
    resume: Resume;
    translations: Array<{
      before: string;
      after: string;
      keywords_added: string[];
    }>;
    ats_score_improvement: number;
  }
}
```

**POST /v1/resume/export**
```typescript
Request:
{
  resume_id: string;
  format: 'pdf' | 'docx' | 'both';
}

Response:
{
  success: true;
  data: {
    pdf_url?: string;
    docx_url?: string;
  }
}
```

---

#### Applications

**POST /v1/applications/create**
```typescript
Request:
{
  job_id: string;
  status?: 'discovered' | 'pocketed' | 'applied';
  applied_via_pocket?: boolean;
  pocket_tier?: 'tier1' | 'tier2' | 'tier3';
  user_notes?: string;
}

Response:
{
  success: true;
  data: {
    application: Application;
  }
}
```

**PATCH /v1/applications/:applicationId**
```typescript
Request:
{
  status?: 'interviewing' | 'offer_received' | 'rejected' | 'withdrawn';
  offer_salary?: number;
  offer_equity?: number;
  rejection_reason?: string;
  user_notes?: string;
}

Response:
{
  success: true;
  data: {
    application: Application;
  }
}
```

**GET /v1/applications**
```typescript
Query Params:
?status=applied,interviewing
&page=1
&limit=20

Response:
{
  success: true;
  data: {
    applications: Application[];
    total: number;
    page: number;
    has_more: boolean;
  }
}
```

---

#### Shadow Calendar

**GET /v1/shadow-calendar/events**
```typescript
Query Params:
?start_date=2026-01-12
&end_date=2026-01-19

Response:
{
  success: true;
  data: {
    events: ShadowCalendarEvent[];
    conflicts: Array<{
      event1_id: string;
      event2_id: string;
      conflict_type: 'overlap' | 'insufficient_commute_time';
    }>;
  }
}
```

**POST /v1/shadow-calendar/events**
```typescript
Request:
{
  type: 'shift' | 'commute' | 'interview' | 'block';
  start_time: string; // ISO 8601
  end_time: string;
  job_id?: string;
  application_id?: string;
  interview_id?: string;
  transit_mode?: 'car' | 'lynx' | 'rideshare' | 'walk';
  lynx_route?: string;
}

Response:
{
  success: true;
  data: {
    event: ShadowCalendarEvent;
    conflicts?: Array<{...}>;
  }
}
```

---

#### Daily Plan

**GET /v1/daily-plan/:date**
```typescript
Response:
{
  success: true;
  data: {
    daily_plan: DailyPlan;
    jobs: Job[];
    applied_count: number;
    total_count: number;
  }
}
```

**POST /v1/daily-plan/generate**
```typescript
Request:
{
  date: string; // YYYY-MM-DD
}

Response:
{
  success: true;
  data: {
    daily_plan: DailyPlan;
    jobs: Job[];
  }
}
```

---

#### Community Fund

**GET /v1/community-fund/balance**
```typescript
Response:
{
  success: true;
  data: {
    total_allocated: number;
    total_disbursed: number;
    available_balance: number;
    grants_awarded: number;
    businesses_funded: number;
  }
}
```

**GET /v1/community-fund/transparency**
```typescript
Query Params:
?year=2026
&month=01

Response:
{
  success: true;
  data: {
    total_revenue: number;
    allocations: {
      operations: number;
      community_fund: number;
      expansion: number;
      scholarships: number;
    };
    grants: Array<{
      business_name: string;
      amount: number;
      disbursed_at: string;
    }>;
  }
}
```

---

## Authentication & Authorization

### Passkey Authentication (Primary)

**Technology:** FIDO2/WebAuthn

**Why Passkeys:**
- More secure than passwords (phishing-resistant)
- Better UX (biometric or device PIN)
- No password to remember/reset
- Works on phones (Face ID, Touch ID, Android Biometrics)

**Implementation:**
```typescript
// Registration
import { startRegistration } from '@simplewebauthn/browser';

async function registerPasskey() {
  // 1. Get challenge from server
  const options = await fetch('/v1/auth/passkey/register-options').then(r => r.json());
  
  // 2. Prompt user for passkey creation
  const credential = await startRegistration(options);
  
  // 3. Send credential to server for verification
  const response = await fetch('/v1/auth/passkey/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential })
  });
  
  return response.json();
}

// Authentication
import { startAuthentication } from '@simplewebauthn/browser';

async function loginWithPasskey() {
  // 1. Get challenge from server
  const options = await fetch('/v1/auth/passkey/login-options').then(r => r.json());
  
  // 2. Prompt user for passkey authentication
  const credential = await startAuthentication(options);
  
  // 3. Send credential to server for verification
  const response = await fetch('/v1/auth/passkey/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential })
  });
  
  return response.json();
}
```

---

### Magic Links (Backup)

**When to Use:**
- Passkey not supported (old browsers)
- User prefers email-based auth
- Cross-device login (started on mobile, finish on desktop)

**Implementation:**
```typescript
async function sendMagicLink(email: string) {
  const response = await fetch('/v1/auth/magic-link', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  
  return response.json();
}

// User clicks link in email → redirected to /auth/callback?token=...
// Server verifies token, creates session, redirects to dashboard
```

---

### OAuth (Convenience)

**Providers:** Google, Apple

**Implementation:**
```typescript
// Supabase built-in OAuth
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });
  
  if (error) throw error;
  return data;
}
```

---

### Row-Level Security (RLS)

**Concept:** Database enforces access control at row level

**Example Policy:**
```sql
-- Users can only see their own data
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can only update their own data
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Users can only delete their own applications
CREATE POLICY "Users can delete own applications"
  ON applications FOR DELETE
  USING (auth.uid() = user_id);
```

**Enforcement:** Supabase automatically enforces RLS policies on all database queries

---

### Session Management

**Public Mode (Library Computers):**
```typescript
// Use SessionStorage instead of LocalStorage
// SessionStorage clears on tab close

function enablePublicMode() {
  // 1. Store session in SessionStorage (not LocalStorage)
  const session = await supabase.auth.getSession();
  sessionStorage.setItem('supabase.auth.session', JSON.stringify(session));
  
  // 2. Set 15-minute idle timeout
  let idleTimer: NodeJS.Timeout;
  
  function resetIdleTimer() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(async () => {
      await supabase.auth.signOut();
      sessionStorage.clear();
      window.location.href = '/';
    }, 15 * 60 * 1000); // 15 minutes
  }
  
  // Reset timer on any user activity
  document.addEventListener('mousemove', resetIdleTimer);
  document.addEventListener('keypress', resetIdleTimer);
  
  // 3. Show QR code quick-exit
  // User scans QR with phone → backend immediately invalidates session
}
```

---

## AI Integration Architecture

### AI Routing System

**Goal:** Use the right AI model for the right job (cost optimization)

**Decision Tree:**
```
┌─────────────────────────────────────────────────┐
│            AI ROUTING DECISION                  │
└────────────────┬────────────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
    Essential/        Premium
    Starter           Tier
        │                 │
        │                 │
  ┌─────┴─────┐     ┌─────┴─────┐
  │           │     │           │
Tier 1/2   Skills  Tier 3    LinkedIn
 Pocket   Translation Career   Mapping
  │           │     Pocket       │
  │           │       │          │
  ▼           ▼       ▼          ▼
Gemini 3   Gemini 3  Gemini 3   Gemini 3
 Flash      Flash     Pro Deep   Pro
                      Research
$0.01      $0.01     $0.30      $0.10
```

---

### Gemini Integration

**API Client Setup:**
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Models
const flashModel = genAI.getGenerativeModel({ model: 'gemini-3-flash' });
const proModel = genAI.getGenerativeModel({ 
  model: 'gemini-3-pro',
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 8000,
  }
});
```

**Prompt Engineering Best Practices:**
```typescript
async function generateJobPocket(tier: 'tier1' | 'tier2' | 'tier3', job: Job, user: User) {
  const model = tier === 'tier3' ? proModel : flashModel;
  
  const prompt = `
You are a professional career coach helping a job seeker apply to a job.

USER CONTEXT:
- Name: ${user.full_name}
- Location: ${user.location_city}, ${user.location_state}
- Transportation: ${user.transportation.uses_lynx ? 'LYNX bus only' : 'Has car'}
- Max commute: ${user.max_commute_minutes} minutes
- Challenges: ${user.challenges.join(', ')}
- Goal: ${user.tier === 'essential' ? 'Find job ASAP (7 days)' : user.tier === 'starter' ? 'Bridge job transition (8 weeks)' : 'Strategic search (12 weeks)'}

JOB DETAILS:
- Title: ${job.title}
- Company: ${job.company}
- Pay: ${job.salary_min}-${job.salary_max}/${job.salary_period}
- Location: ${job.location_city}
- Description: ${job.description}

TASK:
Generate a ${tier.toUpperCase()} Job Pocket with the following sections:
${tier === 'tier1' ? TIER1_SECTIONS : tier === 'tier2' ? TIER2_SECTIONS : TIER3_SECTIONS}

IMPORTANT RULES:
1. Be specific and actionable (not generic advice)
2. Use the user's actual experience (no hallucinations)
3. Keep it concise (under ${tier === 'tier1' ? 300 : tier === 'tier2' ? 500 : 3000} words)
4. Focus on what helps them get THIS job

Return JSON format:
{
  "sections": {...}
}
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  // Parse JSON (with error handling)
  try {
    const json = JSON.parse(text);
    return json;
  } catch (e) {
    // Fallback: extract JSON from markdown code block
    const match = text.match(/```json\n([\s\S]*?)\n```/);
    if (match) {
      return JSON.parse(match[1]);
    }
    throw new Error('Invalid JSON response from AI');
  }
}
```

---

### DeepSeek Integration (Cost Optimization)

**When to Use:**
- Non-critical features (e.g., basic interview prep)
- High-volume, low-value requests
- Cost-sensitive users (trial users)

**API Client:**
```typescript
import OpenAI from 'openai';

const deepseek = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY
});

async function generateBasicInterviewPrep(job: Job) {
  const response = await deepseek.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      {
        role: 'system',
        content: 'You are a career coach providing interview preparation advice.'
      },
      {
        role: 'user',
        content: `Generate 5 common interview questions for a ${job.title} position at ${job.company}.`
      }
    ],
    temperature: 0.7,
    max_tokens: 500
  });
  
  return response.choices[0].message.content;
}
```

---

## External Service Integration

### Indeed API Integration

**Authentication:**
```typescript
const indeedClient = {
  async search(params: {
    location: string;
    keywords?: string;
    salary_min?: number;
    posted?: string;
    limit?: number;
  }) {
    const url = new URL('https://api.indeed.com/ads/apisearch');
    url.searchParams.append('publisher', process.env.INDEED_PUBLISHER_ID);
    url.searchParams.append('v', '2');
    url.searchParams.append('format', 'json');
    url.searchParams.append('l', params.location);
    
    if (params.keywords) url.searchParams.append('q', params.keywords);
    if (params.salary_min) url.searchParams.append('salary', params.salary_min.toString());
    if (params.posted) url.searchParams.append('fromage', params.posted);
    url.searchParams.append('limit', (params.limit || 25).toString());
    
    const response = await fetch(url.toString());
    return response.json();
  }
};
```

---

### Google Maps API Integration

**Transit Directions:**
```typescript
import { Client } from '@googlemaps/google-maps-services-js';

const mapsClient = new Client({});

async function calculateTransitTime(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  arrivalTime: Date
) {
  const response = await mapsClient.directions({
    params: {
      origin: `${origin.lat},${origin.lng}`,
      destination: `${destination.lat},${destination.lng}`,
      mode: 'transit',
      transit_mode: ['bus'],
      arrival_time: Math.floor(arrivalTime.getTime() / 1000),
      alternatives: true,
      key: process.env.GOOGLE_MAPS_API_KEY!
    }
  });
  
  if (response.data.status !== 'OK') {
    throw new Error(`Google Maps API error: ${response.data.status}`);
  }
  
  const routes = response.data.routes.map(route => ({
    duration_minutes: route.legs[0].duration.value / 60,
    steps: route.legs[0].steps,
    lynx_routes: route.legs[0].steps
      .filter(step => step.travel_mode === 'TRANSIT')
      .map(step => ({
        route_number: step.transit_details?.line.short_name || '',
        route_name: step.transit_details?.line.name || '',
        departure_stop: step.transit_details?.departure_stop.name || '',
        arrival_stop: step.transit_details?.arrival_stop.name || ''
      }))
  }));
  
  return routes;
}
```

---

### LinkedIn API Integration (Premium Only)

**Connection Mapping:**
```typescript
import { LinkedInApi } from 'linkedin-api';

const linkedIn = new LinkedInApi({
  clientId: process.env.LINKEDIN_CLIENT_ID,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET
});

async function findConnectionPath(
  userLinkedInId: string,
  targetLinkedInId: string
) {
  // 1. Get user's 1st-degree connections
  const connections = await linkedIn.getConnections(userLinkedInId);
  
  // 2. Check if target is 1st-degree
  if (connections.some(c => c.id === targetLinkedInId)) {
    return {
      path: [userLinkedInId, targetLinkedInId],
      degree: 1
    };
  }
  
  // 3. Check if target is 2nd-degree (via shared connection)
  for (const connection of connections) {
    const theirConnections = await linkedIn.getConnections(connection.id);
    if (theirConnections.some(c => c.id === targetLinkedInId)) {
      return {
        path: [userLinkedInId, connection.id, targetLinkedInId],
        degree: 2,
        bridge: connection
      };
    }
  }
  
  // 4. No direct path found
  return {
    path: [],
    degree: 3+,
    message: 'No direct path found. Consider reaching out via LinkedIn InMail.'
  };
}
```

---

### Stripe Integration

**Subscription Creation:**
```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function createSubscription(
  userId: string,
  tier: 'essential' | 'starter' | 'premium'
) {
  // 1. Create or retrieve customer
  const user = await db.users.findById(userId);
  let customerId = user.stripe_customer_id;
  
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.full_name,
      metadata: { user_id: userId }
    });
    customerId = customer.id;
    await db.users.update(userId, { stripe_customer_id: customerId });
  }
  
  // 2. Get price ID for tier
  const priceId = {
    essential: process.env.STRIPE_PRICE_ID_ESSENTIAL,
    starter: process.env.STRIPE_PRICE_ID_STARTER,
    premium: process.env.STRIPE_PRICE_ID_PREMIUM
  }[tier];
  
  // 3. Create subscription with 7-day trial
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    trial_period_days: 7,
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    expand: ['latest_invoice.payment_intent']
  });
  
  // 4. Save subscription to database
  await db.subscriptions.create({
    user_id: userId,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: customerId,
    stripe_price_id: priceId,
    tier,
    status: subscription.status,
    current_period_start: new Date(subscription.current_period_start * 1000),
    current_period_end: new Date(subscription.current_period_end * 1000),
    trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
    trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null
  });
  
  return subscription;
}
```

**Webhook Handling:**
```typescript
// Handle Stripe webhooks (payment events)
export async function handleStripeWebhook(req: Request) {
  const sig = req.headers.get('stripe-signature')!;
  const body = await req.text();
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
  
  // Handle different event types
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
      break;
      
    case 'customer.subscription.deleted':
      await handleSubscriptionCanceled(event.data.object as Stripe.Subscription);
      break;
      
    case 'invoice.payment_succeeded':
      await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
      break;
      
    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object as Stripe.Invoice);
      break;
  }
  
  return new Response(JSON.stringify({ received: true }), { status: 200 });
}
```

---

## Infrastructure & Deployment

### Hosting Architecture

**Frontend + API:**
- **Vercel** (edge-optimized Next.js deployment)
  - Automatic HTTPS
  - Global CDN (100+ edge locations)
  - Auto-scaling
  - Zero-config deployment

**Database:**
- **Supabase** (managed PostgreSQL)
  - Automatic backups (daily)
  - Point-in-time recovery
  - Connection pooling (PgBouncer)
  - Read replicas (future)

**File Storage:**
- **Supabase Storage** (S3-compatible)
  - Resumes, user-uploaded files
  - Automatic CDN distribution

**Caching:**
- **Vercel Edge Cache** (CDN caching)
- **Redis** (Upstash, serverless)
  - API response caching
  - Rate limiting
  - Session storage (if needed)

---

### Deployment Pipeline

**CI/CD Flow:**
```
Developer → Git Push → GitHub Actions → Tests → Deploy to Vercel
                                          │
                                          ▼
                                    Run Migrations
                                    (Supabase)
```

**GitHub Actions Workflow:**
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: pnpm install
      - run: pnpm run lint
      - run: pnpm run type-check
      - run: pnpm run test
      
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

### Environment Variables

**.env.local (Development):**
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI
GEMINI_API_KEY=your-gemini-key
DEEPSEEK_API_KEY=your-deepseek-key

# External APIs
INDEED_PUBLISHER_ID=your-indeed-id
GOOGLE_MAPS_API_KEY=your-google-maps-key
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRICE_ID_ESSENTIAL=price_...
STRIPE_PRICE_ID_STARTER=price_...
STRIPE_PRICE_ID_PREMIUM=price_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**.env.production (Vercel):**
```bash
# Same as above, but with production keys
```

---

### Database Migrations

**Migration Strategy:**
1. Create migration file
2. Test locally
3. Deploy to staging
4. Deploy to production

**Example Migration:**
```bash
# Create migration
supabase migration new add_lynx_routes_table

# This creates: supabase/migrations/20260112_add_lynx_routes_table.sql
```

```sql
-- supabase/migrations/20260112_add_lynx_routes_table.sql

-- Create lynx_routes table
CREATE TABLE lynx_routes (
  route_id TEXT PRIMARY KEY,
  route_number TEXT NOT NULL,
  route_name TEXT NOT NULL,
  route_type TEXT CHECK (route_type IN ('local', 'express', 'link')),
  color_hex TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_lynx_routes_number ON lynx_routes(route_number);
CREATE INDEX idx_lynx_routes_active ON lynx_routes(is_active) WHERE is_active = true;

-- Seed initial data
INSERT INTO lynx_routes (route_id, route_number, route_name, route_type, color_hex) VALUES
  ('lynx-036', '36', 'Pine Hills - Colonial - Downtown', 'local', '#FF0000'),
  ('lynx-050', '50', 'Michigan - Orange Ave - Downtown', 'local', '#0000FF'),
  ('lynx-018', '18', 'OBT Corridor', 'local', '#00FF00');
```

**Apply Migration:**
```bash
# Locally
supabase db reset

# Production (via GitHub Actions or Supabase CLI)
supabase db push
```

---

## Security Architecture

### Security Principles

**1. Defense in Depth**
- Multiple layers of security
- Authentication → Authorization → Data Encryption → Network Security

**2. Principle of Least Privilege**
- Users only access their own data (RLS)
- Service accounts have minimal permissions

**3. Zero Trust Architecture**
- Never trust, always verify
- Every request authenticated and authorized

**4. Privacy by Design**
- No PII in logs or analytics
- Data minimization (collect only what's needed)
- Encryption at rest and in transit

---

### Data Encryption

**At Rest:**
- Database: Supabase PostgreSQL (AES-256 encryption)
- File Storage: Supabase Storage (AES-256 encryption)
- Backups: Encrypted

**In Transit:**
- HTTPS everywhere (TLS 1.3)
- API calls: Bearer token over HTTPS
- WebSocket connections: WSS (secure WebSocket)

**Sensitive Data:**
```typescript
// Encrypt sensitive fields before storing
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');
const ALGORITHM = 'aes-256-gcm';

function encrypt(text: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

function decrypt(encryptedData: string): string {
  const parts = encryptedData.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];
  
  const decipher = createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// Usage
const encryptedSSN = encrypt(user.ssn);
await db.users.update(userId, { ssn_encrypted: encryptedSSN });
```

---

### Rate Limiting

**Implementation:**
```typescript
// Using Upstash Redis for rate limiting
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!
});

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
  analytics: true
});

// Middleware
export async function rateLimitMiddleware(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const { success, remaining, reset } = await ratelimit.limit(ip);
  
  if (!success) {
    return new Response('Rate limit exceeded', {
      status: 429,
      headers: {
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': reset.toString()
      }
    });
  }
  
  return null; // Allow request
}
```

---

### Content Security Policy (CSP)

**Next.js Config:**
```typescript
// next.config.js
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://maps.googleapis.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https://maps.googleapis.com https://maps.gstatic.com;
  font-src 'self';
  connect-src 'self' https://*.supabase.co https://maps.googleapis.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
`;

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim()
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)'
          }
        ]
      }
    ];
  }
};
```

---

## Scalability & Performance

### Performance Budget

**Page Load Targets:**
- First Contentful Paint (FCP): <1.8s
- Time to Interactive (TTI): <3.9s
- Largest Contentful Paint (LCP): <2.5s
- Cumulative Layout Shift (CLS): <0.1

**Bundle Size:**
- Initial JS bundle: <200KB (gzipped)
- CSS: <50KB (gzipped)
- Total page weight: <1MB

---

### Caching Strategy

**1. CDN Caching (Vercel Edge)**
```typescript
// pages/jobs/[id].tsx
export const revalidate = 3600; // 1 hour

export async function generateStaticParams() {
  // Pre-render top 100 jobs
  const topJobs = await db.jobs.findMany({ limit: 100, orderBy: { posted_at: 'desc' } });
  return topJobs.map(job => ({ id: job.id }));
}
```

**2. API Response Caching (Redis)**
```typescript
async function getCachedJobSearch(params: JobSearchParams) {
  const cacheKey = `job_search:${JSON.stringify(params)}`;
  
  // Check cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Fetch from database
  const results = await db.jobs.search(params);
  
  // Cache for 5 minutes
  await redis.setex(cacheKey, 300, JSON.stringify(results));
  
  return results;
}
```

**3. Browser Caching**
```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ];
  }
};
```

---

### Database Optimization

**1. Indexes**
- All foreign keys indexed
- Commonly queried fields indexed
- Full-text search indexes for job descriptions

**2. Connection Pooling**
- Supabase uses PgBouncer
- Max connections: 100 (configurable)

**3. Query Optimization**
```typescript
// BAD: N+1 query
const applications = await db.applications.findMany({ where: { user_id: userId } });
for (const app of applications) {
  app.job = await db.jobs.findById(app.job_id); // N queries!
}

// GOOD: Single query with join
const applications = await db.applications.findMany({
  where: { user_id: userId },
  include: { job: true } // Single query with join
});
```

**4. Read Replicas (Future)**
- Read-heavy queries → read replica
- Write queries → primary database

---

## Monitoring & Observability

### Metrics to Track

**Application Metrics:**
- Request rate (requests/sec)
- Error rate (errors/sec)
- Response time (p50, p95, p99)
- Database query time
- API endpoint performance

**Business Metrics:**
- New users (signups/day)
- Active users (DAU, MAU)
- Subscription conversions (trial → paid)
- Churn rate (canceled subscriptions)
- Job applications (count/day)
- Callback rate (interviews/applications)
- Hire rate (offers/applications)
- **Community Fund allocation** (30% tracked daily)

**Infrastructure Metrics:**
- CPU usage
- Memory usage
- Database connections
- Storage usage
- Cache hit rate

---

### Logging

**Log Levels:**
- **ERROR:** System failures, exceptions
- **WARN:** Non-critical issues, deprecations
- **INFO:** Important events (user signup, payment)
- **DEBUG:** Detailed diagnostic info (dev only)

**What NOT to Log:**
- Passwords, API keys, tokens
- PII (email, phone, SSN)
- Full credit card numbers
- Session tokens

**Log Example:**
```typescript
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: {
    paths: ['email', 'phone', 'password', 'ssn', 'token'],
    remove: true
  }
});

// Usage
logger.info({ user_id: userId, event: 'signup' }, 'User signed up');
logger.error({ error: err.message, stack: err.stack }, 'API request failed');
```

---

### Error Tracking (Sentry)

**Setup:**
```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% of transactions
  
  beforeSend(event, hint) {
    // Scrub PII
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers;
    }
    
    if (event.user) {
      delete event.user.email;
      delete event.user.ip_address;
    }
    
    return event;
  }
});
```

---

### Uptime Monitoring

**Provider:** UptimeRobot (or similar)

**Monitors:**
- Homepage: https://jalanea.works
- API health: https://jalanea.works/api/health
- Database health: Check Supabase dashboard

**Alerts:**
- Downtime > 5 minutes → Email + SMS
- Error rate > 5% → Email
- Response time > 5s → Email

---

## Development Environment

### Local Setup

**Prerequisites:**
- Node.js 20+
- pnpm 8+
- Supabase CLI
- Git

**Installation:**
```bash
# Clone repo
git clone https://github.com/jalanea-works/platform.git
cd platform

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your keys

# Start Supabase local
supabase start

# Run database migrations
supabase db reset

# Start development server
pnpm dev
```

**Development Server:**
- Frontend: http://localhost:3000
- Supabase Studio: http://localhost:54323
- Supabase API: http://localhost:54321

---

### Project Structure

```
jalanea-works/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (login, signup)
│   ├── (dashboard)/       # Protected dashboard pages
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
│
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── jobs/             # Job-related components
│   ├── applications/     # Application tracking components
│   └── shared/           # Shared components
│
├── lib/                   # Utilities
│   ├── supabase/         # Supabase client
│   ├── ai/               # AI integration (Gemini, DeepSeek)
│   ├── external/         # External APIs (Indeed, Google Maps)
│   └── utils/            # Helper functions
│
├── types/                 # TypeScript types
│   ├── database.ts       # Generated from Supabase
│   ├── jobs.ts
│   ├── applications.ts
│   └── users.ts
│
├── supabase/              # Supabase config
│   ├── migrations/       # Database migrations
│   ├── functions/        # Edge functions
│   └── config.toml       # Supabase config
│
├── public/                # Static assets
│   ├── images/
│   └── fonts/
│
├── tests/                 # Tests
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── docs/                  # Documentation
│   ├── for-claude/       # Master build docs (this file)
│   └── api/              # API documentation
│
├── .github/               # GitHub Actions
│   └── workflows/
│       └── deploy.yml
│
├── next.config.js         # Next.js config
├── tailwind.config.ts     # Tailwind config
├── tsconfig.json          # TypeScript config
├── package.json
└── README.md
```

---

### Testing Strategy

**Unit Tests (Vitest):**
```typescript
// lib/utils/transit-time.test.ts
import { describe, it, expect } from 'vitest';
import { calculateTransitTime } from './transit-time';

describe('calculateTransitTime', () => {
  it('should calculate LYNX route time correctly', async () => {
    const origin = { lat: 28.5783, lng: -81.4540 }; // Pine Hills
    const destination = { lat: 28.5383, lng: -81.3792 }; // Downtown
    
    const result = await calculateTransitTime(origin, destination, new Date('2026-01-12T09:00:00'));
    
    expect(result.duration_minutes).toBeLessThan(30);
    expect(result.lynx_routes.length).toBeGreaterThan(0);
    expect(result.lynx_routes[0].route_number).toBe('36');
  });
});
```

**E2E Tests (Playwright):**
```typescript
// tests/e2e/onboarding.spec.ts
import { test, expect } from '@playwright/test';

test('complete onboarding flow', async ({ page }) => {
  await page.goto('/signup');
  
  // Step 1: Foundation
  await page.fill('input[name="full_name"]', 'Test User');
  await page.click('button:has-text("Use My Location")');
  await page.click('button:has-text("Continue")');
  
  // Step 2: Education
  await page.selectOption('select[name="institution"]', 'Valencia College');
  await page.selectOption('select[name="credential_type"]', 'Certificate');
  await page.click('button:has-text("Continue")');
  
  // ... rest of onboarding
  
  // Assert: User lands on dashboard
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('h1')).toContainText('Your Daily Plan');
});
```

---

## Document Summary

**Doc 4: Technical Architecture - COMPLETE**

**What's Covered:**
1. ✅ System Architecture Overview (high-level diagram, principles)
2. ✅ Technology Stack (frontend, backend, AI, external services)
3. ✅ Complete Database Schema (30+ tables with relationships, indexes, RLS policies)
4. ✅ API Architecture (30+ endpoints with request/response specs)
5. ✅ Authentication & Authorization (passkeys, magic links, OAuth, RLS)
6. ✅ AI Integration Architecture (Gemini, DeepSeek, routing logic)
7. ✅ External Service Integration (Indeed, Google Maps, LinkedIn, Stripe)
8. ✅ Infrastructure & Deployment (Vercel, Supabase, CI/CD pipeline)
9. ✅ Security Architecture (encryption, rate limiting, CSP)
10. ✅ Scalability & Performance (caching, optimization, performance budget)
11. ✅ Monitoring & Observability (metrics, logging, error tracking)
12. ✅ Development Environment (local setup, project structure, testing)

**What's NOT Covered (See Other Docs):**
- Business logic & feature specs → Doc 2: Project Requirements
- User experience & design → Doc 3: User Experience
- Legal compliance & policies → Doc 5: Compliance & Safeguards

**Next Steps:**
- Doc 5: Compliance & Safeguards (legal, privacy, content moderation, ADA)
- OR start building with these 4 comprehensive master build documents!

---

*Document Version: 1.0*  
*Last Updated: January 12, 2026*  
*Created By: Alexus (Founder, Jalanea Works)*  
*Purpose: Complete technical blueprint for building Jalanea Works V1*

