import React from 'react';
import { useApp } from '../AppContext';
import { getCurrentTheme, THEMES } from '../utils/themeUtils';
import './Landing.css';

function Landing() {
  const { questionsLoading, startApp } = useApp();
  const currentTheme = getCurrentTheme();

  const QADictionary = {
    'your questions are ready, maam': '[ aww thank you! ]',
    'have i mentioned you look rlly pretty today': '[ thanks i love you ]',
    'phew ok all good': '[ make your self at home ]',
    'ok we\'re ready': '[ phew ]',
    'knock knock': '[ come in! ]',
    'come on in!': '[ ayo????? ]',
    'hot and fresh questions, coming right up': '[ ayo????? ]',
    'sorry that took so long': '[ its ok josh i love you and im gonna text u a reminder of how much i love you right now ]',
  };

  // Add theme-specific phrases
  if (currentTheme === THEMES.BIRTHDAY) {
    QADictionary['happy birthday babe!! your questions are ready'] = '[ omg thank you i love you!! ]';
    QADictionary['got some birthday questions for u'] = '[ aww you remembered <3 ]';
  } else if (currentTheme === THEMES.CHRISTMAS) {
    QADictionary['merry christmas! questions ready'] = '[ merry christmas i love you ]';
    QADictionary['ho ho ho your questions are here'] = '[ best gift ever tbh ]';
  }

  // Select a random Q&A pairing
  const [readyText, setReadyText] = React.useState({ question: '', answer: '' });

  React.useEffect(() => {
    if (!questionsLoading) {
      const entries = Object.entries(QADictionary);
      const randomEntry = entries[Math.floor(Math.random() * entries.length)];
      setReadyText({ question: randomEntry[0], answer: randomEntry[1] });
    }
  }, [questionsLoading]);

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
            {questionsLoading ? 'ok wait give me a sec to get everything ready' : readyText.question}
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
                {readyText.answer}
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
