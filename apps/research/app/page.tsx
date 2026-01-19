import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@raweval/ui/button';
import { StatsCard } from '@raweval/ui/stats-card';
import { FeatureCard } from '@raweval/ui/feature-card';
import { SectionHeader } from '@raweval/ui/section-header';
import {
  GraduationCap,
  FlaskConical,
  Beaker,
  CheckCircle2,
  FileText,
  Download,
  Globe,
  ArrowRight,
  Zap,
  Target,
  BookOpen,
  Microscope,
  Award,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'RawEval for Research | Academic AI Data Solutions',
  description:
    'Access gold-standard, human-verified training data for your AI research. Built for research labs, academic institutions, and non-profit organizations.',
};

export default function ResearchPage() {
  return (
    <main className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-900 via-blue-900 to-slate-900 pt-32 pb-20 text-white lg:pt-40 lg:pb-32">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-12 text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm">
              <GraduationCap className="h-4 w-4" />
              <span>Trusted by Leading Research Labs</span>
            </div>
            <h1 className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl">
              Gold-Standard Data for
              <br />
              Academic AI Research
            </h1>
            <p className="mx-auto mb-8 max-w-3xl text-lg text-blue-100 md:text-xl">
              Access rigorously verified training data for your research. Every
              correction reviewed by domain experts, quality-scored, and
              delivered with academic discounts.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="h-12 bg-white px-8 text-blue-600 hover:bg-blue-50"
                asChild
              >
                <Link href="#contact">
                  Request Academic Access
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 border-white px-8 text-white hover:bg-white/10"
                asChild
              >
                <Link href="#samples">View Sample Datasets</Link>
              </Button>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 grid gap-6 md:grid-cols-4">
            <StatsCard
              value="96.8%"
              label="Avg Quality Score"
              className="text-white"
            />
            <StatsCard
              value="47K+"
              label="Verified Prompts"
              className="text-white"
            />
            <StatsCard
              value="2,400+"
              label="Expert Network"
              className="text-white"
            />
            <StatsCard
              value=".edu"
              label="Academic Pricing"
              className="text-white"
            />
          </div>
        </div>
      </section>

      {/* Why Research Section */}
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeader
            title="Built for Academic Research"
            description="From benchmark creation to RLHF fine-tuning, RawEval data powers the
              most rigorous AI research."
            className="mb-16"
          />

          <div className="grid gap-8 lg:grid-cols-3">
            <FeatureCard
              icon={<FlaskConical className="h-6 w-6 text-purple-600" />}
              iconBg="bg-purple-100"
              title="RLHF Fine-Tuning"
              description="Human-verified preference data for reinforcement learning
                pipelines and alignment research."
              features={[
                {
                  label: '3-tier expert verification',
                  icon: (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-purple-500" />
                  ),
                },
                {
                  label: 'Consensus scoring',
                  icon: (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-purple-500" />
                  ),
                },
                {
                  label: 'Delta improvement metrics',
                  icon: (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-purple-500" />
                  ),
                },
              ]}
            />

            <FeatureCard
              icon={<Target className="h-6 w-6 text-blue-600" />}
              iconBg="bg-blue-100"
              title="Benchmark Creation"
              description="Gold-standard test sets for model evaluation, leaderboards,
                and research publications."
              features={[
                {
                  label: 'Expert-reviewed test cases',
                  icon: (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-500" />
                  ),
                },
                {
                  label: 'Quality-scored responses',
                  icon: (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-500" />
                  ),
                },
                {
                  label: 'Publication-ready metadata',
                  icon: (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-500" />
                  ),
                },
              ]}
            />

            <FeatureCard
              icon={<Beaker className="h-6 w-6 text-emerald-600" />}
              iconBg="bg-emerald-100"
              title="Dataset Augmentation"
              description="High-quality additions to existing training corpora for
                specialized research domains."
              features={[
                {
                  label: 'Domain-specific expertise',
                  icon: (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  ),
                },
                {
                  label: 'Multi-modal support',
                  icon: (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  ),
                },
                {
                  label: 'Custom annotation formats',
                  icon: (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  ),
                },
              ]}
            />
          </div>
        </div>
      </section>

      {/* Research Use Cases */}
      <section className="bg-slate-50 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeader
            title="Research Use Cases"
            description="From university labs to national research institutions, RawEval
              supports diverse academic research needs."
            className="mb-16"
          />

          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 to-white p-8">
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-600">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="mb-2 text-2xl font-semibold">
                    University Research Labs
                  </h3>
                  <p className="text-muted-foreground">
                    Graduate students, postdocs, and faculty conducting AI
                    research
                  </p>
                </div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-purple-600" />
                  <div>
                    <div className="font-medium">
                      Thesis & Dissertation Research
                    </div>
                    <p className="text-sm text-muted-foreground">
                      High-quality datasets for PhD and Master&apos;s research
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-purple-600" />
                  <div>
                    <div className="font-medium">Course Projects</div>
                    <p className="text-sm text-muted-foreground">
                      Verified data for AI/ML course assignments and capstone
                      projects
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-purple-600" />
                  <div>
                    <div className="font-medium">Publication Support</div>
                    <p className="text-sm text-muted-foreground">
                      Gold-standard data for conference and journal publications
                    </p>
                  </div>
                </li>
              </ul>
              <div className="mt-6 rounded-lg border border-purple-100 bg-white p-4">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold">Student Discount:</span>{' '}
                  Special pricing for .edu email addresses and verified student
                  status
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-8">
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600">
                  <Microscope className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="mb-2 text-2xl font-semibold">
                    National Research Labs
                  </h3>
                  <p className="text-muted-foreground">
                    Government labs, non-profits, and research institutions
                  </p>
                </div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                  <div>
                    <div className="font-medium">Multi-Year Grants</div>
                    <p className="text-sm text-muted-foreground">
                      Volume discounts for NSF, NIH, and other grant-funded
                      projects
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                  <div>
                    <div className="font-medium">Collaborative Research</div>
                    <p className="text-sm text-muted-foreground">
                      Shared datasets for multi-institution collaborations
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                  <div>
                    <div className="font-medium">Compliance & Security</div>
                    <p className="text-sm text-muted-foreground">
                      On-premise deployment options for sensitive research
                    </p>
                  </div>
                </li>
              </ul>
              <div className="mt-6 rounded-lg border border-blue-100 bg-white p-4">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold">Institutional Pricing:</span>{' '}
                  Custom contracts for research institutions and non-profit
                  organizations
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Data Delivery */}
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeader
            title="Flexible Data Access for Research"
            description="Choose the delivery method that fits your research workflow—
              API, batch exports, or custom integrations."
            className="mb-16"
          />

          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border-2 border-blue-200 bg-white p-8">
              <Zap className="mb-4 h-8 w-8 text-blue-600" />
              <h3 className="mb-3 text-xl font-semibold">Real-Time API</h3>
              <p className="mb-6 text-muted-foreground">
                Stream verified corrections as they&apos;re completed. Perfect
                for iterative research workflows.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  <span>REST & GraphQL endpoints</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  <span>Python SDK for researchers</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  <span>Jupyter notebook integration</span>
                </div>
              </div>
            </div>

            <div className="border-border rounded-2xl border-2 bg-white p-8">
              <Download className="mb-4 h-8 w-8 text-blue-600" />
              <h3 className="mb-3 text-xl font-semibold">Batch Exports</h3>
              <p className="mb-6 text-muted-foreground">
                Download full datasets in research-friendly formats. Ideal for
                offline analysis and publication.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  <span>JSONL, Parquet, CSV formats</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  <span>Reproducible data snapshots</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  <span>Citation metadata included</span>
                </div>
              </div>
            </div>

            <div className="border-border rounded-2xl border-2 bg-white p-8">
              <Globe className="mb-4 h-8 w-8 text-blue-600" />
              <h3 className="mb-3 text-xl font-semibold">Custom Integration</h3>
              <p className="mb-6 text-muted-foreground">
                Need a specialized solution? We integrate with your research
                infrastructure and data pipelines.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  <span>On-premise deployment</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  <span>Custom annotation formats</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  <span>Research support team</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Academic Pricing */}
      <section className="bg-gradient-to-br from-purple-50 to-blue-50 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeader
            title="Academic Pricing"
            description="Special discounts for .edu institutions, students, and verified
              research organizations."
            className="mb-16"
          />

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="relative overflow-hidden rounded-2xl border-2 border-purple-500 bg-gradient-to-br from-purple-600 to-purple-700 p-8 text-white">
              <div className="absolute top-4 right-4 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                Most Popular
              </div>
              <div className="mb-4 flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                <h3 className="text-xl font-semibold">Student & Faculty</h3>
              </div>
              <div className="mb-6">
                <div className="mb-2 text-4xl font-bold">$0.05</div>
                <div className="text-sm text-purple-100">per verified prompt</div>
              </div>
              <ul className="mb-8 space-y-3">
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-white" />
                  <span className="text-purple-50">
                    Up to 10K prompts/month
                  </span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-white" />
                  <span className="text-purple-50">.edu email verification</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-white" />
                  <span className="text-purple-50">API & batch export access</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-white" />
                  <span className="text-purple-50">Citation metadata included</span>
                </li>
              </ul>
              <Button className="w-full bg-white text-purple-600 hover:bg-purple-50">
                Request Access
              </Button>
            </div>

            <div className="border-border rounded-2xl border-2 bg-white p-8">
              <div className="mb-4 flex items-center gap-2">
                <Award className="h-5 w-5 text-blue-600" />
                <h3 className="text-xl font-semibold">Institutions</h3>
              </div>
              <div className="mb-6">
                <div className="mb-2 text-4xl font-bold">Custom</div>
                <div className="text-sm text-muted-foreground">
                  volume discounts
                </div>
              </div>
              <ul className="mb-8 space-y-3">
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                  <span className="text-muted-foreground">
                    Unlimited prompts
                  </span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                  <span className="text-muted-foreground">
                    Multi-year grant support
                  </span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                  <span className="text-muted-foreground">
                    On-premise deployment options
                  </span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                  <span className="text-muted-foreground">
                    Dedicated research support
                  </span>
                </li>
              </ul>
              <Button className="w-full" variant="outline">
                Contact Research Team
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 py-24 text-white lg:py-32">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Ready to Accelerate Your Research?
          </h2>
          <p className="mb-8 text-lg text-slate-300">
            Join leading research labs using RawEval data. Request academic
            access or schedule a demo to see sample datasets.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="h-12 bg-white px-8 text-slate-900 hover:bg-slate-100">
              Request Academic Access
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" className="h-12 border-white px-8 text-white hover:bg-white/10">
              <FileText className="mr-2 h-4 w-4" />
              Download Research Guide
            </Button>
          </div>
          <p className="text-muted-foreground mt-6 text-sm">
            Questions? Email{' '}
            <a
              href="mailto:research@raweval.com"
              className="text-blue-400 hover:underline"
            >
              research@raweval.com
            </a>{' '}
            or book a call with our research team
          </p>
        </div>
      </section>
    </main>
  );
}
