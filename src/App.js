import React from 'react';
import { AppProvider, useApp } from './AppContext';
import UserSelect from './components/UserSelect';
import Landing from './components/Landing';
import Navigation from './components/Navigation';
import Questions from './components/Questions';
import Inbox from './components/Inbox';
import Answers from './components/Answers';
import Popup from './components/Popup';
import PopupFlow from './components/PopupFlow';
import { anniversaryFlow2026 } from './components/popupFlowConfigs';
import ThemeParticles from './components/ThemeParticles';
import { getCurrentTheme } from './utils/themeUtils';
import { useButtonParticles } from './hooks/useButtonParticles';
import './App.css';

function AppContent() {
  const { currentUser, currentPage, switchPage, acknowledgeVersion, getVersionInfo } = useApp();
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

  // Version update popup
  if (currentPage === 'version-popup') {
    const versionInfo = getVersionInfo();

    const handleVersionClose = () => {
      acknowledgeVersion();
    };

    const changelogMessage = versionInfo
      ? `What's new:\n\n${versionInfo.changes.map(change => `• ${change}`).join('\n')}`
      : "New version available!";

    return (
      <>
        <ThemeParticles theme={currentTheme} />
        <Popup
          title={versionInfo?.title || "Update Available"}
          message={changelogMessage}
          buttonText="[ let's go! ]"
          onClose={handleVersionClose}
          showConfetti={true}
        />
      </>
    );
  }

  // Popup page - customize the message here whenever you want
  if (currentPage === 'popup') {
    const handlePopupClose = () => {
      switchPage('questions');
    };

    return (
      <>
        <ThemeParticles theme={currentTheme} />
        <Popup
          title="hi there!"
          message="This is a reusable popup.\n\nYou can hardcode any message you want here!\n\nJust edit the title, message, and buttonText props in App.js."
          buttonText="[ ok cool ]"
          onClose={handlePopupClose}
          showConfetti={false}
        />
      </>
    );
  }

  return (
    <>
      <ThemeParticles theme={currentTheme} />

      {/* Popup flows - Add your flows here */}
      <PopupFlow {...anniversaryFlow2026} />

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
