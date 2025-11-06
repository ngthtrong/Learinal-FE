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
import "./SubjectListPage.css";

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
    <div className="subject-list-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Môn học của tôi</h1>
          <br />
          <p className="header-subtitle"> Quản lý tất cả môn học và tài liệu của bạn</p>
        </div>
        <Button onClick={() => navigate("/subjects/create")}>+ Tạo môn học mới</Button>
      </div>

      {/* Sort & Filter Controls */}
      {subjects.length > 0 && !loading && (
        <div className="controls-bar">
          <div className="sort-controls">
            <span className="sort-label">Sắp xếp:</span>
            <button
              className={`sort-btn ${sortBy === "updatedAt" ? "active" : ""}`}
              onClick={() => handleSortChange("updatedAt")}
            >
              Mới cập nhật {sortBy === "updatedAt" && (order === "asc" ? "↑" : "↓")}
            </button>
            <button
              className={`sort-btn ${sortBy === "subjectName" ? "active" : ""}`}
              onClick={() => handleSortChange("subjectName")}
            >
              Tên A-Z {sortBy === "subjectName" && (order === "asc" ? "↑" : "↓")}
            </button>
            <button
              className={`sort-btn ${sortBy === "createdAt" ? "active" : ""}`}
              onClick={() => handleSortChange("createdAt")}
            >
              Mới tạo {sortBy === "createdAt" && (order === "asc" ? "↑" : "↓")}
            </button>
          </div>
          <div className="results-count">{subjects.length} môn học</div>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="subjects-grid">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="subject-card skeleton">
              <div className="skeleton-header"></div>
              <div className="skeleton-body">
                <div className="skeleton-line"></div>
                <div className="skeleton-line short"></div>
              </div>
              <div className="skeleton-footer"></div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && subjects.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h2>Chưa có môn học nào</h2>
          <p>Bắt đầu bằng cách tạo môn học đầu tiên của bạn để quản lý tài liệu và câu hỏi</p>
          <Button onClick={() => navigate("/subjects/create")}>+ Tạo môn học đầu tiên</Button>
        </div>
      )}

      {/* Subjects Grid */}
      {!loading && subjects.length > 0 && (
        <>
          <div className="subjects-grid">
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
            <div className="pagination">
              <Button variant="secondary" disabled={page === 1} onClick={() => setPage(page - 1)}>
                ← Trang trước
              </Button>
              <div className="page-info">
                <span className="current-page">Trang {page}</span>
                <span className="page-separator">/</span>
                <span className="total-pages">{totalPages}</span>
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
  );
}

export default SubjectListPage;
