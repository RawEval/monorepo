import * as React from 'react';
import { cn } from '@raweval/utils';

export interface StatsCardProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string | number;
  label: string;
  description?: string;
  trend?: {
    value: string;
    direction: 'up' | 'down';
  };
  icon?: React.ReactNode;
}

const StatsCard = React.forwardRef<HTMLDivElement, StatsCardProps>(
  ({ className, value, label, description, trend, icon, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('text-center', className)}
        {...props}
      >
        {icon && (
          <div className="mb-2 flex justify-center">{icon}</div>
        )}
        <div className="mb-2 text-3xl font-bold">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        <div className="text-sm opacity-90">{label}</div>
        {description && (
          <div className="mt-1 text-xs opacity-75">
            {description}
          </div>
        )}
        {trend && (
          <div
            className={cn(
              'mt-2 text-xs',
              trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
            )}
          >
            {trend.direction === 'up' ? '+' : ''}
            {trend.value}
          </div>
        )}
      </div>
    );
  }
);
StatsCard.displayName = 'StatsCard';

export { StatsCard };
