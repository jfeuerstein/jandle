import React from 'react';
import { useApp } from '../AppContext';
import './UserSelect.css';

function UserSelect() {
  const { selectUser } = useApp();

  return (
    <div className="user-select">
      <div className="user-select-container">
        <pre className="ascii-logo">
{`┌──────────────────────────────┐
│                              │
│         j a n d l e          │
│                              │
│    question & answer app     │
│                              │
└──────────────────────────────┘`}
        </pre>

        <p className="user-select-prompt">who are you?</p>

        <div className="user-buttons">
          <button
            className="user-btn user-btn-josh"
            onClick={() => selectUser('josh')}
          >
            <span className="user-icon">●</span>
            [ josh ]
          </button>

          <button
            className="user-btn user-btn-nini"
            onClick={() => selectUser('nini')}
          >
            <span className="user-icon">●</span>
            [ nini ]
          </button>
        </div>

        <p className="user-select-subtitle">
          select a user to start exploring questions
        </p>
      </div>
    </div>
  );
}

export default UserSelect;
