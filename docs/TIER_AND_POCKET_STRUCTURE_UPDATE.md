# TIER_AND_POCKET_STRUCTURE_UPDATE.md
*Critical Updates to Jalanea Works Platform*
**For: Claude Code (Development)**
**Date: January 16, 2026**

---

## 🚨 IMPORTANT CHANGES TO IMPLEMENT

This document supersedes pricing and job pocket information in previous docs. These are the **FINAL, LOCKED-IN** specifications.

---

## 1. TIER STRUCTURE (UPDATED)

### **Previous Tiers (DEPRECATED):**
- ❌ Essential: $15/mo
- ❌ Starter: $25/mo (NOT IN ORIGINAL DOCS)
- ❌ Premium: $75/mo
- ❌ Unlimited: $150/mo

### **NEW Tiers (USE THESE):**

| Tier | Price | Monthly Revenue Target | Target User |
|------|-------|----------------------|-------------|
| **Essential** | **$15/month** | Survival Mode | Urgent income needs (fast food, retail, warehouse) |
| **Starter** | **$25/month** | Bridge Mode | Strategic job search (admin, customer service, entry office) |
| **Professional** | **$50/month** | Career Mode | Professional roles ($25-40/hr: UX, PM, Analyst) |
| **Max** | **$100/month** | High-Stakes Mode | Senior roles ($60k-100k+: Director, Senior PM, specialized) |

**Key Changes:**
- ✅ "Premium" renamed to "Professional"
- ✅ "Unlimited" renamed to "Max"
- ✅ Professional tier reduced from $75 → $50
- ✅ Max tier reduced from $150 → $100

---

## 2. JOB POCKET STRUCTURE (MAJOR UPDATE)

### **Previous Structure (DEPRECATED):**
- ❌ Tier 1 Job Pockets (20-second intel)
- ❌ Tier 2 Job Pockets (2-minute intel)
- ❌ Tier 3 Job Pockets (12-page deep research)

### **NEW Structure (USE THIS):**

There are now **THREE levels** of job pockets:

---

### **🔵 Level 1: REGULAR JOB POCKET (Free)**

**Available to:** All tiers (Essential, Starter, Professional, Max)

**What it includes:**
- Basic application tracking
- Status timeline (Discovered → Applied → Interviewing → Offer/Rejected)
- ATS keyword score (user's resume vs this job)
- Private notes section
- Tags (Survival Mode, Bridge Mode, Career Mode)
- Scam Shield check (automatic)

**Limits per tier:**
- Essential: 30 regular pockets max
- Starter: 100 regular pockets max
- Professional: Unlimited
- Max: Unlimited

**Cost to us:** $0 (no AI generation, just database storage)

**Implementation:**
```typescript
interface RegularJobPocket {
  id: string;
  user_id: string;
  job_id: string;
  status: 'discovered' | 'applied' | 'interviewing' | 'offer_received' | 'offer_accepted' | 'rejected' | 'withdrawn';
  ats_score: number; // 0-100
  notes: string;
  tags: ('survival' | 'bridge' | 'career')[];
  scam_check: {
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    flags: string[];
  };
  created_at: Date;
  updated_at: Date;
}
```

---

### **⭐ Level 2: ADVANCED JOB POCKET (Medium Depth)**

**Available to:** Starter (1/mo), Professional (5/mo*), Max (10/mo*)

**What it includes:**
- Everything in Regular Pocket, PLUS:
- **Company Overview** (size, industry, culture snapshot)
- **Why They're Hiring** (growth? replacement? new role?)
- **What They Really Want** (decode job description)
- **Culture Check** (work environment, dress code, vibe)
- **Application Strategy** (how to position user's background)
- **Interview Prep** (5-7 common questions for this role)
- **Red Flags Check** (deeper than basic Scam Shield)

**Generation Details:**
- AI Model: Gemini 3 Flash
- Generation Time: 2-3 minutes
- Cost to us: ~$0.50-1.00 per pocket
- À la carte price: $5 (if user wants to buy extra)

**Credits per tier:**
- Essential: 0 (cannot access)
- Starter: 1 per month
- Professional: 5 per month* (can mix with Professional Pockets)
- Max: 10 per month* (can mix with Professional Pockets)

**\* Professional and Max users can choose to spend their monthly credits on EITHER Advanced OR Professional Pockets (or mix).**

**Example Professional tier user:**
- Has 5 credits/month
- Can use: 3 Professional + 2 Advanced = 5 total
- Or: 5 Advanced + 0 Professional = 5 total
- Or: 2 Professional + 3 Advanced = 5 total

**Implementation:**
```typescript
interface AdvancedJobPocket {
  id: string;
  user_id: string;
  job_id: string;
  type: 'advanced'; // to distinguish from professional
  content: {
    company_overview: string;
    why_hiring: string;
    what_they_want: string;
    culture_check: string;
    application_strategy: string;
    interview_prep: {
      questions: string[];
      tips: string;
    };
    red_flags: string[];
  };
  generated_by: 'gemini-3-flash';
  generation_time_ms: number;
  created_at: Date;
  expires_at: Date; // 7 days from creation
}
```

---

### **💎 Level 3: PROFESSIONAL LEVEL JOB POCKET (Deep Research)**

**Available to:** Professional (5/mo*), Max (10/mo*)

**What it includes:**
- Everything in Advanced Pocket, PLUS:
- **12-Page Deep Research Report:**
  - Hiring manager profile (if name in posting)
  - LinkedIn connection mapping
  - Compensation analysis (market rate, negotiation range)
  - Interview process intel (how many rounds, what to expect)
  - Company deep-dive (financials, news, red flags, growth trajectory)
  - Barrier-friendliness score (criminal record policy, employment gaps, credit checks)
  - Competitive intelligence (who else they're hiring, what it means)
- **Custom Resume Optimization** (tailored to THIS specific job)
- **Cover Letter Outline** (3 paragraphs, talking points)
- **Salary Negotiation Strategy** (when to bring it up, how to counter)
- **Follow-up Templates** (thank you email, check-in messages)

**Generation Details:**
- AI Model: Gemini 2.5 Pro Deep Research
- Generation Time: 5-10 minutes
- Cost to us: ~$2.50-5.00 per pocket
- À la carte price: $10 (if user wants to buy extra)

**Credits per tier:**
- Essential: 0 (cannot access)
- Starter: 0 (cannot access, must upgrade to Professional)
- Professional: 5 per month* (can mix with Advanced)
- Max: 10 per month* (can mix with Advanced)

**Implementation:**
```typescript
interface ProfessionalJobPocket {
  id: string;
  user_id: string;
  job_id: string;
  type: 'professional'; // to distinguish from advanced
  content: {
    // Everything from Advanced, PLUS:
    deep_research_report: {
      hiring_manager: {
        name: string | null;
        title: string | null;
        linkedin_url: string | null;
        background: string;
      };
      linkedin_connections: {
        mutual_connections: number;
        path_to_hiring_manager: string | null;
      };
      compensation_analysis: {
        market_rate_min: number;
        market_rate_max: number;
        negotiation_range: string;
        benefits_overview: string;
      };
      interview_process: {
        rounds: number;
        round_details: string[];
        timeline: string;
      };
      company_deepdive: {
        financials: string;
        recent_news: string[];
        red_flags: string[];
        growth_trajectory: string;
      };
      barrier_friendliness: {
        score: number; // 0-10
        criminal_record_policy: string;
        employment_gap_tolerance: string;
        credit_check: boolean;
      };
      competitive_intel: string;
    };
    resume_optimization: {
      original_resume_id: string;
      optimized_resume: any; // Resume object
      changes_made: string[];
    };
    cover_letter_outline: {
      paragraph_1: string;
      paragraph_2: string;
      paragraph_3: string;
      talking_points: string[];
    };
    salary_negotiation: {
      when_to_discuss: string;
      how_to_counter: string;
      scripts: string[];
    };
    follow_up_templates: {
      thank_you_email: string;
      check_in_message: string;
      acceptance_email: string;
    };
  };
  generated_by: 'gemini-2.5-pro-deep-research';
  generation_time_ms: number;
  created_at: Date;
  expires_at: Date; // 7 days from creation
}
```

---

## 3. À LA CARTE POCKET PURCHASES

**Users can buy extra pockets if they run out of monthly credits:**

| Pocket Type | À La Carte Price | Our Cost | Our Profit | Margin |
|-------------|------------------|----------|------------|--------|
| Advanced Pocket | $5 | $1 | $4 | 80% |
| Professional Pocket | $10 | $5 | $5 | 50% |

**Who can buy:**
- Essential: Cannot buy (no access to Advanced/Professional features)
- Starter: Can buy Advanced only ($5 each)
- Professional: Can buy Advanced ($5) or Professional ($10)
- Max: Can buy Advanced ($5) or Professional ($10)

**Implementation:**
```typescript
// API endpoint: POST /api/job-pockets/purchase
interface PurchasePocketRequest {
  type: 'advanced' | 'professional';
  job_id: string;
}

interface PurchasePocketResponse {
  success: boolean;
  pocket_id: string;
  charge_amount: number; // $5 or $10
  remaining_credits: {
    advanced: number;
    professional: number;
  };
}
```

**Purchase Flow:**
1. User clicks "Upgrade to Advanced/Professional Pocket" on a job
2. Check if user has monthly credits remaining
3. If yes: Use credit (free)
4. If no: Show purchase modal "Buy 1 Advanced Pocket for $5"
5. User confirms → Stripe payment → Generate pocket

---

## 4. POCKET CREDIT TRACKING

**Database table: `pocket_credits`**

```sql
CREATE TABLE pocket_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  tier TEXT NOT NULL, -- 'essential', 'starter', 'professional', 'max'
  month DATE NOT NULL, -- First day of month (e.g., 2026-01-01)
  
  -- Monthly allowance (based on tier)
  advanced_allowance INT NOT NULL, -- 0, 1, 5, or 10
  professional_allowance INT NOT NULL, -- 0, 0, 5, or 10
  
  -- Credits used this month
  advanced_used INT DEFAULT 0,
  professional_used INT DEFAULT 0,
  
  -- Purchased extras (à la carte)
  advanced_purchased INT DEFAULT 0,
  professional_purchased INT DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, month)
);
```

**Logic:**
```typescript
// Check if user can generate pocket
async function canGeneratePocket(
  userId: string, 
  pocketType: 'advanced' | 'professional'
): Promise<{ allowed: boolean; requires_payment: boolean }> {
  
  const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
  const credits = await db.pocketCredits.findUnique({
    where: { user_id_month: { user_id: userId, month: currentMonth } }
  });
  
  if (!credits) {
    // Create credits record for new month
    const user = await db.users.findUnique({ where: { id: userId } });
    credits = await createMonthlyCredits(user);
  }
  
  const allowance = pocketType === 'advanced' 
    ? credits.advanced_allowance 
    : credits.professional_allowance;
    
  const used = pocketType === 'advanced'
    ? credits.advanced_used
    : credits.professional_used;
    
  const purchased = pocketType === 'advanced'
    ? credits.advanced_purchased
    : credits.professional_purchased;
  
  const remaining = (allowance + purchased) - used;
  
  if (remaining > 0) {
    return { allowed: true, requires_payment: false };
  } else {
    // User needs to purchase
    return { allowed: true, requires_payment: true };
  }
}
```

---

## 5. IRREVERSIBLE UPGRADE WARNING

**CRITICAL: Once a user upgrades a Regular Pocket to Advanced or Professional, they CANNOT undo it.**

**UI Flow:**
1. User views Regular Job Pocket
2. Clicks "Upgrade to Advanced" or "Upgrade to Professional"
3. **Show confirmation modal:**

```typescript
// Confirmation modal
const UpgradeConfirmationModal = ({ pocketType, jobTitle, remainingCredits }) => {
  return (
    <Modal>
      <h2>⚠️ Upgrade Job Pocket to {pocketType}?</h2>
      <p>Job: <strong>{jobTitle}</strong></p>
      
      <div className="warning-box">
        <strong>This cannot be undone.</strong>
        <p>Once upgraded, this pocket will use 1 of your {remainingCredits} remaining {pocketType} credits this month.</p>
        <p>Make sure this is a job you're serious about applying to.</p>
      </div>
      
      <div className="what-you-get">
        <h3>What you'll get:</h3>
        {pocketType === 'advanced' ? (
          <ul>
            <li>Company overview & culture check</li>
            <li>Application strategy</li>
            <li>Interview prep (5-7 questions)</li>
            <li>Generation time: 2-3 minutes</li>
          </ul>
        ) : (
          <ul>
            <li>Everything in Advanced, PLUS:</li>
            <li>12-page deep research report</li>
            <li>Custom resume optimization</li>
            <li>Cover letter outline</li>
            <li>Salary negotiation strategy</li>
            <li>Generation time: 5-10 minutes</li>
          </ul>
        )}
      </div>
      
      <div className="actions">
        <button onClick={cancel}>Cancel</button>
        <button onClick={confirmUpgrade} className="danger">
          Yes, Upgrade to {pocketType}
        </button>
      </div>
    </Modal>
  );
};
```

4. User confirms → Generate pocket (irreversible)
5. Decrement their credits
6. Show generation progress (2-3 min for Advanced, 5-10 min for Professional)

---

## 6. REFUND POLICY

**We WILL refund credits in these cases:**

### **✅ Automatic Refunds (no user action required):**

1. **Technical Failure**
   - Research fails to generate (API error, timeout)
   - Report is incomplete or corrupted
   - Action: Automatic credit refund + apology email

2. **Scam Shield Override**
   - User upgrades pocket to Advanced/Professional
   - AFTER generation, Scam Shield flags job as CRITICAL scam
   - Action: Automatic credit refund + warning email

**Implementation:**
```typescript
// After pocket generation
async function postGenerationChecks(pocketId: string) {
  const pocket = await db.jobPockets.findUnique({ where: { id: pocketId } });
  const job = await db.jobs.findUnique({ where: { id: pocket.job_id } });
  
  // Check if Scam Shield now flags as CRITICAL
  const scamCheck = await runScamShield(job);
  
  if (scamCheck.severity === 'CRITICAL') {
    // Automatic refund
    await refundPocketCredit(pocket.user_id, pocket.type);
    
    // Send warning email
    await sendEmail({
      to: pocket.user.email,
      subject: 'Job Pocket Refunded - Scam Detected',
      body: `We've refunded your ${pocket.type} pocket credit for "${job.title}" 
             because our Scam Shield detected critical scam indicators after 
             deep research. Please avoid applying to this job.`
    });
    
    // Mark pocket as refunded
    await db.jobPockets.update({
      where: { id: pocketId },
      data: { refunded: true, refund_reason: 'scam_detected' }
    });
  }
}
```

### **✅ Manual Refunds (user must request within 24 hours):**

3. **Duplicate Job Posting**
   - User upgrades Job A to Advanced/Professional
   - Discovers Job A and Job B are same role (duplicate posting)
   - User can request refund within 24 hours

4. **One-Time Grace Refund**
   - User can request ONE refund per year within 24 hours of generation
   - Must provide reason: "Research quality was poor" or "Job requirements changed"
   - Manual review → refund if legitimate

**Implementation:**
```typescript
// Refund request endpoint: POST /api/job-pockets/:id/refund
interface RefundRequest {
  reason: 'duplicate_job' | 'poor_quality' | 'requirements_changed' | 'other';
  explanation: string;
}

async function handleRefundRequest(pocketId: string, request: RefundRequest) {
  const pocket = await db.jobPockets.findUnique({ where: { id: pocketId } });
  
  // Check if within 24 hours
  const hoursSinceGeneration = (Date.now() - pocket.created_at.getTime()) / (1000 * 60 * 60);
  if (hoursSinceGeneration > 24) {
    return { success: false, error: 'Refund window expired (24 hours)' };
  }
  
  // Check if user has already used grace refund this year
  const currentYear = new Date().getFullYear();
  const graceRefundsThisYear = await db.jobPockets.count({
    where: {
      user_id: pocket.user_id,
      refunded: true,
      refund_reason: 'grace_refund',
      created_at: {
        gte: new Date(`${currentYear}-01-01`),
        lt: new Date(`${currentYear + 1}-01-01`)
      }
    }
  });
  
  if (request.reason === 'other' && graceRefundsThisYear >= 1) {
    return { success: false, error: 'You have already used your one-time grace refund this year' };
  }
  
  // Process refund
  await refundPocketCredit(pocket.user_id, pocket.type);
  await db.jobPockets.update({
    where: { id: pocketId },
    data: { 
      refunded: true, 
      refund_reason: request.reason === 'other' ? 'grace_refund' : request.reason,
      refund_explanation: request.explanation
    }
  });
  
  return { success: true };
}
```

### **❌ We WILL NOT refund:**

1. User changed their mind about the job
2. User didn't get hired (we provide research, not guarantees)
3. User expected different information
4. After 24 hours have passed

---

## 7. PROFIT MARGINS (For Business Logic)

**Cost & Profit per tier:**

| Tier | Price | Cost to Us | Profit | Margin |
|------|-------|------------|--------|--------|
| Essential | $15 | $5-8 | $7-10 | 47-67% |
| Starter | $25 | $12.50 | $12.50 | 50% |
| Professional | $50 | $29.65 | $20.35 | 41% |
| Max | $100 | $56 | $44 | 44% |

**Cost breakdown per tier:**

### **Essential:**
- AI messages: ~$0.05 (negligible)
- Infrastructure: ~$5-8
- Advanced/Professional Pockets: $0
- **Total: $5-8**

### **Starter:**
- AI messages: ~$3.50
- 1 Advanced Pocket: ~$1
- Infrastructure: ~$8
- **Total: $12.50**

### **Professional:**
- AI messages: ~$2.65
- 5 Pockets (avg 3 Professional + 2 Advanced): ~$17
- Infrastructure: ~$10
- **Total: $29.65**

### **Max:**
- AI messages: ~$4
- 10 Pockets (avg 6 Professional + 4 Advanced): ~$34
- Infrastructure: ~$10
- Success coach: ~$5
- Advanced analytics: ~$3
- **Total: $56**

---

## 8. DATABASE SCHEMA UPDATES

**New tables to create:**

### **pocket_credits table:**
```sql
CREATE TABLE pocket_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  tier TEXT NOT NULL,
  month DATE NOT NULL,
  advanced_allowance INT NOT NULL,
  professional_allowance INT NOT NULL,
  advanced_used INT DEFAULT 0,
  professional_used INT DEFAULT 0,
  advanced_purchased INT DEFAULT 0,
  professional_purchased INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month)
);
```

### **job_pockets table (updated):**
```sql
ALTER TABLE job_pockets ADD COLUMN IF NOT EXISTS pocket_type TEXT; 
-- 'regular', 'advanced', 'professional'

ALTER TABLE job_pockets ADD COLUMN IF NOT EXISTS refunded BOOLEAN DEFAULT FALSE;

ALTER TABLE job_pockets ADD COLUMN IF NOT EXISTS refund_reason TEXT;
-- 'technical_failure', 'scam_detected', 'duplicate_job', 'grace_refund'

ALTER TABLE job_pockets ADD COLUMN IF NOT EXISTS refund_explanation TEXT;

ALTER TABLE job_pockets ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
-- 7 days from creation
```

### **users table (updated):**
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'essential';
-- 'essential', 'starter', 'professional', 'max'
```

---

## 9. API ENDPOINTS TO UPDATE

### **Update these endpoints:**

1. **POST /api/job-pockets/upgrade**
   - Body: `{ job_id, pocket_type: 'advanced' | 'professional' }`
   - Check credits
   - Show payment modal if no credits
   - Generate pocket
   - Decrement credits

2. **POST /api/job-pockets/purchase**
   - Body: `{ job_id, pocket_type: 'advanced' | 'professional' }`
   - Charge $5 (advanced) or $10 (professional)
   - Generate pocket
   - Increment purchased credits

3. **GET /api/pocket-credits/remaining**
   - Returns: `{ advanced: number, professional: number }`
   - Used in UI to show "X credits remaining this month"

4. **POST /api/job-pockets/:id/refund**
   - Body: `{ reason, explanation }`
   - Validates 24-hour window
   - Checks grace refund limit
   - Processes refund

---

## 10. UI COMPONENTS TO UPDATE

### **Update tier pricing display:**

```typescript
// components/pricing/tier-card.tsx
const tiers = [
  {
    name: 'Essential',
    price: 15,
    description: 'Survival Mode - Get ANY job fast',
    features: [
      '30 regular job pockets',
      '50 AI messages/week',
      '1 resume version',
      'Basic Scam Shield',
      '48-hour support'
    ]
  },
  {
    name: 'Starter',
    price: 25,
    description: 'Bridge Mode - Strategic job search',
    features: [
      '100 regular job pockets',
      '1 Advanced Pocket/month',
      '1000 AI messages/week',
      '3 resume versions',
      'Full Scam Shield',
      '24-hour support'
    ]
  },
  {
    name: 'Professional',
    price: 50,
    description: 'Career Mode - Land professional roles',
    features: [
      'Unlimited regular job pockets',
      '5 Advanced or Professional Pockets/month',
      'Unlimited AI messages',
      'Unlimited resume versions',
      'Advanced interview prep',
      '12-hour support'
    ],
    popular: true
  },
  {
    name: 'Max',
    price: 100,
    description: 'All-in - High-stakes career moves',
    features: [
      'Everything in Professional, PLUS:',
      '10 Advanced or Professional Pockets/month',
      'Daily AI strategy sessions',
      'Success coach (monthly call)',
      'Priority 4-hour support',
      'Advanced analytics dashboard'
    ]
  }
];
```

### **Pocket upgrade button:**

```typescript
// components/jobs/pocket-upgrade-button.tsx
<button 
  onClick={() => setShowUpgradeModal(true)}
  disabled={!canUpgrade}
>
  {hasCredits 
    ? `Upgrade to ${pocketType} (${remainingCredits} remaining)` 
    : `Buy ${pocketType} Pocket for $${pocketType === 'advanced' ? 5 : 10}`
  }
</button>
```

---

## 11. MIGRATION PLAN

**Steps to implement these changes:**

### **Phase 1: Database (Week 1)**
- [ ] Create `pocket_credits` table
- [ ] Update `job_pockets` table with new columns
- [ ] Update `users` table with tier field
- [ ] Migrate existing users to new tier names (Premium → Professional, Unlimited → Max)

### **Phase 2: Backend (Week 2)**
- [ ] Update tier pricing constants
- [ ] Implement pocket credit tracking system
- [ ] Create upgrade/purchase endpoints
- [ ] Implement refund logic
- [ ] Update Stripe subscription products (new tier names and prices)

### **Phase 3: Frontend (Week 3)**
- [ ] Update pricing page with new tier names/prices
- [ ] Create upgrade confirmation modal
- [ ] Add pocket credit counter to UI ("5 credits remaining")
- [ ] Create purchase flow for à la carte pockets
- [ ] Update settings page with new tier names

### **Phase 4: Testing (Week 4)**
- [ ] Test credit tracking (monthly reset)
- [ ] Test upgrade flow (free credits)
- [ ] Test purchase flow (à la carte)
- [ ] Test refund scenarios (automatic + manual)
- [ ] Test tier limits (30/100/unlimited pockets)

---

## 12. CRITICAL REMINDERS

1. ✅ **Tier names changed:** Essential, Starter, Professional, **Max** (not Unlimited)
2. ✅ **Prices changed:** Professional is $50 (not $75), Max is $100 (not $150)
3. ✅ **Pocket structure:** Regular (free) → Advanced ($1 cost, $5 à la carte) → Professional ($5 cost, $10 à la carte)
4. ✅ **Credits are flexible:** Professional/Max users can mix Advanced + Professional pockets
5. ✅ **Upgrades are irreversible:** Show clear warning before upgrading
6. ✅ **Refunds are limited:** 24-hour window, specific cases only
7. ✅ **Profit margins:** Essential (67%), Starter (50%), Professional (41%), Max (44%)

---

## QUESTIONS?

If anything is unclear during implementation, reference:
- **Doc 2: PROJECT_REQUIREMENTS v1.0** (original feature specs)
- **Doc 4: TECHNICAL_ARCHITECTURE v1.0** (database schemas, APIs)
- **This document** (supersedes pricing/pocket info in those docs)

---

*Last Updated: January 16, 2026*  
*Version: 1.0 - FINAL*
