# PROJECT_REQUIREMENTS.md
*Master Build Document - Jalanea Works Platform*
**Doc 2: Feature Specifications & Technical Requirements**
**Version 1.0**

---

## Table of Contents
1. [Document Purpose](#document-purpose)
2. [V1 Orlando Onboarding Flow](#v1-orlando-onboarding-flow)
3. [Core Platform Features](#core-platform-features)
4. [Orlando-Specific Features](#orlando-specific-features)
5. [Tier-Specific Features](#tier-specific-features)
6. [Data Models](#data-models)
7. [API Specifications](#api-specifications)
8. [User Interface Requirements](#user-interface-requirements)
9. [Implementation Priority](#implementation-priority)

---

## Document Purpose

**This document defines:**
- WHAT features to build
- HOW each feature works (user flows, logic, edge cases)
- WHAT data structures are needed
- WHAT APIs/integrations are required
- HOW to implement Orlando-specific features (LYNX, Valencia, Salary Calculator)

**Audience:** Claude Code (AI development assistant), future developers, product team

**Companion Documents:**
- Doc 1: PROJECT_OVERVIEW v3.0 (WHY we're building, mission, personas)
- Doc 3: USER EXPERIENCE (detailed user journeys, wireframes)
- Doc 4: TECHNICAL ARCHITECTURE (system design, infrastructure)
- Doc 5: COMPLIANCE & SAFEGUARDS (legal, privacy, security)

---

## V1 Orlando Onboarding Flow

### Overview
**Purpose:** Gather user context to enable Orlando-specific job matching and budget planning

**Timeline:** 5-10 minutes total
**Platform:** Mobile-first (Essential users on phones)
**Data Collected:** Location, transportation, credentials, availability, salary target, barriers, goal

**Design Principle:** Progressive disclosure - only ask what's needed for immediate value

---

### Step 1: Your Foundation (Screen 1)

**Purpose:** Establish identity and enable transit/credential-based filtering

**UI Layout:**
```
═══════════════════════════════════════════════════════════
Let's get you set up.

Your profile is your ticket to the Central Florida ecosystem.

───────────────────────────────────────────────────────────
Full Name *
[                                                         ]

───────────────────────────────────────────────────────────
Commute Start Point *
[                                                         ]
[📍 Use My Location]

Used to calculate bus routes and commute times. Stays private.

───────────────────────────────────────────────────────────
Digital Presence (Optional)

[+ Add LinkedIn Profile]    [+ Add Portfolio]

Don't have these yet? Skip for now. We'll help you build them later.

───────────────────────────────────────────────────────────
[Continue to Education]
═══════════════════════════════════════════════════════════
Step 1 of 5
```

**Fields:**
1. **Full Name** (Required)
   - Validation: Min 2 words (first + last)
   - Used for: Resume generation, profile display
   
2. **Commute Start Point** (Required)
   - Input type: Text (address) OR geolocation
   - Validation: Must be valid Orlando metro address
   - Used for: LYNX route calculation, job proximity filtering
   - Privacy: Stored as lat/long, rounded to nearest 0.01 (100m grid for anonymity)
   
3. **Use My Location** (Button)
   - Triggers browser geolocation API
   - Falls back to IP-based location if permission denied
   - Shows address preview: "Pine Hills, Orlando FL"
   
4. **LinkedIn Profile** (Optional)
   - Format: URL validation (linkedin.com/in/*)
   - Used for: Premium tier LinkedIn Connection Mapping
   
5. **Portfolio** (Optional)
   - Format: URL validation
   - Used for: Creative/tech roles (Starter/Premium)

**Next Step Logic:**
- If full name + location provided → Continue to Education
- If location permission denied → Show manual address entry
- If fields incomplete → Show inline validation errors

---

### Step 1.5: Your Education (Screen 2)

**Purpose:** Detect Valencia credentials for automatic highlighting

**UI Layout:**
```
═══════════════════════════════════════════════════════════
About You

Your Foundation

Add your education and credentials to unlock matched opportunities.

───────────────────────────────────────────────────────────
[Credential Card]
Accounting Applications (Certificate)
Valencia College • Alumni
[Edit] [Remove]

───────────────────────────────────────────────────────────
[+ Add Another Credential]

───────────────────────────────────────────────────────────
[Back]                                              [Continue]
═══════════════════════════════════════════════════════════
Step 1 of 5
```

**Add Credential Modal:**
```
═══════════════════════════════════════════════════════════
Add Education or Credential

───────────────────────────────────────────────────────────
Institution *
[ Valencia College                                     ▼]
  Valencia College
  University of Central Florida
  Seminole State College
  Rollins College
  Other

───────────────────────────────────────────────────────────
Credential Type *
[ Certificate                                          ▼]
  High School Diploma / GED
  Certificate
  Associate Degree (AS)
  Bachelor's Degree (BAS)
  Master's Degree
  Other

───────────────────────────────────────────────────────────
Program / Major *
[Accounting Applications                              ▼]
  (Dropdown populated based on Valencia programs database)

───────────────────────────────────────────────────────────
Status *
( ) Current Student
( ) Alumni
( ) Incomplete (Did not finish)

───────────────────────────────────────────────────────────
[Cancel]                                         [Add Credential]
═══════════════════════════════════════════════════════════
```

**Valencia Credential Detection:**
- If institution = "Valencia College" → Flag as `valencia_credential: true`
- Store: `{institution, credential_type, program, status}`
- Used for:
  - Resume: Auto-highlight Valencia credentials in bold
  - Job matching: Prioritize jobs seeking Valencia skills
  - Community: Connect to Valencia alumni network

**Next Step Logic:**
- At least 1 credential required → Continue to Mission Logistics
- No credentials → Show "Add at least one" error
- Multiple credentials → Store all, primary = most recent

---

### Step 2: Mission Logistics (Screen 3)

**Purpose:** Enable transit-aware and schedule-aware job filtering

**UI Layout:**
```
═══════════════════════════════════════════════════════════
Your Goals

Mission Logistics

Define your range and availability parameters.

───────────────────────────────────────────────────────────
How do you get to the mission? (Select all that apply)

[✓] Personal Car          [ ] LYNX Bus
    Reliable, wide range      Budget-friendly

[ ] Rideshare             [ ] Walk / Bike
    Uber/Lyft reliance        Hyper-local only

───────────────────────────────────────────────────────────
Max Commute Willingness
How far will you go?

( ) Local              ( ) Standard           ( ) Any Distance
    < 30 min               < 60 min               60+ min

───────────────────────────────────────────────────────────
When are you available to work?
This helps us find opportunities that fit your schedule

( ) Open to anything
    Any day, any shift works

( ) Weekdays preferred
    Monday - Friday focus

( ) Weekends preferred
    Saturday & Sunday focus

( ) Flexible / I set my own hours
    Gig work, freelance

( ) Specific days only
    I have set days available

───────────────────────────────────────────────────────────
Preferred shift times (Optional - helps us prioritize matches)

[ ] Morning (6am - 12pm)
[ ] Afternoon (12pm - 6pm)
[ ] Evening (6pm - 12am)
[ ] Overnight (12am - 6am)
[ ] No preference - any shift

───────────────────────────────────────────────────────────
[Back]                                              [Continue]
═══════════════════════════════════════════════════════════
Step 2 of 5
```

**Transportation Options:**
- **Multi-select** (user can have car + LYNX)
- Stored as: `{has_car: true, uses_lynx: true, uses_rideshare: false, walks: false}`
- Used for:
  - LYNX only: Show only jobs with LYNX access, calculate bus routes
  - Car: Show all jobs within max commute radius
  - Walk/Bike: Show only jobs within 2-3 miles

**Max Commute Logic:**
- Local (<30 min): Filter jobs by transit time
- Standard (<60 min): Standard radius
- Any Distance (60+ min): No filtering (remote jobs prioritized)

**Availability:**
- Single select (primary availability pattern)
- "Specific days only" → Shows day picker (Mon, Tue, Wed, Thu, Fri, Sat, Sun)
- Stored as: `{availability_type: "weekdays_preferred", specific_days: null}`

**Shift Preferences:**
- Multi-select (can prefer morning + afternoon)
- Used for: Job matching priority, not hard filter
- Stored as: `{preferred_shifts: ["morning", "afternoon"]}`

**Next Step Logic:**
- Transportation + Commute + Availability required → Continue to Salary Target
- If "Specific days only" selected → Must select at least 1 day

---

### Step 3: Salary Target (Screen 4)

**Purpose:** Enable Orlando-specific budget planning and salary-appropriate job matching

**UI Layout (Salary Selection):**
```
═══════════════════════════════════════════════════════════
Your Goals

Salary Target

What income level are you targeting? We'll show you what it affords in Orlando.

───────────────────────────────────────────────────────────
[ ] $30K - $40K       [ ] $40K - $52K       [ ] $52K - $62K
    Entry Level           Growing               Comfortable

[ ] $62K - $75K       [ ] $75K - $90K       [ ] $90K+
    Established           Thriving              Advanced

───────────────────────────────────────────────────────────
In Orlando, this salary lets you comfortably afford:

🏠 1 Bedroom
Your own 1BR apartment
Rent: $1,000-1,300/mo

Based on the 30% rule - spending no more than 30% of gross income on rent.

───────────────────────────────────────────────────────────
[Show Detailed Budget Breakdown ▼]
───────────────────────────────────────────────────────────
[Back]                                              [Continue]
═══════════════════════════════════════════════════════════
Step 3 of 5
```

**Salary Ranges:**
- $30-40k: Entry level (Essential tier users)
- $40-52k: Growing (Starter tier users)
- $52-62k: Comfortable
- $62-75k: Established
- $75-90k: Thriving
- $90k+: Advanced (Premium tier users)

**Budget Preview (Changes based on selection):**
| Salary Range | Rent Budget | Housing Type |
|--------------|-------------|--------------|
| $30-40k | $750-1,000/mo | Studio or shared 1BR |
| $40-52k | $1,000-1,300/mo | 1BR apartment |
| $52-62k | $1,300-1,550/mo | 1BR or 2BR |
| $62-75k | $1,550-1,875/mo | 2BR apartment |
| $75-90k | $1,875-2,250/mo | 2BR or small house |
| $90k+ | $2,250+/mo | House or luxury apartment |

**Detailed Budget Breakdown (Expandable):**
```
═══════════════════════════════════════════════════════════
Your Target Salary
See what your paycheck can do for you

$40k – $52k
per year

Minimum: $40k                                    Maximum: $52k
[━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━]

───────────────────────────────────────────────────────────
You Take Home
$2,875
per month

After federal/state taxes (estimated)

───────────────────────────────────────────────────────────
You Qualify For
$1,265
monthly rent

Based on 30% of take-home pay

───────────────────────────────────────────────────────────
Here's what you can afford

At $46k/year (midpoint), you'll take home $2,875/month.
Let's see how to make every dollar work for you.

───────────────────────────────────────────────────────────
Your Monthly Budget
Every dollar planned

Housing                                    $1,150    40%
Utilities                                  $144      5%
Transportation                             $431     15%
Food & Groceries                           $345     12%
Fun & Entertainment                        $374     13%
Savings & Investing                        $431     15%
                                          ─────────────────
Total Planned                             $2,875   100%

───────────────────────────────────────────────────────────
Your Money, Organized

Monthly Take-Home        $2,875
Housing                  $1,150
Utilities                $144
Transport                $431
Food                     $345
Fun                      $374
Savings                  $431
                        ─────────
Total Planned           $2,875

Every dollar has a job. You've got this! 💪

───────────────────────────────────────────────────────────
[Hide Budget Breakdown ▲]
═══════════════════════════════════════════════════════════
```

**Budget Calculator Logic:**
```javascript
// Orlando-specific budget calculation
function calculateOrlandoBudget(salaryRange) {
  const midpoint = (salaryRange.min + salaryRange.max) / 2;
  
  // Tax estimation (federal + FL state)
  const federalTaxRate = 0.12; // 12% bracket for $40-52k
  const stateTaxRate = 0; // Florida has no state income tax
  const ficaRate = 0.0765; // Social Security + Medicare
  
  const totalTaxRate = federalTaxRate + stateTaxRate + ficaRate;
  const monthlyGross = midpoint / 12;
  const monthlyTakeHome = monthlyGross * (1 - totalTaxRate);
  
  // 30% rule for rent
  const maxRent = monthlyTakeHome * 0.30;
  
  // Budget breakdown (percentages)
  const budget = {
    housing: monthlyTakeHome * 0.40,
    utilities: monthlyTakeHome * 0.05,
    transportation: monthlyTakeHome * 0.15,
    food: monthlyTakeHome * 0.12,
    entertainment: monthlyTakeHome * 0.13,
    savings: monthlyTakeHome * 0.15
  };
  
  return {
    monthlyTakeHome,
    maxRent,
    budget
  };
}
```

**Orlando Rent Data (2026):**
```javascript
const orlandoRentRanges = {
  studio: { min: 850, max: 1100 },
  oneBedroom: { min: 1000, max: 1300 },
  twoBedroom: { min: 1300, max: 1700 },
  threeBedroom: { min: 1650, max: 2200 }
};
```

**Next Step Logic:**
- Salary range selected → Continue to Common Challenges
- Budget breakdown viewed → Track analytics (user engaged with budget tool)

---

### Step 4: Common Challenges (Screen 5)

**Purpose:** Identify barriers to enable targeted support resources (NOT to filter jobs)

**UI Layout:**
```
═══════════════════════════════════════════════════════════
Your Path

What's your reality?

We use this to find tools that help you succeed.

───────────────────────────────────────────────────────────
🛡️ Safe Zone
This info is used to find support resources, NOT to filter your applications.

───────────────────────────────────────────────────────────
Common Challenges (Tap to add)

[ ] I am a single parent
[ ] No reliable car
[ ] Health challenges
[ ] English is my 2nd language
[ ] Need immediate income
[ ] Criminal record

───────────────────────────────────────────────────────────
Tell us about your situation (Optional)

Share your circumstances - we'll connect you with relevant support programs and resources.

[                                                         ]
[                                                         ]
[                                                         ]
[                                                         ]

───────────────────────────────────────────────────────────
[Back]                                    [Launch My Career →]
═══════════════════════════════════════════════════════════
Step 4 of 5
```

**Challenge Tags:**
- Multi-select (user can have multiple barriers)
- Stored as: `{challenges: ["single_parent", "no_car", "immediate_income"]}`
- **Critical:** NOT used for job filtering (discrimination risk)
- **Used for:**
  - Support resource matching (childcare programs, transit vouchers)
  - Career Coach context (trauma-informed guidance)
  - Platform analytics (understand user needs)

**Support Resource Mapping:**
| Challenge | Resources Surfaced |
|-----------|-------------------|
| Single parent | Childcare subsidies, flexible schedule jobs |
| No reliable car | LYNX-accessible jobs, rideshare vouchers |
| Health challenges | Seated work filter, ADA accommodations info |
| English 2nd language | Bilingual jobs, ESL resources |
| Need immediate income | Survival Mode (Essential tier), fast-hire jobs |
| Criminal record | Fair Chance jobs, expungement resources |

**Free-Text Situation Field:**
- Optional (many users won't use)
- Max 500 characters
- Used for: Career Coach context, future feature development insights
- **Privacy:** Never shared with employers, stored encrypted

**Next Step Logic:**
- Optional screen → Can skip entirely (click "Launch My Career")
- If challenges selected → Store for support resource matching
- Continue to Goal Selection

---

### Step 5: Goal Selection (Screen 6)

**Purpose:** Route user to appropriate tier (Essential/Starter/Premium)

**UI Layout:**
```
═══════════════════════════════════════════════════════════
Your Path

What's your goal?

This determines which tools you'll see first.

───────────────────────────────────────────────────────────
[ Survival Mode ]
Need a job FAST (within 7-10 days)

Perfect for: Urgent income needs, immediate bills
Timeline: 7-10 days to hired
Focus: Speed, simplicity, fast-hire jobs
Price: $15/month → Essential Tier

───────────────────────────────────────────────────────────
[ Bridge Mode ]
Career transition (8 weeks)

Perfect for: Retail → office, skills translation
Timeline: 8 weeks to hired
Focus: Skills Translation, bridge jobs, culture check
Price: $25/month → Starter Tier

───────────────────────────────────────────────────────────
[ Career Mode ]
Strategic search (12 weeks)

Perfect for: Senior roles, network activation
Timeline: 12 weeks to hired
Focus: Deep research, LinkedIn mapping, negotiation
Price: $75/month → Premium Tier

───────────────────────────────────────────────────────────
All tiers include 7-day free trial

[Back]                                [Start 7-Day Free Trial →]
═══════════════════════════════════════════════════════════
Step 5 of 5
```

**Tier Assignment Logic:**
```javascript
function recommendTier(onboardingData) {
  const { salary_target, challenges, transportation, credentials } = onboardingData;
  
  // SURVIVAL MODE (Essential Tier)
  if (
    challenges.includes("need_immediate_income") ||
    challenges.includes("no_car") && !transportation.has_car ||
    salary_target.max <= 40000
  ) {
    return "essential";
  }
  
  // CAREER MODE (Premium Tier)
  if (
    salary_target.min >= 75000 ||
    credentials.some(c => c.credential_type === "Master's Degree") ||
    credentials.some(c => c.years_experience >= 10)
  ) {
    return "premium";
  }
  
  // BRIDGE MODE (Starter Tier) - Default
  return "starter";
}
```

**Auto-Recommendation (Optional Enhancement):**
- Show "Based on your answers, we recommend: [Tier]"
- User can override (click different tier)
- Track: Did user follow recommendation?

**Next Step Logic:**
- Tier selected → Start 7-day free trial
- Redirect to tier-specific onboarding continuation:
  - Essential: Resume → ATS Optimization → Daily Plan → First Job
  - Starter: Resume → Skills Translation → Bridge Education → First Job
  - Premium: Resume → Role Level → Career Pocket Demo → First Job

---

### Onboarding Completion & Data Storage

**User Profile Created:**
```json
{
  "user_id": "uuid",
  "full_name": "Marcus Williams",
  "email": "marcus@example.com",
  "location": {
    "address": "Pine Hills, Orlando FL",
    "lat": 28.5783,
    "lng": -81.4540,
    "zip_code": "32808"
  },
  "credentials": [
    {
      "institution": "Valencia College",
      "credential_type": "Certificate",
      "program": "Accounting Applications",
      "status": "alumni",
      "valencia_credential": true
    }
  ],
  "transportation": {
    "has_car": false,
    "uses_lynx": true,
    "uses_rideshare": false,
    "walks": false
  },
  "max_commute_minutes": 30,
  "availability": {
    "type": "open_to_anything",
    "specific_days": null,
    "preferred_shifts": ["morning", "afternoon"]
  },
  "salary_target": {
    "min": 30000,
    "max": 40000,
    "monthly_take_home": 2200,
    "max_rent": 770
  },
  "challenges": ["need_immediate_income", "no_car"],
  "situation_notes": "Caring for grandmother, need flexible evening schedule",
  "tier": "essential",
  "onboarding_completed_at": "2026-01-12T10:30:00Z"
}
```

**Next: Tier-Specific Onboarding**
- Essential: 5-10 min (resume, optimization, daily plan, first application)
- Starter: 10-15 min (resume, skills translation, bridge education, first application)
- Premium: 15-20 min (resume, role level, demo, first application)

---

## Core Platform Features

### 1. LYNX Transit Integration

**Purpose:** Enable transit-dependent users (no car) to find accessible jobs

**Target Users:**
- Marcus Williams (Essential tier, no car, LYNX Route 36 from Pine Hills)
- 30-40% of Essential tier users
- 20-30% of Starter tier users

**Technical Requirements:**

#### 1.1 LYNX Route Database

**Data Source:** LYNX Open Data Portal (Orange County)

**Database Schema:**
```sql
CREATE TABLE lynx_routes (
  route_id TEXT PRIMARY KEY,
  route_number TEXT NOT NULL,
  route_name TEXT NOT NULL,
  route_type TEXT, -- 'local', 'express', 'link'
  color_hex TEXT,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE lynx_stops (
  stop_id TEXT PRIMARY KEY,
  stop_name TEXT NOT NULL,
  lat NUMERIC(10, 7) NOT NULL,
  lng NUMERIC(10, 7) NOT NULL,
  zip_code TEXT,
  accessibility JSONB -- {wheelchair_accessible, shelter, lighting}
);

CREATE TABLE lynx_route_stops (
  route_id TEXT REFERENCES lynx_routes(route_id),
  stop_id TEXT REFERENCES lynx_stops(stop_id),
  sequence INTEGER NOT NULL, -- Order of stops on route
  direction TEXT, -- 'northbound', 'southbound', 'eastbound', 'westbound'
  PRIMARY KEY (route_id, stop_id, direction)
);

CREATE TABLE lynx_schedules (
  schedule_id TEXT PRIMARY KEY,
  route_id TEXT REFERENCES lynx_routes(route_id),
  stop_id TEXT REFERENCES lynx_stops(stop_id),
  arrival_time TIME NOT NULL,
  departure_time TIME NOT NULL,
  day_type TEXT, -- 'weekday', 'saturday', 'sunday'
  frequency_minutes INTEGER -- Average frequency during peak hours
);
```

**Initial Data Load:**
- Import all active LYNX routes (as of 2026)
- Priority routes for V1:
  - Route 36 (Pine Hills → Colonial → downtown)
  - Route 50 (Michigan → Orange Ave → downtown)
  - Route 18 (OBT corridor)
  - Route 8 (International Drive → downtown)
  - Route 125 (Lynx Central Station → UCF)

#### 1.2 Transit Time Calculation

**API Integration:** Google Maps Directions API (Transit mode)

**Function Signature:**
```javascript
async function calculateTransitTime(origin, destination, arrivalTime) {
  // origin: {lat, lng}
  // destination: {lat, lng}
  // arrivalTime: ISO timestamp (when user needs to arrive at work)
  
  const response = await googleMaps.directions({
    origin: `${origin.lat},${origin.lng}`,
    destination: `${destination.lat},${destination.lng}`,
    mode: 'transit',
    transit_mode: 'bus',
    arrival_time: arrivalTime,
    alternatives: true, // Show 3 route options
    region: 'us',
    units: 'imperial'
  });
  
  return {
    duration_minutes: response.routes[0].legs[0].duration.value / 60,
    routes: response.routes.map(route => ({
      steps: route.legs[0].steps,
      lynx_routes_used: extractLynxRoutes(route),
      total_walking_distance: calculateWalkingDistance(route),
      transfers: countTransfers(route)
    }))
  };
}

function extractLynxRoutes(route) {
  return route.legs[0].steps
    .filter(step => step.travel_mode === 'TRANSIT')
    .map(step => ({
      route_number: step.transit_details.line.short_name,
      route_name: step.transit_details.line.name,
      departure_stop: step.transit_details.departure_stop.name,
      arrival_stop: step.transit_details.arrival_stop.name
    }));
}
```

**Caching Strategy:**
- Cache common origin → destination pairs for 24 hours
- Key: `${origin_zip}_${destination_zip}_${hour_of_day}`
- Reduces API calls by 70-80%

#### 1.3 Job Card Display (LYNX Users)

**UI Component:**
```jsx
function JobCard({ job, userLocation, userUsesLynx }) {
  const [transitInfo, setTransitInfo] = useState(null);
  
  useEffect(() => {
    if (userUsesLynx && job.location) {
      calculateTransitTime(userLocation, job.location, "09:00:00")
        .then(setTransitInfo);
    }
  }, [job, userLocation]);
  
  return (
    <div className="job-card">
      <h3>{job.title}</h3>
      <p>{job.company}</p>
      
      {userUsesLynx && transitInfo && (
        <div className="transit-badge">
          <BusIcon />
          <span>
            {transitInfo.duration_minutes} min via Route {transitInfo.routes[0].lynx_routes_used[0].route_number}
          </span>
          {transitInfo.transfers > 0 && (
            <span className="transfers">({transitInfo.transfers} transfer)</span>
          )}
        </div>
      )}
      
      <button>View Job Pocket</button>
    </div>
  );
}
```

**Display Logic:**
- If user has car: Show driving distance ("8 miles away")
- If user uses LYNX: Show transit time + route number ("25 min via Route 36")
- If user walks: Show walking distance ("0.8 miles away")
- If job has no LYNX access: Show badge "⚠️ No LYNX access"

#### 1.4 LYNX-Accessible Job Filtering

**Filter Logic:**
```javascript
function filterJobsByLynxAccess(jobs, userLocation, maxCommute) {
  return Promise.all(
    jobs.map(async job => {
      const transitInfo = await calculateTransitTime(
        userLocation,
        job.location,
        "09:00:00"
      );
      
      return {
        ...job,
        lynx_accessible: transitInfo.duration_minutes <= maxCommute,
        transit_time: transitInfo.duration_minutes,
        lynx_routes: transitInfo.routes[0].lynx_routes_used
      };
    })
  ).then(jobs => jobs.filter(j => j.lynx_accessible));
}
```

**Performance Optimization:**
- Pre-filter jobs by ZIP code proximity (LYNX only serves certain areas)
- Batch API calls (max 10 concurrent)
- Use cached results when available

#### 1.5 Shadow Calendar Integration

**Commute Time Blocking:**
```javascript
function generateShadowCalendar(userSchedule, jobs) {
  const events = userSchedule.map(shift => {
    const jobLocation = jobs.find(j => j.id === shift.job_id).location;
    const transitTime = calculateTransitTime(
      userLocation,
      jobLocation,
      shift.start_time
    );
    
    return {
      type: 'commute',
      start: subtractMinutes(shift.start_time, transitTime.duration_minutes + 10), // +10 min buffer
      end: shift.start_time,
      title: `Commute to ${shift.job_title}`,
      lynx_route: transitTime.routes[0].lynx_routes_used[0].route_number
    };
  });
  
  return events;
}
```

**Conflict Detection:**
- Detect overlapping shifts + commute times
- Warn user: "This shift conflicts with your Target shift (including commute time)"
- Suggest: "Consider jobs closer to home or with later start times"

---

### 2. Valencia Credential Highlighting

**Purpose:** Auto-detect and prominently display Valencia College credentials

**Target Users:**
- Jasmine Chen (Starter tier, Valencia alum with BAS + AS degrees)
- 60-80% of Starter tier users
- 40-60% of Essential tier users (some credentials/certificates)

**Technical Requirements:**

#### 2.1 Valencia Programs Database

**Data Source:** Valencia College course catalog (manual entry for V1)

**Database Schema:**
```sql
CREATE TABLE valencia_programs (
  program_id TEXT PRIMARY KEY,
  program_name TEXT NOT NULL,
  program_type TEXT, -- 'certificate', 'AS', 'BAS'
  school TEXT, -- 'School of Computing & IT', 'School of Business', etc.
  career_pathway TEXT, -- 'Technology', 'Business', 'Healthcare', etc.
  keywords TEXT[], -- For job matching
  typical_salary_range INT4RANGE -- (min, max) in thousands
);

INSERT INTO valencia_programs VALUES
  ('comp-tech-bas', 'Computing Technology & Software Development', 'BAS', 'School of Computing & IT', 'Technology', ARRAY['software', 'programming', 'web development'], '[40, 65]'),
  ('interactive-design-as', 'Interactive Design', 'AS', 'School of Computing & IT', 'Technology', ARRAY['UI/UX', 'graphic design', 'web design'], '[35, 50]'),
  ('it-support-cert', 'IT Support Specialist', 'certificate', 'School of Computing & IT', 'Technology', ARRAY['help desk', 'technical support'], '[30, 45]'),
  ('accounting-cert', 'Accounting Applications', 'certificate', 'School of Business', 'Business', ARRAY['bookkeeping', 'accounting software'], '[30, 42]');
```

#### 2.2 Credential Detection Algorithm

**Function:**
```javascript
function detectValenciaCredentials(educationList) {
  return educationList
    .filter(edu => {
      const institutionMatch = edu.institution.toLowerCase().includes('valencia');
      return institutionMatch;
    })
    .map(edu => {
      // Match to program database
      const program = valenciaPrograms.find(p => 
        p.program_name.toLowerCase().includes(edu.program.toLowerCase())
      );
      
      return {
        ...edu,
        valencia_credential: true,
        program_id: program?.program_id,
        career_pathway: program?.career_pathway,
        keywords: program?.keywords
      };
    });
}
```

**Auto-Detection Triggers:**
- During onboarding: When user adds "Valencia College" as institution
- During resume upload: Parse resume text for "Valencia College"
- During profile edit: When user updates education

#### 2.3 Resume Highlighting

**Before (Standard Resume):**
```
EDUCATION
Associate of Science, Interactive Design
Valencia College, Orlando FL
Graduated: May 2024
```

**After (Valencia Credential Highlighting):**
```
EDUCATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ VALENCIA COLLEGE GRADUATE ✨

Associate of Science, Interactive Design
Valencia College, Orlando FL • Graduated: May 2024

Related Skills: UI/UX Design, Adobe Creative Suite, 
Web Design, User Research
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Implementation:**
```javascript
function highlightValenciaCredentials(resumeHTML, credentials) {
  const valenciaCredentials = credentials.filter(c => c.valencia_credential);
  
  if (valenciaCredentials.length === 0) return resumeHTML;
  
  // Add visual emphasis
  return resumeHTML.replace(
    /<section id="education">(.*?)<\/section>/s,
    (match, educationContent) => {
      const highlighted = `
        <section id="education">
          <div class="valencia-banner">
            ✨ VALENCIA COLLEGE GRADUATE ✨
          </div>
          ${educationContent}
        </section>
      `;
      return highlighted;
    }
  );
}
```

**CSS Styling:**
```css
.valencia-banner {
  background: linear-gradient(90deg, #003DA5 0%, #00A9E0 100%); /* Valencia colors */
  color: white;
  padding: 12px;
  text-align: center;
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 16px;
  border-radius: 8px;
}
```

#### 2.4 Job Matching Priority

**Valencia-Friendly Employers (Orlando):**
```javascript
const valenciaPreferredEmployers = [
  { name: "AdventHealth", reason: "Hires Valencia healthcare grads" },
  { name: "Orlando Health", reason: "Valencia partnership programs" },
  { name: "EA (Electronic Arts)", reason: "Hires Valencia tech grads" },
  { name: "Verizon Media", reason: "Local tech employer" },
  { name: "Orange County Public Schools", reason: "Valencia education grads" },
  { name: "Visit Orlando", reason: "Hospitality management grads" },
  { name: "Universal Orlando", reason: "Valencia hospitality programs" }
];
```

**Matching Logic:**
```javascript
function rankJobsForValenciaGrad(jobs, userCredentials) {
  const valenciaCredential = userCredentials.find(c => c.valencia_credential);
  
  if (!valenciaCredential) return jobs; // No ranking needed
  
  return jobs.map(job => {
    let score = 0;
    
    // Employer prefers Valencia grads
    if (valenciaPreferredEmployers.some(e => job.company.includes(e.name))) {
      score += 20;
    }
    
    // Job keywords match Valencia program
    const programKeywords = valenciaCredential.keywords || [];
    const jobKeywords = extractKeywords(job.description);
    const matchingKeywords = programKeywords.filter(k => 
      jobKeywords.some(jk => jk.includes(k))
    );
    score += matchingKeywords.length * 5;
    
    // Salary aligns with Valencia program typical range
    if (job.salary_min >= valenciaCredential.typical_salary_range.min &&
        job.salary_max <= valenciaCredential.typical_salary_range.max * 1.2) {
      score += 10;
    }
    
    return { ...job, valencia_match_score: score };
  }).sort((a, b) => b.valencia_match_score - a.valencia_match_score);
}
```

#### 2.5 Community Network (Future Enhancement)

**Valencia Alumni Network:**
- Connect users with Valencia alumni at target companies
- "5 Valencia grads work at AdventHealth"
- LinkedIn connection paths prioritizing Valencia alumni
- Mentorship matching (V1.1 feature)

---

### 3. Orlando Salary Calculator

**Purpose:** Show users what they can afford in Orlando at different salary levels

**Target Users:** All users during onboarding (Step 3)

**Technical Requirements:**

#### 3.1 Orlando Cost-of-Living Data

**Data Sources:**
- Zillow API (rent prices)
- BLS Consumer Expenditure Survey (budget percentages)
- Manual market research (2026 Orlando data)

**Database Schema:**
```sql
CREATE TABLE orlando_rent_data (
  housing_type TEXT PRIMARY KEY,
  min_rent INTEGER NOT NULL,
  max_rent INTEGER NOT NULL,
  typical_sqft INTEGER,
  zip_codes TEXT[], -- Areas where this housing type is common
  last_updated DATE
);

INSERT INTO orlando_rent_data VALUES
  ('studio', 850, 1100, 450, ARRAY['32801', '32803', '32805'], '2026-01-01'),
  ('1br', 1000, 1300, 650, ARRAY['32801', '32803', '32808'], '2026-01-01'),
  ('2br', 1300, 1700, 950, ARRAY['32808', '32810', '32825'], '2026-01-01'),
  ('3br', 1650, 2200, 1200, ARRAY['32810', '32825', '32835'], '2026-01-01');
```

#### 3.2 Take-Home Pay Calculator

**Function:**
```javascript
function calculateTakeHomePay(annualSalary) {
  // Federal tax brackets 2026 (single filer)
  let federalTax = 0;
  if (annualSalary <= 11600) {
    federalTax = annualSalary * 0.10;
  } else if (annualSalary <= 47150) {
    federalTax = 1160 + (annualSalary - 11600) * 0.12;
  } else if (annualSalary <= 100525) {
    federalTax = 5426 + (annualSalary - 47150) * 0.22;
  } else {
    federalTax = 17168.50 + (annualSalary - 100525) * 0.24;
  }
  
  // Florida has no state income tax
  const stateTax = 0;
  
  // FICA (Social Security + Medicare)
  const socialSecurity = Math.min(annualSalary, 168600) * 0.062;
  const medicare = annualSalary * 0.0145;
  const ficaTax = socialSecurity + medicare;
  
  const totalTax = federalTax + stateTax + ficaTax;
  const annualTakeHome = annualSalary - totalTax;
  const monthlyTakeHome = annualTakeHome / 12;
  
  return {
    annualSalary,
    federalTax,
    stateTax,
    ficaTax,
    totalTax,
    annualTakeHome,
    monthlyTakeHome,
    effectiveTaxRate: (totalTax / annualSalary) * 100
  };
}
```

**Example Outputs:**
```javascript
calculateTakeHomePay(40000);
// => { monthlyTakeHome: 2750, effectiveTaxRate: 17.5% }

calculateTakeHomePay(52000);
// => { monthlyTakeHome: 3525, effectiveTaxRate: 19.2% }

calculateTakeHomePay(75000);
// => { monthlyTakeHome: 4950, effectiveTaxRate: 21.2% }
```

#### 3.3 Budget Breakdown Calculator

**Function:**
```javascript
function generateBudgetBreakdown(monthlyTakeHome) {
  // Research-backed percentages (50/30/20 rule adapted)
  const budget = {
    housing: monthlyTakeHome * 0.40, // Orlando is expensive
    utilities: monthlyTakeHome * 0.05,
    transportation: monthlyTakeHome * 0.15, // Includes car payment, insurance, gas
    food: monthlyTakeHome * 0.12,
    entertainment: monthlyTakeHome * 0.13,
    savings: monthlyTakeHome * 0.15
  };
  
  // Calculate 30% rule for rent qualification
  const maxRent = monthlyTakeHome * 0.30;
  
  // Find affordable housing types
  const affordableHousing = orlandoRentData.filter(h => 
    h.min_rent <= maxRent
  );
  
  return {
    monthlyTakeHome,
    maxRent,
    budget,
    affordableHousing
  };
}
```

#### 3.4 Interactive Salary Slider (Enhancement)

**UI Component:**
```jsx
function SalaryCalculator() {
  const [salary, setSalary] = useState(46000); // Midpoint of $40-52k
  const takeHome = calculateTakeHomePay(salary);
  const budget = generateBudgetBreakdown(takeHome.monthlyTakeHome);
  
  return (
    <div className="salary-calculator">
      <h3>Your Target Salary</h3>
      <p>See what your paycheck can do for you</p>
      
      <div className="salary-slider">
        <label>${salary.toLocaleString()}/year</label>
        <input 
          type="range" 
          min={30000} 
          max={100000} 
          step={1000}
          value={salary}
          onChange={(e) => setSalary(Number(e.target.value))}
        />
        <div className="slider-labels">
          <span>$30K</span>
          <span>$100K</span>
        </div>
      </div>
      
      <div className="take-home-display">
        <h4>You Take Home</h4>
        <p className="big-number">${Math.round(takeHome.monthlyTakeHome).toLocaleString()}</p>
        <p className="small-text">per month</p>
      </div>
      
      <div className="rent-display">
        <h4>You Qualify For</h4>
        <p className="big-number">${Math.round(budget.maxRent).toLocaleString()}</p>
        <p className="small-text">monthly rent</p>
        
        <div className="housing-types">
          {budget.affordableHousing.map(h => (
            <div key={h.housing_type} className="housing-badge">
              🏠 {h.housing_type}
            </div>
          ))}
        </div>
      </div>
      
      <BudgetBreakdownChart budget={budget.budget} />
    </div>
  );
}
```

#### 3.5 Budget Visualization (Pie Chart)

**Component:**
```jsx
function BudgetBreakdownChart({ budget }) {
  const total = Object.values(budget).reduce((sum, val) => sum + val, 0);
  
  const data = [
    { label: 'Housing', value: budget.housing, color: '#FF6B6B', percent: (budget.housing / total) * 100 },
    { label: 'Utilities', value: budget.utilities, color: '#4ECDC4', percent: (budget.utilities / total) * 100 },
    { label: 'Transportation', value: budget.transportation, color: '#FFD93D', percent: (budget.transportation / total) * 100 },
    { label: 'Food', value: budget.food, color: '#95E1D3', percent: (budget.food / total) * 100 },
    { label: 'Fun', value: budget.entertainment, color: '#F38181', percent: (budget.entertainment / total) * 100 },
    { label: 'Savings', value: budget.savings, color: '#6C5CE7', percent: (budget.savings / total) * 100 }
  ];
  
  return (
    <div className="budget-chart">
      <h4>Your Monthly Budget</h4>
      <p>Every dollar planned</p>
      
      <div className="pie-chart">
        {/* SVG pie chart implementation */}
      </div>
      
      <div className="budget-list">
        {data.map(item => (
          <div key={item.label} className="budget-item">
            <div className="color-dot" style={{ background: item.color }} />
            <span className="label">{item.label}</span>
            <span className="value">${Math.round(item.value)}</span>
            <span className="percent">{Math.round(item.percent)}%</span>
          </div>
        ))}
      </div>
      
      <div className="budget-summary">
        <p>Total Planned: <strong>${Math.round(total)}</strong></p>
        <p className="encouragement">Every dollar has a job. You've got this! 💪</p>
      </div>
    </div>
  );
}
```

---

## Tier-Specific Features

### Essential Tier ($15/month) - Speed & Simplicity

**Target User:** Marcus Williams (Survival Mode, 7-10 day timeline)

#### 4.1 Tier 1 Job Pocket (20-Second Intelligence)

**Purpose:** Fast qualification check + talking points for immediate applications

**Workflow:**
1. User clicks "View Job Pocket" on job card
2. AI analyzes job description (20-second processing)
3. Returns 6-section brief report
4. User decides: APPLY NOW or SKIP

**AI Prompt Template:**
```
You are a job search assistant helping someone who needs a job quickly (within 7-10 days).

Job Details:
- Title: {job_title}
- Company: {company_name}
- Location: {job_location}
- Salary: {salary_range}
- Description: {job_description}

User Profile:
- Name: {user_name}
- Experience: {work_history_summary}
- Education: {credentials}
- Transportation: {transportation_mode}
- Max Commute: {max_commute_minutes} minutes

Task: Generate a Tier 1 Job Pocket (20-second brief) with these sections:

1. QUALIFICATION CHECK
   - Do they meet the requirements? (YES/NO/MOSTLY)
   - What's missing (if anything)?
   - Can they apply anyway? (YES/NO)

2. QUICK BRIEF
   - Salary: {salary_range}
   - Schedule: {work_schedule}
   - Location: {address} ({commute_time} from user location)
   - Start Date: {estimated_start_date}

3. YOUR TALKING POINTS
   - 3-4 bullet points: How to position their experience for THIS job
   - Use evidence from user's work history
   - Frame retail/warehouse experience as relevant skills

4. LIKELY QUESTIONS
   - 2-3 interview questions they'll probably ask
   - Brief answers based on user's experience

5. RED FLAGS
   - Any concerns about this job? (scam risk, commute, schedule conflicts)
   - Or: "None detected"

6. RECOMMENDATION
   - APPLY NOW: You're qualified, no red flags, matches your constraints
   - APPLY WITH CAUTION: Qualified but has red flags
   - SKIP: Not qualified OR major red flags

Keep it concise. This should take 20 seconds to read.
```

**API Call:**
```javascript
async function generateTier1JobPocket(jobId, userId) {
  const job = await fetchJob(jobId);
  const user = await fetchUser(userId);
  
  const prompt = buildTier1Prompt(job, user);
  
  const response = await gemini3Flash({
    model: "gemini-3-flash",
    prompt: prompt,
    temperature: 0.3, // Low temperature for consistency
    max_tokens: 800
  });
  
  const pocket = parseTier1Response(response);
  
  // Store pocket for future reference
  await storePocket({
    user_id: userId,
    job_id: jobId,
    tier: 1,
    content: pocket,
    created_at: new Date()
  });
  
  return pocket;
}
```

**UI Display:**
```jsx
function Tier1JobPocket({ pocket, job }) {
  return (
    <div className="job-pocket tier-1">
      {/* Header */}
      <div className="pocket-header">
        <h2>{job.title}</h2>
        <p>{job.company}</p>
        <span className="tier-badge">Tier 1 • 20-second read</span>
      </div>
      
      {/* Qualification Check */}
      <section className="qualification">
        <h3>✓ Qualification Check</h3>
        <div className={`status ${pocket.qualification.meets_requirements ? 'qualified' : 'not-qualified'}`}>
          {pocket.qualification.meets_requirements ? '✓ You meet the requirements' : '⚠ Missing some requirements'}
        </div>
        {pocket.qualification.missing && (
          <p className="missing">Missing: {pocket.qualification.missing}</p>
        )}
        <p>{pocket.qualification.can_apply ? '✓ Apply anyway' : '✗ Don't apply'}</p>
      </section>
      
      {/* Quick Brief */}
      <section className="quick-brief">
        <h3>Quick Brief</h3>
        <ul>
          <li><strong>Salary:</strong> {pocket.quick_brief.salary}</li>
          <li><strong>Schedule:</strong> {pocket.quick_brief.schedule}</li>
          <li><strong>Location:</strong> {pocket.quick_brief.location}</li>
          {user.uses_lynx && (
            <li><strong>Commute:</strong> {pocket.quick_brief.commute_time} via {pocket.quick_brief.lynx_route}</li>
          )}
          <li><strong>Start Date:</strong> {pocket.quick_brief.start_date}</li>
        </ul>
      </section>
      
      {/* Talking Points */}
      <section className="talking-points">
        <h3>Your Talking Points</h3>
        <ul>
          {pocket.talking_points.map((point, i) => (
            <li key={i}>{point}</li>
          ))}
        </ul>
      </section>
      
      {/* Likely Questions */}
      <section className="likely-questions">
        <h3>Likely Questions</h3>
        {pocket.likely_questions.map((q, i) => (
          <div key={i} className="question">
            <p className="q"><strong>Q:</strong> {q.question}</p>
            <p className="a"><strong>A:</strong> {q.answer}</p>
          </div>
        ))}
      </section>
      
      {/* Red Flags */}
      <section className="red-flags">
        <h3>Red Flags</h3>
        {pocket.red_flags.length > 0 ? (
          <ul className="warning">
            {pocket.red_flags.map((flag, i) => (
              <li key={i}>⚠️ {flag}</li>
            ))}
          </ul>
        ) : (
          <p className="success">✓ None detected</p>
        )}
      </section>
      
      {/* Recommendation */}
      <section className="recommendation">
        <h3>Recommendation</h3>
        <div className={`rec-badge ${pocket.recommendation.action}`}>
          {pocket.recommendation.action === 'APPLY_NOW' && '✓ APPLY NOW'}
          {pocket.recommendation.action === 'APPLY_WITH_CAUTION' && '⚠ APPLY WITH CAUTION'}
          {pocket.recommendation.action === 'SKIP' && '✗ SKIP'}
        </div>
        <p>{pocket.recommendation.reason}</p>
      </section>
      
      {/* Actions */}
      <div className="pocket-actions">
        {pocket.recommendation.action !== 'SKIP' && (
          <button className="btn-primary" onClick={() => startApplication(job.id)}>
            Apply Now →
          </button>
        )}
        <button className="btn-secondary" onClick={() => closeModal()}>
          Close
        </button>
      </div>
    </div>
  );
}
```

**Usage Limits:**
- Essential Tier: Unlimited Tier 1 Job Pockets
- Cached for 24 hours (same job + user = reuse)
- AI cost per pocket: ~$0.01 (Gemini 3 Flash)

---

#### 4.2 Daily Plan (AI-Generated Application Strategy)

**Purpose:** Provide structure and direction for users who feel overwhelmed

**Algorithm:**
```javascript
async function generateDailyPlan(userId) {
  const user = await fetchUser(userId);
  const todayApplications = await fetchTodayApplications(userId);
  const target = 8; // 8 applications per day for Essential tier
  
  // Get jobs matching user constraints
  const jobs = await searchJobs({
    location: user.location,
    max_commute: user.max_commute_minutes,
    transportation: user.transportation,
    salary_min: user.salary_target.min,
    available_shifts: user.availability.preferred_shifts,
    hiring_speed: 'fast' // Essential tier prioritizes fast-hire jobs
  });
  
  // Filter out already applied
  const newJobs = jobs.filter(j => !todayApplications.some(a => a.job_id === j.id));
  
  // Rank by match score
  const rankedJobs = rankJobsByMatch(newJobs, user);
  
  // Select top 8
  const todayJobs = rankedJobs.slice(0, target);
  
  return {
    date: new Date().toISOString().split('T')[0],
    target: target,
    completed: todayApplications.length,
    remaining: target - todayApplications.length,
    jobs: todayJobs,
    message: generateEncouragementMessage(todayApplications.length, target)
  };
}

function generateEncouragementMessage(completed, target) {
  if (completed === 0) {
    return "Let's get started! Your first application is the hardest.";
  } else if (completed < target / 2) {
    return `Great start! ${completed} down, ${target - completed} to go.`;
  } else if (completed < target) {
    return `You're over halfway there! ${target - completed} more to hit your goal.`;
  } else {
    return `🎉 Goal reached! You applied to ${completed} jobs today. Take a break or keep going.`;
  }
}
```

**UI Display:**
```jsx
function DailyPlan({ plan }) {
  return (
    <div className="daily-plan">
      <div className="plan-header">
        <h2>Today's Plan</h2>
        <p className="date">{formatDate(plan.date)}</p>
      </div>
      
      <div className="progress-section">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${(plan.completed / plan.target) * 100}%` }}
          />
        </div>
        <p className="progress-text">
          {plan.completed}/{plan.target} applications today
        </p>
        <p className="encouragement">{plan.message}</p>
      </div>
      
      <div className="jobs-list">
        <h3>Your {plan.remaining} Jobs for Today</h3>
        {plan.jobs.map((job, index) => (
          <JobCard 
            key={job.id} 
            job={job} 
            priority={index + 1}
            showPriority={true}
          />
        ))}
      </div>
      
      <div className="plan-actions">
        <button onClick={() => regeneratePlan()}>
          🔄 Get Different Jobs
        </button>
        <button onClick={() => adjustTarget()}>
          ⚙️ Adjust Daily Target
        </button>
      </div>
    </div>
  );
}
```

**Daily Target Logic:**
- Essential Tier Default: 8 applications/day
- Adjustable (6-12 range)
- Resets at midnight local time
- Tracks streaks ("5 days in a row!")

---

### Starter Tier ($25/month) - Skills Translation & Bridge Jobs

**Target User:** Jasmine Chen (Bridge Mode, 8-week timeline)

#### 5.1 Tier 2 Bridge Job Pocket (90-Second Company Intelligence)

**Purpose:** Deeper company context + culture check for career changers

**Workflow:**
1. User clicks "Use Tier 2 Pocket" on job card
2. AI researches company for 90 seconds
3. Returns 7-section report (includes culture check)
4. User decides: PRIORITY APPLICATION or PASS

**AI Prompt Template:**
```
You are a career transition specialist helping someone move from retail to office/tech work.

Job Details:
- Title: {job_title}
- Company: {company_name}
- Location: {job_location}
- Description: {job_description}

User Profile:
- Current Role: {current_job_title}
- Years Experience: {years_experience}
- Skills: {skills_list}
- Valencia Credentials: {valencia_credentials}
- Career Goal: {career_goal}

Research Tasks:
1. Search the web for: "{company_name} careers" "{company_name} reviews" "{company_name} Orlando"
2. Gather company background, culture, and employee reviews
3. Determine if this is a TRUE bridge job or dead-end admin

Generate a Tier 2 Bridge Job Pocket with these sections:

1. THE ROLE
   - Detailed breakdown of responsibilities
   - Why they're hiring (growth, replacement, new team)
   - Reporting structure

2. WHY THEY'RE HIRING
   - Company growth indicators
   - Team expansion or backfill
   - Timeline urgency

3. WHAT THEY WANT
   - Ideal candidate profile
   - Non-negotiable requirements
   - Nice-to-have skills

4. CULTURE CHECK (Score: X/10)
   - Work-life balance
   - Management quality
   - Growth opportunities
   - Employee satisfaction
   - Pros/Cons based on reviews

5. YOUR POSITIONING
   - How to frame retail experience as relevant
   - Valencia credentials to emphasize
   - Skills translation (retail language → office language)

6. RED FLAGS
   - High turnover?
   - Negative reviews?
   - Dead-end admin role?
   - Schedule conflicts?
   - Or: "None detected"

7. RECOMMENDATION
   - PRIORITY APPLICATION: Great bridge job, good culture, you're qualified
   - SOLID OPTION: Good job, minor concerns
   - PASS: Not a true bridge job OR poor culture

Include sources for culture data.
```

**API Call with Web Grounding:**
```javascript
async function generateTier2JobPocket(jobId, userId) {
  const job = await fetchJob(jobId);
  const user = await fetchUser(userId);
  const company = job.company;
  
  // Research company via Google Search
  const searchResults = await googleSearch({
    query: `${company} careers reviews Orlando employee experience`,
    num_results: 10
  });
  
  const prompt = buildTier2Prompt(job, user, searchResults);
  
  const response = await gemini3Flash({
    model: "gemini-3-flash",
    prompt: prompt,
    temperature: 0.4,
    max_tokens: 1500,
    grounding: searchResults // Web grounding for accuracy
  });
  
  const pocket = parseTier2Response(response);
  
  // Calculate Culture Check score
  pocket.culture_check.score = calculateCultureScore(pocket.culture_check);
  
  await storePocket({
    user_id: userId,
    job_id: jobId,
    tier: 2,
    content: pocket,
    created_at: new Date()
  });
  
  return pocket;
}

function calculateCultureScore(cultureData) {
  // Score based on employee reviews
  const factors = {
    work_life_balance: cultureData.work_life_balance_rating || 3,
    management_quality: cultureData.management_rating || 3,
    growth_opportunities: cultureData.advancement_rating || 3,
    employee_satisfaction: cultureData.overall_rating || 3
  };
  
  const avgScore = Object.values(factors).reduce((sum, val) => sum + val, 0) / 4;
  return Math.round(avgScore * 2) / 2; // Round to nearest 0.5
}
```

**UI Display:**
```jsx
function Tier2JobPocket({ pocket, job }) {
  return (
    <div className="job-pocket tier-2">
      <div className="pocket-header">
        <h2>{job.title}</h2>
        <p>{job.company}</p>
        <span className="tier-badge">Tier 2 • 90-second read</span>
      </div>
      
      {/* The Role */}
      <section className="the-role">
        <h3>The Role</h3>
        <p>{pocket.role.description}</p>
        <ul>
          <li><strong>Why hiring:</strong> {pocket.role.hiring_reason}</li>
          <li><strong>Reports to:</strong> {pocket.role.reporting_structure}</li>
        </ul>
      </section>
      
      {/* Why They're Hiring */}
      <section className="why-hiring">
        <h3>Why They're Hiring</h3>
        <p>{pocket.why_hiring.context}</p>
      </section>
      
      {/* What They Want */}
      <section className="what-they-want">
        <h3>What They Want</h3>
        <div className="requirements">
          <h4>Non-Negotiable:</h4>
          <ul>
            {pocket.what_they_want.non_negotiable.map((req, i) => (
              <li key={i}>{req}</li>
            ))}
          </ul>
          <h4>Nice to Have:</h4>
          <ul>
            {pocket.what_they_want.nice_to_have.map((req, i) => (
              <li key={i}>{req}</li>
            ))}
          </ul>
        </div>
      </section>
      
      {/* Culture Check */}
      <section className="culture-check">
        <h3>Culture Check</h3>
        <div className="culture-score">
          <span className="score">{pocket.culture_check.score}</span>
          <span className="out-of">/10</span>
        </div>
        
        <div className="culture-details">
          <div className="pros-cons">
            <div className="pros">
              <h4>✓ Pros</h4>
              <ul>
                {pocket.culture_check.pros.map((pro, i) => (
                  <li key={i}>{pro}</li>
                ))}
              </ul>
            </div>
            <div className="cons">
              <h4>✗ Cons</h4>
              <ul>
                {pocket.culture_check.cons.map((con, i) => (
                  <li key={i}>{con}</li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="culture-factors">
            <p><strong>Work-Life Balance:</strong> {pocket.culture_check.work_life_balance}/5</p>
            <p><strong>Management:</strong> {pocket.culture_check.management_quality}/5</p>
            <p><strong>Growth:</strong> {pocket.culture_check.growth_opportunities}/5</p>
          </div>
          
          {pocket.culture_check.sources && (
            <p className="sources">
              <small>Based on: {pocket.culture_check.sources.join(', ')}</small>
            </p>
          )}
        </div>
      </section>
      
      {/* Your Positioning */}
      <section className="positioning">
        <h3>Your Positioning</h3>
        <p><strong>Frame your experience like this:</strong></p>
        <ul>
          {pocket.positioning.talking_points.map((point, i) => (
            <li key={i}>{point}</li>
          ))}
        </ul>
        
        {user.valencia_credentials && (
          <div className="valencia-edge">
            <h4>✨ Valencia Advantage</h4>
            <p>{pocket.positioning.valencia_edge}</p>
          </div>
        )}
      </section>
      
      {/* Red Flags */}
      <section className="red-flags">
        <h3>Red Flags</h3>
        {pocket.red_flags.length > 0 ? (
          <ul className="warning">
            {pocket.red_flags.map((flag, i) => (
              <li key={i}>⚠️ {flag}</li>
            ))}
          </ul>
        ) : (
          <p className="success">✓ None detected</p>
        )}
      </section>
      
      {/* Recommendation */}
      <section className="recommendation">
        <h3>Recommendation</h3>
        <div className={`rec-badge ${pocket.recommendation.action}`}>
          {pocket.recommendation.action === 'PRIORITY' && '⭐ PRIORITY APPLICATION'}
          {pocket.recommendation.action === 'SOLID' && '✓ SOLID OPTION'}
          {pocket.recommendation.action === 'PASS' && '→ PASS'}
        </div>
        <p>{pocket.recommendation.reason}</p>
      </section>
      
      <div className="pocket-actions">
        {pocket.recommendation.action !== 'PASS' && (
          <button className="btn-primary" onClick={() => startApplication(job.id)}>
            Apply Now →
          </button>
        )}
        <button className="btn-secondary">Close</button>
      </div>
    </div>
  );
}
```

**Usage Limits:**
- Starter Tier: 1 Tier 2 Pocket per month (use strategically!)
- Cached for 7 days
- AI cost per pocket: ~$0.05 (Gemini 3 Flash + Google Search grounding)

**Strategic Use Coaching:**
```jsx
function Tier2PocketUsage({ remainingPockets, jobs }) {
  if (remainingPockets === 0) {
    return (
      <div className="pocket-limit-reached">
        <p>⚠️ You've used your Tier 2 Pocket this month</p>
        <p>Your next pocket unlocks in {daysUntilReset} days</p>
        <button>Upgrade to Premium for unlimited pockets</button>
      </div>
    );
  }
  
  return (
    <div className="pocket-strategy">
      <p>💡 You have {remainingPockets} Tier 2 Pocket remaining this month</p>
      <p>Use it on jobs you're most interested in - this gives you 90 seconds of company research + culture check</p>
    </div>
  );
}
```

---

#### 5.2 Skills Translation Engine

**Purpose:** Transform retail/service language into office/tech language

**Before/After Examples:**

**Example 1: Retail Shift Lead → Office Coordinator**
```
BEFORE (Retail Language):
- Managed team of 5 associates during shifts
- Handled customer complaints and returns
- Counted cash drawer at end of shift
- Trained new employees on POS system

AFTER (Office Language):
- Supervised 5-person team, delegating tasks and monitoring performance metrics
- Resolved escalated customer issues, achieving 95% satisfaction rating
- Maintained financial accuracy through daily reconciliation procedures
- Onboarded and trained new team members on enterprise software systems
```

**Example 2: Warehouse Worker → Data Entry Specialist**
```
BEFORE (Warehouse Language):
- Picked orders using scanner
- Loaded trucks following manifest
- Used computer system to track inventory
- Checked items for quality issues

AFTER (Office Language):
- Executed order fulfillment operations using RF scanning technology
- Coordinated shipment logistics based on digital documentation
- Operated inventory management software with 99.8% accuracy
- Performed quality assurance checks and documented findings
```

**Algorithm:**
```javascript
async function translateSkills(workHistory, targetRole) {
  const prompt = `
You are a resume transformation specialist helping someone transition from ${workHistory.current_industry} to ${targetRole.target_industry}.

Current Role: ${workHistory.job_title}
Target Role: ${targetRole.title}

Current Responsibilities (in their words):
${workHistory.responsibilities.join('\n')}

Transform these responsibilities into language that appeals to hiring managers in ${targetRole.target_industry}. Focus on:
1. Use industry-standard terminology
2. Quantify achievements where possible
3. Emphasize transferable skills (problem-solving, communication, technical aptitude)
4. Remove industry-specific jargon from old role
5. Frame experience as relevant to target role

Return JSON:
{
  "transformed_responsibilities": [
    { "original": "...", "transformed": "...", "why_this_matters": "..." }
  ],
  "new_skills_to_emphasize": ["skill1", "skill2"],
  "keywords_for_ats": ["keyword1", "keyword2"]
}
  `;
  
  const response = await gemini3Flash({
    model: "gemini-3-flash",
    prompt: prompt,
    temperature: 0.5,
    response_format: "json"
  });
  
  return JSON.parse(response);
}
```

**UI Display:**
```jsx
function SkillsTranslationTool() {
  const [currentRole, setCurrentRole] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [responsibilities, setResponsibilities] = useState(['']);
  const [translation, setTranslation] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const handleTranslate = async () => {
    setLoading(true);
    const result = await translateSkills(
      { job_title: currentRole, responsibilities },
      { title: targetRole, target_industry: 'office/tech' }
    );
    setTranslation(result);
    setLoading(false);
  };
  
  return (
    <div className="skills-translation">
      <h2>Skills Translation Engine</h2>
      <p>Transform your experience into office/tech language</p>
      
      <div className="input-section">
        <label>Current Role</label>
        <input 
          value={currentRole}
          onChange={(e) => setCurrentRole(e.target.value)}
          placeholder="e.g., Shift Lead at Old Navy"
        />
        
        <label>Target Role</label>
        <input 
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          placeholder="e.g., Office Coordinator"
        />
        
        <label>Your Responsibilities (one per line)</label>
        {responsibilities.map((resp, i) => (
          <textarea 
            key={i}
            value={resp}
            onChange={(e) => {
              const newResp = [...responsibilities];
              newResp[i] = e.target.value;
              setResponsibilities(newResp);
            }}
            placeholder="e.g., Managed team of 5 during shifts"
          />
        ))}
        <button onClick={() => setResponsibilities([...responsibilities, ''])}>
          + Add Responsibility
        </button>
        
        <button 
          className="btn-primary" 
          onClick={handleTranslate}
          disabled={loading || !currentRole || !targetRole}
        >
          {loading ? 'Translating...' : 'Transform My Experience →'}
        </button>
      </div>
      
      {translation && (
        <div className="translation-results">
          <h3>Your Transformed Resume</h3>
          
          {translation.transformed_responsibilities.map((item, i) => (
            <div key={i} className="transformation">
              <div className="before">
                <span className="label">❌ Before (Retail):</span>
                <p>{item.original}</p>
              </div>
              
              <div className="arrow">→</div>
              
              <div className="after">
                <span className="label">✓ After (Office/Tech):</span>
                <p>{item.transformed}</p>
                <span className="why">💡 Why this matters: {item.why_this_matters}</span>
              </div>
            </div>
          ))}
          
          <div className="new-skills">
            <h4>New Skills to Emphasize</h4>
            <div className="skill-tags">
              {translation.new_skills_to_emphasize.map((skill, i) => (
                <span key={i} className="skill-tag">{skill}</span>
              ))}
            </div>
          </div>
          
          <div className="ats-keywords">
            <h4>ATS Keywords to Add</h4>
            <div className="keyword-tags">
              {translation.keywords_for_ats.map((keyword, i) => (
                <span key={i} className="keyword-tag">{keyword}</span>
              ))}
            </div>
          </div>
          
          <div className="translation-actions">
            <button className="btn-primary" onClick={() => applyToResume(translation)}>
              Apply to My Resume
            </button>
            <button className="btn-secondary" onClick={() => downloadPDF(translation)}>
              Download Comparison PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

**Auto-Application to Resume:**
- User clicks "Apply to My Resume"
- AI rewrites resume sections with transformed language
- ATS score recalculates (45 → 82+)
- User reviews and approves changes

---

#### 5.3 Bridge Role Education

**Purpose:** Teach users the difference between bridge jobs and dead-end admin

**Content:**
```markdown
## What's a Bridge Job?

A **bridge job** is an office role that:
✓ Uses some tech skills (Microsoft Office, CRM, scheduling software)
✓ Has upward mobility (can become Office Manager, Project Coordinator, etc.)
✓ Pays better than retail ($38-45k vs $28-35k)
✓ Builds professional network in target industry

Examples in Orlando:
- **Healthcare Coordinator** at AdventHealth ($38-44k)
  - Uses Dentrix/Epic software
  - Can advance to Practice Manager
  - Bridge from retail → healthcare administration

- **Customer Success Associate** at tech company ($40-48k)
  - Uses CRM (Salesforce/HubSpot)
  - Can advance to Account Manager
  - Bridge from retail → tech sales

- **Administrative Coordinator** at EA ($42-50k)
  - Uses project management tools
  - Can advance to Project Coordinator
  - Bridge from retail → game industry

## What's Dead-End Admin?

A **dead-end admin** role is:
✗ Pure receptionist duties (answer phones, file papers)
✗ No tech component
✗ No career progression
✗ Pays same or less than retail ($30-35k)

Examples to AVOID:
- "Office Assistant" at law firm ($30-32k)
  - Just answering phones, filing
  - No software skills
  - No advancement path

- "Receptionist" at dentist ($28-32k)
  - Same pay as retail
  - No specialized skills
  - Lateral move, not upward
```

**Interactive Quiz:**
```jsx
function BridgeJobQuiz() {
  const scenarios = [
    {
      title: "Dental Office Coordinator",
      salary: "$40,000",
      description: "Answer phones, schedule appointments, manage Dentrix software, insurance verification",
      is_bridge: true,
      explanation: "✓ Bridge Job - Uses specialized software (Dentrix), competitive pay, can advance to Office Manager"
    },
    {
      title: "Office Assistant",
      salary: "$32,000",
      description: "Answer phones, file paperwork, greet clients, basic data entry",
      is_bridge: false,
      explanation: "✗ Dead-End Admin - No specialized skills, low pay, no advancement"
    },
    // ... more scenarios
  ];
  
  return (
    <div className="bridge-job-quiz">
      <h2>Bridge Job or Dead-End?</h2>
      <p>Practice spotting the difference</p>
      
      {scenarios.map((scenario, i) => (
        <div key={i} className="scenario">
          <h3>{scenario.title}</h3>
          <p className="salary">{scenario.salary}</p>
          <p className="description">{scenario.description}</p>
          
          <div className="quiz-buttons">
            <button onClick={() => checkAnswer(scenario, true)}>
              ✓ Bridge Job
            </button>
            <button onClick={() => checkAnswer(scenario, false)}>
              ✗ Dead-End Admin
            </button>
          </div>
          
          {answered[i] && (
            <div className={`explanation ${scenario.is_bridge ? 'correct' : 'incorrect'}`}>
              {scenario.explanation}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

### Premium Tier ($75/month) - Deep Research & Network Activation

**Target User:** David Richardson (Career Mode, 12-week timeline)

#### 6.1 Tier 3 Career Job Pocket (5-10 Minute Deep Research)

**Purpose:** Comprehensive company intelligence for strategic senior-level applications

**8-Page Report Sections:**

1. **Company Overview** (1 page)
   - Funding status, revenue, growth trajectory
   - Investors, board members, strategic direction
   - CEO background and leadership team
   - Orlando presence or remote-friendly culture

2. **The Role** (1 page)
   - Detailed breakdown of responsibilities
   - Reporting structure, team size
   - Budget responsibility (if applicable)
   - Compensation: salary range + equity + benefits

3. **Hiring Manager Deep Dive** (2 pages)
   - Background (previous companies, tenure)
   - Leadership style (data from employee reviews)
   - What they value (based on interviews, content)
   - Employee ratings (Glassdoor, Blind)
   - Orlando connections (if applicable)

4. **LinkedIn Connection Mapping** (1 page)
   - Direct path: You → Connection → Hiring Manager
   - Alternative paths (2nd-degree, 3rd-degree)
   - Strongest connection identified
   - Referral email template
   - Orlando professional network (Valencia alumni, local tech community)

5. **Culture Check** (1 page)
   - Overall rating X/10
   - Pros/cons from employee reviews
   - Work-life balance, management quality, growth opportunities
   - Comparison to industry norms
   - Remote work policy (if staying in Orlando)

6. **Compensation Analysis** (1 page)
   - Market salary range for role
   - Your positioning (experience → top of range)
   - Equity value calculator (0.2% at $18M valuation = $36k)
   - Benefits comparison
   - Orlando cost-of-living adjustment (if relocating from SF/NYC)

7. **Interview Preparation** (1 page)
   - Hiring manager's likely questions (based on background)
   - CEO's likely questions (if applicable)
   - Your competitive edge
   - Questions to ask them

8. **Strategic Positioning** (1 page)
   - Lead with X (your strongest asset)
   - Frame layoff/gap like this
   - Key talking points
   - If Orlando employer: "Excited to contribute to Orlando's tech ecosystem"

**API Call (Multi-Stage Research Agent):**
```javascript
async function generateTier3JobPocket(jobId, userId) {
  const job = await fetchJob(jobId);
  const user = await fetchUser(userId);
  
  // Stage 1: Company Research (30 seconds)
  const companyData = await deepResearchCompany(job.company);
  
  // Stage 2: Hiring Manager Research (60 seconds)
  const hiringManagerData = await researchHiringManager(job.hiring_manager);
  
  // Stage 3: LinkedIn Connection Mapping (60 seconds)
  const linkedinData = await mapLinkedInConnections(user.linkedin_profile, hiringManagerData.linkedin_url);
  
  // Stage 4: Culture & Compensation Research (60 seconds)
  const cultureData = await researchCompanyCulture(job.company);
  const compensationData = await researchCompensation(job.title, job.location);
  
  // Stage 5: Generate 8-page report (90 seconds)
  const prompt = buildTier3Prompt({
    job,
    user,
    companyData,
    hiringManagerData,
    linkedinData,
    cultureData,
    compensationData
  });
  
  const response = await gemini3ProDeepResearch({
    model: "gemini-3-pro-deep-research",
    prompt: prompt,
    temperature: 0.4,
    max_tokens: 4000 // Long-form report
  });
  
  const pocket = parseTier3Response(response);
  
  await storePocket({
    user_id: userId,
    job_id: jobId,
    tier: 3,
    content: pocket,
    created_at: new Date()
  });
  
  return pocket;
}
```

**Deep Research Functions:**
```javascript
async function deepResearchCompany(companyName) {
  const queries = [
    `${companyName} funding series B valuation`,
    `${companyName} CEO background`,
    `${companyName} revenue growth 2024`,
    `${companyName} Orlando office remote work`
  ];
  
  const results = await Promise.all(
    queries.map(q => googleSearch({ query: q, num_results: 5 }))
  );
  
  // Extract structured data from search results
  return {
    funding_status: extractFundingData(results[0]),
    ceo_background: extractCEOData(results[1]),
    revenue_growth: extractRevenueData(results[2]),
    orlando_presence: extractLocationData(results[3])
  };
}

async function mapLinkedInConnections(userLinkedIn, hiringManagerLinkedIn) {
  const connections = await linkedInAPI.getConnections(userLinkedIn);
  
  // Find shortest path to hiring manager
  const paths = connections.filter(c => 
    c.connections.some(cc => cc.profile_url === hiringManagerLinkedIn)
  );
  
  return {
    direct_connections: paths.length,
    strongest_path: paths[0], // Highest connection strength
    referral_template: generateReferralEmail(paths[0])
  };
}
```

**Usage Limits:**
- Premium Tier: 5 Tier 3 Pockets per month
- Cached for 14 days
- AI cost per pocket: ~$0.30 (Gemini 3 Pro Deep Research + multiple API calls)

**Strategic Use Guidance:**
```jsx
function Tier3PocketUsage({ remainingPockets }) {
  return (
    <div className="pocket-strategy-premium">
      <h3>💎 You have {remainingPockets}/5 Tier 3 Career Pockets</h3>
      <p>These are your secret weapon. Use them on:</p>
      <ul>
        <li>✓ Director/VP roles you're highly qualified for</li>
        <li>✓ Companies where you have LinkedIn connections</li>
        <li>✓ Jobs with $80k+ salary (maximize ROI)</li>
        <li>✓ Orlando employers you want to stay local with</li>
      </ul>
      <p>💡 Tip: Don't waste pockets on jobs you're "meh" about. Save them for dream roles.</p>
    </div>
  );
}
```

---

## Core Platform Features (All Tiers)

### 7. Scam Shield (Deterministic Protection)

**Purpose:** Protect users from employment scams using rules-based detection

**Threat Model:**
- **CRITICAL** (auto-block): Upfront payment, check cashing, wire transfer
- **HIGH** (warning + gate): Vague description, no company info, unrealistic salary
- **MEDIUM** (warning only): Remote emphasis, quick hiring, personal email
- **LOW** (no warning): Clean job listing

**Detection Rules:**
```javascript
const SCAM_RULES = {
  CRITICAL: [
    {
      id: 'upfront_payment',
      pattern: /(pay|send|wire|transfer|deposit|fee|training materials|starter kit|background check fee)/i,
      message: 'Legitimate employers NEVER ask for upfront payment',
      action: 'block'
    },
    {
      id: 'check_cashing',
      pattern: /(cash.*check|deposit.*check|mobile deposit|send.*back|overpayment)/i,
      message: 'Check cashing scam detected',
      action: 'block'
    },
    {
      id: 'cryptocurrency',
      pattern: /(bitcoin|crypto|cryptocurrency|wallet|blockchain)/i,
      message: 'Cryptocurrency-related job scams are common',
      action: 'block'
    }
  ],
  
  HIGH: [
    {
      id: 'vague_description',
      check: (job) => job.description.split(' ').length < 50,
      message: 'Job description is suspiciously vague (under 50 words)',
      action: 'warn_and_gate'
    },
    {
      id: 'no_company_info',
      check: (job) => !job.company_website && !job.company_linkedin,
      message: 'No verifiable company information found',
      action: 'warn_and_gate'
    },
    {
      id: 'unrealistic_salary',
      check: (job) => {
        const medianSalary = getMedianSalary(job.title, job.location);
        return job.salary_max > medianSalary * 2;
      },
      message: 'Salary is 2x above market rate - often a scam indicator',
      action: 'warn_and_gate'
    }
  ],
  
  MEDIUM: [
    {
      id: 'remote_emphasis',
      pattern: /(work from home|work remotely|no experience needed|earn from home)/i,
      message: 'Scammers often emphasize remote work to cast wide net',
      action: 'warn'
    },
    {
      id: 'personal_email',
      check: (job) => /@gmail\.com|@yahoo\.com|@hotmail\.com/.test(job.contact_email),
      message: 'Job posted with personal email (not company domain)',
      action: 'warn'
    },
    {
      id: 'university_spoofing',
      check: (job) => {
        const title = job.title.toLowerCase();
        const isUniversityRole = /university|research|assistant|student/.test(title);
        const notEduDomain = !/@.*\.edu/.test(job.contact_email);
        return isUniversityRole && notEduDomain;
      },
      message: 'University-related job but no .edu email - check for domain spoofing',
      action: 'warn'
    }
  ]
};
```

**Scam Detection Algorithm:**
```javascript
function detectScamRisk(job) {
  const risks = {
    critical: [],
    high: [],
    medium: []
  };
  
  // Check CRITICAL rules
  for (const rule of SCAM_RULES.CRITICAL) {
    if (rule.pattern.test(job.description) || rule.pattern.test(job.title)) {
      risks.critical.push({
        rule_id: rule.id,
        message: rule.message,
        action: rule.action
      });
    }
  }
  
  // If CRITICAL detected, stop (don't apply for this job)
  if (risks.critical.length > 0) {
    return {
      level: 'CRITICAL',
      risks: risks.critical,
      recommendation: 'DO NOT APPLY - This job has severe scam indicators',
      can_apply: false
    };
  }
  
  // Check HIGH rules
  for (const rule of SCAM_RULES.HIGH) {
    const triggered = rule.pattern ? 
      rule.pattern.test(job.description) : 
      rule.check(job);
      
    if (triggered) {
      risks.high.push({
        rule_id: rule.id,
        message: rule.message,
        action: rule.action
      });
    }
  }
  
  // Check MEDIUM rules
  for (const rule of SCAM_RULES.MEDIUM) {
    const triggered = rule.pattern ? 
      rule.pattern.test(job.description) : 
      rule.check(job);
      
    if (triggered) {
      risks.medium.push({
        rule_id: rule.id,
        message: rule.message,
        action: rule.action
      });
    }
  }
  
  // Determine overall risk level
  if (risks.high.length >= 2) {
    return {
      level: 'HIGH',
      risks: [...risks.high, ...risks.medium],
      recommendation: 'Proceed with EXTREME caution - multiple red flags',
      can_apply: true,
      requires_confirmation: true
    };
  } else if (risks.high.length > 0 || risks.medium.length >= 2) {
    return {
      level: 'MEDIUM',
      risks: [...risks.high, ...risks.medium],
      recommendation: 'Research this employer carefully before applying',
      can_apply: true,
      requires_confirmation: false
    };
  } else {
    return {
      level: 'LOW',
      risks: risks.medium,
      recommendation: 'No significant scam indicators detected',
      can_apply: true,
      requires_confirmation: false
    };
  }
}
```

**UI Display:**
```jsx
function ScamShieldBadge({ scamRisk }) {
  const colors = {
    CRITICAL: '#DC2626', // Red
    HIGH: '#F59E0B',     // Amber
    MEDIUM: '#FCD34D',   // Yellow
    LOW: '#10B981'       // Green
  };
  
  return (
    <div className="scam-shield-badge" style={{ borderColor: colors[scamRisk.level] }}>
      <div className="shield-icon">🛡️</div>
      <div className="shield-content">
        <h4>Scam Shield: {scamRisk.level}</h4>
        <p>{scamRisk.recommendation}</p>
        
        {scamRisk.risks.length > 0 && (
          <details className="risk-details">
            <summary>View {scamRisk.risks.length} Red Flag{scamRisk.risks.length > 1 ? 's' : ''}</summary>
            <ul>
              {scamRisk.risks.map((risk, i) => (
                <li key={i}>⚠️ {risk.message}</li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </div>
  );
}
```

**Gate for HIGH-Risk Jobs:**
```jsx
function HighRiskApplicationGate({ job, scamRisk, onProceed, onCancel }) {
  const [acknowledged, setAcknowledged] = useState(false);
  
  return (
    <div className="high-risk-gate-modal">
      <div className="warning-icon">⚠️</div>
      <h2>Warning: High Scam Risk Detected</h2>
      
      <div className="risk-summary">
        <p>This job has multiple red flags:</p>
        <ul>
          {scamRisk.risks.map((risk, i) => (
            <li key={i}>{risk.message}</li>
          ))}
        </ul>
      </div>
      
      <div className="safety-tips">
        <h3>Protect Yourself:</h3>
        <ul>
          <li>✓ Research the company independently (Google, Glassdoor)</li>
          <li>✓ Verify the company website matches the email domain</li>
          <li>✓ Never send money, gift cards, or cryptocurrency</li>
          <li>✓ Be suspicious of jobs offering high pay for little work</li>
        </ul>
      </div>
      
      <label className="acknowledgment">
        <input 
          type="checkbox" 
          checked={acknowledged}
          onChange={(e) => setAcknowledged(e.target.checked)}
        />
        I understand the risks and want to proceed anyway
      </label>
      
      <div className="gate-actions">
        <button 
          className="btn-danger" 
          onClick={onProceed}
          disabled={!acknowledged}
        >
          Proceed with Application
        </button>
        <button className="btn-secondary" onClick={onCancel}>
          Cancel (Recommended)
        </button>
      </div>
    </div>
  );
}
```

---

### 8. Shadow Calendar (Commute Time Blocking)

**Purpose:** Prevent over-commitment by auto-generating commute time between shifts

**Technical Requirements:**

**Database Schema:**
```sql
CREATE TABLE shadow_calendar_events (
  event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(user_id),
  event_type TEXT NOT NULL, -- 'work_shift', 'commute', 'interview', 'personal_commitment'
  job_id UUID REFERENCES jobs(job_id),
  title TEXT NOT NULL,
  location JSONB, -- {address, lat, lng}
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  transportation_mode TEXT, -- 'car', 'lynx', 'walk', 'rideshare'
  commute_duration_minutes INTEGER,
  lynx_route TEXT, -- If using LYNX
  is_confirmed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_shadow_calendar_user_time ON shadow_calendar_events(user_id, start_time, end_time);
```

**Auto-Generate Commute Events:**
```javascript
async function generateCommuteEvents(userId, workShift) {
  const user = await fetchUser(userId);
  const job = await fetchJob(workShift.job_id);
  
  // Calculate commute time TO work
  const commuteToWork = await calculateTransitTime(
    user.location,
    job.location,
    workShift.start_time
  );
  
  // Calculate commute time FROM work
  const commuteFromWork = await calculateTransitTime(
    job.location,
    user.location,
    workShift.end_time
  );
  
  // Create commute events
  const events = [
    {
      event_type: 'commute',
      title: `Commute to ${job.company}`,
      location: { from: user.location, to: job.location },
      start_time: subtractMinutes(workShift.start_time, commuteToWork.duration_minutes + 10), // +10 min buffer
      end_time: workShift.start_time,
      transportation_mode: user.transportation.primary_mode,
      commute_duration_minutes: commuteToWork.duration_minutes,
      lynx_route: user.uses_lynx ? commuteToWork.lynx_routes[0].route_number : null
    },
    {
      event_type: 'commute',
      title: `Commute from ${job.company}`,
      location: { from: job.location, to: user.location },
      start_time: workShift.end_time,
      end_time: addMinutes(workShift.end_time, commuteFromWork.duration_minutes + 10),
      transportation_mode: user.transportation.primary_mode,
      commute_duration_minutes: commuteFromWork.duration_minutes,
      lynx_route: user.uses_lynx ? commuteFromWork.lynx_routes[0].route_number : null
    }
  ];
  
  await insertShadowCalendarEvents(userId, events);
  
  return events;
}
```

**Conflict Detection:**
```javascript
function detectScheduleConflicts(userId, newShift) {
  const existingEvents = await fetchShadowCalendarEvents(userId, {
    start_date: newShift.date,
    end_date: newShift.date
  });
  
  // Generate hypothetical commute events for new shift
  const newCommutes = await generateCommuteEvents(userId, newShift);
  
  // Check for overlaps
  const conflicts = existingEvents.filter(existing => {
    return newCommutes.some(newEvent => 
      (newEvent.start_time < existing.end_time) && 
      (newEvent.end_time > existing.start_time)
    );
  });
  
  return {
    has_conflicts: conflicts.length > 0,
    conflicts: conflicts,
    message: conflicts.length > 0 ? 
      `This shift conflicts with ${conflicts[0].title} (including commute time)` :
      'No conflicts detected'
  };
}
```

**UI Display:**
```jsx
function ShadowCalendar({ userId, date }) {
  const [events, setEvents] = useState([]);
  
  useEffect(() => {
    fetchShadowCalendarEvents(userId, { start_date: date, end_date: date })
      .then(setEvents);
  }, [userId, date]);
  
  return (
    <div className="shadow-calendar">
      <h3>Your Schedule for {formatDate(date)}</h3>
      
      <div className="timeline">
        {events.map(event => (
          <div 
            key={event.event_id} 
            className={`event event-${event.event_type}`}
            style={{
              top: `${calculateTopPosition(event.start_time)}px`,
              height: `${calculateHeight(event.start_time, event.end_time)}px`
            }}
          >
            <div className="event-content">
              <span className="event-icon">
                {event.event_type === 'work_shift' && '💼'}
                {event.event_type === 'commute' && '🚌'}
                {event.event_type === 'interview' && '🤝'}
              </span>
              <div className="event-details">
                <h4>{event.title}</h4>
                <p>{formatTime(event.start_time)} - {formatTime(event.end_time)}</p>
                {event.lynx_route && (
                  <span className="lynx-badge">Route {event.lynx_route}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {events.length === 0 && (
        <div className="empty-state">
          <p>No events scheduled for this day</p>
        </div>
      )}
    </div>
  );
}
```

**Conflict Warning (Pre-Application):**
```jsx
function ApplicationConflictWarning({ shift, conflicts }) {
  return (
    <div className="conflict-warning">
      <div className="warning-icon">⚠️</div>
      <h3>Schedule Conflict Detected</h3>
      
      <p>This {shift.title} conflicts with:</p>
      <ul>
        {conflicts.map(conflict => (
          <li key={conflict.event_id}>
            <strong>{conflict.title}</strong><br/>
            {formatTime(conflict.start_time)} - {formatTime(conflict.end_time)}
            {conflict.commute_duration_minutes && (
              <span> (includes {conflict.commute_duration_minutes} min commute)</span>
            )}
          </li>
        ))}
      </ul>
      
      <div className="conflict-options">
        <h4>What would you like to do?</h4>
        <button onClick={() => applyAnyway()}>
          Apply Anyway (I'll figure it out)
        </button>
        <button onClick={() => skipApplication()}>
          Skip This Job (Avoid conflict)
        </button>
        <button onClick={() => viewAlternativeJobs()}>
          Show Me Jobs Without Conflicts
        </button>
      </div>
    </div>
  );
}
```

---

## Community Features

### 9. Entrepreneurship Track

**Purpose:** Offer "create jobs" path as alternative to "find job"

**When to Surface:**
- After 30 days using platform (user has tried job search)
- When user expresses frustration with applications ("I've applied to 50 jobs...")
- When user clicks "Start a Business" in navigation

**Entrepreneurship Page Content:**

```jsx
function EntrepreneurshipPage() {
  return (
    <div className="entrepreneurship-page">
      <section className="hero">
        <h1>Don't Just Find a Job. Create Jobs.</h1>
        <p>You've got the skills from Valencia. Now build something that's yours.</p>
      </section>
      
      <section className="why-orlando">
        <h2>Why Orlando Needs Your Business</h2>
        <div className="stat-cards">
          <div className="stat-card">
            <span className="big-number">68%</span>
            <p>of money spent at local businesses stays in Orlando</p>
          </div>
          <div className="stat-card">
            <span className="big-number">30%</span>
            <p>of money spent at chains leaves Orlando</p>
          </div>
          <div className="stat-card">
            <span className="big-number">$804</span>
            <p>reinvested monthly (at 100 users) into local businesses via Community Fund</p>
          </div>
        </div>
        
        <p className="mission-statement">
          When you start a business in Orlando, you're not just making money - 
          you're keeping wealth in the community that raised you.
        </p>
      </section>
      
      <section className="free-resources">
        <h2>Free Resources in Orlando</h2>
        
        <div className="resource-cards">
          <div className="resource-card">
            <h3>Florida SBDC at UCF</h3>
            <p>Free one-on-one consulting for business planning, marketing, financing</p>
            <a href="https://sbdcorlando.com" target="_blank">Visit Website →</a>
          </div>
          
          <div className="resource-card">
            <h3>SCORE Orlando</h3>
            <p>Free mentorship from experienced business owners</p>
            <a href="https://orlando.score.org" target="_blank">Visit Website →</a>
          </div>
          
          <div className="resource-card">
            <h3>Starter Studio</h3>
            <p>Orlando tech accelerator with funding + mentorship</p>
            <a href="https://starterstudio.org" target="_blank">Visit Website →</a>
          </div>
          
          <div className="resource-card">
            <h3>City of Orlando Small Business Hub</h3>
            <p>Licensing, permits, business development resources</p>
            <a href="https://orlando.gov/business" target="_blank">Visit Website →</a>
          </div>
        </div>
      </section>
      
      <section className="grants">
        <h2>Grants & Funding for Orlando Entrepreneurs</h2>
        
        <div className="grant-list">
          <div className="grant-item">
            <h3>Orange County Microbusiness Grant</h3>
            <p className="grant-amount">Up to $10,000</p>
            <p>For small businesses with 1-5 employees in Orange County</p>
            <a href="#">Learn More →</a>
          </div>
          
          <div className="grant-item">
            <h3>Black Business Investment Fund</h3>
            <p className="grant-amount">$10,000 - $50,000</p>
            <p>For Black-owned businesses in Central Florida</p>
            <a href="#">Learn More →</a>
          </div>
          
          <div className="grant-item">
            <h3>Florida First Capital</h3>
            <p className="grant-amount">Up to $150,000</p>
            <p>Small business loans for Florida entrepreneurs</p>
            <a href="#">Learn More →</a>
          </div>
          
          <div className="grant-item">
            <h3>SBA Community Advantage</h3>
            <p className="grant-amount">Up to $350,000</p>
            <p>SBA loans for underserved communities</p>
            <a href="#">Learn More →</a>
          </div>
          
          <div className="grant-item community-fund">
            <h3>🌟 Jalanea Community Fund (Coming Soon)</h3>
            <p className="grant-amount">$5,000 - $15,000</p>
            <p>Grants for businesses started by Valencia College grads. 30% of Jalanea Works revenue is reinvested here.</p>
            <span className="badge">Applications Open Q2 2026</span>
          </div>
        </div>
      </section>
      
      <section className="how-to-start">
        <h2>How to Start a Business in Florida</h2>
        
        <div className="step-by-step">
          <div className="step">
            <span className="step-number">1</span>
            <div className="step-content">
              <h3>Choose Your Business Structure</h3>
              <ul>
                <li><strong>Sole Proprietorship:</strong> Simplest, no paperwork (just use your name)</li>
                <li><strong>LLC:</strong> Protects personal assets, professional image ($125 filing fee)</li>
                <li><strong>Corporation:</strong> For larger businesses, more complex</li>
              </ul>
              <p><strong>Recommendation for most:</strong> Start as LLC</p>
            </div>
          </div>
          
          <div className="step">
            <span className="step-number">2</span>
            <div className="step-content">
              <h3>File with Florida Department of State</h3>
              <p>Visit <a href="https://dos.myflorida.com/sunbiz" target="_blank">sunbiz.org</a> to register your LLC</p>
              <p><strong>Cost:</strong> $125 filing fee + $25 registered agent (optional)</p>
              <p><strong>Timeline:</strong> 3-5 business days for approval</p>
            </div>
          </div>
          
          <div className="step">
            <span className="step-number">3</span>
            <div className="step-content">
              <h3>Get Your EIN (Tax ID)</h3>
              <p>Free from IRS, takes 10 minutes online</p>
              <a href="https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online" target="_blank">Get EIN →</a>
            </div>
          </div>
          
          <div className="step">
            <span className="step-number">4</span>
            <div className="step-content">
              <h3>Open Business Bank Account</h3>
              <p>Separate business finances from personal (required for LLC)</p>
              <p>Bring: EIN letter, LLC filing confirmation, driver's license</p>
            </div>
          </div>
          
          <div className="step">
            <span className="step-number">5</span>
            <div className="step-content">
              <h3>Get Business Licenses/Permits</h3>
              <p>Depends on business type. Check with City of Orlando.</p>
              <p><strong>Common:</strong> Occupational license ($50-300/year)</p>
            </div>
          </div>
          
          <div className="step">
            <span className="step-number">6</span>
            <div className="step-content">
              <h3>Launch & Market</h3>
              <p>Build website (free with Wix/Squarespace)</p>
              <p>Social media presence (Instagram, Facebook)</p>
              <p>Network with Orlando business community</p>
            </div>
          </div>
        </div>
        
        <div className="total-cost">
          <h3>Total Startup Cost</h3>
          <ul>
            <li>LLC Filing: $125</li>
            <li>EIN: Free</li>
            <li>Bank Account: Free (most banks)</li>
            <li>Occupational License: $50-300</li>
            <li>Website: Free-$30/month</li>
          </ul>
          <p className="total"><strong>Total: $175-$455</strong> (plus monthly website cost)</p>
        </div>
      </section>
      
      <section className="business-ideas">
        <h2>Business Ideas for Valencia College Grads</h2>
        
        <div className="idea-cards">
          <div className="idea-card">
            <h3>💼 For Interactive Design Grads</h3>
            <ul>
              <li>Graphic design studio (branding for Orlando restaurants)</li>
              <li>Social media management agency</li>
              <li>UI/UX consulting for local startups</li>
              <li>Web design for small businesses</li>
            </ul>
            <p className="potential-earnings">Potential: $40-80k/year (part-time) → $80-150k (full-time)</p>
          </div>
          
          <div className="idea-card">
            <h3>💻 For Computing & Software Grads</h3>
            <ul>
              <li>Web development agency</li>
              <li>Tech support for local businesses</li>
              <li>App development consulting</li>
              <li>IT services (setup, security, support)</li>
            </ul>
            <p className="potential-earnings">Potential: $50-100k/year (part-time) → $100-200k (full-time)</p>
          </div>
          
          <div className="idea-card">
            <h3>🎓 For Any Background</h3>
            <ul>
              <li>Event planning (weddings, corporate)</li>
              <li>Tutoring (SAT prep, college admissions)</li>
              <li>Food truck (Orlando has thriving food scene)</li>
              <li>Virtual assistant services</li>
              <li>Cleaning/organizing services</li>
            </ul>
            <p className="potential-earnings">Potential: $30-60k/year (part-time) → $60-120k (full-time)</p>
          </div>
        </div>
      </section>
      
      <section className="jalanea-forge-cta">
        <h2>Coming Soon: Jalanea Forge</h2>
        <p>Your step-by-step business launch platform</p>
        
        <div className="forge-features">
          <ul>
            <li>✓ Guided LLC formation (fill-in-the-blank templates)</li>
            <li>✓ Business plan generator (AI-assisted)</li>
            <li>✓ Grant application help (track deadlines, requirements)</li>
            <li>✓ Financial projections calculator</li>
            <li>✓ Valencia alumni mentor matching</li>
          </ul>
        </div>
        
        <button className="btn-primary btn-large">
          Join Waitlist for Jalanea Forge →
        </button>
      </section>
      
      <section className="community-fund-info">
        <h2>Community Fund: How It Works</h2>
        
        <div className="fund-explainer">
          <p>30% of every dollar Jalanea Works makes goes into the Community Fund.</p>
          <p>This fund provides grants ($5,000-$15,000) to businesses started by Valencia College grads.</p>
          
          <div className="fund-math">
            <h4>The Math:</h4>
            <ul>
              <li>100 users × $28.50 avg = <strong>$2,850/month revenue</strong></li>
              <li>30% to Community Fund = <strong>$855/month</strong></li>
              <li>Q2 2026 (3 months) = <strong>$2,565 available</strong></li>
              <li>First grants: <strong>$5,000 each</strong> (requires scaling to 200 users)</li>
            </ul>
          </div>
          
          <p className="transparency">
            <strong>Full transparency:</strong> Every transaction is logged. You can see exactly where the money goes.
          </p>
        </div>
        
        <div className="eligibility">
          <h3>Who's Eligible for Community Fund Grants?</h3>
          <ul>
            <li>✓ Valencia College graduate (any program, any year)</li>
            <li>✓ Starting or growing a business in Orlando</li>
            <li>✓ Business creates jobs for other Valencia grads (priority)</li>
            <li>✓ Used Jalanea Forge to launch business (when available)</li>
          </ul>
          <p>Applications open Q2 2026. Join the waitlist to be notified.</p>
        </div>
      </section>
    </div>
  );
}
```

---

### 10. Community Fund Infrastructure

**Purpose:** Track 30% revenue allocation and distribute grants to Valencia grad businesses

**Database Schema:**
```sql
CREATE TABLE community_fund_transactions (
  transaction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  total_revenue NUMERIC(10, 2) NOT NULL,
  community_fund_allocation NUMERIC(10, 2) NOT NULL, -- 30% of total_revenue
  operations_allocation NUMERIC(10, 2) NOT NULL,     -- 40%
  expansion_allocation NUMERIC(10, 2) NOT NULL,      -- 20%
  scholarship_allocation NUMERIC(10, 2) NOT NULL,    -- 10%
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE community_fund_balance (
  balance_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  current_balance NUMERIC(10, 2) NOT NULL,
  total_contributed NUMERIC(10, 2) NOT NULL,
  total_granted NUMERIC(10, 2) NOT NULL,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE community_fund_grants (
  grant_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  valencia_credential TEXT NOT NULL,
  business_description TEXT,
  grant_amount NUMERIC(10, 2) NOT NULL,
  awarded_date DATE,
  disbursed_date DATE,
  status TEXT NOT NULL, -- 'pending', 'approved', 'disbursed', 'rejected'
  jobs_created INTEGER DEFAULT 0,
  valencia_grads_hired INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Revenue Allocation Function:**
```javascript
async function allocateRevenue(date, totalRevenue) {
  const allocation = {
    date: date,
    total_revenue: totalRevenue,
    community_fund_allocation: totalRevenue * 0.30,
    operations_allocation: totalRevenue * 0.40,
    expansion_allocation: totalRevenue * 0.20,
    scholarship_allocation: totalRevenue * 0.10
  };
  
  // Insert transaction record
  await db.insert('community_fund_transactions', allocation);
  
  // Update Community Fund balance
  await db.query(`
    UPDATE community_fund_balance
    SET 
      current_balance = current_balance + $1,
      total_contributed = total_contributed + $1,
      last_updated = NOW()
  `, [allocation.community_fund_allocation]);
  
  return allocation;
}
```

**Transparency Dashboard:**
```jsx
function CommunityFundDashboard() {
  const [balance, setBalance] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [grants, setGrants] = useState([]);
  
  useEffect(() => {
    fetch('/api/community-fund/balance').then(r => r.json()).then(setBalance);
    fetch('/api/community-fund/transactions?limit=10').then(r => r.json()).then(setRecentTransactions);
    fetch('/api/community-fund/grants').then(r => r.json()).then(setGrants);
  }, []);
  
  return (
    <div className="community-fund-dashboard">
      <section className="fund-balance">
        <h2>Community Fund Balance</h2>
        <div className="balance-display">
          <span className="big-number">${balance?.current_balance.toLocaleString()}</span>
          <p>Available for grants</p>
        </div>
        
        <div className="fund-stats">
          <div className="stat">
            <span>${balance?.total_contributed.toLocaleString()}</span>
            <p>Total Contributed</p>
          </div>
          <div className="stat">
            <span>${balance?.total_granted.toLocaleString()}</span>
            <p>Total Granted</p>
          </div>
          <div className="stat">
            <span>{grants.filter(g => g.status === 'disbursed').length}</span>
            <p>Businesses Funded</p>
          </div>
          <div className="stat">
            <span>{grants.reduce((sum, g) => sum + g.jobs_created, 0)}</span>
            <p>Jobs Created</p>
          </div>
        </div>
      </section>
      
      <section className="recent-transactions">
        <h3>Recent Revenue Allocations</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Total Revenue</th>
              <th>Community Fund (30%)</th>
              <th>Operations (40%)</th>
              <th>Expansion (20%)</th>
              <th>Scholarships (10%)</th>
            </tr>
          </thead>
          <tbody>
            {recentTransactions.map(txn => (
              <tr key={txn.transaction_id}>
                <td>{formatDate(txn.date)}</td>
                <td>${txn.total_revenue.toFixed(2)}</td>
                <td className="highlight">${txn.community_fund_allocation.toFixed(2)}</td>
                <td>${txn.operations_allocation.toFixed(2)}</td>
                <td>${txn.expansion_allocation.toFixed(2)}</td>
                <td>${txn.scholarship_allocation.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      
      <section className="grants-awarded">
        <h3>Grants Awarded to Valencia Grad Businesses</h3>
        {grants.length === 0 ? (
          <p>No grants awarded yet. Applications open Q2 2026.</p>
        ) : (
          <div className="grant-cards">
            {grants.map(grant => (
              <div key={grant.grant_id} className="grant-card">
                <h4>{grant.business_name}</h4>
                <p className="owner">Founded by {grant.owner_name}</p>
                <p className="credential">✨ {grant.valencia_credential}</p>
                <p className="description">{grant.business_description}</p>
                <div className="grant-details">
                  <span className="amount">${grant.grant_amount.toLocaleString()} grant</span>
                  <span className="jobs">{grant.jobs_created} jobs created</span>
                  <span className="valencia-hires">{grant.valencia_grads_hired} Valencia grads hired</span>
                </div>
                <span className={`status status-${grant.status}`}>{grant.status}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
```

---

**Status:** Doc 2 sections completed:
- ✅ V1 Orlando Onboarding (5 steps)
- ✅ Orlando-Specific Features (LYNX, Valencia, Salary Calculator)
- ✅ Tier-Specific Features (Tier 1/2/3 Job Pockets, Skills Translation, Bridge Education)
- ✅ Community Features (Entrepreneurship Track, Community Fund)
- ✅ Scam Shield (deterministic protection)
- ✅ Shadow Calendar (commute time blocking)

**Remaining sections:**
- Resume Studio, Career Coach, Tracker, Apply Copilot (brief overview - details in Doc 3)
- Data Models (high-level overview - detailed schema in Doc 4)
- API Specifications (endpoint reference - implementation in Doc 4)
- Implementation Priority (build order)

---

## Additional Core Platform Features (Brief Overview)

### 11. Resume Studio

**Purpose:** Evidence-based resume generation with no hallucinated experience

**Key Features:**
- Structured Builder (no file upload required for Essential tier)
- ATS optimization with keyword scoring (38 → 82+ score)
- Valencia credential auto-highlighting
- Skills translation integration (retail → office language)
- Hybrid export (DOCX + PDF with metadata scrubbing)
- Downshift strategy for overqualified users

**Technical Approach:**
- User inputs experience via guided forms (not free-text)
- AI only enhances *existing* content (never fabricates)
- Evidence chain: Every resume bullet traceable to user input
- ATS scoring via keyword density analysis

**Implementation:** See Doc 3 (User Experience) for detailed workflows

---

### 12. Career Coach

**Purpose:** Trauma-informed guidance and rejection support

**Key Features:**
- OSKAR framework (Outcome, Scaling, Know-how, Affirm, Review)
- Maslow-aware triage (safety needs before growth goals)
- No toxic positivity ("You got this!" → "This is hard. You're not alone.")
- Interview simulator with role-specific scenarios
- Rejection recovery support (proactive after ghosting)
- Entrepreneurship guidance (when ready to explore Jalanea Forge)

**Conversation Example:**
```
User: I applied to 50 jobs and only got 2 interviews. I'm a failure.

Coach: You're not a failure. Here's what I see:
- 50 applications is SIGNIFICANT effort
- 2 interviews = 4% response rate (above 3.5% average)
- You're BEATING the baseline

Let's focus: What's one thing that went well with those 2 interviews?
```

**Implementation:** See Doc 3 (User Experience) for conversation trees

---

### 13. Tracker

**Purpose:** Application state management with emotional support

**State Machine:**
```
DISCOVERED → POCKETED → APPLIED → INTERVIEWING → OFFER | REJECTED | ARCHIVED
```

**Key Features:**
- Kanban board view (Starter/Premium) or list view (Essential)
- Daily application statistics benchmarked to tier
- Stress Workflow Planner (AI-generated daily plans)
- Enhanced rejection support with proactive trigger
- Timeline view (see entire job search journey)

**Rejection Trigger:**
```javascript
// After 14 days in APPLIED state with no response
if (application.days_since_applied > 14 && application.status === 'APPLIED') {
  // Proactively mark as ghosted
  application.status = 'REJECTED';
  application.rejection_reason = 'No response (ghosted)';
  
  // Trigger Rejection Support Coach
  sendRejectionSupport(application);
}
```

**Implementation:** See Doc 3 (User Experience) for UI flows

---

### 14. Apply Copilot

**Purpose:** External orbit tracking + pre-flight safety checks

**Workflow:**
1. User clicks "Apply" on job card
2. Pre-flight checks run:
   - Scam Shield (is this job safe?)
   - Shadow Calendar (schedule conflicts?)
   - ATS score (is resume optimized?)
3. User leaves site to apply on company website
4. System detects when user returns (navigation timing API)
5. Debrief workflow: "Did you apply? How'd it go?"
6. Captures application result (applied, skipped, rejected)

**External Orbit Tracking:**
```javascript
// Detect when user leaves site
window.addEventListener('beforeunload', (event) => {
  logExternalApplication(jobId, 'started');
});

// Detect when user returns
window.addEventListener('pageshow', (event) => {
  if (event.persisted || performance.navigation.type === 2) {
    // User returned via back button
    showDebriefModal(jobId);
  }
});
```

**Debrief Modal:**
```jsx
function ApplicationDebriefModal({ jobId }) {
  return (
    <div className="debrief-modal">
      <h3>Welcome back! How'd it go?</h3>
      
      <div className="debrief-options">
        <button onClick={() => recordResult('applied')}>
          ✓ I applied successfully
        </button>
        <button onClick={() => recordResult('technical_issues')}>
          ⚠️ Ran into technical issues
        </button>
        <button onClick={() => recordResult('skipped')}>
          → I decided to skip this job
        </button>
        <button onClick={() => recordResult('need_help')}>
          ❓ I need help applying
        </button>
      </div>
    </div>
  );
}
```

**Implementation:** See Doc 4 (Technical Architecture) for tracking mechanisms

---

## Data Models (High-Level Overview)

### Core Tables

**users**
```sql
CREATE TABLE users (
  user_id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  location JSONB, -- {address, lat, lng, zip_code}
  transportation JSONB, -- {has_car, uses_lynx, uses_rideshare, walks}
  max_commute_minutes INTEGER,
  salary_target JSONB, -- {min, max, monthly_take_home, max_rent}
  availability JSONB, -- {type, specific_days, preferred_shifts}
  challenges TEXT[],
  tier TEXT NOT NULL, -- 'essential', 'starter', 'premium'
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**credentials**
```sql
CREATE TABLE credentials (
  credential_id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(user_id),
  institution TEXT NOT NULL,
  credential_type TEXT NOT NULL,
  program TEXT NOT NULL,
  status TEXT NOT NULL, -- 'current', 'alumni', 'incomplete'
  valencia_credential BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**jobs**
```sql
CREATE TABLE jobs (
  job_id UUID PRIMARY KEY,
  source TEXT NOT NULL, -- 'indeed', 'manual', etc.
  external_id TEXT,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location JSONB, -- {address, lat, lng, zip_code}
  salary_min INTEGER,
  salary_max INTEGER,
  description TEXT,
  requirements TEXT[],
  scam_risk JSONB, -- {level, risks[], recommendation}
  lynx_accessible BOOLEAN,
  lynx_routes TEXT[],
  valencia_match_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**applications**
```sql
CREATE TABLE applications (
  application_id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(user_id),
  job_id UUID REFERENCES jobs(job_id),
  status TEXT NOT NULL, -- 'discovered', 'pocketed', 'applied', 'interviewing', 'offer', 'rejected', 'archived'
  applied_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**job_pockets**
```sql
CREATE TABLE job_pockets (
  pocket_id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(user_id),
  job_id UUID REFERENCES jobs(job_id),
  tier INTEGER NOT NULL, -- 1, 2, 3
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**lynx_routes** (Orlando-specific)
```sql
CREATE TABLE lynx_routes (
  route_id TEXT PRIMARY KEY,
  route_number TEXT NOT NULL,
  route_name TEXT NOT NULL,
  route_type TEXT,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE lynx_stops (
  stop_id TEXT PRIMARY KEY,
  stop_name TEXT NOT NULL,
  lat NUMERIC(10, 7) NOT NULL,
  lng NUMERIC(10, 7) NOT NULL,
  zip_code TEXT
);
```

**valencia_programs** (Valencia-specific)
```sql
CREATE TABLE valencia_programs (
  program_id TEXT PRIMARY KEY,
  program_name TEXT NOT NULL,
  program_type TEXT,
  school TEXT,
  career_pathway TEXT,
  keywords TEXT[],
  typical_salary_range INT4RANGE
);
```

**community_fund_transactions**
```sql
CREATE TABLE community_fund_transactions (
  transaction_id UUID PRIMARY KEY,
  date DATE NOT NULL,
  total_revenue NUMERIC(10, 2) NOT NULL,
  community_fund_allocation NUMERIC(10, 2) NOT NULL,
  operations_allocation NUMERIC(10, 2) NOT NULL,
  expansion_allocation NUMERIC(10, 2) NOT NULL,
  scholarship_allocation NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**For complete database schema see Doc 4: Technical Architecture**

---

## API Specifications (Quick Reference)

### External APIs

**Indeed Job Search API**
- Endpoint: `https://api.indeed.com/ads/apisearch`
- Rate Limit: 1000 calls/day
- Cost: Free (with API key)
- Used for: Job discovery, job details

**Google Maps API**
- Directions API (transit mode): Calculate LYNX commute times
- Geocoding API: Convert addresses to lat/lng
- Rate Limit: 40,000 requests/month free tier
- Cost: $0.005 per request after free tier
- Used for: Transit time calculation, commute mapping

**LinkedIn API**
- Endpoint: `https://api.linkedin.com/v2/`
- Auth: OAuth 2.0
- Used for: Connection mapping (Premium tier only)
- Rate Limit: 500 calls/day

**Gemini AI API**
- Models: Gemini 3 Flash (Essential/Starter), Gemini 3 Pro Deep Research (Premium)
- Cost: ~$0.01/call (Flash), ~$0.30/call (Pro Deep Research)
- Used for: Job Pockets, Resume Studio, Skills Translation, Career Coach

### Internal APIs (Supabase Edge Functions)

**POST /api/onboarding/complete**
- Finalizes onboarding, creates user profile
- Input: Onboarding data (5 steps)
- Output: User profile + tier assignment

**GET /api/jobs/search**
- Search jobs with constraint filtering
- Input: Location, salary, transportation, commute, etc.
- Output: Ranked job list with LYNX data, Valencia match scores

**POST /api/job-pocket/generate**
- Generate Tier 1/2/3 Job Pocket
- Input: Job ID, User ID, Tier
- Output: Job Pocket content (JSON)

**POST /api/resume/optimize**
- ATS optimization
- Input: Resume content
- Output: Optimized resume + ATS score

**POST /api/skills-translation/translate**
- Transform retail → office language
- Input: Current role, responsibilities
- Output: Transformed responsibilities + keywords

**GET /api/shadow-calendar/events**
- Fetch Shadow Calendar events
- Input: User ID, date range
- Output: Events (work shifts + commute blocks)

**POST /api/community-fund/allocate**
- Allocate revenue (30% Community Fund)
- Input: Date, total revenue
- Output: Allocation breakdown

**For complete API documentation see Doc 4: Technical Architecture**

---

## Implementation Priority

### Phase 1: Foundation (Weeks 1-4)

**Core Infrastructure:**
1. Next.js 14 app scaffold (App Router)
2. Supabase setup (PostgreSQL + Auth + RLS)
3. Passkey authentication (FIDO2/WebAuthn)
4. Basic responsive layout (mobile-first)
5. User profile database schema
6. Orlando-specific data models (LYNX, Valencia, salary data)

**V1 Orlando Onboarding:**
1. Step 1: Your Foundation (name, location, credentials)
2. Step 1.5: Education (Valencia credential detection)
3. Step 2: Mission Logistics (LYNX/car, commute, availability)
4. Step 3: Salary Target (Orlando Budget Calculator)
5. Step 4: Common Challenges (barriers)
6. Step 5: Goal Selection (tier assignment)

**Orlando Data Population:**
1. LYNX routes database (Routes 36, 50, 18, 8, 125)
2. LYNX stops database (all active stops)
3. Valencia programs database (BAS, AS, certificates)
4. Orlando rent data (studio, 1br, 2br, 3br by zip code)
5. Orlando employers database (Publix, Wawa, Universal, Disney, AdventHealth, EA, etc.)

---

### Phase 2: Core Features (Weeks 5-8)

**Jobs Hub:**
1. Indeed API integration
2. Job discovery with Orlando-specific filtering
3. LYNX route calculation (Google Maps API)
4. Valencia credential matching
5. Scam Shield (deterministic rules)
6. Job Card UI (with LYNX badges, Valencia match scores)

**Job Pockets:**
1. Tier 1 (20-second) - Essential tier
2. Tier 2 (90-second) - Starter tier (with Culture Check)
3. Tier 3 (5-10 minute) - Premium tier (8-page report)

**Shadow Calendar:**
1. Basic version (commute time blocking)
2. LYNX transit time integration
3. Conflict detection
4. Calendar UI (timeline view)

**Apply Copilot:**
1. External orbit tracking
2. Pre-flight safety checks
3. Debrief workflow
4. Application result capture

**Tracker:**
1. State machine (DISCOVERED → APPLIED → OFFER/REJECTED)
2. Basic list view (Essential)
3. Kanban board view (Starter/Premium)
4. Rejection support trigger

---

### Phase 3: AI-Powered Features (Weeks 9-11)

**Resume Studio:**
1. Structured Builder (no file upload)
2. Evidence-based generation
3. ATS optimization (keyword scoring)
4. Valencia credential highlighting
5. Hybrid export (DOCX + PDF)

**Skills Translation Engine:**
1. Retail → office/tech transformation
2. Before/after comparison UI
3. ATS keyword suggestions
4. Apply to resume workflow

**Bridge Role Education:**
1. Content pages (bridge vs dead-end)
2. Interactive quiz
3. Orlando bridge employers list

**Tier 2 Bridge Job Pockets:**
1. Company research (Google Search grounding)
2. Culture Check scoring
3. 7-section report

**Tier 3 Career Job Pockets:**
1. Deep Research agent (Gemini 3 Pro)
2. Company overview, hiring manager intel
3. LinkedIn connection mapping
4. 8-page comprehensive report

**Career Coach:**
1. OSKAR conversation framework
2. Rejection support messaging
3. Interview simulator (basic)

**Stress Workflow Planner:**
1. AI-generated daily plans (8 apps/day)
2. Encouragement messaging
3. Progress tracking

---

### Phase 4: Community Features (Week 11-12)

**Entrepreneurship Track:**
1. "Start a Business" page content
2. Orlando resources list (SBDC, SCORE, Starter Studio)
3. Grants database (Orange County, BBIF, SBA)
4. How to Start a Business guide (6 steps)
5. Business ideas for Valencia grads
6. Jalanea Forge waitlist signup

**Community Fund:**
1. Revenue allocation function (30% automatic)
2. Transaction logging (every dollar tracked)
3. Community Fund balance dashboard
4. Transparency page (show where money goes)
5. Grant application infrastructure (opens Q2 2026)

---

### Phase 5: Polish & Launch (Week 12)

**Testing:**
1. User testing with 20-30 beta users (Valencia College partnerships)
2. Mobile testing on actual devices (3G network)
3. Accessibility audit (WCAG 2.2 Level AA)
4. Cross-browser testing (Chrome, Safari, Firefox)

**Performance Optimization:**
1. Bundle size optimization (<200KB)
2. Image optimization (WebP, lazy loading)
3. API caching strategies
4. Database query optimization

**Launch Prep:**
1. Valencia College partnerships (Career Services, SBDC)
2. Beta user recruitment (100 Valencia students/alumni)
3. Documentation (help articles, video tutorials)
4. Support infrastructure (email, chat, FAQ)

---

### Post-Launch (V1.1+)

**V1.1 (Month 3):**
- Contact Finder (LinkedIn scraping)
- Google Voice integration
- Advanced cover letter generator
- Financial coaching
- Post-hire support (90-day check-ins)

**V1.2 (Month 6):**
- Tampa launch (USF, Hillsborough Community College)
- Jacksonville launch (FCCJ, UNF)
- Miami launch (MDC, FIU)
- Multi-city transit integration

**V2.0 (Month 12):**
- Mobile app (iOS/Android native)
- Multi-language support (Spanish, Haitian Creole)
- Advanced analytics dashboard
- Referral program automation
- White-label platform (other cities can replicate)

---

## Document Summary

**Doc 2: Project Requirements - COMPLETE**

**What's Covered:**
1. ✅ V1 Orlando Onboarding Flow (5 steps, fully specified with UI mockups)
2. ✅ Orlando-Specific Features (LYNX transit, Valencia credentials, salary calculator)
3. ✅ Tier-Specific Features (Tier 1/2/3 Job Pockets, Skills Translation, Bridge Education)
4. ✅ Core Platform Features (Scam Shield, Shadow Calendar, Apply Copilot, Resume Studio, Career Coach, Tracker)
5. ✅ Community Features (Entrepreneurship Track, Community Fund infrastructure)
6. ✅ Data Models (high-level overview of key tables)
7. ✅ API Specifications (external + internal endpoints)
8. ✅ Implementation Priority (what to build in which order)

**What's NOT Covered (See Other Docs):**
- Detailed user flows & wireframes → Doc 3: User Experience
- Database schema (complete) → Doc 4: Technical Architecture
- API implementation details → Doc 4: Technical Architecture
- System design & infrastructure → Doc 4: Technical Architecture
- Legal compliance & safeguards → Doc 5: Compliance & Safeguards

**Next Steps:**
- Doc 3: User Experience (detailed user journeys, wireframes, interaction patterns)
- Doc 4: Technical Architecture (system design, database schema, API implementation, infrastructure)
- Doc 5: Compliance & Safeguards (GDPR, ADA, privacy, security, content moderation)

---

*Document Version: 1.0*  
*Last Updated: January 12, 2026*  
*Created By: Alexus (Founder, Jalanea Works)*  
*Purpose: Feature specifications for Claude Code to build Jalanea Works V1*

