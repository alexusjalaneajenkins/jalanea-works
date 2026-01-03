# Apply Co-Pilot

A human-in-the-loop job application assistant PWA for Indeed, LinkedIn, ZipRecruiter, and Glassdoor.

## 🚫 Non-Negotiable Constraints

This app is designed with strict safety and privacy constraints:

1. **NO CAPTCHA/Bot Bypass** - We do NOT implement CAPTCHA solving, Cloudflare bypassing, stealth plugins, residential proxies, or any traffic obfuscation.

2. **NO Password Storage** - User passwords are NEVER stored. Users log into job sites in their own browser.

3. **Human-in-the-Loop Only** - The user completes any verification challenges themselves and clicks "Submit" themselves. We only assist with form filling via copy/paste.

4. **Explicit User Action** - Copy buttons require explicit tap. No auto-submission of forms.

5. **Privacy-Safe Logging** - All logs redact PII (names, emails, phone numbers).

6. **Local-First Data** - Sensitive profile data is stored encrypted in IndexedDB. Minimal data sent to backend.

## 📱 PWA Architecture

This is a **Progressive Web App** (not native mobile). Due to browser same-origin restrictions, the PWA cannot directly access or autofill forms on job sites. Instead:

- **Phase 1 (Current)**: Copy/paste workflow - user copies data from the app and pastes into job applications
- **Phase 2 (Future)**: Chrome Extension "Turbo Mode" for desktop users with field detection

## 🎯 Screens

1. **Vault Setup** (`/vault`) - Profile, work history, education
2. **Job Queue** (`/jobs`) - Paste job URLs, auto-detect board
3. **Apply Sprint** (`/apply`) - Large copy buttons, open job link, mark submitted
4. **Tracker** (`/tracker`) - Application status, notes, follow-up dates

## 🏗️ Project Structure

```
apply-copilot/
├── web/             # Next.js PWA (TypeScript + Tailwind)
│   └── src/
│       ├── app/           # Next.js App Router pages
│       ├── components/    # Reusable UI components
│       ├── lib/           # Dexie DB, adapters
│       └── stores/        # Zustand state stores
├── shared/          # Shared TypeScript types
│   └── src/
│       └── types/         # Interfaces + models
├── server/          # Node.js backend (minimal, future)
└── package.json     # pnpm workspace root
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ (v22 works but 20 LTS recommended)
- Use `npx pnpm` (global pnpm install may fail due to permissions)

### Installation

```bash
cd apply-copilot

# Install dependencies (use npx pnpm, not global pnpm)
npx pnpm install

# Build shared types
npx pnpm -C shared build

# Start development server
npx pnpm dev
# Opens at http://localhost:3000

# Run type check
npx pnpm -C web typecheck

# Run lint
npx pnpm -C web lint
```

### Note on pnpm

On some Macs, `/usr/local` has permission issues preventing global pnpm install. Always use `npx pnpm` instead of installing pnpm globally.

## 🎯 Supported Job Boards

| Board | Status | URL Detection |
|-------|--------|---------------|
| Indeed | ✅ Ready | `indeed.com/viewjob`, `indeed.com/jobs` |
| LinkedIn | ✅ Ready | `linkedin.com/jobs/view` |
| ZipRecruiter | ✅ Ready | `ziprecruiter.com/jobs` |
| Glassdoor | ✅ Ready | `glassdoor.com/job-listing` |

## 🔒 Security & Privacy

- **Vault data** encrypted in IndexedDB (browser storage)
- **No session cookies** exfiltrated or stored
- **No credentials** stored anywhere
- **PWA cannot access** cross-origin job site DOMs
- **PII redacted** in all log output

## 📱 PWA Features

- Install to home screen on mobile
- Works offline (data stored locally)
- Mobile-first responsive design
- Large touch targets (44px minimum)

## 📜 License

Private - Jalanea Works
