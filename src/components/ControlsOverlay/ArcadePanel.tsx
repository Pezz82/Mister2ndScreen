import React from 'react';
import { motion } from 'framer-motion';

interface ArcadePanelProps {
  game: string;
  activeButtons?: Record<number, boolean>;
}

/**
 * Component to display arcade control panel overlay with active button highlighting
 */
const ArcadePanel: React.FC<ArcadePanelProps> = ({ game, activeButtons = {} }) => {
  // In a real implementation, we would use controls.dat to get the actual layout
  // For now, we'll use a simplified generic arcade layout
  
  // Map common arcade controls to gamepad buttons
  const buttonMapping: Record<string, number> = {
    'joystick-up': 12,
    'joystick-down': 13,
    'joystick-left': 14,
    'joystick-right': 15,
    'button-1': 0,
    'button-2': 1,
    'button-3': 2,
    'button-4': 3,
    'button-5': 4,
    'button-6': 5,
    'start': 9,
    'coin': 8
  };
  
  return (
    <div className="arcade-panel">
      <h3>Arcade Controls: {game}</h3>
      
      <div className="arcade-overlay">
        <svg width="400" height="250" viewBox="0 0 400 250">
          {/* Joystick */}
          <g transform="translate(100, 125)">
            <circle cx="0" cy="0" r="30" fill="#444444" stroke="#222222" strokeWidth="2" />
            
            {/* Joystick shaft */}
            <motion.line 
              x1="0" y1="0" 
              x2={activeButtons[buttonMapping['joystick-right']] ? 15 : 
                  activeButtons[buttonMapping['joystick-left']] ? -15 : 0} 
              y2={activeButtons[buttonMapping['joystick-down']] ? 15 : 
                  activeButtons[buttonMapping['joystick-up']] ? -15 : 0}
              stroke="#888888" 
              strokeWidth="8"
              animate={{ 
                x2: activeButtons[buttonMapping['joystick-right']] ? 15 : 
                    activeButtons[buttonMapping['joystick-left']] ? -15 : 0,
                y2: activeButtons[buttonMapping['joystick-down']] ? 15 : 
                    activeButtons[buttonMapping['joystick-up']] ? -15 : 0
              }}
              transition={{ duration: 0.1 }}
            />
            
            {/* Joystick ball */}
            <motion.circle 
              cx={activeButtons[buttonMapping['joystick-right']] ? 15 : 
                  activeButtons[buttonMapping['joystick-left']] ? -15 : 0} 
              cy={activeButtons[buttonMapping['joystick-down']] ? 15 : 
                  activeButtons[buttonMapping['joystick-up']] ? -15 : 0}
              r="10" 
              fill="#dddddd"
              animate={{ 
                cx: activeButtons[buttonMapping['joystick-right']] ? 15 : 
                    activeButtons[buttonMapping['joystick-left']] ? -15 : 0,
                cy: activeButtons[buttonMapping['joystick-down']] ? 15 : 
                    activeButtons[buttonMapping['joystick-up']] ? -15 : 0
              }}
              transition={{ duration: 0.1 }}
            />
            
            <text x="0" y="50" textAnchor="middle" fill="white" fontSize="12">Joystick</text>
          </g>
          
          {/* Action buttons */}
          <g transform="translate(250, 100)">
            {/* Top row */}
            <motion.circle 
              cx="0" cy="0" r="15" 
              fill={activeButtons[buttonMapping['button-1']] ? "#ff0000" : "#cc0000"}
              animate={{ fill: activeButtons[buttonMapping['button-1']] ? "#ff0000" : "#cc0000" }}
              transition={{ duration: 0.1 }}
            />
            <text x="0" y="5" textAnchor="middle" fill="white" fontSize="10">1</text>
            
            <motion.circle 
              cx="40" cy="0" r="15" 
              fill={activeButtons[buttonMapping['button-2']] ? "#00ff00" : "#00cc00"}
              animate={{ fill: activeButtons[buttonMapping['button-2']] ? "#00ff00" : "#00cc00" }}
              transition={{ duration: 0.1 }}
            />
            <text x="40" y="5" textAnchor="middle" fill="white" fontSize="10">2</text>
            
            <motion.circle 
              cx="80" cy="0" r="15" 
              fill={activeButtons[buttonMapping['button-3']] ? "#0000ff" : "#0000cc"}
              animate={{ fill: activeButtons[buttonMapping['button-3']] ? "#0000ff" : "#0000cc" }}
              transition={{ duration: 0.1 }}
            />
            <text x="80" y="5" textAnchor="middle" fill="white" fontSize="10">3</text>
            
            {/* Bottom row */}
            <motion.circle 
              cx="0" cy="40" r="15" 
              fill={activeButtons[buttonMapping['button-4']] ? "#ffff00" : "#cccc00"}
              animate={{ fill: activeButtons[buttonMapping['button-4']] ? "#ffff00" : "#cccc00" }}
              transition={{ duration: 0.1 }}
            />
            <text x="0" y="45" textAnchor="middle" fill="white" fontSize="10">4</text>
            
            <motion.circle 
              cx="40" cy="40" r="15" 
              fill={activeButtons[buttonMapping['button-5']] ? "#ff00ff" : "#cc00cc"}
              animate={{ fill: activeButtons[buttonMapping['button-5']] ? "#ff00ff" : "#cc00cc" }}
              transition={{ duration: 0.1 }}
            />
            <text x="40" y="45" textAnchor="middle" fill="white" fontSize="10">5</text>
            
            <motion.circle 
              cx="80" cy="40" r="15" 
              fill={activeButtons[buttonMapping['button-6']] ? "#00ffff" : "#00cccc"}
              animate={{ fill: activeButtons[buttonMapping['button-6']] ? "#00ffff" : "#00cccc" }}
              transition={{ duration: 0.1 }}
            />
            <text x="80" y="45" textAnchor="middle" fill="white" fontSize="10">6</text>
          </g>
          
          {/* Start and coin buttons */}
          <g transform="translate(200, 200)">
            <motion.rect 
              x="0" y="0" width="60" height="20" rx="5" ry="5"
              fill={activeButtons[buttonMapping['start']] ? "#ffffff" : "#aaaaaa"}
              animate={{ fill: activeButtons[buttonMapping['start']] ? "#ffffff" : "#aaaaaa" }}
              transition={{ duration: 0.1 }}
            />
            <text x="30" y="15" textAnchor="middle" fill="black" fontSize="12">START</text>
            
            <motion.rect 
              x="-100" y="0" width="60" height="20" rx="5" ry="5"
              fill={activeButtons[buttonMapping['coin']] ? "#ffcc00" : "#cc9900"}
              animate={{ fill: activeButtons[buttonMapping['coin']] ? "#ffcc00" : "#cc9900" }}
              transition={{ duration: 0.1 }}
            />
            <text x="-70" y="15" textAnchor="middle" fill="black" fontSize="12">COIN</text>
          </g>
        </svg>
      </div>
      
      <div className="button-legend">
        <h4>Control Legend</h4>
        <div className="button-grid">
          {Object.entries(buttonMapping).map(([control, index]) => (
            <div 
              key={control} 
              className={`button-item ${activeButtons[index] ? 'active' : ''}`}
            >
              <span className="button-name">{control}</span>
              <span className="button-index">Button {index}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArcadePanel;
