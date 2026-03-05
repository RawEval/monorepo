import * as React from 'react';
import { cn } from '@raweval/utils';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'bg-muted relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
Avatar.displayName = 'Avatar';

export const AvatarImage = React.forwardRef<
  HTMLImageElement,
  React.ImgHTMLAttributes<HTMLImageElement>
>(({ className, src, alt, ...props }, ref) => {
  const [error, setError] = React.useState(false);
  if (!src || error) return null;
  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      onError={() => setError(true)}
      className={cn('aspect-square h-full w-full object-cover', className)}
      {...props}
    />
  );
});
AvatarImage.displayName = 'AvatarImage';

export const AvatarFallback = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'bg-muted flex h-full w-full items-center justify-center rounded-full text-sm font-medium',
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = 'AvatarFallback';
