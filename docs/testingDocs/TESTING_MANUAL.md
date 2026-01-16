# Jalanea Works - Manual Verification Checklist

## For Human Testing Only

This document contains tests that **REQUIRE human input** and cannot be automated. Complete these after Claude Code finishes autonomous testing.

---

## Why These Are Manual

These tests require:
- Real payment credentials (not test cards)
- Real biometric devices (Face ID, Touch ID, Windows Hello)
- Real email delivery verification
- Subjective visual judgment
- Real mobile devices (not emulators)
- Real screen reader software

---

## 1. Payment Processing (Real Cards)

> ⚠️ **Use LIVE Stripe mode with real payment method**

| # | Test | Steps | Expected | Pass? |
|---|------|-------|----------|-------|
| 1 | **Real card successful charge** | Use your own card in LIVE mode to complete a purchase. Check your card statement. | Charge appears on statement with correct amount | [ ] |
| 2 | **Refund processing** | Request refund through Stripe dashboard. Wait 5-10 business days. | Refund appears on card statement | [ ] |
| 3 | **Real declined card** | Use a card that will decline (over limit, expired, frozen) | Decline error shows correctly | [ ] |
| 4 | **Apple Pay on iPhone** | Test Apple Pay payment on real iOS device | Payment completes via Apple Pay | [ ] |
| 5 | **Google Pay on Android** | Test Google Pay on real Android device | Payment completes via Google Pay | [ ] |
| 6 | **Subscription renewal** | Wait for billing cycle (or use Stripe test clock) | Renewal charges correctly | [ ] |
| 7 | **Invoice email delivery** | Complete purchase, check email | Invoice email arrives with correct details | [ ] |
| 8 | **Receipt email delivery** | Complete purchase, check email | Receipt email arrives | [ ] |
| 9 | **Failed payment email** | Use expiring card, let renewal fail | Failure notification email arrives | [ ] |
| 10 | **Card update flow** | Update payment method in settings | New card used for next charge | [ ] |

### Payment Notes
```
Test Date: _______________
Tester: _______________
Card Used (last 4): _______________
Amount Charged: $_______________
Statement Description: _______________
```

---

## 2. Account Security (Real Credentials)

> ⚠️ **Use real accounts and devices**

| # | Test | Steps | Expected | Pass? |
|---|------|-------|----------|-------|
| 11 | **Passkey - Face ID (iPhone)** | Register passkey with Face ID on real iPhone. Logout. Login with Face ID. | Biometric login works | [ ] |
| 12 | **Passkey - Touch ID (iPhone/Mac)** | Register passkey with Touch ID. Logout. Login with Touch ID. | Biometric login works | [ ] |
| 13 | **Passkey - Windows Hello** | Register passkey with Windows Hello. Logout. Login with fingerprint/face/PIN. | Windows Hello login works | [ ] |
| 14 | **Passkey - Android fingerprint** | Register passkey on Android. Logout. Login with fingerprint. | Biometric login works | [ ] |
| 15 | **Password reset email** | Request reset, check email, click link, set new password, login | Full reset flow works | [ ] |
| 16 | **Email verification** | Sign up, check email, click verification link | Account verified | [ ] |
| 17 | **Welcome email** | Sign up new account, check email | Welcome email arrives | [ ] |
| 18 | **Account deletion - complete** | Delete account, verify in Supabase dashboard that all data is removed | All user data deleted | [ ] |
| 19 | **Account deletion - cannot login** | After deletion, try to login | Login fails, appropriate message | [ ] |
| 20 | **Data export - complete** | Export data, open JSON, verify all your data is included | Export contains all user data | [ ] |
| 21 | **Data export - no secrets** | Check exported JSON | No passwords, tokens, or internal IDs exposed | [ ] |

### Email Delivery Notes
```
Email Provider: _______________
Password Reset: Arrived [ ] Yes [ ] No | Time: _____ minutes
Verification: Arrived [ ] Yes [ ] No | Time: _____ minutes
Welcome: Arrived [ ] Yes [ ] No | Time: _____ minutes
Invoice: Arrived [ ] Yes [ ] No | Time: _____ minutes
```

---

## 3. Real Device Testing

> ⚠️ **Test on actual physical devices, not simulators**

### iPhone Testing

| # | Test | Device Model | iOS Version | Pass? |
|---|------|--------------|-------------|-------|
| 22 | App loads correctly | | | [ ] |
| 23 | Bottom navigation works | | | [ ] |
| 24 | Keyboard doesn't cover inputs | | | [ ] |
| 25 | Swipe gestures work | | | [ ] |
| 26 | Safe area insets respected | | | [ ] |
| 27 | Landscape orientation works | | | [ ] |
| 28 | Safari browser compatible | | | [ ] |
| 29 | PWA install works (if applicable) | | | [ ] |
| 30 | Push notifications work (if applicable) | | | [ ] |

**iPhone Test Notes:**
```
Device: _______________
iOS Version: _______________
Safari Version: _______________
Issues Found: _______________
```

### Android Testing

| # | Test | Device Model | Android Version | Pass? |
|---|------|--------------|-----------------|-------|
| 31 | App loads correctly | | | [ ] |
| 32 | Bottom navigation works | | | [ ] |
| 33 | Keyboard doesn't cover inputs | | | [ ] |
| 34 | Back button behavior | | | [ ] |
| 35 | Chrome browser compatible | | | [ ] |
| 36 | Samsung Internet compatible | | | [ ] |
| 37 | Different screen densities | | | [ ] |
| 38 | Landscape orientation works | | | [ ] |

**Android Test Notes:**
```
Device: _______________
Android Version: _______________
Chrome Version: _______________
Issues Found: _______________
```

---

## 4. Visual Design Verification

> ⚠️ **Requires subjective human judgment**

| # | Aspect | What to Check | Pass? |
|---|--------|---------------|-------|
| 39 | **Brand colors consistent** | Gold (#FFC425) and gray (#1F2937) used consistently across ALL pages | [ ] |
| 40 | **Typography hierarchy** | Headings clearly distinguishable, body text readable, consistent fonts | [ ] |
| 41 | **Spacing consistency** | Consistent margins/padding, no cramped or awkward gaps | [ ] |
| 42 | **Animation smoothness** | Framer Motion animations smooth, not jarring or stuttering | [ ] |
| 43 | **Loading states feel good** | Skeleton loaders and spinners don't feel frustrating | [ ] |
| 44 | **Empty states encouraging** | Empty states feel positive, clear CTA to take action | [ ] |
| 45 | **Error states helpful** | Error messages are clear, actionable, not blaming user | [ ] |
| 46 | **Icon clarity** | All icons recognizable, consistent Lucide style, appropriate sizes | [ ] |
| 47 | **Image quality** | No pixelated or stretched images | [ ] |
| 48 | **Dark mode (if exists)** | Colors work well, no white flashes, readable text | [ ] |
| 49 | **Form aesthetics** | Forms look clean, inputs properly sized, good visual feedback | [ ] |
| 50 | **Button hierarchy** | Primary/secondary buttons clearly distinguished | [ ] |
| 51 | **Card designs** | Job cards look professional, information scannable | [ ] |
| 52 | **Modal overlays** | Modals centered, backdrop appropriate, close buttons clear | [ ] |
| 53 | **Navigation clarity** | Current location always clear, easy to navigate | [ ] |
| 54 | **Mobile bottom nav** | Thumb-friendly, icons clear, active state obvious | [ ] |
| 55 | **Overall polish** | App feels professional and trustworthy | [ ] |

### Visual Design Notes
```
Overall Impression (1-10): ___
Areas Needing Work: _______________
_______________
_______________
```

---

## 5. Screen Reader Testing

> ⚠️ **Use actual screen reader software**

### VoiceOver (Mac/iOS)

| # | Test | Pass? |
|---|------|-------|
| 56 | Can navigate all interactive elements | [ ] |
| 57 | Headings announced in correct order | [ ] |
| 58 | Form labels read correctly | [ ] |
| 59 | Button purposes clear | [ ] |
| 60 | Images have descriptive alt text | [ ] |
| 61 | Error messages announced | [ ] |
| 62 | Loading states announced | [ ] |
| 63 | Modal focus trapped correctly | [ ] |
| 64 | Page landmarks navigable | [ ] |

### NVDA/JAWS (Windows)

| # | Test | Pass? |
|---|------|-------|
| 65 | Can navigate all interactive elements | [ ] |
| 66 | Headings announced in correct order | [ ] |
| 67 | Form labels read correctly | [ ] |
| 68 | Button purposes clear | [ ] |
| 69 | Tables read correctly | [ ] |
| 70 | Live regions announce updates | [ ] |

### Screen Reader Notes
```
Screen Reader Used: _______________
Version: _______________
Major Issues: _______________
_______________
```

---

## 6. Browser Compatibility

> ⚠️ **Test on real browsers, not just DevTools**

| # | Browser | Version | OS | Pass? |
|---|---------|---------|-----|-------|
| 71 | Chrome | | Windows | [ ] |
| 72 | Chrome | | Mac | [ ] |
| 73 | Firefox | | Windows | [ ] |
| 74 | Firefox | | Mac | [ ] |
| 75 | Safari | | Mac | [ ] |
| 76 | Safari | | iOS | [ ] |
| 77 | Edge | | Windows | [ ] |
| 78 | Samsung Internet | | Android | [ ] |

### Browser-Specific Issues
```
Browser: _______________ Issue: _______________
Browser: _______________ Issue: _______________
Browser: _______________ Issue: _______________
```

---

## 7. Content Review

> ⚠️ **Human review for spelling, grammar, tone**

| # | Area | What to Check | Pass? |
|---|------|---------------|-------|
| 79 | **Homepage copy** | No typos, clear value proposition, professional tone | [ ] |
| 80 | **Onboarding copy** | Instructions clear, encouraging language | [ ] |
| 81 | **Error messages** | Grammatically correct, helpful, not blaming | [ ] |
| 82 | **Success messages** | Celebratory but professional | [ ] |
| 83 | **Button labels** | Action-oriented, consistent (e.g., "Save" vs "Submit") | [ ] |
| 84 | **Form labels** | Clear, concise, proper capitalization | [ ] |
| 85 | **Pricing copy** | Prices accurate, features clearly described | [ ] |
| 86 | **Footer content** | Links work, copyright current year | [ ] |
| 87 | **Legal pages** | Privacy policy and terms accessible | [ ] |
| 88 | **Empty states** | Helpful guidance, encouraging tone | [ ] |

### Content Issues Found
```
Page: _______________ Issue: _______________
Page: _______________ Issue: _______________
Page: _______________ Issue: _______________
```

---

## 8. Edge Case Scenarios

> ⚠️ **Requires human setup and verification**

| # | Scenario | Steps | Expected | Pass? |
|---|----------|-------|----------|-------|
| 89 | **First-time user experience** | Create brand new account, go through entire onboarding | Intuitive, no confusion | [ ] |
| 90 | **Returning user after 30 days** | Login after not using for a month | Easy to pick up where left off | [ ] |
| 91 | **User with 100+ applications** | Create many applications, check performance | No slowdown | [ ] |
| 92 | **User with multiple resumes** | Create several resumes, manage them | Easy to organize | [ ] |
| 93 | **Interruption recovery** | Start checkout, close browser, return | Can complete or restart cleanly | [ ] |
| 94 | **Multi-device usage** | Login on phone, then desktop | Data synced correctly | [ ] |
| 95 | **Very slow typing** | Type slowly with long pauses | No timeout or lost data | [ ] |
| 96 | **Copy-paste content** | Paste long text from Word | Formatting handled | [ ] |

---

## 9. PWA Installation (Real Devices)

> ⚠️ **Must test on actual devices, not emulators**

### iPhone PWA Install

| # | Test | Steps | Expected | Pass? |
|---|------|-------|----------|-------|
| 97 | Install to Home Screen | Safari → Share → Add to Home Screen | App icon appears on home screen | [ ] |
| 98 | Launch from Home Screen | Tap app icon | Opens in standalone (no Safari UI) | [ ] |
| 99 | Splash screen displays | Launch app | Custom splash with logo/colors | [ ] |
| 100 | Status bar color | Check top of screen | Theme color (#1F2937 or #FFC425) | [ ] |
| 101 | Offline works on iPhone | Enable airplane mode, open app | Cached content loads | [ ] |
| 102 | Navigation in standalone | Use app, check back behavior | Works without browser controls | [ ] |
| 103 | Re-open after close | Close app, reopen | App restores state | [ ] |
| 104 | Badge updates (if applicable) | Check for badge on icon | Shows notification count | [ ] |

### Android PWA Install

| # | Test | Steps | Expected | Pass? |
|---|------|-------|----------|-------|
| 105 | Install prompt appears | Visit site in Chrome | "Add to Home Screen" banner | [ ] |
| 106 | Install via menu | Chrome menu → Install app | App installs to device | [ ] |
| 107 | App in app drawer | Check Android app drawer | App appears like native app | [ ] |
| 108 | Launch from icon | Tap app icon | Opens in standalone | [ ] |
| 109 | Splash screen displays | Launch app | Custom splash shown | [ ] |
| 110 | System back button | Use Android back button | Navigates correctly in app | [ ] |
| 111 | Offline works on Android | Enable airplane mode | Cached content loads | [ ] |
| 112 | App info in settings | Android Settings → Apps | App appears with correct info | [ ] |
| 113 | Uninstall works | Long press → Uninstall | App removes cleanly | [ ] |

### Desktop PWA Install

| # | Test | Steps | Expected | Pass? |
|---|------|-------|----------|-------|
| 114 | Chrome install icon | Check address bar | Install icon visible | [ ] |
| 115 | Install via icon | Click install icon | App installs to desktop | [ ] |
| 116 | Desktop shortcut | Check desktop/applications | App shortcut created | [ ] |
| 117 | Opens in own window | Launch from shortcut | Separate window, no browser UI | [ ] |
| 118 | Window controls | Check title bar | Custom title bar (if configured) | [ ] |
| 119 | Taskbar icon | Check Windows taskbar / Mac Dock | App icon appears correctly | [ ] |
| 120 | Offline on desktop | Disconnect network | Cached content loads | [ ] |

### PWA Notes
```
iPhone Model: _______________ iOS: _______________
Android Model: _______________ Version: _______________
Desktop OS: _______________ Chrome Version: _______________

Issues Found:
_______________________________________________
_______________________________________________
```

---

## 10. Pre-Launch Security Checklist

> ⚠️ **Final security verification**

| # | Check | Verified? |
|---|-------|-----------|
| 121 | Stripe is in LIVE mode for production | [ ] |
| 122 | All API keys are production keys | [ ] |
| 123 | Environment variables set in Vercel | [ ] |
| 124 | No test data visible to users | [ ] |
| 125 | HTTPS enforced everywhere | [ ] |
| 126 | Rate limiting active | [ ] |
| 127 | Error pages don't leak stack traces | [ ] |
| 128 | Admin routes protected | [ ] |
| 129 | Supabase RLS policies active | [ ] |
| 130 | No console.log with sensitive data | [ ] |

---

## Final Sign-Off

### Test Summary

| Category | Total Tests | Passed | Failed |
|----------|-------------|--------|--------|
| Payment (Real Cards) | 10 | | |
| Account Security | 11 | | |
| iPhone Testing | 9 | | |
| Android Testing | 8 | | |
| Visual Design | 17 | | |
| Screen Reader | 15 | | |
| Browser Compatibility | 8 | | |
| Content Review | 10 | | |
| Edge Cases | 8 | | |
| PWA - iPhone | 8 | | |
| PWA - Android | 9 | | |
| PWA - Desktop | 7 | | |
| Security Checklist | 10 | | |
| **TOTAL** | **130** | | |

### Critical Issues Found

```
Issue 1: _______________
Severity: [ ] Critical [ ] High [ ] Medium [ ] Low
Status: [ ] Open [ ] Fixed [ ] Won't Fix

Issue 2: _______________
Severity: [ ] Critical [ ] High [ ] Medium [ ] Low
Status: [ ] Open [ ] Fixed [ ] Won't Fix

Issue 3: _______________
Severity: [ ] Critical [ ] High [ ] Medium [ ] Low
Status: [ ] Open [ ] Fixed [ ] Won't Fix
```

### Approval Signatures

**All critical and high-severity issues must be resolved before sign-off.**

| Role | Name | Date | Signature |
|------|------|------|-----------|
| QA Lead | | | |
| Product Owner | | | |
| Developer Lead | | | |

### Go/No-Go Decision

- [ ] **GO** - All tests pass, ready for production
- [ ] **NO-GO** - Critical issues remain, list blockers below:

```
Blockers:
1. _______________
2. _______________
3. _______________
```

---

*Document Version: 2.0 | Last Updated: January 2026*
