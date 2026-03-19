import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'How It Works: Delivery | RawEval',
  description: 'How RawEval delivers verified, training-ready data to AI labs and enterprises.',
};

const howItWorksNav = [
  { label: 'Capture', href: '/how-it-works/capture' },
  { label: 'Vetting', href: '/how-it-works/vetting' },
  { label: 'Workbench', href: '/how-it-works/workbench' },
  { label: 'Delivery', href: '/how-it-works/delivery' },
];

const formats = [
  { label: 'Preference pairs', desc: 'Chosen / rejected pairs ready for DPO and PPO pipelines.', tag: 'RLHF' },
  { label: 'SFT datasets', desc: 'Expert-rewritten completions for supervised fine-tuning.', tag: 'Fine-tuning' },
  { label: 'Rubric-scored completions', desc: 'Multi-axis scores with detailed rationale per completion.', tag: 'Eval' },
  { label: 'Red-team logs', desc: 'Adversarial prompts paired with expert-annotated ideal refusals.', tag: 'Safety' },
];

export default function DeliveryPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-base)', paddingTop: 'var(--space-12)' }}>

      <div style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: '0 var(--section-x)', display: 'flex', gap: 'var(--space-1)', overflowX: 'auto' as const }}>
          {howItWorksNav.map((n) => (
            <Link key={n.href} href={n.href} style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wide)', padding: '12px 16px', textDecoration: 'none', color: n.href === '/how-it-works/delivery' ? 'var(--color-signal)' : 'var(--color-text-muted)', borderBottom: n.href === '/how-it-works/delivery' ? '2px solid var(--color-signal)' : '2px solid transparent', whiteSpace: 'nowrap' as const }}>{n.label}</Link>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)' }}>
        <div style={{ maxWidth: 640, marginBottom: 'var(--space-16)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-signal)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', marginBottom: 'var(--space-5)' }}>Step 04 · Delivery</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-4xl)', color: 'var(--color-text-primary)', lineHeight: 'var(--leading-tight)', fontWeight: 400, margin: '0 0 var(--space-6)' }}>
            Training-ready data, delivered to your pipeline.
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-md)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', margin: 0 }}>
            RawEval doesn&apos;t deliver raw exports. Every batch goes through a final QA tier before leaving our platform — reviewed for consistency, completeness, and adherence to your schema.
          </p>
        </div>

        {/* Output formats */}
        <div style={{ marginBottom: 'var(--space-12)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', marginBottom: 'var(--space-6)' }}>Output formats</div>
          <div className="grid-cols-2-md">
            {formats.map((f) => (
              <div key={f.label} style={{ padding: 'var(--space-6)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', background: 'var(--color-bg-surface)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                  <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-primary)', fontWeight: 500, margin: 0 }}>{f.label}</h3>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-signal)', letterSpacing: 'var(--tracking-wide)', background: 'var(--color-signal-subtle)', border: '1px solid var(--color-signal-border)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>{f.tag}</span>
                </div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)', margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery methods */}
        <div style={{ padding: 'var(--space-6)', background: 'var(--color-bg-surface)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-12)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', marginBottom: 'var(--space-4)' }}>Delivery methods</div>
          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 'var(--space-3)' }}>
            {['REST API', 'Webhook push', 'S3 / GCS export', 'Hugging Face dataset', 'CSV / JSONL download'].map((m) => (
              <span key={m} style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', letterSpacing: 'var(--tracking-wide)', padding: '5px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-full)' }}>{m}</span>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-6)' }}>
          <Link href="/how-it-works/workbench" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', letterSpacing: 'var(--tracking-wide)', textDecoration: 'none' }}>← Workbench</Link>
          <Link href="/research" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-signal)', letterSpacing: 'var(--tracking-wide)', textDecoration: 'none' }}>Get enterprise access →</Link>
        </div>
      </div>

    </div>
  );
}
