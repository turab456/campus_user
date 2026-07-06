import { useEffect } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging, isConfigured } from '../services/firebase';
import { backendApi as api } from '../services/backendApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const useFcm = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (!user || !isConfigured || !messaging) return;

    const setupPushNotifications = async () => {
      try {
        const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
        if (!vapidKey || vapidKey.includes('placeholder')) {
          console.warn('[FCM Client Warning] VITE_FIREBASE_VAPID_KEY is missing or configured with a placeholder value. FCM registration skipped.');
          return;
        }

        // Request browser permission for notifications
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          // Register Service Worker explicitly with dynamic configuration parameters
          const swUrl = `/firebase-messaging-sw.js` +
            `?apiKey=${encodeURIComponent(import.meta.env.VITE_FIREBASE_API_KEY || '')}` +
            `&messagingSenderId=${encodeURIComponent(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '')}` +
            `&projectId=${encodeURIComponent(import.meta.env.VITE_FIREBASE_PROJECT_ID || '')}` +
            `&appId=${encodeURIComponent(import.meta.env.VITE_FIREBASE_APP_ID || '')}` +
            `&authDomain=${encodeURIComponent(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '')}` +
            `&storageBucket=${encodeURIComponent(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '')}`;

          const registration = await navigator.serviceWorker.register(swUrl);

          // Wait until the service worker is active to prevent push subscription AbortErrors
          if (!registration.active) {
            await new Promise<void>((resolve) => {
              const worker = registration.installing || registration.waiting;
              if (worker) {
                const stateChangeHandler = () => {
                  if (worker.state === 'activated') {
                    worker.removeEventListener('statechange', stateChangeHandler);
                    resolve();
                  }
                };
                worker.addEventListener('statechange', stateChangeHandler);
              } else {
                resolve();
              }
            });
          }

          // Get registration token from FCM using service worker registration
          const token = await getToken(messaging!, { 
            vapidKey,
            serviceWorkerRegistration: registration
          });

          if (token) {
            console.log('[FCM Client] FCM Token retrieved:', token.substring(0, 10) + '...');
            
            // Check if we already registered this token in local storage to prevent redundant API calls
            const savedToken = localStorage.getItem(`fcm_token_${user.id}`);
            if (savedToken !== token) {
              await api.registerFcmToken(token);
              localStorage.setItem(`fcm_token_${user.id}`, token);
              console.log('[FCM Client] Token successfully registered on the backend.');
            }
          } else {
            console.warn('[FCM Client] No registration token received from Firebase.');
          }
        } else {
          console.warn('[FCM Client] Push notification permissions were denied.');
        }
      } catch (err) {
        console.error('[FCM Client Error] Error setting up Firebase push notifications:', err);
      }
    };

    setupPushNotifications();

    // Listen for foreground push notifications when app is active
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('[FCM Client] Foreground message payload received:', payload);
      if (payload.notification) {
        const title = payload.notification.title || 'Notification';
        const body = payload.notification.body || '';
        // Show in-app banner toast
        showToast(`🔔 ${title}: ${body}`, 'info');
      }
    });

    return () => {
      unsubscribe();
    };
  }, [user, showToast]);
};
export default useFcm;
