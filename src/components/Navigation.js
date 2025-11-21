import React from 'react';
import { useApp } from '../AppContext';
import './Navigation.css';

function Navigation() {
  const { currentUser, currentPage, switchPage, inbox, answers } = useApp();

  const inboxCount = inbox[currentUser]?.length || 0;
  const answersCount = answers[currentUser]?.length || 0;

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
            [ answers {answersCount > 0 && `(${answersCount})`} ]
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
