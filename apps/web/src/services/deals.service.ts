import type {
  CreateDealDto,
  DealDto,
  DealStatus,
  HttpResponse,
  ListDealsQueryDto,
} from "@kikos/shared";
import { axiosApi } from "./api";
import type { PaginatedResult } from "./types";
import { UpdateDealRequestDto } from "@/common/schemas/update-deal-request.schema";

export async function listDeals(
  params: ListDealsQueryDto
): Promise<PaginatedResult<DealDto>> {
  const response = await axiosApi.get<HttpResponse<PaginatedResult<DealDto>>>(
    "/deals",
    { params }
  );
  return response.data.data;
}

export async function getDeal(id: string): Promise<DealDto> {
  const response = await axiosApi.get<HttpResponse<DealDto>>(`/deals/${id}`);
  return response.data.data;
}

export async function createDeal(data: CreateDealDto): Promise<DealDto> {
  const response = await axiosApi.post<HttpResponse<DealDto>>("/deals", data);
  return response.data.data;
}

export async function updateDeal(
  { data, dealId }: UpdateDealRequestDto
): Promise<DealDto> {
  const response = await axiosApi.patch<HttpResponse<DealDto>>(
    `/deals/${dealId}`,
    data
  );
  return response.data.data;
}

export async function updateDealStatus(
  id: string,
  status: DealStatus
): Promise<DealDto> {
  const response = await axiosApi.patch<HttpResponse<DealDto>>(
    `/deals/${id}/status`,
    { status }
  );
  return response.data.data;
}

export async function deleteDeal(id: string): Promise<{ id: string }> {
  const response = await axiosApi.delete<HttpResponse<{ id: string }>>(
    `/deals/${id}`
  );
  return response.data.data;
}
