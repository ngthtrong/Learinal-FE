# 11 - UI/UX Requirements

**Module**: Design System & User Experience
**Priority**: CAO
**Scope**: Toàn bộ ứng dụng

---

## 📋 Tổng quan

Tài liệu này định nghĩa:

- Design system (colors, typography, spacing)
- Component library
- Responsive design guidelines
- Accessibility requirements
- Animation & interactions
- Best practices

---

## 🎨 Design System

### Color Palette

**Primary Colors**:

```css
:root {
  /* Primary - Brand color (Blue) */
  --color-primary-50: #e3f2fd;
  --color-primary-100: #bbdefb;
  --color-primary-200: #90caf9;
  --color-primary-300: #64b5f6;
  --color-primary-400: #42a5f5;
  --color-primary-500: #2196f3; /* Main */
  --color-primary-600: #1e88e5;
  --color-primary-700: #1976d2;
  --color-primary-800: #1565c0;
  --color-primary-900: #0d47a1;

  /* Secondary - Accent color (Orange) */
  --color-secondary-50: #fff3e0;
  --color-secondary-100: #ffe0b2;
  --color-secondary-200: #ffcc80;
  --color-secondary-300: #ffb74d;
  --color-secondary-400: #ffa726;
  --color-secondary-500: #ff9800; /* Main */
  --color-secondary-600: #fb8c00;
  --color-secondary-700: #f57c00;
  --color-secondary-800: #ef6c00;
  --color-secondary-900: #e65100;
}
```

**Semantic Colors**:

```css
:root {
  /* Success - Green */
  --color-success-light: #81c784;
  --color-success: #4caf50;
  --color-success-dark: #388e3c;

  /* Warning - Yellow */
  --color-warning-light: #ffd54f;
  --color-warning: #ffc107;
  --color-warning-dark: #ffa000;

  /* Error - Red */
  --color-error-light: #e57373;
  --color-error: #f44336;
  --color-error-dark: #d32f2f;

  /* Info - Blue */
  --color-info-light: #64b5f6;
  --color-info: #2196f3;
  --color-info-dark: #1976d2;
}
```

**Neutral Colors** (Light mode):

```css
:root[data-theme="light"] {
  /* Backgrounds */
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --bg-tertiary: #eeeeee;
  --bg-elevated: #ffffff; /* Cards, modals */
  --bg-overlay: rgba(0, 0, 0, 0.5);

  /* Text */
  --text-primary: #212121;
  --text-secondary: #757575;
  --text-tertiary: #9e9e9e;
  --text-disabled: #bdbdbd;
  --text-inverse: #ffffff;

  /* Borders */
  --border-light: #e0e0e0;
  --border-medium: #bdbdbd;
  --border-dark: #9e9e9e;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);
}
```

**Dark Mode**:

```css
:root[data-theme="dark"] {
  /* Backgrounds */
  --bg-primary: #121212;
  --bg-secondary: #1e1e1e;
  --bg-tertiary: #2c2c2c;
  --bg-elevated: #2c2c2c;
  --bg-overlay: rgba(0, 0, 0, 0.7);

  /* Text */
  --text-primary: #ffffff;
  --text-secondary: #b3b3b3;
  --text-tertiary: #808080;
  --text-disabled: #4d4d4d;
  --text-inverse: #121212;

  /* Borders */
  --border-light: #2c2c2c;
  --border-medium: #3d3d3d;
  --border-dark: #4d4d4d;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.5);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.6);
}
```

---

### Typography

**Font Families**:

```css
:root {
  /* Primary font (Vietnamese support) */
  --font-primary: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif;

  /* Monospace (for code) */
  --font-mono: "Fira Code", "Courier New", monospace;
}
```

**Font Sizes** (Fluid typography):

```css
:root {
  --font-size-xs: 0.75rem; /* 12px */
  --font-size-sm: 0.875rem; /* 14px */
  --font-size-base: 1rem; /* 16px */
  --font-size-lg: 1.125rem; /* 18px */
  --font-size-xl: 1.25rem; /* 20px */
  --font-size-2xl: 1.5rem; /* 24px */
  --font-size-3xl: 1.875rem; /* 30px */
  --font-size-4xl: 2.25rem; /* 36px */
  --font-size-5xl: 3rem; /* 48px */
}
```

**Font Weights**:

```css
:root {
  --font-weight-light: 300;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
}
```

**Line Heights**:

```css
:root {
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;
  --line-height-loose: 2;
}
```

**Usage**:

```css
/* Headings */
h1 {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
}

h2 {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
}

h3 {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-normal);
}

/* Body */
p {
  font-size: var(--font-size-base);
  line-height: var(--line-height-normal);
}

/* Small text */
small,
.text-sm {
  font-size: var(--font-size-sm);
}
```

---

### Spacing System

**Base unit**: 4px

```css
:root {
  --spacing-0: 0;
  --spacing-1: 0.25rem; /* 4px */
  --spacing-2: 0.5rem; /* 8px */
  --spacing-3: 0.75rem; /* 12px */
  --spacing-4: 1rem; /* 16px */
  --spacing-5: 1.25rem; /* 20px */
  --spacing-6: 1.5rem; /* 24px */
  --spacing-8: 2rem; /* 32px */
  --spacing-10: 2.5rem; /* 40px */
  --spacing-12: 3rem; /* 48px */
  --spacing-16: 4rem; /* 64px */
  --spacing-20: 5rem; /* 80px */
  --spacing-24: 6rem; /* 96px */
}
```

**Usage**:

```css
.card {
  padding: var(--spacing-6); /* 24px */
  margin-bottom: var(--spacing-4); /* 16px */
  gap: var(--spacing-3); /* 12px */
}
```

---

### Border Radius

```css
:root {
  --radius-none: 0;
  --radius-sm: 0.25rem; /* 4px */
  --radius-md: 0.5rem; /* 8px */
  --radius-lg: 0.75rem; /* 12px */
  --radius-xl: 1rem; /* 16px */
  --radius-2xl: 1.5rem; /* 24px */
  --radius-full: 9999px; /* Circular */
}
```

**Usage**:

```css
.button {
  border-radius: var(--radius-md);
}
.card {
  border-radius: var(--radius-lg);
}
.avatar {
  border-radius: var(--radius-full);
}
```

---

### Transitions

```css
:root {
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 300ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 500ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

**Usage**:

```css
.button {
  transition: all var(--transition-fast);
}

.modal {
  transition: opacity var(--transition-base), transform var(--transition-base);
}
```

---

## 🧩 Component Library

### Button Component

**Variants**:

- `primary`: Main CTA button (filled, primary color)
- `secondary`: Secondary actions (outlined)
- `tertiary`: Low emphasis (text only)
- `danger`: Destructive actions (red)
- `success`: Positive actions (green)

**Sizes**:

- `sm`: Small (32px height)
- `md`: Medium (40px height, default)
- `lg`: Large (48px height)

**States**:

- `default`: Normal state
- `hover`: Mouse over
- `active`: Clicked
- `disabled`: Cannot interact
- `loading`: Processing

**Example**:

```css
/* Base button */
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-6);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  cursor: pointer;
  transition: all var(--transition-fast);
}

/* Primary variant */
.button--primary {
  background-color: var(--color-primary-500);
  color: white;
}

.button--primary:hover {
  background-color: var(--color-primary-600);
}

/* Disabled state */
.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

---

### Input Component

**Types**:

- `text`: Single line text
- `email`: Email input
- `password`: Password (with show/hide)
- `number`: Numeric input
- `textarea`: Multi-line text
- `select`: Dropdown
- `checkbox`: Multiple choice
- `radio`: Single choice

**States**:

- `default`: Normal
- `focus`: User typing
- `error`: Validation failed
- `disabled`: Cannot edit
- `readonly`: Can view, cannot edit

**Example**:

```css
.input {
  width: 100%;
  padding: var(--spacing-3) var(--spacing-4);
  font-size: var(--font-size-base);
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-md);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: border-color var(--transition-fast);
}

.input:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
}

.input.error {
  border-color: var(--color-error);
}
```

---

### Card Component

**Usage**: Container for related content

**Variants**:

- `default`: Standard card
- `elevated`: With shadow
- `outlined`: With border, no shadow
- `interactive`: Clickable (hover effects)

**Example**:

```css
.card {
  background-color: var(--bg-elevated);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  box-shadow: var(--shadow-md);
}

.card--interactive {
  cursor: pointer;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.card--interactive:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
```

---

### Modal Component

**Structure**:

- Overlay (backdrop)
- Container
- Header (title + close button)
- Body (content)
- Footer (actions)

**Sizes**:

- `sm`: 400px
- `md`: 600px (default)
- `lg`: 800px
- `xl`: 1000px
- `full`: Fullscreen

**Example**:

```css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--bg-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background-color: var(--bg-elevated);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: var(--spacing-6);
  border-bottom: 1px solid var(--border-light);
}

.modal-body {
  padding: var(--spacing-6);
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: var(--spacing-6);
  border-top: 1px solid var(--border-light);
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-3);
}
```

---

### Toast/Snackbar Component

**Positions**:

- `top-left`
- `top-center`
- `top-right`
- `bottom-left`
- `bottom-center`
- `bottom-right` (default)

**Variants**:

- `success`: Green, ✓ icon
- `error`: Red, ✗ icon
- `warning`: Orange, ⚠ icon
- `info`: Blue, ℹ icon

**Example**:

```css
.toast {
  min-width: 300px;
  padding: var(--spacing-4) var(--spacing-5);
  background-color: var(--bg-elevated);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  animation: slideInUp var(--transition-base);
}

.toast--success {
  border-left: 4px solid var(--color-success);
}

@keyframes slideInUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
```

---

## 📱 Responsive Design

### Breakpoints

```css
:root {
  --breakpoint-xs: 0px; /* Mobile portrait */
  --breakpoint-sm: 640px; /* Mobile landscape */
  --breakpoint-md: 768px; /* Tablet portrait */
  --breakpoint-lg: 1024px; /* Tablet landscape / Small desktop */
  --breakpoint-xl: 1280px; /* Desktop */
  --breakpoint-2xl: 1536px; /* Large desktop */
}
```

**Media Queries**:

```css
/* Mobile first approach */

/* Base styles (mobile) */
.container {
  padding: var(--spacing-4);
}

/* Tablet and up */
@media (min-width: 768px) {
  .container {
    padding: var(--spacing-6);
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .container {
    padding: var(--spacing-8);
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

---

### Layout Guidelines

**Mobile (< 768px)**:

- Single column layout
- Sidebar → Bottom navigation or hamburger menu
- Full-width cards
- Stacked form fields
- Touch-friendly buttons (min 44px height)

**Tablet (768px - 1023px)**:

- 2-column layouts where appropriate
- Sidebar can be collapsible
- Grid layouts (2 columns)

**Desktop (≥ 1024px)**:

- Multi-column layouts
- Persistent sidebar
- Grid layouts (3-4 columns)
- Hover states enabled
- Tooltips on hover

---

## ♿ Accessibility (a11y)

### WCAG 2.1 Level AA Compliance

**Color Contrast**:

- Normal text: Min 4.5:1
- Large text (18px+): Min 3:1
- UI components: Min 3:1

**Keyboard Navigation**:

- All interactive elements must be keyboard accessible
- Visible focus indicators
- Logical tab order
- Skip navigation links

**ARIA Labels**:

```jsx
// Button with icon only
<button aria-label="Close modal">
  <CloseIcon />
</button>

// Input field
<input
  type="text"
  aria-label="Search subjects"
  aria-describedby="search-help"
/>
<span id="search-help">Enter subject name to search</span>

// Error state
<input
  type="email"
  aria-invalid="true"
  aria-describedby="email-error"
/>
<span id="email-error" role="alert">
  Please enter a valid email address
</span>
```

**Screen Reader Support**:

- Semantic HTML (`<nav>`, `<main>`, `<section>`, `<article>`)
- Proper heading hierarchy (h1 → h2 → h3)
- Alt text for images
- `role` attributes where needed

**Focus Management**:

```css
/* Visible focus indicator */
:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

/* Remove default outline (but keep for keyboard users) */
:focus:not(:focus-visible) {
  outline: none;
}
```

---

## 🎬 Animations & Micro-interactions

### Loading States

**Skeleton Screens**:

```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--bg-secondary) 0%,
    var(--bg-tertiary) 50%,
    var(--bg-secondary) 100%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
```

**Spinners**:

```css
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-light);
  border-top-color: var(--color-primary-500);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
```

---

### Transitions

**Page Transitions**:

```css
/* Fade in/out */
.page-enter {
  opacity: 0;
}

.page-enter-active {
  opacity: 1;
  transition: opacity 300ms;
}

.page-exit {
  opacity: 1;
}

.page-exit-active {
  opacity: 0;
  transition: opacity 300ms;
}
```

**Hover Effects**:

```css
/* Lift effect */
.card-hover {
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

/* Scale effect */
.button-scale:active {
  transform: scale(0.95);
}
```

---

## 📐 Grid System

### CSS Grid Layout

```css
.grid {
  display: grid;
  gap: var(--spacing-6);

  /* Mobile: 1 column */
  grid-template-columns: 1fr;

  /* Tablet: 2 columns */
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  /* Desktop: 3 columns */
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }

  /* Large desktop: 4 columns */
  @media (min-width: 1280px) {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

**Auto-fit Grid** (responsive without media queries):

```css
.auto-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-6);
}
```

---

## 🌐 Internationalization (i18n)

### Text Direction

Support for RTL languages (future):

```css
/* Logical properties */
.card {
  padding-inline: var(--spacing-6); /* horizontal padding */
  padding-block: var(--spacing-4); /* vertical padding */
  margin-inline-start: auto; /* margin-left in LTR, margin-right in RTL */
}
```

### Number Formatting

```javascript
// Vietnamese locale
const formatNumber = (num) => {
  return new Intl.NumberFormat("vi-VN").format(num);
};

formatNumber(99000); // "99.000"

// Currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

formatCurrency(99000); // "99.000 ₫"
```

---

## ✅ Best Practices Checklist

### Performance

- [ ] **Images**:

  - Use WebP format with fallbacks
  - Lazy load images below fold
  - Optimize file sizes (< 100KB)
  - Use appropriate dimensions

- [ ] **CSS**:

  - Minimize CSS file size
  - Remove unused styles
  - Use CSS variables
  - Avoid deep nesting (max 3 levels)

- [ ] **JavaScript**:
  - Code splitting (lazy load routes)
  - Debounce/throttle expensive operations
  - Memoize expensive computations
  - Virtual scrolling for long lists

### Responsiveness

- [ ] Test on multiple devices:

  - Mobile (375px, 414px)
  - Tablet (768px, 1024px)
  - Desktop (1280px, 1920px)

- [ ] Touch targets min 44x44px
- [ ] Readable text (min 16px on mobile)
- [ ] No horizontal scrolling

### Accessibility

- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Color contrast passes WCAG AA
- [ ] Alt text for images
- [ ] ARIA labels where needed
- [ ] Semantic HTML

### Browser Support

- [ ] Chrome (latest 2 versions)
- [ ] Firefox (latest 2 versions)
- [ ] Safari (latest 2 versions)
- [ ] Edge (latest 2 versions)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

---

## 📦 Component Naming Convention

**BEM (Block Element Modifier)**:

```css
/* Block */
.card {
}

/* Element */
.card__header {
}
.card__body {
}
.card__footer {
}

/* Modifier */
.card--elevated {
}
.card--interactive {
}

/* Combination */
.card__header--highlighted {
}
```

**React Component File Structure**:

```
Button/
├── Button.jsx        // Component logic
├── Button.css        // Styles
├── Button.test.jsx   // Tests
└── index.js          // Export
```

---

## 🎯 Success Metrics

- Lighthouse Performance Score > 90
- Lighthouse Accessibility Score > 95
- First Contentful Paint (FCP) < 1.5s
- Time to Interactive (TTI) < 3.5s
- Cumulative Layout Shift (CLS) < 0.1
- No accessibility violations (aXe/WAVE)

---

**Status**: Living Document (cập nhật liên tục)
**Owner**: Frontend Team
**Last Updated**: Nov 2025
