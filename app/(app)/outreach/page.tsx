import Link from 'next/link';
import { PageHeader } from '@/components/shell/PageHeader';
import { OutreachTable } from '@/components/outreach/OutreachTable';
import { listOutreach } from '@/lib/supabase/outreach-repo';
import { teamMembers } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function OutreachListPage() {
  const rows = await listOutreach().catch(() => []);
  const owners = Array.from(new Set([...teamMembers(), ...rows.map((r) => r.owner)])).filter(
    Boolean,
  );

  return (
    <>
      <PageHeader
        title="Outreach"
        subtitle="Alle Outreach-Aktivitäten — über alle Kanäle."
        actions={
          <Link href="/outreach/new" className="btn-primary">
            + Neue Aktivität
          </Link>
        }
      />
      <OutreachTable rows={rows} owners={owners} />
    </>
  );
}
