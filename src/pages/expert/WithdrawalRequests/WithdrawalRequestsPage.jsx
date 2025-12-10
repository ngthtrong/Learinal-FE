import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import withdrawalRequestService from "../../../services/api/withdrawalRequests.service";

const WithdrawalRequestsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");

  useEffect(() => {
    fetchData();
  }, [selectedStatus]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = selectedStatus ? { status: selectedStatus } : {};
      const [requestsRes, statsRes] = await Promise.all([
        withdrawalRequestService.getMyWithdrawalRequests(params),
        withdrawalRequestService.getMyWithdrawalStats(),
      ]);

      setRequests(requestsRes.data || []);
      setStats(statsRes.data || null);
    } catch (err) {
      console.error("Failed to fetch withdrawal data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm("Bạn có chắc muốn hủy yêu cầu này?")) return;

    try {
      await withdrawalRequestService.cancelWithdrawalRequest(id);
      alert("Đã hủy yêu cầu rút tiền");
      fetchData();
    } catch (err) {
      console.error("Failed to cancel request:", err);
      alert(err.response?.data?.message || "Lỗi khi hủy yêu cầu");
    }
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("vi-VN");
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      Pending: { label: "Chờ xử lý", class: "bg-yellow-100 text-yellow-800" },
      Processing: { label: "Đang xử lý", class: "bg-blue-100 text-blue-800" },
      Completed: { label: "Hoàn tất", class: "bg-green-100 text-green-800" },
      Rejected: { label: "Từ chối", class: "bg-red-100 text-red-800" },
      Cancelled: { label: "Đã hủy", class: "bg-gray-100 text-gray-800" },
    };

    const config = statusConfig[status] || { label: status, class: "bg-gray-100 text-gray-800" };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${config.class}`}>
        {config.label}
      </span>
    );
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
        <h1 className="text-2xl font-bold">Lịch sử rút tiền</h1>
        <button
          onClick={() => navigate("/expert/commission-records")}
          className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
        >
          Quay lại Hoa hồng
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-xs text-gray-600 mb-1">Chờ xử lý</p>
            <p className="text-lg font-bold text-yellow-600">
              {formatMoney(stats.pending?.amount || 0)}
            </p>
            <p className="text-xs text-gray-500">{stats.pending?.count || 0} yêu cầu</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-xs text-gray-600 mb-1">Đang xử lý</p>
            <p className="text-lg font-bold text-blue-600">
              {formatMoney(stats.processing?.amount || 0)}
            </p>
            <p className="text-xs text-gray-500">{stats.processing?.count || 0} yêu cầu</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-xs text-gray-600 mb-1">Hoàn tất</p>
            <p className="text-lg font-bold text-green-600">
              {formatMoney(stats.completed?.amount || 0)}
            </p>
            <p className="text-xs text-gray-500">{stats.completed?.count || 0} yêu cầu</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-xs text-gray-600 mb-1">Từ chối</p>
            <p className="text-lg font-bold text-red-600">
              {formatMoney(stats.rejected?.amount || 0)}
            </p>
            <p className="text-xs text-gray-500">{stats.rejected?.count || 0} yêu cầu</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-600 mb-1">Đã hủy</p>
            <p className="text-lg font-bold text-gray-600">
              {formatMoney(stats.cancelled?.amount || 0)}
            </p>
            <p className="text-xs text-gray-500">{stats.cancelled?.count || 0} yêu cầu</p>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="mb-6">
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="Pending">Chờ xử lý</option>
          <option value="Processing">Đang xử lý</option>
          <option value="Completed">Hoàn tất</option>
          <option value="Rejected">Từ chối</option>
          <option value="Cancelled">Đã hủy</option>
        </select>
      </div>

      {/* Requests List */}
      {requests.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Chưa có yêu cầu rút tiền nào</div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusBadge(request.status)}
                    <span className="text-sm text-gray-500">
                      {formatDate(request.createdAt)}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {formatMoney(request.requestedAmount)}
                  </p>
                </div>
                {request.status === "Pending" && (
                  <button
                    onClick={() => handleCancel(request._id)}
                    className="px-4 py-2 text-sm text-red-600 border border-red-600 rounded-lg hover:bg-red-50"
                  >
                    Hủy yêu cầu
                  </button>
                )}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Số giao dịch hoa hồng:</span>
                  <span className="font-medium">{request.commissionRecordIds?.length || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ngân hàng:</span>
                  <span className="font-medium">
                    {request.bankAccount?.bankCode} - {request.bankAccount?.accountNumber}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tên tài khoản:</span>
                  <span className="font-medium">{request.bankAccount?.accountName}</span>
                </div>

                {request.status === "Processing" && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      ℹ️ Admin đang xử lý yêu cầu của bạn. Tiền sẽ được chuyển trong vòng 1-3 ngày
                      làm việc.
                    </p>
                  </div>
                )}

                {request.status === "Completed" && request.completedAt && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      ✓ Đã chuyển tiền lúc {formatDate(request.completedAt)}
                    </p>
                  </div>
                )}

                {request.status === "Rejected" && request.notes && (
                  <div className="mt-3 p-3 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-800 font-medium mb-1">Lý do từ chối:</p>
                    <p className="text-sm text-red-700">{request.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WithdrawalRequestsPage;
