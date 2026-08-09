import type { CreateUserDto, HttpResponse, UserDto } from "@kikos/shared";
import { axiosApi } from "./api";

/**
 * This TypeScript function makes an asynchronous request to fetch user data from the "/users/me"
 * endpoint using axiosApi.
 * @returns The `me` function is returning the data object from the response of the API call to
 * "/auth/me".
 */
export async function me(): Promise<UserDto> {
  const response = await axiosApi.get<HttpResponse<UserDto>>("/users/me");
  return response.data.data;
}

/**
 * Cria um novo usuário/vendedor via `POST /users` (admin only).
 * Vendedores são usuários com `role: seller`.
 */
export async function createUser(data: CreateUserDto): Promise<UserDto> {
  const response = await axiosApi.post<HttpResponse<UserDto>>("/users", data);
  return response.data.data;
}
