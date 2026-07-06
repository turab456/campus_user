// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Parse custom configuration values sent during Service Worker registration query parameters
const urlParams = new URLSearchParams(self.location.search);
const firebaseConfig = {
  apiKey: urlParams.get('apiKey') || "PLACEHOLDER_FIREBASE_API_KEY",
  authDomain: urlParams.get('authDomain') || "PLACEHOLDER_FIREBASE_AUTH_DOMAIN",
  projectId: urlParams.get('projectId') || "PLACEHOLDER_FIREBASE_PROJECT_ID",
  storageBucket: urlParams.get('storageBucket') || "PLACEHOLDER_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: urlParams.get('messagingSenderId') || "PLACEHOLDER_FIREBASE_MESSAGING_SENDER_ID",
  appId: urlParams.get('appId') || "PLACEHOLDER_FIREBASE_APP_ID"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[FCM Service Worker] Received background message: ', payload);
  
  const notificationTitle = payload.notification.title || 'Campus Marketplace';
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/public/favicon.ico', // fallback icon
    badge: '/public/favicon.ico',
    data: payload.data,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const data = event.notification.data || {};
  const clickAction = data.click_action || '/messages';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a window is already open at that URL, focus it
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        const urlMatch = client.url.indexOf(clickAction) !== -1;
        if (urlMatch && 'focus' in client) {
          return client.focus();
        }
      }
      // If no window is open, navigate or open a new window
      if (clients.openWindow) {
        return clients.openWindow(clickAction);
      }
    })
  );
});
