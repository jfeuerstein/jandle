/**
 * Cloud Functions for Jandle
 * Handles server-side API calls to protect API keys
 */

const {onCall, HttpsError} = require("firebase-functions/v2/https");
const {defineSecret} = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

// Initialize Firebase Admin
admin.initializeApp();

// Define the secret for Groq API key
const groqApiKey = defineSecret("GROQ_API_KEY");

/**
 * Rate limit configuration
 */
const RATE_LIMIT_COLLECTION = "system";
const RATE_LIMIT_DOC = "groqRateLimit";
const RATE_LIMIT_DURATION_MS = 30 * 1000; // 30 sec

/**
 * Check if we're currently in a rate limit cooldown period
 */
async function checkRateLimit() {
  const db = admin.firestore();
  const rateLimitRef = db.collection(RATE_LIMIT_COLLECTION).doc(RATE_LIMIT_DOC);
  const doc = await rateLimitRef.get();

  if (!doc.exists) {
    return {isLimited: false};
  }

  const data = doc.data();
  const now = Date.now();
  const cooldownEnds = data.cooldownEnds;

  if (cooldownEnds && now < cooldownEnds) {
    const remainingSeconds = Math.ceil((cooldownEnds - now) / 1000);
    return {
      isLimited: true,
      remainingSeconds,
      cooldownEnds,
    };
  }

  return {isLimited: false};
}

/**
 * Set a rate limit cooldown period
 */
async function setRateLimit() {
  const db = admin.firestore();
  const rateLimitRef = db.collection(RATE_LIMIT_COLLECTION).doc(RATE_LIMIT_DOC);
  const cooldownEnds = Date.now() + RATE_LIMIT_DURATION_MS;

  await rateLimitRef.set({
    cooldownEnds,
    lastRateLimitHit: admin.firestore.FieldValue.serverTimestamp(),
  });

  logger.warn(`Rate limit hit. Cooldown set until ${new Date(cooldownEnds).toISOString()}`);
  return cooldownEnds;
}

/**
 * Question type configurations
 * These match the frontend QUESTION_TYPES config
 */
const QUESTION_TYPES = {
  YES_NO: {
    id: "yes_no",
    prompt: `You are a relationship expert who creates deep, thought-provoking questions for couples. 
    Generate yes-or-no questions that are intimate, personal, and promote meaningful conversations. 
    These should be questions that can be answered with yes or no, but encourage discussion afterward.`,
    userPrompt: (count) =>
      `Generate ${count} unique yes-or-no questions for couples. 
    Each question should be answerable with yes or no, but thought-provoking enough to spark conversation. 
    Return ONLY a JSON array of questions in this exact format: ["question 1?", "question 2?", "question 3?"]. 
    No other text, just the JSON array.`,
  },
  MULTIPLE_CHOICE: {
    id: "multiple_choice",
    prompt: `You are a relationship expert who creates deep, thought-provoking questions for couples.
    Generate multiple choice questions that are intimate, personal, and promote meaningful conversations.
    Each question should have 3-4 interesting answer options that reveal something about the person's values,
    preferences, or perspectives.`,
    userPrompt: (count) =>
      `Generate ${count} unique multiple choice questions for couples.
    Each question should have 3-4 answer options. Return ONLY a JSON array in this exact format:
    [{"question": "question text?", "options": ["option 1", "option 2", "option 3"]}, ...].
    No other text, just the JSON array.`,
  },
  RANKING: {
    id: "ranking",
    prompt: `You are a relationship expert who creates deep, thought-provoking questions for couples.
    Generate ranking questions that are intimate, personal, and promote meaningful conversations.
    Each question should provide 4-6 items that the person must rank in order of preference, importance, or priority.
    The items should be interesting and reveal something about the person's values, priorities, or perspectives.`,
    userPrompt: (count) =>
      `Generate ${count} unique ranking questions for couples.
    Each question should have 4-6 items to be ranked in order. Return ONLY a JSON array in this exact format:
    [{"question": "Rank these relationship priorities:", "items": ["item 1", "item 2", "item 3", "item 4"]}, ...].
    No other text, just the JSON array.`,
  },
  SHORT_FORM: {
    id: "short_form",
    prompt: `You are a relationship expert who creates deep, thought-provoking questions for couples.
    Generate questions that enable short responses that will lead to meaningful conversations.
    These should encourage short, thoughtful responses.`,
    userPrompt: (count) =>
      `Generate ${count} unique questions for couples that require a short, thoughtful response (1-2 sentences).
    Return ONLY a JSON array in this exact format: [{"question": "What is your favorite memory together?"}, ...].
    No other text, just the JSON array.`,
  },
  LONG_FORM: {
    id: "long_form",
    prompt: `You are a relationship expert who creates deep, thought-provoking questions for couples.
    Generate questions that include a brief scenario or story (2-3 sentences)
    followed by an open-ended question that asks for the person's opinion, reaction, or perspective on the scenario.
    These should encourage detailed, thoughtful responses.`,
    userPrompt: (count) =>
      `Generate ${count} unique scenario-based questions for couples.
    Each should include a brief story or scenario (2-3 sentences) followed by a question asking for their opinion.
    Return ONLY a JSON array in this exact format:
    [{"scenario": "A brief scenario description...", "question": "What would you do?"}, ...].
    No other text, just the JSON array.`,
  },
};

/**
 * Generate questions using Groq API
 * Callable function for Firebase
 * Data:
 *   Single type: { questionType: 'yes_no' | 'multiple_choice' | 'long_form', count: number }
 *   Batch mode: { batch: true, typeCounts: { yes_no: 2, multiple_choice: 2, ... } }
 */
exports.generateQuestions = onCall(
    {
      secrets: [groqApiKey],
      maxInstances: 10,
    },
    async (request) => {
      try {
        // Check if we're in a rate limit cooldown period
        const rateLimitStatus = await checkRateLimit();
        if (rateLimitStatus.isLimited) {
          logger.warn(`Request blocked due to rate limit. ${rateLimitStatus.remainingSeconds}s remaining`);
          throw new HttpsError(
              "resource-exhausted",
              `Rate limit active. Please try again in ${rateLimitStatus.remainingSeconds} seconds.`,
              {
                remainingSeconds: rateLimitStatus.remainingSeconds,
                cooldownEnds: rateLimitStatus.cooldownEnds,
              },
          );
        }

        const {questionType, count, batch, typeCounts} = request.data;

        // Handle batch mode: generate multiple question types in one request
        if (batch && typeCounts) {
          logger.info("Batch mode: generating questions for multiple types");

          // Build a combined prompt that generates all question types at once
          const systemPrompt = `You are a relationship expert who creates deep, thought-provoking questions for couples.
You will generate questions of different types as specified. Each type has specific formatting requirements.`;

          const typeRequests = [];
          Object.entries(typeCounts).forEach(([typeId, typeCount]) => {
            if (typeCount > 0) {
              const questionTypeKey = typeId.toUpperCase().replace(/-/g, "_");
              const typeConfig = QUESTION_TYPES[questionTypeKey];
              if (typeConfig) {
                typeRequests.push(`- ${typeCount} ${typeId} questions`);
              }
            }
          });

          const userPrompt = `Generate the following questions for couples:
${typeRequests.join("\n")}

Return ONLY a JSON object with this exact structure:
{
  "yes_no": ["question 1?", "question 2?", ...],
  "multiple_choice": [{"question": "text?", "options": ["opt1", "opt2", "opt3"]}, ...],
  "ranking": [{"question": "text", "items": ["item1", "item2", "item3", "item4"]}, ...],
  "short_form": [{"question": "text?"}, ...],
  "long_form": [{"scenario": "scenario text...", "question": "question?"}, ...]
}

Include only the question types requested above. No other text, just the JSON object.`;

          // Call Groq API once for all types
          const groqResponse = await fetch(
              "https://api.groq.com/openai/v1/chat/completions",
              {
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${groqApiKey.value()}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  model: "llama-3.1-8b-instant",
                  messages: [
                    {role: "system", content: systemPrompt},
                    {role: "user", content: userPrompt},
                  ],
                  temperature: 0.9,
                  max_tokens: 3000,
                }),
              },
          );

          if (!groqResponse.ok) {
            const errorText = await groqResponse.text();
            logger.error("Groq API error:", groqResponse.status, errorText);

            if (groqResponse.status === 429) {
              const cooldownEnds = await setRateLimit();
              throw new HttpsError(
                  "resource-exhausted",
                  "Rate limit exceeded. Question generation paused for 10 minutes.",
                  {
                    cooldownEnds,
                    remainingSeconds: Math.ceil(RATE_LIMIT_DURATION_MS / 1000),
                  },
              );
            }

            throw new HttpsError(
                "internal",
                `Groq API error: ${groqResponse.status}`,
            );
          }

          const data = await groqResponse.json();
          const content = data.choices[0]?.message?.content;

          if (!content) {
            logger.error("No content in Groq API response");
            throw new HttpsError(
                "internal",
                "No content in Groq API response",
            );
          }

          const parsedContent = JSON.parse(content.trim());

          return {
            success: true,
            batch: true,
            questions: parsedContent,
          };
        }

        // Original single-type mode
        // Validate input
        if (!questionType || !count) {
          throw new HttpsError(
              "invalid-argument",
              "Missing required parameters: questionType and count",
          );
        }

        // Convert question type ID to uppercase key (e.g., "short_form" -> "SHORT_FORM")
        const questionTypeKey = questionType.toUpperCase().replace(/-/g, "_");

        if (!QUESTION_TYPES[questionTypeKey]) {
          throw new HttpsError(
              "invalid-argument",
              `Invalid question type: ${questionType}.
              Valid types: ${Object.keys(QUESTION_TYPES).map((k) => k.toLowerCase()).join(", ")}`,
          );
        }

        if (typeof count !== "number" || count < 1 || count > 50) {
          throw new HttpsError(
              "invalid-argument",
              "Count must be a number between 1 and 50",
          );
        }

        const typeConfig = QUESTION_TYPES[questionTypeKey];
        logger.info(`Generating ${count} ${questionType} questions`);

        // Call Groq API
        const groqResponse = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${groqApiKey.value()}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [
                  {
                    role: "system",
                    content: typeConfig.prompt,
                  },
                  {
                    role: "user",
                    content: typeConfig.userPrompt(count),
                  },
                ],
                temperature: 0.9,
                max_tokens: 2000,
              }),
            },
        );

        if (!groqResponse.ok) {
          const errorText = await groqResponse.text();
          logger.error("Groq API error:", groqResponse.status, errorText);

          // If we hit a 429 rate limit error, set a 10-minute cooldown
          if (groqResponse.status === 429) {
            const cooldownEnds = await setRateLimit();
            throw new HttpsError(
                "resource-exhausted",
                "Rate limit exceeded. Question generation paused for 10 minutes.",
                {
                  cooldownEnds,
                  remainingSeconds: Math.ceil(RATE_LIMIT_DURATION_MS / 1000),
                },
            );
          }

          throw new HttpsError(
              "internal",
              `Groq API error: ${groqResponse.status}`,
          );
        }

        const data = await groqResponse.json();
        const content = data.choices[0]?.message?.content;

        if (!content) {
          logger.error("No content in Groq API response");
          throw new HttpsError(
              "internal",
              "No content in Groq API response",
          );
        }

        // Parse the JSON response
        const parsedContent = JSON.parse(content.trim());

        return {
          success: true,
          questions: parsedContent,
          questionType: typeConfig.id,
        };
      } catch (error) {
        logger.error("Error generating questions:", error);
        // If it's already an HttpsError, rethrow it
        if (error instanceof HttpsError) {
          throw error;
        }
        // Otherwise, wrap it in an HttpsError
        throw new HttpsError(
            "internal",
            error.message || "Internal server error",
        );
      }
    },
);
