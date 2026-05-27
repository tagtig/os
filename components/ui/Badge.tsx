import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'default' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

const VARIANT_CLASSES: Record<Variant, string> = {
  default: 'bg-subtle text-ink-secondary',
  accent: 'bg-accent/10 text-accent',
  success: 'bg-status-interview/10 text-status-interview',
  warning: 'bg-status-feedback/15 text-[#B45309]',
  danger: 'bg-status-rejected/10 text-status-rejected',
  info: 'bg-status-question/10 text-status-question',
};

export function Badge({
  children,
  variant = 'default',
  icon,
  className,
}: {
  children: ReactNode;
  variant?: Variant;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.02em] whitespace-nowrap',
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      {icon && <span className="text-[11px] normal-case">{icon}</span>}
      {children}
    </span>
  );
}
