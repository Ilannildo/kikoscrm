import { CommentDto } from '@kikos/shared';
import { Comment, User } from 'prisma/generated/client';

type CommentWithAuthor = Comment & { author?: Pick<User, 'name'> | null };

export function mapCommentToDto(comment: CommentWithAuthor): CommentDto {
  return {
    id: comment.id,
    content: comment.content,
    authorId: comment.authorId,
    authorName: comment.author?.name,
    leadId: comment.leadId,
    dealId: comment.dealId,
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
  };
}

export function mapCommentsToDto(comments: CommentWithAuthor[]): CommentDto[] {
  return comments.map(mapCommentToDto);
}
