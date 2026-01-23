import * as React from 'react';
import { cn } from '@raweval/utils';
import { createPortal } from 'react-dom';

interface DropdownMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
}

const DropdownMenuContext =
  React.createContext<DropdownMenuContextValue | null>(null);

interface DropdownMenuProps {
  children: React.ReactNode;
}

interface DropdownMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'end';
  side?: 'top' | 'bottom';
}

interface DropdownMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive';
}

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <DropdownMenuContext.Provider
      value={{ open, setOpen, triggerRef, contentRef }}
    >
      {children}
    </DropdownMenuContext.Provider>
  );
}

const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  DropdownMenuTriggerProps
>(({ children, className, asChild, ...props }, ref) => {
  const context = React.useContext(DropdownMenuContext);
  if (!context)
    throw new Error('DropdownMenuTrigger must be used within DropdownMenu');

  const { open, setOpen, triggerRef } = context;
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  React.useImperativeHandle(ref, () => buttonRef.current!);
  React.useImperativeHandle(triggerRef, () => buttonRef.current!);

  return (
    <button
      ref={buttonRef}
      type="button"
      className={className}
      {...props}
      onClick={(e) => {
        setOpen(!open);
        props.onClick?.(e);
      }}
    >
      {children}
    </button>
  );
});
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  DropdownMenuContentProps
>(({ children, className, align = 'end', side = 'bottom', ...props }, ref) => {
  const context = React.useContext(DropdownMenuContext);
  if (!context)
    throw new Error('DropdownMenuContent must be used within DropdownMenu');

  const { open, contentRef, triggerRef } = context;
  const [position, setPosition] = React.useState({ top: 0, left: 0 });

  React.useImperativeHandle(ref, () => contentRef.current!);

  React.useEffect(() => {
    if (!open || !triggerRef.current || !contentRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const contentRect = contentRef.current.getBoundingClientRect();

    let top = triggerRect.bottom + 8;
    let left =
      align === 'end'
        ? triggerRect.right - contentRect.width
        : triggerRect.left;

    if (side === 'top') {
      top = triggerRect.top - contentRect.height - 8;
    }

    if (left + contentRect.width > window.innerWidth) {
      left = window.innerWidth - contentRect.width - 8;
    }
    if (left < 8) left = 8;

    setPosition({ top, left });
  }, [open, align, side]);

  if (!open) return null;

  return createPortal(
    <div
      ref={contentRef}
      className={cn(
        'border-border bg-popover text-popover-foreground absolute z-50 min-w-[8rem] overflow-hidden rounded-lg border p-1 shadow-md',
        className
      )}
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
      {...props}
    >
      {children}
    </div>,
    document.body
  );
});
DropdownMenuContent.displayName = 'DropdownMenuContent';

const DropdownMenuItem = React.forwardRef<
  HTMLButtonElement,
  DropdownMenuItemProps
>(({ children, className, variant = 'default', ...props }, ref) => {
  const context = React.useContext(DropdownMenuContext);
  if (!context)
    throw new Error('DropdownMenuItem must be used within DropdownMenu');

  const { setOpen } = context;

  return (
    <button
      ref={ref}
      type="button"
      onClick={(e) => {
        setOpen(false);
        props.onClick?.(e);
      }}
      className={cn(
        'focus:bg-accent focus:text-accent-foreground relative flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        variant === 'destructive' &&
          'text-destructive focus:bg-destructive/10 focus:text-destructive',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});
DropdownMenuItem.displayName = 'DropdownMenuItem';

export { DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem };
