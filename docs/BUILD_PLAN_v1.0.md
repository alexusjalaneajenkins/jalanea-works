# BUILD_PLAN.md
*Jalanea Works - 12-Week Build Timeline*
**For Solo Founders Using Claude Code**
**Version 1.0**

---

## How to Use This Plan

**This is your roadmap from zero to launch.**

**How it works:**
1. Each week = 1 sprint
2. Each sprint = specific goals + tasks
3. Each task = something you can hand to Claude Code
4. Check boxes as you complete tasks
5. Move at your own pace (faster or slower is fine!)

**Working with Claude Code:**
- Open terminal: `claude`
- Paste tasks from this doc
- Let Claude Code build
- Test, iterate, repeat

**Reference Docs:**
- Doc 1: PROJECT_OVERVIEW v3.0 (mission, why)
- Doc 2: PROJECT_REQUIREMENTS v1.0 (feature specs)
- Doc 3: USER_EXPERIENCE v1.0 (personas, flows)
- Doc 4: TECHNICAL_ARCHITECTURE v1.0 (database, APIs)
- Doc 5: COMPLIANCE_AND_SAFEGUARDS v1.0 BOOTSTRAPPED (legal)

---

## Timeline Overview

**Phase 1: Foundation (Weeks 1-4)**
- Week 1: Project setup + auth
- Week 2: Database + onboarding UI
- Week 3: Orlando onboarding logic
- Week 4: User dashboard

**Phase 2: Core Features (Weeks 5-8)**
- Week 5: Job search (Indeed API)
- Week 6: LYNX integration + Scam Shield
- Week 7: Job Pockets (Tier 1)
- Week 8: Application tracking

**Phase 3: AI Features (Weeks 9-10)**
- Week 9: Resume Studio + Skills Translation
- Week 10: Career Coach + Daily Plan

**Phase 4: Polish & Launch (Weeks 11-12)**
- Week 11: Legal compliance + accessibility
- Week 12: Beta testing + launch

---

## Before You Start (Week 0)

### Prerequisites Checklist

**Accounts to Create (All Free):**
- [ ] GitHub account (code hosting)
- [ ] Vercel account (deployment)
- [ ] Supabase account (database)
- [ ] Stripe account (payments)
- [ ] Google Cloud account (Gemini AI + Maps API)
- [ ] Indeed Publisher account (job search API)

**Local Setup:**
- [ ] Install Node.js 20+ (https://nodejs.org/)
- [ ] Install pnpm: `npm install -g pnpm`
- [ ] Install Supabase CLI: `npm install -g supabase`
- [ ] Install Claude Code (if not already): Follow Claude's instructions
- [ ] Install VS Code (or your preferred editor)

**Get API Keys:**
- [ ] Supabase: Project Settings → API → Copy `anon` key
- [ ] Google Gemini: https://aistudio.google.com/app/apikey
- [ ] Google Maps: https://console.cloud.google.com/apis/credentials
- [ ] Indeed Publisher: https://www.indeed.com/publisher
- [ ] Stripe: Dashboard → Developers → API Keys

**Estimated Time:** 2-3 hours
**Cost:** $0 (all free tiers)

---

## Phase 1: Foundation (Weeks 1-4)

---

### Week 1: Project Setup + Authentication

**Goal:** Working Next.js app with passkey authentication deployed to Vercel

#### Task 1.1: Initialize Next.js Project

**What to tell Claude Code:**
```
Create a new Next.js 14 project with:
- App Router (not Pages Router)
- TypeScript
- Tailwind CSS
- ESLint + Prettier
- pnpm as package manager

Project structure:
/app - Next.js pages
/components - React components
/lib - Utility functions
/types - TypeScript types

Folder: jalanea-works
```

**Checklist:**
- [ ] Next.js project created
- [ ] TypeScript configured
- [ ] Tailwind CSS working
- [ ] Can run `pnpm dev` and see homepage at localhost:3000
- [ ] Git repository initialized: `git init`
- [ ] Initial commit: `git commit -m "Initial commit"`

**Reference:** Doc 4, Development Environment section

---

#### Task 1.2: Set Up Supabase

**What to tell Claude Code:**
```
Set up Supabase integration:

1. Install Supabase packages:
   pnpm add @supabase/supabase-js @supabase/ssr

2. Create Supabase client in /lib/supabase/client.ts
   - Use environment variables for URL and key
   - Export createClient function

3. Create environment variables file:
   - .env.local (add to .gitignore)
   - NEXT_PUBLIC_SUPABASE_URL=
   - NEXT_PUBLIC_SUPABASE_ANON_KEY=
   - SUPABASE_SERVICE_ROLE_KEY=

4. Create Supabase server client for Server Components
   - /lib/supabase/server.ts

Reference: Doc 4, Technology Stack → Backend section
```

**Checklist:**
- [ ] Supabase packages installed
- [ ] Client and server helpers created
- [ ] .env.local created with API keys
- [ ] .env.local added to .gitignore
- [ ] Can connect to Supabase (test with simple query)

---

#### Task 1.3: Implement Passkey Authentication

**What to tell Claude Code:**
```
Implement passkey authentication using Supabase Auth:

1. Create auth pages:
   - /app/(auth)/login/page.tsx
   - /app/(auth)/signup/page.tsx

2. Use Supabase Auth with passkeys:
   - Install @simplewebauthn/browser for passkey support
   - Create signup flow with passkey registration
   - Create login flow with passkey authentication
   - Fallback: Magic link (email-based auth)

3. Create auth middleware:
   - /middleware.ts
   - Protect /dashboard routes
   - Redirect unauthenticated users to /login

4. Create auth context:
   - /components/providers/auth-provider.tsx
   - Wrap app with AuthProvider
   - Expose current user

Reference: Doc 4, Authentication & Authorization section
```

**Checklist:**
- [ ] Signup page created
- [ ] Login page created
- [ ] Passkey registration working
- [ ] Passkey login working
- [ ] Magic link fallback working
- [ ] Protected routes redirect to login
- [ ] Auth context provides current user

**Test:**
- [ ] Can create account with passkey
- [ ] Can log in with passkey
- [ ] Can log out
- [ ] Protected routes redirect when not logged in

---

#### Task 1.4: Deploy to Vercel

**What to tell Claude Code:**
```
Set up Vercel deployment:

1. Push code to GitHub:
   - Create new repo: jalanea-works
   - Push code: git push origin main

2. Connect to Vercel:
   - Go to vercel.com
   - Import GitHub repo
   - Add environment variables (copy from .env.local)
   - Deploy

3. Set up custom domain (optional for now):
   - jalanea.works
   - Add to Vercel

Reference: Doc 4, Infrastructure & Deployment section
```

**Checklist:**
- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variables added to Vercel
- [ ] App deployed successfully
- [ ] Can access at [your-project].vercel.app
- [ ] Login/signup working on production

---

**Week 1 Complete! 🎉**
- [ ] All Week 1 tasks done
- [ ] Working authentication
- [ ] Deployed to Vercel

**Time:** 8-12 hours  
**Deliverable:** Live app with authentication at [your-project].vercel.app

---

### Week 2: Database Schema + Onboarding UI

**Goal:** Complete database schema + onboarding UI (no logic yet)

#### Task 2.1: Create Database Schema

**What to tell Claude Code:**
```
Create database schema using Supabase migrations:

1. Initialize Supabase locally:
   supabase init

2. Create migration for users table:
   supabase migration new create_users_table

3. Implement schema from Doc 4:
   - users table (with all fields from Doc 4)
   - credentials table
   - resumes table
   - jobs table
   - applications table
   - interviews table
   - lynx_routes table
   - lynx_stops table
   - valencia_programs table
   - orlando_rent_data table
   - daily_plans table
   - shadow_calendar_events table

4. Add indexes and RLS policies from Doc 4

5. Apply migrations:
   supabase db reset (locally)
   supabase db push (to production)

Reference: Doc 4, Database Schema section (all tables)
```

**Checklist:**
- [ ] Supabase initialized locally
- [ ] Migration files created
- [ ] All tables created (users, credentials, resumes, jobs, etc.)
- [ ] Indexes added
- [ ] RLS policies created
- [ ] Migrations applied locally
- [ ] Migrations pushed to production
- [ ] Can see tables in Supabase dashboard

---

#### Task 2.2: Seed Orlando Data

**What to tell Claude Code:**
```
Seed database with Orlando-specific data:

1. Create seed script: /lib/seed/orlando-data.ts

2. Seed LYNX routes (from Doc 4):
   - Route 36: Pine Hills - Colonial - Downtown
   - Route 50: Michigan - Orange Ave - Downtown
   - Route 18: OBT Corridor
   - Route 8: International Drive - Downtown
   - Route 125: Lynx Central Station - UCF

3. Seed Valencia programs (from Doc 4):
   - Computing Technology & Software Development (BAS)
   - Interactive Design (AS)
   - IT Support Specialist (Certificate)
   - Accounting Applications (Certificate)

4. Seed Orlando rent data (from Doc 4):
   - Studio: $850-1,100
   - 1BR: $1,000-1,300
   - 2BR: $1,300-1,700
   - 3BR: $1,650-2,200

5. Run seed script:
   pnpm seed

Reference: Doc 4, Database Schema → Orlando-Specific Tables
```

**Checklist:**
- [ ] Seed script created
- [ ] LYNX routes seeded (5 routes)
- [ ] Valencia programs seeded (4 programs)
- [ ] Orlando rent data seeded (4 housing types)
- [ ] Seed script runs successfully
- [ ] Data visible in Supabase dashboard

---

#### Task 2.3: Create Onboarding UI (Steps 1-5)

**What to tell Claude Code:**
```
Create onboarding UI for V1 Orlando flow (5 steps):

1. Create onboarding layout:
   - /app/(onboarding)/layout.tsx
   - Progress indicator (Step 1 of 5, Step 2 of 5, etc.)
   - "Back" and "Continue" buttons

2. Step 1: Foundation (Location + Education):
   - /app/(onboarding)/foundation/page.tsx
   - "Where do you live?" (address input with Google Places autocomplete)
   - "What's your education?" (dropdown: Valencia, Other College, High School, etc.)
   - If Valencia: Show program selector (pull from valencia_programs table)
   - If Other: Text input for institution name

3. Step 2: Transportation:
   - /app/(onboarding)/transportation/page.tsx
   - "How do you get around?" (checkboxes: Car, LYNX bus, Rideshare, Walk)
   - "What's the farthest you can commute?" (slider: 15-60 minutes)

4. Step 3: Availability:
   - /app/(onboarding)/availability/page.tsx
   - "When can you work?" (radio: Open to anything, Weekdays only, Weekends only, Specific days)
   - If specific days: Day checkboxes (Mon-Sun)
   - "Preferred shifts" (checkboxes: Morning, Afternoon, Evening, Overnight)

5. Step 4: Salary Target:
   - /app/(onboarding)/salary/page.tsx
   - "What salary do you need?" (two inputs: Min and Max)
   - Calculator below: "Based on Orlando rent, you need $X-Y to afford a 1BR"
   - Link: "See rent breakdown"

6. Step 5: Challenges (Optional):
   - /app/(onboarding)/challenges/page.tsx
   - "Do you face any challenges we can help with? (Optional)"
   - Checkboxes: Single parent, No car, Health challenges, English 2nd language, Need immediate income, Criminal record
   - "Your challenges help us find support resources. We NEVER use this to filter jobs."
   - "Skip" button prominent

7. Completion:
   - /app/(onboarding)/complete/page.tsx
   - "You're all set! Let's find you a job."
   - Button: "Go to Dashboard"

Reference: Doc 2, V1 Orlando Onboarding section
Reference: Doc 3, User Flows → Onboarding (18 minutes)
```

**Checklist:**
- [ ] Onboarding layout with progress indicator
- [ ] Step 1: Foundation (location + education)
- [ ] Step 2: Transportation
- [ ] Step 3: Availability
- [ ] Step 4: Salary Target (with calculator)
- [ ] Step 5: Challenges (optional)
- [ ] Completion screen
- [ ] Can navigate forward/backward
- [ ] UI looks good on mobile

**Test:**
- [ ] Can complete full onboarding flow (no data saving yet)
- [ ] Progress indicator updates correctly
- [ ] "Back" button works
- [ ] "Continue" button enabled/disabled appropriately

---

**Week 2 Complete! 🎉**
- [ ] All Week 2 tasks done
- [ ] Database schema deployed
- [ ] Orlando data seeded
- [ ] Onboarding UI complete

**Time:** 10-15 hours  
**Deliverable:** Full onboarding UI (no logic yet)

---

### Week 3: Onboarding Logic + Validation

**Goal:** Onboarding saves data to database, validates input

#### Task 3.1: Form State Management

**What to tell Claude Code:**
```
Set up form state management for onboarding:

1. Install React Hook Form:
   pnpm add react-hook-form zod @hookform/resolvers

2. Create onboarding context:
   - /components/providers/onboarding-provider.tsx
   - Stores form data across steps
   - Provides methods: updateStep, goBack, goForward, submit

3. Add validation schemas (Zod):
   - /lib/validation/onboarding.ts
   - Step 1: location (required), education (required)
   - Step 2: transportation (at least 1 selected), max_commute (15-60)
   - Step 3: availability (required), specific_days (if selected)
   - Step 4: salary_min (>0), salary_max (>salary_min)
   - Step 5: challenges (optional)

4. Connect forms to context:
   - Each step uses useForm from react-hook-form
   - On submit: updateStep in context, goForward

Reference: Doc 4, Technology Stack → Forms (React Hook Form)
```

**Checklist:**
- [ ] React Hook Form installed
- [ ] Onboarding context created
- [ ] Validation schemas created (Zod)
- [ ] All forms connected to context
- [ ] Validation errors show properly
- [ ] Can't proceed with invalid data

---

#### Task 3.2: Save to Database

**What to tell Claude Code:**
```
Implement onboarding submission to database:

1. Create API route:
   - /app/api/onboarding/complete/route.ts
   - POST endpoint
   - Accepts all onboarding data
   - Validates with Zod schema
   - Saves to users table
   - Saves credentials to credentials table
   - Returns success/error

2. Update completion page:
   - /app/(onboarding)/complete/page.tsx
   - On mount: Submit onboarding data
   - Show loading state
   - On success: Redirect to /dashboard
   - On error: Show error message, allow retry

3. Update users table:
   - Set onboarding_completed_at timestamp
   - Store all onboarding data in appropriate fields

Reference: Doc 4, API Architecture → Onboarding endpoints
Reference: Doc 4, Database Schema → users table
```

**Checklist:**
- [ ] API route created: POST /api/onboarding/complete
- [ ] Validation working server-side
- [ ] Data saves to users table
- [ ] Credentials save to credentials table
- [ ] onboarding_completed_at timestamp set
- [ ] Success response redirects to dashboard
- [ ] Error handling shows helpful messages

**Test:**
- [ ] Complete onboarding flow
- [ ] Data appears in Supabase dashboard (users table)
- [ ] Credential appears in credentials table (if Valencia)
- [ ] Redirects to dashboard after completion

---

#### Task 3.3: Orlando Rent Calculator

**What to tell Claude Code:**
```
Implement Orlando rent calculator (Step 4):

1. Create utility function:
   - /lib/utils/rent-calculator.ts
   - calculateAffordableRent(salaryMin, salaryMax)
   - Uses 30% rule (rent ≤ 30% gross income)
   - Returns: min_rent, max_rent

2. Query orlando_rent_data:
   - Fetch housing types in price range
   - Return: "You can afford a 1BR ($1,000-1,300/month)"

3. Display in Step 4:
   - Show calculator below salary inputs
   - Update dynamically as user types
   - Link: "See rent breakdown" → modal with housing types

Reference: Doc 2, V1 Orlando Onboarding → Step 4: Salary Target
```

**Checklist:**
- [ ] Rent calculator function created
- [ ] Calculator fetches Orlando rent data
- [ ] Calculator shows affordable housing types
- [ ] Updates dynamically as user types
- [ ] Modal shows full rent breakdown
- [ ] Calculation is accurate (30% rule)

**Test:**
- [ ] Enter $30k-$40k salary → shows studio/1BR affordable
- [ ] Enter $50k-$60k salary → shows 2BR affordable
- [ ] Calculator updates in real-time

---

**Week 3 Complete! 🎉**
- [ ] All Week 3 tasks done
- [ ] Onboarding saves data
- [ ] Validation working
- [ ] Rent calculator functional

**Time:** 10-15 hours  
**Deliverable:** Fully functional onboarding that saves to database

---

### Week 4: User Dashboard

**Goal:** Dashboard shows user info, empty states for jobs/applications

#### Task 4.1: Dashboard Layout

**What to tell Claude Code:**
```
Create dashboard layout and navigation:

1. Create dashboard layout:
   - /app/(dashboard)/layout.tsx
   - Sidebar navigation (mobile: bottom nav)
   - User profile button (top-right)
   - Logo (top-left)

2. Navigation items:
   - Home (dashboard icon)
   - Jobs (search icon)
   - Applications (folder icon)
   - Resume (document icon)
   - Settings (gear icon)

3. Create dashboard pages:
   - /app/(dashboard)/dashboard/page.tsx
   - /app/(dashboard)/jobs/page.tsx (empty for now)
   - /app/(dashboard)/applications/page.tsx (empty for now)
   - /app/(dashboard)/resume/page.tsx (empty for now)
   - /app/(dashboard)/settings/page.tsx

4. Responsive design:
   - Desktop: Sidebar on left
   - Mobile: Bottom navigation bar
   - All pages mobile-first

Reference: Doc 3, Screen Layouts → Dashboard
```

**Checklist:**
- [ ] Dashboard layout created
- [ ] Sidebar navigation working (desktop)
- [ ] Bottom nav working (mobile)
- [ ] All pages created (can navigate between them)
- [ ] Active page highlighted in nav
- [ ] Logo links to dashboard
- [ ] User profile button shows name/avatar

---

#### Task 4.2: Dashboard Home (Empty State)

**What to tell Claude Code:**
```
Create dashboard home page:

1. Welcome section:
   - /app/(dashboard)/dashboard/page.tsx
   - "Welcome back, [User Name]!"
   - Tier badge: Essential / Starter / Premium

2. Daily Plan (empty state):
   - Card: "Your Daily Plan"
   - Empty state: "We're generating your first daily plan! Check back in a few minutes."
   - Icon: Calendar

3. Quick Stats (empty state):
   - Applications: 0
   - Interviews: 0
   - Offers: 0

4. Next Steps (first-time user):
   - Card: "Get Started"
   - Steps:
     1. ✅ Complete onboarding
     2. Build your resume
     3. Apply to your first job

Reference: Doc 3, Screen Layouts → Dashboard Home
```

**Checklist:**
- [ ] Welcome section with user name
- [ ] Tier badge displays correctly
- [ ] Daily Plan card (empty state)
- [ ] Quick stats (0/0/0)
- [ ] Next Steps card for new users
- [ ] Looks good on mobile

---

#### Task 4.3: Settings Page

**What to tell Claude Code:**
```
Create settings page:

1. Profile section:
   - /app/(dashboard)/settings/page.tsx
   - Edit name, email
   - Change location
   - Save button

2. Subscription section:
   - Current tier: Essential / Starter / Premium
   - "Upgrade" button (links to /pricing page)
   - Cancel subscription (if paid)

3. Privacy section:
   - Download my data (button)
   - Delete my account (button with confirmation)

4. Notifications:
   - Email notifications (toggle)
   - Push notifications (toggle - future)

Reference: Doc 2, Core Platform Features
Reference: Doc 5 BOOTSTRAPPED, Privacy Compliance → Data Export/Deletion
```

**Checklist:**
- [ ] Profile editing works
- [ ] Can update name, email, location
- [ ] Changes save to database
- [ ] Subscription info displays
- [ ] Download my data button (links to API endpoint)
- [ ] Delete account button (confirmation modal)
- [ ] Notification toggles work

**Test:**
- [ ] Update profile → changes save
- [ ] Download data → JSON file downloads
- [ ] Delete account → confirmation required → account deleted

---

**Week 4 Complete! 🎉**
- [ ] All Week 4 tasks done
- [ ] Dashboard layout working
- [ ] Dashboard home with empty states
- [ ] Settings page functional

**Time:** 8-12 hours  
**Deliverable:** Complete dashboard with navigation and settings

---

## Phase 2: Core Features (Weeks 5-8)

---

### Week 5: Job Search (Indeed API Integration)

**Goal:** Search jobs from Indeed API, display in Jobs page

#### Task 5.1: Indeed API Integration

**What to tell Claude Code:**
```
Integrate Indeed API for job search:

1. Set up Indeed API:
   - Get publisher ID from Indeed
   - Add to .env.local: INDEED_PUBLISHER_ID=...

2. Create Indeed API client:
   - /lib/external/indeed.ts
   - Function: searchJobs(params)
   - Params: location, keywords, salary_min, posted_days
   - Returns: Job[] with title, company, description, salary, location, apply_url

3. Create API route:
   - /app/api/jobs/search/route.ts
   - GET endpoint
   - Query params: location, keywords, salary_min, posted_days
   - Calls Indeed API
   - Returns formatted results

4. Save jobs to database:
   - After fetching from Indeed
   - Insert into jobs table (if not exists)
   - Use external_id to prevent duplicates

Reference: Doc 4, External Service Integration → Indeed API
Reference: Doc 4, Database Schema → jobs table
```

**Checklist:**
- [ ] Indeed Publisher ID obtained
- [ ] Indeed API client created
- [ ] API route: GET /api/jobs/search
- [ ] Can search jobs by location
- [ ] Can filter by salary_min
- [ ] Jobs save to database
- [ ] No duplicate jobs (external_id unique constraint)

**Test:**
- [ ] Search "Orlando, FL" → returns Orlando jobs
- [ ] Search "cashier Orlando" → returns cashier jobs
- [ ] Jobs appear in Supabase (jobs table)

---

#### Task 5.2: Jobs List Page

**What to tell Claude Code:**
```
Create jobs list page:

1. Jobs page:
   - /app/(dashboard)/jobs/page.tsx
   - Search bar: Location + Keywords
   - Filters: Salary min, Posted (24h, 7d, 30d)
   - Job cards in grid/list view

2. Job card component:
   - /components/jobs/job-card.tsx
   - Title, Company, Location, Salary
   - "View Details" button
   - "Save" button (bookmark icon)

3. Fetch jobs on mount:
   - useEffect → fetch from /api/jobs/search
   - Show loading state
   - Show empty state if no results
   - Show jobs in grid

4. Search/filter functionality:
   - Update URL params on search
   - Refetch when filters change
   - Debounce search input (500ms)

Reference: Doc 3, Screen Layouts → Jobs Hub
```

**Checklist:**
- [ ] Jobs page displays search bar
- [ ] Can search by keywords + location
- [ ] Can filter by salary
- [ ] Can filter by posted date
- [ ] Job cards display correctly
- [ ] "View Details" links to job detail page
- [ ] Loading state while fetching
- [ ] Empty state if no jobs found

**Test:**
- [ ] Search "cashier Orlando" → shows results
- [ ] Filter salary $15+/hour → filters correctly
- [ ] Filter posted "Last 7 days" → recent jobs only

---

#### Task 5.3: Job Detail Page

**What to tell Claude Code:**
```
Create job detail page:

1. Job detail page:
   - /app/(dashboard)/jobs/[id]/page.tsx
   - Fetch job by ID from database
   - Display full job details

2. Layout:
   - Top: Title, Company, Location, Salary
   - Left column: Description, Requirements, Benefits
   - Right column: Quick Info (employment type, posted date)
   - Bottom: "Apply" button

3. Apply button:
   - Opens external URL (job.apply_url)
   - Tracks click (application created with status: "discovered")

Reference: Doc 2, Core Platform Features → Apply Copilot
Reference: Doc 3, Screen Layouts → Job Detail
```

**Checklist:**
- [ ] Job detail page created
- [ ] Fetches job by ID
- [ ] Displays all job info (title, company, description, etc.)
- [ ] "Apply" button opens external URL
- [ ] Click tracked in applications table
- [ ] 404 page if job not found

**Test:**
- [ ] Click job from list → detail page loads
- [ ] All job info displays correctly
- [ ] "Apply" button opens Indeed job page
- [ ] Application tracked in database

---

**Week 5 Complete! 🎉**
- [ ] All Week 5 tasks done
- [ ] Indeed API integrated
- [ ] Jobs list page working
- [ ] Job detail page working

**Time:** 12-15 hours  
**Deliverable:** Functional job search with Indeed integration

---

### Week 6: LYNX Integration + Scam Shield

**Goal:** Calculate LYNX commute times, implement Scam Shield to block scam jobs

#### Task 6.1: Google Maps API (LYNX Transit)

**What to tell Claude Code:**
```
Integrate Google Maps API for LYNX transit directions:

1. Set up Google Maps API:
   - Enable Directions API + Geocoding API
   - Add to .env.local: GOOGLE_MAPS_API_KEY=...

2. Create Maps API client:
   - /lib/external/google-maps.ts
   - Function: calculateTransitTime(origin, destination, arrivalTime)
   - Mode: transit, transit_mode: bus
   - Returns: duration_minutes, lynx_routes[]

3. Add transit time to job cards:
   - When fetching jobs, calculate transit time from user location
   - Store in job card: "35 min via LYNX Route 36"
   - Sort jobs by commute time (shortest first)

4. Filter by max commute:
   - User's max_commute_minutes from onboarding
   - Only show jobs within max commute

Reference: Doc 4, External Service Integration → Google Maps API
Reference: Doc 2, Orlando-Specific Features → LYNX Integration
```

**Checklist:**
- [ ] Google Maps API key obtained
- [ ] Maps API client created
- [ ] calculateTransitTime function working
- [ ] Transit time calculated for each job
- [ ] LYNX route numbers displayed
- [ ] Jobs filtered by max_commute_minutes
- [ ] Jobs sorted by commute time

**Test:**
- [ ] User at Pine Hills → job downtown shows "25 min via Route 36"
- [ ] User with 30-min max commute → jobs >30 min don't show
- [ ] No car + LYNX selected → only LYNX-accessible jobs show

---

#### Task 6.2: Scam Shield Implementation

**What to tell Claude Code:**
```
Implement Scam Shield to detect and block scam jobs:

1. Create Scam Shield detector:
   - /lib/utils/scam-shield.ts
   - Function: detectScams(job: Job)
   - Rules (from Doc 2):
     * CRITICAL: Upfront payment, check cashing, personal info phishing
     * HIGH: Vague description (<50 words), no company info, unrealistic pay
     * MEDIUM: Remote emphasis (3+ mentions), urgent hiring
     * LOW: Clean
   - Returns: { severity, flags[], action }

2. Run Scam Shield on job fetch:
   - When fetching from Indeed
   - Run detectScams() on each job
   - Save scam_severity and scam_flags to jobs table

3. Block/warn in UI:
   - CRITICAL: Don't display job (auto-blocked)
   - HIGH: Show warning badge, require checkbox to view
   - MEDIUM: Show warning badge only
   - LOW: No warning

4. Create blocked jobs page:
   - /app/(dashboard)/jobs/blocked/page.tsx
   - Show all CRITICAL blocked jobs
   - Display reason + link to report to FTC

Reference: Doc 2, Core Platform Features → Scam Shield
Reference: Doc 4, Database Schema → jobs table (scam_severity, scam_flags)
```

**Checklist:**
- [ ] Scam Shield detector created
- [ ] All rules implemented (CRITICAL, HIGH, MEDIUM)
- [ ] Runs on every job fetched
- [ ] scam_severity and scam_flags saved to database
- [ ] CRITICAL jobs auto-blocked (don't display)
- [ ] HIGH jobs show warning + checkbox
- [ ] MEDIUM jobs show warning badge
- [ ] Blocked jobs page lists CRITICAL jobs

**Test:**
- [ ] Job with "pay $200 for background check" → CRITICAL, blocked
- [ ] Job with <50 word description → HIGH, warning shown
- [ ] Job mentioning "remote" 4 times → MEDIUM, badge shown
- [ ] Normal job → LOW, no warning

---

#### Task 6.3: Valencia Match Score

**What to tell Claude Code:**
```
Implement Valencia match score for jobs:

1. Create Valencia matcher:
   - /lib/utils/valencia-matcher.ts
   - Function: calculateValenciaMatch(job: Job, userCredentials: Credential[])
   - If user has Valencia credential:
     * Check job keywords against valencia_programs keywords
     * Score 0-100 based on keyword matches
     * Return: match_score, matching_keywords[]
   - If no Valencia credential: null

2. Save to database:
   - valencia_friendly: true/false (>50 score)
   - valencia_match_score: 0-100

3. Display in UI:
   - Job cards with Valencia match show badge: "Valencia Match: 85%"
   - Sort: Valencia matches first (if user has Valencia credential)

Reference: Doc 2, Orlando-Specific Features → Valencia College Credential Matching
Reference: Doc 4, Database Schema → valencia_programs table
```

**Checklist:**
- [ ] Valencia matcher created
- [ ] Checks user credentials
- [ ] Calculates match score (0-100)
- [ ] valencia_match_score saved to jobs table
- [ ] Valencia badge shows on job cards
- [ ] Valencia matches sorted first (for Valencia grads)

**Test:**
- [ ] Valencia IT grad → "IT Support" job shows high match (80+)
- [ ] Valencia IT grad → "Cashier" job shows low/no match
- [ ] Non-Valencia user → no Valencia badges shown

---

**Week 6 Complete! 🎉**
- [ ] All Week 6 tasks done
- [ ] LYNX integration working
- [ ] Scam Shield protecting users
- [ ] Valencia matching implemented

**Time:** 12-15 hours  
**Deliverable:** LYNX-filtered jobs with scam protection

---

### Week 7: Job Pockets (Tier 1)

**Goal:** Generate Tier 1 Job Pockets (20-second intel) using Gemini AI

#### Task 7.1: Gemini AI Integration

**What to tell Claude Code:**
```
Integrate Google Gemini AI for Job Pockets:

1. Set up Gemini API:
   - API key already in .env.local
   - Install: pnpm add @google/generative-ai

2. Create Gemini client:
   - /lib/external/gemini.ts
   - Initialize with API key
   - Models: gemini-3-flash (Tier 1/2), gemini-3-pro (Tier 3)

3. Create Job Pocket generator:
   - /lib/ai/job-pocket-generator.ts
   - Function: generateJobPocket(job, user, tier)
   - Tier 1 sections (from Doc 2):
     * Qualification Check (Do I qualify?)
     * Quick Brief (What's the job?)
     * Talking Points (3 strengths to mention)
     * Interview Questions (3 common questions)
     * Red Flags (Concerns to watch for)
     * Recommendation (Apply now? Wait? Skip?)

4. Prompt engineering:
   - Include user context (location, education, challenges)
   - Include job details (title, company, description)
   - Ask for JSON output
   - Keep concise (Tier 1 = <300 words total)

Reference: Doc 4, AI Integration Architecture → Gemini Integration
Reference: Doc 2, Tier-Specific Features → Essential Tier
```

**Checklist:**
- [ ] Gemini API client created
- [ ] Job Pocket generator function created
- [ ] Tier 1 prompt includes all 6 sections
- [ ] Prompt includes user context
- [ ] Returns JSON format
- [ ] Generation time <20 seconds
- [ ] Error handling for API failures

**Test:**
- [ ] Generate Tier 1 pocket for test job → returns 6 sections
- [ ] Generation completes in <20 seconds
- [ ] JSON parsing works correctly

---

#### Task 7.2: Job Pockets API + Storage

**What to tell Claude Code:**
```
Create Job Pocket API and database storage:

1. Create API route:
   - /app/api/job-pockets/generate/route.ts
   - POST endpoint
   - Body: { job_id, tier }
   - Validates user tier (Essential can only access Tier 1)
   - Calls generateJobPocket()
   - Saves to job_pockets table
   - Returns: job_pocket with content

2. Check for existing pocket:
   - Before generating, check if pocket exists
   - If exists and <7 days old: return cached version
   - If >7 days old: regenerate

3. Usage limits:
   - Essential: Unlimited Tier 1 pockets
   - Starter: 1 Tier 2 pocket per month
   - Premium: 5 Tier 3 pockets per month

Reference: Doc 4, API Architecture → Job Pockets endpoints
Reference: Doc 4, Database Schema → job_pockets table
```

**Checklist:**
- [ ] API route created: POST /api/job-pockets/generate
- [ ] Validates user tier
- [ ] Generates pocket with Gemini
- [ ] Saves to job_pockets table
- [ ] Returns cached pocket if <7 days old
- [ ] Usage limits enforced
- [ ] Error handling for generation failures

**Test:**
- [ ] POST request generates Tier 1 pocket
- [ ] Second request returns cached version (fast)
- [ ] Essential user can't access Tier 2/3
- [ ] Starter user blocked after 1 Tier 2 pocket this month

---

#### Task 7.3: Job Pocket UI

**What to tell Claude Code:**
```
Create Job Pocket display UI:

1. Add "Job Pocket" button to job detail page:
   - /app/(dashboard)/jobs/[id]/page.tsx
   - Button: "Generate 20-Second Job Pocket" (Tier 1)
   - Disabled if user already has pocket for this job
   - If pocket exists: "View Job Pocket"

2. Create Job Pocket modal/page:
   - /components/jobs/job-pocket-modal.tsx
   - Shows 6 sections in tabs or accordion
   - Clean, readable design
   - "Apply Now" button at bottom

3. Loading state:
   - "Generating your job pocket... (15-20 seconds)"
   - Progress indicator or animated icon

4. Error state:
   - "Failed to generate job pocket. Try again?"
   - Retry button

Reference: Doc 3, Core User Flows → Daily Workflow (30 minutes)
Reference: Doc 2, Tier-Specific Features → Essential Tier Job Pockets
```

**Checklist:**
- [ ] "Generate Job Pocket" button on job detail page
- [ ] Button triggers API call
- [ ] Loading state shows during generation
- [ ] Job Pocket displays in modal/page
- [ ] All 6 sections display correctly
- [ ] "Apply Now" button at bottom
- [ ] Error state with retry option
- [ ] Cached pockets load instantly (<1 second)

**Test:**
- [ ] Click "Generate Job Pocket" → loading 15-20 seconds → displays
- [ ] Click "View Job Pocket" on same job → loads instantly (cached)
- [ ] All 6 sections readable and helpful
- [ ] "Apply Now" button works

---

**Week 7 Complete! 🎉**
- [ ] All Week 7 tasks done
- [ ] Gemini AI integrated
- [ ] Tier 1 Job Pockets generating
- [ ] Job Pocket UI working

**Time:** 12-15 hours  
**Deliverable:** Working Job Pockets (Tier 1) with AI generation

---

### Week 8: Application Tracking

**Goal:** Track applications, show in Applications page, lifecycle management

#### Task 8.1: Application Tracking Backend

**What to tell Claude Code:**
```
Implement application tracking system:

1. Create application API:
   - /app/api/applications/route.ts
   - POST: Create application
   - GET: List user's applications
   - PATCH: Update application status

2. Application lifecycle:
   - States: discovered, pocketed, applied, interviewing, offer_received, offer_accepted, rejected, withdrawn
   - Timestamps: discovered_at, pocketed_at, applied_at, offer_received_at, rejected_at

3. Auto-track from job interactions:
   - View job detail → discovered_at
   - Generate Job Pocket → pocketed_at
   - Click "Apply" button → applied_at (if external)

4. Manual tracking (Apply Copilot):
   - User can manually mark "applied" for external applications
   - Form: Where did you apply? (Indeed, company website, in-person)
   - Capture: application_method, notes

Reference: Doc 4, API Architecture → Applications endpoints
Reference: Doc 4, Database Schema → applications table
Reference: Doc 2, Core Platform Features → Apply Copilot
```

**Checklist:**
- [ ] Applications API created (POST, GET, PATCH)
- [ ] Application lifecycle states implemented
- [ ] Auto-tracking on job interactions
- [ ] Manual tracking form ("I applied externally")
- [ ] applications table populated correctly
- [ ] Timestamps saved accurately

**Test:**
- [ ] View job → application created (discovered)
- [ ] Generate pocket → application updated (pocketed)
- [ ] Click apply → application updated (applied)
- [ ] Manual track → creates application

---

#### Task 8.2: Applications List Page

**What to tell Claude Code:**
```
Create applications tracking page:

1. Applications page:
   - /app/(dashboard)/applications/page.tsx
   - Tabs: All, Applied, Interviewing, Offers, Rejected
   - List view (cards or table)

2. Application card:
   - /components/applications/application-card.tsx
   - Job title + company
   - Status badge (color-coded)
   - Date applied
   - Actions: Update Status, Add Note, View Job

3. Filters and sorting:
   - Filter by status
   - Sort by: Date applied (newest first), Company name (A-Z)

4. Empty states:
   - "No applications yet. Start by searching for jobs!"
   - "No offers yet. Keep applying!"

Reference: Doc 3, Screen Layouts → Applications Tracker
```

**Checklist:**
- [ ] Applications page displays tabs
- [ ] Application cards show job info + status
- [ ] Can filter by status (Applied, Interviewing, etc.)
- [ ] Can sort by date or company name
- [ ] Empty states for new users
- [ ] "Update Status" button opens modal

**Test:**
- [ ] Apply to 3 jobs → all show in "Applied" tab
- [ ] Update status to "Interviewing" → moves to "Interviewing" tab
- [ ] Filter by status works correctly
- [ ] Sort by date works (newest first)

---

#### Task 8.3: Application Detail + Notes

**What to tell Claude Code:**
```
Create application detail page:

1. Application detail page:
   - /app/(dashboard)/applications/[id]/page.tsx
   - Top: Job title, company, status
   - Timeline: discovered → pocketed → applied → interviewing → offer/rejected
   - Notes section: User can add private notes

2. Status update:
   - Dropdown: Change status
   - Date picker: When did this happen?
   - Save button

3. Notes:
   - Text area: "Interview went well, met with Sarah"
   - Save notes button
   - Notes display chronologically

Reference: Doc 2, Core Platform Features → Tracker
```

**Checklist:**
- [ ] Application detail page created
- [ ] Timeline shows application lifecycle
- [ ] Can update status from detail page
- [ ] Can add notes (private)
- [ ] Notes save to database (user_notes field)
- [ ] Notes display with timestamps

**Test:**
- [ ] Click application from list → detail page loads
- [ ] Update status → saves and updates timeline
- [ ] Add note → saves and displays
- [ ] All info accurate and persistent

---

**Week 8 Complete! 🎉**
- [ ] All Week 8 tasks done
- [ ] Application tracking working
- [ ] Applications list page functional
- [ ] Application detail + notes working

**Time:** 10-12 hours  
**Deliverable:** Complete application tracking system

---

## Phase 3: AI Features (Weeks 9-10)

---

### Week 9: Resume Studio + Skills Translation

**Goal:** Resume builder with ATS optimization and skills translation

#### Task 9.1: Resume Builder UI

**What to tell Claude Code:**
```
Create resume builder interface:

1. Resume page:
   - /app/(dashboard)/resume/page.tsx
   - If no resume: "Create Your Resume" CTA
   - If resume exists: Display + "Edit" button

2. Resume builder form:
   - /app/(dashboard)/resume/create/page.tsx
   - Sections:
     * Contact Info (name, email, phone, location)
     * Summary (optional, 2-3 sentences)
     * Experience (title, company, start/end dates, bullets)
     * Education (degree, institution, graduation date)
     * Skills (tag input)

3. Form components:
   - Add/remove experience entries (dynamic)
   - Add/remove education entries (dynamic)
   - Skills tag input (type + press Enter)

4. Save to database:
   - POST /api/resume
   - Saves to resumes table
   - Sets is_active = true (only 1 active resume per user)

Reference: Doc 2, Core Platform Features → Resume Studio
Reference: Doc 4, Database Schema → resumes table
```

**Checklist:**
- [ ] Resume builder page created
- [ ] Contact info form working
- [ ] Experience section (add/remove entries)
- [ ] Education section (add/remove entries)
- [ ] Skills tag input
- [ ] Save to database (resumes table)
- [ ] Only 1 active resume per user

**Test:**
- [ ] Create resume with 2 experience entries → saves correctly
- [ ] Add education → saves correctly
- [ ] Add skills → saves as array
- [ ] Edit resume → loads existing data

---

#### Task 9.2: ATS Optimization

**What to tell Claude Code:**
```
Implement ATS (Applicant Tracking System) optimization:

1. Create ATS analyzer:
   - /lib/ai/ats-optimizer.ts
   - Function: analyzeATS(resume: Resume)
   - Uses Gemini AI to:
     * Extract keywords from experience/education
     * Compare against common ATS keywords for user's target roles
     * Assign score: 0-100
     * Return: score, missing_keywords[], suggestions[]

2. Display ATS score:
   - Resume page shows: "ATS Score: 68/100"
   - Color-coded: Red (<50), Yellow (50-75), Green (75+)
   - Link: "Improve Score" → opens optimization modal

3. Optimization suggestions:
   - Modal shows:
     * Current score
     * Missing keywords (e.g., "project management", "SQL")
     * Suggestions: "Add 'project management' to your experience bullets"
     * "Apply Suggestions" button

4. Apply suggestions:
   - User clicks "Apply Suggestions"
   - AI rewrites resume bullets to include keywords
   - Re-analyzes ATS score
   - Shows improvement: 68 → 84

Reference: Doc 2, Core Platform Features → Resume Studio
Reference: Doc 2, Tier-Specific Features → Starter Tier (Skills Translation)
```

**Checklist:**
- [ ] ATS analyzer created (uses Gemini)
- [ ] ATS score calculated (0-100)
- [ ] Score displays on resume page
- [ ] "Improve Score" opens optimization modal
- [ ] Suggestions list missing keywords
- [ ] "Apply Suggestions" rewrites resume
- [ ] Score recalculates after optimization

**Test:**
- [ ] Create basic resume → score ~40-50
- [ ] Click "Improve Score" → suggestions appear
- [ ] Apply suggestions → score improves to 70-85
- [ ] Resume bullets now include relevant keywords

---

#### Task 9.3: Skills Translation Engine

**What to tell Claude Code:**
```
Implement skills translation (Starter tier):

1. Create skills translator:
   - /lib/ai/skills-translator.ts
   - Function: translateSkills(resume: Resume, targetRole: string)
   - Uses Gemini AI to:
     * Identify retail/service industry language
     * Translate to office/tech language
     * Example: "Handled cash register" → "Processed financial transactions and maintained accurate records"
     * Return: translated_bullets[], keywords_added[]

2. Translation UI:
   - Resume page: "Translate Skills" button (Starter/Premium only)
   - Modal: "Translate your resume for:"
     * Radio buttons: Office Jobs, Tech Jobs, Healthcare Jobs
     * "Translate" button

3. Before/After comparison:
   - Shows original bullet vs translated bullet
   - Example:
     * Before: "Trained new employees on store procedures"
     * After: "Developed and delivered comprehensive onboarding programs for new team members"
   - Checkboxes: User can accept/reject each translation
   - "Apply Translations" button

4. Save translated version:
   - Creates new resume version
   - Sets translated = true
   - ATS score improves by 30-40 points

Reference: Doc 2, Tier-Specific Features → Starter Tier (Skills Translation)
Reference: Doc 3, Journey Maps → Jasmine (ATS 45 → 82)
```

**Checklist:**
- [ ] Skills translator created (uses Gemini)
- [ ] "Translate Skills" button (Starter/Premium only)
- [ ] Target role selector (Office, Tech, Healthcare)
- [ ] Before/After comparison UI
- [ ] User can accept/reject translations
- [ ] Translated resume saved as new version
- [ ] ATS score improves significantly (30-40 points)

**Test:**
- [ ] Essential user → "Translate Skills" button disabled/hidden
- [ ] Starter user → "Translate Skills" works
- [ ] Translate retail resume → office language
- [ ] ATS score: 45 → 82 (Jasmine's journey)
- [ ] Resume sounds professional, not robotic

---

**Week 9 Complete! 🎉**
- [ ] All Week 9 tasks done
- [ ] Resume builder working
- [ ] ATS optimization functional
- [ ] Skills translation engine implemented

**Time:** 12-15 hours  
**Deliverable:** Resume Studio with ATS optimization and skills translation

---

### Week 10: Career Coach + Daily Plan

**Goal:** AI Career Coach for rejection support + auto-generated Daily Plan

#### Task 10.1: Career Coach (OSKAR Framework)

**What to tell Claude Code:**
```
Implement AI Career Coach using OSKAR framework:

1. Create Career Coach page:
   - /app/(dashboard)/coach/page.tsx
   - Chat interface (like ChatGPT)
   - User types message → AI responds

2. Career Coach AI:
   - /lib/ai/career-coach.ts
   - Function: generateCoachResponse(message: string, userContext: User)
   - Uses Gemini AI with OSKAR framework:
     * Outcome: What do you want to achieve?
     * Scaling: Rate current situation 1-10
     * Know-how: What's worked before?
     * Affirm + Action: Celebrate progress, next steps
     * Review: Check-in on goals
   - Include user context (tier, challenges, application history)

3. Rejection support (auto-triggered):
   - When user marks application "rejected"
   - If 3+ rejections in last 7 days:
     * Auto-send supportive message
     * "This is normal. Most job searches include 50-100 rejections."
     * "You're at X rejections with Y% callback rate - that's strong. Keep going."
   - Link: "Talk to Career Coach"

4. Interview prep:
   - User asks: "Help me prepare for interview at [Company]"
   - AI generates:
     * Company overview
     * Common interview questions (5-7)
     * How to answer based on user's experience
     * Follow-up questions to ask interviewer

Reference: Doc 2, Core Platform Features → Career Coach
Reference: Doc 3, Emotional Design → Rejection Support
```

**Checklist:**
- [ ] Career Coach page with chat UI
- [ ] Gemini AI integration for coach
- [ ] OSKAR framework implemented in prompts
- [ ] Rejection support auto-triggers after 3+ rejections
- [ ] Supportive message shows realistic stats
- [ ] Interview prep generates company overview + questions
- [ ] AI responses sound empathetic, not robotic

**Test:**
- [ ] Send message → AI responds in <5 seconds
- [ ] Mark 3 applications "rejected" → supportive message appears
- [ ] Ask for interview prep → generates helpful questions
- [ ] AI remembers context (user's challenges, history)

---

#### Task 10.2: Daily Plan Generator

**What to tell Claude Code:**
```
Implement auto-generated Daily Plan (Essential tier):

1. Create Daily Plan generator:
   - /lib/ai/daily-plan-generator.ts
   - Function: generateDailyPlan(user: User)
   - Runs nightly (cron job)
   - Generates 8 jobs for tomorrow:
     * Salary matches user's target
     * LYNX-accessible (within max_commute)
     * Scam Shield verified (LOW severity only)
     * Valencia-friendly (if user has Valencia credential)
   - Saves to daily_plans table

2. Daily Plan API:
   - /app/api/daily-plan/[date]/route.ts
   - GET endpoint
   - Returns: daily_plan with job_ids[]
   - Fetches jobs from database

3. Display on Dashboard:
   - /app/(dashboard)/dashboard/page.tsx
   - "Your Daily Plan for [Date]"
   - Shows 8 job cards
   - "Apply to All" button (bulk apply - future)
   - "Generate New Plan" button (if user wants different jobs)

4. Cron job:
   - Runs every night at midnight
   - Generates Daily Plan for all Essential users
   - Uses Vercel Cron or Supabase Edge Function cron

Reference: Doc 2, Core Platform Features → Daily Plan
Reference: Doc 2, Tier-Specific Features → Essential Tier (Daily Plan)
```

**Checklist:**
- [ ] Daily Plan generator created
- [ ] Generates 8 jobs matching user criteria
- [ ] Saves to daily_plans table
- [ ] API endpoint: GET /api/daily-plan/[date]
- [ ] Dashboard displays Daily Plan
- [ ] "Generate New Plan" button refreshes jobs
- [ ] Cron job runs nightly (generates plans for all users)

**Test:**
- [ ] Dashboard shows "Your Daily Plan for Today"
- [ ] Daily Plan has 8 jobs (all meet criteria)
- [ ] All jobs are LYNX-accessible
- [ ] No scam jobs in Daily Plan
- [ ] Click "Generate New Plan" → refreshes with 8 different jobs

---

**Week 10 Complete! 🎉**
- [ ] All Week 10 tasks done
- [ ] Career Coach working (rejection support + interview prep)
- [ ] Daily Plan auto-generating nightly

**Time:** 10-12 hours  
**Deliverable:** AI Career Coach + Daily Plan generator

---

## Phase 4: Polish & Launch (Weeks 11-12)

---

### Week 11: Legal Compliance + Accessibility

**Goal:** Add Privacy Policy, Terms of Service, cookie consent, accessibility fixes

#### Task 11.1: Legal Pages

**What to tell Claude Code:**
```
Add Privacy Policy and Terms of Service:

1. Generate policies (FREE):
   - Go to Termly.io → Privacy Policy Generator
   - Go to TermsFeed.com → Terms & Conditions Generator
   - Copy generated text

2. Create legal pages:
   - /app/(legal)/privacy/page.tsx
   - /app/(legal)/terms/page.tsx
   - Paste generated policy text
   - Add "Last Updated" date

3. Add links to footer:
   - Update site footer
   - Add: Privacy Policy | Terms of Service
   - Links open in same tab (legal pages, not modal)

4. Signup checkbox:
   - /app/(auth)/signup/page.tsx
   - Add checkbox: "I agree to the Terms of Service and Privacy Policy"
   - Required before signup
   - Links open Terms + Privacy in new tab

Reference: Doc 5 BOOTSTRAPPED, Privacy Policy (Free Template)
Reference: Doc 5 BOOTSTRAPPED, Terms of Service (Free Template)
```

**Checklist:**
- [ ] Privacy Policy generated (Termly.io)
- [ ] Terms of Service generated (TermsFeed.com)
- [ ] Privacy page created
- [ ] Terms page created
- [ ] Footer links added
- [ ] Signup checkbox required
- [ ] Links open in new tab from signup

**Test:**
- [ ] Click footer "Privacy Policy" → page loads
- [ ] Click footer "Terms of Service" → page loads
- [ ] Signup requires checkbox checked
- [ ] Can't signup without agreeing to terms

---

#### Task 11.2: Cookie Consent + Data Export/Deletion

**What to tell Claude Code:**
```
Add cookie consent and GDPR compliance:

1. Cookie consent banner:
   - /components/cookie-consent.tsx
   - Shows on first visit
   - Buttons: "Accept" / "Decline"
   - Saves preference to localStorage
   - If declined: Don't load analytics

2. Data export endpoint:
   - /app/api/user/export/route.ts
   - GET endpoint
   - Returns JSON file with all user data
   - Format from Doc 4

3. Data deletion endpoint:
   - /app/api/user/delete/route.ts
   - POST endpoint
   - Soft delete (sets deleted_at)
   - Revokes all sessions
   - Sends confirmation email

4. Add to Settings page:
   - /app/(dashboard)/settings/page.tsx
   - Privacy section:
     * "Download My Data" button
     * "Delete My Account" button (with confirmation modal)

Reference: Doc 5 BOOTSTRAPPED, Cookie Consent (DIY Code)
Reference: Doc 5 BOOTSTRAPPED, Data Export & Deletion
Reference: Doc 4, API Architecture (Data export endpoint example)
```

**Checklist:**
- [ ] Cookie consent banner created
- [ ] Banner shows on first visit
- [ ] "Accept" / "Decline" buttons work
- [ ] Preference saved to localStorage
- [ ] Data export endpoint created
- [ ] Data deletion endpoint created
- [ ] Settings page has "Download" and "Delete" buttons
- [ ] Delete account requires confirmation modal

**Test:**
- [ ] First visit → cookie banner appears
- [ ] Click "Accept" → banner disappears, analytics enabled
- [ ] Click "Decline" → banner disappears, no analytics
- [ ] Settings → "Download My Data" → JSON file downloads
- [ ] Settings → "Delete My Account" → confirmation required → account deleted

---

#### Task 11.3: Accessibility Fixes

**What to tell Claude Code:**
```
Fix accessibility issues (WCAG 2.2 Level AA):

1. Run automated tests:
   - Install axe DevTools Chrome extension
   - Run on every page
   - Fix Critical and Serious issues

2. Common fixes:
   - Add alt text to all images
   - Add aria-labels to icon buttons
   - Ensure color contrast 4.5:1 minimum
   - Add focus indicators (focus:ring-2)
   - Fix heading hierarchy (h1 → h2 → h3)
   - Add skip link: "Skip to main content"

3. Keyboard testing:
   - Test with keyboard only (Tab, Enter, Escape)
   - Ensure all interactive elements focusable
   - No keyboard traps
   - Logical tab order

4. Screen reader testing:
   - Test with Mac VoiceOver (Cmd+F5)
   - Ensure form labels associated with inputs
   - Ensure buttons have descriptive text
   - Ensure error messages announced

5. Create Accessibility Statement:
   - /app/(legal)/accessibility/page.tsx
   - Template from Doc 5 BOOTSTRAPPED

Reference: Doc 5 BOOTSTRAPPED, Accessibility (Free Tools)
Reference: Doc 4, Security Architecture → CSP
```

**Checklist:**
- [ ] axe DevTools extension installed
- [ ] Ran on all pages, fixed Critical issues
- [ ] All images have alt text
- [ ] Icon buttons have aria-labels
- [ ] Color contrast 4.5:1 minimum
- [ ] Focus indicators visible
- [ ] Skip link added
- [ ] Keyboard navigation tested (Tab, Enter, Escape)
- [ ] Screen reader tested (VoiceOver)
- [ ] Accessibility Statement page created

**Test:**
- [ ] axe DevTools shows 0 Critical issues
- [ ] Unplug mouse → can navigate entire site with keyboard
- [ ] Enable VoiceOver → can complete onboarding
- [ ] Forms announce errors properly

---

**Week 11 Complete! 🎉**
- [ ] All Week 11 tasks done
- [ ] Privacy Policy + Terms of Service live
- [ ] Cookie consent working
- [ ] Data export/deletion functional
- [ ] Accessibility fixes complete

**Time:** 8-12 hours  
**Deliverable:** Legally compliant, accessible platform

---

### Week 12: Beta Testing + Launch

**Goal:** Beta test with 10 Valencia users, fix bugs, launch publicly

#### Task 12.1: Beta Testing Setup

**What to tell Claude Code:**
```
Set up beta testing:

1. Create beta signup form:
   - /app/beta/page.tsx
   - Form: Name, Email, Valencia credential?
   - "Join Beta" button
   - Saves to beta_users table (or Notion, Google Sheets)

2. Send invites:
   - Email 10 Valencia students/alumni
   - Subject: "Help test Jalanea Works - Get 3 months free Premium"
   - Include: Beta signup link, what to test, feedback form

3. Feedback collection:
   - Create Google Form or Typeform
   - Questions:
     * What went well?
     * What was confusing?
     * What bugs did you encounter?
     * Would you pay for this? (Yes / No / Maybe)
     * What's missing?

Reference: Doc 1, Success Metrics → Beta testing approach
```

**Checklist:**
- [ ] Beta signup page created
- [ ] 10 Valencia students/alumni identified
- [ ] Invitation emails sent
- [ ] Feedback form created (Google Form / Typeform)
- [ ] Beta users can signup and test

---

#### Task 12.2: Bug Fixes + Iteration

**What to tell Claude Code:**
```
Fix bugs and iterate based on beta feedback:

1. Collect feedback:
   - Review Google Form responses
   - Watch beta users navigate (if possible)
   - Note: Most confusing parts, most common bugs

2. Prioritize fixes:
   - P0 (Critical): Blockers (can't signup, can't apply to jobs)
   - P1 (High): Major bugs (Job Pockets fail, LYNX times wrong)
   - P2 (Medium): UX issues (confusing labels, unclear flows)
   - P3 (Low): Nice-to-haves (better empty states, animations)

3. Fix P0 and P1 bugs:
   - Work through list
   - Test fixes with beta users
   - Iterate until smooth

4. Improve based on feedback:
   - If 3+ users say "X is confusing" → fix X
   - If 2+ users say "I wish it had Y" → consider adding Y (post-launch)

Reference: Doc 1, Build Methodology → Iterate based on feedback
```

**Checklist:**
- [ ] All P0 (Critical) bugs fixed
- [ ] All P1 (High) bugs fixed
- [ ] P2 (Medium) bugs documented for post-launch
- [ ] Beta users can complete full job search flow (onboarding → search → apply)
- [ ] At least 5/10 beta users say "would pay for this"

---

#### Task 12.3: Launch Prep

**What to tell Claude Code:**
```
Prepare for public launch:

1. Final testing:
   - Test full user journey (signup → onboarding → job search → apply)
   - Test on mobile (iOS Safari, Android Chrome)
   - Test on desktop (Chrome, Firefox, Safari)
   - Verify all APIs working (Indeed, Google Maps, Gemini)

2. Set up monitoring:
   - Vercel Analytics (free, built-in)
   - Sentry for error tracking (free tier)
   - Create alerts: Email if error rate >5%

3. Pricing setup:
   - Create Stripe subscription products:
     * Essential: $15/month
     * Starter: $25/month
     * Premium: $75/month
   - Set up webhooks: /api/webhooks/stripe
   - Test payment flow (Stripe test mode)

4. Launch checklist:
   - [ ] Privacy Policy live
   - [ ] Terms of Service live
   - [ ] Cookie consent working
   - [ ] Data export working
   - [ ] All features tested and working
   - [ ] Mobile responsive
   - [ ] Error tracking set up
   - [ ] Payment flow tested

Reference: Doc 4, Infrastructure & Deployment
Reference: Doc 2, Tier-Specific Features → Pricing
```

**Checklist:**
- [ ] Full user journey tested (end-to-end)
- [ ] Mobile testing complete (iOS + Android)
- [ ] Desktop testing complete (Chrome, Firefox, Safari)
- [ ] All APIs verified (Indeed, Maps, Gemini, Stripe)
- [ ] Vercel Analytics enabled
- [ ] Sentry error tracking set up
- [ ] Stripe subscription products created
- [ ] Payment flow tested (test mode)
- [ ] Stripe webhooks set up
- [ ] Launch checklist complete

---

#### Task 12.4: Launch! 🚀

**What to do:**
```
Launch Jalanea Works publicly!

1. Announce to beta users:
   - Email: "Jalanea Works is LIVE! 🎉"
   - Offer: 3 months free Premium (as promised)
   - Ask: Share with Valencia friends

2. Post to Valencia College:
   - Valencia Reddit, Facebook groups
   - Career Services partnership
   - Student organization partnerships (Tech Club, Business Club)

3. Post to Orlando community:
   - Orlando subreddit
   - Orlando tech Slack/Discord
   - SBDC Orlando
   - SCORE Orlando

4. Track metrics:
   - Signups per day
   - Conversion: Free → Paid
   - User feedback
   - Revenue

5. Iterate:
   - Fix bugs as they arise
   - Add features based on user requests
   - Improve UX based on analytics

Reference: Doc 1, Success Metrics
Reference: Doc 1, Post-Launch Strategy
```

**Checklist:**
- [ ] Beta users notified (3 months free Premium)
- [ ] Posted to Valencia College communities
- [ ] Posted to Orlando communities
- [ ] Tracking signups daily
- [ ] Monitoring errors (Sentry dashboard)
- [ ] First 10 signups! 🎉
- [ ] First paying customer! 💰

---

**Week 12 Complete! 🚀**
- [ ] All Week 12 tasks done
- [ ] Beta testing complete
- [ ] Bugs fixed
- [ ] Jalanea Works LAUNCHED!

**Time:** 10-15 hours  
**Deliverable:** Live, public platform with paying users

---

## Post-Launch (Months 2-3)

### Goals for First 3 Months

**Month 1 (Weeks 13-16):**
- [ ] 50 signups (Essential tier)
- [ ] 5 paid conversions ($15/month × 5 = $75/month revenue)
- [ ] Fix bugs reported by users
- [ ] Add most-requested features (from feedback)

**Month 2 (Weeks 17-20):**
- [ ] 150 signups (mix of Essential/Starter)
- [ ] 20 paid conversions ($400/month revenue)
- [ ] Build Tier 2 Job Pockets (Starter tier)
- [ ] Partner with Valencia Career Services

**Month 3 (Weeks 21-24):**
- [ ] 300 signups
- [ ] 50 paid conversions ($1,000/month revenue)
- [ ] Build Tier 3 Job Pockets (Premium tier)
- [ ] Break even on costs ($115/month)
- [ ] Start planning V2 (Tampa expansion)

---

## Summary: 12-Week Timeline

| Week | Phase | Goal | Time |
|------|-------|------|------|
| 1 | Foundation | Project setup + auth | 8-12 hrs |
| 2 | Foundation | Database + onboarding UI | 10-15 hrs |
| 3 | Foundation | Onboarding logic + validation | 10-15 hrs |
| 4 | Foundation | User dashboard | 8-12 hrs |
| 5 | Core Features | Job search (Indeed API) | 12-15 hrs |
| 6 | Core Features | LYNX + Scam Shield | 12-15 hrs |
| 7 | Core Features | Job Pockets (Tier 1) | 12-15 hrs |
| 8 | Core Features | Application tracking | 10-12 hrs |
| 9 | AI Features | Resume Studio + Skills Translation | 12-15 hrs |
| 10 | AI Features | Career Coach + Daily Plan | 10-12 hrs |
| 11 | Polish | Legal compliance + accessibility | 8-12 hrs |
| 12 | Launch | Beta testing + launch | 10-15 hrs |

**Total Time:** ~120-165 hours over 12 weeks  
**Average:** 10-14 hours per week  
**Pace:** Manageable for solo founder with full-time job

---

## Tips for Working with Claude Code

### How to Use This Plan

**Each task is designed for Claude Code:**
1. Copy/paste task description into Claude Code terminal
2. Let Claude Code generate the code
3. Test the feature
4. Move to next task

**Example:**
```
You (in terminal): "Create Next.js 14 project with App Router, TypeScript, Tailwind CSS, ESLint, Prettier. Use pnpm. Folder: jalanea-works"

Claude Code: [generates project structure, installs dependencies, sets up configs]

You: Test by running `pnpm dev`

You: Check box "Next.js project created" ✅
```

---

### Common Claude Code Prompts

**Starting a task:**
```
"I'm building Jalanea Works, a job search platform for Valencia College grads in Orlando. Here's what I need: [paste task from this doc]"
```

**When stuck:**
```
"I'm getting this error: [paste error]. Can you help me fix it?"
```

**For clarification:**
```
"Can you explain how [feature] works? Show me the code flow."
```

**For debugging:**
```
"This feature isn't working as expected. Here's what's happening: [describe issue]. Expected: [describe expected behavior]"
```

---

## You Got This! 💪

**Reality check:**
- You're 24 years old
- You're bleeding $500/month
- You need this to work
- You don't have time or money for "perfect"

**This plan is:**
- ✅ Realistic (10-14 hours/week for 12 weeks)
- ✅ Affordable ($0-115/month depending on free tier limits)
- ✅ Complete (every feature specified)
- ✅ Executable (every task designed for Claude Code)

**By Week 12, you'll have:**
- Working job search platform
- AI-powered features (Job Pockets, Resume Studio, Career Coach)
- Legal compliance (Privacy Policy, Terms, GDPR)
- First paying customers
- Path to breaking even

**Let's Light the Block.** 🚀

---

*BUILD PLAN Version 1.0*  
*Created: January 12, 2026*  
*For: Alexus (Founder, Jalanea Works)*  
*Purpose: Step-by-step plan from zero to launch*
