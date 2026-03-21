# RoundUp: Dark/Light Mode + Theming PRD

## Context
The app currently only has the Deep Navy dark theme. This PRD adds a polished light mode, system preference detection, smooth transitions between modes, and ensures every screen looks premium in both. Light mode makes the app accessible to users who find dark UIs hard to read or prefer light interfaces during the day.

---

## Task List

### Theme Architecture
- [x] Create a theme system using CSS custom properties (variables) that switch between dark and light values
- [x] All colour references throughout the app must use CSS variables, never hardcoded hex values
- [x] Theme preference stored in: 1) user setting in database, 2) localStorage for instant load, 3) falls back to system preference
- [x] Priority order: user explicit choice > localStorage cache > system prefers-color-scheme > default dark
- [x] Create a ThemeProvider context that wraps the app and provides `theme`, `setTheme`, and `toggleTheme`
- [x] Theme options: "Dark", "Light", "System" (follows OS setting)

### Dark Mode Palette (existing, codified)
- [x] Ensure all current colours are defined as CSS variables in `:root[data-theme="dark"]`:
  - `--bg-primary`: #060e1a
  - `--bg-secondary`: #0b1628
  - `--bg-card`: #0f1f38
  - `--bg-card-inner`: rgba(21, 42, 74, 0.2)
  - `--border-primary`: #1a3050
  - `--border-secondary`: #152a4a
  - `--text-primary`: #d0dff0
  - `--text-secondary`: #7a9cc6
  - `--text-dim`: #3d5a80
  - `--accent-green`: #5ce0b8
  - `--accent-blue`: #4a9eff
  - `--accent-purple`: #b48eff
  - `--accent-red`: #ff6b6b
  - `--accent-yellow`: #ffd93d
  - `--accent-orange`: #ff9a76
  - `--progress-track`: #0d1f35
  - `--nav-bg`: rgba(10, 18, 32, 0.92)
  - `--toast-bg`: rgba(21, 42, 74, 0.95)
  - `--shadow`: rgba(0, 0, 0, 0.3)

### Light Mode Palette (new)
- [x] Design a premium light palette in `:root[data-theme="light"]`:
  - `--bg-primary`: #f5f7fa (warm grey, not pure white)
  - `--bg-secondary`: #ffffff
  - `--bg-card`: #ffffff
  - `--bg-card-inner`: #f0f2f5
  - `--border-primary`: #e2e6ec
  - `--border-secondary`: #d0d5dc
  - `--text-primary`: #1a1f2e
  - `--text-secondary`: #5a6578
  - `--text-dim`: #9aa3b2
  - `--accent-green`: #0da678 (darker green for contrast on white)
  - `--accent-blue`: #2563eb (darker blue for contrast on white)
  - `--accent-purple`: #7c3aed (darker purple)
  - `--accent-red`: #dc2626 (darker red)
  - `--accent-yellow`: #d97706 (amber, not bright yellow on white)
  - `--accent-orange`: #ea580c (darker orange)
  - `--progress-track`: #e5e7eb
  - `--nav-bg`: rgba(255, 255, 255, 0.92)
  - `--toast-bg`: rgba(255, 255, 255, 0.95)
  - `--shadow`: rgba(0, 0, 0, 0.08)
- [x] All accent colours in light mode must pass WCAG AA contrast on white backgrounds
- [x] Light mode should feel warm and clean, not sterile. Think "premium fintech in daylight" not "generic white app".

### Migrate All Components to CSS Variables
- [x] Audit every component and page for hardcoded colour values
- [x] Replace all `bg-navy-*`, `text-text-*`, `border-navy-*`, `text-accent-*` Tailwind classes with CSS variable equivalents
- [x] Options for implementation:
  - Option A: Extend Tailwind config to reference CSS variables (e.g., `bg-theme-primary` maps to `var(--bg-primary)`)
  - Option B: Use inline styles with CSS variables where Tailwind classes can't reference variables
  - Prefer Option A for consistency
- [x] Components to migrate: Card, Badge, ProgressBar, Button, Toggle, Toast, BottomNav, AnimatedNumber, all page layouts
- [x] Verify: no component should render differently after migration while still in dark mode

### Theme Toggle UI
- [x] Add a "Theme" section in Settings page, above the existing notification toggles
- [x] Three-option segmented control: Dark | Light | System
  - Dark: moon icon
  - Light: sun icon
  - System: laptop/auto icon
- [x] When "System" is selected, show a note: "Follows your device settings"
- [x] The toggle itself should look good in both themes
- [x] Persist the choice to the database (for cross-device consistency) and localStorage (for instant load)

### Smooth Theme Transition
- [x] When switching themes, add a CSS transition on background-color, color, and border-color: `transition: background-color 0.3s ease, color 0.2s ease, border-color 0.3s ease`
- [x] Apply this transition to: body, cards, nav, inputs, buttons
- [x] Do NOT transition: text content, icons, images (these should switch instantly)
- [x] The transition should feel smooth, not flashy. Like dimming the lights, not flipping a switch.
- [x] On page load: apply the theme instantly (no transition) to avoid a flash. Only transition when the user actively toggles.
- [x] Prevent the "flash of wrong theme" on load: set data-theme on the `<html>` element via a blocking `<script>` in the `<head>` that reads localStorage before anything renders

### Light Mode: Screen-by-Screen Verification
- [x] **Landing page**: hero gradient should use a soft blue-to-white gradient (not the dark navy gradient). Phone mockup should show the dark mode dashboard (the app is dark by default, even on a light landing page). All text must be readable.
- [x] **Login/Signup**: card should have a subtle shadow on white, not a border on dark. Input fields should have light grey backgrounds, not dark navy.
- [x] **Onboarding**: step cards should use white cards with subtle borders. The "aha" moment confetti should use the same colours (they pop on both backgrounds). Country and bracket selectors should use light card styles.
- [x] **Dashboard**: the donation total should use the darker green (#0da678) to pop on white. Progress bars should have light grey tracks. Cards should have subtle shadows instead of borders. The crisis banner should use a light red/pink tint background.
- [x] **Charities list**: category pills should use the darker accent colours. Charity cards should have subtle shadows. Search bar should have a light grey background.
- [x] **Charity detail**: the brand colour gradient at the top should be lighter and softer. Certification badges should be readable on white. The allocation slider track should be light grey.
- [x] **Tax dashboard**: blue numbers on white need the darker blue (#2563eb). Progress bar tracks in light grey. The projection card should have a subtle green tint background.
- [x] **Notifications**: notification type dots should use the darker accent colours. Read notifications should use a lighter background, not opacity reduction.
- [x] **Settings**: toggle on-state should use the darker green. Card sections should have subtle borders or shadows. The referral code should be in a lightly tinted card.
- [x] **Admin dashboard**: admin pages should also support light mode. Charts should use the light mode accent colours. The sidebar should be white with a subtle left border.
- [x] **Bottom nav**: frosted glass should be white with transparency. Active tab icon should use darker blue. Notification dot should use darker red.

### Charts in Light Mode
- [x] Recharts (admin dashboard) must adapt to theme:
  - Grid lines: #e5e7eb in light mode (subtle grey)
  - Axis labels: #5a6578 in light mode
  - Tooltip background: white with subtle shadow
  - Data colours: use the darker light mode accent colours
- [x] Create a `useChartTheme()` hook that returns the correct chart colours based on current theme

### PDF Adaptation
- [x] PDFs should always use a light/print-friendly colour scheme regardless of app theme (standard for documents)
- [x] No changes needed if PDFs already use a light palette
- [x] If PDFs currently use dark colours, switch to black text on white background

### System Preference Detection
- [x] Listen for `prefers-color-scheme` changes with `matchMedia('(prefers-color-scheme: dark)')`
- [x] When the user has selected "System" mode, switching between dark/light on their device should immediately switch the app
- [x] Test: on macOS, going to System Settings > Appearance > Light should switch the app if "System" is selected

### Meta Tags and Browser Chrome
- [x] Update `theme-color` meta tag dynamically based on current theme:
  - Dark: `<meta name="theme-color" content="#0b1628">`
  - Light: `<meta name="theme-color" content="#ffffff">`
- [x] This affects the browser address bar colour on mobile and the PWA title bar

---

## Iteration Rounds

### Iteration 1: Colour Contrast Audit (Light Mode)
- [x] Check every text/background combination in light mode against WCAG AA (4.5:1 for normal text, 3:1 for large text)
- [x] Pay special attention to: accent colours on white (green, blue, purple all need darker variants), secondary text on white, placeholder text in inputs
- [x] Fix any failing combinations by adjusting the light mode palette
- [x] Verify all certification badges and status indicators are readable in light mode
- [x] Verify progress bar fills are visible against light grey tracks

### Iteration 2: Visual Polish
- [x] In light mode, cards should use subtle shadows (box-shadow: 0 1px 3px rgba(0,0,0,0.08)) instead of relying solely on borders
- [x] The overall feel should be "Apple-like": clean, warm white, with precision and restraint
- [x] Verify no component looks "unfinished" or "broken" in light mode (common issue: dark mode elements that forgot to switch)
- [x] Check all icons and emojis are visible in both modes
- [x] The theme transition animation should feel elegant, not jarring
- [x] Test: switch back and forth rapidly. No flickering, no stuck states.

### Iteration 3: Edge Cases
- [x] User opens the app in dark mode, changes to light mode, refreshes. Light mode should persist.
- [x] User has system set to dark, app set to "System". At sunset, their OS switches to dark. The app should follow.
- [x] User logs in on a new device. Their theme preference from the database should apply.
- [x] What happens if localStorage says "dark" but database says "light"? Database wins (more recent intent).
- [x] What if JavaScript is slow to load? The blocking script in `<head>` should prevent any flash.
- [x] Verify the landing page works correctly in both modes (it's public, pre-auth)

### Iteration 4: Final Review
- [x] Screenshot every screen in dark mode. Screenshot every screen in light mode. Compare side by side.
- [x] Both versions should feel like a premium, intentionally designed product. Light mode should NOT feel like an afterthought.
- [x] Test on a real phone in bright sunlight: is light mode readable outdoors?
- [x] Test on a real phone in a dark room: is dark mode comfortable without eye strain?
- [x] Run Lighthouse accessibility audit in both modes
- [x] Commit with message "Dark and light mode complete with system preference detection"

---

## Design Philosophy
- Dark mode is the "signature" look. It's what appears in marketing, landing page mockups, and app store screenshots.
- Light mode is the "accessible alternative" for users who prefer it or need it. It should feel equally premium, not like a downgrade.
- The theme system should be invisible to the user: it just works, it remembers their choice, and it transitions smoothly.
- No screen should be designed "dark first, light later." Both must be considered simultaneously from this point forward.
