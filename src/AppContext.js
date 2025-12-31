import React, { createContext, useContext, useState, useEffect } from 'react';
import { database } from './firebase';
import { ref, set, get, onValue } from 'firebase/database';
import { requestNotificationPermission, onMessageListener, showNotification } from './services/messagingService';
import { updateBadge, clearBadge } from './services/badgeService';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

// Fallback questions if LLM generation fails
const FALLBACK_QUESTIONS = [
  { id: 1, type: 'long_form', text: 'what is your earliest childhood memory?' },
  { id: 2, type: 'long_form', text: 'if you could have dinner with anyone dead or alive, who would it be?' },
  { id: 3, type: 'yes_no', text: 'do you believe in love at first sight?' },
  { id: 4, type: 'multiple_choice', text: 'how do you prefer to spend your free time?', options: ['reading or learning', 'being active or outdoors', 'socializing with friends', 'relaxing at home'] },
];

const CURRENT_USER_CACHE_KEY = 'jandle_current_user';
const APP_VERSION_KEY = 'jandle_app_version';

// Current app version - update this with each deployment
const CURRENT_VERSION = '2.0.0';

// Changelog for version updates
const VERSION_CHANGELOG = {
  '2.0.0': {
    title: 'Happy New Year! 🎉',
    changes: [
      'Added New Year\'s theme with gold and black styling',
      'Festive gold confetti animations',
      'Special New Year\'s landing page messages',
      'New version update notifications',
      'made jandle more fun!',
      '(there are now 10 new questions every 10 minutes, instead of infinite. i think that makes it more fun)',
      'added more love for the girlf'
    ],
    date: '2026-01-01'
  }
};

export const AppProvider = ({ children }) => {
  // Initialize currentUser from localStorage if available
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const cachedUser = localStorage.getItem(CURRENT_USER_CACHE_KEY);
      return (cachedUser === 'josh' || cachedUser === 'nini') ? cachedUser : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  });

  const [currentPage, setCurrentPage] = useState(() => {
    // Check if there's a new version and show popup first
    try {
      const cachedVersion = localStorage.getItem(APP_VERSION_KEY);
      const cachedUser = localStorage.getItem(CURRENT_USER_CACHE_KEY);

      // If user exists and version is different, show version popup
      if ((cachedUser === 'josh' || cachedUser === 'nini') && cachedVersion !== CURRENT_VERSION) {
        return 'version-popup';
      }

      return (cachedUser === 'josh' || cachedUser === 'nini') ? 'landing' : 'select';
    } catch (error) {
      return 'select';
    }
  }); // 'select', 'landing', 'questions', 'inbox', 'answers', 'popup', 'version-popup'

  // Questions pool - fetched from Firebase database
  const [questionPools, setQuestionPools] = useState({ josh: { questions: [], lastIndex: 0 }, nini: { questions: [], lastIndex: 0 } });
  const [questionsLoading, setQuestionsLoading] = useState(true);

  // Inbox: questions answered by the other user that this user needs to answer
  // Format: { josh: [{questionId, questionText, otherUserAnswer}], nini: [...] }
  const [inbox, setInbox] = useState({ josh: [], nini: [] });

  // Answers: completed question pairs with chat threads
  // Format: { josh: [{questionId, questionText, joshAnswer, niniAnswer, messages: []}], nini: [...] }
  const [answers, setAnswers] = useState({ josh: [], nini: [] });

  // Viewed status: tracks what each user has viewed
  // Format: { josh: { questionId: { lastViewed: timestamp, lastMessageCount: number } }, nini: {...} }
  const [viewedStatus, setViewedStatus] = useState({ josh: {}, nini: {} });

  // Set up listener for question pools from Firebase
  useEffect(() => {
    const questionPoolsRef = ref(database, 'questionPools');

    const unsubscribe = onValue(questionPoolsRef, (snapshot) => {
      if (snapshot.exists()) {
        const poolsData = snapshot.val();
        setQuestionPools({
          josh: poolsData.josh || { questions: [], lastIndex: 0 },
          nini: poolsData.nini || { questions: [], lastIndex: 0 }
        });
        console.log('Loaded question pools from database');
      } else {
        // Initialize empty pools if they don't exist
        setQuestionPools({
          josh: { questions: [], lastIndex: 0 },
          nini: { questions: [], lastIndex: 0 }
        });
        console.log('No question pools found in database');
      }
      setQuestionsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Initialize Firebase data and set up listeners
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Initialize default data structure if it doesn't exist
        const dataRef = ref(database, '/');
        const snapshot = await get(dataRef);

        if (!snapshot.exists()) {
          await set(dataRef, {
            inbox: { josh: [], nini: [] },
            answers: { josh: [], nini: [] },
            viewedStatus: { josh: {}, nini: {} }
          });
        }
      } catch (error) {
        console.error('Error initializing Firebase data:', error);
      }
    };

    initializeData();

    // Set up real-time listeners for data changes
    const inboxRef = ref(database, 'inbox');
    const answersRef = ref(database, 'answers');
    const viewedStatusRef = ref(database, 'viewedStatus');

    const unsubscribeInbox = onValue(inboxRef, (snapshot) => {
      if (snapshot.exists()) {
        const inboxData = snapshot.val();
        // Ensure inbox values are arrays (Firebase stores empty arrays as null)
        setInbox({
          josh: inboxData.josh || [],
          nini: inboxData.nini || []
        });
      }
    });

    const unsubscribeAnswers = onValue(answersRef, (snapshot) => {
      if (snapshot.exists()) {
        const answersData = snapshot.val();
        // Ensure all answer objects have a messages array
        const normalizedAnswers = {
          josh: (answersData.josh || []).map(answer => ({
            ...answer,
            messages: answer.messages || []
          })),
          nini: (answersData.nini || []).map(answer => ({
            ...answer,
            messages: answer.messages || []
          }))
        };
        setAnswers(normalizedAnswers);
      }
    });

    const unsubscribeViewedStatus = onValue(viewedStatusRef, (snapshot) => {
      if (snapshot.exists()) {
        setViewedStatus(snapshot.val());
      } else {
        // Initialize viewedStatus if it doesn't exist in Firebase
        setViewedStatus({ josh: {}, nini: {} });
      }
    });

    // Cleanup listeners on unmount
    return () => {
      unsubscribeInbox();
      unsubscribeAnswers();
      unsubscribeViewedStatus();
    };
  }, []);

  // Initialize notifications and update badge when user logs in
  useEffect(() => {
    if (!currentUser) return;

    // Request notification permission (with delay to ensure service worker is ready)
    const initNotifications = async () => {
      try {
        // Wait a bit for service worker to fully activate
        await new Promise(resolve => setTimeout(resolve, 1000));
        await requestNotificationPermission(currentUser);
      } catch (error) {
        console.error('Error initializing notifications:', error);
      }
    };

    initNotifications();

    // Set up foreground message listener
    onMessageListener()
      .then((payload) => {
        console.log('Received foreground message:', payload);

        // Show notification when app is in foreground
        const title = payload.notification?.title || 'jandle';
        const body = payload.notification?.body || 'You have a new notification';

        showNotification(title, {
          body,
          data: payload.data
        });
      })
      .catch((error) => {
        console.error('Error setting up message listener:', error);
      });
  }, [currentUser]);

  // Update badge whenever inbox, answers, or viewedStatus changes
  useEffect(() => {
    if (!currentUser) return;

    const updateBadgeCount = async () => {
      try {
        await updateBadge(
          currentUser,
          inbox[currentUser] || [],
          answers[currentUser] || [],
          viewedStatus[currentUser] || {}
        );
      } catch (error) {
        console.error('Error updating badge:', error);
      }
    };

    updateBadgeCount();
  }, [currentUser, inbox, answers, viewedStatus]);

  const selectUser = (user) => {
    try {
      // Save user selection to localStorage for persistence across reloads
      localStorage.setItem(CURRENT_USER_CACHE_KEY, user);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
    setCurrentUser(user);
    setCurrentPage('landing');
  };

  const switchPage = (page) => {
    setCurrentPage(page);
  };

  const logout = async () => {
    try {
      // Clear badge on logout
      await clearBadge();

      // Clear user from localStorage
      localStorage.removeItem(CURRENT_USER_CACHE_KEY);

      // Reset state
      setCurrentUser(null);
      setCurrentPage('select');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const startApp = () => {
    // Called from landing page when user clicks continue
    setCurrentPage('questions');
  };

  const acknowledgeVersion = () => {
    // Update the stored version and move to landing page
    try {
      localStorage.setItem(APP_VERSION_KEY, CURRENT_VERSION);
    } catch (error) {
      console.error('Error saving version to localStorage:', error);
    }
    setCurrentPage('landing');
  };

  const getVersionInfo = () => {
    return VERSION_CHANGELOG[CURRENT_VERSION] || null;
  };

  const answerQuestion = async (questionId, questionText, answer, questionType, questionData) => {
    const otherUser = currentUser === 'josh' ? 'nini' : 'josh';

    try {
      // Add to other user's inbox in Firebase with question type data
      // Only include optional properties if they exist (Firebase doesn't allow undefined values)
      const newInboxItem = {
        questionId,
        questionText,
        questionType: questionType || 'long_form',
        otherUserAnswer: answer,
        answeredBy: currentUser
      };

      // Conditionally add optional properties only if they're defined
      if (questionData?.options) {
        newInboxItem.questionOptions = questionData.options;
      }
      if (questionData?.items) {
        newInboxItem.questionItems = questionData.items;
      }
      if (questionData?.scenario) {
        newInboxItem.questionScenario = questionData.scenario;
      }
      if (questionData?.option1) {
        newInboxItem.questionOption1 = questionData.option1;
      }
      if (questionData?.option2) {
        newInboxItem.questionOption2 = questionData.option2;
      }

      // Firebase stores empty arrays as null, so we need to handle that
      const otherUserInbox = [...(inbox[otherUser] || []), newInboxItem];
      await set(ref(database, `inbox/${otherUser}`), otherUserInbox);

      // Move to next question in Firebase (update lastIndex in questionPools)
      const userPool = questionPools[currentUser];
      await set(ref(database, `questionPools/${currentUser}/lastIndex`), userPool.lastIndex + 1);
    } catch (error) {
      console.error('Error answering question:', error);
    }
  };

  const skipQuestion = async () => {
    try {
      // Move to next question without answering in Firebase (update lastIndex in questionPools)
      const userPool = questionPools[currentUser];
      await set(ref(database, `questionPools/${currentUser}/lastIndex`), userPool.lastIndex + 1);
    } catch (error) {
      console.error('Error skipping question:', error);
    }
  };

  const answerInboxQuestion = async (inboxItem, answer) => {
    try {
      // Remove from inbox in Firebase (handle null from Firebase)
      const updatedInbox = (inbox[currentUser] || []).filter(item => item.questionId !== inboxItem.questionId);
      await set(ref(database, `inbox/${currentUser}`), updatedInbox);

      // Create answer object for both users
      const answerObj = {
        questionId: inboxItem.questionId,
        questionText: inboxItem.questionText,
        joshAnswer: currentUser === 'josh' ? answer : inboxItem.otherUserAnswer,
        niniAnswer: currentUser === 'nini' ? answer : inboxItem.otherUserAnswer,
        messages: [] // Chat messages go here
      };

      // Add to both users' answers in Firebase (handle null from Firebase)
      const updatedJoshAnswers = [...(answers.josh || []), answerObj];
      const updatedNiniAnswers = [...(answers.nini || []), answerObj];

      await set(ref(database, 'answers/josh'), updatedJoshAnswers);
      await set(ref(database, 'answers/nini'), updatedNiniAnswers);
    } catch (error) {
      console.error('Error answering inbox question:', error);
    }
  };

  const sendMessage = async (questionId, message) => {
    try {
      const newMessage = { user: currentUser, text: message, timestamp: Date.now() };

      // Update answers for both users in Firebase (handle null from Firebase)
      const updatedJoshAnswers = (answers.josh || []).map(item =>
        item.questionId === questionId
          ? { ...item, messages: [...(item.messages || []), newMessage] }
          : item
      );
      const updatedNiniAnswers = (answers.nini || []).map(item =>
        item.questionId === questionId
          ? { ...item, messages: [...(item.messages || []), newMessage] }
          : item
      );

      await set(ref(database, 'answers/josh'), updatedJoshAnswers);
      await set(ref(database, 'answers/nini'), updatedNiniAnswers);

      // Mark as viewed for the sender so they don't see their own message as "new"
      const answer = (currentUser === 'josh' ? updatedJoshAnswers : updatedNiniAnswers)
        .find(a => a.questionId === questionId);

      if (answer) {
        const messageCount = answer.messages?.length || 0;
        const updatedViewedStatus = {
          ...(viewedStatus[currentUser] || {}),
          [questionId]: {
            lastViewed: Date.now(),
            lastMessageCount: messageCount
          }
        };
        await set(ref(database, `viewedStatus/${currentUser}`), updatedViewedStatus);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const getCurrentQuestion = () => {
    if (!currentUser) {
      return null;
    }
    const userPool = questionPools[currentUser];
    if (!userPool || !userPool.questions || userPool.questions.length === 0) {
      return null;
    }
    const index = userPool.lastIndex || 0;
    if (index >= userPool.questions.length) {
      return null;
    }
    return userPool.questions[index];
  };

  const markAnswerAsViewed = async (questionId) => {
    if (!currentUser) {
      console.log('markAnswerAsViewed: no currentUser');
      return;
    }

    try {
      // Find the answer to get the current message count
      const answer = answers[currentUser]?.find(a => a.questionId === questionId);
      if (!answer) {
        console.log('markAnswerAsViewed: answer not found for questionId:', questionId);
        return;
      }

      const messageCount = answer.messages?.length || 0;

      // Update viewed status in Firebase
      const updatedViewedStatus = {
        ...(viewedStatus[currentUser] || {}),
        [questionId]: {
          lastViewed: Date.now(),
          lastMessageCount: messageCount
        }
      };

      console.log('Marking answer as viewed:', questionId, 'messageCount:', messageCount);
      await set(ref(database, `viewedStatus/${currentUser}`), updatedViewedStatus);
      console.log('Successfully marked as viewed');
    } catch (error) {
      console.error('Error marking answer as viewed:', error);
    }
  };

  const value = {
    currentUser,
    currentPage,
    selectUser,
    switchPage,
    logout,
    startApp,
    acknowledgeVersion,
    getVersionInfo,
    questionsPool: currentUser ? questionPools[currentUser]?.questions || [] : [],
    questionsLoading,
    questionPools,
    inbox,
    answers,
    viewedStatus,
    answerQuestion,
    skipQuestion,
    answerInboxQuestion,
    sendMessage,
    getCurrentQuestion,
    markAnswerAsViewed
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
