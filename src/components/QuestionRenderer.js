import React from 'react';
import { QUESTION_TYPES } from '../questionTypes';
import './QuestionRenderer.css';

// Free response question - original textarea format
function FreeResponseRenderer({ answer, onAnswerChange, disabled }) {
  return (
    <div className="question-renderer-form">
      <textarea
        className="question-textarea"
        value={answer}
        onChange={(e) => onAnswerChange(e.target.value)}
        placeholder="type your answer here..."
        rows="6"
        autoFocus
        disabled={disabled}
      />
    </div>
  );
}

// Yes/No question - simple binary choice
function YesNoRenderer({ answer, onAnswerChange, disabled }) {
  return (
    <div className="question-renderer-form">
      <div className="yesno-options">
        <button
          className={`yesno-btn ${answer === 'yes' ? 'yesno-btn-selected' : ''}`}
          onClick={() => onAnswerChange('yes')}
          disabled={disabled}
        >
          [ yes ]
        </button>
        <button
          className={`yesno-btn ${answer === 'no' ? 'yesno-btn-selected' : ''}`}
          onClick={() => onAnswerChange('no')}
          disabled={disabled}
        >
          [ no ]
        </button>
      </div>
      {answer && (
        <div className="yesno-followup">
          <label className="yesno-label">care to elaborate? (optional)</label>
          <textarea
            className="question-textarea question-textarea-small"
            value={answer.elaboration || ''}
            onChange={(e) => onAnswerChange(answer === 'yes' || answer === 'no' ?
              { choice: answer, elaboration: e.target.value } : answer
            )}
            placeholder="add more context if you'd like..."
            rows="3"
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
}

// Multiple choice question
function MultipleChoiceRenderer({ question, answer, onAnswerChange, disabled }) {
  const options = question.options || [];

  return (
    <div className="question-renderer-form">
      <div className="multichoice-options">
        {options.map((option, index) => (
          <button
            key={index}
            className={`multichoice-btn ${answer === option ? 'multichoice-btn-selected' : ''}`}
            onClick={() => onAnswerChange(option)}
            disabled={disabled}
          >
            {option}
          </button>
        ))}
      </div>
      {question.allowElaboration !== false && answer && (
        <div className="multichoice-followup">
          <label className="multichoice-label">why did you choose this? (optional)</label>
          <textarea
            className="question-textarea question-textarea-small"
            value={typeof answer === 'string' ? '' : answer.elaboration || ''}
            onChange={(e) => onAnswerChange(
              typeof answer === 'string' ?
                { choice: answer, elaboration: e.target.value } :
                { ...answer, elaboration: e.target.value }
            )}
            placeholder="share your reasoning..."
            rows="3"
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
}

// Long-form question with story
function LongFormRenderer({ question, answer, onAnswerChange, disabled }) {
  return (
    <div className="question-renderer-form">
      <div className="longform-story">
        <pre className="longform-story-box">
{`┌────────────────────────────────────┐
│            the scenario            │
└────────────────────────────────────┘`}
        </pre>
        <div className="longform-story-text">
          {question.story}
        </div>
      </div>
      <div className="longform-response">
        <label className="longform-label">your thoughts:</label>
        <textarea
          className="question-textarea"
          value={answer}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder="share your opinion on this scenario..."
          rows="6"
          autoFocus
          disabled={disabled}
        />
      </div>
    </div>
  );
}

// Main QuestionRenderer component
function QuestionRenderer({ question, answer, onAnswerChange, disabled = false }) {
  const questionType = question.type || QUESTION_TYPES.FREE_RESPONSE;

  switch (questionType) {
    case QUESTION_TYPES.YES_NO:
      return (
        <YesNoRenderer
          answer={answer}
          onAnswerChange={onAnswerChange}
          disabled={disabled}
        />
      );

    case QUESTION_TYPES.MULTIPLE_CHOICE:
      return (
        <MultipleChoiceRenderer
          question={question}
          answer={answer}
          onAnswerChange={onAnswerChange}
          disabled={disabled}
        />
      );

    case QUESTION_TYPES.LONG_FORM:
      return (
        <LongFormRenderer
          question={question}
          answer={answer}
          onAnswerChange={onAnswerChange}
          disabled={disabled}
        />
      );

    case QUESTION_TYPES.FREE_RESPONSE:
    default:
      return (
        <FreeResponseRenderer
          answer={answer}
          onAnswerChange={onAnswerChange}
          disabled={disabled}
        />
      );
  }
}

export default QuestionRenderer;
