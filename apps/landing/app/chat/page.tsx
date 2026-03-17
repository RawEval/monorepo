import { Metadata } from 'next';
import Link from 'next/link';
import { MessageSquare, Flag, Award, TrendingUp, Star, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'RawEval Chat | Talk to AI, Earn by Helping',
  description: 'Chat with top AI models for free. When you spot something wrong, flag it and earn rewards. Level up, unlock perks, and help build better AI.',
};

const features = [
  {
    icon: MessageSquare,
    label: 'Chat with top AI models',
    body: 'Access all the top AI models from leading frontier labs — all in one place. Switch between models mid-conversation to compare answers.',
  },
  {
    icon: Flag,
    label: 'Spot something wrong? Flag it.',
    body: 'When an AI gives a bad answer — wrong facts, weird response, or something harmful — just tap the flag button. Tell us what went wrong in a few words.',
  },
  {
    icon: Award,
    label: 'Earn real rewards',
    body: 'Every valid flag earns you a payout. The more helpful your flags are, the more you earn. Top contributors make $50–200+ per hour equivalent.',
  },
  {
    icon: TrendingUp,
    label: 'Level up your profile',
    body: 'Start as a Contributor and work your way up. Higher levels unlock better payouts, priority access to new models, and exclusive tasks.',
  },
];

const levels = [
  {
    name: 'Contributor',
    description: 'Just getting started',
    perks: ['Free access to all models', 'Earn per valid flag', 'Community leaderboard'],
    color: 'var(--color-text-muted)',
  },
  {
    name: 'Reviewer',
    description: '50+ valid flags',
    perks: ['Higher payouts per flag', 'Early access to new models', 'Priority support'],
    color: 'var(--color-info)',
  },
  {
    name: 'Expert',
    description: '200+ valid flags + quality score 90%+',
    perks: ['Top-tier payouts', 'Invite to Expert Workbench', 'Direct evaluation tasks', 'Exclusive beta features'],
    color: 'var(--color-signal)',
  },
];

const howItHelps = [
  { label: 'You chat normally', body: 'Ask anything — homework help, coding questions, research, creative writing. Use AI the way you normally would.' },
  { label: 'You spot a mistake', body: "The AI says something wrong, incomplete, or unhelpful. You flag it with one tap and add a quick note about what's off." },
  { label: 'Experts verify', body: 'Domain experts review your flag, confirm the error, and write a better response. You earn a payout when they validate your catch.' },
  { label: 'AI gets better', body: 'Your flags become training data that frontier labs use to improve their models. You\'re literally making AI smarter.' },
];

export default function ChatPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-base)' }}>

      {/* Hero */}
      <section style={{ background: 'var(--color-bg-surface)', paddingTop: 'var(--section-y)', paddingBottom: 'var(--section-y)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: '0 var(--section-x)' }}>
          <div style={{ maxWidth: 680 }}>
            <div className="mono-label" style={{ color: 'var(--color-signal)', marginBottom: 'var(--space-5)' }}>RawEval Chat</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-4xl)', color: 'var(--color-text-primary)', lineHeight: 'var(--leading-tight)', fontWeight: 400, margin: '0 0 var(--space-6)' }}>
              Chat with AI. Spot mistakes. Get paid.
            </h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-md)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', margin: '0 0 var(--space-8)' }}>
              Use the best AI models for free. When you find something wrong, flag it — and earn real rewards for helping make AI better. The more you contribute, the more you earn.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 'var(--space-3)' }}>
              <a href="https://chat.raweval.com" className="btn-primary">Start Chatting →</a>
              <a href="https://chat.raweval.com/signup" className="btn-secondary">Create Account</a>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)' }}>
          <div className="mono-label" style={{ color: 'var(--color-text-faint)', marginBottom: 'var(--space-4)' }}>What you can do</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)', fontWeight: 400, lineHeight: 'var(--leading-tight)', margin: '0 0 var(--space-10)' }}>
            More than just a chat — it&apos;s a way to earn
          </h2>
          <div className="grid-cols-2-lg" style={{ gap: 'var(--space-6)' }}>
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.label} className="card-surface" style={{ padding: 'var(--space-6)', display: 'flex', gap: 'var(--space-5)', alignItems: 'flex-start' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--color-signal-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={18} style={{ color: 'var(--color-signal)' }} />
                  </div>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-primary)', fontWeight: 500, margin: '0 0 var(--space-3)' }}>{f.label}</h3>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)', margin: 0 }}>{f.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Levels */}
      <section style={{ background: 'var(--color-bg-surface)', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)' }}>
          <div className="mono-label" style={{ color: 'var(--color-text-faint)', marginBottom: 'var(--space-4)' }}>Levels & rewards</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)', fontWeight: 400, lineHeight: 'var(--leading-tight)', margin: '0 0 var(--space-4)' }}>
            The more you contribute, the more you unlock
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-muted)', margin: '0 0 var(--space-10)', maxWidth: 560 }}>
            Start chatting and flagging for free. As your quality score improves, you level up and earn higher rewards.
          </p>
          <div className="grid-cols-3-md" style={{ gap: 'var(--space-6)' }}>
            {levels.map((level) => (
              <div key={level.name} className="card-surface" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                    <Star size={14} style={{ color: level.color }} />
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-primary)', fontWeight: 500 }}>{level.name}</span>
                  </div>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-faint)', letterSpacing: 'var(--tracking-wide)' }}>{level.description}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {level.perks.map((perk) => (
                    <div key={perk} style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-start' }}>
                      <Zap size={12} style={{ color: level.color, flexShrink: 0, marginTop: '3px' }} />
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>{perk}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it helps */}
      <section style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--section-y) var(--section-x)' }}>
          <div className="mono-label" style={{ color: 'var(--color-text-faint)', marginBottom: 'var(--space-4)' }}>How it works</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)', fontWeight: 400, lineHeight: 'var(--leading-tight)', margin: '0 0 var(--space-10)' }}>
            Simple as chatting
          </h2>
          <div className="grid-cols-2-lg" style={{ gap: 'var(--space-6)' }}>
            {howItHelps.map((s, i) => (
              <div key={s.label} style={{ display: 'flex', gap: 'var(--space-5)', alignItems: 'flex-start' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-signal)', letterSpacing: 'var(--tracking-wide)', flexShrink: 0, paddingTop: '3px', width: 24 }}>0{i + 1}</div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-primary)', fontWeight: 500, margin: '0 0 var(--space-2)' }}>{s.label}</h3>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)', margin: 0 }}>{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: 'var(--space-24) var(--section-x)', textAlign: 'center' as const }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)', fontWeight: 400, lineHeight: 'var(--leading-tight)', margin: '0 0 var(--space-5)' }}>
            Start chatting, start earning.
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-muted)', maxWidth: 440, margin: '0 auto var(--space-8)' }}>
            Free to use. Earn rewards from your first valid flag.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <a href="https://chat.raweval.com" className="btn-primary" style={{ padding: '14px 36px', fontSize: 'var(--text-sm)' }}>
              Open Chat →
            </a>
            <Link href="/experts" className="btn-ghost" style={{ fontSize: 'var(--text-sm)' }}>
              Want to earn more? Join as an Expert →
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
