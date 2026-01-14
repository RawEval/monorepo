import { Metadata } from 'next';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { StepNav } from '@/components/step-nav';
import {
  ArrowRight,
  Database,
  CheckCircle2,
  TrendingUp,
  Zap,
  Users,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'RawEval | Validation & Delivery',
  description:
    'Phase 4: Quality validation and API delivery to enterprise clients.',
};

export default function DeliveryPage() {
  return (
    <main className="bg-background min-h-screen">
      <Navbar />
      <div className="pt-16">
        <StepNav
          currentStep={4}
          totalSteps={4}
          prevLink="/how-it-works/workbench"
          title="Validation & Delivery"
          subtitle="Gold-standard data, quality-scored and delivered via API"
        />

        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            {/* Auto-QC Process */}
            <div className="mb-16">
              <h2 className="text-foreground mb-8 text-center text-3xl font-bold">
                Automated Quality Control
              </h2>
              <div className="grid items-center gap-12 lg:grid-cols-2">
                <div>
                  <p className="text-muted-foreground mb-6 text-lg">
                    Once all 9 experts submit their corrections (3 per tier),
                    our system automatically compares Tier 2 and Tier 3
                    submissions against the Tier 1 &quot;Gold Standard.&quot;
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-blue-600" />
                      <div>
                        <h3 className="text-foreground mb-1 font-semibold">
                          Delta metric calculation
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          We measure how much the Tier 1 correction improves the
                          original model&apos;s output. This quantifies the
                          value of human verification.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-blue-600" />
                      <div>
                        <h3 className="text-foreground mb-1 font-semibold">
                          Consensus scoring
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          When multiple experts agree on a correction,
                          confidence increases. Discrepancies trigger additional
                          review by senior Tier 1 experts.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-blue-600" />
                      <div>
                        <h3 className="text-foreground mb-1 font-semibold">
                          Quality badges
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          Each correction receives a quality score (0-100) based
                          on expert consensus, tier agreement, and delta
                          improvement metrics.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-700 bg-slate-900 p-8 text-white">
                  <h3 className="mb-6 text-xl font-semibold">
                    Quality Scoring Example
                  </h3>
                  <div className="space-y-4">
                    <div className="rounded-lg bg-slate-800 p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm text-slate-400">
                          Tier 1 Consensus
                        </span>
                        <span className="font-metric text-emerald-400">
                          100%
                        </span>
                      </div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm text-slate-400">
                          Tier 2 Agreement
                        </span>
                        <span className="font-metric text-blue-400">89%</span>
                      </div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm text-slate-400">
                          Tier 3 Agreement
                        </span>
                        <span className="font-metric text-amber-400">67%</span>
                      </div>
                      <div className="mt-3 border-t border-slate-700 pt-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold">
                            Delta Improvement
                          </span>
                          <span className="font-metric text-xl text-emerald-400">
                            +34%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                        <span className="font-semibold">
                          Quality Badge: Gold
                        </span>
                      </div>
                      <p className="text-sm text-emerald-200">
                        High consensus across all tiers. Ready for production
                        use.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* API Delivery */}
            <div className="mb-16 rounded-2xl border border-blue-200 bg-blue-50 p-8">
              <h2 className="text-foreground mb-6 text-center text-2xl font-bold">
                Enterprise API Delivery
              </h2>
              <p className="text-muted-foreground mx-auto mb-8 max-w-2xl text-center">
                Gold-standard data is packaged and delivered via REST API or
                webhook to your ML infrastructure. Integrate with your existing
                training pipelines in minutes.
              </p>

              <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-xl border border-blue-200 bg-white p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                    <Zap className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-foreground mb-2 font-semibold">
                    Real-time webhooks
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Receive corrections as soon as they&apos;re validated. No
                    polling required.
                  </p>
                </div>

                <div className="rounded-xl border border-blue-200 bg-white p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                    <Database className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-foreground mb-2 font-semibold">
                    Batch exports
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Download full datasets in JSONL, Parquet, or CSV for offline
                    training.
                  </p>
                </div>

                <div className="rounded-xl border border-blue-200 bg-white p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-foreground mb-2 font-semibold">
                    Team dashboard
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Monitor data quality, expert performance, and delivery
                    metrics in real-time.
                  </p>
                </div>
              </div>

              <div className="mt-8 rounded-xl bg-slate-900 p-6 text-white">
                <div className="mb-3 text-sm text-slate-400">
                  Example API Response
                </div>
                <pre className="overflow-x-auto text-xs">
                  <code>{`{
  "prompt_id": "p_7G4kL2mN",
  "original_prompt": "Explain quantum entanglement",
  "model_output": "...",
  "corrections": [
    {
      "expert_tier": 1,
      "expert_id": "exp_8Kj2pL9",
      "corrected_output": "...",
      "rubric": "...",
      "quality_score": 94
    }
  ],
  "delta_improvement": 0.34,
  "consensus_level": "high",
  "delivered_at": "2026-01-14T10:23:47Z"
}`}</code>
                </pre>
              </div>
            </div>

            {/* Client Dashboard Preview */}
            <div className="mb-16">
              <h2 className="text-foreground mb-8 text-center text-2xl font-bold">
                Enterprise Client Dashboard
              </h2>
              <div className="border-border rounded-2xl border bg-white p-8 shadow-lg">
                <div className="mb-8 grid gap-6 md:grid-cols-4">
                  <div className="text-center">
                    <div className="mb-2 text-3xl font-bold text-blue-600">
                      2,847
                    </div>
                    <div className="text-muted-foreground text-sm">
                      Prompts delivered
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="mb-2 text-3xl font-bold text-emerald-600">
                      96.2%
                    </div>
                    <div className="text-muted-foreground text-sm">
                      Avg quality score
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="mb-2 text-3xl font-bold text-amber-600">
                      +31%
                    </div>
                    <div className="text-muted-foreground text-sm">
                      Avg delta improvement
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="mb-2 text-3xl font-bold text-purple-600">
                      4.2h
                    </div>
                    <div className="text-muted-foreground text-sm">
                      Avg turnaround
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-foreground mb-4 font-semibold">
                    Recent Deliveries
                  </h3>
                  {[
                    {
                      id: 'p_7G4k',
                      domain: 'Physics',
                      quality: 94,
                      delta: 34,
                      status: 'Delivered',
                    },
                    {
                      id: 'p_8Km2',
                      domain: 'Medicine',
                      quality: 98,
                      delta: 42,
                      status: 'Delivered',
                    },
                    {
                      id: 'p_9Lp3',
                      domain: 'Law',
                      quality: 91,
                      delta: 28,
                      status: 'Delivered',
                    },
                    {
                      id: 'p_1Nq4',
                      domain: 'Engineering',
                      quality: 96,
                      delta: 38,
                      status: 'In QC',
                    },
                  ].map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg bg-slate-50 p-4"
                    >
                      <div className="flex items-center gap-4">
                        <code className="font-metric rounded border bg-white px-2 py-1 text-xs text-slate-600">
                          {item.id}
                        </code>
                        <span className="text-foreground text-sm">
                          {item.domain}
                        </span>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-foreground text-sm font-semibold">
                            {item.quality}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            Quality
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-semibold text-emerald-600">
                            +{item.delta}%
                          </div>
                          <div className="text-muted-foreground text-xs">
                            Delta
                          </div>
                        </div>
                        <div
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            item.status === 'Delivered'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {item.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Why this matters */}
            <div className="rounded-2xl bg-blue-600 p-8 text-white">
              <h3 className="mb-4 text-2xl font-semibold">
                Why validation matters
              </h3>
              <p className="mb-6 text-blue-100">
                Without multi-tier validation, you have no way to know if an
                expert correction is actually better than the original model
                output. The Delta metric quantifies improvement and ensures you
                only pay for corrections that genuinely enhance your model.
              </p>
              <div className="grid gap-6 text-sm md:grid-cols-2">
                <div className="rounded-lg bg-white/10 p-4">
                  <div className="mb-2 font-semibold">
                    Single expert (no validation)
                  </div>
                  <div className="space-y-1 text-blue-100">
                    <div>• No way to verify quality</div>
                    <div>• Expert could be wrong</div>
                    <div>• No improvement measurement</div>
                    <div>• Blind trust required</div>
                  </div>
                </div>
                <div className="rounded-lg bg-white/10 p-4">
                  <div className="mb-2 font-semibold">
                    RawEval 3-3-3 validation
                  </div>
                  <div className="space-y-1 text-white">
                    <div>• 9 experts cross-validate</div>
                    <div>• Tier 1 sets gold standard</div>
                    <div>• Delta quantifies improvement</div>
                    <div>• Quality-scored delivery</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
