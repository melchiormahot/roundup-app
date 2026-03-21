# RoundUp: Real Charity Content PRD

## Context
The app currently has placeholder charity descriptions. This PRD replaces all seed data with researched, accurate content for each charity. The charity profiles should feel like editorial content that educates and inspires, not database entries.

---

## Task List

### MSF (Médecins Sans Frontières)
- [x] Update mission: accurate description of MSF's mandate (independent, impartial medical humanitarian assistance, founded 1971, Nobel Peace Prize 1999)
- [x] Update impact bullets with real 2024/2025 data: number of projects, countries, staff deployed, patients treated. Source from MSF annual activity report.
- [x] Add "How your money helps" section: "€1 provides X", "€10 provides Y" with real MSF cost breakdowns (e.g., €1 = 1 dose of oral rehydration salts, €7 = treatment for a malnourished child for a day, €30 = an emergency surgery kit)
- [x] Add founding story: one paragraph on why MSF was created (Biafra crisis, French doctors breaking silence)
- [x] Category: humanitarian. Tax rate: 75% (Loi Coluche eligible, aid to persons in difficulty)
- [x] Verify Don en Confiance membership status (MSF is a member)

### WWF France
- [x] Update mission: accurate description (conservation of nature and ecological processes, founded 1961, panda logo, largest conservation organisation)
- [x] Update impact with real data: hectares protected, species recovery programs, French-specific projects (Loire river restoration, Mediterranean marine reserves, French Alps wildlife corridors)
- [x] Add "How your money helps": "€5 = protect 1 hectare of forest for a month", "€15 = fund 1 day of anti-poaching patrol", "€50 = rescue and rehabilitate 1 sea turtle"
- [x] Add France-specific angle: what WWF France specifically does vs global WWF
- [x] Category: environment. Tax rate: 66% (standard rate)
- [x] Verify Don en Confiance membership status

### Ligue contre le cancer
- [x] Update mission: France's leading independent cancer charity since 1918, federation of 103 departmental committees, research + prevention + patient support
- [x] Update impact with real data: number of research grants funded, patients supported, screening campaigns, specific breakthroughs funded
- [x] Add "How your money helps": "€10 = 1 hour of research", "€25 = psychological support session for a patient", "€100 = fund a screening campaign in a rural area"
- [x] Add what makes them different: only cancer charity in France that is fully independent (no pharma funding)
- [x] Category: health. Tax rate: 66% (standard rate)
- [x] Verify Don en Confiance membership status (Ligue is a founding member)

### Restos du Coeur
- [x] Update mission: founded by Coluche in 1985 (the comedian behind the Loi Coluche tax law), provides meals and social support to people in need
- [x] Update impact with real data: meals served per year (140+ million), people helped, number of centres, winter campaign statistics
- [x] Add "How your money helps": "€1 = 4 meals", "€10 = a week of food for a family", "€50 = winter clothing kit for one person"
- [x] Add the Coluche connection: explain that the Loi Coluche (75% tax rate) was literally named after Restos du Coeur's founder. This is the most meaningful connection in the app.
- [x] Category: humanitarian. Tax rate: 75% (Loi Coluche eligible, founded by Coluche himself)
- [x] Verify Don en Confiance membership status

### Amnesty International France
- [x] Update mission: protection of human rights worldwide, founded 1961, Nobel Peace Prize 1977, campaigns against torture, unfair trials, discrimination
- [x] Update impact with real data: prisoners of conscience freed, campaigns won, countries investigated, French section activities
- [x] Add "How your money helps": "€5 = translate an urgent appeal into 3 languages", "€20 = legal observation mission at a trial", "€100 = fund a human rights investigation in a conflict zone"
- [x] Category: rights. Tax rate: 66% (standard rate)
- [x] Verify Don en Confiance or equivalent certification

### Secours Populaire Français
- [x] Update mission: founded 1945, fights poverty and exclusion in France and 80 countries, "Copain du Monde" children's program, holiday access for families
- [x] Update impact with real data: people helped per year (3+ million), food distribution, back-to-school campaigns, holiday departures funded
- [x] Add "How your money helps": "€2 = school supplies for one child", "€15 = a day at the seaside for a child who has never seen the sea", "€40 = a full back-to-school kit"
- [x] Add the emotional hook: Secours Populaire's "Journées des Oubliés des Vacances" (holidays for forgotten children) is uniquely French and deeply moving
- [x] Category: humanitarian. Tax rate: 75% (Loi Coluche eligible, aid to persons in difficulty)
- [x] Verify Don en Confiance membership status

### Content Quality Pass
- [x] All descriptions should be 2 to 3 paragraphs, warm but factual, not marketing fluff
- [x] Impact bullets should use real numbers with year references (e.g., "In 2024, MSF treated 11.2 million patients")
- [x] "How your money helps" amounts should be plausible and sourced from real charity communications
- [x] No dashes as punctuation in any copy
- [x] Tone: informative, respectful, inspiring. Not preachy or guilt-inducing.
- [x] Each charity profile should make the user think "I'm glad my money goes here"

### Database and UI Updates
- [x] Update the charity seed data in the database migration/seed file with all new content
- [x] Add "howYourMoneyHelps" field to charity schema: array of objects [{amount, description}]
- [x] Add "foundingStory" field: text, one paragraph
- [x] Update charity detail page to display the new sections: founding story below mission, "How your money helps" as a visual card with euro amounts
- [x] "How your money helps" should display as a clean card with 3 tiers showing increasing amounts and impact

### Financial Transparency Section (NEW for each charity)
- [x] Add "Where your money goes" pie chart data to each charity: % to programs/operations, % to administration, % to fundraising
- [x] MSF: ~89% programs, ~6% admin, ~5% fundraising (verify from annual report)
- [x] WWF: ~82% programs, ~10% admin, ~8% fundraising (verify)
- [x] Ligue: ~78% programs, ~12% admin, ~10% fundraising (verify)
- [x] Restos du Coeur: ~92% programs, ~5% admin, ~3% fundraising (verify, heavily volunteer-run)
- [x] Amnesty: ~75% programs, ~14% admin, ~11% fundraising (verify)
- [x] Secours Populaire: ~88% programs, ~7% admin, ~5% fundraising (verify)
- [x] Display as a simple horizontal stacked bar with three colours: green (programs), blue (admin), orange (fundraising)
- [x] Add "fundraising_efficiency" field to charity schema
- [x] Show a one-line verdict below: "89 cents of every euro goes directly to saving lives" (per charity)

### Key Achievements Timeline (NEW for each charity)
- [x] Add 4 to 5 milestone achievements per charity in chronological format:
  - MSF: 1971 Founded, 1999 Nobel Prize, 2014 Ebola response (largest ever), 2020 COVID global response, 2024 11.2M patients
  - WWF: 1961 Founded, 1986 Panda logo adopted globally, 2010 Earth Hour reaches 128 countries, 2020 Living Planet Report, 2024 1.2M hectares protected in France
  - Ligue: 1918 Founded, 1956 First French cancer screening campaign, 2000 Tobacco control advocacy success, 2018 100 years celebrated, 2024 680 research projects
  - Restos: 1985 Coluche founds Restos, 1988 Loi Coluche passed (75% tax deduction), 2005 100 millionth meal served, 2020 COVID meal distribution doubled, 2024 140M+ meals
  - Amnesty: 1961 Founded (Peter Benenson's newspaper appeal), 1977 Nobel Peace Prize, 2001 Campaign against torture, 2017 Refugees Welcome campaign, 2024 157 countries investigated
  - Secours: 1945 Founded post-liberation, 1985 First "Journée des Oubliés des Vacances", 2005 Tsunami response, 2015 Refugee welcome program, 2024 3.5M people helped
- [x] Display as a horizontal timeline on desktop, vertical on mobile
- [x] Add "milestones" field to charity schema: array of objects [{year, title, description}]

### Charity Categories Page (NEW)
- [x] Create a `/charities/category/[slug]` route for each category
- [x] Category pages: Humanitarian, Health, Environment, Human Rights
- [x] Each category page has a hero with: category name, one-sentence description of why this category matters, how many charities are in it
- [x] Below: full charity cards for that category with all content visible (not just a preview)
- [x] "Why this matters" editorial paragraph per category:
  - Humanitarian: "When people have nothing, a meal, a blanket, or a doctor can be the difference between despair and hope."
  - Health: "Medical research moves slowly, costs dearly, and saves millions. Your spare change accelerates the cure."
  - Environment: "The planet doesn't send invoices, but the costs are real. Conservation protects what we can't replace."
  - Human Rights: "When someone is silenced, imprisoned, or persecuted, a voice on their side changes everything."

### Impact Calculator (NEW)
- [x] Add an interactive "Your impact so far" section to each charity detail page
- [x] Takes the user's actual donated amount to this charity and translates it into tangible outcomes
- [x] Examples:
  - MSF: "Your €99.12 has funded approximately 14 doses of oral rehydration salts and 2 days of malnutrition treatment"
  - Restos: "Your €61.95 has provided approximately 248 meals to people in need"
  - WWF: "Your €86.73 has helped protect approximately 17 hectares of forest for a month"
- [x] The calculation uses the "How your money helps" data, showing actual proportional impact
- [x] Updates dynamically as the user simulates more donations
- [x] Visual: an icon grid where each icon represents one unit of impact (one meal, one tree, one medical kit), filling in based on amount

### Iteration 1: Visual Presentation
- [x] "How your money helps" card should use a stepped visual: three rows with increasing euro amounts on the left, descriptions on the right, connected by a subtle vertical line
- [x] Add a subtle background gradient to each charity detail page that uses the charity's brand colour at very low opacity
- [x] The founding story should appear as a collapsible "Our story" section, expanded by default
- [x] Impact bullets should each have a small coloured dot matching the charity's brand colour

### Iteration 2: The Coluche Story (Special Feature)
- [x] The connection between Restos du Coeur's founder (Coluche) and the Loi Coluche (75% tax law) is the single most meaningful narrative in this app. Build a special "Did you know?" card that appears once on the dashboard after a user first donates to Restos du Coeur.
- [x] Card content: "The 75% tax deduction you just received? It exists because of Coluche, the comedian who founded Restos du Coeur in 1985. He fought for a law that would make giving to people in need as rewarding as possible. Every time you donate to Restos through RoundUp, you're part of his legacy."
- [x] This card should feel editorial, not promotional. It's a moment of connection.
- [x] Add a subtle Coluche reference in the Restos du Coeur profile: not his photo, but a quote. "Je fais appel à la bonté. La loi Coluche, c'est la reconnaissance que la générosité mérite d'être encouragée."
- [x] Dismissable but memorable

### Iteration 3: Verification and Polish
- [x] Cross-check all numbers against official charity annual reports or websites
- [x] Ensure no copy reads like it was written by AI: natural, editorial tone
- [x] Read each profile aloud: does it flow? Would you share it with a friend?
- [x] Verify all Don en Confiance labels are accurate (check donenconfiance.org)
- [x] Verify all "How your money helps" figures are plausible (not invented)
- [x] Verify financial transparency percentages match latest published data
- [x] Test the impact calculator with sample amounts: do the numbers make sense?
- [x] Test the milestone timeline on mobile: does it read well vertically?
- [x] Ensure every charity profile makes you think "I want to support this"
- [x] Commit with message "Real charity content with verified data and impact features"
