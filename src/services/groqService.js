/**
 * Groq API Service for generating questions
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.REACT_APP_GROQ_API_KEY;

/**
 * Generate a batch of deep, personal questions for couples
 * @param {number} count - Number of questions to generate
 * @returns {Promise<Array<{id: number, text: string}>>}
 */
export const generateQuestions = async (count = 10) => {
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
          content: 'You are a relationship expert who creates deep, thought-provoking questions for couples. Generate questions that are intimate, personal, and promote meaningful conversations. Questions should be open-ended and encourage self-reflection.'
        }, {
          role: 'user',
          content: `Generate ${count} unique, deep personal questions for couples to discuss. Each question should be intimate and thought-provoking. Return ONLY a JSON array of questions in this exact format: ["question 1?", "question 2?", "question 3?"]. No other text, just the JSON array.`
        }],
        temperature: 0.9,
        max_tokens: 1000
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

    // Parse the JSON array from the response
    const questionsArray = JSON.parse(content.trim());

    // Convert to the format expected by the app
    return questionsArray.map((text, index) => ({
      id: Date.now() + index, // Use timestamp-based IDs to ensure uniqueness
      text: text.toLowerCase().trim()
    }));

  } catch (error) {
    console.error('Error generating questions with Groq:', error);
    throw error;
  }
};

/**
 * Generate a single question
 * @returns {Promise<{id: number, text: string}>}
 */
export const generateSingleQuestion = async () => {
  const questions = await generateQuestions(1);
  return questions[0];
};
