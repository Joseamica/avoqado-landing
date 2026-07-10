export const STORY_FIXTURE = {
  organization: 'Estudio Lumina',
  venue: 'Sucursal Centro',
  comparisonVenue: 'Sucursal Norte',
  customer: 'María G.',
  staff: 'Ana Torres',
  service: 'Facial hidratante',
  product: 'Crema facial 50 ml',
  subtotal: '$295.00',
  tip: '$53.10',
  total: '$348.10',
  points: 29,
  commission: '$29.50',
  stockBefore: 8,
  stockAfter: 7,
  selectedMerchant: 'Operación diaria',
  alternateMerchant: 'Facturación',
} as const;

export type StoryFixture = typeof STORY_FIXTURE;
