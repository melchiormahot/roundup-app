# RoundUp: Master PRD (Clean Build)

**Version:** 2.0 (consolidated from 13 PRDs + 2 research reports + 1 lessons file)
**Date:** 2026-03-21
**Purpose:** Single spec for a clean build of the RoundUp web app from scratch.

---

## 1. What is RoundUp?

A web app that rounds up everyday purchases to the nearest euro and donates the spare change to curated charities. Users select their country, pick charities, and the app tracks their donations, calculates tax deductions, and generates year-end tax documents.

**Core thesis:** Donating is hard. People don't know where to start, which organisations to trust, how much they can give, or how to get the tax benefit. RoundUp solves all four.

**Product approach:** Giving-first, tax-smart. The emotional act of giving leads. Tax intelligence is the "wow, this too?" moment. Research shows extrinsic motivators (tax savings) can crowd out intrinsic motivation (warm glow). Impact always comes before tax in the UI.

---

## 2. Tech Stack

- **Framework:** Next.js (App Router, TypeScript)
- **Styling:** Tailwind CSS + CSS custom properties for theming + Framer Motion for animations
- **Database:** SQLite via better-sqlite3 + Drizzle ORM
- **Auth:** Email/password with iron-session, bcrypt for password hashing
- **PDF:** @react-pdf/renderer
- **Charts:** Recharts (admin dashboard)
- **State:** Zustand for client state
- **Icons:** Lucide React
- **Bottom sheets:** vaul (by Emil Kowalski)
- **PWA:** Custom service worker or next-pwa

**Known technical lessons (from prior build):**
- Drizzle ORM with better-sqlite3: always call `.sync()` on relational queries
- Next.js 16: use `proxy.ts` not `middleware.ts` for route protection
- Next.js 16: `params` is a Promise in route handlers, must be awaited

---

## 3. Design System

### Warm Charcoal Palette (Dark Mode, default)
| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | #121212 | Page background |
| `--bg-secondary` | #1c1917 | Secondary background |
| `--bg-card` | #231f1c | Card surfaces |
| `--bg-card-inner` | #2a2522 | Nested elements inside cards |
| `--border-primary` | #33302b | Card borders |
| `--border-secondary` | #3d3833 | Secondary borders |
| `--text-primary` | #e7e5e4 | Primary text |
| `--text-secondary` | #a8a29e | Secondary text |
| `--text-dim` | #78716c | Dim/disabled text |
| `--accent-green` | #86efac | Donations, success, positive |
| `--accent-blue` | #60a5fa | Tax, info, links |
| `--accent-purple` | #c084fc | Charities, allocation |
| `--accent-red` | #fca5a5 | Alerts, crisis, errors |
| `--accent-yellow` | #fbbf24 | Engagement, milestones, Loi Coluche badge |
| `--accent-orange` | #fb923c | Warnings, secondary alerts |
| `--progress-track` | #292524 | Progress bar backgrounds |
| `--nav-bg` | rgba(28, 25, 23, 0.92) | Frosted nav background |
| `--shadow` | rgba(0, 0, 0, 0.4) | Shadows |

### Warm Light Palette (Light Mode)
| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | #faf9f7 | Page background (warm off-white) |
| `--bg-secondary` | #ffffff | Secondary background |
| `--bg-card` | #ffffff | Card surfaces |
| `--bg-card-inner` | #f5f3f0 | Nested elements |
| `--border-primary` | #e7e5e3 | Card borders |
| `--text-primary` | #1c1917 | Primary text |
| `--text-secondary` | #57534e | Secondary text |
| `--accent-green` | #059669 | Darker for contrast on white |
| `--accent-blue` | #2563eb | Darker blue |
| `--accent-purple` | #7c3aed | Darker purple |
| `--accent-red` | #dc2626 | Darker red |
| `--accent-yellow` | #d97706 | Amber (not bright yellow on white) |

### Typography
- System font: -apple-system, BlinkMacSystemFont, SF Pro, Segoe UI, system-ui
- Scale: 48px (hero numbers), 24px (page titles), 18px (section headers), 15px (body), 13px (secondary), 12px (minimum labels)
- Financial numbers: font-variant-numeric: tabular-nums
- Text below 14px on dark backgrounds: font-weight 500 minimum
- Minimum readable size: 12px (no text-[10px])

### Spacing
- 8pt grid: 8, 16, 24, 32, 40, 48px
- Card padding: 16px
- Card border-radius: 16px
- Pill border-radius: 20px
- Card gap: 12px

### Touch Targets
- Minimum 44x44px on all interactive elements
- Bottom nav buttons: 44x48px minimum
- Filter pills: min-h-[44px]
- Slider thumb: 44px touch target

### Accessibility
- All colours pass WCAG AA (4.5:1 normal text, 3:1 large text)
- ProgressBar: role="progressbar" with aria-valuenow/min/max
- Clickable cards: role="button", tabIndex={0}, keyboard handlers
- Focus indicators: :focus-visible { outline: 2px solid var(--accent-blue); outline-offset: 2px }
- prefers-reduced-motion support on all animations
- Safe area insets for notched devices
- viewport-fit=cover

---

## 4. Progressive Disclosure (4 Levels)

Features unlock as the user grows. The user never sees the word "level." They simply discover new things.

### Level 1: Seedling (Day 0 to 7, €0 to €10)
**Visible:** Dashboard (simple: greeting, total, charity list, first-week journey tracker), charity browser (12 charities, max 3 selectable), basic settings (account, theme, notifications on/off, logout)
**Hidden:** Tax dashboard, crisis response, allocation sliders, milestones, social proof, sparklines, PDF generation, referral, advanced notifications, simulation controls, admin
**Bottom nav:** 3 tabs (Home, Charities, Settings)

### Level 2: Sprout (Day 7+, €10+)
**Unlocks:** Tax tab (with "New" badge), weekly summary card, allocation sliders, milestone celebrations (€10, €25, €50), social proof ("1,247 people donated today"), notification inbox
**Bottom nav:** 4 tabs (Home, Charities, Tax, Settings)

### Level 3: Grower (Day 30+, €50+)
**Unlocks:** Crisis response, consistency counter, year-end projection, up to 6 charities, impact calculator, sparklines, share button, detailed tax breakdown
**Bottom nav:** 4 tabs (same)

### Level 4: Flourishing (Day 90+, €200+)
**Unlocks:** Full charity catalogue, PDF generation, tax ceiling alerts, referral program, cross-border details, advanced notification preferences, category browsing with search
**Bottom nav:** 5 tabs (Home, Charities, Tax, Inbox, Settings)

**Rules:**
- Max one level advance per week (time-gated even if donation threshold is met early)
- Once unlocked, always unlocked (never reset)
- Admin users bypass all level gating
- Never show greyed-out locked features. Hidden until ready.
- Never use the word "level" or "unlock" in user-facing copy

---

## 5. Onboarding (4 steps, not 7)

Research: fintech onboarding abandonment is 68%. Each removed step saves ~10%.

1. **Welcome:** "Give effortlessly. Save on taxes." Animated logo, one-tap "Get started"
2. **Country:** Auto-detected, one tap to confirm. Flag pills: France, UK, Germany, Belgium, Spain.
3. **Pick charities:** Show 12 charities for their country (7 local + 5 international), grouped as "Popular in [country]" and "International." Select 1 to 3. Equal split, no sliders yet.
4. **Done:** "Your round-ups start now." Brief celebration (confetti on this screen only). Redirect to dashboard.

**Deferred to later levels:**
- Income bracket (asked when Tax tab unlocks at Level 2)
- Bank connection (deferred to when real payments begin, post-MVP)
- SEPA mandate (same)

---

## 6. Country-Specific Charity Catalogues

Each country gets 7 charities (one per category) plus 5 international ones = 12 total per user.

**Categories:** Health, Environment, Humanitarian, Children, Human Rights, Animals, Education

### International (all countries)
| Charity | Category | Loi Coluche (FR) |
|---|---|---|
| Red Cross / Red Crescent | Humanitarian | Yes (75%) |
| UNICEF | Children | Yes (75%) |
| MSF | Humanitarian/Health | Yes (75%) |
| WWF | Environment | No (66%) |
| Amnesty International | Human Rights | No (66%) |

### France
| Charity | Category | Loi Coluche |
|---|---|---|
| Ligue contre le cancer | Health | No (66%) |
| France Nature Environnement | Environment | No (66%) |
| Les Restos du Coeur | Humanitarian | Yes (75%) |
| Apprentis d'Auteuil | Children | Yes (75%) |
| Ligue des droits de l'Homme | Human Rights | No (66%) |
| SPA | Animals | No (66%) |
| Fondation de France | Education | No (66%) |

### United Kingdom
| Charity | Category |
|---|---|
| Cancer Research UK | Health |
| Greenpeace UK | Environment |
| Oxfam GB | Humanitarian |
| NSPCC | Children |
| RSPCA | Animals |
| Teach First | Education |
| (Amnesty UK from international) | Human Rights |

### Germany
| Charity | Category |
|---|---|
| Deutsche Krebshilfe | Health |
| BUND | Environment |
| Welthungerhilfe | Humanitarian |
| Deutsches Kinderhilfswerk | Children |
| Deutscher Tierschutzbund | Animals |
| Stiftung Lesen | Education |
| (Amnesty DE from international) | Human Rights |

### Spain
| Charity | Category |
|---|---|
| AECC | Health |
| Greenpeace España | Environment |
| Cáritas España | Humanitarian |
| Aldeas Infantiles SOS | Children |
| Fundación Affinity | Animals |
| Fundación ONCE | Education |
| (Amnistía Internacional from international) | Human Rights |

### Belgium
| Charity | Category |
|---|---|
| Kom op tegen Kanker | Health |
| GAIA | Animals |
| King Baudouin Foundation | Education |
| (WWF Belgium from international) | Environment |
| (MSF Belgium from international) | Humanitarian |
| (UNICEF Belgium from international) | Children |
| (Amnesty Belgium from international) | Human Rights |

### Each Charity Needs
- Name, icon/emoji, category, country_code, display_countries
- One-paragraph mission statement (warm, editorial, not marketing)
- Founding story (one paragraph, the interesting human origin)
- 3 to 4 impact bullets with real numbers and year references
- "How your money helps": 3 tiers [{amount, description}] in native currency
- Financial transparency: {programs_pct, admin_pct, fundraising_pct}
- Certifications: [{name, year}] (Don en Confiance, DZI, ZEWO, Charity Commission, etc.)
- Milestones: [{year, title, description}] (4 to 5 key moments)
- Tax rate per jurisdiction, loi_coluche_eligible flag
- jurisdictions_eligible (array of country codes where tax-deductible)
- cross_border_method ('national_entity' or 'tge' or 'none')
- Identifiable victim story: one 3-sentence story about a specific person helped

---

## 7. Screens

### 7.1 Landing Page (`/`)
- Sticky nav: Logo, section links, "Sign Up" button. Transparent on hero, solid on scroll.
- **Hero:** "Every purchase you make can change the world." Phone mockup with animated dashboard. Gradient orbs (warm charcoal, not navy). Floating micro-stat badges.
- **How It Works:** 3 steps (shop, round up, save on taxes). Animated flow diagram.
- **Live Demo:** Interactive simulated coffee purchase. User taps "Pay", sees €0.30 flow to MSF.
- **Tax Calculator:** Flag pill country selector, income bracket segmented control. Three animated result cards (donate, get back, real cost). Impact context below.
- **Charity Showcase:** Grid of 6 charities with brand colour accent bar, mission, impact stat, tax rate badge.
- **"Without/With RoundUp"** comparison section.
- **Numbers That Matter:** €2,000 / 75% / 2 min animated counters.
- **Social Proof:** 3 testimonials (French names), counter row, charity logos.
- **FAQ:** 8 accordion questions.
- **Final CTA:** Email capture + "Create Account". Trust badges.
- **Footer:** 3-column, social icons, legal disclaimer.
- Authenticated users redirect to `/dashboard`.
- Early access table in database for email capture.
- SEO: title, meta description, Open Graph, JSON-LD, sitemap.

### 7.2 Auth (`/login`, `/signup`)
- Email + password forms
- Warm card style with subtle shadows
- Password hashing with bcrypt
- iron-session for session management
- Redirect to onboarding (new users) or dashboard (returning)

### 7.3 Dashboard (`/dashboard`)
- **Level 1:** Greeting (time-of-day + name), total donated (animated number, green, with context: "That's X meals"), charity list (name, category, equal split shown), first-week journey tracker (7-day milestone lights)
- **Level 2 adds:** Weekly summary card (round-up count, total, next batch date, expandable transaction list with merchant names), tax progress preview, social proof line, milestone celebrations
- **Level 3 adds:** Crisis banner (tappable, redirect with confirmation + undo), consistency counter ("Giving since [date]"), impact card (rotating stories), sparkline on weekly card, delta indicator ("+€X vs last week")
- **Level 4 adds:** Full tax ceiling progress, monthly milestone with share button, next milestone accelerator ("€12 away")

**Warm glow moments:** After each simulation, show brief full-screen overlay (3 seconds) with impact statement using charity's brand colour.

**Language rules:** "spare change" not "donations", "contributed" not "debited", "round-up batch" not "debit". Lead with impact, follow with tax.

### 7.4 Charities (`/charities`)
- Search bar at top
- Category filter pills (Health, Environment, Humanitarian, Children, Human Rights, Animals, Education). Scrollable on mobile.
- "Recommended for you" section (charities eligible in user's jurisdiction, best tax rate first)
- Jurisdiction filter toggle: "Tax-deductible in [country]" (on by default)
- Non-deductible charities greyed with note, not hidden
- Sort: Popularity, Tax benefit, Category, Alphabetical
- Each card: name, category icon, country flag, tax rate badge, Loi Coluche gold badge (if eligible), certification badge, deductibility status

### 7.5 Charity Detail (bottom sheet or `/charities/[id]`)
- Bottom sheet with 3 snap points (peek 40vh, half 65vh, full 92vh) via vaul library
- Header: large icon, name, category, certification badges
- Mission section
- "Our story" (founding story, collapsible, expanded by default)
- Impact bullets with coloured dots
- "How your money helps" stepped visual (3 tiers, euro amounts left, descriptions right, vertical line connecting)
- Financial transparency bar (programs green, admin blue, fundraising orange)
- "Your impact so far" calculator (translates actual donated amount to tangible outcomes)
- Achievement timeline (horizontal desktop, vertical mobile)
- Tax deductibility section: 5 countries listed with green/orange/grey status
- Identifiable victim story
- Allocation slider (draggable, 44px touch target) (Level 2+)
- Save button
- Charity brand colour gradient at top at low opacity

### 7.6 Tax Dashboard (`/tax`) (Level 2+)
- Estimated tax saving (animated number, blue)
- Circular progress indicator for tax ceiling (not linear bar)
- Breakdown cards by rate with progress bars and glow effect
- Year-end projection with "room to give more" callout
- Tax package: 3 PDFs listed, download button (functional with simulated data)
- Income bracket + jurisdiction + debit frequency (editable)
- Country-specific terminology (Loi Coluche, Gift Aid, Sonderausgaben, etc.)
- Country-specific receipt format names
- Currency matches jurisdiction (€, £)

### 7.7 Notifications (`/notifications`) (Level 2+)
- Activity feed with coloured dots per type
- Notification types: weekly summary (blue), monthly progress (green), milestone (yellow), crisis (red), charity update (purple), debit processed (green)
- Title, body, timestamp, read/unread state
- Unread dot on nav tab
- Notification cadence: max 3 to 5 per week, quiet hours (10pm to 8am), 4-hour cooldown between pushes

### 7.8 Settings (`/settings`)
- Account (email, join date)
- Theme toggle: Dark | Light | System (segmented control with icons)
- Bank connection status (simulated)
- SEPA mandate status (simulated)
- Notification toggles (iOS-style, working)
- Haptic feedback toggle
- Referral code with copy-to-clipboard (Level 4)
- Demo mode section (simulation controls, only if enabled)
- "Replay onboarding" button
- Cancellation: impact summary, pause/reduce/cancel options, no friction
- Data handling transparency: expandable "What data we store" card

### 7.9 Admin Dashboard (`/admin`)
- Protected by isAdmin flag (non-admins see 404)
- Sidebar nav (desktop), top tabs (mobile)
- **Overview:** 5 KPIs with sparklines (total users, total donated, avg donation, onboarding completion rate, active users). Snapshot export feature.
- **Users:** Sortable table, search, expandable detail. Jurisdiction/income charts. Onboarding funnel.
- **Onboarding funnel:** Step-by-step conversion, drop-off highlighting.
- **Donations:** Line chart (daily/weekly), bar chart per charity, pie chart by tax rate, distribution histogram, top donors table.
- **Charities:** Ranked donations, popularity, allocation distribution, "most loved" indicator.
- **Tax:** Savings by jurisdiction, by income bracket, ceiling approaching count, PDF download stats.
- **Notifications:** Sent count, read rate by type, timeline.
- **Early Access:** Email signups, by country, conversion rate, CSV export.
- **User Progression:** Level distribution, feature unlock rates, drop-off by level, time-to-level.
- All charts use Recharts with theme-aware colours.
- CSV export on all tables. Copy-to-clipboard on KPIs.

---

## 8. Simulation Engine

### Controls (Settings > Demo Mode)
- Simulate a Day / Week / Month buttons (colour-coded: blue, green, purple)
- Reset Data button (red outline, confirmation dialog)
- "Jump to Year End" button (gold, progress bar during generation)
- Simulation timeline bar (Jan to Dec with position marker)
- Demo Profiles: Sophie (24, student, 2 months), Thomas (35, engineer, 6 months), Marie (52, executive, 10 months near ceiling)
- Animated summary after each simulation ("Generated 6 transactions, €4.20 in round-ups")

### Transaction Generator
- Realistic French spending: Coffee (€2.50 to €5.50), Boulangerie (€1.20 to €8.00), Supermarket (€12 to €85), Metro (€1.90 to €4), Restaurant (€14 to €45), Online (€8 to €120), Pharmacy (€3 to €35), Bar (€4 to €18)
- Merchant names per category (Starbucks, Paul, Monoprix, RATP, Big Mamma, Amazon, etc.)
- Weekdays: 4 to 8 transactions. Weekends: 2 to 5.
- Time-of-day realism (coffee 7 to 9am, lunch 12 to 2pm, etc.)
- Seasonal modifiers: January 70%, July 130%, December 150% with seasonal merchants
- Recurring patterns: same coffee shop weekday mornings, weekly supermarket Saturday
- Spending variation: some weeks more social, some quieter

### Processing
- Round-up calculation per transaction
- Allocate across charities by user's percentage split
- Update running totals (YTD, per-charity, tax savings)
- Weekly SEPA debit batch after every 7 days
- Monthly milestone checks (€10, €25, €50, €100, €250, €500, €1,000, €1,500, €2,000)
- Tax ceiling proximity alerts (within €200)
- Year-end projection recalculation based on actual average

### Notifications Generated
- Weekly summary after each simulated week
- Monthly progress after each simulated month
- Milestone notifications at threshold crossings
- Tax ceiling proximity when within €200
- Charity impact updates every 2 to 3 weeks
- Copy variants: Factual / Warm / Motivational (toggle in Demo Mode)

### Crisis Events
- "Trigger Crisis Event" button in Demo Mode
- Crisis templates: earthquake, flood, refugee emergency, famine
- Shows banner on dashboard, user can redirect round-ups for 7 days
- Auto-reverts to normal allocation after period

### Year-End PDF
- Annual summary: totals per charity, month-by-month table
- Tax calculation: deduction amounts by rate, ceiling tracking
- Country-specific format (Cerfa for France, Gift Aid for UK, etc.)
- Light/print-friendly palette regardless of app theme

---

## 9. Tax Engine

### Jurisdiction-Aware Architecture
All tax functions take a jurisdiction parameter. Nothing hardcoded to one country.

| Country | Standard Rate | Enhanced Rate | Enhanced Ceiling | Income Cap |
|---|---|---|---|---|
| France | 66% | 75% (Loi Coluche) | €2,000 | 20% of income |
| UK | 25% (Gift Aid) | 40-45% (higher rate) | No cap | No cap |
| Germany | ~30-45% (marginal) | None | 20% of income | 20% of income |
| Belgium | 45% | Same | €397,850 or 10% income | 10% of income |
| Spain | 80% (first €250) | 40% (above €250) | 10% of income | 10% of income |

### Functions
- `calculateDeduction(amount, charityType, jurisdiction)`
- `getCeiling(jurisdiction, incomeBracket)`
- `getProjection(currentDonations, monthsRemaining, jurisdiction)`
- `getEffectiveCost(donationAmount, jurisdiction, incomeBracket)`

### Country-Specific UI
- Tax dashboard labels adapt (Loi Coluche, Gift Aid, Sonderausgaben, etc.)
- Currency symbols match jurisdiction
- Receipt format names change per country
- Income bracket labels and ranges change per country

---

## 10. PWA

- manifest.json with app name, icons (72 to 512px), standalone display, warm charcoal theme
- Service worker: app shell cached on install, network-first for API, offline banner
- Custom install prompt after 3+ visits
- iOS: Add to Home Screen instructions
- Gesture navigation: swipe between tabs, pull-to-refresh, bottom sheet dismiss
- Haptic feedback: light/medium/success/error patterns (with toggle in Settings)
- Directional page transitions (250ms spring ease)
- Shared element transitions (charity card → detail)
- Offline support: cached dashboard, charities, notifications, settings
- Performance targets: <1s load from home screen, <100ms page transitions

---

## 11. Behavioral Design Principles (Built In, Not Bolted On)

1. **Warm glow is the product.** Every screen must deliver or reinforce the feeling of "I did something good."
2. **First 48 hours are everything.** Welcome notification within 24h, first impact notification within 48h, first-week journey tracker.
3. **Impact before tax. Always.** "Your €34 funded 4 medical kits" comes before "You saved €22 in taxes."
4. **Spare change, not donations.** Frame round-ups as rounding, not withdrawing. "Your spare change this week" not "Your donations this week."
5. **Consistency, not streaks.** "Giving since October 2025" not "47-day streak." Never punish for not spending.
6. **Small wins constantly.** Milestones at €10, €25, €50, €100... with celebrations and accelerator messages.
7. **Stories, not statistics.** Feature single individuals ("Amara, 9, was treated for malaria") not aggregates.
8. **Social proof that feels real.** "1,247 people donated today" with non-round numbers that increment daily.
9. **Cancellation with dignity.** Impact summary, pause/reduce options, no friction, one final beautiful email.
10. **Context for every number.** "€247, or about 68 cents per day" not "€247" alone. Large numbers trigger loss aversion.

---

## 12. Data Model (SQLite via Drizzle ORM)

### users
id (text PK), email (text unique), password_hash (text), name (text), jurisdiction (text default 'FR'), income_bracket (int 0-3), debit_frequency (text 'weekly'|'monthly'), onboarding_completed (boolean), onboarding_step_reached (int), referral_code (text unique), is_admin (boolean), user_level (int 1-4), level_unlocked_at (text, JSON timestamps), theme_preference (text 'dark'|'light'|'system'), haptic_enabled (boolean default true), created_at (timestamptz)

### charities
id (text PK), name (text), description (text), category (text), icon (text), country_code (text), display_countries (text, JSON array), quality_label (text), tax_rate (int), loi_coluche_eligible (boolean), mission (text), founding_story (text), impact (text, JSON array), how_your_money_helps (text, JSON array of {amount, description}), financial_transparency (text, JSON {programs_pct, admin_pct, fundraising_pct}), certifications (text, JSON array of {name, year}), milestones (text, JSON array of {year, title, description}), jurisdictions_eligible (text, JSON array), cross_border_method (text), story (text), website_url (text), founded_year (int), currency (text default 'EUR'), brand_color (text)

### user_charities
id (text PK), user_id (text FK), charity_id (text FK), allocation_pct (int)

### roundups
id (text PK), user_id (text FK), amount (real), merchant_name (text), category (text), timestamp (text)

### debits
id (text PK), user_id (text FK), total_amount (real), period_start (text), period_end (text), roundup_count (int), status (text)

### allocations
id (text PK), debit_id (text FK), charity_id (text FK), amount (real), tax_rate (int)

### notifications
id (text PK), user_id (text FK), type (text), title (text), body (text), read (boolean default false), created_at (text)

### jurisdiction_tax_rules
id (text PK), country_code (text), standard_rate (int), enhanced_rate (int), enhanced_ceiling (real), income_cap_pct (int), carry_forward_years (int), receipt_format (text), currency (text), currency_symbol (text)

### early_access
id (text PK), email (text unique), country (text), created_at (text)

### simulation_state
id (text PK), user_id (text FK), current_date (text), day_count (int), notification_style (text default 'warm')

---

## 13. Copy Rules

- No dashes as punctuation anywhere. Use colons, commas, semicolons, or restructure.
- Warm, confident, modern tone. Not corporate, not startup-bro.
- Short sentences. Lead with benefit, not feature.
- Address the reader as "you" not "users."
- French names for testimonials (French-first product).
- Numbers are more compelling than adjectives.
- "Spare change" not "donations" for round-up language.
- Impact before tax in all notifications and summaries.
- No words that frame giving as a loss: avoid "debited", "charged", "payment", "withdraw", "cost."

---

## 14. Task Checklist

### Phase A: Foundation
- [x] Initialize Next.js project with TypeScript, Tailwind, App Router
- [x] Configure Tailwind with Warm Charcoal palette as CSS custom properties
- [x] Set up SQLite + Drizzle ORM, create schema, run migrations
- [x] Seed all 40 charities with full content (5 international + 35 country-specific)
- [x] Seed tax rules for all 5 countries
- [x] Set up iron-session auth with bcrypt
- [x] Create shared UI components: Card, Badge, ProgressBar (with ARIA), Button, Toggle, Toast, AnimatedNumber, BottomNav
- [x] Set up Zustand store
- [x] Create ThemeProvider (dark/light/system) with CSS variable switching
- [x] Create level system: getUserLevel(), useFeatureAccess() hook
- [x] Commit: "Foundation complete"

### Phase B: Auth + Onboarding
- [x] Sign up page
- [x] Login page
- [x] Auth route protection (proxy.ts)
- [x] 4-step onboarding: Welcome → Country → Pick charities (12 shown, grouped) → Done
- [x] Country selection shows flag pills, auto-detect
- [x] Charity picker groups by "Popular in [country]" + "International"
- [x] Confetti on final step only
- [x] Commit: "Auth and onboarding complete"

### Phase C: Dashboard
- [x] Level 1 dashboard: greeting, total (animated, with context), charity list, first-week journey tracker
- [x] Level 2 additions: weekly summary (expandable transactions), tax preview, social proof, milestones
- [x] Level 3 additions: crisis banner, consistency counter, impact card, sparkline, delta
- [x] Level 4 additions: full tax progress, share button, next milestone accelerator
- [x] Warm glow overlay system (3-second full-screen impact statement after simulation)
- [x] All language follows behavioral design rules
- [x] Commit: "Dashboard complete with progressive disclosure"

### Phase D: Charities
- [x] Charities browser with search, category filters (7 categories), jurisdiction filter, sort
- [x] Charity cards with all badges and status indicators
- [x] Charity detail bottom sheet (vaul) with all sections
- [x] Impact calculator per charity
- [x] Financial transparency bar
- [x] Achievement timeline
- [x] Identifiable victim stories
- [x] Allocation slider (Level 2+)
- [x] Cross-border tax eligibility display
- [x] Commit: "Charities complete"

### Phase E: Tax Dashboard
- [x] Tax dashboard with jurisdiction-aware calculations
- [x] Circular progress for ceiling
- [x] Breakdown by rate with progress bars
- [x] Year-end projection
- [x] PDF generation (3 PDFs, country-specific format)
- [x] Download buttons
- [x] Income bracket editor (prompted on first Tax tab visit)
- [x] Commit: "Tax dashboard complete"

### Phase F: Notifications + Settings
- [x] Notification inbox with typed, coloured feed
- [x] Unread badge on nav
- [x] Settings: account, theme toggle, bank status, SEPA status, notification toggles, haptics toggle, referral, demo mode, data transparency, cancellation flow
- [x] Notification cadence system (quiet hours, cooldown)
- [x] Commit: "Notifications and settings complete"

### Phase G: Simulation Engine
- [x] Demo mode controls in Settings
- [x] Transaction generator with all categories, merchants, seasonal patterns
- [x] Round-up processing, allocation, debit batching
- [x] Milestone checking, notification generation
- [x] Crisis event simulation
- [x] Demo profiles (Sophie, Thomas, Marie)
- [x] Notification copy variants (Factual/Warm/Motivational)
- [x] Year-end PDF with simulated data
- [x] Commit: "Simulation engine complete"

### Phase H: Landing Page
- [x] Full landing page with all sections (hero, how it works, live demo, tax calculator, charity showcase, comparison, numbers, social proof, FAQ, CTA, footer)
- [x] Early access email capture
- [x] SEO (meta tags, Open Graph, JSON-LD, sitemap)
- [x] Commit: "Landing page complete"

### Phase I: Admin Dashboard
- [x] All 9 admin pages with charts and tables
- [x] KPI bar, user progression tracking
- [x] CSV export, snapshot feature
- [x] Commit: "Admin dashboard complete"

### Phase J: PWA
- [x] manifest.json, icons, splash screens
- [x] Service worker with caching
- [x] Install prompt
- [x] Gesture navigation (swipe tabs, pull-to-refresh)
- [x] Haptic feedback system
- [x] Directional transitions
- [x] Offline support
- [x] Commit: "PWA complete"

### Phase K: Polish
- [x] WCAG contrast audit in both themes
- [x] Touch target verification (44px minimum)
- [x] Mobile test at 375px on every screen
- [x] Theme transition smoothness
- [x] No flash of wrong theme on load
- [x] All animations respect prefers-reduced-motion
- [x] All numbers have context (never alone)
- [x] All copy follows behavioral design and language rules
- [x] Commit: "Polish complete"

### Phase L: Final Review
- [x] Full flow: landing page → signup → onboard → simulate 3 months → check every screen → download PDF
- [x] Test all 5 jurisdictions
- [x] Test all 3 demo profiles
- [x] Test dark mode and light mode on every screen
- [x] Test on mobile (375px)
- [x] Verify admin dashboard with simulated data
- [x] Commit: "RoundUp v2 complete"
