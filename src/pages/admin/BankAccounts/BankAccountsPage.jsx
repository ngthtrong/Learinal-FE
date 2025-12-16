import { useState, useEffect } from "react";
import { bankAccountsService } from "../../../services/api";
import Button from "../../../components/common/Button";
import Modal from "../../../components/common/Modal";
import Input from "../../../components/common/Input";
import { useLanguage } from "@/contexts/LanguageContext";

const BankAccountsPage = () => {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [statusFilter, setStatusFilter] = useState("");
  
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, [page, statusFilter]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const params = { page, limit };
      if (statusFilter) params.status = statusFilter;
      
      const data = await bankAccountsService.getAllBankAccounts(params);
      console.log("Bank accounts data:", data);
      setAccounts(data.accounts || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Failed to fetch bank accounts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (account) => {
    if (!window.confirm(t("admin.bankAccounts.confirmVerify", { name: account.expertId?.name }))) {
      return;
    }

    try {
      setActionLoading(true);
      await bankAccountsService.verifyBankAccount(account._id || account.id);
      alert(t("admin.bankAccounts.verifySuccess"));
      fetchAccounts();
    } catch (err) {
      alert(err.message || t("admin.bankAccounts.verifyError"));
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = (account) => {
    setSelectedAccount(account);
    setRejectionReason("");
    setRejectModalOpen(true);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert(t("admin.bankAccounts.enterReason"));
      return;
    }

    try {
      setActionLoading(true);
      await bankAccountsService.rejectBankAccount(
        selectedAccount._id || selectedAccount.id,
        rejectionReason
      );
      alert(t("admin.bankAccounts.rejectSuccess"));
      setRejectModalOpen(false);
      fetchAccounts();
    } catch (err) {
      alert(err.message || t("admin.bankAccounts.rejectError"));
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      Pending: (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
          {t("admin.bankAccounts.statusPending")}
        </span>
      ),
      Verified: (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
          {t("admin.bankAccounts.statusVerified")}
        </span>
      ),
      Rejected: (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
          {t("admin.bankAccounts.statusRejected")}
        </span>
      ),
    };
    return badges[status] || null;
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t("admin.bankAccounts.pageTitle")}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {t("admin.bankAccounts.pageSubtitle")}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-3 mb-6">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="">{t("admin.bankAccounts.allStatus")}</option>
              <option value="Pending">{t("admin.bankAccounts.statusPending")}</option>
              <option value="Verified">{t("admin.bankAccounts.statusVerified")}</option>
              <option value="Rejected">{t("admin.bankAccounts.statusRejected")}</option>
            </select>
          </div>

          {/* Table */}
          {loading ? (
            <div className="py-12 text-center text-gray-500">{t("admin.common.loading")}</div>
          ) : accounts.length === 0 ? (
            <div className="py-12 text-center text-gray-500">{t("admin.common.noData")}</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-slate-700/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        {t("admin.bankAccounts.expert")}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        {t("admin.bankAccounts.accountHolder")}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        {t("admin.bankAccounts.accountNumber")}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        {t("admin.bankAccounts.bankName")}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        {t("admin.common.status")}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        {t("admin.bankAccounts.createdAt")}
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        {t("admin.bankAccounts.actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                    {accounts.map((account) => (
                      <tr key={account._id || account.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {account.expertId?.name || account.expertId?.email || "N/A"}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {account.expertId?.email || ""}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {account.accountHolderName}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white">
                          {account.accountNumber}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {account.bankName}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {getStatusBadge(account.status)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(account.createdAt).toLocaleDateString(language === "vi" ? "vi-VN" : "en-US")}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          {account.status === "Pending" && (
                            <div className="flex gap-2 justify-center">
                              <Button
                                size="small"
                                variant="success"
                                onClick={() => handleVerify(account)}
                                disabled={actionLoading}
                              >
                                {t("admin.bankAccounts.verify")}
                              </Button>
                              <Button
                                size="small"
                                variant="danger"
                                onClick={() => openRejectModal(account)}
                                disabled={actionLoading}
                              >
                                {t("admin.bankAccounts.reject")}
                              </Button>
                            </div>
                          )}
                          {account.status === "Rejected" && account.rejectionReason && (
                            <div className="text-xs text-red-600 dark:text-red-400">
                              {account.rejectionReason}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {t("admin.common.pageOf", { current: page, total: totalPages })} ({total} {t("admin.bankAccounts.accounts")})
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="small"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      {t("admin.common.prev")}
                    </Button>
                    <Button
                      size="small"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      {t("admin.common.next")}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title={t("admin.bankAccounts.rejectModalTitle")}
        onConfirm={handleReject}
        confirmText={t("admin.bankAccounts.reject")}
        confirmVariant="danger"
        loading={actionLoading}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t("admin.bankAccounts.rejectModalDesc", { name: selectedAccount?.expertId?.name })}
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("admin.bankAccounts.rejectReasonLabel")} *
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder={t("admin.bankAccounts.rejectReasonPlaceholder")}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BankAccountsPage;
