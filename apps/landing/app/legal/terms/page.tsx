import { Metadata } from 'next';
import { LegalLayout } from '../components/legal-layout';

export const metadata: Metadata = {
  title: 'Terms of Service | RawEval',
  description: 'Terms and conditions for using the RawEval platform.',
};

const TOC = [
  { id: 'acceptance', title: '1. Acceptance of Terms' },
  { id: 'services', title: '2. Services & Access' },
  { id: 'expert-network', title: '3. Expert Network Agreement' },
  { id: 'intellectual-property', title: '4. Intellectual Property' },
  { id: 'prohibited-uses', title: '5. Prohibited Uses' },
  { id: 'data-rights', title: '6. Data Usage Rights' },
  { id: 'termination', title: '7. Termination' },
  { id: 'disclaimers', title: '8. Disclaimers & Limitation of Liability' },
];

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      lastUpdated="January 14, 2026"
      toc={TOC}
    >
      <section id="acceptance" className="scroll-mt-28">
        <h3>1. Acceptance of Terms</h3>
        <p className="lead text-foreground mb-8 text-xl font-medium">
          By accessing or using the RawEval platform, including our website,
          expert workbench, API, and associated services (collectively, the
          "Service"), you agree to be bound by these Terms of Service ("Terms").
        </p>
        <div className="my-8 rounded-r-lg border-l-4 border-blue-600 bg-slate-50 p-6">
          <p className="my-0 text-slate-700 italic">
            If you do not agree to these Terms, including the mandatory
            arbitration provision and class action waiver in Section 12, do not
            use the Service.
          </p>
        </div>
        <p>
          We reserve the right to modify these Terms at any time. We will notify
          you of any material changes by posting the new Terms on this site.
          Your continued use of the Service constitutes acceptance of the
          modified Terms.
        </p>
      </section>

      <section id="services" className="scroll-mt-28">
        <h3>2. Services & Access</h3>
        <p>
          RawEval provides an infrastructure for AI evaluation, offering
          services for both organizations ("Clients") and individual domain
          experts ("Experts").
        </p>
        <ul>
          <li>
            <strong>For Clients:</strong> We grant you a limited, non-exclusive,
            non-transferable license to access our platform for the purpose of
            submitting data for evaluation and retrieving results, subject to
            your subscription plan.
          </li>
          <li>
            <strong>For Experts:</strong> We grant you access to our Workbench
            for the sole purpose of performing evaluation tasks assigned to you.
          </li>
        </ul>
      </section>

      <section id="expert-network" className="scroll-mt-28">
        <h3>3. Expert Network Agreement</h3>
        <p>
          If you are registered as an Expert, you agree to the following
          additional terms:
        </p>
        <ul>
          <li>
            <strong>Verification:</strong> You consent to our biometric
            verification process, including facial scanning and keystroke
            dynamics monitoring, to verify your identity and ensure human-only
            output.
          </li>
          <li>
            <strong>Quality Standards:</strong> You agree to perform tasks to
            the best of your ability. We reserve the right to reject work that
            does not meet our quality rubrics or consensus standards.
          </li>
          <li>
            <strong>Independence:</strong> You are an independent contractor,
            not an employee of RawEval. You are responsible for all taxes
            associated with your earnings.
          </li>
          <li>
            <strong>Confidentiality:</strong> You will not share, copy, or
            disclose any prompts, data, or materials you view on the Workbench.
            Violation of this clause will result in immediate termination and
            potential legal action.
          </li>
        </ul>
      </section>

      <section id="intellectual-property" className="scroll-mt-28">
        <h3>4. Intellectual Property</h3>
        <p>
          <strong>Our IP:</strong> The Service, including its codebase, design,
          and "Iron Dome" security technology, is the exclusive property of
          RawEval Inc.
        </p>
        <p>
          <strong>Work Product:</strong> As an Expert, you assign full ownership
          of all annotations, corrections, and content you create on the
          platform ("Work Product") to RawEval Inc. We may sell, license, or
          distribute this Work Product to our Clients without further
          compensation to you beyond the agreed task fee.
        </p>
      </section>

      <section id="prohibited-uses" className="scroll-mt-28">
        <h3>5. Prohibited Uses</h3>
        <p>You agree not to:</p>
        <ul>
          <li>
            Use AI generation tools (ChatGPT, Claude, etc.) to complete tasks on
            the Workbench, unless explicitly instructed.
          </li>
          <li>
            Attempt to bypass, disable, or deceive our security and verification
            systems.
          </li>
          <li>
            Scrape or extract data from the Service using automated means.
          </li>
          <li>Share your account credentials with any third party.</li>
        </ul>
      </section>

      <section id="data-rights" className="scroll-mt-28">
        <h3>6. Data Usage Rights</h3>
        <p>
          <strong>Client Data:</strong> Clients retain ownership of the original
          prompts and data submitted to RawEval. You grant us a license to use
          this data solely for the purpose of providing the evaluation service
          and improving our internal models.
        </p>
        <p>
          <strong>Biometric Data:</strong> We collect and process biometric data
          from Experts solely for identity verification and anti-fraud purposes.
          This data is not sold or used for model training.
        </p>
      </section>

      <section id="termination" className="scroll-mt-28">
        <h3>7. Termination</h3>
        <p>
          We may terminate or suspend your account immediately, without prior
          notice or liability, for any reason whatsoever, including without
          limitation if you breach the Terms. Upon termination, your right to
          use the Service will immediately cease.
        </p>
      </section>

      <section id="disclaimers" className="scroll-mt-28">
        <h3>8. Disclaimers & Limitation of Liability</h3>
        <p>
          The Service is provided on an "AS IS" and "AS AVAILABLE" basis.
          RawEval makes no warranties, whether express or implied, regarding the
          accuracy or reliability of the Service.
        </p>
        <p>
          In no event shall RawEval be liable for any indirect, incidental,
          special, consequential or punitive damages, including without
          limitation, loss of profits, data, use, goodwill, or other intangible
          losses.
        </p>
      </section>
    </LegalLayout>
  );
}
