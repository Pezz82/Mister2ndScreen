// src/hooks/useMisterStatus.ts

import { useState, useEffect, useCallback, useRef } from 'react';

export interface MisterStatus {
  coreRunning: string | null;
  gameRunning: string | null;
  system:      string | null;
  filename:    string | null;
  connected:   boolean;
  error:       string | null;
}

export interface MisterStatusOptions {
  host?:         string;
  port?:         string;
  apiBase?:      string;
  pollInterval?: number;  // milliseconds
}

/**
 * Hook to poll a MiSTer’s Remote REST API for the currently running core and game.
 */
export const useMisterStatus = (options?: MisterStatusOptions) => {
  const host         = options?.host    || import.meta.env.VITE_MISTER_HOST   || '192.168.0.135';
  const port         = options?.port    || import.meta.env.VITE_MISTER_PORT   || '8182';
  const apiBase      = options?.apiBase || import.meta.env.VITE_MISTER_API_BASE || '/api';
  const pollInterval = options?.pollInterval ?? 2000;

  const [status, setStatus] = useState<MisterStatus>({
    coreRunning: null,
    gameRunning: null,
    system:      null,
    filename:    null,
    connected:   false,
    error:       null
  });

  const intervalRef = useRef<number>();

  const fetchStatus = useCallback(async () => {
    try {
      const url = `http://${host}:${port}${apiBase}/games/playing`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();

      // Debug: inspect raw payload in console if needed
     console.log('MiSTer /games/playing response:', data);

      // Friendly game title comes from `gameName` field
      const title = data.gameName || '';

      setStatus({
        coreRunning: data.core   || null,
        system:      data.system || null,
        filename:    data.game   || null,
        gameRunning: title       || null,
        connected:   true,
        error:       null
      });
    } catch (err) {
      setStatus(prev => ({
        ...prev,
        connected: false,
        error:     err instanceof Error ? err.message : String(err)
      }));
    }
  }, [host, port, apiBase]);

  useEffect(() => {
    // Initial fetch
    fetchStatus();

    // Set up polling
    intervalRef.current = window.setInterval(fetchStatus, pollInterval);

    // Clean up on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchStatus, pollInterval]);

  // Manual refresh function
  const refresh = useCallback(() => {
    fetchStatus();
  }, [fetchStatus]);

  return {
    ...status,
    refresh
  };
};

export default useMisterStatus;
