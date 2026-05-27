import { z } from 'zod';

export type TaxonomyItem = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type TaxonomyKind = 'icp' | 'value_prop';

export const TAXONOMY_LABELS: Record<TaxonomyKind, { singular: string; plural: string }> = {
  icp: { singular: 'ICP Segment', plural: 'ICP Segmente' },
  value_prop: { singular: 'Value Prop', plural: 'Value Props' },
};

export const taxonomyInputSchema = z.object({
  name: z.string().trim().min(1, 'Name erforderlich').max(120, 'Maximal 120 Zeichen'),
});

export type TaxonomyInput = z.infer<typeof taxonomyInputSchema>;
