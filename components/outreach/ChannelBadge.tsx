import { Badge } from '@/components/ui/Badge';
import { CHANNEL_ICONS, CHANNEL_LABELS, type Channel } from '@/lib/outreach';

const VARIANT_BY_CHANNEL: Record<Channel, 'default' | 'accent' | 'info' | 'success' | 'warning'> = {
  email: 'info',
  linkedin: 'accent',
  phone: 'success',
  event: 'warning',
  referral: 'default',
  other: 'default',
};

export function ChannelBadge({ channel }: { channel: Channel }) {
  return (
    <Badge variant={VARIANT_BY_CHANNEL[channel]} icon={<span>{CHANNEL_ICONS[channel]}</span>}>
      {CHANNEL_LABELS[channel]}
    </Badge>
  );
}
