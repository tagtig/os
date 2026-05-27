import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/shell/PageHeader';
import { OutreachForm } from '@/components/outreach/OutreachForm';
import { getOutreach } from '@/lib/supabase/outreach-repo';
import { listTaxonomy } from '@/lib/supabase/taxonomy-repo';
import { teamMembers } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function OutreachDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getOutreach(id).catch(() => null);
  if (!item) notFound();

  const team = teamMembers();
  const [icps, vps] = await Promise.all([
    listTaxonomy('icp').catch(() => []),
    listTaxonomy('value_prop').catch(() => []),
  ]);
  const teamWithCurrent = Array.from(new Set([...team, item.owner])).filter(Boolean);

  return (
    <>
      <PageHeader
        title={`${item.target_person} · ${item.target_company}`}
        subtitle="Aktivität bearbeiten oder löschen."
      />
      <OutreachForm
        initial={item}
        team={teamWithCurrent}
        icpOptions={icps.map((i) => i.name)}
        valuePropOptions={vps.map((v) => v.name)}
      />
    </>
  );
}
