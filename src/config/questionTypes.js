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
    prompt: `You are a relationship expert who creates deep, thought-provoking questions for couples. Generate yes-or-no questions that are intimate, personal, and promote meaningful conversations. These should be questions that can be answered with yes or no, but encourage discussion afterward.`,
    userPrompt: (count) => `Generate ${count} unique yes-or-no questions for couples. Each question should be answerable with yes or no, but thought-provoking enough to spark conversation. Return ONLY a JSON array of questions in this exact format: ["question 1?", "question 2?", "question 3?"]. No other text, just the JSON array.`,
    validationRequired: false
  },

  MULTIPLE_CHOICE: {
    id: 'multiple_choice',
    name: 'Multiple Choice',
    description: 'Questions with 3-4 predefined answer options',
    responseOptions: null, // Options are generated per question
    prompt: `You are a relationship expert who creates deep, thought-provoking questions for couples. Generate multiple choice questions that are intimate, personal, and promote meaningful conversations. Each question should have 3-4 interesting answer options that reveal something about the person's values, preferences, or perspectives.`,
    userPrompt: (count) => `Generate ${count} unique multiple choice questions for couples. Each question should have 3-4 answer options. Return ONLY a JSON array in this exact format: [{"question": "question text?", "options": ["option 1", "option 2", "option 3"]}, ...]. No other text, just the JSON array.`,
    validationRequired: true
  },
  SHORT_FORM: {
    id: 'short_form',
    name: 'Short-Form Question',
    description: 'Short questions requiring brief, thoughtful responses',
    responseOptions: null, // Free-form text response
    prompt: `You are a relationship expert who creates deep, thought-provoking questions for couples. Generate questions that enable short responses that will lead to meaningful conversations. These should encourage short, thoughtful responses.`,
    userPrompt: (count) => `Generate ${count} unique questions for couples that require a short, thoughtful response (1-2 sentences). Return ONLY a JSON array in this exact format: [{"question": "What is your favorite memory together?"}, ...]. No other text, just the JSON array.`,
    validationRequired: false,
    hasScenario: true
  },
  LONG_FORM: {
    id: 'long_form',
    name: 'Long-Form Story',
    description: 'Questions with a story to read and give an opinion on',
    responseOptions: null, // Free-form text response
    prompt: `You are a relationship expert who creates deep, thought-provoking questions for couples. Generate questions that include a brief scenario or story (2-3 sentences) followed by an open-ended question that asks for the person's opinion, reaction, or perspective on the scenario. These should encourage detailed, thoughtful responses.`,
    userPrompt: (count) => `Generate ${count} unique scenario-based questions for couples. Each should include a brief story or scenario (2-3 sentences) followed by a question asking for their opinion. Return ONLY a JSON array in this exact format: [{"scenario": "A brief scenario description...", "question": "What would you do?"}, ...]. No other text, just the JSON array.`,
    validationRequired: false,
    hasScenario: true
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

  if (questionType.id === 'long_form' && questionType.hasScenario) {
    if (!question.scenario) {
      return false;
    }
  }

  return true;
};
