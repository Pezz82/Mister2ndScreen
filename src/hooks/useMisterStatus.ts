import { useState, useEffect, useRef, useCallback } from 'react';

interface MisterStatus {
  coreRunning: string | null;
  gameRunning: string | null;
  system: string | null;
  filename: string | null;
  connected: boolean;
  error: string | null;
}

interface MisterStatusOptions {
  host?: string;
  pollInterval?: number;  // in ms
}

export const useMisterStatus = (options?: MisterStatusOptions) => {
  const host         = options?.host || import.meta.env.VITE_MISTER_HOST || '192.168.0.135';
  const port         = import.meta.env.VITE_MISTER_PORT || '8182';
  const apiBase      = import.meta.env.VITE_MISTER_API_BASE || '/api';
  const pollInterval = options?.pollInterval ?? 2000; // 2 seconds

  const [status, setStatus] = useState<MisterStatus>({
    coreRunning: null,
    gameRunning: null,
    system: null,
    filename: null,
    connected: false,
    error: null
  });

  const poller = useRef<number | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`http://${host}:${port}${apiBase}/games/playing`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setStatus({
        coreRunning: data.core   || null,
        system:      data.system || null,
        filename:    data.game   || null,
        gameRunning: data.game ? `${data.system}/${data.game}` : null,
        connected:   true,
        error:       null
      });
    } catch (err) {
      setStatus(s => ({
        ...s,
        connected: false,
        error:     (err as Error).message
      }));
    }
  }, [host, port, apiBase]);

  useEffect(() => {
    // Initial fetch
    fetchStatus();
    // Set up polling
    poller.current = window.setInterval(fetchStatus, pollInterval);

    return () => {
      if (poller.current !== null) {
        clearInterval(poller.current);
        poller.current = null;
      }
    };
  }, [fetchStatus, pollInterval]);

  // Expose manual refresh too
  const refresh = useCallback(() => {
    fetchStatus();
  }, [fetchStatus]);

  return { ...status, refresh };
};

export default useMisterStatus;
