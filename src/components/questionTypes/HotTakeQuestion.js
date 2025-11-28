import React, { useState } from 'react';
import './LongFormQuestion.css';

function HotTakeQuestion({ question, onAnswer, onSkip, disabled }) {
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
        <span className="question-number">question </span>
        <span className="question-type-badge">hot take</span>
      </div>

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
            [ spill ]
          </button>
        </div>
      ) : (
        <div className="long-form-answer-form">
          <textarea
            className="long-form-textarea"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="go off..."
            rows="3"
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
            ? 'share your spicy take'
            : 'time to be controversial'}
        </span>
      </div>
    </div>
  );
}

export default HotTakeQuestion;
