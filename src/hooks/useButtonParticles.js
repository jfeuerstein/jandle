import { useEffect } from 'react';
import { getCurrentTheme, THEMES } from '../utils/themeUtils';

/**
 * Hook to add particle burst effects to button clicks
 * Automatically uses theme-appropriate colors
 */
export const useButtonParticles = () => {
  useEffect(() => {
    const handleButtonClick = (e) => {
      const theme = getCurrentTheme();

      // Only add particles for themed periods
      if (theme === THEMES.DEFAULT) {
        return;
      }

      // Check if the clicked element is a button or inside a button
      const button = e.target.closest('button');
      if (!button) {
        return;
      }

      const rect = button.getBoundingClientRect();
      const x = e.clientX;
      const y = e.clientY;

      // Determine particle count and colors based on theme
      let particleCount, colors;
      if (theme === THEMES.BIRTHDAY) {
        particleCount = 10;
        colors = ['#d98fa0', '#89aacc', '#d9bf5c', '#8ab894', '#b89dd9', '#d9a87a', '#d9d3c8'];
      } else if (theme === THEMES.CHRISTMAS) {
        particleCount = 10;
        colors = ['#d1dce6', '#9cb3c2', '#89a8cc', '#8fc9c9', '#d9c78a'];
      }

      // Create particle burst
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'button-particle';

        // Random angle and velocity
        const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
        const velocity = 50 + Math.random() * 50;
        const dx = Math.cos(angle) * velocity;
        const dy = Math.sin(angle) * velocity;

        // Random color from theme palette
        const color = colors[Math.floor(Math.random() * colors.length)];

        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.backgroundColor = color;
        particle.style.setProperty('--dx', `${dx}px`);
        particle.style.setProperty('--dy', `${dy}px`);

        // Snowflake particle for Christmas theme
        if (theme === THEMES.CHRISTMAS) {
          particle.textContent = '❄';
          particle.style.backgroundColor = 'transparent';
          particle.style.color = color;
          particle.style.fontSize = '0.8rem';
        }

        document.body.appendChild(particle);

        // Remove particle after animation
        setTimeout(() => {
          particle.remove();
        }, 800);
      }
    };

    document.addEventListener('click', handleButtonClick);

    return () => {
      document.removeEventListener('click', handleButtonClick);
    };
  }, []);
};
