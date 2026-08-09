import type {
  HttpResponse,
  ListSellersQueryDto,
  SellerDto,
} from "@kikos/shared";
import { axiosApi } from "./api";
import type { PaginatedResult } from "./types";

export async function listSellers(
  params: ListSellersQueryDto
): Promise<PaginatedResult<SellerDto>> {
  const response = await axiosApi.get<HttpResponse<PaginatedResult<SellerDto>>>(
    "/sellers",
    { params }
  );
  return response.data.data;
}

export async function getSeller(id: string): Promise<SellerDto> {
  const response = await axiosApi.get<HttpResponse<SellerDto>>(`/sellers/${id}`);
  return response.data.data;
}
