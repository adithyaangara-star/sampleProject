import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  clearAuth,
} from '../storage/authStorage';

const BASE_URL = 'https://samplelogin.free.beeceptor.com';

export const authClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

type ConfigWithRetry = InternalAxiosRequestConfig & { _retry?: boolean };

let forceLogoutCallback: (() => void) | null = null;
export function setAuthForceLogoutCallback(cb: () => void) {
  forceLogoutCallback = cb;
}

let refreshPromise: Promise<string | null> | null = null;

async function doRefresh(): Promise<string | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;
  try {
    const { data } = await axios.post<{
      accessToken: string;
      expiresIn: number;
    }>(`${BASE_URL}/refresh`, { refreshToken }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000,
    });
    await setAccessToken(data.accessToken, data.expiresIn);
    return data.accessToken;
  } catch {
    return null;
  }
}

function isAuthRequest(config: InternalAxiosRequestConfig): boolean {
  const url = config.url ?? '';
  return url.includes('/login') || url.includes('/refresh');
}

function logRequest(config: InternalAxiosRequestConfig) {
  const fullUrl = `${config.baseURL ?? ''}${config.url ?? ''}`;
  const rawHeaders = config.headers ?? {};
  const headers =
    typeof (rawHeaders as { toJSON?: () => Record<string, unknown> }).toJSON === 'function'
      ? (rawHeaders as { toJSON: () => Record<string, unknown> }).toJSON()
      : typeof rawHeaders === 'object' && rawHeaders !== null
        ? { ...(rawHeaders as Record<string, unknown>) }
        : {};
  console.log('[API Request]', {
    method: config.method?.toUpperCase(),
    url: fullUrl,
    headers,
    body: config.data,
  });
}

authClient.interceptors.request.use(
  async (config: ConfigWithRetry) => {
    if (isAuthRequest(config)) return config;
    const token = await getAccessToken();
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  },
  err => Promise.reject(err)
);

authClient.interceptors.request.use(
  config => {
    logRequest(config);
    return config;
  },
  err => Promise.reject(err)
);

authClient.interceptors.response.use(
  response => {
    const fullUrl = `${response.config.baseURL ?? ''}${response.config.url ?? ''}`;
    console.log('[API Response]', {
      url: fullUrl,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  async (error: AxiosError) => {
    const url = error.config
      ? `${error.config.baseURL ?? ''}${error.config.url ?? ''}`
      : 'unknown';
    console.log('[API Error]', {
      url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    const originalRequest = error.config as ConfigWithRetry | undefined;
    if (error.response?.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }
    if (isAuthRequest(originalRequest)) {
      return Promise.reject(error);
    }
    if (originalRequest._retry) {
      await clearAuth();
      forceLogoutCallback?.();
      return Promise.reject(error);
    }
    originalRequest._retry = true;

    if (!refreshPromise) {
      refreshPromise = doRefresh().finally(() => {
        refreshPromise = null;
      });
    }
    const newToken = await refreshPromise;
    if (!newToken) {
      await clearAuth();
      forceLogoutCallback?.();
      return Promise.reject(error);
    }
    originalRequest.headers.set('Authorization', `Bearer ${newToken}`);
    return authClient(originalRequest);
  }
);
