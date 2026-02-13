import { authClient } from './authClient';
import { setTokens } from '../storage/authStorage';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginSuccessResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface RefreshSuccessResponse {
  accessToken: string;
  expiresIn: number;
}

export async function login(
  credentials: LoginCredentials
): Promise<LoginSuccessResponse> {
  const { data } = await authClient.post<LoginSuccessResponse>(
    '/login',
    credentials
  );
  await setTokens(
    data.accessToken,
    data.refreshToken,
    data.expiresIn
  );
  return data;
}

