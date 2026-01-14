'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Users,
  ShieldCheck,
  Database,
  Zap,
  ArrowUpRight,
} from 'lucide-react';

interface StepProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  step: number;
  delay: number;
  isLast?: boolean;
  href: string;
}

function DiagramStep({
  icon,
  title,
  description,
  step,
  delay,
  isLast,
  href,
}: StepProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className="relative flex flex-col items-center">
      {/* Step box - now clickable */}
      <Link
        href={href}
        className={`bg-muted/50 border-border relative flex w-full max-w-[180px] flex-col items-center rounded-xl border p-6 transition-all duration-500 ease-out ${visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'} group cursor-pointer hover:border-blue-300 hover:bg-blue-50 hover:shadow-lg`}
      >
        {/* Step number */}
        <div className="absolute -top-2.5 left-1/2 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white transition-transform group-hover:scale-110">
          {step}
        </div>

        {/* Click indicator */}
        <div className="absolute -top-2.5 -right-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white opacity-0 transition-opacity group-hover:opacity-100">
          <ArrowUpRight className="h-3 w-3" />
        </div>

        {/* Icon */}
        <div className="border-border mb-3 flex h-10 w-10 items-center justify-center rounded-lg border bg-white shadow-sm transition-colors group-hover:border-blue-300">
          {icon}
        </div>

        {/* Title */}
        <h3 className="text-foreground mb-1 text-center text-sm font-medium transition-colors group-hover:text-blue-600">
          {title}
        </h3>

        {/* Description */}
        <p className="text-muted-foreground group-hover:text-foreground text-center text-xs leading-relaxed transition-colors">
          {description}
        </p>
      </Link>

      {/* Connector arrow (horizontal on desktop, vertical on mobile) */}
      {!isLast && (
        <>
          {/* Desktop connector */}
          <div className="absolute top-1/2 -right-8 hidden w-16 -translate-y-1/2 lg:block">
            <svg
              width="64"
              height="24"
              viewBox="0 0 64 24"
              fill="none"
              className="text-border"
            >
              <path
                d="M0 12H56M56 12L48 6M56 12L48 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`transition-all duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}
                style={{ transitionDelay: `${delay + 200}ms` }}
              />
            </svg>
          </div>
          {/* Mobile connector */}
          <div className="flex justify-center py-3 lg:hidden">
            <svg
              width="24"
              height="32"
              viewBox="0 0 24 32"
              fill="none"
              className="text-border"
            >
              <path
                d="M12 0V24M12 24L6 18M12 24L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </>
      )}
    </div>
  );
}

export function SystemDiagram() {
  const steps = [
    {
      icon: <Search className="h-5 w-5 text-blue-600" />,
      title: 'Search Shadowing',
      description: 'Capture user queries & failed responses',
      href: '/how-it-works/capture',
    },
    {
      icon: <Users className="h-5 w-5 text-purple-600" />,
      title: 'Expert Gauntlet',
      description: 'Vet experts via biometric interviews',
      href: '/how-it-works/vetting',
    },
    {
      icon: <ShieldCheck className="h-5 w-5 text-emerald-600" />,
      title: '3-3-3 Workbench',
      description: 'Secure task completion with monitoring',
      href: '/how-it-works/workbench',
    },
    {
      icon: <Database className="h-5 w-5 text-amber-600" />,
      title: 'Gold Dataset',
      description: 'Validated, human-verified outputs',
      href: '/how-it-works/delivery',
    },
    {
      icon: <Zap className="h-5 w-5 text-rose-600" />,
      title: 'Enterprise API',
      description: 'Deliver clean data to LLM teams',
      href: '/how-it-works/delivery',
    },
  ];

  return (
    <div className="w-full">
      {/* Helper text */}
      <div className="mb-4 text-center">
        <p className="text-muted-foreground text-sm">
          Click any step to learn more
        </p>
      </div>

      {/* Desktop: horizontal layout */}
      <div className="hidden items-start justify-between gap-8 lg:flex">
        {steps.map((step, index) => (
          <DiagramStep
            key={step.title}
            icon={step.icon}
            title={step.title}
            description={step.description}
            step={index + 1}
            delay={index * 150}
            isLast={index === steps.length - 1}
            href={step.href}
          />
        ))}
      </div>

      {/* Mobile: vertical layout */}
      <div className="flex flex-col items-center lg:hidden">
        {steps.map((step, index) => (
          <DiagramStep
            key={step.title}
            icon={step.icon}
            title={step.title}
            description={step.description}
            step={index + 1}
            delay={index * 150}
            isLast={index === steps.length - 1}
            href={step.href}
          />
        ))}
      </div>
    </div>
  );
}
