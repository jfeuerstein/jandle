import React from 'react';
import { AppProvider, useApp } from './AppContext';
import UserSelect from './components/UserSelect';
import Landing from './components/Landing';
import Navigation from './components/Navigation';
import Questions from './components/Questions';
import Inbox from './components/Inbox';
import Answers from './components/Answers';
import BirthdayPuzzle from './components/BirthdayPuzzle';
import BirthdayCard from './components/BirthdayCard';
import ThemeParticles from './components/ThemeParticles';
import { getCurrentTheme } from './utils/themeUtils';
import { useButtonParticles } from './hooks/useButtonParticles';
import './App.css';

const BIRTHDAY_CARD_VIEWED_KEY = 'jandle_birthday_card_viewed_2024';

function AppContent() {
  const { currentUser, currentPage, switchPage } = useApp();
  const [currentTheme, setCurrentTheme] = React.useState(getCurrentTheme());

  // Enable button particle effects
  useButtonParticles();

  // Apply theme class to body
  React.useEffect(() => {
    const theme = getCurrentTheme();
    setCurrentTheme(theme);
    document.body.className = `theme-${theme}`;
  }, []);

  if (!currentUser) {
    return (
      <>
        <ThemeParticles theme={currentTheme} />
        <UserSelect />
      </>
    );
  }

  // Show landing page before entering the main app
  if (currentPage === 'landing') {
    return (
      <>
        <ThemeParticles theme={currentTheme} />
        <Landing />
      </>
    );
  }

  // Birthday puzzle page
  if (currentPage === 'birthday-puzzle') {
    const handlePuzzleComplete = () => {
      switchPage('birthday-card');
    };

    return (
      <>
        <ThemeParticles theme={currentTheme} />
        <BirthdayPuzzle onComplete={handlePuzzleComplete} />
      </>
    );
  }

  // Birthday card page
  if (currentPage === 'birthday-card') {
    const handleCardClose = () => {
      localStorage.setItem(BIRTHDAY_CARD_VIEWED_KEY, 'true');
      switchPage('questions');
    };

    return (
      <>
        <ThemeParticles theme={currentTheme} />
        <BirthdayCard onClose={handleCardClose} />
      </>
    );
  }

  return (
    <>
      <ThemeParticles theme={currentTheme} />
      <div className="app-main">
        <Navigation />
        <div className="app-content">
          {currentPage === 'questions' && <Questions />}
          {currentPage === 'inbox' && <Inbox />}
          {currentPage === 'answers' && <Answers />}
        </div>
      </div>
    </>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
