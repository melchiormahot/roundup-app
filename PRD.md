# RoundUp: Phase 1 Web MVP

## Product Requirements Document

### What is RoundUp?
A web app that helps users donate to curated charities by tracking simulated transaction round-ups, with real-time tax deduction tracking and year-end PDF generation. Phase 1 is a functional prototype with simulated transactions (no real bank connection yet).

### Tech Stack
- **Framework:** Next.js 15 (App Router, TypeScript)
- **Styling:** Tailwind CSS + Framer Motion for animations
- **Database:** Supabase (Postgres + Auth + Row Level Security)
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
- [ ] Initialize Next.js 15 project with TypeScript, Tailwind CSS, App Router
- [ ] Configure Tailwind with the Deep Navy color palette as custom theme
- [ ] Set up Supabase client with environment variables (.env.local.example)
- [ ] Create database schema (see Data Model below)
- [ ] Set up Zustand store for client state
- [ ] Create shared UI components: Card, Badge, ProgressBar, Button, Toggle, Toast

### Auth
- [ ] Sign up page (email + password)
- [ ] Login page
- [ ] Auth middleware protecting app routes
- [ ] Supabase Auth integration

### Onboarding Flow (8 steps, /onboarding route)
- [ ] Step 1: Welcome screen with animated logo ("Give effortlessly. Save on taxes.")
- [ ] Step 2: Jurisdiction picker (France pre-selected, UK, Germany, Belgium, Spain)
- [ ] Step 3: Income bracket selector (Under 30k / 30-60k / 60-100k / 100k+)
- [ ] Step 4: Tax preview "aha" moment (animated number showing tax credit based on jurisdiction + bracket, with confetti)
- [ ] Step 5: Connect bank (simulated: show bank cards, fake loading, "Connected!" state)
- [ ] Step 6: SEPA mandate confirmation (show details, sign button, EUR 0 verification note)
- [ ] Step 7: Charity picker (multi-select grid of 6 charities with checkmark animation)
- [ ] Step 8: Celebration screen ("You're all set!" with confetti, "Let's go" button redirects to dashboard)
- [ ] Step indicator dots at bottom, Next/Back navigation, smart button disabling

### Home Dashboard (/dashboard)
- [ ] Greeting with user name and time-of-day
- [ ] Year-to-date donation total (large animated number, green)
- [ ] Tax ceiling progress bar (Loi Coluche: donated / EUR 2,000) with glow effect
- [ ] Tax saving so far + remaining
- [ ] Crisis banner (tappable, redirects round-ups, shows confirmation with undo)
- [ ] "This week" card: round-up count, total, next debit date, expandable transaction list
- [ ] Charity allocation card: rows showing charity name, %, EUR donated, tappable to open detail
- [ ] Monthly milestone card (shareable)

### Charities Screen (/charities)
- [ ] Header: "Charities" with subtitle
- [ ] Category filter pills (All, Health, Environment, Humanitarian, Human Rights) that actually filter
- [ ] Charity cards: avatar, name, category, quality badge (Don en Confiance), tax rate badge
- [ ] Tap card opens charity detail page

### Charity Detail (/charities/[id])
- [ ] Large avatar, name, category, quality badge
- [ ] Mission section
- [ ] Recent impact bullets
- [ ] Tax benefit for user's jurisdiction
- [ ] Draggable allocation slider (0-100%) that updates in real-time
- [ ] Year-to-date donation amount
- [ ] Save button

### Tax Dashboard (/tax)
- [ ] Estimated tax saving (large animated number, blue)
- [ ] 75% rate card: charity name, amount, progress bar with glow, ceiling tracker
- [ ] 66% rate card: same structure
- [ ] Year-end projection paragraph with "room to give more" callout
- [ ] Tax package section: 3 PDFs listed, download button (greyed until January or functional with sample data)
- [ ] Income bracket + jurisdiction + debit frequency display (editable)

### Notifications (/notifications)
- [ ] Activity feed with colored dots per type (blue: weekly, green: monthly, red: crisis, purple: charity update, yellow: milestone)
- [ ] Each notification has title, body, timestamp
- [ ] Tappable notifications show detail or trigger action
- [ ] Unread indicator dot on nav item

### Settings (/settings)
- [ ] Account section (email, join date)
- [ ] Bank connection status (simulated: shows "Connected" with bank name)
- [ ] SEPA mandate status
- [ ] Notification toggles (weekly summary, monthly progress, crisis alerts, charity updates) with working iOS-style switches
- [ ] Referral code section with copy-to-clipboard
- [ ] Replay onboarding button

### PDF Generation
- [ ] Year-end summary PDF: total per charity, monthly breakdown table
- [ ] Tax calculation PDF: deduction amounts by rate (66%/75%), ceiling tracking
- [ ] Generate with sample data for demo purposes
- [ ] Download button on Tax Dashboard

### Simulated Data
- [ ] Seed 6 charities: MSF, WWF France, Ligue contre le cancer, Restos du Coeur, Amnesty International, Secours Populaire
- [ ] Each charity has: name, description, category, icon/emoji, quality_label, tax_rate, mission, impact_bullets[], crisis_eligible
- [ ] Seed sample round-up transactions (last 30 days of simulated purchases: coffee, groceries, metro, restaurants, shops)
- [ ] Seed sample notifications (weekly summaries, monthly progress, one crisis alert, one charity update)
- [ ] Tax rules for France: 66% standard, 75% Loi Coluche (ceiling EUR 2,000), 20% income cap

### Bottom Navigation
- [ ] 5 tabs: Home, Charities, Tax, Inbox, Settings
- [ ] Active tab highlighted in blue
- [ ] Notification dot on Inbox when unread
- [ ] Frosted glass effect (backdrop-filter blur)
- [ ] Smooth transitions between screens

### Animations & Polish
- [ ] Number count-up animations on dashboard load and tab switch
- [ ] Progress bar glow effects
- [ ] Card fade-in on scroll (staggered, using Framer Motion or Intersection Observer)
- [ ] Toast notifications (slide down, auto-dismiss)
- [ ] Tab transition: scale + fade (not instant switch)
- [ ] Draggable slider with haptic-feeling feedback
- [ ] Crisis banner state change animation

---

## Data Model (Supabase)

### users
- id (uuid, PK, from Supabase Auth)
- email (text)
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
