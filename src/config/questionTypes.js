/**
 * Question Type Configuration
 *
 * Defines the different types of questions that can be asked in the app.
 * Each question type has its own prompt, response format, and UI components.
 */

export const QUESTION_TYPES = {
  YES_NO: {
    id: 'yes_no',
    name: 'Yes or No',
    description: 'Simple yes or no questions',
    responseOptions: ['yes', 'no'],
    prompt: `You are a creative conversationalist who crafts questions that reveal personality, spark debate, and make people think. Generate yes-or-no questions that range from playful to philosophical, quirky to profound. Mix in some relationship questions, but also include preferences, hypotheticals, hot takes, and personality reveals. Keep it interesting and varied.`,
    userPrompt: (count) => `Generate ${count} unique yes-or-no questions. Make them diverse - some funny, some deep, some about preferences, some philosophical. Only include relationship-focused questions occasionally. Each should spark conversation beyond just yes/no. Return ONLY a JSON array: ["question 1?", "question 2?", "question 3?"]. No other text.`,
    validationRequired: false
  },

  MULTIPLE_CHOICE: {
    id: 'multiple_choice',
    name: 'Multiple Choice',
    description: 'Questions with 3-4 predefined answer options',
    responseOptions: null,
    prompt: `You are a creative conversationalist who crafts questions that reveal personality and preferences. Generate multiple choice questions with 3-4 interesting options that make people think about what defines them. Mix serious and playful, include personality types, preferences, hypotheticals, and occasional relationship questions. The options should be distinct enough to reveal something meaningful.`,
    userPrompt: (count) => `Generate ${count} unique multiple choice questions. Variety is key - personality types, preferences, priorities, hypotheticals, ethics, fun scenarios. Include relationship stuff sometimes but not always. 3-4 options each. Return ONLY a JSON array: [{"question": "text?", "options": ["opt1", "opt2", "opt3"]}, ...]. No other text.`,
    validationRequired: true
  },

  RANKING: {
    id: 'ranking',
    name: 'Ranking',
    description: 'Questions where you rank options in order of preference',
    responseOptions: null,
    prompt: `You are a creative conversationalist who crafts ranking questions that force interesting trade-offs and reveal priorities. Generate questions with 4-6 items to rank by preference, importance, or appeal. Mix fun and serious topics - superpowers, life priorities, food, experiences, values. Occasionally include relationship topics but keep it varied and interesting.`,
    userPrompt: (count) => `Generate ${count} unique ranking questions with 4-6 items each. Mix it up - rank dream superpowers, life priorities, vacation types, foods, personality traits, guilty pleasures. Include relationship priorities sometimes but not predominantly. Return ONLY a JSON array: [{"question": "Rank these by preference:", "items": ["item1", "item2", "item3", "item4"]}, ...]. No other text.`,
    validationRequired: true
  },

  SHORT_FORM: {
    id: 'short_form',
    name: 'Short Answer',
    description: 'Quick questions requiring brief responses',
    responseOptions: null,
    prompt: `You are a creative conversationalist who asks questions that get to the heart of who someone is. Generate questions requiring 1-2 sentence answers that reveal preferences, experiences, hot takes, and personality. Mix nostalgic, funny, thought-provoking, and occasionally relationship-focused questions. Keep it snappy and engaging.`,
    userPrompt: (count) => `Generate ${count} unique short-answer questions (1-2 sentence responses). Mix topics - childhood memories, unpopular opinions, bucket list items, pet peeves, favorite things, fun facts about themselves. Include relationship questions occasionally. Return ONLY a JSON array: [{"question": "What's your most controversial food opinion?"}, ...]. No other text.`,
    validationRequired: false,
    hasScenario: false
  },

  LONG_FORM: {
    id: 'long_form',
    name: 'Story Response',
    description: 'Reddit-style story scenarios asking for opinions',
    responseOptions: null,
    prompt: `You are a creative storyteller who generates engaging Reddit-style stories inspired by popular subreddits like "Am I The Asshole" (AITA), "Am I Overreacting" (AIOR), "Do I Have a Point" (DIHAP), and similar formats. Create realistic, relatable scenarios (6-10 sentences) about everyday conflicts, dilemmas, or situations where someone needs perspective. Include family drama, workplace conflicts, friend disagreements, relationship issues, parenting decisions, social situations, and petty disputes. Make them feel authentic and discussion-worthy.`,
    userPrompt: (count) => `Generate ${count} unique Reddit-style story prompts. Each should be 6-10 sentences describing a realistic conflict or situation, followed by a question asking for opinions. Mix different formats: "AITA for...", "Am I overreacting...", "Do I have a point...", "Should I have...", "Was I wrong to...". Include various scenarios: family drama, workplace conflicts, friendship issues, neighbor disputes, wedding drama, parenting decisions, social faux pas, relationship boundaries. Make them feel real and relatable. Return ONLY a JSON array: [{"scenario": "story description...", "question": "AITA for [action]?"}, ...]. No other text.`,
    validationRequired: false,
    hasScenario: true
  },

  WOULD_YOU_RATHER: {
    id: 'would_you_rather',
    name: 'Would You Rather',
    description: 'Choose between two interesting options',
    responseOptions: null,
    prompt: `You are a creative conversationalist who creates compelling "would you rather" questions. Generate questions with two distinct options that force interesting trade-offs. Mix silly and serious, practical and absurd, superpowers and real-world choices. Occasionally include relationship scenarios, but mostly focus on revealing personality through tough choices. Make both options appealing in different ways.`,
    userPrompt: (count) => `Generate ${count} unique "would you rather" questions. Each has two options that create genuine dilemmas. Mix absurd (fight-sized ducks), practical (money vs time), superpowers, ethical choices, lifestyle preferences. Sometimes include relationship options but keep it varied. Return ONLY a JSON array: [{"question": "Would you rather...", "option1": "first choice", "option2": "second choice"}, ...]. No other text.`,
    validationRequired: true
  },

  HOT_TAKE: {
    id: 'hot_take',
    name: 'Hot Take',
    description: 'Share your controversial or unique opinion',
    responseOptions: null,
    prompt: `You are a creative conversationalist who prompts people to share their spiciest takes and unpopular opinions. Generate questions that ask for controversial, contrarian, or uniquely personal perspectives. Topics can range from food and entertainment to life philosophies and social norms. Make them fun and judgment-free, encouraging honest hot takes. Occasionally include relationship opinions but keep it diverse.`,
    userPrompt: (count) => `Generate ${count} unique "hot take" or "unpopular opinion" questions. Ask about food, movies, music, social norms, daily habits, common beliefs, overrated/underrated things. Encourage spicy but fun takes. Sometimes ask about relationship opinions but not too often. Return ONLY a JSON array: [{"question": "What's your most unpopular opinion about breakfast foods?"}, ...]. No other text.`,
    validationRequired: false,
    hasScenario: false
  },

  THIS_OR_THAT: {
    id: 'this_or_that',
    name: 'This or That',
    description: 'Quick-fire preference questions',
    responseOptions: null,
    prompt: `You are a creative conversationalist who creates rapid-fire "this or that" questions that reveal preferences and personality. Generate simple A vs B questions - no elaborate explanations needed. Mix lifestyle preferences, personality traits, activities, seasons, foods, social situations. Keep them punchy and fun. Occasionally include relationship preferences but mostly focus on personal taste and style.`,
    userPrompt: (count) => `Generate ${count} unique "this or that" questions. Simple A vs B format. Mix: coffee vs tea, mountains vs beach, cats vs dogs, introvert vs extrovert, sweet vs savory, summer vs winter, texting vs calling. Include some relationship preferences occasionally. Return ONLY a JSON array: [{"question": "This or that:", "option1": "option A", "option2": "option B"}, ...]. No other text.`,
    validationRequired: true
  },

  HYPOTHETICAL: {
    id: 'hypothetical',
    name: 'Hypothetical',
    description: 'Imaginative what-if scenarios',
    responseOptions: null,
    prompt: `You are a creative conversationalist who dreams up fascinating hypothetical scenarios. Generate imaginative "what if" questions and impossible scenarios that make people think creatively. Mix superpowers, time travel, magical abilities, alternate realities, unlimited resources, rule-breaking possibilities. Go wild with creativity. Relationship scenarios can appear sometimes but keep the focus on imagination and personality.`,
    userPrompt: (count) => `Generate ${count} unique hypothetical questions. Think: time travel destinations, superpower choices, dinner with anyone dead or alive, elimination of minor inconveniences, magical abilities, alternate career paths, unlimited budget scenarios. Mix profound and silly. Sometimes include relationship hypotheticals. Return ONLY a JSON array: [{"question": "If you could eliminate one minor inconvenience from existence, what would it be?"}, ...]. No other text.`,
    validationRequired: false,
    hasScenario: false
  }
};

/**
 * Get all available question types
 * @returns {Array} Array of question type objects
 */
export const getAllQuestionTypes = () => {
  return Object.values(QUESTION_TYPES);
};

/**
 * Get a specific question type by ID
 * @param {string} typeId - The ID of the question type
 * @returns {Object|null} The question type object or null if not found
 */
export const getQuestionType = (typeId) => {
  return Object.values(QUESTION_TYPES).find(type => type.id === typeId) || null;
};

/**
 * Get a random question type (for variety in question generation)
 * @returns {Object} A random question type
 */
export const getRandomQuestionType = () => {
  const types = Object.values(QUESTION_TYPES);
  return types[Math.floor(Math.random() * types.length)];
};

/**
 * Validate a question object has the required fields for its type
 * @param {Object} question - The question object to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const validateQuestion = (question) => {
  if (!question || !question.type) {
    return false;
  }

  const questionType = getQuestionType(question.type);
  if (!questionType) {
    return false;
  }

  // Check required fields
  if (!question.id || !question.text) {
    return false;
  }

  // Type-specific validation
  if (questionType.id === 'multiple_choice') {
    if (!question.options || !Array.isArray(question.options) || question.options.length < 2) {
      return false;
    }
  }

  if (questionType.id === 'ranking') {
    if (!question.items || !Array.isArray(question.items) || question.items.length < 3) {
      return false;
    }
  }

  if (questionType.id === 'long_form' && questionType.hasScenario) {
    if (!question.scenario) {
      return false;
    }
  }

  return true;
};
