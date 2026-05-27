import type { ReactNode } from 'react';

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-8 flex items-start justify-between gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-[30px] font-bold leading-tight tracking-tight text-ink-primary">
          {title}
        </h1>
        {subtitle && <p className="text-sm text-ink-secondary">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </header>
  );
}
