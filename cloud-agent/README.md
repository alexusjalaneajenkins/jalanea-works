# Jalanea Works Cloud Agent

AI-powered job application agent that automatically applies to jobs on behalf of users.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLOUD AGENT SERVER                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   │
│  │   Browser    │───▶│   Vision     │───▶│    Agent     │   │
│  │  Controller  │    │   (Claude)   │    │   (Loop)     │   │
│  │  (Playwright)│◀───│              │◀───│              │   │
│  └──────────────┘    └──────────────┘    └──────────────┘   │
│         │                                       │            │
│         │              WebSocket               │            │
│         └──────────────────┬───────────────────┘            │
│                            │                                 │
│                            ▼                                 │
│                    ┌──────────────┐                         │
│                    │    Client    │                         │
│                    │  (PWA/Web)   │                         │
│                    └──────────────┘                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## How It Works

1. **SEE** - Take a screenshot of the browser
2. **THINK** - Send screenshot to Claude AI for analysis
3. **ACT** - Execute the recommended action (click, type, scroll, etc.)
4. **REPEAT** - Continue until task is complete

## Setup

### 1. Install Dependencies

```bash
cd cloud-agent
npm install
```

### 2. Install Playwright Browsers

```bash
npx playwright install chromium
```

### 3. Configure Environment

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and add your Anthropic API key:

```
ANTHROPIC_API_KEY=your_api_key_here
```

### 4. Run the Agent

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

**Run test:**
```bash
npm run test
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/status` | Get agent status |
| POST | `/profile` | Set user profile |
| POST | `/start` | Start agent with task |
| POST | `/pause` | Pause agent |
| POST | `/resume` | Resume agent |
| POST | `/stop` | Stop agent |
| POST | `/navigate` | Navigate to URL |
| GET | `/screenshot` | Get current screenshot |

## WebSocket Events

Connect to `ws://localhost:3001/ws` to receive real-time events:

- `screenshot` - New screenshot captured
- `action` - Agent performed an action
- `status` - Status update
- `job_applied` - Successfully applied to a job
- `error` - Error occurred

## Example Usage

### Start the agent via REST API:

```bash
# Set user profile
curl -X POST http://localhost:3001/profile \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "555-123-4567",
    "location": "Orlando, FL",
    "skills": ["JavaScript", "React", "Node.js"],
    "experience": "3 years as Frontend Developer",
    "education": "BS Computer Science",
    "desiredJobTitles": ["Web Developer", "Frontend Developer"],
    "workType": "remote"
  }'

# Start applying to jobs
curl -X POST http://localhost:3001/start \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Go to indeed.com and apply to 5 remote web developer jobs in Orlando, FL"
  }'

# Check status
curl http://localhost:3001/status
```

### Connect via WebSocket (JavaScript):

```javascript
const ws = new WebSocket('ws://localhost:3001/ws');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Event:', data.type, data.data);

  if (data.type === 'screenshot') {
    // Display screenshot
    document.getElementById('screen').src =
      'data:image/jpeg;base64,' + data.data.base64;
  }
};

// Start agent
ws.send(JSON.stringify({
  type: 'start',
  task: 'Apply to web developer jobs on Indeed'
}));
```

## File Structure

```
cloud-agent/
├── src/
│   ├── index.ts      # Entry point
│   ├── server.ts     # HTTP/WebSocket server
│   ├── agent.ts      # Main agent logic
│   ├── browser.ts    # Playwright browser controller
│   ├── vision.ts     # Claude AI vision module
│   └── test.ts       # Test script
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## Roadmap

- [x] Browser controller (Playwright)
- [x] AI vision module (Claude)
- [x] Agent action loop
- [x] HTTP/WebSocket server
- [ ] Live video streaming to clients
- [ ] PWA control interface
- [ ] Job site integrations (Indeed, LinkedIn, etc.)
- [ ] Resume auto-fill logic
- [ ] Application tracking
- [ ] Multi-user support

## License

Proprietary - Jalanea Works
