/**
 * Subject List Page
 * Display available subjects
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import subjectsService from "@/services/api/subjects.service";
import Button from "@/components/common/Button";
import "./SubjectListPage.css";

function SubjectListPage() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSubject, setNewSubject] = useState({
    subjectName: "",
    description: "",
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, [page]);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await subjectsService.getSubjects({ page, pageSize: 12 });
      setSubjects(data.items || []);
      setTotalPages(data.meta?.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tải danh sách môn học");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    if (!newSubject.subjectName.trim()) {
      alert("Vui lòng nhập tên môn học");
      return;
    }

    try {
      setCreating(true);
      const created = await subjectsService.createSubject(newSubject);
      setSubjects([created, ...subjects]);
      setShowCreateModal(false);
      setNewSubject({ subjectName: "", description: "" });
    } catch (err) {
      alert(err.response?.data?.message || "Không thể tạo môn học");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteSubject = async (id, name) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa môn học "${name}"?`)) return;

    try {
      await subjectsService.deleteSubject(id);
      setSubjects(subjects.filter((s) => s.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Không thể xóa môn học");
    }
  };

  const handleViewDetail = (id) => {
    navigate(`/subjects/${id}`);
  };

  return (
    <div className="subject-list-page">
      <div className="page-header">
        <h1>Môn học của tôi</h1>
        <Button onClick={() => setShowCreateModal(true)}>+ Tạo môn học mới</Button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : subjects.length === 0 ? (
        <div className="empty-state">
          <p>Bạn chưa có môn học nào</p>
          <Button onClick={() => setShowCreateModal(true)}>Tạo môn học đầu tiên</Button>
        </div>
      ) : (
        <>
          <div className="subjects-grid">
            {subjects.map((subject) => (
              <div key={subject.id} className="subject-card">
                <div className="subject-card-header">
                  <h3>{subject.subjectName}</h3>
                </div>
                <div className="subject-card-body">
                  {subject.description && (
                    <p className="subject-description">{subject.description}</p>
                  )}
                  <div className="subject-meta">
                    <span className="subject-topics-count">
                      {subject.tableOfContents?.length || 0} chủ đề
                    </span>
                  </div>
                </div>
                <div className="subject-card-actions">
                  <Button variant="secondary" size="small" onClick={() => handleViewDetail(subject.id)}>
                    Chi tiết
                  </Button>
                  <Button
                    variant="danger"
                    size="small"
                    onClick={() => handleDeleteSubject(subject.id, subject.subjectName)}
                  >
                    Xóa
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <Button
                variant="secondary"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Trang trước
              </Button>
              <span className="page-info">
                Trang {page} / {totalPages}
              </span>
              <Button
                variant="secondary"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Trang sau
              </Button>
            </div>
          )}
        </>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Tạo môn học mới</h2>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleCreateSubject}>
              <div className="form-group">
                <label htmlFor="subjectName">
                  Tên môn học <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="subjectName"
                  value={newSubject.subjectName}
                  onChange={(e) =>
                    setNewSubject({ ...newSubject, subjectName: e.target.value })
                  }
                  placeholder="Ví dụ: Toán học, Vật lý..."
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Mô tả</label>
                <textarea
                  id="description"
                  value={newSubject.description}
                  onChange={(e) =>
                    setNewSubject({ ...newSubject, description: e.target.value })
                  }
                  placeholder="Mô tả về môn học này..."
                  rows="4"
                />
              </div>
              <div className="modal-actions">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowCreateModal(false)}
                  disabled={creating}
                >
                  Hủy
                </Button>
                <Button type="submit" loading={creating}>
                  Tạo môn học
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SubjectListPage;
