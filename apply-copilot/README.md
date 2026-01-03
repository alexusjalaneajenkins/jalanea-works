# Apply Co-Pilot

A human-in-the-loop mobile job application assistant for Indeed, LinkedIn, ZipRecruiter, and Glassdoor.

## 🚫 Non-Negotiable Constraints

This app is designed with strict safety and privacy constraints:

1. **NO CAPTCHA/Bot Bypass** - We do NOT implement CAPTCHA solving, Cloudflare bypassing, stealth plugins, residential proxies, or any traffic obfuscation.

2. **NO Password Storage** - User passwords are NEVER stored. Login happens in secure browser contexts (ASWebAuthenticationSession / Custom Tabs).

3. **Human-in-the-Loop Only** - The user completes any verification challenges themselves and clicks "Submit" themselves. We only assist with form filling.

4. **Explicit User Action** - Autofill is "Tap to Insert" only. No auto-submission of forms.

5. **Privacy-Safe Logging** - All logs redact PII (names, emails, phone numbers).

6. **Local-First Data** - Sensitive profile data is encrypted locally (Keychain/Keystore). Minimal data sent to backend.

## 📱 MVP Flow

1. **Create Application Vault** - User enters their profile, work history, education, and uploads resume
2. **Add Job** - Paste/share an Indeed job URL into the app
3. **Apply Sprint** - Opens job in in-app WebView with Assist Panel
4. **Detect Fields** - App detects form fields and suggests values from Vault
5. **Tap to Fill** - User taps to insert each field value (explicit action)
6. **Handle Verification** - If verification appears, app pauses with friendly UI
7. **Capture Submission** - Detect confirmation and save proof to Tracker

## 🏗️ Project Structure

```
apply-copilot/
├── mobile/          # React Native + TypeScript app
│   └── src/
│       ├── screens/       # App screens
│       ├── components/    # Reusable UI components
│       ├── services/      # Business logic
│       ├── adapters/      # Board-specific adapters
│       ├── storage/       # Encrypted local storage
│       ├── hooks/         # Custom React hooks
│       ├── navigation/    # React Navigation setup
│       └── utils/         # Helpers + constants
├── server/          # Node.js + TypeScript backend (minimal)
│   └── src/
│       ├── routes/        # API endpoints
│       ├── services/      # Business logic
│       └── db/            # Database setup
├── shared/          # Shared TypeScript types
│   └── src/
│       ├── types/         # Interfaces + models
│       └── constants/     # Shared constants
└── package.json     # Workspace root
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- React Native CLI
- Xcode (for iOS) or Android Studio (for Android)

### Installation

```bash
# Install dependencies
npm install

# Start Metro bundler (mobile)
cd mobile && npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

## 🎯 Supported Job Boards

| Board | Status | Notes |
|-------|--------|-------|
| Indeed | MVP | First adapter, full flow |
| LinkedIn | Planned | Week 2 |
| ZipRecruiter | Planned | Week 2 |
| Glassdoor | Planned | Week 2 |

## 🔒 Security & Privacy

- **Vault data** encrypted with device Keychain/Keystore
- **No session cookies** exfiltrated or stored
- **No credentials** stored anywhere
- **Minimal backend sync** - only job leads + submission proofs
- **PII redacted** in all log output

## 📜 License

Private - Jalanea Works
