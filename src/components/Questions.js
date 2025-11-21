import React from 'react';
import { useApp } from '../AppContext';
import QuestionRenderer from './QuestionRenderer';
import './Questions.css';

function Questions() {
  const { getCurrentQuestion, answerQuestion, skipQuestion, questionsLoading } = useApp();

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
          <QuestionRenderer
            question={currentQuestion}
            onAnswer={handleAnswer}
            onSkip={handleSkip}
            mode="questions"
          />
        </div>
      </div>
    </div>
  );
}

export default Questions;
