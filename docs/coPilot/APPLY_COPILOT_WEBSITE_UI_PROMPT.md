# APPLY COPILOT WEBSITE UI - BUILD PROMPT
*For Claude Code - Add to Jalanea Works Website*
**January 16, 2026**

---

## 🎯 GOAL

Add a promotional section to the Jalanea Works website that:
1. Explains what Apply Copilot is
2. Shows benefits and features
3. Provides download link to Chrome Web Store
4. Only shows to Starter+ tier users

---

## 📍 WHERE TO ADD THIS

**Option 1: Dashboard Page** (`/app/dashboard/page.tsx`)  
- Show card at top: "Get Apply Copilot Extension"
- Most visible to logged-in users

**Option 2: Separate Page** (`/app/copilot/page.tsx`)  
- Dedicated landing page for Apply Copilot
- Link from dashboard nav

**Option 3: Both**  
- Dashboard card (if extension not installed)
- Full page with details

---

## 🚀 PROMPT FOR CLAUDE CODE

Copy and paste this into Claude Code:

```
Build a promotional section for "Apply Copilot" Chrome extension on Jalanea Works website.

LOCATION: Create new page at /app/copilot/page.tsx

REQUIREMENTS:

1. HERO SECTION
   - Headline: "Apply to Jobs 5x Faster with Apply Copilot"
   - Subheading: "Auto-fill job applications with your profile. One click, done."
   - CTA Button: "Add to Chrome" (links to Chrome Web Store)
   - Visual: Screenshot or demo GIF of extension in action

2. HOW IT WORKS (3 STEPS)
   - Step 1: Install extension (icon: puzzle piece)
   - Step 2: Navigate to job site (icon: compass)
   - Step 3: Click "Fill Form" (icon: zap)
   - Each step has short description (1 sentence)

3. FEATURES GRID (4 cards)
   - Feature 1: "Works Everywhere"
     - Indeed, LinkedIn, Workday, Greenhouse, 1000+ sites
     - Icon: globe
   - Feature 2: "Save Time"
     - 15 min → 3 min per application
     - Icon: clock
   - Feature 3: "Stay in Control"
     - Review before submitting, no spam
     - Icon: shield
   - Feature 4: "Syncs Automatically"
     - Updates when you update Jalanea profile
     - Icon: refresh

4. SUPPORTED SITES (logos)
   - Show logos of: Indeed, LinkedIn, Workday, Greenhouse, Lever
   - Text: "...and 1,000+ more job sites"

5. PRICING CALLOUT
   - Box: "Apply Copilot is included in Starter tier and above"
   - Current tier badge (Essential → "Upgrade to unlock")
   - Pricing: Starter $25/mo | Professional $50/mo | Max $100/mo
   - Link: "Compare Plans"

6. FAQ SECTION (5 questions)
   - Q: Is my data safe?
     A: Yes. Data stored locally, never shared.
   - Q: Does it work on mobile?
     A: Desktop only (Chrome, Edge, Brave)
   - Q: What fields can it fill?
     A: Contact info, work history, education, resume
   - Q: Can I edit before submitting?
     A: Absolutely! Review all fields before submit.
   - Q: How do I uninstall?
     A: chrome://extensions → Remove

7. CTA FOOTER
   - "Ready to speed up your job search?"
   - Button: "Get Apply Copilot Free" (for Starter+ users)
   - Button: "Upgrade to Unlock" (for Essential users)

DESIGN NOTES:
- Use Tailwind CSS (match existing Jalanea design system)
- Color scheme: Blue (#2563eb) for primary CTA
- Spacing: Large hero (80px padding), sections (40px margin)
- Responsive: Stack on mobile, 2-column on desktop
- Accessibility: Alt text on images, semantic HTML

TECH STACK:
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion (optional, for scroll animations)

BONUS: Add install detection
- If user has extension installed, show: "✓ Extension Installed! Go apply to jobs."
- If not installed, show: "Add to Chrome" button

Create complete, production-ready page. Include all copy, styling, and responsiveness.
```

---

## 🔗 CHROME WEB STORE LINK

**Once extension is published, update the link:**

```typescript
// In /app/copilot/page.tsx

const CHROME_STORE_URL = 'https://chrome.google.com/webstore/detail/[EXTENSION_ID]';

<a href={CHROME_STORE_URL} target="_blank" rel="noopener noreferrer">
  <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg">
    Add to Chrome - It's Free
  </button>
</a>
```

**Before publishing, use placeholder:**
```typescript
const CHROME_STORE_URL = '#'; // Update after Chrome Web Store approval
```

---

## 📊 DASHBOARD CARD (OPTIONAL)

If you want a quick promo card on the dashboard:

```
Add Apply Copilot promo card to dashboard page.

LOCATION: /app/dashboard/page.tsx

CARD DESIGN:
- Position: Top of dashboard, above stats
- Dismissible: User can click "X" to hide (save preference)
- Visibility: Only show to Starter+ users who DON'T have extension

CONTENT:
- Icon: Chrome logo + Jalanea logo
- Headline: "New: Apply Copilot Extension"
- Description: "Auto-fill job applications in 3 clicks. Save 15 min per application."
- CTA: "Install Extension" → Links to /copilot page or Chrome Web Store
- Secondary link: "Learn More" → /copilot page

DETECTION:
- Check if extension installed:
  - Send message to extension: chrome.runtime.sendMessage(EXTENSION_ID, { action: 'ping' })
  - If response: Extension installed (hide card)
  - If no response: Extension not installed (show card)

STYLING:
- Gradient background (blue to purple)
- White text
- Prominent placement
- Animate in on page load (fade in from top)

Create as reusable component: /components/dashboard/ApplyCopilotCard.tsx
```

---

## 🎨 ASSETS NEEDED

**Images:**
1. **Extension screenshot** (1280x800)
   - Popup showing "Form detected! 12 fields ready"
   - Save as: `/public/images/copilot-popup.png`

2. **Demo GIF** (800x600, <2MB)
   - User clicks extension → Form fills → Fields highlighted green
   - Save as: `/public/images/copilot-demo.gif`

3. **Job site logos** (100x100 each)
   - Indeed, LinkedIn, Workday, Greenhouse, Lever
   - Save in: `/public/images/job-sites/`

4. **Chrome Web Store badge** (496x150)
   - Official "Available in Chrome Web Store" badge
   - Download from: https://developer.chrome.com/webstore/branding
   - Save as: `/public/images/chrome-badge.png`

---

## 🧪 TESTING CHECKLIST

After building the page:

- [ ] Page loads at /copilot
- [ ] All images render
- [ ] "Add to Chrome" button links to correct URL
- [ ] Responsive on mobile (stacks properly)
- [ ] FAQ accordions work
- [ ] Tier checking works (Essential sees "Upgrade", Starter sees "Install")
- [ ] Dashboard card appears (if implemented)
- [ ] Dashboard card dismisses and stays dismissed
- [ ] Extension detection works (hides card if installed)

---

## 📈 ANALYTICS TRACKING

Add analytics events:

```typescript
// Track clicks on "Add to Chrome" button
onClick={() => {
  trackEvent('apply_copilot_install_clicked', {
    source: 'landing_page',
    user_tier: userTier
  });
  window.open(CHROME_STORE_URL, '_blank');
}}

// Track page views
useEffect(() => {
  trackEvent('apply_copilot_page_viewed', {
    user_tier: userTier,
    has_extension: extensionInstalled
  });
}, []);
```

---

## 🚀 LAUNCH CHECKLIST

Before going live:

1. **Extension Published:**
   - [ ] Extension approved by Chrome Web Store
   - [ ] Extension ID obtained
   - [ ] Update CHROME_STORE_URL in code

2. **Website Ready:**
   - [ ] /copilot page built and tested
   - [ ] Dashboard card built (optional)
   - [ ] All images uploaded
   - [ ] Responsive design verified

3. **Communication:**
   - [ ] Email to existing Starter+ users
   - [ ] In-app notification in dashboard
   - [ ] Social media post (Twitter, LinkedIn)
   - [ ] Blog post: "Introducing Apply Copilot"

4. **Support:**
   - [ ] Help docs updated (jalanea.works/help/copilot)
   - [ ] FAQ added to support page
   - [ ] Support team trained

---

## 📧 EMAIL TEMPLATE (Send to Starter+ Users)

```html
Subject: New: Apply Copilot Extension 🚀

Hi [Name],

Great news! We just launched Apply Copilot - a Chrome extension that auto-fills job applications with your Jalanea Works profile.

**What it does:**
- Detects job application forms (Indeed, LinkedIn, 1000+ sites)
- Auto-fills contact info, work history, education, resume
- Saves you 15 minutes per application

**How to get it:**
1. Visit jalanea.works/copilot
2. Click "Add to Chrome"
3. Start applying to jobs faster!

Apply Copilot is included FREE with your Starter tier subscription. No extra cost.

Ready to speed up your job search?
👉 Install Apply Copilot Now: [LINK]

Questions? Reply to this email or visit jalanea.works/help

Happy job hunting!
- The Jalanea Works Team
```

---

## 🎉 POST-LAUNCH

**Week 1:**
- Monitor Chrome Web Store reviews
- Track install count daily
- Fix any bugs reported
- Respond to user feedback

**Week 2:**
- Analyze usage metrics (forms filled, time saved)
- Calculate ROI (did installs increase Starter tier signups?)
- Iterate on UX based on feedback

**Week 3:**
- Write case study ("Users saved 200+ hours in first week")
- Share success stories on social media
- Update marketing materials with testimonials

---

**QUICK START:** Copy the main prompt above and paste into Claude Code. You'll have a beautiful landing page in 30 minutes!

🚀 Let's go!
