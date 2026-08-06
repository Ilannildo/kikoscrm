export const DealStatus = {
  new: 'new',
  in_progress: 'in_progress',
  won: 'won',
  lost: 'lost',
} as const;

export type DealStatus = (typeof DealStatus)[keyof typeof DealStatus];
