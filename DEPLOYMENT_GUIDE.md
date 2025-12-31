# Question Pool Refactoring - Deployment Guide

## Overview
The app has been refactored to generate questions in batches every 10 minutes and store them in Firebase, preventing rate limiting issues.

## What Changed

### Firebase Database Structure
New database path: `/questionPools`
```
/questionPools
  /josh
    /questions: [array of question objects]
    /lastGenerated: timestamp
    /lastIndex: current question index
  /nini
    /questions: [array of question objects]
    /lastGenerated: timestamp
    /lastIndex: current question index
```

### Cloud Functions
1. **generateQuestionPools** - Scheduled function (runs every 10 minutes)
   - Checks each user's question pool
   - Generates new questions when pool has < 5 remaining questions
   - Maintains a pool of 12 questions per user

2. **initializeQuestionPools** - One-time callable function
   - Creates initial question pools for both users
   - Only needs to be called once after deployment

### Client Changes
- Removed on-demand question generation from AppContext
- Questions now fetched from Firebase database in real-time
- Removed localStorage caching (no longer needed)
- Updated question index tracking to use `questionPools/lastIndex`

## Deployment Steps

### 1. Deploy Cloud Functions
```bash
cd functions
npm install
firebase deploy --only functions
```

### 2. Initialize Question Pools
After deployment, call the initialization function once to populate initial questions:

```bash
# Using Firebase CLI
firebase functions:shell
# Then in the shell:
initializeQuestionPools()
```

Or use the Firebase Console to manually call the function:
1. Go to Firebase Console > Functions
2. Find `initializeQuestionPools`
3. Click "Test function" and run it

### 3. Deploy Frontend
```bash
npm run build
firebase deploy --only hosting
```

### 4. Verify Deployment
1. Check Firebase Realtime Database Console
   - Verify `/questionPools/josh` and `/questionPools/nini` exist
   - Each should have 12 questions and `lastIndex: 0`

2. Test the app
   - Log in as both users
   - Answer questions and verify they advance correctly
   - Questions should not overlap between users

3. Monitor Cloud Scheduler
   - In Firebase Console > Functions > Logs
   - Verify `generateQuestionPools` runs every 10 minutes
   - Check for any errors in generation

## Rate Limiting Solution

### Before
- Questions generated on-demand when user loads app
- Multiple simultaneous users = multiple API calls
- Hit rate limits quickly

### After
- Questions pre-generated every 10 minutes by Cloud Scheduler
- Only 1 scheduled job runs (max 2 API calls per 10 min: one per user)
- Users fetch pre-generated questions from database
- No rate limiting issues

## Monitoring

### Cloud Function Logs
```bash
firebase functions:log --only generateQuestionPools
```

### Database Rules
Ensure your Firebase Realtime Database rules allow read/write to questionPools:
```json
{
  "rules": {
    "questionPools": {
      ".read": true,
      ".write": true
    }
  }
}
```

## Rollback Plan
If issues occur:
1. The old `generateQuestions` callable function still exists
2. Can temporarily revert AppContext changes
3. Database structure is additive (doesn't break existing data)

## Future Improvements
- Add admin panel to manually trigger question generation
- Implement question quality monitoring
- Add analytics for question types users prefer
- Consider increasing pool size if users go through questions too quickly
