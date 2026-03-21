# RoundUp: Behavioral Design Audit PRD

## Context
Based on a comprehensive research report on the psychology of giving, micro-donation behavior, and fintech retention (`RESEARCH_Psychology_of_Giving.md`), this PRD audits every screen of the app against behavioral science principles and prescribes specific changes to reduce drop-off, increase engagement, and make giving feel rewarding.

**The core insight:** Round-ups bypass the "pain of paying" because spare change is mentally categorized as "already spent." The warm glow (the feeling of having done good) is the actual product. Every screen must deliver or reinforce it.

---

## Task List

### Critical: Reframe Tax Benefits as Secondary
- [x] On the dashboard, move the tax ceiling progress card BELOW the impact card and weekly summary. Tax is important but should not be the first thing users see.
- [x] Rename the bottom nav tab from "Tax" to "Savings" or "Tax Benefit" (less clinical)
- [x] On the onboarding "aha" moment step, reframe: instead of leading with "You could get €1,320 back in tax credits", lead with "Your spare change could fund 165 emergency meals this year" and show the tax benefit as a secondary line: "Plus, you'll save €1,320 on your taxes"
- [x] On the landing page tax calculator, add impact context below the tax result: "That €3.40 you actually pay provides 4 emergency meals through Restos du Coeur"
- [x] In notifications, always lead with impact, follow with tax: "Your €34 this month helped fund 4 medical kits (and saved you €22 in taxes)" not the reverse
- [x] Research shows extrinsic motivators (tax) can crowd out intrinsic motivation (warm glow). Tax is the practical hook that keeps accountant-minded users; impact is the emotional hook that keeps everyone.

### Critical: First 48 Hours Experience
- [x] After onboarding completion, immediately show a simulated first round-up within the app: "Your first purchase will trigger your first round-up. Here's what it looks like..." with an animated demo
- [x] Within 24 hours of signup (simulated for MVP), deliver the first notification: "Welcome to RoundUp! Your spare change is now working for [charity name]."
- [x] Within 48 hours, deliver the first impact notification: "Your first €0.70 helped fund a dose of oral rehydration salts through MSF." This is the warm glow moment. It must happen before curiosity fades.
- [x] Add a "first week journey" tracker visible on the dashboard for the first 7 days: Day 1 (signed up), Day 2 (first round-up), Day 3 (first impact), Day 5 (charity update), Day 7 (first weekly summary). Each milestone lights up as it's reached.
- [x] The first weekly summary should be the most emotionally compelling notification in the app: personalized, impact-focused, celebratory

### Critical: Warm Glow Delivery System
- [x] After every simulated day/week of round-ups, show a "warm glow" moment: a brief, beautiful animation + impact statement. Not a toast notification, a full-screen overlay that appears for 3 seconds then fades. "Today, your spare change provided 2 meals."
- [x] The warm glow moment should use the charity's brand colour as a background accent
- [x] Vary the format: sometimes a number ("3 meals"), sometimes a story snippet ("Amara in Senegal received clean water today thanks to donors like you"), sometimes a simple thank you ("You're making a difference. Really.")
- [x] Frequency: once per simulated day maximum. More than that becomes noise.
- [x] Add a "Your Impact" section to the dashboard that's always visible: a rotating card showing one tangible outcome tied to the user's actual donation amount

### High: Language and Framing Overhaul
- [x] Audit ALL copy in the app for "pain of paying" language. Replace any words that frame round-ups as costs, deductions, or withdrawals:
  - Replace "debited" with "contributed"
  - Replace "charged" with "rounded up"
  - Replace "payment" with "contribution"
  - Replace "Your donations this week" with "Your spare change this week"
  - Replace "Next debit: Monday" with "Next round-up batch: Monday"
  - Replace "Total donated" with "Total impact" or "Your giving total"
- [x] The SEPA debit in the weekly summary should not say "€8.40 debited from your account." Instead: "€8.40 of spare change went to 3 charities this week."
- [x] Never show round-ups as a line item withdrawal. Frame them as rounding, completion, tidying up.
- [x] In the notification for weekly batches, lead with what the money did, not that it was taken: "This week, your €8.40 funded 12 meals and protected 2 hectares of forest" not "€8.40 was debited from your account"

### High: Goal Gradient and Progress Psychology
- [x] Replace the linear progress bar for tax ceiling with a curved/circular progress indicator. Research shows circular progress feels more motivating because it visualizes completion as a journey.
- [x] Never show a progress bar at 0%. Pre-seed it at the first round-up or hide it until at least one donation is made. Starting from zero is demotivating.
- [x] Add micro-milestones that feel achievable: €10, €25, €50, €100, €250, €500, €1,000, €1,500, €2,000. Current milestones skip too many small wins.
- [x] When a user is within 20% of a milestone, show an accelerator message: "Just €12 more to reach €100. That's about 3 days of spare change."
- [x] Add a "next milestone" indicator always visible on the dashboard: "Next milestone: €100 (€12 away)"
- [x] When a milestone is reached, show a full celebration moment (confetti, sound effect if haptics enabled, shareable card). This is NOT a toast notification. It's a moment.

### High: Social Proof Integration
- [x] Add contextual social proof that feels organic, not manufactured:
  - Dashboard: "1,247 people donated through RoundUp today" (simulated, updates daily)
  - Charity detail: "428 RoundUp users support this charity" (simulated per charity)
  - Milestone: "You're in the top 15% of RoundUp givers this month"
  - Onboarding: "Join 12,400 people who give without thinking about it"
- [x] Social proof should use real-feeling numbers (not round numbers: 1,247 not 1,200)
- [x] Update the simulated numbers daily (increment by a random 5-15 per day) so they feel alive
- [x] For charity selection during onboarding: show "Most popular" badge on the top 3 charities. Research shows people follow the crowd when uncertain.

### High: Identifiable Victim Stories
- [x] Add a "Stories" section to each charity profile: 1 to 2 short stories (3 sentences each) about a specific individual helped by that charity
  - MSF: "Amara, 9, was treated for severe malaria at an MSF clinic in South Sudan. She received medication within 2 hours of arriving. Today she's back in school."
  - Restos: "Jean-Pierre, 62, lost his job and his apartment. At the Restos du Coeur centre in Lyon, he gets a hot meal every day and help with his housing application."
  - WWF: "In the Cévennes, a family of griffon vultures returned to a cliff face that had been empty for decades, thanks to a WWF habitat restoration project."
- [x] Feature one story on the dashboard impact card (rotating)
- [x] Stories should be plausible and respectful, not exploitative. Warm, not pitying.
- [x] Use first names only, never full names or photos (for MVP, these are illustrative, not real individuals)

### Medium: Streak Redesign (Consistency, Not Pressure)
- [x] Replace any "streak" counter with "consistency recognition":
  - Instead of "47-day streak" show "Giving since October 2025"
  - Instead of "streak broken!" show nothing (never punish for not spending)
  - Show "23 round-ups this month" as an activity counter, not a streak
- [x] Add time-based milestones: "1 month of giving", "3 months", "6 months", "1 year" with a badge that permanently appears on the user's profile
- [x] The language should always be "you've been making a difference for X months" not "don't break your streak"
- [x] If a user has no transactions for 2+ weeks (they're on holiday, etc.), DO NOT send a "you've been inactive" notification. Instead, when they return, say "Welcome back! Your round-ups resume automatically."

### Medium: Notification Cadence Optimization
- [x] Implement the research-recommended cadence:
  - Weekly impact summary: every Monday morning (push + in-app)
  - Milestone achievement: event-triggered, immediate (push)
  - Charity story/update: bi-weekly, Wednesday afternoon (in-app only)
  - Monthly impact report: 1st of month (email-style, in-app)
  - Re-engagement: after 14 days of no activity (push + in-app, gentle: "Your charities miss you" not "You haven't donated")
- [x] Maximum 3 to 5 notifications per week across all types
- [x] Implement a "quiet hours" setting (default: 10pm to 8am, no notifications)
- [x] Add a "notification cooldown": if a push was sent in the last 4 hours, queue the next one
- [x] Track notification engagement in the database: opened, dismissed, acted on. Feed into admin analytics.

### Medium: Cancellation Experience
- [x] If a user tries to pause or cancel round-ups, show a farewell impact summary (not friction):
  - "In 8 months with RoundUp, your spare change funded 124 meals, protected 18 hectares of forest, and saved you €412 in taxes."
  - Option 1: "Pause for a month" (not cancel, reduce commitment)
  - Option 2: "Reduce to minimum" (lower the round-up multiplier to 0.5x)
  - Option 3: "Cancel round-ups" (clean, immediate, no guilt)
- [x] After cancellation, send one final email: "Your impact with RoundUp" with a beautiful summary. No "we miss you" follow-ups.
- [x] If a user pauses, after 30 days send one gentle notification: "Your pause ends today. Resume giving?" with one-tap resume.
- [x] Make cancellation easy: Settings > one tap > done. Research shows cancellation friction erodes trust even when it reduces short-term churn.

### Medium: Onboarding Streamlining
- [x] Research says fintech onboarding abandonment is 68%, and each additional screen costs ~10% of users. Evaluate whether our 7-step flow can be shortened:
  - Steps that can merge: jurisdiction + income could auto-detect or be one screen (already done in design polish)
  - Steps that can defer: SEPA mandate signing could happen AFTER the first week ("try it free, then connect your payment")
  - Steps that should stay: charity selection is emotionally engaging and should remain
- [x] Add progress indication: "Step 3 of 5" (not dots alone, use numbers)
- [x] Each step should take under 10 seconds. If a step requires more than 2 taps, it's too complex.
- [x] Add "Skip for now" on non-essential steps (bank connection, SEPA). Let users explore the app with simulated data before committing to real connections.

### Low: Mental Accounting Reinforcement
- [x] Add a "Spare Change" label to the weekly contribution card. This frames the money as change, not a donation.
- [x] Show the round-up amount relative to the purchase: "Coffee €4.30 → €0.70 spare change" reinforces that the 70 cents was part of the coffee, not a separate cost
- [x] In the year-end summary, show the comparison: "Your total donations: €247. That's the equivalent of 2 coffees per week." This reframes €247 (which sounds like a lot) as "basically nothing."
- [x] Never show a single large number without context. €247 alone triggers loss aversion. "€247, or about 68 cents per day" does not.

### Low: European Cultural Adaptations
- [x] France: emphasize community and solidarity ("ensemble") in copy. French donors respond to collective identity. Show the Coluche story prominently.
- [x] UK: emphasize personal choice and independence ("your choice, your charities"). British donors value autonomy. Highlight Gift Aid as "the government matches your giving."
- [x] Germany: emphasize planning and reliability ("zuverlässig"). German donors prefer structured, planned giving. Show the consistency counter prominently.
- [x] Spain: emphasize community and local impact ("tu comunidad"). Only 19% donor participation means huge growth opportunity. Use social proof heavily ("join the movement").
- [x] These adaptations should be subtle (different notification copy per jurisdiction, not different UI layouts)

---

## Iteration Rounds

### Iteration 1: Warm Glow Audit
- [x] Walk through the entire app from signup to year-end. At which moments do you feel "I did something good"? List them.
- [x] There should be a warm glow moment at: first round-up, first weekly summary, first milestone, first charity update, first month, reaching a tax milestone, downloading the year-end PDF.
- [x] If any of these moments feel clinical, transactional, or absent, fix them.
- [x] The warm glow moment after the first round-up is the single most important screen in the app. It must be beautiful.

### Iteration 2: Pain of Paying Audit
- [x] Search the entire codebase for words: "debit", "charge", "payment", "withdraw", "cost", "fee", "deduction" in user-facing copy
- [x] Replace each instance with warmer alternatives (see language overhaul section)
- [x] Check that no screen makes the user feel like they're losing money
- [x] The weekly batch summary should feel like a celebration, not a bank statement

### Iteration 3: Drop-Off Prevention
- [x] Simulate a user who signs up but doesn't come back for 7 days. What do they see? What notifications do they get?
- [x] Simulate a user who's been active for 3 months. What keeps them engaged? Is it fresh?
- [x] Simulate a user who hasn't transacted in 2 weeks (holiday). Does the app handle this gracefully?
- [x] Simulate a user who wants to cancel. Is the experience respectful?
- [x] Each scenario should feel intentionally designed, not an afterthought

### Iteration 4: Data and Metrics
- [x] Track warm glow moments shown per user (in database)
- [x] Track milestone celebrations per user
- [x] Track notification open rates by type
- [x] Track onboarding step completion rates (for the funnel)
- [x] Track cancellation/pause rate and reason (add optional "Why are you leaving?" single select: too expensive, not using, privacy, other)
- [x] All of these should appear in the admin analytics dashboard

### Iteration 5: Final Behavioral Review
- [x] Walk through the app one more time as a first-time user. Does every screen earn the right to exist? Does every screen make you feel good?
- [x] Walk through as a 6-month user. Is there enough variety to stay engaged? Are the notifications fresh or repetitive?
- [x] Walk through as a user about to cancel. Is the experience respectful and does it attempt to re-engage without manipulation?
- [x] Verify the first 48 hours experience is flawless: signup, first notification, first impact, first warm glow
- [x] Commit with message "Behavioral design audit complete: warm glow, pain reduction, retention optimization"

---

## Research Reference
Full research report: `RESEARCH_Psychology_of_Giving.md`

Key academic sources:
- Andreoni (1990): Warm glow and impure altruism
- Kahneman & Tversky (1979): Prospect theory and loss aversion
- Thaler (1985): Mental accounting
- Small, Loewenstein & Slovic (2007): Identifiable victim effect
- Hull (1932): Goal gradient hypothesis
- St. Louis Zoo field study (NPR, 2024): Round-ups increase donations 21%
- AFP Fundraising Effectiveness Project: 69-72% first-time donor attrition
- RoundUp App data: 80% retention rate vs 24% industry average
