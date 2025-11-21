import React, { createContext, useContext, useState } from 'react';

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

  const selectUser = (user) => {
    setCurrentUser(user);
    setCurrentPage('questions');
  };

  const switchPage = (page) => {
    setCurrentPage(page);
  };

  const answerQuestion = (questionId, questionText, answer) => {
    const otherUser = currentUser === 'josh' ? 'nini' : 'josh';

    // Add to other user's inbox
    setInbox(prev => ({
      ...prev,
      [otherUser]: [
        ...prev[otherUser],
        {
          questionId,
          questionText,
          otherUserAnswer: answer,
          answeredBy: currentUser
        }
      ]
    }));

    // Move to next question
    setQuestionIndex(prev => ({
      ...prev,
      [currentUser]: prev[currentUser] + 1
    }));
  };

  const skipQuestion = () => {
    // Move to next question without answering
    setQuestionIndex(prev => ({
      ...prev,
      [currentUser]: prev[currentUser] + 1
    }));
  };

  const answerInboxQuestion = (inboxItem, answer) => {
    // Remove from inbox
    setInbox(prev => ({
      ...prev,
      [currentUser]: prev[currentUser].filter(item => item.questionId !== inboxItem.questionId)
    }));

    // Create answer object for both users
    const answerObj = {
      questionId: inboxItem.questionId,
      questionText: inboxItem.questionText,
      joshAnswer: currentUser === 'josh' ? answer : inboxItem.otherUserAnswer,
      niniAnswer: currentUser === 'nini' ? answer : inboxItem.otherUserAnswer,
      messages: [] // Chat messages go here
    };

    // Add to both users' answers
    setAnswers(prev => ({
      josh: [...prev.josh, answerObj],
      nini: [...prev.nini, answerObj]
    }));
  };

  const sendMessage = (questionId, message) => {
    // Add message to the chat thread for a specific question
    setAnswers(prev => ({
      josh: prev.josh.map(item =>
        item.questionId === questionId
          ? { ...item, messages: [...item.messages, { user: currentUser, text: message, timestamp: Date.now() }] }
          : item
      ),
      nini: prev.nini.map(item =>
        item.questionId === questionId
          ? { ...item, messages: [...item.messages, { user: currentUser, text: message, timestamp: Date.now() }] }
          : item
      )
    }));
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
