import * as React from 'react';
import { cn } from '@raweval/utils';

export interface SectionHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  badge?: React.ReactNode;
  title: string;
  description?: string;
  alignment?: 'left' | 'center';
}

const SectionHeader = React.forwardRef<HTMLDivElement, SectionHeaderProps>(
  (
    { className, badge, title, description, alignment = 'center', ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          alignment === 'center' ? 'text-center' : 'text-left',
          className
        )}
        {...props}
      >
        {badge && (
          <div
            className={cn(
              'mb-6 flex',
              alignment === 'center' ? 'justify-center' : 'justify-start'
            )}
          >
            {badge}
          </div>
        )}
        <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
          {title}
        </h2>
        {description && (
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    );
  }
);
SectionHeader.displayName = 'SectionHeader';

export { SectionHeader };
