import { Metadata } from 'next';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { StepNav } from '@/components/step-nav';
import {
  Monitor,
  Camera,
  Shield,
  Clock,
  CheckCircle2,
  Lock,
  Keyboard,
  Activity,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Secure Workbench - How It Works | RawEval',
  description:
    "Learn how RawEval's secure workbench ensures quality with continuous monitoring.",
};

export default function WorkbenchPage() {
  return (
    <main className="bg-background min-h-screen">
      <Navbar />
      <div className="pt-16">
        <StepNav
          currentStep={3}
          totalSteps={4}
          prevLink="/how-it-works/vetting"
          nextLink="/how-it-works/delivery"
          title="Secure Workbench"
          subtitle="Task completion with continuous verification"
        />

        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            {/* Hero */}
            <div className="mb-16 grid items-center gap-12 lg:grid-cols-2">
              <div>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">
                    Iron Dome Security
                  </span>
                </div>
                <h2 className="text-foreground mb-4 text-3xl font-semibold">
                  The 3-3-3 System
                </h2>
                <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                  Every batch of 10 failed prompts is evaluated by 9 experts: 3
                  from each tier. All work happens in our secure workbench with
                  continuous monitoring to prevent AI contamination.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                    <span className="text-foreground">
                      Live camera and screen sharing required
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                    <span className="text-foreground">
                      60-second heartbeat verification
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                    <span className="text-foreground">
                      Keystroke pattern analysis
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                    <span className="text-foreground">
                      Instant session lock on violations
                    </span>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white">
                <div className="space-y-6">
                  <div>
                    <div className="mb-2 text-sm text-slate-400">
                      Active Security Checks
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4">
                        <div className="mb-1 flex items-center gap-2">
                          <Camera className="h-4 w-4 text-emerald-400" />
                          <span className="text-sm font-medium">Camera</span>
                        </div>
                        <div className="text-xs text-emerald-400">
                          Face detected ✓
                        </div>
                      </div>
                      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4">
                        <div className="mb-1 flex items-center gap-2">
                          <Monitor className="h-4 w-4 text-emerald-400" />
                          <span className="text-sm font-medium">Screen</span>
                        </div>
                        <div className="text-xs text-emerald-400">
                          Recording ✓
                        </div>
                      </div>
                      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4">
                        <div className="mb-1 flex items-center gap-2">
                          <Activity className="h-4 w-4 text-emerald-400" />
                          <span className="text-sm font-medium">Heartbeat</span>
                        </div>
                        <div className="text-xs text-emerald-400">42ms ✓</div>
                      </div>
                      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4">
                        <div className="mb-1 flex items-center gap-2">
                          <Keyboard className="h-4 w-4 text-emerald-400" />
                          <span className="text-sm font-medium">
                            Keystrokes
                          </span>
                        </div>
                        <div className="text-xs text-emerald-400">
                          Organic ✓
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
                    <div className="mb-2 text-sm font-medium">Current Task</div>
                    <div className="mb-1 text-xs text-slate-400">
                      Task #2847 • Python Code Generation
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Clock className="h-3 w-3 text-amber-400" />
                      <span className="font-metric text-amber-400">
                        12:34 remaining
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-500">
                    All activity monitored and recorded. Session auto-locks on
                    security violations.
                  </div>
                </div>
              </div>
            </div>

            {/* Security layers */}
            <div className="mb-16">
              <h3 className="text-foreground mb-8 text-center text-2xl font-semibold">
                Security layers
              </h3>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="border-border rounded-xl border bg-white p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                    <Camera className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="text-foreground mb-2 font-semibold">
                    Face detection
                  </h4>
                  <p className="text-muted-foreground mb-4 text-sm">
                    Every 60 seconds, we verify the expert&apos;s face is in
                    frame. If they leave or someone else appears, the session
                    locks immediately.
                  </p>
                  <div className="text-muted-foreground space-y-1 text-xs">
                    <div>• Deepfake detection</div>
                    <div>• Multiple face detection</div>
                    <div>• Phone in frame detection</div>
                    <div>• Lighting quality checks</div>
                  </div>
                </div>

                <div className="border-border rounded-xl border bg-white p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50">
                    <Keyboard className="h-6 w-6 text-purple-600" />
                  </div>
                  <h4 className="text-foreground mb-2 font-semibold">
                    Keystroke analysis
                  </h4>
                  <p className="text-muted-foreground mb-4 text-sm">
                    We analyze typing patterns to detect copy-paste from AI
                    tools. Organic human typing has distinct rhythm; AI pastes
                    are instant.
                  </p>
                  <div className="text-muted-foreground space-y-1 text-xs">
                    <div>• Typing speed patterns</div>
                    <div>• Copy-paste detection</div>
                    <div>• Burst vs steady typing</div>
                    <div>• Clipboard monitoring</div>
                  </div>
                </div>

                <div className="border-border rounded-xl border bg-white p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                    <Monitor className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h4 className="text-foreground mb-2 font-semibold">
                    Screen monitoring
                  </h4>
                  <p className="text-muted-foreground mb-4 text-sm">
                    Full screen capture ensures experts only use approved tools.
                    Any attempt to access external AI tools results in instant
                    lock.
                  </p>
                  <div className="text-muted-foreground space-y-1 text-xs">
                    <div>• Window title detection</div>
                    <div>• Browser tab monitoring</div>
                    <div>• ChatGPT/Claude detection</div>
                    <div>• Screen recording</div>
                  </div>
                </div>
              </div>
            </div>

            {/* What happens on violation */}
            <div className="mb-16 rounded-2xl border-2 border-red-200 bg-red-50 p-8">
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100">
                  <Lock className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-foreground mb-2 text-xl font-semibold">
                    UI_OVERLAY_LOCK
                  </h3>
                  <p className="text-muted-foreground">
                    When a violation is detected, the workbench immediately
                    locks. The expert can no longer see the prompt or submit
                    work. The task is reassigned to another expert.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg bg-white p-4">
                  <div className="text-foreground mb-2 text-sm font-medium">
                    Violations that trigger lock
                  </div>
                  <div className="text-muted-foreground space-y-1 text-xs">
                    <div>• Face disappears from camera</div>
                    <div>• Multiple faces detected</div>
                    <div>• Phone detected in frame</div>
                    <div>• Copy-paste detected</div>
                    <div>• ChatGPT/Claude opened</div>
                    <div>• Screen share disconnected</div>
                  </div>
                </div>

                <div className="rounded-lg bg-white p-4">
                  <div className="text-foreground mb-2 text-sm font-medium">
                    Immediate consequences
                  </div>
                  <div className="text-muted-foreground space-y-1 text-xs">
                    <div>• Prompt removed from view</div>
                    <div>• Submit button disabled</div>
                    <div>• Task voided (no payment)</div>
                    <div>• Quality score impacted</div>
                    <div>• Account flagged for review</div>
                  </div>
                </div>

                <div className="rounded-lg bg-white p-4">
                  <div className="text-foreground mb-2 text-sm font-medium">
                    Task reassignment
                  </div>
                  <div className="text-muted-foreground space-y-1 text-xs">
                    <div>• Auto-queued for new expert</div>
                    <div>• Original expert notified</div>
                    <div>• Incident logged</div>
                    <div>• Client data protected</div>
                    <div>• Zero data leakage</div>
                  </div>
                </div>
              </div>
            </div>

            {/* The 3-3-3 System */}
            <div className="mb-16 rounded-2xl border border-slate-200 bg-slate-50 p-8">
              <h3 className="text-foreground mb-6 text-xl font-semibold">
                How 3-3-3 works
              </h3>
              <p className="text-muted-foreground mb-8">
                Each batch of 10 failed prompts is distributed to 9 experts
                across 3 tiers. This multi-tier validation ensures quality while
                providing comparative data.
              </p>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-xl border-2 border-amber-200 bg-white p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                      <span className="text-lg font-bold text-amber-600">
                        3
                      </span>
                    </div>
                    <div>
                      <div className="text-foreground font-semibold">
                        Tier 1 Experts
                      </div>
                      <div className="text-sm text-amber-600">
                        Gold Standard
                      </div>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-3 text-sm">
                    Their corrections define the gold standard. Tier 2/3 answers
                    are compared against them.
                  </p>
                  <div className="text-muted-foreground rounded bg-amber-50 p-3 text-xs">
                    Sets the benchmark for quality scoring
                  </div>
                </div>

                <div className="rounded-xl border-2 border-blue-200 bg-white p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                      <span className="text-lg font-bold text-blue-600">3</span>
                    </div>
                    <div>
                      <div className="text-foreground font-semibold">
                        Tier 2 Experts
                      </div>
                      <div className="text-sm text-blue-600">Verified</div>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-3 text-sm">
                    Proven track record. Their answers are quality-checked
                    against Tier 1 for accuracy.
                  </p>
                  <div className="text-muted-foreground rounded bg-blue-50 p-3 text-xs">
                    Provides high-quality comparative data
                  </div>
                </div>

                <div className="rounded-xl border-2 border-slate-200 bg-white p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                      <span className="text-lg font-bold text-slate-600">
                        3
                      </span>
                    </div>
                    <div>
                      <div className="text-foreground font-semibold">
                        Tier 3 Experts
                      </div>
                      <div className="text-sm text-slate-600">Standard</div>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-3 text-sm">
                    New experts building their reputation. Provides baseline
                    comparison data.
                  </p>
                  <div className="text-muted-foreground rounded bg-slate-50 p-3 text-xs">
                    Establishes difficulty baseline
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mb-16 grid gap-6 md:grid-cols-4">
              <div className="border-border rounded-xl border bg-white p-6 text-center">
                <div className="mb-2 text-3xl font-bold text-blue-600">60s</div>
                <div className="text-muted-foreground text-sm">
                  Heartbeat interval
                </div>
              </div>
              <div className="border-border rounded-xl border bg-white p-6 text-center">
                <div className="mb-2 text-3xl font-bold text-blue-600">
                  99.8%
                </div>
                <div className="text-muted-foreground text-sm">
                  Session completion
                </div>
              </div>
              <div className="border-border rounded-xl border bg-white p-6 text-center">
                <div className="mb-2 text-3xl font-bold text-blue-600">
                  &lt;0.1%
                </div>
                <div className="text-muted-foreground text-sm">
                  AI contamination
                </div>
              </div>
              <div className="border-border rounded-xl border bg-white p-6 text-center">
                <div className="mb-2 text-3xl font-bold text-blue-600">
                  100%
                </div>
                <div className="text-muted-foreground text-sm">
                  Violations caught
                </div>
              </div>
            </div>

            {/* Why this matters */}
            <div className="rounded-2xl bg-blue-600 p-8 text-white">
              <h3 className="mb-4 text-2xl font-semibold">
                Why continuous monitoring matters
              </h3>
              <p className="mb-6 text-blue-100">
                Without monitoring, experts could use AI tools to generate
                corrections, defeating the entire purpose of human verification.
                Our Iron Dome security ensures every correction is genuinely
                human.
              </p>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="mb-3 font-medium text-blue-100">
                    Without monitoring
                  </h4>
                  <ul className="space-y-2 text-sm text-blue-100">
                    <li>✗ Experts use ChatGPT for answers</li>
                    <li>✗ No way to detect AI contamination</li>
                    <li>✗ Training data quality unknown</li>
                    <li>✗ Model learns from AI, not humans</li>
                  </ul>
                </div>
                <div>
                  <h4 className="mb-3 font-medium">With Iron Dome</h4>
                  <ul className="space-y-2 text-sm text-white">
                    <li>✓ 100% human-generated corrections</li>
                    <li>✓ AI tool usage instantly detected</li>
                    <li>✓ Guaranteed data authenticity</li>
                    <li>✓ True human intelligence captured</li>
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
