import { useState, useEffect, useCallback, useRef } from 'react';

export interface MisterStatus {
  coreRunning: string | null;
  gameRunning: string | null;
  system: string | null;
  filename: string | null;
  connected: boolean;
  error: string | null;
}

export interface MisterStatusOptions {
  host?: string;
  port?: string;
  apiBase?: string;
  pollInterval?: number;
}

export const useMisterStatus = (options?: MisterStatusOptions) => {
  const host         = options?.host         || import.meta.env.VITE_MISTER_HOST   || '192.168.0.135';
  const port         = options?.port         || import.meta.env.VITE_MISTER_PORT   || '8182';
  const apiBase      = options?.apiBase      || import.meta.env.VITE_MISTER_API_BASE || '/api';
  const pollInterval = options?.pollInterval ?? 2000;  // milliseconds

  const [status, setStatus] = useState<MisterStatus>({
    coreRunning: null,
    gameRunning: null,
    system: null,
    filename: null,
    connected: false,
    error: null
  });

  const intervalRef = useRef<number>();

  const fetchStatus = useCallback(async () => {
    try {
      const url = `http://${host}:${port}${apiBase}/games/playing`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // Parse friendly title
      const rawGame = data.game || '';
      const title = rawGame
        .replace(/\.[^/.]+$/, '')   // strip extension
        .replace(/_/g, ' ')         // underscores → spaces
        .trim();

      setStatus({
        coreRunning: data.core || null,
        system:      data.system || null,
        filename:    rawGame,
        gameRunning: title || null,
        connected:   true,
        error:       null
      });
    } catch (err) {
      setStatus(s => ({
        ...s,
        connected: false,
        error:     err instanceof Error ? err.message : String(err)
      }));
    }
  }, [host, port, apiBase]);

  useEffect(() => {
    // initial fetch
    fetchStatus();

    // set up polling
    intervalRef.current = window.setInterval(fetchStatus, pollInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchStatus, pollInterval]);

  // manual refresh
  const refresh = useCallback(() => {
    fetchStatus();
  }, [fetchStatus]);

  return {
    ...status,
    refresh
  };
};

export default useMisterStatus;
