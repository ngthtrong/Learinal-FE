/**
 * Profile Edit Page
 * Edit user profile information
 */

import { useLanguage } from "@/contexts/LanguageContext";
import { Footer } from "@/components/layout";

function ProfileEditPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <div className="bg-white dark:bg-slate-800 shadow-sm border border-gray-200 dark:border-slate-700 rounded-lg px-4 sm:px-6 py-4 sm:py-6 mb-4 sm:mb-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100">✏️ {t("profileEdit.pageTitle")}</h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">{t("profileEdit.pageSubtitle")}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-8">
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🚧</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {t("profileEdit.underDevelopment")}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">{t("profileEdit.underDevelopmentDesc")}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default ProfileEditPage;
