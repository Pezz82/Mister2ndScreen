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
 * Hook to connect to MiSTer FPGA via WebSocket and REST API
 * Detects currently running core and game
 */
export const useMisterStatus = (options?: MisterStatusOptions) => {
  const host = options?.host || import.meta.env.VITE_MISTER_HOST || '192.168.1.42';
  const reconnectInterval = options?.reconnectInterval || 5000;
  const restFallbackTimeout = options?.restFallbackTimeout || 3000;
  
  const [status, setStatus] = useState<MisterStatus>({
    coreRunning: null,
    gameRunning: null,
    system: null,
    filename: null,
    connected: false,
    error: null
  });
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const restFallbackTimeoutRef = useRef<number | null>(null);
  
  // Parse WebSocket messages
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const data = event.data;
      
      // Handle coreRunning message
      if (data.startsWith('coreRunning:')) {
        const coreName = data.substring('coreRunning:'.length).trim();
        setStatus(prev => ({ 
          ...prev, 
          coreRunning: coreName,
          error: null
        }));
      }
      
      // Handle gameRunning message
      else if (data.startsWith('gameRunning:')) {
        const gameInfo = data.substring('gameRunning:'.length).trim();
        const [system, filename] = gameInfo.split('/');
        
        setStatus(prev => ({ 
          ...prev, 
          gameRunning: gameInfo,
          system: system,
          filename: filename,
          error: null
        }));
      }
    } catch (err) {
      console.error('Error parsing WebSocket message:', err);
      setStatus(prev => ({ 
        ...prev, 
        error: `Error parsing message: ${err instanceof Error ? err.message : String(err)}`
      }));
    }
  }, []);
  
  // Fetch current status via REST API as fallback
  const fetchStatusViaREST = useCallback(async () => {
    try {
      const response = await fetch(`http://${host}:8182/api/games/playing`);
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      const data = await response.json();
      
      setStatus(prev => ({
        ...prev,
        coreRunning: data.core || null,
        gameRunning: data.game ? `${data.system}/${data.game}` : null,
        system: data.system || null,
        filename: data.game || null,
        error: null
      }));
    } catch (err) {
      console.error('REST fallback failed:', err);
      setStatus(prev => ({ 
        ...prev, 
        error: `REST fallback failed: ${err instanceof Error ? err.message : String(err)}`
      }));
    }
  }, [host]);
  
  // Connect to WebSocket
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }
    
    try {
      const ws = new WebSocket(`ws://${host}:8182/ws`);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setStatus(prev => ({ ...prev, connected: true, error: null }));
        
        // Clear any pending reconnect timeout
        if (reconnectTimeoutRef.current !== null) {
          window.clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };
      
      ws.onmessage = handleMessage;
      
      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setStatus(prev => ({ ...prev, connected: false }));
        
        // Schedule reconnect
        if (reconnectTimeoutRef.current === null) {
          reconnectTimeoutRef.current = window.setTimeout(() => {
            reconnectTimeoutRef.current = null;
            connectWebSocket();
          }, reconnectInterval);
        }
        
        // Try REST fallback
        if (restFallbackTimeoutRef.current === null) {
          restFallbackTimeoutRef.current = window.setTimeout(() => {
            restFallbackTimeoutRef.current = null;
            fetchStatusViaREST();
          }, restFallbackTimeout);
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setStatus(prev => ({ 
          ...prev, 
          error: 'WebSocket connection error'
        }));
        
        ws.close();
      };
      
      wsRef.current = ws;
    } catch (err) {
      console.error('Failed to create WebSocket:', err);
      setStatus(prev => ({ 
        ...prev, 
        connected: false,
        error: `Failed to create WebSocket: ${err instanceof Error ? err.message : String(err)}`
      }));
      
      // Try REST fallback
      fetchStatusViaREST();
      
      // Schedule reconnect
      if (reconnectTimeoutRef.current === null) {
        reconnectTimeoutRef.current = window.setTimeout(() => {
          reconnectTimeoutRef.current = null;
          connectWebSocket();
        }, reconnectInterval);
      }
    }
  }, [host, handleMessage, fetchStatusViaREST, reconnectInterval, restFallbackTimeout]);
  
  // Initialize connection
  useEffect(() => {
    connectWebSocket();
    
    // Cleanup function
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      
      if (reconnectTimeoutRef.current !== null) {
        window.clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      if (restFallbackTimeoutRef.current !== null) {
        window.clearTimeout(restFallbackTimeoutRef.current);
        restFallbackTimeoutRef.current = null;
      }
    };
  }, [connectWebSocket]);
  
  // Manual reconnect function
  const reconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    connectWebSocket();
  }, [connectWebSocket]);
  
  // Manual REST fallback function
  const refreshStatus = useCallback(() => {
    fetchStatusViaREST();
  }, [fetchStatusViaREST]);
  
  return {
    ...status,
    reconnect,
    refreshStatus
  };
};

export default useMisterStatus;

