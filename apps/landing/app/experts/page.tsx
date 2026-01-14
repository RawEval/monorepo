import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { ExpertsHero } from '@/components/experts/experts-hero';
import { WhyJoin } from '@/components/experts/why-join';
import { EarningsSection } from '@/components/experts/earnings-section';
import { WorkbenchPreview } from '@/components/experts/workbench-preview';
import { TierSystem } from '@/components/experts/tier-system';
import { ExpertsCTA } from '@/components/experts/experts-cta';

export const metadata = {
  title: 'For Experts | RawEval',
  description:
    "Join RawEval's expert network. Earn by annotating prompts you already write. Flexible pay per prompt or project-based contracts.",
};

export default function ExpertsPage() {
  return (
    <main className="bg-background min-h-screen">
      <Navbar />
      <ExpertsHero />
      <WhyJoin />
      <EarningsSection />
      <WorkbenchPreview />
      <TierSystem />
      <ExpertsCTA />
      <Footer />
    </main>
  );
}
