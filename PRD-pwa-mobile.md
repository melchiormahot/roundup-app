# RoundUp: PWA + Native Mobile Feel PRD

## Context
The web app works but feels like a website, not an app. This PRD transforms it into a Progressive Web App that feels indistinguishable from a native mobile app when installed on the home screen. Every interaction should feel immediate, tactile, and polished.

---

## Task List

### PWA Foundation
- [ ] Create `public/manifest.json` with: name "RoundUp", short_name "RoundUp", description, start_url "/dashboard", display "standalone", background_color "#060e1a", theme_color "#0b1628", orientation "portrait"
- [ ] Add app icons in all required sizes: 72, 96, 128, 144, 152, 192, 384, 512px. Use the "R" logo from onboarding in the Deep Navy palette with green gradient accent.
- [ ] Create a maskable icon variant (with safe zone padding) for Android adaptive icons
- [ ] Add Apple-specific meta tags: apple-mobile-web-app-capable, apple-mobile-web-app-status-bar-style "black-translucent", apple-touch-icon
- [ ] Create a splash screen for iOS: apple-touch-startup-image for common device sizes (iPhone SE, iPhone 14, iPhone 15 Pro, iPad)
- [ ] Link manifest in the root layout `<head>`

### Service Worker
- [ ] Create a service worker using next-pwa or a custom implementation
- [ ] Cache strategy: app shell (HTML, CSS, JS) cached on install for instant loading
- [ ] Cache charity data and user profile for offline access
- [ ] Cache the last viewed dashboard state so the app opens instantly even offline
- [ ] Network-first for API calls (fresh data when online, cached when offline)
- [ ] Show a subtle "You're offline" banner when connectivity is lost (not a full error page)
- [ ] When back online, sync any queued actions and dismiss the banner
- [ ] Background sync: if the user changes allocation while offline, sync when connection returns

### Install Prompt
- [ ] Custom "Add to Home Screen" banner: appears after the user has visited 3+ times or spent 2+ minutes in the app
- [ ] Banner design: subtle bottom sheet with app icon, "Install RoundUp for the best experience", "Install" button (primary), "Not now" (dismiss)
- [ ] Once dismissed, don't show again for 30 days (store in localStorage)
- [ ] On iOS (where there's no native install prompt): show a manual instruction card "Tap the share button, then 'Add to Home Screen'" with a screenshot/illustration
- [ ] Track install events in the database for admin analytics

### Standalone App Experience
- [ ] When opened from home screen (display: standalone): hide the browser URL bar
- [ ] Status bar should blend with the app background (black-translucent on iOS, theme_color on Android)
- [ ] Handle the "notch" and Dynamic Island: content should flow under the status bar with proper safe-area-inset-top padding
- [ ] The bottom nav should respect safe-area-inset-bottom
- [ ] Disable pull-to-refresh on the browser level (overscroll-behavior: none on html) and implement custom pull-to-refresh on specific pages
- [ ] Prevent text selection on interactive elements (user-select: none on buttons, cards, tabs)
- [ ] Prevent image dragging
- [ ] Handle the back gesture: swipe from left edge should navigate back (not exit the app)

### Gesture Navigation
- [ ] Swipe left/right between bottom nav tabs: swiping right on Home goes to Charities, swiping right again goes to Tax, etc.
- [ ] The transition should feel like iOS tab swiping: the current page slides out, the new page slides in, matching the swipe direction
- [ ] Use Framer Motion's `useDragControls` or a touch event handler with velocity detection
- [ ] Threshold: 30% of screen width or velocity > 500px/s to trigger tab switch
- [ ] The bottom nav active indicator should animate smoothly as you swipe (not jump)
- [ ] Swipe down on the dashboard to pull-to-refresh (custom implementation with a spinner that pulls down from the top)
- [ ] Swipe down on charity detail to dismiss (like a bottom sheet being pulled down)

### Haptic Feedback Patterns
- [ ] Use the Vibration API (`navigator.vibrate`) for tactile feedback on key interactions:
  - Light tap (10ms): tapping a card, selecting a category filter, toggling a switch
  - Medium tap (20ms): saving allocation, confirming an action
  - Success pattern (10ms, pause 50ms, 10ms): completing onboarding, hitting a milestone
  - Error pattern (30ms, pause 30ms, 30ms): form validation error
- [ ] Only trigger haptics if the device supports it and the user hasn't disabled it
- [ ] Add a "Haptic feedback" toggle in Settings (on by default)
- [ ] Wrap all haptic calls in a utility function `haptic('light' | 'medium' | 'success' | 'error')`

### Transition Animations
- [ ] Page transitions should be directional: navigating "forward" (deeper into the app, e.g., charity list → charity detail) slides the new page in from the right
- [ ] Navigating "back" slides the current page out to the right, revealing the previous page
- [ ] Tab switching should slide in the direction of the tab (tab 1 to tab 3 slides left, tab 3 to tab 1 slides right)
- [ ] The transition duration should be 250ms with a spring ease (not linear)
- [ ] Shared element transitions where possible: when tapping a charity card, the card icon should "morph" into the detail page header icon (use Framer Motion's layoutId)
- [ ] Loading states between pages: if data isn't cached, show a skeleton that matches the incoming page layout

### Pull-to-Refresh
- [ ] Implement custom pull-to-refresh on: Dashboard, Charities list, Notifications
- [ ] Pull indicator: a small circle at the top that rotates as you pull, using the accent-blue colour
- [ ] Threshold: 80px pull distance to trigger refresh
- [ ] On release: indicator snaps to loading position, data refreshes, indicator dismisses
- [ ] Overscroll effect: the page should have a subtle elastic overscroll at the top (rubber band effect) before the pull indicator appears
- [ ] During refresh: show a brief skeleton flash on the refreshed data, then animate the new values in

### Bottom Sheet Pattern
- [ ] Convert charity detail from full-page navigation to a bottom sheet overlay
- [ ] Three snap points: peek (40vh, shows name + mission), half (65vh, adds impact + "how your money helps"), full (92vh, adds slider + save button)
- [ ] Drag handle: 4px tall, 36px wide, centered, bg-navy-500, rounded-full
- [ ] Backdrop: bg-navy-900/60 with backdrop-blur-sm, tap to dismiss
- [ ] Sheet opens with a spring animation from bottom
- [ ] Sheet can be dragged between snap points and dismissed by dragging below peek
- [ ] Use the vaul library (by Emil Kowalski) or implement with Framer Motion
- [ ] When sheet is at full, the drag handle area should show a subtle "drag to close" affordance

### Offline Support
- [ ] Dashboard should work fully offline with cached data (show "last updated X minutes ago")
- [ ] Charity profiles should be readable offline (text content cached)
- [ ] Notifications list should show cached notifications offline
- [ ] Settings should work offline
- [ ] Tax dashboard should work with cached calculations
- [ ] Actions that require network (simulation, save allocation, sign up) should queue and show "Will sync when online"
- [ ] Add a NetworkStatus component that shows a coloured bar: green (online), yellow (slow connection), red (offline)

### Performance Optimisation
- [ ] Target: app should load in under 1 second from home screen (cached)
- [ ] Target: page transitions under 100ms
- [ ] Target: Time to Interactive under 2 seconds on first visit
- [ ] Lazy load all routes except dashboard (the home screen)
- [ ] Preload the next likely route: on dashboard, preload charities; on charities list, preload the first charity detail
- [ ] Use dynamic imports for heavy components (PDF renderer, chart library)
- [ ] Optimise images: all icons should be SVG, not PNG
- [ ] Add `loading="lazy"` to any images below the fold

---

## Iteration Rounds

### Iteration 1: Install and Launch
- [ ] Test the full install flow on iOS Safari: tap share > Add to Home Screen > verify icon, splash screen, standalone mode
- [ ] Test on Android Chrome: verify the install prompt appears, verify the installed app opens correctly
- [ ] Verify the app works in standalone mode: no URL bar, correct status bar colour, safe areas respected
- [ ] Verify the service worker caches correctly: load the app, go offline, reload. The app should still work.
- [ ] Verify the "You're offline" banner appears and dismisses correctly

### Iteration 2: Gestures and Haptics
- [ ] Test swipe navigation between all 5 tabs. Each direction should feel smooth and match the tab position.
- [ ] Test pull-to-refresh on dashboard, charities, notifications. Should feel like iOS native pull-to-refresh.
- [ ] Test haptic feedback on a real device (iPhone or Android). Should feel subtle, not aggressive.
- [ ] Test the bottom sheet for charity detail: peek, half, and full snap points. Dragging should feel fluid.
- [ ] Test that swipe-to-go-back (left edge gesture) works correctly and doesn't conflict with tab swiping
- [ ] Verify all transitions respect prefers-reduced-motion

### Iteration 3: Offline and Performance
- [ ] Disconnect from wifi, use the app for 5 minutes. Everything except simulation and login should work.
- [ ] Reconnect: verify queued actions sync correctly
- [ ] Measure load time from home screen icon tap to interactive dashboard (target: under 1 second)
- [ ] Measure page transition time (target: under 100ms)
- [ ] Run Lighthouse PWA audit: target 90+ score
- [ ] Verify no layout shift on any page (CLS score 0)

### Iteration 4: Final Polish
- [ ] Test on iPhone SE (smallest screen): everything should work at 320px width
- [ ] Test on iPad: the app should work (not break), even if optimised for phone
- [ ] Test the install prompt: appears at the right time, dismisses correctly, doesn't reappear too soon
- [ ] Verify the splash screen matches the app (same background colour, same logo)
- [ ] Test landscape mode: the app should lock to portrait or handle landscape gracefully
- [ ] Commit with message "PWA complete: installable, offline-capable, native-feeling"

---

## Technical Notes
- Use next-pwa package for service worker generation, or implement manually with workbox
- Service worker should be registered in the root layout
- The manifest.json must be in the public directory
- Test on real devices, not just browser DevTools mobile emulation
- Haptic feedback via navigator.vibrate() is not available on iOS Safari; use CSS touch feedback as fallback
- Bottom sheet: vaul (https://vaul.emilkowal.ski/) is the recommended library for web bottom sheets
