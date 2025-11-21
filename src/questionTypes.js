// Question types supported by Jandle
export const QUESTION_TYPES = {
  FREE_RESPONSE: 'FREE_RESPONSE',      // Original text area response
  YES_NO: 'YES_NO',                    // Simple yes/no question
  MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',  // Multiple choice with options
  LONG_FORM: 'LONG_FORM',              // Story/scenario with opinion response
};

// Helper to validate question structure
export const validateQuestion = (question) => {
  if (!question.id || !question.text || !question.type) {
    throw new Error('Question must have id, text, and type');
  }

  if (!Object.values(QUESTION_TYPES).includes(question.type)) {
    throw new Error(`Invalid question type: ${question.type}`);
  }

  // Type-specific validation
  switch (question.type) {
    case QUESTION_TYPES.MULTIPLE_CHOICE:
      if (!question.options || !Array.isArray(question.options) || question.options.length < 2) {
        throw new Error('MULTIPLE_CHOICE questions must have at least 2 options');
      }
      break;
    case QUESTION_TYPES.LONG_FORM:
      if (!question.story) {
        throw new Error('LONG_FORM questions must have a story field');
      }
      break;
    default:
      break;
  }

  return true;
};
