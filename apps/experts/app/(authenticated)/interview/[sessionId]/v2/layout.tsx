/**
 * V2 Interview layout — fullscreen, no navbar/footer.
 * Overrides the parent authenticated layout's chrome.
 */
export default function V2InterviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'var(--color-bg-inverse)' }}>
      {children}
    </div>
  );
}
