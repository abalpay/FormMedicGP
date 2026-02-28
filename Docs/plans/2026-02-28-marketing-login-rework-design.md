# Marketing Page & Login Page Rework Design

**Date:** 2026-02-28
**Direction:** Modern SaaS ("Refined Depth") — Linear/Stripe aesthetic
**Palette:** Existing teal/amber, elevated with layering and depth

## Marketing Page

### Navbar
- Increase padding, soften glassmorphism
- Add subtle shadow to "Get Started" CTA

### Hero
- Soften gradient-teal background with more depth
- Tighten headline, improve font weight contrast
- Right side: realistic browser-frame mock-up showing dictation session (waveform, transcript, partially-filled form) — pure component, no image
- Reduce vertical padding

### Features ("Built for clinicians")
- Wrap each feature in subtle card with light border + hover elevation
- Keep 2x2 grid, add card containers
- Larger icons in rounded containers
- Subtle section background tint

### How It Works
- Larger step icons, bolder step numbers
- Visible connecting progress line
- Each step gets subtle card treatment

### Form Library
- Better card shadows and badge positioning
- Remove or replace "More forms coming" placeholder

### Privacy
- Fix low-contrast text
- Larger icons with background circles
- Subtle grid/pattern overlay for depth

### FAQ
- Full-width accordion (drop asymmetric layout)

### Final CTA
- Larger typography, stronger visual contrast
- Add testimonial or stat above buttons

### Footer
- Consistent spacing cleanup

## Login Page

### Left Panel
- Add testimonial quote (placeholder clinician)
- Add 2-3 micro-stats ("500+ forms completed", "2 min average", "5 form types")
- Subtle animated pattern for visual interest
- Improve headline typography

### Right Panel
- Softer card treatment
- Better input focus styling from design system
- Remove "Captured screenshot" dev artifact
- Consistent button styling via design tokens

## Code Quality (bundled)
- Extract marketing page into sub-components (Hero, Features, HowItWorks, FormLibrary, Privacy, FAQ, CTA, Footer)
- Replace hardcoded oklch with CSS custom properties
- Add Button variants (`gradient-teal`, `gradient-amber`)
- Extract GoogleIcon component
