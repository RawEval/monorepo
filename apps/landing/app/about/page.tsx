import { Metadata } from 'next';
import { SectionHeader } from '@raweval/ui/section-header';
import { CheckCircle2, Users, Globe, Target } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us | RawEval',
  description: 'Our mission is to build the gold standard for AI evaluation.',
};

export default function AboutPage() {
  return (
    <main className="bg-background min-h-screen pt-24 lg:pt-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeader
          title="About RawEval"
          description="We are building the infrastructure for the next generation of AI. Rigorous, human-verified evaluation at scale."
          className="mb-16"
        />

        <div className="mb-24 grid gap-12 lg:grid-cols-2 lg:gap-8">
          <div className="flex flex-col justify-center">
            <h2 className="text-foreground mb-6 text-3xl font-bold tracking-tight sm:text-4xl">
              Our Mission
            </h2>
            <p className="text-muted-foreground mb-6 text-lg leading-8">
              To ensure Artificial General Intelligence is safe, reliable, and
              beneficial, we need rigorous evaluation. Synthetic benchmarks are
              no longer enough. We are building the world's largest network of
              verified domain experts to stress-test, correct, and improve AI
              models.
            </p>
            <div className="space-y-4">
              {[
                'Gold-standard human verification',
                'Global network of domain experts',
                'Advanced anti-cheat security',
                'Data-driven quality metrics',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-blue-600" />
                  <span className="text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 lg:p-12">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
                <Users className="mb-4 h-8 w-8 text-blue-600" />
                <div className="text-foreground mb-1 text-2xl font-bold">
                  2,400+
                </div>
                <div className="text-muted-foreground text-sm">
                  Certified Experts
                </div>
              </div>
              <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
                <Target className="mb-4 h-8 w-8 text-emerald-600" />
                <div className="text-foreground mb-1 text-2xl font-bold">
                  96.8%
                </div>
                <div className="text-muted-foreground text-sm">
                  Accuracy Rate
                </div>
              </div>
              <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
                <Globe className="mb-4 h-8 w-8 text-purple-600" />
                <div className="text-foreground mb-1 text-2xl font-bold">
                  45+
                </div>
                <div className="text-muted-foreground text-sm">Countries</div>
              </div>
              <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
                <CheckCircle2 className="mb-4 h-8 w-8 text-amber-600" />
                <div className="text-foreground mb-1 text-2xl font-bold">
                  47K+
                </div>
                <div className="text-muted-foreground text-sm">Evaluations</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-24 border-t border-slate-200 pt-16">
          <h2 className="text-foreground mb-12 text-center text-3xl font-bold tracking-tight">
            Our Values
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                title: 'Truth above all',
                description:
                  'We do not compromise on data quality. Every correction is verified, every score is earned.',
              },
              {
                title: 'Human-centric AI',
                description:
                  'We believe human expertise is the key to unlocking the next level of AI capability.',
              },
              {
                title: 'Meritocracy',
                description:
                  'Our experts are tiered based on proven performance, not just credentials.',
              },
            ].map((value) => (
              <div
                key={value.title}
                className="rounded-xl border border-slate-100 bg-slate-50 p-8"
              >
                <h3 className="text-foreground mb-4 text-xl font-semibold">
                  {value.title}
                </h3>
                <p className="text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
