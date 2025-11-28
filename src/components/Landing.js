import React from 'react';
import { useApp } from '../AppContext';
import './Landing.css';

function Landing() {
  const { questionsLoading, startApp } = useApp();

  const handleContinue = () => {
    startApp();
  };

  return (
    <div className="landing-page">
      <div className="landing-container">
        <pre className="landing-logo">
{`_                 _ _
    (_) __ _ _ __   __| | | ___
     | |/ _' | '_ \\ / _' | |/ _ \\
     | | (_| | | | | (_| | |  __/
    _/ |\\__,_|_| |_|\\__,_|_|\\___|
   |__/                          `}
        </pre>

        <div className="landing-content">
          <h2 className="landing-title">
            {questionsLoading ? 'preparing your questions...' : 'questions ready'}
          </h2>

          {questionsLoading ? (
            <div className="landing-loading">
              <div className="loading-dots">
                <span>.</span><span>.</span><span>.</span>
              </div>
              <p className="landing-subtitle">
                powered by groq llm
              </p>
            </div>
          ) : (
            <div className="landing-ready">
              <button
                className="landing-continue-btn"
                onClick={handleContinue}
              >
                [ i am ready. ]
              </button>
              <p className="landing-subtitle">
                generated for you &#60;3
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Landing;
