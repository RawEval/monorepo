import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | RawEval',
  description: 'How RawEval collects, uses, and protects your data.',
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'https://api.raweval.com';

interface LegalSection {
  id: string;
  title: string;
  content: string;
}

interface LegalDocument {
  title: string;
  last_updated: string;
  sections: LegalSection[];
}

async function getPrivacy(): Promise<LegalDocument | null> {
  try {
    const res = await fetch(`${API_URL}/api/v1/legal/privacy`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function renderContent(content: string) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    if (trimmed.startsWith('- **')) {
      const match = trimmed.match(/^- \*\*(.+?)\*\*(.*)$/);
      if (match) {
        elements.push(<li key={i}><strong>{match[1]}</strong>{match[2]}</li>);
        return;
      }
    }
    if (trimmed.startsWith('- ')) {
      elements.push(<li key={i}>{trimmed.substring(2)}</li>);
      return;
    }

    const parts = trimmed.split(/\*\*(.+?)\*\*/g);
    const rendered = parts.map((part, j) =>
      j % 2 === 1 ? <strong key={j}>{part}</strong> : part
    );
    elements.push(<p key={i} style={{ margin: '0 0 0.75em', lineHeight: 1.7, color: '#d1d5db' }}>{rendered}</p>);
  });

  const wrapped: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];
  elements.forEach((el, i) => {
    if (el && typeof el === 'object' && 'type' in (el as any) && (el as any).type === 'li') {
      currentList.push(el);
    } else {
      if (currentList.length > 0) {
        wrapped.push(<ul key={`ul-${i}`} style={{ paddingLeft: '1.5em', margin: '0 0 1em', color: '#d1d5db' }}>{currentList}</ul>);
        currentList = [];
      }
      wrapped.push(el);
    }
  });
  if (currentList.length > 0) wrapped.push(<ul key="ul-last" style={{ paddingLeft: '1.5em', margin: '0 0 1em', color: '#d1d5db' }}>{currentList}</ul>);
  return wrapped;
}

export default async function PrivacyPage() {
  const data = await getPrivacy();

  const lastUpdated = data?.last_updated
    ? new Date(data.last_updated).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'March 18, 2026';

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#e5e7eb', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <Link href="/login" style={{ color: '#6366f1', textDecoration: 'none', fontSize: '0.875rem' }}>
            &larr; Back to Login
          </Link>
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: 600, color: '#f9fafb', margin: '0 0 0.5rem' }}>Privacy Policy</h1>
        <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '0 0 2rem' }}>Last updated: {lastUpdated}</p>

        <nav style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', fontSize: '0.875rem' }}>
          <Link href="/terms" style={{ color: '#6b7280', textDecoration: 'none' }}>Terms of Service</Link>
          <span style={{ color: '#6366f1', fontWeight: 500 }}>Privacy Policy</span>
        </nav>

        <hr style={{ border: 'none', borderTop: '1px solid #1f2937', margin: '0 0 2rem' }} />

        {data ? (
          data.sections.map((section) => (
            <section key={section.id} id={section.id} style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 500, color: '#f9fafb', margin: '0 0 0.75rem' }}>{section.title}</h2>
              {renderContent(section.content)}
            </section>
          ))
        ) : (
          <p style={{ color: '#9ca3af' }}>Unable to load privacy policy. Please try again later.</p>
        )}
      </div>
    </div>
  );
}
