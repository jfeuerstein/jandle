// Badge API Service for showing unread counts on app icon
// Works on iOS PWA, Android PWA, and desktop

/**
 * Check if Badge API is supported
 * @returns {boolean} True if Badge API is supported
 */
export const isBadgeSupported = () => {
  return 'setAppBadge' in navigator && 'clearAppBadge' in navigator;
};

/**
 * Set the app badge with a count
 * @param {number} count - The number to display on the badge
 * @returns {Promise<boolean>} True if successful
 */
export const setBadge = async (count) => {
  try {
    if (!isBadgeSupported()) {
      console.log('Badge API not supported on this device');
      return false;
    }

    if (count > 0) {
      await navigator.setAppBadge(count);
      console.log(`Badge set to ${count}`);
      return true;
    } else {
      // Clear badge if count is 0
      await navigator.clearAppBadge();
      console.log('Badge cleared');
      return true;
    }
  } catch (error) {
    console.error('Error setting badge:', error);
    return false;
  }
};

/**
 * Clear the app badge
 * @returns {Promise<boolean>} True if successful
 */
export const clearBadge = async () => {
  try {
    if (!isBadgeSupported()) {
      console.log('Badge API not supported on this device');
      return false;
    }

    await navigator.clearAppBadge();
    console.log('Badge cleared');
    return true;
  } catch (error) {
    console.error('Error clearing badge:', error);
    return false;
  }
};

/**
 * Calculate unread count for a user
 * @param {string} userId - The user ID (josh or nini)
 * @param {Array} inbox - User's inbox items
 * @param {Array} answers - User's answers
 * @param {Object} viewedStatus - User's viewed status
 * @returns {number} Total unread count
 */
export const calculateUnreadCount = (userId, inbox, answers, viewedStatus) => {
  try {
    // Count unread inbox items
    const inboxCount = inbox ? inbox.length : 0;

    // Count unread messages in answers
    let unreadMessagesCount = 0;

    if (answers && answers.length > 0) {
      answers.forEach(answer => {
        const questionId = answer.questionId;
        const messages = answer.messages || [];
        const messageCount = messages.length;

        // Check if there are new messages since last viewed
        const viewed = viewedStatus?.[questionId];
        const lastViewedCount = viewed?.lastMessageCount || 0;

        if (messageCount > lastViewedCount) {
          unreadMessagesCount += (messageCount - lastViewedCount);
        }
      });
    }

    const totalUnread = inboxCount + unreadMessagesCount;
    console.log(`Unread count for ${userId}: ${totalUnread} (inbox: ${inboxCount}, messages: ${unreadMessagesCount})`);

    return totalUnread;
  } catch (error) {
    console.error('Error calculating unread count:', error);
    return 0;
  }
};

/**
 * Update badge based on user data
 * @param {string} userId - The user ID
 * @param {Array} inbox - User's inbox
 * @param {Array} answers - User's answers
 * @param {Object} viewedStatus - User's viewed status
 * @returns {Promise<number>} The unread count
 */
export const updateBadge = async (userId, inbox, answers, viewedStatus) => {
  try {
    const unreadCount = calculateUnreadCount(userId, inbox, answers, viewedStatus);
    await setBadge(unreadCount);
    return unreadCount;
  } catch (error) {
    console.error('Error updating badge:', error);
    return 0;
  }
};

/**
 * Request badge permission (for browsers that require it)
 * Most browsers don't require permission for badges, but this is for future compatibility
 * @returns {Promise<boolean>} True if permission granted or not required
 */
export const requestBadgePermission = async () => {
  try {
    // Most browsers don't require permission for badges
    // This is for future compatibility if browsers start requiring it
    if ('permissions' in navigator) {
      const result = await navigator.permissions.query({ name: 'notifications' });
      return result.state === 'granted';
    }
    return true;
  } catch (error) {
    // If permission query fails, assume it's not required
    console.log('Badge permission query not supported, assuming granted');
    return true;
  }
};
