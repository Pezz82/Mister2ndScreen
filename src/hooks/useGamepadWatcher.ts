import { useEffect, useState } from 'react';

interface GamepadWatcherOptions {
  pollInterval?: number;
}

interface ButtonState {
  [buttonIndex: number]: boolean;
}

interface AxisState {
  [axisIndex: number]: number;
}

interface GamepadState {
  connected: boolean;
  id: string;
  buttons: ButtonState;
  axes: AxisState;
}

/**
 * Hook to watch gamepad connections and button presses
 */
export const useGamepadWatcher = (options?: GamepadWatcherOptions) => {
  const pollInterval = options?.pollInterval || 50; // 50ms default polling rate
  
  const [gamepads, setGamepads] = useState<GamepadState[]>([]);
  const [activeGamepad, setActiveGamepad] = useState<number | null>(null);
  
  // Initialize and poll for gamepad state
  useEffect(() => {
    let animationFrameId: number;
    
    const updateGamepads = () => {
      // Get all connected gamepads
      const connectedGamepads = navigator.getGamepads();
      
      // Map to our simplified state structure
      const newGamepadStates = Array.from(connectedGamepads)
        .filter((gamepad): gamepad is Gamepad => gamepad !== null)
        .map(gamepad => {
          // Map buttons to a simple pressed state object
          const buttons: ButtonState = {};
          gamepad.buttons.forEach((button, index) => {
            buttons[index] = button.pressed;
          });
          
          // Map axes to a simple value object
          const axes: AxisState = {};
          gamepad.axes.forEach((value, index) => {
            axes[index] = value;
          });
          
          return {
            connected: true,
            id: gamepad.id,
            buttons,
            axes
          };
        });
      
      setGamepads(newGamepadStates);
      
      // Set the first connected gamepad as active if none is selected
      if (activeGamepad === null && newGamepadStates.length > 0) {
        setActiveGamepad(0);
      } else if (activeGamepad !== null && newGamepadStates.length <= activeGamepad) {
        // Reset active gamepad if it was disconnected
        setActiveGamepad(newGamepadStates.length > 0 ? 0 : null);
      }
      
      // Continue polling
      animationFrameId = requestAnimationFrame(updateGamepads);
    };
    
    // Handle gamepad connection events
    const handleGamepadConnected = (event: GamepadEvent) => {
      console.log('Gamepad connected:', event.gamepad.id);
      updateGamepads();
    };
    
    const handleGamepadDisconnected = (event: GamepadEvent) => {
      console.log('Gamepad disconnected:', event.gamepad.id);
      updateGamepads();
    };
    
    // Add event listeners
    window.addEventListener('gamepadconnected', handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);
    
    // Start polling
    animationFrameId = requestAnimationFrame(updateGamepads);
    
    // Cleanup
    return () => {
      window.removeEventListener('gamepadconnected', handleGamepadConnected);
      window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected);
      cancelAnimationFrame(animationFrameId);
    };
  }, [activeGamepad, pollInterval]);
  
  // Function to change active gamepad
  const setActiveGamepadIndex = (index: number) => {
    if (index >= 0 && index < gamepads.length) {
      setActiveGamepad(index);
      return true;
    }
    return false;
  };
  
  return {
    gamepads,
    activeGamepad: activeGamepad !== null ? gamepads[activeGamepad] : null,
    activeGamepadIndex: activeGamepad,
    setActiveGamepadIndex
  };
};

export default useGamepadWatcher;
