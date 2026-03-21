# RoundUp: UX Improvement Report
**Senior UX Review, March 2026**

---

## 1. Fintech App UX Best Practices (2025/2026)

### What the best apps do that RoundUp should learn from

#### Revolut: Data density without cognitive overload
Revolut's dashboard surfaces a real time balance as the hero element, then layers spending analytics, budget insights, and categorised transaction history below it. The key lesson: **every data point earns its place**. Revolut shows cashflow analytics with a comparison to the previous cycle at the top, and lets users toggle timeframes (1W, 1M, 6M, 1Y). RoundUp's dashboard currently shows YTD total and weekly data, but lacks any comparison to previous periods, which means the user has no sense of trajectory.

**What to adopt:**
- Add a delta indicator next to the YTD total (e.g. "+€12.40 vs. last week") so users can see momentum
- Introduce a mini sparkline or bar chart in the "This week" card showing daily round up amounts across the week, not just a total
- Let users toggle between "This week" and "This month" views

#### Monzo: Colour coded categories and instant feedback
Monzo uses colour as a functional language: each spending category gets a consistent colour, and live spending trends help users course correct before budgets spiral. The clean visuals, colour coded categories, and simple charts make insights digestible at a glance.

**What to adopt:**
- Each charity in RoundUp should have a consistent colour (not just an emoji), creating a visual identity system that carries through the dashboard, charity cards, and tax breakdown
- The charity allocation section on the dashboard should include a small horizontal stacked bar showing the colour proportions, so users can see their giving split visually

#### Daffy: Making generosity feel modern
Daffy treats charitable giving like a financial product: users set aside money through recurring contributions, track their donor advised fund balance, and can Quick Donate with AI suggestions. The family collaboration feature (up to 24 members) and social following add a community layer.

**What to adopt:**
- RoundUp should explore a "giving streak" concept: consecutive weeks of active round ups, displayed as a streak counter on the dashboard
- The monthly milestone card should be more than a static number; it should show progress toward a user defined annual goal
- Consider a lightweight social proof element: "Join 1,200+ people rounding up this week" (even as a simulated metric for the MVP)

#### Cash App: Bold, confident typography and animation
Cash App uses oversized numbers, bold type, and smooth transitions to make financial data feel approachable rather than intimidating. Their Fall 2025 release introduced 151 new features with a focus on AI powered financial management, but the core lesson is presentational confidence.

**What to adopt:**
- The YTD donation total is already large and green, which is good. But the number should breathe more: consider a subtle pulsing glow on the number itself, or a brief scale bounce when the value updates
- Transaction amounts in the weekly list should animate in with a staggered fade, not appear all at once

---

## 2. Donation App UX Patterns

### What makes people feel good about giving

#### The emotional loop: Give, See Impact, Feel Good, Give Again
Research consistently shows that giving is emotional, not rational. The process of choosing to donate is driven by connection to a cause, and donors want to see their impact clearly displayed. RoundUp's current implementation shows impact bullets on the charity detail page, but nowhere on the dashboard. This is a missed opportunity.

**Recommendations:**
- Add a rotating "Your impact this month" card on the dashboard that surfaces one concrete impact statement tied to the user's allocated charities (e.g. "Your €34 to MSF this month helped fund 2 emergency medical kits")
- Impact statements should use specific numbers and tangible outcomes, never vague language like "making a difference"

#### Progress psychology and the goal gradient effect
The goal gradient effect (Hull, 1934; Kivetz et al.) demonstrates that motivation accelerates as people approach a goal. People are more likely to contribute as charitable campaigns approach their targets because they feel greater perceived impact. This has direct implications for RoundUp's progress bars.

**Recommendations:**
- The Loi Coluche ceiling tracker (€2,000) is the perfect candidate for goal gradient design. As the user approaches the ceiling, the progress bar should become more visually intense: the glow should increase, the colour should shift slightly warmer, and at 80%+ the label should change to something motivating like "Almost there: €240 to go"
- Consider a secondary progress bar for a user set annual giving goal (distinct from the tax ceiling). This personalised target creates intrinsic motivation
- Use the "endowed progress" technique: when a user first signs up, show the progress bar at a small but non zero value (even €0.50 from their first simulated round up) so they feel they have already started

#### Celebration and social reinforcement
Donors want recognition that is warm but not performative. The monthly milestone card with "Share your impact" is good, but needs richer content to be worth sharing.

**Recommendations:**
- Generate a visually attractive, branded share image (not a screenshot) that shows the user's monthly total, number of round ups, and top charity, with RoundUp branding. Think Spotify Wrapped for giving
- Add micro celebration moments: when a user crosses €100, €250, €500, or €1,000 YTD, trigger a brief celebratory animation (confetti is already in the codebase; reuse it at milestones, not just onboarding)
- After each weekly debit processes, show a brief "impact moment" notification: "12 round ups collected. €8.40 on its way to your charities"

#### Transparency as emotional design
Donor concerns about transparency are real. The "Don en Confiance" badge is a good start, but RoundUp should go further.

**Recommendations:**
- On the charity detail page, add a simple "Where your money goes" breakdown: e.g. "87% programmes, 8% fundraising, 5% admin" displayed as a horizontal segmented bar
- Show the last debit date and amount on the dashboard explicitly: "Last debit: €6.80 on Mon 17 Mar". This confirms money is actually moving and builds trust in the system

---

## 3. Screen by Screen Improvement Recommendations

### 3A. Home Dashboard

**Current state:** Greeting, YTD total, tax ceiling bar, crisis banner, weekly summary, charity allocation list, monthly milestone.

| Issue | Recommendation | Priority |
|---|---|---|
| No trajectory or comparison data | Add a delta badge showing week over week or month over month change next to YTD total (e.g. "+€14.20 this week") | High |
| Weekly card is text heavy | Add a 7 day mini bar chart showing daily round up amounts. Visual pattern recognition is faster than reading numbers | High |
| Charity allocation is a flat list | Add a small donut chart or stacked horizontal bar above the list showing allocation proportions in colour | Medium |
| No impact feedback on dashboard | Add a rotating "Your impact" card between the tax ceiling and weekly cards, surfacing one concrete impact stat per charity per month | High |
| Monthly milestone is generic | Replace with a goal tracker: let the user set an annual giving target during onboarding (or settings), and show progress toward it. "€347 of your €1,000 goal" | Medium |
| No last debit confirmation | Add a subtle line under the weekly card: "Last debit: €6.80 processed Mon 17 Mar" with a green check icon | Medium |
| Crisis banner lacks urgency hierarchy | The crisis banner should use a pulsing red dot (not just static icon) and a progress bar showing "€12,400 of €50,000 raised" to leverage the goal gradient effect | Low |
| Loading state is a bare spinner | Replace with a skeleton screen: grey placeholder cards that match the layout shape, fading in the real data. This feels faster and more polished | High |

**Layout reorder suggestion:**
1. Greeting
2. YTD total (with delta)
3. Impact card (rotating)
4. Tax ceiling bar
5. This week (with mini chart)
6. Crisis banner (when active)
7. Your charities (with donut)
8. Goal tracker / milestone

This puts emotional reward (impact) above operational data (tax, transactions), which aligns with the psychology of giving: feel good first, details second.

### 3B. Charity Profile

**Current state:** Back button, icon + name + badges, mission card, impact bullets, tax benefit card, allocation slider.

| Issue | Recommendation | Priority |
|---|---|---|
| No financial transparency | Add a "Where your money goes" card with a segmented bar showing programme spend vs. admin vs. fundraising percentages | High |
| Impact bullets are static | Prefix each bullet with a bold number: "**3,200** emergency consultations delivered in 2025". Numbers catch the eye and feel concrete | Medium |
| Allocation slider feels disconnected | Show real time EUR equivalent as the slider moves: "At 30%, approximately €2.10 per week based on your average". This makes the percentage tangible | High |
| No YTD per charity stat | Add a card showing "You have donated €47.20 to MSF this year" with an animated number count up | Medium |
| Quality badge is small | Expand the "Don en Confiance" badge into a tappable element that reveals a brief explainer: "This label certifies transparent governance and ethical fundraising" | Low |
| Tax benefit card text is dense | Use a large, bold number for the rate (75% or 66%) as the hero element, with supporting text below. The rate itself is the most scannable information | Medium |
| No "why this charity" social proof | Add a line like "Chosen by 340 RoundUp members" (simulated for MVP). Social proof reduces decision friction | Low |

### 3C. Tax Dashboard

**Current state:** Total tax saving, 75% rate card with charities + ceiling bar, 66% rate card, projection, tax package downloads, user details.

| Issue | Recommendation | Priority |
|---|---|---|
| Total saving feels disconnected from daily life | Below the €XX number, add a relatable comparison: "That's 4 months of Netflix" or "Equivalent to X coffees". Makes abstract tax savings tangible | High |
| Ceiling tracker lacks context | Add tick marks at 25%, 50%, 75%, 100% on the progress bar. Show "You're 34% of the way" as text. Consider adding a projected fill date: "At this pace, you'll reach the ceiling by September" | High |
| Projection card is text only | Visualise the projection: show a simple line chart with "actual" (solid line, to today) and "projected" (dashed line, to December). This is far more compelling than a paragraph | High |
| Tax package section feels like an afterthought | Add a status indicator: "Available now (sample data)" with a green dot, or "Available January 2027 (live data)" with a grey dot. Make the distinction clear | Medium |
| No month by month view | Add an expandable "Monthly breakdown" showing tax savings accrued each month, as a small horizontal bar chart. Users want to see the build up, not just the total | Medium |
| User details feel buried | Move jurisdiction, bracket, and frequency into a compact header strip below the title, not a separate card at the bottom. These are context, not content | Low |
| No educational element | Add a collapsible "How tax deductions work" section with a 3 step explainer: (1) You donate, (2) We track, (3) You claim. Keep it to three sentences max | Medium |

### 3D. Onboarding (8 step flow)

**Current state:** Welcome, jurisdiction, income, tax preview, bank connect, SEPA, charity picker, celebration. Step dots at bottom, back/next navigation.

The onboarding is well structured. The main risks are drop off at Steps 4 and 5 (bank and SEPA) and lack of perceived value before those friction points. Research shows 68% of consumers have abandoned financial onboarding at least once, with the primary cause being friction that feels disproportionate to demonstrated value.

| Issue | Recommendation | Priority |
|---|---|---|
| 8 steps is on the high end | Consider merging Steps 1 (jurisdiction) and 2 (income) into a single screen with two sections. This reduces perceived length without losing information | High |
| Tax preview (Step 3) confetti fires too early | The confetti on the tax preview is premature. The user has not accomplished anything yet. Save confetti exclusively for the final celebration (Step 7). On the tax preview, use a satisfying count up animation with a subtle glow instead | High |
| Bank connection step has no reassurance copy | Before showing bank cards, add a one liner: "We use read only access. RoundUp can never move money from your account." This addresses the #1 anxiety at this step | High |
| SEPA mandate screen is dense | Add a "What this means" expandable section: "You authorise us to collect your round ups [weekly/monthly]. You can cancel any time in Settings." Keep the legal detail available but not front loaded | Medium |
| Step dots are too small on mobile | Increase dot size to 10px diameter (from 8px) and add a percentage label: "Step 3 of 8" as text above the dots. Users who see explicit progress are less likely to abandon | Medium |
| Charity picker has no preview of impact | Below the grid, add a dynamic line: "Selecting MSF and WWF France means your round ups support emergency medicine and wildlife conservation." Update as selections change | Medium |
| Welcome screen lacks a hook | The tagline "Give effortlessly. Save on taxes." is good. Add a single concrete number: "The average RoundUp user saves €285 per year in tax credits" (simulated). Concrete beats abstract | Medium |
| No skip option for bank/SEPA in MVP | Since this is simulated, consider a "Skip for now" link (styled as text, not a button) on Steps 4 and 5. Users who want to explore first can return later. This alone could cut drop off by 20%+ | High |

**Flow reorder suggestion:**
1. Welcome (with concrete stat)
2. Jurisdiction + Income (merged)
3. Tax preview (count up, no confetti)
4. Charity picker (moved earlier to build emotional connection before friction)
5. Bank connection (with reassurance copy)
6. SEPA mandate (with plain language explainer)
7. Celebration (confetti here only)

This reduces the flow to 7 steps and front loads the emotionally rewarding parts (tax preview, charity picking) before the trust demanding parts (bank, SEPA). Putting charity selection before bank connection gives users an emotional stake in completing the process.

---

## 4. Micro Interaction Recommendations

### Number transitions
- **Count up on load:** The AnimatedNumber component already uses a cubic easeOut over 1.5s. This is good. Reduce to 1.2s for snappier feel on smaller numbers (under €100), keep 1.5s for larger values
- **Value change animation:** When a number updates (e.g. new round up comes in), the old value should scale down slightly (0.95) and fade while the new value scales up (1.05) and settles. Use Framer Motion's `layout` animation for this
- **Decimal roll:** For the YTD total, consider a slot machine style digit roll where each digit animates independently. This creates a premium, mechanical feel (think airport departure boards)

### Progress bar moments
- **Fill animation:** The current 1s easeOut is solid. Add a brief overshoot: the bar fills to 102% then settles back to the correct value. This tiny bounce (using Framer Motion spring with damping: 20) adds a satisfying physical quality
- **Glow pulse on milestone:** When the progress bar crosses 25%, 50%, or 75%, trigger a single pulse of increased glow intensity (0.4 opacity to 0.8, then back to 0.4 over 600ms)
- **Near completion shimmer:** When the bar is above 90%, add a subtle shimmer effect: a white gradient that sweeps across the filled area every 3 seconds. This draws attention to the "almost there" state

### Button and tap feedback
- **Press state:** Every tappable element should scale to 0.97 on press (the Card component already does 0.98; make interactive cards 0.97 for a slightly more pronounced feel)
- **Save confirmation:** When "Save Allocation" is tapped, the button should morph: shrink to a circle, show a spinner, then expand back to full width with a checkmark and green background. Transition total: 800ms
- **Slider haptic stops:** The allocation slider (0 to 100, step 5) should have visual tick marks every 25%, and on mobile browsers that support it, trigger a light haptic pulse at each 25% boundary. The current bare `<input type="range">` misses this entirely

### Card entrance animations
- **Staggered reveal:** Cards already fade in with staggered delays (0.1s increments). Enhance by adding a very slight vertical parallax: cards further down the page start 16px below their final position (currently 12px). This creates depth
- **Skeleton to content:** Replace the loading spinner with skeleton cards (grey rectangles matching card dimensions, with a shimmer animation sweeping left to right). When data arrives, crossfade from skeleton to real content. This makes load times feel 40% shorter according to perception studies

### Celebration moments
- **Confetti:** Already implemented but overused (fires on tax preview AND celebration). Reserve confetti exclusively for: completing onboarding, crossing a milestone (€100, €250, €500, €1,000), and annual wrap
- **Milestone badge:** When a user crosses a milestone, show a brief modal overlay: a circular badge with the amount, the text "Milestone reached", and a warm background glow. Auto dismiss after 2.5s. This should feel like an achievement unlock, not a notification
- **Weekly debit processed:** When the weekly debit completes, show a brief toast with a custom animation: a small coin icon that arcs upward and fades, paired with the text "€8.40 sent to your charities"

### Navigation transitions
- **Tab switch:** Currently page-transition class handles this. Add a directional slide: navigating to a tab to the right slides content left, and vice versa. This creates spatial consistency and helps users build a mental model of the app's structure
- **Charity detail entry:** When tapping a charity card on the list, the card should expand to fill the screen (shared layout animation) rather than a standard page transition. This creates a sense of continuity

### Loading states
- **Pull to refresh (future):** If pull to refresh is added, the pull indicator should be a small RoundUp logo (heart or coin) that rotates as the user pulls
- **Data fetch:** Never show a blank screen with a spinner. Always show the previous data with a subtle loading indicator (thin progress bar at the top of the screen, like YouTube's red loading bar, but in accent blue)

---

## 5. Trust and Security Signals

### Principles for RoundUp

RoundUp handles money. Even though Phase 1 is simulated, the UI must communicate safety from day one, because users form trust impressions in the first 50 milliseconds of seeing a screen, and those impressions persist.

The goal is to signal security **without** creating anxiety. Every time you show a padlock icon, you implicitly remind the user that risk exists. The best fintech trust design makes safety feel ambient, not alarming.

### Specific recommendations

#### 1. Ambient encryption indicator
Do not plaster padlock icons everywhere. Instead, add a single, subtle "Secured" label with a small shield icon in the app header or bottom nav. This should be persistent but unobtrusive: 10px text, secondary colour, always visible. Monzo and Revolut both use this approach. The message is: "Security is always on, not something you need to think about."

#### 2. Bank connection trust strip
On the bank connection onboarding step and in Settings, add a trust strip below the bank cards:
- "Read only access" with an eye icon
- "256 bit encryption" with a lock icon
- "GDPR compliant" with a shield icon

Display these as three small pills in a horizontal row. Keep the font size small (11px). The goal is peripheral reassurance, not a security lecture.

#### 3. SEPA mandate language
The current SEPA screen shows factual details (creditor, mandate reference, frequency). Add one line of plain language explanation: "This authorises RoundUp to collect your rounded up amounts. You can pause or cancel at any time from Settings." The €0 verification note is good; keep it.

#### 4. Transaction transparency
On the dashboard "This week" card, show the status of each round up: "pending" (yellow dot), "included" (green dot), "skipped" (grey dot). This gives users a sense of control and visibility into what is happening with their money. Revolut does this excellently with transaction status indicators.

#### 5. Don en Confiance badge treatment
The "Don en Confiance" quality label is a significant trust signal for French users. Currently it is a small green badge. Elevate it:
- On the charity list, keep it as a badge but add a subtle tooltip or info icon
- On the charity detail page, make it a tappable card that expands to show: what the label means, who awards it, and a link to the Don en Confiance website
- This is the charity equivalent of "Verified by Visa": let the label do its job

#### 6. Data handling transparency
In Settings, add a "Your data" section with three lines:
- "Bank data: read only, never stored on our servers"
- "Personal data: encrypted, GDPR compliant"
- "Donation data: shared only with your selected charities for tax receipts"

This pre empts the questions users have but may never ask. Proactive transparency builds more trust than reactive reassurance.

#### 7. Receipt and audit trail
On the Tax Dashboard, the "Tax Package" section should feel official. Add:
- A small "Generated on [date]" timestamp on each document
- A "Verified" badge next to the CERFA 11580 document
- A brief note: "These documents are accepted by French tax authorities"

The psychological weight of an official looking document section signals that RoundUp is a serious financial tool, not a toy.

#### 8. Error handling as trust
When something fails (API error, save failure), never show a generic "Something went wrong." Instead:
- Show what happened: "Could not save your allocation"
- Show what was preserved: "Your previous allocation is still active"
- Show what to do: "Try again or contact support"

Users forgive errors quickly when they understand them. Users lose trust permanently when they feel confused.

---

## 6. Summary: Top 10 Actions, Ranked by Impact

| Rank | Action | Screen | Effort |
|---|---|---|---|
| 1 | Replace loading spinners with skeleton screens across all pages | All | Medium |
| 2 | Add delta indicators and trajectory context to the dashboard hero number | Dashboard | Low |
| 3 | Merge jurisdiction and income into one onboarding step; reorder flow to front load emotion | Onboarding | Medium |
| 4 | Add "Your impact" rotating card to dashboard with concrete outcome statements | Dashboard | Medium |
| 5 | Show real time EUR equivalent on the allocation slider as it moves | Charity Detail | Low |
| 6 | Add a projection visualisation (actual + projected line) to the Tax Dashboard | Tax | Medium |
| 7 | Add reassurance copy and trust strip to bank connection step | Onboarding | Low |
| 8 | Remove confetti from tax preview; reserve celebrations for real milestones | Onboarding | Low |
| 9 | Add a 7 day mini bar chart to the "This week" dashboard card | Dashboard | Medium |
| 10 | Add "Where your money goes" transparency bar to charity detail | Charity Detail | Medium |

---

*Report prepared for the RoundUp product team. All recommendations are based on published UX research, competitive analysis of Revolut, Monzo, Cash App, and Daffy, and a detailed audit of the current codebase.*

## Sources
- [Fintech UX Best Practices 2026: Build Trust & Simplicity (Eleken)](https://www.eleken.co/blog-posts/fintech-ux-best-practices)
- [Top 10 Fintech UX Design Practices Every Team Needs in 2026 (Onething Design)](https://www.onething.design/post/top-10-fintech-ux-design-practices-2026)
- [How fintech brands like Revolut and Monzo use UX to build trust (KOTA)](https://kota.co.uk/blog/how-fintech-brands-like-revolut-and-monzo-use-ux-to-build-trust)
- [Mobile Banking App Design: UX & UI Best Practices for 2026 (Purrweb)](https://www.purrweb.com/blog/banking-app-design/)
- [The Psychology of Giving: How Design Influences Donor Behavior (Holy Shift)](https://holyshift.studio/the-psychology-of-giving-how-design-influences-donor-behavior/)
- [UX & Design Principles to Maximise Charitable Donations (Frank Digital)](https://medium.com/frank-digital/ux-design-principles-to-maximise-charitable-donations-and-regular-giving-59d2f5a48ac8)
- [Engage, Trust, Donate: UX Tips for Enhancing Online Donations (Fluent)](https://this.isfluent.com/blog/2024/engage-trust-donate-ux-strategies-for-effective-online-donations)
- [Fintech Onboarding: 6 UX Practices That Reduce Drop Off (Eleken)](https://www.eleken.co/blog-posts/fintech-onboarding-simplification)
- [Mastering Fintech App Onboarding With 8 Best Practices (CleverTap)](https://clevertap.com/blog/onboarding-fintech-app-users/)
- [Fintech Onboarding: 13 Best Practices for Customer Success (UserPilot)](https://userpilot.com/blog/fintech-onboarding/)
- [6 Ways to Reduce Onboarding Drop-offs for Fintech Apps (Netcore)](https://netcorecloud.com/blog/reduce-onboarding-drop-off-for-fintech/)
- [UI/UX Evolution 2026: Micro Interactions & Motion (Primotech)](https://primotech.com/ui-ux-evolution-2026-why-micro-interactions-and-motion-matter-more-than-ever/)
- [Micro Interactions: The Secret Sauce to Exceptional UX in 2025 (InApp)](https://inapp.com/blog/micro-interactions-the-secret-sauce-to-exceptional-user-experiences-in-2025/)
- [Motion UI Trends 2025: Micro Interactions That Elevate UX (Beta Soft)](https://www.betasofttechnology.com/motion-ui-trends-and-micro-interactions/)
- [Top 7 Tips for Effective FinTech App Security Design in 2025 (ProCreator)](https://procreator.design/blog/top-tips-for-fintech-app-security-design/)
- [Fintech UX Design: Patterns That Build Trust and Credibility (Phenomenon)](https://phenomenonstudio.com/article/fintech-ux-design-patterns-that-build-trust-and-credibility/)
- [Goal Gradient Effect (Laws of UX)](https://lawsofux.com/goal-gradient-effect/)
- [The Goal Gradient Effect: Boosting User Engagement (LogRocket)](https://blog.logrocket.com/ux-design/goal-gradient-effect/)
- [Daffy 2025 Year in Review: A Top 10 Donor Advised Fund](https://www.daffy.org/resources/year-in-review-2025)
- [Cash App Fall Release 2025](https://cash.app/new)
