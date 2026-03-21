# RoundUp: Simulation Engine PRD

## Context
The base app is built with static seed data. This PRD adds a simulation layer that makes the app feel alive for demos and user testing. No real bank connection yet; instead, we simulate realistic spending patterns, round-ups, debits, and notifications that evolve over time.

---

## Task List

### Simulation Controls (accessible from Settings page)
- [ ] Add "Demo Mode" section in Settings with a toggle to enable simulation
- [ ] Add "Simulate a Day" button: generates 3 to 8 random transactions for one day, creates round-ups, updates totals
- [ ] Add "Simulate a Week" button: runs 7 days of simulation at once, triggers a weekly summary notification, creates a SEPA debit batch
- [ ] Add "Simulate a Month" button: runs 4 weeks, triggers monthly progress notification, adds milestone notification if threshold crossed
- [ ] Add "Reset Data" button: clears all simulated transactions, resets totals to zero, keeps charities and user settings
- [ ] Show simulation status: "Day 47 of simulated usage" counter

### Realistic Transaction Generator
- [ ] Create a transaction generator that produces realistic French spending patterns
- [ ] Transaction categories with typical amounts: Coffee (€2.50 to €5.50), Boulangerie (€1.20 to €8.00), Supermarket (€12.00 to €85.00), Metro/Bus (€1.90 to €4.00), Restaurant (€14.00 to €45.00), Online shopping (€8.00 to €120.00), Pharmacy (€3.00 to €35.00), Bar/Drinks (€4.00 to €18.00)
- [ ] Each transaction gets: category, merchant name (randomised from a list per category), amount (randomised within range), timestamp (spread across the day between 7am and 11pm)
- [ ] Round-up calculation: transaction amount rounded up to next euro, difference is the round-up
- [ ] Weekdays generate 4 to 8 transactions, weekends generate 2 to 5
- [ ] Merchant name lists per category: Coffee (Starbucks, Paul, Coutume, Café de Flore, Columbus), Boulangerie (Maison Kayser, Eric Kayser, Poilâne, Du Pain et des Idées), Supermarket (Monoprix, Carrefour City, Franprix, Picard), Metro (RATP, Navigo), Restaurant (Le Bouillon Chartier, Big Mamma, Chez Janou, Pizza Pino), Online (Amazon, Fnac, Zalando, Vinted), Pharmacy (Pharmacie Monge, Citypharma), Bar (Le Perchoir, Experimental Cocktail Club, Rosa Bonheur)

### Automatic Round-Up Processing
- [ ] When a simulated day completes, calculate round-ups for each transaction
- [ ] Allocate round-ups across user's selected charities based on their percentage split
- [ ] Update the running totals: YTD donated, per-charity amounts, tax savings
- [ ] Recalculate tax ceiling progress (75% and 66% rates based on charity eligibility)

### Weekly SEPA Debit Simulation
- [ ] After every 7 simulated days, create a debit batch record
- [ ] Debit batch contains: total amount, period dates, round-up count, status "charged"
- [ ] Create allocation records splitting the debit across charities
- [ ] Generate a weekly summary notification: "This week: €X donated across N purchases"

### Monthly Milestones
- [ ] After every 30 simulated days, generate monthly progress notification
- [ ] Check if user crossed any milestone thresholds (€100, €250, €500, €1000, €1500, €2000)
- [ ] If milestone crossed, generate milestone notification with shareable message
- [ ] Check if user is approaching tax ceiling (within €200) and generate a ceiling proximity notification
- [ ] Update year-end projection based on actual average spending rate

### Dashboard Real-Time Updates
- [ ] After simulation, dashboard should refresh and show updated numbers
- [ ] Animated number transitions when totals change (count up from old value to new)
- [ ] Progress bars should animate to new positions
- [ ] New transactions should appear in the expandable weekly list
- [ ] Impact card should update with new concrete outcome statements based on new totals
- [ ] Giving streak counter should increment if applicable

### Crisis Event Simulation
- [ ] Add "Trigger Crisis Event" button in Demo Mode settings
- [ ] When triggered: creates a crisis notification, shows crisis banner on dashboard
- [ ] User can redirect round-ups to crisis cause
- [ ] After redirect period ends (simulated), automatically reverts to normal allocation
- [ ] Crisis events use real-world templates: earthquake, flood, refugee emergency, famine response

### Notification Engine
- [ ] Weekly summary notification generated after each simulated week
- [ ] Monthly progress notification generated after each simulated month
- [ ] Milestone notifications at threshold crossings
- [ ] Tax ceiling proximity notification when within €200
- [ ] Charity impact update notifications (random, every 2 to 3 simulated weeks): pull from charity impact data
- [ ] All notifications marked as unread, updating the inbox badge count

### Year-End PDF with Simulated Data
- [ ] When simulated data reaches December (or user triggers "Jump to Year End"), generate real PDFs
- [ ] PDF 1: Annual summary with actual simulated totals per charity, month-by-month breakdown
- [ ] PDF 2: Tax calculation with real numbers from the simulation
- [ ] Download buttons should become active and functional
- [ ] "Jump to Year End" button in Demo Mode: fast-forwards simulation to December 31, generating all intermediate data

---

## Iteration Rounds

After building all features above, run these refinement passes:

### Iteration 1: Visual Polish of Simulation UI
- [ ] The Demo Mode section in Settings should feel like a "control panel" with clear visual separation from regular settings
- [ ] Simulation buttons should have distinct colours: Day (blue), Week (green), Month (purple), Reset (red outline), Jump to Year End (gold)
- [ ] Add a simulation timeline visualization: a horizontal bar showing where the user is in the simulated year (Jan to Dec) with current position marker
- [ ] Each simulation button should show a brief animated summary after running: "Generated 6 transactions, €4.20 in round-ups, €2.52 to MSF, €1.47 to WWF, €0.21 to Ligue"
- [ ] The "Reset Data" button should have a confirmation dialog: "This will clear all simulated data. Are you sure?"

### Iteration 2: Transaction Realism
- [ ] Add spending pattern variation: some weeks the user "goes out more" (more restaurants, bars), some weeks are quieter
- [ ] Add occasional larger purchases: €200+ online shopping, €150 train tickets (once every 2 to 3 simulated weeks)
- [ ] Add recurring transactions: same coffee shop every weekday morning, weekly supermarket run on Saturday
- [ ] Ensure no two consecutive days have identical transaction counts or similar totals
- [ ] Add time-of-day realism: coffee at 7 to 9am, lunch at 12 to 2pm, supermarket at 5 to 7pm, restaurant at 7 to 10pm, bar at 9pm to midnight

### Iteration 3: Dashboard Intelligence
- [ ] After simulation, the delta indicator should update: "+€4.20 today" or "+€28.40 this week"
- [ ] The sparkline/bar chart should reflect actual simulated daily data, not static
- [ ] Impact card should rotate through charity-specific outcomes based on actual amounts donated to each
- [ ] If a user has been simulating for 4+ weeks, show a trend line: "Your giving is trending up 12% vs last month"
- [ ] The year-end projection should recalculate based on the user's actual average, not a fixed formula

### Iteration 4: Edge Cases and Error Handling
- [ ] Handle simulation when user has no charities selected: show toast "Select at least one charity before simulating"
- [ ] Handle simulation when allocation percentages don't add to 100%: normalize them automatically
- [ ] Handle "Jump to Year End" gracefully: show a progress bar since it generates hundreds of transactions
- [ ] If user resets data mid-year, the tax dashboard should reset correctly (all progress bars to 0, all amounts to €0)
- [ ] Test all notification types render correctly in the inbox after simulation
- [ ] Verify PDF generation works with edge case amounts (€0.01 round-ups, €0.99 round-ups, exactly €0 round-up)

### Iteration 5: Seasonal Spending Patterns
- [ ] Add monthly spending modifiers that affect transaction volume and amounts:
  - January: 70% of normal (post-holiday belt tightening, "la rentrée" effect)
  - February: 80% of normal (quiet month)
  - March to May: 100% baseline
  - June: 110% (pre-summer shopping, travel bookings)
  - July: 130% (holiday spending: restaurants, activities, travel. Add beach bar, ice cream, museum categories)
  - August: 120% (still holiday, but winding down)
  - September: 115% ("la rentrée" shopping: school supplies, new clothes, home items)
  - October to November: 100% baseline
  - December: 150% (Christmas shopping spike: gifts, Christmas markets, festive dining. Add "Marché de Noël", "Galeries Lafayette", "FNAC Gifts" merchants)
- [ ] Add seasonal merchant names: summer gets "Plage Bar", "Glacier", "Musée d'Orsay". December gets "Marché de Noël", "Bûche de Noël bakery"
- [ ] The year-end projection should account for seasonal patterns, not assume flat spending

### Iteration 6: Multi-User Demo Profiles
- [ ] Add "Demo Profiles" section in Demo Mode with 3 pre-built user personas:
  - **Sophie, 24, Student (Paris)**: low income bracket (under €30k), 2 charities selected (MSF + WWF), mostly coffee and metro transactions, €8 to €15 per week in round-ups
  - **Thomas, 35, Engineer (Lyon)**: mid income bracket (€60-100k), 4 charities selected, more restaurants and online shopping, €20 to €35 per week in round-ups
  - **Marie, 52, Executive (Bordeaux)**: high income bracket (€100k+), 3 charities selected, frequent dining and travel, €30 to €50 per week in round-ups, approaching tax ceiling by October
- [ ] "Load Profile" button that sets up the user's settings, charities, and spending pattern to match the persona
- [ ] Each profile pre-simulates a different number of months: Sophie (2 months), Thomas (6 months), Marie (10 months, near ceiling)
- [ ] This lets you demo three different user journeys without manual setup

### Iteration 7: Notification Copy Variants
- [ ] Create 3 copy variants for each notification type:
  - **Weekly summary**: Variant A (factual: "14 round-ups, €9.20 donated"), Variant B (warm: "You helped 3 organisations this week with €9.20 of effortless generosity"), Variant C (motivational: "Another week of making a difference. €9.20 closer to your goal.")
  - **Monthly progress**: Variant A (data focused: "March: €34.20 donated. Tax saving: €22.57"), Variant B (impact focused: "In March, your €34.20 funded 4 medical kits and planted 12 trees"), Variant C (comparison: "You donated 18% more than last month. Your generosity is growing.")
  - **Milestone**: Variant A (celebration: "€500 donated! You're making a real difference."), Variant B (context: "€500 donated. That's 62 emergency meals through Restos du Coeur."), Variant C (forward: "€500 down, €1,500 to go before maxing your tax benefit.")
  - **Crisis**: Variant A (urgent: "Earthquake in Morocco. Redirect your round-ups now."), Variant B (empathetic: "Morocco needs help. One tap redirects your giving for 7 days."), Variant C (social: "2,400 RoundUp users have already redirected. Join them?")
- [ ] Add a "Notification Style" toggle in Demo Mode: Factual / Warm / Motivational
- [ ] This helps test which copy resonates before going live

### Iteration 8: Final Review
- [ ] Run the full simulation flow: sign up, onboard, simulate 6 months of data, check every screen
- [ ] Verify all numbers are consistent: dashboard totals match sum of all round-ups, tax calculations match allocations, PDF numbers match dashboard
- [ ] Verify animations still work smoothly with real data volumes (200+ transactions)
- [ ] Check mobile responsiveness of all simulation UI at 375px
- [ ] Run the dev server, click through every screen, fix anything that looks off
- [ ] Test all three demo profiles end-to-end: load profile, check dashboard, check tax, check notifications
- [ ] Test seasonal spending: simulate a full year, verify December is visibly higher than January
- [ ] Test all three notification copy variants render correctly
- [ ] Commit final state with message "Simulation engine complete with all iterations"

---

## Technical Notes
- All simulation logic should be in a dedicated `/src/lib/simulation.ts` module
- Simulation state (current simulated date, day counter) stored in the database
- Transactions are created with past timestamps, not real-time. The simulated date advances, not the actual clock.
- Randomisation should use a seeded random number generator so demos are reproducible if needed
- The simulation buttons should show a brief loading state while processing (skeleton or spinner)
- Each simulation action should be wrapped in a database transaction for consistency
