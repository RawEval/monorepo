'use client';

import { useState } from 'react';
import { Zap, Check, Sparkles } from 'lucide-react';
import { Button } from '@raweval/ui/button';
import { Badge } from '@raweval/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@raweval/ui/card';

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
      'Standard response time',
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
      'Access to beta features (browsing, plugins, advanced data analysis)',
      'Priority support',
      'Advanced analytics',
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
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantee',
    ],
  },
];

export function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('annually');

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8 sm:mb-12 text-center px-2">
          <div className="mb-3 sm:mb-4 inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-border bg-muted px-3 sm:px-4 py-1.5 sm:py-2">
            <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-foreground">Pricing Plans</span>
          </div>
          <h1 className="mb-3 sm:mb-4 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Choose the perfect plan
          </h1>
          <p className="mx-auto max-w-2xl text-sm sm:text-base lg:text-lg text-muted-foreground">
            Start with our free plan and upgrade as you grow. All plans include access to our expert-verified AI.
          </p>
        </div>

        {/* Billing Toggle (no extra deps) */}
        <div className="mb-12 flex items-center justify-center gap-3">
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
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
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
                        Billed annually (${plan.price.annually.replace('$', '')} × 12)
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
                    onClick={() => {
                      if (!plan.current) {
                        // TODO: Implement actual upgrade logic
                        alert(`Upgrade to ${plan.name} plan - Integration with payment system coming soon!`);
                      }
                    }}
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

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="mb-8 text-center text-2xl font-bold text-foreground">
            Frequently asked questions
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I change plans later?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  We accept all major credit cards, debit cards, and PayPal. Enterprise plans also support invoicing.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is there a free trial?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Yes! Our free plan is available forever. You can also start a 14-day free trial of any paid plan.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What happens if I exceed my limits?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  We'll notify you when you're approaching your limits. You can upgrade your plan or purchase additional credits.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
