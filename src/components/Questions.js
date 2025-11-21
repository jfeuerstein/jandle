import React, { useState } from 'react';
import { useApp } from '../AppContext';
import './Questions.css';

function Questions() {
  const { getCurrentQuestion, answerQuestion, skipQuestion } = useApp();
  const [answer, setAnswer] = useState('');
  const [showInput, setShowInput] = useState(false);

  const currentQuestion = getCurrentQuestion();

  const handleAnswer = () => {
    if (answer.trim()) {
      answerQuestion(currentQuestion.id, currentQuestion.text, answer);
      setAnswer('');
      setShowInput(false);
    }
  };

  const handleSkip = () => {
    skipQuestion();
    setAnswer('');
    setShowInput(false);
  };

  const handleAnswerClick = () => {
    setShowInput(true);
  };

  if (!currentQuestion) {
    return (
      <div className="questions-page">
        <div className="questions-container">
          <div className="question-card">
            <pre className="question-empty-art">
{`┌──────────────────────────────┐
│                              │
│      no more questions       │
│                              │
│   check your inbox for new   │
│     questions to answer      │
│                              │
└──────────────────────────────┘`}
            </pre>
            <p className="question-empty-message">
              you've gone through all available questions for now
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="questions-page">
      <div className="questions-container">
        <div className="question-card">
          <div className="question-header">
            <span className="question-number">question {currentQuestion.id}</span>
          </div>

          <div className="question-text">
            {currentQuestion.text}
          </div>

          {!showInput ? (
            <div className="question-actions">
              <button
                className="question-btn question-btn-skip"
                onClick={handleSkip}
              >
                [ skip ]
              </button>
              <button
                className="question-btn question-btn-answer"
                onClick={handleAnswerClick}
              >
                [ answer ]
              </button>
            </div>
          ) : (
            <div className="question-answer-form">
              <textarea
                className="question-textarea"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="type your answer here..."
                rows="6"
                autoFocus
              />
              <div className="question-actions">
                <button
                  className="question-btn question-btn-cancel"
                  onClick={() => {
                    setShowInput(false);
                    setAnswer('');
                  }}
                >
                  [ cancel ]
                </button>
                <button
                  className="question-btn question-btn-submit"
                  onClick={handleAnswer}
                  disabled={!answer.trim()}
                >
                  [ submit ]
                </button>
              </div>
            </div>
          )}

          <div className="question-footer">
            <span className="question-hint">
              {showInput
                ? 'your answer will be sent to the other user\'s inbox'
                : 'swipe through questions like a dating app'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Questions;
