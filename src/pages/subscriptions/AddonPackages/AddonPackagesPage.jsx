import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Modal, useToast } from "@/components/common";
import { Footer } from "@/components/layout";
import addonPackagesService from "@/services/api/addonPackages.service";
import { useLanguage } from "@/contexts/LanguageContext";

function AddonPackagesPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useLanguage();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [myQuota, setMyQuota] = useState({ totalTestGenerations: 0, totalValidationRequests: 0 });
  
  // QR Modal state
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [generatingQr, setGeneratingQr] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch available packages và quota đồng thời
      const [packagesRes, quotaRes] = await Promise.all([
        addonPackagesService.getActivePackages(),
        addonPackagesService.getMyQuota().catch(() => ({ totalTestGenerations: 0, totalValidationRequests: 0 }))
      ]);
      
      setPackages(packagesRes?.packages || []);
      // API trả về trực tiếp { totalTestGenerations, totalValidationRequests }
      setMyQuota(quotaRes || { totalTestGenerations: 0, totalValidationRequests: 0 });
    } catch (err) {
      console.error("Error fetching addon packages:", err);
      setError(err?.response?.data?.message || t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  const handleBuyPackage = async (pkg) => {
    setSelectedPackage(pkg);
    setGeneratingQr(true);
    setQrModalOpen(true);
    
    try {
      const res = await addonPackagesService.generatePaymentQR(pkg._id || pkg.id);
      setQrData(res);
    } catch (err) {
      console.error("Error generating QR:", err);
      toast.showError(err?.response?.data?.message || t("subscription.payment.qrError"));
      setQrModalOpen(false);
    } finally {
      setGeneratingQr(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">{t("subscription.addon.loading")}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-6 py-4 rounded-lg max-w-2xl mx-auto mt-8">
            <p className="font-medium">{error}</p>
            <Button variant="secondary" className="mt-4" onClick={fetchData}>
              {t("subscription.addon.retry")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 pt-4 sm:pt-6">
        <div className="bg-white dark:bg-slate-800 shadow-sm border border-gray-200 dark:border-slate-700 rounded-lg px-4 sm:px-6 py-4 sm:py-6 mb-4 sm:mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-xs sm:text-sm mb-3 sm:mb-4 flex items-center gap-1"
          >
            ← {t("subscription.addon.backToList")}
          </button>
          
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">{t("subscription.addon.pageTitle")}</h1>
          </div>
          <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400">
            {t("subscription.addon.pageSubtitle")}
          </p>
        </div>
      </div>

      {/* Current Quota Summary */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 mb-4 sm:mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
            {t("subscription.addon.currentQuota")}
          </h2>
          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 sm:p-4 text-center">
              <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-blue-600 dark:text-blue-400">
                {myQuota.totalTestGenerations}
              </div>
              <div className="text-[10px] sm:text-xs lg:text-sm text-blue-700 dark:text-blue-300">{t("subscription.addon.testGenerations")}</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2 sm:p-4 text-center">
              <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-purple-600 dark:text-purple-400">
                {myQuota.totalValidationRequests}
              </div>
              <div className="text-[10px] sm:text-xs lg:text-sm text-purple-700 dark:text-purple-300">{t("subscription.addon.validationRequests")}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Packages Grid */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 pb-6 sm:pb-8">
        {packages.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-8 sm:p-12 text-center">
            <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">📦</div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {t("subscription.addon.noPackages")}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              {t("subscription.addon.noPackagesDesc")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {packages.map((pkg) => (
              <div
                key={pkg._id || pkg.id}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Package Header */}
                <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-3 sm:p-4 text-white">
                  <h3 className="text-base sm:text-lg font-bold">{pkg.packageName}</h3>
                  {pkg.description && (
                    <p className="text-white/80 text-xs sm:text-sm mt-1">{pkg.description}</p>
                  )}
                </div>

                {/* Package Content */}
                <div className="p-4 sm:p-5">
                  {/* Price */}
                  <div className="text-center mb-3 sm:mb-4">
                    <span className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {formatPrice(pkg.price)}
                    </span>
                  </div>

                  {/* Benefits */}
                  <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-5">
                    {pkg.additionalTestGenerations > 0 && (
                      <div className="flex items-center gap-2 sm:gap-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 sm:p-3">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-200 dark:bg-blue-800 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <span className="font-semibold text-sm sm:text-base text-blue-700 dark:text-blue-300">
                            +{pkg.additionalTestGenerations}
                          </span>
                          <span className="text-blue-600 dark:text-blue-400 text-xs sm:text-sm ml-1">
                            {t("subscription.addon.testGenerations")}
                          </span>
                        </div>
                      </div>
                    )}
                    {pkg.additionalValidationRequests > 0 && (
                      <div className="flex items-center gap-2 sm:gap-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2 sm:p-3">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-purple-200 dark:bg-purple-800 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600 dark:text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <div>
                          <span className="font-semibold text-sm sm:text-base text-purple-700 dark:text-purple-300">
                            +{pkg.additionalValidationRequests}
                          </span>
                          <span className="text-purple-600 dark:text-purple-400 text-xs sm:text-sm ml-1">
                            {t("subscription.addon.validationRequests")}
                          </span>
                        </div>
                      </div>
                    )}
                    </div>

                  {/* Note */}
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 text-center mb-3 sm:mb-4">
                    {t("subscription.addon.validityNote")}
                  </p>

                  {/* Buy Button */}
                  <Button className="w-full" onClick={() => handleBuyPackage(pkg)}>
                    {t("subscription.addon.buyNow")}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QR Payment Modal */}
      <Modal
        isOpen={qrModalOpen}
        onClose={() => {
          setQrModalOpen(false);
          setSelectedPackage(null);
          setQrData(null);
        }}
        title={t("subscription.payment.qrTitle")}
        size="small"
      >
        <div className="text-center">
          {generatingQr ? (
            <div className="py-6">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto mb-3"></div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{t("subscription.payment.generatingQR")}</p>
            </div>
          ) : qrData ? (
            <>
              {/* QR Code Image */}
              <div className="bg-white p-3 rounded-xl inline-block mb-4">
                <img
                  src={qrData.qrCodeUrl || qrData.qrUrl || qrData.qrDataUrl}
                  alt="QR Code"
                  className="w-44 h-44 mx-auto"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='176' height='176' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Crect x='3' y='3' width='7' height='7'/%3E%3Crect x='14' y='3' width='7' height='7'/%3E%3Crect x='3' y='14' width='7' height='7'/%3E%3Crect x='14' y='14' width='7' height='7'/%3E%3C/svg%3E";
                  }}
                />
              </div>

              {/* Payment Info */}
              <div className="text-left mb-4">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">{t("subscription.payment.paymentInfo")}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 dark:text-gray-400">{t("subscription.payment.package")}</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{selectedPackage?.packageName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 dark:text-gray-400">{t("subscription.payment.amount")}</span>
                    <span className="font-bold text-primary-600 dark:text-primary-400">
                      {formatPrice(qrData.amount || selectedPackage?.price)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-left mb-4">
                <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• {t("subscription.payment.scanInstructions")}</li>
                  <li>• {t("subscription.payment.autoActivation")}</li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button 
                  variant="secondary" 
                  className="flex-1"
                  onClick={() => {
                    setQrModalOpen(false);
                    toast.showSuccess(t("subscription.payment.waitConfirmation"));
                  }}
                >
                  {t("subscription.payment.alreadyPaid")}
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => {
                    setQrModalOpen(false);
                    setSelectedPackage(null);
                    setQrData(null);
                  }}
                >
                  {t("subscription.payment.close")}
                </Button>
              </div>
            </>
          ) : (
            <div className="py-6">
              <p className="text-red-600 dark:text-red-400 text-sm">{t("subscription.payment.qrError")}</p>
            </div>
          )}
        </div>
      </Modal>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default AddonPackagesPage;
