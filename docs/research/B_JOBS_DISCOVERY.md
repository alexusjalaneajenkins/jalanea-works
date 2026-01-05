# B. Jobs Discovery

Research document for the job browsing and discovery experience in Jalanea Works.

---

## 1. Goal of This Section

**Success looks like:**
- User finds relevant jobs within 30 seconds of entering Jobs Hub
- Filters/search feel intuitive, not overwhelming
- Job cards communicate enough info to decide "interested or not" without clicking through
- Mode-based curation (Survival/Bridge/Career) surfaces appropriate opportunities
- Zero "dead ends" where user sees no results and no guidance

**Anti-goals:**
- Overwhelming filter panels that require expertise to use
- Job cards that hide critical info (pay, location, requirements)
- Results that feel generic or irrelevant to user's stated mode
- Search patterns that punish spelling mistakes or incomplete queries

---

## 2. User Mindsets + Constraints

### Mindsets (entering Jobs Hub)

| Mindset | Emotional State | Primary Need | Behavior Pattern |
|---------|-----------------|--------------|------------------|
| **Urgent Scanner** | Anxious, impatient | "Show me what I can apply to NOW" | Rapid scroll, quick dismissals, low tolerance for friction |
| **Careful Evaluator** | Cautious, methodical | "I need to understand if this is right for me" | Reads details, compares options, saves multiple to review later |
| **Overwhelmed Newbie** | Confused, hesitant | "I don't know what to search for" | Needs guided browsing, curated lists, "start here" prompts |
| **Targeted Searcher** | Focused, specific | "I know exactly what I want" | Uses search immediately, expects precise results |
| **Exploratory Browser** | Open, curious | "What's out there?" | Enjoys discovery, browses by category, open to surprises |

### Constraints

| Constraint | Impact | Design Response |
|------------|--------|-----------------|
| **Limited vocabulary** | Users may not know job title jargon | Synonym matching, "jobs like this" suggestions |
| **Spotty connectivity** | Long load times kill momentum | Skeleton loaders, infinite scroll with prefetch, offline saved jobs |
| **Small screen** | Can't show full job details in list | Progressive disclosure, swipe actions, smart truncation |
| **Distrust of listings** | Scam radar always on | Source badges, "verified employer" tags, transparent posting dates |
| **Frequent interruptions** | Session may end mid-browse | Persistent scroll position, "continue browsing" on return [EXTERNAL][2] |
| **Cognitive load from stress** | Reduced decision-making capacity | Limited choices per screen, clear visual hierarchy [EXTERNAL][4] |

---

## 3. Decision Points (8+)

### DP1: Entry Point - "Where do I start?"

**Choices:**
1. Use search bar
2. Browse curated "For You" feed
3. Tap a category/filter
4. Scroll the default list
5. Feel lost, leave

**Outcomes:**
- Good: Clear entry points for each mindset (search vs browse vs guided)
- Bad: Blank search bar with no suggestions → paralysis for newbies

**v1 Default:** Show "For You" curated feed by default (based on mode). Search bar visible but not dominant. Category chips below for exploration. [ASSUMPTION]

---

### DP2: Search Input - "What do I type?"

**Choices:**
1. Type job title
2. Type company name
3. Type skill/keyword
4. Type location
5. Give up on search, browse instead

**Outcomes:**
- Good: Autocomplete suggests relevant terms, tolerates typos
- Bad: Exact-match-only search returns nothing for "casheer" instead of "cashier"

**v1 Default:** Fuzzy search with autocomplete. Recent searches shown. Popular searches for user's mode suggested. [EXTERNAL][1]

---

### DP3: Filter Panel - "How do I narrow this down?"

**Choices:**
1. Apply one filter (e.g., location)
2. Apply multiple filters
3. Ignore filters, keep scrolling
4. Get confused by options, abandon

**Outcomes:**
- Good: Filters reduce noise without hiding good matches; counts show impact before applying
- Bad: Too many filters → Hick's Law paralysis [EXTERNAL][4]; filters hide all results → frustration

**v1 Default:** Show 3-4 primary filters (Location, Pay, Schedule, Experience). Advanced filters collapsed. Show result count preview before applying. [EXTERNAL][4]

---

### DP4: Job Card Scan - "Is this worth my time?"

**Choices:**
1. Tap to view full details
2. Save to pocket without viewing
3. Dismiss/skip
4. Ignore (scroll past)

**Outcomes:**
- Good: Card shows enough info (title, employer, pay range, location, quick-apply badge) to make informed choice
- Bad: Missing pay → assume scam; vague title → skip; no employer name → distrust

**v1 Default:** Required card fields: Title, Employer, Location, Pay indicator (range or "Discussed in interview"), Posted date, Quick-apply badge if applicable. [ASSUMPTION]

---

### DP5: Empty/No Results - "Did I break it?"

**Choices:**
1. Broaden search/filters
2. Try different keywords
3. Assume no jobs exist, leave
4. Contact support (unlikely)

**Outcomes:**
- Good: Helpful empty state with suggestions ("Try removing X filter" or "Similar searches: Y")
- Bad: Blank screen or generic "No results" → user blames self or app

**v1 Default:** Empty states show: (1) what filters are active, (2) suggestion to broaden, (3) link to "For You" feed, (4) option to set alert for this search. [EXTERNAL][3]

---

### DP6: Infinite Scroll vs Pagination - "Is there more?"

**Choices:**
1. Keep scrolling for more
2. Look for "next page" button
3. Assume they've seen everything
4. Fatigue and stop

**Outcomes:**
- Good: Infinite scroll with clear "end of results" indicator; scroll position preserved
- Bad: Silent loading → user thinks app froze; no end indicator → endless scrolling fatigue

**v1 Default:** Infinite scroll with skeleton loaders during fetch. Clear "You've seen all X jobs" message at end. "Back to top" FAB after 20+ cards. [ASSUMPTION]

---

### DP7: Save to Pocket - "I want to come back to this"

**Choices:**
1. Tap save icon on card
2. Swipe to save
3. Open details first, then save
4. Don't save (forget about it)

**Outcomes:**
- Good: One-tap save with visual feedback, no account required for guests
- Bad: Save requires account → friction at interest peak; no feedback → user unsure if it worked

**v1 Default:** Save icon on every card. Tap → immediate animation + "Saved to Pocket" toast. Works for guests (localStorage). Pocket badge updates in nav. [ASSUMPTION]

---

### DP8: Sorting Results - "Show me the best ones first"

**Choices:**
1. Accept default sort
2. Sort by newest
3. Sort by pay (high to low)
4. Sort by distance
5. Sort by relevance

**Outcomes:**
- Good: Default sort feels relevant; other options easily discoverable
- Bad: Default sort shows stale/irrelevant jobs first → distrust; sort options hidden → user stuck

**v1 Default:** Default: "Relevance" (mode-aware algorithm). Visible sort dropdown with: Newest, Pay (high-low), Distance. Show current sort clearly. [ASSUMPTION]

---

### DP9: Job Details Preview - "Tell me more without committing"

**Choices:**
1. Open full details page
2. Preview in modal/drawer
3. Expand inline
4. Skip, save for later

**Outcomes:**
- Good: Quick preview (modal/drawer) for fast evaluation without losing place in list
- Bad: Full page load for every detail check → slow, loses scroll position, increases friction

**v1 Default:** Bottom sheet drawer with key details (description snippet, requirements, how to apply). "View Full Details" button for complete info. Scroll position preserved on close. [EXTERNAL][2]

---

### DP10: "Jobs Like This" - "Find me more of these"

**Choices:**
1. Tap "More like this"
2. Manually adjust filters
3. New search based on what they liked
4. Give up finding similar

**Outcomes:**
- Good: One-tap "More like this" surfaces similar opportunities
- Bad: No discovery path from a good match → missed opportunities

**v1 Default:** "More like this" button on job detail view and after saving. Uses job attributes to filter. [ASSUMPTION]

---

## 4. Solutions / Patterns

### Pattern 1: Mode-Based Curation
**Description:** Pre-filter results based on user's selected mode (Survival/Bridge/Career).
| Pros | Cons |
|------|------|
| Reduces cognitive load | May hide relevant cross-mode opportunities |
| Feels personalized | Requires accurate mode classification of jobs |
| Matches user's stated intent | Users may be miscategorized |

### Pattern 2: Progressive Filter Disclosure
**Description:** Show essential filters first, advanced options behind "More filters" toggle.
| Pros | Cons |
|------|------|
| Reduces Hick's Law paralysis [EXTERNAL][4] | Power users need extra tap |
| Cleaner mobile UI | May hide useful filters |
| Guides novice users | Requires good default filter selection |

### Pattern 3: Fuzzy Search with Autocomplete
**Description:** Tolerate typos, suggest completions, show popular/recent searches.
| Pros | Cons |
|------|------|
| Forgiving for users with limited vocabulary | May surface irrelevant suggestions |
| Faster path to results | Requires search infrastructure investment |
| Reduces zero-result states | Autocomplete can bias results |

### Pattern 4: Skeleton Loading + Prefetch
**Description:** Show content structure while loading, prefetch next page during scroll.
| Pros | Cons |
|------|------|
| Perceived performance improvement [EXTERNAL][2] | Content shift if layouts vary |
| Supports spotty connectivity | Higher data usage for prefetch |
| Maintains engagement during load | Implementation complexity |

### Pattern 5: Swipe Actions on Cards
**Description:** Swipe right to save, left to dismiss (Tinder-style).
| Pros | Cons |
|------|------|
| Fast, gestural interaction | Discoverability issue for new users |
| Mobile-native feel | Accidental swipes |
| Gamifies browsing | Not accessible for all users |

---

## 5. Implement in v1 Checklist

### Must Have
- [ ] "For You" curated feed based on mode
- [ ] Search with fuzzy matching and autocomplete
- [ ] 3-4 essential filters (Location, Pay, Schedule, Experience)
- [ ] Job cards with: Title, Employer, Location, Pay indicator, Posted date
- [ ] One-tap save to pocket with visual feedback
- [ ] Infinite scroll with skeleton loaders
- [ ] Helpful empty states with suggestions
- [ ] Scroll position preservation

### Should Have
- [ ] "Verified employer" badges
- [ ] Result count preview on filter changes
- [ ] Sort options (Relevance, Newest, Pay, Distance)
- [ ] Bottom sheet job preview
- [ ] "More like this" discovery
- [ ] Recent/popular search suggestions

### Could Have
- [ ] Swipe gestures on job cards
- [ ] Save search with alerts
- [ ] Job card quick-apply badge
- [ ] Category chips for exploration
- [ ] "Back to top" FAB

---

## 6. Risks + Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| **Poor search results** - Fuzzy search too loose, surfaces irrelevant jobs | Medium | Medium | Tune relevance algorithm, A/B test result quality |
| **Filter paralysis** - Too many options overwhelm users | Medium | High | Progressive disclosure, limit primary filters to 4 |
| **Scam listings** - Users see suspicious jobs, distrust platform | High | Medium | Employer verification badges, user reporting, posting date visibility |
| **Empty results despair** - User assumes no jobs exist for them | High | Medium | Helpful empty states, broaden suggestions, save search alerts |
| **Scroll fatigue** - Endless scrolling without progress signal | Medium | Medium | Clear "end of results" indicator, varied content breaks |
| **Mode mismatch** - Jobs miscategorized, wrong results surface | Medium | Low | Job tagging QA, user feedback mechanism, easy mode switching |
| **Lost scroll position** - User loses place after viewing details | High | High | Preserve position, use bottom sheet instead of full page nav |
| **Search query PII leakage** - Logging or transmitting personal data in search queries | High | Low | Redact PII from logs, require consent for analytics, avoid third-party transmission, enforce retention limits |

---

## 7. Metrics to Confirm It Works

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| **Time to first relevant job view** | <30 seconds from entering Jobs Hub | Analytics event timing |
| **Search success rate** | >70% of searches return results | Search analytics |
| **Filter usage rate** | >40% of sessions use at least one filter | Feature analytics |
| **Save rate** | >15% of viewed jobs saved to pocket | Action tracking |
| **Empty state recovery** | >50% of users who see empty state take suggested action | Funnel tracking |
| **Scroll depth** | Average >15 job cards viewed per session | Scroll tracking |
| **Return to browse rate** | >60% of users return to Jobs Hub within 3 days | Cohort analytics |
| **Job detail view rate** | >30% of saved jobs have details viewed | Action sequence tracking |

---

## 8. Open Questions (Max 5)

1. **How do we classify jobs into Survival/Bridge/Career modes?** Manual tagging? ML classification? Employer self-selection? Hybrid approach?

2. **What's the right default sort algorithm for "Relevance"?** Recency? Match to profile? Employer quality score? Application success likelihood?

3. **Should we show salary even when employers don't provide it?** Estimated ranges from market data? "Salary not disclosed" badge? Risk of inaccuracy?

4. **How do we handle job expiration/removal?** Silent removal from feed? Notification if saved? Grace period for recently saved jobs?

5. **What employer verification actually means and who does it?** Manual review? Third-party validation? Self-attestation with consequences?

---

## 9. Sources

[1] Nielsen, J. (2001). "Search: Visible and Simple", Nielsen Norman Group, https://www.nngroup.com/articles/search-visible-and-simple/, Accessed: 2026-01-05

[2] Budiu, R. (2015). "Mobile User Experience: Limitations and Strengths", Nielsen Norman Group, https://www.nngroup.com/articles/mobile-ux/, Accessed: 2026-01-05

[3] Sherwin, K. (2018). "The Anatomy of a Perfect Empty State", Nielsen Norman Group, https://www.nngroup.com/articles/empty-state-interface-design/, Accessed: 2026-01-05

[4] Yablonski, J. (2025). "Laws of UX", https://lawsofux.com/, Accessed: 2026-01-05
- Hick's Law: Decision time increases with number of choices
- Miller's Law: 7±2 items in working memory
- Fitts's Law: Target size and distance affect interaction time

---

*Document Version: 1.0 | Created: 2026-01-05 | Evidence-tagged per SOURCE_POLICY.md*
