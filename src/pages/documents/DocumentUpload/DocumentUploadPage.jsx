/**
 * Document Upload Page
 * Upload and process new documents
 */

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import documentsService from "@/services/api/documents.service";
import subjectsService from "@/services/api/subjects.service";
import Button from "@/components/common/Button";
import "./DocumentUploadPage.css";

function DocumentUploadPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedSubjectId = searchParams.get("subjectId");

  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(preselectedSubjectId || "");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const data = await subjectsService.getSubjects({ pageSize: 100 });
      setSubjects(data.items || []);
    } catch (err) {
      setError("Không thể tải danh sách môn học");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [".pdf", ".docx", ".txt"];
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!allowedTypes.includes(ext)) {
      setError("Chỉ chấp nhận file .pdf, .docx, .txt");
      return;
    }

    // Validate file size (max 20MB)
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("Kích thước file tối đa là 20MB");
      return;
    }

    setSelectedFile(file);
    setError(null);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setError("Vui lòng chọn file");
      return;
    }

    if (!selectedSubject) {
      setError("Vui lòng chọn môn học");
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setUploadProgress(0);

      await documentsService.uploadDocument(
        selectedFile,
        selectedSubject,
        (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      );

      setSuccess(true);
      setSelectedFile(null);
      setUploadProgress(0);

      // Redirect to document list after 2 seconds
      setTimeout(() => {
        navigate(`/documents/list?subjectId=${selectedSubject}`);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tải lên tài liệu");
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.slice(fileName.lastIndexOf(".")).toLowerCase();
    const icons = {
      ".pdf": "📄",
      ".docx": "📝",
      ".txt": "📃",
    };
    return icons[ext] || "📎";
  };

  return (
    <div className="document-upload-page">
      <div className="upload-container">
        <div className="upload-header">
          <h1>Tải lên tài liệu</h1>
          <p className="upload-description">
            Tải lên tài liệu để hệ thống tự động trích xuất nội dung và tạo tóm tắt
          </p>
        </div>

        {success && (
          <div className="success-message">
            <div className="success-icon">✅</div>
            <h3>Tải lên thành công!</h3>
            <p>Tài liệu đang được xử lý. Đang chuyển hướng...</p>
          </div>
        )}

        {!success && (
          <form onSubmit={handleUpload} className="upload-form">
            {/* Subject Selection */}
            <div className="form-group">
              <label htmlFor="subject">
                Chọn môn học <span className="required">*</span>
              </label>
              <select
                id="subject"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                required
                disabled={uploading}
              >
                <option value="">-- Chọn môn học --</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.subjectName}
                  </option>
                ))}
              </select>
            </div>

            {/* File Upload */}
            <div className="form-group">
              <label htmlFor="file">
                Chọn file <span className="required">*</span>
              </label>
              <div className="file-input-wrapper">
                <input
                  type="file"
                  id="file"
                  onChange={handleFileChange}
                  accept=".pdf,.docx,.txt"
                  disabled={uploading}
                  className="file-input"
                />
                <label htmlFor="file" className="file-input-label">
                  <span className="file-icon">📁</span>
                  {selectedFile ? selectedFile.name : "Chọn file (.pdf, .docx, .txt)"}
                </label>
              </div>
              <p className="file-hint">Kích thước tối đa: 20MB</p>
            </div>

            {/* Selected File Preview */}
            {selectedFile && (
              <div className="file-preview">
                <div className="file-preview-icon">{getFileIcon(selectedFile.name)}</div>
                <div className="file-preview-info">
                  <p className="file-preview-name">{selectedFile.name}</p>
                  <p className="file-preview-size">{formatFileSize(selectedFile.size)}</p>
                </div>
                <button
                  type="button"
                  className="file-remove-btn"
                  onClick={() => setSelectedFile(null)}
                  disabled={uploading}
                >
                  ✕
                </button>
              </div>
            )}

            {/* Upload Progress */}
            {uploading && (
              <div className="upload-progress">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="progress-text">Đang tải lên... {uploadProgress}%</p>
              </div>
            )}

            {/* Error Message */}
            {error && <div className="error-message">{error}</div>}

            {/* Actions */}
            <div className="form-actions">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(-1)}
                disabled={uploading}
              >
                Hủy
              </Button>
              <Button type="submit" loading={uploading} disabled={!selectedFile || !selectedSubject}>
                {uploading ? "Đang tải lên..." : "Tải lên"}
              </Button>
            </div>
          </form>
        )}

        {/* Info Section */}
        <div className="upload-info">
          <h3>📌 Lưu ý</h3>
          <ul>
            <li>Chỉ chấp nhận file định dạng: PDF, DOCX, TXT</li>
            <li>Kích thước file tối đa: 20MB</li>
            <li>Hệ thống sẽ tự động trích xuất nội dung từ tài liệu</li>
            <li>Sau khi upload, tài liệu sẽ được xử lý và tạo tóm tắt tự động</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default DocumentUploadPage;
