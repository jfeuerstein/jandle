import React from 'react';
import { useApp } from '../AppContext';
import './Navigation.css';

function Navigation() {
  const { currentUser, currentPage, switchPage, inbox, answers, viewedStatus } = useApp();

  const inboxCount = (inbox && currentUser) ? (inbox[currentUser]?.length || 0) : 0;

  // Calculate unviewed answers count (new answers or answers with new messages)
  const userAnswers = (answers && currentUser) ? (answers[currentUser] || []) : [];
  const userViewedStatus = (viewedStatus && currentUser) ? (viewedStatus[currentUser] || {}) : {};

  const unviewedCount = userAnswers.filter(answer => {
    const viewed = userViewedStatus[answer.questionId];
    if (!viewed) return true; // Never viewed = unviewed

    const currentMessageCount = answer.messages?.length || 0;
    const lastViewedMessageCount = viewed.lastMessageCount || 0;

    return currentMessageCount > lastViewedMessageCount; // Has new messages
  }).length;

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-header">
          <span className={`nav-user-indicator ${currentUser}`}>
            ● {currentUser}
          </span>
          <span className="nav-logo">jandle</span>
        </div>

        <div className="nav-buttons">
          <button
            className={`nav-btn ${currentPage === 'questions' ? 'active' : ''}`}
            onClick={() => switchPage('questions')}
          >
            [ questions ]
          </button>

          <button
            className={`nav-btn ${currentPage === 'inbox' ? 'active' : ''}`}
            onClick={() => switchPage('inbox')}
          >
            [ inbox {inboxCount > 0 && `(${inboxCount})`} ]
          </button>

          <button
            className={`nav-btn ${currentPage === 'answers' ? 'active' : ''}`}
            onClick={() => switchPage('answers')}
          >
            [ answers {unviewedCount > 0 && `(${unviewedCount})`} ]
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
