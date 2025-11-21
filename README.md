# jandle

 

A question and answer web app that facilitates meaningful conversations between two users through an asymmetric Q&A flow.

 

## Project Goal

 

Jandle creates a unique conversation experience where users answer questions independently, which then unlock deeper discussions. The app encourages thoughtful responses by hiding the other person's answer until you've shared your own perspective.

 

## How It Works

 

### The Flow

 

1. **User Selection** - Choose to view the app as either Josh or Nini

2. **Questions Page** - Browse questions one at a time (dating app style)

   - Answer questions to send them to the other user's inbox

   - Skip questions you don't want to answer

3. **Inbox** - Answer questions the other user has already responded to

   - Their answer is hidden until you submit yours

   - Prevents bias and encourages authentic responses

4. **Answers** - View completed question pairs and continue the conversation

   - Both answers are revealed side-by-side

   - Chat interface for follow-up discussion

   - Each question becomes its own conversation thread

 

### User Experience

 

```

┌─────────────────────────────────────────────────────┐

│                                                     │

│  Josh answers Q1          ─────>    Q1 → Nini's    │

│                                         Inbox       │

│                                                     │

│  Nini answers Q1          ─────>    Q1 moves to    │

│  (Josh's answer hidden)              Answers        │

│                                                     │

│  Both can now see both             Chat unlocked   │

│  answers and chat                                  │

│                                                     │

└─────────────────────────────────────────────────────┘

```

 

## Implementation Plan

 

### Phase 1: Core Infrastructure ✅

- [x] Set up React app with Create React App

- [x] Implement Josh-thetic design system (CSS variables, typography)

- [x] Create global state management with React Context API

- [x] Build component architecture (UserSelect, Navigation, Pages)

 

### Phase 2: Question Flow ✅

- [x] User selection screen

- [x] Questions page with dating-app style interface

- [x] Answer/skip functionality

- [x] Question state tracking per user

 

### Phase 3: Inbox System ✅

- [x] Inbox page showing pending questions

- [x] Hidden answer display (locked until user responds)

- [x] Answer submission that unlocks both responses

 

### Phase 4: Chat Interface ✅

- [x] Answers page with question list view

- [x] Individual chat threads per question

- [x] Real-time message display

- [x] Message composition and sending

 

### Phase 5: Firebase Integration ✅

- [x] Firebase Realtime Database integration
- [x] Persistent storage across sessions
- [x] Real-time data synchronization between users

### Phase 6: Future Enhancements 🔮

- [ ] Firebase Authentication for user login

- [ ] Question generation algorithm

- [ ] Notification system for new inbox items

- [ ] Question categories and filtering

- [ ] User profiles and settings

- [ ] Mobile app version

 

## Design Philosophy

 

Jandle follows the **Josh-thetic** design principles:

 

### Visual Design

- **Monospace typography** - Courier New exclusively

- **Terminal aesthetic** - Dark background (#0a0a0a), minimal chrome

- **AOL IM inspiration** - Nostalgic color accents (yellow, blue) used sparingly

- **ASCII art** - Box-drawing characters for borders and decoration

- **Flat design** - No shadows, gradients, or 3D effects

 

### Interaction Design

- **Focus over features** - Clean, distraction-free interface

- **Immediate feedback** - Hover states, animations under 300ms

- **Keyboard accessible** - Full keyboard navigation support

- **Mobile responsive** - Works on all screen sizes

 

### Technical Approach

- **Vanilla CSS** - No preprocessors, CSS variables for theming

- **React Context** - Local state management, no external libraries

- **Component isolation** - Each component has its own CSS file

- **Performance first** - Minimal dependencies, fast load times

 

## Tech Stack



- **React 19.2** - UI framework

- **React Context API** - State management

- **Firebase Realtime Database** - Data persistence and real-time sync

- **CSS3** - Styling with custom properties

- **Create React App** - Build tooling

 

## Getting Started

 

### Prerequisites

- Node.js (v14 or higher)

- npm or yarn

 

### Installation



```bash

# Clone the repository

git clone https://github.com/jfeuerstein/jandle.git



# Navigate to project directory

cd jandle



# Install dependencies

npm install

```



### Firebase Setup

Before running the app, you need to set up Firebase:

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Realtime Database
3. Copy your Firebase configuration
4. Update `src/firebase.js` with your actual Firebase credentials

See [FIREBASE_SETUP.md](FIREBASE_SETUP.md) for detailed setup instructions.



### Running the App

```bash

# Start development server

npm start

```



The app will open at `http://localhost:3000`

 

### Available Scripts

 

```bash

npm start    # Run development server

npm build    # Create production build

npm test     # Run test suite

```

 

## Project Structure

 

```

jandle/

├── public/

│   └── index.html

├── src/

│   ├── components/

│   │   ├── UserSelect.js      # Landing page for user selection

│   │   ├── Navigation.js       # Top navigation bar

│   │   ├── Questions.js        # Dating-app style question flow

│   │   ├── Inbox.js            # Pending questions from other user

│   │   └── Answers.js          # Chat interface for completed Q&A

│   ├── AppContext.js           # Global state management

│   ├── App.js                  # Main app component

│   ├── App.css                 # App-level styles

│   └── index.css               # Global styles and design system

├── JOSH-THETIC.md              # Design philosophy guide

├── package.json

└── README.md

```

 

## State Management



The app uses React Context API with Firebase Realtime Database for persistent storage:



- **Current user** - Which user is viewing the app (Josh or Nini)

- **Current page** - Active view (questions, inbox, answers)

- **Questions pool** - Available questions to answer

- **Question index** - Current position in question flow per user (stored in Firebase)

- **Inbox** - Questions waiting for user's response (stored in Firebase)

- **Answers** - Completed question pairs with chat threads (stored in Firebase)



### Data Flow with Firebase



```javascript

// User answers a question

answerQuestion(questionId, questionText, answer)

  → Writes to other user's inbox in Firebase

  → Real-time sync updates other user's view



// User answers inbox question

answerInboxQuestion(inboxItem, answer)

  → Removes from inbox in Firebase

  → Creates answer pair for both users in Firebase

  → Unlocks chat thread for both users



// User sends chat message

sendMessage(questionId, message)

  → Adds to conversation thread in Firebase

  → Real-time sync shows message to both users instantly

```



### Firebase Data Structure



```
jandle-app/
├── questionIndex/
│   ├── josh: 0
│   └── nini: 0
├── inbox/
│   ├── josh: [...]
│   └── nini: [...]
└── answers/
    ├── josh: [...]
    └── nini: [...]
```

 

## Current Questions

 

The app currently includes three starter questions:

 

1. "what is your earliest childhood memory?"

2. "if you could have dinner with anyone dead or alive, who would it be?"

3. "what song would you want played at your funeral?"

 

These questions are hardcoded in `AppContext.js` and will be replaced with a dynamic question generation system in future versions.

 

## Color Palette

 

```css

/* Background & Text */

--bg-primary: #0a0a0a        /* Near-black background */

--text-primary: #e0e0e0      /* Light grey text */

--text-secondary: #999       /* Subtle text */

 

/* Accent Colors (AOL IM inspired) */

--color-aim-yellow: #ffcc00  /* Logo and highlights */

--color-aim-purple: #3399ff    /* Active states */

--color-josh: #ff8844        /* Josh's color */

--color-nini: #cc66ff        /* Nini's color */

```

 

## Contributing

 

This is a personal project, but suggestions and feedback are welcome! Please open an issue to discuss proposed changes.

 

## License

 

MIT License - feel free to use this project as inspiration for your own Q&A apps.

 

## Acknowledgments

 

- Design inspired by terminal interfaces and AOL Instant Messenger

- Built following the Josh-thetic design philosophy

- Created with React and lots of monospace font love

 

---

 

```

┌────────────────────────────┐

│ built with the josh-thetic │

└────────────────────────────┘

```