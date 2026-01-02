importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
firebase.initializeApp({
  apiKey: "AIzaSyAVSu04q3MT8dixzOuvowUlXRrI5Zyl9Vc", // Allowed to be public in SW? Ideally use env but SW has no access to process.env at runtime easily. 
  // Wait, standard practice for SW is often to hardcode or use a build step. 
  // But actually, we can use self.firebaseConfig if injected, or just the Sender ID usually. 
  // Let's use the full config from the user's previous file to be safe, or just messagingSenderId.
  // Actually, for background handling, we usually need at least projectId and messagingSenderId.
  // I will use the values provided earlier since specific environment injection into SW is tricky without a build step.
  authDomain: "absnt-coffee.firebaseapp.com",
  projectId: "absnt-coffee",
  storageBucket: "absnt-coffee.firebasestorage.app",
  messagingSenderId: "192398857040",
  appId: "1:192398857040:web:6e99e14dbb109da15b1255",
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // If payload has data but NO notification, we might need to handle it. 
  // But strictly, strict 'push' listener is preferred for PWA.
  // We'll keep this logging but rely on the push listener below for the actual showNotification if needed.
});

self.addEventListener('push', function(event) {
    console.log('[firebase-messaging-sw.js] Push event received', event);
    
    if (event.data) {
        try {
            // Parse the data. FCM sends data as JSON in specific structure or just plain text?
            // Usually FCM 'data' payload is wrapped.
            const payload = event.data.json();
            console.log('[firebase-messaging-sw.js] Push payload:', payload);

            // Structure check: FCM v1 sends { data: { ... }, fcmMessageId: ... } or just the data?
            // When using event.data.json(), it typically returns the full FCM object if sent via FCM protocol.
            // If we sent { data: { title, body } }, we access payload.data.title
            
            // NOTE: payload.data might be where our custom fields are.
            const data = payload.data || payload; // Fallback
            
            const title = data.title || 'New Notification';
            const options = {
                body: data.body || '',
                icon: '/logo.jpg', // Changed to logo.jpg as requested in previous turns
                badge: '/logo.jpg',
                data: {
                    url: data.url || '/'
                }
            };
            
            // Only show if we have a title (basic validation)
            if (title) {
                event.waitUntil(
                    self.registration.showNotification(title, options)
                );
            }
        } catch (e) {
            console.error('Error parsing push data', e);
        }
    }
});

self.addEventListener('notificationclick', function(event) {
    console.log('[firebase-messaging-sw.js] Notification click received.');
    event.notification.close();
    
    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({type: 'window', includeUncontrolled: true}).then(function(clientList) {
            for (var i = 0; i < clientList.length; i++) {
                var client = clientList[i];
                if (client.url === urlToOpen && 'focus' in client)
                    return client.focus();
            }
            if (clients.openWindow)
                return clients.openWindow(urlToOpen);
        })
    );
});
