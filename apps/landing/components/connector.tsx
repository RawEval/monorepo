export function Connector({ label }: { label: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-3)',
        padding: 'var(--space-6) 0',
        width: '100%',
        background: 'var(--color-bg-base)',
      }}
    >
      <span style={{ flex: 1, maxWidth: '80px', height: '1px', background: 'var(--color-border)' }} />
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-xs)',
          letterSpacing: 'var(--tracking-wide)',
          textTransform: 'uppercase',
          color: 'var(--color-text-faint)',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
      <span style={{ flex: 1, maxWidth: '80px', height: '1px', background: 'var(--color-border)' }} />
    </div>
  );
}
