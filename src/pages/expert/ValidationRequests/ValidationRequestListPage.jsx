/**
 * Validation Request List Page
 * List of requests assigned to expert
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { validationRequestsService } from "@/services/api";
import Button from "@/components/common/Button";

function ValidationRequestListPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("Pending"); // Pending, Completed

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
      setError("Không thể tải danh sách yêu cầu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Yêu cầu kiểm duyệt</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("Pending")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === "Pending"
                  ? "bg-primary-600 text-white shadow"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Chờ duyệt
            </button>
            <button
              onClick={() => setFilter("Completed")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === "Completed"
                  ? "bg-primary-600 text-white shadow"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Đã duyệt
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Đang tải...</div>
          ) : requests.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-3">📭</div>
              <h3 className="text-lg font-medium text-gray-900">Không có yêu cầu nào</h3>
              <p className="text-gray-500 mt-1">
                Hiện tại bạn không có yêu cầu kiểm duyệt nào ở trạng thái này.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="p-6 hover:bg-gray-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          req.status === "Pending"
                            ? "bg-blue-100 text-blue-800"
                            : req.status === "Approved"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {req.status === "Pending"
                          ? "Chờ duyệt"
                          : req.status === "Approved"
                          ? "Đã duyệt"
                          : "Đã từ chối"}
                      </span>
                      <span className="text-xs text-gray-500">ID: {req.id.slice(-6)}</span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      {req.questionSetTitle || "Bộ câu hỏi không tên"}
                    </h3>
                    <div className="text-sm text-gray-500 flex flex-wrap gap-x-4 gap-y-1">
                      <span>👤 {req.requesterName}</span>
                      <span>📅 {new Date(req.createdAt).toLocaleDateString("vi-VN")}</span>
                      <span>💰 {req.commissionAmount?.toLocaleString("vi-VN")}đ</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link to={`/expert/requests/${req.id}`}>
                      <Button variant={req.status === "Pending" ? "primary" : "outline"}>
                        {req.status === "Pending" ? "Kiểm duyệt ngay" : "Xem chi tiết"}
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
