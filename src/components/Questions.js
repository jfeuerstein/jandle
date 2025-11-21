import React, { useState } from 'react';
import { useApp } from '../AppContext';
import QuestionRenderer from './QuestionRenderer';
import './Questions.css';

function Questions() {
  const { getCurrentQuestion, answerQuestion, skipQuestion } = useApp();
  const [answer, setAnswer] = useState('');
  const [showInput, setShowInput] = useState(false);

  const currentQuestion = getCurrentQuestion();

  // Helper to check if answer is valid
  const isAnswerValid = () => {
    if (!answer) return false;

    // For string answers
    if (typeof answer === 'string') {
      return answer.trim().length > 0;
    }

    // For object answers (yes/no, multiple choice with elaboration)
    if (typeof answer === 'object') {
      // Must have a choice
      return answer.choice !== undefined && answer.choice !== '';
    }

    return false;
  };

  const handleAnswer = () => {
    if (isAnswerValid()) {
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
              <QuestionRenderer
                question={currentQuestion}
                answer={answer}
                onAnswerChange={setAnswer}
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
                  disabled={!isAnswerValid()}
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
