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

*Protocol Version: 1.0 | Created: 2025-01-04*
