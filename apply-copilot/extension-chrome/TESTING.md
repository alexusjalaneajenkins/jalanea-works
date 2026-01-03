# Apply Co-Pilot Extension - Manual Smoke Test Checklist

## Prerequisites

1. Build the extension:
   ```bash
   cd extension-chrome
   npx pnpm install
   npx pnpm build
   ```

2. Export vault from PWA:
   - Open `http://localhost:3000/vault`
   - Click "Export" button
   - Copy JSON or download file

## Load Extension in Chrome

1. Open `chrome://extensions/`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `extension-chrome` folder
5. Verify extension appears with rocket icon

---

## Test 1: Import Vault

**Steps:**
1. Click the Apply Co-Pilot extension icon in toolbar
2. In the popup, either:
   - **Paste**: Paste vault JSON directly into textarea
   - **Upload**: Click "Upload File" and select the exported JSON
3. Click **Import Vault**

**Expected:**
- [ ] Success message: "Vault imported successfully!"
- [ ] Popup shows user's name and email
- [ ] "Vault connected" status with green dot

---

## Test 2: Overlay Appears on Supported Pages

**Test each site:**

| Site | Test URL | Expected |
|------|----------|----------|
| Indeed | `https://www.indeed.com/jobs?q=software` | Overlay visible |
| Indeed viewjob | Click any job listing | Overlay visible |
| LinkedIn | `https://www.linkedin.com/jobs/` | Overlay visible |
| ZipRecruiter | `https://www.ziprecruiter.com/jobs/` | Overlay visible |
| Glassdoor | `https://www.glassdoor.com/Job/` | Overlay visible |

**Steps:**
1. Navigate to each URL above
2. Look for floating rocket button OR slide-in panel on right side
3. Click to expand if collapsed

**Expected:**
- [ ] Overlay appears within 2 seconds of page load
- [ ] Vault data displays in the panel
- [ ] Detected form fields shown (if any)

**Not Expected:**
- [ ] Overlay should NOT appear on non-job pages (indeed.com homepage, linkedin.com feed, etc.)

---

## Test 3: Fill-on-Click Only (No Auto-Fill)

**Steps:**
1. Navigate to a job application page with form fields
2. Observe the page immediately after load
3. Click "Fill" button for a specific field in the overlay

**Expected:**
- [ ] NO fields are filled automatically on page load
- [ ] Field ONLY fills AFTER explicit "Fill" button click
- [ ] Only the clicked field is filled (not all fields at once)

---

## Test 4: No Auto-Submit

**Steps:**
1. Fill all available fields using the overlay
2. Observe the submit button

**Expected:**
- [ ] Submit button is NEVER clicked automatically
- [ ] User must manually click submit
- [ ] No form submission without user action

---

## Test 5: Verification/CAPTCHA Detection

**Note:** Cloudflare Turnstile CAPTCHAs appear inconsistently. If encountered:

**Steps:**
1. Navigate to a page showing Cloudflare "Just a moment..." or CAPTCHA challenge
2. Observe the overlay status

**Expected:**
- [ ] Overlay shows "Verification detected" or similar pause message
- [ ] Form filling pauses automatically
- [ ] After solving CAPTCHA manually, overlay returns to normal state

---

## Test 6: Quick Copy in Popup

**Steps:**
1. Click extension icon to open popup
2. Click any "Quick Fill" button (Name, Email, Phone, Location)

**Expected:**
- [ ] Value copied to clipboard
- [ ] Button shows "Copied!" feedback
- [ ] Paste works in any text field

---

## Test 7: Rescan Page Fields

**Steps:**
1. Open popup while on a job page
2. Click "Rescan Page Fields" button

**Expected:**
- [ ] Button shows "Scanning..." briefly
- [ ] Button shows "Rescan Complete" or "Not on supported site"
- [ ] Field count updates if new fields found

---

## Troubleshooting

### Extension not loading
- Ensure TypeScript is compiled (`npx pnpm build`)
- Check for errors in `chrome://extensions/`
- Inspect popup: right-click icon > "Inspect popup"

### Overlay not appearing
- Verify URL matches supported patterns (see README.md)
- Check browser console for `[Apply Co-Pilot]` logs
- Try clicking the floating button if it exists

### Import failing
- Verify JSON has `schemaVersion: 1`
- Check required fields: firstName, lastName, email, phone, location
- Inspect popup console for specific error

---

## Pass/Fail Summary

| Test | Status |
|------|--------|
| 1. Import Vault | [ ] Pass / [ ] Fail |
| 2. Overlay on Supported Pages | [ ] Pass / [ ] Fail |
| 3. Fill-on-Click Only | [ ] Pass / [ ] Fail |
| 4. No Auto-Submit | [ ] Pass / [ ] Fail |
| 5. Verification Detection | [ ] Pass / [ ] Fail / [ ] N/A |
| 6. Quick Copy in Popup | [ ] Pass / [ ] Fail |
| 7. Rescan Page Fields | [ ] Pass / [ ] Fail |

**Tested by:** _________________
**Date:** _________________
**Extension Version:** _________________
