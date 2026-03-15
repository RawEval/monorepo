import { TickerStrip } from '@/components/ticker-strip';
import { HeroSection } from '@/components/hero-section';
import { ProblemSection } from '@/components/problem-section';
import { PipelineHeader } from '@/components/pipeline-header';
import { PlatformCapture } from '@/components/platform-capture';
import { Connector } from '@/components/connector';
import { PlatformExperts } from '@/components/platform-experts';
import { PlatformWorkbench } from '@/components/platform-workbench';
import { DeliverySection } from '@/components/delivery-section';
import { WhyNowSection } from '@/components/why-now-section';
import { WhoWeServeSection } from '@/components/who-we-serve-section';
import { CTASection } from '@/components/cta-section';

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--color-bg-base)' }}>
      <TickerStrip />
      <HeroSection />
      <ProblemSection />
      <PipelineHeader />
      <PlatformCapture />
      <Connector label="Verified failures → Expert Queue" />
      <PlatformExperts />
      <Connector label="Verified experts → Workbench" />
      <PlatformWorkbench />
      <DeliverySection />
      <WhyNowSection />
      <WhoWeServeSection />
      <CTASection />
    </main>
  );
}
