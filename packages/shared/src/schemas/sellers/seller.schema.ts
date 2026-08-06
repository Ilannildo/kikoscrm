import { z } from 'zod';
import { DealStatus } from '../../enums/deal-status.enum';
import { ActivityType } from '../../enums/activity-type.enum';
import { CrmPaginationQuerySchema } from '../common/crm-pagination.schema';

export const SellerMetricsSchema = z.object({
  totalDeals: z.number(),
  wonDeals: z.number(),
  lostDeals: z.number(),
  openDeals: z.number(),
  pipelineValue: z.string(),
  wonValue: z.string(),
});

export type SellerMetricsDto = z.infer<typeof SellerMetricsSchema>;

export const SellerSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  metrics: SellerMetricsSchema,
  createdAt: z.iso.datetime(),
});

export type SellerDto = z.infer<typeof SellerSchema>;

export const ListSellersQuerySchema = CrmPaginationQuerySchema.extend({
  search: z.string().optional(),
});

export type ListSellersQueryDto = z.infer<typeof ListSellersQuerySchema>;

export const DashboardMetricsSchema = z.object({
  totalLeads: z.number(),
  openDeals: z.number(),
  wonDeals: z.number(),
  lostDeals: z.number(),
  pipelineValue: z.string(),
  conversionRate: z.number(),
});

export type DashboardMetricsDto = z.infer<typeof DashboardMetricsSchema>;

export const PipelineItemSchema = z.object({
  status: z.nativeEnum(DealStatus),
  count: z.number(),
  totalValue: z.string(),
});

export type PipelineItemDto = z.infer<typeof PipelineItemSchema>;

export const ActivitySchema = z.object({
  id: z.string(),
  type: z.nativeEnum(ActivityType),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  leadId: z.string().nullable(),
  dealId: z.string().nullable(),
  userId: z.string().nullable(),
  userName: z.string().nullable(),
  createdAt: z.iso.datetime(),
});

export type ActivityDto = z.infer<typeof ActivitySchema>;

export const DashboardSchema = z.object({
  metrics: DashboardMetricsSchema,
  pipeline: z.array(PipelineItemSchema),
  recentDeals: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      value: z.string(),
      status: z.nativeEnum(DealStatus),
      sellerName: z.string(),
      createdAt: z.iso.datetime(),
    }),
  ),
  recentActivities: z.array(ActivitySchema),
});

export type DashboardDto = z.infer<typeof DashboardSchema>;

export const DashboardQuerySchema = z.object({
  sellerId: z.string().optional(),
});

export type DashboardQueryDto = z.infer<typeof DashboardQuerySchema>;
