// src/components/ArtCard.tsx
import React, { useState, useEffect } from 'react';

interface ArtCardProps {
  gameTitle: string;
  className?: string;
}

const SCR_DEV_ID   = import.meta.env.VITE_SS_DEVID   || '';
const SCR_DEV_PW   = import.meta.env.VITE_SS_DEVPW   || '';
const SCR_SOFTNAME = import.meta.env.VITE_SS_SOFTNAME|| 'mister-second-screen';
const SGDB_KEY     = import.meta.env.VITE_SGDB_KEY   || ''; // optional

export function ArtCard({ gameTitle, className }: ArtCardProps) {
  const [artUrl, setArtUrl]   = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  // Normalize: remove anything in parentheses and trailing dots
  const cleanTitle = gameTitle.replace(/\s*\(.*?\)/g, '').replace(/\.+$/,'');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const fetchFromScreenScraper = async () => {
      const params = new URLSearchParams({
        devid:       SCR_DEV_ID,
        devpassword: SCR_DEV_PW,
        softname:    SCR_SOFTNAME,
        output:      'json',
        jeu_nom:     cleanTitle,
        media:       'box-2D',
        cover:       '1'
      });
      const url = `https://www.screenscraper.fr/api2/mediaJeu.php?${params}`;
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`ScreenScraper 404`);
      const data = await resp.json();
      const media = Array.isArray(data) ? data[0] : null;
      if (!media?.url) throw new Error(`No SS art`);
      return media.url as string;
    };

    const fetchFromSteamGrid = async () => {
      // 1) Autocomplete search
      const ac = await fetch(
        `https://www.steamgriddb.com/api/v2/search/autocomplete/${encodeURIComponent(cleanTitle)}`
      );
      const acJson = await ac.json();
      const first = acJson?.data?.[0];
      if (!first?.id) throw new Error(`SteamGridDB no match`);
      // 2) Get grids
      const grids = await fetch(
        `https://www.steamgriddb.com/api/v2/games/${first.id}/grids`
      );
      const gJson = await grids.json();
      const url = gJson?.data?.[0]?.url;
      if (!url) throw new Error(`SteamGridDB no grid`);
      return url as string;
    };

    (async () => {
      try {
        // Try SS first
        const url1 = await fetchFromScreenScraper();
        if (!cancelled) setArtUrl(url1);
      } catch (ssErr) {
        console.warn('SS failed:', ssErr);
        try {
          // Then fallback to SGDB
          const url2 = await fetchFromSteamGrid();
          if (!cancelled) setArtUrl(url2);
        } catch (sgErr) {
          console.warn('SGDB failed:', sgErr);
          if (!cancelled) setError('No cover art found');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [cleanTitle]);

  if (loading) return <div className={className}>Loading art…</div>;
  if (error)   return <div className={className}>{error}</div>;
  if (!artUrl) return null;

  return (
    <div className={className}>
      <img
        src={artUrl}
        alt={`${cleanTitle} cover art`}
        style={{ width: '100%', borderRadius: 8 }}
      />
    </div>
  );
}

export default ArtCard;
