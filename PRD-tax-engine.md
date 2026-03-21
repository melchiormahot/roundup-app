# RoundUp: Multi-Country Tax Engine PRD

## Context
The app currently supports France only. This PRD extends the tax engine to support UK, Germany, Belgium, and Spain, with a pluggable architecture that makes adding future countries straightforward. The tax dashboard, onboarding, PDFs, and all calculations must adapt to the user's jurisdiction.

---

## Task List

### Tax Rules Data Layer
- [ ] Seed jurisdiction_tax_rules table with rules for all 5 countries (see rules below)
- [ ] Each jurisdiction rule set includes: standard_rate, enhanced_rate (if applicable), enhanced_ceiling, income_cap_percentage, carry_forward_years, receipt_format, currency, currency_symbol
- [ ] Create a `/src/lib/tax-engine.ts` module that exports functions: `calculateDeduction(amount, charityType, jurisdiction)`, `getCeiling(jurisdiction, incomeBracket)`, `getProjection(currentDonations, monthsRemaining, jurisdiction)`, `formatReceipt(jurisdiction)`

### Country: United Kingdom
- [ ] Gift Aid: charity reclaims 25% from HMRC on top of donation (basic rate taxpayer). Higher rate taxpayers can claim additional 25% on self-assessment.
- [ ] No annual ceiling on Gift Aid donations
- [ ] Higher rate relief: taxpayers in 40% band claim back 20% of gross donation, 45% band claim back 25%
- [ ] Income brackets for UK: Under £25,000 (basic 20%), £25,000 to £50,270 (basic 20%), £50,271 to £125,140 (higher 40%), £125,141+ (additional 45%)
- [ ] Gift Aid declaration: simple checkbox "I am a UK taxpayer" (simulate in onboarding)
- [ ] Currency: GBP (£)
- [ ] Receipt format: "Gift Aid receipt" with charity registration number

### Country: Germany
- [ ] Sonderausgaben (special expenses): donations deductible up to 20% of gross income or 4‰ of total revenue + salaries
- [ ] Standard deduction rate: effective ~42% for middle incomes (Einkommensteuer marginal rate)
- [ ] No enhanced rate tier like France
- [ ] Income brackets for Germany: Under €30,000 (marginal ~30%), €30,000 to €60,000 (~42%), €60,000 to €100,000 (~42%), €100,000+ (~45%)
- [ ] Zuwendungsbestätigung: official donation receipt required from charity
- [ ] Currency: EUR (€)
- [ ] Receipt format: "Zuwendungsbestätigung" (donation confirmation)

### Country: Belgium
- [ ] Tax reduction of 45% on donations over €40 per year per institution
- [ ] Maximum deductible: 10% of net taxable income or €397,850 (whichever is lower)
- [ ] Only donations to recognised institutions ("institutions agréées") qualify
- [ ] Income brackets for Belgium: Under €30,000 (~25%), €30,000 to €60,000 (~40%), €60,000 to €100,000 (~45%), €100,000+ (~50%)
- [ ] Attestation fiscale: charity issues annual tax certificate
- [ ] Currency: EUR (€)
- [ ] Receipt format: "Attestation fiscale 281.71"

### Country: Spain
- [ ] First €250 of donations: 80% deduction
- [ ] Donations above €250: 40% deduction (45% if same charity for 3+ years)
- [ ] Maximum: 10% of taxable income ("base liquidable")
- [ ] Income brackets for Spain: Under €20,000 (~19%), €20,000 to €35,000 (~24%), €35,000 to €60,000 (~30%), €60,000+ (~37% to 47%)
- [ ] Certificado de donación: charity issues donation certificate
- [ ] Currency: EUR (€)
- [ ] Receipt format: "Certificado de donación"

### Tax Calculation Engine
- [ ] Refactor tax calculations to be jurisdiction-aware: all functions take a jurisdiction parameter
- [ ] Handle multi-tier deductions (Spain's 80%/40% split, France's 75%/66% split, UK's Gift Aid + higher rate relief)
- [ ] Handle currency differences (UK in GBP, others in EUR)
- [ ] Income bracket labels and ranges must change per jurisdiction
- [ ] The "enhanced rate" concept maps differently per country: France = Loi Coluche, UK = higher rate relief, Spain = first €250 tier, Germany = none, Belgium = flat 45%
- [ ] Calculate effective cost of donation per jurisdiction: "A €10 donation costs you €X after tax"

### Onboarding Updates
- [ ] When user selects jurisdiction, income bracket options should update to match that country's brackets, labels, and currency
- [ ] Tax preview ("aha" moment) should show jurisdiction-specific numbers and terminology
- [ ] For UK: show Gift Aid calculation ("You donate £100, the charity gets £125, and you claim back £25")
- [ ] For Spain: show the two-tier benefit ("First €250 at 80%, the rest at 40%")
- [ ] For Germany: show the marginal rate approach ("Your €500 donation reduces your tax by ~€210")
- [ ] For Belgium: show the 45% flat rate ("Every €100 you donate saves you €45")

### Tax Dashboard Updates
- [ ] Tax dashboard should display country-specific terminology:
  - France: "Loi Coluche (75%)" and "Standard (66%)"
  - UK: "Gift Aid (25% reclaimed)" and "Higher Rate Relief (20% or 25%)"
  - Germany: "Sonderausgaben (marginal rate deduction)"
  - Belgium: "Réduction d'impôt (45%)"
  - Spain: "Deducción por donativos (80%/40%)"
- [ ] Progress bars and ceiling trackers adapt to each country's rules
- [ ] Year-end projection uses country-specific formulas
- [ ] Tax package section shows country-specific receipt names

### PDF Generation Updates
- [ ] PDF templates adapt to jurisdiction:
  - France: Cerfa 11580 layout
  - UK: Gift Aid receipt with HMRC-compatible format
  - Germany: Zuwendungsbestätigung format
  - Belgium: Attestation fiscale 281.71 format
  - Spain: Certificado de donación format
- [ ] Currency symbols and formatting match jurisdiction (£ for UK, € for others)
- [ ] Each PDF includes a country-specific header explaining the tax benefit in one sentence

### Charity Eligibility Per Country
- [ ] Not all charities are tax-deductible in all countries. Add a `jurisdictions_eligible` field to each charity.
- [ ] For the MVP: all 6 charities are eligible in France. MSF, WWF, and Amnesty are international and eligible in all 5 countries. Restos du Coeur, Ligue contre le cancer, and Secours Populaire are France-only.
- [ ] When a user in the UK views charities, only show charities eligible in their jurisdiction
- [ ] On the charity detail page, if a charity is not eligible in the user's country, show a note: "This charity is not tax-deductible in [country]. You can still donate, but you won't receive a tax benefit."

---

## Iteration Rounds

### Iteration 1: Calculation Verification
- [ ] For each country, create 3 test scenarios (low, mid, high income) and verify the tax calculation manually matches the expected result
- [ ] France: €500 to MSF (75%) + €300 to WWF (66%) for a €30-60k earner. Expected: €375 + €198 = €573 saved.
- [ ] UK: £400 to MSF, higher rate taxpayer. Expected: Gift Aid adds £100, taxpayer claims back £100. Total benefit: £200.
- [ ] Germany: €800 donation, €50k income, 42% marginal rate. Expected: ~€336 saved.
- [ ] Belgium: €600 to MSF (over €40 threshold). Expected: €600 × 45% = €270 saved.
- [ ] Spain: €400 to MSF. Expected: €250 × 80% + €150 × 40% = €200 + €60 = €260 saved.
- [ ] Fix any calculation errors found

### Iteration 2: UI Consistency
- [ ] Switch jurisdiction in settings and verify every screen updates correctly: dashboard numbers, tax labels, currency symbols, progress bars, projections
- [ ] Verify onboarding flows correctly for all 5 countries
- [ ] Verify PDF downloads work for all 5 countries
- [ ] Check that charity filtering works when switching from France (6 charities) to UK (3 charities)
- [ ] Ensure no hardcoded "€" symbols or "France" references remain outside the jurisdiction system

### Iteration 3: Edge Cases
- [ ] What happens when a UK user has no charities available in their jurisdiction? (Shouldn't happen with our 6, but handle gracefully)
- [ ] What happens when a user changes jurisdiction mid-year? Should existing donations recalculate? (For MVP: show a warning "Changing jurisdiction will recalculate your tax projections. Your donation history remains unchanged.")
- [ ] Handle currency conversion display: if a French user donated €247, and switches to UK, show "€247 (approximately £212)" or simply reset
- [ ] Spain's 3-year loyalty bonus (45% instead of 40%): for MVP, ignore this and use the base 40% rate. Add a note explaining it.
- [ ] Verify carry-forward logic for France (5 years) is mentioned in the tax dashboard but doesn't need full implementation for MVP

### Iteration 4: Final Review
- [ ] Create a user in each jurisdiction, run through onboarding, simulate transactions, check tax dashboard, download PDF
- [ ] All 5 countries should produce a coherent, accurate experience
- [ ] No English/French language mixing in jurisdiction-specific labels
- [ ] Commit with message "Multi-country tax engine complete"
