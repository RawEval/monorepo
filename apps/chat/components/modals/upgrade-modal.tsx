'use client';

import { useState } from 'react';
import { X, Zap, Check, Sparkles } from 'lucide-react';
import { Button } from '@raweval/ui/button';
import { Badge } from '@raweval/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@raweval/ui/card';

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Plan {
  id: string;
  name: string;
  price: {
    monthly: string;
    annually: string;
  };
  badge?: string;
  description: string;
  features: string[];
  popular?: boolean;
  current?: boolean;
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: {
      monthly: '$0',
      annually: '$0',
    },
    description: 'Perfect for getting started',
    features: [
      'Basic AI chat access',
      'Limited messages per month',
      'Community support',
    ],
    current: true,
  },
  {
    id: 'individual',
    name: 'Individual',
    price: {
      monthly: '$36',
      annually: '$25',
    },
    badge: 'Most Popular',
    description: 'Ideal for startups and small businesses',
    features: [
      'Unlimited AI chat access',
      'Access to all features, with plagiarism checker',
      'Faster response speed',
      'Access to beta features',
      'Priority support',
    ],
    popular: true,
  },
  {
    id: 'teams',
    name: 'Teams',
    price: {
      monthly: '$64',
      annually: '$45',
    },
    description: 'Perfect for businesses and teams',
    features: [
      'Everything in Individual',
      'Team collaboration tools',
      'Shared workspaces',
      'Advanced admin controls',
      'Dedicated account manager',
    ],
  },
];

export function UpgradeModal({ open, onOpenChange }: UpgradeModalProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('annually');

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="relative w-full max-w-6xl rounded-2xl border border-border bg-background p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Upgrade Plans</span>
          </div>
          <h2 className="mb-2 text-3xl font-bold text-foreground">
            Choose your plan
          </h2>
          <p className="text-muted-foreground">
            Looking to find out what an upgrade you can get?{' '}
            <button className="text-primary underline hover:no-underline">
              More details
            </button>
          </p>
        </div>

        {/* Billing Toggle (no extra deps) */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex items-center rounded-lg border border-border bg-background p-1">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('annually')}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                billingCycle === 'annually'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              Annually
            </button>
          </div>
          <Badge variant="secondary" className="text-xs">
            Save 30%
          </Badge>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {plans.map((plan) => {
            const price = plan.price[billingCycle];
            const isPopular = plan.popular;

            return (
              <Card
                key={plan.id}
                className={`relative flex flex-col transition-all hover:shadow-lg ${
                  isPopular
                    ? 'border-primary shadow-lg md:scale-105'
                    : 'border-border'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-4">
                  <div className="mb-2">
                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-foreground">{price}</span>
                      <span className="text-muted-foreground text-sm">/month</span>
                    </div>
                    {billingCycle === 'annually' && plan.price.annually !== plan.price.monthly && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Billed annually
                      </p>
                    )}
                  </div>
                  <CardDescription className="mt-2 text-base">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    variant={isPopular ? 'default' : 'outline'}
                    className="w-full"
                    disabled={plan.current}
                    size="lg"
                  >
                    {plan.current ? (
                      'Current Plan'
                    ) : (
                      <>
                        {isPopular && <Zap className="mr-2 h-4 w-4" />}
                        Upgrade
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
