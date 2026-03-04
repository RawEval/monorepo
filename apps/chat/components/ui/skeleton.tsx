import { cn } from '@raweval/utils';

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'bg-muted/50 dark:bg-muted/20 animate-pulse rounded-md',
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
