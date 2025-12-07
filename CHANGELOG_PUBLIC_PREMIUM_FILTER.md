# Tóm tắt Thay đổi - Phân loại và Kiểm soát Bộ Đề Public

## Ngày: 6 tháng 12, 2025

### Tổng quan
Đã thực hiện các thay đổi để:
1. Phân loại bộ đề public thành 3 tabs: Tất cả, Đề Expert, Người dùng chia sẻ
2. Đánh dấu rõ ràng các đề do Expert tạo với badge và màu sắc khác biệt
3. Chỉ cho phép người dùng có gói Premium mới được làm các đề do Expert tạo
4. Hiển thị modal yêu cầu nâng cấp khi người dùng chưa có Premium cố gắng làm đề Expert

---

## Backend Changes

### 1. **search.service.js** (`Learinal-BE/src/services/search.service.js`)
**Thay đổi:**
- Thêm filter theo `creatorRole` trong method `filterQuestionSets()`
- Query users theo role và filter question sets theo danh sách user IDs
- Hỗ trợ filter Expert sets vs Learner sets

**Mã mới thêm:**
```javascript
// Filter by creator role (for filtering expert-created sets)
let userRoleFilter = null;
if (filters.creatorRole) {
  const usersWithRole = await User.find({ role: filters.creatorRole }).select("_id").lean();
  const userIds = usersWithRole.map((u) => u._id);
  userRoleFilter = { userId: { $in: userIds } };
  
  if (query.$or) {
    query.$and = [{ $or: query.$or }, userRoleFilter];
    delete query.$or;
  } else {
    Object.assign(query, userRoleFilter);
  }
}
```

### 2. **search.controller.js** (`Learinal-BE/src/controllers/search.controller.js`)
**Thay đổi:**
- Thêm parameter `creatorRole` vào endpoint GET `/search/question-sets`
- Pass parameter này xuống service layer

**API Endpoint cập nhật:**
```
GET /search/question-sets?isShared=true&creatorRole=Expert&page=1&pageSize=12
```

---

## Frontend Changes

### 1. **PublicSetsPage.jsx** (`Learinal-FE/src/pages/public/PublicSets/PublicSetsPage.jsx`)

**Các thay đổi chính:**

#### a) State Management
- Thêm state `activeTab` để tracking tab hiện tại (all, expert, user-shared)
- Reset page về 1 khi đổi tab

#### b) Tabs UI
Thêm 3 tabs với icons và styling:
- **Tất cả**: Hiển thị tất cả bộ đề public
- **Đề Expert** (có badge Premium): Chỉ bộ đề của Expert
- **Người dùng chia sẻ**: Chỉ bộ đề của Learner

#### c) Visual Indicators cho Expert Sets
- **Background gradient**: Màu amber/yellow thay vì gray/white
- **Expert Badge**: Badge "Expert" với icon ngôi sao ở góc trên phải
- **Creator name**: Thêm checkmark icon bên cạnh tên Expert
- **Icon color**: Màu amber cho Expert sets
- **Button color**: Nút "Premium" màu amber thay vì "Làm thử" màu xanh

#### d) Filter Logic
```javascript
const params = {
  isShared: true,
  page,
  pageSize: 12,
};

if (activeTab === "expert") {
  params.creatorRole = "Expert";
} else if (activeTab === "user-shared") {
  params.creatorRole = "Learner";
}
```

### 2. **QuizStartPage.jsx** (`Learinal-FE/src/pages/quiz/QuizStart/QuizStartPage.jsx`)

**Các thay đổi chính:**

#### a) Premium Check
- Import `useAuth` để access user data
- Thêm state `showPremiumModal` để control modal
- Check `_premiumRequired` flag từ API response

#### b) Logic kiểm tra Premium
```javascript
// Trong fetchQuestionSet
if (data._premiumRequired) {
  setShowPremiumModal(true);
}

// Trong handleStartQuiz
if (questionSet?._premiumRequired) {
  setShowPremiumModal(true);
  return;
}
```

#### c) UI Changes
- Disable nút "Bắt đầu làm bài" nếu premium required
- Hiển thị thông báo "Yêu cầu Premium" và message từ backend
- Thêm `<PremiumRequiredModal>` component

### 3. **PremiumRequiredModal.jsx** (File mới)
Path: `Learinal-FE/src/components/common/PremiumRequiredModal.jsx`

**Component mới:**
- Modal đẹp với gradient amber/yellow theme
- Hiển thị premium badge và features list
- 2 buttons: "Nâng cấp Premium" (navigate to /subscriptions) và "Để sau"
- Responsive design với dark mode support

**Features hiển thị:**
- ✓ Truy cập tất cả bộ đề từ chuyên gia
- ✓ Chất lượng câu hỏi được kiểm duyệt kỹ lưỡng
- ✓ Không giới hạn số lượng bài thi
- ✓ Hỗ trợ ưu tiên từ đội ngũ chuyên gia

### 4. **index.js** (`Learinal-FE/src/components/common/index.js`)
**Thay đổi:**
- Export `PremiumRequiredModal` component

---

## API Flow

### 1. Fetching Public Question Sets
```
User visits /public
  ↓
PublicSetsPage renders with "all" tab active
  ↓
Calls GET /search/question-sets?isShared=true&page=1&pageSize=12
  ↓
Backend returns all public sets with creatorRole field
  ↓
UI displays sets with appropriate styling
```

### 2. User Clicks "Đề Expert" Tab
```
User clicks "Đề Expert" tab
  ↓
setActiveTab("expert") and setPage(1)
  ↓
Calls GET /search/question-sets?isShared=true&creatorRole=Expert&page=1&pageSize=12
  ↓
Backend filters by Expert role
  ↓
UI displays only Expert sets with premium badges
```

### 3. User Tries to Start Expert Quiz (No Premium)
```
User clicks "Premium" button on Expert set
  ↓
Navigate to /quiz/start/:id
  ↓
QuizStartPage calls GET /question-sets/:id
  ↓
Backend checks user subscription, returns _premiumRequired: true
  ↓
QuizStartPage shows PremiumRequiredModal
  ↓
User can either "Nâng cấp Premium" or "Để sau"
```

### 4. User Tries to Start Expert Quiz (Has Premium)
```
User clicks button on Expert set
  ↓
Navigate to /quiz/start/:id
  ↓
QuizStartPage calls GET /question-sets/:id
  ↓
Backend checks user subscription, returns normal data
  ↓
User can start quiz normally
```

---

## Backend Logic (Already Exists)

File: `Learinal-BE/src/controllers/questionSets.controller.js`

**Existing Premium Check trong `get` method:**
```javascript
// If question set is Public (created by expert), check Premium subscription
if (isExpertPublic && !isOwner) {
  const ownerUser = await usersRepo.findById(item.userId);
  if (ownerUser && ownerUser.role === "Expert") {
    const { userSubscriptionsService } = req.app.locals;
    const activeSubscription = await userSubscriptionsService.getActiveSubscription(user.id);
    
    if (!activeSubscription) {
      return res.status(200).json({
        ...mapId(item),
        _premiumRequired: true,
        _message: "Bạn cần nâng cấp lên gói Premium để làm bài tập này"
      });
    }
  }
}
```

---

## Testing Checklist

### Backend
- [ ] GET /search/question-sets?isShared=true trả về tất cả public sets
- [ ] GET /search/question-sets?isShared=true&creatorRole=Expert trả về chỉ Expert sets
- [ ] GET /search/question-sets?isShared=true&creatorRole=Learner trả về chỉ Learner sets
- [ ] GET /question-sets/:id với Expert set và user không có Premium trả về _premiumRequired: true

### Frontend
- [ ] Tabs "Tất cả", "Đề Expert", "Người dùng chia sẻ" hoạt động đúng
- [ ] Expert sets có badge "Expert" màu vàng ở góc trên
- [ ] Expert sets có background màu amber khác biệt
- [ ] Creator name của Expert có checkmark icon
- [ ] Button "Premium" màu amber cho Expert sets
- [ ] Click tab reset page về 1
- [ ] PremiumRequiredModal hiển thị khi user không có Premium cố làm đề Expert
- [ ] Button "Nâng cấp Premium" navigate đến /subscriptions
- [ ] User có Premium có thể làm đề Expert bình thường

---

## Files Changed

### Backend (2 files)
1. `Learinal-BE/src/services/search.service.js` - Thêm filter creatorRole
2. `Learinal-BE/src/controllers/search.controller.js` - Thêm parameter creatorRole

### Frontend (4 files)
1. `Learinal-FE/src/pages/public/PublicSets/PublicSetsPage.jsx` - Tabs và styling
2. `Learinal-FE/src/pages/quiz/QuizStart/QuizStartPage.jsx` - Premium check
3. `Learinal-FE/src/components/common/PremiumRequiredModal.jsx` - Modal mới
4. `Learinal-FE/src/components/common/index.js` - Export modal

---

## Screenshots Preview

### Public Page với Tabs
```
┌─────────────────────────────────────────────────┐
│ Bộ Đề Chung                                     │
│ Khám phá và làm thử các bộ đề thi công khai    │
│                                                 │
│ [Tất cả] [Đề Expert 🌟 Premium] [Người dùng]   │
├─────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│ │ Set 1    │ │ Set 2  ⭐│ │ Set 3    │        │
│ │ (Learner)│ │ (Expert) │ │ (Learner)│        │
│ └──────────┘ └──────────┘ └──────────┘        │
└─────────────────────────────────────────────────┘
```

### Expert Set Card
```
┌──────────────────────────────────┐
│                      [⭐ Expert] │ <- Badge
│ 📄 (amber icon)                  │
│                                  │
│ Bộ Đề Toán Cao Cấp              │ <- Amber hover
│                                  │
│ Tạo bởi: Nguyễn Văn A ✓         │ <- Checkmark
│ Môn học: Toán học                │
│                                  │
│ [10 câu] [Trung bình] [Chung]   │
│                                  │
│ [Xem chi tiết] [⭐ Premium]     │ <- Amber button
└──────────────────────────────────┘
```

### Premium Required Modal
```
┌─────────────────────────────────────┐
│        ╔═════════════╗               │
│        ║ ⭐ (Amber) ║               │
│        ╚═════════════╝               │
│                                      │
│     Nội dung Premium                 │
│   🔒 Chỉ dành cho Premium           │
│                                      │
│ "Bộ Đề XXX" là nội dung từ Expert   │
│ và chỉ dành cho thành viên Premium  │
│                                      │
│ ┌─────────────────────────────┐    │
│ │ Nâng cấp Premium để nhận:   │    │
│ │ ✓ Truy cập đề Expert        │    │
│ │ ✓ Chất lượng cao            │    │
│ │ ✓ Không giới hạn            │    │
│ │ ✓ Hỗ trợ ưu tiên            │    │
│ └─────────────────────────────┘    │
│                                      │
│ [⭐ Nâng cấp Premium] [Để sau]     │
└─────────────────────────────────────┘
```

---

## Notes
- Backend đã có sẵn logic kiểm tra Premium trong `questionSets.controller.js`
- Frontend chỉ cần đọc flag `_premiumRequired` từ response
- Màu sắc sử dụng: amber/yellow cho Premium/Expert content
- Modal có thể tái sử dụng cho các tính năng Premium khác trong tương lai
