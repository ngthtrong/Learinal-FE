/**
 * Validation Request List Page
 * List of requests assigned to expert
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { validationRequestsService } from "@/services/api";
import Button from "@/components/common/Button";
import { useLanguage } from "@/contexts/LanguageContext";

function ValidationRequestListPage() {
  const { t } = useLanguage();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("Assigned"); // Assigned, RevisionRequested, Completed

  useEffect(() => {
    loadRequests();
  }, [filter]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const res = await validationRequestsService.list({
        page: 1,
        pageSize: 20,
        status: filter,
      });
      setRequests(res.items || []);
    } catch (err) {
      console.error("Failed to load requests", err);
      setError(t("expertPages.validationRequests.loadError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{t("expertPages.validationRequests.pageTitle")}</h1>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button
              onClick={() => setFilter("Assigned")}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition ${filter === "Assigned"
                  ? "bg-primary-600 text-white shadow"
                  : "bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700"
              }`}
            >
              {t("expertPages.validationRequests.filters.assigned")}
            </button>
            <button
              onClick={() => setFilter("RevisionRequested")}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition ${filter === "RevisionRequested"
                  ? "bg-warning-600 text-white shadow"
                  : "bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700"
              }`}
            >
              {t("expertPages.validationRequests.filters.revisionRequested")}
            </button>
            <button
              onClick={() => setFilter("Completed")}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition ${filter === "Completed"
                  ? "bg-success-600 text-white shadow"
                  : "bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700"
              }`}
            >
              {t("expertPages.validationRequests.filters.completed")}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 text-xs sm:text-sm">
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
          {loading ? (
            <div className="p-6 sm:p-8 text-center text-gray-500 dark:text-gray-400">
              <div className="inline-block w-8 h-8 sm:w-10 sm:h-10 border-4 border-primary-200 dark:border-primary-800 border-t-primary-600 dark:border-t-primary-400 rounded-full animate-spin mb-3"></div>
              <p className="text-sm sm:text-base">{t("expertPages.validationRequests.loading")}</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <div className="text-3xl sm:text-4xl mb-3">📭</div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">{t("expertPages.validationRequests.empty.title")}</h3>
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1">
                {t("expertPages.validationRequests.empty.description")}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-slate-700">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition flex flex-col gap-3 sm:gap-4"
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span
                        className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          req.status === "Assigned"
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400"
                            : req.status === "RevisionRequested"
                            ? "bg-warning-100 dark:bg-warning-900/30 text-warning-800 dark:text-warning-400"
                            : req.status === "Completed"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                            : "bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {req.status === "Assigned"
                          ? t("expertPages.validationRequests.status.assigned")
                          : req.status === "RevisionRequested"
                          ? t("expertPages.validationRequests.status.revisionRequested")
                          : req.status === "Completed"
                          ? t("expertPages.validationRequests.status.completed")
                          : req.status}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">ID: {req.id.slice(-6)}</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                      {req.questionSetTitle || t("expertPages.validationRequests.untitledQuestionSet")}
                    </h3>
                    <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex flex-wrap gap-x-3 sm:gap-x-4 gap-y-1">
                      <span>👤 {req.requesterName}</span>
                      <span>📅 {new Date(req.createdAt).toLocaleDateString("vi-VN")}</span>
                      <span>💰 {req.commissionAmount?.toLocaleString("vi-VN")}đ</span>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Link to={`/expert/requests/${req.id}`} className="w-full sm:w-auto">
                      <Button 
                        variant={req.status === "Assigned" || req.status === "RevisionRequested" ? "primary" : "outline"}
                        className="w-full sm:w-auto text-sm"
                      >
                        {req.status === "Assigned" ? t("expertPages.validationRequests.actions.validate") : req.status === "RevisionRequested" ? t("expertPages.validationRequests.actions.review") : t("expertPages.validationRequests.actions.viewDetail")}
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ValidationRequestListPage;
