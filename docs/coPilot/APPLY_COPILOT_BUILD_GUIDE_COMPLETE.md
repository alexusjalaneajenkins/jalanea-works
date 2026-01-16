# APPLY COPILOT - COMPLETE BUILD GUIDE
*Chrome Extension for Auto-Filling Job Applications*
**For Claude Code Development**
**Version 1.0 - January 16, 2026**

This is the complete, step-by-step guide to building Apply Copilot with Claude Code.
Just copy the prompts in each phase and paste them into Claude Code terminal.

## 🎯 WHAT WE'RE BUILDING
- Chrome extension that auto-fills job application forms
- Works on Indeed, LinkedIn, Workday, Greenhouse, Lever
- Syncs with Jalanea Works user profile
- Available to Starter tier users ($25/mo) and above

## ⏱️ BUILD TIMELINE
- **Week 1 (Days 1-2):** Basic extension structure + popup UI
- **Week 1 (Days 3-4):** Authentication flow
- **Week 2 (Days 1-3):** Form detection and auto-fill logic
- **Week 2 (Days 4-5):** Jalanea API integration
- **Week 3:** Testing on multiple job sites + bug fixes
- **Week 4:** Polish, screenshots, Chrome Web Store submission

## 📁 FILE STRUCTURE
```
/jalanea-apply-copilot
  /manifest.json
  /popup.html
  /popup.js
  /content.js
  /background.js
  /auth.html
  /auth.js
  /settings.html
  /settings.js
  /styles.css
  /icons/
    /icon16.png
    /icon48.png
    /icon128.png
  /README.md
```

---

## PHASE 1: BASIC EXTENSION (Week 1, Day 1-2)

### PROMPT FOR CLAUDE CODE:

```
Build a Chrome extension called "Jalanea Works - Apply Copilot" that auto-fills job applications.

GOAL: Create the basic extension structure with a working popup UI.

FILES TO CREATE:
1. manifest.json - Chrome extension configuration (Manifest V3)
2. popup.html - Extension popup UI (280px wide)
3. popup.js - Popup logic (detect forms, handle buttons)
4. content.js - Runs on job sites, detects forms
5. styles.css - Tailwind-like utility classes
6. /icons/ folder - Placeholder icons (16x16, 48x48, 128x128)

REQUIREMENTS:
- Manifest V3 with permissions: storage, activeTab, scripting
- Host permissions for: Indeed, LinkedIn, Workday, Greenhouse, Lever
- Popup shows 5 states:
  1. "Not logged in" (with login button)
  2. "Loading..." (checking for forms)
  3. "No form detected" (not on job site)
  4. "Form detected!" (with fill button + field counts)
  5. "Upgrade required" (Essential tier users)
- Content script detects basic form fields (name, email, phone)
- Clean, minimal design matching Tailwind aesthetics

START WITH:
- Create manifest.json with all required permissions
- Create popup.html with all 5 UI states (hidden by default)
- Create popup.js that switches between states
- Create basic content.js that detects if forms exist on page

Test by loading extension in chrome://extensions (Developer mode → Load unpacked)
```

**Expected Time:** 2-4 hours

---

## PHASE 2: AUTHENTICATION (Week 1, Day 3-4)

### PROMPT FOR CLAUDE CODE:

```
Add authentication to Apply Copilot extension.

GOAL: Users can log in with their Jalanea Works account and store auth token.

FILES TO CREATE:
1. auth.html - Standalone login page (beautiful gradient background)
2. auth.js - Authentication logic (OAuth + manual email/password)

REQUIREMENTS:
- Two login methods:
  1. "Sign in via Jalanea.works" (OAuth flow using chrome.identity API)
  2. Manual email/password form
- Store auth token in chrome.storage.local after successful login
- Auth page redirects back to extension after successful login
- Popup checks for auth token on load:
  - If no token → show "Not logged in" state
  - If token exists → fetch user data from Jalanea API
  - If token expired → clear storage, show login again
- Handle errors gracefully (show error messages)

API ENDPOINTS TO CALL:
- POST /api/auth/login (email, password) → returns { token, userTier }
- GET /api/user/profile (requires auth header) → returns user data

DON'T BUILD THE API YET - just structure the code to call these endpoints.
The Jalanea backend team will create these endpoints.

Test by manually setting token in chrome.storage and checking if popup state changes.
```

**Expected Time:** 3-4 hours

---

## PHASE 3: FORM DETECTION (Week 2, Day 1-3)

### PROMPT FOR CLAUDE CODE:

```
Build advanced form detection for Apply Copilot.

GOAL: Detect all relevant fields on job application forms.

FILES TO CREATE:
1. utils/field-detector.js - Advanced form field detection class
2. Update content.js to use FieldDetector

FIELD TYPES TO DETECT:
- Contact: firstName, lastName, fullName, email, phone
- Address: address, address2, city, state, zip, country
- Work History: company, jobTitle, startDate, endDate, currentlyWorking
- Education: school, degree, graduationDate, gpa
- Other: resume (file upload), coverLetter, linkedin, portfolio

DETECTION METHODS:
1. By name attribute (input[name*="first name" i])
2. By id attribute (input[id*="firstname" i])
3. By placeholder (input[placeholder*="first" i])
4. By label text (find <label> with matching text, get input)
5. By aria-label attribute

REQUIREMENTS:
- Case-insensitive matching
- Support text inputs, textareas, selects, file uploads
- Return field counts by category (contact: 4, work: 2, education: 1, etc.)
- Handle unusual field names (e.g. "fname", "given_name", "first")
- Return null if field not found (don't error)

Test on Indeed job application page - should detect 10-15 fields.
```

**Expected Time:** 6-8 hours (most complex part)

---

## PHASE 4: AUTO-FILL LOGIC (Week 2, Day 4-5)

### PROMPT FOR CLAUDE CODE:

```
Add auto-fill functionality to Apply Copilot.

GOAL: Fill form fields with user data from Jalanea Works profile.

UPDATE FILES:
1. content.js - Add fillFormFields() function
2. popup.js - Handle "Fill Form" button click

AUTO-FILL LOGIC:
- Get detected fields from FieldDetector
- Map user data to fields:
  - firstName → userData.name.split(' ')[0]
  - lastName → userData.name.split(' ').slice(1).join(' ')
  - email → userData.email
  - phone → userData.phone
  - address → userData.address.street
  - city → userData.address.city
  - state → userData.address.state
  - zip → userData.address.zip
  - company → userData.workHistory[0].company (most recent)
  - jobTitle → userData.workHistory[0].title
  - school → userData.education[0].school
  - linkedin → userData.linkedin
- Fill field.value = data
- Highlight filled fields (green border + light green background)
- Trigger change/input events (some forms need this for validation)
- Scroll to first filled field

REQUIREMENTS:
- Only fill fields that were detected
- Handle missing data gracefully (skip field if user doesn't have that data)
- Return count of fields filled
- Add visual feedback (green highlight)

Test by mocking user data in popup.js and filling Indeed application form.
```

**Expected Time:** 4-6 hours

---

## PHASE 5: JALANEA API INTEGRATION (Week 3, Day 1-2)

### PROMPT FOR CLAUDE CODE:

```
Connect Apply Copilot to Jalanea Works backend.

GOAL: Fetch real user data from Jalanea API and save applications.

FILES TO CREATE:
1. utils/api-client.js - API client class for Jalanea backend
2. background.js - Service worker for API calls

API CLIENT METHODS:
- setAuthToken(token) - Store auth token
- fetchUserProfile() - GET /api/user/profile
- saveApplication(data) - POST /api/applications
- trackUsage(event) - POST /api/analytics/extension (for metrics)

BACKGROUND SERVICE WORKER:
- Listen for messages from popup/content scripts
- Handle API calls (can't make fetch from content scripts in MV3)
- Send responses back to popup

INTEGRATION POINTS:
1. On extension install → Track "extension_installed" event
2. On successful login → Fetch user profile, store in chrome.storage
3. On "Fill Form" click → Fetch latest user data (in case it changed)
4. After form filled → Save application to Jalanea database
5. Track usage: "form_detected", "form_filled", "error_occurred"

REQUIREMENTS:
- All API calls use Authorization: Bearer {token} header
- Handle 401 Unauthorized (token expired → logout user)
- Retry failed requests once before showing error
- Cache user data for 1 hour (don't fetch on every popup open)

Test by using Jalanea staging API endpoint.
```

**Expected Time:** 4-5 hours

---

## PHASE 6: TESTING & BUG FIXES (Week 3, Day 3-5)

### PROMPT FOR CLAUDE CODE:

```
Test Apply Copilot on multiple job sites and fix bugs.

SITES TO TEST:
1. Indeed.com - Standard application + Quick Apply
2. LinkedIn.com - Easy Apply + Full Application
3. Workday.com - Career portal
4. Greenhouse.io - Standard form
5. Lever.co - Multi-page form

FOR EACH SITE:
- Navigate to job application
- Open extension popup
- Check "Form detected" state shows correct field count
- Click "Fill Form"
- Verify fields are filled correctly
- Check for any errors in console
- Note which fields were missed

CREATE TEST REPORT:
- File: TEST_RESULTS.md
- Format:
  Site: Indeed.com
  Form Type: Standard Application
  Fields Detected: 12/15
  Fields Filled: 11/12
  Issues:
    - "Work experience" textarea not detected
    - Resume upload failed
  Status: ✅ Mostly working / ⚠️ Needs fixes / ❌ Broken

FIX COMMON ISSUES:
1. Add site-specific field patterns to field-detector.js
2. Handle multi-page forms (detect "Next" button, wait for next page)
3. Handle dynamic forms (fields added via JavaScript after page load)
4. Add retry logic for slow-loading forms

GOAL: 90%+ success rate across all major job sites.
```

**Expected Time:** 8-12 hours

---

## PHASE 7: POLISH & CHROME WEB STORE (Week 4)

### PROMPT FOR CLAUDE CODE:

```
Final polish before Chrome Web Store submission.

IMPROVEMENTS TO ADD:
1. Better error messages
   - "Oops! Couldn't fill some fields. Review manually."
   - "No resume found. Upload one at jalanea.works"
2. Success animations
   - Check mark animation after successful fill
   - Progress indicator during fill (Filling 12 fields...)
3. Keyboard shortcuts
   - Alt+Shift+F to trigger fill (when on job site)
4. Tooltips
   - Hover over "?" icon for help text
5. Settings page improvements
   - Last sync time: "2 hours ago"
   - Data preview (show what will be filled)
6. Onboarding tour
   - First-time users see 3-step tutorial

CREATE ASSETS FOR CHROME WEB STORE:
1. README.md - User installation instructions
2. PRIVACY.md - Privacy policy (what data we collect)
3. screenshots/ folder - 3 screenshots (1280x800)
   - Screenshot 1: Popup showing "Form detected"
   - Screenshot 2: Indeed form with fields highlighted
   - Screenshot 3: Settings page
4. Store listing copy (save to STORE_LISTING.txt)

PREPARE SUBMISSION PACKAGE:
- Zip entire /jalanea-apply-copilot folder
- Ensure no console.log() statements in production
- Minify code (optional, but recommended)
- Verify all icons are correct size

SUBMIT TO CHROME WEB STORE:
1. Developer Dashboard: https://chrome.google.com/webstore/devconsole
2. Pay $5 registration fee (one-time)
3. Upload ZIP file
4. Fill store listing (title, description, screenshots)
5. Submit for review (3-5 days)

After approval, update Jalanea Works website with download link.
```

**Expected Time:** 6-8 hours

---

## QUICK START SCRIPT

Copy this entire block into Claude Code terminal to start building:

```bash
# Initialize project
mkdir jalanea-apply-copilot
cd jalanea-apply-copilot
mkdir icons utils

# Create empty files
touch manifest.json popup.html popup.js content.js background.js
touch auth.html auth.js settings.html settings.js styles.css
touch utils/field-detector.js utils/api-client.js
touch README.md

# Create placeholder icons (you'll replace these with real Jalanea logos)
echo "Create 16x16, 48x48, 128x128 PNG icons of Jalanea logo"

# Ready to build!
echo "Project structure created. Start with Phase 1 prompt."
```

---

## JALANEA BACKEND ENDPOINTS (TO BUILD SEPARATELY)

The extension needs these API endpoints on Jalanea Works backend:

### 1. POST /api/auth/login
```typescript
// Input: { email, password }
// Output: { token, userTier, userData }
```

### 2. GET /api/user/profile
```typescript
// Headers: Authorization: Bearer {token}
// Output: { 
//   id, name, email, phone, tier, 
//   address: { street, city, state, zip },
//   workHistory: [{ company, title, startDate, endDate }],
//   education: [{ school, degree, graduationDate }],
//   linkedin, portfolio
// }
```

### 3. POST /api/applications
```typescript
// Headers: Authorization: Bearer {token}
// Input: { job_url, job_title, company, status, application_method, applied_at }
// Output: { id, status }
```

### 4. POST /api/analytics/extension
```typescript
// Headers: Authorization: Bearer {token}
// Input: { event, timestamp, metadata }
// Output: { success: true }
```

---

## COST BREAKDOWN

**Development:**
- Time: 30-40 hours
- Cost: $0 (DIY with Claude Code)

**Chrome Web Store:**
- Registration: $5 one-time
- Annual renewal: $0

**Ongoing:**
- Hosting: $0 (extension runs locally)
- API calls: Included in Jalanea infrastructure
- Maintenance: 2-4 hours/month

**Total: $5 one-time fee + your time**

---

## SUCCESS METRICS

**Target KPIs:**
- 1,000 installs in Month 1
- 4.5+ star rating
- 80%+ form fill success rate
- <5% uninstall rate
- 50% of Starter tier users activate extension

---

## TROUBLESHOOTING

**Issue:** Extension not loading  
**Fix:** Check manifest.json syntax, verify all files exist

**Issue:** Popup shows blank screen  
**Fix:** Check console for JavaScript errors, verify styles.css loaded

**Issue:** Form detection not working  
**Fix:** Add console.log() in content.js to see which fields detected

**Issue:** Auth token not persisting  
**Fix:** Verify chrome.storage.local permissions in manifest.json

**Issue:** Can't fill forms on specific site  
**Fix:** Add site to host_permissions, check if site uses Shadow DOM

---

**END OF BUILD GUIDE**

*You got this! Start with Phase 1 and work through step by step.* 🚀

