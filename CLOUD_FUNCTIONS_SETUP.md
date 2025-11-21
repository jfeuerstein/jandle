# Cloud Functions Setup Guide

This guide will help you set up Firebase Cloud Functions to protect your API keys and handle server-side operations.

## Why Cloud Functions?

The Groq API key is a **secret** that should never be exposed in client-side code. Cloud Functions allow us to:
- Keep API keys secure on the server
- Control access and rate limiting
- Add authentication and authorization
- Process sensitive operations server-side

## Prerequisites

- Completed Firebase setup (see FIREBASE_SETUP.md)
- Firebase CLI installed: `npm install -g firebase-tools`
- A Groq API key from https://console.groq.com/keys

## Step 1: Login to Firebase CLI

```bash
firebase login
```

Follow the prompts to authenticate with your Google account.

## Step 2: Initialize Firebase in Your Project

If you haven't already initialized Firebase in this project:

```bash
firebase init
```

Select:
- **Functions**: Configure Cloud Functions
- **Database**: Configure Realtime Database Rules
- **Hosting**: Configure hosting (optional, for deployment)

When prompted:
- Choose "Use an existing project" and select your Firebase project
- Choose JavaScript (not TypeScript) for functions
- Install dependencies with npm: Yes

## Step 3: Update Firebase Project ID

Edit `.firebaserc` and replace `your-project-id` with your actual Firebase project ID:

```json
{
  "projects": {
    "default": "YOUR_ACTUAL_PROJECT_ID"
  }
}
```

## Step 4: Install Function Dependencies

```bash
cd functions
npm install
cd ..
```

## Step 5: Set Up the Groq API Key Secret

Firebase Cloud Functions uses secrets for sensitive data. Set your Groq API key:

```bash
firebase functions:secrets:set GROQ_API_KEY
```

When prompted, paste your Groq API key.

## Step 6: Deploy Functions

Deploy your Cloud Functions to Firebase:

```bash
firebase deploy --only functions
```

This will:
- Upload your function code
- Make it available at a secure HTTPS endpoint
- Automatically scale based on usage

## Step 7: Deploy Database Security Rules

Deploy your security rules:

```bash
firebase deploy --only database
```

## Step 8: Test the Functions

After deployment, you can test the function:

1. Start your React app: `npm start`
2. Try generating questions - they should now be generated via Cloud Functions
3. Check the Firebase Console > Functions to see logs and usage

## Local Development (Optional)

To test functions locally before deploying:

### Install the Firebase Emulator

```bash
firebase init emulators
```

Select "Functions Emulator" and "Database Emulator".

### Start the Emulator

```bash
firebase emulators:start
```

### Configure Your App for Local Testing

In `src/services/groqService.js`, uncomment these lines:

```javascript
import { connectFunctionsEmulator } from 'firebase/functions';
connectFunctionsEmulator(functions, 'localhost', 5001);
```

Now your app will use the local emulator instead of production functions.

**Remember to comment these lines out before deploying to production!**

## Monitoring and Logs

### View Function Logs

```bash
firebase functions:log
```

Or view them in the Firebase Console under Functions > Logs.

### View Secrets

To see which secrets are configured (but not their values):

```bash
firebase functions:secrets:access GROQ_API_KEY
```

### Update a Secret

If you need to rotate your API key:

```bash
firebase functions:secrets:set GROQ_API_KEY
firebase deploy --only functions
```

## Cost Considerations

Firebase Cloud Functions pricing:
- **Free tier**: 2M invocations/month, 400K GB-seconds, 200K CPU-seconds
- After free tier: $0.40 per million invocations

For a typical usage app, you'll likely stay within the free tier. Monitor usage in Firebase Console > Functions > Usage.

## Security Best Practices

1. ✅ **Never commit API keys** - They're now stored as Firebase secrets
2. ✅ **Keep .env files local** - They're in .gitignore
3. ✅ **Use security rules** - Implemented in database.rules.json
4. ✅ **Monitor usage** - Set up budget alerts in Firebase Console
5. ✅ **Rate limiting** - Consider implementing rate limits in functions if needed

## Troubleshooting

### Error: "functions/not-found"

The function isn't deployed or the name doesn't match.

**Solution**:
```bash
firebase deploy --only functions
```

### Error: "functions/unauthenticated"

The function requires authentication but the user isn't authenticated.

**Solution**: Implement Firebase Authentication or update function permissions.

### Error: "Secret GROQ_API_KEY not found"

The secret hasn't been set.

**Solution**:
```bash
firebase functions:secrets:set GROQ_API_KEY
firebase deploy --only functions
```

### Functions are slow to start (cold start)

First invocation after idle period may be slow (3-5 seconds).

**Solution**:
- Use min instances for critical functions (costs more)
- Accept cold starts as normal behavior

### Local emulator won't start

**Solution**:
- Check if ports 5001, 9000 are available
- Try: `firebase emulators:start --only functions`
- Check Java is installed (required for emulators)

## Next Steps

- Implement user authentication with Firebase Auth
- Add more restrictive security rules
- Set up monitoring and alerts
- Consider implementing rate limiting
- Add error tracking (e.g., Sentry)

## Additional Resources

- [Firebase Cloud Functions Documentation](https://firebase.google.com/docs/functions)
- [Cloud Functions Pricing](https://firebase.google.com/pricing)
- [Managing Secrets](https://firebase.google.com/docs/functions/config-env)
- [Security Rules](https://firebase.google.com/docs/database/security)
