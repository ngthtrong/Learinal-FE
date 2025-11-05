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
  DocumentUploadPage,
  QuizListPage,
  PublicSetsPage,
  ProfileViewPage,
  ProfileEditPage,
  MySubscriptionPage,
  SubjectListPage,
  DocumentListPage,
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
            path="/documents/upload"
            element={
              <ProtectedRoute>
                <TopbarLayout>
                  <DocumentUploadPage />
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
            path="/subjects"
            element={
              <ProtectedRoute>
                <TopbarLayout>
                  <SubjectListPage />
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

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 404 - Not found */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
