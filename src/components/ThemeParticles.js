import React from 'react';
import { THEMES } from '../utils/themeUtils';
import { useApp } from '../AppContext';
import './ThemeParticles.css';

// Generate particles once and cache them
const generateConfettiPieces = (count) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 5}s`,
    animationDuration: `${8 + Math.random() * 4}s`,
    color: ['#d98fa0', '#89aacc', '#d9bf5c', '#8ab894', '#b89dd9', '#d9a87a', '#d9d3c8'][Math.floor(Math.random() * 7)],
    rotation: Math.random() * 360,
  }));
};

const generateSnowflakes = (count) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 8}s`,
    animationDuration: `${10 + Math.random() * 8}s`,
    size: 0.3 + Math.random() * 0.7,
    opacity: 0.4 + Math.random() * 0.6,
  }));
};

const ThemeParticles = ({ theme }) => {
  const { currentPage } = useApp();
  const isLandingPage = currentPage === 'landing' || !currentPage;

  // Memoize particles to prevent regeneration on re-renders
  const confettiPiecesLarge = React.useMemo(() => generateConfettiPieces(20), []);
  const confettiPiecesSmall = React.useMemo(() => generateConfettiPieces(8), []);
  const snowflakesLarge = React.useMemo(() => generateSnowflakes(25), []);
  const snowflakesSmall = React.useMemo(() => generateSnowflakes(12), []);

  if (theme === THEMES.DEFAULT) {
    return null;
  }

  if (theme === THEMES.BIRTHDAY) {
    const confettiPieces = isLandingPage ? confettiPiecesLarge : confettiPiecesSmall;

    return (
      <div className={`theme-particles birthday-particles ${!isLandingPage ? 'particles-small' : ''}`}>
        {confettiPieces.map((piece) => (
          <div
            key={piece.id}
            className="confetti-piece"
            style={{
              left: piece.left,
              animationDelay: piece.animationDelay,
              animationDuration: piece.animationDuration,
              backgroundColor: piece.color,
              transform: `rotate(${piece.rotation}deg)`,
            }}
          />
        ))}
      </div>
    );
  }

  if (theme === THEMES.CHRISTMAS) {
    const snowflakes = isLandingPage ? snowflakesLarge : snowflakesSmall;

    return (
      <div className={`theme-particles christmas-particles ${!isLandingPage ? 'particles-small' : ''}`}>
        {snowflakes.map((flake) => (
          <div
            key={flake.id}
            className="snowflake"
            style={{
              left: flake.left,
              animationDelay: flake.animationDelay,
              animationDuration: flake.animationDuration,
              fontSize: `${flake.size}rem`,
              opacity: flake.opacity,
            }}
          >
            ❄
          </div>
        ))}
      </div>
    );
  }

  return null;
};

export default ThemeParticles;
