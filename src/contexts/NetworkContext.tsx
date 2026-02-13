import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import type { FormPayload } from '../api/submitForm';

type NetworkStatus = 'online' | 'offline';

type QueuedItem = {
  payload: FormPayload;
  resolve: () => void;
  reject: (err: unknown) => void;
};

interface NetworkContextValue {
  status: NetworkStatus;
  isOnline: boolean;
  toggleNetwork: () => void;
  queueRequest: (payload: FormPayload) => Promise<void>;
  flushQueue: (send: (payload: FormPayload) => Promise<unknown>) => Promise<void>;
  queueLength: number;
}

const NetworkContext = createContext<NetworkContextValue | null>(null);

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<NetworkStatus>('online');
  const queueRef = useRef<QueuedItem[]>([]);

  const toggleNetwork = useCallback(() => {
    setStatus(prev => (prev === 'online' ? 'offline' : 'online'));
  }, []);

  const [queueLength, setQueueLength] = useState(0);

  const queueRequest = useCallback((payload: FormPayload): Promise<void> => {
    return new Promise((resolve, reject) => {
      queueRef.current.push({ payload, resolve, reject });
      setQueueLength(q => q + 1);
    });
  }, []);

  const flushQueue = useCallback(
    async (send: (payload: FormPayload) => Promise<unknown>) => {
      const items = [...queueRef.current];
      queueRef.current = [];
      setQueueLength(0);
      for (const item of items) {
        try {
          await send(item.payload);
          item.resolve();
        } catch (err) {
          item.reject(err);
        }
      }
    },
    []
  );

  const value: NetworkContextValue = {
    status,
    isOnline: status === 'online',
    toggleNetwork,
    queueRequest,
    flushQueue,
    queueLength,
  };

  return (
    <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>
  );
}

export function useNetwork() {
  const ctx = useContext(NetworkContext);
  if (!ctx) throw new Error('useNetwork must be used within NetworkProvider');
  return ctx;
}
