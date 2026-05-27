import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function StatCard({
  label,
  value,
  icon,
  trend,
  accent,
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  trend?: ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="card flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-ink-secondary">{label}</span>
        {icon && (
          <div className="flex h-7 w-7 items-center justify-center text-ink-muted">{icon}</div>
        )}
      </div>
      <div
        className={cn(
          'text-[32px] font-bold leading-none',
          accent ? 'text-accent' : 'text-ink-primary',
        )}
      >
        {value}
      </div>
      {trend && <div className="font-mono text-[11px] text-ink-secondary">{trend}</div>}
    </div>
  );
}
