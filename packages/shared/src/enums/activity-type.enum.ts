export const ActivityType = {
  LEAD_CREATED: 'LEAD_CREATED',
  LEAD_UPDATED: 'LEAD_UPDATED',
  DEAL_CREATED: 'DEAL_CREATED',
  DEAL_UPDATED: 'DEAL_UPDATED',
  DEAL_STATUS_CHANGED: 'DEAL_STATUS_CHANGED',
  COMMENT_CREATED: 'COMMENT_CREATED',
  DEAL_WON: 'DEAL_WON',
  DEAL_LOST: 'DEAL_LOST',
} as const;

export type ActivityType = (typeof ActivityType)[keyof typeof ActivityType];
