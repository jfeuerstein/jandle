import React, { useState } from 'react';
import './BirthdayPuzzle.css';

const BirthdayPuzzle = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState('');

  const puzzles = [
    {
      question: "on grand museum steps where art resides,\nbeneath the city lights and evening skies.\na moment shared, a spark, a gentle bliss,\ntwo souls connecting with a first ____.",
      answer: "kiss",
      hint: "cmon"
    },
    {
      question: "in a store of patterns, textures, and thread,\nwhere woven stories on the floor are spread.\nwe didn't meet, but 'met' in our own way,\nbeneath our feet is where this memory lay.",
      answer: "rug",
      hint: "what kind of store"
    },
    {
      question: "not quite twenty, but past the teens,\na milestone age, if you know what i mean.\nadd one to twenty, what do you see?\nthe age you're turning, can it be?",
      answer: "21",
      hint: "simple math"
    },
    {
      question: "a house of wit, of wisdom, and of pride,\nwith colors blue and bronze worn side by side.\non halloween we brought the magic alive,\nharry and cho, in this house you thrive.",
      answer: "ravenclaw",
      hint: "your hogwarts house..."
    },
    {
      question: "for months i pleaded, begged, and asked you please,\nto venture out among the orchard trees.\nto pick the fruit that grows both red and sweet,\na fall tradition, finally complete.",
      answer: "apples",
      hint: "as if i haven't harassed you enough"
    },
    {
      question: "four-legged friends with wagging tails,\nthe subject of our random tales.\na quote that's now our inside joke divine,\n'i was just thinking about' this line.",
      answer: "dogs",
      hint: "man's best friend"
    },
    {
      question: "small glowing creatures, quirky and bright,\nhidden in corners, a whimsical sight.\nin those first months when love was new,\nwe bought these figures for me and you.",
      answer: "smiski",
      hint: "tiny collectible friends"
    },
    {
      question: "a city of rain and coffee steam,\nof mountains, water, and evergreen dreams.\nright after we started, off you flew,\nto visit wifey, a trip so new.",
      answer: "seattle",
      hint: "starbs!"
    },
    {
      question: "we rolled them up with care and skill,\nveggies and herbs, a homemade thrill.\nbut what's the protein we chose that day,\nsoft and white, in every way?",
      answer: "tofu",
      hint: "the protein in our spring rolls"
    },
    {
      question: "for twenty years, through thick and thin,\na fuzzy friend who's always been.\ngiven by a friend so dear,\nyour first true love, the stuff-ed bear.",
      answer: "teddy",
      hint: "your beloved companion"
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const userAnswer = answers[currentStep]?.toLowerCase().trim();
    const correctAnswer = puzzles[currentStep].answer.toLowerCase();

    if (userAnswer === correctAnswer) {
      setError('');
      if (currentStep === puzzles.length - 1) {
        // Completed all puzzles
        onComplete();
      } else {
        setCurrentStep(currentStep + 1);
      }
    } else {
      setError('nope, try again!');
    }
  };

  const handleInputChange = (value) => {
    setAnswers({ ...answers, [currentStep]: value });
    setError('');
  };

  return (
    <div className="birthday-puzzle">
      <div className="birthday-puzzle-container">
        <div className="birthday-puzzle-header">
          <h1 className="birthday-puzzle-title">birthday riddles</h1>
          <div className="birthday-puzzle-progress">
            riddle {currentStep + 1} of {puzzles.length}
          </div>
        </div>

        <div className="birthday-puzzle-content">
          <form onSubmit={handleSubmit}>
            <div className="birthday-puzzle-question">
              {puzzles[currentStep].question}
            </div>

            <input
              type="text"
              className="birthday-puzzle-input"
              value={answers[currentStep] || ''}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="type your answer..."
              autoFocus
            />

            {error && (
              <div className="birthday-puzzle-error">
                {error}
              </div>
            )}

            <div className="birthday-puzzle-hint">
              hint: {puzzles[currentStep].hint}
            </div>

            <button type="submit" className="birthday-puzzle-submit">
              [ submit ]
            </button>
          </form>
        </div>

        <div className="birthday-puzzle-progress-dots">
          {puzzles.map((_, index) => (
            <div
              key={index}
              className={`puzzle-dot ${index < currentStep ? 'completed' : ''} ${index === currentStep ? 'active' : ''}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BirthdayPuzzle;
