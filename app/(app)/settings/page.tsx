import { headers } from 'next/headers';
import { PageHeader } from '@/components/shell/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { TaxonomyEditor } from '@/components/settings/TaxonomyEditor';
import { UsersEditor } from '@/components/settings/UsersEditor';
import { listTaxonomy } from '@/lib/supabase/taxonomy-repo';
import { listOutreach } from '@/lib/supabase/outreach-repo';
import { listUsers } from '@/lib/supabase/users-repo';
import type { TaxonomyItem } from '@/lib/taxonomy';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const h = await headers();
  const currentUserRole = h.get('x-user-role') ?? 'user';
  const currentUserId = h.get('x-user-id') ?? '';

  const [icps, vps, activities, users] = await Promise.all([
    listTaxonomy('icp').catch(() => []),
    listTaxonomy('value_prop').catch(() => []),
    listOutreach().catch(() => []),
    currentUserRole === 'admin' ? listUsers().catch(() => []) : Promise.resolve([]),
  ]);

  const icpNameCounts = new Map<string, number>();
  const vpNameCounts = new Map<string, number>();
  for (const a of activities) {
    icpNameCounts.set(a.icp_segment, (icpNameCounts.get(a.icp_segment) ?? 0) + 1);
    vpNameCounts.set(a.value_prop, (vpNameCounts.get(a.value_prop) ?? 0) + 1);
  }
  const usageFor = (
    items: TaxonomyItem[],
    nameCounts: Map<string, number>,
  ): Record<string, number> => {
    const out: Record<string, number> = {};
    for (const item of items) out[item.id] = nameCounts.get(item.name) ?? 0;
    return out;
  };

  return (
    <>
      <PageHeader
        title="Einstellungen"
        subtitle="Pflege deine ICP Segmente, Value Props und Benutzerverwaltung."
      />

      {/* Benutzerverwaltung — nur für Admins */}
      {currentUserRole === 'admin' && (
        <Card className="mb-5">
          <CardHeader
            title="Benutzerverwaltung"
            subtitle="Lade Mitarbeiter ein und verwalte ihre Rollen. Der Einladungslink ist 7 Tage gültig."
          />
          <UsersEditor users={users} currentUserId={currentUserId} />
        </Card>
      )}

      <div className="grid grid-cols-2 gap-5">
        <Card>
          <CardHeader title="ICP Segmente" subtitle="Zielgruppen, die du adressierst." />
          <TaxonomyEditor kind="icp" items={icps} usage={usageFor(icps, icpNameCounts)} />
        </Card>
        <Card>
          <CardHeader title="Value Props" subtitle="Argumente / Pitches, die du testest." />
          <TaxonomyEditor
            kind="value_prop"
            items={vps}
            usage={usageFor(vps, vpNameCounts)}
          />
        </Card>
      </div>
    </>
  );
}
