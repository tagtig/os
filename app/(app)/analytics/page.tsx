import { PageHeader } from '@/components/shell/PageHeader';
import { listOutreach } from '@/lib/supabase/outreach-repo';
import { AnalyticsClient } from './AnalyticsClient';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  const rows = await listOutreach().catch(() => []);
  return (
    <>
      <PageHeader
        title="Analytics"
        subtitle="Welche Kanäle, Value Props und ICPs performen am besten."
      />
      <AnalyticsClient rows={rows} />
    </>
  );
}
