import React from 'react';
import './BirthdayPopup.css';

const BirthdayPopup = ({ onClose, onAccept }) => {
  return (
    <div className="birthday-popup-overlay">
      <div className="birthday-popup">
        <div className="birthday-popup-content">
          <h2 className="birthday-popup-title">🎉</h2>
          <p className="birthday-popup-message">
            i made something special for you
          </p>
          <p className="birthday-popup-submessage">
            but first... you have to earn it ;)
          </p>
          <div className="birthday-popup-buttons">
            <button className="birthday-popup-btn primary" onClick={onAccept}>
              [ ok fine ]
            </button>
            <button className="birthday-popup-btn secondary" onClick={onClose}>
              [ maybe later ]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BirthdayPopup;
