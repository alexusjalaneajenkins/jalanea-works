# Source Policy for Research Documentation

This document establishes citation standards and evidence requirements for all research documentation in this repository.

---

## Citation Format

### Bibliography Style
Use numbered references at the end of each document:

```
## References

[1] "Page Title - Section Name", Official Source, URL, Accessed: YYYY-MM-DD
[2] ...
```

### Inline Citations
Reference sources inline using bracketed numbers: `[1]`, `[2]`, etc.

Example:
> Claude Code uses a scope system to determine where configurations apply [1].

---

## Evidence Tags

Mark all claims with one of the following tags:

| Tag | Meaning | Usage |
|-----|---------|-------|
| `[INTERNAL]` | Verified from this codebase | File paths, code snippets, test results from this repo |
| `[EXTERNAL]` | Verified from official external source | Cited with reference number, e.g., `[EXTERNAL][1]` |
| `[ASSUMPTION]` | Unverified but reasonable inference | Educated guess based on patterns; needs verification |
| `[UNKNOWN]` | Cannot determine; requires research | Placeholder for future investigation |

---

## Allowed Sources (Tier 1 - Preferred)

1. **Official Vendor Documentation**
   - Anthropic: docs.anthropic.com, code.claude.com
   - Claude Code GitHub: github.com/anthropics/claude-code

2. **Standards Bodies**
   - W3C, IETF, ISO, ECMA, OWASP

3. **Government & Academic**
   - .gov, .edu domains
   - Peer-reviewed journals

4. **Major Technology Documentation**
   - MDN Web Docs, Node.js docs, TypeScript docs
   - Official framework documentation (React, Next.js, etc.)

---

## Conditional Sources (Tier 2 - Use with Attribution)

1. **Reputable Technical Publications**
   - Stack Overflow (high-vote answers only, with caveats)
   - Major tech blogs (with author credentials noted)

2. **GitHub Issues/Discussions**
   - Only from official repositories
   - Must note issue number and status

---

## Disallowed Sources (Tier 3 - Avoid)

1. **Unsourced Blogs** - Unless no alternative exists (must note limitation)
2. **AI-Generated Content** - Without verification from primary sources
3. **Social Media** - Twitter/X, Reddit (except for direct developer statements)
4. **Outdated Documentation** - More than 2 years old without verification

---

## Verification Requirements

Before marking a claim as `[EXTERNAL]`:

1. Navigate to the source URL
2. Confirm the exact page title and section heading
3. Verify the quote or paraphrase is accurate
4. Record the access date

If verification fails:
- Mark as `[ASSUMPTION]` with note: "Source not accessible; based on [reason]"
- Add to "Needs Verification" section

---

## Document Structure

Each research document should include:

```markdown
# Title

## Summary
Brief overview with evidence tags on key claims.

## Findings
Detailed content with inline citations.

## Needs Verification
- [ ] Uncited claims requiring confirmation
- [ ] Assumptions that should be validated

## References
[1] ...
[2] ...
```

---

*Policy Version: 1.0 | Created: 2025-01-04*
