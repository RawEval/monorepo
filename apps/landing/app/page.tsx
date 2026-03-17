import { HeroSection } from '@/components/hero-section';
import { HowItWorksSection } from '@/components/how-it-works-section';
import { JourneyAnimation } from '@/components/journey-animation';
import { SocialProofSection } from '@/components/social-proof-section';
import { AudienceSection } from '@/components/audience-section';
import { CTASection } from '@/components/cta-section';

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-base)' }}>
      <HeroSection />
      <HowItWorksSection />
      <JourneyAnimation />
      <SocialProofSection />
      <AudienceSection />
      <CTASection />
    </div>
  );
}
