import { PageHeader } from '@/components/shell/PageHeader';
import { OutreachForm } from '@/components/outreach/OutreachForm';
import { listTaxonomy } from '@/lib/supabase/taxonomy-repo';
import { teamMembers } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function NewOutreachPage() {
  const team = teamMembers();
  const [icps, vps] = await Promise.all([
    listTaxonomy('icp').catch(() => []),
    listTaxonomy('value_prop').catch(() => []),
  ]);

  return (
    <>
      <PageHeader
        title="Neue Outreach-Aktivität"
        subtitle="Logge eine Outreach-Aktion über einen beliebigen Kanal."
      />
      <OutreachForm
        team={team}
        icpOptions={icps.map((i) => i.name)}
        valuePropOptions={vps.map((v) => v.name)}
      />
    </>
  );
}
