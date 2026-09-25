import { Hero } from '@/components/marketing/hero';
import { HowItWorks } from '@/components/marketing/how-it-works';
import { FormLibrary } from '@/components/marketing/form-library';
import { BuilderStory } from '@/components/marketing/builder-story';
import { FAQ } from '@/components/marketing/faq';
import { CTA } from '@/components/marketing/cta';
import { Footer } from '@/components/marketing/footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <main>
        <Hero />
        <HowItWorks />
        <FormLibrary />
        <BuilderStory />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
