import React from 'react';
import './BirthdayCard.css';

const BirthdayCard = ({ onClose }) => {
  return (
    <div className="birthday-card">
      <div className="birthday-card-container">
        <div className="birthday-card-content">
          <h1 className="birthday-card-title">hi nini</h1>

          <div className="birthday-card-message">
            <p>
              it's hard to put into words the energy, light, and love you bring into my life.
            </p>
            <p>
              you're a blessing to each and every person lucky enough to have you in their lives,
              bringing unquantifiable smiles, joy, and warmth wherever you go. you're endlessly
              smart, thoughtful, caring, and kind, and i admire you to no end.
            </p>
            <p>
              you're also hot as fuck
            </p>
            <p>
              but i didn't write this just to glaze you. though i could do that all day.
              today (er, well. wednesday) is your special day, and i want to celebrate you. thank you for being you,
              for all the little things you do that make such a big difference in my life.
              i hope this year brings you as much happiness and love as you give to everyone around you.
            </p>
            <p>
              as you enter this next chapter, remeber that i'm here for you. through ups AND downs.
            </p>
            <p>
              just like you've shown me endless support and compassion, i hope to be the support system you never seem to be able to ask for.
              you're strong, you're capable, but you're also so deeply loved. never forget that.
            </p>

            <p className="birthday-card-signature">
              love you more than words can say,<br />
              josh &lt;3
            </p>
          </div>

          <div className="birthday-card-confetti">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="card-confetti-piece"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${3 + Math.random() * 2}s`,
                  backgroundColor: ['#d98fa0', '#89aacc', '#d9bf5c', '#8ab894', '#b89dd9'][Math.floor(Math.random() * 5)]
                }}
              />
            ))}
          </div>

          <button className="birthday-card-close" onClick={onClose}>
            [ ok now back to jandle ]
          </button>
        </div>
      </div>
    </div>
  );
};

export default BirthdayCard;
