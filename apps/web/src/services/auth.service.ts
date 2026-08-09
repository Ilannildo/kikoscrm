import type {
  HttpResponse,
  ISignInRequest,
  ISignInResponse,
  ISignUpRequest,
} from "@kikos/shared";
import { axiosApi } from "./api";

export async function signIn(
  data: ISignInRequest
): Promise<ISignInResponse | undefined> {
  const response = await axiosApi.post<HttpResponse<ISignInResponse>>(
    "/auth/sign-in",
    data
  );
  return response.data.data;
}

export async function signUp(
  data: ISignUpRequest
): Promise<ISignInResponse | undefined> {
  const response = await axiosApi.post<HttpResponse<ISignInResponse>>(
    "/auth/sign-up",
    data
  );
  return response.data.data;
}
