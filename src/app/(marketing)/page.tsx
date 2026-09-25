import { Hero } from '@/components/marketing/hero';
import { HowItWorks } from '@/components/marketing/how-it-works';
import { FormLibrary } from '@/components/marketing/form-library';
import { BuilderStory } from '@/components/marketing/builder-story';
import { FAQ } from '@/components/marketing/faq';
import { CTA } from '@/components/marketing/cta';

export default function LandingPage() {
  return (
    <div className="relative isolate min-h-screen bg-background text-foreground overflow-x-hidden">
      <main>
        <Hero />
        <HowItWorks />
        <FormLibrary />
        <BuilderStory />
        <FAQ />
        <CTA />
      </main>
      {/* After <main> so it dithers the section glows beneath it (kills banding). */}
      <div aria-hidden="true" className="grain-layer pointer-events-none absolute inset-0 -z-10" />
    </div>
  );
}
