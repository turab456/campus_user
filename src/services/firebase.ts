import { initializeApp } from 'firebase/app';
import { getMessaging, type Messaging } from 'firebase/messaging';

// Access environment variables via import.meta.env (Vite standard)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let messaging: Messaging | null = null;
let isConfigured = false;

// Synchronous check for secure context, Service Worker support, and PushManager support.
// Browsers require HTTPS or localhost/127.0.0.1 to initialize Service Workers and Push notifications.
const isSupportedEnvironment = 
  typeof window !== 'undefined' && 
  'serviceWorker' in navigator && 
  'PushManager' in window &&
  (window.isSecureContext || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const hasConfig = !!(firebaseConfig.apiKey && firebaseConfig.messagingSenderId);

if (hasConfig && isSupportedEnvironment) {
  try {
    const app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);
    isConfigured = true;
  } catch (error) {
    console.error('[Firebase Client Init Error] Firebase Messaging failed to initialize:', error);
  }
} else {
  if (!hasConfig) {
    console.warn('[Firebase Client Warning] Firebase VITE_FIREBASE_API_KEY / VITE_FIREBASE_MESSAGING_SENDER_ID missing. Push notifications will run in mock simulation.');
  } else {
    console.warn('[Firebase Client Warning] Service worker or PushManager is not supported, or origin is unsecure (e.g. HTTP network IP). Firebase Messaging init skipped.');
  }
}

export { messaging, isConfigured };
export default messaging;
