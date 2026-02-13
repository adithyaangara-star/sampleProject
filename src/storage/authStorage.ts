import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  ACCESS_TOKEN: '@auth/accessToken',
  REFRESH_TOKEN: '@auth/refreshToken',
  ACCESS_TOKEN_EXPIRY_AT: '@auth/accessTokenExpiryAt',
} as const;

/** expiresIn from API is in seconds; returns expiry as timestamp (ms) */
export function computeExpiryTimestamp(expiresInSeconds: number): number {
  return Date.now() + expiresInSeconds * 1000;
}

export async function getAccessToken(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.ACCESS_TOKEN);
}

export async function getRefreshToken(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.REFRESH_TOKEN);
}

export async function getAccessTokenExpiryAt(): Promise<number | null> {
  const raw = await AsyncStorage.getItem(KEYS.ACCESS_TOKEN_EXPIRY_AT);
  return raw != null ? Number(raw) : null;
}

export async function setTokens(
  accessToken: string,
  refreshToken: string | null,
  expiresInSeconds: number
): Promise<void> {
  const expiryAt = computeExpiryTimestamp(expiresInSeconds);
  await AsyncStorage.multiSet([
    [KEYS.ACCESS_TOKEN, accessToken],
    [KEYS.ACCESS_TOKEN_EXPIRY_AT, String(expiryAt)],
    ...(refreshToken != null ? [[KEYS.REFRESH_TOKEN, refreshToken]] : []),
  ]);
}

export async function setAccessToken(
  accessToken: string,
  expiresInSeconds: number
): Promise<void> {
  const expiryAt = computeExpiryTimestamp(expiresInSeconds);
  await AsyncStorage.multiSet([
    [KEYS.ACCESS_TOKEN, accessToken],
    [KEYS.ACCESS_TOKEN_EXPIRY_AT, String(expiryAt)],
  ]);
}

export async function clearAuth(): Promise<void> {
  await AsyncStorage.multiRemove([
    KEYS.ACCESS_TOKEN,
    KEYS.REFRESH_TOKEN,
    KEYS.ACCESS_TOKEN_EXPIRY_AT,
  ]);
}

/** Returns true if we have tokens and access token is not yet expired (with 30s buffer). */
export async function hasValidStoredAuth(): Promise<boolean> {
  const [token, expiryAt] = await Promise.all([
    getAccessToken(),
    getAccessTokenExpiryAt(),
  ]);
  if (!token || expiryAt == null) return false;
  const bufferMs = 30 * 1000;
  return Date.now() < expiryAt - bufferMs;
}

/** Returns true if we have any stored refresh token (for offline expiry we only have access expiry). */
export async function hasStoredAuth(): Promise<boolean> {
  const token = await getAccessToken();
  return token != null && token.length > 0;
}
