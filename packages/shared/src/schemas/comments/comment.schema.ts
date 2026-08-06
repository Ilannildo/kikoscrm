import { z } from 'zod';
import { CrmPaginationQuerySchema } from '../common/crm-pagination.schema';

export const CommentSchema = z.object({
  id: z.string(),
  content: z.string(),
  authorId: z.string(),
  authorName: z.string().optional(),
  leadId: z.string().nullable(),
  dealId: z.string().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type CommentDto = z.infer<typeof CommentSchema>;

export const CreateCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Comentário não pode ser vazio')
    .max(2000, 'Comentário deve ter no máximo 2000 caracteres'),
});

export type CreateCommentDto = z.infer<typeof CreateCommentSchema>;

export const ListCommentsQuerySchema = CrmPaginationQuerySchema;

export type ListCommentsQueryDto = z.infer<typeof ListCommentsQuerySchema>;
