import { z } from 'zod';

export const CHANNELS = ['email', 'linkedin', 'phone', 'event', 'referral', 'other'] as const;
export type Channel = (typeof CHANNELS)[number];

export const CHANNEL_LABELS: Record<Channel, string> = {
  email: 'E-Mail',
  linkedin: 'LinkedIn',
  phone: 'Telefon',
  event: 'Event',
  referral: 'Empfehlung',
  other: 'Sonstiges',
};

export const CHANNEL_ICONS: Record<Channel, string> = {
  email: '✉',
  linkedin: 'in',
  phone: '☎',
  event: '◆',
  referral: '↗',
  other: '•',
};

export const STATUSES = [
  'sent',
  'opened',
  'replied',
  'meeting_booked',
  'meeting_done',
  'won',
  'lost',
  'no_response',
] as const;
export type Status = (typeof STATUSES)[number];

export const STATUS_LABELS: Record<Status, string> = {
  sent: 'Gesendet',
  opened: 'Geöffnet',
  replied: 'Antwort erhalten',
  meeting_booked: 'Meeting gebucht',
  meeting_done: 'Meeting gehalten',
  won: 'Gewonnen',
  lost: 'Verloren',
  no_response: 'Keine Antwort',
};

export const STATUS_VARIANTS: Record<Status, 'default' | 'accent' | 'success' | 'warning' | 'danger' | 'info'> = {
  sent: 'default',
  opened: 'info',
  replied: 'accent',
  meeting_booked: 'warning',
  meeting_done: 'success',
  won: 'success',
  lost: 'danger',
  no_response: 'default',
};

export const POSITIVE_STATUSES: Status[] = ['replied', 'meeting_booked', 'meeting_done', 'won'];
export const MEETING_STATUSES: Status[] = ['meeting_booked', 'meeting_done', 'won'];

export const outreachSchema = z.object({
  activity_date: z.string().min(1, 'Datum erforderlich'),
  owner: z.string().min(1, 'Owner erforderlich'),
  channel: z.enum(CHANNELS),
  target_person: z.string().min(1, 'Zielperson erforderlich'),
  target_role: z.string().optional().nullable(),
  target_company: z.string().min(1, 'Unternehmen erforderlich'),
  icp_segment: z.string().min(1, 'ICP erforderlich'),
  value_prop: z.string().min(1, 'Value Prop erforderlich'),
  status: z.enum(STATUSES),
  result_notes: z.string().optional().nullable(),
  follow_up_date: z.string().optional().nullable(),
  follow_up_done: z.boolean().optional().default(false),
});

export type OutreachInput = z.infer<typeof outreachSchema>;

export type OutreachActivity = OutreachInput & {
  id: string;
  created_at: string;
  updated_at: string;
};
