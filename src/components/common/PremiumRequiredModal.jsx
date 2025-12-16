import Button from "./Button";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * Premium Required Modal
 * Shows a modal when user tries to access premium content without subscription
 */
const PremiumRequiredModal = ({ onClose, onUpgrade, title }) => {
  const { t } = useLanguage();

  const displayTitle = title ?? t("components.premiumRequiredModal.defaultTitle");

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" 
          aria-hidden="true"
          onClick={onClose}
        ></div>

        {/* Center modal */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-200 dark:border-gray-700">
          {/* Premium Badge Icon */}
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 px-6 pt-6 pb-4">
            <div className="flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-lg">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="white" stroke="white"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-5">
            <div className="text-center mb-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2" id="modal-title">
                {t("components.premiumRequiredModal.defaultTitle")}
              </h3>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-medium">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                {t("components.premiumRequiredModal.badgeLabel")}
              </div>
            </div>

            <div className="text-center mb-6">
              <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
                <strong className="text-gray-900 dark:text-gray-100">{displayTitle}</strong> {t("components.premiumRequiredModal.contentDescription")}
              </p>
            </div>

            {/* Features list */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 mb-6">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                {t("components.premiumRequiredModal.benefitsTitle")}
              </p>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>{t("components.premiumRequiredModal.benefit1")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>{t("components.premiumRequiredModal.benefit2")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>{t("components.premiumRequiredModal.benefit3")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>{t("components.premiumRequiredModal.benefit4")}</span>
                </li>
              </ul>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleUpgrade}
                variant="primary"
                className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
                  </svg>
                  {t("components.premiumRequiredModal.upgradeButton")}
                </span>
              </Button>
              <Button
                onClick={onClose}
                variant="secondary"
                className="flex-1"
              >
                {t("components.premiumRequiredModal.cancelButton")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumRequiredModal;
