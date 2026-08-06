import { z } from 'zod';
import { LeadStatus } from '../../enums/lead-status.enum';
import { CrmPaginationQuerySchema } from '../common/crm-pagination.schema';

export const LeadSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  company: z.string().nullable(),
  source: z.string().nullable(),
  notes: z.string().nullable(),
  status: z.nativeEnum(LeadStatus),
  sellerId: z.string(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type LeadDto = z.infer<typeof LeadSchema>;

export const CreateLeadSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('E-mail inválido').optional().nullable(),
  phone: z.string().max(30).optional().nullable(),
  company: z.string().max(200).optional().nullable(),
  source: z.string().max(100).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
  status: z.nativeEnum(LeadStatus).optional(),
  sellerId: z.string().min(1, 'Vendedor é obrigatório'),
});

export type CreateLeadDto = z.infer<typeof CreateLeadSchema>;

export const UpdateLeadSchema = CreateLeadSchema.partial().omit({ sellerId: true });

export type UpdateLeadDto = z.infer<typeof UpdateLeadSchema>;

export const ListLeadsQuerySchema = CrmPaginationQuerySchema.extend({
  search: z.string().optional(),
  status: z.nativeEnum(LeadStatus).optional(),
  sellerId: z.string().optional(),
  source: z.string().optional(),
  sort: z.enum(['createdAt', 'updatedAt', 'name', '-createdAt', '-updatedAt', '-name']).optional(),
});

export type ListLeadsQueryDto = z.infer<typeof ListLeadsQuerySchema>;
