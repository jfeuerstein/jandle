# Security Guide

## Overview

This document explains the security measures implemented in Jandle to protect your data and API keys.

## API Key Protection

### Problem
Originally, the Groq API key was stored in the `.env` file and embedded directly into the client-side JavaScript bundle. This meant:
- ❌ Anyone could view your API key in the browser's developer tools
- ❌ The key was exposed in the deployed website's source code
- ❌ Anyone could use your key to make API calls at your expense

### Solution: Firebase Cloud Functions

We now use Firebase Cloud Functions to protect API keys:
- ✅ API keys are stored as Firebase secrets (server-side only)
- ✅ The frontend calls a Cloud Function instead of the API directly
- ✅ The Cloud Function makes the API call with the protected key
- ✅ No sensitive keys are ever sent to the client

**Architecture**:
```
User Browser → Firebase Cloud Function → Groq API
(no API key)   (has secret API key)      (receives request)
```

## Firebase Configuration

### Firebase API Keys (Public)

Firebase API keys in your frontend code are **designed to be public**. They identify your Firebase project but cannot be used to access your data without proper security rules.

From the Firebase documentation:
> "Unlike how API keys are typically used, API keys for Firebase services are not used to control access to backend resources; that can only be done with Firebase Security Rules."

### Security Rules (Protection)

Security rules in `database.rules.json` control who can read/write your data:

```json
{
  "rules": {
    "questionIndex": {
      ".read": true,
      ".write": true,
      ".validate": "newData.hasChildren(['josh', 'nini'])"
    },
    "inbox": {
      ".read": true,
      ".write": true,
      "$user": {
        ".validate": "$user === 'josh' || $user === 'nini'"
      }
    },
    "answers": {
      ".read": true,
      ".write": true,
      "$user": {
        ".validate": "$user === 'josh' || $user === 'nini'"
      }
    }
  }
}
```

**Current Rules**:
- ✅ Data structure validation (ensures correct format)
- ✅ User validation (only 'josh' and 'nini' allowed)
- ⚠️ Open read/write (suitable for a personal two-person app)

**For Production** (if sharing publicly):
You should implement Firebase Authentication and restrict access:

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null",
    "$user": {
      ".validate": "$user === auth.uid"
    }
  }
}
```

## Environment Variables

### Frontend (.env)

**Safe to commit** (but we still gitignore them):
```bash
# These identify your Firebase project (public)
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_PROJECT_ID=...
# etc.
```

**NEVER commit**:
```bash
# ❌ DON'T DO THIS - Secret keys should never be in .env
GROQ_API_KEY=gsk_...
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_...
```

### Backend (Firebase Secrets)

Secret keys are stored using Firebase's secret management:

```bash
# Set a secret
firebase functions:secrets:set GROQ_API_KEY

# Access in function code
const groqApiKey = defineSecret("GROQ_API_KEY");
// Use: groqApiKey.value()
```

## Best Practices

### ✅ DO

1. **Use Cloud Functions for API calls** - Keep keys server-side
2. **Rotate API keys regularly** - Especially if exposed
3. **Monitor usage** - Set up alerts for unusual activity
4. **Use .gitignore** - Never commit .env files
5. **Implement rate limiting** - Prevent abuse
6. **Use Firebase Security Rules** - Control data access
7. **Enable Firebase App Check** - Prevent unauthorized access

### ❌ DON'T

1. **Don't put secrets in .env for client-side code** - They'll be bundled
2. **Don't commit .env files** - Even with "dummy" values
3. **Don't share API keys** - Each developer should have their own
4. **Don't use test mode in production** - Use proper security rules
5. **Don't ignore security warnings** - Address them promptly

## What To Do If Keys Are Exposed

If you accidentally expose an API key:

### 1. Immediately Rotate the Key

**Groq**:
1. Go to https://console.groq.com/keys
2. Delete the exposed key
3. Create a new key
4. Update Firebase secret: `firebase functions:secrets:set GROQ_API_KEY`
5. Redeploy: `firebase deploy --only functions`

**Firebase**:
1. Go to Firebase Console > Project Settings
2. Delete the exposed API key (if you exposed the secret server keys)
3. Create new credentials
4. Update your .env file
5. Redeploy your application

### 2. Check for Unauthorized Usage

- Review Firebase Console > Usage
- Review Groq Console > Usage
- Look for unusual patterns or requests

### 3. Remove from Git History

If committed to git:
```bash
# Use git-filter-repo or BFG Repo-Cleaner
# See: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository
```

### 4. Update Security

- Review and tighten security rules
- Enable Firebase App Check
- Implement rate limiting
- Set up monitoring and alerts

## Checking for Exposed Keys

### In Your Deployed Site

1. Open your deployed website
2. Open DevTools (F12) > Network tab
3. Look for API calls - your Cloud Functions should be the only external calls
4. View source - search for "gsk_" (Groq key prefix)
   - ✅ Should NOT find any keys
   - ❌ If found, keys are exposed

### In Your Build Files

```bash
# Build your app
npm run build

# Search for exposed keys in build files
grep -r "gsk_" build/
grep -r "apiKey" build/

# Should only find Firebase config (which is OK)
```

### In Git History

```bash
# Search git history for secrets
git log -p | grep -i "gsk_\|groq"
```

## Additional Security Measures (Future Enhancements)

### 1. Firebase Authentication

Add user authentication to control access:
- Only authenticated users can access data
- Each user can only access their own data
- Implement sign-in with Google, email, etc.

### 2. Firebase App Check

Prevent unauthorized access to your Cloud Functions:
- Verifies requests come from your app
- Blocks bots and abusive traffic
- Works with reCAPTCHA or device attestation

### 3. Rate Limiting

Implement rate limits in Cloud Functions:
```javascript
// Example: Limit to 10 requests per minute per IP
if (rateLimitExceeded) {
  res.status(429).json({error: 'Rate limit exceeded'});
  return;
}
```

### 4. Cost Controls

Set up budget alerts in Firebase:
- Go to Firebase Console > Usage and billing
- Set up budget alerts
- Configure spending limits

## Questions?

For more information, see:
- [CLOUD_FUNCTIONS_SETUP.md](./CLOUD_FUNCTIONS_SETUP.md) - Cloud Functions setup
- [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) - Firebase configuration
- [Firebase Security Rules](https://firebase.google.com/docs/database/security)
- [Firebase App Check](https://firebase.google.com/docs/app-check)
