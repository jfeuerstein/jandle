import React, { useState } from 'react';
import './MultipleChoiceQuestion.css';

function MultipleChoiceQuestion({ question, onAnswer, onSkip, disabled }) {
  const [selectedOption, setSelectedOption] = useState(null);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  const handleSubmit = () => {
    if (selectedOption) {
      onAnswer(selectedOption);
    }
  };

  return (
    <div className="multiple-choice-question">
      <div className="question-header">
        <span className="question-number">question </span>
        <span className="question-type-badge">multiple choice</span>
      </div>

      <div className="question-text">
        {question.text}
      </div>

      <div className="multiple-choice-options">
        {question.options && question.options.map((option, index) => (
          <button
            key={index}
            className={`multiple-choice-option ${selectedOption === option ? 'selected' : ''}`}
            onClick={() => handleOptionSelect(option)}
            disabled={disabled}
          >
            <span className="option-letter">
              {String.fromCharCode(65 + index)}.
            </span>
            <span className="option-text">{option}</span>
          </button>
        ))}
      </div>

      <div className="multiple-choice-actions">
        <button
          className="multiple-choice-btn multiple-choice-btn-skip"
          onClick={onSkip}
          disabled={disabled}
        >
          [ skip ]
        </button>
        <button
          className="multiple-choice-btn multiple-choice-btn-submit"
          onClick={handleSubmit}
          disabled={!selectedOption || disabled}
        >
          [ submit ]
        </button>
      </div>

      <div className="question-footer">
        <span className="question-hint">
          {selectedOption ? `selected: ${selectedOption}` : 'select an option to continue'}
        </span>
      </div>
    </div>
  );
}

export default MultipleChoiceQuestion;
