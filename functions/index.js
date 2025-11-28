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
    prompt: `You are a creative conversationalist who crafts questions that reveal personality,
    spark debate, and make people think. Generate yes-or-no questions that range from playful
    to philosophical, quirky to profound. Mix in some relationship questions, but also include
    preferences, hypotheticals, hot takes, and personality reveals. Keep it interesting and varied.`,
    userPrompt: (count) =>
      `Generate ${count} unique yes-or-no questions. Make them diverse - some funny, some deep,
    some about preferences, some philosophical. Only include relationship-focused questions occasionally.
    Each should spark conversation beyond just yes/no.
    Return ONLY a JSON array: ["question 1?", "question 2?", "question 3?"]. No other text.`,
  },
  MULTIPLE_CHOICE: {
    id: "multiple_choice",
    prompt: `You are a creative conversationalist who crafts questions that reveal personality
    and preferences. Generate multiple choice questions with 3-4 interesting options that make
    people think about what defines them. Mix serious and playful, include personality types,
    preferences, hypotheticals, and occasional relationship questions. The options should be
    distinct enough to reveal something meaningful.`,
    userPrompt: (count) =>
      `Generate ${count} unique multiple choice questions. Variety is key - personality types,
    preferences, priorities, hypotheticals, ethics, fun scenarios. Include relationship stuff
    sometimes but not always. 3-4 options each. Return ONLY a JSON array:
    [{"question": "text?", "options": ["opt1", "opt2", "opt3"]}, ...]. No other text.`,
  },
  RANKING: {
    id: "ranking",
    prompt: `You are a creative conversationalist who crafts ranking questions that force
    interesting trade-offs and reveal priorities. Generate questions with 4-6 items to rank
    by preference, importance, or appeal. Mix fun and serious topics - superpowers, life
    priorities, food, experiences, values. Occasionally include relationship topics but keep
    it varied and interesting.`,
    userPrompt: (count) =>
      `Generate ${count} unique ranking questions with 4-6 items each. Mix it up - rank dream
    superpowers, life priorities, vacation types, foods, personality traits, guilty pleasures.
    Include relationship priorities sometimes but not predominantly. Return ONLY a JSON array:
    [{"question": "Rank these by preference:", "items": ["item1", "item2", "item3", "item4"]}, ...].
    No other text.`,
  },
  SHORT_FORM: {
    id: "short_form",
    prompt: `You are a creative conversationalist who asks questions that get to the heart of
    who someone is. Generate questions requiring 1-2 sentence answers that reveal preferences,
    experiences, hot takes, and personality. Mix nostalgic, funny, thought-provoking, and
    occasionally relationship-focused questions. Keep it snappy and engaging.`,
    userPrompt: (count) =>
      `Generate ${count} unique short-answer questions (1-2 sentence responses). Mix topics -
    childhood memories, unpopular opinions, bucket list items, pet peeves, favorite things,
    fun facts about themselves. Include relationship questions occasionally. Return ONLY a
    JSON array: [{"question": "What's your most controversial food opinion?"}, ...]. No other text.`,
  },
  LONG_FORM: {
    id: "long_form",
    prompt: `You are a creative conversationalist who presents interesting scenarios that prompt
    detailed responses. Generate brief scenarios (2-3 sentences) followed by open-ended questions.
    Mix ethical dilemmas, funny hypotheticals, nostalgia prompts, relationship scenarios,
    philosophical questions, and "what would you do" situations. Make them engaging and discussion-worthy.`,
    userPrompt: (count) =>
      `Generate ${count} unique scenario-based questions. Each has a 2-3 sentence setup and an
    open question. Mix ethical dilemmas, funny situations, relationship scenarios, philosophical
    prompts, time-travel questions, superpowers. Keep it varied and interesting. Return ONLY a
    JSON array: [{"scenario": "scenario...", "question": "What would you do?"}, ...]. No other text.`,
  },
  WOULD_YOU_RATHER: {
    id: "would_you_rather",
    prompt: `You are a creative conversationalist who creates compelling "would you rather" questions.
    Generate questions with two distinct options that force interesting trade-offs. Mix silly and
    serious, practical and absurd, superpowers and real-world choices. Occasionally include
    relationship scenarios, but mostly focus on revealing personality through tough choices.
    Make both options appealing in different ways.`,
    userPrompt: (count) =>
      `Generate ${count} unique "would you rather" questions. Each has two options that create
    genuine dilemmas. Mix absurd (fight-sized ducks), practical (money vs time), superpowers,
    ethical choices, lifestyle preferences. Sometimes include relationship options but keep it varied.
    Return ONLY a JSON array: [{"question": "Would you rather...", "option1": "first choice",
    "option2": "second choice"}, ...]. No other text.`,
  },
  HOT_TAKE: {
    id: "hot_take",
    prompt: `You are a creative conversationalist who prompts people to share their spiciest takes
    and unpopular opinions. Generate questions that ask for controversial, contrarian, or uniquely
    personal perspectives. Topics can range from food and entertainment to life philosophies and
    social norms. Make them fun and judgment-free, encouraging honest hot takes. Occasionally
    include relationship opinions but keep it diverse.`,
    userPrompt: (count) =>
      `Generate ${count} unique "hot take" or "unpopular opinion" questions. Ask about food,
    movies, music, social norms, daily habits, common beliefs, overrated/underrated things.
    Encourage spicy but fun takes. Sometimes ask about relationship opinions but not too often.
    Return ONLY a JSON array: [{"question": "What's your most unpopular opinion about breakfast
    foods?"}, ...]. No other text.`,
  },
  THIS_OR_THAT: {
    id: "this_or_that",
    prompt: `You are a creative conversationalist who creates rapid-fire "this or that" questions
    that reveal preferences and personality. Generate simple A vs B questions - no elaborate
    explanations needed. Mix lifestyle preferences, personality traits, activities, seasons,
    foods, social situations. Keep them punchy and fun. Occasionally include relationship
    preferences but mostly focus on personal taste and style.`,
    userPrompt: (count) =>
      `Generate ${count} unique "this or that" questions. Simple A vs B format. Mix: coffee vs tea,
    mountains vs beach, cats vs dogs, introvert vs extrovert, sweet vs savory, summer vs winter,
    texting vs calling. Include some relationship preferences occasionally. Return ONLY a JSON array:
    [{"question": "This or that:", "option1": "option A", "option2": "option B"}, ...]. No other text.`,
  },
  HYPOTHETICAL: {
    id: "hypothetical",
    prompt: `You are a creative conversationalist who dreams up fascinating hypothetical scenarios.
    Generate imaginative "what if" questions and impossible scenarios that make people think
    creatively. Mix superpowers, time travel, magical abilities, alternate realities, unlimited
    resources, rule-breaking possibilities. Go wild with creativity. Relationship scenarios can
    appear sometimes but keep the focus on imagination and personality.`,
    userPrompt: (count) =>
      `Generate ${count} unique hypothetical questions. Think: time travel destinations, superpower
    choices, dinner with anyone dead or alive, elimination of minor inconveniences, magical abilities,
    alternate career paths, unlimited budget scenarios. Mix profound and silly. Sometimes include
    relationship hypotheticals. Return ONLY a JSON array: [{"question": "If you could eliminate one
    minor inconvenience from existence, what would it be?"}, ...]. No other text.`,
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
          const systemPrompt = `You are a creative conversationalist who creates thought-provoking
questions that reveal personality and spark great conversations. You will generate questions of
different types as specified. Each type has specific formatting requirements.`;

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

          const userPrompt = `Generate the following questions:
${typeRequests.join("\n")}

Return ONLY a JSON object with this exact structure:
{
  "yes_no": ["question 1?", "question 2?", ...],
  "multiple_choice": [{"question": "text?", "options": ["opt1", "opt2", "opt3"]}, ...],
  "ranking": [{"question": "text", "items": ["item1", "item2", "item3", "item4"]}, ...],
  "short_form": [{"question": "text?"}, ...],
  "long_form": [{"scenario": "scenario text...", "question": "question?"}, ...],
  "would_you_rather": [{"question": "Would you rather...", "option1": "choice 1", "option2": "choice 2"}, ...],
  "hot_take": [{"question": "What's your hot take on..."}, ...],
  "this_or_that": [{"question": "This or that:", "option1": "option A", "option2": "option B"}, ...],
  "hypothetical": [{"question": "If you could..."}, ...]
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
