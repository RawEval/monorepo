import { Navbar } from '@/components/navbar';
import { HeroSection } from '@/components/hero-section';
import { LogosSection } from '@/components/logos-section';
import { PlatformsShowcase } from '@/components/platforms-showcase';
import { HowItWorks } from '@/components/how-it-works';
import { WorkflowVisualization } from '@/components/workflow-visualization';
import { ExpertGrid } from '@/components/expert-grid';
import { AnnotationDemo } from '@/components/annotation-demo';
import { ValidationDelivery } from '@/components/validation-delivery';
import { PlatformSection } from '@/components/platform-section';
import { SecuritySection } from '@/components/security-section';
import { CTASection } from '@/components/cta-section';
import { Footer } from '@/components/footer';

export default function Home() {
  return (
    <main className="bg-background min-h-screen">
      <Navbar />
      <HeroSection />
      <LogosSection />
      <PlatformsShowcase />
      <HowItWorks />
      <WorkflowVisualization />
      <ExpertGrid />
      <AnnotationDemo />
      <ValidationDelivery />
      <PlatformSection />
      <SecuritySection />
      <CTASection />
      <Footer />
    </main>
  );
}
