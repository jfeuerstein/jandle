import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { ref, set, get } from 'firebase/database';
import { app, database } from '../firebase';

let messaging = null;

// Initialize Firebase Cloud Messaging
export const initializeMessaging = () => {
  try {
    // Only initialize if service worker is supported
    if (!('serviceWorker' in navigator)) {
      console.error('Service workers not supported');
      return null;
    }

    messaging = getMessaging(app);
    return messaging;
  } catch (error) {
    console.error('Error initializing messaging:', error);
    console.error('Make sure service worker is registered first');
    return null;
  }
};

// Request notification permission and get FCM token
export const requestNotificationPermission = async (userId) => {
  try {
    // Check if notifications are supported
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return null;
    }

    // Check if service worker is supported and registered
    if (!('serviceWorker' in navigator)) {
      console.error('Service workers are not supported in this browser');
      return null;
    }

    // Request permission first
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      console.log('Notification permission granted');

      // Try to wait for service worker, but don't fail if it's not available (dev mode)
      console.log('Checking for service worker...');
      let registration = null;

      try {
        // Give service worker 3 seconds to be ready, then continue anyway
        registration = await Promise.race([
          navigator.serviceWorker.ready,
          new Promise((resolve) => setTimeout(() => resolve(null), 3000))
        ]);

        if (registration) {
          console.log('Service worker is ready:', registration.scope);
          console.log('Active service worker:', registration.active?.scriptURL);
        } else {
          console.warn('Service worker not available (this is OK in development)');
          console.warn('Push notifications require service worker and will work in production');
          console.warn('Badge API will still work without service worker');
        }
      } catch (swError) {
        console.warn('Service worker not available:', swError.message);
        console.warn('Continuing without service worker (development mode)');
      }

      // Initialize messaging if not already done
      if (!messaging) {
        console.log('Initializing Firebase Messaging...');
        messaging = initializeMessaging();
      }

      if (!messaging) {
        console.error('Failed to initialize messaging');
        return null;
      }

      // Only try to get FCM token if we have a service worker (production)
      if (registration) {
        console.log('Attempting to get FCM token...');
        console.log('VAPID Key:', process.env.REACT_APP_FIREBASE_VAPID_KEY ? 'Present' : 'Missing');

        try {
          // Get FCM token - Firebase will use the existing service worker registration
          const currentToken = await getToken(messaging, {
            vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY,
            serviceWorkerRegistration: registration
          });

          if (currentToken) {
            console.log('FCM Token received:', currentToken);

            // Save token to Firebase for this user
            await saveTokenToDatabase(userId, currentToken);

            return currentToken;
          } else {
            console.log('No registration token available. Request permission to generate one.');
            return null;
          }
        } catch (tokenError) {
          console.error('Failed to get FCM token:', tokenError.message);
          console.warn('Push notifications will not work, but Badge API will still function');
          return null;
        }
      } else {
        console.log('Skipping FCM token generation (service worker not available in dev mode)');
        console.log('Badge API will still work for showing unread counts');
        return null;
      }
    } else {
      console.log('Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    return null;
  }
};

// Save FCM token to Firebase Database
const saveTokenToDatabase = async (userId, token) => {
  try {
    console.log(`Saving token for user: ${userId}`);
    console.log(`Token to save: ${token.substring(0, 20)}...`);

    const tokenRef = ref(database, `deviceTokens/${userId}`);
    const snapshot = await get(tokenRef);

    console.log('Current tokens in database:', snapshot.exists() ? snapshot.val() : 'None');

    const tokens = snapshot.exists() ? snapshot.val() : [];

    // Ensure tokens is an array
    const tokensArray = Array.isArray(tokens) ? tokens : [];

    // Add token if it doesn't exist
    if (!tokensArray.includes(token)) {
      const updatedTokens = [...tokensArray, token];
      await set(tokenRef, updatedTokens);
      console.log('Token saved to database successfully');
      console.log('Updated tokens:', updatedTokens);
    } else {
      console.log('Token already exists in database');
    }
  } catch (error) {
    console.error('Error saving token to database:', error);
    console.error('Error details:', error.message);
  }
};

// Handle foreground messages
export const onMessageListener = () => {
  return new Promise((resolve) => {
    if (!messaging) {
      messaging = initializeMessaging();
    }

    if (messaging) {
      onMessage(messaging, (payload) => {
        console.log('Message received in foreground:', payload);
        resolve(payload);
      });
    }
  });
};

// Show notification manually (for foreground messages)
export const showNotification = (title, options = {}) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      const notification = new Notification(title, {
        icon: '/logo192.png',
        badge: '/favicon.ico',
        ...options
      });

      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        notification.close();
      };

      return notification;
    } catch (error) {
      console.error('Error showing notification:', error);
      return null;
    }
  }
  return null;
};

// Check if user has granted notification permission
export const hasNotificationPermission = () => {
  return 'Notification' in window && Notification.permission === 'granted';
};

// Remove token from database (for logout or opt-out)
export const removeTokenFromDatabase = async (userId, token) => {
  try {
    const tokenRef = ref(database, `deviceTokens/${userId}`);
    const snapshot = await get(tokenRef);

    if (snapshot.exists()) {
      const tokens = snapshot.val();
      const updatedTokens = tokens.filter(t => t !== token);
      await set(tokenRef, updatedTokens);
      console.log('Token removed from database');
    }
  } catch (error) {
    console.error('Error removing token from database:', error);
  }
};
