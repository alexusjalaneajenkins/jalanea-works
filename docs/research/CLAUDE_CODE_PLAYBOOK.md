# Claude Code Playbook

A research-grade guide for using Claude Code safely and effectively, with citations to official documentation.

---

## 1. Session Model

### What Is a Session? [EXTERNAL][1]

A session is a single conversation context with Claude Code:

- **Interactive**: Started with `claude` command, runs until you exit
- **Non-interactive**: Started with `claude -p "prompt"`, executes one request and terminates
- **Resumed**: Continues a previous conversation via `--continue`, `--resume`, or `/resume`

### What Persists vs What Doesn't [EXTERNAL][2]

| Persists Between Sessions | Does NOT Persist |
|--------------------------|------------------|
| Conversation history (stored locally per project) | Bash environment variables |
| CLAUDE.md memory files [EXTERNAL][2] | `export VAR=value` changes |
| Settings & permissions (JSON files) [EXTERNAL][1] | Working directory changes |

**Key limitation:** Each Bash command runs in a fresh shell environment. [ASSUMPTION]

### Session Storage [EXTERNAL][1]

- Sessions are saved locally per project directory
- Default cleanup: 30 days (configurable via `cleanupPeriodDays`) [EXTERNAL][1]

---

## 2. Configuration Scopes [EXTERNAL][1]

Claude Code uses a **scope system** to determine where configurations apply and who they're shared with.

### Available Scopes [EXTERNAL][1]

| Scope | Location | Who It Affects | Shared with Team? |
|-------|----------|----------------|-------------------|
| Enterprise | System-level `managed-settings.json` | All users on the machine | Yes (deployed by IT) |
| User | `~/.claude/` directory | You, across all projects | No |
| Project | `.claude/` in repository | All collaborators on this repository | Yes (committed to git) |
| Local | `.claude/*.local.*` files | You, in this repository only | No (gitignored) |

### Settings Precedence (Highest to Lowest) [EXTERNAL][1]

1. **Enterprise** (highest) - can't be overridden by anything
2. **Command line arguments** - temporary session overrides
3. **Local** - overrides project and user settings
4. **Project** - overrides user settings
5. **User** (lowest) - applies when nothing else specifies the setting

---

## 3. Permission System [EXTERNAL][1]

### Permission Settings Keys [EXTERNAL][1]

| Key | Description | Example |
|-----|-------------|---------|
| `allow` | Array of permission rules to allow tool use | `["Bash(npm run lint)"]` |
| `ask` | Array of permission rules to ask for confirmation | `["Bash(git push:*)"]` |
| `deny` | Array of permission rules to deny tool use | `["Read(./.env)", "Read(./secrets/**)"]` |
| `defaultMode` | Default permission mode when opening Claude Code | `"acceptEdits"` |

### Pattern Syntax [EXTERNAL][1]

- **Bash**: Prefix matching with `:*` wildcard (e.g., `Bash(npm run:*)`)
- **Read/Edit**: Gitignore-style patterns (e.g., `Read(./secrets/**)`)
- **Note**: Bash patterns are prefix matches and can be bypassed [EXTERNAL][1]

### Example settings.json [EXTERNAL][1]

```json
{
  "permissions": {
    "allow": [
      "Bash(npm run lint)",
      "Bash(npm run test:*)"
    ],
    "deny": [
      "Bash(curl:*)",
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./secrets/**)"
    ]
  }
}
```

### Permission Modes [EXTERNAL][1][3]

| Mode | Behavior |
|------|----------|
| `default` | Prompts for permission on first use of each tool |
| `acceptEdits` | Auto-accepts file edit permissions for the session [EXTERNAL][1] |
| `plan` | Claude can analyze but NOT modify files or execute commands [EXTERNAL][3] |
| `bypassPermissions` | Skips all prompts (requires safe environment) |

**Verified**: `plan` and `acceptEdits` are documented as valid `defaultMode` values.

---

## 4. The `--dangerously-skip-permissions` Flag [EXTERNAL][1]

### What It Does

Bypasses ALL permission approval prompts. Claude executes tools without asking for confirmation.

### Disabling It [EXTERNAL][1]

Enterprise administrators can prevent this flag from being used:

```json
{
  "disableBypassPermissionsMode": "disable"
}
```

This setting disables the `--dangerously-skip-permissions` command-line flag. [EXTERNAL][1]

### When to Use It [ASSUMPTION]

Appropriate contexts:
- CI/CD pipelines (GitHub Actions, etc.)
- Trusted, isolated environments (sandboxed VMs/containers)
- Automated scripts with predetermined, safe tasks

---

## 5. Memory Files (CLAUDE.md) [EXTERNAL][2]

### Memory Locations [EXTERNAL][2]

| Memory Type | Location | Purpose | Shared? |
|-------------|----------|---------|---------|
| Enterprise policy | macOS: `/Library/Application Support/ClaudeCode/CLAUDE.md` | Organization-wide instructions | All users |
| Project memory | `./CLAUDE.md` or `./.claude/CLAUDE.md` | Team-shared instructions for the project | Team (in git) |
| Project rules | `./.claude/rules/*.md` | Modular, topic-specific project instructions | Team (in git) |
| User memory | `~/.claude/CLAUDE.md` | Personal preferences for all projects | Just you |
| Project local | `./CLAUDE.local.md` | Personal project-specific preferences | Just you |

### Loading Order [EXTERNAL][2]

All memory files are automatically loaded into Claude Code's context when launched. Files higher in the hierarchy provide a foundation that more specific memories build upon.

---

## 6. Settings Files [EXTERNAL][1]

### File Locations [EXTERNAL][1]

| Feature | User Location | Project Location | Local Location |
|---------|---------------|------------------|----------------|
| Settings | `~/.claude/settings.json` | `.claude/settings.json` | `.claude/settings.local.json` |
| MCP servers | `~/.claude.json` | `.mcp.json` | `~/.claude.json` (per-project) |
| CLAUDE.md | `~/.claude/CLAUDE.md` | `CLAUDE.md` or `.claude/CLAUDE.md` | `CLAUDE.local.md` |

### Key Settings [EXTERNAL][1]

| Key | Description | Example |
|-----|-------------|---------|
| `cleanupPeriodDays` | Session cleanup period (default: 30) | `20` |
| `model` | Override default model | `"claude-sonnet-4-5-20250929"` |
| `permissions` | Permission rules object | See above |
| `hooks` | Custom commands before/after tool executions | See hooks documentation |
| `env` | Environment variables for every session | `{"VAR": "value"}` |

---

## 7. Background Tasks [ASSUMPTION]

### Linear Execution by Default

Claude Code processes tasks synchronously by default. Background execution only happens when:

1. You explicitly ask Claude to run something in the background
2. You press `Ctrl+B` during a Bash tool invocation [ASSUMPTION]

**Note**: The `Ctrl+B` shortcut requires verification from official docs or CLI help.

### Stopping Tasks [ASSUMPTION]

| Action | Effect |
|--------|--------|
| `Ctrl+C` | Cancel current input or generation |
| Exit session | All background tasks are cleaned up |

---

## 8. Safe Defaults Checklist

Based on official documentation, recommended safe defaults:

- [ ] Configure deny rules for sensitive files: `.env`, `secrets/**` [EXTERNAL][1]
- [ ] Set `defaultMode` appropriately for your workflow [EXTERNAL][1]
- [ ] Review project `.claude/settings.json` before starting work
- [ ] Use `/memory` command to view loaded memory files [ASSUMPTION]
- [ ] Use `/permissions` command to review current permissions [ASSUMPTION]

---

## Needs Verification

The following require independent confirmation:

- [ ] `Ctrl+B` keyboard shortcut for backgrounding tasks
- [ ] `/memory` and `/permissions` slash commands
- [ ] Stop hook JSON structure and syntax
- [ ] Maximum import depth for `@` references in CLAUDE.md

### Recently Verified

- [x] `defaultMode: "plan"` is a valid permission mode [EXTERNAL][3]
- [x] `disableBypassPermissionsMode: "disable"` prevents --dangerously-skip-permissions [EXTERNAL][1]

---

## References

[1] "Claude Code settings - Configuration", Claude Code Docs, https://code.claude.com/docs/en/settings, Accessed: 2025-01-04

[2] "Manage Claude's memory - Configuration", Claude Code Docs, https://code.claude.com/docs/en/memory, Accessed: 2025-01-04

[3] "Common workflows - Getting started", Claude Code Docs, https://code.claude.com/docs/en/common-workflows, Accessed: 2025-01-04 (User-confirmed: `defaultMode: "plan"` is documented)

---

*Playbook Version: 2.0 | Updated: 2025-01-04 | Evidence-tagged per SOURCE_POLICY.md*
