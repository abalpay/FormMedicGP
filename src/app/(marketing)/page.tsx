import { Hero } from '@/components/marketing/hero';
import { Features } from '@/components/marketing/features';
import { HowItWorks } from '@/components/marketing/how-it-works';
import { FormLibrary } from '@/components/marketing/form-library';
import { SocialProof } from '@/components/marketing/social-proof';
import { Privacy } from '@/components/marketing/privacy';
import { FAQ } from '@/components/marketing/faq';
import { CTA } from '@/components/marketing/cta';
import { ComplianceStrip } from '@/components/marketing/compliance-strip';
import { Footer } from '@/components/marketing/footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Hero />
      <Features />
      <HowItWorks />
      <FormLibrary />
      <SocialProof />
      <Privacy />
      <FAQ />
      <CTA />
      <ComplianceStrip />
      <Footer />
    </div>
  );
}
