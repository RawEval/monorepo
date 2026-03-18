import { Metadata } from 'next';
import { LegalLayout } from '../components/legal-layout';

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
      next: { revalidate: 3600 }, // Cache for 1 hour
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
    if (!trimmed) {
      elements.push(<br key={`br-${i}`} />);
      return;
    }

    if (trimmed.startsWith('- **')) {
      const match = trimmed.match(/^- \*\*(.+?)\*\*(.*)$/);
      if (match) {
        elements.push(
          <li key={i}>
            <strong>{match[1]}</strong>{match[2]}
          </li>
        );
        return;
      }
    }

    if (trimmed.startsWith('- ')) {
      elements.push(<li key={i}>{trimmed.substring(2)}</li>);
      return;
    }

    // Inline bold + email links
    const parts = trimmed.split(/\*\*(.+?)\*\*/g);
    const rendered = parts.map((part, j) =>
      j % 2 === 1 ? <strong key={j}>{part}</strong> : part
    );
    elements.push(<p key={i}>{rendered}</p>);
  });

  const wrapped: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];

  elements.forEach((el, i) => {
    if (el && typeof el === 'object' && 'type' in (el as any) && (el as any).type === 'li') {
      currentList.push(el);
    } else {
      if (currentList.length > 0) {
        wrapped.push(<ul key={`ul-${i}`}>{currentList}</ul>);
        currentList = [];
      }
      wrapped.push(el);
    }
  });
  if (currentList.length > 0) {
    wrapped.push(<ul key="ul-last">{currentList}</ul>);
  }

  return wrapped;
}

export default async function PrivacyPage() {
  const data = await getPrivacy();

  const toc = data
    ? data.sections.map((s) => ({ id: s.id, title: s.title }))
    : [
        { id: 'collection', title: '1. Information We Collect' },
        { id: 'biometrics', title: '2. Biometric Data Policy' },
        { id: 'usage', title: '3. How We Use Your Data' },
        { id: 'sharing', title: '4. Data Sharing & Disclosure' },
        { id: 'security', title: '5. Data Security' },
        { id: 'rights', title: '6. Your Rights' },
        { id: 'cookies', title: '7. Cookies & Tracking' },
        { id: 'contact', title: '8. Contact Us' },
      ];

  const lastUpdated = data?.last_updated
    ? new Date(data.last_updated).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'March 18, 2026';

  return (
    <LegalLayout title="Privacy Policy" lastUpdated={lastUpdated} toc={toc}>
      {data ? (
        data.sections.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-28">
            <h3>{section.title}</h3>
            {renderContent(section.content)}
          </section>
        ))
      ) : (
        <p>Unable to load privacy policy. Please try again later.</p>
      )}
    </LegalLayout>
  );
}
