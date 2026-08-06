import axios from 'axios';
import { headers } from 'next/headers';
import qs from 'qs';
import { env } from '@/env.mjs';
import { getClientIp } from '@/lib/get-client-ip';

export const axiosAuthApi = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  timeout: 1000 * 60 * 3,
  headers: { 'Content-Type': 'application/json' },
});

export const axiosApi = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  timeout: 1000 * 60 * 3,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  paramsSerializer: (params) => {
    return qs.stringify(params, {
      arrayFormat: 'repeat',
    });
  },
});

axiosApi.interceptors.request.use(async (config) => {
  const clientIp = await getClientIp();

  let cookie = '';
  try {
    const h = await headers();
    cookie = h.get('cookie') ?? '';
  } catch {

  }

  config.headers = config.headers ?? {};

  if (clientIp) {
    (config.headers as any)['x-client-ip'] = clientIp;
  }

  if (cookie) {
    (config.headers as any).cookie = cookie;
  }

  return config;
});
