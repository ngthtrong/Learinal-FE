/**
 * Main App Component
 * Sets up routing and authentication
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import { TopbarLayout, SidebarLayout } from "@/components/layout";

// Pages
import {
  LoginPage,
  RegisterPage,
  OAuthCallbackPage,
  DashboardPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  VerifyEmailPage,
  LearnerHomePage,
  DocumentListPage,
  DocumentDetailPage,
  QuizListPage,
  PublicSetsPage,
  ProfileViewPage,
  ProfileEditPage,
  SubjectListPage,
  SubjectDetailPage,
  SubjectCreatePage,
  SubscriptionPlansPage,
  MySubscriptionPage,
  QuestionSetDetailPage,
  QuizStartPage,
  QuizTakingPage,
  QuizResultPage,
} from "./pages";

// Styles
import "./styles/global.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/oauth/google/callback" element={<OAuthCallbackPage />} />

          {/* Protected routes */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <TopbarLayout>
                  <SidebarLayout>
                    <LearnerHomePage />
                  </SidebarLayout>
                </TopbarLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/documents/list"
            element={
              <ProtectedRoute>
                <TopbarLayout>
                  <SidebarLayout>
                    <DocumentListPage />
                  </SidebarLayout>
                </TopbarLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/documents/:id"
            element={
              <ProtectedRoute>
                <TopbarLayout>
                  <SidebarLayout>
                    <DocumentDetailPage />
                  </SidebarLayout>
                </TopbarLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz"
            element={
              <ProtectedRoute>
                <TopbarLayout>
                  <QuizListPage />
                </TopbarLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/public"
            element={
              <ProtectedRoute>
                <TopbarLayout>
                  <PublicSetsPage />
                </TopbarLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/documents"
            element={
              <ProtectedRoute>
                <TopbarLayout>
                  <DocumentListPage />
                </TopbarLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/mysubscription"
            element={
              <ProtectedRoute>
                <MySubscriptionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <TopbarLayout>
                  <ProfileViewPage />
                </TopbarLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/edit"
            element={
              <ProtectedRoute>
                <TopbarLayout>
                  <ProfileEditPage />
                </TopbarLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/subjects"
            element={
              <ProtectedRoute>
                <TopbarLayout>
                  <SidebarLayout>
                    <SubjectListPage />
                  </SidebarLayout>
                </TopbarLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/subjects/create"
            element={
              <ProtectedRoute>
                <TopbarLayout>
                  <SidebarLayout>
                    <SubjectCreatePage />
                  </SidebarLayout>
                </TopbarLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/subjects/:id"
            element={
              <ProtectedRoute>
                <TopbarLayout>
                  <SidebarLayout>
                    <SubjectDetailPage />
                  </SidebarLayout>
                </TopbarLayout>
              </ProtectedRoute>
            }
          />

          {/* Quiz routes */}
          <Route
            path="/question-sets/:id"
            element={
              <ProtectedRoute>
                <TopbarLayout>
                  <SidebarLayout>
                    <QuestionSetDetailPage />
                  </SidebarLayout>
                </TopbarLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz/start/:id"
            element={
              <ProtectedRoute>
                <TopbarLayout>
                  <SidebarLayout>
                    <QuizStartPage />
                  </SidebarLayout>
                </TopbarLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz/take/:attemptId"
            element={
              <ProtectedRoute>
                <TopbarLayout>
                  <QuizTakingPage />
                </TopbarLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz/result/:attemptId"
            element={
              <ProtectedRoute>
                <TopbarLayout>
                  <SidebarLayout>
                    <QuizResultPage />
                  </SidebarLayout>
                </TopbarLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/subscriptions/plans"
            element={
              <ProtectedRoute>
                <TopbarLayout>
                  <SidebarLayout>
                    <SubscriptionPlansPage />
                  </SidebarLayout>
                </TopbarLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/subscriptions/me"
            element={
              <ProtectedRoute>
                <TopbarLayout>
                  <SidebarLayout>
                    <MySubscriptionPage />
                  </SidebarLayout>
                </TopbarLayout>
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* 404 - Not found */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
