'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@raweval/ui/badge';
import { appUrls } from '@raweval/utils/urls';
import {
  MessageSquare,
  Briefcase,
  Building2,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  CheckCircle2,
  TrendingUp,
  Users,
  Lock,
  Code,
} from 'lucide-react';

const platforms = [
  {
    name: 'Chat',
    tagline: 'Experience AI, Shape the Future',
    description:
      'Interact with our multimodal AI assistant, provide real-time feedback, and help train better models. Free and open for everyone.',
    href: appUrls.chat(),
    cta: 'Start Chatting →',
    icon: MessageSquare,
    badge: 'For Users',
    features: [
      { icon: Zap, text: 'Multimodal AI assistant' },
      { icon: TrendingUp, text: 'Real-time feedback' },
      { icon: Sparkles, text: 'Help train better AI' },
    ],
    gradient: 'from-blue-500 via-cyan-500 to-blue-600',
    bgGradient: 'from-blue-50 to-cyan-50',
    iconBg: 'bg-blue-500',
    textColor: 'text-blue-600',
    hoverGlow: 'hover:shadow-blue-500/20',
    stats: { primary: 'Free', secondary: 'Open Access' },
  },
  {
    name: 'Workbench',
    tagline: 'Expertise Meets Opportunity',
    description:
      'Join our verified expert network. Review AI responses, earn competitive rates, and work on your schedule. Secure, monitored workbench.',
    href: appUrls.experts(),
    cta: 'Apply Now →',
    icon: Briefcase,
    badge: 'For Experts',
    features: [
      { icon: Users, text: 'Tiered expert network' },
      { icon: Shield, text: 'Secure workbench' },
      { icon: TrendingUp, text: 'Competitive earnings' },
    ],
    gradient: 'from-purple-500 via-pink-500 to-purple-600',
    bgGradient: 'from-purple-50 to-pink-50',
    iconBg: 'bg-purple-500',
    textColor: 'text-purple-600',
    hoverGlow: 'hover:shadow-purple-500/20',
    stats: { primary: 'Flexible', secondary: 'Verified' },
  },
  {
    name: 'Enterprise',
    tagline: 'Production-Grade Data Infrastructure',
    description:
      'Enterprise platform for capturing, validating, and delivering gold-standard training data. API-first, custom workflows, enterprise security.',
    href: appUrls.landing('/organizations'),
    cta: 'Explore Platform →',
    icon: Building2,
    badge: 'For Teams',
    features: [
      { icon: CheckCircle2, text: 'Human-verified data' },
      { icon: Code, text: 'API integration' },
      { icon: Lock, text: 'Enterprise security' },
    ],
    gradient: 'from-emerald-500 via-teal-500 to-emerald-600',
    bgGradient: 'from-emerald-50 to-teal-50',
    iconBg: 'bg-emerald-500',
    textColor: 'text-emerald-600',
    hoverGlow: 'hover:shadow-emerald-500/20',
    stats: { primary: 'API-First', secondary: 'Enterprise' },
  },
];

export function PlatformsShowcase() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section id="platforms" className="relative overflow-hidden py-32 lg:py-40">
      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/30 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-20 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25">
            <Sparkles className="h-4 w-4" />
            <span>Multi-Platform Ecosystem</span>
          </div>
          <h2 className="text-foreground mb-6 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            Pick Your Path
          </h2>
          <p className="text-muted-foreground mx-auto max-w-3xl text-lg leading-relaxed md:text-xl">
            Three platforms, one mission: building better AI through
            human-verified data. Each platform serves a unique role in our
            ecosystem.
          </p>
        </div>

        {/* Platforms grid - Staggered layout */}
        <div className="relative grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {platforms.map((platform, index) => {
            const Icon = platform.icon;
            const isHovered = hoveredIndex === index;

            return (
              <Link
                key={platform.name}
                href={platform.href}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="group relative block"
              >
                <div
                  className={`relative h-full overflow-hidden rounded-3xl border-2 p-8 transition-all duration-500 ${
                    isHovered
                      ? `scale-105 border-transparent shadow-2xl ${platform.hoverGlow} bg-gradient-to-br ${platform.bgGradient}`
                      : 'border-border bg-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  {/* Animated gradient overlay */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${platform.gradient} opacity-0 transition-opacity duration-500 ${
                      isHovered ? 'opacity-5' : ''
                    }`}
                  />

                  {/* Gradient top border */}
                  <div
                    className={`absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r ${platform.gradient} transition-transform duration-500 ${
                      isHovered ? 'scale-x-100' : 'scale-x-50'
                    }`}
                  />

                  {/* Icon with animated background */}
                  <div className="relative mb-6 flex items-start justify-between">
                    <div
                      className={`relative flex h-16 w-16 items-center justify-center rounded-2xl ${platform.iconBg} text-white shadow-lg transition-all duration-500 ${
                        isHovered
                          ? 'scale-110 rotate-6 shadow-xl'
                          : 'scale-100 rotate-0'
                      }`}
                    >
                      <Icon className="h-8 w-8 transition-transform duration-500 group-hover:scale-110" />
                      {/* Glow effect */}
                      <div
                        className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${platform.gradient} opacity-0 blur-xl transition-opacity duration-500 ${
                          isHovered ? 'opacity-30' : ''
                        }`}
                      />
                    </div>
                    <Badge
                      variant={
                        index === 0
                          ? 'default'
                          : index === 1
                            ? 'secondary'
                            : 'outline'
                      }
                      className={`transition-transform duration-300 ${
                        isHovered ? 'scale-110' : ''
                      }`}
                    >
                      {platform.badge}
                    </Badge>
                  </div>

                  {/* Stats */}
                  <div className="mb-4 flex items-center gap-4">
                    <span
                      className={`text-2xl font-bold ${platform.textColor}`}
                    >
                      {platform.stats.primary}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      {platform.stats.secondary}
                    </span>
                  </div>

                  {/* Title and tagline */}
                  <h3 className="text-foreground mb-2 text-2xl font-bold">
                    {platform.name}
                  </h3>
                  <p
                    className={`mb-6 text-sm font-medium ${platform.textColor}`}
                  >
                    {platform.tagline}
                  </p>

                  {/* Description */}
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {platform.description}
                  </p>

                  {/* Features */}
                  <div className="mb-8 space-y-3">
                    {platform.features.map((feature, featureIndex) => {
                      const FeatureIcon = feature.icon;
                      return (
                        <div
                          key={featureIndex}
                          className="flex items-center gap-3 text-sm transition-all duration-300"
                          style={{
                            transform: isHovered
                              ? `translateX(${featureIndex * 4}px)`
                              : 'translateX(0)',
                          }}
                        >
                          <div
                            className={`flex h-6 w-6 items-center justify-center rounded-lg ${platform.iconBg} bg-opacity-10 ${platform.textColor} transition-all duration-300 ${
                              isHovered ? 'scale-110' : ''
                            }`}
                          >
                            <FeatureIcon className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-muted-foreground font-medium">
                            {feature.text}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* CTA Button */}
                  <div className="relative">
                    <div
                      className={`flex items-center justify-between rounded-xl bg-gradient-to-r ${platform.gradient} p-4 text-white shadow-lg transition-all duration-500 ${
                        isHovered ? 'scale-105 shadow-xl' : 'hover:scale-102'
                      }`}
                    >
                      <span className="font-semibold">
                        {(platform.cta || '').split('→')[0]?.trim()}
                      </span>
                      <ArrowRight
                        className={`h-5 w-5 transition-transform duration-300 ${
                          isHovered ? 'translate-x-2' : ''
                        }`}
                      />
                    </div>
                  </div>

                  {/* Decorative elements */}
                  <div
                    className={`absolute -right-4 -bottom-4 h-32 w-32 rounded-full bg-gradient-to-br ${platform.gradient} opacity-0 blur-3xl transition-opacity duration-500 ${
                      isHovered ? 'opacity-10' : ''
                    }`}
                  />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Additional info - Redesigned */}
        <div className="mt-20 flex justify-center">
          <div className="group border-border relative inline-flex items-center gap-3 rounded-2xl border-2 bg-gradient-to-br from-blue-50/50 to-purple-50/50 px-8 py-5 shadow-lg transition-all hover:shadow-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-md">
              <Shield className="h-6 w-6" />
            </div>
            <div className="text-left">
              <p className="text-foreground mb-1 text-sm font-semibold">
                Unified Infrastructure
              </p>
              <p className="text-muted-foreground text-xs leading-relaxed">
                All platforms share the same secure, verified infrastructure
                <span className="text-foreground font-medium">.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
