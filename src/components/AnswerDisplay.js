import React from 'react';
import './AnswerDisplay.css';

// Component to display answers based on their type
function AnswerDisplay({ answer }) {
  // Handle string answers (free response, long form)
  if (typeof answer === 'string') {
    return <div className="answer-display-text">{answer}</div>;
  }

  // Handle object answers (yes/no, multiple choice with elaboration)
  if (typeof answer === 'object' && answer !== null) {
    return (
      <div className="answer-display-complex">
        <div className="answer-display-choice">
          <span className="answer-display-choice-label">choice:</span>
          <span className="answer-display-choice-value">{answer.choice || answer}</span>
        </div>
        {answer.elaboration && (
          <div className="answer-display-elaboration">
            <span className="answer-display-elaboration-label">elaboration:</span>
            <p className="answer-display-elaboration-text">{answer.elaboration}</p>
          </div>
        )}
      </div>
    );
  }

  // Fallback for any other type
  return <div className="answer-display-text">{String(answer)}</div>;
}

export default AnswerDisplay;
