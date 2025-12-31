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
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon-192.png'
  };

  self.registration.showNotification(notificationTitle,
    notificationOptions);
});
