/**
 * Main App Component
 * Sets up routing and authentication
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import {
  TopbarLayout,
  SidebarLayout,
  AdminSidebarLayout,
  ExpertSidebarLayout,
} from "@/components/layout";
import { AdminRoute, ExpertRoute } from "./components/common";

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
  AdminDashboardPage,
  UserManagementPage,
  CommissionRecordsPage,
  AdminSubscriptionPlansPage,
  AdminFinancialsPage,
  SubscriptionPurchasesPage,
  ExpertDashboardPage,
  ValidationRequestListPage,
  ValidationRequestDetailPage,
} from "./pages";

// Styles
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
                  <SidebarLayout>
                    <QuizListPage />
                  </SidebarLayout>
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
                <TopbarLayout>
                  <SidebarLayout>
                    <MySubscriptionPage />
                  </SidebarLayout>
                </TopbarLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <TopbarLayout>
                  <SidebarLayout>
                    <ProfileViewPage />
                  </SidebarLayout>
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
            path="/quiz/:id"
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

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <TopbarLayout>
                    <AdminSidebarLayout>
                      <AdminDashboardPage />
                    </AdminSidebarLayout>
                  </TopbarLayout>
                </AdminRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <TopbarLayout>
                    <AdminSidebarLayout>
                      <UserManagementPage />
                    </AdminSidebarLayout>
                  </TopbarLayout>
                </AdminRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/subscription-plans"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <TopbarLayout>
                    <AdminSidebarLayout>
                      <AdminSubscriptionPlansPage />
                    </AdminSidebarLayout>
                  </TopbarLayout>
                </AdminRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/subscription-purchases"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <TopbarLayout>
                    <AdminSidebarLayout>
                      <SubscriptionPurchasesPage />
                    </AdminSidebarLayout>
                  </TopbarLayout>
                </AdminRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/commission-records"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <TopbarLayout>
                    <AdminSidebarLayout>
                      <CommissionRecordsPage />
                    </AdminSidebarLayout>
                  </TopbarLayout>
                </AdminRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/financials"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <TopbarLayout>
                    <AdminSidebarLayout>
                      <AdminFinancialsPage />
                    </AdminSidebarLayout>
                  </TopbarLayout>
                </AdminRoute>
              </ProtectedRoute>
            }
          />

          {/* Expert routes */}
          <Route
            path="/expert"
            element={
              <ProtectedRoute>
                <ExpertRoute>
                  <TopbarLayout>
                    <ExpertSidebarLayout>
                      <ExpertDashboardPage />
                    </ExpertSidebarLayout>
                  </TopbarLayout>
                </ExpertRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/expert/requests"
            element={
              <ProtectedRoute>
                <ExpertRoute>
                  <TopbarLayout>
                    <ExpertSidebarLayout>
                      <ValidationRequestListPage />
                    </ExpertSidebarLayout>
                  </TopbarLayout>
                </ExpertRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/expert/requests/:id"
            element={
              <ProtectedRoute>
                <ExpertRoute>
                  <TopbarLayout>
                    <ExpertSidebarLayout>
                      <ValidationRequestDetailPage />
                    </ExpertSidebarLayout>
                  </TopbarLayout>
                </ExpertRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/expert/history"
            element={
              <ProtectedRoute>
                <ExpertRoute>
                  <TopbarLayout>
                    <ExpertSidebarLayout>
                      {/* Reuse list page with Completed filter or create new page if needed */}
                      <ValidationRequestListPage />
                    </ExpertSidebarLayout>
                  </TopbarLayout>
                </ExpertRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/expert/commissions"
            element={
              <ProtectedRoute>
                <ExpertRoute>
                  <TopbarLayout>
                    <ExpertSidebarLayout>
                      {/* Reuse commission page or create new one. For now placeholder or reuse admin one if applicable?
                          Actually Expert likely needs their own view.
                          I'll point to a placeholder or reuse CommissionRecordsPage if it supports 'me' context.
                          Let's assume we need to create it later or reuse.
                          For now, I will point to ExpertDashboardPage as placeholder or just omit if not ready.
                          But I added it to sidebar. Let's point to Dashboard for now or create a simple placeholder.
                      */}
                      <div className="p-8 text-center">Tính năng đang phát triển</div>
                    </ExpertSidebarLayout>
                  </TopbarLayout>
                </ExpertRoute>
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
