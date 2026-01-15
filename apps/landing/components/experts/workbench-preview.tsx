'use client';

import {
  Monitor,
  Clock,
  FileText,
  CheckCircle2,
  Edit3,
  Camera,
  Shield,
  MessageSquare,
  Send,
  Eye,
} from 'lucide-react';

export function WorkbenchPreview() {
  return (
    <section className="bg-slate-900 py-24 text-white lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium text-purple-400">
            The Workbench
          </p>
          <h2 className="mb-4 text-3xl font-semibold md:text-4xl">
            Your secure workspace
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-400">
            A clean, focused interface designed for efficient prompt correction.
            Everything you need, nothing you don't.
          </p>
        </div>

        {/* Workbench preview mockup */}
        <div className="relative mb-12 overflow-hidden rounded-2xl border border-slate-700">
          {/* Browser chrome */}
          <div className="flex items-center gap-2 border-b border-slate-700 bg-slate-800 px-4 py-3">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <div className="h-3 w-3 rounded-full bg-amber-500" />
              <div className="h-3 w-3 rounded-full bg-emerald-500" />
            </div>
            <div className="flex-1 text-center">
              <span className="font-metric text-xs text-slate-500">
                workbench.raweval.com
              </span>
            </div>
          </div>

          {/* Workbench UI */}
          <div className="bg-slate-950 p-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
              {/* Main content area */}
              <div className="space-y-4">
                {/* Task header */}
                <div className="flex items-center justify-between rounded-lg bg-slate-800 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
                      <FileText className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Task #2847</div>
                      <div className="text-xs text-slate-400">
                        Code Generation • Python
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-400" />
                    <span className="font-metric text-sm text-amber-400">
                      12:34 remaining
                    </span>
                  </div>
                </div>

                {/* Original prompt */}
                <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-slate-400" />
                    <span className="text-xs font-medium tracking-wider text-slate-400 uppercase">
                      User Prompt
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-200">
                    Write a Python function that sorts a list of dictionaries by
                    a specific key, handling cases where the key might be
                    missing in some dictionaries.
                  </p>
                </div>

                {/* Model response */}
                <div className="rounded-lg border border-red-500/30 bg-slate-800/50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium tracking-wider text-slate-400 uppercase">
                        Model Response
                      </span>
                      <span className="rounded bg-red-500/20 px-2 py-0.5 text-[10px] font-medium text-red-400">
                        Needs Correction
                      </span>
                    </div>
                  </div>
                  <div className="overflow-x-auto rounded bg-slate-900 p-3 font-mono text-sm text-slate-300">
                    <pre>{`def sort_dicts(lst, key):
    return sorted(lst, key=lambda x: x[key])`}</pre>
                  </div>
                  <p className="mt-3 text-xs text-red-400">
                    ⚠ Missing handling for dictionaries without the specified
                    key
                  </p>
                </div>

                {/* Your correction */}
                <div className="rounded-lg border border-emerald-500/30 bg-slate-800/50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Edit3 className="h-4 w-4 text-emerald-400" />
                      <span className="text-xs font-medium tracking-wider text-slate-400 uppercase">
                        Your Correction
                      </span>
                    </div>
                  </div>
                  <div className="overflow-x-auto rounded bg-slate-900 p-3 font-mono text-sm text-emerald-200">
                    <pre>{`def sort_dicts(lst, key, default=None):
    return sorted(lst, key=lambda x: x.get(key, default))`}</pre>
                  </div>
                </div>

                {/* Rubric */}
                <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-slate-400" />
                    <span className="text-xs font-medium tracking-wider text-slate-400 uppercase">
                      Explain Your Fix
                    </span>
                  </div>
                  <textarea
                    className="h-20 w-full resize-none rounded-lg border border-slate-700 bg-slate-900 p-3 text-sm text-slate-200 placeholder-slate-500"
                    placeholder="Added .get() method with default parameter to handle missing keys gracefully..."
                    defaultValue="Added .get() method with optional default parameter to handle cases where dictionaries might not contain the specified key, preventing KeyError exceptions."
                  />
                </div>

                {/* Submit button */}
                <div className="flex justify-end">
                  <button className="flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 font-medium transition-colors hover:bg-emerald-500">
                    <Send className="h-4 w-4" />
                    Submit Correction
                  </button>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* Your status */}
                <div className="rounded-lg bg-slate-800 p-4">
                  <div className="mb-3 text-xs font-medium tracking-wider text-slate-400 uppercase">
                    Your Session
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20">
                        <Camera className="h-4 w-4 text-emerald-400" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm">Camera Active</div>
                        <div className="text-xs text-emerald-400">
                          Face verified
                        </div>
                      </div>
                      <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20">
                        <Monitor className="h-4 w-4 text-emerald-400" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm">Screen Shared</div>
                        <div className="text-xs text-emerald-400">
                          Recording
                        </div>
                      </div>
                      <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20">
                        <Shield className="h-4 w-4 text-emerald-400" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm">Security Check</div>
                        <div className="text-xs text-emerald-400">
                          All clear
                        </div>
                      </div>
                      <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    </div>
                  </div>
                </div>

                {/* Task queue */}
                <div className="rounded-lg bg-slate-800 p-4">
                  <div className="mb-3 text-xs font-medium tracking-wider text-slate-400 uppercase">
                    Queue
                  </div>
                  <div className="space-y-2">
                    <div className="rounded border border-blue-500/20 bg-blue-500/10 p-2 text-xs">
                      <span className="text-blue-400">Current:</span> Task #2847
                    </div>
                    <div className="rounded bg-slate-700/50 p-2 text-xs text-slate-400">
                      Next: Task #2848
                    </div>
                    <div className="rounded bg-slate-700/50 p-2 text-xs text-slate-400">
                      +3 more in queue
                    </div>
                  </div>
                </div>

                {/* Today's stats */}
                <div className="rounded-lg bg-slate-800 p-4">
                  <div className="mb-3 text-xs font-medium tracking-wider text-slate-400 uppercase">
                    Today
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded bg-slate-900 p-2 text-center">
                      <div className="text-xl font-bold text-white">7</div>
                      <div className="text-[10px] text-slate-400">
                        Completed
                      </div>
                    </div>
                    <div className="rounded bg-slate-900 p-2 text-center">
                      <div className="text-xl font-bold text-emerald-400">
                        $42
                      </div>
                      <div className="text-[10px] text-slate-400">Earned</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
              <Eye className="h-5 w-5 text-blue-400" />
            </div>
            <h3 className="mb-2 font-semibold">Clear task presentation</h3>
            <p className="text-sm text-slate-400">
              See the original prompt, model response, and exactly what needs
              fixing — all in one view.
            </p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
              <Edit3 className="h-5 w-5 text-emerald-400" />
            </div>
            <h3 className="mb-2 font-semibold">Built-in code editor</h3>
            <p className="text-sm text-slate-400">
              Syntax highlighting, auto-complete, and diff view for code-related
              tasks.
            </p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
              <Shield className="h-5 w-5 text-purple-400" />
            </div>
            <h3 className="mb-2 font-semibold">Secure verification</h3>
            <p className="text-sm text-slate-400">
              Face and screen monitoring runs quietly in the background. No
              intrusive pop-ups.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
