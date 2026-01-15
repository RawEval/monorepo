import * as React from 'react';
import { cn } from '@raweval/utils';

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'vertical' | 'horizontal';
}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, orientation = 'vertical', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative overflow-hidden',
          orientation === 'vertical' ? 'overflow-y-auto' : 'overflow-x-auto',
          className
        )}
        {...props}
      >
        <div className={cn('h-full w-full', orientation === 'vertical' ? 'pr-4' : 'pb-4')}>
          {children}
        </div>
      </div>
    );
  }
);
ScrollArea.displayName = 'ScrollArea';

export { ScrollArea };
