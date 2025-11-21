import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Firebase configuration
// Replace these values with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyBK9GxYz3K9YqQX_xQ3xQ3xQ3xQ3xQ3xQ3",
  authDomain: "jandle-app.firebaseapp.com",
  databaseURL: "https://jandle-app-default-rtdb.firebaseio.com",
  projectId: "jandle-app",
  storageBucket: "jandle-app.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
const database = getDatabase(app);

export { database };
