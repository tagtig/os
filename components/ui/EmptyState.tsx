import type { ReactNode } from 'react';

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-line-strong bg-card p-12 text-center">
      <div className="text-lg font-bold text-ink-primary">{title}</div>
      {description && (
        <p className="max-w-md text-sm leading-relaxed text-ink-secondary">{description}</p>
      )}
      {action}
    </div>
  );
}
