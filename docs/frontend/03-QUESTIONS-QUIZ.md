# 03 - Câu hỏi & Bài thi Trắc nghiệm

**Module**: Questions & Quiz System
**Vai trò**: Người học (Learner)
**Priority**: CAO
**Completion**: 0% (0/10 features)

---

## 📋 Tổng quan

Module này là **trung tâm** của hệ thống Learinal, cho phép:

- Tạo bộ câu hỏi tự động từ tài liệu bằng AI
- Làm bài thi trắc nghiệm tương tác
- Xem kết quả chi tiết với lời giải
- Theo dõi tiến độ học tập
- Chia sẻ bộ đề với bạn bè

---

## 🎯 Use Cases

### UC-005: Tạo bộ câu hỏi tự động (AI)

**Mô tả**: Người học sử dụng AI để tự động sinh câu hỏi trắc nghiệm từ tài liệu đã upload.

**Priority**: CAO
**Status**: ❌ Chưa triển khai

**Actors**: Learner

**Preconditions**:

- Learner đã đăng nhập
- Đã có ít nhất 1 môn học với tài liệu đã xử lý
- Môn học đã có mục lục (từ UC-004)

**Main Flow**:

1. Learner chọn một môn học
2. Learner nhấn "Tạo bộ câu hỏi"
3. Hệ thống hiển thị form cấu hình:
   - **Chọn chương/mục** từ mục lục (multi-select)
   - **Số lượng câu hỏi**: slider 5-50 câu
   - **Phân bổ mức độ khó**:
     - Biết (Knowledge): % slider
     - Hiểu (Comprehension): % slider
     - Vận dụng (Application): % slider
     - Vận dụng cao (High Application): % slider
     - Tổng = 100%
4. Learner nhấn "Tạo đề"
5. Hệ thống:
   - Kiểm tra entitlement (giới hạn số đề/tháng)
   - Tạo job xử lý background
   - Hiển thị loading với progress
   - Gửi request đến LLM API
6. Sau khi hoàn thành:
   - Hệ thống tạo bộ đề với status "Draft"
   - Hiển thị preview bộ câu hỏi
   - Gửi thông báo cho Learner

**Alternative Flow**:

- **5a. Hết quota**:
  - Hiển thị thông báo giới hạn
  - Suggest nâng cấp premium (UC-PREMIUM)
- **6a. LLM API error**:
  - Retry 3 lần
  - Nếu thất bại, lưu job để xử lý sau
  - Thông báo lỗi cho user

**Postconditions**:

- Bộ câu hỏi mới được tạo với status "Draft"
- Quota của user được cập nhật

**Business Rules**:

- Free users: 5 đề/tháng
- Premium users: Unlimited
- Mỗi đề min 5 câu, max 50 câu
- Tổng % mức độ = 100%
- AI sinh câu theo tỷ lệ cấu hình
- Mỗi câu phải có ít nhất 2 options

---

### UC-006: Làm bài thi trắc nghiệm

**Mô tả**: Người học làm bài thi trắc nghiệm trên một bộ đề đã có.

**Priority**: CAO
**Status**: ❌ Chưa triển khai

**Actors**: Learner (hoặc Guest nếu bộ đề được share)

**Preconditions**: Có ít nhất 1 bộ đề với status Public/Validated/Published

**Main Flow**:

1. Learner chọn một bộ đề từ:
   - Danh sách bộ đề của mình
   - Bộ đề premium (nếu có quyền)
   - Bộ đề được share (public link)
2. Learner nhấn "Bắt đầu làm bài"
3. Hệ thống hiển thị quiz interface:
   - Timer đếm ngược (optional)
   - Navigation: Previous/Next question
   - Question counter (câu 1/20)
   - Review panel (sidebar)
4. Với mỗi câu hỏi:
   - Hiển thị câu hỏi
   - Hiển thị các options (radio buttons)
   - Learner chọn đáp án
   - Hệ thống tự động lưu (auto-save mỗi 5s)
5. Learner có thể:
   - Di chuyển giữa các câu
   - Đánh dấu câu để review
   - Xem tổng quan (câu đã làm/chưa làm)
6. Khi hoàn thành, Learner nhấn "Nộp bài"
7. Hệ thống hiển thị confirmation dialog
8. Learner xác nhận
9. Hệ thống:
   - Tính điểm theo công thức (SRS 4.1.1)
   - Lưu QuizAttempt với status "Completed"
   - Ghi nhận commission cho Expert (nếu có)
   - Chuyển đến trang kết quả (UC-007)

**Alternative Flow**:

- **2a. Bộ đề premium nhưng user chưa subscribe**:
  - Hiển thị preview 3 câu đầu
  - Lock remaining questions
  - CTA: "Nâng cấp để mở khóa"
- **6a. Hết thời gian**:
  - Tự động nộp bài
  - Hiển thị thông báo "Hết giờ"

**Postconditions**:

- QuizAttempt được lưu với trạng thái "Completed"
- Điểm số được tính và lưu
- Commission được ghi nhận (nếu premium user)

---

### UC-007: Xem kết quả & đáp án

**Mô tả**: Sau khi nộp bài, người học xem kết quả chi tiết và đáp án đúng.

**Priority**: CAO
**Status**: ❌ Chưa triển khai

**Actors**: Learner

**Preconditions**: Đã hoàn thành ít nhất 1 lần làm bài (UC-006)

**Main Flow**:

1. Hệ thống hiển thị trang kết quả với:
   - **Score card**:
     - Điểm số (x/10)
     - Số câu đúng/tổng số câu
     - Thời gian hoàn thành
     - Accuracy rate (%)
   - **Breakdown theo mức độ**:
     - Biết: x/y đúng
     - Hiểu: x/y đúng
     - Vận dụng: x/y đúng
     - Vận dụng cao: x/y đúng
   - **Performance chart**: Radar chart showing strength/weakness
2. Learner cuộn xuống để xem chi tiết từng câu:
   - Câu hỏi
   - Đáp án của user (highlighted)
   - Đáp án đúng (highlighted green)
   - Lời giải thích (explanation)
   - Icon: ✓ (đúng) hoặc ✗ (sai)
3. Learner có thể:
   - Filter: All / Correct / Incorrect
   - Jump to specific question
   - Review answers
4. Learner có thể:
   - "Làm lại" → restart quiz
   - "Về danh sách" → back to quiz list
   - "Chia sẻ kết quả" (future)

**Postconditions**: Learner hiểu được lỗi sai và học từ lời giải

---

### UC-008: Dashboard tiến độ học tập

**Mô tả**: Người học xem dashboard tổng hợp tiến độ, thống kê học tập của mình.

**Priority**: TRUNG BÌNH
**Status**: ❌ Chưa triển khai

**Actors**: Learner

**Preconditions**: Learner đã đăng nhập

**Main Flow**:

1. Learner truy cập "Dashboard" hoặc "Tiến độ"
2. Hệ thống hiển thị:
   - **Overall Stats**:
     - Tổng số môn học
     - Tổng số tài liệu
     - Tổng số bộ đề đã tạo
     - Tổng số lần làm bài
   - **Recent Activity**:
     - 5 hoạt động gần nhất
     - Timeline view
   - **Performance Over Time**:
     - Line chart: Điểm trung bình theo thời gian
     - Bar chart: Số lần làm bài theo tuần/tháng
   - **Subjects Breakdown**:
     - Pie chart: Phân bổ thời gian học theo môn
     - List: Môn học với progress bar
   - **Streak & Achievements** (future):
     - Learning streak (ngày học liên tục)
     - Badges/achievements

**Postconditions**: Learner có cái nhìn tổng quan về tiến độ học

---

### UC-011: Chia sẻ bộ đề

**Mô tả**: Người học tạo link public để chia sẻ bộ đề cho bạn bè hoặc cộng đồng.

**Priority**: TRUNG BÌNH
**Status**: ❌ Chưa triển khai

**Actors**: Learner

**Preconditions**:

- Learner đã đăng nhập
- Có ít nhất 1 bộ đề

**Main Flow**:

1. Learner chọn một bộ đề muốn chia sẻ
2. Learner nhấn nút "Chia sẻ"
3. Hệ thống:
   - Tạo đường dẫn unique, không đoán trước
   - Format: `/public/quiz/:shareToken`
   - Cập nhật `isShared = true`, `sharedUrl = token`
4. Hệ thống hiển thị modal với:
   - Public URL
   - Nút "Copy link"
   - QR code (optional)
   - Social share buttons (Facebook, Zalo, etc.)
5. Learner copy link và chia sẻ

**Alternative Flow - Thu hồi chia sẻ**:

1. Learner truy cập trang quản lý bộ đề
2. Learner chọn bộ đề đang share
3. Learner nhấn "Ngừng chia sẻ"
4. Hệ thống hiển thị confirmation
5. Learner xác nhận
6. Hệ thống:
   - Cập nhật `isShared = false`
   - Xóa `sharedUrl`
   - Link cũ không còn hiệu lực
7. Giao diện cập nhật trạng thái

**Postconditions**:

- Bất kỳ ai có link đều có thể xem và làm bài (không cần đăng nhập)
- Link có thể bị thu hồi bất kỳ lúc nào

---

## 🖥️ UI Components

### 1. Question Set Creator Page

**Route**: `/subjects/:subjectId/create-questions`
**Layout**: TopbarLayout + SidebarLayout
**Components**:

```
QuestionSetCreator/
├── QuestionSetCreatorPage.jsx
├── QuestionSetCreatorPage.css
├── index.js
└── components/
    ├── ConfigurationForm.jsx      // Form cấu hình
    ├── TopicSelector.jsx          // Chọn chương/mục
    ├── DifficultySliders.jsx      // Sliders mức độ
    ├── GenerationProgress.jsx     // Progress indicator
    └── QuestionPreview.jsx        // Preview câu hỏi
```

**API Endpoints**:

```javascript
// Generate questions
POST /api/question-sets/generate
{
  "subjectId": "subj_001",
  "title": "Ôn tập Chương 1 & 2",
  "selectedTopics": ["topic_001", "topic_002"],
  "questionCount": 20,
  "difficultyDistribution": {
    "knowledge": 0.30,        // 30%
    "comprehension": 0.30,
    "application": 0.25,
    "highApplication": 0.15
  }
}
// Response:
{
  "jobId": "job_123",
  "status": "processing",
  "estimatedTime": 60  // seconds
}

// Check generation status
GET /api/question-sets/jobs/:jobId
// Response:
{
  "jobId": "job_123",
  "status": "completed",  // processing, completed, failed
  "progress": 100,
  "result": {
    "setId": "set_456",
    "questionCount": 20,
    "previewUrl": "/quiz/set_456/preview"
  }
}

// Get generated question set
GET /api/question-sets/:setId
// Response: Full question set object
```

**UI Mockup**:

```
┌─────────────────────────────────────────────────────┐
│ 🎯 Tạo bộ câu hỏi - Toán cao cấp A1                │
├─────────────────────────────────────────────────────┤
│                                                      │
│ 1. Chọn nội dung                                    │
│ ┌──────────────────────────────────────────────┐   │
│ │ ☑ Chương 1: Giới thiệu                       │   │
│ │ ☑ Chương 2: Giới hạn và liên tục             │   │
│ │ ☐ Chương 3: Đạo hàm                          │   │
│ │ ☐ Chương 4: Tích phân                        │   │
│ └──────────────────────────────────────────────┘   │
│                                                      │
│ 2. Số lượng câu hỏi: [20]                          │
│    ○━━━━━━●━━━━━━━━━○                              │
│    5              25              50                 │
│                                                      │
│ 3. Phân bổ mức độ khó                              │
│ Biết           [30%] ████████░░░░░░░░░░            │
│ Hiểu           [30%] ████████░░░░░░░░░░            │
│ Vận dụng       [25%] ███████░░░░░░░░░░░            │
│ Vận dụng cao   [15%] ████░░░░░░░░░░░░░░            │
│                      ───────────────────             │
│                      Tổng: 100%                     │
│                                                      │
│ 💡 Quota: Còn 3/5 đề tháng này                     │
│                                                      │
│        [Hủy]              [🎲 Tạo đề]              │
└─────────────────────────────────────────────────────┘

[Khi đang generate:]
┌─────────────────────────────────────────────────────┐
│ ⏳ Đang tạo bộ câu hỏi...                          │
│                                                      │
│ ████████████████░░░░░░░░  80%                      │
│                                                      │
│ • Phân tích nội dung... ✓                          │
│ • Tạo câu hỏi mức Biết... ✓                        │
│ • Tạo câu hỏi mức Hiểu... 🔄                       │
│ • Tạo câu hỏi mức Vận dụng...                      │
│                                                      │
│ Ước tính còn: 15 giây                              │
└─────────────────────────────────────────────────────┘
```

---

### 2. Quiz Taking Interface

**Route**: `/quiz/:setId/take`
**Layout**: FullScreen (no sidebar, minimal topbar)
**Components**:

```
QuizTake/
├── QuizTakePage.jsx
├── QuizTakePage.css
├── index.js
└── components/
    ├── QuizHeader.jsx             // Timer, progress
    ├── QuestionDisplay.jsx        // Câu hỏi hiện tại
    ├── AnswerOptions.jsx          // Radio buttons
    ├── NavigationButtons.jsx      // Prev/Next
    ├── ReviewPanel.jsx            // Sidebar overview
    ├── SubmitConfirmModal.jsx     // Confirm nộp bài
    └── QuizTimer.jsx              // Countdown timer
```

**API Endpoints**:

```javascript
// Start quiz attempt
POST /api/quiz-attempts
{
  "setId": "set_456",
  "startTime": "2025-11-06T10:00:00Z"
}
// Response:
{
  "attemptId": "att_789",
  "setId": "set_456",
  "questions": [/* array of questions without correctAnswer */],
  "startTime": "2025-11-06T10:00:00Z",
  "timeLimit": 1800  // seconds, null if no limit
}

// Save answer (auto-save)
PATCH /api/quiz-attempts/:attemptId/answer
{
  "questionId": "q_001",
  "selectedAnswerIndex": 2
}

// Submit quiz
POST /api/quiz-attempts/:attemptId/submit
{
  "endTime": "2025-11-06T10:25:00Z",
  "userAnswers": [
    { "questionId": "q_001", "selectedAnswerIndex": 2 },
    { "questionId": "q_002", "selectedAnswerIndex": 0 }
  ]
}
// Response:
{
  "attemptId": "att_789",
  "score": 8.5,
  "totalQuestions": 20,
  "correctCount": 17,
  "resultUrl": "/quiz/att_789/result"
}
```

**UI Mockup**:

```
┌─────────────────────────────────────────────────────────────┐
│ Toán cao cấp A1 - Ôn tập C1&C2    ⏱️ 25:34    [Nộp bài] │
│ Câu 5/20 ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  25%        │
├─────────────────────────────────────┬───────────────────────┤
│                                     │ Tổng quan            │
│ Câu 5:                              │ ┌─────────────────┐  │
│                                     │ │ 1✓ 2✓ 3✓ 4✓ 5○  │  │
│ Tính giới hạn sau:                  │ │ 6○ 7○ 8○ 9○ 10○ │  │
│                                     │ │ 11○ ... 20○     │  │
│ lim (x² - 4)/(x - 2) khi x→2        │ └─────────────────┘  │
│                                     │                       │
│ ○ A. 0                              │ ✓ Đã làm: 4         │
│ ○ B. 2                              │ ○ Chưa làm: 16      │
│ ● C. 4                              │ 🚩 Đánh dấu: 0      │
│ ○ D. Không tồn tại                  │                       │
│                                     │ [Xem lại tất cả]     │
│ 🚩 Đánh dấu để xem lại              │                       │
│                                     │                       │
│ [← Câu trước]         [Câu sau →]  │                       │
└─────────────────────────────────────┴───────────────────────┘
```

---

### 3. Quiz Result Page

**Route**: `/quiz/:attemptId/result`
**Layout**: TopbarLayout + SidebarLayout
**Components**:

```
QuizResult/
├── QuizResultPage.jsx
├── QuizResultPage.css
├── index.js
└── components/
    ├── ScoreCard.jsx              // Điểm số tổng quan
    ├── DifficultyBreakdown.jsx    // Breakdown theo mức độ
    ├── PerformanceChart.jsx       // Radar chart
    ├── AnswerReview.jsx           // Chi tiết từng câu
    ├── QuestionCard.jsx           // Card cho mỗi câu
    └── ResultActions.jsx          // Retry, Share, Back
```

**API Endpoints**:

```javascript
// Get quiz result
GET /api/quiz-attempts/:attemptId/result
// Response:
{
  "attemptId": "att_789",
  "setTitle": "Toán cao cấp - Ôn tập C1&C2",
  "score": 8.5,
  "maxScore": 10,
  "totalQuestions": 20,
  "correctCount": 17,
  "accuracy": 0.85,
  "timeSpent": 1534,  // seconds
  "completedAt": "2025-11-06T10:25:00Z",
  "breakdown": {
    "knowledge": { "correct": 5, "total": 6 },
    "comprehension": { "correct": 6, "total": 6 },
    "application": { "correct": 4, "total": 5 },
    "highApplication": { "correct": 2, "total": 3 }
  },
  "questions": [
    {
      "questionId": "q_001",
      "questionText": "...",
      "options": ["A", "B", "C", "D"],
      "correctAnswerIndex": 2,
      "userAnswerIndex": 2,
      "isCorrect": true,
      "explanation": "...",
      "difficultyLevel": "Hiểu"
    },
    // ... more questions
  ]
}
```

**UI Mockup**:

```
┌─────────────────────────────────────────────────────────┐
│ 🎉 Kết quả bài thi                                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│          ┌──────────────────────────────┐              │
│          │        8.5 / 10              │              │
│          │     ⭐⭐⭐⭐                   │              │
│          │                              │              │
│          │  17/20 câu đúng (85%)        │              │
│          │  Thời gian: 25 phút 34s      │              │
│          └──────────────────────────────┘              │
│                                                          │
│ 📊 Phân tích theo mức độ                               │
│ ┌────────────────────────────────────────────────┐     │
│ │ Biết:           5/6  đúng  ████████░░  83%    │     │
│ │ Hiểu:           6/6  đúng  ██████████ 100%    │     │
│ │ Vận dụng:       4/5  đúng  ████████░░  80%    │     │
│ │ Vận dụng cao:   2/3  đúng  ██████░░░░  67%    │     │
│ └────────────────────────────────────────────────┘     │
│                                                          │
│ [Radar Chart: Performance visualization]                │
│                                                          │
│ 📝 Chi tiết câu trả lời                [Tất cả ▼]     │
│ ┌────────────────────────────────────────────────┐     │
│ │ ✓ Câu 1: Tính giới hạn...                     │     │
│ │   Bạn chọn: C. 4  ✓                            │     │
│ │   Giải thích: Sử dụng quy tắc L'Hopital...     │     │
│ ├────────────────────────────────────────────────┤     │
│ │ ✗ Câu 5: Tìm đạo hàm...                       │     │
│ │   Bạn chọn: B. 2x  ✗                           │     │
│ │   Đáp án đúng: A. 2  ✓                         │     │
│ │   Giải thích: Theo quy tắc đạo hàm...          │     │
│ └────────────────────────────────────────────────┘     │
│                                                          │
│ [🔄 Làm lại]  [📤 Chia sẻ]  [← Về danh sách]         │
└─────────────────────────────────────────────────────────┘
```

---

### 4. Quiz Dashboard Page

**Route**: `/dashboard` or `/progress`
**Layout**: TopbarLayout + SidebarLayout
**Components**:

```
QuizDashboard/
├── QuizDashboardPage.jsx
├── QuizDashboardPage.css
├── index.js
└── components/
    ├── OverallStats.jsx           // Thống kê tổng quan
    ├── RecentActivity.jsx         // Timeline activities
    ├── PerformanceChart.jsx       // Line/Bar charts
    ├── SubjectsBreakdown.jsx      // Pie chart + list
    ├── StreakWidget.jsx           // Learning streak
    └── AchievementsBadges.jsx     // Badges (future)
```

**API Endpoints**:

```javascript
// Get dashboard stats
GET /api/users/me/dashboard
// Response:
{
  "overallStats": {
    "totalSubjects": 5,
    "totalDocuments": 23,
    "totalQuestionSets": 12,
    "totalAttempts": 45,
    "averageScore": 7.8,
    "studyDays": 15  // days with activity
  },
  "recentActivities": [
    {
      "type": "quiz_completed",
      "title": "Hoàn thành: Toán cao cấp - C1&C2",
      "score": 8.5,
      "timestamp": "2025-11-06T10:25:00Z"
    },
    {
      "type": "questions_generated",
      "title": "Tạo bộ đề: Vật lý đại cương",
      "count": 20,
      "timestamp": "2025-11-05T14:00:00Z"
    }
  ],
  "performanceOverTime": [
    { "date": "2025-11-01", "avgScore": 7.2, "attemptCount": 2 },
    { "date": "2025-11-02", "avgScore": 7.8, "attemptCount": 3 }
  ],
  "subjectsBreakdown": [
    {
      "subjectId": "subj_001",
      "subjectName": "Toán cao cấp",
      "attemptCount": 15,
      "avgScore": 8.2,
      "lastActivity": "2025-11-06"
    }
  ],
  "streak": {
    "currentStreak": 7,  // days
    "longestStreak": 12,
    "lastActivityDate": "2025-11-06"
  }
}
```

**UI Mockup**:

```
┌─────────────────────────────────────────────────────────┐
│ 📊 Dashboard - Tiến độ học tập                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐         │
│ │Môn học│Tài liệu│Bộ đề │Lần thi│Điểm TB│         │
│ │  5   ││  23   ││  12  ││  45  ││ 7.8  ││         │
│ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘         │
│                                                          │
│ 🔥 Chuỗi học tập: 7 ngày liên tục                      │
│ ████████████████░░░░░░  (Best: 12 ngày)                │
│                                                          │
│ 📈 Hiệu suất theo thời gian                            │
│ [Line Chart: Average score over last 30 days]          │
│                                                          │
│ 🎯 Phân bổ theo môn học                                │
│ [Pie Chart + List with progress bars]                  │
│                                                          │
│ 📜 Hoạt động gần đây                                   │
│ • 10:25 - Hoàn thành: Toán cao cấp (8.5/10) ✓          │
│ • 14:00 - Tạo bộ đề: Vật lý (20 câu)                   │
│ • 09:30 - Upload tài liệu: Hóa học C3.pdf              │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

### 5. Question Sets List Page

**Route**: `/quiz` or `/question-sets`
**Layout**: TopbarLayout + SidebarLayout
**Components**:

```
QuestionSetsList/
├── QuestionSetsListPage.jsx
├── QuestionSetsListPage.css
├── index.js
└── components/
    ├── SetsFilter.jsx             // Filter by subject, status
    ├── SetCard.jsx                // Card for each set
    ├── SetsGrid.jsx               // Grid layout
    └── ShareModal.jsx             // Modal chia sẻ
```

**Features**:

- List all question sets (own + premium + shared)
- Tabs: "Của tôi" / "Premium" / "Đã chia sẻ"
- Filter by subject, status
- Actions: Start, Edit, Share, Delete
- Share modal with public link & QR code

---

## 📡 API Services

### questionSets.service.js

```javascript
/**
 * Question Sets Service
 * API for question generation and management
 */

import axiosInstance from "./axios.config";

const BASE_PATH = "/question-sets";

export const questionSetsService = {
  /**
   * Generate questions with AI
   * @param {Object} payload
   * @returns {Promise<Object>} Job info
   */
  generate: async (payload) => {
    const { data } = await axiosInstance.post(`${BASE_PATH}/generate`, payload);
    return data;
  },

  /**
   * Check generation job status
   * @param {string} jobId
   * @returns {Promise<Object>}
   */
  getJobStatus: async (jobId) => {
    const { data } = await axiosInstance.get(`${BASE_PATH}/jobs/${jobId}`);
    return data;
  },

  /**
   * Get all question sets
   * @param {Object} params
   * @returns {Promise<Object>}
   */
  getAll: async (params = {}) => {
    const { data } = await axiosInstance.get(BASE_PATH, { params });
    return data;
  },

  /**
   * Get question set by ID
   * @param {string} setId
   * @returns {Promise<Object>}
   */
  getById: async (setId) => {
    const { data } = await axiosInstance.get(`${BASE_PATH}/${setId}`);
    return data;
  },

  /**
   * Update question set
   * @param {string} setId
   * @param {Object} payload
   * @returns {Promise<Object>}
   */
  update: async (setId, payload) => {
    const { data } = await axiosInstance.patch(`${BASE_PATH}/${setId}`, payload);
    return data;
  },

  /**
   * Delete question set
   * @param {string} setId
   * @returns {Promise<void>}
   */
  delete: async (setId) => {
    await axiosInstance.delete(`${BASE_PATH}/${setId}`);
  },

  /**
   * Share question set (create public link)
   * @param {string} setId
   * @returns {Promise<Object>}
   */
  share: async (setId) => {
    const { data } = await axiosInstance.post(`${BASE_PATH}/${setId}/share`);
    return data;
  },

  /**
   * Unshare question set (revoke public link)
   * @param {string} setId
   * @returns {Promise<void>}
   */
  unshare: async (setId) => {
    await axiosInstance.post(`${BASE_PATH}/${setId}/unshare`);
  },
};
```

### quizAttempts.service.js

```javascript
/**
 * Quiz Attempts Service
 * API for taking quizzes and viewing results
 */

import axiosInstance from "./axios.config";

const BASE_PATH = "/quiz-attempts";

export const quizAttemptsService = {
  /**
   * Start a quiz attempt
   * @param {Object} payload
   * @returns {Promise<Object>}
   */
  start: async (payload) => {
    const { data } = await axiosInstance.post(BASE_PATH, payload);
    return data;
  },

  /**
   * Save answer (auto-save during quiz)
   * @param {string} attemptId
   * @param {Object} payload
   * @returns {Promise<Object>}
   */
  saveAnswer: async (attemptId, payload) => {
    const { data } = await axiosInstance.patch(`${BASE_PATH}/${attemptId}/answer`, payload);
    return data;
  },

  /**
   * Submit quiz
   * @param {string} attemptId
   * @param {Object} payload
   * @returns {Promise<Object>}
   */
  submit: async (attemptId, payload) => {
    const { data } = await axiosInstance.post(`${BASE_PATH}/${attemptId}/submit`, payload);
    return data;
  },

  /**
   * Get quiz result
   * @param {string} attemptId
   * @returns {Promise<Object>}
   */
  getResult: async (attemptId) => {
    const { data } = await axiosInstance.get(`${BASE_PATH}/${attemptId}/result`);
    return data;
  },

  /**
   * Get my quiz history
   * @param {Object} params
   * @returns {Promise<Object>}
   */
  getHistory: async (params = {}) => {
    const { data } = await axiosInstance.get(`${BASE_PATH}/my-attempts`, { params });
    return data;
  },
};
```

---

## ✅ Implementation Checklist

### Phase 1: Question Generation (Sprint 3)

- [ ] **Setup Routes**

  - [ ] `/subjects/:id/create-questions`
  - [ ] Add to subject detail page

- [ ] **Create API Services**

  - [ ] `questionSets.service.js`
  - [ ] All methods implemented

- [ ] **Question Creator Page**
  - [ ] ConfigurationForm component
  - [ ] TopicSelector (multi-select from ToC)
  - [ ] DifficultySliders (sum = 100%)
  - [ ] Validation logic
  - [ ] GenerationProgress component
  - [ ] Poll job status every 3s
  - [ ] Handle errors & retry

### Phase 2: Quiz Taking (Sprint 4)

- [ ] **Setup Routes**

  - [ ] `/quiz/:setId/take`
  - [ ] `/quiz/:attemptId/result`

- [ ] **Create API Services**

  - [ ] `quizAttempts.service.js`

- [ ] **Quiz Take Page**

  - [ ] QuizHeader with timer
  - [ ] QuestionDisplay component
  - [ ] AnswerOptions (radio buttons)
  - [ ] NavigationButtons
  - [ ] ReviewPanel sidebar
  - [ ] Auto-save every 5s
  - [ ] SubmitConfirmModal
  - [ ] Handle timer expiry

- [ ] **Quiz Result Page**
  - [ ] ScoreCard component
  - [ ] DifficultyBreakdown
  - [ ] PerformanceChart (Radar chart)
  - [ ] AnswerReview list
  - [ ] QuestionCard (show correct/incorrect)
  - [ ] ResultActions (retry, back, share)

### Phase 3: Dashboard & Sharing (Sprint 5)

- [ ] **Dashboard Page**

  - [ ] `/dashboard` route
  - [ ] OverallStats component
  - [ ] RecentActivity timeline
  - [ ] PerformanceChart (Line chart)
  - [ ] SubjectsBreakdown (Pie chart)
  - [ ] StreakWidget
  - [ ] Responsive design

- [ ] **Question Sets List**

  - [ ] `/quiz` route
  - [ ] SetsFilter component
  - [ ] SetCard component
  - [ ] SetsGrid layout
  - [ ] Tabs: My / Premium / Shared
  - [ ] CRUD actions

- [ ] **Share Feature**
  - [ ] ShareModal component
  - [ ] Generate share link
  - [ ] Copy to clipboard
  - [ ] QR code generation
  - [ ] Unshare functionality
  - [ ] Public quiz page (no auth)

### Phase 4: Testing & Polish

- [ ] **Calculation Testing**

  - [ ] Verify score calculation (SRS 4.1.1)
  - [ ] Test with different difficulty distributions
  - [ ] Edge cases (all correct, all wrong, etc.)

- [ ] **UX Improvements**

  - [ ] Keyboard shortcuts (arrow keys navigation)
  - [ ] Mark for review feature
  - [ ] Confirm before leaving quiz
  - [ ] Save draft state in localStorage
  - [ ] Smooth animations

- [ ] **Performance**
  - [ ] Optimize question rendering
  - [ ] Lazy load images/charts
  - [ ] Debounce auto-save

---

## 🔗 Related Use Cases

- **UC-004**: Tạo mục lục (prerequisite for UC-005)
- **UC-010**: Yêu cầu xác thực
- **UC-PREMIUM**: Check entitlements
- **UC-021**: Thông báo khi generate xong

---

## 📊 Success Metrics

- Thời gian trung bình để generate 20 câu hỏi < 60s
- Accuracy của AI-generated questions > 85%
- Quiz completion rate > 70%
- Average quiz score: 6-8/10
- Daily active users doing quizzes

---

## 📝 Notes

### Score Calculation Formula (SRS 4.1.1)

```javascript
// Difficulty weights
const WEIGHTS = {
  knowledge: 1.0,
  comprehension: 1.25,
  application: 1.5,
  highApplication: 2.0,
};

function calculateScore(questions, userAnswers) {
  let maxPoints = 0;
  let earnedPoints = 0;

  questions.forEach((q, index) => {
    const weight = WEIGHTS[q.difficultyLevel];
    maxPoints += weight;

    if (userAnswers[index] === q.correctAnswerIndex) {
      earnedPoints += weight;
    }
  });

  const finalScore = (earnedPoints / maxPoints) * 10;
  return Math.round(finalScore * 100) / 100; // 2 decimal places
}
```

### LLM Prompt Engineering

**Prompt template** for question generation:

```
Bạn là một giáo viên chuyên nghiệp. Hãy tạo {count} câu hỏi trắc nghiệm
từ nội dung sau với mức độ khó {difficulty}:

[Content from selected topics]

Yêu cầu:
- Mỗi câu có 4 đáp án (A, B, C, D)
- Chỉ có 1 đáp án đúng
- Kèm lời giải thích chi tiết
- Format JSON: { questionText, options, correctAnswerIndex, explanation }
```

### Auto-save Strategy

```javascript
const useQuizAutoSave = (attemptId) => {
  const [answers, setAnswers] = useState({});
  const [lastSaved, setLastSaved] = useState(null);

  // Debounce save
  const debouncedSave = useMemo(
    () =>
      debounce(async (data) => {
        await quizAttemptsService.saveAnswer(attemptId, data);
        setLastSaved(new Date());
      }, 5000),
    [attemptId]
  );

  const saveAnswer = (questionId, answerIndex) => {
    const newAnswers = { ...answers, [questionId]: answerIndex };
    setAnswers(newAnswers);
    debouncedSave({ questionId, selectedAnswerIndex: answerIndex });
  };

  return { answers, saveAnswer, lastSaved };
};
```

### Premium Content Access

```javascript
// Check if user can access premium set
const canAccessPremiumSet = (user, questionSet) => {
  if (questionSet.status !== "Published") {
    return questionSet.userId === user.id;
  }

  // Premium content
  if (questionSet.status === "Published") {
    return user.subscriptionStatus === "Active" && user.entitlements.accessPremiumContent === true;
  }

  return true; // Public sets
};
```

---

**Status**: Ready for Implementation
**Estimated Effort**: 3-4 sprints
**Dependencies**: LLM API, Table of Contents (UC-004), Subscription system
