# RoundUp: Design Polish PRD

## Context
Phase 1 base app is built. This PRD addresses design improvements identified by three specialist reviews: UX audit, competitor visual analysis, and accessibility audit. Work through tasks sequentially, committing after each group.

---

## Task List

### Critical: Accessibility Fixes
- [x] Fix primary button contrast: darken button blue to #2b7acc or use navy-900 text instead of white. Every primary button in the app is affected.
- [x] Add visible focus indicators: global `:focus-visible { outline: 2px solid #4a9eff; outline-offset: 2px; }` for all interactive elements
- [x] Make clickable cards accessible: add `role="button"`, `tabIndex={0}`, and keyboard Enter/Space handlers to Card component when onClick is provided
- [x] Add ARIA attributes to ProgressBar component: `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-label`
- [x] Add `aria-label` to allocation slider: "Allocation percentage" and `aria-valuetext` showing current value
- [x] Fix placeholder text contrast: replace alpha-blended text-secondary/50 with solid colour #5a7da8
- [x] Add `viewport-fit=cover` to viewport meta tag and safe area insets to bottom nav: `pb-[env(safe-area-inset-bottom)]`

### Critical: Touch Targets
- [x] Bottom nav buttons: increase to minimum 44x48px hit area (py-3 px-4)
- [x] Category filter pills: add min-h-[44px] with py-2.5
- [x] Inline action links (crisis banner "Redirect now", "Dismiss", "Show transactions", "Share"): wrap with min-h-[44px] padding
- [x] Back button on charity detail: add p-2 for 44px touch zone
- [x] Allocation slider thumb: increase to w-11 h-11 (44px) touch target
- [x] PDF download buttons: increase to p-3 with min-w-[44px]

### High: Visual Refinements (from Competitor Analysis)
- [x] Assign each charity a consistent brand colour (not just emoji). Use throughout dashboard, cards, tax breakdown. MSF: #ff6b6b, WWF: #5ce0b8, Ligue: #b48eff, Restos: #ffd93d, Amnesty: #4ae0d2, Secours: #ff9a76
- [x] Add horizontal stacked colour bar to charity allocation section on dashboard, showing the giving split visually
- [x] Fix card elevation model: inner nested elements should use LIGHTER backgrounds than parent cards, not darker. Change inner rows from navy-800 to navy-600/20 or navy-600/30
- [x] Increase border contrast: lighten card borders from #152a4a to #1f4070 for WCAG 3:1 non-text contrast compliance
- [x] Use tabular numerals (font-variant-numeric: tabular-nums) on all financial numbers so digits align properly
- [x] Add font-medium (500 weight) to any text below 14px on dark backgrounds to prevent wash-out
- [x] Replace all text-[10px] with text-xs (12px minimum readable size)

### High: Dashboard Trajectory Context
- [x] Add delta indicator next to YTD total: "+€X vs. last week" showing momentum
- [x] Add mini bar chart or sparkline in the "This week" card showing daily round-up amounts across the 7 days
- [ ] Add timeframe toggle on the weekly card: "This week" / "This month" switching
- [x] Add "giving streak" counter: consecutive weeks of active round-ups, displayed on dashboard

### High: Emotional Design
- [x] Add rotating "Your impact this month" card on dashboard with concrete outcome statements tied to the user's charities (e.g. "Your €34 to MSF helped fund 2 emergency medical kits")
- [x] Move impact card ABOVE the tax ceiling and transaction data (impact and celebration first, details second)
- [x] Add social proof element: "Join 1,200+ people rounding up this week" (simulated for MVP)
- [ ] Make monthly milestone card show progress toward a user-defined annual goal, not just a static number

### Medium: Animations and Loading
- [x] Add `prefers-reduced-motion` support: global CSS media query reducing all animation durations, plus Framer Motion `useReducedMotion()` hook
- [x] Replace loading spinners with skeleton screens matching card dimensions (use navy-600 on navy-700 with shimmer gradient)
- [x] Add staggered fade-in to transaction amounts in the weekly list (not all at once)
- [x] Add subtle scale bounce to YTD total when value updates
- [x] Add progress bar overshoot bounce animation (slightly overshoots target width then settles)
- [x] Add directional tab transitions: swipe left goes left, swipe right goes right (not always the same direction)

### Medium: Onboarding Improvements
- [x] Merge jurisdiction and income bracket into one step (reduce 8 steps to 7)
- [x] Reorder: move charity selection BEFORE bank/SEPA connection (build emotional investment before friction)
- [x] Remove confetti from tax preview step (premature celebration). Reserve confetti for final "All set" screen only
- [x] Add `aria-current="step"` to active onboarding dot and `aria-label="Step X of Y"` to each dot
- [x] Move focus to step heading after each transition for screen reader users

### Medium: Settings and Trust
- [x] Add ambient security label: persistent subtle "Secured by 256-bit encryption" text in bank connection card (not a padlock icon)
- [x] Add "last synced" timestamp to bank connection status
- [x] Add expandable "What is Don en Confiance?" explainer on charity cards (trust signal)
- [x] Add data handling transparency section in Settings: "What data we store" expandable card explaining the minimal data policy

### Low: Navigation Polish
- [x] Add gradient fade above bottom nav to prevent text showing through frosted glass (24px linear-gradient from transparent to background)
- [ ] Consider bottom sheet pattern for charity detail (using vaul library) instead of full page navigation, to maintain list context
- [ ] Add pull-to-refresh on dashboard and notifications pages
- [x] Add overscroll-behavior-y: contain to page containers

### Low: Typography System
- [x] Evaluate Plus Jakarta Sans for display headings and Inter for data text (competitor analysis recommendation). If too heavy a change, at minimum ensure system font stack includes SF Pro Display for numbers.
- [x] Establish clear type scale: 48px (hero numbers), 24px (page titles), 18px (section headers), 15px (body), 13px (secondary), 12px (minimum labels)
- [x] Use 8pt spacing grid consistently: 8, 16, 24, 32, 40, 48px

---

## Source Reports
- UX Improvement Report: `UX_IMPROVEMENT_REPORT.md` (in this repo)
- Competitor Visual Analysis: `../RoundUp App/Competitor_Visual_Analysis.md`
- Accessibility Audit: compiled from agent review of full codebase

## Notes
- Do not break existing functionality. Each fix should be verified before moving on.
- Run the dev server and visually check each change.
- Commit after each task group (Critical, High, Medium, Low).
- No dashes as punctuation in any UI copy.
