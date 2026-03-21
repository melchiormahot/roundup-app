# RoundUp: Real Charity Content PRD

## Context
The app currently has placeholder charity descriptions. This PRD replaces all seed data with researched, accurate content for each charity. The charity profiles should feel like editorial content that educates and inspires, not database entries.

---

## Task List

### MSF (Médecins Sans Frontières)
- [ ] Update mission: accurate description of MSF's mandate (independent, impartial medical humanitarian assistance, founded 1971, Nobel Peace Prize 1999)
- [ ] Update impact bullets with real 2024/2025 data: number of projects, countries, staff deployed, patients treated. Source from MSF annual activity report.
- [ ] Add "How your money helps" section: "€1 provides X", "€10 provides Y" with real MSF cost breakdowns (e.g., €1 = 1 dose of oral rehydration salts, €7 = treatment for a malnourished child for a day, €30 = an emergency surgery kit)
- [ ] Add founding story: one paragraph on why MSF was created (Biafra crisis, French doctors breaking silence)
- [ ] Category: humanitarian. Tax rate: 75% (Loi Coluche eligible, aid to persons in difficulty)
- [ ] Verify Don en Confiance membership status (MSF is a member)

### WWF France
- [ ] Update mission: accurate description (conservation of nature and ecological processes, founded 1961, panda logo, largest conservation organisation)
- [ ] Update impact with real data: hectares protected, species recovery programs, French-specific projects (Loire river restoration, Mediterranean marine reserves, French Alps wildlife corridors)
- [ ] Add "How your money helps": "€5 = protect 1 hectare of forest for a month", "€15 = fund 1 day of anti-poaching patrol", "€50 = rescue and rehabilitate 1 sea turtle"
- [ ] Add France-specific angle: what WWF France specifically does vs global WWF
- [ ] Category: environment. Tax rate: 66% (standard rate)
- [ ] Verify Don en Confiance membership status

### Ligue contre le cancer
- [ ] Update mission: France's leading independent cancer charity since 1918, federation of 103 departmental committees, research + prevention + patient support
- [ ] Update impact with real data: number of research grants funded, patients supported, screening campaigns, specific breakthroughs funded
- [ ] Add "How your money helps": "€10 = 1 hour of research", "€25 = psychological support session for a patient", "€100 = fund a screening campaign in a rural area"
- [ ] Add what makes them different: only cancer charity in France that is fully independent (no pharma funding)
- [ ] Category: health. Tax rate: 66% (standard rate)
- [ ] Verify Don en Confiance membership status (Ligue is a founding member)

### Restos du Coeur
- [ ] Update mission: founded by Coluche in 1985 (the comedian behind the Loi Coluche tax law), provides meals and social support to people in need
- [ ] Update impact with real data: meals served per year (140+ million), people helped, number of centres, winter campaign statistics
- [ ] Add "How your money helps": "€1 = 4 meals", "€10 = a week of food for a family", "€50 = winter clothing kit for one person"
- [ ] Add the Coluche connection: explain that the Loi Coluche (75% tax rate) was literally named after Restos du Coeur's founder. This is the most meaningful connection in the app.
- [ ] Category: humanitarian. Tax rate: 75% (Loi Coluche eligible, founded by Coluche himself)
- [ ] Verify Don en Confiance membership status

### Amnesty International France
- [ ] Update mission: protection of human rights worldwide, founded 1961, Nobel Peace Prize 1977, campaigns against torture, unfair trials, discrimination
- [ ] Update impact with real data: prisoners of conscience freed, campaigns won, countries investigated, French section activities
- [ ] Add "How your money helps": "€5 = translate an urgent appeal into 3 languages", "€20 = legal observation mission at a trial", "€100 = fund a human rights investigation in a conflict zone"
- [ ] Category: rights. Tax rate: 66% (standard rate)
- [ ] Verify Don en Confiance or equivalent certification

### Secours Populaire Français
- [ ] Update mission: founded 1945, fights poverty and exclusion in France and 80 countries, "Copain du Monde" children's program, holiday access for families
- [ ] Update impact with real data: people helped per year (3+ million), food distribution, back-to-school campaigns, holiday departures funded
- [ ] Add "How your money helps": "€2 = school supplies for one child", "€15 = a day at the seaside for a child who has never seen the sea", "€40 = a full back-to-school kit"
- [ ] Add the emotional hook: Secours Populaire's "Journées des Oubliés des Vacances" (holidays for forgotten children) is uniquely French and deeply moving
- [ ] Category: humanitarian. Tax rate: 75% (Loi Coluche eligible, aid to persons in difficulty)
- [ ] Verify Don en Confiance membership status

### Content Quality Pass
- [ ] All descriptions should be 2 to 3 paragraphs, warm but factual, not marketing fluff
- [ ] Impact bullets should use real numbers with year references (e.g., "In 2024, MSF treated 11.2 million patients")
- [ ] "How your money helps" amounts should be plausible and sourced from real charity communications
- [ ] No dashes as punctuation in any copy
- [ ] Tone: informative, respectful, inspiring. Not preachy or guilt-inducing.
- [ ] Each charity profile should make the user think "I'm glad my money goes here"

### Database and UI Updates
- [ ] Update the charity seed data in the database migration/seed file with all new content
- [ ] Add "howYourMoneyHelps" field to charity schema: array of objects [{amount, description}]
- [ ] Add "foundingStory" field: text, one paragraph
- [ ] Update charity detail page to display the new sections: founding story below mission, "How your money helps" as a visual card with euro amounts
- [ ] "How your money helps" should display as a clean card with 3 tiers showing increasing amounts and impact

### Iteration 1: Visual Presentation
- [ ] "How your money helps" card should use a stepped visual: three rows with increasing euro amounts on the left, descriptions on the right, connected by a subtle vertical line
- [ ] Add a subtle background gradient to each charity detail page that uses the charity's brand colour at very low opacity
- [ ] The founding story should appear as a collapsible "Our story" section, expanded by default
- [ ] Impact bullets should each have a small coloured dot matching the charity's brand colour

### Iteration 2: Verification and Polish
- [ ] Cross-check all numbers against official charity annual reports or websites
- [ ] Ensure no copy reads like it was written by AI: natural, editorial tone
- [ ] Read each profile aloud: does it flow? Would you share it with a friend?
- [ ] Verify all Don en Confiance labels are accurate (check donenconfiance.org)
- [ ] Commit with message "Real charity content with verified data"
