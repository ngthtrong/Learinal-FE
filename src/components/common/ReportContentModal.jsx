import { useState } from "react";
import Button from "./Button";
import { contentFlagsService } from "@/services/api";
import { useToast } from "./ToastContainer";
import { getErrorMessage } from "@/utils/errorHandler";

/**
 * Report Content Modal
 * Allows premium users to report issues with content
 */
const ReportContentModal = ({ isOpen, onClose, onSuccess, contentType, contentId, contentTitle }) => {
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [reason, setReason] = useState("Inaccurate");
  const [description, setDescription] = useState("");

  const reasons = [
    { value: "Inaccurate", label: "Nội dung sai lệch/không chính xác" },
    { value: "Inappropriate", label: "Nội dung không phù hợp" },
    { value: "Spam", label: "Spam/Nội dung rác" },
    { value: "Offensive", label: "Ngôn từ xúc phạm" },
    { value: "Copyright", label: "Vi phạm bản quyền" },
    { value: "Other", label: "Lý do khác" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!description.trim()) {
      toast.showError("Vui lòng mô tả chi tiết vấn đề");
      return;
    }

    try {
      setSubmitting(true);
      await contentFlagsService.createFlag({
        contentType,
        contentId,
        reason,
        description: description.trim(),
      });

      toast.showSuccess("Đã gửi báo cáo. Chúng tôi sẽ xem xét và phản hồi sớm nhất.");
      setDescription("");
      setReason("Inaccurate");
      
      if (onSuccess) {
        onSuccess();
      } else {
        onClose();
      }
    } catch (err) {
      const message = getErrorMessage(err);
      toast.showError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        ></div>

        {/* Center modal */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 px-6 pt-6 pb-4">
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
            </div>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="px-6 py-5">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2" id="modal-title">
                Báo cáo vấn đề
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Đang báo cáo: <strong className="text-gray-900 dark:text-gray-100">{contentTitle}</strong>
              </p>
            </div>

            {/* Reason Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Lý do báo cáo <span className="text-red-500">*</span>
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              >
                {reasons.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mô tả chi tiết <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Vui lòng mô tả cụ thể vấn đề bạn gặp phải (câu hỏi nào sai, sai như thế nào, v.v...)"
                rows={4}
                maxLength={500}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
                required
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
                {description.length}/500
              </p>
            </div>

            {/* Info box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div className="text-sm text-blue-800 dark:text-blue-300">
                  <p className="font-semibold mb-1">Quy trình xử lý:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Admin sẽ xem xét báo cáo của bạn</li>
                    <li>Nếu hợp lệ, yêu cầu sẽ được gửi đến Expert để sửa lỗi</li>
                    <li>Bạn sẽ nhận thông báo khi có cập nhật</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="submit"
                variant="primary"
                className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                disabled={submitting}
              >
                {submitting ? "Đang gửi..." : "Gửi báo cáo"}
              </Button>
              <Button
                type="button"
                onClick={onClose}
                variant="secondary"
                className="flex-1"
                disabled={submitting}
              >
                Hủy
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportContentModal;
