export function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-subtle)' }}>
      <div style={{
        maxWidth: 'var(--max-content)',
        margin: '0 auto',
        padding: 'var(--space-12) var(--section-x) var(--space-8)',
      }}>
        {/* Top row — logo + links */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 'var(--space-8)',
          marginBottom: 'var(--space-8)',
          paddingBottom: 'var(--space-8)',
          borderBottom: '1px solid var(--color-border)',
        }}>
          {/* Left — brand */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-signal)',
                fontWeight: 500,
                letterSpacing: 'var(--tracking-wide)',
              }}>
                RawEval
              </span>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: 'var(--color-text-faint)',
                letterSpacing: 'var(--tracking-wider)',
              }}>
                RESEARCH
              </span>
            </div>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-muted)',
              lineHeight: 'var(--leading-normal)',
              margin: 0,
              maxWidth: '320px',
            }}>
              Expert-annotated healthcare AI evaluation data.
              <br />
              Established 2025, Bengaluru.
            </p>
          </div>

          {/* Right — links */}
          <div style={{
            display: 'flex',
            gap: 'var(--space-10)',
            flexWrap: 'wrap',
          }}>
            {/* Contact column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                letterSpacing: 'var(--tracking-wider)',
                textTransform: 'uppercase',
                color: 'var(--color-text-faint)',
                marginBottom: 'var(--space-1)',
              }}>
                Contact
              </span>
              <a
                href="mailto:research@raweval.com"
                className="footer-link"
                style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}
              >
                research@raweval.com
              </a>
              <a
                href="https://www.raweval.com"
                className="footer-link"
                style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}
              >
                raweval.com
              </a>
            </div>

            {/* Legal column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                letterSpacing: 'var(--tracking-wider)',
                textTransform: 'uppercase',
                color: 'var(--color-text-faint)',
                marginBottom: 'var(--space-1)',
              }}>
                Legal
              </span>
              <a
                href="/privacy"
                className="footer-link"
                style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)' }}
              >
                Privacy Policy
              </a>
              <a
                href="/terms"
                className="footer-link"
                style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)' }}
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>

        {/* Bottom row — address + copyright */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
        }}>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            color: 'var(--color-text-faint)',
            lineHeight: 'var(--leading-normal)',
            margin: 0,
            maxWidth: '420px',
          }}>
            Ground Floor &amp; 1st Floor, Incubex HSR23, 19th Main Rd, HSR Layout, Sector 4, Bengaluru, Karnataka 560102
          </p>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--color-text-faint)',
            whiteSpace: 'nowrap',
          }}>
            &copy; {new Date().getFullYear()} RawEval Inc.
          </span>
        </div>
      </div>
    </footer>
  );
}
