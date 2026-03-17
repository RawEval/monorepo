import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { blogPosts, getPostBySlug, getAllSlugs } from '@/lib/blog-data';
import { BlogIllustration } from '@/components/blog-illustration';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return { title: 'Post Not Found | RawEval Blog' };
  }

  return {
    title: `${post.title} | RawEval Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.isoDate,
      authors: [post.author],
      tags: post.tags,
    },
    keywords: post.tags,
    authors: [{ name: post.author }],
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Get related posts (same category, excluding current)
  const relatedPosts = blogPosts
    .filter((p) => p.category === post.category && p.slug !== post.slug)
    .slice(0, 2);

  // If not enough related posts, fill with recent posts
  if (relatedPosts.length < 2) {
    const additional = blogPosts
      .filter((p) => p.slug !== post.slug && !relatedPosts.some((r) => r.slug === p.slug))
      .slice(0, 2 - relatedPosts.length);
    relatedPosts.push(...additional);
  }

  return (
    <article
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg-base)',
        paddingTop: 'var(--section-y)',
      }}
      itemScope
      itemType="https://schema.org/BlogPosting"
    >
      {/* ─── Article header ─── */}
      <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: '0 var(--section-x)' }}>

        {/* Back link */}
        <Link
          href="/blog"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--color-text-muted)',
            letterSpacing: 'var(--tracking-wide)',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: 'var(--space-10)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 3L5 7L9 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Back to blog
        </Link>

        {/* Meta row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          marginBottom: 'var(--space-5)',
          flexWrap: 'wrap',
        }}>
          <span className="mono-label" style={{
            color: 'var(--color-text-inverse)',
            background: 'var(--color-signal)',
            padding: '3px 10px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '10px',
          }}>
            {post.category}
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--color-text-faint)',
            letterSpacing: 'var(--tracking-wide)',
          }}>
            {post.readTime} read
          </span>
          <span style={{ color: 'var(--color-text-faint)', fontSize: '11px' }}>&middot;</span>
          <time
            dateTime={post.isoDate}
            itemProp="datePublished"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--color-text-faint)',
              letterSpacing: 'var(--tracking-wide)',
            }}
          >
            {post.date}
          </time>
        </div>

        {/* Title */}
        <h1
          itemProp="headline"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-4xl)',
            color: 'var(--color-text-primary)',
            lineHeight: 'var(--leading-tight)',
            fontWeight: 400,
            margin: '0 0 var(--space-4)',
            maxWidth: 800,
          }}
        >
          {post.title}
        </h1>

        {/* Subtitle */}
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-md)',
          color: 'var(--color-text-muted)',
          lineHeight: 'var(--leading-relaxed)',
          margin: '0 0 var(--space-8)',
          maxWidth: 640,
        }}>
          {post.subtitle}
        </p>

        {/* Author */}
        <div
          itemProp="author"
          itemScope
          itemType="https://schema.org/Person"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-10)',
            paddingBottom: 'var(--space-8)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-bg-inverse)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{ color: 'var(--color-text-inverse)', fontFamily: 'var(--font-display)', fontSize: '16px' }}>
              {post.author.charAt(0)}
            </span>
          </div>
          <div>
            <div itemProp="name" style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}>
              {post.author}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-faint)', letterSpacing: 'var(--tracking-wide)' }}>
              {post.authorRole}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Hero illustration ─── */}
      <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: '0 var(--section-x)', marginBottom: 'var(--space-12)' }}>
        <BlogIllustration type={post.illustration} />
      </div>

      {/* ─── Article body ─── */}
      <div
        itemProp="articleBody"
        style={{ maxWidth: 680, margin: '0 auto', padding: '0 var(--section-x)' }}
      >
        {post.sections.map((section, i) => (
          <div key={i} style={{ marginBottom: 'var(--space-12)' }}>
            {/* Section heading */}
            {section.heading && (
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-2xl)',
                color: 'var(--color-text-primary)',
                lineHeight: 'var(--leading-snug)',
                fontWeight: 400,
                margin: '0 0 var(--space-5)',
              }}>
                {section.heading}
              </h2>
            )}

            {/* Stat callout */}
            {section.stat && (
              <div style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 'var(--space-3)',
                marginBottom: 'var(--space-6)',
                padding: 'var(--space-5) var(--space-6)',
                borderLeft: '3px solid var(--color-signal)',
                background: 'var(--color-signal-subtle)',
                borderRadius: '0 var(--radius-md) var(--radius-md) 0',
              }}>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--text-3xl)',
                  color: 'var(--color-signal)',
                  lineHeight: 1,
                  fontWeight: 400,
                }}>
                  {section.stat.value}
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--color-text-muted)',
                  letterSpacing: 'var(--tracking-wide)',
                  textTransform: 'uppercase',
                }}>
                  {section.stat.label}
                </span>
              </div>
            )}

            {/* Content paragraphs */}
            {section.content.split('\n\n').map((paragraph, j) => {
              // Check if paragraph is a bold-led list item (pattern: **text**)
              const isBoldLead = paragraph.startsWith('**') || paragraph.startsWith('- **');

              return (
                <p
                  key={j}
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-base)',
                    color: isBoldLead ? 'var(--color-text-secondary)' : 'var(--color-text-secondary)',
                    lineHeight: 'var(--leading-relaxed)',
                    margin: `0 0 ${isBoldLead ? 'var(--space-4)' : 'var(--space-5)'}`,
                  }}
                  dangerouslySetInnerHTML={{
                    __html: paragraph
                      .replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--color-text-primary); font-weight: 500">$1</strong>')
                      .replace(/\n/g, '<br />')
                  }}
                />
              );
            })}

            {/* Pull quote */}
            {section.pullQuote && (
              <blockquote style={{
                margin: 'var(--space-8) 0',
                padding: 'var(--space-6) var(--space-8)',
                borderLeft: '2px solid var(--color-signal)',
                background: 'none',
              }}>
                <p style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--text-xl)',
                  color: 'var(--color-text-primary)',
                  lineHeight: 'var(--leading-snug)',
                  fontWeight: 400,
                  fontStyle: 'italic',
                  margin: 0,
                }}>
                  &ldquo;{section.pullQuote}&rdquo;
                </p>
              </blockquote>
            )}
          </div>
        ))}

        {/* ─── Tags ─── */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--space-2)',
          marginTop: 'var(--space-10)',
          paddingTop: 'var(--space-8)',
          borderTop: '1px solid var(--color-border)',
        }}>
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="mono-label"
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-faint)',
                fontSize: '10px',
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* ─── Share / CTA ─── */}
        <div style={{
          marginTop: 'var(--space-10)',
          padding: 'var(--space-8)',
          background: 'var(--color-bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          textAlign: 'center',
        }}>
          <div className="mono-label" style={{ color: 'var(--color-text-faint)', marginBottom: 'var(--space-3)', fontSize: '10px' }}>
            Interested in verified AI evaluation?
          </div>
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-xl)',
            color: 'var(--color-text-primary)',
            fontWeight: 400,
            margin: '0 0 var(--space-4)',
          }}>
            See how RawEval works.
          </h3>
          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/how-it-works/capture" className="btn-primary" style={{ fontSize: '11px' }}>
              Explore the pipeline
            </Link>
            <Link href="/contact" className="btn-secondary" style={{ fontSize: '11px' }}>
              Get in touch
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Related posts ─── */}
      <div style={{
        maxWidth: 'var(--max-content)',
        margin: '0 auto',
        padding: 'var(--space-16) var(--section-x) var(--section-y)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
          <span className="mono-label" style={{ color: 'var(--color-text-faint)', fontSize: '11px', flexShrink: 0 }}>
            Keep reading
          </span>
          <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
        </div>

        <div className="grid-cols-2-md">
          {relatedPosts.map((related) => (
            <Link
              key={related.slug}
              href={`/blog/${related.slug}`}
              className="hover-lift"
              style={{
                display: 'block',
                textDecoration: 'none',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                overflow: 'hidden',
              }}
            >
              <div style={{ height: 140, overflow: 'hidden' }}>
                <BlogIllustration type={related.illustration} />
              </div>
              <div style={{ padding: 'var(--space-5)' }}>
                <span className="mono-label" style={{ color: 'var(--color-signal)', fontSize: '10px', marginBottom: 'var(--space-2)', display: 'block' }}>
                  {related.category}
                </span>
                <h4 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--text-lg)',
                  color: 'var(--color-text-primary)',
                  lineHeight: 'var(--leading-snug)',
                  fontWeight: 400,
                  margin: '0 0 var(--space-2)',
                }}>
                  {related.title}
                </h4>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  color: 'var(--color-text-faint)',
                  letterSpacing: 'var(--tracking-wide)',
                }}>
                  {related.readTime} read &middot; {related.date}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ─── JSON-LD structured data ─── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.excerpt,
            datePublished: post.isoDate,
            author: {
              '@type': 'Person',
              name: post.author,
              jobTitle: post.authorRole,
            },
            publisher: {
              '@type': 'Organization',
              name: 'RawEval',
              url: 'https://www.raweval.com',
            },
            keywords: post.tags.join(', '),
            articleSection: post.category,
            wordCount: post.sections.reduce((acc, s) => acc + s.content.split(' ').length, 0),
          }),
        }}
      />
    </article>
  );
}
