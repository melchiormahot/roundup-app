# RoundUp: Charity Expansion PRD (6 → 23 Charities)

## Context
The app currently has 6 charities. This PRD expands to 23 (existing 6 + 17 new), covering all major categories across Europe, UK, US, and internationally. Each charity must have real researched content, cross-border tax eligibility data, and rich profiles. The expansion also adds new categories, improves the charity browser, and builds the infrastructure to handle a larger catalogue.

**Full research report:** `../RoundUp App/00-Research/Charity_Expansion_Research.md`

---

## New Charities to Add (17)

### European (5)
1. **Deutsche Krebshilfe** (Germany): Cancer research, founded 1974, ~91% to programs, no pharma funding
2. **SOS Children's Villages** (Austria): Children's care in 138 countries, founded 1949, DZI certified
3. **Terre des Hommes** (Switzerland): Children's rights, founded 1960, ZEWO certified
4. **Greenpeace International** (Netherlands): Environmental campaigns, founded 1971, zero corporate funding
5. **Handicap International** (France): Disability, founded 1982, Nobel Peace Prize co-laureate, IDEAS label

### International (3)
6. **UNICEF** (International): Children's fund, founded 1946, Nobel Peace Prize, 190+ countries
7. **Red Cross / ICRC** (Switzerland): Humanitarian, founded 1863, 3 Nobel Peace Prizes, Geneva Conventions mandate
8. **Save the Children** (UK): Children, founded 1919, 120+ countries, 84% to programs

### UK (3)
9. **Cancer Research UK**: World's largest independent cancer research charity, £735M income
10. **Macmillan Cancer Support**: Patient-focused cancer support, 10,881 Macmillan nurses
11. **British Heart Foundation**: Largest cardiovascular research funder outside US government

### US (2)
12. **St. Jude Children's Research Hospital**: "Families never receive a bill", most trusted US nonprofit
13. **Direct Relief**: 100% of donor cash to programs (endowment covers overhead), Forbes #5

### French (4)
14. **Action contre la Faim**: Hunger, Don en Confiance since 1989, 75% Loi Coluche eligible
15. **Médecins du Monde**: Healthcare for excluded populations, complements MSF, 75% Loi Coluche
16. **Fondation pour la Recherche Médicale**: France's leading independent medical research funder
17. **Croix-Rouge française**: France's largest humanitarian charity, 97,000 volunteers, 75% Loi Coluche

---

## Task List

### Database Schema Updates
- [x] Add new fields to charity schema: `country_of_origin` (text), `founded_year` (int), `website_url` (text), `certifications` (jsonb: array of {name, year}), `financial_transparency` (jsonb: {programs_pct, admin_pct, fundraising_pct}), `jurisdictions_eligible` (jsonb: array of country codes where tax-deductible), `loi_coluche_eligible` (boolean), `cross_border_method` (text: 'national_entity' or 'tge' or 'none')
- [x] Add `howYourMoneyHelps` field if not already present: array of {amount, description}
- [x] Add `foundingStory` field if not already present: text
- [x] Add `milestones` field if not already present: array of {year, title, description}
- [x] Run migration, verify schema

### Seed All 17 New Charities
- [x] Deutsche Krebshilfe: mission, impact, founding story, "how your money helps" (€10 = 1 hour of cancer research, €50 = fund a clinical trial participant for a day, €200 = equip a research lab for a week), milestones, financial data, certifications
- [x] SOS Children's Villages: mission, impact, founding story, "how your money helps" (€5 = a day of care for one child, €30 = school supplies for a child for a year, €100 = support a family for a month), milestones, financial data, DZI certification
- [x] Terre des Hommes: mission, impact, founding story, "how your money helps" (€3 = protect one child from exploitation for a day, €20 = legal aid for a migrant child, €75 = enroll a child in school for a year), milestones, ZEWO certification
- [x] Greenpeace International: mission, impact, founding story, "how your money helps" (€5 = 1 day of ocean patrol, €25 = water sample analysis, €100 = one day of campaign action), milestones, financial data
- [x] Handicap International: mission, impact, founding story, "how your money helps" (€10 = a pair of crutches, €40 = a prosthetic component, €150 = rehabilitation for a landmine survivor), Nobel Peace Prize, IDEAS label
- [x] UNICEF: mission, impact, founding story, "how your money helps" (€1 = 5 doses of vaccine, €10 = school supplies for a child, €50 = therapeutic food for 35 malnourished children), Nobel Peace Prize, milestones
- [x] Red Cross / ICRC: mission, impact, founding story, "how your money helps" (€5 = emergency shelter blanket, €20 = a week of clean water for a family, €100 = emergency medical kit), 3 Nobel Prizes, milestones
- [x] Save the Children: mission, impact, founding story, "how your money helps" (€3 = a textbook for a child, €15 = emergency nutrition for a week, €50 = protect a child from trafficking for a month), milestones
- [x] Cancer Research UK: mission, impact, founding story, "how your money helps" (£5 = fund cancer research for 15 minutes, £25 = fund a day of a PhD student's work, £100 = fund a clinical trial participant), milestones, note on GBP currency
- [x] Macmillan Cancer Support: mission, impact, founding story, "how your money helps" (£10 = 30 minutes with a Macmillan nurse, £25 = financial guidance session, £50 = a day of end-of-life care), milestones
- [x] British Heart Foundation: mission, impact, founding story, "how your money helps" (£5 = fund heart research for 15 minutes, £20 = a defibrillator training session, £100 = fund a day of cardiovascular research), milestones
- [x] St. Jude: mission, impact, founding story, "how your money helps" ($10 = a day of housing for a patient family, $50 = lab supplies for childhood cancer research, $100 = a day of treatment for a child), "most trusted nonprofit" badge
- [x] Direct Relief: mission, impact, founding story, "how your money helps" ($1 = 3 defined daily doses of medicine, $25 = a medical supply kit, $100 = equip a clinic for a day), "100% to programs" badge
- [x] Action contre la Faim: mission, impact, founding story, "how your money helps" (€1 = 10 sachets of therapeutic food, €10 = treat one child for malnutrition for a week, €50 = provide clean water for 50 people for a month), Don en Confiance since 1989
- [x] Médecins du Monde: mission, impact, founding story, "how your money helps" (€5 = a medical consultation for a homeless person, €20 = a vaccination kit, €100 = run a mobile clinic for a day), Don en Confiance
- [x] Fondation pour la Recherche Médicale: mission, impact, founding story, "how your money helps" (€10 = 2 hours of medical research, €50 = a day of a researcher's grant, €200 = fund a PhD month), Don en Confiance
- [x] Croix-Rouge française: mission, impact, founding story, "how your money helps" (€2 = an emergency meal, €15 = a first aid kit, €50 = emergency shelter for a night), Don en Confiance renewed 2024

### New Categories
- [x] Expand category system to include: health, cancer_research, cancer_support, heart_disease, medical_research, environment, humanitarian, hunger, children, human_rights, disability
- [x] Update category filter pills on charities page to show all categories
- [x] Add category icons (not just text): heart for health, microscope for research, leaf for environment, hands for humanitarian, utensils for hunger, baby for children, scales for human rights, wheelchair for disability
- [x] Categories should be scrollable horizontally on mobile

### Charity Browser Improvements
- [x] With 23 charities, the browser needs better organisation:
  - Default view: "Recommended for you" showing charities eligible in the user's jurisdiction with the best tax rate first
  - "All charities" view below with category filters
- [x] Add a search bar at the top of the charities page (search by name or category)
- [x] Add jurisdiction filter: "Show charities tax-deductible in [my country]" toggle (on by default)
- [x] Charities not deductible in the user's country should appear greyed out with a note, not hidden entirely
- [x] Add a "Sort by" option: Popularity, Tax benefit, Category, Alphabetical
- [x] Each charity card should show: name, category, country flag, tax rate badge, deductibility status for user's jurisdiction

### Cross-Border Tax Eligibility Display
- [x] On each charity detail page, show a "Tax deductibility" section listing all 5 countries with status:
  - Green check: "Deductible in France (75%)" or "Deductible in UK (Gift Aid)"
  - Orange warning: "Deductible via TGE network (5% fee applies)"
  - Grey cross: "Not deductible in Spain"
- [x] If a charity is deductible via TGE, add a brief explainer: "Transnational Giving Europe enables tax-deductible donations across borders. A 5% service fee applies."
- [x] The user's own jurisdiction should be highlighted/bolded in the list
- [x] On the tax dashboard, only count donations to charities deductible in the user's jurisdiction toward their ceiling

### Currency Handling
- [x] UK charities (CRUK, Macmillan, BHF) should display amounts in GBP (£)
- [x] US charities (St. Jude, Direct Relief) should display amounts in USD ($)
- [x] French/European charities display in EUR (€)
- [x] "How your money helps" amounts should be in the charity's native currency
- [x] The user's donation amounts and tax calculations always display in their own jurisdiction's currency
- [x] Add a note on cross-currency donations: "Your donation is converted at the current exchange rate"

### Loi Coluche Indicator
- [x] Charities eligible for the 75% Loi Coluche rate should have a prominent gold badge: "75% tax deduction"
- [x] On the charities page, add a filter: "Show 75% Loi Coluche eligible" (for French users only)
- [x] When a French user selects a 75% charity, the tax preview should highlight: "This charity qualifies for the enhanced 75% rate under Loi Coluche"
- [x] Total Loi Coluche charities in expanded catalogue: MSF, Restos du Coeur, Secours Populaire, Handicap International, UNICEF, Red Cross, Action contre la Faim, Médecins du Monde, Croix-Rouge française (9 charities)

### Quality Certification Badges
- [x] Display certification badges on charity cards and detail pages:
  - Don en Confiance (France): blue/gold shield
  - DZI Spendensiegel (Germany): green seal
  - ZEWO (Switzerland): blue seal
  - Charity Commission (UK): text badge
  - Charity Navigator 4-star (US): star rating
  - IDEAS label (France): badge
  - Nobel Peace Prize: gold medal icon
- [x] Hovering/tapping a badge shows a one-line explainer: "Don en Confiance: independent French certification ensuring transparency, governance, and financial rigour"

---

## Iteration Rounds

### Iteration 1: Content Quality
- [x] Read every charity profile. Does it feel editorial and compelling, or like a database dump?
- [x] Verify all impact numbers are from 2024 or 2025 (latest available)
- [x] Verify all financial transparency percentages match published annual reports
- [x] Ensure "How your money helps" figures are plausible (sourced from real charity communications)
- [x] No dashes as punctuation anywhere
- [x] Each profile should make the user think "I want to support this"
- [x] Check that founding stories are genuinely interesting (Coluche, Henry Dunant, Danny Thomas, Eglantyne Jebb)

### Iteration 2: Jurisdiction Logic
- [x] Test as a French user: should see all 23 charities, 9 with 75% Loi Coluche badge, others at 66%
- [x] Test as a UK user: should see charities with UK entities or TGE eligibility, with Gift Aid info
- [x] Test as a German user: should see charities with German entities or TGE, with Sonderausgaben info
- [x] Test as a Spanish user: should see charities with Spanish entities or TGE, with 80%/40% tier info
- [x] Verify the "tax deductible in your country" filter works correctly for each jurisdiction
- [x] Verify greyed-out charities show the correct "not deductible" message

### Iteration 3: UI and Navigation
- [x] With 23 charities, test that the category filters work cleanly
- [x] Test the search bar: searching "cancer" should show CRUK, Macmillan, Deutsche Krebshilfe, Ligue, St. Jude
- [x] Test sort options all work correctly
- [x] Test on mobile (375px): cards should be full-width, scrollable category pills, search bar accessible
- [x] Verify the "Recommended for you" section shows the right charities based on jurisdiction
- [x] Check that the charity detail page handles all new fields (certifications, financial transparency, cross-border eligibility, currency)

### Iteration 4: Integration with Existing Features
- [x] Verify the allocation slider still works with up to 23 charities selected (unlikely but handle gracefully)
- [x] Verify the tax dashboard correctly calculates with charities at different tax rates and jurisdictions
- [x] Verify the simulation engine works with the expanded charity list
- [x] Verify notifications mention the correct charity names
- [x] Verify PDFs include all donated-to charities correctly
- [x] Verify the admin dashboard charity analytics page shows all 23 charities
- [x] Verify the landing page charity showcase section works (still show top 6 or expand to a scrolling showcase)

### Iteration 5: Final Review
- [x] Navigate through every charity profile on desktop and mobile
- [x] Verify all certification badges render correctly
- [x] Verify currency symbols are consistent (€ for European, £ for UK, $ for US)
- [x] Verify the cross-border tax eligibility table is accurate for every charity
- [x] Run the full app flow: sign up, onboard (see expanded charity picker), select 3-4 charities, simulate a month, check tax dashboard, download PDF
- [x] Commit with message "Charity expansion complete: 23 charities across 5 categories and 4 regions"

---

## Technical Notes
- All charity data should be in the seed file, not hardcoded in components
- The charity detail page should be a dynamic route `/charities/[id]` that works for all 23 charities
- Category filtering should be performant (filter in memory for 23 items, no need for server-side)
- Search should be a simple client-side text match on name + category + country
- Cross-border eligibility data is per-charity, stored in the `jurisdictions_eligible` jsonb field
- Currency handling: store all amounts in the charity's native currency, display in user's currency with conversion note where relevant
