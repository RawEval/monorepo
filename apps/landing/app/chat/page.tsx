import { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@raweval/ui/button';
import { appUrls } from '@raweval/utils/urls';
import {
  MessageSquare,
  Image as ImageIcon,
  Mic,
  Upload,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Users,
  Shield,
  Zap,
  DollarSign,
  FileText,
  Video,
  Code,
  ArrowRight,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'RawEval Chat | AI-Powered Assistant',
  description:
    'Experience our reinforced AI chatbot with multimodal support. Help improve AI by flagging incorrect responses and earn as an expert.',
};

export default function ChatPage() {
  return (
    <main className="bg-background min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-blue-50/50 via-white to-white pt-32 pb-20 lg:pt-40 lg:pb-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-12 text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
              <MessageSquare className="h-4 w-4" />
              <span>Powered by Human-Verified AI</span>
            </div>
            <h1 className="text-foreground mb-6 text-4xl font-bold md:text-5xl lg:text-6xl">
              The AI Assistant That Gets Better With You
            </h1>
            <p className="text-muted-foreground mx-auto mb-8 max-w-3xl text-lg md:text-xl">
              Chat with our multimodal AI assistant, flag incorrect responses,
              and help train the next generation of AI—or become an expert and
              earn money reviewing prompts.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" className="h-12 px-8" asChild>
                <Link href={appUrls.chat()}>
                  Start Chatting Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="h-12 px-8" asChild>
                <Link href={appUrls.experts()}>Become an Expert</Link>
              </Button>
            </div>
          </div>

          {/* Chat Interface Preview */}
          <div className="mx-auto max-w-5xl">
            <div className="border-border overflow-hidden rounded-2xl border bg-white shadow-2xl">
              {/* Chat Header */}
              <div className="border-border flex items-center justify-between border-b bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600">
                    <MessageSquare className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-foreground font-semibold">
                      RawEval Assistant
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-emerald-600">
                      <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                      Online • Human-Verified
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground rounded-full border bg-white px-3 py-1 text-xs">
                    96.8% Accuracy
                  </span>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="h-96 space-y-4 overflow-y-auto bg-slate-50/50 p-6">
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="max-w-[70%] rounded-2xl rounded-tr-sm bg-blue-600 px-4 py-3 text-white">
                    <p className="text-sm">
                      How do I implement a binary search tree in Python with
                      O(log n) insertion?
                    </p>
                  </div>
                </div>

                {/* AI Response */}
                <div className="flex justify-start">
                  <div className="max-w-[80%]">
                    <div className="border-border rounded-2xl rounded-tl-sm border bg-white px-4 py-3 shadow-sm">
                      <p className="text-foreground mb-3 text-sm">
                        Here&apos;s an efficient implementation of a Binary
                        Search Tree in Python with O(log n) insertion:
                      </p>
                      <div className="mb-3 rounded-lg bg-slate-900 p-3">
                        <code className="font-mono text-xs text-emerald-400">
                          {`class Node:
    def __init__(self, data):
        self.data = data
        self.left = None
        self.right = None

class BST:
    def __init__(self):
        self.root = None
    
    def insert(self, data):
        self.root = self._insert_recursive(self.root, data)
    
    def _insert_recursive(self, node, data):
        if node is None:
            return Node(data)
        if data < node.data:
            node.left = self._insert_recursive(node.left, data)
        else:
            node.right = self._insert_recursive(node.right, data)
        return node`}
                        </code>
                      </div>
                      <p className="text-muted-foreground text-xs">
                        This implementation ensures O(log n) average case
                        insertion in a balanced tree.
                      </p>
                    </div>

                    {/* Response Actions */}
                    <div className="mt-2 ml-2 flex items-center gap-2">
                      <button className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-xs text-emerald-700 transition-colors hover:bg-emerald-100">
                        <CheckCircle2 className="h-3 w-3" />
                        Correct
                      </button>
                      <button className="flex items-center gap-1 rounded-full bg-red-50 px-3 py-1.5 text-xs text-red-700 transition-colors hover:bg-red-100">
                        <AlertCircle className="h-3 w-3" />
                        Mark Wrong
                      </button>
                      <span className="text-muted-foreground ml-2 text-xs">
                        Verified by 3 experts
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Input Area */}
              <div className="border-border border-t bg-white p-4">
                <div className="flex items-end gap-3">
                  <div className="relative flex-1">
                    <textarea
                      placeholder="Ask anything... Support for text, images, code, and more"
                      className="border-border w-full resize-none rounded-xl border px-4 py-3 pr-32 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      rows={2}
                    />
                    <div className="absolute right-2 bottom-2 flex items-center gap-1">
                      <button
                        className="rounded-lg p-2 transition-colors hover:bg-slate-100"
                        title="Upload image"
                      >
                        <ImageIcon className="text-muted-foreground h-4 w-4" />
                      </button>
                      <button
                        className="rounded-lg p-2 transition-colors hover:bg-slate-100"
                        title="Voice input"
                      >
                        <Mic className="text-muted-foreground h-4 w-4" />
                      </button>
                      <button
                        className="rounded-lg p-2 transition-colors hover:bg-slate-100"
                        title="Upload file"
                      >
                        <Upload className="text-muted-foreground h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <Button className="h-11 px-6">Send</Button>
                </div>
                <p className="text-muted-foreground mt-2 text-xs">
                  By using RawEval Chat, you help improve AI for everyone.
                  Incorrect responses can be flagged and reviewed by experts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-white py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="text-foreground mb-4 text-3xl font-bold">
              Multimodal AI, Reinforced by Humans
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
              Unlike generic chatbots, RawEval Chat is continuously improved by
              domain experts reviewing and correcting responses.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="border-border rounded-xl border bg-slate-50 p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-foreground mb-2 text-xl font-semibold">
                Text Generation
              </h3>
              <p className="text-muted-foreground text-sm">
                Advanced natural language understanding for complex queries,
                coding problems, research, and creative writing.
              </p>
            </div>

            <div className="border-border rounded-xl border bg-slate-50 p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                <ImageIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-foreground mb-2 text-xl font-semibold">
                Image Analysis
              </h3>
              <p className="text-muted-foreground text-sm">
                Upload images for object detection, OCR, visual Q&A, and
                detailed scene understanding.
              </p>
            </div>

            <div className="border-border rounded-xl border bg-slate-50 p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                <Code className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-foreground mb-2 text-xl font-semibold">
                Code Assistance
              </h3>
              <p className="text-muted-foreground text-sm">
                Debug, refactor, and generate code across 50+ programming
                languages with expert-verified solutions.
              </p>
            </div>

            <div className="border-border rounded-xl border bg-slate-50 p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                <Video className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-foreground mb-2 text-xl font-semibold">
                Video Understanding
              </h3>
              <p className="text-muted-foreground text-sm">
                Analyze video content, extract key frames, transcribe audio, and
                get summaries of long-form content.
              </p>
            </div>

            <div className="border-border rounded-xl border bg-slate-50 p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-foreground mb-2 text-xl font-semibold">
                Document Processing
              </h3>
              <p className="text-muted-foreground text-sm">
                Upload PDFs, spreadsheets, and documents for intelligent
                parsing, summarization, and Q&A.
              </p>
            </div>

            <div className="border-border rounded-xl border bg-slate-50 p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-foreground mb-2 text-xl font-semibold">
                Expert-Verified
              </h3>
              <p className="text-muted-foreground text-sm">
                All responses can be verified by domain experts, ensuring
                accuracy for critical use cases.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-slate-50 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="text-foreground mb-4 text-3xl font-bold">
              How Flagging Works
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
              Help improve AI by identifying incorrect or incomplete responses.
              Your feedback trains better models.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="relative">
              <div className="border-border h-full rounded-2xl border bg-white p-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-xl font-bold text-red-600">
                  1
                </div>
                <h3 className="text-foreground mb-3 text-xl font-semibold">
                  Mark as Wrong
                </h3>
                <p className="text-muted-foreground mb-4">
                  If you receive an incorrect, incomplete, or misleading
                  response, click the "Mark Wrong" button below the message.
                </p>
                <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                  <p className="text-sm text-red-700">
                    💡 Be specific: Briefly describe what&apos;s wrong (e.g.,
                    "Incorrect formula" or "Outdated information")
                  </p>
                </div>
              </div>
              <div className="absolute top-1/2 -right-4 z-10 hidden -translate-y-1/2 lg:block">
                <ArrowRight className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="relative">
              <div className="border-border h-full rounded-2xl border bg-white p-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-600">
                  2
                </div>
                <h3 className="text-foreground mb-3 text-xl font-semibold">
                  Expert Review Queue
                </h3>
                <p className="text-muted-foreground mb-4">
                  Your flagged prompt enters a high-priority queue where domain
                  experts (verified PhDs, professionals) review and correct it.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="text-muted-foreground">
                      Reviewed by 3-9 experts per tier
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span className="text-muted-foreground">
                      Avg. turnaround: 4.2 hours
                    </span>
                  </div>
                </div>
              </div>
              <div className="absolute top-1/2 -right-4 z-10 hidden -translate-y-1/2 lg:block">
                <ArrowRight className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="border-border h-full rounded-2xl border bg-white p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-xl font-bold text-emerald-600">
                3
              </div>
              <h3 className="text-foreground mb-3 text-xl font-semibold">
                Model Improvement
              </h3>
              <p className="text-muted-foreground mb-4">
                The corrected response becomes part of our gold-standard
                training data, improving future AI responses for everyone.
              </p>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                <p className="text-sm font-medium text-emerald-700">
                  +34% average improvement in accuracy after expert corrections
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Become an Expert CTA */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-700 py-24 text-white lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                Turn Your Expertise Into Income
              </h2>
              <p className="mb-6 text-lg text-blue-100">
                If you&apos;re a domain expert, join our workbench to review
                flagged prompts and earn money. Work on your schedule, get paid
                per prompt, and help shape the future of AI.
              </p>
              <ul className="mb-8 space-y-3">
                <li className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-blue-300" />
                  <span>$2-15 per prompt based on complexity and tier</span>
                </li>
                <li className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-blue-300" />
                  <span>
                    Flexible hours - work as much or as little as you want
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-blue-300" />
                  <span>Secure workbench with biometric verification</span>
                </li>
                <li className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-blue-300" />
                  <span>Advance through tiers for higher pay</span>
                </li>
              </ul>
              <Button
                size="lg"
                variant="outline"
                className="h-12 bg-white px-8 text-blue-600 hover:bg-blue-50"
                asChild
              >
                <Link href={appUrls.experts()}>
                  Join the Workbench
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 p-8 backdrop-blur-sm">
              <h3 className="mb-6 text-xl font-semibold">Expert Stats</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="mb-1 text-3xl font-bold">2,400+</div>
                  <div className="text-sm text-blue-100">Active Experts</div>
                </div>
                <div>
                  <div className="mb-1 text-3xl font-bold">$680K+</div>
                  <div className="text-sm text-blue-100">Paid Out (YTD)</div>
                </div>
                <div>
                  <div className="mb-1 text-3xl font-bold">47K+</div>
                  <div className="text-sm text-blue-100">Prompts Reviewed</div>
                </div>
                <div>
                  <div className="mb-1 text-3xl font-bold">96.8%</div>
                  <div className="text-sm text-blue-100">Avg Accuracy</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
