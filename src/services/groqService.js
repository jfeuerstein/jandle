/**
 * Groq API Service for generating questions
 * Now uses Firebase Cloud Functions to protect API keys
 */

import { getRandomQuestionType } from '../config/questionTypes';
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
    // Distribute questions across all 9 types
    const questionsPerType = Math.floor(count / 9);
    const remainder = count % 9;

    const yesNoCount = questionsPerType + (remainder > 0 ? 1 : 0);
    const multipleChoiceCount = questionsPerType + (remainder > 1 ? 1 : 0);
    const rankingCount = questionsPerType + (remainder > 2 ? 1 : 0);
    const shortFormCount = questionsPerType + (remainder > 3 ? 1 : 0);
    const longFormCount = questionsPerType + (remainder > 4 ? 1 : 0);
    const wouldYouRatherCount = questionsPerType + (remainder > 5 ? 1 : 0);
    const hotTakeCount = questionsPerType + (remainder > 6 ? 1 : 0);
    const thisOrThatCount = 0;
    const hypotheticalCount = questionsPerType;

    console.log(`Generating ${yesNoCount} yes/no, ${multipleChoiceCount} multiple choice, ${rankingCount} ranking, ${shortFormCount} short-form, ${longFormCount} long-form, ${wouldYouRatherCount} would-you-rather, ${hotTakeCount} hot-take, ${thisOrThatCount} this-or-that, ${hypotheticalCount} hypothetical questions`);

    // Use batch mode: generate all question types in a single API call
    const generateQuestions = httpsCallable(functions, 'generateQuestions');
    const result = await generateQuestions({
      batch: true,
      typeCounts: {
        yes_no: yesNoCount,
        multiple_choice: multipleChoiceCount,
        ranking: rankingCount,
        short_form: shortFormCount,
        long_form: longFormCount,
        would_you_rather: wouldYouRatherCount,
        hot_take: hotTakeCount,
        this_or_that: thisOrThatCount,
        hypothetical: hypotheticalCount
      }
    });

    if (!result.data.success) {
      throw new Error(result.data.error || 'Unknown error from Cloud Function');
    }

    const batchResults = result.data.questions;

    // Convert to app format
    let allQuestions = [];
    let idCounter = Date.now();

    // Yes/No questions
    (batchResults.yes_no || []).forEach(text => {
      allQuestions.push({
        id: idCounter++,
        type: 'yes_no',
        text: text.toLowerCase().trim()
      });
    });

    // Multiple choice questions
    (batchResults.multiple_choice || []).forEach(q => {
      allQuestions.push({
        id: idCounter++,
        type: 'multiple_choice',
        text: q.question.toLowerCase().trim(),
        options: q.options
      });
    });

    // Ranking questions
    (batchResults.ranking || []).forEach(q => {
      allQuestions.push({
        id: idCounter++,
        type: 'ranking',
        text: q.question.toLowerCase().trim(),
        items: q.items
      });
    });

    // Short-form questions
    (batchResults.short_form || []).forEach(q => {
      allQuestions.push({
        id: idCounter++,
        type: 'short_form',
        text: q.question.toLowerCase().trim()
      });
    });

    // Long-form questions
    (batchResults.long_form || []).forEach(q => {
      allQuestions.push({
        id: idCounter++,
        type: 'long_form',
        text: q.question.toLowerCase().trim(),
        scenario: q.scenario
      });
    });

    // Would You Rather questions
    (batchResults.would_you_rather || []).forEach(q => {
      allQuestions.push({
        id: idCounter++,
        type: 'would_you_rather',
        text: q.question.toLowerCase().trim(),
        option1: q.option1,
        option2: q.option2
      });
    });

    // Hot Take questions
    (batchResults.hot_take || []).forEach(q => {
      allQuestions.push({
        id: idCounter++,
        type: 'hot_take',
        text: q.question.toLowerCase().trim()
      });
    });

    // This or That questions
    (batchResults.this_or_that || []).forEach(q => {
      allQuestions.push({
        id: idCounter++,
        type: 'this_or_that',
        text: q.question.toLowerCase().trim(),
        option1: q.option1,
        option2: q.option2
      });
    });

    // Hypothetical questions
    (batchResults.hypothetical || []).forEach(q => {
      allQuestions.push({
        id: idCounter++,
        type: 'hypothetical',
        text: q.question.toLowerCase().trim()
      });
    });

    // Shuffle the questions for variety
    allQuestions = shuffleArray(allQuestions);
    console.log(allQuestions);

    console.log(`Successfully generated ${allQuestions.length} questions of mixed types`);
    return allQuestions;

  } catch (error) {
    console.error('Error generating questions with Groq:', error);

    // Provide more helpful error messages
    if (error.code === 'functions/resource-exhausted') {
      const details = error.details || {};
      const remainingSeconds = details.remainingSeconds || 0;
      throw new Error(`Rate limit reached. Please wait ${remainingSeconds} seconds before trying again.`);
    } else if (error.code === 'functions/unauthenticated') {
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
  } else if (questionType.id === 'ranking') {
    return {
      id: Date.now(),
      type: 'ranking',
      text: question.question.toLowerCase().trim(),
      items: question.items
    };
  } else if (questionType.id === 'short_form') {
    return {
      id: Date.now(),
      type: 'short_form',
      text: question.question.toLowerCase().trim()
    };
  } else if (questionType.id === 'long_form') {
    return {
      id: Date.now(),
      type: 'long_form',
      text: question.question.toLowerCase().trim(),
      scenario: question.scenario
    };
  } else if (questionType.id === 'would_you_rather') {
    return {
      id: Date.now(),
      type: 'would_you_rather',
      text: question.question.toLowerCase().trim(),
      option1: question.option1,
      option2: question.option2
    };
  } else if (questionType.id === 'hot_take') {
    return {
      id: Date.now(),
      type: 'hot_take',
      text: question.question.toLowerCase().trim()
    };
  } else if (questionType.id === 'this_or_that') {
    return {
      id: Date.now(),
      type: 'this_or_that',
      text: question.question.toLowerCase().trim(),
      option1: question.option1,
      option2: question.option2
    };
  } else if (questionType.id === 'hypothetical') {
    return {
      id: Date.now(),
      type: 'hypothetical',
      text: question.question.toLowerCase().trim()
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
