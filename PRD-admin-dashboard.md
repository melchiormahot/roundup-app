# RoundUp: Analytics & Admin Dashboard PRD

## Context
The app needs an internal analytics dashboard at `/admin` for tracking key metrics, understanding user behavior, and preparing investor/partner presentations. This is not user-facing; it's for you and your team. It should feel like a professional BI tool, not a debug page.

---

## Task List

### Access and Auth
- [x] Admin route at `/admin` protected by a simple admin check (hardcode your email as admin for now, or add an `is_admin` boolean to the users table)
- [x] Non-admin users who visit `/admin` see a 404 (not "access denied", to avoid revealing the route exists)
- [x] Admin layout: full-width (no bottom nav), sidebar navigation on desktop, top tabs on mobile
- [x] Dark theme matching the app, but with more data density (smaller cards, tighter spacing)

### Top-Level KPI Bar
- [x] Persistent bar at the top of every admin page showing 5 key metrics:
  - Total users (with daily change: "+3 today")
  - Total donated (with weekly change: "+€142 this week")
  - Average donation per user per month
  - Onboarding completion rate (users who finished onboarding / total signups, as percentage)
  - Active users (users with at least 1 round-up in the last 7 days / total users)
- [x] Each metric is a card with: label, large number, delta indicator (green up arrow or red down arrow), sparkline showing last 30 days
- [x] KPIs should refresh on page load (no real-time needed for MVP)

### Users Overview Page (`/admin/users`)
- [x] Table of all registered users: email, name, jurisdiction, income bracket, signup date, onboarding completed (yes/no), total donated, charities selected count, last active date
- [x] Sortable columns (click header to sort)
- [x] Search/filter by email or name
- [x] Click a row to expand user detail: their charity allocations, donation history, notification preferences
- [x] Summary cards above the table:
  - Total users
  - Users by jurisdiction (horizontal bar chart: France 45%, UK 20%, etc.)
  - Users by income bracket (horizontal bar chart)
  - Onboarding funnel: how many users completed each step (bar chart showing drop-off)

### Onboarding Funnel (`/admin/onboarding`)
- [x] Funnel visualization showing conversion at each onboarding step:
  - Visited signup page → Created account → Step 1 (Welcome) → Step 2 (Jurisdiction) → Step 3 (Income) → Step 4 (Tax preview) → Step 5 (Bank) → Step 6 (SEPA) → Step 7 (Charities) → Step 8 (Complete)
- [x] Show absolute numbers and percentage drop-off at each step
- [x] Highlight the biggest drop-off step in red: "Biggest friction point: Bank connection (34% drop-off)"
- [x] Time-to-complete metric: average time from signup to onboarding completion
- [x] For the MVP: track this by adding an `onboarding_step_reached` field to the users table and updating it as users progress

### Donations Analytics (`/admin/donations`)
- [x] Summary cards:
  - Total donated (all time)
  - Total donated this month
  - Average round-up amount
  - Total number of round-ups
  - Average round-ups per user per week
  - Total SEPA debits processed
- [x] Line chart: total donations over time (daily for last 30 days, weekly for last 6 months)
- [x] Bar chart: donations by charity (which charities receive the most)
- [x] Pie chart: donation split by tax rate (75% vs 66% eligible)
- [x] Table: top 10 donors by total amount (anonymised: "User #1234")
- [x] Distribution histogram: how much do users donate per month? (buckets: €0-5, €5-10, €10-20, €20-50, €50+)

### Charity Analytics (`/admin/charities`)
- [x] Table of all charities: name, category, total received, number of users who selected it, average allocation percentage, tax rate
- [x] Bar chart: total donations per charity (ranked)
- [x] Popularity chart: which charities are most frequently selected by users
- [x] Allocation distribution: average % allocation per charity across all users
- [x] "Most loved" indicator: charity with highest average allocation (users who choose it give it the biggest share)
- [x] Crisis events log: list of past crisis events triggered, total redirected to each

### Tax Analytics (`/admin/tax`)
- [x] Summary cards:
  - Total tax savings generated for users (sum of all deductions)
  - Average tax saving per user
  - Users approaching ceiling (within €200 of their limit)
  - Users who have hit their ceiling
- [x] Breakdown by jurisdiction: total donated and total tax saved per country
- [x] Bar chart: tax savings by income bracket (which bracket saves the most)
- [x] PDF generation stats: how many PDFs have been downloaded
- [x] Projection: estimated total tax savings by year-end based on current trajectory

### Notification Analytics (`/admin/notifications`)
- [x] Summary cards:
  - Total notifications sent
  - Read rate (notifications read / total sent)
  - Most engaged notification type (highest read rate)
  - Least engaged notification type (lowest read rate)
- [x] Bar chart: notification count by type (weekly, monthly, milestone, crisis, charity update)
- [x] Read rate by type: bar chart showing which notification types get opened
- [x] If notification copy variants exist (from simulation PRD): compare read rates across Factual / Warm / Motivational variants
- [x] Timeline: notifications sent over time (line chart, last 30 days)

### Early Access Analytics (`/admin/early-access`)
- [x] Total email signups from the landing page
- [x] Signups over time (line chart, daily)
- [x] Signups by country (from the tax calculator selection, if captured)
- [x] Conversion rate: early access signups who later created a full account
- [x] Table: all early access emails with signup date and conversion status
- [x] "Export CSV" button to download the email list

### Simulation Stats (`/admin/simulation`)
- [x] For tracking demo usage:
  - How many users have used simulation features
  - Most used simulation button (Day, Week, Month, Jump to Year End)
  - Average simulated days per user
  - Demo profiles loaded (Sophie, Thomas, Marie counts)
- [x] This helps understand how people demo the app

### Charts and Visualisation
- [x] Use a charting library: Recharts (React-native, works well with Next.js and Tailwind)
- [x] All charts should use the Deep Navy palette:
  - Chart background: transparent (sits on card)
  - Grid lines: #152a4a (very subtle)
  - Data colours: green (#5ce0b8), blue (#4a9eff), purple (#b48eff), yellow (#ffd93d), red (#ff6b6b), orange (#ff9a76)
  - Text/labels: #7a9cc6
  - Tooltips: navy-700 background with white text
- [x] Charts should be responsive (work on mobile admin view)
- [x] Add loading skeletons while data fetches

### Admin Sidebar Navigation
- [x] Sidebar on desktop (collapsible), top tabs on mobile
- [x] Links: Overview (KPIs), Users, Onboarding, Donations, Charities, Tax, Notifications, Early Access, Simulation
- [x] Active page highlighted
- [x] RoundUp logo at top of sidebar
- [x] "Back to App" link at bottom

---

## Iteration Rounds

### Iteration 1: Data Accuracy
- [x] Verify all metrics calculate correctly against raw database data
- [x] Create 3 test users with different profiles and simulate data, then check every metric on every admin page
- [x] Verify totals match: sum of individual user donations should equal total donated
- [x] Verify percentages are correct: onboarding funnel percentages should add up logically
- [x] Verify charts render with zero data (new install), small data (1 user), and large data (simulate 50+ users worth of data)

### Iteration 2: Visual Polish
- [x] Ensure consistent card sizing and spacing across all admin pages
- [x] Charts should have consistent axis formatting (currency with €/£ symbol, percentages with %)
- [x] Numbers should use locale-appropriate formatting (1,234.56 not 1234.56)
- [x] Add hover tooltips to all charts showing exact values
- [x] The admin dashboard should feel professional enough to screenshot and put in a pitch deck
- [x] Test all pages at 1440px (desktop) and 375px (mobile)

### Iteration 3: Export and Sharing
- [x] Add "Export CSV" button to every table (users, donations, early access)
- [x] Add "Copy to clipboard" on each KPI card (copies the number)
- [x] Add a "Snapshot" feature on the Overview page: generates a summary text block you can paste into an email or document ("As of March 2026: 12,400 users, €2.4M donated, 89% onboarding completion, €185 avg tax saving per user")
- [x] This snapshot should be formatted for easy copy/paste into pitch decks or investor updates

### Iteration 4: Final Review
- [x] Navigate through every admin page, check for broken layouts or missing data
- [x] Test the admin route protection: log in as a non-admin user, verify /admin shows 404
- [x] Test with simulated data from all three demo profiles (Sophie, Thomas, Marie)
- [x] Verify charts look good with real data volumes
- [x] Commit with message "Admin analytics dashboard complete"

---

## Technical Notes
- All analytics queries should be server-side (API routes), not client-side database access
- Use SQL aggregation queries (SUM, COUNT, AVG, GROUP BY) for performance
- Cache expensive queries if needed (but for MVP with SQLite, this shouldn't be necessary)
- The admin dashboard reads data only; it never modifies user data
- All user data in the admin view should be handled carefully: no passwords exposed, emails visible only to admin
