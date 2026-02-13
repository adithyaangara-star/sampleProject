import { getClient, createRetryConfig } from './client';

export interface FormPayload {
  name: string;
  email: string;
}

export interface SubmitFormResponse {
  success: boolean;
  message: string;
  id?: string;
  submittedAt: string;
}

/**
 * Sample form submit. Uses JSONPlaceholder POST endpoint for demo.
 * In a real app you'd replace this with your API.
 * When isRetry is true, the axios client will attach Retry-Header.
 */
export async function submitForm(
  payload: FormPayload,
  isRetry = false
): Promise<SubmitFormResponse> {
  const client = getClient();
  const config = isRetry ? createRetryConfig() : undefined;

  const { data } = await client.post<SubmitFormResponse>(
    '/posts',
    {
      title: payload.name,
      body: payload.email,
      userId: 1,
    },
    config
  );

  return {
    success: true,
    message: 'Success',
    id: String((data as { id?: number })?.id ?? Date.now()),
    submittedAt: new Date().toISOString(),
  };
}
