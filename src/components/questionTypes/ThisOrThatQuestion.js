import React, { useState } from 'react';
import './WouldYouRatherQuestion.css';

function ThisOrThatQuestion({ question, onAnswer, onSkip, disabled }) {
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
    <div className="would-you-rather-question">
      <div className="question-header">
        <span className="question-number">question </span>
        <span className="question-type-badge">this or that</span>
      </div>

      <div className="question-text">
        {question.text}
      </div>

      <div className="would-you-rather-options">
        <button
          className={`would-you-rather-option ${selectedOption === question.option1 ? 'selected' : ''}`}
          onClick={() => handleOptionSelect(question.option1)}
          disabled={disabled}
        >
          <span className="option-label">→</span>
          <span className="option-text">{question.option1}</span>
        </button>
        <div className="or-divider">[ or ]</div>
        <button
          className={`would-you-rather-option ${selectedOption === question.option2 ? 'selected' : ''}`}
          onClick={() => handleOptionSelect(question.option2)}
          disabled={disabled}
        >
          <span className="option-label">→</span>
          <span className="option-text">{question.option2}</span>
        </button>
      </div>

      <div className="would-you-rather-actions">
        <button
          className="would-you-rather-btn would-you-rather-btn-skip"
          onClick={onSkip}
          disabled={disabled}
        >
          [ skip ]
        </button>
        <button
          className="would-you-rather-btn would-you-rather-btn-submit"
          onClick={handleSubmit}
          disabled={!selectedOption || disabled}
        >
          [ submit ]
        </button>
      </div>

      <div className="question-footer">
        <span className="question-hint">
          {selectedOption ? `you chose: ${selectedOption}` : 'make your choice'}
        </span>
      </div>
    </div>
  );
}

export default ThisOrThatQuestion;
