/**
 * Type Definitions Index
 * Central export for all type definitions (for JSDoc or TypeScript migration)
 */

/**
 * @typedef {Object} User
 * @property {string} _id - User ID
 * @property {string} email - User email
 * @property {string} fullName - User full name
 * @property {string} role - User role
 * @property {string} avatar - User avatar URL
 * @property {boolean} isEmailVerified - Email verification status
 * @property {Date} createdAt - Account creation date
 */

/**
 * @typedef {Object} Document
 * @property {string} _id - Document ID
 * @property {string} title - Document title
 * @property {string} description - Document description
 * @property {string} fileUrl - Document file URL
 * @property {string} status - Document processing status
 * @property {string} uploadedBy - User ID who uploaded
 * @property {Date} createdAt - Upload date
 */

/**
 * @typedef {Object} QuestionSet
 * @property {string} _id - Question set ID
 * @property {string} title - Question set title
 * @property {string} subject - Subject ID
 * @property {Array<Question>} questions - Array of questions
 * @property {string} createdBy - User ID who created
 * @property {Date} createdAt - Creation date
 */

/**
 * @typedef {Object} Question
 * @property {string} _id - Question ID
 * @property {string} questionText - Question text
 * @property {Array<string>} options - Answer options
 * @property {number} correctAnswer - Index of correct answer
 * @property {string} explanation - Explanation for answer
 */

/**
 * @typedef {Object} QuizAttempt
 * @property {string} _id - Quiz attempt ID
 * @property {string} questionSet - Question set ID
 * @property {string} student - Student user ID
 * @property {Array<Answer>} answers - Student's answers
 * @property {number} score - Quiz score
 * @property {string} status - Quiz status
 * @property {Date} startedAt - Start time
 * @property {Date} completedAt - Completion time
 */

/**
 * @typedef {Object} Answer
 * @property {string} question - Question ID
 * @property {number} selectedAnswer - Selected answer index
 * @property {boolean} isCorrect - Whether answer is correct
 */

/**
 * @typedef {Object} Subject
 * @property {string} _id - Subject ID
 * @property {string} name - Subject name
 * @property {string} description - Subject description
 * @property {string} createdBy - User ID who created
 */

/**
 * @typedef {Object} SubscriptionPlan
 * @property {string} _id - Plan ID
 * @property {string} name - Plan name
 * @property {string} tier - Plan tier (free, premium, enterprise)
 * @property {number} price - Plan price
 * @property {Object} features - Plan features
 */

/**
 * @typedef {Object} Notification
 * @property {string} _id - Notification ID
 * @property {string} recipient - User ID
 * @property {string} type - Notification type
 * @property {string} title - Notification title
 * @property {string} message - Notification message
 * @property {boolean} isRead - Read status
 * @property {Date} createdAt - Creation date
 */

export default {};
