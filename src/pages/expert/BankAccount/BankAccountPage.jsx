import { useState, useEffect } from "react";
import { bankAccountsService, banksService } from "../../../services/api";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";
import { useAuth } from "../../../contexts/AuthContext";
import { useLanguage } from "../../../contexts/LanguageContext";

const BankAccountPage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [banks, setBanks] = useState([]);
  const [bankAccount, setBankAccount] = useState(null);
  const [formData, setFormData] = useState({
    accountHolderName: "",
    accountNumber: "",
    bankCode: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchBanks();
    fetchBankAccount();
  }, []);

  const fetchBanks = async () => {
    try {
      const data = await banksService.getBanks();
      setBanks(data || []);
    } catch (err) {
      console.error("Failed to fetch banks:", err);
    }
  };

  const fetchBankAccount = async () => {
    try {
      setLoading(true);
      const data = await bankAccountsService.getMyBankAccount();
      if (data) {
        setBankAccount(data);
        setFormData({
          accountHolderName: data.accountHolderName || "",
          accountNumber: data.accountNumber || "",
          bankCode: data.bankCode || "",
        });
      }
    } catch (err) {
      console.error("Failed to fetch bank account:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.accountHolderName || !formData.accountNumber || !formData.bankCode) {
      setError(t("expertPages.bankAccount.validation.required"));
      return;
    }

    try {
      setLoading(true);
      const selectedBank = banks.find((b) => b.code === formData.bankCode);
      await bankAccountsService.linkBankAccount({
        ...formData,
        bankName: selectedBank?.name || "",
      });
      setSuccess(t("expertPages.bankAccount.success"));
      fetchBankAccount();
    } catch (err) {
      setError(err.message || t("expertPages.bankAccount.error"));
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      Pending: (
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
          {t("expertPages.bankAccount.status.pending")}
        </span>
      ),
      Verified: (
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
          {t("expertPages.bankAccount.status.verified")}
        </span>
      ),
      Rejected: (
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
          {t("expertPages.bankAccount.status.rejected")}
        </span>
      ),
    };
    return badges[status] || null;
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t("expertPages.bankAccount.pageTitle")}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            {t("expertPages.bankAccount.pageSubtitle")}
          </p>

          {bankAccount && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t("expertPages.bankAccount.accountStatus")}
                </h3>
                {getStatusBadge(bankAccount.status)}
              </div>
              
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">{t("expertPages.bankAccount.accountHolder")}:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    {bankAccount.accountHolderName}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">{t("expertPages.bankAccount.accountNumber")}:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    {bankAccount.accountNumber}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">{t("expertPages.bankAccount.bankName")}:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    {bankAccount.bankName}
                  </span>
                </div>
                {bankAccount.status === "Rejected" && bankAccount.rejectionReason && (
                  <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 rounded">
                    <span className="text-red-700 dark:text-red-400 font-medium">{t("expertPages.bankAccount.rejectionReason")}:</span>
                    <p className="text-red-600 dark:text-red-300 mt-1">{bankAccount.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded text-emerald-700 dark:text-emerald-400 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("expertPages.bankAccount.form.holderLabel")}
              </label>
              <Input
                type="text"
                value={formData.accountHolderName}
                onChange={(e) =>
                  setFormData({ ...formData, accountHolderName: e.target.value })
                }
                placeholder={t("expertPages.bankAccount.form.holderPlaceholder")}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("expertPages.bankAccount.form.numberLabel")}
              </label>
              <Input
                type="text"
                value={formData.accountNumber}
                onChange={(e) =>
                  setFormData({ ...formData, accountNumber: e.target.value })
                }
                placeholder={t("expertPages.bankAccount.form.numberPlaceholder")}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("expertPages.bankAccount.form.bankLabel")}
              </label>
              <select
                value={formData.bankCode}
                onChange={(e) => setFormData({ ...formData, bankCode: e.target.value })}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">{t("expertPages.bankAccount.selectBank")}</option>
                {banks.map((bank) => (
                  <option key={bank.code} value={bank.code}>
                    {bank.shortName} - {bank.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? t("expertPages.common.processing") : bankAccount ? t("expertPages.bankAccount.form.update") : t("expertPages.bankAccount.form.submit")}
              </Button>
            </div>
          </form>

          <div className="mt-6 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t("expertPages.bankAccount.notes.title")}
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• {t("expertPages.bankAccount.notes.item1")}</li>
              <li>• {t("expertPages.bankAccount.notes.item2")}</li>
              <li>• {t("expertPages.bankAccount.notes.item3")}</li>
              <li>• {t("expertPages.bankAccount.notes.item4")}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankAccountPage;
