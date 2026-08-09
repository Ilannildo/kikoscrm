import type { CreateLeadDto, HttpResponse, LeadDto, ListLeadsQueryDto } from "@kikos/shared";
import { axiosApi } from "./api";
import type { PaginatedResult } from "./types";

export async function listLeads(
  params: ListLeadsQueryDto
): Promise<PaginatedResult<LeadDto>> {
const response = await axiosApi.get<HttpResponse<PaginatedResult<LeadDto>>>(
    "/leads",
    { params }
  );
  return response.data.data;
}

export async function getLead(id: string): Promise<LeadDto> {
  const response = await axiosApi.get<HttpResponse<LeadDto>>(`/leads/${id}`);
  return response.data.data;
}

export async function createLead(data: CreateLeadDto): Promise<LeadDto> {
  const response = await axiosApi.post<HttpResponse<LeadDto>>("/leads", data);
  return response.data.data;
}

export async function updateLead(
  id: string,
  data: Partial<CreateLeadDto>
): Promise<LeadDto> {
  const response = await axiosApi.patch<HttpResponse<LeadDto>>(
    `/leads/${id}`,
    data
  );
  return response.data.data;
}

export async function deleteLead(id: string): Promise<{ id: string }> {
  const response = await axiosApi.delete<HttpResponse<{ id: string }>>(
    `/leads/${id}`
  );
  return response.data.data;
}
