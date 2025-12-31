import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for notifications and offline support
// Note: Service worker registration may not work in CRA dev mode due to MIME type issues
// This is expected - it will work in production build
if ('serviceWorker' in navigator) {
  // Wait for page load to ensure service worker file is available
  window.addEventListener('load', () => {
    // Use PUBLIC_URL for GitHub Pages subdirectory support
    const swUrl = `${process.env.PUBLIC_URL}/firebase-messaging-sw.js`;
    console.log('Registering service worker at:', swUrl);

    navigator.serviceWorker
      .register(swUrl)
      .then((registration) => {
        console.log('Service Worker registered successfully:', registration.scope);
        console.log('Service Worker state:', registration.installing ? 'installing' : registration.waiting ? 'waiting' : registration.active ? 'active' : 'unknown');
      })
      .catch((error) => {
        // MIME type errors are expected in development with CRA
        if (error.message.includes('MIME type')) {
          console.warn('Service Worker registration failed in development (expected).');
          console.warn('Service workers will work after building and deploying: npm run deploy');
          console.warn('For development, notifications and badge API will still work without the service worker.');
        } else {
          console.error('Service Worker registration failed:', error);
          console.error('Error details:', error.message);
          console.error('Attempted URL:', swUrl);
        }
      });
  });
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
