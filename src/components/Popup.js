import { getCurrentTheme, THEMES } from '../utils/themeUtils';
import './Popup.css';

const Popup = ({ title, message, buttonText, onClose, showConfetti = false }) => {
  const currentTheme = getCurrentTheme();

  // Gold confetti colors for New Year's theme
  const goldConfettiColors = ['#ffd700', '#d4af37', '#f4c542', '#c5a028', '#e6b800', '#ffed4e'];

  // Default confetti colors
  const defaultConfettiColors = ['#d98fa0', '#89aacc', '#d9bf5c', '#8ab894', '#b89dd9'];

  const confettiColors = currentTheme === THEMES.NEWYEARS ? goldConfettiColors : defaultConfettiColors;

  return (
    <div className="popup">
      <div className="popup-container">
        <div className="popup-content">
          {title && <h1 className="popup-title">{title}</h1>}

          <div className="popup-message">
            {message}
          </div>
          <button className="popup-close" onClick={onClose}>
            {buttonText || '[ continue ]'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Popup;
