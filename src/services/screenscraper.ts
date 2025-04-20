import { useCallback, useState } from 'react';

interface ArtProviderOptions {
  ssDevId?: string;
  ssDevPass?: string;
  ssSoftName?: string;
  ssUser?: string;
  ssUserPass?: string;
  maxConcurrentRequests?: number;
  backoffTime?: number;
}

interface GameArt {
  boxart?: string;
  screenshot?: string;
  title?: string;
  error?: string;
  source?: 'screenscraper' | 'steamgriddb' | 'none';
}

/**
 * Helper function to create ScreenScraper API URL with authentication parameters
 */
export const ssFetch = (endpoint: string, params: Record<string, string>) => {
  const devid = import.meta.env.VITE_SS_DEVID;
  const devpassword = import.meta.env.VITE_SS_DEVPASS;
  const softname = import.meta.env.VITE_SS_SOFTNAME;
  const ssid = import.meta.env.VITE_SS_USER || '';
  const sspassword = import.meta.env.VITE_SS_USERPASS || '';

  return fetch('https://api.screenscraper.fr/api2/' + endpoint + '?' +
    new URLSearchParams({
      devid,
      devpassword,
      softname,
      ssid,
      sspassword,
      output: 'json',
      ...params
    }));
};

/**
 * Service to fetch game artwork from ScreenScraper with SteamGridDB fallback
 */
export const useArtProvider = (options?: ArtProviderOptions) => {
  const [artCache, setArtCache] = useState<Record<string, GameArt>>({});
  const [pendingRequests, setPendingRequests] = useState<Set<string>>(new Set());
  const [isThrottled, setIsThrottled] = useState(false);
  
  const maxConcurrentRequests = options?.maxConcurrentRequests || 2;
  const backoffTime = options?.backoffTime || 60000; // 60 seconds
  
  /**
   * Fetch game art from ScreenScraper
   */
  const fetchFromScreenScraper = useCallback(async (system: string, romName: string): Promise<GameArt> => {
    try {
      // Check if we're already at max concurrent requests
      if (pendingRequests.size >= maxConcurrentRequests) {
        return { error: 'Too many concurrent requests', source: 'none' };
      }
      
      // Check if we're in backoff period
      if (isThrottled) {
        return { error: 'Rate limited, in backoff period', source: 'none' };
      }
      
      // Add to pending requests
      const requestKey = `${system}/${romName}`;
      setPendingRequests(prev => new Set(prev).add(requestKey));
      
      // Map MiSTer system name to ScreenScraper system ID
      // This is a simplified mapping, would need to be expanded for all systems
      const systemMapping: Record<string, string> = {
        'SNES': '3',
        'NES': '7',
        'Genesis': '1',
        'MegaDrive': '1',
        'GBA': '12',
        'GB': '9',
        'GBC': '10',
        'PSX': '57',
        'N64': '14',
        'Arcade': '75',
        'NeoGeo': '142'
      };
      
      const systemId = systemMapping[system] || '75'; // Default to Arcade if unknown
      
      // Clean up ROM filename (remove extension, etc.)
      const cleanRomName = romName.replace(/\.[^/.]+$/, '');
      
      // Make the API request
      const response = await ssFetch('jeuInfos.php', {
        systemeid: systemId,
        romnom: cleanRomName,
        romtaille: '0',
        romcrc: '',
        rommd5: '',
        romsha1: ''
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check for error response
      if (data.error) {
        // Check for thread limit error
        if (data.error.includes('threads open')) {
          setIsThrottled(true);
          setTimeout(() => setIsThrottled(false), backoffTime);
          return { error: 'Thread limit reached, backing off', source: 'none' };
        }
        throw new Error(data.error);
      }
      
      // Extract media URLs
      const game = data.response?.jeu;
      if (!game) {
        throw new Error('Game not found');
      }
      
      const result: GameArt = { source: 'screenscraper' };
      
      // Extract box art
      const boxartMedia = game.medias?.find((media: any) => 
        media.type === 'box-2D' || media.type === 'box-3D' || media.type === 'screenmarquee'
      );
      
      if (boxartMedia) {
        result.boxart = boxartMedia.url;
      }
      
      // Extract screenshot
      const screenshotMedia = game.medias?.find((media: any) => 
        media.type === 'ss' || media.type === 'sstitle'
      );
      
      if (screenshotMedia) {
        result.screenshot = screenshotMedia.url;
      }
      
      // Extract title
      if (game.noms) {
        const nameEntry = game.noms.find((nom: any) => nom.region === 'us' || nom.region === 'wor');
        if (nameEntry) {
          result.title = nameEntry.text;
        } else if (game.noms.length > 0) {
          result.title = game.noms[0].text;
        }
      }
      
      return result;
    } catch (err) {
      console.error('ScreenScraper error:', err);
      return { 
        error: `ScreenScraper error: ${err instanceof Error ? err.message : String(err)}`,
        source: 'none'
      };
    } finally {
      // Remove from pending requests
      const requestKey = `${system}/${romName}`;
      setPendingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestKey);
        return newSet;
      });
    }
  }, [pendingRequests, isThrottled, maxConcurrentRequests, backoffTime]);
  
  /**
   * Fetch game art from SteamGridDB (fallback)
   */
  const fetchFromSteamGridDB = useCallback(async (gameName: string): Promise<GameArt> => {
    try {
      // This is a placeholder for SteamGridDB integration
      // In a real implementation, you would need to:
      // 1. Search for the game by name
      // 2. Get the game ID
      // 3. Fetch the grid images
      
      // For now, we'll just return an error
      return { 
        error: 'SteamGridDB integration not implemented yet',
        source: 'none'
      };
      
      // Example implementation would look like:
      /*
      const apiKey = 'your-steamgriddb-api-key';
      const searchResponse = await fetch(`https://www.steamgriddb.com/api/v2/search/autocomplete/${encodeURIComponent(gameName)}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });
      
      if (!searchResponse.ok) {
        throw new Error(`HTTP error ${searchResponse.status}`);
      }
      
      const searchData = await searchResponse.json();
      
      if (!searchData.success || !searchData.data || searchData.data.length === 0) {
        throw new Error('Game not found');
      }
      
      const gameId = searchData.data[0].id;
      
      // Fetch grid images
      const gridResponse = await fetch(`https://www.steamgriddb.com/api/v2/grids/game/${gameId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });
      
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
  }, []);
  
  /**
   * Get game art with fallback strategy
   */
  const getGameArt = useCallback(async (system: string, romName: string): Promise<GameArt> => {
    const cacheKey = `${system}/${romName}`;
    
    // Check cache first
    if (artCache[cacheKey]) {
      return artCache[cacheKey];
    }
    
    // Try ScreenScraper first
    const ssResult = await fetchFromScreenScraper(system, romName);
    
    // If ScreenScraper succeeded, cache and return
    if (!ssResult.error && (ssResult.boxart || ssResult.screenshot)) {
      setArtCache(prev => ({
        ...prev,
        [cacheKey]: ssResult
      }));
      return ssResult;
    }
    
    // If ScreenScraper failed, try SteamGridDB
    // Extract a clean game name from the ROM name for better search results
    const cleanGameName = romName
      .replace(/\.[^/.]+$/, '') // Remove extension
      .replace(/[\[\(].*[\]\)]/, '') // Remove content in brackets/parentheses
      .replace(/\./g, ' ') // Replace dots with spaces
      .trim();
    
    const sgdbResult = await fetchFromSteamGridDB(cleanGameName);
    
    // If SteamGridDB succeeded, cache and return
    if (!sgdbResult.error && (sgdbResult.boxart || sgdbResult.screenshot)) {
      setArtCache(prev => ({
        ...prev,
        [cacheKey]: sgdbResult
      }));
      return sgdbResult;
    }
    
    // If both failed, return the ScreenScraper error (or a combined error)
    const errorResult: GameArt = {
      error: ssResult.error,
      source: 'none'
    };
    
    setArtCache(prev => ({
      ...prev,
      [cacheKey]: errorResult
    }));
    
    return errorResult;
  }, [artCache, fetchFromScreenScraper, fetchFromSteamGridDB]);
  
  /**
   * Clear the art cache
   */
  const clearCache = useCallback(() => {
    setArtCache({});
  }, []);
  
  return {
    getGameArt,
    clearCache,
    pendingRequests: pendingRequests.size,
    isThrottled
  };
};

export default useArtProvider;
