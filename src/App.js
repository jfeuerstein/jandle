import React from 'react';
import { AppProvider, useApp } from './AppContext';
import UserSelect from './components/UserSelect';
import Navigation from './components/Navigation';
import Questions from './components/Questions';
import Inbox from './components/Inbox';
import Answers from './components/Answers';
import './App.css';

function AppContent() {
  const { currentUser, currentPage } = useApp();

  if (!currentUser) {
    return <UserSelect />;
  }

  return (
    <div className="app-main">
      <Navigation />
      <div className="app-content">
        {currentPage === 'questions' && <Questions />}
        {currentPage === 'inbox' && <Inbox />}
        {currentPage === 'answers' && <Answers />}
      </div>
    </div>
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
