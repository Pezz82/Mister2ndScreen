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
  reconnectInterval?: number;
  restFallbackTimeout?: number;
}

/**
 * Hook to connect to MiSTer Remote and detect which core/game is running.
 */
export const useMisterStatus = (options?: MisterStatusOptions) => {
  const host = options?.host || import.meta.env.VITE_MISTER_HOST || '192.168.0.135';
  const port = import.meta.env.VITE_MISTER_PORT || '8182';
  const apiBase = import.meta.env.VITE_MISTER_API_BASE || '/api';
  const reconnectInterval = options?.reconnectInterval ?? 5000;
  const restFallbackTimeout = options?.restFallbackTimeout ?? 3000;

  const [status, setStatus] = useState<MisterStatus>({
    coreRunning: null,
    gameRunning: null,
    system: null,
    filename: null,
    connected: false,
    error: null
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<number | null>(null);
  const restRef = useRef<number | null>(null);

  const handleMessage = useCallback((ev: MessageEvent) => {
    const msg = ev.data as string;
    if (msg.startsWith('coreRunning:')) {
      setStatus(s => ({ ...s, coreRunning: msg.slice(12).trim(), error: null }));
    } else if (msg.startsWith('gameRunning:')) {
      const info = msg.slice(12).trim();
      const [system, filename] = info.split('/');
      setStatus(s => ({
        ...s,
        gameRunning: info,
        system,
        filename,
        error: null
      }));
    }
  }, []);

  const fetchREST = useCallback(async () => {
    try {
      const res = await fetch(`http://${host}:${port}${apiBase}/games/playing`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setStatus(s => ({
        ...s,
        coreRunning: data.core || null,
        gameRunning: data.game ? `${data.system}/${data.game}` : null,
        system: data.system || null,
        filename: data.game || null,
        error: null
      }));
    } catch (err) {
      setStatus(s => ({ ...s, error: `REST fallback error: ${err}` }));
    }
  }, [host, port, apiBase]);

  const connectWS = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket(`ws://${host}:${port}/ws`);  // correct port/path :contentReference[oaicite:0]{index=0} 
      ws.onopen = () => {
        setStatus(s => ({ ...s, connected: true, error: null }));
        if (reconnectRef.current) clearTimeout(reconnectRef.current);
      };
      ws.onmessage = handleMessage;
      ws.onclose = () => {
        setStatus(s => ({ ...s, connected: false }));
        reconnectRef.current = window.setTimeout(connectWS, reconnectInterval);
        restRef.current = window.setTimeout(fetchREST, restFallbackTimeout);
      };
      ws.onerror = () => {
        ws.close();
        setStatus(s => ({ ...s, error: 'WebSocket error' }));
      };
      wsRef.current = ws;
    } catch (err) {
      setStatus(s => ({ ...s, connected: false, error: `WS init failed: ${err}` }));
      reconnectRef.current = window.setTimeout(connectWS, reconnectInterval);
      restRef.current = window.setTimeout(fetchREST, restFallbackTimeout);
    }
  }, [host, port, handleMessage, reconnectInterval, fetchREST, restFallbackTimeout]);

  useEffect(() => {
    connectWS();
    return () => {
      wsRef.current?.close();
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      if (restRef.current) clearTimeout(restRef.current);
    };
  }, [connectWS]);

  return {
    ...status,
    reconnect: connectWS,
    refresh: fetchREST
  };
};

export default useMisterStatus;
