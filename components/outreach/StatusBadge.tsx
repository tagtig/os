import { Badge } from '@/components/ui/Badge';
import { STATUS_LABELS, STATUS_VARIANTS, type Status } from '@/lib/outreach';

export function StatusBadge({ status }: { status: Status }) {
  return <Badge variant={STATUS_VARIANTS[status]}>{STATUS_LABELS[status]}</Badge>;
}
