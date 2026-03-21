# RoundUp: Landing Page PRD

## Context
The app needs a public-facing landing page at the root URL (before login). This is what people see when you share the link. It should explain the product, build trust, and capture early interest. The landing page should feel like a premium fintech product launch, not a startup template.

---

## Task List

### Page Structure
- [ ] Landing page at `/` route (public, no auth required)
- [ ] Authenticated users who visit `/` should be redirected to `/dashboard`
- [ ] Smooth scroll navigation between sections
- [ ] Mobile responsive (375px to 1440px)
- [ ] Deep Navy palette consistent with the app, but with more visual flair (gradients, glows, depth)

### Hero Section
- [ ] Large headline: "Every purchase you make can change the world"
- [ ] Subheadline: "RoundUp rounds your transactions to the nearest euro and donates the spare change to charities you choose. You get a tax deduction. They get help."
- [ ] Two CTA buttons: "Get Started" (primary, links to /signup) and "See How It Works" (secondary, scrolls to explainer)
- [ ] Animated phone mockup showing the dashboard with numbers counting up (reuse the Deep Navy app screen style)
- [ ] Subtle particle or gradient animation in the background (not distracting, just atmospheric)

### How It Works Section
- [ ] Three-step visual explainer with icons and short descriptions:
  - Step 1: "You shop normally" with a card/phone tap icon. "Pay with any card or Apple Pay. We detect every transaction through your bank."
  - Step 2: "We round up the change" with a coin/round-up icon. "€4.30 becomes €5.00. The €0.70 goes to your chosen charities."
  - Step 3: "You save on taxes" with a document/check icon. "Track your tax deduction in real time. Download your year-end tax package in January."
- [ ] Each step should animate in on scroll (fade up, staggered)
- [ ] Optional: animated diagram showing a purchase flowing through to a charity

### Tax Benefit Calculator (Interactive)
- [ ] Heading: "See how much you could save"
- [ ] Country selector dropdown (France, UK, Germany, Belgium, Spain)
- [ ] Income bracket selector (Under €30k, €30-60k, €60-100k, €100k+)
- [ ] On selection, animate the result: "You could donate up to €X and get €Y back in tax credits"
- [ ] Show effective cost: "A €10 monthly donation only costs you €3.40 after tax"
- [ ] CTA: "Start saving" linking to signup
- [ ] Use the same tax data from the app's jurisdiction rules

### Charity Showcase
- [ ] Heading: "Trusted organisations, vetted for you"
- [ ] Horizontal scrolling row of charity cards showing the 6 curated charities
- [ ] Each card: charity icon, name, category, Don en Confiance badge
- [ ] Subtle hover/tap effect revealing one-line mission statement
- [ ] Note: "Every charity is independently verified. Quality over quantity."

### Feature Highlights
- [ ] Grid of 4 to 6 feature cards:
  - "Smart tax tracking": real-time ceiling progress, year-end PDF
  - "Crisis response": redirect round-ups to disaster relief in one tap
  - "Curated charities": only trusted, verified organisations with impact transparency
  - "Weekly insights": know exactly where your money goes, every week
  - "Zero friction": set up once, donate forever. No manual transfers.
  - "Your data, your rules": minimal data collection, jurisdiction-aware privacy
- [ ] Each card has an icon, title, and two-line description
- [ ] Cards should use the Deep Navy card style with coloured accent borders (green, blue, purple, red, yellow, orange)

### Social Proof Section
- [ ] Heading: "Join thousands giving effortlessly" (simulated for MVP)
- [ ] Three testimonial cards with fake but realistic quotes:
  - "I donated €400 last year without even thinking about it. The tax PDF saved me hours with my accountant." (Sophie, 28, Paris)
  - "Finally an app that makes giving as easy as buying coffee. The charity profiles helped me discover causes I actually care about." (Thomas, 34, Lyon)
  - "I set it up in 2 minutes and forgot about it. Best financial decision I made this year." (Marie, 41, Bordeaux)
- [ ] Star ratings or impact counters: "€2.4M donated by RoundUp users" (simulated)
- [ ] Logos row: "Charities supported by RoundUp" showing the 6 charity icons

### Final CTA Section
- [ ] Large heading: "Start giving today. It takes 2 minutes."
- [ ] Subtext: "No commitment. Cancel anytime. Your first week of round-ups is on us."
- [ ] Email input field with "Get Early Access" button (stores email in database for future use)
- [ ] Or "Create Account" button linking to signup
- [ ] Below: "Questions? hello@roundup-app.com" (placeholder)

### Footer
- [ ] Simple footer with links: About, How It Works, Charities, Privacy, Terms
- [ ] "Made with care in Paris" tagline
- [ ] Social media placeholders (icons only, no real links needed)
- [ ] Copyright: "© 2026 RoundUp SAS"

### Technical Details
- [ ] Create an `early_access` table in the database: id, email (unique), created_at
- [ ] API route POST /api/early-access to capture emails
- [ ] Show toast confirmation: "You're on the list! We'll be in touch."
- [ ] Duplicate email handling: show "You're already on the list!" instead of error
- [ ] Add basic SEO: page title "RoundUp: Donate Effortlessly, Save on Taxes", meta description, Open Graph tags for social sharing

### Animations and Polish
- [ ] Hero section loads with a staggered animation: headline, subheadline, buttons, then phone mockup
- [ ] Scroll-triggered animations for each section (fade up with Framer Motion or Intersection Observer)
- [ ] Tax calculator result should animate with the same number count-up effect used in the app
- [ ] Charity cards carousel with smooth horizontal scroll, no scrollbar visible
- [ ] Parallax effect on the hero background gradient (subtle, not nauseating)
- [ ] Smooth scroll to anchors when clicking nav links

---

## Copy Guidelines
- No dashes as punctuation (colons, commas, or restructure)
- Warm, confident, modern tone. Not corporate, not startup-bro.
- Short sentences. Lead with benefit, not feature.
- Address the reader as "you" not "users"
- French names for testimonials (this is a French-first product)

## Design Notes
- The landing page should feel like a natural extension of the app, not a different product
- Use the same Deep Navy palette but allow for more expressive gradients and glows on the hero section
- The phone mockup in the hero should look like a real iPhone showing the actual dashboard
- Whitespace is premium. Don't crowd sections.
- Each section should be a full viewport height or close to it
