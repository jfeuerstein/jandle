import React, { useState } from 'react';
import { useApp } from '../AppContext';
import QuestionRenderer from './QuestionRenderer';
import './Inbox.css';

function Inbox() {
  const { currentUser, inbox, answerInboxQuestion, questionsPool } = useApp();
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answer, setAnswer] = useState('');

  const userInbox = inbox[currentUser] || [];

  const handleSelectQuestion = (item) => {
    setSelectedQuestion(item);
    setAnswer('');
  };

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

  const handleSubmitAnswer = () => {
    if (isAnswerValid() && selectedQuestion) {
      answerInboxQuestion(selectedQuestion, answer);
      setSelectedQuestion(null);
      setAnswer('');
    }
  };

  const handleCancel = () => {
    setSelectedQuestion(null);
    setAnswer('');
  };

  // Get the full question object from the pool
  const getQuestionFromPool = (questionId) => {
    return questionsPool.find(q => q.id === questionId);
  };

  if (userInbox.length === 0) {
    return (
      <div className="inbox-page">
        <div className="inbox-container">
          <pre className="inbox-empty-art">
{`┌──────────────────────────────┐
│                              │
│         inbox empty          │
│                              │
│   waiting for new questions  │
│    from the other user...    │
│                              │
└──────────────────────────────┘`}
          </pre>
          <p className="inbox-empty-message">
            no questions yet. the other user needs to answer questions first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="inbox-page">
      <div className="inbox-container">
        <div className="inbox-header">
          <h2 className="inbox-title">inbox ({userInbox.length})</h2>
          <p className="inbox-subtitle">
            answer these questions to unlock the conversation
          </p>
        </div>

        {!selectedQuestion ? (
          <div className="inbox-list">
            {userInbox.map((item, index) => (
              <div
                key={item.questionId}
                className="inbox-item"
                onClick={() => handleSelectQuestion(item)}
              >
                <div className="inbox-item-header">
                  <span className="inbox-item-from">
                    from: {item.answeredBy}
                  </span>
                  <span className="inbox-item-status">● unanswered</span>
                </div>
                <div className="inbox-item-question">
                  {item.questionText}
                </div>
                <div className="inbox-item-footer">
                  [ click to answer ]
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="inbox-answer-view">
            <div className="inbox-answer-header">
              <button className="inbox-back-btn" onClick={handleCancel}>
                ← back to inbox
              </button>
            </div>

            <div className="inbox-answer-card">
              <div className="inbox-answer-question">
                <span className="inbox-answer-label">question:</span>
                <p>{selectedQuestion.questionText}</p>
              </div>

              <div className="inbox-answer-hidden">
                <span className="inbox-answer-label">
                  {selectedQuestion.answeredBy}'s answer:
                </span>
                <div className="inbox-answer-hidden-box">
                  <span className="inbox-hidden-icon">🔒</span>
                  <p>answer hidden until you respond</p>
                </div>
              </div>

              <div className="inbox-answer-form">
                <label className="inbox-answer-label">your answer:</label>
                <QuestionRenderer
                  question={getQuestionFromPool(selectedQuestion.questionId)}
                  answer={answer}
                  onAnswerChange={setAnswer}
                />
                <div className="inbox-answer-actions">
                  <button
                    className="inbox-btn inbox-btn-cancel"
                    onClick={handleCancel}
                  >
                    [ cancel ]
                  </button>
                  <button
                    className="inbox-btn inbox-btn-submit"
                    onClick={handleSubmitAnswer}
                    disabled={!isAnswerValid()}
                  >
                    [ submit & unlock ]
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Inbox;
