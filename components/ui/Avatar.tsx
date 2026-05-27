import { cn } from '@/lib/utils';
import { initials } from '@/lib/utils';

export function Avatar({
  name,
  size = 'md',
  className,
}: {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const dim =
    size === 'lg' ? 'h-12 w-12 text-base' : size === 'sm' ? 'h-8 w-8 text-[12px]' : 'h-11 w-11 text-sm';
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-accent font-bold text-ink-on-dark',
        dim,
        className,
      )}
    >
      {initials(name) || '?'}
    </div>
  );
}
