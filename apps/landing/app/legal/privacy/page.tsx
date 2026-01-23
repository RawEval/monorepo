import { Metadata } from 'next';
import { LegalLayout } from '../components/legal-layout';

export const metadata: Metadata = {
  title: 'Privacy Policy | RawEval',
  description: 'How RawEval collects, uses, and protects your data.',
};

const TOC = [
  { id: 'collection', title: '1. Information We Collect' },
  { id: 'biometrics', title: '2. Biometric Data Policy' },
  { id: 'usage', title: '3. How We Use Your Data' },
  { id: 'sharing', title: '4. Data Sharing & Disclosure' },
  { id: 'security', title: '5. Data Security' },
  { id: 'rights', title: '6. Your Rights' },
  { id: 'cookies', title: '7. Cookies & Tracking' },
  { id: 'contact', title: '8. Contact Us' },
];

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      lastUpdated="January 14, 2026"
      toc={TOC}
    >
      <section id="collection">
        <p className="lead text-foreground mb-8 text-xl font-medium">
          Your privacy is critical to our mission. This policy details how
          RawEval collects, uses, and protects your data, including the rigorous
          biometric safeguards we use for our Expert Network.
        </p>

        <h3>1. Information We Collect</h3>
        <p>
          We collect information you provide directly to us, information related
          to your use of the Service, and information from third-party sources.
        </p>
        <ul>
          <li>
            <strong>Account Information:</strong> Name, email address, password,
            professional credentials, and payment details.
          </li>
          <li>
            <strong>Profile Data:</strong> For Experts, we collect information
            about your education, work history, and domain expertise.
          </li>
          <li>
            <strong>Usage Data:</strong> Pages visited, time spent, browser
            type, and IP address.
          </li>
        </ul>
      </section>

      <section id="biometrics" className="scroll-mt-28">
        <h3>2. Biometric Data Policy (Experts Only)</h3>
        <p>
          To maintain the integrity of our high-quality data datasets, we
          require Experts to undergo biometric verification.
        </p>
        <ul>
          <li>
            <strong>Facial Scan:</strong> We collect a facial geometry scan to
            verify your identity against a government ID and to perform periodic
            liveness checks during work sessions.
          </li>
          <li>
            <strong>Keystroke Dynamics:</strong> We collect timing data related
            to your keystrokes to detect bot activity and copy-paste behavior.
            This data helps us confirm human authorship.
          </li>
          <li>
            <strong>Retention:</strong> Biometric data is encrypted and stored
            for the duration of your active account plus 3 years, or as required
            by law. You may request deletion of your biometric data by closing
            your account, subject to fraud prevention retention policies.
          </li>
        </ul>
      </section>

      <section id="usage" className="scroll-mt-28">
        <h3>3. How We Use Your Data</h3>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide, maintain, and improve the Service.</li>
          <li>Verify Expert identity and qualifications.</li>
          <li>Process payments to Experts and from Clients.</li>
          <li>
            Detect and prevent fraud, security breaches, and malicious activity.
          </li>
          <li>
            Train our internal quality estimation models (using non-biometric
            data).
          </li>
          <li>
            Send administrative notifications and marketing communications (with
            opt-out).
          </li>
        </ul>
      </section>

      <section id="sharing" className="scroll-mt-28">
        <h3>4. Data Sharing & Disclosure</h3>
        <p>
          We do not sell your personal data. We may share your information in
          the following circumstances:
        </p>
        <ul>
          <li>
            <strong>Service Providers:</strong> Vendors who assist with identity
            verification, payment processing, and hosting.
          </li>
          <li>
            <strong>Legal Requirements:</strong> If required to do so by law or
            in response to valid requests by public authorities.
          </li>
          <li>
            <strong>Business Transfers:</strong> In connection with a merger,
            sale, or asset transfer.
          </li>
        </ul>
      </section>

      <section id="security" className="scroll-mt-28">
        <h3>5. Data Security</h3>
        <p>
          We employ enterprise-grade security measures to protect your
          information:
        </p>
        <ul>
          <li>
            <strong>Encryption:</strong> Data is encrypted at rest (AES-256) and
            in transit (TLS 1.3).
          </li>
          <li>
            <strong>Access Controls:</strong> Strict role-based access control
            (RBAC) limits internal access to sensitive data.
          </li>
          <li>
            <strong>Biometric Storage:</strong> Biometric templates are stored
            in a separate, isolated environment.
          </li>
        </ul>
        <p>
          Review our <a href="/security">Security Page</a> for more details.
        </p>
      </section>

      <section id="rights" className="scroll-mt-28">
        <h3>6. Your Rights</h3>
        <p>
          Depending on your location, you may have rights under GDPR, CCPA, or
          other laws, including:
        </p>
        <ul>
          <li>Accessing and exporting your data.</li>
          <li>Correcting inaccurate data.</li>
          <li>Deleting your data (Right to be Forgotten).</li>
          <li>Objecting to processing.</li>
        </ul>
        <p>
          To exercise these rights, email{' '}
          <a href="mailto:privacy@raweval.com">privacy@raweval.com</a>.
        </p>
      </section>

      <section id="cookies" className="scroll-mt-28">
        <h3>7. Cookies & Tracking</h3>
        <p>
          We use cookies and similar technologies to track usage patterns and
          hold session information. You can control cookies through your browser
          settings.
        </p>
      </section>

      <section id="contact" className="scroll-mt-28">
        <h3>8. Contact Us</h3>
        <p>
          If you have questions about this Privacy Policy, please contact our
          Data Protection Officer at:
        </p>
        <p>
          <strong>RawEval Inc.</strong>
          <br />
          Email: <a href="mailto:privacy@raweval.com">privacy@raweval.com</a>
          <br />
          Address: 548 Market St, San Francisco, CA 94104
        </p>
      </section>
    </LegalLayout>
  );
}
