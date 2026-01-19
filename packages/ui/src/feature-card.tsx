import * as React from 'react';
import { cn } from '@raweval/utils';

export interface FeatureCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  iconBg?: string;
  title: string;
  description: string;
  features?: Array<{
    label: string;
    icon?: React.ReactNode;
  }>;
  variant?: 'default' | 'highlighted';
}

const FeatureCard = React.forwardRef<HTMLDivElement, FeatureCardProps>(
  (
    {
      className,
      icon,
      iconBg = 'bg-blue-100',
      title,
      description,
      features,
      variant = 'default',
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl border border-border bg-white p-8 shadow-sm transition-all hover:shadow-md',
          variant === 'highlighted' && 'border-2 border-primary shadow-lg',
          className
        )}
        {...props}
      >
        {icon && (
          <div
            className={cn(
              'mb-4 flex h-12 w-12 items-center justify-center rounded-xl',
              iconBg
            )}
          >
            {icon}
          </div>
        )}
        <h3 className="mb-3 text-xl font-semibold text-foreground">{title}</h3>
        <p className="mb-4 text-sm text-muted-foreground">{description}</p>
        {features && features.length > 0 && (
          <ul className="space-y-2 text-sm">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                {feature.icon && (
                  <span className="mt-0.5 shrink-0">{feature.icon}</span>
                )}
                <span className="text-muted-foreground">{feature.label}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
);
FeatureCard.displayName = 'FeatureCard';

export { FeatureCard };
