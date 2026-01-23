import { Metadata } from 'next';
import { Button } from '@raweval/ui/button';
import { StatsCard } from '@raweval/ui/stats-card';
import { FeatureCard } from '@raweval/ui/feature-card';
import { SectionHeader } from '@raweval/ui/section-header';
import {
  Building2,
  Shield,
  CheckCircle2,
  Zap,
  BarChart3,
  Lock,
  FileText,
  ArrowRight,
  Download,
  Globe,
  Sparkles,
  Target,
  Beaker,
  GraduationCap,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'RawEval for Organizations | Enterprise AI Data Solutions',
  description:
    'Access gold-standard, human-verified training data for your LLM and AI models. Built for research labs, AI companies, and enterprise ML teams.',
};

export default function OrganizationsPage() {
  return (
    <main className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-32 pb-20 text-white lg:pt-40 lg:pb-32">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-12 text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm">
              <Building2 className="h-4 w-4" />
              <span>Trusted by Leading AI Labs</span>
            </div>
            <h1 className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl">
              Gold-Standard Training Data
              <br />
              for Production AI
            </h1>
            <p className="mx-auto mb-8 max-w-3xl text-lg text-blue-100 md:text-xl">
              Access the world&apos;s most rigorously verified training data.
              Every correction reviewed by 3-9 domain experts, quality-scored,
              and delivered via API or batch export.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="h-12 bg-white px-8 text-blue-600 hover:bg-blue-50"
              >
                Schedule Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 border-white px-8 text-white hover:bg-white/10"
              >
                View Sample Data
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
              value="+34%"
              label="Accuracy Improvement"
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
          </div>
        </div>
      </section>

      {/* Data Quality Section */}
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeader
            title="Why RawEval Data is Different"
            description="Unlike synthetic or crowd-sourced data, every RawEval correction
              is verified by vetted domain experts and scored against gold
              standards."
            className="mb-16"
          />

          <div className="grid gap-8 lg:grid-cols-3">
            <FeatureCard
              icon={<Shield className="h-6 w-6 text-blue-600" />}
              iconBg="bg-blue-100"
              title="3-Tier Verification"
              description="Every prompt reviewed by 9 experts across 3 tiers (PhD/10+ years
                → Master's/5+ years → Bachelor's/2+ years) for
                multi-perspective validation."
              features={[
                {
                  label: 'Tier 1 sets gold standard',
                  icon: (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-500" />
                  ),
                },
                {
                  label: 'Tier 2/3 cross-validated',
                  icon: (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-500" />
                  ),
                },
                {
                  label: 'Consensus scoring for confidence',
                  icon: (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-500" />
                  ),
                },
              ]}
            />

            <FeatureCard
              icon={<Lock className="h-6 w-6 text-blue-600" />}
              iconBg="bg-blue-100"
              title="Anti-AI Filtering"
              description="Zero AI-generated corrections. Our Iron Dome security monitors
                biometrics, keystrokes, and screen activity to ensure 100% human
                input."
              features={[
                {
                  label: 'Keystroke rhythm analysis',
                  icon: (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-500" />
                  ),
                },
                {
                  label: 'Screen share monitoring',
                  icon: (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-500" />
                  ),
                },
                {
                  label: 'Biometric heartbeat checks (60s)',
                  icon: (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-500" />
                  ),
                },
              ]}
            />

            <FeatureCard
              icon={<BarChart3 className="h-6 w-6 text-blue-600" />}
              iconBg="bg-blue-100"
              title="Delta Metrics"
              description="Every correction includes quantified improvement metrics,
                showing exactly how much the expert enhanced the original model
                output."
              features={[
                {
                  label: 'Accuracy improvement (%)',
                  icon: (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-500" />
                  ),
                },
                {
                  label: 'Quality score (0-100)',
                  icon: (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-500" />
                  ),
                },
                {
                  label: 'Consensus confidence level',
                  icon: (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-500" />
                  ),
                },
              ]}
            />
          </div>
        </div>
      </section>

      {/* Data Delivery Options */}
      <section className="bg-slate-50 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeader
            title="Flexible Data Delivery"
            description="Get data your way—real-time API, batch exports, or custom
              integrations. We fit into your existing ML pipeline."
            className="mb-16"
          />

          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border-2 border-blue-200 bg-white p-8">
              <Zap className="mb-4 h-8 w-8 text-blue-600" />
              <h3 className="text-foreground mb-3 text-xl font-semibold">
                Real-Time API
              </h3>
              <p className="text-muted-foreground mb-6">
                Stream verified corrections as they&apos;re completed. Webhooks
                notify your system the moment quality gates pass.
              </p>
              <div className="space-y-2 text-sm">
                <div className="text-muted-foreground flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  <span>Avg 4.2h turnaround</span>
                </div>
                <div className="text-muted-foreground flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  <span>REST & GraphQL endpoints</span>
                </div>
                <div className="text-muted-foreground flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  <span>Webhook push notifications</span>
                </div>
              </div>
            </div>

            <div className="border-border rounded-2xl border-2 bg-white p-8">
              <Download className="mb-4 h-8 w-8 text-blue-600" />
              <h3 className="text-foreground mb-3 text-xl font-semibold">
                Batch Exports
              </h3>
              <p className="text-muted-foreground mb-6">
                Download full datasets in your preferred format. Perfect for
                offline training and research workflows.
              </p>
              <div className="space-y-2 text-sm">
                <div className="text-muted-foreground flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  <span>JSONL, Parquet, CSV</span>
                </div>
                <div className="text-muted-foreground flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  <span>Daily/weekly/monthly exports</span>
                </div>
                <div className="text-muted-foreground flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  <span>S3/GCS direct upload</span>
                </div>
              </div>
            </div>

            <div className="border-border rounded-2xl border-2 bg-white p-8">
              <Globe className="mb-4 h-8 w-8 text-blue-600" />
              <h3 className="text-foreground mb-3 text-xl font-semibold">
                Custom Integration
              </h3>
              <p className="text-muted-foreground mb-6">
                Need a bespoke solution? We integrate with your internal
                systems, dashboards, and ML platforms.
              </p>
              <div className="space-y-2 text-sm">
                <div className="text-muted-foreground flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  <span>Custom authentication</span>
                </div>
                <div className="text-muted-foreground flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  <span>On-prem deployment options</span>
                </div>
                <div className="text-muted-foreground flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  <span>Dedicated support channel</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeader
            title="Built for AI Leaders"
            description="From academic research to production LLMs, RawEval data powers the
              most demanding AI applications."
            className="mb-16"
          />

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-8">
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600">
                  <Beaker className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-foreground mb-2 text-2xl font-semibold">
                    AI Research Labs
                  </h3>
                  <p className="text-muted-foreground">
                    Universities, national labs, and corporate R&D teams
                  </p>
                </div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                  <div>
                    <div className="text-foreground font-medium">
                      RLHF Fine-Tuning
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Human-verified preference data for reinforcement learning
                      pipelines
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                  <div>
                    <div className="text-foreground font-medium">
                      Benchmark Creation
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Gold-standard test sets for model evaluation and
                      leaderboards
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                  <div>
                    <div className="text-foreground font-medium">
                      Dataset Augmentation
                    </div>
                    <p className="text-muted-foreground text-sm">
                      High-quality additions to existing training corpora
                    </p>
                  </div>
                </li>
              </ul>
              <div className="mt-6 rounded-lg border border-blue-100 bg-white p-4">
                <p className="text-muted-foreground text-sm">
                  <span className="text-foreground font-semibold">
                    Academic Pricing:
                  </span>{' '}
                  Discounted rates for .edu institutions and non-profit research
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-8">
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-foreground mb-2 text-2xl font-semibold">
                    Enterprise ML Teams
                  </h3>
                  <p className="text-muted-foreground">
                    AI companies, tech giants, and production deployments
                  </p>
                </div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                  <div>
                    <div className="text-foreground font-medium">
                      Production LLM Training
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Clean, verified data for models serving millions of users
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                  <div>
                    <div className="text-foreground font-medium">
                      Safety & Alignment
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Expert-verified responses for reducing hallucinations and
                      bias
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                  <div>
                    <div className="text-foreground font-medium">
                      Domain-Specific Models
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Specialized data for medical, legal, financial, and
                      technical AI
                    </p>
                  </div>
                </li>
              </ul>
              <div className="mt-6 rounded-lg border border-blue-100 bg-white p-4">
                <p className="text-muted-foreground text-sm">
                  <span className="text-foreground font-semibold">
                    Enterprise SLA:
                  </span>{' '}
                  99.9% uptime, dedicated support, custom contracts
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Data Sample Preview */}
      <section className="bg-slate-900 py-24 text-white lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeader
            title="See the Data Structure"
            description="Every record includes the original prompt, model output, expert
              corrections, quality scores, and metadata."
            className="mb-16"
          />

          <div className="overflow-x-auto rounded-2xl border border-slate-700 bg-slate-800 p-8">
            <div className="mb-2 font-mono text-xs text-slate-400">
              Example API Response (JSONL format)
            </div>
            <pre className="overflow-x-auto font-mono text-sm text-emerald-400">
              {`{
  "prompt_id": "p_7G4kL2mN",
  "created_at": "2026-01-14T10:23:47Z",
  "original_prompt": {
    "text": "Explain the time complexity of merge sort",
    "modality": "text",
    "context": { "domain": "computer_science", "subdomain": "algorithms" }
  },
  "model_output": {
    "text": "Merge sort has O(n log n) complexity...",
    "model": "gpt-4-base",
    "confidence": 0.87
  },
  "expert_corrections": [
    {
      "tier": 1,
      "expert_id": "exp_8Kj2pL9",
      "credentials": "PhD Computer Science, 15 years",
      "corrected_output": "...",
      "rubric": "Added analysis of space complexity O(n)...",
      "quality_score": 94,
      "time_spent_seconds": 180
    }
  ],
  "validation": {
    "tier_1_consensus": 1.0,
    "tier_2_agreement": 0.89,
    "tier_3_agreement": 0.67,
    "delta_improvement": 0.34,
    "final_quality_badge": "gold"
  },
  "metadata": {
    "language": "en",
    "difficulty": "intermediate",
    "verified_by_experts": 9,
    "avg_expert_time_seconds": 165
  }
}`}
            </pre>
          </div>

          <div className="mt-8 text-center">
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Sample Dataset
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeader
            title="Transparent Pricing"
            description="Pay only for what you use. Volume discounts available for research
              institutions and enterprise deployments."
            className="mb-16"
          />

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="border-border rounded-2xl border-2 bg-white p-8">
              <div className="mb-4 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                <h3 className="text-foreground text-xl font-semibold">
                  Research
                </h3>
              </div>
              <div className="mb-6">
                <div className="text-foreground mb-2 text-4xl font-bold">
                  $0.08
                </div>
                <div className="text-muted-foreground text-sm">
                  per verified prompt
                </div>
              </div>
              <ul className="mb-8 space-y-3">
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                  <span className="text-muted-foreground">
                    Up to 10K prompts/month
                  </span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                  <span className="text-muted-foreground">
                    API & batch export access
                  </span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                  <span className="text-muted-foreground">
                    Standard support
                  </span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                  <span className="text-muted-foreground">
                    .edu domain required
                  </span>
                </li>
              </ul>
              <Button className="w-full" variant="outline">
                Request Access
              </Button>
            </div>

            <div className="relative overflow-hidden rounded-2xl border-2 border-blue-500 bg-gradient-to-br from-blue-600 to-blue-700 p-8 text-white">
              <div className="absolute top-4 right-4 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                Most Popular
              </div>
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                <h3 className="text-xl font-semibold">Production</h3>
              </div>
              <div className="mb-6">
                <div className="mb-2 text-4xl font-bold">$0.05</div>
                <div className="text-sm text-blue-100">per verified prompt</div>
              </div>
              <ul className="mb-8 space-y-3">
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-white" />
                  <span className="text-blue-50">Up to 100K prompts/month</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-white" />
                  <span className="text-blue-50">Real-time API + webhooks</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-white" />
                  <span className="text-blue-50">Priority support (24/7)</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-white" />
                  <span className="text-blue-50">Custom integrations</span>
                </li>
              </ul>
              <Button className="w-full bg-white text-blue-600 hover:bg-blue-50">
                Start Trial
              </Button>
            </div>

            <div className="border-border rounded-2xl border-2 bg-white p-8">
              <div className="mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                <h3 className="text-foreground text-xl font-semibold">
                  Enterprise
                </h3>
              </div>
              <div className="mb-6">
                <div className="text-foreground mb-2 text-4xl font-bold">
                  Custom
                </div>
                <div className="text-muted-foreground text-sm">
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
                    Dedicated infrastructure
                  </span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                  <span className="text-muted-foreground">
                    White-glove onboarding
                  </span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                  <span className="text-muted-foreground">
                    99.9% SLA guarantee
                  </span>
                </li>
              </ul>
              <Button className="w-full" variant="outline">
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-blue-50 to-white py-24 lg:py-32">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
          <h2 className="text-foreground mb-4 text-3xl font-bold md:text-4xl">
            Ready to Ship Cleaner AI?
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Join leading AI labs and enterprises using RawEval data. Schedule a
            demo to see sample datasets and discuss your specific needs.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="h-12 px-8">
              Schedule Demo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" className="h-12 px-8">
              <FileText className="mr-2 h-4 w-4" />
              Download Whitepaper
            </Button>
          </div>
          <p className="text-muted-foreground mt-6 text-sm">
            Questions? Email{' '}
            <a
              href="mailto:enterprise@raweval.com"
              className="text-blue-600 hover:underline"
            >
              enterprise@raweval.com
            </a>{' '}
            or book a call
          </p>
        </div>
      </section>
    </main>
  );
}
