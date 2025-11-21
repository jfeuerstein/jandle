import React from 'react';
import YesNoQuestion from './questionTypes/YesNoQuestion';
import MultipleChoiceQuestion from './questionTypes/MultipleChoiceQuestion';
import ShortFormQuestion from './questionTypes/ShortFormQuestion';
import LongFormQuestion from './questionTypes/LongFormQuestion';

/**
 * QuestionRenderer - Renders the appropriate question component based on question type
 *
 * This component acts as a router/factory that selects and renders the correct
 * question type component (YesNo, MultipleChoice, or LongForm).
 *
 * @param {Object} question - The question object with type, text, and other properties
 * @param {Function} onAnswer - Callback when user submits an answer
 * @param {Function} onSkip - Callback when user skips the question
 * @param {boolean} disabled - Whether the question should be disabled
 * @param {string} mode - 'questions' or 'inbox' mode (determines behavior)
 */
function QuestionRenderer({ question, onAnswer, onSkip, disabled = false, mode = 'questions' }) {
  if (!question) {
    return null;
  }

  // Default to long_form if type is not specified (backward compatibility)
  const questionType = question.type || 'long_form';

  // Select the appropriate component based on question type
  switch (questionType) {
    case 'yes_no':
      return (
        <YesNoQuestion
          question={question}
          onAnswer={onAnswer}
          onSkip={onSkip}
          disabled={disabled}
        />
      );

    case 'multiple_choice':
      return (
        <MultipleChoiceQuestion
          question={question}
          onAnswer={onAnswer}
          onSkip={onSkip}
          disabled={disabled}
        />
      );

    case 'short_form':
      return (
        <ShortFormQuestion
          question={question}
          onAnswer={onAnswer}
          onSkip={onSkip}
          disabled={disabled}
        />
      );

    case 'long_form':
      return (
        <LongFormQuestion
          question={question}
          onAnswer={onAnswer}
          onSkip={onSkip}
          disabled={disabled}
        />
      );

    default:
      console.warn(`Unknown question type: ${questionType}, falling back to long_form`);
      return (
        <LongFormQuestion
          question={question}
          onAnswer={onAnswer}
          onSkip={onSkip}
          disabled={disabled}
        />
      );
  }
}

export default QuestionRenderer;
