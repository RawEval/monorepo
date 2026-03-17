import { Metadata } from 'next';
import Link from 'next/link';
import { blogPosts, getAllCategories, getFeaturedPost } from '@/lib/blog-data';
import { BlogIllustration } from '@/components/blog-illustration';

export const metadata: Metadata = {
  title: 'Blog | RawEval — AI Evaluation Infrastructure',
  description: 'Insights on AI training data quality, RLHF supply chains, synthetic data collapse, expert evaluation networks, and the future of human-AI alignment from the RawEval team.',
  openGraph: {
    title: 'Blog | RawEval',
    description: 'Research, market analysis, and long-form thinking on AI evaluation infrastructure.',
    type: 'website',
  },
  keywords: [
    'AI training data', 'RLHF', 'data quality', 'AI evaluation',
    'synthetic data', 'model collapse', 'EU AI Act', 'training data provenance',
    'expert annotation', 'human feedback', 'AI alignment', 'data labeling',
  ],
};

export default function BlogPage() {
  const featured = getFeaturedPost();
  const categories = getAllCategories();
  const nonFeaturedPosts = blogPosts.filter((p) => !p.featured);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-base)', paddingTop: 'var(--section-y)' }}>
      <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: '0 var(--section-x)', paddingBottom: 'var(--section-y)' }}>

        {/* ─── Header ─── */}
        <div style={{ marginBottom: 'var(--space-12)' }}>
          <div className="eyebrow">
            <span className="eyebrow-text">Blog</span>
          </div>
          <h1
            className="page-heading"
            style={{ color: 'var(--color-text-primary)', margin: '0 0 var(--space-5)' }}
          >
            Writing on evaluation,<br />quality, and alignment.
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-md)',
            color: 'var(--color-text-muted)',
            maxWidth: 520,
            margin: 0,
            lineHeight: 'var(--leading-relaxed)',
          }}>
            Research, market analysis, and long-form thinking from the RawEval team.
            We write about what we know — building infrastructure for verified human judgment in AI.
          </p>
        </div>

        {/* ─── Category pills ─── */}
        <div style={{
          display: 'flex',
          gap: 'var(--space-2)',
          flexWrap: 'wrap',
          marginBottom: 'var(--space-12)',
          paddingBottom: 'var(--space-6)',
          borderBottom: '1px solid var(--color-border)',
        }}>
          <span
            className="mono-label"
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-signal)',
              color: '#fff',
              fontSize: '11px',
              cursor: 'default',
            }}
          >
            All
          </span>
          {categories.map((cat) => (
            <span
              key={cat}
              className="mono-label"
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-muted)',
                fontSize: '11px',
                cursor: 'default',
              }}
            >
              {cat}
            </span>
          ))}
        </div>

        {/* ─── Featured post ─── */}
        {featured && (
          <Link
            href={`/blog/${featured.slug}`}
            className="hover-lift"
            style={{
              display: 'block',
              textDecoration: 'none',
              marginBottom: 'var(--space-16)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              background: 'var(--color-bg-surface)',
            }}
          >
            <BlogIllustration type={featured.illustration} />
            <div style={{ padding: 'var(--space-8)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                <span className="mono-label" style={{
                  color: 'var(--color-text-inverse)',
                  background: 'var(--color-signal)',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '10px',
                }}>
                  Featured
                </span>
                <span className="mono-label" style={{ color: 'var(--color-signal)', fontSize: '11px' }}>
                  {featured.category}
                </span>
                <span style={{ flex: 1 }} />
                <span className="mono-label" style={{ color: 'var(--color-text-faint)', fontSize: '11px' }}>
                  {featured.readTime} read
                </span>
              </div>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-3xl)',
                color: 'var(--color-text-primary)',
                lineHeight: 'var(--leading-tight)',
                fontWeight: 400,
                margin: '0 0 var(--space-3)',
              }}>
                {featured.title}
              </h2>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-base)',
                color: 'var(--color-text-muted)',
                lineHeight: 'var(--leading-relaxed)',
                margin: '0 0 var(--space-5)',
                maxWidth: 640,
              }}>
                {featured.excerpt}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--color-signal-subtle)',
                  border: '1px solid var(--color-signal-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <span style={{ color: 'var(--color-signal)', fontFamily: 'var(--font-display)', fontSize: '14px' }}>
                    {featured.author.charAt(0)}
                  </span>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                    {featured.author}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-text-faint)', letterSpacing: 'var(--tracking-wide)' }}>
                    {featured.date}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* ─── Section divider ─── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-10)' }}>
          <span className="mono-label" style={{ color: 'var(--color-text-faint)', fontSize: '11px', flexShrink: 0 }}>
            All posts
          </span>
          <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
          <span className="mono-label" style={{ color: 'var(--color-text-faint)', fontSize: '11px', flexShrink: 0 }}>
            {blogPosts.length} articles
          </span>
        </div>

        {/* ─── Post grid ─── */}
        <div className="grid-cols-3-md" style={{ gap: 'var(--space-8)' }}>
          {nonFeaturedPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="hover-lift"
              style={{
                display: 'block',
                textDecoration: 'none',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                overflow: 'hidden',
                background: 'var(--color-bg-base)',
              }}
            >
              {/* Mini illustration */}
              <div style={{ height: 160, overflow: 'hidden' }}>
                <BlogIllustration type={post.illustration} />
              </div>

              <div style={{ padding: 'var(--space-5)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    color: 'var(--color-signal)',
                    letterSpacing: 'var(--tracking-wider)',
                    textTransform: 'uppercase',
                  }}>
                    {post.category}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    color: 'var(--color-text-faint)',
                    letterSpacing: 'var(--tracking-wide)',
                  }}>
                    {post.readTime}
                  </span>
                </div>

                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--text-lg)',
                  color: 'var(--color-text-primary)',
                  lineHeight: 'var(--leading-snug)',
                  fontWeight: 400,
                  margin: '0 0 var(--space-3)',
                }}>
                  {post.title}
                </h3>

                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-muted)',
                  lineHeight: 'var(--leading-relaxed)',
                  margin: '0 0 var(--space-4)',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {post.excerpt}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    color: 'var(--color-text-faint)',
                    letterSpacing: 'var(--tracking-wide)',
                  }}>
                    {post.date}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    color: 'var(--color-signal)',
                    letterSpacing: 'var(--tracking-wide)',
                  }}>
                    Read &rarr;
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* ─── CTA section ─── */}
        <div style={{
          marginTop: 'var(--space-20)',
          padding: 'var(--space-12)',
          background: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          textAlign: 'center',
        }}>
          <div className="mono-label" style={{ color: 'var(--color-text-faint)', marginBottom: 'var(--space-4)', fontSize: '11px' }}>
            Stay informed
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-2xl)',
            color: 'var(--color-text-primary)',
            lineHeight: 'var(--leading-tight)',
            fontWeight: 400,
            margin: '0 0 var(--space-4)',
          }}>
            Get new posts delivered.
          </h2>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-muted)',
            lineHeight: 'var(--leading-relaxed)',
            margin: '0 0 var(--space-6)',
            maxWidth: 400,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            Research, product updates, and market analysis on AI evaluation infrastructure. No spam — just substance.
          </p>
          <Link href="/contact" className="btn-primary" style={{ fontSize: '11px' }}>
            Get early access
          </Link>
        </div>

      </div>
    </div>
  );
}
