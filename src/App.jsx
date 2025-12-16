import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { ActiveQuizProvider } from "./contexts/ActiveQuizContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ToastProvider } from "./components/common";
import ProtectedRoute from "./components/common/ProtectedRoute";
import {
  TopbarLayout,
  SidebarLayout,
  AdminSidebarLayout,
  ExpertSidebarLayout,
} from "@/components/layout";
import RoleBasedSidebarLayout from "./components/layout/RoleBasedSidebarLayout";
import { AdminRoute, ExpertRoute, BackToTop, ActiveQuizBanner } from "./components/common";

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
  AllDocumentsPage,
  QuizListPage,
  PublicSetsPage,
  ProfileViewPage,
  NotificationListPage,
  SubjectListPage,
  SubjectDetailPage,
  SubjectCreatePage,
  SubscriptionPlansPage,
  MySubscriptionPage,
  ViewSubscriptionPage,
  AddonPackagesPage,
  QuestionSetDetailPage,
  QuizStartPage,
  QuizTakingPage,
  QuizResultPage,
  AdminDashboardPage,
  UserManagementPage,
  CommissionRecordsPage,
  BankAccountsPage,
  AdminSubscriptionPlansPage,
  AdminAddonPackagesPage,
  AdminFinancialsPage,
  SubscriptionPurchasesPage,
  ExpertDashboardPage,
  ExpertCommissionRecordsPage,
  ExpertBankAccountPage,
  ExpertValidationRequestsPage,
  ExpertValidationRequestDetailPage,
  ExpertQuestionSetsPage,
  ExpertCreateManualPage,
  ExpertCreateByUploadPage,
  ExpertQuestionSetDetailPage,
  ExpertQuestionSetEditPage,
  ExpertHandleReportsPage,
  ExpertQuizStartPage,
  ExpertQuizTakingPage,
  ExpertQuizResultPage,
} from "./pages";

// Content Flag Pages
import AdminContentFlagsPage from "./pages/admin/ContentFlags/AdminContentFlagsPage";
import AdminContentFlagDetailPage from "./pages/admin/ContentFlags/AdminContentFlagDetailPage";

// Styles
function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ToastProvider>
          <AuthProvider>
            <NotificationProvider>
              <Router>
                <ActiveQuizProvider>
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
                    <SidebarLayout>
                      <PublicSetsPage />
                    </SidebarLayout>
                  </TopbarLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/documents"
              element={
                <ProtectedRoute>
                  <TopbarLayout>
                    <SidebarLayout>
                      <AllDocumentsPage />
                    </SidebarLayout>
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
              path="/addon-packages"
              element={
                <ProtectedRoute>
                  <TopbarLayout>
                    <SidebarLayout>
                      <AddonPackagesPage />
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
                    <RoleBasedSidebarLayout>
                      <ProfileViewPage />
                    </RoleBasedSidebarLayout>
                  </TopbarLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <TopbarLayout>
                    <RoleBasedSidebarLayout>
                      <NotificationListPage />
                    </RoleBasedSidebarLayout>
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
                  <QuizTakingPage />
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
              path="/subscriptions/view"
              element={
                <AdminRoute>
                  <TopbarLayout>
                    <AdminSidebarLayout>
                      <ViewSubscriptionPage />
                    </AdminSidebarLayout>
                  </TopbarLayout>
                </AdminRoute>
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
              path="/admin/addon-packages"
              element={
                <ProtectedRoute>
                  <AdminRoute>
                    <TopbarLayout>
                      <AdminSidebarLayout>
                        <AdminAddonPackagesPage />
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
              path="/admin/bank-accounts"
              element={
                <ProtectedRoute>
                  <AdminRoute>
                    <TopbarLayout>
                      <AdminSidebarLayout>
                        <BankAccountsPage />
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
            <Route
              path="/admin/content-flags"
              element={
                <ProtectedRoute>
                  <AdminRoute>
                    <TopbarLayout>
                      <AdminSidebarLayout>
                        <AdminContentFlagsPage />
                      </AdminSidebarLayout>
                    </TopbarLayout>
                  </AdminRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/content-flags/:id"
              element={
                <ProtectedRoute>
                  <AdminRoute>
                    <TopbarLayout>
                      <AdminSidebarLayout>
                        <AdminContentFlagDetailPage />
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
              path="/expert/commission-records"
              element={
                <ProtectedRoute>
                  <ExpertRoute>
                    <TopbarLayout>
                      <ExpertSidebarLayout>
                        <ExpertCommissionRecordsPage />
                      </ExpertSidebarLayout>
                    </TopbarLayout>
                  </ExpertRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/expert/bank-account"
              element={
                <ProtectedRoute>
                  <ExpertRoute>
                    <TopbarLayout>
                      <ExpertSidebarLayout>
                        <ExpertBankAccountPage />
                      </ExpertSidebarLayout>
                    </TopbarLayout>
                  </ExpertRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/expert/validation-requests"
              element={
                <ProtectedRoute>
                  <ExpertRoute>
                    <TopbarLayout>
                      <ExpertSidebarLayout>
                        <ExpertValidationRequestsPage />
                      </ExpertSidebarLayout>
                    </TopbarLayout>
                  </ExpertRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/expert/validation-requests/:id"
              element={
                <ProtectedRoute>
                  <ExpertRoute>
                    <TopbarLayout>
                      <ExpertSidebarLayout>
                        <ExpertValidationRequestDetailPage />
                      </ExpertSidebarLayout>
                    </TopbarLayout>
                  </ExpertRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/expert/question-sets"
              element={
                <ProtectedRoute>
                  <ExpertRoute>
                    <TopbarLayout>
                      <ExpertSidebarLayout>
                        <ExpertQuestionSetsPage />
                      </ExpertSidebarLayout>
                    </TopbarLayout>
                  </ExpertRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/expert/question-sets/create-manual"
              element={
                <ProtectedRoute>
                  <ExpertRoute>
                    <TopbarLayout>
                      <ExpertSidebarLayout>
                        <ExpertCreateManualPage />
                      </ExpertSidebarLayout>
                    </TopbarLayout>
                  </ExpertRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/expert/question-sets/create-upload"
              element={
                <ProtectedRoute>
                  <ExpertRoute>
                    <TopbarLayout>
                      <ExpertSidebarLayout>
                        <ExpertCreateByUploadPage />
                      </ExpertSidebarLayout>
                    </TopbarLayout>
                  </ExpertRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/expert/question-sets/:id"
              element={
                <ProtectedRoute>
                  <ExpertRoute>
                    <TopbarLayout>
                      <ExpertSidebarLayout>
                        <ExpertQuestionSetDetailPage />
                      </ExpertSidebarLayout>
                    </TopbarLayout>
                  </ExpertRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/expert/question-sets/:id/edit"
              element={
                <ProtectedRoute>
                  <ExpertRoute>
                    <TopbarLayout>
                      <ExpertSidebarLayout>
                        <ExpertQuestionSetEditPage />
                      </ExpertSidebarLayout>
                    </TopbarLayout>
                  </ExpertRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/expert/question-sets/:id/handle-reports"
              element={
                <ProtectedRoute>
                  <ExpertRoute>
                    <TopbarLayout>
                      <ExpertSidebarLayout>
                        <ExpertHandleReportsPage />
                      </ExpertSidebarLayout>
                    </TopbarLayout>
                  </ExpertRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/expert/quiz/:id"
              element={
                <ProtectedRoute>
                  <ExpertRoute>
                    <TopbarLayout>
                      <ExpertSidebarLayout>
                        <ExpertQuestionSetDetailPage />
                      </ExpertSidebarLayout>
                    </TopbarLayout>
                  </ExpertRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/expert/quiz/start/:id"
              element={
                <ProtectedRoute>
                  <ExpertRoute>
                    <TopbarLayout>
                      <ExpertSidebarLayout>
                        <ExpertQuizStartPage />
                      </ExpertSidebarLayout>
                    </TopbarLayout>
                  </ExpertRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/expert/quiz/take/:attemptId"
              element={
                <ProtectedRoute>
                  <ExpertRoute>
                    <TopbarLayout>
                      <ExpertQuizTakingPage />
                    </TopbarLayout>
                  </ExpertRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/expert/quiz/result/:attemptId"
              element={
                <ProtectedRoute>
                  <ExpertRoute>
                    <TopbarLayout>
                      <ExpertSidebarLayout>
                        <ExpertQuizResultPage />
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
              <ActiveQuizBanner />
              <BackToTop />
              </ActiveQuizProvider>
            </Router>
          </NotificationProvider>
        </AuthProvider>
      </ToastProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
