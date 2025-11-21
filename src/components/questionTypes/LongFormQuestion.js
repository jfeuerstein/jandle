import React, { useState } from 'react';
import './LongFormQuestion.css';

function LongFormQuestion({ question, onAnswer, onSkip, disabled }) {
  const [answer, setAnswer] = useState('');
  const [showInput, setShowInput] = useState(false);

  const handleAnswerClick = () => {
    setShowInput(true);
  };

  const handleSubmit = () => {
    if (answer.trim()) {
      onAnswer(answer);
      setAnswer('');
      setShowInput(false);
    }
  };

  const handleCancel = () => {
    setShowInput(false);
    setAnswer('');
  };

  return (
    <div className="long-form-question">
      <div className="question-header">
        <span className="question-number">question {question.id}</span>
        <span className="question-type-badge">story response</span>
      </div>

      {question.scenario && (
        <div className="question-scenario">
          <div className="scenario-label">scenario:</div>
          <div className="scenario-text">{question.scenario}</div>
        </div>
      )}

      <div className="question-text">
        {question.text}
      </div>

      {!showInput ? (
        <div className="long-form-actions">
          <button
            className="long-form-btn long-form-btn-skip"
            onClick={onSkip}
            disabled={disabled}
          >
            [ skip ]
          </button>
          <button
            className="long-form-btn long-form-btn-answer"
            onClick={handleAnswerClick}
            disabled={disabled}
          >
            [ answer ]
          </button>
        </div>
      ) : (
        <div className="long-form-answer-form">
          <textarea
            className="long-form-textarea"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="share your thoughts..."
            rows="8"
            autoFocus
            disabled={disabled}
          />
          <div className="long-form-actions">
            <button
              className="long-form-btn long-form-btn-cancel"
              onClick={handleCancel}
              disabled={disabled}
            >
              [ cancel ]
            </button>
            <button
              className="long-form-btn long-form-btn-submit"
              onClick={handleSubmit}
              disabled={!answer.trim() || disabled}
            >
              [ submit ]
            </button>
          </div>
        </div>
      )}

      <div className="question-footer">
        <span className="question-hint">
          {showInput
            ? 'write a thoughtful response to the scenario'
            : 'read the scenario and share your perspective'}
        </span>
      </div>
    </div>
  );
}

export default LongFormQuestion;
