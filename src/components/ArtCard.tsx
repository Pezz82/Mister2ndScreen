import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useMisterStatus from '../hooks/useMisterStatus';
import useArtProviderWithFallback from '../hooks/useArtProviderWithFallback';
import useGamepadWatcher from '../hooks/useGamepadWatcher';
import ConsolePad from './ControlsOverlay/ConsolePad';
import ArcadePanel from './ControlsOverlay/ArcadePanel';

interface ArtCardProps {
  className?: string;
}

const ArtCard: React.FC<ArtCardProps> = ({ className = '' }) => {
  const { coreRunning, gameRunning, system, filename, connected, error, reconnect } = useMisterStatus();
  const { gameArt, isLoading, refetch } = useArtProviderWithFallback({ 
    system, 
    romName: filename 
  });
  const { activeGamepad } = useGamepadWatcher();
  
  const [showControls, setShowControls] = useState(true);
  
  // Determine if we should show arcade or console controls
  const isArcade = system === 'Arcade' || system === 'NeoGeo';
  
  return (
    <div className={`art-card ${className}`}>
      <div className="status-bar">
        <div className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
          {connected ? 'Connected to MiSTer' : 'Disconnected'}
          {!connected && (
            <button onClick={reconnect} className="reconnect-button">
              Reconnect
            </button>
          )}
        </div>
        
        {error && (
          <div className="error-message">
            Error: {error}
          </div>
        )}
      </div>
      
      <AnimatePresence mode="wait">
        {coreRunning && (
          <motion.div 
            key={`core-${coreRunning}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="core-info"
          >
            <h2>Core: {coreRunning}</h2>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence mode="wait">
        {gameRunning && (
          <motion.div 
            key={`game-${gameRunning}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="game-info"
          >
            <div className="game-details">
              <h3>{gameArt.title || filename}</h3>
              <p>System: {system}</p>
            </div>
            
            {isLoading ? (
              <div className="loading-art">Loading artwork...</div>
            ) : gameArt.boxart ? (
              <div className="game-art">
                <img 
                  src={gameArt.boxart} 
                  alt={gameArt.title || filename || 'Game artwork'} 
                  className="boxart"
                />
              </div>
            ) : (
              <div className="no-art">
                <p>No artwork found</p>
                <button onClick={refetch} className="retry-button">
                  Retry
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="controls-section">
        <div className="controls-header">
          <h3>Controls</h3>
          <button 
            onClick={() => setShowControls(!showControls)}
            className="toggle-controls-button"
          >
            {showControls ? 'Hide' : 'Show'}
          </button>
        </div>
        
        <AnimatePresence>
          {showControls && gameRunning && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="controls-overlay"
            >
              {isArcade ? (
                <ArcadePanel 
                  game={filename || ''} 
                  activeButtons={activeGamepad?.buttons}
                />
              ) : (
                <ConsolePad 
                  system={system || 'generic'} 
                  activeButtons={activeGamepad?.buttons}
                />
              )}
              
              <div className="gamepad-status">
                {activeGamepad ? (
                  <p>Gamepad connected: {activeGamepad.id}</p>
                ) : (
                  <p>No gamepad detected. Connect a controller to see live button presses.</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ArtCard;
