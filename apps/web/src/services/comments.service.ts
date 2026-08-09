import type {
  CommentDto,
  CreateCommentDto,
  HttpResponse,
} from "@kikos/shared";
import { axiosApi } from "./api";
import type { PaginatedResult } from "./types";

export async function listDealComments(
  dealId: string
): Promise<PaginatedResult<CommentDto>> {
  const response = await axiosApi.get<HttpResponse<PaginatedResult<CommentDto>>>(
    `/deals/${dealId}/comments`
  );
  return response.data.data;
}

export async function createDealComment(
  dealId: string,
  data: CreateCommentDto
): Promise<CommentDto> {
  const response = await axiosApi.post<HttpResponse<CommentDto>>(
    `/deals/${dealId}/comments`,
    data
  );
  return response.data.data;
}

export async function deleteComment(id: string): Promise<{ id: string }> {
  const response = await axiosApi.delete<HttpResponse<{ id: string }>>(
    `/comments/${id}`
  );
  return response.data.data;
}
