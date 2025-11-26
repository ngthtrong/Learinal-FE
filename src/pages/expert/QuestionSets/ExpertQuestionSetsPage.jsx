/**
 * Expert Question Sets Page
 * Quản lý bộ đề của expert (tạo thủ công hoặc upload)
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/common";
import questionSetsService from "@/services/api/questionSets.service";
import { useToast } from "@/components/common";
import { formatDate } from "@/utils/formatters";

function ExpertQuestionSetsPage() {
  const [questionSets, setQuestionSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    fetchQuestionSets();
  }, []);

  const fetchQuestionSets = async () => {
    try {
      setLoading(true);
      const response = await questionSetsService.getMyQuestionSets();
      // Backend returns { items: [...], meta: {...} }
      const items = response?.items || response?.data?.items || [];
      setQuestionSets(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error("Failed to fetch question sets:", err);
      showError("Không thể tải danh sách bộ đề");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (setId, currentIsShared) => {
    try {
      await questionSetsService.toggleShare(setId, !currentIsShared);
      showSuccess(currentIsShared ? "Đã hủy chia sẻ" : "Đã chia sẻ bộ đề");
      fetchQuestionSets();
    } catch (err) {
      console.error("Failed to toggle share:", err);
      showError(err?.response?.data?.message || "Không thể thay đổi trạng thái chia sẻ");
    }
  };

  const handleDelete = async (setId, setTitle) => {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa bộ đề "${setTitle}"?\n\nHành động này không thể hoàn tác!`
    );
    
    if (!confirmed) return;

    try {
      await questionSetsService.deleteSet(setId);
      showSuccess("Đã xóa bộ đề thành công");
      fetchQuestionSets();
    } catch (err) {
      console.error("Failed to delete question set:", err);
      showError(err?.response?.data?.message || "Không thể xóa bộ đề");
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      Draft: { bg: "bg-slate-100 dark:bg-slate-900/30", text: "text-slate-700 dark:text-slate-300", label: "Bản nháp" },
      Public: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-300", label: "Công khai (Premium)" },
      Processing: { bg: "bg-sky-100 dark:bg-sky-900/30", text: "text-sky-700 dark:text-sky-300", label: "Đang xử lý" },
      PendingValidation: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-300", label: "Chờ kiểm duyệt" },
      Validated: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-300", label: "Đã xác thực" },
      Published: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-300", label: "Đã xuất bản" },
    };
    const badge = badges[status] || { bg: "bg-gray-100", text: "text-gray-700", label: status };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Bộ đề của tôi</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Tạo và quản lý bộ câu hỏi của bạn</p>
          </div>
          <Button
            variant="primary"
            onClick={() => navigate("/expert/question-sets/create-manual")}
          >
            <span className="inline-flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Tạo bộ đề mới
            </span>
          </Button>
        </div>

        {/* Question Sets List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block w-12 h-12 border-4 border-primary-200 dark:border-primary-800 border-t-primary-600 dark:border-t-primary-400 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Đang tải...</p>
            </div>
          ) : questionSets.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Chưa có bộ đề nào</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Tạo bộ đề đầu tiên của bạn ngay!</p>
              <Button onClick={() => navigate("/expert/question-sets/create-manual")}>
                Tạo bộ đề mới
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Tiêu đề
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Số câu hỏi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Ngày tạo
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {questionSets.map((set) => (
                    <tr key={set.id || set._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 dark:text-gray-100">{set.title}</div>
                        {set.description && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-md">
                            {set.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {set.questionCount || set.questions?.length || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(set.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(set.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="small"
                            variant="secondary"
                            onClick={() => navigate(`/expert/question-sets/${set.id || set._id}`)}
                          >
                            Xem
                          </Button>
                          <Button
                            size="small"
                            onClick={() => navigate(`/expert/question-sets/${set.id || set._id}/edit`)}
                          >
                            Chỉnh sửa
                          </Button>
                          <Button
                            size="small"
                            variant="danger"
                            onClick={() => handleDelete(set.id || set._id, set.title)}
                          >
                            Xóa
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExpertQuestionSetsPage;
