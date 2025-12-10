import React, { useState, useEffect } from "react";
import withdrawalRequestService from "../../../services/api/withdrawalRequests.service";

const AdminWithdrawalRequestsPage = () => {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("Pending");
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [completeModal, setCompleteModal] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [selectedStatus]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = selectedStatus ? { status: selectedStatus } : {};
      const res = await withdrawalRequestService.listAllWithdrawalRequests(params);
      setRequests(res.data || []);
    } catch (err) {
      console.error("Failed to fetch withdrawal requests:", err);
      alert("Không thể tải danh sách yêu cầu rút tiền");
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async (request) => {
    setSelectedRequest(request);
    try {
      setProcessing(true);
      const res = await withdrawalRequestService.processWithdrawalRequest(request._id, {
        transferContent: `Tra tien hoa hong ${new Date().toISOString()}`,
      });
      
      // Update request with QR code
      setSelectedRequest(res.data);
      setShowQRModal(true);
      fetchRequests();
    } catch (err) {
      console.error("Failed to process request:", err);
      alert(err.response?.data?.message || "Lỗi khi xử lý yêu cầu");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert("Vui lòng nhập lý do từ chối");
      return;
    }

    try {
      setProcessing(true);
      await withdrawalRequestService.rejectWithdrawalRequest(selectedRequest._id, {
        reason: rejectReason,
      });
      alert("Đã từ chối yêu cầu rút tiền");
      setRejectModal(false);
      setRejectReason("");
      setSelectedRequest(null);
      fetchRequests();
    } catch (err) {
      console.error("Failed to reject request:", err);
      alert(err.response?.data?.message || "Lỗi khi từ chối yêu cầu");
    } finally {
      setProcessing(false);
    }
  };

  const handleComplete = async () => {
    try {
      setProcessing(true);
      await withdrawalRequestService.completeWithdrawalRequest(selectedRequest._id, {
        transactionId: `MANUAL_${Date.now()}`,
        notes: "Đã chuyển tiền thành công qua ngân hàng",
      });
      alert("✅ Đã xác nhận chuyển tiền thành công!");
      setCompleteModal(false);
      setShowQRModal(false);
      setSelectedRequest(null);
      fetchRequests();
    } catch (err) {
      console.error("Failed to complete request:", err);
      alert(err.response?.data?.message || "Lỗi khi xác nhận chuyển tiền");
    } finally {
      setProcessing(false);
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
      <h1 className="text-2xl font-bold mb-6">Yêu cầu rút tiền của Expert</h1>

      {/* Filter */}
      <div className="mb-6 flex gap-3">
        {["Pending", "Processing", "Completed", "Rejected", "Cancelled"].map((s) => (
          <button
            key={s}
            onClick={() => setSelectedStatus(s)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedStatus === s
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {s === "Pending" && "Chờ xử lý"}
            {s === "Processing" && "Đang xử lý"}
            {s === "Completed" && "Hoàn tất"}
            {s === "Rejected" && "Từ chối"}
            {s === "Cancelled" && "Đã hủy"}
          </button>
        ))}
      </div>

      {/* Requests List */}
      {requests.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Không có yêu cầu nào</div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusBadge(request.status)}
                    <span className="text-sm text-gray-500">{formatDate(request.createdAt)}</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {formatMoney(request.requestedAmount)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Expert: <span className="font-medium">{request.expertId?.name || "N/A"}</span>
                    {" ("}
                    {request.expertId?.email || "N/A"}
                    {")"}
                  </p>
                </div>
                {request.status === "Pending" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleProcess(request)}
                      disabled={processing}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                    >
                      {processing ? "Đang xử lý..." : "Xử lý"}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        setRejectModal(true);
                      }}
                      className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50"
                    >
                      Từ chối
                    </button>
                  </div>
                )}
                {request.status === "Processing" && (
                  <button
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowQRModal(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Xem QR Code
                  </button>
                )}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Số giao dịch:</span>
                  <span className="font-medium">{request.commissionRecordIds?.length || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ngân hàng:</span>
                  <span className="font-medium">
                    {request.bankAccount?.bankCode} - {request.bankAccount?.bankName}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Số tài khoản:</span>
                  <span className="font-mono font-medium">{request.bankAccount?.accountNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tên chủ TK:</span>
                  <span className="font-medium">{request.bankAccount?.accountName}</span>
                </div>

                {request.status === "Completed" && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      ✓ Đã chuyển tiền lúc {formatDate(request.completedAt)}
                    </p>
                    {request.sepayTransferId && (
                      <p className="text-xs text-green-600 mt-1">
                        Transaction ID: {request.sepayTransferId}
                      </p>
                    )}
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

      {/* QR Code Modal */}
      {showQRModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Quét mã để chuyển tiền</h3>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex justify-center mb-4">
                {selectedRequest.qrCode ? (
                  <img
                    src={selectedRequest.qrCode}
                    alt="QR Code"
                    className="w-64 h-64 border-2 border-gray-300 rounded"
                  />
                ) : (
                  <div className="w-64 h-64 bg-gray-200 flex items-center justify-center rounded">
                    <span className="text-gray-500">QR Code không khả dụng</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Số tiền:</span>
                  <span className="font-bold text-green-600">
                    {formatMoney(selectedRequest.requestedAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ngân hàng:</span>
                  <span className="font-medium">{selectedRequest.bankAccount?.bankCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Số TK:</span>
                  <span className="font-mono">{selectedRequest.bankAccount?.accountNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tên:</span>
                  <span className="font-medium">{selectedRequest.bankAccount?.accountName}</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-yellow-50 rounded-lg mb-4">
              <p className="text-sm text-yellow-800 font-medium">
                ⚠️ Sau khi quét QR và chuyển tiền xong, bạn phải click "Xác nhận đã chuyển" bên dưới.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowQRModal(false);
                  setSelectedRequest(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  setCompleteModal(true);
                }}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                ✓ Xác nhận đã chuyển
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Modal */}
      {completeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Xác nhận đã chuyển tiền</h3>
            
            <div className="p-4 bg-green-50 rounded-lg mb-4">
              <p className="text-sm text-green-800 mb-2">
                <strong>Thông tin chuyển khoản:</strong>
              </p>
              <p className="text-sm text-green-800">
                • Số tiền: <strong>{formatMoney(selectedRequest?.requestedAmount)}</strong>
              </p>
              <p className="text-sm text-green-800">
                • Ngân hàng: <strong>{selectedRequest?.bankAccount?.bankCode}</strong>
              </p>
              <p className="text-sm text-green-800">
                • Số TK: <strong>{selectedRequest?.bankAccount?.accountNumber}</strong>
              </p>
              <p className="text-sm text-green-800">
                • Tên: <strong>{selectedRequest?.bankAccount?.accountName}</strong>
              </p>
            </div>

            <div className="p-3 bg-yellow-50 rounded-lg mb-4">
              <p className="text-sm text-yellow-800">
                ⚠️ Bạn xác nhận đã chuyển tiền thành công cho expert này?
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setCompleteModal(false);
                }}
                disabled={processing}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleComplete}
                disabled={processing}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
              >
                {processing ? "Đang xử lý..." : "✓ Xác nhận đã chuyển"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Từ chối yêu cầu rút tiền</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lý do từ chối <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Nhập lý do từ chối..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setRejectModal(false);
                  setRejectReason("");
                  setSelectedRequest(null);
                }}
                disabled={processing}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleReject}
                disabled={processing || !rejectReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400"
              >
                {processing ? "Đang xử lý..." : "Xác nhận từ chối"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWithdrawalRequestsPage;
