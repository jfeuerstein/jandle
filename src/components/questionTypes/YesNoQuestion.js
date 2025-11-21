import React from 'react';
import './YesNoQuestion.css';

function YesNoQuestion({ question, onAnswer, onSkip, disabled }) {
  const handleYes = () => {
    onAnswer('yes');
  };

  const handleNo = () => {
    onAnswer('no');
  };

  return (
    <div className="yes-no-question">
      <div className="question-header">
        <span className="question-number">question {question.id}</span>
        <span className="question-type-badge">yes/no</span>
      </div>

      <div className="question-text">
        {question.text}
      </div>

      <div className="yes-no-actions">
        <button
          className="yes-no-btn yes-no-btn-skip"
          onClick={onSkip}
          disabled={disabled}
        >
          [ skip ]
        </button>
        <button
          className="yes-no-btn yes-no-btn-no"
          onClick={handleNo}
          disabled={disabled}
        >
          [ no ]
        </button>
        <button
          className="yes-no-btn yes-no-btn-yes"
          onClick={handleYes}
          disabled={disabled}
        >
          [ yes ]
        </button>
      </div>

      <div className="question-footer">
        <span className="question-hint">
          choose yes or no to send your answer
        </span>
      </div>
    </div>
  );
}

export default YesNoQuestion;
