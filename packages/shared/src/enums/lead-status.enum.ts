export const LeadStatus = {
  new: 'new',
  contacted: 'contacted',
  qualified: 'qualified',
  converted: 'converted',
  lost: 'lost',
} as const;

export type LeadStatus = (typeof LeadStatus)[keyof typeof LeadStatus];
