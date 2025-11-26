/**
 * Commission Info Component
 * Hiển thị thông tin về Hybrid Model commission cho Expert
 */
import { useState } from "react";
import CoinsIcon from "@/components/icons/CoinsIcon";
import DashboardIcon from "@/components/icons/DashboardIcon";

const CommissionInfoCard = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/10 rounded-xl p-6 border border-primary-200 dark:border-primary-700">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-primary-800 dark:text-primary-200 mb-2">
            💡 Cách tính hoa hồng
          </h3>
          <p className="text-sm text-primary-700 dark:text-primary-300">
            Hệ thống Hybrid Model = Fixed Rate + Revenue Bonus
          </p>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
        >
          {expanded ? "Thu gọn" : "Xem chi tiết"}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 space-y-4">
          {/* Fixed Rate */}
          <div className="flex items-start gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
            <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
              <CoinsIcon size={18} className="text-white" />
            </div>
            <div>
              <h4 className="font-medium text-blue-700 dark:text-blue-300">Fixed Rate</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Thu nhập cố định mỗi lần có người làm quiz:
              </p>
              <ul className="text-sm mt-2 space-y-1">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>Published:</strong> 300₫/lượt - Bạn tự tạo và publish bộ đề
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>Validated:</strong> 150₫/lượt - Bạn kiểm duyệt bộ đề của Learner
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Revenue Bonus */}
          <div className="flex items-start gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
            <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
              <DashboardIcon size={18} className="text-white" />
            </div>
            <div>
              <h4 className="font-medium text-amber-700 dark:text-amber-300">Revenue Bonus</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Thưởng thêm khi content đạt <strong>&gt;100 lượt/tháng</strong>:
              </p>
              <ul className="text-sm mt-2 space-y-1">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>Published:</strong> +5% doanh thu từ lượt vượt ngưỡng
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>Validated:</strong> +2% doanh thu từ lượt vượt ngưỡng
                  </span>
                </li>
              </ul>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 italic">
                * Bonus được tính vào đầu tháng sau cho tháng trước
              </p>
            </div>
          </div>

          {/* Example */}
          <div className="p-3 bg-gray-50 dark:bg-gray-800/80 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              📊 Ví dụ: Bạn có bộ đề Published với 250 lượt/tháng
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Fixed:</span>
                <span className="ml-2 text-blue-600 dark:text-blue-400 font-medium">
                  250 × 300₫ = 75,000₫
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Bonus:</span>
                <span className="ml-2 text-amber-600 dark:text-amber-400 font-medium">
                  (250-100) × 500₫ × 5% = 3,750₫
                </span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
              <span className="text-gray-600 dark:text-gray-400">Tổng thu nhập:</span>
              <span className="ml-2 text-emerald-600 dark:text-emerald-400 font-bold">
                78,750₫
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommissionInfoCard;
