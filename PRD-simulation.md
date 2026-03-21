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

## Technical Notes
- All simulation logic should be in a dedicated `/src/lib/simulation.ts` module
- Simulation state (current simulated date, day counter) stored in the database
- Transactions are created with past timestamps, not real-time. The simulated date advances, not the actual clock.
- Randomisation should use a seeded random number generator so demos are reproducible if needed
- The simulation buttons should show a brief loading state while processing (skeleton or spinner)
- Each simulation action should be wrapped in a database transaction for consistency
