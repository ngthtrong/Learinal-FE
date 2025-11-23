/**
 * Validation Request Detail Page
 * Review and approve/reject question sets
 */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { validationRequestsService } from "@/services/api";
import Button from "@/components/common/Button";

function ValidationRequestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    loadRequest();
  }, [id]);

  const loadRequest = async () => {
    try {
      setLoading(true);
      const data = await validationRequestsService.getById(id);
      setRequest(data);
    } catch (err) {
      console.error("Failed to load request", err);
      setError("Không thể tải thông tin yêu cầu");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn duyệt bộ câu hỏi này?")) return;

    try {
      setProcessing(true);
      await validationRequestsService.approve(id);
      alert("Đã duyệt thành công!");
      navigate("/expert/requests");
    } catch (err) {
      console.error("Approve failed", err);
      alert("Có lỗi xảy ra khi duyệt.");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert("Vui lòng nhập lý do từ chối.");
      return;
    }

    try {
      setProcessing(true);
      await validationRequestsService.reject(id, { rejectionReason: rejectReason });
      alert("Đã từ chối yêu cầu.");
      navigate("/expert/requests");
    } catch (err) {
      console.error("Reject failed", err);
      alert("Có lỗi xảy ra khi từ chối.");
    } finally {
      setProcessing(false);
      setShowRejectModal(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Đang tải...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!request) return <div className="p-8 text-center text-red-600">Không tìm thấy yêu cầu</div>;

  const isPending = request.status === "Pending";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    request.status === "Pending"
                      ? "bg-blue-100 text-blue-800"
                      : request.status === "Approved"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {request.status === "Pending"
                    ? "Chờ duyệt"
                    : request.status === "Approved"
                    ? "Đã duyệt"
                    : "Đã từ chối"}
                </span>
                <span className="text-gray-400 text-sm">#{request.id}</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{request.questionSetTitle}</h1>
              <p className="text-gray-500 mt-1">
                Người gửi:{" "}
                <span className="font-medium text-gray-900">{request.requesterName}</span> • Ngày
                gửi: {new Date(request.createdAt).toLocaleDateString("vi-VN")}
              </p>
            </div>

            {isPending && (
              <div className="flex gap-3">
                <Button
                  variant="danger"
                  onClick={() => setShowRejectModal(true)}
                  disabled={processing}
                >
                  Từ chối
                </Button>
                <Button variant="primary" onClick={handleApprove} disabled={processing}>
                  Duyệt bài
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Content Preview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-bold text-gray-900">Nội dung bộ câu hỏi</h2>
          </div>
          <div className="p-6">
            {/* Assuming request.questionSet contains the questions or we fetch them separately */}
            {/* For MVP, we display what's in the request object or fetch set details */}
            {request.questions && request.questions.length > 0 ? (
              <div className="space-y-6">
                {request.questions.map((q, idx) => (
                  <div
                    key={q.id || idx}
                    className="p-4 rounded-lg border border-gray-100 bg-gray-50"
                  >
                    <div className="flex gap-3">
                      <span className="font-bold text-gray-500">Câu {idx + 1}:</span>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-3">{q.questionText}</p>
                        <div className="space-y-2">
                          {q.options?.map((opt, i) => (
                            <div
                              key={i}
                              className={`flex items-center gap-2 ${
                                i === q.correctAnswerIndex
                                  ? "text-green-700 font-medium"
                                  : "text-gray-600"
                              }`}
                            >
                              <div
                                className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                                  i === q.correctAnswerIndex
                                    ? "border-green-600 bg-green-50"
                                    : "border-gray-400"
                                }`}
                              >
                                {String.fromCharCode(65 + i)}
                              </div>
                              <span>{opt}</span>
                              {i === q.correctAnswerIndex && <span>(Đáp án đúng)</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">Không có dữ liệu câu hỏi chi tiết.</p>
            )}
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Từ chối yêu cầu</h3>
            <p className="text-gray-600 mb-4">
              Vui lòng cho biết lý do từ chối để người dùng chỉnh sửa lại.
            </p>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-hidden mb-4"
              rows={4}
              placeholder="Nhập lý do từ chối..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
                Hủy
              </Button>
              <Button variant="danger" onClick={handleReject} loading={processing}>
                Xác nhận từ chối
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ValidationRequestDetailPage;
