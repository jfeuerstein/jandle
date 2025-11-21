/**
 * Groq API Service for generating questions
 */

import { QUESTION_TYPES, getRandomQuestionType } from '../config/questionTypes';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.REACT_APP_GROQ_API_KEY;

/**
 * Generate questions using Groq LLM for a specific question type
 * @param {Object} questionType - The question type configuration
 * @param {number} count - Number of questions to generate
 * @returns {Promise<Array>} Array of generated questions
 */
const generateByType = async (questionType, count) => {
  if (!GROQ_API_KEY) {
    console.warn('GROQ_API_KEY not found in environment variables');
    throw new Error('Groq API key not configured');
  }

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{
          role: 'system',
          content: questionType.prompt
        }, {
          role: 'user',
          content: questionType.userPrompt(count)
        }],
        temperature: 0.9,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content in Groq API response');
    }

    // Parse the JSON from the response
    const parsedContent = JSON.parse(content.trim());

    return parsedContent;

  } catch (error) {
    console.error(`Error generating ${questionType.id} questions with Groq:`, error);
    throw error;
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
