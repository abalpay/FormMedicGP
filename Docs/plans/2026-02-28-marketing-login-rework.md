# Marketing & Login Page Rework Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rework the marketing landing page and login page to a polished Modern SaaS aesthetic with better visual depth, component structure, and code quality.

**Architecture:** Break the 620-line monolith marketing page into focused sub-components. Enhance the auth layout with social proof. Add proper Button variants to eliminate className duplication. Extract shared components (GoogleIcon). All changes are visual/structural — no backend or logic changes.

**Tech Stack:** Next.js App Router, Tailwind CSS v4, shadcn/ui, Lucide icons, existing OKLCH design tokens.

---

### Task 1: Add Button variants for gradient-teal and gradient-amber

**Files:**
- Modify: `src/components/ui/button.tsx`

**Step 1: Add two new Button variants**

Add `teal` and `amber` variants to the `buttonVariants` cva config:

```tsx
teal:
  "gradient-teal text-white border-0 shadow-[0_2px_12px_oklch(0.47_0.1_175/0.3)] hover:shadow-[0_4px_20px_oklch(0.47_0.1_175/0.4)] hover:opacity-95",
amber:
  "gradient-amber text-foreground border-0 shadow-[0_4px_24px_oklch(0.795_0.177_78/0.4)] hover:shadow-[0_6px_32px_oklch(0.795_0.177_78/0.5)] hover:scale-[1.02]",
```

**Step 2: Verify the app builds**

Run: `npx next build --no-lint 2>&1 | tail -5` or `npx tsc --noEmit`
Expected: No type errors

**Step 3: Commit**

```bash
git add src/components/ui/button.tsx
git commit -m "feat: add teal and amber Button variants"
```

---

### Task 2: Extract GoogleIcon shared component

**Files:**
- Create: `src/components/icons/google-icon.tsx`
- Modify: `src/app/(auth)/login/page.tsx` (lines 116-133 — replace inline SVG)
- Modify: `src/app/(auth)/register/page.tsx` (lines 120-137 — replace inline SVG)

**Step 1: Create the GoogleIcon component**

```tsx
export function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}
```

**Step 2: Update login and register pages to import GoogleIcon**

Replace the inline `<svg>` blocks with `<GoogleIcon className="w-4 h-4 mr-2" />`.

Also replace the submit Button className blobs with `variant="teal"` from Task 1:
```tsx
<Button type="submit" variant="teal" className="w-full h-11 font-semibold" ...>
```

**Step 3: Verify the app builds**

Run: `npx tsc --noEmit`
Expected: No type errors

**Step 4: Commit**

```bash
git add src/components/icons/google-icon.tsx src/app/(auth)/login/page.tsx src/app/(auth)/register/page.tsx
git commit -m "refactor: extract GoogleIcon component, use teal Button variant in auth forms"
```

---

### Task 3: Rework the marketing page — extract Navbar and Hero components

**Files:**
- Create: `src/components/marketing/navbar.tsx`
- Create: `src/components/marketing/hero.tsx`
- Modify: `src/app/(marketing)/page.tsx` (lines 95-262)
- Modify: `src/app/(marketing)/layout.tsx` (move navbar into layout)

**Step 1: Extract and enhance the Navbar**

Create `src/components/marketing/navbar.tsx` as a server component.

Enhancements vs current:
- Increase nav height from `h-16` to `h-[72px]` with slightly more generous padding
- Use `variant="teal"` for Get Started button instead of inline className
- Add a mobile menu trigger (Sheet component) for mobile nav — currently nav links are just `hidden md:flex`

**Step 2: Extract and rework the Hero**

Create `src/components/marketing/hero.tsx` as a server component.

Enhancements vs current:
- Reduce vertical padding from `py-24 sm:py-32 lg:py-40` to `py-20 sm:py-28 lg:py-36`
- Replace the floating mock card on the right with a realistic **browser-frame product mock-up**:
  - A rounded container styled as a browser window (three dots, title bar)
  - Inside: a mock of the dictation UI — a form header ("Centrelink Medical Certificate"), a waveform animation area, a transcript text area with mock text appearing, and a mini form grid showing fields being populated
  - Use subtle shadows: `shadow-2xl` + teal glow underneath
  - Slight perspective tilt using CSS transform: `perspective(1200px) rotateY(-8deg) rotateX(4deg)`
- Use `variant="amber"` for the primary CTA button instead of inline className
- Move social proof stats to badges with subtle background pills instead of plain text

**Step 3: Update the marketing layout to include Navbar**

Move the navbar to `src/app/(marketing)/layout.tsx` so it wraps all marketing pages:

```tsx
import { Navbar } from '@/components/marketing/navbar';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
```

**Step 4: Update page.tsx — remove old navbar and hero markup, import new Hero**

Replace the first ~262 lines (navbar + hero section) with `<Hero />`.

**Step 5: Verify the app builds and renders correctly**

Run: `npm run dev` and check localhost:3000 visually
Expected: Navbar and hero render with enhanced styling

**Step 6: Commit**

```bash
git add src/components/marketing/ src/app/(marketing)/
git commit -m "feat: extract and rework Navbar + Hero with product mock-up"
```

---

### Task 4: Rework Features and How It Works sections

**Files:**
- Create: `src/components/marketing/features.tsx`
- Create: `src/components/marketing/how-it-works.tsx`
- Modify: `src/app/(marketing)/page.tsx` (lines 264-372)

**Step 1: Extract and enhance the Features section**

Enhancements vs current:
- Wrap each feature in a `rounded-2xl border border-border/50 bg-card p-6` card with `hover:border-primary/20 hover:shadow-lg transition-all`
- Increase icon container to `w-14 h-14` with `rounded-xl`
- Add subtle section background: `bg-gradient-to-b from-background to-muted/30`
- Reduce section padding from `py-24 sm:py-32` to `py-20 sm:py-28`

**Step 2: Extract and enhance the How It Works section**

Enhancements vs current:
- Each step gets a subtle card: `rounded-2xl bg-card border border-border/50 p-6`
- Step numbers become larger: `text-5xl` and positioned as a watermark behind the icon
- The connecting line becomes more visible: `h-0.5 bg-gradient-to-r from-primary/20 to-primary/40` (still hidden on mobile, visible on lg)
- Icon containers stay `gradient-teal` but increase to `w-16 h-16`

**Step 3: Update page.tsx — replace Features and How It Works inline markup**

```tsx
import { Features } from '@/components/marketing/features';
import { HowItWorks } from '@/components/marketing/how-it-works';
```

**Step 4: Verify visually**

Run dev server, check both sections render properly at all breakpoints.

**Step 5: Commit**

```bash
git add src/components/marketing/features.tsx src/components/marketing/how-it-works.tsx src/app/(marketing)/page.tsx
git commit -m "feat: extract and rework Features + How It Works sections with cards"
```

---

### Task 5: Rework Form Library, Privacy, and FAQ sections

**Files:**
- Create: `src/components/marketing/form-library.tsx`
- Create: `src/components/marketing/privacy.tsx`
- Create: `src/components/marketing/faq.tsx`
- Modify: `src/app/(marketing)/page.tsx` (lines 374-539)

**Step 1: Extract and enhance Form Library**

Enhancements vs current:
- Better card shadows: add `shadow-sm hover:shadow-md` to each form card
- Replace the dashed "More forms coming" placeholder with a cleaner card that has `bg-muted/30` and a subtle "Coming soon" badge instead of a dashed border — more polished
- Form tags get slightly better positioning and a `bg-accent/10 text-accent-foreground` style for warm amber tags

**Step 2: Extract and enhance Privacy section**

Enhancements vs current:
- Replace hardcoded `bg-[oklch(0.18_0.035_180)]` with the existing `--sidebar` variable: use `bg-sidebar`
- Replace hardcoded `text-[oklch(0.6_0.1_175)]` with `text-primary` (which is the same hue in light mode)
- Increase icon containers to `w-14 h-14` with a `bg-white/[0.08]` circle
- Improve description text from `text-white/45` to `text-white/55` for better contrast

**Step 3: Extract and rework FAQ**

Enhancements vs current:
- Switch from asymmetric `grid-cols-[1fr_2fr]` to full-width layout
- Section header centered above the accordion
- Accordion full-width in a `max-w-3xl mx-auto` container
- Clean dividers between items

**Step 4: Update page.tsx — replace inline markup with components**

```tsx
import { FormLibrary } from '@/components/marketing/form-library';
import { Privacy } from '@/components/marketing/privacy';
import { FAQ } from '@/components/marketing/faq';
```

**Step 5: Verify visually**

Check all three sections at all breakpoints.

**Step 6: Commit**

```bash
git add src/components/marketing/form-library.tsx src/components/marketing/privacy.tsx src/components/marketing/faq.tsx src/app/(marketing)/page.tsx
git commit -m "feat: extract and rework Form Library, Privacy, FAQ sections"
```

---

### Task 6: Rework Final CTA and Footer

**Files:**
- Create: `src/components/marketing/cta.tsx`
- Create: `src/components/marketing/footer.tsx`
- Modify: `src/app/(marketing)/page.tsx` (lines 541-619)

**Step 1: Extract and enhance Final CTA**

Enhancements vs current:
- Increase headline size: `text-4xl sm:text-5xl md:text-6xl`
- Add a subtle micro-testimonial or stat line above the CTA: e.g., `"Trusted by Australian GPs — complete forms in under 2 minutes"`
- Use `variant="amber"` and `variant="outline"` for buttons instead of inline className
- Slightly reduce padding

**Step 2: Extract and enhance Footer**

Enhancements vs current:
- Consistent layout cleanup
- Ensure proper mobile stacking

**Step 3: Update page.tsx — final cleanup**

The page.tsx should now be just:
```tsx
import { Hero } from '@/components/marketing/hero';
import { Features } from '@/components/marketing/features';
import { HowItWorks } from '@/components/marketing/how-it-works';
import { FormLibrary } from '@/components/marketing/form-library';
import { Privacy } from '@/components/marketing/privacy';
import { FAQ } from '@/components/marketing/faq';
import { CTA } from '@/components/marketing/cta';
import { Footer } from '@/components/marketing/footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Hero />
      <Features />
      <HowItWorks />
      <FormLibrary />
      <Privacy />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}
```

Move the `supportedForms` and `faqItems` data arrays into their respective component files.

**Step 4: Verify the full page renders correctly**

Run dev server, scroll through the entire page. Check mobile and desktop.

**Step 5: Commit**

```bash
git add src/components/marketing/ src/app/(marketing)/page.tsx
git commit -m "feat: extract CTA + Footer, finalize marketing page component structure"
```

---

### Task 7: Rework the Auth layout (left panel) and login/register pages

**Files:**
- Modify: `src/app/(auth)/layout.tsx`
- Modify: `src/app/(auth)/login/page.tsx`
- Modify: `src/app/(auth)/register/page.tsx`

**Step 1: Enhance the auth layout left panel**

Add to the left panel between the logo and headline:
- A testimonial block: blockquote with a quote from a clinician (placeholder), name, and title
- 2-3 micro-stat pills at the bottom: "5 form types", "< 2 min average", "Privacy-first"

Replace hardcoded oklch values with design tokens where possible.

Layout changes:
- Adjust spacing so content is vertically centered with `justify-center` instead of `justify-between`
- Logo stays at top with `absolute top-10 left-10`
- Copyright stays at bottom with `absolute bottom-10 left-10`
- Main content (headline + testimonial + stats) centered

**Step 2: Polish the right panel**

- Increase max-width from `max-w-sm` to `max-w-[400px]` for slightly more breathing room
- Ensure mobile logo is clean (remove any dev artifacts)

**Step 3: Verify the login page at both mobile and desktop**

Run dev server, navigate to /login.
Expected: Enhanced left panel with testimonial + stats, clean form on right.

**Step 4: Commit**

```bash
git add src/app/(auth)/layout.tsx src/app/(auth)/login/page.tsx src/app/(auth)/register/page.tsx
git commit -m "feat: rework auth layout with testimonial and social proof"
```

---

### Task 8: Final visual polish pass

**Files:**
- Potentially touch: any of the files created in Tasks 1-7

**Step 1: Run the full app and do a visual review**

Check every section at these breakpoints:
- Mobile (375px)
- Tablet (768px)
- Desktop (1280px)
- Large desktop (1440px+)

**Step 2: Fix any visual issues discovered**

Common things to check:
- Text truncation on mobile
- Card spacing consistency
- Button sizes consistent across sections
- No horizontal scroll
- Smooth transitions between sections
- FAQ accordion works properly
- All links point to correct routes

**Step 3: Run TypeScript and lint checks**

Run: `npx tsc --noEmit && npm run lint`
Expected: No errors

**Step 4: Commit**

```bash
git add -A
git commit -m "fix: final visual polish pass for marketing and login pages"
```
