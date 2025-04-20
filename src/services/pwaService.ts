import { registerSW } from 'virtual:pwa-register';

// Register service worker for PWA functionality
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    const updateSW = registerSW({
      onNeedRefresh() {
        // Show a UI prompt to the user about the update
        if (confirm('New content available. Reload to update?')) {
          updateSW(true);
        }
      },
      onOfflineReady() {
        console.log('App ready to work offline');
        // Show offline ready notification
        const event = new CustomEvent('offlineReady');
        window.dispatchEvent(event);
      },
    });
    
    return updateSW;
  }
  
  return null;
};

// Check if the app is installed as PWA
export const isPWA = () => {
  return window.matchMedia('(display-mode: standalone)').matches || 
         (window.navigator as any).standalone === true;
};

// Show install prompt
export const showInstallPrompt = (promptEvent: BeforeInstallPromptEvent) => {
  promptEvent.prompt();
  return promptEvent.userChoice;
};

// Listen for beforeinstallprompt event
export const listenForInstallPrompt = (callback: (e: BeforeInstallPromptEvent) => void) => {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Pass the event to the callback
    callback(e as BeforeInstallPromptEvent);
  });
};

// Interface for BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default {
  registerServiceWorker,
  isPWA,
  showInstallPrompt,
  listenForInstallPrompt
};
