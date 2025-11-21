import React, { createContext, useContext, useState } from 'react';
import { QUESTION_TYPES } from './questionTypes';

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
    {
      id: 1,
      type: QUESTION_TYPES.FREE_RESPONSE,
      text: 'what is your earliest childhood memory?'
    },
    {
      id: 2,
      type: QUESTION_TYPES.YES_NO,
      text: 'do you believe in soulmates?'
    },
    {
      id: 3,
      type: QUESTION_TYPES.MULTIPLE_CHOICE,
      text: 'which superpower would you choose?',
      options: [
        'flying',
        'invisibility',
        'time travel',
        'reading minds',
        'teleportation'
      ]
    },
    {
      id: 4,
      type: QUESTION_TYPES.LONG_FORM,
      text: 'what would you do in this situation?',
      story: `you're at a coffee shop when you overhear someone at the next table sharing deeply personal information about a mutual friend. the information is something your friend explicitly told you in confidence.

the person talking doesn't know you're there. your friend would be devastated to know this is being shared.

what do you do?`
    },
    {
      id: 5,
      type: QUESTION_TYPES.FREE_RESPONSE,
      text: 'if you could have dinner with anyone dead or alive, who would it be?'
    },
    {
      id: 6,
      type: QUESTION_TYPES.MULTIPLE_CHOICE,
      text: 'what\'s your ideal way to spend a sunday morning?',
      options: [
        'sleeping in until noon',
        'early morning workout',
        'breakfast with friends',
        'reading in bed',
        'getting work done while it\'s quiet'
      ]
    },
    {
      id: 7,
      type: QUESTION_TYPES.YES_NO,
      text: 'would you rather know when you\'re going to die or how you\'re going to die?'
    },
    {
      id: 8,
      type: QUESTION_TYPES.LONG_FORM,
      text: 'how would you handle this dilemma?',
      story: `you've been offered your dream job in a city across the country. the salary is incredible, the role is perfect, and it's the opportunity you've been working toward for years.

but your best friend is going through the hardest time of their life right now and has told you that having you nearby is one of the few things keeping them going.

the job offer expires in 48 hours.`
    },
    {
      id: 9,
      type: QUESTION_TYPES.FREE_RESPONSE,
      text: 'what song would you want played at your funeral?'
    },
    {
      id: 10,
      type: QUESTION_TYPES.MULTIPLE_CHOICE,
      text: 'if you had to give up one forever, which would it be?',
      options: [
        'music',
        'movies & tv',
        'books',
        'video games',
        'social media'
      ]
    }
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
