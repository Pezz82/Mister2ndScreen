import React from 'react';
import { motion } from 'framer-motion';

interface ConsolePadProps {
  system: string;
  activeButtons?: Record<number, boolean>;
}

/**
 * Component to display console controller overlay with active button highlighting
 */
const ConsolePad: React.FC<ConsolePadProps> = ({ system, activeButtons = {} }) => {
  // Map system to controller type
  const getControllerType = (system: string) => {
    const systemMapping: Record<string, string> = {
      'SNES': 'snes',
      'NES': 'nes',
      'Genesis': 'genesis',
      'MegaDrive': 'genesis',
      'GBA': 'gba',
      'GB': 'gb',
      'GBC': 'gb',
      'PSX': 'psx',
      'N64': 'n64',
      'NeoGeo': 'neogeo',
      // Add more mappings as needed
    };
    
    return systemMapping[system] || 'generic';
  };
  
  // Map controller type to button layout
  const getButtonMapping = (controllerType: string) => {
    // This would be expanded with actual button mappings for each controller type
    // For now, we'll use a simplified mapping for demonstration
    const buttonMappings: Record<string, Record<number, string>> = {
      'snes': {
        0: 'B',
        1: 'A',
        2: 'Y',
        3: 'X',
        4: 'L',
        5: 'R',
        8: 'Select',
        9: 'Start',
        12: 'Up',
        13: 'Down',
        14: 'Left',
        15: 'Right'
      },
      'genesis': {
        0: 'A',
        1: 'B',
        2: 'C',
        3: 'X',
        4: 'Y',
        5: 'Z',
        8: 'Mode',
        9: 'Start',
        12: 'Up',
        13: 'Down',
        14: 'Left',
        15: 'Right'
      },
      // Add more mappings as needed
      'generic': {
        0: 'A',
        1: 'B',
        2: 'X',
        3: 'Y',
        4: 'L1',
        5: 'R1',
        6: 'L2',
        7: 'R2',
        8: 'Select',
        9: 'Start',
        12: 'Up',
        13: 'Down',
        14: 'Left',
        15: 'Right'
      }
    };
    
    return buttonMappings[controllerType] || buttonMappings.generic;
  };
  
  const controllerType = getControllerType(system);
  const buttonMapping = getButtonMapping(controllerType);
  
  // In a real implementation, we would load controller images from public/overlays
  // For now, we'll use a placeholder SVG
  
  return (
    <div className="console-pad">
      <h3>Controller: {controllerType}</h3>
      
      <div className="controller-overlay">
        {/* This would be replaced with actual controller images */}
        <svg width="300" height="200" viewBox="0 0 300 200">
          {/* D-Pad */}
          <g>
            <motion.rect 
              x="50" y="80" width="20" height="20" 
              fill={activeButtons[12] ? "#ff0000" : "#333333"}
              animate={{ fill: activeButtons[12] ? "#ff0000" : "#333333" }}
              transition={{ duration: 0.1 }}
            />
            <text x="60" y="95" textAnchor="middle" fill="white" fontSize="10">Up</text>
            
            <motion.rect 
              x="50" y="120" width="20" height="20" 
              fill={activeButtons[13] ? "#ff0000" : "#333333"}
              animate={{ fill: activeButtons[13] ? "#ff0000" : "#333333" }}
              transition={{ duration: 0.1 }}
            />
            <text x="60" y="135" textAnchor="middle" fill="white" fontSize="10">Down</text>
            
            <motion.rect 
              x="30" y="100" width="20" height="20" 
              fill={activeButtons[14] ? "#ff0000" : "#333333"}
              animate={{ fill: activeButtons[14] ? "#ff0000" : "#333333" }}
              transition={{ duration: 0.1 }}
            />
            <text x="40" y="115" textAnchor="middle" fill="white" fontSize="10">Left</text>
            
            <motion.rect 
              x="70" y="100" width="20" height="20" 
              fill={activeButtons[15] ? "#ff0000" : "#333333"}
              animate={{ fill: activeButtons[15] ? "#ff0000" : "#333333" }}
              transition={{ duration: 0.1 }}
            />
            <text x="80" y="115" textAnchor="middle" fill="white" fontSize="10">Right</text>
          </g>
          
          {/* Face buttons */}
          <g>
            {Object.entries(buttonMapping).map(([index, label]) => {
              // Skip D-pad buttons which we've already rendered
              if (['12', '13', '14', '15'].includes(index)) {
                return null;
              }
              
              // Position face buttons on the right side
              const buttonIndex = parseInt(index);
              const x = 200 + ((buttonIndex % 4) * 25);
              const y = 80 + (Math.floor(buttonIndex / 4) * 25);
              
              return (
                <g key={index}>
                  <motion.circle 
                    cx={x} cy={y} r="10" 
                    fill={activeButtons[buttonIndex] ? "#ff0000" : "#333333"}
                    animate={{ fill: activeButtons[buttonIndex] ? "#ff0000" : "#333333" }}
                    transition={{ duration: 0.1 }}
                  />
                  <text x={x} y={y + 3} textAnchor="middle" fill="white" fontSize="8">{label}</text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
      
      <div className="button-legend">
        <h4>Button Legend</h4>
        <div className="button-grid">
          {Object.entries(buttonMapping).map(([index, label]) => (
            <div 
              key={index} 
              className={`button-item ${activeButtons[parseInt(index)] ? 'active' : ''}`}
            >
              <span className="button-name">{label}</span>
              <span className="button-index">Button {index}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConsolePad;
