import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { commissionRecordsService } from "../../../services/api";
import expertBankAccountService from "../../../services/api/expertBankAccounts.service";
import withdrawalRequestService from "../../../services/api/withdrawalRequests.service";

const MINIMUM_WITHDRAWAL = 2000;

const CommissionRecordsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Earned"); // Earned, Pending, Paid
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [bankAccount, setBankAccount] = useState(null);
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [recordsRes, summaryRes, bankRes] = await Promise.all([
        commissionRecordsService.list({ status: activeTab }),
        commissionRecordsService.summary(),
        expertBankAccountService.getMyBankAccount().catch(() => null),
      ]);

      console.log("📊 Commission Records Response:", recordsRes);
      console.log("📊 Items:", recordsRes?.items);
      console.log("📊 Summary:", summaryRes);
      console.log("🏦 Bank Account:", bankRes);
      console.log("🏦 Bank Account Data:", bankRes?.data);
      console.log("🏦 isVerified:", bankRes?.data?.isVerified);
      
      setRecords(recordsRes?.items || []);
      setSummary(summaryRes || null);
      setBankAccount(bankRes?.data || null);
    } catch (err) {
      console.error("Failed to fetch commission data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRecord = (recordId) => {
    setSelectedRecords((prev) => {
      if (prev.includes(recordId)) {
        return prev.filter((id) => id !== recordId);
      } else {
        return [...prev, recordId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedRecords.length === earnedRecords.length) {
      setSelectedRecords([]);
    } else {
      setSelectedRecords(earnedRecords.map((r) => r.id));
    }
  };

  const earnedRecords = records.filter((r) => r.status === "Earned");
  const selectedTotal = earnedRecords
    .filter((r) => selectedRecords.includes(r.id))
    .reduce((sum, r) => {
      const amount = Number(r.commissionAmount) || 0;
      return sum + amount;
    }, 0);

  console.log("💰 Selected Records Detail:", 
    earnedRecords
      .filter((r) => selectedRecords.includes(r.id))
      .map(r => ({ id: r.id, commissionAmount: r.commissionAmount, type: typeof r.commissionAmount }))
  );
  console.log("💰 Selected Total (raw):", selectedTotal);
  console.log("💰 Selected Total (type):", typeof selectedTotal);

  const canWithdraw =
    bankAccount &&
    bankAccount.isVerified &&
    selectedRecords.length > 0 &&
    !isNaN(selectedTotal) &&
    selectedTotal >= MINIMUM_WITHDRAWAL;

  console.log("💰 Withdrawal Check:", {
    hasBankAccount: !!bankAccount,
    isVerified: bankAccount?.isVerified,
    selectedCount: selectedRecords.length,
    selectedTotal,
    minWithdrawal: MINIMUM_WITHDRAWAL,
    canWithdraw,
  });

  const handleRequestWithdrawal = () => {
    if (!canWithdraw) return;
    setShowWithdrawModal(true);
  };

  const confirmWithdrawal = async () => {
    if (!canWithdraw) return;

    const finalAmount = Number(selectedTotal);
    if (isNaN(finalAmount) || finalAmount < MINIMUM_WITHDRAWAL) {
      alert(`Số tiền không hợp lệ hoặc nhỏ hơn ${MINIMUM_WITHDRAWAL.toLocaleString()}₫`);
      return;
    }

    console.log("💰 Creating withdrawal request:", {
      commissionRecordIds: selectedRecords,
      requestedAmount: finalAmount,
      type: typeof finalAmount,
    });

    try {
      setWithdrawing(true);
      await withdrawalRequestService.createWithdrawalRequest({
        commissionRecordIds: selectedRecords,
        requestedAmount: finalAmount,
      });

      alert("Yêu cầu rút tiền thành công! Chờ admin xử lý.");
      setShowWithdrawModal(false);
      setSelectedRecords([]);
      fetchData();
    } catch (err) {
      console.error("Failed to create withdrawal request:", err);
      alert(err.response?.data?.message || "Lỗi khi tạo yêu cầu rút tiền");
    } finally {
      setWithdrawing(false);
    }
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("vi-VN");
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
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Hoa hồng của tôi</h1>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/expert/withdrawal-requests")}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Lịch sử rút tiền
          </button>
          <button
            onClick={() => navigate("/expert/bank-account")}
            className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
          >
            {bankAccount ? "Tài khoản ngân hàng" : "Đăng ký tài khoản"}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Đã kiếm</p>
            <p className="text-2xl font-bold text-green-600">
              {formatMoney(summary.totalEarned || 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">{summary.earnedCount || 0} giao dịch</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Đang chờ</p>
            <p className="text-2xl font-bold text-yellow-600">
              {formatMoney(summary.totalPending || 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">{summary.pendingCount || 0} yêu cầu</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Đã nhận</p>
            <p className="text-2xl font-bold text-blue-600">
              {formatMoney(summary.totalPaid || 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">{summary.paidCount || 0} giao dịch</p>
          </div>
        </div>
      )}

      {/* Bank Account Warning */}
      {!bankAccount && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">
            ⚠️ Bạn chưa đăng ký tài khoản ngân hàng. Vui lòng{" "}
            <button
              onClick={() => navigate("/expert/bank-account")}
              className="underline font-semibold"
            >
              đăng ký tại đây
            </button>{" "}
            để có thể rút tiền.
          </p>
        </div>
      )}

      {bankAccount && !bankAccount.isVerified && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800">
            ℹ️ Tài khoản ngân hàng của bạn đang chờ xác minh. Bạn sẽ có thể rút tiền sau khi admin
            xác minh.
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-4">
          {["Earned", "Pending", "Paid"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setSelectedRecords([]);
              }}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-800"
              }`}
            >
              {tab === "Earned" && "Đã kiếm"}
              {tab === "Pending" && "Đang chờ"}
              {tab === "Paid" && "Đã nhận"}
            </button>
          ))}
        </div>
      </div>

      {/* Withdrawal Actions (only for Earned tab) */}
      {activeTab === "Earned" && earnedRecords.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedRecords.length === earnedRecords.length}
                onChange={handleSelectAll}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">Chọn tất cả</span>
            </label>
            {selectedRecords.length > 0 && (
              <span className="text-sm text-gray-600">
                Đã chọn: {selectedRecords.length} ({formatMoney(selectedTotal)})
              </span>
            )}
          </div>
          <button
            onClick={handleRequestWithdrawal}
            disabled={!canWithdraw}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Yêu cầu rút tiền
          </button>
        </div>
      )}

      {!canWithdraw && selectedRecords.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {!bankAccount && "❌ Bạn cần đăng ký tài khoản ngân hàng trước"}
          {bankAccount && !bankAccount.isVerified && "❌ Tài khoản ngân hàng chưa được xác minh"}
          {selectedTotal < MINIMUM_WITHDRAWAL &&
            `❌ Số tiền tối thiểu là ${formatMoney(MINIMUM_WITHDRAWAL)}`}
        </div>
      )}

      {/* Records Table */}
      {records.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Không có dữ liệu
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {activeTab === "Earned" && <th className="w-12 px-4 py-3"></th>}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ngày
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Bài tập
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Loại
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Cố định
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Doanh thu
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Tổng
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {records.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  {activeTab === "Earned" && (
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedRecords.includes(record.id)}
                        onChange={() => handleSelectRecord(record.id)}
                        className="w-4 h-4"
                      />
                    </td>
                  )}
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {formatDate(record.transactionDate || record.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {record.metadata?.questionSetTitle || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        record.type === "Published"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {record.type === "Published" ? "Công khai" : "Xác minh"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-gray-900">
                    {formatMoney(record.fixedAmount || 0)}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-gray-900">
                    {formatMoney(record.bonusAmount || 0)}
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">
                    {formatMoney(record.commissionAmount || 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Withdrawal Confirmation Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Xác nhận rút tiền</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Số giao dịch:</span>
                <span className="font-semibold">{selectedRecords.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tổng tiền:</span>
                <span className="font-semibold text-green-600">{formatMoney(selectedTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ngân hàng:</span>
                <span className="font-semibold">{bankAccount.bankCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Số TK:</span>
                <span className="font-semibold">{bankAccount.accountNumber}</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Admin sẽ xử lý yêu cầu và chuyển tiền trong vòng 1-3 ngày làm việc.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowWithdrawModal(false)}
                disabled={withdrawing}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={confirmWithdrawal}
                disabled={withdrawing}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              >
                {withdrawing ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommissionRecordsPage;
