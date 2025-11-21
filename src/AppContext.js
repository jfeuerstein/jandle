import React, { createContext, useContext, useState, useEffect } from 'react';
import { database } from './firebase';
import { ref, set, get, onValue } from 'firebase/database';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null); // 'josh' or 'nini'
  const [currentPage, setCurrentPage] = useState('select'); // 'select', 'questions', 'inbox', 'answers'

  // Questions pool - these will be shown one at a time
  const [questionsPool] = useState([
    { id: 1, text: 'what is your earliest childhood memory?' },
    { id: 2, text: 'if you could have dinner with anyone dead or alive, who would it be?' },
    { id: 3, text: 'what song would you want played at your funeral?' },
  ]);

  // Track current question index for each user
  const [questionIndex, setQuestionIndex] = useState({ josh: 0, nini: 0 });

  // Inbox: questions answered by the other user that this user needs to answer
  // Format: { josh: [{questionId, questionText, otherUserAnswer}], nini: [...] }
  const [inbox, setInbox] = useState({ josh: [], nini: [] });

  // Answers: completed question pairs with chat threads
  // Format: { josh: [{questionId, questionText, joshAnswer, niniAnswer, messages: []}], nini: [...] }
  const [answers, setAnswers] = useState({ josh: [], nini: [] });

  // Initialize Firebase data and set up listeners
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Initialize default data structure if it doesn't exist
        const dataRef = ref(database, '/');
        const snapshot = await get(dataRef);

        if (!snapshot.exists()) {
          await set(dataRef, {
            questionIndex: { josh: 0, nini: 0 },
            inbox: { josh: [], nini: [] },
            answers: { josh: [], nini: [] }
          });
        }
      } catch (error) {
        console.error('Error initializing Firebase data:', error);
      }
    };

    initializeData();

    // Set up real-time listeners for data changes
    const questionIndexRef = ref(database, 'questionIndex');
    const inboxRef = ref(database, 'inbox');
    const answersRef = ref(database, 'answers');

    const unsubscribeQuestionIndex = onValue(questionIndexRef, (snapshot) => {
      if (snapshot.exists()) {
        setQuestionIndex(snapshot.val());
      }
    });

    const unsubscribeInbox = onValue(inboxRef, (snapshot) => {
      if (snapshot.exists()) {
        setInbox(snapshot.val());
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

    // Cleanup listeners on unmount
    return () => {
      unsubscribeQuestionIndex();
      unsubscribeInbox();
      unsubscribeAnswers();
    };
  }, []);

  const selectUser = (user) => {
    setCurrentUser(user);
    setCurrentPage('questions');
  };

  const switchPage = (page) => {
    setCurrentPage(page);
  };

  const answerQuestion = async (questionId, questionText, answer) => {
    const otherUser = currentUser === 'josh' ? 'nini' : 'josh';

    try {
      // Add to other user's inbox in Firebase
      const newInboxItem = {
        questionId,
        questionText,
        otherUserAnswer: answer,
        answeredBy: currentUser
      };

      const otherUserInbox = [...inbox[otherUser], newInboxItem];
      await set(ref(database, `inbox/${otherUser}`), otherUserInbox);

      // Move to next question in Firebase
      await set(ref(database, `questionIndex/${currentUser}`), questionIndex[currentUser] + 1);
    } catch (error) {
      console.error('Error answering question:', error);
    }
  };

  const skipQuestion = async () => {
    try {
      // Move to next question without answering in Firebase
      await set(ref(database, `questionIndex/${currentUser}`), questionIndex[currentUser] + 1);
    } catch (error) {
      console.error('Error skipping question:', error);
    }
  };

  const answerInboxQuestion = async (inboxItem, answer) => {
    try {
      // Remove from inbox in Firebase
      const updatedInbox = inbox[currentUser].filter(item => item.questionId !== inboxItem.questionId);
      await set(ref(database, `inbox/${currentUser}`), updatedInbox);

      // Create answer object for both users
      const answerObj = {
        questionId: inboxItem.questionId,
        questionText: inboxItem.questionText,
        joshAnswer: currentUser === 'josh' ? answer : inboxItem.otherUserAnswer,
        niniAnswer: currentUser === 'nini' ? answer : inboxItem.otherUserAnswer,
        messages: [] // Chat messages go here
      };

      // Add to both users' answers in Firebase
      const updatedJoshAnswers = [...answers.josh, answerObj];
      const updatedNiniAnswers = [...answers.nini, answerObj];

      await set(ref(database, 'answers/josh'), updatedJoshAnswers);
      await set(ref(database, 'answers/nini'), updatedNiniAnswers);
    } catch (error) {
      console.error('Error answering inbox question:', error);
    }
  };

  const sendMessage = async (questionId, message) => {
    try {
      const newMessage = { user: currentUser, text: message, timestamp: Date.now() };

      // Update answers for both users in Firebase
      const updatedJoshAnswers = answers.josh.map(item =>
        item.questionId === questionId
          ? { ...item, messages: [...(item.messages || []), newMessage] }
          : item
      );
      const updatedNiniAnswers = answers.nini.map(item =>
        item.questionId === questionId
          ? { ...item, messages: [...(item.messages || []), newMessage] }
          : item
      );

      await set(ref(database, 'answers/josh'), updatedJoshAnswers);
      await set(ref(database, 'answers/nini'), updatedNiniAnswers);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const getCurrentQuestion = () => {
    const index = questionIndex[currentUser];
    if (index >= questionsPool.length) {
      return null; // No more questions
    }
    return questionsPool[index];
  };

  const value = {
    currentUser,
    currentPage,
    selectUser,
    switchPage,
    questionsPool,
    questionIndex,
    inbox,
    answers,
    answerQuestion,
    skipQuestion,
    answerInboxQuestion,
    sendMessage,
    getCurrentQuestion
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
