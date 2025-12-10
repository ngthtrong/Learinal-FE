import React, { useState, useEffect } from "react";
import expertBankAccountService from "../../../services/api/expertBankAccounts.service";

const AdminBankAccountsPage = () => {
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState([]);
  const [filterVerified, setFilterVerified] = useState("");

  useEffect(() => {
    fetchAccounts();
  }, [filterVerified]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterVerified === "true") params.isVerified = true;
      if (filterVerified === "false") params.isVerified = false;
      
      const res = await expertBankAccountService.listAllBankAccounts(params);
      setAccounts(res.data || []);
    } catch (err) {
      console.error("Failed to fetch bank accounts:", err);
      alert("Không thể tải danh sách tài khoản ngân hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id) => {
    if (!confirm("Xác nhận tài khoản này là hợp lệ?")) return;

    try {
      await expertBankAccountService.verifyBankAccount(id);
      alert("Đã xác minh tài khoản");
      fetchAccounts();
    } catch (err) {
      console.error("Failed to verify account:", err);
      alert(err.response?.data?.message || "Lỗi khi xác minh tài khoản");
    }
  };

  const handleUnverify = async (id) => {
    if (!confirm("Bỏ xác minh tài khoản này?")) return;

    try {
      await expertBankAccountService.unverifyBankAccount(id);
      alert("Đã bỏ xác minh tài khoản");
      fetchAccounts();
    } catch (err) {
      console.error("Failed to unverify account:", err);
      alert(err.response?.data?.message || "Lỗi khi bỏ xác minh");
    }
  };

  const formatDate = (date) => {
    return date ? new Date(date).toLocaleString("vi-VN") : "N/A";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Quản lý tài khoản ngân hàng Expert</h1>

      {/* Filter */}
      <div className="mb-6">
        <select
          value={filterVerified}
          onChange={(e) => setFilterVerified(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tất cả</option>
          <option value="false">Chưa xác minh</option>
          <option value="true">Đã xác minh</option>
        </select>
      </div>

      {/* Accounts Table */}
      {accounts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Không có tài khoản nào</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Expert
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ngân hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Số tài khoản
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tên chủ TK
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {accounts.map((account) => (
                <tr key={account._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-900">{account.expertId?.name || "N/A"}</p>
                      <p className="text-gray-500 text-xs">{account.expertId?.email || "N/A"}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-900">{account.bankCode}</p>
                      <p className="text-gray-500 text-xs">{account.bankName}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-900">
                    {account.accountNumber}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {account.accountName}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {account.isVerified ? (
                      <div>
                        <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                          ✓ Đã xác minh
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(account.verifiedAt)}
                        </p>
                        {account.verifiedBy && (
                          <p className="text-xs text-gray-500">
                            Bởi: {account.verifiedBy.name}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                        ⏳ Chờ xác minh
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(account.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-center text-sm">
                    {account.isVerified ? (
                      <button
                        onClick={() => handleUnverify(account._id)}
                        className="px-3 py-1 text-xs border border-yellow-600 text-yellow-600 rounded hover:bg-yellow-50"
                      >
                        Bỏ xác minh
                      </button>
                    ) : (
                      <button
                        onClick={() => handleVerify(account._id)}
                        className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Xác minh
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminBankAccountsPage;
