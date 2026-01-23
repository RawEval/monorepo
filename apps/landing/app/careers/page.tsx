import { Metadata } from 'next';
import { SectionHeader } from '@raweval/ui/section-header';
import { Button } from '@raweval/ui/button';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Careers | RawEval',
  description: 'Join us in building the evaluation layer for the AI industry.',
};

export default function CareersPage() {
  return (
    <main className="bg-background min-h-screen pt-24 lg:pt-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeader
          title="Join the Team"
          description="We are a team of researchers, engineers, and builders obsessed with AI quality. Come build the future with us."
          className="mb-16"
        />

        <div className="mb-24">
          <h2 className="text-foreground mb-8 text-2xl font-bold">
            Open Positions
          </h2>
          <div className="grid gap-4">
            {[
              {
                role: 'Senior Full Stack Engineer',
                department: 'Engineering',
                location: 'San Francisco / Remote',
                type: 'Full-time',
              },
              {
                role: 'Machine Learning Research Scientist',
                department: 'Research',
                location: 'San Francisco',
                type: 'Full-time',
              },
              {
                role: 'Product Designer',
                department: 'Design',
                location: 'Remote',
                type: 'Full-time',
              },
              {
                role: 'Enterprise Sales Lead',
                department: 'GTM',
                location: 'New York / Remote',
                type: 'Full-time',
              },
            ].map((job) => (
              <div
                key={job.role}
                className="border-border group flex flex-col items-start justify-between rounded-xl border bg-white p-6 transition-colors hover:border-blue-300 sm:flex-row sm:items-center"
              >
                <div>
                  <h3 className="text-foreground text-lg font-semibold transition-colors group-hover:text-blue-600">
                    {job.role}
                  </h3>
                  <div className="text-muted-foreground mt-1 flex gap-3 text-sm">
                    <span>{job.department}</span>
                    <span>•</span>
                    <span>{job.location}</span>
                    <span>•</span>
                    <span>{job.type}</span>
                  </div>
                </div>
                <div className="mt-4 sm:mt-0">
                  <Button variant="outline" asChild>
                    <Link href="/careers/apply">Apply Now</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <p className="text-muted-foreground mt-8 text-center">
            Don't see your role? Email us at{' '}
            <a
              href="mailto:careers@raweval.com"
              className="text-blue-600 hover:underline"
            >
              careers@raweval.com
            </a>
          </p>
        </div>

        <div className="mb-24 rounded-3xl bg-slate-900 p-8 text-center text-white lg:p-16">
          <h2 className="mb-6 text-3xl font-bold">
            Not an employee? Join as an Expert.
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-blue-100">
            You don't need to work at RawEval to contribute. Join our expert
            network, review prompts on your own schedule, and earn competitive
            rates.
          </p>
          <Button
            size="lg"
            className="bg-white text-slate-900 hover:bg-slate-100"
            asChild
          >
            <Link href="/experts">Become an Expert</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
