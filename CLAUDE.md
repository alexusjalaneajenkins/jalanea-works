# Jalanea Works - Claude Code Protocol

This file defines the critical-thinking workflow and operating rules for Claude Code in this repository.

---

## Single-Thread Rule

**One task at a time.** Do not start Task N+1 until Task N is verified with receipts.

- Complete each task fully before moving to the next
- If blocked, STOP and ask for clarification rather than guessing
- Mark tasks with status: `[ ]` pending, `[~]` in progress, `[x]` complete

---

## Critical-Thinking Workflow

Follow this workflow for all significant tasks. Do not skip steps.

### Checklist

```
[ ] 1. IDENTIFY THE GOAL - What exactly are we trying to achieve?
[ ] 2. BREAK DOWN - What does this mean? What's the protocol?
[ ] 3. FIND EXAMPLES - Are there patterns in the codebase to follow?
[ ] 4. VERIFICATION PLAN - How will we know it works?
[ ] 5. IMPLEMENT - Make minimal, focused changes
[ ] 6. TEST WITH RECEIPTS - Paste command output or file:line proof
[ ] 7. USE SCENARIOS - Does it work in real usage?
[ ] 8. IMPROVE - Only if explicitly requested
```

### Rules

- **No unverified claims.** If you say something works/passed/succeeded, paste the exact command output or file lines proving it.
- **Prefer minimal changes.** No refactors unless required for correctness.
- **If information is missing, do NOT guess.** Trigger a STOP CONDITION.
- **Mark checklist items ✅ only after evidence is shown.**

---

## STOP CONDITIONS

Immediately stop and ask the user when:

1. **Missing Information** - Required context, credentials, or decisions not provided
2. **Ambiguous Requirements** - Multiple valid interpretations exist
3. **Risky Operations** - Destructive actions, production deployments, credential handling
4. **Verification Failure** - Tests fail, builds break, expected output doesn't match
5. **Scope Creep** - Task expanding beyond original request
6. **External Dependencies** - Need to access URLs, APIs, or services not yet approved

Format:
```
🛑 STOP CONDITION: [Category]
Reason: [Specific issue]
Need: [What exactly is required to proceed]
```

---

## Planning vs Implementation Mode

### Planning Mode (Research)
- Read files, search code, analyze structure
- Do NOT run Bash commands unless explicitly asked
- Do NOT modify files
- Output: Analysis, options, recommendations

### Implementation Mode
- Execute only after plan is approved
- Make changes incrementally with verification
- Provide receipts for each change

**Default for research prompts: Planning Mode**

---

## Research Documentation

All research documents go in: `./docs/research/`

Follow the citation policy in: `./docs/research/SOURCE_POLICY.md`

Evidence tags:
- `[INTERNAL]` - Verified from this codebase
- `[EXTERNAL]` - Verified from official external source (with citation)
- `[ASSUMPTION]` - Unverified; needs confirmation
- `[UNKNOWN]` - Cannot determine; requires research

---

## Prompt Template (A-I Framework)

For complex research or implementation tasks, structure your approach:

```
A. ASSUMPTIONS
   What am I assuming to be true? List explicitly.

B. BACKGROUND
   What context is relevant from the codebase or prior conversation?

C. CONSTRAINTS
   What limitations exist? (time, scope, technology, permissions)

D. DEPENDENCIES
   What must exist or be true for this to work?

E. EVIDENCE
   What proof do I have? What do I need to verify?

F. FAILURE MODES
   What could go wrong? How do we detect/prevent it?

G. GAPS
   What information is missing? What questions remain?

H. HYPOTHESIS
   What do I believe the solution is? Why?

I. IMPLEMENTATION
   Step-by-step plan with verification checkpoints.
```

---

## Receipts Format

After completing any significant action, provide receipts:

```bash
# Command executed
$ <command>

# Output (relevant portion)
<output>

# Verification
✅ [What this proves]
```

For file changes:
```
File: <path>:<line_numbers>
Change: <description>
Verification: <how to confirm it works>
```

---

## Completion Verification (MANDATORY)

**NO task can be marked complete without visible proof on localhost:3003.**

### Required Evidence:

1. **Screenshot on localhost:3003** showing the feature working
   - Not code snippets. Not "it should work." An actual screenshot.
   - URL bar must be visible showing `localhost:3003/...`
   - If screenshot cannot be taken → task is NOT complete

2. **If data should persist:**
   - Show database query proving the row exists
   - Example: `SELECT * FROM job_pockets WHERE id = 'xxx'`

3. **If navigation involved:**
   - Screenshot of the destination page
   - URL bar must show `localhost:3003/expected-path`

4. **User can reject any "complete" claim** that lacks this evidence

### Hard Rules:

- If browser automation fails → fix it first or acknowledge BLOCKED
- No workarounds like "verified via code inspection"
- No marking complete based on "the code looks right"

---

## Task Workflow (VISIBLE CHECKPOINTS)

### Before Coding:
1. State what "done" looks like in plain English
2. List the specific test steps to perform on localhost:3003
3. Get user confirmation if anything is unclear

### During Coding:
4. After EACH change, test immediately on localhost:3003
5. Screenshot any errors or unexpected behavior
6. If something breaks → STOP, show user, fix before continuing
7. Update todo list after each sub-step with proof

### After Coding:
8. Run through the FULL user flow on localhost:3003
9. Provide all screenshots/DB queries as evidence
10. Only then mark complete

### If Blocked:
- Say `🛑 BLOCKED: [reason]` - don't silently work around it
- Don't mark complete with workarounds
- Browser issues = blocker, not excuse to skip testing

---

## Checkbox Evidence Rule

**A checkbox is ONLY valid if it has attached proof the user can see.**

### Invalid (no proof):
```
[x] Button navigates to pocket page
```

### Valid (with proof):
```
[x] Button navigates to pocket page
    └── PROOF: Screenshot ss_7234abc showing localhost:3003/dashboard/pockets/xyz
```

### Acceptable Proof Types:
- Screenshot ID from browser automation tool
- Command output (pasted in full, not summarized)
- Database query result (actual rows shown)
- Console output with timestamp

### User Verification:
- User can request to see any screenshot/proof
- If proof is missing or unclear → checkbox is invalid → task not complete
- "Trust but verify" = user spot-checks any claim

---

## Project Structure Reference

```
jalanea-works/
├── CLAUDE.md              # This file (repo protocol)
├── .claude/
│   ├── settings.json      # Team-shared settings (in git)
│   └── settings.local.json # Personal settings (gitignored)
├── docs/
│   ├── research/          # Research documentation
│   │   ├── SOURCE_POLICY.md
│   │   └── CLAUDE_CODE_PLAYBOOK.md
│   ├── planning/          # Implementation plans
│   └── handoff/           # Handoff documents
└── ...
```

---

*Protocol Version: 1.1 | Updated: 2026-01-19 | Added: Completion Verification, Task Workflow, Checkbox Evidence Rule*
