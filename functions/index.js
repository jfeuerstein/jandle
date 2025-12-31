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
    prompt: `You are a creative storyteller who generates engaging Reddit-style stories inspired by
    popular subreddits like "Am I The Asshole" (AITA), "Am I Overreacting" (AIOR), "Do I Have a
    Point" (DIHAP), and similar formats. Create realistic, relatable scenarios (6-10 sentences)
    about everyday conflicts, dilemmas, or situations where someone needs perspective. Include
    family drama, workplace conflicts, friend disagreements, relationship issues, parenting decisions,
    social situations, and petty disputes. Make them feel authentic and discussion-worthy.`,
    userPrompt: (count) =>
      `Generate ${count} unique Reddit-style story prompts. Each should be 6-10 sentences describing
    a realistic conflict or situation, followed by a question asking for opinions. Mix different
    formats: "AITA for...", "Am I overreacting...", "Do I have a point...", "Should I have...",
    "Was I wrong to...". Include various scenarios: family drama, workplace conflicts, friendship
    issues, neighbor disputes, wedding drama, parenting decisions, social faux pas, relationship
    boundaries. Make them feel real and relatable. Return ONLY a JSON array:
    [{"scenario": "story description...", "question": "AITA for [action]?"}, ...]. No other text.`,
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
 *   Note: Batch mode makes separate API calls for each type using full prompts for better quality
 */
exports.generateQuestions = onCall(
    {
      secrets: [groqApiKey],
      maxInstances: 10,
    },
    async (request) => {
      try {
        const {questionType, count, batch, typeCounts} = request.data;

        // Handle batch mode: generate multiple question types using individual prompts
        if (batch && typeCounts) {
          logger.info("Batch mode: generating questions for multiple types with full prompts");

          const allResults = {};

          // Generate each question type separately with its full detailed prompt
          for (const [typeId, typeCount] of Object.entries(typeCounts)) {
            if (typeCount > 0) {
              const questionTypeKey = typeId.toUpperCase().replace(/-/g, "_");
              const typeConfig = QUESTION_TYPES[questionTypeKey];

              if (!typeConfig) {
                logger.warn(`Unknown question type: ${typeId}`);
                continue;
              }

              logger.info(`Generating ${typeCount} ${typeId} questions with full prompt`);

              // Call Groq API with the specific type's full prompt
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
                          content: typeConfig.userPrompt(typeCount),
                        },
                      ],
                      temperature: 0.9,
                      max_tokens: 2000,
                    }),
                  },
              );

              if (!groqResponse.ok) {
                const errorText = await groqResponse.text();
                logger.error(`Groq API error for ${typeId}:`, groqResponse.status, errorText);

                throw new HttpsError(
                    "internal",
                    `Groq API error for ${typeId}: ${groqResponse.status}`,
                );
              }

              const data = await groqResponse.json();
              logger.info(`Groq API response for ${typeId}:`, JSON.stringify(data, null, 2));

              const content = data.choices[0]?.message?.content;

              if (!content) {
                logger.error(`No content in Groq API response for ${typeId}`);
                throw new HttpsError(
                    "internal",
                    `No content in Groq API response for ${typeId}`,
                );
              }

              logger.info(`Content for ${typeId}:`, content);

              const parsedContent = JSON.parse(content.trim());
              logger.info(`Parsed content for ${typeId}:`, JSON.stringify(parsedContent, null, 2));
              allResults[typeId] = parsedContent;
            }
          }

          return {
            success: true,
            batch: true,
            questions: allResults,
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

          throw new HttpsError(
              "internal",
              `Groq API error: ${groqResponse.status}`,
          );
        }

        const data = await groqResponse.json();
        logger.info("Groq API response:", JSON.stringify(data, null, 2));

        const content = data.choices[0]?.message?.content;

        if (!content) {
          logger.error("No content in Groq API response");
          throw new HttpsError(
              "internal",
              "No content in Groq API response",
          );
        }

        logger.info("Content:", content);

        // Parse the JSON response
        const parsedContent = JSON.parse(content.trim());
        logger.info("Parsed content:", JSON.stringify(parsedContent, null, 2));

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

/**
 * Cloud Function to send push notifications when inbox items are added
 * Triggers when a new question is answered and added to the other user's inbox
 */
exports.sendInboxNotification = require("firebase-functions/v2/database")
    .onValueWritten("/inbox/{userId}", async (event) => {
      const userId = event.params.userId;
      const newData = event.data.after.val();
      const oldData = event.data.before.val();

      // Only send notification if new items were added
      if (!newData || !Array.isArray(newData)) {
        return null;
      }

      const newCount = newData.length;
      const oldCount = oldData && Array.isArray(oldData) ? oldData.length : 0;

      if (newCount <= oldCount) {
        return null; // No new items
      }

      const newItems = newCount - oldCount;
      logger.info(`New inbox items for ${userId}: ${newItems}`);

      // Get user's device tokens
      const tokensSnapshot = await admin.database()
          .ref(`deviceTokens/${userId}`).once("value");
      const tokens = tokensSnapshot.val();

      if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
        logger.info(`No device tokens found for ${userId}`);
        return null;
      }

      // Create notification payload
      const payload = {
        notification: {
          title: "New Question Waiting!",
          body: newItems === 1 ?
          "Your partner answered a question. Your turn!" :
          `${newItems} new questions waiting for you!`,
        },
        data: {
          type: "inbox",
          url: "/inbox",
          tag: "inbox-notification",
        },
      };

      // Send to all tokens
      try {
        const response = await admin.messaging().sendEachForMulticast({
          tokens: tokens,
          notification: payload.notification,
          data: payload.data,
        });

        logger.info(`Successfully sent ${response.successCount} notifications`);

        // Clean up any invalid tokens
        if (response.failureCount > 0) {
          const validTokens = tokens.filter((token, index) => {
            return response.responses[index].success;
          });
          await admin.database()
              .ref(`deviceTokens/${userId}`).set(validTokens);
        }

        return response;
      } catch (error) {
        logger.error("Error sending notification:", error);
        return null;
      }
    });

/**
 * Cloud Function to send push notifications when new messages are added
 * Triggers when a message is added to an answer's messages array
 */
exports.sendMessageNotification = require("firebase-functions/v2/database")
    .onValueWritten("/answers/{userId}/{answerId}/messages", async (event) => {
      const userId = event.params.userId;
      const newData = event.data.after.val();
      const oldData = event.data.before.val();

      // Only send notification if new messages were added
      if (!newData || !Array.isArray(newData)) {
        return null;
      }

      const newCount = newData.length;
      const oldCount = oldData && Array.isArray(oldData) ? oldData.length : 0;

      if (newCount <= oldCount) {
        return null; // No new messages
      }

      const latestMessage = newData[newData.length - 1];
      const senderUser = latestMessage.user;

      // Don't notify the sender
      if (senderUser === userId) {
        return null;
      }

      logger.info(`New message for ${userId} from ${senderUser}`);

      // Get user's device tokens
      const tokensSnapshot = await admin.database()
          .ref(`deviceTokens/${userId}`).once("value");
      const tokens = tokensSnapshot.val();

      if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
        logger.info(`No device tokens found for ${userId}`);
        return null;
      }

      // Get the answer to find the question text
      const answerId = event.params.answerId;
      const answerSnapshot = await admin.database()
          .ref(`answers/${userId}/${answerId}`).once("value");
      const answer = answerSnapshot.val();

      // Create notification payload
      const senderName = senderUser === "josh" ? "Josh" : "Nini";
      const messagePreview = latestMessage.text.length > 50 ?
      latestMessage.text.substring(0, 50) + "..." :
      latestMessage.text;

      const payload = {
        notification: {
          title: `${senderName} replied`,
          body: messagePreview,
        },
        data: {
          type: "message",
          questionId: answer?.questionId?.toString() || "",
          url: "/answers",
          tag: `message-${answer?.questionId || answerId}`,
        },
      };

      // Send to all tokens
      try {
        const response = await admin.messaging().sendEachForMulticast({
          tokens: tokens,
          notification: payload.notification,
          data: payload.data,
        });

        logger.info(`Successfully sent ${response.successCount} notifications`);

        // Clean up any invalid tokens
        if (response.failureCount > 0) {
          const validTokens = tokens.filter((token, index) => {
            return response.responses[index].success;
          });
          await admin.database()
              .ref(`deviceTokens/${userId}`).set(validTokens);
        }

        return response;
      } catch (error) {
        logger.error("Error sending notification:", error);
        return null;
      }
    });

/**
 * Helper function to generate a batch of questions
 * Used by scheduled function
 * @param {number} count - Number of questions to generate (default: 12)
 * @return {Promise<Array>} Array of generated questions
 */
async function generateQuestionBatch(count = 12) {
  const typeCounts = {
    yes_no: Math.ceil(count / 9),
    multiple_choice: Math.ceil(count / 9),
    ranking: Math.ceil(count / 9),
    short_form: Math.ceil(count / 9),
    long_form: Math.ceil(count / 9),
    would_you_rather: Math.ceil(count / 9),
    hot_take: Math.ceil(count / 9),
    this_or_that: 0,
    hypothetical: Math.ceil(count / 9),
  };

  const allResults = {};

  // Generate each question type separately
  for (const [typeId, typeCount] of Object.entries(typeCounts)) {
    if (typeCount > 0) {
      const questionTypeKey = typeId.toUpperCase().replace(/-/g, "_");
      const typeConfig = QUESTION_TYPES[questionTypeKey];

      if (!typeConfig) {
        logger.warn(`Unknown question type: ${typeId}`);
        continue;
      }

      logger.info(`Generating ${typeCount} ${typeId} questions`);

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
                  content: typeConfig.userPrompt(typeCount),
                },
              ],
              temperature: 0.9,
              max_tokens: 2000,
            }),
          },
      );

      if (!groqResponse.ok) {
        const errorText = await groqResponse.text();
        logger.error(`Groq API error for ${typeId}:`, groqResponse.status, errorText);
        throw new Error(`Groq API error for ${typeId}: ${groqResponse.status}`);
      }

      const data = await groqResponse.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error(`No content in Groq API response for ${typeId}`);
      }

      const parsedContent = JSON.parse(content.trim());
      allResults[typeId] = parsedContent;
    }
  }

  // Convert to app format
  const allQuestions = [];
  let idCounter = Date.now();

  // Yes/No questions
  (allResults.yes_no || []).forEach((text) => {
    allQuestions.push({
      id: idCounter++,
      type: "yes_no",
      text: text.toLowerCase().trim(),
    });
  });

  // Multiple choice questions
  (allResults.multiple_choice || []).forEach((q) => {
    allQuestions.push({
      id: idCounter++,
      type: "multiple_choice",
      text: q.question.toLowerCase().trim(),
      options: q.options,
    });
  });

  // Ranking questions
  (allResults.ranking || []).forEach((q) => {
    allQuestions.push({
      id: idCounter++,
      type: "ranking",
      text: q.question.toLowerCase().trim(),
      items: q.items,
    });
  });

  // Short-form questions
  (allResults.short_form || []).forEach((q) => {
    allQuestions.push({
      id: idCounter++,
      type: "short_form",
      text: q.question.toLowerCase().trim(),
    });
  });

  // Long-form questions
  (allResults.long_form || []).forEach((q) => {
    allQuestions.push({
      id: idCounter++,
      type: "long_form",
      text: q.question.toLowerCase().trim(),
      scenario: q.scenario,
    });
  });

  // Would You Rather questions
  (allResults.would_you_rather || []).forEach((q) => {
    allQuestions.push({
      id: idCounter++,
      type: "would_you_rather",
      text: q.question.toLowerCase().trim(),
      option1: q.option1,
      option2: q.option2,
    });
  });

  // Hot Take questions
  (allResults.hot_take || []).forEach((q) => {
    allQuestions.push({
      id: idCounter++,
      type: "hot_take",
      text: q.question.toLowerCase().trim(),
    });
  });

  // This or That questions
  (allResults.this_or_that || []).forEach((q) => {
    allQuestions.push({
      id: idCounter++,
      type: "this_or_that",
      text: q.question.toLowerCase().trim(),
      option1: q.option1,
      option2: q.option2,
    });
  });

  // Hypothetical questions
  (allResults.hypothetical || []).forEach((q) => {
    allQuestions.push({
      id: idCounter++,
      type: "hypothetical",
      text: q.question.toLowerCase().trim(),
    });
  });

  // Shuffle the questions
  for (let i = allQuestions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
  }

  return allQuestions;
}

/**
 * Scheduled Cloud Function to generate questions every 10 minutes
 * Maintains separate question pools for josh and nini
 */
exports.generateQuestionPools = require("firebase-functions/v2/scheduler")
    .onSchedule(
        {
          schedule: "*/10 * * * *", // Every 10 minutes
          timeZone: "America/New_York",
          secrets: [groqApiKey],
          maxInstances: 1,
        },
        async () => {
          try {
            logger.info("Starting scheduled question generation");

            const users = ["josh", "nini"];
            const POOL_SIZE = 12;
            const MIN_QUESTIONS_THRESHOLD = 5;

            for (const userId of users) {
              try {
                // Get current pool data
                const poolRef = admin.database().ref(`questionPools/${userId}`);
                const poolSnapshot = await poolRef.once("value");
                const poolData = poolSnapshot.val() || {};

                const existingQuestions = poolData.questions || [];
                const lastIndex = poolData.lastIndex || 0;
                const remainingQuestions = existingQuestions.length - lastIndex;

                logger.info(
                    `User ${userId}: ${remainingQuestions} questions ` +
                    `remaining (${existingQuestions.length} total, ` +
                    `index at ${lastIndex})`,
                );

                // Only generate if running low on questions
                if (remainingQuestions < MIN_QUESTIONS_THRESHOLD) {
                  logger.info(`User ${userId} is running low on questions, generating new batch`);

                  // Generate new questions
                  const newQuestions = await generateQuestionBatch(POOL_SIZE);

                  // Remove already-used questions and append new ones
                  const updatedQuestions = [
                    ...existingQuestions.slice(lastIndex),
                    ...newQuestions,
                  ].slice(0, POOL_SIZE); // Keep max 12 questions

                  // Update the pool in database
                  await poolRef.set({
                    questions: updatedQuestions,
                    lastGenerated: Date.now(),
                    lastIndex: 0, // Reset index since we're creating a fresh pool
                  });

                  logger.info(`Generated ${newQuestions.length} new questions for ${userId}`);
                } else {
                  logger.info(`User ${userId} has enough questions, skipping generation`);
                }
              } catch (userError) {
                logger.error(`Error generating questions for ${userId}:`, userError);
                // Continue with next user even if one fails
              }
            }

            logger.info("Completed scheduled question generation");
            return null;
          } catch (error) {
            logger.error("Error in scheduled question generation:", error);
            throw error;
          }
        },
    );

/**
 * One-time callable function to initialize question pools
 * Call this manually after deployment to set up initial questions
 */
exports.initializeQuestionPools = onCall(
    {
      secrets: [groqApiKey],
    },
    async () => {
      try {
        logger.info("Initializing question pools");

        const users = ["josh", "nini"];
        const POOL_SIZE = 12;

        for (const userId of users) {
          try {
            // Check if pool already exists
            const poolRef = admin.database().ref(`questionPools/${userId}`);
            const poolSnapshot = await poolRef.once("value");

            if (poolSnapshot.exists()) {
              logger.info(`Pool for ${userId} already exists, skipping`);
              continue;
            }

            // Generate initial questions
            logger.info(`Generating initial questions for ${userId}`);
            const questions = await generateQuestionBatch(POOL_SIZE);

            // Initialize the pool
            await poolRef.set({
              questions: questions,
              lastGenerated: Date.now(),
              lastIndex: 0,
            });

            logger.info(`Successfully initialized pool for ${userId} with ${questions.length} questions`);
          } catch (userError) {
            logger.error(`Error initializing pool for ${userId}:`, userError);
            throw userError;
          }
        }

        logger.info("Successfully initialized all question pools");
        return {
          success: true,
          message: "Question pools initialized successfully",
        };
      } catch (error) {
        logger.error("Error initializing question pools:", error);
        throw new HttpsError(
            "internal",
            error.message || "Failed to initialize question pools",
        );
      }
    },
);
