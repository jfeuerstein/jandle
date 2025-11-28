import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import QuestionRenderer from './QuestionRenderer';
import BirthdayPopup from './BirthdayPopup';
import { getCurrentTheme, THEMES } from '../utils/themeUtils';
import './Questions.css';

const BIRTHDAY_CARD_VIEWED_KEY = 'jandle_birthday_card_viewed_2024';

function Questions() {
  const { getCurrentQuestion, answerQuestion, skipQuestion, questionsLoading, questionsPool, switchPage, currentUser } = useApp();
  const [showBirthdayPopup, setShowBirthdayPopup] = useState(false);

  useEffect(() => {
    // Only show popup for nini during birthday theme if not viewed
    const theme = getCurrentTheme();
    const hasViewed = localStorage.getItem(BIRTHDAY_CARD_VIEWED_KEY);

    if (theme === THEMES.BIRTHDAY && !hasViewed) {
      // Show popup after a short delay
      const timer = setTimeout(() => {
        setShowBirthdayPopup(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentUser]);

  const handleBirthdayAccept = () => {
    setShowBirthdayPopup(false);
    switchPage('birthday-puzzle');
  };

  const handleBirthdayClose = () => {
    setShowBirthdayPopup(false);
  };

  const currentQuestion = getCurrentQuestion();

  // Show loading state while questions are being generated
  if (questionsLoading) {
    return (
      <div className="questions-page">
        <div className="questions-container">
          <div className="question-card">
            <pre className="question-empty-art">
{`┌──────────────────────────────┐
│                              │
│   generating questions...    │
│                              │
│      powered by groq llm     │
│                              │
└──────────────────────────────┘`}
            </pre>
            <p className="question-empty-message">
              creating unique questions just for you
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleAnswer = (answer) => {
    if (answer) {
      answerQuestion(currentQuestion.id, currentQuestion.text, answer, currentQuestion.type, currentQuestion);
    }
  };

  const handleSkip = () => {
    skipQuestion();
  };

  // Show loading state while generating more questions
  if (currentQuestion?.type === 'loading') {
    return (
      <div className="questions-page">
        <div className="questions-container">
          <div className="question-card">
            <pre className="question-empty-art">
{`┌──────────────────────────────┐
│                              │
│  generating more questions   │
│                              │
│      powered by groq llm     │
│                              │
└──────────────────────────────┘`}
            </pre>
            <p className="question-empty-message">
              creating more unique questions for you
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Only show "no more questions" if we've loaded questions and truly have none
  // This prevents flashing between states on initial load
  if (!currentQuestion && !questionsLoading && questionsPool.length === 0) {
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

  // If no current question but questions are still loading or pool exists,
  // show loading state to prevent flash
  if (!currentQuestion) {
    return (
      <div className="questions-page">
        <div className="questions-container">
          <div className="question-card">
            <pre className="question-empty-art">
{`┌──────────────────────────────┐
│                              │
│  generating more questions   │
│                              │
│      powered by groq llm     │
│                              │
└──────────────────────────────┘`}
            </pre>
            <p className="question-empty-message">
              creating more unique questions for you
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {showBirthdayPopup && (
        <BirthdayPopup
          onClose={handleBirthdayClose}
          onAccept={handleBirthdayAccept}
        />
      )}
      <div className="questions-page">
        <div className="questions-container">
          <div className="question-card">
            <QuestionRenderer
              question={currentQuestion}
              onAnswer={handleAnswer}
              onSkip={handleSkip}
              mode="questions"
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default Questions;
