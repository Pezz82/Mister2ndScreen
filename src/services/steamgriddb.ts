import { useCallback, useState } from 'react';

interface SteamGridDBOptions {
  apiKey?: string;
}

interface GameArt {
  boxart?: string;
  screenshot?: string;
  title?: string;
  error?: string;
  source?: 'steamgriddb' | 'none';
}

/**
 * Service to fetch game artwork from SteamGridDB
 */
export const useSteamGridDB = (options?: SteamGridDBOptions) => {
  const [artCache, setArtCache] = useState<Record<string, GameArt>>({});
  
  /**
   * Fetch game art from SteamGridDB
   */
  const fetchGameArt = useCallback(async (gameName: string): Promise<GameArt> => {
    try {
      // In a production app, you would use a real API key
      // For this demo, we'll simulate the API response
      console.log(`Searching SteamGridDB for: ${gameName}`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // For demo purposes, return a placeholder error
      // In a real implementation, you would make actual API calls to SteamGridDB
      return { 
        error: 'SteamGridDB integration requires an API key',
        source: 'none'
      };
      
      /* Real implementation would look like:
      const apiKey = options?.apiKey || 'your-api-key';
      
      // Search for game
      const searchResponse = await fetch(
        `https://www.steamgriddb.com/api/v2/search/autocomplete/${encodeURIComponent(gameName)}`, 
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`
          }
        }
      );
      
      if (!searchResponse.ok) {
        throw new Error(`HTTP error ${searchResponse.status}`);
      }
      
      const searchData = await searchResponse.json();
      
      if (!searchData.success || !searchData.data || searchData.data.length === 0) {
        throw new Error('Game not found');
      }
      
      const gameId = searchData.data[0].id;
      
      // Fetch grid images
      const gridResponse = await fetch(
        `https://www.steamgriddb.com/api/v2/grids/game/${gameId}`, 
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`
          }
        }
      );
      
      if (!gridResponse.ok) {
        throw new Error(`HTTP error ${gridResponse.status}`);
      }
      
      const gridData = await gridResponse.json();
      
      if (!gridData.success || !gridData.data || gridData.data.length === 0) {
        throw new Error('No grid images found');
      }
      
      return {
        boxart: gridData.data[0].url,
        title: searchData.data[0].name,
        source: 'steamgriddb'
      };
      */
    } catch (err) {
      console.error('SteamGridDB error:', err);
      return { 
        error: `SteamGridDB error: ${err instanceof Error ? err.message : String(err)}`,
        source: 'none'
      };
    }
  }, [options]);
  
  /**
   * Get game art with caching
   */
  const getGameArt = useCallback(async (gameName: string): Promise<GameArt> => {
    // Check cache first
    if (artCache[gameName]) {
      return artCache[gameName];
    }
    
    const result = await fetchGameArt(gameName);
    
    // Cache the result
    setArtCache(prev => ({
      ...prev,
      [gameName]: result
    }));
    
    return result;
  }, [artCache, fetchGameArt]);
  
  /**
   * Clear the art cache
   */
  const clearCache = useCallback(() => {
    setArtCache({});
  }, []);
  
  return {
    getGameArt,
    clearCache
  };
};

export default useSteamGridDB;
