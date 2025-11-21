/**
 * Subject List Page
 * Display available subjects with grid layout
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import subjectsService from "@/services/api/subjects.service";
import Button from "@/components/common/Button";
import { SubjectCard } from "@/components/subjects";
import { useToast } from "@/components/common";
import { getErrorMessage } from "@/utils/errorHandler";

function SubjectListPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("updatedAt");
  const [order, setOrder] = useState("desc");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 when search changes
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchSubjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sortBy, order, debouncedSearch]);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const data = await subjectsService.getSubjects({
        page,
        pageSize: 12,
        sortBy,
        order,
        search: debouncedSearch,
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
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Môn học của tôi</h1>
          <p className="text-gray-600">Quản lý tất cả môn học và tài liệu của bạn</p>
        </div>
        <Button onClick={() => navigate("/subjects/create")} className="shrink-0">
          + Tạo môn học mới
        </Button>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="w-full md:w-96 relative">
          <input
            type="text"
            placeholder="Tìm kiếm môn học..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Sắp xếp:</span>
          <button
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              sortBy === "updatedAt"
                ? "bg-primary-100 text-primary-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => handleSortChange("updatedAt")}
          >
            Mới cập nhật {sortBy === "updatedAt" && (order === "asc" ? "↑" : "↓")}
          </button>
          <button
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              sortBy === "subjectName"
                ? "bg-primary-100 text-primary-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => handleSortChange("subjectName")}
          >
            Tên A-Z {sortBy === "subjectName" && (order === "asc" ? "↑" : "↓")}
          </button>
          <button
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              sortBy === "createdAt"
                ? "bg-primary-100 text-primary-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => handleSortChange("createdAt")}
          >
            Mới tạo {sortBy === "createdAt" && (order === "asc" ? "↑" : "↓")}
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="bg-white rounded-xl p-6 shadow-sm animate-pulse border border-gray-100"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && subjects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-xl border border-dashed border-gray-300">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <span className="text-4xl">📚</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {search ? "Không tìm thấy môn học nào" : "Chưa có môn học nào"}
          </h2>
          <p className="text-gray-600 text-center mb-6 max-w-md">
            {search
              ? `Không có kết quả nào phù hợp với "${search}". Hãy thử từ khóa khác.`
              : "Bắt đầu bằng cách tạo môn học đầu tiên của bạn để quản lý tài liệu và câu hỏi"}
          </p>
          <Button onClick={() => (search ? setSearch("") : navigate("/subjects/create"))}>
            {search ? "Xóa bộ lọc" : "+ Tạo môn học đầu tiên"}
          </Button>
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
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="flex items-center gap-2"
              >
                ← Trang trước
              </Button>
              <div className="flex items-center gap-2 text-gray-700 font-medium bg-white px-4 py-2 rounded-lg border border-gray-200">
                <span>Trang {page}</span>
                <span className="text-gray-400">/</span>
                <span>{totalPages}</span>
              </div>
              <Button
                variant="outline"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="flex items-center gap-2"
              >
                Trang sau →
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default SubjectListPage;
