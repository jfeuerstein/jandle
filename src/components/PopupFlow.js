import { useState, useEffect } from 'react';
import { getCurrentTheme, THEMES } from '../utils/themeUtils';
import './PopupFlow.css';

const PopupFlow = ({
  flowId,
  pages,
  showAfter,
  showBefore,
  onComplete
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const currentTheme = getCurrentTheme();

  useEffect(() => {
    const checkVisibility = () => {
      // Check if already shown
      const hasShown = localStorage.getItem(`popup-flow-${flowId}`);
      if (hasShown) {
        return false;
      }

      const now = new Date();

      // Check date conditions
      if (showAfter) {
        const afterDate = new Date(showAfter);
        if (now < afterDate) {
          return false;
        }
      }

      if (showBefore) {
        const beforeDate = new Date(showBefore);
        if (now > beforeDate) {
          return false;
        }
      }

      return true;
    };

    setIsVisible(checkVisibility());
  }, [flowId, showAfter, showBefore]);

  if (!isVisible || !pages || pages.length === 0) {
    return null;
  }

  const currentPageData = pages[currentPage];
  const isLastPage = currentPage === pages.length - 1;

  const handleNext = () => {
    if (isLastPage) {
      // Mark as shown
      localStorage.setItem(`popup-flow-${flowId}`, 'true');
      setIsVisible(false);
      if (onComplete) {
        onComplete();
      }
    } else {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Gold confetti colors for New Year's theme
  const goldConfettiColors = ['#ffd700', '#d4af37', '#f4c542', '#c5a028', '#e6b800', '#ffed4e'];
  const defaultConfettiColors = ['#d98fa0', '#89aacc', '#d9bf5c', '#8ab894', '#b89dd9'];
  const confettiColors = currentTheme === THEMES.NEWYEARS ? goldConfettiColors : defaultConfettiColors;

  return (
    <div className="popup-flow">
      <div className="popup-flow-container">
        <div className="popup-flow-content">
          {currentPageData.title && (
            <h1 className="popup-flow-title">{currentPageData.title}</h1>
          )}

          {currentPageData.image && (
            <div className="popup-flow-image spin-image">
              <img src={currentPageData.image} alt={currentPageData.imageAlt || 'Flow image'} />
            </div>
          )}

          {currentPageData.message && (
            <div className="popup-flow-message">
              {typeof currentPageData.message === 'string'
                ? currentPageData.message
                : currentPageData.message}
            </div>
          )}

          <div className="popup-flow-navigation">
            {currentPage > 0 && (
              <button
                className="popup-flow-button popup-flow-button-secondary"
                onClick={handlePrevious}
              >
                {currentPageData.previousText || '[ back ]'}
              </button>
            )}
            <button
              className="popup-flow-button popup-flow-button-primary"
              onClick={handleNext}
            >
              {isLastPage
                ? (currentPageData.closeText || '[ close ]')
                : (currentPageData.nextText || '[ next ]')}
            </button>
          </div>

          {pages.length > 1 && (
            <div className="popup-flow-dots">
              {pages.map((_, index) => (
                <span
                  key={index}
                  className={`popup-flow-dot ${index === currentPage ? 'active' : ''}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PopupFlow;
