# RoundUp: Landing Page PRD

## Context
The app needs a public-facing landing page at the root URL (before login). This is what people see when you share the link. It should explain the product, build trust, and capture early interest. The landing page should feel like a premium fintech product launch, not a startup template.

**This is the front door of the business.** First impressions determine whether someone signs up or leaves. Every section must earn its place.

---

## Task List

### Page Structure
- [ ] Landing page at `/` route (public, no auth required)
- [ ] Authenticated users who visit `/` should be redirected to `/dashboard`
- [ ] Sticky top navigation bar: Logo (left), section links (centre: How It Works, Tax Calculator, Charities, FAQ), "Sign Up" button (right). Transparent on hero, solid navy on scroll.
- [ ] Smooth scroll navigation between sections
- [ ] Mobile responsive (375px to 1440px) with hamburger menu on mobile
- [ ] Deep Navy palette consistent with the app, but with more visual flair (gradients, glows, depth)
- [ ] Page load time under 2 seconds: lazy load images, defer non-critical scripts

### Hero Section
- [ ] Large headline: "Every purchase you make can change the world"
- [ ] Subheadline: "RoundUp rounds your transactions to the nearest euro and donates the spare change to charities you choose. You get a tax deduction. They get help."
- [ ] Two CTA buttons: "Get Started" (primary, links to /signup) and "See How It Works" (secondary, scrolls to explainer)
- [ ] Animated phone mockup showing the dashboard with numbers counting up (reuse the Deep Navy app screen style). The phone should be a realistic iPhone frame with the actual dashboard inside, not a screenshot.
- [ ] Subtle gradient orb animation in the background: two large soft circles (green and blue at low opacity) slowly drifting. Atmospheric, not distracting.
- [ ] Floating micro-stat badges around the phone mockup: "€247 donated", "3 charities", "€185 saved in taxes" appearing with staggered delays

### How It Works Section
- [ ] Section heading: "Three steps. Two minutes. One lasting impact."
- [ ] Three-step visual explainer with large numbered circles and animated icons:
  - Step 1: "Shop normally" with animated card tap icon. "Pay with any card or Apple Pay. We detect every transaction through your bank, read-only."
  - Step 2: "We round up the change" with animated coin dropping icon. "€4.30 becomes €5.00. The €0.70 goes to charities you chose. Accumulated weekly."
  - Step 3: "Save on taxes" with animated document appearing icon. "Track your deduction in real time. Download your tax package in January. Hand it to your accountant."
- [ ] Each step animates in on scroll (fade up, staggered, 200ms between each)
- [ ] Below the 3 steps: animated flow diagram showing a purchase (coffee cup) flowing through a round-up calculation to a charity icon to a tax document. One continuous horizontal animation.
- [ ] "It really is that simple" text below the diagram, with a "Get Started" CTA

### Live Demo Section (NEW)
- [ ] Section heading: "Try it yourself"
- [ ] An interactive mini-demo embedded in the page: a simulated coffee purchase
  - Show a mock card terminal: "Coffee at Paul: €3.70"
  - User taps "Pay" button
  - Animation: €3.70 rounds up to €4.00
  - The €0.30 visually flows to a charity card (MSF)
  - A mini notification appears: "+€0.30 to Médecins Sans Frontières"
  - A mini progress bar ticks up slightly
  - Text: "That's it. You just donated without even thinking about it."
- [ ] This should be a self-contained interactive component, not a video
- [ ] "Sign up to start for real" CTA below

### Tax Benefit Calculator (Interactive)
- [ ] Section heading: "See what giving really costs you"
- [ ] Subheading: "Spoiler: much less than you think."
- [ ] Country selector as flag pills (not dropdown): 🇫🇷 France, 🇬🇧 UK, 🇩🇪 Germany, 🇧🇪 Belgium, 🇪🇸 Spain. Tappable, France selected by default.
- [ ] Income bracket selector as horizontal segmented control (not dropdown)
- [ ] On selection, animate three results simultaneously:
  - Left card: "You donate" with the maximum deductible amount (large, green)
  - Centre card: "Government gives back" with the tax credit amount (large, blue)
  - Right card: "Real cost to you" with the net cost (large, purple, smaller number)
- [ ] Below the cards: "A €10 monthly donation costs you just €3.40" with a visual breakdown bar (€3.40 you pay, €6.60 the government pays, different colours)
- [ ] "That €3.40 provides 4 emergency meals through Restos du Coeur" connecting the tax benefit to real impact
- [ ] CTA: "Start saving" linking to signup
- [ ] Small print: "Tax rules as of 2026. Actual savings depend on your tax situation."

### Charity Showcase
- [ ] Section heading: "We did the research. You just pick."
- [ ] Subheading: "Six organisations chosen for trust, transparency, and impact. Every one independently verified."
- [ ] Grid layout (3x2 on desktop, 2x3 on tablet, 1 column on mobile) not horizontal scroll
- [ ] Each charity card is substantial (not a thumbnail):
  - Charity brand colour accent bar at top
  - Large icon/emoji
  - Name and category
  - Don en Confiance badge (or equivalent quality label)
  - One-sentence mission statement (always visible, not on hover)
  - One headline impact stat: "11.2M patients treated in 2024" or "140M meals served in 2025"
  - Tax rate badge: "75% deductible" or "66% deductible"
- [ ] Below the grid: "Why only six? Because we believe in quality over quantity. Every charity is reviewed for financial transparency, operational efficiency, and real-world impact. We'd rather you trust completely than choose from thousands."
- [ ] "See full profiles in the app" CTA

### The RoundUp Difference (NEW, replaces generic Feature Highlights)
- [ ] Section heading: "What makes RoundUp different"
- [ ] Side-by-side comparison: "Without RoundUp" vs "With RoundUp"
  - Without: "You think about donating... maybe later. You forget. Year ends. No tax deduction."
  - With: "You buy coffee. €0.70 goes to MSF. You check your phone: €185 in tax savings so far. In January, your PDF is ready."
- [ ] Then 4 feature blocks (not 6, keep it focused), each with an illustration or mockup:
  - **"Your tax ceiling, tracked"**: mockup of the progress bar. "Know exactly where you stand. Never miss a deduction."
  - **"Crisis response in one tap"**: mockup of the crisis banner. "When disaster strikes, redirect your round-ups to emergency relief instantly."
  - **"Real impact, not receipts"**: mockup of the impact card. "See exactly what your €0.70 funded. Not a transaction line, a result."
  - **"Year-end, sorted"**: mockup of the PDF download. "Three PDFs, pre-filled, ready for your accountant. The friction is gone."
- [ ] Each block alternates layout: image left/text right, then text left/image right

### Numbers That Matter (NEW)
- [ ] Section heading: "The numbers speak"
- [ ] Three large animated counters (count up on scroll):
  - "€2,000": "Maximum annual deduction under Loi Coluche"
  - "75%": "Tax reduction on eligible donations in France"
  - "2 min": "Average setup time from download to first round-up"
- [ ] Below: "And the number that matters most: €0. That's what it costs to start."

### Social Proof Section
- [ ] Section heading: "People like you, already giving"
- [ ] Three testimonial cards with photos (placeholder avatar circles with initials), realistic quotes:
  - "I donated €400 last year without even thinking about it. The tax PDF saved me hours with my accountant." Sophie M., 28, Paris
  - "Finally an app that makes giving as easy as buying coffee. The charity profiles helped me discover causes I actually care about." Thomas L., 34, Lyon
  - "I set it up in 2 minutes and forgot about it. Best financial decision I made this year." Marie D., 41, Bordeaux
- [ ] Counters row below testimonials (simulated but realistic):
  - "12,400+ users"
  - "€2.4M donated"
  - "6 verified charities"
  - "4.8★ average rating"
- [ ] Charity partner logos: the 6 charity icons in a horizontal row, greyscale, with "Supported organisations" label

### FAQ Section (NEW)
- [ ] Section heading: "Questions you might have"
- [ ] Accordion-style expandable questions (click to reveal answer):
  - "How does RoundUp access my transactions?" Answer: explains Open Banking, read-only, PSD2 compliant, never sees credentials
  - "Is my money safe?" Answer: explains SEPA mandate, weekly batches, cancel anytime, never stores card details
  - "How does the tax deduction work?" Answer: brief explanation per jurisdiction, link to tax dashboard in app
  - "Which charities can I choose?" Answer: explains the curation philosophy, Don en Confiance, link to charity profiles
  - "What if I want to stop?" Answer: cancel anytime, no fees, no lock-in, your donation history and PDFs remain accessible
  - "How much does RoundUp cost?" Answer: "Free during early access. We're exploring a small monthly subscription or optional tip model. Your donations always go 100% to charities."
  - "Can I donate more than just round-ups?" Answer: "Not yet, but it's coming. For now, round-ups are the core experience."
  - "Is RoundUp available in my country?" Answer: lists the 5 supported countries, mentions expansion plans
- [ ] Each answer is concise (2 to 3 sentences max)
- [ ] "Still have questions?" with email link

### Final CTA Section
- [ ] Full-width gradient background section (green to blue, subtle)
- [ ] Large heading: "Start giving today. It takes 2 minutes."
- [ ] Subtext: "No commitment. Cancel anytime. Your first week of round-ups is on us."
- [ ] Two options side by side:
  - Left: Email input + "Get Early Access" button (for people not ready to sign up)
  - Right: "Create Account" button (for people ready to go)
- [ ] Below: small trust badges: "🔒 Bank-grade encryption", "🇪🇺 GDPR compliant", "✓ Don en Confiance partners"
- [ ] "Questions? hello@roundup-app.com"

### Footer
- [ ] Three-column layout:
  - Column 1: RoundUp logo + "Donate effortlessly. Save on taxes." tagline + "Made with care in Paris"
  - Column 2: Links: How It Works, Charities, Tax Calculator, FAQ, Blog (placeholder)
  - Column 3: Links: Privacy Policy, Terms of Service, Contact, Press Kit (placeholder)
- [ ] Social media icons: Twitter/X, Instagram, LinkedIn (placeholder links)
- [ ] "© 2026 RoundUp SAS. All rights reserved."
- [ ] Bottom bar: "RoundUp is not a financial advisor. Tax calculations are estimates. Consult your accountant for personalized advice."

### Technical Details
- [ ] Create an `early_access` table in the database: id, email (unique), created_at, country (optional)
- [ ] API route POST /api/early-access to capture emails with country from calculator selection
- [ ] Show toast confirmation: "You're on the list! We'll be in touch."
- [ ] Duplicate email handling: show "You're already on the list!" instead of error
- [ ] SEO: page title "RoundUp: Donate Effortlessly, Save on Taxes", meta description (160 chars), Open Graph image (1200x630 showing the app), Twitter card meta tags
- [ ] Structured data (JSON-LD): Organization schema with name, description, logo
- [ ] Canonical URL and sitemap.xml

### Animations and Polish
- [ ] Hero loads with staggered sequence: headline (0ms), subheadline (200ms), buttons (400ms), phone mockup slides up (600ms), floating badges appear (800ms+)
- [ ] Every section animates on scroll entry (fade up, 0.6s, cubic-bezier ease-out)
- [ ] Tax calculator numbers animate with count-up effect
- [ ] Live demo section has its own self-contained animation loop
- [ ] Charity cards have subtle hover lift (translateY -4px + shadow increase)
- [ ] FAQ accordion has smooth height transition (not instant show/hide)
- [ ] Counter numbers in "Numbers That Matter" count up when scrolled into view
- [ ] Parallax: hero gradient orbs move at 0.3x scroll speed
- [ ] Smooth scroll with offset for sticky nav height

---

## Iteration Rounds

### Iteration 1: Copy Refinement
- [ ] Read every heading and body text aloud. Does it sound like a human wrote it?
- [ ] Remove any words that don't earn their place. Tighten every sentence.
- [ ] Verify no dashes used as punctuation anywhere
- [ ] The tone should be: confident but not arrogant, warm but not cheesy, simple but not simplistic
- [ ] Test: could a 22-year-old AND a 50-year-old both feel spoken to?

### Iteration 2: Mobile Experience
- [ ] Test the entire page at 375px width. Every section must look intentional, not squeezed.
- [ ] The phone mockup in the hero should shrink gracefully or stack below the text
- [ ] Tax calculator should stack cards vertically on mobile
- [ ] Charity grid should be single column on mobile with full-width cards
- [ ] The comparison section ("Without/With RoundUp") should stack vertically
- [ ] FAQ should work perfectly on touch (tap to expand, no hover dependence)
- [ ] Bottom CTA email input and button should stack vertically on mobile
- [ ] Touch targets: every button and link must be at least 44px

### Iteration 3: Performance and SEO
- [ ] Lazy load all sections below the fold
- [ ] Ensure hero section renders immediately (no layout shift)
- [ ] Add alt text to every image and icon
- [ ] Verify Open Graph tags render correctly (use og:image preview tool pattern)
- [ ] Add aria-labels to interactive elements (calculator, FAQ accordion)
- [ ] Test with keyboard navigation: can you tab through the entire page?

### Iteration 4: Final Visual Review
- [ ] Screenshot every section on desktop and mobile
- [ ] Check spacing consistency: are section gaps even? Are card paddings matching?
- [ ] Check colour consistency: do all greens match? All blues? No rogue greys?
- [ ] Does the live demo section feel polished or hacky? If hacky, simplify it.
- [ ] Is there enough whitespace? The page should breathe.
- [ ] Commit with message "Landing page complete with all iterations"

---

## Copy Guidelines
- No dashes as punctuation (colons, commas, or restructure)
- Warm, confident, modern tone. Not corporate, not startup-bro.
- Short sentences. Lead with benefit, not feature.
- Address the reader as "you" not "users"
- French names for testimonials (French-first product)
- Numbers are more compelling than adjectives ("€185 saved" not "significant savings")

## Design Notes
- The landing page should feel like a natural extension of the app, not a different product
- Use the Deep Navy palette with more expressive gradients and glows on the hero
- The phone mockup should look like a real iPhone showing the actual dashboard
- Whitespace is premium. Don't crowd sections. Let each section breathe.
- Each major section should be roughly a full viewport height
- The page should tell a story from top to bottom: problem > solution > proof > action
