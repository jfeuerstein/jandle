/**
 * Groq API Service for generating questions
 * Now uses Firebase Cloud Functions to protect API keys
 */

import { QUESTION_TYPES, getRandomQuestionType } from '../config/questionTypes';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../firebase';

// Initialize Firebase Functions
const functions = getFunctions(app);

// For local development with emulator, uncomment:
// import { connectFunctionsEmulator } from 'firebase/functions';
// connectFunctionsEmulator(functions, 'localhost', 5001);

/**
 * Generate questions using Cloud Function (which calls Groq API)
 * @param {Object} questionType - The question type configuration
 * @param {number} count - Number of questions to generate
 * @returns {Promise<Array>} Array of generated questions
 */
const generateByType = async (questionType, count) => {
  try {
    // Call the Cloud Function
    const generateQuestions = httpsCallable(functions, 'generateQuestions');

    const result = await generateQuestions({
      questionType: questionType.id,
      count: count
    });

    if (!result.data.success) {
      throw new Error(result.data.error || 'Unknown error from Cloud Function');
    }

    return result.data.questions;

  } catch (error) {
    console.error(`Error generating ${questionType.id} questions:`, error);

    // Provide more helpful error messages
    if (error.code === 'functions/unauthenticated') {
      throw new Error('Authentication required to generate questions');
    } else if (error.code === 'functions/not-found') {
      throw new Error('Question generation service not available. Please ensure Firebase Functions are deployed.');
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error('Failed to generate questions. Please try again.');
    }
  }
};

/**
 * Generate a batch of questions with mixed types
 * @param {number} count - Total number of questions to generate
 * @returns {Promise<Array<{id: number, type: string, text: string, ...}>>}
 */
export const generateQuestions = async (count = 10) => {
  try {
    // Distribute questions across different types
    const questionsPerType = Math.floor(count / 3);
    const remainder = count % 3;

    const yesNoCount = questionsPerType + (remainder > 0 ? 1 : 0);
    const multipleChoiceCount = questionsPerType + (remainder > 1 ? 1 : 0);
    const longFormCount = questionsPerType;

    console.log(`Generating ${yesNoCount} yes/no, ${multipleChoiceCount} multiple choice, ${longFormCount} long-form questions`);

    // Generate questions for each type in parallel
    const [yesNoQuestions, multipleChoiceQuestions, longFormQuestions] = await Promise.all([
      generateByType(QUESTION_TYPES.YES_NO, yesNoCount),
      generateByType(QUESTION_TYPES.MULTIPLE_CHOICE, multipleChoiceCount),
      generateByType(QUESTION_TYPES.LONG_FORM, longFormCount)
    ]);

    // Convert to app format
    let allQuestions = [];
    let idCounter = Date.now();

    // Yes/No questions
    yesNoQuestions.forEach(text => {
      allQuestions.push({
        id: idCounter++,
        type: 'yes_no',
        text: text.toLowerCase().trim()
      });
    });

    // Multiple choice questions
    multipleChoiceQuestions.forEach(q => {
      allQuestions.push({
        id: idCounter++,
        type: 'multiple_choice',
        text: q.question.toLowerCase().trim(),
        options: q.options
      });
    });

    // Long-form questions
    longFormQuestions.forEach(q => {
      allQuestions.push({
        id: idCounter++,
        type: 'long_form',
        text: q.question.toLowerCase().trim(),
        scenario: q.scenario
      });
    });

    // Shuffle the questions for variety
    allQuestions = shuffleArray(allQuestions);

    console.log(`Successfully generated ${allQuestions.length} questions of mixed types`);
    return allQuestions;

  } catch (error) {
    console.error('Error generating questions with Groq:', error);
    throw error;
  }
};

/**
 * Generate a single question of a random type
 * @returns {Promise<Object>}
 */
export const generateSingleQuestion = async () => {
  const questionType = getRandomQuestionType();
  const questions = await generateByType(questionType, 1);

  let question = questions[0];

  // Format based on type
  if (questionType.id === 'yes_no') {
    return {
      id: Date.now(),
      type: 'yes_no',
      text: question.toLowerCase().trim()
    };
  } else if (questionType.id === 'multiple_choice') {
    return {
      id: Date.now(),
      type: 'multiple_choice',
      text: question.question.toLowerCase().trim(),
      options: question.options
    };
  } else if (questionType.id === 'long_form') {
    return {
      id: Date.now(),
      type: 'long_form',
      text: question.question.toLowerCase().trim(),
      scenario: question.scenario
    };
  }
};

/**
 * Shuffle array using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array
 */
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
