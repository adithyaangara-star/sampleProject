import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { useNetwork } from '../contexts/NetworkContext';
import { submitForm, type FormPayload } from '../api/submitForm';

export type SubmitStatus = 'idle' | 'success' | 'error' | 'pending';

const FORM_STATUS_QUERY_KEY = ['formSubmitStatus'] as const;

export function useSubmitForm() {
  const queryClient = useQueryClient();
  const { data: statusData } = useQuery({
    queryKey: FORM_STATUS_QUERY_KEY,
    queryFn: () => 'idle' as SubmitStatus,
    initialData: 'idle' as SubmitStatus,
    staleTime: Infinity,
  });
  const { isOnline, queueRequest, flushQueue } = useNetwork();
  const hasFlushedOnOnline = useRef(false);

  const mutation = useMutation({
    mutationKey: ['submitFormMutation'],
    mutationFn: async ({
      payload,
      isRetry = false,
    }: {
      payload: FormPayload;
      isRetry?: boolean;
    }) => submitForm(payload, isRetry),
    onMutate: () => {
      queryClient.setQueryData(FORM_STATUS_QUERY_KEY, 'success');
    },
    onError: () => {
      queryClient.setQueryData(FORM_STATUS_QUERY_KEY, 'error');
    },
  });

  useEffect(() => {
    if (!isOnline) {
      hasFlushedOnOnline.current = false;
      return;
    }
    if (hasFlushedOnOnline.current) return;
    hasFlushedOnOnline.current = true;
    flushQueue(payload =>
      mutation.mutateAsync({ payload, isRetry: true })
    );
  }, [isOnline]);

  const submit = async (payload: FormPayload) => {
    if (!isOnline) {
      await queueRequest(payload);
      queryClient.setQueryData(FORM_STATUS_QUERY_KEY, 'success');
      return;
    }
    mutation.mutate({ payload, isRetry: false });
  };

  const displayStatus: SubmitStatus =
    mutation.isPending && isOnline ? 'pending' : statusData;

  return {
    submit,
    status: displayStatus,
    isPending: mutation.isPending,
    error: mutation.error,
    reset: () => {
      mutation.reset();
      queryClient.setQueryData(FORM_STATUS_QUERY_KEY, 'idle');
    },
  };
}
