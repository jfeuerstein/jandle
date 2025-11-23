/**
 * Cloud Functions for Jandle
 * Handles server-side API calls to protect API keys
 */

const {onCall, HttpsError} = require("firebase-functions/v2/https");
const {defineSecret} = require("firebase-functions/params");
const logger = require("firebase-functions/logger");

// Define the secret for Groq API key
const groqApiKey = defineSecret("GROQ_API_KEY");

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
 * Data: { questionType: 'yes_no' | 'multiple_choice' | 'long_form', count: number }
 */
exports.generateQuestions = onCall(
    {
      secrets: [groqApiKey],
      maxInstances: 10,
    },
    async (request) => {
      try {
        const {questionType, count} = request.data;

        // Validate input
        if (!questionType || !count) {
          throw new HttpsError(
              "invalid-argument",
              "Missing required parameters: questionType and count",
          );
        }

        if (!QUESTION_TYPES[questionType.toUpperCase()]) {
          throw new HttpsError(
              "invalid-argument",
              `Invalid question type: ${questionType}`,
          );
        }

        if (typeof count !== "number" || count < 1 || count > 50) {
          throw new HttpsError(
              "invalid-argument",
              "Count must be a number between 1 and 50",
          );
        }

        const typeConfig = QUESTION_TYPES[questionType.toUpperCase()];
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
