# Notifications Setup Guide for Jandle

This guide will help you set up push notifications and badge notifications for the jandle PWA.

## What's Been Implemented

### ✅ Frontend
- **Badge API Service** (`src/services/badgeService.js`) - Shows unread count on iOS/Android home screen icon
- **Firebase Messaging Service** (`src/services/messagingService.js`) - Handles push notifications
- **Service Worker** (`public/firebase-messaging-sw.js`) - Handles background notifications
- **AppContext Integration** - Auto-updates badge and handles notifications

### ✅ Backend
- **Cloud Functions** (`functions/index.js`):
  - `sendInboxNotification` - Triggers when new questions arrive in inbox
  - `sendMessageNotification` - Triggers when new chat messages arrive

### ✅ PWA Configuration
- Updated `manifest.json` with proper app metadata
- Service worker registration in `index.js`

## Setup Steps

### Step 1: Generate VAPID Key in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **jandle-app-33fa7**
3. Click the gear icon ⚙️ > **Project settings**
4. Go to the **Cloud Messaging** tab
5. Scroll down to **Web Push certificates**
6. Click **Generate key pair**
7. Copy the key pair (it will look like: `BN4xX...`)

### Step 2: Update Environment Variables

Update `.env` file with your VAPID key:

```bash
REACT_APP_FIREBASE_VAPID_KEY="YOUR_VAPID_KEY_HERE"
```

Replace `YOUR_VAPID_KEY_HERE` with the key you generated in Step 1.

### Step 3: Deploy Cloud Functions

Deploy the notification functions to Firebase:

```bash
cd functions
npm run deploy
# Or from root directory:
firebase deploy --only functions
```

This will deploy:
- `sendInboxNotification` - Sends notifications when inbox items are added
- `sendMessageNotification` - Sends notifications when messages are sent

### Step 4: Test Locally

1. Install dependencies (if not already done):
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open the app in your browser
4. When you log in as Josh or Nini, you'll be prompted for notification permission
5. Grant permission to test notifications

### Step 5: Deploy to Production

```bash
npm run build
firebase deploy
```

## How It Works

### Badge Notifications (iOS-friendly)

The badge API automatically updates the app icon with the unread count:

- **Inbox items**: Each unanswered question counts as 1
- **Unread messages**: Each new message in the answers section counts as 1
- **Auto-updates**: Badge updates whenever inbox, answers, or viewedStatus changes

**iOS Support**: Works great on iOS 16.4+ when app is "Added to Home Screen"

### Push Notifications

**When you'll receive notifications:**

1. **New Inbox Question** - When your partner answers a question
   - Title: "New Question Waiting!"
   - Body: "Your partner answered a question. Your turn!"

2. **New Message** - When your partner replies in a conversation
   - Title: "{Partner Name} replied"
   - Body: Preview of the message (first 50 chars)

**Notification States:**
- **Foreground** (app open): Shows in-app notification
- **Background** (app closed): Shows OS-level push notification
- **Click**: Opens the app to the relevant section (inbox or answers)

### Device Token Management

- Tokens are automatically stored in Firebase Realtime Database under `/deviceTokens/{userId}`
- Invalid/expired tokens are automatically cleaned up
- Tokens persist across sessions via localStorage

## Testing Notifications

### Test Badge API

1. Log in as Josh
2. Switch to another device/browser
3. Log in as Nini
4. Answer a question
5. Check Josh's device - the app icon should show a badge count

### Test Push Notifications

1. Log in as Josh on iOS/Android (PWA mode - "Add to Home Screen")
2. Close the app or switch to another app
3. Log in as Nini on another device
4. Answer a question OR send a message
5. Josh's device should receive a push notification

## iOS PWA Specific Notes

### Adding to Home Screen

For iOS users to receive notifications, they must:

1. Open jandle in Safari
2. Tap the Share button
3. Tap "Add to Home Screen"
4. Open the app from the home screen icon

### iOS Limitations

- **iOS 16.4+** required for Web Push API
- Notifications only work when app is installed as PWA (not in browser)
- Background notifications are limited compared to native apps
- Rich notifications (images, actions) are not fully supported

### Badge API Advantages on iOS

The Badge API is more reliable than push notifications on iOS:
- Works immediately after "Add to Home Screen"
- No special permissions needed
- Updates even when app is closed
- Shows unread count directly on icon

## Troubleshooting

### "Service Worker registration failed"

Make sure you're running on HTTPS or localhost. Service workers require a secure context.

### "No VAPID key found"

Check that:
1. You generated a VAPID key in Firebase Console
2. You added it to `.env` as `REACT_APP_FIREBASE_VAPID_KEY`
3. You restarted the dev server after adding the key

### Badge not updating

Check browser console for errors. Badge API support:
- ✅ Safari 16.4+ (iOS/macOS)
- ✅ Chrome/Edge (Desktop & Android)
- ❌ Firefox (not yet supported)

### Notifications not arriving

1. Check that device token was saved:
   - Open Firebase Console
   - Go to Realtime Database
   - Check `/deviceTokens/{userId}` exists

2. Check Cloud Functions logs:
   ```bash
   firebase functions:log
   ```

3. Verify notification permission is granted:
   - Check browser/iOS settings
   - Check console for permission status

## Architecture Overview

```
User Action (Answer Question/Send Message)
    ↓
Firebase Realtime Database Update
    ↓
Cloud Function Triggered (sendInboxNotification or sendMessageNotification)
    ↓
Function retrieves device tokens from Firebase
    ↓
Firebase Cloud Messaging sends notification to devices
    ↓
Service Worker receives notification (background)
    OR
Foreground listener receives notification (app open)
    ↓
Badge API updates app icon count
```

## Files Modified/Created

### Created Files:
- `src/services/messagingService.js` - FCM integration
- `src/services/badgeService.js` - Badge API integration
- `public/firebase-messaging-sw.js` - Service worker for background notifications
- `NOTIFICATIONS_SETUP.md` - This file

### Modified Files:
- `src/AppContext.js` - Added notification initialization and badge updates
- `src/index.js` - Service worker registration
- `public/manifest.json` - Updated PWA metadata
- `functions/index.js` - Added notification Cloud Functions
- `.env` - Added VAPID key placeholder

## Next Steps

1. Generate VAPID key and add to `.env`
2. Deploy Cloud Functions: `firebase deploy --only functions`
3. Test on iOS device using "Add to Home Screen"
4. Monitor Firebase Console for function logs and database updates

## Support

For issues or questions:
- Check Firebase Console logs
- Check browser developer console
- Verify all environment variables are set correctly
