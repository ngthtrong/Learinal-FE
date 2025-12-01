import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import subjectsService from "@/services/api/subjects.service";
import Button from "@/components/common/Button";
import { SubjectCard } from "@/components/subjects";
import { useToast } from "@/components/common";
import { getErrorMessage } from "@/utils/errorHandler";
import { Footer } from "@/components/layout";
import BookIcon from "@/components/icons/BookIcon";

function SubjectListPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("updatedAt");
  const [order, setOrder] = useState("desc");
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchSubjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sortBy, order]);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const data = await subjectsService.getSubjects({
        page,
        pageSize: 12,
        sortBy,
        order,
      });
      setSubjects(data.items || []);
      setTotalPages(data.meta?.totalPages || 1);
    } catch (err) {
      const message = getErrorMessage(err);
      toast.showError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubject = async (id) => {
    const subject = subjects.find((s) => s.id === id);
    if (!subject) return;

    if (!window.confirm(`Bạn có chắc chắn muốn xóa môn học "${subject.subjectName}"?`)) {
      return;
    }

    try {
      setDeleting(id);
      await subjectsService.deleteSubject(id);
      setSubjects(subjects.filter((s) => s.id !== id));
      toast.showSuccess("Xóa môn học thành công!");
    } catch (err) {
      const message = getErrorMessage(err);
      toast.showError(message);
    } finally {
      setDeleting(null);
    }
  };

  const handleEditSubject = (id) => {
    navigate(`/subjects/${id}/edit`);
  };

  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setOrder("desc");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:to-gray-900">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg px-4 sm:px-6 py-4 sm:py-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                  <BookIcon size={20} strokeWidth={2} className="sm:w-6 sm:h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100">
                  Môn học của tôi
                </h1>
              </div>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400">
                Quản lý tất cả môn học và tài liệu của bạn
              </p>
            </div>
            <Button onClick={() => navigate("/subjects/create")} className="w-full sm:w-auto">+ Tạo môn học mới</Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Sort & Filter Controls */}
        {subjects.length > 0 && !loading && (
          <div className="flex items-center justify-between mb-6 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sắp xếp:</span>
              <button
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  sortBy === "updatedAt"
                    ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
                onClick={() => handleSortChange("updatedAt")}
              >
                Mới cập nhật {sortBy === "updatedAt" && (order === "asc" ? "↑" : "↓")}
              </button>
              <button
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  sortBy === "subjectName"
                    ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
                onClick={() => handleSortChange("subjectName")}
              >
                Tên A-Z {sortBy === "subjectName" && (order === "asc" ? "↑" : "↓")}
              </button>
              <button
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  sortBy === "createdAt"
                    ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
                onClick={() => handleSortChange("createdAt")}
              >
                Mới tạo {sortBy === "createdAt" && (order === "asc" ? "↑" : "↓")}
              </button>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              {subjects.length} môn học
            </div>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm animate-pulse"
              >
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="space-y-2 mb-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && subjects.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900/30 rounded-3xl flex items-center justify-center mb-6">
              <BookIcon size={48} strokeWidth={2} className="text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Chưa có môn học nào
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6 max-w-md">
              Bắt đầu bằng cách tạo môn học đầu tiên của bạn để quản lý tài liệu và câu hỏi
            </p>
            <Button onClick={() => navigate("/subjects/create")}>+ Tạo môn học đầu tiên</Button>
          </div>
        )}

        {/* Subjects Grid */}
        {!loading && subjects.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((subject) => (
                <SubjectCard
                  key={subject.id}
                  subject={subject}
                  onDelete={handleDeleteSubject}
                  onEdit={handleEditSubject}
                  disabled={deleting === subject.id}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <Button variant="secondary" disabled={page === 1} onClick={() => setPage(page - 1)}>
                  ← Trang trước
                </Button>
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Trang {page}</span>
                  <span>/</span>
                  <span>{totalPages}</span>
                </div>
                <Button
                  variant="secondary"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Trang sau →
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default SubjectListPage;
