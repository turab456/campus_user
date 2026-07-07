// d:\marketplace\src\hooks\useWebPush.ts
import { useEffect } from 'react';
import { backendApi as api } from '../services/backendApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const useWebPush = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (!user) return;

    const setupPushNotifications = async () => {
      try {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
          console.warn('[Web Push Client] Push notifications are not supported by this browser.');
          return;
        }

        // 1. Get VAPID public key dynamically from backend
        let vapidKey: string;
        try {
          vapidKey = await api.getVapidPublicKey();
        } catch (err) {
          console.warn('[Web Push Client Warning] Could not fetch VAPID public key from backend. Push setup aborted.');
          return;
        }

        if (!vapidKey || vapidKey.includes('placeholder')) {
          console.warn('[Web Push Client Warning] VAPID key is invalid or placeholder. Skipping setup.');
          return;
        }

        // 2. Request browser permission
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.warn('[Web Push Client] Notification permission was not granted:', permission);
          return;
        }

        // 3. Wait for service worker to be ready
        const registration = await navigator.serviceWorker.ready;

        // 4. Get or create push subscription
        let subscription = await registration.pushManager.getSubscription();
        
        if (!subscription) {
          console.log('[Web Push Client] Creating new push subscription...');
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidKey)
          });
        }

        if (subscription) {
          console.log('[Web Push Client] Subscription retrieved:', subscription.endpoint.substring(0, 30) + '...');
          
          // Re-serialize keys to match standard MongoDB nested structure
          const keys = subscription.toJSON().keys;
          if (keys && keys.p256dh && keys.auth) {
            const payload = {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: keys.p256dh,
                auth: keys.auth
              }
            };

            const savedEndpoint = localStorage.getItem(`push_endpoint_${user.id}`);
            if (savedEndpoint !== subscription.endpoint) {
              await api.subscribePush(payload);
              localStorage.setItem(`push_endpoint_${user.id}`, subscription.endpoint);
              console.log('[Web Push Client] Subscription successfully registered on the backend.');
            }
          }
        }
      } catch (err) {
        console.error('[Web Push Client Error] Error setting up Web Push notifications:', err);
      }
    };

    setupPushNotifications();

  }, [user]);
};

export default useWebPush;
