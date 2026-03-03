import * as React from 'react';
import { cn } from '@raweval/utils';
import { ChevronDown, Check } from 'lucide-react';
import { createPortal } from 'react-dom';

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface SelectContextValue {
  value: string;
  open: boolean;
  setOpen: (v: boolean) => void;
  onSelect: (v: string) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const SelectContext = React.createContext<SelectContextValue | null>(null);

function useSelectCtx() {
  const ctx = React.useContext(SelectContext);
  if (!ctx) throw new Error('Select components must be used within <Select>');
  return ctx;
}

// ---------------------------------------------------------------------------
// Select root
// ---------------------------------------------------------------------------

interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

export function Select({
  value: controlledValue,
  defaultValue = '',
  onValueChange,
  children,
}: SelectProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  const value = controlledValue ?? internalValue;

  const handleSelect = React.useCallback(
    (v: string) => {
      setInternalValue(v);
      onValueChange?.(v);
      setOpen(false);
    },
    [onValueChange]
  );

  // Close on outside click / Escape
  React.useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <SelectContext.Provider
      value={{ value, open, setOpen, onSelect: handleSelect, triggerRef }}
    >
      {children}
    </SelectContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// SelectTrigger
// ---------------------------------------------------------------------------

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  placeholder?: string;
}

export const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  SelectTriggerProps
>(({ children, className, ...props }, ref) => {
  const { open, setOpen, triggerRef } = useSelectCtx();

  React.useImperativeHandle(ref, () => triggerRef.current!);

  return (
    <button
      ref={triggerRef}
      type="button"
      role="combobox"
      aria-expanded={open}
      onClick={() => setOpen(!open)}
      className={cn(
        'border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown
        className={cn(
          'text-muted-foreground ml-2 h-4 w-4 shrink-0 transition-transform',
          open && 'rotate-180'
        )}
      />
    </button>
  );
});
SelectTrigger.displayName = 'SelectTrigger';

// ---------------------------------------------------------------------------
// SelectValue (display inside trigger)
// ---------------------------------------------------------------------------

export function SelectValue({ placeholder }: { placeholder?: string }) {
  const { value } = useSelectCtx();
  return <span className="truncate">{value || placeholder}</span>;
}

// ---------------------------------------------------------------------------
// SelectContent (portal dropdown)
// ---------------------------------------------------------------------------

interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'end';
}

export const SelectContent = React.forwardRef<
  HTMLDivElement,
  SelectContentProps
>(({ children, className, align = 'start', ...props }, ref) => {
  const { open, triggerRef } = useSelectCtx();
  const [pos, setPos] = React.useState({ top: 0, left: 0, width: 0 });
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useImperativeHandle(ref, () => contentRef.current!);

  React.useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPos({
      top: rect.bottom + 4,
      left: align === 'end' ? rect.right : rect.left,
      width: rect.width,
    });
  }, [open, align]);

  if (!open) return null;

  return createPortal(
    <div
      ref={contentRef}
      role="listbox"
      className={cn(
        'border-border bg-popover text-popover-foreground absolute z-50 min-w-32 overflow-hidden rounded-lg border p-1 shadow-md',
        className
      )}
      style={{ top: pos.top, left: pos.left, width: pos.width }}
      {...props}
    >
      {children}
    </div>,
    document.body
  );
});
SelectContent.displayName = 'SelectContent';

// ---------------------------------------------------------------------------
// SelectItem
// ---------------------------------------------------------------------------

interface SelectItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export const SelectItem = React.forwardRef<HTMLButtonElement, SelectItemProps>(
  ({ children, className, value, ...props }, ref) => {
    const { value: selected, onSelect } = useSelectCtx();
    const isSelected = selected === value;

    return (
      <button
        ref={ref}
        type="button"
        role="option"
        aria-selected={isSelected}
        onClick={() => onSelect(value)}
        className={cn(
          'focus:bg-accent relative flex w-full cursor-pointer items-center rounded-sm py-1.5 pr-2 pl-8 text-sm transition-colors outline-none select-none',
          isSelected
            ? 'bg-accent text-accent-foreground'
            : 'hover:bg-accent hover:text-accent-foreground',
          className
        )}
        {...props}
      >
        {isSelected && (
          <span className="absolute left-2 flex items-center justify-center">
            <Check className="h-4 w-4" />
          </span>
        )}
        {children}
      </button>
    );
  }
);
SelectItem.displayName = 'SelectItem';
