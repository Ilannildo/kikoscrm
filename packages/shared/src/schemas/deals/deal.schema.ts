import { z } from 'zod';
import { DealStatus } from '../../enums/deal-status.enum';
import { CrmPaginationQuerySchema } from '../common/crm-pagination.schema';

const monetaryValueSchema = z
  .union([z.string(), z.number()])
  .transform((val) => String(val))
  .refine((val) => !Number.isNaN(Number(val)) && Number(val) >= 0, {
    message: 'Valor deve ser um número positivo',
  });

export const DealSchema = z.object({
  id: z.string(),
  name: z.string(),
  value: z.string(),
  status: z.nativeEnum(DealStatus),
  description: z.string().nullable(),
  leadId: z.string(),
  sellerId: z.string(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type DealDto = z.infer<typeof DealSchema>;

export const CreateDealSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  value: monetaryValueSchema,
  description: z.string().max(5000).optional().nullable(),
  leadId: z.string().min(1, 'Lead é obrigatório'),
  sellerId: z.string().min(1, 'Vendedor é obrigatório'),
  status: z.nativeEnum(DealStatus).optional(),
});

export type CreateDealDto = z.infer<typeof CreateDealSchema>;

export const UpdateDealSchema = CreateDealSchema.partial().omit({
  status: true,
  sellerId: true
});

export type UpdateDealDto = z.infer<typeof UpdateDealSchema>;

export const UpdateDealStatusSchema = z.object({
  status: z.nativeEnum(DealStatus),
});

export type UpdateDealStatusDto = z.infer<typeof UpdateDealStatusSchema>;

export const ListDealsQuerySchema = CrmPaginationQuerySchema.extend({
  search: z.string().optional(),
  status: z.nativeEnum(DealStatus).optional(),
  sellerId: z.string().optional(),
  leadId: z.string().optional(),
  minValue: z.coerce.number().min(0).optional(),
  maxValue: z.coerce.number().min(0).optional(),
  from: z.iso.datetime().optional(),
  to: z.iso.datetime().optional(),
  sort: z
    .enum(['createdAt', 'updatedAt', 'name', 'value', '-createdAt', '-updatedAt', '-name', '-value'])
    .optional(),
});

export type ListDealsQueryDto = z.infer<typeof ListDealsQuerySchema>;
