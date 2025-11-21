import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../AppContext';
import './Answers.css';

function Answers() {
  const { currentUser, answers, sendMessage } = useApp();
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [message, setMessage] = useState('');

  const userAnswers = answers[currentUser] || [];

  // ref for scrolling to the bottom of the messages
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }


  // Keep selectedAnswer in sync with the latest data from Firebase
  useEffect(() => {
    if (selectedAnswer) {
      const updatedAnswer = userAnswers.find(
        answer => answer.questionId === selectedAnswer.questionId
      );
      if (updatedAnswer) {
        setSelectedAnswer(updatedAnswer);
        scrollToBottom();
      }
    }
  }, [answers, currentUser, selectedAnswer?.questionId]);

  // Ensure we scroll whenever the selected answer's messages change
  useEffect(() => {
    // run only when we have a selected answer
    if (!selectedAnswer) return;
    // scroll after render when messages length changes or a new question is selected
    scrollToBottom();
  }, [selectedAnswer?.messages?.length, selectedAnswer?.questionId]);

  const handleSelectAnswer = (answer) => {
    setSelectedAnswer(answer);
    setMessage('');
  };

  const handleSendMessage = () => {
    if (message.trim() && selectedAnswer) {
      sendMessage(selectedAnswer.questionId, message);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (userAnswers.length === 0) {
    return (
      <div className="answers-page">
        <div className="answers-container">
          <pre className="answers-empty-art">
{`┌──────────────────────────────┐
│                              │
│       no answers yet         │
│                              │
│  answer inbox questions to   │
│   unlock conversations       │
│                              │
└──────────────────────────────┘`}
          </pre>
          <p className="answers-empty-message">
            once both users answer a question, it will appear here
          </p>
        </div>
      </div>
    );
  }

  if (!selectedAnswer) {
    return (
      <div className="answers-page">
        <div className="answers-container">
          <div className="answers-header">
            <h2 className="answers-title">answers ({userAnswers.length})</h2>
            <p className="answers-subtitle">
              select a question to view the conversation
            </p>
          </div>

          <div className="answers-list">
            {userAnswers.map((answer, index) => (
              <div
                key={answer.questionId}
                className="answer-item"
                onClick={() => handleSelectAnswer(answer)}
              >
                <div className="answer-item-question">
                  {answer.questionText}
                </div>
                <div className="answer-item-footer">
                  <span className="answer-item-messages">
                    {(answer.messages && answer.messages.length > 0)
                      ? `${answer.messages.length} message${answer.messages.length !== 1 ? 's' : ''}`
                      : 'no messages yet'}
                  </span>
                  <span className="answer-item-action">[ view chat ]</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="answers-page">
      <div className="answers-container">
        <div className="answers-chat-header">
          <button
            className="answers-back-btn"
            onClick={() => setSelectedAnswer(null)}
          >
            ← back to answers
          </button>
        </div>

        {/* Hide other questions - only show selected question in compact form */}
        <div className="answers-list-compact">
          <div className="answer-item answer-item-selected">
            <div className="answer-item-question">
              {selectedAnswer.questionText}
            </div>
            <div className="answer-item-footer">
              <span className="answer-item-messages">
                {(selectedAnswer.messages && selectedAnswer.messages.length > 0)
                  ? `${selectedAnswer.messages.length} message${selectedAnswer.messages.length !== 1 ? 's' : ''}`
                  : 'no messages yet'}
              </span>
              <span className="answer-item-status">[ currently viewing ]</span>
            </div>
          </div>
        </div>

        <div className="answers-chat-container">
          <div className="answers-chat-question">
            <span className="answers-chat-label">question:</span>
            <p>{selectedAnswer.questionText}</p>
          </div>

          <div className="answers-chat-messages">
            <div className="chat-message chat-message-josh">
              <div className="chat-message-header">
                <span className="chat-message-user">josh</span>
              </div>
              <div className="chat-message-content">
                {selectedAnswer.joshAnswer}
              </div>
            </div>

            <div className="chat-message chat-message-nini">
              <div className="chat-message-header">
                <span className="chat-message-user">nini</span>
              </div>
              <div className="chat-message-content">
                {selectedAnswer.niniAnswer}
              </div>
            </div>

            {selectedAnswer.messages && selectedAnswer.messages.length > 0 && (
              <div className="chat-divider">
                <span>continued conversation</span>
              </div>
            )}

            {selectedAnswer.messages && selectedAnswer.messages.map((msg, index) => (
              <div
                key={index}
                className={`chat-message chat-message-${msg.user} ${
                  msg.user === currentUser ? 'chat-message-self' : ''
                }`}
              >
                <div className="chat-message-header">
                  <span className="chat-message-user">{msg.user}</span>
                  <span className="chat-message-time">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="chat-message-content">{msg.text}</div>
              </div>
            ))}
          {/* end anchor for scrolling */}
           <div style={{ float: "left", clear: "both" }} ref={messagesEndRef} />
          </div>

          <div className="answers-chat-input">
            <textarea
              className="chat-textarea"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="type a message... (press enter to send)"
              rows="3"
            />
            <button
              className="chat-send-btn"
              onClick={handleSendMessage}
              disabled={!message.trim()}
            >
              [ send ]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Answers;
