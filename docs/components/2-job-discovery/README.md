# Component 2: Job Discovery

*Finding the right opportunities efficiently.*

---

## Purpose

The Job Discovery component helps users find jobs they qualify for without wasting time on dead ends. It combines real job listings with intelligent matching and pre-screening.

---

## Subcomponents

| Subcomponent | Description |
|--------------|-------------|
| [Job Search](./job-search/) | Real listings from multiple sources (JSearch API) |
| [ATS Matching](./ats-matching/) | Qualification analysis against job requirements |
| [Pre-Screening](./pre-screening/) | Quick assessment before deep dive |
| [Bridge Recommendations](./bridge-recommendations/) | "You're at 50%, do XYZ to hit 85%" |

---

## How It Connects

- Uses **Career Profile** to understand what users qualify for
- Feeds into **Job Pockets** when users want to dive deeper
- Informs **Application Tools** about job requirements
- Drives **Planning & Support** task generation
