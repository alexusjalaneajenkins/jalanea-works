# Jalanea Works - Autonomous Testing Guide

## For Claude Code CLI

This document contains all tests that Claude Code can execute autonomously using Playwright browser automation and static code analysis. **No human input required.**

---

## Quick Start Prompts

Copy and paste these prompts into Claude Code CLI to run testing:

### Full Regression Test
```
Run comprehensive regression testing for Jalanea Works. Install Playwright if needed (npm install -D @playwright/test && npx playwright install chromium). Test every page route, all forms, all buttons, all modals, all filters, search functionality, application tracker CRUD, resume builder, interview prep, calendar, settings, mobile responsiveness at 375px/768px/1024px, keyboard navigation, focus states, loading states, error states, empty states, and API error handling. Generate detailed report with pass/fail counts and screenshots of failures.
```

### Authentication Tests Only
```
Run authentication testing for Jalanea Works: Test all login flows (email/password, passkey), signup validation, password reset, session management, protected routes, logout, invalid credentials, empty fields, malformed emails, SQL injection attempts, XSS in inputs, rate limiting, session expiry, and CSRF protection. Report all failures with screenshots.
```

### Payment Tests Only (Test Mode)
```
Run Stripe payment testing in TEST MODE using these test cards:
- 4242424242424242 (success)
- 4000000000000002 (decline)
- 4000000000009995 (insufficient funds)
- 4000000000000069 (expired)
- 4000000000000127 (CVC fail)
- 4000002500003155 (3D Secure)
Test subscription flows, upgrade/downgrade, cancellation, and verify all UI states match payment status.
```

### Static Code Analysis
```
Perform static code analysis on Jalanea Works: Check for TypeScript errors, unused variables, missing error boundaries, unhandled promise rejections, hardcoded secrets, console.log statements, accessibility issues (missing alt, aria-labels, roles), SEO issues (missing meta tags), security issues (dangerouslySetInnerHTML, eval), and performance issues (large bundle imports, missing lazy loading).
```

---

## Playwright Setup

```bash
# Install Playwright
npm install -D @playwright/test

# Install browsers
npx playwright install chromium firefox webkit

# Run all tests
npx playwright test

# Run with browser visible
npx playwright test --headed

# Run specific file
npx playwright test auth.spec.ts

# View HTML report
npx playwright show-report
```

### playwright.config.ts
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  baseURL: 'http://localhost:3000',
  retries: 2,
  screenshot: 'only-on-failure',
  use: {
    trace: 'on-first-retry',
  },
});
```

---

## 1. Authentication Scenarios (150+ Tests)

### 1.1 Email/Password Login

| # | Scenario | Test Method | Expected Result |
|---|----------|-------------|-----------------|
| 1 | Valid credentials login | Fill email/password, click submit, verify redirect | User lands on /dashboard |
| 2 | Invalid password | Valid email + wrong password | Error: "Invalid credentials" |
| 3 | Invalid email format | Enter "notanemail" | Email format error shown |
| 4 | Empty email field | Leave email empty, submit | Required field error |
| 5 | Empty password field | Leave password empty, submit | Required field error |
| 6 | Both fields empty | Submit empty form | Both required errors shown |
| 7 | SQL injection in email | Enter `admin'--` as email | Input sanitized, no error leak |
| 8 | SQL injection in password | Enter `' OR '1'='1` as password | Input sanitized |
| 9 | XSS in email field | Enter `<script>alert(1)</script>` | Input escaped, no execution |
| 10 | XSS in password field | Enter `<img onerror=alert(1)>` | Input escaped |
| 11 | Very long email (500+ chars) | Enter 500 character email | Validation error or truncation |
| 12 | Very long password (500+ chars) | Enter 500 character password | Handled gracefully |
| 13 | Unicode in email | Enter email with unicode chars | Validation or acceptance |
| 14 | Unicode in password | Password with emoji/unicode | Accepted or clear error |
| 15 | Case sensitivity - email | Login with UPPERCASE email | Should work (case insensitive) |
| 16 | Case sensitivity - password | Login with wrong case password | Should fail (case sensitive) |
| 17 | Leading/trailing spaces email | " email@test.com " | Trimmed and accepted |
| 18 | Leading/trailing spaces password | " password " | Handled appropriately |
| 19 | Special chars in email local | `test+tag@email.com` | Should be accepted |
| 20 | Rapid login attempts | 10 attempts in 10 seconds | Rate limiting kicks in |

### 1.2 Signup Flow

| # | Scenario | Test Method | Expected Result |
|---|----------|-------------|-----------------|
| 21 | Valid signup - all fields | Fill all fields correctly, submit | Account created, redirect to onboarding |
| 22 | Valid signup - minimum fields | Fill only required fields | Account created |
| 23 | Duplicate email | Signup with existing email | Error: "Email already registered" |
| 24 | Weak password (< 8 chars) | Enter "123" as password | Password strength error |
| 25 | Weak password (no numbers) | Enter "password" | Strength error (if required) |
| 26 | Weak password (no special) | Enter "Password1" | Strength error (if required) |
| 27 | Password mismatch | Different confirm password | "Passwords must match" error |
| 28 | Missing name field | Leave name empty | Required field error |
| 29 | Missing email field | Leave email empty | Required field error |
| 30 | Invalid phone format | Enter "abc" as phone | Phone validation error |
| 31 | Terms not accepted | Uncheck terms checkbox | "Must accept terms" error |
| 32 | Rapid signup attempts | 10 signups in 10 seconds | Rate limiting |
| 33 | Special chars in name | Name with `<>&"'` chars | Handled without breaking UI |
| 34 | Very long name (255+ chars) | 255 character name | Accepted or truncated |
| 35 | Double form submission | Click submit twice rapidly | Only one account created |
| 36 | Navigate away and back | Fill form, nav away, return | Form state (cleared or preserved) |
| 37 | Refresh during signup | Fill form, refresh page | Form cleared |
| 38 | Browser back after signup | Complete signup, click back | Appropriate behavior |

### 1.3 Password Reset

| # | Scenario | Test Method | Expected Result |
|---|----------|-------------|-----------------|
| 39 | Request reset - valid email | Enter registered email, submit | Success message shown |
| 40 | Request reset - unknown email | Enter unregistered email | Same success message (security) |
| 41 | Request reset - empty email | Submit empty form | Required field error |
| 42 | Request reset - invalid format | Enter "notanemail" | Validation error |
| 43 | Invalid reset token | Visit reset link with bad token | Invalid token error page |
| 44 | Expired reset token | Check token expiry logic | Token expires after X hours |
| 45 | Used reset token | Use token twice | Second attempt fails |
| 46 | Rate limit reset requests | 10 requests in 1 minute | Rate limiting message |
| 47 | New password too weak | Set weak password in reset | Strength validation error |
| 48 | New password mismatch | Different confirm in reset | Mismatch error |
| 49 | XSS in reset email field | Script tags in email | Input escaped |
| 50 | SQL injection in reset | SQL payload in email | Input sanitized |

### 1.4 Session Management

| # | Scenario | Test Method | Expected Result |
|---|----------|-------------|-----------------|
| 51 | Session persists on refresh | Login, refresh page | User remains logged in |
| 52 | Session persists new tab | Login, open new tab | User logged in on new tab |
| 53 | Logout clears session | Logout, check cookies/localStorage | All auth data cleared |
| 54 | Logout redirect | Click logout | Redirect to home or login |
| 55 | Protected route - logged out | Visit /dashboard while logged out | Redirect to /auth/login |
| 56 | Auth page - logged in | Visit /auth/login while logged in | Redirect to /dashboard |
| 57 | Multi-tab logout sync | Open 2 tabs, logout in one | Both tabs logged out |
| 58 | Session timeout | Wait for session expiry | Graceful timeout handling |
| 59 | Invalid token handling | Manually corrupt auth cookie | Graceful logout, redirect |
| 60 | Token refresh | Long session, check token refresh | Token refreshed before expiry |

### 1.5 WebAuthn/Passkey

| # | Scenario | Test Method | Expected Result |
|---|----------|-------------|-----------------|
| 61 | Passkey option visibility | Check login page for passkey button | Option shown if supported |
| 62 | Unsupported browser detection | Check WebAuthn feature detection | Graceful fallback to password |
| 63 | Passkey registration UI | Click register passkey | Registration modal appears |
| 64 | Cancel passkey flow | Start passkey, cancel browser prompt | Clean cancellation, no error |
| 65 | Passkey error handling | Force error in passkey flow | User-friendly error message |

---

## 2. Payment & Subscription Scenarios (130+ Tests)

### Stripe Test Cards

| Card Number | Result | Use Case |
|------------|--------|----------|
| 4242 4242 4242 4242 | SUCCESS | Happy path |
| 4000 0000 0000 0002 | DECLINE | Generic decline |
| 4000 0000 0000 9995 | DECLINE | Insufficient funds |
| 4000 0000 0000 0069 | DECLINE | Expired card |
| 4000 0000 0000 0127 | DECLINE | Incorrect CVC |
| 4000 0000 0000 0119 | DECLINE | Processing error |
| 4000 0025 0000 3155 | 3D SECURE | Requires authentication |
| 4000 0000 0000 9235 | FRAUD | Blocked by fraud detection |

### 2.1 Subscription Flows

| # | Scenario | Test Method | Expected Result |
|---|----------|-------------|-----------------|
| 66 | Subscribe to Basic tier | Click upgrade, select Basic, use success card | Subscription active, tier updated |
| 67 | Subscribe to Professional | Select Professional, complete payment | Professional features unlocked |
| 68 | Subscribe to Premium | Select Premium, complete payment | Premium features unlocked |
| 69 | Card declined at checkout | Use decline card (0002) | Error message, user stays on free |
| 70 | Insufficient funds | Use insufficient funds card (9995) | Specific "insufficient funds" error |
| 71 | Expired card | Use expired card (0069) | "Card expired" error message |
| 72 | Invalid CVC | Use CVC fail card (0127) | "CVC verification failed" error |
| 73 | Processing error | Use processing error card (0119) | "Processing error" message |
| 74 | 3D Secure - success | Use 3DS card, complete auth | 3DS modal, then success |
| 75 | 3D Secure - failure | Use 3DS card, fail auth | Payment failed after 3DS |
| 76 | Fraud blocked | Use fraud card (9235) | Payment blocked, fraud message |
| 77 | Cancel subscription | Go to settings, click cancel | Subscription cancelled, access until period end |
| 78 | Resubscribe after cancel | Cancel then resubscribe | New subscription starts |
| 79 | Upgrade tier | Basic to Professional | Prorated charge, immediate upgrade |
| 80 | Downgrade tier | Professional to Basic | Change at period end |

### 2.2 Payment UI States

| # | Scenario | Test Method | Expected Result |
|---|----------|-------------|-----------------|
| 81 | Loading state during payment | Submit payment, check indicator | Spinner/disabled button shown |
| 82 | Success state after payment | Complete payment, check UI | Success message with confirmation |
| 83 | Error state after failure | Fail payment, check UI | Clear error with retry option |
| 84 | Price display accuracy | Check all tier prices | UI prices match Stripe config |
| 85 | Feature list per tier | Compare features shown | Correct features for each tier |
| 86 | Current tier indicator | Check active tier highlight | Current tier clearly marked |
| 87 | Double payment prevention | Click pay twice rapidly | Only one charge processed |
| 88 | Back button during checkout | Start checkout, click back | Clean return, no orphan sessions |
| 89 | Checkout modal close | Click outside checkout | Modal closes, no charge |
| 90 | Billing history display | View billing section | Past invoices shown correctly |

### 2.3 Webhook Handling (Static Analysis)

| # | Scenario | What to Check | Expected |
|---|----------|---------------|----------|
| 91 | checkout.session.completed | Webhook handler updates DB | User tier updated |
| 92 | payment_intent.payment_failed | Handler logs failure | User notified, tier unchanged |
| 93 | customer.subscription.deleted | Handler processes cancellation | User downgraded at period end |
| 94 | customer.subscription.updated | Handler processes changes | Tier reflects new subscription |
| 95 | invoice.payment_succeeded | Handler logs success | Invoice recorded |
| 96 | invoice.payment_failed | Handler retries/notifies | Retry logic or notification |
| 97 | Signature verification | Check Stripe signature validation | Invalid signatures rejected |
| 98 | Idempotency handling | Check duplicate event handling | Duplicates ignored |

---

## 3. Job Search Scenarios (120+ Tests)

### 3.1 Search Functionality

| # | Scenario | Test Method | Expected Result |
|---|----------|-------------|-----------------|
| 99 | Basic keyword search | Enter "software engineer", submit | Results containing keyword |
| 100 | Empty search | Submit with empty field | All jobs or prompt to enter term |
| 101 | No results search | Search "xyznonexistent123" | No results message with suggestions |
| 102 | Special characters search | Search "C++ developer" | Results include C++ jobs |
| 103 | Very long search term | 200+ character search | Handled gracefully |
| 104 | SQL injection in search | Search `'; DROP TABLE--` | Input sanitized, no error |
| 105 | XSS in search | Search `<script>alert(1)</script>` | Input escaped |
| 106 | Search debounce | Type quickly, count API calls | Debounced, not every keystroke |
| 107 | Search persistence | Search, nav away, return | Previous search retained |
| 108 | Case insensitive | Search "MANAGER" vs "manager" | Same results |
| 109 | Search with location | Search "nurse Orlando" | Location-filtered results |
| 110 | Multi-word search | Search "senior software engineer" | Results match all words |
| 111 | Quoted phrase search | Search `"product manager"` | Exact phrase matches (if supported) |

### 3.2 Filters

| # | Scenario | Test Method | Expected Result |
|---|----------|-------------|-----------------|
| 112 | Salary minimum filter | Set min $50k | Only jobs $50k+ shown |
| 113 | Salary maximum filter | Set max $80k | Only jobs under $80k |
| 114 | Salary range filter | Set $50k-$80k | Jobs within range only |
| 115 | Invalid salary range | Set min > max | Validation error or auto-swap |
| 116 | Job type: Full-time | Select full-time only | Only full-time jobs |
| 117 | Job type: Part-time | Select part-time only | Only part-time jobs |
| 118 | Job type: Contract | Select contract only | Only contract jobs |
| 119 | Job type: Multiple | Select full + part | Both types shown |
| 120 | LYNX accessible toggle | Enable LYNX filter | Only LYNX-accessible jobs |
| 121 | Remote filter | Toggle remote option | Remote jobs shown |
| 122 | Experience level filter | Select entry level | Entry level jobs only |
| 123 | Date posted filter | Select "Last 7 days" | Recent jobs only |
| 124 | Clear all filters | Apply filters, click clear | All filters reset |
| 125 | Filter count badge | Apply 3 filters | Badge shows "3 active" |
| 126 | Filter persistence | Filter, refresh page | Filters retained in URL |
| 127 | Combined filters | Multiple filters at once | All conditions applied |

### 3.3 Job Cards & Details

| # | Scenario | Test Method | Expected Result |
|---|----------|-------------|-----------------|
| 128 | Card renders all fields | Check card content | Title, company, salary, location visible |
| 129 | Card click opens detail | Click job card | Detail view/modal opens |
| 130 | Detail has full description | Open detail | Full job description visible |
| 131 | Apply button present | Check detail page | Apply CTA prominently visible |
| 132 | Save/bookmark job | Click save icon | Job saved, icon updates |
| 133 | Unsave job | Click save on saved job | Job unsaved, icon updates |
| 134 | Scam shield badge | Find job with warning | Warning badge displayed |
| 135 | Scam shield info | Click scam badge | Explanation modal opens |
| 136 | Share job | Click share button | Share options appear |
| 137 | Job posted date | Check date on cards | Relative date (e.g., "2 days ago") |
| 138 | Company logo display | Check cards with logos | Logo loads or placeholder |
| 139 | Salary range display | Check salary on cards | Range formatted correctly |
| 140 | Long title truncation | Card with long title | Title truncates with ellipsis |

### 3.4 Pagination & Loading

| # | Scenario | Test Method | Expected Result |
|---|----------|-------------|-----------------|
| 141 | Initial page load | Navigate to jobs page | First page loads |
| 142 | Load more / infinite scroll | Scroll to bottom | More jobs load |
| 143 | Loading indicator | Check spinner during load | Loading state visible |
| 144 | End of results | Scroll to absolute end | "No more results" message |
| 145 | Page number in URL | Navigate pages, check URL | Page state in URL |
| 146 | Direct page URL access | Visit /jobs?page=5 | Correct page loads |
| 147 | Invalid page number | Visit /jobs?page=9999 | Handled gracefully |
| 148 | Negative page number | Visit /jobs?page=-1 | Handled gracefully |

---

## 4. Application Tracker Scenarios (80+ Tests)

### 4.1 CRUD Operations

| # | Scenario | Test Method | Expected Result |
|---|----------|-------------|-----------------|
| 149 | Create application manually | Click Add, fill form, save | Application in list |
| 150 | Create with minimum fields | Only fill required fields | Application created |
| 151 | Create with all fields | Fill every optional field | All data saved |
| 152 | Read application details | Click application | All details display |
| 153 | Update application status | Change status dropdown | Status updates immediately |
| 154 | Update application notes | Edit notes, save | Notes saved |
| 155 | Delete application | Click delete, confirm | Application removed |
| 156 | Delete confirmation | Click delete | Confirmation dialog appears |
| 157 | Cancel delete | Start delete, cancel | Application not deleted |
| 158 | Undo delete | Delete, check for undo | Undo available briefly |

### 4.2 Status Workflow

| # | Scenario | Test Method | Expected Result |
|---|----------|-------------|-----------------|
| 159 | Status: Saved | Create with Saved status | Shows in Saved tab |
| 160 | Status: Applied | Change to Applied | Moves to Applied tab |
| 161 | Status: Interviewing | Change to Interviewing | Moves to Interviewing tab |
| 162 | Status: Offered | Change to Offered | Moves to Offered tab |
| 163 | Status: Rejected | Change to Rejected | Moves to Rejected tab |
| 164 | Status: Accepted | Change to Accepted | Moves to Accepted tab |
| 165 | Tab counts update | Change status | Counts update real-time |
| 166 | Status color coding | Check each status | Distinct visual colors |
| 167 | Status history | View application | Status change history shown |

### 4.3 Validation & Edge Cases

| # | Scenario | Test Method | Expected Result |
|---|----------|-------------|-----------------|
| 168 | Empty company name | Submit without company | Required field error |
| 169 | Empty job title | Submit without title | Required field error |
| 170 | Invalid URL format | Enter "notaurl" in link | URL validation error |
| 171 | Future application date | Set date in future | Accepted or validation |
| 172 | Very old date | Set date 10 years ago | Accepted or validation |
| 173 | XSS in notes field | Enter `<script>` in notes | Escaped, no execution |
| 174 | SQL injection in fields | SQL payloads in inputs | All inputs sanitized |
| 175 | Max length company name | 255 char company name | Accepted or truncated |
| 176 | Duplicate application | Add same job twice | Warning or allowed |
| 177 | Empty state display | New user, no applications | Friendly empty state |

---

## 5. Resume Builder Scenarios (90+ Tests)

### 5.1 Section Management

| # | Scenario | Test Method | Expected Result |
|---|----------|-------------|-----------------|
| 178 | Add contact info | Fill name, email, phone | Contact in preview |
| 179 | Add work experience | Click Add Experience, fill | Experience in preview |
| 180 | Add education | Click Add Education, fill | Education in preview |
| 181 | Add skills | Add multiple skills | Skills section populated |
| 182 | Add certifications | Add certification | Certification in preview |
| 183 | Reorder sections | Drag section to reorder | Order updates in preview |
| 184 | Delete section | Delete an experience | Section removed |
| 185 | Edit existing section | Click edit, change data | Updates in preview |
| 186 | Cancel edit | Edit, then cancel | Original data preserved |
| 187 | Add bullet points | Add highlights to experience | Bullets render correctly |

### 5.2 Live Preview

| # | Scenario | Test Method | Expected Result |
|---|----------|-------------|-----------------|
| 188 | Real-time updates | Type in field, watch preview | Preview updates as you type |
| 189 | Template switching | Change template selection | Preview shows new template |
| 190 | Preview scroll sync | Scroll preview | Smooth scrolling |
| 191 | Preview zoom | Zoom in/out on preview | Zoom works correctly |
| 192 | Mobile preview | View on 375px width | Preview adapts |

### 5.3 ATS Score

| # | Scenario | Test Method | Expected Result |
|---|----------|-------------|-----------------|
| 193 | ATS score calculation | Fill resume, check score | Score calculated and displayed |
| 194 | Score updates on change | Add keyword, check score | Score increases |
| 195 | Score color coding | Get low/medium/high score | Color reflects level |
| 196 | ATS suggestions | Check for improvement tips | Actionable suggestions shown |

### 5.4 Export & Download

| # | Scenario | Test Method | Expected Result |
|---|----------|-------------|-----------------|
| 197 | Download PDF | Click Download PDF | PDF file downloads |
| 198 | PDF formatting | Open downloaded PDF | Formatting preserved |
| 199 | Download with special chars | Name with apostrophe | File downloads correctly |
| 200 | Print functionality | Click Print | Print dialog opens |
| 201 | Share/copy link | Click share | Link copied to clipboard |

---

## 6. Form & Input Validation (120+ Tests)

### 6.1 Input Types

| # | Scenario | Test Method | Expected Result |
|---|----------|-------------|-----------------|
| 202 | Email validation | Invalid emails in all email fields | Validation errors shown |
| 203 | Phone validation | Invalid phone formats | Validation or auto-format |
| 204 | URL validation | Invalid URLs | Validation errors |
| 205 | Number input | Text in number fields | Rejected or error |
| 206 | Date validation | Invalid dates | Validation error |
| 207 | Required fields | Empty required fields | All required errors shown |
| 208 | Max length | Exceed max length | Prevented or truncated |
| 209 | Min length | Below min length | Validation error |

### 6.2 Security Validation

| # | Scenario | Test Method | Expected Result |
|---|----------|-------------|-----------------|
| 210 | XSS all fields | `<script>` in every text input | All inputs escaped |
| 211 | SQL injection all fields | SQL payloads in inputs | All inputs sanitized |
| 212 | HTML injection | `<img onerror=alert(1)>` | HTML escaped |
| 213 | Path traversal | Upload file with `../../../` | Sanitized or rejected |
| 214 | Null byte injection | String with null bytes | Handled safely |
| 215 | Unicode normalization | Homoglyph characters | Normalized or handled |

### 6.3 Form UX

| # | Scenario | Test Method | Expected Result |
|---|----------|-------------|-----------------|
| 216 | Tab order | Tab through form fields | Logical tab order |
| 217 | Enter submits | Press Enter in last field | Form submits |
| 218 | Escape cancels | Press Escape in modal | Modal closes |
| 219 | Data preserved on error | Submit invalid, check | Valid data preserved |
| 220 | Auto-focus first field | Open form, check focus | First field focused |
| 221 | Error message placement | Trigger errors | Errors near relevant field |
| 222 | Inline validation | Blur invalid field | Error shows on blur |
| 223 | Disabled submit | Check button state | Disabled until valid |

---

## 7. Network & Performance (100+ Tests)

### 7.1 Network Conditions

| # | Scenario | Test Method | Expected Result |
|---|----------|-------------|-----------------|
| 224 | Slow 3G | Throttle network, navigate | Loading states visible |
| 225 | Offline mode | Go offline, attempt actions | Offline indicator, graceful errors |
| 226 | Offline to online | Go offline, then online | App recovers, syncs |
| 227 | Intermittent connection | Toggle connection rapidly | No crash |
| 228 | API timeout | Simulate 10s+ response | Timeout with retry |
| 229 | API 500 error | Force 500 response | User-friendly error |
| 230 | API 404 error | Force 404 response | Not found message |
| 231 | API 401 error | Force 401 response | Redirect to login |
| 232 | API 403 error | Force 403 response | Access denied message |
| 233 | API 429 rate limit | Force 429 response | Rate limit message |

### 7.2 Loading States

| # | Scenario | Test Method | Expected Result |
|---|----------|-------------|-----------------|
| 234 | Page load skeleton | Slow network, check loaders | Skeleton loaders shown |
| 235 | Button loading state | Click submit, check button | Loading indicator |
| 236 | List loading state | Navigate to list page | Loading indicator |
| 237 | Infinite scroll loading | Scroll to trigger load | Loading at bottom |
| 238 | Modal loading state | Open modal with async data | Loading in modal |
| 239 | Image placeholders | Check image load behavior | Placeholder until loaded |

### 7.3 Performance Metrics

| # | Scenario | Test Method | Expected Result |
|---|----------|-------------|-----------------|
| 240 | First Contentful Paint | Measure FCP | Under 2 seconds |
| 241 | Time to Interactive | Measure TTI | Under 4 seconds |
| 242 | Cumulative Layout Shift | Measure CLS | Under 0.1 |
| 243 | Memory leaks | Navigate 50 times | Memory stable |
| 244 | Bundle size | Check build output | Main bundle < 500KB gzipped |
| 245 | Lazy loading | Check network | Code split chunks on demand |

---

## 8. Accessibility (100+ Tests)

### 8.1 Keyboard Navigation

| # | Scenario | Test Method | Expected Result |
|---|----------|-------------|-----------------|
| 246 | Tab through all | Tab entire page | All interactive focusable |
| 247 | Skip link | First tab | Skip link present |
| 248 | Focus trap modals | Tab in modal | Focus stays in modal |
| 249 | Focus visible | Tab, check indicators | Clear focus ring |
| 250 | Escape closes modals | Open modal, press Escape | Modal closes |
| 251 | Arrow keys menus | Open dropdown, use arrows | Arrow navigation works |
| 252 | Enter/Space buttons | Focus button, press Enter | Button activates |
| 253 | No keyboard traps | Navigate everywhere | Can always escape |

### 8.2 ARIA & Semantic HTML

| # | Scenario | Test Method | Expected Result |
|---|----------|-------------|-----------------|
| 254 | Buttons are `<button>` | Check clickable elements | Not `<div>` with onClick |
| 255 | Links are `<a>` | Check navigation elements | `<a>` with href |
| 256 | Form inputs have labels | Check all inputs | All inputs labeled |
| 257 | Images have alt text | Check all `<img>` | Alt text present |
| 258 | ARIA roles correct | Validate ARIA usage | Roles match purpose |
| 259 | ARIA labels on icons | Check icon buttons | aria-label present |
| 260 | Error messages linked | Check aria-describedby | Errors linked to inputs |
| 261 | Live regions | Check dynamic content | aria-live on updates |

### 8.3 Color & Contrast

| # | Scenario | Test Method | Expected Result |
|---|----------|-------------|-----------------|
| 262 | Text contrast | Run axe-core | All text 4.5:1+ |
| 263 | Large text contrast | Check 18px+ headings | 3:1 minimum |
| 264 | Interactive contrast | Check buttons, links | 3:1 against background |
| 265 | Focus indicator contrast | Check focus ring | 3:1 against background |
| 266 | Error not color-only | Check error indicators | Icons/text + color |
| 267 | Success not color-only | Check success indicators | Icons/text + color |

### 8.4 Screen Reader

| # | Scenario | Test Method | Expected Result |
|---|----------|-------------|-----------------|
| 268 | Heading hierarchy | Check h1-h6 structure | Logical order, one h1 |
| 269 | Landmark regions | Check main, nav, etc. | Proper landmarks |
| 270 | Table headers | Check data tables | th for headers |
| 271 | Meaningful link text | Check link content | No "click here" |
| 272 | Meaningful button text | Check button content | Descriptive labels |
| 273 | Form fieldsets | Check grouped fields | Fieldsets with legends |

---

## 9. Mobile Responsiveness

### 9.1 Breakpoint Testing

| # | Scenario | Test Method | Expected Result |
|---|----------|-------------|-----------------|
| 274 | 375px (iPhone SE) | Set viewport, check layout | No horizontal scroll |
| 275 | 390px (iPhone 12/13/14) | Set viewport, check layout | Layout adapts |
| 276 | 768px (iPad) | Set viewport, check layout | Tablet layout |
| 277 | 1024px (iPad Pro) | Set viewport, check layout | Desktop/tablet hybrid |
| 278 | 1440px (Desktop) | Set viewport, check layout | Full desktop |
| 279 | Bottom navigation | Mobile viewport | Bottom nav visible |
| 280 | Filter drawer | Open filters on mobile | Drawer slides up |
| 281 | Modal full screen | Open modal on mobile | Modal fits screen |
| 282 | Touch targets | Tap buttons/links | Targets ≥44x44px |
| 283 | Text readability | Check font sizes | Readable without zoom |

---

---

## 10. PWA (Progressive Web App) Testing

### PWA Testing Prompt for Claude Code
```
Test PWA functionality for Jalanea Works: Check manifest.json exists and is valid, verify service worker registration, test offline capability, check install prompt, verify app icons at all sizes, test standalone display mode, check theme colors, verify start_url, test background sync (if applicable), and check push notification registration (if applicable). Use Lighthouse PWA audit.
```

### 10.1 Manifest Validation

| # | Scenario | Test Method | Expected Result |
|---|----------|-------------|-----------------|
| 284 | manifest.json exists | Fetch /manifest.json | 200 response with valid JSON |
| 285 | name field present | Check manifest | App name defined |
| 286 | short_name present | Check manifest | Short name ≤12 chars |
| 287 | start_url valid | Check manifest | Points to valid route |
| 288 | display mode set | Check manifest | "standalone" or "fullscreen" |
| 289 | theme_color set | Check manifest | Matches brand (#FFC425 or #1F2937) |
| 290 | background_color set | Check manifest | Valid color defined |
| 291 | icons - 192x192 | Check manifest icons array | 192x192 icon exists |
| 292 | icons - 512x512 | Check manifest icons array | 512x512 icon exists |
| 293 | icons - maskable | Check manifest | At least one maskable icon |
| 294 | scope defined | Check manifest | Scope matches app |
| 295 | description present | Check manifest | App description included |
| 296 | categories defined | Check manifest | Relevant categories set |

### 10.2 Service Worker

| # | Scenario | Test Method | Expected Result |
|---|----------|-------------|-----------------|
| 297 | SW registered | Check navigator.serviceWorker.controller | Service worker active |
| 298 | SW scope correct | Check registration.scope | Covers entire app |
| 299 | SW activates | Check SW state | State is "activated" |
| 300 | Cache created | Check caches in DevTools | App cache exists |
| 301 | Static assets cached | Check cache contents | JS, CSS, images cached |
| 302 | API responses cached | Check cache (if applicable) | API data cached for offline |
| 303 | SW updates | Deploy new version, check | SW updates and activates |
| 304 | Skip waiting works | Check update behavior | New SW takes over |

### 10.3 Offline Functionality

| # | Scenario | Test Method | Expected Result |
|---|----------|-------------|-----------------|
| 305 | Offline page loads | Go offline, refresh | Cached page loads |
| 306 | Offline indicator | Go offline | UI shows offline status |
| 307 | Offline navigation | Go offline, navigate | Cached routes work |
| 308 | Offline form queue | Submit form offline | Queued for when online |
| 309 | Online sync | Go offline, make changes, go online | Data syncs |
| 310 | Offline job search | Go offline, search cached jobs | Cached results shown |
| 311 | Offline resume view | Go offline, view resume | Resume loads from cache |
| 312 | Network recovery | Go offline then online | App recovers gracefully |

### 10.4 Install Experience

| # | Scenario | Test Method | Expected Result |
|---|----------|-------------|-----------------|
| 313 | beforeinstallprompt fires | Check for event listener | Event captured |
| 314 | Install button shown | Check UI for install prompt | Custom install UI visible |
| 315 | Install prompt works | Click install button | Browser install dialog appears |
| 316 | Post-install redirect | Install app, check behavior | App opens in standalone |
| 317 | appinstalled event | Install, check event fires | Event logged |
| 318 | Already installed check | Check if already installed | Install button hidden |

### 10.5 Standalone Mode

| # | Scenario | Test Method | Expected Result |
|---|----------|-------------|-----------------|
| 319 | Opens in standalone | Install and open | No browser chrome |
| 320 | Status bar color | Check standalone mode | Theme color applied |
| 321 | Navigation works | Navigate in standalone | No browser back button needed |
| 322 | External links | Click external link | Opens in browser, not app |
| 323 | Share target | Share to app (if configured) | App receives shared content |
| 324 | File handling | Open file with app (if configured) | App handles file type |

### 10.6 Lighthouse PWA Audit

| # | Check | How to Test | Expected |
|---|-------|-------------|----------|
| 325 | Installable | Lighthouse PWA audit | ✓ Installable |
| 326 | PWA Optimized | Lighthouse PWA audit | Score 90+ |
| 327 | Fast and reliable | Lighthouse PWA audit | ✓ Works offline |
| 328 | Splash screen | Lighthouse PWA audit | ✓ Custom splash |
| 329 | Themed address bar | Lighthouse PWA audit | ✓ Theme color |
| 330 | Content sized correctly | Lighthouse PWA audit | ✓ Viewport meta |
| 331 | Has valid manifest | Lighthouse PWA audit | ✓ Valid manifest |
| 332 | Registers service worker | Lighthouse PWA audit | ✓ SW registered |

---

## 11. Mobile Device Emulation (Chrome DevTools)

### Mobile Testing Prompt for Claude Code
```
Test mobile responsiveness using Playwright device emulation. Test on these viewports: iPhone SE (375x667), iPhone 12/13/14 (390x844), iPhone 14 Pro Max (430x932), iPad (768x1024), iPad Pro (1024x1366), Pixel 5 (393x851), Samsung Galaxy S21 (360x800). For each device: check layout, navigation, touch targets, forms, modals, and scrolling. Take screenshots of each viewport.
```

### Playwright Device Emulation Setup

```typescript
import { devices } from '@playwright/test';

// Use built-in device profiles
const iPhone = devices['iPhone 13'];
const iPad = devices['iPad Pro 11'];
const pixel = devices['Pixel 5'];

// Or custom viewport
await page.setViewportSize({ width: 375, height: 667 });

// Enable touch
await page.emulateMedia({ reducedMotion: 'reduce' });

// Test with specific device
test.use({ ...devices['iPhone 13'] });
```

### 11.1 Viewport Testing

| # | Device | Viewport | Test Method | Expected |
|---|--------|----------|-------------|----------|
| 333 | iPhone SE | 375x667 | `devices['iPhone SE']` | No horizontal scroll |
| 334 | iPhone 12/13/14 | 390x844 | `devices['iPhone 13']` | Layout adapts |
| 335 | iPhone 14 Pro Max | 430x932 | `devices['iPhone 14 Pro Max']` | Large phone layout |
| 336 | iPad Mini | 768x1024 | `devices['iPad Mini']` | Tablet layout |
| 337 | iPad Pro 11" | 834x1194 | `devices['iPad Pro 11']` | Large tablet |
| 338 | iPad Pro 12.9" | 1024x1366 | Custom viewport | Desktop/tablet hybrid |
| 339 | Pixel 5 | 393x851 | `devices['Pixel 5']` | Android layout |
| 340 | Galaxy S21 | 360x800 | Custom viewport | Narrow Android |
| 341 | Galaxy Fold | 280x653 (folded) | Custom viewport | Ultra-narrow |
| 342 | Galaxy Fold | 717x512 (unfolded) | Custom viewport | Wide mode |

### 11.2 Touch Interaction Testing

| # | Scenario | Test Method | Expected |
|---|----------|-------------|----------|
| 343 | Touch targets ≥44px | Measure all buttons/links | All targets ≥44x44px |
| 344 | Tap on buttons | `page.tap()` method | Buttons respond to tap |
| 345 | Tap on links | `page.tap()` method | Links navigate |
| 346 | Swipe gestures | Touch action sequences | Swipe works (if used) |
| 347 | Pinch zoom disabled | Check viewport meta | No pinch zoom on app |
| 348 | Long press | Touch and hold | Context menu (if applicable) |
| 349 | Double tap | Two quick taps | No accidental zoom |
| 350 | Scroll momentum | Scroll and release | Momentum scrolling works |

### 11.3 Mobile-Specific UI

| # | Scenario | Test Method | Expected |
|---|----------|-------------|----------|
| 351 | Bottom navigation visible | Check mobile viewport | Bottom nav instead of sidebar |
| 352 | Bottom nav active state | Tap nav items | Active item highlighted |
| 353 | Bottom nav icons | Visual inspection | Icons recognizable |
| 354 | Hamburger menu (if used) | Tap menu icon | Menu opens |
| 355 | Filter drawer | Tap filter button | Drawer slides up |
| 356 | Modal full height | Open modal on mobile | Modal fills screen |
| 357 | Modal close button | Check modal | Close button in reach |
| 358 | Keyboard handling | Focus input | Keyboard doesn't cover input |
| 359 | Input zoom prevention | Font size ≥16px | No iOS zoom on focus |
| 360 | Safe area insets | Check on notched device | Content not under notch |

### 11.4 Mobile Form Testing

| # | Scenario | Test Method | Expected |
|---|----------|-------------|----------|
| 361 | Input type="email" | Focus email field | Email keyboard appears |
| 362 | Input type="tel" | Focus phone field | Number pad appears |
| 363 | Input type="number" | Focus number field | Number keyboard |
| 364 | Autocomplete works | Fill form | Browser autofill works |
| 365 | Date picker mobile | Tap date input | Native date picker |
| 366 | Select dropdown | Tap select | Native picker wheel |
| 367 | Textarea resize | Type long text | Textarea expands |
| 368 | Form scroll | Long form | Can scroll entire form |

### 11.5 Mobile Performance

| # | Scenario | Test Method | Expected |
|---|----------|-------------|----------|
| 369 | 3G load time | Throttle to 3G | Page loads < 5s |
| 370 | 4G load time | Throttle to 4G | Page loads < 3s |
| 371 | CPU throttle 4x | Throttle CPU | Interactions still smooth |
| 372 | Memory on mobile | Check memory usage | < 150MB RAM |
| 373 | Battery impact | Monitor with DevTools | No excessive CPU |

---

## 12. Chrome DevTools Testing Commands

### Automated DevTools Protocol

```typescript
// Enable mobile emulation
await page.emulate(devices['iPhone 13']);

// Throttle network to 3G
await page.route('**/*', route => {
  route.continue();
}, { times: 1 });

// Or use CDP directly
const client = await page.context().newCDPSession(page);
await client.send('Network.emulateNetworkConditions', {
  offline: false,
  downloadThroughput: 1.5 * 1024 * 1024 / 8, // 1.5 Mbps
  uploadThroughput: 750 * 1024 / 8, // 750 Kbps
  latency: 40
});

// Throttle CPU
await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });

// Go offline
await page.context().setOffline(true);

// Screenshot specific viewport
await page.setViewportSize({ width: 375, height: 667 });
await page.screenshot({ path: 'mobile-375.png', fullPage: true });

// Check for PWA installability
const manifest = await page.evaluate(() => {
  const link = document.querySelector('link[rel="manifest"]');
  return link ? link.href : null;
});

// Get Lighthouse scores programmatically
// (requires @playwright/test with lighthouse integration)
```

### Run Mobile Tests Command
```bash
# Run all tests in mobile mode
npx playwright test --project=mobile

# Run specific device
npx playwright test --project="iPhone 13"

# Run with visual comparison
npx playwright test --update-snapshots
```

---

## Running Checklist

After running all tests, verify:

- [ ] All authentication flows work
- [ ] All Stripe test cards produce expected results
- [ ] Job search and filters function correctly
- [ ] Application tracker CRUD works
- [ ] Resume builder sections and export work
- [ ] All forms validate correctly
- [ ] No security vulnerabilities (XSS, SQL injection)
- [ ] Performance metrics within targets
- [ ] Accessibility audit passes
- [ ] Mobile responsive at all breakpoints
- [ ] **PWA manifest valid**
- [ ] **Service worker registered and working**
- [ ] **Offline mode functional**
- [ ] **App installable**
- [ ] **Lighthouse PWA score 90+**
- [ ] **All mobile viewports tested (375px - 1024px)**
- [ ] **Touch interactions work**
- [ ] **Mobile forms have correct keyboard types**

---

*Document Version: 2.1 | Last Updated: January 2026*
