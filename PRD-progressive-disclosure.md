# RoundUp: Progressive Disclosure PRD

## Context
New users are overwhelmed by features they don't understand yet. A tax dashboard means nothing on day 1. Crisis response is confusing before you've made your first round-up. This PRD implements progressive disclosure: features unlock naturally as the user reaches milestones, creating a sense of discovery and mastery instead of overload.

**The principle:** Show only what the user needs right now. Reveal the rest when they're ready.

**Research backing:** Hick's Law (decision time increases with options), cognitive load theory (working memory holds 4±1 items), and Krug's Law ("don't make me think"). Progressive disclosure reduces initial cognitive load by 40 to 60% (Nielsen Norman Group).

---

## User Levels

The app has 4 levels. The user never sees the word "level." They simply notice new features appearing as they grow.

### Level 1: Seedling (Day 0 to Day 7, €0 to €10 donated)
What the user sees:
- Dashboard: greeting, total donated (small number, no pressure), charity list, first-week journey tracker
- Charities: browse and read profiles (but max 3 selected, to keep it simple)
- Settings: basic account, notification preferences

What is HIDDEN:
- Tax dashboard (entire tab)
- Crisis response banner
- Giving streak/consistency counter
- Social proof numbers
- Milestone celebrations (no milestones to celebrate yet)
- Simulation controls
- PDF generation
- Admin dashboard
- Detailed notification inbox (just show a simple list)
- Allocation percentage slider (equal split by default, adjustable later)

### Level 2: Sprout (Day 7 to Day 30, €10 to €50 donated)
What UNLOCKS:
- Tax tab appears in bottom nav with a subtle "New" badge (one-time)
- Brief intro overlay when they first tap Tax: "As you donate, you earn tax deductions. Here's how you're doing." (3 second dismissable card, not a tutorial)
- Weekly summary card on dashboard (they now have enough data for it to be meaningful)
- Allocation slider on charity detail pages ("You've been giving for a week. Want to adjust how your spare change is split?")
- Milestone celebrations begin (first milestone: €10, then €25, €50)
- Social proof appears on dashboard ("1,247 people donated today")
- Notification inbox replaces simple list

### Level 3: Grower (Day 30 to Day 90, €50 to €200 donated)
What UNLOCKS:
- Crisis response feature (banner can now appear on dashboard)
- Giving consistency counter ("Giving since [date]")
- Year-end projection on tax dashboard ("At your current rate...")
- Up to 6 charities selectable (was 3)
- Charity impact calculator ("Your €86 to MSF funded approximately 12 medical kits")
- Sparkline/bar chart on weekly card
- Share impact button on milestones
- Detailed tax breakdown (75% vs 66% rate cards)

### Level 4: Flourishing (Day 90+, €200+ donated)
What UNLOCKS:
- Full charity catalogue (all 23, was limited to "recommended" subset)
- PDF generation and download
- Tax ceiling proximity alerts
- Referral program
- Cross-border charity eligibility details
- Advanced notification preferences (per-type toggles)
- Category browsing with full filters and search
- Financial transparency data on charity profiles
- All simulation controls (if demo mode is enabled)

---

## Task List

### Level System Infrastructure
- [ ] Add `user_level` field to user schema (int, 1 to 4)
- [ ] Add `total_donated` computed field (or query) for level calculation
- [ ] Add `days_since_signup` computed field
- [ ] Create a `getUserLevel(user)` function in `/src/lib/levels.ts` that returns the current level based on: days since signup AND total donated (both conditions must be met to advance)
- [ ] Level transitions: check on each dashboard load. If conditions met, advance and store.
- [ ] Add `level_unlocked_at` timestamps to track when each level was reached (for admin analytics)

### Level Transition Moments
- [ ] When a user advances to a new level, show a subtle unlock animation: the new feature slides into view with a gentle glow, and a one-line explanation appears: "You've unlocked Tax Tracking. Tap to explore."
- [ ] The unlock should feel like a reward, not a tutorial. One sentence, one tap, done.
- [ ] New features should have a small "New" dot badge for the first 3 days after unlock (then disappear)
- [ ] Do NOT show all unlocks at once. If multiple features unlock simultaneously, stagger them over 2 to 3 days (one unlock per day)
- [ ] The unlock animation should use the green accent colour and a subtle confetti of 5 to 8 particles (not overwhelming)

### Dashboard Progressive Disclosure
- [ ] Level 1 dashboard: greeting, total donated (with context: "That's 2 meals through Restos du Coeur"), charity list with equal split shown. Clean, calm, no data overload.
- [ ] Level 2 adds: weekly summary card (slides in from below on first appearance), tax progress preview (small, not the full dashboard), social proof line
- [ ] Level 3 adds: crisis banner (if active), consistency counter, impact card with rotating stories, sparkline
- [ ] Level 4: full dashboard as currently designed
- [ ] Each new element should animate in on its first appearance, then be static on subsequent visits

### Bottom Navigation Progressive Disclosure
- [ ] Level 1: 3 tabs only (Home, Charities, Settings). Centered, not cramped.
- [ ] Level 2: 4 tabs (Home, Charities, Tax [NEW], Settings). Tax tab slides in with "New" badge.
- [ ] Level 3: 4 tabs (same). Inbox notifications appear as a badge on Home tab instead of a separate tab.
- [ ] Level 4: 5 tabs (Home, Charities, Tax, Inbox, Settings). Full navigation.
- [ ] Tab additions should animate: the new tab slides in from the right, existing tabs shift to accommodate.

### Charity Selection Progressive Disclosure
- [ ] Level 1: show only "Top picks for you" (6 charities max, best for their jurisdiction). Max 3 selectable.
- [ ] Level 2: same 6 visible, but now user can select up to 6 and adjust allocation sliders
- [ ] Level 3: "Explore more charities" link appears below top picks, leading to expanded view with categories
- [ ] Level 4: full catalogue with search, filters, sort, all 23 charities, cross-border eligibility details
- [ ] At each level, if the user tries to access a locked feature, show: "This unlocks as you keep giving. You're almost there!" (not an error, an encouragement)

### Settings Progressive Disclosure
- [ ] Level 1: account, basic notifications (on/off), theme toggle, logout. Nothing else.
- [ ] Level 2: add notification type toggles (weekly, monthly)
- [ ] Level 3: add crisis alert toggle, bank connection details, SEPA mandate details
- [ ] Level 4: add referral program, advanced notification cadence, demo mode, replay onboarding
- [ ] Settings sections should appear naturally as they become relevant, not all at once behind a wall

### Onboarding Simplification for Level 1
- [ ] The onboarding flow should ONLY cover what Level 1 needs:
  1. Welcome
  2. Country (auto-detected, one tap to confirm)
  3. Pick 1 to 3 charities (from the curated 6, equal split, no sliders)
  4. Done. "Your round-ups start now."
- [ ] NO income bracket question at onboarding (defer to Level 2 when tax tab unlocks)
- [ ] NO bank connection at onboarding (defer, use simulated data to start)
- [ ] NO SEPA mandate at onboarding (defer to when real payments would begin)
- [ ] This reduces onboarding from 7 steps to 4. Research says each removed step saves ~10% drop-off.
- [ ] When tax tab unlocks at Level 2, prompt for income bracket then: "To show your tax savings, we need one more detail: your income bracket."
- [ ] When the app is ready for real payments (post-MVP), prompt for bank connection at Level 2 or 3

### Feature Gating Logic
- [ ] Create a `useFeatureAccess(feature)` hook that returns `{ available: boolean, level: number, unlockedAt: Date | null }`
- [ ] Features gated: 'tax_dashboard', 'crisis_response', 'allocation_slider', 'milestone_celebrations', 'social_proof', 'consistency_counter', 'impact_calculator', 'pdf_generation', 'referral', 'full_charity_catalogue', 'sparkline', 'share_impact', 'advanced_notifications', 'search_charities', 'cross_border_details'
- [ ] Components should check this hook and render nothing (not a locked state) if the feature isn't available. The user shouldn't know the feature exists until it unlocks.
- [ ] Admin users bypass all level gating (see everything always)

### Anti-Patterns to Avoid
- [ ] Do NOT show greyed-out locked features with "Unlock at Level 3" labels. This is a game, not a paywall. Hidden until ready.
- [ ] Do NOT use the word "level" or "unlock" in user-facing copy. The user should feel the app is growing with them, not that they're grinding.
- [ ] Do NOT gate content behind artificial paywalls. Every feature unlocks for free based on usage.
- [ ] Do NOT rush level transitions. A user who signs up and immediately simulates 6 months of data should still experience gradual unlocks (time-gated, not just donation-gated).
- [ ] Do NOT reset levels if a user pauses and returns. Once unlocked, always unlocked.

---

## Iteration Rounds

### Iteration 1: Level 1 Experience
- [ ] Sign up as a brand new user. What do you see?
- [ ] The dashboard should feel calm, focused, and achievable. Not empty, not overwhelming.
- [ ] Can you understand the app's purpose within 10 seconds of seeing the dashboard?
- [ ] Is the charity selection during onboarding quick and enjoyable?
- [ ] There should be ZERO cognitive overload. A 70-year-old and a 22-year-old should both feel comfortable.

### Iteration 2: Level Transitions
- [ ] Simulate reaching Level 2 (7 days + €10). Does the tax tab appear gracefully?
- [ ] Is the one-line explanation clear? Does it feel like a reward, not a tutorial?
- [ ] Simulate reaching Level 3 (30 days + €50). Do the new features feel like natural additions?
- [ ] Simulate reaching Level 4 (90 days + €200). Does the full app feel earned, not dumped?
- [ ] Are there any jarring moments where too much appears at once?

### Iteration 3: Edge Cases
- [ ] A power user who donates €300 in week 1: time gate should prevent Level 4 from unlocking immediately. Max one level advance per week.
- [ ] A user who donates €5 total over 6 months: should be Level 1 or Level 2 at most. Don't promote based on time alone if engagement is low.
- [ ] A user who uninstalls and reinstalls: level should persist (stored in database, not localStorage)
- [ ] Admin user: should see all features regardless of level
- [ ] Demo profiles (Sophie, Thomas, Marie): each should be at a different level to showcase the progression

### Iteration 4: Analytics Integration
- [ ] Track level distribution in admin dashboard: how many users at each level
- [ ] Track feature unlock rates: which features get explored after unlocking vs ignored
- [ ] Track drop-off by level: do Level 1 users churn more than Level 3?
- [ ] Track time-to-level: how many days does the average user take to reach each level
- [ ] These metrics should appear on a new "User Progression" page in the admin dashboard

### Iteration 5: Final Review
- [ ] Walk through the complete journey: signup → Level 1 (1 week) → Level 2 (1 month) → Level 3 (3 months) → Level 4 (6 months)
- [ ] Does the app feel like it grows WITH you?
- [ ] Does each new feature feel like a gift, not a chore?
- [ ] Is the Level 1 experience beautiful enough that someone would keep using the app even without knowing what's coming?
- [ ] Commit with message "Progressive disclosure complete: 4-level feature unlock system"

---

## Design Philosophy
- **Day 1 should feel complete, not restricted.** The user should think "this app does exactly what I need" not "why is half the app missing?"
- **Each unlock should feel like discovering a room in a house you already love.** Not "finally getting access to what was withheld."
- **The progression should match the user's emotional journey:** curious (Level 1) → engaged (Level 2) → invested (Level 3) → committed (Level 4).
- **Features that require context should wait for context.** A tax dashboard means nothing until you've donated enough for it to matter. A crisis response feature is confusing if you've never donated.
