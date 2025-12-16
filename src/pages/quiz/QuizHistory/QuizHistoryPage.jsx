/**
 * Quiz History Page
 * Display user's quiz attempt history
 */

import { useLanguage } from "@/contexts/LanguageContext";

function QuizHistoryPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-white dark:bg-slate-800 shadow-sm border border-gray-200 dark:border-slate-700 rounded-lg px-4 sm:px-6 py-4 sm:py-6 mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100">{t("quizPages.history.pageTitle")}</h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 mt-2">{t("quizPages.history.pageSubtitle")}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-12 text-center">
          <div className="text-6xl mb-4">🚧</div>
          <p className="text-gray-500 dark:text-gray-400 text-lg">{t("quizPages.history.underDevelopment")}</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
            © 2025 Learinal. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default QuizHistoryPage;
