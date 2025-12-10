import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import expertBankAccountService from "../../../services/api/expertBankAccounts.service";

const BankAccountPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [banks, setBanks] = useState([]);
  const [bankAccount, setBankAccount] = useState(null);
  const [formData, setFormData] = useState({
    bankCode: "",
    accountNumber: "",
    accountName: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [banksRes, accountRes] = await Promise.all([
        expertBankAccountService.getBanks(),
        expertBankAccountService.getMyBankAccount(),
      ]);

      setBanks(banksRes.data || []);
      
      if (accountRes.data) {
        setBankAccount(accountRes.data);
        setFormData({
          bankCode: accountRes.data.bankCode || "",
          accountNumber: accountRes.data.accountNumber || "",
          accountName: accountRes.data.accountName || "",
        });
      }
    } catch (err) {
      console.error("Failed to fetch bank data:", err);
      if (err.response?.status !== 404) {
        setError("Không thể tải dữ liệu tài khoản ngân hàng");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.bankCode || !formData.accountNumber || !formData.accountName) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      setSaving(true);
      await expertBankAccountService.createOrUpdateBankAccount(formData);
      setSuccess(
        bankAccount
          ? "Cập nhật tài khoản thành công! Tài khoản cần được xác minh lại."
          : "Đăng ký tài khoản thành công! Chờ admin xác minh."
      );
      
      // Refresh data
      setTimeout(() => {
        fetchData();
        setSuccess("");
      }, 2000);
    } catch (err) {
      console.error("Failed to save bank account:", err);
      setError(err.response?.data?.message || "Lỗi khi lưu tài khoản ngân hàng");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <button
          onClick={() => navigate("/expert/commission-records")}
          className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Tài khoản ngân hàng</h1>

        {bankAccount && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-2">
                  Trạng thái:{" "}
                  <span
                    className={`font-semibold ${
                      bankAccount.isVerified ? "text-green-600" : "text-yellow-600"
                    }`}
                  >
                    {bankAccount.isVerified ? "✓ Đã xác minh" : "⏳ Chờ xác minh"}
                  </span>
                </p>
                {!bankAccount.isVerified && (
                  <p className="text-xs text-gray-500">
                    Admin sẽ xác minh tài khoản của bạn trước khi bạn có thể rút tiền
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngân hàng <span className="text-red-500">*</span>
            </label>
            <select
              name="bankCode"
              value={formData.bankCode}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">-- Chọn ngân hàng --</option>
              {banks.map((bank) => (
                <option key={bank.code} value={bank.code}>
                  {bank.code} - {bank.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số tài khoản <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              placeholder="Nhập số tài khoản"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên chủ tài khoản <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="accountName"
              value={formData.accountName}
              onChange={handleChange}
              placeholder="Nhập tên chủ tài khoản (không dấu, in hoa)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Ví dụ: NGUYEN VAN A
            </p>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {saving ? "Đang lưu..." : bankAccount ? "Cập nhật" : "Đăng ký"}
            </button>
          </div>
        </form>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-2">Lưu ý:</h3>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li>Tài khoản ngân hàng phải là tài khoản cá nhân của bạn</li>
            <li>Tên chủ tài khoản phải viết không dấu và in hoa</li>
            <li>Admin sẽ xác minh thông tin trước khi bạn có thể rút tiền</li>
            <li>Khi cập nhật thông tin, tài khoản sẽ phải được xác minh lại</li>
            <li>Số tiền rút tối thiểu là 2,000 VND</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BankAccountPage;
