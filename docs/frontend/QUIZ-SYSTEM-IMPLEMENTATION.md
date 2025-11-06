# Quiz System Implementation

## Overview

Complete quiz-taking system with timer functionality, auto-submit, and comprehensive attempt tracking.

## User Flow

### 1. View Question Set Details

**Route:** `/question-sets/:id`
**Page:** `QuestionSetDetailPage`

**Features:**

- Display question set information (title, description, total questions)
- Show statistics:
  - Total attempts
  - Best score
  - Average score
- View attempts history table with:
  - Attempt number
  - Status (completed/pending)
  - Score
  - Start time
  - Completion time
  - Duration
  - View result button
- "Bắt đầu làm bài" button to start new quiz

**Navigation:**

- From: Subject Detail Page (click on question set card)
- To: Quiz Start Page (click "Bắt đầu làm bài")

---

### 2. Configure Quiz Settings

**Route:** `/quiz/start/:id`
**Page:** `QuizStartPage`

**Features:**

- Display question set information
- Timer settings:
  - Enable/disable timer (checkbox)
  - Set duration (10-180 minutes) with +/- buttons
  - Visual slider for quick adjustment
- Shuffle questions toggle
- Instructions and warnings:
  - Total questions count
  - Auto-submit warning if timer enabled
  - Good luck message
- "Bắt đầu làm bài" button to create attempt and start

**API Call:**

- `POST /quiz-attempts` with `{setId: id}`
- Returns attempt with `id`, `startedAt`, `isCompleted: false`

**Navigation:**

- From: Question Set Detail Page
- To: Quiz Taking Page (with settings in location.state)

---

### 3. Take Quiz

**Route:** `/quiz/take/:attemptId`
**Page:** `QuizTakingPage`

**Features:**

#### Timer

- Countdown display in MM:SS format
- Updates every second
- Warning state (<60 seconds):
  - Red color
  - Pulse animation
- Auto-submit when reaches 0

#### Progress

- Progress bar showing completion percentage
- Current question / Total questions counter

#### Question Display

- Question number and text
- 4 answer options (radio buttons)
- Previous/Next navigation buttons
- Submit button (shows answered count)

#### Question Navigator

- Grid layout (5 columns)
- Visual states:
  - Blue: Current question
  - Green: Answered question
  - White: Unanswered question
- Click to jump to any question

#### Auto-Submit

- Triggers when timer reaches 0
- Uses `useCallback` to prevent double submission
- Automatically navigates to result page

#### Protection

- `beforeunload` event prevents accidental page close
- Shows browser warning if user tries to leave

**API Calls:**

- `GET /quiz-attempts/:attemptId` on mount to load questions
- `POST /quiz-attempts/:attemptId/submit` with answers array

**Navigation:**

- From: Quiz Start Page
- To: Quiz Result Page (after submit)

---

### 4. View Results

**Route:** `/quiz/result/:attemptId`
**Page:** `QuizResultPage`

**Features:**

- Overall score and percentage
- Correct vs incorrect count
- Time taken
- Detailed answer review:
  - Each question with user's answer
  - Correct answer highlighted
  - Explanation (if available)
- "Làm lại" button to retake quiz
- "Quay về" button to return to question set

**Navigation:**

- From: Quiz Taking Page (after submit)
- To: Question Set Detail Page (view attempts history)

---

## Technical Implementation

### Components Created

1. **QuestionSetDetailPage**

   - File: `src/pages/quiz/QuestionSetDetail/QuestionSetDetailPage.jsx`
   - CSS: `src/pages/quiz/QuestionSetDetail/QuestionSetDetailPage.css`
   - Services: `questionSetsService.getSetById()`, `quizAttemptsService.getAttemptsByQuestionSet()`

2. **QuizStartPage**

   - File: `src/pages/quiz/QuizStart/QuizStartPage.jsx`
   - CSS: `src/pages/quiz/QuizStart/QuizStartPage.css`
   - Services: `questionSetsService.getSetById()`, `quizAttemptsService.createAttempt()`

3. **QuizTakingPage**
   - File: `src/pages/quiz/QuizTaking/QuizTakingPage.jsx`
   - CSS: `src/pages/quiz/QuizTaking/QuizTakingPage.css`
   - Services: `quizAttemptsService.getAttemptById()`, `quizAttemptsService.submitAttempt()`

### Services Updated

**questionSetsService.js**

```javascript
// Added method
getQuestionSetsBySubject(subjectId);
```

**quizAttemptsService.js**

```javascript
// Added method
getAttemptsByQuestionSet(questionSetId);
```

### Routes Added

**App.jsx**

```jsx
// Question Set Detail
/question-sets/:id → QuestionSetDetailPage

// Quiz Start (Configure Settings)
/quiz/start/:id → QuizStartPage

// Quiz Taking (Actual Exam)
/quiz/take/:attemptId → QuizTakingPage

// Quiz Result (Already Existed)
/quiz/result/:attemptId → QuizResultPage
```

**constants/routes.js**

```javascript
QUESTION_SET_DETAIL: "/question-sets/:id";
QUIZ_START_WITH_ID: "/quiz/start/:id";
QUIZ_TAKE: "/quiz/take/:attemptId";
QUIZ_RESULT: "/quiz/result/:attemptId";
```

### Timer Implementation

```javascript
// State
const [timeRemaining, setTimeRemaining] = useState(timerMinutes * 60);
const autoSubmitRef = useRef(false);

// Timer countdown
useEffect(() => {
  if (!useTimer || timeRemaining === null) return;

  const interval = setInterval(() => {
    setTimeRemaining((prev) => {
      if (prev <= 1) {
        clearInterval(interval);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(interval);
}, [useTimer, timerMinutes]);

// Auto-submit when timer expires
const handleAutoSubmit = useCallback(async () => {
  if (autoSubmitRef.current) return;
  autoSubmitRef.current = true;

  // Submit logic here
  const result = await quizAttemptsService.submitAttempt(attemptId, {
    answers: Object.entries(userAnswers).map(([questionId, answer]) => ({
      questionId: parseInt(questionId),
      selectedOptionIndex: answer,
    })),
  });

  navigate(`/quiz/result/${attemptId}`);
}, [attemptId, userAnswers, navigate]);

useEffect(() => {
  if (useTimer && timeRemaining === 0 && !autoSubmitRef.current) {
    handleAutoSubmit();
  }
}, [timeRemaining, useTimer, handleAutoSubmit]);
```

### Response Normalization

All services handle both response formats:

- Backend: `{items: [...], pagination: {...}}`
- Frontend: `{data: [...], meta: {...}}`

```javascript
// Normalize response
const normalizedData = response.items || response.data || [];
const normalizedMeta = response.pagination || response.meta || {};
```

## API Endpoints

| Method | Endpoint                              | Purpose                            | Request Body                                     | Response                             |
| ------ | ------------------------------------- | ---------------------------------- | ------------------------------------------------ | ------------------------------------ |
| GET    | `/subjects/{subjectId}/question-sets` | Get question sets for a subject    | -                                                | `{data: QuestionSet[], meta: {...}}` |
| GET    | `/question-sets/{id}`                 | Get question set details           | -                                                | `QuestionSet`                        |
| GET    | `/question-sets/{id}/quiz-attempts`   | Get attempts for a question set    | -                                                | `{data: QuizAttempt[], meta: {...}}` |
| POST   | `/quiz-attempts`                      | Create new attempt                 | `{setId: number}`                                | `QuizAttempt`                        |
| GET    | `/quiz-attempts/{id}`                 | Get attempt details with questions | -                                                | `QuizAttempt with questions[]`       |
| POST   | `/quiz-attempts/{id}/submit`          | Submit quiz answers                | `{answers: [{questionId, selectedOptionIndex}]}` | `GradedResult`                       |

## Features Completed

✅ Question sets display in Subject Detail Page
✅ Question set deletion with confirmation
✅ Document deletion with confirmation
✅ Modal size variations (small/medium/large)
✅ Generate quiz modal enlarged to 800px
✅ Removed auto-navigation after quiz creation
✅ Question Set Detail Page with stats and attempts history
✅ Quiz Start Page with timer and shuffle settings
✅ Quiz Taking Page with:

- Live countdown timer
- Progress tracking
- Question navigator grid
- Auto-submit on timer expiry
- beforeunload protection
  ✅ Complete routing integration
  ✅ Service layer with response normalization
  ✅ Comprehensive CSS styling for all pages

## Testing Checklist

### Functional Testing

- [ ] Navigate from Subject Detail → Question Set Detail
- [ ] View question set statistics (attempts, best score, avg score)
- [ ] View attempts history table
- [ ] Click "Bắt đầu làm bài" to start quiz
- [ ] Configure timer settings (enable/disable, duration)
- [ ] Configure shuffle questions
- [ ] Start quiz and verify attempt created
- [ ] Answer questions and verify answer selection
- [ ] Navigate between questions using Previous/Next buttons
- [ ] Jump to questions using navigator grid
- [ ] Submit quiz manually
- [ ] Verify timer countdown works
- [ ] Verify timer warning at <60 seconds (red color, pulse)
- [ ] Verify auto-submit when timer reaches 0
- [ ] Verify beforeunload warning when leaving page
- [ ] View quiz results with score and detailed answers
- [ ] Return to question set detail and verify new attempt in history

### Edge Cases

- [ ] Start quiz without timer
- [ ] Start quiz with minimum timer (10 minutes)
- [ ] Start quiz with maximum timer (180 minutes)
- [ ] Submit quiz with all questions answered
- [ ] Submit quiz with some questions unanswered
- [ ] Try to submit quiz twice (should prevent)
- [ ] Network error during quiz creation
- [ ] Network error during quiz submission
- [ ] Navigate away from quiz taking page (should warn)
- [ ] Refresh page during quiz (should warn)

### Responsive Testing

- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

## Known Issues & Future Enhancements

### Potential Issues

- Timer continues if user minimizes window (browser behavior)
- No resume capability for incomplete attempts
- No save progress feature

### Future Enhancements

- Add pause/resume functionality
- Add save draft feature
- Add review mode (review answers before submit)
- Add bookmark questions feature
- Add notes on questions
- Add detailed analytics (time per question, difficulty analysis)
- Add practice mode (no timer, show correct answers immediately)
- Add leaderboard for question sets
- Export results as PDF
- Share results on social media

## Component Props Reference

### Modal Component

```jsx
<Modal
  isOpen={boolean}
  onClose={function}
  title={string}
  size="small" | "medium" | "large" // default: "medium"
>
  {children}
</Modal>
```

**Sizes:**

- `small`: 400px max-width
- `medium`: 500px max-width (default)
- `large`: 800px max-width

### Timer Settings (QuizStartPage)

```javascript
const [useTimer, setUseTimer] = useState(true);
const [timerMinutes, setTimerMinutes] = useState(30);
const [shuffleQuestions, setShuffleQuestions] = useState(false);
```

### Quiz Taking Settings (passed via location.state)

```javascript
navigate(`/quiz/take/${attemptId}`, {
  state: {
    useTimer: boolean,
    timerMinutes: number,
    shuffleQuestions: boolean,
  },
});
```

## File Structure

```
src/
├── pages/
│   ├── quiz/
│   │   ├── QuestionSetDetail/
│   │   │   ├── QuestionSetDetailPage.jsx
│   │   │   └── QuestionSetDetailPage.css
│   │   ├── QuizStart/
│   │   │   ├── QuizStartPage.jsx
│   │   │   └── QuizStartPage.css
│   │   ├── QuizTaking/
│   │   │   ├── QuizTakingPage.jsx
│   │   │   └── QuizTakingPage.css
│   │   └── index.js
│   └── subjects/
│       └── SubjectDetail/
│           ├── SubjectDetailPage.jsx (updated)
│           └── SubjectDetailPage.css (updated)
├── services/
│   └── api/
│       ├── questionSets.service.js (updated)
│       └── quizAttempts.service.js (updated)
├── components/
│   └── common/
│       ├── Modal.jsx (updated)
│       └── Modal.css (updated)
├── constants/
│   └── routes.js (updated)
└── App.jsx (updated)
```

## Conclusion

The quiz system is now fully implemented with all requested features:

- Complete question set management
- Configurable quiz settings (timer, shuffle)
- Live quiz-taking interface with countdown timer
- Auto-submit on timer expiry
- Comprehensive attempts tracking
- Professional UI with responsive design

All components are properly integrated with routing and ready for testing.
