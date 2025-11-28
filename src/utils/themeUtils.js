// Utility to determine the current theme based on calendar date

export const THEMES = {
  DEFAULT: 'default',
  BIRTHDAY: 'birthday',
  CHRISTMAS: 'christmas',
};

/**
 * Gets the current theme based on today's date
 * @returns {string} Theme name from THEMES constant
 */
export const getCurrentTheme = () => {
  const now = new Date();
  const month = now.getMonth() + 1; // getMonth() is 0-indexed
  const day = now.getDate();

  // Birthday: 11/29 - 12/3 (inclusive)
  if (month === 11 && day >= 29) {
    return THEMES.BIRTHDAY;
  }
  if (month === 12 && day <= 3) {
    return THEMES.BIRTHDAY;
  }

  // Christmas: 12/4 - 12/25 (inclusive)
  if (month === 12 && day >= 4 && day <= 25) {
    return THEMES.CHRISTMAS;
  }

  return THEMES.DEFAULT;
};

/**
 * Gets theme display name for debugging
 * @param {string} theme - Theme constant
 * @returns {string} Display name
 */
export const getThemeDisplayName = (theme) => {
  const names = {
    [THEMES.DEFAULT]: 'Default',
    [THEMES.BIRTHDAY]: 'Birthday',
    [THEMES.CHRISTMAS]: 'Christmas',
  };
  return names[theme] || 'Unknown';
};
