'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

type Item = { href: string; label: string };

const SECTIONS: { label: string; items: Item[] }[] = [
  {
    label: 'Akquise',
    items: [
      { href: '/dashboard', label: 'Dashboard' },
      { href: '/outreach', label: 'Outreach' },
      { href: '/analytics', label: 'Analytics' },
    ],
  },
  {
    label: 'System',
    items: [{ href: '/settings', label: 'Einstellungen' }],
  },
];

export function Sidebar({ user }: { user: string }) {
  const pathname = usePathname() ?? '';

  return (
    <aside className="sticky top-0 flex h-screen flex-col overflow-y-auto border-r border-line bg-card py-6">
      <div className="flex items-center justify-between px-6 pb-8">
        <span className="font-sans text-[34px] font-bold leading-none tracking-tight text-accent">
          tagtig
        </span>
        <span className="font-mono text-[10px] tracking-wider text-ink-muted">OS</span>
      </div>

      {SECTIONS.map((section) => (
        <nav key={section.label} className="mb-6 px-3">
          <div className="section-label mb-2 px-3">{section.label}</div>
          <ul className="flex flex-col gap-0.5">
            {section.items.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-button px-3 py-2.5 text-sm font-medium transition-colors',
                      active
                        ? 'bg-accent text-ink-on-dark hover:bg-accent-hover'
                        : 'text-ink-primary hover:bg-subtle',
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ))}

      <div className="mx-3 mt-auto flex items-center gap-3 rounded-button border border-line p-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-subtle font-mono text-[11px] text-ink-secondary">
          {user.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-semibold text-ink-primary">{user}</div>
          <div className="truncate text-xs text-ink-secondary">tagtig OS</div>
        </div>
        <Link
          href="/logout"
          title="Abmelden"
          className="text-ink-muted hover:text-ink-primary"
        >
          ⎋
        </Link>
      </div>
    </aside>
  );
}
