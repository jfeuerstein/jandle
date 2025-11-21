# Groq LLM Integration Setup Guide

This app uses Groq's free LLM API to generate unique questions dynamically. Follow these steps to set it up:

## 1. Get Your Free Groq API Key

1. Visit [https://console.groq.com](https://console.groq.com)
2. Sign up for a free account (no credit card required)
3. Navigate to [API Keys](https://console.groq.com/keys)
4. Click "Create API Key"
5. Copy your new API key

## 2. Configure Your Environment

1. Create a `.env` file in the root directory of the project:
   ```bash
   cp .env.example .env
   ```

2. Open the `.env` file and add your Groq API key:
   ```
   REACT_APP_GROQ_API_KEY=your_groq_api_key_here
   ```

3. Save the file

## 3. Run the App

```bash
npm start
```

The app will now generate 10 unique questions on each load using Groq's LLM!

## How It Works

- **Default Behavior**: Questions are generated dynamically using Groq's Llama 3.1 model
- **Fallback**: If the API fails or no key is configured, the app falls back to 3 hardcoded questions
- **Free Tier**: Groq's free tier includes 14,400 requests/day - way more than needed for 2 users!
- **Speed**: Groq is extremely fast (100+ tokens/second), so question generation is nearly instant

## Troubleshooting

### Questions aren't generating
1. Check the browser console for errors
2. Verify your API key is correctly set in `.env`
3. Make sure you restarted the app after adding the `.env` file
4. Check that the `.env` file is in the root directory (same level as `package.json`)

### Using fallback questions
- This is normal if:
  - No API key is configured
  - Network connection issues
  - Groq API is temporarily unavailable
- The app will automatically use 3 backup questions

## Cost

**FREE!** Groq's free tier is more than sufficient for this app:
- 14,400 requests per day
- 7,000 requests per minute
- With 2 users generating 10 questions per session, you can use the app hundreds of times per day
