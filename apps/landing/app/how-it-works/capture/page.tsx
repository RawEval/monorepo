import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { StepNav } from '@/components/step-nav';
import {
  Search,
  ArrowRight,
  Zap,
  Clock,
  Database,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Users,
  FileText,
  Filter,
} from 'lucide-react';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Data Capture - How It Works | RawEval',
  description:
    'Learn how RawEval captures real user queries and identifies model failures in real-time.',
};

export default function CapturePage() {
  return (
    <main className="bg-background min-h-screen">
      <Navbar />
      <div className="pt-16">
        <StepNav
          currentStep={1}
          totalSteps={4}
          nextLink="/how-it-works/vetting"
          title="Data Capture"
          subtitle="Identifying where AI models fail in real-world usage"
        />

        {/* Hero Section */}
        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mb-16 grid items-center gap-12 lg:grid-cols-2">
              <div>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2">
                  <Search className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">
                    Real-time capture
                  </span>
                </div>
                <h2 className="text-foreground mb-4 text-3xl font-semibold">
                  Every failed response is a training opportunity
                </h2>
                <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                  Traditional AI training relies on static datasets. RawEval
                  captures live user interactions where models actually fail,
                  creating a continuous feedback loop that identifies exactly
                  where AI needs improvement.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                    <span className="text-foreground">
                      Zero-latency capture (no slowdown for users)
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                    <span className="text-foreground">
                      Automatic PII removal before storage
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                    <span className="text-foreground">
                      Failure detection via user behavior signals
                    </span>
                  </div>
                </div>
              </div>
              <div className="border-border relative aspect-square rounded-2xl border bg-gradient-to-br from-blue-50 to-white p-8 shadow-xl">
                <div className="bg-grid-slate-100 absolute inset-0 -z-10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
                <div className="space-y-4">
                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="mb-2 flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium">User Query</span>
                    </div>
                    <p className="text-muted-foreground text-xs italic">
                      "Explain quantum tunneling in simple terms"
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <ArrowRight className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="rounded-xl border border-amber-200 bg-white p-4 shadow-sm">
                    <div className="mb-2 flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                      </div>
                      <span className="text-sm font-medium">
                        Model Response
                      </span>
                    </div>
                    <p className="text-muted-foreground text-xs">
                      Generic answer, user edits for 15 seconds...
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <ArrowRight className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="rounded-xl bg-blue-600 p-4 shadow-lg">
                    <div className="mb-2 flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                        <Database className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-white">
                        Captured for Evaluation
                      </span>
                    </div>
                    <p className="text-xs text-blue-100">
                      Queued for expert correction
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* How capture works */}
            <div className="mb-16">
              <h3 className="text-foreground mb-8 text-center text-2xl font-semibold">
                How capture works
              </h3>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="border-border rounded-xl border bg-white p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                    <Zap className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="text-foreground mb-2 font-semibold">
                    Dual-path execution
                  </h4>
                  <p className="text-muted-foreground mb-4 text-sm">
                    When a user submits a query, we create two parallel paths:
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="font-medium text-blue-600">Path A:</span>
                      <span className="text-muted-foreground">
                        Fast response to user (standard flow)
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-medium text-blue-600">Path B:</span>
                      <span className="text-muted-foreground">
                        Silent copy to evaluation buffer
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-border rounded-xl border bg-white p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
                    <Clock className="h-6 w-6 text-amber-600" />
                  </div>
                  <h4 className="text-foreground mb-2 font-semibold">
                    Failure detection
                  </h4>
                  <p className="text-muted-foreground mb-4 text-sm">
                    We detect model failures through user behavior signals:
                  </p>
                  <div className="text-muted-foreground space-y-2 text-sm">
                    <div>• User spends &gt;10s editing response</div>
                    <div>
                      • Clicks &quot;Wrong&quot; or &quot;Try again&quot;
                    </div>
                    <div>• Abandons without accepting answer</div>
                    <div>• Submits follow-up clarification</div>
                  </div>
                </div>

                <div className="border-border rounded-xl border bg-white p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                    <Filter className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h4 className="text-foreground mb-2 font-semibold">
                    Priority queueing
                  </h4>
                  <p className="text-muted-foreground mb-4 text-sm">
                    Failed prompts are automatically prioritized based on:
                  </p>
                  <div className="text-muted-foreground space-y-2 text-sm">
                    <div>• Domain complexity</div>
                    <div>• Confidence score of failure</div>
                    <div>• Enterprise client demand</div>
                    <div>• Model improvement potential</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Technical implementation */}
            <div className="mb-16 rounded-2xl border border-slate-200 bg-slate-50 p-8">
              <h3 className="text-foreground mb-6 text-xl font-semibold">
                Technical implementation
              </h3>
              <div className="grid gap-8 md:grid-cols-2">
                <div>
                  <h4 className="text-foreground mb-3 font-medium">
                    What we capture
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="rounded-lg border border-slate-200 bg-white p-3">
                      <span className="text-foreground font-medium">
                        Original Prompt:
                      </span>
                      <span className="text-muted-foreground ml-2">
                        Full user query with context
                      </span>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-3">
                      <span className="text-foreground font-medium">
                        Model Response:
                      </span>
                      <span className="text-muted-foreground ml-2">
                        Complete AI-generated answer
                      </span>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-3">
                      <span className="text-foreground font-medium">
                        Web Context:
                      </span>
                      <span className="text-muted-foreground ml-2">
                        RAG sources and citations
                      </span>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-3">
                      <span className="text-foreground font-medium">
                        User Edits:
                      </span>
                      <span className="text-muted-foreground ml-2">
                        Changes made by the user
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-foreground mb-3 font-medium">
                    Privacy & security
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      </div>
                      <div>
                        <div className="text-foreground font-medium">
                          Automatic PII removal
                        </div>
                        <div className="text-muted-foreground">
                          Email addresses, phone numbers, and personal
                          identifiers stripped before storage
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      </div>
                      <div>
                        <div className="text-foreground font-medium">
                          End-to-end encryption
                        </div>
                        <div className="text-muted-foreground">
                          All captured data encrypted at rest and in transit
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      </div>
                      <div>
                        <div className="text-foreground font-medium">
                          Zero user impact
                        </div>
                        <div className="text-muted-foreground">
                          Capture happens asynchronously with &lt;5ms overhead
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mb-16 grid gap-6 md:grid-cols-4">
              <div className="border-border rounded-xl border bg-white p-6 text-center">
                <div className="mb-2 text-3xl font-bold text-blue-600">
                  47K+
                </div>
                <div className="text-muted-foreground text-sm">
                  Queries captured daily
                </div>
              </div>
              <div className="border-border rounded-xl border bg-white p-6 text-center">
                <div className="mb-2 text-3xl font-bold text-blue-600">
                  4.3%
                </div>
                <div className="text-muted-foreground text-sm">
                  Average failure rate
                </div>
              </div>
              <div className="border-border rounded-xl border bg-white p-6 text-center">
                <div className="mb-2 text-3xl font-bold text-blue-600">
                  &lt;5ms
                </div>
                <div className="text-muted-foreground text-sm">
                  Capture overhead
                </div>
              </div>
              <div className="border-border rounded-xl border bg-white p-6 text-center">
                <div className="mb-2 text-3xl font-bold text-blue-600">
                  100%
                </div>
                <div className="text-muted-foreground text-sm">
                  Privacy compliant
                </div>
              </div>
            </div>

            {/* Why this matters */}
            <div className="rounded-2xl bg-blue-600 p-8 text-white">
              <h3 className="mb-4 text-2xl font-semibold">
                Why real-world capture matters
              </h3>
              <div className="grid gap-8 md:grid-cols-2">
                <div>
                  <h4 className="mb-3 font-medium text-blue-100">
                    Traditional approach
                  </h4>
                  <ul className="space-y-2 text-sm text-blue-100">
                    <li>✗ Training on static benchmark datasets</li>
                    <li>✗ No visibility into real user pain points</li>
                    <li>✗ Weeks/months between failure and fix</li>
                    <li>✗ Biased toward academic test cases</li>
                  </ul>
                </div>
                <div>
                  <h4 className="mb-3 font-medium">RawEval approach</h4>
                  <ul className="space-y-2 text-sm text-white">
                    <li>✓ Live capture of actual model failures</li>
                    <li>✓ Identify problems as they happen</li>
                    <li>✓ Hours from failure to training data</li>
                    <li>✓ Reflects real-world use cases</li>
                  </ul>
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
