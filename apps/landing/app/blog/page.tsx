import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Blog | RawEval',
  description: 'Insights on AI evaluation, data quality, and model alignment from the RawEval team.',
};

const posts = [
  { title: 'The Problem with Synthetic Evaluation Data', date: 'Jan 15, 2026', category: 'Research', excerpt: 'Why evaluating models with model-generated data creates a feedback loop of mediocrity — and how to break out of it.', readTime: '5 min', slug: 'synthetic-evaluation-problem' },
  { title: 'Introducing the 3-3-3 Verification Protocol', date: 'Jan 8, 2026', category: 'Product', excerpt: 'How we ensure 99.9% accuracy in data labeling through our multi-tier expert consensus system.', readTime: '4 min', slug: '3-3-3-verification' },
  { title: 'Case Study: Scaling RLHF for Legal LLMs', date: 'Dec 5, 2025', category: 'Case Study', excerpt: 'How a leading legal tech firm improved model accuracy by 40% using verified RawEval expert annotations.', readTime: '8 min', slug: 'legal-llm-case-study' },
  { title: 'Detecting AI-Generated Text in 2026', date: 'Nov 28, 2025', category: 'Engineering', excerpt: 'Our new keystroke dynamics and biometric analysis approach to anti-cheat detection in expert annotation.', readTime: '6 min', slug: 'detecting-ai-text-2026' },
  { title: 'Why RLHF Needs a Supply Chain', date: 'Nov 15, 2025', category: 'Research', excerpt: 'Treating human feedback as a supply chain problem — with quality controls, traceability, and sourcing standards.', readTime: '7 min', slug: 'rlhf-supply-chain' },
  { title: 'The Future of Human Work in the AI Age', date: 'Oct 30, 2025', category: 'Opinion', excerpt: 'As AI advances, the value of verified human judgment and domain expertise will only increase — not decrease.', readTime: '5 min', slug: 'future-of-human-work' },
];

export default function BlogPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--color-bg-base)', paddingTop: 'calc(56px + var(--section-y))' }}>
      <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: '0 var(--section-x)', paddingBottom: 'var(--section-y)' }}>

        <div style={{ marginBottom: 'var(--space-16)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-signal)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', marginBottom: 'var(--space-5)' }}>Blog</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-4xl)', color: 'var(--color-text-primary)', lineHeight: 'var(--leading-tight)', fontWeight: 400, margin: '0 0 var(--space-5)' }}>
            Writing on evaluation,<br />quality, and alignment.
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-md)', color: 'var(--color-text-muted)', maxWidth: 480, margin: 0 }}>
            Research, product updates, and long-form thinking from the RawEval team.
          </p>
        </div>

        <div className="grid-cols-3-md">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              style={{ display: 'block', textDecoration: 'none', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-6)' }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-signal)', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase' }}>{post.category}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-text-faint)', letterSpacing: 'var(--tracking-wide)' }}>{post.readTime}</span>
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', color: 'var(--color-text-primary)', lineHeight: 'var(--leading-snug)', fontWeight: 400, margin: '0 0 var(--space-3)' }}>{post.title}</h3>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)', margin: '0 0 var(--space-4)' }}>{post.excerpt}</p>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-faint)', letterSpacing: 'var(--tracking-wide)' }}>{post.date}</div>
            </Link>
          ))}
        </div>

      </div>
    </main>
  );
}
