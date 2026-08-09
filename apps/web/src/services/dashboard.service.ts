import type { DashboardDto, DashboardQueryDto, HttpResponse } from "@kikos/shared";
import { axiosApi } from "./api";

export async function getDashboard(
  params: DashboardQueryDto
): Promise<DashboardDto> {
  const response = await axiosApi.get<HttpResponse<DashboardDto>>(
    "/dashboard",
    { params }
  );
  return response.data.data;
}
