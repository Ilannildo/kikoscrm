import axios from "axios";
import { env } from "@/env.js";
import { auth } from "@/server/auth";

export const defaultAxiosConfig = {
  baseURL: env.NEXT_PUBLIC_API_URL,
  timeout: 1000 * 60 * 3,
  headers: { "Content-Type": "application/json" },
};

export const axiosApi = axios.create(defaultAxiosConfig);

axiosApi.interceptors.request.use(async (config) => {
  const session = await auth();  
  const accessToken = session?.user?.accessToken;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});
