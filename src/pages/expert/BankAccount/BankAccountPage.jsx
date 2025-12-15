import { useState, useEffect } from "react";
import { bankAccountsService, banksService } from "../../../services/api";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";
import { useAuth } from "../../../contexts/AuthContext";

const BankAccountPage = () => {
  const { user } = useAuth();
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
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      setLoading(true);
      const selectedBank = banks.find((b) => b.code === formData.bankCode);
      await bankAccountsService.linkBankAccount({
        ...formData,
        bankName: selectedBank?.name || "",
      });
      setSuccess("Liên kết tài khoản ngân hàng thành công. Vui lòng chờ Admin xác minh.");
      fetchBankAccount();
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra khi liên kết tài khoản ngân hàng");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      Pending: (
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
          Đang chờ xác minh
        </span>
      ),
      Verified: (
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
          Đã xác minh
        </span>
      ),
      Rejected: (
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
          Bị từ chối
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
            Tài khoản ngân hàng
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Liên kết tài khoản ngân hàng để nhận thanh toán hoa hồng
          </p>

          {bankAccount && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Trạng thái tài khoản
                </h3>
                {getStatusBadge(bankAccount.status)}
              </div>
              
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Chủ tài khoản:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    {bankAccount.accountHolderName}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Số tài khoản:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    {bankAccount.accountNumber}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Ngân hàng:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    {bankAccount.bankName}
                  </span>
                </div>
                {bankAccount.status === "Rejected" && bankAccount.rejectionReason && (
                  <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 rounded">
                    <span className="text-red-700 dark:text-red-400 font-medium">Lý do từ chối:</span>
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
                Tên chủ tài khoản *
              </label>
              <Input
                type="text"
                value={formData.accountHolderName}
                onChange={(e) =>
                  setFormData({ ...formData, accountHolderName: e.target.value })
                }
                placeholder="Nguyễn Văn A"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Số tài khoản *
              </label>
              <Input
                type="text"
                value={formData.accountNumber}
                onChange={(e) =>
                  setFormData({ ...formData, accountNumber: e.target.value })
                }
                placeholder="0123456789"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ngân hàng *
              </label>
              <select
                value={formData.bankCode}
                onChange={(e) => setFormData({ ...formData, bankCode: e.target.value })}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Chọn ngân hàng</option>
                {banks.map((bank) => (
                  <option key={bank.code} value={bank.code}>
                    {bank.shortName} - {bank.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Đang xử lý..." : bankAccount ? "Cập nhật" : "Liên kết"}
              </Button>
            </div>
          </form>

          <div className="mt-6 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              📌 Lưu ý
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Tài khoản ngân hàng phải đúng với tên chuyên gia đã đăng ký</li>
              <li>• Admin sẽ xác minh thông tin trước khi cho phép thanh toán</li>
              <li>• Hoa hồng chỉ được thanh toán khi đạt tối thiểu 2,000đ</li>
              <li>• Nếu bị từ chối, vui lòng cập nhật lại thông tin chính xác</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankAccountPage;
