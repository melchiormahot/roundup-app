# RoundUp: Country-Specific Charities + Warm Charcoal Palette PRD

## Context
Two changes in one PRD:
1. **Replace the global charity catalogue with country-specific selections.** When a user selects France, they see the 7 most recognised French charities (one per category) plus 5 international ones. When they select UK, they see 7 British charities plus the same 5 international ones. Each country gets its own curated list.
2. **Switch the colour palette from Deep Navy to Warm Charcoal.** Warmer, earthier tones that feel more approachable and less "cold fintech."

**Research report:** `RESEARCH_Charities_by_Country.md`

---

## Part 1: Warm Charcoal Palette

### Replace All Colour Variables
- [x] Update CSS variables globally. Replace the Deep Navy palette with Warm Charcoal:

**Dark mode (Warm Charcoal):**
  - `--bg-primary`: #121212 (true dark, warm)
  - `--bg-secondary`: #1c1917 (warm charcoal)
  - `--bg-card`: #231f1c (warm brown-black)
  - `--bg-card-inner`: #2a2522 (slightly lighter)
  - `--border-primary`: #33302b (warm border)
  - `--border-secondary`: #3d3833 (secondary border)
  - `--text-primary`: #e7e5e4 (warm white, not blue-white)
  - `--text-secondary`: #a8a29e (warm grey)
  - `--text-dim`: #78716c (warm dim)
  - `--accent-green`: #86efac (softer green)
  - `--accent-blue`: #60a5fa (softer blue)
  - `--accent-purple`: #c084fc (softer purple)
  - `--accent-red`: #fca5a5 (softer red)
  - `--accent-yellow`: #fbbf24 (warm gold)
  - `--accent-orange`: #fb923c (warm orange)
  - `--progress-track`: #292524 (warm track)
  - `--nav-bg`: rgba(28, 25, 23, 0.92) (warm frosted)
  - `--toast-bg`: rgba(35, 31, 28, 0.95) (warm toast)
  - `--shadow`: rgba(0, 0, 0, 0.4)

**Light mode (Warm Light):**
  - `--bg-primary`: #faf9f7 (warm off-white)
  - `--bg-secondary`: #ffffff
  - `--bg-card`: #ffffff
  - `--bg-card-inner`: #f5f3f0 (warm inner)
  - `--border-primary`: #e7e5e3 (warm border)
  - `--border-secondary`: #d6d3d1 (warm secondary)
  - `--text-primary`: #1c1917 (warm black)
  - `--text-secondary`: #57534e (warm grey)
  - `--text-dim`: #a8a29e
  - `--accent-green`: #059669 (darker green for light)
  - `--accent-blue`: #2563eb (darker blue for light)
  - `--accent-purple`: #7c3aed
  - `--accent-red`: #dc2626
  - `--accent-yellow`: #d97706
  - `--accent-orange`: #ea580c
  - `--progress-track`: #e7e5e3
  - `--nav-bg`: rgba(255, 255, 255, 0.92)
  - `--toast-bg`: rgba(255, 255, 255, 0.95)
  - `--shadow`: rgba(0, 0, 0, 0.06)

### Update Tailwind Config
- [x] Update the tailwind.config.ts custom colours to reference the new warm palette
- [x] Remove any remaining `navy-*` colour references from the config
- [x] Ensure the warm charcoal tones are available as Tailwind classes

### Update All Hardcoded Colours
- [x] Search the entire codebase for any remaining hardcoded hex values from the old Deep Navy palette (#060e1a, #0b1628, #0f1f38, #152a4a, #1a3050, #d0dff0, #7a9cc6, #3d5a80, #5ce0b8, #4a9eff, #b48eff)
- [x] Replace each with the corresponding CSS variable reference
- [x] Check chart colours in admin dashboard (Recharts config)
- [x] Check the landing page gradient orbs and hero background
- [x] Check the onboarding screens
- [x] Check the PDF generation (PDFs should remain light/print-friendly regardless)

### Update PWA Assets
- [x] Update manifest.json background_color and theme_color to warm charcoal values
- [x] Regenerate app icons with the warm palette (green accent on charcoal background)
- [x] Update the iOS splash screen colours
- [x] Update the meta theme-color tag for both dark and light modes

### Visual Verification
- [x] Every screen should feel warm, earthy, and approachable. Not cold, not clinical.
- [x] The green accent (#86efac) on charcoal (#1c1917) should feel like nature growing from earth
- [x] The warm white text (#e7e5e4) should feel comfortable to read for hours
- [x] Cards should feel like they have depth through subtle warm shadows, not borders
- [x] The overall aesthetic should evoke: cozy, trustworthy, human, grounded

---

## Part 2: Country-Specific Charity Catalogues

### Database Changes
- [x] Add `country_code` field to charities table (text, the country this charity is primarily associated with, or 'INTL' for international)
- [x] Add `display_countries` field (jsonb, array of country codes where this charity should appear in the catalogue)
- [x] Keep existing fields: category, tax_rate, jurisdictions_eligible, loi_coluche_eligible, etc.

### Remove Old Charities, Seed New Ones
- [x] Remove all existing 23 charities from the seed file
- [x] Seed the new country-specific charities (40 total: 7 per country × 5 countries + 5 international)

### International Charities (appear in ALL countries)
- [x] **Red Cross / Red Crescent**: humanitarian, national entities in all countries, 75% Loi Coluche eligible in France
- [x] **UNICEF**: children, national committees in all countries, 75% Loi Coluche eligible in France
- [x] **MSF (Médecins Sans Frontières)**: humanitarian/health, national sections in all countries, 75% Loi Coluche eligible
- [x] **WWF**: environment, national offices in all countries
- [x] **Amnesty International**: human rights, national sections in all countries

### France (7 charities)
- [x] **Ligue contre le cancer**: health/cancer, Don en Confiance, 66% rate
- [x] **France Nature Environnement**: environment, oldest French environmental federation (1968), 3,500 member associations
- [x] **Les Restos du Coeur**: humanitarian/hunger, Coluche's legacy, 75% Loi Coluche, 140M+ meals/year
- [x] **Apprentis d'Auteuil**: children/education, founded 1866 by Abbé Roussel, 30,000+ young people supported
- [x] **Ligue des droits de l'Homme**: human rights, founded 1898 during Dreyfus Affair, oldest French human rights org
- [x] **SPA (Société Protectrice des Animaux)**: animals, founded 1845, oldest animal welfare charity in France, 48,000 animals rescued/year
- [x] **Fondation de France**: education/general, largest French foundation, Don en Confiance, funds thousands of projects

### United Kingdom (7 charities)
- [x] **Cancer Research UK**: health/cancer, world's largest independent cancer research charity, £735M income
- [x] **Greenpeace UK**: environment, zero corporate funding, campaign-focused
- [x] **Oxfam GB**: humanitarian, founded 1942, operates in 90+ countries, iconic charity shops
- [x] **NSPCC**: children, UK's leading children's protection charity, Childline service
- [x] **Amnesty International UK**: human rights (uses the international entry)
- [x] **RSPCA**: animals, founded 1824, oldest animal welfare charity in the world, 130,000 animals rescued/year
- [x] **Teach First**: education, places graduates in disadvantaged schools, social mobility focus

### Germany (7 charities)
- [x] **Deutsche Krebshilfe**: health/cancer, largest independent cancer charity in continental Europe, DZI certified, ~91% to programs
- [x] **BUND (Bund für Umwelt und Naturschutz)**: environment, Germany's largest environmental org, 680,000 members
- [x] **Welthungerhilfe**: humanitarian/hunger, DZI certified, 94% to programs, operates in 36 countries
- [x] **Deutsches Kinderhilfswerk**: children, advocates for children's rights and participation in Germany
- [x] **Amnesty International Deutschland**: human rights (uses international entry)
- [x] **Deutscher Tierschutzbund**: animals, Germany's largest animal welfare umbrella org, 740+ shelters
- [x] **Stiftung Lesen (Reading Foundation)**: education, promotes literacy, supported by German president

### Spain (7 charities)
- [x] **AECC (Asociación Española Contra el Cáncer)**: health/cancer, Spain's leading cancer charity, research + patient support
- [x] **Greenpeace España**: environment, campaigns on climate, oceans, forests in Spanish context
- [x] **Cáritas España**: humanitarian, Catholic charity, Spain's largest social services provider, 94% to programs
- [x] **Aldeas Infantiles SOS**: children, SOS Children's Villages Spain, established 1981
- [x] **Amnistía Internacional España**: human rights (uses international entry)
- [x] **Fundación Affinity**: animals, Spain's leading animal welfare foundation, "no animal without a home" mission
- [x] **Fundación ONCE**: education/disability, supports people with disabilities, unique Spanish institution

### Belgium (7 charities)
- [x] **Kom op tegen Kanker**: health/cancer, Flanders' leading cancer charity, research + patient support
- [x] **WWF Belgium**: environment (uses international entry)
- [x] **MSF Belgium**: humanitarian (uses international entry, but Belgian section specifically)
- [x] **UNICEF Belgium**: children (uses international entry, but Belgian committee specifically)
- [x] **Amnesty International Belgique**: human rights (uses international entry)
- [x] **GAIA (Global Action in the Interest of Animals)**: animals, Belgium's leading animal rights org
- [x] **King Baudouin Foundation**: education/general, Belgium's largest foundation, supports social justice and civic engagement

### Charity Display Logic
- [x] When user selects a jurisdiction during onboarding, show ONLY:
  - The 7 country-specific charities for that country
  - Plus the 5 international charities
  - Total: 12 charities visible per country
- [x] During onboarding charity selection: show the 7 country-specific ones first (labelled "Popular in [country]"), then the 5 international ones below (labelled "International organisations")
- [x] Category filter pills should show all 7 categories: Health, Environment, Humanitarian, Children, Human Rights, Animals, Education
- [x] Each category has exactly one local charity plus any international charities that match that category
- [x] If a user changes jurisdiction in Settings, their charity catalogue should update. Charities they previously selected that aren't in the new catalogue should remain in their selection but be marked "Not available in [new country]"

### Content for Each Charity
- [x] Each of the 40 charities needs: name, one-paragraph mission, 3 to 4 impact bullets, founding story (1 paragraph), "How your money helps" (3 tiers), financial transparency (% to programs/admin/fundraising), certifications, milestones (4 to 5), category, tax rate per jurisdiction, loi_coluche_eligible flag
- [x] Use the existing content format from the charity expansion PRD
- [x] For charities that overlap with existing data (MSF, WWF, Amnesty, etc.), reuse and update existing content
- [x] For new charities (SPA, RSPCA, Cáritas, BUND, etc.), research and write fresh content

### Onboarding Update
- [x] After country selection, the charity picker should immediately show the relevant 12 charities
- [x] Group them: "Your country's top charities" (7) and "International" (5)
- [x] Each card shows: charity icon, name, category, one-line description
- [x] User selects 1 to 3 to start (progressive disclosure: more available later)

---

## Iteration Rounds

### Iteration 1: Palette Verification
- [x] Check every screen in dark mode with Warm Charcoal. Does it feel warm and grounded?
- [x] Check every screen in light mode with Warm Light. Does it feel clean and premium?
- [x] Verify all accent colours pass WCAG AA contrast on both backgrounds
- [x] Verify the landing page looks good with the new palette
- [x] Verify admin dashboard charts use the new colours
- [x] The app should feel completely different from the old Deep Navy: warmer, more human, less "tech startup"

### Iteration 2: Country Catalogues
- [x] Test as French user: see 7 French charities + 5 international = 12 total
- [x] Test as UK user: see 7 UK charities + 5 international = 12 total
- [x] Test as German user: see 7 German charities + 5 international = 12 total
- [x] Test as Spanish user: see 7 Spanish charities + 5 international = 12 total
- [x] Test as Belgian user: see 7 Belgian charities + 5 international = 12 total
- [x] Verify category filters work: tapping "Animals" shows SPA (France), RSPCA (UK), etc. depending on jurisdiction
- [x] Verify switching jurisdiction in Settings updates the charity catalogue correctly

### Iteration 3: Content Quality
- [x] Read every new charity profile. Does each one feel compelling and trustworthy?
- [x] Verify "How your money helps" figures are plausible for each charity
- [x] Verify financial transparency percentages are sourced from real data
- [x] No dashes as punctuation in any copy
- [x] Each charity should represent the "gold standard" of its category in its country

### Iteration 4: Integration
- [x] Verify tax calculations work correctly with country-specific charities (French charities at 66%/75%, UK at Gift Aid rates, etc.)
- [x] Verify simulation engine works with the new charity catalogue
- [x] Verify PDFs generate correctly with country-specific charity names
- [x] Verify the admin dashboard shows all charities across all countries
- [x] Verify the landing page charity showcase adapts to visitor's detected country (or defaults to France)

### Iteration 5: Final Review
- [x] The full experience: sign up, select France, see French charities, pick 3, donate, check tax, switch to UK, see UK charities
- [x] Mobile test at 375px: charity cards, category pills, onboarding picker all work
- [x] The Warm Charcoal palette should make you think "I trust this app" more than the old Deep Navy did
- [x] Commit with message "Country-specific charities and Warm Charcoal palette complete"

---

## Technical Notes
- The `display_countries` field determines which countries see each charity. International charities have ['FR','UK','DE','ES','BE'].
- Country-specific charities have their single country code: ['FR'] for French, ['UK'] for UK, etc.
- The charity browser queries: `WHERE display_countries LIKE '%{userJurisdiction}%'`
- When a user changes jurisdiction, do NOT delete their charity selections. Mark non-available ones and let the user decide.
- The 5 international charities share content across all countries but may have country-specific tax data (MSF France at 75%, MSF UK at Gift Aid, etc.)
