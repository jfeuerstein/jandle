# Firebase Setup Guide

This guide will help you set up Firebase for the Jandle Q&A app to enable data persistence across sessions.

## Prerequisites

- A Google account
- Node.js and npm installed

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter a project name (e.g., "jandle-app")
4. Follow the setup wizard (you can disable Google Analytics if you don't need it)
5. Click "Create project"

## Step 2: Create a Web App

1. In your Firebase project dashboard, click the web icon (`</>`) to add a web app
2. Register your app with a nickname (e.g., "jandle-web")
3. Check "Also set up Firebase Hosting" if you plan to deploy (optional)
4. Click "Register app"

## Step 3: Get Your Firebase Configuration

After registering your app, you'll see a configuration object that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## Step 4: Enable Realtime Database

1. In the Firebase Console, go to "Build" > "Realtime Database"
2. Click "Create Database"
3. Choose a location (select the one closest to your users)
4. Start in **test mode** for development (you can update security rules later)
5. Click "Enable"

## Step 5: Update Your Configuration

1. Open `src/firebase.js` in your project
2. Replace the placeholder `firebaseConfig` object with your actual configuration from Step 3

```javascript
// Replace this in src/firebase.js
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_ACTUAL_AUTH_DOMAIN",
  databaseURL: "YOUR_ACTUAL_DATABASE_URL",
  projectId: "YOUR_ACTUAL_PROJECT_ID",
  storageBucket: "YOUR_ACTUAL_STORAGE_BUCKET",
  messagingSenderId: "YOUR_ACTUAL_MESSAGING_SENDER_ID",
  appId: "YOUR_ACTUAL_APP_ID"
};
```

## Step 6: Configure Security Rules (Important!)

By default, the database starts in test mode, which allows anyone to read/write for 30 days. For production, you should update the security rules:

1. In Firebase Console, go to "Realtime Database" > "Rules"
2. Update the rules as needed. For a simple setup with no authentication:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

For production, you should implement proper authentication and more restrictive rules.

## Step 7: Test the Connection

1. Start your development server: `npm start`
2. Open the app in your browser
3. Open the browser console (F12) and check for any Firebase errors
4. Try answering a question - it should persist to Firebase
5. Refresh the page - your data should still be there!

## Verify Data in Firebase Console

1. Go to Firebase Console > Realtime Database
2. You should see your data structure:
   - `questionIndex` - tracks which question each user is on
   - `inbox` - pending questions for each user
   - `answers` - completed Q&A pairs with chat messages

## Troubleshooting

### Error: Permission Denied

- Check that your Realtime Database rules allow read/write access
- Verify you're using the correct database URL

### Error: Firebase not initialized

- Make sure you've replaced the placeholder config with your actual Firebase config
- Check that `firebase.js` is being imported correctly

### Data not persisting

- Open browser console and look for Firebase errors
- Verify your database URL is correct and includes `-default-rtdb` in the URL
- Check that you've enabled Realtime Database (not just Firestore)

## Next Steps

- Implement Firebase Authentication for user login
- Add more restrictive security rules
- Set up Firebase Hosting for deployment
- Add offline persistence with Firebase's offline capabilities

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Realtime Database Guide](https://firebase.google.com/docs/database)
- [Security Rules](https://firebase.google.com/docs/database/security)
