import { useState, useEffect } from 'react';

interface ArtCardProps {
  gameTitle: string;       // e.g. "Super Mario Bros"
}

export function ArtCard({ gameTitle }: ArtCardProps) {
  const [artUrl, setArtUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Replace these with your real ScreenScraper credentials,
  // or better yet, load them from environment variables.
  const SCR_DEV_ID   = import.meta.env.VITE_SS_DEVID   || '';
  const SCR_DEV_PW   = import.meta.env.VITE_SS_DEVPW   || '';
  const SCR_SOFTNAME = import.meta.env.VITE_SS_SOFTNAME || 'mister-second-screen';

  useEffect(() => {
    if (!gameTitle) return;

    const fetchArt = async () => {
      try {
        const url = [
          'https://www.screenscraper.fr/api2/mediaJeu.php',
          `devid=${encodeURIComponent(SCR_DEV_ID)}`,
          `devpassword=${encodeURIComponent(SCR_DEV_PW)}`,
          `softname=${encodeURIComponent(SCR_SOFTNAME)}`,
          'output=json',
          `jeu_nom=${encodeURIComponent(gameTitle)}`,
          'media=box-2D',
          'cover=1'
        ].join('&').replace('?','?');

        const resp = await fetch(url.startsWith('?') ? url.replace('&','?') : url);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        const media = Array.isArray(data) ? data[0] : null;

        if (media?.url) {
          setArtUrl(media.url);
          setError(null);
        } else {
          setArtUrl(null);
          setError('No art found');
        }
      } catch (err) {
        console.error('Art fetch failed', err);
        setError(err instanceof Error ? err.message : String(err));
      }
    };

    fetchArt();
  }, [gameTitle, SCR_DEV_ID, SCR_DEV_PW, SCR_SOFTNAME]);

  if (error) return <div className="art-card--error">Error loading art: {error}</div>;
  if (!artUrl) return <div className="art-card--loading">Loading art…</div>;

  return (
    <div className="art-card">
      <img
        src={artUrl}
        alt={`${gameTitle} box art`}
        className="art-card__image"
      />
    </div>
  );
}
