/**
 * Subject Detail Page
 * View subject details and related content
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import subjectsService from "@/services/api/subjects.service";
import Button from "@/components/common/Button";
import "./SubjectDetailPage.css";

function SubjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    subjectName: "",
    description: "",
    summary: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSubject();
  }, [id]);

  const fetchSubject = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await subjectsService.getSubjectById(id);
      setSubject(data);
      setEditData({
        subjectName: data.subjectName || "",
        description: data.description || "",
        summary: data.summary || "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tải thông tin môn học");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({
      subjectName: subject.subjectName || "",
      description: subject.description || "",
      summary: subject.summary || "",
    });
  };

  const handleSave = async () => {
    if (!editData.subjectName.trim()) {
      alert("Vui lòng nhập tên môn học");
      return;
    }

    try {
      setSaving(true);
      const updated = await subjectsService.updateSubject(id, editData);
      setSubject(updated);
      setIsEditing(false);
    } catch (err) {
      alert(err.response?.data?.message || "Không thể cập nhật môn học");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Bạn có chắc chắn muốn xóa môn học "${subject.subjectName}"?`)) return;

    try {
      await subjectsService.deleteSubject(id);
      navigate("/subjects");
    } catch (err) {
      alert(err.response?.data?.message || "Không thể xóa môn học");
    }
  };

  const renderTopicTree = (topics, level = 0) => {
    if (!topics || topics.length === 0) return null;

    return (
      <ul className={`topic-list level-${level}`}>
        {topics.map((topic, index) => (
          <li key={index} className="topic-item">
            <div className="topic-content">
              <span className="topic-id">{topic.topicId}</span>
              <span className="topic-name">{topic.topicName}</span>
            </div>
            {topic.childTopics && topic.childTopics.length > 0 && (
              <div className="topic-children">
                {renderTopicTree(topic.childTopics, level + 1)}
              </div>
            )}
          </li>
        ))}
      </ul>
    );
  };

  if (loading) {
    return (
      <div className="subject-detail-page">
        <div className="loading">Đang tải...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="subject-detail-page">
        <div className="error-message">{error}</div>
        <Button onClick={() => navigate("/subjects")}>Quay lại danh sách</Button>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="subject-detail-page">
        <div className="error-message">Không tìm thấy môn học</div>
        <Button onClick={() => navigate("/subjects")}>Quay lại danh sách</Button>
      </div>
    );
  }

  return (
    <div className="subject-detail-page">
      <div className="page-header">
        <Button variant="secondary" onClick={() => navigate("/subjects")}>
          ← Quay lại
        </Button>
        <div className="header-actions">
          {isEditing ? (
            <>
              <Button variant="secondary" onClick={handleCancelEdit} disabled={saving}>
                Hủy
              </Button>
              <Button onClick={handleSave} loading={saving}>
                Lưu thay đổi
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => navigate(`/documents/list?subjectId=${id}`)}>
                📚 Xem tài liệu
              </Button>
              <Button variant="secondary" onClick={handleEdit}>
                Chỉnh sửa
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                Xóa
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="subject-content">
        {isEditing ? (
          <div className="edit-form">
            <div className="form-group">
              <label htmlFor="subjectName">
                Tên môn học <span className="required">*</span>
              </label>
              <input
                type="text"
                id="subjectName"
                value={editData.subjectName}
                onChange={(e) =>
                  setEditData({ ...editData, subjectName: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Mô tả</label>
              <textarea
                id="description"
                value={editData.description}
                onChange={(e) =>
                  setEditData({ ...editData, description: e.target.value })
                }
                rows="4"
              />
            </div>

            <div className="form-group">
              <label htmlFor="summary">Tóm tắt</label>
              <textarea
                id="summary"
                value={editData.summary}
                onChange={(e) =>
                  setEditData({ ...editData, summary: e.target.value })
                }
                rows="6"
              />
            </div>
          </div>
        ) : (
          <>
            <div className="subject-header">
              <h1>{subject.subjectName}</h1>
              <div className="subject-meta">
                <span>Tạo: {new Date(subject.createdAt).toLocaleDateString("vi-VN")}</span>
                {subject.updatedAt !== subject.createdAt && (
                  <span>Cập nhật: {new Date(subject.updatedAt).toLocaleDateString("vi-VN")}</span>
                )}
              </div>
            </div>

            {subject.description && (
              <div className="subject-section">
                <h2>Mô tả</h2>
                <p>{subject.description}</p>
              </div>
            )}

            {subject.summary && (
              <div className="subject-section">
                <h2>Tóm tắt</h2>
                <div className="summary-content">{subject.summary}</div>
              </div>
            )}

            {subject.tableOfContents && subject.tableOfContents.length > 0 && (
              <div className="subject-section">
                <h2>Nội dung ({subject.tableOfContents.length} chủ đề)</h2>
                <div className="table-of-contents">
                  {renderTopicTree(subject.tableOfContents)}
                </div>
              </div>
            )}

            {(!subject.tableOfContents || subject.tableOfContents.length === 0) && (
              <div className="empty-topics">
                <p>Môn học này chưa có nội dung</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default SubjectDetailPage;
