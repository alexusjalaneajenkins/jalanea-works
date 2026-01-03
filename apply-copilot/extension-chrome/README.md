# Apply Co-Pilot Chrome Extension

Chrome Extension (Manifest V3) for Apply Co-Pilot "Turbo Mode" - enables field detection and one-click filling on job application pages.

## Features

- **Field Detection**: Automatically detects form fields on Indeed job applications
- **One-Click Fill**: Click a button to insert vault data into form fields
- **Never Auto-Submits**: You always click the submit button yourself
- **Verification Pause**: Detects CAPTCHA/verification and pauses until you complete it
- **Side Panel UI**: Non-intrusive overlay that slides in from the right

## Supported Sites

The extension activates only on job-related pages (not entire domains):

- **Indeed.com** - `/viewjob`, `/jobs`, `/apply`, `/m/*`
- **LinkedIn** - `/jobs/*`
- **ZipRecruiter** - `/jobs/*`, `/c/*`, `/k/*`, `/candidate/*`
- **Glassdoor** - `/job-listing/*`, `/Job/*`, `/jobs/*`

## Installation (Development)

### Prerequisites

- Node.js 20+
- Chrome browser

### Build the Extension

```bash
cd extension-chrome

# Install dependencies
npx pnpm install

# Build TypeScript to JavaScript
npx pnpm build
```

### Load Unpacked in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **Load unpacked**
4. Select the `extension-chrome` folder (the one containing `manifest.json`)
5. The extension should appear with the rocket icon

### Verify Installation

1. Look for the Apply Co-Pilot icon in your Chrome toolbar
2. Click the icon to open the popup
3. Navigate to `indeed.com` and look for the floating rocket button on the right side

## Development

### File Structure

```
extension-chrome/
├── manifest.json          # Extension manifest (MV3)
├── package.json           # Dependencies + build scripts
├── tsconfig.json          # TypeScript config
├── src/
│   ├── content/
│   │   └── job-site.ts    # Content script for all job sites
│   ├── background/
│   │   └── service-worker.ts  # Background service worker
│   └── lib/
│       ├── types.ts       # Shared types
│       ├── field-detector.ts  # Field detection logic
│       └── overlay-ui.ts  # Overlay UI component
├── popup/
│   ├── popup.html         # Popup UI with import vault
│   └── popup.ts           # Popup script
├── styles/
│   └── overlay.css        # Injected styles for overlay
└── assets/
    └── icon-*.png         # Extension icons
```

### Watch Mode

For development, use watch mode to auto-rebuild on changes:

```bash
npx pnpm watch
```

Then reload the extension in `chrome://extensions/` after each change.

### Adding New Job Sites

1. Add URL patterns to `manifest.json` under `host_permissions` and `content_scripts.matches`
2. Create a new content script in `src/content/` (or extend the existing one)
3. Update field detection patterns in `src/lib/field-detector.ts` if needed

## Security & Privacy

- **No Password Storage**: The extension never stores or transmits passwords
- **No Auto-Submit**: Forms are never submitted automatically
- **Minimal Data Storage**: Only text fields needed for form filling (name, email, phone, location, links). No resumes, files, or sensitive documents are stored.
- **Local Storage Only**: Vault data is stored in Chrome's extension storage (`chrome.storage.local`). Data is NOT encrypted - do not use on shared or public computers unless you clear extension data afterward.
- **Human-in-the-Loop**: All field filling requires explicit user clicks
- **Schema Validation**: Imported vault data is validated against a versioned schema before storage
- **Restricted Injection**: Content scripts only run on job-related URL paths, not entire domains

## Syncing with PWA

The extension can sync vault data with the Apply Co-Pilot PWA:

### Export from PWA
1. Open the PWA at `http://localhost:3000/vault`
2. Click the **Export** button in the header
3. Choose **Copy to Clipboard** or **Download JSON File**

### Import to Extension
1. Click the Apply Co-Pilot extension icon in Chrome
2. In the **Import Vault from PWA** section:
   - Paste the copied JSON, or
   - Click **Upload File** and select the downloaded JSON file
3. Click **Import Vault**
4. The extension will save your vault data and notify all open job site tabs

Your vault data is stored locally in Chrome's extension storage and will persist across browser restarts.

## Troubleshooting

### Extension not loading
- Make sure all TypeScript is compiled (`npx pnpm build`)
- Check for errors in `chrome://extensions/`
- Look at the console in DevTools (right-click extension icon > Inspect popup)

### Overlay not appearing
- Make sure you're on a supported job page (Indeed, LinkedIn, ZipRecruiter, or Glassdoor)
- The overlay only appears on job listing/application pages, not homepages
- Check the browser console for errors (F12 > Console)
- Try clicking the floating rocket button if it exists

### Fields not detected
- The page may use non-standard form fields
- Try clicking "Rescan Page Fields" in the popup
- Check the console for detection logs

## License

Private - Jalanea Works
