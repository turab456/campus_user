import { useState, useEffect } from 'react';

// Custom interface for BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const usePWA = () => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isOffline, setIsOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [swUpdateAvailable, setSwUpdateAvailable] = useState(false);

  useEffect(() => {
    // Detect standalone mode
    const checkStandalone = () => {
      const isMql = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(display-mode: standalone)').matches : false;
      const isNav = typeof navigator !== 'undefined' && 'standalone' in navigator ? (navigator as any).standalone === true : false;
      setIsStandalone(isMql || isNav);
    };

    checkStandalone();

    // Listen for installable prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Online/Offline status
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check for service worker updates
    // Listen for custom swUpdate event if dispatched by our registration
    const handleSwUpdate = () => {
      setSwUpdateAvailable(true);
    };

    window.addEventListener('swUpdate', handleSwUpdate);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('swUpdate', handleSwUpdate);
    };
  }, []);

  const installApp = async (): Promise<boolean> => {
    if (!deferredPrompt) return false;
    
    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the PWA install prompt');
        setIsInstallable(false);
        setDeferredPrompt(null);
        return true;
      } else {
        console.log('User dismissed the PWA install prompt');
        return false;
      }
    } catch (err) {
      console.error('Error triggering PWA prompt', err);
      return false;
    }
  };

  const reloadApp = () => {
    // Reload page to apply the Service Worker update
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
        });
      });
    }
    window.location.reload();
  };

  return {
    isInstallable,
    isOffline,
    isStandalone,
    swUpdateAvailable,
    installApp,
    reloadApp,
  };
};
