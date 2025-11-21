import React, { useState } from 'react';
import { useApp } from '../AppContext';
import QuestionRenderer from './QuestionRenderer';
import './Inbox.css';

function Inbox() {
  const { currentUser, inbox, answers, answerInboxQuestion } = useApp();
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  // Filter out questions that have already been answered
  const rawInbox = inbox[currentUser] || [];
  const userAnswers = answers[currentUser] || [];
  const answeredQuestionIds = new Set(userAnswers.map(a => a.questionId));
  const userInbox = rawInbox.filter(item => !answeredQuestionIds.has(item.questionId));

  const handleSelectQuestion = (item) => {
    setSelectedQuestion(item);
  };

  const handleSubmitAnswer = (answer) => {
    if (answer && selectedQuestion) {
      answerInboxQuestion(selectedQuestion, answer);
      setSelectedQuestion(null);
    }
  };

  const handleCancel = () => {
    setSelectedQuestion(null);
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
                  question={{
                    id: selectedQuestion.questionId,
                    text: selectedQuestion.questionText,
                    type: selectedQuestion.questionType || 'long_form',
                    options: selectedQuestion.questionOptions,
                    scenario: selectedQuestion.questionScenario
                  }}
                  onAnswer={handleSubmitAnswer}
                  onSkip={handleCancel}
                  mode="inbox"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Inbox;
