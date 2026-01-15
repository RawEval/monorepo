import { Metadata } from 'next';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { StepNav } from '@/components/step-nav';
import {
  Video,
  Brain,
  Clock,
  CheckCircle2,
  Eye,
  Fingerprint,
  MessageSquare,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Expert Vetting - How It Works | RawEval',
  description:
    'Learn how RawEval vets domain experts through rigorous biometric interviews.',
};

export default function VettingPage() {
  return (
    <main className="bg-background min-h-screen">
      <Navbar />
      <div className="pt-16">
        <StepNav
          currentStep={2}
          totalSteps={4}
          prevLink="/how-it-works/capture"
          nextLink="/how-it-works/workbench"
          title="Expert Vetting"
          subtitle="30-minute deep-dive interviews to verify domain expertise"
        />

        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            {/* Hero */}
            <div className="mb-16 grid items-center gap-12 lg:grid-cols-2">
              <div>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2">
                  <Video className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">
                    Live verification
                  </span>
                </div>
                <h2 className="text-foreground mb-4 text-3xl font-semibold">
                  Only verified experts touch your data
                </h2>
                <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                  Every expert undergoes a 30-minute live interview with
                  biometric verification. We test actual domain knowledge, not
                  resumes or credentials alone.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                    <span className="text-foreground">
                      Live video with screen sharing required
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                    <span className="text-foreground">
                      Real-world problem solving, not multiple choice
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                    <span className="text-foreground">
                      Biometric identity verification
                    </span>
                  </div>
                </div>
              </div>
              <div className="border-border rounded-2xl border bg-gradient-to-br from-blue-50 to-white p-8">
                <div className="space-y-4">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
                      <Video className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="text-foreground font-semibold">
                        The Oracle Interview
                      </div>
                      <div className="text-muted-foreground text-sm">
                        8-phase adaptive assessment
                      </div>
                    </div>
                  </div>
                  {[
                    { phase: 1, name: 'Identity Verification', time: '2 min' },
                    { phase: 2, name: 'Background Check', time: '3 min' },
                    { phase: 3, name: 'Domain Fundamentals', time: '5 min' },
                    { phase: 4, name: 'Real-World Scenario', time: '8 min' },
                    { phase: 5, name: 'Edge Case Handling', time: '5 min' },
                    { phase: 6, name: 'Explanation Quality', time: '4 min' },
                    { phase: 7, name: 'Speed Assessment', time: '2 min' },
                    { phase: 8, name: 'Final Scoring', time: '1 min' },
                  ].map((phase) => (
                    <div
                      key={phase.phase}
                      className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                          {phase.phase}
                        </div>
                        <span className="text-foreground text-sm font-medium">
                          {phase.name}
                        </span>
                      </div>
                      <span className="text-muted-foreground font-metric text-xs">
                        {phase.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* What we test */}
            <div className="mb-16">
              <h3 className="text-foreground mb-8 text-center text-2xl font-semibold">
                What we evaluate
              </h3>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="border-border rounded-xl border bg-white p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                    <Brain className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="text-foreground mb-2 font-semibold">
                    Domain expertise
                  </h4>
                  <p className="text-muted-foreground mb-4 text-sm">
                    Can they solve real problems in their field? We present
                    actual failed prompts from our queue.
                  </p>
                  <div className="text-muted-foreground space-y-1 text-xs">
                    <div>• Depth of knowledge</div>
                    <div>• Problem-solving approach</div>
                    <div>• Ability to explain reasoning</div>
                  </div>
                </div>

                <div className="border-border rounded-xl border bg-white p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50">
                    <MessageSquare className="h-6 w-6 text-purple-600" />
                  </div>
                  <h4 className="text-foreground mb-2 font-semibold">
                    Communication quality
                  </h4>
                  <p className="text-muted-foreground mb-4 text-sm">
                    Can they articulate why a response is wrong and how to fix
                    it? Quality rubrics require clear explanation.
                  </p>
                  <div className="text-muted-foreground space-y-1 text-xs">
                    <div>• Clarity of explanation</div>
                    <div>• Teaching ability</div>
                    <div>• Technical writing</div>
                  </div>
                </div>

                <div className="border-border rounded-xl border bg-white p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                    <Clock className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h4 className="text-foreground mb-2 font-semibold">
                    Speed &amp; accuracy
                  </h4>
                  <p className="text-muted-foreground mb-4 text-sm">
                    Can they work efficiently without sacrificing quality? We
                    measure both speed and correctness.
                  </p>
                  <div className="text-muted-foreground space-y-1 text-xs">
                    <div>• Time to solution</div>
                    <div>• First-pass accuracy</div>
                    <div>• Attention to detail</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tiering system */}
            <div className="mb-16 rounded-2xl border border-slate-200 bg-slate-50 p-8">
              <h3 className="text-foreground mb-6 text-xl font-semibold">
                Weight of Evidence (WoE) Scoring
              </h3>
              <p className="text-muted-foreground mb-8">
                Our AI interviewer assigns a WoE score based on 20+ factors.
                This determines your initial tier and earning potential.
              </p>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-xl border-2 border-slate-200 bg-white p-6">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                      <span className="text-lg font-bold text-slate-600">
                        3
                      </span>
                    </div>
                    <div>
                      <div className="text-foreground font-semibold">
                        Tier 3
                      </div>
                      <div className="text-muted-foreground text-sm">
                        Standard
                      </div>
                    </div>
                  </div>
                  <div className="text-muted-foreground mb-2 text-sm">
                    WoE Score: 60-79
                  </div>
                  <div className="text-foreground mb-2 text-2xl font-bold">
                    $2-4
                  </div>
                  <div className="text-muted-foreground text-xs">
                    per prompt
                  </div>
                </div>

                <div className="rounded-xl border-2 border-blue-200 bg-white p-6">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                      <span className="text-lg font-bold text-blue-600">2</span>
                    </div>
                    <div>
                      <div className="text-foreground font-semibold">
                        Tier 2
                      </div>
                      <div className="text-sm text-blue-600">Verified</div>
                    </div>
                  </div>
                  <div className="text-muted-foreground mb-2 text-sm">
                    WoE Score: 80-89
                  </div>
                  <div className="mb-2 text-2xl font-bold text-blue-600">
                    $5-8
                  </div>
                  <div className="text-muted-foreground text-xs">
                    per prompt
                  </div>
                </div>

                <div className="rounded-xl border-2 border-amber-200 bg-white p-6 ring-2 ring-amber-100">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                      <span className="text-lg font-bold text-amber-600">
                        1
                      </span>
                    </div>
                    <div>
                      <div className="text-foreground font-semibold">
                        Tier 1
                      </div>
                      <div className="text-sm text-amber-600">
                        Gold Standard
                      </div>
                    </div>
                  </div>
                  <div className="text-muted-foreground mb-2 text-sm">
                    WoE Score: 90+
                  </div>
                  <div className="mb-2 text-2xl font-bold text-amber-600">
                    $10-15
                  </div>
                  <div className="text-muted-foreground text-xs">
                    per prompt
                  </div>
                </div>
              </div>
            </div>

            {/* Security measures */}
            <div className="mb-16">
              <h3 className="text-foreground mb-8 text-center text-2xl font-semibold">
                Security &amp; verification
              </h3>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="border-border rounded-xl border bg-white p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <Fingerprint className="h-8 w-8 text-blue-600" />
                    <h4 className="text-foreground font-semibold">
                      Biometric enrollment
                    </h4>
                  </div>
                  <p className="text-muted-foreground mb-3 text-sm">
                    Face scan and identity verification during interview. This
                    becomes your permanent profile for all future sessions.
                  </p>
                  <div className="text-muted-foreground rounded bg-slate-50 p-3 text-xs">
                    Prevents account sharing and ensures every correction is
                    traceable to a verified individual.
                  </div>
                </div>

                <div className="border-border rounded-xl border bg-white p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <Eye className="h-8 w-8 text-blue-600" />
                    <h4 className="text-foreground font-semibold">
                      Recording &amp; audit trail
                    </h4>
                  </div>
                  <p className="text-muted-foreground mb-3 text-sm">
                    Full interview recorded and analyzed by our AI grader. Helps
                    us improve the vetting process and detect fraud.
                  </p>
                  <div className="text-muted-foreground rounded bg-slate-50 p-3 text-xs">
                    Recordings are encrypted and stored for 90 days for quality
                    assurance purposes.
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mb-16 grid gap-6 md:grid-cols-4">
              <div className="border-border rounded-xl border bg-white p-6 text-center">
                <div className="mb-2 text-3xl font-bold text-blue-600">12%</div>
                <div className="text-muted-foreground text-sm">Pass rate</div>
              </div>
              <div className="border-border rounded-xl border bg-white p-6 text-center">
                <div className="mb-2 text-3xl font-bold text-blue-600">30m</div>
                <div className="text-muted-foreground text-sm">
                  Average interview
                </div>
              </div>
              <div className="border-border rounded-xl border bg-white p-6 text-center">
                <div className="mb-2 text-3xl font-bold text-blue-600">
                  2,400+
                </div>
                <div className="text-muted-foreground text-sm">
                  Verified experts
                </div>
              </div>
              <div className="border-border rounded-xl border bg-white p-6 text-center">
                <div className="mb-2 text-3xl font-bold text-blue-600">97%</div>
                <div className="text-muted-foreground text-sm">
                  Quality retention
                </div>
              </div>
            </div>

            {/* Why it matters */}
            <div className="rounded-2xl bg-blue-600 p-8 text-white">
              <h3 className="mb-4 text-2xl font-semibold">
                Why rigorous vetting matters
              </h3>
              <p className="mb-6 text-blue-100">
                Your training data is only as good as the humans who verify it.
                A low-quality expert produces low-quality corrections, which
                poison your model. We reject 88% of applicants to maintain the
                highest data quality standards in the industry.
              </p>
              <div className="grid gap-6 text-sm md:grid-cols-2">
                <div className="rounded-lg bg-white/10 p-4">
                  <div className="mb-2 font-semibold">Without vetting</div>
                  <div className="space-y-1 text-blue-100">
                    <div>• Anyone can claim expertise</div>
                    <div>• No accountability for errors</div>
                    <div>• Data quality varies wildly</div>
                    <div>• Models learn from mistakes</div>
                  </div>
                </div>
                <div className="rounded-lg bg-white/10 p-4">
                  <div className="mb-2 font-semibold">With RawEval vetting</div>
                  <div className="space-y-1 text-white">
                    <div>• Proven domain expertise</div>
                    <div>• Tracked quality scores</div>
                    <div>• Consistent high accuracy</div>
                    <div>• Gold standard corrections</div>
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
