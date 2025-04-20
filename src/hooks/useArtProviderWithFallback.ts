import { useArtProvider } from '../services/screenscraper';
import { useSteamGridDB } from '../services/steamgriddb';
import { useCallback, useEffect, useState } from 'react';

interface ArtProviderProps {
  system: string | null;
  romName: string | null;
}

interface GameArt {
  boxart?: string;
  screenshot?: string;
  title?: string;
  error?: string;
  source?: 'screenscraper' | 'steamgriddb' | 'none';
}

/**
 * Component that combines both art providers with fallback logic
 */
export const useArtProviderWithFallback = ({ system, romName }: ArtProviderProps) => {
  const [gameArt, setGameArt] = useState<GameArt>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const screenScraper = useArtProvider();
  const steamGridDB = useSteamGridDB();
  
  const fetchArt = useCallback(async () => {
    if (!system || !romName) {
      setGameArt({});
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Try ScreenScraper first
      const ssResult = await screenScraper.getGameArt(system, romName);
      
      // If ScreenScraper succeeded, use it
      if (!ssResult.error && (ssResult.boxart || ssResult.screenshot)) {
        setGameArt(ssResult);
        setIsLoading(false);
        return;
      }
      
      // If ScreenScraper failed, try SteamGridDB
      // Extract a clean game name from the ROM name for better search results
      const cleanGameName = romName
        .replace(/\.[^/.]+$/, '') // Remove extension
        .replace(/[\[\(].*[\]\)]/, '') // Remove content in brackets/parentheses
        .replace(/\./g, ' ') // Replace dots with spaces
        .trim();
      
      const sgdbResult = await steamGridDB.getGameArt(cleanGameName);
      
      // If SteamGridDB succeeded, use it
      if (!sgdbResult.error && (sgdbResult.boxart || sgdbResult.screenshot)) {
        setGameArt(sgdbResult);
      } else {
        // If both failed, use the ScreenScraper result (which has the error)
        setGameArt(ssResult);
      }
    } catch (err) {
      console.error('Art provider error:', err);
      setGameArt({
        error: `Art provider error: ${err instanceof Error ? err.message : String(err)}`,
        source: 'none'
      });
    } finally {
      setIsLoading(false);
    }
  }, [system, romName, screenScraper, steamGridDB]);
  
  // Fetch art when system or romName changes
  useEffect(() => {
    fetchArt();
  }, [fetchArt]);
  
  return {
    gameArt,
    isLoading,
    refetch: fetchArt,
    pendingRequests: screenScraper.pendingRequests,
    isThrottled: screenScraper.isThrottled
  };
};

export default useArtProviderWithFallback;
