import { Metadata } from 'next';
import { SectionHeader } from '@raweval/ui/section-header';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Blog | RawEval',
  description: 'Insights on AI evaluation, data quality, and model alignment.',
};

export default function BlogPage() {
  return (
    <main className="bg-background min-h-screen pt-24 lg:pt-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeader
          title="RawEval Blog"
          description="Latest updates, research, and thinking from the RawEval team."
          className="mb-16"
        />

        <div className="mb-24 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: 'The Problem with Synthetic Evaluation Data',
              date: 'January 15, 2026',
              category: 'Research',
              excerpt:
                'Why evaluating models with model-generated data creates a feedback loop of mediocrity.',
              readTime: '5 min read',
            },
            {
              title: 'Introducing the 3-3-3 Verification Protocol',
              date: 'January 8, 2026',
              category: 'Product',
              excerpt:
                'How we ensure 99.9% accuracy in data labeling through our multi-tier consensus system.',
              readTime: '4 min read',
            },
            {
              title: 'RawEval raises $12M Series A',
              date: 'December 20, 2025',
              category: 'Company',
              excerpt:
                'Accelerating our mission to build the gold standard for AI evaluation infrastructure.',
              readTime: '2 min read',
            },
            {
              title: 'Case Study: Scaling RLHF for Legal LLMs',
              date: 'December 5, 2025',
              category: 'Case Study',
              excerpt:
                'How a leading legal tech firm improved model accuracy by 40% using RawEval experts.',
              readTime: '8 min read',
            },
            {
              title: 'Detecting AI-Generated Text in 2026',
              date: 'November 28, 2025',
              category: 'Engineering',
              excerpt:
                'Our new keystroke dynamics and biometric analysis approach to anti-cheat.',
              readTime: '6 min read',
            },
            {
              title: 'The Future of Human Work in the AI Age',
              date: 'November 15, 2025',
              category: 'Opinion',
              excerpt:
                'As AI advances, the value of verified human judgment and expertise will only increase.',
              readTime: '5 min read',
            },
          ].map((post) => (
            <Link
              key={post.title}
              href={`/blog/${post.title.toLowerCase().replace(/ /g, '-')}`}
              className="border-border group flex flex-col overflow-hidden rounded-xl border bg-white transition-shadow hover:shadow-md"
            >
              <div className="flex h-48 items-center justify-center bg-slate-100 text-slate-400">
                {/* Placeholder for blog image */}
                <span className="text-sm">Image Placeholder</span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <div className="text-muted-foreground mb-3 flex items-center justify-between text-xs">
                  <span className="font-medium text-blue-600">
                    {post.category}
                  </span>
                  <span>{post.date}</span>
                </div>
                <h3 className="text-foreground mb-2 text-xl font-bold transition-colors group-hover:text-blue-600">
                  {post.title}
                </h3>
                <p className="text-muted-foreground mb-4 line-clamp-3 flex-1 text-sm">
                  {post.excerpt}
                </p>
                <div className="text-xs font-medium text-slate-500">
                  {post.readTime}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
