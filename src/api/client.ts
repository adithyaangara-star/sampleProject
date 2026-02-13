import axios, {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';

export const API_BASE = 'https://jsonplaceholder.typicode.com';

export interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const client = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Add Retry-Header to any request that is a retry (after a failed attempt)
client.interceptors.request.use((config: CustomAxiosRequestConfig) => {
  if (config._retry === true) {
    config.headers.set('Retry-Header', 'true');
  }
  return config;
});

// On failure, we don't modify the outgoing request; retries are done by the caller
// with _retry: true so the next request gets Retry-Header
client.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

export function getClient() {
  return client;
}

export function createRetryConfig<T = unknown>(
  config?: AxiosRequestConfig<T>
): AxiosRequestConfig<T> & { _retry?: boolean } {
  return { ...config, _retry: true };
}

export default client;
