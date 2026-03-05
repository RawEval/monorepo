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

export function DropdownMenu({ children }: { children: React.ReactNode }) {
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
      <div className="relative inline-block text-left">{children}</div>
    </DropdownMenuContext.Provider>
  );
}

export const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ children, className, asChild, ...props }, ref) => {
  const context = React.useContext(DropdownMenuContext);
  if (!context)
    throw new Error('DropdownMenuTrigger must be used within DropdownMenu');
  const { open, setOpen, triggerRef } = context;

  const internalRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (typeof ref === 'function') ref(internalRef.current);
    else if (ref) (ref as any).current = internalRef.current;
    (triggerRef as any).current = internalRef.current;
  }, [ref, triggerRef]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setOpen(!open);
    props.onClick?.(e);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      ref: internalRef,
      onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
        handleClick(e);
        (children.props as any).onClick?.(e);
      },
    });
  }

  return (
    <button
      ref={internalRef}
      type="button"
      className={className}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
});

export const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { align?: 'start' | 'end' }
>(({ children, className, align = 'end', ...props }, _ref) => {
  const context = React.useContext(DropdownMenuContext);
  if (!context)
    throw new Error('DropdownMenuContent must be used within DropdownMenu');
  const { open, triggerRef, contentRef } = context;
  const [pos, setPos] = React.useState({ top: 0, left: 0 });

  React.useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + window.scrollY + 8,
        left:
          align === 'end'
            ? rect.right + window.scrollX
            : rect.left + window.scrollX,
      });
    }
  }, [open, align]);

  if (!open) return null;

  return createPortal(
    <div
      ref={contentRef}
      className={cn(
        'border-border bg-popover text-popover-foreground absolute z-50 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-md transition-all',
        align === 'end' ? '-translate-x-full' : '',
        className
      )}
      style={{ top: pos.top, left: pos.left }}
      {...props}
    >
      {children}
    </div>,
    document.body
  );
});

export function DropdownMenuItem({
  children,
  className,
  onClick,
  asChild,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) {
  const context = React.useContext(DropdownMenuContext);
  if (!context)
    throw new Error('DropdownMenuItem must be used within DropdownMenu');
  const { setOpen } = context;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setOpen(false);
    onClick?.(e);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
        handleClick(e);
        (children.props as any).onClick?.(e);
      },
    });
  }

  return (
    <button
      type="button"
      className={cn(
        'hover:bg-accent hover:text-accent-foreground relative flex w-full cursor-default items-center rounded-sm px-2 py-1.5 text-sm transition-colors outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}

export function DropdownMenuLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'text-muted-foreground px-2 py-1.5 text-xs font-semibold',
        className
      )}
    >
      {children}
    </div>
  );
}

export function DropdownMenuSeparator() {
  return <div className="bg-border -mx-1 my-1 h-px" />;
}
