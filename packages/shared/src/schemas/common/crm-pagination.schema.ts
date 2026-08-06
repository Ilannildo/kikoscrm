import { z } from 'zod';

export const CrmPaginationQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1).describe('Página atual'),
  pageSize: z.coerce
    .number()
    .min(1)
    .max(100)
    .default(20)
    .describe('Itens por página'),
});

export type CrmPaginationQueryDto = z.infer<typeof CrmPaginationQuerySchema>;

export const PaginationMetaSchema = z.object({
  page: z.number(),
  pageSize: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

export type PaginationMetaDto = z.infer<typeof PaginationMetaSchema>;

export function createPaginatedResponseSchema<T extends z.ZodType>(itemSchema: T) {
  return z.object({
    data: z.array(itemSchema),
    pagination: PaginationMetaSchema,
  });
}
