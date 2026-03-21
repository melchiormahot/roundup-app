# RoundUp: Phase 1 Web MVP

## Product Requirements Document

### What is RoundUp?
A web app that helps users donate to curated charities by tracking simulated transaction round-ups, with real-time tax deduction tracking and year-end PDF generation. Phase 1 is a functional prototype with simulated transactions (no real bank connection yet).

### Tech Stack
- **Framework:** Next.js 15 (App Router, TypeScript)
- **Styling:** Tailwind CSS + Framer Motion for animations
- **Database:** SQLite via better-sqlite3 + Drizzle ORM
- **Auth:** Simple email/password with iron-session (no external service needed)
- **PDF:** @react-pdf/renderer for tax documents
- **State:** Zustand for client state
- **Icons:** Lucide React

### Design Direction
- **Palette: Deep Navy**
  - Background: #060e1a / #0b1628
  - Cards: #0f1f38
  - Borders: #152a4a / #1a3050
  - Primary text: #d0dff0
  - Secondary text: #7a9cc6
  - Green (donations/success): #5ce0b8
  - Blue (tax/info): #4a9eff
  - Purple (charities): #b48eff
  - Red (alerts): #ff6b6b
  - Yellow (engagement): #ffd93d
  - Orange: #ff9a76
- **Typography:** System font stack (-apple-system, BlinkMacSystemFont, SF Pro, Segoe UI)
- **Border radius:** 14-16px for cards, 20px for pills
- **Feel:** Premium fintech, not a toy. Think Revolut or Monzo's dark mode.

---

## Task List

### Setup
- [x] Initialize Next.js 15 project with TypeScript, Tailwind CSS, App Router
- [x] Configure Tailwind with the Deep Navy color palette as custom theme
- [x] Set up SQLite database with better-sqlite3 and Drizzle ORM
- [x] Create database schema and migrations (see Data Model below)
- [x] Seed database with charity data, sample transactions, and tax rules
- [x] Set up Zustand store for client state
- [x] Create shared UI components: Card, Badge, ProgressBar, Button, Toggle, Toast

### Auth
- [x] Sign up page (email + password)
- [x] Login page
- [x] Auth middleware protecting app routes (iron-session)
- [x] Password hashing with bcrypt

### Onboarding Flow (8 steps, /onboarding route)
- [x] Step 1: Welcome screen with animated logo ("Give effortlessly. Save on taxes.")
- [x] Step 2: Jurisdiction picker (France pre-selected, UK, Germany, Belgium, Spain)
- [x] Step 3: Income bracket selector (Under 30k / 30-60k / 60-100k / 100k+)
- [x] Step 4: Tax preview "aha" moment (animated number showing tax credit based on jurisdiction + bracket, with confetti)
- [x] Step 5: Connect bank (simulated: show bank cards, fake loading, "Connected!" state)
- [x] Step 6: SEPA mandate confirmation (show details, sign button, EUR 0 verification note)
- [x] Step 7: Charity picker (multi-select grid of 6 charities with checkmark animation)
- [x] Step 8: Celebration screen ("You're all set!" with confetti, "Let's go" button redirects to dashboard)
- [x] Step indicator dots at bottom, Next/Back navigation, smart button disabling

### Home Dashboard (/dashboard)
- [x] Greeting with user name and time-of-day
- [x] Year-to-date donation total (large animated number, green)
- [x] Tax ceiling progress bar (Loi Coluche: donated / EUR 2,000) with glow effect
- [x] Tax saving so far + remaining
- [x] Crisis banner (tappable, redirects round-ups, shows confirmation with undo)
- [x] "This week" card: round-up count, total, next debit date, expandable transaction list
- [x] Charity allocation card: rows showing charity name, %, EUR donated, tappable to open detail
- [x] Monthly milestone card (shareable)

### Charities Screen (/charities)
- [x] Header: "Charities" with subtitle
- [x] Category filter pills (All, Health, Environment, Humanitarian, Human Rights) that actually filter
- [x] Charity cards: avatar, name, category, quality badge (Don en Confiance), tax rate badge
- [x] Tap card opens charity detail page

### Charity Detail (/charities/[id])
- [x] Large avatar, name, category, quality badge
- [x] Mission section
- [x] Recent impact bullets
- [x] Tax benefit for user's jurisdiction
- [x] Draggable allocation slider (0-100%) that updates in real-time
- [x] Year-to-date donation amount
- [x] Save button

### Tax Dashboard (/tax)
- [x] Estimated tax saving (large animated number, blue)
- [x] 75% rate card: charity name, amount, progress bar with glow, ceiling tracker
- [x] 66% rate card: same structure
- [x] Year-end projection paragraph with "room to give more" callout
- [x] Tax package section: 3 PDFs listed, download button (greyed until January or functional with sample data)
- [x] Income bracket + jurisdiction + debit frequency display (editable)

### Notifications (/notifications)
- [x] Activity feed with colored dots per type (blue: weekly, green: monthly, red: crisis, purple: charity update, yellow: milestone)
- [x] Each notification has title, body, timestamp
- [x] Tappable notifications show detail or trigger action
- [x] Unread indicator dot on nav item

### Settings (/settings)
- [x] Account section (email, join date)
- [x] Bank connection status (simulated: shows "Connected" with bank name)
- [x] SEPA mandate status
- [x] Notification toggles (weekly summary, monthly progress, crisis alerts, charity updates) with working iOS-style switches
- [x] Referral code section with copy-to-clipboard
- [x] Replay onboarding button

### PDF Generation
- [x] Year-end summary PDF: total per charity, monthly breakdown table
- [x] Tax calculation PDF: deduction amounts by rate (66%/75%), ceiling tracking
- [x] Generate with sample data for demo purposes
- [x] Download button on Tax Dashboard

### Simulated Data
- [x] Seed 6 charities: MSF, WWF France, Ligue contre le cancer, Restos du Coeur, Amnesty International, Secours Populaire
- [x] Each charity has: name, description, category, icon/emoji, quality_label, tax_rate, mission, impact_bullets[], crisis_eligible
- [x] Seed sample round-up transactions (last 30 days of simulated purchases: coffee, groceries, metro, restaurants, shops)
- [x] Seed sample notifications (weekly summaries, monthly progress, one crisis alert, one charity update)
- [x] Tax rules for France: 66% standard, 75% Loi Coluche (ceiling EUR 2,000), 20% income cap

### Bottom Navigation
- [x] 5 tabs: Home, Charities, Tax, Inbox, Settings
- [x] Active tab highlighted in blue
- [x] Notification dot on Inbox when unread
- [x] Frosted glass effect (backdrop-filter blur)
- [x] Smooth transitions between screens

### Animations & Polish
- [x] Number count-up animations on dashboard load and tab switch
- [x] Progress bar glow effects
- [x] Card fade-in on scroll (staggered, using Framer Motion or Intersection Observer)
- [x] Toast notifications (slide down, auto-dismiss)
- [x] Tab transition: scale + fade (not instant switch)
- [x] Draggable slider with haptic-feeling feedback
- [x] Crisis banner state change animation

---

## Data Model (SQLite via Drizzle ORM)

### users
- id (text, PK, nanoid)
- email (text, unique)
- password_hash (text)
- name (text)
- jurisdiction (text, default 'FR')
- income_bracket (int, 0-3)
- debit_frequency (text, 'weekly' or 'monthly')
- onboarding_completed (boolean, default false)
- referral_code (text, unique)
- created_at (timestamptz)

### charities
- id (uuid, PK)
- name (text)
- description (text)
- category (text: health, environment, humanitarian, rights)
- icon (text, emoji)
- quality_label (text)
- tax_rate (int, 66 or 75)
- mission (text)
- impact (jsonb, array of strings)
- crisis_eligible (boolean)

### user_charities (allocation)
- id (uuid, PK)
- user_id (uuid, FK users)
- charity_id (uuid, FK charities)
- allocation_pct (int, 0-100)

### roundups
- id (uuid, PK)
- user_id (uuid, FK users)
- amount (decimal)
- timestamp (timestamptz)
- status (text: pending, included, skipped)

### debits
- id (uuid, PK)
- user_id (uuid, FK users)
- total_amount (decimal)
- period_start (date)
- period_end (date)
- roundup_count (int)
- status (text: scheduled, charged, failed)

### allocations
- id (uuid, PK)
- debit_id (uuid, FK debits)
- charity_id (uuid, FK charities)
- amount (decimal)
- tax_rate (int)

### notifications
- id (uuid, PK)
- user_id (uuid, FK users)
- type (text: weekly, monthly, crisis, charity_update, milestone)
- title (text)
- body (text)
- read (boolean, default false)
- created_at (timestamptz)

### jurisdiction_tax_rules
- id (uuid, PK)
- country_code (text)
- standard_rate (int)
- enhanced_rate (int)
- enhanced_ceiling (decimal)
- income_cap_pct (int)
- receipt_format (text)

---

## Jurisdiction Tax Rules (Seed Data)

### France (FR)
- standard_rate: 66
- enhanced_rate: 75
- enhanced_ceiling: 2000
- income_cap_pct: 20
- receipt_format: 'cerfa_11580'

---

## Important Notes
- This is Phase 1: NO real bank connection, NO real payments. All transaction data is simulated.
- The app must look and feel like a real fintech product, not a prototype.
- Mobile-responsive: should work on phone browsers (375px width).
- All text in English for now (French localisation later).
- Use the Deep Navy palette consistently. Reference the prototype at ../RoundUp App/04-Visuals/prototype-v2.html for visual direction.
- No dashes as punctuation in any UI copy. Use colons, commas, or restructure sentences.
