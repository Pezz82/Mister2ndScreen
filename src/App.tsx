// src/App.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArtCard } from './components/ArtCard';
import useMisterStatus from './hooks/useMisterStatus';
import { isPWA, listenForInstallPrompt, showInstallPrompt } from './services/pwaService';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  misterHost: string;
  onMisterHostChange: (host: string) => void;
  ssUser: string;
  onSsUserChange: (user: string) => void;
  ssUserPass: string;
  onSsUserPassChange: (pass: string) => void;
  darkMode: boolean;
  onDarkModeChange: (isDark: boolean) => void;
}

const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  isOpen,
  onClose,
  misterHost,
  onMisterHostChange,
  ssUser,
  onSsUserChange,
  ssUserPass,
  onSsUserPassChange,
  darkMode,
  onDarkModeChange
}) => {
  const [localMisterHost, setLocalMisterHost] = useState(misterHost);
  const [localSsUser, setLocalSsUser] = useState(ssUser);
  const [localSsUserPass, setLocalSsUserPass] = useState(ssUserPass);
  
  const handleSave = () => {
    onMisterHostChange(localMisterHost);
    onSsUserChange(localSsUser);
    onSsUserPassChange(localSsUserPass);
    onClose();
  };
  
  return (
    <motion.div 
      className={`settings-drawer ${isOpen ? 'open' : ''}`}
      initial={{ x: '100%' }}
      animate={{ x: isOpen ? 0 : '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
    >
      <div className="settings-header">
        <h2>Settings</h2>
        <button onClick={onClose} className="close-button">×</button>
      </div>
      
      <div className="settings-content">
        <div className="setting-group">
          <label htmlFor="mister-host">MiSTer IP Address</label>
          <input 
            id="mister-host"
            type="text" 
            value={localMisterHost} 
            onChange={(e) => setLocalMisterHost(e.target.value)}
            placeholder="192.168.0.135"
          />
        </div>
        
        <div className="setting-group">
          <h3>ScreenScraper Credentials (Optional)</h3>
          <label htmlFor="ss-user">Username</label>
          <input 
            id="ss-user"
            type="text" 
            value={localSsUser} 
            onChange={(e) => setLocalSsUser(e.target.value)}
            placeholder="Username"
          />
          
          <label htmlFor="ss-pass">Password</label>
          <input 
            id="ss-pass"
            type="password" 
            value={localSsUserPass} 
            onChange={(e) => setLocalSsUserPass(e.target.value)}
            placeholder="Password"
          />
          <p className="help-text">
            Adding ScreenScraper credentials increases your API request limit.
          </p>
        </div>
        
        <div className="setting-group">
          <label htmlFor="dark-mode" className="toggle-label">
            Dark Mode
            <div className="toggle-switch">
              <input 
                id="dark-mode"
                type="checkbox" 
                checked={darkMode} 
                onChange={(e) => onDarkModeChange(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </div>
          </label>
        </div>
        
        <div className="settings-actions">
          <button onClick={handleSave} className="save-button">Save Settings</button>
          <button onClick={onClose} className="cancel-button">Cancel</button>
        </div>
      </div>
    </motion.div>
  );
};

const App: React.FC = () => {
  // Settings state
  const [misterHost, setMisterHost] = useState(import.meta.env.VITE_MISTER_HOST || '192.168.0.135');
  const [ssUser, setSsUser] = useState(import.meta.env.VITE_SS_USER || '');
  const [ssUserPass, setSsUserPass] = useState(import.meta.env.VITE_SS_USERPASS || '');
  const [darkMode, setDarkMode] = useState(
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isInstalled, setIsInstalled] = useState(isPWA());
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  // Listen for online/offline
  useEffect(() => {
    const onOnline  = () => setIsOffline(false);
    const onOffline = () => setIsOffline(true);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  // PWA install prompt
  useEffect(() => {
    listenForInstallPrompt((e) => setInstallPrompt(e));
    window.addEventListener('appinstalled', () => setIsInstalled(true));
    return () => window.removeEventListener('appinstalled', () => setIsInstalled(true));
  }, []);

  // Dark mode toggling
  useEffect(() => {
    document.documentElement.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  // MiSTer status (polling REST API)
  const { coreRunning, gameRunning, connected, error, refresh } = useMisterStatus({
    host: misterHost,
    pollInterval: 2000
  });

  const handleInstallClick = async () => {
    if (installPrompt) {
      const result = await showInstallPrompt(installPrompt);
      if (result.outcome === 'accepted') {
        setInstallPrompt(null);
        setIsInstalled(true);
      }
    }
  };

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      <header className="app-header">
        <h1>MiSTer Second Screen</h1>
        <button onClick={() => setSettingsOpen(true)} className="settings-button">⚙️</button>
      </header>

      <main className="app-content">
        {isOffline && (
          <div className="offline-banner">You are offline. Using cached content.</div>
        )}

        {!isInstalled && installPrompt && (
          <div className="install-prompt">
            <p>Install this app on your device for the best experience!</p>
            <button onClick={handleInstallClick} className="install-button">
              Install
            </button>
            <button onClick={() => setInstallPrompt(null)} className="dismiss-button">
              Not Now
            </button>
          </div>
        )}

        {/* Game info and art */}
        {connected ? (
          <>
            <p>Core: {coreRunning}</p>
            <p>Game: {gameRunning}</p>

            {gameRunning ? (
              <ArtCard className="main-art-card" gameTitle={gameRunning} />
            ) : (
              <div className="placeholder-art">No game loaded</div>
            )}

            <button onClick={refresh}>Refresh Now</button>
          </>
        ) : (
          <p>Disconnected{error ? `: ${error}` : ''}</p>
        )}
      </main>

      <footer className="app-footer">
        <p>MiSTer Second Screen PWA | <a href="#about">About</a></p>
      </footer>

      <SettingsDrawer
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        misterHost={misterHost}
        onMisterHostChange={setMisterHost}
        ssUser={ssUser}
        onSsUserChange={setSsUser}
        ssUserPass={ssUserPass}
        onSsUserPassChange={setSsUserPass}
        darkMode={darkMode}
        onDarkModeChange={setDarkMode}
      />
    </div>
  );
};

export default App;
